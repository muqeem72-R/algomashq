// Your saved solutions: for every problem and language, the last code that was ACCEPTED.
// Only an accepted solution is saved; a submission that fails saves nothing and never replaces a saved solution.
// Opened as #/submissions (everything) or #/submissions/<problem> (one problem).

import { h, icon } from '../dom.js';
import { api, ApiError } from '../api.js';
import { loadIndex } from '../problems-data.js';
import { LANGUAGES } from '../data/topics.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';
import * as progress from '../progress.js';

const when = (ts) => new Date(ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const languageLabel = (id) => (LANGUAGES.find((l) => l.id === id) || { label: id }).label;

export function submissionsView(ctx, onlySlug) {
  let rows = [];
  let titles = new Map();
  const codes = new Map();   // 'slug:lang' -> the saved solution with its code, once fetched

  const intro = h('p', { class: 'muted' });
  const listHost = h('div', { class: 'sub-list' });
  const clearBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: onlySlug ? 'Clear for this problem' : 'Clear all', onClick: clearAll });

  const page = h('div', { class: 'page' },
    h('div', { class: 'page-head' }, h('h2', { text: 'Submissions' }), intro),
    h('div', { class: 'filters' }, h('div', { class: 'grow' }), clearBtn),
    listHost
  );

  const problemText = (slug) => { const p = titles.get(slug); return p ? `#${p.order} ${p.title}` : slug; };

  function setIntro() {
    intro.replaceChildren();
    if (onlySlug) {
      intro.append(`Your accepted solutions of ${problemText(onlySlug)}, one for each language. `, h('a', { href: `#/problem/${onlySlug}`, text: 'Back to the problem' }), ' · ', h('a', { href: '#/submissions', text: 'All submissions' }));
    } else {
      intro.append('For every problem and language, the last solution that was Accepted is saved here. A submission that is not accepted is not saved, and it never replaces the solution you already have.');
    }
  }

  function codePanel(row) {
    const key = `${row.slug}:${row.lang}`;
    const box = h('div', { class: 'sub-code' }, h('p', { class: 'muted', text: 'Loading the code...' }));
    const show = (sub) => {
      if (!sub.hasCode || typeof sub.code !== 'string') {
        box.replaceChildren(h('p', { class: 'muted', text: 'The code of this solution was too long to be saved. Its result is still shown above.' }));
        return;
      }
      box.replaceChildren(
        h('pre', { class: 'code-block' }, h('code', { text: sub.code })),
        h('div', { class: 'sub-actions' },
          h('button', { class: 'btn btn-primary btn-sm', type: 'button', text: 'Use this code in the editor', onClick: () => useCode(sub) }),
          h('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Copy', onClick: () => copy(sub.code) })
        )
      );
    };
    if (codes.has(key)) show(codes.get(key));
    else {
      api(`/api/me/submissions/${row.slug}/${row.lang}`).then((data) => { codes.set(key, data.submission); show(data.submission); })
        .catch(() => box.replaceChildren(h('p', { class: 'muted', text: 'The code could not be loaded. Try again in a moment.' })));
    }
    return box;
  }

  function useCode(sub) {
    const current = progress.getDraft(sub.slug, sub.lang);
    if (current && current !== sub.code && !window.confirm('Replace the code you have now for this problem and language with this solution?')) return;
    progress.saveDraft(sub.slug, sub.lang, sub.code);
    progress.syncDrafts();
    progress.setLanguage(sub.lang);
    navigate(`problem/${sub.slug}`);
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Copied.'); } catch (e) { toast('Could not copy. Select the code and copy it yourself.'); }
  }

  function rowEls(row) {
    const main = h('tr', { class: 'sub-row', tabindex: '0', 'aria-expanded': 'false', title: 'Show the code' },
      h('td', { class: 'muted', text: when(row.at) }),
      h('td', null, h('a', { class: 'ptable-title', href: `#/problem/${row.slug}`, text: problemText(row.slug), onClick: (e) => e.stopPropagation() })),
      h('td', { text: languageLabel(row.lang) }),
      h('td', { class: 'muted', text: `${row.passed} / ${row.total} tests` }),
      h('td', { class: 'muted', text: row.timeMs === null || row.timeMs === undefined ? '-' : `${row.timeMs} ms` })
    );
    let detail = null;
    const toggle = () => {
      if (detail) { detail.remove(); detail = null; main.setAttribute('aria-expanded', 'false'); return; }
      detail = h('tr', { class: 'sub-detail' }, h('td', { colspan: '5' }, codePanel(row)));
      main.after(detail);
      main.setAttribute('aria-expanded', 'true');
    };
    main.addEventListener('click', toggle);
    main.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    return [main];
  }

  function draw() {
    if (!rows.length) {
      listHost.replaceChildren(h('div', { class: 'card empty' },
        h('span', { class: 'icon-circle' }, icon('submissions', 26)),
        h('h3', { text: 'No saved solutions yet' }),
        h('p', { text: 'When a solution is Accepted, its code is saved here, one for each language.' }),
        h('a', { class: 'btn btn-ghost', href: onlySlug ? `#/problem/${onlySlug}` : '#/problems', text: onlySlug ? 'Back to the problem' : 'Find a problem to solve' })));
      return;
    }
    listHost.replaceChildren(h('div', { class: 'card table-card' },
      h('table', { class: 'ptable sub-table' },
        h('thead', null, h('tr', null, ['Accepted', 'Problem', 'Language', 'Tests', 'Time'].map((t) => h('th', { text: t })))),
        h('tbody', null, rows.flatMap(rowEls)))));
  }

  async function load() {
    try {
      const data = await api(`/api/me/submissions${onlySlug ? `?problem=${encodeURIComponent(onlySlug)}` : ''}`);
      rows = data.submissions;
      draw();
    } catch (error) {
      listHost.replaceChildren(h('div', { class: 'card empty' },
        h('h3', { text: 'Could not load your solutions' }),
        h('p', { text: error instanceof ApiError && error.status === 401 ? 'Please sign in again.' : 'Check your connection and try again.' }),
        h('button', { class: 'btn btn-primary', type: 'button', text: 'Try again', onClick: () => load() })));
    }
  }

  async function clearAll() {
    const what = onlySlug ? 'the saved solutions of this problem' : 'all your saved solutions';
    if (!window.confirm(`Delete ${what}? Your solved problems and your progress stay as they are.`)) return;
    try {
      await api(`/api/me/submissions${onlySlug ? `?problem=${encodeURIComponent(onlySlug)}` : ''}`, { method: 'DELETE' });
      toast('Cleared.');
      codes.clear();
      load();
    } catch (error) {
      toast('Could not clear them. Try again in a moment.');
    }
  }

  loadIndex().then((data) => { titles = new Map(data.problems.map((p) => [p.slug, p])); setIntro(); if (rows.length) draw(); }).catch(() => { setIntro(); });
  setIntro();
  load();
  return page;
}
