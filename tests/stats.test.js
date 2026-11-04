// The numbers behind the Progress page: days, streaks, the 61-day calendar, weekly totals, topic / level / language rows,
// the learning habits and the milestones.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dayNumber, dateOf, weekdayIndex, solvesPerDay, itemsPerDay, streaks, calendar, weeklyTotals,
  topicRows, levelRows, languageRows, habits, milestones
} from '../public/assets/js/progress-stats.js';

// A moment on a local calendar day (month is 1 to 12), so the tests mean the same in every time zone.
const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime();
const TODAY = dayNumber(at(2026, 11, 4));
const dayAgo = (n) => TODAY - n;
const solve = (slug, lang, daysAgo, hour = 12) => ({ slug, lang, at: at(2026, 11, 4 - daysAgo, hour) });

test('consecutive calendar days differ by exactly 1, whatever the hour', () => {
  assert.equal(dayNumber(at(2026, 11, 4, 0)), dayNumber(at(2026, 11, 4, 23)));
  assert.equal(dayNumber(at(2026, 11, 5)) - dayNumber(at(2026, 11, 4)), 1);
  assert.equal(dayNumber(at(2026, 12, 1)) - dayNumber(at(2026, 11, 30)), 1, 'across a month');
  assert.equal(dayNumber(at(2027, 1, 1)) - dayNumber(at(2026, 12, 31)), 1, 'across a year');
  assert.equal(dayNumber(at(2028, 3, 1)) - dayNumber(at(2028, 2, 29)), 1, 'across a leap day');
});

test('a day number turns back into the date it came from', () => {
  const d = dateOf(dayNumber(at(2026, 11, 4)));
  assert.deepEqual([d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()], [2026, 10, 4]);
  // 4 November 2026 is a Wednesday: Monday is 0, so Wednesday is 2.
  assert.equal(weekdayIndex(TODAY), 2);
  assert.equal(weekdayIndex(TODAY - 2), 0, 'Monday');
  assert.equal(weekdayIndex(TODAY + 4), 6, 'Sunday');
});

test('solves are counted per day, and a second language is a solve of its own', () => {
  const items = [solve('a', 'cpp', 0, 9), solve('b', 'python', 0, 20), solve('a', 'python', 0, 21), solve('c', 'java', 3)];
  const days = solvesPerDay(items);
  assert.equal(days.get(TODAY), 3);
  assert.equal(days.get(dayAgo(3)), 1);
  assert.equal(days.size, 2);
  const byDay = itemsPerDay(items);
  assert.deepEqual(byDay.get(TODAY).map((i) => i.slug + i.lang), ['acpp', 'bpython', 'apython'], 'oldest first');
});

test('streaks: days in a row up to today, yesterday still counts, a gap breaks it', () => {
  const run = (list) => streaks(solvesPerDay(list.map((n) => solve('x', 'cpp', n))), TODAY);
  assert.deepEqual(run([]), { current: 0, best: 0, activeDays: 0 });
  assert.deepEqual(run([0]), { current: 1, best: 1, activeDays: 1 });
  assert.deepEqual(run([0, 1, 2, 3]), { current: 4, best: 4, activeDays: 4 });
  assert.equal(run([1, 2, 3]).current, 3, 'nothing solved yet today does not end the streak');
  assert.equal(run([2, 3, 4]).current, 0, 'a missed yesterday does');
  const gap = run([0, 1, 5, 6, 7, 8, 9]);
  assert.equal(gap.current, 2);
  assert.equal(gap.best, 5);
  assert.equal(gap.activeDays, 7);
});

test('the calendar has 61 days: 30 before today, today, and 30 after, each with its day of the month', () => {
  const days = solvesPerDay([solve('a', 'cpp', 0), solve('b', 'cpp', 0), solve('c', 'cpp', 5), solve('d', 'cpp', 29), solve('e', 'cpp', 45)]);
  const { cells, pad } = calendar(TODAY, days);
  assert.equal(cells.length, 61);
  assert.equal(cells[0].day, TODAY - 30);
  assert.equal(cells[30].day, TODAY);
  assert.equal(cells[60].day, TODAY + 30);
  assert.equal(cells.filter((c) => c.isToday).length, 1);
  assert.ok(cells[30].isToday);
  assert.equal(cells.filter((c) => c.isFuture).length, 30);
  assert.ok(cells.slice(0, 30).every((c) => !c.isFuture && !c.isToday));
  // 4 November 2026: 30 days before is 5 October, 30 days after is 4 December.
  assert.deepEqual([cells[0].dayOfMonth, cells[0].month], [5, 9]);
  assert.deepEqual([cells[30].dayOfMonth, cells[30].month], [4, 10]);
  assert.deepEqual([cells[60].dayOfMonth, cells[60].month], [4, 11]);
  assert.deepEqual(cells.map((c) => c.dayOfMonth).slice(26, 29), [31, 1, 2], 'the days count 31, then 1 again');
  assert.equal(cells[0].weekday, pad, 'the padding puts the first day under its weekday');
  // the solves land on the right days
  assert.equal(cells[30].count, 2);
  assert.equal(cells.find((c) => c.day === TODAY - 5).count, 1);
  assert.equal(cells.find((c) => c.day === TODAY - 29).count, 1);
  assert.equal(cells.reduce((n, c) => n + c.count, 0), 4, 'the solve 45 days ago is outside the window');
});

test('the calendar changes with a different span, and it crosses a year', () => {
  const winter = dayNumber(at(2026, 12, 25));
  const { cells } = calendar(winter, new Map(), 30);
  assert.equal(cells.length, 61);
  assert.deepEqual([cells[60].dayOfMonth, cells[60].month, cells[60].year], [24, 0, 2027]);
  assert.equal(calendar(TODAY, new Map(), 3).cells.length, 7);
});

