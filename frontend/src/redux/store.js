import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from './slices/gamesSlice';
import cartReducer from './slices/cartSlice';
import filtersReducer from './slices/filtersSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    games: gamesReducer,
    cart: cartReducer,
    filters: filtersReducer,
    ui: uiReducer
  }
});

export default store;
