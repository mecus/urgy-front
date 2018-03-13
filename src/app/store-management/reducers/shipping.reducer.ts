import { Action, ActionReducer } from '@ngrx/store';
import { iShip } from '../models/shipping.model';
import { PUSH } from '../actions/shipping';



const init = {
    option: 'Royal Mail 3-5 Working days',
    price: '2.50'
}
export function shippingReducer<ActionReducer>(state:iShip = init, action){

    switch(action.type){
        case PUSH: 
            return action.payload;
        default:
            return state;
    }

}