test('weekly totals: 12 weeks from Monday to Sunday, the last one is this week', () => {
  const days = solvesPerDay([solve('a', 'cpp', 0), solve('b', 'cpp', 2), solve('c', 'cpp', 3), solve('d', 'cpp', 10), solve('e', 'cpp', 100)]);
  const weeks = weeklyTotals(days, TODAY);
  assert.equal(weeks.length, 12);
  assert.ok(weeks[11].isCurrent && weeks.slice(0, 11).every((w) => !w.isCurrent));
  assert.ok(weeks.every((w) => weekdayIndex(w.start) === 0), 'every week starts on a Monday');
  assert.ok(weeks[11].start <= TODAY && TODAY < weeks[11].start + 7);
  // Wednesday 4 November: Monday 2 November starts this week, so 0 and 2 days ago are this week and 3 days ago is last week.
  assert.equal(weeks[11].count, 2);
  assert.equal(weeks[10].count, 1);
  assert.equal(weeks[9].count, 1, '10 days ago');
  assert.equal(weeks.reduce((n, w) => n + w.count, 0), 4, '100 days ago is outside the 12 weeks');
});

const TOPICS = [{ id: 'basics', title: 'Basics' }, { id: 'arrays', title: 'Arrays' }, { id: 'hashing', title: 'Hashing' }];
const PROBLEMS = [
  { slug: 'a', topic: 'basics', difficulty: 'easy' }, { slug: 'b', topic: 'basics', difficulty: 'easy' },
  { slug: 'c', topic: 'basics', difficulty: 'medium' }, { slug: 'd', topic: 'basics', difficulty: 'hard' }
];

test('topic rows list only the topics that have problems, and count the ones still to come', () => {
  const { rows, soon } = topicRows(PROBLEMS, { a: {}, c: {} }, TOPICS);
  assert.deepEqual(rows, [{ id: 'basics', title: 'Basics', total: 4, solved: 2 }]);
  assert.equal(soon, 2);
});

test('level rows count the solved and the total of each level', () => {
  assert.deepEqual(levelRows(PROBLEMS, { a: {}, b: {}, d: {} }), [
    { level: 'easy', total: 2, solved: 2 }, { level: 'medium', total: 1, solved: 0 }, { level: 'hard', total: 1, solved: 1 }
  ]);
});

test('language rows count problems per language, most first, and ignore an unknown language', () => {
  const items = [solve('a', 'python', 1), solve('b', 'python', 1), solve('a', 'cpp', 1), solve('c', 'cobol', 1), solve('a', 'python', 2)];
  assert.deepEqual(languageRows(items), [{ lang: 'python', count: 2 }, { lang: 'cpp', count: 1 }, { lang: 'java', count: 0 }]);
  assert.deepEqual(languageRows([]).map((r) => r.count), [0, 0, 0]);
});

test('habits are plain counts from the state of the problems', () => {
  const solvedMap = { a: {}, b: {}, c: {}, d: {}, e: {} };
  const states = {
    a: { conceptSeen: true, hints: 0, revealed: false, attempts: 1 },
    b: { conceptSeen: true, hints: 2, revealed: false, attempts: 3 },
    c: { conceptSeen: false, hints: 0, revealed: true, attempts: 1 },
    d: { conceptSeen: true, hints: 1, revealed: false, attempts: 2 },
    z: { conceptSeen: true, hints: 3, revealed: false, attempts: 4 }   // not solved: counts only in the totals
  };
  const h = habits(solvedMap, states);
  assert.equal(h.solved, 5);
  assert.equal(h.withoutHints, 3, 'a, c and e (no state at all) had no hint');
  assert.equal(h.firstSubmit, 2, 'a and c were accepted on the first submit');
  assert.equal(h.solutionOpenedFirst, 1);
  assert.equal(h.hintsOpened, 6, 'hints of every problem, solved or not');
  assert.equal(h.conceptsRead, 4);
  assert.equal(h.averageAttempts, 1.8, '(1 + 3 + 1 + 2) / 4 over the solved problems that were submitted: 1.75, rounded');
});

test('with nothing solved the habits are zeros and the average is unknown', () => {
  assert.deepEqual(habits({}, {}), { solved: 0, withoutHints: 0, firstSubmit: 0, solutionOpenedFirst: 0, hintsOpened: 0, conceptsRead: 0, averageAttempts: null });
});

test('milestones are done when the value reaches the goal, and show at most the goal', () => {
  const list = milestones({ solved: 12, total: 100, easySolved: 12, easyTotal: 50, bestStreak: 4, languagesUsed: 3 });
  const by = Object.fromEntries(list.map((m) => [m.id, m]));
  assert.equal(list.length, 8);
  assert.ok(by.first.done && by.ten.done && by.languages.done);
  assert.ok(!by['twenty-five'].done && !by.fifty.done && !by.easy.done && !by.every.done && !by.streak.done);
  assert.equal(by.ten.value, 10, 'capped at the goal');
  assert.equal(by['twenty-five'].value, 12);
  assert.equal(by.streak.value, 4);
  assert.equal(by.easy.goal, 50);
  const none = milestones({ solved: 0, total: 100, easySolved: 0, easyTotal: 50, bestStreak: 0, languagesUsed: 0 });
  assert.ok(none.every((m) => !m.done));
  const all = milestones({ solved: 100, total: 100, easySolved: 50, easyTotal: 50, bestStreak: 9, languagesUsed: 3 });
  assert.ok(all.every((m) => m.done));
  assert.ok(milestones({ solved: 0, total: 0, easySolved: 0, easyTotal: 0, bestStreak: 0, languagesUsed: 0 }).every((m) => !m.done), 'an empty goal is never "done"');
});
