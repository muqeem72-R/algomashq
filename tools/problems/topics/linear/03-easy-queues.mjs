import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randWord } from '../../lib.mjs';

const lines = (ops) => ops.join('\n');

export default [
  {
    slug: 'queue-with-two-stacks',
    title: 'A Queue Built From Two Stacks',
    difficulty: 'easy',
    tags: ['queue', 'stack', 'design'],
    concept: {
      title: 'First in, first out, and how to get it from stacks',
      body: [
        'A **queue** is a line: new items join at the **back** (`enqueue`) and the item that has waited longest leaves from the **front** (`dequeue`): *first in, first out*. A stack gives the opposite order (last in, first out). Two stacks can be combined into a queue, because reversing a stack once reverses the order.',
        'Keep an **inbox** stack and an **outbox** stack. `enqueue` pushes on the inbox. When the front is needed and the outbox is empty, move **all** items from the inbox to the outbox, one by one: the item that came first is now on top of the outbox. Then `dequeue` and `front` use the top of the outbox.',
        { code: 'def move():\n    if not outbox:\n        while inbox:\n            outbox.append(inbox.pop())       # reverses the order\n# enqueue x : inbox.append(x)\n# dequeue   : move(); outbox.pop()\n# front     : move(); outbox[-1]' },
        'Moving costs time, but every item is moved **at most once**, so a single operation is cheap on average (**amortised O(1)**). You must move only when the outbox is empty; moving earlier would put new items in front of older ones.'
      ]
    },
    statement: ['Process `n` operations on an initially empty queue. `enqueue x` adds `x` at the back. `dequeue` removes the front item and prints it. `front` prints the front item without removing it. Every line has an operation and a number; for `dequeue` and `front` the number is 0 and must be ignored. The queue is never empty when `dequeue` or `front` is used. Print one line for every `dequeue` and `front`.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has an operation and a number.'],
    outputFormat: ['One line for every `dequeue` and `front` operation, in order.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= x <= 10^9', 'There is at least one `dequeue` or `front` operation.'],
    examples: [{ input: '6\nenqueue 1\nenqueue 2\nfront 0\ndequeue 0\nenqueue 3\ndequeue 0\n', note: 'The front is 1; dequeue gives 1; then 2 leaves next.' }],
    hints: ['Use two stacks: an inbox for new items and an outbox for the items that leave.', 'When the outbox is empty and you need the front, pop everything from the inbox and push it on the outbox.', 'Never move items while the outbox still has some, or the order would be wrong.'],
    program: {
      io: ['n:int', 'ops:word[n][2]'],
      fast: true,
      python: r`
        inbox = []
        outbox = []
        out = []
        for op, val in ops:
            if op == "enqueue":
                inbox.append(int(val))
            else:
                if not outbox:
                    while inbox:
                        outbox.append(inbox.pop())
                if op == "dequeue":
                    out.append(outbox.pop())
                else:
                    out.append(outbox[-1])
        print("\n".join(map(str, out)))`,
      cpp: r`
        vector<long long> inbox, outbox;
        for (int i = 0; i < n; i++) {
            const string& op = ops[i][0];
            if (op == "enqueue") {
                inbox.push_back(stoll(ops[i][1]));
            } else {
                if (outbox.empty()) {
                    while (!inbox.empty()) {
                        outbox.push_back(inbox.back());
                        inbox.pop_back();
                    }
                }
                cout << outbox.back() << "\n";
                if (op == "dequeue") outbox.pop_back();
            }
        }`,
      java: r`
        Deque<Long> inbox = new ArrayDeque<>(), outbox = new ArrayDeque<>();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            String op = ops[i][0];
            if (op.equals("enqueue")) {
                inbox.push(Long.parseLong(ops[i][1]));
            } else {
                if (outbox.isEmpty()) {
                    while (!inbox.isEmpty()) outbox.push(inbox.pop());
                }
                sb.append(outbox.peek()).append("\n");
                if (op.equals("dequeue")) outbox.pop();
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['New items go on the inbox. When the outbox is empty, the whole inbox is poured into it, which reverses the order so that the oldest item is on top.'], complexity: 'Amortised O(1) per operation, space O(n).' },
    solve(input) { const q = []; const out = []; for (const l of rows(input).slice(1)) { const [op, v] = l.split(' '); if (op === 'enqueue') q.push(Number(v)); else if (op === 'dequeue') out.push(q.shift()); else out.push(q[0]); } return out.join('\n'); },
    tests() {
      const g = rng(531);
      const make = (n, pEnq, lo, hi) => { const ops = []; let size = 0; for (let i = 0; i < n; i++) { const last = i === n - 1; if (size === 0 || (!last && g() < pEnq)) { ops.push(`enqueue ${randInt(g, lo, hi)}`); size++; } else if (g() < 0.5 || last) { ops.push(`front 0`); } else { ops.push('dequeue 0'); size--; } } return `${n}\n${lines(ops)}\n`; };
      return ['6\nenqueue 1\nenqueue 2\nfront 0\ndequeue 0\nenqueue 3\ndequeue 0\n', '2\nenqueue -5\nfront 0\n', make(20, 0.5, -9, 9), make(300, 0.5, -1000, 1000), make(20000, 0.5, -1000000000, 1000000000), make(20000, 0.7, -1000000000, 1000000000), make(20000, 0.35, 0, 5)];
    }
  },

  {
    slug: 'number-of-recent-calls',
    title: 'Recent Calls',
    difficulty: 'easy',
    tags: ['queue', 'sliding-window', 'simulation'],
    concept: {
      title: 'A queue of times: old ones leave from the front',
      body: [
        'A counter answers "how many calls came in the last 3000 milliseconds?". Calls arrive with increasing times. Keep the times of the **recent** calls in a queue. A new call joins at the back. Calls that are too old are removed from the **front**; because times only grow, the oldest call is always at the front and nothing older can hide behind a newer one.',
        { code: 'window = deque()\nfor t in times:\n    window.append(t)\n    while window[0] < t - 3000:      # the front is the oldest call\n        window.popleft()\n    print(len(window))' },
        'Every call enters once and leaves once, so the work is O(n) in total. In Python use `collections.deque` (a plain list is slow at removing from the front); C++ has `queue` and `deque`, Java has `ArrayDeque`.'
      ]
    },
    statement: ['A counter records calls at the given times (in milliseconds), in strictly increasing order. After each call, print how many calls (including this one) happened in the time range `[t - 3000, t]`, where `t` is the time of this call.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` times, strictly increasing.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    constraints: ['1 <= n <= 20000', '1 <= t <= 10^9, strictly increasing'],
    examples: [{ input: '4\n1 100 3001 3002\n', note: 'At 3001 the range is [1, 3001]: 3 calls. At 3002 the range is [2, 3002]: the call at 1 is too old: 3 calls.' }],
    hints: ['Keep the times of the recent calls in a queue.', 'Remove from the front while the oldest time is smaller than `t - 3000`.', 'The answer is the size of the queue.'],
    program: {
      io: ['n:int', 't:int[n]'],
      fast: true,
      python: r`
        from collections import deque
        window = deque()
        out = []
        for x in t:
            window.append(x)
            while window[0] < x - 3000:
                window.popleft()
            out.append(len(window))
        print(*out)`,
      cpp: r`
        deque<long long> window;
        for (int i = 0; i < n; i++) {
            window.push_back(t[i]);
            while (window.front() < t[i] - 3000) window.pop_front();
            cout << window.size() << (i + 1 < n ? " " : "\n");
        }`,
      includes: ['<deque>'],
      java: r`
        Deque<Long> window = new ArrayDeque<>();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            window.addLast(t[i]);
            while (window.peekFirst() < t[i] - 3000) window.pollFirst();
            sb.append(window.size()).append(i + 1 < n ? " " : "\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['The queue holds the times of the calls in the window. Too old calls are removed from the front; the size of the queue is the answer.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const t = nums(rows(input)[1]); return t.map((x, i) => { let c = 0; for (let j = i; j >= 0 && t[j] >= x - 3000; j--) c++; return c; }).join(' '); },
    tests() { const g = rng(532); const incr = (n, maxStep) => { let t = randInt(g, 1, 10); return arr(many(n, () => { t += randInt(g, 1, maxStep); return t; })); }; return ['4\n1 100 3001 3002\n', '1\n5\n', '3\n1 3001 6001\n', '3\n1 2 3\n', incr(20, 1500), incr(2000, 100), incr(20000, 100), incr(20000, 3000), incr(20000, 1), incr(20000, 40000)]; }
  },

  {
    slug: 'moving-sum-of-stream',
    title: 'Moving Sum of a Stream',
    difficulty: 'easy',
    tags: ['queue', 'sliding-window', 'running-sum'],
    concept: {
      title: 'Update the sum instead of adding the window again',
      body: [
        'For a stream of numbers you want, after each new number, the **sum of the last `k` numbers** (fewer at the beginning). Adding up `k` numbers every time costs `k` per step. Instead keep the current **sum** and a queue with the numbers in the window: when a new number arrives, add it to the sum and to the queue; if the queue is longer than `k`, remove the oldest number from the front and **subtract** it from the sum.',
        { code: 'window = deque(); total = 0\nfor x in stream:\n    window.append(x); total += x\n    if len(window) > k:\n        total -= window.popleft()      # the oldest number leaves the window\n    print(total)' },
        'The queue is needed because the number that leaves is the oldest one, and you must remember it. Each number is added once and subtracted once.'
      ]
    },
    statement: ['Numbers arrive one by one. After each number, print the sum of the last `k` numbers that have arrived (if fewer than `k` have arrived, the sum of all of them).'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has the `n` numbers.'],
    outputFormat: ['Print `n` sums separated by spaces.'],
    constraints: ['1 <= k <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5 3\n1 10 3 5 2\n', note: 'The sums are 1, 11, 14, 18, 10.' }],
    hints: ['Keep the sum of the current window in a variable.', 'Put the new number in a queue and add it to the sum.', 'If the queue has more than k numbers, remove the front number and subtract it.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<deque>'],
      python: r`
        from collections import deque
        window = deque()
        total = 0
        out = []
        for x in a:
            window.append(x)
            total += x
            if len(window) > k:
                total -= window.popleft()
            out.append(total)
        print(*out)`,
      cpp: r`
        deque<long long> window;
        long long total = 0;
        for (int i = 0; i < n; i++) {
            window.push_back(a[i]);
            total += a[i];
            if ((long long) window.size() > k) {
                total -= window.front();
                window.pop_front();
            }
            cout << total << (i + 1 < n ? " " : "\n");
        }`,
      java: r`
        Deque<Long> window = new ArrayDeque<>();
        long total = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            window.addLast(a[i]);
            total += a[i];
            if (window.size() > k) total -= window.pollFirst();
            sb.append(total).append(i + 1 < n ? " " : "\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['The queue holds the last `k` numbers and `total` their sum. A new number is added; when the window is too long the oldest number is removed from the front and subtracted.'], complexity: 'Time O(n), space O(k).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]); return a.map((x, i) => { let s = 0; for (let j = Math.max(0, i - k + 1); j <= i; j++) s += a[j]; return s; }).join(' '); },
    tests() { const g = rng(533); const make = (n, k, lo, hi) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`; return ['5 3\n1 10 3 5 2\n', '1 1\n-7\n', '4 4\n1 2 3 4\n', '4 1\n1 2 3 4\n', make(20, 5, -9, 9), make(2000, 50, -1000, 1000), make(20000, 7, -1000000000, 1000000000), make(20000, 20000, -1000000000, 1000000000), make(20000, 5000, -1000000000, 1000000000), make(20000, 1, -1000000000, 1000000000)]; }
  },

  {
    slug: 'time-to-buy-tickets',
    title: 'Time Needed to Buy Tickets',
    difficulty: 'easy',
    tags: ['queue', 'simulation'],
    concept: {
      title: 'Simulate a line where people go back to the end',
      body: [
        'In this line, the person at the front buys **one** ticket per second. If they still want more tickets they go to the **back** of the line; if they are done they leave. This is exactly what a queue does: `popleft` takes the front person, `append` sends them to the back.',
        { code: 'queue = deque(range(n)); time = 0\nwhile True:\n    i = queue.popleft()\n    need[i] -= 1\n    time += 1\n    if need[i] == 0:\n        if i == k: break        # the person we follow is done\n    else:\n        queue.append(i)         # back to the end of the line' },
        'Store the **index** of the person in the queue (not their ticket count), so that you know who is who. Simulation is simple and correct; with large numbers of tickets it would be too slow, and a counting formula is needed, but here the sizes are small.'
      ]
    },
    statement: ['People stand in a line, person `i` wants `tickets[i]` tickets. Every second, the person at the front buys one ticket. If they want more tickets, they go to the back of the line; otherwise they leave. Print the number of seconds until the person at position `k` (counting from 0) has bought all their tickets.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `tickets[0] ... tickets[n-1]`.'],
    outputFormat: ['Print the number of seconds.'],
    constraints: ['1 <= n <= 1000', '0 <= k < n', '1 <= tickets[i] <= 1000'],
    examples: [{ input: '3 2\n2 3 2\n', note: 'After 6 seconds: person 2 buys the last ticket in the 6th second.' }],
    hints: ['Put the indexes of the people in a queue.', 'Take the front person, reduce their need by one and count one second.', 'If they still need tickets, send them to the back; stop when person k has finished.'],
    program: {
      io: ['n:int k:int', 'tickets:int[n]'],
      fast: true,
      includes: ['<queue>'],
      python: r`
        from collections import deque
        need = tickets[:]
        queue = deque(range(n))
        time = 0
        while True:
            i = queue.popleft()
            need[i] -= 1
            time += 1
            if need[i] == 0:
                if i == k:
                    break
            else:
                queue.append(i)
        print(time)`,
      cpp: r`
        vector<long long> need = tickets;
        queue<int> line;
        for (int i = 0; i < n; i++) line.push(i);
        long long time = 0;
        while (true) {
            int i = line.front();
            line.pop();
            need[i]--;
            time++;
            if (need[i] == 0) {
                if (i == k) break;
            } else {
                line.push(i);
            }
        }
        cout << time << "\n";`,
      java: r`
        long[] need = tickets.clone();
        Deque<Integer> line = new ArrayDeque<>();
        for (int i = 0; i < n; i++) line.addLast(i);
        long time = 0;
        while (true) {
            int i = line.pollFirst();
            need[i]--;
            time++;
            if (need[i] == 0) {
                if (i == k) break;
            } else {
                line.addLast(i);
            }
        }
        System.out.println(time);`
    },
    solution: { explanation: ['The queue holds the indexes of the people. Each second the front person buys one ticket and either leaves or goes to the back; the simulation stops when person `k` leaves.'], complexity: 'Time O(sum of tickets), space O(n).' },
    solve(input) { const rs = rows(input); const [n, k] = nums(rs[0]); const t = nums(rs[1]); let time = 0; for (let i = 0; i < n; i++) time += i <= k ? Math.min(t[i], t[k]) : Math.min(t[i], t[k] - 1); return String(time); },
    tests() { const g = rng(534); const make = (n, k, lo, hi) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`; return ['3 2\n2 3 2\n', '1 0\n5\n', '3 0\n5 1 1\n', '3 2\n1 1 5\n', make(10, 4, 1, 9), make(300, 150, 1, 100), make(1000, 0, 1, 1000), make(1000, 999, 1, 1000), make(1000, 500, 1, 1000), make(1000, 7, 1000, 1000)]; }
  },

  {
    slug: 'first-unique-in-stream',
    title: 'First Non-Repeating Letter in a Stream',
    difficulty: 'easy',
    tags: ['queue', 'hash-map', 'stream'],
    concept: {
      title: 'A queue of candidates and a table of counts',
      body: [
        'Letters arrive one at a time. After each letter you want the **first letter that has appeared only once so far**. Keep two things: a table `count` with how often each letter occurred, and a **queue of candidates** in the order of their first arrival.',
        { code: 'for ch in stream:\n    count[ch] += 1\n    if count[ch] == 1: queue.append(ch)          # a new candidate\n    while queue and count[queue[0]] > 1:\n        queue.popleft()                          # the front is no longer unique\n    answer = queue[0] if queue else "#"' },
        'Letters that appeared twice are removed from the front, but only **when they reach the front**. That is enough: the answer only ever looks at the front. Every letter is queued at most once and removed at most once, so the total work is linear.'
      ]
    },
    statement: ['Letters arrive one after another. After each letter print the first letter (in order of arrival) that has appeared exactly once so far, or `#` if there is none. Print the `n` answers as one word.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print a word of the same length with the answer after each letter.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'aabc\n', note: 'After a: a. After aa: #. After aab: b. After aabc: b. The answer is a#bb.' }],
    hints: ['Count how often every letter appeared.', 'Keep a queue of letters that appeared once, in the order of arrival.', 'Remove letters from the front while their count is more than one; the front is the answer.'],
    program: {
      io: ['s:word'],
      includes: ['<queue>'],
      python: r`
        from collections import deque
        count = {}
        queue = deque()
        out = []
        for ch in s:
            count[ch] = count.get(ch, 0) + 1
            if count[ch] == 1:
                queue.append(ch)
            while queue and count[queue[0]] > 1:
                queue.popleft()
            out.append(queue[0] if queue else "#")
        print("".join(out))`,
      cpp: r`
        int count[26] = {0};
        queue<char> candidates;
        string out;
        for (char ch : s) {
            count[ch - 'a']++;
            if (count[ch - 'a'] == 1) candidates.push(ch);
            while (!candidates.empty() && count[candidates.front() - 'a'] > 1) candidates.pop();
            out += candidates.empty() ? '#' : candidates.front();
        }
        cout << out << "\n";`,
      java: r`
        int[] count = new int[26];
        Deque<Character> candidates = new ArrayDeque<>();
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            count[ch - 'a']++;
            if (count[ch - 'a'] == 1) candidates.addLast(ch);
            while (!candidates.isEmpty() && count[candidates.peekFirst() - 'a'] > 1) candidates.pollFirst();
            out.append(candidates.isEmpty() ? '#' : candidates.peekFirst());
        }
        System.out.println(out);`
    },
    solution: { explanation: ['The queue lists the letters seen once, oldest first. Letters whose count grew are dropped when they reach the front, so the front is always the first non-repeating letter.'], complexity: 'Time O(n), space O(26).' },
    solve(input) { return fastUnique(input.trim()); },
    tests() {
      const g = rng(535);
      for (let t = 0; t < 100; t++) { const s = randWord(g, randInt(g, 1, 12), 'abc'); const slow = (() => { let out = ''; for (let i = 0; i < s.length; i++) { const c = {}; for (let j = 0; j <= i; j++) c[s[j]] = (c[s[j]] || 0) + 1; let f = '#'; for (let j = 0; j <= i; j++) if (c[s[j]] === 1) { f = s[j]; break; } out += f; } return out; })(); if (slow !== fastUnique(s)) throw new Error('first-unique reference differs'); }
      return ['aabc\n', 'a\n', 'aa\n', 'abc\n', 'abcabc\n', `${randWord(g, 30, 'abcd')}\n`, `${randWord(g, 2000, 'abcdefgh')}\n`, `${randWord(g, 20000, 'abcdefghijklmnopqrstuvwxyz')}\n`, `${randWord(g, 20000, 'ab')}\n`, `${'abcdefghijklmnopqrstuvwxyz'.repeat(769)}\n`];
    }
  },

  {
    slug: 'students-and-sandwiches',
    title: 'Students and Sandwiches',
    difficulty: 'easy',
    tags: ['queue', 'stack', 'simulation'],
    concept: {
      title: 'A queue of students and a stack of sandwiches',
      body: [
        'Students stand in a **queue** and sandwiches lie in a **stack** (the top one is served first). Each student likes type 0 or type 1. The student at the front of the line takes the top sandwich if they like it; otherwise they go to the **back** of the line. The process stops when **nobody** in the line likes the top sandwich.',
        'Simulate with a queue. To know when to stop, count the students who were sent to the back **without anyone eating in between**: if this count reaches the size of the queue, every student has refused the sandwich, so nobody will ever eat it.',
        { code: 'while queue and refused < len(queue):\n    if queue[0] == sandwiches[top]:\n        queue.popleft(); top += 1; refused = 0\n    else:\n        queue.append(queue.popleft()); refused += 1\nanswer = len(queue)' },
        'Reset the counter whenever a sandwich is taken. The simulation is the clear solution; counting how many students like each type gives a faster one, which you can find as an exercise.'
      ]
    },
    statement: ['Students stand in a line; student `i` likes sandwiches of type `students[i]` (0 or 1). Sandwiches are in a stack; `sandwiches[0]` is on top. While there are students: the student at the front takes the top sandwich if they like its type; otherwise they go to the back of the line. This repeats until nobody in the line likes the top sandwich. Print the number of students who cannot eat.'],
    inputFormat: ['The first line has `n`.', 'The second line has the types liked by the students, from the front.', 'The third line has the types of the sandwiches, from the top.'],
    outputFormat: ['Print the number of students who do not eat.'],
    constraints: ['1 <= n <= 2000', 'Every value is 0 or 1.'],
    examples: [{ input: '4\n1 1 0 0\n0 1 0 1\n', note: 'Every student finds a sandwich of the type they like, so nobody is left: 0.' }],
    hints: ['Put the students in a queue.', 'If the front student likes the top sandwich, remove both; otherwise move the student to the back.', 'Stop when as many students were refused in a row as there are students in the queue.'],
    program: {
      io: ['n:int', 'students:int[n]', 'sandwiches:int[n]'],
      fast: true,
      includes: ['<queue>'],
      python: r`
        from collections import deque
        queue = deque(students)
        top = 0
        refused = 0
        while queue and refused < len(queue):
            if queue[0] == sandwiches[top]:
                queue.popleft()
                top += 1
                refused = 0
            else:
                queue.append(queue.popleft())
                refused += 1
        print(len(queue))`,
      cpp: r`
        queue<long long> line;
        for (int i = 0; i < n; i++) line.push(students[i]);
        int top = 0;
        size_t refused = 0;
        while (!line.empty() && refused < line.size()) {
            if (line.front() == sandwiches[top]) {
                line.pop();
                top++;
                refused = 0;
            } else {
                line.push(line.front());
                line.pop();
                refused++;
            }
        }
        cout << line.size() << "\n";`,
      java: r`
        Deque<Long> line = new ArrayDeque<>();
        for (int i = 0; i < n; i++) line.addLast(students[i]);
        int top = 0, refused = 0;
        while (!line.isEmpty() && refused < line.size()) {
            if (line.peekFirst() == sandwiches[top]) {
                line.pollFirst();
                top++;
                refused = 0;
            } else {
                line.addLast(line.pollFirst());
                refused++;
            }
        }
        System.out.println(line.size());`
    },
    solution: { explanation: ['The line is simulated with a queue. A refused student goes to the back; when as many students were refused in a row as there are students, nobody can eat the top sandwich any more.'], complexity: 'Time O(n^2) in the worst case, space O(n).' },
    solve(input) { const rs = rows(input); const st = nums(rs[1]), sw = nums(rs[2]); let ones = st.filter((x) => x === 1).length, zeros = st.length - ones; for (const s of sw) { if (s === 1) { if (ones === 0) return String(ones + zeros); ones--; } else { if (zeros === 0) return String(ones + zeros); zeros--; } } return String(ones + zeros); },
    tests() { const g = rng(536); const make = (n, p) => `${n}\n${many(n, () => (g() < p ? 1 : 0)).join(' ')}\n${many(n, () => (g() < p ? 1 : 0)).join(' ')}\n`; const worst = (n) => `${n}\n${[...Array(n / 2).fill(1), ...Array(n / 2).fill(0)].join(' ')}\n${[...Array(n / 2).fill(0), ...Array(n / 2).fill(1)].join(' ')}\n`; return ['4\n1 1 0 0\n0 1 0 1\n', '5\n1 1 1 0 0\n1 0 0 0 1\n','1\n0\n1\n', '1\n1\n1\n', make(10, 0.5), make(300, 0.5), make(2000, 0.5), make(2000, 0.9), make(2000, 0.1), worst(2000)]; }
  },

  {
    slug: 'circular-queue-operations',
    title: 'A Circular Queue of Fixed Size',
    difficulty: 'easy',
    tags: ['queue', 'design', 'circular-buffer', 'array'],
    concept: {
      title: 'An array that wraps around',
      body: [
        'A queue with a **fixed capacity** `k` can live in an array of size `k`. If you always put new items at the end and remove from the front, the used part of the array would slide to the right and run out of room, even if the front part is empty. The solution: let the indexes **wrap around** with the modulo operator, as on a clock.',
        'Keep `head` (the index of the front item) and `size` (the number of items). The next free place is `(head + size) % k` and the last item is at `(head + size - 1) % k`.',
        { code: 'enqueue x: if size == k: fail\n           buf[(head + size) % k] = x; size += 1\ndequeue:   if size == 0: fail\n           head = (head + 1) % k; size -= 1\nfront:     buf[head]  if size > 0 else -1\nrear:      buf[(head + size - 1) % k]  if size > 0 else -1' },
        'This structure is called a **circular buffer** or ring buffer. It is used wherever a fixed amount of recent data must be kept, such as audio buffers and network packets.'
      ]
    },
    statement: ['Implement a queue that holds at most `k` numbers. Process `n` operations (each line has an operation and a number; the number is ignored except for `enQueue`). `enQueue x` adds `x` at the back and prints `yes`, or prints `no` if the queue is full. `deQueue` removes the front and prints `yes`, or prints `no` if the queue is empty. `Front` and `Rear` print the first and last number, or -1 if the queue is empty. `isEmpty` and `isFull` print `yes` or `no`. Print one line for every operation.'],
    inputFormat: ['The first line has `n` and `k`.', 'Each of the next `n` lines has an operation and a number.'],
    outputFormat: ['One line for every operation.'],
    constraints: ['1 <= n <= 20000', '1 <= k <= 1000', '-10^9 <= x <= 10^9'],
    examples: [{ input: '6 2\nenQueue 1\nenQueue 2\nenQueue 3\nRear 0\nisFull 0\ndeQueue 0\n', note: 'The third enQueue fails (no), Rear is 2, the queue is full (yes), and deQueue works (yes).' }],
    hints: ['Use an array of size k with `head` and `size`.', 'The next free place is `(head + size) % k`.', 'Check `size == k` before adding and `size == 0` before removing or reading.'],
    program: {
      io: ['n:int k:int', 'ops:word[n][2]'],
      fast: true,
      python: r`
        buf = [0] * k
        head = 0
        size = 0
        out = []
        for op, val in ops:
            if op == "enQueue":
                if size == k:
                    out.append("no")
                else:
                    buf[(head + size) % k] = int(val)
                    size += 1
                    out.append("yes")
            elif op == "deQueue":
                if size == 0:
                    out.append("no")
                else:
                    head = (head + 1) % k
                    size -= 1
                    out.append("yes")
            elif op == "Front":
                out.append(buf[head] if size > 0 else -1)
            elif op == "Rear":
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
            if (op == "enQueue") {
                if (size == k) {
                    cout << "no\n";
                } else {
                    buf[(head + size) % k] = stoll(ops[i][1]);
                    size++;
                    cout << "yes\n";
                }
            } else if (op == "deQueue") {
                if (size == 0) {
                    cout << "no\n";
                } else {
                    head = (head + 1) % k;
                    size--;
                    cout << "yes\n";
                }
            } else if (op == "Front") {
                cout << (size > 0 ? buf[head] : -1) << "\n";
            } else if (op == "Rear") {
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
            if (op.equals("enQueue")) {
                if (size == cap) {
                    sb.append("no\n");
                } else {
                    buf[(head + size) % cap] = Long.parseLong(ops[i][1]);
                    size++;
                    sb.append("yes\n");
                }
            } else if (op.equals("deQueue")) {
                if (size == 0) {
                    sb.append("no\n");
                } else {
                    head = (head + 1) % cap;
                    size--;
                    sb.append("yes\n");
                }
            } else if (op.equals("Front")) {
                sb.append(size > 0 ? buf[head] : -1).append("\n");
            } else if (op.equals("Rear")) {
                sb.append(size > 0 ? buf[(head + size - 1) % cap] : -1).append("\n");
            } else if (op.equals("isEmpty")) {
                sb.append(size == 0 ? "yes" : "no").append("\n");
            } else {
                sb.append(size == cap ? "yes" : "no").append("\n");
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['The queue lives in an array of size `k`; `head` and `size` describe it and the indexes wrap around with `% k`, so freed places at the front are reused.'], complexity: 'O(1) per operation, space O(k).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const q = []; const out = []; for (const l of rs.slice(1)) { const [op, v] = l.split(' '); if (op === 'enQueue') { if (q.length === k) out.push('no'); else { q.push(Number(v)); out.push('yes'); } } else if (op === 'deQueue') { if (!q.length) out.push('no'); else { q.shift(); out.push('yes'); } } else if (op === 'Front') out.push(q.length ? q[0] : -1); else if (op === 'Rear') out.push(q.length ? q[q.length - 1] : -1); else if (op === 'isEmpty') out.push(q.length === 0 ? 'yes' : 'no'); else out.push(q.length === k ? 'yes' : 'no'); } return out.join('\n'); },
    tests() { const g = rng(537); const make = (n, k, pEnq) => { const ops = many(n, () => { const x = g(); if (x < pEnq) return `enQueue ${randInt(g, -1000000000, 1000000000)}`; const y = randInt(g, 0, 4); return `${['deQueue', 'Front', 'Rear', 'isEmpty', 'isFull'][y]} 0`; }); return `${n} ${k}\n${ops.join('\n')}\n`; }; return ['6 2\nenQueue 1\nenQueue 2\nenQueue 3\nRear 0\nisFull 0\ndeQueue 0\n', '3 1\nFront 0\nRear 0\nisEmpty 0\n', make(20, 3, 0.5), make(300, 5, 0.5), make(20000, 1000, 0.5), make(20000, 7, 0.45), make(20000, 1, 0.5), make(20000, 1000, 0.7)]; }
  },

  {
    slug: 'stack-using-queue',
    title: 'A Stack Built From a Queue',
    difficulty: 'easy',
    tags: ['stack', 'queue', 'design'],
    concept: {
      title: 'Rotate the queue after every push',
      body: [
        'A queue gives the oldest item first, but a **stack** must give the newest item first. A single queue can behave like a stack if the newest item is always kept at the **front**. After each `push` the new item is at the back, so **rotate** the queue: take the front item and put it at the back, as many times as there were older items. Then the new item is in front.',
        { code: 'push x:   queue.append(x)\n          for _ in range(len(queue) - 1):\n              queue.append(queue.popleft())     # now x is at the front\npop:      queue.popleft()\ntop:      queue[0]\nempty:    len(queue) == 0' },
        '`pop`, `top` and `empty` are O(1), and `push` costs O(size). (There are other designs where pop is the slow operation; the total work is similar.)'
      ]
    },
    statement: ['Process `n` operations on an initially empty stack, using only queue operations in your solution. `push x` puts `x` on top. `pop` removes and prints the top. `top` prints the top without removing it. `empty` prints `yes` if the stack is empty and `no` otherwise. Every line has an operation and a number; for `pop`, `top` and `empty` the number is 0 and is ignored. `pop` and `top` are only used when the stack is not empty. Print one line for every `pop`, `top` and `empty`.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has an operation and a number.'],
    outputFormat: ['One line for every `pop`, `top` and `empty` operation.'],
    constraints: ['1 <= n <= 5000', '-10^9 <= x <= 10^9', 'There is at least one `pop`, `top` or `empty` operation.'],
    examples: [{ input: '5\npush 1\npush 2\ntop 0\npop 0\nempty 0\n', note: 'The top is 2; pop gives 2; the stack still has 1: not empty.' }],
    hints: ['Keep the newest item at the front of the queue.', 'After adding an item at the back, move all older items behind it.', 'Then pop is the same as taking the front of the queue.'],
    program: {
      io: ['n:int', 'ops:word[n][2]'],
      fast: true,
      includes: ['<queue>'],
      python: r`
        from collections import deque
        queue = deque()
        out = []
        for op, val in ops:
            if op == "push":
                queue.append(int(val))
                for _ in range(len(queue) - 1):
                    queue.append(queue.popleft())
            elif op == "pop":
                out.append(queue.popleft())
            elif op == "top":
                out.append(queue[0])
            else:
                out.append("yes" if not queue else "no")
        print("\n".join(map(str, out)))`,
      cpp: r`
        queue<long long> line;
        for (int i = 0; i < n; i++) {
            const string& op = ops[i][0];
            if (op == "push") {
                line.push(stoll(ops[i][1]));
                for (size_t j = 0; j + 1 < line.size(); j++) {
                    line.push(line.front());
                    line.pop();
                }
            } else if (op == "pop") {
                cout << line.front() << "\n";
                line.pop();
            } else if (op == "top") {
                cout << line.front() << "\n";
            } else {
                cout << (line.empty() ? "yes" : "no") << "\n";
            }
        }`,
      java: r`
        Deque<Long> line = new ArrayDeque<>();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            String op = ops[i][0];
            if (op.equals("push")) {
                line.addLast(Long.parseLong(ops[i][1]));
                for (int j = 0; j + 1 < line.size(); j++) line.addLast(line.pollFirst());
            } else if (op.equals("pop")) {
                sb.append(line.pollFirst()).append("\n");
            } else if (op.equals("top")) {
                sb.append(line.peekFirst()).append("\n");
            } else {
                sb.append(line.isEmpty() ? "yes" : "no").append("\n");
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['After each push the older items are rotated behind the new one, so the front of the queue is always the top of the stack.'], complexity: 'push O(size), pop, top and empty O(1).' },
    solve(input) { const st = []; const out = []; for (const l of rows(input).slice(1)) { const [op, v] = l.split(' '); if (op === 'push') st.push(Number(v)); else if (op === 'pop') out.push(st.pop()); else if (op === 'top') out.push(st[st.length - 1]); else out.push(st.length === 0 ? 'yes' : 'no'); } return out.join('\n'); },
    tests() { const g = rng(538); const make = (n, pPush) => { const ops = []; let size = 0; for (let i = 0; i < n; i++) { const last = i === n - 1; if (size === 0 && !last && g() < 0.8 || (!last && g() < pPush)) { ops.push(`push ${randInt(g, -1000000000, 1000000000)}`); size++; } else { const x = randInt(g, 0, 2); if (size === 0 || x === 2) ops.push('empty 0'); else if (x === 0) { ops.push('pop 0'); size--; } else ops.push('top 0'); } } return `${n}\n${ops.join('\n')}\n`; }; return ['5\npush 1\npush 2\ntop 0\npop 0\nempty 0\n', '1\nempty 0\n', make(20, 0.5), make(300, 0.5), make(5000, 0.5), make(5000, 0.7), make(5000, 0.9), make(5000, 0.3)]; }
  }
];

function fastUnique(s) { const count = {}; const queue = []; let head = 0; let out = ''; for (const ch of s) { count[ch] = (count[ch] || 0) + 1; if (count[ch] === 1) queue.push(ch); while (head < queue.length && count[queue[head]] > 1) head++; out += head < queue.length ? queue[head] : '#'; } return out; }
