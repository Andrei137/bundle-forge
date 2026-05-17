import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const couponsService = {
  getMyCoupons: async () => {
    const response = await fetch(`${API_URL}/coupons/my`, {
      headers: { ...authHeaders() },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch coupons');
    }
    return response.json();
  },
};
