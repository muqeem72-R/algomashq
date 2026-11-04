import { r, rng, randInt, randArray, many, nums, rows, randWord, shuffle } from '../../lib.mjs';

// Runs fast(input) against a slow, independent computation on many small random inputs; throws when they differ.
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export default [
  {
    slug: 'word-search-in-grid',
    title: 'Is the Word Hidden in the Grid?',
    difficulty: 'medium',
    tags: ['backtracking', 'grid', 'dfs'],
    concept: {
      title: 'Follow the letters, and free the cell when the road ends',
      body: [
        'A word is hidden in a grid if you can walk from cell to cell (up, down, left or right) so that the cells spell the word, and **no cell is used twice**. Try every cell as the start. From a cell that matches the current letter, try the four neighbours for the next letter. A cell used on the current road is marked, and **unmarked when the search leaves it**, because another road may use it.',
        { code: 'def search(row, col, k):\n    if grid[row][col] != word[k]:\n        return False                      # wrong letter: this road is dead\n    if k == len(word) - 1:\n        return True                       # the last letter matched\n    seen[row][col] = True\n    found = False\n    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n        nr, nc = row + dr, col + dc\n        if 0 <= nr < r and 0 <= nc < c and not seen[nr][nc] and search(nr, nc, k + 1):\n            found = True\n            break                         # one road is enough: stop the search\n    seen[row][col] = False\n    return found' },
        'The check of the letter happens **first**, so a road is cut at the first wrong letter. That is why the search is fast in practice: a word of length `L` has at most `4 * 3^(L-1)` roads from one cell, and most of them are cut long before the end. As soon as one road succeeds, all the callers return `True` and nothing else is explored.'
      ]
    },
    statement: ['A grid of lowercase letters and a word are given. The word is *in the grid* if its letters can be found in order in cells that are neighbours (above, below, left or right of each other) and no cell is used more than once. Decide whether the word is in the grid.'],
    inputFormat: ['The first line has `r` and `c`.', 'Each of the next `r` lines has `c` letters.', 'The last line has the word.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= r, c <= 8', '1 <= length of the word <= 8'],
    examples: [{ input: '3 4\nabce\nsfcs\nadee\nabcced\n', note: 'The road a(0,0), b(0,1), c(0,2), c(1,2), e(2,2), d(2,1) spells abcced.' }],
    hints: ['Start a search from every cell.', 'Check the letter first: a wrong letter ends this road at once.', 'Mark the cell before trying the neighbours and unmark it afterwards.'],
    program: {
      io: ['r:int c:int', 'grid:rows[r]', 'word:word'],
      helpers: {
        python: r`
          def search(grid, r, c, word, row, col, k, seen):
              if grid[row][col] != word[k]:
                  return False
              if k == len(word) - 1:
                  return True
              seen[row][col] = True
              found = False
              for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                  nr, nc = row + dr, col + dc
                  if 0 <= nr < r and 0 <= nc < c and not seen[nr][nc] and search(grid, r, c, word, nr, nc, k + 1, seen):
                      found = True
                      break
              seen[row][col] = False
              return found`,
        cpp: r`
          bool search(const vector<string>& grid, int r, int c, const string& word, int row, int col, size_t k, vector<vector<char>>& seen) {
              if (grid[row][col] != word[k]) return false;
              if (k == word.size() - 1) return true;
              seen[row][col] = 1;
              bool found = false;
              int dr[4] = {1, -1, 0, 0};
              int dc[4] = {0, 0, 1, -1};
              for (int d = 0; d < 4 && !found; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr >= 0 && nr < r && nc >= 0 && nc < c && !seen[nr][nc] && search(grid, r, c, word, nr, nc, k + 1, seen)) found = true;
              }
              seen[row][col] = 0;
              return found;
          }`,
        java: r`
          static boolean search(String[] grid, int r, int c, String word, int row, int col, int k, boolean[][] seen) {
              if (grid[row].charAt(col) != word.charAt(k)) return false;
              if (k == word.length() - 1) return true;
              seen[row][col] = true;
              boolean found = false;
              int[] dr = {1, -1, 0, 0};
              int[] dc = {0, 0, 1, -1};
              for (int d = 0; d < 4 && !found; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr >= 0 && nr < r && nc >= 0 && nc < c && !seen[nr][nc] && search(grid, r, c, word, nr, nc, k + 1, seen)) found = true;
              }
              seen[row][col] = false;
              return found;
          }`
      },
      python: r`
        seen = [[False] * c for _ in range(r)]
        found = False
        for row in range(r):
            for col in range(c):
                if search(grid, r, c, word, row, col, 0, seen):
                    found = True
        print("yes" if found else "no")`,
      cpp: r`
        vector<vector<char>> seen(r, vector<char>(c, 0));
        bool found = false;
        for (int row = 0; row < r && !found; row++) {
            for (int col = 0; col < c && !found; col++) {
                if (search(grid, (int)r, (int)c, word, row, col, 0, seen)) found = true;
            }
        }
        cout << (found ? "yes" : "no") << "\n";`,
      java: r`
        boolean[][] seen = new boolean[(int) r][(int) c];
        boolean found = false;
        for (int row = 0; row < r && !found; row++) {
            for (int col = 0; col < c && !found; col++) {
                if (search(grid, (int) r, (int) c, word, row, col, 0, seen)) found = true;
            }
        }
        System.out.println(found ? "yes" : "no");`
    },
    solution: { explanation: ['A search starts from every cell. It fails at the first wrong letter, succeeds when the last letter matches, and otherwise marks the cell, tries the four neighbours for the next letter, and unmarks the cell. Success is passed up at once.'], complexity: 'Time O(r * c * 4 * 3^(L-1)) in the worst case, usually far less; space O(r * c).' },
    solve(input) {
      const rs = rows(input); const [r, c] = nums(rs[0]); const grid = rs.slice(1, 1 + r); const word = rs[1 + r].trim();
      const seen = grid.map((row) => [...row].map(() => false));
      const go = (i, j, k) => { if (grid[i][j] !== word[k]) return false; if (k === word.length - 1) return true; seen[i][j] = true; let ok = false; for (const [di, dj] of DIRS) { const a = i + di, b = j + dj; if (a >= 0 && a < r && b >= 0 && b < c && !seen[a][b] && go(a, b, k + 1)) { ok = true; break; } } seen[i][j] = false; return ok; };
      for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) if (go(i, j, 0)) return 'yes';
      return 'no';
    },
    tests() {
      const g = rng(643);
      const make = (grid, word) => `${grid.length} ${grid[0].length}\n${grid.join('\n')}\n${word}\n`;
      const randGrid = (r, c, pool) => many(r, () => randWord(g, c, pool));
      const walkWord = (grid, len) => { const r = grid.length, c = grid[0].length; for (let attempt = 0; attempt < 50; attempt++) { let i = randInt(g, 0, r - 1), j = randInt(g, 0, c - 1); const seen = new Set([`${i},${j}`]); let w = grid[i][j]; while (w.length < len) { const opts = DIRS.map(([di, dj]) => [i + di, j + dj]).filter(([a, b]) => a >= 0 && a < r && b >= 0 && b < c && !seen.has(`${a},${b}`)); if (!opts.length) break; [i, j] = opts[randInt(g, 0, opts.length - 1)]; seen.add(`${i},${j}`); w += grid[i][j]; } if (w.length === len) return w; } return 'z'.repeat(len); };
      const big = randGrid(8, 8, 'abc'); const bigWord = walkWord(big, 8); const grid67 = randGrid(6, 7, 'abcd');
      return ['3 4\nabce\nsfcs\nadee\nabcced\n', make(['a'], 'a'), make(['a'], 'b'), make(['ab', 'cd'], 'abdc'), make(['ab', 'cd'], 'abcd'), make(['ab', 'cd'], 'acdb'), make(['aaa', 'aaa', 'aaa'], 'aaaaaaaa'), make(['aaa', 'aaa', 'aaa'], 'aaaaaaab'), make(many(8, () => 'aaaaaaaa'), 'aaaaaaab'), make(many(8, () => 'aaaaaaaa'), 'aaaaaaaa'), make(big, bigWord), make(big, bigWord.slice(0, 7) + (bigWord[7] === 'a' ? 'd' : 'a')), make(randGrid(8, 8, 'ab'), 'abababab'), make(grid67, walkWord(grid67, 5)), make(randGrid(5, 8, 'abcdef'), 'fedcbaaa'), make(many(8, (i) => ('ab'.repeat(4))), 'abababab')];
    }
  },

  {
    slug: 'smallest-path-in-maze',
    title: 'The Smallest Way Through the Maze',
    difficulty: 'medium',
    tags: ['backtracking', 'grid', 'dfs'],
    concept: {
      title: 'Try the moves in alphabetical order: the first road found is the smallest',
      body: [
        'In a maze with walls, a *path* goes from the top-left cell to the bottom-right cell and never visits a cell twice. Write a path as the string of its moves `D` (down), `L` (left), `R` (right), `U` (up). Among all paths we want the one whose string is the **smallest in dictionary order**.',
        'A depth-first search that tries the moves in the order `D, L, R, U` explores the paths **exactly in the dictionary order of their strings**. So the *first* path that reaches the end is the smallest one, and the search can stop right there:',
        { code: 'def find(row, col):\n    if (row, col) == (r - 1, c - 1):\n        return True\n    seen[row][col] = True\n    for move, dr, dc in (("D", 1, 0), ("L", 0, -1), ("R", 0, 1), ("U", -1, 0)):\n        nr, nc = row + dr, col + dc\n        if 0 <= nr < r and 0 <= nc < c and grid[nr][nc] == "." and not seen[nr][nc]:\n            path.append(move)\n            if find(nr, nc):\n                return True               # the first success is the smallest path\n            path.pop()\n    seen[row][col] = False\n    return False' },
        'Because a cell is **unmarked** when the search backs out of it, every path is considered, not only the ones of a simple flood fill. This can be slow when no path exists but a big free area is reachable, which is why the maze is at most 5 by 5. Note that the smallest path is generally **not** the shortest path.'
      ]
    },
    statement: ['A maze has `r` rows and `c` columns; a cell is free (`.`) or a wall (`#`). You start in the top-left cell and want to reach the bottom-right cell, moving to a free cell above, below, left or right. No cell may be visited twice. Describe a path by its moves `D`, `L`, `R`, `U`. Print the path whose move string is the smallest in dictionary order (`D` < `L` < `R` < `U`; a string that is the start of another is smaller). If there is no path, print `-1`.'],
    inputFormat: ['The first line has `r` and `c`.', 'Each of the next `r` lines has `c` characters, `.` or `#`.'],
    outputFormat: ['The move string, or `-1`.'],
    constraints: ['1 <= r, c <= 5 and r * c >= 2', 'The top-left and the bottom-right cells are free.'],
    examples: [{ input: '2 2\n..\n..\n', note: 'The paths are DR and RD; DR is smaller.' }],
    hints: ['Try the moves in the order D, L, R, U; the first complete path is the answer.', 'Mark a cell when you enter it and unmark it when you leave without success.', 'Stop all the loops as soon as a path is found.'],
    program: {
      io: ['r:int c:int', 'grid:rows[r]'],
      helpers: {
        python: r`
          def find(grid, r, c, row, col, seen, path):
              if row == r - 1 and col == c - 1:
                  return True
              seen[row][col] = True
              for move, dr, dc in (("D", 1, 0), ("L", 0, -1), ("R", 0, 1), ("U", -1, 0)):
                  nr, nc = row + dr, col + dc
                  if 0 <= nr < r and 0 <= nc < c and grid[nr][nc] == "." and not seen[nr][nc]:
                      path.append(move)
                      if find(grid, r, c, nr, nc, seen, path):
                          return True
                      path.pop()
              seen[row][col] = False
              return False`,
        cpp: r`
          bool findPath(const vector<string>& grid, int r, int c, int row, int col, vector<vector<char>>& seen, string& path) {
              if (row == r - 1 && col == c - 1) return true;
              seen[row][col] = 1;
              const char moves[4] = {'D', 'L', 'R', 'U'};
              int dr[4] = {1, 0, 0, -1};
              int dc[4] = {0, -1, 1, 0};
              for (int d = 0; d < 4; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] == '.' && !seen[nr][nc]) {
                      path.push_back(moves[d]);
                      if (findPath(grid, r, c, nr, nc, seen, path)) return true;
                      path.pop_back();
                  }
              }
              seen[row][col] = 0;
              return false;
          }`,
        java: r`
          static boolean findPath(String[] grid, int r, int c, int row, int col, boolean[][] seen, StringBuilder path) {
              if (row == r - 1 && col == c - 1) return true;
              seen[row][col] = true;
              char[] moves = {'D', 'L', 'R', 'U'};
              int[] dr = {1, 0, 0, -1};
              int[] dc = {0, -1, 1, 0};
              for (int d = 0; d < 4; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr].charAt(nc) == '.' && !seen[nr][nc]) {
                      path.append(moves[d]);
                      if (findPath(grid, r, c, nr, nc, seen, path)) return true;
                      path.deleteCharAt(path.length() - 1);
                  }
              }
              seen[row][col] = false;
              return false;
          }`
      },
      python: r`
        seen = [[False] * c for _ in range(r)]
        path = []
        print("".join(path) if find(grid, r, c, 0, 0, seen, path) else -1)`,
      cpp: r`
        vector<vector<char>> seen(r, vector<char>(c, 0));
        string path;
        if (findPath(grid, (int)r, (int)c, 0, 0, seen, path)) cout << path << "\n";
        else cout << -1 << "\n";`,
      java: r`
        boolean[][] seen = new boolean[(int) r][(int) c];
        StringBuilder path = new StringBuilder();
        System.out.println(findPath(grid, (int) r, (int) c, 0, 0, seen, path) ? path.toString() : "-1");`
    },
    solution: { explanation: ['The depth-first search tries D, L, R, U in this order, marking and unmarking cells. Paths are explored in dictionary order, so the first one that reaches the bottom-right cell is the smallest; the search stops there.'], complexity: 'Time exponential in the worst case (at most about 154 000 steps for a 5 by 5 maze), space O(r * c).' },
    solve(input) {
      const rs = rows(input); const [r, c] = nums(rs[0]); const grid = rs.slice(1, 1 + r); const seen = grid.map((row) => [...row].map(() => false));
      let best = null; const path = [];
      const go = (i, j) => { if (i === r - 1 && j === c - 1) { const s = path.join(''); if (best === null || s < best) best = s; return; } seen[i][j] = true; for (const [m, di, dj] of [['D', 1, 0], ['L', 0, -1], ['R', 0, 1], ['U', -1, 0]]) { const a = i + di, b = j + dj; if (a >= 0 && a < r && b >= 0 && b < c && grid[a][b] === '.' && !seen[a][b]) { path.push(m); go(a, b); path.pop(); } } seen[i][j] = false; };
      go(0, 0); return best === null ? '-1' : best;
    },
    tests() {
      const g = rng(644);
      const make = (grid) => `${grid.length} ${grid[0].length}\n${grid.join('\n')}\n`;
      const open = (r, c) => many(r, () => '.'.repeat(c));
      const random = (r, c, p) => { const m = many(r, () => many(c, () => (g() < p ? '#' : '.'))); m[0][0] = '.'; m[r - 1][c - 1] = '.'; return m.map((x) => x.join('')); };
      const isolated = (r, c) => { const m = open(r, c).map((x) => [...x]); m[r - 2][c - 1] = '#'; m[r - 1][c - 2] = '#'; return m.map((x) => x.join('')); };
      return ['2 2\n..\n..\n', '1 2\n..\n', '2 1\n.\n.\n', '1 3\n.#.\n', '2 2\n.#\n#.\n', make(open(5, 5)), make(open(4, 5)), make(open(5, 4)), make(isolated(5, 5)), make(isolated(4, 5)), make(random(5, 5, 0.2)), make(random(5, 5, 0.3)), make(random(4, 5, 0.25)), make(random(5, 5, 0.1)), make(['.....', '.###.', '.#...', '.#.##', '...#.']), make(['.#...', '.#.#.', '...#.', '.###.', '.....'])];
    }
  },

  {
    slug: 'walk-over-every-empty-cell',
    title: 'A Walk That Visits Every Free Square Once',
    difficulty: 'medium',
    tags: ['backtracking', 'grid', 'hamiltonian'],
    concept: {
      title: 'Count the squares you have walked on, and compare at the end',
      body: [
        'The grid has a start square (`1`), an end square (`2`), free squares (`0`) and walls (`-1`). You want the number of walks from the start to the end that visit **every non-wall square exactly once**. A depth-first search with marking does the walking. The new element is the **end test**: when the walk arrives at the end square, it is a success only if the number of visited squares equals the number of all non-wall squares.',
        { code: 'def walk(row, col, visited):\n    if g[row][col] == 2:\n        return 1 if visited == total else 0   # the end: all squares must be done\n    saved = g[row][col]\n    g[row][col] = -1                          # mark by turning it into a wall\n    count = 0\n    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n        nr, nc = row + dr, col + dc\n        if 0 <= nr < r and 0 <= nc < c and g[nr][nc] != -1:\n            count += walk(nr, nc, visited + 1)\n    g[row][col] = saved                       # restore\n    return count' },
        'Turning a visited square into a wall (and restoring the old value afterwards) is a handy way to avoid a second table. A walk that reaches the end too early simply gives 0 and does not continue: the end square is the last one. With at most 20 squares the number of walks to explore is small.'
      ]
    },
    statement: ['A grid has squares with these values: `1` the start (exactly one), `2` the end (exactly one), `0` a free square and `-1` a wall. In one move you go to a neighbouring square (above, below, left or right) that is not a wall. Count the walks from the start to the end that step on every non-wall square exactly once.'],
    inputFormat: ['The first line has `r` and `c`.', 'Each of the next `r` lines has `c` integers.'],
    outputFormat: ['Print the number of walks.'],
    constraints: ['1 <= r, c and r * c <= 20', 'Every value is -1, 0, 1 or 2; there is exactly one 1 and exactly one 2.'],
    examples: [{ input: '3 4\n1 0 0 0\n0 0 0 0\n0 0 2 -1\n', note: 'There are two walks that cover all 11 non-wall squares.' }],
    hints: ['Count the non-wall squares first.', 'Count the squares walked so far; at the end square compare it with the total.', 'Mark a square by changing its value, and restore the value when the search comes back.'],
    program: {
      io: ['r:int c:int', 'g:int[r][c]'],
      helpers: {
        python: r`
          def walk(g, r, c, row, col, visited, total):
              if g[row][col] == 2:
                  return 1 if visited == total else 0
              saved = g[row][col]
              g[row][col] = -1
              count = 0
              for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                  nr, nc = row + dr, col + dc
                  if 0 <= nr < r and 0 <= nc < c and g[nr][nc] != -1:
                      count += walk(g, r, c, nr, nc, visited + 1, total)
              g[row][col] = saved
              return count`,
        cpp: r`
          long long walk(vector<vector<long long>>& g, int r, int c, int row, int col, int visited, int total) {
              if (g[row][col] == 2) return visited == total ? 1 : 0;
              long long saved = g[row][col];
              g[row][col] = -1;
              long long count = 0;
              int dr[4] = {1, -1, 0, 0};
              int dc[4] = {0, 0, 1, -1};
              for (int d = 0; d < 4; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr >= 0 && nr < r && nc >= 0 && nc < c && g[nr][nc] != -1) count += walk(g, r, c, nr, nc, visited + 1, total);
              }
              g[row][col] = saved;
              return count;
          }`,
        java: r`
          static long walk(long[][] g, int r, int c, int row, int col, int visited, int total) {
              if (g[row][col] == 2) return visited == total ? 1 : 0;
              long saved = g[row][col];
              g[row][col] = -1;
              long count = 0;
              int[] dr = {1, -1, 0, 0};
              int[] dc = {0, 0, 1, -1};
              for (int d = 0; d < 4; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr >= 0 && nr < r && nc >= 0 && nc < c && g[nr][nc] != -1) count += walk(g, r, c, nr, nc, visited + 1, total);
              }
              g[row][col] = saved;
              return count;
          }`
      },
      python: r`
        total = 0
        start = (0, 0)
        for i in range(r):
            for j in range(c):
                if g[i][j] != -1:
                    total += 1
                if g[i][j] == 1:
                    start = (i, j)
        print(walk(g, r, c, start[0], start[1], 1, total))`,
      cpp: r`
        int total = 0, startRow = 0, startCol = 0;
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                if (g[i][j] != -1) total++;
                if (g[i][j] == 1) { startRow = i; startCol = j; }
            }
        }
        cout << walk(g, (int)r, (int)c, startRow, startCol, 1, total) << "\n";`,
      java: r`
        int total = 0, startRow = 0, startCol = 0;
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                if (g[i][j] != -1) total++;
                if (g[i][j] == 1) { startRow = i; startCol = j; }
            }
        }
        System.out.println(walk(g, (int) r, (int) c, startRow, startCol, 1, total));`
    },
    solution: { explanation: ['The walk marks each visited square as a wall and counts the visited squares. At the end square it counts one only when all non-wall squares were visited; every square is restored when the search backs out.'], complexity: 'Time exponential but tiny for 20 squares, space O(r * c).' },
    solve(input) {
      const rs = rows(input); const [r, c] = nums(rs[0]); const g = rs.slice(1, 1 + r).map(nums); let total = 0, sr = 0, sc = 0;
      for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) { if (g[i][j] !== -1) total++; if (g[i][j] === 1) { sr = i; sc = j; } }
      const seen = g.map((row) => row.map(() => false)); let count = 0;
      const go = (i, j, visited) => { seen[i][j] = true; if (g[i][j] === 2) { if (visited === total) count++; seen[i][j] = false; return; } for (const [di, dj] of DIRS) { const a = i + di, b = j + dj; if (a >= 0 && a < r && b >= 0 && b < c && g[a][b] !== -1 && !seen[a][b]) go(a, b, visited + 1); } seen[i][j] = false; };
      go(sr, sc, 1); return String(count);
    },
    tests() {
      const g = rng(645);
      const make = (m) => `${m.length} ${m[0].length}\n${m.map((row) => row.join(' ')).join('\n')}\n`;
      const build = (r, c, p) => { const cells = many(r * c, (i) => i); const m = many(r, () => many(c, () => (g() < p ? -1 : 0))); const order = shuffle(g, cells); const a = order[0], b = order[1]; m[Math.floor(a / c)][a % c] = 1; m[Math.floor(b / c)][b % c] = 2; return m; };
      return ['3 4\n1 0 0 0\n0 0 0 0\n0 0 2 -1\n', '3 4\n1 0 0 0\n0 0 0 0\n0 0 0 2\n', '2 2\n1 0\n0 2\n', '1 2\n1 2\n', '1 3\n1 0 2\n', '2 2\n1 2\n0 0\n', make(build(4, 5, 0)), make(build(4, 5, 0.15)), make(build(5, 4, 0.1)), make(build(4, 5, 0.25)), make(build(2, 10, 0)), make(build(3, 6, 0.1)), make(build(1, 20, 0)), make([[1, 0, 0, 0, 0], [0, -1, -1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 2]]), make(build(3, 5, 0.05)), make(build(4, 4, 0))];
    }
  },

  {
    slug: 'gold-mine-path',
    title: 'The Richest Walk in the Gold Mine',
    difficulty: 'medium',
    tags: ['backtracking', 'grid', 'dfs'],
    concept: {
      title: 'Empty a cell while you stand on it, and put the gold back when you leave',
      body: [
        'A mine is a grid of numbers: the gold in each cell. You may start in **any** cell that has gold, move up, down, left or right, collect the gold of every cell you enter, never enter a cell with no gold, and never visit a cell twice. Find the largest amount you can collect. This is a search over all roads, so use backtracking from every starting cell.',
        { code: 'def collect(row, col):\n    gold = g[row][col]\n    g[row][col] = 0                  # take the gold: the cell is now empty and cannot be entered again\n    best = 0\n    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n        nr, nc = row + dr, col + dc\n        if 0 <= nr < r and 0 <= nc < c and g[nr][nc] > 0:\n            best = max(best, collect(nr, nc))\n    g[row][col] = gold               # put the gold back for the other roads\n    return gold + best' },
        'The grid itself serves as the "visited" table: a cell with 0 gold cannot be entered, so after taking the gold of a cell, the search cannot return to it. Restoring the value on the way back is the **unchoose** step. The function returns the best total **from this cell on**, so the best over all roads is found by taking the maximum.'
      ]
    },
    statement: ['A gold mine is a grid with `r` rows and `c` columns; each cell has the amount of gold in it (it can be 0). You may start in any cell with gold. In one move you go to a neighbouring cell (above, below, left or right) that has gold. You collect all the gold of every cell you enter, and you never enter a cell twice. Print the largest amount of gold you can collect (0 if there is no gold).'],
    inputFormat: ['The first line has `r` and `c`.', 'Each of the next `r` lines has `c` integers.'],
    outputFormat: ['Print the maximum amount of gold.'],
    constraints: ['1 <= r, c and r * c <= 20', '0 <= gold in a cell <= 100'],
    examples: [{ input: '3 3\n0 6 0\n5 8 7\n0 9 0\n', note: 'The cell with 8 connects four dead ends, so a walk is a dead end, then 8, then another dead end. The best is 9 -> 8 -> 7 with 24.' }],
    hints: ['Try every cell with gold as the start.', 'Take the gold of the cell by setting it to 0, try the neighbours that still have gold, and restore the value.', 'Return the gold of the cell plus the best result of its neighbours.'],
    program: {
      io: ['r:int c:int', 'g:int[r][c]'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def collect(g, r, c, row, col):
              gold = g[row][col]
              g[row][col] = 0
              best = 0
              for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                  nr, nc = row + dr, col + dc
                  if 0 <= nr < r and 0 <= nc < c and g[nr][nc] > 0:
                      best = max(best, collect(g, r, c, nr, nc))
              g[row][col] = gold
              return gold + best`,
        cpp: r`
          long long collect(vector<vector<long long>>& g, int r, int c, int row, int col) {
              long long gold = g[row][col];
              g[row][col] = 0;
              long long best = 0;
              int dr[4] = {1, -1, 0, 0};
              int dc[4] = {0, 0, 1, -1};
              for (int d = 0; d < 4; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr >= 0 && nr < r && nc >= 0 && nc < c && g[nr][nc] > 0) best = max(best, collect(g, r, c, nr, nc));
              }
              g[row][col] = gold;
              return gold + best;
          }`,
        java: r`
          static long collect(long[][] g, int r, int c, int row, int col) {
              long gold = g[row][col];
              g[row][col] = 0;
              long best = 0;
              int[] dr = {1, -1, 0, 0};
              int[] dc = {0, 0, 1, -1};
              for (int d = 0; d < 4; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr >= 0 && nr < r && nc >= 0 && nc < c && g[nr][nc] > 0) best = Math.max(best, collect(g, r, c, nr, nc));
              }
              g[row][col] = gold;
              return gold + best;
          }`
      },
      python: r`
        answer = 0
        for i in range(r):
            for j in range(c):
                if g[i][j] > 0:
                    answer = max(answer, collect(g, r, c, i, j))
        print(answer)`,
      cpp: r`
        long long answer = 0;
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                if (g[i][j] > 0) answer = max(answer, collect(g, (int)r, (int)c, i, j));
            }
        }
        cout << answer << "\n";`,
      java: r`
        long answer = 0;
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                if (g[i][j] > 0) answer = Math.max(answer, collect(g, (int) r, (int) c, i, j));
            }
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['From every cell with gold, `collect` takes the gold (sets the cell to 0), tries the neighbours that still have gold, restores the cell and returns its gold plus the best continuation. The answer is the maximum over all starts.'], complexity: 'Time exponential in the number of cells (about 2 * 10^5 steps for 20 cells), space O(r * c).' },
    solve(input) {
      const rs = rows(input); const [r, c] = nums(rs[0]); const g = rs.slice(1, 1 + r).map(nums); const seen = g.map((row) => row.map(() => false));
      const go = (i, j) => { seen[i][j] = true; let best = 0; for (const [di, dj] of DIRS) { const a = i + di, b = j + dj; if (a >= 0 && a < r && b >= 0 && b < c && g[a][b] > 0 && !seen[a][b]) best = Math.max(best, go(a, b)); } seen[i][j] = false; return g[i][j] + best; };
      let answer = 0; for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) if (g[i][j] > 0) answer = Math.max(answer, go(i, j)); return String(answer);
    },
    tests() {
      const g = rng(646);
      const make = (m) => `${m.length} ${m[0].length}\n${m.map((row) => row.join(' ')).join('\n')}\n`;
      const rand = (r, c, p, hi) => many(r, () => many(c, () => (g() < p ? 0 : randInt(g, 1, hi))));
      return ['3 3\n0 6 0\n5 8 7\n0 9 0\n', '1 1\n0\n', '1 1\n7\n', '1 3\n1 0 5\n', '2 2\n0 0\n0 0\n', make(rand(4, 5, 0, 100)), make(rand(4, 5, 0, 5)), make(rand(5, 4, 0.1, 100)), make(rand(4, 5, 0.3, 100)), make(rand(2, 10, 0, 100)), make(rand(1, 20, 0, 100)), make(many(4, () => many(5, () => 100))), make(many(3, () => many(6, () => 1))), make(rand(3, 6, 0.2, 50)), make(rand(4, 4, 0, 100)), make(rand(5, 4, 0.05, 20))];
    }
  },

  {
    slug: 'tic-tac-toe-outcome',
    title: 'Who Wins the Game of Noughts and Crosses?',
    difficulty: 'medium',
    tags: ['backtracking', 'game', 'minimax'],
    concept: {
      title: 'Minimax: each player picks the best move for themselves',
      body: [
        'In a two-player game with a win, a loss or a draw, the value of a position is found by looking at **all moves**: the player to move chooses the move that is best for them, and the opponent will answer with their best move. Give the value `+1` when `X` wins, `-1` when `O` wins and `0` for a draw. `X` takes the **maximum** over all moves, `O` takes the **minimum**.',
        { code: 'def value(b, turn, memo):               # b is a string of 9 characters\n    if b in memo:\n        return memo[b]\n    w = winner(b)\n    if w == "X": result = 1\n    elif w == "O": result = -1\n    elif "." not in b: result = 0           # a full board without a winner\n    else:\n        results = [value(b[:i] + turn + b[i + 1:], "O" if turn == "X" else "X", memo)\n                   for i in range(9) if b[i] == "."]\n        result = max(results) if turn == "X" else min(results)\n    memo[b] = result\n    return result' },
        'This is backtracking in a new role: the search tree is the tree of **all possible games**, and the values come up from the leaves. There are 5478 different positions (many games lead to the same one), so a memo on the board text makes the search very fast. The player to move is known from the numbers of X and O on the board, so the board alone is a good key.'
      ]
    },
    statement: ['Noughts and crosses is played on a 3 by 3 board. The players `X` and `O` write their sign in an empty cell in turn. The game stops as soon as a player has three signs in a row, column or diagonal (that player wins), or when the board is full (a draw). A position and the player who moves next are given. Both players play perfectly. Print `X` if `X` wins, `O` if `O` wins, or `draw`.'],
    inputFormat: ['The first 3 lines have the board: `X`, `O` or `.` (empty).', 'The fourth line has the player to move: `X` or `O`.'],
    outputFormat: ['Print `X`, `O` or `draw`.'],
    constraints: ['The position is reachable in a real game: the player who moves next has made the same number of moves as the other, or one fewer; if a player has already won, that player is the answer.'],
    examples: [{ input: 'XO.\nXO.\n...\nX\n', note: 'X moves and plays the bottom left cell to make three in a column: X wins.' }],
    hints: ['Give a position the value 1, 0 or -1 and let X maximise it and O minimise it.', 'A position with a winner or a full board is a leaf of the search.', 'Positions repeat: store the value of each board text in a dictionary.'],
    program: {
      io: ['board:rows[3]', 'turn:word'],
      includes: ['<unordered_map>', '<algorithm>'],
      helpers: {
        python: r`
          LINES = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]

          def winner(b):
              for x, y, z in LINES:
                  if b[x] != "." and b[x] == b[y] == b[z]:
                      return b[x]
              return "."

          def value(b, turn, memo):
              if b in memo:
                  return memo[b]
              w = winner(b)
              if w == "X":
                  result = 1
              elif w == "O":
                  result = -1
              elif "." not in b:
                  result = 0
              else:
                  other = "O" if turn == "X" else "X"
                  results = [value(b[:i] + turn + b[i + 1:], other, memo) for i in range(9) if b[i] == "."]
                  result = max(results) if turn == "X" else min(results)
              memo[b] = result
              return result`,
        cpp: r`
          const int LINES[8][3] = {{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, {0, 4, 8}, {2, 4, 6}};

          char winner(const string& b) {
              for (int k = 0; k < 8; k++) {
                  char x = b[LINES[k][0]];
                  if (x != '.' && x == b[LINES[k][1]] && x == b[LINES[k][2]]) return x;
              }
              return '.';
          }

          int value(const string& b, char turn, unordered_map<string, int>& memo) {
              auto found = memo.find(b);
              if (found != memo.end()) return found->second;
              char w = winner(b);
              int result;
              if (w == 'X') {
                  result = 1;
              } else if (w == 'O') {
                  result = -1;
              } else if (b.find('.') == string::npos) {
                  result = 0;
              } else {
                  char other = turn == 'X' ? 'O' : 'X';
                  result = turn == 'X' ? -2 : 2;
                  for (int i = 0; i < 9; i++) {
                      if (b[i] == '.') {
                          string next = b;
                          next[i] = turn;
                          int v = value(next, other, memo);
                          result = turn == 'X' ? max(result, v) : min(result, v);
                      }
                  }
              }
              memo[b] = result;
              return result;
          }`,
        java: r`
          static final int[][] LINES = {{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, {0, 4, 8}, {2, 4, 6}};

          static char winner(String b) {
              for (int[] line : LINES) {
                  char x = b.charAt(line[0]);
                  if (x != '.' && x == b.charAt(line[1]) && x == b.charAt(line[2])) return x;
              }
              return '.';
          }

          static int value(String b, char turn, Map<String, Integer> memo) {
              Integer found = memo.get(b);
              if (found != null) return found;
              char w = winner(b);
              int result;
              if (w == 'X') {
                  result = 1;
              } else if (w == 'O') {
                  result = -1;
              } else if (b.indexOf('.') < 0) {
                  result = 0;
              } else {
                  char other = turn == 'X' ? 'O' : 'X';
                  result = turn == 'X' ? -2 : 2;
                  for (int i = 0; i < 9; i++) {
                      if (b.charAt(i) == '.') {
                          String next = b.substring(0, i) + turn + b.substring(i + 1);
                          int v = value(next, other, memo);
                          result = turn == 'X' ? Math.max(result, v) : Math.min(result, v);
                      }
                  }
              }
              memo.put(b, result);
              return result;
          }`
      },
      python: r`
        b = "".join(board)
        v = value(b, turn, {})
        print("X" if v == 1 else "O" if v == -1 else "draw")`,
      cpp: r`
        string b = board[0] + board[1] + board[2];
        unordered_map<string, int> memo;
        int v = value(b, turn[0], memo);
        cout << (v == 1 ? "X" : v == -1 ? "O" : "draw") << "\n";`,
      java: r`
        String b = board[0] + board[1] + board[2];
        int v = value(b, turn.charAt(0), new HashMap<>());
        System.out.println(v == 1 ? "X" : v == -1 ? "O" : "draw");`
    },
    solution: { explanation: ['A position is a leaf when someone has three in a row or the board is full. Otherwise X takes the maximum and O the minimum of the values of the positions after each possible move; a dictionary stores each position once.'], complexity: 'Time O(5478 * 9) positions at most, space O(5478).' },
    solve(input) {
      const rs = rows(input); const board = rs.slice(0, 3).join(''); const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
      const win = (b) => { for (const [x, y, z] of lines) if (b[x] !== '.' && b[x] === b[y] && b[y] === b[z]) return b[x]; return '.'; };
      const go = (b, turn) => { const w = win(b); if (w === 'X') return 1; if (w === 'O') return -1; if (!b.includes('.')) return 0; let best = turn === 'X' ? -2 : 2; for (let i = 0; i < 9; i++) if (b[i] === '.') { const v = go(b.slice(0, i) + turn + b.slice(i + 1), turn === 'X' ? 'O' : 'X'); best = turn === 'X' ? Math.max(best, v) : Math.min(best, v); } return best; };
      const v = go(board, rs[3].trim()); return v === 1 ? 'X' : v === -1 ? 'O' : 'draw';
    },
    tests() {
      const g = rng(647);
      const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
      const won = (b) => lines.some(([x, y, z]) => b[x] !== '.' && b[x] === b[y] && b[y] === b[z]);
      const position = (moves) => { const b = Array(9).fill('.'); let turn = 'X'; for (let k = 0; k < moves; k++) { const free = b.map((v, i) => (v === '.' ? i : -1)).filter((i) => i >= 0); b[free[randInt(g, 0, free.length - 1)]] = turn; if (won(b)) break; turn = turn === 'X' ? 'O' : 'X'; } const nextTurn = b.filter((v) => v === 'X').length > b.filter((v) => v === 'O').length ? 'O' : 'X'; return `${b.slice(0, 3).join('')}\n${b.slice(3, 6).join('')}\n${b.slice(6).join('')}\n${nextTurn}\n`; };
      return ['XO.\nXO.\n...\nX\n', '...\n...\n...\nX\n', 'XXX\nOO.\n...\nO\n', 'OOO\nXX.\nX..\nX\n', 'XOX\nXOO\nOXX\nO\n','X.O\n.X.\nO..\nX\n', 'XO.\n.X.\n..O\nX\n', position(3), position(4), position(5), position(6), position(2), position(1), position(7), position(8), position(0)];
    }
  },

  {
    slug: 'flip-game-winner',
    title: 'The Flipping Game',
    difficulty: 'medium',
    tags: ['backtracking', 'game', 'memoization'],
    concept: {
      title: 'A position is winning if some move leads to a losing position',
      body: [
        'A string of `+` and `-` is the board. In one move a player picks **two neighbouring** `+` and turns both into `-`. The players alternate, and a player who has **no move** loses. For games like this there is a simple recursive rule: a position is **winning** for the player to move if at least one move leads to a position that is **losing** for the opponent. A position without moves is losing.',
        { code: 'def can_win(s, memo):\n    if s in memo:\n        return memo[s]\n    result = False\n    for i in range(len(s) - 1):\n        if s[i] == "+" and s[i + 1] == "+":\n            if not can_win(s[:i] + "--" + s[i + 2:], memo):   # the opponent loses there\n                result = True\n                break\n    memo[s] = result\n    return result' },
        'Different move orders reach the same board (`++++` after the first and the last flip is `--++` + ... and so on), so the results are stored in a dictionary keyed by the board. The loop stops at the first winning move, because one is enough. A position with no `++` has an empty loop, so `result` stays `False`: it is lost.'
      ]
    },
    statement: ['A board is a string of `+` and `-`. In one move a player chooses two neighbouring `+` characters and changes both into `-`. The two players move in turn, the first player starts, and a player who cannot move loses. Both play perfectly. Print `yes` if the first player wins and `no` otherwise.'],
    inputFormat: ['The only line has the board.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length of the board <= 24'],
    examples: [{ input: '++++\n', note: 'The first player flips the middle two characters (+--+). Now the second player has no move and loses.' }],
    hints: ['A position without two neighbouring plus signs is lost for the player to move.', 'A position is won if some move gives a lost position to the opponent.', 'Store the result for each board text: the same board appears again and again.'],
    program: {
      io: ['s:word'],
      includes: ['<unordered_map>'],
      helpers: {
        python: r`
          def can_win(s, memo):
              if s in memo:
                  return memo[s]
              result = False
              for i in range(len(s) - 1):
                  if s[i] == "+" and s[i + 1] == "+":
                      if not can_win(s[:i] + "--" + s[i + 2:], memo):
                          result = True
                          break
              memo[s] = result
              return result`,
        cpp: r`
          bool canWin(const string& s, unordered_map<string, bool>& memo) {
              auto found = memo.find(s);
              if (found != memo.end()) return found->second;
              bool result = false;
              for (size_t i = 0; i + 1 < s.size() && !result; i++) {
                  if (s[i] == '+' && s[i + 1] == '+') {
                      string next = s;
                      next[i] = next[i + 1] = '-';
                      if (!canWin(next, memo)) result = true;
                  }
              }
              memo[s] = result;
              return result;
          }`,
        java: r`
          static boolean canWin(String s, Map<String, Boolean> memo) {
              Boolean found = memo.get(s);
              if (found != null) return found;
              boolean result = false;
              for (int i = 0; i + 1 < s.length() && !result; i++) {
                  if (s.charAt(i) == '+' && s.charAt(i + 1) == '+') {
                      String next = s.substring(0, i) + "--" + s.substring(i + 2);
                      if (!canWin(next, memo)) result = true;
                  }
              }
              memo.put(s, result);
              return result;
          }`
      },
      python: 'print("yes" if can_win(s, {}) else "no")',
      cpp: r`
        unordered_map<string, bool> memo;
        cout << (canWin(s, memo) ? "yes" : "no") << "\n";`,
      java: 'System.out.println(canWin(s, new HashMap<>()) ? "yes" : "no");'
    },
    solution: { explanation: ['A board is winning when some flip leaves the opponent a losing board; a board with no `++` is losing. A dictionary keyed by the board text makes each board cost one scan.'], complexity: 'Time O(number of reachable boards * n), space the same.' },
    solve(input) {
      const s = rows(input)[0].trim(); const n = s.length;
      // independent: Sprague-Grundy numbers of runs of plus signs
      const grundy = [0, 0]; for (let len = 2; len <= n; len++) { const seen = new Set(); for (let i = 0; i + 2 <= len; i++) seen.add(grundy[i] ^ grundy[len - i - 2]); let m = 0; while (seen.has(m)) m++; grundy.push(m); }
      let x = 0; for (const run of s.split('-')) x ^= grundy[run.length]; return x ? 'yes' : 'no';
    },
    tests() {
      const g = rng(648);
      const board = (n, p) => many(n, () => (g() < p ? '-' : '+')).join('');
      return ['++++\n', '+\n', '-\n', '++\n', '+++\n', '+-+\n', '+'.repeat(24) + '\n', '+'.repeat(23) + '\n', '+'.repeat(20) + '\n', '+'.repeat(21) + '\n', `${board(24, 0.1)}\n`, `${board(24, 0.2)}\n`, `${board(24, 0.05)}\n`, `${board(22, 0.15)}\n`, `${board(18, 0.3)}\n`, '+++-+++-+++-+++-+++-+++\n', '++-++-++-++-++-++-++-++\n'];
    }
  },

  {
    slug: 'can-first-player-win',
    title: 'Pick Numbers Without Repeating, Reach the Target First',
    difficulty: 'medium',
    tags: ['backtracking', 'game', 'bitmask'],
    concept: {
      title: 'The set of numbers already taken is the whole state',
      body: [
        'Two players take turns choosing an integer from `1` to `m`; a number can be chosen **only once** in the whole game. The numbers chosen are added to a running total, and the player whose number makes the total reach `t` or more wins. The first player wins if they can pick a number that either wins at once, or leaves the opponent in a **losing** position.',
        'What is the state of the game? The total is just the sum of the chosen numbers, so the **set of chosen numbers** says everything. A set of numbers `1..m` fits in an integer where bit `v - 1` means "the number `v` is taken", and this integer is the key of a memo.',
        { code: 'def can_win(m, mask, remaining, memo):\n    if mask in memo:\n        return memo[mask]\n    result = False\n    for v in range(1, m + 1):\n        bit = 1 << (v - 1)\n        if not mask & bit:\n            if v >= remaining or not can_win(m, mask | bit, remaining - v, memo):\n                result = True\n                break\n    memo[mask] = result\n    return result' },
        'There are at most `2^m` different masks, 32768 for `m = 15`, instead of the billions of different move sequences. If the sum of all numbers `1..m` is smaller than `t`, nobody can ever reach `t`, and the first player does not win.'
      ]
    },
    statement: ['Two players take turns picking an integer from `1` to `m`; every integer can be picked only once, by either player. The picked integers are added to a common total. The player whose pick makes the total at least `t` wins. The first player starts and both play perfectly. If nobody can reach `t` (the integers run out), the first player does not win. Print `yes` if the first player can force a win, `no` otherwise.'],
    inputFormat: ['The only line has `m` and `t`.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= m <= 15', '1 <= t <= 130'],
    examples: [{ input: '10 11\n', note: 'Whatever the first player picks, the second player can reach 11 with the next pick, so the first player cannot force a win.' }],
    hints: ['Represent the picked numbers as a bit mask; the total is determined by the mask.', 'A pick wins at once if its value is at least the amount that remains.', 'Otherwise it is good if the opponent loses in the new position.'],
    program: {
      io: ['m:int t:int'],
      includes: ['<unordered_map>'],
      helpers: {
        python: r`
          def can_win(m, mask, remaining, memo):
              if mask in memo:
                  return memo[mask]
              result = False
              for v in range(1, m + 1):
                  bit = 1 << (v - 1)
                  if not mask & bit:
                      if v >= remaining or not can_win(m, mask | bit, remaining - v, memo):
                          result = True
                          break
              memo[mask] = result
              return result`,
        cpp: r`
          bool canWin(int m, int mask, int remaining, unordered_map<int, bool>& memo) {
              auto found = memo.find(mask);
              if (found != memo.end()) return found->second;
              bool result = false;
              for (int v = 1; v <= m && !result; v++) {
                  int bit = 1 << (v - 1);
                  if (!(mask & bit)) {
                      if (v >= remaining || !canWin(m, mask | bit, remaining - v, memo)) result = true;
                  }
              }
              memo[mask] = result;
              return result;
          }`,
        java: r`
          static boolean canWin(int m, int mask, int remaining, Map<Integer, Boolean> memo) {
              Boolean found = memo.get(mask);
              if (found != null) return found;
              boolean result = false;
              for (int v = 1; v <= m && !result; v++) {
                  int bit = 1 << (v - 1);
                  if ((mask & bit) == 0) {
                      if (v >= remaining || !canWin(m, mask | bit, remaining - v, memo)) result = true;
                  }
              }
              memo.put(mask, result);
              return result;
          }`
      },
      python: 'print("yes" if m * (m + 1) // 2 >= t and can_win(m, 0, t, {}) else "no")',
      cpp: r`
        unordered_map<int, bool> memo;
        cout << (m * (m + 1) / 2 >= t && canWin((int)m, 0, (int)t, memo) ? "yes" : "no") << "\n";`,
      java: 'System.out.println(m * (m + 1) / 2 >= t && canWin((int) m, 0, (int) t, new HashMap<>()) ? "yes" : "no");'
    },
    solution: { explanation: ['The mask of taken numbers fixes the total, so it keys the memo. A pick wins at once when it reaches the remaining amount, or when the opponent loses in the next position. If even all numbers cannot reach `t`, the answer is no.'], complexity: 'Time O(2^m * m), space O(2^m).' },
    solve(input) {
      const [m, t] = nums(rows(input)[0]); if (m * (m + 1) / 2 < t) return 'no';
      const win = new Map(); const go = (mask, remaining) => { if (win.has(mask)) return win.get(mask); let res = false; for (let v = 1; v <= m && !res; v++) if (!((mask >> (v - 1)) & 1)) if (v >= remaining || !go(mask | (1 << (v - 1)), remaining - v)) res = true; win.set(mask, res); return res; };
      return go(0, t) ? 'yes' : 'no';
    },
    tests() { return ['10 11\n', '1 1\n', '1 2\n', '2 3\n', '3 6\n', '3 7\n', '5 15\n', '5 16\n', '10 40\n', '10 55\n', '10 1\n','15 100\n', '15 120\n', '15 121\n', '15 130\n', '15 50\n', '15 90\n', '15 111\n', '14 100\n', '13 91\n', '12 77\n']; }
  },

  {
    slug: 'predict-the-winner',
    title: 'Taking From Either End of a Row',
    difficulty: 'medium',
    tags: ['recursion', 'game', 'memoization'],
    concept: {
      title: 'Score the position as "my total minus the opponent\'s total"',
      body: [
        'A row of numbers lies on the table. The players take turns; in a turn you remove the number at the **left end** or at the **right end** and add it to your score. Both want the largest possible difference between their own score and the opponent\'s. Instead of tracking two scores, define `best(i, j)` as the **best difference** (current player minus the other) the player to move can achieve on the part `a[i..j]`.',
        'If you take `a[i]`, the opponent faces `a[i+1..j]` and gets `best(i + 1, j)` more than you from there, so your difference is `a[i] - best(i + 1, j)`. Taking `a[j]` gives `a[j] - best(i, j - 1)`. You choose the larger:',
        { code: 'def best(i, j):\n    if i > j:\n        return 0\n    if (i, j) not in memo:\n        memo[(i, j)] = max(a[i] - best(i + 1, j), a[j] - best(i, j - 1))\n    return memo[(i, j)]' },
        'The "minus" is the trick: the same function describes the opponent, whose gain is your loss. There are only `n * n` different parts `a[i..j]`, so with a memo the search is quick even for 40 numbers, where trying all `2^40` games would be impossible.'
      ]
    },
    statement: ['A row has `n` non-negative integers. Two players take turns; in each turn the player removes the number at the left end or at the right end of the row and adds it to their own score. The first player starts. Both play to maximise (their own score minus the other score). Print the largest difference the first player can guarantee (it can be negative).'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print the difference.'],
    constraints: ['1 <= n <= 40', '0 <= each integer <= 10^6'],
    examples: [{ input: '4\n1 5 233 7\n', note: 'The first player takes 1. Whatever the second player takes (5 or 7), the first player then takes 233: 1 + 233 against 5 + 7 is a difference of 222.' }],
    hints: ['Define best(i, j) as the best difference (mover minus the other) on the part a[i..j].', 'Taking the left end gives a[i] minus best(i + 1, j); taking the right end gives a[j] minus best(i, j - 1).', 'Store the values in a table: there are only n * n different parts.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def best(a, i, j, memo):
              if i > j:
                  return 0
              if (i, j) not in memo:
                  memo[(i, j)] = max(a[i] - best(a, i + 1, j, memo), a[j] - best(a, i, j - 1, memo))
              return memo[(i, j)]`,
        cpp: r`
          long long best(const vector<long long>& a, int i, int j, vector<vector<long long>>& memo, vector<vector<char>>& done) {
              if (i > j) return 0;
              if (!done[i][j]) {
                  memo[i][j] = max(a[i] - best(a, i + 1, j, memo, done), a[j] - best(a, i, j - 1, memo, done));
                  done[i][j] = 1;
              }
              return memo[i][j];
          }`,
        java: r`
          static long best(long[] a, int i, int j, long[][] memo, boolean[][] done) {
              if (i > j) return 0;
              if (!done[i][j]) {
                  memo[i][j] = Math.max(a[i] - best(a, i + 1, j, memo, done), a[j] - best(a, i, j - 1, memo, done));
                  done[i][j] = true;
              }
              return memo[i][j];
          }`
      },
      python: 'print(best(a, 0, n - 1, {}))',
      cpp: r`
        vector<vector<long long>> memo(n, vector<long long>(n, 0));
        vector<vector<char>> done(n, vector<char>(n, 0));
        cout << best(a, 0, (int)n - 1, memo, done) << "\n";`,
      java: r`
        long[][] memo = new long[(int) n][(int) n];
        boolean[][] done = new boolean[(int) n][(int) n];
        System.out.println(best(a, 0, (int) n - 1, memo, done));`
    },
    solution: { explanation: ['`best(i, j)` is the larger of `a[i] - best(i + 1, j)` and `a[j] - best(i, j - 1)`: the mover takes an end and then plays the opponent role on the rest. The empty part is worth 0, and each of the `n * n` parts is computed once.'], complexity: 'Time O(n^2), space O(n^2).' },
    solve(input) {
      const a = nums(rows(input)[1]); const n = a.length; const d = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < n; i++) d[i][i] = a[i];
      for (let len = 2; len <= n; len++) for (let i = 0; i + len - 1 < n; i++) { const j = i + len - 1; d[i][j] = Math.max(a[i] - d[i + 1][j], a[j] - d[i][j - 1]); }
      return String(d[0][n - 1]);
    },
    tests() {
      const g = rng(649);
      const make = (a) => `${a.length}\n${a.join(' ')}\n`;
      const brute = (a) => { const go = (i, j) => (i > j ? 0 : Math.max(a[i] - go(i + 1, j), a[j] - go(i, j - 1))); return go(0, a.length - 1); };
      crossCheck(() => make(randArray(g, randInt(g, 1, 12), 0, 20)), (i) => this.solve(i), (i) => brute(nums(rows(i)[1])));
      return ['4\n1 5 233 7\n', '1\n5\n', '2\n3 9\n', '3\n1 2 3\n', '3\n0 0 0\n', make(randArray(g, 40, 0, 1000000)), make(many(40, () => 1000000)), make(many(40, (i) => i)), make(many(40, (i) => 40 - i)), make(randArray(g, 39, 0, 100)), make(randArray(g, 40, 0, 5)), make(many(40, (i) => (i % 2 ? 0 : 1000000))), make(many(40, (i) => (i % 2 ? 1000000 : 0)))];
    }
  },

  {
    slug: 'twenty-four-game',
    title: 'Make 24 From Four Cards',
    difficulty: 'medium',
    tags: ['backtracking', 'recursion', 'expressions'],
    concept: {
      title: 'Pick two numbers, replace them by one result, and repeat',
      body: [
        'Four cards with numbers from 1 to 9: can you reach **24** using each card exactly once, the operations `+`, `-`, `*`, `/` and brackets? Brackets decide which two numbers are combined first. Instead of thinking about brackets, use a simple recursion: **choose two numbers from the list, combine them with one operation, and put the result back** in the list. The list becomes shorter by one. When one number remains, check if it is 24.',
        { code: 'def reach(values):\n    if len(values) == 1:\n        return abs(values[0] - 24) < 1e-6\n    for i in range(len(values)):\n        for j in range(len(values)):\n            if i == j:\n                continue\n            rest = [values[k] for k in range(len(values)) if k != i and k != j]\n            x, y = values[i], values[j]\n            results = [x + y, x - y, x * y]\n            if abs(y) > 1e-9:\n                results.append(x / y)\n            for z in results:\n                if reach(rest + [z]):\n                    return True\n    return False' },
        'Trying **every ordered pair** `(i, j)` covers `x - y` and `y - x`, and `x / y` and `y / x`. Division produces fractions (`8 / (3 - 8 / 3) = 24`), so the numbers are real numbers, and the final check uses a small tolerance because decimal results are not exact. Avoid dividing by zero. With four cards there are at most a few thousand combinations to try.'
      ]
    },
    statement: ['You have four cards with integers from 1 to 9. Using each card exactly once, the operations `+`, `-`, `*`, `/` (real division) and any brackets, can you get exactly 24? Print `yes` or `no`.'],
    inputFormat: ['The only line has the four integers.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['Each integer is between 1 and 9.'],
    examples: [{ input: '4 1 8 7\n', note: '(8 - 4) * (7 - 1) = 24.' }],
    hints: ['Pick an ordered pair of numbers, apply each operation, and recurse on the shorter list.', 'Division can give fractions: use real numbers and compare with a tiny tolerance.', 'Never divide by zero.'],
    program: {
      io: ['cards:int[4]'],
      includes: ['<cmath>'],
      helpers: {
        python: r`
          def reach(values):
              if len(values) == 1:
                  return abs(values[0] - 24) < 1e-6
              for i in range(len(values)):
                  for j in range(len(values)):
                      if i == j:
                          continue
                      rest = [values[k] for k in range(len(values)) if k != i and k != j]
                      x, y = values[i], values[j]
                      results = [x + y, x - y, x * y]
                      if abs(y) > 1e-9:
                          results.append(x / y)
                      for z in results:
                          if reach(rest + [z]):
                              return True
              return False`,
        cpp: r`
          bool reach(const vector<double>& values) {
              if (values.size() == 1) return fabs(values[0] - 24) < 1e-6;
              for (size_t i = 0; i < values.size(); i++) {
                  for (size_t j = 0; j < values.size(); j++) {
                      if (i == j) continue;
                      vector<double> rest;
                      for (size_t k = 0; k < values.size(); k++) {
                          if (k != i && k != j) rest.push_back(values[k]);
                      }
                      double x = values[i], y = values[j];
                      vector<double> results = {x + y, x - y, x * y};
                      if (fabs(y) > 1e-9) results.push_back(x / y);
                      for (double z : results) {
                          vector<double> next = rest;
                          next.push_back(z);
                          if (reach(next)) return true;
                      }
                  }
              }
              return false;
          }`,
        java: r`
          static boolean reach(List<Double> values) {
              if (values.size() == 1) return Math.abs(values.get(0) - 24) < 1e-6;
              for (int i = 0; i < values.size(); i++) {
                  for (int j = 0; j < values.size(); j++) {
                      if (i == j) continue;
                      List<Double> rest = new ArrayList<>();
                      for (int k = 0; k < values.size(); k++) {
                          if (k != i && k != j) rest.add(values.get(k));
                      }
                      double x = values.get(i), y = values.get(j);
                      List<Double> results = new ArrayList<>(List.of(x + y, x - y, x * y));
                      if (Math.abs(y) > 1e-9) results.add(x / y);
                      for (double z : results) {
                          List<Double> next = new ArrayList<>(rest);
                          next.add(z);
                          if (reach(next)) return true;
                      }
                  }
              }
              return false;
          }`
      },
      python: 'print("yes" if reach([float(x) for x in cards]) else "no")',
      cpp: r`
        vector<double> values(cards.begin(), cards.end());
        cout << (reach(values) ? "yes" : "no") << "\n";`,
      java: r`
        List<Double> values = new ArrayList<>();
        for (long x : cards) values.add((double) x);
        System.out.println(reach(values) ? "yes" : "no");`
    },
    solution: { explanation: ['The recursion combines two numbers with each operation and continues with the shorter list; with one number left it compares with 24 using a small tolerance. Ordered pairs cover both orders of the subtraction and division.'], complexity: 'Time O(1): a few thousand combinations, space O(1).' },
    solve(input) {
      const cards = nums(rows(input)[0]);
      // exact fractions as [numerator, denominator] with BigInt
      const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
      const norm = ([n, d]) => { if (d < 0n) { n = -n; d = -d; } const q = gcd(n, d) || 1n; return [n / q, d / q]; };
      const reach = (vals) => { if (vals.length === 1) return vals[0][0] === 24n && vals[0][1] === 1n; for (let i = 0; i < vals.length; i++) for (let j = 0; j < vals.length; j++) { if (i === j) continue; const rest = vals.filter((_, k) => k !== i && k !== j); const [a, b] = vals[i], [c, d] = vals[j]; const outs = [norm([a * d + c * b, b * d]), norm([a * d - c * b, b * d]), norm([a * c, b * d])]; if (c !== 0n) outs.push(norm([a * d, b * c])); for (const z of outs) if (reach([...rest, z])) return true; } return false; };
      return reach(cards.map((x) => [BigInt(x), 1n])) ? 'yes' : 'no';
    },
    tests() {
      const g = rng(650);
      const make = (a) => `${a.join(' ')}\n`;
      const known = [[4, 1, 8, 7], [1, 1, 1, 1], [1, 2, 3, 4], [3, 3, 8, 8], [1, 5, 5, 5], [4, 4, 9, 9],[6, 6, 6, 6], [9, 9, 9, 9], [1, 1, 7, 7], [5, 5, 5, 5], [2, 2, 2, 2], [1, 1, 2, 7], [3, 3, 7, 7], [1, 3, 4, 6], [7, 7, 7, 7], [1, 9, 9, 9], [5, 6, 6, 6]];
      return known.map(make).concat(many(14, () => make(many(4, () => randInt(g, 1, 9)))));
    }
  }
];
