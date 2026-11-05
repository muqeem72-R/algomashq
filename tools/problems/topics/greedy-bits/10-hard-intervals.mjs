import { r, rng, randInt, many, nums, rows, shuffle, randArray } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const lines = (list) => list.map((p) => p.join(' ')).join('\n');
const rowsOfNums = (input, from, count) => { const rs = rows(input); return many(count, (i) => nums(rs[from + i])); };
const lowerBound = (a, v) => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] < v) lo = mid + 1; else hi = mid; } return lo; };
const upperBound = (a, v) => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] <= v) lo = mid + 1; else hi = mid; } return lo; };

// a binary min-heap of numbers for the reference solutions; pairs are compared with the supplied function
class Heap {
  constructor(less = (x, y) => x < y) { this.a = []; this.less = less; }
  get size() { return this.a.length; }
  top() { return this.a[0]; }
  push(x) { const a = this.a; a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (!this.less(a[i], a[p])) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a; const top = a[0]; const last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, rr = l + 1; let m = i; if (l < a.length && this.less(a[l], a[m])) m = l; if (rr < a.length && this.less(a[rr], a[m])) m = rr; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; }
}

const HEAP_JAVA = r`
  static long[] heap;
  static int heapSize;

  static void heapPush(long v) {
      int i = heapSize++;
      heap[i] = v;
      while (i > 0) {
          int p = (i - 1) / 2;
          if (heap[p] <= heap[i]) break;
          long t = heap[p];
          heap[p] = heap[i];
          heap[i] = t;
          i = p;
      }
  }

  static long heapPop() {
      long top = heap[0];
      heapSize--;
      if (heapSize > 0) {
          heap[0] = heap[heapSize];
          int i = 0;
          while (true) {
              int l = 2 * i + 1, rr = l + 1, m = i;
              if (l < heapSize && heap[l] < heap[m]) m = l;
              if (rr < heapSize && heap[rr] < heap[m]) m = rr;
              if (m == i) break;
              long t = heap[m];
              heap[m] = heap[i];
              heap[i] = t;
              i = m;
          }
      }
      return top;
  }`;

