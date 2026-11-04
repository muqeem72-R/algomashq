// The Progress page: how the learner is doing, in numbers. It only reads what the account already keeps (the solves, the
// per-problem state); the numbers come from progress-stats.js. Only its owner can see it.
//
// Charts follow a few fixed rules: one hue (the accent) in steps for "how much", thin marks, a hover/focus readout on every
// mark, text in text colors, and a table view under each chart that holds the same numbers.

import { h, icon } from '../dom.js';
import { TOPICS, LANGUAGES } from '../data/topics.js';
import { loadIndex } from '../problems-data.js';
import * as progress from '../progress.js';
import * as stats from '../progress-stats.js';
import { createTooltip } from '../components/viz-tooltip.js';

const NS = 'http://www.w3.org/2000/svg';
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const languageLabel = (id) => (LANGUAGES.find((l) => l.id === id) || { label: id }).label;

// A day number is a local calendar date held as UTC midnight, so it is formatted in UTC.
const dayText = (day, options) => stats.dateOf(day).toLocaleDateString(undefined, { timeZone: 'UTC', ...options });
const monthShort = (day) => dayText(day, { month: 'short' });

function svg(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  for (const kid of kids) el.append(kid instanceof Node ? kid : document.createTextNode(kid));
  return el;
}

const meter = (value, max, label) => h('progress', { class: 'bar tint', max: Math.max(1, max), value, 'aria-label': label });

// A table under a chart with the same numbers, for anyone who cannot or would rather not use the chart.
function tableView(summary, head, rows) {
  return h('details', { class: 'viz-table' },
    h('summary', { text: summary }),
    h('table', null,
      h('thead', null, h('tr', null, head.map((t) => h('th', { text: t })))),
      h('tbody', null, rows.map((cells) => h('tr', null, cells.map((c) => h('td', { text: String(c) })))))));
}

