import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const MOD = 1000000007;
const MODN = BigInt(MOD);
const list = (n, a) => `${n}\n${a.join(' ')}\n`;
const head2 = (a, b, arr) => `${a} ${b}\n${arr.join(' ')}\n`;
const parse2 = (input) => { const rs = rows(input); const [a, b] = nums(rs[0]); return { a, b, arr: nums(rs[1]) }; };
const permutations = (n) => { const out = []; const used = new Array(n).fill(false); const cur = []; const go = () => { if (cur.length === n) { out.push(cur.slice()); return; } for (let i = 0; i < n; i++) if (!used[i]) { used[i] = true; cur.push(i); go(); cur.pop(); used[i] = false; } }; go(); return out; };

export default [
  {
    ...hard,
    inputFormat: ['The first line has `q`: the number of questions.', 'The second line has `q` numbers `N` (written as digits, up to 18 digits).', 'The third line has `q` numbers `k`.'],
    constraints: ['1 <= q <= 300', '1 <= N <= 10^18', '1 <= k <= 50'],
    slug: 'count-numbers-digit-sum-multiple',
    title: 'Count the Numbers Whose Digit Sum Is a Multiple of k',
    tags: ['dp', 'digit-dp', 'counting', 'modular'],
    concept: {
      title: 'Build the number digit by digit from the left, with a flag that says whether it still follows the limit',
      body: [
        'How many integers from 1 to `N` have a **digit sum divisible by `k`**? For `N = 20` and `k = 5` the numbers are 5, 14 (1 + 4) and 19 (1 + 9): 3. When `N` is as large as 10^18 we cannot look at every number, but we can count them by the **digits**. This technique is called *digit DP*.',
        'Write the numbers with the same number of digits as `N`, allowing leading zeros (the number 0 is then included and removed at the end; leading zeros add nothing to the digit sum). Build a number from the left digit by digit. The state is `(remainder of the digit sum so far, tight)`. The flag **tight** says that all the digits chosen so far are exactly the digits of `N`; then the next digit can be at most the next digit of `N`. Once a digit is chosen **smaller** than the one of `N`, the number is below the limit for good and the following digits are completely free (0 to 9). So we keep `free[r]`, the number of prefixes that are already below `N` with the digit-sum remainder `r`, and one single tight prefix with its remainder.',
        { code: 'free = [0] * k                      # prefixes already smaller than the prefix of N, by remainder\ntight = 0                           # the remainder of the prefix equal to the prefix of N\nfor d in digits_of_N:\n    new = [0] * k\n    for r in range(k):\n        for x in range(10):\n            new[(r + x) % k] += free[r]          # free prefixes may take any digit\n    for x in range(d):                           # the tight prefix drops below N with a smaller digit\n        new[(tight + x) % k] += 1\n    free = new\n    tight = (tight + d) % k\ncount = free[0] + (1 if tight == 0 else 0) - 1   # numbers 0..N with the remainder 0, minus the number 0' },
        'For each question there are at most 18 digits, `k` remainders and 10 digits to choose: about 9000 steps. The idea of splitting the numbers into "still equal to the limit" and "already smaller" is the core of every digit DP; it can count numbers with no repeated digit, numbers without a forbidden digit, numbers with a given digit sum, and so on. The answer for `N = 10^18` fits in 64 bits.'
      ]
    },
    statement: ['For each of the `q` questions, given a positive integer `N` and a number `k`, print how many integers from 1 to `N` have a sum of digits divisible by `k`.'],
    outputFormat: ['Print `q` lines: the answer to each question.'],
    examples: [{ input: '2\n20 100\n5 1\n', note: 'The first question (N = 20, k = 5): the numbers 5, 14 and 19, so 3. The second question (N = 100, k = 1): every number qualifies, so 100.' }],
    hints: ['Write N as digits and build the number from the left.', 'Keep, for the prefixes already smaller than N, the number of prefixes for each remainder of the digit sum; the prefix equal to N is just one.', 'Count 0..N and subtract one for the number 0.'],
    program: {
      io: ['q:int', 'ns:word[q]', 'ks:int[q]'],
      fast: true,
      python: r`
        out = []
        for index in range(q):
            digits = [ord(c) - 48 for c in ns[index]]
            kk = ks[index]
            free = [0] * kk
            tight = 0
            for d in digits:
                new = [0] * kk
                for r in range(kk):
                    f = free[r]
                    if f:
                        for x in range(10):
                            new[(r + x) % kk] += f
                for x in range(d):
                    new[(tight + x) % kk] += 1
                free = new
                tight = (tight + d) % kk
            out.append(free[0] + (1 if tight == 0 else 0) - 1)
        print("\n".join(map(str, out)))`,
      cpp: r`
        for (long long index = 0; index < q; index++) {
            const string& N = ns[index];
            int kk = (int)ks[index];
            vector<long long> freeCount(kk, 0), next(kk, 0);
            int tight = 0;
            for (char ch : N) {
                int d = ch - '0';
                fill(next.begin(), next.end(), 0);
                for (int r = 0; r < kk; r++) {
                    if (freeCount[r] == 0) continue;
                    for (int x = 0; x < 10; x++) next[(r + x) % kk] += freeCount[r];
                }
                for (int x = 0; x < d; x++) next[(tight + x) % kk] += 1;
                freeCount = next;
                tight = (tight + d) % kk;
            }
            cout << freeCount[0] + (tight == 0 ? 1 : 0) - 1 << "\n";
        }`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int index = 0; index < q; index++) {
            String number = ns[index];
            int kk = (int) ks[index];
            long[] freeCount = new long[kk];
            long[] next = new long[kk];
            int tight = 0;
            for (int p = 0; p < number.length(); p++) {
                int d = number.charAt(p) - '0';
                Arrays.fill(next, 0);
                for (int r = 0; r < kk; r++) {
                    if (freeCount[r] == 0) continue;
                    for (int x = 0; x < 10; x++) next[(r + x) % kk] += freeCount[r];
                }
                for (int x = 0; x < d; x++) next[(tight + x) % kk] += 1;
                long[] swap = freeCount;
                freeCount = next;
                next = swap;
                tight = (tight + d) % kk;
            }
            out.append(freeCount[0] + (tight == 0 ? 1 : 0) - 1).append("\n");
        }
        System.out.print(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The digits of N are read from the left; free[r] counts the prefixes that are already smaller than the prefix of N and have the digit-sum remainder r, and the single prefix equal to N has its own remainder. Each digit extends the free prefixes with all 10 digits and moves the tight prefix to the free ones with each smaller digit. The answer is the number of numbers 0..N with the remainder 0, minus the number 0.'], complexity: 'Time O(q * digits * k * 10), space O(k).' },
    solve(input) {
      const rs = rows(input); const q = Number(rs[0]); const ns = rs[1].split(' '); const ks = nums(rs[2]); const out = []; // top-down with memory over (position, remainder, tight)
      for (let t = 0; t < q; t++) { const digits = [...ns[t]].map(Number); const k = ks[t]; const memo = new Map(); const go = (pos, rem, tight) => { if (pos === digits.length) return rem === 0 ? 1n : 0n; const key = (pos * 64 + rem) * 2 + (tight ? 1 : 0); if (memo.has(key)) return memo.get(key); let res = 0n; const lim = tight ? digits[pos] : 9; for (let x = 0; x <= lim; x++) res += go(pos + 1, (rem + x) % k, tight && x === lim); memo.set(key, res); return res; }; out.push(String(go(0, 0, true) - 1n)); }
      return out.join('\n');
    },
    tests() {
      const g = rng(2101); const out = ['2\n20 100\n5 1\n'];
      const make = (pairs) => `${pairs.length}\n${pairs.map((p) => p[0]).join(' ')}\n${pairs.map((p) => p[1]).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const ns = rs[1].split(' ').map(Number); const ks = nums(rs[2]); return ns.map((N, i) => { let c = 0; for (let x = 1; x <= N; x++) { let s = 0, y = x; while (y) { s += y % 10; y = Math.floor(y / 10); } if (s % ks[i] === 0) c++; } return c; }).join('\n'); };
      crossCheck(() => make(many(randInt(g, 1, 4), () => [randInt(g, 1, 3000), randInt(g, 1, 20)])), (i) => this.solve(i), brute, 300);
      const big = (digits) => { let s = String(randInt(g, 1, 9)); while (s.length < digits) s += String(randInt(g, 0, 9)); return s; };
      out.push(make([['1', '1'], ['9', '9'], ['10', '1'], ['1000000000000000000', '1'], ['1000000000000000000', '50'], ['999999999999999999', '7']]));
      for (const [qn, digits, kmax] of [[10, 5, 10], [50, 9, 20], [100, 12, 30], [200, 15, 50], [300, 18, 50], [300, 18, 50], [300, 18, 7], [300, 3, 50]]) out.push(make(many(qn, () => [big(randInt(g, 1, digits)), randInt(g, 1, kmax)])));
      out.push(make(many(300, (i) => ['9'.repeat(1 + (i % 18)), 1 + (i % 50)])), make(many(300, (i) => ['1' + '0'.repeat(i % 18), 1 + ((i * 7) % 50)])));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['One line with two numbers `h` and `w`: the number of rows and the number of columns of the board.'],
    constraints: ['1 <= h <= 7', '1 <= w <= 1000'],
    slug: 'domino-tilings-of-a-board',
    title: 'In How Many Ways Can the Board Be Covered With Dominoes?',
    tags: ['dp', 'profile-dp', 'bitmask', 'tiling'],
    concept: {
      title: 'Broken profile: go cell by cell and remember which of the next cells are already covered',
      body: [
        'A board has `h` rows and `w` columns. A domino covers **two neighbouring cells** (laid flat or standing). In how many ways can the whole board be covered with dominoes, with no overlap and no gap? A 2 by 3 board has 3 ways, a 3 by 3 board has 0 (odd area), a 4 by 4 board has 36. Print the count modulo 1 000 000 007.',
        'Go through the cells column by column, and inside a column from the top to the bottom. Keep a **bitmask of `h` bits** describing the cells that are already covered by dominoes placed earlier and lie **in the current column below the current cell, or in the next column at or above the current cell** (a frontier that looks like a broken line, hence the name *broken profile*). When we arrive at the cell `(r, c)`: if its bit is set, the cell is already covered, we only clear the bit (the bit now describes the next column); otherwise we must cover it with a new domino, in one of two ways: **horizontally** into the next column (if there is one), which sets the bit `r`, or **vertically** with the cell below (if it exists and is free), which sets the bit `r + 1`.',
        { code: 'dp = [0] * (1 << h)\ndp[0] = 1\nfor c in range(w):\n    for r in range(h):\n        new = [0] * (1 << h)\n        bit = 1 << r\n        for mask in range(1 << h):\n            v = dp[mask]\n            if not v: continue\n            if mask & bit:\n                new[mask ^ bit] += v                           # already covered\n            else:\n                if c + 1 < w: new[mask | bit] += v             # a horizontal domino\n                if r + 1 < h and not mask & (bit << 1):\n                    new[mask | (bit << 1)] += v                # a vertical domino\n        dp = [x % MOD for x in new]\nprint(dp[0])' },
        'At the end every cell is covered, so the profile must be empty: the answer is `dp[0]`. There are `h * w` cells, `2^h` masks and at most two moves each: about 900 000 steps at the limits. This method counts tilings of boards that are narrow in one direction and very long in the other; the number of masks grows as `2^h`, so it is practical for `h` up to about 10.'
      ]
    },
    statement: ['A board has `h` rows and `w` columns. Print the number of ways to cover the whole board exactly with dominoes (each domino covers two cells that share a side; there is no overlap and no gap), modulo 1000000007. Tilings that differ in the placement of at least one domino are different.'],
    outputFormat: ['Print the number of tilings modulo 1000000007.'],
    examples: [{ input: '2 3\n', note: 'Three standing dominoes; one standing and two flat (two ways): 3.' }, { input: '3 3\n', note: 'The area is odd: 0.' }],
    hints: ['Process the cells column by column and keep a bitmask of h bits for the frontier.', 'If the bit of the current cell is set, clear it; otherwise place a horizontal domino (set the same bit) or a vertical one (set the next bit).', 'The answer is the value for the empty mask after the last cell.'],
    program: {
      io: ['h:int w:int'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        size = 1 << h
        dp = [0] * size
        dp[0] = 1
        for c in range(w):
            for r in range(h):
                new = [0] * size
                bit = 1 << r
                for mask in range(size):
                    v = dp[mask]
                    if not v:
                        continue
                    if mask & bit:
                        new[mask ^ bit] += v
                    else:
                        if c + 1 < w:
                            new[mask | bit] += v
                        if r + 1 < h and not (mask & (bit << 1)):
                            new[mask | (bit << 1)] += v
                dp = [x % MOD for x in new]
        print(dp[0])`,
      cpp: r`
        const long long MOD = 1000000007;
        int rowsCount = (int)h, size = 1 << rowsCount;
        vector<long long> dp(size, 0), next(size);
        dp[0] = 1;
        for (int c = 0; c < w; c++) {
            for (int r = 0; r < rowsCount; r++) {
                fill(next.begin(), next.end(), 0);
                int bit = 1 << r;
                for (int mask = 0; mask < size; mask++) {
                    long long v = dp[mask];
                    if (v == 0) continue;
                    if (mask & bit) {
                        next[mask ^ bit] = (next[mask ^ bit] + v) % MOD;
                    } else {
                        if (c + 1 < w) next[mask | bit] = (next[mask | bit] + v) % MOD;
                        if (r + 1 < rowsCount && !(mask & (bit << 1))) next[mask | (bit << 1)] = (next[mask | (bit << 1)] + v) % MOD;
                    }
                }
                dp = next;
            }
        }
        cout << dp[0] << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int rowsCount = (int) h, size = 1 << rowsCount;
        long[] dp = new long[size];
        long[] next = new long[size];
        dp[0] = 1;
        for (int c = 0; c < w; c++) {
            for (int r = 0; r < rowsCount; r++) {
                Arrays.fill(next, 0);
                int bit = 1 << r;
                for (int mask = 0; mask < size; mask++) {
                    long v = dp[mask];
                    if (v == 0) continue;
                    if ((mask & bit) != 0) {
                        next[mask ^ bit] = (next[mask ^ bit] + v) % MOD;
                    } else {
                        if (c + 1 < w) next[mask | bit] = (next[mask | bit] + v) % MOD;
                        if (r + 1 < rowsCount && (mask & (bit << 1)) == 0) next[mask | (bit << 1)] = (next[mask | (bit << 1)] + v) % MOD;
                    }
                }
                long[] swap = dp;
                dp = next;
                next = swap;
            }
        }
        System.out.println(dp[0]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The cells are processed column by column; the bitmask of h bits tells which cells of the frontier are already covered. A covered cell only clears its bit, an uncovered one starts a horizontal domino (sets its own bit for the next column) or a vertical one (sets the bit of the cell below). The answer is the count for the empty mask at the end.'], complexity: 'Time O(h * w * 2^h), space O(2^h).' },
    solve(input) {
      const [h, w] = nums(input); // column by column: all the ways to fill one column given which of its cells are already covered from the left (a mask), producing the mask of the cells that stick into the next column
      const size = 1 << h; const fills = (mask) => { const res = []; const go = (r, cur, next) => { if (r === h) { res.push(next); return; } if (cur >> r & 1) { go(r + 1, cur, next); return; } go(r + 1, cur | (1 << r), next | (1 << r)); /* horizontal */ if (r + 1 < h && !(cur >> (r + 1) & 1)) go(r + 2, cur | (3 << r), next); }; go(0, mask, 0); return res; };
      const trans = many(size, fills); let dp = new Array(size).fill(0n); dp[0] = 1n; for (let c = 0; c < w; c++) { const nxt = new Array(size).fill(0n); for (let mask = 0; mask < size; mask++) if (dp[mask]) for (const nm of trans[mask]) { if (c + 1 === w && nm) continue; nxt[nm] = (nxt[nm] + dp[mask]) % MODN; } dp = nxt; } return String(dp[0]);
    },
    tests() {
      const out = ['2 3\n', '3 3\n', '4 4\n', '1 1\n', '1 2\n', '2 2\n'];
      const count = (h, w) => { const grid = many(h, () => new Array(w).fill(false)); const go = () => { let r = -1, c = -1; for (let i = 0; i < h && r < 0; i++) for (let j = 0; j < w; j++) if (!grid[i][j]) { r = i; c = j; break; } if (r < 0) return 1; let total = 0; if (c + 1 < w && !grid[r][c + 1]) { grid[r][c] = grid[r][c + 1] = true; total += go(); grid[r][c] = grid[r][c + 1] = false; } if (r + 1 < h && !grid[r + 1][c]) { grid[r][c] = grid[r + 1][c] = true; total += go(); grid[r][c] = grid[r + 1][c] = false; } return total; }; return go(); };
      for (let h = 1; h <= 4; h++) for (let w = 1; w <= 5; w++) if (String(this.solve(`${h} ${w}\n`)) !== String(count(h, w) % MOD)) throw new Error('reference differs from the search for ' + h + ' x ' + w);
      for (const [h, w] of [[3, 4], [4, 5], [5, 6], [6, 6], [7, 8], [7, 10], [2, 1000], [3, 1000], [4, 999], [5, 1000], [6, 1000], [7, 1000], [7, 999], [1, 1000], [7, 100], [6, 777]]) out.push(`${h} ${w}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `q`: the number of questions.', 'Each of the next `q` lines has two numbers `e` and `f`: the number of eggs and the number of floors.'],
    constraints: ['1 <= q <= 100', '1 <= e <= 100', '1 <= f <= 1000000'],
    slug: 'fewest-egg-drops',
    title: 'The Fewest Drops to Find the Breaking Floor',
    tags: ['dp', 'egg-drop', 'optimisation', 'inverse-dp'],
    concept: {
      title: 'Turn the question around: with t drops and e eggs, how many floors can be handled?',
      body: [
        'A building has `f` floors, and you have `e` identical eggs. There is a floor `x` (from 0 to `f`) such that an egg dropped from a floor **above `x`** breaks and from a floor **at or below `x`** survives (an egg that survives can be used again; a broken one is lost). You must find `x` for certain. What is the **smallest number of drops** that is enough in the worst case? With 1 egg and 10 floors you must go floor by floor: 10 drops. With 2 eggs and 100 floors the answer is 14.',
        'The direct DP over (eggs, floors) is `O(e * f^2)`, too slow. Reverse the question: let `reach(t, e)` be the **largest number of floors that can be handled with `t` drops and `e` eggs**. One drop from some floor: if the egg **breaks**, we continue with `t - 1` drops and `e - 1` eggs on the floors below; if it **survives**, with `t - 1` drops and `e` eggs on the floors above; the drop itself settles one floor. The best floor splits as much as possible: **`reach(t, e) = reach(t - 1, e - 1) + reach(t - 1, e) + 1`**, with `reach(0, e) = 0` and `reach(t, 0) = 0`. The answer is the smallest `t` with `reach(t, e) >= f`.',
        { code: 'reach = [0] * (e + 1)\nt = 0\nwhile reach[e] < f:\n    t += 1\n    for j in range(e, 0, -1):                     # from the largest j so that reach[j - 1] is still the old value\n        reach[j] = reach[j - 1] + reach[j] + 1\nprint(t)' },
        'With one array of `e + 1` numbers, each drop costs O(e). The number of drops needed is at most `f` (with one egg) and shrinks quickly with more eggs (about `log2 f` for many eggs), so the total work is at most about a million steps. Looking for "the biggest problem that a given budget can solve" instead of "the cheapest solution of a given problem" is the same trick as in the longest-subsequence-by-tails method.'
      ]
    },
    statement: ['For each of the `q` questions: a building has `f` floors and you have `e` identical eggs. An egg dropped from a floor above the unknown critical floor breaks (and cannot be used again); an egg dropped from the critical floor or below survives (and can be reused). The critical floor is some number from 0 to `f`. Print the smallest number of drops that is guaranteed to find the critical floor, in the worst case.'],
    outputFormat: ['Print `q` lines: the answer to each question.'],
    examples: [{ input: '3\n1 10\n2 100\n3 14\n', note: 'One egg and 10 floors: 10 drops. Two eggs and 100 floors: 14. Three eggs and 14 floors: 4.' }],
    hints: ['Let reach(t, e) be the largest number of floors that t drops with e eggs can decide.', 'reach(t, e) = reach(t - 1, e - 1) + reach(t - 1, e) + 1.', 'Increase t until reach(t, e) is at least the number of floors; update the eggs from the largest down.'],
    program: {
      io: ['q:int', 'queries:int[q][2]'],
      fast: true,
      python: r`
        out = []
        for e, f in queries:
            reach = [0] * (e + 1)
            t = 0
            while reach[e] < f:
                t += 1
                for j in range(e, 0, -1):
                    reach[j] = reach[j - 1] + reach[j] + 1
            out.append(t)
        print("\n".join(map(str, out)))`,
      cpp: r`
        for (const vector<long long>& query : queries) {
            int e = (int)query[0];
            long long f = query[1];
            vector<long long> reach(e + 1, 0);
            long long t = 0;
            while (reach[e] < f) {
                t++;
                for (int j = e; j >= 1; j--) reach[j] = min(f, reach[j - 1] + reach[j] + 1);
            }
            cout << t << "\n";
        }`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int index = 0; index < q; index++) {
            int e = (int) queries[index][0];
            long f = queries[index][1];
            long[] reach = new long[e + 1];
            long t = 0;
            while (reach[e] < f) {
                t++;
                for (int j = e; j >= 1; j--) reach[j] = Math.min(f, reach[j - 1] + reach[j] + 1);
            }
            out.append(t).append("\n");
        }
        System.out.print(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['reach(t, e), the largest number of floors that t drops with e eggs can decide, satisfies reach(t, e) = reach(t - 1, e - 1) + reach(t - 1, e) + 1; for each question t grows until reach(t, e) is at least f. The array is updated from the largest egg count down (values are capped at f in the compiled languages).'], complexity: 'Time O(t * e) per question, space O(e).' },
    solve(input) {
      const rs = rows(input); const q = Number(rs[0]); const out = []; // the closed form reach(t, e) = C(t, 1) + C(t, 2) + ... + C(t, e), found by a binary search on t with exact integers
      const reachOf = (t, e) => { let sum = 0n, term = 1n; for (let i = 1; i <= Math.min(e, t); i++) { term = term * BigInt(t - i + 1) / BigInt(i); sum += term; } return sum; };
      for (let i = 1; i <= q; i++) { const [e, f] = nums(rs[i]); let lo = 1, hi = f; while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (reachOf(mid, e) >= BigInt(f)) hi = mid; else lo = mid + 1; } out.push(lo); }
      return out.join('\n');
    },
    tests() {
      const g = rng(2102); const out = ['3\n1 10\n2 100\n3 14\n'];
      const make = (pairs) => `${pairs.length}\n${pairs.map((p) => p.join(' ')).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const q = Number(rs[0]); const res = []; for (let i = 1; i <= q; i++) { const [e, f] = nums(rs[i]); const dp = Array.from({ length: e + 1 }, () => new Array(f + 1).fill(0)); for (let fl = 1; fl <= f; fl++) dp[1][fl] = fl; for (let eg = 2; eg <= e; eg++) for (let fl = 1; fl <= f; fl++) { let best = Infinity; for (let x = 1; x <= fl; x++) best = Math.min(best, 1 + Math.max(dp[eg - 1][x - 1], dp[eg][fl - x])); dp[eg][fl] = best; } res.push(dp[e][f]); } return res.join('\n'); };
      crossCheck(() => make(many(randInt(g, 1, 4), () => [randInt(g, 1, 5), randInt(g, 1, 40)])), (i) => this.solve(i), brute, 300);
      out.push(make([[1, 1], [1, 1000000], [2, 1000000], [3, 1000000], [100, 1000000], [100, 1], [50, 999999], [10, 1000000]]));
      out.push(make(many(100, (i) => [1 + (i % 100), 1 + i * 9999])), make(many(100, () => [randInt(g, 3, 100), randInt(g, 1, 1000000)])), make(many(100, (i) => [2 + (i % 5), 1000000 - i])), make(many(100, (i) => [100 - (i % 100), 100000 + i])));
      out.push(make([[1, 1000000], [2, 1000000], [2, 999999], [3, 1000000], [4, 1000000], [5, 1000000]]));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of keys.', 'The second line has `n` numbers: `freq[i]` is how often the key `i` is searched for (the keys are already in sorted order).'],
    constraints: ['1 <= n <= 200', '1 <= each frequency <= 1000'],
    slug: 'optimal-search-tree-cost',
    title: 'The Cheapest Search Tree for Given Frequencies',
    tags: ['dp', 'interval-dp', 'bst', 'optimal-tree'],
    concept: {
      title: 'Choose the root of a range: its two sides are independent trees, and every key in the range gets one level deeper',
      body: [
        'The keys `1 .. n` are stored in a binary search tree, and the key `i` is looked up `freq[i]` times. Looking up a key costs the number of nodes on the path from the root to the key (the root has the depth 1). A tree with the keys that are searched often near the root is cheaper than a balanced tree. What is the smallest possible **total cost** `sum of freq[i] * depth(i)`? For the frequencies `34 8 50` the best tree has the key 3 at the root, the key 1 below it and the key 2 below the key 1: 50 + 2 * 34 + 3 * 8 = 142.',
        'Let `cost(i, j)` be the smallest total cost of a search tree for the keys `i .. j` (`cost` of an empty range is 0). Choose the **root** `r` in `i .. j`. The left subtree holds the keys `i .. r - 1`, the right subtree `r + 1 .. j`, and they are built independently. Everything in both subtrees moves **one level deeper** than inside its own subtree, and the root itself has depth 1, so the cost of the whole range grows by the total frequency of all keys in `i .. j`: **`cost(i, j) = min over r of cost(i, r - 1) + cost(r + 1, j) + sum of freq(i .. j)`**.',
        { code: 'prefix = ...                                       # prefix sums of the frequencies\ncost = [[0] * (n + 2) for _ in range(n + 2)]       # cost[i][i - 1] = 0: the empty range\nfor length in range(1, n + 1):\n    for i in range(1, n - length + 2):\n        j = i + length - 1\n        total = prefix[j] - prefix[i - 1]\n        cost[i][j] = total + min(cost[i][r - 1] + cost[r + 1][j] for r in range(i, j + 1))\nprint(cost[1][n])' },
        'This is the same triple loop as in the matrix chain problem: O(n^3) time (about 1.3 million steps for 200 keys) and O(n^2) memory. (A refinement by Knuth shows that the best root moves monotonically and brings the time down to O(n^2), but the plain version is the one to learn first.) Compressing text with Huffman codes solves a related problem for codes instead of search trees.'
      ]
    },
    statement: ['`n` keys in sorted order are stored in a binary search tree; the key `i` is searched `freq[i]` times, and one search costs the number of nodes on the path from the root to the key (the root has depth 1). Print the smallest possible total cost of all searches over all binary search trees on the keys.'],
    outputFormat: ['Print the smallest total cost.'],
    examples: [{ input: '3\n34 8 50\n', note: 'With the root 3, then the key 1 below it and the key 2 below 1: 50 * 1 + 34 * 2 + 8 * 3 = 142.' }, { input: '1\n7\n', note: 'One key at depth 1: 7.' }],
    hints: ['Let cost(i, j) be the smallest cost for the keys i to j.', 'If the root is r, the left and right parts are independent, and all their keys get one level deeper: add the total frequency of i..j.', 'cost(i, j) = sum(i..j) + min over r of cost(i, r - 1) + cost(r + 1, j).'],
    program: {
      io: ['n:int', 'freq:int[n]'],
      fast: true,
      python: r`
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + freq[i]
        cost = [[0] * (n + 2) for _ in range(n + 2)]
        for length in range(1, n + 1):
            for i in range(1, n - length + 2):
                j = i + length - 1
                best = None
                for r in range(i, j + 1):
                    v = cost[i][r - 1] + cost[r + 1][j]
                    if best is None or v < best:
                        best = v
                cost[i][j] = best + prefix[j] - prefix[i - 1]
        print(cost[1][n])`,
      cpp: r`
        int keys = (int)n;
        vector<long long> prefix(keys + 1, 0);
        for (int i = 0; i < keys; i++) prefix[i + 1] = prefix[i] + freq[i];
        vector<vector<long long>> cost(keys + 2, vector<long long>(keys + 2, 0));
        for (int length = 1; length <= keys; length++) {
            for (int i = 1; i + length - 1 <= keys; i++) {
                int j = i + length - 1;
                long long best = LLONG_MAX;
                for (int r = i; r <= j; r++) best = min(best, cost[i][r - 1] + cost[r + 1][j]);
                cost[i][j] = best + prefix[j] - prefix[i - 1];
            }
        }
        cout << cost[1][keys] << "\n";`,
      java: r`
        int keys = (int) n;
        long[] prefix = new long[keys + 1];
        for (int i = 0; i < keys; i++) prefix[i + 1] = prefix[i] + freq[i];
        long[][] cost = new long[keys + 2][keys + 2];
        for (int length = 1; length <= keys; length++) {
            for (int i = 1; i + length - 1 <= keys; i++) {
                int j = i + length - 1;
                long best = Long.MAX_VALUE;
                for (int r = i; r <= j; r++) best = Math.min(best, cost[i][r - 1] + cost[r + 1][j]);
                cost[i][j] = best + prefix[j] - prefix[i - 1];
            }
        }
        System.out.println(cost[1][keys]);`,
      includes: ['<algorithm>', '<climits>']
    },
    solution: { explanation: ['cost(i, j), the smallest total cost of a search tree for the keys i..j, is the total frequency of i..j plus the minimum over the root r of cost(i, r - 1) + cost(r + 1, j), with the cost of an empty range 0; the table is filled by increasing range length and cost(1, n) is the answer.'], complexity: 'Time O(n^3), space O(n^2).' },
    solve(input) {
      const f = arrOf(input); const n = f.length; const pre = [0]; for (const x of f) pre.push(pre[pre.length - 1] + x); const memo = new Map(); // top-down with memory
      const go = (i, j) => { if (i > j) return 0; const key = i * 300 + j; if (memo.has(key)) return memo.get(key); let best = Infinity; for (let r = i; r <= j; r++) best = Math.min(best, go(i, r - 1) + go(r + 1, j)); best += pre[j] - pre[i - 1]; memo.set(key, best); return best; };
      return String(go(1, n));
      function arrOf(inp) { return nums(rows(inp)[1]); }
    },
    tests() {
      const g = rng(2103); const out = ['3\n34 8 50\n', '1\n7\n', '2\n1 1\n', '4\n10 1 1 10\n'];
      const brute = (input) => { const f = nums(rows(input)[1]); const n = f.length; const build = (keys, depth) => { if (!keys.length) return 0; let best = Infinity; for (let r = 0; r < keys.length; r++) best = Math.min(best, keys[r] * depth + build(keys.slice(0, r), depth + 1) + build(keys.slice(r + 1), depth + 1)); return best; }; return String(build(f, 1)); };
      crossCheck(() => { const n = randInt(g, 1, 8); return list(n, randArray(g, n, 1, 20)); }, (i) => this.solve(i), brute, 400);
      for (const [n, hi] of [[10, 20], [30, 100], [60, 1000], [100, 1000], [150, 1000], [200, 1000], [200, 1000], [200, 1], [200, 5], [199, 1000]]) out.push(list(n, randArray(g, n, 1, hi)));
      out.push(list(200, new Array(200).fill(1000)), list(200, many(200, (i) => i + 1)), list(200, many(200, (i) => 200 - i)), list(200, many(200, (i) => 1 + (i % 2) * 999)), list(200, many(200, (i) => 1 + Math.floor(1000 * Math.exp(-Math.abs(i - 100) / 15)))));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` numbers.'],
    constraints: ['1 <= k <= min(n, 100)', '1 <= n <= 5000', '-1000 <= each number <= 1000'],
    slug: 'k-separate-stretches',
    title: 'Pick k Separate Stretches With the Biggest Total',
    tags: ['dp', 'subarray', 'k-segments', 'two-states'],
    concept: {
      title: 'For every number of stretches keep two values: the best total so far, and the best total whose last stretch ends right here',
      body: [
        'Choose exactly **`k` non-empty, non-overlapping stretches** (blocks of consecutive numbers) of a list so that the sum of all the numbers in the chosen stretches is as large as possible. For `1 -2 3 4 -1 2 -5 6` and `k = 2` the best is `3 4 -1 2` and `6`, total 14. With `k = 1` this is the classical maximum subarray problem (the numbers may be negative).',
        'For each number of stretches `j` from 1 to `k` keep two values while walking along the list: `end[j]`, the best total of `j` stretches where the **`j`-th stretch ends exactly at the current number**, and `best[j]`, the best total of `j` stretches ending anywhere so far. At the next number `x` the stretch number `j` either **continues** (`end[j] + x`) or **starts here**, after the best arrangement of `j - 1` stretches on the earlier numbers (`best[j - 1] + x`): **`end[j] = max(end[j], best[j - 1]) + x`** and **`best[j] = max(best[j], end[j])`**, with `best[0] = 0`. Go through `j` from the largest to the smallest, so that `best[j - 1]` still refers to the numbers before `x`.',
        { code: 'NEG = -10 ** 18\nend = [NEG] * (k + 1)\nbest = [NEG] * (k + 1)\nbest[0] = 0\nfor x in a:\n    for j in range(k, 0, -1):\n        end[j] = max(end[j], best[j - 1]) + x\n        best[j] = max(best[j], end[j])\nprint(best[k])' },
        'For `k = 1` the loop is Kadane\'s algorithm. The two-state trick (continue the open stretch or start a new one) is the same as the stock problems with a limited number of trades. The time is O(n * k), at most 500 000 steps, and the memory O(k).'
      ]
    },
    statement: ['A list of `n` integers and a number `k` are given. Choose exactly `k` non-empty stretches of consecutive numbers that do not overlap (they may be neighbours) so that the sum of all the numbers in them is as large as possible. Print that sum.'],
    outputFormat: ['Print the largest possible sum.'],
    examples: [{ input: '8 2\n1 -2 3 4 -1 2 -5 6\n', note: 'The stretches 3 4 -1 2 (sum 8) and 6 give 14.' }, { input: '3 3\n-1 -2 -3\n', note: 'Each number must be a stretch of its own: -6.' }],
    hints: ['For each number of stretches j keep end[j] (the j-th stretch ends here) and best[j] (the best so far).', 'A stretch continues or starts here: end[j] = max(end[j], best[j - 1]) + x.', 'Go through j from k down to 1 for every new number.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      python: r`
        NEG = -10 ** 18
        end = [NEG] * (k + 1)
        best = [NEG] * (k + 1)
        best[0] = 0
        for x in a:
            for j in range(k, 0, -1):
                e = end[j] if end[j] > best[j - 1] else best[j - 1]
                e += x
                end[j] = e
                if e > best[j]:
                    best[j] = e
        print(best[k])`,
      cpp: r`
        const long long NEG = -1000000000000000000LL;
        vector<long long> endHere(k + 1, NEG), best(k + 1, NEG);
        best[0] = 0;
        for (long long x : a) {
            for (long long j = k; j >= 1; j--) {
                long long e = max(endHere[j], best[j - 1]) + x;
                endHere[j] = e;
                best[j] = max(best[j], e);
            }
        }
        cout << best[k] << "\n";`,
      java: r`
        final long NEG = -1000000000000000000L;
        int kk = (int) k;
        long[] endHere = new long[kk + 1];
        long[] best = new long[kk + 1];
        Arrays.fill(endHere, NEG);
        Arrays.fill(best, NEG);
        best[0] = 0;
        for (int i = 0; i < n; i++) {
            long x = a[i];
            for (int j = kk; j >= 1; j--) {
                long e = Math.max(endHere[j], best[j - 1]) + x;
                endHere[j] = e;
                best[j] = Math.max(best[j], e);
            }
        }
        System.out.println(best[kk]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['For every number of stretches j two values are kept: end[j], the best total whose j-th stretch ends at the current number, and best[j], the best total so far; a new number x gives end[j] = max(end[j], best[j - 1]) + x and best[j] = max(best[j], end[j]), processed from j = k down to 1. The answer is best[k].'], complexity: 'Time O(n * k), space O(k).' },
    solve(input) {
      const { a: n, b: k, arr: a } = parse2(input); // a table over (number of stretches, position, inside a stretch or not)
      const NEG = -Infinity; const f = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(NEG)); const open = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(NEG)); for (let i = 0; i <= n; i++) f[0][i] = 0;
      for (let j = 1; j <= k; j++) for (let i = 1; i <= n; i++) { open[j][i] = Math.max(open[j][i - 1], f[j - 1][i - 1]) + a[i - 1]; f[j][i] = Math.max(f[j][i - 1], open[j][i]); } return String(f[k][n]);
    },
    tests() {
      const g = rng(2104); const out = ['8 2\n1 -2 3 4 -1 2 -5 6\n', '3 3\n-1 -2 -3\n', '1 1\n5\n', '5 1\n-3 4 -1 2 1\n'];
      const brute = (input) => { const { a: n, b: k, arr: a } = parse2(input); let best = -Infinity; const go = (i, left, sum) => { if (left === 0) { best = Math.max(best, sum); return; } for (let s = i; s < n; s++) { let t = 0; for (let e = s; e < n; e++) { t += a[e]; go(e + 1, left - 1, sum + t); } } }; go(0, k, 0); return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 9); return head2(n, randInt(g, 1, Math.min(n, 4)), randArray(g, n, -9, 9)); }, (i) => this.solve(i), brute, 400);
      for (const [n, k, lo, hi] of [[10, 3, -10, 10], [100, 10, -100, 100], [1000, 50, -1000, 1000], [5000, 100, -1000, 1000], [5000, 100, -1000, 1000], [5000, 1, -1000, 1000], [5000, 100, -1000, 0], [5000, 100, 0, 1000], [100, 100, -1000, 1000], [4999, 99, -1000, 1000], [5000, 50, -1, 1]]) out.push(head2(n, k, randArray(g, n, lo, hi)));
      out.push(head2(5000, 100, many(5000, (i) => (i % 2 ? -1000 : 1000))), head2(5000, 100, many(5000, (i) => (i % 50 < 25 ? 1000 : -1000))), head2(5000, 100, new Array(5000).fill(-1000)));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `d`: the number of jobs and the number of days.', 'The second line has `n` numbers: the difficulty of each job, in the order in which they must be done.'],
    constraints: ['1 <= n <= 300', '1 <= d <= 10', '0 <= each difficulty <= 1000'],
    slug: 'job-schedule-difficulty',
    title: 'Split the Jobs Into d Days With the Least Total Difficulty',
    tags: ['dp', 'partition', 'scheduling', 'running-maximum'],
    concept: {
      title: 'Choose where the last day starts, and keep a running maximum as the day grows backwards',
      body: [
        'Jobs must be done **in the given order**, and every day at least one job is done: the jobs are cut into exactly `d` groups of consecutive jobs (one group per day). The difficulty of a day is the **largest** difficulty among its jobs, and the difficulty of the schedule is the **sum** of the daily difficulties. Find the smallest possible difficulty, or -1 if there are fewer jobs than days. For the jobs `6 5 4 3 2 1` and `d = 2` the answer is 7: do `6 5 4 3 2` on the first day (difficulty 6) and `1` on the second (difficulty 1).',
        'Let `best(day, i)` be the smallest difficulty of doing the **first `i` jobs in exactly `day` days**. The last day does the jobs `j .. i - 1` for some `j`, and the earlier days do the first `j` jobs in `day - 1` days: **`best(day, i) = min over j of best(day - 1, j) + max(job[j .. i - 1])`**. Start with `best(0, 0) = 0` and everything else impossible. To evaluate the maximum quickly, let `j` go **downwards from `i - 1`** and update a running maximum with each step, instead of searching the range again.',
        { code: 'prev = [INF] * (n + 1)\nprev[0] = 0\nfor day in range(1, d + 1):\n    cur = [INF] * (n + 1)\n    for i in range(day, n + 1):\n        top = 0\n        for j in range(i - 1, day - 2, -1):          # the last day does the jobs j .. i - 1\n            top = max(top, jobs[j])\n            cur[i] = min(cur[i], prev[j] + top)\n    prev = cur\nprint(prev[n])' },
        'There are `d * n` states and `n` choices for each: O(d * n^2), about 450 000 steps for 300 jobs and 10 days. Always check the case `n < d` first: every day needs a job, so the answer is -1. The running maximum is the standard way to make "the maximum of a growing range" cost O(1).'
      ]
    },
    statement: ['`n` jobs with difficulties are given in the order in which they must be done. They are split into exactly `d` days, each day doing a non-empty group of consecutive jobs. The difficulty of a day is the largest difficulty of its jobs; the difficulty of the schedule is the sum over the days. Print the smallest difficulty, or -1 if it is impossible (`n < d`).'],
    outputFormat: ['Print the smallest difficulty, or -1.'],
    examples: [{ input: '6 2\n6 5 4 3 2 1\n', note: 'Day one: 6 5 4 3 2 (difficulty 6), day two: 1 (difficulty 1): 7.' }, { input: '2 3\n9 9\n', note: 'Fewer jobs than days: -1.' }],
    hints: ['Let best(day, i) be the smallest difficulty of doing the first i jobs in exactly day days.', 'The last day does the jobs j..i-1: best(day - 1, j) + max of those jobs.', 'Let j go downwards and keep a running maximum.'],
    program: {
      io: ['n:int d:int', 'jobs:int[n]'],
      fast: true,
      python: r`
        INF = 10 ** 18
        if n < d:
            print(-1)
        else:
            prev = [INF] * (n + 1)
            prev[0] = 0
            for day in range(1, d + 1):
                cur = [INF] * (n + 1)
                for i in range(day, n + 1):
                    top = 0
                    best = INF
                    for j in range(i - 1, day - 2, -1):
                        if jobs[j] > top:
                            top = jobs[j]
                        v = prev[j] + top
                        if v < best:
                            best = v
                    cur[i] = best
                prev = cur
            print(prev[n])`,
      cpp: r`
        const long long INF = 1000000000000000000LL;
        if (n < d) {
            cout << -1 << "\n";
        } else {
            vector<long long> prev(n + 1, INF), cur(n + 1, INF);
            prev[0] = 0;
            for (int day = 1; day <= d; day++) {
                fill(cur.begin(), cur.end(), INF);
                for (int i = day; i <= n; i++) {
                    long long top = 0;
                    for (int j = i - 1; j >= day - 1; j--) {
                        top = max(top, jobs[j]);
                        cur[i] = min(cur[i], prev[j] + top);
                    }
                }
                swap(prev, cur);
            }
            cout << prev[n] << "\n";
        }`,
      java: r`
        final long INF = 1000000000000000000L;
        if (n < d) {
            System.out.println(-1);
        } else {
            int count = (int) n, days = (int) d;
            long[] prev = new long[count + 1];
            long[] cur = new long[count + 1];
            Arrays.fill(prev, INF);
            prev[0] = 0;
            for (int day = 1; day <= days; day++) {
                Arrays.fill(cur, INF);
                for (int i = day; i <= count; i++) {
                    long top = 0;
                    for (int j = i - 1; j >= day - 1; j--) {
                        top = Math.max(top, jobs[j]);
                        cur[i] = Math.min(cur[i], prev[j] + top);
                    }
                }
                long[] swap = prev;
                prev = cur;
                cur = swap;
            }
            System.out.println(prev[count]);
        }`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['If there are fewer jobs than days the answer is -1. Otherwise best(day, i), the smallest difficulty of the first i jobs in exactly day days, is the minimum over the start j of the last day of best(day - 1, j) plus the maximum of the jobs j..i-1, kept as a running maximum while j goes down. The answer is best(d, n).'], complexity: 'Time O(d * n^2), space O(n).' },
    solve(input) {
      const { a: n, b: d, arr: jobs } = parse2(input); if (n < d) return '-1'; const memo = new Map(); // top-down with memory: the jobs from position i on, in `left` days
      const go = (i, left) => { if (left === 0) return i === n ? 0 : Infinity; if (n - i < left) return Infinity; const key = i * 20 + left; if (memo.has(key)) return memo.get(key); let best = Infinity, top = 0; for (let j = i; j <= n - left; j++) { top = Math.max(top, jobs[j]); best = Math.min(best, top + go(j + 1, left - 1)); } memo.set(key, best); return best; };
      return String(go(0, d));
    },
    tests() {
      const g = rng(2105); const out = ['6 2\n6 5 4 3 2 1\n', '2 3\n9 9\n', '1 1\n5\n', '3 3\n1 2 3\n', '4 1\n1 5 2 3\n'];
      const brute = (input) => { const { a: n, b: d, arr: jobs } = parse2(input); if (n < d) return '-1'; let best = Infinity; const go = (start, daysLeft, sum) => { if (daysLeft === 0) { if (start === n) best = Math.min(best, sum); return; } let top = 0; for (let e = start; e < n; e++) { top = Math.max(top, jobs[e]); go(e + 1, daysLeft - 1, sum + top); } }; go(0, d, 0); return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 9); return head2(n, randInt(g, 1, 4), randArray(g, n, 0, 9)); }, (i) => this.solve(i), brute, 500);
      for (const [n, d, hi] of [[10, 3, 20], [50, 5, 100], [100, 10, 1000], [300, 10, 1000], [300, 10, 1000], [300, 1, 1000], [300, 10, 1], [300, 10, 0], [299, 9, 1000], [10, 10, 1000], [9, 10, 1000]]) out.push(head2(n, d, randArray(g, n, 0, hi)));
      out.push(head2(300, 10, many(300, (i) => 1000 - i)), head2(300, 10, many(300, (i) => i)), head2(300, 10, many(300, (i) => (i % 2 ? 1000 : 0))), head2(300, 10, new Array(300).fill(1000)));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of words.', 'The second line has `n` different words.'],
    constraints: ['1 <= n <= 12', '1 <= length of each word <= 20', 'All words consist of lowercase English letters and are different.'],
    slug: 'shortest-common-superstring',
    title: 'The Shortest Word That Contains All the Given Words',
    tags: ['dp', 'bitmask', 'tsp', 'strings'],
    concept: {
      title: 'Overlap the words in some order: it becomes a travelling-salesman problem on the overlaps',
      body: [
        'Find the length of the **shortest string that contains every given word** as a substring. For `abc bcd cde` the answer is 5 (`abcde`); for `ab ba` it is 3 (`aba`). Words that are substrings of other words can be dropped, as they come for free. After that, the shortest string is made by putting the words in some **order** and gluing neighbours with the longest possible **overlap** (the longest suffix of the first word that is a prefix of the second).',
        'So the problem becomes: choose the order of the words that minimises the total length. Let `over[i][j]` be the overlap of the word `i` with the word `j` placed after it. An order `w1, w2, ..., wm` has the length `len(w1) + sum of (len(w[k+1]) - over[w[k]][w[k+1]])`. This is a **path through all words with the cheapest total cost**: the travelling salesman problem, solved by the bitmask DP. Let `dp[mask][last]` be the shortest string length that contains the words of `mask` and **ends with the word `last`**: **`dp[mask | (1 << j)][j] = min(dp[mask][i] + len(w[j]) - over[i][j])`**, starting from `dp[1 << i][i] = len(w[i])`. The answer is the minimum over `last` of `dp[full][last]`.',
        { code: 'words = [w for w in set(words) if not any(w != v and w in v for v in words)]   # drop contained words\nm = len(words)\nover = [[0] * m for _ in range(m)]\nfor i in range(m):\n    for j in range(m):\n        if i != j:\n            for k in range(min(len(words[i]), len(words[j])), 0, -1):\n                if words[i].endswith(words[j][:k]):\n                    over[i][j] = k; break\n# dp[mask][last] as in the travelling salesman problem' },
        'Why is gluing with the maximum overlap right? If no word is inside another one, then for a fixed order, a larger overlap between neighbours always gives a shorter string, and the overlaps of different neighbour pairs do not interfere. With 12 words there are `2^12 * 12 * 12` = 590 000 steps, instead of 12! orders. The shortest superstring problem is a famous hard problem (it is used to model DNA assembly), and for a small number of words this is the exact method.'
      ]
    },
    statement: ['`n` different words are given. Print the length of the shortest string that contains every one of the words as a substring.'],
    outputFormat: ['Print the length of the shortest such string.'],
    examples: [{ input: '3\nabc bcd cde\n', note: 'The string abcde contains all three words: 5.' }, { input: '2\nab ba\n', note: 'The string aba (or bab) contains both words: 3.' }],
    hints: ['Remove the words that are substrings of other words.', 'Compute over[i][j], the longest suffix of word i that is a prefix of word j.', 'Use the bitmask DP of the travelling salesman problem: dp[mask][last] = the shortest length ending with the word last.'],
    program: {
      io: ['n:int', 'words:word[n]'],
      fast: true,
      python: r`
        distinct = set(words)
        kept = [w for w in distinct if not any(w != v and w in v for v in distinct)]
        m = len(kept)
        over = [[0] * m for _ in range(m)]
        for i in range(m):
            for j in range(m):
                if i != j:
                    for k in range(min(len(kept[i]), len(kept[j])), 0, -1):
                        if kept[i].endswith(kept[j][:k]):
                            over[i][j] = k
                            break
        INF = 10 ** 9
        full = (1 << m) - 1
        dp = [[INF] * m for _ in range(1 << m)]
        for i in range(m):
            dp[1 << i][i] = len(kept[i])
        for mask in range(1, 1 << m):
            for i in range(m):
                cur = dp[mask][i]
                if cur == INF:
                    continue
                for j in range(m):
                    if not (mask >> j) & 1:
                        v = cur + len(kept[j]) - over[i][j]
                        nm = mask | (1 << j)
                        if v < dp[nm][j]:
                            dp[nm][j] = v
        print(min(dp[full]))`,
      cpp: r`
        set<string> distinct(words.begin(), words.end());
        vector<string> kept;
        for (const string& w : distinct) {
            bool inside = false;
            for (const string& v : distinct) if (v != w && v.find(w) != string::npos) inside = true;
            if (!inside) kept.push_back(w);
        }
        int m = (int)kept.size();
        vector<vector<int>> over(m, vector<int>(m, 0));
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < m; j++) {
                if (i == j) continue;
                for (int k = (int)min(kept[i].size(), kept[j].size()); k >= 1; k--) {
                    if (kept[i].compare(kept[i].size() - k, k, kept[j], 0, k) == 0) { over[i][j] = k; break; }
                }
            }
        }
        const int INF = 1000000000;
        int full = (1 << m) - 1;
        vector<vector<int>> dp(1 << m, vector<int>(m, INF));
        for (int i = 0; i < m; i++) dp[1 << i][i] = (int)kept[i].size();
        for (int mask = 1; mask <= full; mask++) {
            for (int i = 0; i < m; i++) {
                int cur = dp[mask][i];
                if (cur == INF) continue;
                for (int j = 0; j < m; j++) {
                    if (mask >> j & 1) continue;
                    int nm = mask | (1 << j);
                    dp[nm][j] = min(dp[nm][j], cur + (int)kept[j].size() - over[i][j]);
                }
            }
        }
        cout << *min_element(dp[full].begin(), dp[full].end()) << "\n";`,
      java: r`
        TreeSet<String> distinct = new TreeSet<>();
        for (int k = 0; k < n; k++) distinct.add(words[k]);
        ArrayList<String> keptList = new ArrayList<>();
        for (String w : distinct) {
            boolean inside = false;
            for (String v : distinct) if (!v.equals(w) && v.contains(w)) inside = true;
            if (!inside) keptList.add(w);
        }
        int m = keptList.size();
        String[] kept = keptList.toArray(new String[0]);
        int[][] over = new int[m][m];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < m; j++) {
                if (i == j) continue;
                for (int k = Math.min(kept[i].length(), kept[j].length()); k >= 1; k--) {
                    if (kept[i].endsWith(kept[j].substring(0, k))) { over[i][j] = k; break; }
                }
            }
        }
        final int INF = 1000000000;
        int full = (1 << m) - 1;
        int[][] dp = new int[1 << m][m];
        for (int[] row : dp) Arrays.fill(row, INF);
        for (int i = 0; i < m; i++) dp[1 << i][i] = kept[i].length();
        for (int mask = 1; mask <= full; mask++) {
            for (int i = 0; i < m; i++) {
                int cur = dp[mask][i];
                if (cur == INF) continue;
                for (int j = 0; j < m; j++) {
                    if ((mask >> j & 1) != 0) continue;
                    int nm = mask | (1 << j);
                    dp[nm][j] = Math.min(dp[nm][j], cur + kept[j].length() - over[i][j]);
                }
            }
        }
        int answer = INF;
        for (int i = 0; i < m; i++) answer = Math.min(answer, dp[full][i]);
        System.out.println(answer);`,
      includes: ['<set>', '<algorithm>']
    },
    solution: { explanation: ['Words contained in other words are dropped; over[i][j] is the longest suffix of the word i that is a prefix of the word j. dp[mask][last] is the shortest length of a string that contains the words of mask in some order and ends with the word last: extending with the word j adds its length minus the overlap. The answer is the minimum of dp[full][last].'], complexity: 'Time O(2^m * m^2 + m^2 * L), space O(2^m * m).' },
    solve(input) {
      const ws = rows(input)[1].split(' '); const distinct = [...new Set(ws)]; const kept = distinct.filter((w) => !distinct.some((v) => v !== w && v.includes(w))); const m = kept.length;
      const overlap = (a, b) => { for (let k = Math.min(a.length, b.length); k >= 1; k--) if (a.endsWith(b.slice(0, k))) return k; return 0; };
      if (m <= 8) { let best = Infinity; for (const perm of permutations(m)) { let len = kept[perm[0]].length; for (let t = 1; t < m; t++) len += kept[perm[t]].length - overlap(kept[perm[t - 1]], kept[perm[t]]); best = Math.min(best, len); } return String(best); }
      const over = many(m, (i) => many(m, (j) => (i === j ? 0 : overlap(kept[i], kept[j])))); const INF = 1e9; const dp = Array.from({ length: 1 << m }, () => new Array(m).fill(INF)); for (let i = 0; i < m; i++) dp[1 << i][i] = kept[i].length;
      for (let mask = 1; mask < (1 << m); mask++) for (let i = 0; i < m; i++) { if (dp[mask][i] === INF) continue; for (let j = 0; j < m; j++) if (!(mask >> j & 1)) dp[mask | (1 << j)][j] = Math.min(dp[mask | (1 << j)][j], dp[mask][i] + kept[j].length - over[i][j]); } return String(Math.min(...dp[(1 << m) - 1]));
    },
    tests() {
      const g = rng(2106); const out = ['3\nabc bcd cde\n', '2\nab ba\n', '1\nabc\n', '2\nabc bc\n', '3\nab bc ca\n'];
      const distinctWords = (n, maxLen, al) => { const set = new Set(); let guard = 0; while (set.size < n && guard++ < 100000) set.add(randWord(g, randInt(g, 1, maxLen), al)); return [...set]; };
      const make = (words) => `${words.length}\n${words.join(' ')}\n`;
      const brute = (input) => { const ws = rows(input)[1].split(' '); let len = 1; for (;;) { const total = 2 ** len; for (let m = 0; m < total; m++) { let s = ''; for (let i = 0; i < len; i++) s += (m >> i & 1) ? 'b' : 'a'; if (ws.every((w) => s.includes(w))) return String(len); } len++; } };
      crossCheck(() => make(distinctWords(randInt(g, 1, 4), 3, 'ab')), (i) => this.solve(i), brute, 300);
      for (const [n, ml, al] of [[5, 4, 'ab'], [8, 6, 'abc'], [10, 8, 'abc'], [12, 20, 'abcdefghijklmnopqrstuvwxyz'], [12, 10, 'ab'], [12, 8, 'abc'], [12, 20, 'ab'], [11, 12, 'abcd'], [12, 5, 'abc']]) out.push(make(distinctWords(n, ml, al)));
      // words cut from one long random word, so that they overlap a lot
      for (let k = 0; k < 3; k++) { const long = randWord(g, 80, 'abcd'); const set = new Set(); while (set.size < 12) { const st = randInt(g, 0, 60); set.add(long.slice(st, st + randInt(g, 8, 20))); } out.push(make([...set])); }
      out.push(make(many(12, (i) => 'a'.repeat(i + 1) + 'b')), make(many(12, (i) => String.fromCharCode(97 + i) + String.fromCharCode(97 + (i + 1) % 12))));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['One line with two numbers `m` and `n`: the number of rows and the number of columns of the grid.'],
    constraints: ['1 <= m <= 5', '1 <= n <= 1000'],
    slug: 'three-colour-grid-count',
    title: 'Colour the Grid With Three Colours and No Equal Neighbours',
    tags: ['dp', 'profile-dp', 'column-states', 'counting'],
    concept: {
      title: 'The state is the colouring of one whole column; two columns can follow each other if they differ in every row',
      body: [
        'Every cell of an `m` by `n` grid is painted red, green or blue, and **two cells that share a side must have different colours**. How many such colourings are there? A 1 by 1 grid has 3, a 1 by 2 grid has 6, a 5 by 5 grid has 580986. Print the count modulo 1 000 000 007.',
        'The number of rows is small (at most 5), so a whole **column can be a state**. A column is a list of `m` colours with no two vertical neighbours equal; there are `3 * 2^(m-1)` of them (48 for `m = 5`). Two columns can stand next to each other if in **every row** their colours differ. Let `ways[s]` be the number of colourings of the first columns so that the last column is the state `s`. The first column can be any state: `ways[s] = 1`. A new column in the state `s` can follow every state `t` that is compatible with it: **`new[s] = sum of ways[t] over the states t compatible with s`**. The answer is the sum of all `ways` after `n` columns.',
        { code: 'states = [c for c in product(range(3), repeat=m) if all(c[i] != c[i + 1] for i in range(m - 1))]\nS = len(states)\nnbr = [[j for j in range(S) if all(states[i][r] != states[j][r] for r in range(m))] for i in range(S)]\nways = [1] * S\nfor _ in range(n - 1):\n    ways = [sum(ways[j] for j in nbr[i]) % MOD for i in range(S)]\nprint(sum(ways) % MOD)' },
        'The compatibility is computed once; every column then costs the number of compatible pairs (a few hundred), so the whole work is `n * 48 * 48` at most, about 2 million steps. This is a *transfer matrix* method: the number of colourings of a long grid is a matrix power, and for a huge `n` it could be computed with repeated squaring. It is the same idea as the domino tilings, with a column of colours instead of a column of bits.'
      ]
    },
    statement: ['Each cell of an `m` by `n` grid is painted with one of three colours so that no two cells sharing a side have the same colour. Print the number of different colourings, modulo 1000000007.'],
    outputFormat: ['Print the number of colourings modulo 1000000007.'],
    examples: [{ input: '1 1\n', note: 'Any of the 3 colours: 3.' }, { input: '1 2\n', note: 'Two neighbouring cells with different colours: 3 * 2 = 6.' }],
    hints: ['A column is a list of m colours; keep only the columns without equal vertical neighbours.', 'Two columns are compatible if they differ in every row.', 'new[s] is the sum of ways[t] over the compatible columns t; start with ways = 1 for every column.'],
    program: {
      io: ['m:int n:int'],
      fast: true,
      helpers: { python: 'from itertools import product', cpp: '', java: '' },
      python: r`
        MOD = 10 ** 9 + 7
        states = [c for c in product(range(3), repeat=m) if all(c[i] != c[i + 1] for i in range(m - 1))]
        S = len(states)
        nbr = [[j for j in range(S) if all(states[i][r] != states[j][r] for r in range(m))] for i in range(S)]
        ways = [1] * S
        for _ in range(n - 1):
            ways = [sum(ways[j] for j in nbr[i]) % MOD for i in range(S)]
        print(sum(ways) % MOD)`,
      cpp: r`
        const long long MOD = 1000000007;
        int rowsCount = (int)m;
        int total = 1;
        for (int i = 0; i < rowsCount; i++) total *= 3;
        vector<vector<int>> states;
        for (int code = 0; code < total; code++) {
            vector<int> colours(rowsCount);
            int x = code;
            for (int i = 0; i < rowsCount; i++) { colours[i] = x % 3; x /= 3; }
            bool good = true;
            for (int i = 0; i + 1 < rowsCount; i++) if (colours[i] == colours[i + 1]) good = false;
            if (good) states.push_back(colours);
        }
        int S = (int)states.size();
        vector<vector<char>> compatible(S, vector<char>(S, 1));
        for (int i = 0; i < S; i++) for (int j = 0; j < S; j++) for (int r = 0; r < rowsCount; r++) if (states[i][r] == states[j][r]) compatible[i][j] = 0;
        vector<long long> ways(S, 1), next(S);
        for (long long column = 1; column < n; column++) {
            for (int i = 0; i < S; i++) {
                long long sum = 0;
                for (int j = 0; j < S; j++) if (compatible[i][j]) sum += ways[j];
                next[i] = sum % MOD;
            }
            ways = next;
        }
        long long answer = 0;
        for (int i = 0; i < S; i++) answer += ways[i];
        cout << answer % MOD << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int rowsCount = (int) m;
        int total = 1;
        for (int i = 0; i < rowsCount; i++) total *= 3;
        int[][] all = new int[total][rowsCount];
        int S = 0;
        for (int code = 0; code < total; code++) {
            int[] colours = new int[rowsCount];
            int x = code;
            for (int i = 0; i < rowsCount; i++) { colours[i] = x % 3; x /= 3; }
            boolean good = true;
            for (int i = 0; i + 1 < rowsCount; i++) if (colours[i] == colours[i + 1]) good = false;
            if (good) all[S++] = colours;
        }
        boolean[][] compatible = new boolean[S][S];
        for (int i = 0; i < S; i++) {
            for (int j = 0; j < S; j++) {
                boolean ok = true;
                for (int r = 0; r < rowsCount; r++) if (all[i][r] == all[j][r]) ok = false;
                compatible[i][j] = ok;
            }
        }
        long[] ways = new long[S];
        long[] next = new long[S];
        Arrays.fill(ways, 1);
        for (long column = 1; column < n; column++) {
            for (int i = 0; i < S; i++) {
                long sum = 0;
                for (int j = 0; j < S; j++) if (compatible[i][j]) sum += ways[j];
                next[i] = sum % MOD;
            }
            long[] swap = ways;
            ways = next;
            next = swap;
        }
        long answer = 0;
        for (int i = 0; i < S; i++) answer += ways[i];
        System.out.println(answer % MOD);`
    },
    solution: { explanation: ['A state is a colouring of one column without equal vertical neighbours; two columns are compatible when they differ in every row. ways[s] counts the colourings of the first columns whose last column is s: it starts at 1 for every state, and each new column sums the ways of the compatible states. The answer is the sum of all ways after n columns.'], complexity: 'Time O(n * S^2) with S = 3 * 2^(m-1) states, space O(S^2).' },
    solve(input) {
      const [m, n] = nums(input); const states = []; const total = 3 ** m; for (let code = 0; code < total; code++) { const cols = []; let x = code; for (let i = 0; i < m; i++) { cols.push(x % 3); x = Math.floor(x / 3); } if (cols.every((c, i) => i === m - 1 || c !== cols[i + 1])) states.push(cols); }
      const S = states.length; const T = Array.from({ length: S }, (_, i) => Array.from({ length: S }, (_, j) => (states[i].every((c, r) => c !== states[j][r]) ? 1n : 0n))); // the number of colourings is the sum of the entries of 1 * T^(n - 1), by repeated squaring
      const mul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((acc, x, k) => (acc + x * B[k][j]) % MODN, 0n)));
      let R = Array.from({ length: S }, (_, i) => Array.from({ length: S }, (_, j) => (i === j ? 1n : 0n))); let P = T; let e = n - 1; while (e > 0) { if (e & 1) R = mul(R, P); P = mul(P, P); e = Math.floor(e / 2); } let sum = 0n; for (const row of R) for (const x of row) sum += x; return String(sum % MODN);
    },
    tests() {
      const out = ['1 1\n', '1 2\n', '5 5\n', '2 2\n'];
      const brute = (m, n) => { let count = 0; const cells = m * n; const col = new Array(cells).fill(0); const go = (idx) => { if (idx === cells) { count++; return; } const r = idx % m, c = Math.floor(idx / m); for (let x = 0; x < 3; x++) { if (r > 0 && col[idx - 1] === x) continue; if (c > 0 && col[idx - m] === x) continue; col[idx] = x; go(idx + 1); } }; go(0); return count; };
      for (let m = 1; m <= 3; m++) for (let n = 1; n <= 4; n++) if (String(this.solve(`${m} ${n}\n`)) !== String(brute(m, n) % MOD)) throw new Error('reference differs from the search for ' + m + ' x ' + n);
      for (const [m, n] of [[1, 1000], [2, 1000], [3, 1000], [4, 1000], [5, 1000], [5, 999], [5, 500], [5, 100], [4, 777], [3, 50], [5, 1], [5, 2], [1, 1], [2, 1]]) out.push(`${m} ${n}\n`);
      return out;
    }
  }
];
