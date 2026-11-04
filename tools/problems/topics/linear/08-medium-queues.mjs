import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };

export default [
  {
    slug: 'sliding-window-maximum',
    title: 'Maximum of Every Window',
    difficulty: 'medium',
    tags: ['deque', 'monotonic-queue', 'sliding-window'],
    concept: {
      title: 'A deque that keeps only the candidates for the maximum',
      body: [
        'For every window of `k` consecutive elements you want its **maximum**. Looking at all `k` elements of each window costs `n * k`. A **deque** (double-ended queue: you can add and remove at **both** ends) does it in O(n).',
        'Keep in the deque the **indexes** of the elements that can still become the maximum of a window, in order of position, with **decreasing values** from the front to the back. When a new element `a[i]` arrives, **remove from the back** every element that is not larger than it: they are older and smaller, so they can never be the maximum again. Then add `i` at the back. Also **remove from the front** an index that has left the window (`i - k`). The front is always the maximum of the current window.',
        { code: 'dq = deque()                       # indexes, values decreasing\nfor i, x in enumerate(a):\n    while dq and a[dq[-1]] <= x: dq.pop()       # smaller older elements are useless\n    dq.append(i)\n    if dq[0] <= i - k: dq.popleft()             # the front left the window\n    if i >= k - 1: out.append(a[dq[0]])' },
        'This structure is called a **monotonic queue**. Every index enters and leaves once, so the work is O(n).'
      ]
    },
    statement: ['Given an array of `n` integers and a window size `k`, print the maximum of every window of `k` consecutive elements (there are `n - k + 1` windows), from the left to the right.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `n - k + 1` numbers separated by spaces.'],
    constraints: ['1 <= k <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '8 3\n1 3 -1 -3 5 3 6 7\n', note: 'The windows have the maximums 3 3 5 5 6 7.' }],
    hints: ['Keep a deque of indexes whose values decrease from the front to the back.', 'Before adding a new index, remove the indexes at the back whose values are not larger.', 'Remove the front index when it is no longer inside the window; the front is the maximum.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<deque>'],
      python: r`
        from collections import deque
        dq = deque()
        out = []
        for i in range(n):
            while dq and a[dq[-1]] <= a[i]:
                dq.pop()
            dq.append(i)
            if dq[0] <= i - k:
                dq.popleft()
            if i >= k - 1:
                out.append(a[dq[0]])
        print(*out)`,
      cpp: r`
        deque<int> dq;
        bool first = true;
        for (int i = 0; i < n; i++) {
            while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
            dq.push_back(i);
            if (dq.front() <= i - k) dq.pop_front();
            if (i >= k - 1) {
                if (!first) cout << " ";
                cout << a[dq.front()];
                first = false;
            }
        }
        cout << "\n";`,
      java: r`
        Deque<Integer> dq = new ArrayDeque<>();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();
            dq.addLast(i);
            if (dq.peekFirst() <= i - k) dq.pollFirst();
            if (i >= k - 1) sb.append(sb.length() > 0 ? " " : "").append(a[dq.peekFirst()]);
        }
        System.out.println(sb);`
    },
    solution: { explanation: ['The deque holds the indexes of the possible maximums with decreasing values. Smaller older elements are removed at the back, expired indexes at the front, and the front is the maximum of the window.'], complexity: 'Time O(n), space O(k).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]); const out = []; for (let i = 0; i + k <= a.length; i++) out.push(Math.max(...a.slice(i, i + k))); return out.join(' '); },
    tests() { const g = rng(581); const make = (n, k, lo, hi) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`; return ['8 3\n1 3 -1 -3 5 3 6 7\n', '1 1\n5\n', '3 3\n1 2 3\n', '3 1\n3 1 2\n', make(20, 4, -9, 9), make(2000, 50, -1000, 1000), `20000 7\n${many(20000, (i) => i).join(' ')}\n`, `20000 7\n${many(20000, (i) => 20000 - i).join(' ')}\n`, make(20000, 1000, -1000000000, 1000000000), make(20000, 20000, -1000000000, 1000000000), make(20000, 3, 0, 2)]; }
  },

  {
    slug: 'circular-deque-operations',
    title: 'A Circular Double-Ended Queue',
    difficulty: 'medium',
    tags: ['deque', 'design', 'circular-buffer'],
    concept: {
      title: 'A circular buffer that grows in both directions',
      body: [
        'A **deque** lets you add and remove at the **front** and at the **back**. With a fixed capacity `k`, store it in a circular array with `head` (the index of the front item) and `size`. Adding at the **front** moves `head` one step **back** (with wrap-around), adding at the back writes to `(head + size) % k`.',
        { code: 'insertFront x:  if size == k: fail; head = (head - 1 + k) % k; buf[head] = x; size += 1\ninsertLast x:   if size == k: fail; buf[(head + size) % k] = x; size += 1\ndeleteFront:    if size == 0: fail; head = (head + 1) % k; size -= 1\ndeleteLast:     if size == 0: fail; size -= 1\ngetFront:       buf[head]\ngetRear:        buf[(head + size - 1) % k]' },
        'Add `k` before taking the remainder when moving backwards (`(head - 1 + k) % k`): in C++ and Java the remainder of a negative number is negative. This structure is the heart of `collections.deque`, `std::deque` and `ArrayDeque`.'
      ]
    },
    statement: ['Implement a deque that holds at most `k` numbers. Process `n` operations (each line has an operation and a number; the number is only used by `insertFront` and `insertLast`). `insertFront x` and `insertLast x` print `yes` if the number was added, and `no` if the deque was full. `deleteFront` and `deleteLast` print `yes` if an item was removed and `no` if the deque was empty. `getFront` and `getRear` print the first and the last number, or -1 if the deque is empty. `isEmpty` and `isFull` print `yes` or `no`. Print one line for every operation.'],
    inputFormat: ['The first line has `n` and `k`.', 'Each of the next `n` lines has an operation and a number.'],
    outputFormat: ['One line for every operation.'],
    constraints: ['1 <= n <= 20000', '1 <= k <= 1000', '-10^9 <= x <= 10^9'],
    examples: [{ input: '6 2\ninsertLast 1\ninsertFront 2\ninsertFront 3\ngetFront 0\ngetRear 0\nisFull 0\n', note: 'The deque is 2 1: the third insert fails (no), the front is 2, the rear is 1, and it is full.' }],
    hints: ['Use a circular array with `head` and `size`.', 'Inserting at the front moves `head` back by one, with wrap-around.', 'Add `k` before `%` when going backwards.'],
    program: {
      io: ['n:int k:int', 'ops:word[n][2]'],
      fast: true,
      python: r`
        buf = [0] * k
        head = 0
        size = 0
        out = []
        for op, val in ops:
            if op == "insertFront":
                if size == k:
                    out.append("no")
                else:
                    head = (head - 1 + k) % k
                    buf[head] = int(val)
                    size += 1
                    out.append("yes")
            elif op == "insertLast":
                if size == k:
                    out.append("no")
                else:
                    buf[(head + size) % k] = int(val)
                    size += 1
                    out.append("yes")
            elif op == "deleteFront":
                if size == 0:
                    out.append("no")
                else:
                    head = (head + 1) % k
                    size -= 1
                    out.append("yes")
            elif op == "deleteLast":
                if size == 0:
                    out.append("no")
                else:
                    size -= 1
                    out.append("yes")
            elif op == "getFront":
                out.append(buf[head] if size > 0 else -1)
            elif op == "getRear":
                out.append(buf[(head + size - 1) % k] if size > 0 else -1)
            elif op == "isEmpty":
                out.append("yes" if size == 0 else "no")
            else:
                out.append("yes" if size == k else "no")
        print("\n".join(map(str, out)))`,
      cpp: r`
        vector<long long> buf(k, 0);
        int head = 0, size = 0;
        for (int i = 0; i < n; i++) {
            const string& op = ops[i][0];
            if (op == "insertFront") {
                if (size == k) {
                    cout << "no\n";
                } else {
                    head = (head - 1 + k) % k;
                    buf[head] = stoll(ops[i][1]);
                    size++;
                    cout << "yes\n";
                }
            } else if (op == "insertLast") {
                if (size == k) {
                    cout << "no\n";
                } else {
                    buf[(head + size) % k] = stoll(ops[i][1]);
                    size++;
                    cout << "yes\n";
                }
            } else if (op == "deleteFront") {
                if (size == 0) {
                    cout << "no\n";
                } else {
                    head = (head + 1) % k;
                    size--;
                    cout << "yes\n";
                }
            } else if (op == "deleteLast") {
                if (size == 0) {
                    cout << "no\n";
                } else {
                    size--;
                    cout << "yes\n";
                }
            } else if (op == "getFront") {
                cout << (size > 0 ? buf[head] : -1) << "\n";
            } else if (op == "getRear") {
                cout << (size > 0 ? buf[(head + size - 1) % k] : -1) << "\n";
            } else if (op == "isEmpty") {
                cout << (size == 0 ? "yes" : "no") << "\n";
            } else {
                cout << (size == k ? "yes" : "no") << "\n";
            }
        }`,
      java: r`
        int cap = (int) k;
        long[] buf = new long[cap];
        int head = 0, size = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            String op = ops[i][0];
            if (op.equals("insertFront")) {
                if (size == cap) {
                    sb.append("no\n");
                } else {
                    head = (head - 1 + cap) % cap;
                    buf[head] = Long.parseLong(ops[i][1]);
                    size++;
                    sb.append("yes\n");
                }
            } else if (op.equals("insertLast")) {
                if (size == cap) {
                    sb.append("no\n");
                } else {
                    buf[(head + size) % cap] = Long.parseLong(ops[i][1]);
                    size++;
                    sb.append("yes\n");
                }
            } else if (op.equals("deleteFront")) {
                if (size == 0) {
                    sb.append("no\n");
                } else {
                    head = (head + 1) % cap;
                    size--;
                    sb.append("yes\n");
                }
            } else if (op.equals("deleteLast")) {
                if (size == 0) {
                    sb.append("no\n");
                } else {
                    size--;
                    sb.append("yes\n");
                }
            } else if (op.equals("getFront")) {
                sb.append(size > 0 ? buf[head] : -1).append("\n");
            } else if (op.equals("getRear")) {
                sb.append(size > 0 ? buf[(head + size - 1) % cap] : -1).append("\n");
            } else if (op.equals("isEmpty")) {
                sb.append(size == 0 ? "yes" : "no").append("\n");
            } else {
                sb.append(size == cap ? "yes" : "no").append("\n");
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['A circular array with `head` and `size` holds the deque. Inserting at the front moves `head` backwards with wrap-around; everything else works like the circular queue.'], complexity: 'O(1) per operation, space O(k).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const d = []; const out = []; for (const l of rs.slice(1)) { const [op, v] = l.split(' '); if (op === 'insertFront') { if (d.length === k) out.push('no'); else { d.unshift(Number(v)); out.push('yes'); } } else if (op === 'insertLast') { if (d.length === k) out.push('no'); else { d.push(Number(v)); out.push('yes'); } } else if (op === 'deleteFront') { if (!d.length) out.push('no'); else { d.shift(); out.push('yes'); } } else if (op === 'deleteLast') { if (!d.length) out.push('no'); else { d.pop(); out.push('yes'); } } else if (op === 'getFront') out.push(d.length ? d[0] : -1); else if (op === 'getRear') out.push(d.length ? d[d.length - 1] : -1); else if (op === 'isEmpty') out.push(d.length === 0 ? 'yes' : 'no'); else out.push(d.length === k ? 'yes' : 'no'); } return out.join('\n'); },
    tests() { const g = rng(582); const NAMES = ['insertFront', 'insertLast', 'deleteFront', 'deleteLast', 'getFront', 'getRear', 'isEmpty', 'isFull']; const make = (n, k, pIns) => { const ops = many(n, () => { const x = g(); if (x < pIns) return `${NAMES[randInt(g, 0, 1)]} ${randInt(g, -1000000000, 1000000000)}`; return `${NAMES[randInt(g, 2, 7)]} 0`; }); return `${n} ${k}\n${ops.join('\n')}\n`; }; return ['6 2\ninsertLast 1\ninsertFront 2\ninsertFront 3\ngetFront 0\ngetRear 0\nisFull 0\n', '3 1\ngetFront 0\ngetRear 0\nisEmpty 0\n', make(20, 3, 0.5), make(300, 5, 0.5), make(20000, 1000, 0.5), make(20000, 7, 0.45), make(20000, 1, 0.5), make(20000, 1000, 0.7)]; }
  },

  {
    slug: 'jump-game-with-scores',
    title: 'The Best Score With Jumps of Up to k',
    difficulty: 'medium',
    tags: ['deque', 'dynamic-programming', 'monotonic-queue'],
    concept: {
      title: 'The best previous value in a sliding window',
      body: [
        'You stand at index 0 and want to reach index `n - 1`. From index `i` you can jump to any index from `i + 1` to `i + k`. Every index you land on adds its value to your score (the first one counts too), and you want the **largest total**. Let `dp[i]` be the best score for reaching `i`. Then `dp[i] = a[i] + max(dp[j])` over the previous `k` positions `j = i - k, ..., i - 1`.',
        'Computing the maximum of the last `k` values for every `i` costs `k`. But this is exactly the **sliding window maximum**: keep a deque of indexes with **decreasing `dp` values**, remove the front when it is more than `k` positions away, and the front gives the maximum for `dp[i]`.',
        { code: 'dp[0] = a[0]; dq = [0]\nfor i in range(1, n):\n    while dq[0] < i - k: dq.popleft()           # too far to jump from\n    dp[i] = a[i] + dp[dq[0]]\n    while dq and dp[dq[-1]] <= dp[i]: dq.pop()   # keep dp decreasing\n    dq.append(i)' },
        'The scores can be negative, so you may have to take some bad cells; you always take the best path. Dynamic programming plus a monotonic queue turns an O(n * k) solution into O(n).'
      ]
    },
    statement: ['You are at index 0 of an array of `n` integers (positive or negative) and want to reach index `n - 1`. In one jump you move forward by 1 to `k` places. Your score is the sum of the values of all indexes you stand on, including the first and the last one. Print the largest possible score.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the largest score.'],
    constraints: ['1 <= k <= n <= 20000', '-10^4 <= each number <= 10^4'],
    examples: [{ input: '6 2\n1 -1 -2 4 -7 3\n', note: 'The path 1, -1, 4, 3 (indexes 0, 1, 3, 5) scores 7.' }],
    hints: ['Let `dp[i]` be the best score that ends at index i.', '`dp[i]` is `a[i]` plus the best `dp` of the previous `k` indexes.', 'Get that maximum with a deque of indexes with decreasing `dp` values.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<deque>'],
      python: r`
        from collections import deque
        dp = [0] * n
        dp[0] = a[0]
        dq = deque([0])
        for i in range(1, n):
            while dq[0] < i - k:
                dq.popleft()
            dp[i] = a[i] + dp[dq[0]]
            while dq and dp[dq[-1]] <= dp[i]:
                dq.pop()
            dq.append(i)
        print(dp[n - 1])`,
      cpp: r`
        vector<long long> dp(n, 0);
        dp[0] = a[0];
        deque<int> dq;
        dq.push_back(0);
        for (int i = 1; i < n; i++) {
            while (dq.front() < i - k) dq.pop_front();
            dp[i] = a[i] + dp[dq.front()];
            while (!dq.empty() && dp[dq.back()] <= dp[i]) dq.pop_back();
            dq.push_back(i);
        }
        cout << dp[n - 1] << "\n";`,
      java: r`
        long[] dp = new long[(int) n];
        dp[0] = a[0];
        Deque<Integer> dq = new ArrayDeque<>();
        dq.addLast(0);
        for (int i = 1; i < n; i++) {
            while (dq.peekFirst() < i - k) dq.pollFirst();
            dp[i] = a[i] + dp[dq.peekFirst()];
            while (!dq.isEmpty() && dp[dq.peekLast()] <= dp[i]) dq.pollLast();
            dq.addLast(i);
        }
        System.out.println(dp[(int) n - 1]);`
    },
    solution: { explanation: ['`dp[i] = a[i] + max(dp[i-k..i-1])`. The maximum of the sliding window of `dp` values comes from a monotonic deque, so every step takes constant time.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const rs = rows(input); return String(fastJump(nums(rs[1]), nums(rs[0])[1])); },
    tests() { const g = rng(583); const make = (n, k, lo, hi) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`; for (let t = 0; t < 200; t++) { const n = randInt(g, 1, 12), k = randInt(g, 1, n); const a = randArray(g, n, -9, 9); const input = `${n} ${k}\n${a.join(' ')}\n`; const dp = new Array(n).fill(-Infinity); dp[0] = a[0]; for (let i = 1; i < n; i++) { let best = -Infinity; for (let j = Math.max(0, i - k); j < i; j++) best = Math.max(best, dp[j]); dp[i] = a[i] + best; } if (String(dp[n - 1]) !== this.solve(input)) throw new Error('jump reference differs'); } return ['6 2\n1 -1 -2 4 -7 3\n', '1 1\n5\n', '3 2\n10 -5 -2\n', '5 5\n-1 -2 -3 -4 -5\n', make(20, 4, -9, 9), make(2000, 30, -10000, 10000), make(20000, 7, -10000, 10000), make(20000, 20000, -10000, 10000), make(20000, 1, -10000, 10000), make(20000, 500, -10000, -1), make(20000, 100, 0, 10000)]; }
  },

  {
    slug: 'longest-subarray-with-limit',
    title: 'Longest Block With a Small Spread',
    difficulty: 'medium',
    tags: ['deque', 'sliding-window', 'monotonic-queue'],
    concept: {
      title: 'Two monotonic queues: the window maximum and the window minimum',
      body: [
        'Find the longest block of consecutive elements where the **largest minus the smallest element is at most `limit`**. Use a sliding window `[left, right]` that you extend on the right and shrink on the left when it becomes invalid. To check validity you need the current **maximum and minimum** of the window quickly, which is what the monotonic queue gives.',
        'Keep **two deques**: one with decreasing values (its front is the window maximum) and one with increasing values (its front is the window minimum). After adding `a[right]` to both, while `max - min > limit`, move `left` forward and remove the front of a deque if it was the element that left.',
        { code: 'for right, x in enumerate(a):\n    while maxq and maxq[-1] < x: maxq.pop()\n    maxq.append(x)\n    while minq and minq[-1] > x: minq.pop()\n    minq.append(x)\n    while maxq[0] - minq[0] > limit:         # the window is too wide: shrink\n        if maxq[0] == a[left]: maxq.popleft()\n        if minq[0] == a[left]: minq.popleft()\n        left += 1\n    best = max(best, right - left + 1)' },
        'The deques store values (not indexes) here, and the check `maxq[0] == a[left]` tells whether the leaving element was the current maximum or minimum. Equal values work, because a value is removed from the back only when it is **strictly** smaller (larger) than the new one.'
      ]
    },
    statement: ['Given an array of integers and a number `limit`, find the length of the longest block of consecutive elements in which the difference between the largest and the smallest element is at most `limit`.'],
    inputFormat: ['The first line has `n` and `limit`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the length.'],
    constraints: ['1 <= n <= 20000', '0 <= limit <= 10^9', '1 <= each number <= 10^9'],
    examples: [{ input: '4 4\n8 2 4 7\n', note: 'The block 2 4 has a difference of 2; 2 4 7 has 5, which is too much. The longest valid block is 2 4 (length 2).' }],
    hints: ['Use a sliding window and two deques: one for the maximum, one for the minimum.', 'After adding the new element, shrink the window while `max - min > limit`.', 'When the left element leaves, remove it from the front of a deque if it is at the front.'],
    program: {
      io: ['n:int limit:int', 'a:int[n]'],
      fast: true,
      includes: ['<deque>', '<algorithm>'],
      python: r`
        from collections import deque
        maxq = deque()
        minq = deque()
        left = 0
        best = 0
        for right in range(n):
            x = a[right]
            while maxq and maxq[-1] < x:
                maxq.pop()
            maxq.append(x)
            while minq and minq[-1] > x:
                minq.pop()
            minq.append(x)
            while maxq[0] - minq[0] > limit:
                if maxq[0] == a[left]:
                    maxq.popleft()
                if minq[0] == a[left]:
                    minq.popleft()
                left += 1
            best = max(best, right - left + 1)
        print(best)`,
      cpp: r`
        deque<long long> maxq, minq;
        int left = 0, best = 0;
        for (int right = 0; right < n; right++) {
            long long x = a[right];
            while (!maxq.empty() && maxq.back() < x) maxq.pop_back();
            maxq.push_back(x);
            while (!minq.empty() && minq.back() > x) minq.pop_back();
            minq.push_back(x);
            while (maxq.front() - minq.front() > limit) {
                if (maxq.front() == a[left]) maxq.pop_front();
                if (minq.front() == a[left]) minq.pop_front();
                left++;
            }
            best = max(best, right - left + 1);
        }
        cout << best << "\n";`,
      java: r`
        Deque<Long> maxq = new ArrayDeque<>(), minq = new ArrayDeque<>();
        int left = 0, best = 0;
        for (int right = 0; right < n; right++) {
            long x = a[right];
            while (!maxq.isEmpty() && maxq.peekLast() < x) maxq.pollLast();
            maxq.addLast(x);
            while (!minq.isEmpty() && minq.peekLast() > x) minq.pollLast();
            minq.addLast(x);
            while (maxq.peekFirst() - minq.peekFirst() > limit) {
                if (maxq.peekFirst() == a[left]) maxq.pollFirst();
                if (minq.peekFirst() == a[left]) minq.pollFirst();
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The window moves right; two monotonic deques give its maximum and minimum. While the spread is too large, the left end moves right and the leaving element is removed from the fronts.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const rs = rows(input); return String(fastLimit(nums(rs[1]), nums(rs[0])[1])); },
    tests() { const g = rng(584); const make = (n, limit, lo, hi) => `${n} ${limit}\n${randArray(g, n, lo, hi).join(' ')}\n`; for (let t = 0; t < 200; t++) { const n = randInt(g, 1, 12); const a = randArray(g, n, 1, 9); const limit = randInt(g, 0, 8); let best = 0; for (let i = 0; i < n; i++) for (let j = i; j < n; j++) { const w = a.slice(i, j + 1); if (Math.max(...w) - Math.min(...w) <= limit) best = Math.max(best, j - i + 1); } if (String(best) !== this.solve(`${n} ${limit}\n${a.join(' ')}\n`)) throw new Error('limit reference differs'); } return ['4 4\n8 2 4 7\n', '1 0\n5\n', '5 0\n3 3 3 1 1\n', '3 1000000000\n1 1000000000 5\n', make(20, 3, 1, 9), make(2000, 20, 1, 100), make(20000, 1000, 1, 100000), make(20000, 1000000000, 1, 1000000000), make(20000, 0, 1, 3), make(20000, 5, 1, 1000000000), `20000 10\n${many(20000, (i) => 1 + (i % 11)).join(' ')}\n`]; }
  },

  {
    slug: 'people-seen-in-a-queue',
    title: 'How Many People Can Each Person See?',
    difficulty: 'medium',
    tags: ['stack', 'monotonic-stack', 'arrays'],
    concept: {
      title: 'Looking right, you see a person if everyone between is shorter',
      body: [
        'People of different heights (all different) stand in a line. Person `i` can see person `j > i` to the right if **everybody between them is shorter than both** `i` and `j`. For every person count how many people they can see.',
        'Process the line **from the right** with a stack of heights that is **decreasing from the bottom to the top**: it holds the people that are visible "so far" from the current position. For person `i`: every person on the stack who is **shorter** than `i` is seen by `i` (nobody between them is taller than both); pop them and count them. Then, if the stack is not empty, the person now on top is **taller** than `i` and is also seen (but nobody behind him can be seen). Push `i`.',
        { code: 'for i in range(n - 1, -1, -1):\n    count = 0\n    while stack and stack[-1] < h[i]:\n        stack.pop(); count += 1          # seen, and hidden by i for everybody to the left\n    if stack: count += 1                 # the first taller person is seen too\n    res[i] = count\n    stack.append(h[i])' },
        'The popped people can never be seen by anyone to the left of `i`, because `i` is taller and stands in front of them, so removing them is safe.'
      ]
    },
    statement: ['`n` people with different heights stand in a line. Person `i` can see person `j > i` (to the right) if every person between them is shorter than both of them. Print for every person the number of people to the right that he or she can see.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` heights from the left to the right.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    constraints: ['1 <= n <= 20000', '1 <= each height <= 10^9', 'All heights are different.'],
    examples: [{ input: '6\n10 6 8 5 11 9\n', note: 'The counts are 3 1 2 1 1 0.' }],
    hints: ['Go from the right and keep a stack of heights that decrease towards the top.', 'Pop and count all people on the stack who are shorter than the current one.', 'If the stack is still not empty, the person on top is taller and is also seen: add one more.'],
    program: {
      io: ['n:int', 'h:int[n]'],
      fast: true,
      python: r`
        res = [0] * n
        stack = []
        for i in range(n - 1, -1, -1):
            count = 0
            while stack and stack[-1] < h[i]:
                stack.pop()
                count += 1
            if stack:
                count += 1
            res[i] = count
            stack.append(h[i])
        print(*res)`,
      cpp: r`
        vector<int> res(n, 0);
        vector<long long> stack;
        for (int i = n - 1; i >= 0; i--) {
            int count = 0;
            while (!stack.empty() && stack.back() < h[i]) {
                stack.pop_back();
                count++;
            }
            if (!stack.empty()) count++;
            res[i] = count;
            stack.push_back(h[i]);
        }
        for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        int[] res = new int[(int) n];
        Deque<Long> stack = new ArrayDeque<>();
        for (int i = (int) n - 1; i >= 0; i--) {
            int count = 0;
            while (!stack.isEmpty() && stack.peek() < h[i]) {
                stack.pop();
                count++;
            }
            if (!stack.isEmpty()) count++;
            res[i] = count;
            stack.push(h[i]);
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(res[i]).append(i + 1 < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['From the right, the stack holds the people that can still be seen. A taller person hides and removes the shorter ones (each of them is seen once), and the first taller person behind is seen too.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const h = nums(rows(input)[1]); return h.map((x, i) => { let c = 0, mx = 0; for (let j = i + 1; j < h.length; j++) { if (h[j] > mx) { c++; mx = h[j]; } if (mx > x) break; } return c; }).join(' '); },
    tests() { const g = rng(585); const distinct = (n, hi) => arr(shuffle(g, randDistinct(g, n, 1, hi))); return ['6\n10 6 8 5 11 9\n', '1\n5\n', '3\n1 2 3\n', '3\n3 2 1\n', distinct(20, 100), distinct(2000, 1000000), distinct(20000, 1000000000), arr(many(20000, (i) => i + 1)), arr(many(20000, (i) => 20000 - i)), arr(many(20000, (i) => (i % 2 ? 100000 - i : i + 1)))]; }
  },

  {
    slug: 'hit-counter',
    title: 'Count the Hits of the Last 5 Minutes',
    difficulty: 'medium',
    tags: ['queue', 'design', 'sliding-window'],
    concept: {
      title: 'A queue of hit times; old hits leave at the front',
      body: [
        'A website records **hits** at times given in seconds, and wants to know how many hits happened in the last 5 minutes (300 seconds), including the current second. The time of the operations never goes back. Store the hit times in a **queue**. For a `count` at time `t`, remove from the front all hits that happened at `t - 300` or earlier, then the size of the queue is the answer.',
        { code: 'hit t:    queue.append(t)\ncount t:  while queue and queue[0] <= t - 300:\n              queue.popleft()               # too old\n          answer = len(queue)' },
        'Because the times are non-decreasing, the oldest hit is always at the front. If many hits happen in the same second you can store pairs `(time, number of hits)` to save memory, but a plain queue is enough here.'
      ]
    },
    statement: ['A hit counter receives `n` operations in order of non-decreasing time. `hit t` records a hit at second `t`. `count t` asks how many hits happened in the last 300 seconds, that is at the seconds `t - 299, ..., t`. Each line has an operation and the time. Print the answer of every `count`.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has an operation and a time.'],
    outputFormat: ['One line for every `count` operation.'],
    constraints: ['1 <= n <= 20000', '1 <= t <= 10^9, non-decreasing', 'There is at least one `count` operation.'],
    examples: [{ input: '6\nhit 1\nhit 2\nhit 3\ncount 4\nhit 300\ncount 300\n', note: 'At time 4: 3 hits. At time 300 the range is 1..300: 4 hits... the hit at 1 is still inside, so 4 hits.' }],
    hints: ['Keep the times of the hits in a queue.', 'For a `count` at time `t`, remove the hits with time at most `t - 300` from the front.', 'The number of remaining hits is the answer.'],
    program: {
      io: ['n:int', 'ops:word[n][2]'],
      fast: true,
      python: r`
        from collections import deque
        queue = deque()
        out = []
        for op, val in ops:
            t = int(val)
            if op == "hit":
                queue.append(t)
            else:
                while queue and queue[0] <= t - 300:
                    queue.popleft()
                out.append(len(queue))
        print("\n".join(map(str, out)))`,
      cpp: r`
        deque<long long> queue;
        for (int i = 0; i < n; i++) {
            long long t = stoll(ops[i][1]);
            if (ops[i][0] == "hit") {
                queue.push_back(t);
            } else {
                while (!queue.empty() && queue.front() <= t - 300) queue.pop_front();
                cout << queue.size() << "\n";
            }
        }`,
      includes: ['<deque>'],
      java: r`
        Deque<Long> queue = new ArrayDeque<>();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            long t = Long.parseLong(ops[i][1]);
            if (ops[i][0].equals("hit")) {
                queue.addLast(t);
            } else {
                while (!queue.isEmpty() && queue.peekFirst() <= t - 300) queue.pollFirst();
                sb.append(queue.size()).append("\n");
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['The queue holds the times of the hits. Before answering a `count`, hits older than the 300-second window are removed from the front.'], complexity: 'Amortised O(1) per operation, space O(n).' },
    solve(input) { const ops = rows(input).slice(1).map((l) => l.split(' ')); const hits = []; const out = []; for (const [op, v] of ops) { const t = Number(v); if (op === 'hit') hits.push(t); else out.push(hits.filter((x) => x > t - 300).length); } return out.join('\n'); },
    tests() { const g = rng(586); const make = (n, step, pHit) => { let t = randInt(g, 1, 10); const ops = []; for (let i = 0; i < n; i++) { t += randInt(g, 0, step); ops.push(`${i === n - 1 || g() >= pHit ? 'count' : 'hit'} ${t}`); } return `${n}\n${ops.join('\n')}\n`; }; return ['6\nhit 1\nhit 2\nhit 3\ncount 4\nhit 300\ncount 300\n', '1\ncount 5\n', '3\nhit 1\nhit 301\ncount 301\n', make(20, 100, 0.6), make(300, 50, 0.6), make(20000, 3, 0.7), make(20000, 100, 0.7), make(20000, 0, 0.9), make(20000, 1000, 0.5)]; }
  },

  {
    slug: 'dota-senate',
    title: 'The Senate Vote',
    difficulty: 'medium',
    tags: ['queue', 'simulation', 'greedy'],
    concept: {
      title: 'Two queues of positions and a clever way to come back',
      body: [
        'Senators of two parties, `R` and `D`, sit in a row. In each round, every senator **in order of position** can ban one opponent from the voting (the banned senator loses the right to speak for the rest of the game). When all remaining senators belong to one party, that party wins. A senator always bans the **next opponent that would speak**, which is the most dangerous one.',
        'Keep two **queues** with the positions of the senators of each party. In every step compare the **fronts**: the senator with the **smaller position** speaks first, bans the other (who is removed from his queue) and then **joins the back of his own queue with the position increased by `n`**, so that in the next round he speaks after everyone who has not yet spoken in this round.',
        { code: 'while qr and qd:\n    r, d = qr.popleft(), qd.popleft()\n    if r < d: qr.append(r + n)       # R is first: D is banned\n    else:     qd.append(d + n)\nwinner = "Radiant" if qr else "Dire"' },
        'The same trick of adding `n` simulates all rounds with one loop. R stands for the party called Radiant, D for the party called Dire.'
      ]
    },
    statement: ['Senators of the parties `R` (Radiant) and `D` (Dire) sit in a row. The voting has rounds; in each round every senator who has not been banned acts in the order of the row. Acting, a senator bans one senator of the other party: the banned senator can no longer act in this round or in later rounds. After a round, the senators that are left act again in the same order. The game ends when all the remaining senators are of one party; that party wins. Every senator plays the best way: he bans the next opponent who would act. Print `Radiant` or `Dire`.'],
    inputFormat: ['A single word of the letters `R` and `D`.'],
    outputFormat: ['Print the winner.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'RDD\n', note: 'The first R bans the first D; the remaining D bans R: Dire wins.' }],
    hints: ['Keep one queue of positions per party.', 'Compare the fronts: the smaller position acts first and bans the other senator.', 'The winner of the comparison comes back at the end of his queue with its position increased by `n`.'],
    program: {
      io: ['s:word'],
      includes: ['<queue>'],
      python: r`
        from collections import deque
        n = len(s)
        qr = deque(i for i, ch in enumerate(s) if ch == "R")
        qd = deque(i for i, ch in enumerate(s) if ch == "D")
        while qr and qd:
            r, d = qr.popleft(), qd.popleft()
            if r < d:
                qr.append(r + n)
            else:
                qd.append(d + n)
        print("Radiant" if qr else "Dire")`,
      cpp: r`
        int n = s.size();
        queue<int> qr, qd;
        for (int i = 0; i < n; i++) {
            if (s[i] == 'R') qr.push(i);
            else qd.push(i);
        }
        while (!qr.empty() && !qd.empty()) {
            int r = qr.front(), d = qd.front();
            qr.pop();
            qd.pop();
            if (r < d) qr.push(r + n);
            else qd.push(d + n);
        }
        cout << (!qr.empty() ? "Radiant" : "Dire") << "\n";`,
      java: r`
        int n = s.length();
        Deque<Integer> qr = new ArrayDeque<>(), qd = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            if (s.charAt(i) == 'R') qr.addLast(i);
            else qd.addLast(i);
        }
        while (!qr.isEmpty() && !qd.isEmpty()) {
            int r = qr.pollFirst(), d = qd.pollFirst();
            if (r < d) qr.addLast(r + n);
            else qd.addLast(d + n);
        }
        System.out.println(!qr.isEmpty() ? "Radiant" : "Dire");`
    },
    solution: { explanation: ['In each comparison the senator with the smaller position bans the other and is queued again for the next round (position + n). The party that still has senators wins.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const s = input.trim(); const n = s.length; const qr = [], qd = []; for (let i = 0; i < n; i++) (s[i] === 'R' ? qr : qd).push(i); let hr = 0, hd = 0; while (hr < qr.length && hd < qd.length) { const r1 = qr[hr++], d1 = qd[hd++]; if (r1 < d1) qr.push(r1 + n); else qd.push(d1 + n); } return hr < qr.length ? 'Radiant' : 'Dire'; },
    tests() { const g = rng(587); const mix = (n, p) => `${many(n, () => (g() < p ? 'R' : 'D')).join('')}\n`; const brute = (input) => { const s = input.trim(); const n = s.length; const banned = new Array(n).fill(false); let r = 0, d = 0; for (const c of s) (c === 'R' ? r++ : d++); let i = 0; while (r > 0 && d > 0) { if (!banned[i]) { let j = (i + 1) % n; while (banned[j] || s[j] === s[i]) j = (j + 1) % n; banned[j] = true; if (s[j] === 'R') r--; else d--; } i = (i + 1) % n; } return r > 0 ? 'Radiant' : 'Dire'; }; crossCheck(() => mix(randInt(g, 1, 14), 0.5), (i) => this.solve(i), brute); return ['RDD\n', 'RD\n', 'R\n', 'D\n', 'DDRRR\n', mix(30, 0.5), mix(2000, 0.5), mix(20000, 0.5), mix(20000, 0.6), mix(20000, 0.49), `${'R'.repeat(10000)}${'D'.repeat(10000)}\n`, `${'D'.repeat(10000)}${'R'.repeat(10000)}\n`, `${'RD'.repeat(10000)}\n`]; }
  },

  {
    slug: 'reveal-cards-in-increasing-order',
    title: 'Arrange the Deck to Reveal Cards in Order',
    difficulty: 'medium',
    tags: ['queue', 'simulation', 'sorting'],
    concept: {
      title: 'Simulate with positions, not with cards',
      body: [
        'A deck of cards is revealed like this: take the top card and show it; if cards remain, move the next top card to the **bottom**; repeat. You may choose the **order of the deck**, and you want the cards to be revealed in **increasing** order. What order of the deck do you need?',
        'Think in **positions**. Simulate the revealing process on a queue of positions `0, 1, ..., n - 1` (the position of a card in the deck). The first position that comes out is the position where the **smallest** card must be; the second position that comes out gets the second smallest card, and so on. Between two reveals, the next position goes from the front to the back of the queue.',
        { code: 'queue = deque(range(n))\nres = [0] * n\nfor card in sorted(cards):\n    pos = queue.popleft()          # this position is revealed now\n    res[pos] = card\n    if queue: queue.append(queue.popleft())   # the next card goes to the bottom' },
        'The result `res` lists the cards from the top of the deck to the bottom. Simulating the process on indexes is a common way to turn an "operation" problem into a construction.'
      ]
    },
    statement: ['A deck of cards with different integers is revealed as follows: take the top card and reveal it; if there are still cards in the deck, move the next top card to the bottom of the deck; repeat until all cards are revealed. Order the deck (from the top to the bottom) so that the revealed cards come in increasing order, and print this order.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` different integers.'],
    outputFormat: ['Print the deck from the top to the bottom.'],
    constraints: ['1 <= n <= 20000', '1 <= each number <= 10^9, all different'],
    examples: [{ input: '7\n17 13 11 2 3 5 7\n', note: 'The deck 2 13 3 11 5 17 7 reveals 2, 3, 5, 7, 11, 13, 17.' }],
    hints: ['Simulate the process on a queue of positions 0 to n - 1.', 'The k-th position that is revealed gets the k-th smallest card.', 'After each reveal, move the next position from the front to the back.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<queue>', '<algorithm>'],
      python: r`
        queue = list(range(n))
        head = 0
        res = [0] * n
        for card in sorted(a):
            pos = queue[head]
            head += 1
            res[pos] = card
            if head < len(queue):
                queue.append(queue[head])
                head += 1
        print(*res)`,
      cpp: r`
        sort(a.begin(), a.end());
        queue<int> positions;
        for (int i = 0; i < n; i++) positions.push(i);
        vector<long long> res(n, 0);
        for (int i = 0; i < n; i++) {
            int pos = positions.front();
            positions.pop();
            res[pos] = a[i];
            if (!positions.empty()) {
                positions.push(positions.front());
                positions.pop();
            }
        }
        for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        Arrays.sort(a);
        Deque<Integer> positions = new ArrayDeque<>();
        for (int i = 0; i < n; i++) positions.addLast(i);
        long[] res = new long[(int) n];
        for (int i = 0; i < n; i++) {
            int pos = positions.pollFirst();
            res[pos] = a[i];
            if (!positions.isEmpty()) positions.addLast(positions.pollFirst());
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(res[i]).append(i + 1 < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The reveal process is simulated on positions. The k-th revealed position gets the k-th smallest card, which builds the required deck order.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]).sort((p, s) => p - s); const n = a.length; const deck = a.slice(); const idx = Array.from({ length: n }, (_, i) => i); const res = new Array(n); const q = idx; let h = 0; for (const c of a) { res[q[h++]] = c; if (h < q.length) { q.push(q[h++]); } } return res.join(' '); },
    tests() {
      const g = rng(588);
      const reveal = (deck) => { const d = deck.slice(); const out = []; while (d.length) { out.push(d.shift()); if (d.length) d.push(d.shift()); } return out; };
      for (let t = 0; t < 100; t++) { const n = randInt(g, 1, 12); const cards = randDistinct(g, n, 1, 50); const res = nums(this.solve(`${n}\n${cards.join(' ')}\n`)); const shown = reveal(res); if (shown.join(',') !== [...cards].sort((p, s) => p - s).join(',')) throw new Error('reveal reference differs'); }
      const make = (n, hi) => arr(shuffle(g, randDistinct(g, n, 1, hi)));
      return ['7\n17 13 11 2 3 5 7\n', '1\n5\n', '2\n9 4\n', '3\n3 2 1\n', make(20, 100), make(2000, 1000000), make(20000, 1000000000), make(19999, 1000000000), arr(many(20000, (i) => i + 1))];
    }
  },

  {
    slug: 'queue-with-maximum',
    title: 'A Queue That Knows Its Maximum',
    difficulty: 'medium',
    tags: ['queue', 'deque', 'design', 'monotonic-queue'],
    concept: {
      title: 'A second deque that keeps only the possible maximums',
      body: [
        'You want a queue with `enqueue`, `dequeue` and `max` (the largest value in the queue), all fast. Finding the maximum by scanning is O(n). Keep a **second deque** `mx` next to the queue with the values that can still become the maximum, in decreasing order.',
        { code: 'enqueue x:  queue.append(x)\n            while mx and mx[-1] < x: mx.pop()      # smaller older values can never be the maximum\n            mx.append(x)\ndequeue:    v = queue.popleft()\n            if mx[0] == v: mx.popleft()           # the maximum left the queue\nmax:        mx[0]' },
        'A value in the queue that is smaller than a **newer** value can never be the maximum while the newer one stays, because it leaves the queue first. So only values that are at least as large as all newer values need to be remembered. When the front value leaves and it is the front of `mx` too, remove it there as well. Equal values are kept (the test is strict: `<`), so a duplicate of the maximum is not lost.'
      ]
    },
    statement: ['Process `n` operations on an initially empty queue. `enqueue x` adds `x` at the back. `dequeue` removes the front and prints it. `max` prints the largest value in the queue. Every line has an operation and a number; for `dequeue` and `max` the number is 0 and is ignored. The queue is not empty when `dequeue` or `max` is used. Print one line for every `dequeue` and `max`.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has an operation and a number.'],
    outputFormat: ['One line for every `dequeue` and `max` operation.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= x <= 10^9', 'There is at least one `dequeue` or `max` operation.'],
    examples: [{ input: '6\nenqueue 3\nenqueue 1\nenqueue 5\nmax 0\ndequeue 0\nmax 0\n', note: 'The maximum is 5; the front 3 leaves; the maximum is still 5.' }],
    hints: ['Keep a second deque with the possible maximums, decreasing from the front to the back.', 'On enqueue, remove smaller values from the back of the second deque, then add the new value.', 'On dequeue, if the removed value equals the front of the second deque, remove it there too.'],
    program: {
      io: ['n:int', 'ops:word[n][2]'],
      fast: true,
      includes: ['<deque>'],
      python: r`
        from collections import deque
        queue = deque()
        mx = deque()
        out = []
        for op, val in ops:
            if op == "enqueue":
                x = int(val)
                queue.append(x)
                while mx and mx[-1] < x:
                    mx.pop()
                mx.append(x)
            elif op == "dequeue":
                v = queue.popleft()
                if mx[0] == v:
                    mx.popleft()
                out.append(v)
            else:
                out.append(mx[0])
        print("\n".join(map(str, out)))`,
      cpp: r`
        deque<long long> queue, mx;
        for (int i = 0; i < n; i++) {
            const string& op = ops[i][0];
            if (op == "enqueue") {
                long long x = stoll(ops[i][1]);
                queue.push_back(x);
                while (!mx.empty() && mx.back() < x) mx.pop_back();
                mx.push_back(x);
            } else if (op == "dequeue") {
                long long v = queue.front();
                queue.pop_front();
                if (mx.front() == v) mx.pop_front();
                cout << v << "\n";
            } else {
                cout << mx.front() << "\n";
            }
        }`,
      java: r`
        Deque<Long> queue = new ArrayDeque<>(), mx = new ArrayDeque<>();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            String op = ops[i][0];
            if (op.equals("enqueue")) {
                long x = Long.parseLong(ops[i][1]);
                queue.addLast(x);
                while (!mx.isEmpty() && mx.peekLast() < x) mx.pollLast();
                mx.addLast(x);
            } else if (op.equals("dequeue")) {
                long v = queue.pollFirst();
                if (mx.peekFirst() == v) mx.pollFirst();
                sb.append(v).append("\n");
            } else {
                sb.append(mx.peekFirst()).append("\n");
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['The second deque holds the values that can still be the maximum, in decreasing order. It is updated on every enqueue and dequeue, so `max` is the front of it.'], complexity: 'Amortised O(1) per operation, space O(n).' },
    solve(input) { return fastQueueMax(rows(input).slice(1)); },
    tests() {
      const g = rng(589);
      const make = (n, pEnq, lo, hi) => { const ops = []; let size = 0; for (let i = 0; i < n; i++) { const last = i === n - 1; if (size === 0 || (!last && g() < pEnq)) { ops.push(`enqueue ${randInt(g, lo, hi)}`); size++; } else if (g() < 0.5 || last) ops.push('max 0'); else { ops.push('dequeue 0'); size--; } } return `${n}\n${ops.join('\n')}\n`; };
      for (let t = 0; t < 100; t++) { const input = make(randInt(g, 2, 30), 0.5, -5, 5); const lines = rows(input).slice(1); if (this.solve(input) !== fastQueueMax(lines)) throw new Error('queue-max reference differs'); }
      return ['6\nenqueue 3\nenqueue 1\nenqueue 5\nmax 0\ndequeue 0\nmax 0\n', '2\nenqueue -5\nmax 0\n', make(20, 0.5, -9, 9), make(300, 0.5, -1000, 1000), make(20000, 0.5, -1000000000, 1000000000), make(20000, 0.7, -1000000000, 1000000000), make(20000, 0.35, 0, 5)];
    }
  },

  {
    slug: 'stack-with-increment',
    title: 'A Stack With an Increment Operation',
    difficulty: 'medium',
    tags: ['stack', 'design', 'lazy-update'],
    concept: {
      title: 'Lazy updates: remember the increment, apply it when it is needed',
      body: [
        'You need a stack with a maximum size and an extra operation, `inc k v`: **add `v` to the bottom `k` elements** of the stack. Doing it element by element costs O(k) every time. The trick is to be **lazy**: store the increment in a helper array `add[i]` that means "add this to the element at index `i` **and to everything below it**".',
        'For `inc k v`, let `i = min(k, size) - 1` and do only `add[i] += v`. When you **pop** the top element at index `top`, its real value is `value + add[top]`; then **pass the increment down**: `add[top - 1] += add[top]` (the elements below get it too) and reset `add[top] = 0`.',
        { code: 'push x:   if size < maxSize: vals[size] = x; add[size] = 0; size += 1\ninc k v:  if size > 0: add[min(k, size) - 1] += v\npop:      if size == 0: -1\n          else: size -= 1; result = vals[size] + add[size]\n                if size > 0: add[size - 1] += add[size]\n                add[size] = 0' },
        'Every operation is O(1). The same idea (store the change, apply it when you actually read the value) is used in many data structures, for example in segment trees.'
      ]
    },
    statement: ['Implement a stack that holds at most `m` numbers and process `n` operations. Each line has three words: the operation and two numbers (unused numbers are 0). `push x 0` puts `x` on top if the stack has fewer than `m` numbers (otherwise it does nothing). `pop 0 0` removes the top and prints it, or prints -1 if the stack is empty. `inc k v` adds `v` to each of the bottom `k` numbers of the stack (or to all numbers if the stack has fewer than `k`). Print the result of every `pop`.'],
    inputFormat: ['The first line has `n` and `m`.', 'Each of the next `n` lines has an operation and two numbers.'],
    outputFormat: ['One line for every `pop` operation.'],
    constraints: ['1 <= n <= 20000', '1 <= m <= 1000', '1 <= k <= 1000', '-1000 <= x, v <= 1000', 'There is at least one `pop` operation.'],
    examples: [{ input: '7 3\npush 1 0\npush 2 0\ninc 2 100\npop 0 0\npop 0 0\npush 3 0\npop 0 0\n', note: 'After inc the stack is 101 102; pops give 102, 101; then 3.' }],
    hints: ['Do not add to k elements one by one.', 'Keep an array `add` where `add[i]` is to be added to the element at index `i` and everything below.', 'When popping, add `add[top]` to the value and pass it on to `add[top - 1]`.'],
    program: {
      io: ['n:int m:int', 'ops:word[n][3]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        vals = [0] * m
        add = [0] * m
        size = 0
        out = []
        for op, x, y in ops:
            if op == "push":
                if size < m:
                    vals[size] = int(x)
                    add[size] = 0
                    size += 1
            elif op == "pop":
                if size == 0:
                    out.append(-1)
                else:
                    size -= 1
                    out.append(vals[size] + add[size])
                    if size > 0:
                        add[size - 1] += add[size]
                    add[size] = 0
            else:
                if size > 0:
                    add[min(int(x), size) - 1] += int(y)
        print("\n".join(map(str, out)))`,
      cpp: r`
        vector<long long> vals(m, 0), add(m, 0);
        int size = 0;
        for (int i = 0; i < n; i++) {
            const string& op = ops[i][0];
            if (op == "push") {
                if (size < m) {
                    vals[size] = stoll(ops[i][1]);
                    add[size] = 0;
                    size++;
                }
            } else if (op == "pop") {
                if (size == 0) {
                    cout << -1 << "\n";
                } else {
                    size--;
                    cout << vals[size] + add[size] << "\n";
                    if (size > 0) add[size - 1] += add[size];
                    add[size] = 0;
                }
            } else {
                if (size > 0) add[min((long long) size, stoll(ops[i][1])) - 1] += stoll(ops[i][2]);
            }
        }`,
      java: r`
        int cap = (int) m;
        long[] vals = new long[cap], add = new long[cap];
        int size = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            String op = ops[i][0];
            if (op.equals("push")) {
                if (size < cap) {
                    vals[size] = Long.parseLong(ops[i][1]);
                    add[size] = 0;
                    size++;
                }
            } else if (op.equals("pop")) {
                if (size == 0) {
                    sb.append(-1).append("\n");
                } else {
                    size--;
                    sb.append(vals[size] + add[size]).append("\n");
                    if (size > 0) add[size - 1] += add[size];
                    add[size] = 0;
                }
            } else {
                if (size > 0) add[(int) Math.min(size, Long.parseLong(ops[i][1])) - 1] += Long.parseLong(ops[i][2]);
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['An increment is stored once at index `min(k, size) - 1` and meaning "this element and all below". It is applied when an element is popped and handed down to the element below.'], complexity: 'O(1) per operation, space O(m).' },
    solve(input) { const rs = rows(input); const m = nums(rs[0])[1]; const st = []; const out = []; for (const l of rs.slice(1)) { const [op, x, y] = l.split(' '); if (op === 'push') { if (st.length < m) st.push(Number(x)); } else if (op === 'pop') out.push(st.length ? st.pop() : -1); else { for (let i = 0; i < Math.min(Number(x), st.length); i++) st[i] += Number(y); } } return out.join('\n'); },
    tests() { const g = rng(590); const make = (n, m, pPush, pInc) => { const ops = many(n, (i) => { if (i === n - 1) return 'pop 0 0'; const x = g(); if (x < pPush) return `push ${randInt(g, -1000, 1000)} 0`; if (x < pPush + pInc) return `inc ${randInt(g, 1, 1000)} ${randInt(g, -1000, 1000)}`; return 'pop 0 0'; }); return `${n} ${m}\n${ops.join('\n')}\n`; }; return ['7 3\npush 1 0\npush 2 0\ninc 2 100\npop 0 0\npop 0 0\npush 3 0\npop 0 0\n', '1 1\npop 0 0\n', '4 2\npush 1 0\npush 2 0\npush 3 0\npop 0 0\n', make(20, 3, 0.4, 0.3), make(300, 10, 0.4, 0.3), make(20000, 1000, 0.5, 0.25), make(20000, 5, 0.4, 0.3), make(20000, 1000, 0.7, 0.2), make(20000, 1, 0.5, 0.2)]; }
  },

  {
    slug: 'browser-history',
    title: 'Browser History',
    difficulty: 'medium',
    tags: ['design', 'array', 'stack'],
    concept: {
      title: 'An array with a current position and an end',
      body: [
        'A browser keeps the pages you visited. `back` goes to an earlier page, `forward` to a page you went back from, and `visit url` opens a new page and **throws away all pages that were "forward"** from the current one. Two stacks work, but a simpler way is an **array** with two numbers: `cur`, the index of the current page, and `end`, the index of the last page that you can still reach with `forward`.',
        { code: 'visit u:   cur += 1; pages[cur] = u; end = cur        # the old forward pages are forgotten\nback k:    cur = max(0, cur - k)\nforward k: cur = min(end, cur + k)' },
        '`visit` writes over the old page at `cur + 1` and moves `end` to the new position, which forgets everything after it without deleting anything. Using one array with `cur` and `end` makes every operation O(1) (`back` and `forward` move in one step, however large `k` is).'
      ]
    },
    statement: ['A browser starts on the page `home`. Process `n` operations. `visit url` goes to a new page; all pages that you could reach with `forward` are forgotten. `back k` goes back by `k` pages, but at most to the first page. `forward k` goes forward by `k` pages, but at most to the last page that can be reached. After every operation print the current page.'],
    inputFormat: ['The first line has the page `home`.', 'The second line has `n`.', 'Each of the next `n` lines has an operation and a word: `visit url`, `back k` or `forward k`.'],
    outputFormat: ['One line with the current page after each operation.'],
    constraints: ['1 <= n <= 20000', '1 <= k <= 100', 'Page names are words of 1 to 10 lowercase letters.'],
    examples: [{ input: 'home\n6\nvisit a\nvisit b\nback 1\nforward 1\nvisit c\nforward 1\n', note: 'a, b, a (back), b (forward), c (new page), c (nothing to go forward to).' }],
    hints: ['Keep an array of pages, the index `cur` of the current page and the index `end` of the last reachable page.', '`visit` writes the new page at `cur + 1` and sets `end = cur + 1`.', '`back` and `forward` only change `cur`, within the limits 0 and `end`.'],
    program: {
      io: ['home:word', 'n:int', 'ops:word[n][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        pages = [""] * (n + 1)
        pages[0] = home
        cur = 0
        end = 0
        out = []
        for op, val in ops:
            if op == "visit":
                cur += 1
                pages[cur] = val
                end = cur
            elif op == "back":
                cur = max(0, cur - int(val))
            else:
                cur = min(end, cur + int(val))
            out.append(pages[cur])
        print("\n".join(out))`,
      cpp: r`
        vector<string> pages(n + 1);
        pages[0] = home;
        int cur = 0, end = 0;
        for (int i = 0; i < n; i++) {
            const string& op = ops[i][0];
            if (op == "visit") {
                cur++;
                pages[cur] = ops[i][1];
                end = cur;
            } else if (op == "back") {
                cur = max(0, cur - stoi(ops[i][1]));
            } else {
                cur = min(end, cur + stoi(ops[i][1]));
            }
            cout << pages[cur] << "\n";
        }`,
      java: r`
        String[] pages = new String[(int) n + 1];
        pages[0] = home;
        int cur = 0, end = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            String op = ops[i][0];
            if (op.equals("visit")) {
                cur++;
                pages[cur] = ops[i][1];
                end = cur;
            } else if (op.equals("back")) {
                cur = Math.max(0, cur - Integer.parseInt(ops[i][1]));
            } else {
                cur = Math.min(end, cur + Integer.parseInt(ops[i][1]));
            }
            sb.append(pages[cur]).append("\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['One array with the current index and the last reachable index describes the whole history. `visit` overwrites the next slot and shortens the forward part, `back` and `forward` clamp the index.'], complexity: 'O(1) per operation, space O(n).' },
    solve(input) { const rs = rows(input); const home = rs[0]; const pages = [home]; let cur = 0; const out = []; for (const l of rs.slice(2)) { const [op, v] = l.split(' '); if (op === 'visit') { pages.length = cur + 1; pages.push(v); cur++; } else if (op === 'back') cur = Math.max(0, cur - Number(v)); else cur = Math.min(pages.length - 1, cur + Number(v)); out.push(pages[cur]); } return out.join('\n'); },
    tests() { const g = rng(591); const make = (n, pVisit) => { const ops = many(n, () => { const x = g(); if (x < pVisit) return `visit ${randWord(g, randInt(g, 1, 10), 'abcdef')}`; return `${g() < 0.5 ? 'back' : 'forward'} ${randInt(g, 1, 100)}`; }); return `${randWord(g, 5, 'abcdef')}\n${n}\n${ops.join('\n')}\n`; }; return ['home\n6\nvisit a\nvisit b\nback 1\nforward 1\nvisit c\nforward 1\n', 'start\n1\nback 5\n', 'start\n2\nvisit x\nforward 3\n', make(20, 0.4), make(300, 0.4), make(20000, 0.4), make(20000, 0.7), make(20000, 0.1), make(20000, 0.9)]; }
  },

  {
    slug: 'robots-within-budget',
    title: 'The Most Robots Within a Budget',
    difficulty: 'medium',
    tags: ['deque', 'sliding-window', 'monotonic-queue'],
    concept: {
      title: 'A window whose cost needs a maximum and a sum',
      body: [
        'You may run a group of **consecutive** robots. Robot `i` needs `charge[i]` to charge and costs `running[i]` to run. The cost of a group of `k` robots is `max(charge in the group) + k * sum(running in the group)`. Find the **largest group** whose cost is at most `budget`.',
        'A larger group never costs less than a smaller group inside it, so a **sliding window** works: extend the window on the right, and while the cost is too high move the left end forward. The cost needs two things quickly: the **maximum charge** of the window (a monotonic deque of indexes with decreasing charge) and the **sum of the running costs** (a running total that you update).',
        { code: 'for right in range(n):\n    while dq and charge[dq[-1]] <= charge[right]: dq.pop()\n    dq.append(right); total += running[right]\n    while dq and charge[dq[0]] + (right - left + 1) * total > budget:\n        if dq[0] == left: dq.popleft()\n        total -= running[left]; left += 1\n    best = max(best, right - left + 1)' },
        'If even a single robot is too expensive, the window becomes empty (`left = right + 1`), which the loop handles because the deque is then empty too. The answer may be 0.'
      ]
    },
    statement: ['Robot `i` has the charging time `charge[i]` and the running cost `running[i]`. You can run any group of `k >= 1` robots that stand next to each other. The cost of the group is the largest charging time in the group plus `k` times the sum of the running costs in the group. Given a `budget`, print the largest number of robots in a group whose cost is at most the budget (print 0 if no single robot is affordable).'],
    inputFormat: ['The first line has `n` and `budget`.', 'The second line has the charging times.', 'The third line has the running costs.'],
    outputFormat: ['Print the largest group size.'],
    constraints: ['1 <= n <= 20000', '1 <= charge[i], running[i] <= 10^5', '1 <= budget <= 10^15'],
    examples: [{ input: '5 25\n3 6 1 3 4\n2 1 3 4 5\n', note: 'The robots 0, 1, 2 cost max(3, 6, 1) + 3 * (2 + 1 + 3) = 6 + 18 = 24 <= 25: a group of 3.' }],
    hints: ['A sliding window works because a bigger group never costs less than a group inside it.', 'Keep a deque of indexes with decreasing charge for the window maximum, and a running sum.', 'While the cost is above the budget, move the left end forward (and drop the front of the deque if it leaves).'],
    program: {
      io: ['n:int budget:int', 'charge:int[n]', 'running:int[n]'],
      fast: true,
      includes: ['<deque>', '<algorithm>'],
      python: r`
        from collections import deque
        dq = deque()
        left = 0
        total = 0
        best = 0
        for right in range(n):
            while dq and charge[dq[-1]] <= charge[right]:
                dq.pop()
            dq.append(right)
            total += running[right]
            while dq and charge[dq[0]] + (right - left + 1) * total > budget:
                if dq[0] == left:
                    dq.popleft()
                total -= running[left]
                left += 1
            best = max(best, right - left + 1)
        print(best)`,
      cpp: r`
        deque<int> dq;
        int left = 0, best = 0;
        long long total = 0;
        for (int right = 0; right < n; right++) {
            while (!dq.empty() && charge[dq.back()] <= charge[right]) dq.pop_back();
            dq.push_back(right);
            total += running[right];
            while (!dq.empty() && charge[dq.front()] + (long long) (right - left + 1) * total > budget) {
                if (dq.front() == left) dq.pop_front();
                total -= running[left];
                left++;
            }
            best = max(best, right - left + 1);
        }
        cout << best << "\n";`,
      java: r`
        Deque<Integer> dq = new ArrayDeque<>();
        int left = 0, best = 0;
        long total = 0;
        for (int right = 0; right < n; right++) {
            while (!dq.isEmpty() && charge[dq.peekLast()] <= charge[right]) dq.pollLast();
            dq.addLast(right);
            total += running[right];
            while (!dq.isEmpty() && charge[dq.peekFirst()] + (long) (right - left + 1) * total > budget) {
                if (dq.peekFirst() == left) dq.pollFirst();
                total -= running[left];
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The window is extended on the right and shrunk on the left while its cost is too high. A monotonic deque gives the maximum charge, a running total gives the sum of running costs.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const rs = rows(input); const [, budget] = nums(rs[0]); return String(fastRobots(nums(rs[1]), nums(rs[2]), budget)); },
    tests() {
      const g = rng(592);
      const make = (n, budget, hi) => `${n} ${budget}\n${randArray(g, n, 1, hi).join(' ')}\n${randArray(g, n, 1, hi).join(' ')}\n`;
      for (let t = 0; t < 200; t++) { const n = randInt(g, 1, 10); const c = randArray(g, n, 1, 9), rn = randArray(g, n, 1, 9); const budget = randInt(g, 1, 150); let best = 0; for (let i = 0; i < n; i++) for (let j = i; j < n; j++) { const cost = Math.max(...c.slice(i, j + 1)) + (j - i + 1) * rn.slice(i, j + 1).reduce((s, x) => s + x, 0); if (cost <= budget) best = Math.max(best, j - i + 1); } if (String(best) !== this.solve(`${n} ${budget}\n${c.join(' ')}\n${rn.join(' ')}\n`)) throw new Error('robots reference differs'); }
      return ['5 25\n3 6 1 3 4\n2 1 3 4 5\n', '1 1\n5\n5\n', '1 10\n5\n5\n', '3 1000000000000000\n1 2 3\n1 1 1\n', make(20, 60, 9), make(2000, 100000, 100), make(20000, 1000000000, 100000), make(20000, 1000000000000000, 100000), make(20000, 200000, 100000), make(20000, 1, 100000)];
    }
  }
];

function fastMax(a, l, r2) { let m = -Infinity; for (let i = l; i <= r2; i++) m = Math.max(m, a[i]); return m; }
function fastMin(a, l, r2) { let m = Infinity; for (let i = l; i <= r2; i++) m = Math.min(m, a[i]); return m; }
function fastLimit(a, limit) { const maxq = [], minq = []; let mh = 0, nh = 0; let left = 0, best = 0; for (let right = 0; right < a.length; right++) { const x = a[right]; while (maxq.length > mh && maxq[maxq.length - 1] < x) maxq.pop(); maxq.push(x); while (minq.length > nh && minq[minq.length - 1] > x) minq.pop(); minq.push(x); while (maxq[mh] - minq[nh] > limit) { if (maxq[mh] === a[left]) mh++; if (minq[nh] === a[left]) nh++; left++; } best = Math.max(best, right - left + 1); } return best; }
function fastJump(a, k) { const n = a.length; const dp = new Array(n).fill(0); dp[0] = a[0]; const dq = [0]; let h = 0; for (let i = 1; i < n; i++) { while (dq[h] < i - k) h++; dp[i] = a[i] + dp[dq[h]]; while (dq.length > h && dp[dq[dq.length - 1]] <= dp[i]) dq.pop(); dq.push(i); } return dp[n - 1]; }
function fastQueueMax(lines) { const q = []; let qh = 0; const mx = []; let mh = 0; const out = []; for (const l of lines) { const [op, v] = l.split(' '); if (op === 'enqueue') { const x = Number(v); q.push(x); while (mx.length > mh && mx[mx.length - 1] < x) mx.pop(); mx.push(x); } else if (op === 'dequeue') { const v2 = q[qh++]; if (mx[mh] === v2) mh++; out.push(v2); } else out.push(mx[mh]); } return out.join('\n'); }
function fastRobots(c, rn, budget) { const n = c.length; const dq = []; let h = 0; let left = 0, total = 0, best = 0; for (let right = 0; right < n; right++) { while (dq.length > h && c[dq[dq.length - 1]] <= c[right]) dq.pop(); dq.push(right); total += rn[right]; while (dq.length > h && c[dq[h]] + (right - left + 1) * total > budget) { if (dq[h] === left) h++; total -= rn[left]; left++; } best = Math.max(best, right - left + 1); } return best; }
