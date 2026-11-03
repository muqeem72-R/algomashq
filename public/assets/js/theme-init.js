// Runs before the page paints, so the saved theme never flashes. Kept tiny on purpose.
(function () {
  var root = document.documentElement;
  var pref = 'dark';
  var accent = 'indigo';
  try {
    pref = localStorage.getItem('dsa.theme') || pref;
    accent = localStorage.getItem('dsa.accent') || accent;
  } catch (e) { /* storage can be blocked: the defaults are fine */ }
  var dark = pref === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : pref !== 'light';
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  root.setAttribute('data-accent', accent);
})();
