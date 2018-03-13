import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from "../../../authentications/authentication.service";
import { TempOrderService } from "../../../services/temp-order.service";
import { OrderService } from "../../../services/order.service";
import { AccountService } from '../../../services/account.service';
import { StorageService } from '../../../services/storage.service';
import { PaymentService } from "../../../services/payment.service";
import { WindowService } from "../../../services/window.service";
import { CartService } from "../../../services/cart.service";
import * as _ from 'lodash';
import { ProgressService } from '../../../services/checkout-progress.service';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-payment',
  templateUrl: 'payment.component.html',
  styleUrls: ['payment.component.scss']
})
export class PaymentComponent implements OnInit, AfterViewInit {
  order;
  document;
  grayPage;
  declineMsg;
  acceptedMsg;
  processMsg:string;
  status:string = "unknown";
  customerOrder;
  constructor(private orderService:OrderService, 
    private accountService:AccountService, private authService:AuthService,
    private storeService:StorageService, private paymentService:PaymentService,
    private windowService:WindowService, 
 
    private store: Store<any>) { 
      this.document = windowService.getDocumentRef();
     
      store.select('auth').subscribe((auth)=>{
        orderService.getCustomerOrders(auth.account_no).subscribe((orders:any)=>{
          let ord = orders.orders[0];
          this.customerOrder = orders.orders[0];
          this.order = {
            payment : {
              paymentMethodToken: storeService.retriveData('payToken'),
              amount: ord.amount,
              orderId: ord.order_no,
              deviceData: storeService.retriveData('deviceData') || null,
              options: {
                  submitForSettlement: true
              }
            }
          };
          console.log(this.order);
        });
          
      });
  }
  createTransaction(){
    this.grayPage = true;
    let payment = this.order;
    this.paymentService.paymentTransaction(payment)
    .subscribe((res)=> {
      console.log(res);
      this.grayPage = false;

      let update = {
        id: this.customerOrder.id,
        order: {
          updatedAt: Date.now(),
          status: 'completed'
        }
      }
      this.orderService.updateOrder(update)
      .subscribe((res)=>{
        console.log(res)
      })
    });

  }
  // runPaymentOrder(payobject){
  //   let final = {name: "finish"};
  //   this.paymentService.paymentTransaction(payobject)
  //   .subscribe((response: any)=>{
  //     if(response.success == 'true' || response.success == true){
  //        //Do cleanup here
  //       // this.cleanUp();
  //       // this.progressService.setProgress(final);
  //       let result = this.document.querySelector('.payment-completed');
  //       let container = this.document.querySelector('.main-container');
  //       this.windowService.getWindowObject().setTimeout(()=>{
  //         this.grayPage = false;
  //         result.style.display = "block";
  //         container.style.display = "none";
  //         this.status = response.payment_status;
  //         this.acceptedMsg = "Thanks for completing your order, payment has been taken from your account."
  //       }, 3000)
  //       console.log(response);
  //     }else if(response.success == 'false' || response.success == false){
  //       let result = this.document.querySelector('.payment-completed');
  //       let container = this.document.querySelector('.main-container');
  //       this.windowService.getWindowObject().setTimeout(()=>{
  //         this.grayPage = false;
  //         result.style.display = "block";
  //         container.style.display = "none";
  //         this.processMsg = response.message || null;
  //         this.status = response.payment_status;
  //         this.declineMsg = "Your payment was delined.. please try again possibly with a different payment method";
          
  //       }, 3000)

  //     }else{
  //       return null; //do something here
  //     }
     
  //   });
  //   return false;
  // }

  ngOnInit() {

  }
  ngAfterViewInit(){
   
  }

}
