import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AccountService } from "../../../services/account.service";
import { StorageService } from "../../../services/storage.service";
import { PaymentService } from "../../../services/payment.service";
import { AuthService } from "../../../authentications/authentication.service";
import { Router } from "@angular/router";
import { CartService } from "../../../services/cart.service";
import { OrderService } from "../../../services/order.service";
import { WindowService } from "../../../services/window.service";
import * as _ from 'lodash';
import { ProgressService } from '../../../services/checkout-progress.service';
import { Store, select } from '@ngrx/store';
import * as Rx from 'rxjs/Rx';
import * as fromRoot from '../../../store-management/reducers/reducers';

@Component({
  selector: 'app-order',
  templateUrl: 'order.component.html',
  styleUrls: ['order.component.scss']
})
export class OrderComponent implements OnInit {
  total = 0.00;
  ordForm;
  document;
  grayPage;
  currentUser;
  existingOrder;
  acNo;
  errMsg;
  // saveProg = new Array();
  constructor(private accountService:AccountService, private authService:AuthService, 
    private storeService:StorageService, private _fb:FormBuilder, private _router:Router,
    private paymentService:PaymentService, private windowService:WindowService, private cartService:CartService,
    private store: Store<any>,
    private orderService:OrderService, 
    private progressService:ProgressService) { 
      this.document = this.windowService.getDocumentRef();
      this.orderForm();
      store.pipe(select(fromRoot.selectFeatureSum)).subscribe((sum)=>{
        this.total = Number(sum.total);
        this.ordForm.patchValue({
          amount: Number(sum.total)
        });
        // console.log(shp);
      });
      store.pipe(select(fromRoot.selectFeatureShip)).subscribe((ship)=>{
        if(ship){
          this.ordForm.patchValue({
            delivery_method: ship.option
          });
          // console.log(ship);
        }
       
      });
      store.select('auth').subscribe((auth)=> {

        // Set user data including address
        if(auth.uid){
          this.acNo = auth.account_no;
          this.getExistingOrder(auth.account_no);
          authService.getUserAddresses(auth.uid).subscribe((addresses)=>{
            // console.log(addresses);
            let address = addresses.filter((ad: any) => { return ad.address_type == 'delivery'});
            if(!address.length){
              // Patching Form Items
              this.patchOrderForm(auth, auth.address);
              return this.currentUser = auth.address;

            }
            // Patching Form Items
            this.patchOrderForm(auth, _.last(address));
            this.currentUser = _.last(address);
            // console.log(address);
          });

        }
      });
      store.select('cart').subscribe((cart)=>{
        // console.log(cart);
        this.ordForm.patchValue({
          items: cart
        });
      });
    }
    orderForm(){
      this.ordForm = this._fb.group({
        order_no: null,
        customer_name: null,
        customer_no: null,
        uid: null,
        amount: null,
        note: null,
        email: null,
        telephone:null,
        delivery_method: null,
        status: null,
        ip_address: null,
        delivery_address: null,
        createdAt: null,
        updatedAt: null,
        items: []
      })
    }
    patchOrderForm(user, addres?){
      this.ordForm.patchValue({
        customer_name: user.displayName,
        email: user.email,
        uid: user.uid,
        customer_no: user.account_no,
        telephone: user.phone,
        delivery_address: {
          name: addres.displayName,
          address: addres.address,
          city: addres.city,
          post_code: addres.post_code,
          country: "United Kingdom"
        },
        status: "pending"
      })
    }


  //Craeting Customer Order here
  createOrder(order){
    // this._router.navigate(["/check/payment"]);
    //Checking for existing order status
    if(this.existingOrder && this.existingOrder.status == 'pending'){
      alert('Please complete or cancel pending order to continue!!');
      return;
    }
    this.grayPage = true;

    //Generate Order number
    let order_no = order.customer_no * 100 + Math.floor((Math.random() * 10) + 1);
    let nowDate = Date.now().toString().slice(8);//5 digit
    let cm_no = order_no.toString().slice(5);//7 digit
    order.order_no = 9+nowDate+cm_no;
    order.createdAt = Date.now();
    order.updatedAt = Date.now();
    // console.log(order);
    this.orderService.postOrder(order).subscribe((res: any)=>{
      console.log(res);
      if(res.status == "Order Failed"){
        this.grayPage = false;
        return this.errMsg = "Sorry! Your order failed to create, try again later.";
      }
      this.grayPage = false;
      this._router.navigate(["/check/payment"]);
    });
  
  }

  getExistingOrder(account_no){
    this.orderService.getCustomerOrders(account_no).subscribe((orders:any)=>{
      this.existingOrder = orders.orders[0];
      console.log(this.existingOrder);
    });
  }
  deletePendingOrder(){
    let id = this.existingOrder.id;
    let confarm = confirm("Are you sure?");
    if(!confarm){
      return null;
    }
    this.orderService.deleteOrder(id)
    .subscribe((res)=>{
      console.log(res);
      this.getExistingOrder(this.acNo);
    });
  }
  completePendingOrder(val: string){
    const option = {
      id: this.existingOrder.id,
      order: {
        status: val
      }
    }
    this.orderService.updateOrder(option)
    .subscribe((res)=>{
      console.log(res);
    });
  }
  ngOnInit() {
   
  }
}
