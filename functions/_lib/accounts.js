// Everything that removes or ends an account. One list of tables, so nothing is forgotten (a test checks it against schema.sql).

// Tables that hold rows of a member, found by user_id.
export const USER_TABLES = ['user_photos', 'sessions', 'solved', 'problem_state', 'submissions', 'drafts', 'bookmarks', 'notes', 'identities'];

// Deletes the member and every row that belongs to them, in one atomic batch. The member's pending login codes go too.
export async function deleteAccount(db, user) {
  const steps = USER_TABLES.map((table) => db.prepare(`DELETE FROM ${table} WHERE user_id = ?`).bind(user.user_id));
  steps.push(db.prepare('DELETE FROM otp_codes WHERE email = ?').bind(user.email));
  steps.push(db.prepare('DELETE FROM users WHERE seq = ?').bind(user.seq));
  await db.batch(steps);
}

export const signOutEverywhere = (db, userId) => db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
