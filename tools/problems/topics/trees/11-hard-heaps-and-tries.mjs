import { r, rng, randInt, many, nums, rows, shuffle } from '../../lib.mjs';

// A small binary heap for the reference solutions; less(a, b) is true when a must come out before b.
class Heap {
  constructor(less) { this.a = []; this.less = less; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) { const a = this.a; a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (!this.less(a[i], a[p])) break; [a[i], a[p]] = [a[p], a[i]]; i = p; } }
  pop() { const a = this.a; const top = a[0]; const last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { let s = i; for (const c of [2 * i + 1, 2 * i + 2]) if (c < a.length && this.less(a[c], a[s])) s = c; if (s === i) break; [a[i], a[s]] = [a[s], a[i]]; i = s; } } return top; }
}
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const BIG = 1000000000;
const list = (a) => `${a.length}\n${a.join(' ')}\n`;

export default [
  {
    ...hard,
    inputFormat: ['The first line has `n`, the number of buildings.', 'Each of the next `n` lines has three numbers `left`, `right` and `height` of a building.'],
    constraints: ['1 <= n <= 20000', '0 <= left < right <= 10^9', '1 <= height <= 10^9'],
    slug: 'skyline-of-buildings',
    title: 'The Skyline of a City',
    tags: ['heap', 'priority-queue', 'sweep-line'],
    concept: {
      title: 'Sweep from left to right; a max-heap tells the tallest building that is standing now',
      body: [
        'Buildings are rectangles standing on the ground: building `i` covers the x-range `[left, right)` and has some height. Look at the city from far away: the *skyline* is the outline of all buildings together. Describe it by its **key points**: the places `(x, h)` where the height of the outline changes to `h`. The last key point always has the height 0.',
        'Sweep a vertical line from left to right. The height of the outline at the position of the line is the height of the **tallest building that covers the line**. This only changes at the **edges** of buildings, so create two **events** for each building: a *start* at `left` and an *end* at `right`. Process the events in order of `x`. A max-heap holds the buildings that have started; its top is the tallest one.',
        '- At a **start**, push the building. At an **end**, the building must leave the heap, but a heap cannot remove an element from the middle. The trick is *lazy deletion*: do nothing now, and when a building is at the **top** of the heap and its `right` is at most the current `x`, throw it away.\n- After handling an event, look at the top: if its height differs from the last reported height, `(x, new height)` is a key point.',
        { code: 'events = []\nfor l, r, h in buildings:\n    events.append((l, -h, r))          # a start; -h so that taller buildings come first at the same x\n    events.append((r, 0, 0))           # an end\nevents.sort()\nheap = [(0, INF)]                      # (-height, right edge); the ground is always there\nprev = 0\nfor x, negh, r in events:\n    while heap[0][1] <= x:             # the top building is already over\n        heappop(heap)\n    if negh:\n        heappush(heap, (negh, r))\n    cur = -heap[0][0]\n    if cur != prev:\n        print(x, cur)\n        prev = cur' },
        'The order of the events at the same `x` matters: starts come before ends because the ends have the key `0` and the starts a negative key. This way a building that starts exactly where another one ends does not make the outline dip to the ground for an instant. The time is O(n log n).'
      ]
    },
    statement: ['Buildings are given as rectangles standing on the ground: the building `(left, right, height)` covers the x-range from `left` to `right` and rises to the given height. The skyline is the outline of all the buildings together. Print its key points in order of increasing `x`: a key point `x h` means that from `x` on (up to the next key point) the outline has the height `h`. The first key point is the left edge of the leftmost building, and the last key point has the height 0. No two consecutive key points have the same height.'],
    outputFormat: ['One line `x h` for every key point.'],
    examples: [{ input: '5\n2 9 10\n3 7 15\n5 12 12\n15 20 10\n19 24 8\n', note: 'The outline: 2 10, then 3 15, then 7 12, then 12 0 (the ground), then 15 10, 20 8, 24 0.' }],
    hints: ['Make a start event and an end event for every building and sort them by x.', 'Keep the buildings that have started in a max-heap; remove ended buildings lazily when they reach the top.', 'After each event compare the tallest height with the previous one and print a key point when it changed.'],
    program: {
      io: ['n:int', 'bld:int[n][3]'],
      fast: true,
      includes: ['<queue>', '<algorithm>', '<functional>', '<utility>'],
      python: r`
        import heapq
        events = []
        for l, r, h in bld:
            events.append((l, -h, r))
            events.append((r, 0, 0))
        events.sort()
        heap = [(0, 10 ** 18)]
        out = []
        prev = 0
        for x, negh, r in events:
            while heap[0][1] <= x:
                heapq.heappop(heap)
            if negh != 0:
                heapq.heappush(heap, (negh, r))
            cur = -heap[0][0]
            if cur != prev:
                out.append(str(x) + " " + str(cur))
                prev = cur
        print("\n".join(out))`,
      cpp: r`
        vector<vector<long long>> events;
        for (const vector<long long>& b : bld) {
            events.push_back({b[0], -b[2], b[1]});
            events.push_back({b[1], 0, 0});
        }
        sort(events.begin(), events.end());
        priority_queue<pair<long long, long long>, vector<pair<long long, long long>>, greater<pair<long long, long long>>> heap;
        heap.push({0, 1000000000000000000LL});
        long long prev = 0;
        for (const vector<long long>& e : events) {
            long long x = e[0];
            while (heap.top().second <= x) heap.pop();
            if (e[1] != 0) heap.push({e[1], e[2]});
            long long cur = -heap.top().first;
            if (cur != prev) {
                cout << x << " " << cur << "\n";
                prev = cur;
            }
        }`,
      java: r`
        long[][] events = new long[2 * bld.length][];
        for (int i = 0; i < bld.length; i++) {
            events[2 * i] = new long[] {bld[i][0], -bld[i][2], bld[i][1]};
            events[2 * i + 1] = new long[] {bld[i][1], 0, 0};
        }
        Arrays.sort(events, (p, q) -> p[0] != q[0] ? Long.compare(p[0], q[0]) : p[1] != q[1] ? Long.compare(p[1], q[1]) : Long.compare(p[2], q[2]));
        PriorityQueue<long[]> heap = new PriorityQueue<>((p, q) -> p[0] != q[0] ? Long.compare(p[0], q[0]) : Long.compare(p[1], q[1]));
        heap.add(new long[] {0, 1000000000000000000L});
        long prev = 0;
        StringBuilder out = new StringBuilder();
        for (long[] e : events) {
            long x = e[0];
            while (heap.peek()[1] <= x) heap.poll();
            if (e[1] != 0) heap.add(new long[] {e[1], e[2]});
            long cur = -heap.peek()[0];
            if (cur != prev) {
                out.append(x).append(" ").append(cur).append("\n");
                prev = cur;
            }
        }
        System.out.print(out);`
    },
    solution: { explanation: ['Start and end events are sorted by x (starts before ends at the same x, taller starts first). A min-heap of (-height, right edge) holds the buildings that have started; buildings that are over are removed lazily from the top. A key point is printed whenever the top height changes.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const bld = many(n, (i) => nums(rs[i + 1]));
      const xs = [...new Set(bld.flatMap(([l, rr]) => [l, rr]))].sort((a, b) => a - b); const idx = new Map(xs.map((x, i) => [x, i])); const m = xs.length;
      const height = new Array(m).fill(0); const next = Array.from({ length: m + 1 }, (_, i) => i);
      const find = (i) => { while (next[i] !== i) { next[i] = next[next[i]]; i = next[i]; } return i; };
      for (const [l, rr, h] of bld.slice().sort((a, b) => b[2] - a[2])) { let i = find(idx.get(l)); const end = idx.get(rr); while (i < end) { height[i] = h; next[i] = i + 1; i = find(i + 1); } }
      const out = []; let prev = 0; for (let i = 0; i < m; i++) if (height[i] !== prev) { out.push(`${xs[i]} ${height[i]}`); prev = height[i]; }
      return out.join('\n');
    },
    tests() {
      const g = rng(811); const out = ['5\n2 9 10\n3 7 15\n5 12 12\n15 20 10\n19 24 8\n', '1\n0 2 3\n', '2\n0 2 3\n2 5 3\n', '2\n0 5 3\n1 2 7\n', '3\n1 5 3\n1 5 3\n1 5 2\n'];
      const text = (b) => `${b.length}\n${b.map((x) => x.join(' ')).join('\n')}\n`;
      const make = (n, span, maxWidth, maxHeight) => text(many(n, () => { const l = randInt(g, 0, span - 1); return [l, Math.min(BIG, l + randInt(g, 1, maxWidth)), randInt(g, 1, maxHeight)]; }));
      const brute = (input) => { const rs = rows(input); const bld = many(Number(rs[0]), (i) => nums(rs[i + 1])); const xs = [...new Set(bld.flatMap(([l, rr]) => [l, rr]))].sort((a, b) => a - b); const res = []; let prev = 0; for (const x of xs) { const h = Math.max(0, ...bld.filter(([l, rr]) => l <= x && x < rr).map((b) => b[2])); if (h !== prev) { res.push(`${x} ${h}`); prev = h; } } return res.join('\n'); };
      crossCheck(() => make(randInt(g, 1, 10), 12, 6, 6), (i) => this.solve(i), brute);
      for (const [n, span, w, h] of [[8, 20, 8, 10], [30, 50, 20, 20], [300, 1000, 300, 1000], [3000, 10000, 3000, 100000], [20000, BIG, BIG, BIG], [20000, 200, 40, 50], [20000, 100000, 10, 5], [20000, 30, 30, 3]]) out.push(make(n, span, w, h));
      out.push(text(many(20000, (i) => [i, i + 1, (i % 7) + 1])), text(many(20000, (i) => [i, 40000 - i, i + 1])), text(many(20000, (i) => [i * 2, i * 2 + 2, 5])));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` numbers.'],
    constraints: ['1 <= k <= n <= 20000', '-10^9 <= every number <= 10^9'],
    slug: 'sliding-window-median',
    title: 'The Median of Every Window',
    tags: ['heap', 'priority-queue', 'sliding-window', 'lazy-deletion'],
    concept: {
      title: 'Two heaps for the window, and lazy deletion for the number that leaves',
      body: [
        'A window of `k` consecutive numbers slides over an array. For every position print the **median** of the window (if `k` is even, the lower of the two middle numbers). Sorting each window costs O(k log k) per position; keeping a sorted list and inserting and removing one number per step costs O(k) per step because of shifting. With two heaps we get O(log k) per step.',
        'Use the structure of the running-median task: a **max-heap `low`** with the smaller half of the window and a **min-heap `high`** with the larger half, sizes `ceil(k / 2)` and `floor(k / 2)`. The median is the top of `low`. Moving the window inserts the new number (as before) and must also **remove the number that leaves**, which may sit anywhere inside a heap, and a heap cannot do that.',
        '*Lazy deletion* solves it: do not remove the number now, only **remember** that it is dead (a dictionary `delayed[value]` counts how many copies are dead) and **count the sizes of the halves without the dead numbers**. Whenever a dead number reaches the **top** of a heap, remove it for real. Which half does the leaving number belong to? If it is at most the top of `low`, it is in `low`, otherwise in `high` (equal values are interchangeable).',
        { code: 'def erase(x):\n    delayed[x] = delayed.get(x, 0) + 1\n    if x <= -low[0]:                  # x lives in the lower half\n        sizes[0] -= 1\n        if x == -low[0]:\n            prune(low)                # a dead number is on top: really remove it now\n    else:\n        sizes[1] -= 1\n        if high and x == high[0]:\n            prune(high)\n    balance()                         # the halves may be out of balance by one' },
        'After every insertion or erase, `balance()` moves one number between the heaps if the sizes are not `ceil(k / 2)` and `floor(k / 2)`, and the tops are cleaned. The total time is O(n log n). The same pattern, "a heap with lazy deletion", solves many problems where elements expire.'
      ]
    },
    statement: ['An array of `n` numbers and a window size `k` are given. For every position of the window (from the first `k` numbers to the last `k` numbers) print the median of the numbers in the window. If `k` is even, the median is the lower of the two middle numbers, which is the (k / 2)-th smallest number of the window.'],
    outputFormat: ['`n - k + 1` lines: the median of every window.'],
    examples: [{ input: '8 3\n1 3 -1 -3 5 3 6 7\n', note: 'The windows 1 3 -1, 3 -1 -3, -1 -3 5, -3 5 3, 5 3 6, 3 6 7 have the medians 1, -1, -1, 3, 5, 6.' }],
    hints: ['Keep the smaller half of the window in a max-heap and the larger half in a min-heap.', 'To remove the number that leaves the window, only count it as dead and remove it for real when it reaches the top of its heap.', 'Count the sizes of the halves without the dead numbers, and rebalance after every change.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<queue>', '<functional>', '<unordered_map>'],
      helpers: {
        python: r`
          import heapq
          low = []
          high = []
          delayed = {}
          sizes = [0, 0]

          def prune(heap, negate):
              while heap:
                  x = -heap[0] if negate else heap[0]
                  if delayed.get(x, 0) > 0:
                      delayed[x] -= 1
                      heapq.heappop(heap)
                  else:
                      break

          def balance():
              if sizes[0] > sizes[1] + 1:
                  heapq.heappush(high, -heapq.heappop(low))
                  sizes[0] -= 1
                  sizes[1] += 1
                  prune(low, True)
              elif sizes[0] < sizes[1]:
                  heapq.heappush(low, -heapq.heappop(high))
                  sizes[0] += 1
                  sizes[1] -= 1
                  prune(high, False)

          def insert(x):
              if not low or x <= -low[0]:
                  heapq.heappush(low, -x)
                  sizes[0] += 1
              else:
                  heapq.heappush(high, x)
                  sizes[1] += 1
              balance()

          def erase(x):
              delayed[x] = delayed.get(x, 0) + 1
              if x <= -low[0]:
                  sizes[0] -= 1
                  if x == -low[0]:
                      prune(low, True)
              else:
                  sizes[1] -= 1
                  if high and x == high[0]:
                      prune(high, False)
              balance()`,
        cpp: r`
          priority_queue<long long> low;
          priority_queue<long long, vector<long long>, greater<long long>> high;
          unordered_map<long long, int> delayed;
          long long lowSize = 0, highSize = 0;

          void pruneLow() {
              while (!low.empty() && delayed[low.top()] > 0) {
                  delayed[low.top()]--;
                  low.pop();
              }
          }

          void pruneHigh() {
              while (!high.empty() && delayed[high.top()] > 0) {
                  delayed[high.top()]--;
                  high.pop();
              }
          }

          void balance() {
              if (lowSize > highSize + 1) {
                  high.push(low.top());
                  low.pop();
                  lowSize--;
                  highSize++;
                  pruneLow();
              } else if (lowSize < highSize) {
                  low.push(high.top());
                  high.pop();
                  lowSize++;
                  highSize--;
                  pruneHigh();
              }
          }

          void insertValue(long long x) {
              if (low.empty() || x <= low.top()) {
                  low.push(x);
                  lowSize++;
              } else {
                  high.push(x);
                  highSize++;
              }
              balance();
          }

          void eraseValue(long long x) {
              delayed[x]++;
              if (x <= low.top()) {
                  lowSize--;
                  if (x == low.top()) pruneLow();
              } else {
                  highSize--;
                  if (!high.empty() && x == high.top()) pruneHigh();
              }
              balance();
          }`,
        java: r`
          static PriorityQueue<Long> low = new PriorityQueue<>(Collections.reverseOrder());
          static PriorityQueue<Long> high = new PriorityQueue<>();
          static Map<Long, Integer> delayed = new HashMap<>();
          static long lowSize = 0, highSize = 0;

          static void prune(PriorityQueue<Long> heap) {
              while (!heap.isEmpty() && delayed.getOrDefault(heap.peek(), 0) > 0) {
                  delayed.merge(heap.peek(), -1, Integer::sum);
                  heap.poll();
              }
          }

          static void balance() {
              if (lowSize > highSize + 1) {
                  high.add(low.poll());
                  lowSize--;
                  highSize++;
                  prune(low);
              } else if (lowSize < highSize) {
                  low.add(high.poll());
                  lowSize++;
                  highSize--;
                  prune(high);
              }
          }

          static void insertValue(long x) {
              if (low.isEmpty() || x <= low.peek()) {
                  low.add(x);
                  lowSize++;
              } else {
                  high.add(x);
                  highSize++;
              }
              balance();
          }

          static void eraseValue(long x) {
              delayed.merge(x, 1, Integer::sum);
              if (x <= low.peek()) {
                  lowSize--;
                  if (x == low.peek()) prune(low);
              } else {
                  highSize--;
                  if (!high.isEmpty() && x == high.peek()) prune(high);
              }
              balance();
          }`
      },
      python: r`
        out = []
        for i in range(n):
            insert(a[i])
            if i >= k:
                erase(a[i - k])
            if i >= k - 1:
                out.append(-low[0])
        print("\n".join(map(str, out)))`,
      cpp: r`
        for (long long i = 0; i < n; i++) {
            insertValue(a[i]);
            if (i >= k) eraseValue(a[i - k]);
            if (i >= k - 1) cout << low.top() << "\n";
        }`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < n; i++) {
            insertValue(a[i]);
            if (i >= k) eraseValue(a[(int) (i - k)]);
            if (i >= k - 1) out.append(low.peek()).append("\n");
        }
        System.out.print(out);`
    },
    solution: { explanation: ['Two heaps hold the smaller and the larger half of the window. The number that leaves is only counted as dead (lazy deletion), the sizes of the halves count only live numbers, dead numbers are removed when they reach a top, and the halves are rebalanced after every change. The median is the top of the lower half.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); const window = a.slice(0, k).sort((x, y) => x - y); const out = [window[(k - 1) >> 1]];
      const lowerBound = (v) => { let lo = 0, hi = window.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (window[mid] < v) lo = mid + 1; else hi = mid; } return lo; };
      for (let i = k; i < n; i++) { window.splice(lowerBound(a[i - k]), 1); window.splice(lowerBound(a[i]), 0, a[i]); out.push(window[(k - 1) >> 1]); }
      return out.join('\n');
    },
    tests() {
      const g = rng(812); const out = ['8 3\n1 3 -1 -3 5 3 6 7\n', '1 1\n5\n', '4 2\n1 2 3 4\n', '4 4\n4 3 2 1\n', '5 2\n2 2 2 2 2\n'];
      const text = (a, k) => `${a.length} ${k}\n${a.join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); const res = []; for (let i = 0; i + k <= n; i++) res.push(a.slice(i, i + k).sort((x, y) => x - y)[(k - 1) >> 1]); return res.join('\n'); };
      crossCheck(() => { const n = randInt(g, 1, 14); return text(many(n, () => randInt(g, -4, 4)), randInt(g, 1, n)); }, (i) => this.solve(i), brute, 300);
      for (const [n, lo, hi] of [[10, -5, 5], [60, -3, 3], [500, -100, 100], [5000, -BIG, BIG], [20000, -BIG, BIG], [20000, 0, 3]]) {
        const a = many(n, () => randInt(g, lo, hi));
        for (const k of (n >= 5000 ? [2, Math.floor(n / 10), Math.floor(n / 2), n] : [1, 2, 3, Math.max(1, Math.floor(n / 10)), Math.max(1, Math.floor(n / 2)), n - 1, n])) out.push(text(a, Math.max(1, k)));
      }
      out.push(text(many(20000, (i) => i), 7), text(many(20000, (i) => 20000 - i), 1000), text(many(20000, (i) => (i % 2 ? i : -i)), 6001));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `k`, the number of lists.', 'The second line has `k` numbers: the lengths of the lists.', 'The third line has `total`, the sum of the lengths.', 'The fourth line has the `total` numbers: the first list, then the second list, and so on. Every list is in non-decreasing order.'],
    constraints: ['1 <= k <= 3500', 'Every list has at least one number.', '1 <= total <= 20000', '-10^9 <= every number <= 10^9'],
    slug: 'smallest-range-covering-all-lists',
    title: 'The Narrowest Range That Touches Every List',
    tags: ['heap', 'priority-queue', 'sliding-window', 'k-way-merge'],
    concept: {
      title: 'Walk through the lists like a k-way merge, always advancing the smallest front element',
      body: [
        'There are `k` sorted lists. Find the smallest range `[a, b]` (smallest `b - a`) that contains **at least one number from each list**; if several ranges are equally small, take the one with the smaller `a`.',
        'Imagine a window that holds **exactly one number from each list**: the front elements. The range of this window is from the smallest front number to the largest. To improve the range, the **smallest** front number must change (moving any other number only makes the range wider or the same), so replace it by the **next number of its own list**. A min-heap gives the smallest front element, and a variable remembers the largest front value.',
        { code: 'heap = [(lists[i][0], i, 0) for i in range(k)]           # one front element per list\nheapify(heap)\ncur_max = max(lists[i][0] for i in range(k))\nbest = (heap[0][0], cur_max)\nwhile True:\n    value, i, j = heappop(heap)                           # the smallest front element\n    if j + 1 == len(lists[i]):\n        break                                             # this list has no more numbers: stop\n    nxt = lists[i][j + 1]\n    heappush(heap, (nxt, i, j + 1))\n    cur_max = max(cur_max, nxt)\n    if cur_max - heap[0][0] < best[1] - best[0]:\n        best = (heap[0][0], cur_max)' },
        'The loop stops as soon as one list is exhausted, because then no window can contain a number from every list. Every number is pushed once, so the time is O(total * log k). Note the strict `<`: when two ranges are equally narrow, the earlier one (with the smaller start) is kept.'
      ]
    },
    statement: ['`k` lists of numbers are given, each in non-decreasing order. Find the smallest range `[a, b]` that contains at least one number from each list (a number `x` is in the range if `a <= x <= b`). The range `[a, b]` is smaller than `[c, d]` if `b - a < d - c`, or if the lengths are equal and `a < c`. Print `a` and `b`.'],
    outputFormat: ['Print `a b`.'],
    examples: [{ input: '3\n5 4 4\n13\n4 10 15 24 26 0 9 12 20 5 18 22 30\n', note: 'The lists are 4 10 15 24 26 and 0 9 12 20 and 5 18 22 30. The range [20, 24] contains 24, 20 and 22, one number of each list, and no narrower range does that.' }],
    hints: ['Keep one front element of each list in a min-heap and remember the largest of them.', 'The window is the smallest front element up to the largest; to improve it, replace the smallest by the next element of its list.', 'Stop when a list has no next element; remember the best range with a strict comparison, so that ties keep the smaller start.'],
    program: {
      io: ['k:int', 'lens:int[k]', 'total:int', 'vals:int[total]'],
      fast: true,
      includes: ['<queue>', '<functional>', '<utility>'],
      python: r`
        import heapq
        lists = []
        pos = 0
        for length in lens:
            lists.append(vals[pos:pos + length])
            pos += length
        heap = [(lists[i][0], i, 0) for i in range(k)]
        heapq.heapify(heap)
        cur_max = max(lst[0] for lst in lists)
        best = (heap[0][0], cur_max)
        while True:
            value, i, j = heapq.heappop(heap)
            if j + 1 == len(lists[i]):
                break
            nxt = lists[i][j + 1]
            heapq.heappush(heap, (nxt, i, j + 1))
            cur_max = max(cur_max, nxt)
            if cur_max - heap[0][0] < best[1] - best[0]:
                best = (heap[0][0], cur_max)
        print(best[0], best[1])`,
      cpp: r`
        vector<vector<long long>> lists;
        size_t pos = 0;
        for (long long length : lens) {
            lists.push_back(vector<long long>(vals.begin() + pos, vals.begin() + pos + length));
            pos += length;
        }
        typedef pair<long long, pair<int, int>> Item;
        priority_queue<Item, vector<Item>, greater<Item>> heap;
        long long curMax = lists[0][0];
        for (int i = 0; i < (int)lists.size(); i++) {
            heap.push({lists[i][0], {i, 0}});
            curMax = max(curMax, lists[i][0]);
        }
        long long bestLow = heap.top().first, bestHigh = curMax;
        for (;;) {
            Item top = heap.top();
            heap.pop();
            int i = top.second.first, j = top.second.second;
            if (j + 1 == (int)lists[i].size()) break;
            long long next = lists[i][j + 1];
            heap.push({next, {i, j + 1}});
            curMax = max(curMax, next);
            if (curMax - heap.top().first < bestHigh - bestLow) {
                bestLow = heap.top().first;
                bestHigh = curMax;
            }
        }
        cout << bestLow << " " << bestHigh << "\n";`,
      java: r`
        List<long[]> lists = new ArrayList<>();
        int pos = 0;
        for (long length : lens) {
            lists.add(Arrays.copyOfRange(vals, pos, pos + (int) length));
            pos += (int) length;
        }
        PriorityQueue<long[]> heap = new PriorityQueue<>((p, q) -> p[0] != q[0] ? Long.compare(p[0], q[0]) : p[1] != q[1] ? Long.compare(p[1], q[1]) : Long.compare(p[2], q[2]));
        long curMax = lists.get(0)[0];
        for (int i = 0; i < lists.size(); i++) {
            heap.add(new long[] {lists.get(i)[0], i, 0});
            curMax = Math.max(curMax, lists.get(i)[0]);
        }
        long bestLow = heap.peek()[0], bestHigh = curMax;
        for (;;) {
            long[] top = heap.poll();
            int i = (int) top[1], j = (int) top[2];
            if (j + 1 == lists.get(i).length) break;
            long next = lists.get(i)[j + 1];
            heap.add(new long[] {next, i, j + 1});
            curMax = Math.max(curMax, next);
            if (curMax - heap.peek()[0] < bestHigh - bestLow) {
                bestLow = heap.peek()[0];
                bestHigh = curMax;
            }
        }
        System.out.println(bestLow + " " + bestHigh);`
    },
    solution: { explanation: ['A min-heap holds one front element of each list and a variable holds the largest front value. Repeatedly the smallest front element is replaced by the next element of its list, and the best range is updated with a strict comparison; the loop ends when a list runs out.'], complexity: 'Time O(total * log k), space O(k).' },
    solve(input) {
      const rs = rows(input); const k = Number(rs[0]); const lens = nums(rs[1]); const vals = nums(rs[3]); const lists = []; let pos = 0; for (const l of lens) { lists.push(vals.slice(pos, pos + l)); pos += l; }
      const h = new Heap((p, q) => p[0] < q[0] || (p[0] === q[0] && (p[1] < q[1] || (p[1] === q[1] && p[2] < q[2])))); let curMax = -Infinity;
      for (let i = 0; i < k; i++) { h.push([lists[i][0], i, 0]); curMax = Math.max(curMax, lists[i][0]); }
      let best = [h.peek()[0], curMax];
      for (;;) { const [, i, j] = h.pop(); if (j + 1 === lists[i].length) break; const next = lists[i][j + 1]; h.push([next, i, j + 1]); curMax = Math.max(curMax, next); if (curMax - h.peek()[0] < best[1] - best[0]) best = [h.peek()[0], curMax]; }
      return `${best[0]} ${best[1]}`;
    },
    tests() {
      const g = rng(813); const out = [];
      const text = (lists) => `${lists.length}\n${lists.map((l) => l.length).join(' ')}\n${lists.reduce((s, l) => s + l.length, 0)}\n${lists.flat().join(' ')}\n`;
      out.push(text([[4, 10, 15, 24, 26], [0, 9, 12, 20, 30], [5, 18, 22, 30]]), text([[1, 2, 3], [1, 2, 3], [1, 2, 3]]), text([[5]]), text([[1], [2]]), text([[1, 5], [3]]));
      const brute = (input) => { const rs = rows(input); const k = Number(rs[0]); const lens = nums(rs[1]); const vals = nums(rs[3]); const lists = []; let pos = 0; for (const l of lens) { lists.push(vals.slice(pos, pos + l)); pos += l; } const cand = [...new Set(vals)].sort((a, b) => a - b); let best = null; for (const a of cand) for (const b of cand) { if (b < a) continue; if (lists.every((l) => l.some((x) => a <= x && x <= b))) { if (!best || b - a < best[1] - best[0] || (b - a === best[1] - best[0] && a < best[0])) best = [a, b]; } } return `${best[0]} ${best[1]}`; };
      const make = (k, maxLen, lo, hi) => text(many(k, () => many(randInt(g, 1, maxLen), () => randInt(g, lo, hi)).sort((a, b) => a - b)));
      crossCheck(() => make(randInt(g, 1, 4), 5, -8, 8), (i) => this.solve(i), brute, 300);
      for (const [k, maxLen, lo, hi] of [[3, 6, -20, 20], [5, 10, 0, 100], [20, 20, -1000, 1000], [100, 100, -BIG, BIG], [10, 3000, -BIG, BIG], [3500, 5, -BIG, BIG], [2, 10000, 0, 50], [500, 60, 0, 20]]) {
        let text2 = make(k, maxLen, lo, hi); const total = Number(rows(text2)[2]); if (total > 20000) { text2 = make(k, Math.max(1, Math.floor(maxLen / 2)), lo, hi); } out.push(text2);
      }
      out.push(text([many(10000, (i) => i), many(10000, (i) => i + 5000)]), text(many(3500, (i) => [i, i + 100000])), text(many(20, () => many(1000, () => 7))));
      return out.filter((t) => Number(rows(t)[2]) <= 20000);
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `m` and `n`.', 'Each of the next `m` lines has `n` numbers: the heights of the cells in a row.'],
    constraints: ['1 <= m, n <= 200', '0 <= every height <= 10^9'],
    slug: 'trapping-rain-water-grid',
    title: 'Rain Falls on a Grid of Heights',
    tags: ['heap', 'priority-queue', 'grid', 'dijkstra-like'],
    concept: {
      title: 'Water leaks out over the lowest point of the border: grow inwards from the border, lowest first',
      body: [
        'A grid of heights is like a landscape of square blocks. Rain falls on it, and water collects in the low places, but any water that reaches the **border** of the grid runs off the edge. How much water stays? For the one-dimensional version (a row of bars) two pointers work; in two dimensions the water can leak in any direction and a new idea is needed.',
        'The water level over a cell is decided by the **lowest "wall" around it**: the level at a cell is the smallest possible value, over all roads from the cell to the border, of the **highest cell on the road** (or the cell\'s own height if that is bigger). We can find these levels from the outside in, like Dijkstra\'s algorithm: start with all **border cells** in a **min-heap** keyed by their level (their height). Take the lowest cell from the heap; it is a "wall" of height `h`. Each unvisited neighbour of it can hold water up to the level `h` (the lowest wall that reaches it from outside): if the neighbour is lower than `h`, it holds `h - height` water; its own level is `max(h, height)`, and it goes into the heap.',
        { code: 'heap = border cells as (height, row, col); mark them visited\nwater = 0\nwhile heap:\n    level, i, j = heappop(heap)                    # the lowest wall so far\n    for each neighbour (a, b) not visited:\n        visited[a][b] = True\n        water += max(0, level - h[a][b])           # it is filled up to the wall\n        heappush(heap, (max(level, h[a][b]), a, b))' },
        'Why is it right to process the lowest wall first? Water behind the lowest wall can rise only to that wall\'s height, because that is the first place where it can spill over; processing in increasing order of levels guarantees that when a cell is reached, the level it receives is the smallest possible one. Each cell enters the heap once, so the time is O(m * n * log(m * n)). The total can reach 4 * 10^4 * 10^9, so use 64-bit integers.'
      ]
    },
    statement: ['A grid of `m` rows and `n` columns has a non-negative height in every cell. Rain falls on the whole grid. Water can flow between cells that share a side, and it flows away when it reaches a cell on the border of the grid and the level there allows it. Print the total volume of water that stays on the grid (the sum, over all cells, of the water level minus the height of the cell).'],
    outputFormat: ['Print the volume of trapped water.'],
    examples: [{ input: '3 6\n1 4 3 1 3 2\n3 2 1 3 2 4\n2 3 3 2 3 1\n', note: 'The water level is 3 over the cells with the heights 2 and 1 in the second row (1 + 2 units), and 3 over the cell with the height 2 near the right end of that row (1 unit): 4 in total.' }],
    hints: ['The water that can stay over a cell is decided by the lowest wall on a road from the cell to the border.', 'Put the border cells in a min-heap and take the lowest one each time.', 'A neighbour not yet seen is filled up to the current level; push it with the level max(level, its height).'],
    program: {
      io: ['m:int n:int', 'h:int[m][n]'],
      fast: true,
      includes: ['<queue>', '<functional>', '<utility>'],
      python: r`
        import heapq
        visited = [[False] * n for _ in range(m)]
        heap = []
        for i in range(m):
            for j in range(n):
                if i == 0 or i == m - 1 or j == 0 or j == n - 1:
                    heapq.heappush(heap, (h[i][j], i, j))
                    visited[i][j] = True
        water = 0
        while heap:
            level, i, j = heapq.heappop(heap)
            for a, b in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                if 0 <= a < m and 0 <= b < n and not visited[a][b]:
                    visited[a][b] = True
                    water += max(0, level - h[a][b])
                    heapq.heappush(heap, (max(level, h[a][b]), a, b))
        print(water)`,
      cpp: r`
        typedef pair<long long, pair<int, int>> Cell;
        priority_queue<Cell, vector<Cell>, greater<Cell>> heap;
        vector<vector<char>> visited(m, vector<char>(n, 0));
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (i == 0 || i == m - 1 || j == 0 || j == n - 1) {
                    heap.push({h[i][j], {i, j}});
                    visited[i][j] = 1;
                }
            }
        }
        long long water = 0;
        int di[4] = {1, -1, 0, 0}, dj[4] = {0, 0, 1, -1};
        while (!heap.empty()) {
            Cell top = heap.top();
            heap.pop();
            long long level = top.first;
            for (int d = 0; d < 4; d++) {
                int a = top.second.first + di[d], b = top.second.second + dj[d];
                if (a >= 0 && a < m && b >= 0 && b < n && !visited[a][b]) {
                    visited[a][b] = 1;
                    water += max(0LL, level - h[a][b]);
                    heap.push({max(level, h[a][b]), {a, b}});
                }
            }
        }
        cout << water << "\n";`,
      java: r`
        PriorityQueue<long[]> heap = new PriorityQueue<>((p, q) -> Long.compare(p[0], q[0]));
        boolean[][] visited = new boolean[(int) m][(int) n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (i == 0 || i == m - 1 || j == 0 || j == n - 1) {
                    heap.add(new long[] {h[i][j], i, j});
                    visited[i][j] = true;
                }
            }
        }
        long water = 0;
        int[] di = {1, -1, 0, 0}, dj = {0, 0, 1, -1};
        while (!heap.isEmpty()) {
            long[] top = heap.poll();
            long level = top[0];
            for (int d = 0; d < 4; d++) {
                int a = (int) top[1] + di[d], b = (int) top[2] + dj[d];
                if (a >= 0 && a < m && b >= 0 && b < n && !visited[a][b]) {
                    visited[a][b] = true;
                    water += Math.max(0, level - h[a][b]);
                    heap.add(new long[] {Math.max(level, h[a][b]), a, b});
                }
            }
        }
        System.out.println(water);`
    },
    solution: { explanation: ['A min-heap of the border cells grows inwards: the lowest wall is taken, each unvisited neighbour is filled up to the wall level and pushed with level max(wall, its height). The sum of the added water is the answer.'], complexity: 'Time O(m * n * log(m * n)), space O(m * n).' },
    solve(input) {
      const rs = rows(input); const [m, n] = nums(rs[0]); const h = many(m, (i) => nums(rs[i + 1])); const visited = h.map((row) => row.map(() => false)); const heap = new Heap((p, q) => p[0] < q[0]);
      for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (i === 0 || i === m - 1 || j === 0 || j === n - 1) { heap.push([h[i][j], i, j]); visited[i][j] = true; }
      let water = 0;
      while (heap.size) { const [level, i, j] = heap.pop(); for (const [a, b] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) if (a >= 0 && a < m && b >= 0 && b < n && !visited[a][b]) { visited[a][b] = true; water += Math.max(0, level - h[a][b]); heap.push([Math.max(level, h[a][b]), a, b]); } }
      return String(water);
    },
    tests() {
      const g = rng(814); const out = ['3 6\n1 4 3 1 3 2\n3 2 1 3 2 4\n2 3 3 2 3 1\n', '1 1\n5\n', '3 3\n5 5 5\n5 1 5\n5 5 5\n', '3 3\n5 5 5\n5 1 5\n5 0 5\n'];
      const text = (grid) => `${grid.length} ${grid[0].length}\n${grid.map((row) => row.join(' ')).join('\n')}\n`;
      const relax = (input) => { const rs = rows(input); const [m, n] = nums(rs[0]); const h = many(m, (i) => nums(rs[i + 1])); const level = h.map((row, i) => row.map((v, j) => (i === 0 || j === 0 || i === m - 1 || j === n - 1 ? v : Infinity))); let changed = true; while (changed) { changed = false; for (let i = 1; i < m - 1; i++) for (let j = 1; j < n - 1; j++) { const low = Math.min(level[i + 1][j], level[i - 1][j], level[i][j + 1], level[i][j - 1]); const want = Math.max(h[i][j], low); if (want < level[i][j]) { level[i][j] = want; changed = true; } } } let water = 0; for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) water += level[i][j] - h[i][j]; return String(water); };
      const grid = (m, n, lo, hi) => many(m, () => many(n, () => randInt(g, lo, hi)));
      crossCheck(() => text(grid(randInt(g, 1, 6), randInt(g, 1, 6), 0, 6)), (i) => this.solve(i), relax, 300);
      for (const [m, n, lo, hi] of [[4, 5, 0, 9], [10, 10, 0, 5], [30, 40, 0, 100], [100, 100, 0, 1000], [200, 200, 0, BIG], [200, 200, 0, 2], [1, 200, 0, 50], [200, 1, 0, 50], [2, 150, 0, 9]]) out.push(text(grid(m, n, lo, hi)));
      // a bowl with a rim of height 100 and a random floor, and a spiral wall with a hole
      const bowl = many(200, (i) => many(200, (j) => (i === 0 || j === 0 || i === 199 || j === 199 ? 100 : randInt(g, 0, 60)))); out.push(text(bowl));
      const spiral = many(199, (i) => many(199, (j) => { const ring = Math.min(i, j, 198 - i, 198 - j); return ring % 2 === 0 ? 10 + (ring % 7) : 1; })); out.push(text(spiral));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`, `k` and `w`.', 'The second line has `n` numbers: the profit of each project.', 'The third line has `n` numbers: the capital that each project needs.'],
    constraints: ['1 <= n <= 20000', '0 <= k <= 20000', '0 <= w, every profit, every capital <= 10^9'],
    slug: 'maximize-capital-with-projects',
    title: 'Choose Projects to Grow Your Capital',
    tags: ['heap', 'priority-queue', 'greedy', 'two-heaps'],
    concept: {
      title: 'Among the projects you can afford, always take the most profitable one',
      body: [
        'You start with the capital `w` and may finish at most `k` projects, one after the other. Project `i` can be started only if your **current capital is at least `capital[i]`**; when it is finished, your capital grows by `profit[i]` (the capital you needed is not spent). Maximize the capital at the end.',
        'Greedy choice: at each step, among all projects you **can afford now**, take the one with the **largest profit**. Why is it safe? Every project taken adds its profit and can only make **more** projects affordable, so taking the largest profit gives the largest capital after this step and also the largest set of affordable projects among all options that take one project. Capital never decreases, so a project that is affordable now stays affordable.',
        'To do it quickly, sort the projects by the capital they need. A pointer walks through the sorted list and **pushes the profits of all projects that have become affordable** into a **max-heap**; the top of the heap is the best choice.',
        { code: 'order = sorted(range(n), key=lambda i: capital[i])\nheap, j = [], 0\nfor _ in range(k):\n    while j < n and capital[order[j]] <= w:     # newly affordable projects\n        heappush(heap, -profit[order[j]])\n        j += 1\n    if not heap:\n        break                                   # nothing can be afforded: stop\n    w += -heappop(heap)                         # take the most profitable one' },
        'The sort costs O(n log n), and every project enters and leaves the heap at most once. The final capital can reach about 2 * 10^13, so use 64-bit integers.'
      ]
    },
    statement: ['There are `n` projects. Project `i` needs a capital of at least `capital[i]` to start, and gives a profit of `profit[i]` when finished (the capital needed is not used up). You start with the capital `w` and can finish at most `k` projects, one at a time. Print the largest capital you can have at the end.'],
    outputFormat: ['Print the maximum final capital.'],
    examples: [{ input: '3 2 0\n1 2 3\n0 1 1\n', note: 'With the capital 0 only project 1 (profit 1) can be taken; then the capital is 1, and the project with the profit 3 can be taken: 0 + 1 + 3 = 4.' }],
    hints: ['Sort the projects by the capital they need.', 'Push the profits of all projects that are affordable into a max-heap.', 'Take the largest profit, add it to the capital, and repeat up to k times (stop when the heap is empty).'],
    program: {
      io: ['n:int k:int w:int', 'profit:int[n]', 'cap:int[n]'],
      fast: true,
      includes: ['<queue>', '<algorithm>', '<numeric>'],
      python: r`
        import heapq
        order = sorted(range(n), key=lambda i: cap[i])
        heap = []
        j = 0
        for _ in range(k):
            while j < n and cap[order[j]] <= w:
                heapq.heappush(heap, -profit[order[j]])
                j += 1
            if not heap:
                break
            w += -heapq.heappop(heap)
        print(w)`,
      cpp: r`
        vector<int> order(n);
        for (int i = 0; i < n; i++) order[i] = i;
        sort(order.begin(), order.end(), [&](int x, int y) { return cap[x] < cap[y]; });
        priority_queue<long long> heap;
        int j = 0;
        for (long long step = 0; step < k; step++) {
            while (j < n && cap[order[j]] <= w) {
                heap.push(profit[order[j]]);
                j++;
            }
            if (heap.empty()) break;
            w += heap.top();
            heap.pop();
        }
        cout << w << "\n";`,
      java: r`
        int count = (int) n;
        Integer[] order = new Integer[count];
        for (int i = 0; i < count; i++) order[i] = i;
        Arrays.sort(order, (x, y) -> Long.compare(cap[x], cap[y]));
        PriorityQueue<Long> heap = new PriorityQueue<>(Collections.reverseOrder());
        int j = 0;
        for (long step = 0; step < k; step++) {
            while (j < count && cap[order[j]] <= w) {
                heap.add(profit[order[j]]);
                j++;
            }
            if (heap.isEmpty()) break;
            w += heap.poll();
        }
        System.out.println(w);`
    },
    solution: { explanation: ['The projects are sorted by the capital they need; the profits of the affordable ones are pushed into a max-heap, and the largest profit is taken at each of at most k steps.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, k, w0] = nums(rs[0]); const profit = nums(rs[1]), cap = nums(rs[2]); const order = many(n, (i) => i).sort((a, b) => cap[a] - cap[b]); const heap = new Heap((p, q) => p > q); let w = w0, j = 0;
      for (let step = 0; step < k; step++) { while (j < n && cap[order[j]] <= w) heap.push(profit[order[j++]]); if (!heap.size) break; w += heap.pop(); }
      return String(w);
    },
    tests() {
      const g = rng(815); const out = ['3 2 0\n1 2 3\n0 1 1\n', '1 1 0\n5\n0\n', '1 1 0\n5\n1\n', '2 0 7\n1 2\n0 0\n'];
      const text = (profit, cap, k, w) => `${profit.length} ${k} ${w}\n${profit.join(' ')}\n${cap.join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, k, w0] = nums(rs[0]); const profit = nums(rs[1]), cap = nums(rs[2]); const used = new Array(n).fill(false); let w = w0; for (let step = 0; step < k; step++) { let best = -1; for (let i = 0; i < n; i++) if (!used[i] && cap[i] <= w && (best < 0 || profit[i] > profit[best])) best = i; if (best < 0) break; used[best] = true; w += profit[best]; } return String(w); };
      const make = (n, k, w, pHi, cHi) => text(many(n, () => randInt(g, 0, pHi)), many(n, () => randInt(g, 0, cHi)), k, w);
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 0, 8), randInt(g, 0, 5), 9, 20), (i) => this.solve(i), brute, 300);
      for (const [n, k, w, p, c] of [[8, 3, 0, 10, 10], [50, 10, 5, 100, 300], [500, 100, 0, 1000, 5000], [5000, 2000, 10, 100000, 1000000], [20000, 20000, 0, BIG, BIG], [20000, 100, BIG, BIG, BIG], [20000, 5000, 1, 5, 50000], [20000, 20000, 3, 1000, 20000]]) out.push(make(n, k, w, p, c));
      out.push(text(many(20000, (i) => i + 1), many(20000, (i) => (i * (i + 1)) / 2), 20000, 0), text(many(20000, () => BIG), many(20000, () => 0), 20000, BIG));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` numbers: the speed of each engineer.', 'The third line has `n` numbers: the efficiency of each engineer.'],
    constraints: ['1 <= k <= n <= 20000', '1 <= every speed <= 100000', '1 <= every efficiency <= 10^9'],
    slug: 'maximum-team-performance',
    title: 'The Best Team of at Most k Engineers',
    tags: ['heap', 'priority-queue', 'greedy', 'sorting'],
    concept: {
      title: 'Fix the weakest member by sorting; keep the k fastest of the stronger ones in a min-heap',
      body: [
        'Engineer `i` has a speed and an efficiency. The *performance* of a team is **(the sum of the speeds) times (the smallest efficiency in the team)**. Choose a team of **at most `k`** engineers with the largest performance.',
        'Two quantities pull in different directions, so fix one. Sort the engineers by **efficiency, from high to low**. When the engineers are processed in this order, the engineer being processed has the **smallest efficiency among all engineers seen so far**, so if he is in the team, the minimum efficiency of the team is his. Now we only have to choose the best other members from those seen so far: the ones with the **largest speeds**, at most `k` in total.',
        'A **min-heap of speeds** keeps the best (at most) `k` speeds seen so far: push the new speed and add it to a running sum; when the heap holds more than `k` speeds, remove the smallest one and subtract it from the sum. After each engineer, the candidate performance is `sum * (his efficiency)`.',
        { code: 'team = sorted(zip(eff, speed), reverse=True)     # high efficiency first\nheap, total, best = [], 0, 0\nfor e, s in team:\n    heappush(heap, s)\n    total += s\n    if len(heap) > k:\n        total -= heappop(heap)                  # drop the slowest\n    best = max(best, total * e)                 # e is the smallest efficiency so far' },
        'Is the candidate valid when the current engineer was himself dropped as the slowest? Then the real team has a larger minimum efficiency and a sum at least as large, so the true value is even better and was or will be seen at another step; the maximum is not harmed. The largest result is about 2 * 10^9 * 10^9 = 2 * 10^18, which fits in a signed 64-bit integer.'
      ]
    },
    statement: ['`n` engineers have a speed and an efficiency. The performance of a team is the sum of the speeds of its members multiplied by the smallest efficiency among its members. Choose a team of at least one and at most `k` engineers. Print the largest possible performance.'],
    outputFormat: ['Print the maximum performance.'],
    examples: [{ input: '6 2\n2 10 3 1 5 8\n5 4 3 9 7 2\n', note: 'The engineers with the speeds 10 and 5 and efficiencies 4 and 7 form a team: (10 + 5) * min(4, 7) = 60.' }],
    hints: ['Sort the engineers by efficiency from high to low: the current one then has the smallest efficiency so far.', 'Keep the k largest speeds seen so far in a min-heap and their sum.', 'After each engineer, the candidate is sum * his efficiency; take the maximum over all.'],
    program: {
      io: ['n:int k:int', 'speed:int[n]', 'eff:int[n]'],
      fast: true,
      includes: ['<queue>', '<algorithm>', '<functional>', '<utility>'],
      python: r`
        import heapq
        team = sorted(zip(eff, speed), reverse=True)
        heap = []
        total = 0
        best = 0
        for e, s in team:
            heapq.heappush(heap, s)
            total += s
            if len(heap) > k:
                total -= heapq.heappop(heap)
            best = max(best, total * e)
        print(best)`,
      cpp: r`
        vector<pair<long long, long long>> team;
        for (int i = 0; i < n; i++) team.push_back({eff[i], speed[i]});
        sort(team.begin(), team.end(), greater<pair<long long, long long>>());
        priority_queue<long long, vector<long long>, greater<long long>> heap;
        long long total = 0, best = 0;
        for (const auto& member : team) {
            heap.push(member.second);
            total += member.second;
            if ((long long)heap.size() > k) {
                total -= heap.top();
                heap.pop();
            }
            best = max(best, total * member.first);
        }
        cout << best << "\n";`,
      java: r`
        int count = (int) n;
        long[][] team = new long[count][];
        for (int i = 0; i < count; i++) team[i] = new long[] {eff[i], speed[i]};
        Arrays.sort(team, (p, q) -> p[0] != q[0] ? Long.compare(q[0], p[0]) : Long.compare(q[1], p[1]));
        PriorityQueue<Long> heap = new PriorityQueue<>();
        long total = 0, best = 0;
        for (long[] member : team) {
            heap.add(member[1]);
            total += member[1];
            if (heap.size() > k) total -= heap.poll();
            best = Math.max(best, total * member[0]);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Engineers are processed by decreasing efficiency, so the current one has the smallest efficiency so far. A min-heap keeps the k largest speeds and their sum; after each engineer, sum * efficiency is a candidate, and the largest candidate is the answer.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, k] = nums(rs[0]); const speed = nums(rs[1]), eff = nums(rs[2]); const team = many(n, (i) => [eff[i], speed[i]]).sort((a, b) => b[0] - a[0] || b[1] - a[1]); const heap = new Heap((p, q) => p < q); let total = 0n, best = 0n;
      for (const [e, s] of team) { heap.push(s); total += BigInt(s); if (heap.size > k) total -= BigInt(heap.pop()); const cand = total * BigInt(e); if (cand > best) best = cand; }
      return String(best);
    },
    tests() {
      const g = rng(816); const out = ['6 2\n2 10 3 1 5 8\n5 4 3 9 7 2\n', '1 1\n7\n9\n', '3 3\n1 1 1\n5 5 5\n', '3 1\n1 100 5\n100 1 5\n'];
      const text = (speed, eff, k) => `${speed.length} ${k}\n${speed.join(' ')}\n${eff.join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, k] = nums(rs[0]); const speed = nums(rs[1]), eff = nums(rs[2]); let best = 0n; for (let mask = 1; mask < (1 << n); mask++) { let count = 0, sum = 0n, low = Infinity; for (let i = 0; i < n; i++) if (mask >> i & 1) { count++; sum += BigInt(speed[i]); low = Math.min(low, eff[i]); } if (count <= k) { const v = sum * BigInt(low); if (v > best) best = v; } } return String(best); };
      const make = (n, k, sHi, eHi) => text(many(n, () => randInt(g, 1, sHi)), many(n, () => randInt(g, 1, eHi)), k);
      crossCheck(() => { const n = randInt(g, 1, 9); return make(n, randInt(g, 1, n), 9, 9); }, (i) => this.solve(i), brute, 300);
      for (const [n, k, s, e] of [[8, 3, 20, 20], [50, 10, 1000, 1000], [500, 100, 100000, BIG], [5000, 1, 100000, BIG], [5000, 5000, 100000, BIG], [20000, 10000, 100000, BIG], [20000, 20, 100000, BIG], [20000, 20000, 100000, BIG], [20000, 777, 5, 5]]) out.push(make(n, k, s, e));
      out.push(text(many(20000, () => 100000), many(20000, () => BIG), 20000), text(many(20000, (i) => 100000 - (i % 1000)), many(20000, (i) => BIG - i), 5000));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`, the number of courses.', 'Each of the next `n` lines has two numbers: the `duration` of a course and its `deadline`.'],
    constraints: ['1 <= n <= 20000', '1 <= duration, deadline <= 10^9'],
    slug: 'schedule-the-most-courses',
    title: 'Take As Many Courses As Possible Before Their Deadlines',
    tags: ['heap', 'priority-queue', 'greedy', 'scheduling'],
    concept: {
      title: 'Go by deadline; when time runs out, throw away the longest course taken so far',
      body: [
        'A course takes `duration` days and must be **finished** by its `deadline` (on or before that day). Courses are taken one after another, starting on day 1, with no overlap. What is the **largest number of courses** that can be completed?',
        'Process the courses in order of **deadline**, and keep the courses taken so far. Add the new course (its duration goes to the total time). If the total time now exceeds the new deadline, the schedule is broken: drop one of the courses taken, and the best one to drop is the **longest** one, because it frees the most time and costs only one course (the count goes back to what it was). A **max-heap of durations** finds the longest course.',
        { code: 'courses.sort(key=lambda c: c[1])        # by deadline\nheap, time = [], 0\nfor duration, deadline in courses:\n    time += duration\n    heappush(heap, -duration)           # max-heap of durations\n    if time > deadline:\n        time += heappop(heap)           # drop the longest course (its duration is negative here)\nprint(len(heap))' },
        'Why does it work? After each step the heap holds the **largest set** of courses (among the first ones by deadline) that can be finished, and among such sets the one with the **smallest total time**; a smaller total time is only better for the courses that come later. The dropped course may be the new course itself, which is fine. The total time can reach 2 * 10^13, so use 64-bit integers.'
      ]
    },
    statement: ['There are `n` courses. Course `i` takes `duration` days and must be finished on or before the day `deadline`. You take the courses one after another, starting on day 1, with no gaps needed and no overlap (a course that starts after `t` days of work ends on the day `t + duration`). Print the largest number of courses that you can take.'],
    outputFormat: ['Print the maximum number of courses.'],
    examples: [{ input: '4\n100 200\n200 1300\n1000 1250\n2000 3200\n', note: 'Take the courses with the durations 100, 1000 and 200 in the order of their deadlines (200, 1250, 1300): they end on the days 100, 1100 and 1300. The fourth course (2000 days) does not fit: 3.' }],
    hints: ['Sort the courses by deadline and add them one by one.', 'Keep the durations of the taken courses in a max-heap and the total time.', 'If the total time exceeds the current deadline, remove the longest course from the heap and subtract its duration.'],
    program: {
      io: ['n:int', 'c:int[n][2]'],
      fast: true,
      includes: ['<queue>', '<algorithm>'],
      python: r`
        import heapq
        c.sort(key=lambda course: course[1])
        heap = []
        time = 0
        for duration, deadline in c:
            time += duration
            heapq.heappush(heap, -duration)
            if time > deadline:
                time += heapq.heappop(heap)
        print(len(heap))`,
      cpp: r`
        sort(c.begin(), c.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[1] < y[1]; });
        priority_queue<long long> heap;
        long long days = 0;
        for (const vector<long long>& course : c) {
            days += course[0];
            heap.push(course[0]);
            if (days > course[1]) {
                days -= heap.top();
                heap.pop();
            }
        }
        cout << heap.size() << "\n";`,
      java: r`
        Arrays.sort(c, (x, y) -> Long.compare(x[1], y[1]));
        PriorityQueue<Long> heap = new PriorityQueue<>(Collections.reverseOrder());
        long days = 0;
        for (long[] course : c) {
            days += course[0];
            heap.add(course[0]);
            if (days > course[1]) days -= heap.poll();
        }
        System.out.println(heap.size());`
    },
    solution: { explanation: ['Courses are added in order of deadline; a max-heap holds the durations of the courses taken. When the total time exceeds the current deadline, the longest course is dropped. The heap size is the answer.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const c = many(n, (i) => nums(rs[i + 1])).sort((a, b) => a[1] - b[1]); const heap = new Heap((p, q) => p > q); let time = 0;
      for (const [d, dl] of c) { time += d; heap.push(d); if (time > dl) time -= heap.pop(); }
      return String(heap.size);
    },
    tests() {
      const g = rng(817); const out = ['4\n100 200\n200 1300\n1000 1250\n2000 3200\n', '1\n3 2\n', '1\n2 2\n', '3\n1 2\n2 3\n3 4\n'];
      const text = (c) => `${c.length}\n${c.map((x) => x.join(' ')).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const c = many(n, (i) => nums(rs[i + 1])).sort((a, b) => a[1] - b[1]); const dp = new Array(n + 1).fill(Infinity); dp[0] = 0; for (const [d, dl] of c) for (let j = n; j >= 1; j--) if (dp[j - 1] + d <= dl && dp[j - 1] + d < dp[j]) dp[j] = dp[j - 1] + d; let best = 0; for (let j = 0; j <= n; j++) if (dp[j] < Infinity) best = j; return String(best); };
      const make = (n, dHi, dlHi) => text(many(n, () => [randInt(g, 1, dHi), randInt(g, 1, dlHi)]));
      crossCheck(() => make(randInt(g, 1, 12), 8, 30), (i) => this.solve(i), brute, 300);
      for (const [n, d, dl] of [[8, 10, 30], [50, 100, 1000], [500, 1000, 100000], [5000, 1000, 2000000], [20000, BIG, BIG], [20000, 100, 1000000], [20000, 50, 50000], [20000, 5, 100000]]) out.push(make(n, d, dl));
      out.push(text(many(20000, (i) => [1, i + 1])), text(many(20000, (i) => [i + 1, 20000 * (i + 1)])), text(many(20000, () => [BIG, BIG])));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`.', 'The second line has `n` numbers.', 'Each of the next `q` lines has two numbers `x` and `m`: a query.'],
    constraints: ['1 <= n, q <= 20000', '0 <= every number, x, m <= 10^9'],
    slug: 'max-xor-with-a-limit',
    title: 'The Largest XOR With Numbers Up to a Limit',
    tags: ['trie', 'bit-manipulation', 'offline-queries', 'sorting'],
    concept: {
      title: 'A binary trie finds the best XOR partner greedily; sorting queries lets one trie serve all limits',
      body: [
        'The *XOR* of two numbers is large when their bits **differ** at the high positions. So to maximize `x XOR a` over a set of numbers `a`, go through the bits of `x` from the highest to the lowest and, at each bit, prefer a number whose bit is **different** from the bit of `x`. A **binary trie** (a trie over the bits of the numbers, 30 bits each) makes this greedy walk possible: each node has a child for bit 0 and a child for bit 1, and a number is a root-to-leaf road of 30 edges. At each level, step to the child with the opposite bit if it exists, otherwise to the other child.',
        { code: 'def best(x):                                  # the maximum of x XOR a over the numbers in the trie\n    node, result = 0, 0\n    for b in range(29, -1, -1):\n        bit = x >> b & 1\n        want = child[1 - bit][node]               # the opposite bit makes the XOR bit equal to 1\n        if want:\n            result |= 1 << b\n            node = want\n        else:\n            node = child[bit][node]\n    return result' },
        'Now each query `(x, m)` allows only the numbers **not larger than `m`**. Building a trie for each query would be far too slow. The trick is to answer the queries **offline**, in a convenient order: sort the numbers, sort the queries by `m`, and walk through the queries with a pointer into the sorted numbers, inserting each number into one shared trie **when it becomes allowed** (`a <= m`). When a query is answered, the trie contains exactly the allowed numbers. Because the answers must be printed in the original order, keep each query\'s index. If no number is allowed, the answer is -1.',
        'The trie has at most `30 * n` nodes (here 600000), stored in two arrays instead of node objects. The time is O((n + q) * 30) plus the sorting.'
      ]
    },
    statement: ['`n` numbers and `q` queries are given. A query `(x, m)` asks for the largest value of `x XOR a` over the numbers `a` of the list with `a <= m`, or -1 if no number is at most `m`. Print the answer to every query, in the order of the queries.'],
    outputFormat: ['`q` lines: the answer to every query.'],
    examples: [{ input: '4 3\n0 1 2 3\n3 1\n1 3\n5 6\n', note: 'Query (3, 1): the allowed numbers are 0 and 1, and 3 XOR 0 = 3 is the largest. Query (1, 3): 1 XOR 2 = 3. Query (5, 6): 5 XOR 2 = 7.' }],
    hints: ['Build a binary trie of the numbers; at each bit prefer the child whose bit differs from the bit of x.', 'Sort the numbers and sort the queries by the limit m, and keep the original index of each query.', 'Insert every number into the trie when it becomes at most m; print -1 when nothing has been inserted.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'qs:int[q][2]'],
      fast: true,
      includes: ['<algorithm>', '<numeric>'],
      python: r`
        a.sort()
        order = sorted(range(q), key=lambda i: qs[i][1])
        child0 = [0]
        child1 = [0]

        def insert(x):
            node = 0
            for b in range(29, -1, -1):
                child = child1 if x >> b & 1 else child0
                if child[node] == 0:
                    child0.append(0)
                    child1.append(0)
                    child[node] = len(child0) - 1
                node = child[node]

        def best(x):
            node = 0
            result = 0
            for b in range(29, -1, -1):
                bit = x >> b & 1
                want = child0 if bit else child1
                if want[node]:
                    result |= 1 << b
                    node = want[node]
                else:
                    node = (child1 if bit else child0)[node]
            return result

        answers = [-1] * q
        j = 0
        for i in order:
            x, m = qs[i]
            while j < n and a[j] <= m:
                insert(a[j])
                j += 1
            if j > 0:
                answers[i] = best(x)
        print("\n".join(map(str, answers)))`,
      cpp: r`
        sort(a.begin(), a.end());
        vector<int> order(q);
        for (int i = 0; i < q; i++) order[i] = i;
        sort(order.begin(), order.end(), [&](int x, int y) { return qs[x][1] < qs[y][1]; });
        vector<int> child0(1, 0), child1(1, 0);
        auto insertNumber = [&](long long x) {
            int node = 0;
            for (int b = 29; b >= 0; b--) {
                vector<int>& child = ((x >> b) & 1) ? child1 : child0;
                if (child[node] == 0) {
                    child0.push_back(0);
                    child1.push_back(0);
                    child[node] = (int)child0.size() - 1;
                }
                node = child[node];
            }
        };
        auto bestXor = [&](long long x) {
            int node = 0;
            long long result = 0;
            for (int b = 29; b >= 0; b--) {
                int bit = (int)((x >> b) & 1);
                vector<int>& want = bit ? child0 : child1;
                if (want[node] != 0) {
                    result |= 1LL << b;
                    node = want[node];
                } else {
                    node = (bit ? child1 : child0)[node];
                }
            }
            return result;
        };
        vector<long long> answers(q, -1);
        int j = 0;
        for (int i : order) {
            while (j < n && a[j] <= qs[i][1]) {
                insertNumber(a[j]);
                j++;
            }
            if (j > 0) answers[i] = bestXor(qs[i][0]);
        }
        for (long long value : answers) cout << value << "\n";`,
      java: r`
        Arrays.sort(a);
        int count = (int) n, queries = (int) q;
        Integer[] order = new Integer[queries];
        for (int i = 0; i < queries; i++) order[i] = i;
        Arrays.sort(order, (x, y) -> Long.compare(qs[x][1], qs[y][1]));
        int[] child0 = new int[count * 30 + 2];
        int[] child1 = new int[count * 30 + 2];
        int nodes = 1;
        long[] answers = new long[queries];
        Arrays.fill(answers, -1);
        int j = 0;
        for (int i : order) {
            while (j < count && a[j] <= qs[i][1]) {
                int node = 0;
                for (int b = 29; b >= 0; b--) {
                    int[] child = ((a[j] >> b) & 1) != 0 ? child1 : child0;
                    if (child[node] == 0) child[node] = nodes++;
                    node = child[node];
                }
                j++;
            }
            if (j > 0) {
                long x = qs[i][0];
                int node = 0;
                long result = 0;
                for (int b = 29; b >= 0; b--) {
                    int bit = (int) ((x >> b) & 1);
                    int[] want = bit != 0 ? child0 : child1;
                    if (want[node] != 0) {
                        result |= 1L << b;
                        node = want[node];
                    } else {
                        node = (bit != 0 ? child1 : child0)[node];
                    }
                }
                answers[i] = result;
            }
        }
        StringBuilder out = new StringBuilder();
        for (long value : answers) out.append(value).append("\n");
        System.out.print(out);`
    },
    solution: { explanation: ['The numbers and the queries (by limit) are sorted. A binary trie of 30 bits grows as the numbers up to the limit are inserted, and each query walks the trie preferring the opposite bit at every level. Answers are stored by the original query index; -1 when no number is allowed.'], complexity: 'Time O((n + q) * 30 + n log n + q log q), space O(30 * n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]).sort((x, y) => x - y); const qs = many(q, (i) => nums(rs[i + 2]));
      const order = many(q, (i) => i).sort((x, y) => qs[x][1] - qs[y][1]); const c0 = [0], c1 = [0]; const answers = new Array(q).fill(-1); let j = 0;
      for (const i of order) {
        while (j < n && a[j] <= qs[i][1]) { let node = 0; for (let b = 29; b >= 0; b--) { const c = (a[j] >> b) & 1 ? c1 : c0; if (!c[node]) { c0.push(0); c1.push(0); c[node] = c0.length - 1; } node = c[node]; } j++; }
        if (j > 0) { let node = 0, result = 0; const x = qs[i][0]; for (let b = 29; b >= 0; b--) { const bit = (x >> b) & 1; const want = bit ? c0 : c1; if (want[node]) { result += 2 ** b; node = want[node]; } else node = (bit ? c1 : c0)[node]; } answers[i] = result; }
      }
      return answers.join('\n');
    },
    tests() {
      const g = rng(818); const out = ['4 3\n0 1 2 3\n3 1\n1 3\n5 6\n', '1 2\n5\n5 4\n5 5\n', '2 1\n0 0\n7 0\n'];
      const text = (a, qs) => `${a.length} ${qs.length}\n${a.join(' ')}\n${qs.map((x) => x.join(' ')).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); return many(q, (i) => { const [x, m] = nums(rs[i + 2]); let best = -1; for (const v of a) if (v <= m) best = Math.max(best, v ^ x); return best; }).join('\n'); };
      const make = (n, q, hi) => text(many(n, () => randInt(g, 0, hi)), many(q, () => [randInt(g, 0, hi), randInt(g, 0, hi)]));
      crossCheck(() => make(randInt(g, 1, 8), randInt(g, 1, 8), 15), (i) => this.solve(i), brute, 300);
      for (const [n, q, hi] of [[6, 6, 31], [30, 30, 1000], [300, 300, 100000], [3000, 3000, BIG], [20000, 20000, BIG], [20000, 20000, 255], [20000, 20000, 1000000], [1, 20000, BIG], [20000, 1, BIG]]) out.push(make(n, q, hi));
      out.push(text(many(20000, (i) => i * 50000), many(20000, (i) => [BIG - i, i * 50000])), text(many(20000, () => 0), many(20000, (i) => [i, i % 3])));
      return out;
    }
  }
];
