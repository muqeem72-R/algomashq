import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'vowel-or-consonant',
  title: 'Vowel or Consonant',
  topic: 'basics',
  difficulty: 'easy',
  order: 25,
  tags: ['characters', 'conditions'],

  concept: {
    title: 'The character type',
    body: [
      'A single letter is a **character**. C++ and Java have a separate type for it (`char`), written between *single* quotes: `\'a\'`. Text of any length, a *string*, uses double quotes: `"a"`. Python has no separate character type; a character is just a string of length one.',
      { code: '# Python\nif c == "a" or c == "e":\n\n// C++ and Java\nif (c == \'a\' || c == \'e\')' },
      'To test a character against many values you can combine comparisons with `or`, or ask whether it is one of the characters of a string. In Python: `c in "aeiou"`.',
      'Mind the case: `\'A\'` and `\'a\'` are different characters. This problem only uses lower case letters.'
    ]
  },

  statement: ['Given a lower case English letter, print `vowel` if it is one of `a`, `e`, `i`, `o`, `u`, and `consonant` otherwise.'],
  inputFormat: ['A single lower case letter.'],
  outputFormat: ['Print `vowel` or `consonant`.'],
  constraints: ['The input is one letter between `a` and `z`.'],
  examples: [{ input: 'e\n', note: 'e is a vowel.' }, { input: 'k\n', note: 'k is a consonant.' }],
  hints: [
    'There are exactly five vowels. List them.',
    'Compare the letter with each vowel and join the comparisons with `or` (`||` in C++ and Java).',
    'Everything that is not a vowel is a consonant, so use `else` for that.'
  ],
  program: {
    io: ['c:char'],
    python: r`
      if c in "aeiou":
          print("vowel")
      else:
          print("consonant")`,
    cpp: r`
      if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
          cout << "vowel" << endl;
      } else {
          cout << "consonant" << endl;
      }`,
    java: r`
      if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
          System.out.println("vowel");
      } else {
          System.out.println("consonant");
      }`
  },
  solution: {
    explanation: ['The letter is a vowel if it equals any one of the five vowels; otherwise it is a consonant. Python can write the same test with `in`.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { return 'aeiou'.includes(input.trim()) ? 'vowel' : 'consonant'; },
  tests() {
    const g = rng(25);
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return ['a\n', 'e\n', 'i\n', 'o\n', 'u\n', 'b\n', 'z\n', 'y\n', ...many(5, () => `${letters[randInt(g, 0, 25)]}\n`)];
  }
};
