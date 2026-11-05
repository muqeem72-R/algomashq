import { r, rng, randInt, many, nums, rows, shuffle, randArray } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const MOD = 1000000007;
const matrixText = (m, head = '') => `${m.length} ${m[0].length}${head}\n${m.map((row) => row.join(' ')).join('\n')}\n`;
const randomMatrix = (g, h, w, lo, hi) => many(h, () => randArray(g, w, lo, hi));
const parseMatrix = (input) => { const rs = rows(input); const head = nums(rs[0]); const [h, w] = head; return { h, w, head, m: many(h, (i) => nums(rs[i + 1])) }; };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export default [
  {
    ...medium,
    inputFormat: ['The first line has `h` and `w`: the number of rows and columns of the dungeon.', 'Each of the next `h` lines has `w` numbers: a negative number is a room with monsters (it takes that much health away), a positive number is a room with a potion (it adds health), 0 is an empty room.'],
    constraints: ['1 <= h, w <= 400', '-1000 <= each number <= 1000'],
    slug: 'dungeon-game',
    title: 'The Smallest Starting Health for the Dungeon',
    tags: ['dp', 'grid', 'backward-dp'],
    concept: {
      title: 'When the future decides the present, fill the table from the end',
      body: [
        'A knight is in the top left room of a dungeon (a grid of rooms) and must reach the princess in the bottom right room. He moves **one room right or down** at a time. Each room changes his health by the number written in it (a negative number hurts, a positive number heals), **including the first and the last room**. If his health ever drops to 0 or below, he dies. What is the **smallest starting health** that lets him reach the princess alive?',
        'A table from the start does not work, because the best choice depends on the health needed **later**. So go **backwards**. Let `need(i, j)` be the smallest health the knight must have **when he enters** the room `(i, j)` to survive to the end. From the room he goes to the cheaper of the right and the lower rooms, so before the room\'s effect he needs `min(need right, need below)`; the room then changes his health by `d`, so he needs `that - d`, and always at least 1: **`need(i, j) = max(1, min(need(i, j + 1), need(i + 1, j)) - d(i, j))`**. For the last room there is nothing after it: `need = max(1, 1 - d)`. The answer is `need(0, 0)`.',
        { code: 'INF = 10 ** 9\nneed = [INF] * (w + 1)\nneed[w - 1] = 1                         # the "room" below the last row: 1 health is enough\nfor i in range(h - 1, -1, -1):\n    new = [INF] * (w + 1)\n    for j in range(w - 1, -1, -1):\n        new[j] = max(1, min(need[j], new[j + 1]) - d[i][j])\n    need = new\nprint(need[0])' },
        'The table is filled from the bottom right corner, row by row from the bottom and right to left; one row is enough. The time is O(h * w) and the memory O(w). The idea to remember: if a forward table needs to know the future, define the state as "what is required from here to the end".'
      ]
    },
    statement: ['A dungeon is a grid of `h` rows and `w` columns; the room `(i, j)` changes the knight\'s health by `d(i, j)`. The knight starts in the top left room, moves one room right or down at a time and must reach the bottom right room. His health must stay at least 1 after every room, including the first and the last. Print the smallest starting health that makes this possible.'],
    outputFormat: ['Print the smallest starting health.'],
    examples: [{ input: '3 3\n-2 -3 3\n-5 -10 1\n10 30 -5\n', note: 'The route right, right, down, down needs the starting health 7.' }, { input: '1 1\n0\n', note: 'One empty room: the knight needs 1 health.' }],
    hints: ['Let need(i, j) be the smallest health needed when entering the room (i, j).', 'need(i, j) = max(1, min(need to the right, need below) - d(i, j)).', 'Fill the table from the bottom right corner.'],
    program: {
      io: ['h:int w:int', 'd:int[h][w]'],
      fast: true,
      python: r`
        INF = 10 ** 9
        need = [INF] * (w + 1)
        need[w - 1] = 1
        for i in range(h - 1, -1, -1):
            row = d[i]
            new = [INF] * (w + 1)
            for j in range(w - 1, -1, -1):
                nxt = need[j] if need[j] < new[j + 1] else new[j + 1]
                v = nxt - row[j]
                new[j] = v if v > 1 else 1
            need = new
        print(need[0])`,
      cpp: r`
        const long long INF = 1000000000;
        vector<long long> need(w + 1, INF);
        need[w - 1] = 1;
        for (int i = (int)h - 1; i >= 0; i--) {
            vector<long long> next(w + 1, INF);
            for (int j = (int)w - 1; j >= 0; j--) {
                long long best = min(need[j], next[j + 1]);
                next[j] = max(1LL, best - d[i][j]);
            }
            need = next;
        }
        cout << need[0] << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        final long INF = 1000000000L;
        long[] need = new long[colsCount + 1];
        Arrays.fill(need, INF);
        need[colsCount - 1] = 1;
        long[] next = new long[colsCount + 1];
        for (int i = rowsCount - 1; i >= 0; i--) {
            Arrays.fill(next, INF);
            for (int j = colsCount - 1; j >= 0; j--) {
                long best = Math.min(need[j], next[j + 1]);
                next[j] = Math.max(1L, best - d[i][j]);
            }
            long[] swap = need;
            need = next;
            next = swap;
        }
        System.out.println(need[0]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['need(i, j), the smallest health needed on entering the room (i, j), is max(1, min(need to the right, need below) - d(i, j)), with need = 1 beyond the last room; it is filled from the bottom right corner with one row, and need(0, 0) is the answer.'], complexity: 'Time O(h * w), space O(w).' },
    solve(input) {
      const { h, w, m } = parseMatrix(input); // binary search on the starting health, checking it with a forward table of the largest health that can be kept in each room
      const alive = (start) => { const best = Array.from({ length: h }, () => new Array(w).fill(-Infinity)); for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) { let before = i === 0 && j === 0 ? start : Math.max(i ? best[i - 1][j] : -Infinity, j ? best[i][j - 1] : -Infinity); if (before === -Infinity) continue; const after = before + m[i][j]; best[i][j] = after >= 1 ? after : -Infinity; } return best[h - 1][w - 1] !== -Infinity; };
      let lo = 1, hi = 1 + 1000 * (h + w); while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (alive(mid)) hi = mid; else lo = mid + 1; } return String(lo);
    },
    tests() {
      const g = rng(2061); const out = ['3 3\n-2 -3 3\n-5 -10 1\n10 30 -5\n', '1 1\n0\n', '1 1\n-5\n', '1 1\n5\n', '2 2\n0 -3\n-3 0\n'];
      const brute = (input) => { const { h, w, m } = parseMatrix(input); let best = Infinity; const go = (i, j, sum, low) => { sum += m[i][j]; low = Math.min(low, sum); if (i === h - 1 && j === w - 1) { best = Math.min(best, Math.max(1, 1 - low)); return; } if (i + 1 < h) go(i + 1, j, sum, low); if (j + 1 < w) go(i, j + 1, sum, low); }; go(0, 0, 0, Infinity); return String(best); };
      crossCheck(() => matrixText(randomMatrix(g, randInt(g, 1, 5), randInt(g, 1, 5), -10, 10)), (i) => this.solve(i), brute, 400);
      for (const [h, w, lo, hi] of [[10, 10, -50, 50], [50, 50, -1000, 1000], [100, 100, -1000, 1000], [200, 200, -1000, 400], [400, 400, -1000, 1000], [400, 400, -1000, 0], [400, 400, 0, 1000], [1, 400, -1000, 1000], [400, 1, -1000, 1000], [399, 397, -1000, 800]]) out.push(matrixText(randomMatrix(g, h, w, lo, hi)));
      out.push(matrixText(many(200, () => new Array(200).fill(-1000))), matrixText(many(200, () => new Array(200).fill(1000))), matrixText(many(200, (i) => many(200, (j) => ((i + j) % 2 ? -1000 : 1000)))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `h` and `w`: the number of rows and columns.', 'Each of the next `h` lines has `w` numbers: the number of coins in each cell.'],
    constraints: ['1 <= h, w <= 400', '0 <= each number <= 1000'],
    slug: 'best-coin-route-and-count',
    title: 'The Richest Route and How Many Routes Are Richest',
    tags: ['dp', 'grid', 'counting', 'pairs'],
    concept: {
      title: 'Store two numbers in every cell: the best value and the number of ways to get it',
      body: [
        'Coins lie in the cells of a grid. A collector walks from the top left cell to the bottom right cell, moving **right or down**, and takes the coins of every cell on the way (the first and the last cell too). Two things are asked: the **largest** number of coins that can be collected, and **how many different routes** collect exactly that many. Print both numbers; the number of routes is taken modulo 1 000 000 007.',
        'Keep a **pair** for every cell: `best(i, j)`, the most coins on a route ending there, and `ways(i, j)`, the number of routes with that many coins. A route to `(i, j)` came from above or from the left. Compare the two `best` values: if one is larger, only that neighbour can be the previous cell, and `ways` is copied from it; if they are **equal**, both neighbours give optimal routes, and the `ways` are **added**. In both cases `best(i, j)` is the larger value plus the coins of the cell.',
        { code: 'if up_best > left_best:   best, ways = up_best + coin, up_ways\nelif left_best > up_best: best, ways = left_best + coin, left_ways\nelse:                     best, ways = up_best + coin, (up_ways + left_ways) % MOD' },
        'This is the standard way to count the *optimal* solutions together with the optimal value: the pair is combined like "maximum with multiplicity". The cells of the first row and the first column have only one neighbour. The time is O(h * w) and the memory O(w) with one row of pairs.'
      ]
    },
    statement: ['A grid with `h` rows and `w` columns holds `coin(i, j)` coins in each cell. A walk goes from the top left cell to the bottom right cell, moving one cell right or down at a time, and collects the coins of all the visited cells. Print two numbers on one line: the largest number of coins that a walk can collect, and the number of walks that collect that many coins, modulo 1000000007.'],
    outputFormat: ['Print the largest number of coins and the number of best walks (modulo 1000000007), separated by a space.'],
    examples: [{ input: '3 3\n1 2 3\n4 5 6\n7 8 9\n', note: 'The best walk 1, 4, 7, 8, 9 collects 29 coins and no other walk collects that many: 29 and 1 walk.' }, { input: '2 2\n1 1\n1 1\n', note: 'Both walks give 3: the answer is 3 and 2 walks.' }],
    hints: ['Keep, for every cell, the best number of coins and the number of walks that reach it.', 'If one neighbour has a larger best value, copy its count; if they are equal, add the two counts.', 'Take the remainder modulo 1000000007 when adding.'],
    program: {
      io: ['h:int w:int', 'coin:int[h][w]'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        best = [0] * w
        ways = [0] * w
        for i in range(h):
            row = coin[i]
            for j in range(w):
                v = row[j]
                if i == 0 and j == 0:
                    best[0] = v
                    ways[0] = 1
                    continue
                up_b = best[j] if i > 0 else -1
                up_w = ways[j] if i > 0 else 0
                left_b = best[j - 1] if j > 0 else -1
                left_w = ways[j - 1] if j > 0 else 0
                if up_b > left_b:
                    best[j] = up_b + v
                    ways[j] = up_w
                elif left_b > up_b:
                    best[j] = left_b + v
                    ways[j] = left_w
                else:
                    best[j] = up_b + v
                    ways[j] = (up_w + left_w) % MOD
        print(best[w - 1], ways[w - 1])`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<long long> best(w, 0), ways(w, 0);
        for (int i = 0; i < h; i++) {
            for (int j = 0; j < w; j++) {
                long long v = coin[i][j];
                if (i == 0 && j == 0) { best[0] = v; ways[0] = 1; continue; }
                long long upB = i > 0 ? best[j] : -1, upW = i > 0 ? ways[j] : 0;
                long long leftB = j > 0 ? best[j - 1] : -1, leftW = j > 0 ? ways[j - 1] : 0;
                if (upB > leftB) { best[j] = upB + v; ways[j] = upW; }
                else if (leftB > upB) { best[j] = leftB + v; ways[j] = leftW; }
                else { best[j] = upB + v; ways[j] = (upW + leftW) % MOD; }
            }
        }
        cout << best[w - 1] << " " << ways[w - 1] << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        final long MOD = 1000000007L;
        long[] best = new long[colsCount];
        long[] ways = new long[colsCount];
        for (int i = 0; i < rowsCount; i++) {
            for (int j = 0; j < colsCount; j++) {
                long v = coin[i][j];
                if (i == 0 && j == 0) { best[0] = v; ways[0] = 1; continue; }
                long upB = i > 0 ? best[j] : -1, upW = i > 0 ? ways[j] : 0;
                long leftB = j > 0 ? best[j - 1] : -1, leftW = j > 0 ? ways[j - 1] : 0;
                if (upB > leftB) { best[j] = upB + v; ways[j] = upW; }
                else if (leftB > upB) { best[j] = leftB + v; ways[j] = leftW; }
                else { best[j] = upB + v; ways[j] = (upW + leftW) % MOD; }
            }
        }
        System.out.println(best[colsCount - 1] + " " + ways[colsCount - 1]);`
    },
    solution: { explanation: ['For every cell the pair (most coins on a walk ending there, number of walks with that many coins) is kept: the larger neighbour value wins and its count is copied, equal values add the counts; the coins of the cell are added to the best value. The pair of the last cell is the answer.'], complexity: 'Time O(h * w), space O(w).' },
    solve(input) {
      const { h, w, m } = parseMatrix(input); // three passes: the best value from the start, the best value to the end, and a count over the cells that lie on a best walk
      const fwd = Array.from({ length: h }, () => new Array(w).fill(0)), bwd = Array.from({ length: h }, () => new Array(w).fill(0));
      for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) fwd[i][j] = m[i][j] + Math.max(i ? fwd[i - 1][j] : 0, j ? fwd[i][j - 1] : 0);
      for (let i = h - 1; i >= 0; i--) for (let j = w - 1; j >= 0; j--) bwd[i][j] = m[i][j] + Math.max(i + 1 < h ? bwd[i + 1][j] : 0, j + 1 < w ? bwd[i][j + 1] : 0);
      const best = fwd[h - 1][w - 1]; const on = (i, j) => fwd[i][j] + bwd[i][j] - m[i][j] === best; const cnt = Array.from({ length: h }, () => new Array(w).fill(0)); cnt[0][0] = 1;
      for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) { if ((i || j) && on(i, j)) cnt[i][j] = ((i && on(i - 1, j) && fwd[i - 1][j] + m[i][j] === fwd[i][j] ? cnt[i - 1][j] : 0) + (j && on(i, j - 1) && fwd[i][j - 1] + m[i][j] === fwd[i][j] ? cnt[i][j - 1] : 0)) % MOD; } return `${best} ${cnt[h - 1][w - 1]}`;
    },
    tests() {
      const g = rng(2062); const out = ['3 3\n1 2 3\n4 5 6\n7 8 9\n', '2 2\n1 1\n1 1\n', '1 1\n5\n', '1 4\n1 2 3 4\n', '3 1\n1\n2\n3\n'];
      const brute = (input) => { const { h, w, m } = parseMatrix(input); let best = -1, count = 0; const go = (i, j, sum) => { sum += m[i][j]; if (i === h - 1 && j === w - 1) { if (sum > best) { best = sum; count = 1; } else if (sum === best) count++; return; } if (i + 1 < h) go(i + 1, j, sum); if (j + 1 < w) go(i, j + 1, sum); }; go(0, 0, 0); return `${best} ${count % MOD}`; };
      crossCheck(() => matrixText(randomMatrix(g, randInt(g, 1, 6), randInt(g, 1, 6), 0, 3)), (i) => this.solve(i), brute, 500);
      for (const [h, w, hi] of [[10, 10, 3], [50, 50, 5], [100, 100, 1], [200, 200, 2], [400, 400, 1000], [400, 400, 2], [400, 400, 1], [1, 400, 5], [400, 1, 5], [399, 397, 3]]) out.push(matrixText(randomMatrix(g, h, w, 0, hi)));
      out.push(matrixText(many(300, () => new Array(300).fill(0))), matrixText(many(300, () => new Array(300).fill(1000))), matrixText(many(300, (i) => many(300, (j) => (i === 0 || j === 299 ? 5 : 1)))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `h` and `w`: the number of rows and columns.', 'Each of the next `h` lines has `w` numbers.'],
    constraints: ['1 <= h, w <= 300', '0 <= each number <= 10^9'],
    slug: 'longest-rising-path-in-grid',
    title: 'The Longest Rising Path in a Table',
    tags: ['dp', 'grid', 'sorting', 'dag'],
    concept: {
      title: 'Handle the cells from the smallest value to the largest: a rising path always goes to a bigger cell',
      body: [
        'In a table of numbers you may start in any cell and step to a **neighbouring cell** (up, down, left or right) whose number is **strictly larger** than the current one. What is the largest number of cells on such a path? For the table `9 9 4 / 6 6 8 / 2 1 1` the path `1 2 6 9` has 4 cells. A path never returns to a cell (the values only grow), so there are no cycles and the answer is the longest path in a *directed acyclic graph*.',
        'Let `len(c)` be the longest rising path that **ends** in the cell `c`. It is `1 + the largest len(n)` over the neighbours `n` with a **smaller** value (or 1 if none). To fill the table in a correct order, take the cells **sorted by their value, from the smallest to the largest**: when a cell is processed, all the neighbours with a smaller value have already been processed. Cells with equal values do not depend on each other.',
        { code: 'order = sorted(range(h * w), key=lambda c: flat[c])         # cells by increasing value\nlength = [1] * (h * w)\nfor c in order:\n    x, y = divmod(c, w)\n    for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):\n        if 0 <= a < h and 0 <= b < w and flat[a * w + b] < flat[c]:\n            length[c] = max(length[c], length[a * w + b] + 1)\nprint(max(length))' },
        'A search that follows the paths with recursion would be 90 000 levels deep for a table 300 by 300 (the path can wind through every cell), which crashes in many languages; sorting turns the recursion into a plain loop. The time is O(h * w * log(h * w)) for the sort and O(h * w) for the table.'
      ]
    },
    statement: ['A table of `h` rows and `w` columns holds numbers. A path starts in any cell and each step moves to an adjacent cell (up, down, left or right) with a strictly larger number. Print the largest number of cells on such a path.'],
    outputFormat: ['Print the largest number of cells.'],
    examples: [{ input: '3 3\n9 9 4\n6 6 8\n2 1 1\n', note: 'The path 1, 2, 6, 9 has 4 cells.' }, { input: '1 3\n3 3 3\n', note: 'No step is possible: 1.' }],
    hints: ['Let len(c) be the longest rising path that ends in the cell c.', 'Process the cells from the smallest value to the largest, so smaller neighbours are ready.', 'Do not use recursion: the path can have 90 000 cells.'],
    program: {
      io: ['h:int w:int', 'a:int[h][w]'],
      fast: true,
      python: r`
        flat = [x for row in a for x in row]
        order = sorted(range(h * w), key=flat.__getitem__)
        length = [1] * (h * w)
        best = 1
        for c in order:
            x, y = divmod(c, w)
            v = flat[c]
            top = 1
            if x > 0 and flat[c - w] < v and length[c - w] + 1 > top:
                top = length[c - w] + 1
            if x + 1 < h and flat[c + w] < v and length[c + w] + 1 > top:
                top = length[c + w] + 1
            if y > 0 and flat[c - 1] < v and length[c - 1] + 1 > top:
                top = length[c - 1] + 1
            if y + 1 < w and flat[c + 1] < v and length[c + 1] + 1 > top:
                top = length[c + 1] + 1
            length[c] = top
            if top > best:
                best = top
        print(best)`,
      cpp: r`
        int cells = (int)(h * w);
        vector<int> order(cells);
        for (int c = 0; c < cells; c++) order[c] = c;
        sort(order.begin(), order.end(), [&](int p, int q) { return a[p / w][p % w] < a[q / w][q % w]; });
        vector<int> length(cells, 1);
        int best = 1;
        for (int c : order) {
            int x = c / (int)w, y = c % (int)w;
            long long v = a[x][y];
            int top = 1;
            if (x > 0 && a[x - 1][y] < v) top = max(top, length[c - w] + 1);
            if (x + 1 < h && a[x + 1][y] < v) top = max(top, length[c + w] + 1);
            if (y > 0 && a[x][y - 1] < v) top = max(top, length[c - 1] + 1);
            if (y + 1 < w && a[x][y + 1] < v) top = max(top, length[c + 1] + 1);
            length[c] = top;
            best = max(best, top);
        }
        cout << best << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        int cells = rowsCount * colsCount;
        long[] keys = new long[cells];
        for (int c = 0; c < cells; c++) keys[c] = a[c / colsCount][c % colsCount] * 100000L + c;
        Arrays.sort(keys);
        int[] length = new int[cells];
        Arrays.fill(length, 1);
        int best = 1;
        for (int t = 0; t < cells; t++) {
            int c = (int) (keys[t] % 100000L);
            int x = c / colsCount, y = c % colsCount;
            long v = a[x][y];
            int top = 1;
            if (x > 0 && a[x - 1][y] < v) top = Math.max(top, length[c - colsCount] + 1);
            if (x + 1 < rowsCount && a[x + 1][y] < v) top = Math.max(top, length[c + colsCount] + 1);
            if (y > 0 && a[x][y - 1] < v) top = Math.max(top, length[c - 1] + 1);
            if (y + 1 < colsCount && a[x][y + 1] < v) top = Math.max(top, length[c + 1] + 1);
            length[c] = top;
            best = Math.max(best, top);
        }
        System.out.println(best);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The cells are processed from the smallest value to the largest; len(c), the longest rising path ending in c, is 1 plus the largest len of a neighbour with a smaller value. The answer is the largest len, found without recursion.'], complexity: 'Time O(h * w * log(h * w)), space O(h * w).' },
    solve(input) {
      const { h, w, m } = parseMatrix(input); // peel the table: repeatedly remove the cells that have no larger neighbour; the number of rounds is the answer
      const out = Array.from({ length: h }, () => new Array(w).fill(0)); const inn = Array.from({ length: h }, () => new Array(w).fill(0)); // the number of larger neighbours of each cell
      for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) for (const [dx, dy] of DIRS) { const a = i + dx, b = j + dy; if (a >= 0 && a < h && b >= 0 && b < w && m[a][b] > m[i][j]) out[i][j]++; }
      let layer = []; for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) if (out[i][j] === 0) layer.push([i, j]); let rounds = 0; while (layer.length) { rounds++; const next = []; for (const [i, j] of layer) for (const [dx, dy] of DIRS) { const a = i + dx, b = j + dy; if (a >= 0 && a < h && b >= 0 && b < w && m[a][b] < m[i][j]) { out[a][b]--; if (out[a][b] === 0) next.push([a, b]); } } layer = next; } return String(rounds);
    },
    tests() {
      const g = rng(2063); const out = ['3 3\n9 9 4\n6 6 8\n2 1 1\n', '1 3\n3 3 3\n', '1 1\n5\n', '1 4\n1 2 3 4\n', '2 2\n1 2\n4 3\n'];
      const brute = (input) => { const { h, w, m } = parseMatrix(input); const memo = new Map(); const go = (i, j) => { const key = i * 100 + j; if (memo.has(key)) return memo.get(key); let best = 1; for (const [dx, dy] of DIRS) { const a = i + dx, b = j + dy; if (a >= 0 && a < h && b >= 0 && b < w && m[a][b] > m[i][j]) best = Math.max(best, 1 + go(a, b)); } memo.set(key, best); return best; }; let best = 0; for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) best = Math.max(best, go(i, j)); return String(best); };
      crossCheck(() => matrixText(randomMatrix(g, randInt(g, 1, 6), randInt(g, 1, 6), 0, 9)), (i) => this.solve(i), brute, 500);
      for (const [h, w, hi] of [[10, 10, 20], [50, 50, 1000], [100, 100, 1000000000], [200, 200, 1000000000], [300, 300, 1000000000], [300, 300, 3], [300, 300, 100000], [1, 300, 1000], [300, 1, 1000], [299, 297, 1000000000]]) out.push(matrixText(randomMatrix(g, h, w, 0, hi)));
      // a snake that rises through all the cells, and the same table turned upside down
      const snake = many(200, (i) => many(200, (j) => (i % 2 ? i * 200 + (199 - j) : i * 200 + j))); out.push(matrixText(snake), matrixText(snake.map((row) => row.map((x) => 40000 - x))));
      out.push(matrixText(many(300, (i) => many(300, (j) => i * 300 + j))), matrixText(many(300, (i) => many(300, (j) => (i + j) % 2))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `h`, `w` and `k`.', 'Each of the next `h` lines has `w` numbers.'],
    constraints: ['1 <= h, w <= 100', '1 <= k <= 50', '0 <= each number <= 100'],
    slug: 'paths-with-sum-divisible-by-k',
    title: 'Routes Whose Sum Is a Multiple of k',
    tags: ['dp', 'grid', 'modular', 'counting'],
    concept: {
      title: 'Add the remainder of the sum to the state',
      body: [
        'A grid of numbers is given. Walk from the top left cell to the bottom right cell, moving **right or down**, and add up the numbers of all the visited cells. How many routes have a sum that is **divisible by `k`**? For the grid `5 2 4 / 3 0 5 / 0 7 2` and `k = 3` there are 2 such routes. Print the count modulo 1 000 000 007.',
        'The sum itself can be big, but divisibility depends only on the **remainder** of the sum when divided by `k`. So the state is `(cell, remainder)`: `ways(i, j, r)` is the number of routes from the corner to `(i, j)` whose sum has the remainder `r`. A route to `(i, j)` comes from above or from the left; a route to a neighbour with the remainder `r` becomes a route to `(i, j)` with the remainder `(r + v) mod k`, where `v` is the number in the cell `(i, j)`.',
        { code: 'ways = [[None] * w for _ in range(h)]\nfor i in range(h):\n    for j in range(w):\n        cur = [0] * k\n        v = a[i][j] % k\n        if i == 0 and j == 0:\n            cur[v] = 1\n        else:\n            for r in range(k):\n                total = (up[r] if i > 0 else 0) + (left[r] if j > 0 else 0)\n                cur[(r + v) % k] = (cur[(r + v) % k] + total) % MOD\n        ways[i][j] = cur\nprint(ways[h - 1][w - 1][0])' },
        'The idea is general: when a condition depends on the sum only through its remainder, the remainder joins the state and the numbers themselves are never needed. There are `h * w * k` states with two transitions each: at most 500 000 states at the limits, so the time is O(h * w * k).'
      ]
    },
    statement: ['A grid of `h` rows and `w` columns holds non-negative integers. Count the routes from the top left cell to the bottom right cell, moving one cell right or down at a time, for which the sum of all the visited numbers is divisible by `k`. Print the count modulo 1000000007.'],
    outputFormat: ['Print the number of routes modulo 1000000007.'],
    examples: [{ input: '3 3 3\n5 2 4\n3 0 5\n0 7 2\n', note: 'Two routes have a sum divisible by 3: 2.' }, { input: '1 1 5\n10\n', note: 'The single cell 10 is divisible by 5: 1.' }],
    hints: ['Add the remainder of the sum modulo k to the state.', 'A route that has the remainder r before a cell with the value v has the remainder (r + v) mod k after it.', 'Combine the arrays of remainders of the cell above and the cell on the left.'],
    program: {
      io: ['h:int w:int k:int', 'a:int[h][w]'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        prev = None
        for i in range(h):
            row = [None] * w
            for j in range(w):
                cur = [0] * k
                v = a[i][j] % k
                if i == 0 and j == 0:
                    cur[v] = 1
                else:
                    up = prev[j] if i > 0 else None
                    left = row[j - 1] if j > 0 else None
                    for r in range(k):
                        total = (up[r] if up is not None else 0) + (left[r] if left is not None else 0)
                        if total:
                            idx = (r + v) % k
                            cur[idx] = (cur[idx] + total) % MOD
                row[j] = cur
            prev = row
        print(prev[w - 1][0])`,
      cpp: r`
        const long long MOD = 1000000007;
        int kk = (int)k;
        vector<vector<vector<long long>>> ways(h, vector<vector<long long>>(w, vector<long long>(kk, 0)));
        for (int i = 0; i < h; i++) {
            for (int j = 0; j < w; j++) {
                int v = (int)(a[i][j] % kk);
                if (i == 0 && j == 0) { ways[0][0][v] = 1; continue; }
                for (int r = 0; r < kk; r++) {
                    long long total = 0;
                    if (i > 0) total += ways[i - 1][j][r];
                    if (j > 0) total += ways[i][j - 1][r];
                    int idx = (r + v) % kk;
                    ways[i][j][idx] = (ways[i][j][idx] + total) % MOD;
                }
            }
        }
        cout << ways[h - 1][w - 1][0] << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int rowsCount = (int) h, colsCount = (int) w, kk = (int) k;
        long[][][] ways = new long[rowsCount][colsCount][kk];
        for (int i = 0; i < rowsCount; i++) {
            for (int j = 0; j < colsCount; j++) {
                int v = (int) (a[i][j] % kk);
                if (i == 0 && j == 0) { ways[0][0][v] = 1; continue; }
                for (int r = 0; r < kk; r++) {
                    long total = 0;
                    if (i > 0) total += ways[i - 1][j][r];
                    if (j > 0) total += ways[i][j - 1][r];
                    int idx = (r + v) % kk;
                    ways[i][j][idx] = (ways[i][j][idx] + total) % MOD;
                }
            }
        }
        System.out.println(ways[rowsCount - 1][colsCount - 1][0]);`
    },
    solution: { explanation: ['ways(i, j, r) is the number of routes to the cell (i, j) whose sum has the remainder r modulo k; a route to a neighbour with the remainder r gives a route to (i, j) with the remainder (r + v) mod k. The answer is ways(h - 1, w - 1, 0).'], complexity: 'Time O(h * w * k), space O(w * k) in Python and O(h * w * k) in the C++ and Java solutions.' },
    solve(input) {
      const rs = rows(input); const [h, w, k] = nums(rs[0]); const a = many(h, (i) => nums(rs[i + 1])); const memo = new Map(); // from the end: routes from (i, j) to the corner whose remaining sum (including the cell) has the remainder r
      const go = (i, j, r) => { const key = (i * 100 + j) * 64 + r; if (memo.has(key)) return memo.get(key); const rem = ((r - a[i][j]) % k + k) % k; let res; if (i === h - 1 && j === w - 1) res = rem === 0 ? 1 : 0; else { res = 0; if (i + 1 < h) res += go(i + 1, j, rem); if (j + 1 < w) res += go(i, j + 1, rem); res %= MOD; } memo.set(key, res); return res; };
      return String(go(0, 0, 0));
    },
    tests() {
      const g = rng(2064); const out = ['3 3 3\n5 2 4\n3 0 5\n0 7 2\n', '1 1 5\n10\n', '1 1 5\n7\n', '2 2 1\n1 2\n3 4\n'];
      const make = (h, w, k, hi) => matrixText(randomMatrix(g, h, w, 0, hi), ` ${k}`);
      const brute = (input) => { const rs = rows(input); const [h, w, k] = nums(rs[0]); const a = many(h, (i) => nums(rs[i + 1])); let count = 0; const go = (i, j, sum) => { sum += a[i][j]; if (i === h - 1 && j === w - 1) { if (sum % k === 0) count++; return; } if (i + 1 < h) go(i + 1, j, sum); if (j + 1 < w) go(i, j + 1, sum); }; go(0, 0, 0); return String(count % MOD); };
      crossCheck(() => make(randInt(g, 1, 5), randInt(g, 1, 5), randInt(g, 1, 6), 10), (i) => this.solve(i), brute, 500);
      for (const [h, w, k, hi] of [[10, 10, 3, 10], [30, 30, 7, 100], [50, 50, 13, 100], [100, 100, 50, 100], [100, 100, 49, 100], [100, 100, 1, 100], [100, 100, 2, 1], [100, 100, 50, 0], [1, 100, 7, 100], [100, 1, 7, 100], [99, 97, 31, 100]]) out.push(make(h, w, k, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with five numbers `h`, `w`, `moves`, `r` and `c`: the size of the grid, the largest number of moves, and the starting cell (row `r`, column `c`, counted from 0).'],
    constraints: ['1 <= h, w <= 50', '0 <= moves <= 100', '0 <= r < h', '0 <= c < w'],
    slug: 'out-of-boundary-paths',
    title: 'How Many Ways Can the Ball Roll Out of the Grid?',
    tags: ['dp', 'grid', 'counting', 'moves'],
    concept: {
      title: 'The state is (number of moves made, cell): count the ways to stand in each cell, and count every step that leaves the grid',
      body: [
        'A ball is in a cell of a grid. In every move it goes to one of the four neighbouring cells; a move to a cell **outside the grid** is allowed and ends the path (the ball is out). In how many ways can the ball get out of the grid in **at most `moves` moves**? Two ways are different if the sequences of moves are different. For a 2 by 2 grid, 2 moves and the start in the cell (0, 0) there are 6 ways. Print the answer modulo 1 000 000 007.',
        'Let `at[m][i][j]` be the number of ways to be inside the grid, in the cell `(i, j)`, after exactly `m` moves (the ball has not left yet). At the beginning `at[0][r][c] = 1`. From each cell with `at[m][i][j] > 0` try the four moves: a move to a cell **inside** adds `at[m][i][j]` to `at[m + 1]` of that cell, and a move to a cell **outside** adds `at[m][i][j]` to the answer (this path is finished, and it needs `m + 1 <= moves` moves). Doing this for `m = 0 .. moves - 1` counts all the paths that leave within `moves` moves.',
        { code: 'cur = [[0] * w for _ in range(h)]\ncur[r][c] = 1\nanswer = 0\nfor _ in range(moves):\n    nxt = [[0] * w for _ in range(h)]\n    for i in range(h):\n        for j in range(w):\n            if cur[i][j]:\n                for a, b in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):\n                    if 0 <= a < h and 0 <= b < w:\n                        nxt[a][b] = (nxt[a][b] + cur[i][j]) % MOD\n                    else:\n                        answer = (answer + cur[i][j]) % MOD\n    cur = nxt\nprint(answer)' },
        'Each round only needs the previous round, so two grids are enough. The time is O(moves * h * w * 4), about a million steps at the limits. Paths that leave the grid never come back, which is why a finished path is added to the answer once and removed from the table.'
      ]
    },
    statement: ['A grid has `h` rows and `w` columns and a ball stands in the cell `(r, c)`. In one move the ball goes to any of the four neighbouring cells, also to a cell outside the grid; once it is outside it stays outside. Print the number of different sequences of at most `moves` moves that end with the ball outside the grid, modulo 1000000007.'],
    outputFormat: ['Print the number of ways modulo 1000000007.'],
    examples: [{ input: '2 2 2 0 0\n', note: 'There are 6 ways to leave a 2 by 2 grid from the corner in at most 2 moves.' }, { input: '1 3 3 0 1\n', note: 'In a 1 by 3 grid the ball can go out in 12 ways within 3 moves.' }],
    hints: ['Let at[m][i][j] be the number of ways to stand in the cell (i, j) after m moves without having left the grid.', 'A move to a cell outside the grid adds at[m][i][j] to the answer; a move inside passes the count on.', 'Repeat for m from 0 to moves - 1 using two grids.'],
    program: {
      io: ['h:int w:int moves:int r:int c:int'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        cur = [[0] * w for _ in range(h)]
        cur[r][c] = 1
        answer = 0
        for _ in range(moves):
            nxt = [[0] * w for _ in range(h)]
            for i in range(h):
                for j in range(w):
                    v = cur[i][j]
                    if v:
                        for a, b in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                            if 0 <= a < h and 0 <= b < w:
                                nxt[a][b] = (nxt[a][b] + v) % MOD
                            else:
                                answer = (answer + v) % MOD
            cur = nxt
        print(answer)`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<vector<long long>> cur(h, vector<long long>(w, 0));
        cur[r][c] = 1;
        long long answer = 0;
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        for (long long m = 0; m < moves; m++) {
            vector<vector<long long>> next(h, vector<long long>(w, 0));
            for (int i = 0; i < h; i++) {
                for (int j = 0; j < w; j++) {
                    long long v = cur[i][j];
                    if (v == 0) continue;
                    for (int d = 0; d < 4; d++) {
                        int a = i + dx[d], b = j + dy[d];
                        if (a >= 0 && a < h && b >= 0 && b < w) next[a][b] = (next[a][b] + v) % MOD;
                        else answer = (answer + v) % MOD;
                    }
                }
            }
            cur = next;
        }
        cout << answer << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int rowsCount = (int) h, colsCount = (int) w;
        long[][] cur = new long[rowsCount][colsCount];
        long[][] next = new long[rowsCount][colsCount];
        cur[(int) r][(int) c] = 1;
        long answer = 0;
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        for (int m = 0; m < moves; m++) {
            for (int i = 0; i < rowsCount; i++) Arrays.fill(next[i], 0);
            for (int i = 0; i < rowsCount; i++) {
                for (int j = 0; j < colsCount; j++) {
                    long v = cur[i][j];
                    if (v == 0) continue;
                    for (int d = 0; d < 4; d++) {
                        int a = i + dx[d], b = j + dy[d];
                        if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount) next[a][b] = (next[a][b] + v) % MOD;
                        else answer = (answer + v) % MOD;
                    }
                }
            }
            long[][] swap = cur;
            cur = next;
            next = swap;
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['For each move the number of ways to stand in every cell without having left is kept; a move to a cell outside the grid adds the count to the answer, a move inside passes it on to the next round. After moves rounds the answer is complete.'], complexity: 'Time O(moves * h * w), space O(h * w).' },
    solve(input) {
      const [h, w, moves, r, c] = nums(input); const memo = new Map(); // from the cell: ways to leave within the remaining moves
      const go = (left, i, j) => { if (left === 0) return 0; const key = (left * 50 + i) * 50 + j; if (memo.has(key)) return memo.get(key); let res = 0; for (const [dx, dy] of DIRS) { const a = i + dx, b = j + dy; res += a < 0 || a >= h || b < 0 || b >= w ? 1 : go(left - 1, a, b); } res %= MOD; memo.set(key, res); return res; };
      return String(go(moves, r, c));
    },
    tests() {
      const g = rng(2065); const out = ['2 2 2 0 0\n', '1 3 3 0 1\n', '1 1 0 0 0\n', '1 1 1 0 0\n', '3 3 0 1 1\n'];
      const brute = (input) => { const [h, w, moves, r, c] = nums(input); let count = 0; const go = (left, i, j) => { if (left === 0) return; for (const [dx, dy] of DIRS) { const a = i + dx, b = j + dy; if (a < 0 || a >= h || b < 0 || b >= w) count++; else go(left - 1, a, b); } }; go(moves, r, c); return String(count % MOD); };
      crossCheck(() => { const h = randInt(g, 1, 4), w = randInt(g, 1, 4); return `${h} ${w} ${randInt(g, 0, 6)} ${randInt(g, 0, h - 1)} ${randInt(g, 0, w - 1)}\n`; }, (i) => this.solve(i), brute, 400);
      for (const [h, w, m, r, c] of [[5, 5, 10, 2, 2], [10, 10, 30, 0, 0], [20, 20, 50, 10, 10], [50, 50, 100, 25, 25], [50, 50, 100, 0, 0], [50, 50, 100, 49, 49], [1, 50, 100, 0, 25], [50, 1, 100, 25, 0], [50, 50, 0, 3, 3], [50, 50, 99, 7, 41], [1, 1, 100, 0, 0], [2, 2, 100, 1, 1]]) out.push(`${h} ${w} ${m} ${r} ${c}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `m`: the size of the square grid and the number of blocked cells.', 'Each of the next `m` lines has two numbers `x` and `y`: a blocked cell (row `x`, column `y`, counted from 0).'],
    constraints: ['1 <= n <= 400', '1 <= m <= min(n * n, 20000)', 'The blocked cells are all different.'],
    slug: 'largest-plus-sign',
    title: 'The Biggest Plus Sign That Fits Between the Blocked Cells',
    tags: ['dp', 'grid', 'four-directions'],
    concept: {
      title: 'For every cell, count the free cells in a row in each of the four directions, and take the smallest',
      body: [
        'An `n` by `n` grid has some **blocked cells**, and all the other cells are free. A *plus sign of order `k`* has a free centre and four arms (up, down, left, right), each with `k - 1` free cells next to the centre (so it has `4(k - 1) + 1` cells, all free). Find the largest order of a plus sign in the grid, or 0 if every cell is blocked. For a free 5 by 5 grid with only the centre blocked, the answer is 2.',
        'For a free cell, the longest plus sign centred there is limited by the **shortest of its four arms**. So compute, for each cell, how many free cells there are in a row **ending at it** (counting it) going from the left, from the right, from the top and from the bottom. The order of the plus sign centred at the cell is the smallest of these four numbers. Each of the four runs is a tiny DP: `run(j) = run(j - 1) + 1` for a free cell and 0 for a blocked one.',
        { code: 'best = [[0] * n for _ in range(n)]            # best[i][j]: the smallest of the four runs so far\nfor i in range(n):\n    run = 0\n    for j in range(n):                         # from the left\n        run = run + 1 if free[i][j] else 0\n        best[i][j] = run\n    run = 0\n    for j in range(n - 1, -1, -1):             # from the right\n        run = run + 1 if free[i][j] else 0\n        best[i][j] = min(best[i][j], run)\n# the same for the columns from the top and from the bottom, then the answer is the largest best[i][j]' },
        'Four passes over the grid, each of O(n^2) steps, give the answer in O(n^2) time and memory. Looking at the grid from all four sides, one side after another, and keeping a running minimum is a method that you can use for many questions about "the longest line through a cell".'
      ]
    },
    statement: ['An `n` by `n` grid has `m` blocked cells; the other cells are free. A plus sign of order `k` is a free centre cell together with `k - 1` free cells in each of the four directions from it (all inside the grid). Print the largest order of a plus sign that fits, or 0 if there is no free cell.'],
    outputFormat: ['Print the largest order.'],
    examples: [{ input: '5 1\n4 2\n', note: 'A plus sign of order 2 fits: its centre has free neighbours in all four directions.' }, { input: '1 1\n0 0\n', note: 'The only cell is blocked: 0.' }],
    hints: ['For each free cell count the free cells in a row going from the left, from the right, from the top and from the bottom (including the cell).', 'The order of the plus sign centred at the cell is the smallest of the four numbers.', 'Take the largest order over all the cells.'],
    program: {
      io: ['n:int m:int', 'mines:int[m][2]'],
      fast: true,
      python: r`
        free = [[True] * n for _ in range(n)]
        for x, y in mines:
            free[x][y] = False
        best = [[0] * n for _ in range(n)]
        for i in range(n):
            run = 0
            for j in range(n):
                run = run + 1 if free[i][j] else 0
                best[i][j] = run
            run = 0
            for j in range(n - 1, -1, -1):
                run = run + 1 if free[i][j] else 0
                if run < best[i][j]:
                    best[i][j] = run
        answer = 0
        for j in range(n):
            run = 0
            for i in range(n):
                run = run + 1 if free[i][j] else 0
                if run < best[i][j]:
                    best[i][j] = run
            run = 0
            for i in range(n - 1, -1, -1):
                run = run + 1 if free[i][j] else 0
                if run < best[i][j]:
                    best[i][j] = run
                if best[i][j] > answer:
                    answer = best[i][j]
        print(answer)`,
      cpp: r`
        vector<vector<char>> freeCell(n, vector<char>(n, 1));
        for (const vector<long long>& p : mines) freeCell[p[0]][p[1]] = 0;
        vector<vector<int>> best(n, vector<int>(n, 0));
        for (int i = 0; i < n; i++) {
            int run = 0;
            for (int j = 0; j < n; j++) {
                run = freeCell[i][j] ? run + 1 : 0;
                best[i][j] = run;
            }
            run = 0;
            for (int j = (int)n - 1; j >= 0; j--) {
                run = freeCell[i][j] ? run + 1 : 0;
                best[i][j] = min(best[i][j], run);
            }
        }
        int answer = 0;
        for (int j = 0; j < n; j++) {
            int run = 0;
            for (int i = 0; i < n; i++) {
                run = freeCell[i][j] ? run + 1 : 0;
                best[i][j] = min(best[i][j], run);
            }
            run = 0;
            for (int i = (int)n - 1; i >= 0; i--) {
                run = freeCell[i][j] ? run + 1 : 0;
                best[i][j] = min(best[i][j], run);
                answer = max(answer, best[i][j]);
            }
        }
        cout << answer << "\n";`,
      java: r`
        int size = (int) n;
        boolean[][] freeCell = new boolean[size][size];
        for (int i = 0; i < size; i++) Arrays.fill(freeCell[i], true);
        for (int k = 0; k < m; k++) freeCell[(int) mines[k][0]][(int) mines[k][1]] = false;
        int[][] best = new int[size][size];
        for (int i = 0; i < size; i++) {
            int run = 0;
            for (int j = 0; j < size; j++) {
                run = freeCell[i][j] ? run + 1 : 0;
                best[i][j] = run;
            }
            run = 0;
            for (int j = size - 1; j >= 0; j--) {
                run = freeCell[i][j] ? run + 1 : 0;
                best[i][j] = Math.min(best[i][j], run);
            }
        }
        int answer = 0;
        for (int j = 0; j < size; j++) {
            int run = 0;
            for (int i = 0; i < size; i++) {
                run = freeCell[i][j] ? run + 1 : 0;
                best[i][j] = Math.min(best[i][j], run);
            }
            run = 0;
            for (int i = size - 1; i >= 0; i--) {
                run = freeCell[i][j] ? run + 1 : 0;
                best[i][j] = Math.min(best[i][j], run);
                answer = Math.max(answer, best[i][j]);
            }
        }
        System.out.println(answer);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['For every cell the number of consecutive free cells ending at it is computed from the left, from the right, from the top and from the bottom; the order of the plus sign centred there is the smallest of the four, and the answer is the largest order over all cells.'], complexity: 'Time O(n^2), space O(n^2).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const blocked = new Set(); for (let i = 1; i <= m; i++) { const [x, y] = nums(rs[i]); blocked.add(x * n + y); }
      const arm = (x, y, dx, dy) => { let len = 0; let a = x, b = y; while (a >= 0 && a < n && b >= 0 && b < n && !blocked.has(a * n + b)) { len++; a += dx; b += dy; } return len; }; // measure the four arms of every cell directly (fast enough up to a few thousand steps per cell for the small tests; large tests use the four tables)
      if (n > 60) { const L = Array.from({ length: n }, () => new Array(n).fill(0)), R = L.map((row) => row.slice()), U = L.map((row) => row.slice()), D = L.map((row) => row.slice()); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { if (!blocked.has(i * n + j)) { L[i][j] = (j ? L[i][j - 1] : 0) + 1; U[i][j] = (i ? U[i - 1][j] : 0) + 1; } } for (let i = n - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) { if (!blocked.has(i * n + j)) { R[i][j] = (j + 1 < n ? R[i][j + 1] : 0) + 1; D[i][j] = (i + 1 < n ? D[i + 1][j] : 0) + 1; } } let best = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) best = Math.max(best, Math.min(L[i][j], R[i][j], U[i][j], D[i][j])); return String(best); }
      let best = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (!blocked.has(i * n + j)) best = Math.max(best, Math.min(arm(i, j, 0, 1), arm(i, j, 0, -1), arm(i, j, 1, 0), arm(i, j, -1, 0))); return String(best);
    },
    tests() {
      const g = rng(2066); const out = ['5 1\n4 2\n', '1 1\n0 0\n', '3 1\n1 1\n', '2 1\n0 0\n'];
      const make = (n, m) => { const cells = new Set(); while (cells.size < Math.min(m, n * n)) cells.add(randInt(g, 0, n * n - 1)); const list = [...cells].map((c) => `${Math.floor(c / n)} ${c % n}`); return `${n} ${list.length}\n${list.join('\n')}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); const blocked = new Set(); for (let i = 1; i <= m; i++) { const [x, y] = nums(rs[i]); blocked.add(x * n + y); } let best = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { if (blocked.has(i * n + j)) continue; let k = 1; for (;;) { const t = k; const ok = [[t, 0], [-t, 0], [0, t], [0, -t]].every(([dx, dy]) => { const a = i + dx, b = j + dy; return a >= 0 && a < n && b >= 0 && b < n && !blocked.has(a * n + b); }); if (!ok) break; k++; } best = Math.max(best, k); } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 8); return make(n, randInt(g, 1, Math.max(1, Math.floor(n * n / 3)))); }, (i) => this.solve(i), brute, 500);
      for (const [n, m] of [[10, 5], [30, 40], [60, 100], [100, 300], [200, 2000], [400, 20000], [400, 1000], [400, 1], [400, 100], [399, 5000], [2, 3], [3, 8]]) out.push(make(n, m));
      out.push(`400 1\n200 200\n`, `400 400\n${many(400, (i) => `${i} ${i}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `h`, `w` and `k`.', 'Each of the next `h` lines has a row of `w` characters: `.` is a free cell and `#` is a wall.'],
    constraints: ['1 <= h, w <= 60', '0 <= k <= 30', 'The top left and the bottom right cells are free.'],
    slug: 'routes-with-few-turns',
    title: 'Count the Routes That Turn at Most k Times',
    tags: ['dp', 'grid', 'counting', 'direction-state'],
    concept: {
      title: 'Remember the last direction and the number of turns used so far',
      body: [
        'A robot walks from the top left cell to the bottom right cell of a grid with walls, moving **right or down**. A *turn* is a move whose direction differs from the previous move (the first move is never a turn). How many routes have **at most `k` turns**? For a free 3 by 3 grid and `k = 1` there are 2 routes (right, right, down, down and down, down, right, right); with `k = 2` there are 4 (all 6 routes have at most 3 turns). Print the count modulo 1 000 000 007.',
        'The count of routes to a cell is not enough, because a new move is a turn or not depending on **how the robot arrived**. So the state is `(cell, last direction, turns used)`. Let `f(i, j, d, t)` be the number of routes to the cell `(i, j)` whose last move had the direction `d` (0 = right, 1 = down) and that used exactly `t` turns. A route that arrives in `(i, j)` moving right came from `(i, j - 1)`: if its last move was also right, the turns are the same; if its last move was down, this move is a turn, so it had `t - 1` turns. Moving down is symmetric. The cells next to the start get one route without any turn.',
        { code: 'for i in range(h):\n    for j in range(w):\n        if wall[i][j]: continue\n        for t in range(k + 1):\n            # arrive moving right, from the left cell\n            f[i][j][0][t] = f[i][j-1][0][t] + (f[i][j-1][1][t-1] if t >= 1 else 0)\n            # arrive moving down, from the cell above\n            f[i][j][1][t] = f[i-1][j][1][t] + (f[i-1][j][0][t-1] if t >= 1 else 0)\n# (the first move out of the start is added by hand: it has no turn)\nanswer = sum(f[h-1][w-1][d][t] for d in (0, 1) for t in range(k + 1))' },
        'Adding "what we need to remember about the past" to the state is the key: here the last direction (2 values) and the number of turns (up to `k + 1` values), so there are `h * w * 2 * (k + 1)` states, at most 223 000. Each state takes O(1) time. The same method handles limits on the number of turns, of changes, of walls broken, or of any small counter.'
      ]
    },
    statement: ['A grid has `h` rows and `w` columns; `.` is a free cell and `#` is a wall. A robot starts in the top left cell and moves one cell right or down at a time, never entering a wall, until it reaches the bottom right cell. A turn is a move whose direction differs from the previous move. Print the number of routes with at most `k` turns, modulo 1000000007. (If the grid is a single cell, there is one route with no turns.)'],
    outputFormat: ['Print the number of routes modulo 1000000007.'],
    examples: [{ input: '3 3 1\n...\n...\n...\n', note: 'Only the routes right-right-down-down and down-down-right-right have at most one turn: 2.' }, { input: '2 2 0\n..\n..\n', note: 'Every route in a 2 by 2 grid has one turn: 0.' }],
    hints: ['The state is the cell, the direction of the last move and the number of turns used.', 'Arriving in the same direction as the previous move keeps the turns; arriving in the other direction adds one turn.', 'The first move from the start is not a turn.'],
    program: {
      io: ['h:int w:int k:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        T = k + 1
        f = [[[[0] * T for _ in range(2)] for _ in range(w)] for _ in range(h)]
        if h == 1 and w == 1:
            print(1)
        else:
            for i in range(h):
                for j in range(w):
                    if grid[i][j] == "#" or (i == 0 and j == 0):
                        continue
                    cell = f[i][j]
                    if j > 0 and grid[i][j - 1] != "#":
                        if i == 0 and j == 1:
                            cell[0][0] += 1
                        else:
                            left = f[i][j - 1]
                            for t in range(T):
                                v = left[0][t] + (left[1][t - 1] if t >= 1 else 0)
                                cell[0][t] = (cell[0][t] + v) % MOD
                    if i > 0 and grid[i - 1][j] != "#":
                        if i == 1 and j == 0:
                            cell[1][0] += 1
                        else:
                            up = f[i - 1][j]
                            for t in range(T):
                                v = up[1][t] + (up[0][t - 1] if t >= 1 else 0)
                                cell[1][t] = (cell[1][t] + v) % MOD
            end = f[h - 1][w - 1]
            print((sum(end[0]) + sum(end[1])) % MOD)`,
      cpp: r`
        const long long MOD = 1000000007;
        int T = (int)k + 1;
        vector<vector<array<vector<long long>, 2>>> f(h, vector<array<vector<long long>, 2>>(w));
        for (int i = 0; i < h; i++) for (int j = 0; j < w; j++) { f[i][j][0].assign(T, 0); f[i][j][1].assign(T, 0); }
        if (h == 1 && w == 1) {
            cout << 1 << "\n";
        } else {
            for (int i = 0; i < h; i++) {
                for (int j = 0; j < w; j++) {
                    if (grid[i][j] == '#' || (i == 0 && j == 0)) continue;
                    if (j > 0 && grid[i][j - 1] != '#') {
                        if (i == 0 && j == 1) {
                            f[i][j][0][0] += 1;
                        } else {
                            for (int t = 0; t < T; t++) {
                                long long v = f[i][j - 1][0][t] + (t >= 1 ? f[i][j - 1][1][t - 1] : 0);
                                f[i][j][0][t] = (f[i][j][0][t] + v) % MOD;
                            }
                        }
                    }
                    if (i > 0 && grid[i - 1][j] != '#') {
                        if (i == 1 && j == 0) {
                            f[i][j][1][0] += 1;
                        } else {
                            for (int t = 0; t < T; t++) {
                                long long v = f[i - 1][j][1][t] + (t >= 1 ? f[i - 1][j][0][t - 1] : 0);
                                f[i][j][1][t] = (f[i][j][1][t] + v) % MOD;
                            }
                        }
                    }
                }
            }
            long long total = 0;
            for (int t = 0; t < T; t++) total += f[h - 1][w - 1][0][t] + f[h - 1][w - 1][1][t];
            cout << total % MOD << "\n";
        }`,
      java: r`
        final long MOD = 1000000007L;
        int rowsCount = (int) h, colsCount = (int) w, T = (int) k + 1;
        if (rowsCount == 1 && colsCount == 1) {
            System.out.println(1);
        } else {
            long[][][][] f = new long[rowsCount][colsCount][2][T];
            for (int i = 0; i < rowsCount; i++) {
                for (int j = 0; j < colsCount; j++) {
                    if (grid[i].charAt(j) == '#' || (i == 0 && j == 0)) continue;
                    if (j > 0 && grid[i].charAt(j - 1) != '#') {
                        if (i == 0 && j == 1) {
                            f[i][j][0][0] += 1;
                        } else {
                            for (int t = 0; t < T; t++) {
                                long v = f[i][j - 1][0][t] + (t >= 1 ? f[i][j - 1][1][t - 1] : 0);
                                f[i][j][0][t] = (f[i][j][0][t] + v) % MOD;
                            }
                        }
                    }
                    if (i > 0 && grid[i - 1].charAt(j) != '#') {
                        if (i == 1 && j == 0) {
                            f[i][j][1][0] += 1;
                        } else {
                            for (int t = 0; t < T; t++) {
                                long v = f[i - 1][j][1][t] + (t >= 1 ? f[i - 1][j][0][t - 1] : 0);
                                f[i][j][1][t] = (f[i][j][1][t] + v) % MOD;
                            }
                        }
                    }
                }
            }
            long total = 0;
            for (int t = 0; t < T; t++) total += f[rowsCount - 1][colsCount - 1][0][t] + f[rowsCount - 1][colsCount - 1][1][t];
            System.out.println(total % MOD);
        }`,
      includes: ['<array>']
    },
    solution: { explanation: ['f(i, j, d, t) is the number of routes to the cell (i, j) whose last move had the direction d and that used exactly t turns; arriving in the direction of the previous move keeps t, arriving in the other direction needs t - 1 turns before. The answer is the sum of the values of the last cell for t up to k.'], complexity: 'Time O(h * w * k), space O(h * w * k).' },
    solve(input) {
      const rs = rows(input); const [h, w, k] = nums(rs[0]); const grid = rs.slice(1, 1 + h); if (h === 1 && w === 1) return '1';
      const memo = new Map(); // from the end: routes from (i, j) with the last direction d and t turns still allowed
      const go = (i, j, d, left) => { if (i >= h || j >= w || grid[i][j] === '#') return 0; if (i === h - 1 && j === w - 1) return 1; const key = ((i * 64 + j) * 3 + d) * 64 + left; if (memo.has(key)) return memo.get(key); let res = 0; for (const nd of [0, 1]) { const cost = d === 2 || d === nd ? 0 : 1; if (cost <= left) res += go(i + nd, j + 1 - nd, nd, left - cost); } res %= MOD; memo.set(key, res); return res; };
      return String(go(0, 0, 2, k));
    },
    tests() {
      const g = rng(2067); const out = ['3 3 1\n...\n...\n...\n', '2 2 0\n..\n..\n', '1 1 0\n.\n', '1 5 0\n.....\n', '3 1 0\n.\n.\n.\n'];
      const make = (h, w, k, p) => `${h} ${w} ${k}\n${many(h, (i) => many(w, (j) => ((i === 0 && j === 0) || (i === h - 1 && j === w - 1) ? '.' : g() < p ? '#' : '.')).join('')).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const [h, w, k] = nums(rs[0]); const grid = rs.slice(1, 1 + h); let count = 0; const go = (i, j, d, turns) => { if (i >= h || j >= w || grid[i][j] === '#') return; if (i === h - 1 && j === w - 1) { if (turns <= k) count++; return; } go(i, j + 1, 0, turns + (d === 1 ? 1 : 0)); go(i + 1, j, 1, turns + (d === 0 ? 1 : 0)); }; go(0, 0, -1, 0); return String(count % MOD); };
      crossCheck(() => make(randInt(g, 1, 6), randInt(g, 1, 6), randInt(g, 0, 8), 0.15), (i) => this.solve(i), brute, 500);
      for (const [h, w, k, p] of [[10, 10, 3, 0.1], [30, 30, 10, 0.05], [60, 60, 30, 0.02], [60, 60, 30, 0], [60, 60, 1, 0], [60, 60, 0, 0], [60, 60, 30, 0.1], [1, 60, 5, 0], [60, 1, 5, 0], [59, 57, 20, 0.03], [60, 60, 3, 0.01]]) out.push(make(h, w, k, p));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `h` and `w`: the number of rows and columns.', 'Each of the next `h` lines has `w` numbers: the cherries in each cell.'],
    constraints: ['2 <= h <= 60', '2 <= w <= 40', '0 <= each number <= 100'],
    slug: 'two-robots-collect-cherries',
    title: 'Two Robots Collect the Cherries',
    tags: ['dp', 'grid', 'two-agents', 'states'],
    concept: {
      title: 'Move both robots row by row and make the state their two columns',
      body: [
        'A field is a grid of cells holding cherries. Two robots start in the top row: the first in the top **left** corner, the second in the top **right** corner. Each robot moves down one row at a time, and in every move it also may shift one column to the left, stay, or shift one column to the right (staying inside the grid). Each visited cell gives its cherries to the robot; if both robots visit the same cell, the cherries are counted **once**. They stop at the bottom row. What is the largest total number of cherries?',
        'Both robots are always in the **same row**, because they move down together. So the state is just `(row, column of the first robot, column of the second robot)`. Let `best(row, a, b)` be the largest number of cherries collected up to this row when the robots stand in the columns `a` and `b`. The cherries of this row are `grid[row][a]`, plus `grid[row][b]` if `b != a`. Before that, in the previous row, the robots were at `a + da` and `b + db` with `da` and `db` in `{-1, 0, 1}`: **`best(row, a, b) = cherries + max over the nine pairs (da, db) of best(row - 1, a + da, b + db)`**.',
        { code: 'cur = {(0, w - 1): grid[0][0] + grid[0][w - 1]}      # the starting state of the first row\nfor row in range(1, h):\n    nxt = {}\n    for (a, b), v in cur.items():\n        for na in (a - 1, a, a + 1):\n            for nb in (b - 1, b, b + 1):\n                if 0 <= na < w and 0 <= nb < w:\n                    gain = grid[row][na] + (grid[row][nb] if nb != na else 0)\n                    if nxt.get((na, nb), -1) < v + gain: nxt[(na, nb)] = v + gain\n    cur = nxt\nprint(max(cur.values()))' },
        'Planning two robots one after the other would be wrong (the first robot could take cherries that the second needed more). Moving them **together** and letting the state hold both positions solves the conflict. There are `h * w * w` states with nine transitions each: about 800 000 steps at the limits.'
      ]
    },
    statement: ['A grid has `h` rows and `w` columns with cherries in the cells. Robot 1 starts in the top left cell and robot 2 in the top right cell. In each step both robots move down one row and each may also move one column to the left or to the right or stay (staying inside the grid). A robot takes all the cherries of every cell it enters (including the start); if both robots are in the same cell, the cherries are taken once. Print the largest total number of cherries both robots can take when they reach the bottom row.'],
    outputFormat: ['Print the largest total number of cherries.'],
    examples: [{ input: '4 3\n3 1 1\n2 5 1\n1 5 5\n2 1 1\n', note: 'The robots collect 24 cherries in total: 3 + 2 + 5 + 2 = 12 and 1 + 5 + 5 + 1 = 12.' }, { input: '2 2\n1 1\n1 1\n', note: 'Both robots take the two cells of each row: 4.' }],
    hints: ['Both robots are always in the same row, so the state is the row and the two columns.', 'The cherries of a cell are counted once when both robots stand there.', 'Try the 9 combinations of column shifts from the previous row.'],
    program: {
      io: ['h:int w:int', 'grid:int[h][w]'],
      fast: true,
      python: r`
        NEG = -1
        cur = [[NEG] * w for _ in range(w)]
        cur[0][w - 1] = grid[0][0] + grid[0][w - 1]
        for row in range(1, h):
            nxt = [[NEG] * w for _ in range(w)]
            g = grid[row]
            for a in range(w):
                for b in range(w):
                    top = NEG
                    for pa in (a - 1, a, a + 1):
                        if 0 <= pa < w:
                            line = cur[pa]
                            for pb in (b - 1, b, b + 1):
                                if 0 <= pb < w and line[pb] > top:
                                    top = line[pb]
                    if top >= 0:
                        nxt[a][b] = top + g[a] + (g[b] if a != b else 0)
            cur = nxt
        print(max(max(line) for line in cur))`,
      cpp: r`
        vector<vector<long long>> cur(w, vector<long long>(w, -1));
        cur[0][w - 1] = grid[0][0] + grid[0][w - 1];
        for (int row = 1; row < h; row++) {
            vector<vector<long long>> next(w, vector<long long>(w, -1));
            for (int a = 0; a < w; a++) {
                for (int b = 0; b < w; b++) {
                    long long top = -1;
                    for (int pa = a - 1; pa <= a + 1; pa++) {
                        if (pa < 0 || pa >= w) continue;
                        for (int pb = b - 1; pb <= b + 1; pb++) {
                            if (pb < 0 || pb >= w) continue;
                            top = max(top, cur[pa][pb]);
                        }
                    }
                    if (top >= 0) next[a][b] = top + grid[row][a] + (a != b ? grid[row][b] : 0);
                }
            }
            cur = next;
        }
        long long answer = 0;
        for (int a = 0; a < w; a++) for (int b = 0; b < w; b++) answer = max(answer, cur[a][b]);
        cout << answer << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        long[][] cur = new long[colsCount][colsCount];
        long[][] next = new long[colsCount][colsCount];
        for (int a = 0; a < colsCount; a++) Arrays.fill(cur[a], -1);
        cur[0][colsCount - 1] = grid[0][0] + grid[0][colsCount - 1];
        for (int row = 1; row < rowsCount; row++) {
            for (int a = 0; a < colsCount; a++) {
                for (int b = 0; b < colsCount; b++) {
                    long top = -1;
                    for (int pa = a - 1; pa <= a + 1; pa++) {
                        if (pa < 0 || pa >= colsCount) continue;
                        for (int pb = b - 1; pb <= b + 1; pb++) {
                            if (pb < 0 || pb >= colsCount) continue;
                            top = Math.max(top, cur[pa][pb]);
                        }
                    }
                    next[a][b] = top >= 0 ? top + grid[row][a] + (a != b ? grid[row][b] : 0) : -1;
                }
            }
            long[][] swap = cur;
            cur = next;
            next = swap;
        }
        long answer = 0;
        for (int a = 0; a < colsCount; a++) for (int b = 0; b < colsCount; b++) answer = Math.max(answer, cur[a][b]);
        System.out.println(answer);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The robots always stand in the same row, so best(row, a, b), the most cherries collected when they stand in the columns a and b, is the cherries of the two cells (counted once if a = b) plus the best of the nine states of the previous row with columns a + da and b + db. The answer is the largest value in the last row.'], complexity: 'Time O(h * w^2 * 9), space O(w^2).' },
    solve(input) {
      const { h, w, m } = parseMatrix(input); const memo = new Map(); // top-down: the most cherries the robots can still collect from the row on
      const go = (row, a, b) => { if (row === h) return 0; const key = (row * 64 + a) * 64 + b; if (memo.has(key)) return memo.get(key); const gain = m[row][a] + (a !== b ? m[row][b] : 0); let best = 0; for (const da of [-1, 0, 1]) for (const db of [-1, 0, 1]) { const na = a + da, nb = b + db; if (row + 1 < h && na >= 0 && na < w && nb >= 0 && nb < w) best = Math.max(best, go(row + 1, na, nb)); } memo.set(key, gain + best); return gain + best; };
      return String(go(0, 0, w - 1));
    },
    tests() {
      const g = rng(2068); const out = ['4 3\n3 1 1\n2 5 1\n1 5 5\n2 1 1\n', '2 2\n1 1\n1 1\n', '2 2\n0 0\n0 0\n', '3 2\n5 5\n5 5\n5 5\n'];
      const brute = (input) => { const { h, w, m } = parseMatrix(input); let best = 0; const go = (row, a, b, sum) => { sum += m[row][a] + (a !== b ? m[row][b] : 0); if (row === h - 1) { best = Math.max(best, sum); return; } for (const da of [-1, 0, 1]) for (const db of [-1, 0, 1]) { const na = a + da, nb = b + db; if (na >= 0 && na < w && nb >= 0 && nb < w) go(row + 1, na, nb, sum); } }; go(0, 0, w - 1, 0); return String(best); };
      crossCheck(() => matrixText(randomMatrix(g, randInt(g, 2, 5), randInt(g, 2, 4), 0, 9)), (i) => this.solve(i), brute, 300);
      for (const [h, w, hi] of [[5, 5, 10], [10, 10, 100], [20, 20, 100], [40, 30, 100], [60, 40, 100], [60, 40, 1], [60, 40, 0], [60, 2, 100], [2, 40, 100], [59, 39, 100]]) out.push(matrixText(randomMatrix(g, h, w, 0, hi)));
      out.push(matrixText(many(60, () => new Array(40).fill(100))), matrixText(many(60, (i) => many(40, (j) => (j === 20 ? 100 : 1)))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `h` and `w`: the number of rows and columns.', 'Each of the next `h` lines has `w` numbers.'],
    constraints: ['1 <= h <= 400', '2 <= w <= 400', '-1000 <= each number <= 1000'],
    slug: 'falling-path-different-columns',
    title: 'A Falling Path That Never Repeats a Column',
    tags: ['dp', 'grid', 'two-minimums', 'optimisation'],
    concept: {
      title: 'To avoid one column, you only need the two smallest values of the previous row',
      body: [
        'Choose **one number from every row** of a table so that numbers from two **neighbouring rows are never in the same column**. What is the smallest possible total? For the table `1 2 3 / 4 5 6 / 7 8 9` the best choice is 1 + 5 + 7 = 13. (Unlike the earlier falling path, the next column can be any column except the previous one, not only the nearest.)',
        'Let `best(i, j)` be the smallest total of a valid choice in the rows `0 .. i` that picks the cell `(i, j)`. It is `value(i, j)` plus the smallest `best(i - 1, c)` over all columns `c != j`. Searching the whole previous row costs O(w) per cell, O(h * w^2) in total. But the smallest value **excluding** one column is always either the overall smallest value of the row (if it is not in the excluded column) or the **second smallest** (if it is). So for each row remember only its two smallest values and where the smallest one is.',
        { code: 'prev = row0[:]\nfor row in rows[1:]:\n    m1 = min(prev); i1 = prev.index(m1)               # the smallest value and its column\n    m2 = min(v for c, v in enumerate(prev) if c != i1)   # the smallest value in the other columns\n    prev = [row[j] + (m2 if j == i1 else m1) for j in range(w)]\nprint(min(prev))' },
        'This turns O(h * w^2) into O(h * w): 160 000 steps for a table of 400 by 400, against 64 million for the plain version. Whenever a DP asks for "the best of all except one", keep the best two (with the index of the best). A table with a single column and more than one row has no valid choice, which the limits exclude (`w >= 2`).'
      ]
    },
    statement: ['A table with `h` rows and `w` columns is given. Choose exactly one number in every row so that the numbers chosen in two consecutive rows are in different columns. Print the smallest possible sum of the chosen numbers.'],
    outputFormat: ['Print the smallest sum.'],
    examples: [{ input: '3 3\n1 2 3\n4 5 6\n7 8 9\n', note: '1 + 5 + 7 = 13.' }, { input: '1 3\n5 -2 9\n', note: 'One row: the smallest number, -2.' }],
    hints: ['best(i, j) = value(i, j) + the smallest best(i - 1, c) over the columns c other than j.', 'The smallest value excluding one column is the overall smallest, or the second smallest if the overall smallest is in that column.', 'Keep the two smallest values of the previous row and the column of the smallest.'],
    program: {
      io: ['h:int w:int', 'a:int[h][w]'],
      fast: true,
      python: r`
        prev = a[0][:]
        for i in range(1, h):
            m1 = min(prev)
            i1 = prev.index(m1)
            m2 = min(prev[:i1] + prev[i1 + 1:])
            row = a[i]
            prev = [row[j] + (m2 if j == i1 else m1) for j in range(w)]
        print(min(prev))`,
      cpp: r`
        vector<long long> prev = a[0];
        for (int i = 1; i < h; i++) {
            int i1 = 0;
            for (int j = 1; j < w; j++) if (prev[j] < prev[i1]) i1 = j;
            long long m1 = prev[i1], m2 = (long long)4e18;
            for (int j = 0; j < w; j++) if (j != i1 && prev[j] < m2) m2 = prev[j];
            vector<long long> next(w);
            for (int j = 0; j < w; j++) next[j] = a[i][j] + (j == i1 ? m2 : m1);
            prev = next;
        }
        cout << *min_element(prev.begin(), prev.end()) << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        long[] prev = a[0].clone();
        long[] next = new long[colsCount];
        for (int i = 1; i < rowsCount; i++) {
            int i1 = 0;
            for (int j = 1; j < colsCount; j++) if (prev[j] < prev[i1]) i1 = j;
            long m1 = prev[i1], m2 = Long.MAX_VALUE;
            for (int j = 0; j < colsCount; j++) if (j != i1 && prev[j] < m2) m2 = prev[j];
            for (int j = 0; j < colsCount; j++) next[j] = a[i][j] + (j == i1 ? m2 : m1);
            long[] swap = prev;
            prev = next;
            next = swap;
        }
        long answer = prev[0];
        for (long x : prev) answer = Math.min(answer, x);
        System.out.println(answer);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['best(i, j) is the value of the cell plus the smallest total of the previous row in another column; since that is the overall smallest total unless it lies in the same column (then the second smallest), only the two smallest totals and the column of the smallest are kept for every row. The answer is the smallest total of the last row.'], complexity: 'Time O(h * w), space O(w).' },
    solve(input) {
      const { h, w, m } = parseMatrix(input); // the quadratic table: the smallest previous total over all other columns, searched explicitly
      let prev = m[0].slice(); for (let i = 1; i < h; i++) { const cur = new Array(w); for (let j = 0; j < w; j++) { let best = Infinity; for (let c = 0; c < w; c++) if (c !== j && prev[c] < best) best = prev[c]; cur[j] = m[i][j] + best; } prev = cur; } return String(Math.min(...prev));
    },
    tests() {
      const g = rng(2069); const out = ['3 3\n1 2 3\n4 5 6\n7 8 9\n', '1 3\n5 -2 9\n', '1 2\n3 3\n', '2 2\n1 2\n3 4\n', '3 2\n1 1\n1 1\n1 1\n'];
      const brute = (input) => { const { h, w, m } = parseMatrix(input); let best = Infinity; const go = (i, prevCol, sum) => { if (i === h) { best = Math.min(best, sum); return; } for (let j = 0; j < w; j++) if (j !== prevCol) go(i + 1, j, sum + m[i][j]); }; go(0, -1, 0); return String(best); };
      crossCheck(() => matrixText(randomMatrix(g, randInt(g, 1, 5), randInt(g, 2, 4), -9, 9)), (i) => this.solve(i), brute, 400);
      for (const [h, w, lo, hi] of [[10, 10, -100, 100], [50, 50, -1000, 1000], [100, 100, -1000, 1000], [200, 200, -1000, 1000], [400, 400, -1000, 1000], [400, 400, -1000, 1000], [400, 400, 0, 1], [400, 2, -1000, 1000], [1, 400, -1000, 1000], [399, 397, -1000, 1000]]) out.push(matrixText(randomMatrix(g, h, w, lo, hi)));
      out.push(matrixText(many(200, () => new Array(200).fill(-1000))), matrixText(many(200, () => new Array(200).fill(1000))), matrixText(many(200, (i) => many(200, (j) => (j === i % 200 ? -1000 : 1000)))), matrixText(many(200, (i) => many(200, (j) => (j === 0 ? -1000 : j)))));
      return out;
    }
  }
];
