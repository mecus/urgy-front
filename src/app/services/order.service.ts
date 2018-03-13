import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { HttpClient, HttpRequest, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/share';
import { Serverendpoints } from '../environment-var';

@Injectable()

export class OrderService {
    host: string = Serverendpoints.host;
    api_v1: string = Serverendpoints.api_v;
    itemUrl: string = "items/";
    url;
    options;
    constructor(private _http: HttpClient){
        this.url = this.host+this.api_v1;

        this.options = {
            headers: new HttpHeaders({
                "Content-Type": "application/json"
            })
        }
    }
    getCustomerOrders(customer_no){
        let options = {params: new HttpParams().set('qy', customer_no)};
        return this._http.get(this.url+"customer_orders", options);
    }

    postOrder(order){
        return this._http.post(this.url+"orders", order, this.options);
        // .subscribe();
    }

    updateOrder(update){
        return this._http.post(this.host+this.api_v1+"update_order", update, this.options);
    }

    deleteOrder(id){
        let options = {params: new HttpParams().set('id', id)};
        return this._http.delete(this.host+this.api_v1+"delete_order", options);
    }

    // Function Deprecated
    createOrderItems(item){
       return this._http.post(this.url+this.itemUrl, item, this.options)
        .map((data)=>{
            return data;
        },(err)=>console.log(err));
        // .subscribe();
    }

}