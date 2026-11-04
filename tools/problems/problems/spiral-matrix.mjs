import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

function spiral(n) {
  const g = Array.from({ length: n }, () => new Array(n).fill(0));
  let top = 0, bottom = n - 1, left = 0, right = n - 1, v = 1;
  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) g[top][j] = v++;
    top++;
    for (let i = top; i <= bottom; i++) g[i][right] = v++;
    right--;
    if (top <= bottom) { for (let j = right; j >= left; j--) g[bottom][j] = v++; bottom--; }
    if (left <= right) { for (let i = bottom; i >= top; i--) g[i][left] = v++; left++; }
  }
  return g.map((row) => row.join(' ')).join('\n');
}

export default {
  slug: 'spiral-matrix',
  title: 'Spiral Matrix',
  topic: 'basics',
  difficulty: 'hard',
  order: 96,
  tags: ['2d-arrays', 'simulation', 'boundaries'],

  concept: {
    title: 'Two-dimensional arrays and shrinking boundaries',
    body: [
      'A **two-dimensional array** (a grid, a matrix) is an array of arrays: `grid[i][j]` is the cell in row `i` and column `j`, both counted from 0. You create one with `n` rows and `n` columns filled with 0 like this:',
      { code: '# Python\ngrid = [[0] * n for _ in range(n)]\n\n// C++\nvector<vector<int>> grid(n, vector<int>(n, 0));\n\n// Java\nint[][] grid = new int[n][n];' },
      'To fill the grid in a spiral, walk along the outer ring, then along the next ring inside, and so on. Four variables remember the part of the grid that is still empty: `top`, `bottom`, `left` and `right`. Each round does four sides in this order, and shrinks the boundary after finishing a side:',
      { list: ['left to right along row `top`, then `top` moves down by one', 'top to bottom along column `right`, then `right` moves left by one', 'right to left along row `bottom`, then `bottom` moves up by one', 'bottom to top along column `left`, then `left` moves right by one'] },
      'The third and fourth sides must be guarded: after the first two sides the remaining area may be empty (for example in the middle of a grid with an odd size), so check `top <= bottom` before the third side and `left <= right` before the fourth. A counter `value` that goes up after every cell gives the numbers 1, 2, 3, ...'
    ]
  },

  statement: ['Given `n`, create an `n` x `n` grid and fill it with the numbers 1, 2, ..., n * n in a clockwise spiral, starting at the top-left cell and moving right first. Print the grid, one row per line, with the numbers of a row separated by spaces.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['`n` lines with `n` numbers each.'],
  constraints: ['1 <= n <= 20'],
  examples: [{ input: '3\n', note: 'Rows: `1 2 3`, `8 9 4`, `7 6 5`.' }, { input: '1\n', note: 'A single cell: 1.' }],
  hints: [
    'Keep four boundaries: top, bottom, left, right, and a counter that starts at 1.',
    'Fill the top row left to right, then the right column downwards, then the bottom row to the left, then the left column upwards; shrink the matching boundary after each side.',
    'Check `top <= bottom` before filling the bottom row and `left <= right` before the left column, to avoid writing the middle of an odd grid twice.'
  ],
  program: {
    io: ['n:int'],
    python: r`
      grid = [[0] * n for _ in range(n)]
      top, bottom, left, right = 0, n - 1, 0, n - 1
      value = 1
      while top <= bottom and left <= right:
          for j in range(left, right + 1):
              grid[top][j] = value
              value += 1
          top += 1
          for i in range(top, bottom + 1):
              grid[i][right] = value
              value += 1
          right -= 1
          if top <= bottom:
              for j in range(right, left - 1, -1):
                  grid[bottom][j] = value
                  value += 1
              bottom -= 1
          if left <= right:
              for i in range(bottom, top - 1, -1):
                  grid[i][left] = value
                  value += 1
              left += 1
      for row in grid:
          print(*row)`,
    cpp: r`
      int size = n;
      vector<vector<int>> grid(size, vector<int>(size, 0));
      int top = 0, bottom = size - 1, left = 0, right = size - 1;
      int value = 1;
      while (top <= bottom && left <= right) {
          for (int j = left; j <= right; j++) {
              grid[top][j] = value++;
          }
          top++;
          for (int i = top; i <= bottom; i++) {
              grid[i][right] = value++;
          }
          right--;
          if (top <= bottom) {
              for (int j = right; j >= left; j--) {
                  grid[bottom][j] = value++;
              }
              bottom--;
          }
          if (left <= right) {
              for (int i = bottom; i >= top; i--) {
                  grid[i][left] = value++;
              }
              left++;
          }
      }
      for (int i = 0; i < size; i++) {
          for (int j = 0; j < size; j++) {
              cout << grid[i][j] << " ";
          }
          cout << endl;
      }`,
    java: r`
      int size = (int) n;
      int[][] grid = new int[size][size];
      int top = 0, bottom = size - 1, left = 0, right = size - 1;
      int value = 1;
      while (top <= bottom && left <= right) {
          for (int j = left; j <= right; j++) {
              grid[top][j] = value++;
          }
          top++;
          for (int i = top; i <= bottom; i++) {
              grid[i][right] = value++;
          }
          right--;
          if (top <= bottom) {
              for (int j = right; j >= left; j--) {
                  grid[bottom][j] = value++;
              }
              bottom--;
          }
          if (left <= right) {
              for (int i = bottom; i >= top; i--) {
                  grid[i][left] = value++;
              }
              left++;
          }
      }
      for (int i = 0; i < size; i++) {
          for (int j = 0; j < size; j++) {
              System.out.print(grid[i][j] + " ");
          }
          System.out.println();
      }`
  },
  solution: {
    explanation: ['Each round fills one ring of the grid with four loops, one per side, and moves the matching boundary inwards. The two guards stop the third and fourth side from running when the ring has shrunk to one row or one column. Every cell is written exactly once.'],
    complexity: 'Time O(n^2), space O(n^2).'
  },
  solve(input) { return spiral(Number(input.trim())); },
  tests() {
    return [3, 1, 2, 4, 5, 6, 7, 10, 19, 20].map((n) => `${n}\n`);
  }
};
