// GET /api/me/progress
// Everything the signed-in learner has done: { solved: [{ slug, lang, at }], states: { slug: { conceptSeen, hints, revealed, attempts } } }.
// It is private: only the owner can read it, and no public view of a user contains any of it.

import { json } from '../../_lib/http.js';
import { requireUser, withRefreshedCookie } from '../../_lib/auth.js';
import { loadProgress } from '../../_lib/progress.js';

export async function onRequestGet(context) {
  const { user, error } = await requireUser(context);
  if (error) return error;
  return withRefreshedCookie(json(await loadProgress(context.env.DB, user.user_id)), user);
}
