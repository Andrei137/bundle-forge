import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseErrorMessage = async (response, fallback) => {
  try {
    const data = await response.json();
    return data.error || data.message || fallback;
  } catch {
    return `${fallback} (${response.status})`;
  }
};

export const checkoutService = {
  createPayment: async (items, idempotencyKey, couponCode) => {
    const response = await fetch(`${API_URL}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        ...authHeaders(),
      },
      body: JSON.stringify({ items, ...(couponCode ? { couponCode } : {}) }),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to create payment'));
    }
    return await response.json();
  },

  getPaymentStatus: async (paymentUuid) => {
    const response = await fetch(
      `${API_URL}/payment/status/${encodeURIComponent(paymentUuid)}`,
      { headers: { ...authHeaders() } }
    );
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to fetch payment status'));
    }
    return await response.json();
  },

  listOrders: async () => {
    const response = await fetch(`${API_URL}/payment/orders`, {
      headers: { ...authHeaders() },
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to fetch orders'));
    }
    return await response.json();
  },

  getOrder: async (orderId) => {
    const response = await fetch(`${API_URL}/payment/orders/${orderId}`, {
      headers: { ...authHeaders() },
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, 'Failed to fetch order'));
    }
    return await response.json();
  },
};
