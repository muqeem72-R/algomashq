import test from 'node:test';
import assert from 'node:assert/strict';
import { publicView, chatView, selfView, displayInitial } from '../functions/_lib/users.js';

const row = {
  user_id: 'mk001A', first_name: 'Mukeem', last_name: 'Khan', email: 'mukeem@example.com',
  country: 'IN', state: 'Delhi', preferred_language: 'cpp', tour_done: 0, created_at: 1700000000000, photo_v: 5
};

test('public view: user id, letter, country and photo only', () => {
  const view = publicView(row);
  assert.deepEqual(Object.keys(view).sort(), ['country', 'initial', 'photoVersion', 'userId']);
  assert.equal(view.userId, 'mk001A');
  assert.equal(view.initial, 'M');
  assert.equal(view.country, 'IN');
  assert.equal(view.photoVersion, 5);
});

test('chat view adds state and preferred language, still no name or email', () => {
  const view = chatView(row);
  assert.deepEqual(Object.keys(view).sort(), ['country', 'initial', 'photoVersion', 'preferredLanguage', 'state', 'userId']);
  assert.equal(view.state, 'Delhi');
  assert.equal(view.preferredLanguage, 'cpp');
  assert.ok(!JSON.stringify(view).includes('mukeem@example.com'));
  assert.ok(!JSON.stringify(view).includes('Khan'));
});

test('self view has everything', () => {
  const view = selfView(row);
  assert.equal(view.email, 'mukeem@example.com');
  assert.equal(view.firstName, 'Mukeem');
  assert.equal(view.lastName, 'Khan');
  assert.equal(view.state, 'Delhi');
  assert.equal(view.tourDone, false);
});

test('a member without a photo has a null photo version', () => {
  assert.equal(publicView({ ...row, photo_v: null }).photoVersion, null);
  assert.equal(publicView({ ...row, photo_v: undefined }).photoVersion, null);
});

test('the letter logo uses the first letter of the first name', () => {
  assert.equal(displayInitial('mukeem'), 'M');
  assert.equal(displayInitial('  élan'), 'É');
  assert.equal(displayInitial('मुकीम'), 'म');
  assert.equal(displayInitial(''), '?');
});
