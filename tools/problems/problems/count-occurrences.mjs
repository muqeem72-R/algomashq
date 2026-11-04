import { many, rng, randInt, randArray } from '../lib.mjs';
const r = String.raw;

const make = (a, x) => `${a.length}\n${a.join(' ')}\n${x}\n`;

export default {
  slug: 'count-occurrences',
  title: 'Count Occurrences',
  topic: 'basics',
  difficulty: 'easy',
  order: 48,
  tags: ['arrays', 'counting'],

  concept: {
    title: 'Counting matches',
    body: [
      'Searching asks "where is it?". Counting asks "how many times?". The difference in the code is small: do not stop at the first match, look at every element, and add one to a counter for each match.',
      { code: 'count = 0\nfor v in a:\n    if v == x:\n        count += 1' },
      'This is the filtering pattern: a loop plus an `if` plus an accumulator. It appears in almost every counting or summing problem: "how many numbers are above 10?", "what is the sum of the positive numbers?", and so on. Only the condition and the accumulator change.'
    ]
  },

  statement: ['You are given `n` integers and a number `x`. Print how many of the `n` integers are equal to `x`.'],
  inputFormat: ['The first line has `n`. The second line has `n` integers. The third line has `x`.'],
  outputFormat: ['The number of elements equal to `x`.'],
  constraints: ['1 <= n <= 1000', '-10^9 <= each number, x <= 10^9'],
  examples: [{ input: '6\n2 7 2 2 9 7\n2\n', note: '2 appears three times.' }, { input: '3\n1 2 3\n5\n', note: 'No element equals 5: the answer is 0.' }],
  hints: [
    'Use a counter that starts at 0.',
    'Check every element. Do not stop at the first match, as the search problem did.',
    'Add 1 to the counter for each element that equals `x`, then print the counter.'
  ],
  program: {
    io: ['n:int', 'a:int[n]', 'x:int'],
    python: r`
      count = 0
      for v in a:
          if v == x:
              count += 1
      print(count)`,
    cpp: r`
      int count = 0;
      for (long long v : a) {
          if (v == x) {
              count++;
          }
      }
      cout << count << endl;`,
    java: r`
      int count = 0;
      for (long v : a) {
          if (v == x) {
              count++;
          }
      }
      System.out.println(count);`
  },
  solution: {
    explanation: ['Every element is compared with `x`; each match increases the counter. The loop never stops early, because every element may be a match.'],
    complexity: 'Time O(n), space O(1) besides the input.'
  },
  solve(input) { const t = input.trim().split(/\s+/).map(Number); const n = t[0]; return String(t.slice(1, 1 + n).filter((v) => v === t[1 + n]).length); },
  tests() {
    const g = rng(48);
    const out = [make([2, 7, 2, 2, 9, 7], 2), make([1, 2, 3], 5), make([5], 5), make([5], 6), make([7, 7, 7, 7], 7), make([-1, -1, 1], -1), make([0, 0, 0, 1], 0)];
    for (let i = 0; i < 5; i++) { const a = randArray(g, randInt(g, 1, 60), -5, 5); out.push(make(a, randInt(g, -5, 5))); }
    out.push(make(randArray(g, 1000, 0, 3), 2));
    return out;
  }
};
