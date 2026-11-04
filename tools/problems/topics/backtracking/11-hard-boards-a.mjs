import { r, rng, randInt, randArray, many, nums, rows, randWord, shuffle } from '../../lib.mjs';

// Runs fast(input) against a slow, independent computation on many small random inputs; throws when they differ.
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const visibleCount = (line) => { let count = 0, tallest = 0; for (const h of line) if (h > tallest) { count++; tallest = h; } return count; };
const permutationsOf = (n) => { const out = []; const go = (cur, left) => { if (!left.length) { out.push(cur); return; } left.forEach((x, i) => go([...cur, x], left.filter((_, k) => k !== i))); }; go([], many(n, (i) => i + 1)); return out; };

export default [
  {
    slug: 'skyscraper-puzzle',
    title: 'The Skyscraper Puzzle',
    difficulty: 'hard',
    tags: ['backtracking', 'puzzle', 'permutations', 'pruning'],
    concept: {
      title: 'Choose whole rows that satisfy their own clues, and prune with the columns',
      body: [
        'A skyscraper puzzle is an `n` by `n` grid filled with the heights `1 .. n`, with every height once in each row and each column (a Latin square). The numbers around the grid are *clues*: the number of buildings you can see when you look along that row or column from that side; a taller building hides the shorter buildings behind it. A clue `0` means that there is no clue. We count the grids that satisfy all clues.',
        'Fill the grid **a row at a time**. A row is a permutation of `1 .. n`, and the two clues at its ends concern **only this row**, so first keep just those permutations that satisfy them. The search then chooses one of these permutations for each row, so that no height repeats in a column. After each row, look at the columns: the number of buildings visible from the top can only **grow** when more rows are added, so if it is already larger than the top clue, this branch is dead.',
        { code: '# outline of the search\ndef visible(line):\n    count = tallest = 0\n    for h in line:\n        if h > tallest:\n            count += 1\n            tallest = h\n    return count\n\ndef fill(row):\n    if row == n:\n        return 1 if the top and bottom clues of every column are met else 0\n    total = 0\n    for p in row_choices[row]:                 # rows that meet their left and right clues\n        if p repeats no height of the rows above in any column:\n            place p in the grid\n            if no top clue is exceeded:\n                total += fill(row + 1)\n            remove p from the grid\n    return total' },
        'Checking the clues of a row **before** the search starts (when the list of its candidates is built) shrinks the choices from `n!` to a handful. The three prunings, rows with their own clues, distinct heights in columns, and the top clue never exceeded, together make the search small. The last clues (bottom) can only be checked when the grid is complete.'
      ]
    },
    statement: ['An `n` by `n` grid must be filled with the heights 1 to `n`, so that every row and every column has each height exactly once. Clues are given around the grid: for each column the number of buildings visible from the top and from the bottom, and for each row the number of buildings visible from the left and from the right. A building is visible if all buildings before it (on the way from that side) are lower. A clue 0 means "no clue". Count the grids that satisfy every non-zero clue.'],
    inputFormat: ['The first line has `n`.', 'The next 4 lines have `n` clues each: the clues for the columns seen from the top, the columns seen from the bottom, the rows seen from the left, and the rows seen from the right.'],
    outputFormat: ['Print the number of grids.'],
    constraints: ['4 <= n <= 5', 'Each clue is between 0 and n.', 'At least 8 of the 4n clues are not 0.'],
    examples: [{ input: '4\n4 2 2 1\n1 2 2 4\n4 2 2 1\n1 2 2 4\n', note: 'These clues come from the grid 1 2 3 4 / 2 1 4 3 / 3 4 1 2 / 4 3 2 1, and it is the only grid that fits all of them.' }],
    hints: ['Make a list of the permutations of 1..n that satisfy the left and right clues of each row.', 'Choose one permutation per row, never repeating a height in a column.', 'After a row is placed, the visible count from the top of a column must not exceed its clue; check the bottom clues at the end.'],
    program: {
      io: ['n:int', 'top:int[n]', 'bottom:int[n]', 'left:int[n]', 'right:int[n]'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          from itertools import permutations

          def visible(line):
              count = tallest = 0
              for h in line:
                  if h > tallest:
                      count += 1
                      tallest = h
              return count

          def fill(row, n, choices, top, bottom, grid, used):
              if row == n:
                  for c in range(n):
                      col = [grid[i][c] for i in range(n)]
                      if top[c] and visible(col) != top[c]:
                          return 0
                      if bottom[c] and visible(col[::-1]) != bottom[c]:
                          return 0
                  return 1
              total = 0
              for p in choices[row]:
                  if any(used[c][p[c]] for c in range(n)):
                      continue
                  grid[row] = p
                  ok = True
                  for c in range(n):
                      used[c][p[c]] = True
                  for c in range(n):
                      if top[c] and visible([grid[i][c] for i in range(row + 1)]) > top[c]:
                          ok = False
                  if ok:
                      total += fill(row + 1, n, choices, top, bottom, grid, used)
                  for c in range(n):
                      used[c][p[c]] = False
              return total`,
        cpp: r`
          int visible(const vector<int>& line) {
              int count = 0, tallest = 0;
              for (int h : line) {
                  if (h > tallest) {
                      count++;
                      tallest = h;
                  }
              }
              return count;
          }

          long long fill(int row, int n, const vector<vector<vector<int>>>& choices, const vector<long long>& top, const vector<long long>& bottom, vector<vector<int>>& grid, vector<vector<char>>& used) {
              if (row == n) {
                  for (int c = 0; c < n; c++) {
                      vector<int> col;
                      for (int i = 0; i < n; i++) col.push_back(grid[i][c]);
                      if (top[c] && visible(col) != top[c]) return 0;
                      reverse(col.begin(), col.end());
                      if (bottom[c] && visible(col) != bottom[c]) return 0;
                  }
                  return 1;
              }
              long long total = 0;
              for (const vector<int>& p : choices[row]) {
                  bool clash = false;
                  for (int c = 0; c < n; c++) {
                      if (used[c][p[c]]) clash = true;
                  }
                  if (clash) continue;
                  grid[row] = p;
                  for (int c = 0; c < n; c++) used[c][p[c]] = 1;
                  bool ok = true;
                  for (int c = 0; c < n; c++) {
                      vector<int> col;
                      for (int i = 0; i <= row; i++) col.push_back(grid[i][c]);
                      if (top[c] && visible(col) > top[c]) ok = false;
                  }
                  if (ok) total += fill(row + 1, n, choices, top, bottom, grid, used);
                  for (int c = 0; c < n; c++) used[c][p[c]] = 0;
              }
              return total;
          }`,
        java: r`
          static int visible(int[] line, int length) {
              int count = 0, tallest = 0;
              for (int i = 0; i < length; i++) {
                  if (line[i] > tallest) {
                      count++;
                      tallest = line[i];
                  }
              }
              return count;
          }

          static long fill(int row, int n, List<List<int[]>> choices, long[] top, long[] bottom, int[][] grid, boolean[][] used) {
              if (row == n) {
                  for (int c = 0; c < n; c++) {
                      int[] col = new int[n], back = new int[n];
                      for (int i = 0; i < n; i++) {
                          col[i] = grid[i][c];
                          back[n - 1 - i] = grid[i][c];
                      }
                      if (top[c] != 0 && visible(col, n) != top[c]) return 0;
                      if (bottom[c] != 0 && visible(back, n) != bottom[c]) return 0;
                  }
                  return 1;
              }
              long total = 0;
              for (int[] p : choices.get(row)) {
                  boolean clash = false;
                  for (int c = 0; c < n; c++) {
                      if (used[c][p[c]]) clash = true;
                  }
                  if (clash) continue;
                  grid[row] = p;
                  for (int c = 0; c < n; c++) used[c][p[c]] = true;
                  boolean ok = true;
                  for (int c = 0; c < n; c++) {
                      int[] col = new int[row + 1];
                      for (int i = 0; i <= row; i++) col[i] = grid[i][c];
                      if (top[c] != 0 && visible(col, row + 1) > top[c]) ok = false;
                  }
                  if (ok) total += fill(row + 1, n, choices, top, bottom, grid, used);
                  for (int c = 0; c < n; c++) used[c][p[c]] = false;
              }
              return total;
          }

          static void permutations(int n, int[] current, boolean[] taken, int size, List<int[]> out) {
              if (size == n) {
                  out.add(current.clone());
                  return;
              }
              for (int h = 1; h <= n; h++) {
                  if (taken[h]) continue;
                  taken[h] = true;
                  current[size] = h;
                  permutations(n, current, taken, size + 1, out);
                  taken[h] = false;
              }
          }`
      },
      python: r`
        choices = []
        for row in range(n):
            ok_rows = []
            for p in permutations(range(1, n + 1)):
                if left[row] and visible(p) != left[row]:
                    continue
                if right[row] and visible(p[::-1]) != right[row]:
                    continue
                ok_rows.append(p)
            choices.append(ok_rows)
        grid = [None] * n
        used = [[False] * (n + 1) for _ in range(n)]
        print(fill(0, n, choices, top, bottom, grid, used))`,
      cpp: r`
        vector<vector<vector<int>>> choices(n);
        for (int row = 0; row < n; row++) {
            vector<int> p(n);
            for (int i = 0; i < n; i++) p[i] = i + 1;
            do {
                vector<int> back(p.rbegin(), p.rend());
                if (left[row] && visible(p) != left[row]) continue;
                if (right[row] && visible(back) != right[row]) continue;
                choices[row].push_back(p);
            } while (next_permutation(p.begin(), p.end()));
        }
        vector<vector<int>> grid(n);
        vector<vector<char>> used(n, vector<char>(n + 1, 0));
        cout << fill(0, (int)n, choices, top, bottom, grid, used) << "\n";`,
      java: r`
        List<List<int[]>> choices = new ArrayList<>();
        List<int[]> all = new ArrayList<>();
        permutations((int) n, new int[(int) n], new boolean[(int) n + 1], 0, all);
        for (int row = 0; row < n; row++) {
            List<int[]> okRows = new ArrayList<>();
            for (int[] p : all) {
                int[] back = new int[(int) n];
                for (int i = 0; i < n; i++) back[(int) n - 1 - i] = p[i];
                if (left[row] != 0 && visible(p, (int) n) != left[row]) continue;
                if (right[row] != 0 && visible(back, (int) n) != right[row]) continue;
                okRows.add(p);
            }
            choices.add(okRows);
        }
        System.out.println(fill(0, (int) n, choices, top, bottom, new int[(int) n][], new boolean[(int) n][(int) n + 1]));`
    },
    solution: { explanation: ['For each row, only the permutations that satisfy its left and right clues are kept. The search picks one per row with no repeated height in a column, rejects a row when a column already shows too many buildings from the top, and checks the exact top and bottom counts when the grid is complete.'], complexity: 'Time small with the clues (a few thousand rows tried), space O(n^2).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const [top, bottom, left, right] = rs.slice(1, 5).map(nums); const all = permutationsOf(n);
      const rowOk = all.map((p, i) => i);
      let count = 0; const grid = [];
      const go = (row) => { if (row === n) { for (let c = 0; c < n; c++) { const col = grid.map((rr) => rr[c]); if (top[c] && visibleCount(col) !== top[c]) return; if (bottom[c] && visibleCount(col.slice().reverse()) !== bottom[c]) return; } count++; return; } for (const p of all) { if (left[row] && visibleCount(p) !== left[row]) continue; if (right[row] && visibleCount(p.slice().reverse()) !== right[row]) continue; if (grid.some((rr) => rr.some((h, c) => h === p[c]))) continue; grid.push(p); go(row + 1); grid.pop(); } };
      go(0); return String(count);
    },
    tests() {
      const g = rng(690);
      const latin = (n) => { const base = many(n, (i) => many(n, (j) => ((i + j) % n) + 1)); const rowPerm = shuffle(g, many(n, (i) => i)); const colPerm = shuffle(g, many(n, (i) => i)); const sym = shuffle(g, many(n, (i) => i + 1)); return rowPerm.map((i) => colPerm.map((j) => sym[base[i][j] - 1])); };
      const cluesOf = (grid) => { const n = grid.length; const cols = many(n, (c) => grid.map((rr) => rr[c])); return [cols.map(visibleCount), cols.map((c) => visibleCount(c.slice().reverse())), grid.map(visibleCount), grid.map((rr) => visibleCount(rr.slice().reverse()))]; };
      const hide = (clues, keep) => { const n = clues[0].length; const cells = shuffle(g, many(4 * n, (i) => i)).slice(0, keep); const out = clues.map((row) => row.map(() => 0)); for (const idx of cells) out[Math.floor(idx / n)][idx % n] = clues[Math.floor(idx / n)][idx % n]; return out; };
      const make = (n, clues) => `${n}\n${clues.map((row) => row.join(' ')).join('\n')}\n`;
      const fromGrid = (n, keep) => make(n, hide(cluesOf(latin(n)), keep));
      const randomClues = (n, keep) => { const clues = many(4, () => many(n, () => 0)); for (const idx of shuffle(g, many(4 * n, (i) => i)).slice(0, keep)) clues[Math.floor(idx / n)][idx % n] = randInt(g, 1, n); return clues; };
      const sample = latin(4); const sampleClues = cluesOf(sample);
      return [make(4, [[2, 1, 3, 2], [2, 3, 1, 3], [3, 2, 1, 2], [1, 2, 3, 2]]), make(4, sampleClues), fromGrid(4, 8), fromGrid(4, 10), fromGrid(4, 12), make(4, randomClues(4, 8)), make(4, randomClues(4, 10)), fromGrid(5, 20), fromGrid(5, 16), fromGrid(5, 12), fromGrid(5, 10), fromGrid(5, 8), make(5, randomClues(5, 8)), make(5, randomClues(5, 12))];
    }
  },

  {
    slug: 'lights-out-moves',
    title: 'Switch Off All the Lights',
    difficulty: 'hard',
    tags: ['backtracking', 'puzzle', 'enumeration', 'bits'],
    concept: {
      title: 'Decide only the first row; the other rows are forced',
      body: [
        'A square grid of lamps is on or off. Pressing a lamp toggles it **and its up to four neighbours**. We want to switch all lamps off with the fewest presses. Pressing a lamp twice has no effect and the order of presses does not matter, so a solution is just a **set** of pressed lamps: `2^(n*n)` sets, far too many for 64 lamps.',
        'The trick: look at the first row only. Choose which lamps of the first row are pressed (`2^n` choices). After that, a lamp `(0, j)` of the first row can still be changed only by a press at `(1, j)` in the second row. So the presses of the second row are **forced**: press `(1, j)` exactly when the lamp `(0, j)` is still on. In general, press `(i, j)` exactly when the lamp `(i - 1, j)` is on. All rows are determined by the first row; at the end check that the last row is dark.',
        { code: 'def try_first(first):                       # first: the pressed lamps of row 0 as a bit mask\n    state = [row[:] for row in grid]\n    presses = 0\n    for i in range(n):\n        for j in range(n):\n            press = (first >> j & 1) if i == 0 else state[i - 1][j]    # forced by the row above\n            if press:\n                presses += 1\n                toggle(state, i, j)\n    return presses if not any(state[n - 1]) else -1' },
        'The whole search is `2^n` tries of `n * n` work each: for `n = 8` about 16 000 steps instead of `2^64` sets. Whenever the effect of a choice is **forced** by the earlier choices, one can enumerate only the free part, and the rest follows by calculation.'
      ]
    },
    statement: ['An `n` by `n` grid has lamps that are on (`1`) or off (`0`). Pressing a lamp toggles that lamp and its neighbours above, below, left and right (those that exist). Print the smallest number of presses that switches all the lamps off, or `-1` if it is impossible.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has `n` characters, `0` or `1`.'],
    outputFormat: ['Print the smallest number of presses, or `-1`.'],
    constraints: ['1 <= n <= 8'],
    examples: [{ input: '3\n010\n111\n010\n', note: 'One press on the middle lamp switches off the plus-shaped group: the answer is 1.' }],
    hints: ['A lamp pressed twice is the same as not pressed: only sets of presses matter.', 'Try every set of presses in the first row.', 'After the first row, the press of lamp (i, j) is forced: it must be pressed exactly when lamp (i - 1, j) is still on.'],
    program: {
      io: ['n:int', 'lamps:rows[n]'],
      helpers: {
        python: r`
          def toggle(state, n, i, j):
              for di, dj in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)):
                  a, b = i + di, j + dj
                  if 0 <= a < n and 0 <= b < n:
                      state[a][b] ^= 1

          def try_first(lamps, n, first):
              state = [[int(ch) for ch in row] for row in lamps]
              presses = 0
              for i in range(n):
                  for j in range(n):
                      press = (first >> j & 1) if i == 0 else state[i - 1][j]
                      if press:
                          presses += 1
                          toggle(state, n, i, j)
              return presses if not any(state[n - 1]) else -1`,
        cpp: r`
          void toggle(vector<vector<int>>& state, int n, int i, int j) {
              int di[5] = {0, 1, -1, 0, 0};
              int dj[5] = {0, 0, 0, 1, -1};
              for (int d = 0; d < 5; d++) {
                  int a = i + di[d], b = j + dj[d];
                  if (a >= 0 && a < n && b >= 0 && b < n) state[a][b] ^= 1;
              }
          }

          int tryFirst(const vector<string>& lamps, int n, int first) {
              vector<vector<int>> state(n, vector<int>(n));
              for (int i = 0; i < n; i++) {
                  for (int j = 0; j < n; j++) state[i][j] = lamps[i][j] - '0';
              }
              int presses = 0;
              for (int i = 0; i < n; i++) {
                  for (int j = 0; j < n; j++) {
                      int press = i == 0 ? (first >> j) & 1 : state[i - 1][j];
                      if (press) {
                          presses++;
                          toggle(state, n, i, j);
                      }
                  }
              }
              for (int j = 0; j < n; j++) {
                  if (state[n - 1][j]) return -1;
              }
              return presses;
          }`,
        java: r`
          static void toggle(int[][] state, int n, int i, int j) {
              int[] di = {0, 1, -1, 0, 0};
              int[] dj = {0, 0, 0, 1, -1};
              for (int d = 0; d < 5; d++) {
                  int a = i + di[d], b = j + dj[d];
                  if (a >= 0 && a < n && b >= 0 && b < n) state[a][b] ^= 1;
              }
          }

          static int tryFirst(String[] lamps, int n, int first) {
              int[][] state = new int[n][n];
              for (int i = 0; i < n; i++) {
                  for (int j = 0; j < n; j++) state[i][j] = lamps[i].charAt(j) - '0';
              }
              int presses = 0;
              for (int i = 0; i < n; i++) {
                  for (int j = 0; j < n; j++) {
                      int press = i == 0 ? (first >> j) & 1 : state[i - 1][j];
                      if (press != 0) {
                          presses++;
                          toggle(state, n, i, j);
                      }
                  }
              }
              for (int j = 0; j < n; j++) {
                  if (state[n - 1][j] != 0) return -1;
              }
              return presses;
          }`
      },
      python: r`
        best = -1
        for first in range(1 << n):
            presses = try_first(lamps, n, first)
            if presses >= 0 and (best < 0 or presses < best):
                best = presses
        print(best)`,
      cpp: r`
        int best = -1;
        for (int first = 0; first < (1 << n); first++) {
            int presses = tryFirst(lamps, (int)n, first);
            if (presses >= 0 && (best < 0 || presses < best)) best = presses;
        }
        cout << best << "\n";`,
      java: r`
        int best = -1;
        for (int first = 0; first < (1 << (int) n); first++) {
            int presses = tryFirst(lamps, (int) n, first);
            if (presses >= 0 && (best < 0 || presses < best)) best = presses;
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Only the presses of the first row are chosen (`2^n` ways); each later press is forced by the lamp above it. If the last row is dark at the end, the number of presses is a candidate, and the smallest candidate is the answer.'], complexity: 'Time O(2^n * n^2), space O(n^2).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const grid = rs.slice(1, 1 + n).map((row) => [...row.trim()].map(Number));
      // independent: solve by exhaustive search over all press sets for n <= 4, by the row-propagation for larger n
      const apply = (state, i, j) => { for (const [di, dj] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a >= 0 && a < n && b >= 0 && b < n) state[a][b] ^= 1; } };
      let best = -1;
      if (n <= 4) { for (let set = 0; set < 1 << (n * n); set++) { const state = grid.map((row) => row.slice()); let presses = 0; for (let k = 0; k < n * n; k++) if ((set >> k) & 1) { apply(state, Math.floor(k / n), k % n); presses++; } if (state.every((row) => row.every((v) => v === 0)) && (best < 0 || presses < best)) best = presses; } return String(best); }
      for (let first = 0; first < 1 << n; first++) { const state = grid.map((row) => row.slice()); let presses = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const press = i === 0 ? (first >> j) & 1 : state[i - 1][j]; if (press) { presses++; apply(state, i, j); } } if (state[n - 1].every((v) => v === 0) && (best < 0 || presses < best)) best = presses; }
      return String(best);
    },
    tests() {
      const g = rng(691);
      const make = (grid) => `${grid.length}\n${grid.map((row) => row.join('')).join('\n')}\n`;
      const randomGrid = (n, p) => many(n, () => many(n, () => (g() < p ? 1 : 0)));
      const fromPresses = (n, p) => { const state = many(n, () => many(n, () => 0)); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (g() < p) for (const [di, dj] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a >= 0 && a < n && b >= 0 && b < n) state[a][b] ^= 1; } return state; };
      const brute = (grid) => { const n = grid.length; let best = -1; for (let set = 0; set < 1 << (n * n); set++) { const state = grid.map((row) => row.slice()); let presses = 0; for (let k = 0; k < n * n; k++) if ((set >> k) & 1) { presses++; for (const [di, dj] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = Math.floor(k / n) + di, b = (k % n) + dj; if (a >= 0 && a < n && b >= 0 && b < n) state[a][b] ^= 1; } } if (state.every((row) => row.every((v) => v === 0)) && (best < 0 || presses < best)) best = presses; } return best; };
      for (let t = 0; t < 30; t++) { const grid = randomGrid(randInt(g, 1, 4), 0.5); const text = make(grid); const have = this.solve(text); if (have !== String(brute(grid))) throw new Error('lights out differs for ' + text); }
      return ['3\n010\n111\n010\n', '1\n0\n', '1\n1\n', '2\n11\n11\n', '2\n10\n00\n', make(randomGrid(5, 0.5)), make(randomGrid(6, 0.5)), make(randomGrid(7, 0.5)), make(randomGrid(8, 0.5)), make(fromPresses(5, 0.3)), make(fromPresses(6, 0.3)), make(fromPresses(7, 0.4)), make(fromPresses(8, 0.5)), make(fromPresses(8, 0.2)), make(many(8, () => many(8, () => 1))), make(many(5, () => many(5, () => 1))), make(fromPresses(4, 0.5))];
    }
  },

  {
    slug: 'assign-bikes',
    title: 'Give Every Worker a Bike',
    difficulty: 'hard',
    tags: ['backtracking', 'bitmask', 'memoization', 'assignment'],
    concept: {
      title: 'The set of taken bikes is the whole state',
      body: [
        'There are `w` workers and `b` bikes (`w <= b`) placed on a plane. Give each worker a **different** bike so that the total of the Manhattan distances (`|x1 - x2| + |y1 - y2|`) is as small as possible. Trying all assignments means `b! / (b - w)!` possibilities, 362 880 for 9 and 9. The assignment of a worker only depends on **which bikes are already taken**, not on who took which one, so the number of different situations is only `2^b`.',
        'Process the workers in order. The set of taken bikes tells how many workers are done (its number of 1 bits), so it is enough as the state. For worker `i` try every free bike, add the distance, and ask for the best result of the remaining workers with one more bike taken:',
        { code: 'def best(i, used):                          # worker i is next, "used" is the mask of taken bikes\n    if i == len(workers):\n        return 0\n    if used in memo:\n        return memo[used]\n    result = INF\n    for j in range(len(bikes)):\n        if not used >> j & 1:\n            d = abs(workers[i][0] - bikes[j][0]) + abs(workers[i][1] - bikes[j][1])\n            result = min(result, d + best(i + 1, used | 1 << j))\n    memo[used] = result\n    return result' },
        'This is **memoised recursion over subsets**. Note that `i` is not part of the memo key because it can be computed from `used`. The same pattern solves many assignment-like problems: the order of the workers is fixed, and the bikes are the set that changes.'
      ]
    },
    statement: ['On a plane there are `w` workers and `b` bikes (`w <= b`), each with integer coordinates. Give each worker exactly one bike and no bike to two workers. The cost of giving a bike to a worker is the Manhattan distance between them. Print the smallest possible total cost.'],
    inputFormat: ['The first line has `w` and `b`.', 'The next `w` lines have the coordinates `x y` of the workers.', 'The next `b` lines have the coordinates `x y` of the bikes.'],
    outputFormat: ['Print the smallest total distance.'],
    constraints: ['1 <= w <= b <= 9', '0 <= x, y <= 1000'],
    examples: [{ input: '2 2\n0 0\n2 1\n1 2\n3 3\n', note: 'Worker 1 takes bike 1 (distance 3) and worker 2 takes bike 2 (distance 3): total 6. The other way costs 8.' }],
    hints: ['Handle the workers one after another; for each try every bike that is still free.', 'The set of used bikes (a bit mask) tells how many workers are done.', 'Store the best remaining cost for every mask.'],
    program: {
      io: ['w:int b:int', 'workers:int[w][2]', 'bikes:int[b][2]'],
      includes: ['<unordered_map>', '<cstdlib>', '<algorithm>'],
      helpers: {
        python: r`
          def best(workers, bikes, i, used, memo):
              if i == len(workers):
                  return 0
              if used in memo:
                  return memo[used]
              result = 10 ** 9
              for j in range(len(bikes)):
                  if not used >> j & 1:
                      d = abs(workers[i][0] - bikes[j][0]) + abs(workers[i][1] - bikes[j][1])
                      result = min(result, d + best(workers, bikes, i + 1, used | 1 << j, memo))
              memo[used] = result
              return result`,
        cpp: r`
          long long best(const vector<vector<long long>>& workers, const vector<vector<long long>>& bikes, size_t i, int used, unordered_map<int, long long>& memo) {
              if (i == workers.size()) return 0;
              auto found = memo.find(used);
              if (found != memo.end()) return found->second;
              long long result = 1000000000LL;
              for (size_t j = 0; j < bikes.size(); j++) {
                  if (!((used >> j) & 1)) {
                      long long d = llabs(workers[i][0] - bikes[j][0]) + llabs(workers[i][1] - bikes[j][1]);
                      result = min(result, d + best(workers, bikes, i + 1, used | (1 << j), memo));
                  }
              }
              memo[used] = result;
              return result;
          }`,
        java: r`
          static long best(long[][] workers, long[][] bikes, int i, int used, Map<Integer, Long> memo) {
              if (i == workers.length) return 0;
              Long found = memo.get(used);
              if (found != null) return found;
              long result = 1000000000L;
              for (int j = 0; j < bikes.length; j++) {
                  if (((used >> j) & 1) == 0) {
                      long d = Math.abs(workers[i][0] - bikes[j][0]) + Math.abs(workers[i][1] - bikes[j][1]);
                      result = Math.min(result, d + best(workers, bikes, i + 1, used | (1 << j), memo));
                  }
              }
              memo.put(used, result);
              return result;
          }`
      },
      python: 'print(best(workers, bikes, 0, 0, {}))',
      cpp: r`
        unordered_map<int, long long> memo;
        cout << best(workers, bikes, 0, 0, memo) << "\n";`,
      java: 'System.out.println(best(workers, bikes, 0, 0, new HashMap<>()));'
    },
    solution: { explanation: ['The workers are handled in order and the mask of taken bikes is the state: the best cost for the rest is the minimum over free bikes of the distance plus the best cost with that bike taken. A dictionary keyed by the mask stores each state once.'], complexity: 'Time O(2^b * b), space O(2^b).' },
    solve(input) {
      const rs = rows(input); const [w, b] = nums(rs[0]); const workers = rs.slice(1, 1 + w).map(nums); const bikes = rs.slice(1 + w, 1 + w + b).map(nums);
      const dist = workers.map((p) => bikes.map((q) => Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1])));
      let best = Infinity; const used = Array(b).fill(false); // plain permutation search with a bound: independent of the mask table
      const go = (i, cost) => { if (cost >= best) return; if (i === w) { best = cost; return; } for (let j = 0; j < b; j++) if (!used[j]) { used[j] = true; go(i + 1, cost + dist[i][j]); used[j] = false; } };
      go(0, 0); return String(best);
    },
    tests() {
      const g = rng(692);
      const make = (workers, bikes) => `${workers.length} ${bikes.length}\n${workers.map((p) => p.join(' ')).join('\n')}\n${bikes.map((p) => p.join(' ')).join('\n')}\n`;
      const pts = (k, hi) => many(k, () => [randInt(g, 0, hi), randInt(g, 0, hi)]);
      return ['2 2\n0 0\n2 1\n1 2\n3 3\n', make([[0, 0]], [[1, 1]]), make([[0, 0]], [[5, 5], [1, 0], [3, 3]]), make(pts(9, 1000), pts(9, 1000)), make(pts(9, 10), pts(9, 10)), make(pts(5, 1000), pts(9, 1000)), make(pts(8, 1000), pts(9, 1000)), make(pts(9, 1), pts(9, 1)), make(many(9, () => [500, 500]), many(9, () => [500, 500])), make(many(9, (i) => [i, 0]), many(9, (i) => [i, 1000])), make(pts(9, 100), pts(9, 100)), make(pts(7, 1000), pts(8, 1000)), make(pts(9, 5), pts(9, 1000)), make(many(9, (i) => [i * 100, i * 100]), many(9, (i) => [(8 - i) * 100, (8 - i) * 100]))];
    }
  },

  {
    slug: 'squareful-arrays',
    title: 'Neighbours That Add Up to a Square',
    difficulty: 'hard',
    tags: ['backtracking', 'permutations', 'duplicates', 'math'],
    concept: {
      title: 'Only extend the arrangement with numbers that make a perfect square with the last one',
      body: [
        'Arrange the given numbers in a row so that **each two neighbours add up to a perfect square** (0, 1, 4, 9, 16, ...). Count the different arrangements; if the array has equal numbers, two arrangements that look the same count once. This is a permutation search with a rule between **neighbouring** choices, and with duplicates to handle.',
        'Sort the numbers, then build the arrangement from left to right. A number can be placed after the last one only if their sum is a perfect square. To handle the equal numbers, use the usual rule: **if a number equals the previous number in the sorted list and that previous number has not been used (in this branch), skip it**; otherwise the same arrangement would be produced for both copies.',
        { code: 'def count(last, placed):\n    if placed == n:\n        return 1\n    total = 0\n    for i in range(n):\n        if used[i]:\n            continue\n        if i > 0 and a[i] == a[i - 1] and not used[i - 1]:\n            continue                       # a copy of the same value: only the first copy leads\n        if last < 0 or is_square(last + a[i]):\n            used[i] = True\n            total += count(a[i], placed + 1)\n            used[i] = False\n    return total' },
        'The perfect-square test uses the integer square root: `r = isqrt(x)` and `r * r == x`. Since the rule prunes at **every step** (only a few numbers fit after a given one), the search is much smaller than the `12!` of all orders. The count can be zero.'
      ]
    },
    statement: ['You are given `n` non-negative integers; some may be equal. Count the different arrangements of the numbers in a row such that the sum of every two neighbouring numbers is a perfect square (0 is a perfect square). Two arrangements are the same if they have the same numbers in every position.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print the number of arrangements (it can be 0).'],
    constraints: ['1 <= n <= 12', '0 <= each integer <= 10^9'],
    examples: [{ input: '3\n1 17 8\n', note: 'The arrangements 1 8 17 and 17 8 1 work: 1 + 8 = 9, 8 + 17 = 25.' }],
    hints: ['Sort the numbers and build the row from left to right.', 'A number may follow the last one only if their sum is a perfect square; use an integer square root to test this.', 'Skip a number equal to the previous one when the previous copy is still unused.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      includes: ['<algorithm>', '<cmath>'],
      helpers: {
        python: r`
          from math import isqrt

          def is_square(x):
              r = isqrt(x)
              return r * r == x

          def count(a, used, last, placed):
              if placed == len(a):
                  return 1
              total = 0
              for i in range(len(a)):
                  if used[i]:
                      continue
                  if i > 0 and a[i] == a[i - 1] and not used[i - 1]:
                      continue
                  if last < 0 or is_square(last + a[i]):
                      used[i] = True
                      total += count(a, used, a[i], placed + 1)
                      used[i] = False
              return total`,
        cpp: r`
          bool isSquare(long long x) {
              long long r = (long long)sqrtl((long double)x);
              while (r * r > x) r--;
              while ((r + 1) * (r + 1) <= x) r++;
              return r * r == x;
          }

          long long countArrangements(const vector<long long>& a, vector<char>& used, long long last, size_t placed) {
              if (placed == a.size()) return 1;
              long long total = 0;
              for (size_t i = 0; i < a.size(); i++) {
                  if (used[i]) continue;
                  if (i > 0 && a[i] == a[i - 1] && !used[i - 1]) continue;
                  if (last < 0 || isSquare(last + a[i])) {
                      used[i] = 1;
                      total += countArrangements(a, used, a[i], placed + 1);
                      used[i] = 0;
                  }
              }
              return total;
          }`,
        java: r`
          static boolean isSquare(long x) {
              long r = (long) Math.sqrt((double) x);
              while (r * r > x) r--;
              while ((r + 1) * (r + 1) <= x) r++;
              return r * r == x;
          }

          static long countArrangements(long[] a, boolean[] used, long last, int placed) {
              if (placed == a.length) return 1;
              long total = 0;
              for (int i = 0; i < a.length; i++) {
                  if (used[i]) continue;
                  if (i > 0 && a[i] == a[i - 1] && !used[i - 1]) continue;
                  if (last < 0 || isSquare(last + a[i])) {
                      used[i] = true;
                      total += countArrangements(a, used, a[i], placed + 1);
                      used[i] = false;
                  }
              }
              return total;
          }`
      },
      python: r`
        a.sort()
        print(count(a, [False] * n, -1, 0))`,
      cpp: r`
        sort(a.begin(), a.end());
        vector<char> used(n, 0);
        cout << countArrangements(a, used, -1, 0) << "\n";`,
      java: r`
        Arrays.sort(a);
        System.out.println(countArrangements(a, new boolean[(int) n], -1, 0));`
    },
    solution: { explanation: ['After sorting, the row is built from left to right. A number is tried only if it is unused, if it is not a repeated copy whose earlier copy is unused, and if its sum with the last number is a perfect square. A complete row counts one.'], complexity: 'Time proportional to the number of partial arrangements (small thanks to the square rule), space O(n).' },
    solve(input) {
      const a = nums(rows(input)[1]); const isSq = (x) => { const r = Math.round(Math.sqrt(x)); return r * r === x; };
      const counts = new Map(); for (const x of a) counts.set(x, (counts.get(x) || 0) + 1); const values = [...counts.keys()].sort((p, q) => p - q);
      const go = (last, left) => { if (left === 0) return 1; let total = 0; for (const v of values) { const c = counts.get(v); if (!c) continue; if (last !== null && !isSq(last + v)) continue; counts.set(v, c - 1); total += go(v, left - 1); counts.set(v, c); } return total; };
      return String(go(null, a.length));
    },
    tests() {
      const g = rng(693);
      const make = (a) => `${a.length}\n${a.join(' ')}\n`;
      const brute = (a) => { const seen = new Set(); const perm = (cur, left) => { if (!left.length) { seen.add(cur.join(',')); return; } left.forEach((x, i) => { if (cur.length && !Number.isInteger(Math.sqrt(cur[cur.length - 1] + x))) return; perm([...cur, x], [...left.slice(0, i), ...left.slice(i + 1)]); }); }; perm([], a); return seen.size; };
      crossCheck(() => make(randArray(g, randInt(g, 1, 7), 0, 30)), (i) => this.solve(i), (i) => brute(nums(rows(i)[1])), 150);
      return ['3\n1 17 8\n', '1\n5\n', '2\n1 3\n', '2\n2 2\n', '2\n1 2\n', '3\n2 2 2\n', make(many(12, (i) => i + 1)), make(many(12, (i) => i + 4)), make(many(12, () => 2)), make(many(12, (i) => (i % 2 ? 2 : 7))), make(randArray(g, 12, 0, 30)), make(randArray(g, 12, 0, 60)), make([0, 0, 0, 1, 1, 1, 4, 4, 9, 9, 16, 16]), make([1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78]), make(randArray(g, 12, 0, 1000000000))];
    }
  },

  {
    slug: 'smallest-hamiltonian-path',
    title: 'The Smallest Walk Through All Towns',
    difficulty: 'hard',
    tags: ['backtracking', 'bitmask', 'graph', 'hamiltonian'],
    concept: {
      title: 'Ask a table first whether the rest of the walk can still be finished',
      body: [
        'Among all walks that visit every vertex of a graph once (Hamiltonian paths) we want the smallest one in dictionary order (vertex numbers compared position by position). A plain backtracking in increasing order finds it as the first walk it completes, but it can lose enormous time in a dead end: after a few unlucky steps, all the ways to continue may fail, and the search tries each of them before going back.',
        'Avoid it by **asking first**. Let `ext[mask][v]` be true when there is a path that starts at `v` and visits **exactly** the vertices of `mask` (with `v` in `mask`). It is built from smaller masks: a path from `v` over `mask` is `v` followed by a path over `mask` without `v`, starting at a neighbour `u` of `v`.',
        { code: 'for mask in range(1, 1 << n):               # small masks first\n    for v in range(n):\n        if mask >> v & 1:\n            rest = mask ^ (1 << v)\n            if rest == 0:\n                ext[mask][v] = True            # a path of one vertex\n            else:\n                ext[mask][v] = any(ext[rest][u] for u in range(n) if adj[v] >> u & 1 and rest >> u & 1)' },
        'Now the walk is built greedily: the first vertex is the **smallest** `s` with `ext[full][s]`; then from the current vertex take the smallest neighbour `u` in the remaining set with `ext[remaining][u]`. Every step is guaranteed to be completable, so there is **no backtracking at all** during the construction. The table costs `2^n * n^2` steps. This is the idea of *guiding a search with a feasibility table*.'
      ]
    },
    statement: ['An undirected graph has `n` vertices numbered 1 to `n`. A Hamiltonian path visits every vertex exactly once, moving along edges. Among all Hamiltonian paths (read as the sequence of vertex numbers) print the smallest in dictionary order. If there is no Hamiltonian path, print `-1`.'],
    inputFormat: ['The first line has `n` and `m`.', 'Each of the next `m` lines has two vertices joined by an edge.'],
    outputFormat: ['The `n` vertices of the path separated by spaces, or `-1`.'],
    constraints: ['1 <= n <= 12', '0 <= m <= n * (n - 1) / 2, no repeated edges and no loops'],
    examples: [{ input: '4 4\n1 2\n2 3\n3 4\n1 4\n', note: 'The paths 1 2 3 4, 1 4 3 2, 2 1 4 3 and so on exist; the smallest is 1 2 3 4.' }],
    hints: ['Build a table: can a path start at v and visit exactly the vertices of this set?', 'Fill it from small sets to big sets, using the table for the set without v.', 'Construct the answer greedily, always taking the smallest vertex that keeps the rest completable.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      python: r`
        adj = [0] * n
        for a, b in edges:
            adj[a - 1] |= 1 << (b - 1)
            adj[b - 1] |= 1 << (a - 1)
        ext = [[False] * n for _ in range(1 << n)]
        for mask in range(1, 1 << n):
            for v in range(n):
                if mask >> v & 1:
                    rest = mask ^ (1 << v)
                    if rest == 0:
                        ext[mask][v] = True
                    else:
                        for u in range(n):
                            if adj[v] >> u & 1 and rest >> u & 1 and ext[rest][u]:
                                ext[mask][v] = True
                                break
        full = (1 << n) - 1
        answer = None
        for s in range(n):
            if ext[full][s]:
                path = [s]
                mask = full ^ (1 << s)
                v = s
                while mask:
                    for u in range(n):
                        if adj[v] >> u & 1 and mask >> u & 1 and ext[mask][u]:
                            path.append(u)
                            mask ^= 1 << u
                            v = u
                            break
                answer = path
                break
        print(" ".join(str(x + 1) for x in answer) if answer else -1)`,
      cpp: r`
        vector<int> adj(n, 0);
        for (int i = 0; i < m; i++) {
            adj[edges[i][0] - 1] |= 1 << (edges[i][1] - 1);
            adj[edges[i][1] - 1] |= 1 << (edges[i][0] - 1);
        }
        vector<vector<char>> ext(1 << n, vector<char>(n, 0));
        for (int mask = 1; mask < (1 << n); mask++) {
            for (int v = 0; v < n; v++) {
                if (!((mask >> v) & 1)) continue;
                int rest = mask ^ (1 << v);
                if (rest == 0) {
                    ext[mask][v] = 1;
                } else {
                    for (int u = 0; u < n; u++) {
                        if (((adj[v] >> u) & 1) && ((rest >> u) & 1) && ext[rest][u]) {
                            ext[mask][v] = 1;
                            break;
                        }
                    }
                }
            }
        }
        int full = (1 << n) - 1;
        vector<int> path;
        for (int s = 0; s < n && path.empty(); s++) {
            if (!ext[full][s]) continue;
            path.push_back(s);
            int mask = full ^ (1 << s), v = s;
            while (mask) {
                for (int u = 0; u < n; u++) {
                    if (((adj[v] >> u) & 1) && ((mask >> u) & 1) && ext[mask][u]) {
                        path.push_back(u);
                        mask ^= 1 << u;
                        v = u;
                        break;
                    }
                }
            }
        }
        if (path.empty()) {
            cout << -1 << "\n";
        } else {
            for (size_t i = 0; i < path.size(); i++) cout << (i ? " " : "") << path[i] + 1;
            cout << "\n";
        }`,
      java: r`
        int[] adj = new int[(int) n];
        for (int i = 0; i < m; i++) {
            adj[(int) edges[i][0] - 1] |= 1 << (edges[i][1] - 1);
            adj[(int) edges[i][1] - 1] |= 1 << (edges[i][0] - 1);
        }
        boolean[][] ext = new boolean[1 << (int) n][(int) n];
        for (int mask = 1; mask < (1 << n); mask++) {
            for (int v = 0; v < n; v++) {
                if (((mask >> v) & 1) == 0) continue;
                int rest = mask ^ (1 << v);
                if (rest == 0) {
                    ext[mask][v] = true;
                } else {
                    for (int u = 0; u < n; u++) {
                        if (((adj[v] >> u) & 1) != 0 && ((rest >> u) & 1) != 0 && ext[rest][u]) {
                            ext[mask][v] = true;
                            break;
                        }
                    }
                }
            }
        }
        int full = (1 << (int) n) - 1;
        List<Integer> path = new ArrayList<>();
        for (int s = 0; s < n && path.isEmpty(); s++) {
            if (!ext[full][s]) continue;
            path.add(s);
            int mask = full ^ (1 << s), v = s;
            while (mask != 0) {
                for (int u = 0; u < n; u++) {
                    if (((adj[v] >> u) & 1) != 0 && ((mask >> u) & 1) != 0 && ext[mask][u]) {
                        path.add(u);
                        mask ^= 1 << u;
                        v = u;
                        break;
                    }
                }
            }
        }
        if (path.isEmpty()) {
            System.out.println(-1);
        } else {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < path.size(); i++) sb.append(i > 0 ? " " : "").append(path.get(i) + 1);
            System.out.println(sb);
        }`
    },
    solution: { explanation: ['`ext[mask][v]` tells if a path can start at `v` and visit exactly `mask`. The answer starts with the smallest vertex `s` for which `ext[full][s]` is true, then repeatedly takes the smallest neighbour in the remaining set that still has `ext` true. No dead end is ever entered.'], complexity: 'Time O(2^n * n^2), space O(2^n * n).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const adj = Array(n).fill(0);
      for (let i = 1; i <= m; i++) { const [a, b] = nums(rs[i]); adj[a - 1] |= 1 << (b - 1); adj[b - 1] |= 1 << (a - 1); }
      if (n <= 9) { // plain lexicographic search
        const path = []; const used = Array(n).fill(false);
        const go = () => { if (path.length === n) return true; for (let v = 0; v < n; v++) { if (used[v]) continue; if (path.length && !((adj[path[path.length - 1]] >> v) & 1)) continue; used[v] = true; path.push(v); if (go()) return true; path.pop(); used[v] = false; } return false; };
        return go() ? path.map((x) => x + 1).join(' ') : '-1';
      }
      const can = Array.from({ length: 1 << n }, () => Array(n).fill(false)); for (let v = 0; v < n; v++) can[1 << v][v] = true;
      for (let mask = 1; mask < 1 << n; mask++) for (let v = 0; v < n; v++) { if (!((mask >> v) & 1)) continue; const rest = mask ^ (1 << v); if (!rest) continue; for (let u = 0; u < n; u++) if (((adj[v] >> u) & 1) && ((rest >> u) & 1) && can[rest][u]) { can[mask][v] = true; break; } }
      const full = (1 << n) - 1; for (let s = 0; s < n; s++) if (can[full][s]) { const path = [s]; let mask = full ^ (1 << s), v = s; while (mask) { for (let u = 0; u < n; u++) if (((adj[v] >> u) & 1) && ((mask >> u) & 1) && can[mask][u]) { path.push(u); mask ^= 1 << u; v = u; break; } } return path.map((x) => x + 1).join(' '); }
      return '-1';
    },
    tests() {
      const g = rng(694);
      const allPairs = (n) => { const e = []; for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) e.push([a, b]); return e; };
      const some = (n, p) => allPairs(n).filter(() => g() < p);
      const make = (n, edges) => `${n} ${edges.length}\n${edges.map((e) => e.join(' ')).join('\n')}${edges.length ? '\n' : ''}`;
      const withPath = (n, extra) => { const perm = shuffle(g, many(n, (i) => i + 1)); const e = many(n - 1, (i) => [Math.min(perm[i], perm[i + 1]), Math.max(perm[i], perm[i + 1])]); for (const pair of some(n, extra)) if (!e.some((x) => x[0] === pair[0] && x[1] === pair[1])) e.push(pair); return e; };
      return ['4 4\n1 2\n2 3\n3 4\n1 4\n', '1 0\n', '2 0\n', '2 1\n1 2\n', '3 2\n1 2\n1 3\n', make(12, allPairs(12)), make(12, allPairs(11)), make(12, withPath(12, 0.05)), make(12, withPath(12, 0.1)), make(12, some(12, 0.15)), make(12, some(12, 0.25)), make(12, many(11, (i) => [i + 1, i + 2])), make(12, many(12, (i) => [Math.min(i + 1, ((i + 1) % 12) + 1), Math.max(i + 1, ((i + 1) % 12) + 1)])), make(12, [[1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [1, 11], [1, 12]]), make(9, some(9, 0.3)), make(11, withPath(11, 0.08))];
    }
  },

  {
    slug: 'number-path-puzzle',
    title: 'Numbers That Follow Each Other',
    difficulty: 'hard',
    tags: ['backtracking', 'puzzle', 'grid', 'pruning'],
    concept: {
      title: 'Walk from 1 to the last number, and stay close enough to the next given number',
      body: [
        'A number path puzzle is an `n` by `n` grid in which the numbers `1 .. n*n` must be written once each so that **each number is next to the following number** (above, below, left or right). So the numbers form a walk through all the cells. Some numbers are given, among them always 1 and `n*n`. The empty cells (`0`) must be filled. Count the ways to complete the grid.',
        'Walk the path from 1: the cell of the number `v + 1` is one of the 4 neighbours of the cell of `v`. If `v + 1` is **given**, its cell is fixed and it must be a neighbour; otherwise try every free neighbour that is empty and not used. A free cell must not be a cell of some given number (that number has to stand there).',
        { code: 'def walk(v, row, col):\n    if v == n * n:\n        return 1\n    total = 0\n    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n        nr, nc = row + dr, col + dc\n        if not (0 <= nr < n and 0 <= nc < n):\n            continue\n        if v + 1 in pos:                             # the next number has its place\n            if pos[v + 1] != (nr, nc):\n                continue\n        elif grid[nr][nc] != 0 or used[nr][nc]:      # a given cell, or a cell already on the path\n            continue\n        else:\n            g = next_given[v + 1]                    # the next given number above\n            if abs(nr - pos[g][0]) + abs(nc - pos[g][1]) > g - (v + 1):\n                continue                             # too far away to reach it in time\n        used[nr][nc] = True\n        total += walk(v + 1, nr, nc)\n        used[nr][nc] = False\n    return total' },
        'The last check is the important **pruning**: if the next given number `g` is at Manhattan distance `d` from the new cell, it needs at least `d` steps, so we must have `d <= g - (v + 1)`. Without this test the search wanders far away from the numbers it must reach and wastes a huge amount of time.'
      ]
    },
    statement: ['An `n` by `n` grid contains some of the numbers 1 to `n * n` (different numbers) and zeros for empty cells. The numbers 1 and `n * n` are always given. Fill the empty cells with the missing numbers so that every number from 1 to `n * n - 1` is in a cell next to the cell of the following number (neighbours share a side). Count the ways to fill the grid.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has `n` integers.'],
    outputFormat: ['Print the number of completions (it can be 0).'],
    constraints: ['2 <= n <= 5', 'The nonzero numbers are different, and the numbers 1 and n * n are among them.'],
    examples: [{ input: '2\n1 0\n4 0\n', note: 'The number 2 must be next to 1, and the only free cell next to 1 is on its right; then 3 goes below 2, and 4 is next to 3. The grid becomes 1 2 / 4 3: one way.' }],
    hints: ['Start at the cell of 1 and place the numbers in order.', 'If the next number is given, check that its cell is a neighbour; otherwise try the empty unused neighbours.', 'Stop a branch when the next given number is too far away to be reached in the steps that are left.'],
    program: {
      io: ['n:int', 'grid:int[n][n]'],
      helpers: {
        python: r`
          def walk(grid, n, pos, next_given, used, v, row, col):
              if v == n * n:
                  return 1
              total = 0
              for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                  nr, nc = row + dr, col + dc
                  if not (0 <= nr < n and 0 <= nc < n):
                      continue
                  if v + 1 in pos:
                      if pos[v + 1] != (nr, nc):
                          continue
                  else:
                      if grid[nr][nc] != 0 or used[nr][nc]:
                          continue
                      g = next_given[v + 1]
                      if abs(nr - pos[g][0]) + abs(nc - pos[g][1]) > g - (v + 1):
                          continue
                  used[nr][nc] = True
                  total += walk(grid, n, pos, next_given, used, v + 1, nr, nc)
                  used[nr][nc] = False
              return total`,
        cpp: r`
          long long walk(const vector<vector<long long>>& grid, int n, const vector<int>& posRow, const vector<int>& posCol, const vector<int>& nextGiven, vector<vector<char>>& used, int v, int row, int col) {
              if (v == n * n) return 1;
              long long total = 0;
              int dr[4] = {1, -1, 0, 0};
              int dc[4] = {0, 0, 1, -1};
              for (int d = 0; d < 4; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                  if (posRow[v + 1] >= 0) {
                      if (posRow[v + 1] != nr || posCol[v + 1] != nc) continue;
                  } else {
                      if (grid[nr][nc] != 0 || used[nr][nc]) continue;
                      int g = nextGiven[v + 1];
                      if (abs(nr - posRow[g]) + abs(nc - posCol[g]) > g - (v + 1)) continue;
                  }
                  used[nr][nc] = 1;
                  total += walk(grid, n, posRow, posCol, nextGiven, used, v + 1, nr, nc);
                  used[nr][nc] = 0;
              }
              return total;
          }`,
        java: r`
          static long walk(long[][] grid, int n, int[] posRow, int[] posCol, int[] nextGiven, boolean[][] used, int v, int row, int col) {
              if (v == n * n) return 1;
              long total = 0;
              int[] dr = {1, -1, 0, 0};
              int[] dc = {0, 0, 1, -1};
              for (int d = 0; d < 4; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                  if (posRow[v + 1] >= 0) {
                      if (posRow[v + 1] != nr || posCol[v + 1] != nc) continue;
                  } else {
                      if (grid[nr][nc] != 0 || used[nr][nc]) continue;
                      int g = nextGiven[v + 1];
                      if (Math.abs(nr - posRow[g]) + Math.abs(nc - posCol[g]) > g - (v + 1)) continue;
                  }
                  used[nr][nc] = true;
                  total += walk(grid, n, posRow, posCol, nextGiven, used, v + 1, nr, nc);
                  used[nr][nc] = false;
              }
              return total;
          }`
      },
      includes: ['<cstdlib>'],
      python: r`
        pos = {}
        for i in range(n):
            for j in range(n):
                if grid[i][j]:
                    pos[grid[i][j]] = (i, j)
        last = n * n
        next_given = [0] * (last + 2)
        next_given[last] = last
        for v in range(last - 1, 0, -1):
            next_given[v] = v if v in pos else next_given[v + 1]
        used = [[False] * n for _ in range(n)]
        start = pos[1]
        used[start[0]][start[1]] = True
        print(walk(grid, n, pos, next_given, used, 1, start[0], start[1]))`,
      cpp: r`
        int last = (int)(n * n);
        vector<int> posRow(last + 2, -1), posCol(last + 2, -1), nextGiven(last + 2, 0);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j]) {
                    posRow[grid[i][j]] = i;
                    posCol[grid[i][j]] = j;
                }
            }
        }
        nextGiven[last] = last;
        for (int v = last - 1; v >= 1; v--) nextGiven[v] = posRow[v] >= 0 ? v : nextGiven[v + 1];
        vector<vector<char>> used(n, vector<char>(n, 0));
        used[posRow[1]][posCol[1]] = 1;
        cout << walk(grid, (int)n, posRow, posCol, nextGiven, used, 1, posRow[1], posCol[1]) << "\n";`,
      java: r`
        int last = (int) (n * n);
        int[] posRow = new int[last + 2], posCol = new int[last + 2], nextGiven = new int[last + 2];
        Arrays.fill(posRow, -1);
        Arrays.fill(posCol, -1);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] != 0) {
                    posRow[(int) grid[i][j]] = i;
                    posCol[(int) grid[i][j]] = j;
                }
            }
        }
        nextGiven[last] = last;
        for (int v = last - 1; v >= 1; v--) nextGiven[v] = posRow[v] >= 0 ? v : nextGiven[v + 1];
        boolean[][] used = new boolean[(int) n][(int) n];
        used[posRow[1]][posCol[1]] = true;
        System.out.println(walk(grid, (int) n, posRow, posCol, nextGiven, used, 1, posRow[1], posCol[1]));`
    },
    solution: { explanation: ['The walk starts at the cell of 1. The cell of `v + 1` is a neighbour of the cell of `v`: if `v + 1` is given, its cell must be that neighbour; otherwise any empty unused neighbour that is close enough to the next given number is tried, and the cell is marked and unmarked around the recursive call.'], complexity: 'Time exponential in the empty cells, small thanks to the distance test; space O(n^2).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const grid = rs.slice(1, 1 + n).map(nums); const pos = new Map();
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (grid[i][j]) pos.set(grid[i][j], [i, j]);
      const seen = grid.map((row) => row.map(() => false)); const path = [];
      const start = pos.get(1); let count = 0; // plain depth-first search over all walks, with the givens checked as numbers are written
      const go = (v, i, j) => { seen[i][j] = true; if (v === n * n) { count++; seen[i][j] = false; return; } for (const [di, dj] of DIRS) { const a = i + di, b = j + dj; if (a < 0 || a >= n || b < 0 || b >= n || seen[a][b]) continue; const given = grid[a][b]; if (given && given !== v + 1) continue; if (!given && pos.has(v + 1)) continue; go(v + 1, a, b); } seen[i][j] = false; };
      go(1, start[0], start[1]); return String(count);
    },
    tests() {
      const g = rng(695);
      const make = (grid) => `${grid.length}\n${grid.map((row) => row.join(' ')).join('\n')}\n`;
      const randomWalk = (n) => { for (let attempt = 0; attempt < 400; attempt++) { const cell = Array.from({ length: n }, () => Array(n).fill(0)); let i = randInt(g, 0, n - 1), j = randInt(g, 0, n - 1); cell[i][j] = 1; let v = 1; while (v < n * n) { const opts = DIRS.map(([di, dj]) => [i + di, j + dj]).filter(([a, b]) => a >= 0 && a < n && b >= 0 && b < n && !cell[a][b]); if (!opts.length) break; [i, j] = opts[randInt(g, 0, opts.length - 1)]; cell[i][j] = ++v; } if (v === n * n) return cell; } const snake = Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => a * n + (a % 2 ? n - b : b + 1))); return snake; };
      const puzzle = (n, keepEvery, extra) => { const full = randomWalk(n); return full.map((row) => row.map((v) => (v === 1 || v === n * n || (extra && g() < extra) || (keepEvery && v % keepEvery === 0) ? v : 0))); };
      return [make([[1, 0], [4, 0]]), make([[1, 2], [4, 3]]), make([[1, 0], [0, 4]]), make([[1, 0, 0], [0, 0, 0], [0, 0, 9]]), make([[1, 0, 0], [0, 5, 0], [0, 0, 9]]), make(puzzle(4, 4, 0)), make(puzzle(4, 0, 0.2)), make(puzzle(4, 5, 0)), make(puzzle(5, 5, 0)), make(puzzle(5, 0, 0.25)), make(puzzle(5, 0, 0.15)), make(puzzle(5, 8, 0)), make(puzzle(5, 6, 0)), make(puzzle(3, 3, 0)), make(puzzle(5, 0, 0.35))];
    }
  }
];
