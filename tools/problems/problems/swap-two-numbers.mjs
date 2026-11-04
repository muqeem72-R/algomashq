import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'swap-two-numbers',
  title: 'Swap Two Numbers',
  topic: 'basics',
  difficulty: 'easy',
  order: 10,
  tags: ['variables', 'assignment'],

  concept: {
    title: 'Assignment and the temporary variable',
    body: [
      'The sign `=` does not mean "equal" in a program. It means **store**: `a = b` copies the value of `b` into `a` and forgets what `a` held before.',
      'That makes swapping tricky. If you write `a = b` and then `b = a`, both variables end up with the old `b`, because the old `a` is already gone. The classic fix is a third variable that keeps the old value safe for a moment:',
      { code: 'temp = a\na = b\nb = temp' },
      'Python also offers a shortcut that does all of it in one line: `a, b = b, a`. C++ has `swap(a, b)`. It is worth doing it by hand once so you understand what happens.'
    ]
  },

  statement: ['You are given two integers `a` and `b`. Swap their values, then print the new `a` and the new `b`.'],
  inputFormat: ['One line with two integers `a` and `b`.'],
  outputFormat: ['Print the new `a`, a space, and the new `b`.'],
  constraints: ['-10^18 <= a, b <= 10^18'],
  examples: [{ input: '3 8\n', note: 'After the swap a = 8 and b = 3.' }, { input: '5 5\n', note: 'Equal values stay as they are.' }],
  hints: [
    'After swapping, `a` holds the old `b` and `b` holds the old `a`.',
    'If you copy `a = b` first, the old `a` is lost. Save it in a third variable before you overwrite it.',
    'Then print `a` and `b` on one line.'
  ],
  program: {
    io: ['a:int b:int'],
    python: r`
      temp = a
      a = b
      b = temp
      print(a, b)`,
    cpp: r`
      long long temp = a;
      a = b;
      b = temp;
      cout << a << " " << b << endl;`,
    java: r`
      long temp = a;
      a = b;
      b = temp;
      System.out.println(a + " " + b);`
  },
  solution: {
    explanation: ['`temp` keeps the old `a` while `a` is overwritten with `b`. Then `b` receives the saved value. Finally the two variables are printed.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const [a, b] = input.trim().split(/\s+/); return `${b} ${a}`; },
  tests() {
    const g = rng(10);
    return ['3 8\n', '5 5\n', '0 -1\n', '-1000000000000000000 1000000000000000000\n', '1000000000000000000 -1000000000000000000\n', '0 0\n', ...many(5, () => `${randInt(g, -1e9, 1e9)} ${randInt(g, -1e9, 1e9)}\n`)];
  }
};
