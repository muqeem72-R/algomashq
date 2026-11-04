import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'power-by-multiplying',
  title: 'Power by Multiplying',
  topic: 'basics',
  difficulty: 'easy',
  order: 43,
  tags: ['loops', 'accumulator', 'math'],

  concept: {
    title: 'Powers are repeated multiplication',
    body: [
      '`a` to the power `b` means `a * a * ... * a` with `b` factors. Start an accumulator at 1 (not 0: starting at 0 would make every product 0) and multiply it by `a`, `b` times.',
      'Why not the built-in power function? In C++ and Java `pow` works with decimals, and for big results the decimal loses digits: `pow(10, 17)` can print a number that is slightly off. For exact whole-number powers, multiply yourself. Python has `a ** b`, which is exact.',
      'Anything to the power 0 is 1, which is also what your accumulator holds when the loop does not run. Here `b` is small, so the loop is quick. When `b` is huge (up to 10^18 in a later problem) a smarter method is needed.'
    ]
  },

  statement: ['Given two integers `a` and `b`, print `a` to the power `b` by multiplying. Use `0^0 = 1`.'],
  inputFormat: ['One line with two integers `a` and `b`.'],
  outputFormat: ['The value of `a^b`.'],
  constraints: ['0 <= a <= 10', '0 <= b <= 18'],
  examples: [{ input: '2 10\n', note: '2^10 = 1024.' }, { input: '7 0\n', note: 'Any number to the power 0 is 1.' }],
  hints: [
    'Start a result variable at 1.',
    'Multiply the result by `a`, exactly `b` times, in a loop.',
    'For `a = 10` and `b = 18` the answer is 10^18; use 64-bit variables.'
  ],
  program: {
    io: ['a:int b:int'],
    python: r`
      result = 1
      for _ in range(b):
          result *= a
      print(result)`,
    cpp: r`
      long long result = 1;
      for (int i = 0; i < b; i++) {
          result *= a;
      }
      cout << result << endl;`,
    java: r`
      long result = 1;
      for (int i = 0; i < b; i++) {
          result *= a;
      }
      System.out.println(result);`
  },
  solution: {
    explanation: ['The accumulator starts at 1 and is multiplied by `a` once per round, `b` rounds in total. For `b = 0` the loop does nothing and the answer 1 is correct.'],
    complexity: 'Time O(b), space O(1).'
  },
  solve(input) { const [a, b] = input.trim().split(/\s+/).map(BigInt); return String(a ** b); },
  tests() {
    const g = rng(43);
    return ['2 10\n', '7 0\n', '0 0\n', '0 5\n', '1 18\n', '10 18\n', '2 18\n','9 18\n', '3 5\n', ...many(5, () => `${randInt(g, 0, 10)} ${randInt(g, 0, 18)}\n`)];
  }
};
