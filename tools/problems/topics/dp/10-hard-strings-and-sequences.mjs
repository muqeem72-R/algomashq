import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const MOD = 1000000007;
const list = (n, a) => `${n}\n${a.join(' ')}\n`;
const twoLines = (a, b) => `${a}\n${b}\n`;
const gridText = (g) => `${g.length} ${g[0].length}\n${g.join('\n')}\n`;
const arrOf = (input) => nums(rows(input)[1]);

export default [
  {
    ...hard,
    inputFormat: ['The first line has the text `t` (lowercase letters).', 'The second line has the pattern `p` (lowercase letters, `.` and `*`).'],
    constraints: ['1 <= length of t <= 800', '1 <= length of p <= 800', 'In the pattern every `*` follows a letter or a `.`.'],
    slug: 'dot-star-pattern-match',
    title: 'Does the Pattern With Dot and Star Match the Whole Text?',
    tags: ['dp', 'string', 'regex', 'pattern-matching'],
    concept: {
      title: 'The star repeats the letter before it: skip the pair, or use it once more',
      body: [
        'A tiny regular-expression matcher. In the pattern, a letter matches itself, a **dot** `.` matches any single letter, and a **star** `*` means "**zero or more** of the element before it" (the letter or the dot just in front of the star). The pattern must match the **whole** text. For the text `aab` and the pattern `c*a*b` the answer is yes (`c*` is empty, `a*` is `aa`, then `b`); for `mississippi` and `mis*is*p*.` it is no.',
        'Let `ok(i, j)` be true if the first `i` letters of the text match the first `j` characters of the pattern. If the last pattern character `p[j]` is **not** a star, it must match one letter: `ok(i, j) = text[i] matches p[j] and ok(i - 1, j - 1)`. If it is a **star**, then `p[j-1]` is the element that repeats. Either it is used **zero times**, which removes the pair "element + star": `ok(i, j - 2)`; or it is used **once more**, which needs `text[i]` to match the element and the same pattern to match the shorter text: `ok(i - 1, j)`. So **`ok(i, j) = ok(i, j - 2) or (text[i] matches p[j-1] and ok(i - 1, j))`**.',
        { code: 'prev = [True] + [False] * m                          # the empty text\nfor j in range(2, m + 1):\n    if p[j - 1] == "*": prev[j] = prev[j - 2]        # x* can vanish\nfor i in range(1, n + 1):\n    cur = [False] * (m + 1)\n    for j in range(1, m + 1):\n        if p[j - 1] == "*":\n            cur[j] = cur[j - 2] or ((p[j - 2] == "." or p[j - 2] == t[i - 1]) and prev[j])\n        else:\n            cur[j] = (p[j - 1] == "." or p[j - 1] == t[i - 1]) and prev[j - 1]\n    prev = cur\nprint("yes" if prev[m] else "no")' },
        'A direct recursive search may need exponential time on patterns such as `a*a*a*a*b` against `aaaa...a`, because the stars can share the letters in many ways. The table remembers each pair `(i, j)` once, so the time is O(n * m) and the memory O(m). The wildcard problem of the medium level had the same table with simpler star rules; here the star is tied to the element in front of it.'
      ]
    },
    statement: ['A text `t` and a pattern `p` are given. In the pattern a letter matches itself, `.` matches any single letter, and `*` means that the element in front of it (a letter or `.`) is repeated zero or more times. Print `yes` if the pattern matches the whole text, otherwise `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: 'aab\nc*a*b\n', note: 'c* is empty, a* is aa, then b: yes.' }, { input: 'mississippi\nmis*is*p*.\n', note: 'The pattern cannot produce the whole text: no.' }],
    hints: ['Let ok(i, j) say whether the first i letters of the text match the first j characters of the pattern.', 'A star can drop the pair (element, star): ok(i, j - 2), or consume one more letter: ok(i - 1, j) if the letter matches the element.', 'A dot matches any letter.'],
    program: {
      io: ['t:word', 'p:word'],
      fast: true,
      python: r`
        n = len(t)
        m = len(p)
        prev = [True] + [False] * m
        for j in range(2, m + 1):
            if p[j - 1] == "*":
                prev[j] = prev[j - 2]
        for i in range(1, n + 1):
            cur = [False] * (m + 1)
            ti = t[i - 1]
            for j in range(1, m + 1):
                c = p[j - 1]
                if c == "*":
                    e = p[j - 2]
                    cur[j] = cur[j - 2] or ((e == "." or e == ti) and prev[j])
                else:
                    cur[j] = (c == "." or c == ti) and prev[j - 1]
            prev = cur
        print("yes" if prev[m] else "no")`,
      cpp: r`
        int n = (int)t.size(), m = (int)p.size();
        vector<char> prev(m + 1, 0), cur(m + 1, 0);
        prev[0] = 1;
        for (int j = 2; j <= m; j++) if (p[j - 1] == '*') prev[j] = prev[j - 2];
        for (int i = 1; i <= n; i++) {
            fill(cur.begin(), cur.end(), 0);
            for (int j = 1; j <= m; j++) {
                char c = p[j - 1];
                if (c == '*') {
                    char e = p[j - 2];
                    cur[j] = cur[j - 2] || ((e == '.' || e == t[i - 1]) && prev[j]);
                } else {
                    cur[j] = (c == '.' || c == t[i - 1]) && prev[j - 1];
                }
            }
            swap(prev, cur);
        }
        cout << (prev[m] ? "yes" : "no") << "\n";`,
      java: r`
        int n = t.length(), m = p.length();
        boolean[] prev = new boolean[m + 1];
        boolean[] cur = new boolean[m + 1];
        prev[0] = true;
        for (int j = 2; j <= m; j++) if (p.charAt(j - 1) == '*') prev[j] = prev[j - 2];
        for (int i = 1; i <= n; i++) {
            Arrays.fill(cur, false);
            for (int j = 1; j <= m; j++) {
                char c = p.charAt(j - 1);
                if (c == '*') {
                    char e = p.charAt(j - 2);
                    cur[j] = cur[j - 2] || ((e == '.' || e == t.charAt(i - 1)) && prev[j]);
                } else {
                    cur[j] = (c == '.' || c == t.charAt(i - 1)) && prev[j - 1];
                }
            }
            boolean[] swap = prev;
            prev = cur;
            cur = swap;
        }
        System.out.println(prev[m] ? "yes" : "no");`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['ok(i, j) tells whether the first i letters of the text match the first j characters of the pattern: without a star at the end it needs a matching letter and ok(i - 1, j - 1); with a star after the element e it is ok(i, j - 2) (zero copies) or, if the letter matches e, ok(i - 1, j) (one more copy). Two rows are kept.'], complexity: 'Time O(n * m), space O(m).' },
    solve(input) {
      const [t, p] = rows(input); const n = t.length, m = p.length; // the full table, indexed by the text position and the pattern position
      const tab = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1)); tab[0][0] = 1;
      for (let j = 2; j <= m; j++) if (p[j - 1] === '*') tab[0][j] = tab[0][j - 2];
      for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) { if (p[j - 1] === '*') tab[i][j] = (tab[i][j - 2] || ((p[j - 2] === '.' || p[j - 2] === t[i - 1]) && tab[i - 1][j])) ? 1 : 0; else tab[i][j] = ((p[j - 1] === '.' || p[j - 1] === t[i - 1]) && tab[i - 1][j - 1]) ? 1 : 0; }
      return tab[n][m] ? 'yes' : 'no';
    },
    tests() {
      const g = rng(2091); const out = ['aab\nc*a*b\n', 'mississippi\nmis*is*p*.\n', 'a\na*\n', 'a\n.*\n', 'ab\n.*c\n', 'aaa\na*a\n'];
      const pat = (len, al, ps, pd) => { let s0 = ''; while (s0.length < len) { s0 += g() < pd ? '.' : al[randInt(g, 0, al.length - 1)]; if (g() < ps) s0 += '*'; } return s0.slice(0, len); };
      const make = (n, m, al, ps, pd) => twoLines(randWord(g, n, al), pat(m, al, ps, pd));
      const viaRegExp = (input) => { const [t, p] = rows(input); return new RegExp('^(?:' + p + ')$').test(t) ? 'yes' : 'no'; };
      crossCheck(() => make(randInt(g, 1, 8), randInt(g, 1, 8), 'ab', 0.4, 0.15), (i) => this.solve(i), viaRegExp, 800);
      for (const [n, m, al, ps, pd] of [[20, 12, 'ab', 0.4, 0.1], [100, 60, 'ab', 0.4, 0.1], [300, 200, 'abc', 0.4, 0.1], [800, 800, 'ab', 0.5, 0.1], [800, 400, 'a', 0.5, 0.05], [800, 800, 'a', 0.9, 0], [800, 600, 'abc', 0.3, 0.3], [799, 799, 'ab', 0.45, 0.2]]) out.push(make(n, m, al, ps, pd));
      out.push(twoLines('a'.repeat(800), 'a*'.repeat(400)), twoLines('a'.repeat(800), 'a*'.repeat(399) + 'b'), twoLines('a'.repeat(799) + 'b', 'a*'.repeat(399) + 'b'), twoLines('ab'.repeat(400), '.*'), twoLines('ab'.repeat(400), '.*c'), twoLines('a'.repeat(800), '.'.repeat(800)), twoLines('a'.repeat(800), '.'.repeat(799)), twoLines('abc'.repeat(266), 'a.c'.repeat(266)));
      // texts that match by construction: expand a random pattern into a text
      for (let k = 0; k < 3; k++) { const p = pat(300, 'ab', 0.4, 0.2); let t = ''; for (let i = 0; i < p.length; i++) { const el = p[i]; if (p[i + 1] === '*') { const rep = randInt(g, 0, 4); for (let q = 0; q < rep; q++) t += el === '.' ? 'ab'[randInt(g, 0, 1)] : el; i++; } else t += el === '.' ? 'ab'[randInt(g, 0, 1)] : el; } if (t.length) out.push(twoLines(t.slice(0, 800), p)); }
      return out.filter((x) => { const [t, p] = rows(x); return t.length >= 1 && p.length >= 1 && t.length <= 800 && p.length <= 800; });
    }
  },

  {
    ...hard,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 100000', 'The word consists of lowercase English letters.'],
    slug: 'count-distinct-subsequences',
    title: 'How Many Different Subsequences Does the Word Have?',
    tags: ['dp', 'string', 'counting', 'subsequence'],
    concept: {
      title: 'Each new letter doubles the subsequences, except those already made with the same letter',
      body: [
        'A *subsequence* is obtained by deleting some letters of a word (keeping the order). Different choices of positions may give the **same** word. Count the **different non-empty words** that are subsequences of `s`, modulo 1 000 000 007. For `abc` there are 7 (`a b c ab ac bc abc`); for `aba` there are 6 (`a b ab aa ba aba`); for `aaa` there are 3 (`a aa aaa`).',
        'Let `total` be the number of different subsequences of the letters read so far, **including the empty one**; at the start `total = 1`. A new letter `c` can be appended to **every** existing subsequence, which would double the count to `2 * total`. But if the letter `c` has appeared before, some of these words were already produced then: exactly the words that were made by appending the *earlier* `c` to the subsequences existing at that moment, and their number is the value `total` had **just before the previous `c`** was processed. So **`new_total = 2 * total - last[c]`**, where `last[c]` is the value of `total` before the previous `c`; then `last[c] = total` (the old one) and `total = new_total`.',
        { code: 'total = 1                          # the empty subsequence\nlast = [0] * 26                    # last[c]: total just before the previous letter c was read\nfor ch in s:\n    i = ord(ch) - 97\n    new_total = (2 * total - last[i]) % MOD\n    last[i] = total\n    total = new_total\nprint((total - 1) % MOD)           # do not count the empty word' },
        'For `aaa`: the totals are 1 -> 2 -> 3 -> 4, so the answer is 3. The trick is to count **words**, not choices of positions, and to subtract exactly the words that would be counted twice. The time is O(n) and the memory O(26). Take care that the subtraction can go negative: add the modulus before the remainder (or use a language whose `%` stays non-negative).'
      ]
    },
    statement: ['A word `s` is given. Count the different non-empty words that can be obtained from `s` by deleting some letters (keeping the order of the others). Print the count modulo 1000000007.'],
    outputFormat: ['Print the number of different non-empty subsequences modulo 1000000007.'],
    examples: [{ input: 'abc\n', note: 'a, b, c, ab, ac, bc, abc: 7.' }, { input: 'aaa\n', note: 'a, aa, aaa: 3.' }],
    hints: ['Keep the number of different subsequences including the empty one; a new letter doubles it.', 'Subtract the number of subsequences that existed just before the previous occurrence of the same letter.', 'Do not forget to remove the empty subsequence at the end, and watch the modulus for negative values.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        total = 1
        last = [0] * 26
        for ch in s:
            i = ord(ch) - 97
            new_total = (2 * total - last[i]) % MOD
            last[i] = total
            total = new_total
        print((total - 1) % MOD)`,
      cpp: r`
        const long long MOD = 1000000007;
        long long total = 1;
        long long last[26] = {0};
        for (char ch : s) {
            int i = ch - 'a';
            long long newTotal = ((2 * total - last[i]) % MOD + MOD) % MOD;
            last[i] = total;
            total = newTotal;
        }
        cout << ((total - 1) % MOD + MOD) % MOD << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        long total = 1;
        long[] last = new long[26];
        for (int k = 0; k < s.length(); k++) {
            int i = s.charAt(k) - 'a';
            long newTotal = ((2 * total - last[i]) % MOD + MOD) % MOD;
            last[i] = total;
            total = newTotal;
        }
        System.out.println(((total - 1) % MOD + MOD) % MOD);`
    },
    solution: { explanation: ['total counts the different subsequences read so far including the empty one (it starts at 1); a letter c makes it 2 * total - last[c], where last[c] is the value of total before the previous c, and last[c] is then set to the old total. The answer is total - 1 modulo 1000000007.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const s = rows(input)[0]; // count the different subsequences by their last letter: ends[c] = 1 + the sum over all letters of ends
      const ends = new Array(26).fill(0); for (const ch of s) { const c = ch.charCodeAt(0) - 97; let sum = 1; for (let d = 0; d < 26; d++) sum += ends[d]; ends[c] = sum % MOD; } return String(ends.reduce((x, y) => x + y, 0) % MOD);
    },
    tests() {
      const g = rng(2092); const out = ['abc\n', 'aaa\n', 'aba\n', 'a\n', 'ab\n', 'abab\n'];
      const brute = (input) => { const s = rows(input)[0]; const set = new Set(); for (let mask = 1; mask < (1 << s.length); mask++) { let sub = ''; for (let i = 0; i < s.length; i++) if (mask >> i & 1) sub += s[i]; set.add(sub); } return String(set.size % MOD); };
      crossCheck(() => randWord(g, randInt(g, 1, 13), 'abc') + '\n', (i) => this.solve(i), brute, 400);
      for (const [n, al] of [[20, 'ab'], [100, 'abc'], [1000, 'abcdefghijklmnopqrstuvwxyz'], [100000, 'abcdefghijklmnopqrstuvwxyz'], [100000, 'ab'], [100000, 'abc'], [99999, 'abcde']]) out.push(randWord(g, n, al) + '\n');
      out.push('a'.repeat(100000) + '\n', 'ab'.repeat(50000) + '\n', 'abcdefghijklmnopqrstuvwxyz'.repeat(3846) + '\n', 'z'.repeat(50000) + 'a'.repeat(50000) + '\n');
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 1500', '-10^9 <= each number <= 10^9'],
    slug: 'count-longest-rising-subsequences',
    title: 'How Many Longest Rising Subsequences Are There?',
    tags: ['dp', 'lis', 'counting', 'pairs'],
    concept: {
      title: 'For every position keep the length of the best chain ending there and how many chains reach that length',
      body: [
        'Count the **longest strictly increasing subsequences** of a list: not their length, but how many different ones (different sets of positions) have the maximum length. For `1 3 5 4 7` the longest rising subsequences have the length 4: `1 3 5 7` and `1 3 4 7`, so there are 2. For five equal numbers every single element is a longest rising subsequence of length 1: 5. Print the count modulo 1 000 000 007.',
        'For every position `i` keep a **pair**: `length[i]`, the length of the longest rising subsequence ending at `i`, and `count[i]`, **how many** subsequences of that length end at `i`. For each earlier position `j < i` with `a[j] < a[i]`: if `length[j] + 1` is **longer** than the current `length[i]`, we found a better length, so `length[i] = length[j] + 1` and `count[i] = count[j]` (start counting again); if it is **equal** to `length[i]`, these are additional chains of the same length: `count[i] += count[j]`. At the end, add up `count[i]` over all positions whose `length[i]` equals the overall maximum.',
        { code: 'length = [1] * n\ncount = [1] * n\nfor i in range(n):\n    for j in range(i):\n        if a[j] < a[i]:\n            if length[j] + 1 > length[i]:\n                length[i] = length[j] + 1; count[i] = count[j]\n            elif length[j] + 1 == length[i]:\n                count[i] = (count[i] + count[j]) % MOD\nbest = max(length)\nprint(sum(count[i] for i in range(n) if length[i] == best) % MOD)' },
        'The pair (best value, number of ways) is the same device as in the coin route problem: "maximum with multiplicity". The time is O(n^2), at most 1.1 million steps here. (The O(n log n) method of the plain LIS does not count chains, which is why the quadratic table is needed.)'
      ]
    },
    statement: ['A list of `n` integers is given. Count the strictly increasing subsequences (different sets of positions) whose length equals the maximum possible length. Print the count modulo 1000000007.'],
    outputFormat: ['Print the number of longest strictly increasing subsequences modulo 1000000007.'],
    examples: [{ input: '5\n1 3 5 4 7\n', note: 'The chains 1 3 5 7 and 1 3 4 7 have the length 4: 2.' }, { input: '5\n2 2 2 2 2\n', note: 'Every single element is a longest chain: 5.' }],
    hints: ['Keep for each position the length of the longest chain ending there and the number of such chains.', 'A longer chain through j replaces the count; an equally long chain adds to it.', 'Sum the counts of the positions that reach the overall longest length.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        length = [1] * n
        count = [1] * n
        for i in range(n):
            ai = a[i]
            li = 1
            ci = 1
            for j in range(i):
                if a[j] < ai:
                    lj = length[j] + 1
                    if lj > li:
                        li = lj
                        ci = count[j]
                    elif lj == li:
                        ci = (ci + count[j]) % MOD
            length[i] = li
            count[i] = ci
        best = max(length)
        print(sum(count[i] for i in range(n) if length[i] == best) % MOD)`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<int> length(n, 1);
        vector<long long> count(n, 1);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (a[j] < a[i]) {
                    if (length[j] + 1 > length[i]) {
                        length[i] = length[j] + 1;
                        count[i] = count[j];
                    } else if (length[j] + 1 == length[i]) {
                        count[i] = (count[i] + count[j]) % MOD;
                    }
                }
            }
        }
        int best = *max_element(length.begin(), length.end());
        long long total = 0;
        for (int i = 0; i < n; i++) if (length[i] == best) total = (total + count[i]) % MOD;
        cout << total << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int[] length = new int[(int) n];
        long[] count = new long[(int) n];
        Arrays.fill(length, 1);
        Arrays.fill(count, 1);
        int best = 1;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (a[j] < a[i]) {
                    if (length[j] + 1 > length[i]) {
                        length[i] = length[j] + 1;
                        count[i] = count[j];
                    } else if (length[j] + 1 == length[i]) {
                        count[i] = (count[i] + count[j]) % MOD;
                    }
                }
            }
            best = Math.max(best, length[i]);
        }
        long total = 0;
        for (int i = 0; i < n; i++) if (length[i] == best) total = (total + count[i]) % MOD;
        System.out.println(total);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['For every position the pair (length of the longest rising subsequence ending there, number of such subsequences) is computed from the earlier smaller values: a longer chain replaces the count, an equal one adds to it. The answer is the sum of the counts at the positions whose length is the overall maximum.'], complexity: 'Time O(n^2), space O(n).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; // first the lengths, then the chains counted layer by layer (each position takes the chains from the positions of the previous layer)
      const len = new Array(n).fill(1); for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) if (a[j] < a[i]) len[i] = Math.max(len[i], len[j] + 1); const best = Math.max(...len); const cnt = new Array(n).fill(0); for (let i = 0; i < n; i++) { if (len[i] === 1) cnt[i] = 1; else for (let j = 0; j < i; j++) if (a[j] < a[i] && len[j] === len[i] - 1) cnt[i] = (cnt[i] + cnt[j]) % MOD; } let total = 0; for (let i = 0; i < n; i++) if (len[i] === best) total = (total + cnt[i]) % MOD; return String(total);
    },
    tests() {
      const g = rng(2093); const out = ['5\n1 3 5 4 7\n', '5\n2 2 2 2 2\n', '1\n7\n', '3\n3 2 1\n', '6\n1 2 4 3 5 4\n'];
      const brute = (input) => { const a = arrOf(input); let best = 0, count = 0; for (let mask = 1; mask < (1 << a.length); mask++) { let prev = -Infinity, ok = true, c = 0; for (let i = 0; i < a.length; i++) if (mask >> i & 1) { if (a[i] <= prev) { ok = false; break; } prev = a[i]; c++; } if (!ok) continue; if (c > best) { best = c; count = 1; } else if (c === best) count++; } return String(count % MOD); };
      crossCheck(() => { const n = randInt(g, 1, 12); return list(n, randArray(g, n, 0, 6)); }, (i) => this.solve(i), brute, 400);
      for (const [n, lo, hi] of [[10, 0, 5], [100, 0, 50], [500, 0, 1000], [1500, -1000000000, 1000000000], [1500, 0, 1], [1500, 0, 10], [1500, 0, 100], [1500, 0, 1500], [1499, 0, 40]]) out.push(list(n, randArray(g, n, lo, hi)));
      out.push(list(1500, new Array(1500).fill(5)), list(1500, many(1500, (i) => i)), list(1500, many(1500, (i) => 1500 - i)), list(1500, many(1500, (i) => (i % 2 ? i - 1 : i + 1))), list(1500, many(1500, (i) => Math.floor(i / 2))), list(1500, many(1500, (i) => (i < 750 ? i % 2 : 2 + (i % 2)))));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of envelopes.', 'Each of the next `n` lines has two numbers `w` and `h`: the width and the height of an envelope.'],
    constraints: ['1 <= n <= 50000', '1 <= w, h <= 10^9'],
    slug: 'nested-envelopes',
    title: 'How Many Envelopes Fit Inside Each Other?',
    tags: ['dp', 'lis', 'sorting', 'two-dimensional'],
    concept: {
      title: 'Sort by one side so that only the other side has to be increasing: a longest rising subsequence in disguise',
      body: [
        'An envelope fits inside another if **both** its width and its height are **strictly smaller** (turning is not allowed). Given many envelopes, what is the largest number that can be nested one inside the next, like Russian dolls? For `(5,4) (6,4) (6,7) (2,3)` the answer is 3: `(2,3) -> (5,4) -> (6,7)`.',
        'The relation has two conditions; sorting handles one of them. **Sort the envelopes by the width, increasing**. Then a chain of nested envelopes is a subsequence in which the widths increase (by the order) **and** the heights strictly increase, so it is a longest strictly increasing subsequence of the heights. One catch: envelopes with the **same width** cannot be nested, yet in the sorted list their heights could form an increasing run. To prevent it, among equal widths sort the heights in **decreasing** order: then no two envelopes of the same width can both be in a strictly increasing run of heights.',
        { code: 'envelopes.sort(key=lambda e: (e[0], -e[1]))        # width up, and for equal widths height DOWN\ntails = []\nfor w, h in envelopes:\n    i = bisect_left(tails, h)\n    if i == len(tails): tails.append(h)\n    else: tails[i] = h\nprint(len(tails))' },
        'After the sort the task is exactly the fast LIS from the medium level, so the whole solution takes O(n log n) time. Looking for the order that turns a two-condition relation into a one-dimensional problem is a common trick for chains of boxes, intervals and points.'
      ]
    },
    statement: ['`n` envelopes with the widths `w` and heights `h` are given. An envelope fits into another one if its width and its height are both strictly smaller (envelopes cannot be rotated). Print the largest number of envelopes that can be nested one inside the other.'],
    outputFormat: ['Print the largest number of nested envelopes.'],
    examples: [{ input: '4\n5 4\n6 4\n6 7\n2 3\n', note: '(2,3), (5,4), (6,7): 3.' }, { input: '3\n1 1\n1 1\n1 1\n', note: 'Equal envelopes do not fit: 1.' }],
    hints: ['Sort by width increasing, and by height decreasing for equal widths.', 'Then find the longest strictly increasing subsequence of the heights.', 'Use the O(n log n) method with binary search.'],
    program: {
      io: ['n:int', 'env:int[n][2]'],
      fast: true,
      helpers: { python: 'from bisect import bisect_left', cpp: '', java: '' },
      includes: ['<algorithm>'],
      python: r`
        env.sort(key=lambda e: (e[0], -e[1]))
        tails = []
        for w, h in env:
            i = bisect_left(tails, h)
            if i == len(tails):
                tails.append(h)
            else:
                tails[i] = h
        print(len(tails))`,
      cpp: r`
        vector<pair<long long, long long>> items;
        for (const vector<long long>& e : env) items.push_back({e[0], e[1]});
        sort(items.begin(), items.end(), [](const pair<long long, long long>& x, const pair<long long, long long>& y) {
            if (x.first != y.first) return x.first < y.first;
            return x.second > y.second;
        });
        vector<long long> tails;
        for (const auto& it : items) {
            auto pos = lower_bound(tails.begin(), tails.end(), it.second);
            if (pos == tails.end()) tails.push_back(it.second);
            else *pos = it.second;
        }
        cout << tails.size() << "\n";`,
      java: r`
        long[] keys = new long[(int) n];
        for (int i = 0; i < n; i++) keys[i] = env[i][0] * 2147483648L + (1000000000L - env[i][1]);
        Arrays.sort(keys);
        long[] tails = new long[(int) n];
        int size = 0;
        for (int i = 0; i < n; i++) {
            long h = 1000000000L - (keys[i] & 2147483647L);
            int lo = 0, hi = size;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (tails[mid] < h) lo = mid + 1;
                else hi = mid;
            }
            tails[lo] = h;
            if (lo == size) size++;
        }
        System.out.println(size);`
    },
    solution: { explanation: ['The envelopes are sorted by width increasing and, for equal widths, by height decreasing; then the answer is the length of the longest strictly increasing subsequence of the heights, found with a binary search over the smallest possible last heights.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const env = many(n, (i) => nums(rs[i + 1]));
      if (n <= 2500) { env.sort((x, y) => x[0] - y[0] || x[1] - y[1]); const best = new Array(n).fill(1); let ans = 0; for (let i = 0; i < n; i++) { for (let j = 0; j < i; j++) if (env[j][0] < env[i][0] && env[j][1] < env[i][1]) best[i] = Math.max(best[i], best[j] + 1); ans = Math.max(ans, best[i]); } return String(ans); }
      env.sort((x, y) => x[0] - y[0] || y[1] - x[1]); const tops = []; for (const [, h] of env) { let lo = 0, hi = tops.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (tops[mid] >= h) hi = mid; else lo = mid + 1; } tops[lo] = h; } return String(tops.length);
    },
    tests() {
      const g = rng(2094); const out = ['4\n5 4\n6 4\n6 7\n2 3\n', '3\n1 1\n1 1\n1 1\n', '1\n5 5\n', '2\n1 2\n2 1\n'];
      const make = (n, wHi, hHi) => `${n}\n${many(n, () => `${randInt(g, 1, wHi)} ${randInt(g, 1, hHi)}`).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const env = many(n, (i) => nums(rs[i + 1])); let best = 0; const go = (cur, size, used) => { best = Math.max(best, size); for (let i = 0; i < n; i++) if (!(used >> i & 1) && env[i][0] < cur[0] && env[i][1] < cur[1]) go(env[i], size + 1, used | (1 << i)); }; for (let i = 0; i < n; i++) go(env[i], 1, 1 << i); return String(best); };
      crossCheck(() => make(randInt(g, 1, 9), 6, 6), (i) => this.solve(i), brute, 400);
      for (const [n, wh, hh] of [[10, 20, 20], [100, 50, 50], [1000, 100, 100], [2500, 1000000000, 1000000000], [20000, 1000000000, 1000000000], [50000, 1000000000, 1000000000], [30000, 1000, 1000], [30000, 10, 1000000000], [30000, 1000000000, 10], [29999, 100000, 100000]]) out.push(make(n, wh, hh));
      out.push(`30000\n${many(30000, (i) => `${i + 1} ${i + 1}`).join('\n')}\n`, `30000\n${many(30000, (i) => `${i + 1} ${30000 - i}`).join('\n')}\n`, `30000\n${many(30000, () => '7 7').join('\n')}\n`, `30000\n${many(30000, (i) => `${1 + (i % 3)} ${1 + Math.floor(i / 3)}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 1500', 'The word consists of lowercase English letters.'],
    slug: 'count-palindromic-subsequences',
    title: 'Count the Palindromic Subsequences by Position',
    tags: ['dp', 'interval-dp', 'palindrome', 'counting'],
    concept: {
      title: 'Inclusion and exclusion over an interval: count without the left end, without the right end, and correct the overlap',
      body: [
        'Count the **non-empty palindromic subsequences** of a word, where two subsequences are different if they use different **sets of positions** (even if they spell the same palindrome). For `bccb` the answer is 9: the four single letters, `cc` and `bb`, `bcb` twice (with either `c`) and `bccb`. Print the count modulo 1 000 000 007.',
        'Let `pal(i, j)` be the number of palindromic subsequences inside the piece `s[i..j]`. Split them by whether they use the position `i` or the position `j`: those that **do not use `i`** are counted by `pal(i + 1, j)`, those that **do not use `j`** by `pal(i, j - 1)`. The ones counted twice are those that use neither, `pal(i + 1, j - 1)`, so by inclusion and exclusion `pal(i + 1, j) + pal(i, j - 1) - pal(i + 1, j - 1)` counts all that miss at least one end. What is left are the subsequences that use **both** `i` and `j`: they exist only if `s[i] = s[j]`, and then they are the palindromes inside `i + 1 .. j - 1` (also the empty one) with the two ends added around: `pal(i + 1, j - 1) + 1`. **`pal(i, j) = pal(i + 1, j) + pal(i, j - 1) - pal(i + 1, j - 1) + (s[i] = s[j] ? pal(i + 1, j - 1) + 1 : 0)`**, with `pal(i, i) = 1`.',
        { code: 'pal = [[0] * n for _ in range(n)]\nfor i in range(n - 1, -1, -1):\n    pal[i][i] = 1\n    for j in range(i + 1, n):\n        inner = pal[i + 1][j - 1] if i + 1 <= j - 1 else 0\n        value = pal[i + 1][j] + pal[i][j - 1] - inner\n        if s[i] == s[j]:\n            value += inner + 1\n        pal[i][j] = value % MOD\nprint(pal[0][n - 1])' },
        'Counting the pieces on the left of the "overlap" with a minus sign is the same principle that counts the union of two sets. The table has O(n^2) cells (about a million for 1500 letters) and each takes O(1). Compare with the longest palindromic subsequence: there the table kept a maximum, here it keeps a count, and the counts need the correction term.'
      ]
    },
    statement: ['A word `s` is given. Count the non-empty subsequences of `s` that are palindromes; two subsequences are different if they use different sets of positions. Print the count modulo 1000000007.'],
    outputFormat: ['Print the number of palindromic subsequences modulo 1000000007.'],
    examples: [{ input: 'bccb\n', note: 'b, c, c, b, cc, bb, bcb (twice), bccb: 9.' }, { input: 'ab\n', note: 'Only the two single letters: 2.' }],
    hints: ['Let pal(i, j) be the number of palindromic subsequences in the piece i..j.', 'Count those missing the left end, those missing the right end, and subtract those missing both.', 'If s[i] = s[j], add the palindromes of the inner piece (and the empty one) wrapped by the two ends.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        n = len(s)
        pal = [[0] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):
            pal[i][i] = 1
            for j in range(i + 1, n):
                inner = pal[i + 1][j - 1] if i + 1 <= j - 1 else 0
                value = pal[i + 1][j] + pal[i][j - 1] - inner
                if s[i] == s[j]:
                    value += inner + 1
                pal[i][j] = value % MOD
        print(pal[0][n - 1])`,
      cpp: r`
        const long long MOD = 1000000007;
        int n = (int)s.size();
        vector<vector<long long>> pal(n + 1, vector<long long>(n + 1, 0));
        for (int i = n - 1; i >= 0; i--) {
            pal[i][i] = 1;
            for (int j = i + 1; j < n; j++) {
                long long inner = (i + 1 <= j - 1) ? pal[i + 1][j - 1] : 0;
                long long value = pal[i + 1][j] + pal[i][j - 1] - inner;
                if (s[i] == s[j]) value += inner + 1;
                pal[i][j] = ((value % MOD) + MOD) % MOD;
            }
        }
        cout << pal[0][n - 1] << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int n = s.length();
        long[][] pal = new long[n + 1][n + 1];
        for (int i = n - 1; i >= 0; i--) {
            pal[i][i] = 1;
            for (int j = i + 1; j < n; j++) {
                long inner = (i + 1 <= j - 1) ? pal[i + 1][j - 1] : 0;
                long value = pal[i + 1][j] + pal[i][j - 1] - inner;
                if (s.charAt(i) == s.charAt(j)) value += inner + 1;
                pal[i][j] = ((value % MOD) + MOD) % MOD;
            }
        }
        System.out.println(pal[0][n - 1]);`
    },
    solution: { explanation: ['pal(i, j), the number of palindromic subsequences of the piece i..j, is pal(i + 1, j) + pal(i, j - 1) - pal(i + 1, j - 1), plus pal(i + 1, j - 1) + 1 when s[i] = s[j] (the palindromes that use both ends), with pal(i, i) = 1. The answer is pal(0, n - 1) modulo 1000000007.'], complexity: 'Time O(n^2), space O(n^2).' },
    solve(input) {
      const s = rows(input)[0]; const n = s.length; // count including the empty subsequence by the length of the piece: c[i][j] for the piece i .. j - 1
      const c = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(1)); // the empty piece has the one empty subsequence
      for (let len = 1; len <= n; len++) for (let i = 0; i + len <= n; i++) { const j = i + len; if (len === 1) { c[i][j] = 2; continue; } let v = c[i + 1][j] + c[i][j - 1] - c[i + 1][j - 1]; if (s[i] === s[j - 1]) v += c[i + 1][j - 1]; c[i][j] = ((v % MOD) + MOD) % MOD; } return String(((c[0][n] - 1) % MOD + MOD) % MOD);
    },
    tests() {
      const g = rng(2095); const out = ['bccb\n', 'ab\n', 'a\n', 'aa\n', 'aba\n', 'aaa\n'];
      const brute = (input) => { const s = rows(input)[0]; let count = 0; for (let mask = 1; mask < (1 << s.length); mask++) { let sub = ''; for (let i = 0; i < s.length; i++) if (mask >> i & 1) sub += s[i]; if (sub === [...sub].reverse().join('')) count++; } return String(count % MOD); };
      crossCheck(() => randWord(g, randInt(g, 1, 12), 'abc') + '\n', (i) => this.solve(i), brute, 400);
      for (const [n, al] of [[20, 'ab'], [100, 'abc'], [400, 'abcd'], [800, 'ab'], [1500, 'abcdefghijklmnopqrstuvwxyz'], [1500, 'ab'], [1500, 'abc'], [1499, 'a']]) out.push(randWord(g, n, al) + '\n');
      const half = randWord(g, 750, 'abcdefgh'); out.push('a'.repeat(1500) + '\n', 'ab'.repeat(750) + '\n', half + [...half].reverse().join('') + '\n', 'abcdefghijklmnopqrstuvwxyz'.repeat(57) + '\n');
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has the text `s`.', 'The second line has the word `t`.'],
    constraints: ['1 <= length of s <= 5000', '1 <= length of t <= 200', 'Both strings consist of lowercase English letters.'],
    slug: 'shortest-window-with-subsequence',
    title: 'The Shortest Piece of the Text That Contains the Word as a Subsequence',
    tags: ['dp', 'string', 'subsequence', 'window'],
    concept: {
      title: 'For every prefix of the word and every end position keep the latest start of a window that works',
      body: [
        'Find the **shortest substring** (consecutive letters) of the text `s` that contains the word `t` as a **subsequence** (the letters of `t` appear inside it in order, not necessarily next to each other). For `s = abcdebdde` and `t = bde` the answer is 4, the piece `bcde` (the piece `bdde` also has length 4; `bcdebdde` is longer). If there is no such piece, print -1.',
        'Let `start(j, i)` be the **largest** starting position `st` such that the prefix `t[:j]` is a subsequence of the piece `s[st .. i - 1]`; the largest start gives the shortest piece for the fixed end. For the empty prefix any start works, the best is `st = i`: `start(0, i) = i`. For `j >= 1`, look at the last letter `s[i - 1]` of the piece: if it equals `t[j - 1]` it can serve as the last matched letter, and then the rest `t[:j-1]` must fit before it, which gives `start(j - 1, i - 1)`; or the letter is not used, which gives `start(j, i - 1)`. **`start(j, i) = max(start(j, i - 1), start(j - 1, i - 1) if s[i - 1] = t[j - 1])`**, and -1 means impossible. The answer is the smallest `i - start(m, i)` over all `i` with a valid start.',
        { code: 'prev = list(range(n + 1))                       # start(0, i) = i\nfor j in range(1, m + 1):\n    cur = [-1] * (n + 1)\n    for i in range(1, n + 1):\n        v = cur[i - 1]\n        if s[i - 1] == t[j - 1] and prev[i - 1] > v:\n            v = prev[i - 1]\n        cur[i] = v\n    prev = cur\nlengths = [i - prev[i] for i in range(1, n + 1) if prev[i] >= 0]\nprint(min(lengths) if lengths else -1)' },
        'A simple method tries every start and walks forward greedily, but it costs O(n^2) in the worst case. The table needs `|s| * |t|` cells (up to a million) and only two rows. The idea of storing "the best start" instead of "the best length" is useful for all problems about the shortest piece with a property.'
      ]
    },
    statement: ['A text `s` and a word `t` are given. Print the length of the shortest substring of `s` (consecutive letters) that contains `t` as a subsequence, or -1 if there is none.'],
    outputFormat: ['Print the length of the shortest such substring, or -1.'],
    examples: [{ input: 'abcdebdde\nbde\n', note: 'The piece bcde has the length 4 (and contains b, d, e in order).' }, { input: 'abc\nd\n', note: 'There is no d: -1.' }],
    hints: ['Let start(j, i) be the largest start of a piece ending before the position i that contains the first j letters of t as a subsequence.', 'start(0, i) = i; if s[i - 1] = t[j - 1] you can take start(j - 1, i - 1), and you can also skip the letter: start(j, i - 1).', 'The answer is the smallest i - start(m, i).'],
    program: {
      io: ['s:word', 't:word'],
      fast: true,
      python: r`
        n = len(s)
        m = len(t)
        prev = list(range(n + 1))
        for j in range(1, m + 1):
            cur = [-1] * (n + 1)
            tj = t[j - 1]
            for i in range(1, n + 1):
                v = cur[i - 1]
                if s[i - 1] == tj and prev[i - 1] > v:
                    v = prev[i - 1]
                cur[i] = v
            prev = cur
        answer = -1
        for i in range(1, n + 1):
            if prev[i] >= 0 and (answer < 0 or i - prev[i] < answer):
                answer = i - prev[i]
        print(answer)`,
      cpp: r`
        int n = (int)s.size(), m = (int)t.size();
        vector<int> prev(n + 1), cur(n + 1);
        for (int i = 0; i <= n; i++) prev[i] = i;
        for (int j = 1; j <= m; j++) {
            cur[0] = -1;
            for (int i = 1; i <= n; i++) {
                int v = cur[i - 1];
                if (s[i - 1] == t[j - 1] && prev[i - 1] > v) v = prev[i - 1];
                cur[i] = v;
            }
            swap(prev, cur);
        }
        int answer = -1;
        for (int i = 1; i <= n; i++) {
            if (prev[i] >= 0 && (answer < 0 || i - prev[i] < answer)) answer = i - prev[i];
        }
        cout << answer << "\n";`,
      java: r`
        int n = s.length(), m = t.length();
        int[] prev = new int[n + 1];
        int[] cur = new int[n + 1];
        for (int i = 0; i <= n; i++) prev[i] = i;
        for (int j = 1; j <= m; j++) {
            cur[0] = -1;
            for (int i = 1; i <= n; i++) {
                int v = cur[i - 1];
                if (s.charAt(i - 1) == t.charAt(j - 1) && prev[i - 1] > v) v = prev[i - 1];
                cur[i] = v;
            }
            int[] swap = prev;
            prev = cur;
            cur = swap;
        }
        int answer = -1;
        for (int i = 1; i <= n; i++) {
            if (prev[i] >= 0 && (answer < 0 || i - prev[i] < answer)) answer = i - prev[i];
        }
        System.out.println(answer);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['start(j, i) is the largest start of a piece of the text ending before position i that contains the first j letters of the word as a subsequence (-1 if none): start(0, i) = i and start(j, i) = max(start(j, i - 1), start(j - 1, i - 1) when s[i - 1] = t[j - 1]). The answer is the smallest i - start(m, i), or -1.'], complexity: 'Time O(|s| * |t|), space O(|s|).' },
    solve(input) {
      const [s, t] = rows(input); const n = s.length; let best = -1; // for every start walk forward greedily matching the word; the piece ends where the last letter is matched
      for (let st = 0; st < n; st++) { if (s[st] !== t[0]) continue; let p = 0, i = st; while (i < n && p < t.length) { if (s[i] === t[p]) p++; i++; } if (p === t.length) { const len = i - st; if (best < 0 || len < best) best = len; } } return String(best);
    },
    tests() {
      const g = rng(2096); const out = ['abcdebdde\nbde\n', 'abc\nd\n', 'a\na\n', 'abc\nabc\n', 'aaa\naa\n'];
      const brute = (input) => { const [s, t] = rows(input); let best = -1; for (let i = 0; i < s.length; i++) for (let j = i + 1; j <= s.length; j++) { let p = 0; for (let k = i; k < j; k++) if (p < t.length && s[k] === t[p]) p++; if (p === t.length && (best < 0 || j - i < best)) best = j - i; } return String(best); };
      crossCheck(() => twoLines(randWord(g, randInt(g, 1, 12), 'abc'), randWord(g, randInt(g, 1, 4), 'abc')), (i) => this.solve(i), brute, 500);
      for (const [n, m, al] of [[20, 4, 'ab'], [100, 10, 'abc'], [1000, 50, 'abcd'], [5000, 200, 'ab'], [5000, 100, 'abcdefghijklmnopqrstuvwxyz'], [5000, 20, 'abc'], [5000, 200, 'abc'], [4999, 1, 'abc']]) out.push(twoLines(randWord(g, n, al), randWord(g, m, al)));
      out.push(twoLines('a'.repeat(5000), 'a'.repeat(200)), twoLines('a'.repeat(5000), 'a'.repeat(1) + 'b'), twoLines('ab'.repeat(2500), 'ab'.repeat(100)), twoLines('b'.repeat(2500) + 'a'.repeat(2500), 'ba'), twoLines(randWord(g, 4800, 'abc') + 'xyz'.repeat(66), 'xyz'.repeat(66)));
      // texts built by hiding the word with noise between its letters
      for (let k = 0; k < 3; k++) { const t = randWord(g, 100, 'abc'); let s = randWord(g, 2000, 'abc'); for (const ch of t) s += ch + randWord(g, randInt(g, 0, 3), 'abc'); s += randWord(g, 2000, 'abc'); out.push(twoLines(s.slice(0, 5000), t)); }
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `h` and `w`: the number of rows and columns.', 'Each of the next `h` lines has a row of `w` characters `0` and `1`.'],
    constraints: ['1 <= h, w <= 400', 'Every character is `0` or `1`.'],
    slug: 'largest-rectangle-of-ones',
    title: 'The Largest Rectangle Made Only of Ones',
    tags: ['dp', 'grid', 'histogram', 'monotonic-stack'],
    concept: {
      title: 'Turn every row into a histogram of heights, and find the largest rectangle in a histogram with a stack',
      body: [
        'A grid of `0` and `1` is given. Find the **largest rectangle** (a block of rows and columns next to each other) that contains only `1`s and print its area. For the grid `10100 / 10111 / 11111 / 10010` the answer is 6 (the block of 2 rows and 3 columns in the middle). The earlier square problem could use the three neighbours; a rectangle can be wide and short or narrow and tall, so we need a different view.',
        'Go through the rows and keep, for every column, the **height of the stack of ones that ends in the current row**: `height[j] = height[j] + 1` if the cell is `1`, and 0 if it is `0` (a small DP). For each row the heights form a *histogram*, and a rectangle of ones whose **bottom edge lies in this row** is a rectangle inside the histogram. So the problem is solved row by row with the **largest rectangle in a histogram**, which a stack of increasing heights finds in O(w): when a bar is taller than or equal to the stack top, push it; when it is shorter, pop the taller bars, and each popped bar is the lowest in a rectangle that spans from the bar below it on the stack to the current position.',
        { code: 'heights = [0] * w\nbest = 0\nfor row in grid:\n    for j in range(w):\n        heights[j] = heights[j] + 1 if row[j] == "1" else 0\n    stack = []\n    for j in range(w + 1):\n        cur = heights[j] if j < w else 0\n        while stack and heights[stack[-1]] >= cur:\n            height = heights[stack.pop()]\n            left = stack[-1] if stack else -1\n            best = max(best, height * (j - left - 1))\n        stack.append(j)\nprint(best)' },
        'Each bar is pushed and popped once, so a row costs O(w) and the whole grid O(h * w) (160 000 cells at the limit). The two ideas combined here are the DP over rows (heights) and the monotonic stack: both are standard tools, and the combination solves "largest rectangle" problems in grids.'
      ]
    },
    statement: ['A grid of `0` and `1` characters is given. Print the area of the largest rectangle (a set of consecutive rows and consecutive columns) that consists only of `1`s, or 0 if there is no `1`.'],
    outputFormat: ['Print the largest area.'],
    examples: [{ input: '4 5\n10100\n10111\n11111\n10010\n', note: 'The block of rows 2-3 and columns 3-5 has the area 6.' }, { input: '1 1\n0\n', note: 'No ones: 0.' }],
    hints: ['For each column keep the number of consecutive ones ending in the current row.', 'Each row is a histogram; find the largest rectangle in it.', 'Use a stack of bars with increasing heights; popping a bar closes a rectangle.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        heights = [0] * w
        best = 0
        for i in range(h):
            row = grid[i]
            for j in range(w):
                heights[j] = heights[j] + 1 if row[j] == "1" else 0
            stack = []
            for j in range(w + 1):
                cur = heights[j] if j < w else 0
                while stack and heights[stack[-1]] >= cur:
                    height = heights[stack.pop()]
                    left = stack[-1] if stack else -1
                    area = height * (j - left - 1)
                    if area > best:
                        best = area
                stack.append(j)
        print(best)`,
      cpp: r`
        vector<int> heights(w, 0);
        long long best = 0;
        for (int i = 0; i < h; i++) {
            for (int j = 0; j < w; j++) heights[j] = grid[i][j] == '1' ? heights[j] + 1 : 0;
            vector<int> stack;
            for (int j = 0; j <= w; j++) {
                int cur = j < w ? heights[j] : 0;
                while (!stack.empty() && heights[stack.back()] >= cur) {
                    int height = heights[stack.back()];
                    stack.pop_back();
                    int left = stack.empty() ? -1 : stack.back();
                    best = max(best, (long long)height * (j - left - 1));
                }
                stack.push_back(j);
            }
        }
        cout << best << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        int[] heights = new int[colsCount + 1];
        int[] stack = new int[colsCount + 2];
        long best = 0;
        for (int i = 0; i < rowsCount; i++) {
            for (int j = 0; j < colsCount; j++) heights[j] = grid[i].charAt(j) == '1' ? heights[j] + 1 : 0;
            int top = 0;
            for (int j = 0; j <= colsCount; j++) {
                int cur = j < colsCount ? heights[j] : 0;
                while (top > 0 && heights[stack[top - 1]] >= cur) {
                    int height = heights[stack[--top]];
                    int left = top > 0 ? stack[top - 1] : -1;
                    best = Math.max(best, (long) height * (j - left - 1));
                }
                stack[top++] = j;
            }
        }
        System.out.println(best);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['For each row the heights of the columns of consecutive ones ending in it form a histogram; a stack of bars with increasing heights finds the largest rectangle of the histogram in O(w), and the answer is the largest area over all rows.'], complexity: 'Time O(h * w), space O(w).' },
    solve(input) {
      const rs = rows(input); const [h, w] = nums(rs[0]); const grid = rs.slice(1, 1 + h); const heights = new Array(w).fill(0); let best = 0; // for each row and each column scan left and right to find the width of the rectangle of the bar's height
      for (let i = 0; i < h; i++) { for (let j = 0; j < w; j++) heights[j] = grid[i][j] === '1' ? heights[j] + 1 : 0; for (let j = 0; j < w; j++) { if (!heights[j]) continue; let l = j, r = j; while (l > 0 && heights[l - 1] >= heights[j]) l--; while (r + 1 < w && heights[r + 1] >= heights[j]) r++; best = Math.max(best, heights[j] * (r - l + 1)); } } return String(best);
    },
    tests() {
      const g = rng(2097); const out = ['4 5\n10100\n10111\n11111\n10010\n', '1 1\n0\n', '1 1\n1\n', '2 3\n111\n111\n', '3 3\n101\n010\n101\n'];
      const make = (h, w, p) => gridText(many(h, () => many(w, () => (g() < p ? '1' : '0')).join('')));
      const brute = (input) => { const rs = rows(input); const [h, w] = nums(rs[0]); const grid = rs.slice(1, 1 + h); let best = 0; for (let a = 0; a < h; a++) for (let b = a; b < h; b++) for (let c = 0; c < w; c++) for (let d = c; d < w; d++) { let ok = true; for (let i = a; i <= b && ok; i++) for (let j = c; j <= d; j++) if (grid[i][j] !== '1') { ok = false; break; } if (ok) best = Math.max(best, (b - a + 1) * (d - c + 1)); } return String(best); };
      crossCheck(() => make(randInt(g, 1, 6), randInt(g, 1, 6), 0.7), (i) => this.solve(i), brute, 400);
      for (const [h, w, p] of [[10, 10, 0.8], [50, 50, 0.9], [100, 100, 0.95], [200, 200, 0.99], [400, 400, 0.9], [400, 400, 0.99], [400, 400, 0.999], [400, 400, 0.5], [1, 400, 0.9], [400, 1, 0.9], [2, 400, 0.9], [399, 397, 0.97]]) out.push(make(h, w, p));
      out.push(gridText(many(400, () => '1'.repeat(400))), gridText(many(400, () => '0'.repeat(400))), gridText(many(400, (i) => '1'.repeat(400).split('').map((c, j) => ((i + j) % 2 ? '0' : '1')).join(''))), gridText(many(400, (i) => '1'.repeat(i + 1) + '0'.repeat(399 - i))), gridText(many(400, (i) => '1'.repeat(400 - i) + '0'.repeat(i))));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of rods.', 'The second line has `n` numbers: the lengths of the rods.'],
    constraints: ['1 <= n <= 20', '1 <= each length <= 1000', 'The sum of all the lengths is at most 5000.'],
    slug: 'equal-height-billboards',
    title: 'Two Billboard Supports of Exactly the Same Height',
    tags: ['dp', 'knapsack', 'difference', 'partition'],
    concept: {
      title: 'Keep the difference between the two supports as the state, and store the best height',
      body: [
        'Rods of given lengths can be welded end to end to build **two supports** for a billboard, and the two supports must have **exactly the same height**. Each rod is used in the first support, in the second support, or not at all. What is the largest possible height of a support? For the rods `1 2 3 6` the answer is 6 (`1 + 2 + 3` and `6`); for `1 2` it is 0 (nothing works, the supports are empty).',
        'The two heights could be up to 2500 each, and a table over both heights would have millions of cells. But what matters for the future is only the **difference** `d` between the two heights, and among all the ways to reach the same difference, the one with the **taller support as high as possible** is the best (the equal-height answer is the height of the taller support when the difference becomes 0). Let `best[d]` be the largest height of the **taller support** with the difference `d` (-1 if impossible); at the start `best[0] = 0`. For a new rod `r` there are three choices, applied to every state with `best[d] >= 0`: skip the rod, add it to the taller support (difference `d + r`, taller height `best[d] + r`), or add it to the shorter support (if `r <= d` the new difference is `d - r` and the taller height stays; otherwise the shorter support becomes the taller one with the height `best[d] - d + r` and the difference `r - d`).',
        { code: 'best = [-1] * (S + 1)\nbest[0] = 0\nfor r in rods:\n    new = best[:]                                   # skip the rod\n    for d in range(S + 1):\n        h = best[d]\n        if h < 0: continue\n        if d + r <= S: new[d + r] = max(new[d + r], h + r)       # to the taller support\n        if r <= d: new[d - r] = max(new[d - r], h)               # to the shorter support\n        else:      new[r - d] = max(new[r - d], h - d + r)       # the shorter support overtakes\n    best = new\nprint(best[0])' },
        'The new table is built from the old one, so each rod is used at most once. There are `S + 1` differences and `n` rods: at most 100 000 steps. Replacing a pair of values by their **difference** (and storing the best of the rest) is the key idea of this kind of balancing problem; it is the same reduction as in the stone piles problem, but here we maximise the height.'
      ]
    },
    statement: ['`n` rods with the given lengths are available. Each rod can be welded into the first support, into the second support, or not used. The two supports must end up with exactly the same total length. Print the largest possible length of a support (0 if only empty supports are possible).'],
    outputFormat: ['Print the largest possible height of a support.'],
    examples: [{ input: '4\n1 2 3 6\n', note: '1 + 2 + 3 = 6 for the first support and 6 for the second: 6.' }, { input: '2\n1 2\n', note: 'No two groups of rods have equal sums except the empty ones: 0.' }],
    hints: ['Keep the difference between the two supports as the state and the height of the taller one as the value.', 'For each rod: skip it, add it to the taller support, or add it to the shorter support.', 'If the shorter support becomes the taller one, the new height is old height - difference + rod.'],
    program: {
      io: ['n:int', 'rods:int[n]'],
      fast: true,
      python: r`
        S = sum(rods)
        best = [-1] * (S + 1)
        best[0] = 0
        for r in rods:
            new = best[:]
            for d in range(S + 1):
                h = best[d]
                if h < 0:
                    continue
                if d + r <= S and h + r > new[d + r]:
                    new[d + r] = h + r
                if r <= d:
                    if h > new[d - r]:
                        new[d - r] = h
                else:
                    v = h - d + r
                    if v > new[r - d]:
                        new[r - d] = v
            best = new
        print(best[0])`,
      cpp: r`
        long long S = 0;
        for (long long r : rods) S += r;
        vector<long long> best(S + 1, -1);
        best[0] = 0;
        for (long long r : rods) {
            vector<long long> next = best;
            for (long long d = 0; d <= S; d++) {
                long long h = best[d];
                if (h < 0) continue;
                if (d + r <= S) next[d + r] = max(next[d + r], h + r);
                if (r <= d) next[d - r] = max(next[d - r], h);
                else next[r - d] = max(next[r - d], h - d + r);
            }
            best = next;
        }
        cout << best[0] << "\n";`,
      java: r`
        int total = 0;
        for (int i = 0; i < n; i++) total += (int) rods[i];
        long[] best = new long[total + 1];
        long[] next = new long[total + 1];
        Arrays.fill(best, -1);
        best[0] = 0;
        for (int k = 0; k < n; k++) {
            int r = (int) rods[k];
            System.arraycopy(best, 0, next, 0, total + 1);
            for (int d = 0; d <= total; d++) {
                long h = best[d];
                if (h < 0) continue;
                if (d + r <= total) next[d + r] = Math.max(next[d + r], h + r);
                if (r <= d) next[d - r] = Math.max(next[d - r], h);
                else next[r - d] = Math.max(next[r - d], h - d + r);
            }
            long[] swap = best;
            best = next;
            next = swap;
        }
        System.out.println(best[0]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['best[d] is the largest height of the taller support when the two supports differ by d (-1 if impossible); each rod is skipped, added to the taller support (d + r) or added to the shorter one (|d - r|, with the new taller height computed accordingly), always from the old table. The answer is best[0].'], complexity: 'Time O(n * S) where S is the total length, space O(S).' },
    solve(input) {
      const rods = arrOf(input); // the dictionary of pairs (difference -> height of the shorter support), written with a Map
      let cur = new Map([[0, 0]]); for (const r of rods) { const nxt = new Map(cur); for (const [d, low] of cur) { const upd = (nd, nl) => { if (!nxt.has(nd) || nxt.get(nd) < nl) nxt.set(nd, nl); }; upd(d + r, low); /* to the taller support: the shorter stays */ if (r <= d) upd(d - r, low + r); else upd(r - d, low + d); } cur = nxt; } return String(cur.get(0));
    },
    tests() {
      const g = rng(2098); const out = ['4\n1 2 3 6\n', '2\n1 2\n', '1\n5\n', '2\n4 4\n', '3\n1 1 1\n'];
      const brute = (input) => { const rods = arrOf(input); const n = rods.length; let best = 0; const go = (i, a, b) => { if (i === n) { if (a === b) best = Math.max(best, a); return; } go(i + 1, a, b); go(i + 1, a + rods[i], b); go(i + 1, a, b + rods[i]); }; go(0, 0, 0); return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 9); return list(n, randArray(g, n, 1, 12)); }, (i) => this.solve(i), brute, 500);
      for (const [n, hi] of [[8, 20], [12, 50], [16, 100], [20, 250], [20, 100], [20, 25], [20, 10], [20, 3], [19, 250]]) out.push(list(n, randArray(g, n, 1, hi)));
      out.push(list(20, new Array(20).fill(250)), list(20, many(20, (i) => 1 << Math.min(i, 8))), list(20, many(20, (i) => i + 1)), list(20, many(20, (i) => (i % 2 ? 250 : 249))));
      return out.filter((t) => nums(rows(t)[1]).reduce((x, y) => x + y, 0) <= 5000);
    }
  }
];
