import { createSelector, createFeatureSelector } from '@ngrx/store';
import { iShip } from '../models/shipping.model';
import { Sum } from '../models/sum.model';

export interface FeatureState {
  sum: Sum,
  ship: iShip
}

export interface AppState {
  check: FeatureState
}

export const selectFeature = createFeatureSelector<FeatureState>('check');
export const selectFeatureSum = createSelector(selectFeature, (state: FeatureState) => state.sum);
export const selectFeatureShip = createSelector(selectFeature, (state: FeatureState) => state.ship);