import { r, rng, randInt, randArray, many, nums, rows, shuffle } from '../../lib.mjs';

// Runs fast(input) against a slow, independent computation on many small random inputs; throws when they differ.
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const pairsText = (n, edges, extra = '') => `${n} ${edges.length}${extra}\n${edges.map((e) => e.join(' ')).join('\n')}${edges.length ? '\n' : ''}`;
const allPairs = (n) => { const e = []; for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) e.push([a, b]); return e; };
const VALID_GRIDS = []; // all 288 completed 4 by 4 sudoku boards, built when first needed

export default [
  {
    slug: 'n-queens-with-blocked-squares',
    title: 'Queens on a Board With Forbidden Squares',
    difficulty: 'medium',
    tags: ['backtracking', 'chessboard', 'pruning'],
    concept: {
      title: 'The same search, one more reason to skip a square',
      body: [
        'This is the classical queens search (one queen per row, three tables for the column and the two diagonals) with one change: some squares are **forbidden**, and no queen may stand there. In the loop over the columns of a row, a forbidden square is simply **skipped**, just like a square that is attacked.',
        { code: 'for col in range(n):\n    if board[row][col] == "#" or cols[col] or d1[row + col] or d2[row - col + n - 1]:\n        continue                        # forbidden or attacked' },
        'The forbidden squares do **not** block attacks: a queen still attacks along its lines through them. Constraints of this kind (a rule on every single choice) are what makes backtracking pay off: the more squares are forbidden, the more branches are cut, and the answer can well be 0. Remember the main shape: choose, mark, recurse, unmark.'
      ]
    },
    statement: ['A chessboard has `n` rows and `n` columns. Some squares are forbidden (`#`): no queen may be placed there. The other squares are free (`.`). Queens attack along rows, columns and diagonals (forbidden squares do not stop an attack). Count the ways to place `n` queens on free squares so that no two queens attack each other.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has `n` characters, `.` or `#`.'],
    outputFormat: ['Print the number of placements (it can be 0).'],
    constraints: ['1 <= n <= 10'],
    examples: [{ input: '4\n....\n....\n....\n....\n', note: 'With no forbidden squares the answer for n = 4 is 2.' }],
    hints: ['Place one queen in each row and choose its column.', 'Skip a column if the square is forbidden, or the column or a diagonal is already used.', 'Mark the column and the diagonals when you place a queen and clear them afterwards.'],
    program: {
      io: ['n:int', 'board:rows[n]'],
      helpers: {
        python: r`
          def place(n, row, board, cols, d1, d2):
              if row == n:
                  return 1
              total = 0
              for col in range(n):
                  if board[row][col] == "#" or cols[col] or d1[row + col] or d2[row - col + n - 1]:
                      continue
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = True
                  total += place(n, row + 1, board, cols, d1, d2)
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = False
              return total`,
        cpp: r`
          long long place(int n, int row, const vector<string>& board, vector<char>& cols, vector<char>& d1, vector<char>& d2) {
              if (row == n) return 1;
              long long total = 0;
              for (int col = 0; col < n; col++) {
                  if (board[row][col] == '#' || cols[col] || d1[row + col] || d2[row - col + n - 1]) continue;
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = 1;
                  total += place(n, row + 1, board, cols, d1, d2);
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = 0;
              }
              return total;
          }`,
        java: r`
          static long place(int n, int row, String[] board, boolean[] cols, boolean[] d1, boolean[] d2) {
              if (row == n) return 1;
              long total = 0;
              for (int col = 0; col < n; col++) {
                  if (board[row].charAt(col) == '#' || cols[col] || d1[row + col] || d2[row - col + n - 1]) continue;
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = true;
                  total += place(n, row + 1, board, cols, d1, d2);
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = false;
              }
              return total;
          }`
      },
      python: 'print(place(n, 0, board, [False] * n, [False] * (2 * n), [False] * (2 * n)))',
      cpp: r`
        vector<char> cols(n, 0), d1(2 * n, 0), d2(2 * n, 0);
        cout << place((int)n, 0, board, cols, d1, d2) << "\n";`,
      java: 'System.out.println(place((int) n, 0, board, new boolean[(int) n], new boolean[2 * (int) n], new boolean[2 * (int) n]));'
    },
    solution: { explanation: ['Row by row, a column is tried when the square is free and the column and both diagonals are unused. A placement of `n` queens is counted when the last row is filled.'], complexity: 'Time exponential, about 35 000 placements for an empty 10 by 10 board; space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const board = rs.slice(1, 1 + n); const pos = [];
      const attacks = (a, b) => a[1] === b[1] || Math.abs(a[0] - b[0]) === Math.abs(a[1] - b[1]);
      let count = 0; const go = (row) => { if (row === n) { count++; return; } for (let col = 0; col < n; col++) { if (board[row][col] === '#') continue; if (pos.some((p) => attacks(p, [row, col]))) continue; pos.push([row, col]); go(row + 1); pos.pop(); } };
      go(0); return String(count);
    },
    tests() {
      const g = rng(651);
      const make = (n, p) => { const m = many(n, () => many(n, () => (g() < p ? '#' : '.').toString())); return `${n}\n${m.map((x) => x.join('')).join('\n')}\n`; };
      return ['4\n....\n....\n....\n....\n', '1\n.\n', '1\n#\n', '4\n#...\n....\n....\n....\n', '5\n.....\n.....\n.....\n.....\n.....\n', make(6, 0.1), make(7, 0.1), make(8, 0.05), make(8, 0.15), make(9, 0.1), make(10, 0), make(10, 0.05), make(10, 0.2), make(9, 0.02)];
    }
  },

  {
    slug: 'first-n-queens-placement',
    title: 'The First Placement of n Queens',
    difficulty: 'medium',
    tags: ['backtracking', 'chessboard', 'dfs'],
    concept: {
      title: 'Stop at the first solution, and pass the success up',
      body: [
        'Sometimes you do not need all solutions, only **one**: here the smallest in dictionary order, where a placement is written as the list of the columns of the queens in rows 1 to `n`. A search that tries the columns from the smallest to the largest finds the solutions in exactly this order, so the **first** one found is the answer.',
        'To stop at the first success, the recursive function returns a boolean. When a call returns `True`, the caller does not unmark anything and returns `True` too, so the whole stack unwinds at once and the list `placed` still holds the answer.',
        { code: 'def first(n, row, cols, d1, d2, placed):\n    if row == n:\n        return True\n    for col in range(n):\n        if cols[col] or d1[row + col] or d2[row - col + n - 1]:\n            continue\n        cols[col] = d1[row + col] = d2[row - col + n - 1] = True\n        placed.append(col + 1)\n        if first(n, row + 1, cols, d1, d2, placed):\n            return True                       # found: keep everything as it is\n        placed.pop()\n        cols[col] = d1[row + col] = d2[row - col + n - 1] = False\n    return False' },
        'For `n = 2` and `n = 3` there is no solution, and the function returns `False` after trying everything. For larger `n`, finding the first solution is fast: it takes about 200 000 steps for `n = 20`, but much more for some larger `n` (a million steps for `n = 22`), which is why `n` is at most 21.'
      ]
    },
    statement: ['Place `n` queens on an `n` by `n` board so that no two attack each other. Describe a placement by the columns of the queens in rows 1, 2, ..., `n` (columns are numbered from 1). Print the placement that is the smallest in dictionary order (compare the column of row 1 first, then of row 2, and so on). If there is no placement, print `-1`.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['The `n` columns separated by spaces, or `-1`.'],
    constraints: ['1 <= n <= 21'],
    examples: [{ input: '6\n', note: 'The smallest placement is 2 4 6 1 3 5.' }],
    hints: ['Try the columns of every row from the smallest to the largest.', 'Make the recursive function return true as soon as all rows are filled.', 'When a call returns true, return true at once and do not undo anything.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def first(n, row, cols, d1, d2, placed):
              if row == n:
                  return True
              for col in range(n):
                  if cols[col] or d1[row + col] or d2[row - col + n - 1]:
                      continue
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = True
                  placed.append(col + 1)
                  if first(n, row + 1, cols, d1, d2, placed):
                      return True
                  placed.pop()
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = False
              return False`,
        cpp: r`
          bool first(int n, int row, vector<char>& cols, vector<char>& d1, vector<char>& d2, vector<int>& placed) {
              if (row == n) return true;
              for (int col = 0; col < n; col++) {
                  if (cols[col] || d1[row + col] || d2[row - col + n - 1]) continue;
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = 1;
                  placed.push_back(col + 1);
                  if (first(n, row + 1, cols, d1, d2, placed)) return true;
                  placed.pop_back();
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = 0;
              }
              return false;
          }`,
        java: r`
          static boolean first(int n, int row, boolean[] cols, boolean[] d1, boolean[] d2, List<Integer> placed) {
              if (row == n) return true;
              for (int col = 0; col < n; col++) {
                  if (cols[col] || d1[row + col] || d2[row - col + n - 1]) continue;
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = true;
                  placed.add(col + 1);
                  if (first(n, row + 1, cols, d1, d2, placed)) return true;
                  placed.remove(placed.size() - 1);
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = false;
              }
              return false;
          }`
      },
      python: r`
        placed = []
        if first(n, 0, [False] * n, [False] * (2 * n), [False] * (2 * n), placed):
            print(" ".join(map(str, placed)))
        else:
            print(-1)`,
      cpp: r`
        vector<char> cols(n, 0), d1(2 * n, 0), d2(2 * n, 0);
        vector<int> placed;
        if (first((int)n, 0, cols, d1, d2, placed)) {
            for (size_t i = 0; i < placed.size(); i++) cout << (i ? " " : "") << placed[i];
            cout << "\n";
        } else {
            cout << -1 << "\n";
        }`,
      java: r`
        List<Integer> placed = new ArrayList<>();
        if (first((int) n, 0, new boolean[(int) n], new boolean[2 * (int) n], new boolean[2 * (int) n], placed)) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < placed.size(); i++) sb.append(i > 0 ? " " : "").append(placed.get(i));
            System.out.println(sb);
        } else {
            System.out.println(-1);
        }`
    },
    solution: { explanation: ['The columns are tried in increasing order, so the first complete placement is the smallest. The function returns true all the way up as soon as the last row is filled, leaving the answer in `placed`.'], complexity: 'Time: about 200 000 steps for n = 20 and fewer for most other n; space O(n).' },
    solve(input) {
      const n = Number(rows(input)[0]); const cols = Array(n).fill(false), d1 = Array(2 * n).fill(false), d2 = Array(2 * n).fill(false); const placed = [];
      const go = (row) => { if (row === n) return true; for (let col = 0; col < n; col++) { if (cols[col] || d1[row + col] || d2[row - col + n - 1]) continue; cols[col] = d1[row + col] = d2[row - col + n - 1] = true; placed.push(col + 1); if (go(row + 1)) return true; placed.pop(); cols[col] = d1[row + col] = d2[row - col + n - 1] = false; } return false; };
      return go(0) ? placed.join(' ') : '-1';
    },
    tests() {
      const smallest = (n) => { let best = null; const cols = []; const go = (row) => { if (row === n) { const s = cols.map((c) => c + 1); if (best === null || s.join(',') < best.join(',')) best = s; return; } for (let col = 0; col < n; col++) if (cols.every((c, r2) => c !== col && Math.abs(c - col) !== row - r2)) { cols.push(col); go(row + 1); cols.pop(); } }; go(0); return best ? best.join(' ') : '-1'; };
      for (let n = 1; n <= 8; n++) { const have = this.solve(`${n}\n`); const want = smallest(n); if (n <= 7 ? have !== want : false) throw new Error('queens differ for ' + n); }
      return [6, 1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 14, 16, 18, 20, 21].map((n) => `${n}\n`);
    }
  },

  {
    slug: 'mini-sudoku-completions',
    title: 'Complete the Small Sudoku',
    difficulty: 'medium',
    tags: ['backtracking', 'sudoku', 'constraints'],
    concept: {
      title: 'Fill the empty cells in order, and check three rules for each digit',
      body: [
        'A small sudoku is a 4 by 4 board with digits 1 to 4. Every row, every column and each of the four 2 by 2 boxes must contain each digit exactly once. Some cells are given (digits 1 to 4) and the empty cells are `0`. The search walks over the cells in reading order. A given cell is simply checked; an empty cell tries the digits 1 to 4, and a digit is allowed if **no other cell of its row, column or box** already has it.',
        { code: 'def ok(grid, pos, d):\n    for j in range(16):\n        if j != pos and grid[j] == d:\n            same_row = j // 4 == pos // 4\n            same_col = j % 4 == pos % 4\n            same_box = j // 8 == pos // 8 and (j % 4) // 2 == (pos % 4) // 2\n            if same_row or same_col or same_box:\n                return False\n    return True' },
        'Because the check looks at **all** other cells (also the given ones that come later in the order), a digit that clashes with a later given is rejected at once, and a board whose given digits already clash with each other has no completion: the check of a given cell fails, and the count is 0. Cells that are filled by the search are set back to 0 afterwards (**unchoose**).'
      ]
    },
    statement: ['A 4 by 4 sudoku board is partly filled with the digits 1 to 4; an empty cell is written as `0`. A completed board has every digit 1 to 4 exactly once in every row, every column and every 2 by 2 box (the four boxes are formed by rows 1-2 and 3-4 and columns 1-2 and 3-4). Count the ways to fill the empty cells. If the given digits already clash, the answer is 0.'],
    inputFormat: ['4 lines with 4 characters each: the digits 0 to 4 without spaces.'],
    outputFormat: ['Print the number of completions.'],
    constraints: ['Every character is one of 0, 1, 2, 3, 4.'],
    examples: [{ input: '1000\n0000\n0000\n0000\n', note: 'With a single digit given, there are 288 / 4 = 72 completions.' }],
    hints: ['Number the cells 0 to 15 in reading order and solve cell by cell.', 'A digit is allowed if no other cell in the same row, column or box has it.', 'Check the given cells as well, so that contradictory givens give 0.'],
    program: {
      io: ['board:rows[4]'],
      helpers: {
        python: r`
          def ok(grid, pos, d):
              for j in range(16):
                  if j != pos and grid[j] == d:
                      if j // 4 == pos // 4 or j % 4 == pos % 4 or (j // 8 == pos // 8 and (j % 4) // 2 == (pos % 4) // 2):
                          return False
              return True

          def count(grid, pos):
              if pos == 16:
                  return 1
              if grid[pos] != 0:
                  return count(grid, pos + 1) if ok(grid, pos, grid[pos]) else 0
              total = 0
              for d in range(1, 5):
                  if ok(grid, pos, d):
                      grid[pos] = d
                      total += count(grid, pos + 1)
                      grid[pos] = 0
              return total`,
        cpp: r`
          bool ok(const vector<int>& grid, int pos, int d) {
              for (int j = 0; j < 16; j++) {
                  if (j != pos && grid[j] == d) {
                      if (j / 4 == pos / 4 || j % 4 == pos % 4 || (j / 8 == pos / 8 && (j % 4) / 2 == (pos % 4) / 2)) return false;
                  }
              }
              return true;
          }

          long long countFill(vector<int>& grid, int pos) {
              if (pos == 16) return 1;
              if (grid[pos] != 0) return ok(grid, pos, grid[pos]) ? countFill(grid, pos + 1) : 0;
              long long total = 0;
              for (int d = 1; d <= 4; d++) {
                  if (ok(grid, pos, d)) {
                      grid[pos] = d;
                      total += countFill(grid, pos + 1);
                      grid[pos] = 0;
                  }
              }
              return total;
          }`,
        java: r`
          static boolean ok(int[] grid, int pos, int d) {
              for (int j = 0; j < 16; j++) {
                  if (j != pos && grid[j] == d) {
                      if (j / 4 == pos / 4 || j % 4 == pos % 4 || (j / 8 == pos / 8 && (j % 4) / 2 == (pos % 4) / 2)) return false;
                  }
              }
              return true;
          }

          static long countFill(int[] grid, int pos) {
              if (pos == 16) return 1;
              if (grid[pos] != 0) return ok(grid, pos, grid[pos]) ? countFill(grid, pos + 1) : 0;
              long total = 0;
              for (int d = 1; d <= 4; d++) {
                  if (ok(grid, pos, d)) {
                      grid[pos] = d;
                      total += countFill(grid, pos + 1);
                      grid[pos] = 0;
                  }
              }
              return total;
          }`
      },
      python: r`
        grid = [int(ch) for row in board for ch in row]
        print(count(grid, 0))`,
      cpp: r`
        vector<int> grid;
        for (const string& row : board) {
            for (char ch : row) grid.push_back(ch - '0');
        }
        cout << countFill(grid, 0) << "\n";`,
      java: r`
        int[] grid = new int[16];
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) grid[i * 4 + j] = board[i].charAt(j) - '0';
        }
        System.out.println(countFill(grid, 0));`
    },
    solution: { explanation: ['The search handles the cells in reading order. A given cell is accepted only if it does not clash with any other cell; an empty cell tries 1 to 4 and recurses for each digit that does not clash, then clears the cell. Reaching the end counts one completion.'], complexity: 'Time tiny (at most a few hundred completions), space O(1).' },
    solve(input) {
      const given = rows(input).map((row) => [...row.trim()].map(Number)).flat();
      if (!VALID_GRIDS.length) {
        const rowsOk = (g) => { for (let i = 0; i < 4; i++) { const r2 = new Set(g.slice(i * 4, i * 4 + 4)); const c = new Set([0, 1, 2, 3].map((k) => g[k * 4 + i])); const b = new Set([0, 1, 4, 5].map((k) => g[(Math.floor(i / 2) * 2) * 4 + (i % 2) * 2 + k])); if (r2.size !== 4 || c.size !== 4 || b.size !== 4) return false; } return true; };
        const perms = []; const mk = (cur, left) => { if (!left.length) { perms.push(cur); return; } left.forEach((x, i) => mk([...cur, x], left.filter((_, k) => k !== i))); }; mk([], [1, 2, 3, 4]);
        for (const a of perms) for (const b of perms) for (const c of perms) for (const d of perms) { const g = [...a, ...b, ...c, ...d]; if (rowsOk(g)) VALID_GRIDS.push(g); }
      }
      return String(VALID_GRIDS.filter((g) => g.every((v, i) => given[i] === 0 || given[i] === v)).length);
    },
    tests() {
      const g = rng(652);
      const solved = ['1234', '3412', '2143', '4321'];
      const hide = (p) => solved.map((row) => [...row].map((ch) => (g() < p ? '0' : ch)).join('')).join('\n') + '\n';
      return ['1000\n0000\n0000\n0000\n', '0000\n0000\n0000\n0000\n', '1234\n3412\n2143\n4321\n', '1234\n3412\n2143\n4320\n', '1100\n0000\n0000\n0000\n', '1200\n0000\n0000\n0021\n', '1000\n0100\n0010\n0001\n', hide(0.3), hide(0.5), hide(0.7), hide(0.6), '1234\n0000\n0000\n0000\n', '1203\n0000\n0030\n0000\n', '4000\n0300\n0020\n0001\n'];
    }
  },

  {
    slug: 'graph-coloring-count',
    title: 'Colour the Map With k Colours',
    difficulty: 'medium',
    tags: ['backtracking', 'graph', 'coloring'],
    concept: {
      title: 'Colour the vertices one by one, checking only the earlier neighbours',
      body: [
        'Colour the `n` vertices of a graph with `k` colours so that **two vertices joined by an edge never get the same colour**. The search colours the vertices in the order 0, 1, 2, ... For vertex `v`, a colour is allowed if none of the neighbours **that are already coloured** (the ones with a smaller number) has it. Neighbours with a larger number will check against `v` later.',
        { code: 'def count(v):\n    if v == n:\n        return 1\n    total = 0\n    for c in range(k):\n        if all(color[u] != c for u in adj[v] if u < v):\n            color[v] = c\n            total += count(v + 1)\n    return total' },
        'The colours are **labelled** (colour 1 and colour 2 are different), so swapping two colours in a colouring gives another colouring. Note that `color[v]` is simply overwritten by the next try and needs no undo, because the later vertices only look at vertices with smaller numbers, which are always up to date. Without edges the answer is `k^n`, which is the largest case.'
      ]
    },
    statement: ['A graph has `n` vertices numbered 1 to `n` and `m` edges. Count the ways to colour every vertex with one of `k` colours so that the two ends of every edge have different colours. The colours are different from each other (swapping two colours gives a different colouring).'],
    inputFormat: ['The first line has `n`, `m` and `k`.', 'Each of the next `m` lines has two vertices joined by an edge.'],
    outputFormat: ['Print the number of colourings.'],
    constraints: ['1 <= n <= 9', '0 <= m <= n * (n - 1) / 2, no repeated edges and no loops', '1 <= k <= 4'],
    examples: [{ input: '3 3 3\n1 2\n2 3\n1 3\n', note: 'A triangle needs three different colours: 3 * 2 * 1 = 6 colourings.' }],
    hints: ['Colour the vertices in order 1, 2, ..., n.', 'A colour is allowed if no earlier neighbour has it.', 'You do not need to undo the colour of a vertex: the next try overwrites it.'],
    program: {
      io: ['n:int m:int k:int', 'edges:int[m][2]'],
      helpers: {
        python: r`
          def count(v, n, k, color, adj):
              if v == n:
                  return 1
              total = 0
              for c in range(k):
                  if all(color[u] != c for u in adj[v] if u < v):
                      color[v] = c
                      total += count(v + 1, n, k, color, adj)
              return total`,
        cpp: r`
          long long countColourings(int v, int n, int k, vector<int>& color, const vector<vector<int>>& adj) {
              if (v == n) return 1;
              long long total = 0;
              for (int c = 0; c < k; c++) {
                  bool ok = true;
                  for (int u : adj[v]) {
                      if (u < v && color[u] == c) ok = false;
                  }
                  if (ok) {
                      color[v] = c;
                      total += countColourings(v + 1, n, k, color, adj);
                  }
              }
              return total;
          }`,
        java: r`
          static long countColourings(int v, int n, int k, int[] color, List<List<Integer>> adj) {
              if (v == n) return 1;
              long total = 0;
              for (int c = 0; c < k; c++) {
                  boolean ok = true;
                  for (int u : adj.get(v)) {
                      if (u < v && color[u] == c) ok = false;
                  }
                  if (ok) {
                      color[v] = c;
                      total += countColourings(v + 1, n, k, color, adj);
                  }
              }
              return total;
          }`
      },
      python: r`
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a - 1].append(b - 1)
            adj[b - 1].append(a - 1)
        print(count(0, n, k, [0] * n, adj))`,
      cpp: r`
        vector<vector<int>> adj(n);
        for (int i = 0; i < m; i++) {
            adj[edges[i][0] - 1].push_back((int)edges[i][1] - 1);
            adj[edges[i][1] - 1].push_back((int)edges[i][0] - 1);
        }
        vector<int> color(n, 0);
        cout << countColourings(0, (int)n, (int)k, color, adj) << "\n";`,
      java: r`
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int i = 0; i < m; i++) {
            adj.get((int) edges[i][0] - 1).add((int) edges[i][1] - 1);
            adj.get((int) edges[i][1] - 1).add((int) edges[i][0] - 1);
        }
        System.out.println(countColourings(0, (int) n, (int) k, new int[(int) n], adj));`
    },
    solution: { explanation: ['Vertices are coloured in order; a colour is tried only when no earlier neighbour has it. Reaching vertex `n` completes a colouring. Overwriting `color[v]` replaces an undo step.'], complexity: 'Time O(k^n) in the worst case (no edges), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, m, k] = nums(rs[0]); const adj = Array.from({ length: n }, () => 0);
      for (let i = 1; i <= m; i++) { const [a, b] = nums(rs[i]); adj[a - 1] |= 1 << (b - 1); adj[b - 1] |= 1 << (a - 1); }
      // independent: count by the number of colour classes with a deletion-contraction free method: enumerate all colourings in base k
      let count = 0; const total = k ** n; for (let code = 0; code < total; code++) { const col = []; let x = code; for (let i = 0; i < n; i++) { col.push(x % k); x = Math.floor(x / k); } let ok = true; for (let i = 0; i < n && ok; i++) for (let j = i + 1; j < n; j++) if ((adj[i] >> j) & 1 && col[i] === col[j]) { ok = false; break; } if (ok) count++; }
      return String(count);
    },
    tests() {
      const g = rng(653);
      const some = (n, p) => allPairs(n).filter(() => g() < p);
      const make = (n, k, edges) => pairsText(n, edges, ` ${k}`);
      return ['3 3 3\n1 2\n2 3\n1 3\n', '1 0 1\n', '1 0 4\n', '2 1 1\n1 2\n', '2 1 2\n1 2\n', make(9, 4, []), make(8, 4, []), make(9, 4, some(9, 0.1)), make(9, 4, some(9, 0.25)), make(9, 3, some(9, 0.3)), make(9, 4, some(9, 0.5)), make(9, 2, some(9, 0.15)), make(9, 4, many(8, (i) => [i + 1, i + 2])), make(9, 3, allPairs(9)), make(7, 4, allPairs(7).filter(([a, b]) => (a + b) % 2 === 1))];
    }
  },

  {
    slug: 'hamiltonian-path-exists',
    title: 'A Walk That Visits Every Town Once',
    difficulty: 'medium',
    tags: ['backtracking', 'graph', 'hamiltonian'],
    concept: {
      title: 'Extend the path by an unvisited neighbour, undo if it gets stuck',
      body: [
        'A **Hamiltonian path** is a walk along the edges of a graph that visits every vertex **exactly once** (it may start and end anywhere). Nobody knows a fast method for large graphs, but for small graphs backtracking works well: start at a vertex, and extend the path by a neighbour that is not on the path yet.',
        { code: 'def extend(v, visited, count):          # count vertices are on the path, v is the last\n    if count == n:\n        return True                       # all vertices are on the path\n    for u in adj[v]:\n        if not visited[u]:\n            visited[u] = True\n            if extend(u, visited, count + 1):\n                return True\n            visited[u] = False            # this way did not work: go back\n    return False' },
        'Because the path may start anywhere, the search is run from **every** vertex. A branch is a dead end when the last vertex has no unvisited neighbour. The worst case is a graph with no path but a large well-connected part, where the search tries every way to walk through that part (at most 9 vertices here, so at most about 10^6 paths).'
      ]
    },
    statement: ['A graph has `n` towns and `m` two-way roads. Is there a walk that visits every town exactly once, using the roads (it can start and end in any towns)? Print `yes` or `no`.'],
    inputFormat: ['The first line has `n` and `m`.', 'Each of the next `m` lines has two towns joined by a road.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 9', '0 <= m <= n * (n - 1) / 2, no repeated roads and no loops'],
    examples: [{ input: '4 3\n1 2\n2 3\n3 4\n', note: 'The walk 1-2-3-4 visits every town once.' }],
    hints: ['Try every town as the start.', 'From the last town of the path, go to a neighbour that is not on the path.', 'If all towns are on the path, the answer is yes; otherwise undo the step and try the next neighbour.'],
    program: {
      io: ['n:int m:int', 'roads:int[m][2]'],
      helpers: {
        python: r`
          def extend(v, count, n, adj, visited):
              if count == n:
                  return True
              for u in adj[v]:
                  if not visited[u]:
                      visited[u] = True
                      if extend(u, count + 1, n, adj, visited):
                          return True
                      visited[u] = False
              return False`,
        cpp: r`
          bool extend(int v, int count, int n, const vector<vector<int>>& adj, vector<char>& visited) {
              if (count == n) return true;
              for (int u : adj[v]) {
                  if (!visited[u]) {
                      visited[u] = 1;
                      if (extend(u, count + 1, n, adj, visited)) return true;
                      visited[u] = 0;
                  }
              }
              return false;
          }`,
        java: r`
          static boolean extend(int v, int count, int n, List<List<Integer>> adj, boolean[] visited) {
              if (count == n) return true;
              for (int u : adj.get(v)) {
                  if (!visited[u]) {
                      visited[u] = true;
                      if (extend(u, count + 1, n, adj, visited)) return true;
                      visited[u] = false;
                  }
              }
              return false;
          }`
      },
      python: r`
        adj = [[] for _ in range(n)]
        for a, b in roads:
            adj[a - 1].append(b - 1)
            adj[b - 1].append(a - 1)
        found = False
        for s in range(n):
            visited = [False] * n
            visited[s] = True
            if extend(s, 1, n, adj, visited):
                found = True
                break
        print("yes" if found else "no")`,
      cpp: r`
        vector<vector<int>> adj(n);
        for (int i = 0; i < m; i++) {
            adj[roads[i][0] - 1].push_back((int)roads[i][1] - 1);
            adj[roads[i][1] - 1].push_back((int)roads[i][0] - 1);
        }
        bool found = false;
        for (int s = 0; s < n && !found; s++) {
            vector<char> visited(n, 0);
            visited[s] = 1;
            if (extend(s, 1, (int)n, adj, visited)) found = true;
        }
        cout << (found ? "yes" : "no") << "\n";`,
      java: r`
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int i = 0; i < m; i++) {
            adj.get((int) roads[i][0] - 1).add((int) roads[i][1] - 1);
            adj.get((int) roads[i][1] - 1).add((int) roads[i][0] - 1);
        }
        boolean found = false;
        for (int s = 0; s < n && !found; s++) {
            boolean[] visited = new boolean[(int) n];
            visited[s] = true;
            if (extend(s, 1, (int) n, adj, visited)) found = true;
        }
        System.out.println(found ? "yes" : "no");`
    },
    solution: { explanation: ['From every start, the path is extended by unvisited neighbours; the answer is yes as soon as all `n` towns are on the path, and a dead end is undone and another neighbour tried.'], complexity: 'Time O(n * n!) in the worst case, space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const adj = Array(n).fill(0);
      for (let i = 1; i <= m; i++) { const [a, b] = nums(rs[i]); adj[a - 1] |= 1 << (b - 1); adj[b - 1] |= 1 << (a - 1); }
      const reach = Array.from({ length: 1 << n }, () => Array(n).fill(false)); for (let v = 0; v < n; v++) reach[1 << v][v] = true;
      for (let mask = 1; mask < 1 << n; mask++) for (let v = 0; v < n; v++) if (reach[mask][v]) for (let u = 0; u < n; u++) if (!((mask >> u) & 1) && (adj[v] >> u) & 1) reach[mask | (1 << u)][u] = true;
      return reach[(1 << n) - 1].some(Boolean) ? 'yes' : 'no';
    },
    tests() {
      const g = rng(654);
      const some = (n, p) => allPairs(n).filter(() => g() < p);
      const make = (n, edges) => pairsText(n, edges);
      const noIsolated = (n) => allPairs(n - 1);
      return ['4 3\n1 2\n2 3\n3 4\n', '1 0\n', '2 0\n', '2 1\n1 2\n', '3 2\n1 2\n1 3\n', '4 3\n1 2\n1 3\n1 4\n', make(9, allPairs(9)), make(9, noIsolated(9)), make(9, some(9, 0.15)), make(9, some(9, 0.2)), make(9, some(9, 0.3)), make(9, [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]]), make(9, [...allPairs(8), [8, 9]].filter(([a, b], i, arr) => arr.findIndex((e) => e[0] === a && e[1] === b) === i)), make(9, [[1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9]]), make(8, noIsolated(8))];
    }
  },

  {
    slug: 'max-independent-set',
    title: 'The Largest Group of Strangers',
    difficulty: 'medium',
    tags: ['backtracking', 'graph', 'bitmask'],
    concept: {
      title: 'Branch on one vertex: leave it out, or take it and remove its neighbours',
      body: [
        'In a graph, an *independent set* is a set of vertices with **no edge between two of them** (a group of strangers). We want the largest one. Keep the set of vertices still available as a **bit mask** (bit `v` is 1 if `v` is available) and take the lowest available vertex `v`. There are two cases: `v` is **not** in the set, or `v` **is** in the set, and then `v` and all its neighbours are no longer available.',
        { code: 'def best(mask):\n    if mask == 0:\n        return 0\n    v = (mask & -mask).bit_length() - 1        # the lowest available vertex\n    rest = mask & ~(1 << v)\n    if adj[v] & rest == 0:\n        return 1 + best(rest)                  # no available neighbour: taking v is free\n    return max(best(rest), 1 + best(rest & ~adj[v]))' },
        'The line with `adj[v] & rest == 0` is a **reduction rule**: a vertex without available neighbours can always be taken, so no branching is needed. Without it, a graph with no edges would make the search try all `2^20` subsets. Bit masks make "remove the neighbours" a single operation, and the search stays fast for 20 vertices.'
      ]
    },
    statement: ['A graph has `n` vertices and `m` edges. A set of vertices is *independent* if no edge joins two of them. Print the size of the largest independent set.'],
    inputFormat: ['The first line has `n` and `m`.', 'Each of the next `m` lines has two vertices joined by an edge.'],
    outputFormat: ['Print the size.'],
    constraints: ['1 <= n <= 20', '0 <= m <= n * (n - 1) / 2, no repeated edges and no loops'],
    examples: [{ input: '5 4\n1 2\n2 3\n3 4\n4 5\n', note: 'A path of five vertices: the vertices 1, 3 and 5 are independent, and no set of four is.' }],
    hints: ['Keep the set of available vertices as a bit mask and take the lowest one.', 'Either skip it, or take it and remove it together with its neighbours from the mask.', 'If the vertex has no available neighbour, take it without branching.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      helpers: {
        python: r`
          def best(adj, mask):
              if mask == 0:
                  return 0
              v = (mask & -mask).bit_length() - 1
              rest = mask & ~(1 << v)
              if adj[v] & rest == 0:
                  return 1 + best(adj, rest)
              return max(best(adj, rest), 1 + best(adj, rest & ~adj[v]))`,
        cpp: r`
          int best(const vector<int>& adj, int mask) {
              if (mask == 0) return 0;
              int v = __builtin_ctz(mask);
              int rest = mask & ~(1 << v);
              if ((adj[v] & rest) == 0) return 1 + best(adj, rest);
              return max(best(adj, rest), 1 + best(adj, rest & ~adj[v]));
          }`,
        java: r`
          static int best(int[] adj, int mask) {
              if (mask == 0) return 0;
              int v = Integer.numberOfTrailingZeros(mask);
              int rest = mask & ~(1 << v);
              if ((adj[v] & rest) == 0) return 1 + best(adj, rest);
              return Math.max(best(adj, rest), 1 + best(adj, rest & ~adj[v]));
          }`
      },
      includes: ['<algorithm>'],
      python: r`
        adj = [0] * n
        for a, b in edges:
            adj[a - 1] |= 1 << (b - 1)
            adj[b - 1] |= 1 << (a - 1)
        print(best(adj, (1 << n) - 1))`,
      cpp: r`
        vector<int> adj(n, 0);
        for (int i = 0; i < m; i++) {
            adj[edges[i][0] - 1] |= 1 << (edges[i][1] - 1);
            adj[edges[i][1] - 1] |= 1 << (edges[i][0] - 1);
        }
        cout << best(adj, (1 << n) - 1) << "\n";`,
      java: r`
        int[] adj = new int[(int) n];
        for (int i = 0; i < m; i++) {
            adj[(int) edges[i][0] - 1] |= 1 << (edges[i][1] - 1);
            adj[(int) edges[i][1] - 1] |= 1 << (edges[i][0] - 1);
        }
        System.out.println(best(adj, (1 << (int) n) - 1));`
    },
    solution: { explanation: ['The recursion takes the lowest available vertex. A vertex with no available neighbour is taken at once; otherwise the search either skips it or takes it and removes its neighbours, and keeps the larger result.'], complexity: 'Time O(1.6^n) or better with the rule, space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const adj = Array(n).fill(0);
      for (let i = 1; i <= m; i++) { const [a, b] = nums(rs[i]); adj[a - 1] |= 1 << (b - 1); adj[b - 1] |= 1 << (a - 1); }
      let best = 0; for (let mask = 0; mask < 1 << n; mask++) { let size = 0, ok = true; for (let v = 0; v < n && ok; v++) if ((mask >> v) & 1) { size++; if (adj[v] & mask) ok = false; } if (ok) best = Math.max(best, size); }
      return String(best);
    },
    tests() {
      const g = rng(655);
      const some = (n, p) => allPairs(n).filter(() => g() < p);
      const make = (n, edges) => pairsText(n, edges);
      return ['5 4\n1 2\n2 3\n3 4\n4 5\n', '1 0\n', '2 1\n1 2\n', '3 3\n1 2\n2 3\n1 3\n', make(20, []), make(20, allPairs(20)), make(20, some(20, 0.1)), make(20, some(20, 0.15)), make(20, some(20, 0.2)), make(20, some(20, 0.3)), make(20, some(20, 0.5)), make(20, many(19, (i) => [i + 1, i + 2])), make(20, many(20, (i) => [i + 1, ((i + 1) % 20) + 1].sort((a, b) => a - b))), make(18, some(18, 0.12)), make(20, many(10, (i) => [2 * i + 1, 2 * i + 2]))];
    }
  },

  {
    slug: 'seating-without-enemy-neighbours',
    title: 'Seats in a Row Without Quarrels',
    difficulty: 'medium',
    tags: ['backtracking', 'permutations', 'pruning'],
    concept: {
      title: 'Check the new neighbour at the moment of seating',
      body: [
        '`n` people sit in a row, and some pairs of people are enemies: they must not sit **next to each other**. Count the ways to seat everybody. This is the permutation search, but with a rule about two **neighbouring** choices: a new person may be placed next to the last seated person only if they are not enemies.',
        { code: 'def count(last, used, placed):\n    if placed == n:\n        return 1\n    total = 0\n    for p in range(n):\n        if not used[p] and (last < 0 or not enemy[last][p]):\n            used[p] = True\n            total += count(p, used, placed + 1)\n            used[p] = False\n    return total' },
        'The function remembers only `last`, the person seated most recently, because the rule involves only two neighbours. Since the rule is checked before a person is placed, no arrangement with a quarrel is ever completed. With many enemy pairs the number of arrangements falls quickly; with no pairs it is `n!`.'
      ]
    },
    statement: ['`n` people, numbered 1 to `n`, sit in a row. `m` pairs of people are enemies and must not sit next to each other. Count the different ways to seat the people in the `n` places.'],
    inputFormat: ['The first line has `n` and `m`.', 'Each of the next `m` lines has two people who are enemies.'],
    outputFormat: ['Print the number of seatings.'],
    constraints: ['1 <= n <= 8', '0 <= m <= n * (n - 1) / 2, every pair appears at most once'],
    examples: [{ input: '3 1\n1 2\n', note: 'The six orders are 123, 132, 213, 231, 312, 321; 1 and 2 are neighbours in 123, 213, 312 and 321, so 2 orders remain: 132 and 231.' }],
    hints: ['Place the people one after the other, remembering the last one.', 'A person may be placed only if they are not an enemy of the last one.', 'Count one arrangement when all n people are placed.'],
    program: {
      io: ['n:int m:int', 'pairs:int[m][2]'],
      helpers: {
        python: r`
          def count(n, last, used, placed, enemy):
              if placed == n:
                  return 1
              total = 0
              for p in range(n):
                  if not used[p] and (last < 0 or not enemy[last][p]):
                      used[p] = True
                      total += count(n, p, used, placed + 1, enemy)
                      used[p] = False
              return total`,
        cpp: r`
          long long countSeatings(int n, int last, vector<char>& used, int placed, const vector<vector<char>>& enemy) {
              if (placed == n) return 1;
              long long total = 0;
              for (int p = 0; p < n; p++) {
                  if (!used[p] && (last < 0 || !enemy[last][p])) {
                      used[p] = 1;
                      total += countSeatings(n, p, used, placed + 1, enemy);
                      used[p] = 0;
                  }
              }
              return total;
          }`,
        java: r`
          static long countSeatings(int n, int last, boolean[] used, int placed, boolean[][] enemy) {
              if (placed == n) return 1;
              long total = 0;
              for (int p = 0; p < n; p++) {
                  if (!used[p] && (last < 0 || !enemy[last][p])) {
                      used[p] = true;
                      total += countSeatings(n, p, used, placed + 1, enemy);
                      used[p] = false;
                  }
              }
              return total;
          }`
      },
      python: r`
        enemy = [[False] * n for _ in range(n)]
        for a, b in pairs:
            enemy[a - 1][b - 1] = enemy[b - 1][a - 1] = True
        print(count(n, -1, [False] * n, 0, enemy))`,
      cpp: r`
        vector<vector<char>> enemy(n, vector<char>(n, 0));
        for (int i = 0; i < m; i++) {
            enemy[pairs[i][0] - 1][pairs[i][1] - 1] = 1;
            enemy[pairs[i][1] - 1][pairs[i][0] - 1] = 1;
        }
        vector<char> used(n, 0);
        cout << countSeatings((int)n, -1, used, 0, enemy) << "\n";`,
      java: r`
        boolean[][] enemy = new boolean[(int) n][(int) n];
        for (int i = 0; i < m; i++) {
            enemy[(int) pairs[i][0] - 1][(int) pairs[i][1] - 1] = true;
            enemy[(int) pairs[i][1] - 1][(int) pairs[i][0] - 1] = true;
        }
        System.out.println(countSeatings((int) n, -1, new boolean[(int) n], 0, enemy));`
    },
    solution: { explanation: ['People are placed one at a time; a person is allowed only if unused and not an enemy of the last seated person. A complete row of `n` people counts one.'], complexity: 'Time O(n!) in the worst case (8! = 40320 leaves), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const enemy = Array.from({ length: n }, () => Array(n).fill(false));
      for (let i = 1; i <= m; i++) { const [a, b] = nums(rs[i]); enemy[a - 1][b - 1] = enemy[b - 1][a - 1] = true; }
      let count = 0; const perm = Array.from({ length: n }, (_, i) => i);
      const permute = (k) => { if (k === n) { for (let i = 0; i + 1 < n; i++) if (enemy[perm[i]][perm[i + 1]]) return; count++; return; } for (let i = k; i < n; i++) { [perm[k], perm[i]] = [perm[i], perm[k]]; permute(k + 1); [perm[k], perm[i]] = [perm[i], perm[k]]; } };
      permute(0); return String(count);
    },
    tests() {
      const g = rng(656);
      const some = (n, p) => allPairs(n).filter(() => g() < p);
      const make = (n, edges) => pairsText(n, edges);
      return ['3 1\n1 2\n', '1 0\n', '2 1\n1 2\n', '2 0\n', make(8, []), make(8, allPairs(8)), make(8, some(8, 0.1)), make(8, some(8, 0.25)), make(8, some(8, 0.5)), make(8, [[1, 2], [3, 4], [5, 6], [7, 8]]), make(8, many(7, (i) => [i + 1, i + 2])), make(7, some(7, 0.2)), make(6, some(6, 0.3)), make(8, allPairs(8).filter(([a, b]) => (a + b) % 2 === 0))];
    }
  },

  {
    slug: 'partition-into-equal-subsets',
    title: 'Split Into k Groups of Equal Sum',
    difficulty: 'medium',
    tags: ['backtracking', 'partition', 'pruning'],
    concept: {
      title: 'Put each number in a bucket, and never try two buckets that look the same',
      body: [
        'Split `n` numbers into `k` groups with the same sum. The sum of every group must be `total / k`, so first check that `total` is divisible by `k` and that no number is larger than the target. Then place the numbers one by one into `k` buckets; a number may go to a bucket only if the bucket sum stays at most the target.',
        { code: 'def fill(i, sums, target):\n    if i == len(nums):\n        return True                         # every number is placed; all buckets are full\n    seen = set()\n    for b in range(len(sums)):\n        if sums[b] + nums[i] <= target and sums[b] not in seen:\n            seen.add(sums[b])                # a bucket with the same sum is the same situation\n            sums[b] += nums[i]\n            if fill(i + 1, sums, target):\n                return True\n            sums[b] -= nums[i]\n    return False' },
        'Two pruning ideas make this fast enough: place the **big numbers first** (they have few possible buckets, so mistakes show early), and **never try two buckets with the same current sum** for the same number, because they are interchangeable. Without the second rule the search would try all `k!` ways to name the buckets of every partial solution.'
      ]
    },
    statement: ['Given `n` positive integers and a number `k`, decide whether the integers can be split into `k` groups (every integer goes to exactly one group) so that all `k` groups have exactly the same sum. Print `yes` or `no`.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= k <= n <= 16', '1 <= each integer <= 10000'],
    examples: [{ input: '7 4\n4 3 2 3 5 2 1\n', note: 'The total is 20, so each group has 5: {5}, {1, 4}, {2, 3}, {2, 3}.' }],
    hints: ['The groups must have the sum total / k: if it is not an integer, the answer is no.', 'Sort in decreasing order and place the numbers into buckets one by one.', 'For a number, skip a bucket whose sum equals the sum of a bucket already tried.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      includes: ['<algorithm>', '<set>'],
      helpers: {
        python: r`
          def fill(nums, i, sums, target):
              if i == len(nums):
                  return True
              seen = set()
              for b in range(len(sums)):
                  if sums[b] + nums[i] <= target and sums[b] not in seen:
                      seen.add(sums[b])
                      sums[b] += nums[i]
                      if fill(nums, i + 1, sums, target):
                          return True
                      sums[b] -= nums[i]
              return False`,
        cpp: r`
          bool fill(const vector<long long>& nums, size_t i, vector<long long>& sums, long long target) {
              if (i == nums.size()) return true;
              set<long long> seen;
              for (size_t b = 0; b < sums.size(); b++) {
                  if (sums[b] + nums[i] <= target && !seen.count(sums[b])) {
                      seen.insert(sums[b]);
                      sums[b] += nums[i];
                      if (fill(nums, i + 1, sums, target)) return true;
                      sums[b] -= nums[i];
                  }
              }
              return false;
          }`,
        java: r`
          static boolean fill(long[] nums, int i, long[] sums, long target) {
              if (i == nums.length) return true;
              Set<Long> seen = new HashSet<>();
              for (int b = 0; b < sums.length; b++) {
                  if (sums[b] + nums[i] <= target && !seen.contains(sums[b])) {
                      seen.add(sums[b]);
                      sums[b] += nums[i];
                      if (fill(nums, i + 1, sums, target)) return true;
                      sums[b] -= nums[i];
                  }
              }
              return false;
          }`
      },
      python: r`
        total = sum(a)
        if total % k != 0 or max(a) > total // k:
            print("no")
        else:
            a.sort(reverse=True)
            print("yes" if fill(a, 0, [0] * k, total // k) else "no")`,
      cpp: r`
        long long total = 0;
        for (long long x : a) total += x;
        sort(a.begin(), a.end(), greater<long long>());
        if (total % k != 0 || a[0] > total / k) {
            cout << "no\n";
        } else {
            vector<long long> sums(k, 0);
            cout << (fill(a, 0, sums, total / k) ? "yes" : "no") << "\n";
        }`,
      java: r`
        long total = 0;
        for (long x : a) total += x;
        Arrays.sort(a);
        for (int i = 0; i < a.length / 2; i++) {
            long t = a[i];
            a[i] = a[a.length - 1 - i];
            a[a.length - 1 - i] = t;
        }
        if (total % k != 0 || a[0] > total / k) {
            System.out.println("no");
        } else {
            System.out.println(fill(a, 0, new long[(int) k], total / k) ? "yes" : "no");
        }`
    },
    solution: { explanation: ['After the divisibility checks, the numbers are placed from the largest to the smallest into `k` buckets with the target as the limit; a bucket whose current sum was already tried for this number is skipped. All numbers placed means all buckets are exactly full.'], complexity: 'Time exponential in the worst case but small with the pruning, space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); const total = a.reduce((x, y) => x + y, 0);
      if (total % k) return 'no'; const target = total / k; if (a.some((x) => x > target)) return 'no';
      const sum = Array(1 << n).fill(0); for (let mask = 1; mask < 1 << n; mask++) { const low = Math.log2(mask & -mask); sum[mask] = sum[mask & (mask - 1)] + a[low]; }
      const ok = Array(1 << n).fill(false); ok[0] = true;
      for (let mask = 0; mask < 1 << n; mask++) { if (!ok[mask]) continue; const filled = sum[mask] % target; for (let i = 0; i < n; i++) if (!((mask >> i) & 1) && filled + a[i] <= target) ok[mask | (1 << i)] = true; }
      return ok[(1 << n) - 1] ? 'yes' : 'no';
    },
    tests() {
      const g = rng(657);
      const make = (k, a) => `${a.length} ${k}\n${a.join(' ')}\n`;
      const brute = (k, a) => { const total = a.reduce((x, y) => x + y, 0); if (total % k) return 'no'; const t = total / k; const sums = Array(k).fill(0); const go = (i) => { if (i === a.length) return true; for (let b = 0; b < k; b++) if (sums[b] + a[i] <= t) { sums[b] += a[i]; if (go(i + 1)) return true; sums[b] -= a[i]; } return false; }; return go(0) ? 'yes' : 'no'; };
      crossCheck(() => { const n = randInt(g, 1, 8); return make(randInt(g, 1, n), randArray(g, n, 1, 6)); }, (i) => this.solve(i), (i) => { const rs = rows(i); return brute(nums(rs[0])[1], nums(rs[1])); });
      const groups = (k, size, hi) => { const out = []; for (let b = 0; b < k; b++) { const parts = []; let left = hi; for (let i = 0; i < size - 1; i++) { const x = randInt(g, 1, Math.max(1, left - (size - 1 - i))); parts.push(x); left -= x; } parts.push(Math.max(1, left)); out.push(...parts); } return shuffle(g, out); };
      return ['7 4\n4 3 2 3 5 2 1\n', '1 1\n5\n', '2 2\n3 3\n', '2 2\n3 4\n', '4 3\n1 1 1 1\n', make(4, groups(4, 4, 40)), make(8, many(16, (i) => 1 + (i % 4))), make(4, many(16, () => 7)), make(3, groups(3, 5, 60)), make(5, groups(5, 3, 90)), make(8, [...many(8, () => 5), ...many(8, () => 5)]), make(4, [...many(15, () => 3), 4]), make(8, [...many(14, () => 100), 99, 101]), make(6, randArray(g, 16, 1, 50)), make(4, [10000, 10000, 10000, 10000, 5000, 5000, 5000, 5000, 3000, 3000, 3000, 3000, 2000, 2000, 2000, 2000])];
    }
  },

  {
    slug: 'fair-cookie-distribution',
    title: 'Share the Cookie Bags Fairly',
    difficulty: 'medium',
    tags: ['backtracking', 'pruning', 'optimization'],
    concept: {
      title: 'Keep the best answer found, and cut every branch that cannot beat it',
      body: [
        'There are `n` bags of cookies and `k` children. A bag is given **whole** to one child. The *unfairness* of a distribution is the largest number of cookies one child gets, and we want it as small as possible. This is an **optimisation** problem: the search tries all ways to give the bags, but it keeps a variable `best` with the smallest unfairness found so far and cuts a branch as soon as it cannot improve it.',
        { code: 'def distribute(i, kids, best):\n    if i == len(cookies):\n        best[0] = min(best[0], max(kids))      # a complete distribution\n        return\n    seen = set()\n    for j in range(len(kids)):\n        if kids[j] in seen or kids[j] + cookies[i] >= best[0]:\n            continue                           # same as another child, or cannot beat best\n        seen.add(kids[j])\n        kids[j] += cookies[i]\n        distribute(i + 1, kids, best)\n        kids[j] -= cookies[i]' },
        'The test `kids[j] + cookies[i] >= best[0]` is a **bound**: this child would already have as many cookies as the best answer so far, so the branch cannot lead to a better answer. It becomes strong when `best` is good early, which is why the bags are given from the biggest to the smallest. Children who currently have the same amount are interchangeable, so only one of them is tried.'
      ]
    },
    statement: ['There are `n` bags with the given numbers of cookies and `k` children. Every bag is given whole to one child (a child may get several bags or none). The *unfairness* is the largest total that one child gets. Print the smallest possible unfairness.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has the `n` numbers of cookies.'],
    outputFormat: ['Print the smallest unfairness.'],
    constraints: ['2 <= k <= n <= 8', '1 <= cookies in a bag <= 10^5'],
    examples: [{ input: '5 2\n8 15 10 20 8\n', note: 'The children can get 8 + 15 + 8 = 31 and 10 + 20 = 30: the best unfairness is 31.' }],
    hints: ['Give the bags one by one to a child; keep the totals of the children.', 'Remember the best unfairness found so far and skip a child whose total plus the bag would not beat it.', 'Give the bigger bags first, and try only one of several children with the same total.'],
    program: {
      io: ['n:int k:int', 'cookies:int[n]'],
      includes: ['<algorithm>', '<set>'],
      helpers: {
        python: r`
          def distribute(cookies, i, kids, best):
              if i == len(cookies):
                  best[0] = min(best[0], max(kids))
                  return
              seen = set()
              for j in range(len(kids)):
                  if kids[j] in seen or kids[j] + cookies[i] >= best[0]:
                      continue
                  seen.add(kids[j])
                  kids[j] += cookies[i]
                  distribute(cookies, i + 1, kids, best)
                  kids[j] -= cookies[i]`,
        cpp: r`
          void distribute(const vector<long long>& cookies, size_t i, vector<long long>& kids, long long& best) {
              if (i == cookies.size()) {
                  best = min(best, *max_element(kids.begin(), kids.end()));
                  return;
              }
              set<long long> seen;
              for (size_t j = 0; j < kids.size(); j++) {
                  if (seen.count(kids[j]) || kids[j] + cookies[i] >= best) continue;
                  seen.insert(kids[j]);
                  kids[j] += cookies[i];
                  distribute(cookies, i + 1, kids, best);
                  kids[j] -= cookies[i];
              }
          }`,
        java: r`
          static void distribute(long[] cookies, int i, long[] kids, long[] best) {
              if (i == cookies.length) {
                  long m = 0;
                  for (long x : kids) m = Math.max(m, x);
                  best[0] = Math.min(best[0], m);
                  return;
              }
              Set<Long> seen = new HashSet<>();
              for (int j = 0; j < kids.length; j++) {
                  if (seen.contains(kids[j]) || kids[j] + cookies[i] >= best[0]) continue;
                  seen.add(kids[j]);
                  kids[j] += cookies[i];
                  distribute(cookies, i + 1, kids, best);
                  kids[j] -= cookies[i];
              }
          }`
      },
      python: r`
        cookies.sort(reverse=True)
        best = [sum(cookies) + 1]
        distribute(cookies, 0, [0] * k, best)
        print(best[0])`,
      cpp: r`
        sort(cookies.begin(), cookies.end(), greater<long long>());
        long long total = 0;
        for (long long x : cookies) total += x;
        long long best = total + 1;
        vector<long long> kids(k, 0);
        distribute(cookies, 0, kids, best);
        cout << best << "\n";`,
      java: r`
        Arrays.sort(cookies);
        for (int i = 0; i < cookies.length / 2; i++) {
            long t = cookies[i];
            cookies[i] = cookies[cookies.length - 1 - i];
            cookies[cookies.length - 1 - i] = t;
        }
        long total = 0;
        for (long x : cookies) total += x;
        long[] best = {total + 1};
        distribute(cookies, 0, new long[(int) k], best);
        System.out.println(best[0]);`
    },
    solution: { explanation: ['The bags go from the biggest to the smallest to a child; a child is skipped if another child with the same total was tried, or if the new total could not beat the best unfairness found so far. A complete distribution updates the best value.'], complexity: 'Time O(k^n) worst case but small with the pruning (n <= 8), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]);
      const sum = Array(1 << n).fill(0); for (let mask = 1; mask < 1 << n; mask++) sum[mask] = sum[mask & (mask - 1)] + a[Math.log2(mask & -mask)];
      let f = sum.slice(); // with one child
      for (let kids = 2; kids <= k; kids++) { const next = Array(1 << n).fill(Infinity); for (let mask = 0; mask < 1 << n; mask++) for (let sub = mask; ; sub = (sub - 1) & mask) { next[mask] = Math.min(next[mask], Math.max(sum[sub], f[mask ^ sub])); if (sub === 0) break; } f = next; }
      return String(f[(1 << n) - 1]);
    },
    tests() {
      const g = rng(658);
      const make = (k, a) => `${a.length} ${k}\n${a.join(' ')}\n`;
      const brute = (k, a) => { let best = Infinity; const kids = Array(k).fill(0); const go = (i) => { if (i === a.length) { best = Math.min(best, Math.max(...kids)); return; } for (let j = 0; j < k; j++) { kids[j] += a[i]; go(i + 1); kids[j] -= a[i]; } }; go(0); return best; };
      crossCheck(() => { const n = randInt(g, 2, 6); return make(randInt(g, 2, n), randArray(g, n, 1, 30)); }, (i) => this.solve(i), (i) => { const rs = rows(i); return brute(nums(rs[0])[1], nums(rs[1])); });
      return ['5 2\n8 15 10 20 8\n', '2 2\n1 1\n', '2 2\n5 7\n', '8 2\n100000 100000 100000 100000 100000 100000 100000 100000\n', '8 8\n1 2 3 4 5 6 7 8\n', make(3, randArray(g, 8, 1, 100000)), make(4, randArray(g, 8, 1, 100000)), make(5, randArray(g, 8, 1, 1000)), make(3, [1, 1, 1, 1, 1, 1, 1, 100000]), make(7, randArray(g, 8, 1, 50)), make(2, randArray(g, 8, 1, 100)), make(4, [3, 3, 3, 3, 3, 3, 3, 3]), make(3, [10, 20, 30, 40, 50, 60, 70, 80])];
    }
  },

  {
    slug: 'magic-square-completions',
    title: 'Finish the Magic Square',
    difficulty: 'medium',
    tags: ['backtracking', 'constraints', 'permutations'],
    concept: {
      title: 'Test every row, column and diagonal as soon as it is full',
      body: [
        'A 3 by 3 **magic square** uses each of the digits 1 to 9 exactly once, and each row, each column and both diagonals add up to 15. Some cells are already given (a `0` means an empty cell). Count the ways to fill the empty cells with the unused digits to get a magic square.',
        'The search fills the empty cells in reading order with digits not used yet. Trying all `9!` fillings and checking at the end would be slow and silly: instead, **after each placement** check every line (three cells) whose cells are all filled, and reject the placement as soon as such a line does not add up to 15.',
        { code: 'LINES = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]\n\ndef lines_ok(cells):\n    for a, b, c in LINES:\n        if cells[a] and cells[b] and cells[c] and cells[a] + cells[b] + cells[c] != 15:\n            return False\n    return True' },
        'The empty board has exactly 8 solutions (the rotations and mirror images of one square). Checking a line early cuts most of the 362880 fillings away.'
      ]
    },
    statement: ['A 3 by 3 board contains some of the digits 1 to 9 (all different); an empty cell is written as `0`. Fill the empty cells with the digits that are not used yet, so that the digits 1 to 9 each appear exactly once and every row, every column and both diagonals have the sum 15. Count the ways.'],
    inputFormat: ['3 lines with 3 characters each: the digits 0 to 9 without spaces.'],
    outputFormat: ['Print the number of ways.'],
    constraints: ['The nonzero digits on the board are different.'],
    examples: [{ input: '800\n000\n000\n', note: 'A magic square with the 8 in the top left corner: the rotations and mirrors give 2 such squares (the middle is always 5).' }],
    hints: ['Remember which digits are used; the given digits are used from the start.', 'After placing a digit, check each line that is completely filled: its sum must be 15.', 'The cells given at the start also take part in the line checks.'],
    program: {
      io: ['board:rows[3]'],
      helpers: {
        python: r`
          LINES = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]

          def lines_ok(cells):
              for a, b, c in LINES:
                  if cells[a] and cells[b] and cells[c] and cells[a] + cells[b] + cells[c] != 15:
                      return False
              return True

          def count(cells, pos, used):
              if pos == 9:
                  return 1 if lines_ok(cells) else 0
              if cells[pos] != 0:
                  return count(cells, pos + 1, used)
              total = 0
              for d in range(1, 10):
                  if not used[d]:
                      used[d] = True
                      cells[pos] = d
                      if lines_ok(cells):
                          total += count(cells, pos + 1, used)
                      cells[pos] = 0
                      used[d] = False
              return total`,
        cpp: r`
          const int LINES[8][3] = {{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, {0, 4, 8}, {2, 4, 6}};

          bool linesOk(const vector<int>& cells) {
              for (int k = 0; k < 8; k++) {
                  int a = cells[LINES[k][0]], b = cells[LINES[k][1]], c = cells[LINES[k][2]];
                  if (a && b && c && a + b + c != 15) return false;
              }
              return true;
          }

          long long countSquares(vector<int>& cells, int pos, vector<char>& used) {
              if (pos == 9) return linesOk(cells) ? 1 : 0;
              if (cells[pos] != 0) return countSquares(cells, pos + 1, used);
              long long total = 0;
              for (int d = 1; d <= 9; d++) {
                  if (!used[d]) {
                      used[d] = 1;
                      cells[pos] = d;
                      if (linesOk(cells)) total += countSquares(cells, pos + 1, used);
                      cells[pos] = 0;
                      used[d] = 0;
                  }
              }
              return total;
          }`,
        java: r`
          static final int[][] LINES = {{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, {0, 4, 8}, {2, 4, 6}};

          static boolean linesOk(int[] cells) {
              for (int[] line : LINES) {
                  int a = cells[line[0]], b = cells[line[1]], c = cells[line[2]];
                  if (a != 0 && b != 0 && c != 0 && a + b + c != 15) return false;
              }
              return true;
          }

          static long countSquares(int[] cells, int pos, boolean[] used) {
              if (pos == 9) return linesOk(cells) ? 1 : 0;
              if (cells[pos] != 0) return countSquares(cells, pos + 1, used);
              long total = 0;
              for (int d = 1; d <= 9; d++) {
                  if (!used[d]) {
                      used[d] = true;
                      cells[pos] = d;
                      if (linesOk(cells)) total += countSquares(cells, pos + 1, used);
                      cells[pos] = 0;
                      used[d] = false;
                  }
              }
              return total;
          }`
      },
      python: r`
        cells = [int(ch) for row in board for ch in row]
        used = [False] * 10
        for d in cells:
            used[d] = True
        used[0] = True
        print(count(cells, 0, used))`,
      cpp: r`
        vector<int> cells;
        vector<char> used(10, 0);
        for (const string& row : board) {
            for (char ch : row) {
                cells.push_back(ch - '0');
                used[ch - '0'] = 1;
            }
        }
        cout << countSquares(cells, 0, used) << "\n";`,
      java: r`
        int[] cells = new int[9];
        boolean[] used = new boolean[10];
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                cells[i * 3 + j] = board[i].charAt(j) - '0';
                used[cells[i * 3 + j]] = true;
            }
        }
        System.out.println(countSquares(cells, 0, used));`
    },
    solution: { explanation: ['The empty cells are filled in reading order with unused digits. After each placement every completely filled line must add to 15, otherwise the digit is rejected. At the end of the board the lines are checked once more (the given cells may form a full line).'], complexity: 'Time tiny (far fewer than 9! nodes), space O(1).' },
    solve(input) {
      const cells = rows(input).join('').split('').map(Number); const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
      const free = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !cells.includes(d)); const empty = cells.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
      let count = 0; const used = Array(free.length).fill(false); const cur = cells.slice();
      const go = (k) => { if (k === empty.length) { if (lines.every(([a, b, c]) => cur[a] + cur[b] + cur[c] === 15)) count++; return; } for (let i = 0; i < free.length; i++) if (!used[i]) { used[i] = true; cur[empty[k]] = free[i]; go(k + 1); used[i] = false; } };
      go(0); return String(count);
    },
    tests() {
      const g = rng(659);
      const squares = ['816\n357\n492\n', '618\n753\n294\n', '276\n951\n438\n', '294\n753\n618\n'];
      const hide = (p) => { const sq = squares[randInt(g, 0, squares.length - 1)].split(''); return sq.map((ch) => (ch === '\n' ? ch : g() < p ? '0' : ch)).join(''); };
      return ['800\n000\n000\n', '000\n000\n000\n', '816\n357\n492\n', '816\n357\n490\n', '816\n357\n429\n', '000\n050\n000\n', '100\n050\n000\n', '090\n000\n000\n', '800\n050\n002\n', hide(0.3), hide(0.5), hide(0.6), hide(0.7), hide(0.8), '408\n000\n000\n', '020\n005\n000\n'];
    }
  }
];
