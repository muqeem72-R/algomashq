import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default {
  slug: 'name-of-the-day',
  title: 'Name of the Day',
  topic: 'basics',
  difficulty: 'easy',
  order: 27,
  tags: ['conditions', 'switch'],

  concept: {
    title: 'Many exact values: switch',
    body: [
      'When one value can take many exact values, a long `if / else if` chain works but gets noisy. C++ and Java offer the **switch** statement for this: it jumps straight to the matching `case`.',
      { code: 'switch (n) {\n    case 1: cout << "one"; break;\n    case 2: cout << "two"; break;\n    default: cout << "many";\n}' },
      'The `break` ends the case. Without it the program keeps running into the next case, a classic bug called *fall-through*. `default` runs when no case matches. Python has no classic switch (newer versions have `match`), so Python programs use `if / elif` chains for this job.'
    ]
  },

  statement: ['The days of the week are numbered 1 (Monday) to 7 (Sunday). Given a number, print the name of the day.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The name of the day: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday or Sunday.'],
  constraints: ['1 <= n <= 7'],
  examples: [{ input: '1\n', note: 'Day 1 is Monday.' }, { input: '6\n', note: 'Day 6 is Saturday.' }],
  hints: [
    'There are seven exact values, so seven cases.',
    'Use `switch` in C++ and Java, or an `if / elif` chain in Python.',
    'Spell the names with a capital first letter, exactly as in the statement. Do not forget `break` in each case of a switch.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      if n == 1:
          print("Monday")
      elif n == 2:
          print("Tuesday")
      elif n == 3:
          print("Wednesday")
      elif n == 4:
          print("Thursday")
      elif n == 5:
          print("Friday")
      elif n == 6:
          print("Saturday")
      else:
          print("Sunday")`,
    cpp: r`
      switch (n) {
          case 1: cout << "Monday" << endl; break;
          case 2: cout << "Tuesday" << endl; break;
          case 3: cout << "Wednesday" << endl; break;
          case 4: cout << "Thursday" << endl; break;
          case 5: cout << "Friday" << endl; break;
          case 6: cout << "Saturday" << endl; break;
          default: cout << "Sunday" << endl;
      }`,
    java: r`
      switch ((int) n) {
          case 1: System.out.println("Monday"); break;
          case 2: System.out.println("Tuesday"); break;
          case 3: System.out.println("Wednesday"); break;
          case 4: System.out.println("Thursday"); break;
          case 5: System.out.println("Friday"); break;
          case 6: System.out.println("Saturday"); break;
          default: System.out.println("Sunday");
      }`
  },
  solution: {
    explanation: ['Each number is matched to its name. C++ and Java use a `switch` with a `break` after every case (a `switch` in Java needs an `int`, hence the cast), Python uses an `if / elif` chain.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { return DAYS[Number(input.trim()) - 1]; },
  tests() {
    const g = rng(27);
    return [1, 2, 3, 4, 5, 6, 7, ...many(3, () => randInt(g, 1, 7))].map((n) => `${n}\n`);
  }
};
