const r = String.raw;

export default {
  slug: 'print-an-expression',
  title: 'Let the Computer Calculate',
  topic: 'basics',
  difficulty: 'easy',
  order: 3,
  noInput: true,
  tags: ['arithmetic', 'syntax'],

  concept: {
    title: 'Arithmetic operators',
    body: [
      'A program can calculate. The operators are `+` (add), `-` (subtract), `*` (multiply), `/` (divide) and `%` (remainder). Multiplication and division happen before addition and subtraction, and parentheses `( )` change the order, just like in school mathematics.',
      "The tricky one is division. With whole numbers, C++ and Java drop the fraction: `17 / 5` is `3`. Python's `/` always gives a decimal (`3.4`), so for whole-number division Python uses `//`. The remainder is `%` in all three languages: `17 % 5` is `2`.",
      { code: '# Python\nprint(17 // 5)   # 3\nprint(17 % 5)    # 2\n\n// C++\ncout << 17 / 5 << endl;   // 3\n\n// Java\nSystem.out.println(17 % 5);   // 2' },
      'You can print the result of a calculation directly, without storing it first.'
    ]
  },

  statement: [
    'Let the program do the arithmetic. Print three lines:',
    { list: ['the value of `(7 + 5) * 3 - 4`', '`17` divided by `5`, keeping only the whole number', 'the remainder when `17` is divided by `5`'] }
  ],
  inputFormat: ['There is no input.'],
  outputFormat: ['Print three lines, each with one number.'],
  constraints: ['There is nothing to read, so there are no limits.'],
  examples: [{ input: '\n', note: 'The expected output is 32, then 3, then 2.' }],
  hints: [
    'Write the expression exactly as in the statement and print it. Parentheses work in every language.',
    'In Python use `//` for the whole-number division. In C++ and Java `/` between two whole numbers already does it.',
    'The remainder is `17 % 5`.'
  ],
  program: {
    io: [],
    python: r`
      print((7 + 5) * 3 - 4)
      print(17 // 5)
      print(17 % 5)`,
    cpp: r`
      cout << (7 + 5) * 3 - 4 << endl;
      cout << 17 / 5 << endl;
      cout << 17 % 5 << endl;`,
    java: r`
      System.out.println((7 + 5) * 3 - 4);
      System.out.println(17 / 5);
      System.out.println(17 % 5);`
  },
  solution: {
    explanation: ['`(7 + 5) * 3 - 4` is `12 * 3 - 4 = 32`. Seventeen divided by five is three with remainder two. Python needs `//` for the whole-number quotient; C++ and Java use `/` because both numbers are whole.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve() { return '32\n3\n2'; },
  tests() { return ['\n']; }
};
