import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;
const NAMES = ['Asha', 'Bilal', 'Chen', 'Dina', 'Eli', 'Farah', 'Gustav', 'Hana', 'Ivan', 'Jun', 'Kavya', 'Liam', 'Mukeem', 'Nora'];

export default {
  slug: 'greet-a-person',
  title: 'Greet a Person',
  topic: 'basics',
  difficulty: 'easy',
  order: 6,
  tags: ['input', 'strings'],

  concept: {
    title: 'Text in variables',
    body: [
      'A variable can hold text as well as numbers. Reading one word (text without spaces) gives you a string. You can join strings together; this is called *concatenation*.',
      { code: '# Python\nname = input()\nprint("Hi, " + name + "!")\n\n// C++\nstring name;\ncin >> name;\ncout << "Hi, " << name << "!" << endl;\n\n// Java\nString name = sc.next();\nSystem.out.println("Hi, " + name + "!");' },
      'In C++ you print several pieces by chaining `<<`. In Python and Java the `+` joins the pieces into one string. Spaces and punctuation are ordinary characters, so put them inside the quotes.'
    ]
  },

  statement: ['You are given a name. Print `Hello, ` followed by the name and an exclamation mark.'],
  inputFormat: ['A single word: the name.'],
  outputFormat: ['Print `Hello, <name>!` on one line.'],
  constraints: ['The name has 1 to 20 English letters.'],
  examples: [{ input: 'Asha\n', note: 'The greeting is Hello, Asha!' }, { input: 'Bob\n', note: 'Hello, Bob!' }],
  hints: [
    'The starter code reads the name into the variable `name`.',
    'You need to print three pieces: the text `Hello, `, then the variable, then `!`.',
    'Do not put quotes around the variable `name`, only around the fixed text.'
  ],
  program: {
    io: ['name:word'],
    python: 'print("Hello, " + name + "!")',
    cpp: r`cout << "Hello, " << name << "!" << endl;`,
    java: 'System.out.println("Hello, " + name + "!");'
  },
  solution: {
    explanation: ['Join the fixed text, the variable and the exclamation mark. The comma and the space after `Hello` belong to the fixed text.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { return `Hello, ${input.trim()}!`; },
  tests() {
    const g = rng(6);
    return [...NAMES.slice(0, 8).map((n) => `${n}\n`), 'A\n', 'Abcdefghijklmnopqrst\n', ...many(3, () => `${NAMES[randInt(g, 0, NAMES.length - 1)]}\n`)];
  }
};
