import { createSlice } from '@reduxjs/toolkit';
import { gamesData } from '../../data/games';

const initialState = {
  all: gamesData,
  loading: false,
  error: null
};

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setGames: (state, action) => {
      state.all = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setGames, setLoading, setError } = gamesSlice.actions;
export default gamesSlice.reducer;
