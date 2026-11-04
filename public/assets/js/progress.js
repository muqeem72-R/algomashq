// What the learner has done: which problems are solved and how each one went.
//
// The account (the server) is the source of truth, so the progress follows the learner to every device. This browser keeps
// a copy for two reasons: pages open instantly, and nothing is lost when the connection drops. Every change is written to
// the copy first and then sent to the server through a small queue that is kept in localStorage and retried until it works.
// Solving is never undone and the counters only grow, so two copies are merged simply by keeping the most.
//
// Everything that touches localStorage is wrapped in try/catch because storage can be blocked (private windows, strict
// settings); the progress then lasts until the page is closed.

import { api, ApiError } from './api.js';

const PREFIX = 'algomashq.';
const RETRY_MS = 30000;
const SEND_DELAY_MS = 1200;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* the choice lasts until reload */ }
}
function remove(key) { try { localStorage.removeItem(PREFIX + key); } catch (e) { /* ignore */ } }

// ---- What is in memory ----
let owner = null;     // the user id of the account whose progress this is; it scopes the saved copy
let items = [];       // every solve: { slug, lang, at }
let solved = {};      // slug -> { lang, at }: the first time the problem was solved
let langs = {};       // slug -> [lang, ...]: every language it was solved in
let states = {};      // slug -> { conceptSeen, hints, revealed, attempts }
let queue = [];       // changes the server has not confirmed yet: { t: 'solved', slug, lang, at } or { t: 'state', slug, state }
let flushing = null;   // the promise of the run that is sending the queue, or null
let sendTimer = null;
let retryTimer = null;
let listening = false;

const blankState = () => ({ conceptSeen: false, hints: 0, revealed: false, attempts: 0 });
const mine = (name) => `u.${owner}.${name}`;

function rebuild() {
  solved = {};
  langs = {};
  for (const it of items) {
    if (!langs[it.slug]) langs[it.slug] = [];
    if (!langs[it.slug].includes(it.lang)) langs[it.slug].push(it.lang);
    if (!solved[it.slug] || it.at < solved[it.slug].at) solved[it.slug] = { lang: it.lang, at: it.at };
  }
}

function persist() {
  if (!owner) return;
  write(mine('solved'), items);
  write(mine('states'), states);
  write(mine('queue'), queue);
}

const validItem = (x) => x && typeof x.slug === 'string' && typeof x.lang === 'string' && Number.isFinite(x.at);

// Adds solves that are not known yet; for a repeated (problem, language) the earliest time wins.
function mergeItems(list) {
  const known = new Map(items.map((it) => [`${it.slug}:${it.lang}`, it]));
  for (const it of list) {
    if (!validItem(it)) continue;
    const key = `${it.slug}:${it.lang}`;
    const have = known.get(key);
    if (!have) { const copy = { slug: it.slug, lang: it.lang, at: it.at }; known.set(key, copy); items.push(copy); }
    else if (it.at < have.at) have.at = it.at;
  }
}

function mergeStates(map) {
  for (const [slug, s] of Object.entries(map || {})) {
    const have = { ...blankState(), ...(states[slug] || {}) };
    states[slug] = {
      conceptSeen: have.conceptSeen || !!s.conceptSeen,
      hints: Math.max(have.hints, s.hints || 0),
      revealed: have.revealed || !!s.revealed,
      attempts: Math.max(have.attempts, s.attempts || 0)
    };
  }
}

// ---- Older versions kept everything in this browser, outside any account ----
// The first sign-in after the update moves that data into the account, then removes it from the browser.
function legacyKeys() {
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k === `${PREFIX}solved` || k.startsWith(`${PREFIX}state.`))) keys.push(k.slice(PREFIX.length));
    }
  } catch (e) { /* storage is not available */ }
  return keys;
}

async function importLegacy() {
  const keys = legacyKeys();
  if (!keys.length) return;
  const oldSolved = read('solved', {}) || {};
  const payload = { solved: [], states: {} };
  for (const [slug, e] of Object.entries(oldSolved)) if (e && typeof e.lang === 'string') payload.solved.push({ slug, lang: e.lang, at: e.at });
  for (const k of keys) if (k.startsWith('state.')) payload.states[k.slice('state.'.length)] = read(k, null);
  if (payload.solved.length || Object.keys(payload.states).length) await api('/api/me/import', { method: 'POST', body: payload });
  for (const k of keys) remove(k);   // only reached when the server accepted it; otherwise the next sign-in tries again
}

