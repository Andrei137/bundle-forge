const API_URL = process.env.E2E_API_URL || 'http://localhost:8080';

const uniqueId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Phone numbers must be unique per account, so derive a 10-digit number from
// the high-resolution clock and a small random offset.
const uniquePhone = () => {
  const stamp = (BigInt(Date.now()) * 1000n + BigInt(Math.floor(Math.random() * 1000))).toString();
  return ('07' + stamp.slice(-8)).slice(0, 10);
};

export const buildCustomer = (overrides = {}) => ({
  email: `e2e-${uniqueId()}@example.test`,
  password: 'Passw0rd!',
  firstName: 'Test',
  lastName: 'Customer',
  phoneNumber: uniquePhone(),
  ...overrides,
});

export const signUpCustomer = async (request, customer = buildCustomer()) => {
  const response = await request.post(`${API_URL}/auth/signup`, {
    data: {
      email: customer.email,
      password: customer.password,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phoneNumber: customer.phoneNumber,
    },
  });
  if (!response.ok()) {
    throw new Error(`Signup failed (${response.status()}): ${await response.text()}`);
  }
  return customer;
};

export const fetchFirstGame = async (request) => {
  const response = await request.get(`${API_URL}/search?size=1`);
  if (!response.ok()) {
    throw new Error(`Search failed: ${response.status()}`);
  }
  const body = await response.json();
  const game = (body.content || []).find((item) => item.type === 'GAME');
  if (!game) throw new Error('No game found in catalog — seed at least one game before running E2E tests.');
  return game;
};

// Checkout requires the catalog game to have at least one ACTIVE key in stock,
// otherwise the backend rejects the PaymentIntent creation. Search results omit
// activeKeyCount, so we fetch each candidate's details until we find one with stock.
export const fetchPayableGame = async (request) => {
  const searchResponse = await request.get(`${API_URL}/search?type=GAME&size=50`);
  if (!searchResponse.ok()) {
    throw new Error(`Search failed: ${searchResponse.status()}`);
  }
  const body = await searchResponse.json();
  const candidates = (body.content || []).filter((item) => item.type === 'GAME');
  for (const candidate of candidates) {
    const detailsResponse = await request.get(`${API_URL}/games/${candidate.id}`);
    if (!detailsResponse.ok()) continue;
    const game = await detailsResponse.json();
    if ((game.activeKeyCount || 0) > 0) return game;
  }
  throw new Error('No game with available keys found — seed game keys before running E2E checkout tests.');
};
