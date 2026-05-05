const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'bundleforge_token';

export const authService = {
  signIn: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      let errorMessage = 'Sign in failed. Please check your credentials and try again.';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    authService.setToken(data.token);
    return data;
  },

  signUpCustomer: async (email, password, firstName, lastName, phoneNumber) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName, phoneNumber }),
    });
    if (!response.ok) {
      let errorMessage = 'Sign up failed';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  },

  signUpDeveloper: async (email, password, website, displayName) => {
    const response = await fetch(`${API_URL}/auth/request/developer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, website, displayName }),
    });
    if (!response.ok) {
      let errorMessage = 'Developer signup failed';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  },

  signUpPublisher: async (email, password, website, displayName) => {
    const response = await fetch(`${API_URL}/auth/request/publisher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, website, displayName }),
    });
    if (!response.ok) {
      let errorMessage = 'Publisher signup failed';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  },

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  updateCustomerProfile: async (firstName, lastName, phoneNumber) => {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/customers`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ firstName, lastName, phoneNumber }),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to update profile';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  isAuthenticated: () => {
    return !!authService.getToken();
  },
};
