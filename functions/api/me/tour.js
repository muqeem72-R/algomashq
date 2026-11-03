// POST /api/me/tour: remember that the welcome tour has been seen, so it never shows again on login.

import { json, fail, sameOrigin } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  await context.env.DB.prepare('UPDATE users SET tour_done = 1 WHERE seq = ?').bind(user.seq).run();
  return json({ ok: true });
}
