import { r, rng, randInt, many, nums, rows, shuffle, randArray } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const rowsOfNums = (input, from, count) => { const rs = rows(input); return many(count, (i) => nums(rs[from + i])); };
const lines = (list) => list.map((p) => p.join(' ')).join('\n');
class Fen {
  constructor(n) { this.n = n; this.t = new Array(n + 1).fill(0); }
  add(i, x) { for (; i <= this.n; i += i & -i) this.t[i] += x; }
  sum(i) { let s = 0; for (; i > 0; i -= i & -i) s += this.t[i]; return s; }
}
const dedent = (s) => { const ls = s.replace(/^\n/, '').split('\n'); const ind = Math.min(...ls.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)); return ls.map((l) => l.slice(ind)).join('\n'); };
const lowerBound = (a, v) => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] < v) lo = mid + 1; else hi = mid; } return lo; };
const upperBound = (a, v) => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] <= v) lo = mid + 1; else hi = mid; } return lo; };

const FENWICK = {
  python: r`
    def bit_add(t, i, x):
        n = len(t) - 1
        while i <= n:
            t[i] += x
            i += i & -i

    def bit_sum(t, i):
        s = 0
        while i > 0:
            s += t[i]
            i -= i & -i
        return s`,
  cpp: r`
    void bitAdd(vector<long long>& t, long long i, long long x) {
        long long n = (long long)t.size() - 1;
        for (; i <= n; i += i & -i) t[i] += x;
    }

    long long bitSum(const vector<long long>& t, long long i) {
        long long s = 0;
        for (; i > 0; i -= i & -i) s += t[i];
        return s;
    }`,
  java: r`
    static void bitAdd(long[] t, int i, long x) {
        int n = t.length - 1;
        for (; i <= n; i += i & -i) t[i] += x;
    }

    static long bitSum(long[] t, int i) {
        long s = 0;
        for (; i > 0; i -= i & -i) s += t[i];
        return s;
    }`
};

