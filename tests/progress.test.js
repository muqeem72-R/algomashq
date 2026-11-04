// The learner's progress: the checks the server makes on every report, and how the browser keeps its copy in step with the account.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanSolve, cleanState, isSlug } from '../functions/_lib/progress.js';

const SLUGS = new Set(['hello-world', 'sum-of-array', 'fast-power']);
const NOW = Date.UTC(2026, 5, 1);

// ---- the server's checks ----

test('a solve report needs a real problem and a real language', () => {
  assert.deepEqual(cleanSolve({ slug: 'hello-world', lang: 'cpp', at: NOW - 1000 }, SLUGS, NOW), { slug: 'hello-world', lang: 'cpp', at: NOW - 1000 });
  assert.equal(cleanSolve({ slug: 'no-such-problem', lang: 'cpp', at: NOW }, SLUGS, NOW), null);
  assert.equal(cleanSolve({ slug: 'hello-world', lang: 'ruby', at: NOW }, SLUGS, NOW), null);
  assert.equal(cleanSolve({ slug: 'Hello-World', lang: 'cpp' }, SLUGS, NOW), null);
  assert.equal(cleanSolve({ slug: "x'; DROP TABLE solved; --", lang: 'cpp' }, SLUGS, NOW), null);
  assert.equal(cleanSolve(null, SLUGS, NOW), null);
  assert.equal(cleanSolve('hello-world', SLUGS, NOW), null);
});

test('a time that is missing or not believable becomes "now"', () => {
  const at = (v) => cleanSolve({ slug: 'hello-world', lang: 'python', at: v }, SLUGS, NOW).at;
  assert.equal(at(undefined), NOW);
  assert.equal(at('yesterday'), NOW);
  assert.equal(at(NaN), NOW);
  assert.equal(at(NOW + 60 * 60 * 1000), NOW, 'an hour in the future is refused');
  assert.equal(at(Date.UTC(2001, 0, 1)), NOW, 'before the site existed is refused');
  assert.equal(at(NOW + 60 * 1000), NOW + 60 * 1000, 'a minute of clock difference is fine');
  assert.equal(at(NOW - 3 * 24 * 3600 * 1000), NOW - 3 * 24 * 3600 * 1000);
});

test('a problem state is clamped to sensible numbers', () => {
  assert.deepEqual(cleanState({ conceptSeen: true, hints: 2, revealed: false, attempts: 5 }), { conceptSeen: 1, hints: 2, revealed: 0, attempts: 5 });
  assert.deepEqual(cleanState({ hints: 99, attempts: -4 }), { conceptSeen: 0, hints: 3, revealed: 0, attempts: 0 });
  assert.deepEqual(cleanState({ hints: 'two', attempts: 1e12 }), { conceptSeen: 0, hints: 0, revealed: 0, attempts: 100000 });
  assert.equal(cleanState(null), null);
  assert.equal(cleanState([1, 2]), null);
  assert.equal(cleanState('x'), null);
});

test('isSlug only accepts the slugs of real problems', () => {
  assert.ok(isSlug('fast-power', SLUGS));
  assert.ok(!isSlug('fast-power ', SLUGS));
  assert.ok(!isSlug(7, SLUGS));
  assert.ok(!isSlug('x'.repeat(200), SLUGS));
});

// ---- the browser's copy ----

function fakeStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: (k) => { data.delete(k); },
    key: (i) => [...data.keys()][i] ?? null,
    get length() { return data.size; },
    _data: data
  };
}

