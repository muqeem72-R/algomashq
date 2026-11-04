// The learner's progress, kept per account: which problems were solved (and in which language) and how each problem
// went. The browser reports it; the judge runs in the browser, so the server cannot re-check a solve. What the server
// does check is that every report is well formed, names a real problem and a real language, and is not absurd.

import { LANGUAGE_IDS } from './validate.js';

export const MAX_SOLVED_ITEMS = 400;
export const MAX_STATE_ITEMS = 200;

const EARLIEST = Date.UTC(2024, 0, 1);
const FUTURE_SLACK_MS = 5 * 60 * 1000;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SLUG_CACHE_MS = 10 * 60 * 1000;

let slugCache = { at: 0, set: null };

// The slugs of all problems, read from the problem list that the site serves. Kept in memory for a few minutes.
export async function problemSlugs(env, request, now = Date.now()) {
  if (slugCache.set && now - slugCache.at < SLUG_CACHE_MS) return slugCache.set;
  const response = await env.ASSETS.fetch(new Request(new URL('/problems/index.json', request.url)));
  if (!response.ok) throw new Error('the problem list is not available');
  const data = await response.json();
  slugCache = { at: now, set: new Set(data.problems.map((p) => p.slug)) };
  return slugCache.set;
}

export const isSlug = (value, slugs) => typeof value === 'string' && value.length <= 80 && SLUG_RE.test(value) && slugs.has(value);

// A time reported by the browser: kept when it is believable (after the site existed, not in the future), otherwise "now".
export const believableTime = (at, now = Date.now()) => (Number.isFinite(at) && at >= EARLIEST && at <= now + FUTURE_SLACK_MS ? Math.floor(at) : now);

// One solve report { slug, lang, at } -> a clean one, or null.
export function cleanSolve(item, slugs, now = Date.now()) {
  if (!item || typeof item !== 'object') return null;
  if (!isSlug(item.slug, slugs) || !LANGUAGE_IDS.includes(item.lang)) return null;
  return { slug: item.slug, lang: item.lang, at: believableTime(item.at, now) };
}

const whole = (value, max) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.floor(n))) : 0;
};

// The state of one problem -> numbers in range, or null if it is not an object.
export function cleanState(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  return { conceptSeen: raw.conceptSeen ? 1 : 0, hints: whole(raw.hints, 3), revealed: raw.revealed ? 1 : 0, attempts: whole(raw.attempts, 100000) };
}

// Everything the learner has done, in one answer: the solved problems, how each problem went, the bookmarked problems and the
// problems that have a note (the notes themselves are fetched one at a time, when a problem is opened).
export async function loadProgress(db, userId) {
  const [solved, states, bookmarks, notes] = await db.batch([
    db.prepare('SELECT slug, lang, solved_at FROM solved WHERE user_id = ? ORDER BY solved_at').bind(userId),
    db.prepare('SELECT slug, concept_seen, hints, revealed, attempts FROM problem_state WHERE user_id = ?').bind(userId),
    db.prepare('SELECT slug FROM bookmarks WHERE user_id = ? AND marked = 1').bind(userId),
    db.prepare("SELECT slug FROM notes WHERE user_id = ? AND body <> ''").bind(userId)
  ]);
  const out = {
    solved: solved.results.map((r) => ({ slug: r.slug, lang: r.lang, at: r.solved_at })),
    states: {},
    bookmarks: bookmarks.results.map((r) => r.slug),
    notes: notes.results.map((r) => r.slug)
  };
  for (const r of states.results) out.states[r.slug] = { conceptSeen: !!r.concept_seen, hints: r.hints, revealed: !!r.revealed, attempts: r.attempts };
  return out;
}

// These two return prepared statements, so a caller can run one or batch many.
export const insertSolved = (db, userId, s) =>
  db.prepare('INSERT OR IGNORE INTO solved (user_id, slug, lang, solved_at) VALUES (?, ?, ?, ?)').bind(userId, s.slug, s.lang, s.at);

// Merging keeps the larger value of every column, so an old copy can never lower what is stored.
export const upsertState = (db, userId, slug, st, now = Date.now()) =>
  db
    .prepare(
      `INSERT INTO problem_state (user_id, slug, concept_seen, hints, revealed, attempts, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
       ON CONFLICT (user_id, slug) DO UPDATE SET
         concept_seen = MAX(concept_seen, excluded.concept_seen),
         hints = MAX(hints, excluded.hints),
         revealed = MAX(revealed, excluded.revealed),
         attempts = MAX(attempts, excluded.attempts),
         updated_at = excluded.updated_at`
    )
    .bind(userId, slug, st.conceptSeen, st.hints, st.revealed, st.attempts, now);

// D1 runs a batch as one transaction; keep each one small.
export async function runInChunks(db, statements, size = 50) {
  for (let i = 0; i < statements.length; i += size) await db.batch(statements.slice(i, i + size));
}
