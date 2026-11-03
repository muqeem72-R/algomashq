// Light / dark / system theme and the accent color. Saved in this browser.

export const ACCENTS = ['indigo', 'emerald', 'amber', 'rose', 'sky'];
const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: dark)');

function read(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* storage blocked: the choice lasts until reload */ }
}

export const getThemePref = () => read('dsa.theme', 'dark');
export const getAccent = () => read('dsa.accent', 'indigo');

export function applyTheme() {
  const pref = getThemePref();
  const dark = pref === 'system' ? media.matches : pref !== 'light';
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  root.setAttribute('data-accent', getAccent());
}

export function setThemePref(pref) {
  write('dsa.theme', pref);
  applyTheme();
}

export function setAccent(accent) {
  if (!ACCENTS.includes(accent)) return;
  write('dsa.accent', accent);
  applyTheme();
}

media.addEventListener('change', () => { if (getThemePref() === 'system') applyTheme(); });
