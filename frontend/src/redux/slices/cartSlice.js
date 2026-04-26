import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
  savedTotal: 0
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find(i => i.id === item.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }

      state.total = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      state.savedTotal = state.items.reduce((sum, i) => {
        const savings = (i.originalPrice - i.price) * i.quantity;
        return sum + savings;
      }, 0);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      state.savedTotal = state.items.reduce((sum, i) => {
        const savings = (i.originalPrice - i.price) * i.quantity;
        return sum + savings;
      }, 0);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) {
        item.quantity = quantity;
      }
      state.total = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      state.savedTotal = state.items.reduce((sum, i) => {
        const savings = (i.originalPrice - i.price) * i.quantity;
        return sum + savings;
      }, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.savedTotal = 0;
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
