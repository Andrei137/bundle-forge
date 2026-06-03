const API_URL = import.meta.env.VITE_API_URL;
const ADMIN_TOKEN_KEY = 'bundleforge_admin_token';

// The admin is not a regular user (it has no row in the users table, its JWT
// simply carries userId "admin"). We keep its token completely separate from
// the customer/developer auth so the two never collide. Session-scoped only:
// the admin must re-paste the token after closing the tab.
const tokenStore = {
  get: () => sessionStorage.getItem(ADMIN_TOKEN_KEY),
  set: (token) => sessionStorage.setItem(ADMIN_TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(ADMIN_TOKEN_KEY),
};

const authHeaders = (extra = {}) => ({
  ...extra,
  Authorization: `Bearer ${tokenStore.get()}`,
});

// Unwraps a fetch Response, throwing an Error carrying the backend message and
// the HTTP status (so callers can special-case 401/403 → invalid admin token).
const handle = async (response, fallback) => {
  if (response.ok) {
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
  let message = fallback;
  try {
    const error = await response.json();
    message = error.message || error.error || message;
    if (Array.isArray(message)) message = message[0];
  } catch {
    message = `Server error: ${response.status} ${response.statusText}`;
  }
  const err = new Error(message);
  err.status = response.status;
  throw err;
};

export const adminService = {
  getToken: tokenStore.get,
  setToken: tokenStore.set,
  clearToken: tokenStore.clear,
  isAuthenticated: () => !!tokenStore.get(),

  // Validates the stored token by hitting an @RequireAdmin endpoint. Resolves
  // when the token is a valid admin token, rejects (with status) otherwise.
  verify: async () => {
    const response = await fetch(`${API_URL}/admin/providers`, {
      headers: authHeaders(),
    });
    return handle(response, 'Invalid admin token');
  },

  // ---- Accounts ----
  listDevelopers: async (status = '', name = '') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (name) params.append('name', name);
    const qs = params.toString();
    const response = await fetch(`${API_URL}/admin/providers${qs ? `?${qs}` : ''}`, {
      headers: authHeaders(),
    });
    return handle(response, 'Failed to load developers');
  },

  changeDeveloperStatus: async (developerId, status) => {
    const response = await fetch(`${API_URL}/admin/providers/${developerId}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status }),
    });
    return handle(response, 'Failed to update developer status');
  },

  listCustomers: async () => {
    const response = await fetch(`${API_URL}/customers`, {
      headers: authHeaders(),
    });
    return handle(response, 'Failed to load customers');
  },

  // ---- Charity founders ----
  listCharities: async () => {
    const response = await fetch(`${API_URL}/charity-founders`, {
      headers: authHeaders(),
    });
    return handle(response, 'Failed to load charity founders');
  },

  createCharity: async (dto) => {
    const response = await fetch(`${API_URL}/charity-founders`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(dto),
    });
    return handle(response, 'Failed to create charity founder');
  },

  updateCharity: async (id, dto) => {
    const response = await fetch(`${API_URL}/charity-founders/${id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(dto),
    });
    return handle(response, 'Failed to update charity founder');
  },

  deleteCharity: async (id) => {
    const response = await fetch(`${API_URL}/charity-founders/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handle(response, 'Failed to delete charity founder');
  },

  // ---- Bundles ----
  listBundles: async () => {
    const response = await fetch(`${API_URL}/bundles`, {
      headers: authHeaders(),
    });
    return handle(response, 'Failed to load bundles');
  },

  getBundle: async (id) => {
    const response = await fetch(`${API_URL}/bundles/${id}`, {
      headers: authHeaders(),
    });
    return handle(response, 'Failed to load bundle');
  },

  createBundle: async (dto, coverFile) => {
    const formData = new FormData();
    formData.append('bundle', new Blob([JSON.stringify(dto)], { type: 'application/json' }), 'bundle.json');
    formData.append('cover', coverFile);
    const response = await fetch(`${API_URL}/bundles`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    return handle(response, 'Failed to create bundle');
  },

  updateBundle: async (id, dto, coverFile) => {
    const formData = new FormData();
    formData.append('bundle', new Blob([JSON.stringify(dto)], { type: 'application/json' }), 'bundle.json');
    if (coverFile) formData.append('cover', coverFile);
    const response = await fetch(`${API_URL}/bundles/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: formData,
    });
    return handle(response, 'Failed to update bundle');
  },

  deleteBundle: async (id) => {
    const response = await fetch(`${API_URL}/bundles/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handle(response, 'Failed to delete bundle');
  },

  // Source list for the bundle game-picker. The search endpoint returns light
  // items (id, title, cover) which is all we need to choose gameIds.
  listGames: async () => {
    const response = await fetch(`${API_URL}/search?type=game&size=200`, {
      headers: authHeaders(),
    });
    const page = await handle(response, 'Failed to load games');
    return page?.content ?? [];
  },
};
