import { rng, randBig, modPow } from '../lib.mjs';

export default {
  slug: 'fast-power',
  title: 'Fast Power',
  topic: 'basics',
  difficulty: 'medium',
  order: 81,
  tags: ['math', 'complexity', 'modular arithmetic'],

  concept: {
    title: 'Halving the work: exponentiation by squaring',
    body: [
      'Computing `a^b` by multiplying `a` by itself `b` times takes `b` steps. When `b` can be 10^18 that is hopeless: even a billion steps per second would need about 30 years.',
      'The trick is to halve the exponent. `a^b = (a^(b/2))^2` when `b` is even, and `a^b = a * a^(b-1)` when `b` is odd. Each step halves `b`, so only about `log2(b)` steps are needed, about 60 for 10^18. We say the running time is **O(log b)**.',
      'The numbers also explode in size, so we work **modulo** `m`. The rule `(x * y) mod m = ((x mod m) * (y mod m)) mod m` lets us reduce after every multiplication and keep every value below `m`.'
    ]
  },

  statement: [
    'Given three integers `a`, `b` and `m`, print `(a^b) mod m`, the remainder when `a` multiplied by itself `b` times is divided by `m`.',
    'Define `a^0 = 1`, so for `b = 0` the answer is `1 mod m`.'
  ],
  inputFormat: ['One line with three integers `a`, `b` and `m` separated by spaces.'],
  outputFormat: ['Print one integer: `(a^b) mod m`.'],
  constraints: ['0 <= a <= 10^18', '0 <= b <= 10^18', '1 <= m <= 10^9'],
  examples: [
    { input: '2 10 1000\n', note: '2^10 = 1024, and 1024 mod 1000 = 24.' },
    { input: '5 3 13\n', note: '5^3 = 125, and 125 mod 13 = 8.' },
    { input: '3 0 7\n', note: 'Anything to the power 0 is 1.' }
  ],
  hints: [
    'Multiplying `b` times is far too slow when `b` is 10^18.',
    '`a^10 = (a^5)^2` and `a^5 = a * (a^2)^2`. How many times can you halve `b` before it reaches 0?',
    'Take `% m` after every multiplication. Start with `a % m`, and in C++ (`long long`) or Java (`long`) keep every value in 64 bits: two values below 10^9 multiply to less than 10^18.'
  ],
  starter: {
    python: '# Read a, b, m and print (a ** b) % m\na, b, m = map(int, input().split())\n\n# Your code here\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long a, b, m;\n    cin >> a >> b >> m;\n    // Print (a^b) mod m\n    return 0;\n}\n',
    java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        long a = in.nextLong();\n        long b = in.nextLong();\n        long m = in.nextLong();\n        // Print (a^b) mod m\n    }\n}\n'
  },
  solution: {
    explanation: [
      'Keep `result` (starts at `1 % m`) and `base` (starts at `a % m`). Look at the lowest bit of `b`. If it is 1, multiply `result` by `base`. Then square `base` and shift `b` one bit to the right. Repeat until `b` is 0.',
      'Each pass handles one bit of `b`, so there are at most 60 passes. `1 % m` makes the answer 0 when `m = 1`.',
      'Python has a built-in `pow(a, b, m)` that does exactly this. Writing it yourself shows how it works.'
    ],
    complexity: 'Time O(log b), space O(1).',
    code: {
      python: 'a, b, m = map(int, input().split())\n\nresult = 1 % m\nbase = a % m\nwhile b > 0:\n    if b & 1:\n        result = result * base % m\n    base = base * base % m\n    b >>= 1\nprint(result)\n',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long a, b, m;\n    cin >> a >> b >> m;\n    long long result = 1 % m;\n    long long base = a % m;\n    while (b > 0) {\n        if (b & 1) result = result * base % m;\n        base = base * base % m;\n        b >>= 1;\n    }\n    cout << result << endl;\n    return 0;\n}\n',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        long a = in.nextLong();\n        long b = in.nextLong();\n        long m = in.nextLong();\n        long result = 1 % m;\n        long base = a % m;\n        while (b > 0) {\n            if ((b & 1) == 1) result = result * base % m;\n            base = base * base % m;\n            b >>= 1;\n        }\n        System.out.println(result);\n    }\n}\n'
    }
  },

  solve(input) {
    const [a, b, m] = input.trim().split(' ').map(BigInt);
    return String(modPow(a, b, m));
  },

  tests() {
    const r = rng(1003);
    const T18 = 10n ** 18n;
    const line = (a, b, m) => `${a} ${b} ${m}\n`;
    const out = [
      line(0, 0, 5), line(0, 5, 7), line(7, 0, 1), line(1, T18, 2), line(2, 62, 1000000007),
      line(2, T18, 998244353), line(T18, T18, 1000000000), line(10, T18, 1000000007), line(999999999999999999n, 999999999999999999n, 999999937)
    ];
    for (let i = 0; i < 8; i++) out.push(line(randBig(r, 0n, T18), randBig(r, 0n, T18), randBig(r, 1n, 1000000000n)));
    return out;
  }
};
