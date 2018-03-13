import { Injectable } from '@angular/core';
import { WindowService } from "./window.service";
import { Store } from '@ngrx/store';
import * as shopActions from '../store-management/actions/shop.action';


@Injectable()


export class ClearHeighlightMenu {
    document;
    constructor(
        private windowRef:WindowService,
        private store: Store<any>){
        this.document = this.windowRef.getDocumentRef();
    }

    clearMenu(){
        let i;
        let tab = this.document.getElementsByClassName('nav-link');
        for (i = 0; i < tab.length; i++) {
            // tab[i].className = tab[i].className.replace("active", "");
            tab[i].style.backgroundColor = "transparent";
            tab[i].style.color = "#ffffff";
            
        }
        // this.store.dispatch({type: shopActions.DEPARTMENT, payload: {id: null, name: null}});
    }
}