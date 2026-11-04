// The solutions a learner got accepted: for every problem and language ONE, the last accepted one, with its code.
// A submission that is not accepted is never saved, and it never replaces a saved solution. It is private to its owner.
// Nothing here judges anything: the judge runs in the browser, so the server only checks that a report is well formed.

import { LANGUAGE_IDS } from './validate.js';
import { isSlug, believableTime } from './progress.js';

export const SAVED_VERDICT = 'accepted';   // the only result that is saved
export const CODE_MAX = 20000;

const whole = (value, lo, hi) => (Number.isInteger(value) && value >= lo && value <= hi ? value : null);

// A report { slug, lang, verdict, passed, total, timeMs?, code, at? } -> a clean one, or null (also for any verdict but accepted).
// Code that is too long is not kept, but the result still is.
export function cleanSubmission(raw, slugs, now = Date.now()) {
  if (!raw || typeof raw !== 'object') return null;
  if (!isSlug(raw.slug, slugs) || !LANGUAGE_IDS.includes(raw.lang) || raw.verdict !== SAVED_VERDICT) return null;
  const passed = whole(raw.passed, 0, 1000);
  const total = whole(raw.total, 0, 1000);
  if (passed === null || total === null || passed > total) return null;
  const timeMs = raw.timeMs === undefined || raw.timeMs === null ? null : whole(Math.round(Number(raw.timeMs)), 0, 600000);
  return {
    slug: raw.slug, lang: raw.lang, verdict: raw.verdict, passed, total, timeMs,
    code: typeof raw.code === 'string' && raw.code.length <= CODE_MAX ? raw.code : null,
    at: believableTime(raw.at, now)
  };
}

// Saves the solution as THE saved solution of its problem and language. A report that arrives late (it waited offline) and is
// older than what is stored does not replace it.
export const saveSubmission = (db, userId, s) =>
  db
    .prepare(
      `INSERT INTO submissions (user_id, slug, lang, verdict, passed, total, time_ms, code, submitted_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
       ON CONFLICT (user_id, slug, lang) DO UPDATE SET
         verdict = excluded.verdict, passed = excluded.passed, total = excluded.total,
         time_ms = excluded.time_ms, code = excluded.code, submitted_at = excluded.submitted_at
       WHERE excluded.submitted_at >= submissions.submitted_at`
    )
    .bind(userId, s.slug, s.lang, s.verdict, s.passed, s.total, s.timeMs, s.code, s.at);

const rowOut = (r) => ({ slug: r.slug, lang: r.lang, verdict: r.verdict, passed: r.passed, total: r.total, timeMs: r.time_ms, at: r.submitted_at, hasCode: !!r.has_code });

// All of the learner's saved solutions, newest first, without the code (there is at most one per problem and language).
export async function listSubmissions(db, userId, { slug = null } = {}) {
  const where = ['user_id = ?', "verdict = 'accepted'"];
  const args = [userId];
  if (slug) { where.push('slug = ?'); args.push(slug); }
  const { results } = await db
    .prepare(`SELECT slug, lang, verdict, passed, total, time_ms, submitted_at, code IS NOT NULL AS has_code FROM submissions WHERE ${where.join(' AND ')} ORDER BY submitted_at DESC LIMIT 400`)
    .bind(...args)
    .all();
  return { submissions: results.map(rowOut) };
}

export async function getSubmission(db, userId, slug, lang) {
  const r = await db
    .prepare("SELECT slug, lang, verdict, passed, total, time_ms, submitted_at, code, code IS NOT NULL AS has_code FROM submissions WHERE user_id = ? AND slug = ? AND lang = ? AND verdict = 'accepted'")
    .bind(userId, slug, lang)
    .first();
  return r ? { ...rowOut(r), code: r.code } : null;
}

export function clearStatement(db, userId, slug = null) {
  return slug
    ? db.prepare('DELETE FROM submissions WHERE user_id = ? AND slug = ?').bind(userId, slug)
    : db.prepare('DELETE FROM submissions WHERE user_id = ?').bind(userId);
}
