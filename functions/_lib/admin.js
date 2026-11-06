// The admin page: who is an admin, and the guard for the endpoints behind it.
// Admins are named by email in the ADMIN_EMAILS setting (comma separated). Nothing about an admin is stored in the
// database, so an admin can be added or removed by changing the setting. The server decides: the browser only hides a link.

import { fail } from './http.js';
import { requireUser } from './auth.js';

export function adminEmails(env) {
  return String((env && env.ADMIN_EMAILS) || '')
    .split(/[\s,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const isAdminEmail = (env, email) => !!email && adminEmails(env).includes(String(email).toLowerCase());

// Returns { user } or { error: Response }. Signed-out visitors get 401, signed-in members who are not admins get 404, so the
// existence of the admin endpoints is not advertised.
export async function requireAdmin(context) {
  const found = await requireUser(context);
  if (found.error) return found;
  if (!isAdminEmail(context.env, found.user.email)) return { error: fail(404, 'not_found') };
  return found;
}
