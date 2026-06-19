import { request } from '@playwright/test';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Seeds the backend catalog with one PUBLISHED game that has ACTIVE keys in
// stock, so the data-dependent E2E specs (homepage, search, game-detail, cart,
// checkout) have something real to exercise. Runs once before the whole suite
// and is idempotent — if a payable game already exists, it does nothing.

const API_URL = process.env.E2E_API_URL || 'http://localhost:8080';

// The backend signs JWTs with the base64-decoded JWT_SECRET. The running stack
// gets it from the repo-root .env (docker-compose), so read it from there when
// it isn't already in the environment, falling back to the dev default in
// application.yml. Must match the backend or minted admin tokens won't verify.
function resolveJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  // this file lives at <repoRoot>/frontend/tests/e2e/global-setup.js
  const here = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(here, '../../..');
  try {
    const envFile = fs.readFileSync(path.join(repoRoot, '.env'), 'utf8');
    const match = envFile.match(/^\s*JWT_SECRET\s*=\s*(.+?)\s*$/m);
    if (match) return match[1].replace(/^["']|["']$/g, '');
  } catch {
    // no .env — fall through to the dev default
  }
  return 'dGVzdC1zZWNyZXQta2V5LWZvci1qd3QtdGVzdGluZy1wdXJwb3Nlcy1vbmx5LXBsZWFzZS1jaGFuZ2U=';
}

const JWT_SECRET_B64 = resolveJwtSecret();

// A valid 1x1 PNG — ImageService only checks the extension + non-empty bytes.
const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const b64url = (input) => Buffer.from(input).toString('base64url');

// Mint a token shaped exactly like JwtService.getToken: a single "userId" claim,
// HS256-signed with the base64-decoded secret. checkAdmin() only requires
// userId === "admin", so this lets the seeder approve the developer it creates.
function mintAdminToken() {
  const key = Buffer.from(JWT_SECRET_B64, 'base64');
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ userId: 'admin', iat: now, exp: now + 3600 }));
  const data = `${header}.${payload}`;
  const signature = crypto.createHmac('sha256', key).update(data).digest('base64url');
  return `${data}.${signature}`;
}

const jsonPart = (value) => ({
  name: 'part.json',
  mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify(value)),
});

const imagePart = (name) => ({ name, mimeType: 'image/png', buffer: PNG_1x1 });

async function ensure(response, label) {
  if (!response.ok()) {
    throw new Error(`Seed step "${label}" failed (${response.status()}): ${await response.text()}`);
  }
  return response;
}

// True if the catalog already has a GAME with at least one active key.
async function hasPayableGame(ctx) {
  const search = await ctx.get('/search?type=GAME&size=50');
  if (!search.ok()) return false;
  const body = await search.json();
  for (const item of (body.content || []).filter((i) => i.type === 'GAME')) {
    const details = await ctx.get(`/games/${item.id}`);
    if (details.ok() && ((await details.json()).activeKeyCount || 0) > 0) return true;
  }
  return false;
}

export default async function globalSetup() {
  const ctx = await request.newContext({ baseURL: API_URL });
  try {
    if (await hasPayableGame(ctx)) {
      console.log('[e2e seed] catalog already has a payable game — skipping seed.');
      return;
    }

    const stamp = Date.now();
    const developer = {
      email: `e2e-seed-dev-${stamp}@example.test`,
      password: 'Passw0rd!',
      displayName: `E2E Seed Studio ${stamp}`,
      website: 'https://e2e-seed.example.test',
    };

    // 1. Register the developer (starts PENDING).
    const reg = await ensure(
      await ctx.post('/auth/request/developer', { data: developer }),
      'register developer',
    );
    const developerId = (await reg.json()).id;

    // 2. Approve it via the admin endpoint so it can publish games.
    const adminToken = mintAdminToken();
    await ensure(
      await ctx.put(`/admin/providers/${developerId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { status: 'ACCEPTED' },
      }),
      'approve developer',
    );

    // 3. Sign in as the developer.
    const signin = await ensure(
      await ctx.post('/auth/signin', {
        data: { email: developer.email, password: developer.password, rememberMe: false },
      }),
      'developer signin',
    );
    const authHeaders = { Authorization: `Bearer ${(await signin.json()).token}` };

    // 4. Announce a game (created in ANNOUNCED status).
    const requirement = {
      note: 'Baseline configuration',
      os: 'Windows 10 64-bit',
      processor: 'Intel Core i5-8400',
      memory: '8 GB RAM',
      graphics: 'NVIDIA GeForce GTX 1060',
      graphicsAPI: 'DirectX 12',
      storage: '50 GB available space',
    };
    const gameDto = {
      title: `E2E Seed Game ${stamp}`,
      price: 59.99,
      shortDescription: 'A seeded game so the end-to-end suite has catalog data to exercise.',
      longDescription:
        'This game is created automatically by the E2E global setup. It exists purely to give ' +
        'the homepage, search, game-detail, cart and checkout specs real data to run against.',
      languages: ['English'],
      link: 'https://e2e-seed.example.test/game',
      tagIds: [],
      youtubeIds: ['dQw4w9WgXcQ'],
      systemRequirements: { Windows: { minimum: requirement, recommended: requirement } },
    };
    const announce = await ensure(
      await ctx.post('/developers/games', {
        headers: authHeaders,
        multipart: { game: jsonPart(gameDto), cover: imagePart('cover.png'), images: imagePart('screenshot.png') },
      }),
      'announce game',
    );
    const announced = await announce.json();
    const gameId = announced.id;

    // 5. Publish it so it shows up in search (preserve the uploaded images).
    await ensure(
      await ctx.put(`/developers/games/${gameId}`, {
        headers: authHeaders,
        multipart: { game: jsonPart({ status: 'PUBLISHED', existingImages: announced.images || [] }) },
      }),
      'publish game',
    );

    // 6. Upload active keys so the game is purchasable (checkout needs stock).
    // Keys must match XXXXX-XXXXX-XXXXX (uppercase alphanumeric) or the backend
    // silently rejects them as invalid format and stock stays at zero.
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const group = () => Array.from({ length: 5 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join('');
    const keys = Array.from({ length: 10 }, () => `${group()}-${group()}-${group()}`);
    await ensure(
      await ctx.post(`/games/${gameId}/keys`, { headers: authHeaders, data: { keys } }),
      'upload keys',
    );

    console.log(`[e2e seed] seeded published game #${gameId} with ${keys.length} active keys.`);
  } finally {
    await ctx.dispose();
  }
}
