// GET /api/me/drafts/:slug
// The saved drafts of one problem: { drafts: { cpp: { code, at }, python: { code, at } } } (only the languages that have one).

import { json, fail } from '../../../_lib/http.js';
import { requireUser } from '../../../_lib/auth.js';
import { loadDrafts } from '../../../_lib/drafts.js';

export async function onRequestGet(context) {
  const { user, error } = await requireUser(context);
  if (error) return error;
  const slug = String(context.params.slug || '');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 80) return fail(404, 'not_found');
  return json({ drafts: await loadDrafts(context.env.DB, user.user_id, slug) });
}
