// POST /api/admin/users/:id   Body: { action: "remove_photo" | "sign_out" | "delete" }   (admins only)
// What an admin may do to another member: take down a photo that should not be there, end every login, or delete the
// account. Every action is written to admin_log. Admin accounts themselves cannot be deleted from here.

import { json, fail, readJson, sameOrigin } from '../../../_lib/http.js';
import { requireAdmin, isAdminEmail } from '../../../_lib/admin.js';
import { findUserById, USER_ID_RE } from '../../../_lib/users.js';
import { deleteAccount, signOutEverywhere } from '../../../_lib/accounts.js';
import { track } from '../../../_lib/stats.js';

const ACTIONS = ['remove_photo', 'sign_out', 'delete'];

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user: admin, error } = await requireAdmin(context);
  if (error) return error;

  const id = String(context.params.id || '');
  if (!USER_ID_RE.test(id)) return fail(404, 'not_found');
  const parsed = await readJson(context.request, 300);
  if (parsed.error) return parsed.error;
  const action = parsed.body.action;
  if (!ACTIONS.includes(action)) return fail(422, 'invalid_input');

  const db = context.env.DB;
  const target = await findUserById(db, id);
  if (!target) return fail(404, 'not_found');
  if (action === 'delete' && isAdminEmail(context.env, target.email)) return fail(409, 'is_admin');

  if (action === 'remove_photo') await db.prepare('DELETE FROM user_photos WHERE user_id = ?').bind(id).run();
  else if (action === 'sign_out') await signOutEverywhere(db, id);
  else await deleteAccount(db, target);

  await db.prepare('INSERT INTO admin_log (at, admin_id, action, target) VALUES (?, ?, ?, ?)').bind(Date.now(), admin.user_id, action, id).run();
  track(context, 'admin_' + action);
  return json({ ok: true });
}
