import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;
const word = (g, len, alphabet) => Array.from({ length: len }, () => alphabet[randInt(g, 0, alphabet.length - 1)]).join('');

export default {
  slug: 'letter-frequency',
  title: 'Most Frequent Letter',
  topic: 'basics',
  difficulty: 'medium',
  order: 60,
  tags: ['strings', 'counting', 'frequency-array'],

  concept: {
    title: 'A counter for every letter',
    body: [
      'To count how often each letter appears you need 26 counters, one per letter. Instead of 26 variables, use an **array of 26 integers** where position 0 counts `a`, position 1 counts `b`, and so on. The position of a letter is its distance from `a`: `ch - \'a\'` in C++ and Java, `ord(ch) - ord("a")` in Python.',
      { code: 'counts = [0] * 26\nfor ch in s:\n    counts[ord(ch) - ord("a")] += 1' },
      'Using a value (here a letter) as an index into an array of counters is a very fast and common technique, a *frequency array*. It is the simple cousin of the hash map that you will meet in the Hashing topic.',
      'To find the winner, scan the 26 counters and remember the position of the largest. If you only replace the best when a counter is **strictly larger**, ties keep the earlier (alphabetically smaller) letter.'
    ]
  },

  statement: ['You are given a word of lower case English letters. Print the letter that occurs most often, and how many times it occurs, separated by a space. If several letters tie, print the one that comes first in the alphabet.'],
  inputFormat: ['A single word `s`.'],
  outputFormat: ['`letter count`'],
  constraints: ['1 <= length of s <= 1000'],
  examples: [{ input: 'banana\n', note: 'a appears 3 times, n twice, b once.' }, { input: 'abcab\n', note: 'a and b both appear twice: the answer is the alphabetically first one, a.' }],
  hints: [
    'Make an array of 26 counters and add 1 to the counter of each letter.',
    'The index of a letter is its distance from `a`.',
    'Scan the counters from `a` to `z` and replace the best only when a counter is strictly larger than the current best.'
  ],
  program: {
    io: ['s:word'],
    python: r`
      counts = [0] * 26
      for ch in s:
          counts[ord(ch) - ord("a")] += 1
      best = 0
      for i in range(26):
          if counts[i] > counts[best]:
              best = i
      print(chr(ord("a") + best), counts[best])`,
    cpp: r`
      vector<int> counts(26, 0);
      for (char ch : s) {
          counts[ch - 'a']++;
      }
      int best = 0;
      for (int i = 0; i < 26; i++) {
          if (counts[i] > counts[best]) {
              best = i;
          }
      }
      cout << (char) ('a' + best) << " " << counts[best] << endl;`,
    java: r`
      int[] counts = new int[26];
      for (int i = 0; i < s.length(); i++) {
          counts[s.charAt(i) - 'a']++;
      }
      int best = 0;
      for (int i = 0; i < 26; i++) {
          if (counts[i] > counts[best]) {
              best = i;
          }
      }
      System.out.println((char) ('a' + best) + " " + counts[best]);`
  },
  solution: {
    explanation: ['The first loop fills the 26 counters. The second loop finds the largest counter; because a later counter has to be strictly larger to replace the best, the alphabetically first letter wins a tie.'],
    complexity: 'Time O(n + 26), space O(26).'
  },
  solve(input) {
    const s = input.trim();
    const c = new Array(26).fill(0);
    for (const ch of s) c[ch.charCodeAt(0) - 97]++;
    let best = 0;
    for (let i = 0; i < 26; i++) if (c[i] > c[best]) best = i;
    return `${String.fromCharCode(97 + best)} ${c[best]}`;
  },
  tests() {
    const g = rng(60);
    const az = 'abcdefghijklmnopqrstuvwxyz';
    return ['banana\n', 'abcab\n', 'z\n', 'zzzy\n', 'abcdefghijklmnopqrstuvwxyz\n', 'yyzz\n', `${word(g, 1000, az)}\n`, `${word(g, 1000, 'xyz')}\n`, ...many(5, () => `${word(g, randInt(g, 1, 40), az.slice(0, randInt(g, 2, 26)))}\n`)];
  }
};
