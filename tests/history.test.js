// The submission history and the drafts: the checks the server makes, and how the browser keeps them in step with the account.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanSubmission, SAVED_VERDICT, CODE_MAX } from '../functions/_lib/submissions.js';
import { cleanDraft, DRAFT_MAX } from '../functions/_lib/drafts.js';
import { withBrowser } from './helpers/browser-fakes.js';

const SLUGS = new Set(['hello-world', 'sum-of-array']);
const NOW = Date.UTC(2026, 5, 1);
const report = (over = {}) => ({ slug: 'hello-world', lang: 'python', verdict: 'accepted', passed: 2, total: 2, timeMs: 5, code: 'print(1)', at: NOW - 1000, ...over });
const NOT_ACCEPTED = ['wrong_answer', 'runtime_error', 'time_limit', 'memory_limit', 'output_limit', 'compile_error', 'cancelled', 'not_run'];

// ---- the server's checks ----

test('only an accepted solution is saved: every other result is refused', () => {
  assert.equal(SAVED_VERDICT, 'accepted');
  assert.deepEqual(cleanSubmission(report(), SLUGS, NOW), { slug: 'hello-world', lang: 'python', verdict: 'accepted', passed: 2, total: 2, timeMs: 5, code: 'print(1)', at: NOW - 1000 });
  for (const verdict of NOT_ACCEPTED) assert.equal(cleanSubmission(report({ verdict }), SLUGS, NOW), null, verdict);
  assert.equal(cleanSubmission(report({ verdict: undefined }), SLUGS, NOW), null);
});

test('a report is accepted only when everything else in it makes sense too', () => {
  assert.equal(cleanSubmission(report({ slug: 'nope' }), SLUGS, NOW), null);
  assert.equal(cleanSubmission(report({ lang: 'ruby' }), SLUGS, NOW), null);
  assert.equal(cleanSubmission(report({ passed: 5, total: 2 }), SLUGS, NOW), null, 'more passed than there are tests');
  assert.equal(cleanSubmission(report({ passed: -1 }), SLUGS, NOW), null);
  assert.equal(cleanSubmission(report({ passed: 1.5 }), SLUGS, NOW), null);
  assert.equal(cleanSubmission(report({ total: 1e9, passed: 1 }), SLUGS, NOW), null);
  assert.equal(cleanSubmission(null, SLUGS, NOW), null);
});

test('code that is too long is not kept, but the result is', () => {
  assert.equal(cleanSubmission(report({ code: 'x'.repeat(CODE_MAX) }), SLUGS, NOW).code.length, CODE_MAX);
  assert.equal(cleanSubmission(report({ code: 'x'.repeat(CODE_MAX + 1) }), SLUGS, NOW).code, null);
  assert.equal(cleanSubmission(report({ code: 42 }), SLUGS, NOW).code, null);
  assert.equal(cleanSubmission(report({ code: undefined }), SLUGS, NOW).code, null);
});

test('the time of a submission must be believable, and the running time sane', () => {
  assert.equal(cleanSubmission(report({ at: NOW + 24 * 3600 * 1000 }), SLUGS, NOW).at, NOW);
  assert.equal(cleanSubmission(report({ at: undefined }), SLUGS, NOW).at, NOW);
  assert.equal(cleanSubmission(report({ timeMs: -5 }), SLUGS, NOW).timeMs, null);
  assert.equal(cleanSubmission(report({ timeMs: 99999999 }), SLUGS, NOW).timeMs, null);
  assert.equal(cleanSubmission(report({ timeMs: 12.6 }), SLUGS, NOW).timeMs, 13);
});

test('a draft needs a real problem and language, and code of a sensible size or null', () => {
  const draft = (over = {}) => ({ slug: 'sum-of-array', lang: 'cpp', code: 'int main() {}', at: NOW - 5, ...over });
  assert.deepEqual(cleanDraft(draft(), SLUGS, NOW), { slug: 'sum-of-array', lang: 'cpp', code: 'int main() {}', at: NOW - 5 });
  assert.equal(cleanDraft(draft({ code: null }), SLUGS, NOW).code, null, 'null means the draft was reset');
  assert.equal(cleanDraft(draft({ code: '' }), SLUGS, NOW).code, '', 'an empty draft is still a draft');
  assert.equal(cleanDraft(draft({ code: 'x'.repeat(DRAFT_MAX + 1) }), SLUGS, NOW), null);
  assert.equal(cleanDraft(draft({ code: 12 }), SLUGS, NOW), null);
  assert.equal(cleanDraft(draft({ code: undefined }), SLUGS, NOW), null);
  assert.equal(cleanDraft(draft({ slug: 'x' }), SLUGS, NOW), null);
  assert.equal(cleanDraft(draft({ lang: 'go' }), SLUGS, NOW), null);
});

