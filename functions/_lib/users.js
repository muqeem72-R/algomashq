// Users: the public user id scheme, lookups, creation and what each viewer is allowed to see.

// ---- User id --------------------------------------------------------------------------
// Format:  <initials><number 001-999><letters>   for example  mk001A, s002A.
//   initials  first letter of the first name + first letter of the last name (just one
//             letter when there is no last name), lower case, Latin letters only.
//   number    counts 001 to 999, then starts again at 001.
//   letters   A for the first 999 users, B for the next 999 ... Z, then AA, AB ...
// The number and letters come from the global sign-up counter (users.seq), so two users
// can never get the same id, whatever their names are.

// First Latin letter of a name, ignoring accents ("Émile" -> "e"). Empty if there is none.
export function initial(name) {
  const plain = String(name || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const match = plain.match(/[a-z]/);
  return match ? match[0] : '';
}

// 1 -> A, 26 -> Z, 27 -> AA, 28 -> AB ...
export function toLetters(n) {
  let out = '';
  while (n > 0) {
    n -= 1;
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26);
  }
  return out;
}

export function makeUserId(firstName, lastName, seq) {
  const prefix = initial(firstName) + initial(lastName) || 'u';
  const zero = seq - 1;
  const number = (zero % 999) + 1;
  const round = Math.floor(zero / 999) + 1;
  return prefix + String(number).padStart(3, '0') + toLetters(round);
}

export const USER_ID_RE = /^[a-z]{1,2}\d{3}[A-Z]{1,4}$/;

// ---- Views: who may see what ------------------------------------------------------------
// There are three levels. Name and email are never shown to other members.
//   public  every signed-in member:   user id, photo (or letter logo), country
//   chat    members chatting together: everything in public + state + preferred language
//   self    the owner:                 everything, including name and email
// Only code that has checked that two members really are chatting may use chatView.

// The letter on a member's logo: the first letter of their first name, in capitals.
export function displayInitial(name) {
  const first = Array.from(String(name || '').trim())[0];
  return first ? first.toLocaleUpperCase() : '?';
}

export const publicView = (row) => ({
  userId: row.user_id,
  initial: displayInitial(row.first_name),
  country: row.country,
  photoVersion: row.photo_v || null
});

export const chatView = (row) => ({
  ...publicView(row),
  state: row.state,
  preferredLanguage: row.preferred_language
});

export const selfView = (row) => ({
  ...chatView(row),
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  tourDone: !!row.tour_done,
  createdAt: row.created_at
});

// ---- Queries ----------------------------------------------------------------------------

const SELECT_USER = `SELECT u.*, p.updated_at AS photo_v FROM users u LEFT JOIN user_photos p ON p.user_id = u.user_id`;

export const findUserByEmail = (db, email) => db.prepare(`${SELECT_USER} WHERE u.email = ?`).bind(email).first();
export const findUserById = (db, userId) => db.prepare(`${SELECT_USER} WHERE u.user_id = ?`).bind(userId).first();

// Creates the account and its photo. Throws if the email already exists.
export async function createUser(db, email, profile, now = Date.now()) {
  const inserted = await db
    .prepare('INSERT INTO users (email, first_name, last_name, country, state, preferred_language, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(email, profile.firstName, profile.lastName, profile.country, profile.state, profile.language, now)
    .run();
  const seq = inserted.meta.last_row_id;
  const userId = makeUserId(profile.firstName, profile.lastName, seq);
  const steps = [db.prepare('UPDATE users SET user_id = ? WHERE seq = ?').bind(userId, seq)];
  if (profile.photo) {
    steps.push(db.prepare('INSERT INTO user_photos (user_id, mime, data, updated_at) VALUES (?, ?, ?, ?)').bind(userId, 'image/jpeg', profile.photo, now));
  }
  await db.batch(steps);
  return userId;
}

// If a sign-up was cut off between the two steps above, give the account its id now.
export async function ensureUserId(db, row) {
  if (row.user_id) return row;
  const userId = makeUserId(row.first_name, row.last_name, row.seq);
  await db.prepare('UPDATE users SET user_id = ? WHERE seq = ? AND user_id IS NULL').bind(userId, row.seq).run();
  return findUserByEmail(db, row.email);
}
