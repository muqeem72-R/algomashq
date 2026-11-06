// POST /api/me/logout-all: ends every login of this member, on every device (including this one).

import { json, fail, sameOrigin, clearSessionCookie } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { signOutEverywhere } from '../../_lib/accounts.js';

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  await signOutEverywhere(context.env.DB, user.user_id);
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie(context.request) });
}
