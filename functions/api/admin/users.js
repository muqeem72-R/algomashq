// GET /api/admin/users?q=<start of an email, a name or a user id>&before=<seq>   (admins only)
// A page of 25 members, newest first. Admins can see emails; no other part of the site shows them.

import { json } from '../../_lib/http.js';
import { requireAdmin, isAdminEmail } from '../../_lib/admin.js';

const PAGE = 25;

// LIKE treats % and _ as wildcards; a search text must not.
const likePrefix = (text) => text.replace(/[\\%_]/g, (c) => '\\' + c) + '%';

export async function onRequestGet(context) {
  const { error } = await requireAdmin(context);
  if (error) return error;

  const url = new URL(context.request.url);
  const q = (url.searchParams.get('q') || '').trim().slice(0, 60);
  const before = Math.max(0, Number.parseInt(url.searchParams.get('before') || '0', 10) || 0) || 9007199254740991;
  const like = likePrefix(q);

  const { results } = await context.env.DB
    .prepare(
      `SELECT u.seq, u.user_id, u.email, u.first_name, u.last_name, u.country, u.state, u.preferred_language,
              u.created_at, u.last_login_at,
              (SELECT COUNT(DISTINCT s.slug) FROM solved s WHERE s.user_id = u.user_id) AS solved,
              EXISTS (SELECT 1 FROM identities i WHERE i.user_id = u.user_id) AS google,
              EXISTS (SELECT 1 FROM user_photos p WHERE p.user_id = u.user_id) AS has_photo
       FROM users u
       WHERE u.seq < ?1 AND (?2 = '' OR u.email LIKE ?3 ESCAPE '\\' OR u.user_id LIKE ?3 ESCAPE '\\'
                             OR u.first_name LIKE ?3 ESCAPE '\\' OR u.last_name LIKE ?3 ESCAPE '\\')
       ORDER BY u.seq DESC LIMIT ?4`
    )
    .bind(before, q, like, PAGE + 1)
    .all();

  const more = results.length > PAGE;
  const rows = results.slice(0, PAGE);
  return json({
    users: rows.map((r) => ({
      seq: r.seq, userId: r.user_id, email: r.email, name: `${r.first_name} ${r.last_name}`.trim(),
      country: r.country, state: r.state, language: r.preferred_language, createdAt: r.created_at, lastLoginAt: r.last_login_at,
      solved: r.solved, google: !!r.google, hasPhoto: !!r.has_photo, isAdmin: isAdminEmail(context.env, r.email)
    })),
    next: more ? rows[rows.length - 1].seq : null
  });
}
