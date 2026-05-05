import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from './slices/gamesSlice';
import cartReducer from './slices/cartSlice';
import filtersReducer from './slices/filtersSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    games: gamesReducer,
    cart: cartReducer,
    filters: filtersReducer,
    ui: uiReducer,
    auth: authReducer,
  }
});

export default store;
