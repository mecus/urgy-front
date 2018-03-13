import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AccountService } from './account.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/merge';
import { Serverendpoints } from '../environment-var';

@Injectable()

export class PaymentService {
    host: string = Serverendpoints.host;
    api: string = Serverendpoints.api_v;
    url:string;
    cardUrl: string;
    transactionUrl: string;
    constructor(private _http:HttpClient){
       this.url = this.host+this.api+"gettoken";
       this.cardUrl = this.host+this.api+"payment/customer/";
       this.transactionUrl = this.host+"api_v1/transaction";
    }

    public getClientToken():Observable<any>{
        return this._http.get(this.url);
       
    }

    //Creating payment method
    public createPaymentMethod(payload, methd){
        
        let data = {...payload, "type": methd};
        let options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        }
        return this._http.post(this.host+this.api+"payment_method", data, options);     

        // .subscribe();
    }
    //fatching customer with payment method
    fetchCard(key){
        return this._http.get(this.cardUrl+key)
    }

    //Creating payment transaction
    paymentTransaction(payment){
        let options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        }
       return this._http.post(this.transactionUrl, payment, options);  
    }

    // Get Customer with the payment method
    getCustomerWithPaymentMethod(id){
        const options = {params: new HttpParams().set('id', id)};
        return this._http.get(this.host+this.api+"get_customer", options);
    }
}