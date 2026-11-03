// Runs in front of every /api route: turns unexpected errors into a clean JSON answer
// and makes sure no API response is ever cached.

import { fail } from '../_lib/http.js';

export async function onRequest(context) {
  try {
    const response = await context.next();
    response.headers.set('Cache-Control', response.headers.get('Cache-Control') || 'no-store');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  } catch (e) {
    console.error('Unhandled API error:', e && e.stack ? e.stack : e);
    return fail(500, 'server_error');
  }
}
