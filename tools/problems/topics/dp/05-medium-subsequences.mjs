import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const MOD = 1000000007;
const list = (n, a) => `${n}\n${a.join(' ')}\n`;
const arrOf = (input) => nums(rows(input)[1]);
const twoWords = (a, b) => `${a}\n${b}\n`;

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 100000', '-10^9 <= each number <= 10^9'],
    slug: 'longest-increasing-subsequence',
    title: 'The Longest Strictly Rising Subsequence',
    tags: ['dp', 'lis', 'binary-search', 'subsequence'],
    concept: {
      title: 'From O(n^2) to O(n log n): keep, for every length, the smallest last value',
      body: [
        'A *subsequence* keeps some of the numbers in their original order. Find the length of the **longest strictly increasing subsequence** (LIS). For `10 9 2 5 3 7 101 18` it is 4, for example `2 3 7 101`. The DP is natural: let `len(i)` be the length of the longest increasing subsequence that **ends** at the position `i`; then **`len(i) = 1 + max of len(j) over the earlier positions j with a[j] < a[i]`** (or 1 if there is none). The answer is the largest `len(i)`. This takes O(n^2), too slow for 100 000 numbers.',
        'Here is the faster idea. Keep a list `tails` where `tails[k]` is the **smallest possible last value of an increasing subsequence of length `k + 1`** among the numbers seen so far. The list is always sorted. For a new number `x`: find the first place in `tails` whose value is `>= x` (binary search). If there is no such place, `x` extends the longest subsequence, so append it. Otherwise **replace** that value by `x`: a subsequence of the same length now ends with something smaller or equal, which is never worse for the future.',
        { code: 'from bisect import bisect_left\ntails = []\nfor x in a:\n    i = bisect_left(tails, x)       # the first place with tails[i] >= x\n    if i == len(tails):\n        tails.append(x)\n    else:\n        tails[i] = x\nprint(len(tails))' },
        'The list `tails` is not itself a subsequence of the input, but its **length** equals the LIS length. Using `bisect_left` (first value `>= x`) makes the subsequence **strictly** increasing, because an equal value replaces an equal value instead of extending. Each number costs one binary search: O(n log n) time and O(n) memory.'
      ]
    },
    statement: ['A list of `n` integers is given. Print the length of the longest strictly increasing subsequence (the numbers need not be next to each other, but must keep their order).'],
    outputFormat: ['Print the length of the longest strictly increasing subsequence.'],
    examples: [{ input: '8\n10 9 2 5 3 7 101 18\n', note: 'One longest subsequence is 2 3 7 101: length 4.' }, { input: '4\n7 7 7 7\n', note: 'Equal numbers do not make a strictly increasing subsequence: 1.' }],
    hints: ['Think about the smallest possible last value of an increasing subsequence of each length.', 'That list stays sorted: a new number either extends it or replaces the first value that is not smaller.', 'Use a binary search for the place, and print the length of the list.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      helpers: { python: 'from bisect import bisect_left', cpp: '', java: '' },
      includes: ['<algorithm>'],
      python: r`
        tails = []
        for x in a:
            i = bisect_left(tails, x)
            if i == len(tails):
                tails.append(x)
            else:
                tails[i] = x
        print(len(tails))`,
      cpp: r`
        vector<long long> tails;
        for (long long x : a) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) tails.push_back(x);
            else *it = x;
        }
        cout << tails.size() << "\n";`,
      java: r`
        long[] tails = new long[(int) n];
        int size = 0;
        for (int k = 0; k < n; k++) {
            long x = a[k];
            int lo = 0, hi = size;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (tails[mid] < x) lo = mid + 1;
                else hi = mid;
            }
            tails[lo] = x;
            if (lo == size) size++;
        }
        System.out.println(size);`
    },
    solution: { explanation: ['tails[k] holds the smallest possible last value of an increasing subsequence of length k + 1; for every number a binary search finds the first value that is not smaller, which is replaced by the number (or the number is appended if there is none). The length of tails is the answer.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const a = arrOf(input); const n = a.length;
      if (n <= 3000) { const len = new Array(n).fill(1); let best = 0; for (let i = 0; i < n; i++) { for (let j = 0; j < i; j++) if (a[j] < a[i] && len[j] + 1 > len[i]) len[i] = len[j] + 1; best = Math.max(best, len[i]); } return String(best); }
      // a different O(n log n) method: patience sorting with piles (the number goes on the first pile whose top is not smaller)
      const tops = []; for (const x of a) { let lo = 0, hi = tops.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (tops[mid] >= x) hi = mid; else lo = mid + 1; } tops[lo] = x; } return String(tops.length);
    },
    tests() {
      const g = rng(2041); const out = ['8\n10 9 2 5 3 7 101 18\n', '4\n7 7 7 7\n', '1\n5\n', '5\n1 2 3 4 5\n', '5\n5 4 3 2 1\n'];
      const brute = (input) => { const a = arrOf(input); let best = 0; for (let mask = 1; mask < (1 << a.length); mask++) { let prev = -Infinity, ok = true, c = 0; for (let i = 0; i < a.length; i++) if (mask >> i & 1) { if (a[i] <= prev) { ok = false; break; } prev = a[i]; c++; } if (ok) best = Math.max(best, c); } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 12); return list(n, randArray(g, n, -5, 5)); }, (i) => this.solve(i), brute, 400);
      for (const [n, lo, hi] of [[10, -10, 10], [100, -1000, 1000], [3000, -1000000, 1000000], [3001, -100, 100], [20000, -1000000000, 1000000000], [100000, -1000000000, 1000000000], [100000, 0, 1000], [100000, 0, 10], [100000, 0, 100000]]) out.push(list(n, randArray(g, n, lo, hi)));
      out.push(list(50000, many(50000, (i) => i)), list(50000, many(50000, (i) => 50000 - i)), list(50000, new Array(50000).fill(5)), list(50000, many(50000, (i) => i + (g() < 0.01 ? randInt(g, -50, 50) : 0))), list(50000, many(50000, (i) => (i % 1000) * 100 + Math.floor(i / 1000))), list(50000, many(50000, (i) => (i % 2 ? -i : i))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the string `a`.', 'The second line has the string `b`.'],
    constraints: ['1 <= length of a, length of b <= 1200', 'Both strings consist of lowercase English letters.'],
    slug: 'longest-common-subsequence',
    title: 'The Longest Subsequence Two Words Share',
    tags: ['dp', 'lcs', 'string', 'two-strings'],
    concept: {
      title: 'A table over the prefixes of both words: match the last letters or drop one of them',
      body: [
        'Two words are given. A *subsequence* of a word is obtained by deleting some letters (possibly none) and keeping the order of the rest. Find the length of the **longest common subsequence** (LCS) of the two words. For `abcde` and `ace` it is 3 (`ace`). (This is different from the common *substring* problem, where the letters must be next to each other.)',
        'Let `lcs(i, j)` be the length of the LCS of the first `i` letters of `a` and the first `j` letters of `b`; if one prefix is empty it is 0. Look at the last letters `a[i]` and `b[j]`. If they are **equal**, there is an optimal solution that uses both of them together: `lcs(i, j) = lcs(i - 1, j - 1) + 1`. If they differ, at least one of them is not used, so **`lcs(i, j) = max(lcs(i - 1, j), lcs(i, j - 1))`**.',
        { code: 'prev = [0] * (len(b) + 1)\nfor ch in a:\n    cur = [0] * (len(b) + 1)\n    for j in range(len(b)):\n        if b[j] == ch:\n            cur[j + 1] = prev[j] + 1\n        else:\n            cur[j + 1] = max(cur[j], prev[j + 1])\n    prev = cur\nprint(prev[len(b)])' },
        'The table has `|a| * |b|` cells; each cell looks at three neighbours, and a row needs only the row above it, so two rows are enough: O(|a| * |b|) time, O(|b|) memory. The LCS table is the basis of many tools that compare texts (it is what a diff program uses to show what changed).'
      ]
    },
    statement: ['Two words `a` and `b` are given. Print the length of their longest common subsequence: the longest word that can be obtained from both by deleting some letters (keeping the order of the remaining ones).'],
    outputFormat: ['Print the length of the longest common subsequence.'],
    examples: [{ input: 'abcde\nace\n', note: 'The common subsequence ace: 3.' }, { input: 'abc\ndef\n', note: 'No common letter: 0.' }],
    hints: ['Let lcs(i, j) be the answer for the first i letters of a and the first j letters of b.', 'If the last letters are equal, add 1 to lcs(i - 1, j - 1); otherwise take the larger of lcs(i - 1, j) and lcs(i, j - 1).', 'Two rows of the table are enough.'],
    program: {
      io: ['a:word', 'b:word'],
      fast: true,
      python: r`
        prev = [0] * (len(b) + 1)
        for ch in a:
            cur = [0] * (len(b) + 1)
            for j in range(len(b)):
                if b[j] == ch:
                    cur[j + 1] = prev[j] + 1
                else:
                    cur[j + 1] = cur[j] if cur[j] > prev[j + 1] else prev[j + 1]
            prev = cur
        print(prev[len(b)])`,
      cpp: r`
        int n = (int)a.size(), m = (int)b.size();
        vector<int> prev(m + 1, 0), cur(m + 1, 0);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (a[i] == b[j]) cur[j + 1] = prev[j] + 1;
                else cur[j + 1] = max(cur[j], prev[j + 1]);
            }
            swap(prev, cur);
        }
        cout << prev[m] << "\n";`,
      java: r`
        int n = a.length(), m = b.length();
        int[] prev = new int[m + 1];
        int[] cur = new int[m + 1];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (a.charAt(i) == b.charAt(j)) cur[j + 1] = prev[j] + 1;
                else cur[j + 1] = Math.max(cur[j], prev[j + 1]);
            }
            int[] swap = prev;
            prev = cur;
            cur = swap;
        }
        System.out.println(prev[m]);`
    },
    solution: { explanation: ['lcs(i, j) = lcs(i - 1, j - 1) + 1 when the letters a[i] and b[j] are equal and max(lcs(i - 1, j), lcs(i, j - 1)) otherwise, computed row by row with two rows.'], complexity: 'Time O(|a| * |b|), space O(|b|).' },
    solve(input) {
      const [a, b] = rows(input); const t = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0)); for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]); return String(t[0][0]);
    },
    tests() {
      const g = rng(2042); const out = ['abcde\nace\n', 'abc\ndef\n', 'a\na\n', 'a\nb\n', 'abc\nabc\n'];
      const brute = (input) => { const [a, b] = rows(input); let best = 0; for (let mask = 0; mask < (1 << a.length); mask++) { let sub = ''; for (let i = 0; i < a.length; i++) if (mask >> i & 1) sub += a[i]; if (sub.length <= best) continue; let p = 0; for (const ch of b) if (p < sub.length && ch === sub[p]) p++; if (p === sub.length) best = sub.length; } return String(best); };
      crossCheck(() => twoWords(randWord(g, randInt(g, 1, 10), 'abc'), randWord(g, randInt(g, 1, 10), 'abc')), (i) => this.solve(i), brute, 300);
      for (const [n, m, al] of [[20, 25, 'ab'], [100, 100, 'abc'], [400, 300, 'abcd'], [800, 800, 'ab'], [1200, 1200, 'abcdefghijklmnopqrstuvwxyz'], [1200, 1200, 'ab'], [1200, 1200, 'abc'], [1, 1200, 'ab'], [1200, 1, 'ab'], [1200, 900, 'a']]) out.push(twoWords(randWord(g, n, al), randWord(g, m, al)));
      const base = randWord(g, 1200, 'abcdefgh'); out.push(twoWords(base, base), twoWords('a'.repeat(1200), 'a'.repeat(1200)), twoWords('a'.repeat(1200), 'b'.repeat(1200)), twoWords('ab'.repeat(600), 'ba'.repeat(600)), twoWords(base, base.split('').reverse().join('')));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the string `a`.', 'The second line has the string `b`.'],
    constraints: ['1 <= length of a, length of b <= 1000', 'Both strings consist of lowercase English letters.'],
    slug: 'edit-distance',
    title: 'The Fewest Edits to Turn One Word Into Another',
    tags: ['dp', 'edit-distance', 'string', 'two-strings'],
    concept: {
      title: 'Insert, delete or replace: the table over the prefixes has three neighbours',
      body: [
        'You may change a word with three kinds of edit, each costing 1: **insert** a letter, **delete** a letter, or **replace** a letter by another. What is the smallest number of edits that turns the word `a` into the word `b`? For `horse` and `ros` the answer is 3: `horse -> rorse` (replace h by r) `-> rose` (delete r) `-> ros` (delete e). This number is known as the *Levenshtein distance*.',
        'Let `dist(i, j)` be the smallest number of edits that turn the first `i` letters of `a` into the first `j` letters of `b`. Turning `i` letters into nothing needs `i` deletions, and turning nothing into `j` letters needs `j` insertions: `dist(i, 0) = i`, `dist(0, j) = j`. Otherwise look at the last letters. If `a[i] = b[j]`, nothing is needed for them: `dist(i, j) = dist(i - 1, j - 1)`. If they differ, take the cheapest of three edits: replace (`dist(i - 1, j - 1)`), delete `a[i]` (`dist(i - 1, j)`), insert `b[j]` (`dist(i, j - 1)`), and add 1: **`dist(i, j) = 1 + min of the three`**.',
        { code: 'prev = list(range(len(b) + 1))                   # dist(0, j) = j\nfor i in range(1, len(a) + 1):\n    cur = [i] + [0] * len(b)                     # dist(i, 0) = i\n    for j in range(1, len(b) + 1):\n        if a[i - 1] == b[j - 1]:\n            cur[j] = prev[j - 1]\n        else:\n            cur[j] = 1 + min(prev[j - 1], prev[j], cur[j - 1])\n    prev = cur\nprint(prev[len(b)])' },
        'The three neighbours of a cell are the cell above (a delete), the cell on the left (an insert) and the cell diagonally up-left (a replace or a match). With two rows the memory is O(|b|); the time is O(|a| * |b|) = one million steps at the limit. Spell checkers, DNA comparison and diff tools use this table.'
      ]
    },
    statement: ['Two words `a` and `b` are given. In one edit you may insert a letter anywhere, delete a letter, or replace a letter by another letter. Print the smallest number of edits that turns `a` into `b`.'],
    outputFormat: ['Print the smallest number of edits.'],
    examples: [{ input: 'horse\nros\n', note: 'Replace h by r, delete r, delete e: 3 edits.' }, { input: 'abc\nabc\n', note: 'The words are equal: 0.' }],
    hints: ['Let dist(i, j) be the answer for the first i letters of a and the first j letters of b; dist(i, 0) = i and dist(0, j) = j.', 'Equal last letters cost nothing: dist(i - 1, j - 1).', 'Different last letters: 1 + the smallest of the replace, delete and insert neighbours.'],
    program: {
      io: ['a:word', 'b:word'],
      fast: true,
      python: r`
        n = len(a)
        m = len(b)
        prev = list(range(m + 1))
        for i in range(1, n + 1):
            cur = [i] + [0] * m
            ai = a[i - 1]
            for j in range(1, m + 1):
                if ai == b[j - 1]:
                    cur[j] = prev[j - 1]
                else:
                    best = prev[j - 1]
                    if prev[j] < best:
                        best = prev[j]
                    if cur[j - 1] < best:
                        best = cur[j - 1]
                    cur[j] = best + 1
            prev = cur
        print(prev[m])`,
      cpp: r`
        int n = (int)a.size(), m = (int)b.size();
        vector<int> prev(m + 1), cur(m + 1);
        for (int j = 0; j <= m; j++) prev[j] = j;
        for (int i = 1; i <= n; i++) {
            cur[0] = i;
            for (int j = 1; j <= m; j++) {
                if (a[i - 1] == b[j - 1]) cur[j] = prev[j - 1];
                else cur[j] = 1 + min(prev[j - 1], min(prev[j], cur[j - 1]));
            }
            swap(prev, cur);
        }
        cout << prev[m] << "\n";`,
      java: r`
        int n = a.length(), m = b.length();
        int[] prev = new int[m + 1];
        int[] cur = new int[m + 1];
        for (int j = 0; j <= m; j++) prev[j] = j;
        for (int i = 1; i <= n; i++) {
            cur[0] = i;
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) cur[j] = prev[j - 1];
                else cur[j] = 1 + Math.min(prev[j - 1], Math.min(prev[j], cur[j - 1]));
            }
            int[] swap = prev;
            prev = cur;
            cur = swap;
        }
        System.out.println(prev[m]);`
    },
    solution: { explanation: ['dist(i, j) is the smallest number of edits turning the first i letters of a into the first j letters of b: dist(i, 0) = i, dist(0, j) = j, dist(i - 1, j - 1) for equal last letters and otherwise 1 + the smallest of dist(i - 1, j - 1) (replace), dist(i - 1, j) (delete) and dist(i, j - 1) (insert). Two rows are kept.'], complexity: 'Time O(|a| * |b|), space O(|b|).' },
    solve(input) {
      const [a, b] = rows(input); // the same distance, computed from the end of the words (suffixes) instead of the beginning
      const n = a.length, m = b.length; const t = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0)); for (let i = 0; i <= n; i++) t[i][m] = n - i; for (let j = 0; j <= m; j++) t[n][j] = m - j; for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] : 1 + Math.min(t[i + 1][j + 1], t[i + 1][j], t[i][j + 1]); return String(t[0][0]);
    },
    tests() {
      const g = rng(2043); const out = ['horse\nros\n', 'abc\nabc\n', 'a\nb\n', 'a\naaaa\n', 'intention\nexecution\n'];
      const brute = (input) => { const [a, b] = rows(input); // plain recursion without a table (tiny words only)
        const go = (i, j) => { if (i === a.length) return b.length - j; if (j === b.length) return a.length - i; if (a[i] === b[j]) return go(i + 1, j + 1); return 1 + Math.min(go(i + 1, j + 1), go(i + 1, j), go(i, j + 1)); }; return String(go(0, 0)); };
      crossCheck(() => twoWords(randWord(g, randInt(g, 1, 5), 'abc'), randWord(g, randInt(g, 1, 5), 'abc')), (i) => this.solve(i), brute, 120);
      for (const [n, m, al] of [[20, 25, 'ab'], [100, 100, 'abc'], [400, 300, 'abcd'], [700, 700, 'ab'], [1000, 1000, 'abcdefghijklmnopqrstuvwxyz'], [1000, 1000, 'ab'], [1000, 1000, 'abc'], [1, 1000, 'ab'], [1000, 1, 'ab'], [1000, 800, 'a']]) out.push(twoWords(randWord(g, n, al), randWord(g, m, al)));
      const base = randWord(g, 1000, 'abcdefgh'); const edited = base.split('').map((c) => (g() < 0.05 ? 'z' : c)).join(''); out.push(twoWords(base, base), twoWords(base, edited), twoWords('a'.repeat(1000), 'b'.repeat(1000)), twoWords('ab'.repeat(500), 'ba'.repeat(500)), twoWords(base, base.slice(1) + 'q'));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the string `s`.'],
    constraints: ['1 <= length of s <= 1200', 'The string consists of lowercase English letters.'],
    slug: 'longest-palindromic-subsequence',
    title: 'The Longest Palindrome Hidden in a Word',
    tags: ['dp', 'interval-dp', 'palindrome', 'string'],
    concept: {
      title: 'A table over intervals: look at the two end letters of a piece of the word',
      body: [
        'A *palindrome* reads the same forwards and backwards. Find the length of the **longest palindromic subsequence** of a word: the longest palindrome you can get by deleting some letters and keeping the order of the rest. For `bbbab` it is 4 (`bbbb`); for `cbbd` it is 2 (`bb`).',
        'Define the DP over **pieces** (intervals) of the word. Let `pal(i, j)` be the answer for the piece from the position `i` to the position `j`. A single letter is a palindrome: `pal(i, i) = 1`. For a longer piece compare the two end letters. If `s[i] = s[j]`, both can be the ends of the palindrome, and inside them we want the best palindrome of the piece `i + 1 .. j - 1`: **`pal(i, j) = pal(i + 1, j - 1) + 2`**. If the end letters differ, one of them is not used: **`pal(i, j) = max(pal(i + 1, j), pal(i, j - 1))`**. (An empty piece has the value 0.)',
        { code: 'n = len(s)\npal = [[0] * n for _ in range(n)]\nfor i in range(n - 1, -1, -1):               # i goes down so that the row i + 1 is ready\n    pal[i][i] = 1\n    for j in range(i + 1, n):\n        if s[i] == s[j]:\n            pal[i][j] = pal[i + 1][j - 1] + 2\n        else:\n            pal[i][j] = max(pal[i + 1][j], pal[i][j - 1])\nprint(pal[0][n - 1])' },
        'The order of filling matters: a cell needs cells with a **smaller piece** (a shorter interval), so we go from the bottom row up and from left to right. This is *interval DP*, used whenever the answer for a piece depends on shorter pieces inside it. The time is O(n^2) and the memory O(n^2); for `n = 1200` that is about 700 000 cells.'
      ]
    },
    statement: ['A word `s` is given. Print the length of its longest palindromic subsequence: the longest palindrome that can be obtained by deleting some letters of `s` (the order of the remaining letters is kept).'],
    outputFormat: ['Print the length of the longest palindromic subsequence.'],
    examples: [{ input: 'bbbab\n', note: 'The subsequence bbbb: 4.' }, { input: 'cbbd\n', note: 'The subsequence bb: 2.' }],
    hints: ['Let pal(i, j) be the answer for the piece of the word from i to j; pal(i, i) = 1.', 'If s[i] = s[j] then pal(i, j) = pal(i + 1, j - 1) + 2; otherwise take the larger of pal(i + 1, j) and pal(i, j - 1).', 'Fill the table with i going downwards.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        n = len(s)
        pal = [[0] * (n + 1) for _ in range(n + 1)]
        for i in range(n - 1, -1, -1):
            row = pal[i]
            below = pal[i + 1]
            row[i] = 1
            for j in range(i + 1, n):
                if s[i] == s[j]:
                    row[j] = below[j - 1] + 2
                else:
                    row[j] = below[j] if below[j] > row[j - 1] else row[j - 1]
        print(pal[0][n - 1])`,
      cpp: r`
        int n = (int)s.size();
        vector<vector<int>> pal(n + 1, vector<int>(n + 1, 0));
        for (int i = n - 1; i >= 0; i--) {
            pal[i][i] = 1;
            for (int j = i + 1; j < n; j++) {
                if (s[i] == s[j]) pal[i][j] = pal[i + 1][j - 1] + 2;
                else pal[i][j] = max(pal[i + 1][j], pal[i][j - 1]);
            }
        }
        cout << pal[0][n - 1] << "\n";`,
      java: r`
        int n = s.length();
        int[][] pal = new int[n + 1][n + 1];
        for (int i = n - 1; i >= 0; i--) {
            pal[i][i] = 1;
            for (int j = i + 1; j < n; j++) {
                if (s.charAt(i) == s.charAt(j)) pal[i][j] = pal[i + 1][j - 1] + 2;
                else pal[i][j] = Math.max(pal[i + 1][j], pal[i][j - 1]);
            }
        }
        System.out.println(pal[0][n - 1]);`
    },
    solution: { explanation: ['pal(i, j), the longest palindromic subsequence of the piece i..j, is pal(i + 1, j - 1) + 2 when the end letters are equal and max(pal(i + 1, j), pal(i, j - 1)) otherwise, with pal(i, i) = 1; the table is filled with i going down.'], complexity: 'Time O(n^2), space O(n^2).' },
    solve(input) {
      const s = rows(input)[0]; const rev = [...s].reverse().join(''); const n = s.length; // the longest palindromic subsequence is the longest common subsequence of the word and its reverse
      let prev = new Array(n + 1).fill(0); for (let i = 0; i < n; i++) { const cur = new Array(n + 1).fill(0); for (let j = 0; j < n; j++) cur[j + 1] = s[i] === rev[j] ? prev[j] + 1 : Math.max(cur[j], prev[j + 1]); prev = cur; } return String(prev[n]);
    },
    tests() {
      const g = rng(2044); const out = ['bbbab\n', 'cbbd\n', 'a\n', 'ab\n', 'aa\n'];
      const brute = (input) => { const s = rows(input)[0]; let best = 0; for (let mask = 1; mask < (1 << s.length); mask++) { let sub = ''; for (let i = 0; i < s.length; i++) if (mask >> i & 1) sub += s[i]; if (sub.length > best && sub === [...sub].reverse().join('')) best = sub.length; } return String(best); };
      crossCheck(() => randWord(g, randInt(g, 1, 12), 'abc') + '\n', (i) => this.solve(i), brute, 300);
      for (const [n, al] of [[20, 'ab'], [100, 'abc'], [400, 'abcd'], [800, 'ab'], [1200, 'abcdefghijklmnopqrstuvwxyz'], [1200, 'ab'], [1200, 'abc'], [1199, 'abcde']]) out.push(randWord(g, n, al) + '\n');
      out.push('a'.repeat(1200) + '\n', 'ab'.repeat(600) + '\n', randWord(g, 600, 'abcdefgh') + '\n'.repeat(1), (() => { const half = randWord(g, 600, 'abcdefgh'); return half + [...half].reverse().join('') + '\n'; })(), 'abcdefghijklmnopqrstuvwxyz'.repeat(46) + '\n');
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the string `s`.', 'The second line has the string `t`.'],
    constraints: ['1 <= length of s <= 2000', '1 <= length of t <= 500', 'Both strings consist of lowercase English letters.'],
    slug: 'count-subsequence-occurrences',
    title: 'How Many Times Is the Word Hidden Inside the Text?',
    tags: ['dp', 'counting', 'subsequence', 'string'],
    concept: {
      title: 'Count the ways to build each prefix of the word, letter by letter of the text',
      body: [
        'In how many ways can the word `t` be obtained from the text `s` by deleting some letters of `s`? Two ways are different if the sets of **positions** kept in `s` are different, even when the resulting letters are the same. For `s = rabbbit` and `t = rabbit` the answer is 3: there are three `b` letters in `s`, and any two of them can be the two `b` letters of `t`. Print the answer modulo 1 000 000 007.',
        'Let `ways(j)` be the number of ways to build the **first `j` letters of `t`** from the part of the text read so far; `ways(0) = 1` (the empty word can be built in one way). Read the text letter by letter. A letter `c = s[i]` can serve as the last letter of the prefix `j` if `t[j] = c`, and then the earlier letters must form the prefix `j - 1` from what was read before: add `ways(j - 1)` to `ways(j)`. Update `j` from the **largest to the smallest**, so that the letter `c` is not used twice in one step.',
        { code: 'ways = [1] + [0] * m                         # ways[j]: ways to build t[:j]\nfor ch in s:\n    for j in range(m, 0, -1):                # downwards: one text letter, one use\n        if t[j - 1] == ch:\n            ways[j] = (ways[j] + ways[j - 1]) % MOD\nprint(ways[m])' },
        'The structure is the same as the 0/1 knapsack: every text letter is an "item" that is used at most once. The time is O(|s| * |t|), at most one million steps here, and the memory O(|t|). Counting subsequences by "how many ways for each prefix of the pattern" also solves many harder counting problems.'
      ]
    },
    statement: ['Two words `s` and `t` are given. Count the ways to choose positions in `s` such that the letters at these positions, read from left to right, form `t`. Ways with different sets of positions are different. Print the count modulo 1000000007.'],
    outputFormat: ['Print the number of ways modulo 1000000007.'],
    examples: [{ input: 'rabbbit\nrabbit\n', note: 'Any two of the three letters b can be used: 3 ways.' }, { input: 'abc\nd\n', note: 'The letter d is missing: 0.' }],
    hints: ['Let ways(j) be the number of ways to build the first j letters of t from the text read so far.', 'A text letter equal to t[j] adds ways(j - 1) to ways(j).', 'Go through j from the largest to the smallest so that a letter is used only once.'],
    program: {
      io: ['s:word', 't:word'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        m = len(t)
        ways = [1] + [0] * m
        for ch in s:
            for j in range(m, 0, -1):
                if t[j - 1] == ch:
                    ways[j] = (ways[j] + ways[j - 1]) % MOD
        print(ways[m])`,
      cpp: r`
        const long long MOD = 1000000007;
        int m = (int)t.size();
        vector<long long> ways(m + 1, 0);
        ways[0] = 1;
        for (char ch : s) {
            for (int j = m; j >= 1; j--) {
                if (t[j - 1] == ch) ways[j] = (ways[j] + ways[j - 1]) % MOD;
            }
        }
        cout << ways[m] << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int m = t.length();
        long[] ways = new long[m + 1];
        ways[0] = 1;
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            for (int j = m; j >= 1; j--) {
                if (t.charAt(j - 1) == ch) ways[j] = (ways[j] + ways[j - 1]) % MOD;
            }
        }
        System.out.println(ways[m]);`
    },
    solution: { explanation: ['ways(j) is the number of ways to build the first j letters of t from the text read so far; every text letter equal to t[j] adds ways(j - 1) to ways(j), with j going downwards so that each letter is used once. The answer is ways(|t|).'], complexity: 'Time O(|s| * |t|), space O(|t|).' },
    solve(input) {
      const [s, t] = rows(input); const n = s.length, m = t.length; // a full table over the prefixes of both words
      const T = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0)); for (let i = 0; i <= n; i++) T[i][0] = 1; for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) T[i][j] = (T[i - 1][j] + (s[i - 1] === t[j - 1] ? T[i - 1][j - 1] : 0)) % MOD; return String(T[n][m]);
    },
    tests() {
      const g = rng(2045); const out = ['rabbbit\nrabbit\n', 'abc\nd\n', 'a\na\n', 'aaa\na\n', 'aaa\naaaa\n'];
      const brute = (input) => { const [s, t] = rows(input); let count = 0; const go = (i, j) => { if (j === t.length) { count++; return; } if (i === s.length) return; if (s[i] === t[j]) go(i + 1, j + 1); go(i + 1, j); }; go(0, 0); return String(count % MOD); };
      crossCheck(() => twoWords(randWord(g, randInt(g, 1, 12), 'ab'), randWord(g, randInt(g, 1, 4), 'ab')), (i) => this.solve(i), brute, 300);
      for (const [n, m, al] of [[20, 5, 'ab'], [100, 20, 'abc'], [500, 100, 'ab'], [2000, 500, 'ab'], [2000, 500, 'abcdefghijklmnopqrstuvwxyz'], [2000, 300, 'abc'], [2000, 1, 'a'], [1, 1, 'a'], [2000, 100, 'abcd']]) out.push(twoWords(randWord(g, n, al), randWord(g, m, al)));
      out.push(twoWords('a'.repeat(2000), 'a'.repeat(500)), twoWords('a'.repeat(2000), 'a'.repeat(1)), twoWords('ab'.repeat(1000), 'ab'.repeat(250)), twoWords('a'.repeat(1000) + 'b'.repeat(1000), 'a'.repeat(250) + 'b'.repeat(250)), twoWords('a'.repeat(2000), 'b'));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 2000', '1 <= each number <= 10^6'],
    slug: 'maximum-sum-rising-subsequence',
    title: 'The Rising Subsequence With the Biggest Sum',
    tags: ['dp', 'subsequence', 'lis-variant'],
    concept: {
      title: 'Same table as for the longest rising subsequence, but add the values instead of counting',
      body: [
        'Among all **strictly increasing subsequences** of a list of positive numbers, find the one whose **sum** is the largest, and print that sum. For `1 101 2 3 100 4 5` the best is `1 + 2 + 3 + 100 = 106`. The longest rising subsequence (`1 2 3 4 5`, sum 15) is not the heaviest one, so the length is not the right thing to track.',
        'Let `best(i)` be the largest sum of a strictly increasing subsequence that **ends** with the number at the position `i`. It consists of the number itself and, optionally, the best earlier subsequence that ends with a **smaller** value: **`best(i) = a[i] + max(0, best(j) over the positions j < i with a[j] < a[i])`**. The answer is the largest `best(i)`. This is exactly the O(n^2) DP of the longest increasing subsequence, with "the length plus one" replaced by "the sum plus `a[i]`".',
        { code: 'best = a[:]                               # every number alone is a subsequence\nfor i in range(n):\n    for j in range(i):\n        if a[j] < a[i] and best[j] + a[i] > best[i]:\n            best[i] = best[j] + a[i]\nprint(max(best))' },
        'The double loop makes 2 million comparisons at the limit, which is fine. (For much bigger inputs one would answer "the best `best(j)` among values smaller than `a[i]`" with a Fenwick tree in O(log n), which is a topic of its own.) The pattern "the best chain that ends at `i`" works for any chain with an order, and with any weight that can be added.'
      ]
    },
    statement: ['A list of `n` positive integers is given. Among all strictly increasing subsequences, find the one with the largest sum and print that sum.'],
    outputFormat: ['Print the largest sum.'],
    examples: [{ input: '7\n1 101 2 3 100 4 5\n', note: 'The subsequence 1, 2, 3, 100 has the sum 106.' }, { input: '4\n3 2 1 1\n', note: 'No two numbers are in rising order; the best is the single number 3.' }],
    hints: ['Let best(i) be the largest sum of a rising subsequence that ends at the position i.', 'It is a[i] plus the best earlier value best(j) among the positions with a[j] < a[i] (or nothing).', 'The answer is the largest best(i).'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        best = a[:]
        for i in range(n):
            ai = a[i]
            top = ai
            for j in range(i):
                if a[j] < ai and best[j] + ai > top:
                    top = best[j] + ai
            best[i] = top
        print(max(best))`,
      cpp: r`
        vector<long long> best = a;
        long long answer = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (a[j] < a[i] && best[j] + a[i] > best[i]) best[i] = best[j] + a[i];
            }
            answer = max(answer, best[i]);
        }
        cout << answer << "\n";`,
      java: r`
        long[] best = a.clone();
        long answer = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (a[j] < a[i] && best[j] + a[i] > best[i]) best[i] = best[j] + a[i];
            }
            answer = Math.max(answer, best[i]);
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['best(i) is the largest sum of a strictly increasing subsequence that ends at the position i: a[i] plus the largest best(j) over the earlier positions with a smaller value. The answer is the largest best(i).'], complexity: 'Time O(n^2), space O(n).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; // process the numbers in increasing value order, a position can only follow positions already processed with a smaller value (equal values are handled together)
      const order = a.map((v, i) => i).sort((p, q) => a[p] - a[q] || p - q); const best = new Array(n).fill(0); let answer = 0; let k = 0; while (k < n) { let e = k; while (e < n && a[order[e]] === a[order[k]]) e++; for (let t = k; t < e; t++) { const i = order[t]; let top = 0; for (let u = 0; u < k; u++) { const j = order[u]; if (j < i) top = Math.max(top, best[j]); } best[i] = a[i] + top; answer = Math.max(answer, best[i]); } k = e; } return String(answer);
    },
    tests() {
      const g = rng(2046); const out = ['7\n1 101 2 3 100 4 5\n', '4\n3 2 1 1\n', '1\n9\n', '3\n1 2 3\n'];
      const brute = (input) => { const a = arrOf(input); let best = 0; for (let mask = 1; mask < (1 << a.length); mask++) { let prev = 0, sum = 0, ok = true; for (let i = 0; i < a.length; i++) if (mask >> i & 1) { if (a[i] <= prev) { ok = false; break; } prev = a[i]; sum += a[i]; } if (ok) best = Math.max(best, sum); } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 12); return list(n, randArray(g, n, 1, 20)); }, (i) => this.solve(i), brute, 400);
      for (const [n, hi] of [[10, 20], [100, 1000], [500, 1000000], [1000, 1000000], [2000, 1000000], [2000, 100], [2000, 5], [2000, 1000000]]) out.push(list(n, randArray(g, n, 1, hi)));
      out.push(list(2000, many(2000, (i) => i + 1)), list(2000, many(2000, (i) => 2000 - i)), list(2000, new Array(2000).fill(1000000)), list(2000, many(2000, (i) => (i % 2 ? 1000000 - i : i + 1))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 1000', '0 <= each number <= 500'],
    slug: 'longest-arithmetic-subsequence',
    title: 'The Longest Subsequence With a Constant Step',
    tags: ['dp', 'subsequence', 'arithmetic-progression', 'two-dimensional'],
    concept: {
      title: 'The state is (last position, common difference)',
      body: [
        'Choose some numbers from a list, keeping their order, so that the chosen numbers form an **arithmetic progression** (the difference between neighbours is the same everywhere). What is the largest number of chosen numbers? For `3 6 9 12` it is 4. For `9 4 7 2 10` it is 3 (`4 7 10` with the step 3). Unlike in the stretches problem, the numbers need **not** be next to each other.',
        'The last chosen number alone does not tell what the next one can be, but the last number together with the **common difference** does. Let `best(j, d)` be the length of the longest arithmetic subsequence that ends at the position `j` and has the step `d`. A subsequence ending at `j` with the step `d` came from some earlier position `i` with `a[i] = a[j] - d`: if there is a subsequence ending at `i` with the same step, we extend it, **`best(j, d) = best(i, d) + 1`**; otherwise `(i, j)` is a new pair of length 2. The difference is between -500 and 500, so there are at most 1001 steps.',
        { code: 'best = [[0] * 1001 for _ in range(n)]        # best[j][d + 500]: 0 means "no pair with this step yet"\nanswer = 1\nfor j in range(n):\n    for i in range(j):\n        d = a[j] - a[i] + 500\n        best[j][d] = max(best[j][d], best[i][d] + 1 if best[i][d] else 2)\n        answer = max(answer, best[j][d])\nprint(answer)' },
        'Every pair `(i, j)` is looked at once, so the time is O(n^2), about half a million steps, and the memory O(n * 1001). A single number is an arithmetic progression of length 1, so the answer is at least 1. When values are small, an array indexed by the difference is simpler and faster than a hash table.'
      ]
    },
    statement: ['A list of `n` integers is given. Print the length of the longest subsequence (numbers keep their order, but need not be neighbours) in which the difference between every two neighbouring chosen numbers is the same.'],
    outputFormat: ['Print the length of the longest arithmetic subsequence.'],
    examples: [{ input: '4\n3 6 9 12\n', note: 'All four numbers have the step 3: 4.' }, { input: '5\n9 4 7 2 10\n', note: 'The numbers 4, 7, 10 have the step 3: 3.' }],
    hints: ['A subsequence is described by its last position and its common difference.', 'For a pair (i, j), i < j, the difference is a[j] - a[i]; extend the best subsequence that ends at i with the same difference, if any.', 'Index the differences with an offset of 500 in an array.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        best = [[0] * 1001 for _ in range(n)]
        answer = 1
        for j in range(n):
            row = best[j]
            aj = a[j]
            for i in range(j):
                d = aj - a[i] + 500
                length = best[i][d] + 1 if best[i][d] else 2
                if length > row[d]:
                    row[d] = length
                    if length > answer:
                        answer = length
        print(answer)`,
      cpp: r`
        vector<vector<int>> best(n, vector<int>(1001, 0));
        int answer = 1;
        for (int j = 0; j < n; j++) {
            for (int i = 0; i < j; i++) {
                int d = (int)(a[j] - a[i] + 500);
                int length = best[i][d] ? best[i][d] + 1 : 2;
                if (length > best[j][d]) {
                    best[j][d] = length;
                    if (length > answer) answer = length;
                }
            }
        }
        cout << answer << "\n";`,
      java: r`
        int[][] best = new int[(int) n][1001];
        int answer = 1;
        for (int j = 0; j < n; j++) {
            for (int i = 0; i < j; i++) {
                int d = (int) (a[j] - a[i] + 500);
                int length = best[i][d] > 0 ? best[i][d] + 1 : 2;
                if (length > best[j][d]) {
                    best[j][d] = length;
                    if (length > answer) answer = length;
                }
            }
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['best(j, d) is the length of the longest arithmetic subsequence ending at the position j with the step d; for each pair i < j with d = a[j] - a[i] it is best(i, d) + 1 if that exists and 2 otherwise. The answer is the largest value (at least 1).'], complexity: 'Time O(n^2), space O(n * range of values).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; let answer = Math.min(n, 1);
      if (n > 300) { const dp = a.map(() => new Map()); for (let j = 0; j < n; j++) for (let i = 0; i < j; i++) { const d = a[j] - a[i]; const len = (dp[i].get(d) || 1) + 1; if (len > (dp[j].get(d) || 0)) dp[j].set(d, len); answer = Math.max(answer, len); } return String(answer); } // a hash map per position
      // small lists: for every pair as the first two chosen numbers follow the progression greedily to the right (the first match of the next value is optimal)
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const d = a[j] - a[i]; let len = 2, last = a[j]; for (let k = j + 1; k < n; k++) if (a[k] === last + d) { len++; last = a[k]; } answer = Math.max(answer, len); } return String(Math.max(answer, n >= 2 ? 2 : 1));
    },
    tests() {
      const g = rng(2047); const out = ['4\n3 6 9 12\n', '5\n9 4 7 2 10\n', '1\n5\n', '2\n1 500\n', '3\n7 7 7\n'];
      const brute = (input) => { const a = arrOf(input); let best = 1; for (let mask = 1; mask < (1 << a.length); mask++) { const sub = []; for (let i = 0; i < a.length; i++) if (mask >> i & 1) sub.push(a[i]); let ok = true; for (let i = 2; i < sub.length; i++) if (sub[i] - sub[i - 1] !== sub[1] - sub[0]) { ok = false; break; } if (ok) best = Math.max(best, sub.length); } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 11); return list(n, randArray(g, n, 0, 8)); }, (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[10, 20], [100, 50], [300, 500], [1000, 500], [1000, 50], [1000, 5], [1000, 500], [999, 100]]) out.push(list(n, randArray(g, n, 0, hi)));
      out.push(list(1000, many(1000, (i) => i % 501)), list(1000, new Array(1000).fill(250)), list(1000, many(1000, (i) => (i * 7) % 500)), list(1000, many(1000, (i) => (i % 2 ? 500 : 0))), list(1000, many(1000, (i) => Math.floor(i / 2))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 2000', '-10^9 <= each number <= 10^9'],
    slug: 'longest-rise-then-fall',
    title: 'The Longest Subsequence That Rises and Then Falls',
    tags: ['dp', 'subsequence', 'bitonic', 'lis-variant'],
    concept: {
      title: 'Combine two tables: the longest rise ending at each place and the longest fall starting at each place',
      body: [
        'Pick some numbers of a list, in their order, so that they first **strictly increase** and then **strictly decrease** (like a mountain; either part may be just the top number, so a purely rising or purely falling subsequence also counts). Find the largest number of chosen numbers. For `1 11 2 10 4 5 2 1` the best is `1 2 10 4 2 1` (length 6).',
        'Split the subsequence at its **peak**. For each position `p`, a subsequence with the peak at `p` is a rising part that **ends** at `p` and a falling part that **starts** at `p`, sharing the number `a[p]`. Compute two tables with the quadratic LIS idea: `up(p)`, the longest strictly rising subsequence ending at `p`, and `down(p)`, the longest strictly falling subsequence starting at `p`. Then the best subsequence with the peak at `p` has the length **`up(p) + down(p) - 1`**, and the answer is the maximum over all `p`.',
        { code: 'up = [1] * n\nfor i in range(n):\n    for j in range(i):\n        if a[j] < a[i] and up[j] + 1 > up[i]: up[i] = up[j] + 1\ndown = [1] * n\nfor i in range(n - 1, -1, -1):                 # the same from the right\n    for j in range(i + 1, n):\n        if a[j] < a[i] and down[j] + 1 > down[i]: down[i] = down[j] + 1\nprint(max(up[p] + down[p] - 1 for p in range(n)))' },
        'The second table is the first one read from the right: a falling subsequence starting at `p` is a rising subsequence ending at `p` in the reversed list. Splitting a shape at its special point and solving the two halves independently is useful for many "up then down" problems. The time is O(n^2) (4 million steps at most) and the memory O(n).'
      ]
    },
    statement: ['A list of `n` integers is given. Choose a subsequence (keeping the order) that is strictly increasing up to some element and strictly decreasing after it; either part can be empty. Print the largest possible length.'],
    outputFormat: ['Print the length of the longest such subsequence.'],
    examples: [{ input: '8\n1 11 2 10 4 5 2 1\n', note: 'The subsequence 1, 2, 10, 4, 2, 1 rises to 10 and then falls: 6.' }, { input: '3\n5 5 5\n', note: 'Equal numbers cannot be strict: 1.' }],
    hints: ['Fix the peak p of the subsequence.', 'Compute up(p), the longest rising subsequence ending at p, and down(p), the longest falling subsequence starting at p.', 'The answer is the largest up(p) + down(p) - 1.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        up = [1] * n
        for i in range(n):
            for j in range(i):
                if a[j] < a[i] and up[j] + 1 > up[i]:
                    up[i] = up[j] + 1
        down = [1] * n
        for i in range(n - 1, -1, -1):
            for j in range(i + 1, n):
                if a[j] < a[i] and down[j] + 1 > down[i]:
                    down[i] = down[j] + 1
        print(max(up[p] + down[p] - 1 for p in range(n)))`,
      cpp: r`
        vector<int> up(n, 1), down(n, 1);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (a[j] < a[i] && up[j] + 1 > up[i]) up[i] = up[j] + 1;
            }
        }
        for (int i = (int)n - 1; i >= 0; i--) {
            for (int j = i + 1; j < n; j++) {
                if (a[j] < a[i] && down[j] + 1 > down[i]) down[i] = down[j] + 1;
            }
        }
        int answer = 0;
        for (int p = 0; p < n; p++) answer = max(answer, up[p] + down[p] - 1);
        cout << answer << "\n";`,
      java: r`
        int[] up = new int[(int) n];
        int[] down = new int[(int) n];
        Arrays.fill(up, 1);
        Arrays.fill(down, 1);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (a[j] < a[i] && up[j] + 1 > up[i]) up[i] = up[j] + 1;
            }
        }
        for (int i = (int) n - 1; i >= 0; i--) {
            for (int j = i + 1; j < n; j++) {
                if (a[j] < a[i] && down[j] + 1 > down[i]) down[i] = down[j] + 1;
            }
        }
        int answer = 0;
        for (int p = 0; p < n; p++) answer = Math.max(answer, up[p] + down[p] - 1);
        System.out.println(answer);`
    },
    solution: { explanation: ['up(p) is the longest strictly rising subsequence ending at p and down(p) the longest strictly falling subsequence starting at p (both by the quadratic LIS table); a subsequence with the peak p has the length up(p) + down(p) - 1, and the answer is the largest of these.'], complexity: 'Time O(n^2), space O(n).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; // the same peak idea with the O(n log n) rising lengths (binary search on the tails) from the left and from the right
      const lens = (arr) => { const res = []; const tails = []; for (const x of arr) { let lo = 0, hi = tails.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (tails[mid] >= x) hi = mid; else lo = mid + 1; } tails[lo] = x; res.push(lo + 1); } return res; };
      const up = lens(a); const down = lens([...a].reverse()).reverse(); let best = 0; for (let p = 0; p < n; p++) best = Math.max(best, up[p] + down[p] - 1); return String(best);
    },
    tests() {
      const g = rng(2048); const out = ['8\n1 11 2 10 4 5 2 1\n', '3\n5 5 5\n', '1\n7\n', '5\n1 2 3 4 5\n', '5\n5 4 3 2 1\n'];
      const brute = (input) => { const a = arrOf(input); let best = 0; for (let mask = 1; mask < (1 << a.length); mask++) { const sub = []; for (let i = 0; i < a.length; i++) if (mask >> i & 1) sub.push(a[i]); let i = 0; while (i + 1 < sub.length && sub[i + 1] > sub[i]) i++; while (i + 1 < sub.length && sub[i + 1] < sub[i]) i++; if (i === sub.length - 1) best = Math.max(best, sub.length); } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 12); return list(n, randArray(g, n, -5, 5)); }, (i) => this.solve(i), brute, 400);
      for (const [n, lo, hi] of [[10, -10, 10], [100, -1000, 1000], [500, -1000000000, 1000000000], [2000, -1000000000, 1000000000], [2000, 0, 5], [2000, 0, 100], [2000, -1000000, 1000000], [1999, 0, 2000]]) out.push(list(n, randArray(g, n, lo, hi)));
      out.push(list(2000, many(2000, (i) => (i < 1000 ? i : 2000 - i))), list(2000, many(2000, (i) => i)), list(2000, many(2000, (i) => 2000 - i)), list(2000, new Array(2000).fill(3)), list(2000, many(2000, (i) => (i % 2 ? 1000 - i : i))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has three words `x`, `y` and `z`, separated by spaces.'],
    constraints: ['1 <= length of each word <= 80', 'All words consist of lowercase English letters.'],
    slug: 'common-subsequence-of-three',
    title: 'The Longest Subsequence Shared by Three Words',
    tags: ['dp', 'lcs', 'three-dimensional', 'string'],
    concept: {
      title: 'The LCS table gets a third dimension',
      body: [
        'Three words are given. Find the length of the **longest common subsequence of all three** words: the longest word that can be obtained from each of them by deleting some letters. For `abcde`, `aebdc` and `abxce` the answer is 3 (the word `abc`).',
        'The two-word table had cells `lcs(i, j)`, one index for each word. With three words use three indices: let `lcs(i, j, k)` be the answer for the first `i` letters of `x`, the first `j` letters of `y` and the first `k` letters of `z`. If the three last letters are **all equal**, they can be used together: `lcs(i, j, k) = lcs(i - 1, j - 1, k - 1) + 1`. Otherwise at least one of the last letters is unused, so we take the **best of the three possibilities** of dropping one: `max(lcs(i - 1, j, k), lcs(i, j - 1, k), lcs(i, j, k - 1))`.',
        { code: 'dp = [[[0] * (lz + 1) for _ in range(ly + 1)] for _ in range(lx + 1)]\nfor i in range(1, lx + 1):\n    for j in range(1, ly + 1):\n        for k in range(1, lz + 1):\n            if x[i - 1] == y[j - 1] == z[k - 1]:\n                dp[i][j][k] = dp[i - 1][j - 1][k - 1] + 1\n            else:\n                dp[i][j][k] = max(dp[i - 1][j][k], dp[i][j - 1][k], dp[i][j][k - 1])\nprint(dp[lx][ly][lz])' },
        'Each extra word multiplies the size of the table by the length of that word, so with three words of length 80 the table has about 500 000 cells. For many words the method is too slow (the problem is hard in general). Note that "all three letters equal" is the only case that adds 1, even if two of the three letters are equal.'
      ]
    },
    statement: ['Three words `x`, `y` and `z` are given. Print the length of the longest word that is a subsequence of all three of them.'],
    outputFormat: ['Print the length of the longest common subsequence of the three words.'],
    examples: [{ input: 'abcde aebdc abxce\n', note: 'The word abc can be obtained from all three words: 3.' }, { input: 'abc def ghi\n', note: 'No common letter: 0.' }],
    hints: ['Use a table with three indices, one per word.', 'If the last letters of all three prefixes are equal, add 1 to the diagonal cell.', 'Otherwise take the largest of the three cells where one prefix is one letter shorter.'],
    program: {
      io: ['x:word y:word z:word'],
      fast: true,
      python: r`
        lx, ly, lz = len(x), len(y), len(z)
        dp = [[[0] * (lz + 1) for _ in range(ly + 1)] for _ in range(lx + 1)]
        for i in range(1, lx + 1):
            for j in range(1, ly + 1):
                for k in range(1, lz + 1):
                    if x[i - 1] == y[j - 1] == z[k - 1]:
                        dp[i][j][k] = dp[i - 1][j - 1][k - 1] + 1
                    else:
                        dp[i][j][k] = max(dp[i - 1][j][k], dp[i][j - 1][k], dp[i][j][k - 1])
        print(dp[lx][ly][lz])`,
      cpp: r`
        int lx = (int)x.size(), ly = (int)y.size(), lz = (int)z.size();
        vector<vector<vector<int>>> dp(lx + 1, vector<vector<int>>(ly + 1, vector<int>(lz + 1, 0)));
        for (int i = 1; i <= lx; i++) {
            for (int j = 1; j <= ly; j++) {
                for (int k = 1; k <= lz; k++) {
                    if (x[i - 1] == y[j - 1] && y[j - 1] == z[k - 1]) dp[i][j][k] = dp[i - 1][j - 1][k - 1] + 1;
                    else dp[i][j][k] = max(dp[i - 1][j][k], max(dp[i][j - 1][k], dp[i][j][k - 1]));
                }
            }
        }
        cout << dp[lx][ly][lz] << "\n";`,
      java: r`
        int lx = x.length(), ly = y.length(), lz = z.length();
        int[][][] dp = new int[lx + 1][ly + 1][lz + 1];
        for (int i = 1; i <= lx; i++) {
            for (int j = 1; j <= ly; j++) {
                for (int k = 1; k <= lz; k++) {
                    if (x.charAt(i - 1) == y.charAt(j - 1) && y.charAt(j - 1) == z.charAt(k - 1)) dp[i][j][k] = dp[i - 1][j - 1][k - 1] + 1;
                    else dp[i][j][k] = Math.max(dp[i - 1][j][k], Math.max(dp[i][j - 1][k], dp[i][j][k - 1]));
                }
            }
        }
        System.out.println(dp[lx][ly][lz]);`
    },
    solution: { explanation: ['lcs(i, j, k) for the prefixes of the three words is lcs(i - 1, j - 1, k - 1) + 1 when the three last letters are equal and the largest of lcs(i - 1, j, k), lcs(i, j - 1, k), lcs(i, j, k - 1) otherwise.'], complexity: 'Time O(|x| * |y| * |z|), space O(|x| * |y| * |z|).' },
    solve(input) {
      const [x, y, z] = rows(input)[0].split(' '); // the intersection of the common subsequences of pairs: the longest of three is found by trying the subsequences of the shortest word, longest first (small words); for longer words the table is used
      const t = Array.from({ length: x.length + 1 }, () => Array.from({ length: y.length + 1 }, () => new Array(z.length + 1).fill(0))); for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) for (let k = z.length - 1; k >= 0; k--) t[i][j][k] = x[i] === y[j] && y[j] === z[k] ? t[i + 1][j + 1][k + 1] + 1 : Math.max(t[i + 1][j][k], t[i][j + 1][k], t[i][j][k + 1]); return String(t[0][0][0]);
    },
    tests() {
      const g = rng(2049); const out = ['abcde aebdc abxce\n', 'abc def ghi\n', 'a a a\n', 'a b c\n', 'abc abc abc\n'];
      const isSub = (sub, w) => { let p = 0; for (const c of w) if (p < sub.length && c === sub[p]) p++; return p === sub.length; };
      const brute = (input) => { const [x, y, z] = rows(input)[0].split(' '); let best = 0; for (let mask = 1; mask < (1 << x.length); mask++) { let sub = ''; for (let i = 0; i < x.length; i++) if (mask >> i & 1) sub += x[i]; if (sub.length > best && isSub(sub, y) && isSub(sub, z)) best = sub.length; } return String(best); };
      crossCheck(() => `${randWord(g, randInt(g, 1, 9), 'abc')} ${randWord(g, randInt(g, 1, 9), 'abc')} ${randWord(g, randInt(g, 1, 9), 'abc')}\n`, (i) => this.solve(i), brute, 300);
      for (const [a, b, c, al] of [[10, 12, 9, 'ab'], [30, 30, 30, 'abc'], [60, 70, 50, 'abcd'], [80, 80, 80, 'ab'], [80, 80, 80, 'abcdefghijklmnopqrstuvwxyz'], [80, 80, 80, 'abc'], [1, 80, 80, 'ab'], [80, 1, 80, 'ab'], [80, 80, 1, 'ab'], [79, 78, 80, 'abcde']]) out.push(`${randWord(g, a, al)} ${randWord(g, b, al)} ${randWord(g, c, al)}\n`);
      const base = randWord(g, 80, 'abcdefgh'); out.push(`${base} ${base} ${base}\n`, `${'a'.repeat(80)} ${'a'.repeat(80)} ${'a'.repeat(80)}\n`, `${'a'.repeat(80)} ${'b'.repeat(80)} ${'a'.repeat(80)}\n`, `${'ab'.repeat(40)} ${'ba'.repeat(40)} ${'ab'.repeat(40)}\n`);
      return out;
    }
  }
];
