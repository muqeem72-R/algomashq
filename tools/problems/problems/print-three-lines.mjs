const r = String.raw;

export default {
  slug: 'print-three-lines',
  title: 'Print Three Lines',
  topic: 'basics',
  difficulty: 'easy',
  order: 2,
  noInput: true,
  tags: ['output', 'syntax'],

  concept: {
    title: 'One print, one line',
    body: [
      'Each print command writes its text and then moves to the next line. To print three lines you simply use three print commands, one after the other. A program runs its commands from top to bottom, in the order you wrote them.',
      { code: '# Python\nprint("first")\nprint("second")\n\n// C++\ncout << "first" << endl;\ncout << "second" << endl;\n\n// Java\nSystem.out.println("first");\nSystem.out.println("second");' },
      'Note the semicolon `;` at the end of every command in C++ and Java. Python does not use it. Forgetting it is the most common first error, and the compiler will tell you the line number.'
    ]
  },

  statement: ['Print these three lines, in this order:', { code: 'Think first.\nCode second.\nLearn always.' }],
  inputFormat: ['There is no input.'],
  outputFormat: ['Print the three lines above, each on its own line.'],
  constraints: ['There is nothing to read, so there are no limits.'],
  examples: [{ input: '\n', note: 'There is no input. The expected output is the three lines of the statement.' }],
  hints: [
    'One print command prints one line.',
    'Write three print commands, one for each sentence.',
    'Do not forget the full stop at the end of each sentence, and the capital letter at the start.'
  ],
  program: {
    io: [],
    python: r`
      print("Think first.")
      print("Code second.")
      print("Learn always.")`,
    cpp: r`
      cout << "Think first." << endl;
      cout << "Code second." << endl;
      cout << "Learn always." << endl;`,
    java: r`
      System.out.println("Think first.");
      System.out.println("Code second.");
      System.out.println("Learn always.");`
  },
  solution: {
    explanation: ['Three print commands in a row. They run from top to bottom, so the lines appear in the same order.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve() { return 'Think first.\nCode second.\nLearn always.'; },
  tests() { return ['\n']; }
};
