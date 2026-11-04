import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const word = (g, len) => Array.from({ length: len }, () => CHARS[randInt(g, 0, CHARS.length - 1)]).join('');

export default {
  slug: 'toggle-case',
  title: 'Toggle the Case',
  topic: 'basics',
  difficulty: 'medium',
  order: 53,
  tags: ['strings', 'ascii', 'characters'],

  concept: {
    title: 'Calculating with characters',
    body: [
      'Every character has a number, its ASCII code, and the codes of the letters are in alphabetical order. The capital letters start at 65 (`A`) and the small ones at 97 (`a`), so the small version of a letter is always **32** higher than the capital version.',
      'That means you can change the case with arithmetic: `ch - \'a\' + \'A\'` turns a small letter into the matching capital in C++ and Java (the characters behave like numbers, and a cast `(char)` turns the number back into a character). In Python use `ord(ch)` to get the code and `chr(code)` to get the character back.',
      { code: '# Python\nchr(ord(ch) - 32)        # small -> capital\nchr(ord(ch) + 32)        # capital -> small\n\n// C++ and Java\n(char) (ch - \'a\' + \'A\')    // small -> capital' },
      'Always check what kind of character you have first: digits must not be changed.'
    ]
  },

  statement: ['You are given a word made of English letters and digits. Change every capital letter to the small one and every small letter to the capital one. Digits stay as they are. Print the result.'],
  inputFormat: ['A single word `s`.'],
  outputFormat: ['The word with the case of each letter flipped.'],
  constraints: ['1 <= length of s <= 1000'],
  examples: [{ input: 'HelloWorld7\n', note: 'hELLOwORLD7.' }, { input: 'abc\n', note: 'ABC.' }],
  hints: [
    'Handle each character by its kind: capital letter, small letter or something else.',
    'The difference between a small letter and its capital is 32 in the ASCII table, i.e. `\'a\' - \'A\'`.',
    'Build the result character by character and print it at the end.'
  ],
  program: {
    io: ['s:word'],
    python: r`
      result = ""
      for ch in s:
          if "a" <= ch <= "z":
              result += chr(ord(ch) - 32)
          elif "A" <= ch <= "Z":
              result += chr(ord(ch) + 32)
          else:
              result += ch
      print(result)`,
    cpp: r`
      string result = "";
      for (char ch : s) {
          if (ch >= 'a' && ch <= 'z') {
              result += (char) (ch - 'a' + 'A');
          } else if (ch >= 'A' && ch <= 'Z') {
              result += (char) (ch - 'A' + 'a');
          } else {
              result += ch;
          }
      }
      cout << result << endl;`,
    java: r`
      String result = "";
      for (int i = 0; i < s.length(); i++) {
          char ch = s.charAt(i);
          if (ch >= 'a' && ch <= 'z') {
              result += (char) (ch - 'a' + 'A');
          } else if (ch >= 'A' && ch <= 'Z') {
              result += (char) (ch - 'A' + 'a');
          } else {
              result += ch;
          }
      }
      System.out.println(result);`
  },
  solution: {
    explanation: ['Small letters are shifted into the capital range and capital letters into the small range; every other character is copied unchanged. The result string is built one character at a time.'],
    complexity: 'Time O(n), space O(n).'
  },
  solve(input) { return [...input.trim()].map((c) => (c >= 'a' && c <= 'z' ? c.toUpperCase() : c >= 'A' && c <= 'Z' ? c.toLowerCase() : c)).join(''); },
  tests() {
    const g = rng(53);
    return ['HelloWorld7\n', 'abc\n', 'XYZ\n', '12345\n', 'a\n', 'Z\n', 'aZ09\n', `${word(g, 1000)}\n`, ...many(5, () => `${word(g, randInt(g, 1, 30))}\n`)];
  }
};
