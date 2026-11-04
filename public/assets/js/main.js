// App entry: loads the public settings, finds out who is signed in, and shows the right screen.

import { api, ApiError } from './api.js';
import { h, clear } from './dom.js';
import { applyTheme } from './theme.js';
import { currentPath, navigate, onRouteChange } from './router.js';
import { createShell } from './components/shell.js';
import { startTour } from './components/tour.js';
import { toast } from './components/toast.js';
import { loginView } from './views/login.js';
import { dashboardView } from './views/dashboard.js';
import { roadmapView } from './views/roadmap.js';
import { profileView } from './views/profile.js';
import { settingsView } from './views/settings.js';
import { soonView } from './views/soon.js';
import * as engine from './runner/engine.js';
import { problemsView } from './views/problems.js';
import { workspaceView } from './views/workspace.js';

const app = document.getElementById('app');
const state = { config: null, user: null, shell: null, tourShown: false, replay: false, destroyView: null };

const PAGES = {
  dashboard: { title: 'Dashboard', view: dashboardView },
  roadmap: { title: 'Roadmap', view: roadmapView },
  problems: { title: 'Problems', view: (c) => problemsView(c, null) },
  progress: { title: 'Progress', view: () => soonView('progress') },
  submissions: { title: 'Submissions', view: () => soonView('submissions') },
  profile: { title: 'My profile', view: profileView },
  settings: { title: 'Settings', view: settingsView }
};

// What the views are allowed to ask of the app.
const ctx = {
  user: () => state.user,
  get appName() { return state.config.appName; },
  setTitle: (text) => { if (state.shell) state.shell.setTitle(text); },
  patchUser: (patch) => Object.assign(state.user, patch),   // same object, so views holding it stay current
  async refreshUser() {
    const result = await api('/api/auth/me');
    Object.assign(state.user, result.user);
    if (state.shell) state.shell.refreshAvatar();
    render();
  },
  startTour: runTour,
  logout
};

function showProblem(title, text, retry) {
  clear(app);
  app.append(h('div', { class: 'page' },
    h('div', { class: 'card empty' },
      h('h3', { text: title }),
      h('p', { text }),
      retry ? h('button', { class: 'btn btn-primary', type: 'button', text: 'Try again', onClick: retry }) : null
    )
  ));
}

async function logout() {
  try { await api('/api/auth/logout', { method: 'POST' }); } catch (e) { /* the cookie is cleared by the server; if it failed we still leave */ }
  state.user = null;
  state.shell = null;
  state.tourShown = false;
  navigate('login');
}

function onAuthenticated(user) {
  state.user = user;
  state.shell = null;
  navigate('dashboard');
}

// ---- The welcome tour --------------------------------------------------------------------------

function runTour() {
  if (currentPath() !== 'dashboard') {
    state.replay = true;   // the tour starts as soon as the dashboard is on screen
    navigate('dashboard');
    return;
  }
  const name = state.user.firstName;
  const steps = [
    { target: null, title: `Welcome, ${name}!`, body: 'Take a 30-second tour to see where everything is. You can skip it at any time.' },
    { target: '[data-tour="nav"]', title: 'Your navigation', body: 'Dashboard, Roadmap and Problems are ready to use. Progress and Submissions open up as the platform grows.' },
    { target: '[data-tour="topics"]', title: 'The roadmap', body: 'Ten DSA topics, from the basics to advanced. Each one starts with a short concept note, then Easy, Medium and Hard problems.' },
    { target: '[data-tour="theme"]', title: 'Make it yours', body: 'Switch between light, dark and system themes, and pick the accent color you like.' },
    { target: '[data-tour="avatar"]', title: 'Your profile', body: 'Click your photo to see your user ID, open your profile, change settings or log out. Other members see your photo, user ID and country, never your name or email.' },
    { target: null, title: 'You are all set', body: 'Start with the Basics topic whenever you are ready. You can replay this tour from Settings.' }
  ];
  startTour(steps, () => {
    if (state.shell) state.shell.content.scrollTop = 0;
    if (!state.user.tourDone) {
      state.user.tourDone = true;
      api('/api/me/tour', { method: 'POST' }).catch(() => { state.user.tourDone = false; });
    }
  });
}

// ---- Rendering ----------------------------------------------------------------------------------

// Finds the page for an address: a fixed page, a topic's problem list (problems/basics) or one problem (problem/factorial).
function resolvePage(path) {
  if (PAGES[path]) return { key: path, ...PAGES[path] };
  const topicMatch = /^problems\/([a-z0-9-]+)$/.exec(path);
  if (topicMatch) { const topic = topicMatch[1]; return { key: 'problems', title: 'Problems', view: (c) => problemsView(c, topic) }; }
  const problemMatch = /^problem\/([a-z0-9-]+)$/.exec(path);
  if (problemMatch) { const slug = problemMatch[1]; return { key: 'problems', title: 'Problems', view: (c) => workspaceView(c, slug) }; }
  return null;
}

function render() {
  const path = currentPath();
  if (state.destroyView) { state.destroyView(); state.destroyView = null; }   // lets the page we leave stop its work

  if (!state.user) {
    if (path !== 'login') { navigate('login'); return; }
    document.title = state.config.appName;
    clear(app);
    app.append(loginView({ config: state.config, onAuthenticated }));
    return;
  }
  if (path === 'login' || path === '') { navigate('dashboard'); return; }

  if (!state.shell) {
    state.shell = createShell({ user: () => state.user, appName: state.config.appName, onLogout: logout, onStartTour: runTour });
    clear(app);
    app.append(state.shell.el);
  }

  const page = resolvePage(path);
  if (!page) {
    state.shell.setPage('', 'Page not found');
    state.shell.content.replaceChildren(
      h('div', { class: 'page' }, h('div', { class: 'card empty' },
        h('h3', { text: 'Page not found' }),
        h('p', { text: 'That page does not exist.' }),
        h('a', { class: 'btn btn-primary', href: '#/dashboard', text: 'Go to the dashboard' })))
    );
    document.title = `Page not found · ${state.config.appName}`;
    return;
  }

  state.shell.setPage(page.key, page.title);
  const view = page.view(ctx);
  state.destroyView = view.__destroy || null;
  state.shell.content.classList.toggle('flush', view.dataset.flush === 'true');   // the problem page uses the whole area
  state.shell.content.replaceChildren(view);
  document.title = `${page.title} · ${state.config.appName}`;

  // The tour shows once, to a member who has never seen it; a replay from Settings waits here too.
  if (path === 'dashboard' && ((!state.user.tourDone && !state.tourShown) || state.replay)) {
    state.tourShown = true;
    state.replay = false;
    requestAnimationFrame(runTour);
  }
}

async function boot() {
  applyTheme();
  try {
    state.config = await api('/api/config');
  } catch (e) {
    showProblem('Cannot reach the server', 'Check your connection and try again.', boot);
    return;
  }
  document.title = state.config.appName;
  engine.configure({ javaOrigin: state.config.javaOrigin });   // Java is offered only when its sandbox is set up
  try {
    state.user = (await api('/api/auth/me')).user;
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 503)) {
      showProblem('Something went wrong', 'We could not check your session. Please try again.', boot);
      return;
    }
    toast('The server is not fully set up yet.');
  }
  onRouteChange(render);
  render();
}

boot();
