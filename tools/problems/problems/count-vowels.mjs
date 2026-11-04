import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;
const LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const word = (g, len) => Array.from({ length: len }, () => LETTERS[randInt(g, 0, LETTERS.length - 1)]).join('');

export default {
  slug: 'count-vowels',
  title: 'Count the Vowels',
  topic: 'basics',
  difficulty: 'medium',
  order: 51,
  tags: ['strings', 'counting', 'characters'],

  concept: {
    title: 'Loop over characters, convert the case',
    body: [
      'Combine three tools you know: a loop over the characters of a string, the filter pattern (`if` plus a counter) and the vowel test.',
      'Upper and lower case letters are different characters (`\'A\'` is not `\'a\'`). The usual way out is to convert each letter to lower case before testing it, so you need to list only five vowels.',
      { code: '# Python\nch.lower()\n\n// C++ (add #include <cctype>)\ntolower(ch)\n\n// Java\nCharacter.toLowerCase(ch)' },
      'Converting once and testing once is simpler and less error-prone than writing ten comparisons.'
    ]
  },

  statement: ['You are given a word made of English letters (upper and lower case). Print how many of its letters are vowels: `a`, `e`, `i`, `o`, `u`, in either case.'],
  inputFormat: ['A single word `s`.'],
  outputFormat: ['The number of vowels.'],
  constraints: ['1 <= length of s <= 1000'],
  examples: [{ input: 'Education\n', note: 'E, u, a, i, o: five vowels.' }, { input: 'rhythm\n', note: 'No vowels: 0.' }],
  hints: [
    'Go through the characters one by one and keep a counter.',
    'Convert each character to lower case first, so that `A` and `a` are treated the same.',
    'Add 1 to the counter when the lower case character is one of `a e i o u`.'
  ],
  program: {
    io: ['s:word'],
    includes: ['<cctype>'],
    python: r`
      count = 0
      for ch in s:
          if ch.lower() in "aeiou":
              count += 1
      print(count)`,
    cpp: r`
      int count = 0;
      for (char ch : s) {
          char c = tolower(ch);
          if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
              count++;
          }
      }
      cout << count << endl;`,
    java: r`
      int count = 0;
      for (int i = 0; i < s.length(); i++) {
          char c = Character.toLowerCase(s.charAt(i));
          if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
              count++;
          }
      }
      System.out.println(count);`
  },
  solution: {
    explanation: ['Every character is converted to lower case and tested against the five vowels; each match increases the counter.'],
    complexity: 'Time O(n), space O(1).'
  },
  solve(input) { return String([...input.trim().toLowerCase()].filter((c) => 'aeiou'.includes(c)).length); },
  tests() {
    const g = rng(51);
    return ['Education\n', 'rhythm\n', 'a\n', 'B\n', 'AEIOU\n', 'aeiou\n', 'bcdfg\n', `${word(g, 1000)}\n`, ...many(5, () => `${word(g, randInt(g, 1, 30))}\n`)];
  }
};
