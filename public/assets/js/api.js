// Thin wrapper around fetch for the JSON API.

export class ApiError extends Error {
  constructor(status, code, data) {
    super(code);
    this.status = status;
    this.code = code;
    this.data = data || {};
  }
}

// timeoutMs: give up on a request that never answers (the caller then gets an ordinary error, not an ApiError).
export async function api(path, { method = 'GET', body, keepalive = false, timeoutMs = 0 } = {}) {
  const controller = timeoutMs ? new AbortController() : null;
  const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;
  let response;
  try {
    response = await fetch(path, {
      method,
      credentials: 'same-origin',
      keepalive,   // lets a request that is sent while the page is closing still arrive
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller ? controller.signal : undefined
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
  let data = null;
  try { data = await response.json(); } catch (e) { /* an empty or non-JSON answer */ }
  if (!response.ok) throw new ApiError(response.status, (data && data.error) || 'error', data);
  return data;
}

// Tells the server (anonymously) that something went wrong that only the browser can see, for example that the Google
// script was blocked. Only a fixed list of kinds is accepted (see functions/_lib/stats.js) and each is sent once per visit.
const reported = new Set();
export function reportEvent(kind) {
  if (reported.has(kind)) return;
  reported.add(kind);
  api('/api/events', { method: 'POST', body: { kind }, keepalive: true }).catch(() => { /* a report that cannot be sent is not worth a message */ });
}

// Turns an API error into a sentence for the person using the form.
export function describeError(err) {
  if (!(err instanceof ApiError)) return 'Something went wrong. Check your connection and try again.';
  const d = err.data || {};
  switch (err.code) {
    case 'captcha_failed': return 'The human check did not pass. Please try again.';
    case 'captcha_unavailable': return 'The human check is not set up on this server yet.';
    case 'rate_limited': return 'Too many attempts. Please wait a while and try again.';
    case 'daily_limit': return 'Too many login emails were sent today. Please try again tomorrow.';
    case 'cooldown': return `Please wait ${d.retryAfter || 60} seconds before asking for another code.`;
    case 'email_failed': return 'We could not send the email right now. Please try again in a minute.';
    case 'invalid_code':
      return typeof d.attemptsLeft === 'number'
        ? `That code is not correct. ${d.attemptsLeft} ${d.attemptsLeft === 1 ? 'try' : 'tries'} left.`
        : 'That code is not correct or has expired. Ask for a new one.';
    case 'too_many_attempts': return 'Too many wrong tries for this code. Ask for a new one.';
    case 'not_configured': return 'The server is not fully set up yet.';
    case 'google_failed':
      if (d.reason === 'expired') return 'That Google sign-in has expired. Click the Google button again, or use an email code.';
      if (d.reason === 'email_not_verified') return 'Google says the email address of that account is not verified, so we cannot use it. Try another Google account, or use an email code.';
      if (d.reason === 'unavailable') return 'We could not check your Google sign-in right now. Try again in a minute, or use an email code.';
      return 'Google sign-in did not work. Try again, or use an email code instead.';
    case 'google_unavailable': return 'Google sign-in is not available on this server. Please use an email code.';
    case 'too_large': return 'That photo is too large. Try a smaller one.';
    case 'forbidden': return 'This request was blocked. Reload the page and try again.';
    default: return 'Something went wrong. Please try again.';
  }
}
