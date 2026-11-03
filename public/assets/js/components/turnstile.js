// Cloudflare Turnstile widget: a free "are you human" check that replaces captchas.
// Docs: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/

import { h } from '../dom.js';

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading = null;

function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { loading = null; reject(new Error('turnstile_script_failed')); };
      document.head.append(s);
    });
  }
  return loading;
}

// quiet = true shows the widget only when Cloudflare needs the visitor to interact.
// Returns { el, token(), reset(), destroy() }.
export function createTurnstile(siteKey, { quiet = false, onChange } = {}) {
  const el = h('div', { class: quiet ? 'turnstile quiet' : 'turnstile' });
  let token = '';
  let widgetId = null;
  let destroyed = false;

  const setToken = (value) => { token = value; if (onChange) onChange(!!token); };

  if (!siteKey) {
    el.append(h('p', { class: 'alert alert-error', role: 'alert', text: 'The human check is not set up on this server yet.' }));
  } else {
    loadScript().then(() => {
      if (destroyed) return;
      widgetId = window.turnstile.render(el, {
        sitekey: siteKey,
        theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
        appearance: quiet ? 'interaction-only' : 'always',
        callback: (value) => setToken(value),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken('')
      });
    }).catch(() => {
      el.replaceChildren(h('p', { class: 'alert alert-error', role: 'alert', text: 'The human check could not load. Check your connection and reload the page.' }));
    });
  }

  return {
    el,
    token: () => token,
    reset() {
      setToken('');
      if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
    },
    destroy() {
      destroyed = true;
      if (widgetId !== null && window.turnstile) { try { window.turnstile.remove(widgetId); } catch (e) { /* already gone */ } }
    }
  };
}
