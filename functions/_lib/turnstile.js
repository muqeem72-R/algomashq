// Cloudflare Turnstile: proves that a real person (not a script) submitted the form.
// Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const turnstileConfigured = (env) =>
  !!env.TURNSTILE_SECRET && !!env.TURNSTILE_SITE_KEY && !String(env.TURNSTILE_SITE_KEY).startsWith('REPLACE_');

// Returns { ok: true } or { ok: false, reason: 'not_configured' | 'missing' | 'rejected' | 'unreachable' }.
export async function verifyTurnstile(env, token, ip) {
  if (!turnstileConfigured(env)) return { ok: false, reason: 'not_configured' };
  if (typeof token !== 'string' || !token || token.length > 2048) return { ok: false, reason: 'missing' };

  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);

  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body: form });
    const data = await res.json();
    return data && data.success === true ? { ok: true } : { ok: false, reason: 'rejected' };
  } catch (e) {
    return { ok: false, reason: 'unreachable' };
  }
}
