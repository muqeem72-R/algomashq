// The roadmap cards, shown on the dashboard and on the Roadmap page.
// A topic that already has problems shows how many and links to them; the others say "Opening soon".

import { h } from '../dom.js';
import { TOPICS } from '../data/topics.js';
import { countByTopic } from '../problems-data.js';

export function topicGrid() {
  const footers = new Map();
  const grid = h('div', { class: 'topic-grid' },
    TOPICS.map((topic, i) => {
      const status = h('span', { class: 'soon', text: 'Opening soon' });
      footers.set(topic.id, status);
      return h('article', { class: 'card topic', 'data-topic': topic.id },
        h('div', { class: 'topic-top' },
          h('span', { class: 'topic-num', text: String(i + 1).padStart(2, '0') }),
          h('h4', { text: topic.title })
        ),
        h('p', { text: topic.summary }),
        h('ul', null, topic.points.map((p) => h('li', { text: p }))),
        h('div', { class: 'topic-foot' },
          h('span', { class: 'level easy', text: 'Easy' }),
          h('span', { class: 'level medium', text: 'Medium' }),
          h('span', { class: 'level hard', text: 'Hard' }),
          status
        )
      );
    })
  );

  countByTopic().then((counts) => {
    for (const topic of TOPICS) {
      const n = counts[topic.id];
      if (!n) continue;
      const link = h('a', { class: 'open-link', href: `#/problems/${topic.id}`, text: `${n} ${n === 1 ? 'problem' : 'problems'}` });
      footers.get(topic.id).replaceWith(link);
      grid.querySelector(`[data-topic="${topic.id}"]`).classList.add('has-problems');
    }
  }).catch(() => { /* the cards simply keep saying "Opening soon" */ });

  return grid;
}
