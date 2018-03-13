import { Action, ActionReducer } from '@ngrx/store';
import { PUSH } from '../actions/ordersum.action';

interface Sum {
    total: string;
}


const init = {
    total: '2.50'
}
export function ordersumReducer<ActionReducer>(state:Sum = init, action){
    switch(action.type){
        case PUSH: 
            return action.payload;
        default:
            return state;
    }

}