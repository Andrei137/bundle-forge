import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartOpen: false,
  gameDetailsModalOpen: false,
  selectedGameForDetails: null,
  mobileMenuOpen: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
    },
    openCart: (state) => {
      state.cartOpen = true;
    },
    closeCart: (state) => {
      state.cartOpen = false;
    },
    openGameDetails: (state, action) => {
      state.gameDetailsModalOpen = true;
      state.selectedGameForDetails = action.payload;
    },
    closeGameDetails: (state) => {
      state.gameDetailsModalOpen = false;
      state.selectedGameForDetails = null;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false;
    }
  }
});

export const {
  toggleCart,
  openCart,
  closeCart,
  openGameDetails,
  closeGameDetails,
  toggleMobileMenu,
  closeMobileMenu
} = uiSlice.actions;

export default uiSlice.reducer;
