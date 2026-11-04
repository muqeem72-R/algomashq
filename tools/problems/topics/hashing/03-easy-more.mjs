import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const ALL = LOW + LOW.toUpperCase();
const counts = (a) => { const c = new Map(); for (const x of a) c.set(x, (c.get(x) || 0) + 1); return c; };

export default [
  {
    slug: 'word-pattern',
    title: 'Does the Pattern Match the Words?',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'mapping', 'strings'],
    concept: {
      title: 'The same two-way map, with words as values',
      body: [
        'A pattern like `abba` matches the words `dog cat cat dog` when every pattern letter always stands for the same word and every word is always written by the same letter. This is the isomorphic-words idea again, but one side of the mapping consists of **whole words** (strings).',
        { code: 'letter_to_word, word_to_letter = {}, {}\nfor ch, w in zip(pattern, words):\n    if letter_to_word.setdefault(ch, w) != w or word_to_letter.setdefault(w, ch) != ch:\n        return False' },
        'Hash maps accept strings as keys as easily as numbers. First check that the pattern and the list of words have the same length.'
      ]
    },
    statement: ['You are given a pattern (a word of lowercase letters) and `k` words. Print `yes` if the words follow the pattern: the `i`-th pattern letter corresponds to the `i`-th word, the same letter always stands for the same word, and different letters stand for different words. Otherwise print `no`.'],
    inputFormat: ['The first line has the pattern.', 'The second line has `k`.', 'The third line has the `k` words.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length of the pattern, k <= 20000', 'The words consist of 1 to 8 lowercase letters.'],
    examples: [{ input: 'abba\n4\ndog cat cat dog\n', note: 'a = dog and b = cat.' }, { input: 'abba\n4\ndog dog dog dog\n', note: 'a and b would both be dog.' }],
    hints: ['If the length of the pattern differs from `k`, the answer is no.', 'Keep a map from pattern letters to words and another from words to pattern letters.', 'Fail as soon as a letter or a word would need two partners.'],
    program: {
      io: ['p:word', 'k:int', 'w:word[k]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        ok = len(p) == k
        toWord, toLetter = {}, {}
        if ok:
            for ch, word in zip(p, w):
                if toWord.setdefault(ch, word) != word or toLetter.setdefault(word, ch) != ch:
                    ok = False
                    break
        print("yes" if ok else "no")`,
      cpp: r`
        bool ok = (long long) p.size() == k;
        unordered_map<char, string> toWord;
        unordered_map<string, char> toLetter;
        for (int i = 0; ok && i < k; i++) {
            if (toWord.count(p[i]) && toWord[p[i]] != w[i]) ok = false;
            else if (toLetter.count(w[i]) && toLetter[w[i]] != p[i]) ok = false;
            else {
                toWord[p[i]] = w[i];
                toLetter[w[i]] = p[i];
            }
        }
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        boolean ok = p.length() == k;
        Map<Character, String> toWord = new HashMap<>();
        Map<String, Character> toLetter = new HashMap<>();
        for (int i = 0; ok && i < k; i++) {
            char ch = p.charAt(i);
            if (toWord.containsKey(ch) && !toWord.get(ch).equals(w[i])) ok = false;
            else if (toLetter.containsKey(w[i]) && toLetter.get(w[i]) != ch) ok = false;
            else {
                toWord.put(ch, w[i]);
                toLetter.put(w[i], ch);
            }
        }
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['Two maps keep the correspondence in both directions. A conflict in either map means the words do not follow the pattern.'], complexity: 'Time O(total length of the words), space O(k).' },
    solve(input) { const [p, k0, ws] = rows(input); const w = ws.split(' '); if (p.length !== Number(k0)) return 'no'; const f = new Map(), b = new Map(); for (let i = 0; i < p.length; i++) { if (f.has(p[i]) && f.get(p[i]) !== w[i]) return 'no'; if (b.has(w[i]) && b.get(w[i]) !== p[i]) return 'no'; f.set(p[i], w[i]); b.set(w[i], p[i]); } return 'yes'; },
    tests() {
      const g = rng(321);
      const pool = []; while (pool.length < 26) { const w = randWord(g, randInt(g, 1, 8), LOW); if (!pool.includes(w)) pool.push(w); }
      const follow = (n, letters) => { const p = randWord(g, n, LOW.slice(0, letters)); const m = {}; [...LOW.slice(0, letters)].forEach((c, i) => { m[c] = pool[i]; }); return { p, words: [...p].map((c) => m[c]) }; };
      const mk = ({ p, words }) => `${p}\n${words.length}\n${words.join(' ')}\n`;
      const a = follow(30, 4), b = follow(20000, 10), c = follow(20000, 26), d = follow(20000, 3);
      const fresh = 'zzzzzzzz'; const bad = { p: c.p, words: c.words.map((x, i) => (i === 19999 ? fresh : x)) };
      return ['abba\n4\ndog cat cat dog\n', 'abba\n4\ndog dog dog dog\n', 'aaaa\n4\ndog cat cat dog\n', 'abba\n3\ndog cat cat\n', 'a\n1\nx\n', mk(a), mk(b), mk(c), mk(d), mk(bad), mk({ p: b.p, words: b.words.map((x, i) => (i === 7 ? 'zzz' : x)) })];
    }
  },

  {
    slug: 'zero-sum-subarray',
    title: 'Is There a Block With Sum Zero?',
    difficulty: 'easy',
    tags: ['hashing', 'hash-set', 'prefix-sum'],
    concept: {
      title: 'Two equal prefix sums mean a zero block',
      body: [
        'Let `prefix[i]` be the sum of the first `i` numbers, with `prefix[0] = 0`. The sum of the block from position `i + 1` to `j` is `prefix[j] - prefix[i]`. So a block has sum zero exactly when **two prefix sums are equal**.',
        { code: 'seen = {0}          # the empty prefix\nprefix = 0\nfor x in a:\n    prefix += x\n    if prefix in seen:\n        return True       # a block with sum 0 ends here\n    seen.add(prefix)' },
        'Starting the set with 0 handles blocks that begin at the first position: if the prefix itself becomes 0, it equals the empty prefix. Prefix sums combined with a hash set or map are one of the most useful tricks for block-sum questions.'
      ]
    },
    statement: ['Is there a non-empty block of consecutive elements of the array whose sum is 0? Print `yes` or `no`.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5\n4 2 -3 1 6\n', note: 'The block 2 -3 1 has sum 0.' }, { input: '3\n1 2 3\n', note: 'All blocks have a positive sum.' }],
    hints: ['Think of the prefix sums.', 'The block between two equal prefix sums has sum 0.', 'Keep a set of the prefix sums seen so far, starting with 0.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_set>'],
      python: r`
        seen = {0}
        prefix = 0
        found = False
        for x in a:
            prefix += x
            if prefix in seen:
                found = True
                break
            seen.add(prefix)
        print("yes" if found else "no")`,
      cpp: r`
        unordered_set<long long> seen = {0};
        long long prefix = 0;
        bool found = false;
        for (int i = 0; i < n; i++) {
            prefix += a[i];
            if (seen.count(prefix)) {
                found = true;
                break;
            }
            seen.insert(prefix);
        }
        cout << (found ? "yes" : "no") << "\n";`,
      java: r`
        Set<Long> seen = new HashSet<>();
        seen.add(0L);
        long prefix = 0;
        boolean found = false;
        for (int i = 0; i < n; i++) {
            prefix += a[i];
            if (!seen.add(prefix)) {
                found = true;
                break;
            }
        }
        System.out.println(found ? "yes" : "no");`
    },
    solution: { explanation: ['Two equal prefix sums enclose a block with sum 0. A set of the prefix sums seen so far, starting with 0, detects this in one pass.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const seen = new Set([0]); let p = 0; for (const x of a) { p += x; if (seen.has(p)) return 'yes'; seen.add(p); } return 'no'; },
    tests() {
      const g = rng(322);
      const brute = (a) => { for (let i = 0; i < a.length; i++) { let s = 0; for (let j = i; j < a.length; j++) { s += a[j]; if (s === 0) return 'yes'; } } return 'no'; };
      for (let t = 0; t < 200; t++) { const a = randArray(g, randInt(g, 1, 8), -4, 4); if (brute(a) !== this.solve(arr(a))) throw new Error('zero-sum reference differs from brute force'); }
      const noZero = (n) => arr(many(n, () => randInt(g, 1, 1000000000)));
      const hidden = (n) => { const a = many(n, () => randInt(g, 1, 1000000000)); const i = randInt(g, 0, n - 3); a[i + 2] = -(a[i] + a[i + 1]); return arr(a); };
      return ['5\n4 2 -3 1 6\n', '3\n1 2 3\n', '1\n0\n', '1\n7\n', '2\n5 -5\n', '4\n1 -1 5 5\n', noZero(20000), hidden(20000), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20, -10, 10))];
    }
  },

  {
    slug: 'same-multiset',
    title: 'Is One List a Rearrangement of the Other?',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'counting'],
    concept: {
      title: 'Equal counts, equal contents',
      body: [
        'Two lists are rearrangements of each other when every value occurs **equally often** in both. Count the values of the first list up, then go through the second list and count them down. If no counter ever goes below zero and all counters end at zero, the lists match. Because both lists have the same length, it is enough that no counter drops below zero.',
        { code: 'count = {}\nfor x in a: count[x] = count.get(x, 0) + 1\nfor y in b:\n    if count.get(y, 0) == 0: return False\n    count[y] -= 1\nreturn True' },
        'Sorting both lists and comparing them is another way (O(n log n)). The map solution is O(n) and is the model for many "same letters, same counts" questions.'
      ]
    },
    statement: ['Two lists of `n` integers are given. Print `yes` if the second list can be obtained by reordering the first one (each value occurs the same number of times in both), otherwise print `no`.'],
    inputFormat: ['The first line has `n`.', 'The second line has the first list.', 'The third line has the second list.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '4\n1 2 2 3\n2 3 1 2\n', note: 'Same values, same counts.' }, { input: '3\n1 1 2\n1 2 2\n', note: 'The first list has two 1s, the second has two 2s.' }],
    hints: ['Count the numbers of the first list in a map.', 'For each number of the second list, decrease its count.', 'If a count is already 0 when you need it, the answer is no.'],
    program: {
      io: ['n:int', 'a:int[n]', 'b:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        ok = True
        for y in b:
            if count.get(y, 0) == 0:
                ok = False
                break
            count[y] -= 1
        print("yes" if ok else "no")`,
      cpp: r`
        unordered_map<long long, int> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        bool ok = true;
        for (int i = 0; i < n; i++) {
            auto it = count.find(b[i]);
            if (it == count.end() || it->second == 0) {
                ok = false;
                break;
            }
            it->second--;
        }
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        Map<Long, Integer> count = new HashMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1, Integer::sum);
        boolean ok = true;
        for (int i = 0; i < n; i++) {
            int c = count.getOrDefault(b[i], 0);
            if (c == 0) {
                ok = false;
                break;
            }
            count.put(b[i], c - 1);
        }
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['The first list adds to the counters and the second list takes from them. The lists are rearrangements exactly when no counter is ever missing.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const a = nums(rs[1]).sort((p, s) => p - s).join(','); const b = nums(rs[2]).sort((p, s) => p - s).join(','); return a === b ? 'yes' : 'no'; },
    tests() { const g = rng(323); const base = (n, lo, hi) => randArray(g, n, lo, hi); const two = (a, b) => `${a.length}\n${a.join(' ')}\n${b.join(' ')}\n`; const x1 = base(20, -3, 3), x2 = base(2000, -50, 50), x3 = base(20000, -1000000000, 1000000000), x4 = base(20000, 0, 30); const alter = (a) => { const b = shuffle(g, a); b[0] = b[0] + 1; return b; }; return ['4\n1 2 2 3\n2 3 1 2\n', '3\n1 1 2\n1 2 2\n', '1\n5\n5\n', '1\n5\n6\n', two(x1, shuffle(g, x1)), two(x2, shuffle(g, x2)), two(x3, shuffle(g, x3)), two(x3, alter(x3)), two(x4, shuffle(g, x4)), two(x4, alter(x4))]; }
  },

  {
    slug: 'first-unique-number',
    title: 'The First Number That Occurs Once',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'counting', 'two-passes'],
    concept: {
      title: 'Two passes: count, then look again in order',
      body: [
        'A hash map knows **how often** each value occurs, but not **where** the first one is. To find the first value (by position) that occurs exactly once, make two passes: the first pass counts, the second pass goes through the array in its original order and stops at the first element whose count is 1.',
        { code: 'count = {}\nfor x in a: count[x] = count.get(x, 0) + 1\nfor x in a:\n    if count[x] == 1:\n        return x' },
        'Going through the array (not through the map) in the second pass is what gives the "first" element. A map has no reliable order.'
      ]
    },
    statement: ['Print the first number (reading from left to right) that occurs exactly once in the array. If there is no such number, print `none`.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number, or `none`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '7\n4 5 4 6 5 7 6\n', note: '7 is the first value that occurs once.' }, { input: '4\n1 1 2 2\n', note: 'Every number is repeated.' }],
    hints: ['First count how often each value occurs.', 'Then go through the array again in order.', 'The first element with count 1 is the answer.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        answer = "none"
        for x in a:
            if count[x] == 1:
                answer = x
                break
        print(answer)`,
      cpp: r`
        unordered_map<long long, int> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        bool found = false;
        long long answer = 0;
        for (int i = 0; i < n; i++) {
            if (count[a[i]] == 1) {
                found = true;
                answer = a[i];
                break;
            }
        }
        if (found) cout << answer << "\n";
        else cout << "none\n";`,
      java: r`
        Map<Long, Integer> count = new HashMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1, Integer::sum);
        String answer = "none";
        for (int i = 0; i < n; i++) {
            if (count.get(a[i]) == 1) {
                answer = String.valueOf(a[i]);
                break;
            }
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['The first pass counts the values; the second pass scans in the original order and returns the first value with count 1.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const c = counts(a); for (const x of a) if (c.get(x) === 1) return String(x); return 'none'; },
    tests() { const g = rng(324); return ['7\n4 5 4 6 5 7 6\n', '4\n1 1 2 2\n', '1\n9\n', '3\n1 2 3\n', arr(randArray(g, 25, -5, 5)), arr(randArray(g, 2000, -1000, 1000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, 0, 10000)), arr([...many(10000, (i) => i), ...many(10000, (i) => i)]), arr([...many(10000, (i) => i), 123456, ...many(9999, (i) => i)])]; }
  },

  {
    slug: 'word-frequency',
    title: 'Word Frequencies',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'strings', 'counting'],
    concept: {
      title: 'Keys can be words',
      body: [
        'Counting words is counting numbers with a different kind of key. Split the line into words, add one to the counter of each word, then print the words in alphabetical order. In Python, strings compare by their letters in dictionary order, which is what `sorted` uses.',
        { code: 'count = {}\nfor word in line.split():\n    count[word] = count.get(word, 0) + 1\nfor word in sorted(count):\n    print(word, count[word])' },
        'In C++ a `map<string, int>` keeps its keys sorted; in Java use a `TreeMap<String, Integer>`. Splitting a line on whitespace needs `stringstream` in C++ and `split("\\\\s+")` in Java.'
      ]
    },
    statement: ['Given a line of text with words separated by one or more spaces, print every different word and how many times it occurs, in alphabetical order, one word per line.'],
    inputFormat: ['A single line of lowercase words separated by spaces.'],
    outputFormat: ['For each different word in alphabetical order, print the word and its count separated by a space.'],
    constraints: ['The line has between 1 and 20000 characters and at least one word.', 'Each word has 1 to 10 lowercase letters.'],
    examples: [{ input: 'the cat and the hat and the bat\n', note: 'and 2, bat 1, cat 1, hat 1, the 3.' }],
    hints: ['Split the line into words.', 'Count every word with a map.', 'Print the keys in alphabetical order.'],
    program: {
      io: ['s:line'],
      includes: ['<sstream>', '<map>'],
      python: r`
        count = {}
        for word in s.split():
            count[word] = count.get(word, 0) + 1
        for word in sorted(count):
            print(word, count[word])`,
      cpp: r`
        stringstream ss(s);
        map<string, int> count;
        string word;
        while (ss >> word) count[word]++;
        for (auto& entry : count) cout << entry.first << " " << entry.second << "\n";`,
      java: r`
        Map<String, Integer> count = new TreeMap<>();
        for (String word : s.trim().split("\\s+")) count.merge(word, 1, Integer::sum);
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, Integer> entry : count.entrySet()) sb.append(entry.getKey()).append(" ").append(entry.getValue()).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['A map from word to count is filled while the line is split into words; its keys are then printed in sorted order.'], complexity: 'Time O(total length + d log d), space O(total length).' },
    solve(input) { const c = counts(input.replace(/\n$/, '').trim().split(/\s+/)); return [...c.keys()].sort().map((w) => `${w} ${c.get(w)}`).join('\n'); },
    tests() { const g = rng(325); const vocab = (k, len) => many(k, () => randWord(g, randInt(g, 1, len), LOW)); const text = (count, words) => many(count, () => words[randInt(g, 0, words.length - 1)]).join(' '); return ['the cat and the hat and the bat\n', 'one\n', 'a a a a\n', '  spaced   out  words  \n', `${text(15, vocab(5, 4))}\n`, `${text(300, vocab(40, 6))}\n`, `${text(3000, vocab(200, 5))}\n`, `${text(2000, vocab(2000, 10))}\n`.slice(0, 20000) + '\n', `${text(9000, vocab(3, 1))}\n`]; }
  },

  {
    slug: 'sum-of-unique-numbers',
    title: 'Sum of the Numbers That Occur Once',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'counting'],
    concept: {
      title: 'Filter by count',
      body: [
        'Counting with a map is often only the first step. Once you know how often each value occurs, you can **filter** the entries by their count and combine the values that remain. Here we keep the values whose count is exactly 1 and add them.',
        { code: 'count = {}\nfor x in a:\n    count[x] = count.get(x, 0) + 1\ntotal = sum(v for v, c in count.items() if c == 1)' },
        'A value that occurs several times is not added at all (not even once). If no value occurs exactly once, the sum is 0.'
      ]
    },
    statement: ['Add up all the values that occur exactly once in an array of `n` integers. Values that occur more than once are not counted at all. Print the sum (0 if there is no such value).'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the sum.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6\n1 2 3 2 5 3\n', note: 'Only 1 and 5 occur once: 1 + 5 = 6.' }],
    hints: ['Count how often each value occurs.', 'Go through the map and take the values whose count is 1.', 'Add them; the answer may be 0.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        total = 0
        for value, c in count.items():
            if c == 1:
                total += value
        print(total)`,
      cpp: r`
        unordered_map<long long, int> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        long long total = 0;
        for (auto& entry : count) {
            if (entry.second == 1) total += entry.first;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Integer> count = new HashMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1, Integer::sum);
        long total = 0;
        for (Map.Entry<Long, Integer> entry : count.entrySet()) {
            if (entry.getValue() == 1) total += entry.getKey();
        }
        System.out.println(total);`
    },
    solution: { explanation: ['After counting, the values with count 1 are added up.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { let t = 0; for (const [v, k] of counts(nums(rows(input)[1]))) if (k === 1) t += v; return String(t); },
    tests() { const g = rng(326); return ['6\n1 2 3 2 5 3\n', '1\n-8\n', '4\n7 7 7 7\n', '3\n1 2 3\n', arr(randArray(g, 25, -5, 5)), arr(randArray(g, 2000, -1000, 1000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, 0, 15000)), arr(randArray(g, 20000, -1000000000, 1000000000).map((v, i) => (i % 3 === 0 ? 5 : v)))]; }
  },

  {
    slug: 'arithmetic-progression-check',
    title: 'Can They Form an Arithmetic Progression?',
    difficulty: 'easy',
    tags: ['hashing', 'hash-set', 'math'],
    concept: {
      title: 'Compute the expected numbers and look them up',
      body: [
        'In an arithmetic progression of `n` numbers the smallest value is `lo`, the largest is `hi`, and the step is `d = (hi - lo) / (n - 1)`. If `hi - lo` is not divisible by `n - 1`, the step would not be a whole number. Otherwise the progression must be exactly `lo, lo + d, lo + 2d, ..., hi`. Put the given numbers in a set and check that every expected term is present, and that no number was repeated.',
        { code: 'present = set(a)\nok = len(present) == n and all(lo + i * d in present for i in range(n))' },
        'A special case: if all numbers are equal (`lo == hi`), the step is 0 and the answer is yes. This avoids sorting: finding the minimum and maximum and using a set takes O(n).'
      ]
    },
    statement: ['Can the `n` numbers (`n >= 2`) be reordered to form an arithmetic progression, i.e. a sequence in which the difference between neighbours is always the same? Print `yes` or `no`.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['2 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '4\n7 1 5 3\n', note: '1 3 5 7 has the step 2.' }, { input: '4\n1 2 4 8\n', note: 'No step works.' }],
    hints: ['Find the smallest and the largest number.', 'The step must be `(hi - lo) / (n - 1)` and a whole number.', 'Check with a set that each of the terms `lo + i * d` is present, and that all numbers are different (unless the step is 0).'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_set>', '<algorithm>'],
      python: r`
        lo, hi = min(a), max(a)
        if lo == hi:
            ok = True
        elif (hi - lo) % (n - 1) != 0:
            ok = False
        else:
            d = (hi - lo) // (n - 1)
            present = set(a)
            ok = len(present) == n and all(lo + i * d in present for i in range(n))
        print("yes" if ok else "no")`,
      cpp: r`
        long long lo = *min_element(a.begin(), a.end()), hi = *max_element(a.begin(), a.end());
        bool ok;
        if (lo == hi) {
            ok = true;
        } else if ((hi - lo) % (n - 1) != 0) {
            ok = false;
        } else {
            long long d = (hi - lo) / (n - 1);
            unordered_set<long long> present(a.begin(), a.end());
            ok = (long long) present.size() == n;
            for (long long i = 0; ok && i < n; i++) {
                if (!present.count(lo + i * d)) ok = false;
            }
        }
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        long lo = Long.MAX_VALUE, hi = Long.MIN_VALUE;
        for (int i = 0; i < n; i++) {
            lo = Math.min(lo, a[i]);
            hi = Math.max(hi, a[i]);
        }
        boolean ok;
        if (lo == hi) {
            ok = true;
        } else if ((hi - lo) % (n - 1) != 0) {
            ok = false;
        } else {
            long d = (hi - lo) / (n - 1);
            Set<Long> present = new HashSet<>();
            for (int i = 0; i < n; i++) present.add(a[i]);
            ok = present.size() == n;
            for (long i = 0; ok && i < n; i++) {
                if (!present.contains(lo + i * d)) ok = false;
            }
        }
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['The smallest and largest number fix the step. A set confirms that every term of the progression is present exactly once.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]).sort((p, s) => p - s); const d = a[1] - a[0]; for (let i = 1; i < a.length; i++) if (a[i] - a[i - 1] !== d) return 'no'; return 'yes'; },
    tests() { const g = rng(327); const ap = (n, d, start) => many(n, (i) => start + i * d); return ['4\n7 1 5 3\n', '4\n1 2 4 8\n', '2\n5 -5\n', '3\n4 4 4\n', '3\n1 2 2\n', arr(shuffle(g, ap(20, 7, -50))), arr(shuffle(g, ap(20000, 99999, -1000000000))), arr(shuffle(g, ap(20000, -4, 70000))), arr(shuffle(g, [...ap(19999, 3, 0), 3 * 20000 + 1])), arr(shuffle(g, [...ap(19998, 5, 0), 10, 5 * 19997])), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(Array(20000).fill(-3))]; }
  },

  {
    slug: 'count-elements-with-successor',
    title: 'Numbers With a Successor',
    difficulty: 'easy',
    tags: ['hashing', 'hash-set', 'counting'],
    concept: {
      title: 'Ask the set about the neighbour value',
      body: [
        'A number `x` has a **successor** in the array if `x + 1` is also in the array. Put all the numbers into a set once. Then every question "is `x + 1` present?" is answered in O(1).',
        { code: 'present = set(a)\ncount = sum(1 for x in a if x + 1 in present)' },
        'Note that you count **elements**, not different values: a value that occurs three times and has a successor contributes 3.'
      ]
    },
    statement: ['Count the elements `x` of the array for which `x + 1` also occurs somewhere in the array. Equal elements are counted separately.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the count.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6\n1 1 3 3 5 6\n', note: 'Only 5 has a successor (6): the answer is 1.' }, { input: '4\n1 2 3 3\n', note: '1 and 2 each have a successor; the two 3s do not.' }],
    hints: ['Put all numbers into a set.', 'For each element, check whether `x + 1` is in the set.', 'Count the elements, so equal elements are counted each time.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_set>'],
      python: r`
        present = set(a)
        count = 0
        for x in a:
            if x + 1 in present:
                count += 1
        print(count)`,
      cpp: r`
        unordered_set<long long> present(a.begin(), a.end());
        int count = 0;
        for (int i = 0; i < n; i++) {
            if (present.count(a[i] + 1)) count++;
        }
        cout << count << "\n";`,
      java: r`
        Set<Long> present = new HashSet<>();
        for (int i = 0; i < n; i++) present.add(a[i]);
        int count = 0;
        for (int i = 0; i < n; i++) {
            if (present.contains(a[i] + 1)) count++;
        }
        System.out.println(count);`
    },
    solution: { explanation: ['A set of all values answers each "is x + 1 present?" question in O(1).'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const s = new Set(a); return String(a.filter((x) => s.has(x + 1)).length); },
    tests() { const g = rng(328); return ['6\n1 1 3 3 5 6\n', '4\n1 2 3 3\n', '1\n4\n', '2\n-1 0\n', arr(randArray(g, 25, -5, 5)), arr(randArray(g, 2000, -1000, 1000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, 0, 100000)), arr(randArray(g, 20000, 0, 30)), arr(many(20000, (i) => i * 2))]; }
  },

  {
    slug: 'palindrome-rearrangement',
    title: 'Can the Letters Make a Palindrome?',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'strings', 'palindrome'],
    concept: {
      title: 'At most one letter with an odd count',
      body: [
        'A palindrome reads the same backwards. Its letters come in **pairs** around the middle, and in an odd-length palindrome the middle letter is alone. So the letters of a word can be rearranged into a palindrome exactly when **at most one letter occurs an odd number of times**.',
        { code: 'count = {}\nfor ch in s:\n    count[ch] = count.get(ch, 0) + 1\nodd = sum(1 for c in count.values() if c % 2 == 1)\nanswer = odd <= 1' },
        'A neat trick with a set: toggle each letter (add it if absent, remove it if present). The letters left in the set are exactly the letters with an odd count.'
      ]
    },
    statement: ['Print `yes` if the letters of the word can be rearranged to form a palindrome (a word that reads the same forwards and backwards), otherwise print `no`. Upper and lower case letters are different.'],
    inputFormat: ['A single word of letters.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'carrace\n', note: 'racecar uses the letters of carrace.' }, { input: 'code\n', note: 'Four letters that occur once each.' }],
    hints: ['Count how often each letter occurs.', 'In a palindrome at most one letter can have an odd count (the middle one).', 'Count the letters with an odd count and compare with 1.'],
    program: {
      io: ['s:word'],
      includes: ['<unordered_set>'],
      python: r`
        odd = set()
        for ch in s:
            if ch in odd:
                odd.remove(ch)
            else:
                odd.add(ch)
        print("yes" if len(odd) <= 1 else "no")`,
      cpp: r`
        unordered_set<char> odd;
        for (char ch : s) {
            if (odd.count(ch)) odd.erase(ch);
            else odd.insert(ch);
        }
        cout << (odd.size() <= 1 ? "yes" : "no") << "\n";`,
      java: r`
        Set<Character> odd = new HashSet<>();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (!odd.remove(ch)) odd.add(ch);
        }
        System.out.println(odd.size() <= 1 ? "yes" : "no");`
    },
    solution: { explanation: ['A set toggled by every letter ends up holding the letters with an odd count. A palindrome needs at most one of them.'], complexity: 'Time O(n), space O(alphabet).' },
    solve(input) { const c = counts([...input.trim()]); return [...c.values()].filter((k) => k % 2).length <= 1 ? 'yes' : 'no'; },
    tests() { const g = rng(329); const pal = (half, mid) => { const h = randWord(g, half, ALL); return shuffle(g, [...h, ...h, ...(mid ? [ALL[randInt(g, 0, 51)]] : [])]).join(''); }; return ['carrace\n', 'code\n', 'a\n', 'ab\n', 'aabb\n', 'aA\n', `${pal(15, true)}\n`, `${pal(10000, false)}\n`, `${pal(9999, true)}\n`, `${randWord(g, 20000, 'abcd')}\n`, `${randWord(g, 20000, ALL)}\n`, `${pal(10000, false).slice(0, 19999)}x\n`]; }
  },

  {
    slug: 'longest-palindrome-from-letters',
    title: 'Longest Palindrome You Can Build',
    difficulty: 'easy',
    tags: ['hashing', 'hash-map', 'strings', 'palindrome', 'counting'],
    concept: {
      title: 'Use all the pairs, plus one middle letter',
      body: [
        'You may choose letters from a word (each letter at most as often as it occurs) and arrange them as a palindrome. Every letter that occurs `c` times gives `c // 2` **pairs**, which can all be placed symmetrically: that is `2 * (c // 2)` letters. In addition, if at least one letter has an odd count, one single letter can sit in the middle (+1).',
        { code: 'count = {}\nfor ch in s: count[ch] = count.get(ch, 0) + 1\nlength = sum(c - c % 2 for c in count.values())\nif any(c % 2 for c in count.values()):\n    length += 1' },
        'Each letter contributes its even part, and there is only one middle position, so the "+1" is added at most once no matter how many letters have an odd count.'
      ]
    },
    statement: ['Given a word, find the length of the longest palindrome that can be built using the letters of the word, each letter used at most as many times as it occurs. Upper and lower case letters are different.'],
    inputFormat: ['A single word of letters.'],
    outputFormat: ['Print the length.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'abccccdd\n', note: 'dccaccd has length 7.' }],
    hints: ['Pairs of equal letters can be placed on both sides of the middle.', 'A letter with count `c` gives `c - c % 2` letters in pairs.', 'If some letter has an odd count, add one more letter for the middle.'],
    program: {
      io: ['s:word'],
      includes: ['<unordered_map>'],
      python: r`
        count = {}
        for ch in s:
            count[ch] = count.get(ch, 0) + 1
        length = 0
        hasOdd = False
        for c in count.values():
            length += c - c % 2
            if c % 2 == 1:
                hasOdd = True
        print(length + 1 if hasOdd else length)`,
      cpp: r`
        unordered_map<char, int> count;
        for (char ch : s) count[ch]++;
        int length = 0;
        bool hasOdd = false;
        for (auto& entry : count) {
            length += entry.second - entry.second % 2;
            if (entry.second % 2 == 1) hasOdd = true;
        }
        cout << (hasOdd ? length + 1 : length) << "\n";`,
      java: r`
        Map<Character, Integer> count = new HashMap<>();
        for (int i = 0; i < s.length(); i++) count.merge(s.charAt(i), 1, Integer::sum);
        int length = 0;
        boolean hasOdd = false;
        for (int c : count.values()) {
            length += c - c % 2;
            if (c % 2 == 1) hasOdd = true;
        }
        System.out.println(hasOdd ? length + 1 : length);`
    },
    solution: { explanation: ['All pairs of equal letters are used; one leftover letter, if there is any, goes in the middle.'], complexity: 'Time O(n), space O(alphabet).' },
    solve(input) { const c = counts([...input.trim()]); let len = 0, odd = false; for (const k of c.values()) { len += k - (k % 2); if (k % 2) odd = true; } return String(odd ? len + 1 : len); },
    tests() { const g = rng(330); return ['abccccdd\n', 'a\n', 'bb\n', 'abc\n', 'Aa\n', `${randWord(g, 30, ALL.slice(0, 10))}\n`, `${randWord(g, 2000, ALL)}\n`, `${randWord(g, 20000, ALL)}\n`, `${randWord(g, 20000, 'ab')}\n`, `${'a'.repeat(20000)}\n`, `${LOW.repeat(769)}${LOW.slice(0, 6)}\n`]; }
  }
];
