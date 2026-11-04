import { many, rng, randInt, arr, randArray } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'smallest-and-largest',
  title: 'Smallest and Largest',
  topic: 'basics',
  difficulty: 'easy',
  order: 45,
  tags: ['arrays', 'loops', 'min-max'],

  concept: {
    title: 'Arrays: many values, one name',
    body: [
      'An **array** (a *list* in Python, a *vector* in C++) stores many values under one name. The elements are numbered from **0**: an array of 5 numbers has the positions 0, 1, 2, 3 and 4, and the last one is at position `length - 1`. You read an element with square brackets: `a[0]` is the first.',
      { code: '# Python\na = [5, 3, 8]\nprint(a[0], len(a))     # 5 3\nfor x in a:             # visits every element\n    print(x)\n\n// C++\nvector<long long> a = {5, 3, 8};\ncout << a[0] << " " << a.size();\nfor (long long x : a) { ... }\n\n// Java\nlong[] a = {5, 3, 8};\nSystem.out.println(a[0] + " " + a.length);\nfor (long x : a) { ... }' },
      'The starter code already reads the length `n` and the elements into `a`. To find the smallest and the largest, use the "best so far" idea again: start with the first element as both, and let every other element challenge them.'
    ]
  },

  statement: ['You are given `n` integers. Print the smallest and the largest of them, separated by a space.'],
  inputFormat: ['The first line has `n`. The second line has `n` integers.'],
  outputFormat: ['`smallest largest` on one line.'],
  constraints: ['1 <= n <= 1000', '-10^9 <= each number <= 10^9'],
  examples: [{ input: '5\n3 -1 9 4 9\n', note: 'The smallest is -1 and the largest is 9.' }, { input: '1\n7\n', note: 'With one number it is both the smallest and the largest.' }],
  hints: [
    'Start with `smallest = a[0]` and `largest = a[0]`.',
    'Go through all elements. If one is smaller than `smallest`, it becomes the new smallest. Do the same for the largest.',
    'Print the two values on one line, smallest first.'
  ],
  program: {
    io: ['n:int', 'a:int[n]'],
    python: r`
      smallest = a[0]
      largest = a[0]
      for x in a:
          if x < smallest:
              smallest = x
          if x > largest:
              largest = x
      print(smallest, largest)`,
    cpp: r`
      long long smallest = a[0];
      long long largest = a[0];
      for (long long x : a) {
          if (x < smallest) {
              smallest = x;
          }
          if (x > largest) {
              largest = x;
          }
      }
      cout << smallest << " " << largest << endl;`,
    java: r`
      long smallest = a[0];
      long largest = a[0];
      for (long x : a) {
          if (x < smallest) {
              smallest = x;
          }
          if (x > largest) {
              largest = x;
          }
      }
      System.out.println(smallest + " " + largest);`
  },
  solution: {
    explanation: ['Both records start at the first element. Every element is compared with both records and replaces them when it is smaller or larger. After one pass the records are the minimum and the maximum.'],
    complexity: 'Time O(n), space O(1) besides the input.'
  },
  solve(input) { const a = input.trim().split(/\s+/).slice(1).map(Number); return `${Math.min(...a)} ${Math.max(...a)}`; },
  tests() {
    const g = rng(45);
    return [arr([7]), arr([3, -1, 9, 4, 9]), arr([5, 5, 5]), arr([-3, -7, -1]), arr([1, 2, 3, 4, 5]), arr([5, 4, 3, 2, 1]), arr([1000000000, -1000000000]), arr(randArray(g, 1000, -1e9, 1e9)), ...many(4, () => arr(randArray(g, randInt(g, 1, 30), -100, 100)))];
  }
};
