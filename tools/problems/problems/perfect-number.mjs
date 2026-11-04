import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

function properSum(n) {
  if (n === 1) return 0;
  let s = 1;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) s += d * d === n ? d : d + n / d;
  return s;
}

export default {
  slug: 'perfect-number',
  title: 'Perfect Number',
  topic: 'basics',
  difficulty: 'medium',
  order: 66,
  tags: ['math', 'divisors'],

  concept: {
    title: 'Summing the divisors',
    body: [
      'A **perfect number** equals the sum of its proper divisors (all divisors except the number itself). The first one is 6, because `1 + 2 + 3 = 6`. The next are 28, 496 and 8128.',
      'You already know how to enumerate divisors in pairs up to the square root. This time you add them up instead of counting them. Start the sum at 1 (every number above 1 has the divisor 1) and, when `d` divides `n`, add `d` and also `n / d`, unless they are the same number.',
      'The number 1 is special: its only divisor is itself, so the sum of its proper divisors is 0 and it is not perfect. The loop-from-2 approach would give a sum of 1 for `n = 1`, so handle that case on its own.'
    ]
  },

  statement: ['Given a positive integer `n`, print `yes` if it is a perfect number (it equals the sum of its divisors smaller than itself) and `no` otherwise.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Print `yes` or `no`.'],
  constraints: ['1 <= n <= 10^9'],
  examples: [{ input: '28\n', note: '1 + 2 + 4 + 7 + 14 = 28.' }, { input: '12\n', note: '1 + 2 + 3 + 4 + 6 = 16, not 12.' }],
  hints: [
    'List the divisors in pairs up to the square root, like in the divisor-counting problem.',
    'Start the sum with 1 for `n > 1`, then for each divisor `d` from 2 add `d` and `n / d` (only once if they are equal).',
    'Treat `n = 1` as "no", and compare the sum with `n` at the end.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      total = 0
      if n > 1:
          total = 1
          d = 2
          while d * d <= n:
              if n % d == 0:
                  total += d
                  if d * d != n:
                      total += n // d
              d += 1
      print("yes" if total == n else "no")`,
    cpp: r`
      long long total = 0;
      if (n > 1) {
          total = 1;
          for (long long d = 2; d * d <= n; d++) {
              if (n % d == 0) {
                  total += d;
                  if (d * d != n) {
                      total += n / d;
                  }
              }
          }
      }
      cout << (total == n ? "yes" : "no") << endl;`,
    java: r`
      long total = 0;
      if (n > 1) {
          total = 1;
          for (long d = 2; d * d <= n; d++) {
              if (n % d == 0) {
                  total += d;
                  if (d * d != n) {
                      total += n / d;
                  }
              }
          }
      }
      System.out.println(total == n ? "yes" : "no");`
  },
  solution: {
    explanation: ['The sum of the proper divisors is collected pair by pair up to the square root. A number is perfect when that sum equals the number. The value 1 is excluded by starting the sum at 0.'],
    complexity: 'Time O(sqrt n), space O(1).'
  },
  solve(input) { const n = Number(input.trim()); return properSum(n) === n ? 'yes' : 'no'; },
  tests() {
    const g = rng(66);
    return ['28\n', '12\n', '6\n', '1\n', '2\n', '496\n', '8128\n', '33550336\n', '33550335\n', '1000000000\n', '999999937\n', '100\n', ...many(4, () => `${randInt(g, 1, 1e9)}\n`)];
  }
};
