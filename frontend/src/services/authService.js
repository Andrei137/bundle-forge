const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'bundleforge_token';
const USER_KEY = 'bundleforge_user';
const USER_TYPE_KEY = 'bundleforge_usertype';

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

    // Check if account is blocked due to status
    if (data.blocked && data.statusMessage) {
      const error = new Error(data.statusMessage);
      error.blocked = true;
      error.status = data.status;
      throw error;
    }

    authService.setToken(data.token);
    if (data.userType) {
      authService.setUserType(data.userType);
    }
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
        errorMessage = error.error || errorMessage;
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
        const errorData = await response.json();
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error[0];
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        errorMessage = `Server error: ${response.status}`;
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
        const errorData = await response.json();
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error[0];
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        errorMessage = `Server error: ${response.status}`;
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

  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: () => {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  setUserType: (userType) => {
    if (userType) {
      localStorage.setItem(USER_TYPE_KEY, userType);
    }
  },

  getUserType: () => {
    return localStorage.getItem(USER_TYPE_KEY);
  },

  removeUserType: () => {
    localStorage.removeItem(USER_TYPE_KEY);
  },

  getUserProfile: async (userType) => {
    const token = authService.getToken();
    let endpoint = '';
    if (userType === 'CUSTOMER') {
      endpoint = '/customers/me';
    } else if (userType === 'DEVELOPER') {
      endpoint = '/developers/me';
    } else if (userType === 'PUBLISHER') {
      endpoint = '/publishers/me';
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      let errorMessage = 'Failed to fetch profile';
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

  getCustomerProfile: async () => {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/customers/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      let errorMessage = 'Failed to fetch profile';
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
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  changePassword: async (currentPassword, newPassword) => {
    const token = authService.getToken();
    const userType = authService.getUserType();

    let endpoint = '/customers';
    if (userType === 'DEVELOPER') {
      endpoint = '/developers';
    } else if (userType === 'PUBLISHER') {
      endpoint = '/publishers';
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        password: newPassword
      }),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to change password';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
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

  checkEmailExists: async (email) => {
    const response = await fetch(`${API_URL}/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to check email';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data.exists;
  },

  checkDisplayNameExists: async (displayName) => {
    const response = await fetch(`${API_URL}/auth/check-displayname`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to check display name';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data.exists;
  },

  getDeveloperGames: async (status = null, title = null) => {
    const token = authService.getToken();
    let url = `${API_URL}/developers/games`;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (title) params.append('title', title);
    if (params.toString()) url += '?' + params.toString();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      let errorMessage = 'Failed to fetch games';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  announceGame: async (formData) => {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/developers/games`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      let errorMessage = 'Failed to announce game';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  updateGame: async (gameId, data) => {
    const token = authService.getToken();
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_URL}/developers/games/${gameId}`, {
      method: 'PUT',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        'Authorization': `Bearer ${token}`,
      },
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to update game';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  getTags: async () => {
    const response = await fetch(`${API_URL}/tags`);
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }
    return await response.json();
  },

  createTag: async (name) => {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to create tag';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  uploadGameKeys: async (gameId, keys) => {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/games/${gameId}/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ keys }),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to upload keys';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  deleteGame: async (gameId) => {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/developers/games/${gameId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      let errorMessage = 'Failed to delete game';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return { success: true };
  },
};
