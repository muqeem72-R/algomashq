import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const isPal = (s) => s === [...s].reverse().join('');
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export default [
  {
    slug: 'concatenation-of-all-words',
    title: 'Blocks Made of All the Words',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'sliding-window', 'strings'],
    concept: {
      title: 'A sliding window that moves in steps of one word',
      body: [
        'All the `k` words have the same length `L`. You look for the places in the text `s` where a block of `k * L` letters consists of **all the words, each used as often as it is listed, in any order**. A block is just a sequence of `k` chunks of length `L`, so compare **counts of words**: a map `need` has the number of copies of each word, and a map `have` the counts inside the current window.',
        'The start position of a block can be any of the `L` offsets `0, 1, ..., L - 1`. For each offset, cut the text into chunks of length `L` starting at that offset, and slide a window over the chunks: add the next chunk on the right; if it is a listed word, count it, and while its count exceeds `need`, drop chunks from the left; if it is not a listed word, throw everything away and restart after it.',
        { code: 'for off in range(L):\n    left, count, have = off, 0, {}\n    for right in range(off, n - L + 1, L):\n        word = s[right:right + L]\n        if word in need:\n            have[word] += 1; count += 1\n            while have[word] > need[word]:\n                have[s[left:left + L]] -= 1; left += L; count -= 1\n            if count == k: record(left)     # then move the window one chunk on\n        else:\n            have, count, left = {}, 0, right + L' },
        'Every chunk enters and leaves a window once per offset, so the work is O(n * L) chunk operations instead of testing all `n` start positions with `k` chunk comparisons each.'
      ]
    },
    statement: ['You are given a text `s` and `k` words that all have the same length. Find all positions `i` (counting from 0) such that the block of `s` that starts at `i` and has the length of all words together is the concatenation of all `k` words, each word used exactly as many times as it is listed, in any order. Print the number of positions and then the positions in increasing order.'],
    inputFormat: ['The first line has the text `s`.', 'The second line has `k`.', 'The third line has the `k` words.'],
    outputFormat: ['The first line: the number of positions.', 'The second line: the positions in increasing order (an empty line if there are none).'],
    constraints: ['1 <= length of s <= 20000', '1 <= k <= 2000', 'All words have the same length between 1 and 8, and k * length <= length of s.', 'The text and the words contain lowercase letters.'],
    examples: [{ input: 'barfoothefoobarman\n2\nfoo bar\n', note: 'The blocks barfoo (position 0) and foobar (position 9) are made of foo and bar.' }],
    hints: ['A block is a sequence of chunks of the word length; compare the counts of words with a map.', 'Try every start offset between 0 and L - 1 and move a window of chunks in steps of L.', 'When a chunk is not a listed word, or a word is used too often, move the left end of the window.'],
    program: {
      io: ['s:word', 'k:int', 'w:word[k]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        n = len(s)
        L = len(w[0])
        need = {}
        for word in w:
            need[word] = need.get(word, 0) + 1
        result = []
        for off in range(L):
            left = off
            count = 0
            have = {}
            for right in range(off, n - L + 1, L):
                word = s[right:right + L]
                if word in need:
                    have[word] = have.get(word, 0) + 1
                    count += 1
                    while have[word] > need[word]:
                        have[s[left:left + L]] -= 1
                        left += L
                        count -= 1
                    if count == k:
                        result.append(left)
                        have[s[left:left + L]] -= 1
                        left += L
                        count -= 1
                else:
                    have = {}
                    count = 0
                    left = right + L
        result.sort()
        print(len(result))
        print(*result)`,
      cpp: r`
        int n = s.size(), L = w[0].size();
        unordered_map<string, int> need;
        for (int i = 0; i < k; i++) need[w[i]]++;
        vector<int> result;
        for (int off = 0; off < L; off++) {
            unordered_map<string, int> have;
            int left = off, count = 0;
            for (int right = off; right + L <= n; right += L) {
                string word = s.substr(right, L);
                if (need.count(word)) {
                    have[word]++;
                    count++;
                    while (have[word] > need[word]) {
                        have[s.substr(left, L)]--;
                        left += L;
                        count--;
                    }
                    if (count == k) {
                        result.push_back(left);
                        have[s.substr(left, L)]--;
                        left += L;
                        count--;
                    }
                } else {
                    have.clear();
                    count = 0;
                    left = right + L;
                }
            }
        }
        sort(result.begin(), result.end());
        cout << result.size() << "\n";
        for (size_t i = 0; i < result.size(); i++) cout << result[i] << (i + 1 < result.size() ? " " : "");
        cout << "\n";`,
      java: r`
        int n = s.length(), L = w[0].length();
        Map<String, Integer> need = new HashMap<>();
        for (int i = 0; i < k; i++) need.merge(w[i], 1, Integer::sum);
        List<Integer> result = new ArrayList<>();
        for (int off = 0; off < L; off++) {
            Map<String, Integer> have = new HashMap<>();
            int left = off, count = 0;
            for (int right = off; right + L <= n; right += L) {
                String word = s.substring(right, right + L);
                if (need.containsKey(word)) {
                    have.merge(word, 1, Integer::sum);
                    count++;
                    while (have.get(word) > need.get(word)) {
                        have.merge(s.substring(left, left + L), -1, Integer::sum);
                        left += L;
                        count--;
                    }
                    if (count == k) {
                        result.add(left);
                        have.merge(s.substring(left, left + L), -1, Integer::sum);
                        left += L;
                        count--;
                    }
                } else {
                    have.clear();
                    count = 0;
                    left = right + L;
                }
            }
        }
        Collections.sort(result);
        StringBuilder sb = new StringBuilder();
        for (int p : result) sb.append(p).append(" ");
        System.out.println(result.size());
        System.out.println(sb.toString().trim());`
    },
    solution: { explanation: ['For every offset the text is cut into chunks of the word length and a window of chunks is slid along; maps of word counts decide when a window holds exactly the listed words.'], complexity: 'Time O(n * L) on average, space O(k).' },
    solve(input) { const [s, k0, ws] = rows(input); const w = ws.split(' '); const k = Number(k0), L = w[0].length; const need = new Map(); for (const x of w) need.set(x, (need.get(x) || 0) + 1); const out = []; for (let i = 0; i + k * L <= s.length; i++) { const have = new Map(); let ok = true; for (let j = 0; j < k; j++) { const c = s.slice(i + j * L, i + (j + 1) * L); const h = (have.get(c) || 0) + 1; if (h > (need.get(c) || 0)) { ok = false; break; } have.set(c, h); } if (ok) out.push(i); } return `${out.length}\n${out.join(' ')}`; },
    tests() {
      const g = rng(411);
      const make = (n, L, vocab, k, alpha, noise) => { const pool = many(vocab, () => randWord(g, L, alpha)); const words = many(k, () => pool[randInt(g, 0, vocab - 1)]); let s = ''; while (s.length < n) s += pool[randInt(g, 0, vocab - 1)]; s = s.slice(0, n); if (noise) { const t = [...s]; for (let q = 0; q < noise; q++) t[randInt(g, 0, n - 1)] = alpha[randInt(g, 0, alpha.length - 1)]; s = t.join(''); } return `${s}\n${k}\n${words.join(' ')}\n`; };
      return ['barfoothefoobarman\n2\nfoo bar\n', 'wordgoodgoodgoodbestword\n4\nword good best word\n', 'a\n1\na\n', 'aaaa\n2\na a\n', 'ab\n2\na b\n', make(40, 2, 3, 3, 'ab', 0), make(300, 3, 4, 4, 'ab', 2), make(20000, 3, 3, 5, 'ab', 0), make(20000, 2, 6, 50, 'ab', 20), make(20000, 8, 10, 100, 'abc', 5), make(20000, 1, 2, 1500, 'ab', 0), make(20000, 4, 20, 2000, 'ab', 0)];
    }
  },

  {
    slug: 'max-points-on-a-line',
    title: 'Most Points on One Line',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'geometry', 'gcd'],
    concept: {
      title: 'Count equal slopes from a fixed point',
      body: [
        'Fix a point `P`. Every other point `Q` lies on a line through `P` with a direction given by `(dx, dy) = Q - P`. Two points `Q1` and `Q2` are on the **same line through `P`** exactly when their directions are parallel. To compare directions without decimals, divide `(dx, dy)` by `gcd(|dx|, |dy|)` (the greatest common divisor) and fix the sign so that `dx > 0`, or `dx = 0` and `dy > 0`. Equal reduced directions mean the same line.',
        { code: 'for each point P (index i):\n    count = {}\n    for each point Q after P:\n        dx, dy = Q.x - P.x, Q.y - P.y\n        g = gcd(abs(dx), abs(dy)); dx //= g; dy //= g\n        if dx < 0 or (dx == 0 and dy < 0): dx, dy = -dx, -dy\n        count[(dx, dy)] += 1\n    best = max(best, max(count.values()) + 1)       # + the point P itself' },
        'Looking only at the points after `P` is enough: the line through the best group was already counted from its first point. Floating point slopes are dangerous here (`1/3` is not exact); reduced integer pairs are exact keys.'
      ]
    },
    statement: ['Given `n` different points with integer coordinates, find the largest number of points that lie on one straight line.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has the coordinates `x` and `y` of a point.'],
    outputFormat: ['Print the largest number of points on one line.'],
    constraints: ['1 <= n <= 700', '-10^4 <= x, y <= 10^4', 'All points are different.'],
    examples: [{ input: '5\n1 1\n2 2\n3 3\n1 2\n2 1\n', note: 'The points (1,1), (2,2) and (3,3) are on one line.' }],
    hints: ['Fix one point and look at the direction to every other point.', 'Reduce the direction by the gcd and fix its sign, so that parallel directions get the same key.', 'The best line through the fixed point has (largest count) + 1 points.'],
    program: {
      io: ['n:int', 'pts:int[n][2]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>', '<cstdlib>'],
      helpers: {
        cpp: r`
          long long gcdOf(long long a, long long b) {
              while (b != 0) {
                  long long t = a % b;
                  a = b;
                  b = t;
              }
              return a;
          }`,
        java: r`
          static long gcdOf(long a, long b) {
              while (b != 0) {
                  long t = a % b;
                  a = b;
                  b = t;
              }
              return a;
          }`
      },
      python: r`
        from math import gcd
        best = 1
        for i in range(n):
            count = {}
            for j in range(i + 1, n):
                dx = pts[j][0] - pts[i][0]
                dy = pts[j][1] - pts[i][1]
                g = gcd(abs(dx), abs(dy))
                dx //= g
                dy //= g
                if dx < 0 or (dx == 0 and dy < 0):
                    dx, dy = -dx, -dy
                count[(dx, dy)] = count.get((dx, dy), 0) + 1
            if count:
                best = max(best, max(count.values()) + 1)
        print(best)`,
      cpp: r`
        int best = 1;
        for (int i = 0; i < n; i++) {
            unordered_map<long long, int> count;
            for (int j = i + 1; j < n; j++) {
                long long dx = pts[j][0] - pts[i][0], dy = pts[j][1] - pts[i][1];
                long long g = gcdOf(llabs(dx), llabs(dy));
                dx /= g;
                dy /= g;
                if (dx < 0 || (dx == 0 && dy < 0)) {
                    dx = -dx;
                    dy = -dy;
                }
                best = max(best, ++count[dx * 100000 + (dy + 50000)] + 1);
            }
        }
        cout << best << "\n";`,
      java: r`
        int best = 1;
        for (int i = 0; i < n; i++) {
            Map<Long, Integer> count = new HashMap<>();
            for (int j = i + 1; j < n; j++) {
                long dx = pts[j][0] - pts[i][0], dy = pts[j][1] - pts[i][1];
                long g = gcdOf(Math.abs(dx), Math.abs(dy));
                dx /= g;
                dy /= g;
                if (dx < 0 || (dx == 0 && dy < 0)) {
                    dx = -dx;
                    dy = -dy;
                }
                best = Math.max(best, count.merge(dx * 100000 + (dy + 50000), 1, Integer::sum) + 1);
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['From each point the other points are grouped by their reduced direction; the biggest group plus the point itself is the best line through that point.'], complexity: 'Time O(n^2 log C) on average, space O(n).' },
    solve(input) { const rs = rows(input); const n = Number(rs[0]); const p = rs.slice(1, 1 + n).map(nums); let best = 1; for (let i = 0; i < n; i++) { const m = new Map(); for (let j = i + 1; j < n; j++) { let dx = p[j][0] - p[i][0], dy = p[j][1] - p[i][1]; const g = gcd(Math.abs(dx), Math.abs(dy)); dx /= g; dy /= g; if (dx < 0 || (dx === 0 && dy < 0)) { dx = -dx; dy = -dy; } const k = `${dx},${dy}`; m.set(k, (m.get(k) || 0) + 1); best = Math.max(best, m.get(k) + 1); } } return String(best); },
    tests() {
      const g = rng(412);
      const make = (n, span) => { const seen = new Set(); const pts = []; while (pts.length < n) { const x = randInt(g, -span, span), y = randInt(g, -span, span); if (!seen.has(x + ',' + y)) { seen.add(x + ',' + y); pts.push([x, y]); } } return `${n}\n${pts.map((q) => q.join(' ')).join('\n')}\n`; };
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const p = rs.slice(1, 1 + n).map(nums); let best = Math.min(n, 2); for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { let c = 2; for (let k = 0; k < n; k++) if (k !== i && k !== j && (p[j][0] - p[i][0]) * (p[k][1] - p[i][1]) === (p[j][1] - p[i][1]) * (p[k][0] - p[i][0])) c++; best = Math.max(best, c); } return String(best); };
      crossCheck(() => make(randInt(g, 1, 9), 3), (i) => this.solve(i), brute);
      const onLine = (n, dx, dy) => { const pts = many(n, (i) => [i * dx - 9000, i * dy - 9000]); const extra = []; return `${pts.length}\n${pts.map((q) => q.join(' ')).join('\n')}\n`; };
      const grid = (side) => `${side * side}\n${many(side * side, (i) => `${(i % side) * 7 - 100} ${Math.floor(i / side) * 7 - 100}`).join('\n')}\n`;
      return ['5\n1 1\n2 2\n3 3\n1 2\n2 1\n', '1\n0 0\n', '2\n0 0\n5 7\n', '4\n0 0\n1 1\n0 1\n1 0\n', make(10, 4), make(100, 10000), make(700, 10000), make(700, 15), onLine(700, 25, 13), onLine(700, 0, 3), grid(26), make(500, 20)];
    }
  },

  {
    slug: 'palindrome-pairs-count',
    title: 'Pairs of Words That Make a Palindrome',
    difficulty: 'hard',
    tags: ['hashing', 'hash-set', 'palindrome', 'strings'],
    concept: {
      title: 'Split every word and look up the reversed other half',
      body: [
        'Count the ordered pairs `(a, b)` of different words in the list such that `a + b` (written one after the other) is a palindrome. Trying all pairs costs `n^2` concatenations. Think about what such a pair looks like. If `a + b` is a palindrome, then the **longer** word contains the reversal of the shorter one, and what remains of it is a palindrome by itself:',
        '- If `|a| >= |b|`: `a = reverse(b) + p` where `p` is a palindrome (possibly empty).\n- If `|a| < |b|`: `b = p + reverse(a)` where `p` is a non-empty palindrome.',
        { code: 'words = set(w)\nfor word in w:\n    for k in range(len(word) + 1):\n        x, y = word[:k], word[k:]\n        # word as the first word a:  word = x + y with y a palindrome, partner b = reverse(x)\n        if y == y[::-1] and x[::-1] in words and x[::-1] != word: total += 1\n        # word as the second word b:  word = x + y with x a non-empty palindrome, partner a = reverse(y)\n        if k >= 1 and x == x[::-1] and y and y[::-1] in words: total += 1' },
        'The two cases do not overlap, so every pair is counted once. For each word there are only `length + 1` splits, and each split needs one hash set lookup.'
      ]
    },
    statement: ['Given `n` different words, count the ordered pairs of two different words `(a, b)` for which the text `a` followed directly by `b` is a palindrome. The pair `(a, b)` and the pair `(b, a)` are different pairs.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` different words.'],
    outputFormat: ['Print the number of pairs.'],
    constraints: ['1 <= n <= 20000', 'Each word has 1 to 8 lowercase letters.', 'All words are different.'],
    examples: [{ input: '5\nabcd dcba lls s sssll\n', note: 'The pairs are (abcd, dcba), (dcba, abcd), (s, lls) and (lls, sssll).' }],
    hints: ['If `a + b` is a palindrome, the longer word is the reversed shorter word plus a palindrome.', 'Split every word at every position; check whether one part is a palindrome and the reversal of the other part is a word.', 'The case of the first word being at least as long, and the case of the second word being longer, do not overlap.'],
    program: {
      io: ['n:int', 'w:word[n]'],
      fast: true,
      includes: ['<unordered_set>'],
      helpers: {
        cpp: r`
          bool isPalindrome(const string& t) {
              for (size_t i = 0, j = t.size(); i + 1 < j; i++, j--) {
                  if (t[i] != t[j - 1]) return false;
              }
              return true;
          }

          string reversed(const string& t) {
              return string(t.rbegin(), t.rend());
          }`,
        java: r`
          static boolean isPalindrome(String t) {
              for (int i = 0, j = t.length(); i + 1 < j; i++, j--) {
                  if (t.charAt(i) != t.charAt(j - 1)) return false;
              }
              return true;
          }

          static String reversed(String t) {
              return new StringBuilder(t).reverse().toString();
          }`
      },
      python: r`
        words = set(w)
        total = 0
        for word in w:
            for k in range(len(word) + 1):
                x, y = word[:k], word[k:]
                if y == y[::-1] and x[::-1] in words and x[::-1] != word:
                    total += 1
                if k >= 1 and x == x[::-1] and y and y[::-1] in words:
                    total += 1
        print(total)`,
      cpp: r`
        unordered_set<string> words(w.begin(), w.end());
        long long total = 0;
        for (int i = 0; i < n; i++) {
            const string& word = w[i];
            for (size_t k = 0; k <= word.size(); k++) {
                string x = word.substr(0, k), y = word.substr(k);
                if (isPalindrome(y)) {
                    string partner = reversed(x);
                    if (partner != word && words.count(partner)) total++;
                }
                if (k >= 1 && !y.empty() && isPalindrome(x) && words.count(reversed(y))) total++;
            }
        }
        cout << total << "\n";`,
      java: r`
        Set<String> words = new HashSet<>(Arrays.asList(w));
        long total = 0;
        for (int i = 0; i < n; i++) {
            String word = w[i];
            for (int k = 0; k <= word.length(); k++) {
                String x = word.substring(0, k), y = word.substring(k);
                if (isPalindrome(y)) {
                    String partner = reversed(x);
                    if (!partner.equals(word) && words.contains(partner)) total++;
                }
                if (k >= 1 && !y.isEmpty() && isPalindrome(x) && words.contains(reversed(y))) total++;
            }
        }
        System.out.println(total);`
    },
    solution: { explanation: ['In a palindrome `a + b` the longer word is the reversal of the shorter one plus a palindrome. Splitting each word everywhere and looking up the reversed other part in a set finds every pair exactly once.'], complexity: 'Time O(total length * longest word) on average, space O(n).' },
    solve(input) { const w = rows(input)[1].split(' '); const set = new Set(w); let t = 0; for (const word of w) for (let k = 0; k <= word.length; k++) { const x = word.slice(0, k), y = word.slice(k); const rx = [...x].reverse().join(''), ry = [...y].reverse().join(''); if (isPal(y) && set.has(rx) && rx !== word) t++; if (k >= 1 && isPal(x) && y && set.has(ry)) t++; } return String(t); },
    tests() {
      const g = rng(413);
      const distinctWords = (n, len, alpha) => { const s = new Set(); let guard = 0; while (s.size < n && guard++ < n * 50) s.add(randWord(g, randInt(g, 1, len), alpha)); return [...s]; };
      const make = (n, len, alpha) => { const w = distinctWords(n, len, alpha); return `${w.length}\n${w.join(' ')}\n`; };
      const brute = (input) => { const w = rows(input)[1].split(' '); let t = 0; for (let i = 0; i < w.length; i++) for (let j = 0; j < w.length; j++) if (i !== j && isPal(w[i] + w[j])) t++; return String(t); };
      crossCheck(() => make(randInt(g, 1, 12), 4, 'ab'), (i) => this.solve(i), brute);
      crossCheck(() => make(randInt(g, 1, 12), 3, 'abc'), (i) => this.solve(i), brute);
      return ['5\nabcd dcba lls s sssll\n', '1\na\n', '2\nab ba\n', '3\na b c\n', '2\nbat tab\n', make(15, 4, 'ab'), make(300, 5, 'abc'), make(20000, 8, 'ab'), make(20000, 8, 'abc'), make(20000, 8, LOW), make(20000, 6, 'ab')];
    }
  },

  {
    slug: 'longest-block-equal-three-letters',
    title: 'Longest Block With Equally Many a, b and c',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'prefix-sum', 'strings'],
    concept: {
      title: 'The key is a pair of differences',
      body: [
        'In a block that has the same number of `a`, `b` and `c`, the three counts are equal, which means `count(b) - count(a) = 0` **and** `count(c) - count(a) = 0`. For prefixes, let `d1 = count_b - count_a` and `d2 = count_c - count_a` (counted from the start of the word). A block between two prefixes is balanced exactly when **both differences are the same at the two ends**.',
        { code: 'first = {(0, 0): -1}\nca = cb = cc = best = 0\nfor i, ch in enumerate(s):\n    update ca / cb / cc\n    key = (cb - ca, cc - ca)\n    if key in first: best = max(best, i - first[key])\n    else: first[key] = i' },
        'This is the two-dimensional version of "equally many 0s and 1s". The key is a **pair of numbers**, and the map stores the **first** position of every key. In C++ and Java the pair can be packed into one number.'
      ]
    },
    statement: ['A word consists only of the letters `a`, `b` and `c`. Find the length of the longest block of consecutive letters that contains the same number of `a`, `b` and `c`. If there is none, print 0.'],
    inputFormat: ['A single word of the letters a, b and c.'],
    outputFormat: ['Print the length.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'abcaabbcc\n', note: 'The whole word has three of each letter: length 9.' }],
    hints: ['Count a, b and c in every prefix.', 'A block is balanced when both `count_b - count_a` and `count_c - count_a` are equal at its two ends.', 'Store the first position of every pair of differences in a map.'],
    program: {
      io: ['s:word'],
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        first = {(0, 0): -1}
        ca = cb = cc = 0
        best = 0
        for i, ch in enumerate(s):
            if ch == "a":
                ca += 1
            elif ch == "b":
                cb += 1
            else:
                cc += 1
            key = (cb - ca, cc - ca)
            if key in first:
                best = max(best, i - first[key])
            else:
                first[key] = i
        print(best)`,
      cpp: r`
        int n = s.size();
        unordered_map<long long, int> first;
        first[(long long) n * (2 * n + 1) + n] = -1;
        int ca = 0, cb = 0, cc = 0, best = 0;
        for (int i = 0; i < n; i++) {
            if (s[i] == 'a') ca++;
            else if (s[i] == 'b') cb++;
            else cc++;
            long long key = (long long) (cb - ca + n) * (2 * n + 1) + (cc - ca + n);
            auto it = first.find(key);
            if (it != first.end()) best = max(best, i - it->second);
            else first[key] = i;
        }
        cout << best << "\n";`,
      java: r`
        int n = s.length();
        Map<Long, Integer> first = new HashMap<>();
        first.put((long) n * (2 * n + 1) + n, -1);
        int ca = 0, cb = 0, cc = 0, best = 0;
        for (int i = 0; i < n; i++) {
            char ch = s.charAt(i);
            if (ch == 'a') ca++;
            else if (ch == 'b') cb++;
            else cc++;
            long key = (long) (cb - ca + n) * (2 * n + 1) + (cc - ca + n);
            Integer start = first.get(key);
            if (start != null) best = Math.max(best, i - start);
            else first.put(key, i);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Two prefixes with the same pair `(count_b - count_a, count_c - count_a)` enclose a balanced block; the first position of each pair gives the longest block.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const s = input.trim(); const first = new Map([['0,0', -1]]); let ca = 0, cb = 0, cc = 0, best = 0; for (let i = 0; i < s.length; i++) { if (s[i] === 'a') ca++; else if (s[i] === 'b') cb++; else cc++; const k = `${cb - ca},${cc - ca}`; if (first.has(k)) best = Math.max(best, i - first.get(k)); else first.set(k, i); } return String(best); },
    tests() {
      const g = rng(414);
      const brute = (i) => { const s = i.trim(); let best = 0; for (let a = 0; a < s.length; a++) { const c = { a: 0, b: 0, c: 0 }; for (let b = a; b < s.length; b++) { c[s[b]]++; if (c.a === c.b && c.b === c.c) best = Math.max(best, b - a + 1); } } return best; };
      crossCheck(() => `${randWord(g, randInt(g, 1, 14), 'abc')}\n`, (i) => this.solve(i), brute);
      const cyc = (n) => 'abc'.repeat(Math.ceil(n / 3)).slice(0, n);
      return ['abcaabbcc\n', 'a\n', 'abc\n', 'aabb\n', 'aaabbbccc\n', `${randWord(g, 40, 'abc')}\n`, `${randWord(g, 2000, 'abc')}\n`, `${randWord(g, 20000, 'abc')}\n`, `${cyc(20000)}\n`, `${'a'.repeat(20000)}\n`, `${randWord(g, 20000, 'ab')}\n`, `${'abc'.repeat(3000)}${'a'.repeat(5000)}${'cba'.repeat(1000)}\n`];
    }
  },

  {
    slug: 'longest-well-performing-interval',
    title: 'Longest Run With More Hard Days Than Easy Days',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'prefix-sum', 'first-occurrence'],
    concept: {
      title: 'A walk that moves by one step needs only one lookup',
      body: [
        'Give each day the value **+1** if the worker worked more than 8 hours (a *tiring* day) and **-1** otherwise. A block of days is *well-performing* when its sum is **positive**. With prefix sums `P`, you need the longest block with `P[j] - P[i] > 0`.',
        'Normally "greater than" asks for a data structure. Here the prefix sums **change by exactly 1 per day**, which allows a trick. If `P[j] > 0`, the block from the start works: its length is `j`. Otherwise `P[j] <= 0`, and the walk started at 0, so it must have passed through every value between 0 and `P[j]`. The earliest earlier prefix that is **smaller** than `P[j]` is therefore the first occurrence of exactly `P[j] - 1`, and no earlier start can do better.',
        { code: 'first = {}\nscore = best = 0\nfor i, h in enumerate(hours):\n    score += 1 if h > 8 else -1\n    if score > 0: best = i + 1\n    else:\n        first.setdefault(score, i)\n        if score - 1 in first: best = max(best, i - first[score - 1])' },
        'So one map of **first occurrences** and one lookup per day solve a problem that looks like it needs more.'
      ]
    },
    statement: ['For each of `n` days you know how many hours a worker worked. A day is **tiring** if the worker worked more than 8 hours. A block of consecutive days is **well-performing** if it has strictly more tiring days than non-tiring days. Print the length of the longest well-performing block, or 0 if there is none.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` numbers of hours.'],
    outputFormat: ['Print the length of the longest well-performing block.'],
    constraints: ['1 <= n <= 20000', '0 <= each number of hours <= 16'],
    examples: [{ input: '7\n9 9 6 0 6 6 9\n', note: 'The block 9 9 6 has two tiring days and one other day: length 3. Nothing longer works.' }],
    hints: ['Replace a tiring day by +1 and another day by -1 and use prefix sums.', 'If the prefix sum is positive, the block from the start is well-performing.', 'Otherwise look up the first position where the prefix sum was one smaller than now.'],
    program: {
      io: ['n:int', 'h:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        first = {}
        score = 0
        best = 0
        for i in range(n):
            score += 1 if h[i] > 8 else -1
            if score > 0:
                best = i + 1
            else:
                if score not in first:
                    first[score] = i
                if score - 1 in first:
                    best = max(best, i - first[score - 1])
        print(best)`,
      cpp: r`
        unordered_map<int, int> first;
        int score = 0, best = 0;
        for (int i = 0; i < n; i++) {
            score += h[i] > 8 ? 1 : -1;
            if (score > 0) {
                best = i + 1;
            } else {
                if (!first.count(score)) first[score] = i;
                auto it = first.find(score - 1);
                if (it != first.end()) best = max(best, i - it->second);
            }
        }
        cout << best << "\n";`,
      java: r`
        Map<Integer, Integer> first = new HashMap<>();
        int score = 0, best = 0;
        for (int i = 0; i < n; i++) {
            score += h[i] > 8 ? 1 : -1;
            if (score > 0) {
                best = i + 1;
            } else {
                first.putIfAbsent(score, i);
                Integer start = first.get(score - 1);
                if (start != null) best = Math.max(best, i - start);
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The prefix score moves by one per day, so the earliest earlier prefix that is smaller than the current one is the first occurrence of the value one below it.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { return String(fastWell(nums(rows(input)[1]))); },
    tests() {
      const g = rng(415);
      const brute = (hh) => { let best = 0; for (let i = 0; i < hh.length; i++) { let s = 0; for (let j = i; j < hh.length; j++) { s += hh[j] > 8 ? 1 : -1; if (s > 0) best = Math.max(best, j - i + 1); } } return best; };
      for (let t = 0; t < 300; t++) { const hh = randArray(g, randInt(g, 1, 14), 0, 16); if (brute(hh) !== fastWell(hh)) throw new Error('well-performing reference differs from brute force'); }
      const walk = (n, p) => arr(many(n, () => (g() < p ? 9 : 8)));
      return ['7\n9 9 6 0 6 6 9\n', '1\n9\n', '1\n8\n', '3\n6 6 6\n', '3\n9 9 9\n', arr(randArray(g, 30, 0, 16)), arr(randArray(g, 2000, 0, 16)), arr(randArray(g, 20000, 0, 16)), walk(20000, 0.5), walk(20000, 0.45), walk(20000, 0.55), arr(many(20000, (i) => (i < 10000 ? 0 : 16)))];
    }
  },

  {
    slug: 'longest-block-even-vowels',
    title: 'Longest Block With an Even Number of Each Vowel',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'bitmask', 'prefix', 'strings'],
    concept: {
      title: 'Parity of five counters packed into one number',
      body: [
        'You want a block in which each of the vowels `a e i o u` occurs an **even** number of times (zero counts as even). Only the **parity** (even or odd) of each count matters, so five yes/no values describe a prefix completely. Pack them into a 5-bit number, a **bitmask**: bit `j` is 1 when the vowel number `j` has occurred an odd number of times so far.',
        { code: 'mask = 0\nfor i, ch in enumerate(s):\n    if ch in "aeiou":\n        mask ^= 1 << "aeiou".index(ch)     # flip the parity of this vowel\n    # block between two prefixes has all counts even <=> the two masks are equal' },
        'A block between two prefixes has all vowel counts even exactly when the two prefixes have the **same mask**. So store the **first position of every mask** (there are only 32 masks) and measure the distance when a mask appears again. Start with the empty prefix: mask 0 at position -1.'
      ]
    },
    statement: ['Find the length of the longest block of consecutive letters of a word in which each of the vowels a, e, i, o and u appears an even number of times (a vowel that does not appear is fine, because 0 is even).'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the length.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'eleetminicoworoep\n', note: 'The block leetminicowor has the vowels e, i and o twice each (a and u not at all): length 13.' }],
    hints: ['Only the parity of the count of each vowel matters.', 'Represent the five parities as a bitmask and flip a bit when a vowel is read.', 'Two prefixes with the same mask enclose a good block; store the first position of every mask.'],
    program: {
      io: ['s:word'],
      includes: ['<algorithm>'],
      python: r`
        VOWELS = "aeiou"
        first = {0: -1}
        mask = 0
        best = 0
        for i, ch in enumerate(s):
            j = VOWELS.find(ch)
            if j >= 0:
                mask ^= 1 << j
            if mask in first:
                best = max(best, i - first[mask])
            else:
                first[mask] = i
        print(best)`,
      cpp: r`
        string vowels = "aeiou";
        vector<int> first(32, -2);
        first[0] = -1;
        int mask = 0, best = 0;
        for (int i = 0; i < (int) s.size(); i++) {
            size_t j = vowels.find(s[i]);
            if (j != string::npos) mask ^= 1 << j;
            if (first[mask] != -2) best = max(best, i - first[mask]);
            else first[mask] = i;
        }
        cout << best << "\n";`,
      java: r`
        String vowels = "aeiou";
        int[] first = new int[32];
        Arrays.fill(first, -2);
        first[0] = -1;
        int mask = 0, best = 0;
        for (int i = 0; i < s.length(); i++) {
            int j = vowels.indexOf(s.charAt(i));
            if (j >= 0) mask ^= 1 << j;
            if (first[mask] != -2) best = Math.max(best, i - first[mask]);
            else first[mask] = i;
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The parities of the five vowel counts form a 5-bit mask. Two prefixes with equal masks enclose a block with all counts even; the first position of every mask gives the longest block.'], complexity: 'Time O(n), space O(32).' },
    solve(input) { return String(fastVowels(input.trim())); },
    tests() {
      const g = rng(416);
      for (let t = 0; t < 200; t++) { const s = randWord(g, randInt(g, 1, 14), 'aebio'); let best = 0; for (let i = 0; i < s.length; i++) { const c = {}; for (let j = i; j < s.length; j++) { c[s[j]] = (c[s[j]] || 0) + 1; if ([...'aeiou'].every((v) => (c[v] || 0) % 2 === 0)) best = Math.max(best, j - i + 1); } } if (best !== fastVowels(s)) throw new Error('vowel reference differs from brute force'); }
      return ['eleetminicoworoep\n', 'leetcodeisgreat\n', 'bcbcbc\n', 'a\n', 'aa\n', 'aeiou\n', `${randWord(g, 40, 'aeioub')}\n`, `${randWord(g, 2000, 'aeiouxyz')}\n`, `${randWord(g, 20000, LOW)}\n`, `${randWord(g, 20000, 'aeiou')}\n`, `${'bcdfg'.repeat(4000)}\n`, `${randWord(g, 20000, 'aeioubcd')}\n`];
    }
  },

  {
    slug: 'remove-block-for-divisibility',
    title: 'Remove the Shortest Block to Make the Sum Divisible',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'prefix-sum', 'modulo'],
    concept: {
      title: 'The remainder that has to disappear, and the nearest earlier prefix',
      body: [
        'The total sum has the remainder `r = total % p`. If `r = 0` nothing has to be removed. Otherwise you must remove a block whose sum has the **same remainder `r`** modulo `p`, because then the rest has remainder `0`. You want the **shortest** such block, and the block may not be the whole array.',
        'A block ending at `j` has remainder `r` when `prefix[j] - prefix[i] ≡ r (mod p)`, i.e. `prefix[i] ≡ prefix[j] - r (mod p)`. To make the block short, `i` should be as **late** as possible: store the **last** position of every prefix remainder in a map.',
        { code: 'last = {0: -1}\ncur = 0\nfor j, x in enumerate(a):\n    cur = (cur + x) % p\n    need = (cur - r) % p\n    if need in last: best = min(best, j - last[need])\n    last[cur] = j' },
        'Look the partner up **before** storing the current prefix. If the best block has the whole length `n`, it is not allowed, and the answer is -1.'
      ]
    },
    statement: ['You are given `n` positive integers and a number `p`. You may remove one block of consecutive elements (also an empty block) so that the sum of the remaining elements is divisible by `p`. You may not remove all elements. Print the length of the shortest block that has to be removed, or -1 if it is impossible.'],
    inputFormat: ['The first line has `n` and `p`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the length of the shortest block, or -1.'],
    constraints: ['1 <= n <= 20000', '1 <= p <= 10^9', '1 <= each number <= 10^9'],
    examples: [{ input: '4 6\n3 1 4 2\n', note: 'The sum is 10, remainder 4. Removing the block 4 (one element) leaves 6.' }],
    hints: ['If the total is already divisible by p, remove nothing: print 0.', 'Otherwise look for a block whose sum has the same remainder `r` as the total.', 'Store the last position of every prefix remainder and look up `(cur - r) mod p` for each end.'],
    program: {
      io: ['n:int p:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        total = sum(a)
        r = total % p
        if r == 0:
            print(0)
        else:
            last = {0: -1}
            cur = 0
            best = n
            for j in range(n):
                cur = (cur + a[j]) % p
                need = (cur - r) % p
                if need in last:
                    best = min(best, j - last[need])
                last[cur] = j
            print(best if best < n else -1)`,
      cpp: r`
        long long total = 0;
        for (int i = 0; i < n; i++) total += a[i];
        long long r = total % p;
        if (r == 0) {
            cout << 0 << "\n";
        } else {
            unordered_map<long long, int> last;
            last[0] = -1;
            long long cur = 0;
            int best = n;
            for (int j = 0; j < n; j++) {
                cur = (cur + a[j]) % p;
                long long need = ((cur - r) % p + p) % p;
                auto it = last.find(need);
                if (it != last.end()) best = min(best, j - it->second);
                last[cur] = j;
            }
            cout << (best < n ? best : -1) << "\n";
        }`,
      java: r`
        long total = 0;
        for (int i = 0; i < n; i++) total += a[i];
        long r = total % p;
        if (r == 0) {
            System.out.println(0);
        } else {
            Map<Long, Integer> last = new HashMap<>();
            last.put(0L, -1);
            long cur = 0;
            int best = (int) n;
            for (int j = 0; j < n; j++) {
                cur = (cur + a[j]) % p;
                long need = ((cur - r) % p + p) % p;
                Integer start = last.get(need);
                if (start != null) best = Math.min(best, j - start);
                last.put(cur, j);
            }
            System.out.println(best < n ? best : -1);
        }`
    },
    solution: { explanation: ['The removed block must have the same remainder as the total sum. A map of the last position of every prefix remainder gives the shortest such block ending at each position.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const p = nums(rs[0])[1]; const a = nums(rs[1]); const n = a.length; const total = a.reduce((s, x) => s + x, 0); const r = total % p; if (r === 0) return '0'; const last = new Map([[0, -1]]); let cur = 0, best = n; for (let j = 0; j < n; j++) { cur = (cur + a[j]) % p; const need = (((cur - r) % p) + p) % p; if (last.has(need)) best = Math.min(best, j - last.get(need)); last.set(cur, j); } return String(best < n ? best : -1); },
    tests() {
      const g = rng(417);
      const make = (n, hi, p) => `${n} ${p}\n${randArray(g, n, 1, hi).join(' ')}\n`;
      const brute = (i) => { const rs = rows(i); const p = nums(rs[0])[1]; const a = nums(rs[1]); const n = a.length; let best = Infinity; for (let s = 0; s < n; s++) for (let e = s; e <= n; e++) { if (e - s === n) continue; const rest = a.reduce((t, x, k) => (k >= s && k < e ? t : t + x), 0); if (rest % p === 0) best = Math.min(best, e - s); } return best === Infinity ? -1 : best; };
      crossCheck(() => make(randInt(g, 1, 8), 10, randInt(g, 1, 12)), (i) => this.solve(i), brute);
      return ['4 6\n3 1 4 2\n', '1 5\n4\n', '1 5\n5\n', '3 7\n1 2 3\n', '5 3\n6 3 5 2 1\n',make(15, 20, 7), make(2000, 1000, 13), make(20000, 1000000000, 999999937), make(20000, 1000000000, 1000000000), make(20000, 1000000000, 7), make(20000, 100, 1000)];
    }
  },

  {
    slug: 'almost-duplicate-nearby',
    title: 'Close Positions, Close Values',
    difficulty: 'hard',
    tags: ['hashing', 'hash-map', 'buckets', 'sliding-window'],
    concept: {
      title: 'Buckets whose width is the allowed difference plus one',
      body: [
        'You need two elements whose positions differ by at most `k` and whose values differ by at most `t`. Checking all pairs in the window costs a lot. Use **buckets**: put the value `x` into the bucket number `floor(x / (t + 1))`. All values of one bucket differ by at most `t`, so **two values in the same bucket always make a good pair**. Values in neighbouring buckets may or may not be close: compare them. Values in buckets that are further apart are always more than `t` apart.',
        { code: 'w = t + 1\nfor i, x in enumerate(a):\n    b = x // w                       # floor division, also for negative x\n    if b in buckets: found\n    if b - 1 in buckets and x - buckets[b - 1] <= t: found\n    if b + 1 in buckets and buckets[b + 1] - x <= t: found\n    buckets[b] = x\n    if i >= k: del buckets[a[i - k] // w]    # the window keeps the last k elements' },
        'Because two values in one bucket end the search, every bucket holds at most one value while the search goes on, so a plain map from bucket to value is enough. Use **floor** division: for negative numbers a plain `/` in C++ or Java rounds towards zero and would mix up the buckets.'
      ]
    },
    statement: ['Given `n` integers and two numbers `k` and `t`, is there a pair of positions `i < j` with `j - i <= k` and `|a[i] - a[j]| <= t`? Print `yes` or `no`.'],
    inputFormat: ['The first line has `n`, `k` and `t`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20000', '1 <= k <= 20000', '0 <= t <= 10^9', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '4 3 0\n1 2 3 1\n', note: 'The two 1s are 3 positions apart and their values differ by 0.' }, { input: '6 2 2\n1 5 9 1 5 9\n', note: 'Values within 2 positions differ by 4 or more, and equal values are 3 positions apart: no pair.' }],
    hints: ['Use buckets of width `t + 1`: two values in one bucket are always close enough.', 'Also compare with the values in the two neighbouring buckets.', 'Remove the bucket of the element that leaves the window of size k, and use floor division for negative values.'],
    program: {
      io: ['n:int k:int t:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<cstdlib>'],
      helpers: {
        cpp: r`
          long long bucketOf(long long x, long long w) {
              return x >= 0 ? x / w : -((-x + w - 1) / w);
          }`
      },
      python: r`
        w = t + 1
        buckets = {}
        found = False
        for i, x in enumerate(a):
            b = x // w
            if b in buckets:
                found = True
                break
            if b - 1 in buckets and x - buckets[b - 1] <= t:
                found = True
                break
            if b + 1 in buckets and buckets[b + 1] - x <= t:
                found = True
                break
            buckets[b] = x
            if i >= k:
                del buckets[a[i - k] // w]
        print("yes" if found else "no")`,
      cpp: r`
        long long w = t + 1;
        unordered_map<long long, long long> buckets;
        bool found = false;
        for (int i = 0; i < n && !found; i++) {
            long long b = bucketOf(a[i], w);
            if (buckets.count(b)) found = true;
            else if (buckets.count(b - 1) && a[i] - buckets[b - 1] <= t) found = true;
            else if (buckets.count(b + 1) && buckets[b + 1] - a[i] <= t) found = true;
            if (found) break;
            buckets[b] = a[i];
            if (i >= k) buckets.erase(bucketOf(a[i - k], w));
        }
        cout << (found ? "yes" : "no") << "\n";`,
      java: r`
        long w = t + 1;
        Map<Long, Long> buckets = new HashMap<>();
        boolean found = false;
        for (int i = 0; i < n && !found; i++) {
            long b = Math.floorDiv(a[i], w);
            if (buckets.containsKey(b)) found = true;
            else if (buckets.containsKey(b - 1) && a[i] - buckets.get(b - 1) <= t) found = true;
            else if (buckets.containsKey(b + 1) && buckets.get(b + 1) - a[i] <= t) found = true;
            if (found) break;
            buckets.put(b, a[i]);
            if (i >= k) buckets.remove(Math.floorDiv(a[i - (int) k], w));
        }
        System.out.println(found ? "yes" : "no");`
    },
    solution: { explanation: ['Values are put into buckets of width `t + 1`; a bucket collision or a close value in a neighbouring bucket proves a pair, and the bucket of the element that leaves the window is removed.'], complexity: 'Time O(n) on average, space O(k).' },
    solve(input) { const rs = rows(input); const [n, k, t] = nums(rs[0]); const a = nums(rs[1]); for (let i = 0; i < n; i++) for (let j = i + 1; j < n && j - i <= k; j++) if (Math.abs(a[i] - a[j]) <= t) return 'yes'; return 'no'; },
    tests() {
      const g = rng(418);
      const make = (n, k, t, lo, hi) => `${n} ${k} ${t}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const fast = (input) => { const rs = rows(input); const [n, k, t] = nums(rs[0]); const a = nums(rs[1]); const w = t + 1; const b = new Map(); for (let i = 0; i < n; i++) { const x = a[i]; const id = Math.floor(x / w); if (b.has(id)) return 'yes'; if (b.has(id - 1) && x - b.get(id - 1) <= t) return 'yes'; if (b.has(id + 1) && b.get(id + 1) - x <= t) return 'yes'; b.set(id, x); if (i >= k) b.delete(Math.floor(a[i - k] / w)); } return 'no'; };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 6), randInt(g, 0, 5), -20, 20), fast, (i) => this.solve(i));
      const spread = (n, step, k, t) => `${n} ${k} ${t}\n${many(n, (i) => (i * step) % 2000000000 - 1000000000).join(' ')}\n`;
      return ['4 3 0\n1 2 3 1\n', '6 2 2\n1 5 9 1 5 9\n', '1 1 0\n5\n', '2 1 0\n5 5\n', '2 1 0\n-5 5\n', make(30, 3, 2, -50, 50), make(2000, 10, 3, -1000000, 1000000), make(20000, 20000, 0, -1000000000, 1000000000), make(20000, 5, 1000, -1000000000, 1000000000), spread(20000, 100000, 20000, 99999), spread(20000, 100000, 20000, 100000), make(20000, 1, 0, -1000000000, 1000000000)];
    }
  }
];

// The linear-time versions used by the reference solutions above (they are checked against brute force in tests()).
function fastWell(h) { const first = new Map(); let score = 0, best = 0; for (let i = 0; i < h.length; i++) { score += h[i] > 8 ? 1 : -1; if (score > 0) best = i + 1; else { if (!first.has(score)) first.set(score, i); if (first.has(score - 1)) best = Math.max(best, i - first.get(score - 1)); } } return best; }
function fastVowels(s) { const first = new Map([[0, -1]]); let mask = 0, best = 0; for (let i = 0; i < s.length; i++) { const j = 'aeiou'.indexOf(s[i]); if (j >= 0) mask ^= 1 << j; if (first.has(mask)) best = Math.max(best, i - first.get(mask)); else first.set(mask, i); } return best; }
