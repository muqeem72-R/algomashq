import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'minutes-to-hours-and-minutes',
  title: 'Minutes to Hours and Minutes',
  topic: 'basics',
  difficulty: 'easy',
  order: 16,
  tags: ['arithmetic', 'division'],

  concept: {
    title: 'Splitting a total with / and %',
    body: [
      'Going from a small unit to bigger ones uses the two division operators together. For a total of `m` minutes, the **whole hours** are `m / 60` (whole-number division) and the **minutes left over** are `m % 60`. For `m = 135`: `135 / 60 = 2` hours and `135 % 60 = 15` minutes.',
      'This split works for any pair of units: days and hours (24), metres and centimetres (100), rupees and paise (100).',
      'Remember that Python writes the whole-number division as `//`.'
    ]
  },

  statement: ['You are given a number of minutes `m`. Print it as whole hours and the remaining minutes, in the format `H hours M minutes`.'],
  inputFormat: ['A single integer `m`.'],
  outputFormat: ['One line: `H hours M minutes`, where `H` and `M` are numbers. Always use the plural words, even for 1.'],
  constraints: ['0 <= m <= 10^9'],
  examples: [{ input: '135\n', note: '135 minutes are 2 hours and 15 minutes.' }, { input: '45\n', note: 'Less than an hour: 0 hours 45 minutes.' }],
  hints: [
    'How many full hours fit into `m` minutes?',
    'Hours: `m / 60` (whole division). Minutes left over: `m % 60`.',
    'Print the number, the word `hours`, the number, the word `minutes`, separated by spaces.'
  ],
  program: {
    io: ['m:int'],
    python: r`
      hours = m // 60
      minutes = m % 60
      print(hours, "hours", minutes, "minutes")`,
    cpp: r`
      long long hours = m / 60;
      long long minutes = m % 60;
      cout << hours << " hours " << minutes << " minutes" << endl;`,
    java: r`
      long hours = m / 60;
      long minutes = m % 60;
      System.out.println(hours + " hours " + minutes + " minutes");`
  },
  solution: {
    explanation: ['The quotient of the division by 60 is the number of whole hours, the remainder is what is left over in minutes.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const m = Number(input.trim()); return `${Math.floor(m / 60)} hours ${m % 60} minutes`; },
  tests() {
    const g = rng(16);
    return ['135\n', '45\n', '0\n', '60\n', '59\n', '61\n', '1440\n', '1000000000\n', ...many(5, () => `${randInt(g, 0, 1e9)}\n`)];
  }
};
