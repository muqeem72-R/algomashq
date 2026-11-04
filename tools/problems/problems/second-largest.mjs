import { many, rng, randInt, arr } from '../lib.mjs';
const r = String.raw;

// n distinct-ish values with at least two different ones.
function values(g, n, lo, hi) {
  const a = Array.from({ length: n }, () => randInt(g, lo, hi));
  if (new Set(a).size < 2) a[0] = a[1] + 1;
  return a;
}

export default {
  slug: 'second-largest',
  title: 'Second Largest',
  topic: 'basics',
  difficulty: 'medium',
  order: 57,
  tags: ['arrays', 'min-max', 'one-pass'],

  concept: {
    title: 'Tracking two records in one pass',
    body: [
      'To find the largest you keep one record. To find the second largest you keep two, `first` and `second`, and update both while you walk through the array once. Sorting the array would also work, but one pass is simpler and does less work.',
      'For each element `x` there are three cases:',
      { list: ['`x` is bigger than `first`: the old first becomes the second, and `x` is the new first.', '`x` is not bigger than `first`, but it is bigger than `second` and **different from** `first`: it is the new second.', 'otherwise nothing changes.'] },
      'The "different from `first`" part matters when the largest value appears more than once: here the second largest means the second largest **distinct** value. Start both records at a number smaller than any element, because you do not yet know the first value.'
    ]
  },

  statement: ['You are given `n` integers, at least two of them different. Print the second largest **distinct** value.', 'For `5 9 9 3` the largest is 9 and the second largest is 5.'],
  inputFormat: ['The first line has `n`. The second line has `n` integers.'],
  outputFormat: ['The second largest distinct value.'],
  constraints: ['2 <= n <= 1000', '-10^9 <= each number <= 10^9', 'At least two different values exist.'],
  examples: [{ input: '4\n5 9 9 3\n', note: 'The largest is 9, the second largest distinct value is 5.' }, { input: '3\n-4 -8 -4\n', note: 'The largest is -4, the second is -8.' }],
  hints: [
    'Keep two variables, `first` and `second`, both starting very low (for example -2 * 10^18).',
    'If `x > first`, shift: `second = first`, then `first = x`.',
    'Otherwise, if `x > second` and `x != first`, set `second = x`.'
  ],
  program: {
    io: ['n:int', 'a:int[n]'],
    python: r`
      first = -2 * 10 ** 18
      second = -2 * 10 ** 18
      for x in a:
          if x > first:
              second = first
              first = x
          elif x > second and x != first:
              second = x
      print(second)`,
    cpp: r`
      long long first = -2000000000000000000LL;
      long long second = -2000000000000000000LL;
      for (long long x : a) {
          if (x > first) {
              second = first;
              first = x;
          } else if (x > second && x != first) {
              second = x;
          }
      }
      cout << second << endl;`,
    java: r`
      long first = Long.MIN_VALUE;
      long second = Long.MIN_VALUE;
      for (long x : a) {
          if (x > first) {
              second = first;
              first = x;
          } else if (x > second && x != first) {
              second = x;
          }
      }
      System.out.println(second);`
  },
  solution: {
    explanation: ['One pass keeps the two best distinct values seen so far. A new maximum pushes the old maximum down to second place; a value that is between the two (and not equal to the maximum) replaces the second.'],
    complexity: 'Time O(n), space O(1) besides the input.'
  },
  solve(input) { const a = input.trim().split(/\s+/).slice(1).map(Number); const d = [...new Set(a)].sort((x, y) => y - x); return String(d[1]); },
  tests() {
    const g = rng(57);
    return [arr([5, 9, 9, 3]), arr([-4, -8, -4]), arr([1, 2]), arr([2, 1]), arr([7, 7, 7, 8]), arr([8, 7, 7, 7]), arr([1, 2, 3, 4, 5]), arr([5, 4, 3, 2, 1]), arr([-1000000000, 1000000000]), arr(values(g, 1000, -1e9, 1e9)), arr(values(g, 1000, 0, 3)), ...many(3, () => arr(values(g, randInt(g, 2, 20), -10, 10)))];
  }
};
