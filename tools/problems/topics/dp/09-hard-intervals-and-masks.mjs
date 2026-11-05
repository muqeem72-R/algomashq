import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const list = (n, a) => `${n}\n${a.join(' ')}\n`;
const head2 = (a, b, arr) => `${a} ${b}\n${arr.join(' ')}\n`;
const parse2 = (input) => { const rs = rows(input); const [a, b] = nums(rs[0]); return { a, b, arr: nums(rs[1]) }; };
const permutations = (n) => { const out = []; const used = new Array(n).fill(false); const cur = []; const go = () => { if (cur.length === n) { out.push(cur.slice()); return; } for (let i = 0; i < n; i++) if (!used[i]) { used[i] = true; cur.push(i); go(); cur.pop(); used[i] = false; } }; go(); return out; };

export default [
  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of balloons.', 'The second line has `n` numbers: the number painted on each balloon.'],
    constraints: ['1 <= n <= 200', '0 <= each number <= 100'],
    slug: 'burst-balloons',
    title: 'Burst the Balloons for the Most Coins',
    tags: ['dp', 'interval-dp', 'last-action'],
    concept: {
      title: 'Think backwards: which balloon bursts last in a range? Then the two sides do not interact',
      body: [
        'In a row of balloons each balloon has a number. Bursting the balloon `i` gives `left * a[i] * right` coins, where `left` and `right` are the numbers of the **neighbours that are still there** (a missing neighbour counts as 1). The balloons are burst one by one until none is left. What is the largest total number of coins? For `3 1 5 8` the answer is 167: burst 1, then 5, then 3, then 8.',
        'Choosing which balloon to burst **first** is hard: the neighbours of the remaining balloons change, so the two parts of the row depend on each other. Think about the **last** balloon `k` to burst in a range. When it bursts, it is alone in the range, so its neighbours are the two balloons just **outside** the range. Before that, the balloons on its left and on its right were burst independently, with `k` as a wall between them. Let `dp(l, r)` be the most coins from bursting **all the balloons strictly between** the positions `l` and `r` (the balloons `l` and `r` stay as walls). If `k` is the last one: **`dp(l, r) = max over k of dp(l, k) + dp(k, r) + a[l] * a[k] * a[r]`**. Put a balloon with the number 1 at both ends of the row; the answer is `dp(0, n + 1)`.',
        { code: 'a = [1] + balloons + [1]\nm = n + 2\ndp = [[0] * m for _ in range(m)]\nfor length in range(2, m):                        # the distance between the two walls\n    for l in range(m - length):\n        r = l + length\n        dp[l][r] = max(dp[l][k] + dp[k][r] + a[l] * a[k] * a[r] for k in range(l + 1, r))\nprint(dp[0][m - 1])' },
        'The ranges are processed from short to long, so `dp(l, k)` and `dp(k, r)` are ready. There are O(n^2) ranges and O(n) choices of `k` for each: O(n^3) time (about 1.3 million steps for 200 balloons) and O(n^2) memory. "Choose the last action in an interval" is the key idea in many interval problems: the last action splits the interval into two independent parts.'
      ]
    },
    statement: ['`n` balloons stand in a row; the balloon `i` has the number `a[i]`. Bursting a balloon gives (number of the left neighbour) * `a[i]` * (number of the right neighbour) coins, where the neighbours are the nearest balloons that are not yet burst, and a missing neighbour counts as 1. Balloons are burst one at a time until none is left. Print the largest possible total number of coins.'],
    outputFormat: ['Print the largest total number of coins.'],
    examples: [{ input: '4\n3 1 5 8\n', note: 'Burst 1 (3*1*5 = 15), 5 (3*5*8 = 120), 3 (1*3*8 = 24), 8 (1*8*1 = 8): 167.' }, { input: '1\n7\n', note: 'A single balloon: 1 * 7 * 1 = 7.' }],
    hints: ['Think about the balloon that bursts LAST between two walls.', 'dp(l, r) = max over k of dp(l, k) + dp(k, r) + a[l] * a[k] * a[r].', 'Add a balloon with the number 1 at each end and fill the table by increasing distance between l and r.'],
    program: {
      io: ['n:int', 'balloons:int[n]'],
      fast: true,
      python: r`
        a = [1] + balloons + [1]
        m = n + 2
        dp = [[0] * m for _ in range(m)]
        for length in range(2, m):
            for l in range(m - length):
                r = l + length
                al = a[l]
                ar = a[r]
                best = 0
                row = dp[l]
                for k in range(l + 1, r):
                    v = row[k] + dp[k][r] + al * a[k] * ar
                    if v > best:
                        best = v
                row[r] = best
        print(dp[0][m - 1])`,
      cpp: r`
        int m = (int)n + 2;
        vector<long long> a(m, 1);
        for (int i = 0; i < n; i++) a[i + 1] = balloons[i];
        vector<vector<long long>> dp(m, vector<long long>(m, 0));
        for (int length = 2; length < m; length++) {
            for (int l = 0; l + length < m; l++) {
                int r = l + length;
                long long best = 0;
                for (int k = l + 1; k < r; k++) {
                    best = max(best, dp[l][k] + dp[k][r] + a[l] * a[k] * a[r]);
                }
                dp[l][r] = best;
            }
        }
        cout << dp[0][m - 1] << "\n";`,
      java: r`
        int m = (int) n + 2;
        long[] a = new long[m];
        Arrays.fill(a, 1);
        for (int i = 0; i < n; i++) a[i + 1] = balloons[i];
        long[][] dp = new long[m][m];
        for (int length = 2; length < m; length++) {
            for (int l = 0; l + length < m; l++) {
                int r = l + length;
                long best = 0;
                for (int k = l + 1; k < r; k++) {
                    best = Math.max(best, dp[l][k] + dp[k][r] + a[l] * a[k] * a[r]);
                }
                dp[l][r] = best;
            }
        }
        System.out.println(dp[0][m - 1]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['With a balloon of number 1 added at each end, dp(l, r) is the largest number of coins from bursting all the balloons strictly between l and r; if k is the one that bursts last, the two sides are independent: dp(l, r) = max over k of dp(l, k) + dp(k, r) + a[l] * a[k] * a[r]. The ranges are processed by increasing length, and the answer is dp(0, n + 1).'], complexity: 'Time O(n^3), space O(n^2).' },
    solve(input) {
      const a0 = nums(rows(input)[1]); const a = [1, ...a0, 1]; const m = a.length; const memo = new Map(); // top-down with memory
      const go = (l, r) => { if (r - l < 2) return 0; const key = l * 300 + r; if (memo.has(key)) return memo.get(key); let best = 0; for (let k = l + 1; k < r; k++) best = Math.max(best, go(l, k) + go(k, r) + a[l] * a[k] * a[r]); memo.set(key, best); return best; };
      return String(go(0, m - 1));
    },
    tests() {
      const g = rng(2081); const out = ['4\n3 1 5 8\n', '1\n7\n', '2\n0 0\n', '3\n1 1 1\n'];
      const brute = (input) => { const a0 = nums(rows(input)[1]); const go = (arr) => { if (!arr.length) return 0; let best = 0; for (let i = 0; i < arr.length; i++) { const gain = (i ? arr[i - 1] : 1) * arr[i] * (i + 1 < arr.length ? arr[i + 1] : 1); best = Math.max(best, gain + go([...arr.slice(0, i), ...arr.slice(i + 1)])); } return best; }; return String(go(a0)); };
      crossCheck(() => { const n = randInt(g, 1, 7); return list(n, randArray(g, n, 0, 9)); }, (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[10, 10], [30, 100], [60, 100], [100, 100], [150, 100], [200, 100], [200, 100], [200, 1], [200, 0], [199, 100]]) out.push(list(n, randArray(g, n, 0, hi)));
      out.push(list(200, new Array(200).fill(100)), list(200, many(200, (i) => (i % 2 ? 100 : 1))), list(200, many(200, (i) => i % 101)));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `m`: the number of dimensions (so there are `m - 1` matrices).', 'The second line has `m` numbers: the matrix number `i` has `d[i]` rows and `d[i + 1]` columns.'],
    constraints: ['2 <= m <= 201', '1 <= each dimension <= 100'],
    slug: 'matrix-chain-order',
    title: 'The Cheapest Order to Multiply a Chain of Matrices',
    tags: ['dp', 'interval-dp', 'matrix-chain'],
    concept: {
      title: 'Choose the last multiplication: it splits the chain into two independent chains',
      body: [
        'To multiply a chain of matrices `A1 * A2 * ... * An` you may put the brackets in any way, because the product does not depend on it. But the **cost** does: multiplying a matrix of size `p x q` by a matrix of size `q x r` takes `p * q * r` scalar multiplications. For the sizes `10x30`, `30x5`, `5x60` the order `(A1 A2) A3` costs 10*30*5 + 10*5*60 = 4500, and `A1 (A2 A3)` costs 30*5*60 + 10*30*60 = 27000. Find the smallest total cost over all the ways to put brackets.',
        'Describe the matrices by the list of dimensions `d`: the matrix `i` has `d[i]` rows and `d[i + 1]` columns, so neighbours always fit. Let `cost(i, j)` be the smallest cost to multiply the matrices `i .. j` (`cost(i, i) = 0`). In an optimal bracketing the **last multiplication** joins the product of `i .. k` with the product of `k + 1 .. j`; the two parts are independent, and the last product multiplies a `d[i] x d[k+1]` matrix by a `d[k+1] x d[j+1]` matrix: **`cost(i, j) = min over k of cost(i, k) + cost(k + 1, j) + d[i] * d[k + 1] * d[j + 1]`**.',
        { code: 'cost = [[0] * n for _ in range(n)]\nfor length in range(2, n + 1):\n    for i in range(n - length + 1):\n        j = i + length - 1\n        cost[i][j] = min(cost[i][k] + cost[k + 1][j] + d[i] * d[k + 1] * d[j + 1] for k in range(i, j))\nprint(cost[0][n - 1])' },
        'The chains are processed from short to long. There are O(n^2) chains and O(n) split points: O(n^3) time and O(n^2) memory. The same table shape solves "optimal way to evaluate an expression", "optimal triangulation of a polygon" and many other interval problems where a final operation joins two independent parts.'
      ]
    },
    statement: ['A chain of `n = m - 1` matrices is given by the list of `m` dimensions: the matrix `i` has `d[i]` rows and `d[i + 1]` columns. Multiplying a `p x q` matrix by a `q x r` matrix costs `p * q * r`. Print the smallest total cost of multiplying the whole chain, over all ways to place the brackets.'],
    outputFormat: ['Print the smallest total cost.'],
    examples: [{ input: '4\n10 30 5 60\n', note: 'Multiply (A1 A2) first: 10*30*5 = 1500, then by A3: 10*5*60 = 3000. Total 4500.' }, { input: '2\n5 7\n', note: 'A single matrix needs no multiplication: 0.' }],
    hints: ['Let cost(i, j) be the smallest cost for the matrices i to j; cost(i, i) = 0.', 'Try every split k: cost(i, k) + cost(k + 1, j) + d[i] * d[k + 1] * d[j + 1].', 'Fill the table by increasing chain length.'],
    program: {
      io: ['m:int', 'd:int[m]'],
      fast: true,
      python: r`
        n = m - 1
        cost = [[0] * n for _ in range(n)]
        for length in range(2, n + 1):
            for i in range(n - length + 1):
                j = i + length - 1
                best = None
                di = d[i]
                dj = d[j + 1]
                for k in range(i, j):
                    v = cost[i][k] + cost[k + 1][j] + di * d[k + 1] * dj
                    if best is None or v < best:
                        best = v
                cost[i][j] = best
        print(cost[0][n - 1])`,
      cpp: r`
        int n = (int)m - 1;
        vector<vector<long long>> cost(n, vector<long long>(n, 0));
        for (int length = 2; length <= n; length++) {
            for (int i = 0; i + length - 1 < n; i++) {
                int j = i + length - 1;
                long long best = LLONG_MAX;
                for (int k = i; k < j; k++) {
                    best = min(best, cost[i][k] + cost[k + 1][j] + d[i] * d[k + 1] * d[j + 1]);
                }
                cost[i][j] = best;
            }
        }
        cout << cost[0][n - 1] << "\n";`,
      java: r`
        int n = (int) m - 1;
        long[][] cost = new long[n][n];
        for (int length = 2; length <= n; length++) {
            for (int i = 0; i + length - 1 < n; i++) {
                int j = i + length - 1;
                long best = Long.MAX_VALUE;
                for (int k = i; k < j; k++) {
                    best = Math.min(best, cost[i][k] + cost[k + 1][j] + d[i] * d[k + 1] * d[j + 1]);
                }
                cost[i][j] = best;
            }
        }
        System.out.println(cost[0][n - 1]);`,
      includes: ['<algorithm>', '<climits>']
    },
    solution: { explanation: ['cost(i, j), the smallest cost to multiply the matrices i to j, is the minimum over the split k of cost(i, k) + cost(k + 1, j) + d[i] * d[k + 1] * d[j + 1], with cost(i, i) = 0; the table is filled by increasing chain length.'], complexity: 'Time O(n^3), space O(n^2).' },
    solve(input) {
      const d = nums(rows(input)[1]); const n = d.length - 1; const memo = new Map();
      const go = (i, j) => { if (i === j) return 0; const key = i * 300 + j; if (memo.has(key)) return memo.get(key); let best = Infinity; for (let k = i; k < j; k++) best = Math.min(best, go(i, k) + go(k + 1, j) + d[i] * d[k + 1] * d[j + 1]); memo.set(key, best); return best; };
      return String(go(0, n - 1));
    },
    tests() {
      const g = rng(2082); const out = ['4\n10 30 5 60\n', '2\n5 7\n', '3\n10 20 30\n', '5\n40 20 30 10 30\n'];
      const brute = (input) => { const d = nums(rows(input)[1]); const n = d.length - 1; const go = (dims) => { if (dims.length === 2) return 0; let best = Infinity; for (let k = 1; k < dims.length - 1; k++) best = Math.min(best, go(dims.slice(0, k + 1)) + go(dims.slice(k)) + dims[0] * dims[k] * dims[dims.length - 1]); return best; }; return String(go(d)); };
      crossCheck(() => { const m = randInt(g, 2, 8); return list(m, randArray(g, m, 1, 20)); }, (i) => this.solve(i), brute, 300);
      for (const [m, hi] of [[10, 10], [30, 100], [60, 100], [100, 100], [150, 100], [201, 100], [201, 100], [201, 2], [201, 1], [200, 100]]) out.push(list(m, randArray(g, m, 1, hi)));
      out.push(list(201, new Array(201).fill(100)), list(201, many(201, (i) => (i % 2 ? 100 : 1))), list(201, many(201, (i) => 1 + (i % 100))));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `k`: the number of piles and the number of piles merged at a time.', 'The second line has `n` numbers: the number of stones in each pile.'],
    constraints: ['1 <= n <= 150', '2 <= k <= 10', '1 <= each pile <= 100'],
    slug: 'merge-stones-in-groups',
    title: 'Merge the Piles of Stones k at a Time',
    tags: ['dp', 'interval-dp', 'merging'],
    concept: {
      title: 'Merging k piles at a time: count how many piles are left in a range',
      body: [
        'Piles of stones stand in a row. In one move you take **exactly `k` consecutive piles** and merge them into one pile; the move costs the total number of stones in those `k` piles. You repeat until a single pile is left. What is the smallest total cost? For the piles `3 2 4 1` and `k = 2` the answer is 20; for `3 2 4 1` and `k = 3` it is impossible: -1. A pile count `n` can be reduced to 1 only if `(n - 1)` is divisible by `(k - 1)`, because every move removes `k - 1` piles.',
        'Let `cost(i, j)` be the smallest cost of merging the piles `i .. j` into **as few piles as possible**, which is 1 pile if `(j - i)` is divisible by `k - 1`, and otherwise a larger number that cannot be merged further inside the range. Any such state can be split: the first pile of the final state of the range covers the piles `i .. m`, and the rest of the range is merged independently. So **`cost(i, j) = min over m of cost(i, m) + cost(m + 1, j)`** where `m` goes `i, i + (k - 1), i + 2(k - 1), ...` (the left part must be one complete pile). If the range `i .. j` can become exactly **one pile**, one last merge of `k` piles is added, and it costs the sum of the whole range: `+ sum(i .. j)`.',
        { code: 'if (n - 1) % (k - 1): print(-1)\nelse:\n    prefix = ...\n    cost = [[0] * n for _ in range(n)]\n    for length in range(2, n + 1):\n        for i in range(n - length + 1):\n            j = i + length - 1\n            cost[i][j] = min(cost[i][m] + cost[m + 1][j] for m in range(i, j, k - 1))\n            if (j - i) % (k - 1) == 0:\n                cost[i][j] += prefix[j + 1] - prefix[i]       # the last merge makes one pile\n    print(cost[0][n - 1])' },
        'Stepping `m` by `k - 1` keeps the left part a single pile, so each range is split in about `length / (k - 1)` ways. Total time O(n^3 / (k - 1)) and memory O(n^2). The ideas to take: when the number of objects left in a range matters, make it a part of the state, or use the arithmetic (here divisibility by `k - 1`) to keep it implicit.'
      ]
    },
    statement: ['`n` piles of stones stand in a row. In one move you merge exactly `k` consecutive piles into one pile; the cost of the move is the total number of stones in the merged piles. Print the smallest total cost of merging all piles into one, or -1 if it is impossible.'],
    outputFormat: ['Print the smallest total cost, or -1.'],
    examples: [{ input: '4 2\n3 2 4 1\n', note: 'Merge 3+2 (5), 4+1 (5), then 5+5 (10): 20.' }, { input: '4 3\n3 2 4 1\n', note: 'Four piles cannot be merged three at a time into one: -1.' }],
    hints: ['If (n - 1) is not divisible by (k - 1), the answer is -1.', 'cost(i, j) = the minimum of cost(i, m) + cost(m + 1, j) over m = i, i + (k - 1), ...', 'If the range can become one pile ((j - i) divisible by k - 1), add the sum of the range for the last merge.'],
    program: {
      io: ['n:int k:int', 'piles:int[n]'],
      fast: true,
      python: r`
        if (n - 1) % (k - 1):
            print(-1)
        else:
            prefix = [0] * (n + 1)
            for i in range(n):
                prefix[i + 1] = prefix[i] + piles[i]
            cost = [[0] * n for _ in range(n)]
            step = k - 1
            for length in range(2, n + 1):
                for i in range(n - length + 1):
                    j = i + length - 1
                    best = None
                    for m in range(i, j, step):
                        v = cost[i][m] + cost[m + 1][j]
                        if best is None or v < best:
                            best = v
                    if (j - i) % step == 0:
                        best += prefix[j + 1] - prefix[i]
                    cost[i][j] = best
            print(cost[0][n - 1])`,
      cpp: r`
        if ((n - 1) % (k - 1) != 0) {
            cout << -1 << "\n";
        } else {
            vector<long long> prefix(n + 1, 0);
            for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + piles[i];
            vector<vector<long long>> cost(n, vector<long long>(n, 0));
            int step = (int)k - 1;
            for (int length = 2; length <= n; length++) {
                for (int i = 0; i + length - 1 < n; i++) {
                    int j = i + length - 1;
                    long long best = LLONG_MAX;
                    for (int m = i; m < j; m += step) best = min(best, cost[i][m] + cost[m + 1][j]);
                    if ((j - i) % step == 0) best += prefix[j + 1] - prefix[i];
                    cost[i][j] = best;
                }
            }
            cout << cost[0][n - 1] << "\n";
        }`,
      java: r`
        if ((n - 1) % (k - 1) != 0) {
            System.out.println(-1);
        } else {
            int count = (int) n, step = (int) k - 1;
            long[] prefix = new long[count + 1];
            for (int i = 0; i < count; i++) prefix[i + 1] = prefix[i] + piles[i];
            long[][] cost = new long[count][count];
            for (int length = 2; length <= count; length++) {
                for (int i = 0; i + length - 1 < count; i++) {
                    int j = i + length - 1;
                    long best = Long.MAX_VALUE;
                    for (int m = i; m < j; m += step) best = Math.min(best, cost[i][m] + cost[m + 1][j]);
                    if ((j - i) % step == 0) best += prefix[j + 1] - prefix[i];
                    cost[i][j] = best;
                }
            }
            System.out.println(cost[0][count - 1]);
        }`,
      includes: ['<algorithm>', '<climits>']
    },
    solution: { explanation: ['If n - 1 is not divisible by k - 1 the answer is -1. Otherwise cost(i, j) is the smallest cost to merge the piles i to j as far as possible: the minimum over the split m = i, i + (k - 1), ... of cost(i, m) + cost(m + 1, j), plus the sum of the range when it can become a single pile. The answer is cost(0, n - 1).'], complexity: 'Time O(n^3 / (k - 1)), space O(n^2).' },
    solve(input) {
      const { a: n, b: k, arr: p } = parse2(input); if ((n - 1) % (k - 1)) return '-1'; // f[i][j][c]: the cheapest way to merge the piles i..j into exactly c piles
      const pre = [0]; for (const x of p) pre.push(pre[pre.length - 1] + x); const INF = 1e18; const f = Array.from({ length: n }, () => Array.from({ length: n }, () => new Array(k + 1).fill(INF)));
      for (let i = 0; i < n; i++) f[i][i][1] = 0;
      for (let len = 2; len <= n; len++) for (let i = 0; i + len - 1 < n; i++) { const j = i + len - 1; for (let c = 2; c <= k; c++) for (let m = i; m < j; m++) f[i][j][c] = Math.min(f[i][j][c], f[i][m][c - 1] + f[m + 1][j][1]); f[i][j][1] = Math.min(f[i][j][1], f[i][j][k] + pre[j + 1] - pre[i]); }
      return String(f[0][n - 1][1]);
    },
    tests() {
      const g = rng(2083); const out = ['4 2\n3 2 4 1\n', '4 3\n3 2 4 1\n', '1 2\n5\n', '3 3\n3 5 1\n', '2 2\n7 7\n'];
      const brute = (input) => { const { a: n, b: k, arr: p } = parse2(input); const go = (piles) => { if (piles.length === 1) return 0; let best = Infinity; for (let s = 0; s + k <= piles.length; s++) { const merged = piles.slice(s, s + k).reduce((x, y) => x + y, 0); best = Math.min(best, merged + go([...piles.slice(0, s), merged, ...piles.slice(s + k)])); } return best; }; if ((n - 1) % (k - 1)) return '-1'; return String(go(p)); };
      crossCheck(() => { const k = randInt(g, 2, 4); const n = randInt(g, 1, 8); return head2(n, k, randArray(g, n, 1, 9)); }, (i) => this.solve(i), brute, 400);
      const fit = (n, k) => 1 + Math.floor((n - 1) / (k - 1)) * (k - 1); // the largest number of piles up to n that can be merged into one
      for (const [n, k, hi] of [[10, 2, 20], [31, 3, 100], [61, 4, 100], [100, 2, 100], [100, 4, 100], [150, 2, 100], [150, 3, 100], [150, 4, 100], [150, 6, 100], [150, 10, 100], [150, 10, 5], [1, 5, 100]]) { const nn = fit(n, k); out.push(head2(nn, k, randArray(g, nn, 1, hi))); }
      out.push(head2(50, 3, randArray(g, 50, 1, 100)), head2(150, 4, randArray(g, 150, 1, 100)), head2(150, 2, new Array(150).fill(100)), head2(fit(145, 2), 2, many(fit(145, 2), (i) => 1 + (i % 100))), head2(fit(148, 3), 3, many(fit(148, 3), (i) => 100 - (i % 100))));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['One line with the string `s`.'],
    constraints: ['1 <= length of s <= 200', 'The string consists of lowercase English letters.'],
    slug: 'strange-printer-turns',
    title: 'The Fewest Turns of a Printer That Overwrites',
    tags: ['dp', 'interval-dp', 'string'],
    concept: {
      title: 'The first letter of a range can be printed together with a later equal letter',
      body: [
        'A strange printer can print **a run of the same letter** in one turn: in every turn it prints one letter on any chosen range of positions, and it **overwrites** whatever was there. Find the smallest number of turns needed to print a given word. For `aaabbb` it is 2 (`aaa` then `bbb`), and for `aba` it is 2: print `aaa` and then print `b` over the middle one.',
        'Let `turns(i, j)` be the smallest number of turns for the piece `s[i..j]`. A simple way to print `s[i]`: spend one turn on it alone and then print the rest: `turns(i, j) = 1 + turns(i + 1, j)`. But `s[i]` can **share a turn** with a later letter equal to it: if `s[k] = s[i]` for some `k` in `i + 1 .. j`, one turn can print `s[i]` over a stretch up to `k`, and then the piece `s[i + 1 .. k - 1]` between them is printed on top (without a cost for `s[k]`, which is already done): **`turns(i, j) = min(turns(i, j), turns(i + 1, k - 1) + turns(k, j))`**, where `turns(k, j)` still includes the first letter of the stretch `k .. j`, which is the same turn as for `s[i]`.',
        { code: 'for length in range(1, n + 1):\n    for i in range(n - length + 1):\n        j = i + length - 1\n        t[i][j] = 1 + (t[i + 1][j] if i < j else 0)\n        for k in range(i + 1, j + 1):\n            if s[k] == s[i]:\n                t[i][j] = min(t[i][j], (t[i + 1][k - 1] if i + 1 <= k - 1 else 0) + t[k][j])\nprint(t[0][n - 1])' },
        'Why does this give the optimum? In an optimal printing the turn that prints `s[i]` can be taken to cover a stretch whose right end is the last letter equal to `s[i]` that it helps with; everything between is printed later on top, which is a smaller independent problem. The table has O(n^2) cells and each looks at O(n) positions: O(n^3), about 1.3 million steps for 200 letters. Repeated neighbouring letters can first be collapsed into one, but the formula handles them as well.'
      ]
    },
    statement: ['A printer prints in each turn a sequence of one repeated letter over any chosen range of positions, replacing what was there. Print the smallest number of turns that the printer needs to print the word `s`.'],
    outputFormat: ['Print the smallest number of turns.'],
    examples: [{ input: 'aaabbb\n', note: 'aaa, then bbb: 2 turns.' }, { input: 'aba\n', note: 'Print aaa, then b over the middle: 2 turns.' }],
    hints: ['Let turns(i, j) be the answer for s[i..j]; one way is 1 + turns(i + 1, j).', 'If s[k] = s[i] for some k > i, the first letter can share a turn with s[k]: turns(i + 1, k - 1) + turns(k, j).', 'Fill the table by increasing length.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        n = len(s)
        t = [[0] * (n + 1) for _ in range(n + 1)]
        for length in range(1, n + 1):
            for i in range(n - length + 1):
                j = i + length - 1
                best = 1 + (t[i + 1][j] if i < j else 0)
                for k in range(i + 1, j + 1):
                    if s[k] == s[i]:
                        v = (t[i + 1][k - 1] if i + 1 <= k - 1 else 0) + t[k][j]
                        if v < best:
                            best = v
                t[i][j] = best
        print(t[0][n - 1])`,
      cpp: r`
        int n = (int)s.size();
        vector<vector<int>> t(n + 1, vector<int>(n + 1, 0));
        for (int length = 1; length <= n; length++) {
            for (int i = 0; i + length - 1 < n; i++) {
                int j = i + length - 1;
                int best = 1 + (i < j ? t[i + 1][j] : 0);
                for (int k = i + 1; k <= j; k++) {
                    if (s[k] == s[i]) {
                        int v = (i + 1 <= k - 1 ? t[i + 1][k - 1] : 0) + t[k][j];
                        best = min(best, v);
                    }
                }
                t[i][j] = best;
            }
        }
        cout << t[0][n - 1] << "\n";`,
      java: r`
        int n = s.length();
        int[][] t = new int[n + 1][n + 1];
        for (int length = 1; length <= n; length++) {
            for (int i = 0; i + length - 1 < n; i++) {
                int j = i + length - 1;
                int best = 1 + (i < j ? t[i + 1][j] : 0);
                for (int k = i + 1; k <= j; k++) {
                    if (s.charAt(k) == s.charAt(i)) {
                        int v = (i + 1 <= k - 1 ? t[i + 1][k - 1] : 0) + t[k][j];
                        best = Math.min(best, v);
                    }
                }
                t[i][j] = best;
            }
        }
        System.out.println(t[0][n - 1]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['turns(i, j) is the fewest turns for the piece s[i..j]: 1 + turns(i + 1, j), or, when s[k] equals s[i] for some k in i + 1..j, turns(i + 1, k - 1) + turns(k, j) because the first letter shares a turn with s[k]. The table is filled by increasing length.'], complexity: 'Time O(n^3), space O(n^2).' },
    solve(input) {
      const s = rows(input)[0]; const n = s.length; const memo = new Map(); // top-down with memory
      const go = (i, j) => { if (i > j) return 0; const key = i * 300 + j; if (memo.has(key)) return memo.get(key); let best = 1 + go(i + 1, j); for (let k = i + 1; k <= j; k++) if (s[k] === s[i]) best = Math.min(best, go(i + 1, k - 1) + go(k, j)); memo.set(key, best); return best; };
      return String(go(0, n - 1));
    },
    tests() {
      const g = rng(2084); const out = ['aaabbb\n', 'aba\n', 'a\n', 'abc\n', 'abab\n', 'abcabc\n'];
      const brute = (input) => { const s = rows(input)[0]; const n = s.length; // breadth-first search over the strings printed so far (letters of the word only, '?' = nothing yet)
        const target = s; const start = '?'.repeat(n); const seen = new Set([start]); let layer = [start]; let d = 0; const letters = [...new Set(s)];
        while (!layer.includes(target)) { const next = []; for (const w of layer) for (let i = 0; i < n; i++) for (let j = i; j < n; j++) for (const c of letters) { const x = w.slice(0, i) + c.repeat(j - i + 1) + w.slice(j + 1); if (!seen.has(x)) { seen.add(x); next.push(x); } } layer = next; d++; } return String(d); };
      crossCheck(() => randWord(g, randInt(g, 1, 6), 'abc') + '\n', (i) => this.solve(i), brute, 150);
      for (const [n, al] of [[20, 'ab'], [50, 'abc'], [100, 'abcd'], [150, 'ab'], [200, 'abcdefghijklmnopqrstuvwxyz'], [200, 'ab'], [200, 'abc'], [199, 'abcde']]) out.push(randWord(g, n, al) + '\n');
      out.push('a'.repeat(200) + '\n', 'ab'.repeat(100) + '\n', 'abcdefghijklmnopqrstuvwxyz'.repeat(7) + 'abcdefghijklmn\n', 'a'.repeat(100) + 'b'.repeat(100) + '\n', 'abcba'.repeat(40) + '\n');
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `m`: the length of the stick and the number of cuts.', 'The second line has `m` different cut positions (each strictly between 0 and `n`).'],
    constraints: ['2 <= n <= 1000000', '1 <= m <= 150', '1 <= each position <= n - 1'],
    slug: 'cut-the-stick-cheapest',
    title: 'Cut the Stick at All the Marks as Cheaply as Possible',
    tags: ['dp', 'interval-dp', 'cuts'],
    concept: {
      title: 'The first cut splits the stick into two independent sticks, so choose the first cut of a range',
      body: [
        'A stick of the length `n` must be cut at `m` marked positions, in any order. Every cut costs the **current length of the piece being cut**. For example, a stick of length 7 with the marks 1, 3, 4, 5: cutting at 3 first costs 7, then the piece 0-3 is cut at 1 for 3 and the piece 3-7 at 5 for 4, then at 4 for 2: the total is 7 + 3 + 4 + 2 = 16. Other orders cost more. Find the smallest total.',
        'Put the two ends of the stick into the list of positions: `c = [0] + marks + [n]`. Let `cost(i, j)` be the smallest cost to make all the cuts that lie **strictly between** the positions `c[i]` and `c[j]`, in the piece from `c[i]` to `c[j]`. If there is no mark between them, the cost is 0. Otherwise choose the mark `k` that is cut **first** in this piece: it costs the length of the piece, `c[j] - c[i]`, and then the two parts are independent pieces: **`cost(i, j) = c[j] - c[i] + min over k of cost(i, k) + cost(k, j)`**.',
        { code: 'c = [0] + sorted(marks) + [n]\nsize = len(c)\ncost = [[0] * size for _ in range(size)]\nfor gap in range(2, size):\n    for i in range(size - gap):\n        j = i + gap\n        cost[i][j] = c[j] - c[i] + min(cost[i][k] + cost[k][j] for k in range(i + 1, j))\nprint(cost[0][size - 1])' },
        'The marks must be **sorted** before the table is built. The table has O((m + 2)^2) cells with O(m) choices each: O(m^3), about 600 000 steps for 150 marks, and the length `n` of the stick only enters through the costs. The choice of the first cut of an interval (in the balloon problem it was the last burst) is the typical way to split an interval into independent parts.'
      ]
    },
    statement: ['A stick of the length `n` lies along the positions 0 to `n`. It has to be cut at `m` marked positions, in any order you like. A cut costs the length of the piece that is cut. Print the smallest total cost of all the cuts.'],
    outputFormat: ['Print the smallest total cost.'],
    examples: [{ input: '7 4\n1 3 4 5\n', note: 'Cut at 3 (7), at 5 (4), at 1 (3), at 4 (2): 16.' }, { input: '9 5\n5 6 1 4 2\n', note: 'The best order costs 22.' }],
    hints: ['Add 0 and n to the sorted list of marks.', 'cost(i, j) is the cost of all the cuts strictly between c[i] and c[j]; choose the first cut k.', 'cost(i, j) = (c[j] - c[i]) + min over k of cost(i, k) + cost(k, j).'],
    program: {
      io: ['n:int m:int', 'marks:int[m]'],
      fast: true,
      python: r`
        c = [0] + sorted(marks) + [n]
        size = len(c)
        cost = [[0] * size for _ in range(size)]
        for gap in range(2, size):
            for i in range(size - gap):
                j = i + gap
                best = None
                for k in range(i + 1, j):
                    v = cost[i][k] + cost[k][j]
                    if best is None or v < best:
                        best = v
                cost[i][j] = best + c[j] - c[i]
        print(cost[0][size - 1])`,
      cpp: r`
        vector<long long> c;
        c.push_back(0);
        vector<long long> sortedMarks = marks;
        sort(sortedMarks.begin(), sortedMarks.end());
        for (long long x : sortedMarks) c.push_back(x);
        c.push_back(n);
        int size = (int)c.size();
        vector<vector<long long>> cost(size, vector<long long>(size, 0));
        for (int gap = 2; gap < size; gap++) {
            for (int i = 0; i + gap < size; i++) {
                int j = i + gap;
                long long best = LLONG_MAX;
                for (int k = i + 1; k < j; k++) best = min(best, cost[i][k] + cost[k][j]);
                cost[i][j] = best + c[j] - c[i];
            }
        }
        cout << cost[0][size - 1] << "\n";`,
      java: r`
        int count = (int) m;
        long[] sortedMarks = marks.clone();
        Arrays.sort(sortedMarks);
        long[] c = new long[count + 2];
        for (int i = 0; i < count; i++) c[i + 1] = sortedMarks[i];
        c[count + 1] = n;
        int size = count + 2;
        long[][] cost = new long[size][size];
        for (int gap = 2; gap < size; gap++) {
            for (int i = 0; i + gap < size; i++) {
                int j = i + gap;
                long best = Long.MAX_VALUE;
                for (int k = i + 1; k < j; k++) best = Math.min(best, cost[i][k] + cost[k][j]);
                cost[i][j] = best + c[j] - c[i];
            }
        }
        System.out.println(cost[0][size - 1]);`,
      includes: ['<algorithm>', '<climits>']
    },
    solution: { explanation: ['With the ends 0 and n added to the sorted marks, cost(i, j) is the smallest cost of all the cuts strictly between c[i] and c[j]: the length of the piece plus the minimum over the first cut k of cost(i, k) + cost(k, j). The answer is cost of the whole stick.'], complexity: 'Time O(m^3), space O(m^2).' },
    solve(input) {
      const { a: n, arr } = parse2(input); const c = [0, ...[...arr].sort((x, y) => x - y), n]; const memo = new Map(); // top-down with memory
      const go = (i, j) => { if (j - i < 2) return 0; const key = i * 200 + j; if (memo.has(key)) return memo.get(key); let best = Infinity; for (let k = i + 1; k < j; k++) best = Math.min(best, go(i, k) + go(k, j)); best += c[j] - c[i]; memo.set(key, best); return best; };
      return String(go(0, c.length - 1));
    },
    tests() {
      const g = rng(2085); const out = ['7 4\n1 3 4 5\n', '9 5\n5 6 1 4 2\n', '2 1\n1\n', '10 1\n5\n', '9 3\n5 6 1\n'];
      const marks = (n, m) => { const set = new Set(); while (set.size < Math.min(m, n - 1)) set.add(randInt(g, 1, n - 1)); return shuffle(g, [...set]); };
      const brute = (input) => { const { a: n, arr } = parse2(input); const go = (pieces) => { let best = Infinity, any = false; for (let p = 0; p < pieces.length; p++) { const [lo, hi, ms] = pieces[p]; if (!ms.length) continue; any = true; for (const x of ms) { const left = ms.filter((y) => y < x), right = ms.filter((y) => y > x); const rest = pieces.filter((_, q) => q !== p); best = Math.min(best, hi - lo + go([...rest, [lo, x, left], [x, hi, right]])); } break; } return any ? best : 0; }; return String(go([[0, n, arr]])); };
      crossCheck(() => { const n = randInt(g, 2, 14); const ms = marks(n, randInt(g, 1, 5)); return head2(n, ms.length, ms); }, (i) => this.solve(i), brute, 300);
      for (const [n, m] of [[20, 5], [100, 20], [1000, 50], [1000000, 100], [1000000, 150], [1000000, 150], [1000, 150], [160, 150], [151, 150], [1000000, 1]]) { const ms = marks(n, m); out.push(head2(n, ms.length, ms)); }
      out.push(head2(1000000, 150, many(150, (i) => 1 + i)), head2(1000000, 150, many(150, (i) => 1000000 - 1 - i)), head2(1000000, 150, many(150, (i) => 1 + i * 6000)));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of piles.', 'The second line has `n` numbers: the number of stones in each pile.'],
    constraints: ['1 <= n <= 1500', '1 <= each number <= 1000'],
    slug: 'piles-at-the-ends-game',
    title: 'Two Players Take Piles From the Ends: Who Wins by How Much?',
    tags: ['dp', 'interval-dp', 'game-theory', 'minimax'],
    concept: {
      title: 'The value of a position is the difference between the player to move and the other player',
      body: [
        'Piles of stones stand in a row. Two players move in turns; in each turn the player takes **one whole pile from the left end or from the right end** and adds the stones to their own score. The game ends when no pile is left. Both players play perfectly to maximise **their own score minus the score of the other player**. Print the best possible difference for the player who moves first. For the piles `5 3 4 5` the first player gets 9 and the second gets 8: the difference is 1.',
        'Define the state by the remaining piles `i .. j`. Let `diff(i, j)` be the largest value of (score of the player to move) - (score of the other player) that the player to move can force from this state. If the player takes the left pile `a[i]`, the other player moves next in `i + 1 .. j` and gets the advantage `diff(i + 1, j)`, so the advantage of the first one is `a[i] - diff(i + 1, j)`. Taking the right pile gives `a[j] - diff(i, j - 1)`: **`diff(i, j) = max(a[i] - diff(i + 1, j), a[j] - diff(i, j - 1))`**, and `diff(i, i) = a[i]`. This "the opponent plays the same game" recurrence is the whole minimax idea in one line.',
        { code: 'diff = a[:]                                        # length 1: diff(i, i) = a[i]\nfor length in range(2, n + 1):\n    diff = [max(a[i] - diff[i + 1], a[i + length - 1] - diff[i]) for i in range(n - length + 1)]\nprint(diff[0])' },
        'Here `diff[i]` after processing the length `L` stands for `diff(i, i + L - 1)`; the new `diff[i]` needs the old `diff[i + 1]` (the range `i + 1 .. i + L - 1`) and the old `diff[i]` (the range `i .. i + L - 2`), so a single array that shrinks by one each round is enough: O(n^2) time, O(n) memory. If the answer is positive, the first player wins; if it is zero, the game is a draw in points.'
      ]
    },
    statement: ['`n` piles of stones stand in a row. Two players alternately take one pile from the left end or from the right end of the row and add its stones to their own score, until no pile is left. Both play optimally to maximise their own score minus the other\'s score. Print the largest value of (first player\'s score - second player\'s score) that the first player can guarantee.'],
    outputFormat: ['Print the best score difference for the first player.'],
    examples: [{ input: '4\n5 3 4 5\n', note: 'The first player takes 5; whatever the second player does, the first ends with 9 against 8: the difference is 1.' }, { input: '1\n7\n', note: 'One pile: 7.' }],
    hints: ['Let diff(i, j) be the best (mover - opponent) score difference on the piles i to j.', 'Taking the left pile gives a[i] - diff(i + 1, j); taking the right pile gives a[j] - diff(i, j - 1).', 'One array that gets shorter by one each round is enough.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        diff = a[:]
        for length in range(2, n + 1):
            diff = [max(a[i] - diff[i + 1], a[i + length - 1] - diff[i]) for i in range(n - length + 1)]
        print(diff[0])`,
      cpp: r`
        vector<long long> diff = a;
        for (int length = 2; length <= n; length++) {
            for (int i = 0; i + length - 1 < n; i++) {
                diff[i] = max(a[i] - diff[i + 1], a[i + length - 1] - diff[i]);
            }
        }
        cout << diff[0] << "\n";`,
      java: r`
        long[] diff = a.clone();
        for (int length = 2; length <= n; length++) {
            for (int i = 0; i + length - 1 < n; i++) {
                diff[i] = Math.max(a[i] - diff[i + 1], a[i + length - 1] - diff[i]);
            }
        }
        System.out.println(diff[0]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['diff(i, j), the largest (score of the player to move) - (score of the other player) on the piles i..j, is max(a[i] - diff(i + 1, j), a[j] - diff(i, j - 1)) with diff(i, i) = a[i]; a single array shrinking by one per round holds the values of the current length, and diff(0, n - 1) is the answer.'], complexity: 'Time O(n^2), space O(n).' },
    solve(input) {
      const a = nums(rows(input)[1]); const n = a.length; // top-down game search with memory (plain minimax on the total score of the first player)
      const pre = [0]; for (const x of a) pre.push(pre[pre.length - 1] + x); const memo = new Map(); const best = (i, j) => { if (i > j) return 0; const key = i * 2000 + j; if (memo.has(key)) return memo.get(key); const total = pre[j + 1] - pre[i]; const v = Math.max(a[i] + total - a[i] - best(i + 1, j), a[j] + total - a[j] - best(i, j - 1)); memo.set(key, v); return v; };
      const first = best(0, n - 1); return String(2 * first - pre[n]);
    },
    tests() {
      const g = rng(2086); const out = ['4\n5 3 4 5\n', '1\n7\n', '2\n3 9\n', '3\n1 100 1\n'];
      const brute = (input) => { const a = nums(rows(input)[1]); const go = (i, j) => { if (i > j) return 0; return Math.max(a[i] - go(i + 1, j), a[j] - go(i, j - 1)); }; return String(go(0, a.length - 1)); };
      crossCheck(() => { const n = randInt(g, 1, 11); return list(n, randArray(g, n, 1, 20)); }, (i) => this.solve(i), brute, 400);
      for (const [n, hi] of [[10, 20], [100, 100], [500, 1000], [1000, 1000], [1500, 1000], [1500, 1000], [1500, 1], [1500, 5], [1499, 1000]]) out.push(list(n, randArray(g, n, 1, hi)));
      out.push(list(1500, new Array(1500).fill(1000)), list(1500, many(1500, (i) => i % 1000 + 1)), list(1500, many(1500, (i) => (i % 2 ? 1 : 1000))), list(1500, many(1500, (i) => 1000 - Math.floor(i / 2))));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of cities.', 'Each of the next `n` lines has `n` numbers: `dist[i][j]` is the length of the road from the city `i` to the city `j` (the numbers on the diagonal are 0; the roads are one-way and `dist[i][j]` may differ from `dist[j][i]`).'],
    constraints: ['2 <= n <= 13', '1 <= dist[i][j] <= 1000 for i != j'],
    slug: 'shortest-round-trip',
    title: 'The Shortest Round Trip Through All the Cities',
    tags: ['dp', 'bitmask', 'tsp'],
    concept: {
      title: 'A set of visited cities is a number written in binary: the state is (set, last city)',
      body: [
        'A salesman starts in the city 1, visits **every other city exactly once**, and returns to the city 1. The road lengths between the cities are given (they may be different in the two directions). What is the **shortest** round trip? This is the *travelling salesman problem*. Trying all `(n - 1)!` orders is hopeless for 13 cities (479 million orders), but a DP over **subsets of cities** needs only about a million steps.',
        'Write the set of visited cities as a **bitmask**: the bit `v` is 1 if the city `v` has been visited. Let `best(mask, last)` be the shortest length of a path that starts in the city 0, visits exactly the cities of `mask` and **ends in the city `last`** (the city `last` is in `mask`). The path came from some other city `prev` in `mask` without `last`: **`best(mask, last) = min over prev of best(mask without last, prev) + dist[prev][last]`**. At the start `best(only city 0, 0) = 0`. The answer is the minimum over `last` of `best(all cities, last) + dist[last][0]`.',
        { code: 'INF = 10 ** 18\nfull = (1 << n) - 1\nbest = [[INF] * n for _ in range(1 << n)]\nbest[1][0] = 0\nfor mask in range(1, 1 << n):\n    for last in range(n):\n        if best[mask][last] == INF: continue\n        for nxt in range(n):\n            if not mask >> nxt & 1:\n                nm = mask | (1 << nxt)\n                best[nm][nxt] = min(best[nm][nxt], best[mask][last] + dist[last][nxt])\nprint(min(best[full][v] + dist[v][0] for v in range(1, n)))' },
        'Every mask is a smaller number than the masks it leads to (a bit is added), so going through the masks in increasing order is a correct order. There are `2^n * n` states with `n` transitions each: about 1.4 million steps for 13 cities, against 479 million for brute force. Bitmask DP works whenever the "state" is a subset of at most about 20 items.'
      ]
    },
    statement: ['There are `n` cities and a table of one-way road lengths. Starting in the city 1, visit every other city exactly once and return to the city 1. Print the smallest possible total length of such a round trip.'],
    outputFormat: ['Print the smallest total length.'],
    examples: [{ input: '4\n0 10 15 20\n10 0 35 25\n15 35 0 30\n20 25 30 0\n', note: 'The round trip 1, 2, 4, 3, 1 has the length 10 + 25 + 30 + 15 = 80.' }, { input: '2\n0 5\n7 0\n', note: 'There and back: 5 + 7 = 12.' }],
    hints: ['Represent the set of visited cities as a bitmask.', 'best(mask, last) = the shortest path from the city 1 through the cities of mask ending in last.', 'Add the road back to the city 1 at the end and take the minimum.'],
    program: {
      io: ['n:int', 'dist:int[n][n]'],
      fast: true,
      python: r`
        INF = 10 ** 18
        full = (1 << n) - 1
        best = [[INF] * n for _ in range(1 << n)]
        best[1][0] = 0
        for mask in range(1, 1 << n):
            row = best[mask]
            for last in range(n):
                cur = row[last]
                if cur == INF:
                    continue
                d = dist[last]
                for nxt in range(n):
                    if not (mask >> nxt) & 1:
                        nm = mask | (1 << nxt)
                        v = cur + d[nxt]
                        if v < best[nm][nxt]:
                            best[nm][nxt] = v
        print(min(best[full][v] + dist[v][0] for v in range(1, n)))`,
      cpp: r`
        const long long INF = 1000000000000000000LL;
        int cities = (int)n;
        int full = (1 << cities) - 1;
        vector<vector<long long>> best(1 << cities, vector<long long>(cities, INF));
        best[1][0] = 0;
        for (int mask = 1; mask <= full; mask++) {
            for (int last = 0; last < cities; last++) {
                long long cur = best[mask][last];
                if (cur == INF) continue;
                for (int nxt = 0; nxt < cities; nxt++) {
                    if (mask >> nxt & 1) continue;
                    int nm = mask | (1 << nxt);
                    best[nm][nxt] = min(best[nm][nxt], cur + dist[last][nxt]);
                }
            }
        }
        long long answer = INF;
        for (int v = 1; v < cities; v++) answer = min(answer, best[full][v] + dist[v][0]);
        cout << answer << "\n";`,
      java: r`
        final long INF = 1000000000000000000L;
        int cities = (int) n;
        int full = (1 << cities) - 1;
        long[][] best = new long[1 << cities][cities];
        for (long[] row : best) Arrays.fill(row, INF);
        best[1][0] = 0;
        for (int mask = 1; mask <= full; mask++) {
            for (int last = 0; last < cities; last++) {
                long cur = best[mask][last];
                if (cur == INF) continue;
                for (int nxt = 0; nxt < cities; nxt++) {
                    if ((mask >> nxt & 1) != 0) continue;
                    int nm = mask | (1 << nxt);
                    best[nm][nxt] = Math.min(best[nm][nxt], cur + dist[last][nxt]);
                }
            }
        }
        long answer = INF;
        for (int v = 1; v < cities; v++) answer = Math.min(answer, best[full][v] + dist[v][0]);
        System.out.println(answer);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['best(mask, last) is the shortest path that starts in the city 1, visits exactly the cities of the bitmask mask and ends in last; masks are processed in increasing order and every state extends to an unvisited city. The answer is the minimum over last of best(all, last) plus the road back to the city 1.'], complexity: 'Time O(2^n * n^2), space O(2^n * n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const d = many(n, (i) => nums(rs[i + 1])); // top-down with memory over (visited set, current city), counting the remaining trip
      const full = (1 << n) - 1; const memo = new Map(); const go = (mask, cur) => { if (mask === full) return d[cur][0]; const key = mask * 16 + cur; if (memo.has(key)) return memo.get(key); let best = Infinity; for (let nxt = 0; nxt < n; nxt++) if (!(mask >> nxt & 1)) best = Math.min(best, d[cur][nxt] + go(mask | (1 << nxt), nxt)); memo.set(key, best); return best; };
      return String(go(1, 0));
    },
    tests() {
      const g = rng(2087); const out = ['4\n0 10 15 20\n10 0 35 25\n15 35 0 30\n20 25 30 0\n', '2\n0 5\n7 0\n', '3\n0 1 100\n100 0 1\n1 100 0\n'];
      const make = (n, hi, sym) => { const d = many(n, () => new Array(n).fill(0)); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) d[i][j] = (sym && j < i) ? d[j][i] : randInt(g, 1, hi); return `${n}\n${d.map((row) => row.join(' ')).join('\n')}\n`; };
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const d = many(n, (i) => nums(rs[i + 1])); let best = Infinity; for (const perm of permutations(n - 1)) { let len = 0, cur = 0; for (const p of perm) { len += d[cur][p + 1]; cur = p + 1; } len += d[cur][0]; best = Math.min(best, len); } return String(best); };
      crossCheck(() => make(randInt(g, 2, 7), 20, g() < 0.5), (i) => this.solve(i), brute, 300);
      for (const [n, hi, sym] of [[8, 100, true], [10, 1000, false], [12, 1000, true], [13, 1000, false], [13, 1000, true], [13, 10, false], [13, 1, false], [13, 1000, false], [12, 1000, false]]) out.push(make(n, hi, sym));
      out.push(`13\n${many(13, (i) => many(13, (j) => (i === j ? 0 : Math.abs(i - j))).join(' ')).join('\n')}\n`, `13\n${many(13, (i) => many(13, (j) => (i === j ? 0 : 1000)).join(' ')).join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of workers and the number of tasks.', 'Each of the next `n` lines has `n` numbers: `cost[i][j]` is the price of giving the task `j` to the worker `i`.'],
    constraints: ['1 <= n <= 16', '0 <= each cost <= 1000'],
    slug: 'cheapest-task-assignment',
    title: 'Give Every Worker One Task at the Smallest Total Price',
    tags: ['dp', 'bitmask', 'assignment'],
    concept: {
      title: 'Assign the workers in order: the set of used tasks tells how many workers are done',
      body: [
        'There are `n` workers and `n` tasks. Every worker gets **exactly one task** and every task goes to **exactly one worker**; giving the task `j` to the worker `i` costs `cost[i][j]`. Find the assignment with the smallest total cost. For the costs `9 2 7 / 6 4 3 / 5 8 1` the best total is 9 (worker 1 gets task 2, worker 2 gets task 1, worker 3 gets task 3: 2 + 6 + 1). With 16 workers there are 16! = 20 trillion assignments.',
        'Assign the workers **in order**: worker 0 first, then worker 1, and so on. After the first `k` workers have their tasks, what matters for the rest is only **which tasks are taken**, a set of `k` tasks, written as a bitmask. Let `best(mask)` be the smallest cost of giving the tasks in `mask` to the first `popcount(mask)` workers. The worker number `k = popcount(mask)` takes the task `j` that is **not** in `mask`: **`best(mask | (1 << j)) = min(best(mask) + cost[k][j])`**. The answer is `best(all tasks)`. The worker is not part of the state, because the number of tasks taken tells which worker is next.',
        { code: 'INF = 10 ** 18\nbest = [INF] * (1 << n)\nbest[0] = 0\nfor mask in range(1 << n):\n    if best[mask] == INF: continue\n    k = bin(mask).count("1")                  # the next worker\n    if k == n: continue\n    for j in range(n):\n        if not mask >> j & 1:\n            nm = mask | (1 << j)\n            best[nm] = min(best[nm], best[mask] + cost[k][j])\nprint(best[(1 << n) - 1])' },
        'There are `2^n` states with `n` choices each: 1 million steps for 16 workers. Making a quantity (here the number of the worker) a function of the state, instead of an extra dimension, saves a factor of `n` in time and memory. (The *Hungarian algorithm* solves the same problem in O(n^3), which wins for bigger `n`, but the bitmask DP is easier to write and to adapt to extra rules.)'
      ]
    },
    statement: ['There are `n` workers and `n` tasks; giving the task `j` to the worker `i` costs `cost[i][j]`. Each worker gets exactly one task and each task goes to exactly one worker. Print the smallest possible total cost.'],
    outputFormat: ['Print the smallest total cost.'],
    examples: [{ input: '3\n9 2 7\n6 4 3\n5 8 1\n', note: 'Worker 1 takes task 2 (cost 2), worker 2 takes task 1 (6), worker 3 takes task 3 (1): 9.' }, { input: '1\n5\n', note: 'One worker, one task: 5.' }],
    hints: ['Assign the workers in order; the set of taken tasks is a bitmask.', 'The next worker is the one with the number popcount(mask).', 'best(mask | bit j) = min(best(mask) + cost[worker][j]).'],
    program: {
      io: ['n:int', 'cost:int[n][n]'],
      fast: true,
      python: r`
        INF = 10 ** 18
        full = (1 << n) - 1
        best = [INF] * (1 << n)
        best[0] = 0
        for mask in range(full):
            cur = best[mask]
            if cur == INF:
                continue
            k = bin(mask).count("1")
            row = cost[k]
            for j in range(n):
                if not (mask >> j) & 1:
                    nm = mask | (1 << j)
                    v = cur + row[j]
                    if v < best[nm]:
                        best[nm] = v
        print(best[full])`,
      cpp: r`
        const long long INF = 1000000000000000000LL;
        int tasks = (int)n;
        int full = (1 << tasks) - 1;
        vector<long long> best(1 << tasks, INF);
        best[0] = 0;
        for (int mask = 0; mask < full; mask++) {
            long long cur = best[mask];
            if (cur == INF) continue;
            int k = __builtin_popcount(mask);
            for (int j = 0; j < tasks; j++) {
                if (mask >> j & 1) continue;
                int nm = mask | (1 << j);
                best[nm] = min(best[nm], cur + cost[k][j]);
            }
        }
        cout << best[full] << "\n";`,
      java: r`
        final long INF = 1000000000000000000L;
        int tasks = (int) n;
        int full = (1 << tasks) - 1;
        long[] best = new long[1 << tasks];
        Arrays.fill(best, INF);
        best[0] = 0;
        for (int mask = 0; mask < full; mask++) {
            long cur = best[mask];
            if (cur == INF) continue;
            int k = Integer.bitCount(mask);
            for (int j = 0; j < tasks; j++) {
                if ((mask >> j & 1) != 0) continue;
                int nm = mask | (1 << j);
                best[nm] = Math.min(best[nm], cur + cost[k][j]);
            }
        }
        System.out.println(best[full]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['best(mask) is the smallest cost of giving the tasks of the bitmask mask to the first popcount(mask) workers; the next worker takes one of the tasks that are not in the mask, so every state extends to the states with one more task. The answer is best of the full mask.'], complexity: 'Time O(2^n * n), space O(2^n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const cost = many(n, (i) => nums(rs[i + 1])); const memo = new Map(); // top-down with memory: worker w and the set of the tasks still free
      const go = (w, free) => { if (w === n) return 0; const key = w * 65536 + free; if (memo.has(key)) return memo.get(key); let best = Infinity; for (let j = 0; j < n; j++) if (free >> j & 1) best = Math.min(best, cost[w][j] + go(w + 1, free & ~(1 << j))); memo.set(key, best); return best; };
      return String(go(0, (1 << n) - 1));
    },
    tests() {
      const g = rng(2088); const out = ['3\n9 2 7\n6 4 3\n5 8 1\n', '1\n5\n', '2\n1 2\n3 4\n'];
      const make = (n, hi) => `${n}\n${many(n, () => randArray(g, n, 0, hi).join(' ')).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const cost = many(n, (i) => nums(rs[i + 1])); let best = Infinity; for (const perm of permutations(n)) { let s = 0; perm.forEach((j, i) => { s += cost[i][j]; }); best = Math.min(best, s); } return String(best); };
      crossCheck(() => make(randInt(g, 1, 7), 20), (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[6, 100], [10, 1000], [12, 1000], [14, 1000], [16, 1000], [16, 1000], [16, 10], [16, 0], [15, 1000]]) out.push(make(n, hi));
      out.push(`16\n${many(16, (i) => many(16, (j) => (i === j ? 0 : 1000)).join(' ')).join('\n')}\n`, `16\n${many(16, (i) => many(16, (j) => i * j % 17).join(' ')).join('\n')}\n`, `16\n${many(16, () => many(16, () => 1000).join(' ')).join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `k`: the number of numbers and the number of groups.', 'The second line has `n` numbers.'],
    constraints: ['1 <= k <= n <= 16', '1 <= each number <= 10000'],
    slug: 'split-into-k-equal-groups',
    title: 'Can the Numbers Be Split Into k Groups With Equal Sums?',
    tags: ['dp', 'bitmask', 'partition'],
    concept: {
      title: 'Fill the groups one after another and remember only how full the current group is',
      body: [
        'Can a list of numbers be divided into `k` groups (every number in exactly one group) so that all the groups have the **same sum**? For `4 3 2 3 5 2 1` and `k = 4` the answer is yes: `{5}`, `{1, 4}`, `{2, 3}`, `{2, 3}`, each with the sum 5. If the total is not divisible by `k`, or a number is bigger than the target sum `total / k`, the answer is no.',
        'Let the target be `T = total / k`. Fill the groups **one at a time**. A state is the set of numbers already used, as a bitmask `mask`. All the numbers in `mask` form some completed groups and one group that is being filled; the sum of the numbers in `mask` modulo `T` is the **current fill** of that group. Let `ok(mask)` be true if the numbers in `mask` can be arranged this way, i.e. the groups completed so far are exact and the current group has not exceeded `T`. A number `x` not in `mask` can be added if `(sum(mask) mod T) + x <= T`: **`ok(mask | bit) = true` if `ok(mask)` and `sum(mask) mod T + x <= T`**. The answer is `ok(full mask)`.',
        { code: 'total = sum(a)\nif total % k or max(a) > total // k:\n    print("no")\nelse:\n    target = total // k\n    full = (1 << n) - 1\n    ok = [False] * (1 << n)\n    ok[0] = True\n    sums = [0] * (1 << n)\n    for mask in range(full):\n        if not ok[mask]: continue\n        for j in range(n):\n            if not mask >> j & 1 and sums[mask] % target + a[j] <= target:\n                nm = mask | (1 << j)\n                ok[nm] = True\n                sums[nm] = sums[mask] + a[j]\n    print("yes" if ok[full] else "no")' },
        'The sum of a mask is the same whichever way it was reached, so it can be stored once. There are `2^n` states with `n` choices: 1 million steps for 16 numbers. This is the "bin packing with equal bins" idea; the remainder trick avoids keeping the number of finished groups in the state.'
      ]
    },
    statement: ['A list of `n` positive integers and a number `k` are given. Print `yes` if the numbers can be divided into `k` groups (each number in exactly one group, a group is not empty) with equal sums, otherwise print `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '7 4\n4 3 2 3 5 2 1\n', note: 'The groups {5}, {1, 4}, {2, 3}, {2, 3} have the sum 5 each: yes.' }, { input: '4 3\n1 2 3 4\n', note: 'The total 10 is not divisible by 3: no.' }],
    hints: ['If the total is not divisible by k or a number is larger than total / k, the answer is no.', 'The state is the set of used numbers (a bitmask); its sum modulo the target is the fill of the current group.', 'A number can be added if the current fill plus the number does not exceed the target.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      python: r`
        total = sum(a)
        if total % k or max(a) > total // k:
            print("no")
        else:
            target = total // k
            full = (1 << n) - 1
            ok = [False] * (1 << n)
            ok[0] = True
            sums = [0] * (1 << n)
            for mask in range(full):
                if not ok[mask]:
                    continue
                fill = sums[mask] % target
                for j in range(n):
                    if not (mask >> j) & 1 and fill + a[j] <= target:
                        nm = mask | (1 << j)
                        ok[nm] = True
                        sums[nm] = sums[mask] + a[j]
            print("yes" if ok[full] else "no")`,
      cpp: r`
        long long total = 0, biggest = 0;
        for (long long x : a) { total += x; biggest = max(biggest, x); }
        if (total % k != 0 || biggest > total / k) {
            cout << "no\n";
        } else {
            long long target = total / k;
            int count = (int)n;
            int full = (1 << count) - 1;
            vector<char> ok(1 << count, 0);
            vector<long long> sums(1 << count, 0);
            ok[0] = 1;
            for (int mask = 0; mask < full; mask++) {
                if (!ok[mask]) continue;
                long long fill = sums[mask] % target;
                for (int j = 0; j < count; j++) {
                    if (mask >> j & 1) continue;
                    if (fill + a[j] <= target) {
                        int nm = mask | (1 << j);
                        ok[nm] = 1;
                        sums[nm] = sums[mask] + a[j];
                    }
                }
            }
            cout << (ok[full] ? "yes" : "no") << "\n";
        }`,
      java: r`
        long total = 0, biggest = 0;
        for (int i = 0; i < n; i++) {
            total += a[i];
            biggest = Math.max(biggest, a[i]);
        }
        if (total % k != 0 || biggest > total / k) {
            System.out.println("no");
        } else {
            long target = total / k;
            int count = (int) n;
            int full = (1 << count) - 1;
            boolean[] ok = new boolean[1 << count];
            long[] sums = new long[1 << count];
            ok[0] = true;
            for (int mask = 0; mask < full; mask++) {
                if (!ok[mask]) continue;
                long fill = sums[mask] % target;
                for (int j = 0; j < count; j++) {
                    if ((mask >> j & 1) != 0) continue;
                    if (fill + a[j] <= target) {
                        int nm = mask | (1 << j);
                        ok[nm] = true;
                        sums[nm] = sums[mask] + a[j];
                    }
                }
            }
            System.out.println(ok[full] ? "yes" : "no");
        }`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['With the target T = total / k, a state is the set of used numbers; the groups completed so far are exact and the current group is filled to (sum of the set) mod T. A number can be added when the fill plus the number does not exceed T; the answer is whether the full set is reachable.'], complexity: 'Time O(2^n * n), space O(2^n).' },
    solve(input) {
      const { a: n, b: k, arr: a } = parse2(input); const total = a.reduce((x, y) => x + y, 0); if (total % k) return 'no'; const target = total / k; if (Math.max(...a) > target) return 'no'; // a backtracking search that fills the k buckets, with the numbers sorted from the largest
      const sorted = [...a].sort((x, y) => y - x); const buckets = new Array(k).fill(0); const go = (i) => { if (i === n) return true; const seen = new Set(); for (let b = 0; b < k; b++) { if (buckets[b] + sorted[i] > target || seen.has(buckets[b])) continue; seen.add(buckets[b]); buckets[b] += sorted[i]; if (go(i + 1)) return true; buckets[b] -= sorted[i]; } return false; };
      return go(0) ? 'yes' : 'no';
    },
    tests() {
      const g = rng(2089); const out = ['7 4\n4 3 2 3 5 2 1\n', '4 3\n1 2 3 4\n', '1 1\n5\n', '2 2\n3 3\n', '3 3\n1 1 2\n'];
      const brute = (input) => { const { a: n, b: k, arr: a } = parse2(input); const total = a.reduce((x, y) => x + y, 0); if (total % k) return 'no'; const target = total / k; const used = new Array(n).fill(false); const go = (groupsDone, sum, start) => { if (groupsDone === k) return true; if (sum === target) return go(groupsDone + 1, 0, 0); for (let i = start; i < n; i++) if (!used[i] && sum + a[i] <= target) { used[i] = true; if (go(groupsDone, sum + a[i], i + 1)) return true; used[i] = false; } return false; }; return go(0, 0, 0) ? 'yes' : 'no'; };
      crossCheck(() => { const n = randInt(g, 1, 10); return head2(n, randInt(g, 1, Math.min(n, 4)), randArray(g, n, 1, 6)); }, (i) => this.solve(i), brute, 500);
      const planted = (n, k, hi) => { // build k groups with the same sum and shuffle the numbers
        const target = randInt(g, n, hi); const groups = []; let left = n; for (let b = 0; b < k; b++) { const cnt = b === k - 1 ? left : randInt(g, 1, Math.max(1, left - (k - 1 - b))); left -= cnt; const parts = []; let rest = target; for (let i = 0; i < cnt - 1; i++) { const x = randInt(g, 1, Math.max(1, rest - (cnt - 1 - i))); parts.push(x); rest -= x; } parts.push(rest); groups.push(parts); } return shuffle(g, groups.flat()); };
      for (const [n, k, hi] of [[8, 2, 50], [12, 3, 100], [14, 4, 1000], [16, 4, 10000], [16, 2, 10000], [16, 8, 1000], [16, 16, 100]]) { let arr = planted(n, k, hi); arr = arr.filter((x) => x >= 1); if (arr.length === n) out.push(head2(n, k, arr)); }
      for (const [n, k, hi] of [[16, 4, 10000], [16, 3, 10000], [16, 5, 100], [15, 3, 20], [16, 2, 9999]]) out.push(head2(n, k, randArray(g, n, 1, hi)));
      out.push(head2(16, 4, new Array(16).fill(10000)), head2(16, 16, new Array(16).fill(1)), head2(16, 1, new Array(16).fill(10000)), head2(16, 8, many(16, (i) => 1 + (i % 8))));
      return out;
    }
  }
];
