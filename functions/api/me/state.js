// PATCH /api/me/state   Body: { slug, conceptSeen, hints, revealed, attempts }
// How one problem is going. The stored values only ever grow: a copy with smaller numbers does not lower them.

import { json, fail, readJson, sameOrigin } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { hit } from '../../_lib/ratelimit.js';
import { problemSlugs, isSlug, cleanState, upsertState } from '../../_lib/progress.js';

export async function onRequestPatch(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  const parsed = await readJson(context.request, 600);
  if (parsed.error) return parsed.error;

  let slugs;
  try { slugs = await problemSlugs(context.env, context.request); } catch (e) { return fail(503, 'try_again'); }
  const state = cleanState(parsed.body);
  if (!state || !isSlug(parsed.body.slug, slugs)) return fail(422, 'invalid_input');

  const limit = await hit(context.env.DB, `state:${user.user_id}`, 600, 3600);
  if (!limit.allowed) return fail(429, 'rate_limited', { retryAfter: limit.retryAfter });

  await upsertState(context.env.DB, user.user_id, parsed.body.slug, state).run();
  return json({ saved: true });
}
