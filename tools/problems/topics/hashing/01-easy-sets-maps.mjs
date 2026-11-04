import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const counts = (a) => { const c = new Map(); for (const x of a) c.set(x, (c.get(x) || 0) + 1); return c; };
const pairsWithSum = (a, t) => { const c = counts(a); let total = 0; for (const [x, k] of c) { const y = t - x; if (x < y && c.has(y)) total += k * c.get(y); else if (x === y) total += (k * (k - 1)) / 2; } return total; };

export default [
  {
    slug: 'two-sum-indices',
    title: 'Two Numbers That Add Up',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'complement'],
    concept: {
      title: 'Remember what you have seen',
      body: [
        'To find two numbers that add up to `target`, look at each number `x` and ask: **has the number `target - x` already appeared?** If you keep a **hash map** from every value seen so far to its position, this question is answered in about one step, no matter how many numbers were seen.',
        { code: 'seen = {}\nfor i in range(n):\n    need = target - a[i]\n    if need in seen:\n        print(seen[need] + 1, i + 1)\n        break\n    seen[a[i]] = i' },
        'A hash map (called `dict` in Python, `unordered_map` in C++, `HashMap` in Java) stores key-value pairs and finds a key in O(1) on average. Trying all pairs would need about `n * n / 2` checks; with the map one pass of `n` steps is enough.'
      ]
    },
    statement: ['You are given `n` integers and a number `target`. Exactly one pair of positions `i < j` has `a[i] + a[j] = target`. Print the two positions, counting from 1.'],
    inputFormat: ['The first line has `n` and `target`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print `i` and `j` separated by a space, with `i < j`.'],
    constraints: ['2 <= n <= 20000', '-10^9 <= each number <= 10^9', '-2 * 10^9 <= target <= 2 * 10^9', 'Exactly one valid pair of positions exists.'],
    examples: [{ input: '4 9\n2 7 11 15\n', note: '2 + 7 = 9, at positions 1 and 2.' }, { input: '3 6\n3 2 4\n', note: '2 + 4 = 6, at positions 2 and 3.' }],
    hints: ['For each number x you need to know whether `target - x` came before.', 'Store every number you have seen in a hash map together with its position.', 'Check the map before adding the current number, so that a number is not paired with itself.'],
    program: {
      io: ['n:int target:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        seen = {}
        for i in range(n):
            need = target - a[i]
            if need in seen:
                print(seen[need] + 1, i + 1)
                break
            seen[a[i]] = i`,
      cpp: r`
        unordered_map<long long, int> seen;
        for (int i = 0; i < n; i++) {
            auto it = seen.find(target - a[i]);
            if (it != seen.end()) {
                cout << it->second + 1 << " " << i + 1 << "\n";
                break;
            }
            seen[a[i]] = i;
        }`,
      java: r`
        Map<Long, Integer> seen = new HashMap<>();
        for (int i = 0; i < n; i++) {
            Integer j = seen.get(target - a[i]);
            if (j != null) {
                System.out.println((j + 1) + " " + (i + 1));
                break;
            }
            seen.put(a[i], i);
        }`
    },
    solution: { explanation: ['For every number the complement `target - x` is looked up in a hash map of the numbers seen before. The first hit gives the pair.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const t = nums(rs[0])[1]; const a = nums(rs[1]); const seen = new Map(); for (let i = 0; i < a.length; i++) { if (seen.has(t - a[i])) return `${seen.get(t - a[i]) + 1} ${i + 1}`; seen.set(a[i], i); } return '?'; },
    tests() {
      const g = rng(301);
      const make = (n, lo, hi) => { for (;;) { const a = randArray(g, n, lo, hi); const i = randInt(g, 0, n - 2), j = randInt(g, i + 1, n - 1); const t = a[i] + a[j]; if (pairsWithSum(a, t) === 1) return `${n} ${t}\n${a.join(' ')}\n`; } };
      return ['4 9\n2 7 11 15\n', '3 6\n3 2 4\n', '2 6\n3 3\n', '2 -3\n-5 2\n', '5 0\n5 -5 7 8 9\n', make(8, -1000, 1000), make(300, -1000000, 1000000), make(20000, -1000000000, 1000000000), make(20000, -1000000000, 1000000000), make(20000, 0, 1000000000)];
    }
  },

  {
    slug: 'contains-duplicate',
    title: 'Is There a Duplicate?',
    difficulty: 'easy',
    tags: ['hashing', 'hash-set'],
    concept: {
      title: 'A set remembers what it has seen',
      body: [
        'A **hash set** stores values without repeats and answers "is `x` in the set?" in O(1) on average. That is exactly what you need to find out whether a number appears twice: walk through the array, and for each number check the set first, then add the number.',
        { code: 'seen = set()\nfor x in a:\n    if x in seen:\n        print("yes")      # x was seen before\n        break\n    seen.add(x)\nelse:\n    print("no")' },
        'A set is a map without values. In C++ use `unordered_set`, in Java `HashSet`. Sorting the array and comparing neighbours also works, but costs O(n log n) instead of O(n).'
      ]
    },
    statement: ['Given `n` integers, print `yes` if some value occurs at least twice, and `no` if all values are different.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '4\n1 2 3 1\n', note: '1 appears twice.' }, { input: '4\n1 2 3 4\n', note: 'All different.' }],
    hints: ['Keep a set of the numbers you have already seen.', 'For each number, check whether it is in the set before you add it.', 'If you find it, the answer is yes. If the loop ends, the answer is no.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_set>'],
      python: r`
        seen = set()
        answer = "no"
        for x in a:
            if x in seen:
                answer = "yes"
                break
            seen.add(x)
        print(answer)`,
      cpp: r`
        unordered_set<long long> seen;
        bool duplicate = false;
        for (int i = 0; i < n; i++) {
            if (seen.count(a[i])) {
                duplicate = true;
                break;
            }
            seen.insert(a[i]);
        }
        cout << (duplicate ? "yes" : "no") << "\n";`,
      java: r`
        Set<Long> seen = new HashSet<>();
        boolean duplicate = false;
        for (int i = 0; i < n; i++) {
            if (!seen.add(a[i])) {
                duplicate = true;
                break;
            }
        }
        System.out.println(duplicate ? "yes" : "no");`
    },
    solution: { explanation: ['A hash set answers "seen before?" in O(1). The first number that is already in the set proves a duplicate.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); return new Set(a).size < a.length ? 'yes' : 'no'; },
    tests() { const g = rng(302); return ['4\n1 2 3 1\n', '4\n1 2 3 4\n', '1\n5\n', '2\n7 7\n', arr(randDistinct(g, 20, -50, 50)), arr(randArray(g, 20, -50, 50)), arr(randDistinct(g, 20000, -1000000000, 1000000000)), (() => { const v = randDistinct(g, 19999, -1000000000, 1000000000); return arr([...v, v[500]]); })(), arr(many(20000, (i) => i)), arr(randArray(g, 20000, 0, 1000000000))]; }
  },

  {
    slug: 'count-distinct-numbers',
    title: 'How Many Different Numbers?',
    difficulty: 'easy',
    tags: ['hashing', 'hash-set', 'counting'],
    concept: {
      title: 'The size of a set',
      body: [
        'Putting all numbers into a set removes the repeats, so the **size of the set** is the number of different values. Adding a value that is already in the set changes nothing.',
        { code: 'distinct = set(a)\nprint(len(distinct))' },
        'In C++ `unordered_set<long long> s(a.begin(), a.end()); s.size()` does the same, and in Java `new HashSet<>(list).size()`. Because every number costs one insertion of O(1) on average, the whole count takes O(n).'
      ]
    },
    statement: ['Count how many different values occur in a list of `n` integers.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of different values.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6\n5 3 5 1 3 9\n', note: 'The different values are 5, 3, 1 and 9.' }],
    hints: ['Equal numbers should be counted once.', 'Insert every number into a set.', 'The answer is the size of the set.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_set>'],
      python: r`
        distinct = set()
        for x in a:
            distinct.add(x)
        print(len(distinct))`,
      cpp: r`
        unordered_set<long long> distinct;
        for (int i = 0; i < n; i++) distinct.insert(a[i]);
        cout << distinct.size() << "\n";`,
      java: r`
        Set<Long> distinct = new HashSet<>();
        for (int i = 0; i < n; i++) distinct.add(a[i]);
        System.out.println(distinct.size());`
    },
    solution: { explanation: ['A set keeps one copy of every value, so its size is the number of different values.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { return String(new Set(nums(rows(input)[1])).size); },
    tests() { const g = rng(303); return ['6\n5 3 5 1 3 9\n', '1\n-4\n', '5\n2 2 2 2 2\n', '5\n1 2 3 4 5\n', arr(randArray(g, 30, -10, 10)), arr(randArray(g, 2000, -1000, 1000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, 0, 100)), arr(many(20000, (i) => (i * 7919) % 5000))]; }
  },

  {
    slug: 'frequency-table',
    title: 'Frequency Table',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'counting'],
    concept: {
      title: 'A map that counts',
      body: [
        'The most common use of a hash map is **counting**: the key is the value you look at, the stored value is how often it occurred. For each element add one to its counter, starting from 0 when the key is new.',
        { code: 'count = {}\nfor x in a:\n    count[x] = count.get(x, 0) + 1\nfor value in sorted(count):\n    print(value, count[value])' },
        'A hash map has no fixed order of its keys, so to print them in order you sort the keys first (or use an ordered map: `map` in C++, `TreeMap` in Java).'
      ]
    },
    statement: ['Given `n` integers, print every different value together with the number of times it occurs, one value per line, in increasing order of the value.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['For each different value, in increasing order, print the value and its count separated by a space.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6\n5 3 5 1 3 5\n', note: '1 occurs once, 3 twice and 5 three times.' }],
    hints: ['Use a map from a value to its count.', 'For every number add 1 to its entry (a missing entry counts as 0).', 'Sort the keys and print each key with its count.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        for value in sorted(count):
            print(value, count[value])`,
      cpp: r`
        map<long long, int> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        for (auto& entry : count) cout << entry.first << " " << entry.second << "\n";`,
      includes: ['<map>'],
      java: r`
        Map<Long, Integer> count = new TreeMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1, Integer::sum);
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<Long, Integer> entry : count.entrySet()) sb.append(entry.getKey()).append(" ").append(entry.getValue()).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The map counts the occurrences of every value. Sorting the keys (or using an ordered map) gives the output order.'], complexity: 'Time O(n + d log d) for d different values, space O(d).' },
    solve(input) { const c = counts(nums(rows(input)[1])); return [...c.keys()].sort((p, s) => p - s).map((k) => `${k} ${c.get(k)}`).join('\n'); },
    tests() { const g = rng(304); return ['6\n5 3 5 1 3 5\n', '1\n0\n', '4\n-1 -1 -1 -1\n', '5\n1 2 3 4 5\n', arr(randArray(g, 30, -5, 5)), arr(randArray(g, 2000, -100, 100)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, -50, 50)), arr(randArray(g, 20000, 0, 3000))]; }
  },

  {
    slug: 'most-frequent-number',
    title: 'The Most Frequent Number',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'counting'],
    concept: {
      title: 'Count, then pick the best entry',
      body: [
        'After counting the numbers in a map you can look for the entry with the largest count. When two values have the same count you need a **tie-break rule** so that the answer is unique: here, the smaller value wins.',
        { code: 'best_value, best_count = None, 0\nfor value, c in count.items():\n    if c > best_count or (c == best_count and value < best_value):\n        best_value, best_count = value, c' },
        'Note that a hash map does not give its entries in any particular order, so the tie-break must be written explicitly into the comparison. A rule that depends on iteration order would give different answers in different languages.'
      ]
    },
    statement: ['Find the value that occurs most often in a list of `n` integers. If several values occur equally often, choose the smallest of them. Print the value and its number of occurrences.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the value and its count separated by a space.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '7\n4 1 2 2 4 1 9\n', note: '1, 2 and 4 each occur twice; the smallest is 1.' }],
    hints: ['Count how often each value occurs.', 'Go through the entries and keep the best one so far.', 'On a tie in the count, prefer the smaller value.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        bestValue = None
        bestCount = 0
        for value, c in count.items():
            if c > bestCount or (c == bestCount and value < bestValue):
                bestValue = value
                bestCount = c
        print(bestValue, bestCount)`,
      cpp: r`
        unordered_map<long long, int> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        long long bestValue = 0;
        int bestCount = 0;
        for (auto& entry : count) {
            if (entry.second > bestCount || (entry.second == bestCount && entry.first < bestValue)) {
                bestValue = entry.first;
                bestCount = entry.second;
            }
        }
        cout << bestValue << " " << bestCount << "\n";`,
      java: r`
        Map<Long, Integer> count = new HashMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1, Integer::sum);
        long bestValue = 0;
        int bestCount = 0;
        for (Map.Entry<Long, Integer> entry : count.entrySet()) {
            if (entry.getValue() > bestCount || (entry.getValue() == bestCount && entry.getKey() < bestValue)) {
                bestValue = entry.getKey();
                bestCount = entry.getValue();
            }
        }
        System.out.println(bestValue + " " + bestCount);`
    },
    solution: { explanation: ['Count with a map, then scan the entries keeping the largest count; equal counts are decided by the smaller value, so the result does not depend on the order of the map.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const c = counts(nums(rows(input)[1])); let bv = null, bc = 0; for (const [v, k] of c) if (k > bc || (k === bc && v < bv)) { bv = v; bc = k; } return `${bv} ${bc}`; },
    tests() { const g = rng(305); return ['7\n4 1 2 2 4 1 9\n', '1\n-3\n', '4\n5 5 5 5\n', '4\n9 8 7 6\n', '6\n-2 -2 3 3 0 0\n', arr(randArray(g, 30, -5, 5)), arr(randArray(g, 2000, -30, 30)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, -100, 100)), arr(randArray(g, 20000, 0, 15))]; }
  },

  {
    slug: 'first-repeated-number',
    title: 'The First Number Seen Twice',
    difficulty: 'easy',
    tags: ['hashing', 'hash-set', 'scan'],
    concept: {
      title: 'Stop at the first hit',
      body: [
        'Scan the numbers from left to right and keep the set of numbers seen so far. The **first number that is already in the set** is the answer, and you can stop right there. Because you stop early, the work is proportional to the position of the answer, not always to `n`.',
        { code: 'seen = set()\nfor x in a:\n    if x in seen:\n        return x\n    seen.add(x)\nreturn None' },
        'Be careful with the meaning of "first": here it is the first position where a number turns out to be a **repeat**, which is not always the same as the first number that has a copy somewhere.'
      ]
    },
    statement: ['Read the numbers from left to right. Print the first number that you have already read before. If all numbers are different, print `none`.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number, or the word `none`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '7\n5 6 3 6 5 7 3\n', note: 'The second 6 is the first repeat (the 5 repeats only later).' }, { input: '3\n1 2 3\n', note: 'No repeats.' }],
    hints: ['Keep a set of the numbers read so far.', 'If the current number is already in the set, it is the answer.', 'If the scan ends without a hit, print none.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_set>'],
      python: r`
        seen = set()
        answer = "none"
        for x in a:
            if x in seen:
                answer = x
                break
            seen.add(x)
        print(answer)`,
      cpp: r`
        unordered_set<long long> seen;
        bool found = false;
        long long answer = 0;
        for (int i = 0; i < n; i++) {
            if (seen.count(a[i])) {
                found = true;
                answer = a[i];
                break;
            }
            seen.insert(a[i]);
        }
        if (found) cout << answer << "\n";
        else cout << "none\n";`,
      java: r`
        Set<Long> seen = new HashSet<>();
        String answer = "none";
        for (int i = 0; i < n; i++) {
            if (!seen.add(a[i])) {
                answer = String.valueOf(a[i]);
                break;
            }
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['The first number found in the set of earlier numbers is the first repeat.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const seen = new Set(); for (const x of nums(rows(input)[1])) { if (seen.has(x)) return String(x); seen.add(x); } return 'none'; },
    tests() { const g = rng(306); return ['7\n5 6 3 6 5 7 3\n', '3\n1 2 3\n', '1\n4\n', '2\n8 8\n', '5\n-1 -1 2 2 3\n', arr(randArray(g, 20, -30, 30)), arr(randDistinct(g, 20000, -1000000000, 1000000000)), arr([...randDistinct(g, 19999, -1000000000, 1000000000), 5].map((x, i, all) => (i === 19999 ? all[12345] : x))), arr(randArray(g, 20000, 0, 1000000000)), arr(randArray(g, 20000, 0, 50))]; }
  },

  {
    slug: 'single-number',
    title: 'The Number Without a Partner',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'counting'],
    concept: {
      title: 'Counting shows who is alone',
      body: [
        'Here every number appears **twice** except one that appears once. Count the numbers in a map and look for the entry with count 1. A cleverer solution exists with bit operations (xor), but counting works for every similar question, for example "the number that appears three times less than the others".',
        { code: 'count = {}\nfor x in a:\n    count[x] = count.get(x, 0) + 1\nfor value, c in count.items():\n    if c == 1:\n        print(value)' },
        'Another way is to keep a **set** and toggle each number: add it if absent, remove it if present. After one pass the set contains only the number without a partner.'
      ]
    },
    statement: ['A list has an odd number `n` of integers. Every value occurs exactly twice, except one value that occurs exactly once. Print that value.'],
    inputFormat: ['The first line has `n` (odd).', 'The second line has `n` integers.'],
    outputFormat: ['Print the value that occurs once.'],
    constraints: ['1 <= n <= 19999 (n is odd)', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5\n4 1 2 1 2\n', note: '4 has no partner.' }],
    hints: ['Count how often each value occurs.', 'Find the entry with count 1.', 'Or toggle numbers in a set: add when absent, remove when present.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_set>'],
      python: r`
        alone = set()
        for x in a:
            if x in alone:
                alone.remove(x)
            else:
                alone.add(x)
        print(next(iter(alone)))`,
      cpp: r`
        unordered_set<long long> alone;
        for (int i = 0; i < n; i++) {
            if (alone.count(a[i])) alone.erase(a[i]);
            else alone.insert(a[i]);
        }
        cout << *alone.begin() << "\n";`,
      java: r`
        Set<Long> alone = new HashSet<>();
        for (int i = 0; i < n; i++) {
            if (!alone.remove(a[i])) alone.add(a[i]);
        }
        System.out.println(alone.iterator().next());`
    },
    solution: { explanation: ['Toggling each number in a set leaves exactly the number that appears an odd number of times, the one without a partner.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const c = counts(nums(rows(input)[1])); for (const [v, k] of c) if (k === 1) return String(v); return '?'; },
    tests() { const g = rng(307); const make = (pairs, lo, hi) => { const vals = randDistinct(g, pairs + 1, lo, hi); const alone = vals[0]; return arr(shuffle(g, [alone, ...vals.slice(1).flatMap((v) => [v, v])])); }; return ['5\n4 1 2 1 2\n', '1\n7\n', '3\n-1 -1 5\n', '3\n2 3 2\n', make(5, -20, 20), make(100, -1000, 1000), make(9999, -1000000000, 1000000000), make(9999, -1000000000, 1000000000), make(9000, -20000, 20000)]; }
  },

  {
    slug: 'common-elements',
    title: 'Numbers in Both Lists',
    difficulty: 'easy',
    tags: ['hashing', 'hash-set', 'intersection'],
    concept: {
      title: 'Set intersection',
      body: [
        'The **intersection** of two collections is what they have in common. Put the numbers of the first list into a set. Then go through the second list and keep every number that is in that set. To avoid repeating a number, collect the result in a second set.',
        { code: 'first = set(a)\ncommon = set()\nfor x in b:\n    if x in first:\n        common.add(x)\nresult = sorted(common)' },
        'Python can write this as `set(a) & set(b)`. The point of the exercise is the idea behind it: membership tests in a hash set are O(1), so the whole job takes O(n + m) instead of comparing every number of `a` with every number of `b`.'
      ]
    },
    statement: ['Given two lists of integers, print how many different values occur in both lists, and then those values in increasing order.'],
    inputFormat: ['The first line has `n` and `m`.', 'The second line has the `n` numbers of the first list.', 'The third line has the `m` numbers of the second list.'],
    outputFormat: ['The first line: the number `k` of common values.', 'The second line: the `k` values in increasing order (empty if `k` is 0).'],
    constraints: ['1 <= n, m <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5 4\n4 9 5 9 4\n9 4 9 8\n', note: 'The values 4 and 9 occur in both lists.' }],
    hints: ['Put the numbers of one list into a set.', 'For every number of the other list, check whether it is in the set.', 'Collect the common values without repeats and sort them at the end.'],
    program: {
      io: ['n:int m:int', 'a:int[n]', 'b:int[m]'],
      fast: true,
      includes: ['<unordered_set>', '<algorithm>'],
      python: r`
        first = set(a)
        common = set()
        for x in b:
            if x in first:
                common.add(x)
        result = sorted(common)
        print(len(result))
        print(*result)`,
      cpp: r`
        unordered_set<long long> first(a.begin(), a.end()), common;
        for (int i = 0; i < m; i++) {
            if (first.count(b[i])) common.insert(b[i]);
        }
        vector<long long> result(common.begin(), common.end());
        sort(result.begin(), result.end());
        cout << result.size() << "\n";
        for (size_t i = 0; i < result.size(); i++) cout << result[i] << (i + 1 < result.size() ? " " : "");
        cout << "\n";`,
      java: r`
        Set<Long> first = new HashSet<>();
        for (int i = 0; i < n; i++) first.add(a[i]);
        TreeSet<Long> common = new TreeSet<>();
        for (int i = 0; i < m; i++) {
            if (first.contains(b[i])) common.add(b[i]);
        }
        StringBuilder sb = new StringBuilder();
        for (long v : common) sb.append(v).append(" ");
        System.out.println(common.size());
        System.out.println(sb.toString().trim());`
    },
    solution: { explanation: ['Membership in a hash set is O(1), so scanning the second list against a set of the first list finds the common values in linear time.'], complexity: 'Time O(n + m) on average, space O(n).' },
    solve(input) { const rs = rows(input); const a = new Set(nums(rs[1])); const common = [...new Set(nums(rs[2]).filter((x) => a.has(x)))].sort((p, s) => p - s); return `${common.length}\n${common.join(' ')}`; },
    tests() { const g = rng(308); const two = (n, m, lo, hi) => `${n} ${m}\n${randArray(g, n, lo, hi).join(' ')}\n${randArray(g, m, lo, hi).join(' ')}\n`; return ['5 4\n4 9 5 9 4\n9 4 9 8\n', '1 1\n3\n3\n', '1 1\n3\n4\n', '3 3\n1 2 3\n4 5 6\n', two(10, 12, -10, 10), two(2000, 1500, -1000, 1000), two(20000, 20000, -1000000000, 1000000000), two(20000, 20000, -30000, 30000), two(20000, 5, 0, 1000)]; }
  },

  {
    slug: 'isomorphic-strings',
    title: 'Isomorphic Words',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'strings', 'mapping'],
    concept: {
      title: 'A one-to-one mapping needs two maps',
      body: [
        'Two words are **isomorphic** if you can replace the letters of the first word, always the same letter by the same letter, and get the second word. Different letters must go to different letters. So the mapping must work both ways: each letter of `s` has exactly one partner in `t`, and each letter of `t` has exactly one partner in `s`.',
        { code: 'a_to_b, b_to_a = {}, {}\nfor x, y in zip(s, t):\n    if a_to_b.setdefault(x, y) != y or b_to_a.setdefault(y, x) != x:\n        ok = False' },
        '`setdefault` stores the pair the first time and returns the stored partner later. If the stored partner differs from the current letter, the words are not isomorphic. One map alone is not enough: `ab` and `aa` would pass if you checked only the direction `a -> a`, `b -> a`.'
      ]
    },
    statement: ['Two words `s` and `t` of the same length are given. Print `yes` if the letters of `s` can be replaced one-to-one to give `t` (every letter of `s` always becomes the same letter, and two different letters never become the same letter), otherwise print `no`.'],
    inputFormat: ['The first line has `s`.', 'The second line has `t`.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length of s = length of t <= 20000', 'The words contain lowercase letters and digits.'],
    examples: [{ input: 'egg\nadd\n', note: 'e -> a and g -> d.' }, { input: 'foo\nbar\n', note: 'The letter o would need to become both a and r.' }, { input: 'badc\nbaba\n', note: 'b -> b and d -> b: two letters would become the same letter.' }],
    hints: ['Each letter of `s` must always go to the same letter of `t`.', 'Also each letter of `t` must come from only one letter of `s`.', 'Keep two maps, one for each direction, and compare as you scan.'],
    program: {
      io: ['s:word', 't:word'],
      includes: ['<unordered_map>'],
      python: r`
        ok = len(s) == len(t)
        toT, toS = {}, {}
        if ok:
            for x, y in zip(s, t):
                if toT.setdefault(x, y) != y or toS.setdefault(y, x) != x:
                    ok = False
                    break
        print("yes" if ok else "no")`,
      cpp: r`
        bool ok = s.size() == t.size();
        unordered_map<char, char> toT, toS;
        for (size_t i = 0; ok && i < s.size(); i++) {
            if (toT.count(s[i]) && toT[s[i]] != t[i]) ok = false;
            else if (toS.count(t[i]) && toS[t[i]] != s[i]) ok = false;
            else {
                toT[s[i]] = t[i];
                toS[t[i]] = s[i];
            }
        }
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        boolean ok = s.length() == t.length();
        Map<Character, Character> toT = new HashMap<>(), toS = new HashMap<>();
        for (int i = 0; ok && i < s.length(); i++) {
            char x = s.charAt(i), y = t.charAt(i);
            if (toT.containsKey(x) && toT.get(x) != y) ok = false;
            else if (toS.containsKey(y) && toS.get(y) != x) ok = false;
            else {
                toT.put(x, y);
                toS.put(y, x);
            }
        }
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['Two maps enforce a mapping that is a function in both directions. Any letter that would need two partners shows that the words are not isomorphic.'], complexity: 'Time O(n), space O(alphabet).' },
    solve(input) { const [s, t] = rows(input); const f = {}, b = {}; for (let i = 0; i < s.length; i++) { if (s[i] in f && f[s[i]] !== t[i]) return 'no'; if (t[i] in b && b[t[i]] !== s[i]) return 'no'; f[s[i]] = t[i]; b[t[i]] = s[i]; } return 'yes'; },
    tests() { const g = rng(309); const A = 'abcdefghijklmnopqrstuvwxyz0123456789'; const apply = (s) => { const map = {}; const pool = shuffle(g, [...A]); let k = 0; return [...s].map((ch) => (map[ch] ??= pool[k++])).join(''); }; const w = randWord(g, 20000, 'abcdefghij'); const w2 = randWord(g, 30, 'abc'); return ['egg\nadd\n', 'foo\nbar\n', 'badc\nbaba\n', 'a\nb\n', 'ab\naa\n', 'paper\ntitle\n', `${w2}\n${apply(w2)}\n`, `${w}\n${apply(w)}\n`, `${w}\n${(() => { const t = apply(w); return t.slice(0, 19999) + (t[19999] === 'z' ? 'y' : 'z'); })()}\n`, `${randWord(g, 20000, A)}\n${randWord(g, 20000, A)}\n`]; }
  },

  {
    slug: 'ransom-note',
    title: 'Can the Note Be Written?',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'strings', 'counting'],
    concept: {
      title: 'Count what is available, spend what is needed',
      body: [
        'To cut a note out of a magazine you need, for every letter, **at least as many copies** in the magazine as the note contains. Count the letters of the magazine in a map. Then go through the note and spend one copy for every letter: if the count is not positive, the note cannot be written.',
        { code: 'have = {}\nfor ch in magazine:\n    have[ch] = have.get(ch, 0) + 1\nfor ch in note:\n    if have.get(ch, 0) == 0:\n        return False\n    have[ch] -= 1\nreturn True' },
        'This "inventory" pattern (count the supply, subtract the demand) is useful in many problems: anagrams, building a word from tiles, checking that one multiset contains another.'
      ]
    },
    statement: ['You want to cut the letters of a note out of a magazine. Each letter of the magazine can be used once. Print `yes` if the note can be made from the magazine, otherwise print `no`.'],
    inputFormat: ['The first line has the note.', 'The second line has the magazine.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length of the note, length of the magazine <= 20000', 'Both contain lowercase letters.'],
    examples: [{ input: 'aab\nbaa\n', note: 'The magazine has two a and one b.' }, { input: 'aa\nab\n', note: 'There is only one a.' }],
    hints: ['Count the letters of the magazine.', 'For each letter of the note, take one copy away.', 'If a letter is not available, the answer is no.'],
    program: {
      io: ['note:word', 'magazine:word'],
      includes: ['<unordered_map>'],
      python: r`
        have = {}
        for ch in magazine:
            have[ch] = have.get(ch, 0) + 1
        ok = True
        for ch in note:
            if have.get(ch, 0) == 0:
                ok = False
                break
            have[ch] -= 1
        print("yes" if ok else "no")`,
      cpp: r`
        unordered_map<char, int> have;
        for (char ch : magazine) have[ch]++;
        bool ok = true;
        for (char ch : note) {
            if (have[ch] == 0) {
                ok = false;
                break;
            }
            have[ch]--;
        }
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        Map<Character, Integer> have = new HashMap<>();
        for (int i = 0; i < magazine.length(); i++) have.merge(magazine.charAt(i), 1, Integer::sum);
        boolean ok = true;
        for (int i = 0; i < note.length(); i++) {
            char ch = note.charAt(i);
            if (have.getOrDefault(ch, 0) == 0) {
                ok = false;
                break;
            }
            have.put(ch, have.get(ch) - 1);
        }
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['The magazine letters are counted, and each letter of the note uses one copy. The note is possible exactly when no letter runs out.'], complexity: 'Time O(n + m), space O(alphabet).' },
    solve(input) { const [note, mag] = rows(input); const c = {}; for (const ch of mag) c[ch] = (c[ch] || 0) + 1; for (const ch of note) { if (!c[ch]) return 'no'; c[ch]--; } return 'yes'; },
    tests() { const g = rng(310); const mag = randWord(g, 20000, LOW); const sub = (w, k) => shuffle(g, [...w]).slice(0, k).join(''); return ['aab\nbaa\n', 'aa\nab\n', 'a\na\n', 'a\nb\n', 'abc\nabcabc\n', `${randWord(g, 20, 'abc')}\n${randWord(g, 30, 'abc')}\n`, `${sub(mag, 10000)}\n${mag}\n`, `${sub(mag, 10000)}z\n${mag.replace(/z/g, 'y')}\n`, `${mag}\n${mag}\n`, `${mag}a\n${mag}\n`]; }
  }
];
