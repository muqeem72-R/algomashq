// Hash routing: #/dashboard, #/profile ... Works on any static host with no server rules.

export const currentPath = () => location.hash.replace(/^#\/?/, '').split('?')[0];

export function navigate(path) {
  const target = '#/' + path;
  if (location.hash === target) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = target;
}

export function onRouteChange(handler) {
  window.addEventListener('hashchange', handler);
}
