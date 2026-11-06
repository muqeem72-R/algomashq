// DELETE /api/me/account   Body: { confirm: "<your user id>" }
// Deletes the member and everything that belongs to them: profile, photo, progress, saved code, notes, bookmarks, logins.
// Typing the user id is the confirmation, so a stray click or a script cannot do it by accident.

import { json, fail, readJson, sameOrigin, clearSessionCookie } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { hit } from '../../_lib/ratelimit.js';
import { deleteAccount } from '../../_lib/accounts.js';
import { track } from '../../_lib/stats.js';
import { LIMITS } from '../../_lib/config.js';

export async function onRequestDelete(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  const parsed = await readJson(context.request, 300);
  if (parsed.error) return parsed.error;
  if (!(await hit(context.env.DB, 'delete:' + user.user_id, LIMITS.deleteAccountPerDay, 86400)).allowed) return fail(429, 'rate_limited');
  if (parsed.body.confirm !== user.user_id) return fail(422, 'invalid_input', { fields: { confirm: 'Type your user ID exactly to confirm.' } });
  await deleteAccount(context.env.DB, user);
  track(context, 'account_deleted');
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie(context.request) });
}
