import { createSlice } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

const initialState = {
  token: authService.getToken(),
  user: null,
  userType: null,
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, user, userType } = action.payload;
      state.token = token;
      state.user = user;
      state.userType = userType;
      state.isAuthenticated = true;
      state.error = null;
      authService.setToken(token);
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.userType = null;
      state.isAuthenticated = false;
      state.error = null;
      authService.removeToken();
    },

    setUser: (state, action) => {
      state.user = action.payload.user;
      state.userType = action.payload.userType;
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { login, logout, setUser, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer;
