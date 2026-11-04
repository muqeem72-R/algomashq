// The dashboard: where the learner stands and what to do next.
// The topic cards live on the Roadmap page only; this page shows the learner's own progress (kept in this browser).

import { h, icon } from '../dom.js';
import { LANGUAGES } from '../data/topics.js';
import { loadIndex } from '../problems-data.js';
import { getSolved, getState } from '../progress.js';

const LEVELS = ['easy', 'medium', 'hard'];
const DAY = 86400000;
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// A whole number for the calendar day (in the learner's own time zone) that a moment falls in.
const dayNumber = (ts) => { const d = new Date(ts); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY); };

function when(ts) {
  const diff = dayNumber(Date.now()) - dayNumber(ts);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff < 7) return `${diff} days ago`;
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

// Streaks and the last four weeks, from the moments at which problems were solved.
function activity(entries) {
  const days = new Set(entries.map((e) => dayNumber(e.at)));
  const today = dayNumber(Date.now());
  let current = 0;
  for (let cursor = days.has(today) ? today : today - 1; days.has(cursor); cursor--) current++;   // a day without a solve yet does not end the streak
  let best = 0, run = 0, previous = null;
  for (const d of [...days].sort((a, b) => a - b)) {
    run = previous !== null && d === previous + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = d;
  }
  return {
    current, best,
    solvedToday: days.has(today),
    week: entries.filter((e) => Date.now() - e.at < 7 * DAY).length,
    recent: Array.from({ length: 28 }, (_, i) => ({ on: days.has(today - 27 + i), isToday: i === 27 }))
  };
}

const bar = (value, max, kind, label) => h('progress', { class: `bar${kind ? ' ' + kind : ''}`, max, value, 'aria-label': label });

