import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;
const SAMPLES = 'AZMaqz09537#!@+-*/%?';

export default {
  slug: 'kind-of-character',
  title: 'Kind of Character',
  topic: 'basics',
  difficulty: 'easy',
  order: 26,
  tags: ['characters', 'conditions', 'ascii'],

  concept: {
    title: 'Characters are numbers',
    body: [
      'Inside the computer every character is a number (its **ASCII code**): `\'0\'` to `\'9\'` are 48 to 57, `\'A\'` to `\'Z\'` are 65 to 90 and `\'a\'` to `\'z\'` are 97 to 122. Because the letters are in order, you can compare characters with `<=` and `>=`, just like numbers.',
      { code: '# Python (compare as strings of length 1)\nif "A" <= c <= "Z":\n\n// C++ and Java\nif (c >= \'A\' && c <= \'Z\')' },
      'Checking a range this way is shorter than listing every letter, and it works for digits as well. Many languages also have helper functions (`isupper`, `isdigit`, `Character.isDigit`), but doing it with ranges teaches you what they do.'
    ]
  },

  statement: [
    'Given a single character, print what kind of character it is:',
    { list: ['`upper` for a capital letter `A` to `Z`', '`lower` for a small letter `a` to `z`', '`digit` for `0` to `9`', '`other` for anything else'] }
  ],
  inputFormat: ['A single visible character (not a space).'],
  outputFormat: ['Print `upper`, `lower`, `digit` or `other`.'],
  constraints: ['The character is a printable ASCII symbol other than a space.'],
  examples: [{ input: 'G\n', note: 'A capital letter.' }, { input: '7\n', note: 'A digit.' }, { input: '#\n', note: 'Neither a letter nor a digit.' }],
  hints: [
    'Use three range checks, one for each kind.',
    'A capital letter is `c >= \'A\'` and `c <= \'Z\'`. Do the same for lower case and for digits.',
    'Everything that did not match one of the three ranges goes to the final `else`.'
  ],
  program: {
    io: ['c:char'],
    python: r`
      if "A" <= c <= "Z":
          print("upper")
      elif "a" <= c <= "z":
          print("lower")
      elif "0" <= c <= "9":
          print("digit")
      else:
          print("other")`,
    cpp: r`
      if (c >= 'A' && c <= 'Z') {
          cout << "upper" << endl;
      } else if (c >= 'a' && c <= 'z') {
          cout << "lower" << endl;
      } else if (c >= '0' && c <= '9') {
          cout << "digit" << endl;
      } else {
          cout << "other" << endl;
      }`,
    java: r`
      if (c >= 'A' && c <= 'Z') {
          System.out.println("upper");
      } else if (c >= 'a' && c <= 'z') {
          System.out.println("lower");
      } else if (c >= '0' && c <= '9') {
          System.out.println("digit");
      } else {
          System.out.println("other");
      }`
  },
  solution: {
    explanation: ['The ASCII codes of each group are consecutive, so a pair of comparisons recognizes the whole group. The groups do not overlap, so the order of the checks is free.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) {
    const c = input.trim();
    return c >= 'A' && c <= 'Z' ? 'upper' : c >= 'a' && c <= 'z' ? 'lower' : c >= '0' && c <= '9' ? 'digit' : 'other';
  },
  tests() {
    const g = rng(26);
    return [...SAMPLES].map((c) => `${c}\n`).concat(many(3, () => `${SAMPLES[randInt(g, 0, SAMPLES.length - 1)]}\n`));
  }
};
