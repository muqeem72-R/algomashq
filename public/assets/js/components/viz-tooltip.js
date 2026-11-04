// The small readout that follows a mark in a chart: the value first, then what it is, then optional detail lines.
// Everything is set with textContent, never as markup. It enhances: every value is also in the table view of its chart.

import { h } from '../dom.js';

export function createTooltip() {
  const value = h('strong', { class: 'viz-tip-value' });
  const label = h('span', { class: 'viz-tip-label' });
  const rows = h('ul', { class: 'viz-tip-rows' });
  const el = h('div', { class: 'viz-tooltip', role: 'tooltip', hidden: true }, value, label, rows);

  // Shows it above `anchor` (below when there is no room above), kept inside the window.
  function show(anchor, { value: main, label: sub, rows: lines = [] }) {
    value.textContent = main;
    label.textContent = sub;
    rows.replaceChildren(...lines.map((line) => h('li', { text: line })));
    el.hidden = false;
    const a = anchor.getBoundingClientRect();
    const t = el.getBoundingClientRect();
    const left = Math.max(8, Math.min(a.left + a.width / 2 - t.width / 2, window.innerWidth - t.width - 8));
    const top = a.top - t.height - 8 >= 8 ? a.top - t.height - 8 : a.bottom + 8;
    el.style.left = `${Math.round(left)}px`;
    el.style.top = `${Math.round(top)}px`;
  }

  const hide = () => { el.hidden = true; };

  // Hover and keyboard focus show the same thing.
  function bind(target, content) {
    target.addEventListener('pointerenter', () => show(target, content()));
    target.addEventListener('pointerleave', hide);
    target.addEventListener('focus', () => show(target, content()));
    target.addEventListener('blur', hide);
  }

  return { el, show, hide, bind };
}
