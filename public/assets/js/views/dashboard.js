import { h } from '../dom.js';
import { LANGUAGES, TOPICS } from '../data/topics.js';
import { topicGrid } from '../components/topics.js';

export function dashboardView(ctx) {
  const user = ctx.user();
  const language = LANGUAGES.find((l) => l.id === user.preferredLanguage) || LANGUAGES[0];
  const fresh = Date.now() - user.createdAt < 10 * 60 * 1000;

  return h('div', { class: 'page' },
    h('div', { class: 'page-head' },
      h('h2', { text: `${fresh ? 'Welcome' : 'Welcome back'}, ${user.firstName}` }),
      h('p', { text: 'Your learning space is ready. Problems open up topic by topic, starting with the basics.' })
    ),
    h('div', { class: 'stat-row' },
      h('div', { class: 'card stat' },
        h('div', { class: 'label', text: 'Your user ID' }),
        h('div', { class: 'value mono', text: user.userId }),
        h('div', { class: 'hint', text: 'Other members see this with your photo and country.' })
      ),
      h('div', { class: 'card stat' },
        h('div', { class: 'label', text: 'Preferred language' }),
        h('div', { class: 'value', text: language.label }),
        h('div', { class: 'hint' }, 'Change it any time in ', h('a', { href: '#/settings', text: 'Settings' }), '.')
      ),
      h('div', { class: 'card stat' },
        h('div', { class: 'label', text: 'Roadmap' }),
        h('div', { class: 'value', text: `${TOPICS.length} topics` }),
        h('div', { class: 'hint', text: 'Easy, Medium and Hard problems in each.' })
      )
    ),
    h('div', { class: 'section-head', 'data-tour': 'topics' },
      h('h3', { text: 'Learning roadmap' }),
      h('span', { text: 'Take the topics in order' })
    ),
    topicGrid()
  );
}
