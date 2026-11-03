// Shared guard for endpoints that need a signed-in user.

import { fail } from './http.js';
import { getSessionUser } from './session.js';

// Returns { user } (a database row) or { error: Response }.
export async function requireUser({ request, env }) {
  if (!env.DB) return { error: fail(503, 'not_configured') };
  const user = await getSessionUser(request, env.DB);
  if (!user) return { error: fail(401, 'not_signed_in') };
  return { user };
}

// Adds the renewed cookie (if the session was just extended) to a response.
export function withRefreshedCookie(response, user) {
  if (user && user.refreshCookie) response.headers.append('Set-Cookie', user.refreshCookie);
  return response;
}
