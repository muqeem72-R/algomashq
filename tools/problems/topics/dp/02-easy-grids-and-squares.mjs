import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const easy = { difficulty: 'easy' };
const MOD = 1000000007;
const MODN = BigInt(MOD);
const matrixText = (m) => `${m.length} ${m[0].length}\n${m.map((row) => row.join(' ')).join('\n')}\n`;
const gridText = (g) => `${g.length} ${g[0].length}\n${g.join('\n')}\n`;
const randomMatrix = (g, h, w, lo, hi) => many(h, () => randArray(g, w, lo, hi));
const parseMatrix = (input) => { const rs = rows(input); const [h, w] = nums(rs[0]); return { h, w, m: many(h, (i) => nums(rs[i + 1])) }; };
const parseGrid = (input) => { const rs = rows(input); const [h, w] = nums(rs[0]); return { h, w, g: rs.slice(1, 1 + h) }; };
const MATRIX_INPUT = ['The first line has `h` and `w`: the number of rows and columns.', 'Each of the next `h` lines has `w` numbers: one row of the table.'];
const GRID_INPUT = ['The first line has `h` and `w`: the number of rows and columns.', 'Each of the next `h` lines has a row of `w` characters.'];

export default [
  {
    ...easy,
    inputFormat: ['The first line has `h` and `w`: the number of rows and columns.', 'Each of the next `h` lines has a row of `w` characters: `.` is a free cell and `#` is a wall.'],
    constraints: ['1 <= h, w <= 1000', 'The top left and the bottom right cells are free (`.`).'],
    slug: 'routes-around-walls',
    title: 'Count the Routes Through a Walled Grid',
    tags: ['dp', 'grid', 'counting'],
    concept: {
      title: 'A cell is reached from above or from the left: add the two counts',
      body: [
        'A robot stands in the top left corner of a grid and must reach the bottom right corner. It moves **one cell right or one cell down** at a time, and it cannot enter a cell with a wall (`#`). How many different routes are there? For an empty 3 by 3 grid there are 6 routes; a wall in the middle leaves 2. The answer is printed modulo 1 000 000 007.',
        'This is the stairs idea in two dimensions. Let `ways(i, j)` be the number of routes from the corner to the cell `(i, j)`. The robot arrived from the cell above or from the cell on the left, and these routes are different, so **`ways(i, j) = ways(i - 1, j) + ways(i, j - 1)`**; for a wall cell `ways(i, j) = 0`. The table is filled row by row, and `ways(0, 0) = 1`.',
        { code: 'ways = [0] * w                       # ways[j] is the value of the current row, column j\nways[0] = 1\nfor i in range(h):\n    for j in range(w):\n        if grid[i][j] == "#":\n            ways[j] = 0\n        elif j > 0:\n            ways[j] = (ways[j] + ways[j - 1]) % MOD   # from above (old ways[j]) + from the left\nprint(ways[w - 1])' },
        'A full table needs `h * w` numbers, but a row needs only the row above it, so **one row** is enough: before the update `ways[j]` still holds the value from the row above. The time is O(h * w) and the memory O(w). Always take the remainder as you add, because the number of routes grows very fast.'
      ]
    },
    statement: ['A grid has `h` rows and `w` columns; `.` is a free cell and `#` is a wall. A robot starts in the top left cell and moves one cell to the right or one cell down at a time, never entering a wall. Print the number of different routes to the bottom right cell, modulo 1000000007.'],
    outputFormat: ['Print one number: the number of routes modulo 1000000007.'],
    examples: [{ input: '3 3\n...\n.#.\n...\n', note: 'The wall in the middle leaves the route along the top and right edges and the route along the left and bottom edges: 2.' }, { input: '2 2\n..\n..\n', note: 'Right then down, or down then right: 2.' }],
    hints: ['Let ways(i, j) be the number of routes to the cell (i, j).', 'ways(i, j) = ways(i - 1, j) + ways(i, j - 1), and 0 for a wall.', 'One row of the table is enough; take the remainder after every addition.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        ways = [0] * w
        ways[0] = 1
        for i in range(h):
            row = grid[i]
            for j in range(w):
                if row[j] == "#":
                    ways[j] = 0
                elif j > 0:
                    ways[j] = (ways[j] + ways[j - 1]) % MOD
        print(ways[w - 1])`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<long long> ways(w, 0);
        ways[0] = 1;
        for (int i = 0; i < h; i++) {
            for (int j = 0; j < w; j++) {
                if (grid[i][j] == '#') ways[j] = 0;
                else if (j > 0) ways[j] = (ways[j] + ways[j - 1]) % MOD;
            }
        }
        cout << ways[w - 1] << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        final long MOD = 1000000007L;
        long[] ways = new long[colsCount];
        ways[0] = 1;
        for (int i = 0; i < rowsCount; i++) {
            for (int j = 0; j < colsCount; j++) {
                if (grid[i].charAt(j) == '#') ways[j] = 0;
                else if (j > 0) ways[j] = (ways[j] + ways[j - 1]) % MOD;
            }
        }
        System.out.println(ways[colsCount - 1]);`
    },
    solution: { explanation: ['ways(i, j) = ways(i - 1, j) + ways(i, j - 1) for a free cell and 0 for a wall, with one row of the table kept and a remainder after every addition; the answer is the value of the last cell.'], complexity: 'Time O(h * w), space O(w).' },
    solve(input) {
      const { h, w, g } = parseGrid(input); const t = Array.from({ length: h }, () => new Array(w).fill(0)); t[0][0] = 1; for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) { if (g[i][j] === '#') { t[i][j] = 0; continue; } if (i === 0 && j === 0) continue; t[i][j] = ((i ? t[i - 1][j] : 0) + (j ? t[i][j - 1] : 0)) % MOD; } return String(t[h - 1][w - 1]);
    },
    tests() {
      const g = rng(2011); const out = ['3 3\n...\n.#.\n...\n', '2 2\n..\n..\n', '1 1\n.\n', '1 5\n.....\n', '4 1\n.\n.\n.\n.\n', '2 2\n.#\n#.\n'];
      const walls = (h, w, p) => many(h, (i) => many(w, (j) => ((i === 0 && j === 0) || (i === h - 1 && j === w - 1) ? '.' : g() < p ? '#' : '.')).join(''));
      const brute = (input) => { const { h, w, g: grid } = parseGrid(input); let count = 0; const go = (i, j) => { if (i >= h || j >= w || grid[i][j] === '#') return; if (i === h - 1 && j === w - 1) { count++; return; } go(i + 1, j); go(i, j + 1); }; go(0, 0); return String(count % MOD); };
      crossCheck(() => { const h = randInt(g, 1, 7), w = randInt(g, 1, 7); return gridText(walls(h, w, 0.25)); }, (i) => this.solve(i), brute, 300);
      for (const [h, w, p] of [[10, 10, 0.1], [30, 30, 0.2], [100, 100, 0.05], [200, 200, 0.1], [300, 300, 0.02], [500, 500, 0.01], [500, 500, 0.001], [1, 1000, 0], [1000, 1, 0], [2, 1000, 0.001], [1000, 2, 0.001], [800, 800, 0.0005]]) out.push(gridText(walls(h, w, p)));
      out.push(gridText(many(1000, () => '.'.repeat(1000))), gridText(many(300, (i) => (i === 150 ? '#'.repeat(299) + '.' : '.'.repeat(300)))), gridText(many(300, (i) => (i === 150 ? '#'.repeat(300) : '.'.repeat(300)))));
      return out.filter((t) => { const { g: grid, h, w } = parseGrid(t); return grid[0][0] === '.' && grid[h - 1][w - 1] === '.'; });
    }
  },

  {
    ...easy,
    inputFormat: MATRIX_INPUT,
    constraints: ['1 <= h, w <= 400', '0 <= each number <= 1000'],
    slug: 'cheapest-grid-route',
    title: 'The Cheapest Route Across a Table of Costs',
    tags: ['dp', 'grid', 'min-cost'],
    concept: {
      title: 'The cheapest way to a cell is the cost of the cell plus the cheaper of two neighbours',
      body: [
        'A table of numbers is given; entering a cell costs the number written in it (the start cell too). Starting in the top left cell, you move **right or down** until you reach the bottom right cell. What is the smallest total cost of a route? For the table `1 3 1 / 1 5 1 / 4 2 1` the best route 1 -> 3 -> 1 -> 1 -> 1 costs 7.',
        'Let `best(i, j)` be the smallest cost of a route that ends in the cell `(i, j)`. The route came from above or from the left, so we take the **cheaper** of the two and add the cost of the cell: **`best(i, j) = cost(i, j) + min(best(i - 1, j), best(i, j - 1))`**. In the first row only the left neighbour exists, in the first column only the upper one, and `best(0, 0) = cost(0, 0)`.',
        { code: 'best = [0] * w\nfor i in range(h):\n    for j in range(w):\n        if i == 0 and j == 0:  best[j] = cost[0][0]\n        elif i == 0:           best[j] = best[j - 1] + cost[i][j]\n        elif j == 0:           best[j] = best[j] + cost[i][j]\n        else:                  best[j] = min(best[j], best[j - 1]) + cost[i][j]\nprint(best[w - 1])' },
        'This is the walled-grid counting problem with the sum replaced by a minimum. One row of the table is enough (`best[j]` still holds the value from the row above until we overwrite it). The time is O(h * w) and the memory O(w). Note that going only right and down is what makes this simple: a route never returns to a cell.'
      ]
    },
    statement: ['A table with `h` rows and `w` columns holds a cost in each cell. Starting in the top left cell you move one cell right or down at a time until you reach the bottom right cell; the cost of a route is the sum of the numbers in all the cells it visits (including both ends). Print the smallest possible cost.'],
    outputFormat: ['Print the smallest cost.'],
    examples: [{ input: '3 3\n1 3 1\n1 5 1\n4 2 1\n', note: 'The route 1, 3, 1, 1, 1 costs 7.' }, { input: '2 3\n1 2 3\n4 5 6\n', note: 'The route 1, 2, 3, 6 costs 12.' }],
    hints: ['Let best(i, j) be the smallest cost to arrive in the cell (i, j).', 'You came from above or from the left; take the smaller value and add the cost of the cell.', 'The first row and the first column have only one neighbour.'],
    program: {
      io: ['h:int w:int', 'cost:int[h][w]'],
      fast: true,
      python: r`
        best = [0] * w
        for i in range(h):
            row = cost[i]
            for j in range(w):
                if i == 0 and j == 0:
                    best[j] = row[0]
                elif i == 0:
                    best[j] = best[j - 1] + row[j]
                elif j == 0:
                    best[j] += row[j]
                else:
                    best[j] = min(best[j], best[j - 1]) + row[j]
        print(best[w - 1])`,
      cpp: r`
        vector<long long> best(w, 0);
        for (int i = 0; i < h; i++) {
            for (int j = 0; j < w; j++) {
                if (i == 0 && j == 0) best[j] = cost[0][0];
                else if (i == 0) best[j] = best[j - 1] + cost[i][j];
                else if (j == 0) best[j] += cost[i][j];
                else best[j] = min(best[j], best[j - 1]) + cost[i][j];
            }
        }
        cout << best[w - 1] << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        long[] best = new long[colsCount];
        for (int i = 0; i < rowsCount; i++) {
            for (int j = 0; j < colsCount; j++) {
                if (i == 0 && j == 0) best[j] = cost[0][0];
                else if (i == 0) best[j] = best[j - 1] + cost[i][j];
                else if (j == 0) best[j] += cost[i][j];
                else best[j] = Math.min(best[j], best[j - 1]) + cost[i][j];
            }
        }
        System.out.println(best[colsCount - 1]);`
    },
    solution: { explanation: ['best(i, j) = cost(i, j) + min(best(i - 1, j), best(i, j - 1)) with the border cells having one neighbour; one row of the table is kept, and the value of the last cell is the answer.'], complexity: 'Time O(h * w), space O(w).' },
    solve(input) {
      const { h, w, m } = parseMatrix(input); const t = m.map((row) => row.slice()); for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) { if (i === 0 && j === 0) continue; const up = i ? t[i - 1][j] : Infinity; const left = j ? t[i][j - 1] : Infinity; t[i][j] = m[i][j] + Math.min(up, left); } return String(t[h - 1][w - 1]);
    },
    tests() {
      const g = rng(2012); const out = ['3 3\n1 3 1\n1 5 1\n4 2 1\n', '2 3\n1 2 3\n4 5 6\n', '1 1\n7\n', '1 4\n1 2 3 4\n', '4 1\n1\n2\n3\n4\n'];
      const brute = (input) => { const { h, w, m } = parseMatrix(input); let best = Infinity; const go = (i, j, sum) => { sum += m[i][j]; if (i === h - 1 && j === w - 1) { best = Math.min(best, sum); return; } if (i + 1 < h) go(i + 1, j, sum); if (j + 1 < w) go(i, j + 1, sum); }; go(0, 0, 0); return String(best); };
      crossCheck(() => matrixText(randomMatrix(g, randInt(g, 1, 6), randInt(g, 1, 6), 0, 20)), (i) => this.solve(i), brute, 300);
      for (const [h, w, hi] of [[10, 10, 100], [50, 50, 1000], [100, 100, 1000], [300, 300, 1000], [400, 400, 1000], [400, 400, 1000], [400, 400, 5], [1, 400, 1000], [400, 1, 1000], [2, 400, 1000], [400, 2, 1000], [399, 397, 1000]]) out.push(matrixText(randomMatrix(g, h, w, 0, hi)));
      out.push(matrixText(many(250, () => new Array(250).fill(1000))), matrixText(many(250, () => new Array(250).fill(0))), matrixText(many(250, (i) => many(250, (j) => (i === 0 || j === 249 ? 0 : 1000)))), matrixText(many(250, (i) => many(250, (j) => (j === 0 || i === 249 ? 0 : 1000)))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `m`: the number of rows of the triangle and the number of values in it (`m = n * (n + 1) / 2`).', 'The second line has the `m` values: the first row (1 value), then the second row (2 values), and so on up to the row `n` (`n` values).'],
    constraints: ['1 <= n <= 500', '-10^4 <= each value <= 10^4'],
    slug: 'triangle-descent',
    title: 'The Lightest Way Down a Triangle',
    tags: ['dp', 'triangle', 'min-cost', 'bottom-up'],
    concept: {
      title: 'Work from the bottom row upwards: each number picks the smaller of two numbers below it',
      body: [
        'Numbers are arranged in a triangle: 1 number in the first row, 2 in the second, and so on. You start at the top and walk down; from a number in row `i` at position `j` you may step to position `j` or `j + 1` of the next row. The cost of a walk is the sum of the numbers on it. Find the **smallest** cost of a walk from the top to the bottom row. For the triangle `2 / 3 4 / 6 5 7 / 4 1 8 3` the best walk 2 + 3 + 5 + 1 costs 11.',
        'Going from the top is awkward, because the number of walks grows fast and each cell is reached from different directions. Go from the **bottom** instead. Let `best(i, j)` be the smallest cost of a walk that starts at the cell `(i, j)` and ends at the bottom. For the last row it is the number itself. For a higher row the walk steps to one of the two cells below, so **`best(i, j) = value(i, j) + min(best(i + 1, j), best(i + 1, j + 1))`**. The answer is `best(0, 0)`.',
        { code: 'row = [the last row of the triangle]\nfor i in range(n - 2, -1, -1):             # from the second last row up to the top\n    for j in range(i + 1):\n        row[j] = tri[i][j] + min(row[j], row[j + 1])\nprint(row[0])' },
        'The values arrive as one long list, so the row `i` starts at the index `i * (i + 1) / 2`. One array of length `n` is enough, because the row above needs only the row below it, and we overwrite from left to right (a cell reads `row[j]` and `row[j + 1]`, which are not changed yet). The time is O(n^2), the memory O(n). **Reversing the direction** of a DP is a useful trick: a state defined by "from here to the end" often needs fewer special cases than "from the start to here".'
      ]
    },
    statement: ['A triangle has `n` rows; the row `i` (counting from 1) has `i` numbers. You start at the single number in the top row and repeatedly step to one of the two numbers directly below (the same position or the next one to the right) until you reach the bottom row. Print the smallest possible sum of the numbers on such a walk.'],
    outputFormat: ['Print the smallest sum.'],
    examples: [{ input: '4 10\n2 3 4 6 5 7 4 1 8 3\n', note: 'The walk 2, 3, 5, 1 has the sum 11.' }, { input: '1 1\n-10\n', note: 'A single number: -10.' }],
    hints: ['Let best(i, j) be the smallest cost of a walk from the cell (i, j) to the bottom.', 'In the last row it is the value itself; above it is the value plus the smaller of the two cells below.', 'Row i starts at the index i * (i + 1) / 2 of the list; a single array of length n is enough.'],
    program: {
      io: ['n:int m:int', 'tri:int[m]'],
      fast: true,
      python: r`
        start = (n - 1) * n // 2
        row = tri[start:start + n]
        for i in range(n - 2, -1, -1):
            base = i * (i + 1) // 2
            for j in range(i + 1):
                row[j] = tri[base + j] + min(row[j], row[j + 1])
        print(row[0])`,
      cpp: r`
        long long start = (n - 1) * n / 2;
        vector<long long> row(tri.begin() + start, tri.begin() + start + n);
        for (long long i = n - 2; i >= 0; i--) {
            long long base = i * (i + 1) / 2;
            for (long long j = 0; j <= i; j++) {
                row[j] = tri[base + j] + min(row[j], row[j + 1]);
            }
        }
        cout << row[0] << "\n";`,
      java: r`
        int rowsCount = (int) n;
        int start = (rowsCount - 1) * rowsCount / 2;
        long[] row = new long[rowsCount];
        for (int j = 0; j < rowsCount; j++) row[j] = tri[start + j];
        for (int i = rowsCount - 2; i >= 0; i--) {
            int base = i * (i + 1) / 2;
            for (int j = 0; j <= i; j++) {
                row[j] = tri[base + j] + Math.min(row[j], row[j + 1]);
            }
        }
        System.out.println(row[0]);`
    },
    solution: { explanation: ['Starting from the last row, every number is replaced by itself plus the smaller of the two numbers below it, so that best(i, j) is the smallest cost of a walk from that cell to the bottom; the top value is the answer. One array of length n is reused for all rows.'], complexity: 'Time O(n^2), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = nums(rs[0])[0]; const flat = nums(rs[1]); const tri = []; let at = 0; for (let i = 0; i < n; i++) { tri.push(flat.slice(at, at + i + 1)); at += i + 1; } // the top-down table: best cost of a walk from the top to each cell
      let cur = [tri[0][0]]; for (let i = 1; i < n; i++) { const nxt = []; for (let j = 0; j <= i; j++) nxt.push(tri[i][j] + Math.min(j < i ? cur[j] : Infinity, j > 0 ? cur[j - 1] : Infinity)); cur = nxt; } return String(Math.min(...cur));
    },
    tests() {
      const g = rng(2013); const out = ['4 10\n2 3 4 6 5 7 4 1 8 3\n', '1 1\n-10\n', '2 3\n1 2 3\n', '3 6\n-1 -2 -3 -4 -5 -6\n'];
      const make = (n, lo, hi) => { const m = n * (n + 1) / 2; return `${n} ${m}\n${randArray(g, m, lo, hi).join(' ')}\n`; };
      const brute = (input) => { const rs = rows(input); const n = nums(rs[0])[0]; const flat = nums(rs[1]); const at = (i, j) => flat[i * (i + 1) / 2 + j]; let best = Infinity; const go = (i, j, sum) => { sum += at(i, j); if (i === n - 1) { best = Math.min(best, sum); return; } go(i + 1, j, sum); go(i + 1, j + 1, sum); }; go(0, 0, 0); return String(best); };
      crossCheck(() => make(randInt(g, 1, 9), -20, 20), (i) => this.solve(i), brute, 300);
      for (const [n, lo, hi] of [[10, -100, 100], [50, -10000, 10000], [100, -10000, 10000], [200, -10000, 10000], [300, 0, 10000], [400, -10000, 10000], [500, -10000, 10000], [500, 0, 10000], [500, -10000, 0]]) out.push(make(n, lo, hi));
      out.push(`300 45150\n${new Array(45150).fill(10000).join(' ')}\n`, `300 45150\n${new Array(45150).fill(-10000).join(' ')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: MATRIX_INPUT,
    constraints: ['1 <= h, w <= 400', '-100 <= each number <= 100'],
    slug: 'falling-path',
    title: 'The Smallest Sum of a Falling Path',
    tags: ['dp', 'grid', 'min-cost'],
    concept: {
      title: 'Each cell looks at up to three cells of the row above',
      body: [
        'A table of numbers (possibly negative) is given. A *falling path* starts at any cell of the **top row** and moves down one row at a time: from the cell `(i, j)` it may go to `(i + 1, j - 1)`, `(i + 1, j)` or `(i + 1, j + 1)` (as long as the column exists). Find the smallest sum of the numbers on a falling path that reaches the bottom row.',
        'Let `best(i, j)` be the smallest sum of a falling path that **ends** in the cell `(i, j)`. In the top row it is the number itself. A path to `(i, j)` came from one of the three cells above, so **`best(i, j) = value(i, j) + min of best(i - 1, j - 1), best(i - 1, j), best(i - 1, j + 1)`**, using only the cells that exist. The answer is the smallest value in the last row, because the path may end anywhere.',
        { code: 'best = matrix[0][:]\nfor i in range(1, h):\n    new = [0] * w\n    for j in range(w):\n        lowest = best[j]\n        if j > 0:      lowest = min(lowest, best[j - 1])\n        if j + 1 < w:  lowest = min(lowest, best[j + 1])\n        new[j] = lowest + matrix[i][j]\n    best = new\nprint(min(best))' },
        'Here we cannot overwrite in place, because a cell needs the **old** values of both neighbours; so we build a new row each time (or keep one old row and one new row). The time is O(h * w), the memory O(w). The only change from the route problems is the free choice of the start and the end, and one more neighbour.'
      ]
    },
    statement: ['A table has `h` rows and `w` columns. A falling path starts at any cell of the first row and moves to the next row each step, going to the cell directly below or to one of the two diagonal neighbours below (if it exists). Print the smallest possible sum of the numbers on a path that reaches the last row.'],
    outputFormat: ['Print the smallest sum.'],
    examples: [{ input: '3 3\n2 1 3\n6 5 4\n7 8 9\n', note: 'The path 1, 5, 7 has the sum 13 (so has 1, 4, 8), and no path is cheaper.' }, { input: '1 3\n5 -2 9\n', note: 'A single row: the smallest number, -2.' }],
    hints: ['Let best(i, j) be the smallest sum of a falling path that ends in the cell (i, j).', 'Take the smallest of the up to three cells above and add the value of the cell.', 'The answer is the smallest value in the last row.'],
    program: {
      io: ['h:int w:int', 'matrix:int[h][w]'],
      fast: true,
      python: r`
        best = matrix[0][:]
        for i in range(1, h):
            row = matrix[i]
            new = [0] * w
            for j in range(w):
                lowest = best[j]
                if j > 0 and best[j - 1] < lowest:
                    lowest = best[j - 1]
                if j + 1 < w and best[j + 1] < lowest:
                    lowest = best[j + 1]
                new[j] = lowest + row[j]
            best = new
        print(min(best))`,
      cpp: r`
        vector<long long> best = matrix[0];
        for (int i = 1; i < h; i++) {
            vector<long long> next(w, 0);
            for (int j = 0; j < w; j++) {
                long long lowest = best[j];
                if (j > 0) lowest = min(lowest, best[j - 1]);
                if (j + 1 < w) lowest = min(lowest, best[j + 1]);
                next[j] = lowest + matrix[i][j];
            }
            best = next;
        }
        cout << *min_element(best.begin(), best.end()) << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        long[] best = matrix[0].clone();
        long[] next = new long[colsCount];
        for (int i = 1; i < rowsCount; i++) {
            for (int j = 0; j < colsCount; j++) {
                long lowest = best[j];
                if (j > 0) lowest = Math.min(lowest, best[j - 1]);
                if (j + 1 < colsCount) lowest = Math.min(lowest, best[j + 1]);
                next[j] = lowest + matrix[i][j];
            }
            long[] swap = best;
            best = next;
            next = swap;
        }
        long answer = best[0];
        for (long x : best) answer = Math.min(answer, x);
        System.out.println(answer);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['best(i, j) = value(i, j) + the smallest of the up to three cells above, row by row; the answer is the smallest value of the last row.'], complexity: 'Time O(h * w), space O(w).' },
    solve(input) {
      const { h, w, m } = parseMatrix(input); const t = m.map((row) => row.slice()); for (let i = 1; i < h; i++) for (let j = 0; j < w; j++) { let low = t[i - 1][j]; if (j > 0) low = Math.min(low, t[i - 1][j - 1]); if (j + 1 < w) low = Math.min(low, t[i - 1][j + 1]); t[i][j] = m[i][j] + low; } return String(Math.min(...t[h - 1]));
    },
    tests() {
      const g = rng(2014); const out = ['3 3\n2 1 3\n6 5 4\n7 8 9\n', '1 3\n5 -2 9\n', '1 1\n4\n', '3 1\n1\n-2\n3\n', '2 2\n-5 5\n5 -5\n'];
      const brute = (input) => { const { h, w, m } = parseMatrix(input); let best = Infinity; const go = (i, j, sum) => { sum += m[i][j]; if (i === h - 1) { best = Math.min(best, sum); return; } for (const d of [-1, 0, 1]) if (j + d >= 0 && j + d < w) go(i + 1, j + d, sum); }; for (let j = 0; j < w; j++) go(0, j, 0); return String(best); };
      crossCheck(() => matrixText(randomMatrix(g, randInt(g, 1, 6), randInt(g, 1, 6), -20, 20)), (i) => this.solve(i), brute, 300);
      for (const [h, w] of [[10, 10], [40, 40], [100, 100], [200, 200], [400, 400], [400, 400], [1, 400], [400, 1], [2, 400], [400, 2], [399, 397]]) out.push(matrixText(randomMatrix(g, h, w, -100, 100)));
      out.push(matrixText(many(200, () => new Array(200).fill(100))), matrixText(many(200, () => new Array(200).fill(-100))), matrixText(many(300, (i) => many(300, (j) => (j === (i * 7) % 300 ? -100 : 100)))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: MATRIX_INPUT,
    constraints: ['1 <= h, w <= 400', '0 <= each number <= 1000'],
    slug: 'gold-mine-walk',
    title: 'Walk Through the Gold Mine',
    tags: ['dp', 'grid', 'max-sum'],
    concept: {
      title: 'Move column by column: the best value of a cell comes from three cells in the previous column',
      body: [
        'A gold mine is a table; the number in a cell is the amount of gold there. A miner may **start at any cell of the first column**. From a cell `(i, j)` the miner moves to the next column: to `(i - 1, j + 1)`, `(i, j + 1)` or `(i + 1, j + 1)` (staying inside the table). The miner collects the gold of every cell visited. What is the **largest** amount of gold that can be collected on a walk to the last column?',
        'Let `best(i, j)` be the largest amount collected by a walk that **ends** in the cell `(i, j)`. In the first column it is the gold of the cell itself. A walk to `(i, j)` came from one of the three cells in the previous column that can step to it, so **`best(i, j) = gold(i, j) + max of best(i - 1, j - 1), best(i, j - 1), best(i + 1, j - 1)`** (the cells that exist). The answer is the largest value in the last column.',
        { code: 'best = [gold[i][0] for i in range(h)]            # the first column\nfor j in range(1, w):\n    new = [0] * h\n    for i in range(h):\n        top = best[i]\n        if i > 0:      top = max(top, best[i - 1])\n        if i + 1 < h:  top = max(top, best[i + 1])\n        new[i] = top + gold[i][j]\n    best = new\nprint(max(best))' },
        'The table is processed **column by column**, because every step moves one column to the right. This is the falling-path problem turned sideways, with a maximum instead of a minimum. The time is O(h * w) and the memory O(h). Choosing the direction of the sweep to match the direction of the moves is what makes the order of the table correct.'
      ]
    },
    statement: ['A gold mine is a table with `h` rows and `w` columns; each cell holds some gold. A miner starts in any cell of the first column and, at each step, moves to the next column: to the cell right-up, right or right-down (if it exists). The miner collects the gold of all the cells visited, including the first one. Print the largest amount of gold that can be collected on a walk that ends in the last column.'],
    outputFormat: ['Print the largest amount of gold.'],
    examples: [{ input: '3 3\n1 3 3\n2 1 4\n0 6 4\n', note: 'Start with the 2 in the second row, step right-down to the 6, then right to the 4: 2 + 6 + 4 = 12.' }, { input: '1 4\n5 1 2 3\n', note: 'A single row: 5 + 1 + 2 + 3 = 11.' }],
    hints: ['Let best(i, j) be the largest amount of gold collected by a walk that ends in the cell (i, j).', 'The previous cell is in the previous column: one row up, the same row or one row down.', 'Process the table column by column; the answer is the largest value in the last column.'],
    program: {
      io: ['h:int w:int', 'gold:int[h][w]'],
      fast: true,
      python: r`
        best = [gold[i][0] for i in range(h)]
        for j in range(1, w):
            new = [0] * h
            for i in range(h):
                top = best[i]
                if i > 0 and best[i - 1] > top:
                    top = best[i - 1]
                if i + 1 < h and best[i + 1] > top:
                    top = best[i + 1]
                new[i] = top + gold[i][j]
            best = new
        print(max(best))`,
      cpp: r`
        vector<long long> best(h);
        for (int i = 0; i < h; i++) best[i] = gold[i][0];
        for (int j = 1; j < w; j++) {
            vector<long long> next(h, 0);
            for (int i = 0; i < h; i++) {
                long long top = best[i];
                if (i > 0) top = max(top, best[i - 1]);
                if (i + 1 < h) top = max(top, best[i + 1]);
                next[i] = top + gold[i][j];
            }
            best = next;
        }
        cout << *max_element(best.begin(), best.end()) << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        long[] best = new long[rowsCount];
        long[] next = new long[rowsCount];
        for (int i = 0; i < rowsCount; i++) best[i] = gold[i][0];
        for (int j = 1; j < colsCount; j++) {
            for (int i = 0; i < rowsCount; i++) {
                long top = best[i];
                if (i > 0) top = Math.max(top, best[i - 1]);
                if (i + 1 < rowsCount) top = Math.max(top, best[i + 1]);
                next[i] = top + gold[i][j];
            }
            long[] swap = best;
            best = next;
            next = swap;
        }
        long answer = best[0];
        for (long x : best) answer = Math.max(answer, x);
        System.out.println(answer);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The table is processed column by column: the best value of a cell is its gold plus the largest value among the cells of the previous column that can step to it; the answer is the largest value of the last column.'], complexity: 'Time O(h * w), space O(h).' },
    solve(input) {
      const { h, w, m } = parseMatrix(input); const t = m.map((row) => row.slice()); for (let j = 1; j < w; j++) for (let i = 0; i < h; i++) { let top = t[i][j - 1]; if (i > 0) top = Math.max(top, t[i - 1][j - 1]); if (i + 1 < h) top = Math.max(top, t[i + 1][j - 1]); t[i][j] = m[i][j] + top; } let best = 0; for (let i = 0; i < h; i++) best = Math.max(best, t[i][w - 1]); return String(best);
    },
    tests() {
      const g = rng(2015); const out = ['3 3\n1 3 3\n2 1 4\n0 6 4\n', '1 4\n5 1 2 3\n', '1 1\n9\n', '3 1\n4\n9\n2\n', '2 2\n0 0\n0 0\n'];
      const brute = (input) => { const { h, w, m } = parseMatrix(input); let best = 0; const go = (i, j, sum) => { sum += m[i][j]; if (j === w - 1) { best = Math.max(best, sum); return; } for (const d of [-1, 0, 1]) if (i + d >= 0 && i + d < h) go(i + d, j + 1, sum); }; for (let i = 0; i < h; i++) go(i, 0, 0); return String(best); };
      crossCheck(() => matrixText(randomMatrix(g, randInt(g, 1, 6), randInt(g, 1, 6), 0, 20)), (i) => this.solve(i), brute, 300);
      for (const [h, w] of [[10, 10], [40, 40], [100, 100], [200, 200], [400, 400], [400, 400], [1, 400], [400, 1], [2, 400], [400, 2], [399, 397]]) out.push(matrixText(randomMatrix(g, h, w, 0, 1000)));
      out.push(matrixText(many(200, () => new Array(200).fill(1000))), matrixText(many(200, () => new Array(200).fill(0))), matrixText(many(250, (i) => many(250, (j) => (i === (j * 3) % 250 ? 1000 : 1)))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the number `k`.'],
    constraints: ['0 <= k <= 1500'],
    slug: 'pascal-row',
    title: 'The k-th Row of Pascal\'s Triangle',
    tags: ['dp', 'pascal', 'combinatorics'],
    concept: {
      title: 'Each number is the sum of the two numbers above it',
      body: [
        'Pascal\'s triangle starts with a single 1; every following row begins and ends with 1, and every other number is the **sum of the two numbers above it**: `1 / 1 1 / 1 2 1 / 1 3 3 1 / 1 4 6 4 1 ...`. The numbers of the row `k` (the first row is the row 0) are the binomial coefficients: the number of ways to choose `j` things out of `k`. Print the row `k`, each number modulo 1 000 000 007.',
        'The rule is already a DP: **`row_i[j] = row_{i-1}[j - 1] + row_{i-1}[j]`**, with 1 at both ends. Build the rows one after another; only the previous row is needed. If the row is stored in one array, the update can be done **from right to left**, so that a number still sees the old value of its left neighbour.',
        { code: 'row = [1] + [0] * k\nfor i in range(1, k + 1):\n    for j in range(i, 0, -1):               # from right to left\n        row[j] = (row[j] + row[j - 1]) % MOD\nprint(*row)' },
        'If the update went from left to right, `row[j - 1]` would already be the new value and the sums would be wrong. The time is O(k^2), the memory O(k). For huge `k` with a single coefficient there are formulas with factorials and modular inverses, but for a whole row of moderate size this table is the simplest and needs no division.'
      ]
    },
    statement: ['Print the row number `k` of Pascal\'s triangle (the rows are numbered from 0; the row 0 is `1`). The row has `k + 1` numbers; print each modulo 1000000007, separated by spaces.'],
    outputFormat: ['Print the `k + 1` numbers of the row on one line, separated by spaces.'],
    examples: [{ input: '4\n', note: 'The row 4 is 1 4 6 4 1.' }, { input: '0\n', note: 'The row 0 is a single 1.' }],
    hints: ['Each number is the sum of the two numbers above it; the ends are 1.', 'Keep one array and update it from right to left.', 'Take the remainder modulo 1000000007 after each addition.'],
    program: {
      io: ['k:int'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        row = [1] + [0] * k
        for i in range(1, k + 1):
            for j in range(i, 0, -1):
                row[j] = (row[j] + row[j - 1]) % MOD
        print(*row)`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<long long> row(k + 1, 0);
        row[0] = 1;
        for (long long i = 1; i <= k; i++) {
            for (long long j = i; j >= 1; j--) {
                row[j] = (row[j] + row[j - 1]) % MOD;
            }
        }
        for (long long j = 0; j <= k; j++) cout << (j ? " " : "") << row[j];
        cout << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int last = (int) k;
        long[] row = new long[last + 1];
        row[0] = 1;
        for (int i = 1; i <= last; i++) {
            for (int j = i; j >= 1; j--) {
                row[j] = (row[j] + row[j - 1]) % MOD;
            }
        }
        StringBuilder out = new StringBuilder();
        for (int j = 0; j <= last; j++) out.append(j > 0 ? " " : "").append(row[j]);
        System.out.println(out);`
    },
    solution: { explanation: ['One array holds the current row; for every new row the numbers are updated from right to left as row[j] = row[j] + row[j - 1] (modulo 1000000007), so that each number sees the old left neighbour.'], complexity: 'Time O(k^2), space O(k).' },
    solve(input) {
      const [k] = nums(input); // exact binomial coefficients with big integers: C(k, j + 1) = C(k, j) * (k - j) / (j + 1)
      const out = []; let c = 1n; for (let j = 0; j <= k; j++) { out.push(String(c % MODN)); c = c * BigInt(k - j) / BigInt(j + 1); } return out.join(' ');
    },
    tests() {
      const out = ['4\n', '0\n', '1\n', '2\n', '3\n'];
      for (const k of [5, 10, 20, 33, 34, 50, 100, 250, 500, 800, 1000, 1234, 1499, 1500, 1500]) out.push(`${k}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `q`: the number of questions.', 'The second line has `q` numbers `n`.'],
    constraints: ['1 <= q <= 20000', '1 <= n <= 10000'],
    slug: 'fewest-squares',
    title: 'The Fewest Perfect Squares That Add Up to n',
    tags: ['dp', 'unbounded', 'min-count'],
    concept: {
      title: 'Try every square as the last term, and share one table between all the questions',
      body: [
        'Every positive integer is a sum of perfect squares (`1, 4, 9, 16, ...`), for example `12 = 4 + 4 + 4` and `13 = 4 + 9`. For each question `n`, find the **smallest number of squares** whose sum is exactly `n` (a square may be used many times). For `12` the answer is 3, for `13` it is 2.',
        'Let `best(v)` be the smallest number of squares that sum to `v`; `best(0) = 0`. The last square in a sum for `v` can be any square `s <= v`, and the rest is a sum for `v - s`, so **`best(v) = 1 + min over all squares s <= v of best(v - s)`**. A number `v` can always be written as `v` ones, so there is always an answer. The table is filled for `v = 1, 2, ...` in this order, because `v - s < v` is already known.',
        { code: 'limit = max(queries)\nbest = [0] * (limit + 1)\nsquares = [s * s for s in range(1, isqrt(limit) + 1)]\nfor v in range(1, limit + 1):\n    low = v                                    # v ones\n    for s in squares:\n        if s > v: break\n        low = min(low, best[v - s] + 1)\n    best[v] = low\nprint(*[best[n] for n in queries])' },
        'The questions are many, but they all use the **same table**: build it once up to the largest `n`, then answer each question with a lookup. The table costs O(limit * sqrt(limit)) = about a million steps for 10 000, and each question is O(1). Computing a table once and reusing it is the usual way to answer many queries on the same DP.'
      ]
    },
    statement: ['For each of the `q` given numbers `n`, print the smallest number of perfect squares (1, 4, 9, 16, ...; each may be used several times) whose sum is exactly `n`.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces: the answers in the order of the questions.'],
    examples: [{ input: '3\n12 13 1\n', note: '12 = 4 + 4 + 4 (3 squares), 13 = 4 + 9 (2 squares), 1 = 1 (1 square).' }],
    hints: ['Let best(v) be the smallest number of squares for v; best(0) = 0.', 'Try every square s <= v as the last term: best(v) = 1 + min best(v - s).', 'Build the table once for the largest n and answer all questions from it.'],
    program: {
      io: ['q:int', 'queries:int[q]'],
      fast: true,
      helpers: { python: 'from math import isqrt', cpp: '', java: '' },
      includes: ['<algorithm>', '<cmath>'],
      python: r`
        limit = max(queries)
        best = [0] * (limit + 1)
        squares = [s * s for s in range(1, isqrt(limit) + 1)]
        for v in range(1, limit + 1):
            low = v
            for s in squares:
                if s > v:
                    break
                if best[v - s] + 1 < low:
                    low = best[v - s] + 1
            best[v] = low
        print(*[best[n] for n in queries])`,
      cpp: r`
        long long limit = *max_element(queries.begin(), queries.end());
        vector<int> best(limit + 1, 0);
        for (long long v = 1; v <= limit; v++) {
            int low = (int)v;
            for (long long s = 1; s * s <= v; s++) {
                low = min(low, best[v - s * s] + 1);
            }
            best[v] = low;
        }
        for (long long i = 0; i < q; i++) cout << (i ? " " : "") << best[queries[i]];
        cout << "\n";`,
      java: r`
        int limit = 0;
        for (long x : queries) limit = Math.max(limit, (int) x);
        int[] best = new int[limit + 1];
        for (int v = 1; v <= limit; v++) {
            int low = v;
            for (int s = 1; s * s <= v; s++) {
                low = Math.min(low, best[v - s * s] + 1);
            }
            best[v] = low;
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) out.append(i > 0 ? " " : "").append(best[(int) queries[i]]);
        System.out.println(out);`
    },
    solution: { explanation: ['best(v) = 1 + the smallest best(v - s) over all squares s <= v, with best(0) = 0, computed once up to the largest question; every question is a table lookup.'], complexity: 'Time O(M * sqrt(M) + q) where M is the largest n, space O(M).' },
    solve(input) {
      const rs = rows(input); const q = Number(rs[0]); const ns = nums(rs[1]); const limit = Math.max(...ns); const best = new Array(limit + 1).fill(Infinity); best[0] = 0; // forward style: push from every smaller value
      for (let v = 0; v < limit; v++) for (let s = 1; v + s * s <= limit; s++) best[v + s * s] = Math.min(best[v + s * s], best[v] + 1); return ns.map((n) => best[n]).join(' ');
    },
    tests() {
      const g = rng(2017); const out = ['3\n12 13 1\n', '1\n1\n', '1\n10000\n', '4\n2 3 7 15\n'];
      const brute = (input) => { const rs = rows(input); const ns = nums(rs[1]); const memo = new Map(); const go = (v) => { if (v === 0) return 0; if (memo.has(v)) return memo.get(v); let best = Infinity; for (let s = 1; s * s <= v; s++) best = Math.min(best, 1 + go(v - s * s)); memo.set(v, best); return best; }; return ns.map(go).join(' '); };
      crossCheck(() => { const q = randInt(g, 1, 6); return `${q}\n${randArray(g, q, 1, 60).join(' ')}\n`; }, (i) => this.solve(i), brute, 300);
      const make = (q, hi) => `${q}\n${randArray(g, q, 1, hi).join(' ')}\n`;
      for (const [q, hi] of [[10, 100], [100, 1000], [1000, 10000], [5000, 10000], [20000, 10000], [20000, 10000], [20000, 100], [20000, 9999]]) out.push(make(q, hi));
      out.push(`20000\n${many(20000, (i) => 10000 - (i % 100)).join(' ')}\n`, `10000\n${many(10000, (i) => i + 1).join(' ')}\n`, `100\n${many(100, (i) => (i + 1) * (i + 1)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: GRID_INPUT,
    constraints: ['1 <= h, w <= 800', 'Every character is `0` or `1`.'],
    slug: 'largest-square-of-ones',
    title: 'The Largest Square Made Only of Ones',
    tags: ['dp', 'grid', 'square'],
    concept: {
      title: 'A square ends in a cell: its side is one more than the smallest of three neighbours',
      body: [
        'A grid contains `0`s and `1`s. Find the **largest square** (rows and columns next to each other) that consists only of `1`s and print its **area**. For the grid `10100 / 10111 / 11111 / 10010` the largest all-ones square has side 2, so the area is 4.',
        'Let `side(i, j)` be the side of the largest all-ones square whose **bottom right corner** is the cell `(i, j)`. If the cell is `0`, it is 0. If the cell is `1`, the square is limited by the three neighbours above and to the left: the square ending at `(i - 1, j)`, the one ending at `(i, j - 1)` and the one ending at `(i - 1, j - 1)`. The smallest of the three sides plus one is the answer: **`side(i, j) = 1 + min(side(i - 1, j), side(i, j - 1), side(i - 1, j - 1))`**. The largest value in the whole table gives the answer: its square.',
        { code: 'side = [0] * (w + 1)                  # the previous row, shifted by one place\nbest = 0\nfor i in range(h):\n    diag = 0                           # side(i - 1, j - 1)\n    for j in range(w):\n        up = side[j + 1]               # side(i - 1, j)\n        if grid[i][j] == "1":\n            cur = min(up, side[j], diag) + 1     # side[j] is already side(i, j - 1)\n        else:\n            cur = 0\n        diag = up\n        side[j + 1] = cur\n        best = max(best, cur)\nprint(best * best)' },
        'Why the minimum? A bigger square would need all three neighbours to be big too: if one neighbour can only reach a small square, then a hole is hiding near the corner. One row of the table plus one variable for the diagonal is enough, so the memory is O(w) and the time O(h * w).'
      ]
    },
    statement: ['A grid of `0` and `1` characters is given. Print the area (the number of cells) of the largest square that contains only `1`s, or 0 if there is no `1`.'],
    outputFormat: ['Print the area of the largest square of ones.'],
    examples: [{ input: '4 5\n10100\n10111\n11111\n10010\n', note: 'The largest all-ones square has the side 2: area 4.' }, { input: '2 2\n00\n00\n', note: 'No ones: 0.' }],
    hints: ['Let side(i, j) be the side of the largest all-ones square whose bottom right corner is (i, j).', 'It is 0 for a 0; for a 1 it is one more than the smallest of the three neighbours above and to the left.', 'Print the square of the largest side.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        side = [0] * (w + 1)
        best = 0
        for i in range(h):
            row = grid[i]
            diag = 0
            for j in range(w):
                up = side[j + 1]
                if row[j] == "1":
                    cur = min(up, side[j], diag) + 1
                else:
                    cur = 0
                diag = up
                side[j + 1] = cur
                if cur > best:
                    best = cur
        print(best * best)`,
      cpp: r`
        vector<int> side(w + 1, 0);
        long long best = 0;
        for (int i = 0; i < h; i++) {
            int diag = 0;
            for (int j = 0; j < w; j++) {
                int up = side[j + 1];
                int cur = 0;
                if (grid[i][j] == '1') cur = min(min(up, side[j]), diag) + 1;
                diag = up;
                side[j + 1] = cur;
                if (cur > best) best = cur;
            }
        }
        cout << best * best << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        int[] side = new int[colsCount + 1];
        long best = 0;
        for (int i = 0; i < rowsCount; i++) {
            int diag = 0;
            for (int j = 0; j < colsCount; j++) {
                int up = side[j + 1];
                int cur = 0;
                if (grid[i].charAt(j) == '1') cur = Math.min(Math.min(up, side[j]), diag) + 1;
                diag = up;
                side[j + 1] = cur;
                if (cur > best) best = cur;
            }
        }
        System.out.println(best * best);`
    },
    solution: { explanation: ['side(i, j) = 1 + the smallest of the sides at (i - 1, j), (i, j - 1) and (i - 1, j - 1) for a 1 (and 0 for a 0) is the side of the largest all-ones square whose bottom right corner is the cell; the answer is the square of the largest side, computed with one row and a diagonal variable.'], complexity: 'Time O(h * w), space O(w).' },
    solve(input) {
      const { h, w, g } = parseGrid(input); const t = Array.from({ length: h }, () => new Array(w).fill(0)); let best = 0; for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) { if (g[i][j] !== '1') continue; t[i][j] = i && j ? 1 + Math.min(t[i - 1][j], t[i][j - 1], t[i - 1][j - 1]) : 1; best = Math.max(best, t[i][j]); } return String(best * best);
    },
    tests() {
      const g = rng(2018); const out = ['4 5\n10100\n10111\n11111\n10010\n', '2 2\n00\n00\n', '1 1\n1\n', '1 1\n0\n', '3 3\n111\n111\n111\n'];
      const make = (h, w, p) => gridText(many(h, () => many(w, () => (g() < p ? '1' : '0')).join('')));
      const brute = (input) => { const { h, w, g: grid } = parseGrid(input); let best = 0; for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) for (let s = 1; i + s <= h && j + s <= w; s++) { let ok = true; for (let a = 0; a < s && ok; a++) for (let b = 0; b < s; b++) if (grid[i + a][j + b] !== '1') { ok = false; break; } if (ok) best = Math.max(best, s); } return String(best * best); };
      crossCheck(() => make(randInt(g, 1, 8), randInt(g, 1, 8), 0.7), (i) => this.solve(i), brute, 300);
      for (const [h, w, p] of [[10, 10, 0.8], [50, 50, 0.9], [100, 100, 0.95], [300, 300, 0.99], [500, 500, 0.999], [800, 800, 0.9999], [800, 800, 0.5], [1, 800, 0.9], [800, 1, 0.9], [2, 800, 0.99], [800, 2, 0.99]]) out.push(make(h, w, p));
      out.push(gridText(many(800, () => '1'.repeat(800))), gridText(many(800, () => '0'.repeat(800))), gridText(many(800, (i) => '1'.repeat(800).split('').map((c, j) => ((i + j) % 2 ? '0' : '1')).join(''))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['One line with two numbers `n` and `k`.'],
    constraints: ['1 <= n <= 1500', '0 <= k <= 800'],
    slug: 'sparse-binary-strings',
    title: 'Binary Strings With k Ones and No Two Ones Side by Side',
    tags: ['dp', 'counting', 'strings', 'two-dimensional'],
    concept: {
      title: 'Count the strings by two things at once: how many ones are used, and how the string ends',
      body: [
        'Count the binary strings of length `n` that contain **exactly `k` ones** and in which **no two ones are neighbours**. For `n = 4` and `k = 2` the strings are `1010`, `1001` and `0101`: 3. For `n = 3` and `k = 2` only `101` works: 1. If `k` is too big for the length, the answer is 0. Print the count modulo 1 000 000 007.',
        'Build the string from left to right. To decide whether the next character may be a `1`, we need to know **how the string ends** (a `1` may follow only a `0` or the empty string), and to know whether we have reached `k` we need **how many ones are used**. So the state is `(ones used, last character)`. Keep two arrays indexed by the number of ones: `zero[j]` is the number of strings that end with `0` (or are empty) and have `j` ones, and `one[j]` the number of strings that end with `1` and have `j` ones. Adding a character: a `0` can follow any string, so **`new_zero[j] = zero[j] + one[j]`**; a `1` can follow only a string ending with `0`, and uses one more one, so **`new_one[j] = zero[j - 1]`**.',
        { code: 'zero = [1] + [0] * k                 # the empty string: no ones, "ends with 0"\none = [0] * (k + 1)\nfor _ in range(n):\n    new_zero = [(zero[j] + one[j]) % MOD for j in range(k + 1)]\n    new_one = [0] + [zero[j - 1] for j in range(1, k + 1)]\n    zero, one = new_zero, new_one\nprint((zero[k] + one[k]) % MOD)' },
        'There are `n` rounds and `k + 1` values in each, so the time is O(n * k), about a million steps, and the memory O(k). The two-dimensional table (position and number of ones) is the usual way to count objects that have a size and a shape rule; the answer here also has a closed form with a binomial coefficient, `C(n - k + 1, k)`, but the table works for rules that have no formula.'
      ]
    },
    statement: ['Count the binary strings of length `n` that contain exactly `k` characters `1` and in which no two `1` are next to each other. Print the count modulo 1000000007.'],
    outputFormat: ['Print the number of strings modulo 1000000007.'],
    examples: [{ input: '4 2\n', note: 'The strings 1010, 1001 and 0101: 3.' }, { input: '3 2\n', note: 'Only 101: 1.' }],
    hints: ['Keep two arrays indexed by the number of ones: strings that end with 0 and strings that end with 1.', 'A 0 can follow any string; a 1 can follow only a string that ends with 0.', 'The answer is the sum of both arrays at the index k after n characters.'],
    program: {
      io: ['n:int k:int'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        zero = [1] + [0] * k
        one = [0] * (k + 1)
        for _ in range(n):
            new_zero = [(zero[j] + one[j]) % MOD for j in range(k + 1)]
            new_one = [0] + [zero[j - 1] for j in range(1, k + 1)]
            zero, one = new_zero, new_one
        print((zero[k] + one[k]) % MOD)`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<long long> zero(k + 1, 0), one(k + 1, 0), newZero(k + 1), newOne(k + 1);
        zero[0] = 1;
        for (long long step = 0; step < n; step++) {
            for (long long j = 0; j <= k; j++) {
                newZero[j] = (zero[j] + one[j]) % MOD;
                newOne[j] = j > 0 ? zero[j - 1] : 0;
            }
            zero = newZero;
            one = newOne;
        }
        cout << (zero[k] + one[k]) % MOD << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int ones = (int) k;
        long[] zero = new long[ones + 1];
        long[] one = new long[ones + 1];
        long[] newZero = new long[ones + 1];
        long[] newOne = new long[ones + 1];
        zero[0] = 1;
        for (long step = 0; step < n; step++) {
            for (int j = 0; j <= ones; j++) {
                newZero[j] = (zero[j] + one[j]) % MOD;
                newOne[j] = j > 0 ? zero[j - 1] : 0;
            }
            long[] swapZero = zero;
            zero = newZero;
            newZero = swapZero;
            long[] swapOne = one;
            one = newOne;
            newOne = swapOne;
        }
        System.out.println((zero[ones] + one[ones]) % MOD);`
    },
    solution: { explanation: ['zero[j] and one[j] count the strings with j ones that end with 0 (or are empty) and with 1; adding a character gives new_zero[j] = zero[j] + one[j] and new_one[j] = zero[j - 1]. After n characters the answer is zero[k] + one[k], modulo 1000000007.'], complexity: 'Time O(n * k), space O(k).' },
    solve(input) {
      const [n, k] = nums(input); // the closed form C(n - k + 1, k) with exact big integers
      if (n - k + 1 < k) return '0'; let c = 1n; const top = BigInt(n - k + 1); for (let i = 0n; i < BigInt(k); i++) c = c * (top - i) / (i + 1n); return String(c % MODN);
    },
    tests() {
      const out = ['4 2\n', '3 2\n', '1 0\n', '1 1\n', '2 1\n', '5 0\n'];
      const brute = (n, k) => { let count = 0; for (let mask = 0; mask < (1 << n); mask++) { let ones = 0; for (let i = 0; i < n; i++) ones += mask >> i & 1; if (ones === k && !(mask & (mask >> 1))) count++; } return count; };
      for (let n = 1; n <= 12; n++) for (let k = 0; k <= 7; k++) if (String(this.solve(`${n} ${k}\n`)) !== String(brute(n, k))) throw new Error('reference differs from brute force for ' + n + ' ' + k);
      for (const [n, k] of [[10, 3], [20, 7], [50, 20], [100, 50], [100, 51], [500, 100], [1000, 300], [1500, 0], [1500, 1], [1500, 100], [1500, 500], [1500, 700], [1500, 750], [1500, 751], [1500, 800], [1499, 750], [1499, 749], [1000, 500], [1000, 501]]) out.push(`${n} ${k}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `q`: the number of questions.', 'The second line has `q` numbers `n`.'],
    constraints: ['1 <= q <= 5000', '1 <= n <= 12000'],
    slug: 'ugly-numbers',
    title: 'Numbers With Only the Prime Factors 2, 3 and 5',
    tags: ['dp', 'three-pointers', 'sequence'],
    concept: {
      title: 'Every new number is an old number times 2, 3 or 5: keep three pointers into the list',
      body: [
        'Call a positive integer *ugly* if its only prime factors are 2, 3 and 5. The ugly numbers in order are `1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, ...` (1 is counted as ugly). For each question `n`, print the `n`-th ugly number. For `n = 10` it is 12. The numbers grow quickly: the 12 000-th is about 4 * 10^18.',
        'Checking every integer is hopeless, because the ugly numbers become very rare. Instead **build them in order**. Every ugly number except 1 is a smaller ugly number multiplied by 2, 3 or 5. So the next ugly number is the smallest of `ugly[i2] * 2`, `ugly[i3] * 3` and `ugly[i5] * 5`, where `i2`, `i3`, `i5` point to the **first ugly number whose multiple by 2 (3, 5) has not been used yet**.',
        { code: 'ugly = [1]\ni2 = i3 = i5 = 0\nwhile len(ugly) < limit:\n    nxt = min(ugly[i2] * 2, ugly[i3] * 3, ugly[i5] * 5)\n    ugly.append(nxt)\n    if nxt == ugly[i2] * 2: i2 += 1       # use "if" three times (not elif): 6 = 2*3 = 3*2 moves both pointers\n    if nxt == ugly[i3] * 3: i3 += 1\n    if nxt == ugly[i5] * 5: i5 += 1' },
        'The three `if` statements are separate on purpose: a number such as 6 is both `2 * 3` and `3 * 2`, and if only one pointer moved, 6 would be added twice. The list is built once up to the largest question, in O(max n) time, and every question is a lookup. This "merge of three sorted streams" is a DP in disguise: the answer for position `k` depends on three earlier positions.'
      ]
    },
    statement: ['A positive integer is ugly if it has no prime factor other than 2, 3 and 5 (the number 1 is ugly). For each of the `q` given numbers `n`, print the `n`-th ugly number in increasing order (the first one is 1).'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces: the answers in the order of the questions.'],
    examples: [{ input: '3\n1 10 15\n', note: 'The sequence is 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24: the 1st is 1, the 10th is 12, the 15th is 24.' }],
    hints: ['Each ugly number is a smaller ugly number times 2, 3 or 5.', 'Keep three pointers: the next candidates are ugly[i2] * 2, ugly[i3] * 3 and ugly[i5] * 5.', 'After taking the smallest candidate, move every pointer whose candidate equals it.'],
    program: {
      io: ['q:int', 'queries:int[q]'],
      fast: true,
      python: r`
        limit = max(queries)
        ugly = [1] * limit
        i2 = i3 = i5 = 0
        for k in range(1, limit):
            nxt = min(ugly[i2] * 2, ugly[i3] * 3, ugly[i5] * 5)
            ugly[k] = nxt
            if nxt == ugly[i2] * 2:
                i2 += 1
            if nxt == ugly[i3] * 3:
                i3 += 1
            if nxt == ugly[i5] * 5:
                i5 += 1
        print(*[ugly[n - 1] for n in queries])`,
      cpp: r`
        long long limit = *max_element(queries.begin(), queries.end());
        vector<long long> ugly(limit, 1);
        long long i2 = 0, i3 = 0, i5 = 0;
        for (long long k = 1; k < limit; k++) {
            long long nxt = min(ugly[i2] * 2, min(ugly[i3] * 3, ugly[i5] * 5));
            ugly[k] = nxt;
            if (nxt == ugly[i2] * 2) i2++;
            if (nxt == ugly[i3] * 3) i3++;
            if (nxt == ugly[i5] * 5) i5++;
        }
        for (long long i = 0; i < q; i++) cout << (i ? " " : "") << ugly[queries[i] - 1];
        cout << "\n";`,
      java: r`
        int limit = 0;
        for (long x : queries) limit = Math.max(limit, (int) x);
        long[] ugly = new long[limit];
        ugly[0] = 1;
        int i2 = 0, i3 = 0, i5 = 0;
        for (int k = 1; k < limit; k++) {
            long nxt = Math.min(ugly[i2] * 2, Math.min(ugly[i3] * 3, ugly[i5] * 5));
            ugly[k] = nxt;
            if (nxt == ugly[i2] * 2) i2++;
            if (nxt == ugly[i3] * 3) i3++;
            if (nxt == ugly[i5] * 5) i5++;
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) out.append(i > 0 ? " " : "").append(ugly[(int) queries[i] - 1]);
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The ugly numbers are built in order: the next one is the smallest of ugly[i2] * 2, ugly[i3] * 3 and ugly[i5] * 5, and every pointer whose product equals the chosen number moves on. The list is built once up to the largest question.'], complexity: 'Time O(M + q) where M is the largest n, space O(M).' },
    solve(input) {
      const rs = rows(input); const ns = nums(rs[1]); const limit = Math.max(...ns); // a different method: a sorted set of products, always taking the smallest unused one
      const seen = new Set([1n]); const heap = [1n]; const out = []; const pop = () => { let bi = 0; for (let i = 1; i < heap.length; i++) if (heap[i] < heap[bi]) bi = i; return heap.splice(bi, 1)[0]; };
      const sorted = []; if (limit <= 3000) { while (sorted.length < limit) { const x = pop(); sorted.push(x); for (const f of [2n, 3n, 5n]) if (!seen.has(x * f)) { seen.add(x * f); heap.push(x * f); } } return ns.map((n) => String(sorted[n - 1])).join(' '); }
      const u = [1n]; let i2 = 0, i3 = 0, i5 = 0; while (u.length < limit) { const a = u[i2] * 2n, b = u[i3] * 3n, c = u[i5] * 5n; const m = a < b ? (a < c ? a : c) : (b < c ? b : c); u.push(m); if (m === a) i2++; if (m === b) i3++; if (m === c) i5++; } return ns.map((n) => String(u[n - 1])).join(' ');
    },
    tests() {
      const g = rng(2020); const out = ['3\n1 10 15\n', '1\n1\n', '1\n12000\n', '5\n2 3 4 5 6\n'];
      const isUgly = (x) => { for (const p of [2n, 3n, 5n]) while (x % p === 0n) x /= p; return x === 1n; };
      const brute = (input) => { const rs = rows(input); const ns = nums(rs[1]); const list = []; for (let x = 1n; list.length < 150; x++) if (isUgly(x)) list.push(x); return ns.map((n) => String(list[n - 1])).join(' '); };
      crossCheck(() => { const q = randInt(g, 1, 6); return `${q}\n${randArray(g, q, 1, 150).join(' ')}\n`; }, (i) => this.solve(i), brute, 200);
      const make = (q, hi) => `${q}\n${randArray(g, q, 1, hi).join(' ')}\n`;
      for (const [q, hi] of [[10, 100], [100, 1000], [1000, 12000], [5000, 12000], [5000, 12000], [5000, 12000], [5000, 50], [5000, 11999]]) out.push(make(q, hi));
      out.push(`5000\n${many(5000, (i) => 12000 - (i % 100)).join(' ')}\n`, `5000\n${many(5000, (i) => i + 1).join(' ')}\n`);
      return out;
    }
  }
];
