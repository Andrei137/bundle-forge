import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchQuery: '',
  selectedCategories: [],
  selectedPlatforms: [],
  priceRange: [0, 100],
  sortBy: 'popular' // popular, price-low-high, price-high-low, newest, rating
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    toggleCategory: (state, action) => {
      const category = action.payload;
      const index = state.selectedCategories.indexOf(category);
      if (index > -1) {
        state.selectedCategories.splice(index, 1);
      } else {
        state.selectedCategories.push(category);
      }
    },
    togglePlatform: (state, action) => {
      const platform = action.payload;
      const index = state.selectedPlatforms.indexOf(platform);
      if (index > -1) {
        state.selectedPlatforms.splice(index, 1);
      } else {
        state.selectedPlatforms.push(platform);
      }
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.selectedCategories = [];
      state.selectedPlatforms = [];
      state.priceRange = [0, 100];
      state.sortBy = 'popular';
    }
  }
});

export const {
  setSearchQuery,
  toggleCategory,
  togglePlatform,
  setPriceRange,
  setSortBy,
  resetFilters
} = filtersSlice.actions;

export default filtersSlice.reducer;
