import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const counts = (a) => { const c = new Map(); for (const x of a) c.set(x, (c.get(x) || 0) + 1); return c; };
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };

export default [
  {
    slug: 'repeated-dna-blocks',
    title: 'Repeated DNA Blocks',
    difficulty: 'medium',
    tags: ['hashing', 'hash-set', 'strings'],
    concept: {
      title: 'Two sets: seen once, seen more than once',
      body: [
        'To find blocks of a fixed length that occur **more than once**, slide over the string and look at every block of that length. Keep a set `seen` of the blocks met so far. When a block is already in `seen`, it is a repeat, and you put it into a second set `repeated` (a set, so that a block found three times is still reported once).',
        { code: 'seen, repeated = set(), set()\nfor i in range(len(s) - 9):\n    block = s[i:i + 10]\n    if block in seen:\n        repeated.add(block)\n    else:\n        seen.add(block)' },
        'The blocks may overlap each other. Strings can be put into hash sets just like numbers; the cost of hashing one block is its length (10 here), so the scan is O(n * 10).'
      ]
    },
    statement: ['A DNA word consists of the letters A, C, G and T. Find all blocks of exactly 10 consecutive letters that occur more than once in the word (blocks may overlap). Print how many different such blocks there are, and then the blocks in alphabetical order, separated by spaces.'],
    inputFormat: ['A single word of the letters A, C, G, T.'],
    outputFormat: ['The first line: the number of repeated blocks.', 'The second line: the blocks in alphabetical order (an empty line if there are none).'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT\n', note: 'AAAAACCCCC and CCCCCAAAAA each occur twice.' }],
    hints: ['Look at every block of 10 letters.', 'Remember the blocks you have met in a set.', 'A block that is already in the set goes into a second set of repeated blocks; sort it at the end.'],
    program: {
      io: ['s:word'],
      includes: ['<unordered_set>', '<set>'],
      python: r`
        seen = set()
        repeated = set()
        for i in range(len(s) - 9):
            block = s[i:i + 10]
            if block in seen:
                repeated.add(block)
            else:
                seen.add(block)
        result = sorted(repeated)
        print(len(result))
        print(*result)`,
      cpp: r`
        unordered_set<string> seen;
        set<string> repeated;
        for (int i = 0; i + 10 <= (int) s.size(); i++) {
            string block = s.substr(i, 10);
            if (seen.count(block)) repeated.insert(block);
            else seen.insert(block);
        }
        cout << repeated.size() << "\n";
        bool first = true;
        for (const string& block : repeated) {
            if (!first) cout << " ";
            cout << block;
            first = false;
        }
        cout << "\n";`,
      java: r`
        Set<String> seen = new HashSet<>();
        TreeSet<String> repeated = new TreeSet<>();
        for (int i = 0; i + 10 <= s.length(); i++) {
            String block = s.substring(i, i + 10);
            if (!seen.add(block)) repeated.add(block);
        }
        System.out.println(repeated.size());
        System.out.println(String.join(" ", repeated));`
    },
    solution: { explanation: ['One set remembers the blocks seen so far; a block that is already in it is a repeat and goes into a second, sorted set.'], complexity: 'Time O(10 * n) on average, space O(10 * n).' },
    solve(input) { const s = input.trim(); const seen = new Set(), rep = new Set(); for (let i = 0; i + 10 <= s.length; i++) { const b = s.slice(i, i + 10); if (seen.has(b)) rep.add(b); else seen.add(b); } const res = [...rep].sort(); return `${res.length}\n${res.join(' ')}`; },
    tests() { const g = rng(361); return ['AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT\n', 'AAAAAAAAAAAAA\n', 'ACGT\n', 'ACGTACGTAC\n', `${randWord(g, 60, 'AC')}\n`, `${randWord(g, 2000, 'ACGT')}\n`, `${randWord(g, 20000, 'ACGT')}\n`, `${randWord(g, 20000, 'AC')}\n`, `${'A'.repeat(20000)}\n`, `${'ACGTTGCAAC'.repeat(2000)}\n`, `${randWord(g, 5000, 'ACGT').repeat(4)}\n`]; }
  },

  {
    slug: 'distinct-blocks-of-length-k',
    title: 'Distinct Blocks of Length k',
    difficulty: 'medium',
    tags: ['hashing', 'hash-set', 'strings', 'substrings'],
    concept: {
      title: 'A set of all substrings of one length',
      body: [
        'A **substring** is a block of consecutive letters. A word of length `n` has `n - k + 1` substrings of length `k`, and several of them may be equal. To count the different ones, put them all into a set and take its size.',
        { code: 'distinct = set()\nfor i in range(len(s) - k + 1):\n    distinct.add(s[i:i + k])\nprint(len(distinct))' },
        'Every substring is copied (`k` letters) and hashed (also `k` steps), so the work is `O((n - k + 1) * k)`. This is fine for small `k`; for large `k` clever tricks (rolling hash, suffix structures) avoid copying, and you will meet them later.'
      ]
    },
    statement: ['Given a word and a number `k`, count how many different blocks of exactly `k` consecutive letters the word contains.'],
    inputFormat: ['The first line has `k`.', 'The second line has the word.'],
    outputFormat: ['Print the number of different blocks.'],
    constraints: ['1 <= k <= 100', 'k <= length of the word <= 20000', 'The word contains lowercase letters.'],
    examples: [{ input: '2\nabcabc\n', note: 'The blocks are ab, bc, ca, ab, bc: three different ones.' }],
    hints: ['The word has `length - k + 1` blocks of length k.', 'Put every block into a set.', 'The answer is the size of the set.'],
    program: {
      io: ['k:int', 's:word'],
      includes: ['<unordered_set>'],
      python: r`
        distinct = set()
        for i in range(len(s) - k + 1):
            distinct.add(s[i:i + k])
        print(len(distinct))`,
      cpp: r`
        unordered_set<string> distinct;
        for (int i = 0; i + k <= (int) s.size(); i++) distinct.insert(s.substr(i, k));
        cout << distinct.size() << "\n";`,
      java: r`
        Set<String> distinct = new HashSet<>();
        for (int i = 0; i + k <= s.length(); i++) distinct.add(s.substring(i, (int) (i + k)));
        System.out.println(distinct.size());`
    },
    solution: { explanation: ['All blocks of length `k` go into a hash set; its size is the number of different blocks.'], complexity: 'Time O(n * k) on average, space O(n * k).' },
    solve(input) { const [k0, s] = rows(input); const k = Number(k0); const set = new Set(); for (let i = 0; i + k <= s.length; i++) set.add(s.slice(i, i + k)); return String(set.size); },
    tests() { const g = rng(362); const make = (n, k, alpha) => `${k}\n${randWord(g, n, alpha)}\n`; return ['2\nabcabc\n', '1\na\n', '1\naaaa\n', '3\nabc\n', '4\nabab\n', make(30, 3, 'ab'), make(2000, 10, 'abc'), make(20000, 100, LOW), make(20000, 5, 'ab'), make(20000, 100, 'ab'), make(20000, 1, LOW), `100\n${'a'.repeat(20000)}\n`]; }
  },

  {
    slug: 'words-from-letters',
    title: 'Words You Can Build',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'counting', 'strings'],
    concept: {
      title: 'Compare the letter counts of a word with the supply',
      body: [
        'You have a pile of letters (some letters several times) and a list of words. A word can be built if for **every letter** the word needs no more copies than the pile has. Count the letters of the pile once. For each word count its own letters and compare letter by letter.',
        { code: 'have = counts of chars\ntotal = 0\nfor word in words:\n    need = counts of word\n    if all(need[ch] <= have.get(ch, 0) for ch in need):\n        total += len(word)' },
        'The pile is not used up between words: each word is checked on its own against the full pile. A letter missing from the pile has a supply of 0.'
      ]
    },
    statement: ['You have a collection of letters, given as a word `chars` (a letter appearing twice means two copies). Each of the `n` given words is checked separately: it can be built if every letter is available at least as many times as the word needs it. Print the total length of all words that can be built.'],
    inputFormat: ['The first line has `chars`.', 'The second line has `n`.', 'The third line has the `n` words.'],
    outputFormat: ['Print the total length of the words that can be built.'],
    constraints: ['1 <= length of chars <= 20000', '1 <= n <= 20000', 'Each word has 1 to 10 lowercase letters.'],
    examples: [{ input: 'atach\n4\ncat bt hat tree\n', note: 'cat and hat can be built (3 + 3 = 6); bt needs a b; tree needs e.' }],
    hints: ['Count the letters of `chars` once.', 'For each word count its letters and compare with the supply.', 'Add the length of the words that fit.'],
    program: {
      io: ['chars:word', 'n:int', 'w:word[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        have = {}
        for ch in chars:
            have[ch] = have.get(ch, 0) + 1
        total = 0
        for word in w:
            need = {}
            for ch in word:
                need[ch] = need.get(ch, 0) + 1
            if all(c <= have.get(ch, 0) for ch, c in need.items()):
                total += len(word)
        print(total)`,
      cpp: r`
        unordered_map<char, int> have;
        for (char ch : chars) have[ch]++;
        long long total = 0;
        for (int i = 0; i < n; i++) {
            unordered_map<char, int> need;
            for (char ch : w[i]) need[ch]++;
            bool ok = true;
            for (auto& entry : need) {
                auto it = have.find(entry.first);
                if (it == have.end() || it->second < entry.second) ok = false;
            }
            if (ok) total += w[i].size();
        }
        cout << total << "\n";`,
      java: r`
        Map<Character, Integer> have = new HashMap<>();
        for (int i = 0; i < chars.length(); i++) have.merge(chars.charAt(i), 1, Integer::sum);
        long total = 0;
        for (int i = 0; i < n; i++) {
            Map<Character, Integer> need = new HashMap<>();
            for (int j = 0; j < w[i].length(); j++) need.merge(w[i].charAt(j), 1, Integer::sum);
            boolean ok = true;
            for (Map.Entry<Character, Integer> entry : need.entrySet()) {
                if (have.getOrDefault(entry.getKey(), 0) < entry.getValue()) ok = false;
            }
            if (ok) total += w[i].length();
        }
        System.out.println(total);`
    },
    solution: { explanation: ['The supply of letters is counted once; each word is compared with it letter by letter.'], complexity: 'Time O(|chars| + total length), space O(alphabet).' },
    solve(input) { const [chars, , ws] = rows(input); const have = counts([...chars]); let t = 0; for (const w of ws.split(' ')) { const need = counts([...w]); if ([...need].every(([ch, c]) => c <= (have.get(ch) || 0))) t += w.length; } return String(t); },
    tests() { const g = rng(363); const make = (nChars, n, alpha) => `${randWord(g, nChars, alpha)}\n${n}\n${many(n, () => randWord(g, randInt(g, 1, 10), alpha)).join(' ')}\n`; return ['atach\n4\ncat bt hat tree\n', 'a\n1\na\n', 'a\n1\nb\n', 'aa\n2\naa aaa\n', make(10, 8, 'abc'), make(200, 300, 'abcd'), make(20000, 20000, LOW), make(100, 20000, 'abc'), make(20000, 20000, 'ab'), make(30, 20000, LOW)]; }
  },

  {
    slug: 'letters-common-to-all-words',
    title: 'Letters Common to All Words',
    difficulty: 'medium',
    tags: ['hashing', 'counting', 'strings', 'intersection'],
    concept: {
      title: 'The minimum count over all words',
      body: [
        'A letter is common to all words if it occurs in every word. If it occurs twice in one word but only once in another, only **one** copy is common. So for each letter, the number of common copies is the **minimum of its counts** over all words.',
        { code: 'common = counts of the first word\nfor word in words[1:]:\n    c = counts of word\n    for ch in common:\n        common[ch] = min(common[ch], c.get(ch, 0))' },
        'Start with the counts of the first word and reduce them word by word. At the end, `common[ch]` is the number of copies of `ch` that all words share. A table of 26 counters (one per letter) is enough for lowercase letters.'
      ]
    },
    statement: ['Given `n` words, find the letters that occur in all of them. A letter that occurs at least `m` times in every word counts `m` times (the minimum over all words). Print these letters in alphabetical order as one word, or `none` if there is no common letter.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` words.'],
    outputFormat: ['Print the common letters as one word, or `none`.'],
    constraints: ['1 <= n <= 20000', 'Each word has 1 to 20 lowercase letters.'],
    examples: [{ input: '3\nbella label roller\n', note: 'The letter e occurs at least once and l at least twice in every word: ell.' }],
    hints: ['Count the letters of the first word.', 'For every other word keep, for each letter, the smaller of the two counts.', 'Write each letter as many times as its final count, in alphabetical order.'],
    program: {
      io: ['n:int', 'w:word[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        common = [0] * 26
        for ch in w[0]:
            common[ord(ch) - ord("a")] += 1
        for word in w[1:]:
            cnt = [0] * 26
            for ch in word:
                cnt[ord(ch) - ord("a")] += 1
            common = [min(x, y) for x, y in zip(common, cnt)]
        result = "".join(chr(ord("a") + i) * common[i] for i in range(26))
        print(result if result else "none")`,
      cpp: r`
        vector<int> common(26, 0);
        for (char ch : w[0]) common[ch - 'a']++;
        for (int i = 1; i < n; i++) {
            vector<int> cnt(26, 0);
            for (char ch : w[i]) cnt[ch - 'a']++;
            for (int c = 0; c < 26; c++) common[c] = min(common[c], cnt[c]);
        }
        string result;
        for (int c = 0; c < 26; c++) result += string(common[c], (char) ('a' + c));
        cout << (result.empty() ? "none" : result) << "\n";`,
      java: r`
        int[] common = new int[26];
        for (int j = 0; j < w[0].length(); j++) common[w[0].charAt(j) - 'a']++;
        for (int i = 1; i < n; i++) {
            int[] cnt = new int[26];
            for (int j = 0; j < w[i].length(); j++) cnt[w[i].charAt(j) - 'a']++;
            for (int c = 0; c < 26; c++) common[c] = Math.min(common[c], cnt[c]);
        }
        StringBuilder sb = new StringBuilder();
        for (int c = 0; c < 26; c++) {
            for (int k = 0; k < common[c]; k++) sb.append((char) ('a' + c));
        }
        System.out.println(sb.length() == 0 ? "none" : sb.toString());`
    },
    solution: { explanation: ['The common copies of a letter are the minimum of its counts over all words; the table is reduced word by word.'], complexity: 'Time O(total length), space O(26).' },
    solve(input) { const w = rows(input)[1].split(' '); let common = counts([...w[0]]); for (const x of w.slice(1)) { const c = counts([...x]); for (const ch of [...common.keys()]) common.set(ch, Math.min(common.get(ch), c.get(ch) || 0)); } const res = [...common.keys()].sort().map((ch) => ch.repeat(common.get(ch))).join(''); return res || 'none'; },
    tests() { const g = rng(364); const make = (n, len, alpha) => `${n}\n${many(n, () => randWord(g, randInt(g, 1, len), alpha)).join(' ')}\n`; const base = (n, core) => `${n}\n${many(n, () => shuffle(g, [...core, ...randWord(g, randInt(g, 0, 8), LOW)]).join('')).join(' ')}\n`; return ['3\nbella label roller\n', '1\nabca\n', '2\nabc def\n', '2\naab abb\n', make(5, 8, 'abc'), make(100, 10, 'abcd'), base(20000, 'hello'), base(20000, 'aabbcc'), make(20000, 20, 'ab'), make(20000, 20, LOW)]; }
  },

  {
    slug: 'anagram-index-mapping',
    title: 'Where Did Each Number Go?',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'permutations'],
    concept: {
      title: 'A map from a value to a list of its positions',
      body: [
        'The second list `b` is a rearrangement of the first list `a`. For every element of `a` you must say at which position of `b` it went. If a value occurs several times, **which copy goes where** has to be decided by a rule so that the answer is unique: here, equal values are matched in order, the first copy of the value in `a` to the first position of that value in `b`, and so on.',
        { code: 'positions = {}\nfor j, x in enumerate(b):\n    positions.setdefault(x, []).append(j)\nused = {}\nfor x in a:\n    k = used.get(x, 0)\n    answer.append(positions[x][k])\n    used[x] = k + 1' },
        'The map stores **a list of positions** for every value (the key points to several values, not one). `used` counts how many copies of a value have been matched already, so it also knows which position of the list is next.'
      ]
    },
    statement: ['The list `b` is a rearrangement of the list `a` (both have `n` numbers). For every element of `a`, print the position (counting from 0) in `b` to which it moves. If a value occurs several times, match the copies in order: the first copy in `a` goes to the first position of that value in `b`, the second copy to the second position, and so on.'],
    inputFormat: ['The first line has `n`.', 'The second line has the list `a`.', 'The third line has the list `b`.'],
    outputFormat: ['Print `n` positions separated by spaces.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9', '`b` has the same numbers as `a` in another order.'],
    examples: [{ input: '5\n12 28 46 32 50\n50 12 32 46 28\n', note: '12 moves to position 1, 28 to position 4, 46 to 3, 32 to 2 and 50 to 0.' }],
    hints: ['For every value, collect the positions where it occurs in `b`.', 'Keep a counter of how many copies of each value you have matched.', 'The k-th copy of a value in `a` goes to the k-th position in its list.'],
    program: {
      io: ['n:int', 'a:int[n]', 'b:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        positions = {}
        for j, x in enumerate(b):
            positions.setdefault(x, []).append(j)
        used = {}
        out = []
        for x in a:
            k = used.get(x, 0)
            out.append(positions[x][k])
            used[x] = k + 1
        print(*out)`,
      cpp: r`
        unordered_map<long long, vector<int>> positions;
        for (int j = 0; j < n; j++) positions[b[j]].push_back(j);
        unordered_map<long long, int> used;
        for (int i = 0; i < n; i++) {
            int k = used[a[i]]++;
            cout << positions[a[i]][k] << (i + 1 < n ? " " : "\n");
        }`,
      java: r`
        Map<Long, List<Integer>> positions = new HashMap<>();
        for (int j = 0; j < n; j++) positions.computeIfAbsent(b[j], key -> new ArrayList<>()).add(j);
        Map<Long, Integer> used = new HashMap<>();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            int k = used.getOrDefault(a[i], 0);
            sb.append(positions.get(a[i]).get(k)).append(i + 1 < n ? " " : "\n");
            used.put(a[i], k + 1);
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['A map keeps the list of positions of every value in `b`; a second map counts how many copies have been matched, which picks the next position from the list.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const a = nums(rs[1]), b = nums(rs[2]); const pos = new Map(); b.forEach((x, j) => { if (!pos.has(x)) pos.set(x, []); pos.get(x).push(j); }); const used = new Map(); return a.map((x) => { const k = used.get(x) || 0; used.set(x, k + 1); return pos.get(x)[k]; }).join(' '); },
    tests() { const g = rng(365); const make = (n, lo, hi) => { const a = randArray(g, n, lo, hi); return `${n}\n${a.join(' ')}\n${shuffle(g, a).join(' ')}\n`; }; return ['5\n12 28 46 32 50\n50 12 32 46 28\n', '1\n7\n7\n', '3\n4 4 4\n4 4 4\n', '4\n1 2 1 2\n2 2 1 1\n', make(12, 0, 4), make(300, -50, 50), make(20000, -1000000000, 1000000000), make(20000, 0, 100), make(20000, 0, 1), make(20000, -20000, 20000)]; }
  },

  {
    slug: 'largest-digit-sum-groups',
    title: 'The Biggest Digit-Sum Groups',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'counting', 'math'],
    concept: {
      title: 'Group by a computed key, then count the groups',
      body: [
        'Group the numbers `1, 2, ..., n` by the **sum of their digits**: 13 and 31 are in the same group (digit sum 4). A hash map with the digit sum as the key counts the members of each group. Afterwards find the **largest group size**, and count how many groups have that size.',
        { code: 'size = {}\nfor x in range(1, n + 1):\n    s = digit_sum(x)\n    size[s] = size.get(s, 0) + 1\nlargest = max(size.values())\nanswer = sum(1 for v in size.values() if v == largest)' },
        'The key does not have to be the number itself: any value you can compute from the element (digit sum, remainder, sorted letters) can group things. Here the key is at most `9 * 6 = 54`, so a small array would work as well as a map.'
      ]
    },
    statement: ['Put the numbers 1, 2, ..., n into groups: two numbers are in the same group if the sums of their digits are equal. Print how many groups have the largest size.'],
    inputFormat: ['A single integer `n`.'],
    outputFormat: ['Print the number of groups of the largest size.'],
    constraints: ['1 <= n <= 500000'],
    examples: [{ input: '13\n', note: 'The groups are [1 10], [2 11], [3 12], [4 13], [5], [6], [7], [8], [9]: four groups of size 2.' }],
    hints: ['Compute the digit sum of every number from 1 to n.', 'Count how many numbers have each digit sum.', 'Find the largest count and count how many digit sums reach it.'],
    program: {
      io: ['n:int'],
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        size = {}
        for x in range(1, n + 1):
            s = 0
            y = x
            while y > 0:
                s += y % 10
                y //= 10
            size[s] = size.get(s, 0) + 1
        largest = max(size.values())
        print(sum(1 for v in size.values() if v == largest))`,
      cpp: r`
        unordered_map<int, int> size;
        for (long long x = 1; x <= n; x++) {
            int s = 0;
            for (long long y = x; y > 0; y /= 10) s += y % 10;
            size[s]++;
        }
        int largest = 0, answer = 0;
        for (auto& entry : size) largest = max(largest, entry.second);
        for (auto& entry : size) {
            if (entry.second == largest) answer++;
        }
        cout << answer << "\n";`,
      java: r`
        Map<Integer, Integer> size = new HashMap<>();
        for (long x = 1; x <= n; x++) {
            int s = 0;
            for (long y = x; y > 0; y /= 10) s += (int) (y % 10);
            size.merge(s, 1, Integer::sum);
        }
        int largest = 0, answer = 0;
        for (int v : size.values()) largest = Math.max(largest, v);
        for (int v : size.values()) {
            if (v == largest) answer++;
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['A map from digit sum to the number of members gives the group sizes; the groups of the largest size are then counted.'], complexity: 'Time O(n log n), space O(1) (at most 54 groups).' },
    solve(input) { const n = Number(input.trim()); const size = new Map(); for (let x = 1; x <= n; x++) { let s = 0; for (let y = x; y > 0; y = Math.floor(y / 10)) s += y % 10; size.set(s, (size.get(s) || 0) + 1); } const largest = Math.max(...size.values()); return String([...size.values()].filter((v) => v === largest).length); },
    tests() { return [13, 2, 1, 9, 10, 15, 24, 100, 1000, 99999, 123456, 500000, 499999, 262144].map((v) => `${v}\n`); }
  },

  {
    slug: 'strings-are-close',
    title: 'Can One Word Become the Other?',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'counting', 'strings'],
    concept: {
      title: 'What the two allowed operations keep',
      body: [
        'You may (1) **swap any two letters** of a word, so the order of the letters is free, and (2) **exchange two existing letters** everywhere (all `a` become `b` and all `b` become `a`), which can move a count from one letter to another. Think about what these operations cannot change: the **set of letters used**, and the **multiset of counts** (for example "two letters occur 3 times, one letter occurs once").',
        { code: 'same_letters = set(a) == set(b)\nsame_counts = sorted(counts(a).values()) == sorted(counts(b).values())\nanswer = same_letters and same_counts' },
        'Operation 2 can never introduce a new letter, so the sets must be equal. It can reassign counts between letters, so only the sorted list of counts matters. If both conditions hold, you can always transform one word into the other.'
      ]
    },
    statement: ['You can change a word with two operations, as often as you like. (1) Swap any two letters of the word. (2) Choose two letters that both occur in the word and exchange them everywhere (every `a` becomes `b` and every `b` becomes `a`). Print `yes` if the first word can be turned into the second word, otherwise `no`.'],
    inputFormat: ['The first line has the first word.', 'The second line has the second word.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length of each word <= 20000', 'The words contain lowercase letters.'],
    examples: [{ input: 'abc\nbca\n', note: 'Swaps are enough.' }, { input: 'cabbba\nabbccc\n', note: 'Both words use a, b and c with the counts 1, 2 and 3 in some order, so exchanges and swaps can turn one into the other.' }, { input: 'aab\nabb\n', note: 'Counts 2 and 1 can be exchanged: yes.' }],
    hints: ['The words must have the same length and use the same set of letters.', 'The multiset of the counts of the letters must be the same.', 'Compare the sorted lists of counts.'],
    program: {
      io: ['a:word', 'b:word'],
      includes: ['<algorithm>'],
      python: r`
        ca = {}
        cb = {}
        for ch in a:
            ca[ch] = ca.get(ch, 0) + 1
        for ch in b:
            cb[ch] = cb.get(ch, 0) + 1
        ok = set(ca) == set(cb) and sorted(ca.values()) == sorted(cb.values())
        print("yes" if ok else "no")`,
      cpp: r`
        vector<int> ca(26, 0), cb(26, 0);
        for (char ch : a) ca[ch - 'a']++;
        for (char ch : b) cb[ch - 'a']++;
        bool ok = true;
        for (int c = 0; c < 26; c++) {
            if ((ca[c] == 0) != (cb[c] == 0)) ok = false;
        }
        sort(ca.begin(), ca.end());
        sort(cb.begin(), cb.end());
        if (ca != cb) ok = false;
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        int[] ca = new int[26], cb = new int[26];
        for (int i = 0; i < a.length(); i++) ca[a.charAt(i) - 'a']++;
        for (int i = 0; i < b.length(); i++) cb[b.charAt(i) - 'a']++;
        boolean ok = true;
        for (int c = 0; c < 26; c++) {
            if ((ca[c] == 0) != (cb[c] == 0)) ok = false;
        }
        Arrays.sort(ca);
        Arrays.sort(cb);
        if (!Arrays.equals(ca, cb)) ok = false;
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['The operations keep the set of letters and can only permute the counts among them, so the words are convertible exactly when the letter sets are equal and the sorted lists of counts are equal.'], complexity: 'Time O(n + 26 log 26), space O(26).' },
    solve(input) { const [a, b] = rows(input); const ca = counts([...a]), cb = counts([...b]); const sa = [...ca.keys()].sort().join(''), sb = [...cb.keys()].sort().join(''); const va = [...ca.values()].sort((p, s) => p - s).join(','), vb = [...cb.values()].sort((p, s) => p - s).join(','); return sa === sb && va === vb ? 'yes' : 'no'; },
    tests() {
      const g = rng(366);
      const brute = (input) => { const [a, b] = rows(input); if (a.length !== b.length || a.length > 6) return null; const seen = new Set([a]); const queue = [a]; while (queue.length) { const cur = queue.shift(); if (cur === b) return 'yes'; const nexts = []; for (let i = 0; i < cur.length; i++) for (let j = i + 1; j < cur.length; j++) { const arr2 = [...cur]; [arr2[i], arr2[j]] = [arr2[j], arr2[i]]; nexts.push(arr2.join('')); } const letters = [...new Set(cur)]; for (const x of letters) for (const y of letters) if (x < y) nexts.push([...cur].map((c) => (c === x ? y : c === y ? x : c)).join('')); for (const nx of nexts) if (!seen.has(nx)) { seen.add(nx); queue.push(nx); } } return 'no'; };
      for (let t = 0; t < 150; t++) { const n = randInt(g, 1, 6); const input = `${randWord(g, n, 'abc')}\n${randWord(g, n, 'abc')}\n`; if (brute(input) !== this.solve(input)) throw new Error('close-strings reference differs from brute force'); }
      const w = randWord(g, 20000, 'abcdef');
      const permuted = shuffle(g, [...w]).join('');
      const swapped = [...w].map((c) => ({ a: 'b', b: 'a' }[c] || c)).join('');
      return ['abc\nbca\n', 'cabbba\nabbccc\n', 'aab\nabb\n', 'a\naa\n', 'abc\nabd\n', 'aabb\naabc\n', `${w}\n${permuted}\n`, `${w}\n${swapped}\n`, `${w}\n${w.replace(/f/g, 'g')}\n`, `${randWord(g, 20000, LOW)}\n${randWord(g, 20000, LOW)}\n`, `${'a'.repeat(10000)}${'b'.repeat(10000)}\n${'b'.repeat(10000)}${'c'.repeat(10000)}\n`];
    }
  },

  {
    slug: 'equivalent-domino-pairs',
    title: 'Equivalent Dominoes',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'counting', 'canonical-form'],
    concept: {
      title: 'Put every domino in a canonical order',
      body: [
        'A domino is a pair of numbers `[a, b]`, and the dominoes `[a, b]` and `[b, a]` are the same (you can turn a domino around). To count equal dominoes, write each one in a **canonical form**: the smaller number first, `(min(a, b), max(a, b))`. Then equal dominoes have equal keys.',
        { code: 'count = {}\ntotal = 0\nfor a, b in dominoes:\n    key = (min(a, b), max(a, b))\n    total += count.get(key, 0)      # pairs with all earlier equal dominoes\n    count[key] = count.get(key, 0) + 1' },
        'This is the same pattern as counting equal pairs of numbers, only the key is a pair. In C++ and Java you can pack the pair into one 64-bit number, for example `min * 1000003 + max`.'
      ]
    },
    statement: ['You have `n` dominoes, each with two numbers `a` and `b` (the domino `[a, b]` and the domino `[b, a]` are equal, since a domino can be turned around). Count the pairs of positions `i < j` for which domino `i` equals domino `j`.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has the two numbers of a domino.'],
    outputFormat: ['Print the number of pairs.'],
    constraints: ['1 <= n <= 20000', '1 <= a, b <= 10^6'],
    examples: [{ input: '4\n1 2\n2 1\n3 4\n5 6\n', note: '[1 2] and [2 1] are equal.' }],
    hints: ['Write each domino as (smaller, larger).', 'Count how many equal dominoes came before.', 'Add that count to the answer before counting the current domino.'],
    program: {
      io: ['n:int', 'd:int[n][2]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        count = {}
        total = 0
        for a, b in d:
            key = (min(a, b), max(a, b))
            total += count.get(key, 0)
            count[key] = count.get(key, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> count;
        long long total = 0;
        for (int i = 0; i < n; i++) {
            long long key = min(d[i][0], d[i][1]) * 1000003LL + max(d[i][0], d[i][1]);
            total += count[key];
            count[key]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> count = new HashMap<>();
        long total = 0;
        for (int i = 0; i < n; i++) {
            long key = Math.min(d[i][0], d[i][1]) * 1000003L + Math.max(d[i][0], d[i][1]);
            total += count.getOrDefault(key, 0L);
            count.merge(key, 1L, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Every domino is turned into the key (smaller, larger); each domino pairs with all earlier ones that have the same key.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const d = rows(input).slice(1).map(nums); const c = counts(d.map(([a, b]) => `${Math.min(a, b)},${Math.max(a, b)}`)); let t = 0; for (const k of c.values()) t += (k * (k - 1)) / 2; return String(t); },
    tests() { const g = rng(367); const make = (n, hi) => `${n}\n${many(n, () => `${randInt(g, 1, hi)} ${randInt(g, 1, hi)}`).join('\n')}\n`; return ['4\n1 2\n2 1\n3 4\n5 6\n', '1\n1 1\n', '2\n1 1\n1 1\n', '3\n1 2\n2 1\n1 2\n', make(20, 3), make(2000, 10), make(20000, 1000000), make(20000, 10), make(20000, 2), make(20000, 150)]; }
  }
];