export function dashboardView(ctx) {
  const user = ctx.user();
  const language = LANGUAGES.find((l) => l.id === user.preferredLanguage) || LANGUAGES[0];
  const fresh = Date.now() - user.createdAt < 10 * 60 * 1000;

  const subtitle = h('p', { text: 'Loading your progress...' });
  // Everything that depends on the problem list starts as a quiet placeholder and is filled in when the list arrives.
  const nextCard = h('section', { class: 'card next-card', 'data-tour': 'next' }, h('p', { class: 'muted', text: 'Finding your next problem...' }));
  const progressCard = h('section', { class: 'card progress-card' });
  const levelsCard = h('section', { class: 'card' });
  const streakCard = h('section', { class: 'card' });
  const recentCard = h('section', { class: 'card' });

  const learnStep = (n, title, text) => h('li', { class: 'learn-step' },
    h('span', { class: 'learn-num', text: String(n) }),
    h('div', null, h('strong', { text: title }), h('p', { text }))
  );
  const learnCard = h('section', { class: 'card' },
    h('h3', { text: 'How learning works here' }),
    h('ol', { class: 'learn-steps' },
      learnStep(1, 'Read the concept', 'Every problem starts with a short note that teaches the idea, not the answer.'),
      learnStep(2, 'Think, then code', 'Write it your own way in Python, C++ or Java. Use the three hints only when you are stuck.'),
      learnStep(3, 'Submit, then compare', 'Once you have solved it, the worked solution explains the approach and its running time.')
    )
  );
  const youCard = h('section', { class: 'card you-card' },
    h('h3', { text: 'You' }),
    h('div', { class: 'you-row' },
      h('div', { class: 'card-label', text: 'Your user ID' }),
      h('div', { class: 'you-value mono', text: user.userId }),
      h('div', { class: 'hint', text: 'Other members see this with your photo and country.' })
    ),
    h('div', { class: 'you-row' },
      h('div', { class: 'card-label', text: 'Preferred language' }),
      h('div', { class: 'you-value', text: language.label }),
      h('div', { class: 'hint' }, 'Change it any time in ', h('a', { href: '#/settings', text: 'Settings' }), '.')
    )
  );

  const page = h('div', { class: 'page' },
    h('div', { class: 'page-head' }, h('h2', { text: `${fresh ? 'Welcome' : 'Welcome back'}, ${user.firstName}` }), subtitle),
    h('div', { class: 'dash-top' }, nextCard, progressCard),
    h('div', { class: 'dash-row' }, levelsCard, streakCard, recentCard),
    h('div', { class: 'dash-bottom' }, learnCard, youCard)
  );

  function fill(problems) {
    const bySlug = new Map(problems.map((p) => [p.slug, p]));
    const solvedAll = getSolved();
    const solvedEntries = Object.entries(solvedAll).filter(([slug, e]) => bySlug.has(slug) && e && typeof e.at === 'number');
    const solvedCount = solvedEntries.length;
    const total = problems.length;
    const next = problems.find((p) => !solvedAll[p.slug]);   // the problems are numbered by effort, so the lowest open number is next
    const stats = activity(solvedEntries.map(([, e]) => e));

    subtitle.textContent = solvedCount === 0
      ? 'Start with problem 1. It takes two minutes, and every problem after it builds on the one before.'
      : next
        ? `You have solved ${solvedCount} of ${total} problems. Keep going, one problem at a time.`
        : `You have solved all ${total} problems of the Basics topic.`;

    // ---- Next up ----
    if (next) {
      const state = getState(next.slug);
      const started = state.conceptSeen || state.attempts > 0 || state.hints > 0;
      nextCard.replaceChildren(
        h('div', { class: 'eyebrow', text: solvedCount === 0 ? 'Start here' : 'Next up' }),
        h('h3', { class: 'next-title' }, h('span', { class: 'next-num', text: `#${next.order}` }), next.title),
        h('div', { class: 'next-meta' },
          h('span', { class: `level ${next.difficulty}`, text: cap(next.difficulty) }),
          next.tags.slice(0, 3).map((t) => h('span', { class: 'chip', text: t }))
        ),
        h('p', { class: 'next-text', text: started ? 'You have already started this one. Pick up where you left off.' : 'Read the short concept first, then solve it in your own way. The hints are there for when you get stuck.' }),
        h('div', { class: 'next-actions' },
          h('a', { class: 'btn btn-primary', href: `#/problem/${next.slug}` }, started ? 'Continue' : 'Start problem', icon('arrow', 16)),
          h('a', { class: 'btn btn-ghost', href: '#/problems', text: 'Browse all problems' })
        )
      );
    } else {
      nextCard.replaceChildren(
        h('div', { class: 'eyebrow', text: 'All done' }),
        h('h3', { class: 'next-title', text: 'You solved every Basics problem' }),
        h('p', { class: 'next-text', text: 'More topics are on the way. The roadmap shows what comes next, and you can always go back and solve a problem in another language.' }),
        h('div', { class: 'next-actions' },
          h('a', { class: 'btn btn-primary', href: '#/roadmap' }, 'Open the roadmap', icon('arrow', 16)),
          h('a', { class: 'btn btn-ghost', href: '#/problems', text: 'Browse all problems' })
        )
      );
    }

    // ---- Progress ----
    const percent = total ? Math.round((solvedCount / total) * 100) : 0;
    progressCard.replaceChildren(
      h('div', { class: 'card-label', text: 'Your progress' }),
      h('div', { class: 'progress-figure' }, h('strong', { text: String(solvedCount) }), h('span', { text: ` / ${total}` })),
      bar(solvedCount, total, '', `${solvedCount} of ${total} problems solved`),
      h('div', { class: 'hint', text: `${percent}% of the Basics topic. The other topics open soon.` })
    );

    // ---- By level ----
    levelsCard.replaceChildren(
      h('h3', { text: 'By difficulty' }),
      h('div', { class: 'level-rows' }, LEVELS.map((level) => {
        const all = problems.filter((p) => p.difficulty === level);
        const done = all.filter((p) => solvedAll[p.slug]).length;
        return h('div', { class: 'level-row' },
          h('span', { class: `level ${level}`, text: cap(level) }),
          bar(done, all.length, level, `${done} of ${all.length} ${level} problems solved`),
          h('span', { class: 'count', text: `${done} / ${all.length}` })
        );
      }))
    );

    // ---- Streak ----
    streakCard.replaceChildren(
      h('h3', { text: 'Solving streak' }),
      h('div', { class: 'streak-value' }, h('strong', { text: String(stats.current) }), h('span', { text: stats.current === 1 ? ' day' : ' days' })),
      h('div', { class: 'streak-dots', role: 'img', 'aria-label': 'The last 28 days, oldest first; a filled square is a day with a solved problem' },
        stats.recent.map((d) => h('span', { class: `dot${d.on ? ' on' : ''}${d.isToday ? ' today' : ''}` }))
      ),
      h('div', { class: 'hint', text: stats.solvedToday ? 'You solved a problem today. Nice.' : stats.current > 0 ? 'Solve one today to keep the streak going.' : 'Solve a problem today to start a streak.' }),
      h('div', { class: 'streak-foot' }, `Best streak: ${stats.best} ${stats.best === 1 ? 'day' : 'days'}`, ' · ', `Last 7 days: ${stats.week} solved`)
    );

    // ---- Recently solved ----
    const recent = solvedEntries.sort((a, b) => b[1].at - a[1].at).slice(0, 5);   // the five newest
    recentCard.replaceChildren(
      h('h3', { text: 'Recently solved' }),
      recent.length
        ? h('ul', { class: 'recent-list' }, recent.map(([slug, e]) => {
          const p = bySlug.get(slug);
          const lang = LANGUAGES.find((l) => l.id === e.lang);
          return h('li', null, h('a', { class: 'recent-item', href: `#/problem/${slug}` },
            h('span', { class: 'recent-num', text: `#${p.order}` }),
            h('span', { class: 'recent-title', text: p.title }),
            h('span', { class: 'recent-meta', text: `${lang ? lang.label + ' · ' : ''}${when(e.at)}` })
          ));
        }))
        : h('p', { class: 'muted', text: 'Nothing yet. The problems you solve will appear here.' })
    );
  }

  loadIndex().then((data) => fill(data.problems)).catch(() => {
    subtitle.textContent = 'Your progress could not be loaded. Reload the page to try again.';
    nextCard.replaceChildren(h('div', { class: 'eyebrow', text: 'Problems' }), h('p', { class: 'next-text', text: 'The problem list could not be loaded.' }),
      h('div', { class: 'next-actions' }, h('a', { class: 'btn btn-primary', href: '#/problems', text: 'Open the problems' })));
  });

  return page;
}
