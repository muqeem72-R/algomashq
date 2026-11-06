// Sign in with Google: checks the ID token (a signed JWT) that the Google button hands to the browser.
// Docs: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
//
// No client secret is involved. The token is signed by Google with a private key; we check the signature with Google's
// public keys, and then that the token was made for THIS site (aud), by Google (iss), is not expired, and carries an
// email address that Google itself has verified. Only then is the person treated as the owner of that email.

export const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const KEYS_TTL_MS = 60 * 60 * 1000;          // keep Google's public keys for an hour
const KEYS_REFRESH_MIN_MS = 5 * 60 * 1000;   // an unknown key id may trigger a re-download, but not more often than this
const LEEWAY_SECONDS = 60;                   // allowed difference between Google's clock and ours
const MAX_TOKEN_LENGTH = 4096;

// A Google OAuth client id looks like 123456789012-abcdef...xyz.apps.googleusercontent.com. It is public, not a secret.
export const CLIENT_ID_RE = /^[0-9]+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i;
export const googleConfigured = (env) => CLIENT_ID_RE.test(String(env.GOOGLE_CLIENT_ID || ''));

let cache = { url: '', keys: null, at: 0 };
export const resetKeyCache = () => { cache = { url: '', keys: null, at: 0 }; };

async function loadKeys(url, fetchImpl, now, { force = false } = {}) {
  const fresh = cache.keys && cache.url === url && now - cache.at < KEYS_TTL_MS;
  if (fresh && !force) return cache.keys;
  if (force && cache.keys && cache.url === url && now - cache.at < KEYS_REFRESH_MIN_MS) return cache.keys;
  const response = await fetchImpl(url, { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!response.ok) throw new Error('jwks_http_' + response.status);
  const body = await response.json();
  if (!body || !Array.isArray(body.keys)) throw new Error('jwks_shape');
  cache = { url, keys: body.keys, at: now };
  return cache.keys;
}

function fromBase64Url(text) {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function decodeJson(text) {
  return JSON.parse(new TextDecoder().decode(fromBase64Url(text)));
}

// Returns { ok: true, claims: { sub, email, name, givenName, familyName } } or { ok: false, reason }.
// Reasons: malformed, bad_algorithm, keys_unavailable, unknown_key, bad_signature, wrong_issuer, wrong_audience,
//          expired, not_yet_valid, no_email, email_not_verified.
export async function verifyGoogleIdToken(token, { clientId, now = Date.now(), jwksUrl = GOOGLE_JWKS_URL, fetchImpl = fetch } = {}) {
  if (typeof token !== 'string' || token.length < 20 || token.length > MAX_TOKEN_LENGTH) return { ok: false, reason: 'malformed' };
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((p) => !/^[A-Za-z0-9_-]+$/.test(p))) return { ok: false, reason: 'malformed' };

  let header;
  let claims;
  try {
    header = decodeJson(parts[0]);
    claims = decodeJson(parts[1]);
  } catch (e) {
    return { ok: false, reason: 'malformed' };
  }
  if (!header || !claims || typeof claims !== 'object') return { ok: false, reason: 'malformed' };
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') return { ok: false, reason: 'bad_algorithm' };

  // Find the key by its id. An unknown id may mean Google rotated its keys: look once more, with a fresh download.
  let keys;
  try {
    keys = await loadKeys(jwksUrl, fetchImpl, now);
    if (!keys.some((k) => k.kid === header.kid)) keys = await loadKeys(jwksUrl, fetchImpl, now, { force: true });
  } catch (e) {
    return { ok: false, reason: 'keys_unavailable' };
  }
  const jwk = keys.find((k) => k.kid === header.kid && k.kty === 'RSA');
  if (!jwk) return { ok: false, reason: 'unknown_key' };

  let valid = false;
  try {
    const key = await crypto.subtle.importKey('jwk', { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RS256', ext: true }, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, fromBase64Url(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
  } catch (e) {
    valid = false;
  }
  if (!valid) return { ok: false, reason: 'bad_signature' };

  // The signature is good, so the content can be trusted. Now check that it is meant for us.
  const seconds = Math.floor(now / 1000);
  if (!ISSUERS.includes(claims.iss)) return { ok: false, reason: 'wrong_issuer' };
  if (!clientId || claims.aud !== clientId) return { ok: false, reason: 'wrong_audience' };
  if (typeof claims.exp !== 'number' || claims.exp + LEEWAY_SECONDS < seconds) return { ok: false, reason: 'expired' };
  if (typeof claims.iat === 'number' && claims.iat - LEEWAY_SECONDS > seconds) return { ok: false, reason: 'not_yet_valid' };
  if (typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 64) return { ok: false, reason: 'malformed' };
  if (typeof claims.email !== 'string' || !claims.email) return { ok: false, reason: 'no_email' };
  if (!(claims.email_verified === true || claims.email_verified === 'true')) return { ok: false, reason: 'email_not_verified' };

  const text = (v) => (typeof v === 'string' ? v : '');
  return {
    ok: true,
    claims: {
      sub: claims.sub,
      email: claims.email.toLowerCase(),
      name: text(claims.name),
      givenName: text(claims.given_name),
      familyName: text(claims.family_name)
    }
  };
}
