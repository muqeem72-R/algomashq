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
const BIG = 1000000000;
const medium = { difficulty: 'medium' };
const list = (a) => `${a.length}\n${a.join(' ')}\n`;
const withK = (a, k) => `${a.length} ${k}\n${a.join(' ')}\n`;
const arrays = (g, lo, hi) => [[randInt(g, lo, hi)], many(2, () => randInt(g, lo, hi)), many(9, () => randInt(g, lo, hi)), many(60, () => randInt(g, lo, hi)), many(1000, () => randInt(g, lo, hi)), many(20000, () => randInt(g, lo, hi))];

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` numbers: the numbers of the stream, in the order in which they arrive.'],
    constraints: ['1 <= k <= n <= 20000', '-10^9 <= every number <= 10^9'],
    slug: 'kth-largest-in-stream',
    title: 'The k-th Largest So Far',
    tags: ['heap', 'priority-queue', 'design'],
    concept: {
      title: 'A min-heap of size k keeps exactly the k largest numbers',
      body: [
        'A **priority queue** gives the element with the **highest priority** first; a *heap* is the usual way to build one, with `push` and `pop` in O(log n) and a look at the top in O(1). Python has `heapq` (a **min**-heap on a list), C++ has `priority_queue` (a **max**-heap by default), and Java has `PriorityQueue` (a **min**-heap by default). For the opposite order, Python negates the numbers, C++ uses `greater<>` as the third template argument, and Java gives `Collections.reverseOrder()`.',
        'To know the **k-th largest** number of a growing stream, keep only the `k` largest numbers seen so far in a **min-heap**. The smallest of these `k` numbers (the top of the heap) is exactly the k-th largest. When a new number arrives, push it; if the heap now holds `k + 1` numbers, remove the smallest one, because it can never be among the `k` largest again.',
        { code: 'import heapq\nheap = []\nfor x in stream:\n    heapq.heappush(heap, x)\n    if len(heap) > k:\n        heapq.heappop(heap)       # the smallest of k + 1 numbers is not needed\n    if len(heap) == k:\n        print(heap[0])            # the k-th largest so far' },
        'Every number costs O(log k), and the memory is O(k) instead of the whole stream. Sorting after each arrival would cost O(n log n) per step.'
      ]
    },
    statement: ['Numbers arrive one by one. After each arrival, if at least `k` numbers have arrived, print the `k`-th largest of all numbers so far (equal numbers count separately: in 5 5 3 the 2nd largest is 5). Do not print anything while fewer than `k` numbers have arrived.'],
    outputFormat: ['`n - k + 1` lines, one for every arrival from the `k`-th on.'],
    examples: [{ input: '6 3\n4 5 8 2 3 10\n', note: 'After 4 5 8 the 3rd largest is 4; after 2 and after 3 it is still 4; after 10 the numbers 10 8 5 are the largest three, so it is 5.' }],
    hints: ['Keep a min-heap that holds at most k numbers.', 'After pushing a number, if the heap has more than k numbers, pop the smallest.', 'When the heap has exactly k numbers, its top is the k-th largest.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<queue>', '<functional>'],
      python: r`
        import heapq
        heap = []
        out = []
        for x in a:
            heapq.heappush(heap, x)
            if len(heap) > k:
                heapq.heappop(heap)
            if len(heap) == k:
                out.append(heap[0])
        print("\n".join(map(str, out)))`,
      cpp: r`
        priority_queue<long long, vector<long long>, greater<long long>> heap;
        for (long long x : a) {
            heap.push(x);
            if ((long long)heap.size() > k) heap.pop();
            if ((long long)heap.size() == k) cout << heap.top() << "\n";
        }`,
      java: r`
        PriorityQueue<Long> heap = new PriorityQueue<>();
        StringBuilder out = new StringBuilder();
        for (long x : a) {
            heap.add(x);
            if (heap.size() > k) heap.poll();
            if (heap.size() == k) out.append(heap.peek()).append("\n");
        }
        System.out.print(out);`
    },
    solution: { explanation: ['A min-heap holds the k largest numbers seen so far; its top is the k-th largest. A new number is pushed, and the smallest is removed when the heap grows beyond k.'], complexity: 'Time O(n log k), space O(k).' },
    solve(input) {
      const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); const s = []; const out = [];
      for (const x of a) { let lo = 0, hi = s.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (s[mid] < x) lo = mid + 1; else hi = mid; } s.splice(lo, 0, x); if (s.length >= k) out.push(s[s.length - k]); }
      return out.join('\n');
    },
    tests() {
      const g = rng(771); const out = ['6 3\n4 5 8 2 3 10\n', '1 1\n7\n', '3 2\n5 5 3\n'];
      for (const a of arrays(g, -BIG, BIG).slice(1)) for (const k of [1, a.length, Math.max(1, Math.floor(a.length / 3))]) out.push(withK(a, k));
      for (const a of [many(5000, (i) => i), many(5000, (i) => 5000 - i), many(5000, () => 4), arrays(g, 0, 3)[5]]) for (const k of [1, 17, 2500]) out.push(withK(a, k));
      out.push(withK(arrays(g, -BIG, BIG)[5], 10000), withK(arrays(g, -BIG, BIG)[5], 100));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`.', 'The second line has `n` numbers: the weights of the stones.'],
    constraints: ['1 <= n <= 20000', '1 <= every weight <= 10^9'],
    slug: 'last-stone-weight',
    title: 'Smash the Two Heaviest Stones',
    tags: ['heap', 'priority-queue', 'simulation'],
    concept: {
      title: 'A max-heap answers "which is the biggest now?" again and again',
      body: [
        'Some processes repeat the same step: *take the largest element, do something, and put a new element back*. After every step the largest element can be a different one, so sorting once is not enough, and sorting after each step costs O(n log n) every time. A **max-heap** keeps the largest element on top, and both taking it and inserting a new element cost only O(log n).',
        'Here the step is: take the two heaviest stones; if their weights are equal, both are destroyed; otherwise the lighter one is destroyed and the heavier one loses the weight of the lighter one (the stone `x - y` goes back into the heap).',
        { code: 'import heapq\nheap = [-x for x in stones]           # heapq is a min-heap: negate to get a max-heap\nheapq.heapify(heap)\nwhile len(heap) > 1:\n    first = -heapq.heappop(heap)\n    second = -heapq.heappop(heap)\n    if first != second:\n        heapq.heappush(heap, -(first - second))\nprint(-heap[0] if heap else 0)' },
        'There are at most `n - 1` steps (each step removes at least one stone), so the whole simulation takes O(n log n).'
      ]
    },
    statement: ['There are `n` stones with the given weights. In every step take the two heaviest stones with weights `x >= y`. If `x == y` both stones are destroyed. Otherwise the stone with weight `y` is destroyed and the other one gets the weight `x - y`. Repeat until at most one stone is left. Print the weight of the last stone, or 0 if no stone is left.'],
    outputFormat: ['Print the weight of the last stone, or 0.'],
    examples: [{ input: '6\n2 7 4 1 8 1\n', note: '8 and 7 become 1; 4 and 2 become 2; 2 and 1 become 1; 1 and 1 are both destroyed; one stone of weight 1 is left.' }],
    hints: ['After each step the heaviest stones may be different ones: use a max-heap.', 'Take two stones from the heap; if their weights differ, put the difference back.', 'When fewer than two stones remain, print the remaining weight or 0.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<queue>'],
      python: r`
        import heapq
        heap = [-x for x in a]
        heapq.heapify(heap)
        while len(heap) > 1:
            first = -heapq.heappop(heap)
            second = -heapq.heappop(heap)
            if first != second:
                heapq.heappush(heap, -(first - second))
        print(-heap[0] if heap else 0)`,
      cpp: r`
        priority_queue<long long> heap(a.begin(), a.end());
        while (heap.size() > 1) {
            long long first = heap.top();
            heap.pop();
            long long second = heap.top();
            heap.pop();
            if (first != second) heap.push(first - second);
        }
        cout << (heap.empty() ? 0 : heap.top()) << "\n";`,
      java: r`
        PriorityQueue<Long> heap = new PriorityQueue<>(Collections.reverseOrder());
        for (long x : a) heap.add(x);
        while (heap.size() > 1) {
            long first = heap.poll();
            long second = heap.poll();
            if (first != second) heap.add(first - second);
        }
        System.out.println(heap.isEmpty() ? 0 : heap.peek());`
    },
    solution: { explanation: ['A max-heap gives the two heaviest stones in each step; if their weights differ, the difference is pushed back. The loop ends when at most one stone remains.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const a = nums(rows(input)[1]); const h = new Heap((p, q) => p > q); for (const x of a) h.push(x);
      while (h.size > 1) { const first = h.pop(), second = h.pop(); if (first !== second) h.push(first - second); }
      return String(h.size ? h.peek() : 0);
    },
    tests() {
      const g = rng(772); const out = ['6\n2 7 4 1 8 1\n', '1\n5\n', '2\n3 3\n', '3\n1 1 1\n'];
      const brute = (input) => { let a = nums(rows(input)[1]); while (a.length > 1) { a.sort((p, q) => q - p); const d = a[0] - a[1]; a = a.slice(2); if (d) a.push(d); } return String(a.length ? a[0] : 0); };
      crossCheck(() => list(many(randInt(g, 1, 12), () => randInt(g, 1, 20))), (i) => this.solve(i), brute);
      for (const a of arrays(g, 1, BIG).slice(1)) out.push(list(a));
      for (const a of [arrays(g, 1, 5)[5], arrays(g, 1, 100)[5], many(20000, () => 1), many(20000, (i) => (i < 10000 ? 1000000000 : 1)), many(20000, (i) => i + 1), many(2, () => 1000000000), many(1000, (i) => 2 ** (i % 30))]) out.push(list(a));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`.', 'The second line has `n` numbers: the lengths of the ropes.'],
    constraints: ['1 <= n <= 20000', '1 <= every length <= 10^9'],
    slug: 'connect-the-ropes',
    title: 'Join the Ropes at the Smallest Cost',
    tags: ['heap', 'priority-queue', 'greedy'],
    concept: {
      title: 'Always join the two shortest ropes (the greedy choice behind Huffman coding)',
      body: [
        'Joining two ropes of lengths `x` and `y` costs `x + y` and gives one rope of length `x + y`. To join all ropes into one at the **smallest total cost**, always join the **two shortest** ropes. The reason: a rope that is joined early is counted again in every later join that contains it, so the ropes that are joined first should be the short ones, and the long ones should be joined last, counted only a few times.',
        'A **min-heap** gives the two shortest ropes, and the new rope goes back into the heap, because it may again be among the shortest.',
        { code: 'import heapq\nheap = list(ropes)\nheapq.heapify(heap)\ntotal = 0\nwhile len(heap) > 1:\n    joined = heapq.heappop(heap) + heapq.heappop(heap)\n    total += joined\n    heapq.heappush(heap, joined)\nprint(total)' },
        'The same greedy builds the *Huffman code*, which gives frequent letters short codes in file compression: there the "ropes" are letter frequencies. The total cost can be large: 20000 ropes of 10^9 cost about 3 * 10^14, so use 64-bit numbers.'
      ]
    },
    statement: ['There are `n` ropes with the given lengths. Joining two ropes costs the sum of their lengths and produces one rope. Join all the ropes into one rope, and print the smallest possible total cost (0 if there is only one rope).'],
    outputFormat: ['Print the smallest total cost.'],
    examples: [{ input: '4\n4 3 2 6\n', note: 'Join 2 and 3 (cost 5), then 4 and 5 (cost 9), then 6 and 9 (cost 15): 5 + 9 + 15 = 29.' }],
    hints: ['Join the two shortest ropes first.', 'Use a min-heap: take two ropes, add the cost, and push the joined rope back.', 'Use 64-bit integers for the total.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<queue>', '<functional>'],
      python: r`
        import heapq
        heap = list(a)
        heapq.heapify(heap)
        total = 0
        while len(heap) > 1:
            joined = heapq.heappop(heap) + heapq.heappop(heap)
            total += joined
            heapq.heappush(heap, joined)
        print(total)`,
      cpp: r`
        priority_queue<long long, vector<long long>, greater<long long>> heap(a.begin(), a.end());
        long long total = 0;
        while (heap.size() > 1) {
            long long first = heap.top();
            heap.pop();
            long long second = heap.top();
            heap.pop();
            total += first + second;
            heap.push(first + second);
        }
        cout << total << "\n";`,
      java: r`
        PriorityQueue<Long> heap = new PriorityQueue<>();
        for (long x : a) heap.add(x);
        long total = 0;
        while (heap.size() > 1) {
            long joined = heap.poll() + heap.poll();
            total += joined;
            heap.add(joined);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['A min-heap gives the two shortest ropes; their sum is added to the cost and pushed back as a new rope, until one rope remains.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const a = nums(rows(input)[1]); const h = new Heap((p, q) => p < q); for (const x of a) h.push(x);
      let total = 0; while (h.size > 1) { const joined = h.pop() + h.pop(); total += joined; h.push(joined); }
      return String(total);
    },
    tests() {
      const g = rng(773); const out = ['4\n4 3 2 6\n', '1\n5\n', '2\n1 1\n', '3\n1 1 1\n'];
      const brute = (input) => { let a = nums(rows(input)[1]); let total = 0; while (a.length > 1) { a.sort((p, q) => p - q); const joined = a[0] + a[1]; total += joined; a = a.slice(2); a.push(joined); } return String(total); };
      crossCheck(() => list(many(randInt(g, 1, 12), () => randInt(g, 1, 30))), (i) => this.solve(i), brute);
      for (const a of arrays(g, 1, BIG).slice(1)) out.push(list(a));
      for (const a of [arrays(g, 1, 5)[5], many(20000, () => BIG), many(20000, () => 1), many(20000, (i) => i + 1), many(20000, (i) => 20000 - i), many(2000, (i) => 2 ** (i % 28))]) out.push(list(a));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the string `tasks`: capital letters, one for each task.', 'The second line has `cool`.'],
    constraints: ['1 <= number of tasks <= 20000', 'Every task is a capital letter from A to Z.', '0 <= cool <= 10^9'],
    slug: 'task-scheduler',
    title: 'Run Tasks With a Cooldown',
    tags: ['heap', 'priority-queue', 'greedy', 'simulation'],
    concept: {
      title: 'In every round of cool + 1 slots, run the tasks with the most work left',
      body: [
        'Each task is a capital letter; one task takes one time unit. Two tasks with the **same letter** must have at least `cool` time units between them (the units in between may run other tasks or stay idle). What is the shortest time to finish everything?',
        'Think in rounds of `cool + 1` time units. In a round a letter can run at most once, so run **different letters**, and choose the ones with the **most tasks left**, because they are the hardest to fit later. A max-heap of the remaining counts gives them. If after the round some tasks remain, the round took the full `cool + 1` units (idle units included); the last round takes only as many units as it has tasks.',
        { code: 'import heapq\nheap = [-count for count in counts.values()]\nheapq.heapify(heap)\ntime = 0\nwhile heap:\n    kept, used = [], 0\n    for _ in range(cool + 1):\n        if not heap:\n            break\n        c = heapq.heappop(heap)\n        used += 1\n        if c < -1:\n            kept.append(c + 1)         # one task of this letter is done\n    for c in kept:\n        heapq.heappush(heap, c)\n    time += cool + 1 if heap else used' },
        'There is also a formula: if the most frequent letter appears `m` times and `c` letters have that count, the answer is `max(number of tasks, (m - 1) * (cool + 1) + c)`. The heap simulation shows why it is true, and it works for harder variants too.'
      ]
    },
    statement: ['Each task is a capital letter and takes one time unit. Two tasks with the same letter must have at least `cool` time units between them. The tasks can be run in any order, and the processor may be idle. Print the smallest total number of time units needed to run all the tasks.'],
    outputFormat: ['Print the smallest number of time units.'],
    examples: [{ input: 'AAABBB\n2\n', note: 'A B idle A B idle A B: 8 time units.' }],
    hints: ['Count how many tasks there are of each letter.', 'Work in rounds of cool + 1 units and run the letters with the largest counts left.', 'A round is full length if tasks remain afterwards; the last round lasts as long as the tasks in it.'],
    program: {
      io: ['tasks:word', 'cool:int'],
      fast: true,
      includes: ['<queue>'],
      python: r`
        import heapq
        counts = {}
        for c in tasks:
            counts[c] = counts.get(c, 0) + 1
        heap = [-v for v in counts.values()]
        heapq.heapify(heap)
        time = 0
        while heap:
            kept = []
            used = 0
            for _ in range(cool + 1):
                if not heap:
                    break
                c = heapq.heappop(heap)
                used += 1
                if c < -1:
                    kept.append(c + 1)
            for c in kept:
                heapq.heappush(heap, c)
            time += cool + 1 if heap else used
        print(time)`,
      cpp: r`
        vector<long long> counts(26, 0);
        for (char c : tasks) counts[c - 'A']++;
        priority_queue<long long> heap;
        for (long long c : counts) {
            if (c > 0) heap.push(c);
        }
        long long total = 0;
        while (!heap.empty()) {
            vector<long long> kept;
            long long used = 0;
            for (long long slot = 0; slot <= cool && !heap.empty(); slot++) {
                long long c = heap.top();
                heap.pop();
                used++;
                if (c > 1) kept.push_back(c - 1);
            }
            for (long long c : kept) heap.push(c);
            total += heap.empty() ? used : cool + 1;
        }
        cout << total << "\n";`,
      java: r`
        long[] counts = new long[26];
        for (char c : tasks.toCharArray()) counts[c - 'A']++;
        PriorityQueue<Long> heap = new PriorityQueue<>(Collections.reverseOrder());
        for (long c : counts) {
            if (c > 0) heap.add(c);
        }
        long total = 0;
        while (!heap.isEmpty()) {
            List<Long> kept = new ArrayList<>();
            long used = 0;
            for (long slot = 0; slot <= cool && !heap.isEmpty(); slot++) {
                long c = heap.poll();
                used++;
                if (c > 1) kept.add(c - 1);
            }
            for (long c : kept) heap.add(c);
            total += heap.isEmpty() ? used : cool + 1;
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Rounds of cool + 1 units run the letters with the most tasks left, taken from a max-heap. A round that leaves tasks behind lasts cool + 1 units, the last round only as long as it has tasks.'], complexity: 'Time O(n * 26 log 26), space O(26).' },
    solve(input) {
      const rs = rows(input); const tasks = rs[0]; const cool = Number(rs[1]); const counts = new Map(); for (const c of tasks) counts.set(c, (counts.get(c) || 0) + 1);
      const m = Math.max(...counts.values()); const c = [...counts.values()].filter((x) => x === m).length;
      return String(Math.max(tasks.length, (m - 1) * (cool + 1) + c));
    },
    tests() {
      const g = rng(774); const out = ['AAABBB\n2\n', 'A\n0\n', 'A\n5\n', 'AAAAAA\n3\n', 'ABCD\n10\n'];
      const word = (n, letters) => many(n, () => String.fromCharCode(65 + randInt(g, 0, letters - 1))).join('');
      const simulate = (input) => { const rs = rows(input); const cool = Number(rs[1]); const counts = new Map(); for (const c of rs[0]) counts.set(c, (counts.get(c) || 0) + 1); const h = new Heap((p, q) => p > q); for (const v of counts.values()) h.push(v); let time = 0; while (h.size) { const kept = []; let used = 0; for (let s = 0; s <= cool && h.size; s++) { const c = h.pop(); used++; if (c > 1) kept.push(c - 1); } for (const c of kept) h.push(c); time += h.size ? cool + 1 : used; } return String(time); };
      crossCheck(() => `${word(randInt(g, 1, 14), randInt(g, 1, 5))}\n${randInt(g, 0, 6)}\n`, (i) => this.solve(i), simulate);
      for (const [n, letters] of [[7, 2], [20, 3], [100, 5], [1000, 26], [5000, 4], [20000, 26], [20000, 2], [20000, 1]]) for (const cool of [0, 1, 3, 25, 1000, 1000000000]) { if (n === 20000 && cool > 3 && cool < 1000) continue; out.push(`${word(n, letters)}\n${cool}\n`); }
      out.push(`${'A'.repeat(10000)}${'B'.repeat(10000)}\n100\n`, `${'A'.repeat(20000)}\n1000000000\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the string `s`.'],
    constraints: ['1 <= length of s <= 20000', '`s` has only lowercase letters.'],
    slug: 'reorganize-string',
    title: 'No Two Equal Letters Side by Side',
    tags: ['heap', 'priority-queue', 'greedy', 'string'],
    concept: {
      title: 'Place the most frequent letter that is not the previous one',
      body: [
        'Rearrange the letters of a string so that no two neighbouring letters are equal. A letter that occurs very often is the dangerous one: it needs a different letter between any two of its copies. So the greedy rule is: **at every position put the letter with the most copies left, but not the letter you just put**.',
        'A max-heap of `(copies left, letter)` gives the most frequent letter. If the top is the previous letter, take the next one instead and put the top back afterwards. If the heap has only the previous letter left, the arrangement is impossible.',
        { code: 'heap = [(-count, letter) for letter, count in counts.items()]   # most copies first, then the smaller letter\nheapq.heapify(heap)\nresult, prev = [], ""\nwhile heap:\n    count, letter = heapq.heappop(heap)\n    held = None\n    if letter == prev:\n        if not heap:\n            result = None          # only the previous letter is left\n            break\n        held = (count, letter)\n        count, letter = heapq.heappop(heap)\n    result.append(letter)\n    prev = letter\n    if count + 1 < 0:\n        heapq.heappush(heap, (count + 1, letter))\n    if held:\n        heapq.heappush(heap, held)' },
        'The rearrangement exists exactly when the most frequent letter occurs at most `(length + 1) / 2` times (rounded down). To have a single correct answer, the rule for ties is part of the problem: among letters with the same number of copies left, the smaller letter is taken first.'
      ]
    },
    statement: ['Rearrange the letters of `s` so that no two neighbouring letters are equal. To get exactly one answer, build the result from left to right: at every position put the letter that has the most copies left among the letters different from the previous letter, and when several letters have the same number of copies, the smallest of them. If at some position no letter other than the previous one is left, print `impossible`.'],
    outputFormat: ['Print the rearranged string, or `impossible`.'],
    examples: [{ input: 'aab\n', note: 'a (2 copies) first, then b, then a: aba.' }, { input: 'aaab\n', note: 'a, b, then only a is left and it is the same as the previous letter: impossible.' }],
    hints: ['Count the copies of each letter and keep them in a max-heap of (count, letter).', 'Take the top; if it equals the previous letter, take the second one and put the first back afterwards.', 'If only the previous letter is left, print impossible.'],
    program: {
      io: ['s:word'],
      fast: true,
      includes: ['<queue>'],
      python: r`
        import heapq
        counts = {}
        for c in s:
            counts[c] = counts.get(c, 0) + 1
        heap = [(-v, c) for c, v in counts.items()]
        heapq.heapify(heap)
        result = []
        prev = ""
        ok = True
        while heap:
            count, letter = heapq.heappop(heap)
            held = None
            if letter == prev:
                if not heap:
                    ok = False
                    break
                held = (count, letter)
                count, letter = heapq.heappop(heap)
            result.append(letter)
            prev = letter
            if count + 1 < 0:
                heapq.heappush(heap, (count + 1, letter))
            if held:
                heapq.heappush(heap, held)
        print("".join(result) if ok else "impossible")`,
      cpp: r`
        vector<int> counts(26, 0);
        for (char c : s) counts[c - 'a']++;
        priority_queue<pair<int, int>> heap;
        for (int i = 0; i < 26; i++) {
            if (counts[i] > 0) heap.push({counts[i], -i});
        }
        string result;
        int prev = -1;
        bool ok = true;
        while (!heap.empty()) {
            pair<int, int> top = heap.top();
            heap.pop();
            bool held = false;
            pair<int, int> keep = top;
            if (-top.second == prev) {
                if (heap.empty()) {
                    ok = false;
                    break;
                }
                held = true;
                top = heap.top();
                heap.pop();
            }
            int letter = -top.second;
            result += (char)('a' + letter);
            prev = letter;
            if (top.first > 1) heap.push({top.first - 1, top.second});
            if (held) heap.push(keep);
        }
        cout << (ok ? result : string("impossible")) << "\n";`,
      java: r`
        int[] counts = new int[26];
        for (char c : s.toCharArray()) counts[c - 'a']++;
        PriorityQueue<int[]> heap = new PriorityQueue<>((p, q) -> p[0] != q[0] ? q[0] - p[0] : p[1] - q[1]);
        for (int i = 0; i < 26; i++) {
            if (counts[i] > 0) heap.add(new int[] {counts[i], i});
        }
        StringBuilder result = new StringBuilder();
        int prev = -1;
        boolean ok = true;
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int[] held = null;
            if (top[1] == prev) {
                if (heap.isEmpty()) {
                    ok = false;
                    break;
                }
                held = top;
                top = heap.poll();
            }
            result.append((char) ('a' + top[1]));
            prev = top[1];
            if (top[0] > 1) heap.add(new int[] {top[0] - 1, top[1]});
            if (held != null) heap.add(held);
        }
        System.out.println(ok ? result.toString() : "impossible");`
    },
    solution: { explanation: ['A max-heap of (copies left, letter) gives the most frequent letter; if it is the previous letter the second one is used and the first is put back. If only the previous letter remains, the answer is impossible.'], complexity: 'Time O(n log 26), space O(26).' },
    solve(input) {
      const s = rows(input)[0]; const counts = new Array(26).fill(0); for (const c of s) counts[c.charCodeAt(0) - 97]++;
      let prev = -1; const result = [];
      for (let step = 0; step < s.length; step++) {
        let best = -1; for (let i = 0; i < 26; i++) if (i !== prev && counts[i] > 0 && (best < 0 || counts[i] > counts[best])) best = i;
        if (best < 0) return 'impossible';
        result.push(String.fromCharCode(97 + best)); counts[best]--; prev = best;
      }
      return result.join('');
    },
    tests() {
      const g = rng(775); const out = ['aab\n', 'aaab\n', 'a\n', 'aa\n', 'ab\n', 'abc\n', 'aabb\n'];
      const word = (n, letters, skew) => many(n, () => String.fromCharCode(97 + (g() < skew ? 0 : randInt(g, 0, letters - 1)))).join('');
      const brute = (input) => { const s = rows(input)[0]; const counts = new Array(26).fill(0); for (const c of s) counts[c.charCodeAt(0) - 97]++; const possible = Math.max(...counts) <= Math.ceil(s.length / 2); const result = this.solve(input); if (possible !== (result !== 'impossible')) return 'wrong ' + input; if (result !== 'impossible') { for (let i = 1; i < result.length; i++) if (result[i] === result[i - 1]) return 'adjacent ' + input; if ([...result].sort().join('') !== [...s].sort().join('')) return 'letters ' + input; } return 'fine'; };
      crossCheck(() => `${word(randInt(g, 1, 14), randInt(g, 1, 5), g() * 0.5)}\n`, (i) => brute(i), () => 'fine', 400);
      for (const [n, letters, skew] of [[7, 3, 0.3], [10, 2, 0.1], [30, 4, 0.4], [100, 26, 0.2], [1000, 3, 0.2], [5000, 26, 0], [20000, 26, 0.1], [20000, 2, 0], [20000, 5, 0.3], [20000, 5, 0.4], [19999, 3, 0.45]]) out.push(`${word(n, letters, skew)}\n`);
      out.push(`${'a'.repeat(10000)}${'b'.repeat(10000)}\n`, `${'a'.repeat(10001)}${'b'.repeat(9999)}\n`, `${'a'.repeat(10001)}${'b'.repeat(9998)}\n`, `${'ab'.repeat(5000)}${'c'.repeat(10000)}\n`);
      for (const t of out) if (brute(t) !== 'fine') throw new Error(brute(t));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`.', 'The second line has `n` numbers, in the order in which they arrive.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= every number <= 10^9'],
    slug: 'median-from-stream',
    title: 'The Running Median',
    tags: ['heap', 'priority-queue', 'design'],
    concept: {
      title: 'Two heaps around the middle: a max-heap of the lower half and a min-heap of the upper half',
      body: [
        'The *median* of some numbers is the middle one when they are sorted. With an even count there are two middle numbers; here the answer is the **lower** of them, which is the `(count + 1) / 2`-th smallest number (rounded down). A sorted list would give it by index, but inserting into a sorted list costs O(n), too slow for a long stream.',
        'Keep the numbers in **two halves**: a **max-heap `low`** with the smaller half and a **min-heap `high`** with the larger half. Every number in `low` is at most every number in `high`, and `low` has the same size as `high` or one more. Then the top of `low` is the lower median.',
        { code: 'for x in stream:\n    if not low or x <= -low[0]:\n        heappush(low, -x)             # low is a max-heap: store negatives\n    else:\n        heappush(high, x)\n    if len(low) > len(high) + 1:      # keep the sizes balanced\n        heappush(high, -heappop(low))\n    elif len(high) > len(low):\n        heappush(low, -heappop(high))\n    print(-low[0])                    # the lower median' },
        'Each number costs O(log n). The idea of splitting at the middle with two heaps also answers questions like "the sum of the k smallest numbers" in a stream.'
      ]
    },
    statement: ['Numbers arrive one by one. After each number, print the median of all numbers so far; if their count is even, print the lower one of the two middle numbers (after 2 and 5 the answer is 2).'],
    outputFormat: ['`n` lines: the lower median after every number.'],
    examples: [{ input: '5\n5 2 3 4 1\n', note: 'After 5: 5; after 2 (2 5): 2; after 3 (2 3 5): 3; after 4 (2 3 4 5): 3; after 1 (1 2 3 4 5): 3.' }],
    hints: ['Keep the smaller half in a max-heap and the larger half in a min-heap.', 'Push the new number into the correct half, then balance so that the lower half has the same size or one more.', 'The top of the lower half is the answer.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<queue>', '<functional>'],
      python: r`
        import heapq
        low, high, out = [], [], []
        for x in a:
            if not low or x <= -low[0]:
                heapq.heappush(low, -x)
            else:
                heapq.heappush(high, x)
            if len(low) > len(high) + 1:
                heapq.heappush(high, -heapq.heappop(low))
            elif len(high) > len(low):
                heapq.heappush(low, -heapq.heappop(high))
            out.append(-low[0])
        print("\n".join(map(str, out)))`,
      cpp: r`
        priority_queue<long long> low;
        priority_queue<long long, vector<long long>, greater<long long>> high;
        for (long long x : a) {
            if (low.empty() || x <= low.top()) low.push(x);
            else high.push(x);
            if (low.size() > high.size() + 1) {
                high.push(low.top());
                low.pop();
            } else if (high.size() > low.size()) {
                low.push(high.top());
                high.pop();
            }
            cout << low.top() << "\n";
        }`,
      java: r`
        PriorityQueue<Long> low = new PriorityQueue<>(Collections.reverseOrder());
        PriorityQueue<Long> high = new PriorityQueue<>();
        StringBuilder out = new StringBuilder();
        for (long x : a) {
            if (low.isEmpty() || x <= low.peek()) low.add(x);
            else high.add(x);
            if (low.size() > high.size() + 1) {
                high.add(low.poll());
            } else if (high.size() > low.size()) {
                low.add(high.poll());
            }
            out.append(low.peek()).append("\n");
        }
        System.out.print(out);`
    },
    solution: { explanation: ['A max-heap holds the smaller half and a min-heap the larger half, kept balanced so the lower half is never smaller and at most one bigger. The top of the lower half is the lower median.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const a = nums(rows(input)[1]); const low = new Heap((p, q) => p > q), high = new Heap((p, q) => p < q); const out = [];
      for (const x of a) { if (!low.size || x <= low.peek()) low.push(x); else high.push(x); if (low.size > high.size + 1) high.push(low.pop()); else if (high.size > low.size) low.push(high.pop()); out.push(low.peek()); }
      return out.join('\n');
    },
    tests() {
      const g = rng(776); const out = ['5\n5 2 3 4 1\n', '1\n7\n', '4\n2 2 2 2\n'];
      const brute = (input) => { const s = []; const res = []; for (const x of nums(rows(input)[1])) { let i = 0; while (i < s.length && s[i] < x) i++; s.splice(i, 0, x); res.push(s[(s.length - 1) >> 1]); } return res.join('\n'); };
      crossCheck(() => list(many(randInt(g, 1, 14), () => randInt(g, -8, 8))), (i) => this.solve(i), brute);
      for (const a of arrays(g, -BIG, BIG).slice(1)) out.push(list(a));
      for (const a of [many(20000, (i) => i), many(20000, (i) => 20000 - i), many(20000, () => 5), arrays(g, 0, 2)[5], many(20000, (i) => (i % 2 ? i : -i))]) out.push(list(a));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, the number of meetings.', 'Each of the next `n` lines has two numbers `start` and `end` of a meeting.'],
    constraints: ['1 <= n <= 20000', '0 <= start < end <= 10^9'],
    slug: 'meeting-rooms-needed',
    title: 'How Many Meeting Rooms?',
    tags: ['heap', 'priority-queue', 'sorting', 'intervals'],
    concept: {
      title: 'Sort by start time and keep the end times of the rooms in use in a min-heap',
      body: [
        'Meetings are intervals `[start, end)`. Two meetings can share a room if one ends before (or exactly when) the other starts. The smallest number of rooms equals the **largest number of meetings that are running at the same time**.',
        'Process the meetings in order of **start time**. Keep the **end times of the meetings that occupy rooms** in a min-heap. For a new meeting look at the room that becomes free the earliest (the top of the heap): if it is free already (`end <= start`), the new meeting takes that room, so remove that end time; either way, push the end time of the new meeting. The size of the heap at the end is the number of rooms that were needed.',
        { code: 'meetings.sort()                          # by start time\nheap = []                                # end times of the rooms in use\nfor start, end in meetings:\n    if heap and heap[0] <= start:\n        heappop(heap)                    # that room is free: reuse it\n    heappush(heap, end)\nprint(len(heap))' },
        'A meeting that ends at time 5 does not collide with one that starts at time 5, which is why the test is `<=`. Sorting costs O(n log n) and each meeting does O(log n) heap work.'
      ]
    },
    statement: ['There are `n` meetings, the `i`-th one lasts from `start` to `end`. A meeting that ends at the moment when another one starts does not collide with it. Print the smallest number of rooms with which all the meetings can be held.'],
    outputFormat: ['Print the number of rooms.'],
    examples: [{ input: '3\n0 30\n5 10\n15 20\n', note: 'The meeting 0-30 is running during both others; 5-10 and 15-20 can share the second room: 2 rooms.' }],
    hints: ['Sort the meetings by start time.', 'Keep the end times of the rooms in a min-heap; the top is the room that becomes free first.', 'If the top is at most the new start, reuse that room (remove the old end time). Push the new end time.'],
    program: {
      io: ['n:int', 'iv:int[n][2]'],
      fast: true,
      includes: ['<queue>', '<functional>', '<algorithm>'],
      python: r`
        import heapq
        iv.sort()
        heap = []
        for start, end in iv:
            if heap and heap[0] <= start:
                heapq.heappop(heap)
            heapq.heappush(heap, end)
        print(len(heap))`,
      cpp: r`
        sort(iv.begin(), iv.end());
        priority_queue<long long, vector<long long>, greater<long long>> heap;
        for (const vector<long long>& meeting : iv) {
            if (!heap.empty() && heap.top() <= meeting[0]) heap.pop();
            heap.push(meeting[1]);
        }
        cout << heap.size() << "\n";`,
      java: r`
        Arrays.sort(iv, (p, q) -> Long.compare(p[0], q[0]));
        PriorityQueue<Long> heap = new PriorityQueue<>();
        for (long[] meeting : iv) {
            if (!heap.isEmpty() && heap.peek() <= meeting[0]) heap.poll();
            heap.add(meeting[1]);
        }
        System.out.println(heap.size());`
    },
    solution: { explanation: ['Meetings are taken in order of start time; a min-heap holds the end times of the rooms in use. A room that is free by the new start is reused, then the new end time is pushed. The heap size is the number of rooms.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const starts = [], ends = []; for (let i = 1; i <= n; i++) { const [s, e] = nums(rs[i]); starts.push(s); ends.push(e); }
      starts.sort((p, q) => p - q); ends.sort((p, q) => p - q); let rooms = 0, e = 0;
      for (const s of starts) { if (ends[e] <= s) e++; else rooms++; }
      return String(rooms);
    },
    tests() {
      const g = rng(777); const out = ['3\n0 30\n5 10\n15 20\n', '1\n0 1\n', '2\n0 5\n5 10\n', '2\n0 5\n4 10\n'];
      const make = (n, span, maxLen) => { const lines = many(n, () => { const s = randInt(g, 0, span); return `${s} ${s + randInt(g, 1, maxLen)}`; }); return `${n}\n${lines.join('\n')}\n`; };
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const iv = many(n, (i) => nums(rs[i + 1])); let best = 0; for (const [s] of iv) best = Math.max(best, iv.filter(([a, b]) => a <= s && s < b).length); return String(best); };
      crossCheck(() => make(randInt(g, 1, 10), 20, 8), (i) => this.solve(i), brute);
      for (const [n, span, len] of [[5, 10, 5], [30, 50, 20], [200, 500, 100], [3000, 100000, 5000], [20000, 1000000, 3000], [20000, 100, 50], [20000, 1000000000 - 1000, 1000], [20000, 5, 3]]) out.push(make(n, span, len));
      out.push(`20000\n${many(20000, (i) => `${i * 2} ${i * 2 + 2}`).join('\n')}\n`, `20000\n${many(20000, (i) => `${i} ${1000000000 - i}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `k` different primes in increasing order.'],
    constraints: ['1 <= n <= 5000', '1 <= k <= 30', 'Every prime is at most 1000.', 'The n-th number is at most 10^12.'],
    slug: 'super-ugly-numbers',
    title: 'Numbers Built From Given Primes',
    tags: ['heap', 'priority-queue', 'math'],
    concept: {
      title: 'Take the smallest number out, and push its multiples back',
      body: [
        'A "super ugly" number is a positive integer whose prime factors all come from a given set of primes (1 is the first such number). The numbers in increasing order are: 1, then the primes themselves, then their products, and so on. To list them in order without testing every integer, use a **min-heap** as a source of candidates: start with 1; repeatedly take the smallest number `x`, it is the next number of the list, and push `x * p` for every prime `p`.',
        'The same number can be reached in several ways (`6 = 2 * 3 = 3 * 2`). A set of seen numbers removes the duplicates. There is also a cheaper trick: go through the primes in increasing order and **stop right after the first prime that divides `x`**. Then every number is created from exactly one smaller number, so no set is needed.',
        { code: 'heap = [1]\nfor _ in range(n):\n    x = heappop(heap)                # the next number in the list\n    for p in primes:                 # increasing order\n        heappush(heap, x * p)\n        if x % p == 0:               # a larger prime would create a duplicate\n            break\nprint(x)' },
        'After `n` rounds `x` is the `n`-th number. The heap holds at most `n * k` numbers and every operation costs O(log n * k). Products stay below 10^15 here (the number is at most 10^12 and the primes at most 1000), so 64-bit integers are enough.'
      ]
    },
    statement: ['Given `k` primes in increasing order, consider all positive integers whose prime factors are all among these primes (the number 1 is included). In increasing order they are the first, second, third number, and so on. Print the `n`-th number.'],
    outputFormat: ['Print the `n`-th number.'],
    examples: [{ input: '12 4\n2 7 13 19\n', note: 'The numbers are 1 2 4 7 8 13 14 16 19 26 28 32: the 12th is 32.' }],
    hints: ['Use a min-heap that starts with 1.', 'Take the smallest number out and push its products with all the primes.', 'To avoid duplicates, stop after the first prime that divides the number taken out.'],
    program: {
      io: ['n:int k:int', 'primes:int[k]'],
      fast: true,
      includes: ['<queue>', '<functional>'],
      python: r`
        import heapq
        heap = [1]
        x = 1
        for _ in range(n):
            x = heapq.heappop(heap)
            for p in primes:
                heapq.heappush(heap, x * p)
                if x % p == 0:
                    break
        print(x)`,
      cpp: r`
        priority_queue<long long, vector<long long>, greater<long long>> heap;
        heap.push(1);
        long long x = 1;
        for (long long step = 0; step < n; step++) {
            x = heap.top();
            heap.pop();
            for (long long p : primes) {
                heap.push(x * p);
                if (x % p == 0) break;
            }
        }
        cout << x << "\n";`,
      java: r`
        PriorityQueue<Long> heap = new PriorityQueue<>();
        heap.add(1L);
        long x = 1;
        for (long step = 0; step < n; step++) {
            x = heap.poll();
            for (long p : primes) {
                heap.add(x * p);
                if (x % p == 0) break;
            }
        }
        System.out.println(x);`
    },
    solution: { explanation: ['The smallest candidate is taken from a min-heap; its products with the primes are pushed, stopping after the first prime that divides it so that no number is created twice. After n rounds the last number taken is the answer.'], complexity: 'Time O(n * k * log(n * k)), space O(n * k).' },
    solve(input) {
      const rs = rows(input); const [n, k] = nums(rs[0]); const primes = nums(rs[1]); const list = [1]; const at = new Array(k).fill(0);
      while (list.length < n) { let next = Infinity; for (let j = 0; j < k; j++) next = Math.min(next, list[at[j]] * primes[j]); list.push(next); for (let j = 0; j < k; j++) if (list[at[j]] * primes[j] === next) at[j]++; }
      return String(list[n - 1]);
    },
    tests() {
      const g = rng(778); const out = ['12 4\n2 7 13 19\n', '1 1\n2\n', '5 1\n3\n', '10 3\n2 3 5\n'];
      const allPrimes = []; for (let p = 2; p <= 1000; p++) { let ok = true; for (let d = 2; d * d <= p; d++) if (p % d === 0) { ok = false; break; } if (ok) allPrimes.push(p); }
      const sequence = (primes, n) => { const list = [1]; const at = new Array(primes.length).fill(0); while (list.length < n) { let next = Infinity; for (let j = 0; j < primes.length; j++) next = Math.min(next, list[at[j]] * primes[j]); if (next > 1e12) break; list.push(next); for (let j = 0; j < primes.length; j++) if (list[at[j]] * primes[j] === next) at[j]++; } return list; };
      const brute = (input) => { const rs = rows(input); const [n] = nums(rs[0]); const primes = nums(rs[1]); const answer = Number(this.solve(input)); const seen = new Set([1]); const queue = [1]; for (let h = 0; h < queue.length; h++) for (const p of primes) { const y = queue[h] * p; if (y <= answer && !seen.has(y)) { seen.add(y); queue.push(y); } } return String([...seen].sort((p, q) => p - q)[n - 1]); };
      const pickPrimes = (k) => shuffle(g, allPrimes.slice()).slice(0, k).sort((p, q) => p - q);
      crossCheck(() => { const primes = pickPrimes(randInt(g, 1, 4)); const n = randInt(g, 1, Math.min(60, sequence(primes, 60).length)); return `${n} ${primes.length}\n${primes.join(' ')}\n`; }, (i) => this.solve(i), brute, 100);
      for (const k of [1, 2, 3, 5, 10, 30, 30, 30]) { const primes = pickPrimes(k); const most = Math.min(5000, sequence(primes, 5000).length); out.push(`${most} ${k}\n${primes.join(' ')}\n`); out.push(`${randInt(g, 1, most)} ${k}\n${primes.join(' ')}\n`); }
      out.push(`5000 3\n2 3 5\n`, `5000 4\n2 3 5 7\n`, `40 1\n2\n`, `5 1\n997\n`, `5000 30\n${allPrimes.slice(0, 30).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `k`.', 'Each of the next `n` lines has the two coordinates `x` and `y` of a point.'],
    constraints: ['1 <= k <= n <= 20000', '-10^9 <= x, y <= 10^9'],
    slug: 'k-closest-points',
    title: 'The k Points Closest to the Origin',
    tags: ['heap', 'priority-queue', 'geometry'],
    concept: {
      title: 'To keep the k smallest, use a max-heap of size k',
      body: [
        'The *distance* of the point `(x, y)` from the origin `(0, 0)` is the square root of `x * x + y * y`. The square root is not needed to **compare** distances: the point with the smaller `x * x + y * y` is closer. Staying with integers avoids rounding errors (the squared distance is at most 2 * 10^18, which fits in a 64-bit integer).',
        'To find the `k` closest points, keep a **max-heap of the best `k` points so far**, with the **farthest** of them on top. A new point is pushed; if the heap now holds `k + 1` points, the top (the farthest) is removed, because it cannot be among the `k` closest. It mirrors the "k-th largest" problem with the roles of min and max exchanged.',
        { code: 'heap = []                                  # the farthest of the kept points is on top\nfor x, y in points:\n    heappush(heap, (-(x * x + y * y), -x, -y))     # negate: a max-heap with heapq\n    if len(heap) > k:\n        heappop(heap)                          # drop the farthest\nbest = sorted((-d, -x, -y) for d, x, y in heap)' },
        'Each point costs O(log k), so the total is O(n log k) instead of O(n log n) for sorting everything. Here the order of the output is fixed: by distance, then by `x`, then by `y`.'
      ]
    },
    statement: ['`n` points are given. Print the `k` points that are closest to the origin `(0, 0)`, one point per line, as `x y`, in order of increasing distance; points at the same distance are ordered by `x` and then by `y`. If several points are at the same distance as the k-th one, the ones that come first in this order are taken (the answer is the first `k` points of all the points sorted by distance, then `x`, then `y`).'],
    outputFormat: ['`k` lines with the coordinates of the points.'],
    examples: [{ input: '4 2\n3 3\n5 -1\n-2 4\n1 1\n', note: 'The squared distances are 18, 26, 20 and 2: the two closest points are (1, 1) and (3, 3).' }],
    hints: ['Compare the squared distances x * x + y * y; no square root is needed.', 'Keep a max-heap with the k closest points so far; when it has k + 1 points remove the farthest.', 'Sort the k remaining points by distance, then x, then y before printing.'],
    program: {
      io: ['n:int k:int', 'pts:int[n][2]'],
      fast: true,
      includes: ['<queue>', '<algorithm>', '<utility>'],
      python: r`
        import heapq
        heap = []
        for x, y in pts:
            heapq.heappush(heap, (-(x * x + y * y), -x, -y))
            if len(heap) > k:
                heapq.heappop(heap)
        best = sorted((-d, -x, -y) for d, x, y in heap)
        print("\n".join(str(x) + " " + str(y) for d, x, y in best))`,
      cpp: r`
        priority_queue<pair<long long, pair<long long, long long>>> heap;
        for (const vector<long long>& point : pts) {
            heap.push({point[0] * point[0] + point[1] * point[1], {point[0], point[1]}});
            if ((long long)heap.size() > k) heap.pop();
        }
        vector<pair<long long, pair<long long, long long>>> best;
        while (!heap.empty()) {
            best.push_back(heap.top());
            heap.pop();
        }
        reverse(best.begin(), best.end());
        for (const auto& item : best) cout << item.second.first << " " << item.second.second << "\n";`,
      java: r`
        PriorityQueue<long[]> heap = new PriorityQueue<>((p, q) -> p[0] != q[0] ? Long.compare(q[0], p[0]) : p[1] != q[1] ? Long.compare(q[1], p[1]) : Long.compare(q[2], p[2]));
        for (long[] point : pts) {
            heap.add(new long[] {point[0] * point[0] + point[1] * point[1], point[0], point[1]});
            if (heap.size() > k) heap.poll();
        }
        List<long[]> best = new ArrayList<>(heap);
        best.sort((p, q) -> p[0] != q[0] ? Long.compare(p[0], q[0]) : p[1] != q[1] ? Long.compare(p[1], q[1]) : Long.compare(p[2], q[2]));
        StringBuilder out = new StringBuilder();
        for (long[] item : best) out.append(item[1]).append(" ").append(item[2]).append("\n");
        System.out.print(out);`
    },
    solution: { explanation: ['A max-heap on (squared distance, x, y) keeps the k closest points: after each push the farthest is removed when the heap exceeds k. The k points left are sorted and printed.'], complexity: 'Time O(n log k), space O(k).' },
    solve(input) {
      const rs = rows(input); const [n, k] = nums(rs[0]); const pts = many(n, (i) => nums(rs[i + 1]).map(BigInt));
      const key = (p) => [p[0] * p[0] + p[1] * p[1], p[0], p[1]];
      pts.sort((p, q) => { const a = key(p), b = key(q); for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1; return 0; });
      return pts.slice(0, k).map((p) => `${p[0]} ${p[1]}`).join('\n');
    },
    tests() {
      const g = rng(779); const out = ['4 2\n3 3\n5 -1\n-2 4\n1 1\n', '1 1\n0 0\n', '3 3\n1 0\n0 1\n-1 0\n', '4 2\n1 0\n0 1\n-1 0\n0 -1\n'];
      const make = (n, k, lo, hi) => `${n} ${k}\n${many(n, () => `${randInt(g, lo, hi)} ${randInt(g, lo, hi)}`).join('\n')}\n`;
      for (const [n, k, lo, hi] of [[6, 3, -5, 5], [30, 7, -3, 3], [200, 20, -100, 100], [200, 200, -100, 100], [2000, 1, -BIG, BIG], [5000, 100, -BIG, BIG], [20000, 10000, -1000, 1000], [20000, 5, -BIG, BIG], [20000, 20000, -BIG, BIG], [20000, 50, -2, 2], [20000, 3, -BIG, BIG]]) out.push(make(n, k, lo, hi));
      out.push(`20000 7\n${many(20000, () => `${g() < 0.5 ? BIG : -BIG} ${g() < 0.5 ? BIG : -BIG}`).join('\n')}\n`);
      return out;
    }
  }
];
