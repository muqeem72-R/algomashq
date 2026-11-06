import { r, rng, randInt, many, nums, rows, randArray } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const easy = { difficulty: 'easy' };
const lines = (list) => list.map((p) => p.join(' ')).join('\n');
const gcd = (a, b) => { while (b) { [a, b] = [b, a % b]; } return a; };

// a recursive (top-down) segment tree for the reference solutions; `combine` must be associative
class Seg {
  constructor(a, combine, ident) { this.n = a.length; this.combine = combine; this.ident = ident; this.t = new Array(4 * this.n).fill(ident); this.build(1, 0, this.n - 1, a); }
  build(v, lo, hi, a) { if (lo === hi) { this.t[v] = a[lo]; return; } const mid = (lo + hi) >> 1; this.build(2 * v, lo, mid, a); this.build(2 * v + 1, mid + 1, hi, a); this.t[v] = this.combine(this.t[2 * v], this.t[2 * v + 1]); }
  set(i, val) { this.setAt(1, 0, this.n - 1, i, val); }
  setAt(v, lo, hi, i, val) { if (lo === hi) { this.t[v] = val; return; } const mid = (lo + hi) >> 1; if (i <= mid) this.setAt(2 * v, lo, mid, i, val); else this.setAt(2 * v + 1, mid + 1, hi, i, val); this.t[v] = this.combine(this.t[2 * v], this.t[2 * v + 1]); }
  query(l, rr) { return this.ask(1, 0, this.n - 1, l, rr); }
  ask(v, lo, hi, l, rr) { if (rr < lo || hi < l) return this.ident; if (l <= lo && hi <= rr) return this.t[v]; const mid = (lo + hi) >> 1; return this.combine(this.ask(2 * v, lo, mid, l, rr), this.ask(2 * v + 1, mid + 1, hi, l, rr)); }
}

// the usual shape of the input: `n q`, the row, then q lines `t x y`
const makeOps = (g, n, q, kinds, valueOf, rangeQuery = true) => many(q, () => { if (g() < 0.5) return [1, randInt(g, 1, n), valueOf()]; if (!rangeQuery) return [2, randInt(g, 1, n), valueOf()]; const x = randInt(g, 1, n); return [2, x, randInt(g, x, n)]; });
const inputOf = (n, a, ops) => `${n} ${ops.length}\n${a.join(' ')}\n${lines(ops)}\n`;

