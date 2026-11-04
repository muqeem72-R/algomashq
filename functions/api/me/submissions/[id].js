// GET /api/me/submissions/:id
// One submission of the signed-in learner, with its code (when it is still kept). Someone else's submission is "not found".

import { json, fail } from '../../../_lib/http.js';
import { requireUser } from '../../../_lib/auth.js';
import { getSubmission } from '../../../_lib/submissions.js';

export async function onRequestGet(context) {
  const { user, error } = await requireUser(context);
  if (error) return error;
  const raw = String(context.params.id || '');
  if (!/^[0-9]{1,15}$/.test(raw)) return fail(404, 'not_found');
  const submission = await getSubmission(context.env.DB, user.user_id, Number(raw));
  return submission ? json({ submission }) : fail(404, 'not_found');
}
