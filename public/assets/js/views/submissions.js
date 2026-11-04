// Your submissions: for every problem and language, the last code you submitted, with its result.
// Opened as #/submissions (everything) or #/submissions/<problem> (one problem).

import { h, icon } from '../dom.js';
import { api, ApiError } from '../api.js';
import { loadIndex } from '../problems-data.js';
import { LANGUAGES } from '../data/topics.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';
import * as progress from '../progress.js';

const VERDICT_TEXT = {
  accepted: 'Accepted', wrong_answer: 'Wrong Answer', runtime_error: 'Runtime Error', time_limit: 'Time Limit',
  memory_limit: 'Memory Limit', output_limit: 'Output Limit', compile_error: 'Compile Error'
};
const FILTERS = [['all', 'All'], ['accepted', 'Accepted'], ['failed', 'Not accepted']];

const when = (ts) => new Date(ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const languageLabel = (id) => (LANGUAGES.find((l) => l.id === id) || { label: id }).label;

export function submissionsView(ctx, onlySlug) {
  const filter = { verdict: 'all' };
  let rows = [];
  let titles = new Map();
  const codes = new Map();   // 'slug:lang' -> the submission with its code, once fetched

  const intro = h('p', { class: 'muted' });
  const listHost = h('div', { class: 'sub-list' });

  const filterBar = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': 'Result' },
    FILTERS.map(([value, label]) => h('label', null,
      h('input', { type: 'radio', name: 'sub-verdict', value, checked: value === 'all', onChange: () => { filter.verdict = value; load(); } }),
      h('span', { text: label }))));
  const clearBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: onlySlug ? 'Clear for this problem' : 'Clear submissions', onClick: clearAll });

  const page = h('div', { class: 'page' },
    h('div', { class: 'page-head' }, h('h2', { text: 'Submissions' }), intro),
    h('div', { class: 'filters' }, filterBar, h('div', { class: 'grow' }), clearBtn),
    listHost
  );

  const problemText = (slug) => { const p = titles.get(slug); return p ? `#${p.order} ${p.title}` : slug; };

  function setIntro() {
    intro.replaceChildren();
    if (onlySlug) {
      intro.append(`Your last submission of ${problemText(onlySlug)} in each language. `, h('a', { href: `#/problem/${onlySlug}`, text: 'Back to the problem' }), ' · ', h('a', { href: '#/submissions', text: 'All submissions' }));
    } else {
      intro.append('For every problem and language, the last code you submitted is saved here, with its result. Submitting again in the same language replaces it.');
    }
  }

  function codePanel(row) {
    const key = `${row.slug}:${row.lang}`;
    const box = h('div', { class: 'sub-code' }, h('p', { class: 'muted', text: 'Loading the code...' }));
    const show = (sub) => {
      if (!sub.hasCode || typeof sub.code !== 'string') {
        box.replaceChildren(h('p', { class: 'muted', text: 'The code of this submission was too long to be saved. Its result is still shown above.' }));
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
    if (current && current !== sub.code && !window.confirm('Replace the code you have now for this problem and language with this submission?')) return;
    progress.saveDraft(sub.slug, sub.lang, sub.code);
    progress.syncDrafts();
    progress.setLanguage(sub.lang);
    navigate(`problem/${sub.slug}`);
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Copied.'); } catch (e) { toast('Could not copy. Select the code and copy it yourself.'); }
  }

  function rowEls(row) {
    const ok = row.verdict === 'accepted';
    const main = h('tr', { class: 'sub-row', tabindex: '0', 'aria-expanded': 'false', title: 'Show the code' },
      h('td', { class: 'muted', text: when(row.at) }),
      h('td', null, h('a', { class: 'ptable-title', href: `#/problem/${row.slug}`, text: problemText(row.slug), onClick: (e) => e.stopPropagation() })),
      h('td', { text: languageLabel(row.lang) }),
      h('td', null, h('span', { class: ok ? 'verdict-ok' : 'verdict-bad', text: VERDICT_TEXT[row.verdict] || row.verdict })),
      h('td', { class: 'muted', text: row.verdict === 'compile_error' ? '-' : `${row.passed} / ${row.total}` }),
      h('td', { class: 'muted', text: row.timeMs === null || row.timeMs === undefined ? '-' : `${row.timeMs} ms` })
    );
    let detail = null;
    const toggle = () => {
      if (detail) { detail.remove(); detail = null; main.setAttribute('aria-expanded', 'false'); return; }
      detail = h('tr', { class: 'sub-detail' }, h('td', { colspan: '6' }, codePanel(row)));
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
        h('h3', { text: filter.verdict === 'all' ? 'No submissions yet' : 'No submissions match' }),
        h('p', { text: filter.verdict === 'all' ? 'The code you submit will be saved here, with its result and language.' : 'Try another filter.' }),
        h('a', { class: 'btn btn-ghost', href: onlySlug ? `#/problem/${onlySlug}` : '#/problems', text: onlySlug ? 'Back to the problem' : 'Find a problem to solve' })));
      return;
    }
    listHost.replaceChildren(h('div', { class: 'card table-card' },
      h('table', { class: 'ptable sub-table' },
        h('thead', null, h('tr', null, ['When', 'Problem', 'Language', 'Result', 'Tests', 'Time'].map((t) => h('th', { text: t })))),
        h('tbody', null, rows.flatMap(rowEls)))));
  }

  async function load() {
    try {
      const q = new URLSearchParams();
      if (onlySlug) q.set('problem', onlySlug);
      if (filter.verdict !== 'all') q.set('verdict', filter.verdict);
      const data = await api(`/api/me/submissions${q.toString() ? `?${q}` : ''}`);
      rows = data.submissions;
      draw();
    } catch (error) {
      listHost.replaceChildren(h('div', { class: 'card empty' },
        h('h3', { text: 'Could not load the submissions' }),
        h('p', { text: error instanceof ApiError && error.status === 401 ? 'Please sign in again.' : 'Check your connection and try again.' }),
        h('button', { class: 'btn btn-primary', type: 'button', text: 'Try again', onClick: () => load() })));
    }
  }

  async function clearAll() {
    const what = onlySlug ? 'the saved submissions of this problem' : 'all your saved submissions';
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
