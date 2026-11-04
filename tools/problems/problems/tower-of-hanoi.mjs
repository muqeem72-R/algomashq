const r = String.raw;

function moves(n) {
  const out = [];
  (function go(k, from, to, via) {
    if (k === 0) return;
    go(k - 1, from, via, to);
    out.push(`${from} ${to}`);
    go(k - 1, via, to, from);
  })(n, 1, 3, 2);
  return [String(out.length), ...out].join('\n');
}

export default {
  slug: 'tower-of-hanoi',
  title: 'Tower of Hanoi',
  topic: 'basics',
  difficulty: 'hard',
  order: 86,
  tags: ['recursion', 'divide-and-conquer'],

  concept: {
    title: 'Trust the smaller problem',
    body: [
      'There are three rods and `n` disks of different sizes stacked on rod 1, the biggest at the bottom. You may move one disk at a time from the top of one rod to another, and you may never put a bigger disk on a smaller one. The goal is to move the whole stack to rod 3.',
      'Thinking about the individual moves is hopeless. Think recursively instead: **assume you already know how to move a stack of `n - 1` disks**. Then moving `n` disks is easy:',
      { list: ['move the top `n - 1` disks from rod 1 to the spare rod 2 (the recursive call),', 'move the biggest disk from rod 1 to rod 3 (one move),', 'move the `n - 1` disks from rod 2 on top of it, to rod 3 (the recursive call again).'] },
      'The base case is a stack of 0 disks: nothing to do. The function needs the roles of the rods as parameters: `hanoi(k, source, target, spare)`. In the second recursive call the roles change, because the old spare rod is now the source.',
      'The number of moves `M(n)` satisfies `M(n) = 2 * M(n-1) + 1`, which gives `2^n - 1`. Each extra disk doubles the work. That is why the legend says the world ends when monks finish moving 64 disks: 2^64 moves is far beyond what any computer can do.'
    ]
  },

  statement: [
    'Given `n`, print the minimal sequence of moves that transfers `n` disks from rod 1 to rod 3, using rod 2 as spare.',
    'First print the number of moves. Then print the moves, one per line, as two numbers `from to`. Use the standard recursive solution: first move `n - 1` disks from the source to the spare rod, then the biggest disk, then the `n - 1` disks from the spare rod to the target.'
  ],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['The number of moves `2^n - 1` on the first line, then that many lines `from to`.'],
  constraints: ['1 <= n <= 10'],
  examples: [{ input: '2\n', note: 'Three moves: disk to rod 2, disk to rod 3, then the small disk onto it.' }, { input: '1\n', note: 'One move from rod 1 to rod 3.' }],
  hints: [
    'Write a function `hanoi(k, source, target, spare)` that prints the moves for `k` disks. For `k = 0` it does nothing.',
    'It calls itself for `k - 1` disks (source to spare), prints the move `source target`, and calls itself again for `k - 1` disks (spare to target).',
    'Before the first call print the number of moves, `2^n - 1`.'
  ],
  program: {
    io: ['n:int'],
    helpers: {
      python: r`
        def hanoi(k, source, target, spare):
            if k == 0:
                return
            hanoi(k - 1, source, spare, target)
            print(source, target)
            hanoi(k - 1, spare, target, source)`,
      cpp: r`
        void hanoi(int k, int source, int target, int spare) {
            if (k == 0) {
                return;
            }
            hanoi(k - 1, source, spare, target);
            cout << source << " " << target << "\n";
            hanoi(k - 1, spare, target, source);
        }`,
      java: r`
        static void hanoi(int k, int source, int target, int spare) {
            if (k == 0) {
                return;
            }
            hanoi(k - 1, source, spare, target);
            System.out.println(source + " " + target);
            hanoi(k - 1, spare, target, source);
        }`
    },
    starterHelpers: {
      python: r`
        def hanoi(k, source, target, spare):
            # Print the moves for k disks
            pass`,
      cpp: r`
        void hanoi(int k, int source, int target, int spare) {
            // Print the moves for k disks
        }`,
      java: r`
        static void hanoi(int k, int source, int target, int spare) {
            // Print the moves for k disks
        }`
    },
    starterBody: {
      python: 'print(2 ** n - 1)\nhanoi(n, 1, 3, 2)',
      cpp: r`
        cout << (1LL << n) - 1 << "\n";
        hanoi(n, 1, 3, 2);`,
      java: r`
        System.out.println((1L << n) - 1);
        hanoi((int) n, 1, 3, 2);`
    },
    python: 'print(2 ** n - 1)\nhanoi(n, 1, 3, 2)',
    cpp: r`
      cout << (1LL << n) - 1 << "\n";
      hanoi(n, 1, 3, 2);`,
    java: r`
      System.out.println((1L << n) - 1);
      hanoi((int) n, 1, 3, 2);`
  },
  solution: {
    explanation: ['`hanoi(k, source, target, spare)` moves the top `k - 1` disks out of the way, moves the biggest disk, and moves the `k - 1` disks back on top of it. The roles of the rods swap between the two recursive calls. The total number of moves is `2^n - 1`, printed first.'],
    complexity: 'Time O(2^n), space O(n) for the call stack.'
  },
  solve(input) { return moves(Number(input.trim())); },
  tests() {
    return [2, 1, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `${n}\n`);
  }
};
