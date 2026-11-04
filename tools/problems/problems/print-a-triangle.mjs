const r = String.raw;

export default {
  slug: 'print-a-triangle',
  title: 'A Triangle of Stars',
  topic: 'basics',
  difficulty: 'easy',
  order: 4,
  noInput: true,
  tags: ['output', 'patterns'],

  concept: {
    title: 'Text is exact',
    body: [
      'A string can contain any characters, not only letters: stars, digits, punctuation. A pattern is just several lines of text, one print command per line.',
      'The judge reads your output word by word, where a word is a run of characters without spaces. So `***` is one word, but `* * *` is three words and would be wrong. Print each row without spaces inside it.',
      'Later you will learn loops, which let you print a pattern of any size with a few lines of code. For now, write each line out.'
    ]
  },

  statement: ['Print this triangle of stars:', { code: '*\n**\n***\n****' }],
  inputFormat: ['There is no input.'],
  outputFormat: ['Print four lines with 1, 2, 3 and 4 stars.'],
  constraints: ['There is nothing to read, so there are no limits.'],
  examples: [{ input: '\n', note: 'The expected output is the triangle from the statement.' }],
  hints: [
    'The triangle has four rows, so you need four print commands.',
    'Each row is a string made only of `*` characters, with no spaces.',
    'The first row has one star, the second two, and so on.'
  ],
  program: {
    io: [],
    python: r`
      print("*")
      print("**")
      print("***")
      print("****")`,
    cpp: r`
      cout << "*" << endl;
      cout << "**" << endl;
      cout << "***" << endl;
      cout << "****" << endl;`,
    java: r`
      System.out.println("*");
      System.out.println("**");
      System.out.println("***");
      System.out.println("****");`
  },
  solution: {
    explanation: ['Four print commands, each printing a row of stars that is one longer than the row above. The loop problems later in this list print the same shape for any size.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve() { return '*\n**\n***\n****'; },
  tests() { return ['\n']; }
};
