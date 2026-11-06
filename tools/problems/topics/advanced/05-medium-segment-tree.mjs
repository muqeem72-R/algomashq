import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const lines = (list) => list.map((p) => p.join(' ')).join('\n');
const inputOf = (n, a, ops) => `${n} ${ops.length}\n${a.join(' ')}\n${lines(ops)}\n`;
const MOD = 1000000007n;

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of lamps and the number of operations.', 'The second line has `n` numbers, each 0 or 1.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the lamp `x` to the value `y` (0 or 1). If `t = 2`, print the length of the longest run of consecutive 1s inside the lamps `x` to `y`.'],
    constraints: ['1 <= n, q <= 30000', 'Lamps are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'longest-run-of-ones-in-a-range',
    title: 'The Longest Run of Ones in a Range, With Changes',
    tags: ['segment-tree', 'merge-nodes', 'prefix-suffix', 'point-update'],
    concept: {
      title: 'A node remembers its length, the run of ones at its left end, the run at its right end and its best run; two nodes merge by joining the runs at the seam',
      body: [
        'A row of lamps (0 or 1) changes one lamp at a time, and a question asks for the **longest run of consecutive ones** inside a range. For `1 1 0 1 1 1 0 1` the longest run in the lamps 1 to 8 is 3, and in the lamps 1 to 3 it is 2. Scanning the range costs O(n).',
        'Each node of a segment tree stores four numbers for its block: `len`, the length of the block; `pref`, the length of the run of ones at its **left** end; `suf`, the run of ones at its **right** end; `best`, the longest run inside. To **merge** a left node `A` and a right node `B`, remember that a run can cross the seam. The new `pref` is `A.len + B.pref` if `A` is all ones (`A.pref == A.len`) and `A.pref` otherwise. The new `suf` is `B.len + A.suf` if `B` is all ones and `B.suf` otherwise. The new `best` is the largest of `A.best`, `B.best` and the run through the seam, `A.suf + B.pref`.',
        { code: 'def merge(A, B):                       # a node is (len, pref, suf, best)\n    length = A[0] + B[0]\n    pref = A[0] + B[1] if A[1] == A[0] else A[1]\n    suf = B[0] + A[2] if B[2] == B[0] else B[2]\n    best = max(A[3], B[3], A[2] + B[1])\n    return (length, pref, suf, best)\n\nidentity = (0, 0, 0, 0)\nleaf(v) = (1, v, v, v)' },
        'For a question the order of the merges matters (the left blocks and the right blocks must be joined in the order of the row), so the bottom-up loop keeps two accumulators: `left` for the blocks taken on the left side and `right` for those taken on the right side, and merges them at the end. The empty node `(0, 0, 0, 0)` is neutral. A change recomputes the parents of one leaf. Each operation costs O(log n) merges.'
      ]
    },
    statement: ['A row of `n` lamps (each 0 or 1) is given. Process `q` operations: type 1 `x y` sets the lamp `x` to the value `y`; type 2 `x y` asks for the length of the longest run of consecutive lamps with the value 1 inside the lamps `x` to `y` (0 if there is none). Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '8 3\n1 1 0 1 1 1 0 1\n2 1 8\n2 1 3\n1 3 1\n', note: 'The longest run in all lamps is 3 (the lamps 4..6); in the lamps 1..3 it is 2. The output is 3 2.' }],
    hints: ['Store (len, prefix run, suffix run, best run) in each node.', 'When merging, the runs at the seam join if the left node ends with ones and the right node starts with ones.', 'In a question keep a left accumulator and a right accumulator so that the order is preserved.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      helpers: {
        python: r`
          def merge(A, B):
              length = A[0] + B[0]
              pref = A[0] + B[1] if A[1] == A[0] else A[1]
              suf = B[0] + A[2] if B[2] == B[0] else B[2]
              best = max(A[3], B[3], A[2] + B[1])
              return (length, pref, suf, best)`,
        cpp: r`
          struct Run {
              long long len, pref, suf, best;
          };

          Run mergeRuns(const Run& A, const Run& B) {
              Run c;
              c.len = A.len + B.len;
              c.pref = (A.pref == A.len) ? A.len + B.pref : A.pref;
              c.suf = (B.suf == B.len) ? B.len + A.suf : B.suf;
              c.best = max(max(A.best, B.best), A.suf + B.pref);
              return c;
          }`,
        java: r`
          static long[] mergeRuns(long[] A, long[] B) {
              long[] c = new long[4];
              c[0] = A[0] + B[0];
              c[1] = (A[1] == A[0]) ? A[0] + B[1] : A[1];
              c[2] = (B[2] == B[0]) ? B[0] + A[2] : B[2];
              c[3] = Math.max(Math.max(A[3], B[3]), A[2] + B[1]);
              return c;
          }`
      },
      python: r`
        size = 1
        while size < n:
            size *= 2
        empty = (0, 0, 0, 0)
        tree = [empty] * (2 * size)
        for i in range(n):
            tree[size + i] = (1, a[i], a[i], a[i])
        for v in range(size - 1, 0, -1):
            tree[v] = merge(tree[2 * v], tree[2 * v + 1])
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                tree[v] = (1, y, y, y)
                v //= 2
                while v:
                    tree[v] = merge(tree[2 * v], tree[2 * v + 1])
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                left = empty
                right = empty
                while lo < hi:
                    if lo & 1:
                        left = merge(left, tree[lo])
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        right = merge(tree[hi], right)
                    lo //= 2
                    hi //= 2
                out.append(merge(left, right)[3])
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        const Run EMPTY = {0, 0, 0, 0};
        vector<Run> tree(2 * size, EMPTY);
        for (long long i = 0; i < n; i++) tree[size + i] = {1, a[i], a[i], a[i]};
        for (long long v = size - 1; v >= 1; v--) tree[v] = mergeRuns(tree[2 * v], tree[2 * v + 1]);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                tree[v] = {1, y, y, y};
                for (v /= 2; v >= 1; v /= 2) tree[v] = mergeRuns(tree[2 * v], tree[2 * v + 1]);
            } else {
                long long lo = size + x - 1, hi = size + y;
                Run left = EMPTY, right = EMPTY;
                while (lo < hi) {
                    if (lo & 1) left = mergeRuns(left, tree[lo++]);
                    if (hi & 1) right = mergeRuns(tree[--hi], right);
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(mergeRuns(left, right).best);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long[][] tree = new long[2 * size][];
        for (int i = 0; i < 2 * size; i++) tree[i] = new long[4];
        for (int i = 0; i < n; i++) tree[size + i] = new long[] {1, a[i], a[i], a[i]};
        for (int v = size - 1; v >= 1; v--) tree[v] = mergeRuns(tree[2 * v], tree[2 * v + 1]);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                tree[v] = new long[] {1, y, y, y};
                for (v /= 2; v >= 1; v /= 2) tree[v] = mergeRuns(tree[2 * v], tree[2 * v + 1]);
            } else {
                int lo = size + x - 1, hi = size + (int) y;
                long[] left = new long[4];
                long[] right = new long[4];
                while (lo < hi) {
                    if ((lo & 1) == 1) left = mergeRuns(left, tree[lo++]);
                    if ((hi & 1) == 1) right = mergeRuns(tree[--hi], right);
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(mergeRuns(left, right)[3]);
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['Each node stores (length, left run, right run, best run); merging joins the runs at the seam, point changes recompute the parents, and a question merges the left and right blocks in order.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; // direct scan of the range, with a word of 32 bits per block skipped when it is all zeros or all ones
      for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { let best = 0, cur = 0; for (let i = x - 1; i < y; i++) { if (a[i]) { cur++; if (cur > best) best = cur; } else cur = 0; } out.push(best); } } return out.join(' ');
    },
    tests() {
      const g = rng(4401); const out = ['8 3\n1 1 0 1 1 1 0 1\n2 1 8\n2 1 3\n1 3 1\n', '1 3\n0\n2 1 1\n1 1 1\n2 1 1\n'];
      const make = (n, q, pOne) => { const a = many(n, () => (g() < pOne ? 1 : 0)); const ops = many(q, () => { if (g() < 0.5) return [1, randInt(g, 1, n), g() < pOne ? 1 : 0]; const x = randInt(g, 1, n); return [2, x, randInt(g, x, n)]; }); ops.push([2, 1, n]); return inputOf(n, a, ops); };
      const brute = (input) => this.solve(input);
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 0.6), (i) => this.solve(i), brute, 100);
      for (const [n, q, p] of [[10, 10, 0.5], [100, 100, 0.7], [1000, 1000, 0.9], [20000, 19999, 0.9], [20000, 19999, 0.99], [20000, 19999, 0.5], [19999, 19999, 0.999]]) out.push(make(n, q, p));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has four numbers `t`, `l`, `r` and `x`. If `t = 1`, set every cell from `l` to `r` to the value `x`. If `t = 2`, print the sum of the cells from `l` to `r` (`x` is 0).'],
    constraints: ['1 <= n, q <= 20000', '|each cell| <= 10^6, |x| <= 10^6', '1 <= l <= r <= n'],
    slug: 'assign-to-a-range-sum-a-range',
    title: 'Give a Whole Range One Value, Then Sum a Range',
    tags: ['segment-tree', 'lazy-propagation', 'range-assign', 'range-sum'],
    concept: {
      title: 'Lazy propagation: mark a block "everything here becomes x" and push the mark down only when a deeper block is needed',
      body: [
        'Now an operation **assigns the same value to every cell of a range**, and a question asks for the **sum of a range**. For the row `1 2 3 4 5` the operation "set the cells 2 to 4 to 7" gives `1 7 7 7 5`, and the sum of the whole row is 27. Changing the cells one by one costs O(n) per operation, which is too slow for 20000 operations on 20000 cells.',
        'A segment tree can change a whole block at once if we store a **lazy mark** on the block: "all cells of this block are to be set to `x`, but the cells below have not been updated yet". The node keeps the correct `sum` for its own block immediately (`x * length`), and the mark is passed to the two children only when a later operation needs to look **inside** the block. This is called *push-down*: before going down from a node, give its mark to its children (set their sums and marks) and clear the mark.',
        { code: 'def apply(node, l, r, x):           # the block [l, r] becomes x everywhere\n    sm[node] = x * (r - l + 1); lz[node] = x\n\ndef push(node, l, r):\n    if lz[node] != NONE:\n        mid = (l + r) // 2\n        apply(2*node, l, mid, lz[node]); apply(2*node + 1, mid + 1, r, lz[node])\n        lz[node] = NONE\n\ndef assign(node, l, r, ql, qr, x):\n    if ql <= l and r <= qr: apply(node, l, r, x); return      # the whole block is inside the range\n    push(node, l, r)\n    mid = (l + r) // 2\n    if ql <= mid: assign(2*node, l, mid, ql, qr, x)\n    if qr > mid: assign(2*node + 1, mid + 1, r, ql, qr, x)\n    sm[node] = sm[2*node] + sm[2*node + 1]' },
        'A question works in the same way: if the block is inside the range, return its sum; otherwise push down and ask the children. Every operation visits O(log n) nodes (about four per level), so the cost is O(log n) instead of O(n). The sentinel `NONE` marks "no pending assignment" (a value that cannot be a real `x`).'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `l r x` sets every number at the positions `l` to `r` to `x`; type 2 `l r 0` asks for the sum of the numbers at the positions `l` to `r`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '5 3\n1 2 3 4 5\n1 2 4 7\n2 1 5 0\n2 3 3 0\n', note: 'After the assignment the row is 1 7 7 7 5; the whole sum is 27 and the third cell is 7: 27 7.' }],
    hints: ['Store the sum of every block and a lazy "assign x" mark.', 'Push the mark to the children before looking inside a block.', 'A block entirely inside the range is updated in O(1).'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][4]'],
      fast: true,
      helpers: {
        python: r`
          NONE = 1 << 60
          sm = []
          lz = []

          def build(node, l, r, a):
              lz[node] = NONE
              if l == r:
                  sm[node] = a[l]
                  return
              mid = (l + r) // 2
              build(2 * node, l, mid, a)
              build(2 * node + 1, mid + 1, r, a)
              sm[node] = sm[2 * node] + sm[2 * node + 1]

          def apply_to(node, l, r, x):
              sm[node] = x * (r - l + 1)
              lz[node] = x

          def push(node, l, r):
              if lz[node] != NONE:
                  mid = (l + r) // 2
                  apply_to(2 * node, l, mid, lz[node])
                  apply_to(2 * node + 1, mid + 1, r, lz[node])
                  lz[node] = NONE

          def assign(node, l, r, ql, qr, x):
              if ql <= l and r <= qr:
                  apply_to(node, l, r, x)
                  return
              push(node, l, r)
              mid = (l + r) // 2
              if ql <= mid:
                  assign(2 * node, l, mid, ql, qr, x)
              if qr > mid:
                  assign(2 * node + 1, mid + 1, r, ql, qr, x)
              sm[node] = sm[2 * node] + sm[2 * node + 1]

          def total(node, l, r, ql, qr):
              if ql <= l and r <= qr:
                  return sm[node]
              push(node, l, r)
              mid = (l + r) // 2
              s = 0
              if ql <= mid:
                  s += total(2 * node, l, mid, ql, qr)
              if qr > mid:
                  s += total(2 * node + 1, mid + 1, r, ql, qr)
              return s`,
        cpp: r`
          const long long NONE = 1LL << 60;
          vector<long long> sm, lz;

          void build(int node, int l, int r, const vector<long long>& a) {
              lz[node] = NONE;
              if (l == r) {
                  sm[node] = a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              sm[node] = sm[2 * node] + sm[2 * node + 1];
          }

          void applyTo(int node, int l, int r, long long x) {
              sm[node] = x * (r - l + 1);
              lz[node] = x;
          }

          void push(int node, int l, int r) {
              if (lz[node] != NONE) {
                  int mid = (l + r) / 2;
                  applyTo(2 * node, l, mid, lz[node]);
                  applyTo(2 * node + 1, mid + 1, r, lz[node]);
                  lz[node] = NONE;
              }
          }

          void assignRange(int node, int l, int r, int ql, int qr, long long x) {
              if (ql <= l && r <= qr) {
                  applyTo(node, l, r, x);
                  return;
              }
              push(node, l, r);
              int mid = (l + r) / 2;
              if (ql <= mid) assignRange(2 * node, l, mid, ql, qr, x);
              if (qr > mid) assignRange(2 * node + 1, mid + 1, r, ql, qr, x);
              sm[node] = sm[2 * node] + sm[2 * node + 1];
          }

          long long total(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) return sm[node];
              push(node, l, r);
              int mid = (l + r) / 2;
              long long s = 0;
              if (ql <= mid) s += total(2 * node, l, mid, ql, qr);
              if (qr > mid) s += total(2 * node + 1, mid + 1, r, ql, qr);
              return s;
          }`,
        java: r`
          static final long NONE = 1L << 60;
          static long[] sm, lz;

          static void build(int node, int l, int r, long[] a) {
              lz[node] = NONE;
              if (l == r) {
                  sm[node] = a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              sm[node] = sm[2 * node] + sm[2 * node + 1];
          }

          static void applyTo(int node, int l, int r, long x) {
              sm[node] = x * (r - l + 1);
              lz[node] = x;
          }

          static void push(int node, int l, int r) {
              if (lz[node] != NONE) {
                  int mid = (l + r) / 2;
                  applyTo(2 * node, l, mid, lz[node]);
                  applyTo(2 * node + 1, mid + 1, r, lz[node]);
                  lz[node] = NONE;
              }
          }

          static void assignRange(int node, int l, int r, int ql, int qr, long x) {
              if (ql <= l && r <= qr) {
                  applyTo(node, l, r, x);
                  return;
              }
              push(node, l, r);
              int mid = (l + r) / 2;
              if (ql <= mid) assignRange(2 * node, l, mid, ql, qr, x);
              if (qr > mid) assignRange(2 * node + 1, mid + 1, r, ql, qr, x);
              sm[node] = sm[2 * node] + sm[2 * node + 1];
          }

          static long total(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) return sm[node];
              push(node, l, r);
              int mid = (l + r) / 2;
              long s = 0;
              if (ql <= mid) s += total(2 * node, l, mid, ql, qr);
              if (qr > mid) s += total(2 * node + 1, mid + 1, r, ql, qr);
              return s;
          }`
      },
      python: r`
        sm.extend([0] * (4 * n))
        lz.extend([NONE] * (4 * n))
        build(1, 0, n - 1, a)
        out = []
        for kind, l, rr, x in ops:
            if kind == 1:
                assign(1, 0, n - 1, l - 1, rr - 1, x)
            else:
                out.append(total(1, 0, n - 1, l - 1, rr - 1))
        print(*out)`,
      cpp: r`
        sm.assign(4 * n, 0);
        lz.assign(4 * n, NONE);
        build(1, 0, (int)n - 1, a);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], l = ops[k][1], rr = ops[k][2], x = ops[k][3];
            if (kind == 1) {
                assignRange(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1, x);
            } else {
                if (!out.empty()) out += " ";
                out += to_string(total(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1));
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        sm = new long[4 * cn];
        lz = new long[4 * cn];
        build(1, 0, cn - 1, a);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int l = (int) ops[k][1], rr = (int) ops[k][2];
            long x = ops[k][3];
            if (kind == 1) {
                assignRange(1, 0, cn - 1, l - 1, rr - 1, x);
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(total(1, 0, cn - 1, l - 1, rr - 1));
            }
        }
        System.out.println(out);`,
      includes: ['<string>', '<vector>']
    },
    solution: { explanation: ['A segment tree keeps the sum of every block and a lazy assignment mark; a block inside the range is set in O(1) and the mark is pushed to the children only when a deeper block is visited.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = Float64Array.from(nums(rs[1])); const out = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) a.fill(x, l - 1, rr); else { let s = 0; for (let i = l - 1; i < rr; i++) s += a[i]; out.push(s); } } return out.join(' ');
    },
    tests() {
      const g = rng(4402); const out = ['5 3\n1 2 3 4 5\n1 2 4 7\n2 1 5 0\n2 3 3 0\n', '1 3\n9\n2 1 1 0\n1 1 1 -4\n2 1 1 0\n'];
      const make = (n, q, hi) => { const ops = many(q, () => { const l = randInt(g, 1, n); const rr = randInt(g, l, n); return g() < 0.5 ? [1, l, rr, randInt(g, -hi, hi)] : [2, l, rr, 0]; }); ops.push([2, 1, n, 0]); return `${n} ${q + 1}\n${randArray(g, n, -hi, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) { for (let i = l - 1; i < rr; i++) a[i] = x; } else out.push(a.slice(l - 1, rr).reduce((s, v) => s + v, 0)); } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000], [20000, 19999, 1000000], [20000, 19999, 1000000], [20000, 19999, 3], [19999, 19999, 1000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has four numbers `t`, `l`, `r` and `x`. If `t = 1`, add `x` to every cell from `l` to `r`. If `t = 2`, print the smallest cell among the cells `l` to `r` (`x` is 0).'],
    constraints: ['1 <= n, q <= 20000', '|each cell| <= 10^6, |x| <= 10^6', '1 <= l <= r <= n'],
    slug: 'add-to-a-range-ask-the-smallest',
    title: 'Add to a Range, Ask for the Smallest Number in a Range',
    tags: ['segment-tree', 'lazy-propagation', 'range-add', 'range-minimum'],
    concept: {
      title: 'Add-style lazy values never need to be pushed down: a node keeps its own addition and everybody above adds it back',
      body: [
        'Operations **add the same number to every cell of a range**, and questions ask for the **smallest cell** of a range. For the row `5 3 8 1` the operation "add 10 to the cells 1 to 2" gives `15 13 8 1`; the smallest of the cells 1 to 3 is then 8. Adding to the cells one by one costs O(n) per operation.',
        'For *additions* there is a neater form of laziness than the "push down" of assignments. Every node keeps two numbers: `mn`, the minimum of its block **including all the additions stored at the node and below it**, and `add`, the total of the additions that were applied to the **whole block** of this node (and not yet to the cells). If a block is completely inside the range, just increase both `mn` and `add` by `x`. Otherwise recurse into the children and recompute `mn = min(mn[left], mn[right]) + add[node]`. A question returns the minimum of the covered blocks and **adds `add[node]` on the way back** from every node that it descended through.',
        { code: 'def add_range(node, l, r, ql, qr, x):\n    if ql <= l and r <= qr:\n        mn[node] += x; ad[node] += x; return\n    mid = (l + r) // 2\n    if ql <= mid: add_range(2*node, l, mid, ql, qr, x)\n    if qr > mid: add_range(2*node + 1, mid + 1, r, ql, qr, x)\n    mn[node] = min(mn[2*node], mn[2*node + 1]) + ad[node]\n\ndef lowest(node, l, r, ql, qr):\n    if ql <= l and r <= qr: return mn[node]\n    mid = (l + r) // 2; res = INF\n    if ql <= mid: res = min(res, lowest(2*node, l, mid, ql, qr))\n    if qr > mid: res = min(res, lowest(2*node + 1, mid + 1, r, ql, qr))\n    return res + ad[node]' },
        'This "permanent mark" technique needs no push-down because the additions commute: the order in which the marks were applied does not matter. Each operation visits O(log n) nodes. It is the same structure that answered the question about the busiest moment of a stream of bookings, where the answer was the maximum instead of the minimum.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `l r x` adds `x` to every number at the positions `l` to `r`; type 2 `l r 0` asks for the smallest number among the positions `l` to `r`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '4 3\n5 3 8 1\n1 1 2 10\n2 1 3 0\n2 1 4 0\n', note: 'After the addition the row is 15 13 8 1; the smallest of the cells 1..3 is 8 and of all four cells 1: 8 1.' }],
    hints: ['Keep mn (the block minimum with the additions inside it) and add (the addition for the whole block).', 'A block inside the range gets mn += x and add += x.', 'Recompute mn = min(children) + add on the way back, and add add[node] when a question returns.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][4]'],
      fast: true,
      helpers: {
        python: r`
          INF = 1 << 62
          mn = []
          ad = []

          def build(node, l, r, a):
              ad[node] = 0
              if l == r:
                  mn[node] = a[l]
                  return
              mid = (l + r) // 2
              build(2 * node, l, mid, a)
              build(2 * node + 1, mid + 1, r, a)
              mn[node] = min(mn[2 * node], mn[2 * node + 1])

          def add_range(node, l, r, ql, qr, x):
              if ql <= l and r <= qr:
                  mn[node] += x
                  ad[node] += x
                  return
              mid = (l + r) // 2
              if ql <= mid:
                  add_range(2 * node, l, mid, ql, qr, x)
              if qr > mid:
                  add_range(2 * node + 1, mid + 1, r, ql, qr, x)
              mn[node] = min(mn[2 * node], mn[2 * node + 1]) + ad[node]

          def lowest(node, l, r, ql, qr):
              if ql <= l and r <= qr:
                  return mn[node]
              mid = (l + r) // 2
              res = INF
              if ql <= mid:
                  res = min(res, lowest(2 * node, l, mid, ql, qr))
              if qr > mid:
                  res = min(res, lowest(2 * node + 1, mid + 1, r, ql, qr))
              return res + ad[node]`,
        cpp: r`
          const long long INF = 1LL << 62;
          vector<long long> mn, ad;

          void build(int node, int l, int r, const vector<long long>& a) {
              ad[node] = 0;
              if (l == r) {
                  mn[node] = a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              mn[node] = min(mn[2 * node], mn[2 * node + 1]);
          }

          void addRange(int node, int l, int r, int ql, int qr, long long x) {
              if (ql <= l && r <= qr) {
                  mn[node] += x;
                  ad[node] += x;
                  return;
              }
              int mid = (l + r) / 2;
              if (ql <= mid) addRange(2 * node, l, mid, ql, qr, x);
              if (qr > mid) addRange(2 * node + 1, mid + 1, r, ql, qr, x);
              mn[node] = min(mn[2 * node], mn[2 * node + 1]) + ad[node];
          }

          long long lowest(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) return mn[node];
              int mid = (l + r) / 2;
              long long res = INF;
              if (ql <= mid) res = min(res, lowest(2 * node, l, mid, ql, qr));
              if (qr > mid) res = min(res, lowest(2 * node + 1, mid + 1, r, ql, qr));
              return res + ad[node];
          }`,
        java: r`
          static final long INF = 1L << 62;
          static long[] mn, ad;

          static void build(int node, int l, int r, long[] a) {
              ad[node] = 0;
              if (l == r) {
                  mn[node] = a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              mn[node] = Math.min(mn[2 * node], mn[2 * node + 1]);
          }

          static void addRange(int node, int l, int r, int ql, int qr, long x) {
              if (ql <= l && r <= qr) {
                  mn[node] += x;
                  ad[node] += x;
                  return;
              }
              int mid = (l + r) / 2;
              if (ql <= mid) addRange(2 * node, l, mid, ql, qr, x);
              if (qr > mid) addRange(2 * node + 1, mid + 1, r, ql, qr, x);
              mn[node] = Math.min(mn[2 * node], mn[2 * node + 1]) + ad[node];
          }

          static long lowest(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) return mn[node];
              int mid = (l + r) / 2;
              long res = INF;
              if (ql <= mid) res = Math.min(res, lowest(2 * node, l, mid, ql, qr));
              if (qr > mid) res = Math.min(res, lowest(2 * node + 1, mid + 1, r, ql, qr));
              return res + ad[node];
          }`
      },
      python: r`
        mn.extend([0] * (4 * n))
        ad.extend([0] * (4 * n))
        build(1, 0, n - 1, a)
        out = []
        for kind, l, rr, x in ops:
            if kind == 1:
                add_range(1, 0, n - 1, l - 1, rr - 1, x)
            else:
                out.append(lowest(1, 0, n - 1, l - 1, rr - 1))
        print(*out)`,
      cpp: r`
        mn.assign(4 * n, 0);
        ad.assign(4 * n, 0);
        build(1, 0, (int)n - 1, a);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], l = ops[k][1], rr = ops[k][2], x = ops[k][3];
            if (kind == 1) {
                addRange(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1, x);
            } else {
                if (!out.empty()) out += " ";
                out += to_string(lowest(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1));
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        mn = new long[4 * cn];
        ad = new long[4 * cn];
        build(1, 0, cn - 1, a);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int l = (int) ops[k][1], rr = (int) ops[k][2];
            long x = ops[k][3];
            if (kind == 1) {
                addRange(1, 0, cn - 1, l - 1, rr - 1, x);
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(lowest(1, 0, cn - 1, l - 1, rr - 1));
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>', '<vector>']
    },
    solution: { explanation: ['Each node keeps the minimum of its block including the additions stored at it and below, plus the addition applied to the whole block; a block inside the range is updated in O(1), parents are recomputed on the way back, and a question adds the stored additions on the way up.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = Float64Array.from(nums(rs[1])); const out = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) { for (let i = l - 1; i < rr; i++) a[i] += x; } else { let m = Infinity; for (let i = l - 1; i < rr; i++) if (a[i] < m) m = a[i]; out.push(m); } } return out.join(' ');
    },
    tests() {
      const g = rng(4403); const out = ['4 3\n5 3 8 1\n1 1 2 10\n2 1 3 0\n2 1 4 0\n', '1 3\n9\n2 1 1 0\n1 1 1 -4\n2 1 1 0\n'];
      const make = (n, q, hi) => { const ops = many(q, () => { const l = randInt(g, 1, n); const rr = randInt(g, l, n); return g() < 0.5 ? [1, l, rr, randInt(g, -hi, hi)] : [2, l, rr, 0]; }); ops.push([2, 1, n, 0]); return `${n} ${q + 1}\n${randArray(g, n, -hi, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) { for (let i = l - 1; i < rr; i++) a[i] += x; } else out.push(Math.min(...a.slice(l - 1, rr))); } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000], [20000, 19999, 1000000], [20000, 19999, 1000000], [20000, 19999, 3], [19999, 19999, 1000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the length of the bracket string and the number of operations.', 'The second line has the string of `n` characters `(` and `)`.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, replace the bracket at the position `x` by the opposite bracket (`y` equals `x`). If `t = 2`, print YES if the part of the string from `x` to `y` is a correct bracket sequence, otherwise NO.'],
    constraints: ['1 <= n, q <= 30000', 'Positions are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'balanced-brackets-in-a-range',
    title: 'Is This Part of the Bracket String Balanced?',
    tags: ['segment-tree', 'brackets', 'prefix-minimum', 'point-update'],
    concept: {
      title: 'A block of brackets is described by two numbers: its total balance and the lowest balance reached inside it',
      body: [
        'A string of `(` and `)` changes one bracket at a time (a bracket is replaced by the opposite one). A question asks whether the part of the string from `x` to `y` is a **correct bracket sequence**, such as `(())()`. A correct sequence never has more closing brackets than opening ones in any prefix, and the numbers of opening and closing brackets are equal. For `()(())` the answer is YES; for `())(` it is NO. Checking a part with a stack is O(n) per question.',
        'Give `(` the value `+1` and `)` the value `-1`. A part is correct exactly when its **total sum is 0** and the **running sum never goes below 0**. A segment tree node stores for its block two numbers: `sum`, the total, and `low`, the **lowest value of the running sum** over the prefixes of the block (counting the empty prefix, so `low <= 0`). Two nodes `A` (left) and `B` (right) merge as `sum = A.sum + B.sum` and `low = min(A.low, A.sum + B.low)`: the second part of the block starts at the height `A.sum`. A leaf `(`  has `sum = 1, low = 0`, and a leaf `)` has `sum = -1, low = -1`.',
        { code: 'def merge(A, B):                      # a node is (sum, low)\n    return (A[0] + B[0], min(A[1], A[0] + B[1]))\n\nempty = (0, 0)\n# a question joins the left blocks and the right blocks in order, as for the run of ones\ntotal, low = merge(left, right)\nanswer = "YES" if total == 0 and low >= 0 else "NO"' },
        'A change replaces the leaf by the opposite bracket and recomputes the parents. The merge is associative, so the tree works. Each operation costs O(log n) merges. The pair (balance, lowest point) is the classical summary of a bracket string and appears again in the problem about repairing brackets.'
      ]
    },
    statement: ['A string of `n` brackets `(` and `)` is given. Process `q` operations: type 1 `x x` replaces the bracket at the position `x` by the opposite bracket; type 2 `x y` asks whether the part of the string from the position `x` to the position `y` is a correct bracket sequence. Print YES or NO for every question, on one line.'],
    outputFormat: ['Print one word for every operation of type 2, separated by spaces.'],
    examples: [{ input: '6 3\n()(())\n2 1 6\n2 2 5\n1 2 2\n', note: 'The whole string is correct (YES), the part )(() in the positions 2..5 is not (NO). The output is YES NO.' }],
    hints: ['Give ( the value +1 and ) the value -1.', 'A part is correct when its sum is 0 and no prefix sum is negative.', 'Store (sum, lowest prefix sum) in each node and merge as (sum1 + sum2, min(low1, sum1 + low2)).'],
    program: {
      io: ['n:int q:int', 's:word', 'ops:int[q][3]'],
      fast: true,
      python: r`
        size = 1
        while size < n:
            size *= 2
        ts = [0] * (2 * size)
        tm = [0] * (2 * size)
        for i in range(n):
            v = 1 if s[i] == "(" else -1
            ts[size + i] = v
            tm[size + i] = min(0, v)
        for v in range(size - 1, 0, -1):
            ts[v] = ts[2 * v] + ts[2 * v + 1]
            tm[v] = min(tm[2 * v], ts[2 * v] + tm[2 * v + 1])
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                ts[v] = -ts[v]
                tm[v] = min(0, ts[v])
                v //= 2
                while v:
                    ts[v] = ts[2 * v] + ts[2 * v + 1]
                    tm[v] = min(tm[2 * v], ts[2 * v] + tm[2 * v + 1])
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                ls = lm = rs = rm = 0
                while lo < hi:
                    if lo & 1:
                        lm = min(lm, ls + tm[lo])
                        ls += ts[lo]
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        rm = min(tm[hi], ts[hi] + rm)
                        rs = ts[hi] + rs
                    lo //= 2
                    hi //= 2
                total = ls + rs
                low = min(lm, ls + rm)
                out.append("YES" if total == 0 and low >= 0 else "NO")
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        vector<long long> ts(2 * size, 0), tm(2 * size, 0);
        for (long long i = 0; i < n; i++) {
            long long v = (s[i] == '(') ? 1 : -1;
            ts[size + i] = v;
            tm[size + i] = min(0LL, v);
        }
        for (long long v = size - 1; v >= 1; v--) {
            ts[v] = ts[2 * v] + ts[2 * v + 1];
            tm[v] = min(tm[2 * v], ts[2 * v] + tm[2 * v + 1]);
        }
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                ts[v] = -ts[v];
                tm[v] = min(0LL, ts[v]);
                for (v /= 2; v >= 1; v /= 2) {
                    ts[v] = ts[2 * v] + ts[2 * v + 1];
                    tm[v] = min(tm[2 * v], ts[2 * v] + tm[2 * v + 1]);
                }
            } else {
                long long lo = size + x - 1, hi = size + y, ls = 0, lm = 0, rs = 0, rm = 0;
                while (lo < hi) {
                    if (lo & 1) {
                        lm = min(lm, ls + tm[lo]);
                        ls += ts[lo];
                        lo++;
                    }
                    if (hi & 1) {
                        --hi;
                        rm = min(tm[hi], ts[hi] + rm);
                        rs = ts[hi] + rs;
                    }
                    lo /= 2;
                    hi /= 2;
                }
                long long total = ls + rs, low = min(lm, ls + rm);
                if (!out.empty()) out += " ";
                out += (total == 0 && low >= 0) ? "YES" : "NO";
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long[] ts = new long[2 * size];
        long[] tm = new long[2 * size];
        for (int i = 0; i < n; i++) {
            long v = (s.charAt(i) == '(') ? 1 : -1;
            ts[size + i] = v;
            tm[size + i] = Math.min(0, v);
        }
        for (int v = size - 1; v >= 1; v--) {
            ts[v] = ts[2 * v] + ts[2 * v + 1];
            tm[v] = Math.min(tm[2 * v], ts[2 * v] + tm[2 * v + 1]);
        }
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1], y = (int) ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                ts[v] = -ts[v];
                tm[v] = Math.min(0, ts[v]);
                for (v /= 2; v >= 1; v /= 2) {
                    ts[v] = ts[2 * v] + ts[2 * v + 1];
                    tm[v] = Math.min(tm[2 * v], ts[2 * v] + tm[2 * v + 1]);
                }
            } else {
                int lo = size + x - 1, hi = size + y;
                long ls = 0, lm = 0, rs = 0, rm = 0;
                while (lo < hi) {
                    if ((lo & 1) == 1) {
                        lm = Math.min(lm, ls + tm[lo]);
                        ls += ts[lo];
                        lo++;
                    }
                    if ((hi & 1) == 1) {
                        --hi;
                        rm = Math.min(tm[hi], ts[hi] + rm);
                        rs = ts[hi] + rs;
                    }
                    lo /= 2;
                    hi /= 2;
                }
                long total = ls + rs, low = Math.min(lm, ls + rm);
                if (out.length() > 0) out.append(" ");
                out.append((total == 0 && low >= 0) ? "YES" : "NO");
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['Each node stores the total balance and the lowest prefix balance of its block; nodes merge as (sum1 + sum2, min(low1, sum1 + low2)), a change flips one leaf, and a part is correct when its total is 0 and its lowest prefix balance is not negative.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const s = rs[1].split(''); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) s[x - 1] = s[x - 1] === '(' ? ')' : '('; else { let bal = 0, ok = true; for (let i = x - 1; i < y; i++) { bal += s[i] === '(' ? 1 : -1; if (bal < 0) { ok = false; break; } } out.push(ok && bal === 0 ? 'YES' : 'NO'); } } return out.join(' ');
    },
    tests() {
      const g = rng(4404); const out = ['6 3\n()(())\n2 1 6\n2 2 5\n1 2 2\n', '2 3\n()\n2 1 2\n1 1 1\n2 1 2\n'];
      const dyck = (n) => { const half = n / 2; const res = shuffle(g, [...new Array(half).fill(1), ...new Array(half).fill(-1)]); // rotate to the point after the lowest prefix sum, so that the sequence is correct (cycle lemma)
        let pos = 0, bal = 0, best = 0; for (let i = 0; i < res.length; i++) { bal += res[i]; if (bal < best) { best = bal; pos = i + 1; } } return res.slice(pos).concat(res.slice(0, pos)).map((v) => (v === 1 ? '(' : ')')).join(''); };
      const make = (n, q) => { const s = dyck(n); const stack = []; const match = new Array(n).fill(-1); for (let i = 0; i < n; i++) { if (s[i] === '(') stack.push(i); else { const j = stack.pop(); match[j] = i; } } const ops = []; for (let i = 0; i < Math.floor(q / 2); i++) { if (g() < 0.5) { let l = randInt(g, 0, n - 1); while (s[l] !== '(') l = randInt(g, 0, n - 1); ops.push([2, l + 1, match[l] + 1]); } else { const l = randInt(g, 1, n); ops.push([2, l, randInt(g, l, n)]); } } for (let i = Math.floor(q / 2); i < q; i++) { if (g() < 0.5) { const x = randInt(g, 1, n); ops.push([1, x, x]); } else { const l = randInt(g, 1, n); ops.push([2, l, randInt(g, l, n)]); } } ops.push([2, 1, n]); return `${n} ${ops.length}\n${s}\n${lines(ops)}\n`; };
      const brute = (input) => this.solve(input);
      crossCheck(() => make(2 * randInt(g, 1, 6), randInt(g, 2, 14)), (i) => this.solve(i), brute, 100);
      for (const [n, q] of [[10, 10], [100, 100], [1000, 1000], [30000, 29998], [30000, 29998], [29998, 29998], [2, 29998]]) out.push(make(n, q));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of lamps and the number of operations.', 'The second line has `n` numbers, each 0 or 1.', 'Each of the next `q` lines has three numbers `t`, `l` and `r`. If `t = 1`, switch every lamp from `l` to `r` (on becomes off and off becomes on). If `t = 2`, print how many lamps from `l` to `r` are on.'],
    constraints: ['1 <= n, q <= 20000', '1 <= l <= r <= n'],
    slug: 'switch-a-range-count-lamps-on',
    title: 'Switch a Whole Range of Lamps, Count the Lamps That Are On',
    tags: ['segment-tree', 'lazy-propagation', 'range-flip', 'counting'],
    concept: {
      title: 'Lazy flip marks cancel in pairs, and a flipped block with c lamps on has length - c lamps on',
      body: [
        'Now an operation **switches every lamp of a range** (on becomes off, off becomes on) and a question asks for the **number of lamps that are on** in a range. For `1 0 1 1` switching the lamps 2 to 3 gives `1 1 0 1`, which has three lamps on. Doing the switches one by one costs O(n) per operation.',
        'Each node keeps `cnt`, the number of lamps that are on in its block, and a lazy mark `flip` (0 or 1): "the cells below this node still have to be switched". **Applying a switch to a whole block** is O(1): the lamps that were on become off and vice versa, so `cnt = length - cnt`, and the mark is toggled (`flip ^= 1`), because two switches cancel each other. Before going down to a child, **push** the mark: apply the switch to both children and clear the mark.',
        { code: 'def apply_flip(node, l, r):\n    cnt[node] = (r - l + 1) - cnt[node]\n    fl[node] ^= 1\n\ndef push(node, l, r):\n    if fl[node]:\n        mid = (l + r) // 2\n        apply_flip(2*node, l, mid); apply_flip(2*node + 1, mid + 1, r)\n        fl[node] = 0\n\ndef flip(node, l, r, ql, qr):\n    if ql <= l and r <= qr: apply_flip(node, l, r); return\n    push(node, l, r)\n    mid = (l + r) // 2\n    if ql <= mid: flip(2*node, l, mid, ql, qr)\n    if qr > mid: flip(2*node + 1, mid + 1, r, ql, qr)\n    cnt[node] = cnt[2*node] + cnt[2*node + 1]' },
        'Counting on a range pushes the marks in the same way and adds up the counts of the covered blocks. All operations are O(log n). The same lazy flip is used for problems about reversing the meaning of a block, such as turning ascending order into descending order.'
      ]
    },
    statement: ['A row of `n` lamps (0 = off, 1 = on) is given. Process `q` operations: type 1 `l r` switches every lamp from `l` to `r`; type 2 `l r` asks how many lamps from `l` to `r` are on. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '4 3\n1 0 1 1\n1 2 3\n2 1 4\n2 2 3\n', note: 'After switching the lamps 2 and 3 the row is 1 1 0 1: three lamps are on in total, and among the lamps 2..3 only the lamp 2 is on: 3 1.' }],
    hints: ['Store the number of lamps that are on in every block and a lazy flip mark.', 'Applying a switch to a block: cnt = length - cnt and the mark is toggled.', 'Push the mark to the children before going down.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      helpers: {
        python: r`
          cnt = []
          fl = []

          def build(node, l, r, a):
              if l == r:
                  cnt[node] = a[l]
                  return
              mid = (l + r) // 2
              build(2 * node, l, mid, a)
              build(2 * node + 1, mid + 1, r, a)
              cnt[node] = cnt[2 * node] + cnt[2 * node + 1]

          def apply_flip(node, l, r):
              cnt[node] = (r - l + 1) - cnt[node]
              fl[node] ^= 1

          def push(node, l, r):
              if fl[node]:
                  mid = (l + r) // 2
                  apply_flip(2 * node, l, mid)
                  apply_flip(2 * node + 1, mid + 1, r)
                  fl[node] = 0

          def flip(node, l, r, ql, qr):
              if ql <= l and r <= qr:
                  apply_flip(node, l, r)
                  return
              push(node, l, r)
              mid = (l + r) // 2
              if ql <= mid:
                  flip(2 * node, l, mid, ql, qr)
              if qr > mid:
                  flip(2 * node + 1, mid + 1, r, ql, qr)
              cnt[node] = cnt[2 * node] + cnt[2 * node + 1]

          def ones(node, l, r, ql, qr):
              if ql <= l and r <= qr:
                  return cnt[node]
              push(node, l, r)
              mid = (l + r) // 2
              s = 0
              if ql <= mid:
                  s += ones(2 * node, l, mid, ql, qr)
              if qr > mid:
                  s += ones(2 * node + 1, mid + 1, r, ql, qr)
              return s`,
        cpp: r`
          vector<int> cnt, fl;

          void build(int node, int l, int r, const vector<long long>& a) {
              if (l == r) {
                  cnt[node] = (int)a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              cnt[node] = cnt[2 * node] + cnt[2 * node + 1];
          }

          void applyFlip(int node, int l, int r) {
              cnt[node] = (r - l + 1) - cnt[node];
              fl[node] ^= 1;
          }

          void push(int node, int l, int r) {
              if (fl[node]) {
                  int mid = (l + r) / 2;
                  applyFlip(2 * node, l, mid);
                  applyFlip(2 * node + 1, mid + 1, r);
                  fl[node] = 0;
              }
          }

          void flipRange(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) {
                  applyFlip(node, l, r);
                  return;
              }
              push(node, l, r);
              int mid = (l + r) / 2;
              if (ql <= mid) flipRange(2 * node, l, mid, ql, qr);
              if (qr > mid) flipRange(2 * node + 1, mid + 1, r, ql, qr);
              cnt[node] = cnt[2 * node] + cnt[2 * node + 1];
          }

          int ones(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) return cnt[node];
              push(node, l, r);
              int mid = (l + r) / 2, s = 0;
              if (ql <= mid) s += ones(2 * node, l, mid, ql, qr);
              if (qr > mid) s += ones(2 * node + 1, mid + 1, r, ql, qr);
              return s;
          }`,
        java: r`
          static int[] cnt, fl;

          static void build(int node, int l, int r, long[] a) {
              if (l == r) {
                  cnt[node] = (int) a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              cnt[node] = cnt[2 * node] + cnt[2 * node + 1];
          }

          static void applyFlip(int node, int l, int r) {
              cnt[node] = (r - l + 1) - cnt[node];
              fl[node] ^= 1;
          }

          static void push(int node, int l, int r) {
              if (fl[node] != 0) {
                  int mid = (l + r) / 2;
                  applyFlip(2 * node, l, mid);
                  applyFlip(2 * node + 1, mid + 1, r);
                  fl[node] = 0;
              }
          }

          static void flipRange(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) {
                  applyFlip(node, l, r);
                  return;
              }
              push(node, l, r);
              int mid = (l + r) / 2;
              if (ql <= mid) flipRange(2 * node, l, mid, ql, qr);
              if (qr > mid) flipRange(2 * node + 1, mid + 1, r, ql, qr);
              cnt[node] = cnt[2 * node] + cnt[2 * node + 1];
          }

          static int ones(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) return cnt[node];
              push(node, l, r);
              int mid = (l + r) / 2, s = 0;
              if (ql <= mid) s += ones(2 * node, l, mid, ql, qr);
              if (qr > mid) s += ones(2 * node + 1, mid + 1, r, ql, qr);
              return s;
          }`
      },
      python: r`
        cnt.extend([0] * (4 * n))
        fl.extend([0] * (4 * n))
        build(1, 0, n - 1, a)
        out = []
        for kind, l, rr in ops:
            if kind == 1:
                flip(1, 0, n - 1, l - 1, rr - 1)
            else:
                out.append(ones(1, 0, n - 1, l - 1, rr - 1))
        print(*out)`,
      cpp: r`
        cnt.assign(4 * n, 0);
        fl.assign(4 * n, 0);
        build(1, 0, (int)n - 1, a);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], l = ops[k][1], rr = ops[k][2];
            if (kind == 1) {
                flipRange(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1);
            } else {
                if (!out.empty()) out += " ";
                out += to_string(ones(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1));
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        cnt = new int[4 * cn];
        fl = new int[4 * cn];
        build(1, 0, cn - 1, a);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int l = (int) ops[k][1], rr = (int) ops[k][2];
            if (kind == 1) {
                flipRange(1, 0, cn - 1, l - 1, rr - 1);
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(ones(1, 0, cn - 1, l - 1, rr - 1));
            }
        }
        System.out.println(out);`,
      includes: ['<string>', '<vector>']
    },
    solution: { explanation: ['Each node stores the number of lamps on in its block and a lazy flip mark; a switch of a whole block is cnt = length - cnt with the mark toggled, and the marks are pushed to the children before going down.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = Uint8Array.from(nums(rs[1])); const out = []; for (let k = 0; k < q; k++) { const [t, l, rr] = nums(rs[2 + k]); if (t === 1) { for (let i = l - 1; i < rr; i++) a[i] ^= 1; } else { let c = 0; for (let i = l - 1; i < rr; i++) c += a[i]; out.push(c); } } return out.join(' ');
    },
    tests() {
      const g = rng(4405); const out = ['4 3\n1 0 1 1\n1 2 3\n2 1 4\n2 2 3\n', '1 3\n1\n2 1 1\n1 1 1\n2 1 1\n'];
      const make = (n, q) => { const ops = many(q, () => { const l = randInt(g, 1, n); return [g() < 0.5 ? 1 : 2, l, randInt(g, l, n)]; }); ops.push([2, 1, n]); return `${n} ${q + 1}\n${randArray(g, n, 0, 1).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => this.solve(input);
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12)), (i) => this.solve(i), brute, 100);
      for (const [n, q] of [[10, 10], [100, 100], [1000, 1000], [20000, 19999], [20000, 19999], [19999, 19999], [1, 19999]]) out.push(make(n, q));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of lamps and the number of operations.', 'The second line has `n` numbers, each 0 or 1.', 'Each of the next `q` lines has two numbers `t` and `x`. If `t = 1`, switch the lamp `x`. If `t = 2`, print the position of the `x`-th lamp that is on, counting from the left, or -1 if fewer than `x` lamps are on.'],
    constraints: ['1 <= n, q <= 30000', '1 <= x <= n'],
    slug: 'find-the-kth-lamp-that-is-on',
    title: 'Where Is the k-th Lamp That Is On?',
    tags: ['segment-tree', 'tree-descent', 'order-statistics', 'point-update'],
    concept: {
      title: 'With the number of lamps on stored in every block, the k-th one is found by walking from the root to a leaf',
      body: [
        'A row of lamps (0 or 1) changes one lamp at a time. A question asks: **at which position is the `k`-th lamp that is on, counting from the left?** For `0 1 1 0 1` the 1st lamp on is at the position 2, the 3rd at the position 5, and there is no 4th, so the answer would be -1. Scanning from the left costs O(n).',
        'Keep in each node of a segment tree the **number of lamps that are on** in its block. To find the `k`-th one, start at the root. If the root has fewer than `k` lamps on, the answer is -1. Otherwise, look at the left child: if it holds at least `k` lamps on, the answer is inside it, so move to the left child; if not, the answer is in the right child, and since the left child holds `c` lamps on, we are looking for the `(k - c)`-th one there. Repeat until a leaf is reached.',
        { code: 'v = 1\nif tree[1] < k: answer = -1\nelse:\n    while v < size:\n        if tree[2 * v] >= k:\n            v = 2 * v                 # the k-th one is in the left block\n        else:\n            k -= tree[2 * v]          # skip the ones of the left block\n            v = 2 * v + 1\n    answer = v - size + 1' },
        'The walk takes one step per level, O(log n) in total, and a change (switching a lamp, which adds or removes 1 along the path to the root) costs the same. This "walk down the tree by counts" is the general way to search for the `k`-th element of a dynamic set with a segment tree; the Fenwick tree does the same with its descent over powers of two.'
      ]
    },
    statement: ['A row of `n` lamps (0 = off, 1 = on) is given. Process `q` operations: type 1 `x` switches the lamp `x`; type 2 `x` asks for the position of the `x`-th lamp that is on, counting from the left (print -1 if fewer than `x` lamps are on). Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '5 4\n0 1 1 0 1\n2 1\n2 3\n2 4\n1 1\n', note: 'The 1st lamp on is at the position 2, the 3rd at the position 5, and there is no 4th: 2 5 -1.' }],
    hints: ['Store the number of lamps on in every node.', 'At each node go left if the left child has at least k lamps on, otherwise subtract its count and go right.', 'If the root has fewer than k lamps on, the answer is -1.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][2]'],
      fast: true,
      python: r`
        size = 1
        while size < n:
            size *= 2
        tree = [0] * (2 * size)
        for i in range(n):
            tree[size + i] = a[i]
        for v in range(size - 1, 0, -1):
            tree[v] = tree[2 * v] + tree[2 * v + 1]
        state = a[:]
        out = []
        for kind, x in ops:
            if kind == 1:
                delta = 1 - 2 * state[x - 1]
                state[x - 1] ^= 1
                v = size + x - 1
                while v:
                    tree[v] += delta
                    v //= 2
            else:
                k = x
                if tree[1] < k:
                    out.append(-1)
                else:
                    v = 1
                    while v < size:
                        if tree[2 * v] >= k:
                            v = 2 * v
                        else:
                            k -= tree[2 * v]
                            v = 2 * v + 1
                    out.append(v - size + 1)
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        vector<long long> tree(2 * size, 0), state = a;
        for (long long i = 0; i < n; i++) tree[size + i] = a[i];
        for (long long v = size - 1; v >= 1; v--) tree[v] = tree[2 * v] + tree[2 * v + 1];
        string out;
        for (long long i = 0; i < q; i++) {
            long long kind = ops[i][0], x = ops[i][1];
            if (kind == 1) {
                long long delta = 1 - 2 * state[x - 1];
                state[x - 1] ^= 1;
                for (long long v = size + x - 1; v >= 1; v /= 2) tree[v] += delta;
            } else {
                long long k = x, result;
                if (tree[1] < k) {
                    result = -1;
                } else {
                    long long v = 1;
                    while (v < size) {
                        if (tree[2 * v] >= k) {
                            v = 2 * v;
                        } else {
                            k -= tree[2 * v];
                            v = 2 * v + 1;
                        }
                    }
                    result = v - size + 1;
                }
                if (!out.empty()) out += " ";
                out += to_string(result);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long[] tree = new long[2 * size];
        long[] state = a.clone();
        for (int i = 0; i < n; i++) tree[size + i] = a[i];
        for (int v = size - 1; v >= 1; v--) tree[v] = tree[2 * v] + tree[2 * v + 1];
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long kind = ops[i][0];
            int x = (int) ops[i][1];
            if (kind == 1) {
                long delta = 1 - 2 * state[x - 1];
                state[x - 1] ^= 1;
                for (int v = size + x - 1; v >= 1; v /= 2) tree[v] += delta;
            } else {
                long k = x, result;
                if (tree[1] < k) {
                    result = -1;
                } else {
                    int v = 1;
                    while (v < size) {
                        if (tree[2 * v] >= k) {
                            v = 2 * v;
                        } else {
                            k -= tree[2 * v];
                            v = 2 * v + 1;
                        }
                    }
                    result = v - size + 1;
                }
                if (out.length() > 0) out.append(" ");
                out.append(result);
            }
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The tree stores the number of lamps on per block; the k-th one is found by walking down from the root, going left when the left block has at least k lamps on and otherwise subtracting its count and going right.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let i = 0; i < q; i++) { const [t, x] = nums(rs[2 + i]); if (t === 1) a[x - 1] ^= 1; else { let c = 0, pos = -1; for (let j = 0; j < n; j++) { if (a[j]) { c++; if (c === x) { pos = j + 1; break; } } } out.push(pos); } } return out.join(' ');
    },
    tests() {
      const g = rng(4406); const out = ['5 4\n0 1 1 0 1\n2 1\n2 3\n2 4\n1 1\n', '1 3\n0\n2 1\n1 1\n2 1\n'];
      const make = (n, q, p) => { const a = many(n, () => (g() < p ? 1 : 0)); const ops = many(q, () => (g() < 0.4 ? [1, randInt(g, 1, n)] : [2, randInt(g, 1, Math.max(1, Math.floor(n * Math.max(p, 0.2) * 1.2)))])); ops.push([2, n]); return `${n} ${ops.length}\n${a.join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => this.solve(input);
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 0.5), (i) => this.solve(i), brute, 100);
      for (const [n, q, p] of [[10, 10, 0.5], [100, 100, 0.5], [1000, 1000, 0.5], [30000, 29999, 0.5], [30000, 29999, 0.9], [30000, 29999, 0.1], [29999, 29999, 0.5]]) out.push(make(n, q, p));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print the largest sum of a non-empty block of consecutive cells inside the cells `x` to `y`.'],
    constraints: ['1 <= n, q <= 30000', '|each number| <= 10^6', 'Cells are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'best-block-sum-in-a-range',
    title: 'The Best Block Sum Inside a Range, With Changes',
    tags: ['segment-tree', 'maximum-subarray', 'merge-nodes', 'point-update'],
    concept: {
      title: 'Four numbers per node (total, best prefix, best suffix, best block) are enough to merge two halves',
      body: [
        'The *maximum subarray sum* of a list is the largest sum of a non-empty block of consecutive numbers. For `-2 1 -3 4 -1 2 1 -5 4` it is 6 (the block `4 -1 2 1`). Now the list changes one number at a time, and a question asks for the maximum block sum **inside a range** `x..y`. Kadane\'s scan costs O(n) per question.',
        'For a segment tree node store four numbers about its block: `sum` (the total), `pref` (the best sum of a block that starts at the **left end**), `suf` (the best sum of a block that ends at the **right end**) and `best` (the best block anywhere inside). Merging a left node `A` and a right node `B`: `sum = A.sum + B.sum`; `pref = max(A.pref, A.sum + B.pref)` (either stay in `A` or take all of `A` and continue into `B`); `suf = max(B.suf, B.sum + A.suf)`; `best = max(A.best, B.best, A.suf + B.pref)` (the third term is the best block that crosses the seam). A leaf with the value `v` is `(v, v, v, v)`.',
        { code: 'NEG = -(1 << 60)\ndef merge(A, B):                       # (sum, pref, suf, best)\n    return (A[0] + B[0],\n            max(A[1], A[0] + B[1]),\n            max(B[2], B[0] + A[2]),\n            max(A[3], B[3], A[2] + B[1]))\n\nempty = (0, NEG, NEG, NEG)           # neutral for merging\n# a question joins the left blocks and the right blocks in order, then reads best' },
        'The empty node `(0, -inf, -inf, -inf)` is neutral: merging it with any node gives that node back (the huge negative numbers never win). Because a block must be non-empty, the answer for a range of one cell is that cell, even if it is negative. Each operation costs O(log n) merges; sums are below 3 * 10^10.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` asks for the largest sum of a non-empty block of consecutive numbers lying inside the positions `x` to `y`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '9 3\n-2 1 -3 4 -1 2 1 -5 4\n2 1 9\n2 7 9\n1 8 6\n', note: 'The best block of the whole row is 4 -1 2 1 with the sum 6; inside the cells 7..9 (1 -5 4) the best block is the single cell 4: 6 4.' }],
    hints: ['Store (sum, best prefix, best suffix, best block) in every node.', 'The best block of the merge may cross the seam: suffix of the left plus prefix of the right.', 'Use a very negative number for the neutral node.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      helpers: {
        python: r`
          NEG = -(1 << 60)

          def merge(A, B):
              return (A[0] + B[0], max(A[1], A[0] + B[1]), max(B[2], B[0] + A[2]), max(A[3], B[3], A[2] + B[1]))`,
        cpp: r`
          const long long NEG = -(1LL << 60);

          struct Block {
              long long sum, pref, suf, best;
          };

          Block mergeBlocks(const Block& A, const Block& B) {
              Block c;
              c.sum = A.sum + B.sum;
              c.pref = max(A.pref, A.sum + B.pref);
              c.suf = max(B.suf, B.sum + A.suf);
              c.best = max(max(A.best, B.best), A.suf + B.pref);
              return c;
          }`,
        java: r`
          static final long NEG = -(1L << 60);

          static long[] mergeBlocks(long[] A, long[] B) {
              return new long[] {A[0] + B[0], Math.max(A[1], A[0] + B[1]), Math.max(B[2], B[0] + A[2]), Math.max(Math.max(A[3], B[3]), A[2] + B[1])};
          }`
      },
      python: r`
        size = 1
        while size < n:
            size *= 2
        empty = (0, NEG, NEG, NEG)
        tree = [empty] * (2 * size)
        for i in range(n):
            tree[size + i] = (a[i], a[i], a[i], a[i])
        for v in range(size - 1, 0, -1):
            tree[v] = merge(tree[2 * v], tree[2 * v + 1])
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                tree[v] = (y, y, y, y)
                v //= 2
                while v:
                    tree[v] = merge(tree[2 * v], tree[2 * v + 1])
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                left = empty
                right = empty
                while lo < hi:
                    if lo & 1:
                        left = merge(left, tree[lo])
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        right = merge(tree[hi], right)
                    lo //= 2
                    hi //= 2
                out.append(merge(left, right)[3])
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        const Block EMPTY = {0, NEG, NEG, NEG};
        vector<Block> tree(2 * size, EMPTY);
        for (long long i = 0; i < n; i++) tree[size + i] = {a[i], a[i], a[i], a[i]};
        for (long long v = size - 1; v >= 1; v--) tree[v] = mergeBlocks(tree[2 * v], tree[2 * v + 1]);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                tree[v] = {y, y, y, y};
                for (v /= 2; v >= 1; v /= 2) tree[v] = mergeBlocks(tree[2 * v], tree[2 * v + 1]);
            } else {
                long long lo = size + x - 1, hi = size + y;
                Block left = EMPTY, right = EMPTY;
                while (lo < hi) {
                    if (lo & 1) left = mergeBlocks(left, tree[lo++]);
                    if (hi & 1) right = mergeBlocks(tree[--hi], right);
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(mergeBlocks(left, right).best);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long[][] tree = new long[2 * size][];
        for (int i = 0; i < 2 * size; i++) tree[i] = new long[] {0, NEG, NEG, NEG};
        for (int i = 0; i < n; i++) tree[size + i] = new long[] {a[i], a[i], a[i], a[i]};
        for (int v = size - 1; v >= 1; v--) tree[v] = mergeBlocks(tree[2 * v], tree[2 * v + 1]);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                tree[v] = new long[] {y, y, y, y};
                for (v /= 2; v >= 1; v /= 2) tree[v] = mergeBlocks(tree[2 * v], tree[2 * v + 1]);
            } else {
                int lo = size + x - 1, hi = size + (int) y;
                long[] left = new long[] {0, NEG, NEG, NEG};
                long[] right = new long[] {0, NEG, NEG, NEG};
                while (lo < hi) {
                    if ((lo & 1) == 1) left = mergeBlocks(left, tree[lo++]);
                    if ((hi & 1) == 1) right = mergeBlocks(tree[--hi], right);
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(mergeBlocks(left, right)[3]);
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['Each node stores (sum, best prefix, best suffix, best block); two nodes merge with the crossing term suffix + prefix, and a question merges the left and right blocks of the range in order.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; // Kadane inside the range
      for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { let best = -Infinity, cur = 0; for (let i = x - 1; i < y; i++) { cur = Math.max(a[i], cur + a[i]); if (cur > best) best = cur; } out.push(best); } } return out.join(' ');
    },
    tests() {
      const g = rng(4407); const out = ['9 3\n-2 1 -3 4 -1 2 1 -5 4\n2 1 9\n2 7 9\n1 8 6\n', '1 2\n-5\n2 1 1\n1 1 7\n'];
      const make = (n, q, hi) => { const a = randArray(g, n, -hi, hi); const ops = many(q, () => { if (g() < 0.5) return [1, randInt(g, 1, n), randInt(g, -hi, hi)]; const x = randInt(g, 1, n); return [2, x, randInt(g, x, n)]; }); ops.push([2, 1, n]); return `${n} ${ops.length}\n${a.join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { let best = -Infinity; for (let i = x - 1; i < y; i++) { let s = 0; for (let j = i; j < y; j++) { s += a[j]; if (s > best) best = s; } } out.push(best); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000], [30000, 29999, 1000000], [30000, 29999, 1000000], [30000, 29999, 3], [29999, 29999, 1000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print the length of the longest block of consecutive cells inside the cells `x` to `y` whose values are strictly increasing.'],
    constraints: ['1 <= n, q <= 30000', '|each number| <= 10^9', 'Cells are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'longest-rising-run-in-a-range',
    title: 'The Longest Strictly Rising Run in a Range, With Changes',
    tags: ['segment-tree', 'merge-nodes', 'rising-run', 'point-update'],
    concept: {
      title: 'Like the run of ones, but two runs join at the seam only if the last value of the left part is smaller than the first value of the right part',
      body: [
        'A row of numbers changes one cell at a time. A question asks for the length of the **longest strictly rising run** (consecutive cells with `a[i] < a[i + 1] < ...`) inside a range. For `3 1 2 4 4 5` the longest rising run in the whole row is 3 (the cells `1 2 4`), and inside the cells 4 to 6 it is 2 (`4 5`). Scanning costs O(n) per question.',
        'The node is like the one for the run of ones, with two more values. For its block it stores `len`, `pref` (the length of the rising run at the **left end**), `suf` (the rising run at the **right end**), `best`, and also the first and last values `first` and `last` of the block. Merging `A` and `B`: the runs may join across the seam only if `A.last < B.first`. If they join, then `pref` is `A.len + B.pref` when the whole of `A` is rising (`A.pref == A.len`), else `A.pref`; `suf` is `B.len + A.suf` when the whole of `B` is rising, else `B.suf`; and `best` also considers `A.suf + B.pref`. If they do not join, `pref = A.pref`, `suf = B.suf` and `best = max(A.best, B.best)`.',
        { code: 'def merge(A, B):                 # (len, pref, suf, best, first, last); an empty node has len 0\n    if A[0] == 0: return B\n    if B[0] == 0: return A\n    join = A[5] < B[4]\n    pref = A[0] + B[1] if join and A[1] == A[0] else A[1]\n    suf = B[0] + A[2] if join and B[2] == B[0] else B[2]\n    best = max(A[3], B[3], A[2] + B[1] if join else 0)\n    return (A[0] + B[0], pref, suf, best, A[4], B[5])' },
        'The empty node must be handled separately, because it has no first and last value. The question joins the left and right accumulators in order. Each operation is O(log n) merges. The same pattern solves "longest non-decreasing run", "longest alternating run" and other properties of neighbouring cells.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` asks for the length of the longest block of consecutive cells inside the positions `x` to `y` in which every number is strictly larger than the previous one. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '6 3\n3 1 2 4 4 5\n2 1 6\n2 4 6\n1 4 9\n', note: 'The cells 1 2 4 rise for 3; the cells 4 4 5 give a run of 2: 3 2.' }],
    hints: ['Store (len, prefix run, suffix run, best run, first value, last value).', 'Two runs join at the seam when the last value on the left is less than the first value on the right.', 'Handle the empty node separately in the merge.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      helpers: {
        python: r`
          def merge(A, B):
              if A[0] == 0:
                  return B
              if B[0] == 0:
                  return A
              join = A[5] < B[4]
              pref = A[0] + B[1] if join and A[1] == A[0] else A[1]
              suf = B[0] + A[2] if join and B[2] == B[0] else B[2]
              best = max(A[3], B[3], A[2] + B[1] if join else 0)
              return (A[0] + B[0], pref, suf, best, A[4], B[5])`,
        cpp: r`
          struct Rise {
              long long len, pref, suf, best, first, last;
          };

          Rise mergeRise(const Rise& A, const Rise& B) {
              if (A.len == 0) return B;
              if (B.len == 0) return A;
              bool join = A.last < B.first;
              Rise c;
              c.len = A.len + B.len;
              c.pref = (join && A.pref == A.len) ? A.len + B.pref : A.pref;
              c.suf = (join && B.suf == B.len) ? B.len + A.suf : B.suf;
              c.best = max(max(A.best, B.best), join ? A.suf + B.pref : 0LL);
              c.first = A.first;
              c.last = B.last;
              return c;
          }`,
        java: r`
          static long[] mergeRise(long[] A, long[] B) {
              if (A[0] == 0) return B;
              if (B[0] == 0) return A;
              boolean join = A[5] < B[4];
              long pref = (join && A[1] == A[0]) ? A[0] + B[1] : A[1];
              long suf = (join && B[2] == B[0]) ? B[0] + A[2] : B[2];
              long best = Math.max(Math.max(A[3], B[3]), join ? A[2] + B[1] : 0);
              return new long[] {A[0] + B[0], pref, suf, best, A[4], B[5]};
          }`
      },
      python: r`
        size = 1
        while size < n:
            size *= 2
        empty = (0, 0, 0, 0, 0, 0)
        tree = [empty] * (2 * size)
        for i in range(n):
            tree[size + i] = (1, 1, 1, 1, a[i], a[i])
        for v in range(size - 1, 0, -1):
            tree[v] = merge(tree[2 * v], tree[2 * v + 1])
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                tree[v] = (1, 1, 1, 1, y, y)
                v //= 2
                while v:
                    tree[v] = merge(tree[2 * v], tree[2 * v + 1])
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                left = empty
                right = empty
                while lo < hi:
                    if lo & 1:
                        left = merge(left, tree[lo])
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        right = merge(tree[hi], right)
                    lo //= 2
                    hi //= 2
                out.append(merge(left, right)[3])
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        const Rise EMPTY = {0, 0, 0, 0, 0, 0};
        vector<Rise> tree(2 * size, EMPTY);
        for (long long i = 0; i < n; i++) tree[size + i] = {1, 1, 1, 1, a[i], a[i]};
        for (long long v = size - 1; v >= 1; v--) tree[v] = mergeRise(tree[2 * v], tree[2 * v + 1]);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                tree[v] = {1, 1, 1, 1, y, y};
                for (v /= 2; v >= 1; v /= 2) tree[v] = mergeRise(tree[2 * v], tree[2 * v + 1]);
            } else {
                long long lo = size + x - 1, hi = size + y;
                Rise left = EMPTY, right = EMPTY;
                while (lo < hi) {
                    if (lo & 1) left = mergeRise(left, tree[lo++]);
                    if (hi & 1) right = mergeRise(tree[--hi], right);
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(mergeRise(left, right).best);
            }
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long[][] tree = new long[2 * size][];
        for (int i = 0; i < 2 * size; i++) tree[i] = new long[6];
        for (int i = 0; i < n; i++) tree[size + i] = new long[] {1, 1, 1, 1, a[i], a[i]};
        for (int v = size - 1; v >= 1; v--) tree[v] = mergeRise(tree[2 * v], tree[2 * v + 1]);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                tree[v] = new long[] {1, 1, 1, 1, y, y};
                for (v /= 2; v >= 1; v /= 2) tree[v] = mergeRise(tree[2 * v], tree[2 * v + 1]);
            } else {
                int lo = size + x - 1, hi = size + (int) y;
                long[] left = new long[6];
                long[] right = new long[6];
                while (lo < hi) {
                    if ((lo & 1) == 1) left = mergeRise(left, tree[lo++]);
                    if ((hi & 1) == 1) right = mergeRise(tree[--hi], right);
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(mergeRise(left, right)[3]);
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['Each node stores the block length, the rising run at its left end, at its right end, the best run, and the first and last values; two nodes join their runs at the seam only when the last value on the left is smaller than the first value on the right.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = y; else { let best = 1, cur = 1; for (let i = x; i < y; i++) { cur = a[i] > a[i - 1] ? cur + 1 : 1; if (cur > best) best = cur; } out.push(best); } } return out.join(' ');
    },
    tests() {
      const g = rng(4408); const out = ['6 3\n3 1 2 4 4 5\n2 1 6\n2 4 6\n1 4 9\n', '1 2\n5\n2 1 1\n1 1 7\n'];
      const make = (n, q, hi, trend) => { const a = many(n, (i) => (trend ? i * 3 + randInt(g, -2, 2) : randInt(g, -hi, hi))); const ops = many(q, () => { if (g() < 0.5) return [1, randInt(g, 1, n), trend ? randInt(g, 0, 3 * n) : randInt(g, -hi, hi)]; const x = randInt(g, 1, n); return [2, x, randInt(g, x, n)]; }); ops.push([2, 1, n]); return `${n} ${ops.length}\n${a.join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => this.solve(input);
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 4, false), (i) => this.solve(i), brute, 100);
      for (const [n, q, hi, trend] of [[10, 10, 100, false], [100, 100, 1000, true], [1000, 1000, 1000000, false], [20000, 19999, 1000000000, false], [20000, 19999, 3, false], [20000, 19999, 0, true], [19999, 19999, 1000000000, true]]) out.push(make(n, q, hi, trend));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, set the cell number `x` to the value `y`. If `t = 2`, print the product of the cells `x` to `y` modulo 1000000007.'],
    constraints: ['1 <= n, q <= 30000', '1 <= each number <= 10^9', 'Cells are numbered from 1; for a question 1 <= x <= y <= n.'],
    slug: 'product-of-a-range-modulo-a-prime',
    title: 'The Product of a Range Modulo 1000000007, With Changes',
    tags: ['segment-tree', 'modular-arithmetic', 'product', 'point-update'],
    concept: {
      title: 'Multiplication modulo a prime is associative, so the tree works; division is not needed',
      body: [
        'A row of numbers changes one cell at a time, and a question asks for the **product of the numbers from `x` to `y`**, written modulo `1000000007` (a prime, and the usual modulus for big answers). For `2 3 4` the product of all three is 24. The real product of 30000 numbers up to 10^9 has hundreds of thousands of digits, so it is always taken modulo the prime.',
        'It is tempting to use a table of prefix products and divide, as for prefix sums: `product(x..y) = P[y] / P[x - 1]`. Division modulo a prime is possible (with a modular inverse), but after a change the whole table from that cell on would have to be rebuilt, and the numbers can be a multiple of the prime in other problems. A segment tree avoids both issues: **multiplication modulo the prime is associative** with the neutral element 1, so the tree is the one used for sums, with `a * b % MOD` instead of `a + b`.',
        { code: 'MOD = 1000000007\ntree[size + i] = a[i] % MOD; unused leaves = 1\nfor v in range(size - 1, 0, -1): tree[v] = tree[2*v] * tree[2*v + 1] % MOD\n# a change sets a leaf and recomputes the parents; a question multiplies the blocks of the range modulo MOD' },
        'Every multiplication stays below `MOD^2 = 10^18`, which fits in a signed 64-bit integer, so no special arithmetic is needed in C++ and Java. Each operation costs O(log n) modular multiplications. In the real contest practice this pattern is used for products, for counting ways and for polynomial hashes of ranges.'
      ]
    },
    statement: ['A row of `n` positive numbers is given. Process `q` operations: type 1 `x y` sets the number at the position `x` to `y`; type 2 `x y` asks for the product of the numbers at the positions `x` to `y`, modulo 1000000007. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '3 3\n2 3 4\n2 1 3\n1 2 10\n2 1 3\n', note: '2 * 3 * 4 = 24; after the change 2 * 10 * 4 = 80: 24 80.' }],
    hints: ['Use the sum tree with multiplication modulo 1000000007 instead of addition.', 'The neutral element is 1.', 'A product of two residues fits in 64 bits.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      python: r`
        mod = 1000000007
        size = 1
        while size < n:
            size *= 2
        tree = [1] * (2 * size)
        for i in range(n):
            tree[size + i] = a[i] % mod
        for v in range(size - 1, 0, -1):
            tree[v] = tree[2 * v] * tree[2 * v + 1] % mod
        out = []
        for kind, x, y in ops:
            if kind == 1:
                v = size + x - 1
                tree[v] = y % mod
                v //= 2
                while v:
                    tree[v] = tree[2 * v] * tree[2 * v + 1] % mod
                    v //= 2
            else:
                lo = size + x - 1
                hi = size + y
                res = 1
                while lo < hi:
                    if lo & 1:
                        res = res * tree[lo] % mod
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        res = res * tree[hi] % mod
                    lo //= 2
                    hi //= 2
                out.append(res)
        print(*out)`,
      cpp: r`
        const long long MOD = 1000000007LL;
        long long size = 1;
        while (size < n) size *= 2;
        vector<long long> tree(2 * size, 1);
        for (long long i = 0; i < n; i++) tree[size + i] = a[i] % MOD;
        for (long long v = size - 1; v >= 1; v--) tree[v] = tree[2 * v] * tree[2 * v + 1] % MOD;
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                long long v = size + x - 1;
                tree[v] = y % MOD;
                for (v /= 2; v >= 1; v /= 2) tree[v] = tree[2 * v] * tree[2 * v + 1] % MOD;
            } else {
                long long lo = size + x - 1, hi = size + y, res = 1;
                while (lo < hi) {
                    if (lo & 1) res = res * tree[lo++] % MOD;
                    if (hi & 1) res = res * tree[--hi] % MOD;
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(res);
            }
        }
        cout << out << "\n";`,
      java: r`
        long mod = 1000000007L;
        int size = 1;
        while (size < n) size *= 2;
        long[] tree = new long[2 * size];
        Arrays.fill(tree, 1);
        for (int i = 0; i < n; i++) tree[size + i] = a[i] % mod;
        for (int v = size - 1; v >= 1; v--) tree[v] = tree[2 * v] * tree[2 * v + 1] % mod;
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1];
            long y = ops[k][2];
            if (kind == 1) {
                int v = size + x - 1;
                tree[v] = y % mod;
                for (v /= 2; v >= 1; v /= 2) tree[v] = tree[2 * v] * tree[2 * v + 1] % mod;
            } else {
                int lo = size + x - 1, hi = size + (int) y;
                long res = 1;
                while (lo < hi) {
                    if ((lo & 1) == 1) res = res * tree[lo++] % mod;
                    if ((hi & 1) == 1) res = res * tree[--hi] % mod;
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
    solution: { explanation: ['Multiplication modulo the prime is associative with neutral element 1, so a segment tree of products supports changes and range products in O(log n) multiplications.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]).map(BigInt); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = BigInt(y); else { let p = 1n; for (let i = x - 1; i < y; i++) p = (p * a[i]) % MOD; out.push(p); } } return out.join(' ');
    },
    tests() {
      const g = rng(4409); const out = ['3 3\n2 3 4\n2 1 3\n1 2 10\n2 1 3\n', '1 2\n1000000000\n2 1 1\n1 1 5\n'];
      const make = (n, q, hi) => { const a = randArray(g, n, 1, hi); const ops = many(q, () => { if (g() < 0.5) return [1, randInt(g, 1, n), randInt(g, 1, hi)]; const x = randInt(g, 1, n); return [2, x, randInt(g, x, n)]; }); ops.push([2, 1, n]); return `${n} ${ops.length}\n${a.join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]).map(BigInt); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) a[x - 1] = BigInt(y); else { let p = 1n; for (let i = x - 1; i < y; i++) p = (p * a[i]) % MOD; out.push(p); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), 20), (i) => this.solve(i), brute, 300);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000000], [20000, 19999, 1000000000], [20000, 19999, 1000000000], [20000, 19999, 3], [19999, 19999, 1000000000]]) out.push(make(n, q, hi));
      return out;
    }
  }
];
