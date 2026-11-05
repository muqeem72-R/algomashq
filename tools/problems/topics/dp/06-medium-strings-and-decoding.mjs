import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const MOD = 1000000007;
const MODN = BigInt(MOD);
const lines = (...a) => a.join('\n') + '\n';

export default [
  {
    ...medium,
    inputFormat: ['One line with a string `s` of digits.'],
    constraints: ['1 <= length of s <= 100000', 'The string consists of the digits 0 to 9 (it may start with 0).'],
    slug: 'decode-digit-messages',
    title: 'Read the Digits as Letters: How Many Messages?',
    tags: ['dp', 'string', 'counting', 'decoding'],
    concept: {
      title: 'The last one or two digits form the last letter',
      body: [
        'A message was written by replacing the letters with numbers: `A = 1, B = 2, ..., Z = 26`, and the numbers were glued together into a string of digits. How many different messages could produce the given digit string? For `226` there are 3: `2 2 6` (BBF), `22 6` (VF) and `2 26` (BZ). A `0` can only be a part of `10` or `20`, so `06` or a lonely `0` cannot be decoded. Print the count modulo 1 000 000 007; if the string cannot be decoded at all, it is 0.',
        'Let `ways(i)` be the number of ways to decode the first `i` digits, with `ways(0) = 1`. The last letter is made of the last **one** digit (allowed if it is not `0`) or the last **two** digits (allowed if they form a number from 10 to 26), and what comes before is any decoding of the shorter prefix: **`ways(i) = (ways(i - 1) if s[i] != 0) + (ways(i - 2) if the two digits are 10..26)`**. The first term and the second term are different decodings, so they are added.',
        { code: 'two, one = 1, (1 if s[0] != "0" else 0)         # ways(0) and ways(1)\nfor i in range(1, len(s)):\n    cur = 0\n    if s[i] != "0":\n        cur += one                                  # the last digit is a letter alone\n    if 10 <= int(s[i - 1:i + 1]) <= 26:\n        cur += two                                  # the last two digits are one letter\n    two, one = one, cur % MOD\nprint(one % MOD)' },
        'It is the stairs recurrence with conditions: a step of size 1 or 2 is allowed only if the digits make a valid letter. Only the last two values are needed, so the memory is O(1) and the time O(n). If neither condition holds, `cur` is 0 and every longer prefix is 0 as well.'
      ]
    },
    statement: ['A string `s` of digits is given. Each letter `A` to `Z` is written as the number 1 to 26 (without leading zeros), and the numbers of a message are written one after another. Print the number of messages that give the string `s`, modulo 1000000007 (0 if there is none).'],
    outputFormat: ['Print the number of messages modulo 1000000007.'],
    examples: [{ input: '226\n', note: 'BBF, VF and BZ: 3.' }, { input: '06\n', note: 'A message cannot start with 0: 0.' }],
    hints: ['Let ways(i) be the number of decodings of the first i digits; ways(0) = 1.', 'The last digit alone is a letter if it is not 0; the last two digits are a letter if they form 10..26.', 'Add the two cases and keep only the last two values.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        two, one = 1, (1 if s[0] != "0" else 0)
        for i in range(1, len(s)):
            cur = 0
            if s[i] != "0":
                cur += one
            pair = (ord(s[i - 1]) - 48) * 10 + ord(s[i]) - 48
            if 10 <= pair <= 26:
                cur += two
            two, one = one, cur % MOD
        print(one % MOD)`,
      cpp: r`
        const long long MOD = 1000000007;
        long long two = 1, one = (s[0] != '0') ? 1 : 0;
        for (size_t i = 1; i < s.size(); i++) {
            long long cur = 0;
            if (s[i] != '0') cur += one;
            int pair = (s[i - 1] - '0') * 10 + (s[i] - '0');
            if (pair >= 10 && pair <= 26) cur += two;
            two = one;
            one = cur % MOD;
        }
        cout << one % MOD << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        long two = 1, one = (s.charAt(0) != '0') ? 1 : 0;
        for (int i = 1; i < s.length(); i++) {
            long cur = 0;
            if (s.charAt(i) != '0') cur += one;
            int pair = (s.charAt(i - 1) - '0') * 10 + (s.charAt(i) - '0');
            if (pair >= 10 && pair <= 26) cur += two;
            two = one;
            one = cur % MOD;
        }
        System.out.println(one % MOD);`
    },
    solution: { explanation: ['ways(i) = (ways(i - 1) if the last digit is not 0) + (ways(i - 2) if the last two digits form a number from 10 to 26), with ways(0) = 1, computed with two variables and a remainder at each step.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const s = rows(input)[0]; const n = s.length; const memo = new Array(n + 1).fill(-1); // from the end: ways to decode the suffix starting at i
      const w = new Array(n + 2).fill(0); w[n] = 1; for (let i = n - 1; i >= 0; i--) { let v = 0; if (s[i] !== '0') { v += w[i + 1]; if (i + 1 < n && Number(s.slice(i, i + 2)) <= 26) v += w[i + 2]; } w[i] = v % MOD; } return String(w[0]);
    },
    tests() {
      const g = rng(2051); const out = ['226\n', '06\n', '12\n', '10\n', '0\n', '27\n', '100\n'];
      const brute = (input) => { const s = rows(input)[0]; const go = (i) => { if (i === s.length) return 1; if (s[i] === '0') return 0; let v = go(i + 1); if (i + 1 < s.length && Number(s.slice(i, i + 2)) <= 26) v += go(i + 2); return v; }; return String(go(0) % MOD); };
      crossCheck(() => many(randInt(g, 1, 12), () => '0123456789'[randInt(g, 0, 9)]).join('') + '\n', (i) => this.solve(i), brute, 500);
      const digits = (n, al) => many(n, () => al[randInt(g, 0, al.length - 1)]).join('');
      const first = (n, al) => { const s = digits(n, al); return s[0] === '0' ? '1' + s.slice(1) : s; };
      for (const [n, al] of [[20, '12'], [100, '123456'], [1000, '0123456789'], [100000, '12'], [100000, '123456'], [100000, '1'], [100000, '2'], [100000, '0123456789'], [100000, '12345678'], [99999, '1213']]) out.push(first(n, al) + '\n');
      out.push('1'.repeat(100000) + '\n', '26'.repeat(50000) + '\n', '10'.repeat(50000) + '\n', '27'.repeat(50000) + '\n', '1' + '0'.repeat(99999) + '\n');
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the text `s`.', 'The second line has `n`: the number of dictionary words.', 'The third line has the `n` different dictionary words.'],
    constraints: ['1 <= length of s <= 3000', '1 <= n <= 1000', '1 <= length of each word <= 20', 'All strings consist of lowercase English letters.'],
    slug: 'count-word-breaks',
    title: 'Cut the Text Into Dictionary Words in How Many Ways?',
    tags: ['dp', 'string', 'dictionary', 'counting'],
    concept: {
      title: 'Count the ways to cut each prefix of the text; a cut is a word that ends at the prefix',
      body: [
        'A text without spaces and a dictionary of words are given. In how many ways can the text be cut into pieces so that **every piece is a word of the dictionary** (a word may be used many times)? For the text `catsanddog` and the words `cat cats and sand dog` there are 2 ways: `cats and dog` and `cat sand dog`. Print the count modulo 1 000 000 007; 0 means that the text cannot be cut at all.',
        'Let `ways(i)` be the number of ways to cut the first `i` letters of the text, with `ways(0) = 1`. The last piece ends at the position `i` and starts at some position `j < i`; it must be a dictionary word, and the part before it is any cutting of the first `j` letters. Instead of asking "is `s[j:i]` a word" for every `j`, run it **forward**: from each position `i` with `ways(i) > 0` try every length `L` from 1 up to the **longest word**, and if `s[i:i+L]` is a word, add `ways(i)` to `ways(i + L)`.',
        { code: 'words = set(dictionary)\nlongest = max(len(w) for w in dictionary)\nways = [0] * (n + 1)\nways[0] = 1\nfor i in range(n):\n    if ways[i]:\n        for L in range(1, longest + 1):\n            if i + L <= n and s[i:i + L] in words:\n                ways[i + L] = (ways[i + L] + ways[i]) % MOD\nprint(ways[n])' },
        'Trying only lengths up to the longest word, and testing a piece with a *hash set* in O(1), gives about `n * 20` lookups instead of `n * (number of words)`. The state is "how many letters are cut so far", and every state tries a few transitions. The time is O(n * longest word) lookups (plus the cost of building each piece), the memory O(n).'
      ]
    },
    statement: ['A text `s` and a dictionary of `n` different words are given. Count the ways to cut `s` into pieces so that each piece is a dictionary word (words can be reused). Two ways are different if the cut positions are different. Print the count modulo 1000000007.'],
    outputFormat: ['Print the number of ways modulo 1000000007.'],
    examples: [{ input: 'catsanddog\n5\ncat cats and sand dog\n', note: 'cats | and | dog and cat | sand | dog: 2.' }, { input: 'abc\n1\nabcd\n', note: 'No piece fits: 0.' }],
    hints: ['Let ways(i) be the number of ways to cut the first i letters; ways(0) = 1.', 'From every i with ways(i) > 0 try the pieces s[i:i+L] for L up to the longest word.', 'Keep the words in a hash set.'],
    program: {
      io: ['s:word', 'n:int', 'words:word[n]'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        dictionary = set(words)
        longest = max(len(w) for w in words)
        m = len(s)
        ways = [0] * (m + 1)
        ways[0] = 1
        for i in range(m):
            if ways[i]:
                for L in range(1, longest + 1):
                    if i + L > m:
                        break
                    if s[i:i + L] in dictionary:
                        ways[i + L] = (ways[i + L] + ways[i]) % MOD
        print(ways[m])`,
      cpp: r`
        const long long MOD = 1000000007;
        set<string> dictionary(words.begin(), words.end());
        size_t longest = 0;
        for (const string& w : words) longest = max(longest, w.size());
        int m = (int)s.size();
        vector<long long> ways(m + 1, 0);
        ways[0] = 1;
        for (int i = 0; i < m; i++) {
            if (ways[i] == 0) continue;
            for (size_t L = 1; L <= longest && i + L <= (size_t)m; L++) {
                if (dictionary.count(s.substr(i, L))) ways[i + L] = (ways[i + L] + ways[i]) % MOD;
            }
        }
        cout << ways[m] << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        HashSet<String> dictionary = new HashSet<>();
        int longest = 0;
        for (int k = 0; k < n; k++) {
            dictionary.add(words[k]);
            longest = Math.max(longest, words[k].length());
        }
        int m = s.length();
        long[] ways = new long[m + 1];
        ways[0] = 1;
        for (int i = 0; i < m; i++) {
            if (ways[i] == 0) continue;
            for (int L = 1; L <= longest && i + L <= m; L++) {
                if (dictionary.contains(s.substring(i, i + L))) ways[i + L] = (ways[i + L] + ways[i]) % MOD;
            }
        }
        System.out.println(ways[m]);`,
      includes: ['<set>', '<algorithm>']
    },
    solution: { explanation: ['ways(i) is the number of ways to cut the first i letters; from every position with a positive count, each piece s[i:i+L] with L up to the longest word that is in the dictionary adds ways(i) to ways(i + L). The answer is ways(|s|).'], complexity: 'Time O(|s| * longest word) hash lookups, space O(|s| + dictionary).' },
    solve(input) {
      const rs = rows(input); const s = rs[0]; const words = rs[2].split(' '); const m = s.length; // backwards: ways to cut the suffix that starts at i, trying every word that fits
      const w = new Array(m + 1).fill(0); w[m] = 1; for (let i = m - 1; i >= 0; i--) { let v = 0; for (const word of words) if (s.startsWith(word, i)) v += w[i + word.length]; w[i] = v % MOD; } return String(w[0]);
    },
    tests() {
      const g = rng(2052); const out = ['catsanddog\n5\ncat cats and sand dog\n', 'abc\n1\nabcd\n', 'a\n1\na\n', 'aaa\n2\na aa\n'];
      const dict = (n, maxLen, al) => { const set = new Set(); let guard = 0; while (set.size < n && guard++ < 100000) set.add(randWord(g, randInt(g, 1, maxLen), al)); return [...set]; };
      const make = (s, words) => lines(s, String(words.length), words.join(' '));
      const brute = (input) => { const rs = rows(input); const s = rs[0]; const words = rs[2].split(' '); const go = (i) => { if (i === s.length) return 1; let v = 0; for (const w of words) if (s.startsWith(w, i)) v += go(i + w.length); return v; }; return String(go(0) % MOD); };
      crossCheck(() => { const words = dict(randInt(g, 1, 4), 3, 'ab'); return make(randWord(g, randInt(g, 1, 10), 'ab'), words); }, (i) => this.solve(i), brute, 400);
      for (const [n, len, wn, wl, al] of [[20, 20, 5, 3, 'ab'], [100, 100, 20, 4, 'ab'], [500, 1000, 100, 5, 'ab'], [3000, 3000, 1000, 8, 'ab'], [3000, 3000, 1000, 20, 'abc'], [3000, 3000, 300, 3, 'ab'], [3000, 3000, 26, 1, 'abcdefghijklmnopqrstuvwxyz'], [2999, 3000, 800, 6, 'abc']]) out.push(make(randWord(g, n, al), dict(wn, wl, al)));
      out.push(make('a'.repeat(3000), ['a', 'aa', 'aaa', 'aaaa', 'aaaaa']), make('a'.repeat(3000), ['a']), make('a'.repeat(2999) + 'b', ['a', 'aa', 'aaa']), make('ab'.repeat(1500), ['a', 'b', 'ab', 'ba', 'aba', 'bab']), make('a'.repeat(3000), many(20, (i) => 'a'.repeat(i + 1))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the text `t` (lowercase letters).', 'The second line has the pattern `p` (lowercase letters, `?` and `*`).'],
    constraints: ['1 <= length of t <= 1000', '1 <= length of p <= 1000'],
    slug: 'wildcard-pattern-match',
    title: 'Does the Pattern With Wildcards Match the Text?',
    tags: ['dp', 'string', 'pattern-matching', 'wildcard'],
    concept: {
      title: 'A table over the prefixes of the text and of the pattern: a star can eat nothing or one more letter',
      body: [
        'A pattern may contain ordinary letters, the character `?` (matches **any one** letter) and the character `*` (matches **any sequence of letters, also an empty one**). The pattern must match the **whole** text. For the text `adceb` and the pattern `*a*b` the answer is yes (`*` = empty, `a`, `*` = `dce`, `b`). For `acdcb` and `a*c?b` it is no.',
        'Let `ok(i, j)` be true if the first `i` letters of the text match the first `j` characters of the pattern. The empty text matches the empty pattern, and also a pattern made only of stars. Look at the last pattern character `p[j]`. If it is a **letter or `?`**, it must match exactly one text letter `t[i]` (equal, or any for `?`): `ok(i, j) = ok(i - 1, j - 1)`. If it is a **`*`**, it either matches nothing, `ok(i, j - 1)`, or it eats one more letter of the text and may continue to be used, `ok(i - 1, j)`: **`ok(i, j) = ok(i, j - 1) or ok(i - 1, j)`**.',
        { code: 'prev = [True] + [False] * m                     # i = 0: the empty text\nfor j in range(1, m + 1):\n    prev[j] = prev[j - 1] and p[j - 1] == "*"\nfor i in range(1, n + 1):\n    cur = [False] * (m + 1)\n    for j in range(1, m + 1):\n        c = p[j - 1]\n        if c == "*":\n            cur[j] = cur[j - 1] or prev[j]\n        elif c == "?" or c == t[i - 1]:\n            cur[j] = prev[j - 1]\n    prev = cur\nprint("yes" if prev[m] else "no")' },
        'The two cases of the star are the whole difficulty. A greedy search that tries to guess how much the star should eat can take exponential time in the worst case; the table is O(n * m) = one million steps and, with two rows, O(m) memory.'
      ]
    },
    statement: ['A text `t` and a pattern `p` are given. In the pattern, `?` matches any single letter and `*` matches any sequence of letters (possibly empty); every other character matches itself. Print `yes` if the pattern matches the whole text, otherwise `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: 'adceb\n*a*b\n', note: 'The first star is empty, the second star is dce: yes.' }, { input: 'acdcb\na*c?b\n', note: 'After a*c there must be exactly one letter before b, but there are two options that fail: no.' }],
    hints: ['Let ok(i, j) be true if the first i letters of the text match the first j characters of the pattern.', 'A letter or ? needs ok(i - 1, j - 1) and a matching letter.', 'A star gives ok(i, j - 1) (empty) or ok(i - 1, j) (eats one more letter).'],
    program: {
      io: ['t:word', 'p:word'],
      fast: true,
      python: r`
        n = len(t)
        m = len(p)
        prev = [True] + [False] * m
        for j in range(1, m + 1):
            prev[j] = prev[j - 1] and p[j - 1] == "*"
        for i in range(1, n + 1):
            cur = [False] * (m + 1)
            ti = t[i - 1]
            for j in range(1, m + 1):
                c = p[j - 1]
                if c == "*":
                    cur[j] = cur[j - 1] or prev[j]
                elif c == "?" or c == ti:
                    cur[j] = prev[j - 1]
            prev = cur
        print("yes" if prev[m] else "no")`,
      cpp: r`
        int n = (int)t.size(), m = (int)p.size();
        vector<char> prev(m + 1, 0), cur(m + 1, 0);
        prev[0] = 1;
        for (int j = 1; j <= m; j++) prev[j] = prev[j - 1] && p[j - 1] == '*';
        for (int i = 1; i <= n; i++) {
            cur[0] = 0;
            for (int j = 1; j <= m; j++) {
                char c = p[j - 1];
                if (c == '*') cur[j] = cur[j - 1] || prev[j];
                else if (c == '?' || c == t[i - 1]) cur[j] = prev[j - 1];
                else cur[j] = 0;
            }
            swap(prev, cur);
        }
        cout << (prev[m] ? "yes" : "no") << "\n";`,
      java: r`
        int n = t.length(), m = p.length();
        boolean[] prev = new boolean[m + 1];
        boolean[] cur = new boolean[m + 1];
        prev[0] = true;
        for (int j = 1; j <= m; j++) prev[j] = prev[j - 1] && p.charAt(j - 1) == '*';
        for (int i = 1; i <= n; i++) {
            cur[0] = false;
            for (int j = 1; j <= m; j++) {
                char c = p.charAt(j - 1);
                if (c == '*') cur[j] = cur[j - 1] || prev[j];
                else if (c == '?' || c == t.charAt(i - 1)) cur[j] = prev[j - 1];
                else cur[j] = false;
            }
            boolean[] swap = prev;
            prev = cur;
            cur = swap;
        }
        System.out.println(prev[m] ? "yes" : "no");`
    },
    solution: { explanation: ['ok(i, j) tells whether the first i letters of the text match the first j characters of the pattern: a letter or ? needs ok(i - 1, j - 1) and a matching letter, a star gives ok(i, j - 1) or ok(i - 1, j). Two rows are kept; the answer is ok(n, m).'], complexity: 'Time O(n * m), space O(m).' },
    solve(input) {
      const [t, p] = rows(input); const memo = new Map(); // a recursive search with memory over (text position, pattern position)
      const go = (i, j) => { const key = i * 2000 + j; if (memo.has(key)) return memo.get(key); let res; if (j === p.length) res = i === t.length; else if (p[j] === '*') res = go(i, j + 1) || (i < t.length && go(i + 1, j)); else res = i < t.length && (p[j] === '?' || p[j] === t[i]) && go(i + 1, j + 1); memo.set(key, res); return res; };
      if (t.length * p.length > 40000) { // large: the iterative table (recursion could be too deep)
        const n = t.length, m = p.length; let prev = new Array(m + 1).fill(false); prev[0] = true; for (let j = 1; j <= m; j++) prev[j] = prev[j - 1] && p[j - 1] === '*'; for (let i = 1; i <= n; i++) { const cur = new Array(m + 1).fill(false); for (let j = 1; j <= m; j++) { if (p[j - 1] === '*') cur[j] = cur[j - 1] || prev[j]; else if (p[j - 1] === '?' || p[j - 1] === t[i - 1]) cur[j] = prev[j - 1]; } prev = cur; } return prev[m] ? 'yes' : 'no'; }
      return go(0, 0) ? 'yes' : 'no';
    },
    tests() {
      const g = rng(2053); const out = ['adceb\n*a*b\n', 'acdcb\na*c?b\n', 'a\n*\n', 'a\n?\n', 'ab\n?\n', 'abc\nabc\n', 'abc\nabd\n'];
      const brute = (input) => { const [t, p] = rows(input); let re = '^'; for (const c of p) re += c === '*' ? '.*' : c === '?' ? '.' : c; re += '$'; return new RegExp(re).test(t) ? 'yes' : 'no'; };
      const pat = (len, pStar, pQ, al) => many(len, () => { const x = g(); return x < pStar ? '*' : x < pStar + pQ ? '?' : al[randInt(g, 0, al.length - 1)]; }).join('');
      crossCheck(() => lines(randWord(g, randInt(g, 1, 10), 'ab'), pat(randInt(g, 1, 8), 0.25, 0.2, 'ab')), (i) => this.solve(i), brute, 600);
      for (const [n, m, ps, pq, al] of [[20, 10, 0.2, 0.2, 'ab'], [100, 50, 0.1, 0.1, 'ab'], [500, 100, 0.05, 0.1, 'ab'], [1000, 1000, 0.01, 0.01, 'ab'], [1000, 300, 0.02, 0.05, 'abc'], [1000, 1000, 0.5, 0, 'a'], [1000, 1000, 0, 0.5, 'ab'], [1000, 500, 0.2, 0.2, 'abcdefghijklmnopqrstuvwxyz']]) out.push(lines(randWord(g, n, al), pat(m, ps, pq, al)));
      out.push(lines('a'.repeat(1000), '*'.repeat(1000)), lines('a'.repeat(1000), '?'.repeat(1000)), lines('a'.repeat(1000), '?'.repeat(999)), lines('a'.repeat(1000), '*a*a*a*a*b'), lines('ab'.repeat(500), '*' + 'ab'.repeat(250) + '*'), lines('a'.repeat(999) + 'b', '*'.repeat(500) + 'a*b'), lines('abc'.repeat(333), '*c*'.repeat(100)));
      // texts that match by construction: replace some letters of the text with ? and cut pieces to *
      for (let k = 0; k < 3; k++) { const t = randWord(g, 1000, 'abc'); let p = ''; let i = 0; while (i < t.length) { const x = g(); if (x < 0.02) { const len = randInt(g, 1, 20); p += '*'; i += len; } else if (x < 0.1) { p += '?'; i++; } else { p += t[i]; i++; } } out.push(lines(t, p.slice(0, 1000))); }
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the word `a`.', 'The second line has the word `b`.', 'The third line has the word `c`.'],
    constraints: ['1 <= length of a, length of b <= 1000', '1 <= length of c <= 2000', 'All words consist of lowercase English letters.'],
    slug: 'interleaved-words',
    title: 'Is the Third Word a Shuffle of the Other Two?',
    tags: ['dp', 'string', 'interleaving', 'two-pointers'],
    concept: {
      title: 'A table over how many letters were taken from each of the two words',
      body: [
        'The word `c` is an **interleaving** of the words `a` and `b` if it can be obtained by taking all the letters of `a` and all the letters of `b` and **merging** them, so that the letters of each word keep their order. For `a = aabcc`, `b = dbbca` and `c = aadbbcbcac` the answer is yes; for `c = aadbbbaccc` it is no.',
        'Build `c` from left to right. After `i + j` letters of `c`, we have used the first `i` letters of `a` and the first `j` letters of `b` (the number of letters used from `b` follows from `i`). Let `ok(i, j)` be true if the first `i + j` letters of `c` can be made from the first `i` letters of `a` and the first `j` letters of `b`. The last letter of that prefix of `c` came either from `a` (it must equal `a[i]` and `ok(i - 1, j)` must hold) or from `b`: **`ok(i, j) = (ok(i - 1, j) and a[i] = c[i + j]) or (ok(i, j - 1) and b[j] = c[i + j])`**, with `ok(0, 0)` true. If the lengths do not fit (`|a| + |b| != |c|`), the answer is no at once.',
        { code: 'if len(a) + len(b) != len(c):\n    print("no")\nelse:\n    ok = [False] * (len(b) + 1)\n    ok[0] = True\n    for j in range(1, len(b) + 1):\n        ok[j] = ok[j - 1] and b[j - 1] == c[j - 1]\n    for i in range(1, len(a) + 1):\n        ok[0] = ok[0] and a[i - 1] == c[i - 1]\n        for j in range(1, len(b) + 1):\n            ok[j] = (ok[j] and a[i - 1] == c[i + j - 1]) or (ok[j - 1] and b[j - 1] == c[i + j - 1])\n    print("yes" if ok[len(b)] else "no")' },
        'The 2D table collapses to **one row**: `ok[j]` before the update is `ok(i - 1, j)` (from `a`), `ok[j - 1]` after the update is `ok(i, j - 1)` (from `b`). This is a path counting problem in disguise: a way to interleave is a monotone path from the corner `(0, 0)` to `(|a|, |b|)` in the grid, where each step uses the next letter of `a` (down) or of `b` (right). The time is O(|a| * |b|), at most a million steps.'
      ]
    },
    statement: ['Three words `a`, `b` and `c` are given. Print `yes` if `c` can be obtained by merging all the letters of `a` and all the letters of `b` (each word keeps the order of its letters), otherwise print `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: 'aabcc\ndbbca\naadbbcbcac\n', note: 'Take a a (from a), d b b (from b), c (a), b c (b), a... a valid merge exists: yes.' }, { input: 'aabcc\ndbbca\naadbbbaccc\n', note: 'No merge gives this word: no.' }],
    hints: ['Let ok(i, j) say whether the first i + j letters of c can be made from the first i letters of a and the first j letters of b.', 'The last letter came from a or from b; check that it matches and that the shorter prefix is ok.', 'If the lengths do not add up, the answer is no.'],
    program: {
      io: ['a:word', 'b:word', 'c:word'],
      fast: true,
      python: r`
        n = len(a)
        m = len(b)
        if n + m != len(c):
            print("no")
        else:
            ok = [False] * (m + 1)
            ok[0] = True
            for j in range(1, m + 1):
                ok[j] = ok[j - 1] and b[j - 1] == c[j - 1]
            for i in range(1, n + 1):
                ok[0] = ok[0] and a[i - 1] == c[i - 1]
                ai = a[i - 1]
                for j in range(1, m + 1):
                    ch = c[i + j - 1]
                    ok[j] = (ok[j] and ai == ch) or (ok[j - 1] and b[j - 1] == ch)
            print("yes" if ok[m] else "no")`,
      cpp: r`
        int n = (int)a.size(), m = (int)b.size();
        if (n + m != (int)c.size()) {
            cout << "no\n";
        } else {
            vector<char> ok(m + 1, 0);
            ok[0] = 1;
            for (int j = 1; j <= m; j++) ok[j] = ok[j - 1] && b[j - 1] == c[j - 1];
            for (int i = 1; i <= n; i++) {
                ok[0] = ok[0] && a[i - 1] == c[i - 1];
                for (int j = 1; j <= m; j++) {
                    char ch = c[i + j - 1];
                    ok[j] = (ok[j] && a[i - 1] == ch) || (ok[j - 1] && b[j - 1] == ch);
                }
            }
            cout << (ok[m] ? "yes" : "no") << "\n";
        }`,
      java: r`
        int n = a.length(), m = b.length();
        if (n + m != c.length()) {
            System.out.println("no");
        } else {
            boolean[] ok = new boolean[m + 1];
            ok[0] = true;
            for (int j = 1; j <= m; j++) ok[j] = ok[j - 1] && b.charAt(j - 1) == c.charAt(j - 1);
            for (int i = 1; i <= n; i++) {
                ok[0] = ok[0] && a.charAt(i - 1) == c.charAt(i - 1);
                for (int j = 1; j <= m; j++) {
                    char ch = c.charAt(i + j - 1);
                    ok[j] = (ok[j] && a.charAt(i - 1) == ch) || (ok[j - 1] && b.charAt(j - 1) == ch);
                }
            }
            System.out.println(ok[m] ? "yes" : "no");
        }`
    },
    solution: { explanation: ['ok(i, j) tells whether the first i + j letters of c can be built from the first i letters of a and the first j letters of b: the last letter came from a (it must match and ok(i - 1, j) must hold) or from b (it must match and ok(i, j - 1) must hold). One row is kept; the answer is ok(|a|, |b|).'], complexity: 'Time O(|a| * |b|), space O(|b|).' },
    solve(input) {
      const [a, b, c] = rows(input); if (a.length + b.length !== c.length) return 'no'; // the set of reachable (i, j) states, layer by layer along c
      let states = new Set([0]); const W = b.length + 1; for (let k = 0; k < c.length; k++) { const next = new Set(); for (const st of states) { const i = Math.floor(st / W), j = st % W; if (i < a.length && a[i] === c[k]) next.add((i + 1) * W + j); if (j < b.length && b[j] === c[k]) next.add(i * W + j + 1); } states = next; if (!states.size) return 'no'; } return states.has(a.length * W + b.length) ? 'yes' : 'no';
    },
    tests() {
      const g = rng(2054); const out = ['aabcc\ndbbca\naadbbcbcac\n', 'aabcc\ndbbca\naadbbbaccc\n', 'a\nb\nab\n', 'a\nb\nba\n', 'a\nb\naa\n', 'ab\nab\naabb\n', 'ab\nab\nabab\n'];
      const brute = (input) => { const [a, b, c] = rows(input); const memo = new Map(); const go = (i, j) => { if (i + j === c.length) return i === a.length && j === b.length; const key = i * 5000 + j; if (memo.has(key)) return memo.get(key); const r0 = (i < a.length && a[i] === c[i + j] && go(i + 1, j)) || (j < b.length && b[j] === c[i + j] && go(i, j + 1)); memo.set(key, r0); return r0; }; return go(0, 0) ? 'yes' : 'no'; };
      const merge = (a, b) => { let i = 0, j = 0, s = ''; while (i < a.length || j < b.length) { if (j >= b.length || (i < a.length && g() < 0.5)) s += a[i++]; else s += b[j++]; } return s; };
      const spoil = (c) => { const k = randInt(g, 0, c.length - 1); const alt = c[k] === 'a' ? 'b' : 'a'; return c.slice(0, k) + alt + c.slice(k + 1); };
      crossCheck(() => { const a = randWord(g, randInt(g, 1, 6), 'ab'), b = randWord(g, randInt(g, 1, 6), 'ab'); const c = g() < 0.5 ? merge(a, b) : randWord(g, a.length + b.length, 'ab'); return lines(a, b, c); }, (i) => this.solve(i), brute, 600);
      for (const [n, m, al, ok] of [[20, 20, 'ab', true], [100, 100, 'ab', true], [100, 100, 'ab', false], [500, 500, 'abc', true], [1000, 1000, 'ab', true], [1000, 1000, 'ab', false], [1000, 1000, 'a', true], [1000, 1000, 'abcdefghijklmnopqrstuvwxyz', true], [1, 1000, 'ab', true], [1000, 1, 'ab', true]]) { const a = randWord(g, n, al), b = randWord(g, m, al); let c = merge(a, b); if (!ok) c = c.split('').reverse().join(''); out.push(lines(a, b, c)); }
      out.push(lines('a'.repeat(1000), 'a'.repeat(1000), 'a'.repeat(2000)), lines('a'.repeat(1000), 'a'.repeat(1000), 'a'.repeat(1999) + 'b'), lines('ab'.repeat(500), 'ba'.repeat(500), 'ab'.repeat(500) + 'ba'.repeat(500)), lines('a'.repeat(1000), 'b'.repeat(1000), 'a'.repeat(500) + 'b'.repeat(1000) + 'a'.repeat(500)), lines('a'.repeat(1000), 'b'.repeat(1000), 'b'.repeat(1000) + 'a'.repeat(1000)), lines('a'.repeat(1000), 'b'.repeat(1000), 'ab'.repeat(1000)));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 1500', 'The word consists of lowercase English letters.'],
    slug: 'fewest-palindrome-cuts',
    title: 'The Fewest Cuts That Leave Only Palindromes',
    tags: ['dp', 'string', 'palindrome', 'partition'],
    concept: {
      title: 'Two tables: which pieces are palindromes, and the fewest cuts for every prefix',
      body: [
        'Cut a word into pieces so that **every piece is a palindrome** (reads the same in both directions). What is the smallest number of cuts? For `aab` the answer is 1 (`aa | b`), for `abc` it is 2 (`a | b | c`), and for a word that is a palindrome itself it is 0. A word of single letters is always possible: every letter is a palindrome, so there are at most `n - 1` cuts.',
        'First find **which pieces are palindromes**: `pal(l, r)` is true if `s[l..r]` reads the same backwards. Expand around every centre: starting from a single letter (odd length) or a pair of equal neighbours (even length), widen the piece by one letter on each side as long as the two new end letters are equal. Then let `cuts(j)` be the smallest number of cuts for the prefix ending at `j`. If the whole prefix is a palindrome, `cuts(j) = 0`; otherwise the last piece is `s[i..j]` for some `i >= 1` with `pal(i, j)`, and before it we need `cuts(i - 1)` cuts plus the cut in front of the piece: **`cuts(j) = min over i with pal(i, j) of cuts(i - 1) + 1`**.',
        { code: 'pal = [bytearray(n) for _ in range(n)]\nfor c in range(n):\n    for l, r in ((c, c), (c, c + 1)):          # odd and even centres\n        while l >= 0 and r < n and s[l] == s[r]:\n            pal[l][r] = 1\n            l -= 1; r += 1\ncuts = [0] * n\nfor j in range(n):\n    if pal[0][j]: cuts[j] = 0\n    else: cuts[j] = min(cuts[i - 1] + 1 for i in range(1, j + 1) if pal[i][j])\nprint(cuts[n - 1])' },
        'There are O(n^2) palindromic pieces and the second table looks at each once, so the whole solution is O(n^2) time and memory (about 2 million cells at the limit). Splitting a problem into "precompute a yes/no table" and "optimise over the allowed pieces" is the common shape of partition problems.'
      ]
    },
    statement: ['A word `s` is given. Cut it (between letters) into pieces so that each piece is a palindrome. Print the smallest possible number of cuts.'],
    outputFormat: ['Print the smallest number of cuts.'],
    examples: [{ input: 'aab\n', note: 'aa | b: 1 cut.' }, { input: 'abc\n', note: 'a | b | c: 2 cuts.' }],
    hints: ['First mark all palindromic pieces by expanding around every centre.', 'Let cuts(j) be the answer for the prefix ending at j: 0 if it is a palindrome, otherwise the best over the last palindromic piece s[i..j].', 'Remember the extra cut in front of the last piece.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        n = len(s)
        pal = [bytearray(n) for _ in range(n)]
        for c in range(n):
            l = r = c
            while l >= 0 and r < n and s[l] == s[r]:
                pal[l][r] = 1
                l -= 1
                r += 1
            l, r = c, c + 1
            while l >= 0 and r < n and s[l] == s[r]:
                pal[l][r] = 1
                l -= 1
                r += 1
        cuts = [0] * n
        for j in range(n):
            if pal[0][j]:
                cuts[j] = 0
            else:
                best = j
                for i in range(1, j + 1):
                    if pal[i][j] and cuts[i - 1] + 1 < best:
                        best = cuts[i - 1] + 1
                cuts[j] = best
        print(cuts[n - 1])`,
      cpp: r`
        int n = (int)s.size();
        vector<vector<char>> pal(n, vector<char>(n, 0));
        for (int c = 0; c < n; c++) {
            int l = c, r = c;
            while (l >= 0 && r < n && s[l] == s[r]) { pal[l][r] = 1; l--; r++; }
            l = c; r = c + 1;
            while (l >= 0 && r < n && s[l] == s[r]) { pal[l][r] = 1; l--; r++; }
        }
        vector<int> cuts(n, 0);
        for (int j = 0; j < n; j++) {
            if (pal[0][j]) { cuts[j] = 0; continue; }
            int best = j;
            for (int i = 1; i <= j; i++) {
                if (pal[i][j] && cuts[i - 1] + 1 < best) best = cuts[i - 1] + 1;
            }
            cuts[j] = best;
        }
        cout << cuts[n - 1] << "\n";`,
      java: r`
        int n = s.length();
        boolean[][] pal = new boolean[n][n];
        for (int c = 0; c < n; c++) {
            int l = c, r = c;
            while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) { pal[l][r] = true; l--; r++; }
            l = c; r = c + 1;
            while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) { pal[l][r] = true; l--; r++; }
        }
        int[] cuts = new int[n];
        for (int j = 0; j < n; j++) {
            if (pal[0][j]) { cuts[j] = 0; continue; }
            int best = j;
            for (int i = 1; i <= j; i++) {
                if (pal[i][j] && cuts[i - 1] + 1 < best) best = cuts[i - 1] + 1;
            }
            cuts[j] = best;
        }
        System.out.println(cuts[n - 1]);`
    },
    solution: { explanation: ['All palindromic pieces are marked by expanding around every centre; cuts(j), the fewest cuts for the prefix ending at j, is 0 if the prefix is a palindrome and otherwise the smallest cuts(i - 1) + 1 over the palindromic pieces s[i..j]. The answer is cuts(n - 1).'], complexity: 'Time O(n^2), space O(n^2).' },
    solve(input) {
      const s = rows(input)[0]; const n = s.length; // pieces tested directly with a string comparison, and the cuts counted by a forward search over end positions
      const isPal = (l, r) => { while (l < r) { if (s[l] !== s[r]) return false; l++; r--; } return true; };
      if (n <= 400) { const best = new Array(n + 1).fill(Infinity); best[0] = 0; for (let i = 0; i < n; i++) for (let j = i; j < n; j++) if (isPal(i, j)) best[j + 1] = Math.min(best[j + 1], best[i] + 1); return String(best[n] - 1); }
      const pal = Array.from({ length: n }, () => new Uint8Array(n)); for (let len = 1; len <= n; len++) for (let i = 0; i + len <= n; i++) { const j = i + len - 1; if (s[i] === s[j] && (len <= 2 || pal[i + 1][j - 1])) pal[i][j] = 1; } const best = new Array(n + 1).fill(Infinity); best[0] = 0; for (let j = 1; j <= n; j++) for (let i = 0; i < j; i++) if (pal[i][j - 1] && best[i] + 1 < best[j]) best[j] = best[i] + 1; return String(best[n] - 1);
    },
    tests() {
      const g = rng(2055); const out = ['aab\n', 'abc\n', 'a\n', 'aa\n', 'abba\n', 'abcba\n'];
      const brute = (input) => { const s = rows(input)[0]; const n = s.length; let best = n - 1; for (let mask = 0; mask < (1 << (n - 1)); mask++) { let start = 0, ok = true, cuts = 0; for (let i = 0; i < n; i++) { if (i === n - 1 || (mask >> i & 1)) { const piece = s.slice(start, i + 1); if (piece !== [...piece].reverse().join('')) { ok = false; break; } start = i + 1; if (i < n - 1) cuts++; } } if (ok) best = Math.min(best, cuts); } return String(best); };
      crossCheck(() => randWord(g, randInt(g, 1, 11), 'ab') + '\n', (i) => this.solve(i), brute, 400);
      for (const [n, al] of [[20, 'ab'], [100, 'abc'], [400, 'abcd'], [800, 'ab'], [1500, 'abcdefghijklmnopqrstuvwxyz'], [1500, 'ab'], [1500, 'abc'], [1499, 'a']]) out.push(randWord(g, n, al) + '\n');
      const half = randWord(g, 750, 'abcdefgh'); out.push('a'.repeat(1500) + '\n', 'ab'.repeat(750) + '\n', half + [...half].reverse().join('') + '\n', 'a'.repeat(700) + 'b' + 'a'.repeat(799) + '\n', 'abcdefghijklmnopqrstuvwxyz'.repeat(57) + '\n');
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with a string `s` of the characters `(` and `)`.'],
    constraints: ['1 <= length of s <= 100000'],
    slug: 'longest-balanced-bracket-run',
    title: 'The Longest Balanced Run of Brackets',
    tags: ['dp', 'string', 'brackets'],
    concept: {
      title: 'The longest balanced run ending at a closing bracket reaches back over the run before it',
      body: [
        'A string of `(` and `)` is *balanced* if every `(` is closed by a later `)` and the brackets are properly nested. Find the length of the **longest balanced run of consecutive characters** in the given string. For `(()` it is 2, for `)()())` it is 4, and for `()(())` it is 6.',
        'Let `run(i)` be the length of the longest balanced run that **ends at the position `i`** (0 if there is none). A balanced run can end only with `)`. Look at `s[i] = ")"`. If the previous character is `(`, they close each other and the run is those two plus the run that ended just before them: `run(i) = run(i - 2) + 2`. If the previous character is `)`, then the run ending at `i - 1` (of length `run(i - 1)`) is nested inside something: the character just before that run, at the position `j = i - run(i - 1) - 1`, must be a `(` to close at `i`. Then **`run(i) = run(i - 1) + 2 + run(j - 1)`**: the inside, the two brackets, and the balanced run that ended right before the `(`.',
        { code: 'run = [0] * n\nbest = 0\nfor i in range(1, n):\n    if s[i] == ")":\n        if s[i - 1] == "(":\n            run[i] = (run[i - 2] if i >= 2 else 0) + 2\n        else:\n            j = i - run[i - 1] - 1                 # the place before the run that ends at i - 1\n            if j >= 0 and s[j] == "(":\n                run[i] = run[i - 1] + 2 + (run[j - 1] if j >= 1 else 0)\n        best = max(best, run[i])\nprint(best)' },
        'The solution makes a single pass, with every `run(i)` computed from values at smaller positions: O(n) time and memory. A stack gives another O(n) solution; the DP shows how a balanced stretch is built from smaller balanced stretches.'
      ]
    },
    statement: ['A string of `(` and `)` characters is given. A string is balanced if every opening bracket has a closing bracket after it and the brackets are nested properly. Print the length of the longest balanced substring (consecutive characters).'],
    outputFormat: ['Print the length of the longest balanced substring.'],
    examples: [{ input: ')()())\n', note: 'The substring ()() has the length 4.' }, { input: '(()\n', note: 'The substring () has the length 2.' }],
    hints: ['Let run(i) be the longest balanced run that ends at the position i; it can only end with ).', 'If the previous character is (, then run(i) = run(i - 2) + 2.', 'Otherwise find the character before the run that ends at i - 1; if it is (, join everything.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        n = len(s)
        run = [0] * n
        best = 0
        for i in range(1, n):
            if s[i] == ")":
                if s[i - 1] == "(":
                    run[i] = (run[i - 2] if i >= 2 else 0) + 2
                else:
                    j = i - run[i - 1] - 1
                    if j >= 0 and s[j] == "(":
                        run[i] = run[i - 1] + 2 + (run[j - 1] if j >= 1 else 0)
                if run[i] > best:
                    best = run[i]
        print(best)`,
      cpp: r`
        int n = (int)s.size();
        vector<int> run(n, 0);
        int best = 0;
        for (int i = 1; i < n; i++) {
            if (s[i] == ')') {
                if (s[i - 1] == '(') {
                    run[i] = (i >= 2 ? run[i - 2] : 0) + 2;
                } else {
                    int j = i - run[i - 1] - 1;
                    if (j >= 0 && s[j] == '(') run[i] = run[i - 1] + 2 + (j >= 1 ? run[j - 1] : 0);
                }
                best = max(best, run[i]);
            }
        }
        cout << best << "\n";`,
      java: r`
        int n = s.length();
        int[] run = new int[n];
        int best = 0;
        for (int i = 1; i < n; i++) {
            if (s.charAt(i) == ')') {
                if (s.charAt(i - 1) == '(') {
                    run[i] = (i >= 2 ? run[i - 2] : 0) + 2;
                } else {
                    int j = i - run[i - 1] - 1;
                    if (j >= 0 && s.charAt(j) == '(') run[i] = run[i - 1] + 2 + (j >= 1 ? run[j - 1] : 0);
                }
                best = Math.max(best, run[i]);
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['run(i), the longest balanced run ending at the closing bracket at i, is run(i - 2) + 2 when the previous character is an opening bracket, and run(i - 1) + 2 + run(j - 1) when the character j = i - run(i - 1) - 1 before the run ending at i - 1 is an opening bracket; the answer is the largest run.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const s = rows(input)[0]; // a stack of the indexes of unmatched brackets: the longest run is the longest gap between them
      const st = [-1]; let best = 0; for (let i = 0; i < s.length; i++) { if (s[i] === '(') st.push(i); else { st.pop(); if (!st.length) st.push(i); else best = Math.max(best, i - st[st.length - 1]); } } return String(best);
    },
    tests() {
      const g = rng(2056); const out = [')()())\n', '(()\n', '()(())\n', '(\n', ')\n', '()\n', '))))((((\n'];
      const brute = (input) => { const s = rows(input)[0]; let best = 0; for (let i = 0; i < s.length; i++) { let bal = 0; for (let j = i; j < s.length; j++) { bal += s[j] === '(' ? 1 : -1; if (bal < 0) break; if (bal === 0) best = Math.max(best, j - i + 1); } } return String(best); };
      crossCheck(() => many(randInt(g, 1, 16), () => (g() < 0.5 ? '(' : ')')).join('') + '\n', (i) => this.solve(i), brute, 500);
      const rand = (n, p) => many(n, () => (g() < p ? '(' : ')')).join('');
      const balanced = (pairs) => { let s = ''; let open = 0, left = pairs; let total = pairs; while (left > 0 || open > 0) { if (left > 0 && (open === 0 || g() < 0.5)) { s += '('; open++; left--; } else { s += ')'; open--; } } return s; };
      for (const [n, p] of [[20, 0.5], [100, 0.5], [1000, 0.55], [100000, 0.5], [100000, 0.52], [100000, 0.48], [99999, 0.5]]) out.push(rand(n, p) + '\n');
      out.push(balanced(50000) + '\n', ')' + balanced(49999) + '(' + '\n', '('.repeat(50000) + ')'.repeat(50000) + '\n', '()'.repeat(50000) + '\n', ')'.repeat(50000) + '('.repeat(50000) + '\n', '(()'.repeat(33333) + '\n', balanced(20000) + ')' + balanced(20000) + '(' + balanced(10000) + '\n');
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the number `n`.'],
    constraints: ['1 <= n <= 200000'],
    slug: 'knight-phone-numbers',
    title: 'The Knight Dials Phone Numbers',
    tags: ['dp', 'counting', 'graph-dp', 'states'],
    concept: {
      title: 'A walk of n moves on a graph: count the walks that end at every key',
      body: [
        'A phone keypad has the digits `1 2 3 / 4 5 6 / 7 8 9 / * 0 #`, and only the digit keys can be pressed. A chess **knight** is placed on any digit key and makes `n - 1` knight moves, each time pressing the key it lands on; the digits pressed form a phone number of `n` digits. How many different numbers can be dialled? For `n = 1` there are 10, for `n = 2` there are 20 (each digit has the knight neighbours: 0 -> 4, 6; 1 -> 6, 8; 2 -> 7, 9; 3 -> 4, 8; 4 -> 0, 3, 9; 5 -> none; 6 -> 0, 1, 7; 7 -> 2, 6; 8 -> 1, 3; 9 -> 2, 4). Print the count modulo 1 000 000 007.',
        'The digits are the nodes of a small graph, and a number is a **walk** along its edges. The state is "the digit the knight stands on after `k` presses". Let `count[d]` be the number of walks of the current length that end at the digit `d`; for one digit `count[d] = 1`. One more move: **new `count[d]` = the sum of `count[e]` over the digits `e` from which the knight can jump to `d`** (the jump relation is symmetric). After `n - 1` moves, the answer is the sum of all the counts.',
        { code: 'near = [[4, 6], [6, 8], [7, 9], [4, 8], [0, 3, 9], [], [0, 1, 7], [2, 6], [1, 3], [2, 4]]\ncount = [1] * 10\nfor _ in range(n - 1):\n    count = [sum(count[e] for e in near[d]) % MOD for d in range(10)]\nprint(sum(count) % MOD)' },
        'The same recipe counts walks of a given length on any graph: keep a vector with one entry per node and update it step by step. The time is O(n * edges) = about 2 million steps, with O(1) memory. (For a huge `n`, such as 10^18, the update is a matrix, and repeated squaring finds the answer in O(log n).)'
      ]
    },
    statement: ['A knight stands on a digit key (0 to 9) of a phone keypad (the keys `*` and `#` cannot be used) and makes knight moves between digit keys. Each key it stands on, including the first, is pressed. Print the number of different digit sequences of length `n` that can be produced, modulo 1000000007.'],
    outputFormat: ['Print the number of phone numbers modulo 1000000007.'],
    examples: [{ input: '1\n', note: 'Any digit: 10.' }, { input: '2\n', note: 'The 20 pairs (every digit has the listed number of knight neighbours): 20.' }],
    hints: ['Think of the ten digits as the nodes of a graph; a number is a walk.', 'Keep, for every digit, the number of walks of the current length that end there.', 'A move adds up the counts of the digits that the knight can come from.'],
    program: {
      io: ['n:int'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        near = [[4, 6], [6, 8], [7, 9], [4, 8], [0, 3, 9], [], [0, 1, 7], [2, 6], [1, 3], [2, 4]]
        count = [1] * 10
        for _ in range(n - 1):
            count = [sum(count[e] for e in near[d]) % MOD for d in range(10)]
        print(sum(count) % MOD)`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<vector<int>> near = {{4, 6}, {6, 8}, {7, 9}, {4, 8}, {0, 3, 9}, {}, {0, 1, 7}, {2, 6}, {1, 3}, {2, 4}};
        vector<long long> count(10, 1);
        for (long long step = 1; step < n; step++) {
            vector<long long> next(10, 0);
            for (int d = 0; d < 10; d++) {
                for (int e : near[d]) next[d] += count[e];
                next[d] %= MOD;
            }
            count = next;
        }
        long long total = 0;
        for (int d = 0; d < 10; d++) total += count[d];
        cout << total % MOD << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int[][] near = {{4, 6}, {6, 8}, {7, 9}, {4, 8}, {0, 3, 9}, {}, {0, 1, 7}, {2, 6}, {1, 3}, {2, 4}};
        long[] count = new long[10];
        Arrays.fill(count, 1);
        long[] next = new long[10];
        for (long step = 1; step < n; step++) {
            for (int d = 0; d < 10; d++) {
                long sum = 0;
                for (int e : near[d]) sum += count[e];
                next[d] = sum % MOD;
            }
            long[] swap = count;
            count = next;
            next = swap;
        }
        long total = 0;
        for (int d = 0; d < 10; d++) total += count[d];
        System.out.println(total % MOD);`
    },
    solution: { explanation: ['count[d] is the number of digit sequences of the current length that end at the digit d; one more move makes it the sum of the counts of the digits the knight can come from. After n - 1 moves the answer is the sum of all ten counts, modulo 1000000007.'], complexity: 'Time O(n * 10), space O(1).' },
    solve(input) {
      const [n] = nums(input); // matrix power by repeated squaring with big integers (a different method from the step-by-step update)
      const near = [[4, 6], [6, 8], [7, 9], [4, 8], [0, 3, 9], [], [0, 1, 7], [2, 6], [1, 3], [2, 4]]; const A = Array.from({ length: 10 }, (_, i) => Array.from({ length: 10 }, (_, j) => (near[i].includes(j) ? 1n : 0n)));
      const mul = (X, Y) => X.map((row) => Y[0].map((_, j) => row.reduce((acc, x, k) => (acc + x * Y[k][j]) % MODN, 0n)));
      let R = Array.from({ length: 10 }, (_, i) => Array.from({ length: 10 }, (_, j) => (i === j ? 1n : 0n))); let P = A; let e = n - 1; while (e > 0) { if (e & 1) R = mul(R, P); P = mul(P, P); e = Math.floor(e / 2); } let total = 0n; for (const row of R) for (const x of row) total += x; return String(total % MODN);
    },
    tests() {
      const out = ['1\n', '2\n', '3\n', '4\n', '3131\n'];
      for (const n of [5, 6, 7, 10, 20, 50, 100, 1000, 12345, 100000, 199999, 200000, 200000]) out.push(`${n}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['2 <= length of s <= 1500', 'The word consists of lowercase English letters.'],
    slug: 'longest-repeated-piece',
    title: 'The Longest Piece That Appears Twice Without Overlap',
    tags: ['dp', 'string', 'repeated-substring'],
    concept: {
      title: 'Compare the word with itself: a common suffix of two prefixes, cut off at the distance between them',
      body: [
        'Find the length of the **longest substring that occurs at least twice** in the word, where the two occurrences must **not overlap** (they may touch). For `banana` it is 1 (`a`, or `n`: the piece `ana` occurs twice but the two occurrences share the middle `a`), for `abcabc` it is 3, and for `aaaa` it is 2 (`aa` twice).',
        'This is the "longest common substring" table of the word with itself. Let `rep(i, j)` (with `i < j`) be the length of the longest piece that **ends at the position `i` and also at the position `j`**. If the letters `s[i]` and `s[j]` differ it is 0. If they are equal, the piece is one letter longer than the piece ending at `i - 1` and `j - 1`: `rep(i - 1, j - 1) + 1`. But the two occurrences must not overlap, and the earlier one ends at `i` while the later one starts at `j - length + 1`, so the length may not exceed the distance `j - i`: **`rep(i, j) = min(rep(i - 1, j - 1) + 1, j - i)`** when the letters are equal. The answer is the largest `rep`.',
        { code: 'prev = [0] * (n + 1)\nbest = 0\nfor j in range(2, n + 1):                    # j and i are counted from 1\n    cur = [0] * (n + 1)\n    for i in range(1, j):\n        if s[i - 1] == s[j - 1]:\n            cur[i] = min(prev[i - 1] + 1, j - i)\n            best = max(best, cur[i])\n    prev = cur\nprint(best)' },
        'The cap `j - i` is applied at every step, and it is correct to cap the previous value as well: `prev[i - 1]` was capped by the smaller distance `(j - 1) - (i - 1) = j - i`, which is the same limit. Half of the table (`i < j`) is used, about a million cells for a word of 1500 letters. Keep only the previous row: O(n) memory.'
      ]
    },
    statement: ['A word `s` is given. Print the length of the longest string that occurs in `s` at two different places that do not overlap (the second occurrence starts after the first one ends). If no letter occurs twice, print 0.'],
    outputFormat: ['Print the length of the longest non-overlapping repeated piece.'],
    examples: [{ input: 'abcabc\n', note: 'The piece abc occurs twice: 3.' }, { input: 'aaaa\n', note: 'The piece aa occurs twice, side by side: 2.' }],
    hints: ['Compare the word with itself: rep(i, j) is the length of the common piece ending at i and at j.', 'For equal letters rep(i, j) = rep(i - 1, j - 1) + 1, but at most j - i so that the pieces do not overlap.', 'The answer is the largest rep; two rows are enough.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        n = len(s)
        prev = [0] * (n + 1)
        best = 0
        for j in range(2, n + 1):
            cur = [0] * (n + 1)
            sj = s[j - 1]
            for i in range(1, j):
                if s[i - 1] == sj:
                    v = prev[i - 1] + 1
                    if v > j - i:
                        v = j - i
                    cur[i] = v
                    if v > best:
                        best = v
            prev = cur
        print(best)`,
      cpp: r`
        int n = (int)s.size();
        vector<int> prev(n + 1, 0), cur(n + 1, 0);
        int best = 0;
        for (int j = 2; j <= n; j++) {
            fill(cur.begin(), cur.end(), 0);
            for (int i = 1; i < j; i++) {
                if (s[i - 1] == s[j - 1]) {
                    cur[i] = min(prev[i - 1] + 1, j - i);
                    best = max(best, cur[i]);
                }
            }
            swap(prev, cur);
        }
        cout << best << "\n";`,
      java: r`
        int n = s.length();
        int[] prev = new int[n + 1];
        int[] cur = new int[n + 1];
        int best = 0;
        for (int j = 2; j <= n; j++) {
            Arrays.fill(cur, 0);
            for (int i = 1; i < j; i++) {
                if (s.charAt(i - 1) == s.charAt(j - 1)) {
                    cur[i] = Math.min(prev[i - 1] + 1, j - i);
                    best = Math.max(best, cur[i]);
                }
            }
            int[] swap = prev;
            prev = cur;
            cur = swap;
        }
        System.out.println(best);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['rep(i, j) is the length of the longest common piece ending at i and at j (i < j): 0 for different letters and min(rep(i - 1, j - 1) + 1, j - i) for equal letters, so that the two occurrences do not overlap. The answer is the largest value; two rows are kept.'], complexity: 'Time O(n^2), space O(n).' },
    solve(input) {
      const s = rows(input)[0]; const n = s.length; // binary search on the length: is there a piece of that length with two non-overlapping occurrences?
      const ok = (len) => { const first = new Map(); for (let i = 0; i + len <= n; i++) { const piece = s.slice(i, i + len); if (first.has(piece)) { if (i - first.get(piece) >= len) return true; } else first.set(piece, i); } return false; };
      let lo = 0, hi = Math.floor(n / 2); while (lo < hi) { const mid = Math.floor((lo + hi + 1) / 2); if (ok(mid)) lo = mid; else hi = mid - 1; } return String(lo);
    },
    tests() {
      const g = rng(2057); const out = ['abcabc\n', 'aaaa\n', 'banana\n', 'ab\n', 'aa\n', 'abcdef\n'];
      const brute = (input) => { const s = rows(input)[0]; const n = s.length; let best = 0; for (let len = 1; 2 * len <= n; len++) for (let i = 0; i + len <= n; i++) for (let j = i + len; j + len <= n; j++) if (s.slice(i, i + len) === s.slice(j, j + len)) best = Math.max(best, len); return String(best); };
      crossCheck(() => randWord(g, randInt(g, 2, 14), 'ab') + '\n', (i) => this.solve(i), brute, 500);
      for (const [n, al] of [[20, 'ab'], [100, 'abc'], [400, 'abcd'], [800, 'ab'], [1500, 'abcdefghijklmnopqrstuvwxyz'], [1500, 'ab'], [1500, 'abc'], [1499, 'a']]) out.push(randWord(g, n, al) + '\n');
      const unit = randWord(g, 300, 'abcdefgh'); out.push('a'.repeat(1500) + '\n', 'ab'.repeat(750) + '\n', unit.repeat(5) + '\n', randWord(g, 700, 'abcdefgh') + 'zz' + randWord(g, 100, 'abcdefgh') + 'zz' + randWord(g, 696, 'abcdefgh') + '\n', 'abcdefghijklmnopqrstuvwxyz'.repeat(57) + '\n');
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the word `a`.', 'The second line has the word `b`.'],
    constraints: ['1 <= length of a, length of b <= 1000', 'Both words consist of lowercase English letters.'],
    slug: 'cheapest-deletions-to-equal',
    title: 'Make Two Words Equal by Deleting the Cheapest Letters',
    tags: ['dp', 'string', 'lcs-variant', 'weighted'],
    concept: {
      title: 'The letters you keep form a common subsequence; maximise its weight',
      body: [
        'Delete letters from the word `a` and from the word `b` (any letters, anywhere) until the two words are **equal**. Deleting a letter costs its **ASCII code** (`a` = 97, `b` = 98, ..., `z` = 122). What is the smallest total cost? For `sea` and `eat` the best is to delete `s` from the first word (115) and `t` from the second (116): total 231, and both words become `ea`.',
        'The letters that are **not** deleted form the same word in both, so they form a **common subsequence**. The cost of the deletions is the total weight of all letters of both words minus the weight of the kept letters, counted in both words: `cost = weight(a) + weight(b) - 2 * weight(kept)`. So the task is to find the **common subsequence of the largest weight**. The LCS table works with weights: when the last letters are equal, add the **weight of the letter** instead of 1: `w(i, j) = w(i - 1, j - 1) + code(a[i])`, otherwise `max(w(i - 1, j), w(i, j - 1))`.',
        { code: 'prev = [0] * (m + 1)\nfor i in range(n):\n    cur = [0] * (m + 1)\n    for j in range(m):\n        if a[i] == b[j]:\n            cur[j + 1] = prev[j] + ord(a[i])\n        else:\n            cur[j + 1] = max(cur[j], prev[j + 1])\n    prev = cur\nprint(sum(map(ord, a)) + sum(map(ord, b)) - 2 * prev[m])' },
        'Turning a "delete the cheapest" question into "keep the most valuable common part" is a typical DP move. The time is O(|a| * |b|), at most a million steps, and the memory O(|b|). The answer can be as large as about 240 000, which fits a normal integer.'
      ]
    },
    statement: ['Two words `a` and `b` are given. You may delete letters from either word; deleting a letter costs its ASCII code (a = 97, ..., z = 122). Print the smallest total cost after which the two words are equal (they may both become empty).'],
    outputFormat: ['Print the smallest total cost.'],
    examples: [{ input: 'sea\neat\n', note: 'Delete s (115) and t (116): the words become ea. Total 231.' }, { input: 'abc\nabc\n', note: 'The words are equal already: 0.' }],
    hints: ['The letters that stay form a common subsequence of both words.', 'The cost is weight(a) + weight(b) - 2 * weight(the kept subsequence).', 'Use the LCS table, adding the ASCII code of the letter when two letters match.'],
    program: {
      io: ['a:word', 'b:word'],
      fast: true,
      python: r`
        n = len(a)
        m = len(b)
        prev = [0] * (m + 1)
        for i in range(n):
            cur = [0] * (m + 1)
            ai = a[i]
            w = ord(ai)
            for j in range(m):
                if b[j] == ai:
                    cur[j + 1] = prev[j] + w
                else:
                    cur[j + 1] = cur[j] if cur[j] > prev[j + 1] else prev[j + 1]
            prev = cur
        print(sum(map(ord, a)) + sum(map(ord, b)) - 2 * prev[m])`,
      cpp: r`
        int n = (int)a.size(), m = (int)b.size();
        vector<long long> prev(m + 1, 0), cur(m + 1, 0);
        long long total = 0;
        for (char ch : a) total += ch;
        for (char ch : b) total += ch;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (a[i] == b[j]) cur[j + 1] = prev[j] + a[i];
                else cur[j + 1] = max(cur[j], prev[j + 1]);
            }
            swap(prev, cur);
        }
        cout << total - 2 * prev[m] << "\n";`,
      java: r`
        int n = a.length(), m = b.length();
        long[] prev = new long[m + 1];
        long[] cur = new long[m + 1];
        long total = 0;
        for (int i = 0; i < n; i++) total += a.charAt(i);
        for (int j = 0; j < m; j++) total += b.charAt(j);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (a.charAt(i) == b.charAt(j)) cur[j + 1] = prev[j] + a.charAt(i);
                else cur[j + 1] = Math.max(cur[j], prev[j + 1]);
            }
            long[] swap = prev;
            prev = cur;
            cur = swap;
        }
        System.out.println(total - 2 * prev[m]);`
    },
    solution: { explanation: ['The kept letters form a common subsequence, so the cost is weight(a) + weight(b) - 2 * the largest weight of a common subsequence; the LCS table is filled with the ASCII code of the letter added when two letters match.'], complexity: 'Time O(|a| * |b|), space O(|b|).' },
    solve(input) {
      const [a, b] = rows(input); const n = a.length, m = b.length; // the cost table directly: d[i][j] = the cheapest way to make the suffixes equal
      const d = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0)); for (let i = n - 1; i >= 0; i--) d[i][m] = d[i + 1][m] + a.charCodeAt(i); for (let j = m - 1; j >= 0; j--) d[n][j] = d[n][j + 1] + b.charCodeAt(j); for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) d[i][j] = a[i] === b[j] ? d[i + 1][j + 1] : Math.min(d[i + 1][j] + a.charCodeAt(i), d[i][j + 1] + b.charCodeAt(j)); return String(d[0][0]);
    },
    tests() {
      const g = rng(2058); const out = ['sea\neat\n', 'abc\nabc\n', 'a\nb\n', 'a\na\n', 'delete\nleet\n'];
      const brute = (input) => { const [a, b] = rows(input); let best = Infinity; const weight = (x) => [...x].reduce((s0, c) => s0 + c.charCodeAt(0), 0); for (let mask = 0; mask < (1 << a.length); mask++) { let sub = ''; for (let i = 0; i < a.length; i++) if (mask >> i & 1) sub += a[i]; let p = 0; for (const ch of b) if (p < sub.length && ch === sub[p]) p++; if (p === sub.length) best = Math.min(best, weight(a) - weight(sub) + weight(b) - weight(sub)); } return String(best); };
      crossCheck(() => lines(randWord(g, randInt(g, 1, 9), 'abc'), randWord(g, randInt(g, 1, 9), 'abc')), (i) => this.solve(i), brute, 300);
      for (const [n, m, al] of [[20, 25, 'ab'], [100, 100, 'abc'], [400, 300, 'abcd'], [700, 700, 'ab'], [1000, 1000, 'abcdefghijklmnopqrstuvwxyz'], [1000, 1000, 'ab'], [1000, 1000, 'abc'], [1, 1000, 'ab'], [1000, 1, 'ab'], [1000, 800, 'a']]) out.push(lines(randWord(g, n, al), randWord(g, m, al)));
      const base = randWord(g, 1000, 'abcdefgh'); out.push(lines(base, base), lines('a'.repeat(1000), 'z'.repeat(1000)), lines('z'.repeat(1000), 'z'.repeat(1000)), lines('ab'.repeat(500), 'ba'.repeat(500)), lines(base, [...base].reverse().join('')));
      return out;
    }
  }
];
