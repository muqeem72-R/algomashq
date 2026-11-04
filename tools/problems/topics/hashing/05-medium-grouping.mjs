import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const ALL = LOW + LOW.toUpperCase();
const counts = (a) => { const c = new Map(); for (const x of a) c.set(x, (c.get(x) || 0) + 1); return c; };
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };

export default [
  {
    slug: 'group-anagrams',
    title: 'Group the Anagrams',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'strings', 'grouping'],
    concept: {
      title: 'A canonical key for every group',
      body: [
        'Words that are anagrams of each other (the same letters in another order) have one thing in common: if you **sort their letters**, you get the same string. That sorted string is a **canonical key**: all words of a group map to the same key, and different groups map to different keys.',
        { code: 'groups = {}\nfor word in words:\n    key = "".join(sorted(word))\n    groups.setdefault(key, []).append(word)' },
        'This is the standard way to group things with a hash map: find a key that is equal exactly for the things that belong together. Here the output has to be unique, so each group is sorted, and the groups are ordered by their first word.'
      ]
    },
    statement: ['Group the given words so that words that are anagrams of each other are in the same group. Print the number of groups, and then every group on its own line: the words of the group in alphabetical order, separated by spaces. The groups are printed in alphabetical order of their first word. Equal words are kept (each one is printed).'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` words.'],
    outputFormat: ['The first line: the number of groups.', 'Then one line per group.'],
    constraints: ['1 <= n <= 20000', 'Each word has 1 to 8 lowercase letters.'],
    examples: [{ input: '6\neat tea tan ate nat bat\n', note: 'Three groups: ate eat tea / bat / nat tan.' }],
    hints: ['Sort the letters of a word to get a key.', 'Put the words with the same key into one list.', 'Sort each list, then sort the lists by their first word.'],
    program: {
      io: ['n:int', 'w:word[n]'],
      fast: true,
      includes: ['<map>', '<algorithm>'],
      python: r`
        groups = {}
        for word in w:
            key = "".join(sorted(word))
            groups.setdefault(key, []).append(word)
        result = [sorted(g) for g in groups.values()]
        result.sort(key=lambda g: g[0])
        print(len(result))
        for g in result:
            print(*g)`,
      cpp: r`
        map<string, vector<string>> groups;
        for (int i = 0; i < n; i++) {
            string key = w[i];
            sort(key.begin(), key.end());
            groups[key].push_back(w[i]);
        }
        vector<vector<string>> result;
        for (auto& entry : groups) {
            sort(entry.second.begin(), entry.second.end());
            result.push_back(entry.second);
        }
        sort(result.begin(), result.end(), [](const vector<string>& x, const vector<string>& y) { return x[0] < y[0]; });
        cout << result.size() << "\n";
        for (auto& g : result) {
            for (size_t i = 0; i < g.size(); i++) cout << g[i] << (i + 1 < g.size() ? " " : "\n");
        }`,
      java: r`
        Map<String, List<String>> groups = new HashMap<>();
        for (int i = 0; i < n; i++) {
            char[] letters = w[i].toCharArray();
            Arrays.sort(letters);
            groups.computeIfAbsent(new String(letters), key -> new ArrayList<>()).add(w[i]);
        }
        List<List<String>> result = new ArrayList<>(groups.values());
        for (List<String> g : result) Collections.sort(g);
        result.sort((x, y) -> x.get(0).compareTo(y.get(0)));
        StringBuilder sb = new StringBuilder();
        sb.append(result.size()).append("\n");
        for (List<String> g : result) sb.append(String.join(" ", g)).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The sorted letters of a word are the same for all its anagrams, so they work as the key of a hash map that collects the groups.'], complexity: 'Time O(total length * log(word length)), space O(total length).' },
    solve(input) { const w = rows(input)[1].split(' '); const g = new Map(); for (const x of w) { const k = [...x].sort().join(''); if (!g.has(k)) g.set(k, []); g.get(k).push(x); } const res = [...g.values()].map((l) => l.sort()); res.sort((p, s) => (p[0] < s[0] ? -1 : p[0] > s[0] ? 1 : 0)); return `${res.length}\n${res.map((l) => l.join(' ')).join('\n')}`; },
    tests() { const g = rng(341); const make = (n, len, alpha) => `${n}\n${many(n, () => randWord(g, randInt(g, 1, len), alpha)).join(' ')}\n`; return ['6\neat tea tan ate nat bat\n', '1\na\n', '3\nab ba ab\n', '2\nabc def\n', make(15, 3, 'abc'), make(300, 5, 'abc'), make(20000, 8, 'abcd'), make(20000, 8, LOW), make(20000, 4, 'ab'), make(20000, 6, 'abcdef')]; }
  },

  {
    slug: 'longest-consecutive-run',
    title: 'Longest Run of Consecutive Values',
    difficulty: 'medium',
    tags: ['hashing', 'hash-set', 'sequences'],
    concept: {
      title: 'Start counting only at the beginning of a run',
      body: [
        'Find the longest set of values `x, x+1, x+2, ...` that all occur in the array (in any order, positions do not matter). Sorting works in O(n log n), but a hash set does it in O(n). Put all values in a set. A value `x` is the **start of a run** exactly when `x - 1` is not in the set. From each start, count upward while `y + 1` is in the set.',
        { code: 'present = set(a)\nbest = 0\nfor x in present:\n    if x - 1 not in present:          # x starts a run\n        y = x\n        while y + 1 in present: y += 1\n        best = max(best, y - x + 1)' },
        'Because we only start at run beginnings, every value is visited at most twice (once in the loop, once while counting), so the total work is linear even though there is a loop inside the loop.'
      ]
    },
    statement: ['Given `n` integers (duplicates are possible), find the length of the longest sequence of consecutive integer values `x, x+1, ..., x+L-1` that all appear in the array. The order of the elements in the array does not matter.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the length `L`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6\n100 4 200 1 3 2\n', note: 'The run 1 2 3 4 has length 4.' }],
    hints: ['Put all numbers in a set.', 'A number starts a run when the number one smaller is not in the set.', 'From each start count upward, and remember the longest run.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_set>', '<algorithm>'],
      python: r`
        present = set(a)
        best = 0
        for x in present:
            if x - 1 not in present:
                y = x
                while y + 1 in present:
                    y += 1
                best = max(best, y - x + 1)
        print(best)`,
      cpp: r`
        unordered_set<long long> present(a.begin(), a.end());
        long long best = 0;
        for (long long x : present) {
            if (!present.count(x - 1)) {
                long long y = x;
                while (present.count(y + 1)) y++;
                best = max(best, y - x + 1);
            }
        }
        cout << best << "\n";`,
      java: r`
        Set<Long> present = new HashSet<>();
        for (int i = 0; i < n; i++) present.add(a[i]);
        long best = 0;
        for (long x : present) {
            if (!present.contains(x - 1)) {
                long y = x;
                while (present.contains(y + 1)) y++;
                best = Math.max(best, y - x + 1);
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Only the first value of every run starts a count. Each value is then touched a constant number of times.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = [...new Set(nums(rows(input)[1]))].sort((p, s) => p - s); let best = 0, run = 0; for (let i = 0; i < a.length; i++) { run = i > 0 && a[i] === a[i - 1] + 1 ? run + 1 : 1; best = Math.max(best, run); } return String(best); },
    tests() { const g = rng(342); const runs = (k, len, base) => arr(shuffle(g, [...many(len, (i) => base + i), ...randArray(g, k, base - 1000000, base - 3).filter((v) => v < base - 1)])); return ['6\n100 4 200 1 3 2\n', '1\n5\n', '3\n7 7 7\n', '2\n1 3\n', '5\n0 -1 1 2 -2\n', arr(randArray(g, 25, -15, 15)), arr(randArray(g, 2000, -1000, 1000)), arr(randArray(g, 20000, -1000000000, 1000000000)), runs(10000, 10000, 5), runs(19000, 1000, -300000000), arr(shuffle(g, many(20000, (i) => i * 3))), arr(shuffle(g, many(20000, (i) => i - 10000)))]; }
  },

  {
    slug: 'top-k-frequent',
    title: 'The k Most Frequent Numbers',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'sorting', 'counting'],
    concept: {
      title: 'Count first, then sort the entries with a rule',
      body: [
        'First count the values with a hash map. The most frequent values are then the entries with the largest counts. Sort the entries with a **two-part rule**: larger count first, and for equal counts the smaller value first. The rule makes the answer unique, which matters because hash maps do not keep any order of their own.',
        { code: 'ordered = sorted(count.items(), key=lambda e: (-e[1], e[0]))\nanswer = [value for value, c in ordered[:k]]' },
        'In C++ and Java the same idea is a custom comparator. Sorting all `d` different values costs O(d log d), which is fine here.'
      ]
    },
    statement: ['Given `n` integers and a number `k`, print the `k` values that occur most often, from the most frequent to the least frequent. If two values occur equally often, the smaller value comes first. `k` is at most the number of different values.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `k` integers separated by spaces.'],
    constraints: ['1 <= n <= 20000', '1 <= k <= number of different values', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '8 2\n1 1 1 2 2 3 3 4\n', note: '1 occurs 3 times, 2 and 3 twice each (2 is smaller), 4 once.' }],
    hints: ['Count the occurrences with a map.', 'Sort the entries by count descending and by value ascending.', 'Print the first k values.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        ordered = sorted(count.items(), key=lambda e: (-e[1], e[0]))
        print(*[value for value, c in ordered[:k]])`,
      cpp: r`
        unordered_map<long long, int> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        vector<pair<long long, int>> items(count.begin(), count.end());
        sort(items.begin(), items.end(), [](const pair<long long, int>& x, const pair<long long, int>& y) {
            if (x.second != y.second) return x.second > y.second;
            return x.first < y.first;
        });
        for (int i = 0; i < k; i++) cout << items[i].first << (i + 1 < k ? " " : "\n");`,
      java: r`
        Map<Long, Integer> count = new HashMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1, Integer::sum);
        List<Map.Entry<Long, Integer>> items = new ArrayList<>(count.entrySet());
        items.sort((x, y) -> {
            if (x.getValue().intValue() != y.getValue().intValue()) return Integer.compare(y.getValue(), x.getValue());
            return Long.compare(x.getKey(), y.getKey());
        });
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < k; i++) sb.append(items.get(i).getKey()).append(i + 1 < k ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Counting gives the entries; sorting them by (count descending, value ascending) puts the answer at the front.'], complexity: 'Time O(n + d log d), space O(d).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const c = counts(nums(rs[1])); return [...c.entries()].sort((p, s) => s[1] - p[1] || p[0] - s[0]).slice(0, k).map((e) => e[0]).join(' '); },
    tests() { const g = rng(343); const make = (n, lo, hi, kMode) => { const a = randArray(g, n, lo, hi); const d = new Set(a).size; const k = kMode === 'all' ? d : kMode === 'one' ? 1 : randInt(g, 1, d); return `${n} ${k}\n${a.join(' ')}\n`; }; return ['8 2\n1 1 1 2 2 3 3 4\n', '1 1\n5\n', '4 4\n4 3 2 1\n', '6 1\n5 5 6 6 7 7\n', make(30, -5, 5, 'r'), make(2000, -50, 50, 'r'), make(20000, -1000000000, 1000000000, 'r'), make(20000, 0, 3000, 'r'), make(20000, 0, 100, 'all'), make(20000, 0, 20000, 'one'), make(20000, -1000000000, 1000000000, 'all')]; }
  },

  {
    slug: 'four-arrays-sum-zero',
    title: 'Four Arrays, Sum Zero',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'meet-in-the-middle'],
    concept: {
      title: 'Split four loops into two pairs',
      body: [
        'You pick one number from each of four arrays and want the sum to be 0. Four nested loops cost `n^4`. Split the work in the middle: compute all sums `a + b` of the first two arrays and store **how often each sum occurs** in a map (`n^2` entries). Then for every pair `c + d` look up how many ways the sums `a + b` can equal `-(c + d)`.',
        { code: 'sums = {}\nfor x in a:\n    for y in b:\n        sums[x + y] = sums.get(x + y, 0) + 1\ntotal = 0\nfor x in c:\n    for y in d:\n        total += sums.get(-(x + y), 0)' },
        'This "meet in the middle" idea turns `n^4` into `n^2`. The count can be as large as `n^4` (about 2.6 * 10^10 for n = 400), so use 64-bit integers.'
      ]
    },
    statement: ['Four arrays `a`, `b`, `c` and `d`, each with `n` integers, are given. Count the tuples `(i, j, k, l)` of positions (one position in each array, `0 <= i, j, k, l < n`) with `a[i] + b[j] + c[k] + d[l] = 0`.'],
    inputFormat: ['The first line has `n`.', 'The next four lines have the arrays `a`, `b`, `c` and `d`.'],
    outputFormat: ['Print the number of tuples.'],
    constraints: ['1 <= n <= 400', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '2\n1 2\n-2 -1\n-1 2\n0 2\n', note: 'Two tuples work: (0, 0, 0, 1) gives 1 - 2 - 1 + 2 = 0 and (1, 1, 0, 0) gives 2 - 1 - 1 + 0 = 0.' }],
    hints: ['Four loops are too slow for n = 400.', 'Store the sums of the pairs from the first two arrays in a map with their counts.', 'For every pair of the other two arrays, add the count of the opposite sum.'],
    program: {
      io: ['n:int', 'a:int[n]', 'b:int[n]', 'c:int[n]', 'd:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        sums = {}
        for x in a:
            for y in b:
                sums[x + y] = sums.get(x + y, 0) + 1
        total = 0
        for x in c:
            for y in d:
                total += sums.get(-(x + y), 0)
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> sums;
        sums.reserve(n * n * 2);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) sums[a[i] + b[j]]++;
        }
        long long total = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                auto it = sums.find(-(c[i] + d[j]));
                if (it != sums.end()) total += it->second;
            }
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> sums = new HashMap<>();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) sums.merge(a[i] + b[j], 1L, Long::sum);
        }
        long total = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) total += sums.getOrDefault(-(c[i] + d[j]), 0L);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['All pair sums of the first two arrays are counted in a map; every pair of the last two arrays then asks the map for the opposite sum.'], complexity: 'Time O(n^2) on average, space O(n^2).' },
    solve(input) { const rs = rows(input); const [a, b, c, d] = [1, 2, 3, 4].map((i) => nums(rs[i])); const m = new Map(); for (const x of a) for (const y of b) m.set(x + y, (m.get(x + y) || 0) + 1); let t = 0; for (const x of c) for (const y of d) t += m.get(-(x + y)) || 0; return String(t); },
    tests() {
      const g = rng(344);
      const make = (n, lo, hi) => `${n}\n${many(4, () => randArray(g, n, lo, hi).join(' ')).join('\n')}\n`;
      const brute = (i) => { const rs = rows(i); const [a, b, c, d] = [1, 2, 3, 4].map((k) => nums(rs[k])); let t = 0; for (const x of a) for (const y of b) for (const z of c) for (const w of d) if (x + y + z + w === 0) t++; return t; };
      crossCheck(() => make(randInt(g, 1, 6), -3, 3), (i) => this.solve(i), brute);
      return ['2\n1 2\n-2 -1\n-1 2\n0 2\n', '1\n0\n0\n0\n0\n', '1\n1\n1\n1\n1\n', make(5, -5, 5), make(30, -50, 50), make(200, -1000000000, 1000000000), make(400, -1000000000, 1000000000), make(400, -5, 5), make(400, -200, 200), make(400, -3000, 3000)];
    }
  },

  {
    slug: 'anagram-positions',
    title: 'All the Anagram Positions',
    difficulty: 'medium',
    tags: ['hashing', 'sliding-window', 'counting', 'strings'],
    concept: {
      title: 'Compare letter counts of a sliding window',
      body: [
        'An anagram of `p` in `s` is a block of `s` with the same length as `p` and the same letter counts. Slide a window of length `len(p)` over `s`. When the window moves one step, **one letter enters and one letter leaves**, so its count table changes in two places only. Compare the table with the table of `p` after each move.',
        { code: 'need = counts of p\nhave = [0] * 26\nfor i, ch in enumerate(s):\n    have[ch] += 1\n    if i >= m: have[s[i - m]] -= 1\n    if i >= m - 1 and have == need: starts.append(i - m + 1)' },
        'Comparing two tables of 26 numbers is a constant amount of work, so the whole scan is O(26 * n). Here you must report **every** position where an anagram starts, not just whether one exists.'
      ]
    },
    statement: ['Given a pattern word `p` and a text word `s`, find all start positions (counting from 0) of blocks of `s` that are anagrams of `p`. Print the number of positions, and on the next line the positions in increasing order (an empty line if there are none).'],
    inputFormat: ['The first line has `p`.', 'The second line has `s`.'],
    outputFormat: ['The first line: the number of positions.', 'The second line: the positions.'],
    constraints: ['1 <= length of p, s <= 20000', 'Both words contain lowercase letters.'],
    examples: [{ input: 'abc\ncbaebabacd\n', note: 'The blocks cba (0) and bac (6) are anagrams of abc.' }],
    hints: ['A block must have exactly the length of `p`.', 'Keep letter counts of the current window and update them when the window moves.', 'Compare the window counts with the counts of `p`.'],
    program: {
      io: ['p:word', 's:word'],
      python: r`
        m = len(p)
        need = [0] * 26
        have = [0] * 26
        for ch in p:
            need[ord(ch) - ord("a")] += 1
        starts = []
        for i, ch in enumerate(s):
            have[ord(ch) - ord("a")] += 1
            if i >= m:
                have[ord(s[i - m]) - ord("a")] -= 1
            if i >= m - 1 and have == need:
                starts.append(i - m + 1)
        print(len(starts))
        print(*starts)`,
      cpp: r`
        int m = p.size();
        vector<int> need(26, 0), have(26, 0), starts;
        for (char ch : p) need[ch - 'a']++;
        for (int i = 0; i < (int) s.size(); i++) {
            have[s[i] - 'a']++;
            if (i >= m) have[s[i - m] - 'a']--;
            if (i >= m - 1 && have == need) starts.push_back(i - m + 1);
        }
        cout << starts.size() << "\n";
        for (size_t i = 0; i < starts.size(); i++) cout << starts[i] << (i + 1 < starts.size() ? " " : "");
        cout << "\n";`,
      java: r`
        int m = p.length();
        int[] need = new int[26], have = new int[26];
        for (int i = 0; i < m; i++) need[p.charAt(i) - 'a']++;
        StringBuilder sb = new StringBuilder();
        int found = 0;
        for (int i = 0; i < s.length(); i++) {
            have[s.charAt(i) - 'a']++;
            if (i >= m) have[s.charAt(i - m) - 'a']--;
            if (i >= m - 1 && Arrays.equals(have, need)) {
                found++;
                sb.append(i - m + 1).append(" ");
            }
        }
        System.out.println(found);
        System.out.println(sb.toString().trim());`
    },
    solution: { explanation: ['The window of the length of `p` slides over `s`; two table updates per step keep its letter counts current, and equal tables mark an anagram.'], complexity: 'Time O(26 * |s|), space O(1).' },
    solve(input) { const [p, s] = rows(input); const m = p.length; const key = (w) => [...w].sort().join(''); const kp = key(p); const out = []; for (let i = 0; i + m <= s.length; i++) if (key(s.slice(i, i + m)) === kp) out.push(i); return `${out.length}\n${out.join(' ')}`; },
    tests() { const g = rng(345); const embed = (p, len, copies) => { let s = randWord(g, len, 'xyz'); for (let c = 0; c < copies; c++) { const at = randInt(g, 0, len - p.length); s = s.slice(0, at) + shuffle(g, [...p]).join('') + s.slice(at + p.length); } return s; }; return ['abc\ncbaebabacd\n', 'a\na\n', 'ab\nabab\n', 'abc\nab\n', 'aa\naaaaa\n', `${randWord(g, 3, 'ab')}\n${randWord(g, 40, 'ab')}\n`, `${randWord(g, 5, 'abc')}\n${embed('abcab', 3000, 40)}\n`, `${randWord(g, 4, 'ab')}\n${randWord(g, 20000, 'ab')}\n`, `${'ab'.repeat(5)}\n${'ab'.repeat(10000)}\n`, `${randWord(g, 100, 'abc')}\n${randWord(g, 20000, 'abc')}\n`, `${'a'}\n${'a'.repeat(20000)}\n`]; }
  },

  {
    slug: 'nearby-duplicate',
    title: 'Duplicates Close to Each Other',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'sliding-window'],
    concept: {
      title: 'Remember the last position of each value',
      body: [
        'You need two equal values whose positions differ by at most `k`. If a value `x` occurs at positions `p1 < p2 < p3`, the closest pair among them is always **two neighbours** in this list. So it is enough to remember the **last position** of every value: when `x` appears again at position `i`, compare `i` with the stored last position.',
        { code: 'last = {}\nfor i, x in enumerate(a):\n    if x in last and i - last[x] <= k:\n        found = True\n    last[x] = i          # always remember the most recent position' },
        'Updating `last[x]` every time is the important part: only the most recent earlier copy can be the closest one.'
      ]
    },
    statement: ['Given `n` integers and a number `k`, is there a pair of positions `i < j` with `a[i] = a[j]` and `j - i <= k`? Print `yes` or `no`.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20000', '0 <= k <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5 2\n1 2 3 1 2\n', note: 'The two 1s are 3 apart, the two 2s are 3 apart: no.' }, { input: '5 3\n1 2 3 1 2\n', note: 'The two 1s are 3 apart: yes.' }],
    hints: ['Equal values can be far apart in the array.', 'Remember the last position where each value was seen.', 'When a value repeats, compare the distance with k, then update the position.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        last = {}
        found = False
        for i, x in enumerate(a):
            if x in last and i - last[x] <= k:
                found = True
                break
            last[x] = i
        print("yes" if found else "no")`,
      cpp: r`
        unordered_map<long long, int> last;
        bool found = false;
        for (int i = 0; i < n; i++) {
            auto it = last.find(a[i]);
            if (it != last.end() && i - it->second <= k) {
                found = true;
                break;
            }
            last[a[i]] = i;
        }
        cout << (found ? "yes" : "no") << "\n";`,
      java: r`
        Map<Long, Integer> last = new HashMap<>();
        boolean found = false;
        for (int i = 0; i < n; i++) {
            Integer prev = last.get(a[i]);
            if (prev != null && i - prev <= k) {
                found = true;
                break;
            }
            last.put(a[i], i);
        }
        System.out.println(found ? "yes" : "no");`
    },
    solution: { explanation: ['Only the most recent earlier copy of a value can be its nearest one, so a map from value to last position decides the question in one pass.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]); for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length && j - i <= k; j++) if (a[i] === a[j]) return 'yes'; return 'no'; },
    tests() { const g = rng(346); const make = (n, hi, k) => `${n} ${k}\n${randArray(g, n, 0, hi).join(' ')}\n`; const spaced = (n, gap, k) => `${n} ${k}\n${many(n, (i) => i % gap).join(' ')}\n`; return ['5 2\n1 2 3 1 2\n', '5 3\n1 2 3 1 2\n', '1 0\n4\n', '2 0\n4 4\n', '2 1\n4 4\n', make(30, 20, 3), make(2000, 5000, 100), make(20000, 1000000000, 20000), make(20000, 100000, 500), spaced(20000, 5000, 4999), spaced(20000, 5000, 5000), spaced(20000, 20000, 20000)]; }
  },

  {
    slug: 'shifted-string-groups',
    title: 'Groups of Shifted Words',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'strings', 'grouping'],
    concept: {
      title: 'The pattern of differences as a key',
      body: [
        'Shifting a word means adding the same number to every letter, wrapping around from `z` to `a`: `abc` becomes `bcd`, and `xyz` becomes `yza`. What does **not** change under a shift is the difference between neighbouring letters (taken modulo 26). So the list of these differences is a canonical key of the group.',
        { code: 'key = tuple((ord(w[i + 1]) - ord(w[i])) % 26 for i in range(len(w) - 1))' },
        'Words of different length have keys of different length, so they never share a group. A one-letter word has the empty key: all one-letter words are shifts of each other.'
      ]
    },
    statement: ['Two words are in the same group if one can be turned into the other by shifting every letter forward by the same number of places in the alphabet (after `z` comes `a`). Words of different length are never in the same group. Given `n` words, print the number of groups, and then the sizes of the groups from the largest to the smallest.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` words.'],
    outputFormat: ['The first line: the number of groups.', 'The second line: the sizes in decreasing order.'],
    constraints: ['1 <= n <= 20000', 'Each word has 1 to 10 lowercase letters.'],
    examples: [{ input: '6\nabc bcd acef xyz az ba\n', note: 'Groups: {abc, bcd, xyz}, {acef}, {az, ba}: sizes 3, 2, 1.' }],
    hints: ['What stays the same when every letter is shifted by the same amount?', 'The differences between neighbouring letters (modulo 26) form a key.', 'Count how many words share each key and sort the counts.'],
    program: {
      io: ['n:int', 'w:word[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        groups = {}
        for word in w:
            key = tuple((ord(word[i + 1]) - ord(word[i])) % 26 for i in range(len(word) - 1))
            groups[key] = groups.get(key, 0) + 1
        sizes = sorted(groups.values(), reverse=True)
        print(len(sizes))
        print(*sizes)`,
      cpp: r`
        unordered_map<string, int> groups;
        for (int i = 0; i < n; i++) {
            string key;
            for (size_t j = 0; j + 1 < w[i].size(); j++) key += (char) ('a' + (w[i][j + 1] - w[i][j] + 26) % 26);
            groups[key]++;
        }
        vector<int> sizes;
        for (auto& entry : groups) sizes.push_back(entry.second);
        sort(sizes.rbegin(), sizes.rend());
        cout << sizes.size() << "\n";
        for (size_t i = 0; i < sizes.size(); i++) cout << sizes[i] << (i + 1 < sizes.size() ? " " : "\n");`,
      java: r`
        Map<String, Integer> groups = new HashMap<>();
        for (int i = 0; i < n; i++) {
            StringBuilder key = new StringBuilder();
            for (int j = 0; j + 1 < w[i].length(); j++) key.append((char) ('a' + (w[i].charAt(j + 1) - w[i].charAt(j) + 26) % 26));
            groups.merge(key.toString(), 1, Integer::sum);
        }
        List<Integer> sizes = new ArrayList<>(groups.values());
        sizes.sort(Collections.reverseOrder());
        StringBuilder sb = new StringBuilder();
        for (int size : sizes) sb.append(size).append(" ");
        System.out.println(sizes.size());
        System.out.println(sb.toString().trim());`
    },
    solution: { explanation: ['Shifts keep the differences of neighbouring letters (modulo 26), so the difference list identifies the group.'], complexity: 'Time O(total length), space O(total length).' },
    solve(input) { const w = rows(input)[1].split(' '); const c = new Map(); for (const x of w) { const k = [...x].slice(1).map((ch, i) => (ch.charCodeAt(0) - x.charCodeAt(i) + 26) % 26).join(','); c.set(k + '|' + x.length, (c.get(k + '|' + x.length) || 0) + 1); } const sizes = [...c.values()].sort((p, s) => s - p); return `${sizes.length}\n${sizes.join(' ')}`; },
    tests() { const g = rng(347); const shift = (w, k) => [...w].map((ch) => LOW[(ch.charCodeAt(0) - 97 + k) % 26]).join(''); const bases = (k, len, alpha) => many(k, () => randWord(g, randInt(g, 1, len), alpha)); const build = (n, base) => `${n}\n${many(n, () => shift(base[randInt(g, 0, base.length - 1)], randInt(g, 0, 25))).join(' ')}\n`; return ['6\nabc bcd acef xyz az ba\n', '1\na\n', '3\na b z\n', '2\nab ac\n', build(20, bases(4, 4, 'abc')), build(300, bases(10, 6, LOW)), build(20000, bases(30, 10, LOW)), build(20000, bases(3, 3, 'ab')), build(20000, bases(500, 10, LOW)), `20000\n${many(20000, () => randWord(g, randInt(g, 1, 10), LOW)).join(' ')}\n`]; }
  },

  {
    slug: 'sort-letters-by-frequency',
    title: 'Sort the Letters by Frequency',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'sorting', 'strings'],
    concept: {
      title: 'Count, order the keys, then rebuild',
      body: [
        'Count the letters with a map. Then order the **distinct letters** by their count, largest first, and write each letter as many times as it occurred. Ties must be broken in a fixed way, otherwise the result depends on the hash map: here the smaller character (in ASCII order, capital letters before small letters) comes first.',
        { code: 'order = sorted(count, key=lambda ch: (-count[ch], ch))\nresult = "".join(ch * count[ch] for ch in order)' },
        'Sorting only the distinct letters (at most 52) and then repeating them is much cheaper than sorting all `n` characters with a custom rule.'
      ]
    },
    statement: ['Rearrange the letters of a word so that the letters that occur most often come first, all copies of a letter together. If two letters occur equally often, the one with the smaller ASCII code comes first (capital letters come before small letters). Print the new word.'],
    inputFormat: ['A single word of letters.'],
    outputFormat: ['Print the rearranged word.'],
    constraints: ['1 <= length <= 20000', 'The word contains upper and lower case English letters.'],
    examples: [{ input: 'tree\n', note: 'e occurs twice, then r and t once each: r comes before t, so the answer is eert.' }, { input: 'Aabb\n', note: 'b twice, then A before a: bbAa.' }],
    hints: ['Count how often each letter occurs.', 'Sort the distinct letters by count (descending) and by ASCII code (ascending).', 'Write every letter as many times as it occurred.'],
    program: {
      io: ['s:word'],
      includes: ['<map>', '<algorithm>'],
      python: r`
        count = {}
        for ch in s:
            count[ch] = count.get(ch, 0) + 1
        order = sorted(count, key=lambda ch: (-count[ch], ch))
        print("".join(ch * count[ch] for ch in order))`,
      cpp: r`
        map<char, int> count;
        for (char ch : s) count[ch]++;
        vector<char> order;
        for (auto& entry : count) order.push_back(entry.first);
        sort(order.begin(), order.end(), [&](char x, char y) {
            if (count[x] != count[y]) return count[x] > count[y];
            return x < y;
        });
        string result;
        for (char ch : order) result += string(count[ch], ch);
        cout << result << "\n";`,
      java: r`
        Map<Character, Integer> count = new HashMap<>();
        for (int i = 0; i < s.length(); i++) count.merge(s.charAt(i), 1, Integer::sum);
        List<Character> order = new ArrayList<>(count.keySet());
        order.sort((x, y) -> {
            if (count.get(x).intValue() != count.get(y).intValue()) return Integer.compare(count.get(y), count.get(x));
            return Character.compare(x, y);
        });
        StringBuilder sb = new StringBuilder();
        for (char ch : order) {
            for (int i = 0; i < count.get(ch); i++) sb.append(ch);
        }
        System.out.println(sb);`
    },
    solution: { explanation: ['Count the letters, sort the few distinct letters by (count descending, code ascending), and write each letter as many times as it occurred.'], complexity: 'Time O(n + 52 log 52), space O(n).' },
    solve(input) { const s = input.trim(); const c = counts([...s]); return [...c.keys()].sort((p, q) => c.get(q) - c.get(p) || (p < q ? -1 : 1)).map((ch) => ch.repeat(c.get(ch))).join(''); },
    tests() { const g = rng(348); const skew = (n, k) => { const letters = shuffle(g, [...ALL]).slice(0, k); return many(n, () => letters[Math.min(k - 1, Math.floor(-Math.log(1 - g()) * k / 4))]).join(''); }; return ['tree\n', 'Aabb\n', 'a\n', 'abc\n', 'cccaaa\n', `${randWord(g, 30, ALL.slice(0, 12))}\n`, `${randWord(g, 2000, ALL)}\n`, `${randWord(g, 20000, ALL)}\n`, `${skew(20000, 20)}\n`, `${skew(20000, 52)}\n`, `${randWord(g, 20000, 'aA')}\n`]; }
  },

  {
    slug: 'fewest-bricks-crossed',
    title: 'The Line That Crosses the Fewest Bricks',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'prefix-sum', 'counting'],
    concept: {
      title: 'Count how many rows have an edge at each position',
      body: [
        'A wall has `n` rows of bricks, all rows with the same total width. You draw a vertical line from the top to the bottom. It crosses a brick unless it goes exactly along an **edge between two bricks** in that row. To cross as few bricks as possible, choose the position where **the most rows have an edge**. Edges at the very left and the very right of the wall are not allowed.',
        { code: 'edges = {}\nfor each row:\n    s = 0\n    for each brick except the last:\n        s += width\n        edges[s] = edges.get(s, 0) + 1\nanswer = n - max(edges.values(), default=0)' },
        'The position of an edge in a row is a prefix sum of the brick widths. The map counts, for every position, in how many rows an edge lies there. Skipping the last brick of each row leaves out the right border of the wall.'
      ]
    },
    statement: ['A wall has `n` rows. Row `i` consists of `cnt[i]` bricks of height 1; all rows have the same total width. You draw a vertical line from the top to the bottom of the wall, which may not run along the left or right border of the wall. A line crosses a brick when it goes through the inside of the brick (an edge between two bricks is not crossed). Print the smallest possible number of crossed bricks.', 'The bricks are given as one list of `t` widths: first the bricks of row 1 from left to right, then the bricks of row 2, and so on.'],
    inputFormat: ['The first line has `n` and `t` (the total number of bricks).', 'The second line has `cnt[1] ... cnt[n]`, the number of bricks of every row.', 'The third line has the `t` widths.'],
    outputFormat: ['Print the smallest number of crossed bricks.'],
    constraints: ['1 <= n <= 1000', 'n <= t <= 20000', '1 <= each width, and the total width of a row is at most 10^9'],
    examples: [{ input: '3 7\n3 2 2\n1 2 1 2 2 3 1\n', note: 'Row 1 has edges at 1 and 3, row 2 at 2, row 3 at 3. The line at position 3 runs along edges in rows 1 and 3 and crosses one brick in row 2.' }],
    hints: ['A line along an edge of a row does not cross a brick of that row.', 'The edge positions of a row are the prefix sums of its widths, without the last one.', 'Count how many rows have an edge at each position; the answer is n minus the largest count.'],
    program: {
      io: ['n:int t:int', 'cnt:int[n]', 'w:int[t]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        edges = {}
        pos = 0
        for i in range(n):
            s = 0
            for j in range(cnt[i] - 1):
                s += w[pos + j]
                edges[s] = edges.get(s, 0) + 1
            pos += cnt[i]
        print(n - max(edges.values(), default=0))`,
      cpp: r`
        unordered_map<long long, int> edges;
        int pos = 0, best = 0;
        for (int i = 0; i < n; i++) {
            long long s = 0;
            for (int j = 0; j + 1 < cnt[i]; j++) {
                s += w[pos + j];
                best = max(best, ++edges[s]);
            }
            pos += cnt[i];
        }
        cout << n - best << "\n";`,
      java: r`
        Map<Long, Integer> edges = new HashMap<>();
        int pos = 0, best = 0;
        for (int i = 0; i < n; i++) {
            long s = 0;
            for (int j = 0; j + 1 < cnt[i]; j++) {
                s += w[pos + j];
                best = Math.max(best, edges.merge(s, 1, Integer::sum));
            }
            pos += (int) cnt[i];
        }
        System.out.println(n - best);`
    },
    solution: { explanation: ['Every internal edge position (a prefix sum without the last brick) is counted in a map. The best line goes along the most popular position.'], complexity: 'Time O(t) on average, space O(t).' },
    solve(input) { const rs = rows(input); const [n] = nums(rs[0]); const cnt = nums(rs[1]); const w = nums(rs[2]); const e = new Map(); let pos = 0, best = 0; for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j + 1 < cnt[i]; j++) { s += w[pos + j]; e.set(s, (e.get(s) || 0) + 1); best = Math.max(best, e.get(s)); } pos += cnt[i]; } return String(n - best); },
    tests() {
      const g = rng(349);
      const wall = (n, maxBricks, total, share) => { const cuts = randDistinct(g, Math.max(share, 1), 1, total - 1).sort((p, q) => p - q); const rowsOut = []; for (let i = 0; i < n; i++) { const extra = randInt(g, 0, maxBricks - 1); const mine = new Set(g() < 0.7 ? cuts : []); for (let e = 0; e < extra; e++) mine.add(randInt(g, 1, total - 1)); const pts = [...mine].sort((p, q) => p - q); const widths = []; let prev = 0; for (const c of pts) { widths.push(c - prev); prev = c; } widths.push(total - prev); rowsOut.push(widths); } const cnt = rowsOut.map((x) => x.length); const flat = rowsOut.flat(); return `${n} ${flat.length}\n${cnt.join(' ')}\n${flat.join(' ')}\n`; };
      const brute = (input) => { const rs = rows(input); const n = nums(rs[0])[0]; const cnt = nums(rs[1]); const w = nums(rs[2]); const total = w.slice(0, cnt[0]).reduce((s, x) => s + x, 0); let best = n, pos = 0; const rowsList = []; for (let i = 0; i < n; i++) { rowsList.push(w.slice(pos, pos + cnt[i])); pos += cnt[i]; } for (let x = 1; x < total; x++) { let crossed = 0; for (const row of rowsList) { let s = 0, edge = false; for (const b of row) { s += b; if (s === x) edge = true; } if (!edge) crossed++; } best = Math.min(best, crossed); } return String(best); };
      crossCheck(() => wall(randInt(g, 1, 5), 3, randInt(g, 3, 12), 2), (i) => this.solve(i), brute);
      return ['3 7\n3 2 2\n1 2 1 2 2 3 1\n', '1 1\n1\n5\n', '2 2\n1 1\n7 7\n', '2 4\n2 2\n1 1 1 1\n', wall(6, 3, 12, 2), wall(40, 4, 50, 3), wall(1000, 10, 1000000000, 5), wall(1000, 20, 1000000000, 10), wall(1000, 10, 40, 3), wall(1000, 4, 1000, 1)];
    }
  },

  {
    slug: 'multiset-intersection',
    title: 'Common Elements With Repeats',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'counting', 'intersection'],
    concept: {
      title: 'The smaller of the two counts',
      body: [
        'For sets, the intersection contains a value once. For **multisets** (collections that may repeat values) a value that occurs `p` times in the first list and `q` times in the second occurs `min(p, q)` times in the intersection. Count the first list in a map; then scan the second list, and every time the map still holds a positive count for the value, take it and decrease the count.',
        { code: 'count = counts of a\nresult = []\nfor y in b:\n    if count.get(y, 0) > 0:\n        result.append(y)\n        count[y] -= 1\nresult.sort()' },
        'Each value of the second list "uses up" one copy from the first. When the copies are used up, further equal values are not taken.'
      ]
    },
    statement: ['Given two lists of integers, print their multiset intersection: every value that occurs in both lists is printed as many times as the **smaller** of its two counts. Print the number of printed values on the first line and the values in increasing order on the second line (an empty line if there are none).'],
    inputFormat: ['The first line has `n` and `m`.', 'The second line has the `n` numbers of the first list.', 'The third line has the `m` numbers of the second list.'],
    outputFormat: ['The first line: the number of values.', 'The second line: the values in increasing order.'],
    constraints: ['1 <= n, m <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5 4\n1 2 2 1 3\n2 2 2 1\n', note: '2 occurs twice in the first list and three times in the second (two copies); 1 once.' }],
    hints: ['Count the numbers of the first list.', 'For each number of the second list, take it if a copy is still available.', 'Sort the taken values at the end.'],
    program: {
      io: ['n:int m:int', 'a:int[n]', 'b:int[m]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        result = []
        for y in b:
            if count.get(y, 0) > 0:
                result.append(y)
                count[y] -= 1
        result.sort()
        print(len(result))
        print(*result)`,
      cpp: r`
        unordered_map<long long, int> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        vector<long long> result;
        for (int i = 0; i < m; i++) {
            auto it = count.find(b[i]);
            if (it != count.end() && it->second > 0) {
                result.push_back(b[i]);
                it->second--;
            }
        }
        sort(result.begin(), result.end());
        cout << result.size() << "\n";
        for (size_t i = 0; i < result.size(); i++) cout << result[i] << (i + 1 < result.size() ? " " : "");
        cout << "\n";`,
      java: r`
        Map<Long, Integer> count = new HashMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1, Integer::sum);
        List<Long> result = new ArrayList<>();
        for (int i = 0; i < m; i++) {
            int c = count.getOrDefault(b[i], 0);
            if (c > 0) {
                result.add(b[i]);
                count.put(b[i], c - 1);
            }
        }
        Collections.sort(result);
        StringBuilder sb = new StringBuilder();
        for (long v : result) sb.append(v).append(" ");
        System.out.println(result.size());
        System.out.println(sb.toString().trim());`
    },
    solution: { explanation: ['The map holds the available copies from the first list. Every element of the second list takes one copy if there is one.'], complexity: 'Time O(n + m + k log k), space O(n).' },
    solve(input) { const rs = rows(input); const c = counts(nums(rs[1])); const res = []; for (const y of nums(rs[2])) if ((c.get(y) || 0) > 0) { res.push(y); c.set(y, c.get(y) - 1); } res.sort((p, s) => p - s); return `${res.length}\n${res.join(' ')}`; },
    tests() { const g = rng(350); const two = (n, m, lo, hi) => `${n} ${m}\n${randArray(g, n, lo, hi).join(' ')}\n${randArray(g, m, lo, hi).join(' ')}\n`; return ['5 4\n1 2 2 1 3\n2 2 2 1\n', '1 1\n5\n5\n', '1 1\n5\n6\n', '3 3\n4 4 4\n4 4 4\n', two(10, 12, -4, 4), two(2000, 1500, -100, 100), two(20000, 20000, -1000000000, 1000000000), two(20000, 20000, -300, 300), two(20000, 5, 0, 10), two(5, 20000, 0, 10), two(20000, 20000, -30000, 30000)]; }
  }
];
