// Login sessions: a random token in an HttpOnly cookie; only its hash is stored.

import { SESSION_DAYS, SESSION_RENEW_AFTER_MS } from './config.js';
import { sha256Hex, randomToken } from './crypto.js';
import { getCookie, sessionCookie, clearSessionCookie, SESSION_COOKIE } from './http.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function createSession(request, db, userId, now = Date.now()) {
  const token = randomToken();
  await db
    .prepare('INSERT INTO sessions (token_hash, user_id, created_at, last_seen_at, expires_at) VALUES (?, ?, ?, ?, ?)')
    .bind(await sha256Hex(token), userId, now, now, now + SESSION_DAYS * DAY_MS)
    .run();
  return sessionCookie(request, token, SESSION_DAYS * 24 * 60 * 60);
}

// Returns the signed-in user's row, or null. Keeps an active session alive (sliding expiry).
// A second value, `refreshCookie`, is set when the cookie lifetime was extended.
export async function getSessionUser(request, db, now = Date.now()) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token || token.length > 100) return null;
  const tokenHash = await sha256Hex(token);
  const row = await db
    .prepare(
      `SELECT u.*, p.updated_at AS photo_v, s.last_seen_at AS seen
       FROM sessions s
       JOIN users u ON u.user_id = s.user_id
       LEFT JOIN user_photos p ON p.user_id = u.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`
    )
    .bind(tokenHash, now)
    .first();
  if (!row) return null;
  if (now - row.seen > SESSION_RENEW_AFTER_MS) {
    await db
      .prepare('UPDATE sessions SET last_seen_at = ?, expires_at = ? WHERE token_hash = ?')
      .bind(now, now + SESSION_DAYS * DAY_MS, tokenHash)
      .run();
    row.refreshCookie = sessionCookie(request, token, SESSION_DAYS * 24 * 60 * 60);
  }
  return row;
}

export async function destroySession(request, db) {
  const token = getCookie(request, SESSION_COOKIE);
  if (token) await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
  return clearSessionCookie(request);
}