// A tiny stand-in for the API: it keeps the account's progress in memory and can be switched off.
function fakeServer() {
  const server = { solved: [], states: {}, calls: [], online: true, failImport: false, reject: null };
  globalThis.fetch = async (path, opts = {}) => {
    const method = opts.method || 'GET';
    const body = opts.body ? JSON.parse(opts.body) : null;
    server.calls.push({ path, method, body });
    if (!server.online) throw new TypeError('network down');
    const reply = (status, data) => ({ ok: status < 400, status, json: async () => data });
    if (server.reject && server.reject(path, body)) return reply(422, { error: 'invalid_input' });
    if (path === '/api/me/progress') return reply(200, { solved: server.solved, states: server.states });
    if (path === '/api/me/import') {
      if (server.failImport) return reply(500, { error: 'server_error' });
      for (const s of body.solved) if (!server.solved.some((x) => x.slug === s.slug && x.lang === s.lang)) server.solved.push(s);
      Object.assign(server.states, body.states);
      return reply(200, { solved: server.solved, states: server.states });
    }
    if (path === '/api/me/solved') {
      if (!server.solved.some((x) => x.slug === body.slug && x.lang === body.lang)) server.solved.push({ slug: body.slug, lang: body.lang, at: body.at });
      return reply(200, { saved: true });
    }
    if (path === '/api/me/state') { server.states[body.slug] = { conceptSeen: body.conceptSeen, hints: body.hints, revealed: body.revealed, attempts: body.attempts }; return reply(200, { saved: true }); }
    return reply(404, { error: 'not_found' });
  };
  return server;
}

async function withBrowser(fn) {
  const progress = await import('../public/assets/js/progress.js');
  globalThis.localStorage = fakeStorage();
  const server = fakeServer();
  progress.reset();
  try { await fn({ progress, server, storage: globalThis.localStorage }); } finally { progress.reset(); }
}

const user = (id) => ({ userId: id });

test('a new solve is shown at once and reaches the account', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    assert.deepEqual(progress.getSolved(), {});
    assert.equal(progress.markSolved('hello-world', 'cpp'), true, 'the first solve of a problem');
    assert.ok(progress.isSolved('hello-world'));
    await progress.flush();
    assert.deepEqual(server.solved.map((s) => [s.slug, s.lang]), [['hello-world', 'cpp']]);
    assert.equal(progress.markSolved('hello-world', 'cpp'), false, 'the same solve again is not new');
    assert.equal(progress.markSolved('hello-world', 'python'), false, 'a second language is not a first solve');
    await progress.flush();
    assert.deepEqual(progress.solvedLanguages('hello-world').sort(), ['cpp', 'python']);
    assert.equal(server.solved.length, 2);
  });
});

test('the account wins: what was solved on another device shows up here', async () => {
  await withBrowser(async ({ progress, server }) => {
    server.solved.push({ slug: 'sum-of-array', lang: 'java', at: 5000 }, { slug: 'sum-of-array', lang: 'cpp', at: 3000 });
    server.states['sum-of-array'] = { conceptSeen: true, hints: 2, revealed: false, attempts: 4 };
    await progress.load(user('mk001A'));
    assert.deepEqual(progress.getSolved()['sum-of-array'], { lang: 'cpp', at: 3000 }, 'the earliest solve is the first one');
    assert.deepEqual(progress.getState('sum-of-array'), { conceptSeen: true, hints: 2, revealed: false, attempts: 4 });
    assert.deepEqual(progress.getState('hello-world'), { conceptSeen: false, hints: 0, revealed: false, attempts: 0 });
  });
});

test('progress kept by older versions is moved into the account once', async () => {
  await withBrowser(async ({ progress, server, storage }) => {
    storage.setItem('algomashq.solved', JSON.stringify({ 'hello-world': { lang: 'python', at: 1000 } }));
    storage.setItem('algomashq.state.hello-world', JSON.stringify({ conceptSeen: true, hints: 1, revealed: false, attempts: 2 }));
    storage.setItem('algomashq.draft.hello-world.python', JSON.stringify('print(1)'));
    await progress.load(user('mk001A'));
    const imports = server.calls.filter((c) => c.path === '/api/me/import');
    assert.equal(imports.length, 1);
    assert.deepEqual(imports[0].body.solved, [{ slug: 'hello-world', lang: 'python', at: 1000 }]);
    assert.ok(progress.isSolved('hello-world'));
    assert.equal(progress.getState('hello-world').hints, 1);
    assert.equal(storage.getItem('algomashq.solved'), null, 'the old unscoped data is removed');
    assert.equal(storage.getItem('algomashq.state.hello-world'), null);
    assert.notEqual(storage.getItem('algomashq.draft.hello-world.python'), null, 'drafts are not touched');
    progress.reset();
    await progress.load(user('mk001A'));
    assert.equal(server.calls.filter((c) => c.path === '/api/me/import').length, 1, 'it is not imported a second time');
  });
});

