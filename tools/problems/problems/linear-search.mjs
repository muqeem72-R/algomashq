import { many, rng, randInt, randArray } from '../lib.mjs';
const r = String.raw;

const make = (a, x) => `${a.length}\n${a.join(' ')}\n${x}\n`;

export default {
  slug: 'linear-search',
  title: 'Linear Search',
  topic: 'basics',
  difficulty: 'easy',
  order: 47,
  tags: ['arrays', 'search', 'break'],

  concept: {
    title: 'Searching and stopping early',
    body: [
      'To find a value in an array, look at the elements one by one from the start. This is **linear search**. In the worst case you look at all `n` elements, so the cost grows with `n`: it is **O(n)**.',
      'Once you have found what you want there is no reason to continue. The `break` statement leaves the loop immediately. Remember the position when you break.',
      { code: 'answer = -1                 # -1 means "not found"\nfor i in range(n):\n    if a[i] == x:\n        answer = i\n        break' },
      'Because positions start at 0, the first element has index 0, not 1. Use a special value that cannot be a valid index (like -1) for "not found".'
    ]
  },

  statement: ['You are given `n` integers and a number `x`. Print the position (counting from 0) of the **first** element equal to `x`, or `-1` if `x` does not occur.'],
  inputFormat: ['The first line has `n`. The second line has `n` integers. The third line has `x`.'],
  outputFormat: ['The 0-based index of the first occurrence of `x`, or `-1`.'],
  constraints: ['1 <= n <= 1000', '-10^9 <= each number, x <= 10^9'],
  examples: [{ input: '5\n4 8 15 8 23\n8\n', note: '8 first appears at index 1.' }, { input: '3\n1 2 3\n9\n', note: '9 is not in the array.' }],
  hints: [
    'Go through the indexes 0, 1, ..., n - 1 and compare `a[i]` with `x`.',
    'Start with the answer `-1`. When you find a match, store `i` and stop the loop with `break`.',
    'If the same number appears twice, the first index is wanted: that is why you stop at the first match.'
  ],
  program: {
    io: ['n:int', 'a:int[n]', 'x:int'],
    python: r`
      answer = -1
      for i in range(n):
          if a[i] == x:
              answer = i
              break
      print(answer)`,
    cpp: r`
      int answer = -1;
      for (int i = 0; i < n; i++) {
          if (a[i] == x) {
              answer = i;
              break;
          }
      }
      cout << answer << endl;`,
    java: r`
      int answer = -1;
      for (int i = 0; i < n; i++) {
          if (a[i] == x) {
              answer = i;
              break;
          }
      }
      System.out.println(answer);`
  },
  solution: {
    explanation: ['The loop checks the elements from the left. At the first match it saves the index and leaves the loop; if there is no match the answer stays -1.'],
    complexity: 'Time O(n), space O(1) besides the input.'
  },
  solve(input) { const t = input.trim().split(/\s+/).map(Number); const n = t[0]; const a = t.slice(1, 1 + n); return String(a.indexOf(t[1 + n])); },
  tests() {
    const g = rng(47);
    const out = [make([4, 8, 15, 8, 23], 8), make([1, 2, 3], 9), make([5], 5), make([5], 6), make([7, 7, 7], 7), make([1, 2, 3, 4], 4), make([1, 2, 3, 4], 1), make([-5, 0, 5], -5)];
    for (let i = 0; i < 4; i++) { const a = randArray(g, randInt(g, 1, 40), -20, 20); out.push(make(a, randInt(g, -22, 22))); }
    const big = randArray(g, 1000, -1e9, 1e9);
    return [...out, make(big, big[999]), make(big, big[500])];
  }
};
