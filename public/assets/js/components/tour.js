// A short guided tour that highlights parts of the page one by one.
// Shown once to a new member; it can be replayed from Settings.

import { h } from '../dom.js';

const GAP = 14;
const CARD_W = 340;

// steps: [{ target: CSS selector or null, title, body }]. Calls onDone(completed) when it ends.
export function startTour(steps, onDone) {
  const spot = h('div', { class: 'tour-spot', 'aria-hidden': 'true' });
  const stepLabel = h('div', { class: 'tour-step' });
  const title = h('h3', { id: 'tour-title' });
  const body = h('p');
  const dots = h('div', { class: 'tour-dots', 'aria-hidden': 'true' });
  const skip = h('button', { class: 'btn btn-link', type: 'button', text: 'Skip tour' });
  const back = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Back' });
  const next = h('button', { class: 'btn btn-primary btn-sm', type: 'button' });
  const card = h('div', { class: 'tour-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tour-title' },
    stepLabel, title, body,
    h('div', { class: 'tour-foot' }, dots, h('div', { class: 'tour-buttons' }, skip, back, next))
  );
  const layer = h('div', { class: 'tour' }, spot, card);
  let index = 0;
  let finished = false;

  function place() {
    const step = steps[index];
    const target = step.target ? document.querySelector(step.target) : null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardH = card.offsetHeight;
    if (!target) {
      spot.classList.add('is-center');
      for (const [k, v] of Object.entries({ top: vh / 2 + 'px', left: vw / 2 + 'px', width: '0px', height: '0px' })) spot.style[k] = v;
      card.style.top = Math.max(16, (vh - cardH) / 2) + 'px';
      card.style.left = Math.max(16, (vw - CARD_W) / 2) + 'px';
      return;
    }
    const r = target.getBoundingClientRect();
    spot.classList.remove('is-center');
    const pad = 6;
    spot.style.top = r.top - pad + 'px';
    spot.style.left = r.left - pad + 'px';
    spot.style.width = r.width + pad * 2 + 'px';
    spot.style.height = r.height + pad * 2 + 'px';

    // Prefer the right of the target, then below it, then the left.
    let top = r.top;
    let left = r.right + GAP + pad;
    if (left + CARD_W > vw - 16) {
      left = Math.min(r.left, vw - CARD_W - 16);
      top = r.bottom + GAP + pad;
      if (top + cardH > vh - 16) { top = r.top - cardH - GAP - pad; left = Math.max(16, r.left - CARD_W - GAP - pad); }
    }
    card.style.top = Math.max(16, Math.min(top, vh - cardH - 16)) + 'px';
    card.style.left = Math.max(16, left) + 'px';
  }

  function render() {
    const step = steps[index];
    stepLabel.textContent = `Step ${index + 1} of ${steps.length}`;
    title.textContent = step.title;
    body.textContent = step.body;
    back.hidden = index === 0;
    skip.hidden = index === steps.length - 1;
    next.textContent = index === steps.length - 1 ? 'Finish' : 'Next';
    dots.replaceChildren(...steps.map((_, i) => h('i', { class: i === index ? 'on' : '' })));
    const target = step.target ? document.querySelector(step.target) : null;
    if (target) target.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    place();
    next.focus();
  }

  function finish(completed) {
    if (finished) return;
    finished = true;
    window.removeEventListener('resize', place);
    document.removeEventListener('keydown', onKey, true);
    layer.remove();
    if (onDone) onDone(completed);
  }
  function go(delta) {
    const to = index + delta;
    if (to < 0) return;
    if (to >= steps.length) { finish(true); return; }
    index = to;
    render();
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Tab') {   // keep keyboard focus inside the tour card
      const focusable = [skip, back, next].filter((b) => !b.hidden);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  next.addEventListener('click', () => go(1));
  back.addEventListener('click', () => go(-1));
  skip.addEventListener('click', () => finish(false));
  window.addEventListener('resize', place);
  document.addEventListener('keydown', onKey, true);
  document.body.append(layer);
  render();
  return { stop: () => finish(false) };
}
