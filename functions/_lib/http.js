// Small HTTP helpers shared by the API functions.

const BASE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: Object.assign({}, BASE_HEADERS, extra) });
}

export function fail(status, error, extra = {}) {
  return json(Object.assign({ error }, extra), status);
}

// Browsers always send Origin on a cross-site POST; refuse any that is not this site.
export function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  return !origin || origin === new URL(request.url).origin;
}

// Reads a JSON body of at most maxBytes characters. Returns { body } or { error: Response }.
export async function readJson(request, maxBytes = 8000) {
  if (!(request.headers.get('Content-Type') || '').includes('application/json')) return { error: fail(415, 'bad_request') };
  const raw = await request.text();
  if (raw.length > maxBytes) return { error: fail(413, 'too_large') };
  try {
    const body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object');
    return { body };
  } catch (e) {
    return { error: fail(400, 'bad_request') };
  }
}

export const clientIp = (request) => request.headers.get('CF-Connecting-IP') || '127.0.0.1';

export const SESSION_COOKIE = 'sid';

export function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return '';
}

function cookie(request, value, maxAgeSeconds) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export const sessionCookie = (request, token, maxAgeSeconds) => cookie(request, token, maxAgeSeconds);
export const clearSessionCookie = (request) => cookie(request, '', 0);
