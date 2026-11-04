import { r, rng, randInt, randArray, many, nums, rows, randWord } from '../../lib.mjs';

// Runs fast(input) against a slow, independent computation on many small random inputs; throws when they differ.
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };

export default [
  {
    slug: 'grid-paths-without-revisiting',
    title: 'Walks Through a Grid Without Visiting a Cell Twice',
    difficulty: 'easy',
    tags: ['backtracking', 'grid', 'dfs'],
    concept: {
      title: 'Mark the cell on the way in, unmark it on the way out',
      body: [
        'Count the routes from the top-left cell to the bottom-right cell when you may move up, down, left and right, but may **never visit a cell twice**. A route that goes right and then comes back would be an endless loop without that rule.',
        'The recursive function stands on a cell, **marks it as visited**, tries the four neighbours that are free and not visited, and finally **unmarks** the cell. The unmarking is the key of backtracking: a cell that is visited on this route may be needed by a different route that arrives there by another path.',
        { code: 'def count(row, col):\n    if (row, col) == (r - 1, c - 1):\n        return 1                       # the end: one route is complete\n    total = 0\n    seen[row][col] = True              # mark\n    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n        nr, nc = row + dr, col + dc\n        if 0 <= nr < r and 0 <= nc < c and grid[nr][nc] == "." and not seen[nr][nc]:\n            total += count(nr, nc)\n    seen[row][col] = False             # unmark: leave no trace\n    return total' },
        'The number of routes grows very quickly (an empty 6 by 6 grid has more than a million), so the grid is small. Without the unmarking, each cell could be used by only one route in total, and the count would be wrong.'
      ]
    },
    statement: ['A grid has `r` rows and `c` columns. A cell is free (`.`) or blocked (`#`). You start in the top-left cell and want to reach the bottom-right cell. In one move you go to a free neighbour above, below, left or right. You must not visit any cell more than once. Count the different routes. A route ends as soon as it first reaches the bottom-right cell.'],
    inputFormat: ['The first line has `r` and `c`.', 'Each of the next `r` lines has `c` characters, `.` or `#`.'],
    outputFormat: ['Print the number of routes (it can be 0).'],
    constraints: ['1 <= r, c <= 6 and r * c <= 30', 'The top-left and the bottom-right cells are free. If the grid has a single cell, the answer is 1.'],
    examples: [{ input: '2 2\n..\n..\n', note: 'The two routes go right then down, or down then right.' }],
    hints: ['Keep a table of visited cells and update it as you enter and leave a cell.', 'Try the four directions; skip blocked, visited and outside cells.', 'After exploring all neighbours, unmark the cell before returning.'],
    program: {
      io: ['r:int c:int', 'grid:rows[r]'],
      helpers: {
        python: r`
          def count(grid, r, c, row, col, seen):
              if row == r - 1 and col == c - 1:
                  return 1
              total = 0
              seen[row][col] = True
              for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                  nr, nc = row + dr, col + dc
                  if 0 <= nr < r and 0 <= nc < c and grid[nr][nc] == "." and not seen[nr][nc]:
                      total += count(grid, r, c, nr, nc, seen)
              seen[row][col] = False
              return total`,
        cpp: r`
          long long countRoutes(const vector<string>& grid, int r, int c, int row, int col, vector<vector<char>>& seen) {
              if (row == r - 1 && col == c - 1) return 1;
              long long total = 0;
              seen[row][col] = 1;
              int dr[4] = {1, -1, 0, 0};
              int dc[4] = {0, 0, 1, -1};
              for (int d = 0; d < 4; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] == '.' && !seen[nr][nc]) {
                      total += countRoutes(grid, r, c, nr, nc, seen);
                  }
              }
              seen[row][col] = 0;
              return total;
          }`,
        java: r`
          static long countRoutes(String[] grid, int r, int c, int row, int col, boolean[][] seen) {
              if (row == r - 1 && col == c - 1) return 1;
              long total = 0;
              seen[row][col] = true;
              int[] dr = {1, -1, 0, 0};
              int[] dc = {0, 0, 1, -1};
              for (int d = 0; d < 4; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr].charAt(nc) == '.' && !seen[nr][nc]) {
                      total += countRoutes(grid, r, c, nr, nc, seen);
                  }
              }
              seen[row][col] = false;
              return total;
          }`
      },
      python: r`
        seen = [[False] * c for _ in range(r)]
        print(count(grid, r, c, 0, 0, seen))`,
      cpp: r`
        vector<vector<char>> seen(r, vector<char>(c, 0));
        cout << countRoutes(grid, (int)r, (int)c, 0, 0, seen) << "\n";`,
      java: r`
        System.out.println(countRoutes(grid, (int) r, (int) c, 0, 0, new boolean[(int) r][(int) c]));`
    },
    solution: { explanation: ['The function marks the current cell, adds up the routes through each free unvisited neighbour, and unmarks the cell. Reaching the bottom-right cell completes one route.'], complexity: 'Time O(number of routes * r * c) at most, space O(r * c).' },
    solve(input) {
      const rs = rows(input); const [r, c] = nums(rs[0]); const grid = rs.slice(1, 1 + r);
      const bit = (i, j) => 1 << (i * c + j);
      const go = (i, j, mask) => { if (i === r - 1 && j === c - 1) return 1; let t = 0; mask |= bit(i, j); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a >= 0 && a < r && b >= 0 && b < c && grid[a][b] === '.' && !(mask & bit(a, b))) t += go(a, b, mask); } return t; };
      return String(go(0, 0, 0));
    },
    tests() {
      const g = rng(621);
      const open = (r, c) => `${r} ${c}\n${many(r, () => '.'.repeat(c)).join('\n')}\n`;
      const walls = (r, c, p) => { const rowsOut = many(r, () => many(c, () => (g() < p ? '#' : '.'))); rowsOut[0][0] = '.'; rowsOut[r - 1][c - 1] = '.'; return `${r} ${c}\n${rowsOut.map((x) => x.join('')).join('\n')}\n`; };
      return ['2 2\n..\n..\n', '1 1\n.\n', '1 5\n.....\n', '5 1\n.\n.\n.\n.\n.\n', '1 3\n.#.\n', '3 3\n...\n.#.\n...\n', open(3, 3), open(3, 4), open(4, 4), open(4, 6), open(5, 5), open(5, 6), open(6, 5), walls(5, 6, 0.15), walls(6, 5, 0.25), walls(5, 5, 0.1), walls(6, 5, 0.1), walls(4, 6, 0.3)];
    }
  },

  {
    slug: 'letter-case-variants',
    title: 'Every Way to Change the Case',
    difficulty: 'easy',
    tags: ['backtracking', 'strings', 'recursion'],
    concept: {
      title: 'A letter has two choices, a digit has one',
      body: [
        'For a string of letters and digits, you can change the case of each letter independently. A digit cannot change. So the recursion walks along the string: at a digit there is **one** way to continue, at a letter there are **two** (upper case or lower case). With `k` letters there are `2^k` results.',
        { code: 'def variants(s, pos, current, out):\n    if pos == len(s):\n        out.append("".join(current))\n        return\n    ch = s[pos]\n    options = [ch] if ch.isdigit() else [ch.upper(), ch.lower()]\n    for option in options:\n        current.append(option)\n        variants(s, pos + 1, current, out)\n        current.pop()' },
        'In the ASCII table every upper-case letter comes **before** every lower-case letter (`A` is 65, `a` is 97). Trying the upper-case option first therefore produces the results in ascending order without sorting.'
      ]
    },
    statement: ['You are given a string of letters and digits. Print every string that can be made by changing the case of any letters (each letter can be upper or lower case; digits stay). Print them in ascending ASCII order (upper-case letters come before lower-case letters), one per line.'],
    inputFormat: ['The only line has the string.'],
    outputFormat: ['All different results in ascending order, one per line.'],
    constraints: ['1 <= length of the string <= 12', 'The string has only English letters and digits.'],
    examples: [{ input: 'a1b\n', note: 'The four results are A1B, A1b, a1B and a1b.' }],
    hints: ['At a digit there is one way to go on; at a letter there are two.', 'Try the upper-case form before the lower-case form to get ascending order.', 'Record the string when you have decided every position.'],
    program: {
      io: ['s:word'],
      includes: ['<cctype>'],
      helpers: {
        python: r`
          def variants(s, pos, current, out):
              if pos == len(s):
                  out.append("".join(current))
                  return
              ch = s[pos]
              options = [ch] if ch.isdigit() else [ch.upper(), ch.lower()]
              for option in options:
                  current.append(option)
                  variants(s, pos + 1, current, out)
                  current.pop()`,
        cpp: r`
          void variants(const string& s, size_t pos, string& current, vector<string>& out) {
              if (pos == s.size()) {
                  out.push_back(current);
                  return;
              }
              char ch = s[pos];
              string options = isdigit((unsigned char)ch) ? string(1, ch) : string(1, (char)toupper((unsigned char)ch)) + (char)tolower((unsigned char)ch);
              for (char option : options) {
                  current.push_back(option);
                  variants(s, pos + 1, current, out);
                  current.pop_back();
              }
          }`,
        java: r`
          static void variants(String s, int pos, StringBuilder current, List<String> out) {
              if (pos == s.length()) {
                  out.add(current.toString());
                  return;
              }
              char ch = s.charAt(pos);
              char[] options = Character.isDigit(ch) ? new char[] {ch} : new char[] {Character.toUpperCase(ch), Character.toLowerCase(ch)};
              for (char option : options) {
                  current.append(option);
                  variants(s, pos + 1, current, out);
                  current.deleteCharAt(current.length() - 1);
              }
          }`
      },
      python: r`
        out = []
        variants(s, 0, [], out)
        print("\n".join(out))`,
      cpp: r`
        vector<string> out;
        string current;
        variants(s, 0, current, out);
        for (const string& v : out) cout << v << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        variants(s, 0, new StringBuilder(), out);
        StringBuilder sb = new StringBuilder();
        for (String v : out) sb.append(v).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The recursion decides one position per call: a digit is copied, a letter is tried as upper case and then as lower case. Upper case sorts before lower case, so the results are ascending.'], complexity: 'Time O(2^k * n) for k letters, space O(n) besides the output.' },
    solve(input) { const s = rows(input)[0].trim(); let out = ['']; for (const ch of s) out = out.flatMap((w) => (/\d/.test(ch) ? [w + ch] : [w + ch.toUpperCase(), w + ch.toLowerCase()])); return out.sort().join('\n'); },
    tests() { const g = rng(622); const mixed = (n) => many(n, () => 'aAbBcCdD1234'[randInt(g, 0, 11)]).join(''); return ['a1b\n', 'a\n', 'Z\n', '7\n', '12345\n', 'AbCd\n', 'ab12cd\n', 'zZ9yY8\n', `${mixed(6)}\n`, `${mixed(10)}\n`, `${randWord(g, 12, 'abcdefxyz')}\n`, 'abcdefghijkl\n', 'ABCDEFGHIJKL\n', 'a1b2c3d4e5f6\n']; }
  },

  {
    slug: 'xor-of-all-subsets',
    title: 'The Sum of the XOR of Every Subset',
    difficulty: 'easy',
    tags: ['backtracking', 'subsets', 'bits'],
    concept: {
      title: 'Carry a running value down the recursion',
      body: [
        'The **XOR** of a subset combines its numbers bit by bit: a bit of the result is 1 when an odd number of the numbers has that bit set. To add up the XOR values of all `2^n` subsets, decide every number as "in" or "out" while carrying the **XOR of the numbers taken so far** as an argument of the recursion.',
        { code: 'def total(a, i, current):\n    if i == len(a):\n        return current                 # the XOR of this subset\n    return total(a, i + 1, current) + total(a, i + 1, current ^ a[i])' },
        'No list of chosen numbers is needed, and nothing has to be undone afterwards: the value `current ^ a[i]` exists only inside the second call. When the choices can be summarised in one number, **passing it by value** is simpler than a table that you must restore.'
      ]
    },
    statement: ['Given `n` non-negative integers, consider all `2^n` subsets of positions (including the empty subset, whose XOR is 0). Print the sum of the XOR of the numbers of each subset.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print the sum.'],
    constraints: ['1 <= n <= 18', '0 <= each number <= 10^6'],
    examples: [{ input: '3\n1 2 3\n', note: 'The XOR values of the eight subsets are 0, 1, 2, 3, 3, 2, 1, 0, with the sum 12.' }],
    hints: ['For every number the recursion has two calls: leave it, or take it.', 'Pass the XOR of the taken numbers as an argument.', 'At the end of the numbers return that XOR; the sum of both calls is the answer.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      helpers: {
        python: r`
          def total(a, i, current):
              if i == len(a):
                  return current
              return total(a, i + 1, current) + total(a, i + 1, current ^ a[i])`,
        cpp: r`
          long long total(const vector<long long>& a, size_t i, long long current) {
              if (i == a.size()) return current;
              return total(a, i + 1, current) + total(a, i + 1, current ^ a[i]);
          }`,
        java: r`
          static long total(long[] a, int i, long current) {
              if (i == a.length) return current;
              return total(a, i + 1, current) + total(a, i + 1, current ^ a[i]);
          }`
      },
      python: 'print(total(a, 0, 0))',
      cpp: 'cout << total(a, 0, 0) << "\\n";',
      java: 'System.out.println(total(a, 0, 0));'
    },
    solution: { explanation: ['`total(i, current)` returns the sum over all ways to decide the numbers from position `i` on, given the XOR `current` of the numbers already taken. At the end of the list the XOR itself is the value of one subset.'], complexity: 'Time O(2^n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); let or = 0; for (const x of a) or |= x; return String(or * 2 ** (a.length - 1)); },
    tests() {
      const g = rng(623);
      const make = (a) => `${a.length}\n${a.join(' ')}\n`;
      const brute = (a) => { let t = 0; for (let mask = 0; mask < 1 << a.length; mask++) { let x = 0; for (let i = 0; i < a.length; i++) if ((mask >> i) & 1) x ^= a[i]; t += x; } return t; };
      crossCheck(() => make(randArray(g, randInt(g, 1, 10), 0, 1000)), (i) => this.solve(i), (i) => brute(nums(rows(i)[1])));
      return ['3\n1 2 3\n', '1\n0\n', '1\n5\n', '2\n5 5\n', '4\n0 0 0 0\n', make(many(18, () => 1000000)), make(many(18, () => 0)), make(randArray(g, 18, 0, 1000000)), make(randArray(g, 18, 0, 15)), make(many(18, (i) => 1 << (i % 20))), make(randArray(g, 17, 0, 1000000)), make(randArray(g, 16, 0, 255))];
    }
  },

  {
    slug: 'plus-minus-target',
    title: 'Plus or Minus in Front of Each Number',
    difficulty: 'easy',
    tags: ['backtracking', 'recursion', 'counting'],
    concept: {
      title: 'Every number has exactly two choices',
      body: [
        'In front of each number you must write either `+` or `-`. This is a decision tree with two branches at every level, `2^n` leaves in total. A recursive function carries the **sum so far** and, when all numbers have a sign, checks whether the sum is the target.',
        { code: 'def ways(a, i, current, target):\n    if i == len(a):\n        return 1 if current == target else 0\n    return ways(a, i + 1, current + a[i], target) + ways(a, i + 1, current - a[i], target)' },
        'Two different sign choices are different even when they give the same sum, and a number `0` has two choices that both keep the sum, so it doubles the count. In the same way as before, the running sum is passed **by value**, so nothing has to be undone.'
      ]
    },
    statement: ['Given `n` integers and a number `t`, write `+` or `-` in front of every integer so that the total is exactly `t`. Count the different ways (two ways are different if they differ in the sign of some position).'],
    inputFormat: ['The first line has `n` and `t`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print the number of ways.'],
    constraints: ['1 <= n <= 18', '0 <= each integer <= 1000', '-18000 <= t <= 18000'],
    examples: [{ input: '3 4\n1 2 3\n', note: 'Of the eight sign choices only -1 + 2 + 3 gives 4.' }],
    hints: ['Every number has two branches: add it or subtract it.', 'Carry the current sum as an argument.', 'When all numbers have a sign, count 1 if the sum equals the target.'],
    program: {
      io: ['n:int t:int', 'a:int[n]'],
      helpers: {
        python: r`
          def ways(a, i, current, target):
              if i == len(a):
                  return 1 if current == target else 0
              return ways(a, i + 1, current + a[i], target) + ways(a, i + 1, current - a[i], target)`,
        cpp: r`
          long long ways(const vector<long long>& a, size_t i, long long current, long long target) {
              if (i == a.size()) return current == target ? 1 : 0;
              return ways(a, i + 1, current + a[i], target) + ways(a, i + 1, current - a[i], target);
          }`,
        java: r`
          static long ways(long[] a, int i, long current, long target) {
              if (i == a.length) return current == target ? 1 : 0;
              return ways(a, i + 1, current + a[i], target) + ways(a, i + 1, current - a[i], target);
          }`
      },
      python: 'print(ways(a, 0, 0, t))',
      cpp: 'cout << ways(a, 0, 0, t) << "\\n";',
      java: 'System.out.println(ways(a, 0, 0, t));'
    },
    solution: { explanation: ['`ways(i, current)` tries `+a[i]` and `-a[i]`. After the last number, one way is counted when the sum is the target.'], complexity: 'Time O(2^n), space O(n).' },
    solve(input) { const rs = rows(input); const [, t] = nums(rs[0]); let counts = new Map([[0, 1]]); for (const x of nums(rs[1])) { const next = new Map(); for (const [s, c] of counts) for (const v of [s + x, s - x]) next.set(v, (next.get(v) || 0) + c); counts = next; } return String(counts.get(t) || 0); },
    tests() {
      const g = rng(624);
      const make = (t, a) => `${a.length} ${t}\n${a.join(' ')}\n`;
      const brute = (t, a) => { let c = 0; for (let mask = 0; mask < 1 << a.length; mask++) { let s = 0; for (let i = 0; i < a.length; i++) s += (mask >> i) & 1 ? a[i] : -a[i]; if (s === t) c++; } return c; };
      crossCheck(() => { const a = randArray(g, randInt(g, 1, 10), 0, 9); return make(randInt(g, -20, 20), a); }, (i) => this.solve(i), (i) => { const rs = rows(i); return brute(nums(rs[0])[1], nums(rs[1])); });
      return ['3 4\n1 2 3\n', '1 0\n0\n', '1 5\n5\n', '1 4\n5\n', '2 0\n7 7\n', make(0, many(18, () => 0)), make(0, many(18, () => 1)), make(2, many(18, () => 1)), make(18000, many(18, () => 1000)), make(-18000, many(18, () => 1000)), make(0, randArray(g, 18, 0, 1000)), make(100, randArray(g, 18, 0, 20)), make(7, randArray(g, 18, 0, 5)), make(1, many(17, (i) => i + 1))];
    }
  },

  {
    slug: 'n-queens-count',
    title: 'Place n Queens So None Attacks Another',
    difficulty: 'easy',
    tags: ['backtracking', 'chessboard', 'pruning'],
    concept: {
      title: 'One queen per row, and a check before every placement',
      body: [
        'A queen attacks along its row, its column and both diagonals. On an `n` by `n` board, `n` queens that do not attack each other must be in **different rows**, so we place exactly one queen in each row, from the top row to the bottom row. The only question in each row is the **column**.',
        'A column is allowed only if no queen above it uses the same column or one of its two diagonals. Cells on the same "\\" diagonal have the same value of `row - col`, and cells on the same "/" diagonal have the same value of `row + col`. Three arrays of booleans remember what is taken:',
        { code: 'def place(n, row, cols, d1, d2):\n    if row == n:\n        return 1                           # all rows have a queen\n    total = 0\n    for col in range(n):\n        if cols[col] or d1[row + col] or d2[row - col + n - 1]:\n            continue                       # attacked: skip\n        cols[col] = d1[row + col] = d2[row - col + n - 1] = True\n        total += place(n, row + 1, cols, d1, d2)\n        cols[col] = d1[row + col] = d2[row - col + n - 1] = False\n    return total' },
        'Checking each queen against the earlier ones **before** placing it cuts away the huge part of the search where two queens already attack each other. For `n = 8` there are 92 solutions; the search visits only a few thousand placements instead of billions.'
      ]
    },
    statement: ['Count the ways to place `n` queens on an `n` by `n` chessboard so that no two queens attack each other (no two in the same row, column or diagonal).'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['Print the number of placements.'],
    constraints: ['1 <= n <= 11'],
    examples: [{ input: '4\n', note: 'There are two placements: queens in columns 2 4 1 3 and 3 1 4 2 of rows 1 to 4.' }],
    hints: ['Put exactly one queen in each row and choose its column.', 'A column is free if no earlier queen shares the column, the row + col diagonal or the row - col diagonal.', 'Mark the three things when you place a queen and unmark them when you take it away.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def place(n, row, cols, d1, d2):
              if row == n:
                  return 1
              total = 0
              for col in range(n):
                  if cols[col] or d1[row + col] or d2[row - col + n - 1]:
                      continue
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = True
                  total += place(n, row + 1, cols, d1, d2)
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = False
              return total`,
        cpp: r`
          long long place(int n, int row, vector<char>& cols, vector<char>& d1, vector<char>& d2) {
              if (row == n) return 1;
              long long total = 0;
              for (int col = 0; col < n; col++) {
                  if (cols[col] || d1[row + col] || d2[row - col + n - 1]) continue;
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = 1;
                  total += place(n, row + 1, cols, d1, d2);
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = 0;
              }
              return total;
          }`,
        java: r`
          static long place(int n, int row, boolean[] cols, boolean[] d1, boolean[] d2) {
              if (row == n) return 1;
              long total = 0;
              for (int col = 0; col < n; col++) {
                  if (cols[col] || d1[row + col] || d2[row - col + n - 1]) continue;
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = true;
                  total += place(n, row + 1, cols, d1, d2);
                  cols[col] = d1[row + col] = d2[row - col + n - 1] = false;
              }
              return total;
          }`
      },
      python: 'print(place(n, 0, [False] * n, [False] * (2 * n), [False] * (2 * n)))',
      cpp: r`
        vector<char> cols(n, 0), d1(2 * n, 0), d2(2 * n, 0);
        cout << place((int)n, 0, cols, d1, d2) << "\n";`,
      java: 'System.out.println(place((int) n, 0, new boolean[(int) n], new boolean[2 * (int) n], new boolean[2 * (int) n]));'
    },
    solution: { explanation: ['Each call fills one row. A column is used only when the column and both diagonals are free; they are marked before the recursive call and cleared after it. Reaching the row `n` means all queens are placed.'], complexity: 'Time exponential, about 166 000 placements for n = 11; space O(n).' },
    solve(input) { return String([1, 1, 0, 0, 2, 10, 4, 40, 92, 352, 724, 2680][Number(rows(input)[0])]); },
    tests() {
      const brute = (n) => { const cols = []; let c = 0; const go = (row) => { if (row === n) { c++; return; } for (let col = 0; col < n; col++) { if (cols.every((cc, rr) => cc !== col && Math.abs(cc - col) !== row - rr)) { cols.push(col); go(row + 1); cols.pop(); } } }; go(0); return c; };
      for (let n = 1; n <= 9; n++) if (String(this.solve(`${n}\n`)) !== String(brute(n))) throw new Error('queens table differs for ' + n);
      return many(11, (i) => `${i + 1}\n`);
    }
  },

  {
    slug: 'codes-with-given-digit-sum',
    title: 'Lock Codes With a Given Digit Sum',
    difficulty: 'easy',
    tags: ['backtracking', 'pruning', 'digits'],
    concept: {
      title: 'Stop a branch as soon as the sum can no longer be reached',
      body: [
        'A code has `n` digits, each from 0 to 9 (leading zeros are allowed), and the digits must add up to `s`. Build the code digit by digit. After some digits, the amount `remaining` is what the other digits still have to give. If `left` digits are still to be chosen, they can give anything from `0` to `9 * left`.',
        { code: 'def build(n, remaining, current, out):\n    left = n - len(current)\n    if left == 0:\n        if remaining == 0:\n            out.append("".join(current))\n        return\n    for d in range(10):\n        rest = remaining - d\n        if rest < 0 or rest > 9 * (left - 1):     # impossible to finish: prune\n            continue\n        current.append(str(d))\n        build(n, rest, current, out)\n        current.pop()' },
        'The check `rest > 9 * (left - 1)` is a **bound**: even if all later digits were 9, the sum could not be reached, so the branch is not entered. With such bounds every branch that is started leads to at least one answer, so there is no wasted work. Increasing digits are tried first, so the codes come out in increasing order.'
      ]
    },
    statement: ['A code has `n` digits (0 to 9, leading zeros allowed). Print all codes whose digits add up to `s`, in increasing order, one per line. If there is no such code, print `-1`.'],
    inputFormat: ['The only line has `n` and `s`.'],
    outputFormat: ['The codes in increasing order, one per line, or `-1`.'],
    constraints: ['1 <= n <= 5', '0 <= s <= 45'],
    examples: [{ input: '3 3\n', note: 'The codes are 003, 012, 021, 030, 102, 111, 120, 201, 210 and 300.' }],
    hints: ['Choose the digits from left to right, smaller digits first.', 'Pass the sum that is still missing as an argument.', 'Skip a digit if the rest would be negative or larger than 9 times the number of digits left.'],
    program: {
      io: ['n:int s:int'],
      helpers: {
        python: r`
          def build(n, remaining, current, out):
              left = n - len(current)
              if left == 0:
                  if remaining == 0:
                      out.append("".join(current))
                  return
              for d in range(10):
                  rest = remaining - d
                  if rest < 0 or rest > 9 * (left - 1):
                      continue
                  current.append(str(d))
                  build(n, rest, current, out)
                  current.pop()`,
        cpp: r`
          void build(int n, int remaining, string& current, vector<string>& out) {
              int left = n - (int)current.size();
              if (left == 0) {
                  if (remaining == 0) out.push_back(current);
                  return;
              }
              for (int d = 0; d < 10; d++) {
                  int rest = remaining - d;
                  if (rest < 0 || rest > 9 * (left - 1)) continue;
                  current.push_back((char)('0' + d));
                  build(n, rest, current, out);
                  current.pop_back();
              }
          }`,
        java: r`
          static void build(int n, int remaining, StringBuilder current, List<String> out) {
              int left = n - current.length();
              if (left == 0) {
                  if (remaining == 0) out.add(current.toString());
                  return;
              }
              for (int d = 0; d < 10; d++) {
                  int rest = remaining - d;
                  if (rest < 0 || rest > 9 * (left - 1)) continue;
                  current.append((char) ('0' + d));
                  build(n, rest, current, out);
                  current.deleteCharAt(current.length() - 1);
              }
          }`
      },
      python: r`
        out = []
        build(n, s, [], out)
        print("\n".join(out) if out else -1)`,
      cpp: r`
        vector<string> out;
        string current;
        build((int)n, (int)s, current, out);
        if (out.empty()) cout << -1 << "\n";
        for (const string& code : out) cout << code << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        build((int) n, (int) s, new StringBuilder(), out);
        if (out.isEmpty()) System.out.println(-1);
        StringBuilder sb = new StringBuilder();
        for (String code : out) sb.append(code).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Digits are chosen from left to right. A digit is skipped when the remaining sum would be negative or more than the later digits can supply, so every started branch ends in a valid code; smaller digits first give increasing order.'], complexity: 'Time O(number of codes * n), at most about 6000 codes.' },
    solve(input) { const [n, s] = nums(rows(input)[0]); const out = []; for (let v = 0; v < 10 ** n; v++) { const t = String(v).padStart(n, '0'); if ([...t].reduce((x, d) => x + Number(d), 0) === s) out.push(t); } return out.length ? out.join('\n') : '-1'; },
    tests() { return ['3 3\n', '1 0\n', '1 9\n', '1 10\n', '2 18\n', '2 19\n', '5 0\n', '5 45\n', '5 44\n', '5 22\n', '5 23\n', '5 20\n', '4 18\n', '3 13\n', '5 1\n', '4 36\n', '4 37\n']; }
  },

  {
    slug: 'compositions-with-steps',
    title: 'All Ways to Climb With Steps of 1, 2 or 3',
    difficulty: 'easy',
    tags: ['backtracking', 'recursion', 'enumeration'],
    concept: {
      title: 'List the ways instead of counting them',
      body: [
        'A staircase of `n` steps is climbed with moves of 1, 2 or 3 steps, and the **order of the moves matters**: `1+2` and `2+1` are different ways. Counting them is easy with a formula, but here every way must be **printed**, so we build them with backtracking: keep the moves so far in a list and the number of steps still to climb.',
        { code: 'def climb(remaining, current, out):\n    if remaining == 0:\n        out.append("+".join(map(str, current)))   # a complete way\n        return\n    for step in (1, 2, 3):\n        if step <= remaining:                    # never climb past the top\n            current.append(step)\n            climb(remaining - step, current, out)\n            current.pop()' },
        'The loop tries the small steps first, so the ways come out in dictionary order of their text (`1+1+2` before `1+2+1`). This is the usual shape of "list all solutions": the recursion stops when nothing remains to be done, and the list `current` is restored after each try.'
      ]
    },
    statement: ['A staircase has `n` steps. In one move you climb 1, 2 or 3 steps, and you must reach exactly the top. Print all ways to climb it, each as the moves joined with `+` (for example `1+2`), in dictionary order, one way per line.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['All ways in dictionary order, one per line.'],
    constraints: ['1 <= n <= 10 (at most 274 ways)'],
    examples: [{ input: '4\n', note: 'The seven ways are 1+1+1+1, 1+1+2, 1+2+1, 1+3, 2+1+1, 2+2 and 3+1.' }],
    hints: ['Keep a list of the moves made and the number of steps that remain.', 'When nothing remains, record the list as a text.', 'Try the moves 1, 2, 3 in this order, but never a move larger than the steps that remain.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def climb(remaining, current, out):
              if remaining == 0:
                  out.append("+".join(map(str, current)))
                  return
              for step in (1, 2, 3):
                  if step <= remaining:
                      current.append(step)
                      climb(remaining - step, current, out)
                      current.pop()`,
        cpp: r`
          void climb(int remaining, vector<int>& current, vector<string>& out) {
              if (remaining == 0) {
                  string line;
                  for (size_t i = 0; i < current.size(); i++) line += (i ? "+" : "") + to_string(current[i]);
                  out.push_back(line);
                  return;
              }
              for (int step = 1; step <= 3; step++) {
                  if (step <= remaining) {
                      current.push_back(step);
                      climb(remaining - step, current, out);
                      current.pop_back();
                  }
              }
          }`,
        java: r`
          static void climb(int remaining, List<Integer> current, List<String> out) {
              if (remaining == 0) {
                  StringBuilder line = new StringBuilder();
                  for (int i = 0; i < current.size(); i++) line.append(i > 0 ? "+" : "").append(current.get(i));
                  out.add(line.toString());
                  return;
              }
              for (int step = 1; step <= 3; step++) {
                  if (step <= remaining) {
                      current.add(step);
                      climb(remaining - step, current, out);
                      current.remove(current.size() - 1);
                  }
              }
          }`
      },
      python: r`
        out = []
        climb(n, [], out)
        print("\n".join(out))`,
      cpp: r`
        vector<string> out;
        vector<int> current;
        climb((int)n, current, out);
        for (const string& line : out) cout << line << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        climb((int) n, new ArrayList<>(), out);
        StringBuilder sb = new StringBuilder();
        for (String line : out) sb.append(line).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The recursion keeps the moves made so far. When the remaining height is 0 the list is recorded; otherwise the moves 1, 2, 3 that fit are tried in order, and each is removed again after the recursive call.'], complexity: 'Time O(number of ways * n), space O(n) besides the output.' },
    solve(input) { const n = Number(rows(input)[0]); let ways = [[]]; const done = []; while (ways.length) { const next = []; for (const w of ways) { const used = w.reduce((x, y) => x + y, 0); if (used === n) { done.push(w.join('+')); continue; } for (const s of [1, 2, 3]) if (used + s <= n) next.push([...w, s]); } ways = next; } return done.sort().join('\n'); },
    tests() { return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `${n}\n`); }
  },

  {
    slug: 'subsets-with-small-product',
    title: 'Subsets Whose Product Is Small',
    difficulty: 'easy',
    tags: ['backtracking', 'pruning', 'subsets'],
    concept: {
      title: 'Sort first, and stop the whole loop when a number is too big',
      body: [
        'Count the non-empty subsets whose product is at most `limit`. All numbers are at least 1, so adding a number never lowers the product. Sort the numbers in increasing order and build subsets by choosing indexes in increasing order. At a node with product `p`, try the next numbers from small to large:',
        { code: 'def count(a, start, product, limit):\n    total = 0\n    for i in range(start, len(a)):\n        if product * a[i] > limit:\n            break                          # all later numbers are even bigger\n        total += 1 + count(a, i + 1, product * a[i], limit)\n    return total' },
        'The `break` is stronger than a `continue`: since the list is sorted, **every** later number is at least as big, so none of them can fit. One test cuts all the remaining branches of the loop. Every subset is counted once, when it is created by adding its last number (the `1 +`), and the recursive call counts the subsets that contain it as a prefix.'
      ]
    },
    statement: ['Given `n` positive integers and a number `limit`, count the non-empty subsets of positions whose product is at most `limit`. Equal numbers at different positions give different subsets.'],
    inputFormat: ['The first line has `n` and `limit`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print the number of subsets.'],
    constraints: ['1 <= n <= 18', '1 <= each number <= 1000', '1 <= limit <= 10^12'],
    examples: [{ input: '3 6\n1 2 3\n', note: 'The subsets {1}, {2}, {3}, {1,2}, {1,3}, {2,3} and {1,2,3} have products 1, 2, 3, 2, 3, 6 and 6; all are at most 6, so the answer is 7.' }],
    hints: ['Sort the numbers; then choose subsets by increasing index.', 'If the product with the next number is already above the limit, every later number is too: stop the loop.', 'Count one for the subset itself and add the count of subsets that extend it.'],
    program: {
      io: ['n:int limit:int', 'a:int[n]'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def count(a, start, product, limit):
              total = 0
              for i in range(start, len(a)):
                  if product * a[i] > limit:
                      break
                  total += 1 + count(a, i + 1, product * a[i], limit)
              return total`,
        cpp: r`
          long long countSubsets(const vector<long long>& a, size_t start, long long product, long long limit) {
              long long total = 0;
              for (size_t i = start; i < a.size(); i++) {
                  if (product * a[i] > limit) break;
                  total += 1 + countSubsets(a, i + 1, product * a[i], limit);
              }
              return total;
          }`,
        java: r`
          static long countSubsets(long[] a, int start, long product, long limit) {
              long total = 0;
              for (int i = start; i < a.length; i++) {
                  if (product * a[i] > limit) break;
                  total += 1 + countSubsets(a, i + 1, product * a[i], limit);
              }
              return total;
          }`
      },
      python: r`
        a.sort()
        print(count(a, 0, 1, limit))`,
      cpp: r`
        sort(a.begin(), a.end());
        cout << countSubsets(a, 0, 1, limit) << "\n";`,
      java: r`
        Arrays.sort(a);
        System.out.println(countSubsets(a, 0, 1, limit));`
    },
    solution: { explanation: ['After sorting, the recursion adds numbers in increasing index order. Once `product * a[i]` exceeds the limit, all later numbers fail too, so the loop ends. Each fitting number counts one subset plus the subsets that extend it.'], complexity: 'Time O(number of subsets counted), at most 2^18; space O(n).' },
    solve(input) { const rs = rows(input); const [, limit] = nums(rs[0]); const a = nums(rs[1]); let c = 0; for (let mask = 1; mask < 1 << a.length; mask++) { let p = 1, ok = true; for (let i = 0; i < a.length; i++) if ((mask >> i) & 1) { p *= a[i]; if (p > limit) { ok = false; break; } } if (ok) c++; } return String(c); },
    tests() {
      const g = rng(625);
      const make = (limit, a) => `${a.length} ${limit}\n${a.join(' ')}\n`;
      return ['3 6\n1 2 3\n', '1 1\n1\n', '1 1\n2\n', '2 4\n2 2\n', make(1000000000000, many(18, () => 1)), make(1, many(18, () => 1)), make(1000000000000, many(18, () => 1000)), make(1000000000000, many(18, () => 2)), make(1000, randArray(g, 18, 1, 10)), make(1000000, randArray(g, 18, 1, 100)), make(1000000000000, randArray(g, 18, 1, 1000)), make(5000, randArray(g, 18, 1, 30)), make(100, randArray(g, 17, 1, 4)), make(999999999999, randArray(g, 18, 1, 6))];
    }
  },

  {
    slug: 'numbers-with-distinct-digits',
    title: 'Numbers With No Repeated Digit',
    difficulty: 'easy',
    tags: ['backtracking', 'digits', 'counting'],
    concept: {
      title: 'Build the number one digit at a time and remember the used digits',
      body: [
        'Count the integers from 0 to `10^n - 1` in which all decimal digits are different (so `121` does not count, `123` does). Build the numbers digit by digit and keep a table `used` of the digits that already appear. Every node of the search is itself a valid number, so the answer is the **number of nodes**.',
        { code: 'def extend(n, length, used):\n    total = 1                         # the number built so far is valid\n    if length == n:\n        return total\n    for d in range(10):\n        if not used[d]:\n            used[d] = True\n            total += extend(n, length + 1, used)\n            used[d] = False\n    return total\n\n# the number 0, plus every number that starts with 1..9\ntotal = 1\nfor first in range(1, 10):\n    used[first] = True\n    total += extend(n, 1, used)\n    used[first] = False' },
        'The first digit is never 0 (a number does not start with a 0, apart from the number 0 itself), and each later digit is any digit that is not used yet. For `n = 2` the answer is 91: the 10 one-digit numbers and `9 * 9 = 81` two-digit numbers. The count grows fast, which is why `n` is at most 6.'
      ]
    },
    statement: ['Count the integers from 0 to `10^n - 1` (inclusive) whose decimal digits are all different. The number 0 counts.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['Print the count.'],
    constraints: ['1 <= n <= 6'],
    examples: [{ input: '2\n', note: 'There are 10 numbers with one digit and 81 numbers with two different digits: 91 in total.' }],
    hints: ['Extend the number by one digit at a time, using only digits that are not used yet.', 'Every number you build is valid, so add 1 in every call.', 'Start the first digit from 1 to 9, and do not forget the number 0.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def extend(n, length, used):
              total = 1
              if length == n:
                  return total
              for d in range(10):
                  if not used[d]:
                      used[d] = True
                      total += extend(n, length + 1, used)
                      used[d] = False
              return total`,
        cpp: r`
          long long extend(int n, int length, vector<char>& used) {
              long long total = 1;
              if (length == n) return total;
              for (int d = 0; d < 10; d++) {
                  if (!used[d]) {
                      used[d] = 1;
                      total += extend(n, length + 1, used);
                      used[d] = 0;
                  }
              }
              return total;
          }`,
        java: r`
          static long extend(int n, int length, boolean[] used) {
              long total = 1;
              if (length == n) return total;
              for (int d = 0; d < 10; d++) {
                  if (!used[d]) {
                      used[d] = true;
                      total += extend(n, length + 1, used);
                      used[d] = false;
                  }
              }
              return total;
          }`
      },
      python: r`
        used = [False] * 10
        total = 1
        for first in range(1, 10):
            used[first] = True
            total += extend(n, 1, used)
            used[first] = False
        print(total)`,
      cpp: r`
        vector<char> used(10, 0);
        long long total = 1;
        for (int first = 1; first <= 9; first++) {
            used[first] = 1;
            total += extend((int)n, 1, used);
            used[first] = 0;
        }
        cout << total << "\n";`,
      java: r`
        boolean[] used = new boolean[10];
        long total = 1;
        for (int first = 1; first <= 9; first++) {
            used[first] = true;
            total += extend((int) n, 1, used);
            used[first] = false;
        }
        System.out.println(total);`
    },
    solution: { explanation: ['The search builds numbers digit by digit, never reusing a digit. Each call stands for one valid number, so it adds 1 and then the counts of its extensions. The number 0 is added separately.'], complexity: 'Time O(answer * 10), at most about 1.7 * 10^6 steps; space O(n).' },
    solve(input) { const n = Number(rows(input)[0]); let total = 1; for (let len = 1; len <= n; len++) { let ways = 9; for (let i = 1; i < len; i++) ways *= 10 - i; total += ways; } return String(total); },
    tests() { return [1, 2, 3, 4, 5, 6].map((n) => `${n}\n`); }
  },

  {
    slug: 'palindromes-over-an-alphabet',
    title: 'All Palindromes Over k Letters',
    difficulty: 'easy',
    tags: ['backtracking', 'strings', 'palindrome'],
    concept: {
      title: 'Choose half of the word, the other half is forced',
      body: [
        'A palindrome of length `n` is decided by its **first half**: the letter at position `i` and the letter at position `n - 1 - i` must be equal. So the search only chooses the letters of positions `0 .. (n - 1) / 2`, and each choice is written to **both** positions. In the middle of an odd word the two positions are the same cell.',
        { code: 'def build(n, k, pos, word, out):\n    if pos == (n + 1) // 2:\n        out.append("".join(word))        # the first half decides everything\n        return\n    for c in range(k):\n        letter = chr(ord("a") + c)\n        word[pos] = word[n - 1 - pos] = letter\n        build(n, k, pos + 1, word, out)' },
        'There is no undo step here: the next letter for the same positions simply **overwrites** the previous one, and the later positions are always written again before they are used. Whenever a choice can only be replaced by another choice, no explicit "unchoose" is needed. Because we try the letters in alphabetical order, the palindromes come out in dictionary order, and there are only `k^((n + 1) / 2)` of them.'
      ]
    },
    statement: ['Print all palindromes of length `n` made of the first `k` lowercase letters (`a`, `b`, ...), in dictionary order, one per line.'],
    inputFormat: ['The only line has `n` and `k`.'],
    outputFormat: ['The palindromes in dictionary order, one per line.'],
    constraints: ['1 <= n <= 8', '1 <= k <= 4'],
    examples: [{ input: '3 2\n', note: 'The palindromes are aaa, aba, bab and bbb.' }],
    hints: ['Only the first half of the word is chosen freely.', 'When you choose the letter at position i, write it also at position n - 1 - i.', 'Try the letters in alphabetical order to get the dictionary order.'],
    program: {
      io: ['n:int k:int'],
      helpers: {
        python: r`
          def build(n, k, pos, word, out):
              if pos == (n + 1) // 2:
                  out.append("".join(word))
                  return
              for c in range(k):
                  letter = chr(ord("a") + c)
                  word[pos] = word[n - 1 - pos] = letter
                  build(n, k, pos + 1, word, out)`,
        cpp: r`
          void build(int n, int k, int pos, string& word, vector<string>& out) {
              if (pos == (n + 1) / 2) {
                  out.push_back(word);
                  return;
              }
              for (int c = 0; c < k; c++) {
                  char letter = (char)('a' + c);
                  word[pos] = word[n - 1 - pos] = letter;
                  build(n, k, pos + 1, word, out);
              }
          }`,
        java: r`
          static void build(int n, int k, int pos, char[] word, List<String> out) {
              if (pos == (n + 1) / 2) {
                  out.add(new String(word));
                  return;
              }
              for (int c = 0; c < k; c++) {
                  char letter = (char) ('a' + c);
                  word[pos] = word[n - 1 - pos] = letter;
                  build(n, k, pos + 1, word, out);
              }
          }`
      },
      python: r`
        out = []
        build(n, k, 0, ["a"] * n, out)
        print("\n".join(out))`,
      cpp: r`
        vector<string> out;
        string word((size_t)n, 'a');
        build((int)n, (int)k, 0, word, out);
        for (const string& w : out) cout << w << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        char[] word = new char[(int) n];
        Arrays.fill(word, 'a');
        build((int) n, (int) k, 0, word, out);
        StringBuilder sb = new StringBuilder();
        for (String w : out) sb.append(w).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The recursion fills positions `0 .. (n - 1) / 2` and mirrors each letter to position `n - 1 - pos`. When the first half is complete the word is a palindrome and is recorded; the alphabetical loop gives dictionary order.'], complexity: 'Time O(k^((n + 1) / 2) * n), space O(n) besides the output.' },
    solve(input) { const [n, k] = nums(rows(input)[0]); const half = Math.ceil(n / 2); const out = []; for (let v = 0; v < k ** half; v++) { const digits = []; let x = v; for (let i = 0; i < half; i++) { digits.unshift(x % k); x = Math.floor(x / k); } const left = digits.map((d) => String.fromCharCode(97 + d)).join(''); const right = [...left.slice(0, Math.floor(n / 2))].reverse().join(''); out.push(left + right); } return out.join('\n'); },
    tests() { return ['3 2\n', '1 1\n', '1 4\n', '2 3\n', '4 2\n', '5 3\n', '6 4\n', '7 4\n', '8 4\n', '8 1\n', '8 2\n', '7 3\n', '2 1\n']; }
  }
];
