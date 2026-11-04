import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

const fact = (n) => { let x = 1n; for (let i = 2n; i <= BigInt(n); i++) x *= i; return x; };

export default {
  slug: 'factorial-of-big-n',
  title: 'Factorial of a Big Number',
  topic: 'basics',
  difficulty: 'hard',
  order: 95,
  tags: ['arrays', 'big-numbers', 'factorial', 'simulation'],

  concept: {
    title: 'A big number as an array of digits',
    body: [
      'You printed `n!` for `n <= 20` in the factorial problem, where it fits in 64 bits. `50!` already has 65 digits, and `500!` has 1135. To compute it, keep the number as an **array of digits**, least significant digit first, and multiply the whole array by a small number `k` for `k = 2, 3, ..., n`.',
      'Multiplying an array by `k` is school multiplication with one row. Go through the digits from the least significant one; for each digit compute `digit * k + carry`, keep the last digit of that in the array and pass the rest on as the new carry. When the digits run out, the carry may still be larger than 9: append its digits (one at a time) to the end of the array.',
      { code: 'carry = 0\nfor i in range(len(digits)):\n    value = digits[i] * k + carry\n    digits[i] = value % 10\n    carry = value // 10\nwhile carry > 0:\n    digits.append(carry % 10)\n    carry //= 10' },
      'The array grows slowly (about 2.5 digits per step near 500). The total work is about `n` times the number of digits, a million basic steps for `n = 500`. At the end print the digits from the most significant one, which is the **end** of the array.',
      'Start with `digits = [1]`, which is `0! = 1! = 1`.'
    ]
  },

  statement: ['Given `n`, print `n!` (the product of the integers from 1 to `n`) exactly, with all its digits. The result is too large for an ordinary integer type.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The exact value of `n!`.'],
  constraints: ['0 <= n <= 500'],
  examples: [{ input: '25\n', note: '25! = 15511210043330985984000000 (26 digits).' }, { input: '0\n', note: '0! = 1.' }],
  hints: [
    'Keep the digits in an array, with the least significant digit at index 0. Start with the array `[1]`.',
    'For each `k` from 2 to `n`, multiply every digit by `k`, handling the carry as in school multiplication.',
    'After the loop over the digits, append whatever is left of the carry, digit by digit. Print the array backwards.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      digits = [1]
      for k in range(2, n + 1):
          carry = 0
          for i in range(len(digits)):
              value = digits[i] * k + carry
              digits[i] = value % 10
              carry = value // 10
          while carry > 0:
              digits.append(carry % 10)
              carry //= 10
      print("".join(str(d) for d in reversed(digits)))`,
    cpp: r`
      vector<int> digits(1, 1);
      for (int k = 2; k <= n; k++) {
          int carry = 0;
          for (int i = 0; i < (int) digits.size(); i++) {
              int value = digits[i] * k + carry;
              digits[i] = value % 10;
              carry = value / 10;
          }
          while (carry > 0) {
              digits.push_back(carry % 10);
              carry /= 10;
          }
      }
      for (int i = (int) digits.size() - 1; i >= 0; i--) {
          cout << digits[i];
      }
      cout << endl;`,
    java: r`
      int[] digits = new int[2000];
      int size = 1;
      digits[0] = 1;
      for (int k = 2; k <= n; k++) {
          int carry = 0;
          for (int i = 0; i < size; i++) {
              int value = digits[i] * k + carry;
              digits[i] = value % 10;
              carry = value / 10;
          }
          while (carry > 0) {
              digits[size] = carry % 10;
              size++;
              carry /= 10;
          }
      }
      StringBuilder text = new StringBuilder();
      for (int i = size - 1; i >= 0; i--) {
          text.append(digits[i]);
      }
      System.out.println(text);`
  },
  solution: {
    explanation: ['The array holds the digits of the running product. Multiplying by `k` is done column by column with a carry, and the carry that remains after the last column extends the array. At most `9 * 500 + carry` ever occurs in a cell calculation, so ordinary `int` variables suffice.'],
    complexity: 'Time O(n * number of digits), about 5 * 10^5 steps for n = 500, space O(number of digits).'
  },
  solve(input) { return String(fact(Number(input.trim()))); },
  tests() {
    const g = rng(95);
    return ['25\n', '0\n', '1\n', '2\n', '10\n', '20\n', '50\n', '100\n', '500\n', '499\n', ...many(4, () => `${randInt(g, 0, 500)}\n`)];
  }
};
