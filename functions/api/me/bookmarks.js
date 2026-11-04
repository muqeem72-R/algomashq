// PUT /api/me/bookmarks   Body: { slug, marked: true | false, at }
// Bookmarks or un-bookmarks a problem. The copy with the newer time wins, so an old copy on another device changes nothing.
// The list of bookmarked problems comes with GET /api/me/progress.

import { json, fail, readJson, sameOrigin } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { hit } from '../../_lib/ratelimit.js';
import { problemSlugs } from '../../_lib/progress.js';
import { cleanBookmark, saveBookmarkStatement } from '../../_lib/marks.js';

export async function onRequestPut(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  const parsed = await readJson(context.request, 600);
  if (parsed.error) return parsed.error;

  let slugs;
  try { slugs = await problemSlugs(context.env, context.request); } catch (e) { return fail(503, 'try_again'); }
  const bookmark = cleanBookmark(parsed.body, slugs);
  if (!bookmark) return fail(422, 'invalid_input');

  const limit = await hit(context.env.DB, `bookmark:${user.user_id}`, 300, 3600);
  if (!limit.allowed) return fail(429, 'rate_limited', { retryAfter: limit.retryAfter });

  await saveBookmarkStatement(context.env.DB, user.user_id, bookmark).run();
  return json({ saved: true });
}
