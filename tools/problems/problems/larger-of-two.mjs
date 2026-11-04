import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'larger-of-two',
  title: 'Larger of Two Numbers',
  topic: 'basics',
  difficulty: 'easy',
  order: 21,
  tags: ['conditions', 'comparison'],

  concept: {
    title: 'Comparing two values',
    body: [
      'A condition compares two values and gives true or false. To find the larger of `a` and `b` you ask `a > b`: if it is true, `a` is larger, otherwise `b` is larger or they are equal, and in that case printing `b` is also correct.',
      'You will see this pattern again and again as "keep the best so far". Every language also has a ready-made function (`max(a, b)` in Python, `max` in C++ with `<algorithm>`, `Math.max` in Java). Try writing the if/else yourself first. It is the same idea that finds the maximum of a long list later.'
    ]
  },

  statement: ['Given two integers `a` and `b`, print the larger one. If they are equal, print that value.'],
  inputFormat: ['One line with two integers `a` and `b`.'],
  outputFormat: ['The larger of the two numbers.'],
  constraints: ['-10^9 <= a, b <= 10^9'],
  examples: [{ input: '3 9\n', note: '9 is larger.' }, { input: '-5 -12\n', note: 'Careful with negatives: -5 is larger than -12.' }],
  hints: [
    'Compare the two numbers with `>`.',
    'If `a > b` print `a`, otherwise print `b`.',
    'Equal numbers need no special case: printing either one is correct.'
  ],
  program: {
    io: ['a:int b:int'],
    python: r`
      if a > b:
          print(a)
      else:
          print(b)`,
    cpp: r`
      if (a > b) {
          cout << a << endl;
      } else {
          cout << b << endl;
      }`,
    java: r`
      if (a > b) {
          System.out.println(a);
      } else {
          System.out.println(b);
      }`
  },
  solution: {
    explanation: ['One comparison decides. If `a` is greater, print `a`; in every other case `b` is at least as large as `a`, so print `b`.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const [a, b] = input.trim().split(/\s+/).map(Number); return String(Math.max(a, b)); },
  tests() {
    const g = rng(21);
    return ['3 9\n', '-5 -12\n', '7 7\n', '0 0\n', '-1 1\n', '1000000000 -1000000000\n', '-1000000000 -1000000000\n', ...many(5, () => `${randInt(g, -1e9, 1e9)} ${randInt(g, -1e9, 1e9)}\n`)];
  }
};
