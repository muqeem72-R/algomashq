import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

function ones(n) {
  let count = 0n;
  for (let factor = 1n; factor <= n; factor *= 10n) {
    const high = n / (factor * 10n), current = (n / factor) % 10n, low = n % factor;
    count += current === 0n ? high * factor : current === 1n ? high * factor + low + 1n : (high + 1n) * factor;
  }
  return count;
}

export default {
  slug: 'count-digit-ones',
  title: 'How Many Ones?',
  topic: 'basics',
  difficulty: 'hard',
  order: 92,
  tags: ['digits', 'math', 'complexity', 'counting'],

  concept: {
    title: 'Count position by position',
    body: [
      'How many times does the digit `1` appear when you write down all the numbers from 1 to `n`? For `n = 13` the numbers are 1, 2, ..., 9, 10, 11, 12, 13 and the digit appears in 1, 10, 11 (twice), 12 and 13: six times. For `n = 10^17` you cannot write the numbers down.',
      'The trick is to ask a different question: for each **position** (units, tens, hundreds, ...) how many numbers have a `1` there? Let `factor` be 1, 10, 100, ... for the position being looked at, and split `n` around it:',
      { list: ['`high` = the digits to the left of the position (`n / (factor * 10)`)', '`current` = the digit at the position (`n / factor % 10`)', '`low` = the digits to the right (`n % factor`)'] },
      'Complete cycles: for every value of `high` below its current value there are `factor` numbers with a 1 at this position, so `high * factor` numbers. The last, partial cycle depends on `current`: if `current` is 0 there are no more; if it is 1 there are `low + 1` more (the numbers up to `n` itself); if it is bigger than 1 the whole cycle of `factor` numbers fits.',
      { code: 'if current == 0:   count += high * factor\nelif current == 1: count += high * factor + low + 1\nelse:              count += (high + 1) * factor' },
      'Check it on `n = 13`. Units position (`factor = 1`): `high = 1`, `current = 3`, `low = 0`; since `current > 1` the count is `(1 + 1) * 1 = 2` (the numbers 1 and 11). Tens position (`factor = 10`): `high = 0`, `current = 1`, `low = 3`; the count is `0 * 10 + 3 + 1 = 4` (the numbers 10, 11, 12 and 13). Together 6, as counted by hand.',
      'Adding this over all positions needs one round per digit of `n`: 18 rounds instead of 10^17.'
    ]
  },

  statement: ['Given `n`, count how many times the digit `1` appears in the decimal notation of all integers from 1 to `n`.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The number of times the digit 1 appears.'],
  constraints: ['1 <= n <= 10^17'],
  examples: [{ input: '13\n', note: 'In 1, 10, 11, 12, 13 the digit 1 appears 6 times.' }, { input: '100\n', note: '21 times.' }],
  hints: [
    'Do not go through the numbers. Count for each position (units, tens, ...) separately.',
    'For the position with value `factor`: `high = n / (factor * 10)`, `current = (n / factor) % 10`, `low = n % factor`.',
    'Add `high * factor` if current is 0, `high * factor + low + 1` if it is 1, and `(high + 1) * factor` if it is larger. Move on with `factor *= 10`.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      count = 0
      factor = 1
      while factor <= n:
          high = n // (factor * 10)
          current = n // factor % 10
          low = n % factor
          if current == 0:
              count += high * factor
          elif current == 1:
              count += high * factor + low + 1
          else:
              count += (high + 1) * factor
          factor *= 10
      print(count)`,
    cpp: r`
      long long count = 0;
      for (long long factor = 1; factor <= n; factor *= 10) {
          long long high = n / (factor * 10);
          long long current = n / factor % 10;
          long long low = n % factor;
          if (current == 0) {
              count += high * factor;
          } else if (current == 1) {
              count += high * factor + low + 1;
          } else {
              count += (high + 1) * factor;
          }
      }
      cout << count << endl;`,
    java: r`
      long count = 0;
      for (long factor = 1; factor <= n; factor *= 10) {
          long high = n / (factor * 10);
          long current = n / factor % 10;
          long low = n % factor;
          if (current == 0) {
              count += high * factor;
          } else if (current == 1) {
              count += high * factor + low + 1;
          } else {
              count += (high + 1) * factor;
          }
      }
      System.out.println(count);`
  },
  solution: {
    explanation: ['Each digit position is counted on its own. The full cycles to the left of the position contribute `high * factor` numbers with a 1 there, and the partial cycle contributes depending on the digit at that position. With `n` up to 10^17, `factor * 10` never exceeds 10^18, so no overflow occurs.'],
    complexity: 'Time O(number of digits of n), space O(1).'
  },
  solve(input) { return String(ones(BigInt(input.trim()))); },
  tests() {
    const g = rng(92);
    // The position-by-position formula must agree with simply counting, for small n.
    let brute = 0n;
    for (let n = 1; n <= 20000; n++) {
      brute += BigInt([...String(n)].filter((c) => c === '1').length);
      if (ones(BigInt(n)) !== brute) throw new Error(`digit ones formula disagrees with counting at n=${n}`);
    }
    return ['13\n', '100\n', '1\n', '9\n', '10\n', '11\n', '99\n', '199\n', '1000\n', '99999\n', `${10n ** 17n}\n`, `${10n ** 17n - 1n}\n`, '11111111111111111\n', ...many(5, () => `${randBig(g, 1n, 10n ** 17n)}\n`)];
  }
};
