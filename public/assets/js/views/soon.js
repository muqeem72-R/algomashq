import { h, icon } from '../dom.js';

const COPY = {
  progress: { iconName: 'progress', title: 'Progress tracking is coming', text: 'Solved problems, streaks and per-topic progress will show up here once you start solving.' },
  submissions: { iconName: 'submissions', title: 'No submissions yet', text: 'Every solution you submit will be listed here, with its result and language.' }
};

export function soonView(name) {
  const c = COPY[name];
  return h('div', { class: 'page' },
    h('div', { class: 'card empty' },
      h('span', { class: 'icon-circle' }, icon(c.iconName, 26)),
      h('h3', { text: c.title }),
      h('p', { text: c.text }),
      h('a', { class: 'btn btn-ghost', href: '#/roadmap', text: 'See the roadmap' })
    )
  );
}
