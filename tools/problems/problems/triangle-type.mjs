import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'triangle-type',
  title: 'Type of Triangle',
  topic: 'basics',
  difficulty: 'easy',
  order: 28,
  tags: ['conditions', 'geometry'],

  concept: {
    title: 'Check validity first',
    body: [
      'Before classifying something, make sure it is valid. Three lengths form a real triangle only if each side is shorter than the sum of the other two. If the longest side is equal to the sum of the other two, the triangle is flat (a line), which does not count.',
      'Checking `a + b > c` for all three combinations covers every case, so you do not need to find the longest side first.',
      'Once the triangle is valid, count the equal sides: all three equal is **equilateral**, exactly two equal is **isosceles**, none equal is **scalene**. Test the most special case first.'
    ]
  },

  statement: [
    'Given the lengths of three sides, print the type of the triangle:',
    { list: ['`invalid` if the sides cannot form a triangle (a flat triangle is also invalid)', '`equilateral` if all three sides are equal', '`isosceles` if exactly two sides are equal', '`scalene` if all sides are different'] }
  ],
  inputFormat: ['One line with three integers `a`, `b` and `c`.'],
  outputFormat: ['Print `invalid`, `equilateral`, `isosceles` or `scalene`.'],
  constraints: ['1 <= a, b, c <= 10^9'],
  examples: [{ input: '3 4 5\n', note: 'All sides differ and 3 + 4 > 5: scalene.' }, { input: '1 2 3\n', note: '1 + 2 equals 3: flat, so invalid.' }],
  hints: [
    'First check that `a + b > c`, `a + c > b` and `b + c > a` are all true.',
    'If the triangle is valid, check `a == b && b == c` first (equilateral).',
    'Then check whether any two sides are equal (isosceles). Otherwise it is scalene.'
  ],
  program: {
    io: ['a:int b:int c:int'],
    python: r`
      if a + b <= c or a + c <= b or b + c <= a:
          print("invalid")
      elif a == b and b == c:
          print("equilateral")
      elif a == b or b == c or a == c:
          print("isosceles")
      else:
          print("scalene")`,
    cpp: r`
      if (a + b <= c || a + c <= b || b + c <= a) {
          cout << "invalid" << endl;
      } else if (a == b && b == c) {
          cout << "equilateral" << endl;
      } else if (a == b || b == c || a == c) {
          cout << "isosceles" << endl;
      } else {
          cout << "scalene" << endl;
      }`,
    java: r`
      if (a + b <= c || a + c <= b || b + c <= a) {
          System.out.println("invalid");
      } else if (a == b && b == c) {
          System.out.println("equilateral");
      } else if (a == b || b == c || a == c) {
          System.out.println("isosceles");
      } else {
          System.out.println("scalene");
      }`
  },
  solution: {
    explanation: ['Invalid triangles are filtered out first. After that, equal sides decide the type: all three equal, any two equal, or none equal. The sums are at most 2 * 10^9, so 64-bit variables avoid overflow.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) {
    const [a, b, c] = input.trim().split(/\s+/).map(Number);
    if (a + b <= c || a + c <= b || b + c <= a) return 'invalid';
    if (a === b && b === c) return 'equilateral';
    return a === b || b === c || a === c ? 'isosceles' : 'scalene';
  },
  tests() {
    const g = rng(28);
    return ['3 4 5\n', '1 2 3\n', '5 5 5\n', '5 5 8\n', '8 5 5\n', '5 8 5\n', '1 1 2\n', '2 2 4\n', '1000000000 1000000000 1000000000\n', '1000000000 1 1000000000\n', '1000000000 1 1\n', ...many(5, () => `${randInt(g, 1, 12)} ${randInt(g, 1, 12)} ${randInt(g, 1, 12)}\n`)];
  }
};
