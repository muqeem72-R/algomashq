// The admin page and account removal: who is an admin, what the analytics may count, and that deleting an account
// leaves nothing of the member behind.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminEmails, isAdminEmail } from '../functions/_lib/admin.js';
import { USER_TABLES } from '../functions/_lib/accounts.js';
import { CLIENT_EVENTS, lastDays } from '../functions/_lib/stats.js';
import { selfView } from '../functions/_lib/users.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schema = fs.readFileSync(path.join(ROOT, 'db/schema.sql'), 'utf8');

test('admins are named by email in one setting; case and separators do not matter', () => {
  const env = { ADMIN_EMAILS: ' Owner@Example.com, second@example.com;third@example.com\n' };
  assert.deepEqual(adminEmails(env), ['owner@example.com', 'second@example.com', 'third@example.com']);
  assert.equal(isAdminEmail(env, 'OWNER@example.com'), true);
  assert.equal(isAdminEmail(env, 'someone@example.com'), false);
});

test('with no setting there is no admin, and an empty email is never an admin', () => {
  assert.deepEqual(adminEmails({}), []);
  assert.equal(isAdminEmail({}, 'owner@example.com'), false);
  assert.equal(isAdminEmail({ ADMIN_EMAILS: ',,' }, ''), false);
  assert.equal(isAdminEmail({ ADMIN_EMAILS: 'a@b.co' }, undefined), false);
});

test('the self view says whether to show the admin link, and is off unless asked', () => {
  const row = { user_id: 'mk001A', first_name: 'Mukeem', last_name: 'Khan', email: 'x@y.co', country: 'IN', state: 'Delhi', preferred_language: 'cpp', tour_done: 0, created_at: 1 };
  assert.equal(selfView(row).isAdmin, false);
  assert.equal(selfView(row, { isAdmin: true }).isAdmin, true);
});

test('deleting an account covers every table that holds a member\'s rows', () => {
  // Every table of schema.sql with a user_id column (except users itself) must be in the deletion list.
  const withUserId = [];
  for (const match of schema.matchAll(/CREATE TABLE IF NOT EXISTS (\w+) \(([\s\S]*?)\n\);/g)) {
    if (/^\s*user_id\s/m.test(match[2]) && match[1] !== 'users') withUserId.push(match[1]);
  }
  assert.ok(withUserId.length >= 8, 'the schema was not read');
  for (const table of withUserId) {
    if (table === 'admin_log') continue;   // the record of what admins did: it keeps the id of the admin, not of a member's data
    assert.ok(USER_TABLES.includes(table), `${table} has a user_id column but is not removed with the account`);
  }
  for (const table of USER_TABLES) assert.ok(schema.includes(`CREATE TABLE IF NOT EXISTS ${table} `), `${table} is not a table`);
});

test('the browser can report only the events on the list, and the list has no duplicates', () => {
  assert.equal(new Set(CLIENT_EVENTS).size, CLIENT_EVENTS.length);
  for (const kind of CLIENT_EVENTS) assert.match(kind, /^[a-z_]+$/);
  assert.ok(CLIENT_EVENTS.includes('google_script_failed'));
});

test('the chart days are consecutive UTC days ending today', () => {
  const days = lastDays(5, Date.UTC(2026, 2, 3, 23, 59));
  assert.deepEqual(days, ['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02', '2026-03-03']);
});

test('the schema makes one Google account belong to one member', () => {
  assert.match(schema, /CREATE TABLE IF NOT EXISTS identities[\s\S]*PRIMARY KEY \(provider, subject\)/);
});
