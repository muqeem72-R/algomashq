import { r, rng, randInt, many, nums, rows, shuffle, randArray } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const lines = (list) => list.map((p) => p.join(' ')).join('\n');
class Fen {
  constructor(n) { this.n = n; this.t = new Array(n + 1).fill(0); }
  add(i, x) { for (; i <= this.n; i += i & -i) this.t[i] += x; }
  sum(i) { let s = 0; for (; i > 0; i -= i & -i) s += this.t[i]; return s; }
}
const lowerBound = (a, v) => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] < v) lo = mid + 1; else hi = mid; } return lo; };
const upperBound = (a, v) => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] <= v) lo = mid + 1; else hi = mid; } return lo; };
const LOWER_BOUND_JAVA = r`
    static int lowerBound(long[] a, long v) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (a[mid] < v) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }`;

export default [
  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has four numbers `t`, `l`, `r` and `x`. If `t = 1`, set every cell from `l` to `r` to `x`. If `t = 2`, add `x` to every cell from `l` to `r`. If `t = 3`, print the sum of the cells from `l` to `r` (`x` is 0).'],
    constraints: ['1 <= n, q <= 20000', '|each cell| <= 10^6, |x| <= 10^6', '1 <= l <= r <= n'],
    slug: 'assign-and-add-to-ranges-sum-a-range',
    title: 'Two Kinds of Range Changes and a Range Sum',
    tags: ['segment-tree', 'lazy-propagation', 'tag-composition', 'range-assign', 'range-add'],
    concept: {
      title: 'When two kinds of lazy marks meet, decide how a new mark combines with the one already waiting',
      body: [
        'Now there are **two** range changes: "set every cell to `x`" and "add `x` to every cell". A block of the tree can wait for either of them, and several can arrive before the block is opened. For the row `1 2 3 4 5` the operation "add 10 to the cells 2 to 4" gives `1 12 13 14 5`, and then "set the cells 3 to 5 to 7" gives `1 12 7 7 7`. Each node must remember **one summary mark** that is equivalent to everything that arrived, in order.',
        'The summary can be kept as "a pending assignment `sv` (or none) and a pending addition `ad`", with a simple rule for a new mark. An **assignment** wipes out whatever was waiting: `sv = x`, `ad = 0`. An **addition** `d` joins the mark: if an assignment is pending, the assigned value just grows (`sv += d`), because "set to `v`, then add `d`" is "set to `v + d`"; otherwise `ad += d`. In both cases the stored block sum is corrected at once: `sum = x * len` or `sum += d * len`.',
        { code: 'def put(node, l, r, x):  sm[node] = x * (r - l + 1); sv[node] = x; ad[node] = 0\n\ndef bump(node, l, r, d):\n    sm[node] += d * (r - l + 1)\n    if sv[node] != NONE: sv[node] += d       # "set to v, then add d" is "set to v + d"\n    else: ad[node] += d\n\ndef push(node, l, r):                        # hand the summary mark to both children\n    if sv[node] != NONE: put(left, ..., sv[node]); put(right, ..., sv[node]); sv[node] = NONE\n    elif ad[node]:       bump(left, ..., ad[node]); bump(right, ..., ad[node]); ad[node] = 0' },
        'An assignment is passed down before an addition that came later is, so the order of events is preserved by the rule above. The only invariant to keep in mind is: when `sv` is set, `ad` is zero. Every operation touches O(log n) nodes.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `l r x` sets every number at the positions `l` to `r` to `x`; type 2 `l r x` adds `x` to every number at the positions `l` to `r`; type 3 `l r 0` asks for the sum of the numbers at the positions `l` to `r`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 3, separated by spaces.'],
    examples: [{ input: '5 4\n1 2 3 4 5\n2 2 4 10\n1 3 5 7\n3 1 5 0\n3 2 3 0\n', note: 'Adding 10 to the cells 2..4 gives 1 12 13 14 5; setting the cells 3..5 to 7 gives 1 12 7 7 7. The whole sum is 34, and the cells 2..3 sum to 19: 34 19.' }],
    hints: ['Keep, in every node, the sum of its block and one summary mark made of a pending assignment and a pending addition.', 'A new assignment replaces the mark; a new addition is added to the pending assignment if there is one, otherwise to the pending addition.', 'Push the mark to the children before going inside a block, assignment first.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][4]'],
      fast: true,
      helpers: {
        python: r`
          NONE = 1 << 60
          sm = []
          sv = []
          ad = []

          def build(node, l, r, a):
              sv[node] = NONE
              if l == r:
                  sm[node] = a[l]
                  return
              mid = (l + r) // 2
              build(2 * node, l, mid, a)
              build(2 * node + 1, mid + 1, r, a)
              sm[node] = sm[2 * node] + sm[2 * node + 1]

          def put(node, l, r, x):
              sm[node] = x * (r - l + 1)
              sv[node] = x
              ad[node] = 0

          def bump(node, l, r, d):
              sm[node] += d * (r - l + 1)
              if sv[node] != NONE:
                  sv[node] += d
              else:
                  ad[node] += d

          def push(node, l, r):
              mid = (l + r) // 2
              if sv[node] != NONE:
                  put(2 * node, l, mid, sv[node])
                  put(2 * node + 1, mid + 1, r, sv[node])
                  sv[node] = NONE
              elif ad[node] != 0:
                  bump(2 * node, l, mid, ad[node])
                  bump(2 * node + 1, mid + 1, r, ad[node])
                  ad[node] = 0

          def change(node, l, r, ql, qr, kind, x):
              if ql <= l and r <= qr:
                  if kind == 1:
                      put(node, l, r, x)
                  else:
                      bump(node, l, r, x)
                  return
              push(node, l, r)
              mid = (l + r) // 2
              if ql <= mid:
                  change(2 * node, l, mid, ql, qr, kind, x)
              if qr > mid:
                  change(2 * node + 1, mid + 1, r, ql, qr, kind, x)
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
          vector<long long> sm, sv, ad;

          void build(int node, int l, int r, const vector<long long>& a) {
              sv[node] = NONE;
              if (l == r) {
                  sm[node] = a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              sm[node] = sm[2 * node] + sm[2 * node + 1];
          }

          void put(int node, int l, int r, long long x) {
              sm[node] = x * (r - l + 1);
              sv[node] = x;
              ad[node] = 0;
          }

          void bump(int node, int l, int r, long long d) {
              sm[node] += d * (r - l + 1);
              if (sv[node] != NONE) sv[node] += d;
              else ad[node] += d;
          }

          void push(int node, int l, int r) {
              int mid = (l + r) / 2;
              if (sv[node] != NONE) {
                  put(2 * node, l, mid, sv[node]);
                  put(2 * node + 1, mid + 1, r, sv[node]);
                  sv[node] = NONE;
              } else if (ad[node] != 0) {
                  bump(2 * node, l, mid, ad[node]);
                  bump(2 * node + 1, mid + 1, r, ad[node]);
                  ad[node] = 0;
              }
          }

          void change(int node, int l, int r, int ql, int qr, long long kind, long long x) {
              if (ql <= l && r <= qr) {
                  if (kind == 1) put(node, l, r, x);
                  else bump(node, l, r, x);
                  return;
              }
              push(node, l, r);
              int mid = (l + r) / 2;
              if (ql <= mid) change(2 * node, l, mid, ql, qr, kind, x);
              if (qr > mid) change(2 * node + 1, mid + 1, r, ql, qr, kind, x);
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
          static long[] sm, sv, ad;

          static void build(int node, int l, int r, long[] a) {
              sv[node] = NONE;
              if (l == r) {
                  sm[node] = a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              sm[node] = sm[2 * node] + sm[2 * node + 1];
          }

          static void put(int node, int l, int r, long x) {
              sm[node] = x * (r - l + 1);
              sv[node] = x;
              ad[node] = 0;
          }

          static void bump(int node, int l, int r, long d) {
              sm[node] += d * (r - l + 1);
              if (sv[node] != NONE) sv[node] += d;
              else ad[node] += d;
          }

          static void push(int node, int l, int r) {
              int mid = (l + r) / 2;
              if (sv[node] != NONE) {
                  put(2 * node, l, mid, sv[node]);
                  put(2 * node + 1, mid + 1, r, sv[node]);
                  sv[node] = NONE;
              } else if (ad[node] != 0) {
                  bump(2 * node, l, mid, ad[node]);
                  bump(2 * node + 1, mid + 1, r, ad[node]);
                  ad[node] = 0;
              }
          }

          static void change(int node, int l, int r, int ql, int qr, long kind, long x) {
              if (ql <= l && r <= qr) {
                  if (kind == 1) put(node, l, r, x);
                  else bump(node, l, r, x);
                  return;
              }
              push(node, l, r);
              int mid = (l + r) / 2;
              if (ql <= mid) change(2 * node, l, mid, ql, qr, kind, x);
              if (qr > mid) change(2 * node + 1, mid + 1, r, ql, qr, kind, x);
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
        sv.extend([NONE] * (4 * n))
        ad.extend([0] * (4 * n))
        build(1, 0, n - 1, a)
        out = []
        for kind, l, rr, x in ops:
            if kind == 3:
                out.append(total(1, 0, n - 1, l - 1, rr - 1))
            else:
                change(1, 0, n - 1, l - 1, rr - 1, kind, x)
        print(*out)`,
      cpp: r`
        sm.assign(4 * n, 0);
        sv.assign(4 * n, NONE);
        ad.assign(4 * n, 0);
        build(1, 0, (int)n - 1, a);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], l = ops[k][1], rr = ops[k][2], x = ops[k][3];
            if (kind == 3) {
                if (!out.empty()) out += " ";
                out += to_string(total(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1));
            } else {
                change(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1, kind, x);
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        sm = new long[4 * cn];
        sv = new long[4 * cn];
        ad = new long[4 * cn];
        build(1, 0, cn - 1, a);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int l = (int) ops[k][1], rr = (int) ops[k][2];
            long x = ops[k][3];
            if (kind == 3) {
                if (out.length() > 0) out.append(" ");
                out.append(total(1, 0, cn - 1, l - 1, rr - 1));
            } else {
                change(1, 0, cn - 1, l - 1, rr - 1, kind, x);
            }
        }
        System.out.println(out);`,
      includes: ['<string>', '<vector>']
    },
    solution: { explanation: ['Every node keeps the sum of its block and one summary mark: a pending assignment (or none) and a pending addition. A new assignment replaces the mark, a new addition joins it, and the mark is pushed to the children before a block is opened.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]);
      const hs = new Uint8Array(4 * n), sv = new Float64Array(4 * n), ad = new Float64Array(4 * n), sm = new Float64Array(4 * n);
      const put = (o, l, rr, x) => { sm[o] = x * (rr - l + 1); hs[o] = 1; sv[o] = x; ad[o] = 0; };
      const bump = (o, l, rr, x) => { sm[o] += x * (rr - l + 1); if (hs[o]) sv[o] += x; else ad[o] += x; };
      const push = (o, l, rr) => { const m = (l + rr) >> 1; if (hs[o]) { put(2 * o, l, m, sv[o]); put(2 * o + 1, m + 1, rr, sv[o]); hs[o] = 0; } else if (ad[o]) { bump(2 * o, l, m, ad[o]); bump(2 * o + 1, m + 1, rr, ad[o]); ad[o] = 0; } };
      const build = (o, l, rr) => { if (l === rr) { sm[o] = a[l]; return; } const m = (l + rr) >> 1; build(2 * o, l, m); build(2 * o + 1, m + 1, rr); sm[o] = sm[2 * o] + sm[2 * o + 1]; };
      const change = (o, l, rr, ql, qr, t, x) => { if (ql <= l && rr <= qr) { if (t === 1) put(o, l, rr, x); else bump(o, l, rr, x); return; } push(o, l, rr); const m = (l + rr) >> 1; if (ql <= m) change(2 * o, l, m, ql, qr, t, x); if (qr > m) change(2 * o + 1, m + 1, rr, ql, qr, t, x); sm[o] = sm[2 * o] + sm[2 * o + 1]; };
      const total = (o, l, rr, ql, qr) => { if (ql <= l && rr <= qr) return sm[o]; push(o, l, rr); const m = (l + rr) >> 1; let s = 0; if (ql <= m) s += total(2 * o, l, m, ql, qr); if (qr > m) s += total(2 * o + 1, m + 1, rr, ql, qr); return s; };
      build(1, 0, n - 1); const out = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 3) out.push(total(1, 0, n - 1, l - 1, rr - 1)); else change(1, 0, n - 1, l - 1, rr - 1, t, x); } return out.join(' ');
    },
    tests() {
      const g = rng(4901); const out = ['5 4\n1 2 3 4 5\n2 2 4 10\n1 3 5 7\n3 1 5 0\n3 2 3 0\n', '1 3\n9\n3 1 1 0\n2 1 1 -4\n3 1 1 0\n'];
      const make = (n, q, hi, pSet, pAdd) => { const ops = many(q, () => { const l = randInt(g, 1, n); const rr = randInt(g, l, n); const roll = g(); if (roll < pSet) return [1, l, rr, randInt(g, -hi, hi)]; if (roll < pSet + pAdd) return [2, l, rr, randInt(g, -hi, hi)]; return [3, l, rr, 0]; }); ops.push([3, 1, n, 0]); return `${n} ${q + 1}\n${randArray(g, n, -hi, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const res = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) { for (let i = l - 1; i < rr; i++) a[i] = x; } else if (t === 2) { for (let i = l - 1; i < rr; i++) a[i] += x; } else res.push(a.slice(l - 1, rr).reduce((s, v) => s + v, 0)); } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 14), 20, 0.3, 0.3), (i) => this.solve(i), brute, 1000);
      for (const [n, q, hi, ps, pa] of [[10, 10, 100, 0.3, 0.3], [100, 100, 1000, 0.3, 0.3], [1000, 1000, 1000000, 0.3, 0.3], [20000, 19999, 1000000, 0.25, 0.4], [20000, 19999, 1000000, 0.05, 0.6], [20000, 19999, 1000000, 0.6, 0.1], [20000, 19999, 3, 0.3, 0.3], [19999, 19999, 1000000, 0.2, 0.2]]) out.push(make(n, q, hi, ps, pa));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the length of the list and the number of questions.', 'The second line has the `n` numbers of the list.', 'Each of the next `q` lines has three numbers `L`, `R` and `X`: a question in a coded form.'],
    constraints: ['1 <= n, q <= 40000', '1 <= a[i] <= 10^9', 'Decoded: 1 <= l <= r <= n and 0 <= x <= 10^9.'],
    slug: 'larger-numbers-in-a-range-online',
    title: 'How Many Numbers in a Range Are Larger Than x? Questions Come Coded',
    tags: ['merge-sort-tree', 'segment-tree', 'binary-search', 'online-queries'],
    concept: {
      title: 'Keep a sorted copy of every block of the tree, so a question is a handful of binary searches',
      body: [
        'A list is fixed, and each question asks **how many numbers at the positions `l..r` are larger than `x`**. The earlier offline trick (sort the questions by `x`) is blocked here: each question is **coded with the answer of the previous one**. The numbers in the input are `L = l xor last`, `R = r xor last` and `X = x xor last`, where `last` is the answer to the previous question (0 for the first). You cannot even read question number 5 until you know the answer to question number 4, so the questions must be answered online.',
        'A **merge sort tree** is a segment tree where every node stores the **sorted list of the numbers of its block**. The root holds the whole list sorted, its children hold the two halves sorted, and so on. It is built bottom-up by merging the sorted lists of the two children, O(n log n) in total. A range `[l, r]` splits into O(log n) blocks of the tree, and in each block a binary search tells how many numbers are larger than `x` (`len - bisect_right(block, x)`).',
        { code: 'size = power of two >= n;  tree[size + i] = [a[i]];  tree[node] = merge(tree[2*node], tree[2*node+1])\n\nlo = l - 1 + size;  hi = r + size                  # half-open [lo, hi)\nwhile lo < hi:\n    if lo & 1: cnt += len(tree[lo]) - bisect_right(tree[lo], x); lo += 1\n    if hi & 1: hi -= 1; cnt += len(tree[hi]) - bisect_right(tree[hi], x)\n    lo >>= 1; hi >>= 1' },
        'The loop is the usual bottom-up walk: whenever `lo` is a right child its block is taken whole, and the same on the right side. A question costs O(log^2 n): O(log n) blocks with a binary search of O(log n) each. The memory is O(n log n) numbers, about 700 thousand for 40000 elements. Remember to decode with the previous answer, and to store the new answer for the next question.'
      ]
    },
    statement: ['A list of `n` numbers is given. Answer `q` questions in order. The question number `j` has three coded numbers `L`, `R` and `X`. Let `last` be the answer to the previous question (`last = 0` before the first question). Then `l = L xor last`, `r = R xor last` and `x = X xor last`, and the question is: how many numbers at the positions `l` to `r` (counting from 1, both included) are **strictly larger** than `x`? Print the answers on one line.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: '5 2\n3 8 1 9 4\n1 5 3\n6 6 7\n', note: 'The first question is decoded with last = 0: the numbers of the whole list larger than 3 are 8, 9 and 4, so the answer is 3. For the second one last = 3: l = 6 xor 3 = 5, r = 6 xor 3 = 5 and x = 7 xor 3 = 4. The number at the position 5 is 4, which is not larger than 4: 3 0.' }],
    hints: ['A different order of the questions is impossible, because each one needs the answer of the previous one.', 'Build a segment tree in which every node keeps the sorted numbers of its block.', 'A range splits into O(log n) blocks; in each block, count the numbers larger than x with a binary search.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'qs:int[q][3]'],
      fast: true,
      helpers: { python: 'from bisect import bisect_right', java: LOWER_BOUND_JAVA + '\n\n' + r`
    static long[] mergeSorted(long[] x, long[] y) {
        long[] z = new long[x.length + y.length];
        int i = 0, j = 0, k = 0;
        while (i < x.length && j < y.length) {
            if (x[i] <= y[j]) z[k++] = x[i++];
            else z[k++] = y[j++];
        }
        while (i < x.length) z[k++] = x[i++];
        while (j < y.length) z[k++] = y[j++];
        return z;
    }` },
      python: r`
        size = 1
        while size < n:
            size *= 2
        tree = [[] for _ in range(2 * size)]
        for i in range(n):
            tree[size + i] = [a[i]]
        for node in range(size - 1, 0, -1):
            tree[node] = sorted(tree[2 * node] + tree[2 * node + 1])
        last = 0
        out = []
        for L, R, X in qs:
            lo = (L ^ last) - 1 + size
            hi = (R ^ last) + size
            x = X ^ last
            cnt = 0
            while lo < hi:
                if lo & 1:
                    cnt += len(tree[lo]) - bisect_right(tree[lo], x)
                    lo += 1
                if hi & 1:
                    hi -= 1
                    cnt += len(tree[hi]) - bisect_right(tree[hi], x)
                lo >>= 1
                hi >>= 1
            out.append(cnt)
            last = cnt
        print(*out)`,
      cpp: r`
        long long size = 1;
        while (size < n) size *= 2;
        vector<vector<long long>> tree(2 * size);
        for (long long i = 0; i < n; i++) tree[size + i].push_back(a[i]);
        for (long long node = size - 1; node >= 1; node--) {
            tree[node].resize(tree[2 * node].size() + tree[2 * node + 1].size());
            merge(tree[2 * node].begin(), tree[2 * node].end(), tree[2 * node + 1].begin(), tree[2 * node + 1].end(), tree[node].begin());
        }
        long long last = 0;
        string out;
        for (long long j = 0; j < q; j++) {
            long long lo = (qs[j][0] ^ last) - 1 + size;
            long long hi = (qs[j][1] ^ last) + size;
            long long x = qs[j][2] ^ last;
            long long cnt = 0;
            while (lo < hi) {
                if (lo & 1) {
                    cnt += tree[lo].end() - upper_bound(tree[lo].begin(), tree[lo].end(), x);
                    lo++;
                }
                if (hi & 1) {
                    hi--;
                    cnt += tree[hi].end() - upper_bound(tree[hi].begin(), tree[hi].end(), x);
                }
                lo >>= 1;
                hi >>= 1;
            }
            if (!out.empty()) out += " ";
            out += to_string(cnt);
            last = cnt;
        }
        cout << out << "\n";`,
      java: r`
        int size = 1;
        while (size < n) size *= 2;
        long[][] tree = new long[2 * size][];
        for (int i = 0; i < size; i++) tree[size + i] = i < n ? new long[] {a[i]} : new long[0];
        for (int node = size - 1; node >= 1; node--) tree[node] = mergeSorted(tree[2 * node], tree[2 * node + 1]);
        long last = 0;
        StringBuilder out = new StringBuilder();
        for (int j = 0; j < q; j++) {
            int lo = (int) (qs[j][0] ^ last) - 1 + size;
            int hi = (int) (qs[j][1] ^ last) + size;
            long x = qs[j][2] ^ last;
            long cnt = 0;
            while (lo < hi) {
                if ((lo & 1) == 1) {
                    cnt += tree[lo].length - lowerBound(tree[lo], x + 1);
                    lo++;
                }
                if ((hi & 1) == 1) {
                    hi--;
                    cnt += tree[hi].length - lowerBound(tree[hi], x + 1);
                }
                lo >>= 1;
                hi >>= 1;
            }
            if (j > 0) out.append(" ");
            out.append(cnt);
            last = cnt;
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['A merge sort tree keeps the sorted numbers of every block. A range is cut into O(log n) blocks, and in each block a binary search counts the numbers larger than x. Each question is decoded with the previous answer.'], complexity: 'Time O(n log n + q log^2 n), space O(n log n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); let size = 1; while (size < n) size *= 2; const tree = new Array(2 * size).fill(null).map(() => []); for (let i = 0; i < n; i++) tree[size + i] = [a[i]];
      for (let node = size - 1; node >= 1; node--) tree[node] = [...tree[2 * node], ...tree[2 * node + 1]].sort((x, y) => x - y);
      let last = 0; const out = []; for (let j = 0; j < q; j++) { const [L, R, X] = nums(rs[2 + j]); let lo = (L ^ last) - 1 + size, hi = (R ^ last) + size; const x = X ^ last; let cnt = 0; while (lo < hi) { if (lo & 1) { cnt += tree[lo].length - upperBound(tree[lo], x); lo++; } if (hi & 1) { hi--; cnt += tree[hi].length - upperBound(tree[hi], x); } lo >>= 1; hi >>= 1; } out.push(cnt); last = cnt; } return out.join(' ');
    },
    tests() {
      const g = rng(4902);
      const answersOf = (a, qs) => { const n = a.length; const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => a[x] - a[y]); const qo = qs.map((_, j) => j).sort((x, y) => qs[x][2] - qs[y][2]); const f = new Fen(n); const ans = new Array(qs.length); let p = 0; for (const j of qo) { const [l, rr, x] = qs[j]; while (p < n && a[order[p]] <= x) { f.add(order[p] + 1, 1); p++; } ans[j] = (rr - l + 1) - (f.sum(rr) - f.sum(l - 1)); } return ans; };
      const make = (n, q, hi, pHit) => { const a = randArray(g, n, 1, hi); const qs = many(q, () => { let l = randInt(g, 1, n), rr = randInt(g, 1, n); if (l > rr) [l, rr] = [rr, l]; return [l, rr, g() < pHit ? a[randInt(g, 0, n - 1)] : randInt(g, 0, hi)]; }); const ans = answersOf(a, qs); let last = 0; const coded = qs.map(([l, rr, x], j) => { const row = [l ^ last, rr ^ last, x ^ last]; last = ans[j]; return row; }); return `${n} ${q}\n${a.join(' ')}\n${lines(coded)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); let last = 0; const res = []; for (let j = 0; j < q; j++) { const [L, R, X] = nums(rs[2 + j]); const l = L ^ last, rr = R ^ last, x = X ^ last; let c = 0; for (let i = l - 1; i < rr; i++) if (a[i] > x) c++; res.push(c); last = c; } return res.join(' '); };
      const out = ['5 2\n3 8 1 9 4\n1 5 3\n6 6 7\n', '1 1\n1000000000\n1 1 0\n'];
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 10), 6, 0.6), (i) => this.solve(i), brute, 1000);
      for (const [n, q, hi, p] of [[30, 30, 10, 0.8], [300, 300, 100, 0.8], [3000, 3000, 1000000000, 0.7], [40000, 40000, 1000000000, 0.5], [40000, 40000, 100, 0.9], [39999, 40000, 5, 0.9], [40000, 30000, 1000000, 0.6]]) out.push(make(n, q, hi, p));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the length of the list and the number of questions.', 'The second line has the `n` numbers of the list.', 'Each of the next `q` lines has three numbers `l`, `r` and `k`.'],
    constraints: ['1 <= n, q <= 30000', '1 <= a[i] <= 10^9', '1 <= l <= r <= n', '1 <= k <= r - l + 1'],
    slug: 'kth-smallest-in-a-range',
    title: 'The k-th Smallest Number in a Range',
    tags: ['persistent-segment-tree', 'order-statistics', 'coordinate-compression', 'static-queries'],
    concept: {
      title: 'Keep one version of a counting tree for every prefix, and subtract two versions to see exactly the range',
      body: [
        'A list is fixed and every question asks for the **k-th smallest number among the positions `l..r`**. For `5 2 9 2 7` and the range 2 to 4 the numbers are `2 9 2`, and the 2nd smallest is 2. Sorting every range costs O(n log n) per question, and the answers cannot be combined from simpler pieces because order statistics are not additive.',
        'Compress the values to ranks `0..m-1`. A **counting tree** over the ranks tells, for any set of numbers, how many of them fall in a rank interval, and it can find the k-th element by descending: go left if the left half holds at least `k` numbers, otherwise subtract that count and go right. Now build a **persistent** version: version `i` is the counting tree of the first `i` numbers. Inserting the next number creates only the O(log m) nodes on one path and shares everything else with the previous version, so all versions together take O(n log m) nodes.',
        { code: 'for x in a:                                   # version i + 1 from version i\n    new root; copy the path to rank[x] with count + 1; children not on the path are shared\n\ndef kth(l, r, k):                             # versions l - 1 and r\n    u, w = roots[l - 1], roots[r]\n    while lo < hi:\n        c = ct[left[w]] - ct[left[u]]         # numbers of the range in the left half\n        if k <= c: u, w, hi = left[u], left[w], mid\n        else:      k -= c; u, w, lo = right[u], right[w], mid + 1' },
        'The difference of the counts of two versions is exactly the count over the range, so the descent runs on the two trees in parallel. A question costs O(log m). The answer is the value that belongs to the final rank. Equal numbers have equal ranks and are counted with their multiplicity.'
      ]
    },
    statement: ['A list of `n` numbers is given. Answer `q` questions. Each question has three numbers `l`, `r` and `k`: among the numbers at the positions `l` to `r` (counting from 1, both included), find the `k`-th smallest one. Equal numbers are counted separately: in `2 2 5` the 2nd smallest is 2. Print the answers on one line, in the order of the questions.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: '5 3\n5 2 9 2 7\n1 5 3\n2 4 2\n3 5 1\n', note: 'The whole list sorted is 2 2 5 7 9, whose 3rd is 5. The range 2..4 holds 2 9 2, whose 2nd smallest is 2. The range 3..5 holds 9 2 7, whose smallest is 2: 5 2 2.' }],
    hints: ['Compress the values and think of a segment tree over the ranks that counts how many numbers fall in each interval of ranks.', 'Build a persistent version of that tree after every prefix of the list, sharing all the nodes that did not change.', 'The counts of the versions r and l - 1 differ by exactly the range; descend in both trees at once to find the k-th.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'qs:int[q][3]'],
      fast: true,
      python: r`
        vals = sorted(set(a))
        rank = {v: i for i, v in enumerate(vals)}
        m = len(vals)
        lc = [0]
        rc = [0]
        ct = [0]
        roots = [0]
        for x in a:
            v = rank[x]
            prev = roots[-1]
            cur = len(ct)
            roots.append(cur)
            lc.append(0)
            rc.append(0)
            ct.append(ct[prev] + 1)
            lo = 0
            hi = m - 1
            while lo < hi:
                mid = (lo + hi) // 2
                nn = len(ct)
                lc.append(0)
                rc.append(0)
                if v <= mid:
                    rc[cur] = rc[prev]
                    lc[cur] = nn
                    ct.append(ct[lc[prev]] + 1)
                    prev = lc[prev]
                    hi = mid
                else:
                    lc[cur] = lc[prev]
                    rc[cur] = nn
                    ct.append(ct[rc[prev]] + 1)
                    prev = rc[prev]
                    lo = mid + 1
                cur = nn
        out = []
        for l, rr, k in qs:
            u = roots[l - 1]
            w = roots[rr]
            lo = 0
            hi = m - 1
            while lo < hi:
                mid = (lo + hi) // 2
                c = ct[lc[w]] - ct[lc[u]]
                if k <= c:
                    u = lc[u]
                    w = lc[w]
                    hi = mid
                else:
                    k -= c
                    u = rc[u]
                    w = rc[w]
                    lo = mid + 1
            out.append(vals[lo])
        print(*out)`,
      cpp: r`
        vector<long long> vals(a.begin(), a.end());
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        int m = (int)vals.size();
        vector<int> lc(1, 0), rc(1, 0), ct(1, 0), roots(1, 0);
        for (long long i = 0; i < n; i++) {
            int v = (int)(lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin());
            int prev = roots.back();
            int cur = (int)ct.size();
            roots.push_back(cur);
            lc.push_back(0);
            rc.push_back(0);
            ct.push_back(ct[prev] + 1);
            int lo = 0, hi = m - 1;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                int nn = (int)ct.size();
                lc.push_back(0);
                rc.push_back(0);
                if (v <= mid) {
                    rc[cur] = rc[prev];
                    lc[cur] = nn;
                    ct.push_back(ct[lc[prev]] + 1);
                    prev = lc[prev];
                    hi = mid;
                } else {
                    lc[cur] = lc[prev];
                    rc[cur] = nn;
                    ct.push_back(ct[rc[prev]] + 1);
                    prev = rc[prev];
                    lo = mid + 1;
                }
                cur = nn;
            }
        }
        string out;
        for (long long j = 0; j < q; j++) {
            int u = roots[qs[j][0] - 1], w = roots[qs[j][1]];
            long long k = qs[j][2];
            int lo = 0, hi = m - 1;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                long long c = ct[lc[w]] - ct[lc[u]];
                if (k <= c) {
                    u = lc[u];
                    w = lc[w];
                    hi = mid;
                } else {
                    k -= c;
                    u = rc[u];
                    w = rc[w];
                    lo = mid + 1;
                }
            }
            if (!out.empty()) out += " ";
            out += to_string(vals[lo]);
        }
        cout << out << "\n";`,
      java: r`
        int cnt = (int) n;
        long[] keys = new long[cnt];
        for (int i = 0; i < cnt; i++) keys[i] = (a[i] << 16) | i;
        Arrays.sort(keys);
        int[] rk = new int[cnt];
        long[] vals = new long[cnt];
        int m = 0;
        long lastv = -1;
        for (int i = 0; i < cnt; i++) {
            long v = keys[i] >> 16;
            if (v != lastv) {
                vals[m++] = v;
                lastv = v;
            }
            rk[(int) (keys[i] & 65535)] = m - 1;
        }
        int cap = cnt * 18 + 5;
        int[] lc = new int[cap], rc = new int[cap], ct = new int[cap];
        int[] roots = new int[cnt + 1];
        int used = 1;
        for (int i = 0; i < cnt; i++) {
            int v = rk[i];
            int prev = roots[i];
            int cur = used++;
            roots[i + 1] = cur;
            ct[cur] = ct[prev] + 1;
            int lo = 0, hi = m - 1;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                int nn = used++;
                if (v <= mid) {
                    rc[cur] = rc[prev];
                    lc[cur] = nn;
                    ct[nn] = ct[lc[prev]] + 1;
                    prev = lc[prev];
                    hi = mid;
                } else {
                    lc[cur] = lc[prev];
                    rc[cur] = nn;
                    ct[nn] = ct[rc[prev]] + 1;
                    prev = rc[prev];
                    lo = mid + 1;
                }
                cur = nn;
            }
        }
        StringBuilder out = new StringBuilder();
        for (int j = 0; j < q; j++) {
            int u = roots[(int) qs[j][0] - 1], w = roots[(int) qs[j][1]];
            long k = qs[j][2];
            int lo = 0, hi = m - 1;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                long c = ct[lc[w]] - ct[lc[u]];
                if (k <= c) {
                    u = lc[u];
                    w = lc[w];
                    hi = mid;
                } else {
                    k -= c;
                    u = rc[u];
                    w = rc[w];
                    lo = mid + 1;
                }
            }
            if (j > 0) out.append(" ");
            out.append(vals[lo]);
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['A persistent counting tree over the ranks of the values has one version per prefix of the list. The counts of the versions r and l - 1 differ by exactly the range, and a parallel descent finds the k-th smallest.'], complexity: 'Time O((n + q) log n), space O(n log n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); let size = 1; while (size < n) size *= 2; const tree = new Array(2 * size).fill(null).map(() => []); for (let i = 0; i < n; i++) tree[size + i] = [a[i]];
      for (let node = size - 1; node >= 1; node--) tree[node] = [...tree[2 * node], ...tree[2 * node + 1]].sort((x, y) => x - y);
      const vals = [...new Set(a)].sort((x, y) => x - y); const countAtMost = (l, rr, v) => { let lo = l - 1 + size, hi = rr + size, c = 0; while (lo < hi) { if (lo & 1) { c += upperBound(tree[lo], v); lo++; } if (hi & 1) { hi--; c += upperBound(tree[hi], v); } lo >>= 1; hi >>= 1; } return c; };
      const out = []; for (let j = 0; j < q; j++) { const [l, rr, k] = nums(rs[2 + j]); let lo = 0, hi = vals.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (countAtMost(l, rr, vals[mid]) >= k) hi = mid; else lo = mid + 1; } out.push(vals[lo]); } return out.join(' '); // binary search on the answer over a merge sort tree
    },
    tests() {
      const g = rng(4903); const out = ['5 3\n5 2 9 2 7\n1 5 3\n2 4 2\n3 5 1\n', '1 1\n7\n1 1 1\n'];
      const make = (n, q, hi) => { const a = randArray(g, n, 1, hi); const qs = many(q, () => { let l = randInt(g, 1, n), rr = randInt(g, 1, n); if (l > rr) [l, rr] = [rr, l]; return [l, rr, randInt(g, 1, rr - l + 1)]; }); return `${n} ${q}\n${a.join(' ')}\n${lines(qs)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const res = []; for (let j = 0; j < q; j++) { const [l, rr, k] = nums(rs[2 + j]); res.push(a.slice(l - 1, rr).sort((x, y) => x - y)[k - 1]); } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 10), 6), (i) => this.solve(i), brute, 1000);
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 10), 1000000000), (i) => this.solve(i), brute, 300);
      for (const [n, q, hi] of [[30, 30, 10], [300, 300, 100], [3000, 3000, 1000000000], [30000, 30000, 1000000000], [30000, 30000, 100], [29999, 30000, 5], [30000, 30000, 1000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has four numbers `t`, `l`, `r` and `x`. If `t = 1`, add `x` to every cell from `l` to `r`. If `t = 2`, print the sum of the squares of the cells from `l` to `r` (`x` is 0).'],
    constraints: ['1 <= n, q <= 20000', '|each cell| <= 1000, |x| <= 1000', '1 <= l <= r <= n'],
    slug: 'sum-of-squares-after-range-additions',
    title: 'The Sum of Squares of a Range That Keeps Getting Additions',
    tags: ['segment-tree', 'lazy-propagation', 'range-add', 'sum-of-squares'],
    concept: {
      title: 'Keep both the sum and the sum of squares of a block: one addition changes the second by a formula that uses the first',
      body: [
        'Operations **add a number to every cell of a range**, and questions ask for the **sum of the squares** of a range. For `1 2 3` and an addition of 10 to all the cells, the squares go from `1 4 9` to `121 144 169`: the new sum of squares is 434. Recomputing the squares cell by cell costs O(n) per operation.',
        'The squares of a block cannot be updated from the old sum of squares alone, but they can be updated from **two** numbers per block: `s1 = sum of the cells` and `s2 = sum of their squares`. When `d` is added to every cell of a block with `len` cells, `(x + d)^2 = x^2 + 2 d x + d^2`, so summing over the block gives `s2_new = s2 + 2 d s1 + len d^2` and `s1_new = s1 + len d`. The order of the two updates matters: update `s2` first, with the old `s1`.',
        { code: 'def bump(node, l, r, d):\n    ln = r - l + 1\n    s2[node] += 2 * d * s1[node] + d * d * ln       # uses the OLD sum\n    s1[node] += d * ln\n    lz[node] += d                                    # additions simply add up' },
        'The pending addition of a node is a single number, and two additions combine by adding. With the usual push-down every operation costs O(log n). The answers can be large (the cells reach about `2 * 10^7` and the sum of squares about `8 * 10^18`), so they need 64-bit integers, and the example of 20000 additions of 1000 to all cells is the extreme case.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `l r x` adds `x` to every number at the positions `l` to `r`; type 2 `l r 0` asks for the sum of the squares of the numbers at the positions `l` to `r`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '3 3\n1 2 3\n2 1 3 0\n1 1 3 10\n2 1 3 0\n', note: 'The squares 1 4 9 sum to 14. After adding 10 to every cell the row is 11 12 13, whose squares sum to 121 + 144 + 169 = 434: 14 434.' }],
    hints: ['A block must remember the sum of its cells and the sum of their squares.', 'Adding d to every cell of a block of length len changes the sum of squares by 2 * d * (sum) + len * d * d, and the sum by len * d.', 'Keep a pending addition in each node and push it down before looking inside a block.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][4]'],
      fast: true,
      helpers: {
        python: r`
          s1 = []
          s2 = []
          lz = []

          def build(node, l, r, a):
              if l == r:
                  s1[node] = a[l]
                  s2[node] = a[l] * a[l]
                  return
              mid = (l + r) // 2
              build(2 * node, l, mid, a)
              build(2 * node + 1, mid + 1, r, a)
              s1[node] = s1[2 * node] + s1[2 * node + 1]
              s2[node] = s2[2 * node] + s2[2 * node + 1]

          def bump(node, l, r, d):
              ln = r - l + 1
              s2[node] += 2 * d * s1[node] + d * d * ln
              s1[node] += d * ln
              lz[node] += d

          def push(node, l, r):
              if lz[node] != 0:
                  mid = (l + r) // 2
                  bump(2 * node, l, mid, lz[node])
                  bump(2 * node + 1, mid + 1, r, lz[node])
                  lz[node] = 0

          def add(node, l, r, ql, qr, d):
              if ql <= l and r <= qr:
                  bump(node, l, r, d)
                  return
              push(node, l, r)
              mid = (l + r) // 2
              if ql <= mid:
                  add(2 * node, l, mid, ql, qr, d)
              if qr > mid:
                  add(2 * node + 1, mid + 1, r, ql, qr, d)
              s1[node] = s1[2 * node] + s1[2 * node + 1]
              s2[node] = s2[2 * node] + s2[2 * node + 1]

          def squares(node, l, r, ql, qr):
              if ql <= l and r <= qr:
                  return s2[node]
              push(node, l, r)
              mid = (l + r) // 2
              s = 0
              if ql <= mid:
                  s += squares(2 * node, l, mid, ql, qr)
              if qr > mid:
                  s += squares(2 * node + 1, mid + 1, r, ql, qr)
              return s`,
        cpp: r`
          vector<long long> s1, s2, lz;

          void build(int node, int l, int r, const vector<long long>& a) {
              if (l == r) {
                  s1[node] = a[l];
                  s2[node] = a[l] * a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              s1[node] = s1[2 * node] + s1[2 * node + 1];
              s2[node] = s2[2 * node] + s2[2 * node + 1];
          }

          void bump(int node, int l, int r, long long d) {
              long long ln = r - l + 1;
              s2[node] += 2 * d * s1[node] + d * d * ln;
              s1[node] += d * ln;
              lz[node] += d;
          }

          void push(int node, int l, int r) {
              if (lz[node] != 0) {
                  int mid = (l + r) / 2;
                  bump(2 * node, l, mid, lz[node]);
                  bump(2 * node + 1, mid + 1, r, lz[node]);
                  lz[node] = 0;
              }
          }

          void add(int node, int l, int r, int ql, int qr, long long d) {
              if (ql <= l && r <= qr) {
                  bump(node, l, r, d);
                  return;
              }
              push(node, l, r);
              int mid = (l + r) / 2;
              if (ql <= mid) add(2 * node, l, mid, ql, qr, d);
              if (qr > mid) add(2 * node + 1, mid + 1, r, ql, qr, d);
              s1[node] = s1[2 * node] + s1[2 * node + 1];
              s2[node] = s2[2 * node] + s2[2 * node + 1];
          }

          long long squares(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) return s2[node];
              push(node, l, r);
              int mid = (l + r) / 2;
              long long s = 0;
              if (ql <= mid) s += squares(2 * node, l, mid, ql, qr);
              if (qr > mid) s += squares(2 * node + 1, mid + 1, r, ql, qr);
              return s;
          }`,
        java: r`
          static long[] s1, s2, lz;

          static void build(int node, int l, int r, long[] a) {
              if (l == r) {
                  s1[node] = a[l];
                  s2[node] = a[l] * a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              s1[node] = s1[2 * node] + s1[2 * node + 1];
              s2[node] = s2[2 * node] + s2[2 * node + 1];
          }

          static void bump(int node, int l, int r, long d) {
              long ln = r - l + 1;
              s2[node] += 2 * d * s1[node] + d * d * ln;
              s1[node] += d * ln;
              lz[node] += d;
          }

          static void push(int node, int l, int r) {
              if (lz[node] != 0) {
                  int mid = (l + r) / 2;
                  bump(2 * node, l, mid, lz[node]);
                  bump(2 * node + 1, mid + 1, r, lz[node]);
                  lz[node] = 0;
              }
          }

          static void add(int node, int l, int r, int ql, int qr, long d) {
              if (ql <= l && r <= qr) {
                  bump(node, l, r, d);
                  return;
              }
              push(node, l, r);
              int mid = (l + r) / 2;
              if (ql <= mid) add(2 * node, l, mid, ql, qr, d);
              if (qr > mid) add(2 * node + 1, mid + 1, r, ql, qr, d);
              s1[node] = s1[2 * node] + s1[2 * node + 1];
              s2[node] = s2[2 * node] + s2[2 * node + 1];
          }

          static long squares(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) return s2[node];
              push(node, l, r);
              int mid = (l + r) / 2;
              long s = 0;
              if (ql <= mid) s += squares(2 * node, l, mid, ql, qr);
              if (qr > mid) s += squares(2 * node + 1, mid + 1, r, ql, qr);
              return s;
          }`
      },
      python: r`
        s1.extend([0] * (4 * n))
        s2.extend([0] * (4 * n))
        lz.extend([0] * (4 * n))
        build(1, 0, n - 1, a)
        out = []
        for kind, l, rr, x in ops:
            if kind == 1:
                add(1, 0, n - 1, l - 1, rr - 1, x)
            else:
                out.append(squares(1, 0, n - 1, l - 1, rr - 1))
        print(*out)`,
      cpp: r`
        s1.assign(4 * n, 0);
        s2.assign(4 * n, 0);
        lz.assign(4 * n, 0);
        build(1, 0, (int)n - 1, a);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], l = ops[k][1], rr = ops[k][2], x = ops[k][3];
            if (kind == 1) {
                add(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1, x);
            } else {
                if (!out.empty()) out += " ";
                out += to_string(squares(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1));
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        s1 = new long[4 * cn];
        s2 = new long[4 * cn];
        lz = new long[4 * cn];
        build(1, 0, cn - 1, a);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int l = (int) ops[k][1], rr = (int) ops[k][2];
            long x = ops[k][3];
            if (kind == 1) {
                add(1, 0, cn - 1, l - 1, rr - 1, x);
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(squares(1, 0, cn - 1, l - 1, rr - 1));
            }
        }
        System.out.println(out);`,
      includes: ['<string>', '<vector>']
    },
    solution: { explanation: ['Every node keeps the sum and the sum of squares of its block and a pending addition d. Adding d to a block of length len changes the sum of squares by 2 d (sum) + len d^2 and the sum by len d.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]).map(BigInt); const s1 = new Array(4 * n).fill(0n), s2 = new Array(4 * n).fill(0n), lz = new Array(4 * n).fill(0n);
      const pull = (o) => { s1[o] = s1[2 * o] + s1[2 * o + 1]; s2[o] = s2[2 * o] + s2[2 * o + 1]; };
      const build = (o, l, rr) => { if (l === rr) { s1[o] = a[l]; s2[o] = a[l] * a[l]; return; } const m = (l + rr) >> 1; build(2 * o, l, m); build(2 * o + 1, m + 1, rr); pull(o); };
      const bump = (o, l, rr, d) => { const ln = BigInt(rr - l + 1); s2[o] += 2n * d * s1[o] + d * d * ln; s1[o] += d * ln; lz[o] += d; };
      const push = (o, l, rr) => { if (lz[o] !== 0n) { const m = (l + rr) >> 1; bump(2 * o, l, m, lz[o]); bump(2 * o + 1, m + 1, rr, lz[o]); lz[o] = 0n; } };
      const add = (o, l, rr, ql, qr, d) => { if (ql <= l && rr <= qr) { bump(o, l, rr, d); return; } push(o, l, rr); const m = (l + rr) >> 1; if (ql <= m) add(2 * o, l, m, ql, qr, d); if (qr > m) add(2 * o + 1, m + 1, rr, ql, qr, d); pull(o); };
      const squares = (o, l, rr, ql, qr) => { if (ql <= l && rr <= qr) return s2[o]; push(o, l, rr); const m = (l + rr) >> 1; let s = 0n; if (ql <= m) s += squares(2 * o, l, m, ql, qr); if (qr > m) s += squares(2 * o + 1, m + 1, rr, ql, qr); return s; };
      build(1, 0, n - 1); const out = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) add(1, 0, n - 1, l - 1, rr - 1, BigInt(x)); else out.push(squares(1, 0, n - 1, l - 1, rr - 1).toString()); } return out.join(' ');
    },
    tests() {
      const g = rng(4904); const out = ['3 3\n1 2 3\n2 1 3 0\n1 1 3 10\n2 1 3 0\n', '1 2\n-5\n2 1 1 0\n2 1 1 0\n'];
      const make = (n, q, hi, pAdd) => { const ops = many(q, () => { const l = randInt(g, 1, n); const rr = randInt(g, l, n); return g() < pAdd ? [1, l, rr, randInt(g, -hi, hi)] : [2, l, rr, 0]; }); ops.push([2, 1, n, 0]); return `${n} ${q + 1}\n${randArray(g, n, -hi, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]).map(BigInt); const res = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) { for (let i = l - 1; i < rr; i++) a[i] += BigInt(x); } else { let s = 0n; for (let i = l - 1; i < rr; i++) s += a[i] * a[i]; res.push(s.toString()); } } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 14), 20, 0.5), (i) => this.solve(i), brute, 1000);
      for (const [n, q, hi, p] of [[10, 10, 100, 0.5], [100, 100, 1000, 0.5], [1000, 1000, 1000, 0.5], [20000, 19999, 1000, 0.5], [20000, 19999, 1000, 0.9], [20000, 19999, 3, 0.5], [19999, 19999, 1000, 0.3]]) out.push(make(n, q, hi, p));
      out.push(`20000 20000\n${many(20000, () => 1000).join(' ')}\n${many(19999, () => '1 1 20000 1000').join('\n')}\n2 1 20000 0\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has four numbers `t`, `l`, `r` and `x`. If `t = 1`, add `x` to every cell from `l` to `r`. If `t = 2`, ask about the cells `l` to `r` (`x` is 0).'],
    constraints: ['1 <= n, q <= 20000', '|each cell| <= 10^6, |x| <= 10^6', '1 <= l <= r <= n'],
    slug: 'smallest-in-a-range-and-how-often-it-occurs',
    title: 'The Smallest Number in a Range and How Many Cells Hold It',
    tags: ['segment-tree', 'lazy-propagation', 'range-add', 'minimum-count'],
    concept: {
      title: 'A node stores a pair (minimum, how many times), and two pairs merge by comparing the minima',
      body: [
        'Operations **add a number to every cell of a range**, and questions ask for the **smallest value in a range and how many cells hold it**. For the row `3 1 4 1 5` the smallest value is 1 and it appears twice. After adding 2 to the cells 2 to 4 the row is `3 3 6 3 5`: the smallest is now 3 and it appears three times. Counting by hand after every change is O(n).',
        'Store in every node the pair `(mn, cn)`: the minimum of the block and the number of cells that hold it. Two pairs **merge** like this: the smaller minimum wins and brings its count; if the minima are equal the counts add up. A pending addition of `d` changes the minimum by `d` and does not change the count, because every cell moved by the same amount.',
        { code: 'def pull(node):\n    L, R = 2 * node, 2 * node + 1\n    if mn[L] < mn[R]:   mn[node], cn[node] = mn[L], cn[L]\n    elif mn[L] > mn[R]: mn[node], cn[node] = mn[R], cn[R]\n    else:               mn[node], cn[node] = mn[L], cn[L] + cn[R]\n\ndef bump(node, d): mn[node] += d; lz[node] += d       # the count stays' },
        'A question walks over the O(log n) covering blocks and merges their pairs with the same rule (keep `best_min` and `best_count` in two variables: a smaller minimum replaces both, an equal one adds to the count). The count is at most `n`, the minimum is at most about `2 * 10^10` in size. Every operation costs O(log n).'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `l r x` adds `x` to every number at the positions `l` to `r`; type 2 `l r 0` asks for the smallest number among the positions `l` to `r` and for the count of positions in `l..r` that hold this smallest number. For every question print the two numbers: the smallest value, then its count. Print everything on one line, in order.'],
    outputFormat: ['Print two numbers for every operation of type 2 (the smallest value and how many times it occurs), all separated by spaces.'],
    examples: [{ input: '5 4\n3 1 4 1 5\n2 1 5 0\n1 2 4 2\n2 1 5 0\n2 2 4 0\n', note: 'The row 3 1 4 1 5 has the smallest 1 twice. After adding 2 to the cells 2..4 it is 3 3 6 3 5: the smallest 3 occurs three times in the whole row, and twice in the cells 2..4 (3 6 3): 1 2 3 3 3 2.' }],
    hints: ['Store in each node the minimum of its block and how many cells reach it.', 'When two blocks are merged, the smaller minimum wins; equal minima add their counts.', 'A pending addition changes the minimum of a block but not the count.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][4]'],
      fast: true,
      helpers: {
        python: r`
          INF = 1 << 60
          mn = []
          cn = []
          lz = []
          best = [INF, 0]

          def pull(node):
              left = 2 * node
              right = left + 1
              if mn[left] < mn[right]:
                  mn[node] = mn[left]
                  cn[node] = cn[left]
              elif mn[left] > mn[right]:
                  mn[node] = mn[right]
                  cn[node] = cn[right]
              else:
                  mn[node] = mn[left]
                  cn[node] = cn[left] + cn[right]

          def build(node, l, r, a):
              if l == r:
                  mn[node] = a[l]
                  cn[node] = 1
                  return
              mid = (l + r) // 2
              build(2 * node, l, mid, a)
              build(2 * node + 1, mid + 1, r, a)
              pull(node)

          def bump(node, d):
              mn[node] += d
              lz[node] += d

          def push(node):
              if lz[node] != 0:
                  bump(2 * node, lz[node])
                  bump(2 * node + 1, lz[node])
                  lz[node] = 0

          def add(node, l, r, ql, qr, d):
              if ql <= l and r <= qr:
                  bump(node, d)
                  return
              push(node)
              mid = (l + r) // 2
              if ql <= mid:
                  add(2 * node, l, mid, ql, qr, d)
              if qr > mid:
                  add(2 * node + 1, mid + 1, r, ql, qr, d)
              pull(node)

          def ask(node, l, r, ql, qr):
              if ql <= l and r <= qr:
                  if mn[node] < best[0]:
                      best[0] = mn[node]
                      best[1] = cn[node]
                  elif mn[node] == best[0]:
                      best[1] += cn[node]
                  return
              push(node)
              mid = (l + r) // 2
              if ql <= mid:
                  ask(2 * node, l, mid, ql, qr)
              if qr > mid:
                  ask(2 * node + 1, mid + 1, r, ql, qr)`,
        cpp: r`
          const long long INF = 1LL << 60;
          vector<long long> mn, cn, lz;
          long long bestMin, bestCnt;

          void pull(int node) {
              int left = 2 * node, right = left + 1;
              if (mn[left] < mn[right]) {
                  mn[node] = mn[left];
                  cn[node] = cn[left];
              } else if (mn[left] > mn[right]) {
                  mn[node] = mn[right];
                  cn[node] = cn[right];
              } else {
                  mn[node] = mn[left];
                  cn[node] = cn[left] + cn[right];
              }
          }

          void build(int node, int l, int r, const vector<long long>& a) {
              if (l == r) {
                  mn[node] = a[l];
                  cn[node] = 1;
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              pull(node);
          }

          void bump(int node, long long d) {
              mn[node] += d;
              lz[node] += d;
          }

          void push(int node) {
              if (lz[node] != 0) {
                  bump(2 * node, lz[node]);
                  bump(2 * node + 1, lz[node]);
                  lz[node] = 0;
              }
          }

          void add(int node, int l, int r, int ql, int qr, long long d) {
              if (ql <= l && r <= qr) {
                  bump(node, d);
                  return;
              }
              push(node);
              int mid = (l + r) / 2;
              if (ql <= mid) add(2 * node, l, mid, ql, qr, d);
              if (qr > mid) add(2 * node + 1, mid + 1, r, ql, qr, d);
              pull(node);
          }

          void ask(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) {
                  if (mn[node] < bestMin) {
                      bestMin = mn[node];
                      bestCnt = cn[node];
                  } else if (mn[node] == bestMin) {
                      bestCnt += cn[node];
                  }
                  return;
              }
              push(node);
              int mid = (l + r) / 2;
              if (ql <= mid) ask(2 * node, l, mid, ql, qr);
              if (qr > mid) ask(2 * node + 1, mid + 1, r, ql, qr);
          }`,
        java: r`
          static final long INF = 1L << 60;
          static long[] mn, cn, lz;
          static long bestMin, bestCnt;

          static void pull(int node) {
              int left = 2 * node, right = left + 1;
              if (mn[left] < mn[right]) {
                  mn[node] = mn[left];
                  cn[node] = cn[left];
              } else if (mn[left] > mn[right]) {
                  mn[node] = mn[right];
                  cn[node] = cn[right];
              } else {
                  mn[node] = mn[left];
                  cn[node] = cn[left] + cn[right];
              }
          }

          static void build(int node, int l, int r, long[] a) {
              if (l == r) {
                  mn[node] = a[l];
                  cn[node] = 1;
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              pull(node);
          }

          static void bump(int node, long d) {
              mn[node] += d;
              lz[node] += d;
          }

          static void push(int node) {
              if (lz[node] != 0) {
                  bump(2 * node, lz[node]);
                  bump(2 * node + 1, lz[node]);
                  lz[node] = 0;
              }
          }

          static void add(int node, int l, int r, int ql, int qr, long d) {
              if (ql <= l && r <= qr) {
                  bump(node, d);
                  return;
              }
              push(node);
              int mid = (l + r) / 2;
              if (ql <= mid) add(2 * node, l, mid, ql, qr, d);
              if (qr > mid) add(2 * node + 1, mid + 1, r, ql, qr, d);
              pull(node);
          }

          static void ask(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) {
                  if (mn[node] < bestMin) {
                      bestMin = mn[node];
                      bestCnt = cn[node];
                  } else if (mn[node] == bestMin) {
                      bestCnt += cn[node];
                  }
                  return;
              }
              push(node);
              int mid = (l + r) / 2;
              if (ql <= mid) ask(2 * node, l, mid, ql, qr);
              if (qr > mid) ask(2 * node + 1, mid + 1, r, ql, qr);
          }`
      },
      python: r`
        mn.extend([0] * (4 * n))
        cn.extend([0] * (4 * n))
        lz.extend([0] * (4 * n))
        build(1, 0, n - 1, a)
        out = []
        for kind, l, rr, x in ops:
            if kind == 1:
                add(1, 0, n - 1, l - 1, rr - 1, x)
            else:
                best[0] = INF
                best[1] = 0
                ask(1, 0, n - 1, l - 1, rr - 1)
                out.append(best[0])
                out.append(best[1])
        print(*out)`,
      cpp: r`
        mn.assign(4 * n, 0);
        cn.assign(4 * n, 0);
        lz.assign(4 * n, 0);
        build(1, 0, (int)n - 1, a);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], l = ops[k][1], rr = ops[k][2], x = ops[k][3];
            if (kind == 1) {
                add(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1, x);
            } else {
                bestMin = INF;
                bestCnt = 0;
                ask(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1);
                if (!out.empty()) out += " ";
                out += to_string(bestMin) + " " + to_string(bestCnt);
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn2 = (int) n;
        mn = new long[4 * cn2];
        cn = new long[4 * cn2];
        lz = new long[4 * cn2];
        build(1, 0, cn2 - 1, a);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int l = (int) ops[k][1], rr = (int) ops[k][2];
            long x = ops[k][3];
            if (kind == 1) {
                add(1, 0, cn2 - 1, l - 1, rr - 1, x);
            } else {
                bestMin = INF;
                bestCnt = 0;
                ask(1, 0, cn2 - 1, l - 1, rr - 1);
                if (out.length() > 0) out.append(" ");
                out.append(bestMin).append(" ").append(bestCnt);
            }
        }
        System.out.println(out);`,
      includes: ['<string>', '<vector>']
    },
    solution: { explanation: ['A node keeps the minimum of its block and the number of cells holding it. Merging two blocks keeps the smaller minimum (adding the counts on a tie), and a pending addition shifts the minimum without touching the count.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const mn = new Float64Array(4 * n), cn = new Float64Array(4 * n), lz = new Float64Array(4 * n);
      const pull = (o) => { const L = 2 * o, R = L + 1; if (mn[L] < mn[R]) { mn[o] = mn[L]; cn[o] = cn[L]; } else if (mn[L] > mn[R]) { mn[o] = mn[R]; cn[o] = cn[R]; } else { mn[o] = mn[L]; cn[o] = cn[L] + cn[R]; } };
      const build = (o, l, rr) => { if (l === rr) { mn[o] = a[l]; cn[o] = 1; return; } const m = (l + rr) >> 1; build(2 * o, l, m); build(2 * o + 1, m + 1, rr); pull(o); };
      const bump = (o, d) => { mn[o] += d; lz[o] += d; }; const push = (o) => { if (lz[o]) { bump(2 * o, lz[o]); bump(2 * o + 1, lz[o]); lz[o] = 0; } };
      const add = (o, l, rr, ql, qr, d) => { if (ql <= l && rr <= qr) { bump(o, d); return; } push(o); const m = (l + rr) >> 1; if (ql <= m) add(2 * o, l, m, ql, qr, d); if (qr > m) add(2 * o + 1, m + 1, rr, ql, qr, d); pull(o); };
      let bm = 0, bc = 0; const ask = (o, l, rr, ql, qr) => { if (ql <= l && rr <= qr) { if (mn[o] < bm) { bm = mn[o]; bc = cn[o]; } else if (mn[o] === bm) bc += cn[o]; return; } push(o); const m = (l + rr) >> 1; if (ql <= m) ask(2 * o, l, m, ql, qr); if (qr > m) ask(2 * o + 1, m + 1, rr, ql, qr); };
      build(1, 0, n - 1); const out = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) add(1, 0, n - 1, l - 1, rr - 1, x); else { bm = Infinity; bc = 0; ask(1, 0, n - 1, l - 1, rr - 1); out.push(bm, bc); } } return out.join(' ');
    },
    tests() {
      const g = rng(4905); const out = ['5 4\n3 1 4 1 5\n2 1 5 0\n1 2 4 2\n2 1 5 0\n2 2 4 0\n', '1 2\n8\n2 1 1 0\n1 1 1 -9\n'.replace('1 1 1 -9\n', '2 1 1 0\n')];
      const make = (n, q, hi, pAdd) => { const ops = many(q, () => { const l = randInt(g, 1, n); const rr = randInt(g, l, n); return g() < pAdd ? [1, l, rr, randInt(g, -hi, hi)] : [2, l, rr, 0]; }); ops.push([2, 1, n, 0]); return `${n} ${q + 1}\n${randArray(g, n, -hi, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const res = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) { for (let i = l - 1; i < rr; i++) a[i] += x; } else { const part = a.slice(l - 1, rr); const m = Math.min(...part); res.push(m, part.filter((v) => v === m).length); } } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 14), 3, 0.4), (i) => this.solve(i), brute, 1000);
      for (const [n, q, hi, p] of [[10, 10, 5, 0.4], [100, 100, 10, 0.4], [1000, 1000, 1000000, 0.4], [20000, 19999, 1000000, 0.5], [20000, 19999, 2, 0.5], [20000, 19999, 1000000, 0.8], [19999, 19999, 1, 0.3]]) out.push(make(n, q, hi, p));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has five numbers `t`, `l`, `r`, `b` and `c`. If `t = 1`, every cell `v` from `l` to `r` becomes `(b * v + c) mod 998244353`. If `t = 2`, print the sum of the cells from `l` to `r`, modulo 998244353 (`b` and `c` are 0).'],
    constraints: ['1 <= n, q <= 20000', '0 <= cell, b, c < 998244353', '1 <= l <= r <= n'],
    slug: 'affine-changes-to-a-range-modulo',
    title: 'Multiply and Add on a Range, Then Sum a Range',
    tags: ['segment-tree', 'lazy-propagation', 'affine-tag', 'modular-arithmetic'],
    concept: {
      title: 'A lazy mark is a small function x -> m * x + a, and two marks compose into another function of the same shape',
      body: [
        'Every cell `v` of a range is replaced by **`b * v + c`**, all modulo `998244353`. This covers multiplying (`c = 0`), adding (`b = 1`) and assigning (`b = 0`) at once. For the cells `1 2 3` and the change `b = 2, c = 5` the cells become `7 9 11`. Questions ask for the **sum of a range**, modulo the same prime.',
        'The sum of a block changes in a simple way: if every cell becomes `b * v + c`, then `sum_new = b * sum + c * len`. Waiting changes need a mark that says "every cell below is to be replaced by `mul * v + add`". When a new change `(b, c)` arrives on a block that already waits for `(mul, add)`, the cells first become `mul * v + add` and then `b * (mul * v + add) + c`, so the combined mark is **`(b * mul, b * add + c)`**: again of the form `m * v + a`. The identity mark is `(1, 0)`.',
        { code: 'def tag(node, l, r, b, c):\n    sm[node] = (b * sm[node] + c * (r - l + 1)) % MOD\n    mu[node] = mu[node] * b % MOD                 # compose: first the old mark, then (b, c)\n    ad[node] = (ad[node] * b + c) % MOD\n\ndef push(node, l, r):\n    if mu[node] != 1 or ad[node] != 0:\n        tag(left, ..., mu[node], ad[node]); tag(right, ..., mu[node], ad[node])\n        mu[node] = 1; ad[node] = 0' },
        'The order of the composition matters: the old mark is applied first. Everything is taken modulo the prime, and the products stay below `2^60`, so 64-bit integers are enough. Each operation costs O(log n). The same idea gives any family of changes that is closed under composition.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `l r b c` replaces every number `v` at the positions `l` to `r` by `(b * v + c) mod 998244353`; type 2 `l r 0 0` asks for the sum of the numbers at the positions `l` to `r`, modulo 998244353. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '4 4\n1 2 3 4\n2 1 4 0 0\n1 2 3 2 5\n2 1 4 0 0\n2 2 3 0 0\n', note: 'The sum is 10. The cells 2..3 become 2*2+5 = 9 and 2*3+5 = 11, so the row is 1 9 11 4 with the sum 25, and the cells 2..3 sum to 20: 10 25 20.' }],
    hints: ['A change v -> b * v + c turns the sum of a block into b * sum + c * length.', 'Keep a lazy mark (mul, add) in each node. The identity mark is (1, 0).', 'A new change (b, c) after the mark (mul, add) gives the mark (b * mul, b * add + c).'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][5]'],
      fast: true,
      helpers: {
        python: r`
          MOD = 998244353
          sm = []
          mu = []
          ad = []

          def build(node, l, r, a):
              mu[node] = 1
              if l == r:
                  sm[node] = a[l]
                  return
              mid = (l + r) // 2
              build(2 * node, l, mid, a)
              build(2 * node + 1, mid + 1, r, a)
              sm[node] = (sm[2 * node] + sm[2 * node + 1]) % MOD

          def tag(node, l, r, b, c):
              sm[node] = (b * sm[node] + c * (r - l + 1)) % MOD
              mu[node] = mu[node] * b % MOD
              ad[node] = (ad[node] * b + c) % MOD

          def push(node, l, r):
              if mu[node] != 1 or ad[node] != 0:
                  mid = (l + r) // 2
                  tag(2 * node, l, mid, mu[node], ad[node])
                  tag(2 * node + 1, mid + 1, r, mu[node], ad[node])
                  mu[node] = 1
                  ad[node] = 0

          def change(node, l, r, ql, qr, b, c):
              if ql <= l and r <= qr:
                  tag(node, l, r, b, c)
                  return
              push(node, l, r)
              mid = (l + r) // 2
              if ql <= mid:
                  change(2 * node, l, mid, ql, qr, b, c)
              if qr > mid:
                  change(2 * node + 1, mid + 1, r, ql, qr, b, c)
              sm[node] = (sm[2 * node] + sm[2 * node + 1]) % MOD

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
              return s % MOD`,
        cpp: r`
          const long long MOD = 998244353;
          vector<long long> sm, mu, ad;

          void build(int node, int l, int r, const vector<long long>& a) {
              mu[node] = 1;
              if (l == r) {
                  sm[node] = a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              sm[node] = (sm[2 * node] + sm[2 * node + 1]) % MOD;
          }

          void tag(int node, int l, int r, long long b, long long c) {
              sm[node] = (b * sm[node] + c * (r - l + 1)) % MOD;
              mu[node] = mu[node] * b % MOD;
              ad[node] = (ad[node] * b + c) % MOD;
          }

          void push(int node, int l, int r) {
              if (mu[node] != 1 || ad[node] != 0) {
                  int mid = (l + r) / 2;
                  tag(2 * node, l, mid, mu[node], ad[node]);
                  tag(2 * node + 1, mid + 1, r, mu[node], ad[node]);
                  mu[node] = 1;
                  ad[node] = 0;
              }
          }

          void change(int node, int l, int r, int ql, int qr, long long b, long long c) {
              if (ql <= l && r <= qr) {
                  tag(node, l, r, b, c);
                  return;
              }
              push(node, l, r);
              int mid = (l + r) / 2;
              if (ql <= mid) change(2 * node, l, mid, ql, qr, b, c);
              if (qr > mid) change(2 * node + 1, mid + 1, r, ql, qr, b, c);
              sm[node] = (sm[2 * node] + sm[2 * node + 1]) % MOD;
          }

          long long total(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) return sm[node];
              push(node, l, r);
              int mid = (l + r) / 2;
              long long s = 0;
              if (ql <= mid) s += total(2 * node, l, mid, ql, qr);
              if (qr > mid) s += total(2 * node + 1, mid + 1, r, ql, qr);
              return s % MOD;
          }`,
        java: r`
          static final long MOD = 998244353L;
          static long[] sm, mu, ad;

          static void build(int node, int l, int r, long[] a) {
              mu[node] = 1;
              if (l == r) {
                  sm[node] = a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              sm[node] = (sm[2 * node] + sm[2 * node + 1]) % MOD;
          }

          static void tag(int node, int l, int r, long b, long c) {
              sm[node] = (b * sm[node] + c * (r - l + 1)) % MOD;
              mu[node] = mu[node] * b % MOD;
              ad[node] = (ad[node] * b + c) % MOD;
          }

          static void push(int node, int l, int r) {
              if (mu[node] != 1 || ad[node] != 0) {
                  int mid = (l + r) / 2;
                  tag(2 * node, l, mid, mu[node], ad[node]);
                  tag(2 * node + 1, mid + 1, r, mu[node], ad[node]);
                  mu[node] = 1;
                  ad[node] = 0;
              }
          }

          static void change(int node, int l, int r, int ql, int qr, long b, long c) {
              if (ql <= l && r <= qr) {
                  tag(node, l, r, b, c);
                  return;
              }
              push(node, l, r);
              int mid = (l + r) / 2;
              if (ql <= mid) change(2 * node, l, mid, ql, qr, b, c);
              if (qr > mid) change(2 * node + 1, mid + 1, r, ql, qr, b, c);
              sm[node] = (sm[2 * node] + sm[2 * node + 1]) % MOD;
          }

          static long total(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) return sm[node];
              push(node, l, r);
              int mid = (l + r) / 2;
              long s = 0;
              if (ql <= mid) s += total(2 * node, l, mid, ql, qr);
              if (qr > mid) s += total(2 * node + 1, mid + 1, r, ql, qr);
              return s % MOD;
          }`
      },
      python: r`
        sm.extend([0] * (4 * n))
        mu.extend([1] * (4 * n))
        ad.extend([0] * (4 * n))
        build(1, 0, n - 1, a)
        out = []
        for kind, l, rr, b, c in ops:
            if kind == 1:
                change(1, 0, n - 1, l - 1, rr - 1, b, c)
            else:
                out.append(total(1, 0, n - 1, l - 1, rr - 1))
        print(*out)`,
      cpp: r`
        sm.assign(4 * n, 0);
        mu.assign(4 * n, 1);
        ad.assign(4 * n, 0);
        build(1, 0, (int)n - 1, a);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], l = ops[k][1], rr = ops[k][2], b = ops[k][3], c = ops[k][4];
            if (kind == 1) {
                change(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1, b, c);
            } else {
                if (!out.empty()) out += " ";
                out += to_string(total(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1));
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        sm = new long[4 * cn];
        mu = new long[4 * cn];
        ad = new long[4 * cn];
        Arrays.fill(mu, 1);
        build(1, 0, cn - 1, a);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int l = (int) ops[k][1], rr = (int) ops[k][2];
            long b = ops[k][3], c = ops[k][4];
            if (kind == 1) {
                change(1, 0, cn - 1, l - 1, rr - 1, b, c);
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(total(1, 0, cn - 1, l - 1, rr - 1));
            }
        }
        System.out.println(out);`,
      includes: ['<string>', '<vector>']
    },
    solution: { explanation: ['Each node keeps the block sum and a lazy affine mark (mul, add). A change (b, c) turns the sum into b * sum + c * len and composes with the mark into (b * mul, b * add + c).'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const P = 998244353; const mul = (x, y) => ((x * (y >>> 15)) % P * 32768 + x * (y & 32767)) % P;
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const sm = new Array(4 * n).fill(0), mu = new Array(4 * n).fill(1), ad = new Array(4 * n).fill(0);
      const build = (o, l, rr) => { if (l === rr) { sm[o] = a[l]; return; } const m = (l + rr) >> 1; build(2 * o, l, m); build(2 * o + 1, m + 1, rr); sm[o] = (sm[2 * o] + sm[2 * o + 1]) % P; };
      const tag = (o, l, rr, b, c) => { sm[o] = (mul(b, sm[o]) + mul(c, rr - l + 1)) % P; mu[o] = mul(mu[o], b); ad[o] = (mul(ad[o], b) + c) % P; };
      const push = (o, l, rr) => { if (mu[o] !== 1 || ad[o] !== 0) { const m = (l + rr) >> 1; tag(2 * o, l, m, mu[o], ad[o]); tag(2 * o + 1, m + 1, rr, mu[o], ad[o]); mu[o] = 1; ad[o] = 0; } };
      const change = (o, l, rr, ql, qr, b, c) => { if (ql <= l && rr <= qr) { tag(o, l, rr, b, c); return; } push(o, l, rr); const m = (l + rr) >> 1; if (ql <= m) change(2 * o, l, m, ql, qr, b, c); if (qr > m) change(2 * o + 1, m + 1, rr, ql, qr, b, c); sm[o] = (sm[2 * o] + sm[2 * o + 1]) % P; };
      const total = (o, l, rr, ql, qr) => { if (ql <= l && rr <= qr) return sm[o]; push(o, l, rr); const m = (l + rr) >> 1; let s = 0; if (ql <= m) s += total(2 * o, l, m, ql, qr); if (qr > m) s += total(2 * o + 1, m + 1, rr, ql, qr); return s % P; };
      build(1, 0, n - 1); const out = []; for (let k = 0; k < q; k++) { const [t, l, rr, b, c] = nums(rs[2 + k]); if (t === 1) change(1, 0, n - 1, l - 1, rr - 1, b, c); else out.push(total(1, 0, n - 1, l - 1, rr - 1)); } return out.join(' ');
    },
    tests() {
      const P = 998244353; const mul = (x, y) => ((x * (y >>> 15)) % P * 32768 + x * (y & 32767)) % P;
      const g = rng(4906); const out = ['4 4\n1 2 3 4\n2 1 4 0 0\n1 2 3 2 5\n2 1 4 0 0\n2 2 3 0 0\n', '1 2\n5\n2 1 1 0 0\n2 1 1 0 0\n'];
      const make = (n, q, pSpecial) => { const pick = () => { const roll = g(); if (roll < pSpecial / 3) return [1, randInt(g, 0, P - 1)]; if (roll < 2 * pSpecial / 3) return [randInt(g, 0, P - 1), 0]; if (roll < pSpecial) return [0, randInt(g, 0, P - 1)]; return [randInt(g, 0, P - 1), randInt(g, 0, P - 1)]; }; const ops = many(q, () => { const l = randInt(g, 1, n); const rr = randInt(g, l, n); if (g() < 0.55) { const [b, c] = pick(); return [1, l, rr, b, c]; } return [2, l, rr, 0, 0]; }); ops.push([2, 1, n, 0, 0]); return `${n} ${q + 1}\n${randArray(g, n, 0, P - 1).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const res = []; for (let k = 0; k < q; k++) { const [t, l, rr, b, c] = nums(rs[2 + k]); if (t === 1) { for (let i = l - 1; i < rr; i++) a[i] = (mul(b, a[i]) + c) % P; } else { let s = 0; for (let i = l - 1; i < rr; i++) s = (s + a[i]) % P; res.push(s); } } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 14), 0.5), (i) => this.solve(i), brute, 1000);
      for (const [n, q, p] of [[10, 10, 0.5], [100, 100, 0.3], [1000, 1000, 0.3], [20000, 19999, 0.3], [20000, 19999, 0.9], [20000, 19999, 0], [19999, 19999, 0.6]]) out.push(make(n, q, p));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has four numbers `t`, `l`, `r` and `x`. If `t = 1`, every cell from `l` to `r` that is larger than `x` becomes `x`. If `t = 2`, print the sum of the cells from `l` to `r` (`x` is 0).'],
    constraints: ['1 <= n, q <= 20000', '0 <= cell, x <= 10^9', '1 <= l <= r <= n'],
    slug: 'cap-a-range-and-sum-a-range',
    title: 'Cap the Numbers of a Range, Then Sum a Range',
    tags: ['segment-tree', 'segment-tree-beats', 'range-chmin', 'amortized-analysis'],
    concept: {
      title: 'Segment tree beats: keep the largest and the second largest value of a block, and cap the whole block at once when only the largest ones change',
      body: [
        'An operation **caps** a range: every cell larger than `x` becomes `x` (a "range minimum with `x`"). Questions ask for the **sum of a range**. For `5 1 9 3 7` the cap 4 on the cells 2 to 4 gives `5 1 4 3 7`. A cap does not change every cell by the same amount, so a plain lazy mark cannot describe it: it changes only the cells above `x`, and by different amounts.',
        'Store in each node `mx` (the largest value of the block), `se` (the largest value **strictly smaller** than `mx`) and `cm` (how many cells equal `mx`), besides the sum. Capping a block at `x` has three cases. If `mx <= x`, nothing changes: return. If `se < x < mx`, only the cells equal to `mx` change, all of them to `x`, so the sum drops by `(mx - x) * cm` and `mx` becomes `x`: this is a **tag** that is done in O(1) without looking inside. Otherwise (`x <= se`) go down into both children.',
        { code: 'def cap(node, l, r, ql, qr, x):\n    if mx[node] <= x: return                        # nothing is above x\n    if ql <= l and r <= qr and se[node] < x:        # only the maximum cells change\n        sm[node] -= (mx[node] - x) * cm[node]; mx[node] = x; return\n    push(node)                                      # give the children the cap mx[node]\n    ...recurse into the children that intersect the range; pull(node)' },
        'The push-down passes the cap `mx[node]` to a child whose own `mx` is larger. The third case looks dangerous, but each time we go down because of it, at least two different values in the block merge into one, which can happen only O(n log n) times in total. Together with the O(log n) cost of the cut, the whole sequence of operations takes about O((n + q) log n) steps (amortised).'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `l r x` replaces every number at the positions `l` to `r` that is larger than `x` by `x`; type 2 `l r 0` asks for the sum of the numbers at the positions `l` to `r`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '5 4\n5 1 9 3 7\n2 1 5 0\n1 2 4 4\n2 1 5 0\n2 3 5 0\n', note: 'The sum is 25. Capping the cells 2..4 at 4 gives 5 1 4 3 7 with the sum 20, and the cells 3..5 sum to 4 + 3 + 7 = 14: 25 20 14.' }],
    hints: ['A cap changes only the cells above x, so store the maximum of a block, how many cells hold it, and the second largest value.', 'If the second largest value is below x, only the cells that equal the maximum change, and the sum drops by (max - x) times their count.', 'Otherwise recurse into the children. Each such recursion merges different values, which can only happen a limited number of times.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][4]'],
      fast: true,
      helpers: {
        python: r`
          mx = []
          se = []
          cm = []
          sm = []

          def pull(node):
              left = 2 * node
              right = left + 1
              sm[node] = sm[left] + sm[right]
              if mx[left] > mx[right]:
                  mx[node] = mx[left]
                  cm[node] = cm[left]
                  se[node] = max(se[left], mx[right])
              elif mx[left] < mx[right]:
                  mx[node] = mx[right]
                  cm[node] = cm[right]
                  se[node] = max(mx[left], se[right])
              else:
                  mx[node] = mx[left]
                  cm[node] = cm[left] + cm[right]
                  se[node] = max(se[left], se[right])

          def build(node, l, r, a):
              if l == r:
                  mx[node] = a[l]
                  se[node] = -1
                  cm[node] = 1
                  sm[node] = a[l]
                  return
              mid = (l + r) // 2
              build(2 * node, l, mid, a)
              build(2 * node + 1, mid + 1, r, a)
              pull(node)

          def lower(node, x):
              sm[node] -= (mx[node] - x) * cm[node]
              mx[node] = x

          def push(node):
              for child in (2 * node, 2 * node + 1):
                  if mx[child] > mx[node]:
                      lower(child, mx[node])

          def cap(node, l, r, ql, qr, x):
              if mx[node] <= x:
                  return
              if ql <= l and r <= qr and se[node] < x:
                  lower(node, x)
                  return
              push(node)
              mid = (l + r) // 2
              if ql <= mid:
                  cap(2 * node, l, mid, ql, qr, x)
              if qr > mid:
                  cap(2 * node + 1, mid + 1, r, ql, qr, x)
              pull(node)

          def total(node, l, r, ql, qr):
              if ql <= l and r <= qr:
                  return sm[node]
              push(node)
              mid = (l + r) // 2
              s = 0
              if ql <= mid:
                  s += total(2 * node, l, mid, ql, qr)
              if qr > mid:
                  s += total(2 * node + 1, mid + 1, r, ql, qr)
              return s`,
        cpp: r`
          vector<long long> mx, se, cm, sm;

          void pull(int node) {
              int left = 2 * node, right = left + 1;
              sm[node] = sm[left] + sm[right];
              if (mx[left] > mx[right]) {
                  mx[node] = mx[left];
                  cm[node] = cm[left];
                  se[node] = max(se[left], mx[right]);
              } else if (mx[left] < mx[right]) {
                  mx[node] = mx[right];
                  cm[node] = cm[right];
                  se[node] = max(mx[left], se[right]);
              } else {
                  mx[node] = mx[left];
                  cm[node] = cm[left] + cm[right];
                  se[node] = max(se[left], se[right]);
              }
          }

          void build(int node, int l, int r, const vector<long long>& a) {
              if (l == r) {
                  mx[node] = a[l];
                  se[node] = -1;
                  cm[node] = 1;
                  sm[node] = a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              pull(node);
          }

          void lower(int node, long long x) {
              sm[node] -= (mx[node] - x) * cm[node];
              mx[node] = x;
          }

          void push(int node) {
              for (int child = 2 * node; child <= 2 * node + 1; child++) {
                  if (mx[child] > mx[node]) lower(child, mx[node]);
              }
          }

          void cap(int node, int l, int r, int ql, int qr, long long x) {
              if (mx[node] <= x) return;
              if (ql <= l && r <= qr && se[node] < x) {
                  lower(node, x);
                  return;
              }
              push(node);
              int mid = (l + r) / 2;
              if (ql <= mid) cap(2 * node, l, mid, ql, qr, x);
              if (qr > mid) cap(2 * node + 1, mid + 1, r, ql, qr, x);
              pull(node);
          }

          long long total(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) return sm[node];
              push(node);
              int mid = (l + r) / 2;
              long long s = 0;
              if (ql <= mid) s += total(2 * node, l, mid, ql, qr);
              if (qr > mid) s += total(2 * node + 1, mid + 1, r, ql, qr);
              return s;
          }`,
        java: r`
          static long[] mx, se, cm, sm;

          static void pull(int node) {
              int left = 2 * node, right = left + 1;
              sm[node] = sm[left] + sm[right];
              if (mx[left] > mx[right]) {
                  mx[node] = mx[left];
                  cm[node] = cm[left];
                  se[node] = Math.max(se[left], mx[right]);
              } else if (mx[left] < mx[right]) {
                  mx[node] = mx[right];
                  cm[node] = cm[right];
                  se[node] = Math.max(mx[left], se[right]);
              } else {
                  mx[node] = mx[left];
                  cm[node] = cm[left] + cm[right];
                  se[node] = Math.max(se[left], se[right]);
              }
          }

          static void build(int node, int l, int r, long[] a) {
              if (l == r) {
                  mx[node] = a[l];
                  se[node] = -1;
                  cm[node] = 1;
                  sm[node] = a[l];
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, a);
              build(2 * node + 1, mid + 1, r, a);
              pull(node);
          }

          static void lower(int node, long x) {
              sm[node] -= (mx[node] - x) * cm[node];
              mx[node] = x;
          }

          static void push(int node) {
              for (int child = 2 * node; child <= 2 * node + 1; child++) {
                  if (mx[child] > mx[node]) lower(child, mx[node]);
              }
          }

          static void cap(int node, int l, int r, int ql, int qr, long x) {
              if (mx[node] <= x) return;
              if (ql <= l && r <= qr && se[node] < x) {
                  lower(node, x);
                  return;
              }
              push(node);
              int mid = (l + r) / 2;
              if (ql <= mid) cap(2 * node, l, mid, ql, qr, x);
              if (qr > mid) cap(2 * node + 1, mid + 1, r, ql, qr, x);
              pull(node);
          }

          static long total(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) return sm[node];
              push(node);
              int mid = (l + r) / 2;
              long s = 0;
              if (ql <= mid) s += total(2 * node, l, mid, ql, qr);
              if (qr > mid) s += total(2 * node + 1, mid + 1, r, ql, qr);
              return s;
          }`
      },
      python: r`
        mx.extend([0] * (4 * n))
        se.extend([-1] * (4 * n))
        cm.extend([0] * (4 * n))
        sm.extend([0] * (4 * n))
        build(1, 0, n - 1, a)
        out = []
        for kind, l, rr, x in ops:
            if kind == 1:
                cap(1, 0, n - 1, l - 1, rr - 1, x)
            else:
                out.append(total(1, 0, n - 1, l - 1, rr - 1))
        print(*out)`,
      cpp: r`
        mx.assign(4 * n, 0);
        se.assign(4 * n, -1);
        cm.assign(4 * n, 0);
        sm.assign(4 * n, 0);
        build(1, 0, (int)n - 1, a);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], l = ops[k][1], rr = ops[k][2], x = ops[k][3];
            if (kind == 1) {
                cap(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1, x);
            } else {
                if (!out.empty()) out += " ";
                out += to_string(total(1, 0, (int)n - 1, (int)l - 1, (int)rr - 1));
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        mx = new long[4 * cn];
        se = new long[4 * cn];
        cm = new long[4 * cn];
        sm = new long[4 * cn];
        Arrays.fill(se, -1);
        build(1, 0, cn - 1, a);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int l = (int) ops[k][1], rr = (int) ops[k][2];
            long x = ops[k][3];
            if (kind == 1) {
                cap(1, 0, cn - 1, l - 1, rr - 1, x);
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(total(1, 0, cn - 1, l - 1, rr - 1));
            }
        }
        System.out.println(out);`,
      includes: ['<string>', '<vector>', '<algorithm>']
    },
    solution: { explanation: ['Every node keeps the sum, the maximum, how many cells hold it and the second largest value. A cap that only reaches the maximum cells is a tag in O(1); otherwise the recursion goes down, which can merge different values only a limited number of times (segment tree beats).'], complexity: 'Amortised time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const mx = new Float64Array(4 * n), se = new Float64Array(4 * n).fill(-1), cm = new Float64Array(4 * n), sm = new Float64Array(4 * n);
      const pull = (o) => { const L = 2 * o, R = L + 1; sm[o] = sm[L] + sm[R]; if (mx[L] > mx[R]) { mx[o] = mx[L]; cm[o] = cm[L]; se[o] = Math.max(se[L], mx[R]); } else if (mx[L] < mx[R]) { mx[o] = mx[R]; cm[o] = cm[R]; se[o] = Math.max(mx[L], se[R]); } else { mx[o] = mx[L]; cm[o] = cm[L] + cm[R]; se[o] = Math.max(se[L], se[R]); } };
      const build = (o, l, rr) => { if (l === rr) { mx[o] = a[l]; cm[o] = 1; sm[o] = a[l]; return; } const m = (l + rr) >> 1; build(2 * o, l, m); build(2 * o + 1, m + 1, rr); pull(o); };
      const lower = (o, x) => { sm[o] -= (mx[o] - x) * cm[o]; mx[o] = x; };
      const push = (o) => { for (const c of [2 * o, 2 * o + 1]) if (mx[c] > mx[o]) lower(c, mx[o]); };
      const cap = (o, l, rr, ql, qr, x) => { if (mx[o] <= x) return; if (ql <= l && rr <= qr && se[o] < x) { lower(o, x); return; } push(o); const m = (l + rr) >> 1; if (ql <= m) cap(2 * o, l, m, ql, qr, x); if (qr > m) cap(2 * o + 1, m + 1, rr, ql, qr, x); pull(o); };
      const total = (o, l, rr, ql, qr) => { if (ql <= l && rr <= qr) return sm[o]; push(o); const m = (l + rr) >> 1; let s = 0; if (ql <= m) s += total(2 * o, l, m, ql, qr); if (qr > m) s += total(2 * o + 1, m + 1, rr, ql, qr); return s; };
      build(1, 0, n - 1); const out = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) cap(1, 0, n - 1, l - 1, rr - 1, x); else out.push(total(1, 0, n - 1, l - 1, rr - 1)); } return out.join(' ');
    },
    tests() {
      const g = rng(4907); const out = ['5 4\n5 1 9 3 7\n2 1 5 0\n1 2 4 4\n2 1 5 0\n2 3 5 0\n', '1 3\n0\n1 1 1 0\n2 1 1 0\n2 1 1 0\n'];
      const make = (n, q, hi, trend) => { const ops = many(q, (i) => { const l = randInt(g, 1, n); const rr = randInt(g, l, n); if (g() < 0.5) { const x = g() < trend ? Math.max(0, Math.floor(hi * (1 - i / q)) + randInt(g, -Math.floor(hi / 50), Math.floor(hi / 50))) : randInt(g, 0, hi); return [1, l, rr, x]; } return [2, l, rr, 0]; }); ops.push([2, 1, n, 0]); return `${n} ${q + 1}\n${randArray(g, n, 0, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const res = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) { for (let i = l - 1; i < rr; i++) if (a[i] > x) a[i] = x; } else res.push(a.slice(l - 1, rr).reduce((s, v) => s + v, 0)); } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 14), 6, 0.3), (i) => this.solve(i), brute, 1000);
      for (const [n, q, hi, tr] of [[10, 10, 20, 0.5], [100, 100, 100, 0.5], [1000, 1000, 1000000000, 0.5], [20000, 19999, 1000000000, 0.9], [20000, 19999, 1000000000, 0], [20000, 19999, 5, 0.5], [19999, 19999, 1000000000, 0.5]]) out.push(make(n, q, hi, tr));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the length of the bracket string and the number of operations.', 'The second line has the string of `n` characters `(` and `)`.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, flip the character at the position `x` (an opening bracket becomes a closing one and the other way round; `y` is 0). If `t = 2`, ask about the part of the string from `x` to `y`.'],
    constraints: ['1 <= n, q <= 40000', 'The string contains only ( and ).', '1 <= x <= y <= n in a question.'],
    slug: 'repair-brackets-in-a-part-of-the-string',
    title: 'The Fewest Flips to Balance a Part of the String',
    tags: ['segment-tree', 'brackets', 'point-update', 'ordered-merge'],
    concept: {
      title: 'Cancel matching pairs inside each block: what is left is some closing brackets followed by some opening brackets',
      body: [
        'A string of brackets is **balanced** when every opening bracket has a closing one after it, and nothing is left over. Flipping a bracket turns `(` into `)` or back. For a part of the string, what is the **fewest number of flips** that makes it balanced? For `)))(((` the answer is 4. If the length of the part is odd, it is impossible: print `-1`.',
        'Cancel every neighbouring pair `()` again and again. Whatever is left has the form `)))...(((`: `c` closing brackets followed by `o` opening ones. This pair `(c, o)` is a complete summary of a block, and two blocks **merge** in order: the `o` opening brackets of the left block cancel with the `c` closing brackets of the right one, `m = min(left.o, right.c)` pairs disappear, and the result is `(left.c + right.c - m, left.o + right.o - m)`. With `c + o` even, it takes `ceil(c / 2) + ceil(o / 2)` flips to repair what is left: flip half of the closing ones to opening (rounding up) and half of the opening ones to closing.',
        { code: 'def merge(L, R):\n    m = min(L.o, R.c)\n    return (L.c + R.c - m, L.o + R.o - m)\n\nanswer = (c + 1) // 2 + (o + 1) // 2        # for a part of even length\n# flipping one character just swaps (c, o) at its leaf: (0, 1) <-> (1, 0)' },
        'The merge is not symmetric, so the blocks of a question must be combined **from left to right**: keep an accumulator `(c, o)` and a recursive walk that visits the left child first. A flip changes one leaf and the nodes above it. Everything costs O(log n) per operation.'
      ]
    },
    statement: ['A string of `n` brackets is given. Process `q` operations: type 1 `x 0` flips the bracket at the position `x`; type 2 `x y` asks for the fewest flips needed to make the part of the string from the position `x` to the position `y` a balanced bracket sequence (the rest of the string is ignored). If the length of the part is odd, the answer is -1. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '6 3\n)))(((\n2 1 6\n1 1 0\n2 1 6\n', note: 'The string `)))(((` needs 4 flips (for example to `(()())` with a different pair of positions). After flipping the first bracket it is `())(((`, which needs 3 flips: 4 3.' }],
    hints: ['Cancel matching pairs inside a block; what remains is some closing brackets followed by some opening brackets.', 'Two blocks merge from left to right: min(left.o, right.c) pairs cancel.', 'For a part of even length with c closing and o opening brackets left, the answer is ceil(c / 2) + ceil(o / 2).'],
    program: {
      io: ['n:int q:int', 's:word', 'ops:int[q][3]'],
      fast: true,
      helpers: {
        python: r`
          cc = []
          oo = []
          acc = [0, 0]

          def pull(node):
              left = 2 * node
              right = left + 1
              m = min(oo[left], cc[right])
              cc[node] = cc[left] + cc[right] - m
              oo[node] = oo[left] + oo[right] - m

          def build(node, l, r, s):
              if l == r:
                  if s[l] == '(':
                      oo[node] = 1
                  else:
                      cc[node] = 1
                  return
              mid = (l + r) // 2
              build(2 * node, l, mid, s)
              build(2 * node + 1, mid + 1, r, s)
              pull(node)

          def flip(node, l, r, p):
              if l == r:
                  cc[node], oo[node] = oo[node], cc[node]
                  return
              mid = (l + r) // 2
              if p <= mid:
                  flip(2 * node, l, mid, p)
              else:
                  flip(2 * node + 1, mid + 1, r, p)
              pull(node)

          def walk(node, l, r, ql, qr):
              if ql <= l and r <= qr:
                  m = min(acc[1], cc[node])
                  acc[0] += cc[node] - m
                  acc[1] += oo[node] - m
                  return
              mid = (l + r) // 2
              if ql <= mid:
                  walk(2 * node, l, mid, ql, qr)
              if qr > mid:
                  walk(2 * node + 1, mid + 1, r, ql, qr)`,
        cpp: r`
          vector<long long> cc, oo;
          long long accC, accO;

          void pull(int node) {
              int left = 2 * node, right = left + 1;
              long long m = min(oo[left], cc[right]);
              cc[node] = cc[left] + cc[right] - m;
              oo[node] = oo[left] + oo[right] - m;
          }

          void build(int node, int l, int r, const string& s) {
              if (l == r) {
                  if (s[l] == '(') oo[node] = 1;
                  else cc[node] = 1;
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, s);
              build(2 * node + 1, mid + 1, r, s);
              pull(node);
          }

          void flip(int node, int l, int r, int p) {
              if (l == r) {
                  swap(cc[node], oo[node]);
                  return;
              }
              int mid = (l + r) / 2;
              if (p <= mid) flip(2 * node, l, mid, p);
              else flip(2 * node + 1, mid + 1, r, p);
              pull(node);
          }

          void walk(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) {
                  long long m = min(accO, cc[node]);
                  accC += cc[node] - m;
                  accO += oo[node] - m;
                  return;
              }
              int mid = (l + r) / 2;
              if (ql <= mid) walk(2 * node, l, mid, ql, qr);
              if (qr > mid) walk(2 * node + 1, mid + 1, r, ql, qr);
          }`,
        java: r`
          static long[] cc, oo;
          static long accC, accO;

          static void pull(int node) {
              int left = 2 * node, right = left + 1;
              long m = Math.min(oo[left], cc[right]);
              cc[node] = cc[left] + cc[right] - m;
              oo[node] = oo[left] + oo[right] - m;
          }

          static void build(int node, int l, int r, String s) {
              if (l == r) {
                  if (s.charAt(l) == '(') oo[node] = 1;
                  else cc[node] = 1;
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, s);
              build(2 * node + 1, mid + 1, r, s);
              pull(node);
          }

          static void flip(int node, int l, int r, int p) {
              if (l == r) {
                  long t = cc[node];
                  cc[node] = oo[node];
                  oo[node] = t;
                  return;
              }
              int mid = (l + r) / 2;
              if (p <= mid) flip(2 * node, l, mid, p);
              else flip(2 * node + 1, mid + 1, r, p);
              pull(node);
          }

          static void walk(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) {
                  long m = Math.min(accO, cc[node]);
                  accC += cc[node] - m;
                  accO += oo[node] - m;
                  return;
              }
              int mid = (l + r) / 2;
              if (ql <= mid) walk(2 * node, l, mid, ql, qr);
              if (qr > mid) walk(2 * node + 1, mid + 1, r, ql, qr);
          }`
      },
      python: r`
        cc.extend([0] * (4 * n))
        oo.extend([0] * (4 * n))
        build(1, 0, n - 1, s)
        out = []
        for kind, x, y in ops:
            if kind == 1:
                flip(1, 0, n - 1, x - 1)
            elif (y - x + 1) % 2 == 1:
                out.append(-1)
            else:
                acc[0] = 0
                acc[1] = 0
                walk(1, 0, n - 1, x - 1, y - 1)
                out.append((acc[0] + 1) // 2 + (acc[1] + 1) // 2)
        print(*out)`,
      cpp: r`
        cc.assign(4 * n, 0);
        oo.assign(4 * n, 0);
        build(1, 0, (int)n - 1, s);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][1], y = ops[k][2];
            if (kind == 1) {
                flip(1, 0, (int)n - 1, (int)x - 1);
            } else {
                if (!out.empty()) out += " ";
                if ((y - x + 1) % 2 == 1) {
                    out += "-1";
                } else {
                    accC = 0;
                    accO = 0;
                    walk(1, 0, (int)n - 1, (int)x - 1, (int)y - 1);
                    out += to_string((accC + 1) / 2 + (accO + 1) / 2);
                }
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        cc = new long[4 * cn];
        oo = new long[4 * cn];
        build(1, 0, cn - 1, s);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int x = (int) ops[k][1], y = (int) ops[k][2];
            if (kind == 1) {
                flip(1, 0, cn - 1, x - 1);
            } else {
                if (out.length() > 0) out.append(" ");
                if ((y - x + 1) % 2 == 1) {
                    out.append(-1);
                } else {
                    accC = 0;
                    accO = 0;
                    walk(1, 0, cn - 1, x - 1, y - 1);
                    out.append((accC + 1) / 2 + (accO + 1) / 2);
                }
            }
        }
        System.out.println(out);`,
      includes: ['<string>', '<vector>', '<algorithm>']
    },
    solution: { explanation: ['After cancelling matching pairs, a block is summarised by c closing brackets followed by o opening ones. Blocks merge from left to right, a flip swaps c and o at a leaf, and an even-length part needs ceil(c / 2) + ceil(o / 2) flips.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const s = rs[1]; const cc = new Int32Array(4 * n), oo = new Int32Array(4 * n);
      const pull = (o) => { const L = 2 * o, R = L + 1; const m = Math.min(oo[L], cc[R]); cc[o] = cc[L] + cc[R] - m; oo[o] = oo[L] + oo[R] - m; };
      const build = (o, l, rr) => { if (l === rr) { if (s[l] === '(') oo[o] = 1; else cc[o] = 1; return; } const m = (l + rr) >> 1; build(2 * o, l, m); build(2 * o + 1, m + 1, rr); pull(o); };
      const flip = (o, l, rr, p) => { if (l === rr) { const t = cc[o]; cc[o] = oo[o]; oo[o] = t; return; } const m = (l + rr) >> 1; if (p <= m) flip(2 * o, l, m, p); else flip(2 * o + 1, m + 1, rr, p); pull(o); };
      let ac = 0, ao = 0; const walk = (o, l, rr, ql, qr) => { if (ql <= l && rr <= qr) { const m = Math.min(ao, cc[o]); ac += cc[o] - m; ao += oo[o] - m; return; } const m = (l + rr) >> 1; if (ql <= m) walk(2 * o, l, m, ql, qr); if (qr > m) walk(2 * o + 1, m + 1, rr, ql, qr); };
      build(1, 0, n - 1); const out = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) flip(1, 0, n - 1, x - 1); else if ((y - x + 1) % 2 === 1) out.push(-1); else { ac = 0; ao = 0; walk(1, 0, n - 1, x - 1, y - 1); out.push(Math.floor((ac + 1) / 2) + Math.floor((ao + 1) / 2)); } } return out.join(' ');
    },
    tests() {
      const g = rng(4908); const out = ['6 3\n)))(((\n2 1 6\n1 1 0\n2 1 6\n', '2 2\n()\n2 1 2\n2 1 1\n'];
      const randString = (n, pOpen) => many(n, () => (g() < pOpen ? '(' : ')')).join('');
      const make = (n, q, pOpen, pFlip) => { const ops = many(q, () => { if (g() < pFlip) return [1, randInt(g, 1, n), 0]; const x = randInt(g, 1, n); let y = randInt(g, x, n); if (g() < 0.8 && (y - x + 1) % 2 === 1) y = y < n ? y + 1 : y - 1; if (y < x) y = x; return [2, x, y]; }); ops.push([2, 1, Math.max(1, n - (n % 2))]); return `${n} ${q + 1}\n${randString(n, pOpen)}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const s = rs[1].split(''); const res = []; for (let k = 0; k < q; k++) { const [t, x, y] = nums(rs[2 + k]); if (t === 1) s[x - 1] = s[x - 1] === '(' ? ')' : '('; else { const len = y - x + 1; if (len % 2) { res.push(-1); continue; } const part = s.slice(x - 1, y); const INF = 1e9; let dp = new Array(len + 2).fill(INF); dp[0] = 0; for (const ch of part) { const nx = new Array(len + 2).fill(INF); for (let b = 0; b <= len; b++) { if (dp[b] === INF) continue; if (b + 1 <= len) nx[b + 1] = Math.min(nx[b + 1], dp[b] + (ch === '(' ? 0 : 1)); if (b > 0) nx[b - 1] = Math.min(nx[b - 1], dp[b] + (ch === ')' ? 0 : 1)); } dp = nx; } res.push(dp[0]); } } return res.join(' '); }; // dp over the balance, cost of every flip
      crossCheck(() => make(randInt(g, 2, 12), randInt(g, 1, 12), 0.5, 0.3), (i) => this.solve(i), brute, 1000);
      for (const [n, q, po, pf] of [[10, 10, 0.5, 0.3], [100, 100, 0.5, 0.3], [1000, 1000, 0.5, 0.3], [40000, 39999, 0.5, 0.3], [40000, 39999, 0.9, 0.2], [40000, 39999, 0.1, 0.5], [39999, 39999, 0.5, 0.1]]) out.push(make(n, q, po, pf));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the number of buildings and the number of changes.', 'The second line has `n` numbers: the heights of the buildings from left to right.', 'Each of the next `q` lines has two numbers `p` and `v`: the building number `p` gets the new height `v`.'],
    constraints: ['1 <= n, q <= 20000', '1 <= height, v <= 10^9', '1 <= p <= n'],
    slug: 'skyline-seen-from-the-left-after-changes',
    title: 'How Many Buildings Can You See From the Left After Each Change?',
    tags: ['segment-tree', 'prefix-maximum', 'sqrt-log-trick', 'point-update'],
    concept: {
      title: 'A node answers "how many prefix maxima" for any starting level by descending only into one child',
      body: [
        'Buildings stand in a row. Looking from the left, a building is **visible** if it is strictly taller than all the buildings before it. For the heights `3 6 4 1 5` the visible ones are `3` and `6`: the answer is 2. After each change of one height, print how many buildings are visible. Recounting the prefix maxima costs O(n) after each change.',
        'A segment tree can store at each node `mx` (the tallest in its block) and `ct` (the number of visible buildings **inside the block** when it is seen alone). Two blocks do not combine by adding, because the right block is partly hidden by the tall buildings of the left one. Define `calc(node, m)`: the number of buildings of the block that are visible when everything to the left is as tall as `m`. If `mx[node] <= m` the answer is 0; for a leaf it is 1. Otherwise look at the left child: if its maximum is not above `m`, the whole left child is hidden, so answer with the right child alone. If it is above `m`, the right child sees only the level `mx[left]`, and that is exactly what the node stored: `calc(left, m) + (ct[node] - ct[left])`.',
        { code: 'def calc(node, l, r, m):\n    if mx[node] <= m: return 0\n    if l == r: return 1\n    if mx[left] <= m: return calc(right, ..., m)            # the left child is hidden\n    return calc(left, ..., m) + ct[node] - ct[left]         # the right part is already stored\n\ndef pull(node):\n    mx[node] = max(mx[left], mx[right])\n    ct[node] = ct[left] + calc(right, ..., mx[left])' },
        'Each call of `calc` follows one path, so it costs O(log n), and `pull` runs on the O(log n) nodes above a changed leaf: O(log^2 n) per change. The answer after a change is `ct[root]`. This is the classic trick for questions that look "non-mergeable" but can be answered by one descent.'
      ]
    },
    statement: ['`n` buildings stand in a row, and the building number `i` has the height `h[i]`. A building is visible from the left if it is strictly taller than every building before it (the first building is always visible). Process `q` changes: each change sets the height of the building `p` to `v`. After every change print the number of visible buildings. Print the answers on one line.'],
    outputFormat: ['Print `q` numbers separated by spaces: the number of visible buildings after each change.'],
    examples: [{ input: '5 3\n3 1 4 1 5\n2 6\n5 2\n1 9\n', note: 'After the first change the heights are 3 6 4 1 5: the visible ones are 3 and 6. After the second, 3 6 4 1 2: again 3 and 6. After the third, 9 6 4 1 2: only 9: 2 2 1.' }],
    hints: ['Seen from the left, a building is visible if it is a strict prefix maximum.', 'Store in every node its maximum and the number of visible buildings inside the block alone.', 'To merge, count with one descent how many buildings of the right block are taller than the maximum of the left block.'],
    program: {
      io: ['n:int q:int', 'h:int[n]', 'ups:int[q][2]'],
      fast: true,
      helpers: {
        python: r`
          mx = []
          ct = []

          def calc(node, l, r, m):
              if mx[node] <= m:
                  return 0
              if l == r:
                  return 1
              mid = (l + r) // 2
              if mx[2 * node] <= m:
                  return calc(2 * node + 1, mid + 1, r, m)
              return calc(2 * node, l, mid, m) + ct[node] - ct[2 * node]

          def pull(node, l, r):
              mid = (l + r) // 2
              mx[node] = max(mx[2 * node], mx[2 * node + 1])
              ct[node] = ct[2 * node] + calc(2 * node + 1, mid + 1, r, mx[2 * node])

          def build(node, l, r, h):
              if l == r:
                  mx[node] = h[l]
                  ct[node] = 1
                  return
              mid = (l + r) // 2
              build(2 * node, l, mid, h)
              build(2 * node + 1, mid + 1, r, h)
              pull(node, l, r)

          def change(node, l, r, p, v):
              if l == r:
                  mx[node] = v
                  return
              mid = (l + r) // 2
              if p <= mid:
                  change(2 * node, l, mid, p, v)
              else:
                  change(2 * node + 1, mid + 1, r, p, v)
              pull(node, l, r)`,
        cpp: r`
          vector<long long> mx, ct;

          long long calc(int node, int l, int r, long long m) {
              if (mx[node] <= m) return 0;
              if (l == r) return 1;
              int mid = (l + r) / 2;
              if (mx[2 * node] <= m) return calc(2 * node + 1, mid + 1, r, m);
              return calc(2 * node, l, mid, m) + ct[node] - ct[2 * node];
          }

          void pull(int node, int l, int r) {
              int mid = (l + r) / 2;
              mx[node] = max(mx[2 * node], mx[2 * node + 1]);
              ct[node] = ct[2 * node] + calc(2 * node + 1, mid + 1, r, mx[2 * node]);
          }

          void build(int node, int l, int r, const vector<long long>& h) {
              if (l == r) {
                  mx[node] = h[l];
                  ct[node] = 1;
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, h);
              build(2 * node + 1, mid + 1, r, h);
              pull(node, l, r);
          }

          void change(int node, int l, int r, int p, long long v) {
              if (l == r) {
                  mx[node] = v;
                  return;
              }
              int mid = (l + r) / 2;
              if (p <= mid) change(2 * node, l, mid, p, v);
              else change(2 * node + 1, mid + 1, r, p, v);
              pull(node, l, r);
          }`,
        java: r`
          static long[] mx, ct;

          static long calc(int node, int l, int r, long m) {
              if (mx[node] <= m) return 0;
              if (l == r) return 1;
              int mid = (l + r) / 2;
              if (mx[2 * node] <= m) return calc(2 * node + 1, mid + 1, r, m);
              return calc(2 * node, l, mid, m) + ct[node] - ct[2 * node];
          }

          static void pull(int node, int l, int r) {
              int mid = (l + r) / 2;
              mx[node] = Math.max(mx[2 * node], mx[2 * node + 1]);
              ct[node] = ct[2 * node] + calc(2 * node + 1, mid + 1, r, mx[2 * node]);
          }

          static void build(int node, int l, int r, long[] h) {
              if (l == r) {
                  mx[node] = h[l];
                  ct[node] = 1;
                  return;
              }
              int mid = (l + r) / 2;
              build(2 * node, l, mid, h);
              build(2 * node + 1, mid + 1, r, h);
              pull(node, l, r);
          }

          static void change(int node, int l, int r, int p, long v) {
              if (l == r) {
                  mx[node] = v;
                  return;
              }
              int mid = (l + r) / 2;
              if (p <= mid) change(2 * node, l, mid, p, v);
              else change(2 * node + 1, mid + 1, r, p, v);
              pull(node, l, r);
          }`
      },
      python: r`
        mx.extend([0] * (4 * n))
        ct.extend([0] * (4 * n))
        build(1, 0, n - 1, h)
        out = []
        for p, v in ups:
            change(1, 0, n - 1, p - 1, v)
            out.append(ct[1])
        print(*out)`,
      cpp: r`
        mx.assign(4 * n, 0);
        ct.assign(4 * n, 0);
        build(1, 0, (int)n - 1, h);
        string out;
        for (long long k = 0; k < q; k++) {
            change(1, 0, (int)n - 1, (int)ups[k][0] - 1, ups[k][1]);
            if (k > 0) out += " ";
            out += to_string(ct[1]);
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        mx = new long[4 * cn];
        ct = new long[4 * cn];
        build(1, 0, cn - 1, h);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            change(1, 0, cn - 1, (int) ups[k][0] - 1, ups[k][1]);
            if (k > 0) out.append(" ");
            out.append(ct[1]);
        }
        System.out.println(out);`,
      includes: ['<string>', '<vector>', '<algorithm>']
    },
    solution: { explanation: ['Each node stores the tallest height of its block and the number of visible buildings inside it. A merge needs the number of buildings of the right block that are taller than the left maximum, which one descent of the right block gives in O(log n).'], complexity: 'Time O((n + q log n) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const h = nums(rs[1]); const mx = new Float64Array(4 * n), ct = new Float64Array(4 * n);
      const calc = (o, l, rr, m) => { if (mx[o] <= m) return 0; if (l === rr) return 1; const mid = (l + rr) >> 1; if (mx[2 * o] <= m) return calc(2 * o + 1, mid + 1, rr, m); return calc(2 * o, l, mid, m) + ct[o] - ct[2 * o]; };
      const pull = (o, l, rr) => { const mid = (l + rr) >> 1; mx[o] = Math.max(mx[2 * o], mx[2 * o + 1]); ct[o] = ct[2 * o] + calc(2 * o + 1, mid + 1, rr, mx[2 * o]); };
      const build = (o, l, rr) => { if (l === rr) { mx[o] = h[l]; ct[o] = 1; return; } const mid = (l + rr) >> 1; build(2 * o, l, mid); build(2 * o + 1, mid + 1, rr); pull(o, l, rr); };
      const change = (o, l, rr, p, v) => { if (l === rr) { mx[o] = v; return; } const mid = (l + rr) >> 1; if (p <= mid) change(2 * o, l, mid, p, v); else change(2 * o + 1, mid + 1, rr, p, v); pull(o, l, rr); };
      build(1, 0, n - 1); const out = []; for (let k = 0; k < q; k++) { const [p, v] = nums(rs[2 + k]); change(1, 0, n - 1, p - 1, v); out.push(ct[1]); } return out.join(' ');
    },
    tests() {
      const g = rng(4909); const out = ['5 3\n3 1 4 1 5\n2 6\n5 2\n1 9\n', '1 2\n5\n1 7\n1 1\n'];
      const make = (n, q, hi, mode) => { let h = randArray(g, n, 1, hi); if (mode === 'rising') h = h.sort((x, y) => x - y); else if (mode === 'falling') h = h.sort((x, y) => y - x); const ups = many(q, () => [randInt(g, 1, n), mode === 'low' ? randInt(g, 1, Math.max(1, Math.floor(hi / 50))) : randInt(g, 1, hi)]); return `${n} ${q}\n${h.join(' ')}\n${lines(ups)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const h = nums(rs[1]); const res = []; for (let k = 0; k < q; k++) { const [p, v] = nums(rs[2 + k]); h[p - 1] = v; let best = 0, c = 0; for (const x of h) if (x > best) { best = x; c++; } res.push(c); } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 10), 8, 'random'), (i) => this.solve(i), brute, 1000);
      for (const [n, q, hi, mode] of [[10, 10, 20, 'random'], [100, 100, 1000, 'rising'], [1000, 1000, 1000000000, 'random'], [20000, 20000, 1000000000, 'random'], [20000, 20000, 1000000000, 'rising'], [20000, 20000, 1000000000, 'falling'], [19999, 20000, 1000000000, 'low'], [20000, 20000, 10, 'random']]) out.push(make(n, q, hi, mode));
      return out;
    }
  }
];
