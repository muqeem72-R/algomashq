import { h } from '../dom.js';
import { topicGrid } from '../components/topics.js';

export function roadmapView() {
  return h('div', { class: 'page' },
    h('div', { class: 'page-head' },
      h('h2', { text: 'Roadmap' }),
      h('p', { text: 'Ten topics, taken in order. Each one starts with a short concept note, then problems that grow from Easy to Hard. You build the logic yourself.' })
    ),
    topicGrid()
  );
}
