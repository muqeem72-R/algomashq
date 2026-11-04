const r = String.raw;

function all(n) {
  const out = [];
  for (let m = 0; m < 1 << n; m++) out.push(m.toString(2).padStart(n, '0'));
  return out.join('\n');
}

export default {
  slug: 'binary-strings',
  title: 'All Binary Strings',
  topic: 'basics',
  difficulty: 'hard',
  order: 88,
  tags: ['recursion', 'generation', 'choices'],

  concept: {
    title: 'Recursion that builds something step by step',
    body: [
      'So far a recursive function returned a number. It can also **build** something and print it when it is complete. The usual pattern: the function receives what has been built so far (`prefix`) and how many positions are still free (`remaining`). At every position there is a choice, here `0` or `1`, and each choice is a recursive call.',
      { code: 'def generate(prefix, remaining):\n    if remaining == 0:           # nothing left to choose: the string is complete\n        print(prefix)\n        return\n    generate(prefix + "0", remaining - 1)\n    generate(prefix + "1", remaining - 1)' },
      'Follow the calls for 2 positions: `generate("", 2)` calls `generate("0", 1)`, which calls `generate("00", 0)` (prints `00`) and `generate("01", 0)` (prints `01`); then `generate("1", 1)` prints `10` and `11`. Trying 0 before 1 at every position produces the strings in increasing order.',
      'The calls form a tree with two branches at every level. The number of results doubles with each position: 2^n strings. This "make a choice, recurse, repeat" shape is the heart of **backtracking**, the topic that comes later with subsets, permutations and the N-Queens puzzle.'
    ]
  },

  statement: ['Given `n`, print all binary strings of length `n` (made of the characters 0 and 1) in increasing order, one per line. Use recursion.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['`2^n` lines: all binary strings of length `n`, in increasing order.'],
  constraints: ['1 <= n <= 10'],
  examples: [{ input: '2\n', note: 'Prints 00, 01, 10 and 11.' }, { input: '1\n', note: 'Prints 0 and 1.' }],
  hints: [
    'Write a function that takes the string built so far and the number of positions still to fill.',
    'When no positions are left, print the string. Otherwise call yourself twice: once with a `0` added, once with a `1` added.',
    'Call the `0` branch first, so that the output is in increasing order.'
  ],
  program: {
    io: ['n:int'],
    helpers: {
      python: r`
        def generate(prefix, remaining):
            if remaining == 0:
                print(prefix)
                return
            generate(prefix + "0", remaining - 1)
            generate(prefix + "1", remaining - 1)`,
      cpp: r`
        void generate(string prefix, int remaining) {
            if (remaining == 0) {
                cout << prefix << "\n";
                return;
            }
            generate(prefix + "0", remaining - 1);
            generate(prefix + "1", remaining - 1);
        }`,
      java: r`
        static void generate(String prefix, int remaining) {
            if (remaining == 0) {
                System.out.println(prefix);
                return;
            }
            generate(prefix + "0", remaining - 1);
            generate(prefix + "1", remaining - 1);
        }`
    },
    starterHelpers: {
      python: r`
        def generate(prefix, remaining):
            # Your code here
            pass`,
      cpp: r`
        void generate(string prefix, int remaining) {
            // Your code here
        }`,
      java: r`
        static void generate(String prefix, int remaining) {
            // Your code here
        }`
    },
    starterBody: {
      python: 'generate("", n)',
      cpp: r`generate("", n);`,
      java: 'generate("", (int) n);'
    },
    python: 'generate("", n)',
    cpp: r`generate("", n);`,
    java: 'generate("", (int) n);'
  },
  solution: {
    explanation: ['`generate(prefix, remaining)` prints the string when it is complete, and otherwise extends it with `0` and then with `1`. The recursion tree has `2^n` leaves, one per string, visited from left to right, which is increasing order. The depth is only `n`.'],
    complexity: 'Time O(n * 2^n), space O(n) for the call stack (plus the strings).'
  },
  solve(input) { return all(Number(input.trim())); },
  tests() {
    return [2, 1, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `${n}\n`);
  }
};
