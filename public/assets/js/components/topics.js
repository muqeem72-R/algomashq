// The roadmap cards, shown on the dashboard and on the Roadmap page.

import { h } from '../dom.js';
import { TOPICS } from '../data/topics.js';

export function topicGrid() {
  return h('div', { class: 'topic-grid' },
    TOPICS.map((topic, i) =>
      h('article', { class: 'card topic' },
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
          h('span', { class: 'soon', text: 'Opening soon' })
        )
      )
    )
  );
}
