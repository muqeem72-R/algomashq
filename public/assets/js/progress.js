// What the learner has done: which problems are solved, how each one went, what was submitted and the code typed so far.
//
// The account (the server) is the source of truth, so all of it follows the learner to every device. This browser keeps
// a copy for two reasons: pages open instantly, and nothing is lost when the connection drops. Every change is written to
// the copy first and then sent to the server through a small queue that is kept in localStorage and retried until it works.
// Solving is never undone and the counters only grow, so two copies are merged simply by keeping the most; for a draft the
// newer copy wins.
//
// Everything that touches localStorage is wrapped in try/catch because storage can be blocked (private windows, strict
// settings); the progress then lasts until the page is closed.

import { api, ApiError } from './api.js';

const PREFIX = 'algomashq.';
const RETRY_MS = 30000;
const SEND_DELAY_MS = 1200;
const DRAFT_WAIT_MS = 1500;       // how long opening a problem waits for the drafts from the account
const DRAFT_MAX = 20000;          // the server keeps no more than this much code
const QUEUE_MAX = 300;
const LANGS = ['cpp', 'java', 'python'];

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
let queue = [];       // changes the server has not confirmed yet (see enqueue)
let dirty = new Map();   // 'slug:lang' -> true | 'cleared': drafts the account has not heard about yet
let flushing = null;  // the promise of the run that is sending the queue, or null
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
  dirty = new Map();
  rebuild();
  if (!listening) {
    listening = true;
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', () => flush());
      window.addEventListener('pagehide', () => { syncDrafts(); flush(); });
    }
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { syncDrafts(); flush(); } });
    }
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
  owner = null; items = []; solved = {}; langs = {}; states = {}; queue = []; dirty = new Map();
}

// ---- Sending ----
function schedule(delay) {
  clearTimeout(sendTimer);
  sendTimer = setTimeout(() => flush(), delay);
}

// An entry is one of:
//   { t: 'solved', slug, lang, at }          { t: 'state', slug, state }
//   { t: 'submission', slug, lang, verdict, passed, total, timeMs, code, at }
//   { t: 'draft', slug, lang, code, at }     (code null = the draft was reset)
function enqueue(entry) {
  // Only the latest state of a problem, and the latest draft of a problem and language, matter.
  if (entry.t === 'state') queue = queue.filter((q) => !(q.t === 'state' && q.slug === entry.slug));
  if (entry.t === 'draft') queue = queue.filter((q) => !(q.t === 'draft' && q.slug === entry.slug && q.lang === entry.lang));
  // The account keeps only the last submission of a problem and language, so an unsent older one is not worth sending.
  if (entry.t === 'submission') queue = queue.filter((q) => !(q.t === 'submission' && q.slug === entry.slug && q.lang === entry.lang));
  queue.push(entry);
  if (queue.length > QUEUE_MAX) queue = queue.slice(-QUEUE_MAX);
  persist();
  schedule(SEND_DELAY_MS);
}

function send(entry) {
  const { t, ...rest } = entry;
  if (t === 'solved') return api('/api/me/solved', { method: 'POST', body: rest, keepalive: true });
  if (t === 'state') return api('/api/me/state', { method: 'PATCH', body: { slug: entry.slug, ...entry.state }, keepalive: true });
  if (t === 'submission') return api('/api/me/submissions', { method: 'POST', body: rest, keepalive: true });
  return api('/api/me/drafts', { method: 'PUT', body: rest, keepalive: true });
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
          await send(entry);
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

// ---- Solutions: the code of an ACCEPTED Submit. The account keeps the last accepted one for each problem and language. ----
// A submission that is not accepted is not saved at all (not its code, not its result).
export function recordSubmission({ slug, lang, verdict, passed, total, timeMs, code }) {
  if (!owner || verdict !== 'accepted') return;
  enqueue({
    t: 'submission', slug, lang, verdict, passed, total,
    timeMs: Number.isFinite(timeMs) ? Math.round(timeMs) : null,
    code: typeof code === 'string' && code.length <= DRAFT_MAX ? code : null,
    at: Date.now()
  });
}

// ---- Drafts: the code typed so far, per problem and language ----
// Kept in this browser as { code, at } (older versions kept just the text). They reach the account when a problem is
// submitted or left, not on every keystroke, and come back when the problem is opened on another device.
const draftKey = (slug, lang) => `draft.${slug}.${lang}`;

function readDraft(slug, lang) {
  const v = read(draftKey(slug, lang), null);
  if (typeof v === 'string') return { code: v, at: 0 };
  return v && typeof v.code === 'string' ? { code: v.code, at: Number(v.at) || 0 } : null;
}

export const getDraft = (slug, lang) => { const d = readDraft(slug, lang); return d ? d.code : null; };

// `starter` is the starting code: a draft that is the same as it is no draft at all.
export function saveDraft(slug, lang, code, starter) {
  const previous = readDraft(slug, lang);
  if (starter !== undefined && code === starter) { if (previous) clearDraft(slug, lang); return; }
  if (previous && previous.code === code) return;   // nothing changed since the last save
  write(draftKey(slug, lang), { code, at: Date.now() });
  dirty.set(`${slug}:${lang}`, true);
}

export function clearDraft(slug, lang) {
  const had = readDraft(slug, lang);
  remove(draftKey(slug, lang));
  if (had) dirty.set(`${slug}:${lang}`, 'cleared');
}

// The language of the newest draft of a problem, or null. Used to open a problem where the work in progress is.
export function latestDraftLanguage(slug) {
  let best = null;
  for (const lang of LANGS) {
    const d = readDraft(slug, lang);
    if (d && (!best || d.at > best.at)) best = { lang, at: d.at };
  }
  return best ? best.lang : null;
}

// Hands the drafts that changed to the queue (call it when a problem is submitted or left, or the page is hidden).
export function syncDrafts() {
  if (!owner) return;
  for (const [key, mark] of dirty) {
    const [slug, lang] = key.split(':');
    const d = mark === 'cleared' ? null : readDraft(slug, lang);
    if (d && d.code.length > DRAFT_MAX) continue;   // too long for the account; it stays in this browser
    enqueue({ t: 'draft', slug, lang, code: d ? d.code : null, at: d && d.at ? d.at : Date.now() });
  }
  dirty.clear();
}

// Fetches the drafts of one problem from the account and keeps the newer copy of each language. Never throws, and gives up
// after a moment so that a slow connection cannot hold up opening a problem.
export async function loadDrafts(slug) {
  if (!owner) return;
  let timer;
  try {
    const answer = await Promise.race([
      api(`/api/me/drafts/${slug}`),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('slow')), DRAFT_WAIT_MS); })
    ]);
    const remote = (answer && answer.drafts) || {};
    for (const lang of LANGS) {
      const server = remote[lang];
      const local = readDraft(slug, lang);
      if (server && (!local || server.at > local.at)) write(draftKey(slug, lang), { code: server.code, at: server.at });
      else if (local && (!server || local.at > server.at)) dirty.set(`${slug}:${lang}`, true);   // this device has the newer one: tell the account
    }
  } catch (e) { /* offline or slow: the drafts of this browser are used */ } finally { clearTimeout(timer); }
}

// ---- The last language used ----
export const getLanguage = () => read('language', null);
export const setLanguage = (lang) => write('language', lang);
