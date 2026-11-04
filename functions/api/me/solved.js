// POST /api/me/solved   Body: { slug, lang, at? }
// Records that the learner solved a problem in a language. Repeating a report changes nothing.
// `at` (milliseconds) lets a report that waited offline keep its real time; a time that is not believable becomes "now".

import { json, fail, readJson, sameOrigin } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { hit } from '../../_lib/ratelimit.js';
import { problemSlugs, cleanSolve, insertSolved } from '../../_lib/progress.js';

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  const parsed = await readJson(context.request, 600);
  if (parsed.error) return parsed.error;

  let slugs;
  try { slugs = await problemSlugs(context.env, context.request); } catch (e) { return fail(503, 'try_again'); }
  const item = cleanSolve(parsed.body, slugs);
  if (!item) return fail(422, 'invalid_input');

  const limit = await hit(context.env.DB, `solve:${user.user_id}`, 200, 3600);
  if (!limit.allowed) return fail(429, 'rate_limited', { retryAfter: limit.retryAfter });

  const result = await insertSolved(context.env.DB, user.user_id, item).run();
  return json({ saved: true, created: result.meta.changes === 1 });
}
