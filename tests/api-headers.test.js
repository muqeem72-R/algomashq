// Every answer of the API carries the protective headers, also when something inside it breaks.
import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/_middleware.js';

const run = (next, env = {}) => onRequest({ env, next, waitUntil() {} });

test('an ordinary answer is never cached, never sniffed, never framed and never shared with other sites', async () => {
  const res = await run(async () => new Response('{}', { status: 200 }));
  assert.equal(res.headers.get('Cache-Control'), 'no-store');
  assert.equal(res.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(res.headers.get('X-Frame-Options'), 'DENY');
  assert.equal(res.headers.get('Cross-Origin-Resource-Policy'), 'same-origin');
  assert.equal(res.headers.get('Referrer-Policy'), 'no-referrer');
  assert.match(res.headers.get('Content-Security-Policy'), /default-src 'none'/);
  assert.match(res.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
});

test('an answer that chose its own cache rule keeps it (a photo may be cached by the browser)', async () => {
  const res = await run(async () => new Response('x', { headers: { 'Cache-Control': 'private, max-age=60' } }));
  assert.equal(res.headers.get('Cache-Control'), 'private, max-age=60');
});

test('an unexpected error becomes a clean 500 without details, and still has the headers', async () => {
  const original = console.error;
  console.error = () => {};
  try {
    const res = await run(async () => { throw new Error('secret detail: password=hunter2'); });
    assert.equal(res.status, 500);
    const text = await res.text();
    assert.ok(!text.includes('hunter2') && !text.includes('secret'), 'the answer must not leak the error');
    assert.equal(JSON.parse(text).error, 'server_error');
    assert.equal(res.headers.get('X-Content-Type-Options'), 'nosniff');
    assert.equal(res.headers.get('Cache-Control'), 'no-store');
  } finally {
    console.error = original;
  }
});

test('an error is counted for the admin page when a database is there, and a missing one does not break the answer', async () => {
  const seen = [];
  const db = { prepare: (sql) => ({ bind: (...args) => ({ run: async () => { seen.push([sql, args]); } }) }) };
  const original = console.error;
  console.error = () => {};
  try {
    const res = await onRequest({ env: { DB: db }, next: async () => { throw new Error('x'); }, waitUntil: (p) => p });
    assert.equal(res.status, 500);
    await new Promise((r) => setTimeout(r, 10));
    assert.ok(seen.some(([sql, args]) => /daily_stats/.test(sql) && args.includes('server_error')), 'server_error was not counted');
    const noDb = await onRequest({ env: {}, next: async () => { throw new Error('x'); }, waitUntil() {} });
    assert.equal(noDb.status, 500);
  } finally {
    console.error = original;
  }
});
