// GET /api/users/:id   (signed-in members only)
//   another member -> public view: user id, letter, country, photo version. Never name, email, state or language.
//   yourself       -> your full profile, plus exactly what other members can see ("asSeenByOthers").
//
// The chat view (adds state and preferred language) is deliberately NOT served here. Once chat exists,
// the chat endpoints must confirm that both people are in that chat before they use chatView().

import { json, fail } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { hit } from '../../_lib/ratelimit.js';
import { LIMITS } from '../../_lib/config.js';
import { findUserById, publicView, chatView, selfView, USER_ID_RE } from '../../_lib/users.js';

export async function onRequestGet(context) {
  const { user, error } = await requireUser(context);
  if (error) return error;

  const id = String(context.params.id || '');
  if (!USER_ID_RE.test(id)) return fail(404, 'not_found');

  if (id === user.user_id) {
    return json({
      user: selfView(user),
      self: true,
      asSeenByOthers: { everywhere: publicView(user), inChat: chatView(user) }
    });
  }

  const limit = await hit(context.env.DB, 'lookup:' + user.user_id, LIMITS.lookupsPerHour, 3600);
  if (!limit.allowed) return fail(429, 'rate_limited');

  const other = await findUserById(context.env.DB, id);
  if (!other) return fail(404, 'not_found');
  return json({ user: publicView(other), self: false });
}
