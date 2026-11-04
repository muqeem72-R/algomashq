// Bookmarks and personal notes: small things a learner keeps about a problem. Both are private to their owner, and a newer
// copy replaces an older one (the browser sends the time it was made). Removing a bookmark or emptying a note keeps a row
// with the time, so that a stale copy on another device cannot bring it back.

import { isSlug, believableTime } from './progress.js';

export const NOTE_MAX = 500;

// { slug, marked, at } -> a clean one, or null. `marked` must be true or false.
export function cleanBookmark(raw, slugs, now = Date.now()) {
  if (!raw || typeof raw !== 'object' || typeof raw.marked !== 'boolean') return null;
  if (!isSlug(raw.slug, slugs)) return null;
  return { slug: raw.slug, marked: raw.marked ? 1 : 0, at: believableTime(raw.at, now) };
}

// A note is plain text: line breaks and tabs are kept, other control characters are dropped. Nothing but spaces means
// "no note" (an empty body). Longer than NOTE_MAX characters is refused (null).
export function cleanNote(raw, slugs, now = Date.now()) {
  if (!raw || typeof raw !== 'object' || typeof raw.body !== 'string') return null;
  if (!isSlug(raw.slug, slugs)) return null;
  const text = raw.body.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  if (text.length > NOTE_MAX) return null;
  return { slug: raw.slug, body: text.trim() === '' ? '' : text, at: believableTime(raw.at, now) };
}

export const saveBookmarkStatement = (db, userId, b) =>
  db
    .prepare(
      `INSERT INTO bookmarks (user_id, slug, marked, updated_at) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT (user_id, slug) DO UPDATE SET marked = excluded.marked, updated_at = excluded.updated_at
       WHERE excluded.updated_at >= bookmarks.updated_at`
    )
    .bind(userId, b.slug, b.marked, b.at);

export const saveNoteStatement = (db, userId, n) =>
  db
    .prepare(
      `INSERT INTO notes (user_id, slug, body, updated_at) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT (user_id, slug) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at
       WHERE excluded.updated_at >= notes.updated_at`
    )
    .bind(userId, n.slug, n.body, n.at);

// { body, at } for one problem, or null if there never was a note. An emptied note comes back with an empty body and its time.
export async function getNote(db, userId, slug) {
  const r = await db.prepare('SELECT body, updated_at FROM notes WHERE user_id = ? AND slug = ?').bind(userId, slug).first();
  return r ? { body: r.body, at: r.updated_at } : null;
}
