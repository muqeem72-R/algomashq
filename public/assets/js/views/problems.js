// The list of problems, with filters: topic, difficulty, a search box, and what you did with them
// (all, solved, unsolved, bookmarked, with a note). The numbers on the filters count what the other filters leave.

import { h, icon } from '../dom.js';
import { TOPICS } from '../data/topics.js';
import { loadIndex } from '../problems-data.js';
import * as progress from '../progress.js';

const LEVELS = ['all', 'easy', 'medium', 'hard'];
const STATUSES = [['all', 'All'], ['solved', 'Solved'], ['unsolved', 'Unsolved']];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

export function problemsView(ctx, topicId) {
  const filters = { topic: TOPICS.some((t) => t.id === topicId) ? topicId : 'all', level: 'all', search: '', status: 'all', bookmarked: false, notes: false };
  const summary = h('p', { class: 'muted' });
  const listHost = h('div', { class: 'problem-list' });

  const topicSelect = h('select', { class: 'select', 'aria-label': 'Topic', onChange: () => { filters.topic = topicSelect.value; draw(); } });
  const search = h('input', { class: 'input', type: 'search', placeholder: 'Search problems', 'aria-label': 'Search problems', onInput: () => { filters.search = search.value.trim().toLowerCase(); draw(); } });
  const levelBar = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': 'Difficulty' },
    LEVELS.map((level) => h('label', null,
      h('input', { type: 'radio', name: 'level', value: level, checked: level === 'all', onChange: () => { filters.level = level; draw(); } }),
      h('span', { text: cap(level) }))));

  // Solved / unsolved / total, with the number of problems behind each.
  const statusSpans = {};
  const statusBar = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': 'Status' },
    STATUSES.map(([value, label]) => {
      statusSpans[value] = h('span', { text: label });
      return h('label', null,
        h('input', { type: 'radio', name: 'status', value, checked: value === 'all', onChange: () => { filters.status = value; draw(); } }),
        statusSpans[value]);
    }));
  const toggle = (key, iconName, label) => {
    const text = h('span', { text: label });
    const button = h('button', { class: 'chip-toggle', type: 'button', 'aria-pressed': 'false', onClick: () => {
      filters[key] = !filters[key];
      button.setAttribute('aria-pressed', String(filters[key]));
      draw();
    } }, icon(iconName, 15), text);
    return { button, text, label };
  };
  const bookmarkToggle = toggle('bookmarked', 'star', 'Bookmarked');
  const noteToggle = toggle('notes', 'note', 'With notes');

  const page = h('div', { class: 'page' },
    h('div', { class: 'page-head' }, h('h2', { text: 'Problems' }), summary),
    h('div', { class: 'filters' }, topicSelect, levelBar, search),
    h('div', { class: 'filters' }, statusBar, bookmarkToggle.button, noteToggle.button),
    listHost);

  let problems = [];

  function draw() {
    const solved = progress.getSolved();
    const marked = progress.bookmarkedSlugs();
    const noted = progress.noteSlugSet();

    // What the topic, the difficulty and the search leave; the filters about what you did are counted on this.
    const base = problems
      .filter((p) => (filters.topic === 'all' || p.topic === filters.topic) && (filters.level === 'all' || p.difficulty === filters.level))
      .filter((p) => !filters.search || (p.title + ' ' + p.tags.join(' ')).toLowerCase().includes(filters.search));
    const nSolved = base.filter((p) => solved[p.slug]).length;
    statusSpans.all.textContent = `All ${base.length}`;
    statusSpans.solved.textContent = `Solved ${nSolved}`;
    statusSpans.unsolved.textContent = `Unsolved ${base.length - nSolved}`;
    bookmarkToggle.text.textContent = `${bookmarkToggle.label} ${base.filter((p) => marked.has(p.slug)).length}`;
    noteToggle.text.textContent = `${noteToggle.label} ${base.filter((p) => noted.has(p.slug)).length}`;

    const rows = base
      .filter((p) => filters.status === 'all' || (filters.status === 'solved') === !!solved[p.slug])
      .filter((p) => !filters.bookmarked || marked.has(p.slug))
      .filter((p) => !filters.notes || noted.has(p.slug));

    const total = problems.length;
    const done = problems.filter((p) => solved[p.slug]).length;
    summary.textContent = `${done} of ${total} solved. Read the idea first, then solve each problem in your own way.`;

    if (!rows.length) {
      const narrowed = filters.status !== 'all' || filters.bookmarked || filters.notes;
      listHost.replaceChildren(h('div', { class: 'card empty' }, h('h3', { text: 'No problems match' }),
        h('p', { text: narrowed ? 'Nothing fits all the filters. Switch one of them off to see more.' : 'Try another topic or difficulty. More problems are on the way.' })));
      return;
    }
    listHost.replaceChildren(h('div', { class: 'card table-card' },
      h('table', { class: 'ptable' },
        h('thead', null, h('tr', null, ['', '#', 'Title', 'Topic', 'Difficulty', ''].map((t) => h('th', { text: t })))),
        h('tbody', null, rows.map((p) => {
          const topic = TOPICS.find((t) => t.id === p.topic);
          const isDone = !!solved[p.slug];
          const isMarked = marked.has(p.slug);
          return h('tr', null,
            h('td', { class: 'ptable-status', title: isDone ? 'Solved' : 'Not solved yet' }, isDone ? h('span', { class: 'status-done' }, icon('check', 16)) : h('span', { class: 'status-open' })),
            h('td', { class: 'ptable-num', text: String(p.order) }),
            h('td', null,
              h('a', { class: 'ptable-title', href: `#/problem/${p.slug}`, text: p.title }),
              noted.has(p.slug) ? h('span', { class: 'note-mark', title: 'You wrote a note on this problem' }, icon('note', 14)) : null,
              h('div', { class: 'ptable-tags' }, p.tags.map((t) => h('span', { text: t })))),
            h('td', { class: 'muted', text: topic ? topic.title : p.topic }),
            h('td', null, h('span', { class: `level ${p.difficulty}`, text: cap(p.difficulty) })),
            h('td', { class: 'ptable-star' },
              h('button', {
                class: 'star-btn', type: 'button', 'aria-pressed': String(isMarked), 'aria-label': `${isMarked ? 'Remove the bookmark from' : 'Bookmark'} ${p.title}`,
                title: isMarked ? 'Bookmarked. Click to remove' : 'Bookmark this problem',
                onClick: () => { progress.setBookmark(p.slug, !isMarked); draw(); }
              }, icon('star', 17))));
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
