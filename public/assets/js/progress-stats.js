// The numbers behind the Progress page, as plain functions of the learner's data (no page, no network), so they can be tested.
//
// A "day" is a whole number for a calendar day in the learner's own time zone (see dayNumber). The solves are the rows kept
// by the account: one per problem and language, each with the moment it was first accepted.

export const DAY = 86400000;

// The calendar day a moment falls in, as a number: consecutive days differ by exactly 1, whatever the time zone or summer time.
export const dayNumber = (ts) => {
  const d = new Date(ts);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
};

// The date of a day number. Read it with the getUTC... methods: the day number was built from the local date.
export const dateOf = (day) => new Date(day * DAY);

// Monday is 0 ... Sunday is 6.
export const weekdayIndex = (day) => (dateOf(day).getUTCDay() + 6) % 7;

// How many solves each calendar day has: Map(day -> count). Solving the same problem in a second language is a solve of its own.
export function solvesPerDay(items) {
  const days = new Map();
  for (const it of items) {
    const day = dayNumber(it.at);
    days.set(day, (days.get(day) || 0) + 1);
  }
  return days;
}

// The solves of each day, for the tooltip: Map(day -> [item, ...]) with the oldest first.
export function itemsPerDay(items) {
  const days = new Map();
  for (const it of [...items].sort((a, b) => a.at - b.at)) {
    const day = dayNumber(it.at);
    if (!days.has(day)) days.set(day, []);
    days.get(day).push(it);
  }
  return days;
}

// Current streak (days in a row up to today; a day without a solve yet today does not end it), the best streak ever, and the
// number of days with at least one solve.
export function streaks(dayCounts, today) {
  let current = 0;
  for (let cursor = dayCounts.has(today) ? today : today - 1; dayCounts.has(cursor); cursor--) current++;
  let best = 0, run = 0, previous = null;
  for (const d of [...dayCounts.keys()].sort((a, b) => a - b)) {
    run = previous !== null && d === previous + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = d;
  }
  return { current, best, activeDays: dayCounts.size };
}

// The calendar: `span` days before today, today, and `span` days after: 2 * span + 1 cells (61 for 30), each with the
// day of the month to print. `pad` is how many empty cells come first so that the first day sits under its weekday (Monday first).
export function calendar(today, dayCounts, span = 30) {
  const cells = [];
  for (let day = today - span; day <= today + span; day++) {
    const date = dateOf(day);
    cells.push({
      day,
      dayOfMonth: date.getUTCDate(),
      month: date.getUTCMonth(),
      year: date.getUTCFullYear(),
      weekday: weekdayIndex(day),
      count: dayCounts.get(day) || 0,
      isToday: day === today,
      isFuture: day > today
    });
  }
  return { cells, pad: cells[0].weekday };
}

// Solves per week for the last `weeks` weeks (Monday to Sunday), the last one being the week of today.
export function weeklyTotals(dayCounts, today, weeks = 12) {
  const thisMonday = today - weekdayIndex(today);
  const out = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const start = thisMonday - w * 7;
    let count = 0;
    for (let d = start; d < start + 7; d++) count += dayCounts.get(d) || 0;
    out.push({ start, count, isCurrent: w === 0 });
  }
  return out;
}

// One row per topic that has problems, and how many topics are still to come.
export function topicRows(problems, solvedMap, topics) {
  const rows = [];
  for (const t of topics) {
    const mine = problems.filter((p) => p.topic === t.id);
    if (mine.length) rows.push({ id: t.id, title: t.title, total: mine.length, solved: mine.filter((p) => solvedMap[p.slug]).length });
  }
  return { rows, soon: topics.length - rows.length };
}

export function levelRows(problems, solvedMap, levels = ['easy', 'medium', 'hard']) {
  return levels.map((level) => {
    const mine = problems.filter((p) => p.difficulty === level);
    return { level, total: mine.length, solved: mine.filter((p) => solvedMap[p.slug]).length };
  });
}

// Problems solved in each language (a problem solved in two languages counts in both), most first.
export function languageRows(items, languages = ['python', 'cpp', 'java']) {
  const sets = new Map(languages.map((l) => [l, new Set()]));
  for (const it of items) if (sets.has(it.lang)) sets.get(it.lang).add(it.slug);
  return languages.map((lang) => ({ lang, count: sets.get(lang).size })).sort((a, b) => b.count - a.count || languages.indexOf(a.lang) - languages.indexOf(b.lang));
}

// How the learning went, from the per-problem state ({ conceptSeen, hints, revealed, attempts }) of the solved problems.
// Neutral numbers: no judgement is made about them.
export function habits(solvedMap, states) {
  const state = (slug) => states[slug] || {};
  const solved = Object.keys(solvedMap);
  const attempted = solved.filter((slug) => (state(slug).attempts || 0) >= 1);
  const attemptTotal = attempted.reduce((sum, slug) => sum + state(slug).attempts, 0);
  return {
    solved: solved.length,
    withoutHints: solved.filter((slug) => !(state(slug).hints > 0)).length,
    firstSubmit: solved.filter((slug) => state(slug).attempts === 1).length,
    solutionOpenedFirst: solved.filter((slug) => !!state(slug).revealed).length,
    hintsOpened: Object.values(states).reduce((sum, s) => sum + (s.hints || 0), 0),
    conceptsRead: Object.values(states).filter((s) => s.conceptSeen).length,
    averageAttempts: attempted.length ? Math.round((attemptTotal / attempted.length) * 10) / 10 : null
  };
}

// A small set of milestones. Each has a value and a goal; it is done when the value reaches the goal.
export function milestones({ solved, total, easySolved, easyTotal, bestStreak, languagesUsed }) {
  const m = (id, title, text, value, goal) => ({ id, title, text, value: Math.min(value, goal), goal, done: goal > 0 && value >= goal });
  return [
    m('first', 'First solve', 'Solve your first problem.', solved, 1),
    m('ten', '10 problems', 'Solve 10 problems.', solved, 10),
    m('twenty-five', '25 problems', 'Solve 25 problems.', solved, 25),
    m('fifty', '50 problems', 'Solve 50 problems.', solved, 50),
    m('easy', 'All the Easy ones', 'Solve every Easy problem.', easySolved, easyTotal),
    m('every', 'Every problem', 'Solve every problem.', solved, total),
    m('streak', '7 days in a row', 'Solve something on 7 days in a row.', bestStreak, 7),
    m('languages', 'Three languages', 'Solve a problem in Python, in C++ and in Java.', languagesUsed, 3)
  ];
}
