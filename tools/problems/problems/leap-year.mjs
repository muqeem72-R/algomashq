import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'leap-year',
  title: 'Leap Year',
  topic: 'basics',
  difficulty: 'easy',
  order: 23,
  tags: ['conditions', 'logic'],

  concept: {
    title: 'Combining conditions',
    body: [
      'Real rules often need several tests at once. Conditions are combined with logical operators: **and** (both must be true), **or** (at least one must be true) and **not**.',
      { code: '# Python\nif a > 0 and b > 0:\nif a > 0 or b > 0:\nif not (a > 0):\n\n// C++ and Java\nif (a > 0 && b > 0)\nif (a > 0 || b > 0)\nif (!(a > 0))' },
      'Use parentheses to make the grouping clear: `and` binds tighter than `or`, just as `*` binds tighter than `+`.',
      'The leap-year rule is a good exercise. A year is a leap year if it is divisible by 4, except that years divisible by 100 are not leap years, unless they are also divisible by 400. So 2024 and 2000 are leap years, but 1900 and 2023 are not.'
    ]
  },

  statement: ['Given a year, print `leap` if it is a leap year and `common` otherwise.', 'A year is a leap year if it is divisible by 400, or if it is divisible by 4 but not by 100.'],
  inputFormat: ['A single integer `year`.'],
  outputFormat: ['Print `leap` or `common`.'],
  constraints: ['1 <= year <= 10^9'],
  examples: [{ input: '2024\n', note: 'Divisible by 4 and not by 100: leap.' }, { input: '1900\n', note: 'Divisible by 100 but not by 400: common.' }],
  hints: [
    'Write the three divisibility tests with `%`: by 4, by 100, by 400.',
    'The rule is: (divisible by 400) or (divisible by 4 and not divisible by 100).',
    'Put the second part in parentheses so that the `and` is grouped before the `or`.'
  ],
  program: {
    io: ['year:int'],
    python: r`
      if year % 400 == 0 or (year % 4 == 0 and year % 100 != 0):
          print("leap")
      else:
          print("common")`,
    cpp: r`
      if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) {
          cout << "leap" << endl;
      } else {
          cout << "common" << endl;
      }`,
    java: r`
      if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) {
          System.out.println("leap");
      } else {
          System.out.println("common");
      }`
  },
  solution: {
    explanation: ['Years divisible by 400 are always leap years. Otherwise a year is leap when it is divisible by 4 and not by 100. Both cases are joined with `or`.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const y = Number(input.trim()); return y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0) ? 'leap' : 'common'; },
  tests() {
    const g = rng(23);
    return ['2024\n', '1900\n', '2000\n', '2023\n', '1\n', '4\n', '100\n', '400\n', '2100\n', '1600\n', '1000000000\n', ...many(4, () => `${randInt(g, 1, 3000)}\n`)];
  }
};
