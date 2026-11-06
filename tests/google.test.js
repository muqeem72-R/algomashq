// Sign in with Google: the ID token check. The tests make their own RSA key and sign tokens like Google does,
// so every way a token can be wrong is tried without touching the network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyGoogleIdToken, googleConfigured, resetKeyCache, CLIENT_ID_RE } from '../functions/_lib/google.js';

const CLIENT = '123456789012-abcdefghijklmnop.apps.googleusercontent.com';
const NOW = Date.UTC(2026, 10, 6, 12, 0, 0);
const seconds = Math.floor(NOW / 1000);

const b64url = (input) => Buffer.from(input).toString('base64url');
const algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };

async function makeKey(kid) {
  const pair = await crypto.subtle.generateKey({ ...algorithm, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
  return { kid, privateKey: pair.privateKey, jwk: { kty: jwk.kty, n: jwk.n, e: jwk.e, kid, alg: 'RS256', use: 'sig' } };
}

async function sign(key, claims = {}, header = {}) {
  const head = b64url(JSON.stringify({ alg: 'RS256', kid: key.kid, typ: 'JWT', ...header }));
  const body = b64url(JSON.stringify({
    iss: 'https://accounts.google.com', aud: CLIENT, sub: '1100223344', email: 'Ada@Example.com', email_verified: true,
    name: 'Ada Lovelace', given_name: 'Ada', family_name: 'Lovelace', iat: seconds - 5, exp: seconds + 3600, ...claims
  }));
  const signature = await crypto.subtle.sign(algorithm, key.privateKey, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${Buffer.from(signature).toString('base64url')}`;
}

let counter = 0;
const setup = (...keys) => {
  resetKeyCache();
  const state = { calls: 0, keys };
  const url = `https://keys.test/${++counter}`;
  const fetchImpl = async () => { state.calls++; return { ok: true, json: async () => ({ keys: state.keys.map((k) => k.jwk) }) }; };
  return { state, url, fetchImpl, check: (token, extra = {}) => verifyGoogleIdToken(token, { clientId: CLIENT, now: NOW, jwksUrl: url, fetchImpl, ...extra }) };
};

test('a good token gives the verified email (lower case) and the name', async () => {
  const key = await makeKey('k1');
  const { check } = setup(key);
  const result = await check(await sign(key));
  assert.equal(result.ok, true);
  assert.deepEqual(result.claims, { sub: '1100223344', email: 'ada@example.com', name: 'Ada Lovelace', givenName: 'Ada', familyName: 'Lovelace' });
});

test('email_verified may arrive as the text "true"', async () => {
  const key = await makeKey('k1');
  const { check } = setup(key);
  assert.equal((await check(await sign(key, { email_verified: 'true' }))).ok, true);
});

test('a token made for another site is refused', async () => {
  const key = await makeKey('k1');
  const { check } = setup(key);
  assert.deepEqual(await check(await sign(key, { aud: '999-other.apps.googleusercontent.com' })), { ok: false, reason: 'wrong_audience' });
});

test('the issuer must be Google', async () => {
  const key = await makeKey('k1');
  const { check } = setup(key);
  assert.deepEqual(await check(await sign(key, { iss: 'https://evil.example' })), { ok: false, reason: 'wrong_issuer' });
  assert.equal((await check(await sign(key, { iss: 'accounts.google.com' }))).ok, true);
});

test('an expired token is refused, a few seconds of clock difference are not', async () => {
  const key = await makeKey('k1');
  const { check } = setup(key);
  assert.deepEqual(await check(await sign(key, { exp: seconds - 120 })), { ok: false, reason: 'expired' });
  assert.equal((await check(await sign(key, { exp: seconds - 10 }))).ok, true);
  assert.deepEqual(await check(await sign(key, { iat: seconds + 3600, exp: seconds + 7200 })), { ok: false, reason: 'not_yet_valid' });
});

test('an email that Google has not verified is refused', async () => {
  const key = await makeKey('k1');
  const { check } = setup(key);
  assert.deepEqual(await check(await sign(key, { email_verified: false })), { ok: false, reason: 'email_not_verified' });
  assert.deepEqual(await check(await sign(key, { email_verified: undefined })), { ok: false, reason: 'email_not_verified' });
  assert.deepEqual(await check(await sign(key, { email: '' })), { ok: false, reason: 'no_email' });
});

test('a changed token fails the signature check', async () => {
  const key = await makeKey('k1');
  const { check } = setup(key);
  const [head, , sig] = (await sign(key)).split('.');
  const forged = b64url(JSON.stringify({ iss: 'https://accounts.google.com', aud: CLIENT, sub: '1', email: 'admin@example.com', email_verified: true, iat: seconds, exp: seconds + 3600 }));
  assert.deepEqual(await check(`${head}.${forged}.${sig}`), { ok: false, reason: 'bad_signature' });
});

test('a token signed with some other key is refused', async () => {
  const real = await makeKey('k1');
  const attacker = await makeKey('k1');   // same key id, different key
  const { check } = setup(real);
  assert.deepEqual(await check(await sign(attacker)), { ok: false, reason: 'bad_signature' });
});

test('only RS256 is accepted, so "alg: none" and HMAC tricks do not work', async () => {
  const key = await makeKey('k1');
  const { check } = setup(key);
  assert.deepEqual(await check(await sign(key, {}, { alg: 'none' })), { ok: false, reason: 'bad_algorithm' });
  assert.deepEqual(await check(await sign(key, {}, { alg: 'HS256' })), { ok: false, reason: 'bad_algorithm' });
  const noKid = (await sign(key)).split('.');
  noKid[0] = b64url(JSON.stringify({ alg: 'RS256' }));
  assert.deepEqual(await check(noKid.join('.')), { ok: false, reason: 'bad_algorithm' });
});

test('rubbish is refused without errors', async () => {
  const { check } = setup(await makeKey('k1'));
  for (const bad of [undefined, null, 42, '', 'abc', 'a.b', 'a.b.c.d', 'x'.repeat(5000), '....................', 'not a token at all, with spaces']) {
    assert.deepEqual(await check(bad), { ok: false, reason: 'malformed' }, String(bad).slice(0, 20));
  }
  const key = await makeKey('k1');
  const half = (await sign(key)).split('.');
  assert.deepEqual(await check(`${b64url('not json')}.${half[1]}.${half[2]}`), { ok: false, reason: 'malformed' });
});

test('Google keys are downloaded once and reused', async () => {
  const key = await makeKey('k1');
  const { check, state } = setup(key);
  await check(await sign(key));
  await check(await sign(key));
  await check(await sign(key));
  assert.equal(state.calls, 1);
});

test('when Google cannot be reached, nobody is signed in', async () => {
  resetKeyCache();
  const key = await makeKey('k1');
  const token = await sign(key);
  const down = async () => { throw new Error('network'); };
  assert.deepEqual(await verifyGoogleIdToken(token, { clientId: CLIENT, now: NOW, jwksUrl: 'https://keys.test/down', fetchImpl: down }), { ok: false, reason: 'keys_unavailable' });
  const broken = async () => ({ ok: false, status: 500 });
  assert.deepEqual(await verifyGoogleIdToken(token, { clientId: CLIENT, now: NOW, jwksUrl: 'https://keys.test/broken', fetchImpl: broken }), { ok: false, reason: 'keys_unavailable' });
});

test('a new key id after a key rotation is picked up, but not more often than every 5 minutes', async () => {
  const oldKey = await makeKey('old');
  const newKey = await makeKey('new');
  const { check, state } = setup(oldKey);
  assert.equal((await check(await sign(oldKey))).ok, true);
  state.keys = [oldKey, newKey];
  const token = await sign(newKey);
  assert.deepEqual(await check(token), { ok: false, reason: 'unknown_key' });          // too soon to look again
  assert.equal((await check(token, { now: NOW + 6 * 60 * 1000 })).ok, true);          // later it is picked up
});

test('the Google client id has to look like one', () => {
  assert.equal(googleConfigured({ GOOGLE_CLIENT_ID: CLIENT }), true);
  for (const bad of [undefined, '', 'REPLACE_ME', '123-abc.example.com', 'abc.apps.googleusercontent.com', '123-abc.apps.googleusercontent.com.evil.com']) {
    assert.equal(googleConfigured({ GOOGLE_CLIENT_ID: bad }), false, String(bad));
  }
  assert.ok(CLIENT_ID_RE.test(CLIENT));
});
