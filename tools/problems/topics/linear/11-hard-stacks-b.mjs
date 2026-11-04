import { r, rng, randInt, randArray, many, arr, nums, rows, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };

// A binary min-heap of numbers (for the reference of the dinner plates).
class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  top() { return this.a[0]; }
  push(x) { const a = this.a; a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p] <= a[i]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a; const top = a[0]; const last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { let m = i; const l = 2 * i + 1, rr = 2 * i + 2; if (l < a.length && a[l] < a[m]) m = l; if (rr < a.length && a[rr] < a[m]) m = rr; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; }
}

export default [
  {
    slug: 'shortest-subarray-with-sum-at-least-k',
    title: 'Shortest Subarray With a Large Sum (Negative Numbers Allowed)',
    difficulty: 'hard',
    tags: ['deque', 'monotonic-queue', 'prefix-sum', 'arrays'],
    concept: {
      title: 'Prefix sums and a deque of candidate starts',
      body: [
        'With only positive numbers, a sliding window with two pointers finds the shortest subarray whose sum is at least `k`. With **negative** numbers the window method breaks: a longer window may have a smaller sum, so you cannot decide whether to shrink or to grow. Use **prefix sums** `P[0..n]` (`P[0] = 0`, `P[i] = a[0] + ... + a[i-1]`): the subarray `a[x..y-1]` has the sum `P[y] - P[x]`. We want the closest pair `x < y` with `P[y] - P[x] >= k`.',
        'Keep a **deque of indexes** `x` whose prefix sums are **increasing**. For a new end `y`: (1) while the front `x` satisfies `P[y] - P[x] >= k`, record the length `y - x` and **remove the front**: any later end would only give a longer subarray for this start. (2) While the back has `P[back] >= P[y]`, **remove the back**: `y` is a later start with a smaller or equal prefix sum, which is always better than the back one. (3) Push `y` at the back.',
        { code: 'dq = deque(); best = n + 1\nfor y in range(n + 1):\n    while dq and P[y] - P[dq[0]] >= k:\n        best = min(best, y - dq.popleft())        # this start is finished\n    while dq and P[dq[-1]] >= P[y]:\n        dq.pop()                                  # y is a better start\n    dq.append(y)\nprint(best if best <= n else -1)' },
        'Every index enters and leaves the deque once: O(n). The prefix sums can exceed 32 bits (`20000 * 10^5`), so use 64-bit integers in C++ and Java.'
      ]
    },
    statement: ['Given `n` integers (they may be negative) and a number `k`, find the length of the shortest non-empty contiguous subarray whose sum is at least `k`. Print `-1` if there is no such subarray.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` numbers.'],
    outputFormat: ['Print the shortest length, or -1.'],
    constraints: ['1 <= n <= 20000', '1 <= k <= 10^9', '-10^5 <= each number <= 10^5'],
    examples: [{ input: '5 4\n2 -1 2 3 -2\n', note: 'The subarray 2 3 has the sum 5 and the length 2. No single number reaches 4.' }, { input: '3 5\n1 2 -1\n', note: 'No subarray has a sum of at least 5: the answer is -1.' }],
    hints: ['Two pointers do not work with negative numbers. Work with prefix sums.', 'Keep a deque of start indexes with increasing prefix sums.', 'Remove from the front when the sum is reached, and from the back when the new prefix sum is not larger.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<deque>', '<algorithm>'],
      python: r`
        from collections import deque

        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + a[i]
        dq = deque()
        best = n + 1
        for i in range(n + 1):
            while dq and prefix[i] - prefix[dq[0]] >= k:
                best = min(best, i - dq.popleft())
            while dq and prefix[dq[-1]] >= prefix[i]:
                dq.pop()
            dq.append(i)
        print(best if best <= n else -1)`,
      cpp: r`
        vector<long long> prefix(n + 1, 0);
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + a[i];
        deque<int> dq;
        int best = n + 1;
        for (int i = 0; i <= n; i++) {
            while (!dq.empty() && prefix[i] - prefix[dq.front()] >= k) {
                best = min(best, i - dq.front());
                dq.pop_front();
            }
            while (!dq.empty() && prefix[dq.back()] >= prefix[i]) dq.pop_back();
            dq.push_back(i);
        }
        cout << (best <= n ? best : -1) << "\n";`,
      java: r`
        long[] prefix = new long[(int) n + 1];
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + a[i];
        Deque<Integer> dq = new ArrayDeque<>();
        int best = (int) n + 1;
        for (int i = 0; i <= n; i++) {
            while (!dq.isEmpty() && prefix[i] - prefix[dq.peekFirst()] >= k) {
                best = Math.min(best, i - dq.pollFirst());
            }
            while (!dq.isEmpty() && prefix[dq.peekLast()] >= prefix[i]) dq.pollLast();
            dq.addLast(i);
        }
        System.out.println(best <= n ? best : -1);`
    },
    solution: { explanation: ['A deque keeps start indexes with increasing prefix sums. When the front start reaches the sum k it is recorded and removed; starts with a prefix sum not smaller than the new one are removed from the back.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); const P = [0]; for (const v of a) P.push(P[P.length - 1] + v); const dq = []; let head = 0; let best = n + 1; for (let i = 0; i <= n; i++) { while (head < dq.length && P[i] - P[dq[head]] >= k) { best = Math.min(best, i - dq[head]); head++; } while (dq.length > head && P[dq[dq.length - 1]] >= P[i]) dq.pop(); dq.push(i); } return String(best <= n ? best : -1); },
    tests() {
      const g = rng(621);
      const make = (n, k, lo, hi) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (i) => { const rs = rows(i); const [n, k] = nums(rs[0]); const a = nums(rs[1]); let best = n + 1; for (let x = 0; x < n; x++) { let sum = 0; for (let y = x; y < n; y++) { sum += a[y]; if (sum >= k) { best = Math.min(best, y - x + 1); break; } } } return best <= n ? best : -1; };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 12), -5, 6), (i) => this.solve(i), brute, 400);
      return ['5 4\n2 -1 2 3 -2\n', '3 5\n1 2 -1\n', '1 3\n3\n', '1 4\n3\n', '4 1\n-1 -1 -1 -1\n', make(20, 6, -5, 10), make(2000, 1000, -100000, 100000), make(20000, 100000, -100000, 100000), make(20000, 7, -5, 5), make(20000, 1000000000, 1, 100000), make(20000, 1, -100000, 100000), make(20000, 1000000000, -100000, 100000), `20000 150000\n${many(20000, (i) => (i % 2 ? -100000 : 100000)).join(' ')}\n`, `20000 1000\n${many(20000, () => -100000).join(' ')}\n`];
    }
  },

  {
    slug: 'maximum-sum-with-length-limits',
    title: 'The Best Sum With a Length Between L and R',
    difficulty: 'hard',
    tags: ['deque', 'monotonic-queue', 'prefix-sum', 'sliding-window'],
    concept: {
      title: 'A sliding window minimum over the prefix sums',
      body: [
        'Find the largest sum of a subarray whose length is **at least `lo` and at most `hi`**. With prefix sums `P`, a subarray that ends at `j` (it covers `a[x..j-1]`) has the sum `P[j] - P[x]` and the length `j - x`. For a fixed end `j`, the allowed starts are `x` from `j - hi` to `j - lo`. The best subarray for this end uses the **smallest `P[x]`** in that range of starts. As `j` grows by one, the range of starts moves by one: a **sliding window** minimum over `P`.',
        'The sliding window minimum is the classic job of a **monotonic deque**: keep the indexes with increasing `P` values. When `j` increases, add the new start `j - lo` (remove from the back all with `P` not smaller than the new one), and remove from the front the starts that are older than `j - hi`. The front is the minimum.',
        { code: 'best = -inf; dq = deque()\nfor j in range(lo, n + 1):\n    s = j - lo                                   # the newest allowed start\n    while dq and P[dq[-1]] >= P[s]: dq.pop()\n    dq.append(s)\n    while dq[0] < j - hi: dq.popleft()           # too far: the subarray would be too long\n    best = max(best, P[j] - P[dq[0]])' },
        'The deque is never empty after the push, because the newest start `j - lo` is always allowed (`lo <= hi`). The sums are large (`20000 * 10^9`), so use 64-bit integers.'
      ]
    },
    statement: ['Given `n` integers (they may be negative) and two numbers `lo` and `hi`, find the largest sum of a contiguous subarray whose length is at least `lo` and at most `hi`. Print this sum.'],
    inputFormat: ['The first line has `n`, `lo` and `hi`.', 'The second line has `n` numbers.'],
    outputFormat: ['Print the largest sum.'],
    constraints: ['1 <= lo <= hi <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6 2 3\n1 -2 3 4 -1 2\n', note: 'The subarray 3 4 has length 2 and the sum 7. A subarray of length 3 reaches at most 6.' }],
    hints: ['Use prefix sums: for an end j the sum is P[j] - P[x] with x between j - hi and j - lo.', 'You need the smallest P[x] in a window that moves to the right.', 'A monotonic deque of indexes gives the minimum of a sliding window in O(1) per step.'],
    program: {
      io: ['n:int lo:int hi:int', 'a:int[n]'],
      fast: true,
      includes: ['<deque>', '<algorithm>'],
      python: r`
        from collections import deque

        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + a[i]
        dq = deque()
        best = None
        for j in range(lo, n + 1):
            s = j - lo
            while dq and prefix[dq[-1]] >= prefix[s]:
                dq.pop()
            dq.append(s)
            while dq[0] < j - hi:
                dq.popleft()
            value = prefix[j] - prefix[dq[0]]
            if best is None or value > best:
                best = value
        print(best)`,
      cpp: r`
        vector<long long> prefix(n + 1, 0);
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + a[i];
        deque<int> dq;
        long long best = -4000000000000000000LL;
        for (int j = lo; j <= n; j++) {
            int s = j - lo;
            while (!dq.empty() && prefix[dq.back()] >= prefix[s]) dq.pop_back();
            dq.push_back(s);
            while (dq.front() < j - hi) dq.pop_front();
            best = max(best, prefix[j] - prefix[dq.front()]);
        }
        cout << best << "\n";`,
      java: r`
        long[] prefix = new long[(int) n + 1];
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + a[i];
        Deque<Integer> dq = new ArrayDeque<>();
        long best = Long.MIN_VALUE;
        for (int j = (int) lo; j <= n; j++) {
            int s = j - (int) lo;
            while (!dq.isEmpty() && prefix[dq.peekLast()] >= prefix[s]) dq.pollLast();
            dq.addLast(s);
            while (dq.peekFirst() < j - hi) dq.pollFirst();
            best = Math.max(best, prefix[j] - prefix[dq.peekFirst()]);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['With prefix sums, the best subarray ending at j starts at the minimum prefix sum among the allowed starts. A monotonic deque maintains this minimum while the window of starts slides to the right.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const rs = rows(input); const [n, lo, hi] = nums(rs[0]); const a = nums(rs[1]).map(BigInt); const P = [0n]; for (const v of a) P.push(P[P.length - 1] + v); const dq = []; let head = 0; let best = null; for (let j = lo; j <= n; j++) { const s = j - lo; while (dq.length > head && P[dq[dq.length - 1]] >= P[s]) dq.pop(); dq.push(s); while (dq[head] < j - hi) head++; const v = P[j] - P[dq[head]]; if (best === null || v > best) best = v; } return best.toString(); },
    tests() {
      const g = rng(622);
      const make = (n, lo, hi, vlo, vhi) => `${n} ${lo} ${hi}\n${randArray(g, n, vlo, vhi).join(' ')}\n`;
      const brute = (i) => { const rs = rows(i); const [n, lo, hi] = nums(rs[0]); const a = nums(rs[1]); let best = null; for (let x = 0; x < n; x++) { let sum = 0; for (let y = x; y < n && y - x + 1 <= hi; y++) { sum += a[y]; if (y - x + 1 >= lo && (best === null || sum > best)) best = sum; } } return best; };
      crossCheck(() => { const n = randInt(g, 1, 12); const lo = randInt(g, 1, n); return make(n, lo, randInt(g, lo, n), -6, 6); }, (i) => this.solve(i), brute, 400);
      return ['6 2 3\n1 -2 3 4 -1 2\n', '1 1 1\n-5\n', '3 3 3\n-1 -2 -3\n', '4 1 4\n-3 -1 -2 -9\n', make(20, 3, 8, -9, 9), make(2000, 100, 500, -1000, 1000), make(20000, 1, 20000, -1000000000, 1000000000), make(20000, 5000, 15000, -1000000000, 1000000000), make(20000, 1, 1, -1000000000, 1000000000), make(20000, 10000, 10000, -1000000000, 1000000000), make(20000, 20000, 20000, -1000000000, 1000000000), make(20000, 100, 3000, -1000000000, 0), make(20000, 100, 3000, 0, 1000000000)];
    }
  },

  {
    slug: 'maximum-of-minimums-for-every-window-size',
    title: 'The Best Minimum for Every Window Size',
    difficulty: 'hard',
    tags: ['stack', 'monotonic-stack', 'arrays', 'windows'],
    concept: {
      title: 'Each element is the minimum of one widest window',
      body: [
        'For every window size `k` from 1 to `n`, look at all windows of `k` consecutive elements, take the **minimum** of each, and print the **largest** of these minimums. Doing it for every `k` with a deque would cost O(n^2). The trick is to look at the elements instead of the windows.',
        'Take an element `a[i]` and find the widest window in which it is the minimum: it reaches to the nearest **smaller** element on the left (`left`) and on the right (`right`), so its length is `len = right - left - 1`. This gives one fact: **there is a window of size `len` whose minimum is `a[i]`**. So `ans[len] = max(ans[len], a[i])`. The nearest smaller elements come from a monotonic stack in O(n).',
        'Smaller windows: a window of size `k` inside a window of size `k + 1` has a minimum that is **at least as large**. So if a window of size `k + 1` has the minimum `m`, then some window of size `k` has a minimum of at least `m`. Therefore go from large sizes to small ones and set `ans[k] = max(ans[k], ans[k + 1])`.',
        { code: 'ans = [-inf] * (n + 2)\nfor i in range(n):\n    length = right[i] - left[i] - 1\n    ans[length] = max(ans[length], a[i])\nfor k in range(n - 1, 0, -1):\n    ans[k] = max(ans[k], ans[k + 1])' }
      ]
    },
    statement: ['For every window size `k` from 1 to `n`, consider all windows of `k` consecutive elements of an array, take the minimum of every window, and find the largest of these minimums. Print the answers for `k = 1, 2, ..., n`.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` numbers.'],
    outputFormat: ['Print `n` numbers separated by spaces: the answer for every window size.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5\n1 3 2 5 4\n', note: 'Size 1: the largest element is 5. Size 2: the minimums are 1 2 2 4, the largest is 4. Size 3: 1 2 2, the answer is 2. Size 4: 1 2, the answer is 2. Size 5: 1.' }],
    hints: ['Looking at all windows of all sizes is too slow. Look at each element as the minimum of a window.', 'The widest window where a[i] is the minimum stretches from the nearest smaller element on the left to the one on the right.', 'The answer for a smaller size is never smaller than the answer for a larger size.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        left = [-1] * n
        right = [n] * n
        stack = []
        for i in range(n):
            while stack and a[stack[-1]] >= a[i]:
                stack.pop()
            left[i] = stack[-1] if stack else -1
            stack.append(i)
        stack = []
        for i in range(n - 1, -1, -1):
            while stack and a[stack[-1]] >= a[i]:
                stack.pop()
            right[i] = stack[-1] if stack else n
            stack.append(i)
        ans = [-10 ** 18] * (n + 2)
        for i in range(n):
            length = right[i] - left[i] - 1
            ans[length] = max(ans[length], a[i])
        for k in range(n - 1, 0, -1):
            ans[k] = max(ans[k], ans[k + 1])
        print(*ans[1:n + 1])`,
      cpp: r`
        vector<int> left(n, -1), right(n, n), stack;
        for (int i = 0; i < n; i++) {
            while (!stack.empty() && a[stack.back()] >= a[i]) stack.pop_back();
            left[i] = stack.empty() ? -1 : stack.back();
            stack.push_back(i);
        }
        stack.clear();
        for (int i = n - 1; i >= 0; i--) {
            while (!stack.empty() && a[stack.back()] >= a[i]) stack.pop_back();
            right[i] = stack.empty() ? n : stack.back();
            stack.push_back(i);
        }
        vector<long long> ans(n + 2, -4000000000000000000LL);
        for (int i = 0; i < n; i++) {
            int length = right[i] - left[i] - 1;
            ans[length] = max(ans[length], a[i]);
        }
        for (int k = n - 1; k >= 1; k--) ans[k] = max(ans[k], ans[k + 1]);
        for (int k = 1; k <= n; k++) cout << ans[k] << (k < n ? " " : "\n");`,
      java: r`
        int[] left = new int[(int) n], right = new int[(int) n];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && a[stack.peek()] >= a[i]) stack.pop();
            left[i] = stack.isEmpty() ? -1 : stack.peek();
            stack.push(i);
        }
        stack.clear();
        for (int i = (int) n - 1; i >= 0; i--) {
            while (!stack.isEmpty() && a[stack.peek()] >= a[i]) stack.pop();
            right[i] = stack.isEmpty() ? (int) n : stack.peek();
            stack.push(i);
        }
        long[] ans = new long[(int) n + 2];
        Arrays.fill(ans, Long.MIN_VALUE);
        for (int i = 0; i < n; i++) {
            int length = right[i] - left[i] - 1;
            ans[length] = Math.max(ans[length], a[i]);
        }
        for (int k = (int) n - 1; k >= 1; k--) ans[k] = Math.max(ans[k], ans[k + 1]);
        StringBuilder sb = new StringBuilder();
        for (int k = 1; k <= n; k++) sb.append(ans[k]).append(k < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['A monotonic stack gives, for each element, the widest window in which it is the minimum; that element is a candidate for that size. Going from the large sizes to the small ones, each answer is at least the answer of the next larger size.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const n = a.length; const left = new Array(n), right = new Array(n); let st = []; for (let i = 0; i < n; i++) { while (st.length && a[st[st.length - 1]] >= a[i]) st.pop(); left[i] = st.length ? st[st.length - 1] : -1; st.push(i); } st = []; for (let i = n - 1; i >= 0; i--) { while (st.length && a[st[st.length - 1]] >= a[i]) st.pop(); right[i] = st.length ? st[st.length - 1] : n; st.push(i); } const ans = new Array(n + 2).fill(-Infinity); for (let i = 0; i < n; i++) { const len = right[i] - left[i] - 1; ans[len] = Math.max(ans[len], a[i]); } for (let k = n - 1; k >= 1; k--) ans[k] = Math.max(ans[k], ans[k + 1]); return ans.slice(1, n + 1).join(' '); },
    tests() {
      const g = rng(623);
      const brute = (i) => { const a = nums(rows(i)[1]); const out = []; for (let k = 1; k <= a.length; k++) { let best = -Infinity; for (let s = 0; s + k <= a.length; s++) best = Math.max(best, Math.min(...a.slice(s, s + k))); out.push(best); } return out.join(' '); };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 12), -5, 5)), (i) => this.solve(i), brute, 300);
      return ['5\n1 3 2 5 4\n', '1\n-4\n', '4\n7 7 7 7\n', '3\n3 2 1\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 2000, -1000, 1000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(many(20000, (i) => i)), arr(many(20000, (i) => -i)), arr(many(20000, () => -1000000000)), arr(many(20000, (i) => (i % 2 ? 1000000000 : -1000000000))), arr(randArray(g, 20000, 0, 3))];
    }
  },

  {
    slug: 'second-greater-element',
    title: 'The Second Greater Element',
    difficulty: 'hard',
    tags: ['stack', 'monotonic-stack', 'arrays'],
    concept: {
      title: 'Two stacks: waiting for the first greater, waiting for the second',
      body: [
        'For every element, the **second greater element** is the second element to its right (in order of position) that is strictly greater than it. The next greater element needs one stack of elements waiting for their first greater element. Here an element waits **twice**: first for the first greater element, then for the second. Use two stacks: `first` (waiting for the first greater) and `second` (already seen one greater element, waiting for the second).',
        'When a new element `x = a[i]` arrives: (1) every element on the **`second`** stack that is smaller than `x` has now found its second greater element: its answer is `x`. (2) Every element on the **`first`** stack that is smaller than `x` has found its first greater element: it moves to the **`second`** stack. (3) Push `i` on `first`. The order matters: step (1) must come before step (2), otherwise the element would find its first and second greater element in the same moment.',
        { code: 'for i in range(n):\n    while second and a[second[-1]] < a[i]:\n        res[second.pop()] = a[i]                    # found the second greater\n    moved = []\n    while first and a[first[-1]] < a[i]:\n        moved.append(first.pop())                   # found the first greater\n    second.extend(reversed(moved))                  # keep the original order\n    first.append(i)' },
        'The moved elements are put on the second stack in their original order. Then both stacks stay sorted (non-increasing from the bottom to the top), so the elements to be settled are always on top. Every index is moved at most twice: O(n).'
      ]
    },
    statement: ['For each element of an array, find its second greater element: looking to the right, the second element (in order of position) that is strictly greater than it. Print its value for every element, or -1 if there is no such element.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` numbers.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5\n2 4 0 9 6\n', note: 'For 2 the greater elements to the right are 4 and 9: the second is 9. For 4 they are 9 and 6: the second is 6. For 0 they are 9 and 6: 6. The last two have none. Answer: 9 6 6 -1 -1.' }],
    hints: ['One stack gives the first greater element. Use a second stack for the elements that have already seen one.', 'Process the second stack first, then move elements from the first stack to the second.', 'Keep the moved elements in the same order, so that the second stack stays monotonic.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        res = [-1] * n
        first = []
        second = []
        for i in range(n):
            while second and a[second[-1]] < a[i]:
                res[second.pop()] = a[i]
            moved = []
            while first and a[first[-1]] < a[i]:
                moved.append(first.pop())
            second.extend(reversed(moved))
            first.append(i)
        print(*res)`,
      cpp: r`
        vector<long long> res(n, -1);
        vector<int> first, second;
        for (int i = 0; i < n; i++) {
            while (!second.empty() && a[second.back()] < a[i]) {
                res[second.back()] = a[i];
                second.pop_back();
            }
            size_t start = first.size();
            while (start > 0 && a[first[start - 1]] < a[i]) start--;
            for (size_t j = start; j < first.size(); j++) second.push_back(first[j]);
            first.resize(start);
            first.push_back(i);
        }
        for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        long[] res = new long[(int) n];
        Arrays.fill(res, -1);
        int[] first = new int[(int) n], second = new int[(int) n];
        int firstSize = 0, secondSize = 0;
        for (int i = 0; i < n; i++) {
            while (secondSize > 0 && a[second[secondSize - 1]] < a[i]) {
                res[second[--secondSize]] = a[i];
            }
            int start = firstSize;
            while (start > 0 && a[first[start - 1]] < a[i]) start--;
            for (int j = start; j < firstSize; j++) second[secondSize++] = first[j];
            firstSize = start;
            first[firstSize++] = i;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(res[i]).append(i + 1 < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The first stack holds elements waiting for their first greater element, the second one elements waiting for the second. A new element settles the second stack, then moves the smaller elements of the first stack to the second, keeping their order.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const res = new Array(a.length).fill(-1); const first = [], second = []; for (let i = 0; i < a.length; i++) { while (second.length && a[second[second.length - 1]] < a[i]) res[second.pop()] = a[i]; const moved = []; while (first.length && a[first[first.length - 1]] < a[i]) moved.push(first.pop()); second.push(...moved.reverse()); first.push(i); } return res.join(' '); },
    tests() {
      const g = rng(624);
      const brute = (i) => { const a = nums(rows(i)[1]); return a.map((x, p) => { let seen = 0; for (let q = p + 1; q < a.length; q++) if (a[q] > x && ++seen === 2) return a[q]; return -1; }).join(' '); };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 12), -4, 4)), (i) => this.solve(i), brute, 400);
      return ['5\n2 4 0 9 6\n', '1\n5\n', '2\n1 2\n', '3\n1 2 3\n', '4\n3 3 3 3\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 2000, -1000, 1000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(many(20000, (i) => i)), arr(many(20000, (i) => 20000 - i)), arr(many(20000, () => 5)), arr(randArray(g, 20000, 0, 3)), arr(many(20000, (i) => (i % 2 ? 1000000000 - i : i)))];
    }
  },

  {
    slug: 'maximum-frequency-stack',
    title: 'A Stack That Pops the Most Frequent Element',
    difficulty: 'hard',
    tags: ['stack', 'design', 'hash-map'],
    concept: {
      title: 'One stack for every frequency',
      body: [
        'A normal stack pops the last pushed element. Here `pop` removes the element that occurs **most often** in the stack; if several elements share the highest count, it removes the one closest to the top (the one pushed most recently). Searching all elements at each `pop` is too slow, so we organize the data by **frequency**.',
        'Keep `freq[x]` (how many times `x` is in the stack) and `groups[f]`, a stack with the elements in the order in which they reached the frequency `f`. Pushing `x` increases `freq[x]` to `f` and appends `x` to `groups[f]`: so an element with the count `3` is present in `groups[1]`, `groups[2]` and `groups[3]`. Keep `max_freq`, the highest frequency. **Pop**: take the last element of `groups[max_freq]` (the most recent one among those with the highest frequency), decrease its `freq`, and if `groups[max_freq]` is now empty, decrease `max_freq`.',
        { code: 'push(x): f = freq[x] = freq.get(x, 0) + 1\n         max_freq = max(max_freq, f);  groups[f].append(x)\npop():   x = groups[max_freq].pop();  freq[x] -= 1\n         if not groups[max_freq]: max_freq -= 1\n         return x' },
        'Both operations are O(1). The copy of `x` that is left in a lower group is exactly the occurrence that remains in the stack.'
      ]
    },
    statement: ['Implement a stack with two operations. `push x` puts the number `x` on the stack. `pop` removes and prints the element that occurs most often in the stack; if there is a tie, it removes the one that was pushed most recently among the tied elements (the one closest to the top), and removes that occurrence. Process `n` operations and print the result of every `pop`.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has an operation and a number: `push x` or `pop 0`.'],
    outputFormat: ['One line for every `pop` operation.'],
    constraints: ['2 <= n <= 20000', '0 <= x <= 10^9', 'A pop never happens on an empty stack, and there is at least one pop.'],
    examples: [{ input: '10\npush 5\npush 7\npush 5\npush 7\npush 4\npush 5\npop 0\npop 0\npop 0\npop 0\n', note: 'The number 5 occurs three times: pop gives 5. Then 5 and 7 occur twice; 7 was pushed later: 7. Then 5 (twice): 5. Then 5, 7, 4 occur once each and 4 is the top one: 4.' }],
    hints: ['Keep the count of every value, and a stack of values for every count.', 'A value with the count 3 appears in the stacks of the counts 1, 2 and 3.', 'Pop from the stack of the highest count. When it becomes empty, the highest count decreases by one.'],
    program: {
      io: ['n:int', 'ops:word[n][2]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        freq = {}
        groups = {}
        max_freq = 0
        out = []
        for op, v in ops:
            if op == "push":
                x = int(v)
                f = freq.get(x, 0) + 1
                freq[x] = f
                if f > max_freq:
                    max_freq = f
                groups.setdefault(f, []).append(x)
            else:
                x = groups[max_freq].pop()
                freq[x] -= 1
                if not groups[max_freq]:
                    max_freq -= 1
                out.append(x)
        print("\n".join(map(str, out)))`,
      cpp: r`
        unordered_map<long long, int> freq;
        vector<vector<long long>> groups(n + 2);
        int maxFreq = 0;
        for (int i = 0; i < n; i++) {
            if (ops[i][0] == "push") {
                long long x = stoll(ops[i][1]);
                int f = ++freq[x];
                if (f > maxFreq) maxFreq = f;
                groups[f].push_back(x);
            } else {
                long long x = groups[maxFreq].back();
                groups[maxFreq].pop_back();
                freq[x]--;
                if (groups[maxFreq].empty()) maxFreq--;
                cout << x << "\n";
            }
        }`,
      java: r`
        Map<Long, Integer> freq = new HashMap<>();
        List<ArrayDeque<Long>> groups = new ArrayList<>();
        for (int i = 0; i < n + 2; i++) groups.add(new ArrayDeque<>());
        int maxFreq = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (ops[i][0].equals("push")) {
                long x = Long.parseLong(ops[i][1]);
                int f = freq.merge(x, 1, Integer::sum);
                if (f > maxFreq) maxFreq = f;
                groups.get(f).push(x);
            } else {
                long x = groups.get(maxFreq).pop();
                freq.merge(x, -1, Integer::sum);
                if (groups.get(maxFreq).isEmpty()) maxFreq--;
                sb.append(x).append("\n");
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Every value has a count, and a stack of values exists for every count. A pop takes the top of the stack of the highest count, so ties are broken by recency.'], complexity: 'O(1) per operation, space O(n).' },
    solve(input) { const freq = new Map(); const groups = [[]]; let maxFreq = 0; const out = []; for (const l of rows(input).slice(1)) { const [op, v] = l.split(' '); if (op === 'push') { const x = Number(v); const f = (freq.get(x) || 0) + 1; freq.set(x, f); if (f > maxFreq) maxFreq = f; while (groups.length <= f) groups.push([]); groups[f].push(x); } else { const x = groups[maxFreq].pop(); freq.set(x, freq.get(x) - 1); if (!groups[maxFreq].length) maxFreq--; out.push(x); } } return out.join('\n'); },
    tests() {
      const g = rng(625);
      // the definition: count the values, take the highest count, and remove the topmost occurrence of a value with this count
      const brute = (input) => { const stack = []; const out = []; for (const l of rows(input).slice(1)) { const [op, v] = l.split(' '); if (op === 'push') stack.push(Number(v)); else { const cnt = new Map(); for (const x of stack) cnt.set(x, (cnt.get(x) || 0) + 1); const best = Math.max(...cnt.values()); let pos = stack.length - 1; while (cnt.get(stack[pos]) !== best) pos--; out.push(stack[pos]); stack.splice(pos, 1); } } return out.join('\n'); };
      const make = (n, vals, pPop) => { const ops = ['push ' + randInt(g, 0, vals)]; let size = 1; for (let i = 1; i < n - 1; i++) { if (size > 1 && g() < pPop) { ops.push('pop 0'); size--; } else { ops.push('push ' + randInt(g, 0, vals)); size++; } } ops.push('pop 0'); return `${n}\n${ops.join('\n')}\n`; };
      crossCheck(() => make(randInt(g, 2, 30), 3, 0.4), (i) => this.solve(i), brute, 500);
      return ['10\npush 5\npush 7\npush 5\npush 7\npush 4\npush 5\npop 0\npop 0\npop 0\npop 0\n', '2\npush 1\npop 0\n', '4\npush 1\npush 1\npush 2\npop 0\n', make(20, 3, 0.4), make(300, 10, 0.4), make(2000, 100, 0.45), make(20000, 5, 0.45), make(20000, 1000000000, 0.45), make(20000, 3, 0.2), `20000\n${many(10000, (i) => `push ${i % 100}`).concat(many(10000, () => 'pop 0')).join('\n')}\n`];
    }
  },

  {
    slug: 'text-editor-with-cursor',
    title: 'A Text Editor With a Cursor',
    difficulty: 'hard',
    tags: ['stack', 'design', 'strings', 'simulation'],
    concept: {
      title: 'Two stacks: the text before the cursor and the text after it',
      body: [
        'A text editor keeps a text and a cursor. Operations happen at the cursor: add text, delete to the left, move the cursor to the left or to the right. If the text is one string, inserting or deleting in the middle moves everything after the cursor, which is slow. Split the text at the cursor into **two stacks**: `left` has the characters before the cursor (the top is the character right before the cursor), and `right` has the characters after the cursor, **in reverse order** (the top is the character right after the cursor).',
        'Now every operation touches only the tops: **add** pushes the characters on `left`. **Delete `k`** pops up to `k` characters from `left`. **Move left `k`**: pop up to `k` characters from `left` and push each on `right`. **Move right `k`**: pop up to `k` characters from `right` and push each on `left`. The cursor never goes outside the text, so use `min(k, size)`. The text before the cursor is the content of `left`.',
        { code: 'left k:   for _ in range(min(k, len(left))):  right.append(left.pop())\nright k:  for _ in range(min(k, len(right))): left.append(right.pop())\ndelete k: k = min(k, len(left)); del left[len(left) - k:]\nadd text: left.extend(text)' },
        'The cost of an operation depends on `k` or on the length of the added text, not on the length of the whole text.'
      ]
    },
    statement: ['Simulate a text editor. The text is empty at first and the cursor is at its start. Each operation is given on one line: `add text` inserts the text (lowercase letters) at the cursor, and the cursor ends right after it; nothing is printed. `delete k` deletes up to `k` characters to the left of the cursor and prints how many characters were really deleted. `left k` moves the cursor up to `k` positions to the left, `right k` moves it up to `k` positions to the right (not beyond the ends of the text); for both, print the last (up to) 10 characters to the left of the cursor, or `-` if there are none.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has an operation and its argument (a text or a number).'],
    outputFormat: ['One line for every `delete`, `left` and `right` operation.'],
    constraints: ['1 <= n <= 20000', 'The text of an `add` has 1 to 100 lowercase letters.', '1 <= k <= 100', 'There is at least one `delete`, `left` or `right` operation.'],
    examples: [{ input: '7\nadd hello\nleft 2\nadd xy\ndelete 1\nright 5\nleft 100\nright 3\n', note: 'hello, cursor at 5. left 2: "hel" is before the cursor. add xy gives helxylo. delete 1 removes y: prints 1. right 5 moves to the end (2 steps): prints helxlo. left 100 goes to the start: prints -. right 3 prints hel.' }],
    hints: ['Keep the text before the cursor on one stack and the text after the cursor (reversed) on another.', 'Moving the cursor moves characters from one stack to the other.', 'Never move more characters than a stack has.'],
    program: {
      io: ['n:int', 'ops:word[n][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        left = []
        right = []
        out = []
        for op, v in ops:
            if op == "add":
                left.extend(v)
            elif op == "delete":
                k = min(int(v), len(left))
                del left[len(left) - k:]
                out.append(str(k))
            else:
                k = int(v)
                if op == "left":
                    for _ in range(min(k, len(left))):
                        right.append(left.pop())
                else:
                    for _ in range(min(k, len(right))):
                        left.append(right.pop())
                tail = "".join(left[-10:])
                out.append(tail if tail else "-")
        print("\n".join(out))`,
      cpp: r`
        string left, right;
        for (int i = 0; i < n; i++) {
            const string& op = ops[i][0];
            if (op == "add") {
                left += ops[i][1];
            } else if (op == "delete") {
                size_t k = min((size_t) stoll(ops[i][1]), left.size());
                left.resize(left.size() - k);
                cout << k << "\n";
            } else {
                size_t k = stoll(ops[i][1]);
                if (op == "left") {
                    k = min(k, left.size());
                    for (size_t t = 0; t < k; t++) {
                        right.push_back(left.back());
                        left.pop_back();
                    }
                } else {
                    k = min(k, right.size());
                    for (size_t t = 0; t < k; t++) {
                        left.push_back(right.back());
                        right.pop_back();
                    }
                }
                string tail = left.substr(left.size() > 10 ? left.size() - 10 : 0);
                cout << (tail.empty() ? "-" : tail) << "\n";
            }
        }`,
      java: r`
        StringBuilder left = new StringBuilder(), right = new StringBuilder(), sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            String op = ops[i][0];
            if (op.equals("add")) {
                left.append(ops[i][1]);
            } else if (op.equals("delete")) {
                int k = (int) Math.min(Long.parseLong(ops[i][1]), left.length());
                left.setLength(left.length() - k);
                sb.append(k).append("\n");
            } else {
                int k = Integer.parseInt(ops[i][1]);
                if (op.equals("left")) {
                    k = Math.min(k, left.length());
                    for (int t = 0; t < k; t++) {
                        right.append(left.charAt(left.length() - 1));
                        left.setLength(left.length() - 1);
                    }
                } else {
                    k = Math.min(k, right.length());
                    for (int t = 0; t < k; t++) {
                        left.append(right.charAt(right.length() - 1));
                        right.setLength(right.length() - 1);
                    }
                }
                String tail = left.substring(Math.max(0, left.length() - 10));
                sb.append(tail.isEmpty() ? "-" : tail).append("\n");
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['The characters before the cursor are on one stack and those after it (reversed) on another. Adding and deleting use the first stack; moving the cursor moves characters between the stacks.'], complexity: 'Time O(total of k and of the added text), space O(text length).' },
    solve(input) { const rs = rows(input).slice(1); const left = [], right = []; const out = []; for (const l of rs) { const sp = l.indexOf(' '); const op = l.slice(0, sp), v = l.slice(sp + 1); if (op === 'add') left.push(...v); else if (op === 'delete') { const k = Math.min(Number(v), left.length); left.length -= k; out.push(String(k)); } else { const k = Number(v); if (op === 'left') for (let t = Math.min(k, left.length); t > 0; t--) right.push(left.pop()); else for (let t = Math.min(k, right.length); t > 0; t--) left.push(right.pop()); const tail = left.slice(-10).join(''); out.push(tail || '-'); } } return out.join('\n'); },
    tests() {
      const g = rng(626);
      const make = (n, pAdd, maxText, maxK) => { const ops = many(n - 1, () => { const x = g(); if (x < pAdd) return 'add ' + randWord(g, randInt(g, 1, maxText), 'abcdefghijklmnopqrstuvwxyz'); const k = randInt(g, 1, maxK); return (x < pAdd + (1 - pAdd) / 3 ? 'delete ' : x < pAdd + 2 * (1 - pAdd) / 3 ? 'left ' : 'right ') + k; }); ops.push('left 1'); return `${n}\n${ops.join('\n')}\n`; };
      // cross-check against a text with a cursor index
      const brute = (input) => { const rs = rows(input).slice(1); let text = ''; let c = 0; const out = []; for (const l of rs) { const sp = l.indexOf(' '); const op = l.slice(0, sp), v = l.slice(sp + 1); if (op === 'add') { text = text.slice(0, c) + v + text.slice(c); c += v.length; } else if (op === 'delete') { const k = Math.min(Number(v), c); text = text.slice(0, c - k) + text.slice(c); c -= k; out.push(String(k)); } else { c = op === 'left' ? Math.max(0, c - Number(v)) : Math.min(text.length, c + Number(v)); out.push(text.slice(Math.max(0, c - 10), c) || '-'); } } return out.join('\n'); };
      crossCheck(() => make(randInt(g, 2, 25), 0.4, 6, 8), (i) => this.solve(i), brute, 400);
      return ['7\nadd hello\nleft 2\nadd xy\ndelete 1\nright 5\nleft 100\nright 3\n', '2\nadd a\nleft 1\n', '3\nadd abcdefghijklmno\ndelete 100\nright 1\n', make(20, 0.4, 6, 8), make(300, 0.4, 20, 30), make(2000, 0.3, 100, 100), make(20000, 0.4, 100, 100), make(20000, 0.2, 100, 100), make(20000, 0.5, 5, 3), `20000\n${many(10000, () => 'add ' + 'z'.repeat(100)).concat(many(10000, (i) => (i % 2 ? 'right 100' : 'left 100'))).join('\n')}\n`];
    }
  },

  {
    slug: 'maximum-subarray-min-product',
    title: 'The Maximum Min-Product of a Subarray',
    difficulty: 'hard',
    tags: ['stack', 'monotonic-stack', 'prefix-sum', 'arrays'],
    concept: {
      title: 'For each element as the minimum, take the whole range where it is the smallest',
      body: [
        'The **min-product** of a subarray is its smallest element multiplied by its sum. All numbers are positive. If the minimum of the best subarray is `a[i]`, we should take the **widest** subarray in which `a[i]` is still the minimum, because all numbers are positive and a wider range has a larger sum. That range goes from the nearest smaller element on the left to the nearest smaller element on the right (both excluded).',
        'So for each element compute its range with a **monotonic stack**, get the range sum from **prefix sums**, and take the maximum of `a[i] * sum`. In one pass: keep a stack of indexes with increasing values. When a value `cur` arrives that is not larger than the top, pop the top `m`: its right limit is the current index `i`, and its left limit is the new top of the stack (or the start).',
        { code: 'stack = []; best = 0\nfor i in range(n + 1):\n    cur = a[i] if i < n else 0                    # 0 empties the stack at the end\n    while stack and a[stack[-1]] >= cur:\n        m = a[stack.pop()]\n        left = stack[-1] + 1 if stack else 0\n        best = max(best, m * (P[i] - P[left]))\n    stack.append(i)\nprint(best % 1000000007)' },
        'Equal elements are handled by popping with `>=`: the last of several equal elements gets the full range. The product can reach `2 * 10^18`, which still fits in a 64-bit integer: take the maximum first and the remainder only at the end (the remainder would break the comparison).'
      ]
    },
    statement: ['The min-product of a subarray of positive integers is the minimum value of the subarray multiplied by the sum of the subarray. Find the maximum min-product over all non-empty subarrays and print it modulo 1000000007 (the maximum is found first, then reduced).'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` numbers.'],
    outputFormat: ['Print the maximum min-product modulo 1000000007.'],
    constraints: ['1 <= n <= 20000', '1 <= each number <= 10^7'],
    examples: [{ input: '6\n3 1 5 6 4 2\n', note: 'The subarray 5 6 4 has the minimum 4 and the sum 15: 60.' }],
    hints: ['If the minimum is fixed, the widest range gives the largest sum.', 'For each element find the nearest smaller element on both sides (a monotonic stack).', 'Use prefix sums for the sum of the range. Compare the real products, and apply the modulo only at the end.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + a[i]
        best = 0
        stack = []
        for i in range(n + 1):
            cur = a[i] if i < n else 0
            while stack and a[stack[-1]] >= cur:
                m = a[stack.pop()]
                left = stack[-1] + 1 if stack else 0
                best = max(best, m * (prefix[i] - prefix[left]))
            stack.append(i)
        print(best % 1000000007)`,
      cpp: r`
        vector<long long> prefix(n + 1, 0);
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + a[i];
        long long best = 0;
        vector<int> stack;
        for (int i = 0; i <= n; i++) {
            long long cur = i < n ? a[i] : 0;
            while (!stack.empty() && a[stack.back()] >= cur) {
                long long m = a[stack.back()];
                stack.pop_back();
                int left = stack.empty() ? 0 : stack.back() + 1;
                best = max(best, m * (prefix[i] - prefix[left]));
            }
            stack.push_back(i);
        }
        cout << best % 1000000007LL << "\n";`,
      java: r`
        long[] prefix = new long[(int) n + 1];
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + a[i];
        long best = 0;
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i <= n; i++) {
            long cur = i < n ? a[i] : 0;
            while (!stack.isEmpty() && a[stack.peek()] >= cur) {
                long m = a[stack.pop()];
                int left = stack.isEmpty() ? 0 : stack.peek() + 1;
                best = Math.max(best, m * (prefix[i] - prefix[left]));
            }
            stack.push(i);
        }
        System.out.println(best % 1000000007L);`
    },
    solution: { explanation: ['For every element as the minimum, the widest range where it is the smallest is found with a monotonic stack, its sum comes from prefix sums, and the largest product is reduced modulo 1000000007 at the end.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]).map(BigInt); const n = a.length; const P = [0n]; for (const v of a) P.push(P[P.length - 1] + v); const st = []; let best = 0n; for (let i = 0; i <= n; i++) { const cur = i < n ? a[i] : 0n; while (st.length && a[st[st.length - 1]] >= cur) { const m = a[st.pop()]; const left = st.length ? st[st.length - 1] + 1 : 0; const v = m * (P[i] - P[left]); if (v > best) best = v; } st.push(i); } return (best % 1000000007n).toString(); },
    tests() {
      const g = rng(627);
      const brute = (i) => { const a = nums(rows(i)[1]).map(BigInt); let best = 0n; for (let s = 0; s < a.length; s++) { let min = a[s]; let sum = 0n; for (let e = s; e < a.length; e++) { if (a[e] < min) min = a[e]; sum += a[e]; if (min * sum > best) best = min * sum; } } return (best % 1000000007n).toString(); };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 12), 1, 9)), (i) => this.solve(i), brute, 300);
      return ['6\n3 1 5 6 4 2\n', '1\n7\n', '3\n2 3 3\n', '4\n10000000 10000000 10000000 10000000\n', arr(randArray(g, 20, 1, 9)), arr(randArray(g, 2000, 1, 1000)), arr(randArray(g, 20000, 1, 10000000)), arr(many(20000, () => 10000000)), arr(many(20000, (i) => i + 1)), arr(many(20000, (i) => 20000 - i)), arr(many(20000, (i) => (i % 2 ? 10000000 : 1))), arr(randArray(g, 20000, 1, 3))];
    }
  },

  {
    slug: 'minimum-cost-tree-from-leaf-values',
    title: 'The Cheapest Tree From Its Leaves',
    difficulty: 'hard',
    tags: ['stack', 'monotonic-stack', 'greedy', 'trees'],
    concept: {
      title: 'The smallest leaf should be combined first, with its smaller neighbour',
      body: [
        'The values `a[0..n-1]` are the leaves of a binary tree, listed from left to right. Every inner node has exactly two children, and its value is the **product of the largest leaf in its left subtree and the largest leaf in its right subtree**. The cost of the tree is the sum of the values of all inner nodes. Find the smallest possible cost.',
        'Think of merging neighbours: merging two adjacent groups costs `max(left group) * max(right group)`, and the new group keeps the larger maximum, so the **smaller** maximum disappears from the picture. Because the cost involves the product of two maximums, we want a small value to disappear while it is multiplied with a **small** neighbour. **Greedy:** take the smallest value `m` in the list; it must be merged with one neighbour, and the cheaper choice is the **smaller of its two neighbours**: cost `m * min(left, right)`. Then `m` is gone. Repeat.',
        'A **monotonic stack** (decreasing values) does this in O(n). For each new value `x`: while the top of the stack is not larger than `x`, pop it as `mid`: its two neighbours are the new top and `x`, so add `mid * min(stack top, x)`. Start the stack with a huge sentinel. At the end, the stack is decreasing, and the values are merged from the smallest (the top): add `top * the value below it`.',
        { code: 'stack = [INF]; total = 0\nfor x in a:\n    while stack[-1] <= x:\n        mid = stack.pop()\n        total += mid * min(stack[-1], x)\n    stack.append(x)\nwhile len(stack) > 2:                         # only the sentinel and the largest remain at the end\n    total += stack.pop() * stack[-1]' }
      ]
    },
    statement: ['An array `a` contains the values of the leaves of a binary tree in the order of an in-order traversal (from left to right). Every inner node has exactly two children, and its value is the product of the largest leaf value in its left subtree and the largest leaf value in its right subtree. Print the smallest possible sum of the values of all inner nodes (0 for a single leaf).'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` leaf values.'],
    outputFormat: ['Print the smallest sum.'],
    constraints: ['1 <= n <= 20000', '1 <= each value <= 10^4'],
    examples: [{ input: '3\n6 2 4\n', note: 'Merging 2 and 4 first costs 8, then 6 * 4 = 24: the total is 32. Merging 6 and 2 first would cost 12 + 24 = 36.' }],
    hints: ['Merging two groups costs the product of their maximums, and the smaller maximum is then never used again.', 'Always remove the smallest value; it is merged with the smaller of its two neighbours.', 'A decreasing monotonic stack finds the neighbours of every popped value.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        stack = [10 ** 18]
        total = 0
        for x in a:
            while stack[-1] <= x:
                mid = stack.pop()
                total += mid * min(stack[-1], x)
            stack.append(x)
        while len(stack) > 2:
            total += stack.pop() * stack[-1]
        print(total)`,
      cpp: r`
        vector<long long> stack = {4000000000000000000LL};
        long long total = 0;
        for (int i = 0; i < n; i++) {
            long long x = a[i];
            while (stack.back() <= x) {
                long long mid = stack.back();
                stack.pop_back();
                total += mid * min(stack.back(), x);
            }
            stack.push_back(x);
        }
        while (stack.size() > 2) {
            long long top = stack.back();
            stack.pop_back();
            total += top * stack.back();
        }
        cout << total << "\n";`,
      java: r`
        Deque<Long> stack = new ArrayDeque<>();
        stack.push(4000000000000000000L);
        long total = 0;
        for (int i = 0; i < n; i++) {
            long x = a[i];
            while (stack.peek() <= x) {
                long mid = stack.pop();
                total += mid * Math.min(stack.peek(), x);
            }
            stack.push(x);
        }
        while (stack.size() > 2) {
            long top = stack.pop();
            total += top * stack.peek();
        }
        System.out.println(total);`
    },
    solution: { explanation: ['A decreasing stack removes the smallest value first and merges it with the smaller of its two neighbours, paying their product. The values left at the end are merged from the top of the stack down.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const stack = [Infinity]; let total = 0; for (const x of a) { while (stack[stack.length - 1] <= x) { const mid = stack.pop(); total += mid * Math.min(stack[stack.length - 1], x); } stack.push(x); } while (stack.length > 2) { const top = stack.pop(); total += top * stack[stack.length - 1]; } return String(total); },
    tests() {
      const g = rng(628);
      // the full interval DP, as an independent check
      const brute = (input) => { const a = nums(rows(input)[1]); const n = a.length; const mx = (i, j) => Math.max(...a.slice(i, j + 1)); const dp = Array.from({ length: n }, () => new Array(n).fill(0)); for (let len = 2; len <= n; len++) for (let i = 0; i + len - 1 < n; i++) { const j = i + len - 1; let best = Infinity; for (let k = i; k < j; k++) best = Math.min(best, dp[i][k] + dp[k + 1][j] + mx(i, k) * mx(k + 1, j)); dp[i][j] = best; } return dp[0][n - 1]; };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 9), 1, 9)), (i) => this.solve(i), brute, 300);
      return ['3\n6 2 4\n', '1\n5\n', '2\n3 4\n', '4\n6 2 4 3\n', arr(randArray(g, 20, 1, 9)), arr(randArray(g, 2000, 1, 10000)), arr(randArray(g, 20000, 1, 10000)), arr(many(20000, () => 10000)), arr(many(20000, (i) => (i % 10000) + 1)), arr(many(20000, (i) => 10000 - (i % 10000))), arr(many(20000, (i) => (i % 2 ? 10000 : 1))), arr(randArray(g, 20000, 1, 3))];
    }
  },

  {
    slug: 'dinner-plate-stacks',
    title: 'Dinner Plate Stacks',
    difficulty: 'hard',
    tags: ['stack', 'design', 'heap', 'simulation'],
    concept: {
      title: 'Many stacks of limited size, and a heap that knows the leftmost one with space',
      body: [
        'There is an unlimited row of stacks numbered 0, 1, 2, ..., and each stack holds at most `cap` plates. `push x` puts a plate on the **leftmost stack that is not full**. `pop` takes the plate from the top of the **rightmost non-empty stack**. `popat i` takes the plate from the top of stack `i`. Both pops report the plate, or -1 if there is none.',
        'The rightmost non-empty stack is easy: keep the stacks in a list and drop empty stacks from the end of the list. The hard part is the leftmost stack with space: after `popat` a stack in the middle gets a free place. Keep a **min-heap of the indexes of stacks that may have space**. For `push`: look at the smallest index in the heap; if that stack is full (or does not exist any more), remove it and look again; if the heap becomes empty, create a new stack at the end and put its index in the heap. For `popat i` (and `pop`), after taking a plate, put the index of that stack in the heap, because it now has space.',
        { code: 'push(x): while heap and (heap[0] >= len(stacks) or len(stacks[heap[0]]) == cap): heappop(heap)\n         if not heap: heappush(heap, len(stacks)); stacks.append([])\n         stacks[heap[0]].append(x)\npopat(i): if i < len(stacks) and stacks[i]: heappush(heap, i); return stacks[i].pop()\n          return -1\npop():    while stacks and not stacks[-1]: stacks.pop()\n          return popat(len(stacks) - 1) if stacks else -1' },
        'Entries in the heap can be out of date (a full stack, a removed stack, a duplicate). That is fine, because they are checked and removed only when they reach the top. Each operation is O(log n) amortized.'
      ]
    },
    statement: ['There is an infinite row of stacks, numbered from 0, each with the capacity `cap`. All stacks are empty. Process `n` operations. `push x` puts `x` on the leftmost stack that is not full. `pop` removes the top plate of the rightmost non-empty stack and prints it, or prints -1 if all stacks are empty. `popat i` removes the top plate of stack `i` and prints it, or prints -1 if this stack is empty. Print the result of every `pop` and `popat`.'],
    inputFormat: ['The first line has `n` and `cap`.', 'Each of the next `n` lines has an operation and a number: `push x`, `pop 0` or `popat i`.'],
    outputFormat: ['One line for every `pop` and `popat` operation.'],
    constraints: ['1 <= n <= 20000', '1 <= cap <= 20000', '0 <= x <= 10^9', '0 <= i <= 20000', 'There is at least one `pop` or `popat` operation.'],
    examples: [{ input: '15 2\npush 1\npush 2\npush 3\npush 4\npush 5\npopat 0\npush 20\npush 21\npopat 0\npopat 2\npop 0\npop 0\npop 0\npop 0\npop 0\n', note: 'Stacks after the 5 pushes: [1 2] [3 4] [5]. popat 0 gives 2. Then 20 goes to stack 0 and 21 to stack 2. popat 0 gives 20, popat 2 gives 21. The pops give 5, 4, 3, 1 and then -1.' }],
    hints: ['Keep the stacks in a list. The rightmost non-empty stack is the end of the list after removing empty stacks.', 'For the leftmost stack with space, keep a min-heap of indexes.', 'After taking a plate from a stack, put its index in the heap. Discard heap entries that are full or out of range when they reach the top.'],
    program: {
      io: ['n:int cap:int', 'ops:word[n][2]'],
      fast: true,
      includes: ['<queue>', '<functional>'],
      python: r`
        import heapq

        stacks = []
        free = []
        out = []
        for op, v in ops:
            if op == "push":
                while free and (free[0] >= len(stacks) or len(stacks[free[0]]) >= cap):
                    heapq.heappop(free)
                if not free:
                    heapq.heappush(free, len(stacks))
                    stacks.append([])
                stacks[free[0]].append(int(v))
            else:
                if op == "pop":
                    while stacks and not stacks[-1]:
                        stacks.pop()
                    idx = len(stacks) - 1
                else:
                    idx = int(v)
                if 0 <= idx < len(stacks) and stacks[idx]:
                    heapq.heappush(free, idx)
                    out.append(stacks[idx].pop())
                else:
                    out.append(-1)
        print("\n".join(map(str, out)))`,
      cpp: r`
        vector<vector<long long>> stacks;
        priority_queue<int, vector<int>, greater<int>> freeStacks;
        for (int i = 0; i < n; i++) {
            const string& op = ops[i][0];
            if (op == "push") {
                while (!freeStacks.empty() && (freeStacks.top() >= (int) stacks.size() || (long long) stacks[freeStacks.top()].size() >= cap)) freeStacks.pop();
                if (freeStacks.empty()) {
                    freeStacks.push(stacks.size());
                    stacks.push_back({});
                }
                stacks[freeStacks.top()].push_back(stoll(ops[i][1]));
            } else {
                int idx;
                if (op == "pop") {
                    while (!stacks.empty() && stacks.back().empty()) stacks.pop_back();
                    idx = (int) stacks.size() - 1;
                } else {
                    idx = stoi(ops[i][1]);
                }
                if (idx >= 0 && idx < (int) stacks.size() && !stacks[idx].empty()) {
                    freeStacks.push(idx);
                    cout << stacks[idx].back() << "\n";
                    stacks[idx].pop_back();
                } else {
                    cout << -1 << "\n";
                }
            }
        }`,
      java: r`
        List<ArrayList<Long>> stacks = new ArrayList<>();
        PriorityQueue<Integer> free = new PriorityQueue<>();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            String op = ops[i][0];
            if (op.equals("push")) {
                while (!free.isEmpty() && (free.peek() >= stacks.size() || stacks.get(free.peek()).size() >= cap)) free.poll();
                if (free.isEmpty()) {
                    free.add(stacks.size());
                    stacks.add(new ArrayList<>());
                }
                stacks.get(free.peek()).add(Long.parseLong(ops[i][1]));
            } else {
                int idx;
                if (op.equals("pop")) {
                    while (!stacks.isEmpty() && stacks.get(stacks.size() - 1).isEmpty()) stacks.remove(stacks.size() - 1);
                    idx = stacks.size() - 1;
                } else {
                    idx = Integer.parseInt(ops[i][1]);
                }
                if (idx >= 0 && idx < stacks.size() && !stacks.get(idx).isEmpty()) {
                    free.add(idx);
                    ArrayList<Long> stack = stacks.get(idx);
                    sb.append(stack.remove(stack.size() - 1)).append("\n");
                } else {
                    sb.append(-1).append("\n");
                }
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['The stacks are kept in a list, and empty stacks at the end are dropped for `pop`. A min-heap of stack indexes finds the leftmost stack with space; entries that became useless are discarded when they reach the top, and a stack index is added whenever a plate is taken from it.'], complexity: 'O(log n) per operation amortized, space O(n).' },
    solve(input) {
      const rs = rows(input); const cap = nums(rs[0])[1]; const stacks = []; const free = new MinHeap(); const out = [];
      for (const l of rs.slice(1)) {
        const [op, v] = l.split(' ');
        if (op === 'push') { while (free.size && (free.top() >= stacks.length || stacks[free.top()].length >= cap)) free.pop(); if (!free.size) { free.push(stacks.length); stacks.push([]); } stacks[free.top()].push(Number(v)); } else {
          let idx; if (op === 'pop') { while (stacks.length && !stacks[stacks.length - 1].length) stacks.pop(); idx = stacks.length - 1; } else idx = Number(v);
          if (idx >= 0 && idx < stacks.length && stacks[idx].length) { free.push(idx); out.push(stacks[idx].pop()); } else out.push(-1);
        }
      }
      return out.join('\n');
    },
    tests() {
      const g = rng(629);
      const make = (n, cap, pPush, vhi, idxRange) => { const ops = many(n - 1, () => (g() < pPush ? 'push ' + randInt(g, 0, vhi) : g() < 0.5 ? 'pop 0' : 'popat ' + randInt(g, 0, idxRange))); ops.push('pop 0'); return `${n} ${cap}\n${ops.join('\n')}\n`; };
      // a plain version: the leftmost non-full stack is found by a scan
      const brute = (input) => { const rs = rows(input); const cap = nums(rs[0])[1]; const stacks = []; const out = []; for (const l of rs.slice(1)) { const [op, v] = l.split(' '); if (op === 'push') { let i = 0; while (i < stacks.length && stacks[i].length >= cap) i++; if (i === stacks.length) stacks.push([]); stacks[i].push(Number(v)); } else { let idx; if (op === 'pop') { idx = stacks.length - 1; while (idx >= 0 && !stacks[idx].length) idx--; } else idx = Number(v); out.push(idx >= 0 && idx < stacks.length && stacks[idx].length ? stacks[idx].pop() : -1); } } return out.join('\n'); };
      crossCheck(() => make(randInt(g, 2, 40), randInt(g, 1, 4), 0.6, 9, 6), (i) => this.solve(i), brute, 500);
      return ['15 2\npush 1\npush 2\npush 3\npush 4\npush 5\npopat 0\npush 20\npush 21\npopat 0\npopat 2\npop 0\npop 0\npop 0\npop 0\npop 0\n', '2 1\npush 5\npopat 3\n', '3 3\npop 0\npopat 0\npop 0\n', make(20, 3, 0.6, 9, 6), make(300, 4, 0.6, 1000, 80), make(2000, 5, 0.6, 1000000000, 400), make(20000, 1, 0.6, 1000000000, 5000), make(20000, 3, 0.6, 1000000000, 3000), make(20000, 100, 0.6, 1000000000, 150), make(20000, 20000, 0.6, 1000000000, 5), make(20000, 2, 0.8, 1000000000, 8000), `20000 1\n${many(10000, (i) => `push ${i}`).concat(many(10000, (i) => `popat ${(i * 7919) % 10000}`)).join('\n')}\n`];
    }
  }
];
