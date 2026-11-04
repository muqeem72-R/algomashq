// PUT /api/me/drafts   Body: { slug, lang, code, at }
// Saves the code a learner has typed so far for a problem in a language, so it follows them to another device.
// A copy that is older than the stored one is ignored. `code: null` means the learner reset the draft: it is removed.

import { json, fail, readJson, sameOrigin } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { hit } from '../../_lib/ratelimit.js';
import { problemSlugs } from '../../_lib/progress.js';
import { cleanDraft, saveDraftStatement } from '../../_lib/drafts.js';

export async function onRequestPut(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  const parsed = await readJson(context.request, 60000);
  if (parsed.error) return parsed.error;

  let slugs;
  try { slugs = await problemSlugs(context.env, context.request); } catch (e) { return fail(503, 'try_again'); }
  const draft = cleanDraft(parsed.body, slugs);
  if (!draft) return fail(422, 'invalid_input');

  const limit = await hit(context.env.DB, `draft:${user.user_id}`, 300, 3600);
  if (!limit.allowed) return fail(429, 'rate_limited', { retryAfter: limit.retryAfter });

  await saveDraftStatement(context.env.DB, user.user_id, draft).run();
  return json({ saved: true });
}
