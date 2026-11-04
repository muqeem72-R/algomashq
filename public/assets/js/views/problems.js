// The list of problems, with filters for topic, difficulty and a search box.

import { h, icon } from '../dom.js';
import { TOPICS } from '../data/topics.js';
import { loadIndex } from '../problems-data.js';
import { getSolved } from '../progress.js';

const LEVELS = ['all', 'easy', 'medium', 'hard'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

export function problemsView(ctx, topicId) {
  const filters = { topic: TOPICS.some((t) => t.id === topicId) ? topicId : 'all', level: 'all', search: '' };
  const summary = h('p', { class: 'muted' });
  const listHost = h('div', { class: 'problem-list' });

  const topicSelect = h('select', { class: 'select', 'aria-label': 'Topic', onChange: () => { filters.topic = topicSelect.value; draw(); } });
  const search = h('input', { class: 'input', type: 'search', placeholder: 'Search problems', 'aria-label': 'Search problems', onInput: () => { filters.search = search.value.trim().toLowerCase(); draw(); } });
  const levelBar = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': 'Difficulty' },
    LEVELS.map((level) => h('label', null,
      h('input', { type: 'radio', name: 'level', value: level, checked: level === 'all', onChange: () => { filters.level = level; draw(); } }),
      h('span', { text: cap(level) }))));

  const page = h('div', { class: 'page' },
    h('div', { class: 'page-head' }, h('h2', { text: 'Problems' }), summary),
    h('div', { class: 'filters' }, topicSelect, levelBar, search),
    listHost);

  let problems = [];

  function draw() {
    const solved = getSolved();
    const rows = problems
      .filter((p) => (filters.topic === 'all' || p.topic === filters.topic) && (filters.level === 'all' || p.difficulty === filters.level))
      .filter((p) => !filters.search || (p.title + ' ' + p.tags.join(' ')).toLowerCase().includes(filters.search));

    const total = problems.length;
    const done = problems.filter((p) => solved[p.slug]).length;
    summary.textContent = `${done} of ${total} solved. Read the idea first, then solve each problem in your own way.`;

    if (!rows.length) {
      listHost.replaceChildren(h('div', { class: 'card empty' }, h('h3', { text: 'No problems match' }), h('p', { text: 'Try another topic or difficulty. More problems are on the way.' })));
      return;
    }
    listHost.replaceChildren(h('div', { class: 'card table-card' },
      h('table', { class: 'ptable' },
        h('thead', null, h('tr', null, ['', 'Title', 'Topic', 'Difficulty'].map((t) => h('th', { text: t })))),
        h('tbody', null, rows.map((p) => {
          const topic = TOPICS.find((t) => t.id === p.topic);
          const isDone = !!solved[p.slug];
          return h('tr', null,
            h('td', { class: 'ptable-status', title: isDone ? 'Solved' : 'Not solved yet' }, isDone ? h('span', { class: 'status-done' }, icon('check', 16)) : h('span', { class: 'status-open' })),
            h('td', null, h('a', { class: 'ptable-title', href: `#/problem/${p.slug}`, text: p.title }), h('div', { class: 'ptable-tags' }, p.tags.map((t) => h('span', { text: t })))),
            h('td', { class: 'muted', text: topic ? topic.title : p.topic }),
            h('td', null, h('span', { class: `level ${p.difficulty}`, text: cap(p.difficulty) })));
        })))));
  }

  topicSelect.append(h('option', { value: 'all', text: 'All topics' }));

  loadIndex().then((data) => {
    problems = data.problems;
    const counts = {};
    for (const p of problems) counts[p.topic] = (counts[p.topic] || 0) + 1;
    for (const t of TOPICS) {
      topicSelect.append(h('option', { value: t.id, text: `${t.title} (${counts[t.id] || 0})`, selected: t.id === filters.topic }));
    }
    draw();
  }).catch((error) => {
    listHost.replaceChildren(h('div', { class: 'card empty' }, h('h3', { text: 'Could not load the problems' }), h('p', { text: error.message })));
  });

  return page;
}
