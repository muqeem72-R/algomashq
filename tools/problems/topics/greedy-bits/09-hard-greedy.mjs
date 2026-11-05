import { r, rng, randInt, randBig, many, nums, rows, bigs, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const lines = (list) => list.map((p) => p.join(' ')).join('\n');
const rowsOfNums = (input, from, count) => { const rs = rows(input); return many(count, (i) => nums(rs[from + i])); };
const cmpBig = (x, y) => (x < y ? -1 : x > y ? 1 : 0);

// a small binary min-heap of numbers or BigInts for the reference solutions
class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  top() { return this.a[0]; }
  push(x) { const a = this.a; a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p] <= a[i]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a; const top = a[0]; const last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, rr = l + 1; let m = i; if (l < a.length && a[l] < a[m]) m = l; if (rr < a.length && a[rr] < a[m]) m = rr; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; }
}

// a binary heap on a long[] for the Java solutions (primitive arrays run well in the browser Java runner)
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
    inputFormat: ['The first line has `m` and `n`: the length of the list and the largest sum that must be possible.', 'The second line has `m` numbers in increasing order.'],
    constraints: ['1 <= m <= 20000', '1 <= each number <= 10^18', '1 <= n <= 10^18'],
    slug: 'numbers-to-add-for-every-sum',
    title: 'The Fewest Numbers to Add So That Every Sum Up to N Exists',
    tags: ['greedy', 'math', 'doubling', 'subset-sums'],
    concept: {
      title: 'Keep the smallest sum you cannot make yet; a number that is at most that sum extends the reachable range, and otherwise adding exactly that sum doubles it',
      body: [
        'You have a sorted list of positive integers and a number `n`. Every integer from `1` to `n` must be a **sum of some of the list\'s elements** (each element used at most once). You may add new numbers to the list (any positive integers). What is the **fewest numbers** you must add? For the list `1 3` and `n = 6` the answer is 1: add `2`, and the sums 1, 2, 3, 4 (1+3), 5 (2+3), 6 (1+2+3) all exist. For `1 5 10` and `n = 20` the answer is 2.',
        'Let `miss` be the **smallest sum that cannot be formed yet**, so all of `1 .. miss - 1` can be formed (at the start `miss = 1`). Look at the next element `x` of the list. If `x <= miss`, adding it keeps the range solid: every sum `s` in `1 .. miss - 1` plus `x` gives `x .. miss + x - 1`, which joins the old range because `x <= miss`, so now `1 .. miss + x - 1` is formed and `miss += x`. If `x > miss`, then `miss` is not reachable by this or any later element (they are all bigger), so we **must add a number** of at most `miss`; the best one is exactly `miss` itself, which extends the range the most: `miss += miss`, one patch.',
        { code: 'miss = 1\ni = patches = 0\nwhile miss <= n:\n    if i < m and a[i] <= miss:\n        miss += a[i]             # the element joins the solid range\n        i += 1\n    else:\n        miss += miss             # patch with the number `miss`: the range doubles\n        patches += 1\nprint(patches)' },
        'The doubling in the `else` branch means there are at most about 60 patches for `n <= 10^18`, and each list element is used once, so the loop runs at most `m + 60` times. Everything is 64-bit safe: while `miss <= n`, an element that is joined satisfies `x <= miss <= n`, so `miss` stays below `2 * 10^18`. The idea of "the smallest value that cannot be made" is the same one that proves the greedy algorithm for coin systems and for the *smallest non-representable sum*.'
      ]
    },
    statement: ['A sorted list of `m` positive integers and a number `n` are given. You may add any positive integers to the list. Print the smallest number of integers that must be added so that every integer from 1 to `n` can be written as the sum of some different elements of the list (each element of the final list used at most once).'],
    outputFormat: ['Print the smallest number of integers to add.'],
    examples: [{ input: '2 6\n1 3\n', note: 'Add 2: the sums 1..6 all exist: 1.' }, { input: '3 20\n1 5 10\n', note: 'Add 2 and 4 (sums up to 22 become possible): 2.' }],
    hints: ['Maintain miss, the smallest sum that cannot be formed; all smaller sums can.', 'If the next element is at most miss, it extends the range to miss + x.', 'Otherwise add the number miss itself, which doubles the range.'],
    program: {
      io: ['m:int n:int', 'a:int[m]'],
      fast: true,
      python: r`
        miss = 1
        i = patches = 0
        while miss <= n:
            if i < m and a[i] <= miss:
                miss += a[i]
                i += 1
            else:
                miss += miss
                patches += 1
        print(patches)`,
      cpp: r`
        long long miss = 1, patches = 0, i = 0;
        while (miss <= n) {
            if (i < m && a[i] <= miss) {
                miss += a[i];
                i++;
            } else {
                miss += miss;
                patches++;
            }
        }
        cout << patches << "\n";`,
      java: r`
        long miss = 1, patches = 0;
        int i = 0;
        while (miss <= n) {
            if (i < m && a[i] <= miss) {
                miss += a[i];
                i++;
            } else {
                miss += miss;
                patches++;
            }
        }
        System.out.println(patches);`
    },
    solution: { explanation: ['The smallest unreachable sum `miss` is tracked; a list element not larger than it extends the reachable range, and otherwise a new number equal to `miss` is added, which doubles the range.'], complexity: 'Time O(m + log n), space O(1).' },
    solve(input) {
      const rs = rows(input); const [m, n] = rs[0].split(' ').map(BigInt); const a = rs[1].split(' ').map(BigInt); let miss = 1n, patches = 0, i = 0; // the same invariant, written with BigInt
      while (miss <= n) { if (i < Number(m) && a[i] <= miss) { miss += a[i]; i++; } else { miss += miss; patches++; } } return String(patches);
    },
    tests() {
      const g = rng(3091); const out = ['2 6\n1 3\n', '3 20\n1 5 10\n', '1 1\n1\n', '1 1\n5\n', '3 7\n1 2 2\n'];
      const sorted = (v) => v.slice().sort(cmpBig);
      const make = (m, N, mode) => { let vals; if (mode === 'chain') vals = many(m, (i) => (1n << BigInt(Math.min(i, 59)))); else if (mode === 'random') vals = many(m, () => randBig(g, 1n, N)); else if (mode === 'small') vals = many(m, () => randBig(g, 1n, 10n)); else vals = many(m, () => randBig(g, N / 4n + 1n, N)); return `${m} ${N}\n${sorted(vals).join(' ')}\n`; };
      const brute = (input) => { const [m, n] = nums(rows(input)[0]); const a = nums(rows(input)[1]); const ok = (arr) => { let sums = new Set([0]); for (const x of arr) sums = new Set([...sums, ...[...sums].map((s) => s + x)]); for (let v = 1; v <= n; v++) if (!sums.has(v)) return false; return true; }; for (let t = 0; t <= n; t++) { const go = (start, left, arr) => { if (left === 0) return ok(arr); for (let v = start; v <= n; v++) if (go(v, left - 1, [...arr, v])) return true; return false; }; if (go(1, t, a)) return String(t); } return 'none'; };
      crossCheck(() => { const m = randInt(g, 1, 4); const N = randInt(g, 1, 24); return `${m} ${N}\n${randArray(g, m, 1, N).sort((x, y) => x - y).join(' ')}\n`; }, (i) => this.solve(i), brute, 300);
      for (const [m, N, mode] of [[10, 1000n, 'random'], [100, 1000000000n, 'random'], [20000, 1000000000000000000n, 'random'], [20000, 1000000000000000000n, 'chain'], [60, 1000000000000000000n, 'chain'], [20000, 1000000000000000000n, 'big'], [20000, 1000000000n, 'small'], [19999, 1000000000000000000n, 'small'], [5000, 4n * 1000000000000n, 'random']]) out.push(make(m, N, mode));
      out.push(`1 1000000000000000000\n1000000000000000000\n`, `20000 1000000000000000000\n${new Array(20000).fill(1).join(' ')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `p`, `q` and `k`: the lengths of two digit lists and the number of digits to pick.', 'The second line has `p` digits (the first list).', 'The third line has `q` digits (the second list).'],
    constraints: ['1 <= p, q <= 150', '1 <= k <= p + q', 'Each digit is from 0 to 9.'],
    slug: 'largest-number-from-two-digit-lists',
    title: 'The Largest Number Built From Two Lists of Digits',
    tags: ['greedy', 'monotonic-stack', 'merge', 'lexicographic'],
    concept: {
      title: 'Choose how many digits come from each list, take the best subsequence of that size from each with a stack, and merge by comparing the remaining suffixes',
      body: [
        'Two lists of digits are given. Build a number of exactly `k` digits by choosing digits from the lists, **keeping the relative order inside each list** (the digits of the two lists can interleave as you like). Print the **largest** such number. For the lists `3 4 6 5` and `9 1 2 5 8 3` with `k = 5` the answer is `98653`. Leading zeros are allowed in the number; it is compared as a string of `k` digits.',
        'Split the work into three steps. **(1)** Fix `i`, the number of digits taken from the first list; then `k - i` come from the second. **(2)** For one list and a count `t`, the largest subsequence of length `t` is found with a **monotonic stack**: scan the digits, and while the stack top is smaller than the current digit and we still may drop a digit (`len - t` drops in total), pop the stack; then push. **(3)** The two chosen subsequences must be **merged** into the largest sequence, preserving the order inside each: at every step take the first digit of the list whose **remaining part is lexicographically larger** (compare the whole remaining suffixes, because ties on the first digit must look further; when one suffix is a prefix of the other, the longer one is larger).',
        { code: 'def pick(d, t):\n    drop = len(d) - t\n    stack = []\n    for x in d:\n        while drop and stack and stack[-1] < x:\n            stack.pop(); drop -= 1\n        stack.append(x)\n    return stack[:t]\n\ndef merge(x, y):\n    out = []\n    while x or y:\n        out.append((x if x > y else y).pop(0))   # compare the remaining parts as lists\n    return out\n\nbest = max(merge(pick(a, i), pick(b, k - i)) for i in range(max(0, k - q), min(k, p) + 1))' },
        'Trying all splits `i` is necessary: the best number may take most digits from either list. The cost is about `(p + q)` splits, each with a stack pass and a merge that compares suffixes in O(k), so O(k^2 (p + q)) overall, which is fine for lists of 150 digits. The merge rule is the difficult part: comparing only the next digit would be wrong for lists like `6 7` and `6 0 4`, where the second `6` must wait until the tie is broken by the following digits.'
      ]
    },
    statement: ['Two lists of digits (lengths `p` and `q`) and a number `k` are given. Choose `k` digits in total, taking some digits from the first list and the rest from the second, keeping the order of the digits inside each list. Print the largest possible sequence of `k` digits (as one string without spaces; compare as a string).'],
    outputFormat: ['Print the `k` digits without spaces.'],
    examples: [{ input: '4 6 5\n3 4 6 5\n9 1 2 5 8 3\n', note: 'The digits 6 5 come from the first list and 9 8 3 from the second; merged in the best order they give 98653.' }, { input: '2 3 5\n6 7\n6 0 4\n', note: 'All the digits are used: 6 7 6 0 4 is the largest merge: 67604.' }],
    hints: ['Fix how many digits come from the first list.', 'The best subsequence of length t of a list is found with a stack that pops smaller digits.', 'Merge by comparing the whole remaining suffixes, not only the next digits.'],
    program: {
      io: ['p:int q:int k:int', 'a:int[p]', 'b:int[q]'],
      fast: true,
      helpers: {
        python: r`
          def pick(d, t):
              drop = len(d) - t
              stack = []
              for x in d:
                  while drop and stack and stack[-1] < x:
                      stack.pop()
                      drop -= 1
                  stack.append(x)
              return stack[:t]

          def merge(x, y):
              out = []
              x = list(x)
              y = list(y)
              while x or y:
                  out.append((x if x > y else y).pop(0))
              return out`,
        cpp: r`
          vector<int> pickDigits(const vector<long long>& d, int t) {
              int drop = (int)d.size() - t;
              vector<int> st;
              for (long long x : d) {
                  while (drop > 0 && !st.empty() && st.back() < x) {
                      st.pop_back();
                      drop--;
                  }
                  st.push_back((int)x);
              }
              st.resize(t);
              return st;
          }

          vector<int> mergeDigits(const vector<int>& x, const vector<int>& y) {
              vector<int> out;
              size_t i = 0, j = 0;
              while (i < x.size() || j < y.size()) {
                  bool takeX = lexicographical_compare(y.begin() + j, y.end(), x.begin() + i, x.end());
                  out.push_back(takeX ? x[i++] : y[j++]);
              }
              return out;
          }`,
        java: r`
          static int[] pickDigits(long[] d, int t) {
              int drop = d.length - t;
              int[] st = new int[d.length];
              int top = 0;
              for (long x : d) {
                  while (drop > 0 && top > 0 && st[top - 1] < x) {
                      top--;
                      drop--;
                  }
                  st[top++] = (int) x;
              }
              int[] res = new int[t];
              for (int i = 0; i < t; i++) res[i] = st[i];
              return res;
          }

          static boolean suffixGreater(int[] x, int i, int[] y, int j) {
              while (i < x.length && j < y.length) {
                  if (x[i] != y[j]) return x[i] > y[j];
                  i++;
                  j++;
              }
              return (x.length - i) > (y.length - j);
          }

          static int[] mergeDigits(int[] x, int[] y) {
              int[] out = new int[x.length + y.length];
              int i = 0, j = 0, o = 0;
              while (i < x.length || j < y.length) {
                  if (suffixGreater(x, i, y, j)) out[o++] = x[i++];
                  else out[o++] = y[j++];
              }
              return out;
          }`
      },
      python: r`
        best = None
        for i in range(max(0, k - q), min(k, p) + 1):
            cand = merge(pick(a, i), pick(b, k - i))
            if best is None or cand > best:
                best = cand
        print("".join(map(str, best)))`,
      cpp: r`
        int kk = (int)k;
        vector<int> best;
        for (int i = max(0, kk - (int)q); i <= min(kk, (int)p); i++) {
            vector<int> cand = mergeDigits(pickDigits(a, i), pickDigits(b, kk - i));
            if (best.empty() || cand > best) best = cand;
        }
        for (int d : best) cout << d;
        cout << "\n";`,
      java: r`
        int kk = (int) k;
        int[] best = null;
        for (int i = Math.max(0, kk - (int) q); i <= Math.min(kk, (int) p); i++) {
            int[] cand = mergeDigits(pickDigits(a, i), pickDigits(b, kk - i));
            boolean better = best == null;
            for (int t = 0; !better && t < kk; t++) {
                if (cand[t] != best[t]) {
                    better = cand[t] > best[t];
                    break;
                }
            }
            if (better) best = cand;
        }
        StringBuilder out = new StringBuilder();
        for (int d : best) out.append(d);
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['For every split of k between the lists, the best subsequence of each list is found with a monotonic stack, the two are merged by repeatedly taking the first digit of the lexicographically larger remaining part, and the largest result over all splits is printed.'], complexity: 'Time O(k^2 (p + q)), space O(k).' },
    solve(input) {
      const rs = rows(input); const [p, q, k] = nums(rs[0]); const a = nums(rs[1]), b = nums(rs[2]);
      const pickStr = (d, t) => { let drop = d.length - t; const st = []; for (const x of d) { while (drop > 0 && st.length && st[st.length - 1] < x) { st.pop(); drop--; } st.push(x); } return st.slice(0, t).join(''); };
      const mergeStr = (x, y) => { let out = ''; while (x.length || y.length) { if (x >= y) { out += x[0]; x = x.slice(1); } else { out += y[0]; y = y.slice(1); } } return out; }; // string comparison: a prefix is smaller than the longer string
      let best = ''; for (let i = Math.max(0, k - q); i <= Math.min(k, p); i++) { const cand = mergeStr(pickStr(a, i), pickStr(b, k - i)); if (cand > best) best = cand; } return best;
    },
    tests() {
      const g = rng(3092); const out = ['4 6 5\n3 4 6 5\n9 1 2 5 8 3\n', '2 3 5\n6 7\n6 0 4\n', '1 1 1\n0\n0\n', '1 1 2\n1\n2\n', '3 3 3\n1 1 1\n1 1 1\n'];
      const make = (p, q, k, alpha) => `${p} ${q} ${k}\n${many(p, () => randInt(g, 0, alpha)).join(' ')}\n${many(q, () => randInt(g, 0, alpha)).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [p, q, k] = nums(rs[0]); const a = nums(rs[1]), b = nums(rs[2]); let best = ''; for (let ma = 0; ma < (1 << p); ma++) for (let mb = 0; mb < (1 << q); mb++) { const ca = [], cb = []; for (let i = 0; i < p; i++) if (ma >> i & 1) ca.push(a[i]); for (let i = 0; i < q; i++) if (mb >> i & 1) cb.push(b[i]); if (ca.length + cb.length !== k) continue; const interleave = (x, y) => { if (!x.length && !y.length) return ['']; const res = []; if (x.length) for (const s of interleave(x.slice(1), y)) res.push(x[0] + s); if (y.length) for (const s of interleave(x, y.slice(1))) res.push(y[0] + s); return res; }; for (const s of interleave(ca, cb)) if (s > best) best = s; } return best; };
      crossCheck(() => { const p = randInt(g, 1, 4), q = randInt(g, 1, 4); return make(p, q, randInt(g, 1, p + q), randInt(g, 1, 9)); }, (i) => this.solve(i), brute, 400);
      for (const [p, q, k, alpha] of [[10, 12, 8, 9], [50, 60, 40, 9], [150, 150, 300, 9], [150, 150, 150, 9], [150, 150, 100, 1], [150, 150, 300, 0], [150, 120, 200, 2], [149, 150, 250, 9], [150, 150, 75, 9], [150, 150, 20, 9], [1, 150, 100, 9]]) out.push(make(p, q, k, alpha));
      out.push(`150 150 300\n${many(150, (i) => (i % 2 ? 6 : 7)).join(' ')}\n${many(150, (i) => (i % 3 ? 6 : 0)).join(' ')}\n`, `150 150 200\n${many(150, (i) => 9 - Math.floor(i / 17)).join(' ')}\n${many(150, (i) => Math.floor(i / 17)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`, `target` and `fuel`: the number of stations, the distance to the goal and the fuel in the tank at the start.', 'Each of the next `n` lines has two numbers `d` and `f`: the position of a station and the fuel you can take there.'],
    constraints: ['1 <= n <= 30000', '1 <= target <= 10^9, 0 <= fuel <= 10^9', 'The stations are listed in increasing order of d, with 1 <= d < target.', '1 <= f <= 10^9'],
    slug: 'fewest-fuel-stops',
    title: 'The Fewest Stops to Refuel on the Way to the Goal',
    tags: ['greedy', 'heap', 'refuelling'],
    concept: {
      title: 'Drive as far as you can; only when you are stuck, pretend you refuelled at the best station you passed',
      body: [
        'A car drives along a line from the position 0 to the position `target`, using 1 unit of fuel per unit of distance. It starts with `fuel` units. Along the way there are stations; at a station you may take **all** its fuel (the tank has no limit), but each time you stop is counted. What is the **fewest number of stops** needed to reach the target? Print -1 if it is impossible. For `target = 100`, `fuel = 10` and the stations `(10, 60) (20, 30) (30, 30) (60, 40)` the answer is 2: stop at the position 10 and then at 60.',
        'The key observation is that the decision of **where** to stop can be postponed. Drive forward without stopping while the fuel lasts. All the stations passed on the way are candidates, and we may regret not having stopped at any of them. When the fuel is not enough to go on, we choose — *retroactively* — the passed station with the **most fuel** and count a stop there. This is optimal because stopping anywhere before the point of being stuck gives the same total reach afterwards: only the amount of fuel taken matters, so the biggest one is the best.',
        { code: 'heap = []                       # the fuel amounts of the stations passed (a max-heap)\nreach = fuel                    # the farthest position we can reach with the stops made so far\ni = stops = 0\nwhile reach < target:\n    while i < n and st[i][0] <= reach:     # the stations we can get to\n        heappush(heap, -st[i][1]); i += 1\n    if not heap:\n        stops = -1; break                # stuck: nothing to refuel from\n    reach += -heappop(heap)             # stop at the best passed station\n    stops += 1\nprint(stops)' },
        'Each station enters the heap once and leaves it at most once, so the algorithm takes O(n log n). The variable `reach` is the total of the starting fuel and the fuel of all chosen stations. A dynamic programming solution `best[j] = the farthest position with j stops` needs O(n^2); the heap solution shows that the greedy choice "largest fuel among the reachable stations" is enough.'
      ]
    },
    statement: ['A car starts at the position 0 with `fuel` units of fuel and must reach the position `target`; one unit of distance costs one unit of fuel. There are `n` stations at the given positions (increasing); at a station the car may stop and take all of its fuel (the tank is unlimited). Print the smallest number of stops needed to reach the target, or -1 if it cannot be reached.'],
    outputFormat: ['Print the smallest number of stops, or -1.'],
    examples: [{ input: '4 100 10\n10 60\n20 30\n30 30\n60 40\n', note: 'Stop at the positions 10 (60 fuel) and 60 (40 fuel): 2 stops.' }, { input: '1 100 1\n10 100\n', note: 'The car cannot reach the station at 10 with 1 unit of fuel: -1.' }],
    hints: ['Drive while fuel lasts, collecting the fuel amounts of the stations passed.', 'When the fuel runs out, take the largest fuel among the stations passed.', 'Use a max-heap and count the stops.'],
    program: {
      io: ['n:int target:int fuel:int', 'st:int[n][2]'],
      fast: true,
      helpers: { python: 'from heapq import heappush, heappop', cpp: '', java: HEAP_JAVA },
      python: r`
        heap = []
        reach = fuel
        i = stops = 0
        while reach < target:
            while i < n and st[i][0] <= reach:
                heappush(heap, -st[i][1])
                i += 1
            if not heap:
                stops = -1
                break
            reach -= heappop(heap)
            stops += 1
        print(stops)`,
      cpp: r`
        priority_queue<long long> heap;
        long long reach = fuel, i = 0, stops = 0;
        while (reach < target) {
            while (i < n && st[i][0] <= reach) {
                heap.push(st[i][1]);
                i++;
            }
            if (heap.empty()) {
                stops = -1;
                break;
            }
            reach += heap.top();
            heap.pop();
            stops++;
        }
        cout << stops << "\n";`,
      java: r`
        int count = (int) n;
        heap = new long[count + 5];
        heapSize = 0;
        long reach = fuel, stops = 0;
        int i = 0;
        while (reach < target) {
            while (i < count && st[i][0] <= reach) {
                heapPush(-st[i][1]);
                i++;
            }
            if (heapSize == 0) {
                stops = -1;
                break;
            }
            reach -= heapPop();
            stops++;
        }
        System.out.println(stops);`,
      includes: ['<queue>']
    },
    solution: { explanation: ['The car drives as far as possible; the fuel amounts of the passed stations go into a max-heap, and whenever the target is not yet reachable the largest amount is taken (a stop is counted); if the heap is empty the goal cannot be reached.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const [n, target, fuel] = nums(rows(input)[0]); const st = rowsOfNums(input, 1, n);
      if (n <= 2500) { const dp = new Array(n + 1).fill(-1); dp[0] = fuel; for (let i = 0; i < n; i++) for (let j = i; j >= 0; j--) if (dp[j] >= st[i][0]) dp[j + 1] = Math.max(dp[j + 1], dp[j] + st[i][1]); for (let j = 0; j <= n; j++) if (dp[j] >= target) return String(j); return '-1'; } // dp[j]: the farthest position with j stops
      const heap = new MinHeap(); let reach = fuel, i = 0, stops = 0; while (reach < target) { while (i < n && st[i][0] <= reach) { heap.push(-st[i][1]); i++; } if (!heap.size) return '-1'; reach -= heap.pop(); stops++; } return String(stops);
    },
    tests() {
      const g = rng(3093); const out = ['4 100 10\n10 60\n20 30\n30 30\n60 40\n', '1 100 1\n10 100\n', '1 5 5\n1 1\n', '1 10 3\n2 1\n'];
      const make = (n, target, fuel, fMax) => { const pos = new Set(); while (pos.size < n) pos.add(randInt(g, 1, target - 1)); const ps = [...pos].sort((x, y) => x - y); return `${n} ${target} ${fuel}\n${ps.map((x) => `${x} ${randInt(g, 1, fMax)}`).join('\n')}\n`; };
      const brute = (input) => { const [n, target, fuel] = nums(rows(input)[0]); const st = rowsOfNums(input, 1, n); let best = Infinity; for (let mask = 0; mask < (1 << n); mask++) { let reach = fuel, stops = 0, ok = true; for (let i = 0; i < n; i++) { if (st[i][0] > reach) break; if (mask >> i & 1) { reach += st[i][1]; stops++; } } if (reach >= target) best = Math.min(best, stops); } return String(best === Infinity ? -1 : best); };
      const fuelHeap = (input) => { const [n, target, fuel] = nums(rows(input)[0]); const st = rowsOfNums(input, 1, n); const heap = new MinHeap(); let reach = fuel, i = 0, stops = 0; while (reach < target) { while (i < n && st[i][0] <= reach) { heap.push(-st[i][1]); i++; } if (!heap.size) return '-1'; reach -= heap.pop(); stops++; } return String(stops); }; // the heap method is checked against the exhaustive search too
      crossCheck(() => { const n = randInt(g, 1, 8); return make(n, randInt(g, n + 2, 40), randInt(g, 0, 10), 12); }, (i) => this.solve(i), brute, 800);
      crossCheck(() => { const n = randInt(g, 1, 8); return make(n, randInt(g, n + 2, 40), randInt(g, 0, 10), 12); }, fuelHeap, brute, 800);
      crossCheck(() => { const n = randInt(g, 5, 200); return make(n, randInt(g, n + 2, 3000), randInt(g, 0, 100), 300); }, fuelHeap, (i) => this.solve(i), 300);
      for (const [n, target, fuel, fMax] of [[10, 1000, 100, 500], [100, 100000, 5000, 20000], [1000, 1000000, 50000, 100000], [30000, 1000000000, 1000000, 2000000], [30000, 1000000000, 100000, 300000], [30000, 1000000000, 1000000000, 1000000000], [30000, 1000000000, 10, 100000], [29999, 1000000000, 30000, 100000], [30000, 100000, 100, 20], [30000, 1000000000, 20000, 1000000]]) out.push(make(n, target, fuel, fMax));
      out.push(`30000 1000000000 1\n${many(30000, (i) => `${1 + i} 100000`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of events.', 'Each of the next `n` lines has two numbers `s` and `e`: the first and the last day on which the event can be attended.'],
    constraints: ['1 <= n <= 30000', '1 <= s <= e <= 10^9'],
    slug: 'most-events-one-per-day',
    title: 'Attend the Most Events, One Per Day',
    tags: ['greedy', 'heap', 'scheduling', 'sweep'],
    concept: {
      title: 'Every day, attend the available event that ends the soonest',
      body: [
        'There are `n` events. The event `i` lasts from the day `s` to the day `e` (both included), and you may attend it on **any one day** in this range, but you can attend **at most one event per day**, and each event only once. What is the **largest number of events** you can attend? For the events `1-2, 2-3, 3-4` the answer is 3 (one per day: 1, 2, 3), and for `1-2, 2-3, 3-4, 1-2` it is 4.',
        'Go through the days in increasing order. On a given day, look at all events that **have started and not yet ended**; you want to attend one of them. The one with the **earliest last day** is the most urgent and the best choice: if it is skipped today, it may expire, while an event with a later deadline can still be attended tomorrow. Keep these events in a **min-heap by their last day**: push events as they start, discard the ones that have already ended, and pop the most urgent one to attend it.',
        { code: 'events.sort()                      # by the first day\nheap = []\ni = day = count = 0\nwhile i < n or heap:\n    if not heap:\n        day = max(day, events[i][0])   # skip the days on which nothing is available\n    while i < n and events[i][0] <= day:\n        heappush(heap, events[i][1]); i += 1\n    while heap and heap[0] < day:\n        heappop(heap)                  # expired events\n    if heap:\n        heappop(heap); count += 1; day += 1\nprint(count)' },
        'The day counter jumps ahead when the heap is empty, which keeps the algorithm O(n log n) even though the days go up to 10^9. The same exchange argument as for the interval scheduling holds: if an optimal plan attends a less urgent event today while the most urgent one is available, swapping them keeps the plan valid. The dual view is a matching of events to days: the greedy by earliest deadline finds a maximum matching.'
      ]
    },
    statement: ['`n` events are given; the event `i` can be attended on any day from `s` to `e` (inclusive). At most one event can be attended per day and each event is attended at most once. Print the largest number of events that can be attended.'],
    outputFormat: ['Print the largest number of events.'],
    examples: [{ input: '4\n1 2\n2 3\n3 4\n1 2\n', note: 'The events can be attended on the days 1, 2, 3, 4: 4.' }, { input: '3\n1 1\n1 1\n1 1\n', note: 'Only one event fits on the day 1: 1.' }],
    hints: ['Sort the events by the first day.', 'Keep the last days of the available events in a min-heap.', 'Each day, drop the expired events and attend the one that ends first.'],
    program: {
      io: ['n:int', 'ev:int[n][2]'],
      fast: true,
      helpers: { python: 'from heapq import heappush, heappop', cpp: '', java: HEAP_JAVA },
      python: r`
        ev.sort()
        heap = []
        i = day = count = 0
        while i < n or heap:
            if not heap:
                day = max(day, ev[i][0])
            while i < n and ev[i][0] <= day:
                heappush(heap, ev[i][1])
                i += 1
            while heap and heap[0] < day:
                heappop(heap)
            if heap:
                heappop(heap)
                count += 1
                day += 1
        print(count)`,
      cpp: r`
        sort(ev.begin(), ev.end());
        priority_queue<long long, vector<long long>, greater<long long>> heap;
        long long i = 0, day = 0, count = 0;
        while (i < n || !heap.empty()) {
            if (heap.empty()) day = max(day, ev[i][0]);
            while (i < n && ev[i][0] <= day) {
                heap.push(ev[i][1]);
                i++;
            }
            while (!heap.empty() && heap.top() < day) heap.pop();
            if (!heap.empty()) {
                heap.pop();
                count++;
                day++;
            }
        }
        cout << count << "\n";`,
      java: r`
        int cnt = (int) n;
        long[] keys = new long[cnt];
        for (int t = 0; t < cnt; t++) keys[t] = (ev[t][0] << 30) | ev[t][1];
        Arrays.sort(keys);
        long mask = (1L << 30) - 1;
        heap = new long[cnt + 5];
        heapSize = 0;
        int i = 0;
        long day = 0, count = 0;
        while (i < cnt || heapSize > 0) {
            if (heapSize == 0) day = Math.max(day, keys[i] >> 30);
            while (i < cnt && (keys[i] >> 30) <= day) {
                heapPush(keys[i] & mask);
                i++;
            }
            while (heapSize > 0 && heap[0] < day) heapPop();
            if (heapSize > 0) {
                heapPop();
                count++;
                day++;
            }
        }
        System.out.println(count);`,
      includes: ['<algorithm>', '<queue>', '<functional>']
    },
    solution: { explanation: ['The events are sorted by their first day; every day the events that have started go into a min-heap of last days, expired ones are removed, and the one that ends first is attended.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const n = Number(rows(input)[0]); const ev = rowsOfNums(input, 1, n).sort((x, y) => x[1] - y[1] || x[0] - y[0]); // by the last day: each event takes the earliest free day not before its first day (union-find over days)
      const next = new Map(); const find = (d) => { let root = d; while (next.has(root)) root = next.get(root); let cur = d; while (next.has(cur)) { const nx = next.get(cur); next.set(cur, root); cur = nx; } return root; };
      let count = 0; for (const [s, e] of ev) { const d = find(s); if (d <= e) { count++; next.set(d, d + 1); } } return String(count);
    },
    tests() {
      const g = rng(3094); const out = ['4\n1 2\n2 3\n3 4\n1 2\n', '3\n1 1\n1 1\n1 1\n', '1\n5 5\n', '2\n1 1000000000\n1 1000000000\n'];
      const make = (n, hi, span) => `${n}\n${many(n, () => { const s = randInt(g, 1, hi); return `${s} ${Math.min(hi, s + randInt(g, 0, span))}`; }).join('\n')}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); const ev = rowsOfNums(input, 1, n); const days = []; for (let d = 1; d <= 12; d++) days.push(d); const matchDay = new Map(); const tryEvent = (i, seen) => { for (let d = ev[i][0]; d <= ev[i][1]; d++) { if (seen.has(d)) continue; seen.add(d); if (!matchDay.has(d) || tryEvent(matchDay.get(d), seen)) { matchDay.set(d, i); return true; } } return false; }; let count = 0; for (let i = 0; i < n; i++) if (tryEvent(i, new Set())) count++; return String(count); };
      crossCheck(() => make(randInt(g, 1, 9), 10, 4), (i) => this.solve(i), brute, 800);
      for (const [n, hi, span] of [[10, 20, 5], [100, 200, 20], [1000, 100000, 500], [30000, 1000000000, 1000000000], [30000, 1000000000, 100000], [30000, 20000, 5000], [30000, 100, 10], [29999, 40000, 3], [30000, 30000, 1], [30000, 1000000000, 0]]) out.push(make(n, hi, span));
      out.push(`30000\n${many(30000, (i) => `${1 + (i % 100)} ${1000000000 - (i % 100)}`).join('\n')}\n`, `30000\n${many(30000, (i) => `${i + 1} ${i + 1}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`, `m`, `p` and `s`: the number of tasks, the number of workers, the number of magic pills and the strength a pill adds.', 'The second line has `n` numbers: the strength each task needs.', 'The third line has `m` numbers: the strength of each worker.'],
    constraints: ['1 <= n, m <= 30000', '0 <= p <= m', '0 <= s <= 10^9', '0 <= each strength <= 10^9'],
    slug: 'tasks-with-magic-pills',
    title: 'How Many Tasks Can the Workers Do With a Few Magic Pills?',
    tags: ['greedy', 'binary-search', 'deque', 'matching'],
    concept: {
      title: 'Binary search the number of tasks k; for a given k use the k easiest tasks and the k strongest workers, and match them with a deque',
      body: [
        'There are `n` tasks, and the task `i` needs a worker of strength at least `tasks[i]`. There are `m` workers, each can do **at most one task**. There are `p` magic pills, each of which adds `s` to the strength of **one worker** (a worker takes at most one pill). What is the **largest number of tasks** that can be done? For tasks `3 2 1`, workers `0 3 3`, `p = 1` and `s = 1` the answer is 3: the worker 0 takes the pill and does the task 1, and the others do 2 and 3.',
        'If `k` tasks can be done, then `k - 1` tasks can be done as well, so we can **binary search** on `k`. To check one `k`, it is best to do the **k easiest tasks** with the **k strongest workers** (any other choice only makes things harder). Now match them. Walk through the chosen workers from the **weakest to the strongest**. For the current worker `w`, put into a deque all tasks that `w` could do **with** a pill (`task <= w + s`); since the workers get stronger, the deque only grows at its back. If the easiest available task (the front of the deque) is at most `w`, then `w` does it **without** a pill. Otherwise `w` must take a pill, and does the **hardest** task he can, the one at the back of the deque. If there is no pill left, or the deque is empty, the check fails.',
        { code: 'def can(k):\n    pills = p\n    dq = deque(); ptr = 0\n    for w in workers[m - k:]:                 # the k strongest, weakest first\n        while ptr < k and tasks[ptr] <= w + s:   # the tasks w can do with a pill\n            dq.append(tasks[ptr]); ptr += 1\n        if not dq: return False\n        if dq[0] <= w: dq.popleft()           # no pill: take the easiest task\n        else:\n            if pills == 0: return False\n            pills -= 1; dq.pop()               # a pill: take the hardest doable task\n    return True' },
        'Every worker and every task enters and leaves the deque at most once, so one check is O(k) and the whole algorithm is O((n + m) log(n + m)) with the sorting. Why take the hardest doable task when a pill is used? The workers that follow are stronger, so they are the ones best able to do the easier tasks without pills; the pill should therefore buy the most demanding task that this worker can reach, and the easy tasks stay in the deque for the stronger workers.'
      ]
    },
    statement: ['`n` tasks (each needs a worker of at least the given strength), `m` workers and `p` magic pills are given. A pill adds `s` to the strength of one worker; a worker takes at most one pill and does at most one task. Print the largest number of tasks that can be done.'],
    outputFormat: ['Print the largest number of tasks.'],
    examples: [{ input: '3 3 1 1\n3 2 1\n0 3 3\n', note: 'The worker 0 takes the pill (strength 1) and does the task 1; the others do 2 and 3: 3.' }, { input: '3 3 1 5\n5 4 3\n0 0 0\n', note: 'Only one worker can be strengthened (to 5), and he can do any one task: 1.' }],
    hints: ['If k tasks are possible then k - 1 are possible: binary search on k.', 'For a fixed k use the k easiest tasks and the k strongest workers.', 'Go from the weakest chosen worker and keep a deque of the tasks he can do with a pill.'],
    program: {
      io: ['n:int m:int p:int s:int', 'tasks:int[n]', 'workers:int[m]'],
      fast: true,
      helpers: { python: 'from collections import deque', cpp: '', java: '' },
      python: r`
        tasks.sort()
        workers.sort()

        def can(k):
            pills = p
            dq = deque()
            ptr = 0
            for w in workers[m - k:]:
                while ptr < k and tasks[ptr] <= w + s:
                    dq.append(tasks[ptr])
                    ptr += 1
                if not dq:
                    return False
                if dq[0] <= w:
                    dq.popleft()
                else:
                    if pills == 0:
                        return False
                    pills -= 1
                    dq.pop()
            return True

        lo, hi = 0, min(n, m)
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if can(mid):
                lo = mid
            else:
                hi = mid - 1
        print(lo)`,
      cpp: r`
        sort(tasks.begin(), tasks.end());
        sort(workers.begin(), workers.end());
        long long lo = 0, hi = min(n, m);
        vector<long long> dq(n + 1);
        while (lo < hi) {
            long long mid = (lo + hi + 1) / 2;
            long long pills = p;
            long long head = 0, tail = 0, ptr = 0;
            bool ok = true;
            for (long long wi = m - mid; wi < m; wi++) {
                long long w = workers[wi];
                while (ptr < mid && tasks[ptr] <= w + s) dq[tail++] = tasks[ptr++];
                if (head == tail) {
                    ok = false;
                    break;
                }
                if (dq[head] <= w) {
                    head++;
                } else {
                    if (pills == 0) {
                        ok = false;
                        break;
                    }
                    pills--;
                    tail--;
                }
            }
            if (ok) lo = mid;
            else hi = mid - 1;
        }
        cout << lo << "\n";`,
      java: r`
        Arrays.sort(tasks);
        Arrays.sort(workers);
        int nt = (int) n, nw = (int) m;
        int lo = 0, hi = Math.min(nt, nw);
        long[] dq = new long[nt + 1];
        while (lo < hi) {
            int mid = (lo + hi + 1) / 2;
            long pills = p;
            int head = 0, tail = 0, ptr = 0;
            boolean ok = true;
            for (int wi = nw - mid; wi < nw; wi++) {
                long w = workers[wi];
                while (ptr < mid && tasks[ptr] <= w + s) {
                    dq[tail++] = tasks[ptr];
                    ptr++;
                }
                if (head == tail) {
                    ok = false;
                    break;
                }
                if (dq[head] <= w) {
                    head++;
                } else {
                    if (pills == 0) {
                        ok = false;
                        break;
                    }
                    pills--;
                    tail--;
                }
            }
            if (ok) lo = mid;
            else hi = mid - 1;
        }
        System.out.println(lo);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Binary search on the number k of tasks; for a given k the k easiest tasks are matched with the k strongest workers from the weakest to the strongest using a deque of the tasks reachable with a pill: the front task is taken without a pill if possible, otherwise the back task is taken with a pill.'], complexity: 'Time O((n + m) log(n + m)), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, m, p, s] = nums(rs[0]); const tasks = nums(rs[1]).sort((x, y) => x - y), workers = nums(rs[2]).sort((x, y) => x - y);
      const can =(k) => { let pills = p; const dq = []; let head = 0, ptr = 0; for (let wi = m - k; wi < m; wi++) { const w = workers[wi]; while (ptr < k && tasks[ptr] <= w + s) dq.push(tasks[ptr++]); if (head === dq.length) return false; if (dq[head] <= w) head++; else { if (pills === 0) return false; pills--; dq.pop(); } } return true; };
      let lo = 0, hi = Math.min(n, m); while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (can(mid)) lo = mid; else hi = mid - 1; } return String(lo);
    },
    tests() {
      const g = rng(3095); const out = ['3 3 1 1\n3 2 1\n0 3 3\n', '3 3 1 5\n5 4 3\n0 0 0\n','1 1 0 0\n5\n5\n', '1 1 1 10\n15\n5\n', '2 3 0 0\n1 1\n1 1 1\n'];
      const make = (n, m, p, s, hi) => `${n} ${m} ${p} ${s}\n${randArray(g, n, 1, hi).join(' ')}\n${randArray(g, m, 1, hi).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, m, p, s] = nums(rs[0]); const tasks = nums(rs[1]), workers = nums(rs[2]); let best = 0; const used = new Array(n).fill(false); const go = (w, pills, done) => { best = Math.max(best, done); if (w === m) return; go(w + 1, pills, done); for (let t = 0; t < n; t++) { if (used[t]) continue; if (workers[w] >= tasks[t]) { used[t] = true; go(w + 1, pills, done + 1); used[t] = false; } if (pills > 0 && workers[w] + s >= tasks[t]) { used[t] = true; go(w + 1, pills - 1, done + 1); used[t] = false; } } }; go(0, p, 0); return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 5), m = randInt(g, 1, 5); return make(n, m, randInt(g, 0, m), randInt(g, 0, 6), 10); }, (i) => this.solve(i), brute, 1200);
      for (const [n, m, p, s, hi] of [[10, 12, 3, 5, 30], [100, 100, 20, 1000, 100000], [1000, 1200, 300, 5000, 1000000], [30000, 30000, 1000, 100000000, 1000000000], [30000, 30000, 15000, 1000000, 100000000], [30000, 25000, 25000, 1000000000, 1000000000], [25000, 30000, 0, 5, 1000000000], [29999, 30000, 5000, 100, 100000], [30000, 30000, 30000, 0, 1000000000], [20000, 30000, 100, 10000000, 1000000000]]) out.push(make(n, m, p, s, hi));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `k`: the number of workers and the size of the crew.', 'The second line has `n` numbers: the quality of each worker.', 'The third line has `n` numbers: the minimum wage of each worker.'],
    constraints: ['1 <= k <= n <= 20000', '1 <= quality, wage <= 10^4'],
    slug: 'cheapest-crew-of-k-workers',
    title: 'The Cheapest Crew of K Workers',
    tags: ['greedy', 'heap', 'sorting', 'ratio'],
    concept: {
      title: 'Within a crew everyone is paid at the same rate per unit of quality, and that rate is set by the worker with the highest wage-to-quality ratio',
      body: [
        'A factory must hire **exactly `k` workers**. The worker `i` has a *quality* `q[i]` and demands a *minimum wage* `w[i]`. The pay rules are: every worker of the crew is paid **in proportion to quality** (so the pay of the worker `i` is `q[i] * rate` for the same `rate` for the whole crew), and nobody is paid less than the minimum wage. What is the **smallest total pay**? Print it **rounded up to a whole number**. For the qualities `10 20 5`, the wages `70 50 30` and `k = 2` the answer is 105: hire the workers 1 and 3 at the rate 7 per unit of quality, which pays 70 and 35.',
        'For a fixed crew the rate must satisfy `rate >= w[i] / q[i]` for **every member**, so the smallest rate is the **largest ratio `w/q`** among the members, and the total pay is `rate * (sum of the qualities)`. Now think of the crew\'s *bottleneck* worker, the one with the largest ratio. Sort all workers by the ratio `w/q`. When the worker `i` of this order is the bottleneck, the crew can be formed from any workers **before him in the order** (their ratios are not higher), and to make the total pay small we take the `k - 1` of them with the **smallest qualities**, together with `i`.',
        { code: 'order = sorted(range(n), key=cmp_to_key(lambda i, j: w[i]*q[j] - w[j]*q[i]))   # by w/q\nheap = []                                   # the qualities of the current crew candidates (max-heap)\nsumq = 0\nbest = None                                # the smallest pay as a fraction numerator/denominator\nfor i in order:\n    heappush(heap, -q[i]); sumq += q[i]\n    if len(heap) > k:\n        sumq += heappop(heap)              # drop the largest quality\n    if len(heap) == k:\n        pay = (sumq * w[i], q[i])          # rate w[i]/q[i] times the sum of the qualities\n        if best is None or pay[0] * best[1] < best[0] * pay[1]:\n            best = pay\nprint(-(-best[0] // best[1]))               # rounded up' },
        'The heap keeps the `k` smallest qualities seen so far, and each worker is the bottleneck candidate once. The payment is a fraction, so the program compares candidates by **cross-multiplication** (exact integers, no floating point); the ratio comparison used for sorting is exact in the same way. With the limits above every product stays below 10^17. The total time is O(n log n).'
      ]
    },
    statement: ['A crew of exactly `k` workers must be hired. The worker `i` has the quality `q[i]` and the minimum wage `w[i]`. All the crew members are paid in the same proportion to their quality, nobody receives less than his minimum wage, and the total pay must be as small as possible. Print the smallest total pay rounded up to the next whole number.'],
    outputFormat: ['Print the smallest total pay, rounded up.'],
    examples: [{ input: '3 2\n10 20 5\n70 50 30\n', note: 'The ratios wage/quality are 7, 2.5 and 6. The workers 1 and 3 at the rate 7 are paid 70 and 35: 105 (the workers 2 and 3 at the rate 6 would cost 150).' }],
    hints: ['For a crew, the rate is the largest w/q among its members.', 'Sort the workers by w/q; the current worker is the largest ratio of the crew.', 'Keep the k smallest qualities in a max-heap and use exact fraction comparison.'],
    program: {
      io: ['n:int k:int', 'q:int[n]', 'w:int[n]'],
      fast: true,
      helpers: { python: 'from heapq import heappush, heappop\nfrom functools import cmp_to_key', cpp: '', java: HEAP_JAVA },
      python: r`
        order = sorted(range(n), key=cmp_to_key(lambda i, j: w[i] * q[j] - w[j] * q[i]))
        heap = []
        sumq = 0
        bn, bd = -1, 1
        for i in order:
            heappush(heap, -q[i])
            sumq += q[i]
            if len(heap) > k:
                sumq += heappop(heap)
            if len(heap) == k:
                num = sumq * w[i]
                den = q[i]
                if bn < 0 or num * bd < bn * den:
                    bn, bd = num, den
        print((bn + bd - 1) // bd)`,
      cpp: r`
        vector<int> order(n);
        for (int i = 0; i < n; i++) order[i] = i;
        sort(order.begin(), order.end(), [&](int x, int y) { return w[x] * q[y] < w[y] * q[x]; });
        priority_queue<long long> heap;
        long long sumq = 0, bn = -1, bd = 1;
        for (int i : order) {
            heap.push(q[i]);
            sumq += q[i];
            if ((long long)heap.size() > k) {
                sumq -= heap.top();
                heap.pop();
            }
            if ((long long)heap.size() == k) {
                long long num = sumq * w[i], den = q[i];
                if (bn < 0 || num * bd < bn * den) {
                    bn = num;
                    bd = den;
                }
            }
        }
        cout << (bn + bd - 1) / bd << "\n";`,
      java: r`
        int cnt = (int) n;
        long[] keys = new long[cnt];
        for (int i = 0; i < cnt; i++) keys[i] = (w[i] * 1000000000L / q[i]) * 32768L + i;
        Arrays.sort(keys);
        heap = new long[cnt + 5];
        heapSize = 0;
        long sumq = 0, bn = -1, bd = 1;
        for (int t = 0; t < cnt; t++) {
            int i = (int) (keys[t] % 32768L);
            heapPush(-q[i]);
            sumq += q[i];
            if (heapSize > k) sumq += heapPop();
            if (heapSize == k) {
                long num = sumq * w[i], den = q[i];
                if (bn < 0 || num * bd < bn * den) {
                    bn = num;
                    bd = den;
                }
            }
        }
        System.out.println((bn + bd - 1) / bd);`,
      includes: ['<algorithm>', '<queue>']
    },
    solution: { explanation: ['The workers are sorted by the ratio wage/quality; for each worker as the bottleneck the k smallest qualities seen so far are kept with a max-heap, the candidate payment is the quality sum times the bottleneck ratio (an exact fraction), and the smallest candidate rounded up is printed.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, k] = nums(rs[0]); const q = nums(rs[1]).map(BigInt), w = nums(rs[2]).map(BigInt);
      const order =many(n, (i) => i).sort((i, j) => { const d = w[i] * q[j] - w[j] * q[i]; return d < 0n ? -1 : d > 0n ? 1 : 0; }); const heap = new MinHeap(); let sumq = 0n, best = null; for (const i of order) { heap.push(-q[i]); sumq += q[i]; if (heap.size > k) sumq += heap.pop(); if (heap.size === k) { const num = sumq * w[i], den = q[i]; if (best === null || num * best[1] < best[0] * den) best = [num, den]; } } return String((best[0] + best[1] - 1n) / best[1]);
    },
    tests() {
      const g = rng(3096); const out = ['3 2\n10 20 5\n70 50 30\n', '1 1\n5\n7\n', '2 2\n3 1\n4 5\n', '3 3\n1 1 1\n1 1 1\n'];
      const make = (n, k, hi) => `${n} ${k}\n${randArray(g, n, 1, hi).join(' ')}\n${randArray(g, n, 1, hi).join(' ')}\n`;
      const exact = (input) => { const rs = rows(input); const [n, k] = nums(rs[0]); const q = nums(rs[1]).map(BigInt), w = nums(rs[2]).map(BigInt); let best = null; for (let mask = 0; mask < (1 << n); mask++) { let c = 0, sumq = 0n, ratioN = 0n, ratioD = 1n; for (let i = 0; i < n; i++) if (mask >> i & 1) { c++; sumq += q[i]; if (w[i] * ratioD > ratioN * q[i]) { ratioN = w[i]; ratioD = q[i]; } } if (c !== k) continue; const num = sumq * ratioN, den = ratioD; if (best === null || num * best[1] < best[0] * den) best = [num, den]; } return String((best[0] + best[1] - 1n) / best[1]); };
      crossCheck(() => { const n = randInt(g, 1, 8); return make(n, randInt(g, 1, n), 12); }, (i) => this.solve(i), exact, 600);
      // for n >= 15 the heap solution is compared with the exhaustive one on a mid-size sample below
      for (let rep = 0; rep < 30; rep++) { const n = randInt(g, 15, 18); const input = make(n, randInt(g, 1, n), 30); if (this.solve(input) !== exact(input)) throw new Error('heap solution differs from the exhaustive search'); }
      for (const [n, k, hi] of [[10, 4, 20], [100, 30, 1000], [1000, 100, 10000], [20000, 1000, 10000], [20000, 19999, 10000], [20000, 1, 10000], [20000, 10000, 10], [19999, 5000, 10000], [20000, 20000, 10000], [20000, 500, 100]]) out.push(make(n, k, hi));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`, `k` and `w`: the number of projects, the largest number of projects you may do and your starting capital.', 'The second line has `n` numbers: the capital each project requires.', 'The third line has `n` numbers: the pure profit of each project.'],
    constraints: ['1 <= n <= 30000', '1 <= k <= n', '0 <= w <= 10^9', '0 <= capital, profit <= 10^9'],
    slug: 'fund-the-best-projects',
    title: 'Fund the Best Projects to Maximise the Final Capital',
    tags: ['greedy', 'heap', 'two-heaps', 'sorting'],
    concept: {
      title: 'Among the projects you can afford, always do the most profitable one, then re-check what became affordable',
      body: [
        'You have the capital `w` and can complete **at most `k` different projects**. A project needs a minimum capital `c` to start (the money is not spent, it is only a requirement) and gives a **pure profit** `p` that is added to your capital when it is done. Which projects should you choose to end with the **largest capital**? For the projects `(c, p) = (0, 1) (1, 2) (1, 3)`, `k = 2` and `w = 0` the answer is 4: do the first project (capital 1), then the third (capital 4).',
        'At every moment only the projects with `c <= current capital` are *available*, and doing one never makes the others unavailable, it can only make **more** projects available (the capital never decreases). So there is no reason to prefer a smaller profit now: **among the available projects take the one with the largest profit**. The capital after it is the highest possible, so every project that is available under some other choice is also available now. This is an exchange argument over the `k` steps.',
        { code: 'order = sorted(range(n), key=lambda i: capital[i])     # by the required capital\nheap = []                                               # profits of the available projects (a max-heap)\ni = 0\nfor _ in range(k):\n    while i < n and capital[order[i]] <= w:           # projects that became affordable\n        heappush(heap, -profit[order[i]]); i += 1\n    if not heap: break                                 # nothing affordable\n    w -= heappop(heap)                                 # do the most profitable one\nprint(w)' },
        'The two data structures work together: a **sorted list** by capital (a pointer moves forward as the capital grows) and a **max-heap** of the available profits. Each project enters the heap once, so the time is O(n log n). The final capital can reach about 3 * 10^13, so 64-bit numbers are needed. This pattern, "unlock items by a threshold, then take the best unlocked one", appears in many scheduling and shopping problems.'
      ]
    },
    statement: ['You have the capital `w`. There are `n` projects; the project `i` can be started only if your current capital is at least `capital[i]` (the capital is not consumed) and, when finished, adds `profit[i]` to your capital. You may finish at most `k` projects, each at most once. Print the largest capital you can have at the end.'],
    outputFormat: ['Print the largest possible final capital.'],
    examples: [{ input: '3 2 0\n0 1 1\n1 2 3\n', note: 'Do the project with profit 1 (capital 1), then the one with profit 3: 4.' }, { input: '3 3 0\n0 1 2\n1 2 3\n', note: 'All three can be done in the order 1, 2, 3: capital 6.' }],
    hints: ['A project becomes available when the capital reaches its requirement.', 'Doing a project never makes other projects unavailable.', 'Keep the profits of the available projects in a max-heap and take the largest each time.'],
    program: {
      io: ['n:int k:int w:int', 'capital:int[n]', 'profit:int[n]'],
      fast: true,
      helpers: { python: 'from heapq import heappush, heappop', cpp: '', java: HEAP_JAVA },
      python: r`
        order = sorted(range(n), key=lambda i: capital[i])
        heap = []
        i = 0
        for _ in range(k):
            while i < n and capital[order[i]] <= w:
                heappush(heap, -profit[order[i]])
                i += 1
            if not heap:
                break
            w -= heappop(heap)
        print(w)`,
      cpp: r`
        vector<int> order(n);
        for (int i = 0; i < n; i++) order[i] = i;
        sort(order.begin(), order.end(), [&](int x, int y) { return capital[x] < capital[y]; });
        priority_queue<long long> heap;
        long long i = 0;
        for (long long t = 0; t < k; t++) {
            while (i < n && capital[order[i]] <= w) {
                heap.push(profit[order[i]]);
                i++;
            }
            if (heap.empty()) break;
            w += heap.top();
            heap.pop();
        }
        cout << w << "\n";`,
      java: r`
        int cnt = (int) n;
        long[] keys = new long[cnt];
        for (int i = 0; i < cnt; i++) keys[i] = capital[i] * 32768L + i;
        Arrays.sort(keys);
        heap = new long[cnt + 5];
        heapSize = 0;
        int i = 0;
        for (long t = 0; t < k; t++) {
            while (i < cnt && capital[(int) (keys[i] % 32768L)] <= w) {
                heapPush(-profit[(int) (keys[i] % 32768L)]);
                i++;
            }
            if (heapSize == 0) break;
            w -= heapPop();
        }
        System.out.println(w);`,
      includes: ['<algorithm>', '<queue>']
    },
    solution: { explanation: ['The projects are sorted by the required capital; before each of the k steps the newly affordable projects are pushed into a max-heap of profits, and the most profitable one is done.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, k, w0] = nums(rs[0]); const c = nums(rs[1]), p = nums(rs[2]);
      const heap =new MinHeap(); const order = many(n, (i) => i).sort((a, b) => c[a] - c[b]); let w = w0, i = 0; for (let t = 0; t < k; t++) { while (i < n && c[order[i]] <= w) heap.push(-p[order[i++]]); if (!heap.size) break; w -= heap.pop(); } return String(w);
    },
    tests() {
      const g = rng(3097); const out = ['3 2 0\n0 1 1\n1 2 3\n', '3 3 0\n0 1 2\n1 2 3\n', '1 1 0\n5\n5\n', '1 1 5\n5\n0\n', '2 2 1\n2 3\n10 10\n'];
      const make = (n, k, w, hi) => `${n} ${k} ${w}\n${randArray(g, n, 0, hi).join(' ')}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, k, w0] = nums(rs[0]); const c = nums(rs[1]), p = nums(rs[2]); let best = w0; const used = new Array(n).fill(false); const go = (cap, left) => { best = Math.max(best, cap); if (!left) return; for (let i = 0; i < n; i++) if (!used[i] && c[i] <= cap) { used[i] = true; go(cap + p[i], left - 1); used[i] = false; } }; go(w0, k); return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 7); return make(n, randInt(g, 1, n), randInt(g, 0, 5), 8); }, (i) => this.solve(i), brute, 800);
      for (let rep = 0; rep < 20; rep++) { const n = randInt(g, 10, 12); const input = make(n, randInt(g, 1, 5), randInt(g, 0, 5), 10); if (this.solve(input) !== brute(input)) throw new Error('heap solution differs from the exhaustive search'); }
      for (const [n, k, w, hi] of [[10, 5, 3, 20], [100, 30, 50, 1000], [1000, 500, 100, 1000000], [30000, 30000, 0, 1000000000], [30000, 15000, 1000000000, 1000000000], [30000, 100, 1000, 100000], [30000, 30000, 5, 10], [29999, 20000, 100, 1000000], [30000, 1, 0, 1000000000], [30000, 30000, 1000000000, 1000000000]]) out.push(make(n, k, w, hi));
      out.push(`30000 30000 0\n0 ${many(29999, (i) => i + 1).join(' ')}\n${many(30000, () => 1000000000).join(' ')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `k`: the number of piles and how many piles one merge takes.', 'The second line has `n` numbers: the sizes of the piles.'],
    constraints: ['1 <= n <= 30000', '2 <= k <= 10', '1 <= each size <= 10^9'],
    slug: 'cheapest-merging-of-piles',
    title: 'The Cheapest Way to Merge All Piles, K at a Time',
    tags: ['greedy', 'heap', 'huffman', 'merging'],
    concept: {
      title: 'Always merge the k smallest piles: it is the Huffman algorithm with more than two children per node',
      body: [
        'There are `n` piles of stones. In one move you take **exactly `k` piles** and merge them into one pile; the move costs the **total size** of the merged piles. You must end up with **one pile**. What is the smallest total cost? Print -1 if it is impossible. For the piles `4 3 3 2` and `k = 2` the cost is 24: merge 2 and 3 (cost 5), then 3 and 4 (cost 7), then 5 and 7 (cost 12).',
        'Each merge reduces the number of piles by `k - 1`, so one pile is reached exactly when `(n - 1)` is divisible by `(k - 1)`. If not, the answer is -1 (and for `n = 1` the cost is 0). The cost of a pile in the final total is its size multiplied by the number of merges that it takes part in, which is its **depth** in the merge tree. To minimise the sum of `size * depth`, the biggest piles must be merged **last** (small depth) and the smallest piles **first** (large depth). So repeatedly take the **`k` smallest piles**, merge them, and put the result back: this is the *Huffman coding* algorithm for a tree with `k` children per node.',
        { code: 'if (n - 1) % (k - 1) != 0:\n    print(-1)\nelse:\n    heap = list(piles); heapify(heap)\n    cost = 0\n    while len(heap) > 1:\n        merged = sum(heappop(heap) for _ in range(k))   # the k smallest piles\n        cost += merged\n        heappush(heap, merged)\n    print(cost)' },
        'Why is the divisibility condition enough? Every merge leaves `n - (k - 1)` piles, then `n - 2(k - 1)`, ..., so after `(n - 1) / (k - 1)` merges exactly one pile remains, and before the last merge there are exactly `k` piles, so each merge can always take `k` piles. The time is O(n log n) for the heap, with at most `(n - 1) / (k - 1)` merges. The total cost fits in 64 bits: the sum of all sizes is at most 3 * 10^13 and the depth is at most about 15.'
      ]
    },
    statement: ['`n` piles are given. One move takes exactly `k` piles and replaces them by one pile whose size is their total; the move costs this total. Print the smallest total cost of moves that leaves exactly one pile, or -1 if this cannot be done. (If `n = 1` the cost is 0.)'],
    outputFormat: ['Print the smallest total cost, or -1.'],
    examples: [{ input: '4 2\n4 3 3 2\n', note: 'Merge 2+3=5 (cost 5), then 3+4=7 (cost 7), then 5+7=12 (cost 12): 24.' }, { input: '4 3\n1 2 3 4\n', note: 'After one merge of 3 piles, 2 piles remain, which is fewer than 3: -1.' }],
    hints: ['Each merge removes k - 1 piles, so n - 1 must be divisible by k - 1.', 'A pile pays its size for every merge it is part of.', 'Merge the k smallest piles each time, using a min-heap.'],
    program: {
      io: ['n:int k:int', 'piles:int[n]'],
      fast: true,
      helpers: { python: 'from heapq import heapify, heappush, heappop', cpp: '', java: HEAP_JAVA },
      python: r`
        if (n - 1) % (k - 1) != 0:
            print(-1)
        else:
            heap = list(piles)
            heapify(heap)
            cost = 0
            while len(heap) > 1:
                merged = 0
                for _ in range(k):
                    merged += heappop(heap)
                cost += merged
                heappush(heap, merged)
            print(cost)`,
      cpp: r`
        if ((n - 1) % (k - 1) != 0) {
            cout << -1 << "\n";
        } else {
            priority_queue<long long, vector<long long>, greater<long long>> heap(piles.begin(), piles.end());
            long long cost = 0;
            while (heap.size() > 1) {
                long long merged = 0;
                for (long long t = 0; t < k; t++) {
                    merged += heap.top();
                    heap.pop();
                }
                cost += merged;
                heap.push(merged);
            }
            cout << cost << "\n";
        }`,
      java: r`
        if ((n - 1) % (k - 1) != 0) {
            System.out.println(-1);
        } else {
            int cnt = (int) n;
            heap = new long[cnt + 5];
            heapSize = 0;
            for (int i = 0; i < cnt; i++) heapPush(piles[i]);
            long cost = 0;
            while (heapSize > 1) {
                long merged = 0;
                for (long t = 0; t < k; t++) merged += heapPop();
                cost += merged;
                heapPush(merged);
            }
            System.out.println(cost);
        }`,
      includes: ['<queue>', '<functional>']
    },
    solution: { explanation: ['If n - 1 is not divisible by k - 1 the answer is -1; otherwise the k smallest piles are merged repeatedly with a min-heap, and the merge costs are added.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, k] = nums(rs[0]); const piles = nums(rs[1]); if ((n - 1) % (k - 1) !== 0) return '-1';
      const heap =new MinHeap(); for (const x of piles) heap.push(x); let cost = 0; while (heap.size > 1) { let merged = 0; for (let t = 0; t < k; t++) merged += heap.pop(); cost += merged; heap.push(merged); } return String(cost);
    },
    tests() {
      const g = rng(3098); const out = ['4 2\n4 3 3 2\n', '4 3\n1 2 3 4\n', '1 5\n7\n', '3 2\n1 1 1\n', '5 3\n1 2 3 4 5\n'];
      const make = (n, k, hi) => `${n} ${k}\n${randArray(g, n, 1, hi).join(' ')}\n`;
      const exhaustive = (input) => { const rs = rows(input); const [n, k] = nums(rs[0]); const piles = nums(rs[1]); if ((n - 1) % (k - 1) !== 0) return '-1'; const memo = new Map(); const go = (arr) => { if (arr.length === 1) return 0; const key = arr.slice().sort((a, b) => a - b).join(','); if (memo.has(key)) return memo.get(key); let best = Infinity; const pick = (start, chosen) => { if (chosen.length === k) { const sum = chosen.reduce((s, i) => s + arr[i], 0); const rest = arr.filter((_, i) => !chosen.includes(i)); best = Math.min(best, sum + go([...rest, sum])); return; } for (let i = start; i < arr.length; i++) { chosen.push(i); pick(i + 1, chosen); chosen.pop(); } }; pick(0, []); memo.set(key, best); return best; }; return String(go(piles)); }; // every sequence of merges
      crossCheck(() => { const k = randInt(g, 2, 4); const n = 1 + (k - 1) * randInt(g, 0, Math.floor(6 / (k - 1))); return make(n, k, 10); }, (i) => this.solve(i), exhaustive, 300);
      crossCheck(() => make(randInt(g, 1, 7), randInt(g, 2, 4), 10), (i) => this.solve(i), exhaustive, 300);
      for (const [n, k, hi] of [[11, 2, 20], [100, 3, 1000], [1000, 2, 1000000], [30000, 2, 1000000000], [29999, 3, 1000000000], [30000, 10, 1000000000], [28999, 10, 100], [29998, 4, 1000000000], [30000, 7, 5], [29997, 2, 1000000000]]) out.push(make(n, k, hi));
      out.push(`30000 2\n${new Array(30000).fill(1000000000).join(' ')}\n`, `30000 5\n${many(30000, (i) => i + 1).join(' ')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 100000', 'The word consists of lowercase English letters.'],
    slug: 'smallest-word-keeping-each-letter-once',
    title: 'The Smallest Word That Keeps Every Letter Exactly Once',
    tags: ['greedy', 'monotonic-stack', 'string', 'lexicographic'],
    concept: {
      title: 'Keep a stack of letters; pop a bigger letter from the top if it appears again later',
      body: [
        'From the word `s` delete letters so that **every distinct letter of `s` remains exactly once**, and the remaining letters keep their original order. Among all such results print the **lexicographically smallest**. For `bcabc` the answer is `abc`, and for `cbacdcbc` it is `acdb`.',
        'Process the letters from left to right and keep the answer built so far as a **stack**. For the current letter `c`: if it is already on the stack, skip it (each letter is kept only once, and keeping the earlier copy is never worse, as the stack was built to be as small as possible). Otherwise, look at the top of the stack: while the top is **bigger than `c`** and that top letter **appears again later** in the word, we can remove it now and re-add it later, which makes the word smaller. Pop it. Then push `c`. To know "appears again later" we precompute the **last position** of every letter.',
        { code: 'last = {c: i for i, c in enumerate(s)}\nstack, on_stack = [], set()\nfor i, c in enumerate(s):\n    if c in on_stack:\n        continue\n    while stack and stack[-1] > c and last[stack[-1]] > i:\n        on_stack.remove(stack.pop())         # it will come again later\n    stack.append(c); on_stack.add(c)\nprint("".join(stack))' },
        'Every letter is pushed and popped at most once, so the algorithm is O(n). The condition on `last` is what keeps the answer legal: a bigger letter is removed only when we are sure that another copy of it will come, so every distinct letter still appears exactly once in the end. This is the same stack idea as in the problem "remove k digits to make the smallest number", but the number of removals is not given: it is decided by the future.'
      ]
    },
    statement: ['A word `s` is given. Delete letters from it so that every letter that occurs in `s` remains exactly once and the order of the remaining letters is unchanged. Print the lexicographically smallest word that can be obtained this way.'],
    outputFormat: ['Print the word.'],
    examples: [{ input: 'bcabc\n', note: 'abc.' }, { input: 'cbacdcbc\n', note: 'acdb.' }],
    hints: ['Remember the last position of every letter.', 'Keep a stack and a set of the letters on it.', 'Pop a bigger letter from the top only if it occurs again later.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        last = {}
        for i, c in enumerate(s):
            last[c] = i
        stack = []
        on_stack = set()
        for i, c in enumerate(s):
            if c in on_stack:
                continue
            while stack and stack[-1] > c and last[stack[-1]] > i:
                on_stack.remove(stack.pop())
            stack.append(c)
            on_stack.add(c)
        print("".join(stack))`,
      cpp: r`
        int last[26];
        for (size_t i = 0; i < s.size(); i++) last[s[i] - 'a'] = (int)i;
        bool onStack[26] = {false};
        string st;
        for (size_t i = 0; i < s.size(); i++) {
            char c = s[i];
            if (onStack[c - 'a']) continue;
            while (!st.empty() && st.back() > c && last[st.back() - 'a'] > (int)i) {
                onStack[st.back() - 'a'] = false;
                st.pop_back();
            }
            st.push_back(c);
            onStack[c - 'a'] = true;
        }
        cout << st << "\n";`,
      java: r`
        int len = s.length();
        int[] last = new int[26];
        for (int i = 0; i < len; i++) last[s.charAt(i) - 'a'] = i;
        boolean[] onStack = new boolean[26];
        char[] st = new char[len];
        int top = 0;
        for (int i = 0; i < len; i++) {
            char c = s.charAt(i);
            if (onStack[c - 'a']) continue;
            while (top > 0 && st[top - 1] > c && last[st[top - 1] - 'a'] > i) {
                onStack[st[top - 1] - 'a'] = false;
                top--;
            }
            st[top++] = c;
            onStack[c - 'a'] = true;
        }
        System.out.println(new String(st, 0, top));`
    },
    solution: { explanation: ['A stack of letters is kept; a letter already on the stack is skipped, otherwise bigger letters on top that occur again later are popped before the new letter is pushed.'], complexity: 'Time O(n), space O(26).' },
    solve(input) {
      const s = rows(input)[0]; // the recursive method: the answer starts with the smallest letter whose first occurrence has all the remaining letters after it
      const go = (str) => { if (!str) return ''; const need = new Set(str); let pos = 0; const count = new Map(); for (const ch of str) count.set(ch, (count.get(ch) || 0) + 1); for (let i = 0; i < str.length; i++) { if (str[i] < str[pos]) pos = i; count.set(str[i], count.get(str[i]) - 1); if (count.get(str[i]) === 0) break; } const c = str[pos]; return c + go(str.slice(pos + 1).split(c).join('')); };
      return go(s);
    },
    tests() {
      const g = rng(3099); const out = ['bcabc\n', 'cbacdcbc\n', 'a\n', 'aaaa\n', 'zyx\n', 'abacb\n'];
      const brute = (input) => { const s = rows(input)[0]; const letters = new Set(s); let best = null; for (let mask = 0; mask < (1 << s.length); mask++) { let word = ''; for (let i = 0; i < s.length; i++) if (mask >> i & 1) word += s[i]; if (word.length !== letters.size || new Set(word).size !== letters.size) continue; if (best === null || word < best) best = word; } return best; };
      crossCheck(() => randWord(g, randInt(g, 1, 11), 'abcd') + '\n', (i) => this.solve(i), brute, 800);
      for (const [n, al] of [[30, 'abcdefg'], [200, 'abcdefghijklmnopqrstuvwxyz'], [100000, 'abcdefghijklmnopqrstuvwxyz'], [100000, 'abc'], [99999, 'abcdefghij'], [100000, 'xyz']]) out.push(randWord(g, n, al) + '\n');
      out.push('zyxwvutsrqponmlkjihgfedcba'.repeat(3846) + '\n', 'abcdefghijklmnopqrstuvwxyz'.repeat(3846) + '\n', 'a'.repeat(50000) + 'b'.repeat(50000) + '\n', 'ba'.repeat(50000) + '\n', ('z'.repeat(1000) + 'a'.repeat(1000)).repeat(50) + '\n');
      return out;
    }
  }
];
