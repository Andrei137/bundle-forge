import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
  savedTotal: 0,
  coupon: null,
  couponDiscount: 0,
};

// Same game can live in the cart as both a standalone row and one or more bundle
// rows, so identity needs (gameId, bundleId) — not gameId alone.
const makeCartKey = (item) =>
  item.bundleId != null ? `b-${item.bundleId}-${item.id}` : `g-${item.id}`;

const recalc = (state) => {
  state.total = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  state.savedTotal = state.items.reduce((sum, i) => {
    const savings = (i.originalPrice - i.price) * i.quantity;
    return sum + (savings > 0 ? savings : 0);
  }, 0);
  if (state.coupon) {
    state.couponDiscount = state.coupon.type === 'PERCENTAGE'
      ? state.total * state.coupon.value / 100
      : Math.min(state.coupon.value, state.total);
  } else {
    state.couponDiscount = 0;
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const cartKey = makeCartKey(item);
      const existingItem = state.items.find(i => i.cartKey === cartKey);
      if (existingItem) {
        if (item.bundleId != null) {
          existingItem.bundleName = item.bundleName;
          existingItem.platformPct = item.platformPct;
          existingItem.devPct = item.devPct;
          existingItem.price = item.price;
          existingItem.tierPrice = item.tierPrice;
          existingItem.unitAmount = item.unitAmount;
        } else {
          existingItem.quantity += 1;
        }
      } else {
        state.items.push({ ...item, cartKey, quantity: item.quantity ?? 1 });
      }
      recalc(state);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.cartKey !== action.payload);
      recalc(state);
    },
    updateQuantity: (state, action) => {
      const { cartKey, quantity } = action.payload;
      const item = state.items.find(i => i.cartKey === cartKey);
      if (item) item.quantity = quantity;
      recalc(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      state.couponDiscount = 0;
      recalc(state);
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload;
      recalc(state);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.couponDiscount = 0;
    },
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;
