import { r, rng, randInt, randArray, many, arr, nums, rows, mat, shuffle, randDistinct, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const sq = (g, n, m, p) => `${n} ${m}\n${mat(Array.from({ length: n }, () => many(m, () => (g() < p ? 1 : 0))))}`;

export default [
  {
    slug: 'flip-columns-equal-rows',
    title: 'Flip Columns for the Most Equal Rows',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'matrix', 'canonical-form'],
    concept: {
      title: 'Rows that are equal or opposite belong together',
      body: [
        'A matrix of 0s and 1s is given. In one move you flip a whole **column** (every 0 becomes 1 and every 1 becomes 0 in it). You may do this for any set of columns, and then count the rows that consist of **one single value** (all 0 or all 1). What is the largest possible count?',
        'Flipping a column changes the same position in every row. Two rows can be made constant **at the same time** exactly when they are **equal** or **opposite** (every bit differs): then the same flips fix both. So rows fall into classes of "equal or opposite" rows, and the answer is the size of the biggest class.',
        { code: 'key = tuple(bit ^ row[0] for bit in row)      # flip the whole row when its first bit is 1\ncount[key] += 1                                # equal or opposite rows get the same key' },
        'Normalising every row so that its first bit is 0 is the **canonical form** of the class. In C++ and Java the key can be built as a string.'
      ]
    },
    statement: ['You are given a matrix with `n` rows and `m` columns of 0s and 1s. In one move you may flip all values of one column (0 becomes 1 and 1 becomes 0). You may flip any number of columns. After the flips, count the rows in which all values are equal (all 0 or all 1). Print the largest count you can reach.'],
    inputFormat: ['The first line has `n` and `m`.', 'The next `n` lines have `m` values (0 or 1) each.'],
    outputFormat: ['Print the largest number of equal rows.'],
    constraints: ['1 <= n, m <= 300'],
    examples: [{ input: '3 3\n0 0 0\n0 0 1\n1 1 0\n', note: 'Flip the first two columns: the rows become 1 1 0, 1 1 1 and 0 0 0: two rows are constant.' }],
    hints: ['A row can be made constant by flips only when the flipped columns match its pattern.', 'Two rows can be made constant together when they are equal or opposite.', 'Turn every row into a canonical form (flip it if its first bit is 1) and count the equal keys.'],
    program: {
      io: ['n:int m:int', 'g:int[n][m]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        count = {}
        for row in g:
            key = tuple(bit ^ row[0] for bit in row)
            count[key] = count.get(key, 0) + 1
        print(max(count.values()))`,
      cpp: r`
        unordered_map<string, int> count;
        int best = 0;
        for (int i = 0; i < n; i++) {
            string key(m, '0');
            for (int j = 0; j < m; j++) key[j] = (char) ('0' + (g[i][j] ^ g[i][0]));
            best = max(best, ++count[key]);
        }
        cout << best << "\n";`,
      java: r`
        Map<String, Integer> count = new HashMap<>();
        int best = 0;
        for (int i = 0; i < n; i++) {
            StringBuilder key = new StringBuilder();
            for (int j = 0; j < m; j++) key.append(g[i][j] ^ g[i][0]);
            best = Math.max(best, count.merge(key.toString(), 1, Integer::sum));
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Rows that are equal or opposite can be made constant together. Normalising each row so that its first value is 0 gives the same key to the rows of one class; the largest class is the answer.'], complexity: 'Time O(n * m) on average, space O(n * m).' },
    solve(input) { const rs = rows(input); const [n, m] = nums(rs[0]); const c = new Map(); let best = 0; for (let i = 1; i <= n; i++) { const row = nums(rs[i]); const key = row.map((b) => b ^ row[0]).join(''); c.set(key, (c.get(key) || 0) + 1); best = Math.max(best, c.get(key)); } return String(best); },
    tests() {
      const g = rng(421);
      const brute = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); const grid = rs.slice(1, 1 + n).map(nums); let best = 0; for (let mask = 0; mask < (1 << m); mask++) { let c = 0; for (const row of grid) { const v = row.map((b, j) => b ^ ((mask >> j) & 1)); if (v.every((x) => x === v[0])) c++; } best = Math.max(best, c); } return best; };
      crossCheck(() => sq(g, randInt(g, 1, 6), randInt(g, 1, 6), 0.5), (i) => this.solve(i), brute);
      const patterned = (n, m, bases) => { const base = many(bases, () => many(m, () => (g() < 0.5 ? 1 : 0))); const rowsOut = many(n, () => { const b = base[randInt(g, 0, bases - 1)]; const flip = g() < 0.5 ? 1 : 0; return b.map((x) => x ^ flip); }); return `${n} ${m}\n${mat(rowsOut)}`; };
      return ['3 3\n0 0 0\n0 0 1\n1 1 0\n', '1 1\n1\n', '2 1\n0\n1\n', '2 2\n0 1\n1 0\n', sq(g, 8, 8, 0.5), patterned(300, 300, 3), patterned(300, 300, 40), sq(g, 300, 300, 0.5), sq(g, 300, 300, 0.01), patterned(300, 5, 6), sq(g, 300, 4, 0.5)];
    }
  },

  {
    slug: 'longest-arithmetic-subsequence-of-difference',
    title: 'Longest Subsequence With a Fixed Difference',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'dynamic-programming', 'subsequence'],
    concept: {
      title: 'A table indexed by the last value',
      body: [
        'A **subsequence** keeps the order of the elements but may skip some. You look for the longest subsequence in which every element is exactly `d` more than the previous one (`d` can be negative or 0). Let `dp[x]` be the length of the longest such subsequence that **ends with the value `x`**. When you read a new element `x`, the best subsequence ending at `x` extends the best one that ends at `x - d`:',
        { code: 'dp = {}\nbest = 0\nfor x in a:\n    dp[x] = dp.get(x - d, 0) + 1\n    best = max(best, dp[x])' },
        'The values can be huge, so `dp` is a **hash map** (an array indexed by value would be far too big). Because the elements are read from left to right, `dp[x - d]` only contains subsequences that used earlier elements. For `d = 0` the answer is the largest number of equal elements; the formula still works because `dp[x - 0]` is read before `dp[x]` is updated.'
      ]
    },
    statement: ['Given `n` integers and a number `d`, find the length of the longest subsequence (elements in their original order, not necessarily next to each other) in which each element is exactly `d` larger than the one before it.'],
    inputFormat: ['The first line has `n` and `d`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the length.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9', '-10^9 <= d <= 10^9'],
    examples: [{ input: '6 2\n1 5 7 8 5 3\n', note: 'The subsequences 5 7 and 1 3 have length 2; there is no subsequence of length 3.' }],
    hints: ['Let dp[x] be the longest valid subsequence ending with value x.', 'A new element x extends the best subsequence that ends with x - d.', 'Use a hash map for dp, since the values are large.'],
    program: {
      io: ['n:int d:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        dp = {}
        best = 0
        for x in a:
            dp[x] = dp.get(x - d, 0) + 1
            best = max(best, dp[x])
        print(best)`,
      cpp: r`
        unordered_map<long long, int> dp;
        int best = 0;
        for (int i = 0; i < n; i++) {
            auto it = dp.find(a[i] - d);
            int length = (it == dp.end() ? 0 : it->second) + 1;
            dp[a[i]] = length;
            best = max(best, length);
        }
        cout << best << "\n";`,
      java: r`
        Map<Long, Integer> dp = new HashMap<>();
        int best = 0;
        for (int i = 0; i < n; i++) {
            int length = dp.getOrDefault(a[i] - d, 0) + 1;
            dp.put(a[i], length);
            best = Math.max(best, length);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['`dp[x]` is the longest valid subsequence ending with `x`; a new element extends the one ending with `x - d`. The map holds `dp`, and the best value seen is the answer.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); return String(fastArith(nums(rs[1]), nums(rs[0])[1])); },
    tests() {
      const g = rng(422);
      const make = (n, lo, hi, d) => `${n} ${d}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const slow = (a, d) => { const dp = a.map(() => 1); let best = 0; for (let i = 0; i < a.length; i++) { for (let j = 0; j < i; j++) if (a[i] - a[j] === d) dp[i] = Math.max(dp[i], dp[j] + 1); best = Math.max(best, dp[i]); } return best; };
      for (let t = 0; t < 200; t++) { const n = randInt(g, 1, 10), d = randInt(g, -3, 3); const a = randArray(g, n, -6, 6); const input = `${n} ${d}\n${a.join(' ')}\n`; if (this.solve(input) !== String(slow(a, d))) throw new Error('subsequence reference differs from the quadratic dp'); }
      const progression = (n, d) => `${n} ${d}\n${many(n, (i) => -1000000000 + i * d).join(' ')}\n`;
      return ['6 2\n1 5 7 8 5 3\n', '1 5\n3\n', '4 0\n7 7 7 7\n', '5 -1\n5 4 3 2 1\n', '5 1\n5 4 3 2 1\n', make(20, -5, 5, 1), make(2000, -100, 100, 3), make(20000, -1000000000, 1000000000, 7), make(20000, -50, 50, 0), make(20000, -300, 300, -2), progression(20000, 99999), `20000 5\n${shuffle(g, many(20000, (i) => i * 5)).join(' ')}\n`];
    }
  },

  {
    slug: 'interchangeable-rectangles',
    title: 'Rectangles With the Same Shape',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'gcd', 'counting'],
    concept: {
      title: 'The ratio as a reduced fraction',
      body: [
        'Two rectangles have the same shape when their width to height ratios are equal: `w1 / h1 = w2 / h2`. Dividing the numbers gives decimals, which are inexact (`1 / 3` cannot be stored exactly) and different pairs can look alike. Use the **reduced fraction** as the key: divide both `w` and `h` by `gcd(w, h)`. Two ratios are equal exactly when their reduced fractions are equal.',
        { code: 'g = gcd(w, h)\nkey = (w // g, h // g)\ntotal += count.get(key, 0)           # a pair with every earlier rectangle of this shape\ncount[key] = count.get(key, 0) + 1' },
        'Whenever a "ratio" has to be compared exactly, think of the **reduced fraction** as a hashable key. The same idea is used for slopes of lines. In C++ and Java the pair of numbers can be packed into one 64-bit number, because both parts are below 10^9 + 7.'
      ]
    },
    statement: ['You are given `n` rectangles with the width `w` and the height `h`. Two rectangles are interchangeable if `w1 / h1 = w2 / h2`. Count the pairs of positions `i < j` of interchangeable rectangles.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has `w` and `h`.'],
    outputFormat: ['Print the number of pairs.'],
    constraints: ['1 <= n <= 20000', '1 <= w, h <= 10^9'],
    examples: [{ input: '4\n4 8\n3 6\n10 20\n15 30\n', note: 'All four have the ratio 1 : 2: there are 6 pairs.' }],
    hints: ['Do not use decimal division: it is inexact.', 'Divide width and height by their gcd to get a reduced fraction.', 'Count equal fractions with a map, adding the earlier count for every rectangle.'],
    program: {
      io: ['n:int', 'rect:int[n][2]'],
      fast: true,
      includes: ['<unordered_map>'],
      helpers: {
        cpp: r`
          long long gcdOf(long long a, long long b) {
              while (b != 0) {
                  long long t = a % b;
                  a = b;
                  b = t;
              }
              return a;
          }`,
        java: r`
          static long gcdOf(long a, long b) {
              while (b != 0) {
                  long t = a % b;
                  a = b;
                  b = t;
              }
              return a;
          }`
      },
      python: r`
        from math import gcd
        count = {}
        total = 0
        for w, h in rect:
            g = gcd(w, h)
            key = (w // g, h // g)
            total += count.get(key, 0)
            count[key] = count.get(key, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> count;
        long long total = 0;
        for (int i = 0; i < n; i++) {
            long long g = gcdOf(rect[i][0], rect[i][1]);
            long long key = (rect[i][0] / g) * 1000000007LL + rect[i][1] / g;
            total += count[key];
            count[key]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> count = new HashMap<>();
        long total = 0;
        for (int i = 0; i < n; i++) {
            long g = gcdOf(rect[i][0], rect[i][1]);
            long key = (rect[i][0] / g) * 1000000007L + rect[i][1] / g;
            total += count.getOrDefault(key, 0L);
            count.merge(key, 1L, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['The reduced fraction `(w / g, h / g)` is an exact key for the ratio; each rectangle pairs with all earlier rectangles with the same key.'], complexity: 'Time O(n log C) on average, space O(n).' },
    solve(input) { const d = rows(input).slice(1).map(nums); const c = new Map(); for (const [w, h] of d) { const g = gcd(w, h); const k = `${w / g},${h / g}`; c.set(k, (c.get(k) || 0) + 1); } let t = 0; for (const k of c.values()) t += (k * (k - 1)) / 2; return String(t); },
    tests() {
      const g = rng(423);
      const make = (n, hi) => `${n}\n${many(n, () => `${randInt(g, 1, hi)} ${randInt(g, 1, hi)}`).join('\n')}\n`;
      const shapes = (n, k, scale) => { const base = many(k, () => [randInt(g, 1, 1000), randInt(g, 1, 1000)]); return `${n}\n${many(n, () => { const [a, b] = base[randInt(g, 0, k - 1)]; const m = randInt(g, 1, scale); return `${a * m} ${b * m}`; }).join('\n')}\n`; };
      return ['4\n4 8\n3 6\n10 20\n15 30\n', '1\n1 1\n', '2\n1 3\n2 6\n', '2\n1 3\n3 1\n', make(20, 4), make(2000, 20), make(20000, 1000000000), shapes(20000, 50, 1000000), shapes(20000, 3, 1000000), shapes(20000, 20000, 1000), `20000\n${many(20000, (i) => `${1000000000 - i} ${1000000000 - i}`).join('\n')}\n`];
    }
  },

  {
    slug: 'reduce-x-to-zero',
    title: 'Take From the Ends to Reach Exactly x',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'prefix-sum', 'complement'],
    concept: {
      title: 'What stays in the middle is a block',
      body: [
        'In one operation you remove either the first or the last element and subtract it from `x`. You must make `x` exactly zero with as **few** operations as possible. The removed elements are a **prefix** and a **suffix** of the array, so what remains in the middle is a block of consecutive elements. The removed elements add up to `x`, so the block has the sum `total - x`.',
        'Fewest removals means the **longest block with sum `total - x`**. All numbers are positive, but you can also solve it with prefix sums and a hash map of first positions, as in the "longest block with sum k" problem.',
        { code: 'target = total - x\nfirst = {0: -1}\nlongest = -1\nfor i, v in enumerate(a):\n    cur += v\n    if cur - target in first: longest = max(longest, i - first[cur - target])\n    first.setdefault(cur, i)\nanswer = n - longest if longest >= 0 else -1' },
        'If `target = 0`, the middle block is empty and all `n` elements are removed (this works only when the total is exactly `x`). If `target < 0`, even removing everything is not enough.'
      ]
    },
    statement: ['You are given `n` positive integers and a number `x`. In one operation you remove the first or the last element of the array and subtract its value from `x`. Print the smallest number of operations after which `x` is exactly 0, or -1 if this is impossible.'],
    inputFormat: ['The first line has `n` and `x`.', 'The second line has `n` positive integers.'],
    outputFormat: ['Print the smallest number of operations, or -1.'],
    constraints: ['1 <= n <= 20000', '1 <= each number <= 10^9', '1 <= x <= 2 * 10^13'],
    examples: [{ input: '5 5\n3 2 20 1 1\n', note: 'Remove the first two elements 3 and 2: they add up to 5 in 2 operations.' }],
    hints: ['The elements that stay form a block in the middle.', 'That block has the sum `total - x`; you want it as long as possible.', 'Use prefix sums and a map of the first position of every prefix sum.'],
    program: {
      io: ['n:int x:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        total = sum(a)
        target = total - x
        if target < 0:
            print(-1)
        elif target == 0:
            print(n)
        else:
            first = {0: -1}
            cur = 0
            longest = -1
            for i in range(n):
                cur += a[i]
                if cur - target in first:
                    longest = max(longest, i - first[cur - target])
                if cur not in first:
                    first[cur] = i
            print(n - longest if longest >= 0 else -1)`,
      cpp: r`
        long long total = 0;
        for (int i = 0; i < n; i++) total += a[i];
        long long target = total - x;
        if (target < 0) {
            cout << -1 << "\n";
        } else if (target == 0) {
            cout << n << "\n";
        } else {
            unordered_map<long long, int> first;
            first[0] = -1;
            long long cur = 0;
            int longest = -1;
            for (int i = 0; i < n; i++) {
                cur += a[i];
                auto it = first.find(cur - target);
                if (it != first.end()) longest = max(longest, i - it->second);
                if (!first.count(cur)) first[cur] = i;
            }
            cout << (longest >= 0 ? n - longest : -1) << "\n";
        }`,
      java: r`
        long total = 0;
        for (int i = 0; i < n; i++) total += a[i];
        long target = total - x;
        if (target < 0) {
            System.out.println(-1);
        } else if (target == 0) {
            System.out.println(n);
        } else {
            Map<Long, Integer> first = new HashMap<>();
            first.put(0L, -1);
            long cur = 0;
            int longest = -1;
            for (int i = 0; i < n; i++) {
                cur += a[i];
                Integer start = first.get(cur - target);
                if (start != null) longest = Math.max(longest, i - start);
                first.putIfAbsent(cur, i);
            }
            System.out.println(longest >= 0 ? n - longest : -1);
        }`
    },
    solution: { explanation: ['The removed elements are a prefix and a suffix, so the rest is a block with sum `total - x`. The longest such block (first-position map of prefix sums) gives the fewest operations.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const x = nums(rs[0])[1]; const a = nums(rs[1]); const n = a.length; const total = a.reduce((s, v) => s + v, 0); let best = Infinity; let pre = 0; const ends = [0]; for (const v of a) { pre += v; ends.push(pre); } if (total < x) return '-1'; const pos = new Map(); ends.forEach((s, i) => { if (!pos.has(s)) pos.set(s, i); }); for (let i = 0; i <= n; i++) { const need = x - ends[i]; if (need < 0) break; const suffix = total - need; if (pos.has(suffix) && pos.get(suffix) >= i) best = Math.min(best, i + (n - pos.get(suffix))); } return best === Infinity ? '-1' : String(best); },
    tests() {
      const g = rng(424);
      const make = (n, hi, mode) => { const a = randArray(g, n, 1, hi); const total = a.reduce((s, v) => s + v, 0); const x = mode === 'all' ? total : mode === 'big' ? total + 1 : mode === 'edge' ? a[0] + a[n - 1] : randInt(g, 1, Math.max(1, total)); return `${n} ${x}\n${a.join(' ')}\n`; };
      const brute = (input) => { const rs = rows(input); const x = nums(rs[0])[1]; const a = nums(rs[1]); const n = a.length; let best = Infinity; for (let i = 0; i <= n; i++) for (let j = 0; i + j <= n; j++) { let s = 0; for (let k = 0; k < i; k++) s += a[k]; for (let k = 0; k < j; k++) s += a[n - 1 - k]; if (s === x) best = Math.min(best, i + j); } return best === Infinity ? -1 : best; };
      crossCheck(() => make(randInt(g, 1, 8), 6, ['all', 'big', 'edge', 'r'][randInt(g, 0, 3)]), (i) => this.solve(i), brute);
      const exact = (n, hi) => { const a = randArray(g, n, 1, hi); const l = randInt(g, 0, n - 1), rr = randInt(g, l, n - 1); const x = a.reduce((s, v, i) => (i < l || i > rr ? s + v : s), 0); return `${n} ${Math.max(1, x)}\n${a.join(' ')}\n`; };
      return ['5 5\n3 2 20 1 1\n', '1 1\n1\n', '1 2\n1\n', '3 6\n1 2 3\n', '4 100\n1 1 1 1\n', make(15, 10, 'r'), make(2000, 1000, 'r'), exact(20000, 1000000000), exact(20000, 100), make(20000, 1000000000, 'all'), make(20000, 1000000000, 'big'), exact(20000, 1000000000)];
    }
  },

  {
    slug: 'equal-xor-triplets',
    title: 'Triplets With Equal Xor on Both Sides',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'prefix-xor', 'counting'],
    concept: {
      title: 'Equal prefix xors, and the number of ways to place the middle',
      body: [
        'Count the triples `(i, j, k)` with `i < j <= k` for which the xor of `a[i..j-1]` equals the xor of `a[j..k]`. If the two xors are equal, the xor of the whole block `a[i..k]` is `0` (because `x ^ x = 0`). With **prefix xors** `P`, the block `a[i..k]` has xor `P[i] ^ P[k+1]`, which is 0 exactly when `P[i] = P[k+1]`.',
        'For such a pair of prefix positions `i < t` (where `t = k + 1`), the middle index `j` can be **any** of `i + 1, ..., t - 1`, which gives `t - i - 1` triples. So every pair of equal prefix xors with indexes `i < t` contributes `t - i - 1`. Summing over all earlier `i` for each `t` is possible without looking at them one by one: keep, for each prefix value, **how many times it occurred** and the **sum of the indexes** where it occurred.',
        { code: 'count = {0: 1}; index_sum = {0: 0}\nfor t in range(1, n + 1):\n    px ^= a[t - 1]\n    c = count.get(px, 0)\n    total += c * (t - 1) - index_sum.get(px, 0)       # sum over earlier i of (t - i - 1)\n    count[px] = c + 1; index_sum[px] = index_sum.get(px, 0) + t' },
        'The answer can be as large as `n^3 / 6`, so use 64-bit integers.'
      ]
    },
    statement: ['Given an array of `n` non-negative integers, count the triples of positions `(i, j, k)` with `i < j <= k` (counting from 1) such that the xor of `a[i], ..., a[j-1]` equals the xor of `a[j], ..., a[k]`.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of triples.'],
    constraints: ['1 <= n <= 20000', '0 <= each number <= 10^8'],
    examples: [{ input: '5\n2 3 1 6 7\n', note: 'The blocks 2 3 1 and 1 6 7 each have xor 0 and can be split in two ways: the triples (1, 2, 3), (1, 3, 3), (3, 4, 5) and (3, 5, 5).' }],
    hints: ['If both xors are equal, the whole block has xor 0.', 'Use prefix xors: the block has xor 0 when two prefix xors are equal.', 'Equal prefixes at positions i < t allow `t - i - 1` choices for the middle position. Keep the count and the index sum of every prefix value.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {0: 1}
        indexSum = {0: 0}
        px = 0
        total = 0
        for t in range(1, n + 1):
            px ^= a[t - 1]
            c = count.get(px, 0)
            total += c * (t - 1) - indexSum.get(px, 0)
            count[px] = c + 1
            indexSum[px] = indexSum.get(px, 0) + t
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> count, indexSum;
        count[0] = 1;
        indexSum[0] = 0;
        long long px = 0, total = 0;
        for (long long t = 1; t <= n; t++) {
            px ^= a[t - 1];
            long long c = count[px];
            total += c * (t - 1) - indexSum[px];
            count[px] = c + 1;
            indexSum[px] += t;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> count = new HashMap<>(), indexSum = new HashMap<>();
        count.put(0L, 1L);
        indexSum.put(0L, 0L);
        long px = 0, total = 0;
        for (int t = 1; t <= n; t++) {
            px ^= a[t - 1];
            long c = count.getOrDefault(px, 0L);
            total += c * (t - 1) - indexSum.getOrDefault(px, 0L);
            count.put(px, c + 1);
            indexSum.merge(px, (long) t, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Equal prefix xors at positions `i < t` give `t - i - 1` triples. A map of counts and a map of index sums add the contribution of all earlier equal prefixes at once.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const px = [0]; for (const x of a) px.push(px[px.length - 1] ^ x); const cnt = new Map(), sum = new Map(); let t = 0; for (let k = 0; k <= a.length; k++) { const v = px[k]; const c = cnt.get(v) || 0; if (k > 0) t += c * (k - 1) - (sum.get(v) || 0); cnt.set(v, c + 1); sum.set(v, (sum.get(v) || 0) + k); } return String(t); },
    tests() {
      const g = rng(425);
      const brute = (i) => { const a = nums(rows(i)[1]); let t = 0; for (let x = 0; x < a.length; x++) for (let y = x + 1; y < a.length + 0; y++) for (let z = y; z < a.length; z++) { let l = 0, rr = 0; for (let q = x; q < y; q++) l ^= a[q]; for (let q = y; q <= z; q++) rr ^= a[q]; if (l === rr) t++; } return t; };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 10), 0, 3)), (i) => this.solve(i), brute);
      return ['5\n2 3 1 6 7\n', '1\n5\n', '2\n1 1\n', '3\n0 0 0\n', arr(randArray(g, 30, 0, 3)), arr(randArray(g, 2000, 0, 100)), arr(randArray(g, 20000, 0, 100000000)), arr(randArray(g, 20000, 0, 1)), arr(randArray(g, 20000, 0, 7)), arr(Array(20000).fill(0)), arr(many(20000, (i) => i % 2 ? 5 : 5))];
    }
  },

  {
    slug: 'count-submatrices-with-sum',
    title: 'Rectangles With a Given Sum',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'matrix', 'prefix-sum'],
    concept: {
      title: 'Fix two rows and reduce it to a block-sum problem',
      body: [
        'Count the rectangular parts (submatrices) of a matrix whose cells add up to `target`. Fix a **top row** and a **bottom row**. Add the rows between them (inclusive) column by column: `colSum[j]` is the sum of column `j` between the two rows. A rectangle between these rows is a block of consecutive columns, and its sum is the sum of that block in `colSum`.',
        'So for every pair of rows you must count the blocks with sum `target` in a one-dimensional array of `m` numbers. That is exactly the problem "count the blocks with sum `k`", which prefix sums and a hash map solve in O(m):',
        { code: 'for top in range(n):\n    colSum = [0] * m\n    for bottom in range(top, n):\n        for j in range(m): colSum[j] += g[bottom][j]\n        count = {0: 1}; prefix = 0\n        for x in colSum:\n            prefix += x\n            total += count.get(prefix - target, 0)\n            count[prefix] = count.get(prefix, 0) + 1' },
        'The whole algorithm is O(n^2 * m). Moving `bottom` down by one row only adds one row to `colSum`. The number of rectangles can be as large as about `(n * m)^2 / 4`, so use 64-bit integers.'
      ]
    },
    statement: ['Given a matrix with `n` rows and `m` columns of integers (possibly negative) and a number `target`, count the rectangular submatrices (made of consecutive rows and consecutive columns, at least one cell) whose cells add up to exactly `target`.'],
    inputFormat: ['The first line has `n`, `m` and `target`.', 'The next `n` lines have `m` integers each.'],
    outputFormat: ['Print the number of submatrices.'],
    constraints: ['1 <= n, m <= 100', '-10^4 <= each number <= 10^4', '-10^9 <= target <= 10^9'],
    examples: [{ input: '3 3 0\n0 1 0\n1 1 1\n0 1 0\n', note: 'Only the four corner cells (value 0) have sum 0; every larger rectangle contains a 1.' }],
    hints: ['Fix a top and a bottom row and add the rows column by column.', 'Count the blocks with sum `target` in the resulting array of column sums.', 'For that use prefix sums and a map of how often each prefix sum occurred.'],
    program: {
      io: ['n:int m:int target:int', 'g:int[n][m]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        total = 0
        for top in range(n):
            colSum = [0] * m
            for bottom in range(top, n):
                row = g[bottom]
                for j in range(m):
                    colSum[j] += row[j]
                count = {0: 1}
                prefix = 0
                for x in colSum:
                    prefix += x
                    total += count.get(prefix - target, 0)
                    count[prefix] = count.get(prefix, 0) + 1
        print(total)`,
      cpp: r`
        long long total = 0;
        unordered_map<long long, int> count;
        for (int top = 0; top < n; top++) {
            vector<long long> colSum(m, 0);
            for (int bottom = top; bottom < n; bottom++) {
                for (int j = 0; j < m; j++) colSum[j] += g[bottom][j];
                count.clear();
                count[0] = 1;
                long long prefix = 0;
                for (int j = 0; j < m; j++) {
                    prefix += colSum[j];
                    auto it = count.find(prefix - target);
                    if (it != count.end()) total += it->second;
                    count[prefix]++;
                }
            }
        }
        cout << total << "\n";`,
      java: r`
        long total = 0;
        for (int top = 0; top < n; top++) {
            long[] colSum = new long[(int) m];
            for (int bottom = top; bottom < n; bottom++) {
                for (int j = 0; j < m; j++) colSum[j] += g[bottom][j];
                Map<Long, Integer> count = new HashMap<>();
                count.put(0L, 1);
                long prefix = 0;
                for (int j = 0; j < m; j++) {
                    prefix += colSum[j];
                    total += count.getOrDefault(prefix - target, 0);
                    count.merge(prefix, 1, Integer::sum);
                }
            }
        }
        System.out.println(total);`
    },
    solution: { explanation: ['For every pair of rows the column sums form an array, and the rectangles between those rows are its blocks; blocks with sum `target` are counted with prefix sums and a map.'], complexity: 'Time O(n^2 * m) on average, space O(m).' },
    solve(input) { const rs = rows(input); const [n, m, target] = nums(rs[0]); const g = rs.slice(1, 1 + n).map(nums); let total = 0; for (let top = 0; top < n; top++) { const col = new Array(m).fill(0); for (let bottom = top; bottom < n; bottom++) { for (let j = 0; j < m; j++) col[j] += g[bottom][j]; const cnt = new Map([[0, 1]]); let p = 0; for (const x of col) { p += x; total += cnt.get(p - target) || 0; cnt.set(p, (cnt.get(p) || 0) + 1); } } } return String(total); },
    tests() {
      const g = rng(426);
      const make = (n, m, lo, hi, target) => `${n} ${m} ${target}\n${mat(Array.from({ length: n }, () => randArray(g, m, lo, hi)))}`;
      const brute = (input) => { const rs = rows(input); const [n, m, target] = nums(rs[0]); const gr = rs.slice(1, 1 + n).map(nums); let t = 0; for (let r1 = 0; r1 < n; r1++) for (let r2 = r1; r2 < n; r2++) for (let c1 = 0; c1 < m; c1++) for (let c2 = c1; c2 < m; c2++) { let s = 0; for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) s += gr[i][j]; if (s === target) t++; } return t; };
      crossCheck(() => make(randInt(g, 1, 5), randInt(g, 1, 5), -2, 2, randInt(g, -3, 3)), (i) => this.solve(i), brute);
      return ['3 3 0\n0 1 0\n1 1 1\n0 1 0\n', '1 1 5\n5\n', '1 1 4\n5\n', '2 2 0\n0 0\n0 0\n', make(6, 7, -5, 5, 3), make(30, 30, -3, 3, 0), make(100, 100, -10000, 10000, 12345), make(100, 100, 0, 1, 10), make(100, 100, 0, 1, 0), make(100, 100, -1, 1, 0), make(100, 100, 0, 0, 0)];
    }
  },

  {
    slug: 'squares-on-a-grid',
    title: 'Count the Squares Through a Query Point',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'geometry', 'design'],
    concept: {
      title: 'Store the points, answer each query from one column',
      body: [
        'You get a mixed list of operations: add a point (the same point may be added many times), or ask how many **axis-parallel squares with positive area** can be formed with the query point as one corner and three stored points as the other corners (a point added twice can be used as either copy, and the counts multiply).',
        'Keep a map from every point to **how many copies** were added, and for every `x` the list of the points with this `x` (a "column"). For a query `(x, y)`: every stored point `(x, y2)` in the same column with `y2 != y` is a **vertical neighbour** at distance `d = |y2 - y|`. The square on its right has the other two corners `(x + d, y)` and `(x + d, y2)`, and the square on its left has `(x - d, y)` and `(x - d, y2)`.',
        { code: 'for y2, c in column[x].items():\n    if y2 != y:\n        d = abs(y2 - y)\n        for dx in (d, -d):\n            total += c * count.get((x + dx, y), 0) * count.get((x + dx, y2), 0)' },
        'Each square has exactly one corner above or below the query point in its column, so it is counted once. Looking at only one column instead of all stored points makes every query fast. This kind of problem is called a **design** problem: you decide what to store so that each operation is quick.'
      ]
    },
    statement: ['You process `n` operations, in order. `A x y` adds the point `(x, y)` to a collection (the same point may be added several times). `Q x y` asks: how many ways are there to choose three points from the collection that, together with `(x, y)`, are the four corners of a square whose sides are parallel to the axes and whose area is positive? Different copies of the same point count as different choices. The query point itself is not added to the collection. Print the answer of every `Q` operation, one per line.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has `A` or `Q`, and then the numbers `x` and `y`.'],
    outputFormat: ['One line with the answer for every `Q` operation, in order.'],
    constraints: ['1 <= n <= 2000', '0 <= x, y <= 1000', 'There is at least one `Q` operation.'],
    examples: [{ input: '7\nA 3 10\nA 11 2\nA 3 2\nQ 11 10\nQ 14 8\nA 11 2\nQ 11 10\n', note: 'The first query finds the square (11,10), (3,10), (3,2), (11,2): 1 way. The point (14, 8) has no square: 0. After a second copy of (11, 2) is added, the last query has 2 ways.' }],
    hints: ['Keep a count for every point and a list of the points in every column.', 'A point in the query column at distance d gives two possible squares: to the right and to the left.', 'Multiply the counts of the three other corners; sum over all points of the column.'],
    program: {
      io: ['n:int', 'ops:word[n][3]'],
      includes: ['<unordered_map>', '<map>', '<cstdlib>'],
      helpers: {
        cpp: r`
          long long pointKey(long long x, long long y) {
              return (x + 5000) * 20000 + (y + 5000);
          }`,
        java: r`
          static long pointKey(long x, long y) {
              return (x + 5000) * 20000 + (y + 5000);
          }`
      },
      python: r`
        count = {}
        columns = {}
        out = []
        for op, xs, ys in ops:
            x, y = int(xs), int(ys)
            if op == "A":
                count[(x, y)] = count.get((x, y), 0) + 1
                column = columns.setdefault(x, {})
                column[y] = column.get(y, 0) + 1
            else:
                total = 0
                for y2, c in columns.get(x, {}).items():
                    if y2 != y:
                        d = abs(y2 - y)
                        for dx in (d, -d):
                            total += c * count.get((x + dx, y), 0) * count.get((x + dx, y2), 0)
                out.append(total)
        print("\n".join(map(str, out)))`,
      cpp: r`
        unordered_map<long long, long long> count;
        vector<map<int, long long>> columns(1001);
        for (int i = 0; i < n; i++) {
            long long x = stoll(ops[i][1]), y = stoll(ops[i][2]);
            if (ops[i][0] == "A") {
                count[pointKey(x, y)]++;
                columns[x][y]++;
            } else {
                long long total = 0;
                for (auto& entry : columns[x]) {
                    long long y2 = entry.first, c = entry.second;
                    if (y2 == y) continue;
                    long long d = llabs(y2 - y);
                    for (int sign = -1; sign <= 1; sign += 2) {
                        auto a = count.find(pointKey(x + sign * d, y));
                        auto b = count.find(pointKey(x + sign * d, y2));
                        if (a != count.end() && b != count.end()) total += c * a->second * b->second;
                    }
                }
                cout << total << "\n";
            }
        }`,
      java: r`
        Map<Long, Long> count = new HashMap<>();
        List<Map<Long, Long>> columns = new ArrayList<>();
        for (int i = 0; i <= 1000; i++) columns.add(new HashMap<>());
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            long x = Long.parseLong(ops[i][1]), y = Long.parseLong(ops[i][2]);
            if (ops[i][0].equals("A")) {
                count.merge(pointKey(x, y), 1L, Long::sum);
                columns.get((int) x).merge(y, 1L, Long::sum);
            } else {
                long total = 0;
                for (Map.Entry<Long, Long> entry : columns.get((int) x).entrySet()) {
                    long y2 = entry.getKey(), c = entry.getValue();
                    if (y2 == y) continue;
                    long d = Math.abs(y2 - y);
                    for (int sign = -1; sign <= 1; sign += 2) {
                        total += c * count.getOrDefault(pointKey(x + sign * d, y), 0L) * count.getOrDefault(pointKey(x + sign * d, y2), 0L);
                    }
                }
                sb.append(total).append("\n");
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Every square through the query point has exactly one other corner in the query column. For each such neighbour the two squares to its left and right are counted by multiplying the copies of the three other corners.'], complexity: 'Time O(n) per query on average, space O(n).' },
    solve(input) { const ops = rows(input).slice(1).map((l) => l.split(' ')); const cnt = new Map(); const out = []; for (const [op, xs, ys] of ops) { const x = +xs, y = +ys; if (op === 'A') cnt.set(`${x},${y}`, (cnt.get(`${x},${y}`) || 0) + 1); else { let t = 0; for (const [k, c] of cnt) { const [px, py] = k.split(',').map(Number); if (Math.abs(px - x) === Math.abs(py - y) && px !== x) t += c * (cnt.get(`${x},${py}`) || 0) * (cnt.get(`${px},${y}`) || 0); } out.push(t); } } return out.join('\n'); },
    tests() {
      const g = rng(427);
      const make = (n, span, qRate) => `${n}\n${many(n, (i) => `${i === n - 1 || g() < qRate ? 'Q' : 'A'} ${randInt(g, 0, span)} ${randInt(g, 0, span)}`).join('\n')}\n`;
      const brute = (input) => { const ops = rows(input).slice(1).map((l) => l.split(' ')); const pts = []; const out = []; for (const [op, xs, ys] of ops) { const x = +xs, y = +ys; if (op === 'A') { pts.push([x, y]); continue; } let t = 0; const m = pts.length; for (let a = 0; a < m; a++) for (let b = a + 1; b < m; b++) for (let c = b + 1; c < m; c++) { const P = [pts[a], pts[b], pts[c], [x, y]]; const xsS = [...new Set(P.map((q) => q[0]))].sort((p, q) => p - q), ysS = [...new Set(P.map((q) => q[1]))].sort((p, q) => p - q); if (xsS.length !== 2 || ysS.length !== 2 || xsS[1] - xsS[0] !== ysS[1] - ysS[0]) continue; if (new Set(P.map((q) => q.join(','))).size === 4) t++; } out.push(t); } return out.join('\n'); };
      crossCheck(() => make(randInt(g, 1, 12), 3, 0.3), (i) => this.solve(i), brute, 120);
      const lattice = (side) => { const lines = []; for (let x = 0; x < side; x++) for (let y = 0; y < side; y++) lines.push(`A ${x * 30} ${y * 30}`); const q = many(2000 - lines.length, () => `Q ${randInt(g, 0, side - 1) * 30} ${randInt(g, 0, side - 1) * 30}`); return `${lines.length + q.length}\n${[...lines, ...q].join('\n')}\n`; };
      return ['7\nA 3 10\nA 11 2\nA 3 2\nQ 11 10\nQ 14 8\nA 11 2\nQ 11 10\n', '1\nQ 0 0\n', '4\nA 1 1\nA 2 2\nA 1 2\nQ 2 1\n', make(40, 4, 0.3), make(300, 15, 0.3), make(2000, 1000, 0.3), make(2000, 40, 0.3), make(2000, 12, 0.5), lattice(30), make(2000, 5, 0.2)];
    }
  },

  {
    slug: 'tuples-with-same-product',
    title: 'Four Numbers With Equal Products',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'counting', 'combinatorics'],
    concept: {
      title: 'Count the pairs of every product, then pair up the pairs',
      body: [
        'Count the tuples `(a, b, c, d)` of **four different elements** with `a * b = c * d`. Instead of four nested loops, compute the product of **every pair** of elements (`n^2 / 2` pairs) and count in a map how many pairs give each product. Two different pairs with the same product `p` form a valid combination: if `x * y = z * w`, then `x, y, z, w` are four different numbers, because all elements are different (a shared element would force the partners to be equal).',
        { code: 'prod = {}\nfor i in range(n):\n    for j in range(i + 1, n):\n        p = a[i] * a[j]\n        prod[p] = prod.get(p, 0) + 1\ntotal = sum(8 * c * (c - 1) // 2 for c in prod.values())' },
        'A group of `c` pairs with the same product contains `c * (c - 1) / 2` couples of pairs. Each couple `{x, y}`, `{z, w}` gives **8 tuples**: choose which pair is first (2 ways), and the order inside each pair (2 and 2 ways).'
      ]
    },
    statement: ['You are given `n` different positive integers. Count the tuples `(a, b, c, d)` of four different elements of the array (taken from four different positions) with `a * b = c * d`. The order inside the tuple matters.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` different integers.'],
    outputFormat: ['Print the number of tuples.'],
    constraints: ['1 <= n <= 1000', '1 <= each number <= 10^4', 'All numbers are different.'],
    examples: [{ input: '4\n2 3 4 6\n', note: '2 * 6 = 3 * 4: the pairs {2, 6} and {3, 4} give 8 tuples.' }],
    hints: ['Compute the product of every pair of elements.', 'Count how many pairs have each product.', 'A product with `c` pairs gives `c * (c - 1) / 2` couples of pairs, and each couple gives 8 tuples.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      includes: ['<unordered_map>'],
      python: r`
        prod = {}
        for i in range(n):
            for j in range(i + 1, n):
                p = a[i] * a[j]
                prod[p] = prod.get(p, 0) + 1
        print(sum(8 * c * (c - 1) // 2 for c in prod.values()))`,
      cpp: r`
        unordered_map<long long, long long> prod;
        prod.reserve(n * n);
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) prod[a[i] * a[j]]++;
        }
        long long total = 0;
        for (auto& entry : prod) total += 8 * entry.second * (entry.second - 1) / 2;
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> prod = new HashMap<>();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) prod.merge(a[i] * a[j], 1L, Long::sum);
        }
        long total = 0;
        for (long c : prod.values()) total += 8 * c * (c - 1) / 2;
        System.out.println(total);`
    },
    solution: { explanation: ['All pair products are counted in a map. Every two pairs with the same product (they cannot share an element) give 8 tuples, so a product with `c` pairs contributes `8 * c * (c - 1) / 2`.'], complexity: 'Time O(n^2) on average, space O(n^2).' },
    solve(input) { const a = nums(rows(input)[1]); const c = new Map(); for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) { const p = a[i] * a[j]; c.set(p, (c.get(p) || 0) + 1); } let t = 0; for (const k of c.values()) t += 4 * k * (k - 1); return String(t); },
    tests() {
      const g = rng(428);
      const brute = (i) => { const a = nums(rows(i)[1]); let t = 0; const n = a.length; for (let p = 0; p < n; p++) for (let q = 0; q < n; q++) for (let s = 0; s < n; s++) for (let u = 0; u < n; u++) if (new Set([p, q, s, u]).size === 4 && a[p] * a[q] === a[s] * a[u]) t++; return t; };
      crossCheck(() => arr(randDistinct(g, randInt(g, 1, 9), 1, 40)), (i) => this.solve(i), brute, 120);
      const smooth = []; for (let x = 1; x <= 10000; x *= 2) for (let y = x; y <= 10000; y *= 3) for (let z = y; z <= 10000; z *= 5) smooth.push(z); const smoothSet = [...new Set(smooth)].sort((p, q) => p - q);
      const divisorRich = [...new Set(many(10000, (i) => i + 1).filter((v) => v % 12 === 0 || v % 30 === 0 || v % 7 === 0))];
      return ['4\n2 3 4 6\n', '1\n5\n', '4\n1 2 4 8\n', '4\n2 3 5 7\n', arr(randDistinct(g, 20, 1, 60)), arr(randDistinct(g, 300, 1, 2000)), arr(randDistinct(g, 1000, 1, 10000)), arr(randDistinct(g, 1000, 1, 1200)), arr(shuffle(g, smoothSet).slice(0, 1000)), arr(shuffle(g, divisorRich).slice(0, 1000)), arr(many(1000, (i) => i + 1))];
    }
  },

  {
    slug: 'words-that-are-subsequences',
    title: 'How Many Words Are Subsequences of the Text?',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'subsequence', 'strings', 'buckets'],
    concept: {
      title: 'Wait for the next letter in a bucket',
      body: [
        'A word is a **subsequence** of the text when its letters appear in the text in the same order (not necessarily next to each other). Testing every word against the text costs `|text|` per word. Instead, scan the text **once** and keep all words that are still in the game in **buckets by the letter they are waiting for**: a word that needs `c` next sits in the bucket of `c`.',
        { code: 'waiting = {letter: [(word, position of the next needed letter), ...]}\nfor ch in text:\n    group = waiting.pop(ch, [])             # all words waiting for ch\n    for word, p in group:\n        p += 1\n        if p == len(word): count += 1       # finished: a subsequence\n        else: waiting.setdefault(word[p], []).append((word, p))' },
        'When a letter of the text arrives, only the words that wait for exactly this letter are advanced, each by one position. Every word moves at most `len(word)` times in total, so the work is `|text| + total length of all words`, however many words there are. Taking the whole group out before refilling the buckets makes sure that a word advances only **one** step for one letter of the text.'
      ]
    },
    statement: ['Given a text `s` and `n` words, count how many of the words are subsequences of `s` (their letters occur in `s` in the same order, possibly with other letters in between). Equal words are counted separately.'],
    inputFormat: ['The first line has the text `s`.', 'The second line has `n`.', 'The third line has the `n` words.'],
    outputFormat: ['Print the number of words that are subsequences of `s`.'],
    constraints: ['1 <= length of s <= 20000', '1 <= n <= 2000', 'Each word has 1 to 30 lowercase letters.'],
    examples: [{ input: 'abcde\n4\na bb acd ace\n', note: 'a, acd and ace are subsequences; bb is not.' }],
    hints: ['Scanning the text once is enough if you remember which letter every word waits for.', 'Keep buckets: for each letter the words (with their position) that wait for it.', 'When a letter arrives, take its whole bucket, advance each word, and put it into the bucket of its next letter.'],
    program: {
      io: ['s:word', 'n:int', 'w:word[n]'],
      fast: true,
      includes: ['<utility>'],
      python: r`
        waiting = {}
        for word in w:
            waiting.setdefault(word[0], []).append((word, 0))
        count = 0
        for ch in s:
            group = waiting.pop(ch, [])
            for word, p in group:
                p += 1
                if p == len(word):
                    count += 1
                else:
                    waiting.setdefault(word[p], []).append((word, p))
        print(count)`,
      cpp: r`
        vector<pair<int, int>> waiting[26];
        for (int i = 0; i < n; i++) waiting[w[i][0] - 'a'].push_back({i, 0});
        int count = 0;
        for (char ch : s) {
            vector<pair<int, int>> group;
            group.swap(waiting[ch - 'a']);
            for (auto& item : group) {
                int p = item.second + 1;
                if (p == (int) w[item.first].size()) count++;
                else waiting[w[item.first][p] - 'a'].push_back({item.first, p});
            }
        }
        cout << count << "\n";`,
      java: r`
        List<List<int[]>> waiting = new ArrayList<>();
        for (int c = 0; c < 26; c++) waiting.add(new ArrayList<>());
        for (int i = 0; i < n; i++) waiting.get(w[i].charAt(0) - 'a').add(new int[] {i, 0});
        int count = 0;
        for (int k = 0; k < s.length(); k++) {
            int c = s.charAt(k) - 'a';
            List<int[]> group = waiting.get(c);
            waiting.set(c, new ArrayList<>());
            for (int[] item : group) {
                int p = item[1] + 1;
                if (p == w[item[0]].length()) count++;
                else waiting.get(w[item[0]].charAt(p) - 'a').add(new int[] {item[0], p});
            }
        }
        System.out.println(count);`
    },
    solution: { explanation: ['Words wait in buckets for their next letter. One pass over the text advances exactly the words that wait for the current letter, and a word that reaches its end is counted.'], complexity: 'Time O(|s| + total length of words), space O(total length).' },
    solve(input) { const [s, , ws] = rows(input); let c = 0; for (const w of ws.split(' ')) { let p = 0; for (const ch of s) if (p < w.length && ch === w[p]) p++; if (p === w.length) c++; } return String(c); },
    tests() {
      const g = rng(429);
      const make = (n, len, wordLen, alpha) => `${randWord(g, len, alpha)}\n${n}\n${many(n, () => randWord(g, randInt(g, 1, wordLen), alpha)).join(' ')}\n`;
      const fromText = (len, n, alpha) => { const s = randWord(g, len, alpha); const ws = many(n, () => { if (g() < 0.5) return randWord(g, randInt(g, 1, 10), alpha); const pick = []; for (let i = 0; i < len && pick.length < randInt(g, 1, 12); i++) if (g() < 0.05) pick.push(s[i]); return pick.length ? pick.join('') : s[0]; }); return `${s}\n${n}\n${ws.join(' ')}\n`; };
      return ['abcde\n4\na bb acd ace\n', 'a\n1\na\n', 'a\n1\nb\n', 'aaa\n3\na aa aaaa\n', make(10, 8, 3, 'ab'), make(300, 50, 6, 'abc'), fromText(20000, 2000, 'abcdefghij'), fromText(20000, 2000, 'ab'), make(20000, 2000, 30, 'ab'), make(20000, 2000, 30, LOW), `${'a'.repeat(20000)}\n2000\n${many(2000, (i) => 'a'.repeat((i % 30) + 1)).join(' ')}\n`];
    }
  },

  {
    slug: 'sum-of-distances-to-equal-elements',
    title: 'Total Distance to the Equal Elements',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'prefix-sum', 'grouping'],
    concept: {
      title: 'Group the positions of each value, use prefix sums inside a group',
      body: [
        'For every position `i` you want the sum of `|i - j|` over **all other positions `j` with the same value**. Comparing every pair costs `n^2`. First **group the positions** by value with a hash map (a value maps to the sorted list of its positions). Inside one group with positions `p[0] < p[1] < ... < p[m-1]`, the position `p[t]` has `t` positions on its left and `m - 1 - t` on its right.',
        { code: 'left_sum  = p[0] + ... + p[t-1]\nright_sum = p[t+1] + ... + p[m-1]\nresult = p[t] * t - left_sum + right_sum - p[t] * (m - 1 - t)' },
        'The distances to the left are `p[t] - p[s]` (sum: `p[t] * t - left_sum`) and to the right `p[s] - p[t]` (sum: `right_sum - p[t] * (m - 1 - t)`). Keeping a running `left_sum` while walking along the group, and `right_sum = total - left_sum - p[t]`, gives each result in O(1).'
      ]
    },
    statement: ['Given an array of `n` integers, print for every position `i` (counting from 0) the sum of `|i - j|` over all positions `j != i` with `a[j] = a[i]`. A position with no equal partner gets 0.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6\n1 3 1 1 2 3\n', note: 'The 1s are at positions 0, 2, 3: the results are 5, 3 and 4. The 3s at 1 and 5 give 4 each; the 2 gives 0.' }],
    hints: ['Group the positions of equal values with a map.', 'Inside a group, split the other positions into those on the left and on the right.', 'Use a running sum of the left positions and the group total to get the sums in O(1).'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        groups = {}
        for i, x in enumerate(a):
            groups.setdefault(x, []).append(i)
        res = [0] * n
        for pos in groups.values():
            total = sum(pos)
            left = 0
            m = len(pos)
            for t, p in enumerate(pos):
                right = total - left - p
                res[p] = p * t - left + right - p * (m - 1 - t)
                left += p
        print(*res)`,
      cpp: r`
        unordered_map<long long, vector<int>> groups;
        for (int i = 0; i < n; i++) groups[a[i]].push_back(i);
        vector<long long> res(n, 0);
        for (auto& entry : groups) {
            const vector<int>& pos = entry.second;
            long long total = 0, left = 0;
            for (int p : pos) total += p;
            int m = pos.size();
            for (int t = 0; t < m; t++) {
                long long p = pos[t], right = total - left - p;
                res[pos[t]] = p * t - left + right - p * (m - 1 - t);
                left += p;
            }
        }
        for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        Map<Long, List<Integer>> groups = new HashMap<>();
        for (int i = 0; i < n; i++) groups.computeIfAbsent(a[i], key -> new ArrayList<>()).add(i);
        long[] res = new long[(int) n];
        for (List<Integer> pos : groups.values()) {
            long total = 0, left = 0;
            for (int p : pos) total += p;
            int m = pos.size();
            for (int t = 0; t < m; t++) {
                long p = pos.get(t), right = total - left - p;
                res[(int) p] = p * t - left + right - p * (m - 1 - t);
                left += p;
            }
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(res[i]).append(i + 1 < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Positions are grouped by value. Inside a group, the sums of the distances to the left and right positions come from a running prefix sum and the group total.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const g = new Map(); a.forEach((x, i) => { if (!g.has(x)) g.set(x, []); g.get(x).push(i); }); const res = new Array(a.length).fill(0); for (const pos of g.values()) { const pre = [0]; for (const p of pos) pre.push(pre[pre.length - 1] + p); pos.forEach((p, t) => { const left = pre[t], right = pre[pos.length] - pre[t + 1]; res[p] = (p * t - left) + (right - p * (pos.length - 1 - t)); }); } return res.join(' '); },
    tests() {
      const g = rng(430);
      const brute = (i) => { const a = nums(rows(i)[1]); return a.map((x, p) => a.reduce((s, y, q) => (q !== p && y === x ? s + Math.abs(p - q) : s), 0)).join(' '); };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 12), 0, 3)), (i) => this.solve(i), brute);
      return ['6\n1 3 1 1 2 3\n', '1\n5\n', '3\n7 7 7\n', '4\n1 2 3 4\n', arr(randArray(g, 30, 0, 4)), arr(randArray(g, 2000, 0, 50)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, 0, 100)), arr(randArray(g, 20000, 0, 1)), arr(Array(20000).fill(3)), arr(randArray(g, 20000, 0, 20000))];
    }
  }
];

function fastArith(a, d) { const dp = new Map(); let best = 0; for (const x of a) { const v = (dp.get(x - d) || 0) + 1; dp.set(x, v); best = Math.max(best, v); } return best; }
