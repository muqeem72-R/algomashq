// A round profile picture. A member without a photo gets a letter logo: the first letter of their
// first name on a color that is always the same for that member.

import { h } from '../dom.js';

// Each letter has its own color, and it is always the same one: the "Z" shown while someone signs up
// is the same "Z" they keep afterwards. The golden angle spreads the 26 letters evenly around the color wheel.
export function hueFor(letter) {
  const code = String(letter).toLocaleUpperCase().codePointAt(0) || 0;
  return Math.round((code * 137.508) % 360);
}

function paintLetter(box, letter, size) {
  box.style.background = `hsl(${hueFor(letter)} 52% 34%)`;
  box.style.color = '#ffffff';
  if (size) box.style.fontSize = Math.round(size * 0.44) + 'px';
  box.replaceChildren(letter);
}

// A letter logo with no member behind it yet (used while someone is still signing up).
export function letterAvatar(letter, size) {
  const box = h('span', { class: 'avatar' });
  if (size) { box.style.width = size + 'px'; box.style.height = size + 'px'; }
  paintLetter(box, (letter || '?').toLocaleUpperCase(), size);
  return box;
}

// member: { userId, initial, photoVersion }. Works for yourself and for other members.
export function avatar(member, size) {
  const letter = member.initial || '?';
  const box = h('span', { class: 'avatar' });
  if (size) { box.style.width = size + 'px'; box.style.height = size + 'px'; }
  if (member.photoVersion && member.userId) {
    const img = h('img', { src: `/api/users/${encodeURIComponent(member.userId)}/photo?v=${member.photoVersion}`, alt: '' });
    img.addEventListener('error', () => paintLetter(box, letter, size));
    box.append(img);
  } else {
    paintLetter(box, letter, size);
  }
  return box;
}