export default [
  {
    ...medium,
    inputFormat: ['The first line has `q`: the number of operations.', 'Each of the next `q` lines has two numbers `t` and `x`. If `t = 1`, insert the value `x` into the set (a value can be inserted several times). If `t = 2`, remove one copy of `x` (it is in the set). If `t = 3`, print the `x`-th smallest value in the set, counting copies (`x` is at most the size of the set).'],
    constraints: ['1 <= q <= 50000', '1 <= value <= 200000', 'Removals and questions are always valid.'],
    slug: 'kth-smallest-in-a-changing-set',
    title: 'The k-th Smallest Number in a Set That Changes',
    tags: ['fenwick-tree', 'order-statistics', 'binary-lifting', 'multiset'],
    concept: {
      title: 'Walk down the Fenwick tree bit by bit to find the first position whose prefix count reaches k',
      body: [
        'A multiset starts empty. Numbers are inserted and removed, and from time to time a question asks for the **k-th smallest number** (counting repeated copies). After inserting `5, 3, 5, 9` the 1st smallest is 3, the 2nd and 3rd are 5, and the 4th is 9. Sorting the set for every question is too slow, and a sorted array makes insertion O(n).',
        'Keep a Fenwick tree over the values, with `t` counting the copies. The number of copies that are `<= v` is a prefix sum. The k-th smallest is the **smallest value `v` whose prefix count is at least `k`**. A binary search over `v` with a prefix sum inside costs O(log^2), but the tree allows a direct **descent**: start with `pos = 0`; for the steps `2^j` from the largest power of two down to 1, if `pos + step` is inside the tree and `t[pos + step] < k`, then all the values up to `pos + step` hold fewer than `k` copies, so move `pos += step` and decrease `k` by `t[pos]`. At the end the answer is `pos + 1`.',
        { code: 'LOG = 1 << 17                      # the largest power of two not above 200000\ndef kth(k):\n    pos = 0\n    step = LOG\n    while step:\n        if pos + step <= M and t[pos + step] < k:\n            pos += step\n            k -= t[pos]            # skip the copies in this block\n        step >>= 1\n    return pos + 1' },
        'Each cell `t[pos + step]` covers exactly the values `pos + 1 .. pos + step` when `pos` is a multiple of `2 * step`, which is what the descent keeps true, so the sums add up correctly. Insertion and removal are `add(v, +1)` and `add(v, -1)`. Every operation is O(log M).'
      ]
    },
    statement: ['A multiset of numbers starts empty. Process `q` operations: type 1 `x` inserts the number `x`; type 2 `x` removes one copy of `x` (it is guaranteed to be in the set); type 3 `x` asks for the `x`-th smallest number of the set, counting equal numbers separately (it is guaranteed that the set has at least `x` numbers). Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 3, separated by spaces.'],
    examples: [{ input: '7\n1 5\n1 3\n1 5\n1 9\n3 3\n2 5\n3 3\n', note: 'The sorted set is 3 5 5 9, so the 3rd is 5; after removing one 5 it is 3 5 9 and the 3rd is 9: 5 9.' }],
    hints: ['Keep a Fenwick tree with the number of copies of every value.', 'The k-th smallest is the first value whose prefix count is at least k.', 'Find it by a descent over powers of two instead of a binary search.'],
    program: {
      io: ['q:int', 'ops:int[q][2]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        m = 200000
        t = [0] * (m + 1)
        out = []
        for kind, x in ops:
            if kind == 1:
                bit_add(t, x, 1)
            elif kind == 2:
                bit_add(t, x, -1)
            else:
                pos = 0
                step = 1 << 17
                k = x
                while step:
                    if pos + step <= m and t[pos + step] < k:
                        pos += step
                        k -= t[pos]
                    step >>= 1
                out.append(pos + 1)
        print(*out)`,
      cpp: r`
        const long long M = 200000;
        vector<long long> t(M + 1, 0);
        string out;
        for (long long i = 0; i < q; i++) {
            long long kind = ops[i][0], x = ops[i][1];
            if (kind == 1) {
                bitAdd(t, x, 1);
            } else if (kind == 2) {
                bitAdd(t, x, -1);
            } else {
                long long pos = 0, k = x;
                for (long long step = 1LL << 17; step > 0; step >>= 1) {
                    if (pos + step <= M && t[pos + step] < k) {
                        pos += step;
                        k -= t[pos];
                    }
                }
                if (!out.empty()) out += " ";
                out += to_string(pos + 1);
            }
        }
        cout << out << "\n";`,
      java: r`
        int m = 200000;
        long[] t = new long[m + 1];
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long kind = ops[i][0];
            int x = (int) ops[i][1];
            if (kind == 1) {
                bitAdd(t, x, 1);
            } else if (kind == 2) {
                bitAdd(t, x, -1);
            } else {
                int pos = 0;
                long k = x;
                for (int step = 1 << 17; step > 0; step >>= 1) {
                    if (pos + step <= m && t[pos + step] < k) {
                        pos += step;
                        k -= t[pos];
                    }
                }
                if (out.length() > 0) out.append(" ");
                out.append(pos + 1);
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['A Fenwick tree over the values counts the copies; the k-th smallest is found by a descent over the powers of two that skips every block holding fewer than k copies.'], complexity: 'Time O(q log M), space O(M).' },
    solve(input) {
      const rs = rows(input); const q = Number(rs[0]); const sorted = []; const out = []; for (let i = 0; i < q; i++) { const [t, x] = nums(rs[1 + i]); if (t === 1) sorted.splice(upperBound(sorted, x), 0, x); else if (t === 2) sorted.splice(lowerBound(sorted, x), 1); else out.push(sorted[x - 1]); } return out.join(' '); // a sorted list with binary search insertion
    },
    tests() {
      const g = rng(4301); const out = ['7\n1 5\n1 3\n1 5\n1 9\n3 3\n2 5\n3 3\n', '2\n1 200000\n3 1\n'];
      const make = (q, hi, pInsert) => { const cur = []; const ops = []; for (let i = 0; i < q; i++) { const roll = g(); if (cur.length === 0 || roll < pInsert) { const v = randInt(g, 1, hi); cur.push(v); ops.push([1, v]); } else if (roll < pInsert + (1 - pInsert) / 2) { const idx = randInt(g, 0, cur.length - 1); ops.push([2, cur[idx]]); cur.splice(idx, 1); } else ops.push([3, randInt(g, 1, cur.length)]); } if (cur.length === 0) { ops.push([1, 1]); cur.push(1); } ops.push([3, cur.length]); return `${ops.length}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const q = Number(rs[0]); const cur = []; const out = []; for (let i = 0; i < q; i++) { const [t, x] = nums(rs[1 + i]); if (t === 1) cur.push(x); else if (t === 2) cur.splice(cur.indexOf(x), 1); else out.push(cur.slice().sort((a, b) => a - b)[x - 1]); } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 14), 8, 0.5), (i) => this.solve(i), brute, 800);
      for (const [q, hi, p] of [[20, 50, 0.5], [200, 1000, 0.5], [2000, 200000, 0.5], [49998, 200000, 0.55], [49998, 200000, 0.7], [49998, 30, 0.55], [49997, 200000, 0.45]]) out.push(make(q, hi, p));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `h`, `w` and `q`: the height and the width of the table and the number of operations.', 'Each of the next `q` lines has five numbers `t`, `a`, `b`, `c` and `d`. If `t = 1`, add `c` to the cell in the row `a` and the column `b` (`d` is 0). If `t = 2`, print the sum of the cells in the rows `a` to `c` and the columns `b` to `d`.'],
    constraints: ['1 <= h, w <= 500, 1 <= q <= 20000', 'The table is all zeros at the start.', '|c| <= 10^6 in the additions', 'For a question 1 <= a <= c <= h and 1 <= b <= d <= w.'],
    slug: 'rectangle-sums-with-point-changes',
    title: 'Rectangle Sums on a Table That Changes',
    tags: ['fenwick-tree', '2d', 'point-update', 'rectangle-query'],
    concept: {
      title: 'A Fenwick tree of Fenwick trees: the same lowest-bit jumps in both coordinates',
      body: [
        'A table of `h` rows and `w` columns starts with zeros. Operations **add a number to one cell** and questions ask for the **sum of the cells in a rectangle**. For a 3 by 3 table with 5 added to the cell (2, 2) and 7 to the cell (3, 1), the rectangle of the rows 2 to 3 and the columns 1 to 2 has the sum 12. Summing the rectangle cell by cell is O(h w) per question.',
        'The one-dimensional Fenwick tree extends to two dimensions: `T[i][j]` stores the sum of the rectangle of the rows `i - lowbit(i) + 1 .. i` and the columns `j - lowbit(j) + 1 .. j`. To **add** to the cell (r, c), update every `T[i][j]` with `i` going up from `r` by `i += i & -i` and, inside, `j` going up from `c`. To get the **prefix rectangle** sum `S(r, c)` of the rows `1..r` and the columns `1..c`, go down in both coordinates with `i -= i & -i` and `j -= j & -j`. A rectangle is the usual inclusion-exclusion of four prefix rectangles.',
        { code: 'def add(r, c, x):\n    i = r\n    while i <= h:\n        j = c\n        while j <= w:\n            T[i][j] += x\n            j += j & -j\n        i += i & -i\n\ndef S(r, c):\n    s = 0; i = r\n    while i > 0:\n        j = c\n        while j > 0:\n            s += T[i][j]; j -= j & -j\n        i -= i & -i\n    return s\n\nanswer = S(c, d) - S(a - 1, d) - S(c, b - 1) + S(a - 1, b - 1)' },
        'Each operation takes O(log h * log w) steps (about 80 for a 500 by 500 table), and the memory is O(h w). For a rectangle query four prefix sums are needed, so about 300 steps. The 2D tree is the standard structure for "count points in a rectangle" with online updates.'
      ]
    },
    statement: ['A table with `h` rows and `w` columns contains zeros. Process `q` operations: type 1 `r c x 0` adds `x` to the cell in the row `r` and the column `c`; type 2 `r1 c1 r2 c2` asks for the sum of the cells in the rows `r1` to `r2` and the columns `c1` to `c2`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '3 3 4\n1 2 2 5 0\n1 3 1 7 0\n2 2 1 3 2\n2 1 1 3 3\n', note: 'The rectangle of the rows 2..3 and the columns 1..2 holds 5 and 7: 12. The whole table holds 12 as well: 12 12.' }],
    hints: ['Use a Fenwick tree inside a Fenwick tree.', 'An addition walks up in both coordinates; a prefix sum walks down in both.', 'A rectangle is S(r2, c2) - S(r1 - 1, c2) - S(r2, c1 - 1) + S(r1 - 1, c1 - 1).'],
    program: {
      io: ['h:int w:int q:int', 'ops:int[q][5]'],
      fast: true,
      python: r`
        T = [[0] * (w + 1) for _ in range(h + 1)]

        def prefix(r, c):
            s = 0
            i = r
            while i > 0:
                row = T[i]
                j = c
                while j > 0:
                    s += row[j]
                    j -= j & -j
                i -= i & -i
            return s

        out = []
        for kind, a, b, c, d in ops:
            if kind == 1:
                i = a
                while i <= h:
                    row = T[i]
                    j = b
                    while j <= w:
                        row[j] += c
                        j += j & -j
                    i += i & -i
            else:
                out.append(prefix(c, d) - prefix(a - 1, d) - prefix(c, b - 1) + prefix(a - 1, b - 1))
        print(*out)`,
      cpp: r`
        vector<vector<long long>> T(h + 1, vector<long long>(w + 1, 0));
        auto prefix = [&](long long r, long long c) {
            long long s = 0;
            for (long long i = r; i > 0; i -= i & -i)
                for (long long j = c; j > 0; j -= j & -j) s += T[i][j];
            return s;
        };
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], a = ops[k][1], b = ops[k][2], c = ops[k][3], d = ops[k][4];
            if (kind == 1) {
                for (long long i = a; i <= h; i += i & -i)
                    for (long long j = b; j <= w; j += j & -j) T[i][j] += c;
            } else {
                if (!out.empty()) out += " ";
                out += to_string(prefix(c, d) - prefix(a - 1, d) - prefix(c, b - 1) + prefix(a - 1, b - 1));
            }
        }
        cout << out << "\n";`,
      java: r`
        int ch = (int) h, cw = (int) w;
        long[][] T = new long[ch + 1][cw + 1];
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int a = (int) ops[k][1], b = (int) ops[k][2], c = (int) ops[k][3], d = (int) ops[k][4];
            if (kind == 1) {
                for (int i = a; i <= ch; i += i & -i)
                    for (int j = b; j <= cw; j += j & -j) T[i][j] += ops[k][3];
            } else {
                long total = 0;
                for (int pass = 0; pass < 4; pass++) {
                    int r = (pass & 1) == 0 ? c : a - 1;
                    int cc = (pass & 2) == 0 ? d : b - 1;
                    long sign = (Integer.bitCount(pass) % 2 == 0) ? 1 : -1;
                    long s = 0;
                    for (int i = r; i > 0; i -= i & -i)
                        for (int j = cc; j > 0; j -= j & -j) s += T[i][j];
                    total += sign * s;
                }
                if (out.length() > 0) out.append(" ");
                out.append(total);
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['A two-dimensional Fenwick tree stores partial rectangle sums; an addition updates the cells reached by the lowest-bit jumps in both coordinates, and a rectangle sum combines four prefix rectangles.'], complexity: 'Time O(q log h log w), space O(h w).' },
    solve(input) {
      const rs = rows(input); const [h, w, q] = nums(rs[0]); const grid = Array.from({ length: h + 1 }, () => new Array(w + 1).fill(0)); // prefix sums per row, rebuilt lazily with one Fenwick tree per row
      const rowTrees = Array.from({ length: h + 1 }, () => new Fen(w)); const out = []; for (let k = 0; k < q; k++) { const [t, a, b, c, d] = nums(rs[1 + k]); if (t === 1) rowTrees[a].add(b, c); else { let s = 0; for (let i = a; i <= c; i++) s += rowTrees[i].sum(d) - rowTrees[i].sum(b - 1); out.push(s); } } return out.join(' ');
    },
    tests() {
      const g = rng(4302); const out = ['3 3 4\n1 2 2 5 0\n1 3 1 7 0\n2 2 1 3 2\n2 1 1 3 3\n', '1 1 3\n2 1 1 1 1\n1 1 1 -4 0\n2 1 1 1 1\n'];
      const make = (h, w, q, hi) => { const ops = many(q, () => { if (g() < 0.5) return [1, randInt(g, 1, h), randInt(g, 1, w), randInt(g, -hi, hi), 0]; const a = randInt(g, 1, h), b = randInt(g, 1, w); return [2, a, b, randInt(g, a, h), randInt(g, b, w)]; }); ops.push([2, 1, 1, h, w]); return `${h} ${w} ${q + 1}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [h, w, q] = nums(rs[0]); const cell = Array.from({ length: h + 1 }, () => new Array(w + 1).fill(0)); const out = []; for (let k = 0; k < q; k++) { const [t, a, b, c, d] = nums(rs[1 + k]); if (t === 1) cell[a][b] += c; else { let s = 0; for (let i = a; i <= c; i++) for (let j = b; j <= d; j++) s += cell[i][j]; out.push(s); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 6), randInt(g, 1, 6), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 800);
      for (const [h, w, q, hi] of [[10, 10, 30, 100], [100, 100, 500, 1000], [500, 500, 19999, 1000000], [500, 500, 19999, 1000000], [500, 1, 19999, 1000000], [1, 500, 19999, 5], [499, 500, 19999, 1000000]]) out.push(make(h, w, q, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has four numbers `t`, `l`, `r` and `x`. If `t = 1`, add `x` to every cell from `l` to `r`. If `t = 2`, print the sum of the cells from `l` to `r` (`x` is 0).'],
    constraints: ['1 <= n, q <= 30000', '|each cell| <= 10^6, |x| <= 10^6', 'Cells are numbered from 1; 1 <= l <= r <= n.'],
    slug: 'add-to-a-range-sum-a-range',
    title: 'Add to a Range, Sum a Range',
    tags: ['fenwick-tree', 'range-update', 'range-query', 'two-trees'],
    concept: {
      title: 'Two Fenwick trees over the difference array give the prefix sums of the changed row',
      body: [
        'Now both operations work on ranges: **add the same number to every cell of a range** and **sum a range**. With the row `1 1 1 1`, adding 5 to the cells 2 to 3 gives `1 6 6 1`, and the sum of the cells 1 to 3 is 13. A simple Fenwick tree handles point updates and range sums, or range updates and point queries, but not both together.',
        'Let `d[i] = a[i] - a[i-1]` be the differences, so `a[i] = d[1] + ... + d[i]`. The prefix sum of the row is `P(k) = sum over i <= k of a[i] = sum over j <= k of d[j] * (k - j + 1) = (k + 1) * sum d[j] - sum d[j] * j`. So keep **two Fenwick trees**: `B1` over `d[j]` and `B2` over `d[j] * j`, and compute `P(k) = (k + 1) * B1.prefix(k) - B2.prefix(k)`. Adding `x` to the cells `l..r` changes two differences: `d[l] += x` and `d[r + 1] -= x`, so update both trees at `l` with `x` and `x * l`, and at `r + 1` with `-x` and `-x * (r + 1)`. The original row is handled by a prefix-sum table `pre`.',
        { code: 'def add_range(l, r, x):\n    bit_add(B1, l, x);       bit_add(B2, l, x * l)\n    bit_add(B1, r + 1, -x);  bit_add(B2, r + 1, -x * (r + 1))\n\ndef P(k):                          # the sum of the first k cells\n    return pre[k] + (k + 1) * bit_sum(B1, k) - bit_sum(B2, k)\n\nanswer = P(r) - P(l - 1)' },
        'Check with an addition of `x` to the cells 2..3 of a row of ones: the differences are `d[2] = x` and `d[4] = -x`, so `P(3) = 3 + (3 + 1) * x - 2x = 3 + 2x`, the correct sum because two of the three cells grew by `x`. Everything is O(log n) per operation. Sums reach about 10^15, so use 64-bit numbers.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `l r x` adds `x` to every number at the positions `l` to `r`; type 2 `l r 0` asks for the sum of the numbers at the positions `l` to `r`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '4 3\n1 1 1 1\n1 2 3 5\n2 1 3 0\n2 3 4 0\n', note: 'After the addition the row is 1 6 6 1: the sum of the cells 1..3 is 13 and of the cells 3..4 is 7. The output is 13 7.' }],
    hints: ['Work with the differences d[i] = a[i] - a[i - 1].', 'The prefix sum of the row is (k + 1) * sum d[j] - sum d[j] * j.', 'Keep one Fenwick tree for d[j] and one for d[j] * j.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][4]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        pre = [0] * (n + 1)
        for i in range(n):
            pre[i + 1] = pre[i] + a[i]
        b1 = [0] * (n + 2)
        b2 = [0] * (n + 2)
        out = []
        for kind, l, rr, x in ops:
            if kind == 1:
                bit_add(b1, l, x)
                bit_add(b2, l, x * l)
                bit_add(b1, rr + 1, -x)
                bit_add(b2, rr + 1, -x * (rr + 1))
            else:
                hi = pre[rr] + (rr + 1) * bit_sum(b1, rr) - bit_sum(b2, rr)
                lo = pre[l - 1] + l * bit_sum(b1, l - 1) - bit_sum(b2, l - 1)
                out.append(hi - lo)
        print(*out)`,
      cpp: r`
        vector<long long> pre(n + 1, 0), b1(n + 2, 0), b2(n + 2, 0);
        for (long long i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], l = ops[k][1], rr = ops[k][2], x = ops[k][3];
            if (kind == 1) {
                bitAdd(b1, l, x);
                bitAdd(b2, l, x * l);
                bitAdd(b1, rr + 1, -x);
                bitAdd(b2, rr + 1, -x * (rr + 1));
            } else {
                long long hi = pre[rr] + (rr + 1) * bitSum(b1, rr) - bitSum(b2, rr);
                long long lo = pre[l - 1] + l * bitSum(b1, l - 1) - bitSum(b2, l - 1);
                if (!out.empty()) out += " ";
                out += to_string(hi - lo);
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        long[] pre = new long[cn + 1];
        long[] b1 = new long[cn + 2];
        long[] b2 = new long[cn + 2];
        for (int i = 0; i < cn; i++) pre[i + 1] = pre[i] + a[i];
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int l = (int) ops[k][1], rr = (int) ops[k][2];
            long x = ops[k][3];
            if (kind == 1) {
                bitAdd(b1, l, x);
                bitAdd(b2, l, x * l);
                bitAdd(b1, rr + 1, -x);
                bitAdd(b2, rr + 1, -x * (rr + 1));
            } else {
                long hi = pre[rr] + (long) (rr + 1) * bitSum(b1, rr) - bitSum(b2, rr);
                long lo = pre[l - 1] + (long) l * bitSum(b1, l - 1) - bitSum(b2, l - 1);
                if (out.length() > 0) out.append(" ");
                out.append(hi - lo);
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['Two Fenwick trees over the differences d[j] and d[j] * j give the prefix sum of the changed row as pre[k] + (k + 1) * B1(k) - B2(k); a range addition changes two differences.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const B = 128; const sums = new Array(Math.ceil(n / B)).fill(0); const lazy = new Array(sums.length).fill(0); a.forEach((v, i) => { sums[Math.floor(i / B)] += v; }); const out = []; // blocks with a lazy value
      for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); const lo = l - 1, hi = rr - 1; let s = 0; for (let i = lo; i <= hi;) { const b = Math.floor(i / B); const bs = b * B, be = Math.min(n - 1, bs + B - 1); if (i === bs && be <= hi) { if (t === 1) lazy[b] += x; else s += sums[b] + lazy[b] * (be - bs + 1); i = be + 1; } else { if (t === 1) { a[i] += x; sums[b] += x; } else s += a[i] + lazy[b]; i++; } } if (t === 2) out.push(s); } return out.join(' ');
    },
    tests() {
      const g = rng(4303); const out = ['4 3\n1 1 1 1\n1 2 3 5\n2 1 3 0\n2 3 4 0\n', '1 2\n5\n1 1 1 -2\n2 1 1 0\n'];
      const make = (n, q, hi) => { const ops = many(q, () => { const l = randInt(g, 1, n); const rr = randInt(g, l, n); return g() < 0.5 ? [1, l, rr, randInt(g, -hi, hi)] : [2, l, rr, 0]; }); ops.push([2, 1, n, 0]); return `${n} ${q + 1}\n${randArray(g, n, -hi, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) { for (let i = l - 1; i < rr; i++) a[i] += x; } else { let s = 0; for (let i = l - 1; i < rr; i++) s += a[i]; out.push(s); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000], [30000, 29999, 1000000], [30000, 29999, 1000000], [30000, 29999, 3], [29999, 29999, 1000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 50000', '|each number| <= 10^9'],
    slug: 'reverse-pairs-double',
    title: 'Count the Pairs Where an Earlier Number Is More Than Double a Later One',
    tags: ['fenwick-tree', 'counting', 'coordinate-compression', 'inversions'],
    concept: {
      title: 'The same scan as for inversions, but ask the tree about 2 * a[j] instead of a[j]',
      body: [
        'Count the pairs of positions `i < j` for which `a[i] > 2 * a[j]`. For `1 3 2 3 1` there are 2 such pairs: `(3, 1)` at the positions 2 and 5, and `(3, 1)` at the positions 4 and 5. A pair of loops costs O(n^2) = 2.5 * 10^9 steps.',
        'This is a variation of counting inversions. Scan the list from left to right and keep the earlier numbers in a Fenwick tree over **compressed values**. For the current number `a[j]` the number of earlier values that are **larger than `2 * a[j]`** is the number of earlier values minus the number of earlier values that are **at most `2 * a[j]`**. The tree is indexed by the rank of the values in the sorted list `u` of all the numbers; the count of values `<= 2 * a[j]` is the prefix sum up to the position `upper_bound(u, 2 * a[j])` (the number of distinct values not above `2 * a[j]`). Then add `a[j]` to the tree.',
        { code: 'u = sorted(set(a))\nrank = {v: i + 1 for i, v in enumerate(u)}\nt = [0] * (len(u) + 1)\ncount = 0\nfor j, v in enumerate(a):\n    k = bisect_right(u, 2 * v)          # distinct values <= 2v have ranks 1..k\n    count += j - prefix(t, k)           # earlier numbers minus those <= 2v\n    add(t, rank[v], 1)' },
        'Note that `2 * a[j]` need not be one of the values of the list, which is why the rank is found by a binary search (an upper bound) and not by a dictionary. For negative numbers the same formula works, because the comparison `a[i] > 2 a[j]` is exact. The answer is at most `n (n - 1) / 2`, so use 64-bit numbers. Time O(n log n).'
      ]
    },
    statement: ['A list of `n` numbers is given. Count the pairs of positions `i < j` with `a[i] > 2 * a[j]`.'],
    outputFormat: ['Print the number of such pairs.'],
    examples: [{ input: '5\n1 3 2 3 1\n', note: 'The pairs are (3, 1) at the positions 2 and 5 and (3, 1) at the positions 4 and 5: 2.' }, { input: '5\n2 4 3 5 1\n', note: 'The pairs are (2,1), (4,1), (3,1), (5,1): 4.' }],
    hints: ['Scan from the left and keep the earlier numbers in a Fenwick tree over ranks.', 'Count the earlier numbers that are at most 2 * a[j], then subtract from j.', 'Find the rank of 2 * a[j] with a binary search (upper bound) in the sorted distinct values.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      helpers: { python: 'from bisect import bisect_right\n\n' + dedent(FENWICK.python), cpp: FENWICK.cpp, java: FENWICK.java },
      python: r`
        u = sorted(set(a))
        rank = {v: i + 1 for i, v in enumerate(u)}
        t = [0] * (len(u) + 1)
        count = 0
        for j in range(n):
            v = a[j]
            k = bisect_right(u, 2 * v)
            count += j - bit_sum(t, k)
            bit_add(t, rank[v], 1)
        print(count)`,
      cpp: r`
        vector<long long> u(a);
        sort(u.begin(), u.end());
        u.erase(unique(u.begin(), u.end()), u.end());
        vector<long long> t(u.size() + 1, 0);
        long long count = 0;
        for (long long j = 0; j < n; j++) {
            long long k = upper_bound(u.begin(), u.end(), 2 * a[j]) - u.begin();
            count += j - bitSum(t, k);
            bitAdd(t, lower_bound(u.begin(), u.end(), a[j]) - u.begin() + 1, 1);
        }
        cout << count << "\n";`,
      java: r`
        int cn = (int) n;
        long[] u = a.clone();
        Arrays.sort(u);
        int m = 0;
        for (int i = 0; i < cn; i++) {
            if (i == 0 || u[i] != u[i - 1]) u[m++] = u[i];
        }
        long[] t = new long[m + 1];
        long count = 0;
        for (int j = 0; j < cn; j++) {
            long target = 2 * a[j];
            int lo = 0, hi = m;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (u[mid] <= target) lo = mid + 1;
                else hi = mid;
            }
            count += j - bitSum(t, lo);
            bitAdd(t, Arrays.binarySearch(u, 0, m, a[j]) + 1, 1);
        }
        System.out.println(count);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Scanning left to right, the number of earlier values at most 2 * a[j] is a prefix sum of a Fenwick tree over the compressed values; the others are counted as j minus that sum.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const a = nums(rows(input)[1]); // merge sort count: sort the left half and the right half, and count with two pointers
      const go = (lo, hi) => { if (hi - lo <= 1) return [0, a.slice(lo, hi)]; const mid = (lo + hi) >> 1; const [c1, left] = go(lo, mid); const [c2, right] = go(mid, hi); let count = c1 + c2; let j = 0; for (const x of left) { while (j < right.length && x > 2 * right[j]) j++; count += j; } const merged = []; let p = 0, q = 0; while (p < left.length || q < right.length) { if (q >= right.length || (p < left.length && left[p] <= right[q])) merged.push(left[p++]); else merged.push(right[q++]); } return [count, merged]; };
      return String(go(0, a.length)[0]);
    },
    tests() {
      const g = rng(4304); const out = ['5\n1 3 2 3 1\n', '5\n2 4 3 5 1\n', '1\n0\n', '3\n-5 -2 -9\n'];
      const make = (n, lo, hi) => `${n}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (input) => { const a = nums(rows(input)[1]); let c = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > 2 * a[j]) c++; return String(c); };
      crossCheck(() => make(randInt(g, 1, 12), -8, 8), (i) => this.solve(i), brute, 800);
      for (const [n, lo, hi] of [[10, -100, 100], [100, -1000, 1000], [1000, -1000000000, 1000000000], [50000, -1000000000, 1000000000], [50000, 0, 1000000000], [50000, 0, 10], [49999, -1000000000, 0]]) out.push(make(n, lo, hi));
      out.push(`50000\n${many(50000, (i) => 1000000000 - i).join(' ')}\n`, `50000\n${many(50000, (i) => (i < 25000 ? 1000000000 - i : 1 + i)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `d`.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 50000', '0 <= d <= 2 * 10^9', '|each number| <= 10^9'],
    slug: 'close-pairs-by-difference',
    title: 'Count the Pairs of Numbers That Differ by at Most d',
    tags: ['fenwick-tree', 'counting', 'coordinate-compression', 'range-count'],
    concept: {
      title: 'For each number, count the earlier numbers inside the window [a - d, a + d] with two bounds of the sorted values',
      body: [
        'Count the pairs of positions `i < j` such that the two numbers differ by at most `d`: `|a[i] - a[j]| <= d`. For `1 5 2 9 4` and `d = 2` the pairs are `(1, 2)` and `(5, 4)` and `(2, 4)`, so the answer is 3. Checking all pairs costs O(n^2).',
        'Scan the list from left to right and keep the earlier numbers in a Fenwick tree over **compressed values**. For the current value `v` the earlier numbers that form a pair with it are exactly those in the value window `[v - d, v + d]`. Their count is a difference of two prefix sums: `prefix(hi) - prefix(lo - 1)`, where `hi` is the number of distinct values `<= v + d` and `lo - 1` the number of distinct values `< v - d`. Both bounds come from binary searches in the sorted list of the distinct values (`d` may be larger than the range of the values, which is fine).',
        { code: 'u = sorted(set(a))\nt = [0] * (len(u) + 1)\ntotal = 0\nfor v in a:\n    hi = bisect_right(u, v + d)               # distinct values <= v + d\n    lo = bisect_left(u, v - d)                # distinct values < v - d\n    total += prefix(t, hi) - prefix(t, lo)\n    add(t, bisect_left(u, v) + 1, 1)' },
        'The window contains the value `v` itself, so earlier copies of `v` are counted (as `|v - v| = 0 <= d`). Every number costs two binary searches, two prefix sums and one update, O(log n), so the total is O(n log n). The answer is at most about `n^2 / 2 = 1.25 * 10^9`, use 64-bit numbers.'
      ]
    },
    statement: ['A list of `n` numbers and a number `d` are given. Count the pairs of positions `i < j` for which `|a[i] - a[j]| <= d`.'],
    outputFormat: ['Print the number of pairs.'],
    examples: [{ input: '5 2\n1 5 2 9 4\n', note: 'The pairs (1,2), (5,4) and (2,4) differ by at most 2: 3.' }],
    hints: ['Scan from the left and keep the earlier numbers in a Fenwick tree over the sorted distinct values.', 'The partners of v are the earlier numbers in [v - d, v + d].', 'Count them as the difference of two prefix sums found with binary searches.'],
    program: {
      io: ['n:int d:int', 'a:int[n]'],
      fast: true,
      helpers: { python: 'from bisect import bisect_left, bisect_right\n\n' + dedent(FENWICK.python), cpp: FENWICK.cpp, java: FENWICK.java },
      python: r`
        u = sorted(set(a))
        t = [0] * (len(u) + 1)
        total = 0
        for v in a:
            hi = bisect_right(u, v + d)
            lo = bisect_left(u, v - d)
            total += bit_sum(t, hi) - bit_sum(t, lo)
            bit_add(t, bisect_left(u, v) + 1, 1)
        print(total)`,
      cpp: r`
        vector<long long> u(a);
        sort(u.begin(), u.end());
        u.erase(unique(u.begin(), u.end()), u.end());
        vector<long long> t(u.size() + 1, 0);
        long long total = 0;
        for (long long i = 0; i < n; i++) {
            long long v = a[i];
            long long hi = upper_bound(u.begin(), u.end(), v + d) - u.begin();
            long long lo = lower_bound(u.begin(), u.end(), v - d) - u.begin();
            total += bitSum(t, hi) - bitSum(t, lo);
            bitAdd(t, lower_bound(u.begin(), u.end(), v) - u.begin() + 1, 1);
        }
        cout << total << "\n";`,
      java: r`
        int cn = (int) n;
        long[] u = a.clone();
        Arrays.sort(u);
        int m = 0;
        for (int i = 0; i < cn; i++) {
            if (i == 0 || u[i] != u[i - 1]) u[m++] = u[i];
        }
        long[] t = new long[m + 1];
        long total = 0;
        for (int i = 0; i < cn; i++) {
            long v = a[i];
            int lo1 = 0, hi1 = m;
            while (lo1 < hi1) {
                int mid = (lo1 + hi1) / 2;
                if (u[mid] <= v + d) lo1 = mid + 1;
                else hi1 = mid;
            }
            int lo2 = 0, hi2 = m;
            while (lo2 < hi2) {
                int mid = (lo2 + hi2) / 2;
                if (u[mid] < v - d) lo2 = mid + 1;
                else hi2 = mid;
            }
            total += bitSum(t, lo1) - bitSum(t, lo2);
            bitAdd(t, Arrays.binarySearch(u, 0, m, v) + 1, 1);
        }
        System.out.println(total);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Scanning from the left, the earlier numbers within [v - d, v + d] are counted as the difference of two Fenwick prefix sums over the sorted distinct values, found with binary searches.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const [n, d] = nums(rows(input)[0]); const a = nums(rows(input)[1]); // sort and use two pointers on the sorted order, counting pairs with a small difference, then no order restriction is needed because |a_i - a_j| is symmetric
      const s = a.slice().sort((x, y) => x - y); let count = 0, left = 0; for (let right = 0; right < n; right++) { while (s[right] - s[left] > d) left++; count += right - left; } return String(count);
    },
    tests() {
      const g = rng(4305); const out = ['5 2\n1 5 2 9 4\n', '1 0\n7\n', '3 0\n4 4 4\n', '2 2000000000\n-1000000000 1000000000\n'];
      const make = (n, d, lo, hi) => `${n} ${d}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (input) => { const [n, d] = nums(rows(input)[0]); const a = nums(rows(input)[1]); let c = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(a[i] - a[j]) <= d) c++; return String(c); };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 0, 6), -8, 8), (i) => this.solve(i), brute, 800);
      for (const [n, d, lo, hi] of [[10, 5, -100, 100], [100, 50, -1000, 1000], [1000, 1000000, -1000000000, 1000000000], [50000, 1000000, -1000000000, 1000000000], [50000, 0, 0, 100], [50000, 2000000000, -1000000000, 1000000000], [49999, 5, 0, 1000000]]) out.push(make(n, d, lo, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of values and the number of questions.', 'The second line has `n` numbers.', 'Each of the next `q` lines has two numbers `l` and `r`: the question asks for the number of different values among the positions `l` to `r`.'],
    constraints: ['1 <= n, q <= 30000', '1 <= each number <= 10^9', '1 <= l <= r <= n'],
    slug: 'distinct-values-in-ranges',
    title: 'How Many Different Numbers Are in a Range?',
    tags: ['fenwick-tree', 'offline-queries', 'distinct-count', 'sorting'],
    concept: {
      title: 'Sort the questions by their right end; keep a 1 only at the latest occurrence of every value so far',
      body: [
        'A list of numbers and many questions are given. Each question gives a range `l..r` and asks for the **number of different values** in it. For `1 2 1 3 2` the range 1..3 has 2 different values (1 and 2) and the range 2..5 has 3 (2, 1 and 3). Counting each range with a set costs O(n) per question.',
        'Answer the questions **offline**, in the order of their right ends. Walk a pointer `p` from 1 to `n`, and keep in a Fenwick tree a **1 at the position of the latest occurrence of every value seen so far** (and 0 elsewhere). When the value `a[p]` appears again, move its mark: add `-1` at its previous position and `+1` at `p`. Now, for a question whose right end is `p`, every different value in `[l, p]` is represented by exactly one mark in `[l, p]` (the last occurrence of that value not after `p`). So the answer is the number of marks in `[l, p]`, a range sum of the tree.',
        { code: 'order = sorted(range(q), key=lambda i: queries[i][1])    # by the right end\nlast = {}\nt = [0] * (n + 1)\np = 0\nfor idx in order:\n    l, r = queries[idx]\n    while p < r:\n        p += 1\n        v = a[p - 1]\n        if v in last: add(t, last[v], -1)       # the old mark moves\n        last[v] = p; add(t, p, 1)\n    answer[idx] = prefix(t, r) - prefix(t, l - 1)' },
        'The answers are stored by the original index of the question, so they are printed in the order of the input. Each position is processed once and each question costs two prefix sums: O((n + q) log n). The same idea ("keep only the last occurrence") counts distinct values in ranges, finds the mex of ranges and handles queries on colours.'
      ]
    },
    statement: ['A list of `n` numbers and `q` questions are given. For every question `l r` print the number of different values among the positions `l` to `r`. Print the answers on one line, in the order of the questions.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: '5 3\n1 2 1 3 2\n1 3\n2 5\n1 5\n', note: 'The ranges 1..3, 2..5 and 1..5 have 2, 3 and 3 different values.' }],
    hints: ['Answer the questions in increasing order of the right end.', 'Keep a mark only at the last occurrence of each value.', 'The answer is the number of marks in [l, r].'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'qs:int[q][2]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        order = sorted(range(q), key=lambda i: qs[i][1])
        last = {}
        t = [0] * (n + 1)
        p = 0
        ans = [0] * q
        for idx in order:
            l, rr = qs[idx]
            while p < rr:
                p += 1
                v = a[p - 1]
                if v in last:
                    bit_add(t, last[v], -1)
                last[v] = p
                bit_add(t, p, 1)
            ans[idx] = bit_sum(t, rr) - bit_sum(t, l - 1)
        print(*ans)`,
      cpp: r`
        vector<int> order(q);
        for (int i = 0; i < q; i++) order[i] = i;
        sort(order.begin(), order.end(), [&](int x, int y) { return qs[x][1] < qs[y][1]; });
        map<long long, long long> last;
        vector<long long> t(n + 1, 0), ans(q);
        long long p = 0;
        for (int idx : order) {
            long long l = qs[idx][0], rr = qs[idx][1];
            while (p < rr) {
                p++;
                long long v = a[p - 1];
                auto it = last.find(v);
                if (it != last.end()) bitAdd(t, it->second, -1);
                last[v] = p;
                bitAdd(t, p, 1);
            }
            ans[idx] = bitSum(t, rr) - bitSum(t, l - 1);
        }
        for (int i = 0; i < q; i++) cout << (i ? " " : "") << ans[i];
        cout << "\n";`,
      java: r`
        int cn = (int) n, cq = (int) q;
        long[] keys = new long[cq];
        for (int i = 0; i < cq; i++) keys[i] = (qs[i][1] << 15) | i;
        Arrays.sort(keys);
        long[] sortedVals = a.clone();
        Arrays.sort(sortedVals);
        int m = 0;
        for (int i = 0; i < cn; i++) {
            if (i == 0 || sortedVals[i] != sortedVals[i - 1]) sortedVals[m++] = sortedVals[i];
        }
        int[] last = new int[m];
        long[] t = new long[cn + 1];
        long[] ans = new long[cq];
        int p = 0;
        for (int k = 0; k < cq; k++) {
            int idx = (int) (keys[k] & 32767L);
            int l = (int) qs[idx][0], rr = (int) qs[idx][1];
            while (p < rr) {
                p++;
                int id = Arrays.binarySearch(sortedVals, 0, m, a[p - 1]);
                if (last[id] != 0) bitAdd(t, last[id], -1);
                last[id] = p;
                bitAdd(t, p, 1);
            }
            ans[idx] = bitSum(t, rr) - bitSum(t, l - 1);
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < cq; i++) {
            if (i > 0) out.append(" ");
            out.append(ans[i]);
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<map>']
    },
    solution: { explanation: ['The questions are sorted by right end; a Fenwick tree holds a 1 at the latest occurrence of every value seen so far, and the answer to a question is the number of marks in its range.'], complexity: 'Time O((n + q) log n), space O(n + q).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const qs = rowsOfNums(input, 2, q); return qs.map(([l, rr]) => new Set(a.slice(l - 1, rr)).size).join(' ');
    },
    tests() {
      const g = rng(4306); const out = ['5 3\n1 2 1 3 2\n1 3\n2 5\n1 5\n', '1 1\n7\n1 1\n'];
      const make = (n, q, hi) => `${n} ${q}\n${randArray(g, n, 1, hi).join(' ')}\n${many(q, () => { const l = randInt(g, 1, n); return `${l} ${randInt(g, l, n)}`; }).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [l, rr] = nums(rs[2 + k]); out.push(new Set(a.slice(l - 1, rr)).size); } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 8), 4), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 5], [100, 100, 30], [1000, 1000, 100], [30000, 30000, 1000000000], [30000, 30000, 100], [30000, 30000, 30000], [29999, 30000, 5]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of points.', 'Each of the next `n` lines has two numbers `x` and `y`: the coordinates of a point.'],
    constraints: ['1 <= n <= 40000', '|x|, |y| <= 10^9', 'Points may coincide.'],
    slug: 'points-below-and-to-the-left',
    title: 'How Many Points Are Below and to the Left of Each Point?',
    tags: ['fenwick-tree', 'dominance', 'sorting', 'offline'],
    concept: {
      title: 'Sort the points by x, insert them into a tree indexed by y, and count with a prefix sum; handle equal x together',
      body: [
        'Points are given on a plane. For each point `p` count the **other** points `q` with `q.x <= p.x` and `q.y <= p.y` (the point `q` is below and to the left of `p`, or level with it). For the points `(1,1) (2,3) (3,2) (3,3)` the counts are `0 1 1 3`: the point `(3,3)` dominates the three others. A pair of loops costs O(n^2).',
        'Sort the points by `x` and sweep. The tree is indexed by the **rank of `y`** (compress the y coordinates). When the sweep is at a point, all the points with a smaller `x` are already in the tree, and the answer is the number of them with `y <= p.y`: a prefix sum. The trouble is the points with the **same `x`** as `p`: they also count if their `y` is not larger. Handle the sorted points in **groups of equal `x`**: first insert the whole group, then for each point of the group the answer is `prefix(rank(p.y)) - 1` (the `-1` removes the point itself). Points with the same `x` and `y` then count each other correctly.',
        { code: 'order = sorted(range(n), key=lambda i: pts[i][0])\ni = 0\nwhile i < n:\n    j = i\n    while j < n and pts[order[j]][0] == pts[order[i]][0]: j += 1     # the group with the same x\n    for k in range(i, j): add(t, rank_y[order[k]], 1)\n    for k in range(i, j): answer[order[k]] = prefix(t, rank_y[order[k]]) - 1\n    i = j' },
        'The count includes points that coincide with `p` (they satisfy both inequalities) but never `p` itself. Sorting is O(n log n), and every point makes one update and one prefix sum, so the total is O(n log n). The same pattern counts "dominated" points, which is the first step of many 2D counting problems.'
      ]
    },
    statement: ['`n` points `(x, y)` are given. For every point count the other points `(x\', y\')` with `x\' <= x` and `y\' <= y` (points that coincide with it are counted; the point itself is not). Print the counts in the order of the input.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    examples: [{ input: '4\n1 1\n2 3\n3 2\n3 3\n', note: 'The counts are 0 1 1 3.' }],
    hints: ['Sort by x and compress the y coordinates.', 'Insert the whole group of equal x before answering the points of the group.', 'The answer for a point is the prefix count up to its y rank minus one for the point itself.'],
    program: {
      io: ['n:int', 'pts:int[n][2]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        ys = sorted(set(p[1] for p in pts))
        rank = {y: i + 1 for i, y in enumerate(ys)}
        order = sorted(range(n), key=lambda i: pts[i][0])
        t = [0] * (len(ys) + 1)
        ans = [0] * n
        i = 0
        while i < n:
            j = i
            while j < n and pts[order[j]][0] == pts[order[i]][0]:
                j += 1
            for k in range(i, j):
                bit_add(t, rank[pts[order[k]][1]], 1)
            for k in range(i, j):
                ans[order[k]] = bit_sum(t, rank[pts[order[k]][1]]) - 1
            i = j
        print(*ans)`,
      cpp: r`
        vector<long long> ys;
        for (const vector<long long>& p : pts) ys.push_back(p[1]);
        sort(ys.begin(), ys.end());
        ys.erase(unique(ys.begin(), ys.end()), ys.end());
        vector<int> order(n);
        for (int i = 0; i < n; i++) order[i] = i;
        sort(order.begin(), order.end(), [&](int a, int b) { return pts[a][0] < pts[b][0]; });
        vector<long long> t(ys.size() + 1, 0), ans(n);
        auto rankOf = [&](int idx) { return (long long)(lower_bound(ys.begin(), ys.end(), pts[idx][1]) - ys.begin()) + 1; };
        int i = 0;
        while (i < n) {
            int j = i;
            while (j < n && pts[order[j]][0] == pts[order[i]][0]) j++;
            for (int k = i; k < j; k++) bitAdd(t, rankOf(order[k]), 1);
            for (int k = i; k < j; k++) ans[order[k]] = bitSum(t, rankOf(order[k])) - 1;
            i = j;
        }
        for (int k = 0; k < n; k++) cout << (k ? " " : "") << ans[k];
        cout << "\n";`,
      java: r`
        int cn = (int) n;
        long[] ys = new long[cn];
        for (int i = 0; i < cn; i++) ys[i] = pts[i][1];
        Arrays.sort(ys);
        int m = 0;
        for (int i = 0; i < cn; i++) {
            if (i == 0 || ys[i] != ys[i - 1]) ys[m++] = ys[i];
        }
        long[] keys = new long[cn];
        for (int i = 0; i < cn; i++) keys[i] = ((pts[i][0] + 1000000000L) << 16) | i;
        Arrays.sort(keys);
        int[] order = new int[cn];
        for (int i = 0; i < cn; i++) order[i] = (int) (keys[i] & 65535L);
        long[] t = new long[m + 1];
        long[] ans = new long[cn];
        int i = 0;
        while (i < cn) {
            int j = i;
            while (j < cn && pts[order[j]][0] == pts[order[i]][0]) j++;
            for (int k = i; k < j; k++) bitAdd(t, Arrays.binarySearch(ys, 0, m, pts[order[k]][1]) + 1, 1);
            for (int k = i; k < j; k++) ans[order[k]] = bitSum(t, Arrays.binarySearch(ys, 0, m, pts[order[k]][1]) + 1) - 1;
            i = j;
        }
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < cn; k++) {
            if (k > 0) out.append(" ");
            out.append(ans[k]);
        }
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The points are swept in order of x with a Fenwick tree over the compressed y coordinates; each group of equal x is inserted before its points are answered, and the answer is the prefix count up to the point\'s y minus the point itself.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const n = Number(rows(input)[0]); const pts = rowsOfNums(input, 1, n); // divide by blocks of the sorted x order with a sorted list of y in each block would be heavy; use a merge-style count on the y order instead
      const ids = pts.map((_, i) => i).sort((a, b) => pts[a][0] - pts[b][0] || pts[a][1] - pts[b][1]); const ans = new Array(n).fill(0); const ys = [...new Set(pts.map((p) => p[1]))].sort((a, b) => a - b); const f = new Fen(ys.length); let i = 0; while (i < n) { let j = i; while (j < n && pts[ids[j]][0] === pts[ids[i]][0]) j++; for (let k = i; k < j; k++) f.add(lowerBound(ys, pts[ids[k]][1]) + 1, 1); for (let k = i; k < j; k++) ans[ids[k]] = f.sum(lowerBound(ys, pts[ids[k]][1]) + 1) - 1; i = j; } return ans.join(' ');
    },
    tests() {
      const g = rng(4307); const out = ['4\n1 1\n2 3\n3 2\n3 3\n', '1\n0 0\n', '3\n5 5\n5 5\n5 5\n'];
      const make = (n, hi) => `${n}\n${many(n, () => `${randInt(g, -hi, hi)} ${randInt(g, -hi, hi)}`).join('\n')}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); const pts = rowsOfNums(input, 1, n); return pts.map((p, i) => { let c = 0; for (let j = 0; j < n; j++) if (j !== i && pts[j][0] <= p[0] && pts[j][1] <= p[1]) c++; return c; }).join(' '); };
      crossCheck(() => make(randInt(g, 1, 12), 3), (i) => this.solve(i), brute, 800);
      for (const [n, hi] of [[10, 5], [100, 20], [1000, 1000], [40000, 1000000000], [40000, 100], [40000, 1000000000], [39999, 3]]) out.push(make(n, hi));
      out.push(`40000\n${many(40000, (i) => `${i} ${i}`).join('\n')}\n`, `40000\n${many(40000, (i) => `${i} ${40000 - i}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with `n` and `k`: the number of people in the circle and the step.'],
    constraints: ['1 <= n <= 100000', '1 <= k <= 10^9'],
    slug: 'last-person-in-the-circle',
    title: 'Who Is the Last Person Left in the Circle?',
    tags: ['fenwick-tree', 'josephus', 'order-statistics', 'simulation'],
    concept: {
      title: 'Simulate the removals; a Fenwick tree finds "the j-th person still in the circle" in log n steps',
      body: [
        '`n` people stand in a circle, numbered 1 to `n`. Starting with the person 1, count `k` people (the first counted is the starting person) and remove the person at which you stop; then start counting again from the next person. Repeat until one person is left. For `n = 5` and `k = 2` the people are removed in the order 2, 4, 1, 5, and the last one left is the person 3. This is the *Josephus problem*.',
        'Simulating with a list costs O(n) per removal. Instead keep a Fenwick tree with a 1 for every person still in the circle. Let `m` be the number of people left and `pos` the **index inside the current circle** (0-based) where counting starts. The person to remove has the index `(pos + k - 1) mod m`; find the person who is the `(index + 1)`-th remaining one with the **descent** of the Fenwick tree, remove it (add -1) and set `pos = index` (the next person has now the same index, since the removed one disappeared), then `m -= 1`.',
        { code: 'pos = 0\nfor m in range(n, 1, -1):\n    idx = (pos + k - 1) % m               # index in the current circle\n    person = kth(idx + 1)                 # the (idx + 1)-th remaining person, by the descent\n    add(t, person, -1)\n    pos = idx                             # counting continues from the next person\nlast = kth(1)' },
        'After the removal the person who followed the removed one has the index `idx` in the smaller circle, so `pos = idx` (taken modulo the new size at the next step). With `n = 100000` there are `n` removals of O(log n) each. (There is also a recurrence `J(m) = (J(m - 1) + k) mod m` that gives the survivor in O(n); the tree version shows the whole sequence of removals and works when other rules are added.)'
      ]
    },
    statement: ['`n` people stand in a circle, numbered 1 to `n` clockwise. Starting from the person 1 count `k` people (the starting person is the first); the counted `k`-th person leaves the circle, and the counting starts again from the next person. This is repeated until one person is left. Print the number of this last person.'],
    outputFormat: ['Print the number of the last person.'],
    examples: [{ input: '5 2\n', note: 'The people leave in the order 2, 4, 1, 5; the last is 3.' }, { input: '7 3\n', note: 'The people leave in the order 3, 6, 2, 7, 5, 1; the last is 4.' }],
    hints: ['Keep a Fenwick tree with a 1 for each person still in the circle.', 'The index of the leaving person is (pos + k - 1) mod m.', 'Find the person with that index by a descent over powers of two.'],
    program: {
      io: ['n:int k:int'],
      fast: true,
      helpers: FENWICK,
      python: r`
        t = [0] * (n + 1)
        for i in range(1, n + 1):
            bit_add(t, i, 1)
        top = 1
        while top * 2 <= n:
            top *= 2

        def kth(j):
            p = 0
            step = top
            while step:
                if p + step <= n and t[p + step] < j:
                    p += step
                    j -= t[p]
                step >>= 1
            return p + 1

        pos = 0
        for m in range(n, 1, -1):
            idx = (pos + k - 1) % m
            person = kth(idx + 1)
            bit_add(t, person, -1)
            pos = idx
        print(kth(1))`,
      cpp: r`
        vector<long long> t(n + 1, 0);
        for (long long i = 1; i <= n; i++) bitAdd(t, i, 1);
        long long top = 1;
        while (top * 2 <= n) top *= 2;
        auto kth = [&](long long j) {
            long long p = 0;
            for (long long step = top; step > 0; step >>= 1) {
                if (p + step <= n && t[p + step] < j) {
                    p += step;
                    j -= t[p];
                }
            }
            return p + 1;
        };
        long long pos = 0;
        for (long long m = n; m > 1; m--) {
            long long idx = (pos + k - 1) % m;
            long long person = kth(idx + 1);
            bitAdd(t, person, -1);
            pos = idx;
        }
        cout << kth(1) << "\n";`,
      java: r`
        int cn = (int) n;
        long[] t = new long[cn + 1];
        for (int i = 1; i <= cn; i++) bitAdd(t, i, 1);
        int top = 1;
        while (top * 2 <= cn) top *= 2;
        long pos = 0;
        for (int m = cn; m > 1; m--) {
            long idx = (pos + k - 1) % m;
            long j = idx + 1;
            int p = 0;
            for (int step = top; step > 0; step >>= 1) {
                if (p + step <= cn && t[p + step] < j) {
                    p += step;
                    j -= t[p];
                }
            }
            bitAdd(t, p + 1, -1);
            pos = idx;
        }
        long j = 1;
        int p = 0;
        for (int step = top; step > 0; step >>= 1) {
            if (p + step <= cn && t[p + step] < j) {
                p += step;
                j -= t[p];
            }
        }
        System.out.println(p + 1);`
    },
    solution: { explanation: ['A Fenwick tree marks the people still in the circle; each removal finds the person with the computed index by a descent, removes it, and counting continues from the same index of the smaller circle.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const [n, k] = nums(rows(input)[0]); let survivor = 0; for (let m = 2; m <= n; m++) survivor = (survivor + k) % m; return String(survivor + 1); // the recurrence J(m) = (J(m - 1) + k) mod m
    },
    tests() {
      const g = rng(4308); const out = ['5 2\n', '7 3\n', '1 5\n', '2 1\n', '100000 1\n', '100000 1000000000\n'];
      const brute = (input) => { const [n, k] = nums(rows(input)[0]); const circle = many(n, (i) => i + 1); let pos = 0; while (circle.length > 1) { const idx = (pos + k - 1) % circle.length; circle.splice(idx, 1); pos = idx; if (pos >= circle.length) pos = 0; } return String(circle[0]); };
      crossCheck(() => `${randInt(g, 1, 14)} ${randInt(g, 1, 20)}\n`, (i) => this.solve(i), brute, 800);
      for (const n of [10, 100, 1000, 99999, 65536, 65537, 77777, 50000]) out.push(`${n} ${randInt(g, 1, 1000000000)}\n`, `${n} ${randInt(g, 1, 100)}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of chords.', 'Each of the next `n` lines has two numbers `a` and `b`: the two end points of a chord on a circle with `2n` marked points.'],
    constraints: ['1 <= n <= 50000', 'The `2n` end points are the numbers 1 to 2n, each used exactly once.'],
    slug: 'crossing-chords',
    title: 'How Many Pairs of Chords Cross?',
    tags: ['fenwick-tree', 'counting', 'intervals', 'sweep'],
    concept: {
      title: 'Two chords cross exactly when their intervals overlap without one containing the other',
      body: [
        '`2n` points are marked on a circle and numbered 1 to `2n` in order. `n` chords connect the points in pairs (every point is an end of exactly one chord). Count the **pairs of chords that cross**. For `n = 3` with the chords `(1, 4)`, `(2, 5)` and `(3, 6)` every two chords cross, so the answer is 3; the chords `(1, 2)`, `(3, 4)`, `(5, 6)` do not cross at all.',
        'Cut the circle at the point 1 and think of each chord as an **interval** `[a, b]` with `a < b` on a line. Two chords cross exactly when their intervals **interleave**: `a1 < a2 < b1 < b2`. If one interval contains the other, or they are disjoint, the chords do not cross. Sweep the points from 1 to `2n`. A left end `a` **opens** its chord: add 1 at the position `a` in a Fenwick tree. A right end `b` of the chord `(a, b)` **closes** it: first remove the mark at `a`, then count the marks in the positions strictly between `a` and `b`: they are the chords that opened after `a` and are still open at `b`, so they end after `b`, which is the interleaving `a < a2 < b < b2`. Add that count to the answer.',
        { code: 'partner = the other end of the chord of every point\nt = Fenwick tree over 1..2n\ntotal = 0\nfor x in range(1, 2 * n + 1):\n    y = partner[x]\n    if y > x:\n        add(t, x, 1)                          # the chord opens\n    else:\n        add(t, y, -1)                         # the chord (y, x) closes\n        total += prefix(t, x) - prefix(t, y)  # chords opened between y and x and still open' },
        'Every crossing pair is counted exactly once, at the closing of the chord that ends first. The answer is at most `n (n - 1) / 2`, about 1.25 * 10^9, so use 64-bit numbers. Time O(n log n).'
      ]
    },
    statement: ['`2n` points are marked on a circle and numbered 1 to `2n` in order. `n` chords connect them in pairs (each point is the end of exactly one chord). Two chords cross if they have a common point inside the circle. Print the number of pairs of crossing chords.'],
    outputFormat: ['Print the number of pairs of crossing chords.'],
    examples: [{ input: '3\n1 4\n2 5\n3 6\n', note: 'Every two chords cross: 3.' }, { input: '3\n1 2\n3 4\n5 6\n', note: 'No two chords cross: 0.' }],
    hints: ['Treat each chord as an interval with the smaller end first.', 'Two chords cross when a1 < a2 < b1 < b2.', 'Sweep the points; at a closing end count the chords opened inside the interval that are still open.'],
    program: {
      io: ['n:int', 'ch:int[n][2]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        m = 2 * n
        partner = [0] * (m + 1)
        for a, b in ch:
            partner[a] = b
            partner[b] = a
        t = [0] * (m + 1)
        total = 0
        for x in range(1, m + 1):
            y = partner[x]
            if y > x:
                bit_add(t, x, 1)
            else:
                bit_add(t, y, -1)
                total += bit_sum(t, x) - bit_sum(t, y)
        print(total)`,
      cpp: r`
        long long m = 2 * n;
        vector<long long> partner(m + 1, 0), t(m + 1, 0);
        for (const vector<long long>& c : ch) {
            partner[c[0]] = c[1];
            partner[c[1]] = c[0];
        }
        long long total = 0;
        for (long long x = 1; x <= m; x++) {
            long long y = partner[x];
            if (y > x) {
                bitAdd(t, x, 1);
            } else {
                bitAdd(t, y, -1);
                total += bitSum(t, x) - bitSum(t, y);
            }
        }
        cout << total << "\n";`,
      java: r`
        int m = 2 * (int) n;
        int[] partner = new int[m + 1];
        long[] t = new long[m + 1];
        for (int i = 0; i < n; i++) {
            partner[(int) ch[i][0]] = (int) ch[i][1];
            partner[(int) ch[i][1]] = (int) ch[i][0];
        }
        long total = 0;
        for (int x = 1; x <= m; x++) {
            int y = partner[x];
            if (y > x) {
                bitAdd(t, x, 1);
            } else {
                bitAdd(t, y, -1);
                total += bitSum(t, x) - bitSum(t, y);
            }
        }
        System.out.println(total);`
    },
    solution: { explanation: ['The points are swept from left to right; opening a chord marks its left end in a Fenwick tree, and closing it removes the mark and counts the marks between its ends, which are the chords that interleave with it.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const n = Number(rows(input)[0]); const ch = rowsOfNums(input, 1, n).map(([a, b]) => (a < b ? [a, b] : [b, a])).sort((x, y) => x[0] - y[0]); // every pair is crossing, nested or disjoint: crossing = all pairs - nested - disjoint
      const f = new Fen(2 * n); let nested = 0; for (let i = 0; i < n; i++) { nested += i - f.sum(ch[i][1]); f.add(ch[i][1], 1); } const starts = ch.map((c) => c[0]); let disjoint = 0; for (const [, b] of ch) disjoint += n - upperBound(starts, b); return String((n * (n - 1)) / 2 - nested - disjoint);
    },
    tests() {
      const g = rng(4309); const out = ['3\n1 4\n2 5\n3 6\n', '3\n1 2\n3 4\n5 6\n', '1\n1 2\n', '2\n1 4\n2 3\n'];
      const make = (n) => { const pts = shuffle(g, many(2 * n, (i) => i + 1)); return `${n}\n${many(n, (i) => `${pts[2 * i]} ${pts[2 * i + 1]}`).join('\n')}\n`; };
      const brute = (input) => { const n = Number(rows(input)[0]); const ch = rowsOfNums(input, 1, n).map(([a, b]) => (a < b ? [a, b] : [b, a])); let c = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const [a1, b1] = ch[i], [a2, b2] = ch[j]; if ((a1 < a2 && a2 < b1 && b1 < b2) || (a2 < a1 && a1 < b2 && b2 < b1)) c++; } return String(c); };
      crossCheck(() => make(randInt(g, 1, 8)), (i) => this.solve(i), brute, 800);
      for (const n of [10, 100, 1000, 50000, 50000, 49999]) out.push(make(n));
      out.push(`50000\n${many(50000, (i) => `${i + 1} ${i + 50001}`).join('\n')}\n`, `50000\n${many(50000, (i) => `${2 * i + 1} ${2 * i + 2}`).join('\n')}\n`, `50000\n${many(50000, (i) => `${i + 1} ${100000 - i}`).join('\n')}\n`);
      return out;
    }
  }
];
