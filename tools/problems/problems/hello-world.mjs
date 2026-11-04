const r = String.raw;

export default {
  slug: 'hello-world',
  title: 'Hello, World',
  topic: 'basics',
  difficulty: 'easy',
  order: 1,
  noInput: true,
  tags: ['output', 'syntax'],

  concept: {
    title: 'Printing to the screen',
    body: [
      'Every program in this course talks to the judge through two channels: it **reads** the input from the standard input, and it **prints** its answer to the standard output. The judge compares what you print with the expected output, so printing is the first skill to learn.',
      'Text goes between double quotes (this is called a *string*) and is handed to the print command of your language:',
      { code: '# Python\nprint("some text")\n\n// C++ (add #include <iostream> at the top)\ncout << "some text" << endl;\n\n// Java (inside main, inside a class)\nSystem.out.println("some text");' },
      'Python and Java start a new line after every print. In C++ you ask for the new line yourself with `endl`. The judge compares the words you print one by one, so capital letters, commas and the exclamation mark must be exactly right.'
    ]
  },

  statement: ['Write a program that prints the line `hello world!` (all letters in lower case, with an exclamation mark at the end).'],
  inputFormat: ['There is no input.'],
  outputFormat: ['Print `hello world!` on one line.'],
  constraints: ['There is nothing to read, so there are no limits.'],
  examples: [{ input: '\n', note: 'There is no input. The program only prints one line.' }],
  hints: [
    'Look at the three small examples in the Concept tab. Which one is for your language?',
    'The text to print is `hello world!` between double quotes.',
    'Check every character of your output: lower case letters, one space, and the exclamation mark.'
  ],
  program: {
    io: [],
    python: r`print("hello world!")`,
    cpp: r`cout << "hello world!" << endl;`,
    java: r`System.out.println("hello world!");`
  },
  solution: {
    explanation: ['One print statement with the text in double quotes is the whole program. In C++ `endl` ends the line, in Python and Java the print command does it for you.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve() { return 'hello world!'; },
  tests() { return ['\n']; }
};
