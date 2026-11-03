import test from 'node:test';
import assert from 'node:assert/strict';
import { makeUserId, toLetters, initial, USER_ID_RE } from '../functions/_lib/users.js';

test('first user is mk001A and a single-name user gets one initial', () => {
  assert.equal(makeUserId('Mukeem', 'Khan', 1), 'mk001A');
  assert.equal(makeUserId('shaan', '', 2), 's002A');
});

test('numbers run 001-999 then restart while the letter moves on', () => {
  assert.equal(makeUserId('Mukeem', 'Khan', 999), 'mk999A');
  assert.equal(makeUserId('Mukeem', 'Khan', 1000), 'mk001B');
  assert.equal(makeUserId('Mukeem', 'Khan', 1998), 'mk999B');
  assert.equal(makeUserId('Mukeem', 'Khan', 1999), 'mk001C');
});

test('letters continue past Z like spreadsheet columns', () => {
  assert.equal(toLetters(1), 'A');
  assert.equal(toLetters(26), 'Z');
  assert.equal(toLetters(27), 'AA');
  assert.equal(toLetters(28), 'AB');
  assert.equal(toLetters(52), 'AZ');
  assert.equal(toLetters(53), 'BA');
  assert.equal(makeUserId('A', 'B', 999 * 26 + 1), 'ab001AA');
});

test('initials ignore case, accents and non-Latin names', () => {
  assert.equal(initial('Émile'), 'e');
  assert.equal(initial('  zara'), 'z');
  assert.equal(initial('मुकीम'), '');
  assert.equal(makeUserId('मुकीम', '', 5), 'u005A');
  assert.equal(makeUserId('मुकीम', 'Khan', 5), 'k005A');
});

test('ids never repeat and always match the id format', () => {
  const seen = new Set();
  for (let seq = 1; seq <= 60000; seq++) {
    const id = makeUserId('Ann', 'Lee', seq);
    assert.ok(USER_ID_RE.test(id), id);
    assert.ok(!seen.has(id), 'duplicate ' + id);
    seen.add(id);
  }
});
