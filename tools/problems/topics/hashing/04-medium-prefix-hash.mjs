import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
// Runs fast(a) against a brute force on many small random inputs; throws when they differ.
const crossCheck = (g, make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const blocks = (a, test) => { let c = 0; for (let i = 0; i < a.length; i++) { let s = 0; for (let j = i; j < a.length; j++) { s += a[j]; if (test(s, i, j)) c++; } } return c; };

export default [
  {
    slug: 'subarray-sum-equals-k',
    title: 'Count the Blocks With Sum k',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'prefix-sum'],
    concept: {
      title: 'Prefix sums and a map of how often each occurred',
      body: [
        'The sum of the block that ends at position `j` and starts after position `i` is `prefix[j] - prefix[i]`. We want this to be `k`, so for a fixed end `j` we need the **number of earlier prefixes equal to `prefix[j] - k`**. A map from each prefix sum to the number of times it occurred answers that in O(1).',
        { code: 'count = {0: 1}          # the empty prefix\nprefix = total = 0\nfor x in a:\n    prefix += x\n    total += count.get(prefix - k, 0)\n    count[prefix] = count.get(prefix, 0) + 1' },
        'This works with negative numbers too, which is where the sliding window of the previous topic fails. The map must be updated **after** counting, and it starts with the empty prefix 0, so that blocks starting at the first element are found.'
      ]
    },
    statement: ['Given an array of `n` integers (negative numbers are possible) and a number `k`, count the blocks of consecutive elements whose sum is exactly `k`.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of blocks.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9', '-2 * 10^13 <= k <= 2 * 10^13'],
    examples: [{ input: '5 3\n1 2 1 -1 2\n', note: 'The blocks 1 2, 2 1 and 1 2 1 -1 have sum 3.' }],
    hints: ['Use the prefix sum: a block is `prefix[j] - prefix[i]`.', 'For each end position count how many earlier prefixes equal `prefix - k`.', 'Keep those counts in a map that starts with the entry `0 -> 1`.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {0: 1}
        prefix = 0
        total = 0
        for x in a:
            prefix += x
            total += count.get(prefix - k, 0)
            count[prefix] = count.get(prefix, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> count;
        count[0] = 1;
        long long prefix = 0, total = 0;
        for (int i = 0; i < n; i++) {
            prefix += a[i];
            auto it = count.find(prefix - k);
            if (it != count.end()) total += it->second;
            count[prefix]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> count = new HashMap<>();
        count.put(0L, 1L);
        long prefix = 0, total = 0;
        for (int i = 0; i < n; i++) {
            prefix += a[i];
            total += count.getOrDefault(prefix - k, 0L);
            count.merge(prefix, 1L, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['For each end position, the number of blocks with sum `k` ending there equals the number of earlier prefix sums equal to `prefix - k`.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]); const c = new Map([[0, 1]]); let p = 0, t = 0; for (const x of a) { p += x; t += c.get(p - k) || 0; c.set(p, (c.get(p) || 0) + 1); } return String(t); },
    tests() {
      const g = rng(331);
      const make = (n, lo, hi, k) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      crossCheck(g, () => make(randInt(g, 1, 10), -3, 3, randInt(g, -4, 4)), (i) => this.solve(i), (i) => { const rs = rows(i); const k = nums(rs[0])[1]; return blocks(nums(rs[1]), (s) => s === k); });
      return ['5 3\n1 2 1 -1 2\n', '1 5\n5\n', '1 0\n5\n', '3 0\n0 0 0\n', '4 7\n1 1 1 1\n', make(30, -3, 3, 2), make(2000, -100, 100, 0), make(20000, -1000000000, 1000000000, 123456), make(20000, -2, 2, 1), make(20000, 0, 0, 0), make(20000, -50, 50, 10)];
    }
  },

  {
    slug: 'longest-block-with-sum-k',
    title: 'The Longest Block With Sum k',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'prefix-sum'],
    concept: {
      title: 'Remember where each prefix sum appeared first',
      body: [
        'To get the **longest** block with sum `k` you need the **earliest** start for each end. A block ends at `j` and starts right after an earlier prefix with value `prefix[j] - k`; the earlier that prefix occurred, the longer the block. So the map stores for each prefix sum the position of its **first** occurrence only.',
        { code: 'first = {0: -1}\nprefix = best = 0\nfor i, x in enumerate(a):\n    prefix += x\n    if prefix - k in first:\n        best = max(best, i - first[prefix - k])\n    if prefix not in first:            # keep the first occurrence\n        first[prefix] = i' },
        'The map entry for the empty prefix is `0 -> -1`, so that blocks beginning at index 0 have the right length `i - (-1) = i + 1`.'
      ]
    },
    statement: ['Given an array of `n` integers and a number `k`, find the length of the longest block of consecutive elements whose sum is exactly `k`. If there is no such block, print 0.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the length.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9', '-2 * 10^13 <= k <= 2 * 10^13'],
    examples: [{ input: '6 4\n1 -1 5 -2 3 0\n', note: 'The block -1 5 has sum 4 and length 2; no longer block has sum 4.' }],
    hints: ['Use prefix sums again.', 'Store the first position at which each prefix sum occurred.', 'For each end position look up `prefix - k` and measure the distance.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        first = {0: -1}
        prefix = 0
        best = 0
        for i in range(n):
            prefix += a[i]
            if prefix - k in first:
                best = max(best, i - first[prefix - k])
            if prefix not in first:
                first[prefix] = i
        print(best)`,
      cpp: r`
        unordered_map<long long, int> first;
        first[0] = -1;
        long long prefix = 0;
        int best = 0;
        for (int i = 0; i < n; i++) {
            prefix += a[i];
            auto it = first.find(prefix - k);
            if (it != first.end()) best = max(best, i - it->second);
            if (!first.count(prefix)) first[prefix] = i;
        }
        cout << best << "\n";`,
      java: r`
        Map<Long, Integer> first = new HashMap<>();
        first.put(0L, -1);
        long prefix = 0;
        int best = 0;
        for (int i = 0; i < n; i++) {
            prefix += a[i];
            Integer start = first.get(prefix - k);
            if (start != null) best = Math.max(best, i - start);
            first.putIfAbsent(prefix, i);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The earliest occurrence of each prefix sum gives the longest block ending at the current position. Storing only first occurrences keeps the blocks as long as possible.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]); const first = new Map([[0, -1]]); let p = 0, best = 0; for (let i = 0; i < a.length; i++) { p += a[i]; if (first.has(p - k)) best = Math.max(best, i - first.get(p - k)); if (!first.has(p)) first.set(p, i); } return String(best); },
    tests() {
      const g = rng(332);
      const make = (n, lo, hi, k) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (i) => { const rs = rows(i); const k = nums(rs[0])[1]; const a = nums(rs[1]); let best = 0; for (let x = 0; x < a.length; x++) { let s = 0; for (let y = x; y < a.length; y++) { s += a[y]; if (s === k) best = Math.max(best, y - x + 1); } } return best; };
      crossCheck(g, () => make(randInt(g, 1, 10), -3, 3, randInt(g, -4, 4)), (i) => this.solve(i), brute);
      return ['6 4\n1 -1 5 -2 3 0\n', '1 5\n5\n', '1 0\n5\n', '3 0\n0 0 0\n', '4 7\n1 1 1 1\n', make(30, -3, 3, 2), make(2000, -100, 100, 0), make(20000, -1000000000, 1000000000, 123456), make(20000, -2, 2, 1), make(20000, 0, 0, 0), make(20000, -50, 50, 10)];
    }
  },

  {
    slug: 'longest-block-equal-zeros-ones',
    title: 'Longest Block With Equally Many 0s and 1s',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'prefix-sum', 'binary'],
    concept: {
      title: 'Turn the zeros into minus ones',
      body: [
        'A block with the same number of 0s and 1s becomes a block with sum 0 if every **0 is counted as -1**. Then the longest balanced block is the longest block whose prefix sums at both ends are equal. Store the first position of every prefix sum.',
        { code: 'first = {0: -1}\nbalance = best = 0\nfor i, x in enumerate(a):\n    balance += 1 if x == 1 else -1\n    if balance in first:\n        best = max(best, i - first[balance])\n    else:\n        first[balance] = i' },
        'The trick "replace one kind of element by -1 so that balance means sum zero" is useful for all questions that compare two counts inside a block.'
      ]
    },
    statement: ['Given an array of 0s and 1s, find the length of the longest block of consecutive elements that contains the same number of 0s and 1s. If there is none, print 0.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` numbers, each 0 or 1.'],
    outputFormat: ['Print the length.'],
    constraints: ['1 <= n <= 20000'],
    examples: [{ input: '6\n0 1 0 0 1 1\n', note: 'The whole array has three 0s and three 1s.' }],
    hints: ['Count a 0 as -1 and a 1 as +1.', 'A balanced block has the same balance at its two ends.', 'Store the first position of each balance value.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        first = {0: -1}
        balance = 0
        best = 0
        for i in range(n):
            balance += 1 if a[i] == 1 else -1
            if balance in first:
                best = max(best, i - first[balance])
            else:
                first[balance] = i
        print(best)`,
      cpp: r`
        unordered_map<int, int> first;
        first[0] = -1;
        int balance = 0, best = 0;
        for (int i = 0; i < n; i++) {
            balance += a[i] == 1 ? 1 : -1;
            auto it = first.find(balance);
            if (it != first.end()) best = max(best, i - it->second);
            else first[balance] = i;
        }
        cout << best << "\n";`,
      java: r`
        Map<Integer, Integer> first = new HashMap<>();
        first.put(0, -1);
        int balance = 0, best = 0;
        for (int i = 0; i < n; i++) {
            balance += a[i] == 1 ? 1 : -1;
            Integer start = first.get(balance);
            if (start != null) best = Math.max(best, i - start);
            else first.put(balance, i);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['With 0 counted as -1, balanced blocks are the blocks between two equal prefix balances; the earliest occurrence gives the longest one.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const first = new Map([[0, -1]]); let b = 0, best = 0; a.forEach((x, i) => { b += x === 1 ? 1 : -1; if (first.has(b)) best = Math.max(best, i - first.get(b)); else first.set(b, i); }); return String(best); },
    tests() {
      const g = rng(333);
      const bits = (n, p) => arr(many(n, () => (g() < p ? 1 : 0)));
      const brute = (i) => { const a = nums(rows(i)[1]); let best = 0; for (let x = 0; x < a.length; x++) { let s = 0; for (let y = x; y < a.length; y++) { s += a[y] === 1 ? 1 : -1; if (s === 0) best = Math.max(best, y - x + 1); } } return best; };
      crossCheck(g, () => bits(randInt(g, 1, 12), 0.5), (i) => this.solve(i), brute);
      return ['6\n0 1 0 0 1 1\n', '1\n0\n', '2\n0 1\n', '3\n1 1 1\n', '5\n0 0 1 0 0\n', bits(30, 0.5), bits(2000, 0.5), bits(20000, 0.5), bits(20000, 0.9), bits(20000, 0.5), arr(many(20000, (i) => (i < 10000 ? 0 : 1)))];
    }
  },

  {
    slug: 'count-blocks-equal-zeros-ones',
    title: 'Count the Blocks With Equally Many 0s and 1s',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'prefix-sum', 'binary'],
    concept: {
      title: 'Count pairs of equal prefix balances',
      body: [
        'With 0 counted as -1, every balanced block corresponds to a **pair of equal prefix balances** (an earlier and a later one). So if a balance value has occurred `c` times before, the current position completes `c` balanced blocks.',
        { code: 'count = {0: 1}\nbalance = total = 0\nfor x in a:\n    balance += 1 if x == 1 else -1\n    total += count.get(balance, 0)\n    count[balance] = count.get(balance, 0) + 1' },
        'It is the "count" twin of the previous problem: there you needed the first position of each balance, here you need how often each balance occurred. A map with counts instead of positions.'
      ]
    },
    statement: ['Given an array of 0s and 1s, count the blocks of consecutive elements that contain the same number of 0s and 1s.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` numbers, each 0 or 1.'],
    outputFormat: ['Print the number of blocks.'],
    constraints: ['1 <= n <= 20000'],
    examples: [{ input: '4\n0 1 0 1\n', note: 'The balanced blocks are 0 1, 1 0, 0 1 and 0 1 0 1: four blocks.' }],
    hints: ['Count a 0 as -1 and a 1 as +1.', 'A block is balanced when the balances at its ends are equal.', 'Add the number of earlier equal balances at each step.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {0: 1}
        balance = 0
        total = 0
        for x in a:
            balance += 1 if x == 1 else -1
            total += count.get(balance, 0)
            count[balance] = count.get(balance, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<int, long long> count;
        count[0] = 1;
        int balance = 0;
        long long total = 0;
        for (int i = 0; i < n; i++) {
            balance += a[i] == 1 ? 1 : -1;
            total += count[balance];
            count[balance]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Integer, Long> count = new HashMap<>();
        count.put(0, 1L);
        int balance = 0;
        long total = 0;
        for (int i = 0; i < n; i++) {
            balance += a[i] == 1 ? 1 : -1;
            total += count.getOrDefault(balance, 0L);
            count.merge(balance, 1L, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Each earlier occurrence of the current balance is the start of one balanced block ending here.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const c = new Map([[0, 1]]); let b = 0, t = 0; for (const x of a) { b += x === 1 ? 1 : -1; t += c.get(b) || 0; c.set(b, (c.get(b) || 0) + 1); } return String(t); },
    tests() {
      const g = rng(334);
      const bits = (n, p) => arr(many(n, () => (g() < p ? 1 : 0)));
      const brute = (i) => { const a = nums(rows(i)[1]); let c = 0; for (let x = 0; x < a.length; x++) { let s = 0; for (let y = x; y < a.length; y++) { s += a[y] === 1 ? 1 : -1; if (s === 0) c++; } } return c; };
      crossCheck(g, () => bits(randInt(g, 1, 12), 0.5), (i) => this.solve(i), brute);
      return ['4\n0 1 0 1\n', '1\n1\n', '2\n1 0\n', '4\n1 1 1 1\n', '6\n0 1 0 0 1 1\n', bits(30, 0.5), bits(2000, 0.5), bits(20000, 0.5), bits(20000, 0.7), arr(many(20000, (i) => i % 2))];
    }
  },

  {
    slug: 'subarrays-divisible-by-k',
    title: 'Blocks Whose Sum Is a Multiple of k',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'prefix-sum', 'modulo'],
    concept: {
      title: 'Equal remainders of prefix sums',
      body: [
        'The block between two prefixes has the sum `prefix[j] - prefix[i]`. That difference is a multiple of `k` exactly when the two prefix sums leave the **same remainder** when divided by `k`. So count how often each remainder has occurred; every earlier prefix with the same remainder is the start of a good block.',
        { code: 'count = {0: 1}\nprefix = total = 0\nfor x in a:\n    prefix += x\n    r = prefix % k\n    total += count.get(r, 0)\n    count[r] = count.get(r, 0) + 1' },
        'Careful with negative numbers: in C++ and Java `%` can give a negative remainder. Normalise it into `0..k-1` with `((prefix % k) + k) % k` (Java: `Math.floorMod`). Python already returns a non-negative remainder.'
      ]
    },
    statement: ['Given an array of `n` integers (possibly negative) and a number `k`, count the blocks of consecutive elements whose sum is divisible by `k` (a sum of 0 is divisible).'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of blocks.'],
    constraints: ['1 <= n <= 20000', '1 <= k <= 10^9', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5 5\n4 5 0 -2 -3\n', note: 'Six blocks: 5, 5 0, 0, -2 -3, 0 -2 -3 and 5 0 -2 -3.' }],
    hints: ['A block sum is a difference of two prefix sums.', 'The difference is divisible by k when both have the same remainder.', 'Count the remainders; make negative remainders non-negative.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {0: 1}
        prefix = 0
        total = 0
        for x in a:
            prefix += x
            rem = prefix % k
            total += count.get(rem, 0)
            count[rem] = count.get(rem, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> count;
        count[0] = 1;
        long long prefix = 0, total = 0;
        for (int i = 0; i < n; i++) {
            prefix += a[i];
            long long rem = ((prefix % k) + k) % k;
            total += count[rem];
            count[rem]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> count = new HashMap<>();
        count.put(0L, 1L);
        long prefix = 0, total = 0;
        for (int i = 0; i < n; i++) {
            prefix += a[i];
            long rem = Math.floorMod(prefix, k);
            total += count.getOrDefault(rem, 0L);
            count.merge(rem, 1L, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Two prefix sums with the same remainder modulo `k` enclose a block whose sum is divisible by `k`. The map counts the remainders seen so far.'], complexity: 'Time O(n) on average, space O(min(n, k)).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]); const c = new Map([[0, 1]]); let p = 0, t = 0; for (const x of a) { p += x; const m = ((p % k) + k) % k; t += c.get(m) || 0; c.set(m, (c.get(m) || 0) + 1); } return String(t); },
    tests() {
      const g = rng(335);
      const make = (n, lo, hi, k) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (i) => { const rs = rows(i); const k = nums(rs[0])[1]; return blocks(nums(rs[1]), (s) => s % k === 0); };
      crossCheck(g, () => make(randInt(g, 1, 10), -9, 9, randInt(g, 1, 6)), (i) => this.solve(i), brute);
      return ['5 5\n4 5 0 -2 -3\n', '1 3\n3\n', '1 3\n4\n', '3 1\n7 8 9\n', make(30, -20, 20, 7), make(2000, -1000, 1000, 13), make(20000, -1000000000, 1000000000, 999999937), make(20000, -1000000000, 1000000000, 7), make(20000, -50, 50, 1000), make(20000, 0, 10, 2)];
    }
  },

  {
    slug: 'continuous-sum-multiple-of-k',
    title: 'A Block of Length Two or More With Sum Divisible by k',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'prefix-sum', 'modulo'],
    concept: {
      title: 'The earliest index of each remainder',
      body: [
        'Now the block must have at least **two** elements. Two prefix sums with the same remainder enclose a block whose sum is divisible by `k`, but the block has the right length only if the two prefixes are **at least 2 positions apart**. So store the **earliest** index of each remainder and compare distances.',
        { code: 'first = {0: -1}\nprefix = 0\nfor i, x in enumerate(a):\n    prefix += x\n    r = prefix % k\n    if r in first:\n        if i - first[r] >= 2: return True\n    else:\n        first[r] = i' },
        'Do not overwrite the stored index of a remainder when you see it again: the earliest position gives the longest block and so the best chance to reach length 2.'
      ]
    },
    statement: ['Is there a block of at least two consecutive elements whose sum is divisible by `k` (a sum of 0 counts)? Print `yes` or `no`.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20000', '1 <= k <= 10^9', '0 <= each number <= 10^9'],
    examples: [{ input: '5 6\n23 2 4 6 7\n', note: 'The block 2 4 has sum 6.' }, { input: '3 6\n23 2 6\n', note: 'The sums of the blocks of two or more elements are 25, 8 and 31, none a multiple of 6.' }],
    hints: ['Equal remainders of two prefix sums mean a good block between them.', 'The block needs at least two elements, so the prefixes must be at least 2 apart.', 'Store only the first index of each remainder.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        first = {0: -1}
        prefix = 0
        found = False
        for i in range(n):
            prefix += a[i]
            rem = prefix % k
            if rem in first:
                if i - first[rem] >= 2:
                    found = True
                    break
            else:
                first[rem] = i
        print("yes" if found else "no")`,
      cpp: r`
        unordered_map<long long, int> first;
        first[0] = -1;
        long long prefix = 0;
        bool found = false;
        for (int i = 0; i < n && !found; i++) {
            prefix += a[i];
            long long rem = prefix % k;
            auto it = first.find(rem);
            if (it != first.end()) {
                if (i - it->second >= 2) found = true;
            } else {
                first[rem] = i;
            }
        }
        cout << (found ? "yes" : "no") << "\n";`,
      java: r`
        Map<Long, Integer> first = new HashMap<>();
        first.put(0L, -1);
        long prefix = 0;
        boolean found = false;
        for (int i = 0; i < n && !found; i++) {
            prefix += a[i];
            long rem = prefix % k;
            Integer start = first.get(rem);
            if (start != null) {
                if (i - start >= 2) found = true;
            } else {
                first.put(rem, i);
            }
        }
        System.out.println(found ? "yes" : "no");`
    },
    solution: { explanation: ['The earliest index of each remainder gives the longest block; it only has to be at least two elements long.'], complexity: 'Time O(n) on average, space O(min(n, k)).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]); const first = new Map([[0, -1]]); let p = 0; for (let i = 0; i < a.length; i++) { p += a[i]; const m = p % k; if (first.has(m)) { if (i - first.get(m) >= 2) return 'yes'; } else first.set(m, i); } return 'no'; },
    tests() {
      const g = rng(336);
      const make = (n, hi, k) => `${n} ${k}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (i) => { const rs = rows(i); const k = nums(rs[0])[1]; const a = nums(rs[1]); for (let x = 0; x < a.length; x++) { let s = a[x]; for (let y = x + 1; y < a.length; y++) { s += a[y]; if (s % k === 0) return 'yes'; } } return 'no'; };
      crossCheck(g, () => make(randInt(g, 1, 8), 9, randInt(g, 1, 12)), (i) => this.solve(i), brute);
      return ['5 6\n23 2 4 6 7\n', '3 6\n23 2 6\n', '1 3\n3\n', '2 3\n1 2\n', '2 5\n0 0\n', make(20, 10, 7), make(20000, 1000000000, 999999937), make(20000, 1000000000, 20001), make(20000, 3, 100000), make(20000, 1000000000, 1000000000), '3 4\n1 3 4\n'];
    }
  },

  {
    slug: 'nice-subarrays',
    title: 'Blocks With Exactly k Odd Numbers',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'prefix-sum', 'counting'],
    concept: {
      title: 'Prefix counts of odd numbers',
      body: [
        'Let `odd` be the number of odd elements among the first `i` elements. A block between two prefixes has exactly `k` odd numbers when the two prefix counts differ by `k`. This is the "sum equals k" problem, where each element contributes 1 if it is odd and 0 if it is even.',
        { code: 'count = {0: 1}\nodd = total = 0\nfor x in a:\n    odd += x % 2\n    total += count.get(odd - k, 0)\n    count[odd] = count.get(odd, 0) + 1' },
        'Many questions have this shape: turn each element into a small number (0, 1, -1, ...) that tells how much it adds to a quantity of interest, then count blocks by prefix sums.'
      ]
    },
    statement: ['Count the blocks of consecutive elements that contain exactly `k` odd numbers.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of blocks.'],
    constraints: ['1 <= n <= 20000', '0 <= k <= n', '1 <= each number <= 10^9'],
    examples: [{ input: '5 2\n1 1 2 1 1\n', note: 'Five blocks: 1 1, 1 1 2, 1 2 1, 2 1 1 and the last 1 1.' }],
    hints: ['Count how many odd numbers there are in each prefix.', 'A block with exactly k odd numbers is a pair of prefixes whose counts differ by k.', 'Use a map of how often each prefix count occurred.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {0: 1}
        odd = 0
        total = 0
        for x in a:
            odd += x % 2
            total += count.get(odd - k, 0)
            count[odd] = count.get(odd, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> count;
        count[0] = 1;
        long long odd = 0, total = 0;
        for (int i = 0; i < n; i++) {
            odd += a[i] % 2;
            auto it = count.find(odd - k);
            if (it != count.end()) total += it->second;
            count[odd]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> count = new HashMap<>();
        count.put(0L, 1L);
        long odd = 0, total = 0;
        for (int i = 0; i < n; i++) {
            odd += a[i] % 2;
            total += count.getOrDefault(odd - k, 0L);
            count.merge(odd, 1L, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Prefix counts of odd numbers turn the question into counting pairs of prefixes that differ by `k`.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]); const c = new Map([[0, 1]]); let odd = 0, t = 0; for (const x of a) { odd += x % 2; t += c.get(odd - k) || 0; c.set(odd, (c.get(odd) || 0) + 1); } return String(t); },
    tests() {
      const g = rng(337);
      const make = (n, k, p) => `${n} ${k}\n${many(n, () => (g() < p ? 2 * randInt(g, 0, 499999999) + 1 : 2 * randInt(g, 1, 500000000))).join(' ')}\n`;
      const brute = (i) => { const rs = rows(i); const k = nums(rs[0])[1]; const a = nums(rs[1]); let c = 0; for (let x = 0; x < a.length; x++) { let o = 0; for (let y = x; y < a.length; y++) { o += a[y] % 2; if (o === k) c++; } } return c; };
      crossCheck(g, () => make(randInt(g, 1, 10), randInt(g, 0, 4), 0.5), (i) => this.solve(i), brute);
      return ['5 2\n1 1 2 1 1\n', '1 0\n2\n', '1 1\n3\n', '3 0\n2 4 6\n', '3 3\n1 3 5\n', make(30, 2, 0.5), make(2000, 5, 0.4), make(20000, 0, 0.1), make(20000, 3, 0.5), make(20000, 100, 0.5), make(20000, 20000, 1)];
    }
  },

  {
    slug: 'vowel-consonant-balance',
    title: 'Substrings With As Many Vowels as Consonants',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'prefix-sum', 'strings'],
    concept: {
      title: 'Balance of two kinds of letters',
      body: [
        'Give every vowel the value +1 and every consonant the value -1. A substring has as many vowels as consonants exactly when its values add up to 0, i.e. when the **prefix balance is the same at both ends**. Count the substrings by counting pairs of equal prefix balances.',
        { code: 'count = {0: 1}\nbalance = total = 0\nfor ch in s:\n    balance += 1 if ch in "aeiou" else -1\n    total += count.get(balance, 0)\n    count[balance] = count.get(balance, 0) + 1' },
        'Only the letters `a e i o u` are vowels. The substring may start and end anywhere, so for a word of length `n` there are `n * (n + 1) / 2` substrings to consider, but one pass over the word is enough.'
      ]
    },
    statement: ['Count the substrings (blocks of consecutive letters) of a word that contain the same number of vowels (a, e, i, o, u) and consonants.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the number of such substrings.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'abab\n', note: 'The substrings are ab (twice), ba and abab.' }],
    hints: ['Give vowels the value +1 and consonants -1.', 'A balanced substring has equal prefix balances at its two ends.', 'Count pairs of equal prefix balances with a map.'],
    program: {
      io: ['s:word'],
      includes: ['<unordered_map>'],
      python: r`
        count = {0: 1}
        balance = 0
        total = 0
        for ch in s:
            balance += 1 if ch in "aeiou" else -1
            total += count.get(balance, 0)
            count[balance] = count.get(balance, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<int, long long> count;
        count[0] = 1;
        int balance = 0;
        long long total = 0;
        for (char ch : s) {
            bool vowel = ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u';
            balance += vowel ? 1 : -1;
            total += count[balance];
            count[balance]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Integer, Long> count = new HashMap<>();
        count.put(0, 1L);
        int balance = 0;
        long total = 0;
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            boolean vowel = ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u';
            balance += vowel ? 1 : -1;
            total += count.getOrDefault(balance, 0L);
            count.merge(balance, 1L, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['With vowels as +1 and consonants as -1, the balanced substrings are the pairs of equal prefix balances, counted with a map.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { return fastCount(input.trim()); },
    tests() {
      const g = rng(338);
      const brute = (s) => { let t = 0; for (let i = 0; i < s.length; i++) { let b = 0; for (let j = i; j < s.length; j++) { b += 'aeiou'.includes(s[j]) ? 1 : -1; if (b === 0) t++; } } return t; };
      for (let k = 0; k < 200; k++) { const s = randWord(g, randInt(g, 1, 14), 'abe'); if (String(brute(s)) !== fastCount(s)) throw new Error('vowel balance reference differs from brute force'); }
      return ['abab\n', 'a\n', 'b\n', 'ab\n', 'aeiou\n', `${randWord(g, 30, LOW)}\n`, `${randWord(g, 2000, LOW)}\n`, `${randWord(g, 20000, 'ab')}\n`, `${randWord(g, 20000, LOW)}\n`, `${randWord(g, 20000, 'abcde')}\n`, `${'ab'.repeat(10000)}\n`];
    }
  },

  {
    slug: 'subarrays-with-xor-k',
    title: 'Blocks With Xor Equal to k',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'prefix-xor', 'bit-manipulation'],
    concept: {
      title: 'Prefix xors work like prefix sums',
      body: [
        'The **xor** of two numbers (`^` in Python, C++ and Java) has a special property: `x ^ x = 0` and `x ^ 0 = x`. So xor is "its own undo", like subtraction for sums. Let `px[i]` be the xor of the first `i` elements. The xor of the block between two prefixes is `px[j] ^ px[i]`.',
        { code: 'count = {0: 1}\nprefix = total = 0\nfor x in a:\n    prefix ^= x\n    total += count.get(prefix ^ k, 0)      # earlier prefix p with p ^ prefix = k\n    count[prefix] = count.get(prefix, 0) + 1' },
        'We want `px[j] ^ px[i] = k`, i.e. `px[i] = px[j] ^ k`. The structure is the same as for sums: a map of how often each prefix value occurred.'
      ]
    },
    statement: ['Count the blocks of consecutive elements whose xor (bitwise exclusive or of all elements) is equal to `k`.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of blocks.'],
    constraints: ['1 <= n <= 20000', '0 <= each number <= 10^9', '0 <= k <= 10^9'],
    examples: [{ input: '6 6\n4 2 2 6 4 1\n', note: 'Four blocks: [4 2], [2 2 6], [6] and [4 2 2 6 4].' }],
    hints: ['Define the prefix xor, like a prefix sum.', 'The block xor is the xor of two prefix values.', 'For each end, count earlier prefixes equal to `prefix ^ k`.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {0: 1}
        prefix = 0
        total = 0
        for x in a:
            prefix ^= x
            total += count.get(prefix ^ k, 0)
            count[prefix] = count.get(prefix, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> count;
        count[0] = 1;
        long long prefix = 0, total = 0;
        for (int i = 0; i < n; i++) {
            prefix ^= a[i];
            auto it = count.find(prefix ^ k);
            if (it != count.end()) total += it->second;
            count[prefix]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> count = new HashMap<>();
        count.put(0L, 1L);
        long prefix = 0, total = 0;
        for (int i = 0; i < n; i++) {
            prefix ^= a[i];
            total += count.getOrDefault(prefix ^ k, 0L);
            count.merge(prefix, 1L, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['The xor of a block is the xor of two prefix xors. For each end, the earlier prefixes equal to `prefix ^ k` start the matching blocks.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]); const c = new Map([[0, 1]]); let p = 0, t = 0; for (const x of a) { p ^= x; t += c.get(p ^ k) || 0; c.set(p, (c.get(p) || 0) + 1); } return String(t); },
    tests() {
      const g = rng(339);
      const make = (n, hi, k) => `${n} ${k}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (i) => { const rs = rows(i); const k = nums(rs[0])[1]; const a = nums(rs[1]); let c = 0; for (let x = 0; x < a.length; x++) { let v = 0; for (let y = x; y < a.length; y++) { v ^= a[y]; if (v === k) c++; } } return c; };
      crossCheck(g, () => make(randInt(g, 1, 10), 7, randInt(g, 0, 7)), (i) => this.solve(i), brute);
      return ['6 6\n4 2 2 6 4 1\n', '1 5\n5\n', '1 0\n5\n', '3 0\n1 1 1\n', make(30, 15, 5), make(2000, 255, 77), make(20000, 1000000000, 123456789), make(20000, 7, 3), make(20000, 1, 0), make(20000, 1023, 1000)];
    }
  }
];

// Number of substrings with as many vowels as consonants, by prefix balances (used by the reference solution above).
function fastCount(s) { const c = new Map([[0, 1]]); let b = 0, t = 0; for (const ch of s) { b += 'aeiou'.includes(ch) ? 1 : -1; t += c.get(b) || 0; c.set(b, (c.get(b) || 0) + 1); } return String(t); }
