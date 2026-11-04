// The history of what a learner submitted: the result of every Submit and, for the recent ones, the code.
// It is private to its owner. Nothing here judges anything: the judge runs in the browser, so the server only checks
// that a report is well formed, and keeps the table small (the last 20 rows of a problem, code for the last 5).

import { LANGUAGE_IDS } from './validate.js';
import { isSlug, believableTime } from './progress.js';

export const VERDICTS = ['accepted', 'wrong_answer', 'runtime_error', 'time_limit', 'memory_limit', 'output_limit', 'compile_error'];
export const CODE_MAX = 20000;
export const KEEP_CODE = 5;
export const KEEP_ROWS = 20;
export const PAGE_MAX = 50;

const whole = (value, lo, hi) => (Number.isInteger(value) && value >= lo && value <= hi ? value : null);

// A report { slug, lang, verdict, passed, total, timeMs?, code, at? } -> a clean one, or null.
// Code that is too long is not kept, but the result still is.
export function cleanSubmission(raw, slugs, now = Date.now()) {
  if (!raw || typeof raw !== 'object') return null;
  if (!isSlug(raw.slug, slugs) || !LANGUAGE_IDS.includes(raw.lang) || !VERDICTS.includes(raw.verdict)) return null;
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

export async function lastSubmission(db, userId, slug) {
  return db.prepare('SELECT id, lang, verdict, code FROM submissions WHERE user_id = ? AND slug = ? ORDER BY id DESC LIMIT 1').bind(userId, slug).first();
}

export const insertSubmission = (db, userId, s) =>
  db
    .prepare('INSERT INTO submissions (user_id, slug, lang, verdict, passed, total, time_ms, code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(userId, s.slug, s.lang, s.verdict, s.passed, s.total, s.timeMs, s.code, s.at);

// The two statements that keep a problem's history small. The latest accepted solution of each language is never trimmed.
export function trimStatements(db, userId, slug) {
  const keepNewest = (n) => `SELECT id FROM submissions WHERE user_id = ?1 AND slug = ?2 ORDER BY id DESC LIMIT ${n}`;
  const keepAccepted = "SELECT MAX(id) FROM submissions WHERE user_id = ?1 AND slug = ?2 AND verdict = 'accepted' GROUP BY lang";
  return [
    db.prepare(`UPDATE submissions SET code = NULL WHERE user_id = ?1 AND slug = ?2 AND code IS NOT NULL AND id NOT IN (${keepNewest(KEEP_CODE)}) AND id NOT IN (${keepAccepted})`).bind(userId, slug),
    db.prepare(`DELETE FROM submissions WHERE user_id = ?1 AND slug = ?2 AND id NOT IN (${keepNewest(KEEP_ROWS)}) AND id NOT IN (${keepAccepted})`).bind(userId, slug)
  ];
}

const rowOut = (r) => ({ id: r.id, slug: r.slug, lang: r.lang, verdict: r.verdict, passed: r.passed, total: r.total, timeMs: r.time_ms, at: r.created_at, hasCode: !!r.has_code });

// A page of the history, newest first. `before` is the id to continue after; `next` is the cursor for the following page.
export async function listSubmissions(db, userId, { limit = 30, before = null, slug = null, verdict = null } = {}) {
  const size = Math.max(1, Math.min(PAGE_MAX, limit));
  const where = ['user_id = ?'];
  const args = [userId];
  if (before) { where.push('id < ?'); args.push(before); }
  if (slug) { where.push('slug = ?'); args.push(slug); }
  if (verdict === 'accepted') where.push("verdict = 'accepted'");
  if (verdict === 'failed') where.push("verdict <> 'accepted'");
  const { results } = await db
    .prepare(`SELECT id, slug, lang, verdict, passed, total, time_ms, created_at, code IS NOT NULL AS has_code FROM submissions WHERE ${where.join(' AND ')} ORDER BY id DESC LIMIT ?`)
    .bind(...args, size + 1)
    .all();
  const page = results.slice(0, size).map(rowOut);
  return { submissions: page, next: results.length > size ? page[page.length - 1].id : null };
}

export async function getSubmission(db, userId, id) {
  const r = await db
    .prepare('SELECT id, slug, lang, verdict, passed, total, time_ms, created_at, code, code IS NOT NULL AS has_code FROM submissions WHERE user_id = ? AND id = ?')
    .bind(userId, id)
    .first();
  return r ? { ...rowOut(r), code: r.code } : null;
}

export function clearStatement(db, userId, slug = null) {
  return slug
    ? db.prepare('DELETE FROM submissions WHERE user_id = ? AND slug = ?').bind(userId, slug)
    : db.prepare('DELETE FROM submissions WHERE user_id = ?').bind(userId);
}