export default [
  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the number of ranges and the number of points.', 'Each of the next `n` lines has two numbers `l` and `r`: a range that contains every point from `l` to `r`.', 'The last line has `q` numbers: the points.'],
    constraints: ['1 <= n, q <= 30000', '1 <= l <= r <= 10^9', '1 <= each point <= 10^9'],
    slug: 'shortest-range-covering-each-point',
    title: 'The Shortest Range That Covers Each Point',
    tags: ['intervals', 'offline-queries', 'heap', 'sweep-line'],
    concept: {
      title: 'Answer the points in increasing order and keep the open ranges in a heap ordered by their length',
      body: [
        'You are given `n` ranges `[l, r]` and `q` points. For every point find the **length (`r - l + 1`) of the shortest range that contains it**, or -1 if no range does. For the ranges `[1,4] [2,4] [3,6] [4,4]` and the points `2 3 4 5` the answers are `3 3 1 4`. Checking all the ranges for every point costs O(n q), which is 9 * 10^8 here.',
        'Process the points **offline**, in increasing order. Sort the ranges by the left end. Moving to the next point `p`, push into a heap every range with `l <= p` that has not been pushed yet; the heap holds the ranges that **have started**, ordered by their length (and the right end next to it). Some of them have already **ended** (`r < p`): since the points grow, such a range can never help again, so it can be thrown away for good. When the top of the heap is a range that ended, pop it; repeat until the top contains `p`. The top is then the shortest range covering `p`.',
        { code: 'iv.sort()\norder = sorted(range(q), key=lambda i: pts[i])       # the points in increasing order\nheap = []                                            # (length, right end)\ni = 0\nans = [-1] * q\nfor idx in order:\n    p = pts[idx]\n    while i < n and iv[i][0] <= p:\n        heappush(heap, (iv[i][1] - iv[i][0] + 1, iv[i][1])); i += 1\n    while heap and heap[0][1] < p:\n        heappop(heap)                                # it ended before p, and also before all larger points\n    if heap: ans[idx] = heap[0][0]' },
        'The lazy deletion is correct because only the top is ever examined: a dead range buried under shorter ones does no harm until it reaches the top. Every range is pushed and popped at most once, so the time is O((n + q) log n), and the answers are written back by the original index. The same offline idea (sort the queries, grow a data structure) solves many "for each query" interval problems.'
      ]
    },
    statement: ['`n` ranges `[l, r]` (both ends included) and `q` points are given. For every point print the length `r - l + 1` of the shortest range that contains the point, or -1 if no range contains it.'],
    outputFormat: ['Print `q` numbers on one line, in the order of the points.'],
    examples: [{ input: '4 4\n1 4\n2 4\n3 6\n4 4\n2 3 4 5\n', note: 'Point 2: [1,4] and [2,4] -> 3; point 3: 3; point 4: [4,4] -> 1; point 5: [3,6] -> 4.' }],
    hints: ['Sort the ranges by their left end and the points in increasing order.', 'Push the ranges that have started into a min-heap ordered by length.', 'Pop the top while it ended before the current point.'],
    program: {
      io: ['n:int q:int', 'iv:int[n][2]', 'pts:int[q]'],
      fast: true,
      helpers: { python: 'from heapq import heappush, heappop', cpp: '', java: HEAP_JAVA },
      python: r`
        iv.sort()
        order = sorted(range(q), key=lambda i: pts[i])
        heap = []
        i = 0
        ans = [-1] * q
        for idx in order:
            p = pts[idx]
            while i < n and iv[i][0] <= p:
                heappush(heap, (iv[i][1] - iv[i][0] + 1, iv[i][1]))
                i += 1
            while heap and heap[0][1] < p:
                heappop(heap)
            if heap:
                ans[idx] = heap[0][0]
        print(*ans)`,
      cpp: r`
        sort(iv.begin(), iv.end());
        vector<int> order(q);
        for (int i = 0; i < q; i++) order[i] = i;
        sort(order.begin(), order.end(), [&](int x, int y) { return pts[x] < pts[y]; });
        priority_queue<pair<long long, long long>, vector<pair<long long, long long>>, greater<pair<long long, long long>>> heap;
        vector<long long> ans(q, -1);
        long long i = 0;
        for (int idx : order) {
            long long p = pts[idx];
            while (i < n && iv[i][0] <= p) {
                heap.push({iv[i][1] - iv[i][0] + 1, iv[i][1]});
                i++;
            }
            while (!heap.empty() && heap.top().second < p) heap.pop();
            if (!heap.empty()) ans[idx] = heap.top().first;
        }
        for (int t = 0; t < q; t++) cout << (t ? " " : "") << ans[t];
        cout << "\n";`,
      java: r`
        int cn = (int) n, cq = (int) q;
        long[] ik = new long[cn];
        for (int i = 0; i < cn; i++) ik[i] = (iv[i][0] << 30) | iv[i][1];
        Arrays.sort(ik);
        long[] qk = new long[cq];
        for (int i = 0; i < cq; i++) qk[i] = (pts[i] << 15) | i;
        Arrays.sort(qk);
        long[] ans = new long[cq];
        heap = new long[cn + 5];
        heapSize = 0;
        long mask = (1L << 30) - 1;
        int i = 0;
        for (int t = 0; t < cq; t++) {
            long p = qk[t] >> 15;
            int idx = (int) (qk[t] & 32767L);
            while (i < cn && (ik[i] >> 30) <= p) {
                long l = ik[i] >> 30, rr = ik[i] & mask;
                heapPush(((rr - l + 1) << 30) | rr);
                i++;
            }
            while (heapSize > 0 && (heap[0] & mask) < p) heapPop();
            ans[idx] = heapSize > 0 ? (heap[0] >> 30) : -1;
        }
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < cq; t++) {
            if (t > 0) out.append(" ");
            out.append(ans[t]);
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<queue>', '<functional>']
    },
    solution: { explanation: ['The ranges are sorted by left end and the points are processed in increasing order; ranges that have started go into a min-heap by length, ranges that ended before the current point are removed from the top, and the top gives the answer.'], complexity: 'Time O((n + q) log n), space O(n + q).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const iv = rowsOfNums(input, 1, n); const pts = nums(rs[1 + n]); // the ranges by increasing length, each one answers the unanswered points inside it (union-find over the sorted points)
      const order = many(q, (i) => i).sort((a, b) => pts[a] - pts[b]); const sortedPts = order.map((i) => pts[i]); const next = new Int32Array(q + 1); for (let i = 0; i <= q; i++) next[i] = i; const find = (x) => { while (next[x] !== x) { next[x] = next[next[x]]; x = next[x]; } return x; };
      const ans = new Array(q).fill(-1); const byLength = iv.slice().sort((a, b) => (a[1] - a[0]) - (b[1] - b[0])); for (const [l, rr] of byLength) { let k = find(lowerBound(sortedPts, l)); while (k < q && sortedPts[k] <= rr) { ans[order[k]] = rr - l + 1; next[k] = k + 1; k = find(k + 1); } } return ans.join(' ');
    },
    tests() {
      const g = rng(3101); const out = ['4 4\n1 4\n2 4\n3 6\n4 4\n2 3 4 5\n', '1 1\n5 5\n5\n', '1 1\n5 5\n4\n', '2 3\n1 10\n1 10\n1 5 10\n'];
      const make = (n, q, hi, len) => `${n} ${q}\n${many(n, () => { const l = randInt(g, 1, hi); return `${l} ${Math.min(hi, l + randInt(g, 0, len))}`; }).join('\n')}\n${randArray(g, q, 1, hi).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const iv = rowsOfNums(input, 1, n); const pts = nums(rs[1 + n]); return pts.map((p) => { let best = -1; for (const [l, rr] of iv) if (l <= p && p <= rr && (best === -1 || rr - l + 1 < best)) best = rr - l + 1; return best; }).join(' '); };
      crossCheck(() => make(randInt(g, 1, 8), randInt(g, 1, 8), 12, 6), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi, len] of [[10, 10, 30, 10], [100, 100, 1000, 100], [1000, 1000, 100000, 5000], [25000, 25000, 1000000000, 50000000], [25000, 25000, 1000000000, 1000000000], [25000, 25000, 100000, 100], [25000, 25000, 50, 10], [24999, 25000, 1000000000, 1000]]) out.push(make(n, q, hi, len));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of jobs.', 'Each of the next `n` lines has three numbers `s`, `e` and `p`: the job runs from `s` to `e` and pays `p`.'],
    constraints: ['1 <= n <= 25000', '0 <= s < e <= 10^9', '1 <= p <= 10^9', 'A job may start at the moment another one ends.'],
    slug: 'best-profit-without-overlaps',
    title: 'The Best Profit From Jobs That Do Not Overlap',
    tags: ['intervals', 'dynamic-programming', 'binary-search', 'weighted-scheduling'],
    concept: {
      title: 'Sort the jobs by their end; for each job either skip it or add its profit to the best answer of the jobs that end before it starts',
      body: [
        'Each job occupies a time `[s, e)` and pays `p`. You can do only one job at a time (but a job may start exactly when another ends). Choose a set of non-overlapping jobs with the **largest total profit**. For the jobs `(1,3,50) (2,4,10) (3,5,40) (3,6,70)` the answer is 120: `(1,3,50)` and `(3,6,70)`. The earlier "activity selection" greedy (earliest end first) maximises the **number** of jobs; with profits it fails, so dynamic programming is needed.',
        'Sort the jobs by the **end time** and let `best[i]` be the best profit using only the first `i` jobs of this order. For the job `i` (the `i`-th, 0-based) there are two choices: **skip** it, giving `best[i]`, or **do** it, giving its profit plus the best profit among the jobs that **finish by its start**. Because the jobs are sorted by end, the jobs that end at or before `s` are exactly a **prefix** of the order, whose length `k` is found with a binary search. So `best[i + 1] = max(best[i], best[k] + p)`.',
        { code: 'jobs.sort(key=lambda j: j[1])               # by the end time\nends = [j[1] for j in jobs]\nbest = [0] * (n + 1)\nfor i, (s, e, p) in enumerate(jobs):\n    k = bisect_right(ends, s, 0, i)           # how many of the earlier jobs end at or before s\n    best[i + 1] = max(best[i], best[k] + p)\nprint(best[n])' },
        'The search is limited to the first `i` jobs: a job that ends after `s` cannot be combined with this one, and the jobs sorted before it that end later than `s` are excluded by the binary search. The total time is O(n log n). The answer can reach about 2.5 * 10^13, so 64-bit numbers are needed. This is the classic *weighted interval scheduling* problem.'
      ]
    },
    statement: ['`n` jobs are given by the start `s`, the end `e` and the profit `p`. A job occupies the time from `s` up to `e`; two jobs can both be done if one ends no later than the other starts. Print the largest total profit of a set of jobs that can all be done.'],
    outputFormat: ['Print the largest total profit.'],
    examples: [{ input: '4\n1 3 50\n2 4 10\n3 5 40\n3 6 70\n', note: 'Do the jobs (1,3,50) and (3,6,70): 120.' }],
    hints: ['Sort the jobs by the end time.', 'best[i] is the answer for the first i jobs of this order.', 'The jobs that end by the start of job i form a prefix: find its length with binary search.'],
    program: {
      io: ['n:int', 'jobs:int[n][3]'],
      fast: true,
      helpers: { python: 'from bisect import bisect_right', cpp: '', java: '' },
      python: r`
        jobs.sort(key=lambda j: j[1])
        ends = [j[1] for j in jobs]
        best = [0] * (n + 1)
        for i in range(n):
            s, e, p = jobs[i]
            k = bisect_right(ends, s, 0, i)
            best[i + 1] = max(best[i], best[k] + p)
        print(best[n])`,
      cpp: r`
        sort(jobs.begin(), jobs.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[1] < y[1]; });
        vector<long long> ends(n), best(n + 1, 0);
        for (long long i = 0; i < n; i++) ends[i] = jobs[i][1];
        for (long long i = 0; i < n; i++) {
            long long k = upper_bound(ends.begin(), ends.begin() + i, jobs[i][0]) - ends.begin();
            best[i + 1] = max(best[i], best[k] + jobs[i][2]);
        }
        cout << best[n] << "\n";`,
      java: r`
        int cn = (int) n;
        long[] keys = new long[cn];
        for (int i = 0; i < cn; i++) keys[i] = (jobs[i][1] << 15) | i;
        Arrays.sort(keys);
        long[] ends = new long[cn], starts = new long[cn], profit = new long[cn];
        for (int i = 0; i < cn; i++) {
            int id = (int) (keys[i] & 32767L);
            ends[i] = jobs[id][1];
            starts[i] = jobs[id][0];
            profit[i] = jobs[id][2];
        }
        long[] best = new long[cn + 1];
        for (int i = 0; i < cn; i++) {
            int lo = 0, hi = i;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (ends[mid] <= starts[i]) lo = mid + 1;
                else hi = mid;
            }
            best[i + 1] = Math.max(best[i], best[lo] + profit[i]);
        }
        System.out.println(best[cn]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The jobs are sorted by end time; best[i + 1] is the larger of best[i] (skip the job) and the job profit plus best[k], where k jobs of the order end at or before its start (found by binary search).'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const n = Number(rows(input)[0]); const jobs = rowsOfNums(input, 1, n).sort((a, b) => a[0] - b[0]); const starts = jobs.map((j) => j[0]); // sorted by start, the table is filled from the last job to the first
      const f = new Array(n + 1).fill(0); for (let i = n - 1; i >= 0; i--) { const [s, e, p] = jobs[i]; const nx = lowerBound(starts, e); f[i] = Math.max(f[i + 1], p + f[nx]); } return String(f[0]);
    },
    tests() {
      const g = rng(3102); const out = ['4\n1 3 50\n2 4 10\n3 5 40\n3 6 70\n', '1\n0 1 5\n', '2\n0 5 3\n5 9 4\n', '2\n0 5 3\n4 9 4\n'];
      const make = (n, hi, len, pMax) => `${n}\n${many(n, () => { const s = randInt(g, 0, hi - 1); return `${s} ${randInt(g, s + 1, Math.min(hi, s + len))} ${randInt(g, 1, pMax)}`; }).join('\n')}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); const jobs = rowsOfNums(input, 1, n); let best = 0; for (let mask = 0; mask < (1 << n); mask++) { const chosen = []; let total = 0; for (let i = 0; i < n; i++) if (mask >> i & 1) { chosen.push(jobs[i]); total += jobs[i][2]; } chosen.sort((x, y) => x[0] - y[0]); let ok = true; for (let i = 1; i < chosen.length; i++) if (chosen[i][0] < chosen[i - 1][1]) ok = false; if (ok) best = Math.max(best, total); } return String(best); };
      crossCheck(() => make(randInt(g, 1, 9), 12, 5, 20), (i) => this.solve(i), brute, 800);
      for (const [n, hi, len, pMax] of [[10, 30, 10, 100], [100, 1000, 100, 1000], [1000, 100000, 5000, 1000000], [25000, 1000000000, 50000000, 1000000000], [25000, 1000000000, 1000000000, 1000000000], [25000, 100000, 100, 1000000000], [25000, 50, 10, 1000000000], [24999, 1000000000, 1000, 5]]) out.push(make(n, hi, len, pMax));
      out.push(`25000\n${many(25000, (i) => `${i} ${i + 1} 1000000000`).join('\n')}\n`, `25000\n${many(25000, (i) => `${i} ${i + 2} ${1 + (i % 7)}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `q`: the number of operations.', 'Each of the next `q` lines has three numbers `t`, `l` and `r`: the type of the operation and the half-open range `[l, r)`.'],
    constraints: ['1 <= q <= 20000', '1 <= t <= 3 (1 = add the range, 2 = remove the range, 3 = ask whether the range is fully covered)', '0 <= l < r <= 10^9', 'At least one operation has the type 3.'],
    slug: 'track-covered-ranges',
    title: 'Keep Track of Covered Ranges With Add, Remove and Ask',
    tags: ['intervals', 'sorted-list', 'range-module', 'simulation'],
    concept: {
      title: 'Store the covered part as a sorted list of disjoint ranges; every operation touches a contiguous block of that list',
      body: [
        'A set of numbers on a line starts empty. Three operations come in turn. **Add `[l, r)`**: every number in the half-open range becomes covered. **Remove `[l, r)`**: every number in the range becomes uncovered. **Ask `[l, r)`**: is **every** number of the range covered? Print the answers to the questions. The coordinates reach 10^9, so we cannot store the numbers one by one.',
        'Keep the covered part as a **sorted list of disjoint half-open ranges**, in which two ranges that touch (like `[1,3)` and `[3,5)`) are merged into one. All three operations affect a **contiguous block** of this list, found with binary search: for **add**, the block of ranges that overlap or touch `[l, r)` is replaced by one merged range `[min(l, first.start), max(r, last.end))`; for **remove**, the ranges that overlap `[l, r)` are replaced by the possibly surviving left piece `[first.start, l)` and right piece `[r, last.end)`; for **ask**, find the last range with `start <= l` and check `end >= r`.',
        { code: 'starts, ends = [], []\nfor t, l, r in ops:\n    if t == 3:\n        i = bisect_right(starts, l) - 1                  # the last range starting at or before l\n        answers.append("YES" if i >= 0 and ends[i] >= r else "NO")\n    elif t == 1:\n        lo = bisect_left(ends, l)                         # the first range ending at or after l\n        hi = bisect_right(starts, r)                      # the ranges starting at or before r\n        if lo < hi:\n            l = min(l, starts[lo]); r = max(r, ends[hi - 1])\n        starts[lo:hi] = [l]; ends[lo:hi] = [r]' },
        'The remove operation is the mirror image: `lo = bisect_right(ends, l)` and `hi = bisect_left(starts, r)` delimit the ranges that really overlap, and the block is replaced by at most two leftover pieces. Because every range is created by one operation and deleted at most once, the list changes by amortised O(1) ranges per operation, and the binary searches cost O(log q), so the total is O(q log q) plus the cost of shifting the list.'
      ]
    },
    statement: ['A set of numbers is empty at the start. Process `q` operations; each has a type and a half-open range `[l, r)`: 1 = make all numbers of the range covered, 2 = make all numbers of the range not covered, 3 = ask whether all the numbers of the range are covered. Print the answers (YES or NO) to the operations of type 3, in order, separated by spaces.'],
    outputFormat: ['Print one YES or NO for every operation of type 3, on one line.'],
    examples: [{ input: '5\n1 10 20\n3 14 16\n2 14 16\n3 10 14\n3 10 16\n', note: 'After adding [10,20) the range [14,16) is covered; after removing it [10,14) is still covered but [10,16) is not: YES YES NO.' }],
    hints: ['Keep disjoint ranges sorted and merge ranges that touch.', 'Use binary search to find the block of ranges an operation touches.', 'Replace that block by the merged range (add) or by the surviving left and right pieces (remove).'],
    program: {
      io: ['q:int', 'ops:int[q][3]'],
      fast: true,
      helpers: {
        python: 'from bisect import bisect_left, bisect_right',
        cpp: '',
        java: r`
          static long[] starts, ends;
          static int size;

          static int lowerBound(long[] a, int len, long v) {
              int lo = 0, hi = len;
              while (lo < hi) {
                  int mid = (lo + hi) / 2;
                  if (a[mid] < v) lo = mid + 1;
                  else hi = mid;
              }
              return lo;
          }

          static int upperBound(long[] a, int len, long v) {
              int lo = 0, hi = len;
              while (lo < hi) {
                  int mid = (lo + hi) / 2;
                  if (a[mid] <= v) lo = mid + 1;
                  else hi = mid;
              }
              return lo;
          }

          static void splice(int lo, int hi, int count, long s1, long e1, long s2, long e2) {
              int delta = count - (hi - lo);
              if (delta != 0) {
                  System.arraycopy(starts, hi, starts, hi + delta, size - hi);
                  System.arraycopy(ends, hi, ends, hi + delta, size - hi);
              }
              if (count >= 1) {
                  starts[lo] = s1;
                  ends[lo] = e1;
              }
              if (count >= 2) {
                  starts[lo + 1] = s2;
                  ends[lo + 1] = e2;
              }
              size += delta;
          }`
      },
      python: r`
        starts = []
        ends = []
        answers = []
        for t, l, rr in ops:
            if t == 3:
                i = bisect_right(starts, l) - 1
                answers.append("YES" if i >= 0 and ends[i] >= rr else "NO")
            elif t == 1:
                lo = bisect_left(ends, l)
                hi = bisect_right(starts, rr)
                if lo < hi:
                    l = min(l, starts[lo])
                    rr = max(rr, ends[hi - 1])
                starts[lo:hi] = [l]
                ends[lo:hi] = [rr]
            else:
                lo = bisect_right(ends, l)
                hi = bisect_left(starts, rr)
                new_starts = []
                new_ends = []
                if lo < hi:
                    if starts[lo] < l:
                        new_starts.append(starts[lo])
                        new_ends.append(l)
                    if ends[hi - 1] > rr:
                        new_starts.append(rr)
                        new_ends.append(ends[hi - 1])
                starts[lo:hi] = new_starts
                ends[lo:hi] = new_ends
        print(*answers)`,
      cpp: r`
        vector<long long> starts, ends;
        string answers;
        for (long long t = 0; t < q; t++) {
            long long type = ops[t][0], l = ops[t][1], rr = ops[t][2];
            if (type == 3) {
                long long i = (upper_bound(starts.begin(), starts.end(), l) - starts.begin()) - 1;
                if (!answers.empty()) answers += " ";
                answers += (i >= 0 && ends[i] >= rr) ? "YES" : "NO";
            } else if (type == 1) {
                long long lo = lower_bound(ends.begin(), ends.end(), l) - ends.begin();
                long long hi = upper_bound(starts.begin(), starts.end(), rr) - starts.begin();
                if (lo < hi) {
                    l = min(l, starts[lo]);
                    rr = max(rr, ends[hi - 1]);
                }
                starts.erase(starts.begin() + lo, starts.begin() + hi);
                ends.erase(ends.begin() + lo, ends.begin() + hi);
                starts.insert(starts.begin() + lo, l);
                ends.insert(ends.begin() + lo, rr);
            } else {
                long long lo = upper_bound(ends.begin(), ends.end(), l) - ends.begin();
                long long hi = lower_bound(starts.begin(), starts.end(), rr) - starts.begin();
                vector<long long> ns, ne;
                if (lo < hi) {
                    if (starts[lo] < l) {
                        ns.push_back(starts[lo]);
                        ne.push_back(l);
                    }
                    if (ends[hi - 1] > rr) {
                        ns.push_back(rr);
                        ne.push_back(ends[hi - 1]);
                    }
                    starts.erase(starts.begin() + lo, starts.begin() + hi);
                    ends.erase(ends.begin() + lo, ends.begin() + hi);
                    starts.insert(starts.begin() + lo, ns.begin(), ns.end());
                    ends.insert(ends.begin() + lo, ne.begin(), ne.end());
                }
            }
        }
        cout << answers << "\n";`,
      java: r`
        int cq = (int) q;
        starts = new long[cq + 5];
        ends = new long[cq + 5];
        size = 0;
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < cq; t++) {
            long type = ops[t][0], l = ops[t][1], rr = ops[t][2];
            if (type == 3) {
                int i = upperBound(starts, size, l) - 1;
                if (out.length() > 0) out.append(" ");
                out.append(i >= 0 && ends[i] >= rr ? "YES" : "NO");
            } else if (type == 1) {
                int lo = lowerBound(ends, size, l), hi = upperBound(starts, size, rr);
                if (lo < hi) {
                    l = Math.min(l, starts[lo]);
                    rr = Math.max(rr, ends[hi - 1]);
                }
                splice(lo, hi, 1, l, rr, 0, 0);
            } else {
                int lo = upperBound(ends, size, l), hi = lowerBound(starts, size, rr);
                int count = 0;
                long s1 = 0, e1 = 0, s2 = 0, e2 = 0;
                if (lo < hi) {
                    if (starts[lo] < l) {
                        s1 = starts[lo];
                        e1 = l;
                        count = 1;
                    }
                    if (ends[hi - 1] > rr) {
                        if (count == 0) {
                            s1 = rr;
                            e1 = ends[hi - 1];
                        } else {
                            s2 = rr;
                            e2 = ends[hi - 1];
                        }
                        count++;
                    }
                    splice(lo, hi, count, s1, e1, s2, e2);
                }
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['The covered part is kept as a sorted list of disjoint half-open ranges (touching ranges are merged); each operation replaces a contiguous block of the list found by binary search: one merged range for add, up to two surviving pieces for remove, and a lookup of the last range starting at or before l for ask.'], complexity: 'Time O(q log q) plus shifting, space O(q).' },
    solve(input) {
      const q = Number(rows(input)[0]); const ops = rowsOfNums(input, 1, q); let starts = [], ends = []; const answers = [];
      for (let [t, l, rr] of ops) { if (t === 3) { const i = upperBound(starts, l) - 1; answers.push(i >= 0 && ends[i] >= rr ? 'YES' : 'NO'); } else if (t === 1) { const lo = lowerBound(ends, l), hi = upperBound(starts, rr); if (lo < hi) { l = Math.min(l, starts[lo]); rr = Math.max(rr, ends[hi - 1]); } starts.splice(lo, hi - lo, l); ends.splice(lo, hi - lo, rr); } else { const lo = upperBound(ends, l), hi = lowerBound(starts, rr); const ns = [], ne = []; if (lo < hi) { if (starts[lo] < l) { ns.push(starts[lo]); ne.push(l); } if (ends[hi - 1] > rr) { ns.push(rr); ne.push(ends[hi - 1]); } starts.splice(lo, hi - lo, ...ns); ends.splice(lo, hi - lo, ...ne); } } } return answers.join(' ');
    },
    tests() {
      const g = rng(3103); const out = ['5\n1 10 20\n3 14 16\n2 14 16\n3 10 14\n3 10 16\n', '1\n3 0 1\n', '3\n1 0 5\n1 5 10\n3 0 10\n', '4\n1 0 5\n1 6 10\n3 0 10\n3 5 6\n'];
      const op = (hi, w, mix) => { const l = randInt(g, 0, hi - 1); const rr = randInt(g, l + 1, Math.min(hi, l + w)); const roll = g(); const t = roll < mix[0] ? 1 : roll < mix[0] + mix[1] ? 2 : 3; return `${t} ${l} ${rr}`; };
      const make = (q, hi, w, mix) => { const list = many(q, () => op(hi, w, mix)); list.push(`3 ${0} ${hi}`); return `${q + 1}\n${list.join('\n')}\n`; };
      const brute = (input) => { const q = Number(rows(input)[0]); const ops = rowsOfNums(input, 1, q); const cell = new Array(64).fill(false); const answers = []; for (const [t, l, rr] of ops) { if (t === 3) { let ok = true; for (let x = l; x < rr; x++) if (!cell[x]) ok = false; answers.push(ok ? 'YES' : 'NO'); } else for (let x = l; x < rr; x++) cell[x] = t === 1; } return answers.join(' '); };
      crossCheck(() => make(randInt(g, 1, 14), 30, 10, [0.4, 0.3, 0.3]), (i) => this.solve(i), brute, 1500);
      for (const [q, hi, w, mix] of [[10, 30, 10, [0.4, 0.3, 0.3]], [100, 1000, 300, [0.4, 0.3, 0.3]], [1000, 100000, 20000, [0.4, 0.3, 0.3]], [19999, 1000000000, 100000000, [0.4, 0.3, 0.3]], [19999, 1000000000, 1000, [0.5, 0.2, 0.3]], [19999, 100000, 100, [0.3, 0.3, 0.4]], [19999, 100, 30, [0.45, 0.35, 0.2]], [19999, 1000000000, 1000000000, [0.2, 0.5, 0.3]], [19999, 1000000000, 100, [0.7, 0.05, 0.25]]]) out.push(make(q, hi, w, mix));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of bookings.', 'Each of the next `n` lines has two numbers `s` and `e`: a booking of the half-open time range `[s, e)`.'],
    constraints: ['1 <= n <= 20000', '0 <= s < e <= 10^9'],
    slug: 'busiest-moment-after-each-booking',
    title: 'The Busiest Moment After Each New Booking',
    tags: ['intervals', 'segment-tree', 'lazy-propagation', 'coordinate-compression'],
    concept: {
      title: 'Compress the coordinates and keep, in a segment tree, the number of bookings covering each elementary segment',
      body: [
        'Bookings arrive one after another; the booking `[s, e)` occupies the half-open time range from `s` up to (not including) `e`. After **each** booking, print the **largest number of bookings that overlap at a single moment** so far. For the bookings `[10,20) [50,60) [10,40) [5,15) [5,10) [25,55)` the answers are `1 1 2 3 3 3`. Recomputing the maximum from scratch after every booking would cost O(n^2) at least.',
        'Read all the bookings first (**offline**). Collect all the endpoints, sort them and remove duplicates. Between two neighbouring endpoints nothing changes, so the line splits into `m` **elementary segments**; a booking `[s, e)` covers a **range of consecutive segments** `idx(s) .. idx(e) - 1`. We need two operations: *add 1 to a range of segments* and *get the maximum over all segments*. A **segment tree** does both in O(log m): each node stores `mx` (the maximum in its range, counting only the additions made inside this subtree) and `ad` (the number of additions that cover its whole range).',
        { code: 'def update(node, l, r, ql, qr):          # add 1 to the segments ql..qr\n    if ql <= l and r <= qr:\n        mx[node] += 1; ad[node] += 1; return    # the whole node is covered: remember it lazily\n    mid = (l + r) // 2\n    if ql <= mid: update(2 * node, l, mid, ql, qr)\n    if qr > mid: update(2 * node + 1, mid + 1, r, ql, qr)\n    mx[node] = max(mx[2 * node], mx[2 * node + 1]) + ad[node]\n\nfor s, e in bookings:\n    update(1, 0, m - 1, idx[s], idx[e] - 1)\n    print(mx[1])                                 # the global maximum' },
        'The trick that makes the tree short is **not pushing the additions down**: a covered node keeps its own `ad` and adds it when it recomputes `mx` from its children. The answer after each booking is the value at the root, `mx[1]`. The time is O(n log n) after the sorting, and the memory is O(n). The same structure answers "how many rooms are needed" at every moment of a stream of reservations.'
      ]
    },
    statement: ['`n` bookings arrive one by one; each occupies a half-open time range `[s, e)`. After every booking print the largest number of bookings that cover one common moment (considering all the bookings so far). Print the `n` numbers on one line.'],
    outputFormat: ['Print `n` numbers on one line, separated by spaces.'],
    examples: [{ input: '6\n10 20\n50 60\n10 40\n5 15\n5 10\n25 55\n', note: 'The busiest moments: 1 1 2 3 3 3.' }],
    hints: ['Compress the endpoints into elementary segments.', 'A booking adds 1 to a range of consecutive segments.', 'A segment tree with range add and global maximum (without pushing the lazy values down) answers each step in O(log n).'],
    program: {
      io: ['n:int', 'bk:int[n][2]'],
      fast: true,
      helpers: {
        python: r`
          mx = []
          ad = []

          def update(node, l, r, ql, qr):
              if ql <= l and r <= qr:
                  mx[node] += 1
                  ad[node] += 1
                  return
              mid = (l + r) // 2
              if ql <= mid:
                  update(2 * node, l, mid, ql, qr)
              if qr > mid:
                  update(2 * node + 1, mid + 1, r, ql, qr)
              mx[node] = max(mx[2 * node], mx[2 * node + 1]) + ad[node]`,
        cpp: r`
          vector<int> mx, ad;

          void update(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) {
                  mx[node]++;
                  ad[node]++;
                  return;
              }
              int mid = (l + r) / 2;
              if (ql <= mid) update(2 * node, l, mid, ql, qr);
              if (qr > mid) update(2 * node + 1, mid + 1, r, ql, qr);
              mx[node] = max(mx[2 * node], mx[2 * node + 1]) + ad[node];
          }`,
        java: r`
          static int[] mx, ad;

          static void update(int node, int l, int r, int ql, int qr) {
              if (ql <= l && r <= qr) {
                  mx[node]++;
                  ad[node]++;
                  return;
              }
              int mid = (l + r) / 2;
              if (ql <= mid) update(2 * node, l, mid, ql, qr);
              if (qr > mid) update(2 * node + 1, mid + 1, r, ql, qr);
              mx[node] = Math.max(mx[2 * node], mx[2 * node + 1]) + ad[node];
          }`
      },
      python: r`
        xs = sorted(set(x for b in bk for x in b))
        idx = {x: i for i, x in enumerate(xs)}
        m = len(xs) - 1
        mx.extend([0] * (4 * m + 4))
        ad.extend([0] * (4 * m + 4))
        out = []
        for s, e in bk:
            update(1, 0, m - 1, idx[s], idx[e] - 1)
            out.append(mx[1])
        print(*out)`,
      cpp: r`
        vector<long long> xs;
        for (const vector<long long>& b : bk) {
            xs.push_back(b[0]);
            xs.push_back(b[1]);
        }
        sort(xs.begin(), xs.end());
        xs.erase(unique(xs.begin(), xs.end()), xs.end());
        int m = (int)xs.size() - 1;
        mx.assign(4 * m + 4, 0);
        ad.assign(4 * m + 4, 0);
        for (long long i = 0; i < n; i++) {
            int a = lower_bound(xs.begin(), xs.end(), bk[i][0]) - xs.begin();
            int b = lower_bound(xs.begin(), xs.end(), bk[i][1]) - xs.begin();
            update(1, 0, m - 1, a, b - 1);
            cout << (i ? " " : "") << mx[1];
        }
        cout << "\n";`,
      java: r`
        int cn = (int) n;
        long[] all = new long[2 * cn];
        for (int i = 0; i < cn; i++) {
            all[2 * i] = bk[i][0];
            all[2 * i + 1] = bk[i][1];
        }
        Arrays.sort(all);
        int u = 0;
        for (int i = 0; i < all.length; i++) {
            if (i == 0 || all[i] != all[i - 1]) all[u++] = all[i];
        }
        int m = u - 1;
        mx = new int[4 * m + 4];
        ad = new int[4 * m + 4];
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < cn; i++) {
            int a = Arrays.binarySearch(all, 0, u, bk[i][0]);
            int b = Arrays.binarySearch(all, 0, u, bk[i][1]);
            update(1, 0, m - 1, a, b - 1);
            if (i > 0) out.append(" ");
            out.append(mx[1]);
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<vector>']
    },
    solution: { explanation: ['The endpoints are compressed into elementary segments; a segment tree with range increments (lazy values kept in the nodes) stores the bookings covering each segment, and the root maximum is the busiest moment after each booking.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const n = Number(rows(input)[0]); const bk = rowsOfNums(input, 1, n); const xs = [...new Set(bk.flat())].sort((a, b) => a - b); const at = new Map(xs.map((x, i) => [x, i])); const m = xs.length - 1; const B = 128; const val = new Int32Array(m), blockAdd = new Int32Array(Math.ceil(m / B)), blockMax = new Int32Array(Math.ceil(m / B)); // square-root decomposition instead of a tree
      const out = []; for (const [s, e] of bk) { const l = at.get(s), rr = at.get(e) - 1; const bl = Math.floor(l / B), br = Math.floor(rr / B); if (bl === br) { for (let i = l; i <= rr; i++) { val[i]++; if (val[i] > blockMax[bl]) blockMax[bl] = val[i]; } } else { for (let i = l; i < (bl + 1) * B; i++) { val[i]++; if (val[i] > blockMax[bl]) blockMax[bl] = val[i]; } for (let i = br * B; i <= rr; i++) { val[i]++; if (val[i] > blockMax[br]) blockMax[br] = val[i]; } for (let b = bl + 1; b < br; b++) blockAdd[b]++; } let best = 0; for (let b = 0; b < blockMax.length; b++) best = Math.max(best, blockMax[b] + blockAdd[b]); out.push(best); } return out.join(' ');
    },
    tests() {
      const g = rng(3104); const out = ['6\n10 20\n50 60\n10 40\n5 15\n5 10\n25 55\n', '1\n0 1\n', '3\n0 5\n0 5\n0 5\n', '3\n0 5\n5 10\n10 15\n'];
      const make = (n, hi, len) => `${n}\n${many(n, () => { const s = randInt(g, 0, hi - 1); return `${s} ${randInt(g, s + 1, Math.min(hi, s + len))}`; }).join('\n')}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); const bk = rowsOfNums(input, 1, n); const cell = new Array(64).fill(0); const res = []; let best = 0; for (const [s, e] of bk) { for (let x = s; x < e; x++) { cell[x]++; best = Math.max(best, cell[x]); } res.push(best); } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 12), 30, 12), (i) => this.solve(i), brute, 800);
      for (const [n, hi, len] of [[10, 30, 10], [100, 1000, 300], [1000, 100000, 20000], [20000, 1000000000, 1000000000], [20000, 1000000000, 1000000], [20000, 100000, 1000], [20000, 100, 50], [19999, 1000000000, 1000]]) out.push(make(n, hi, len));
      out.push(`20000\n${many(20000, (i) => `${i} ${i + 20000}`).join('\n')}\n`, `20000\n${many(20000, (i) => `${i} ${i + 1}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of rectangles.', 'Each of the next `n` lines has four numbers `x1`, `y1`, `x2` and `y2`: the lower-left and the upper-right corner of an axis-parallel rectangle.'],
    constraints: ['1 <= n <= 2000', '0 <= x1 < x2 <= 10^9', '0 <= y1 < y2 <= 10^9'],
    slug: 'area-covered-by-rectangles',
    title: 'The Total Area Covered by Overlapping Rectangles',
    tags: ['intervals', 'sweep-line', 'segment-tree', 'geometry'],
    concept: {
      title: 'Sweep a vertical line from left to right; between two events the covered length of the line is constant',
      body: [
        '`n` rectangles with sides parallel to the axes are drawn on a plane, possibly overlapping. What is the **area of the union**? The coordinates reach 10^9, so the area can be about 10^18 and a grid of cells is out of the question. For the rectangles `0 0 2 2`, `1 0 3 1` and `1 1 3 3` the area of the union is 8; in general we need a method that works with the coordinates only.',
        'Sweep a vertical line from left to right. The line meets the rectangles that are **open** at the current `x`; their `y`-ranges can overlap, and the *covered length* of the line is the length of the union of those `y`-ranges. This length changes only at the left or right sides of rectangles, which are the **events**: a rectangle is *added* at `x1` and *removed* at `x2`. Between two consecutive events with `x` values `px` and `x`, the union area grows by `covered_length * (x - px)`.',
        { code: 'events = []\nfor x1, y1, x2, y2 in rects:\n    events.append((x1, +1, y1, y2)); events.append((x2, -1, y1, y2))\nevents.sort()\narea = 0; prev_x = events[0][0]\nfor x, v, y1, y2 in events:\n    area += covered_length() * (x - prev_x)       # the strip between the two events\n    prev_x = x\n    add(y1, y2, v)                                # +1 or -1 on the y-range' },
        'To know the covered length quickly, compress the `y` values and use a **segment tree** over the elementary `y`-segments. Each node keeps `cnt`, the number of rectangles that cover its whole range, and `len`, the covered length inside it: if `cnt > 0` the whole range is covered (`len` is the real length of the range), otherwise `len` is the sum of the children\'s lengths (0 for a leaf). Adding and removing the same range cancel exactly, so there is no need for lazy pushing. Total time O(n log n) after sorting; the area needs a 64-bit integer.'
      ]
    },
    statement: ['`n` axis-parallel rectangles are given by their lower-left corner `(x1, y1)` and upper-right corner `(x2, y2)` (with `x1 < x2` and `y1 < y2`). They may overlap. Print the area of the union of the rectangles.'],
    outputFormat: ['Print the area of the union.'],
    examples: [{ input: '3\n0 0 2 2\n1 0 3 1\n1 1 3 3\n', note: 'The areas 4, 2 and 4 overlap in 1 + 1 pieces: the union is 4 + 2 + 4 - 1 - 1 = 8.' }, { input: '1\n0 0 1000000000 1000000000\n', note: 'The area is 10^18.' }],
    hints: ['Sweep along x; the events are the left and right sides of the rectangles.', 'Between two events the covered length on the vertical line is constant.', 'Maintain the covered length with a segment tree over the compressed y values (count + length).'],
    program: {
      io: ['n:int', 'rects:int[n][4]'],
      fast: true,
      helpers: {
        python: r`
          ys = []
          cnt = []
          length = []

          def update(node, l, r, ql, qr, v):
              if ql <= l and r <= qr:
                  cnt[node] += v
              else:
                  mid = (l + r) // 2
                  if ql <= mid:
                      update(2 * node, l, mid, ql, qr, v)
                  if qr > mid:
                      update(2 * node + 1, mid + 1, r, ql, qr, v)
              if cnt[node] > 0:
                  length[node] = ys[r + 1] - ys[l]
              elif l == r:
                  length[node] = 0
              else:
                  length[node] = length[2 * node] + length[2 * node + 1]`,
        cpp: r`
          vector<long long> ys, length;
          vector<int> cnt;

          void update(int node, int l, int r, int ql, int qr, int v) {
              if (ql <= l && r <= qr) {
                  cnt[node] += v;
              } else {
                  int mid = (l + r) / 2;
                  if (ql <= mid) update(2 * node, l, mid, ql, qr, v);
                  if (qr > mid) update(2 * node + 1, mid + 1, r, ql, qr, v);
              }
              if (cnt[node] > 0) length[node] = ys[r + 1] - ys[l];
              else if (l == r) length[node] = 0;
              else length[node] = length[2 * node] + length[2 * node + 1];
          }`,
        java: r`
          static long[] ys, length;
          static int[] cnt;

          static void update(int node, int l, int r, int ql, int qr, int v) {
              if (ql <= l && r <= qr) {
                  cnt[node] += v;
              } else {
                  int mid = (l + r) / 2;
                  if (ql <= mid) update(2 * node, l, mid, ql, qr, v);
                  if (qr > mid) update(2 * node + 1, mid + 1, r, ql, qr, v);
              }
              if (cnt[node] > 0) length[node] = ys[r + 1] - ys[l];
              else if (l == r) length[node] = 0;
              else length[node] = length[2 * node] + length[2 * node + 1];
          }`
      },
      python: r`
        ys.extend(sorted(set(y for rc in rects for y in (rc[1], rc[3]))))
        yi = {y: i for i, y in enumerate(ys)}
        m = len(ys) - 1
        cnt.extend([0] * (4 * m + 4))
        length.extend([0] * (4 * m + 4))
        events = []
        for x1, y1, x2, y2 in rects:
            events.append((x1, 1, yi[y1], yi[y2]))
            events.append((x2, -1, yi[y1], yi[y2]))
        events.sort()
        area = 0
        prev_x = events[0][0]
        for x, v, a, b in events:
            area += length[1] * (x - prev_x)
            prev_x = x
            update(1, 0, m - 1, a, b - 1, v)
        print(area)`,
      cpp: r`
        for (const vector<long long>& rc : rects) {
            ys.push_back(rc[1]);
            ys.push_back(rc[3]);
        }
        sort(ys.begin(), ys.end());
        ys.erase(unique(ys.begin(), ys.end()), ys.end());
        int m = (int)ys.size() - 1;
        cnt.assign(4 * m + 4, 0);
        length.assign(4 * m + 4, 0);
        vector<array<long long, 4>> events;
        for (const vector<long long>& rc : rects) {
            int a = lower_bound(ys.begin(), ys.end(), rc[1]) - ys.begin();
            int b = lower_bound(ys.begin(), ys.end(), rc[3]) - ys.begin();
            events.push_back({rc[0], 1, a, b});
            events.push_back({rc[2], -1, a, b});
        }
        sort(events.begin(), events.end());
        long long area = 0, prevX = events[0][0];
        for (const array<long long, 4>& ev : events) {
            area += length[1] * (ev[0] - prevX);
            prevX = ev[0];
            update(1, 0, m - 1, (int)ev[2], (int)ev[3] - 1, (int)ev[1]);
        }
        cout << area << "\n";`,
      java: r`
        int cn = (int) n;
        long[] all = new long[2 * cn];
        for (int i = 0; i < cn; i++) {
            all[2 * i] = rects[i][1];
            all[2 * i + 1] = rects[i][3];
        }
        Arrays.sort(all);
        int u = 0;
        for (int i = 0; i < all.length; i++) {
            if (i == 0 || all[i] != all[i - 1]) all[u++] = all[i];
        }
        ys = Arrays.copyOf(all, u);
        int m = u - 1;
        cnt = new int[4 * m + 4];
        length = new long[4 * m + 4];
        long[] keys = new long[2 * cn];
        for (int i = 0; i < cn; i++) {
            keys[2 * i] = (rects[i][0] << 12) | (2 * i);
            keys[2 * i + 1] = (rects[i][2] << 12) | (2 * i + 1);
        }
        Arrays.sort(keys);
        long area = 0, prevX = keys[0] >> 12;
        for (int t = 0; t < 2 * cn; t++) {
            int e = (int) (keys[t] & 4095L);
            int rect = e / 2;
            long x = keys[t] >> 12;
            area += length[1] * (x - prevX);
            prevX = x;
            int a = Arrays.binarySearch(ys, rects[rect][1]);
            int b = Arrays.binarySearch(ys, rects[rect][3]);
            update(1, 0, m - 1, a, b - 1, (e % 2 == 0) ? 1 : -1);
        }
        System.out.println(area);`,
      includes: ['<algorithm>', '<array>', '<vector>']
    },
    solution: { explanation: ['A vertical line is swept from left to right over the sorted left and right sides of the rectangles; a segment tree over the compressed y values keeps the covered length of the line, and the area is the sum of covered length times the distance between consecutive events.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const n = Number(rows(input)[0]); const rects = rowsOfNums(input, 1, n).sort((a, b) => a[1] - b[1]); const xs = [...new Set(rects.flatMap((rc) => [rc[0], rc[2]]))].sort((a, b) => a - b); // strip by strip: the union of the y-ranges of the rectangles that cover the strip
      let area = 0n; for (let j = 0; j + 1 < xs.length; j++) { const a = xs[j], b = xs[j + 1]; let covered = 0, curEnd = -1; for (const rc of rects) { if (rc[0] <= a && rc[2] >= b) { const lo = Math.max(rc[1], curEnd); if (rc[3] > lo) { covered += rc[3] - lo; curEnd = rc[3]; } } } area += BigInt(covered) * BigInt(b - a); } return String(area);
    },
    tests() {
      const g = rng(3105); const out = ['3\n0 0 2 2\n1 0 3 1\n1 1 3 3\n', '1\n0 0 1000000000 1000000000\n', '2\n0 0 1 1\n0 0 1 1\n', '2\n0 0 1 1\n1 1 2 2\n'];
      const rect = (hi, w) => { const x1 = randInt(g, 0, hi - 1), y1 = randInt(g, 0, hi - 1); return [x1, y1, randInt(g, x1 + 1, Math.min(hi, x1 + w)), randInt(g, y1 + 1, Math.min(hi, y1 + w))]; };
      const make = (n, hi, w) => `${n}\n${lines(many(n, () => rect(hi, w)))}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); const rects = rowsOfNums(input, 1, n); let area = 0; for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++) if (rects.some(([x1, y1, x2, y2]) => x1 <= x && x < x2 && y1 <= y && y < y2)) area++; return String(area); };
      crossCheck(() => make(randInt(g, 1, 7), 14, 8), (i) => this.solve(i), brute, 800);
      for (const [n, hi, w] of [[10, 100, 50], [100, 1000, 300], [500, 1000000, 500000], [2000, 1000000000, 1000000000], [2000, 1000000000, 100000000], [2000, 1000, 100], [2000, 100000000, 100000], [1999, 1000000000, 1000]]) out.push(make(n, hi, w));
      out.push(`2000\n${many(2000, (i) => `${i} 0 ${i + 2000} 1000000000`).join('\n')}\n`, `2000\n${many(2000, (i) => `${i * 400000} ${i * 400000} ${1000000000 - i * 100000} ${1000000000 - i * 100000}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `r` and `m`: the number of rooms and the number of meetings.', 'Each of the next `m` lines has two numbers `s` and `e`: a meeting that is planned from `s` to `e`.'],
    constraints: ['1 <= r <= 100000', '1 <= m <= 30000', '0 <= s < e <= 10^9', 'All start times are different.'],
    slug: 'busiest-room-with-delays',
    title: 'Which Room Hosts the Most Meetings When Meetings Can Be Delayed?',
    tags: ['intervals', 'heap', 'simulation', 'two-heaps'],
    concept: {
      title: 'Keep two heaps: the free rooms by number and the busy rooms by the moment they become free',
      body: [
        'A building has `r` rooms numbered from 1. Meetings are planned for `[s, e)`, all with different start times, and are processed **in the order of their start times**. A meeting takes the **free room with the smallest number**. If every room is busy, the meeting is **delayed** until a room becomes free (the room that becomes free first; the smallest number on a tie) and then keeps its duration: it runs from the moment the room is free for `e - s`. A room is free at the moment its meeting ends. Which room hosted the **most meetings**? Print the smallest such room number.',
        'The simulation needs two things at every meeting: (1) *the free room with the smallest number*, (2) *the busy room that will be free the earliest*. Use two heaps. The **free heap** holds room numbers. The **busy heap** holds pairs `(end time, room)`. For a meeting starting at `s`, first move every busy room with `end <= s` to the free heap. Then, if the free heap is not empty, pop the smallest room and push it into the busy heap with the end time `e`. Otherwise pop the busy room with the smallest `(end, room)`, and push it back with the end time `end + (e - s)`: the delayed meeting.',
        { code: 'mt.sort()\nfree = list(range(rooms)); busy = []              # free rooms; (end time, room)\ncount = [0] * rooms\nfor s, e in mt:\n    while busy and busy[0][0] <= s:               # rooms that are free by now\n        end, room = heappop(busy); heappush(free, room)\n    if free:\n        room = heappop(free); heappush(busy, (e, room))\n    else:\n        end, room = heappop(busy)                 # wait for the earliest room\n        heappush(busy, (end + (e - s), room))\n    count[room] += 1' },
        'After the simulation the answer is the room with the largest count, the smallest number on ties. Each meeting makes a constant number of heap operations, so the time is O((r + m) log r). The end times can grow beyond the input values (every delay adds to them), up to about 3 * 10^13, so the program uses 64-bit numbers. The free heap is built from all `r` rooms at the start.'
      ]
    },
    statement: ['A building has `r` rooms numbered from 1. `m` meetings with different start times are processed in increasing order of the start. A meeting takes the free room with the smallest number; a room is free from the moment its meeting ends. If no room is free, the meeting waits for the room that becomes free first (the smallest number on ties) and then lasts for its original duration `e - s`. Print the smallest number of a room that hosted the largest number of meetings.'],
    outputFormat: ['Print the room number.'],
    examples: [{ input: '2 4\n0 10\n1 5\n2 7\n3 4\n', note: 'Room 1 takes [0,10); room 2 takes [1,5); the meeting [2,7) waits until 5 and runs [5,10) in room 2; the meeting [3,4) waits until 10 and runs [10,11) in room 1. Both rooms host 2: room 1.' }, { input: '3 5\n1 20\n2 10\n3 5\n4 9\n6 8\n', note: 'Room 2 hosts the most meetings: 2.' }],
    hints: ['Process the meetings in order of the start time.', 'First release the rooms whose meetings have ended.', 'Use a heap of free room numbers and a heap of (end time, room) for the busy rooms.'],
    program: {
      io: ['rooms:int m:int', 'mt:int[m][2]'],
      fast: true,
      helpers: {
        python: 'from heapq import heapify, heappush, heappop',
        cpp: '',
        java: r`
          static void hpush(long[] h, int[] sz, long v) {
              int i = sz[0]++;
              h[i] = v;
              while (i > 0) {
                  int p = (i - 1) / 2;
                  if (h[p] <= h[i]) break;
                  long t = h[p];
                  h[p] = h[i];
                  h[i] = t;
                  i = p;
              }
          }

          static long hpop(long[] h, int[] sz) {
              long top = h[0];
              sz[0]--;
              if (sz[0] > 0) {
                  h[0] = h[sz[0]];
                  int i = 0;
                  while (true) {
                      int l = 2 * i + 1, rr = l + 1, m = i;
                      if (l < sz[0] && h[l] < h[m]) m = l;
                      if (rr < sz[0] && h[rr] < h[m]) m = rr;
                      if (m == i) break;
                      long t = h[m];
                      h[m] = h[i];
                      h[i] = t;
                      i = m;
                  }
              }
              return top;
          }`
      },
      python: r`
        mt.sort()
        free = list(range(rooms))
        heapify(free)
        busy = []
        count = [0] * rooms
        for s, e in mt:
            while busy and busy[0][0] <= s:
                end, room = heappop(busy)
                heappush(free, room)
            if free:
                room = heappop(free)
                heappush(busy, (e, room))
            else:
                end, room = heappop(busy)
                heappush(busy, (end + (e - s), room))
            count[room] += 1
        best = 0
        for i in range(rooms):
            if count[i] > count[best]:
                best = i
        print(best + 1)`,
      cpp: r`
        sort(mt.begin(), mt.end());
        priority_queue<long long, vector<long long>, greater<long long>> freeRooms;
        for (long long i = 0; i < rooms; i++) freeRooms.push(i);
        priority_queue<pair<long long, long long>, vector<pair<long long, long long>>, greater<pair<long long, long long>>> busy;
        vector<long long> count(rooms, 0);
        for (long long i = 0; i < m; i++) {
            long long s = mt[i][0], e = mt[i][1];
            while (!busy.empty() && busy.top().first <= s) {
                freeRooms.push(busy.top().second);
                busy.pop();
            }
            long long room;
            if (!freeRooms.empty()) {
                room = freeRooms.top();
                freeRooms.pop();
                busy.push({e, room});
            } else {
                pair<long long, long long> top = busy.top();
                busy.pop();
                room = top.second;
                busy.push({top.first + (e - s), room});
            }
            count[room]++;
        }
        long long best = 0;
        for (long long i = 0; i < rooms; i++) if (count[i] > count[best]) best = i;
        cout << best + 1 << "\n";`,
      java: r`
        int cm = (int) m, cr = (int) rooms;
        long[] keys = new long[cm];
        for (int i = 0; i < cm; i++) keys[i] = (mt[i][0] << 15) | i;
        Arrays.sort(keys);
        long[] freeHeap = new long[cr + 5];
        int[] freeSize = new int[1];
        long[] busyHeap = new long[cr + 5];
        int[] busySize = new int[1];
        for (int i = 0; i < cr; i++) hpush(freeHeap, freeSize, i);
        long[] count = new long[cr];
        for (int t = 0; t < cm; t++) {
            int id = (int) (keys[t] & 32767L);
            long s = mt[id][0], e = mt[id][1];
            while (busySize[0] > 0 && (busyHeap[0] >> 17) <= s) {
                long top = hpop(busyHeap, busySize);
                hpush(freeHeap, freeSize, top & 131071L);
            }
            int room;
            if (freeSize[0] > 0) {
                room = (int) hpop(freeHeap, freeSize);
                hpush(busyHeap, busySize, (e << 17) | room);
            } else {
                long top = hpop(busyHeap, busySize);
                room = (int) (top & 131071L);
                long end = top >> 17;
                hpush(busyHeap, busySize, ((end + (e - s)) << 17) | room);
            }
            count[room]++;
        }
        int best = 0;
        for (int i = 0; i < cr; i++) {
            if (count[i] > count[best]) best = i;
        }
        System.out.println(best + 1);`,
      includes: ['<algorithm>', '<queue>', '<functional>']
    },
    solution: { explanation: ['The meetings are processed by start time with a heap of free room numbers and a heap of (end time, room); finished rooms are released first, a meeting takes the smallest free room or is delayed to the earliest-ending room, and the room with the most meetings is printed.'], complexity: 'Time O((r + m) log r), space O(r).' },
    solve(input) {
      const [rooms, m] = nums(rows(input)[0]); const mt = rowsOfNums(input, 1, m).sort((a, b) => a[0] - b[0]); const count = new Array(rooms).fill(0);
      if (rooms <= 300) { const freeAt = new Array(rooms).fill(0); for (const [s, e] of mt) { let room = -1; for (let i = 0; i < rooms; i++) if (freeAt[i] <= s) { room = i; break; } if (room >= 0) freeAt[room] = e; else { room = 0; for (let i = 1; i < rooms; i++) if (freeAt[i] < freeAt[room]) room = i; freeAt[room] += e - s; } count[room]++; } } // the plain scan over the rooms
      else { const free = new Heap(); for (let i = 0; i < rooms; i++) free.push(i); const busy = new Heap((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])); for (const [s, e] of mt) { while (busy.size && busy.top()[0] <= s) free.push(busy.pop()[1]); let room; if (free.size) { room = free.pop(); busy.push([e, room]); } else { const [end, rm] = busy.pop(); room = rm; busy.push([end + (e - s), room]); } count[room]++; } }
      let best = 0; for (let i = 0; i < rooms; i++) if (count[i] > count[best]) best = i; return String(best + 1);
    },
    tests() {
      const g = rng(3106); const out = ['2 4\n0 10\n1 5\n2 7\n3 4\n', '3 5\n1 20\n2 10\n3 5\n4 9\n6 8\n', '1 1\n0 1\n', '5 1\n3 9\n'];
      const make = (rooms, m, spread, dur) => { const starts = new Set(); while (starts.size < m) starts.add(randInt(g, 0, spread)); const list = shuffle(g, [...starts]).map((s) => `${s} ${s + randInt(g, 1, dur)}`); return `${rooms} ${m}\n${list.join('\n')}\n`; };
      const brute = (input) => { const [rooms, m] = nums(rows(input)[0]); const mt = rowsOfNums(input, 1, m).sort((a, b) => a[0] - b[0]); const freeAt = new Array(rooms).fill(0), count = new Array(rooms).fill(0); for (const [s, e] of mt) { let room = -1; for (let i = 0; i < rooms; i++) if (freeAt[i] <= s) { room = i; break; } if (room >= 0) freeAt[room] = e; else { room = 0; for (let i = 1; i < rooms; i++) if (freeAt[i] < freeAt[room]) room = i; freeAt[room] += e - s; } count[room]++; } let best = 0; for (let i = 0; i < rooms; i++) if (count[i] > count[best]) best = i; return String(best + 1); };
      crossCheck(() => make(randInt(g, 1, 4), randInt(g, 1, 12), 30, 8), (i) => this.solve(i), brute, 1000);
      // the heap branch of the reference (more than 300 rooms) is compared with the plain scan
      const scanOnly = (input) => { const [rooms, m] = nums(rows(input)[0]); const mt = rowsOfNums(input, 1, m).sort((a, b) => a[0] - b[0]); const freeAt = new Array(rooms).fill(0), count = new Array(rooms).fill(0); for (const [s, e] of mt) { let room = -1; for (let i = 0; i < rooms; i++) if (freeAt[i] <= s) { room = i; break; } if (room >= 0) freeAt[room] = e; else { room = 0; for (let i = 1; i < rooms; i++) if (freeAt[i] < freeAt[room]) room = i; freeAt[room] += e - s; } count[room]++; } let best = 0; for (let i = 0; i < rooms; i++) if (count[i] > count[best]) best = i; return String(best + 1); };
      for (let rep = 0; rep < 12; rep++) { const input = make(randInt(g, 301, 500), randInt(g, 300, 900), 3000, 60); if (this.solve(input) !== scanOnly(input)) throw new Error('heap solution differs from the plain scan'); }
      for (const [rooms, m, spread, dur] of [[3, 20, 100, 30], [10, 1000, 100000, 5000], [100, 30000, 1000000000, 100000], [100000, 30000, 1000000000, 1000000000], [50, 30000, 1000000000, 1000000000], [2, 30000, 1000000000, 100], [1000, 30000, 1000000, 1000000], [7, 29999, 40000, 5000], [100000, 30000, 100000, 50000]]) out.push(make(rooms, m, spread, dur));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `T`: the number of priced ranges and the length of the street.', 'Each of the next `n` lines has three numbers `s`, `e` and `c`: a range from `s` to `e` that can be bought for the price `c`.'],
    constraints: ['1 <= n <= 25000', '1 <= T <= 10^9', '0 <= s < e <= 10^9', '1 <= c <= 10^9'],
    slug: 'cheapest-ranges-to-cover-the-street',
    title: 'The Cheapest Priced Ranges That Cover the Whole Street',
    tags: ['intervals', 'dynamic-programming', 'fenwick-tree', 'covering'],
    concept: {
      title: 'Sort the ranges by their right end; the best cost of a chain ending at a range is its price plus the cheapest chain that already reaches its left end',
      body: [
        'A street runs from the point 0 to the point `T`. You may buy ranges: the range `i` covers the part from `s` to `e` of the street and costs `c`. Ranges may overlap. What is the **smallest total price** of ranges that together cover **every point** of the street from 0 to `T`? Print -1 if it is impossible. For `T = 10` and the ranges `(0,6,5) (5,10,4) (0,10,12) (3,8,1)` the answer is 9: buy `(0,6,5)` and `(5,10,4)`.',
        'This is a covering problem with prices, so the greedy "farthest reach" of the unweighted version is not enough. Use dynamic programming over the ranges **sorted by the right end**. Let `dp[i]` be the cheapest set of ranges that covers the street from 0 up to `e_i` and whose range with the largest right end is the range `i`. If `s_i = 0`, the range can start the chain alone: `dp[i] = c_i`. Otherwise the chain before it must already reach the point `s_i`: it ends with some earlier range `j` with `e_j >= s_i`, so `dp[i] = c_i + min dp[j]` over the ranges `j` that come earlier in the order and have `e_j >= s_i`. The answer is the smallest `dp[i]` with `e_i >= T`.',
        { code: 'rg.sort(key=lambda x: x[1])                  # by the right end\nends = sorted(set(e for s, e, c in rg))       # compressed right ends\nINF = 1 << 62\nanswer = INF\nfor s, e, c in rg:\n    base = 0 if s == 0 else best_among_ends_at_least(s)   # the cheapest earlier chain reaching s\n    if base < INF:\n        d = base + c\n        set_min_at(index of e, d)                           # dp of this range\n        if e >= T: answer = min(answer, d)' },
        'The query "the smallest `dp` among earlier ranges whose right end is at least `s`" is a **suffix minimum over the compressed right ends** with updates that only decrease values. A **Fenwick tree** over the reversed positions answers it, and applies an update, in O(log n). The total time is O(n log n). The earlier ranges are exactly those already processed, and they all have a right end not larger than the current one, which is why the sorted order and the tree work together.'
      ]
    },
    statement: ['A street runs from the point 0 to the point `T`. `n` ranges are for sale; the range `i` covers the part from `s` to `e` and costs `c`. Print the smallest total price of a set of ranges whose union covers the whole street from 0 to `T`, or -1 if the street cannot be covered.'],
    outputFormat: ['Print the smallest total price, or -1.'],
    examples: [{ input: '4 10\n0 6 5\n5 10 4\n0 10 12\n3 8 1\n', note: 'Buy (0,6) for 5 and (5,10) for 4: 9. The single range (0,10) costs 12.' }, { input: '2 10\n0 4 1\n5 10 1\n', note: 'The point 4.5 is not covered: -1.' }],
    hints: ['Sort the ranges by the right end.', 'dp[i] = c_i + the smallest dp[j] among earlier ranges with e_j >= s_i (or just c_i if s_i = 0).', 'Keep the dp values in a Fenwick tree for suffix minimum over the compressed right ends.'],
    program: {
      io: ['n:int T:int', 'rg:int[n][3]'],
      fast: true,
      helpers: { python: 'from bisect import bisect_left', cpp: '', java: '' },
      python: r`
        rg.sort(key=lambda x: x[1])
        ends = sorted(set(x[1] for x in rg))
        m = len(ends)
        inf = 1 << 62
        tree = [inf] * (m + 2)
        answer = inf
        for s, e, c in rg:
            if s == 0:
                base = 0
            else:
                p = bisect_left(ends, s)
                base = inf
                i = m - p
                while i > 0:
                    if tree[i] < base:
                        base = tree[i]
                    i -= i & -i
            if base < inf:
                d = base + c
                i = m - bisect_left(ends, e)
                while i <= m:
                    if d < tree[i]:
                        tree[i] = d
                    i += i & -i
                if e >= T and d < answer:
                    answer = d
        print(answer if answer < inf else -1)`,
      cpp: r`
        sort(rg.begin(), rg.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[1] < y[1]; });
        vector<long long> ends;
        for (const vector<long long>& x : rg) ends.push_back(x[1]);
        sort(ends.begin(), ends.end());
        ends.erase(unique(ends.begin(), ends.end()), ends.end());
        long long m = ends.size();
        const long long INF = 1LL << 62;
        vector<long long> tree(m + 2, INF);
        long long answer = INF;
        for (const vector<long long>& x : rg) {
            long long s = x[0], e = x[1], c = x[2], base;
            if (s == 0) {
                base = 0;
            } else {
                long long p = lower_bound(ends.begin(), ends.end(), s) - ends.begin();
                base = INF;
                for (long long i = m - p; i > 0; i -= i & -i) base = min(base, tree[i]);
            }
            if (base < INF) {
                long long d = base + c;
                long long pos = m - (lower_bound(ends.begin(), ends.end(), e) - ends.begin());
                for (long long i = pos; i <= m; i += i & -i) tree[i] = min(tree[i], d);
                if (e >= T) answer = min(answer, d);
            }
        }
        cout << (answer < INF ? answer : -1) << "\n";`,
      java: r`
        int cn = (int) n;
        long[] keys = new long[cn];
        for (int i = 0; i < cn; i++) keys[i] = (rg[i][1] << 15) | i;
        Arrays.sort(keys);
        long[] ends = new long[cn];
        for (int i = 0; i < cn; i++) ends[i] = keys[i] >> 15;
        int m = 0;
        for (int i = 0; i < cn; i++) {
            if (i == 0 || ends[i] != ends[i - 1]) ends[m++] = ends[i];
        }
        long inf = 1L << 62;
        long[] tree = new long[m + 2];
        Arrays.fill(tree, inf);
        long answer = inf;
        for (int t = 0; t < cn; t++) {
            int id = (int) (keys[t] & 32767L);
            long s = rg[id][0], e = rg[id][1], c = rg[id][2], base;
            if (s == 0) {
                base = 0;
            } else {
                int lo = 0, hi = m;
                while (lo < hi) {
                    int mid = (lo + hi) / 2;
                    if (ends[mid] < s) lo = mid + 1;
                    else hi = mid;
                }
                base = inf;
                for (int i = m - lo; i > 0; i -= i & -i) base = Math.min(base, tree[i]);
            }
            if (base < inf) {
                long d = base + c;
                int lo = 0, hi = m;
                while (lo < hi) {
                    int mid = (lo + hi) / 2;
                    if (ends[mid] < e) lo = mid + 1;
                    else hi = mid;
                }
                for (int i = m - lo; i <= m; i += i & -i) tree[i] = Math.min(tree[i], d);
                if (e >= T) answer = Math.min(answer, d);
            }
        }
        System.out.println(answer < inf ? answer : -1);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The ranges are sorted by right end; dp of a range is its price plus the cheapest earlier chain whose right end reaches the left end of the range (0 for ranges that start at 0), kept in a Fenwick tree for suffix minimum over the compressed right ends; the answer is the smallest dp among ranges reaching T.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const [n, T] = nums(rows(input)[0]); const rg = rowsOfNums(input, 1, n).sort((a, b) => a[1] - b[1]); const INF = Infinity; // dp over the ranges in the order of their right ends
      const dp = new Array(n).fill(INF); let answer = INF;
      if (n <= 3000) { for (let i = 0; i < n; i++) { const [s, e, c] = rg[i]; let base = s === 0 ? 0 : INF; if (s !== 0) for (let j = 0; j < i; j++) if (rg[j][1] >= s && dp[j] < base) base = dp[j]; if (base < INF) { dp[i] = base + c; if (e >= T) answer = Math.min(answer, dp[i]); } } return String(answer === INF ? -1 : answer); }
      const ends = [...new Set(rg.map((x) => x[1]))].sort((a, b) => a - b); const m = ends.length; const tree = new Array(m + 2).fill(INF); for (const [s, e, c] of rg) { let base = s === 0 ? 0 : INF; if (s !== 0) { const p = lowerBound(ends, s); for (let i = m - p; i > 0; i -= i & -i) base = Math.min(base, tree[i]); } if (base < INF) { const d = base + c; for (let i = m - lowerBound(ends, e); i <= m; i += i & -i) tree[i] = Math.min(tree[i], d); if (e >= T) answer = Math.min(answer, d); } } return String(answer === INF ? -1 : answer);
    },
    tests() {
      const g = rng(3107); const out = ['4 10\n0 6 5\n5 10 4\n0 10 12\n3 8 1\n', '2 10\n0 4 1\n5 10 1\n', '1 5\n0 5 7\n', '1 5\n1 9 7\n'];
      const fast = (input) => { const [n, T] = nums(rows(input)[0]); const rg = rowsOfNums(input, 1, n).sort((a, b) => a[1] - b[1]); const INF = Infinity; let answer = INF; const ends = [...new Set(rg.map((x) => x[1]))].sort((a, b) => a - b); const m = ends.length; const tree = new Array(m + 2).fill(INF); for (const [s, e, c] of rg) { let base = s === 0 ? 0 : INF; if (s !== 0) { const p = lowerBound(ends, s); for (let i = m - p; i > 0; i -= i & -i) base = Math.min(base, tree[i]); } if (base < INF) { const d = base + c; for (let i = m - lowerBound(ends, e); i <= m; i += i & -i) tree[i] = Math.min(tree[i], d); if (e >= T) answer = Math.min(answer, d); } } return String(answer === INF ? -1 : answer); };
      const make = (n, T, len, cMax, chain) => { const list = many(n, () => { const s = randInt(g, 0, T - 1); return [s, Math.min(T, s + randInt(g, 1, len)), randInt(g, 1, cMax)]; }); if (chain) { let x = 0; while (x < T && list.length < n + 400) { const nx = Math.min(T, x + randInt(g, 1, len)); list.push([x, Math.min(T, nx + randInt(g, 0, len >> 2)), randInt(g, 1, cMax)]); x = nx; } } const sh = shuffle(g, list).slice(0, 25000); return `${sh.length} ${T}\n${sh.map((p) => p.join(' ')).join('\n')}\n`; };
      const brute = (input) => { const [n, T] = nums(rows(input)[0]); const rg = rowsOfNums(input, 1, n); let best = Infinity; for (let mask = 1; mask < (1 << n); mask++) { const chosen = []; let cost = 0; for (let i = 0; i < n; i++) if (mask >> i & 1) { chosen.push(rg[i]); cost += rg[i][2]; } chosen.sort((a, b) => a[0] - b[0]); let reach = 0, ok = true; for (const [s, e] of chosen) { if (s > reach) { ok = false; break; } reach = Math.max(reach, e); } if (ok && reach >= T) best = Math.min(best, cost); } return String(best === Infinity ? -1 : best); };
      crossCheck(() => make(randInt(g, 1, 9), randInt(g, 1, 12), 6, 9, g() < 0.5), (i) => this.solve(i), brute, 800);
      crossCheck(() => make(randInt(g, 1, 9), randInt(g, 1, 12), 6, 9, g() < 0.5), fast, brute, 800);
      crossCheck(() => make(randInt(g, 100, 900), randInt(g, 50, 400), 40, 50, true), fast, (i) => this.solve(i), 40);
      for (const [n, T, len, cMax, chain] of [[10, 30, 12, 20, true], [100, 1000, 300, 100, true], [1000, 100000, 20000, 1000000, true], [24000, 1000000000, 50000000, 1000000000, true], [24000, 1000000000, 1000000, 1000000000, true], [24000, 100000, 1000, 1000000000, true], [24000, 100, 30, 1000000000, true], [24999, 1000000000, 10000, 5, false], [24000, 1000000, 100000, 1000000000, true]]) out.push(make(n, T, len, cMax, chain));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `k`: the number of meetings and the number of rooms.', 'Each of the next `n` lines has two numbers `s` and `e`: a meeting that occupies the time from `s` to `e`.'],
    constraints: ['1 <= n <= 30000', '1 <= k <= 1000', '0 <= s < e <= 10^9', 'A room can start a meeting at the moment its previous meeting ends.'],
    slug: 'most-meetings-in-k-rooms',
    title: 'The Most Meetings That Fit in K Rooms',
    tags: ['intervals', 'greedy', 'multiset', 'scheduling'],
    concept: {
      title: 'Sort the meetings by their end and give each one the room that became free most recently before its start',
      body: [
        'There are `k` rooms and `n` requested meetings, each from `s` to `e`. A room can host **one meeting at a time**, and a meeting can start when the previous meeting in that room has ended. Which is the **largest number of meetings** that can be held? For the meetings `1-3, 2-4, 3-5, 3-6` and `k = 2` the answer is 3: the meetings 2-4, 3-5 and 3-6 are all running at the time 3.5, so at most two of them fit. With one room this is the classical *activity selection*: sort by the end time and take every meeting that fits.',
        'For `k` rooms keep the **time at which every room becomes free** (all rooms are free at the start). Process the meetings **sorted by their end**. For the meeting `(s, e)` look at the rooms that are free by `s`, that is, whose free time is `<= s`. If there is none, the meeting is skipped. Otherwise put the meeting into the room with the **largest** free time among them: the room that has been idle for the **shortest** time. Its new free time becomes `e`. This "best fit" choice leaves the rooms that have been free for long available for the meetings that start early, which are the most demanding.',
        { code: 'rooms = [0] * k                       # the free times, sorted\ncount = 0\nfor s, e in sorted(meetings, key=lambda m: m[1]):\n    i = bisect_right(rooms, s) - 1       # the room with the largest free time <= s\n    if i >= 0:\n        rooms.pop(i)\n        insort(rooms, e)                 # its new free time\n        count += 1\nprint(count)' },
        'The room list is kept sorted, so finding the room is a binary search and updating it is a removal and an insertion, O(k) each in an array (O(log k) with a balanced tree). The total is O(n log n + n k) with the array. The greedy is correct because a set of meetings can be placed into `k` rooms exactly when no moment is covered by more than `k` of them; "best fit by end time" always builds such a set of maximum size.'
      ]
    },
    statement: ['`n` meetings (each from `s` to `e`) are requested and there are `k` rooms. A room holds one meeting at a time; a meeting may start at the moment the previous meeting of the room ends. Print the largest number of meetings that can be held.'],
    outputFormat: ['Print the largest number of meetings.'],
    examples: [{ input: '4 2\n1 3\n2 4\n3 5\n3 6\n', note: 'The meetings 2-4, 3-5 and 3-6 overlap, so only two of them fit; with 1-3 that is 3 (for example 1-3 and 3-5 in one room, 2-4 in the other).' }, { input: '3 1\n1 10\n2 3\n4 5\n', note: 'With one room, 2-3 and 4-5 are held: 2.' }],
    hints: ['With one room, sort by end time and take what fits.', 'Keep the free time of each room in a sorted list.', 'For a meeting choose the room with the largest free time that is not later than its start.'],
    program: {
      io: ['n:int k:int', 'mt:int[n][2]'],
      fast: true,
      helpers: { python: 'from bisect import bisect_right, insort', cpp: '', java: '' },
      python: r`
        mt.sort(key=lambda m: m[1])
        rooms = [0] * k
        count = 0
        for s, e in mt:
            i = bisect_right(rooms, s) - 1
            if i >= 0:
                rooms.pop(i)
                insort(rooms, e)
                count += 1
        print(count)`,
      cpp: r`
        sort(mt.begin(), mt.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[1] < y[1]; });
        multiset<long long> rooms;
        for (long long i = 0; i < k; i++) rooms.insert(0);
        long long count = 0;
        for (const vector<long long>& m : mt) {
            auto it = rooms.upper_bound(m[0]);
            if (it != rooms.begin()) {
                --it;
                rooms.erase(it);
                rooms.insert(m[1]);
                count++;
            }
        }
        cout << count << "\n";`,
      java: r`
        int cn = (int) n, ck = (int) k;
        long[] keys = new long[cn];
        for (int i = 0; i < cn; i++) keys[i] = (mt[i][1] << 15) | i;
        Arrays.sort(keys);
        long[] rooms = new long[ck];
        long count = 0;
        for (int t = 0; t < cn; t++) {
            int id = (int) (keys[t] & 32767L);
            long s = mt[id][0], e = mt[id][1];
            int lo = 0, hi = ck;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (rooms[mid] <= s) lo = mid + 1;
                else hi = mid;
            }
            int i = lo - 1;
            if (i >= 0) {
                for (int j = i; j + 1 < ck; j++) rooms[j] = rooms[j + 1];
                int p = ck - 1;
                while (p > 0 && rooms[p - 1] > e) {
                    rooms[p] = rooms[p - 1];
                    p--;
                }
                rooms[p] = e;
                count++;
            }
        }
        System.out.println(count);`,
      includes: ['<algorithm>', '<set>']
    },
    solution: { explanation: ['The meetings are sorted by end time; the free times of the rooms are kept sorted, each meeting goes into the room with the largest free time not later than its start (if any), and that room\'s free time becomes the end of the meeting.'], complexity: 'Time O(n log n + n k), space O(n + k).' },
    solve(input) {
      const [n, k] = nums(rows(input)[0]); const mt = rowsOfNums(input, 1, n).sort((a, b) => a[0] - b[0] || a[1] - b[1]); // sweep by the start: keep the chosen meetings that are still running sorted by end; if more than k run at once, drop the one that ends last
      const active = []; let dropped = 0; for (const [s, e] of mt) { while (active.length && active[0] <= s) active.shift(); const at = upperBound(active, e); active.splice(at, 0, e); if (active.length > k) { active.pop(); dropped++; } } return String(n - dropped);
    },
    tests() {
      const g = rng(3108); const out = ['4 2\n1 3\n2 4\n3 5\n3 6\n', '3 1\n1 10\n2 3\n4 5\n', '1 1\n0 1\n', '2 5\n0 5\n0 5\n'];
      const make = (n, k, hi, len) => `${n} ${k}\n${many(n, () => { const s = randInt(g, 0, hi - 1); return `${s} ${randInt(g, s + 1, Math.min(hi, s + len))}`; }).join('\n')}\n`;
      const brute = (input) => { const [n, k] = nums(rows(input)[0]); const mt = rowsOfNums(input, 1, n); let best = 0; const freeAt = new Array(k).fill(0); const sorted = mt.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const rec =(i, count) => { best = Math.max(best, count); if (i === n) return; rec(i + 1, count); const [s, e] = sorted[i]; for (let room = 0; room < k; room++) { if (freeAt[room] <= s) { const old = freeAt[room]; freeAt[room] = e; rec(i + 1, count + 1); freeAt[room] = old; } } }; rec(0, 0); return String(best); };
      crossCheck(() => make(randInt(g, 1, 9), randInt(g, 1, 3), 12, 6), (i) => this.solve(i), brute, 1000);
      const bestFit = (input) => { const [n, k] = nums(rows(input)[0]); const mt = rowsOfNums(input, 1, n).sort((a, b) => a[1] - b[1]); const rooms = new Array(k).fill(0); let count = 0; for (const [s, e] of mt) { const i = upperBound(rooms, s) - 1; if (i >= 0) { rooms.splice(i, 1); rooms.splice(upperBound(rooms, e), 0, e); count++; } } return String(count); };
      crossCheck(() => make(randInt(g, 1, 400), randInt(g, 1, 8), 300, 40), bestFit, (i) => this.solve(i), 300);
      for (const [n, k, hi, len] of [[10, 2, 30, 10], [100, 3, 1000, 100], [1000, 10, 100000, 5000], [30000, 1000, 1000000000, 100000000], [30000, 100, 1000000000, 1000000000], [30000, 1, 1000000000, 100000], [30000, 7, 100000, 100], [29999, 500, 1000000, 10000], [30000, 1000, 100, 100], [30000, 2, 1000000000, 5000000]]) out.push(make(n, k, hi, len));
      return out;
    }
  }
];
