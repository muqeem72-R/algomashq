// GET /api/auth/me: who is signed in on this browser.
// Answers { user: null } (not an error) when nobody is, so a first visit leaves the console clean.

import { json, fail } from '../../_lib/http.js';
import { withRefreshedCookie } from '../../_lib/auth.js';
import { getSessionUser } from '../../_lib/session.js';
import { selfView } from '../../_lib/users.js';
import { isAdminEmail } from '../../_lib/admin.js';

export async function onRequestGet({ request, env }) {
  if (!env.DB) return fail(503, 'not_configured');
  const user = await getSessionUser(request, env.DB);
  if (!user) return json({ user: null });
  return withRefreshedCookie(json({ user: selfView(user, { isAdmin: isAdminEmail(env, user.email) }) }), user);
}
