import { rng, randInt } from '../lib.mjs';

export default {
  slug: 'sum-of-array',
  title: 'Sum of an Array',
  topic: 'basics',
  difficulty: 'easy',
  order: 1,
  tags: ['loops', 'arrays'],

  concept: {
    title: 'The accumulator pattern',
    body: [
      'Many problems are solved by walking through the data once and keeping a running answer. That running answer is called an **accumulator**. For a sum, the accumulator starts at `0` and each number is added to it.',
      'Visiting every element exactly once takes time proportional to the number of elements. We write that as **O(n)**, and it is the baseline to compare faster or slower ideas against.',
      'Watch the size of the answer. A 32-bit integer holds values up to about 2.1 billion. Adding many large numbers can pass that limit and silently wrap around. In C++ use `long long` (64-bit) when the total can be large. Python integers have no limit.'
    ]
  },

  statement: [
    'You are given a list of integers. Print the sum of all of them.'
  ],
  inputFormat: [
    'The first line contains one integer `n`, the number of integers.',
    'The second line contains `n` integers separated by spaces.'
  ],
  outputFormat: ['Print one integer: the sum of the `n` numbers.'],
  constraints: ['1 <= n <= 50000', '-10^9 <= each number <= 10^9'],
  examples: [
    { input: '3\n1 2 3\n', note: '1 + 2 + 3 = 6.' },
    { input: '4\n-5 10 -3 8\n', note: 'Negative numbers are allowed: -5 + 10 - 3 + 8 = 10.' }
  ],
  hints: [
    'Start with a variable `total = 0` and visit every number once.',
    'How large can the total get? Up to 50000 numbers of size 10^9 add up to 5 * 10^13. That is more than a 32-bit integer can hold.',
    'In C++ read the numbers into `long long` and keep `total` as `long long` (in Java use `long`). Python needs no special care.'
  ],
  starter: {
    python: '# Read n, then n integers, and print their sum.\nn = int(input())\nnumbers = list(map(int, input().split()))\n\n# Your code here\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Read the n numbers and print their sum.\n    return 0;\n}\n',
    java: 'import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(in.readLine().trim());\n        StringTokenizer tokens = new StringTokenizer(in.readLine());\n        // Read the n numbers and print their sum.\n    }\n}\n'
  },
  solution: {
    explanation: [
      'Keep one variable, `total`, that starts at 0. Go through the numbers one by one and add each to `total`. When the loop ends, `total` holds the answer.',
      'The numbers can add up to 10^14, so the C++ version uses `long long` for both `total` and the numbers it reads.'
    ],
    complexity: 'Time O(n), extra space O(1) in C++ (O(n) in the Python version, which stores the list).',
    code: {
      python: 'n = int(input())\nnumbers = list(map(int, input().split()))\n\ntotal = 0\nfor x in numbers:\n    total += x\nprint(total)\n',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long total = 0;\n    for (int i = 0; i < n; i++) {\n        long long x;\n        cin >> x;\n        total += x;\n    }\n    cout << total << endl;\n    return 0;\n}\n',
      java: 'import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(in.readLine().trim());\n        StringTokenizer tokens = new StringTokenizer(in.readLine());\n        long total = 0;\n        for (int i = 0; i < n; i++) {\n            total += Long.parseLong(tokens.nextToken());\n        }\n        System.out.println(total);\n    }\n}\n'
    }
  },

  solve(input) {
    const [first, second] = input.trim().split('\n');
    const n = Number(first);
    const numbers = second.split(' ').map(BigInt);
    if (numbers.length !== n) throw new Error('bad test: wrong count');
    return String(numbers.reduce((a, b) => a + b, 0n));
  },

  tests() {
    const r = rng(1001);
    const list = (values) => `${values.length}\n${values.join(' ')}\n`;
    const random = (n, lo, hi) => Array.from({ length: n }, () => randInt(r, lo, hi));
    return [
      list([0]),
      list([-1000000000]),
      list([1000000000, 1000000000, 1000000000]),
      list([7, -7]),
      list(random(10, -100, 100)),
      list(random(1000, -1000000000, 1000000000)),
      list(Array.from({ length: 50000 }, () => 1000000000)),
      list(random(30000, -1000000000, 1000000000))
    ];
  }
};
