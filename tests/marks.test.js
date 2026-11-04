// Bookmarks and notes: the checks the server makes, and how the browser keeps them in step with the account.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanBookmark, cleanNote, NOTE_MAX } from '../functions/_lib/marks.js';
import { withBrowser } from './helpers/browser-fakes.js';

const SLUGS = new Set(['hello-world', 'sum-of-array']);
const NOW = Date.UTC(2026, 5, 1);
const user = (id) => ({ userId: id });

// ---- the server's checks ----

test('a bookmark needs a real problem and true or false', () => {
  assert.deepEqual(cleanBookmark({ slug: 'hello-world', marked: true, at: NOW - 5 }, SLUGS, NOW), { slug: 'hello-world', marked: 1, at: NOW - 5 });
  assert.deepEqual(cleanBookmark({ slug: 'hello-world', marked: false }, SLUGS, NOW), { slug: 'hello-world', marked: 0, at: NOW });
  assert.equal(cleanBookmark({ slug: 'hello-world', marked: 1 }, SLUGS, NOW), null, 'a number is not true or false');
  assert.equal(cleanBookmark({ slug: 'hello-world', marked: 'yes' }, SLUGS, NOW), null);
  assert.equal(cleanBookmark({ slug: 'hello-world' }, SLUGS, NOW), null);
  assert.equal(cleanBookmark({ slug: 'nope', marked: true }, SLUGS, NOW), null);
  assert.equal(cleanBookmark(null, SLUGS, NOW), null);
});

test('a note is at most 500 characters of plain text', () => {
  assert.equal(NOTE_MAX, 500);
  assert.equal(cleanNote({ slug: 'hello-world', body: 'x'.repeat(500) }, SLUGS, NOW).body.length, 500);
  assert.equal(cleanNote({ slug: 'hello-world', body: 'x'.repeat(501) }, SLUGS, NOW), null, 'one character too many is refused');
  assert.equal(cleanNote({ slug: 'hello-world', body: 42 }, SLUGS, NOW), null);
  assert.equal(cleanNote({ slug: 'hello-world' }, SLUGS, NOW), null);
  assert.equal(cleanNote({ slug: 'nope', body: 'x' }, SLUGS, NOW), null);
  assert.equal(cleanNote(null, SLUGS, NOW), null);
});

test('a note keeps its line breaks, loses control characters, and nothing but spaces means no note', () => {
  assert.equal(cleanNote({ slug: 'hello-world', body: 'one\r\ntwo\rthree' }, SLUGS, NOW).body, 'one\ntwo\nthree');
  assert.equal(cleanNote({ slug: 'hello-world', body: 'a\u0000b\u0007c\td' }, SLUGS, NOW).body, 'abc\td');
  assert.equal(cleanNote({ slug: 'hello-world', body: '   \n\t  ' }, SLUGS, NOW).body, '');
  assert.equal(cleanNote({ slug: 'hello-world', body: '' }, SLUGS, NOW).body, '', 'an empty body removes the note');
  assert.equal(cleanNote({ slug: 'hello-world', body: '<b>not markup</b>' }, SLUGS, NOW).body, '<b>not markup</b>', 'text stays text');
});

test('the time of a bookmark or a note must be believable', () => {
  assert.equal(cleanNote({ slug: 'hello-world', body: 'x', at: NOW + 7 * 24 * 3600 * 1000 }, SLUGS, NOW).at, NOW);
  assert.equal(cleanNote({ slug: 'hello-world', body: 'x', at: NOW - 1000 }, SLUGS, NOW).at, NOW - 1000);
  assert.equal(cleanBookmark({ slug: 'hello-world', marked: true, at: 5 }, SLUGS, NOW).at, NOW);
});

// ---- the browser: bookmarks ----

test('a bookmark shows at once and reaches the account', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    assert.equal(progress.isBookmarked('hello-world'), false);
    assert.equal(progress.setBookmark('hello-world', true), true);
    assert.ok(progress.isBookmarked('hello-world'));
    assert.ok(progress.bookmarkedSlugs().has('hello-world'));
    await progress.flush();
    assert.equal(server.bookmarks['hello-world'].marked, true);
    const calls = server.calls.filter((c) => c.path === '/api/me/bookmarks').length;
    progress.setBookmark('hello-world', true);   // already so: nothing to send
    await progress.flush();
    assert.equal(server.calls.filter((c) => c.path === '/api/me/bookmarks').length, calls);
    progress.setBookmark('hello-world', false);
    await progress.flush();
    assert.equal(server.bookmarks['hello-world'].marked, false);
  });
});

test('several toggles while offline are sent as one: the last', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    server.online = false;
    progress.setBookmark('hello-world', true);
    progress.setBookmark('hello-world', false);
    progress.setBookmark('hello-world', true);
    progress.setBookmark('sum-of-array', true);
    await progress.flush();
    server.online = true;
    const before = server.calls.length;
    await progress.flush();
    assert.equal(server.calls.slice(before).filter((c) => c.path === '/api/me/bookmarks').length, 2, 'one call per problem, not one per toggle');
    assert.equal(server.bookmarks['hello-world'].marked, true);
    assert.equal(server.bookmarks['sum-of-array'].marked, true);
  });
});

