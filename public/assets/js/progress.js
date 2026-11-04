// What the learner has done, kept in this browser (localStorage). Phase 4 will move the solved list to the server.
// Everything is wrapped in try/catch because storage can be blocked (private windows, strict settings).

const PREFIX = 'algomashq.';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* the choice lasts until reload */ }
}

// ---- Solved problems ----
export const getSolved = () => read('solved', {});             // { slug: { lang, at } }
export const isSolved = (slug) => !!getSolved()[slug];
export function markSolved(slug, lang) {
  const all = getSolved();
  if (!all[slug]) { all[slug] = { lang, at: Date.now() }; write('solved', all); return true; }
  return false;
}

// ---- Drafts: the code typed so far, per problem and language ----
export const getDraft = (slug, lang) => read(`draft.${slug}.${lang}`, null);
export const saveDraft = (slug, lang, code) => write(`draft.${slug}.${lang}`, code);
export function clearDraft(slug, lang) { try { localStorage.removeItem(`${PREFIX}draft.${slug}.${lang}`); } catch (e) { /* ignore */ } }

// ---- Per-problem learning state ----
export const getState = (slug) => read(`state.${slug}`, { conceptSeen: false, hints: 0, revealed: false, attempts: 0 });
export function setState(slug, patch) {
  const next = { ...getState(slug), ...patch };
  write(`state.${slug}`, next);
  return next;
}

// ---- The last language used ----
export const getLanguage = () => read('language', null);
export const setLanguage = (lang) => write('language', lang);
