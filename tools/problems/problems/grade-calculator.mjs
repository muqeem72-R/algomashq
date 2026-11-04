import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'grade-calculator',
  title: 'Grade Calculator',
  topic: 'basics',
  difficulty: 'easy',
  order: 24,
  tags: ['conditions', 'ranges'],

  concept: {
    title: 'Ranges and the order of checks',
    body: [
      'A grade depends on which **range** the marks fall in. A chain of `if / else if` is perfect for this, as long as you order the checks so that each one can rely on the earlier ones having failed.',
      'If you test from the top (`marks >= 90`, then `marks >= 80`, then `marks >= 70`, ...) you never need to write the upper limit of a range again: when you reach the `>= 80` check you already know the marks are below 90. Testing from the bottom would need both ends in every condition.',
      'Always test the edge values yourself: 90 is an A, 89 is a B.'
    ]
  },

  statement: [
    'Given the marks of a student (0 to 100), print the grade:',
    { list: ['`A` for 90 or more', '`B` for 80 to 89', '`C` for 70 to 79', '`D` for 60 to 69', '`F` for less than 60'] }
  ],
  inputFormat: ['A single integer `marks`.'],
  outputFormat: ['Print one letter: `A`, `B`, `C`, `D` or `F`.'],
  constraints: ['0 <= marks <= 100'],
  examples: [{ input: '95\n', note: '95 is at least 90.' }, { input: '79\n', note: 'Just below 80: grade C.' }],
  hints: [
    'Start with the best grade and walk down: is it at least 90? at least 80? ...',
    'Because you test from the top, each condition is only `marks >= something`.',
    'The last `else` is the `F` grade.'
  ],
  program: {
    io: ['marks:int'],
    python: r`
      if marks >= 90:
          print("A")
      elif marks >= 80:
          print("B")
      elif marks >= 70:
          print("C")
      elif marks >= 60:
          print("D")
      else:
          print("F")`,
    cpp: r`
      if (marks >= 90) {
          cout << "A" << endl;
      } else if (marks >= 80) {
          cout << "B" << endl;
      } else if (marks >= 70) {
          cout << "C" << endl;
      } else if (marks >= 60) {
          cout << "D" << endl;
      } else {
          cout << "F" << endl;
      }`,
    java: r`
      if (marks >= 90) {
          System.out.println("A");
      } else if (marks >= 80) {
          System.out.println("B");
      } else if (marks >= 70) {
          System.out.println("C");
      } else if (marks >= 60) {
          System.out.println("D");
      } else {
          System.out.println("F");
      }`
  },
  solution: {
    explanation: ['The checks run from the highest grade down. The first condition that is true decides the grade, and everything below 60 falls through to `F`.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const m = Number(input.trim()); return m >= 90 ? 'A' : m >= 80 ? 'B' : m >= 70 ? 'C' : m >= 60 ? 'D' : 'F'; },
  tests() {
    const g = rng(24);
    return ['95\n', '79\n', '100\n', '90\n', '89\n', '80\n', '70\n', '69\n', '60\n', '59\n', '0\n', ...many(4, () => `${randInt(g, 0, 100)}\n`)];
  }
};
