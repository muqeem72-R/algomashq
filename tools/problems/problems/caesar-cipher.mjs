import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;
const word = (g, len) => Array.from({ length: len }, () => 'abcdefghijklmnopqrstuvwxyz'[randInt(g, 0, 25)]).join('');

export default {
  slug: 'caesar-cipher',
  title: 'Caesar Cipher',
  topic: 'basics',
  difficulty: 'medium',
  order: 61,
  tags: ['strings', 'modulo', 'ascii'],

  concept: {
    title: 'Wrapping around with the remainder',
    body: [
      'The Caesar cipher replaces every letter by the letter `k` places further in the alphabet; after `z` it starts again at `a`. With `k = 3`, `a` becomes `d` and `y` becomes `b`.',
      'The "start again" is a job for the remainder operator. Number the letters 0 to 25. The new number is `(old + k) % 26`. For `y` (24) and `k = 3`: `(24 + 3) % 26 = 1`, which is `b`.',
      { code: 'position = ord(ch) - ord("a")            # 0..25\nnew_position = (position + k) % 26\nnew_char = chr(ord("a") + new_position)' },
      'The shift `k` can be huge. Reduce it first (`k % 26`): shifting by 26 brings every letter back to itself. This also stops the addition from overflowing.'
    ]
  },

  statement: ['You are given a shift `k` and a word of lower case English letters. Shift every letter `k` places forward in the alphabet, wrapping from `z` back to `a`. Print the new word.'],
  inputFormat: ['The first line has the integer `k`. The second line has the word `s`.'],
  outputFormat: ['The shifted word.'],
  constraints: ['0 <= k <= 10^9', '1 <= length of s <= 1000'],
  examples: [{ input: '3\nabcxyz\n', note: 'abc becomes def; xyz wraps around to abc: defabc.' }, { input: '26\nhello\n', note: 'A shift of 26 changes nothing.' }],
  hints: [
    'Turn a letter into a number 0..25 by subtracting the code of `a`.',
    'Add the shift and take the remainder by 26, so that the alphabet wraps around.',
    'Turn the number back into a letter by adding the code of `a`.'
  ],
  program: {
    io: ['k:int', 's:word'],
    python: r`
      shift = k % 26
      result = ""
      for ch in s:
          position = (ord(ch) - ord("a") + shift) % 26
          result += chr(ord("a") + position)
      print(result)`,
    cpp: r`
      int shift = k % 26;
      string result = "";
      for (char ch : s) {
          int position = (ch - 'a' + shift) % 26;
          result += (char) ('a' + position);
      }
      cout << result << endl;`,
    java: r`
      int shift = (int) (k % 26);
      String result = "";
      for (int i = 0; i < s.length(); i++) {
          int position = (s.charAt(i) - 'a' + shift) % 26;
          result += (char) ('a' + position);
      }
      System.out.println(result);`
  },
  solution: {
    explanation: ['The shift is reduced modulo 26 first. Each letter is converted to its position, moved, wrapped with `% 26` and converted back to a letter.'],
    complexity: 'Time O(n), space O(n).'
  },
  solve(input) {
    const [k, s] = input.trim().split(/\s+/);
    const shift = Number(k) % 26;
    return [...s].map((c) => String.fromCharCode(97 + ((c.charCodeAt(0) - 97 + shift) % 26))).join('');
  },
  tests() {
    const g = rng(61);
    return ['3\nabcxyz\n', '26\nhello\n', '0\nabc\n', '1\nz\n', '25\na\n', '27\nabc\n', '1000000000\nhello\n', `${randInt(g, 0, 1e9)}\n${word(g, 1000)}\n`, ...many(5, () => `${randInt(g, 0, 1e9)}\n${word(g, randInt(g, 1, 30))}\n`)];
  }
};
