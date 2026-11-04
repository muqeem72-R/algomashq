// Drafts: the code a learner has typed so far for a problem, one per language, so it follows them to another device.
// A newer copy replaces an older one (the browser sends the time it was typed); `code: null` means "the draft was reset".

import { LANGUAGE_IDS } from './validate.js';
import { isSlug, believableTime } from './progress.js';

export const DRAFT_MAX = 20000;

// { slug, lang, code, at } -> a clean one, or null. `code` is a string of at most DRAFT_MAX characters, or null.
export function cleanDraft(raw, slugs, now = Date.now()) {
  if (!raw || typeof raw !== 'object') return null;
  if (!isSlug(raw.slug, slugs) || !LANGUAGE_IDS.includes(raw.lang)) return null;
  if (raw.code !== null && (typeof raw.code !== 'string' || raw.code.length > DRAFT_MAX)) return null;
  return { slug: raw.slug, lang: raw.lang, code: raw.code, at: believableTime(raw.at, now) };
}

// One statement either way, so a caller can run it or batch it.
export function saveDraftStatement(db, userId, d) {
  if (d.code === null) {
    return db.prepare('DELETE FROM drafts WHERE user_id = ? AND slug = ? AND lang = ? AND updated_at <= ?').bind(userId, d.slug, d.lang, d.at);
  }
  return db
    .prepare(
      `INSERT INTO drafts (user_id, slug, lang, code, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT (user_id, slug, lang) DO UPDATE SET code = excluded.code, updated_at = excluded.updated_at
       WHERE excluded.updated_at >= drafts.updated_at`
    )
    .bind(userId, d.slug, d.lang, d.code, d.at);
}

// { cpp: { code, at }, python: { code, at } } for one problem.
export async function loadDrafts(db, userId, slug) {
  const { results } = await db.prepare('SELECT lang, code, updated_at FROM drafts WHERE user_id = ? AND slug = ?').bind(userId, slug).all();
  const out = {};
  for (const r of results) out[r.lang] = { code: r.code, at: r.updated_at };
  return out;
}
