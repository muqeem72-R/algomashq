import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct } from '../../lib.mjs';

const big = (g, n, lo, hi) => arr(randArray(g, n, lo, hi));

export default [
  {
    slug: 'count-signs',
    title: 'Count Positive, Negative and Zero',
    difficulty: 'easy',
    tags: ['arrays', 'counting'],
    concept: {
      title: 'One pass, a few counters',
      body: [
        'Many array questions need only a single pass: walk over the elements once and update a few variables. Here three counters are enough, one for each kind of number.',
        { code: 'pos = neg = zero = 0\nfor x in a:\n    if x > 0:\n        pos += 1\n    elif x < 0:\n        neg += 1\n    else:\n        zero += 1' },
        'Every number is exactly one of the three kinds, so `if / elif / else` is the natural choice and the counters always add up to `n`.'
      ]
    },
    statement: ['You are given `n` integers. Count how many of them are positive, how many are negative and how many are zero.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print three integers separated by spaces: the number of positives, negatives and zeros.'],
    constraints: ['1 <= n <= 1000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6\n3 -1 0 7 -5 0\n', note: 'Two positive, two negative and two zeros.' }],
    hints: ['Go through the array once.', 'Keep three counters and add one to the right counter for each number.', 'Use `if x > 0`, `elif x < 0` and `else` (the zeros).'],
    program: {
      io: ['n:int', 'a:int[n]'],
      python: r`
        pos = neg = zero = 0
        for x in a:
            if x > 0:
                pos += 1
            elif x < 0:
                neg += 1
            else:
                zero += 1
        print(pos, neg, zero)`,
      cpp: r`
        int pos = 0, neg = 0, zero = 0;
        for (int i = 0; i < n; i++) {
            if (a[i] > 0) pos++;
            else if (a[i] < 0) neg++;
            else zero++;
        }
        cout << pos << " " << neg << " " << zero << "\n";`,
      java: r`
        int pos = 0, neg = 0, zero = 0;
        for (int i = 0; i < n; i++) {
            if (a[i] > 0) pos++;
            else if (a[i] < 0) neg++;
            else zero++;
        }
        System.out.println(pos + " " + neg + " " + zero);`
    },
    solution: { explanation: ['One pass with three counters. Each number increases exactly one of them.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(input).slice(1); return `${a.filter((x) => x > 0).length} ${a.filter((x) => x < 0).length} ${a.filter((x) => x === 0).length}`; },
    tests() { const g = rng(101); return ['1\n0\n', '1\n-7\n', '3\n0 0 0\n', '4\n5 6 7 8\n', '4\n-5 -6 -7 -8\n', big(g, 20, -3, 3), big(g, 1000, -1000000000, 1000000000), big(g, 1000, -1, 1)]; }
  },

  {
    slug: 'running-sum',
    title: 'Running Sum',
    difficulty: 'easy',
    tags: ['arrays', 'prefix-sum'],
    concept: {
      title: 'Prefix sums',
      body: [
        'The **prefix sum** at position `i` is the sum of all elements from the start up to and including `i`. All prefix sums can be produced in one pass, because each one is the previous prefix sum plus the new element.',
        { code: 'total = 0\nfor x in a:\n    total += x\n    # total is now the prefix sum at this element' },
        'Prefix sums are one of the most useful tools for arrays. The next problems use them to answer many "sum of a part of the array" questions quickly.'
      ]
    },
    statement: ['Given an array of `n` integers, print its running sums: the i-th printed number is the sum of the first i numbers of the array.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `n` integers separated by spaces.'],
    constraints: ['1 <= n <= 1000', '-10^6 <= each number <= 10^6'],
    examples: [{ input: '5\n1 2 3 4 5\n', note: '1, 1+2, 1+2+3, ...' }],
    hints: ['The answer for position i needs the answer for position i - 1.', 'Keep one variable `total` and add each element to it.', 'Print `total` after adding each element.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      python: r`
        total = 0
        out = []
        for x in a:
            total += x
            out.append(total)
        print(*out)`,
      cpp: r`
        long long total = 0;
        for (int i = 0; i < n; i++) {
            total += a[i];
            cout << total << (i + 1 < n ? " " : "\n");
        }`,
      java: r`
        long total = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            total += a[i];
            sb.append(total).append(i + 1 < n ? " " : "\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Each prefix sum is the previous one plus the current element, so one running variable is enough.'], complexity: 'Time O(n), space O(1) besides the output.' },
    solve(input) { const a = nums(input).slice(1); let t = 0; return a.map((x) => (t += x)).join(' '); },
    tests() { const g = rng(102); return ['1\n5\n', '1\n-5\n', '5\n1 2 3 4 5\n', '4\n-1 1 -1 1\n', '3\n1000000 1000000 1000000\n', big(g, 30, -100, 100), big(g, 1000, -1000000, 1000000), big(g, 1000, 0, 1000000)]; }
  },

  {
    slug: 'rotate-array-right',
    title: 'Rotate Array to the Right',
    difficulty: 'easy',
    tags: ['arrays', 'rotation', 'modulo'],
    concept: {
      title: 'Rotation is index arithmetic',
      body: [
        'Rotating an array to the right by `k` moves every element `k` places forward, and the elements that fall off the end come back at the start. The element that ends at position `i` is the one that started at position `(i - k) mod n`.',
        'Rotating by `n` gives the same array again, so first replace `k` by `k % n`. That also makes a huge `k` harmless.',
        { code: 'k %= n\nrotated = a[n - k:] + a[:n - k]' }
      ]
    },
    statement: ['Rotate an array of `n` integers to the right by `k` places and print the result.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the rotated array on one line.'],
    constraints: ['1 <= n <= 1000', '0 <= k <= 10^9', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5 2\n1 2 3 4 5\n', note: 'The last two elements, 4 and 5, move to the front.' }],
    hints: ['After one rotation to the right, the last element becomes the first.', 'Rotating by n changes nothing, so use `k % n`.', 'The element at output position i is `a[(i - k + n) % n]`.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      python: r`
        k %= n
        print(*(a[n - k:] + a[:n - k]))`,
      cpp: r`
        k %= n;
        for (int i = 0; i < n; i++) {
            cout << a[(i - k + n) % n] << (i + 1 < n ? " " : "\n");
        }`,
      java: r`
        k %= n;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(a[(int) ((i - k + n) % n)]).append(i + 1 < n ? " " : "\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Reduce `k` modulo `n`. The new array is the last `k` elements followed by the first `n - k` elements.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const [n, k0] = nums(input); const a = nums(rows(input)[1]); const k = k0 % n; return [...a.slice(n - k), ...a.slice(0, n - k)].join(' '); },
    tests() { const g = rng(103); return ['5 2\n1 2 3 4 5\n', '1 7\n9\n', '4 0\n1 2 3 4\n', '4 4\n1 2 3 4\n', '4 1000000000\n1 2 3 4\n', ...many(5, (i) => { const n = randInt(g, 2, 12); return `${n} ${randInt(g, 0, 40)}\n${randArray(g, n, -9, 9).join(' ')}\n`; }), `1000 999\n${randArray(g, 1000, -1000000000, 1000000000).join(' ')}\n`]; }
  },

  {
    slug: 'move-zeros-to-end',
    title: 'Move Zeros to the End',
    difficulty: 'easy',
    tags: ['arrays', 'two-pointers'],
    concept: {
      title: 'A write index',
      body: [
        'To keep some elements and drop others, walk over the array with a **read index** `i` and keep a second index `w`, the **write index**, that marks where the next kept element goes. When `a[i]` is kept, copy it to `a[w]` and add one to `w`.',
        { code: 'w = 0\nfor i in range(n):\n    if a[i] != 0:\n        a[w] = a[i]\n        w += 1' },
        'The write index never passes the read index, so nothing is overwritten before it has been read. After the loop, the first `w` places hold the kept elements in their original order.'
      ]
    },
    statement: ['Move all zeros of an array to the end. The other numbers must keep their relative order.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the changed array on one line.'],
    constraints: ['1 <= n <= 1000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6\n0 1 0 3 12 0\n', note: 'The non-zero numbers 1 3 12 come first, then three zeros.' }],
    hints: ['Copy the non-zero numbers to the front, in order.', 'Use a write index `w` that grows only when you keep a number.', 'After the copy, fill the places from `w` to the end with zeros.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      python: r`
        w = 0
        for i in range(n):
            if a[i] != 0:
                a[w] = a[i]
                w += 1
        while w < n:
            a[w] = 0
            w += 1
        print(*a)`,
      cpp: r`
        int w = 0;
        for (int i = 0; i < n; i++) {
            if (a[i] != 0) a[w++] = a[i];
        }
        while (w < n) a[w++] = 0;
        for (int i = 0; i < n; i++) cout << a[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        int w = 0;
        for (int i = 0; i < n; i++) {
            if (a[i] != 0) a[w++] = a[i];
        }
        while (w < n) a[w++] = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(a[i]).append(i + 1 < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Copy every non-zero element to the write index, then fill the rest with zeros. The relative order of the non-zero numbers is kept because we read from left to right.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); const nz = a.filter((x) => x !== 0); return [...nz, ...Array(a.length - nz.length).fill(0)].join(' '); },
    tests() { const g = rng(104); return ['6\n0 1 0 3 12 0\n', '1\n0\n', '1\n4\n', '3\n0 0 0\n', '4\n1 2 3 4\n', '4\n0 0 5 6\n', big(g, 25, -2, 2), big(g, 1000, -1, 1), big(g, 1000, -1000000000, 1000000000)]; }
  },

  {
    slug: 'unique-sorted-array',
    title: 'Remove Duplicates from a Sorted Array',
    difficulty: 'easy',
    tags: ['arrays', 'two-pointers', 'sorted'],
    concept: {
      title: 'Equal neighbours in a sorted array',
      body: [
        'In a sorted array all copies of a value stand next to each other. So a value is a duplicate exactly when it equals the element just before it, and one pass comparing neighbours finds all the distinct values.',
        { code: 'unique = [a[0]]\nfor i in range(1, n):\n    if a[i] != a[i - 1]:\n        unique.append(a[i])' },
        'Without the sorted order you would need extra memory (a set) to remember what you have seen. The order saves that memory.'
      ]
    },
    statement: ['You are given an array of `n` integers sorted in non-decreasing order. Print the number of distinct values, and then the distinct values in order.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers in non-decreasing order.'],
    outputFormat: ['The first line: the number of distinct values `d`.', 'The second line: the `d` distinct values.'],
    constraints: ['1 <= n <= 1000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '7\n1 1 2 2 2 5 7\n', note: 'The distinct values are 1 2 5 7.' }],
    hints: ['Equal values stand next to each other.', 'A value is new when it differs from the value before it.', 'The first element is always new.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      python: r`
        unique = [a[0]]
        for i in range(1, n):
            if a[i] != a[i - 1]:
                unique.append(a[i])
        print(len(unique))
        print(*unique)`,
      cpp: r`
        vector<long long> unique = {a[0]};
        for (int i = 1; i < n; i++) {
            if (a[i] != a[i - 1]) unique.push_back(a[i]);
        }
        cout << unique.size() << "\n";
        for (size_t i = 0; i < unique.size(); i++) cout << unique[i] << (i + 1 < unique.size() ? " " : "\n");`,
      java: r`
        List<Long> unique = new ArrayList<>();
        unique.add(a[0]);
        for (int i = 1; i < n; i++) {
            if (a[i] != a[i - 1]) unique.add(a[i]);
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < unique.size(); i++) sb.append(unique.get(i)).append(i + 1 < unique.size() ? " " : "\n");
        System.out.println(unique.size());
        System.out.print(sb);`
    },
    solution: { explanation: ['In a sorted array, a value is new exactly when it differs from its left neighbour. Collect those values.'], complexity: 'Time O(n), space O(n) for the output.' },
    solve(input) { const a = nums(rows(input)[1]); const u = a.filter((x, i) => i === 0 || x !== a[i - 1]); return `${u.length}\n${u.join(' ')}`; },
    tests() { const g = rng(105); const sorted = (n, lo, hi) => arr(randArray(g, n, lo, hi).sort((x, y) => x - y)); return ['7\n1 1 2 2 2 5 7\n', '1\n3\n', '4\n8 8 8 8\n', '4\n1 2 3 4\n', '5\n-5 -5 0 0 0\n', sorted(30, 0, 5), sorted(1000, -50, 50), sorted(1000, -1000000000, 1000000000)]; }
  },

  {
    slug: 'merge-two-sorted-arrays',
    title: 'Merge Two Sorted Arrays',
    difficulty: 'easy',
    tags: ['arrays', 'two-pointers', 'sorted', 'merge'],
    concept: {
      title: 'Merging with two pointers',
      body: [
        'To merge two sorted arrays, keep one pointer in each. At every step compare the two elements the pointers show, move the smaller one to the output, and advance only that pointer. The output is sorted because the smallest remaining element is always one of the two fronts.',
        { code: 'i = j = 0\nwhile i < len(a) and j < len(b):\n    if a[i] <= b[j]:\n        out.append(a[i]); i += 1\n    else:\n        out.append(b[j]); j += 1\nout += a[i:] + b[j:]' },
        'When one array is used up, the rest of the other is already in order and is copied as it is. This merge step is also the heart of merge sort.'
      ]
    },
    statement: ['You are given two arrays sorted in non-decreasing order. Print them merged into one sorted array.'],
    inputFormat: ['The first line has `n` and `m`, the lengths of the arrays.', 'The second line has the `n` numbers of the first array.', 'The third line has the `m` numbers of the second array.'],
    outputFormat: ['Print the `n + m` numbers of the merged array on one line.'],
    constraints: ['1 <= n, m <= 1000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '3 4\n1 4 9\n2 3 10 11\n', note: 'The merged array is 1 2 3 4 9 10 11.' }],
    hints: ['Keep one pointer per array, both at the start.', 'Compare the two current elements and take the smaller; move only that pointer.', 'When one array is finished, append what is left of the other.'],
    program: {
      io: ['n:int m:int', 'a:int[n]', 'b:int[m]'],
      python: r`
        out = []
        i = j = 0
        while i < n and j < m:
            if a[i] <= b[j]:
                out.append(a[i])
                i += 1
            else:
                out.append(b[j])
                j += 1
        out += a[i:]
        out += b[j:]
        print(*out)`,
      cpp: r`
        vector<long long> out;
        int i = 0, j = 0;
        while (i < n && j < m) {
            if (a[i] <= b[j]) out.push_back(a[i++]);
            else out.push_back(b[j++]);
        }
        while (i < n) out.push_back(a[i++]);
        while (j < m) out.push_back(b[j++]);
        for (size_t k = 0; k < out.size(); k++) cout << out[k] << (k + 1 < out.size() ? " " : "\n");`,
      java: r`
        StringBuilder sb = new StringBuilder();
        int i = 0, j = 0;
        while (i < n || j < m) {
            long x;
            if (j >= m || (i < n && a[i] <= b[j])) x = a[i++];
            else x = b[j++];
            sb.append(x).append(i < n || j < m ? " " : "\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Two pointers walk through the arrays. Each step moves the smaller front element to the output, so the output stays sorted.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) { const [, ra, rb] = rows(input); const a = nums(ra), b = nums(rb); return [...a, ...b].sort((x, y) => x - y).join(' '); },
    tests() { const g = rng(106); const two = (n, m, lo, hi) => `${n} ${m}\n${randArray(g, n, lo, hi).sort((x, y) => x - y).join(' ')}\n${randArray(g, m, lo, hi).sort((x, y) => x - y).join(' ')}\n`; return ['3 4\n1 4 9\n2 3 10 11\n', '1 1\n5\n5\n', '1 3\n10\n1 2 3\n', '3 1\n1 2 3\n10\n', '2 2\n1 2\n3 4\n', two(10, 7, -20, 20), two(1000, 1000, -1000000000, 1000000000), two(500, 1000, 0, 30)]; }
  },

  {
    slug: 'maximum-consecutive-ones',
    title: 'Longest Run of Ones',
    difficulty: 'easy',
    tags: ['arrays', 'counting', 'runs'],
    concept: {
      title: 'Tracking a current run',
      body: [
        'To find the longest run of equal values, keep two numbers: the length of the **current run** and the **best** length seen so far. A one extends the current run, a zero resets it to zero. After every step update the best.',
        { code: 'cur = best = 0\nfor x in a:\n    cur = cur + 1 if x == 1 else 0\n    best = max(best, cur)' },
        'The same "current and best" pair works for longest streaks of anything: equal letters, increasing numbers, days in a row.'
      ]
    },
    statement: ['You are given an array that contains only 0 and 1. Print the length of the longest block of consecutive 1s.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` numbers, each 0 or 1.'],
    outputFormat: ['Print one integer: the longest run of ones (0 if there is no 1).'],
    constraints: ['1 <= n <= 1000'],
    examples: [{ input: '8\n1 1 0 1 1 1 0 1\n', note: 'The longest block is the three ones in the middle.' }],
    hints: ['Remember how long the run is that you are in right now.', 'On a 1 add one to the current run; on a 0 set it to zero.', 'After each element, keep the larger of the best and the current run.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      python: r`
        cur = best = 0
        for x in a:
            if x == 1:
                cur += 1
            else:
                cur = 0
            best = max(best, cur)
        print(best)`,
      cpp: r`
        int cur = 0, best = 0;
        for (int i = 0; i < n; i++) {
            if (a[i] == 1) cur++;
            else cur = 0;
            best = max(best, cur);
        }
        cout << best << "\n";`,
      java: r`
        int cur = 0, best = 0;
        for (int i = 0; i < n; i++) {
            if (a[i] == 1) cur++;
            else cur = 0;
            best = Math.max(best, cur);
        }
        System.out.println(best);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The current run grows on a one and resets on a zero; the answer is the largest value the current run ever had.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); let cur = 0, best = 0; for (const x of a) { cur = x === 1 ? cur + 1 : 0; best = Math.max(best, cur); } return String(best); },
    tests() { const g = rng(107); const bits = (n, p) => arr(many(n, () => (g() < p ? 1 : 0))); return ['8\n1 1 0 1 1 1 0 1\n', '1\n1\n', '1\n0\n', '5\n1 1 1 1 1\n', '5\n0 0 0 0 0\n', bits(30, 0.5), bits(1000, 0.5), bits(1000, 0.95), bits(1000, 0.1)]; }
  },

  {
    slug: 'find-missing-number',
    title: 'Find the Missing Number',
    difficulty: 'easy',
    tags: ['arrays', 'math', 'sum'],
    concept: {
      title: 'What the full set would add up to',
      body: [
        'If you know exactly which numbers *should* be present, the missing one is the difference between the sum they would have and the sum you actually see. The numbers `1, 2, ..., m` add up to `m * (m + 1) / 2`.',
        { code: 'm = n + 1\nexpected = m * (m + 1) // 2\nmissing = expected - sum(a)' },
        'This needs no sorting and no extra memory. The same "expected minus actual" idea is used for checksums.'
      ]
    },
    statement: ['The numbers 1, 2, ..., n + 1 were written in some order, but one of them is lost. You are given the remaining `n` numbers. Find the lost number.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` remaining numbers (all different, in any order).'],
    outputFormat: ['Print the missing number.'],
    constraints: ['1 <= n <= 20000'],
    examples: [{ input: '4\n3 1 5 2\n', note: 'The numbers 1 to 5 were written and 4 is missing.' }],
    hints: ['The complete set is 1, 2, ..., n + 1.', 'The sum of 1..m is `m * (m + 1) / 2`.', 'Subtract the sum of the given numbers from the full sum.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        m = n + 1
        print(m * (m + 1) // 2 - sum(a))`,
      cpp: r`
        long long m = n + 1;
        long long sum = 0;
        for (int i = 0; i < n; i++) sum += a[i];
        cout << m * (m + 1) / 2 - sum << "\n";`,
      java: r`
        long m = n + 1;
        long sum = 0;
        for (int i = 0; i < n; i++) sum += a[i];
        System.out.println(m * (m + 1) / 2 - sum);`
    },
    solution: { explanation: ['The sum of 1..n+1 is known by a formula. The difference to the sum of the given numbers is the missing one.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); const m = a.length + 1; return String((m * (m + 1)) / 2 - a.reduce((s, x) => s + x, 0)); },
    tests() { const g = rng(108); const make = (n, hole) => { const all = []; for (let v = 1; v <= n + 1; v++) if (v !== hole) all.push(v); return arr(shuffle(g, all)); }; return ['4\n3 1 5 2\n', '1\n2\n', '1\n1\n', make(5, 1), make(5, 6), make(20, 7), make(1000, 512), make(20000, 19999), make(20000, 1)]; }
  },

  {
    slug: 'balance-point',
    title: 'Balance Point',
    difficulty: 'easy',
    tags: ['arrays', 'prefix-sum'],
    concept: {
      title: 'Left sum and right sum from one total',
      body: [
        'To compare the sum on the left of a position with the sum on the right, you do not need to add them up again for every position. Compute the **total** once. While walking from the left, keep the sum of everything before the current element; the sum after it is `total - left - a[i]`.',
        { code: 'left = 0\nfor i in range(n):\n    right = total - left - a[i]\n    if left == right:\n        # position i balances\n    left += a[i]' },
        'Updating `left` after the check keeps the current element out of both sides. This turns a quadratic search into one pass.'
      ]
    },
    statement: ['Find the smallest index `i` (counting from 0) such that the sum of the elements to the left of `i` equals the sum of the elements to the right of `i`. The element at `i` itself is in neither sum, and an empty side has sum 0. If there is no such index, print -1.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the index, or -1.'],
    constraints: ['1 <= n <= 20000', '-10^4 <= each number <= 10^4'],
    examples: [{ input: '6\n1 7 3 6 5 6\n', note: 'At index 3 the left sum is 1+7+3 = 11 and the right sum is 5+6 = 11.' }, { input: '3\n1 2 3\n', note: 'No index balances.' }],
    hints: ['First compute the sum of the whole array.', 'While walking, keep `left`, the sum of the elements before the current one.', 'The right sum is `total - left - a[i]`.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        total = sum(a)
        left = 0
        answer = -1
        for i in range(n):
            if left == total - left - a[i]:
                answer = i
                break
            left += a[i]
        print(answer)`,
      cpp: r`
        long long total = 0;
        for (int i = 0; i < n; i++) total += a[i];
        long long left = 0;
        int answer = -1;
        for (int i = 0; i < n; i++) {
            if (left == total - left - a[i]) {
                answer = i;
                break;
            }
            left += a[i];
        }
        cout << answer << "\n";`,
      java: r`
        long total = 0;
        for (int i = 0; i < n; i++) total += a[i];
        long left = 0;
        int answer = -1;
        for (int i = 0; i < n; i++) {
            if (left == total - left - a[i]) {
                answer = i;
                break;
            }
            left += a[i];
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['Compute the total once. At each index the right sum is the total minus the left sum minus the element, so each index is checked in O(1).'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); const total = a.reduce((s, x) => s + x, 0); let left = 0; for (let i = 0; i < a.length; i++) { if (left === total - left - a[i]) return String(i); left += a[i]; } return '-1'; },
    tests() { const g = rng(109); return ['6\n1 7 3 6 5 6\n', '3\n1 2 3\n', '1\n5\n', '3\n2 1 -1\n', '3\n-1 1 2\n', '4\n0 0 0 0\n', big(g, 15, -3, 3), big(g, 20000, -10000, 10000), `20000\n${many(20000, (i) => (i === 10000 ? 7 : 1)).join(' ')}\n`, '5\n1 -1 0 1 -1\n']; }
  },

  {
    slug: 'range-sum-queries',
    title: 'Range Sum Queries',
    difficulty: 'easy',
    tags: ['arrays', 'prefix-sum', 'queries'],
    concept: {
      title: 'Answer many range sums with one table',
      body: [
        'If you add up the elements again for every query, many queries on a long array are too slow. Instead build the prefix sums once: `p[i]` is the sum of the first `i` elements, with `p[0] = 0`.',
        { code: 'p = [0] * (n + 1)\nfor i in range(n):\n    p[i + 1] = p[i] + a[i]\n# sum of a[l..r] (1-based, inclusive):\nanswer = p[r] - p[l - 1]' },
        'The sum of a block is the prefix up to its end minus the prefix just before its start. After the O(n) preparation, every query costs O(1).'
      ]
    },
    statement: ['You are given an array of `n` integers and `q` queries. Each query gives two positions `l` and `r` (counting from 1). Print the sum of the elements from position `l` to position `r`, both included.'],
    inputFormat: ['The first line has `n` and `q`.', 'The second line has `n` integers.', 'Each of the next `q` lines has `l` and `r`.'],
    outputFormat: ['Print `q` lines, one answer per query.'],
    constraints: ['1 <= n, q <= 20000', '1 <= l <= r <= n', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5 3\n1 2 3 4 5\n1 5\n2 3\n4 4\n', note: 'The answers are 15, 5 and 4.' }],
    hints: ['Adding up the block for every query is too slow when n and q are large.', 'Build `p` where `p[i]` is the sum of the first i elements.', 'The answer is `p[r] - p[l - 1]`.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'qs:int[q][2]'],
      fast: true,
      python: r`
        p = [0] * (n + 1)
        for i in range(n):
            p[i + 1] = p[i] + a[i]
        out = []
        for l, rr in qs:
            out.append(p[rr] - p[l - 1])
        print("\n".join(map(str, out)))`,
      cpp: r`
        vector<long long> p(n + 1, 0);
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + a[i];
        for (int k = 0; k < q; k++) {
            cout << p[qs[k][1]] - p[qs[k][0] - 1] << "\n";
        }`,
      java: r`
        long[] p = new long[(int) n + 1];
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + a[i];
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < q; k++) {
            sb.append(p[(int) qs[k][1]] - p[(int) qs[k][0] - 1]).append("\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Build prefix sums once. A block sum is a difference of two prefix sums, so each query takes constant time.'], complexity: 'Time O(n + q), space O(n).' },
    solve(input) { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const p = [0]; for (const x of a) p.push(p[p.length - 1] + x); const out = []; for (let k = 0; k < q; k++) { const [l, rr] = nums(rs[2 + k]); out.push(p[rr] - p[l - 1]); } return out.join('\n'); },
    tests() { const g = rng(110); const make = (n, q, lo, hi) => { let s = `${n} ${q}\n${randArray(g, n, lo, hi).join(' ')}\n`; for (let k = 0; k < q; k++) { const l = randInt(g, 1, n); s += `${l} ${randInt(g, l, n)}\n`; } return s; }; return ['5 3\n1 2 3 4 5\n1 5\n2 3\n4 4\n', '1 1\n-4\n1 1\n', make(10, 8, -9, 9), make(50, 30, -1000, 1000), make(20000, 20000, -1000000000, 1000000000), make(20000, 10000, 0, 1000000000)]; }
  }
];
