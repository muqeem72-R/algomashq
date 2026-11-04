// GET /api/me/notes/:slug
// The learner's own note on one problem: { note: { body, at } }, or { note: null } when there never was one.
// There is no way to ask for anyone else's.

import { json, fail } from '../../../_lib/http.js';
import { requireUser } from '../../../_lib/auth.js';
import { getNote } from '../../../_lib/marks.js';

export async function onRequestGet(context) {
  const { user, error } = await requireUser(context);
  if (error) return error;
  const slug = String(context.params.slug || '');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 80) return fail(404, 'not_found');
  return json({ note: await getNote(context.env.DB, user.user_id, slug) });
}
