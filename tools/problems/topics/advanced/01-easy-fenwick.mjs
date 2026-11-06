import { r, rng, randInt, many, nums, rows, shuffle, randArray } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const easy = { difficulty: 'easy' };
const rowsOfNums = (input, from, count) => { const rs = rows(input); return many(count, (i) => nums(rs[from + i])); };
const lines = (list) => list.map((p) => p.join(' ')).join('\n');

// a plain Fenwick tree of numbers for the reference solutions
class Fen {
  constructor(n) { this.n = n; this.t = new Array(n + 1).fill(0); }
  add(i, x) { for (; i <= this.n; i += i & -i) this.t[i] += x; }
  sum(i) { let s = 0; for (; i > 0; i -= i & -i) s += this.t[i]; return s; }
}
// compress values to ranks 1..m (equal values share a rank)
const ranks = (a) => { const sorted = [...new Set(a)].sort((x, y) => x - y); const at = new Map(sorted.map((v, i) => [v, i + 1])); return { rank: a.map((v) => at.get(v)), m: sorted.length }; };

// the helper functions every Fenwick program uses: add to a position, sum of a prefix (positions are numbered from 1)
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
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, add `y` to the cell number `x`. If `t = 2`, print the sum of the cells from `x` to `y`.'],
    constraints: ['1 <= n, q <= 30000', '|each cell| <= 10^6 at the start, |y| <= 10^6 in the additions', 'Cells are numbered from 1; for a sum 1 <= x <= y <= n.'],
    slug: 'change-one-cell-sum-a-range',
    title: 'Change One Number, Sum a Range',
    tags: ['fenwick-tree', 'point-update', 'range-sum', 'queries'],
    concept: {
      title: 'A Fenwick tree stores partial sums so that both an update and a prefix sum take about log n steps',
      body: [
        'A row of `n` numbers is given, and then `q` operations come in turn. Some operations **change one number**, others ask for the **sum of a range**. For the row `5 1 4 2` the sum of the cells 2 to 4 is 7; after adding 10 to the cell 3 it is 17. If each sum is computed with a loop, the work is O(n) per question, up to 9 * 10^8 steps in total. If every sum is read from a table of prefix sums, an update would have to rebuild the table, which is O(n) again.',
        'A **Fenwick tree** (also called a *binary indexed tree*) keeps a clever array `t` in which the cell `t[i]` holds the sum of the **last `i & -i` numbers** ending at the position `i` (the expression `i & -i` is the lowest set bit of `i`: for `i = 12 = 1100` it is `4`, so `t[12]` covers the cells 9 to 12). To get the sum of the first `i` numbers, add `t[i]`, then jump to `i - (i & -i)` and add again, until `i` is 0: each jump clears the lowest set bit, so there are at most log n jumps. To add `x` to the cell `i`, update every `t[j]` that covers `i`: start at `i` and jump to `j + (j & -j)` until `j` passes `n`.',
        { code: 'def add(t, i, x):                 # the number at the position i grows by x\n    while i <= n:\n        t[i] += x\n        i += i & -i               # the next cell that covers the position i\n\ndef prefix(t, i):                 # the sum of the first i numbers\n    s = 0\n    while i > 0:\n        s += t[i]\n        i -= i & -i               # remove the lowest set bit\n    return s\n\n# a range sum is the difference of two prefix sums\nanswer = prefix(t, y) - prefix(t, x - 1)' },
        'A range sum is `prefix(y) - prefix(x - 1)`, the same difference trick as for prefix sums. To build the tree start from zeros and add every number with `add` (O(n log n)). Every operation takes O(log n) time, so the whole input is processed in O((n + q) log n). The sums here reach about 10^15, so use 64-bit numbers.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y` adds `y` to the number at the position `x`; type 2 `x y` asks for the sum of the numbers at the positions `x` to `y`. Print the answers to all the questions of type 2 on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '4 4\n5 1 4 2\n2 2 4\n1 3 10\n2 2 4\n2 1 4\n', note: '1 + 4 + 2 = 7; after adding 10 to the third number: 1 + 14 + 2 = 17; the whole row: 5 + 1 + 14 + 2 = 22.' }],
    hints: ['Keep a Fenwick tree; t[i] covers the last i & -i positions ending at i.', 'To add, move up with i += i & -i; to sum a prefix, move down with i -= i & -i.', 'A range sum is the difference of two prefix sums.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        t = [0] * (n + 1)
        for i in range(n):
            bit_add(t, i + 1, a[i])
        out = []
        for kind, x, y in ops:
            if kind == 1:
                bit_add(t, x, y)
            else:
                out.append(bit_sum(t, y) - bit_sum(t, x - 1))
        print(*out)`,
      cpp: r`
        vector<long long> t(n + 1, 0);
        for (long long i = 0; i < n; i++) bitAdd(t, i + 1, a[i]);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                bitAdd(t, x, y);
            } else {
                if (!out.empty()) out += " ";
                out += to_string(bitSum(t, y) - bitSum(t, x - 1));
            }
        }
        cout << out << "\n";`,
      java: r`
        long[] t = new long[(int) n + 1];
        for (int i = 0; i < n; i++) bitAdd(t, i + 1, a[i]);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                bitAdd(t, x, y);
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(bitSum(t, (int) y) - bitSum(t, x - 1));
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['A Fenwick tree over the cells supports adding to one cell and summing a prefix in O(log n); a range sum is the difference of two prefix sums.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const f = new Fen(n); a.forEach((v, i) => f.add(i + 1, v)); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) f.add(x, y); else out.push(f.sum(y) - f.sum(x - 1)); } return out.join(' ');
    },
    tests() {
      const g = rng(4001); const out = ['4 4\n5 1 4 2\n2 2 4\n1 3 10\n2 2 4\n2 1 4\n', '1 3\n7\n2 1 1\n1 1 -3\n2 1 1\n'];
      const make = (n, q, hi) => { const ops = many(q, () => { if (g() < 0.5) return [1, randInt(g, 1, n), randInt(g, -hi, hi)]; const x = randInt(g, 1, n); return [2, x, randInt(g, x, n)]; }); ops.push([2, 1, n]); return `${n} ${q + 1}\n${randArray(g, n, -hi, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] += y; else { let s = 0; for (let i = x - 1; i < y; i++) s += a[i]; out.push(s); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000], [30000, 29999, 1000000], [30000, 29999, 1000000], [30000, 29999, 5], [29999, 29999, 1000000]]) out.push(make(n, q, hi));
      out.push(`30000 30000\n${new Array(30000).fill(1000000).join(' ')}\n${many(30000, (i) => (i % 2 ? `2 1 ${i + 1}` : `1 ${i + 1} 1000000`)).join('\n')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print the sum of the cells from `x` to `y`.'],
    constraints: ['1 <= n, q <= 30000', '|each cell| <= 10^6, |y| <= 10^6 in the assignments', 'Cells are numbered from 1; for a sum 1 <= x <= y <= n.'],
    slug: 'replace-one-cell-sum-a-range',
    title: 'Replace a Number, Sum a Range',
    tags: ['fenwick-tree', 'point-assignment', 'range-sum', 'queries'],
    concept: {
      title: 'An assignment is an addition of the difference between the new and the old value',
      body: [
        'A Fenwick tree knows only how to **add** to a position. This time the operations **replace** a number by a given value. For the row `3 8 1` the sum of all cells is 12; after replacing the cell 2 by 0 it is 4. To use the tree for this, remember the **current value** of each cell in a plain array `cur`.',
        'Replacing the value `cur[x]` by `y` changes every sum that contains the position `x` by `y - cur[x]`. So an assignment is just an **addition of the difference**: `add(x, y - cur[x])`, followed by `cur[x] = y`. If the new value is equal to the old one, the difference is 0 and nothing changes. Range sums are answered as before, with two prefix sums.',
        { code: 'cur = a[:]                       # the current value of every cell\nfor kind, x, y in ops:\n    if kind == 1:\n        add(t, x, y - cur[x - 1])    # the tree grows by the difference\n        cur[x - 1] = y\n    else:\n        print(prefix(t, y) - prefix(t, x - 1))' },
        'The same trick turns every "set" operation on an additive structure (a Fenwick tree, a prefix table) into an "add" operation. Each operation costs O(log n), and the extra array costs O(n) memory.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y` replaces the number at the position `x` by `y`; type 2 `x y` asks for the sum of the numbers at the positions `x` to `y`. Print the answers to all the questions of type 2 on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '3 3\n3 8 1\n2 1 3\n1 2 0\n2 1 3\n', note: '3 + 8 + 1 = 12; after the replacement 3 + 0 + 1 = 4: 12 4.' }],
    hints: ['A Fenwick tree adds; to replace a value, add the difference.', 'Keep the current value of every cell in an array.', 'Sums are still the difference of two prefix sums.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        t = [0] * (n + 1)
        cur = a[:]
        for i in range(n):
            bit_add(t, i + 1, a[i])
        out = []
        for kind, x, y in ops:
            if kind == 1:
                bit_add(t, x, y - cur[x - 1])
                cur[x - 1] = y
            else:
                out.append(bit_sum(t, y) - bit_sum(t, x - 1))
        print(*out)`,
      cpp: r`
        vector<long long> t(n + 1, 0), cur = a;
        for (long long i = 0; i < n; i++) bitAdd(t, i + 1, a[i]);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                bitAdd(t, x, y - cur[x - 1]);
                cur[x - 1] = y;
            } else {
                if (!out.empty()) out += " ";
                out += to_string(bitSum(t, y) - bitSum(t, x - 1));
            }
        }
        cout << out << "\n";`,
      java: r`
        long[] t = new long[(int) n + 1];
        long[] cur = a.clone();
        for (int i = 0; i < n; i++) bitAdd(t, i + 1, a[i]);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                bitAdd(t, x, y - cur[x - 1]);
                cur[x - 1] = y;
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(bitSum(t, (int) y) - bitSum(t, x - 1));
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The tree stores the sums; a replacement adds the difference between the new and the current value of the cell, and range sums are differences of prefix sums.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); // blocks of 100 cells with their sums
      const B = 100; const sums = new Array(Math.ceil(n / B)).fill(0); a.forEach((v, i) => { sums[Math.floor(i / B)] += v; }); const out = [];
      for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) { sums[Math.floor((x - 1) / B)] += y - a[x - 1]; a[x - 1] = y; } else { let s = 0; let i = x - 1; while (i < y && i % B !== 0) s += a[i++]; while (i + B <= y) { s += sums[i / B]; i += B; } while (i < y) s += a[i++]; out.push(s); } } return out.join(' ');
    },
    tests() {
      const g = rng(4002); const out = ['3 3\n3 8 1\n2 1 3\n1 2 0\n2 1 3\n', '1 3\n7\n2 1 1\n1 1 -3\n2 1 1\n'];
      const make = (n, q, hi) => { const ops = many(q, () => { if (g() < 0.5) return [1, randInt(g, 1, n), randInt(g, -hi, hi)]; const x = randInt(g, 1, n); return [2, x, randInt(g, x, n)]; }); ops.push([2, 1, n]); return `${n} ${q + 1}\n${randArray(g, n, -hi, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { let s = 0; for (let i = x - 1; i < y; i++) s += a[i]; out.push(s); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000], [30000, 29999, 1000000], [30000, 29999, 1000000], [30000, 29999, 3], [29999, 29999, 1000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 50000', '|each number| <= 10^9'],
    slug: 'smaller-numbers-before-each',
    title: 'How Many Smaller Numbers Came Before Each One?',
    tags: ['fenwick-tree', 'counting', 'coordinate-compression'],
    concept: {
      title: 'Compress the values to ranks and keep a Fenwick tree of how many values of each rank have appeared',
      body: [
        'For every number of the list, count how many numbers **before it** in the list are **strictly smaller**. For `5 2 6 1 3` the answers are `0 0 2 0 2`: before 6 there are 5 and 2, and before 3 there are 2 and 1. Counting with two loops takes O(n^2), which is 2.5 * 10^9 steps for 50000 numbers.',
        'Read the list from left to right and keep the numbers seen so far in a **counting table indexed by value**. The answer for a new number `v` is the sum of the counts at the values **below `v`**, which is exactly a **prefix sum**, and after the answer we add 1 to the count at `v`. A Fenwick tree makes both steps O(log n). The values reach 10^9, too large for a table, so first **compress** them: sort the distinct values and replace each value by its rank (1 for the smallest, 2 for the next, and so on). Only the order matters, so the answers do not change.',
        { code: 'order = sorted(set(a))\nrank = {v: i + 1 for i, v in enumerate(order)}     # coordinate compression\nt = [0] * (len(order) + 1)\nfor v in a:\n    r = rank[v]\n    print(prefix(t, r - 1))          # numbers seen so far with a smaller rank\n    add(t, r, 1)                     # now v has been seen' },
        'Equal numbers get the same rank, so a number equal to `v` is **not** counted by `prefix(t, r - 1)`, which is what "strictly smaller" requires. The whole algorithm costs O(n log n). This is the standard way to count the *inversions* of a list as well: the numbers before a value that are *larger* form the inversions.'
      ]
    },
    statement: ['A list of `n` numbers is given. For every number print how many numbers to its left are strictly smaller than it.'],
    outputFormat: ['Print `n` numbers on one line, separated by spaces.'],
    examples: [{ input: '5\n5 2 6 1 3\n', note: 'The answers are 0 0 2 0 2.' }],
    hints: ['Go from left to right, remembering the numbers already seen.', 'The answer for v is the number of seen values below v: a prefix sum over values.', 'Compress the values first so that the Fenwick tree has at most n positions.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        order = sorted(set(a))
        rank = {v: i + 1 for i, v in enumerate(order)}
        t = [0] * (len(order) + 1)
        out = []
        for v in a:
            r = rank[v]
            out.append(bit_sum(t, r - 1))
            bit_add(t, r, 1)
        print(*out)`,
      cpp: r`
        vector<long long> order(a);
        sort(order.begin(), order.end());
        order.erase(unique(order.begin(), order.end()), order.end());
        vector<long long> t(order.size() + 1, 0);
        for (long long i = 0; i < n; i++) {
            long long r = lower_bound(order.begin(), order.end(), a[i]) - order.begin() + 1;
            cout << (i ? " " : "") << bitSum(t, r - 1);
            bitAdd(t, r, 1);
        }
        cout << "\n";`,
      java: r`
        int cn = (int) n;
        long[] order = a.clone();
        Arrays.sort(order);
        int m = 0;
        for (int i = 0; i < cn; i++) {
            if (i == 0 || order[i] != order[i - 1]) order[m++] = order[i];
        }
        long[] t = new long[m + 1];
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < cn; i++) {
            int r = Arrays.binarySearch(order, 0, m, a[i]) + 1;
            if (i > 0) out.append(" ");
            out.append(bitSum(t, r - 1));
            bitAdd(t, r, 1);
        }
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The values are compressed to ranks; scanning from the left, the answer for a number is the Fenwick prefix sum below its rank, and then its rank is incremented.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const a = nums(rows(input)[1]); const { rank, m } = ranks(a); const f = new Fen(m); return rank.map((r) => { const v = f.sum(r - 1); f.add(r, 1); return v; }).join(' ');
    },
    tests() {
      const g = rng(4003); const out = ['5\n5 2 6 1 3\n', '1\n0\n', '3\n4 4 4\n', '4\n1 2 3 4\n', '4\n4 3 2 1\n'];
      const make = (n, lo, hi) => `${n}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (input) => { const a = nums(rows(input)[1]); return a.map((v, i) => { let c = 0; for (let j = 0; j < i; j++) if (a[j] < v) c++; return c; }).join(' '); };
      crossCheck(() => make(randInt(g, 1, 12), -5, 5), (i) => this.solve(i), brute, 800);
      for (const [n, lo, hi] of [[10, -100, 100], [100, -1000, 1000], [1000, -1000000000, 1000000000], [50000, -1000000000, 1000000000], [50000, 0, 10], [50000, -1000000000, 1000000000], [49999, 0, 1000]]) out.push(make(n, lo, hi));
      out.push(`50000\n${many(50000, (i) => i).join(' ')}\n`, `50000\n${many(50000, (i) => 50000 - i).join(' ')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 50000', '|each number| <= 10^9'],
    slug: 'larger-numbers-after-each',
    title: 'How Many Larger Numbers Come After Each One?',
    tags: ['fenwick-tree', 'counting', 'coordinate-compression', 'inversions'],
    concept: {
      title: 'Scan from the right and count the seen values above the current one: a suffix sum is the total minus a prefix sum',
      body: [
        'For every number of the list count how many numbers **after it** are **strictly larger**. For `5 2 6 1 3` the answers are `1 2 0 1 0`: after 5 only 6 is larger, and after 2 both 6 and 3 are larger.',
        'Go through the list **from right to left** and keep the numbers already seen (they are exactly those to the right of the current position). As in the problem about smaller numbers before each one, compress the values to ranks `1..m` and keep a Fenwick tree of counts per rank. The number of seen values **above** the rank `r` is the total number of seen values minus the number of seen values with rank **at most** `r`: `seen - prefix(t, r)`.',
        { code: 'order = sorted(set(a))\nrank = {v: i + 1 for i, v in enumerate(order)}\nt = [0] * (len(order) + 1)\nanswer = [0] * n\nfor i in range(n - 1, -1, -1):\n    r = rank[a[i]]\n    answer[i] = (n - 1 - i) - prefix(t, r)    # seen values minus those that are <= a[i]\n    add(t, r, 1)' },
        'Here `n - 1 - i` is the number of values to the right of position `i`, which is the number already added to the tree. Values equal to `a[i]` are inside `prefix(t, r)`, so they are not counted as larger. Summing all the answers gives the number of *inversions* of the list. Total time O(n log n).'
      ]
    },
    statement: ['A list of `n` numbers is given. For every number print how many numbers to its right are strictly larger than it.'],
    outputFormat: ['Print `n` numbers on one line, separated by spaces.'],
    examples: [{ input: '5\n5 2 6 1 3\n', note: 'After 5: only 6 is larger (1). After 2: 6 and 3 (2). After 6: 0. After 1: 3 (1). After 3: 0. The answers are 1 2 0 1 0.' }],
    hints: ['Go from right to left and keep the seen values in a Fenwick tree over ranks.', 'Larger than the current value = seen - (seen values with rank at most r).', 'Equal values must not be counted.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        order = sorted(set(a))
        rank = {v: i + 1 for i, v in enumerate(order)}
        t = [0] * (len(order) + 1)
        answer = [0] * n
        for i in range(n - 1, -1, -1):
            r = rank[a[i]]
            answer[i] = (n - 1 - i) - bit_sum(t, r)
            bit_add(t, r, 1)
        print(*answer)`,
      cpp: r`
        vector<long long> order(a);
        sort(order.begin(), order.end());
        order.erase(unique(order.begin(), order.end()), order.end());
        vector<long long> t(order.size() + 1, 0), answer(n);
        for (long long i = n - 1; i >= 0; i--) {
            long long r = lower_bound(order.begin(), order.end(), a[i]) - order.begin() + 1;
            answer[i] = (n - 1 - i) - bitSum(t, r);
            bitAdd(t, r, 1);
        }
        for (long long i = 0; i < n; i++) cout << (i ? " " : "") << answer[i];
        cout << "\n";`,
      java: r`
        int cn = (int) n;
        long[] order = a.clone();
        Arrays.sort(order);
        int m = 0;
        for (int i = 0; i < cn; i++) {
            if (i == 0 || order[i] != order[i - 1]) order[m++] = order[i];
        }
        long[] t = new long[m + 1];
        long[] answer = new long[cn];
        for (int i = cn - 1; i >= 0; i--) {
            int r = Arrays.binarySearch(order, 0, m, a[i]) + 1;
            answer[i] = (cn - 1 - i) - bitSum(t, r);
            bitAdd(t, r, 1);
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < cn; i++) {
            if (i > 0) out.append(" ");
            out.append(answer[i]);
        }
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Scanning from the right, a Fenwick tree over the ranks counts the values seen; the larger ones are the seen values minus those with rank at most the current rank.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const a = nums(rows(input)[1]); const n = a.length; const { rank, m } = ranks(a); const f = new Fen(m); const res = new Array(n); for (let i = n - 1; i >= 0; i--) { res[i] = (n - 1 - i) - f.sum(rank[i]); f.add(rank[i], 1); } return res.join(' ');
    },
    tests() {
      const g = rng(4004); const out = ['5\n5 2 6 1 3\n', '1\n0\n', '3\n4 4 4\n', '4\n1 2 3 4\n', '4\n4 3 2 1\n'];
      const make = (n, lo, hi) => `${n}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (input) => { const a = nums(rows(input)[1]); return a.map((v, i) => { let c = 0; for (let j = i + 1; j < a.length; j++) if (a[j] > v) c++; return c; }).join(' '); };
      crossCheck(() => make(randInt(g, 1, 12), -5, 5), (i) => this.solve(i), brute, 800);
      for (const [n, lo, hi] of [[10, -100, 100], [100, -1000, 1000], [1000, -1000000000, 1000000000], [50000, -1000000000, 1000000000], [50000, 0, 10], [50000, -1000000000, 1000000000], [49999, 0, 1000]]) out.push(make(n, lo, hi));
      out.push(`50000\n${many(50000, (i) => i).join(' ')}\n`, `50000\n${many(50000, (i) => 50000 - i).join(' ')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has four numbers `t`, `x`, `y` and `z`. If `t = 1`, add `z` to every cell from `x` to `y`. If `t = 2`, print the value of the cell number `x` (`y` and `z` are 0).'],
    constraints: ['1 <= n, q <= 30000', '|each cell| <= 10^6, |z| <= 10^6', 'Cells are numbered from 1; for an addition 1 <= x <= y <= n.'],
    slug: 'add-to-a-range-ask-one-cell',
    title: 'Add to a Whole Range, Ask About One Cell',
    tags: ['fenwick-tree', 'difference-array', 'range-update', 'point-query'],
    concept: {
      title: 'Store the differences between neighbours: a range addition changes two of them, and a cell is a prefix sum of the differences',
      body: [
        'Now the operations **add a number to a whole range** of cells, and the questions ask for the **value of one cell**. For the row `1 1 1 1` and the operation "add 5 to the cells 2 to 3" the row becomes `1 6 6 1`, so a question about the cell 3 returns 6. Changing every cell of the range would cost O(n) per operation.',
        'Use the **difference array**: `d[i] = a[i] - a[i-1]`. Adding `z` to all the cells from `x` to `y` changes just **two differences**: `d[x]` grows by `z` and `d[y + 1]` shrinks by `z`. The value of a cell is recovered as the sum of the differences before it: `a[i] = d[1] + d[2] + ... + d[i]`, a **prefix sum**. If the differences live in a Fenwick tree, both parts take O(log n): two point additions for an update and one prefix sum for a question.',
        { code: 'd = Fenwick tree over the differences, initially empty\n# the starting values are kept in the array a0\nfor kind, x, y, z in ops:\n    if kind == 1:\n        add(d, x, z)                  # from the cell x on, all values grow by z\n        add(d, y + 1, -z)             # from the cell y + 1 on, they go back\n    else:\n        print(a0[x - 1] + prefix(d, x))' },
        'The tree starts with zeros, and the original values are added at the end (`a0[x - 1]`), so there is no need to build differences of the input. The position `y + 1` can be `n + 1`; the tree ignores it (it only matters for cells to the right of `y`, and there are none). The complexity is O((n + q) log n). This "range update, point query" structure is the Fenwick form of the difference array used for offline range updates.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y z` adds `z` to every number at the positions `x` to `y`; type 2 `x 0 0` asks for the current number at the position `x`. Print the answers to all the questions of type 2 on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '4 3\n1 1 1 1\n1 2 3 5\n2 3 0 0\n2 4 0 0\n', note: 'After adding 5 to the cells 2 and 3 the row is 1 6 6 1: 6 1.' }],
    hints: ['A range addition changes only two differences.', 'The value of a cell is its starting value plus the prefix sum of the differences.', 'Keep the differences in a Fenwick tree.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][4]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        d = [0] * (n + 2)
        out = []
        for kind, x, y, z in ops:
            if kind == 1:
                bit_add(d, x, z)
                bit_add(d, y + 1, -z)
            else:
                out.append(a[x - 1] + bit_sum(d, x))
        print(*out)`,
      cpp: r`
        vector<long long> d(n + 2, 0);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2], z = ops[k][3];
            if (kind == 1) {
                bitAdd(d, x, z);
                bitAdd(d, y + 1, -z);
            } else {
                if (!out.empty()) out += " ";
                out += to_string(a[x - 1] + bitSum(d, x));
            }
        }
        cout << out << "\n";`,
      java: r`
        long[] d = new long[(int) n + 2];
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1], y = (int) ops[k][2];
            long z = ops[k][3];
            if (kind == 1) {
                bitAdd(d, x, z);
                bitAdd(d, y + 1, -z);
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(a[x - 1] + bitSum(d, x));
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The differences between neighbouring cells are kept in a Fenwick tree: a range addition changes two differences, and the value of a cell is its starting value plus the prefix sum of the differences.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; // blocks with a lazy value
      const B = 128; const lazy = new Array(Math.ceil(n / B)).fill(0); for (let k = 0; k < q; k++) { const [t, x, y, z] = nums(rs[2 + k]); if (t === 1) { let i = x - 1; while (i < y && i % B !== 0) a[i++] += z; while (i + B <= y) { lazy[i / B] += z; i += B; } while (i < y) a[i++] += z; } else out.push(a[x - 1] + lazy[Math.floor((x - 1) / B)]); } return out.join(' ');
    },
    tests() {
      const g = rng(4005); const out = ['4 3\n1 1 1 1\n1 2 3 5\n2 3 0 0\n2 4 0 0\n', '1 2\n5\n1 1 1 -7\n2 1 0 0\n'];
      const make = (n, q, hi) => { const ops = many(q, () => { if (g() < 0.5) { const x = randInt(g, 1, n); return [1, x, randInt(g, x, n), randInt(g, -hi, hi)]; } return [2, randInt(g, 1, n), 0, 0]; }); ops.push([2, 1, 0, 0], [2, n, 0, 0]); return `${n} ${q + 2}\n${randArray(g, n, -hi, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y, z] = nums(rs[2 + k]); if (t === 1) { for (let i = x - 1; i < y; i++) a[i] += z; } else out.push(a[x - 1]); } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000], [30000, 29998, 1000000], [30000, 29998, 1000000], [30000, 29998, 3], [29999, 29998, 1000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `q`: the number of operations.', 'Each of the next `q` lines has two numbers `t` and `x`. If `t = 1`, insert the value `x` (the same value may be inserted several times). If `t = 2`, print how many inserted values are at most `x`.'],
    constraints: ['1 <= q <= 50000', '1 <= x <= 200000'],
    slug: 'count-inserted-values-at-most-x',
    title: 'How Many Inserted Numbers Are at Most x?',
    tags: ['fenwick-tree', 'counting', 'online', 'frequency-table'],
    concept: {
      title: 'A Fenwick tree over the values, with one counter per value, answers "how many are at most x" in log steps',
      body: [
        'Numbers arrive one by one, and between them questions come: **how many of the numbers inserted so far are at most `x`?** For the inserted values `5, 3, 5, 9` the answer for `x = 5` is 3 (the values 5, 3, 5). Keeping the inserted values in a sorted list and searching it works but inserting into a sorted array costs O(n); counting with a loop is O(n) per question.',
        'The values are small (at most 200000), so we can index a table **by the value itself**: `cnt[v]` is how many times `v` was inserted. The answer to a question is `cnt[1] + cnt[2] + ... + cnt[x]`, a **prefix sum** of the table. Put the table into a Fenwick tree: inserting `v` is `add(v, 1)`, and the question is `prefix(x)`. Both take about 18 steps for 200000 positions.',
        { code: 'M = 200000\nt = [0] * (M + 1)\nfor kind, x in ops:\n    if kind == 1:\n        add(t, x, 1)               # one more copy of the value x\n    else:\n        print(prefix(t, x))        # how many inserted values are <= x' },
        'When the values are large, they are first compressed to their ranks (read all the operations first, sort the distinct values); here they are small enough to be used as positions directly. The whole input costs O(q log M). Counting with a Fenwick tree over values is the basis of the problems about the order of numbers.'
      ]
    },
    statement: ['Process `q` operations: type 1 `x` inserts the value `x` (a value can be inserted many times); type 2 `x` asks how many of the inserted values are at most `x`. Print the answers to all the questions of type 2 on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '6\n1 5\n1 3\n1 5\n2 5\n1 9\n2 4\n', note: '3 values are at most 5; after inserting 9 there is 1 value at most 4: 3 1.' }],
    hints: ['Use the value itself as a position of the tree.', 'Inserting x is adding 1 at the position x.', 'The answer is the prefix sum up to x.'],
    program: {
      io: ['q:int', 'ops:int[q][2]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        t = [0] * 200001
        out = []
        for kind, x in ops:
            if kind == 1:
                bit_add(t, x, 1)
            else:
                out.append(bit_sum(t, x))
        print(*out)`,
      cpp: r`
        vector<long long> t(200001, 0);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1];
            if (kind == 1) {
                bitAdd(t, x, 1);
            } else {
                if (!out.empty()) out += " ";
                out += to_string(bitSum(t, x));
            }
        }
        cout << out << "\n";`,
      java: r`
        long[] t = new long[200001];
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            if (kind == 1) {
                bitAdd(t, x, 1);
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(bitSum(t, x));
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['A Fenwick tree over the values counts the inserted copies; an insertion adds 1 at the value and a question is the prefix sum up to x.'], complexity: 'Time O(q log M), space O(M).' },
    solve(input) {
      const rs = rows(input); const q = Number(rs[0]); const vals = []; const out = []; const sorted = []; // a sorted list with binary search insertion
      for (let k = 0; k < q; k++) { const [t, x] = nums(rs[1 + k]); if (t === 1) { let lo = 0, hi = sorted.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] <= x) lo = mid + 1; else hi = mid; } sorted.splice(lo, 0, x); } else { let lo = 0, hi = sorted.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] <= x) lo = mid + 1; else hi = mid; } out.push(lo); } } return out.join(' ');
    },
    tests() {
      const g = rng(4006); const out = ['6\n1 5\n1 3\n1 5\n2 5\n1 9\n2 4\n', '1\n2 1\n'];
      const make = (q, hi, pInsert) => { const ops = many(q, () => (g() < pInsert ? [1, randInt(g, 1, hi)] : [2, randInt(g, 1, hi)])); ops.push([2, 200000]); return `${q + 1}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const q = Number(rs[0]); const vals = []; const out = []; for (let k = 0; k < q; k++) { const [t, x] = nums(rs[1 + k]); if (t === 1) vals.push(x); else out.push(vals.filter((v) => v <= x).length); } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 14), 10, 0.6), (i) => this.solve(i), brute, 800);
      for (const [q, hi, p] of [[10, 100, 0.6], [100, 1000, 0.5], [1000, 200000, 0.5], [49999, 200000, 0.6], [49999, 200000, 0.3], [49999, 20, 0.5], [49998, 200000, 0.9]]) out.push(make(q, hi, p));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 40000', '|each number| <= 10^9'],
    slug: 'sum-of-smaller-numbers-before',
    title: 'The Sum of the Smaller Numbers That Came Before',
    tags: ['fenwick-tree', 'prefix-sum', 'coordinate-compression', 'weighted-counting'],
    concept: {
      title: 'The same tree over ranks, but each position stores the sum of the values instead of their count',
      body: [
        'For every number of the list print the **sum** of the numbers before it that are **strictly smaller** than it. For `5 2 6 1 3` the answers are `0 0 7 0 3`: before 6 there are 5 and 2 (sum 7), and before 3 there are 2 and 1 (sum 3). In the problem that counted the smaller numbers before each one, the Fenwick tree stored **how many** values had each rank. Here we need the **total value** with each rank.',
        'The change is tiny: when a number `v` with the rank `r` has been seen, add **`v` itself** (not 1) at the position `r`. The sum of the seen values with a smaller rank is then `prefix(t, r - 1)`. Equal values have the same rank, so they are not included (strict inequality). Negative values are fine, because the tree only adds.',
        { code: 'order = sorted(set(a))\nrank = {v: i + 1 for i, v in enumerate(order)}\nt = [0] * (len(order) + 1)\nfor v in a:\n    r = rank[v]\n    print(prefix(t, r - 1))          # the sum of the earlier smaller values\n    add(t, r, v)                     # store the value, not just one count' },
        'This "count weighted by a value" is the general pattern: a Fenwick tree can store any quantity that is added up, such as a count, a sum, a sum of squares or a bit count. The sums reach about 5 * 10^13, so use 64-bit numbers. Time O(n log n).'
      ]
    },
    statement: ['A list of `n` numbers is given. For every number print the sum of the numbers to its left that are strictly smaller than it (0 if there are none).'],
    outputFormat: ['Print `n` numbers on one line, separated by spaces.'],
    examples: [{ input: '5\n5 2 6 1 3\n', note: 'The answers are 0 0 7 0 3.' }],
    hints: ['Compress the values to ranks.', 'At the position of a rank keep the sum of the seen values with this rank.', 'The answer is the prefix sum below the rank of the current value.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        order = sorted(set(a))
        rank = {v: i + 1 for i, v in enumerate(order)}
        t = [0] * (len(order) + 1)
        out = []
        for v in a:
            r = rank[v]
            out.append(bit_sum(t, r - 1))
            bit_add(t, r, v)
        print(*out)`,
      cpp: r`
        vector<long long> order(a);
        sort(order.begin(), order.end());
        order.erase(unique(order.begin(), order.end()), order.end());
        vector<long long> t(order.size() + 1, 0);
        for (long long i = 0; i < n; i++) {
            long long r = lower_bound(order.begin(), order.end(), a[i]) - order.begin() + 1;
            cout << (i ? " " : "") << bitSum(t, r - 1);
            bitAdd(t, r, a[i]);
        }
        cout << "\n";`,
      java: r`
        int cn = (int) n;
        long[] order = a.clone();
        Arrays.sort(order);
        int m = 0;
        for (int i = 0; i < cn; i++) {
            if (i == 0 || order[i] != order[i - 1]) order[m++] = order[i];
        }
        long[] t = new long[m + 1];
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < cn; i++) {
            int r = Arrays.binarySearch(order, 0, m, a[i]) + 1;
            if (i > 0) out.append(" ");
            out.append(bitSum(t, r - 1));
            bitAdd(t, r, a[i]);
        }
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The values are compressed to ranks; a Fenwick tree stores at each rank the sum of the seen values with that rank, and the answer for a number is the prefix sum below its rank.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const a = nums(rows(input)[1]); const { rank, m } = ranks(a); const f = new Fen(m); return rank.map((r, i) => { const v = f.sum(r - 1); f.add(r, a[i]); return v; }).join(' ');
    },
    tests() {
      const g = rng(4007); const out = ['5\n5 2 6 1 3\n', '1\n0\n', '3\n4 4 4\n', '4\n-1 -2 3 -4\n'];
      const make = (n, lo, hi) => `${n}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (input) => { const a = nums(rows(input)[1]); return a.map((v, i) => { let c = 0; for (let j = 0; j < i; j++) if (a[j] < v) c += a[j]; return c; }).join(' '); };
      crossCheck(() => make(randInt(g, 1, 12), -5, 5), (i) => this.solve(i), brute, 800);
      for (const [n, lo, hi] of [[10, -100, 100], [100, -1000, 1000], [1000, -1000000000, 1000000000], [40000, -1000000000, 1000000000], [40000, 0, 1000000000], [40000, 0, 10], [39999, -1000000000, 0]]) out.push(make(n, lo, hi));
      out.push(`40000\n${many(40000, (i) => 1000000000 - (40000 - i)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of seats and the number of operations.', 'Each of the next `q` lines has two numbers `t` and `i`. If `t = 1`, take the seat `i`; if `t = 2`, free the seat `i`; if `t = 3`, print how many seats with a number smaller than `i` are free.'],
    constraints: ['1 <= n <= 50000, 1 <= q <= 50000', 'All seats are free at the start.', 'Taking a taken seat or freeing a free seat changes nothing.', '1 <= i <= n'],
    slug: 'free-seats-before-a-seat',
    title: 'How Many Seats Are Free Before This One?',
    tags: ['fenwick-tree', 'counting', 'state', 'point-update'],
    concept: {
      title: 'Keep a 0/1 array of free seats in a Fenwick tree and remember each seat\'s state to change it only when needed',
      body: [
        'A row of `n` seats starts empty. People take seats, leave them, and from time to time someone asks: **how many seats before the seat number `i` are free?** For 5 seats, after seats 2 and 4 are taken, the question about the seat 5 returns 2 (seats 1 and 3 are free among those before 5).',
        'Let `free[s]` be 1 if the seat `s` is free and 0 if it is taken. The answer to a question is the sum `free[1] + ... + free[i-1]`, a prefix sum, so a Fenwick tree over `free` does the job. When a seat changes state, add the **change** to the tree: taking a free seat adds `-1`, freeing a taken seat adds `+1`. The operations that do not change anything (taking a taken seat, freeing a free seat) must not touch the tree, so keep the state of every seat in an array.',
        { code: 'state = [1] * (n + 1)                    # 1 = free\nt = tree with 1 at every position\nfor kind, i in ops:\n    if kind == 1 and state[i] == 1:        # take a free seat\n        state[i] = 0; add(t, i, -1)\n    elif kind == 2 and state[i] == 0:      # free a taken seat\n        state[i] = 1; add(t, i, 1)\n    elif kind == 3:\n        print(prefix(t, i - 1))' },
        'Building the tree with a 1 at every position can be done by adding 1 `n` times (O(n log n)). Each operation takes O(log n). The check of the old state is what keeps the counts right when the same operation is repeated.'
      ]
    },
    statement: ['`n` seats are all free at the start. Process `q` operations: type 1 `i` takes the seat `i`, type 2 `i` frees the seat `i` (repeating a state changes nothing), type 3 `i` asks how many free seats have a number smaller than `i`. Print the answers to the operations of type 3 on one line.'],
    outputFormat: ['Print one number for every operation of type 3, separated by spaces.'],
    examples: [{ input: '5 5\n1 2\n1 4\n3 5\n2 2\n3 3\n', note: 'After taking the seats 2 and 4 the free seats before 5 are 1 and 3: 2. After freeing 2 the free seats before 3 are 1 and 2: 2.' }],
    hints: ['Treat the seats as a 0/1 array and sum its prefix.', 'Add -1 when a free seat is taken and +1 when a taken seat is freed.', 'Keep the state of every seat to ignore repeated operations.'],
    program: {
      io: ['n:int q:int', 'ops:int[q][2]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        state = [1] * (n + 1)
        t = [0] * (n + 1)
        for i in range(1, n + 1):
            bit_add(t, i, 1)
        out = []
        for kind, i in ops:
            if kind == 1:
                if state[i] == 1:
                    state[i] = 0
                    bit_add(t, i, -1)
            elif kind == 2:
                if state[i] == 0:
                    state[i] = 1
                    bit_add(t, i, 1)
            else:
                out.append(bit_sum(t, i - 1))
        print(*out)`,
      cpp: r`
        vector<int> state(n + 1, 1);
        vector<long long> t(n + 1, 0);
        for (long long i = 1; i <= n; i++) bitAdd(t, i, 1);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], i = ops[k][1];
            if (kind == 1) {
                if (state[i] == 1) {
                    state[i] = 0;
                    bitAdd(t, i, -1);
                }
            } else if (kind == 2) {
                if (state[i] == 0) {
                    state[i] = 1;
                    bitAdd(t, i, 1);
                }
            } else {
                if (!out.empty()) out += " ";
                out += to_string(bitSum(t, i - 1));
            }
        }
        cout << out << "\n";`,
      java: r`
        int[] state = new int[(int) n + 1];
        long[] t = new long[(int) n + 1];
        for (int i = 1; i <= n; i++) {
            state[i] = 1;
            bitAdd(t, i, 1);
        }
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int i = (int) ops[k][1];
            if (kind == 1) {
                if (state[i] == 1) {
                    state[i] = 0;
                    bitAdd(t, i, -1);
                }
            } else if (kind == 2) {
                if (state[i] == 0) {
                    state[i] = 1;
                    bitAdd(t, i, 1);
                }
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(bitSum(t, i - 1));
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The free seats form a 0/1 array in a Fenwick tree; a change of state adds -1 or +1 only when the state really changes, and a question is a prefix sum.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const state = new Array(n + 1).fill(1); const f = new Fen(n); for (let i = 1; i <= n; i++) f.add(i, 1); const out = []; for (let k = 0; k < q; k++) { const [t, i] = nums(rs[1 + k]); if (t === 1 && state[i] === 1) { state[i] = 0; f.add(i, -1); } else if (t === 2 && state[i] === 0) { state[i] = 1; f.add(i, 1); } else if (t === 3) out.push(f.sum(i - 1)); } return out.join(' ');
    },
    tests() {
      const g = rng(4008); const out = ['5 5\n1 2\n1 4\n3 5\n2 2\n3 3\n', '1 3\n3 1\n1 1\n3 1\n'];
      const make = (n, q) => { const ops = many(q, () => [randInt(g, 1, 3), randInt(g, 1, n)]); ops.push([3, n]); return `${n} ${q + 1}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const free = new Array(n + 1).fill(true); const out = []; for (let k = 0; k < q; k++) { const [t, i] = nums(rs[1 + k]); if (t === 1) free[i] = false; else if (t === 2) free[i] = true; else { let c = 0; for (let s = 1; s < i; s++) if (free[s]) c++; out.push(c); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 14)), (i) => this.solve(i), brute, 800);
      for (const [n, q] of [[10, 20], [100, 300], [1000, 3000], [50000, 49999], [50000, 49999], [3, 49999], [49999, 49999]]) out.push(make(n, q));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of lamps and the number of operations.', 'The second line has `n` numbers, each 0 or 1: the lamps (1 = on).', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, switch the lamp `x` (`y` equals `x`). If `t = 2`, print how many lamps from `x` to `y` are on.'],
    constraints: ['1 <= n, q <= 50000', 'Lamps are numbered from 1; for a count 1 <= x <= y <= n.'],
    slug: 'switch-a-lamp-count-lamps-on',
    title: 'Switch One Lamp, Count the Lamps That Are On',
    tags: ['fenwick-tree', 'binary', 'point-update', 'range-count'],
    concept: {
      title: 'A 0/1 array in a Fenwick tree: switching a lamp is adding +1 or -1, depending on its current state',
      body: [
        'A row of `n` lamps, each on (1) or off (0). One operation **switches** a single lamp (an on lamp goes off and an off lamp goes on). Another asks for the **number of lamps that are on** between the positions `x` and `y`. For the lamps `1 0 1 1` the count in the positions 2 to 4 is 2; after switching the lamp 2 it is 3.',
        'The number of lamps that are on is the **sum** of the 0/1 values, so a Fenwick tree over the lamps answers the questions with two prefix sums. A switch changes the value of one cell by `+1` if the lamp was off and `-1` if it was on, that is `1 - 2 * state`. Keep an array with the current state of every lamp, update it, and add the change to the tree.',
        { code: 'state = lamps[:]\nt = tree with the values of the lamps\nfor kind, x, y in ops:\n    if kind == 1:\n        add(t, x, 1 - 2 * state[x - 1])      # +1 if it was off, -1 if it was on\n        state[x - 1] ^= 1\n    else:\n        print(prefix(t, y) - prefix(t, x - 1))' },
        'The idea generalises to every "toggle" structure over an additive quantity (parity changes, on/off flags). The program makes O(log n) steps per operation, so O((n + q) log n) in total.'
      ]
    },
    statement: ['A row of `n` lamps (0 = off, 1 = on) is given. Process `q` operations: type 1 `x x` switches the lamp `x`; type 2 `x y` asks how many lamps from `x` to `y` are on. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '4 3\n1 0 1 1\n2 2 4\n1 2 2\n2 2 4\n', note: 'Two lamps are on in 2..4; after the switch of the lamp 2 there are three: 2 3.' }],
    hints: ['The count of lamps that are on is a sum of 0/1 values.', 'A switch adds +1 for an off lamp and -1 for an on lamp.', 'Keep the state of each lamp in an array.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        t = [0] * (n + 1)
        state = a[:]
        for i in range(n):
            if a[i]:
                bit_add(t, i + 1, 1)
        out = []
        for kind, x, y in ops:
            if kind == 1:
                bit_add(t, x, 1 - 2 * state[x - 1])
                state[x - 1] ^= 1
            else:
                out.append(bit_sum(t, y) - bit_sum(t, x - 1))
        print(*out)`,
      cpp: r`
        vector<long long> t(n + 1, 0), state = a;
        for (long long i = 0; i < n; i++) if (a[i]) bitAdd(t, i + 1, 1);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                bitAdd(t, x, 1 - 2 * state[x - 1]);
                state[x - 1] ^= 1;
            } else {
                if (!out.empty()) out += " ";
                out += to_string(bitSum(t, y) - bitSum(t, x - 1));
            }
        }
        cout << out << "\n";`,
      java: r`
        long[] t = new long[(int) n + 1];
        long[] state = a.clone();
        for (int i = 0; i < n; i++) if (a[i] != 0) bitAdd(t, i + 1, 1);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                bitAdd(t, x, 1 - 2 * state[x - 1]);
                state[x - 1] ^= 1;
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(bitSum(t, (int) y) - bitSum(t, x - 1));
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The lamps are a 0/1 array in a Fenwick tree; a switch adds +1 or -1 according to the current state, and a count is the difference of two prefix sums.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; // a bitset of words: count the ones with a popcount loop
      for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] ^= 1; else { let c = 0; for (let i = x - 1; i < y; i++) c += a[i]; out.push(c); } } return out.join(' ');
    },
    tests() {
      const g = rng(4009); const out = ['4 3\n1 0 1 1\n2 2 4\n1 2 2\n2 2 4\n', '1 3\n0\n2 1 1\n1 1 1\n2 1 1\n'];
      const make = (n, q, p) => { const ops = many(q, () => { if (g() < p) { const x = randInt(g, 1, n); return [1, x, x]; } const x = randInt(g, 1, n); return [2, x, randInt(g, x, n)]; }); ops.push([2, 1, n]); return `${n} ${q + 1}\n${randArray(g, n, 0, 1).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = 1 - a[x - 1]; else out.push(a.slice(x - 1, y).reduce((s, v) => s + v, 0)); } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 0.5), (i) => this.solve(i), brute, 800);
      for (const [n, q, p] of [[10, 20, 0.5], [100, 300, 0.5], [1000, 3000, 0.5], [50000, 49999, 0.5], [50000, 49999, 0.9], [50000, 49999, 0.1], [49999, 49999, 0.5]]) out.push(make(n, q, p));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of players and the number of operations.', 'The second line has `n` numbers: the scores of the players.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, the score of the player `x` is raised to `y` (`y` is not smaller than the current score). If `t = 2`, print the highest score among the players `1` to `x` (`y` is 0).'],
    constraints: ['1 <= n, q <= 30000', '0 <= each score <= 10^9', 'A raise never lowers a score.'],
    slug: 'best-score-among-the-first-players',
    title: 'The Best Score Among the First Players When Scores Only Rise',
    tags: ['fenwick-tree', 'prefix-maximum', 'point-update', 'monotone'],
    concept: {
      title: 'A Fenwick tree can store a maximum instead of a sum, because the values only grow',
      body: [
        'The scores of `n` players are given. An operation **raises** the score of one player; another asks for the **highest score among the first `x` players**. For the scores `3 9 4 1` the highest among the first three is 9; after raising the fourth player to 12 the highest among all four is 12. Scanning the first `x` scores for every question takes O(n).',
        'The Fenwick tree does not have to store sums. Replace "add" by "maximum": the cell `t[i]` holds the **maximum** of the scores that the cell covers (the last `i & -i` players ending at `i`). To read the maximum of a prefix, jump down as before and take the largest value met on the way. To raise a score, go up as before and set `t[j] = max(t[j], y)` for every cell that covers the player.',
        { code: 'def raise_to(t, i, y):\n    while i <= n:\n        t[i] = max(t[i], y)         # the cell covers i, so its maximum can only grow\n        i += i & -i\n\ndef best(t, i):\n    m = 0\n    while i > 0:\n        m = max(m, t[i])\n        i -= i & -i\n    return m' },
        'This works **only because the scores never decrease**: after a raise the old maximum of a cell is either still correct or replaced by the new score, so `max` is enough. If a score could fall, a covered cell would have to be recomputed from its children, which is what a segment tree does. Each operation costs O(log n).'
      ]
    },
    statement: ['The scores of `n` players are given. Process `q` operations: type 1 `x y` raises the score of the player `x` to `y` (never lowers it); type 2 `x 0` asks for the highest score among the players `1` to `x`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '4 3\n3 9 4 1\n2 3 0\n1 4 12\n2 4 0\n', note: 'The highest among the first three is 9; after the raise the highest among four is 12: 9 12.' }],
    hints: ['Store maxima in the cells of the tree instead of sums.', 'A raise sets t[j] = max(t[j], y) along the update path.', 'A prefix maximum is the largest cell value met on the query path.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      python: r`
        t = [0] * (n + 1)
        for i in range(1, n + 1):
            j = i
            while j <= n:
                if a[i - 1] > t[j]:
                    t[j] = a[i - 1]
                j += j & -j
        out = []
        for kind, x, y in ops:
            if kind == 1:
                j = x
                while j <= n:
                    if y > t[j]:
                        t[j] = y
                    j += j & -j
            else:
                m = 0
                j = x
                while j > 0:
                    if t[j] > m:
                        m = t[j]
                    j -= j & -j
                out.append(m)
        print(*out)`,
      cpp: r`
        vector<long long> t(n + 1, 0);
        for (long long i = 1; i <= n; i++) {
            for (long long j = i; j <= n; j += j & -j) t[j] = max(t[j], a[i - 1]);
        }
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                for (long long j = x; j <= n; j += j & -j) t[j] = max(t[j], y);
            } else {
                long long m = 0;
                for (long long j = x; j > 0; j -= j & -j) m = max(m, t[j]);
                if (!out.empty()) out += " ";
                out += to_string(m);
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        long[] t = new long[cn + 1];
        for (int i = 1; i <= cn; i++) {
            for (int j = i; j <= cn; j += j & -j) t[j] = Math.max(t[j], a[i - 1]);
        }
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                for (int j = x; j <= cn; j += j & -j) t[j] = Math.max(t[j], y);
            } else {
                long m = 0;
                for (int j = x; j > 0; j -= j & -j) m = Math.max(m, t[j]);
                if (out.length() > 0) out.append(" ");
                out.append(m);
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['A Fenwick tree whose cells hold maxima supports raising a value and taking a prefix maximum in O(log n), because the values never decrease.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; // a plain array with a running prefix maximum rebuilt in blocks
      for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = Math.max(a[x - 1], y); else { let m = 0; for (let i = 0; i < x; i++) if (a[i] > m) m = a[i]; out.push(m); } } return out.join(' ');
    },
    tests() {
      const g = rng(4010); const out = ['4 3\n3 9 4 1\n2 3 0\n1 4 12\n2 4 0\n', '1 2\n0\n1 1 5\n2 1 0\n'];
      const make = (n, q, hi) => { const a = randArray(g, n, 0, hi); const cur = a.slice(); const ops = many(q, () => { if (g() < 0.5) { const x = randInt(g, 1, n); const y = Math.min(hi, cur[x - 1] + randInt(g, 0, Math.max(1, hi >> 3))); cur[x - 1] = y; return [1, x, y]; } return [2, randInt(g, 1, n), 0]; }); ops.push([2, n, 0]); return `${n} ${q + 1}\n${a.join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else out.push(Math.max(0, ...a.slice(0, x))); } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 30), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 20, 100], [100, 300, 1000], [1000, 3000, 1000000000], [30000, 29999, 1000000000], [30000, 29999, 100], [30000, 29999, 1000000000], [29999, 29999, 1000000000]]) out.push(make(n, q, hi));
      return out;
    }
  }
];
