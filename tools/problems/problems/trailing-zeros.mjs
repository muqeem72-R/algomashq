import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

function zeros(n) { let c = 0n; while (n > 0n) { n /= 5n; c += n; } return c; }

export default {
  slug: 'trailing-zeros',
  title: 'Zeros at the End of N Factorial',
  topic: 'basics',
  difficulty: 'medium',
  order: 79,
  tags: ['math', 'complexity', 'factorial'],

  concept: {
    title: 'Do not compute it, count it',
    body: [
      'The number `100!` has 158 digits and `10^18!` has more digits than there are atoms in the universe, so you cannot compute `n!` for big `n`. But the question is only how many zeros it ends with, and that can be answered without the number.',
      'A zero at the end comes from a factor 10 = 2 * 5. In `n!` there are far more factors of 2 than of 5, so the number of zeros is the number of factors of 5. The multiples of 5 up to `n` contribute one 5 each, the multiples of 25 contribute one *more*, the multiples of 125 one more, and so on:',
      { code: 'zeros = n/5 + n/25 + n/125 + n/625 + ...        (all divisions are whole-number divisions)' },
      'For `n = 100`: `20 + 4 = 24` zeros. In code, divide by 5 again and again and add each quotient:',
      { code: 'while n > 0:\n    n = n // 5\n    zeros += n' },
      'The loop runs about `log base 5 of n` times, 26 rounds for `n = 10^18`. This is the kind of thinking that separates a program that finishes at once from one that never does: **find the property you need instead of computing the huge object**.'
    ]
  },

  statement: ['Given a positive integer `n`, print the number of zeros at the end of `n!` (the product of 1 to `n`).'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The number of trailing zeros of `n!`.'],
  constraints: ['1 <= n <= 10^18'],
  examples: [{ input: '10\n', note: '10! = 3628800, which ends with two zeros.' }, { input: '100\n', note: '100/5 + 100/25 = 20 + 4 = 24 zeros.' }],
  hints: [
    'A trailing zero needs a factor 10 = 2 * 5. Which of the two is the scarce one in a factorial?',
    'Count the factors of 5: `n/5` multiples of 5, plus `n/25` multiples of 25 (which give a second 5), plus `n/125`, ...',
    'Repeat `n = n / 5` and add each new `n` to the answer until `n` becomes 0.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      zeros = 0
      while n > 0:
          n //= 5
          zeros += n
      print(zeros)`,
    cpp: r`
      long long zeros = 0;
      while (n > 0) {
          n /= 5;
          zeros += n;
      }
      cout << zeros << endl;`,
    java: r`
      long zeros = 0;
      while (n > 0) {
          n /= 5;
          zeros += n;
      }
      System.out.println(zeros);`
  },
  solution: {
    explanation: ['Every trailing zero uses one factor 2 and one factor 5, and 5 is the scarce one. Dividing by 5 repeatedly counts the multiples of 5, of 25, of 125 and so on, which is exactly the number of factors of 5 in `n!`.'],
    complexity: 'Time O(log n), space O(1).'
  },
  solve(input) { return String(zeros(BigInt(input.trim()))); },
  tests() {
    const g = rng(79);
    return ['10\n', '100\n', '1\n', '4\n', '5\n', '24\n', '25\n', '125\n', '1000000\n', '1000000000000000000\n', '999999999999999999\n', ...many(5, () => `${randBig(g, 1n, 10n ** 18n)}\n`)];
  }
};