export default [
  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print the smallest number among the cells `x` to `y`.'],
    constraints: ['1 <= n, q <= 30000', '|each number| <= 10^9', 'Cells are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'smallest-in-a-range-with-changes',
    title: 'The Smallest Number in a Range, With Changes',
    tags: ['segment-tree', 'point-update', 'range-minimum', 'queries'],
    concept: {
      title: 'A segment tree keeps the minimum of every block of a halving partition of the row, so a change touches log n blocks and a question uses log n blocks',
      body: [
        'A row of numbers changes one cell at a time, and between the changes we must answer **"what is the smallest number from the cell `x` to the cell `y`?"** A Fenwick tree cannot help here: the minimum cannot be undone by subtracting, so a prefix minimum does not give a range minimum. Checking the range with a loop costs O(n) for each question.',
        'A **segment tree** stores, for every block of a partition of the row, the minimum of the block. The leaves are the cells; each inner node covers two children and keeps the smaller of their minima. With `n` rounded up to a power of two (`size`) the tree lives in an array of `2 * size` numbers: the leaf of the cell `i` is `tree[size + i]` and the parent of the node `v` is `v / 2`. **Changing** a cell sets its leaf and recomputes the parents up to the root: about log n steps. A **question** for the half-open range `[lo, hi)` walks up from both ends: when `lo` is a right child its block is used and `lo` moves right; when `hi` is a right child, the block left of it is used. The blocks used are at most 2 log n.',
        { code: 'size = 1\nwhile size < n: size *= 2\ntree = [INF] * (2 * size)\nfor i in range(n): tree[size + i] = a[i]\nfor v in range(size - 1, 0, -1): tree[v] = min(tree[2*v], tree[2*v + 1])\n\ndef change(i, value):\n    v = size + i; tree[v] = value\n    v //= 2\n    while v: tree[v] = min(tree[2*v], tree[2*v + 1]); v //= 2\n\ndef smallest(lo, hi):               # the cells lo .. hi - 1, counted from 0\n    lo += size; hi += size; res = INF\n    while lo < hi:\n        if lo & 1: res = min(res, tree[lo]); lo += 1\n        if hi & 1: hi -= 1; res = min(res, tree[hi])\n        lo //= 2; hi //= 2\n    return res' },
        'Unused leaves hold `INF` so that they never win. This bottom-up form is short and fast; it works for every operation that is associative and does not depend on the order (minimum, maximum, sum, gcd). Building takes O(n), and each change or question O(log n).'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` asks for the smallest number among the positions `x` to `y`. Print the answers to the questions of type 2 on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '5 4\n5 3 8 1 9\n2 1 3\n1 4 10\n2 3 5\n2 1 5\n', note: 'The smallest of 5 3 8 is 3; after the change the row is 5 3 8 10 9, the smallest of 8 10 9 is 8 and of the whole row 3: 3 8 3.' }],
    hints: ['Keep the minimum of every block in a tree stored in an array.', 'A change recomputes the parents of one leaf.', 'A question combines at most two blocks per level.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      python: r`
        size = 1
        while size < n:
            size *= 2
        inf = 1 << 62
        tree = [inf] * (2 * size)
        for i in range(n):
            tree[size + i] = a[i]
        for v in range(size - 1, 0, -1):
            tree[v] = min(tree[2 * v], tree[2 * v + 1])
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                tree[v] = y
                v //= 2
                while v:
                    tree[v] = min(tree[2 * v], tree[2 * v + 1])
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                res = inf
                while lo < hi:
                    if lo & 1:
                        res = min(res, tree[lo])
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        res = min(res, tree[hi])
                    lo //= 2
                    hi //= 2
                out.append(res)
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        const long long INF = 1LL << 62;
        vector<long long> tree(2 * size, INF);
        for (long long i = 0; i < n; i++) tree[size + i] = a[i];
        for (long long v = size - 1; v >= 1; v--) tree[v] = min(tree[2 * v], tree[2 * v + 1]);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                tree[v] = y;
                for (v /= 2; v >= 1; v /= 2) tree[v] = min(tree[2 * v], tree[2 * v + 1]);
            } else {
                long long lo = size + x - 1, hi = size + y, res = INF;
                while (lo < hi) {
                    if (lo & 1) res = min(res, tree[lo++]);
                    if (hi & 1) res = min(res, tree[--hi]);
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(res);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long inf = 1L << 62;
        long[] tree = new long[2 * size];
        Arrays.fill(tree, inf);
        for (int i = 0; i < n; i++) tree[size + i] = a[i];
        for (int v = size - 1; v >= 1; v--) tree[v] = Math.min(tree[2 * v], tree[2 * v + 1]);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1], y = (int) ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                tree[v] = y;
                for (v /= 2; v >= 1; v /= 2) tree[v] = Math.min(tree[2 * v], tree[2 * v + 1]);
            } else {
                int lo = size + x - 1, hi = size + y;
                long res = inf;
                while (lo < hi) {
                    if ((lo & 1) == 1) res = Math.min(res, tree[lo++]);
                    if ((hi & 1) == 1) res = Math.min(res, tree[--hi]);
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(res);
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['A segment tree stores the minimum of each block; a change recomputes the parents of a leaf, and a question combines the O(log n) blocks that make up the range.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const seg = new Seg(a, Math.min, Infinity); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) seg.set(x - 1, y); else out.push(seg.query(x - 1, y - 1)); } return out.join(' ');
    },
    tests() {
      const g = rng(4101); const out = ['5 4\n5 3 8 1 9\n2 1 3\n1 4 10\n2 3 5\n2 1 5\n', '1 3\n7\n2 1 1\n1 1 -3\n2 1 1\n'];
      const make = (n, q, hi) => { const a = randArray(g, n, -hi, hi); const ops = makeOps(g, n, q, 2, () => randInt(g, -hi, hi)); ops.push([2, 1, n]); return inputOf(n, a, ops); };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else out.push(Math.min(...a.slice(x - 1, y))); } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000000], [30000, 29999, 1000000000], [30000, 29999, 1000000000], [30000, 29999, 5], [29999, 29999, 1000000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print the number of the first cell at position `x` or later whose value is at least `y`, or -1 if there is none.'],
    constraints: ['1 <= n, q <= 30000', '|each number| <= 10^9', 'For a question 1 <= x <= n.'],
    slug: 'first-position-at-least-x',
    title: 'The First Cell From a Position That Is at Least x',
    tags: ['segment-tree', 'tree-descent', 'point-update', 'search'],
    concept: {
      title: 'With maxima in the tree, a question can walk down to the leftmost block that has a large enough maximum',
      body: [
        'A row of numbers changes one cell at a time. A question gives a start position `x` and a limit `y`: **find the first cell at position `x` or later whose value is at least `y`**, or report that there is none. For the row `3 1 4 1 5 9 2 6` the first cell from the position 3 with a value of at least 5 is the cell 5. Scanning from `x` costs O(n) in the worst case.',
        'Keep the **maximum** of every block in a segment tree. A block whose maximum is less than `y` contains no answer and can be skipped as a whole. Start at the leaf of the cell `x`. If this leaf is large enough, we are done. Otherwise move to the next block on the right: while the current node is a **right child**, go up to its parent (that block is finished); then step to the **right sibling** (the node `v + 1`). At the first node with `tree[v] >= y` the answer is inside it: **descend**, going to the left child if its maximum is at least `y` and to the right child otherwise.',
        { code: 'def first_at_least(x, y):               # x counted from 0\n    v = size + x\n    while True:\n        if tree[v] >= y:\n            while v < size:                 # go down to the leftmost good leaf\n                v = 2 * v if tree[2 * v] >= y else 2 * v + 1\n            return v - size + 1\n        while v & 1:\n            v //= 2                          # this block is finished, leave it\n        if v == 0:\n            return -1\n        v += 1                               # the next block on the right' },
        'Unused leaves hold a value smaller than every limit, so the descent never ends in them. The search skips whole blocks, so it takes O(log n) steps, the same as a change of one cell. This "walk on the tree" is what makes a segment tree stronger than a Fenwick tree for searching questions.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` asks for the smallest position `p >= x` with the number at `p` at least `y` (print -1 if there is none). Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '8 3\n3 1 4 1 5 9 2 6\n2 3 5\n1 3 7\n2 3 5\n', note: 'The first cell from 3 with a value of at least 5 is the cell 5. After the change the cell 3 itself qualifies: 5 3.' }],
    hints: ['Store the maximum of every block.', 'Skip a block whose maximum is below the limit.', 'Climb while the node is a right child, step to the right sibling, and descend into the leftmost good child.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      python: r`
        size = 1
        while size < n:
            size *= 2
        low = -(1 << 62)
        tree = [low] * (2 * size)
        for i in range(n):
            tree[size + i] = a[i]
        for v in range(size - 1, 0, -1):
            tree[v] = max(tree[2 * v], tree[2 * v + 1])
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                tree[v] = y
                v //= 2
                while v:
                    tree[v] = max(tree[2 * v], tree[2 * v + 1])
                    v //= 2
            else:
                v = size + x - 1
                answer = -1
                while True:
                    if tree[v] >= y:
                        while v < size:
                            v = 2 * v if tree[2 * v] >= y else 2 * v + 1
                        answer = v - size + 1
                        break
                    while v & 1:
                        v //= 2
                    if v == 0:
                        break
                    v += 1
                out.append(answer)
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        const long long LOW = -(1LL << 62);
        vector<long long> tree(2 * size, LOW);
        for (long long i = 0; i < n; i++) tree[size + i] = a[i];
        for (long long v = size - 1; v >= 1; v--) tree[v] = max(tree[2 * v], tree[2 * v + 1]);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                tree[v] = y;
                for (v /= 2; v >= 1; v /= 2) tree[v] = max(tree[2 * v], tree[2 * v + 1]);
            } else {
                long long v = size + x - 1, answer = -1;
                while (true) {
                    if (tree[v] >= y) {
                        while (v < size) v = (tree[2 * v] >= y) ? 2 * v : 2 * v + 1;
                        answer = v - size + 1;
                        break;
                    }
                    while (v & 1) v /= 2;
                    if (v == 0) break;
                    v++;
                }
                if (!out.empty()) out += " ";
                out += to_string(answer);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long low = -(1L << 62);
        long[] tree = new long[2 * size];
        Arrays.fill(tree, low);
        for (int i = 0; i < n; i++) tree[size + i] = a[i];
        for (int v = size - 1; v >= 1; v--) tree[v] = Math.max(tree[2 * v], tree[2 * v + 1]);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                tree[v] = y;
                for (v /= 2; v >= 1; v /= 2) tree[v] = Math.max(tree[2 * v], tree[2 * v + 1]);
            } else {
                int v = size + x - 1;
                long answer = -1;
                while (true) {
                    if (tree[v] >= y) {
                        while (v < size) v = (tree[2 * v] >= y) ? 2 * v : 2 * v + 1;
                        answer = v - size + 1;
                        break;
                    }
                    while ((v & 1) == 1) v /= 2;
                    if (v == 0) break;
                    v++;
                }
                if (out.length() > 0) out.append(" ");
                out.append(answer);
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['The tree stores block maxima; a question starts at the leaf of x, skips finished blocks by climbing from right children and stepping to right siblings, and descends into the leftmost child whose maximum reaches the limit.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const seg = new Seg(a, Math.max, -Infinity); const out = []; // a recursive search for the first block with a large maximum
      const find = (v, lo, hi, from, y) => { if (hi < from || seg.t[v] < y) return -1; if (lo === hi) return lo; const mid = (lo + hi) >> 1; const left = find(2 * v, lo, mid, from, y); return left !== -1 ? left : find(2 * v + 1, mid + 1, hi, from, y); };
      for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) seg.set(x - 1, y); else { const p = find(1, 0, n - 1, x - 1, y); out.push(p === -1 ? -1 : p + 1); } } return out.join(' ');
    },
    tests() {
      const g = rng(4102); const out = ['8 3\n3 1 4 1 5 9 2 6\n2 3 5\n1 3 7\n2 3 5\n', '1 2\n5\n2 1 6\n2 1 5\n'];
      const make = (n, q, hi) => { const a = randArray(g, n, -hi, hi); const ops = many(q, () => (g() < 0.4 ? [1, randInt(g, 1, n), randInt(g, -hi, hi)] : [2, randInt(g, 1, n), randInt(g, hi >> 1, hi + 1)])); return inputOf(n, a, ops); };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { let p = -1; for (let i = x - 1; i < n; i++) if (a[i] >= y) { p = i + 1; break; } out.push(p); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000000], [30000, 30000, 1000000000], [30000, 30000, 1000000000], [30000, 30000, 5], [29999, 30000, 1000000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print how many cells from `x` to `y` are equal to 0.'],
    constraints: ['1 <= n, q <= 30000', '|each number| <= 10^9', 'Cells are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'zeros-in-a-range-with-changes',
    title: 'How Many Zeros Are in a Range?',
    tags: ['segment-tree', 'point-update', 'counting', 'queries'],
    concept: {
      title: 'Store in every node how many zeros its block contains; a parent is the sum of its children',
      body: [
        'A row of numbers changes one cell at a time, and questions ask **how many cells in the range `x..y` are equal to 0**. For the row `0 5 0 0 3` the answer for the cells 1 to 4 is 3; after setting the cell 2 to 0 it is 4. A change can turn a zero into a non-zero number and the other way round.',
        'In a segment tree each node keeps `count`, the number of zeros in its block. A leaf has `count = 1` if its cell is 0 and `count = 0` otherwise; an inner node has `count = left.count + right.count`. **Changing** a cell recomputes the leaf (`1` if the new value is 0) and the parents up to the root. A **question** adds up the counts of the O(log n) blocks that cover the range. This is a segment tree with the operation "sum", where the stored quantity is an indicator `value == 0`.',
        { code: 'tree[size + i] = 1 if a[i] == 0 else 0           # leaves\nfor v in range(size - 1, 0, -1): tree[v] = tree[2*v] + tree[2*v + 1]\n\ndef change(i, value):\n    v = size + i; tree[v] = 1 if value == 0 else 0\n    v //= 2\n    while v: tree[v] = tree[2*v] + tree[2*v + 1]; v //= 2\n\n# a question: add the counts of the blocks of the range (the same loop as for the minimum)' },
        'The same code with a different indicator counts the cells that are even, negative, equal to a given number, and so on. It is O(log n) for a change and for a question. (A Fenwick tree would also do for this particular question, because a count can be subtracted; a segment tree is chosen here to practise the structure.)'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` asks how many numbers among the positions `x` to `y` are equal to 0. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '5 3\n0 5 0 0 3\n2 1 4\n1 2 0\n2 1 4\n', note: 'Three zeros, and after the change four: 3 4.' }],
    hints: ['A leaf stores 1 for a zero and 0 for another number.', 'A parent stores the sum of its children.', 'A question adds the counts of the blocks covering the range.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      python: r`
        size = 1
        while size < n:
            size *= 2
        tree = [0] * (2 * size)
        for i in range(n):
            if a[i] == 0:
                tree[size + i] = 1
        for v in range(size - 1, 0, -1):
            tree[v] = tree[2 * v] + tree[2 * v + 1]
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                tree[v] = 1 if y == 0 else 0
                v //= 2
                while v:
                    tree[v] = tree[2 * v] + tree[2 * v + 1]
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                res = 0
                while lo < hi:
                    if lo & 1:
                        res += tree[lo]
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        res += tree[hi]
                    lo //= 2
                    hi //= 2
                out.append(res)
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        vector<long long> tree(2 * size, 0);
        for (long long i = 0; i < n; i++) tree[size + i] = (a[i] == 0) ? 1 : 0;
        for (long long v = size - 1; v >= 1; v--) tree[v] = tree[2 * v] + tree[2 * v + 1];
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                tree[v] = (y == 0) ? 1 : 0;
                for (v /= 2; v >= 1; v /= 2) tree[v] = tree[2 * v] + tree[2 * v + 1];
            } else {
                long long lo = size + x - 1, hi = size + y, res = 0;
                while (lo < hi) {
                    if (lo & 1) res += tree[lo++];
                    if (hi & 1) res += tree[--hi];
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(res);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long[] tree = new long[2 * size];
        for (int i = 0; i < n; i++) tree[size + i] = (a[i] == 0) ? 1 : 0;
        for (int v = size - 1; v >= 1; v--) tree[v] = tree[2 * v] + tree[2 * v + 1];
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                tree[v] = (y == 0) ? 1 : 0;
                for (v /= 2; v >= 1; v /= 2) tree[v] = tree[2 * v] + tree[2 * v + 1];
            } else {
                int lo = size + x - 1, hi = size + (int) y;
                long res = 0;
                while (lo < hi) {
                    if ((lo & 1) == 1) res += tree[lo++];
                    if ((hi & 1) == 1) res += tree[--hi];
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(res);
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['Every node stores the number of zeros in its block (the sum of its children); a change updates a leaf and its parents, and a question adds the counts of the blocks covering the range.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const seg = new Seg(a.map((v) => (v === 0 ? 1 : 0)), (x, y) => x + y, 0); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) seg.set(x - 1, y === 0 ? 1 : 0); else out.push(seg.query(x - 1, y - 1)); } return out.join(' ');
    },
    tests() {
      const g = rng(4103); const out = ['5 3\n0 5 0 0 3\n2 1 4\n1 2 0\n2 1 4\n', '1 3\n0\n2 1 1\n1 1 4\n2 1 1\n'];
      const val = (hi) => (g() < 0.4 ? 0 : randInt(g, -hi, hi));
      const make = (n, q, hi) => { const a = many(n, () => val(hi)); const ops = makeOps(g, n, q, 2, () => val(hi)); ops.push([2, 1, n]); return inputOf(n, a, ops); };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else out.push(a.slice(x - 1, y).filter((v) => v === 0).length); } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 3), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000000], [30000, 29999, 1000000000], [30000, 29999, 2], [30000, 29999, 1000000000], [29999, 29999, 1000000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print the greatest common divisor of the cells `x` to `y`.'],
    constraints: ['1 <= n, q <= 30000', '1 <= each number <= 10^9', 'Cells are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'gcd-of-a-range-with-changes',
    title: 'The Greatest Common Divisor of a Range, With Changes',
    tags: ['segment-tree', 'gcd', 'point-update', 'queries'],
    concept: {
      title: 'The gcd of a block is the gcd of the gcds of its two halves, so gcd fits a segment tree just like a sum',
      body: [
        'A row of positive numbers changes one cell at a time, and questions ask for the **greatest common divisor** of all the numbers from `x` to `y`. For `12 18 30 8` the gcd of the cells 1 to 3 is 6, and of all four cells it is 2. Subtracting does not work for the gcd (there is no inverse), so prefix tables cannot be used after changes.',
        'The gcd is **associative**: `gcd(a, b, c, d) = gcd(gcd(a, b), gcd(c, d))`, and `gcd(0, x) = x`, so 0 is a neutral element. Therefore the segment tree works exactly as for the minimum, with `gcd` as the combining operation and 0 as the value of unused leaves. A change recomputes the gcds of the parents of one leaf; a question combines the gcds of O(log n) blocks.',
        { code: 'def gcd(a, b):\n    while b: a, b = b, a % b\n    return a\n\ntree[size + i] = a[i]; unused leaves = 0\nfor v in range(size - 1, 0, -1): tree[v] = gcd(tree[2*v], tree[2*v + 1])\n# a change and a question work as for the minimum, with gcd instead of min' },
        'One gcd costs O(log 10^9) steps (about 45 divisions in the worst case), but the gcds of nearby blocks share a lot of structure, so the total cost per change or question is O(log n + log max) in amortised terms, which is fast enough for 30000 operations. This structure is also a good example of a tree that is not a sum.'
      ]
    },
    statement: ['A row of `n` positive numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` asks for the greatest common divisor of the numbers at the positions `x` to `y`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '4 3\n12 18 30 8\n2 1 3\n2 1 4\n1 3 9\n', note: 'gcd(12, 18, 30) = 6 and gcd(12, 18, 30, 8) = 2.' }],
    hints: ['gcd is associative and gcd(0, x) = x.', 'Use the same tree as for the minimum, with gcd as the operation.', 'Unused leaves hold 0.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      helpers: {
        python: r`
          def gcd(a, b):
              while b:
                  a, b = b, a % b
              return a`,
        cpp: r`
          long long gcdOf(long long a, long long b) {
              while (b) {
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
        size = 1
        while size < n:
            size *= 2
        tree = [0] * (2 * size)
        for i in range(n):
            tree[size + i] = a[i]
        for v in range(size - 1, 0, -1):
            tree[v] = gcd(tree[2 * v], tree[2 * v + 1])
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                tree[v] = y
                v //= 2
                while v:
                    tree[v] = gcd(tree[2 * v], tree[2 * v + 1])
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                res = 0
                while lo < hi:
                    if lo & 1:
                        res = gcd(res, tree[lo])
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        res = gcd(res, tree[hi])
                    lo //= 2
                    hi //= 2
                out.append(res)
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        vector<long long> tree(2 * size, 0);
        for (long long i = 0; i < n; i++) tree[size + i] = a[i];
        for (long long v = size - 1; v >= 1; v--) tree[v] = gcdOf(tree[2 * v], tree[2 * v + 1]);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                tree[v] = y;
                for (v /= 2; v >= 1; v /= 2) tree[v] = gcdOf(tree[2 * v], tree[2 * v + 1]);
            } else {
                long long lo = size + x - 1, hi = size + y, res = 0;
                while (lo < hi) {
                    if (lo & 1) res = gcdOf(res, tree[lo++]);
                    if (hi & 1) res = gcdOf(res, tree[--hi]);
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(res);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long[] tree = new long[2 * size];
        for (int i = 0; i < n; i++) tree[size + i] = a[i];
        for (int v = size - 1; v >= 1; v--) tree[v] = gcdOf(tree[2 * v], tree[2 * v + 1]);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                tree[v] = y;
                for (v /= 2; v >= 1; v /= 2) tree[v] = gcdOf(tree[2 * v], tree[2 * v + 1]);
            } else {
                int lo = size + x - 1, hi = size + (int) y;
                long res = 0;
                while (lo < hi) {
                    if ((lo & 1) == 1) res = gcdOf(res, tree[lo++]);
                    if ((hi & 1) == 1) res = gcdOf(res, tree[--hi]);
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(res);
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['A segment tree with gcd as the combining operation (0 for unused leaves) supports changing one cell and the gcd of a range in O(log n) combinations.'], complexity: 'Time O((n + q) (log n + log max)), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const seg = new Seg(a, gcd, 0); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) seg.set(x - 1, y); else out.push(seg.query(x - 1, y - 1)); } return out.join(' ');
    },
    tests() {
      const g = rng(4104); const out = ['4 3\n12 18 30 8\n2 1 3\n2 1 4\n1 3 9\n', '1 2\n7\n2 1 1\n1 1 14\n'.replace('1 2\n', '1 3\n') + '2 1 1\n'];
      // numbers with many common factors, so that the gcd is not always 1
      const val = (base) => base * randInt(g, 1, Math.max(1, Math.floor(1000000000 / base) >= 2 ? Math.min(1000, Math.floor(1000000000 / base)) : 1));
      const make = (n, q, base) => { const a = many(n, () => val(base)); const ops = makeOps(g, n, q, 2, () => val(base)); ops.push([2, 1, n]); return inputOf(n, a, ops); };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { let r0 = 0; for (let i = x - 1; i < y; i++) r0 = gcd(r0, a[i]); out.push(r0); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), randInt(g, 1, 6)), (i) => this.solve(i), brute, 800);
      for (const [n, q, base] of [[10, 10, 6], [100, 100, 12], [1000, 1000, 360], [30000, 29999, 1], [30000, 29999, 720720], [30000, 29999, 30], [29999, 29999, 1000000]]) out.push(make(n, q, base));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print two numbers: the sum and the largest value of the cells `x` to `y`.'],
    constraints: ['1 <= n, q <= 30000', '|each number| <= 10^6', 'Cells are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'sum-and-largest-of-a-range',
    title: 'The Sum and the Largest Number of a Range',
    tags: ['segment-tree', 'merge-nodes', 'point-update', 'queries'],
    concept: {
      title: 'A node can store several values at once, as long as two nodes can be merged into one',
      body: [
        'A row of numbers changes one cell at a time. Each question asks for **two** answers about the range `x..y`: the **sum** of the cells and the **largest** cell. For `4 -1 7 2` the cells 2 to 4 have the sum 8 and the largest 7. One could keep two trees, but it is more convenient to keep one tree whose every node stores a **pair** `(sum, maximum)`.',
        'The idea of a segment tree is that a node is computed from its two children by a *merge* rule. For the pair the rule is `(s1 + s2, max(m1, m2))`, and the neutral element for unused leaves is `(0, -INF)`. The same loops as before (a change with the parents recomputed, a question that merges O(log n) blocks) work with the new merge rule. If the merge rule is associative, any quantity that can be computed this way fits the tree.',
        { code: 'def merge(a, b):                           # a node is the pair (sum, maximum)\n    return (a[0] + b[0], max(a[1], b[1]))\n\nNEUTRAL = (0, -INF)\n# build, change and question: as for the minimum, with merge(...) in place of min(...)' },
        'Because the merge is the only place that knows the meaning of the data, the next problems reuse the same skeleton with other merges: the number of maxima, the minimum with its position, the longest run of equal values, and so on. The cost is O(log n) merges per operation; the sums here are below 3 * 10^10.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` asks for the sum and the largest of the numbers at the positions `x` to `y`. For every question print the two numbers; print all the numbers on one line, in order.'],
    outputFormat: ['For every operation of type 2 print the sum and then the largest value, all separated by spaces.'],
    examples: [{ input: '4 3\n4 -1 7 2\n2 2 4\n1 3 0\n2 2 4\n', note: 'The cells -1 7 2 have the sum 8 and the largest 7; after the change they are -1 0 2: sum 1, largest 2. The output is 8 7 1 2.' }],
    hints: ['Store the pair (sum, maximum) in each node.', 'Merge two nodes as (s1 + s2, max(m1, m2)).', 'The neutral node is (0, -infinity).'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      python: r`
        size = 1
        while size < n:
            size *= 2
        low = -(1 << 62)
        ts = [0] * (2 * size)
        tm = [low] * (2 * size)
        for i in range(n):
            ts[size + i] = a[i]
            tm[size + i] = a[i]
        for v in range(size - 1, 0, -1):
            ts[v] = ts[2 * v] + ts[2 * v + 1]
            tm[v] = max(tm[2 * v], tm[2 * v + 1])
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                ts[v] = y
                tm[v] = y
                v //= 2
                while v:
                    ts[v] = ts[2 * v] + ts[2 * v + 1]
                    tm[v] = max(tm[2 * v], tm[2 * v + 1])
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                s = 0
                m = low
                while lo < hi:
                    if lo & 1:
                        s += ts[lo]
                        m = max(m, tm[lo])
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        s += ts[hi]
                        m = max(m, tm[hi])
                    lo //= 2
                    hi //= 2
                out.append(s)
                out.append(m)
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        const long long LOW = -(1LL << 62);
        vector<long long> ts(2 * size, 0), tm(2 * size, LOW);
        for (long long i = 0; i < n; i++) ts[size + i] = tm[size + i] = a[i];
        for (long long v = size - 1; v >= 1; v--) {
            ts[v] = ts[2 * v] + ts[2 * v + 1];
            tm[v] = max(tm[2 * v], tm[2 * v + 1]);
        }
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                ts[v] = tm[v] = y;
                for (v /= 2; v >= 1; v /= 2) {
                    ts[v] = ts[2 * v] + ts[2 * v + 1];
                    tm[v] = max(tm[2 * v], tm[2 * v + 1]);
                }
            } else {
                long long lo = size + x - 1, hi = size + y, s = 0, m = LOW;
                while (lo < hi) {
                    if (lo & 1) {
                        s += ts[lo];
                        m = max(m, tm[lo]);
                        lo++;
                    }
                    if (hi & 1) {
                        --hi;
                        s += ts[hi];
                        m = max(m, tm[hi]);
                    }
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(s) + " " + to_string(m);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long low = -(1L << 62);
        long[] ts = new long[2 * size];
        long[] tm = new long[2 * size];
        Arrays.fill(tm, low);
        for (int i = 0; i < n; i++) {
            ts[size + i] = a[i];
            tm[size + i] = a[i];
        }
        for (int v = size - 1; v >= 1; v--) {
            ts[v] = ts[2 * v] + ts[2 * v + 1];
            tm[v] = Math.max(tm[2 * v], tm[2 * v + 1]);
        }
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                ts[v] = y;
                tm[v] = y;
                for (v /= 2; v >= 1; v /= 2) {
                    ts[v] = ts[2 * v] + ts[2 * v + 1];
                    tm[v] = Math.max(tm[2 * v], tm[2 * v + 1]);
                }
            } else {
                int lo = size + x - 1, hi = size + (int) y;
                long s = 0, m = low;
                while (lo < hi) {
                    if ((lo & 1) == 1) {
                        s += ts[lo];
                        m = Math.max(m, tm[lo]);
                        lo++;
                    }
                    if ((hi & 1) == 1) {
                        --hi;
                        s += ts[hi];
                        m = Math.max(m, tm[hi]);
                    }
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(s).append(" ").append(m);
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['Each node stores the pair (sum, maximum) of its block; a change recomputes the parents of a leaf and a question merges the pairs of the blocks covering the range.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const seg = new Seg(a.map((v) => [v, v]), (p, s) => [p[0] + s[0], Math.max(p[1], s[1])], [0, -Infinity]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) seg.set(x - 1, [y, y]); else { const res = seg.query(x - 1, y - 1); out.push(res[0], res[1]); } } return out.join(' ');
    },
    tests() {
      const g = rng(4105); const out = ['4 3\n4 -1 7 2\n2 2 4\n1 3 0\n2 2 4\n', '1 2\n5\n2 1 1\n1 1 -9\n'.replace('1 2\n', '1 3\n') + '2 1 1\n'];
      const make = (n, q, hi) => { const a = randArray(g, n, -hi, hi); const ops = makeOps(g, n, q, 2, () => randInt(g, -hi, hi)); ops.push([2, 1, n]); return inputOf(n, a, ops); };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { const part = a.slice(x - 1, y); out.push(part.reduce((s, v) => s + v, 0), Math.max(...part)); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000], [30000, 29999, 1000000], [30000, 29999, 1000000], [30000, 29999, 3], [29999, 29999, 1000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print the bitwise XOR of the cells `x` to `y`.'],
    constraints: ['1 <= n, q <= 30000', '0 <= each number < 2^30', 'Cells are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'xor-of-a-range-with-changes',
    title: 'The XOR of a Range, With Changes',
    tags: ['segment-tree', 'xor', 'point-update', 'queries'],
    concept: {
      title: 'XOR is associative and its own inverse; in a segment tree the combining operation is simply ^',
      body: [
        'A row of non-negative numbers changes one cell at a time; each question asks for the **XOR** of the numbers from `x` to `y`. For `5 3 6 1` the XOR of the cells 2 to 4 is `3 ^ 6 ^ 1 = 4`. If there were no changes, prefix XORs would answer everything in O(1): `P[y] ^ P[x - 1]`. A change of one cell, however, alters `P` from that cell to the end, so the table is no longer usable.',
        'Use a segment tree whose nodes store the XOR of their blocks. The operation is associative and the neutral element is 0, so the skeleton is exactly the one used for the sum. A change recomputes the parents of a leaf; a question XORs the O(log n) blocks of the range. (A Fenwick tree could do this too, since XOR can be undone by XOR, if the change is applied as `old ^ new`; the segment tree needs no such trick.)',
        { code: 'tree[size + i] = a[i]; unused leaves = 0\nfor v in range(size - 1, 0, -1): tree[v] = tree[2*v] ^ tree[2*v + 1]\n\ndef change(i, value):\n    v = size + i; tree[v] = value\n    v //= 2\n    while v: tree[v] = tree[2*v] ^ tree[2*v + 1]; v //= 2\n\n# a question: XOR the blocks of the range, exactly like the loop for the minimum' },
        'The cost is O(log n) per operation. Any group operation (sum, XOR, product modulo a prime) and any semigroup operation (minimum, maximum, gcd) can be used in the same tree; what differs is only the neutral element for the unused leaves.'
      ]
    },
    statement: ['A row of `n` non-negative numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` asks for the XOR of the numbers at the positions `x` to `y`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '4 3\n5 3 6 1\n2 2 4\n1 3 0\n2 2 4\n', note: '3 ^ 6 ^ 1 = 4; after the change 3 ^ 0 ^ 1 = 2: 4 2.' }],
    hints: ['XOR is associative with the neutral element 0.', 'Store the XOR of each block.', 'A question XORs the blocks that make up the range.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      python: r`
        size = 1
        while size < n:
            size *= 2
        tree = [0] * (2 * size)
        for i in range(n):
            tree[size + i] = a[i]
        for v in range(size - 1, 0, -1):
            tree[v] = tree[2 * v] ^ tree[2 * v + 1]
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                tree[v] = y
                v //= 2
                while v:
                    tree[v] = tree[2 * v] ^ tree[2 * v + 1]
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                res = 0
                while lo < hi:
                    if lo & 1:
                        res ^= tree[lo]
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        res ^= tree[hi]
                    lo //= 2
                    hi //= 2
                out.append(res)
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        vector<long long> tree(2 * size, 0);
        for (long long i = 0; i < n; i++) tree[size + i] = a[i];
        for (long long v = size - 1; v >= 1; v--) tree[v] = tree[2 * v] ^ tree[2 * v + 1];
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                tree[v] = y;
                for (v /= 2; v >= 1; v /= 2) tree[v] = tree[2 * v] ^ tree[2 * v + 1];
            } else {
                long long lo = size + x - 1, hi = size + y, res = 0;
                while (lo < hi) {
                    if (lo & 1) res ^= tree[lo++];
                    if (hi & 1) res ^= tree[--hi];
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(res);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long[] tree = new long[2 * size];
        for (int i = 0; i < n; i++) tree[size + i] = a[i];
        for (int v = size - 1; v >= 1; v--) tree[v] = tree[2 * v] ^ tree[2 * v + 1];
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                tree[v] = y;
                for (v /= 2; v >= 1; v /= 2) tree[v] = tree[2 * v] ^ tree[2 * v + 1];
            } else {
                int lo = size + x - 1, hi = size + (int) y;
                long res = 0;
                while (lo < hi) {
                    if ((lo & 1) == 1) res ^= tree[lo++];
                    if ((hi & 1) == 1) res ^= tree[--hi];
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(res);
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['Every node stores the XOR of its block; a change recomputes the parents of a leaf and a question XORs the O(log n) blocks of the range.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const seg = new Seg(a, (x, y) => x ^ y, 0); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) seg.set(x - 1, y); else out.push(seg.query(x - 1, y - 1)); } return out.join(' ');
    },
    tests() {
      const g = rng(4106); const out = ['4 3\n5 3 6 1\n2 2 4\n1 3 0\n2 2 4\n', '1 3\n9\n2 1 1\n1 1 4\n2 1 1\n'];
      const make = (n, q, hi) => { const a = randArray(g, n, 0, hi); const ops = makeOps(g, n, q, 2, () => randInt(g, 0, hi)); ops.push([2, 1, n]); return inputOf(n, a, ops); };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { let v = 0; for (let i = x - 1; i < y; i++) v ^= a[i]; out.push(v); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1073741823], [30000, 29999, 1073741823], [30000, 29999, 1073741823], [30000, 29999, 7], [29999, 29999, 1073741823]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print the sum of the two smallest numbers among the cells `x` to `y` (here `x < y`).'],
    constraints: ['2 <= n <= 30000, 1 <= q <= 30000', '|each number| <= 10^9', 'For a question 1 <= x < y <= n.'],
    slug: 'sum-of-the-two-smallest-in-a-range',
    title: 'The Sum of the Two Smallest Numbers in a Range',
    tags: ['segment-tree', 'merge-nodes', 'point-update', 'queries'],
    concept: {
      title: 'A node stores its two smallest numbers; merging two nodes keeps the two smallest of the four',
      body: [
        'A row of numbers changes one cell at a time. A question gives a range of **at least two** cells and asks for the **sum of the two smallest numbers** in it (two cells, so equal values count twice). For `4 1 7 1 9` the two smallest of the cells 1 to 5 are 1 and 1, with the sum 2; of the cells 1 to 3 they are 1 and 4, with the sum 5. Sorting the range for each question costs O(n log n).',
        'The tree needs a merge rule for a pair `(m1, m2)`, the smallest and the second smallest value of the block (use infinity if the block has only one cell). To merge two blocks, take the four numbers `m1, m2, m1\', m2\'` and keep the two smallest. The neutral node is `(inf, inf)`. A leaf is `(value, inf)`. Because the "two smallest of the union" does not depend on how the blocks are grouped, the rule is associative, and the usual tree loops work.',
        { code: 'def merge(p, q):                       # p and q are pairs (smallest, second smallest)\n    a, b = p\n    c, d = q\n    if c < a: a, b, c, d = c, d, a, b # now a is the smaller first element\n    # the two smallest are a and min(b, c)\n    return (a, min(b, c))\n\nanswer = res[0] + res[1]' },
        'After the swap the first number of the result is `a` (the global minimum) and the second is the smaller of `b` (the second of the same block) and `c` (the minimum of the other block): `d` can never be among the two smallest. Each merge is a few comparisons, so the cost is O(log n) per operation. The same pair idea gives the second maximum and the "smallest and its count" nodes.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` (with `x < y`) asks for the sum of the two smallest numbers among the positions `x` to `y` (two different cells; equal values both count). Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '5 3\n4 1 7 1 9\n2 1 5\n2 1 3\n1 4 6\n', note: 'The two smallest of the whole row are 1 and 1: 2. Of the cells 1..3 they are 1 and 4: 5. The output is 2 5.' }],
    hints: ['Store (smallest, second smallest) in each node.', 'Merging two nodes: the smallest of the four values and the next smallest.', 'The neutral node holds two infinities.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      helpers: {
        python: r`
          def two_smallest(a, b, c, d):
              if c < a:
                  a, b, c, d = c, d, a, b
              return a, min(b, c)`,
        cpp: r`
          pair<long long, long long> twoSmallest(long long a, long long b, long long c, long long d) {
              if (c < a) {
                  swap(a, c);
                  swap(b, d);
              }
              return make_pair(a, min(b, c));
          }`,
        java: r`
          static long[] twoSmallest(long a, long b, long c, long d) {
              if (c < a) {
                  long t = a;
                  a = c;
                  c = t;
                  t = b;
                  b = d;
                  d = t;
              }
              return new long[] {a, Math.min(b, c)};
          }`
      },
      python: r`
        size = 1
        while size < n:
            size *= 2
        inf = 1 << 62
        m1 = [inf] * (2 * size)
        m2 = [inf] * (2 * size)
        for i in range(n):
            m1[size + i] = a[i]
        for v in range(size - 1, 0, -1):
            m1[v], m2[v] = two_smallest(m1[2 * v], m2[2 * v], m1[2 * v + 1], m2[2 * v + 1])
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                m1[v] = y
                v //= 2
                while v:
                    m1[v], m2[v] = two_smallest(m1[2 * v], m2[2 * v], m1[2 * v + 1], m2[2 * v + 1])
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                ra, rb = inf, inf
                while lo < hi:
                    if lo & 1:
                        ra, rb = two_smallest(ra, rb, m1[lo], m2[lo])
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        ra, rb = two_smallest(ra, rb, m1[hi], m2[hi])
                    lo //= 2
                    hi //= 2
                out.append(ra + rb)
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        const long long INF = 1LL << 62;
        vector<long long> m1(2 * size, INF), m2(2 * size, INF);
        for (long long i = 0; i < n; i++) m1[size + i] = a[i];
        for (long long v = size - 1; v >= 1; v--) {
            pair<long long, long long> p = twoSmallest(m1[2 * v], m2[2 * v], m1[2 * v + 1], m2[2 * v + 1]);
            m1[v] = p.first;
            m2[v] = p.second;
        }
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                m1[v] = y;
                for (v /= 2; v >= 1; v /= 2) {
                    pair<long long, long long> p = twoSmallest(m1[2 * v], m2[2 * v], m1[2 * v + 1], m2[2 * v + 1]);
                    m1[v] = p.first;
                    m2[v] = p.second;
                }
            } else {
                long long lo = size + x - 1, hi = size + y;
                pair<long long, long long> res = make_pair(INF, INF);
                while (lo < hi) {
                    if (lo & 1) {
                        res = twoSmallest(res.first, res.second, m1[lo], m2[lo]);
                        lo++;
                    }
                    if (hi & 1) {
                        --hi;
                        res = twoSmallest(res.first, res.second, m1[hi], m2[hi]);
                    }
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(res.first + res.second);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long inf = 1L << 62;
        long[] m1 = new long[2 * size];
        long[] m2 = new long[2 * size];
        Arrays.fill(m1, inf);
        Arrays.fill(m2, inf);
        for (int i = 0; i < n; i++) m1[size + i] = a[i];
        for (int v = size - 1; v >= 1; v--) {
            long[] p = twoSmallest(m1[2 * v], m2[2 * v], m1[2 * v + 1], m2[2 * v + 1]);
            m1[v] = p[0];
            m2[v] = p[1];
        }
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                m1[v] = y;
                for (v /= 2; v >= 1; v /= 2) {
                    long[] p = twoSmallest(m1[2 * v], m2[2 * v], m1[2 * v + 1], m2[2 * v + 1]);
                    m1[v] = p[0];
                    m2[v] = p[1];
                }
            } else {
                int lo = size + x - 1, hi = size + (int) y;
                long ra = inf, rb = inf;
                while (lo < hi) {
                    if ((lo & 1) == 1) {
                        long[] p = twoSmallest(ra, rb, m1[lo], m2[lo]);
                        ra = p[0];
                        rb = p[1];
                        lo++;
                    }
                    if ((hi & 1) == 1) {
                        --hi;
                        long[] p = twoSmallest(ra, rb, m1[hi], m2[hi]);
                        ra = p[0];
                        rb = p[1];
                    }
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(ra + rb);
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>', '<utility>']
    },
    solution: { explanation: ['Each node keeps its smallest and second smallest value; merging two nodes keeps the two smallest of the four numbers, and a question merges the nodes covering the range.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const merge = (p, s) => { const all = [p[0], p[1], s[0], s[1]].sort((x, y) => x - y); return [all[0], all[1]]; }; const seg = new Seg(a.map((v) => [v, Infinity]), merge, [Infinity, Infinity]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) seg.set(x - 1, [y, Infinity]); else { const res = seg.query(x - 1, y - 1); out.push(res[0] + res[1]); } } return out.join(' ');
    },
    tests() {
      const g = rng(4107); const out = ['5 3\n4 1 7 1 9\n2 1 5\n2 1 3\n1 4 6\n', '2 2\n5 -5\n2 1 2\n1 1 0\n'];
      const make = (n, q, hi) => { const a = randArray(g, n, -hi, hi); const ops = many(q, () => { if (g() < 0.5) return [1, randInt(g, 1, n), randInt(g, -hi, hi)]; const x = randInt(g, 1, n - 1); return [2, x, randInt(g, x + 1, n)]; }); ops.push([2, 1, n]); return inputOf(n, a, ops); };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { const part = a.slice(x - 1, y).sort((u, v) => u - v); out.push(part[0] + part[1]); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 2, 10), randInt(g, 1, 12), 5), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000000], [30000, 29999, 1000000000], [30000, 29999, 1000000000], [30000, 29999, 4], [29999, 29999, 1000000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print the sign of the product of the cells `x` to `y`: 1, -1 or 0.'],
    constraints: ['1 <= n, q <= 30000', '|each number| <= 10^9', 'Cells are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'sign-of-a-product-with-changes',
    title: 'Is the Product of a Range Positive, Negative or Zero?',
    tags: ['segment-tree', 'sign', 'point-update', 'queries'],
    concept: {
      title: 'Only the sign of the product matters, and the sign of a product is the product of the signs',
      body: [
        'A row of non-zero or zero numbers changes one cell at a time. A question asks only whether the **product of the numbers from `x` to `y`** is positive, negative or zero. For `3 -2 0 5` the product of the cells 1 to 2 is negative, the product of the cells 1 to 3 is zero. The product itself could have up to 30000 factors of size 10^9, far too big to compute, but the question needs only the **sign**.',
        'Replace every number by its sign: `1` for a positive number, `-1` for a negative one and `0` for zero. The sign of a product is the **product of the signs**, and this is associative, with `1` as the neutral element. So the segment tree stores in each node the product of the signs of its block (an inner node is `left * right`), and the value is always one of `-1, 0, 1`. A change recomputes the leaf and its parents; a question multiplies the blocks of the range.',
        { code: 'def sign(v): return (v > 0) - (v < 0)\ntree[size + i] = sign(a[i]); unused leaves = 1\nfor v in range(size - 1, 0, -1): tree[v] = tree[2*v] * tree[2*v + 1]\n# a change sets sign(y) and recomputes the parents; a question multiplies the signs of the blocks' },
        'If any cell in the range is zero, a block that contains it has the sign 0, and every product that includes that block is 0, which is correct. Each operation costs O(log n). The same trick, "keep only the information the question needs", is the first step of designing a segment tree node.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` asks for the sign of the product of the numbers at the positions `x` to `y` (print 1 if it is positive, -1 if it is negative, 0 if it is zero). Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '4 4\n3 -2 0 5\n2 1 2\n2 1 3\n1 3 -7\n2 1 3\n', note: 'The product -6 is negative; with the zero it is 0; after the change 3 * -2 * -7 = 42 is positive: -1 0 1.' }],
    hints: ['Replace each number by its sign.', 'The sign of a product is the product of the signs.', 'Use 1 as the neutral element for the unused leaves.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      python: r`
        size = 1
        while size < n:
            size *= 2
        tree = [1] * (2 * size)
        for i in range(n):
            tree[size + i] = (a[i] > 0) - (a[i] < 0)
        for v in range(size - 1, 0, -1):
            tree[v] = tree[2 * v] * tree[2 * v + 1]
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                tree[v] = (y > 0) - (y < 0)
                v //= 2
                while v:
                    tree[v] = tree[2 * v] * tree[2 * v + 1]
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                res = 1
                while lo < hi:
                    if lo & 1:
                        res *= tree[lo]
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        res *= tree[hi]
                    lo //= 2
                    hi //= 2
                out.append(res)
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        vector<long long> tree(2 * size, 1);
        for (long long i = 0; i < n; i++) tree[size + i] = (a[i] > 0) - (a[i] < 0);
        for (long long v = size - 1; v >= 1; v--) tree[v] = tree[2 * v] * tree[2 * v + 1];
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                tree[v] = (y > 0) - (y < 0);
                for (v /= 2; v >= 1; v /= 2) tree[v] = tree[2 * v] * tree[2 * v + 1];
            } else {
                long long lo = size + x - 1, hi = size + y, res = 1;
                while (lo < hi) {
                    if (lo & 1) res *= tree[lo++];
                    if (hi & 1) res *= tree[--hi];
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(res);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long[] tree = new long[2 * size];
        Arrays.fill(tree, 1);
        for (int i = 0; i < n; i++) tree[size + i] = Long.signum(a[i]);
        for (int v = size - 1; v >= 1; v--) tree[v] = tree[2 * v] * tree[2 * v + 1];
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                tree[v] = Long.signum(y);
                for (v /= 2; v >= 1; v /= 2) tree[v] = tree[2 * v] * tree[2 * v + 1];
            } else {
                int lo = size + x - 1, hi = size + (int) y;
                long res = 1;
                while (lo < hi) {
                    if ((lo & 1) == 1) res *= tree[lo++];
                    if ((hi & 1) == 1) res *= tree[--hi];
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(res);
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['Every number is replaced by its sign; a segment tree of products of signs gives the sign of the product of any range, with a change recomputing the parents of a leaf.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const sg = (v) => Math.sign(v); const seg = new Seg(a.map(sg), (x, y) => x * y, 1); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) seg.set(x - 1, sg(y)); else out.push(seg.query(x - 1, y - 1) + 0); } return out.join(' ');
    },
    tests() {
      const g = rng(4108); const out = ['4 4\n3 -2 0 5\n2 1 2\n2 1 3\n1 3 -7\n2 1 3\n', '1 3\n0\n2 1 1\n1 1 -2\n2 1 1\n'];
      const val = (hi, pZero) => (g() < pZero ? 0 : randInt(g, -hi, hi) || 1);
      const make = (n, q, hi, pZero) => { const a = many(n, () => val(hi, pZero)); const ops = makeOps(g, n, q, 2, () => val(hi, pZero)); ops.push([2, 1, n]); return inputOf(n, a, ops); };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { let s = 1; for (let i = x - 1; i < y; i++) s *= Math.sign(a[i]); out.push(s + 0); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 5, 0.2), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi, pz] of [[10, 10, 100, 0.1], [100, 100, 1000, 0.05], [1000, 1000, 1000000000, 0.01], [30000, 29999, 1000000000, 0], [30000, 29999, 1000000000, 0.0005], [30000, 29999, 3, 0.2], [29999, 29999, 1000000000, 0.00002]]) out.push(make(n, q, hi, pz));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print the position of the leftmost smallest number among the cells `x` to `y`.'],
    constraints: ['1 <= n, q <= 30000', '|each number| <= 10^9', 'Cells are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'leftmost-smallest-in-a-range',
    title: 'Where Is the Leftmost Smallest Number of a Range?',
    tags: ['segment-tree', 'argmin', 'tie-breaking', 'point-update'],
    concept: {
      title: 'Pack the value and the position into one key, so that the minimum of the keys is the leftmost smallest cell',
      body: [
        'A row of numbers changes one cell at a time, and a question asks for the **position of the smallest number** in a range; if several cells hold the smallest value, the answer is the **leftmost** of them. For `4 2 9 2 7` the smallest in the cells 1 to 5 is 2, and the leftmost cell with 2 is the cell 2.',
        'A tree can store pairs `(value, position)` and merge them by comparing the value first and the position second. A neater way is to **pack the pair into one number**: `key = (value + OFFSET) * 32768 + position`, where `OFFSET` makes every value non-negative and 32768 is larger than any position. Comparing two keys compares first the values and then the positions, exactly the order we need, so the **minimum key** belongs to the leftmost smallest cell. Then the tree is the plain minimum tree, and the answer is read from the key: `position = key % 32768`.',
        { code: 'OFFSET = 10**9\ndef key(value, pos): return (value + OFFSET) * 32768 + pos   # pos counted from 0\n\ntree = plain minimum tree over key(a[i], i)\n# change of the cell i:  set the leaf to key(y, i)\n# question:              best = minimum key over the blocks;  print(best % 32768 + 1)' },
        'The pair (value, position) is made unique by the position, so there are no ties between keys. The packing is a standard trick that avoids writing a special merge function. The largest key is about `2 * 10^9 * 32768 = 6.6 * 10^13`, which fits in 64 bits. The cost is O(log n) per operation.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` asks for the position of the smallest number among the positions `x` to `y` (if the smallest value occurs several times, print the leftmost position). Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '5 3\n4 2 9 2 7\n2 1 5\n2 3 5\n1 2 8\n', note: 'The smallest 2 is first at the position 2. In the cells 3..5 the smallest 2 is at the position 4: 2 4.' }],
    hints: ['Pack the value and the position into one number: value first, position second.', 'Use the ordinary minimum tree over the packed keys.', 'Decode the position from the minimum key.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      python: r`
        size = 1
        while size < n:
            size *= 2
        inf = 1 << 62
        tree = [inf] * (2 * size)
        for i in range(n):
            tree[size + i] = (a[i] + 1000000000) * 32768 + i
        for v in range(size - 1, 0, -1):
            tree[v] = min(tree[2 * v], tree[2 * v + 1])
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                tree[v] = (y + 1000000000) * 32768 + (x - 1)
                v //= 2
                while v:
                    tree[v] = min(tree[2 * v], tree[2 * v + 1])
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                res = inf
                while lo < hi:
                    if lo & 1:
                        res = min(res, tree[lo])
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        res = min(res, tree[hi])
                    lo //= 2
                    hi //= 2
                out.append(res % 32768 + 1)
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        const long long INF = 1LL << 62;
        vector<long long> tree(2 * size, INF);
        for (long long i = 0; i < n; i++) tree[size + i] = (a[i] + 1000000000LL) * 32768LL + i;
        for (long long v = size - 1; v >= 1; v--) tree[v] = min(tree[2 * v], tree[2 * v + 1]);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                tree[v] = (y + 1000000000LL) * 32768LL + (x - 1);
                for (v /= 2; v >= 1; v /= 2) tree[v] = min(tree[2 * v], tree[2 * v + 1]);
            } else {
                long long lo = size + x - 1, hi = size + y, res = INF;
                while (lo < hi) {
                    if (lo & 1) res = min(res, tree[lo++]);
                    if (hi & 1) res = min(res, tree[--hi]);
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(res % 32768 + 1);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long inf = 1L << 62;
        long[] tree = new long[2 * size];
        Arrays.fill(tree, inf);
        for (int i = 0; i < n; i++) tree[size + i] = (a[i] + 1000000000L) * 32768L + i;
        for (int v = size - 1; v >= 1; v--) tree[v] = Math.min(tree[2 * v], tree[2 * v + 1]);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                tree[v] = (y + 1000000000L) * 32768L + (x - 1);
                for (v /= 2; v >= 1; v /= 2) tree[v] = Math.min(tree[2 * v], tree[2 * v + 1]);
            } else {
                int lo = size + x - 1, hi = size + (int) y;
                long res = inf;
                while (lo < hi) {
                    if ((lo & 1) == 1) res = Math.min(res, tree[lo++]);
                    if ((hi & 1) == 1) res = Math.min(res, tree[--hi]);
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(res % 32768L + 1);
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['Every cell becomes the key (value + offset) * 32768 + position; the minimum key over a range belongs to the leftmost smallest cell, and its position is read as key mod 32768.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const better = (p, s) => (p[0] < s[0] || (p[0] === s[0] && p[1] < s[1]) ? p : s); const seg = new Seg(a.map((v, i) => [v, i]), better, [Infinity, Infinity]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) seg.set(x - 1, [y, x - 1]); else out.push(seg.query(x - 1, y - 1)[1] + 1); } return out.join(' ');
    },
    tests() {
      const g = rng(4109); const out = ['5 3\n4 2 9 2 7\n2 1 5\n2 3 5\n1 2 8\n', '1 2\n5\n2 1 1\n1 1 3\n'];
      const make = (n, q, hi) => { const a = randArray(g, n, -hi, hi); const ops = makeOps(g, n, q, 2, () => randInt(g, -hi, hi)); ops.push([2, 1, n]); return inputOf(n, a, ops); };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { let best = x - 1; for (let i = x - 1; i < y; i++) if (a[i] < a[best]) best = i; out.push(best + 1); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 4), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000000], [30000, 29999, 1000000000], [30000, 29999, 1000000000], [30000, 29999, 3], [29999, 29999, 1000000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print how many cells from `x` to `y` are equal to the largest value in that range.'],
    constraints: ['1 <= n, q <= 30000', '|each number| <= 10^9', 'Cells are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'how-many-equal-the-largest',
    title: 'How Many Cells Equal the Largest Number of the Range?',
    tags: ['segment-tree', 'merge-nodes', 'counting', 'point-update'],
    concept: {
      title: 'A node stores the maximum of its block and how many times it occurs; merging adds the counts when the maxima are equal',
      body: [
        'A row of numbers changes one cell at a time, and a question asks: **how many cells in the range `x..y` hold the largest value of that range?** For `3 7 7 2 7` the largest value of the whole row is 7 and it occurs 3 times; in the cells 1 to 4 it occurs 2 times. Looking up the maximum first and counting afterwards needs two passes over the range.',
        'Store in every node the pair `(maximum, count)`: the largest value in the block and the number of cells that have it. A leaf is `(value, 1)`. To **merge** two nodes `(m1, c1)` and `(m2, c2)`: if `m1 > m2` the result is `(m1, c1)`; if `m2 > m1` it is `(m2, c2)`; if they are **equal** the result is `(m1, c1 + c2)`. The neutral node is `(-infinity, 0)`. The merge is associative, so the usual tree works.',
        { code: 'def merge(p, q):\n    if p[0] > q[0]: return p\n    if q[0] > p[0]: return q\n    return (p[0], p[1] + q[1])            # equal maxima: the counts add up\n\nNEUTRAL = (-INF, 0)\n# a change sets the leaf (y, 1) and recomputes the parents; a question merges the blocks of the range' },
        'The same shape of node answers "the minimum and how many times", "the greatest value and the sum of its positions", and many other combined questions in one pass. Each operation costs O(log n).'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` asks how many numbers among the positions `x` to `y` are equal to the largest number among those positions. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '5 3\n3 7 7 2 7\n2 1 5\n2 1 4\n1 2 9\n', note: 'The maximum 7 occurs three times in the whole row and twice in the cells 1..4: 3 2.' }],
    hints: ['Store (maximum, count) in every node.', 'When two maxima are equal, add the counts.', 'The neutral node is (-infinity, 0).'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      python: r`
        size = 1
        while size < n:
            size *= 2
        low = -(1 << 62)
        tm = [low] * (2 * size)
        tc = [0] * (2 * size)
        for i in range(n):
            tm[size + i] = a[i]
            tc[size + i] = 1
        for v in range(size - 1, 0, -1):
            l, rr = 2 * v, 2 * v + 1
            if tm[l] > tm[rr]:
                tm[v], tc[v] = tm[l], tc[l]
            elif tm[rr] > tm[l]:
                tm[v], tc[v] = tm[rr], tc[rr]
            else:
                tm[v], tc[v] = tm[l], tc[l] + tc[rr]
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                tm[v] = y
                tc[v] = 1
                v //= 2
                while v:
                    l, rr = 2 * v, 2 * v + 1
                    if tm[l] > tm[rr]:
                        tm[v], tc[v] = tm[l], tc[l]
                    elif tm[rr] > tm[l]:
                        tm[v], tc[v] = tm[rr], tc[rr]
                    else:
                        tm[v], tc[v] = tm[l], tc[l] + tc[rr]
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                best = low
                cnt = 0
                while lo < hi:
                    nodes = []
                    if lo & 1:
                        nodes.append(lo)
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        nodes.append(hi)
                    for nd in nodes:
                        if tm[nd] > best:
                            best, cnt = tm[nd], tc[nd]
                        elif tm[nd] == best:
                            cnt += tc[nd]
                    lo //= 2
                    hi //= 2
                out.append(cnt)
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        const long long LOW = -(1LL << 62);
        vector<long long> tm(2 * size, LOW), tc(2 * size, 0);
        for (long long i = 0; i < n; i++) {
            tm[size + i] = a[i];
            tc[size + i] = 1;
        }
        auto pull = [&](long long v) {
            long long l = 2 * v, rr = 2 * v + 1;
            if (tm[l] > tm[rr]) {
                tm[v] = tm[l];
                tc[v] = tc[l];
            } else if (tm[rr] > tm[l]) {
                tm[v] = tm[rr];
                tc[v] = tc[rr];
            } else {
                tm[v] = tm[l];
                tc[v] = tc[l] + tc[rr];
            }
        };
        for (long long v = size - 1; v >= 1; v--) pull(v);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                tm[v] = y;
                tc[v] = 1;
                for (v /= 2; v >= 1; v /= 2) pull(v);
            } else {
                long long lo = size + x - 1, hi = size + y, best = LOW, cnt = 0;
                auto take = [&](long long nd) {
                    if (tm[nd] > best) {
                        best = tm[nd];
                        cnt = tc[nd];
                    } else if (tm[nd] == best) {
                        cnt += tc[nd];
                    }
                };
                while (lo < hi) {
                    if (lo & 1) take(lo++);
                    if (hi & 1) take(--hi);
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(cnt);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long low = -(1L << 62);
        long[] tm = new long[2 * size];
        long[] tc = new long[2 * size];
        Arrays.fill(tm, low);
        for (int i = 0; i < n; i++) {
            tm[size + i] = a[i];
            tc[size + i] = 1;
        }
        for (int v = size - 1; v >= 1; v--) {
            int l = 2 * v, rr = 2 * v + 1;
            if (tm[l] > tm[rr]) {
                tm[v] = tm[l];
                tc[v] = tc[l];
            } else if (tm[rr] > tm[l]) {
                tm[v] = tm[rr];
                tc[v] = tc[rr];
            } else {
                tm[v] = tm[l];
                tc[v] = tc[l] + tc[rr];
            }
        }
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                tm[v] = y;
                tc[v] = 1;
                for (v /= 2; v >= 1; v /= 2) {
                    int l = 2 * v, rr = 2 * v + 1;
                    if (tm[l] > tm[rr]) {
                        tm[v] = tm[l];
                        tc[v] = tc[l];
                    } else if (tm[rr] > tm[l]) {
                        tm[v] = tm[rr];
                        tc[v] = tc[rr];
                    } else {
                        tm[v] = tm[l];
                        tc[v] = tc[l] + tc[rr];
                    }
                }
            } else {
                int lo = size + x - 1, hi = size + (int) y;
                long best = low, cnt = 0;
                while (lo < hi) {
                    for (int side = 0; side < 2; side++) {
                        int nd = -1;
                        if (side == 0 && (lo & 1) == 1) nd = lo++;
                        else if (side == 1 && (hi & 1) == 1) nd = --hi;
                        if (nd < 0) continue;
                        if (tm[nd] > best) {
                            best = tm[nd];
                            cnt = tc[nd];
                        } else if (tm[nd] == best) {
                            cnt += tc[nd];
                        }
                    }
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(cnt);
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['Each node stores the maximum of its block and how many cells have it; merging keeps the larger maximum or adds the counts when the maxima are equal, and a question merges the nodes covering the range.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const merge = (p, s) => (p[0] > s[0] ? p : s[0] > p[0] ? s : [p[0], p[1] + s[1]]); const seg = new Seg(a.map((v) => [v, 1]), merge, [-Infinity, 0]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) seg.set(x - 1, [y, 1]); else out.push(seg.query(x - 1, y - 1)[1]); } return out.join(' ');
    },
    tests() {
      const g = rng(4110); const out = ['5 3\n3 7 7 2 7\n2 1 5\n2 1 4\n1 2 9\n', '1 2\n5\n2 1 1\n1 1 3\n'];
      const make = (n, q, hi) => { const a = randArray(g, n, -hi, hi); const ops = makeOps(g, n, q, 2, () => randInt(g, -hi, hi)); ops.push([2, 1, n]); return inputOf(n, a, ops); };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { const part = a.slice(x - 1, y); const mx = Math.max(...part); out.push(part.filter((v) => v === mx).length); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 3), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000000], [30000, 29999, 1000000000], [30000, 29999, 4], [30000, 29999, 1], [29999, 29999, 1000000000]]) out.push(make(n, q, hi));
      return out;
    }
  }
];
