import { r, rng, randInt, randArray, many, arr, nums, rows, mat, parseGrid, randGrid } from '../../lib.mjs';

const showGrid = (g) => g.map((row) => row.join(' ')).join('\n');

export default [
  {
    slug: 'rotate-matrix',
    title: 'Rotate the Matrix',
    difficulty: 'medium',
    tags: ['matrix', '2d-arrays', 'indexes'],
    concept: {
      title: 'Where does a cell go?',
      body: [
        'To rotate a square matrix by 90 degrees **clockwise**, ask where the cell at row `i`, column `j` ends up. The first row becomes the last column, the second row the second to last column, and so on. A cell `(i, j)` moves to `(j, n - 1 - i)`.',
        { code: 'res = [[0] * n for _ in range(n)]\nfor i in range(n):\n    for j in range(n):\n        res[j][n - 1 - i] = g[i][j]' },
        'Working out the destination formula for one cell is the whole trick. Check it with the corners: the top left cell `(0, 0)` must land at the top right `(0, n - 1)`.'
      ]
    },
    statement: ['Rotate a square matrix of size `n` by 90 degrees clockwise and print the result.'],
    inputFormat: ['The first line has `n`.', 'The next `n` lines have `n` integers each.'],
    outputFormat: ['Print the rotated matrix, `n` lines with `n` integers each.'],
    constraints: ['1 <= n <= 100', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '3\n1 2 3\n4 5 6\n7 8 9\n', note: 'The first column read from the bottom, 7 4 1, becomes the first row.' }],
    hints: ['Find the new position of the cell in row i and column j.', 'The first row becomes the last column, so `(i, j)` goes to `(j, n - 1 - i)`.', 'Fill a second matrix with a double loop and print it.'],
    program: {
      io: ['n:int', 'g:int[n][n]'],
      python: r`
        res = [[0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                res[j][n - 1 - i] = g[i][j]
        for row in res:
            print(*row)`,
      cpp: r`
        vector<vector<long long>> res(n, vector<long long>(n));
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) res[j][n - 1 - i] = g[i][j];
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) cout << res[i][j] << (j + 1 < n ? " " : "\n");
        }`,
      java: r`
        int m = (int) n;
        long[][] res = new long[m][m];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < m; j++) res[j][m - 1 - i] = g[i][j];
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < m; j++) sb.append(res[i][j]).append(j + 1 < m ? " " : "\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['The cell in row `i`, column `j` moves to row `j`, column `n - 1 - i`. A double loop copies every cell to its new place.'], complexity: 'Time O(n^2), space O(n^2).' },
    solve(input) { const rs = rows(input); const n = Number(rs[0]); const g = rs.slice(1, 1 + n).map(nums); const res = Array.from({ length: n }, () => Array(n).fill(0)); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) res[j][n - 1 - i] = g[i][j]; return showGrid(res); },
    tests() { const g = rng(181); const sq = (n, lo, hi) => `${n}\n` + mat(Array.from({ length: n }, () => randArray(g, n, lo, hi))); return ['3\n1 2 3\n4 5 6\n7 8 9\n', '1\n5\n', '2\n1 2\n3 4\n', sq(4, -9, 9), sq(7, -100, 100), sq(100, -1000000000, 1000000000), sq(99, 0, 50)]; }
  },

  {
    slug: 'spiral-order',
    title: 'Spiral Order',
    difficulty: 'medium',
    tags: ['matrix', '2d-arrays', 'simulation'],
    concept: {
      title: 'Four shrinking walls',
      body: [
        'To read a matrix in a spiral, keep the four borders of the part not yet read: `top`, `bottom`, `left`, `right`. Read the top row from left to right and move `top` down; read the right column from top to bottom and move `right` left; read the bottom row backwards and move `bottom` up; read the left column upwards and move `left` right. Repeat while the part is not empty.',
        { code: 'while top <= bottom and left <= right:\n    # top row, then right column\n    # if top <= bottom: bottom row backwards\n    # if left <= right: left column upwards' },
        'The two extra `if` checks are needed for the last turn: when only one row or one column is left, reading it "backwards" would read the same cells a second time.'
      ]
    },
    statement: ['Print all elements of a matrix with `n` rows and `m` columns in spiral order: start at the top left cell, go right along the first row, then down the last column, then left along the last row, then up the first column, and continue inwards.'],
    inputFormat: ['The first line has `n` and `m`.', 'The next `n` lines have `m` integers each.'],
    outputFormat: ['Print the `n * m` elements on one line.'],
    constraints: ['1 <= n, m <= 100', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n', note: 'The spiral is 1 2 3 4 8 12 11 10 9 5 6 7.' }],
    hints: ['Keep four borders: top, bottom, left, right.', 'Read one side, then move that border inwards.', 'Before reading the bottom row and the left column, check that rows or columns are still left.'],
    program: {
      io: ['n:int m:int', 'g:int[n][m]'],
      python: r`
        top, bottom, left, right = 0, n - 1, 0, m - 1
        out = []
        while top <= bottom and left <= right:
            for j in range(left, right + 1):
                out.append(g[top][j])
            top += 1
            for i in range(top, bottom + 1):
                out.append(g[i][right])
            right -= 1
            if top <= bottom:
                for j in range(right, left - 1, -1):
                    out.append(g[bottom][j])
                bottom -= 1
            if left <= right:
                for i in range(bottom, top - 1, -1):
                    out.append(g[i][left])
                left += 1
        print(*out)`,
      cpp: r`
        int top = 0, bottom = n - 1, left = 0, right = m - 1;
        vector<long long> out;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) out.push_back(g[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) out.push_back(g[i][right]);
            right--;
            if (top <= bottom) {
                for (int j = right; j >= left; j--) out.push_back(g[bottom][j]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) out.push_back(g[i][left]);
                left++;
            }
        }
        for (size_t k = 0; k < out.size(); k++) cout << out[k] << (k + 1 < out.size() ? " " : "\n");`,
      java: r`
        int top = 0, bottom = (int) n - 1, left = 0, right = (int) m - 1;
        StringBuilder sb = new StringBuilder();
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) sb.append(g[top][j]).append(" ");
            top++;
            for (int i = top; i <= bottom; i++) sb.append(g[i][right]).append(" ");
            right--;
            if (top <= bottom) {
                for (int j = right; j >= left; j--) sb.append(g[bottom][j]).append(" ");
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) sb.append(g[i][left]).append(" ");
                left++;
            }
        }
        System.out.println(sb.toString().trim());`
    },
    solution: { explanation: ['The four borders mark what is still unread. Each pass reads the outer ring and moves the borders inwards.'], complexity: 'Time O(n * m), space O(1) besides the output.' },
    solve(input) { const { n, m, g } = parseGrid(input); let top = 0, bottom = n - 1, left = 0, right = m - 1; const out = []; while (top <= bottom && left <= right) { for (let j = left; j <= right; j++) out.push(g[top][j]); top++; for (let i = top; i <= bottom; i++) out.push(g[i][right]); right--; if (top <= bottom) { for (let j = right; j >= left; j--) out.push(g[bottom][j]); bottom--; } if (left <= right) { for (let i = bottom; i >= top; i--) out.push(g[i][left]); left++; } } return out.join(' '); },
    tests() { const g = rng(182); return ['3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n', '1 1\n5\n', '1 5\n1 2 3 4 5\n', '5 1\n1\n2\n3\n4\n5\n', '2 2\n1 2\n3 4\n', randGrid(g, 4, 4, -9, 9), randGrid(g, 7, 3, -9, 9), randGrid(g, 100, 100, -1000000000, 1000000000), randGrid(g, 3, 100, 0, 99), randGrid(g, 99, 98, 0, 99)]; }
  },

  {
    slug: 'set-matrix-zeroes',
    title: 'Set Matrix Zeroes',
    difficulty: 'medium',
    tags: ['matrix', '2d-arrays', 'marking'],
    concept: {
      title: 'Mark first, change later',
      body: [
        'If you set a row and a column to zero right when you see a zero, the new zeros fool the rest of the scan: you would zero out far too much. Instead do two phases. **Phase 1**: read the original matrix and record which rows and which columns contain a zero. **Phase 2**: zero every cell whose row or column is marked.',
        { code: 'rowZero = [False] * n\ncolZero = [False] * m\nfor i in range(n):\n    for j in range(m):\n        if g[i][j] == 0:\n            rowZero[i] = colZero[j] = True\nfor i in range(n):\n    for j in range(m):\n        if rowZero[i] or colZero[j]:\n            g[i][j] = 0' },
        'Separating "decide" from "change" is a general way to avoid mixing old and new values.'
      ]
    },
    statement: ['Given a matrix with `n` rows and `m` columns, set the whole row and the whole column of every cell that is 0 to 0. Decide based on the original matrix only. Print the new matrix.'],
    inputFormat: ['The first line has `n` and `m`.', 'The next `n` lines have `m` integers each.'],
    outputFormat: ['Print the matrix, `n` lines with `m` integers each.'],
    constraints: ['1 <= n, m <= 100', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '3 3\n1 1 1\n1 0 1\n1 1 1\n', note: 'The zero in the middle clears the second row and the second column.' }],
    hints: ['Do not change the matrix while you are still searching for zeros.', 'First note which rows and which columns contain a zero.', 'Then set to 0 every cell in a marked row or a marked column.'],
    program: {
      io: ['n:int m:int', 'g:int[n][m]'],
      python: r`
        rowZero = [False] * n
        colZero = [False] * m
        for i in range(n):
            for j in range(m):
                if g[i][j] == 0:
                    rowZero[i] = True
                    colZero[j] = True
        for i in range(n):
            out = []
            for j in range(m):
                out.append(0 if rowZero[i] or colZero[j] else g[i][j])
            print(*out)`,
      cpp: r`
        vector<bool> rowZero(n, false), colZero(m, false);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (g[i][j] == 0) {
                    rowZero[i] = true;
                    colZero[j] = true;
                }
            }
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                cout << (rowZero[i] || colZero[j] ? 0 : g[i][j]) << (j + 1 < m ? " " : "\n");
            }
        }`,
      java: r`
        boolean[] rowZero = new boolean[(int) n];
        boolean[] colZero = new boolean[(int) m];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (g[i][j] == 0) {
                    rowZero[i] = true;
                    colZero[j] = true;
                }
            }
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                sb.append(rowZero[i] || colZero[j] ? 0 : g[i][j]).append(j + 1 < m ? " " : "\n");
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['One scan marks the rows and columns that contain a zero in the original matrix; a second scan writes zeros into the marked rows and columns.'], complexity: 'Time O(n * m), space O(n + m).' },
    solve(input) { const { n, m, g } = parseGrid(input); const rz = Array(n).fill(false), cz = Array(m).fill(false); for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) if (g[i][j] === 0) { rz[i] = true; cz[j] = true; } return g.map((row, i) => row.map((v, j) => (rz[i] || cz[j] ? 0 : v)).join(' ')).join('\n'); },
    tests() { const g = rng(183); const sparse = (n, m, p) => `${n} ${m}\n` + mat(Array.from({ length: n }, () => many(m, () => (g() < p ? 0 : randInt(g, 1, 99))))); return ['3 3\n1 1 1\n1 0 1\n1 1 1\n', '1 1\n0\n', '1 1\n4\n', '2 3\n0 1 2\n3 4 5\n', '2 2\n1 2\n3 4\n', sparse(5, 6, 0.1), sparse(100, 100, 0.005), sparse(100, 100, 0), sparse(80, 100, 0.02)]; }
  },

  {
    slug: 'search-sorted-matrix',
    title: 'Search in a Sorted Matrix',
    difficulty: 'medium',
    tags: ['matrix', 'search', 'two-pointers'],
    concept: {
      title: 'Walk the staircase from a corner',
      body: [
        'In this matrix every row is sorted left to right and every column is sorted top to bottom. Start at the **top right** corner. If that cell is bigger than the target, everything below it in its column is bigger too, so the whole column can be dropped: move left. If it is smaller, everything to its left in its row is smaller, so the whole row can be dropped: move down.',
        { code: 'i, j = 0, m - 1\nwhile i < n and j >= 0:\n    if g[i][j] == x: found\n    elif g[i][j] > x: j -= 1\n    else: i += 1' },
        'Each step removes a whole row or column, so at most `n + m` cells are visited per search instead of `n * m`.'
      ]
    },
    statement: ['A matrix with `n` rows and `m` columns is sorted so that every row increases from left to right and every column increases from top to bottom. For each of `q` numbers, print `yes` if the matrix contains it and `no` otherwise.'],
    inputFormat: ['The first line has `n` and `m`.', 'The next `n` lines have `m` integers each.', 'Then a line with `q`, and a line with the `q` numbers to search.'],
    outputFormat: ['Print `q` lines, each `yes` or `no`.'],
    constraints: ['1 <= n, m <= 100', '1 <= q <= 2000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '3 3\n1 4 7\n2 5 8\n3 6 9\n3\n5 10 1\n', note: '5 and 1 are in the matrix, 10 is not.' }],
    hints: ['Start at the top right corner.', 'If the cell is larger than the target, move left; if smaller, move down.', 'Stop when you leave the matrix: the target is not there.'],
    program: {
      io: ['n:int m:int', 'g:int[n][m]', 'q:int', 'x:int[q]'],
      python: r`
        out = []
        for target in x:
            i, j = 0, m - 1
            found = False
            while i < n and j >= 0:
                if g[i][j] == target:
                    found = True
                    break
                if g[i][j] > target:
                    j -= 1
                else:
                    i += 1
            out.append("yes" if found else "no")
        print("\n".join(out))`,
      cpp: r`
        for (int k = 0; k < q; k++) {
            int i = 0, j = m - 1;
            bool found = false;
            while (i < n && j >= 0) {
                if (g[i][j] == x[k]) {
                    found = true;
                    break;
                }
                if (g[i][j] > x[k]) j--;
                else i++;
            }
            cout << (found ? "yes" : "no") << "\n";
        }`,
      java: r`
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < q; k++) {
            int i = 0, j = (int) m - 1;
            boolean found = false;
            while (i < n && j >= 0) {
                if (g[i][j] == x[k]) {
                    found = true;
                    break;
                }
                if (g[i][j] > x[k]) j--;
                else i++;
            }
            sb.append(found ? "yes" : "no").append("\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['From the top right corner, a larger cell removes its column and a smaller cell removes its row, so every search needs at most `n + m` steps.'], complexity: 'Time O(q * (n + m)), space O(1).' },
    solve(input) { const rs = rows(input); const [n, m] = nums(rs[0]); const g = rs.slice(1, 1 + n).map(nums); const set = new Set(g.flat()); return nums(rs[2 + n]).map((t) => (set.has(t) ? 'yes' : 'no')).join('\n'); },
    tests() {
      const g = rng(184);
      const make = (n, m, q, span) => { const grid = Array.from({ length: n }, () => Array(m).fill(0)); for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) grid[i][j] = (i + j) * span + randInt(g, 0, span - 1) + i * 3 + j * 5; for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { if (i > 0) grid[i][j] = Math.max(grid[i][j], grid[i - 1][j] + 1); if (j > 0) grid[i][j] = Math.max(grid[i][j], grid[i][j - 1] + 1); } const flat = grid.flat(); const qs = many(q, (k) => (k % 2 ? flat[randInt(g, 0, flat.length - 1)] : randInt(g, 0, flat[flat.length - 1] + 5))); return `${n} ${m}\n${mat(grid)}${q}\n${qs.join(' ')}\n`; };
      return ['3 3\n1 4 7\n2 5 8\n3 6 9\n3\n5 10 1\n', '1 1\n5\n2\n5 6\n', '1 4\n1 3 5 7\n3\n0 3 8\n', '4 1\n1\n3\n5\n7\n3\n3 4 7\n', make(5, 6, 20, 4), make(50, 60, 200, 10), make(100, 100, 2000, 1000), make(100, 100, 2000, 1), make(1, 100, 500, 7)];
    }
  },

  {
    slug: 'diagonal-traverse',
    title: 'Zigzag Over the Diagonals',
    difficulty: 'medium',
    tags: ['matrix', '2d-arrays', 'indexes'],
    concept: {
      title: 'Cells on one diagonal share i + j',
      body: [
        'All cells on one anti-diagonal (running from bottom left to top right) have the same sum `i + j`. The diagonals are numbered `s = 0, 1, ..., n + m - 2`. For a given `s` the valid rows `i` run from `max(0, s - m + 1)` to `min(n - 1, s)`, and the column is `s - i`.',
        { code: 'for s in range(n + m - 1):\n    cells = [(i, s - i) for i in range(max(0, s - m + 1), min(n - 1, s) + 1)]\n    if s % 2 == 0:\n        cells.reverse()      # even diagonals are read bottom-left to top-right\n    for i, j in cells:\n        out.append(g[i][j])' },
        'Going diagonal by diagonal, and only choosing the direction of each one, is much simpler than steering a pointer around the edges.'
      ]
    },
    statement: ['Print the elements of a matrix with `n` rows and `m` columns diagonal by diagonal, in a zigzag. Start with the top left cell. The next diagonal contains the cells `(0, 1)` and `(1, 0)` and is read from top to bottom, the one after it is read from bottom to top, and so on, alternating.'],
    inputFormat: ['The first line has `n` and `m`.', 'The next `n` lines have `m` integers each.'],
    outputFormat: ['Print the `n * m` elements on one line.'],
    constraints: ['1 <= n, m <= 100', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '3 3\n1 2 3\n4 5 6\n7 8 9\n', note: 'The order is 1, 2 4, 7 5 3, 6 8, 9.' }],
    hints: ['The cells of one diagonal have the same value of `i + j`.', 'For diagonal `s`, the row `i` goes from `max(0, s - m + 1)` to `min(n - 1, s)`.', 'Odd diagonals are read with `i` increasing, even diagonals with `i` decreasing.'],
    program: {
      io: ['n:int m:int', 'g:int[n][m]'],
      includes: ['<algorithm>'],
      python: r`
        out = []
        for s in range(n + m - 1):
            rowsOfDiagonal = list(range(max(0, s - m + 1), min(n - 1, s) + 1))
            if s % 2 == 0:
                rowsOfDiagonal.reverse()
            for i in rowsOfDiagonal:
                out.append(g[i][s - i])
        print(*out)`,
      cpp: r`
        vector<long long> out;
        for (int s = 0; s < n + m - 1; s++) {
            long long from = max(0LL, s - m + 1), to = min((long long) s, n - 1);
            if (s % 2 == 0) {
                for (long long i = to; i >= from; i--) out.push_back(g[i][s - i]);
            } else {
                for (long long i = from; i <= to; i++) out.push_back(g[i][s - i]);
            }
        }
        for (size_t k = 0; k < out.size(); k++) cout << out[k] << (k + 1 < out.size() ? " " : "\n");`,
      java: r`
        StringBuilder sb = new StringBuilder();
        for (int s = 0; s < n + m - 1; s++) {
            int from = Math.max(0, s - (int) m + 1), to = Math.min(s, (int) n - 1);
            if (s % 2 == 0) {
                for (int i = to; i >= from; i--) sb.append(g[i][s - i]).append(" ");
            } else {
                for (int i = from; i <= to; i++) sb.append(g[i][s - i]).append(" ");
            }
        }
        System.out.println(sb.toString().trim());`
    },
    solution: { explanation: ['Diagonal `s` holds the cells with `i + j = s`. Read its rows in increasing or decreasing order depending on whether `s` is odd or even.'], complexity: 'Time O(n * m), space O(1) besides the output.' },
    solve(input) { const { n, m, g } = parseGrid(input); const out = []; for (let s = 0; s < n + m - 1; s++) { const cells = []; for (let i = Math.max(0, s - m + 1); i <= Math.min(n - 1, s); i++) cells.push(g[i][s - i]); if (s % 2 === 0) cells.reverse(); out.push(...cells); } return out.join(' '); },
    tests() { const g = rng(185); return ['3 3\n1 2 3\n4 5 6\n7 8 9\n', '1 1\n5\n', '1 4\n1 2 3 4\n', '4 1\n1\n2\n3\n4\n', '2 3\n1 2 3\n4 5 6\n', randGrid(g, 5, 8, -9, 9), randGrid(g, 8, 5, -9, 9), randGrid(g, 100, 100, -1000000000, 1000000000), randGrid(g, 100, 3, 0, 99)]; }
  },

  {
    slug: 'game-of-life-step',
    title: 'One Step of the Game of Life',
    difficulty: 'medium',
    tags: ['matrix', 'simulation', 'neighbours'],
    concept: {
      title: 'Compute the new grid from the old one',
      body: [
        'In the Game of Life every cell is alive (1) or dead (0) and has up to 8 neighbours. All cells change **at the same time** depending on the old grid. So write the results into a second grid, never into the one you are still reading.',
        { code: 'for dx in (-1, 0, 1):\n    for dy in (-1, 0, 1):\n        if (dx, dy) != (0, 0) and 0 <= i + dx < n and 0 <= j + dy < m:\n            alive += g[i + dx][j + dy]' },
        'Check the borders before reading a neighbour: cells outside the grid count as dead. The rules: a live cell with 2 or 3 live neighbours stays alive, otherwise it dies; a dead cell with exactly 3 live neighbours becomes alive.'
      ]
    },
    statement: ['A grid with `n` rows and `m` columns contains 1 (alive) and 0 (dead). Compute the next generation. A live cell with 2 or 3 live neighbours stays alive, other live cells die. A dead cell with exactly 3 live neighbours becomes alive. Neighbours are the 8 surrounding cells; cells outside the grid are dead. Print the new grid.'],
    inputFormat: ['The first line has `n` and `m`.', 'The next `n` lines have `m` numbers (0 or 1) each.'],
    outputFormat: ['Print the next generation, `n` lines with `m` numbers each.'],
    constraints: ['1 <= n, m <= 100'],
    examples: [{ input: '3 3\n0 1 0\n0 1 0\n0 1 0\n', note: 'A vertical bar of three cells becomes a horizontal bar.' }],
    hints: ['Never modify the grid you are reading; build a new one.', 'Count the live cells among the 8 neighbours, skipping the ones outside the grid.', 'Apply the rules to decide the new value of each cell.'],
    program: {
      io: ['n:int m:int', 'g:int[n][m]'],
      python: r`
        for i in range(n):
            out = []
            for j in range(m):
                alive = 0
                for di in (-1, 0, 1):
                    for dj in (-1, 0, 1):
                        if (di != 0 or dj != 0) and 0 <= i + di < n and 0 <= j + dj < m:
                            alive += g[i + di][j + dj]
                if g[i][j] == 1:
                    out.append(1 if alive == 2 or alive == 3 else 0)
                else:
                    out.append(1 if alive == 3 else 0)
            print(*out)`,
      cpp: r`
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                int alive = 0;
                for (int di = -1; di <= 1; di++) {
                    for (int dj = -1; dj <= 1; dj++) {
                        if ((di != 0 || dj != 0) && i + di >= 0 && i + di < n && j + dj >= 0 && j + dj < m) {
                            alive += g[i + di][j + dj];
                        }
                    }
                }
                int next = g[i][j] == 1 ? (alive == 2 || alive == 3) : (alive == 3);
                cout << next << (j + 1 < m ? " " : "\n");
            }
        }`,
      java: r`
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                int alive = 0;
                for (int di = -1; di <= 1; di++) {
                    for (int dj = -1; dj <= 1; dj++) {
                        if ((di != 0 || dj != 0) && i + di >= 0 && i + di < n && j + dj >= 0 && j + dj < m) {
                            alive += g[i + di][j + dj];
                        }
                    }
                }
                int next = g[i][j] == 1 ? (alive == 2 || alive == 3 ? 1 : 0) : (alive == 3 ? 1 : 0);
                sb.append(next).append(j + 1 < m ? " " : "\n");
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['For each cell count the live neighbours in the old grid (with bounds checks) and apply the rules. The old grid is only read.'], complexity: 'Time O(8 * n * m), space O(1) besides the output.' },
    solve(input) { const { n, m, g } = parseGrid(input); const out = []; for (let i = 0; i < n; i++) { const row = []; for (let j = 0; j < m; j++) { let a = 0; for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) if ((di || dj) && i + di >= 0 && i + di < n && j + dj >= 0 && j + dj < m) a += g[i + di][j + dj]; row.push(g[i][j] ? (a === 2 || a === 3 ? 1 : 0) : (a === 3 ? 1 : 0)); } out.push(row.join(' ')); } return out.join('\n'); },
    tests() { const g = rng(186); return ['3 3\n0 1 0\n0 1 0\n0 1 0\n', '1 1\n1\n', '1 3\n1 1 1\n', '2 2\n1 1\n1 1\n', '3 3\n0 0 0\n0 0 0\n0 0 0\n', randGrid(g, 6, 6, 0, 1), randGrid(g, 10, 4, 0, 1), randGrid(g, 100, 100, 0, 1), randGrid(g, 100, 100, 0, 1), randGrid(g, 1, 100, 0, 1)]; }
  },

  {
    slug: 'submatrix-sum-queries',
    title: 'Sum of a Rectangle',
    difficulty: 'medium',
    tags: ['matrix', 'prefix-sum', 'queries'],
    concept: {
      title: 'Two-dimensional prefix sums',
      body: [
        'Let `p[i][j]` be the sum of all cells in the rectangle from the top left corner to row `i`, column `j`. It can be built with inclusion and exclusion: add the cell, add the rectangle above and the rectangle on the left, and subtract the part counted twice.',
        { code: 'p[i][j] = g[i-1][j-1] + p[i-1][j] + p[i][j-1] - p[i-1][j-1]' },
        'A query for the rectangle with corners `(r1, c1)` and `(r2, c2)` then takes the big prefix rectangle and removes the strips above and to the left, adding back the corner that was removed twice:',
        { code: 'p[r2][c2] - p[r1-1][c2] - p[r2][c1-1] + p[r1-1][c1-1]' }
      ]
    },
    statement: ['You are given a matrix with `n` rows and `m` columns and `q` queries. A query gives `r1 c1 r2 c2` (counting from 1): the sum of all cells in rows `r1..r2` and columns `c1..c2` is asked. Print the answer to each query.'],
    inputFormat: ['The first line has `n`, `m` and `q`.', 'The next `n` lines have `m` integers each.', 'Each of the next `q` lines has `r1 c1 r2 c2`.'],
    outputFormat: ['Print `q` lines, one answer per query.'],
    constraints: ['1 <= n, m <= 150', '1 <= q <= 20000', '1 <= r1 <= r2 <= n, 1 <= c1 <= c2 <= m', '-10^6 <= each number <= 10^6'],
    examples: [{ input: '3 3 2\n1 2 3\n4 5 6\n7 8 9\n1 1 3 3\n2 2 3 3\n', note: 'The whole matrix sums to 45; the lower right block 5 6 8 9 sums to 28.' }],
    hints: ['Build a table `p` with one extra row and column of zeros.', 'Each `p[i][j]` is the cell plus the prefix above, plus the prefix on the left, minus the corner counted twice.', 'A query is `p[r2][c2] - p[r1-1][c2] - p[r2][c1-1] + p[r1-1][c1-1]`.'],
    program: {
      io: ['n:int m:int q:int', 'g:int[n][m]', 'qs:int[q][4]'],
      fast: true,
      python: r`
        p = [[0] * (m + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                p[i][j] = g[i - 1][j - 1] + p[i - 1][j] + p[i][j - 1] - p[i - 1][j - 1]
        out = []
        for r1, c1, r2, c2 in qs:
            out.append(p[r2][c2] - p[r1 - 1][c2] - p[r2][c1 - 1] + p[r1 - 1][c1 - 1])
        print("\n".join(map(str, out)))`,
      cpp: r`
        vector<vector<long long>> p(n + 1, vector<long long>(m + 1, 0));
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                p[i][j] = g[i - 1][j - 1] + p[i - 1][j] + p[i][j - 1] - p[i - 1][j - 1];
            }
        }
        for (int k = 0; k < q; k++) {
            long long r1 = qs[k][0], c1 = qs[k][1], r2 = qs[k][2], c2 = qs[k][3];
            cout << p[r2][c2] - p[r1 - 1][c2] - p[r2][c1 - 1] + p[r1 - 1][c1 - 1] << "\n";
        }`,
      java: r`
        long[][] p = new long[(int) n + 1][(int) m + 1];
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                p[i][j] = g[i - 1][j - 1] + p[i - 1][j] + p[i][j - 1] - p[i - 1][j - 1];
            }
        }
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < q; k++) {
            int r1 = (int) qs[k][0], c1 = (int) qs[k][1], r2 = (int) qs[k][2], c2 = (int) qs[k][3];
            sb.append(p[r2][c2] - p[r1 - 1][c2] - p[r2][c1 - 1] + p[r1 - 1][c1 - 1]).append("\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['A table of 2-D prefix sums is built once. Every rectangle sum is then a combination of four table entries.'], complexity: 'Time O(n * m + q), space O(n * m).' },
    solve(input) { const rs = rows(input); const [n, m, q] = nums(rs[0]); const g = rs.slice(1, 1 + n).map(nums); const p = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0)); for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) p[i][j] = g[i - 1][j - 1] + p[i - 1][j] + p[i][j - 1] - p[i - 1][j - 1]; const out = []; for (let k = 0; k < q; k++) { const [r1, c1, r2, c2] = nums(rs[1 + n + k]); out.push(p[r2][c2] - p[r1 - 1][c2] - p[r2][c1 - 1] + p[r1 - 1][c1 - 1]); } return out.join('\n'); },
    tests() {
      const g = rng(187);
      const make = (n, m, q, lo, hi) => { let s = `${n} ${m} ${q}\n${mat(Array.from({ length: n }, () => randArray(g, m, lo, hi)))}`; for (let k = 0; k < q; k++) { const r1 = randInt(g, 1, n), c1 = randInt(g, 1, m); s += `${r1} ${c1} ${randInt(g, r1, n)} ${randInt(g, c1, m)}\n`; } return s; };
      return ['3 3 2\n1 2 3\n4 5 6\n7 8 9\n1 1 3 3\n2 2 3 3\n', '1 1 1\n-5\n1 1 1 1\n', make(4, 5, 10, -9, 9), make(30, 30, 100, -1000, 1000), make(150, 150, 20000, -1000000, 1000000), make(150, 150, 20000, 0, 1000000), make(1, 150, 500, -5, 5)];
    }
  }
];
