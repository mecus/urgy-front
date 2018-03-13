import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Cart } from '../store-management/models/cart.model';
import * as Rx from 'rxjs/Rx';
import * as fromRoot from '../store-management/reducers/reducers';
import { PUSH } from '../store-management/actions/ordersum.action';

@Component({
    selector: 'check-outlet',
    templateUrl: './check-outlet.component.html',
    styleUrls: ['./styles.scss']
})

export class CheckOutletComponent implements OnInit {
    basket;
    totalPrice;
    ship = 0.00;
    constructor(private store: Store<any>){
        this.basket = store.select('cart');
        store.pipe(select(fromRoot.selectFeatureShip)).subscribe((shp)=>{
            this.ship = Number(shp.price);
            // console.log(shp);
            store.dispatch({type: PUSH, payload: {total: (this.totalPrice + this.ship)}});
        });
        store.pipe(select('cart')).subscribe((cart: Cart[]) => {
            let total = cart.map(cart=>cart.qty * Number(cart.price));
            this.totalPrice = Number(total.reduce(this.reducePrice, 0).toFixed(2));
        //    console.log(this.totalPrice + this.ship)
           store.dispatch({type: PUSH, payload: {total: (this.totalPrice + this.ship)}});
        });
    }
    reducePrice(sum, num){
        return sum + num;  
    }

    ngOnInit(){
        Rx.Observable.timer(300).subscribe
        ((T) => {
            let main = document.getElementById('main-content');
            let sideC = document.getElementById('sidecart');
            let side = document.getElementById('inner-side');
            main.style.width = "70%";
            sideC.style.width = "30%";
            main.style.transition = "0.3s";
            sideC.style.transition = "0.3s";
            side.style.marginRight = "0px";
            side.style.transition = "0.4s";
        });   
    }
}