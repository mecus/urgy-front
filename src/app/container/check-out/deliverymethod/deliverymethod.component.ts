import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { trigger, state, style, stagger, transition, animate, keyframes, query } from '@angular/animations';
// import { TempOrderService } from "../../../services/temp-order.service";
import { AuthService } from "../../../authentications/authentication.service";
// import { TempOrderType } from "../../../models/tempOrder.model";
import { AccountService } from "../../../services/account.service";
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { PUSH } from '../../../store-management/actions/shipping';
// import { StorageService } from "../../../services/storage.service";
// import { ProgressService } from '../../../services/checkout-progress.service';

@Component({
  selector: 'delivery-method',
  templateUrl: 'delivery.component.html',
  styleUrls: ['delivery.component.scss']
})

export class DeliveryMethodComponent implements OnInit {
    currentUser;
    deliveryForm;
    errorMsg;
    addressForm:boolean = false;
    selectedOption;
    deliveryoptions = [
      {option: "Royal Mail 3-5 Working days", price: 2.50},
      {option: "Royal Mail 1-2 Working days", price: 3.50},
      {option: "Royal Mail Next day delivery", price: 4.90},
      {option: "Royal Mail Same days delivery", price: 5.90}
    ];
    constructor(private _fb:FormBuilder, private store: Store<any>,
    private authService:AuthService, private _router:Router, private accountService:AccountService,
    ){
      store.select('auth').subscribe((auth)=> {
        // this.currentUser = auth;
        if(auth.uid){
          authService.getUserAddresses(auth.uid).subscribe((addresses)=>{
            // console.log(addresses);
            let address = addresses.filter((ad: any) => { return ad.address_type == 'delivery'});
            if(!address.length){
              return this.currentUser = auth.address;
            }
            this.currentUser = _.last(address);
            console.log(address);
          });
        }
      });
      this.deliveryForm = _fb.group({
        displayName: [null, Validators.required],
        address: [null, Validators.required],
        city: null,
        post_code: [null, Validators.required],
        country: "United Kingdom"
      })
    }

  //Set billing address as delivery address
  @HostListener('change', ['$event']) selectOption(e){
    // console.log(e.value);
    this.selectedOption = e.value;
    this.store.dispatch({type: PUSH, payload: {...e.value}});
  }
  //After every condition is met then go to order page
  goToOrder(){
    let delivery = this.selectedOption || {option: "Royal Mail 5-10 Working days", price: 2.50};
    console.log(delivery);
    this._router.navigate(["/check/order_review"]);
   
  }

  //Saving temp order address to firebase
  deliveryAddress(address){
    if(this.deliveryForm.status == 'INVALID'){
      return this.errorMsg = "Please fill in all required feild";
    }
    let addr = {
        address_type: 'delivery',
        displayName: address.displayName,
        address: address.address,
        city: address.city,
        post_code: address.post_code,
        country: address.country,
        uid: this.currentUser.uid
    }
    this.authService.saveUserAddresses(addr).then(res => {
      this.addAddress();
    })
    .catch(err => console.log(err));
    
  }

  addAddress(){
    if(!this.addressForm){
      this.addressForm = true;
      // window.scrollTo(0, 0);
    }else{
      this.addressForm = false;
      // window.scrollTo(0, 0);
    }

  }
  // addressFound(event){
  //   this.address = event.addresPick;
  //   this.postCode = event.postCode;
  //   this.deliveryForm.patchValue({
  //     address: event.addresPick,
  //     post_code: event.postCode
  //   })
  // }
  //Retrieve temp order from firebase
  // getDeliveryAddress(){
  //     this.tempOrderService.getTempOrder(this.currentUser.uid).subscribe((address)=>{
  //       if(address){
  //         // console.log(address['delivery_option']);
  //         this.selectAddress = address['delivery_address'];
  //         this.addressForm = true; //address['delivery_address'];
  //         if(address['delivery_address'] && address['delivery_option']){
  //           this.certify = true;
  //         }else{ this.certify = false; }
  //         if(address['delivery_address'].address){
  //           this.selectAddressNotice = false;
  //           this.trueAddress = true;
  //           this.deliveryForm.patchValue({
  //             full_name: address['delivery_address'].full_name,
  //             address: address['delivery_address'].address,
  //             address2: address['delivery_address'].address2,
  //             city: address['delivery_address'].city,
  //             post_code: address['delivery_address'].post_code,
  //             country: address['delivery_address'].country
  //           })
  //         }else{
  //           // this.selectAddressNotice = false;
  //           // alert("You can now load address from the server");
  //         }

  //       }
  //     })
  // }
  //Checking for existence on delivery addresses
  // checkForExistingAddress(){
  //   this.accountService.getAccount(this.storeService.retriveData('email'))
  //     .subscribe((account)=>{
  //       this.accountService.getAddress(account._id).subscribe((addresses)=>{
  //         this.selectAddress =_.last(_.filter(addresses, {"address_type":"delivery"}));
  //         this.billingAddresses = _.last(_.filter(addresses, {"address_type":"billing"}));
  //         if(!this.selectAddress){
  //           this.selectAddressNotice = true;
  //           console.log("No Old address found");
  //           // this.getDeliveryAddress();
            
  //         }
  //         if(this.selectAddress){
  //           this.addressForm = true;
  //           this.trueAddress = true;
  //           this.notify = true;
  //           this.deliveryForm.patchValue({
  //             full_name: this.selectAddress.full_name,
  //             address: this.selectAddress.address,
  //             address2: this.selectAddress.address2,
  //             city: this.selectAddress.city,
  //             post_code: this.selectAddress.post_code,
  //             country: this.selectAddress.country
  //           })
  //         }
  //       })
  //     });
  // }
  ngOnInit(){
      // this.store.select('auth').subscribe((auth)=>{
      //   if(auth.uid){
      //     console.log(auth);
      //   }  
      // });
      // this.authService.authState().subscribe((user)=>{
      //   if(user){
      //     this.currentUser = user;
         
      //   }else{
      //     console.log("No user logged in");
      //     this._router.navigate(["/login"]);
      //   }
      // });
     

  }

}