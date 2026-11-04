// The signed-in frame: sidebar on the left, top bar with the theme and profile buttons, page on the right.

import { h, icon, logoMark } from '../dom.js';
import { popover } from './popover.js';
import { avatar } from './avatar.js';
import { toast } from './toast.js';
import { ACCENTS, getAccent, getThemePref, setAccent, setThemePref } from '../theme.js';

const NAV = [
  { path: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: 'roadmap', label: 'Roadmap', icon: 'roadmap' },
  { path: 'problems', label: 'Problems', icon: 'problems' },
  { path: 'progress', label: 'Progress', icon: 'progress', soon: true },
  { path: 'submissions', label: 'Submissions', icon: 'submissions', soon: true },
  { path: 'settings', label: 'Settings', icon: 'settings' }
];

export function themeControls() {
  const current = getThemePref();
  const segmented = h('div', { class: 'segmented block', role: 'radiogroup', 'aria-label': 'Theme' },
    ['light', 'dark', 'system'].map((value) =>
      h('label', null,
        h('input', { type: 'radio', name: 'theme', value, checked: current === value, onChange: () => setThemePref(value) }),
        h('span', { text: value[0].toUpperCase() + value.slice(1) })
      )
    )
  );
  const swatches = h('div', { class: 'swatches', role: 'group', 'aria-label': 'Accent color' },
    ACCENTS.map((name) => {
      const b = h('button', {
        class: 'swatch', type: 'button', 'data-accent': name, 'aria-label': name, 'aria-pressed': String(getAccent() === name),
        onClick: () => {
          setAccent(name);
          swatches.querySelectorAll('.swatch').forEach((s) => s.setAttribute('aria-pressed', String(s.dataset.accent === name)));
        }
      });
      return b;
    })
  );
  return { segmented, swatches };
}

// ctx: { user (getter), appName, onLogout, onStartTour }
export function createShell(ctx) {
  const title = h('h1');
  const content = h('main', { class: 'content', id: 'main', tabindex: '-1' });

  const navLinks = NAV.map((item) =>
    h('a', { class: 'nav-link', href: '#/' + item.path, 'data-path': item.path },
      icon(item.icon, 20), item.label, item.soon ? h('span', { class: 'nav-soon', text: 'Soon' }) : null)
  );
  const sidebar = h('aside', { class: 'sidebar' },
    h('a', { class: 'brand', href: '#/dashboard', 'aria-label': ctx.appName }, logoMark(), ctx.appName),
    h('nav', { class: 'nav', 'aria-label': 'Main', 'data-tour': 'nav' }, navLinks),
    h('div', { class: 'sidebar-note' }, h('strong', { text: 'Free for everyone' }), 'No ads, no paywall, no limits.')
  );

  // Theme button
  const themeBtn = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Appearance', 'data-tour': 'theme' }, icon('palette', 20));
  const themePop = popover(themeBtn, () => {
    const { segmented, swatches } = themeControls();
    return h('div', { class: 'pop-section' },
      h('div', { class: 'pop-label', text: 'Theme' }), segmented,
      h('div', { class: 'pop-label', text: 'Accent color' }), swatches
    );
  }, { label: 'Appearance' });

  // Profile button: the photo. Clicking it shows the user ID (nothing else about you).
  const avatarBtn = h('button', { class: 'avatar-btn', type: 'button', 'aria-label': 'Your profile menu', 'data-tour': 'avatar' });
  const drawAvatar = () => avatarBtn.replaceChildren(avatar(ctx.user(), 0));
  drawAvatar();

  const profilePop = popover(avatarBtn, (close) => {
    const user = ctx.user();
    const copy = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Copy user ID' }, icon('copy', 18));
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(user.userId); toast('User ID copied'); } catch (e) { toast('Could not copy. Select the ID and copy it.'); }
    });
    const link = (path, label, ico) => h('a', { class: 'pop-item', href: '#/' + path, onClick: close }, icon(ico, 18), label);
    return h('div', null,
      h('div', { class: 'pop-section' },
        h('div', { class: 'pop-label', text: 'Your user ID' }),
        h('div', { class: 'pop-id' }, h('span', { class: 'user-id', text: user.userId }), copy)
      ),
      h('div', { class: 'pop-sep' }),
      link('profile', 'My profile', 'user'),
      link('settings', 'Settings', 'settings'),
      h('button', { class: 'pop-item', type: 'button', onClick: () => { close(); ctx.onStartTour(); } }, icon('help', 18), 'Take the tour'),
      h('div', { class: 'pop-sep' }),
      h('button', { class: 'pop-item', type: 'button', onClick: () => { close(); ctx.onLogout(); } }, icon('logout', 18), 'Log out')
    );
  }, { label: 'Profile menu' });

  const main = h('div', { class: 'main' },
    h('header', { class: 'topbar' }, title, h('div', { class: 'topbar-actions' }, themePop.el, profilePop.el)),
    content
  );
  const el = h('div', { class: 'shell' }, sidebar, main);

  return {
    el,
    content,
    refreshAvatar: drawAvatar,
    setTitle(text) { title.textContent = text; },
    setPage(path, pageTitle) {
      title.textContent = pageTitle;
      navLinks.forEach((a) => {
        if (a.dataset.path === path) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
      content.scrollTop = 0;
    }
  };
}
