import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'even-or-odd',
  title: 'Even or Odd',
  topic: 'basics',
  difficulty: 'easy',
  order: 19,
  tags: ['conditions', 'remainder'],

  concept: {
    title: 'Making decisions with if',
    body: [
      'Until now every line of the program ran. An **if statement** lets the program choose: a condition is checked, and the code under it runs only when the condition is true. `else` is the code that runs otherwise.',
      { code: '# Python (the colon and the indentation matter)\nif n > 0:\n    print("big")\nelse:\n    print("small")\n\n// C++ and Java (parentheses around the condition, braces around the code)\nif (n > 0) {\n    cout << "big";      // Java: System.out.println("big");\n} else {\n    cout << "small";\n}' },
      'Conditions compare with `==` (equal), `!=` (not equal), `<`, `<=`, `>`, `>=`. Do not confuse `==` (a question) with `=` (store a value).',
      'A number is even when it divides by 2 without a remainder: `n % 2 == 0`. Be careful with negative numbers: in C++ and Java `-3 % 2` is `-1`, not `1`. Testing for `== 0` works for every number; testing for `== 1` would miss negative odd numbers.'
    ]
  },

  statement: ['Given an integer `n`, print `even` if it is even and `odd` if it is odd.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Print `even` or `odd`.'],
  constraints: ['-10^18 <= n <= 10^18'],
  examples: [{ input: '10\n', note: '10 divides by 2: even.' }, { input: '-3\n', note: 'Negative numbers can be odd too.' }],
  hints: [
    'Which operator tells you what is left after dividing by 2?',
    'If `n % 2` is `0` the number is even. Everything else is odd.',
    'Do not test `n % 2 == 1` for odd: for `-3` C++ and Java give `-1`. Use the `else` branch instead.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      if n % 2 == 0:
          print("even")
      else:
          print("odd")`,
    cpp: r`
      if (n % 2 == 0) {
          cout << "even" << endl;
      } else {
          cout << "odd" << endl;
      }`,
    java: r`
      if (n % 2 == 0) {
          System.out.println("even");
      } else {
          System.out.println("odd");
      }`
  },
  solution: {
    explanation: ['Check whether the remainder by 2 is zero. If it is, the number is even; in every other case it is odd, so the `else` branch handles it, including negative odd numbers.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { return BigInt(input.trim()) % 2n === 0n ? 'even' : 'odd'; },
  tests() {
    const g = rng(19);
    return ['10\n', '-3\n', '0\n', '1\n', '-1\n', '2\n', '-2\n', '999999999999999999\n', '-1000000000000000000\n', ...many(5, () => `${randBig(g, -(10n ** 18n), 10n ** 18n)}\n`)];
  }
};
