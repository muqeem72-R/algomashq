export default {
  slug: 'factorial',
  title: 'Factorial',
  topic: 'basics',
  difficulty: 'easy',
  order: 2,
  tags: ['recursion', 'math'],

  concept: {
    title: 'Thinking recursively',
    body: [
      'A function is **recursive** when it calls itself on a smaller version of the same problem. Every recursive solution has two parts: a **base case**, an input so small that the answer is known right away, and a **recursive case**, which reduces the problem and trusts the function to solve the smaller one.',
      'The factorial is the classic example: `n! = n * (n - 1)!`, and `0! = 1`. The base case stops the calls; without it the function would call itself forever.',
      'Each call waits for the next one to finish, so a recursion of depth `n` uses memory proportional to `n`. For small `n` this is no problem.'
    ]
  },

  statement: [
    'The factorial of a non-negative integer `n`, written `n!`, is the product of all integers from 1 to `n`. By definition `0! = 1`.',
    'Given `n`, print `n!`.'
  ],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Print `n!`.'],
  constraints: ['0 <= n <= 20'],
  examples: [
    { input: '5\n', note: '5! = 5 * 4 * 3 * 2 * 1 = 120.' },
    { input: '0\n', note: 'By definition 0! = 1.' }
  ],
  hints: [
    'Can you express `n!` using a smaller factorial?',
    'Which input has an answer you know without any work? That is your base case.',
    '21! does not fit in a signed 64-bit integer, which is why `n` stops at 20. In C++ use `long long`.'
  ],
  starter: {
    python: '# Read n and print n!\nn = int(input())\n\ndef factorial(n):\n    # Your code here\n    pass\n\nprint(factorial(n))\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nlong long factorial(int n) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << factorial(n) << endl;\n    return 0;\n}\n'
  },
  solution: {
    explanation: [
      'Base case: `factorial(0)` returns 1. Recursive case: `factorial(n)` returns `n * factorial(n - 1)`.',
      'For `n = 3` the calls unfold as `3 * (2 * (1 * 1))`, which is 6. The largest answer, `20!`, is 2432902008176640000 and still fits in 64 bits.'
    ],
    complexity: 'Time O(n), space O(n) for the chain of calls.',
    code: {
      python: 'n = int(input())\n\ndef factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(n))\n',
      cpp: '#include <iostream>\nusing namespace std;\n\nlong long factorial(int n) {\n    if (n == 0) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << factorial(n) << endl;\n    return 0;\n}\n'
    }
  },

  solve(input) {
    let result = 1n;
    for (let i = 2n; i <= BigInt(input.trim()); i++) result *= i;
    return String(result);
  },

  tests() {
    return Array.from({ length: 21 }, (_, n) => `${n}\n`);
  }
};