// ---- Loading ----
// Never throws: when the server cannot be reached, the saved copy is used and the queue is tried again later.
export async function load(user) {
  owner = user.userId;
  items = (read(mine('solved'), []) || []).filter(validItem);
  states = read(mine('states'), {}) || {};
  queue = read(mine('queue'), []) || [];
  rebuild();
  if (!listening && typeof window !== 'undefined' && window.addEventListener) {
    listening = true;
    window.addEventListener('online', () => flush());
  }
  try { await importLegacy(); } catch (e) { /* the old data stays in the browser and is tried again at the next sign-in */ }
  try {
    const server = await api('/api/me/progress');
    mergeItems(server.solved || []);
    mergeStates(server.states || {});
    rebuild();
  } catch (e) { /* offline, or the server has a problem: carry on with the saved copy */ }
  persist();
  flush();
}

// Forget the account in memory (the saved copy stays in the browser for the next sign-in).
export function reset() {
  clearTimeout(sendTimer);
  clearTimeout(retryTimer);
  owner = null; items = []; solved = {}; langs = {}; states = {}; queue = [];
}

// ---- Sending ----
function schedule(delay) {
  clearTimeout(sendTimer);
  sendTimer = setTimeout(() => flush(), delay);
}

function enqueue(entry) {
  if (entry.t === 'state') queue = queue.filter((q) => !(q.t === 'state' && q.slug === entry.slug));   // only the latest state of a problem matters
  queue.push(entry);
  persist();
  schedule(SEND_DELAY_MS);
}

// Sends the queue, oldest first. If it is already being sent, the caller waits for that same run.
export function flush() {
  if (!owner) return Promise.resolve();
  if (!flushing) {
    const run = (async () => {
      let failed = false;
      while (queue.length) {
        const entry = queue[0];
        try {
          if (entry.t === 'solved') await api('/api/me/solved', { method: 'POST', body: { slug: entry.slug, lang: entry.lang, at: entry.at } });
          else await api('/api/me/state', { method: 'PATCH', body: { slug: entry.slug, ...entry.state } });
        } catch (e) {
          const refusedForGood = e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 401 && e.status !== 429;
          if (!refusedForGood) { failed = true; break; }   // offline, signed out, rate limited or a server problem: try again later
        }
        const at = queue.indexOf(entry);   // the entry may have been replaced while it was being sent
        if (at >= 0) queue.splice(at, 1);
        persist();
      }
      if (failed && owner) { clearTimeout(retryTimer); retryTimer = setTimeout(() => flush(), RETRY_MS); }
    })();
    flushing = run;
    run.then(() => { if (flushing === run) flushing = null; });   // after the assignment, even when the run had nothing to send
  }
  return flushing;
}

// ---- Solved problems ----
export const getSolved = () => solved;             // { slug: { lang, at } }
export const isSolved = (slug) => !!solved[slug];
export const solvedLanguages = (slug) => langs[slug] || [];

// Returns true when this is the first time the problem is solved (in any language).
export function markSolved(slug, lang) {
  if ((langs[slug] || []).includes(lang)) return false;
  const first = !solved[slug];
  const item = { slug, lang, at: Date.now() };
  items.push(item);
  rebuild();
  enqueue({ t: 'solved', slug, lang, at: item.at });
  return first;
}

// ---- Per-problem learning state ----
export const getState = (slug) => ({ ...blankState(), ...(states[slug] || {}) });
export function setState(slug, patch) {
  const next = { ...getState(slug), ...patch };
  states[slug] = next;
  enqueue({ t: 'state', slug, state: next });
  return next;
}

// ---- Drafts: the code typed so far, per problem and language (kept in this browser only for now) ----
export const getDraft = (slug, lang) => read(`draft.${slug}.${lang}`, null);
export const saveDraft = (slug, lang, code) => write(`draft.${slug}.${lang}`, code);
export function clearDraft(slug, lang) { remove(`draft.${slug}.${lang}`); }

// ---- The last language used ----
export const getLanguage = () => read('language', null);
export const setLanguage = (lang) => write('language', lang);
