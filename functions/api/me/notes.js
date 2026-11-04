// PUT /api/me/notes   Body: { slug, body, at }
// Saves the learner's private note on a problem: plain text, at most 500 characters (a longer one is refused with 422).
// An empty body removes the note. The copy with the newer time wins. Which problems have a note comes with GET /api/me/progress.

import { json, fail, readJson, sameOrigin } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { hit } from '../../_lib/ratelimit.js';
import { problemSlugs } from '../../_lib/progress.js';
import { cleanNote, saveNoteStatement } from '../../_lib/marks.js';

export async function onRequestPut(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  const parsed = await readJson(context.request, 6000);
  if (parsed.error) return parsed.error;

  let slugs;
  try { slugs = await problemSlugs(context.env, context.request); } catch (e) { return fail(503, 'try_again'); }
  const note = cleanNote(parsed.body, slugs);
  if (!note) return fail(422, 'invalid_input');

  const limit = await hit(context.env.DB, `note:${user.user_id}`, 300, 3600);
  if (!limit.allowed) return fail(429, 'rate_limited', { retryAfter: limit.retryAfter });

  await saveNoteStatement(context.env.DB, user.user_id, note).run();
  return json({ saved: true });
}
