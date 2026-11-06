// Runs in front of every /api route: turns unexpected errors into a clean JSON answer
// and makes sure no API response is ever cached.

import { fail } from '../_lib/http.js';
import { track } from '../_lib/stats.js';

export async function onRequest(context) {
  try {
    const response = await context.next();
    response.headers.set('Cache-Control', response.headers.get('Cache-Control') || 'no-store');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    // The API answers JSON and photos, never a page: nothing in an answer may be framed or loaded by another site.
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    response.headers.set('Referrer-Policy', 'no-referrer');
    if (!response.headers.has('Content-Security-Policy')) response.headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    return response;
  } catch (e) {
    console.error('Unhandled API error:', e && e.stack ? e.stack : e);
    if (context.env && context.env.DB) track(context, 'server_error');   // the admin page shows how often this happens
    return fail(500, 'server_error');
  }
}
