import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

function divisorCount(n) {
  let c = 0;
  for (let d = 1; d * d <= n; d++) if (n % d === 0) c += d * d === n ? 1 : 2;
  return c;
}

export default {
  slug: 'count-divisors',
  title: 'Count the Divisors',
  topic: 'basics',
  difficulty: 'medium',
  order: 65,
  tags: ['math', 'divisors', 'complexity'],

  concept: {
    title: 'Divisors come in pairs',
    body: [
      'To count the divisors of `n` you could test every number from 1 to `n`. For `n` near 10^9 that is too slow. But divisors come in **pairs**: if `d` divides `n`, so does `n / d`. One member of each pair is at most `sqrt(n)`, so you only need to look at `d = 1, 2, ..., sqrt(n)` and count two divisors (`d` and `n / d`) every time you find one.',
      'There is one trap. When `d * d == n` (a perfect square, like 36 with `d = 6`), `d` and `n / d` are the same number and it counts only once.',
      'Check the idea on a small number: 12 has the pairs (1, 12), (2, 6), (3, 4): six divisors. And 36 has (1, 36), (2, 18), (3, 12), (4, 9) and the single divisor 6: nine divisors.'
    ]
  },

  statement: ['Given a positive integer `n`, print how many positive divisors it has (1 and `n` included).'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The number of divisors of `n`.'],
  constraints: ['1 <= n <= 10^9'],
  examples: [{ input: '12\n', note: 'Divisors: 1, 2, 3, 4, 6, 12. That is six.' }, { input: '36\n', note: 'Nine divisors; the pair (6, 6) counts once.' }],
  hints: [
    'Loop `d` from 1 while `d * d <= n`.',
    'When `d` divides `n`, add 2 to the count (for `d` and `n / d`).',
    'If `d * d == n`, the two are the same number, so add only 1.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      count = 0
      d = 1
      while d * d <= n:
          if n % d == 0:
              if d * d == n:
                  count += 1
              else:
                  count += 2
          d += 1
      print(count)`,
    cpp: r`
      int count = 0;
      for (long long d = 1; d * d <= n; d++) {
          if (n % d == 0) {
              if (d * d == n) {
                  count += 1;
              } else {
                  count += 2;
              }
          }
      }
      cout << count << endl;`,
    java: r`
      int count = 0;
      for (long d = 1; d * d <= n; d++) {
          if (n % d == 0) {
              if (d * d == n) {
                  count += 1;
              } else {
                  count += 2;
              }
          }
      }
      System.out.println(count);`
  },
  solution: {
    explanation: ['Each divisor `d` up to the square root stands for the pair `d` and `n / d`, so it adds two to the count, except when both are equal (a perfect square).'],
    complexity: 'Time O(sqrt n), space O(1).'
  },
  solve(input) { return String(divisorCount(Number(input.trim()))); },
  tests() {
    const g = rng(65);
    return ['12\n', '36\n', '1\n', '2\n', '7\n', '100\n', '1000000000\n', '735134400\n', '999999937\n', '999950884\n', '720720\n', ...many(4, () => `${randInt(g, 1, 1e9)}\n`)];
  }
};
