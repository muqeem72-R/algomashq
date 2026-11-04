import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

const answer = (n) => (n % 15 === 0 ? 'FizzBuzz' : n % 3 === 0 ? 'Fizz' : n % 5 === 0 ? 'Buzz' : String(n));

export default {
  slug: 'fizz-buzz-number',
  title: 'Fizz Buzz',
  topic: 'basics',
  difficulty: 'easy',
  order: 29,
  tags: ['conditions', 'remainder'],

  concept: {
    title: 'The order of the checks matters',
    body: [
      'A number divisible by both 3 and 5 satisfies *both* the "divisible by 3" test and the "divisible by 5" test. In an `if / else if` chain only the first true branch runs, so if you test "divisible by 3" first, 15 prints `Fizz` and never reaches the case that should print `FizzBuzz`.',
      'The rule: put the most specific condition first. Here that is "divisible by 3 **and** 5" (or, equivalently, divisible by 15).',
      'Whether `n` is divisible by `k` is the test `n % k == 0`.'
    ]
  },

  statement: [
    'Given a positive integer `n`, print:',
    { list: ['`FizzBuzz` if `n` is divisible by both 3 and 5', '`Fizz` if `n` is divisible by 3 only', '`Buzz` if `n` is divisible by 5 only', 'the number `n` itself otherwise'] }
  ],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['Print `FizzBuzz`, `Fizz`, `Buzz` or the number.'],
  constraints: ['1 <= n <= 10^9'],
  examples: [{ input: '9\n', note: '9 is divisible by 3 only.' }, { input: '30\n', note: '30 is divisible by 3 and by 5.' }, { input: '7\n', note: 'Not divisible by 3 or 5: print 7.' }],
  hints: [
    'Which numbers are divisible by both 3 and 5? Which test describes them?',
    'Check the "both" case first, then 3, then 5.',
    'The last `else` prints the number itself.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      if n % 15 == 0:
          print("FizzBuzz")
      elif n % 3 == 0:
          print("Fizz")
      elif n % 5 == 0:
          print("Buzz")
      else:
          print(n)`,
    cpp: r`
      if (n % 15 == 0) {
          cout << "FizzBuzz" << endl;
      } else if (n % 3 == 0) {
          cout << "Fizz" << endl;
      } else if (n % 5 == 0) {
          cout << "Buzz" << endl;
      } else {
          cout << n << endl;
      }`,
    java: r`
      if (n % 15 == 0) {
          System.out.println("FizzBuzz");
      } else if (n % 3 == 0) {
          System.out.println("Fizz");
      } else if (n % 5 == 0) {
          System.out.println("Buzz");
      } else {
          System.out.println(n);
      }`
  },
  solution: {
    explanation: ['Divisible by both 3 and 5 means divisible by 15, and that test must come first. After it, the remaining branches handle 3 and 5 on their own.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) { return answer(Number(input.trim())); },
  tests() {
    const g = rng(29);
    return ['9\n', '30\n', '7\n', '1\n', '3\n', '5\n', '15\n', '45\n', '1000000000\n', '999999999\n', ...many(5, () => `${randInt(g, 1, 1e9)}\n`)];
  }
};
