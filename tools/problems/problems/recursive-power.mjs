import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

const MOD = 1000000007n;

export default {
  slug: 'recursive-power',
  title: 'Recursive Power',
  topic: 'basics',
  difficulty: 'medium',
  order: 77,
  tags: ['recursion', 'modulo', 'power'],

  concept: {
    title: 'Recursion with two parameters, and the remainder trick',
    body: [
      'A power can be defined recursively: `a^b = a * a^(b-1)` and `a^0 = 1`. The recursive call gets a smaller exponent, and the base `a` stays the same. The function has two parameters, but only one of them (`b`) shrinks.',
      'Powers grow fast: `2^500` has 151 digits, which no integer type can hold. When a problem asks for the answer **modulo** `m` (the remainder after dividing by `m`), you may take the remainder after every multiplication, because `(x * y) % m = ((x % m) * (y % m)) % m`. All the numbers stay smaller than `m`, so nothing overflows.',
      'With `m = 1,000,000,007` every intermediate product is below about 10^18, which fits in 64 bits. This modulus (a prime close to a billion) is used in a huge number of contest problems, so it is worth remembering.',
      'The recursion is `b` levels deep. In the next problems of this list you will see how to make it only about `log b` levels deep.'
    ]
  },

  statement: ['Write a recursive function that computes `a` to the power `b` modulo 1000000007, and print its result. Do not use a loop and do not use a built-in power function.'],
  inputFormat: ['One line with two integers `a` and `b`.'],
  outputFormat: ['`a^b mod 1000000007`.'],
  constraints: ['0 <= a <= 10^9', '0 <= b <= 500'],
  examples: [{ input: '2 10\n', note: '2^10 = 1024.' }, { input: '2 100\n', note: '2^100 mod 1000000007 = 976371285.' }],
  hints: [
    'What is `a` to the power 0? That is your base case.',
    'Otherwise `a^b` is `a` times `a^(b-1)`.',
    'Take `% 1000000007` after each multiplication. In C++ and Java use 64-bit numbers so that the product (up to about 10^18) does not overflow.'
  ],
  program: {
    io: ['a:int b:int'],
    helpers: {
      python: r`
        MOD = 1000000007

        def power(a, b):
            if b == 0:
                return 1
            return a * power(a, b - 1) % MOD`,
      cpp: r`
        const long long MOD = 1000000007LL;

        long long power(long long a, long long b) {
            if (b == 0) {
                return 1;
            }
            return a * power(a, b - 1) % MOD;
        }`,
      java: r`
        static final long MOD = 1000000007L;

        static long power(long a, long b) {
            if (b == 0) {
                return 1;
            }
            return a * power(a, b - 1) % MOD;
        }`
    },
    starterHelpers: {
      python: r`
        MOD = 1000000007

        def power(a, b):
            # Your code here
            pass`,
      cpp: r`
        const long long MOD = 1000000007LL;

        long long power(long long a, long long b) {
            // Your code here
            return 0;
        }`,
      java: r`
        static final long MOD = 1000000007L;

        static long power(long a, long b) {
            // Your code here
            return 0;
        }`
    },
    starterBody: {
      python: 'print(power(a, b))',
      cpp: r`cout << power(a, b) << endl;`,
      java: 'System.out.println(power(a, b));'
    },
    python: 'print(power(a, b))',
    cpp: r`cout << power(a, b) << endl;`,
    java: 'System.out.println(power(a, b));'
  },
  solution: {
    explanation: ['The base case is exponent 0 with answer 1. Otherwise one more factor `a` is multiplied onto the answer for exponent `b - 1`, and the remainder is taken at once. `a` is below 10^9 + 7 only if reduced; the product `a * (result below 10^9 + 7)` is at most about 10^18, which fits in 64 bits. For `b = 0` the answer is 1 even for `a = 0`.'],
    complexity: 'Time O(b), space O(b) for the call stack.'
  },
  solve(input) { const [a, b] = input.trim().split(/\s+/).map(BigInt); let x = 1n; for (let i = 0n; i < b; i++) x = (x * a) % MOD; return String(x); },
  tests() {
    const g = rng(77);
    return ['2 10\n', '2 100\n', '0 0\n', '0 5\n', '5 0\n', '1000000000 500\n', '1000000000 1\n', '999999999 499\n', '7 500\n', ...many(5, () => `${randInt(g, 0, 1e9)} ${randInt(g, 0, 500)}\n`)];
  }
};
