import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'simple-calculator',
  title: 'Simple Calculator',
  topic: 'basics',
  difficulty: 'easy',
  order: 32,
  tags: ['conditions', 'characters', 'input'],

  concept: {
    title: 'Mixed input and choosing an operation',
    body: [
      'The input here mixes numbers and a symbol: `7 + 5`. The starter code reads the first number, then the operator as a character, then the second number. Python reads the whole line and splits it into three pieces of text, and then converts the two numbers.',
      'The operator tells the program what to do, so the natural tool is an `if / else if` chain (or a `switch`) over the operator character.',
      'For whole numbers the division `/` drops the fraction (in Python write `//`). All numbers in this problem are non-negative, so the languages agree on the result.'
    ]
  },

  statement: ['The input is a calculation of the form `a op b`, where `op` is one of `+`, `-`, `*` or `/`. Print the result. The division is a whole-number division (the fraction is dropped).'],
  inputFormat: ['One line: an integer `a`, a space, the operator, a space, an integer `b`.'],
  outputFormat: ['The result of the calculation.'],
  constraints: ['0 <= a, b <= 10^9', 'If the operator is `/` then `b >= 1`'],
  examples: [{ input: '7 + 5\n', note: '7 + 5 = 12.' }, { input: '17 / 5\n', note: 'Whole-number division: 3.' }, { input: '4 - 9\n', note: 'The result can be negative: -5.' }],
  hints: [
    'The starter code reads `a`, the operator `op` and `b` for you.',
    'Compare `op` with each of the four symbols. In C++ and Java a symbol is a `char` in single quotes, for example `\'+\'`.',
    'For `/` use whole-number division. The final `else` can handle it.'
  ],
  program: {
    io: ['a:int op:char b:int'],
    python: r`
      if op == "+":
          print(a + b)
      elif op == "-":
          print(a - b)
      elif op == "*":
          print(a * b)
      else:
          print(a // b)`,
    cpp: r`
      if (op == '+') {
          cout << a + b << endl;
      } else if (op == '-') {
          cout << a - b << endl;
      } else if (op == '*') {
          cout << a * b << endl;
      } else {
          cout << a / b << endl;
      }`,
    java: r`
      if (op == '+') {
          System.out.println(a + b);
      } else if (op == '-') {
          System.out.println(a - b);
      } else if (op == '*') {
          System.out.println(a * b);
      } else {
          System.out.println(a / b);
      }`
  },
  solution: {
    explanation: ['Each operator selects its own calculation. The product can reach 10^18, which still fits in a 64-bit integer.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) {
    const [a, op, b] = input.trim().split(/\s+/);
    const x = BigInt(a), y = BigInt(b);
    return String(op === '+' ? x + y : op === '-' ? x - y : op === '*' ? x * y : x / y);
  },
  tests() {
    const g = rng(32);
    const ops = ['+', '-', '*', '/'];
    return ['7 + 5\n', '17 / 5\n', '4 - 9\n', '0 * 0\n', '1000000000 * 1000000000\n', '1000000000 + 1000000000\n', '1 / 1\n', '5 / 17\n', '1000000000 / 1\n', ...many(6, (i) => `${randInt(g, 0, 1e6)} ${ops[i % 4]} ${randInt(g, 1, 1e6)}\n`)];
  }
};
