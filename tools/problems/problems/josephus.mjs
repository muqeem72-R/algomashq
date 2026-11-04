import { rng, randInt } from '../lib.mjs';

// The slow but obviously correct version, used only to check the fast formula on small inputs.
function simulate(n, k) {
  const people = Array.from({ length: n }, (_, i) => i + 1);
  let index = 0;
  while (people.length > 1) {
    index = (index + k - 1) % people.length;
    people.splice(index, 1);
  }
  return people[0];
}

export function josephus(n, k) {
  let survivor = 0;
  for (let size = 2; size <= n; size++) survivor = (survivor + k) % size;
  return survivor + 1;
}

export default {
  slug: 'josephus',
  title: 'The Last Person Standing',
  topic: 'basics',
  difficulty: 'hard',
  order: 5,
  tags: ['recursion', 'math', 'simulation'],

  concept: {
    title: 'From a smaller circle to a bigger one',
    body: [
      'Simulating the game by removing people one at a time is easy to write, but removing from the middle of a list costs O(n) each time, so the whole simulation is O(n^2). For a million people that is far too slow.',
      'Many problems become easy when you ask: *if I already knew the answer for a smaller input, how would I get the answer for this one?* Here the smaller input is a circle with one person fewer.',
      'Number the positions 0, 1, 2, ... (zero-based). After the first person leaves, the circle has `i - 1` people and counting restarts at the person who was `k` places along. So a position in the small circle corresponds to a position in the big one shifted by `k` (wrapping around the circle of size `i`).',
      'That gives a recurrence: `J(1) = 0` and `J(i) = (J(i - 1) + k) mod i`. Computing it takes one pass from 2 up to `n`, so the time is **O(n)**. Add 1 at the end to turn the position back into a person number.'
    ]
  },

  statement: [
    '`n` people stand in a circle, numbered 1 to `n` in order. Counting starts at person 1 (who counts as "1"). The `k`-th person counted leaves the circle, and counting continues from the next person still in the circle. This repeats until only one person is left.',
    'Print the number of the person who remains.'
  ],
  inputFormat: ['One line with two integers `n` and `k`.'],
  outputFormat: ['Print the number of the last remaining person.'],
  constraints: ['1 <= n <= 1000000', '1 <= k <= 10^9'],
  examples: [
    { input: '7 3\n', note: 'People leave in the order 3, 6, 2, 7, 5, 1, and person 4 remains.' },
    { input: '5 2\n', note: 'People leave in the order 2, 4, 1, 5, and person 3 remains.' }
  ],
  hints: [
    'Removing people from a list one by one is too slow when `n` is a million.',
    'Solve a circle of size 1, then 2, then 3, and so on. If you know where the survivor stands in a circle of `i - 1` people, where do they stand in a circle of `i` people?',
    'Use zero-based positions. The survivor of a circle of 1 is at position 0. For a circle of `i`, the position is `(previous + k) % i`. Add 1 at the end.'
  ],
  starter: {
    python: '# Read n and k, print the number of the last person left.\nn, k = map(int, input().split())\n\n# Your code here\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n, k;\n    cin >> n >> k;\n    // Print the number of the last person left.\n    return 0;\n}\n'
  },
  solution: {
    explanation: [
      'Start with `survivor = 0`, the answer for a circle of one person. For every size from 2 up to `n`, update `survivor = (survivor + k) % size`. The answer is `survivor + 1`.',
      'Why it works: after the first elimination in a circle of `size` people, the remaining `size - 1` people start counting from the person after the one who left. A position `p` in that smaller circle is the position `(p + k) % size` in the full circle.'
    ],
    complexity: 'Time O(n), space O(1).',
    code: {
      python: 'n, k = map(int, input().split())\n\nsurvivor = 0\nfor size in range(2, n + 1):\n    survivor = (survivor + k) % size\nprint(survivor + 1)\n',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n, k;\n    cin >> n >> k;\n    long long survivor = 0;\n    for (long long size = 2; size <= n; size++) {\n        survivor = (survivor + k) % size;\n    }\n    cout << survivor + 1 << endl;\n    return 0;\n}\n'
    }
  },

  solve(input) {
    const [n, k] = input.trim().split(' ').map(Number);
    return String(josephus(n, k));
  },

  tests() {
    const r = rng(1005);
    // The fast formula must agree with the slow simulation on small inputs.
    for (let i = 0; i < 300; i++) {
      const n = randInt(r, 1, 60);
      const k = randInt(r, 1, 100);
      if (josephus(n, k) !== simulate(n, k)) throw new Error(`josephus formula disagrees with the simulation for n=${n}, k=${k}`);
    }
    const out = [[1, 1], [2, 1], [2, 5], [10, 1], [10, 1000000000], [41, 3], [1000, 7], [100000, 2], [1000000, 1], [1000000, 1000000000], [999999, 999999937]];
    for (let i = 0; i < 4; i++) out.push([randInt(r, 100000, 1000000), randInt(r, 1, 1000000000)]);
    return out.map(([n, k]) => `${n} ${k}\n`);
  }
};
