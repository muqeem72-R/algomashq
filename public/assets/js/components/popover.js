// A small pop-up panel attached to a button. Closes on outside click and Escape.

import { h } from '../dom.js';

let openClose = null;   // closes whichever popover is open, so only one shows at a time

export function popover(button, buildContent, { label = 'Menu' } = {}) {
  const panel = h('div', { class: 'popover', role: 'dialog', 'aria-label': label, hidden: true });
  const wrap = h('div', { class: 'pop-wrap' }, button, panel);

  function close() {
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', onOutside, true);
    document.removeEventListener('keydown', onKey, true);
    if (openClose === close) openClose = null;
  }
  function onOutside(e) { if (!wrap.contains(e.target)) close(); }
  function onKey(e) { if (e.key === 'Escape') { close(); button.focus(); } }

  function open() {
    if (openClose) openClose();
    panel.replaceChildren(buildContent(close));
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    document.addEventListener('pointerdown', onOutside, true);
    document.addEventListener('keydown', onKey, true);
    openClose = close;
  }

  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => (panel.hidden ? open() : close()));
  return { el: wrap, close };
}
