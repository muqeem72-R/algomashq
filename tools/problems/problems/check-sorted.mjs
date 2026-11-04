import { many, rng, randInt, arr, randArray } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'check-sorted',
  title: 'Is It Sorted?',
  topic: 'basics',
  difficulty: 'medium',
  order: 58,
  tags: ['arrays', 'neighbors', 'early-exit'],

  concept: {
    title: 'Comparing neighbours',
    body: [
      'An array is sorted (from small to large) when every element is at least as big as the one before it. You do not need to compare every pair of elements: it is enough to compare each element with its **left neighbour**.',
      { code: 'for i in range(1, n):          # start at 1: element 0 has no left neighbour\n    if a[i] < a[i - 1]:\n        # found a pair in the wrong order' },
      'Starting the loop at 1 matters, because `a[i - 1]` for `i = 0` would be position -1 (in Python that silently reads the last element, in C++ it is out of bounds).',
      'One bad pair is enough to answer "not sorted", so you can stop right away. The only way to say "sorted" is to look at all pairs and find no problem.'
    ]
  },

  statement: ['You are given `n` integers. Print `yes` if they are in non-decreasing order (each number is at least as large as the one before it), otherwise print `no`.'],
  inputFormat: ['The first line has `n`. The second line has `n` integers.'],
  outputFormat: ['Print `yes` or `no`.'],
  constraints: ['1 <= n <= 1000', '-10^9 <= each number <= 10^9'],
  examples: [{ input: '4\n1 2 2 5\n', note: 'Equal neighbours are fine: sorted.' }, { input: '3\n3 1 2\n', note: '1 comes after 3: not sorted.' }],
  hints: [
    'Compare each element (from the second on) with the one just before it.',
    'If an element is smaller than its left neighbour, the array is not sorted.',
    'Start by assuming the answer is `yes` and change it to `no` when you find a bad pair.'
  ],
  program: {
    io: ['n:int', 'a:int[n]'],
    python: r`
      answer = "yes"
      for i in range(1, n):
          if a[i] < a[i - 1]:
              answer = "no"
              break
      print(answer)`,
    cpp: r`
      string answer = "yes";
      for (int i = 1; i < n; i++) {
          if (a[i] < a[i - 1]) {
              answer = "no";
              break;
          }
      }
      cout << answer << endl;`,
    java: r`
      String answer = "yes";
      for (int i = 1; i < n; i++) {
          if (a[i] < a[i - 1]) {
              answer = "no";
              break;
          }
      }
      System.out.println(answer);`
  },
  solution: {
    explanation: ['Each element is compared with its left neighbour. The first pair that is out of order makes the answer `no`; if no such pair exists the array is sorted.'],
    complexity: 'Time O(n), space O(1) besides the input.'
  },
  solve(input) { const a = input.trim().split(/\s+/).slice(1).map(Number); for (let i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return 'no'; return 'yes'; },
  tests() {
    const g = rng(58);
    const sortedArr = randArray(g, 1000, -1e9, 1e9).sort((x, y) => x - y);
    const almost = [...sortedArr]; [almost[998], almost[999]] = [almost[999], almost[998]];
    if (almost[998] === almost[999]) almost[999] -= 1;
    return [arr([1, 2, 2, 5]), arr([3, 1, 2]), arr([5]), arr([1, 1, 1]), arr([2, 1]), arr([1, 2]), arr([-5, -3, 0, 4]), arr([9, 8, 7]), arr(sortedArr), arr(almost), ...many(3, () => arr(randArray(g, randInt(g, 2, 8), 0, 5)))];
  }
};
