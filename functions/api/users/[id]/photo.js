// GET /api/users/:id/photo   (signed-in members only)
// A member's profile photo. Other members may see it; anonymous visitors may not.

import { fail } from '../../../_lib/http.js';
import { requireUser } from '../../../_lib/auth.js';
import { hit } from '../../../_lib/ratelimit.js';
import { LIMITS } from '../../../_lib/config.js';
import { USER_ID_RE } from '../../../_lib/users.js';
import { photoResponse } from '../../../_lib/photo.js';

export async function onRequestGet(context) {
  const { user, error } = await requireUser(context);
  if (error) return error;

  const id = String(context.params.id || '');
  if (!USER_ID_RE.test(id)) return fail(404, 'not_found');

  if (id !== user.user_id) {
    const limit = await hit(context.env.DB, 'photos:' + user.user_id, LIMITS.photoFetchesPerHour, 3600);
    if (!limit.allowed) return fail(429, 'rate_limited');
  }
  return photoResponse(context.env.DB, id);
}
