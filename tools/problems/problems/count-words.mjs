import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

// A line of 1..maxWords words, separated by 1..3 spaces, with no space at the start or the end.
function sentence(g, maxWords) {
  const count = randInt(g, 1, maxWords);
  let s = '';
  for (let i = 0; i < count; i++) {
    if (i) s += ' '.repeat(randInt(g, 1, 3));
    s += Array.from({ length: randInt(g, 1, 8) }, () => LETTERS[randInt(g, 0, 25)]).join('');
  }
  return s;
}

export default {
  slug: 'count-words',
  title: 'Count the Words',
  topic: 'basics',
  difficulty: 'medium',
  order: 59,
  tags: ['strings', 'lines', 'counting'],

  concept: {
    title: 'Reading a whole line and spotting where words begin',
    body: [
      'Until now a string was one word. A line of text can contain spaces, so it is read as a **whole line**: `input()` in Python, `getline(cin, s)` in C++ and `sc.nextLine()` in Java. The starter code does this for you.',
      'How do you count words when there can be more than one space between them? Counting the spaces gives the wrong answer. Count the **beginnings** of words instead: a character starts a word if it is not a space and it is either the first character or the one before it is a space.',
      { code: 'for i in range(len(s)):\n    if s[i] != " " and (i == 0 or s[i - 1] == " "):\n        count += 1' },
      'Think "what is special about the first letter of a word?" rather than "where are the separators?". It is a way to look at a problem that you will use often, for example when you cut a sequence into groups.'
    ]
  },

  statement: ['You are given a line of text made of lower case English letters and spaces. Words are separated by one or more spaces. The line does not start or end with a space. Print the number of words.'],
  inputFormat: ['One line of text.'],
  outputFormat: ['The number of words.'],
  constraints: ['The line has between 1 and 1000 characters and contains at least one word.'],
  examples: [{ input: 'learn data structures\n', note: 'Three words.' }, { input: 'a  b   c\n', note: 'Extra spaces between words do not create extra words: three words.' }],
  hints: [
    'Counting spaces fails when several spaces are in a row.',
    'Count the first letters of words: a non-space character whose left neighbour is a space (or that is at position 0).',
    'Loop over the positions of the line and add 1 to a counter for each such character.'
  ],
  program: {
    io: ['s:line'],
    python: r`
      count = 0
      for i in range(len(s)):
          if s[i] != " " and (i == 0 or s[i - 1] == " "):
              count += 1
      print(count)`,
    cpp: r`
      int count = 0;
      for (int i = 0; i < (int) s.length(); i++) {
          if (s[i] != ' ' && (i == 0 || s[i - 1] == ' ')) {
              count++;
          }
      }
      cout << count << endl;`,
    java: r`
      int count = 0;
      for (int i = 0; i < s.length(); i++) {
          if (s.charAt(i) != ' ' && (i == 0 || s.charAt(i - 1) == ' ')) {
              count++;
          }
      }
      System.out.println(count);`
  },
  solution: {
    explanation: ['A word begins at every non-space character that is at the start of the line or follows a space. Counting these beginnings counts the words, however many spaces separate them.'],
    complexity: 'Time O(n), space O(1).'
  },
  solve(input) { return String(input.replace(/\n+$/, '').split(' ').filter(Boolean).length); },
  tests() {
    const g = rng(59);
    return ['learn data structures\n', 'a  b   c\n', 'word\n', 'a b\n', 'a   b\n', `${sentence(g, 150)}\n`, ...many(6, () => `${sentence(g, 12)}\n`)];
  }
};
