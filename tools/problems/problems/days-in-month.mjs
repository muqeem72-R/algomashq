import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

const leap = (y) => y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0);
const days = (m, y) => (m === 2 ? (leap(y) ? 29 : 28) : [4, 6, 9, 11].includes(m) ? 30 : 31);

export default {
  slug: 'days-in-month',
  title: 'Days in a Month',
  topic: 'basics',
  difficulty: 'easy',
  order: 31,
  tags: ['conditions', 'logic'],

  concept: {
    title: 'Putting small rules together',
    body: [
      'Bigger problems are built from small rules you already know. The length of a month follows a simple pattern: April, June, September and November have 30 days, February has 28 (or 29 in a leap year) and all other months have 31.',
      'You already wrote the leap-year test in an earlier problem. Here it only matters for February, so it sits *inside* the branch for February. Always try to reuse a piece you have solved before instead of starting from scratch.',
      'Grouping several exact values is easy with `or` (`||`), or in Python with `month in (4, 6, 9, 11)`.'
    ]
  },

  statement: ['Given a month number (1 to 12) and a year, print the number of days in that month of that year.', 'A year is a leap year if it is divisible by 400, or if it is divisible by 4 but not by 100.'],
  inputFormat: ['One line with two integers `month` and `year`.'],
  outputFormat: ['The number of days.'],
  constraints: ['1 <= month <= 12', '1 <= year <= 10^9'],
  examples: [{ input: '2 2024\n', note: 'February in a leap year has 29 days.' }, { input: '9 2023\n', note: 'September has 30 days.' }],
  hints: [
    'Which months have 30 days? Which one is special?',
    'February needs the leap-year test: 29 days in a leap year, otherwise 28.',
    'Every other month has 31 days, so it can be the final `else`.'
  ],
  program: {
    io: ['month:int year:int'],
    python: r`
      if month == 2:
          if year % 400 == 0 or (year % 4 == 0 and year % 100 != 0):
              print(29)
          else:
              print(28)
      elif month in (4, 6, 9, 11):
          print(30)
      else:
          print(31)`,
    cpp: r`
      if (month == 2) {
          if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) {
              cout << 29 << endl;
          } else {
              cout << 28 << endl;
          }
      } else if (month == 4 || month == 6 || month == 9 || month == 11) {
          cout << 30 << endl;
      } else {
          cout << 31 << endl;
      }`,
    java: r`
      if (month == 2) {
          if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) {
              System.out.println(29);
          } else {
              System.out.println(28);
          }
      } else if (month == 4 || month == 6 || month == 9 || month == 11) {
          System.out.println(30);
      } else {
          System.out.println(31);
      }`
  },
  solution: {
    explanation: ['February is the only month that depends on the year, so the leap-year test is nested inside its branch. The four 30-day months are grouped in one condition, and the rest have 31 days.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const [m, y] = input.trim().split(/\s+/).map(Number); return String(days(m, y)); },
  tests() {
    const g = rng(31);
    return ['2 2024\n', '9 2023\n', '2 1900\n', '2 2000\n', '2 2023\n', '1 2023\n', '4 2023\n', '12 2023\n', '11 1\n', '2 1000000000\n', ...many(5, () => `${randInt(g, 1, 12)} ${randInt(g, 1, 3000)}\n`)];
  }
};