// ---- the browser: submissions ----

const user = (id) => ({ userId: id });

test('an accepted solution is queued, sent with its code, and replayed after being offline', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    server.online = false;
    progress.recordSubmission({ slug: 'hello-world', lang: 'python', verdict: 'accepted', passed: 2, total: 2, timeMs: 3, code: 'print("hello world!")' });
    await progress.flush();
    assert.equal(server.submissions.length, 0);
    server.online = true;
    progress.reset();
    await progress.load(user('mk001A'));
    await progress.flush();
    assert.equal(server.submissions.length, 1);
    assert.equal(server.submissions[0].code, 'print("hello world!")');
    assert.equal(server.submissions[0].verdict, 'accepted');
    assert.equal(server.submissions[0].t, undefined, 'the queue bookkeeping is not sent');
  });
});

test('a submission that is not accepted is never queued, so nothing is saved for it', async () => {
  await withBrowser(async ({ progress, server, storage }) => {
    await progress.load(user('mk001A'));
    for (const verdict of NOT_ACCEPTED) progress.recordSubmission({ slug: 'hello-world', lang: 'cpp', verdict, passed: 0, total: 5, timeMs: 1, code: 'x' });
    assert.deepEqual(JSON.parse(storage.getItem('algomashq.u.mk001A.queue')), []);
    await progress.flush();
    assert.equal(server.submissions.length, 0);
    assert.equal(server.calls.filter((c) => c.path === '/api/me/submissions').length, 0);
  });
});

test('code that is too long is sent without the code', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    progress.recordSubmission({ slug: 'hello-world', lang: 'cpp', verdict: 'accepted', passed: 5, total: 5, timeMs: 9, code: 'y'.repeat(20001) });
    await progress.flush();
    assert.equal(server.submissions.length, 1);
    assert.equal(server.submissions[0].code, null);
  });
});

test('only the last accepted solution of a problem and language is sent', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    server.online = false;
    progress.recordSubmission({ slug: 'hello-world', lang: 'cpp', verdict: 'accepted', passed: 2, total: 2, timeMs: 1, code: 'first accepted' });
    progress.recordSubmission({ slug: 'hello-world', lang: 'cpp', verdict: 'wrong_answer', passed: 0, total: 2, timeMs: 1, code: 'a failed try' });
    progress.recordSubmission({ slug: 'hello-world', lang: 'cpp', verdict: 'accepted', passed: 2, total: 2, timeMs: 2, code: 'second accepted' });
    progress.recordSubmission({ slug: 'hello-world', lang: 'python', verdict: 'accepted', passed: 2, total: 2, timeMs: 1, code: 'python solution' });
    progress.recordSubmission({ slug: 'sum-of-array', lang: 'cpp', verdict: 'accepted', passed: 9, total: 9, timeMs: 3, code: 'another problem' });
    await progress.flush();
    server.online = true;
    await progress.flush();
    const sent = server.submissions.map((s) => `${s.slug}/${s.lang}: ${s.code}`).sort();
    assert.deepEqual(sent, ['hello-world/cpp: second accepted', 'hello-world/python: python solution', 'sum-of-array/cpp: another problem']);
  });
});

// ---- the browser: drafts ----

test('a draft reaches the account only when it is synced, and only if it changed', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    progress.saveDraft('hello-world', 'python', 'print("a")', 'starter');
    progress.saveDraft('hello-world', 'python', 'print("ab")', 'starter');
    await progress.flush();
    assert.equal(server.calls.filter((c) => c.path === '/api/me/drafts').length, 0, 'typing alone sends nothing');
    progress.syncDrafts();
    await progress.flush();
    const puts = server.calls.filter((c) => c.path === '/api/me/drafts');
    assert.equal(puts.length, 1, 'one draft, the latest text');
    assert.equal(puts[0].body.code, 'print("ab")');
    progress.syncDrafts();
    progress.saveDraft('hello-world', 'python', 'print("ab")', 'starter');   // unchanged
    progress.syncDrafts();
    await progress.flush();
    assert.equal(server.calls.filter((c) => c.path === '/api/me/drafts').length, 1, 'an unchanged draft is not sent again');
  });
});