test('if the import fails, the old data stays and is tried again next time', async () => {
  await withBrowser(async ({ progress, server, storage }) => {
    storage.setItem('algomashq.solved', JSON.stringify({ 'hello-world': { lang: 'cpp', at: 1000 } }));
    server.failImport = true;
    await progress.load(user('mk001A'));
    assert.notEqual(storage.getItem('algomashq.solved'), null);
    server.failImport = false;
    progress.reset();
    await progress.load(user('mk001A'));
    assert.equal(storage.getItem('algomashq.solved'), null);
    assert.deepEqual(server.solved.map((s) => s.slug), ['hello-world']);
  });
});

test('nothing is lost while offline: the change waits and is sent later', async () => {
  await withBrowser(async ({ progress, server, storage }) => {
    await progress.load(user('mk001A'));
    server.online = false;
    progress.markSolved('fast-power', 'cpp');
    await progress.flush();
    assert.ok(progress.isSolved('fast-power'), 'it shows as solved even though the server could not be reached');
    assert.equal(server.solved.length, 0);
    // The page is closed and opened again, still offline: the saved copy still has it.
    progress.reset();
    await progress.load(user('mk001A'));
    assert.ok(progress.isSolved('fast-power'));
    // The connection is back.
    server.online = true;
    progress.reset();
    await progress.load(user('mk001A'));
    await progress.flush();
    assert.deepEqual(server.solved.map((s) => s.slug), ['fast-power']);
    assert.deepEqual(JSON.parse(storage.getItem('algomashq.u.mk001A.queue')), [], 'the queue is empty again');
  });
});

test('several changes to one problem are sent as one (the latest)', async () => {
  await withBrowser(async ({ progress, server, storage }) => {
    await progress.load(user('mk001A'));
    server.online = false;
    progress.setState('sum-of-array', { conceptSeen: true });
    progress.setState('sum-of-array', { hints: 1 });
    progress.setState('sum-of-array', { hints: 2 });
    progress.setState('hello-world', { attempts: 1 });
    const queued = JSON.parse(storage.getItem('algomashq.u.mk001A.queue'));
    assert.equal(queued.length, 2);
    assert.deepEqual(queued.find((q) => q.slug === 'sum-of-array').state, { conceptSeen: true, hints: 2, revealed: false, attempts: 0 });
  });
});

test('a report the server refuses for good is dropped, not retried for ever', async () => {
  await withBrowser(async ({ progress, server, storage }) => {
    await progress.load(user('mk001A'));
    server.reject = (path, body) => path === '/api/me/solved' && body.slug === 'removed-problem';
    progress.markSolved('removed-problem', 'cpp');
    progress.markSolved('hello-world', 'cpp');
    await progress.flush();
    assert.deepEqual(JSON.parse(storage.getItem('algomashq.u.mk001A.queue')), []);
    assert.deepEqual(server.solved.map((s) => s.slug), ['hello-world']);
  });
});

test('two accounts in one browser do not see each other', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    progress.markSolved('hello-world', 'cpp');
    await progress.flush();
    progress.reset();
    server.solved = [];
    await progress.load(user('s002A'));
    assert.deepEqual(progress.getSolved(), {});
    assert.equal(progress.markSolved('sum-of-array', 'python'), true);
    progress.reset();
    server.solved = [];
    await progress.load(user('mk001A'));
    assert.deepEqual(Object.keys(progress.getSolved()), ['hello-world']);
  });
});
