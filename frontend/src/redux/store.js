import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from './slices/gamesSlice';
import cartReducer from './slices/cartSlice';
import filtersReducer from './slices/filtersSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

const loadCart = () => {
  try {
    const raw = localStorage.getItem('bf_cart');
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

const saveCart = (state) => {
  try {
    localStorage.setItem('bf_cart', JSON.stringify(state.cart));
  } catch {}
};

export const store = configureStore({
  reducer: {
    games: gamesReducer,
    cart: cartReducer,
    filters: filtersReducer,
    ui: uiReducer,
    auth: authReducer,
  },
  preloadedState: { cart: loadCart() },
});

store.subscribe(() => saveCart(store.getState()));

export default store;
