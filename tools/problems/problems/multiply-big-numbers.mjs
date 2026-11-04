import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

const digits = (g, len) => (len === 1 ? String(randInt(g, 0, 9)) : String(randInt(g, 1, 9)) + Array.from({ length: len - 1 }, () => randInt(g, 0, 9)).join(''));

export default {
  slug: 'multiply-big-numbers',
  title: 'Multiply Huge Numbers',
  topic: 'basics',
  difficulty: 'hard',
  order: 94,
  tags: ['strings', 'big-numbers', 'arrays', 'simulation'],

  concept: {
    title: 'School multiplication with an array',
    body: [
      'Multiplying two numbers of 300 digits works like the method from school, but with a neat shortcut. The digit at position `i` of `a` (counting from 0 at the left) times the digit at position `j` of `b` contributes to position `i + j + 1` of the result, where the result has `len(a) + len(b)` positions (a product never has more digits than that).',
      { code: 'result = [0] * (len(a) + len(b))\nfor i in range(len(a) - 1, -1, -1):\n    for j in range(len(b) - 1, -1, -1):\n        result[i + j + 1] += int(a[i]) * int(b[j])' },
      'Here the cells are allowed to grow above 9. A cell collects at most 300 products of at most 81 each, so it never gets near the limit of an `int`. In a second pass go from the right to the left and **normalise**: move everything above 9 to the cell on the left as a carry.',
      { code: 'for k in range(len(result) - 1, 0, -1):\n    result[k - 1] += result[k] // 10\n    result[k] %= 10' },
      'Finally remove the leading zeros (the product may have one digit fewer than `len(a) + len(b)`), but keep a single `0` if the whole product is zero.',
      'The two nested loops make about 300 * 300 = 90,000 steps. This is the **O(n * m)** cost of the school method.'
    ]
  },

  statement: ['You are given two non-negative integers `a` and `b`, written as strings of digits (no leading zeros). Print their product, without leading zeros. Multiply them digit by digit.'],
  inputFormat: ['The first line has `a`. The second line has `b`.'],
  outputFormat: ['The product `a * b`.'],
  constraints: ['1 <= number of digits of a and of b <= 300'],
  examples: [{ input: '12\n12\n', note: '12 * 12 = 144.' }, { input: '999\n0\n', note: 'Anything times zero is 0.' }],
  hints: [
    'Make an array of `len(a) + len(b)` zeros. Add `a[i] * b[j]` into the cell `i + j + 1` for every pair of digits.',
    'Then go from the right to the left: the cell on the left receives `cell / 10`, and the cell keeps `cell % 10`.',
    'Skip the leading zeros when you print the result, but print `0` if nothing but zeros is left.'
  ],
  program: {
    io: ['a:word', 'b:word'],
    python: r`
      result = [0] * (len(a) + len(b))
      for i in range(len(a) - 1, -1, -1):
          for j in range(len(b) - 1, -1, -1):
              result[i + j + 1] += int(a[i]) * int(b[j])
      for k in range(len(result) - 1, 0, -1):
          result[k - 1] += result[k] // 10
          result[k] %= 10
      text = "".join(str(d) for d in result).lstrip("0")
      print(text if text else "0")`,
    cpp: r`
      int la = a.length(), lb = b.length();
      vector<int> result(la + lb, 0);
      for (int i = la - 1; i >= 0; i--) {
          for (int j = lb - 1; j >= 0; j--) {
              result[i + j + 1] += (a[i] - '0') * (b[j] - '0');
          }
      }
      for (int k = la + lb - 1; k > 0; k--) {
          result[k - 1] += result[k] / 10;
          result[k] %= 10;
      }
      string text = "";
      for (int d : result) {
          text += char('0' + d);
      }
      int first = 0;
      while (first < (int) text.length() - 1 && text[first] == '0') {
          first++;
      }
      cout << text.substr(first) << endl;`,
    java: r`
      int la = a.length(), lb = b.length();
      int[] result = new int[la + lb];
      for (int i = la - 1; i >= 0; i--) {
          for (int j = lb - 1; j >= 0; j--) {
              result[i + j + 1] += (a.charAt(i) - '0') * (b.charAt(j) - '0');
          }
      }
      for (int k = la + lb - 1; k > 0; k--) {
          result[k - 1] += result[k] / 10;
          result[k] %= 10;
      }
      StringBuilder text = new StringBuilder();
      for (int d : result) {
          text.append(d);
      }
      int first = 0;
      while (first < text.length() - 1 && text.charAt(first) == '0') {
          first++;
      }
      System.out.println(text.substring(first));`
  },
  solution: {
    explanation: ['Every pair of digits adds its product to the cell where it belongs by place value. A second pass carries the overflow of each cell to its left neighbour. The leading zeros are skipped when the digits are put together.'],
    complexity: 'Time O(length a * length b), space O(length a + length b).'
  },
  solve(input) { const [a, b] = input.trim().split(/\s+/); return String(BigInt(a) * BigInt(b)); },
  tests() {
    const g = rng(94);
    return ['12\n12\n', '999\n0\n', '0\n0\n', '1\n1\n', '99\n99\n', '1000\n1000\n', `${'9'.repeat(300)}\n${'9'.repeat(300)}\n`, `${digits(g, 300)}\n${digits(g, 300)}\n`, `${digits(g, 300)}\n${digits(g, 1)}\n`, ...many(5, () => `${digits(g, randInt(g, 1, 40))}\n${digits(g, randInt(g, 1, 40))}\n`)];
  }
};
