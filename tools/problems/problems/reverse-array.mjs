import { many, rng, randInt, arr, randArray } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'reverse-array',
  title: 'Reverse an Array',
  topic: 'basics',
  difficulty: 'easy',
  order: 49,
  tags: ['arrays', 'loops', 'indexes'],

  concept: {
    title: 'Walking an array backwards',
    body: [
      'You can visit the positions of an array in any order. To go from the last element to the first, start the index at `n - 1` and count down to 0 (inclusive). Getting the first and last index right is the whole difficulty: the last valid index is `n - 1`, not `n`.',
      { code: '# Python\nfor i in range(n - 1, -1, -1):      # n-1, n-2, ..., 0\n    print(a[i], end=" ")\n\n// C++ and Java\nfor (int i = n - 1; i >= 0; i--) {\n    ...\n}' },
      'Reading `a[n]` is an error: C++ may silently read garbage, Java throws an `ArrayIndexOutOfBoundsException` and Python raises an `IndexError`. This kind of mistake is called an *out-of-bounds* access.',
      'In Python, `print(x, end=" ")` prints without starting a new line, so several values end up on the same line.'
    ]
  },

  statement: ['You are given `n` integers. Print them in reverse order, separated by spaces, on one line.'],
  inputFormat: ['The first line has `n`. The second line has `n` integers.'],
  outputFormat: ['The `n` integers in reverse order.'],
  constraints: ['1 <= n <= 1000', '-10^9 <= each number <= 10^9'],
  examples: [{ input: '4\n1 2 3 4\n', note: 'Output: 4 3 2 1.' }, { input: '1\n9\n', note: 'One element stays as it is.' }],
  hints: [
    'The last element is at index `n - 1`, the first at index 0.',
    'Use a loop where the index starts at `n - 1` and goes down to 0.',
    'Print each element followed by a space (in Python add `end=" "` to the print).'
  ],
  program: {
    io: ['n:int', 'a:int[n]'],
    python: r`
      for i in range(n - 1, -1, -1):
          print(a[i], end=" ")
      print()`,
    cpp: r`
      for (int i = n - 1; i >= 0; i--) {
          cout << a[i] << " ";
      }
      cout << endl;`,
    java: r`
      for (int i = (int) n - 1; i >= 0; i--) {
          System.out.print(a[i] + " ");
      }
      System.out.println();`
  },
  solution: {
    explanation: ['The index starts at the last position and moves left until it passes 0, printing every element on the way. Trailing spaces do not matter to the judge.'],
    complexity: 'Time O(n), space O(1) besides the input.'
  },
  solve(input) { return input.trim().split(/\s+/).slice(1).reverse().join(' '); },
  tests() {
    const g = rng(49);
    return [arr([1, 2, 3, 4]), arr([9]), arr([1, 2]), arr([-1, 0, 1]), arr([5, 5, 5]), arr(randArray(g, 1000, -1e9, 1e9)), ...many(4, () => arr(randArray(g, randInt(g, 1, 30), -100, 100)))];
  }
};
