import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

// A random number with exactly `len` digits (no leading zero), as a string.
const digits = (g, len) => (len === 1 ? String(randInt(g, 0, 9)) : String(randInt(g, 1, 9)) + Array.from({ length: len - 1 }, () => randInt(g, 0, 9)).join(''));

export default {
  slug: 'add-big-numbers',
  title: 'Add Huge Numbers',
  topic: 'basics',
  difficulty: 'hard',
  order: 93,
  tags: ['strings', 'big-numbers', 'carry', 'simulation'],

  concept: {
    title: 'Adding on paper, in code',
    body: [
      'A 64-bit integer holds about 19 digits. Numbers with thousands of digits do not fit in any built-in type (Python is the exception, but the point is to learn the method). So treat the numbers as **strings of digits** and add them the way you do on paper: from the right, digit by digit, passing a **carry** to the next column.',
      { code: '   9 9 9 \n+    1 7\n-------\n 1 0 1 6      column by column from the right:\n              9 + 7 = 16 -> write 6, carry 1\n              9 + 1 + carry 1 = 11 -> write 1, carry 1\n              9 + carry 1 = 10 -> write 0, carry 1\n              carry 1 -> write 1' },
      'Use two indexes, `i` and `j`, one per number, starting at the last character. In every round start with the carry, add the digit of each number that still has digits left, write `total % 10` and keep `total / 10` as the new carry. Continue while there are digits left in either number **or** a carry is left, so that a final carry produces an extra leading digit.',
      'A digit character becomes its value by subtracting the character `\'0\'` (or with `int(ch)` in Python). The digits come out from the right to the left, so collect them and reverse the result at the end.',
      'Every column is handled once, so the time is proportional to the length of the longer number.'
    ]
  },

  statement: ['You are given two non-negative integers `a` and `b`, written as strings of digits (without leading zeros). Print their sum, also without leading zeros. Do it digit by digit; the numbers are too big for ordinary integer types.'],
  inputFormat: ['The first line has `a`. The second line has `b`.'],
  outputFormat: ['The sum `a + b`.'],
  constraints: ['1 <= number of digits of a and of b <= 2000'],
  examples: [{ input: '999\n17\n', note: '999 + 17 = 1016.' }, { input: '0\n0\n', note: 'Zero plus zero.' }],
  hints: [
    'Start at the last digit of both numbers with a carry of 0.',
    'In each round: total = carry + (digit of a, if any left) + (digit of b, if any left). Write `total % 10`, new carry = `total / 10`.',
    'Keep going while digits remain in either number or the carry is not zero. The digits are produced backwards: reverse them before printing.'
  ],
  program: {
    io: ['a:word', 'b:word'],
    includes: ['<algorithm>'],
    python: r`
      i = len(a) - 1
      j = len(b) - 1
      carry = 0
      result = []
      while i >= 0 or j >= 0 or carry > 0:
          total = carry
          if i >= 0:
              total += int(a[i])
              i -= 1
          if j >= 0:
              total += int(b[j])
              j -= 1
          result.append(str(total % 10))
          carry = total // 10
      print("".join(reversed(result)))`,
    cpp: r`
      int i = a.length() - 1;
      int j = b.length() - 1;
      int carry = 0;
      string result = "";
      while (i >= 0 || j >= 0 || carry > 0) {
          int total = carry;
          if (i >= 0) {
              total += a[i] - '0';
              i--;
          }
          if (j >= 0) {
              total += b[j] - '0';
              j--;
          }
          result += char('0' + total % 10);
          carry = total / 10;
      }
      reverse(result.begin(), result.end());
      cout << result << endl;`,
    java: r`
      int i = a.length() - 1;
      int j = b.length() - 1;
      int carry = 0;
      StringBuilder result = new StringBuilder();
      while (i >= 0 || j >= 0 || carry > 0) {
          int total = carry;
          if (i >= 0) {
              total += a.charAt(i) - '0';
              i--;
          }
          if (j >= 0) {
              total += b.charAt(j) - '0';
              j--;
          }
          result.append(total % 10);
          carry = total / 10;
      }
      System.out.println(result.reverse());`
  },
  solution: {
    explanation: ['The loop handles one column per round, from the right. The carry is at most 1, so each `total` is at most 19. The loop also runs once more if a carry is left after the last digits, which creates a new leading digit (as in 999 + 1 = 1000).'],
    complexity: 'Time O(max(length a, length b)), space O(length of the result).'
  },
  solve(input) { const [a, b] = input.trim().split(/\s+/); return String(BigInt(a) + BigInt(b)); },
  tests() {
    const g = rng(93);
    return ['999\n17\n', '0\n0\n', '1\n999999999999999999999999\n', '999999999999999999999999\n1\n', '5\n5\n', '123456789123456789123456789\n987654321987654321987654321\n', `${'9'.repeat(2000)}\n1\n`, `${digits(g, 2000)}\n${digits(g, 2000)}\n`, `${digits(g, 2000)}\n${digits(g, 7)}\n`, ...many(5, () => `${digits(g, randInt(g, 1, 60))}\n${digits(g, randInt(g, 1, 60))}\n`)];
  }
};
