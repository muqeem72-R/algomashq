import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'celsius-to-fahrenheit',
  title: 'Celsius to Fahrenheit',
  topic: 'basics',
  difficulty: 'easy',
  order: 14,
  tags: ['decimals', 'formulas'],

  concept: {
    title: 'Mixing whole numbers and decimals',
    body: [
      'A formula such as `F = C * 9 / 5 + 32` looks harmless, but with whole numbers `C * 9 / 5` throws the fraction away in C++ and Java: for `C = 1` it gives `1` instead of `1.8`. The fix is to make at least one number in the calculation a decimal, for example `9.0 / 5` or `C * 9.0 / 5`.',
      'Operations run from left to right when they have the same priority, so `C * 9.0 / 5` is `(C * 9.0) / 5`. As soon as one operand is a decimal, the whole operation is done in decimals.',
      'This time print one digit after the decimal point.'
    ]
  },

  statement: ['Convert a temperature from Celsius to Fahrenheit with the formula `F = C * 9 / 5 + 32`. Print the result with exactly one digit after the decimal point.'],
  inputFormat: ['A single integer `C`, the temperature in degrees Celsius.'],
  outputFormat: ['Print `F` with one decimal.'],
  constraints: ['-100 <= C <= 100'],
  examples: [{ input: '37\n', note: '37 * 9 / 5 + 32 = 98.6.' }, { input: '0\n', note: 'Water freezes at 32.0 degrees Fahrenheit.' }],
  hints: [
    'Use the formula exactly as given.',
    'In C++ and Java write `9.0` instead of `9` somewhere, otherwise the division throws away the fraction.',
    'Print with one decimal: `.1f` in Python and Java, `setprecision(1)` with `fixed` in C++.'
  ],
  program: {
    io: ['c:int'],
    includes: ['<iomanip>'],
    python: r`
      f = c * 9 / 5 + 32
      print(f"{f:.1f}")`,
    cpp: r`
      double f = c * 9.0 / 5 + 32;
      cout << fixed << setprecision(1) << f << endl;`,
    java: r`
      double f = c * 9.0 / 5 + 32;
      System.out.printf("%.1f%n", f);`
  },
  solution: {
    explanation: ['The multiplication by `9.0` turns the calculation into a decimal one. Every answer has at most one digit after the point (it is a multiple of 0.2), so printing one decimal is exact.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { const c = Number(input.trim()); return (c * 9 / 5 + 32).toFixed(1); },
  tests() {
    const g = rng(14);
    return ['37\n', '0\n', '100\n', '-100\n', '-40\n', '1\n', '-1\n', '25\n', '-18\n', ...many(4, () => `${randInt(g, -100, 100)}\n`)];
  }
};
