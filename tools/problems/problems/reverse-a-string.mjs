import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const word = (g, len) => Array.from({ length: len }, () => CHARS[randInt(g, 0, CHARS.length - 1)]).join('');

export default {
  slug: 'reverse-a-string',
  title: 'Reverse a String',
  topic: 'basics',
  difficulty: 'easy',
  order: 50,
  tags: ['strings', 'loops'],

  concept: {
    title: 'A string is a row of characters',
    body: [
      'A string behaves like an array of characters: it has a length, and you can read the character at position `i` (counting from 0).',
      { code: '# Python\nlen(s)   s[0]   s[i]\nfor ch in s: ...\n\n// C++\ns.length()   s[0]   s[i]\nfor (char ch : s) { ... }\n\n// Java\ns.length()   s.charAt(0)   s.charAt(i)\nfor (int i = 0; i < s.length(); i++) { ... s.charAt(i) ... }' },
      'Strings can be joined with `+`. To reverse a string, build a new one: for every character, put it in **front** of what you have collected so far. The first character ends up at the back, the last one in front.',
      'Python also has the slice `s[::-1]`, a one-line trick. Building the result yourself shows what is happening.'
    ]
  },

  statement: ['You are given a word. Print it reversed.'],
  inputFormat: ['A single word `s`, made of English letters and digits.'],
  outputFormat: ['The word `s` with its characters in reverse order.'],
  constraints: ['1 <= length of s <= 1000'],
  examples: [{ input: 'hello\n', note: 'Reversed: olleh.' }, { input: 'Ab1\n', note: '1bA. Case and digits are kept as they are.' }],
  hints: [
    'Start with an empty result string.',
    'For each character of `s` from left to right, put it **in front** of the result.',
    'Print the result at the end. In C++ and Java `ch + result` joins a character and a string.'
  ],
  program: {
    io: ['s:word'],
    python: r`
      result = ""
      for ch in s:
          result = ch + result
      print(result)`,
    cpp: r`
      string result = "";
      for (char ch : s) {
          result = ch + result;
      }
      cout << result << endl;`,
    java: r`
      String result = "";
      for (int i = 0; i < s.length(); i++) {
          result = s.charAt(i) + result;
      }
      System.out.println(result);`
  },
  solution: {
    explanation: ['Each new character is placed in front of the collected text, so the order of the characters is flipped. For strings of this length that is fast enough.'],
    complexity: 'Time O(n^2) in the worst case because each join copies the text (fine for n up to 1000), space O(n).'
  },
  solve(input) { return [...input.trim()].reverse().join(''); },
  tests() {
    const g = rng(50);
    return ['hello\n', 'Ab1\n', 'a\n', 'ab\n', 'racecar\n', '12345\n', `${word(g, 1000)}\n`, ...many(5, () => `${word(g, randInt(g, 1, 40))}\n`)];
  }
};
