import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import { StorageService } from '../../../services/storage.service';
import { Observable } from 'rxjs/Observable';
import { PaymentService } from "../../../services/payment.service";
import { WindowService } from "../../../services/window.service";
import { AuthService } from "../../../authentications/authentication.service";

import { OrderService } from "../../../services/order.service";
import { CartService } from "../../../services/cart.service";
// import { TempOrderType } from "../../../models/tempOrder.model";
import * as _ from 'lodash';
import { ProgressService } from '../../../services/checkout-progress.service';
import { Store } from '@ngrx/store';



@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss', './card.scss']
})
export class PaymentMethodComponent implements OnInit, OnDestroy{
  document;
  paymentMethod;
  paymentAdded;
  notice:string;
  customer;
  paypal; card;

  constructor(private accountService:AccountService, private authService:AuthService, 
    private storeService:StorageService, private _fb:FormBuilder, private _router:Router,
    private paymentService:PaymentService, private windowService:WindowService, private cartService:CartService,
    private orderService:OrderService, private store: Store<any>) {

      this.document = this.windowService.getDocumentRef();

      store.select('auth').subscribe((auth)=>{
        if(auth.uid){
          this.customer = {
            uid: auth.uid,
            method :{
              customerId: auth.account_no,
              paymentMethodNonce: null,
              options: {
                makeDefault: true
              },
              billingAddress: {
                streetAddress: auth.address.address,
                locality: auth.address.city,
                postalCode: auth.address.post_code,
                countryName: auth.address.country
              }
            }
          }
          this.paymentService.getCustomerWithPaymentMethod(auth.account_no)
          .subscribe((cus: any)=> {
            console.log(cus);
            this.paypal = cus.paypal;
            this.card = cus.card;
          });
      }
      });
      
  }
  // Push Token to the store or local storage
  paymentToken(token){
    console.log(token);
    let confarm = confirm('Click OK if you are happy to use your selection');
    if(!confarm){
      return null;
    }
    this.storeService.storeData('payToken', token);
    this._router.navigate(["/check/delivery_method"]);
  }

  ngOnInit() {
    this.braintreeCardForm();
    this.braintreePaypal();
    
    
  }
  ngOnDestroy(){
 
  }

  // Card Payment Method function
  braintreeCardForm = () =>{
    var form = document.querySelector('#my-sample-form');
    var submit = document.querySelector('input[type="submit"]');

    braintree.client.create({
      authorization: this.storeService.retriveData('token')
    }, (err, clientInstance)=> {
      if (err) {
        console.error(err);
        return;
      }

      // Create input fields and add text styles  
      braintree.hostedFields.create({
        client: clientInstance,
        styles: {
          'input': {
            'color': '#282c37',
            'font-size': '16px',
            'transition': 'color 0.1s',
            'line-height': '3'
          },
          // Style the text of an invalid input
          'input.invalid': {
            'color': '#E53A40'
          },
          // placeholder styles need to be individually adjusted
          '::-webkit-input-placeholder': {
            'color': 'rgba(0,0,0,0.6)'
          },
          ':-moz-placeholder': {
            'color': 'rgba(0,0,0,0.6)'
          },
          '::-moz-placeholder': {
            'color': 'rgba(0,0,0,0.6)'
          },
          ':-ms-input-placeholder': {
            'color': 'rgba(0,0,0,0.6)'
          }

        },
        // Add information for individual fields
        fields: {
          number: {
            selector: '#card-number',
            placeholder: '1111 1111 1111 1111'
          },
          cvv: {
            selector: '#cvv',
            placeholder: '123'
          },
          expirationDate: {
            selector: '#expiration-date',
            placeholder: '10 / 2019'
          }
        }
      }, (err, hostedFieldsInstance)=> {
        if (err) {
          console.error(err);
          return;
        }

        hostedFieldsInstance.on('validityChange', (event)=> {
          // Check if all fields are valid, then show submit button
          let formValid = Object.keys(event.fields).every( (key)=> {
            return event.fields[key].isValid;
          });

          if (formValid) {
            $('#button-pay').addClass('show-button');
          } else {
            $('#button-pay').removeClass('show-button');
          }
        });

        hostedFieldsInstance.on('empty', (event)=> {
          $('header').removeClass('header-slide');
          $('#card-image').removeClass();
          $(form).removeClass();
        });

        hostedFieldsInstance.on('cardTypeChange', (event)=> {
          // Change card bg depending on card type
          if (event.cards.length === 1) {
            $(form).removeClass().addClass(event.cards[0].type);
            $('#card-image').removeClass().addClass(event.cards[0].type);
            $('header').addClass('header-slide');
            
            // Change the CVV length for AmericanExpress cards
            if (event.cards[0].code.size === 4) {
              hostedFieldsInstance.setAttribute({
                field: 'cvv',
                attribute: 'placeholder',
                value: '1234'
              });
            } 
          } else {
            hostedFieldsInstance.setAttribute({
              field: 'cvv',
              attribute: 'placeholder',
              value: '123'
            });
          }
        });

        submit.addEventListener('click', (event)=> {
          event.preventDefault();

          hostedFieldsInstance.tokenize( (err, payload)=> {
            if (err) {
              console.error(err);
              return;
            }

            // This is where you would submit payload.nonce to your server
            // alert('Submit your nonce to your server here!');
            const methods = this.customer;
            methods.method.paymentMethodNonce = payload.nonce;
            this.paymentService.createPaymentMethod(methods, "card")
              .subscribe((res: any)=>{
                // this.returnResult.emit(res);
                // update ui for the user info
                const token = res.result.paymentMethod.token;
                this.paymentToken(token);
                console.log(res);
              });
          });
        }, false);
      });
    });
  }

