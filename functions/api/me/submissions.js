// /api/me/submissions   (private: only the owner can see or change their saved submissions)
//
// Only an ACCEPTED solution is saved. For every problem and language the account keeps ONE: the last accepted one, with its
// code. A submission that is not accepted is refused and never replaces a saved solution.
//
//   GET    ?problem=<slug>                                                  the list, newest first, without the code
//   POST   { slug, lang, verdict: "accepted", passed, total, timeMs?, code?, at? }
//                                                                            saves it (it replaces the earlier one for that problem
//                                                                            and language) and counts the problem as solved
//   DELETE ?problem=<slug>                                                   clears them (of one problem, or of all)

import { json, fail, readJson, sameOrigin } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { hit } from '../../_lib/ratelimit.js';
import { problemSlugs, insertSolved } from '../../_lib/progress.js';
import { SAVED_VERDICT, cleanSubmission, saveSubmission, listSubmissions, clearStatement } from '../../_lib/submissions.js';

const SLUG_PARAM = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function onRequestGet(context) {
  const { user, error } = await requireUser(context);
  if (error) return error;
  const q = new URL(context.request.url).searchParams;
  const problem = q.get('problem');
  if (problem && !SLUG_PARAM.test(problem)) return fail(422, 'invalid_input');
  return json(await listSubmissions(context.env.DB, user.user_id, { slug: problem || null }));
}

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  const parsed = await readJson(context.request, 60000);
  if (parsed.error) return parsed.error;
  if (parsed.body.verdict !== SAVED_VERDICT) return fail(422, 'not_accepted');   // nothing is saved for a submission that failed

  let slugs;
  try { slugs = await problemSlugs(context.env, context.request); } catch (e) { return fail(503, 'try_again'); }
  const item = cleanSubmission(parsed.body, slugs);
  if (!item) return fail(422, 'invalid_input');

  const limit = await hit(context.env.DB, `submit:${user.user_id}`, 120, 3600);
  if (!limit.allowed) return fail(429, 'rate_limited', { retryAfter: limit.retryAfter });

  const db = context.env.DB;
  await db.batch([
    saveSubmission(db, user.user_id, item),
    insertSolved(db, user.user_id, { slug: item.slug, lang: item.lang, at: item.at })
  ]);
  return json({ saved: true });
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
