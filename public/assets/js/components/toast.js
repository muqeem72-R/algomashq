// A short message at the bottom of the screen.

import { h } from '../dom.js';

let timer = null;

export function toast(message) {
  document.querySelectorAll('.toast').forEach((n) => n.remove());
  const node = h('div', { class: 'toast', role: 'status', text: message });
  document.body.append(node);
  clearTimeout(timer);
  timer = setTimeout(() => node.remove(), 2600);
}
