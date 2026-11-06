import { r, rng, randInt, many, nums, rows, shuffle, randArray } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
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
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the length of the list and the number of questions.', 'The second line has the `n` numbers of the list.', 'Each of the next `q` lines has three numbers `l`, `r` and `x`.'],
    constraints: ['1 <= n, q <= 100000', '1 <= a[i], x <= 10^9', '1 <= l <= r <= n'],
    slug: 'count-of-a-value-in-ranges',
    title: 'How Many Times Does a Value Appear in a Range?',
    tags: ['binary-search', 'sorting', 'static-queries', 'counting'],
    concept: {
      title: 'Glue the value and the position into one number, and every occurrence of a value sits in one sorted block',
      body: [
        'A list of `n` numbers is fixed, and many questions follow: **how many times does the number `x` appear at the positions `l` to `r`?** For the list `1 2 1 2 1` the number 1 appears 3 times in the positions 1 to 5, and the number 2 appears 2 times in the positions 2 to 4. Counting inside the range costs O(n) per question.',
        'Make one number for every element: `key = value * 2^17 + position` (the positions are below `2^17 = 131072`, because `n <= 100000`). Sort all the keys once. The keys with the same value are now **one block, and inside the block they are ordered by position**. The occurrences of `x` at the positions `l..r` are exactly the keys in the interval `[x * 2^17 + (l - 1), x * 2^17 + (r - 1)]`, a contiguous piece of the sorted list.',
        { code: 'keys = sorted(v * 131072 + i for i, v in enumerate(a))      # position i = 0..n-1\n\ndef count(l, r, x):\n    base = x * 131072\n    return bisect_left(keys, base + r) - bisect_left(keys, base + l - 1)' },
        'Two binary searches find the ends of that piece; the difference of their indexes is the answer, even when `x` is not in the list at all (then both searches give the same index). One sort and O(log n) per question: no hash table of lists is needed, and the same trick works in any language that can sort numbers.'
      ]
    },
    statement: ['A list of `n` numbers is given. Answer `q` questions. Each question has three numbers `l`, `r` and `x`: count the positions between `l` and `r` (both included, counting from 1) that hold the number `x`. Print the answers on one line, in the order of the questions.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: '5 3\n1 2 1 2 1\n1 5 1\n2 4 2\n1 2 3\n', note: 'The number 1 is at the positions 1, 3 and 5: three times. The number 2 is at the positions 2 and 4: twice. The number 3 is nowhere: 3 2 0.' }],
    hints: ['Counting inside the range for every question is too slow for 100000 questions.', 'Join the value and the position in one number, value * 131072 + position, and sort these numbers once.', 'The wanted positions form a contiguous piece of the sorted list. Find its two ends with binary search.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'qs:int[q][3]'],
      fast: true,
      python: r`
        keys = sorted(v * 131072 + i for i, v in enumerate(a))
        out = []
        for l, r, x in qs:
            base = x * 131072
            out.append(bisect_left(keys, base + r) - bisect_left(keys, base + l - 1))
        print(*out)`,
      cpp: r`
        vector<long long> keys(n);
        for (long long i = 0; i < n; i++) keys[i] = a[i] * 131072 + i;
        sort(keys.begin(), keys.end());
        string out;
        for (long long j = 0; j < q; j++) {
            long long base = qs[j][2] * 131072;
            long long hi = lower_bound(keys.begin(), keys.end(), base + qs[j][1]) - keys.begin();
            long long lo = lower_bound(keys.begin(), keys.end(), base + qs[j][0] - 1) - keys.begin();
            if (!out.empty()) out += " ";
            out += to_string(hi - lo);
        }
        cout << out << "\n";`,
      java: r`
        long[] keys = new long[(int) n];
        for (int i = 0; i < n; i++) keys[i] = (a[i] << 17) | i;
        Arrays.sort(keys);
        StringBuilder out = new StringBuilder();
        for (int j = 0; j < q; j++) {
            long base = qs[j][2] << 17;
            int hi = lowerBound(keys, base + qs[j][1]);
            int lo = lowerBound(keys, base + qs[j][0] - 1);
            if (j > 0) out.append(" ");
            out.append(hi - lo);
        }
        System.out.println(out);`,
      helpers: { python: 'from bisect import bisect_left', java: LOWER_BOUND_JAVA },
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['Every element becomes the key value * 2^17 + position. After sorting, the occurrences of a value form a block ordered by position, so two binary searches count the occurrences inside any range.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const where = new Map(); for (let i = 0; i < n; i++) { if (!where.has(a[i])) where.set(a[i], []); where.get(a[i]).push(i + 1); }
      const out = []; for (let j = 0; j < q; j++) { const [l, rr, x] = nums(rs[2 + j]); const pos = where.get(x) || []; out.push(upperBound(pos, rr) - lowerBound(pos, l)); } return out.join(' '); // a list of positions for every value
    },
    tests() {
      const g = rng(4801); const out = ['5 3\n1 2 1 2 1\n1 5 1\n2 4 2\n1 2 3\n', '1 1\n1000000000\n1 1 1000000000\n'];
      const make = (n, q, hi, pHit) => { const a = randArray(g, n, 1, hi); const qs = many(q, () => { let l = randInt(g, 1, n), rr = randInt(g, 1, n); if (l > rr) [l, rr] = [rr, l]; const x = g() < pHit ? a[randInt(g, 0, n - 1)] : randInt(g, 1, hi); return [l, rr, x]; }); return `${n} ${q}\n${a.join(' ')}\n${lines(qs)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const res = []; for (let j = 0; j < q; j++) { const [l, rr, x] = nums(rs[2 + j]); let c = 0; for (let i = l - 1; i < rr; i++) if (a[i] === x) c++; res.push(c); } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 10), 4, 0.7), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi, p] of [[30, 30, 5, 0.8], [300, 300, 20, 0.8], [3000, 3000, 1000000000, 0.7], [100000, 80000, 50, 0.9], [40000, 40000, 1000000000, 0.5], [30000, 30000, 100000, 0.6], [99999, 30000, 3, 0.9]]) out.push(make(n, q, hi, p));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the length of the list and the number of questions.', 'The second line has the `n` numbers of the list.', 'Each of the next `q` lines has three numbers `l`, `r` and `x`.'],
    constraints: ['1 <= n, q <= 50000', '1 <= a[i], x <= 10^9', '1 <= l <= r <= n'],
    slug: 'numbers-at-most-x-in-ranges',
    title: 'How Many Numbers in a Range Are at Most x?',
    tags: ['fenwick-tree', 'offline-queries', 'sorting', 'counting'],
    concept: {
      title: 'Sort the questions by x and insert the numbers in increasing order, so the tree only ever holds numbers that are small enough',
      body: [
        'A list is fixed and every question brings its own bound: **how many numbers at the positions `l..r` are at most `x`?** The bound changes from question to question, so a single prefix-count array cannot answer them all. For the list `4 1 7 3 5` the positions 2 to 4 hold `1 7 3`, and two of them are at most 3.',
        'The questions do not have to be answered in the order they come, because all of them are known in advance. This is the **offline** idea: sort the questions by `x` and the positions by their value. Then sweep with a pointer: before a question with the bound `x`, insert into a Fenwick tree (indexed by position) every element whose value is at most `x` and has not been inserted yet. After that the tree holds exactly the small enough elements, so the answer is a range sum `sum(r) - sum(l - 1)`.',
        { code: 'order = sorted(range(n), key=lambda i: a[i])\np = 0\nfor j in sorted(range(q), key=lambda j: qs[j][2]):\n    l, r, x = qs[j]\n    while p < n and a[order[p]] <= x:\n        bit_add(t, order[p] + 1, 1)        # this element is now "small enough"\n        p += 1\n    ans[j] = bit_sum(t, r) - bit_sum(t, l - 1)' },
        'The pointer only moves forward, so every element is inserted once, and each question costs two prefix sums. Together the work is O((n + q) log n). Offline processing in the order of a hidden parameter is one of the most useful patterns with a Fenwick tree.'
      ]
    },
    statement: ['A list of `n` numbers is given. Answer `q` questions. Each question has three numbers `l`, `r` and `x`: count the positions between `l` and `r` (both included, counting from 1) that hold a number which is at most `x`. Print the answers on one line, in the order of the questions.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: '5 3\n4 1 7 3 5\n1 5 4\n2 4 3\n3 3 6\n', note: 'In the whole list 4, 1 and 3 are at most 4. In the positions 2..4 (1 7 3) the numbers 1 and 3 are at most 3. The position 3 holds 7, which is more than 6: 3 2 0.' }],
    hints: ['A single array of prefix counts does not work, because x is different in every question.', 'Answer the questions in the order of x, and insert the numbers into a Fenwick tree (by position) in the order of their value.', 'When the tree holds exactly the numbers that are at most x, the answer is sum(r) - sum(l - 1).'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'qs:int[q][3]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        order = sorted(range(n), key=lambda i: a[i])
        t = [0] * (n + 1)
        ans = [0] * q
        p = 0
        for j in sorted(range(q), key=lambda j: qs[j][2]):
            l, r, x = qs[j]
            while p < n and a[order[p]] <= x:
                bit_add(t, order[p] + 1, 1)
                p += 1
            ans[j] = bit_sum(t, r) - bit_sum(t, l - 1)
        print(*ans)`,
      cpp: r`
        vector<long long> order(n), qorder(q);
        for (long long i = 0; i < n; i++) order[i] = i;
        for (long long j = 0; j < q; j++) qorder[j] = j;
        sort(order.begin(), order.end(), [&](long long x, long long y) { return a[x] < a[y]; });
        sort(qorder.begin(), qorder.end(), [&](long long x, long long y) { return qs[x][2] < qs[y][2]; });
        vector<long long> t(n + 1, 0), ans(q, 0);
        long long p = 0;
        for (long long k = 0; k < q; k++) {
            long long j = qorder[k];
            while (p < n && a[order[p]] <= qs[j][2]) {
                bitAdd(t, order[p] + 1, 1);
                p++;
            }
            ans[j] = bitSum(t, qs[j][1]) - bitSum(t, qs[j][0] - 1);
        }
        string out;
        for (long long j = 0; j < q; j++) {
            if (j > 0) out += " ";
            out += to_string(ans[j]);
        }
        cout << out << "\n";`,
      java: r`
        long[] pk = new long[(int) n];
        for (int i = 0; i < n; i++) pk[i] = (a[i] << 17) | i;
        Arrays.sort(pk);
        long[] qk = new long[(int) q];
        for (int j = 0; j < q; j++) qk[j] = (qs[j][2] << 17) | j;
        Arrays.sort(qk);
        long[] t = new long[(int) n + 1];
        long[] ans = new long[(int) q];
        int p = 0;
        for (int k = 0; k < q; k++) {
            int j = (int) (qk[k] & 131071);
            long x = qs[j][2];
            while (p < n && (pk[p] >> 17) <= x) {
                bitAdd(t, (int) (pk[p] & 131071) + 1, 1);
                p++;
            }
            ans[j] = bitSum(t, (int) qs[j][1]) - bitSum(t, (int) qs[j][0] - 1);
        }
        StringBuilder out = new StringBuilder();
        for (int j = 0; j < q; j++) {
            if (j > 0) out.append(" ");
            out.append(ans[j]);
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['The questions are answered in the order of x. The numbers are inserted into a Fenwick tree over positions in the order of their value, so before each question the tree holds exactly the numbers that are at most x, and a range sum gives the answer.'], complexity: 'Time O((n + q) log n), space O(n + q).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const qs = many(q, (j) => nums(rs[2 + j]));
      const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => a[x] - a[y] || x - y); const qo = Array.from({ length: q }, (_, j) => j).sort((x, y) => qs[x][2] - qs[y][2] || x - y);
      const f = new Fen(n); const ans = new Array(q).fill(0); let p = 0; for (const j of qo) { const [l, rr, x] = qs[j]; while (p < n && a[order[p]] <= x) { f.add(order[p] + 1, 1); p++; } ans[j] = f.sum(rr) - f.sum(l - 1); } return ans.join(' '); // the offline sweep in the order of x
    },
    tests() {
      const g = rng(4802); const out = ['5 3\n4 1 7 3 5\n1 5 4\n2 4 3\n3 3 6\n', '1 1\n1\n1 1 1\n'];
      const make = (n, q, hi) => { const a = randArray(g, n, 1, hi); const qs = many(q, () => { let l = randInt(g, 1, n), rr = randInt(g, 1, n); if (l > rr) [l, rr] = [rr, l]; return [l, rr, g() < 0.6 ? a[randInt(g, 0, n - 1)] : randInt(g, 1, hi)]; }); return `${n} ${q}\n${a.join(' ')}\n${lines(qs)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const res = []; for (let j = 0; j < q; j++) { const [l, rr, x] = nums(rs[2 + j]); let c = 0; for (let i = l - 1; i < rr; i++) if (a[i] <= x) c++; res.push(c); } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 10), 6), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[30, 30, 10], [300, 300, 100], [3000, 3000, 1000000000], [50000, 50000, 1000000000], [40000, 40000, 100], [50000, 40000, 5], [30000, 30000, 1000000]]) out.push(make(n, q, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of places and the number of operations.', 'The second line has `n` numbers: the weights at the places `1..n`.', 'Each of the next `q` lines has three numbers `t`, `x` and `y`. If `t = 1`, the weight at the place `x` becomes `y`. If `t = 2`, print the balance point (and `x` and `y` are 0).'],
    constraints: ['1 <= n, q <= 50000', '0 <= weight <= 10^9', 'At every question the total weight is more than 0.'],
    slug: 'balance-point-of-weights',
    title: 'The Balance Point of Changing Weights',
    tags: ['fenwick-tree', 'weighted-median', 'binary-lifting', 'point-update'],
    concept: {
      title: 'The balance point is the first place whose prefix weight reaches half of the total, and a descent finds it',
      body: [
        'Places `1..n` along a road hold weights (parcels, people, crates). The **balance point** is the first place `p` such that the weight in the places `1..p` is **at least half** of the total weight, that is `2 * prefix(p) >= total`. It is the weighted median: standing there minimises the total weighted walking distance. For the weights `2 1 4 1 2` the total is 10, the prefix weights are `2 3 7 8 10`, and the first one that reaches 5 is at the place 3.',
        'Weights change, so recomputing prefix sums is too slow. A **Fenwick tree** keeps the changes cheap: replacing a weight is `add(x, y - old)` plus an update of the running total. For the question, the target is `k = (total + 1) // 2` (half of the total, rounded up, because the prefix is a whole number), and the answer is the **smallest `p` with `prefix(p) >= k`**.',
        { code: 'k = (total + 1) // 2\npos = 0\nstep = LOG                       # the largest power of two not above n\nwhile step:\n    if pos + step <= n and t[pos + step] < k:\n        pos += step\n        k -= t[pos]              # all of this block is still too light\n    step >>= 1\nanswer = pos + 1' },
        'This is the same descent as for "the k-th element", with a target that depends on the total. Everything is O(log n) per operation. The places with zero weight are never the answer, since the prefix only grows at a place with a positive weight, and the target is at least 1.'
      ]
    },
    statement: ['There are `n` places on a road, numbered from 1, and the place `i` holds the weight `w[i]` (it can be 0). Process `q` operations: type 1 `x y` sets the weight of the place `x` to `y`; type 2 `0 0` asks for the **balance point**, the smallest place `p` such that the total weight of the places `1..p` is at least half of the total weight of all places (twice that prefix weight is at least the total). Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '5 5\n2 1 4 1 2\n2 0 0\n1 3 0\n2 0 0\n1 5 10\n2 0 0\n', note: 'The weights 2 1 4 1 2 have the total 10 and the prefix weights 2 3 7: the place 3 is the first at least 5. After the place 3 gets 0, the total is 6, and the place 2 reaches 3. After the place 5 gets 10 the total is 14 and only the place 5 reaches 7: 3 2 5.' }],
    hints: ['Keep the weights in a Fenwick tree and the total in a variable.', 'The balance point is the smallest place whose prefix weight is at least (total + 1) // 2.', 'Find it with a descent over powers of two instead of a binary search with prefix sums.'],
    program: {
      io: ['n:int q:int', 'w:int[n]', 'ops:int[q][3]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        t = [0] * (n + 1)
        cur = [0] + w
        total = 0
        for i in range(1, n + 1):
            bit_add(t, i, cur[i])
            total += cur[i]
        top = 1
        while top * 2 <= n:
            top *= 2
        out = []
        for kind, x, y in ops:
            if kind == 1:
                bit_add(t, x, y - cur[x])
                total += y - cur[x]
                cur[x] = y
            else:
                k = (total + 1) // 2
                pos = 0
                step = top
                while step:
                    if pos + step <= n and t[pos + step] < k:
                        pos += step
                        k -= t[pos]
                    step >>= 1
                out.append(pos + 1)
        print(*out)`,
      cpp: r`
        vector<long long> t(n + 1, 0), cur(n + 1, 0);
        long long total = 0;
        for (long long i = 1; i <= n; i++) {
            cur[i] = w[i - 1];
            bitAdd(t, i, cur[i]);
            total += cur[i];
        }
        long long top = 1;
        while (top * 2 <= n) top *= 2;
        string out;
        for (long long j = 0; j < q; j++) {
            long long kind = ops[j][0], x = ops[j][1], y = ops[j][2];
            if (kind == 1) {
                bitAdd(t, x, y - cur[x]);
                total += y - cur[x];
                cur[x] = y;
            } else {
                long long k = (total + 1) / 2, pos = 0;
                for (long long step = top; step > 0; step >>= 1) {
                    if (pos + step <= n && t[pos + step] < k) {
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
        int m = (int) n;
        long[] t = new long[m + 1];
        long[] cur = new long[m + 1];
        long total = 0;
        for (int i = 1; i <= m; i++) {
            cur[i] = w[i - 1];
            bitAdd(t, i, cur[i]);
            total += cur[i];
        }
        int top = 1;
        while (top * 2 <= m) top *= 2;
        StringBuilder out = new StringBuilder();
        for (int j = 0; j < q; j++) {
            long kind = ops[j][0];
            int x = (int) ops[j][1];
            long y = ops[j][2];
            if (kind == 1) {
                bitAdd(t, x, y - cur[x]);
                total += y - cur[x];
                cur[x] = y;
            } else {
                long k = (total + 1) / 2;
                int pos = 0;
                for (int step = top; step > 0; step >>= 1) {
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
    solution: { explanation: ['A Fenwick tree stores the weights and the total is kept in a variable. The balance point is the smallest place whose prefix weight reaches (total + 1) / 2, found by a descent over the powers of two.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const w = nums(rs[1]); const f = new Fen(n); const cur = [0, ...w]; let total = 0; for (let i = 1; i <= n; i++) { f.add(i, cur[i]); total += cur[i]; }
      let top = 1; while (top * 2 <= n) top *= 2; const out = [];
      for (let j = 0; j < q; j++) { const [t, x, y] = nums(rs[2 + j]); if (t === 1) { f.add(x, y - cur[x]); total += y - cur[x]; cur[x] = y; } else { let k = Math.floor((total + 1) / 2), pos = 0; for (let step = top; step > 0; step >>= 1) if (pos + step <= n && f.t[pos + step] < k) { pos += step; k -= f.t[pos]; } out.push(pos + 1); } } return out.join(' ');
    },
    tests() {
      const g = rng(4803); const out = ['5 5\n2 1 4 1 2\n2 0 0\n1 3 0\n2 0 0\n1 5 10\n2 0 0\n', '1 2\n7\n2 0 0\n2 0 0\n'];
      const make = (n, q, wmax, pZero) => {
        const w = many(n, () => (g() < pZero ? 0 : randInt(g, 1, wmax))); if (w.every((v) => v === 0)) w[randInt(g, 0, n - 1)] = randInt(g, 1, wmax);
        const cur = [0, ...w]; let total = w.reduce((s, v) => s + v, 0); const ops = []; let asked = 0;
        for (let i = 0; i < q; i++) { if (g() < 0.5 && total > 0) { ops.push([2, 0, 0]); asked++; } else { const x = randInt(g, 1, n); let y = g() < pZero ? 0 : randInt(g, 1, wmax); if (y === 0 && total - cur[x] <= 0) y = randInt(g, 1, wmax); ops.push([1, x, y]); total += y - cur[x]; cur[x] = y; } }
        if (asked === 0) ops[ops.length - 1] = [2, 0, 0];
        if (total <= 0) throw new Error('empty road at the end');
        return `${n} ${q}\n${w.join(' ')}\n${lines(ops)}\n`;
      };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const w = [0, ...nums(rs[1])]; const res = []; for (let j = 0; j < q; j++) { const [t, x, y] = nums(rs[2 + j]); if (t === 1) w[x] = y; else { let total = 0; for (let i = 1; i <= n; i++) total += w[i]; let s = 0; for (let p = 1; p <= n; p++) { s += w[p]; if (2 * s >= total) { res.push(p); break; } } } } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 9), randInt(g, 2, 12), 5, 0.3), (i) => this.solve(i), brute, 800);
      for (const [n, q, wmax, pz] of [[20, 30, 10, 0.3], [300, 300, 1000, 0.5], [3000, 3000, 1000000000, 0.2], [50000, 50000, 1000000000, 0.1], [50000, 50000, 1000000000, 0.7], [49999, 50000, 5, 0.9], [50000, 49999, 1, 0.5], [32768, 50000, 1000000000, 0.3]]) out.push(make(n, q, wmax, pz));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of beads.', 'The second line has `n` colour numbers: the present order.', 'The third line has `n` colour numbers: the wanted order. It has the same colours as the present order, each the same number of times.'],
    constraints: ['1 <= n <= 50000', '1 <= colour <= 10^9', 'The two orders contain the same colours with the same counts.'],
    slug: 'fewest-neighbour-swaps-to-match',
    title: 'The Fewest Neighbour Swaps to Match Another Order',
    tags: ['fenwick-tree', 'inversions', 'adjacent-swaps', 'matching'],
    concept: {
      title: 'Match equal colours in order, and the answer is the number of inversions of the matching',
      body: [
        'Beads in a row can be exchanged only with a **neighbour**. What is the fewest number of exchanges that turns the row `1 2 1 2` into `2 2 1 1`? Each exchange of two neighbours fixes at most one pair of beads that are in the wrong relative order, so the answer is the number of pairs that must be reversed, an **inversion count**.',
        'With all colours different, give each bead of the present row the position it must reach in the wanted row. This gives a permutation `pos`, and the answer is the number of pairs `i < j` with `pos[i] > pos[j]`. When colours repeat, equal beads should never be swapped with each other (that wastes a move), so the **k-th bead of a colour in the present row is matched with the k-th bead of that colour in the wanted row**. After this matching the targets are all different again.',
        { code: 'where = {}                                  # colour -> positions in the wanted row\nfor j, v in enumerate(b): where.setdefault(v, []).append(j)\nused = {}\nfor i in range(n):\n    k = used.get(a[i], 0); used[a[i]] = k + 1\n    p = where[a[i]][k] + 1                  # where this bead has to go\n    inv += i - bit_sum(t, p)                # earlier beads that go further right\n    bit_add(t, p, 1)' },
        'A Fenwick tree over the targets counts, for every bead, how many earlier beads have a larger target: that is `i` minus the earlier ones with a target at most `p`. The sum over all beads is the answer, up to about `n^2 / 2` (so use 64-bit numbers). Time O(n log n).'
      ]
    },
    statement: ['A row of `n` beads has colours `a[1..n]`. In one move you may swap two beads that stand next to each other. Find the fewest moves that turn the row into the colours `b[1..n]` (the same colours, each the same number of times). Print this number.'],
    outputFormat: ['Print one number: the fewest moves.'],
    examples: [{ input: '4\n1 2 1 2\n2 2 1 1\n', note: 'Move the first 2 to the front (1 move: 2 1 1 2), then the last 2 to the second place (2 moves): 3 moves in total.' }],
    hints: ['A move that swaps two neighbours repairs at most one pair that stands in the wrong order, so count the pairs.', 'Match the k-th bead of a colour in the first row with the k-th bead of that colour in the second row; never swap equal colours.', 'After the matching, count the inversions of the target positions with a Fenwick tree.'],
    program: {
      io: ['n:int', 'a:int[n]', 'b:int[n]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        where = {}
        for j, v in enumerate(b):
            where.setdefault(v, []).append(j)
        used = {}
        t = [0] * (n + 1)
        inv = 0
        for i in range(n):
            k = used.get(a[i], 0)
            used[a[i]] = k + 1
            p = where[a[i]][k] + 1
            inv += i - bit_sum(t, p)
            bit_add(t, p, 1)
        print(inv)`,
      cpp: r`
        map<long long, vector<long long>> where;
        for (long long j = 0; j < n; j++) where[b[j]].push_back(j);
        map<long long, long long> used;
        vector<long long> t(n + 1, 0);
        long long inv = 0;
        for (long long i = 0; i < n; i++) {
            long long k = used[a[i]]++;
            long long p = where[a[i]][k] + 1;
            inv += i - bitSum(t, p);
            bitAdd(t, p, 1);
        }
        cout << inv << "\n";`,
      java: r`
        long[] kb = new long[(int) n];
        for (int j = 0; j < n; j++) kb[j] = (b[j] << 17) | j;
        Arrays.sort(kb);
        int[] used = new int[(int) n];
        long[] t = new long[(int) n + 1];
        long inv = 0;
        for (int i = 0; i < n; i++) {
            int s = lowerBound(kb, a[i] << 17);
            int p = (int) (kb[s + used[s]] & 131071) + 1;
            used[s]++;
            inv += i - bitSum(t, p);
            bitAdd(t, p, 1);
        }
        System.out.println(inv);`,
      helpers: { python: FENWICK.python, cpp: FENWICK.cpp, java: dedent(FENWICK.java) + '\n\n' + dedent(LOWER_BOUND_JAVA) },
      includes: ['<map>']
    },
    solution: { explanation: ['The k-th bead of every colour in the first row is matched with the k-th bead of that colour in the second row. The answer is the number of inversions of the matched target positions, counted with a Fenwick tree.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const a = nums(rs[1]); const b = nums(rs[2]); const where = new Map(); for (let j = 0; j < n; j++) { if (!where.has(b[j])) where.set(b[j], []); where.get(b[j]).push(j); }
      const used = new Map(); const f = new Fen(n); let inv = 0; for (let i = 0; i < n; i++) { const k = used.get(a[i]) || 0; used.set(a[i], k + 1); const p = where.get(a[i])[k] + 1; inv += i - f.sum(p); f.add(p, 1); } return inv; // inversions of the matched positions
    },
    tests() {
      const g = rng(4804); const out = ['4\n1 2 1 2\n2 2 1 1\n', '1\n5\n5\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const cur = nums(rs[1]); const b = nums(rs[2]); let moves = 0; for (let i = 0; i < n; i++) { let j = i; while (cur[j] !== b[i]) j++; while (j > i) { [cur[j], cur[j - 1]] = [cur[j - 1], cur[j]]; j--; moves++; } } return moves; }; // bring each wanted bead forward by swapping neighbours
      const make = (n, hi, mode) => { const a = randArray(g, n, 1, hi); let b; if (mode === 'rev') b = [...a].reverse(); else if (mode === 'sorted') b = [...a].sort((x, y) => x - y); else b = shuffle(g, a); return `${n}\n${a.join(' ')}\n${b.join(' ')}\n`; };
      crossCheck(() => make(randInt(g, 1, 10), 3, 'shuffle'), (i) => this.solve(i), brute, 800);
      crossCheck(() => make(randInt(g, 1, 9), 1000, 'shuffle'), (i) => this.solve(i), brute, 300);
      for (const [n, hi, mode] of [[20, 4, 'shuffle'], [300, 50, 'shuffle'], [3000, 1000000000, 'shuffle'], [50000, 1000000000, 'shuffle'], [50000, 3, 'shuffle'], [50000, 1000000000, 'rev'], [50000, 100, 'sorted'], [49999, 20000, 'shuffle']]) out.push(make(n, hi, mode));
      out.push(`3\n7 7 7\n7 7 7\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the length of the list.', 'The second line has the `n` numbers of the list.'],
    constraints: ['1 <= n <= 50000', '1 <= a[i] <= 10^9'],
    slug: 'rising-triples',
    title: 'Count the Rising Triples',
    tags: ['fenwick-tree', 'counting', 'coordinate-compression', 'subsequences'],
    concept: {
      title: 'Fix the middle element: the triples through it are the smaller numbers on its left times the larger numbers on its right',
      body: [
        'A **rising triple** is a choice of three positions `i < j < k` with `a[i] < a[j] < a[k]`. In `1 2 3 1 4` the triples at the positions `1 2 3`, `1 2 5`, `1 3 5` and `2 3 5` rise, so there are 4. Checking all triples is O(n^3), which is hopeless for 50000 numbers.',
        'Look at the **middle** element `j`. Any smaller number on its left can be the first element, and any larger number on its right can be the last one, independently. So the number of triples with the middle `j` is `smallerLeft[j] * largerRight[j]`, and the answer is the sum over all `j`. Both counts come from a Fenwick tree over the **ranks** of the values (numbers up to `10^9` are replaced by their rank among the distinct values).',
        { code: 'for j in range(n):                       # left to right\n    smaller[j] = bit_sum(t, rk[j] - 1)    # earlier values below\n    bit_add(t, rk[j], 1)\nfor j in range(n - 1, -1, -1):           # right to left, a fresh tree\n    larger = (n - 1 - j) - bit_sum(t2, rk[j])   # later values above\n    total += smaller[j] * larger\n    bit_add(t2, rk[j], 1)' },
        'The count of later values above is "all later values" minus "later values that are at most `a[j]`" (equal values are not larger). The answer can reach about `n^3 / 6`, which is more than 2 * 10^13 for 50000 numbers, so it needs 64-bit integers. Time O(n log n).'
      ]
    },
    statement: ['A list of `n` numbers is given. Count the triples of positions `i < j < k` for which `a[i] < a[j] < a[k]` holds with both signs strict. Print the count.'],
    outputFormat: ['Print one number: the count of rising triples.'],
    examples: [{ input: '5\n1 2 3 1 4\n', note: 'The triples of positions (1, 2, 3), (1, 2, 5), (1, 3, 5) and (2, 3, 5) have rising values: 4.' }],
    hints: ['Fix the middle element of the triple.', 'The number of triples with the middle j is (smaller numbers before j) times (larger numbers after j).', 'Both counts come from a Fenwick tree over the ranks of the values, one pass from each side.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        vals = sorted(set(a))
        rank = {v: i + 1 for i, v in enumerate(vals)}
        m = len(vals)
        rk = [rank[v] for v in a]
        smaller = [0] * n
        t = [0] * (m + 1)
        for j in range(n):
            smaller[j] = bit_sum(t, rk[j] - 1)
            bit_add(t, rk[j], 1)
        t = [0] * (m + 1)
        total = 0
        for j in range(n - 1, -1, -1):
            larger = (n - 1 - j) - bit_sum(t, rk[j])
            total += smaller[j] * larger
            bit_add(t, rk[j], 1)
        print(total)`,
      cpp: r`
        vector<long long> vals(a.begin(), a.end());
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        long long m = vals.size();
        vector<long long> rk(n), smaller(n, 0);
        for (long long i = 0; i < n; i++) rk[i] = lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin() + 1;
        vector<long long> t(m + 1, 0);
        for (long long j = 0; j < n; j++) {
            smaller[j] = bitSum(t, rk[j] - 1);
            bitAdd(t, rk[j], 1);
        }
        fill(t.begin(), t.end(), 0);
        long long total = 0;
        for (long long j = n - 1; j >= 0; j--) {
            long long larger = (n - 1 - j) - bitSum(t, rk[j]);
            total += smaller[j] * larger;
            bitAdd(t, rk[j], 1);
        }
        cout << total << "\n";`,
      java: r`
        long[] keys = new long[(int) n];
        for (int i = 0; i < n; i++) keys[i] = (a[i] << 16) | i;
        Arrays.sort(keys);
        int[] rk = new int[(int) n];
        int m = 0;
        long prev = -1;
        for (int i = 0; i < n; i++) {
            long v = keys[i] >> 16;
            if (v != prev) {
                m++;
                prev = v;
            }
            rk[(int) (keys[i] & 65535)] = m;
        }
        long[] smaller = new long[(int) n];
        long[] t = new long[m + 1];
        for (int j = 0; j < n; j++) {
            smaller[j] = bitSum(t, rk[j] - 1);
            bitAdd(t, rk[j], 1);
        }
        t = new long[m + 1];
        long total = 0;
        for (int j = (int) n - 1; j >= 0; j--) {
            long larger = (n - 1 - j) - bitSum(t, rk[j]);
            total += smaller[j] * larger;
            bitAdd(t, rk[j], 1);
        }
        System.out.println(total);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['For every middle element the triples are the smaller numbers before it times the larger numbers after it. Two Fenwick passes over the ranks of the values give both counts.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const a = nums(rs[1]); const vals = [...new Set(a)].sort((x, y) => x - y); const rk = a.map((v) => lowerBound(vals, v) + 1); const m = vals.length;
      const smaller = new Array(n).fill(0); let f = new Fen(m); for (let j = 0; j < n; j++) { smaller[j] = f.sum(rk[j] - 1); f.add(rk[j], 1); } f = new Fen(m); let total = 0; for (let j = n - 1; j >= 0; j--) { total += smaller[j] * ((n - 1 - j) - f.sum(rk[j])); f.add(rk[j], 1); } return total;
    },
    tests() {
      const g = rng(4805); const out = ['5\n1 2 3 1 4\n', '3\n1 1 1\n', '1\n9\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const a = nums(rs[1]); let c = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (a[i] < a[j]) for (let k = j + 1; k < n; k++) if (a[j] < a[k]) c++; return c; };
      const make = (n, hi) => `${n}\n${randArray(g, n, 1, hi).join(' ')}\n`;
      crossCheck(() => make(randInt(g, 1, 14), 5), (i) => this.solve(i), brute, 800);
      crossCheck(() => make(randInt(g, 1, 14), 1000000000), (i) => this.solve(i), brute, 200);
      for (const [n, hi] of [[30, 10], [300, 100], [3000, 1000000000], [50000, 1000000000], [50000, 10], [50000, 1000], [49999, 200000]]) out.push(make(n, hi));
      out.push(`50000\n${many(50000, (i) => 1 + i * 20000).join(' ')}\n`);
      out.push(`50000\n${many(50000, (i) => 1000000000 - i * 20000).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `k`: the length of the list and the wanted length.', 'The second line has the `n` numbers of the list.'],
    constraints: ['1 <= n <= 20000', '1 <= k <= 8', '1 <= a[i] <= 10^9'],
    slug: 'rising-subsequences-of-length-k',
    title: 'Rising Subsequences of Exactly k Numbers',
    tags: ['fenwick-tree', 'dp', 'counting', 'subsequences', 'modular-arithmetic'],
    concept: {
      title: 'Count by length: the chains of length L ending at i are the sum of the chains of length L - 1 ending at smaller numbers before i',
      body: [
        'A **rising subsequence** keeps some of the numbers in their order, and the kept numbers must grow strictly. Two subsequences are different when they use different positions, even if the numbers are equal. In `1 3 2 4 2 5` the subsequences `1 3 4` and `1 2 4` are different, and so are the two that use the first and the second 2. The question is how many have **exactly `k` numbers**, modulo `1000000007`.',
        'Let `ways[L][i]` be the number of rising subsequences of the length `L` that **end at the position `i`**. For `L = 1` it is 1. For a longer chain the previous number must be at a position `j < i` with `a[j] < a[i]`, so `ways[L][i]` is the sum of `ways[L - 1][j]` over those `j`. A sum over "earlier and smaller" is a Fenwick prefix sum over the **ranks** of the values, filled as `i` moves from left to right.',
        { code: 'for length in range(2, k + 1):\n    t = [0] * (m + 1)                       # a fresh tree for every layer\n    for i in range(n):\n        cur[i] = bit_sum(t, rk[i] - 1) % MOD      # chains of length - 1 that end at a smaller value before i\n        bit_add(t, rk[i], prev[i])                # now i can be the last element of a shorter chain\n    prev = cur' },
        'The answer is the sum of `ways[k][i]` over all `i`. Strictness comes from asking only for ranks below `rk[i]`, so equal numbers never follow each other. The total work is O(k n log n); the values stay below `2 * 10^13` inside the tree, so a 64-bit integer is enough, and the modulus is applied when a layer value is stored.'
      ]
    },
    statement: ['A list of `n` numbers is given. A **rising subsequence** is a choice of positions `i1 < i2 < ... < ik` with `a[i1] < a[i2] < ... < a[ik]`. Count the rising subsequences with exactly `k` numbers; two of them are different if their sets of positions are different. Print the count modulo 1 000 000 007.'],
    outputFormat: ['Print one number: the count modulo 1000000007.'],
    examples: [{ input: '6 3\n1 3 2 4 2 5\n', note: 'The rising subsequences of 3 numbers by values are 1 3 4, 1 3 5, 1 2 4, 1 2 5 (using the first 2), 1 4 5, 1 2 5 (using the second 2), 3 4 5 and 2 4 5: 8.' }],
    hints: ['Count the subsequences of length L that end at each position.', 'To extend a chain you need the chains of length L - 1 that end at a smaller value earlier: a prefix sum over ranks.', 'Use one Fenwick tree per layer and apply the modulus when you store the layer value.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        MOD = 1000000007
        vals = sorted(set(a))
        rank = {v: i + 1 for i, v in enumerate(vals)}
        m = len(vals)
        rk = [rank[v] for v in a]
        prev = [1] * n
        for length in range(2, k + 1):
            t = [0] * (m + 1)
            cur = [0] * n
            for i in range(n):
                cur[i] = bit_sum(t, rk[i] - 1) % MOD
                bit_add(t, rk[i], prev[i])
            prev = cur
        print(sum(prev) % MOD)`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<long long> vals(a.begin(), a.end());
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        long long m = vals.size();
        vector<long long> rk(n);
        for (long long i = 0; i < n; i++) rk[i] = lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin() + 1;
        vector<long long> cur(n, 1), nxt(n, 0);
        for (long long length = 2; length <= k; length++) {
            vector<long long> t(m + 1, 0);
            for (long long i = 0; i < n; i++) {
                nxt[i] = bitSum(t, rk[i] - 1) % MOD;
                bitAdd(t, rk[i], cur[i]);
            }
            cur = nxt;
        }
        long long total = 0;
        for (long long i = 0; i < n; i++) total = (total + cur[i]) % MOD;
        cout << total << "\n";`,
      java: r`
        int cnt = (int) n;
        long MOD = 1000000007L;
        long[] keys = new long[cnt];
        for (int i = 0; i < cnt; i++) keys[i] = (a[i] << 16) | i;
        Arrays.sort(keys);
        int[] rk = new int[cnt];
        int m = 0;
        long last = -1;
        for (int i = 0; i < cnt; i++) {
            long v = keys[i] >> 16;
            if (v != last) {
                m++;
                last = v;
            }
            rk[(int) (keys[i] & 65535)] = m;
        }
        long[] cur = new long[cnt];
        Arrays.fill(cur, 1);
        for (int length = 2; length <= k; length++) {
            long[] t = new long[m + 1];
            long[] nxt = new long[cnt];
            for (int i = 0; i < cnt; i++) {
                nxt[i] = bitSum(t, rk[i] - 1) % MOD;
                bitAdd(t, rk[i], cur[i]);
            }
            cur = nxt;
        }
        long total = 0;
        for (int i = 0; i < cnt; i++) total = (total + cur[i]) % MOD;
        System.out.println(total);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['ways[L][i] counts the rising subsequences of length L that end at i. Each layer is a prefix sum of the previous layer over the ranks of the smaller values before i, kept in a Fenwick tree.'], complexity: 'Time O(k n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); const MOD = 1000000007; const vals = [...new Set(a)].sort((x, y) => x - y); const rk = a.map((v) => lowerBound(vals, v) + 1); const m = vals.length;
      let cur = new Array(n).fill(1); for (let len = 2; len <= k; len++) { const f = new Fen(m); const nxt = new Array(n).fill(0); for (let i = 0; i < n; i++) { nxt[i] = f.sum(rk[i] - 1) % MOD; f.add(rk[i], cur[i]); } cur = nxt; } return cur.reduce((s, v) => (s + v) % MOD, 0); // one tree per layer
    },
    tests() {
      const g = rng(4806); const out = ['6 3\n1 3 2 4 2 5\n', '3 5\n1 2 3\n', '1 1\n42\n'];
      const MOD = 1000000007;
      const brute = (input) => { const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); const go = (from, last, left) => { if (left === 0) return 1; let c = 0; for (let i = from; i < n; i++) if (a[i] > last) c += go(i + 1, a[i], left - 1); return c; }; return go(0, -Infinity, k) % MOD; }; // all subsets by recursion
      const make = (n, k, hi) => `${n} ${k}\n${randArray(g, n, 1, hi).join(' ')}\n`;
      crossCheck(() => make(randInt(g, 1, 13), randInt(g, 1, 6), 6), (i) => this.solve(i), brute, 800);
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 5), 1000000000), (i) => this.solve(i), brute, 200);
      for (const [n, k, hi] of [[30, 3, 10], [300, 4, 100], [3000, 5, 1000000000], [20000, 8, 1000000000], [20000, 8, 30], [20000, 5, 200], [19999, 2, 1000000000], [20000, 1, 50], [20000, 8, 8], [20000, 7, 1000]]) out.push(make(n, k, hi));
      out.push(`20000 8\n${many(20000, (i) => 1 + i * 40000).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `limit`: the length of the list and the largest allowed number of inversions.', 'The second line has the `n` numbers of the list.'],
    constraints: ['1 <= n <= 50000', '0 <= limit <= 2 * 10^9', '1 <= a[i] <= 10^9'],
    slug: 'longest-window-with-few-inversions',
    title: 'The Longest Window With Few Inversions',
    tags: ['fenwick-tree', 'two-pointers', 'inversions', 'sliding-window'],
    concept: {
      title: 'Two pointers keep the window, and a Fenwick tree updates its inversion count when one number enters or leaves',
      body: [
        'An **inversion** in a window is a pair of positions `i < j` with `a[i] > a[j]`. In the window `3 1 2` there are two: `(3, 1)` and `(3, 2)`. Find the **longest window** (a block of neighbouring numbers) with at most `limit` inversions. Counting the inversions of every window from scratch is far too slow.',
        'The inversion count of a window never decreases when the window grows to the right and never increases when it loses its first number. That is the monotonic property that makes **two pointers** work: extend the right end one step at a time, and while the count is above the limit, move the left end forward. All that is needed is the change of the count at each step, and a **Fenwick tree over the ranks of the values** in the window answers it.',
        { code: 'for hi in range(n):                              # the number a[hi] enters\n    inv += (hi - lo) - bit_sum(t, rk[hi])        # numbers already in the window that are larger\n    bit_add(t, rk[hi], 1)\n    while inv > limit:                           # the number a[lo] leaves\n        inv -= bit_sum(t, rk[lo] - 1)            # numbers after it in the window that are smaller\n        bit_add(t, rk[lo], -1)\n        lo += 1\n    best = max(best, hi - lo + 1)' },
        'When `a[hi]` enters, the new inversions are the numbers in the window larger than it (the window size minus those that are at most it). When `a[lo]` leaves, the inversions it took part in are the smaller numbers that stand after it. Every number enters and leaves once: O(n log n) in total. A window with one number has no inversions, so the answer is at least 1.'
      ]
    },
    statement: ['A list of `n` numbers is given. An **inversion** of a block of neighbouring numbers is a pair of positions `i < j` inside the block with `a[i] > a[j]` (equal numbers are not an inversion). Find the largest length of a block with at most `limit` inversions and print it.'],
    outputFormat: ['Print one number: the largest length of a block.'],
    examples: [{ input: '6 2\n3 1 2 5 4 6\n', note: 'The block 1 2 5 4 6 has only the inversion (5, 4). The blocks of length 6 and the block 3 1 2 5 4 have 3 inversions, which is too many: 5.' }],
    hints: ['If a block has few inversions, every smaller block inside it has at most as many.', 'Move the right end forward and the left end only when the count is above the limit.', 'Keep the window in a Fenwick tree over the ranks of the values to find how many inversions a number adds when it enters and removes when it leaves.'],
    program: {
      io: ['n:int limit:int', 'a:int[n]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        vals = sorted(set(a))
        rank = {v: i + 1 for i, v in enumerate(vals)}
        rk = [rank[v] for v in a]
        t = [0] * (len(vals) + 1)
        inv = 0
        lo = 0
        best = 0
        for hi in range(n):
            inv += (hi - lo) - bit_sum(t, rk[hi])
            bit_add(t, rk[hi], 1)
            while inv > limit:
                inv -= bit_sum(t, rk[lo] - 1)
                bit_add(t, rk[lo], -1)
                lo += 1
            best = max(best, hi - lo + 1)
        print(best)`,
      cpp: r`
        vector<long long> vals(a.begin(), a.end());
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        vector<long long> rk(n);
        for (long long i = 0; i < n; i++) rk[i] = lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin() + 1;
        vector<long long> t(vals.size() + 1, 0);
        long long inv = 0, lo = 0, best = 0;
        for (long long hi = 0; hi < n; hi++) {
            inv += (hi - lo) - bitSum(t, rk[hi]);
            bitAdd(t, rk[hi], 1);
            while (inv > limit) {
                inv -= bitSum(t, rk[lo] - 1);
                bitAdd(t, rk[lo], -1);
                lo++;
            }
            best = max(best, hi - lo + 1);
        }
        cout << best << "\n";`,
      java: r`
        int cnt = (int) n;
        long[] keys = new long[cnt];
        for (int i = 0; i < cnt; i++) keys[i] = (a[i] << 16) | i;
        Arrays.sort(keys);
        int[] rk = new int[cnt];
        int m = 0;
        long last = -1;
        for (int i = 0; i < cnt; i++) {
            long v = keys[i] >> 16;
            if (v != last) {
                m++;
                last = v;
            }
            rk[(int) (keys[i] & 65535)] = m;
        }
        long[] t = new long[m + 1];
        long inv = 0;
        int lo = 0, best = 0;
        for (int hi = 0; hi < cnt; hi++) {
            inv += (hi - lo) - bitSum(t, rk[hi]);
            bitAdd(t, rk[hi], 1);
            while (inv > limit) {
                inv -= bitSum(t, rk[lo] - 1);
                bitAdd(t, rk[lo], -1);
                lo++;
            }
            if (hi - lo + 1 > best) best = hi - lo + 1;
        }
        System.out.println(best);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The right end of the window moves forward and the left end moves only while the inversion count is above the limit. A Fenwick tree over the ranks of the values gives the inversions added by a number that enters and removed by a number that leaves.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, limit] = nums(rs[0]); const a = nums(rs[1]); const vals = [...new Set(a)].sort((x, y) => x - y); const rk = a.map((v) => lowerBound(vals, v) + 1); const f = new Fen(vals.length);
      let inv = 0, lo = 0, best = 0; for (let hi = 0; hi < n; hi++) { inv += (hi - lo) - f.sum(rk[hi]); f.add(rk[hi], 1); while (inv > limit) { inv -= f.sum(rk[lo] - 1); f.add(rk[lo], -1); lo++; } best = Math.max(best, hi - lo + 1); } return best;
    },
    tests() {
      const g = rng(4807); const out = ['6 2\n3 1 2 5 4 6\n', '1 0\n5\n', '4 0\n4 3 2 1\n'];
      const brute = (input) => { const rs = rows(input); const [n, limit] = nums(rs[0]); const a = nums(rs[1]); let best = 0; for (let l = 0; l < n; l++) { let inv = 0; for (let r2 = l; r2 < n; r2++) { for (let i = l; i < r2; i++) if (a[i] > a[r2]) inv++; if (inv > limit) break; best = Math.max(best, r2 - l + 1); } } return best; }; // every start, grow until the limit is passed
      const make = (n, limit, hi, mode) => { let a = randArray(g, n, 1, hi); if (mode === 'sorted') a = a.sort((x, y) => x - y); else if (mode === 'desc') a = a.sort((x, y) => y - x); else if (mode === 'nearly') { a = a.sort((x, y) => x - y); for (let i = 0; i < n / 20; i++) { const x = randInt(g, 0, n - 1), y = randInt(g, 0, n - 1); [a[x], a[y]] = [a[y], a[x]]; } } return `${n} ${limit}\n${a.join(' ')}\n`; };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 0, 20), 5, 'random'), (i) => this.solve(i), brute, 800);
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 0, 10), 1000000000, 'nearly'), (i) => this.solve(i), brute, 200);
      for (const [n, limit, hi, mode] of [[30, 10, 10, 'random'], [300, 500, 100, 'random'], [3000, 100000, 1000000000, 'random'], [50000, 2000000000, 1000000000, 'random'], [50000, 3000000, 1000000000, 'random'], [50000, 100000, 50, 'random'], [50000, 0, 1000000000, 'nearly'], [50000, 50000, 1000000000, 'nearly'], [50000, 700000, 1000000000, 'desc'], [50000, 0, 1000000000, 'sorted'], [49999, 1500, 1000, 'random']]) out.push(make(n, limit, hi, mode));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, `lo` and `hi`: the length of the list and the two bounds.', 'The second line has the `n` numbers of the list.'],
    constraints: ['1 <= n <= 50000', '|a[i]| <= 10^9', '-10^14 <= lo <= hi <= 10^14'],
    slug: 'count-blocks-with-sum-in-bounds',
    title: 'Blocks With a Sum Between Two Bounds, Negatives Allowed',
    tags: ['fenwick-tree', 'prefix-sum', 'coordinate-compression', 'counting'],
    concept: {
      title: 'A block sum is a difference of two prefix sums, so count the earlier prefix sums that fall into a window',
      body: [
        'Count the blocks of neighbouring numbers whose sum is **at least `lo` and at most `hi`**. For `2 -1 3` with `lo = 1` and `hi = 3` the good blocks are `[2]`, `[3]`, `[2 -1]` and `[-1 3]`: the sums are 2, 3, 1 and 2, while `[-1]` and `[2 -1 3]` have the sums -1 and 4. With only positive numbers a sliding window could do it, but negative numbers break the monotonic behaviour of the sum.',
        'Write the sum of the block `u+1 .. v` as `P[v] - P[u]` with the prefix sums `P[0] = 0`, `P[i] = a[1] + ... + a[i]`. The condition `lo <= P[v] - P[u] <= hi` becomes **`P[v] - hi <= P[u] <= P[v] - lo`**. So for every `v` we need the number of earlier prefix sums in a numeric window. Sort and compress all prefix sums to ranks, and keep a Fenwick tree with one count per rank.',
        { code: 'for v in pre:                                   # pre = P[0..n]\n    first = bisect_left(vals, v - hi)           # ranks below the window\n    last = bisect_right(vals, v - lo)           # ranks up to the window end\n    total += bit_sum(t, last) - bit_sum(t, first)\n    bit_add(t, bisect_left(vals, v) + 1, 1)     # now P[v] can be an earlier prefix sum' },
        'Because the count is taken before `P[v]` itself is inserted, only the pairs `u < v` are counted. Prefix sums reach `5 * 10^13`, so 64-bit numbers are needed, and the answer can be about `n^2 / 2`. Time O(n log n).'
      ]
    },
    statement: ['A list of `n` numbers (possibly negative) is given. Count the blocks of neighbouring numbers (at least one number) whose sum is at least `lo` and at most `hi`. Blocks at different positions count separately, even if their numbers are equal. Print the count.'],
    outputFormat: ['Print one number: the count of blocks.'],
    examples: [{ input: '3 1 3\n2 -1 3\n', note: 'The blocks [2], [3], [2 -1] and [-1 3] have the sums 2, 3, 1 and 2. The blocks [-1] and [2 -1 3] have the sums -1 and 4: 4.' }],
    hints: ['The sum of a block is a difference of two prefix sums.', 'For every end v you need the number of earlier prefix sums between P[v] - hi and P[v] - lo.', 'Compress the prefix sums and count the earlier ones in a Fenwick tree, using binary search to find the ends of the window.'],
    program: {
      io: ['n:int lo:int hi:int', 'a:int[n]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        from bisect import bisect_left, bisect_right
        pre = [0]
        for x in a:
            pre.append(pre[-1] + x)
        vals = sorted(set(pre))
        t = [0] * (len(vals) + 1)
        total = 0
        for v in pre:
            first = bisect_left(vals, v - hi)
            last = bisect_right(vals, v - lo)
            total += bit_sum(t, last) - bit_sum(t, first)
            bit_add(t, bisect_left(vals, v) + 1, 1)
        print(total)`,
      cpp: r`
        vector<long long> pre(n + 1, 0);
        for (long long i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
        vector<long long> vals(pre);
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        vector<long long> t(vals.size() + 1, 0);
        long long total = 0;
        for (long long v = 0; v <= n; v++) {
            long long first = lower_bound(vals.begin(), vals.end(), pre[v] - hi) - vals.begin();
            long long last = upper_bound(vals.begin(), vals.end(), pre[v] - lo) - vals.begin();
            total += bitSum(t, last) - bitSum(t, first);
            bitAdd(t, lower_bound(vals.begin(), vals.end(), pre[v]) - vals.begin() + 1, 1);
        }
        cout << total << "\n";`,
      java: r`
        int cnt = (int) n;
        long[] pre = new long[cnt + 1];
        for (int i = 0; i < cnt; i++) pre[i + 1] = pre[i] + a[i];
        long[] sorted = pre.clone();
        Arrays.sort(sorted);
        int m = 0;
        for (int i = 0; i <= cnt; i++) {
            if (i == 0 || sorted[i] != sorted[i - 1]) sorted[m++] = sorted[i];
        }
        long[] vals = Arrays.copyOf(sorted, m);
        long[] t = new long[m + 1];
        long total = 0;
        for (int v = 0; v <= cnt; v++) {
            int first = lowerBound(vals, pre[v] - hi);
            int last = lowerBound(vals, pre[v] - lo + 1);
            total += bitSum(t, last) - bitSum(t, first);
            bitAdd(t, lowerBound(vals, pre[v]) + 1, 1);
        }
        System.out.println(total);`,
      helpers: { python: FENWICK.python, cpp: FENWICK.cpp, java: dedent(FENWICK.java) + '\n\n' + dedent(LOWER_BOUND_JAVA) },
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Block sums are differences of prefix sums. For every prefix sum the earlier prefix sums that fall into the window [P[v] - hi, P[v] - lo] are counted with a Fenwick tree over the compressed values.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, lo, hi] = nums(rs[0]); const a = nums(rs[1]); const pre = [0]; for (const x of a) pre.push(pre[pre.length - 1] + x); const vals = [...new Set(pre)].sort((x, y) => x - y); const f = new Fen(vals.length);
      let total = 0; for (const v of pre) { total += f.sum(upperBound(vals, v - lo)) - f.sum(lowerBound(vals, v - hi)); f.add(lowerBound(vals, v) + 1, 1); } return total;
    },
    tests() {
      const g = rng(4808); const out = ['3 1 3\n2 -1 3\n', '1 0 0\n0\n', '2 -5 -1\n-3 4\n'];
      const brute = (input) => { const rs = rows(input); const [n, lo, hi] = nums(rs[0]); const a = nums(rs[1]); let c = 0; for (let i = 0; i < n; i++) { let s = 0; for (let j = i; j < n; j++) { s += a[j]; if (s >= lo && s <= hi) c++; } } return c; };
      const make = (n, amp, spread) => { const a = many(n, () => randInt(g, -amp, amp)); let lo = randInt(g, -spread, spread), hi = randInt(g, -spread, spread); if (lo > hi) [lo, hi] = [hi, lo]; return `${n} ${lo} ${hi}\n${a.join(' ')}\n`; };
      crossCheck(() => make(randInt(g, 1, 12), 5, 12), (i) => this.solve(i), brute, 800);
      crossCheck(() => make(randInt(g, 1, 12), 1000000000, 3000000000), (i) => this.solve(i), brute, 200);
      for (const [n, amp, sp] of [[30, 10, 30], [300, 100, 300], [3000, 1000000000, 2000000000], [50000, 1000000000, 1000000000], [50000, 1000000000, 100000000000000], [50000, 5, 100], [50000, 1000, 200000], [49999, 1000000, 1000000000], [50000, 1000000000, 20000000000]]) out.push(make(n, amp, sp));
      out.push(`50000 -50000000000000 50000000000000\n${many(50000, () => randInt(g, -1000000000, 1000000000)).join(' ')}\n`);
      out.push(`50000 0 0\n${many(50000, (i) => (i % 2 === 0 ? 7 : -7)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of segments.', 'Each of the next `n` lines has two numbers `l` and `r`: the ends of a segment.'],
    constraints: ['1 <= n <= 50000', '1 <= l <= r <= 10^9'],
    slug: 'nested-segment-pairs',
    title: 'Pairs of Segments Where One Lies Inside the Other',
    tags: ['fenwick-tree', 'sorting', 'intervals', 'counting'],
    concept: {
      title: 'Sort by the left end (the longer first on a tie), then count the earlier segments that reach at least as far to the right',
      body: [
        'A segment `[l1, r1]` **lies inside** `[l2, r2]` when `l2 <= l1` and `r1 <= r2`. Count the pairs of segments where one lies inside the other. Segments that are equal count as a pair (each lies inside the other), and the pair is counted once. For `[1,5] [2,3] [2,3] [4,6]` the pairs are `[1,5]` with each `[2,3]`, and the two `[2,3]` together: 3. Checking all pairs is O(n^2).',
        'Sort the segments by the left end **ascending, and for equal left ends by the right end descending**. In this order, when a segment `i` is processed, every earlier segment `j` has `l_j <= l_i`, and if the left ends are equal then `r_j >= r_i`. So an earlier segment contains `i` exactly when `r_j >= r_i`. A pair is therefore counted exactly once: when the later (smaller or equal) segment is processed.',
        { code: 'order.sort(key=lambda i: (l[i], -r[i]))\nfor c, i in enumerate(order):              # c segments came before\n    e = rank[r[i]]\n    total += c - bit_sum(t, e - 1)         # earlier segments with a right end >= r[i]\n    bit_add(t, e, 1)' },
        'A Fenwick tree over the ranks of the right ends counts the earlier segments with a smaller right end, so `c - bit_sum(t, e - 1)` is the number of earlier segments that reach at least as far. The ties are handled by the sort order: for equal segments, the earlier one counts for the later one, never the other way round. The answer can be about `n^2 / 2`. Time O(n log n).'
      ]
    },
    statement: ['`n` segments on a line are given by their ends. Count the pairs of different segments (different positions in the list) such that one of them lies inside the other, that is, `l` of the inner one is at least `l` of the outer one and `r` of the inner one is at most `r` of the outer one. Equal segments form such a pair, and each pair is counted once. Print the count.'],
    outputFormat: ['Print one number: the count of pairs.'],
    examples: [{ input: '4\n1 5\n2 3\n2 3\n4 6\n', note: 'The segment [1,5] contains both [2,3] (2 pairs), and the two [2,3] contain each other (1 pair). The segment [4,6] is only partly inside [1,5]: 3.' }],
    hints: ['Sort so that a containing segment always comes before the segment it contains.', 'Sort by the left end ascending and by the right end descending when the left ends are equal.', 'For each segment, count the earlier ones with a right end at least as large, using a Fenwick tree over the ranks of the right ends.'],
    program: {
      io: ['n:int', 'segs:int[n][2]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        order = sorted(range(n), key=lambda i: (segs[i][0], -segs[i][1]))
        ends = sorted(set(s[1] for s in segs))
        rank = {v: i + 1 for i, v in enumerate(ends)}
        t = [0] * (len(ends) + 1)
        total = 0
        for c, i in enumerate(order):
            e = rank[segs[i][1]]
            total += c - bit_sum(t, e - 1)
            bit_add(t, e, 1)
        print(total)`,
      cpp: r`
        vector<pair<long long, long long>> v(n);
        for (long long i = 0; i < n; i++) v[i] = make_pair(segs[i][0], segs[i][1]);
        sort(v.begin(), v.end(), [](const pair<long long, long long>& x, const pair<long long, long long>& y) {
            if (x.first != y.first) return x.first < y.first;
            return x.second > y.second;
        });
        vector<long long> ends(n);
        for (long long i = 0; i < n; i++) ends[i] = v[i].second;
        sort(ends.begin(), ends.end());
        ends.erase(unique(ends.begin(), ends.end()), ends.end());
        vector<long long> t(ends.size() + 1, 0);
        long long total = 0;
        for (long long c = 0; c < n; c++) {
            long long e = lower_bound(ends.begin(), ends.end(), v[c].second) - ends.begin() + 1;
            total += c - bitSum(t, e - 1);
            bitAdd(t, e, 1);
        }
        cout << total << "\n";`,
      java: r`
        int cnt = (int) n;
        long big = 1000000000L;
        long[] keys = new long[cnt];
        long[] ends = new long[cnt];
        for (int i = 0; i < cnt; i++) {
            keys[i] = (segs[i][0] << 30) | (big - segs[i][1]);
            ends[i] = segs[i][1];
        }
        Arrays.sort(keys);
        Arrays.sort(ends);
        int m = 0;
        for (int i = 0; i < cnt; i++) {
            if (i == 0 || ends[i] != ends[i - 1]) ends[m++] = ends[i];
        }
        long[] uniq = Arrays.copyOf(ends, m);
        long[] t = new long[m + 1];
        long total = 0;
        for (int c = 0; c < cnt; c++) {
            long r = big - (keys[c] & ((1L << 30) - 1));
            int e = lowerBound(uniq, r) + 1;
            total += c - bitSum(t, e - 1);
            bitAdd(t, e, 1);
        }
        System.out.println(total);`,
      helpers: { python: FENWICK.python, cpp: FENWICK.cpp, java: dedent(FENWICK.java) + '\n\n' + dedent(LOWER_BOUND_JAVA) },
      includes: ['<algorithm>', '<utility>']
    },
    solution: { explanation: ['After sorting by the left end ascending and the right end descending, a segment contains the current one exactly when it is earlier and its right end is at least as large. A Fenwick tree over the ranks of the right ends counts them.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const segs = many(n, (i) => nums(rs[1 + i])); const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => segs[x][0] - segs[y][0] || segs[y][1] - segs[x][1]);
      const ends = [...new Set(segs.map((s) => s[1]))].sort((x, y) => x - y); const f = new Fen(ends.length); let total = 0; order.forEach((i, c) => { const e = lowerBound(ends, segs[i][1]) + 1; total += c - f.sum(e - 1); f.add(e, 1); }); return total;
    },
    tests() {
      const g = rng(4809); const out = ['4\n1 5\n2 3\n2 3\n4 6\n', '1\n7 7\n', '2\n3 3\n3 3\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const segs = many(n, (i) => nums(rs[1 + i])); let c = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const [l1, r1] = segs[i], [l2, r2] = segs[j]; if ((l2 >= l1 && r2 <= r1) || (l1 >= l2 && r1 <= r2)) c++; } return c; };
      const make = (n, hi, maxLen) => `${n}\n${lines(many(n, () => { const l = randInt(g, 1, hi); return [l, Math.min(hi, l + randInt(g, 0, maxLen))]; }))}\n`;
      crossCheck(() => make(randInt(g, 1, 12), 8, 5), (i) => this.solve(i), brute, 800);
      crossCheck(() => make(randInt(g, 1, 12), 1000000000, 1000000000), (i) => this.solve(i), brute, 200);
      for (const [n, hi, len] of [[30, 20, 10], [300, 100, 50], [3000, 1000000000, 1000000000], [50000, 1000000000, 1000000000], [30000, 1000000000, 1000], [50000, 1000, 500], [50000, 30, 30], [30000, 1000000, 100000]]) out.push(make(n, hi, len));
      out.push(`50000\n${many(50000, () => '5 5').join('\n')}\n`);
      out.push(`50000\n${many(50000, (i) => `${1 + i} ${1000000000 - i}`).join('\n')}\n`);
      out.push(`50000\n${many(50000, (i) => `${1 + i * 10} ${5 + i * 10}`).join('\n')}\n`);
      return out;
    }
  }
];