export function progressView(ctx) {
  const tip = createTooltip();
  const body = h('div', { class: 'prog-body' }, h('div', { class: 'card empty' }, h('p', { class: 'muted', text: 'Loading your progress...' })));
  const page = h('div', { class: 'page prog' },
    h('div', { class: 'page-head' },
      h('h2', { text: 'Progress' }),
      h('p', { text: 'How you are doing, in numbers. Only you can see this page.' })),
    body,
    tip.el);

  loadIndex().then((data) => body.replaceChildren(...build(data.problems))).catch(() => {
    body.replaceChildren(h('div', { class: 'card empty' }, h('h3', { text: 'Could not load your progress' }), h('p', { text: 'Check your connection and reload the page.' })));
  });

  function build(problems) {
    const bySlug = new Map(problems.map((p) => [p.slug, p]));
    // A solve of a problem that no longer exists is ignored.
    const items = progress.getSolveItems().filter((it) => bySlug.has(it.slug));
    const solvedMap = {};
    for (const [slug, v] of Object.entries(progress.getSolved())) if (bySlug.has(slug)) solvedMap[slug] = v;
    const states = progress.getAllStates();
    const today = stats.dayNumber(Date.now());
    const dayCounts = stats.solvesPerDay(items);
    const byDay = stats.itemsPerDay(items);
    const streak = stats.streaks(dayCounts, today);
    const solvedCount = Object.keys(solvedMap).length;
    const total = problems.length;
    const levels = stats.levelRows(problems, solvedMap);
    const langs = stats.languageRows(items);
    const topics = stats.topicRows(problems, solvedMap, TOPICS);
    const habit = stats.habits(solvedMap, states);
    const easy = levels.find((l) => l.level === 'easy') || { solved: 0, total: 0 };
    const titleOf = (slug) => { const p = bySlug.get(slug); return p ? `#${p.order} ${p.title}` : slug; };

    // ---------- the numbers on top ----------
    const percent = total ? Math.round((solvedCount / total) * 100) : 0;
    const hero = h('section', { class: 'card prog-card prog-hero' },
      h('div', { class: 'card-label', text: 'Problems solved' }),
      h('div', { class: 'prog-hero-value' }, h('strong', { text: String(solvedCount) }), h('span', { text: ` / ${total}` })),
      meter(solvedCount, total, `${solvedCount} of ${total} problems solved`),
      h('div', { class: 'hint', text: `${percent}% of all problems` }));
    const tile = (label, value, hint) => h('section', { class: 'card prog-card' },
      h('div', { class: 'card-label', text: label }), h('div', { class: 'tile-value', text: value }), h('div', { class: 'hint', text: hint }));
    const top = h('div', { class: 'prog-row prog-stats' }, hero,
      tile('Active days', String(streak.activeDays), 'days on which you solved something'),
      tile('Current streak', plural(streak.current, 'day', 'days'), streak.current ? 'in a row, up to today' : 'Solve one today to start it'),
      tile('Best streak', plural(streak.best, 'day', 'days'), 'the longest run so far'));

    // ---------- the calendar: 30 days back, today, 30 days ahead ----------
    const { cells, pad } = stats.calendar(today, dayCounts, 30);
    const inWindow = cells.filter((c) => !c.isFuture);
    const windowSolves = inWindow.reduce((n, c) => n + c.count, 0);
    const windowDays = inWindow.filter((c) => c.count > 0).length;
    const grid = h('div', { class: 'cal-grid' });
    for (let i = 0; i < pad; i++) grid.append(h('div', { class: 'cal-cell is-pad', 'aria-hidden': 'true' }));
    cells.forEach((c, i) => {
      const date = dayText(c.day, { weekday: 'long', day: 'numeric', month: 'long' });
      const solves = byDay.get(c.day) || [];
      const what = c.count ? `${plural(c.count, 'problem', 'problems')} solved` : c.isFuture ? 'Nothing yet' : 'No problems solved';
      const cell = h('div', {
        class: `cal-cell${c.count >= 2 ? ' l2' : c.count === 1 ? ' l1' : ''}${c.isToday ? ' is-today' : ''}${c.isFuture ? ' is-future' : ''}`,
        role: 'img', 'aria-label': `${date}${c.isToday ? ' (today)' : ''}: ${what}`, tabindex: c.count || c.isToday ? '0' : null
      },
      (i === 0 || c.dayOfMonth === 1) ? h('span', { class: 'cal-mon', text: monthShort(c.day) }) : null,
      h('span', { class: 'cal-day', text: String(c.dayOfMonth) }));
      tip.bind(cell, () => ({
        value: what, label: `${date}${c.isToday ? ', today' : ''}`,
        rows: [...solves.slice(0, 4).map((s) => `${titleOf(s.slug)} (${languageLabel(s.lang)})`), ...(solves.length > 4 ? [`and ${solves.length - 4} more`] : [])]
      }));
      grid.append(cell);
    });
    const calendarRows = inWindow.filter((c) => c.count).reverse().map((c) => [
      dayText(c.day, { weekday: 'short', day: 'numeric', month: 'short' }),
      (byDay.get(c.day) || []).map((s) => `${titleOf(s.slug)} (${languageLabel(s.lang)})`).join(', ')
    ]);
    const calendarCard = h('section', { class: 'card prog-card' },
      h('h3', { text: 'Your solving calendar' }),
      h('p', { class: 'sub', text: `30 days back, today and 30 days ahead. A day lights up when you solve something. ${windowSolves ? `${plural(windowSolves, 'solve', 'solves')} on ${plural(windowDays, 'day', 'days')} so far.` : 'Nothing solved in the last 30 days yet.'}` }),
      h('div', { class: 'cal-head', 'aria-hidden': 'true' }, WEEKDAYS.map((d) => h('span', { text: d }))),
      grid,
      h('div', { class: 'cal-legend' },
        h('span', { class: 'swatch-key' }, h('i', { class: 'cal-cell mini' }), 'No solves'),
        h('span', { class: 'swatch-key' }, h('i', { class: 'cal-cell mini l1' }), '1 solve'),
        h('span', { class: 'swatch-key' }, h('i', { class: 'cal-cell mini l2' }), '2 or more'),
        h('span', { class: 'swatch-key' }, h('i', { class: 'cal-cell mini is-today' }), 'Today')),
      tableView('View as a table', ['Day', 'Problems solved'], calendarRows.length ? calendarRows : [['-', 'Nothing solved in the last 30 days']]));

    // ---------- milestones ----------
    const mileList = stats.milestones({
      solved: solvedCount, total, easySolved: easy.solved, easyTotal: easy.total,
      bestStreak: streak.best, languagesUsed: langs.filter((l) => l.count > 0).length
    });
    const doneCount = mileList.filter((m) => m.done).length;
    const milestoneCard = h('section', { class: 'card prog-card' },
      h('h3', { text: 'Milestones' }),
      h('p', { class: 'sub', text: `${doneCount} of ${mileList.length} reached.` }),
      h('div', { class: 'milestones' }, mileList.map((m) => h('div', { class: `milestone${m.done ? ' is-done' : ''}` },
        h('span', { class: 'ms-icon' }, icon(m.done ? 'check' : 'lock', 15)),
        h('div', { class: 'ms-text' },
          h('strong', { text: m.title }),
          h('span', { text: m.done ? 'Reached' : `${m.value} / ${m.goal}` }),
          h('small', { text: m.text }))))));
    const middle = h('div', { class: 'prog-row prog-split' }, calendarCard, milestoneCard);

    // ---------- by topic, difficulty and language ----------
    // A row with a name (text or a badge), how many of how many, and a meter.
    const meterRow = (name, ariaName, value, max) => h('div', { class: 'meter-row' },
      h('div', { class: 'meter-name' }, name),
      h('div', { class: 'meter-count', text: `${value} / ${max}` }),
      meter(value, max, `${ariaName}: ${value} of ${max}`));
    const topicCard = h('section', { class: 'card prog-card' },
      h('h3', { text: 'By topic' }),
      h('div', { class: 'meter-list' }, topics.rows.map((t) => meterRow(t.title, t.title, t.solved, t.total))),
      topics.soon ? h('p', { class: 'hint', text: `${plural(topics.soon, 'more topic is', 'more topics are')} on the way.` }) : null);
    const levelCard = h('section', { class: 'card prog-card' },
      h('h3', { text: 'By difficulty' }),
      h('div', { class: 'meter-list' }, levels.map((l) => meterRow(h('span', { class: `level ${l.level}`, text: cap(l.level) }), `${cap(l.level)} problems`, l.solved, l.total))));
    const most = Math.max(1, ...langs.map((l) => l.count));
    const languageCard = h('section', { class: 'card prog-card' },
      h('h3', { text: 'By language' }),
      h('p', { class: 'sub', text: 'Problems you solved in each language.' }),
      h('div', { class: 'meter-list' }, langs.map((l) => h('div', { class: 'meter-row' },
        h('div', { class: 'meter-name', text: languageLabel(l.lang) }),
        h('div', { class: 'meter-count', text: String(l.count) }),
        meter(l.count, most, `${languageLabel(l.lang)}: ${l.count} problems`)))));
    const three = h('div', { class: 'prog-row prog-three' }, topicCard, levelCard, languageCard);

    // ---------- the last 12 weeks ----------
    const weeks = stats.weeklyTotals(dayCounts, today, 12);
    const counts = weeks.map((w) => w.count);
    const maxCount = Math.max(...counts);
    const ceiling = maxCount <= 4 ? 4 : maxCount <= 8 ? 8 : maxCount <= 12 ? 12 : Math.ceil(maxCount / 4) * 4;
    const W = 600, H = 220, L = 34, R = 8, T = 18, B = 30;
    const plotW = W - L - R, plotH = H - T - B, slot = plotW / weeks.length, barW = Math.min(24, slot * 0.56);
    const yOf = (v) => T + plotH - (v / ceiling) * plotH;
    const chart = svg('svg', { class: 'viz-chart', viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': 'Problems solved in each of the last 12 weeks' });
    for (const tick of [0, ceiling / 2, ceiling]) {
      chart.append(svg('line', { class: 'viz-grid', x1: L, x2: W - R, y1: yOf(tick), y2: yOf(tick) }));
      chart.append(svg('text', { class: 'viz-axis', x: L - 8, y: yOf(tick) + 4, 'text-anchor': 'end' }, String(tick)));
    }
    const labelled = new Set([weeks.length - 1, counts.indexOf(maxCount)]);
    weeks.forEach((w, i) => {
      const x = L + i * slot + (slot - barW) / 2;
      const bh = (w.count / ceiling) * plotH;
      const weekText = `Week of ${dayText(w.start, { day: 'numeric', month: 'short' })}`;
      const what = plural(w.count, 'problem', 'problems') + ' solved';
      const slotEl = svg('g', { class: 'viz-slot', tabindex: '0', role: 'img', 'aria-label': `${weekText}${w.isCurrent ? ' (this week so far)' : ''}: ${what}` },
        svg('rect', { class: 'viz-hit', x: L + i * slot, y: T - 6, width: slot, height: plotH + B + 6 - 8 }));
      if (w.count > 0) {
        const r = Math.min(4, bh);
        slotEl.append(svg('path', { class: 'viz-bar', d: `M${x},${yOf(0)} V${yOf(w.count) + r} Q${x},${yOf(w.count)} ${x + r},${yOf(w.count)} H${x + barW - r} Q${x + barW},${yOf(w.count)} ${x + barW},${yOf(w.count) + r} V${yOf(0)} Z` }));
        if (labelled.has(i)) slotEl.append(svg('text', { class: 'viz-value', x: x + barW / 2, y: yOf(w.count) - 6, 'text-anchor': 'middle' }, String(w.count)));
      }
      if ((weeks.length - 1 - i) % 2 === 0) slotEl.append(svg('text', { class: 'viz-axis', x: x + barW / 2, y: H - 10, 'text-anchor': 'middle' }, w.isCurrent ? 'This week' : dayText(w.start, { day: 'numeric', month: 'short' })));
      tip.bind(slotEl, () => ({ value: what, label: `${weekText}${w.isCurrent ? ', this week so far' : ''}`, rows: [] }));
      chart.append(slotEl);
    });
    const total12 = counts.reduce((a, b) => a + b, 0);
    const weeklyCard = h('section', { class: 'card prog-card' },
      h('h3', { text: 'Solved each week' }),
      h('p', { class: 'sub', text: total12 ? `${plural(total12, 'solve', 'solves')} in the last 12 weeks.` : 'Nothing solved in the last 12 weeks yet.' }),
      chart,
      tableView('View as a table', ['Week of', 'Problems solved'], weeks.map((w) => [dayText(w.start, { day: 'numeric', month: 'short', year: 'numeric' }), w.count])));

    // ---------- how you learn ----------
    const dash = (n) => (solvedCount ? String(n) : '-');
    const habitRow = (label, value, of) => h('div', { class: 'habit-row' },
      h('span', { text: label }), h('span', { class: 'habit-value' }, value, of ? h('small', { text: ` of ${of}` }) : null));
    const habitCard = h('section', { class: 'card prog-card' },
      h('h3', { text: 'How you learn' }),
      h('p', { class: 'sub', text: 'Plain numbers for you. Nothing here is good or bad.' }),
      habitRow('Solved without any hint', dash(habit.withoutHints), solvedCount || null),
      habitRow('Accepted on the first submit', dash(habit.firstSubmit), solvedCount || null),
      habitRow('Opened the solution before solving', dash(habit.solutionOpenedFirst), solvedCount || null),
      habitRow('Hints opened in all', String(habit.hintsOpened)),
      habitRow('Concepts read', String(habit.conceptsRead), total),
      habitRow('Submits per solved problem', habit.averageAttempts === null ? '-' : String(habit.averageAttempts)));
    const lower = h('div', { class: 'prog-row prog-split' }, weeklyCard, habitCard);

    // ---------- the solved problems ----------
    const filter = { level: 'all', lang: 'all' };
    const listHost = h('div', { class: 'prog-list' });
    const segmented = (name, label, options, onPick) => h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': label },
      options.map(([value, text]) => h('label', null,
        h('input', { type: 'radio', name, value, checked: value === 'all', onChange: () => onPick(value) }), h('span', { text }))));
    const drawList = () => {
      const rows = Object.entries(solvedMap)
        .map(([slug, v]) => ({ p: bySlug.get(slug), first: v.at, languages: progress.solvedLanguages(slug) }))
        .filter((r) => (filter.level === 'all' || r.p.difficulty === filter.level) && (filter.lang === 'all' || r.languages.includes(filter.lang)))
        .sort((a, b) => b.first - a.first);
      if (!rows.length) {
        listHost.replaceChildren(h('p', { class: 'muted', text: solvedCount ? 'No solved problem matches these filters.' : 'You have not solved a problem yet. The ones you solve will be listed here.' }),
          solvedCount ? null : h('a', { class: 'btn btn-ghost btn-sm', href: '#/problems', text: 'Find a problem to solve' }));
        return;
      }
      listHost.replaceChildren(h('table', { class: 'ptable' },
        h('thead', null, h('tr', null, ['#', 'Problem', 'Level', 'Languages', 'First solved'].map((t) => h('th', { text: t })))),
        h('tbody', null, rows.map((r) => h('tr', null,
          h('td', { class: 'ptable-num', text: String(r.p.order) }),
          h('td', null, h('a', { class: 'ptable-title', href: `#/problem/${r.p.slug}`, text: r.p.title })),
          h('td', null, h('span', { class: `level ${r.p.difficulty}`, text: cap(r.p.difficulty) })),
          h('td', null, h('span', { class: 'lang-chips' }, r.languages.map((l) => h('span', { class: 'chip', text: languageLabel(l) })))),
          h('td', { class: 'muted', text: new Date(r.first).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) }))))));
    };
    const listCard = h('section', { class: 'card prog-card' },
      h('div', { class: 'prog-list-head' },
        h('h3', { text: 'Solved problems' }),
        h('div', { class: 'prog-filters' },
          segmented('prog-level', 'Difficulty', [['all', 'All'], ['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']], (v) => { filter.level = v; drawList(); }),
          segmented('prog-lang', 'Language', [['all', 'Any language'], ...LANGUAGES.map((l) => [l.id, l.label])], (v) => { filter.lang = v; drawList(); }))),
      listHost);
    drawList();

    return [top, middle, three, lower, listCard];
  }

  return page;
}