test('code that is just the starting code is no draft', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    progress.saveDraft('hello-world', 'cpp', 'STARTER', 'STARTER');
    assert.equal(progress.getDraft('hello-world', 'cpp'), null);
    progress.syncDrafts();
    await progress.flush();
    assert.equal(server.calls.filter((c) => c.path === '/api/me/drafts').length, 0);
    progress.saveDraft('hello-world', 'cpp', 'my code', 'STARTER');
    progress.syncDrafts();
    progress.saveDraft('hello-world', 'cpp', 'STARTER', 'STARTER');   // typed back to the start: the draft is removed
    assert.equal(progress.getDraft('hello-world', 'cpp'), null);
    progress.syncDrafts();
    await progress.flush();
    const last = server.calls.filter((c) => c.path === '/api/me/drafts').pop();
    assert.equal(last.body.code, null, 'the account is told the draft is gone');
    assert.equal(Object.keys(server.drafts).length, 0);
  });
});

test('opening a problem on another device brings the newer draft along', async () => {
  await withBrowser(async ({ progress, server, storage }) => {
    server.drafts['sum-of-array:cpp'] = { code: 'from the other device', at: 5000 };
    server.drafts['sum-of-array:python'] = { code: 'old python on the account', at: 100 };
    await progress.load(user('mk001A'));
    storage.setItem('algomashq.draft.sum-of-array.python', JSON.stringify({ code: 'newer python here', at: 9000 }));
    await progress.loadDrafts('sum-of-array');
    assert.equal(progress.getDraft('sum-of-array', 'cpp'), 'from the other device');
    assert.equal(progress.getDraft('sum-of-array', 'python'), 'newer python here', 'the newer copy wins on each side');
    progress.syncDrafts();
    await progress.flush();
    assert.equal(server.drafts['sum-of-array:python'].code, 'newer python here', 'the account learns about it');
  });
});

test('a draft saved by an older version (plain text) still works', async () => {
  await withBrowser(async ({ progress, storage }) => {
    storage.setItem('algomashq.draft.hello-world.python', JSON.stringify('print(1)'));
    await progress.load(user('mk001A'));
    assert.equal(progress.getDraft('hello-world', 'python'), 'print(1)');
  });
});

test('opening a problem is never held up by a slow or broken connection', async () => {
  await withBrowser(async ({ progress, server, storage }) => {
    await progress.load(user('mk001A'));
    storage.setItem('algomashq.draft.hello-world.cpp', JSON.stringify({ code: 'local code', at: 10 }));
    server.online = false;
    const started = Date.now();
    await progress.loadDrafts('hello-world');
    assert.ok(Date.now() - started < 1000);
    assert.equal(progress.getDraft('hello-world', 'cpp'), 'local code');
  });
});

test('a draft the account refuses is dropped; a server error is retried', async () => {
  await withBrowser(async ({ progress, server, storage }) => {
    await progress.load(user('mk001A'));
    server.failDrafts = true;
    progress.saveDraft('hello-world', 'python', 'print(1)', 'S');
    progress.syncDrafts();
    await progress.flush();
    assert.equal(JSON.parse(storage.getItem('algomashq.u.mk001A.queue')).length, 1, 'kept for a retry');
    server.failDrafts = false;
    await progress.flush();
    assert.deepEqual(JSON.parse(storage.getItem('algomashq.u.mk001A.queue')), []);
    assert.equal(server.drafts['hello-world:python'].code, 'print(1)');
    server.refuse = (path) => path === '/api/me/drafts';
    progress.saveDraft('hello-world', 'python', 'print(2)', 'S');
    progress.syncDrafts();
    await progress.flush();
    assert.deepEqual(JSON.parse(storage.getItem('algomashq.u.mk001A.queue')), [], 'refused for good: dropped');
  });
});

test('a problem opens in the language of its newest draft', async () => {
  await withBrowser(async ({ progress, storage }) => {
    await progress.load(user('mk001A'));
    assert.equal(progress.latestDraftLanguage('hello-world'), null);
    storage.setItem('algomashq.draft.hello-world.cpp', JSON.stringify({ code: 'a', at: 100 }));
    storage.setItem('algomashq.draft.hello-world.python', JSON.stringify({ code: 'b', at: 900 }));
    storage.setItem('algomashq.draft.hello-world.java', JSON.stringify('c'));   // an older version: no time, counts as the oldest
    assert.equal(progress.latestDraftLanguage('hello-world'), 'python');
  });
});
