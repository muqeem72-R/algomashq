// Small charts for the Admin page, made the same way as the weekly chart of the Progress page:
//   one hue (the accent), marks at most 24px thick with a 4px rounded end on a square baseline, hairline gridlines, text in
//   text colors, a readout on hover AND on keyboard focus, and a table view that holds the same numbers.
// Every label comes from data, so everything is set with textContent, never as markup.

import { h } from '../dom.js';

const NS = 'http://www.w3.org/2000/svg';

export function svg(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  for (const kid of kids) el.append(kid instanceof Node ? kid : document.createTextNode(kid));
  return el;
}

export const plural = (n, one, many) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

// "2026-11-06" -> "6 Nov" (the day key is a UTC date, so it is formatted in UTC)
export const shortDay = (key) => new Date(key + 'T00:00:00Z').toLocaleDateString(undefined, { timeZone: 'UTC', day: 'numeric', month: 'short' });
export const longDay = (key) => new Date(key + 'T00:00:00Z').toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

// A clean top for the y axis: 4, 8, 12 for small numbers, then 1/2/5 times a power of ten.
export function niceCeiling(max) {
  if (max <= 4) return 4;
  if (max <= 12) return Math.ceil(max / 4) * 4;
  const power = 10 ** Math.floor(Math.log10(max));
  for (const step of [1, 2, 4, 5, 10]) if (max <= step * power) return step * power;
  return 10 * power;
}

// A table under a chart with the same numbers.
export function tableView(summary, head, rows) {
  return h('details', { class: 'viz-table' },
    h('summary', { text: summary }),
    h('table', null,
      h('thead', null, h('tr', null, head.map((t) => h('th', { text: t })))),
      h('tbody', null, rows.map((cells) => h('tr', null, cells.map((c) => h('td', { text: String(c) })))))));
}

// One column per day. days: ['2026-10-08', ...]; values: numbers of the same length. `noun` is [one, many], for example
// ['sign-up', 'sign-ups']. tip is a createTooltip() the page owns. Returns the element.
export function columnChart({ days, values, noun, tip, ariaLabel }) {
  const max = Math.max(0, ...values);
  const ceiling = niceCeiling(max);
  const W = 640, H = 200, L = 34, R = 8, T = 18, B = 30;
  const plotW = W - L - R, plotH = H - T - B, slot = plotW / days.length, barW = Math.min(24, slot * 0.62);
  const yOf = (v) => T + plotH - (v / ceiling) * plotH;
  const chart = svg('svg', { class: 'viz-chart', viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': ariaLabel });

  for (const tick of [0, ceiling / 2, ceiling]) {
    chart.append(svg('line', { class: 'viz-grid', x1: L, x2: W - R, y1: yOf(tick), y2: yOf(tick) }));
    chart.append(svg('text', { class: 'viz-axis', x: L - 8, y: yOf(tick) + 4, 'text-anchor': 'end' }, String(tick)));
  }
  // Label only the highest day (the first one if several tie); the axis, the readout and the table carry the rest.
  const peak = max > 0 ? values.indexOf(max) : -1;
  days.forEach((day, i) => {
    const v = values[i];
    const x = L + i * slot + (slot - barW) / 2;
    const what = plural(v, noun[0], noun[1]);
    const slotEl = svg('g', { class: 'viz-slot', tabindex: '0', role: 'img', 'aria-label': `${longDay(day)}: ${what}` },
      svg('rect', { class: 'viz-hit', x: L + i * slot, y: T - 6, width: slot, height: plotH + B + 6 - 8 }));
    if (v > 0) {
      const r = Math.min(4, (v / ceiling) * plotH);
      const top = yOf(v);
      slotEl.append(svg('path', { class: 'viz-bar', d: `M${x},${yOf(0)} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${yOf(0)} Z` }));
      if (i === peak) slotEl.append(svg('text', { class: 'viz-value', x: x + barW / 2, y: top - 6, 'text-anchor': 'middle' }, String(v)));
    }
    if (i === 0 || i === days.length - 1 || i === Math.floor((days.length - 1) / 2)) {
      slotEl.append(svg('text', { class: 'viz-axis', x: x + barW / 2, y: H - 10, 'text-anchor': i === 0 ? 'start' : i === days.length - 1 ? 'end' : 'middle' }, shortDay(day)));
    }
    tip.bind(slotEl, () => ({ value: what, label: longDay(day), rows: [] }));
    chart.append(slotEl);
  });
  return chart;
}

// Horizontal bars, largest first, one hue: for ranking things that have names (countries, problems, ways to sign in).
// rows: [{ label, value, note? }]. The value is printed at the tip of its bar.
export function rankedBars({ rows, noun, tip, empty = 'Nothing yet.' }) {
  if (!rows.length) return h('p', { class: 'muted', text: empty });
  const max = Math.max(1, ...rows.map((r) => r.value));
  return h('ul', { class: 'rbars' }, rows.map((r) => {
    const fill = h('span', { class: 'rbar-fill' });
    fill.style.width = `${Math.max(2, Math.round((r.value / max) * 100))}%`;   // set through the style object: allowed under the site's CSP
    const li = h('li', { class: 'rbar', tabindex: '0' },
      h('span', { class: 'rbar-label', text: r.label }),
      h('span', { class: 'rbar-track', 'aria-hidden': 'true' }, fill),
      h('span', { class: 'rbar-value', text: r.value.toLocaleString() }));
    li.setAttribute('aria-label', `${r.label}: ${plural(r.value, noun[0], noun[1])}${r.note ? `, ${r.note}` : ''}`);
    tip.bind(li, () => ({ value: plural(r.value, noun[0], noun[1]), label: r.label, rows: r.note ? [r.note] : [] }));
    return li;
  }));
}

// A headline number: the value is the strong element, the label follows, an optional line says more.
export function statTile({ label, value, hint }) {
  return h('div', { class: 'card stat-tile' },
    h('div', { class: 'stat-label', text: label }),
    h('div', { class: 'stat-value', text: typeof value === 'number' ? value.toLocaleString() : value }),
    hint ? h('div', { class: 'stat-hint', text: hint }) : null);
}
