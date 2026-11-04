// GET /api/me/submissions/:slug/:lang
// The saved submission of one problem in one language, with its code (when it is kept). It is the learner's own: there is no
// way to ask for someone else's.

import { json, fail } from '../../../../_lib/http.js';
import { requireUser } from '../../../../_lib/auth.js';
import { LANGUAGE_IDS } from '../../../../_lib/validate.js';
import { getSubmission } from '../../../../_lib/submissions.js';

export async function onRequestGet(context) {
  const { user, error } = await requireUser(context);
  if (error) return error;
  const slug = String(context.params.slug || '');
  const lang = String(context.params.lang || '');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 80 || !LANGUAGE_IDS.includes(lang)) return fail(404, 'not_found');
  const submission = await getSubmission(context.env.DB, user.user_id, slug, lang);
  return submission ? json({ submission }) : fail(404, 'not_found');
}
