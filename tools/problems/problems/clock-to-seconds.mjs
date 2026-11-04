import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'clock-to-seconds',
  title: 'Time in Seconds',
  topic: 'basics',
  difficulty: 'easy',
  order: 15,
  tags: ['arithmetic', 'units'],

  concept: {
    title: 'Converting units',
    body: [
      'Converting units is multiplication by a constant. One minute has 60 seconds and one hour has 60 * 60 = 3600 seconds. A duration of `h` hours, `m` minutes and `s` seconds is therefore `h * 3600 + m * 60 + s` seconds.',
      'Constants with a meaning are easier to read when they have a name, for example `SECONDS_PER_HOUR = 3600`. In the next problem you will go the other way, from a total back to hours and minutes.'
    ]
  },

  statement: ['A video lasts `h` hours, `m` minutes and `s` seconds. Print its length in seconds.'],
  inputFormat: ['One line with three integers `h`, `m` and `s`.'],
  outputFormat: ['Print the total number of seconds.'],
  constraints: ['0 <= h <= 10^6', '0 <= m, s <= 59'],
  examples: [{ input: '1 2 3\n', note: '3600 + 120 + 3 = 3723 seconds.' }, { input: '0 0 45\n', note: 'Only seconds: 45.' }],
  hints: [
    'How many seconds are in one hour? In one minute?',
    'Multiply the hours by 3600 and the minutes by 60.',
    'Add the three parts together and print the sum.'
  ],
  program: {
    io: ['h:int m:int s:int'],
    python: r`
      total = h * 3600 + m * 60 + s
      print(total)`,
    cpp: r`
      long long total = h * 3600 + m * 60 + s;
      cout << total << endl;`,
    java: r`
      long total = h * 3600 + m * 60 + s;
      System.out.println(total);`
  },
  solution: {
    explanation: ['Hours are worth 3600 seconds each and minutes 60 seconds each; the seconds count as they are. Add the three parts.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const [h, m, s] = input.trim().split(/\s+/).map(Number); return String(h * 3600 + m * 60 + s); },
  tests() {
    const g = rng(15);
    return ['1 2 3\n', '0 0 45\n', '0 0 0\n', '0 1 0\n', '1 0 0\n', '1000000 59 59\n', '23 59 59\n', ...many(5, () => `${randInt(g, 0, 1e6)} ${randInt(g, 0, 59)} ${randInt(g, 0, 59)}\n`)];
  }
};
