import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const word = (g, len) => Array.from({ length: len }, () => LETTERS[randInt(g, 0, 3)]).join('');
const mirror = (s, odd) => s + [...(odd ? s.slice(0, -1) : s)].reverse().join('');

export default {
  slug: 'palindrome-string',
  title: 'Palindrome String',
  topic: 'basics',
  difficulty: 'medium',
  order: 52,
  tags: ['strings', 'two-indexes', 'palindrome'],

  concept: {
    title: 'Two indexes meeting in the middle',
    body: [
      'A word is a palindrome if the first character equals the last, the second equals the one before the last, and so on. You do not need a reversed copy for that: keep **two indexes**, `i` at the start and `j` at the end, compare the two characters, then move both inward.',
      { code: 'i = 0\nj = len(s) - 1\nwhile i < j:\n    # compare s[i] and s[j]\n    i += 1\n    j -= 1' },
      'The loop stops when the indexes meet or cross: the middle character of an odd-length word needs no partner. If any pair differs, the answer is "no" and you can stop at once.',
      'Using two indexes that walk towards each other is a pattern you will meet again, in problems about sorted arrays and sums of pairs.'
    ]
  },

  statement: ['You are given a word. Print `yes` if it reads the same forwards and backwards, otherwise print `no`. Upper and lower case letters are different.'],
  inputFormat: ['A single word `s` of English letters and digits.'],
  outputFormat: ['Print `yes` or `no`.'],
  constraints: ['1 <= length of s <= 1000'],
  examples: [{ input: 'level\n', note: 'A palindrome.' }, { input: 'Level\n', note: 'L and l are different characters: not a palindrome.' }],
  hints: [
    'Compare the first character with the last one, the second with the second to last, and so on.',
    'Keep two indexes `i` and `j`. Start with `i = 0` and `j = length - 1`, and loop while `i < j`.',
    'When a pair differs, record `no` and leave the loop with `break`. If the loop ends without a difference, the answer is `yes`.'
  ],
  program: {
    io: ['s:word'],
    python: r`
      i = 0
      j = len(s) - 1
      answer = "yes"
      while i < j:
          if s[i] != s[j]:
              answer = "no"
              break
          i += 1
          j -= 1
      print(answer)`,
    cpp: r`
      int i = 0;
      int j = s.length() - 1;
      string answer = "yes";
      while (i < j) {
          if (s[i] != s[j]) {
              answer = "no";
              break;
          }
          i++;
          j--;
      }
      cout << answer << endl;`,
    java: r`
      int i = 0;
      int j = s.length() - 1;
      String answer = "yes";
      while (i < j) {
          if (s.charAt(i) != s.charAt(j)) {
              answer = "no";
              break;
          }
          i++;
          j--;
      }
      System.out.println(answer);`
  },
  solution: {
    explanation: ['The two indexes walk towards the middle. The first mismatching pair proves the word is not a palindrome; if all pairs match, it is one. Only half of the characters are visited.'],
    complexity: 'Time O(n), space O(1).'
  },
  solve(input) { const s = input.trim(); return s === [...s].reverse().join('') ? 'yes' : 'no'; },
  tests() {
    const g = rng(52);
    return ['level\n', 'Level\n', 'a\n', 'ab\n', 'aa\n', 'abcba\n', 'abca\n', 'racecar\n', 'x1y\n', `${mirror(word(g, 500), false)}\n`, `${mirror(word(g, 500), true)}\n`, `${mirror(word(g, 499), false)}z\n`, ...many(3, () => `${word(g, randInt(g, 1, 6))}\n`)];
  }
};
