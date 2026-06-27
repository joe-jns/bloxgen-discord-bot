// Small client for the BloxGen API (https://docs.bloxgen.net)
import './loadenv.js';

const BASE_URL = 'https://core.bloxgen.net';
const API_KEY = process.env.BLOXGEN_API_KEY;

// The 5 account types supported by /api/generate
export const ACCOUNT_TYPES = ['alt', '+30 days old', '+1 year old', '5+ years old', 'dump'];

async function request(path, { method = 'GET', body } = {}) {
  // POST endpoints (e.g. /api/generate) only read the key from the JSON body,
  // not the X-API-Key header, so inject it into the body too.
  const payload = body ? { apiKey: API_KEY, ...body } : undefined;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'X-API-Key': API_KEY,
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Invalid response from the API (HTTP ${res.status})`);
  }

  if (!json.success) {
    throw new Error(json.message || json.error || `API error (HTTP ${res.status})`);
  }
  return json.data;
}

// POST /api/generate -> { username, password, cookie, type, cost, id, region, ... }
export function generate(type) {
  return request('/api/generate', { method: 'POST', body: { type } });
}

// GET /api/balance -> { balance }
export function getBalance() {
  return request('/api/balance');
}

// GET /api/botting/check -> { userid, max_followers, available, ... }
export function checkFollowers(userid) {
  return request(`/api/botting/check?userid=${encodeURIComponent(userid)}`);
}
