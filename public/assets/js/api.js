// Thin wrapper around fetch for the JSON API.

export class ApiError extends Error {
  constructor(status, code, data) {
    super(code);
    this.status = status;
    this.code = code;
    this.data = data || {};
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let data = null;
  try { data = await response.json(); } catch (e) { /* an empty or non-JSON answer */ }
  if (!response.ok) throw new ApiError(response.status, (data && data.error) || 'error', data);
  return data;
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
    case 'too_large': return 'That photo is too large. Try a smaller one.';
    case 'forbidden': return 'This request was blocked. Reload the page and try again.';
    default: return 'Something went wrong. Please try again.';
  }
}
