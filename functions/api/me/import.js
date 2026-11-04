// POST /api/me/import   Body: { solved: [{ slug, lang, at }], states: { slug: { ... } } }
// Moves the progress that older versions kept only in the browser into the account. Nothing is ever removed:
// solves are added (the earliest time wins) and states keep the larger values. Entries that are not valid are skipped.
// The answer is the merged progress, in the same shape as GET /api/me/progress.

import { json, fail, readJson, sameOrigin } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { hit } from '../../_lib/ratelimit.js';
import { problemSlugs, isSlug, cleanSolve, cleanState, insertSolved, upsertState, loadProgress, runInChunks, MAX_SOLVED_ITEMS, MAX_STATE_ITEMS } from '../../_lib/progress.js';

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  const parsed = await readJson(context.request, 80000);
  if (parsed.error) return parsed.error;

  const { solved = [], states = {} } = parsed.body;
  if (!Array.isArray(solved) || solved.length > MAX_SOLVED_ITEMS || !states || typeof states !== 'object' || Array.isArray(states) || Object.keys(states).length > MAX_STATE_ITEMS) {
    return fail(422, 'invalid_input');
  }

  let slugs;
  try { slugs = await problemSlugs(context.env, context.request); } catch (e) { return fail(503, 'try_again'); }

  const limit = await hit(context.env.DB, `import:${user.user_id}`, 10, 86400);
  if (!limit.allowed) return fail(429, 'rate_limited', { retryAfter: limit.retryAfter });

  const db = context.env.DB;
  const now = Date.now();
  const statements = solved
    .map((item) => cleanSolve(item, slugs, now))
    .filter(Boolean)
    .sort((a, b) => a.at - b.at)
    .map((item) => insertSolved(db, user.user_id, item));
  for (const [slug, raw] of Object.entries(states)) {
    const state = cleanState(raw);
    if (state && isSlug(slug, slugs)) statements.push(upsertState(db, user.user_id, slug, state, now));
  }
  await runInChunks(db, statements);
  return json(await loadProgress(db, user.user_id));
}
