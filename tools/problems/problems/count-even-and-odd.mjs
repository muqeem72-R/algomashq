import { many, rng, randInt, arr, randArray } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'count-even-and-odd',
  title: 'Count Even and Odd',
  topic: 'basics',
  difficulty: 'easy',
  order: 46,
  tags: ['arrays', 'loops', 'counting'],

  concept: {
    title: 'Counting with two counters',
    body: [
      'Counting is an accumulator that grows by 1 instead of by a value. When you sort items into groups, use one counter per group and decide in each round which counter goes up.',
      { code: 'evens = 0\nodds = 0\nfor x in a:\n    if x % 2 == 0:\n        evens += 1\n    else:\n        odds += 1' },
      'The numbers can be negative. Test evenness with `x % 2 == 0` and send everything else to the other branch: in C++ and Java `-3 % 2` is `-1`, so a test like `x % 2 == 1` would miss it.'
    ]
  },

  statement: ['You are given `n` integers. Print how many of them are even and how many are odd, separated by a space.'],
  inputFormat: ['The first line has `n`. The second line has `n` integers.'],
  outputFormat: ['`evens odds` on one line.'],
  constraints: ['1 <= n <= 1000', '-10^9 <= each number <= 10^9'],
  examples: [{ input: '5\n1 2 3 4 6\n', note: 'Three even numbers (2, 4, 6) and two odd numbers (1, 3).' }, { input: '3\n-3 -5 0\n', note: 'Zero is even; the two negative numbers are odd.' }],
  hints: [
    'You need two counters, both starting at 0.',
    'For each element test `x % 2 == 0`: if true add one to the even counter, otherwise to the odd counter.',
    'Print the even count first, then the odd count.'
  ],
  program: {
    io: ['n:int', 'a:int[n]'],
    python: r`
      evens = 0
      odds = 0
      for x in a:
          if x % 2 == 0:
              evens += 1
          else:
              odds += 1
      print(evens, odds)`,
    cpp: r`
      int evens = 0;
      int odds = 0;
      for (long long x : a) {
          if (x % 2 == 0) {
              evens++;
          } else {
              odds++;
          }
      }
      cout << evens << " " << odds << endl;`,
    java: r`
      int evens = 0;
      int odds = 0;
      for (long x : a) {
          if (x % 2 == 0) {
              evens++;
          } else {
              odds++;
          }
      }
      System.out.println(evens + " " + odds);`
  },
  solution: {
    explanation: ['Each element goes through one `if / else`, which increases exactly one of the two counters. The `else` branch also catches negative odd numbers.'],
    complexity: 'Time O(n), space O(1) besides the input.'
  },
  solve(input) { const a = input.trim().split(/\s+/).slice(1).map(Number); const e = a.filter((x) => x % 2 === 0).length; return `${e} ${a.length - e}`; },
  tests() {
    const g = rng(46);
    return [arr([1, 2, 3, 4, 6]), arr([-3, -5, 0]), arr([2]), arr([1]), arr([2, 4, 6, 8]), arr([1, 3, 5, 7]), arr([-2, -4, 2]), arr(randArray(g, 1000, -1e9, 1e9)), ...many(4, () => arr(randArray(g, randInt(g, 1, 30), -100, 100)))];
  }
};
