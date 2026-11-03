// How a member looks to others: photo (or letter logo), user id, country, and, in chat, state and language.

import { h } from '../dom.js';
import { LANGUAGES } from '../data/topics.js';
import { avatar } from './avatar.js';

const regions = new Intl.DisplayNames(['en'], { type: 'region' });
export const countryName = (code) => regions.of(code) || code;

// view: a publicView (user id, letter, country, photo) or a chatView (adds state and preferredLanguage).
export function memberCard(view) {
  const language = LANGUAGES.find((l) => l.id === view.preferredLanguage);
  const lines = [h('span', { text: countryName(view.country) })];
  if (view.state) lines.push(h('span', { text: view.state }));
  if (language) lines.push(h('span', { text: 'Codes in ' + language.label }));
  return h('div', { class: 'member-card' },
    avatar(view, 56),
    h('div', { class: 'member-info' },
      h('strong', { class: 'user-id', text: view.userId }),
      h('div', { class: 'member-lines' }, lines)
    )
  );
}
