// /api/me/submissions   (private: only the owner can see or change their history)
//
//   GET    ?limit=30&before=<id>&problem=<slug>&verdict=accepted|failed   a page of the history, newest first, without the code
//   POST   { slug, lang, verdict, passed, total, timeMs?, code?, at? }    records one Submit (an accepted one also counts as solved)
//   DELETE ?problem=<slug>                                                  clears the history (of one problem, or of all)

import { json, fail, readJson, sameOrigin } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { hit } from '../../_lib/ratelimit.js';
import { problemSlugs, insertSolved } from '../../_lib/progress.js';
import { cleanSubmission, lastSubmission, insertSubmission, trimStatements, listSubmissions, clearStatement } from '../../_lib/submissions.js';

const SLUG_PARAM = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function onRequestGet(context) {
  const { user, error } = await requireUser(context);
  if (error) return error;
  const q = new URL(context.request.url).searchParams;
  const limit = Number.parseInt(q.get('limit') || '30', 10);
  const before = Number.parseInt(q.get('before') || '', 10);
  const problem = q.get('problem');
  const verdict = q.get('verdict');
  if (problem && !SLUG_PARAM.test(problem)) return fail(422, 'invalid_input');
  const page = await listSubmissions(context.env.DB, user.user_id, {
    limit: Number.isFinite(limit) ? limit : 30,
    before: Number.isFinite(before) && before > 0 ? before : null,
    slug: problem || null,
    verdict: verdict === 'accepted' || verdict === 'failed' ? verdict : null
  });
  return json(page);
}

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  const parsed = await readJson(context.request, 60000);
  if (parsed.error) return parsed.error;

  let slugs;
  try { slugs = await problemSlugs(context.env, context.request); } catch (e) { return fail(503, 'try_again'); }
  const item = cleanSubmission(parsed.body, slugs);
  if (!item) return fail(422, 'invalid_input');

  const limit = await hit(context.env.DB, `submit:${user.user_id}`, 120, 3600);
  if (!limit.allowed) return fail(429, 'rate_limited', { retryAfter: limit.retryAfter });

  const db = context.env.DB;
  // Pressing Submit again on the very same code with the very same result adds nothing new to the history.
  const last = await lastSubmission(db, user.user_id, item.slug);
  if (last && item.code !== null && last.lang === item.lang && last.verdict === item.verdict && last.code === item.code) {
    return json({ saved: false, duplicate: true });
  }

  const statements = [insertSubmission(db, user.user_id, item), ...trimStatements(db, user.user_id, item.slug)];
  if (item.verdict === 'accepted') statements.push(insertSolved(db, user.user_id, { slug: item.slug, lang: item.lang, at: item.at }));
  const results = await db.batch(statements);
  return json({ saved: true, id: results[0].meta.last_row_id });
}

export async function onRequestDelete(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  const problem = new URL(context.request.url).searchParams.get('problem');
  if (problem && !SLUG_PARAM.test(problem)) return fail(422, 'invalid_input');
  const limit = await hit(context.env.DB, `clear:${user.user_id}`, 20, 86400);
  if (!limit.allowed) return fail(429, 'rate_limited', { retryAfter: limit.retryAfter });
  const result = await clearStatement(context.env.DB, user.user_id, problem || null).run();
  return json({ cleared: result.meta.changes });
}
