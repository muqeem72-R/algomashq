import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanEmail, cleanName, cleanState, cleanPhoto, cleanProfile } from '../functions/_lib/validate.js';

const PHOTO = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB';

test('email is trimmed, lower-cased and checked', () => {
  assert.equal(cleanEmail('  Mukeem@Example.COM '), 'mukeem@example.com');
  assert.equal(cleanEmail('not-an-email'), '');
  assert.equal(cleanEmail('a b@c.com'), '');
  assert.equal(cleanEmail('a@b'), '');
});

test('names accept letters from any script, reject digits and symbols', () => {
  assert.equal(cleanName('  Mukeem  ', { required: true }), 'Mukeem');
  assert.equal(cleanName("O'Brien-Smith", { required: true }), "O'Brien-Smith");
  assert.equal(cleanName('मुकीम', { required: true }), 'मुकीम');
  assert.equal(cleanName('R2D2', { required: true }), null);
  assert.equal(cleanName('<script>', { required: true }), null);
  assert.equal(cleanName('', { required: true }), null);
  assert.equal(cleanName('', { required: false }), '');
});

test('state must come from the list for countries that have one', () => {
  assert.equal(cleanState('IN', 'uttar pradesh'), 'Uttar Pradesh');
  assert.equal(cleanState('IN', 'Atlantis'), null);
  assert.equal(cleanState('FR', 'Île-de-France'), 'Île-de-France');
  assert.equal(cleanState('FR', 'x'), null);
});

test('photo must be a small JPEG data URL', () => {
  assert.ok(cleanPhoto(PHOTO));
  assert.equal(cleanPhoto('data:image/png;base64,iVBORw0KGgo='), null);
  assert.equal(cleanPhoto('data:image/jpeg;base64,AAAA'), null);
  assert.equal(cleanPhoto('data:image/jpeg;base64,/9j/' + 'A'.repeat(200000)), null);
  assert.equal(cleanPhoto(42), null);
});

test('profile: last name is optional, everything else is checked', () => {
  const ok = cleanProfile({ firstName: 'Shaan', lastName: '', country: 'in', state: 'Delhi', language: 'java', photo: PHOTO });
  assert.equal(ok.errors, undefined);
  assert.equal(ok.value.country, 'IN');
  assert.equal(ok.value.language, 'java');

  const bad = cleanProfile({ firstName: '', country: 'ZZ', state: '', photo: '' });
  assert.deepEqual(Object.keys(bad.errors).sort(), ['country', 'firstName']);
});

test('profile: the photo is optional, but a broken one is refused', () => {
  const none = cleanProfile({ firstName: 'Shaan', country: 'IN', state: 'Delhi', photo: '' });
  assert.equal(none.errors, undefined);
  assert.equal(none.value.photo, null);

  const broken = cleanProfile({ firstName: 'Shaan', country: 'IN', state: 'Delhi', photo: 'data:image/png;base64,AAAA' });
  assert.deepEqual(Object.keys(broken.errors), ['photo']);
});
