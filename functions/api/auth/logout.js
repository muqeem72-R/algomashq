// POST /api/auth/logout: ends this browser's session.

import { json, fail, sameOrigin } from '../../_lib/http.js';
import { destroySession } from '../../_lib/session.js';

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail(403, 'forbidden');
  if (!env.DB) return fail(503, 'not_configured');
  const cookie = await destroySession(request, env.DB);
  return json({ ok: true }, 200, { 'Set-Cookie': cookie });
}
