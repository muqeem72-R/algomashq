import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const counts = (a) => { const c = new Map(); for (const x of a) c.set(x, (c.get(x) || 0) + 1); return c; };
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const rev = (x) => Number(String(x).split('').reverse().join(''));

export default [
  {
    slug: 'subdomain-visit-counts',
    title: 'Visits to Every Subdomain',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'strings', 'aggregation'],
    concept: {
      title: 'One record adds to several keys',
      body: [
        'A visit to `discuss.leetcode.com` is also a visit to `leetcode.com` and to `com`. So one input record has to be added to **several keys** of the map: the whole domain and each of its endings that start after a dot.',
        { code: 'parts = domain.split(".")\nfor i in range(len(parts)):\n    sub = ".".join(parts[i:])\n    visits[sub] = visits.get(sub, 0) + count' },
        'The map accumulates the sum of the visit counts for each key. In the end, sort the keys to print them in a fixed order; a map never promises any order by itself.'
      ]
    },
    statement: ['You get `n` records. Each record has a number of visits and a domain such as `discuss.leetcode.com`. A visit to a domain is also a visit to each of its parent domains: `discuss.leetcode.com`, `leetcode.com` and `com`. Compute the total number of visits for every domain and parent domain that occurs. Print how many different domains there are, and then one line per domain with its total visits and its name, in alphabetical order of the names.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has the number of visits and the domain, separated by a space.'],
    outputFormat: ['The first line: the number of different domains.', 'Then one line per domain: `visits name`.'],
    constraints: ['1 <= n <= 20000', '1 <= visits <= 10^4', 'A domain has 1 to 4 parts separated by dots; each part has 1 to 6 lowercase letters.'],
    examples: [{ input: '2\n900 google.mail.com\n50 yahoo.com\n', note: 'com gets 950, google.mail.com 900, mail.com 900 and yahoo.com 50.' }],
    hints: ['A record with the domain `a.b.c` adds its visits to `a.b.c`, `b.c` and `c`.', 'Use a map from the domain name to the total visits.', 'Sort the names before printing.'],
    program: {
      io: ['n:int', 'e:word[n][2]'],
      fast: true,
      includes: ['<map>'],
      python: r`
        visits = {}
        for cnt, domain in e:
            c = int(cnt)
            parts = domain.split(".")
            for i in range(len(parts)):
                sub = ".".join(parts[i:])
                visits[sub] = visits.get(sub, 0) + c
        print(len(visits))
        for sub in sorted(visits):
            print(visits[sub], sub)`,
      cpp: r`
        map<string, long long> visits;
        for (int i = 0; i < n; i++) {
            long long c = stoll(e[i][0]);
            const string& domain = e[i][1];
            visits[domain] += c;
            for (size_t p = 0; p < domain.size(); p++) {
                if (domain[p] == '.') visits[domain.substr(p + 1)] += c;
            }
        }
        cout << visits.size() << "\n";
        for (auto& entry : visits) cout << entry.second << " " << entry.first << "\n";`,
      java: r`
        TreeMap<String, Long> visits = new TreeMap<>();
        for (int i = 0; i < n; i++) {
            long c = Long.parseLong(e[i][0]);
            String domain = e[i][1];
            visits.merge(domain, c, Long::sum);
            for (int p = 0; p < domain.length(); p++) {
                if (domain.charAt(p) == '.') visits.merge(domain.substring(p + 1), c, Long::sum);
            }
        }
        StringBuilder sb = new StringBuilder();
        sb.append(visits.size()).append("\n");
        for (Map.Entry<String, Long> entry : visits.entrySet()) sb.append(entry.getValue()).append(" ").append(entry.getKey()).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Each record adds its visits to its domain and to every parent domain (the text after each dot). The map is printed in sorted order of the names.'], complexity: 'Time O(total length * parts), space O(total length).' },
    solve(input) { const v = new Map(); for (const line of rows(input).slice(1)) { const [c, d] = line.split(' '); const parts = d.split('.'); for (let i = 0; i < parts.length; i++) { const sub = parts.slice(i).join('.'); v.set(sub, (v.get(sub) || 0) + Number(c)); } } const keys = [...v.keys()].sort(); return `${keys.length}\n${keys.map((k) => `${v.get(k)} ${k}`).join('\n')}`; },
    tests() { const g = rng(371); const make = (n, labels, depth) => { const pool = many(labels, () => randWord(g, randInt(g, 1, 6), LOW)); const lines = many(n, () => `${randInt(g, 1, 10000)} ${many(randInt(g, 1, depth), () => pool[randInt(g, 0, pool.length - 1)]).join('.')}`); return `${n}\n${lines.join('\n')}\n`; }; return ['2\n900 google.mail.com\n50 yahoo.com\n', '1\n5 a\n', '1\n10000 a.b.c.d\n', '3\n1 a.b\n2 a.b\n3 b\n',make(10, 4, 3), make(300, 10, 4), make(20000, 40, 4), make(20000, 8, 4), make(20000, 500, 4), make(20000, 3000, 2)]; }
  },

  {
    slug: 'rabbits-in-the-forest',
    title: 'Rabbits in the Forest',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'counting', 'greedy'],
    concept: {
      title: 'Rabbits with the same answer share colour groups',
      body: [
        'Some rabbits are asked "how many **other** rabbits have the same colour as you?". A rabbit that answers `a` belongs to a colour group of exactly `a + 1` rabbits. Rabbits with **different answers** cannot be in the same group. Rabbits with the same answer `a` can fill groups of size `a + 1`, one group after the other.',
        { code: 'for a, c in count.items():          # c rabbits answered a\n    size = a + 1\n    groups = (c + size - 1) // size      # round up: how many groups are needed\n    total += groups * size' },
        'To minimise the number of rabbits, fill groups as completely as possible: `c` rabbits need `ceil(c / size)` groups. The groups that are not full still count with their whole size, because the missing rabbits are in the forest without having been asked.'
      ]
    },
    statement: ['In a forest, `n` rabbits were asked how many other rabbits have the same colour as themselves. Their answers are given. Print the smallest possible number of rabbits in the forest.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` answers.'],
    outputFormat: ['Print the smallest possible number of rabbits.'],
    constraints: ['1 <= n <= 20000', '0 <= each answer <= 10^9'],
    examples: [{ input: '3\n1 1 2\n', note: 'The two rabbits that said 1 can be one pair. The rabbit that said 2 needs a group of 3: 2 + 3 = 5.' }, { input: '3\n10 10 10\n', note: 'One group of 11 rabbits.' }],
    hints: ['A rabbit with answer a is in a group of a + 1 rabbits.', 'Rabbits with different answers are in different groups.', 'For `c` rabbits with answer a, you need `ceil(c / (a + 1))` groups of size a + 1.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        total = 0
        for x, c in count.items():
            size = x + 1
            total += (c + size - 1) // size * size
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        long long total = 0;
        for (auto& entry : count) {
            long long size = entry.first + 1;
            total += (entry.second + size - 1) / size * size;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> count = new HashMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1L, Long::sum);
        long total = 0;
        for (Map.Entry<Long, Long> entry : count.entrySet()) {
            long size = entry.getKey() + 1;
            total += (entry.getValue() + size - 1) / size * size;
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Rabbits with the same answer fill colour groups of size `answer + 1`; `ceil(count / size)` groups are needed for each answer.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const c = counts(nums(rows(input)[1])); let t = 0; for (const [x, k] of c) t += Math.ceil(k / (x + 1)) * (x + 1); return String(t); },
    tests() { const g = rng(372); return ['3\n1 1 2\n', '3\n10 10 10\n', '1\n0\n', '1\n1000000000\n', '4\n0 0 0 0\n', arr(randArray(g, 30, 0, 4)), arr(randArray(g, 2000, 0, 50)), arr(randArray(g, 20000, 0, 1000000000)), arr(randArray(g, 20000, 0, 100)), arr(randArray(g, 20000, 0, 2)), arr(Array(20000).fill(19999))]; }
  },

  {
    slug: 'nice-pairs-with-reversal',
    title: 'Pairs That Stay Equal After Reversal',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'counting', 'math'],
    concept: {
      title: 'Rearrange the condition until each side depends on one number',
      body: [
        'Let `rev(x)` be `x` with its digits reversed (`rev(120) = 21`). A pair `i < j` is **nice** if `a[i] + rev(a[j]) = a[j] + rev(a[i])`. Move the terms around: `a[i] - rev(a[i]) = a[j] - rev(a[j])`. Now the left side depends only on `i` and the right side only on `j`: the pair is nice exactly when the two numbers have the **same value of `x - rev(x)`**.',
        { code: 'count = {}\ntotal = 0\nfor x in a:\n    key = x - rev(x)\n    total += count.get(key, 0)\n    count[key] = count.get(key, 0) + 1' },
        'Whenever a condition on two elements can be rewritten as "f(i) equals f(j)", a map of `f` values counts the pairs in one pass. The number of pairs can reach about 2 * 10^8, so use 64-bit integers.'
      ]
    },
    statement: ['Let `rev(x)` be the number you get by writing the digits of `x` in the reverse order (for example `rev(120) = 21`). Count the pairs of positions `i < j` for which `a[i] + rev(a[j]) = a[j] + rev(a[i])`.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of pairs.'],
    constraints: ['1 <= n <= 20000', '0 <= each number <= 10^9'],
    examples: [{ input: '4\n42 11 1 97\n', note: 'x - rev(x) is 18 for 42, 0 for 11, 0 for 1 and 18 for 97, so the nice pairs are (42, 97) and (11, 1).' }],
    hints: ['Rearrange the equation so that each side depends on one number only.', 'The pair is nice when `x - rev(x)` is equal for both numbers.', 'Count equal keys with a map, adding the earlier count for each number.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {}
        total = 0
        for x in a:
            key = x - int(str(x)[::-1])
            total += count.get(key, 0)
            count[key] = count.get(key, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> count;
        long long total = 0;
        for (int i = 0; i < n; i++) {
            long long reversed = 0;
            for (long long y = a[i]; y > 0; y /= 10) reversed = reversed * 10 + y % 10;
            long long key = a[i] - reversed;
            total += count[key];
            count[key]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> count = new HashMap<>();
        long total = 0;
        for (int i = 0; i < n; i++) {
            long reversed = 0;
            for (long y = a[i]; y > 0; y /= 10) reversed = reversed * 10 + y % 10;
            long key = a[i] - reversed;
            total += count.getOrDefault(key, 0L);
            count.merge(key, 1L, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['`a[i] + rev(a[j]) = a[j] + rev(a[i])` is the same as `a[i] - rev(a[i]) = a[j] - rev(a[j])`, so equal keys form the nice pairs.'], complexity: 'Time O(n * digits) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const c = counts(a.map((x) => x - rev(x))); let t = 0; for (const k of c.values()) t += (k * (k - 1)) / 2; return String(t); },
    tests() {
      const g = rng(373);
      const brute = (i) => { const a = nums(rows(i)[1]); let t = 0; for (let x = 0; x < a.length; x++) for (let y = x + 1; y < a.length; y++) if (a[x] + rev(a[y]) === a[y] + rev(a[x])) t++; return t; };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 10), 0, 200)), (i) => this.solve(i), brute);
      const pal = (n) => arr(many(n, () => { const h = randInt(g, 1, 99999); return Number(String(h) + String(h).split('').reverse().join('')); }));
      return ['4\n42 11 1 97\n', '1\n5\n', '2\n10 1\n', '3\n0 0 0\n', arr(randArray(g, 30, 0, 99)), arr(randArray(g, 2000, 0, 100000)), arr(randArray(g, 20000, 0, 1000000000)), arr(randArray(g, 20000, 0, 1000)), pal(20000), arr(many(20000, (i) => i * 11))];
    }
  },

  {
    slug: 'sorted-in-alien-alphabet',
    title: 'Sorted in an Unusual Alphabet?',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'strings', 'sorting-order'],
    concept: {
      title: 'A table that gives every letter its rank',
      body: [
        'In another alphabet the letters come in a different order, for example `hlabcdefgijkmnopqrstuvwxyz` puts `h` first. Words are sorted **lexicographically** in that order: compare the first letters by rank, if equal compare the second letters, and so on; a word that is a **prefix** of another comes first.',
        { code: 'rank = {ch: i for i, ch in enumerate(order)}\nkeys = [[rank[ch] for ch in word] for word in words]\nsorted_ok = all(keys[i] <= keys[i + 1] for i in range(len(keys) - 1))' },
        'A map (or a table of 26 numbers) from letter to rank turns every word into a list of numbers, and comparing lists of numbers is exactly the lexicographic comparison with the prefix rule.'
      ]
    },
    statement: ['The alphabet has the 26 lowercase letters in a new order, given as a word `order` (it contains every letter once). Words are compared letter by letter in this order; if one word is a prefix of the other, the shorter word is smaller. Given `n` words, print `yes` if they are listed in non-decreasing order, otherwise `no`.'],
    inputFormat: ['The first line has the word `order`.', 'The second line has `n`.', 'The third line has the `n` words.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20000', 'Each word has 1 to 20 lowercase letters.'],
    examples: [{ input: 'hlabcdefgijkmnopqrstuvwxyz\n2\nhello leetcode\n', note: 'h comes before l in this alphabet: sorted.' }, { input: 'worldabcefghijkmnpqstuvxyz\n3\nword world row\n', note: 'In this alphabet l comes before d, so at the fourth letter "word" is bigger than "world": not sorted.' }],
    hints: ['Give every letter its position in `order`.', 'Compare neighbouring words letter by letter using these positions.', 'If all letters of the shorter word match, the shorter word must come first.'],
    program: {
      io: ['order:word', 'n:int', 'w:word[n]'],
      fast: true,
      python: r`
        rank = {ch: i for i, ch in enumerate(order)}
        keys = [[rank[ch] for ch in word] for word in w]
        ok = True
        for i in range(n - 1):
            if keys[i] > keys[i + 1]:
                ok = False
                break
        print("yes" if ok else "no")`,
      cpp: r`
        int rank[26];
        for (int i = 0; i < 26; i++) rank[order[i] - 'a'] = i;
        bool ok = true;
        for (int i = 0; i + 1 < n && ok; i++) {
            const string& x = w[i];
            const string& y = w[i + 1];
            size_t k = 0;
            while (k < x.size() && k < y.size() && x[k] == y[k]) k++;
            if (k == y.size() && k < x.size()) ok = false;
            else if (k < x.size() && k < y.size() && rank[x[k] - 'a'] > rank[y[k] - 'a']) ok = false;
        }
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        int[] rank = new int[26];
        for (int i = 0; i < 26; i++) rank[order.charAt(i) - 'a'] = i;
        boolean ok = true;
        for (int i = 0; i + 1 < n && ok; i++) {
            String x = w[i], y = w[i + 1];
            int k = 0;
            while (k < x.length() && k < y.length() && x.charAt(k) == y.charAt(k)) k++;
            if (k == y.length() && k < x.length()) ok = false;
            else if (k < x.length() && k < y.length() && rank[x.charAt(k) - 'a'] > rank[y.charAt(k) - 'a']) ok = false;
        }
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['Neighbouring words are compared with the ranks of the letters at the first position where they differ; a longer word before its own prefix is out of order.'], complexity: 'Time O(total length), space O(26).' },
    solve(input) { const [order, , ws] = rows(input); const w = ws.split(' '); const rank = {}; [...order].forEach((c, i) => { rank[c] = i; }); const key = (x) => [...x].map((c) => rank[c]); const le = (a, b) => { for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] < b[i]; return a.length <= b.length; }; for (let i = 0; i + 1 < w.length; i++) if (!le(key(w[i]), key(w[i + 1]))) return 'no'; return 'yes'; },
    tests() {
      const g = rng(374);
      const perm = () => shuffle(g, [...LOW]).join('');
      const cmp = (rank) => (x, y) => { for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return rank[x[i]] - rank[y[i]]; return x.length - y.length; };
      const make = (n, len, alpha, sortedList, breakAt) => { const order = perm(); const rank = {}; [...order].forEach((c, i) => { rank[c] = i; }); let ws = many(n, () => randWord(g, randInt(g, 1, len), alpha)); if (sortedList) ws.sort(cmp(rank)); if (breakAt !== undefined && n > 1) { const i = Math.min(breakAt, n - 2); if (cmp(rank)(ws[i], ws[i + 1]) < 0) [ws[i], ws[i + 1]] = [ws[i + 1], ws[i]]; } return `${order}\n${n}\n${ws.join(' ')}\n`; };
      const alien = 'hlabcdefgijkmnopqrstuvwxyz';
      return [`${alien}\n2\nhello leetcode\n`, 'worldabcefghijkmnpqstuvxyz\n3\nword world row\n', 'abcdefghijklmnopqrstuvwxyz\n2\napp apple\n', 'abcdefghijklmnopqrstuvwxyz\n2\napple app\n', 'zyxwvutsrqponmlkjihgfedcba\n1\nabc\n', make(10, 4, 'abc', true), make(10, 4, 'abc', true, 3), make(2000, 8, 'abcd', true), make(20000, 20, LOW, true), make(20000, 20, LOW, true, 19990), make(20000, 3, 'ab', true), make(20000, 20, LOW, false)];
    }
  },

  {
    slug: 'balanced-letter-splits',
    title: 'Splits With Equally Many Different Letters',
    difficulty: 'medium',
    tags: ['hashing', 'hash-set', 'prefix', 'strings'],
    concept: {
      title: 'Distinct letters of every prefix and every suffix',
      body: [
        'A **split** cuts the word into a non-empty left part and a non-empty right part. You want to count the splits where both parts contain the **same number of different letters**. Checking each split from scratch costs `O(n)` each, `O(n^2)` in total. Instead precompute two arrays: `pre[i]` = number of different letters in the first `i` letters, and `suf[i]` = number of different letters in the letters from position `i` to the end. Each is built with one pass and a set.',
        { code: 'seen = set(); pre = [0] * (n + 1)\nfor i, ch in enumerate(s):\n    seen.add(ch)\n    pre[i + 1] = len(seen)\n# suf is built the same way from the right\ncount = sum(1 for i in range(1, n) if pre[i] == suf[i])' },
        'The number of different letters of a prefix can only grow, so a set that is never cleared gives all prefix values in one pass. The suffixes are processed from the right end in the same way.'
      ]
    },
    statement: ['Cut a word into two non-empty parts (the first `i` letters and the rest, for `i` from 1 to length - 1). Count the cuts for which both parts contain the same number of different letters.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the number of cuts.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'aacaba\n', note: 'The cuts aac|aba and aaca|ba have 2 different letters on each side: two good cuts.' }],
    hints: ['Build an array with the number of different letters of every prefix.', 'Build an array with the same for every suffix.', 'Count the cut positions where both values are equal.'],
    program: {
      io: ['s:word'],
      includes: ['<unordered_set>'],
      python: r`
        n = len(s)
        pre = [0] * (n + 1)
        suf = [0] * (n + 1)
        seen = set()
        for i in range(n):
            seen.add(s[i])
            pre[i + 1] = len(seen)
        seen = set()
        for i in range(n - 1, -1, -1):
            seen.add(s[i])
            suf[i] = len(seen)
        print(sum(1 for i in range(1, n) if pre[i] == suf[i]))`,
      cpp: r`
        int n = s.size();
        vector<int> pre(n + 1, 0), suf(n + 1, 0);
        unordered_set<char> seen;
        for (int i = 0; i < n; i++) {
            seen.insert(s[i]);
            pre[i + 1] = seen.size();
        }
        seen.clear();
        for (int i = n - 1; i >= 0; i--) {
            seen.insert(s[i]);
            suf[i] = seen.size();
        }
        int count = 0;
        for (int i = 1; i < n; i++) {
            if (pre[i] == suf[i]) count++;
        }
        cout << count << "\n";`,
      java: r`
        int n = s.length();
        int[] pre = new int[n + 1], suf = new int[n + 1];
        Set<Character> seen = new HashSet<>();
        for (int i = 0; i < n; i++) {
            seen.add(s.charAt(i));
            pre[i + 1] = seen.size();
        }
        seen.clear();
        for (int i = n - 1; i >= 0; i--) {
            seen.add(s.charAt(i));
            suf[i] = seen.size();
        }
        int count = 0;
        for (int i = 1; i < n; i++) {
            if (pre[i] == suf[i]) count++;
        }
        System.out.println(count);`
    },
    solution: { explanation: ['Two sets built from the left and from the right give the number of different letters of every prefix and suffix; a cut is counted when the two values agree.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const s = input.trim(); let c = 0; for (let i = 1; i < s.length; i++) if (new Set(s.slice(0, i)).size === new Set(s.slice(i)).size) c++; return String(c); },
    tests() { const g = rng(375); return ['aacaba\n', 'a\n', 'ab\n', 'aaaa\n', 'abcd\n', 'abab\n', `${randWord(g, 30, 'abc')}\n`, `${randWord(g, 400, 'abcdef')}\n`, `${randWord(g, 3000, LOW)}\n`, `${randWord(g, 6000, 'ab')}\n`, `${'ab'.repeat(2500)}\n`, `${randWord(g, 5000, 'abcdefghij')}\n`]; }
  },

  {
    slug: 'steps-to-make-anagram',
    title: 'Fewest Replacements to Make an Anagram',
    difficulty: 'medium',
    tags: ['hashing', 'counting', 'strings'],
    concept: {
      title: 'Count the letters that are missing',
      body: [
        'In one step you may replace **any one letter** of the first word by any other letter. You want the first word to become an anagram of the second one (same letters, any order), using the fewest steps. A replacement changes the count of one letter down and the count of another up. So the minimum number of steps is the total amount by which the first word has **too few** copies of some letters: `sum(max(0, count_t[ch] - count_s[ch]))`.',
        { code: 'need = 0\nfor ch in letters:\n    need += max(0, count_t[ch] - count_s[ch])' },
        'The words have the same length, so the total surplus equals the total shortage: one replacement fixes one missing letter by using up one surplus letter. Counting shortages is enough.'
      ]
    },
    statement: ['Two words `s` and `t` of the same length are given. In one step you may replace any letter of `s` by any other letter. Print the smallest number of steps that turn `s` into an anagram of `t`.'],
    inputFormat: ['The first line has `s`.', 'The second line has `t`.'],
    outputFormat: ['Print the smallest number of steps.'],
    constraints: ['1 <= length <= 20000', 'Both words have the same length and contain lowercase letters.'],
    examples: [{ input: 'bab\naba\n', note: 'Replace one b by an a.' }, { input: 'leetcode\npractice\n', note: 'Five letters have to change.' }],
    hints: ['Count the letters of both words.', 'A letter is missing in `s` when `t` has more copies of it.', 'Add up the missing copies over all letters.'],
    program: {
      io: ['s:word', 't:word'],
      includes: ['<algorithm>'],
      python: r`
        cs = [0] * 26
        ct = [0] * 26
        for ch in s:
            cs[ord(ch) - ord("a")] += 1
        for ch in t:
            ct[ord(ch) - ord("a")] += 1
        print(sum(max(0, ct[i] - cs[i]) for i in range(26)))`,
      cpp: r`
        vector<int> cs(26, 0), ct(26, 0);
        for (char ch : s) cs[ch - 'a']++;
        for (char ch : t) ct[ch - 'a']++;
        int steps = 0;
        for (int i = 0; i < 26; i++) steps += max(0, ct[i] - cs[i]);
        cout << steps << "\n";`,
      java: r`
        int[] cs = new int[26], ct = new int[26];
        for (int i = 0; i < s.length(); i++) cs[s.charAt(i) - 'a']++;
        for (int i = 0; i < t.length(); i++) ct[t.charAt(i) - 'a']++;
        int steps = 0;
        for (int i = 0; i < 26; i++) steps += Math.max(0, ct[i] - cs[i]);
        System.out.println(steps);`
    },
    solution: { explanation: ['Each step can fix at most one missing letter, and every missing copy needs a step, so the answer is the total number of missing copies.'], complexity: 'Time O(n), space O(26).' },
    solve(input) { const [s, t] = rows(input); const cs = counts([...s]), ct = counts([...t]); let st = 0; for (const [ch, c] of ct) st += Math.max(0, c - (cs.get(ch) || 0)); return String(st); },
    tests() { const g = rng(376); const two = (n, a) => `${randWord(g, n, a)}\n${randWord(g, n, a)}\n`; const w = randWord(g, 20000, LOW); return ['bab\naba\n', 'leetcode\npractice\n', 'a\na\n', 'a\nb\n', 'abc\ncba\n', two(15, 'abc'), two(2000, 'abcdef'), two(20000, LOW), two(20000, 'ab'), `${w}\n${shuffle(g, [...w]).join('')}\n`, `${'a'.repeat(20000)}\n${'b'.repeat(20000)}\n`]; }
  },

  {
    slug: 'longest-block-limited-frequency',
    title: 'Longest Block Where Nothing Repeats Too Often',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'sliding-window', 'counting'],
    concept: {
      title: 'A window with a map of counts',
      body: [
        'You look for the longest block of consecutive elements in which **no value occurs more than `k` times**. Use a sliding window with a map of the counts of the values inside it. Add the element at the right end. If its count is now more than `k`, shrink the window from the left until that count is `k` again.',
        { code: 'count = {}\nl = best = 0\nfor r, x in enumerate(a):\n    count[x] = count.get(x, 0) + 1\n    while count[x] > k:\n        count[a[l]] -= 1\n        l += 1\n    best = max(best, r - l + 1)' },
        'Only the value `x` that was just added can break the rule, so it is enough to shrink while `count[x] > k`. Both ends only move forward, so the work is linear.'
      ]
    },
    statement: ['Given `n` integers and a number `k`, find the length of the longest block of consecutive elements in which every value occurs at most `k` times.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the length.'],
    constraints: ['1 <= n <= 20000', '1 <= k <= n', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '8 2\n1 2 3 1 2 3 1 2\n', note: 'The block 1 2 3 1 2 3 has every value twice: length 6.' }],
    hints: ['Keep a window and a map with the counts of its values.', 'After adding the new element, shrink from the left while its count is above k.', 'Remember the largest window.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        count = {}
        l = 0
        best = 0
        for rr, x in enumerate(a):
            count[x] = count.get(x, 0) + 1
            while count[x] > k:
                count[a[l]] -= 1
                l += 1
            best = max(best, rr - l + 1)
        print(best)`,
      cpp: r`
        unordered_map<long long, int> count;
        int l = 0, best = 0;
        for (int rr = 0; rr < n; rr++) {
            count[a[rr]]++;
            while (count[a[rr]] > k) {
                count[a[l]]--;
                l++;
            }
            best = max(best, rr - l + 1);
        }
        cout << best << "\n";`,
      java: r`
        Map<Long, Integer> count = new HashMap<>();
        int l = 0, best = 0;
        for (int rr = 0; rr < n; rr++) {
            count.merge(a[rr], 1, Integer::sum);
            while (count.get(a[rr]) > k) {
                count.merge(a[l], -1, Integer::sum);
                l++;
            }
            best = Math.max(best, rr - l + 1);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The window keeps the counts of its values; when the newest value is too frequent, the left end moves until the count drops back to `k`.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]); const c = new Map(); let l = 0, best = 0; for (let r2 = 0; r2 < a.length; r2++) { c.set(a[r2], (c.get(a[r2]) || 0) + 1); while (c.get(a[r2]) > k) { c.set(a[l], c.get(a[l]) - 1); l++; } best = Math.max(best, r2 - l + 1); } return String(best); },
    tests() {
      const g = rng(377);
      const make = (n, k, lo, hi) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (i) => { const rs = rows(i); const k = nums(rs[0])[1]; const a = nums(rs[1]); let best = 0; for (let x = 0; x < a.length; x++) { const c = new Map(); for (let y = x; y < a.length; y++) { c.set(a[y], (c.get(a[y]) || 0) + 1); if (c.get(a[y]) > k) break; best = Math.max(best, y - x + 1); } } return best; };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 4), 0, 3), (i) => this.solve(i), brute);
      return ['8 2\n1 2 3 1 2 3 1 2\n', '1 1\n5\n', '4 1\n7 7 7 7\n', '4 4\n7 7 7 7\n', '5 2\n1 2 1 2 1\n', make(30, 2, 0, 4), make(2000, 3, -20, 20), make(20000, 5, -1000000000, 1000000000), make(20000, 1, 0, 30), make(20000, 100, 0, 50), make(20000, 20000, 0, 5)];
    }
  },

  {
    slug: 'palindrome-of-two-letter-words',
    title: 'Palindrome From Two-Letter Words',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'counting', 'palindrome', 'strings'],
    concept: {
      title: 'Pair every word with its reversal',
      body: [
        'Each word has exactly two letters. When you write chosen words one after another to form a palindrome, a word `xy` placed in the first half must be matched by the word `yx` in the mirror position of the second half. So words come in **pairs `xy` and `yx`**. A word with two **equal** letters, such as `aa`, is its own reversal: two copies of it form a pair, and **one single leftover copy** can stand in the centre.',
        { code: 'for w, c in count.items():\n    rev = w[::-1]\n    if w != rev:\n        if w < rev and rev in count:        # count each couple once\n            length += 4 * min(c, count[rev])\n    else:\n        length += 4 * (c // 2)\n        if c % 2: centre = True\nlength += 2 if centre else 0' },
        'Every pair contributes 4 letters (2 words of 2 letters). Only one word can be in the middle, so the centre bonus of 2 letters is added at most once, however many words `aa`, `bb`, ... have a leftover.'
      ]
    },
    statement: ['You are given `n` words of exactly two lowercase letters. Choose some of them (each word at most once) and write them in a row, in any order, so that the resulting text is a palindrome. Print the greatest possible length of such a text (0 if no word can be used).'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` words.'],
    outputFormat: ['Print the length.'],
    constraints: ['1 <= n <= 20000', 'Each word has exactly 2 lowercase letters.'],
    examples: [{ input: '6\nlc cl gg gg ab ba\n', note: 'The pairs lc + cl, ab + ba and gg + gg give 4 letters each: 12 in total.' }, { input: '4\nab ty yt lc\n', note: 'ty + yt form a palindrome of length 4.' }],
    hints: ['A word `xy` needs a partner `yx` on the other side of the palindrome.', 'For `x != y` take `min(count[xy], count[yx])` pairs, each pair gives 4 letters.', 'Words like `aa` pair with themselves; one leftover `aa` may go in the centre (+2).'],
    program: {
      io: ['n:int', 'w:word[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        count = {}
        for word in w:
            count[word] = count.get(word, 0) + 1
        length = 0
        centre = False
        for word, c in count.items():
            reverse = word[::-1]
            if word != reverse:
                if word < reverse and reverse in count:
                    length += 4 * min(c, count[reverse])
            else:
                length += 4 * (c // 2)
                if c % 2 == 1:
                    centre = True
        print(length + (2 if centre else 0))`,
      cpp: r`
        unordered_map<string, int> count;
        for (int i = 0; i < n; i++) count[w[i]]++;
        long long length = 0;
        bool centre = false;
        for (auto& entry : count) {
            string reverse(entry.first.rbegin(), entry.first.rend());
            if (entry.first != reverse) {
                auto it = count.find(reverse);
                if (entry.first < reverse && it != count.end()) length += 4LL * min(entry.second, it->second);
            } else {
                length += 4LL * (entry.second / 2);
                if (entry.second % 2 == 1) centre = true;
            }
        }
        cout << length + (centre ? 2 : 0) << "\n";`,
      java: r`
        Map<String, Integer> count = new HashMap<>();
        for (int i = 0; i < n; i++) count.merge(w[i], 1, Integer::sum);
        long length = 0;
        boolean centre = false;
        for (Map.Entry<String, Integer> entry : count.entrySet()) {
            String word = entry.getKey();
            String reverse = "" + word.charAt(1) + word.charAt(0);
            if (!word.equals(reverse)) {
                Integer other = count.get(reverse);
                if (word.compareTo(reverse) < 0 && other != null) length += 4L * Math.min(entry.getValue(), other);
            } else {
                length += 4L * (entry.getValue() / 2);
                if (entry.getValue() % 2 == 1) centre = true;
            }
        }
        System.out.println(length + (centre ? 2 : 0));`
    },
    solution: { explanation: ['Words `xy` and `yx` form mirror pairs worth 4 letters each; a word `xx` pairs with itself, and one leftover `xx` can be the centre.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const w = rows(input)[1].split(' '); const c = counts(w); let len = 0, centre = false; for (const [x, k] of c) { const rv = x[1] + x[0]; if (x !== rv) { if (x < rv && c.has(rv)) len += 4 * Math.min(k, c.get(rv)); } else { len += 4 * Math.floor(k / 2); if (k % 2) centre = true; } } return String(len + (centre ? 2 : 0)); },
    tests() {
      const g = rng(378);
      const make = (n, alpha) => `${n}\n${many(n, () => randWord(g, 2, alpha)).join(' ')}\n`;
      const brute = (i) => { const w = rows(i)[1].split(' '); let best = 0; const isPal = (s) => s === [...s].reverse().join(''); const go = (used, cur) => { if (cur.length && isPal(cur)) best = Math.max(best, cur.length); for (let x = 0; x < w.length; x++) if (!(used & (1 << x))) go(used | (1 << x), cur + w[x]); }; go(0, ''); return best; };
      crossCheck(() => make(randInt(g, 1, 6), 'abc'), (i) => this.solve(i), brute, 100);
      return ['6\nlc cl gg gg ab ba\n', '4\nab ty yt lc\n', '1\naa\n', '1\nab\n', '3\naa aa aa\n', make(20, 'ab'), make(300, 'abc'), make(20000, 'ab'), make(20000, 'abcd'), make(20000, LOW), make(20000, 'abcdefgh')];
    }
  }
];
