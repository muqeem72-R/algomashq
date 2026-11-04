import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'sign-of-a-number',
  title: 'Sign of a Number',
  topic: 'basics',
  difficulty: 'easy',
  order: 20,
  tags: ['conditions'],

  concept: {
    title: 'More than two choices',
    body: [
      'Sometimes there are three or more cases. Chain the checks with `else if` (`elif` in Python). The program tests the conditions from top to bottom and runs only the first branch whose condition is true; the final `else` catches everything that is left.',
      { code: '# Python\nif x < 0:\n    ...\nelif x == 0:\n    ...\nelse:\n    ...\n\n// C++ and Java\nif (x < 0) {\n    ...\n} else if (x == 0) {\n    ...\n} else {\n    ...\n}' },
      'Because the checks run in order, the order can matter. Here the three cases do not overlap, so any order works, but think about it whenever conditions could both be true.'
    ]
  },

  statement: ['Given an integer `n`, print `positive` if it is greater than zero, `negative` if it is less than zero and `zero` if it is zero.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Print `positive`, `negative` or `zero`.'],
  constraints: ['-10^18 <= n <= 10^18'],
  examples: [{ input: '15\n', note: 'Greater than zero.' }, { input: '-8\n', note: 'Less than zero.' }, { input: '0\n', note: 'Exactly zero.' }],
  hints: [
    'There are three cases, so you need an if, an else if and an else.',
    'Check `n > 0` first, then `n < 0`; if neither is true the number is zero.',
    'Print exactly the lower case words from the statement.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      if n > 0:
          print("positive")
      elif n < 0:
          print("negative")
      else:
          print("zero")`,
    cpp: r`
      if (n > 0) {
          cout << "positive" << endl;
      } else if (n < 0) {
          cout << "negative" << endl;
      } else {
          cout << "zero" << endl;
      }`,
    java: r`
      if (n > 0) {
          System.out.println("positive");
      } else if (n < 0) {
          System.out.println("negative");
      } else {
          System.out.println("zero");
      }`
  },
  solution: {
    explanation: ['Test for positive, then for negative; the only number left for the final branch is zero.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const n = BigInt(input.trim()); return n > 0n ? 'positive' : n < 0n ? 'negative' : 'zero'; },
  tests() {
    const g = rng(20);
    return ['15\n', '-8\n', '0\n', '1\n', '-1\n', '1000000000000000000\n', '-1000000000000000000\n', ...many(5, () => `${randBig(g, -(10n ** 18n), 10n ** 18n)}\n`)];
  }
};