test('the account decides, but changes still waiting to be sent are not lost', async () => {
  await withBrowser(async ({ progress, server }) => {
    server.bookmarks['sum-of-array'] = { marked: true, at: 5000 };
    await progress.load(user('mk001A'));
    assert.deepEqual([...progress.bookmarkedSlugs()], ['sum-of-array'], 'a bookmark made on another device appears');
    server.online = false;
    progress.setBookmark('hello-world', true);
    progress.setBookmark('sum-of-array', false);
    server.online = true;
    progress.reset();
    await progress.load(user('mk001A'));
    assert.ok(progress.isBookmarked('hello-world'), 'the unsent bookmark is still there');
    assert.ok(!progress.isBookmarked('sum-of-array'), 'and so is the unsent removal');
    await progress.flush();
    assert.equal(server.bookmarks['hello-world'].marked, true);
    assert.equal(server.bookmarks['sum-of-array'].marked, false);
  });
});

test('a bookmark removed on another device disappears here', async () => {
  await withBrowser(async ({ progress, server }) => {
    server.bookmarks['hello-world'] = { marked: true, at: 1000 };
    await progress.load(user('mk001A'));
    assert.ok(progress.isBookmarked('hello-world'));
    server.bookmarks['hello-world'] = { marked: false, at: 2000 };
    progress.reset();
    await progress.load(user('mk001A'));
    assert.ok(!progress.isBookmarked('hello-world'));
  });
});

// ---- the browser: notes ----

test('a note is kept at once, listed, and sent to the account', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    assert.equal(progress.getNote('hello-world'), '');
    assert.ok(!progress.hasNote('hello-world'));
    progress.saveNote('hello-world', 'use a while loop, not for');
    assert.equal(progress.getNote('hello-world'), 'use a while loop, not for');
    assert.ok(progress.hasNote('hello-world'));
    assert.ok(progress.noteSlugSet().has('hello-world'));
    await progress.flush();
    assert.equal(server.notes['hello-world'].body, 'use a while loop, not for');
    const calls = server.calls.filter((c) => c.path === '/api/me/notes').length;
    progress.saveNote('hello-world', 'use a while loop, not for');   // unchanged
    await progress.flush();
    assert.equal(server.calls.filter((c) => c.path === '/api/me/notes').length, calls, 'an unchanged note is not sent again');
  });
});

test('a note is cut to 500 characters, and an emptied note is removed', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    progress.saveNote('hello-world', 'z'.repeat(900));
    assert.equal(progress.getNote('hello-world').length, 500);
    await progress.flush();
    assert.equal(server.notes['hello-world'].body.length, 500);
    progress.saveNote('hello-world', '   \n ');
    assert.equal(progress.getNote('hello-world'), '');
    assert.ok(!progress.hasNote('hello-world'));
    await progress.flush();
    assert.equal(server.notes['hello-world'].body, '', 'the account keeps an empty note, so an old copy cannot bring it back');
  });
});

test('a note written offline waits and is sent later', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    server.online = false;
    progress.saveNote('sum-of-array', 'remember overflow');
    await progress.flush();
    assert.ok(progress.hasNote('sum-of-array'));
    server.online = true;
    progress.reset();
    await progress.load(user('mk001A'));
    assert.ok(progress.hasNote('sum-of-array'), 'still listed after a reload');
    await progress.flush();
    assert.equal(server.notes['sum-of-array'].body, 'remember overflow');
  });
});

test('opening a problem brings the newer note along; the older side learns about it', async () => {
  await withBrowser(async ({ progress, server, storage }) => {
    server.notes['hello-world'] = { body: 'written on my phone', at: 5000 };
    server.notes['sum-of-array'] = { body: 'old text on the account', at: 100 };
    await progress.load(user('mk001A'));
    storage.setItem('algomashq.u.mk001A.note.sum-of-array', JSON.stringify({ body: 'newer text here', at: 9000 }));
    await progress.loadNote('hello-world');
    await progress.loadNote('sum-of-array');
    assert.equal(progress.getNote('hello-world'), 'written on my phone');
    assert.ok(progress.hasNote('hello-world'));
    assert.equal(progress.getNote('sum-of-array'), 'newer text here');
    await progress.flush();
    assert.equal(server.notes['sum-of-array'].body, 'newer text here');
  });
});

test('a note emptied on another device does not come back from an old copy', async () => {
  await withBrowser(async ({ progress, server, storage }) => {
    await progress.load(user('mk001A'));
    storage.setItem('algomashq.u.mk001A.note.hello-world', JSON.stringify({ body: 'old text', at: 1000 }));
    server.notes['hello-world'] = { body: '', at: 2000 };
    await progress.loadNote('hello-world');
    assert.equal(progress.getNote('hello-world'), '');
    assert.ok(!progress.hasNote('hello-world'));
    await progress.flush();
    assert.equal(server.notes['hello-world'].body, '', 'the account is not overwritten by the old copy');
  });
});

test('opening a problem is never held up by a broken connection, and the saved note is used', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    progress.saveNote('hello-world', 'kept here');
    await progress.flush();
    server.online = false;
    const started = Date.now();
    await progress.loadNote('hello-world');
    assert.ok(Date.now() - started < 1000);
    assert.equal(progress.getNote('hello-world'), 'kept here');
  });
});

test('two accounts in one browser keep separate notes and bookmarks', async () => {
  await withBrowser(async ({ progress, server }) => {
    await progress.load(user('mk001A'));
    progress.saveNote('hello-world', 'mine');
    progress.setBookmark('hello-world', true);
    await progress.flush();
    progress.reset();
    server.notes = {};
    server.bookmarks = {};
    await progress.load(user('s002A'));
    assert.equal(progress.getNote('hello-world'), '');
    assert.ok(!progress.isBookmarked('hello-world'));
    assert.ok(!progress.hasNote('hello-world'));
  });
});
