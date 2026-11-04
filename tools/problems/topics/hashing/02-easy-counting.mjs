import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';

const counts = (a) => { const c = new Map(); for (const x of a) c.set(x, (c.get(x) || 0) + 1); return c; };

export default [
  {
    slug: 'good-pairs',
    title: 'Count the Equal Pairs',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'counting'],
    concept: {
      title: 'Count the earlier partners',
      body: [
        'A pair of positions `i < j` with `a[i] == a[j]` is "good". Instead of testing every pair, look at each number `x` when you reach it: it forms one good pair with **every earlier copy of `x`**. A map `seen` stores how many copies of each value came before.',
        { code: 'seen = {}\ntotal = 0\nfor x in a:\n    total += seen.get(x, 0)       # one pair with each earlier copy\n    seen[x] = seen.get(x, 0) + 1' },
        'The answer can be large: if all 20000 numbers are equal, there are about 2 * 10^8 pairs, so use 64-bit integers in C++ and Java.'
      ]
    },
    statement: ['Count the pairs of positions `i < j` in an array of `n` integers with `a[i] = a[j]`.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of pairs.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6\n1 2 3 1 1 3\n', note: 'The pairs are (1, 4), (1, 5), (4, 5) and (3, 6).' }],
    hints: ['Trying all pairs takes about n * n / 2 steps.', 'When you read a number, the pairs it completes are the earlier copies of it.', 'Keep a map with the number of copies seen so far, and add that number to the answer.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        seen = {}
        total = 0
        for x in a:
            total += seen.get(x, 0)
            seen[x] = seen.get(x, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> seen;
        long long total = 0;
        for (int i = 0; i < n; i++) {
            total += seen[a[i]];
            seen[a[i]]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> seen = new HashMap<>();
        long total = 0;
        for (int i = 0; i < n; i++) {
            long before = seen.getOrDefault(a[i], 0L);
            total += before;
            seen.put(a[i], before + 1);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Each number forms a pair with every earlier equal number. A map of counts gives that number in O(1), so one pass is enough.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { let t = 0; for (const k of counts(nums(rows(input)[1])).values()) t += (k * (k - 1)) / 2; return String(t); },
    tests() { const g = rng(311); return ['6\n1 2 3 1 1 3\n', '1\n5\n', '4\n7 7 7 7\n', '4\n1 2 3 4\n', arr(randArray(g, 30, -3, 3)), arr(randArray(g, 2000, -50, 50)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, 0, 100)), arr(Array(20000).fill(7)), arr(randArray(g, 20000, 0, 2))]; }
  },

  {
    slug: 'count-pairs-with-sum',
    title: 'How Many Pairs Add Up?',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'counting', 'complement'],
    concept: {
      title: 'Count the partners that came before',
      body: [
        'This is the "two numbers that add up" idea with counting. A number `x` forms a pair with every earlier number equal to `k - x`. Keep a map with the number of copies seen so far; before adding `x`, add `seen[k - x]` to the total.',
        { code: 'seen = {}\ntotal = 0\nfor x in a:\n    total += seen.get(k - x, 0)\n    seen[x] = seen.get(x, 0) + 1' },
        'The order matters: check first, then insert. Otherwise `x` could be paired with itself when `2 * x = k`. Because every pair is counted when its second element is read, each pair is counted exactly once.'
      ]
    },
    statement: ['Count the pairs of positions `i < j` in an array of `n` integers with `a[i] + a[j] = k`.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of pairs.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9', '-2 * 10^9 <= k <= 2 * 10^9'],
    examples: [{ input: '5 6\n1 5 3 3 5\n', note: 'The pairs are (1, 2), (1, 5), (3, 4): 1+5, 1+5, 3+3.' }],
    hints: ['A pair is completed by its second element.', 'When you read `x`, add the number of earlier copies of `k - x`.', 'Insert `x` into the map only after counting.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        seen = {}
        total = 0
        for x in a:
            total += seen.get(k - x, 0)
            seen[x] = seen.get(x, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> seen;
        long long total = 0;
        for (int i = 0; i < n; i++) {
            auto it = seen.find(k - a[i]);
            if (it != seen.end()) total += it->second;
            seen[a[i]]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> seen = new HashMap<>();
        long total = 0;
        for (int i = 0; i < n; i++) {
            total += seen.getOrDefault(k - a[i], 0L);
            seen.merge(a[i], 1L, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Every pair is counted when its second number is read: the number of earlier copies of `k - x` is looked up in the map.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const c = counts(nums(rs[1])); let t = 0; for (const [x, cx] of c) { const y = k - x; if (x < y && c.has(y)) t += cx * c.get(y); else if (x === y) t += (cx * (cx - 1)) / 2; } return String(t); },
    tests() { const g = rng(312); const make = (n, lo, hi, k) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`; return ['5 6\n1 5 3 3 5\n', '1 4\n2\n', '2 4\n2 2\n', '3 100\n1 2 3\n', make(30, -5, 5, 2), make(2000, -100, 100, 0), make(20000, -1000000000, 1000000000, 123), make(20000, 0, 1000, 1000), make(20000, 0, 3, 4), make(20000, -50000, 50000, 0)]; }
  },

  {
    slug: 'pairs-with-difference',
    title: 'Pairs With a Given Difference',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'counting'],
    concept: {
      title: 'Look for two partners',
      body: [
        'Pairs whose values differ by exactly `k` (with `k >= 1`) come in two kinds for a number `x`: the partner is `x - k` or `x + k`. Both are different values, so no pair is counted twice. As before, keep a map of how often each value was seen earlier and add both counts when you read `x`.',
        { code: 'for x in a:\n    total += seen.get(x - k, 0) + seen.get(x + k, 0)\n    seen[x] = seen.get(x, 0) + 1' },
        'For `k = 0` the two partners would be the same value and the formula would count every pair twice, which is why `k` starts at 1 in this problem.'
      ]
    },
    statement: ['Count the pairs of positions `i < j` in an array of `n` integers for which `|a[i] - a[j]| = k`.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of pairs.'],
    constraints: ['1 <= n <= 20000', '1 <= k <= 10^9', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5 2\n1 3 1 5 3\n', note: 'Four pairs consist of a 1 and a 3 (two 1s times two 3s), and two pairs consist of a 3 and the 5: six pairs.' }],
    hints: ['For a number `x` the partners are `x - k` and `x + k`.', 'Use a map with the counts of the numbers read earlier.', 'Add both counts before inserting `x`.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        seen = {}
        total = 0
        for x in a:
            total += seen.get(x - k, 0) + seen.get(x + k, 0)
            seen[x] = seen.get(x, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> seen;
        long long total = 0;
        for (int i = 0; i < n; i++) {
            auto lower = seen.find(a[i] - k), upper = seen.find(a[i] + k);
            if (lower != seen.end()) total += lower->second;
            if (upper != seen.end()) total += upper->second;
            seen[a[i]]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> seen = new HashMap<>();
        long total = 0;
        for (int i = 0; i < n; i++) {
            total += seen.getOrDefault(a[i] - k, 0L) + seen.getOrDefault(a[i] + k, 0L);
            seen.merge(a[i], 1L, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Every pair is completed by its second number, whose partner is either `x - k` or `x + k`. The counts come from a map of the earlier numbers.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const c = counts(nums(rs[1])); let t = 0; for (const [x, cx] of c) if (c.has(x + k)) t += cx * c.get(x + k); return String(t); },
    tests() { const g = rng(313); const make = (n, lo, hi, k) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`; return ['5 2\n1 3 1 5 3\n', '1 1\n4\n', '2 1\n4 5\n', '2 3\n4 5\n', make(30, -5, 5, 2), make(2000, -100, 100, 7), make(20000, -1000000000, 1000000000, 1), make(20000, 0, 100, 5), make(20000, 0, 2, 1), make(20000, -1000000000, 1000000000, 999999999)]; }
  },

  {
    slug: 'missing-and-repeated',
    title: 'One Missing, One Repeated',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'counting'],
    concept: {
      title: 'Compare what is there with what should be there',
      body: [
        'The numbers `1, 2, ..., n` should each appear exactly once. Here one of them appears twice and another one is missing. Count how often each value occurs, then walk over the values `1..n`: the one with count 2 is the repeated number and the one with count 0 is the missing number.',
        { code: 'count = {}\nfor x in a:\n    count[x] = count.get(x, 0) + 1\nfor v in range(1, n + 1):\n    c = count.get(v, 0)\n    if c == 2: repeated = v\n    elif c == 0: missing = v' },
        'This works for any "should be there" check: build the counts from the data, then ask the map about every expected value.'
      ]
    },
    statement: ['An array has `n` integers, each between 1 and `n`. Exactly one value occurs twice and exactly one value of `1..n` does not occur at all; every other value occurs once. Print the repeated value and the missing value.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the repeated value and the missing value separated by a space.'],
    constraints: ['2 <= n <= 20000'],
    examples: [{ input: '5\n1 3 4 2 4\n', note: '4 appears twice and 5 is missing.' }],
    hints: ['Count the occurrences of every value.', 'Look at the values 1 to n: a count of 2 is the repeated one, a count of 0 is the missing one.', 'Print the repeated value first.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        repeated = missing = 0
        for v in range(1, n + 1):
            c = count.get(v, 0)
            if c == 2:
                repeated = v
            elif c == 0:
                missing = v
        print(repeated, missing)`,
      cpp: r`
        unordered_map<long long, int> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        long long repeated = 0, missing = 0;
        for (long long v = 1; v <= n; v++) {
            int c = count.count(v) ? count[v] : 0;
            if (c == 2) repeated = v;
            else if (c == 0) missing = v;
        }
        cout << repeated << " " << missing << "\n";`,
      java: r`
        Map<Long, Integer> count = new HashMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1, Integer::sum);
        long repeated = 0, missing = 0;
        for (long v = 1; v <= n; v++) {
            int c = count.getOrDefault(v, 0);
            if (c == 2) repeated = v;
            else if (c == 0) missing = v;
        }
        System.out.println(repeated + " " + missing);`
    },
    solution: { explanation: ['After counting, the expected values `1..n` are checked one by one: count 2 marks the repeated number and count 0 the missing one.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const n = a.length; const c = counts(a); let rep = 0, mis = 0; for (let v = 1; v <= n; v++) { const k = c.get(v) || 0; if (k === 2) rep = v; else if (k === 0) mis = v; } return `${rep} ${mis}`; },
    tests() { const g = rng(314); const make = (n) => { const p = shuffle(g, many(n, (i) => i + 1)); const i = randInt(g, 0, n - 1); let j = randInt(g, 0, n - 1); while (j === i) j = randInt(g, 0, n - 1); p[i] = p[j]; return arr(p); }; return ['5\n1 3 4 2 4\n', '2\n1 1\n', '2\n2 2\n', '3\n3 1 3\n', make(8), make(100), make(2000), make(20000), make(20000), make(19999)]; }
  },

  {
    slug: 'unique-occurrences',
    title: 'Are the Frequencies All Different?',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'hash-set', 'counting'],
    concept: {
      title: 'A set of the counts',
      body: [
        'First count how often each value occurs (a map from value to count). The question is whether **all these counts are different**. The counts are numbers too, so put them into a set: if the set has as many elements as the map has entries, no two values had the same count.',
        { code: 'count = {}\nfor x in a:\n    count[x] = count.get(x, 0) + 1\nanswer = len(set(count.values())) == len(count)' },
        'Using one hash structure on the output of another is a common pattern: count first, then examine the counts.'
      ]
    },
    statement: ['Print `yes` if every value of the array occurs a different number of times than every other value, otherwise print `no`.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6\n1 2 2 1 1 3\n', note: '1 occurs 3 times, 2 twice and 3 once: all different.' }, { input: '2\n1 2\n', note: 'Both occur once.' }],
    hints: ['Count how often each value occurs.', 'Put the counts into a set.', 'The answer is yes when the set has the same size as the number of different values.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<unordered_set>'],
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        print("yes" if len(set(count.values())) == len(count) else "no")`,
      cpp: r`
        unordered_map<long long, int> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        unordered_set<int> distinctCounts;
        for (auto& entry : count) distinctCounts.insert(entry.second);
        cout << (distinctCounts.size() == count.size() ? "yes" : "no") << "\n";`,
      java: r`
        Map<Long, Integer> count = new HashMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1, Integer::sum);
        Set<Integer> distinctCounts = new HashSet<>(count.values());
        System.out.println(distinctCounts.size() == count.size() ? "yes" : "no");`
    },
    solution: { explanation: ['The counts are collected in a set. A smaller set than the number of values means that two values had the same count.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const c = [...counts(nums(rows(input)[1])).values()]; return new Set(c).size === c.length ? 'yes' : 'no'; },
    tests() { const g = rng(315); const staircase = (k) => arr(shuffle(g, many(k, (i) => Array(i + 1).fill(i * 7 - 50)).flat())); return ['6\n1 2 2 1 1 3\n', '2\n1 2\n', '1\n9\n', '4\n5 5 6 6\n', arr(randArray(g, 20, -3, 3)), staircase(10), staircase(150), arr([...staircase(150).split('\n')[1].split(' ').map(Number), 999]), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, 0, 30))]; }
  },

  {
    slug: 'jewels-and-stones',
    title: 'Jewels and Stones',
    difficulty: 'easy',
    tags: ['hashing', 'hash-set', 'strings'],
    concept: {
      title: 'A set as a quick filter',
      body: [
        'A set is a fast **membership test**. Put the letters that count as jewels into a set. Then look at every stone and test whether its letter is in that set. This is a one-line filter in every language.',
        { code: 'jewel_set = set(jewels)\ncount = 0\nfor stone in stones:\n    if stone in jewel_set:\n        count += 1' },
        'Letters are case sensitive here: `a` and `A` are different kinds of stone. For a small fixed alphabet an array of flags would be as fast, but the set works for any kind of key.'
      ]
    },
    statement: ['The letters in the first word are the types of stones that are jewels. The second word lists the stones you have, one letter per stone. Count how many of your stones are jewels. Upper and lower case letters are different types.'],
    inputFormat: ['The first line has the word `jewels`.', 'The second line has the word `stones`.'],
    outputFormat: ['Print the number of stones that are jewels.'],
    constraints: ['1 <= length of each word <= 20000', 'The words contain lowercase and uppercase English letters.', 'The letters of the first word are all different.'],
    examples: [{ input: 'aA\naAAbbbb\n', note: 'Three stones (a, A, A) are jewels.' }],
    hints: ['Put the jewel letters into a set.', 'Check every stone against the set.', 'Count the stones that are found.'],
    program: {
      io: ['jewels:word', 'stones:word'],
      includes: ['<unordered_set>'],
      python: r`
        jewelSet = set(jewels)
        count = 0
        for stone in stones:
            if stone in jewelSet:
                count += 1
        print(count)`,
      cpp: r`
        unordered_set<char> jewelSet(jewels.begin(), jewels.end());
        int count = 0;
        for (char stone : stones) {
            if (jewelSet.count(stone)) count++;
        }
        cout << count << "\n";`,
      java: r`
        Set<Character> jewelSet = new HashSet<>();
        for (int i = 0; i < jewels.length(); i++) jewelSet.add(jewels.charAt(i));
        int count = 0;
        for (int i = 0; i < stones.length(); i++) {
            if (jewelSet.contains(stones.charAt(i))) count++;
        }
        System.out.println(count);`
    },
    solution: { explanation: ['The jewel letters go into a hash set; every stone is tested against it in O(1).'], complexity: 'Time O(|jewels| + |stones|), space O(|jewels|).' },
    solve(input) { const [j, s] = rows(input); const set = new Set(j); return String([...s].filter((c) => set.has(c)).length); },
    tests() { const g = rng(316); const ALL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; const jew = (k) => shuffle(g, [...ALL]).slice(0, k).join(''); return ['aA\naAAbbbb\n', 'z\nZZ\n', 'a\na\n', 'abc\nddd\n', `${jew(5)}\n${randWord(g, 30, ALL)}\n`, `${jew(20)}\n${randWord(g, 2000, ALL)}\n`, `${jew(1)}\n${randWord(g, 20000, ALL)}\n`, `${jew(26)}\n${randWord(g, 20000, ALL)}\n`, `${ALL}\n${randWord(g, 20000, ALL)}\n`]; }
  },

  {
    slug: 'happy-number',
    title: 'Happy Number',
    difficulty: 'easy',
    tags: ['hashing', 'hash-set', 'cycle-detection', 'math'],
    concept: {
      title: 'Detect a cycle with a set',
      body: [
        'Replace a number by the sum of the squares of its digits, and repeat. Either you reach 1 (and stay there, the number is *happy*), or the numbers **fall into a loop** that never contains 1. You cannot know how long to wait, but you can notice a loop: when a number appears a second time, the sequence has started to repeat.',
        { code: 'seen = set()\nwhile n != 1 and n not in seen:\n    seen.add(n)\n    n = sum(int(d) ** 2 for d in str(n))\nhappy = (n == 1)' },
        'The set of visited values is the general tool for detecting loops in any process that is repeated, as long as the number of possible states is limited. Here the numbers fall below 1000 quickly, so the loop is always found fast.'
      ]
    },
    statement: ['Start with a positive integer. Replace it by the sum of the squares of its digits, and repeat the step. If the process reaches 1, the number is **happy**; if it ends up in a cycle that does not contain 1, it is not. Print `yes` if the starting number is happy and `no` otherwise.'],
    inputFormat: ['A single integer `n`.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 2 * 10^9'],
    examples: [{ input: '19\n', note: '19 -> 82 -> 68 -> 100 -> 1.' }, { input: '2\n', note: '2 -> 4 -> 16 -> 37 -> 58 -> 89 -> 145 -> 42 -> 20 -> 4: a loop without 1.' }],
    hints: ['Write a step that adds the squares of the digits.', 'Remember every value you have visited in a set.', 'Stop when the value is 1 (happy) or when it is already in the set (a loop).'],
    program: {
      io: ['n:int'],
      includes: ['<unordered_set>'],
      python: r`
        seen = set()
        while n != 1 and n not in seen:
            seen.add(n)
            total = 0
            while n > 0:
                total += (n % 10) ** 2
                n //= 10
            n = total
        print("yes" if n == 1 else "no")`,
      cpp: r`
        unordered_set<long long> seen;
        while (n != 1 && !seen.count(n)) {
            seen.insert(n);
            long long total = 0;
            while (n > 0) {
                total += (n % 10) * (n % 10);
                n /= 10;
            }
            n = total;
        }
        cout << (n == 1 ? "yes" : "no") << "\n";`,
      java: r`
        Set<Long> seen = new HashSet<>();
        while (n != 1 && !seen.contains(n)) {
            seen.add(n);
            long total = 0;
            while (n > 0) {
                total += (n % 10) * (n % 10);
                n /= 10;
            }
            n = total;
        }
        System.out.println(n == 1 ? "yes" : "no");`
    },
    solution: { explanation: ['Every visited value is stored in a set. Reaching a stored value again means the sequence loops without ever reaching 1.'], complexity: 'Time O(log n) steps in practice, space O(1) (the sequence is short).' },
    solve(input) { let n = Number(input.trim()); const seen = new Set(); while (n !== 1 && !seen.has(n)) { seen.add(n); let t = 0; for (const d of String(n)) t += Number(d) ** 2; n = t; } return n === 1 ? 'yes' : 'no'; },
    tests() { return ['19\n', '2\n', '1\n', '7\n', '4\n', '100\n', '1111111\n', '999999999\n', '2000000000\n', '1999999999\n', '989\n', '68\n']; }
  },

  {
    slug: 'majority-element',
    title: 'The Majority Element',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'counting'],
    concept: {
      title: 'Count until one value passes half',
      body: [
        'A **majority element** occurs more than `n / 2` times. If you count the occurrences in a map, you can stop as soon as one counter exceeds `n / 2`: such a value is unique, because two different values cannot both have more than half of the elements.',
        { code: 'count = {}\nfor x in a:\n    count[x] = count.get(x, 0) + 1\n    if count[x] * 2 > n:\n        print(x)\n        break' },
        'There is a clever O(1)-memory method (Boyer-Moore voting), but counting is simple and works when you also want to know the counts, or when no majority is guaranteed.'
      ]
    },
    statement: ['An array of `n` integers contains a value that occurs more than `n / 2` times (the majority element). Print it.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the majority element.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9', 'A majority element always exists.'],
    examples: [{ input: '7\n2 2 1 1 1 2 2\n', note: '2 occurs 4 times, more than 3.5.' }],
    hints: ['Count the occurrences of every value.', 'The majority element has a count larger than n / 2.', 'You can stop at the first counter that passes n / 2.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {}
        answer = None
        for x in a:
            count[x] = count.get(x, 0) + 1
            if count[x] * 2 > n:
                answer = x
                break
        print(answer)`,
      cpp: r`
        unordered_map<long long, int> count;
        long long answer = 0;
        for (int i = 0; i < n; i++) {
            if (++count[a[i]] * 2 > n) {
                answer = a[i];
                break;
            }
        }
        cout << answer << "\n";`,
      java: r`
        Map<Long, Integer> count = new HashMap<>();
        long answer = 0;
        for (int i = 0; i < n; i++) {
            int c = count.merge(a[i], 1, Integer::sum);
            if (c * 2L > n) {
                answer = a[i];
                break;
            }
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['Two different values cannot each have more than half of the elements, so the first counter above `n / 2` is the majority element.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); for (const [v, k] of counts(a)) if (k * 2 > a.length) return String(v); return '?'; },
    tests() { const g = rng(317); const make = (n, extra) => { const maj = randInt(g, -1000000000, 1000000000); const k = Math.floor(n / 2) + 1 + randInt(g, 0, extra); const rest = many(n - Math.min(k, n), () => { let v = randInt(g, -1000000000, 1000000000); while (v === maj) v = randInt(g, -1000000000, 1000000000); return v; }); return arr(shuffle(g, [...Array(Math.min(k, n)).fill(maj), ...rest])); }; return ['7\n2 2 1 1 1 2 2\n', '1\n8\n', '3\n3 3 4\n', '5\n1 2 1 2 1\n', make(9, 0), make(100, 5), make(1000, 0), make(19999, 0), make(20000, 0), make(20000, 5000), make(20000, 10000)]; }
  },

  {
    slug: 'find-all-duplicates',
    title: 'All the Repeated Values',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'counting'],
    concept: {
      title: 'Collect the keys with a count above one',
      body: [
        'After counting the occurrences in a map, all values that occur **more than once** are the keys with a count of at least 2. A hash map has no order, so sort these keys before printing to make the output the same in every language.',
        { code: 'count = {}\nfor x in a:\n    count[x] = count.get(x, 0) + 1\nduplicates = sorted(v for v, c in count.items() if c >= 2)' },
        'When there is nothing to report, print a clear marker (here the word `none`) instead of an empty line. The answer then has no ambiguity about whether the program finished.'
      ]
    },
    statement: ['Print, in increasing order, every value that occurs at least twice in an array of `n` integers (each such value once). If no value is repeated, print `none`.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the repeated values on one line, or `none`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '8\n4 3 2 7 8 2 3 1\n', note: '2 and 3 occur twice.' }, { input: '3\n1 2 3\n', note: 'Nothing is repeated.' }],
    hints: ['Count the occurrences with a map.', 'Select the keys whose count is at least 2.', 'Sort them; print `none` if there are none.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<map>'],
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        duplicates = sorted(v for v, c in count.items() if c >= 2)
        print(*duplicates if duplicates else ["none"])`,
      cpp: r`
        map<long long, int> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        bool any = false;
        for (auto& entry : count) {
            if (entry.second >= 2) {
                if (any) cout << " ";
                cout << entry.first;
                any = true;
            }
        }
        cout << (any ? "" : "none") << "\n";`,
      java: r`
        Map<Long, Integer> count = new TreeMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1, Integer::sum);
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<Long, Integer> entry : count.entrySet()) {
            if (entry.getValue() >= 2) sb.append(entry.getKey()).append(" ");
        }
        System.out.println(sb.length() == 0 ? "none" : sb.toString().trim());`
    },
    solution: { explanation: ['Count with a map, keep the keys whose count is at least 2, and sort them.'], complexity: 'Time O(n + d log d), space O(n).' },
    solve(input) { const d = [...counts(nums(rows(input)[1])).entries()].filter(([, k]) => k >= 2).map(([v]) => v).sort((p, s) => p - s); return d.length ? d.join(' ') : 'none'; },
    tests() { const g = rng(318); return ['8\n4 3 2 7 8 2 3 1\n', '3\n1 2 3\n', '1\n5\n', '2\n6 6\n', '5\n-1 -1 -1 0 0\n', arr(randArray(g, 30, -20, 20)), arr(randDistinct(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, 0, 30000)), arr(randArray(g, 20000, 0, 10))]; }
  },

  {
    slug: 'disappeared-numbers',
    title: 'Numbers That Disappeared',
    difficulty: 'easy',
    tags: ['hashing', 'hash-set', 'range'],
    concept: {
      title: 'Compare the expected range with a set',
      body: [
        'You know which numbers *could* appear: `1, 2, ..., n`. Put the numbers you got into a set. Every value of `1..n` that is **not in the set** has disappeared.',
        { code: 'present = set(a)\nmissing = [v for v in range(1, n + 1) if v not in present]' },
        'Going over the expected range in increasing order gives the missing numbers already sorted, so no extra sorting is needed. When nothing is missing the list is empty, so print a marker such as `none`.'
      ]
    },
    statement: ['An array has `n` integers, each between 1 and `n` (some values may occur several times). Print, in increasing order, all numbers from 1 to `n` that do not occur in the array. If every number occurs, print `none`.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the missing numbers on one line, or `none`.'],
    constraints: ['1 <= n <= 20000'],
    examples: [{ input: '8\n4 3 2 7 8 2 3 1\n', note: '5 and 6 do not occur.' }],
    hints: ['Put all given numbers in a set.', 'Walk through 1, 2, ..., n and collect the numbers that are not in the set.', 'If you collected nothing, print none.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_set>'],
      python: r`
        present = set(a)
        missing = [v for v in range(1, n + 1) if v not in present]
        print(*missing if missing else ["none"])`,
      cpp: r`
        unordered_set<long long> present(a.begin(), a.end());
        bool any = false;
        for (long long v = 1; v <= n; v++) {
            if (!present.count(v)) {
                if (any) cout << " ";
                cout << v;
                any = true;
            }
        }
        cout << (any ? "" : "none") << "\n";`,
      java: r`
        Set<Long> present = new HashSet<>();
        for (int i = 0; i < n; i++) present.add(a[i]);
        StringBuilder sb = new StringBuilder();
        for (long v = 1; v <= n; v++) {
            if (!present.contains(v)) sb.append(v).append(" ");
        }
        System.out.println(sb.length() == 0 ? "none" : sb.toString().trim());`
    },
    solution: { explanation: ['A set of the given numbers answers "does v occur?" in O(1) for each value of the expected range.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const s = new Set(a); const m = []; for (let v = 1; v <= a.length; v++) if (!s.has(v)) m.push(v); return m.length ? m.join(' ') : 'none'; },
    tests() { const g = rng(319); const make = (n, hi) => arr(randArray(g, n, 1, Math.min(hi, n))); return ['8\n4 3 2 7 8 2 3 1\n', '1\n1\n', '3\n1 1 1\n', '3\n3 1 2\n', make(10, 10), make(100, 60), make(2000, 2000), make(20000, 20000), make(20000, 5), arr(shuffle(g, many(20000, (i) => i + 1)))]; }
  }
];
