// "Continue with Google" button, drawn by Google's own script (Google Identity Services).
// Docs: https://developers.google.com/identity/gsi/web/guides/display-button
//
// Google decides who the person is and hands us a signed token (the "credential"); the server checks it. Anything can go
// wrong on the way (the script is blocked by an extension, the network is slow, the pop-up is blocked), and some of it is
// invisible to us, so this component only reports what it CAN see and the login page always keeps the email code next to it.

import { h } from '../dom.js';

const SCRIPT = 'https://accounts.google.com/gsi/client';
const SLOW_MS = 8000;

let loading = null;
let initializedFor = '';
let currentHandler = null;

function loadScript() {
  if (window.google && window.google.accounts && window.google.accounts.id) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => { loading = null; reject(new Error('google_script_failed')); };
      document.head.append(s);
    });
  }
  return loading;
}

// onCredential(credential)   Google gave a token
// onState(state)             'loading' | 'ready' | 'slow' | 'failed'  (the page uses it to show a hint)
// Returns { el, destroy() }.
export function createGoogleButton({ clientId, onCredential, onState }) {
  const el = h('div', { class: 'google-button' });
  let destroyed = false;
  let ready = false;
  const state = (value) => { if (!destroyed && onState) onState(value); };

  state('loading');
  const slowTimer = setTimeout(() => { if (!ready) state('slow'); }, SLOW_MS);

  loadScript().then(() => {
    if (destroyed) return;
    const id = window.google.accounts.id;
    currentHandler = (response) => { if (response && response.credential) onCredential(response.credential); };
    if (initializedFor !== clientId) {
      id.initialize({
        client_id: clientId,
        callback: (response) => { if (currentHandler) currentHandler(response); },
        auto_select: false,
        cancel_on_tap_outside: true
      });
      initializedFor = clientId;
    }
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    id.renderButton(el, { type: 'standard', theme: dark ? 'filled_black' : 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', logo_alignment: 'left', width: 360 });
    ready = true;
    state('ready');
  }).catch(() => {
    clearTimeout(slowTimer);
    state('failed');
  });

  return {
    el,
    destroy() {
      destroyed = true;
      clearTimeout(slowTimer);
      if (currentHandler) currentHandler = null;
    }
  };
}