  // Initialize Paypal Button
  braintreePaypal = ()=> {
  
    braintree.client.create({
      authorization: this.storeService.retriveData('token')
    },(clientErr, clientInstance)=> {
      // Stop if there was a problem creating the client.
      // This could happen if there is a network error or if the authorization
      // is invalid.
      if (clientErr) {
        console.error('Error creating client:', clientErr);
        return;
      }

      braintree.dataCollector.create({
        client: clientInstance,
        paypal: true
      }, (err, dataCollectorInstance)=> {
        if (err) {
          // Handle error
          console.log(err);
          return;
        }
        // At this point, you should access the dataCollectorInstance.deviceData value and provide it
        // to your server, e.g. by injecting it into your form as a hidden input.
        var myDeviceData = dataCollectorInstance.deviceData;
        // console.log(dataCollectorInstance);
        
        this.storeService.storeData('deviceData', myDeviceData);
        //dataCollectorInstance.teardown();
      });

    
      // Create a PayPal Checkout component.
      braintree.paypalCheckout.create({
          client: clientInstance
        }, (paypalCheckoutErr, paypalCheckoutInstance)=> {
      
        // Stop if there was a problem creating PayPal Checkout.
        // This could happen if there was a network error or if it's incorrectly
        // configured.
        if (paypalCheckoutErr) {
          console.error('Error creating PayPal Checkout:', paypalCheckoutErr);
          return;
        }
    
        // Set up PayPal with the checkout.js library
        paypal.Button.render({
          env: 'sandbox', // or 'production'
    
          payment: ()=> {
            return paypalCheckoutInstance.createPayment({
              flow: 'vault',
              billingAgreementDescription: 'You have agreed to provide your details for this payment',
              enableShippingAddress: false,
              // shippingAddressEditable: false,
              // shippingAddressOverride: {
              //   recipientName: 'Scruff McGruff',
              //   line1: '1234 Main St.',
              //   line2: 'Unit 1',
              //   city: 'Chicago',
              //   countryCode: 'US',
              //   postalCode: '60652',
              //   state: 'IL',
              //   phone: '123.456.7890'
              // }
            });
          },
    
          onAuthorize: (data, actions)=> {
            return paypalCheckoutInstance.tokenizePayment(data)
              .then((payload)=> {
                // Submit `payload.nonce` to your server.
                // console.log(payload);
                const methods = {
                  uid: this.customer.uid,
                  method: {
                    customerId: this.customer.method.customerId,
                    paymentMethodNonce: payload.nonce,
                  }
                }
                this.paymentService.createPaymentMethod(methods, "paypal")
                  .subscribe((res: any)=>{
                    const token = res.result.paymentMethod.token;
                    this.paymentToken(token);
                    console.log(res);
                    // this.returnResult.emit(res);
                  });
              });
          },
    
          onCancel: (data)=> {
            console.log('checkout.js payment cancelled');
          },
    
          onError: (err)=> {
            console.error('checkout.js error', err);
          }
        }, '#paypal-button').then( ()=> {
          // The PayPal button will be rendered in an html element with the id
          // `paypal-button`. This function will be called when the PayPal button
          // is set up and ready to be used.
          // console.log("Paypal Process Completed");
        });
    
      });
    
    });
  }

}





   // this.authService.authState().subscribe((user)=>{
    //   if(!user){return null;}
    //   this.userId = user.uid;
    //   this.user = user;
    //   // this.checkForCardPresent(user.email);
    // })

    // Configuring stripe payment 
    // let handler = StripeCheckout.configure({
    //   key: 'pk_test_2RQBrMXjq6S2ngT9yp0jR0dx',
    //   image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
    //   locale: 'auto',
    //   token: function(token) {
    //     console.log(token);
    //     // You can access the token ID with `token.id`.
    //     // Get the token ID to your server-side code for use.
    //   }
    // });
    // this.document.getElementById('payButton').addEventListener('click', function(e) {
    //   // Open Checkout with further options:
    //   handler.open({
    //     name: 'uRGy Shop',
    //     description: 'Shopping payments',
    //     currency: 'gbp',
    //     // amount: 20000
    //   });
    //   e.preventDefault();
    // });
    // // Close Checkout on page navigation:
    // window.addEventListener('popstate', function() {
    //   handler.close();
    // });
