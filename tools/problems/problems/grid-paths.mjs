import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

function paths(rows, cols) {
  const t = Array.from({ length: rows }, () => new Array(cols).fill(1));
  for (let i = 1; i < rows; i++) for (let j = 1; j < cols; j++) t[i][j] = t[i - 1][j] + t[i][j - 1];
  return t[rows - 1][cols - 1];
}

export default {
  slug: 'grid-paths',
  title: 'Paths in a Grid',
  topic: 'basics',
  difficulty: 'hard',
  order: 87,
  tags: ['recursion', 'memoization', 'grid'],

  concept: {
    title: 'Memoization with two parameters',
    body: [
      'A robot stands in the top-left cell of a grid and may only step **right** or **down**. How many different routes lead to the bottom-right cell? Think recursively: the last step into the target cell came either from the cell above or from the cell on the left. So the number of routes to a cell is the sum of the routes to those two neighbours:',
      { code: 'paths(r, c) = paths(r - 1, c) + paths(r, c - 1)\npaths(1, c) = 1          # in the first row there is only one route\npaths(r, 1) = 1          # same in the first column' },
      'Written like this, the recursion computes the same cells again and again, exactly like the naive Fibonacci: for a 16 x 16 grid there are over 300 million calls. But the problem has only `r * c` different questions. Store each answer in a table indexed by `(r, c)`, and the work drops to 256 calls.',
      'The table now has two indexes: a dictionary with `(r, c)` as the key in Python, a two-dimensional array in C++ and Java (`memo[r][c]`). An entry equal to 0 means "not computed yet", which works because every real answer is at least 1.',
      'Recognising overlapping subproblems and caching them is the central idea of dynamic programming, a topic you will meet later in the course.'
    ]
  },

  statement: ['A grid has `r` rows and `c` columns. A robot starts at the top-left cell and wants to reach the bottom-right cell. In one step it moves one cell to the right or one cell down. Print the number of different routes.'],
  inputFormat: ['One line with two integers `r` and `c`.'],
  outputFormat: ['The number of routes.'],
  constraints: ['1 <= r, c <= 16'],
  examples: [{ input: '2 2\n', note: 'Right-down or down-right: 2 routes.' }, { input: '3 3\n', note: '6 routes.' }],
  hints: [
    'The number of routes to a cell is the sum of the routes to the cell above and to the cell on the left.',
    'The first row and the first column have exactly one route.',
    'Without a memo table your program makes hundreds of millions of calls. Store each computed `(r, c)` answer and reuse it.'
  ],
  program: {
    io: ['r:int c:int'],
    helpers: {
      python: r`
        memo = {}

        def paths(r, c):
            if r == 1 or c == 1:
                return 1
            if (r, c) in memo:
                return memo[(r, c)]
            memo[(r, c)] = paths(r - 1, c) + paths(r, c - 1)
            return memo[(r, c)]`,
      cpp: r`
        long long memo[20][20];

        long long paths(int r, int c) {
            if (r == 1 || c == 1) {
                return 1;
            }
            if (memo[r][c] != 0) {
                return memo[r][c];
            }
            memo[r][c] = paths(r - 1, c) + paths(r, c - 1);
            return memo[r][c];
        }`,
      java: r`
        static long[][] memo = new long[20][20];

        static long paths(int r, int c) {
            if (r == 1 || c == 1) {
                return 1;
            }
            if (memo[r][c] != 0) {
                return memo[r][c];
            }
            memo[r][c] = paths(r - 1, c) + paths(r, c - 1);
            return memo[r][c];
        }`
    },
    starterHelpers: {
      python: r`
        memo = {}

        def paths(r, c):
            # Your code here
            pass`,
      cpp: r`
        long long memo[20][20];

        long long paths(int r, int c) {
            // Your code here
            return 0;
        }`,
      java: r`
        static long[][] memo = new long[20][20];

        static long paths(int r, int c) {
            // Your code here
            return 0;
        }`
    },
    starterBody: {
      python: 'print(paths(r, c))',
      cpp: r`cout << paths(r, c) << endl;`,
      java: 'System.out.println(paths((int) r, (int) c));'
    },
    python: 'print(paths(r, c))',
    cpp: r`cout << paths(r, c) << endl;`,
    java: 'System.out.println(paths((int) r, (int) c));'
  },
  solution: {
    explanation: ['Each cell is asked at most once; its answer is the sum of the answers of the cell above and the cell on the left, stored in `memo`. There are `r * c` cells, so the work is tiny. The answer for 16 x 16 is 155,117,520.'],
    complexity: 'Time O(r * c), space O(r * c).'
  },
  solve(input) { const [a, b] = input.trim().split(/\s+/).map(Number); return String(paths(a, b)); },
  tests() {
    const g = rng(87);
    return ['2 2\n', '3 3\n', '1 1\n', '1 16\n', '16 1\n', '5 7\n', '10 10\n', '16 16\n', '15 16\n', '12 16\n', ...many(4, () => `${randInt(g, 1, 16)} ${randInt(g, 1, 16)}\n`)];
  }
};
