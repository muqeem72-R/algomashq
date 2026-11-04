import { r, rng, randInt, randArray, many, arr, nums, rows, mat, shuffle, randWord, randDistinct } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';

// A square matrix whose rows and columns both increase (values are not unique).
function sortedSquare(g, n, spread, offset) {
  const grid = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    let v = offset + randInt(g, 0, spread) + (i + j) * 2;
    if (i > 0) v = Math.max(v, grid[i - 1][j]);
    if (j > 0) v = Math.max(v, grid[i][j - 1]);
    grid[i][j] = v;
  }
  return grid;
}

export default [
  {
    slug: 'minimum-window-substring',
    title: 'Smallest Window Containing All Letters',
    difficulty: 'hard',
    tags: ['strings', 'sliding-window', 'counting'],
    concept: {
      title: 'Count what is still missing',
      body: [
        'You want the shortest block of `s` that contains every letter of `t` (with repeats: if `t` has two `a`, the block needs two). Keep a table `need` with the number of copies of each letter that the window still lacks (it goes negative for surplus letters) and a counter `missing` of the total number of letters still missing.',
        { code: 'for r, ch in enumerate(s):\n    if need[ch] > 0: missing -= 1\n    need[ch] -= 1\n    while missing == 0:            # the window [l, r] contains all of t\n        best = min(best, r - l + 1)\n        need[s[l]] += 1\n        if need[s[l]] > 0: missing += 1\n        l += 1' },
        'The right end grows until the window is valid; then the left end shrinks as far as the window stays valid, recording every valid length on the way. Each end moves forward only, so the scan is O(n).'
      ]
    },
    statement: ['Given two words `s` and `t`, find the shortest block of consecutive letters of `s` that contains every letter of `t`, counting repeated letters (if `t` has `a` twice, the block must have at least two `a`). If several blocks have the shortest length, print the one that starts first. If no block works, print -1.'],
    inputFormat: ['The first line has `s`.', 'The second line has `t`.'],
    outputFormat: ['Print the block, or -1.'],
    constraints: ['1 <= length of s <= 20000', '1 <= length of t <= 100', 'Both words contain lowercase letters.'],
    examples: [{ input: 'adobecodebanc\nabc\n', note: 'The shortest block with a, b and c is banc.' }, { input: 'a\nb\n', note: 'There is no b.' }],
    hints: ['Count how many copies of each letter of `t` are needed.', 'Move the right end forward; count a letter as found only if it was still needed.', 'When nothing is missing, record the window and move the left end forward while the window stays valid.'],
    program: {
      io: ['s:word', 't:word'],
      python: r`
        need = [0] * 26
        for ch in t:
            need[ord(ch) - ord("a")] += 1
        missing = len(t)
        bestL, bestLen = 0, len(s) + 1
        l = 0
        for rr, ch in enumerate(s):
            c = ord(ch) - ord("a")
            if need[c] > 0:
                missing -= 1
            need[c] -= 1
            while missing == 0:
                if rr - l + 1 < bestLen:
                    bestLen = rr - l + 1
                    bestL = l
                d = ord(s[l]) - ord("a")
                need[d] += 1
                if need[d] > 0:
                    missing += 1
                l += 1
        print(s[bestL:bestL + bestLen] if bestLen <= len(s) else -1)`,
      cpp: r`
        vector<int> need(26, 0);
        for (char ch : t) need[ch - 'a']++;
        int missing = t.size(), bestL = 0, bestLen = s.size() + 1, l = 0;
        for (int rr = 0; rr < (int) s.size(); rr++) {
            int c = s[rr] - 'a';
            if (need[c] > 0) missing--;
            need[c]--;
            while (missing == 0) {
                if (rr - l + 1 < bestLen) {
                    bestLen = rr - l + 1;
                    bestL = l;
                }
                int d = s[l] - 'a';
                need[d]++;
                if (need[d] > 0) missing++;
                l++;
            }
        }
        if (bestLen > (int) s.size()) cout << -1 << "\n";
        else cout << s.substr(bestL, bestLen) << "\n";`,
      java: r`
        int[] need = new int[26];
        for (int i = 0; i < t.length(); i++) need[t.charAt(i) - 'a']++;
        int missing = t.length(), bestL = 0, bestLen = s.length() + 1, l = 0;
        for (int rr = 0; rr < s.length(); rr++) {
            int c = s.charAt(rr) - 'a';
            if (need[c] > 0) missing--;
            need[c]--;
            while (missing == 0) {
                if (rr - l + 1 < bestLen) {
                    bestLen = rr - l + 1;
                    bestL = l;
                }
                int d = s.charAt(l) - 'a';
                need[d]++;
                if (need[d] > 0) missing++;
                l++;
            }
        }
        System.out.println(bestLen > s.length() ? "-1" : s.substring(bestL, bestL + bestLen));`
    },
    solution: { explanation: ['The window grows on the right until it covers `t`, then shrinks on the left while it still covers `t`. The shortest covering window seen, the first one on ties, is the answer.'], complexity: 'Time O(|s| + |t|), space O(1).' },
    solve(input) { const [s, t] = rows(input); const need = {}; for (const ch of t) need[ch] = (need[ch] || 0) + 1; let missing = t.length, bestL = 0, bestLen = s.length + 1, l = 0; for (let rr = 0; rr < s.length; rr++) { const c = s[rr]; if ((need[c] || 0) > 0) missing--; need[c] = (need[c] || 0) - 1; while (missing === 0) { if (rr - l + 1 < bestLen) { bestLen = rr - l + 1; bestL = l; } const d = s[l]; need[d]++; if (need[d] > 0) missing++; l++; } } return bestLen > s.length ? '-1' : s.slice(bestL, bestL + bestLen); },
    tests() {
      const g = rng(201);
      const brute = (s, t) => { const cnt = (w) => { const c = {}; for (const ch of w) c[ch] = (c[ch] || 0) + 1; return c; }; const ct = cnt(t); for (let len = 1; len <= s.length; len++) for (let i = 0; i + len <= s.length; i++) { const cw = cnt(s.slice(i, i + len)); if (Object.keys(ct).every((k) => (cw[k] || 0) >= ct[k])) return s.slice(i, i + len); } return '-1'; };
      for (let k = 0; k < 200; k++) { const s = randWord(g, randInt(g, 1, 14), 'abc'), t = randWord(g, randInt(g, 1, 4), 'abc'); if (brute(s, t) !== this.solve(`${s}\n${t}\n`)) throw new Error('window reference differs from brute force'); }
      return ['adobecodebanc\nabc\n', 'a\nb\n', 'a\na\n', 'a\naa\n', 'aa\naa\n', 'abc\ncba\n', `${randWord(g, 50, 'abc')}\n${randWord(g, 4, 'abc')}\n`, `${randWord(g, 20000, 'abcdef')}\n${randWord(g, 30, 'abcdef')}\n`, `${randWord(g, 20000, LOW)}\n${randWord(g, 8, LOW)}\n`, `${'a'.repeat(19999)}b\n${'ab'}\n`, `${randWord(g, 20000, 'abc')}\n${'abc'.repeat(30)}\n`];
    }
  },

  {
    slug: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'hard',
    tags: ['arrays', 'two-pointers', 'prefix-max'],
    concept: {
      title: 'Water level = the lower of the two tallest walls around',
      body: [
        'On top of position `i` the water can rise up to `min(tallest wall to the left, tallest wall to the right)`, as long as that is higher than the bar itself. So the water above bar `i` is `min(maxLeft, maxRight) - h[i]`. Computing both maxima for every `i` would need two helper arrays.',
        'Two pointers avoid them. Keep `l` and `r` at both ends and the largest bars `leftMax` and `rightMax` seen so far from each side. If `h[l] < h[r]`, the right side certainly has a wall at least as tall as `h[l]`, so the water at `l` depends only on `leftMax`: add `leftMax - h[l]` and move `l`. Otherwise do the same on the right.',
        { code: 'while l < r:\n    if h[l] < h[r]:\n        leftMax = max(leftMax, h[l])\n        water += leftMax - h[l]\n        l += 1\n    else:\n        rightMax = max(rightMax, h[r])\n        water += rightMax - h[r]\n        r -= 1' }
      ]
    },
    statement: ['An elevation map is made of `n` bars of width 1 with the given heights. After rain, water is trapped between the bars. Print the total amount of water (the number of unit squares of water) that stays on the map. Water running over the left or right end is lost.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` heights.'],
    outputFormat: ['Print the amount of trapped water.'],
    constraints: ['1 <= n <= 20000', '0 <= each height <= 10^4'],
    examples: [{ input: '12\n0 1 0 2 1 0 1 3 2 1 2 1\n', note: 'The trapped water amounts to 6 units.' }],
    hints: ['The water above a bar is the lower of the tallest bar on its left and the tallest bar on its right, minus the bar itself.', 'You can compute this with two helper arrays of prefix and suffix maxima.', 'Or use two pointers: process the side with the smaller current bar, keeping its running maximum.'],
    program: {
      io: ['n:int', 'h:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        l, rr = 0, n - 1
        leftMax = rightMax = 0
        water = 0
        while l < rr:
            if h[l] < h[rr]:
                leftMax = max(leftMax, h[l])
                water += leftMax - h[l]
                l += 1
            else:
                rightMax = max(rightMax, h[rr])
                water += rightMax - h[rr]
                rr -= 1
        print(water)`,
      cpp: r`
        int l = 0, rr = n - 1;
        long long leftMax = 0, rightMax = 0, water = 0;
        while (l < rr) {
            if (h[l] < h[rr]) {
                leftMax = max(leftMax, h[l]);
                water += leftMax - h[l];
                l++;
            } else {
                rightMax = max(rightMax, h[rr]);
                water += rightMax - h[rr];
                rr--;
            }
        }
        cout << water << "\n";`,
      java: r`
        int l = 0, rr = (int) n - 1;
        long leftMax = 0, rightMax = 0, water = 0;
        while (l < rr) {
            if (h[l] < h[rr]) {
                leftMax = Math.max(leftMax, h[l]);
                water += leftMax - h[l];
                l++;
            } else {
                rightMax = Math.max(rightMax, h[rr]);
                water += rightMax - h[rr];
                rr--;
            }
        }
        System.out.println(water);`
    },
    solution: { explanation: ['The side with the lower end bar is the side whose water level is already decided by its own running maximum. Two pointers close in from the ends and add the water over each bar once.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const h = nums(rows(input)[1]); const n = h.length; const left = [], right = []; let m = 0; for (let i = 0; i < n; i++) { m = Math.max(m, h[i]); left.push(m); } m = 0; for (let i = n - 1; i >= 0; i--) { m = Math.max(m, h[i]); right[i] = m; } let w = 0; for (let i = 0; i < n; i++) w += Math.min(left[i], right[i]) - h[i]; return String(w); },
    tests() { const g = rng(202); const make = (n, hi) => arr(randArray(g, n, 0, hi)); const valley = (n) => arr([...many(n / 2, (i) => n - i), ...many(n / 2, (i) => i + 1)].map((x) => x % 10000)); return ['12\n0 1 0 2 1 0 1 3 2 1 2 1\n', '1\n5\n', '2\n3 4\n', '3\n3 0 3\n', '6\n4 2 0 3 2 5\n', '5\n1 2 3 4 5\n', make(15, 9), make(500, 100), make(20000, 10000), make(20000, 5), valley(20000), `20000\n${many(20000, (i) => (i % 2 ? 0 : 10000)).join(' ')}\n`]; }
  },

  {
    slug: 'first-missing-positive',
    title: 'First Missing Positive',
    difficulty: 'hard',
    tags: ['arrays', 'in-place', 'cyclic-sort'],
    concept: {
      title: 'Use the array itself as a table',
      body: [
        'The answer is a number between 1 and `n + 1`: among `n` numbers at most `n` different positive values can be present. So only values in `1..n` matter. Put each value `x` into the place `x - 1` by swapping it there, so that the array becomes a table "position i holds the number i + 1 if it exists".',
        { code: 'for i in range(n):\n    while 1 <= a[i] <= n and a[a[i] - 1] != a[i]:\n        j = a[i] - 1\n        a[i], a[j] = a[j], a[i]\n# now the first i with a[i] != i + 1 gives the answer i + 1' },
        'Each swap puts one value at its final place, so there are at most `n` swaps in total and the loop is O(n) although it is nested. The check `a[a[i] - 1] != a[i]` also stops duplicates from swapping forever. No extra memory is used.'
      ]
    },
    statement: ['Given an array of `n` integers (negative numbers, zero and duplicates are possible), find the smallest positive integer that does not occur in the array.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the smallest missing positive integer.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '4\n3 4 -1 1\n', note: '1 is present, 2 is missing.' }, { input: '3\n1 2 3\n', note: '1, 2 and 3 are present, so the answer is 4.' }],
    hints: ['The answer is at most n + 1.', 'Try to move every value x with 1 <= x <= n to index x - 1 by swapping.', 'Then scan: the first index i where `a[i] != i + 1` gives the answer `i + 1`; if there is none, the answer is n + 1.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        for i in range(n):
            while 1 <= a[i] <= n and a[a[i] - 1] != a[i]:
                j = a[i] - 1
                a[i], a[j] = a[j], a[i]
        answer = n + 1
        for i in range(n):
            if a[i] != i + 1:
                answer = i + 1
                break
        print(answer)`,
      cpp: r`
        for (int i = 0; i < n; i++) {
            while (a[i] >= 1 && a[i] <= n && a[a[i] - 1] != a[i]) {
                swap(a[i], a[a[i] - 1]);
            }
        }
        long long answer = n + 1;
        for (int i = 0; i < n; i++) {
            if (a[i] != i + 1) {
                answer = i + 1;
                break;
            }
        }
        cout << answer << "\n";`,
      java: r`
        for (int i = 0; i < n; i++) {
            while (a[i] >= 1 && a[i] <= n && a[(int) a[i] - 1] != a[i]) {
                int j = (int) a[i] - 1;
                long t = a[i]; a[i] = a[j]; a[j] = t;
            }
        }
        long answer = n + 1;
        for (int i = 0; i < n; i++) {
            if (a[i] != i + 1) {
                answer = i + 1;
                break;
            }
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['Cyclic placement puts every value `x` in `1..n` at index `x - 1`. The first index whose value is wrong marks the smallest missing positive number.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const set = new Set(nums(rows(input)[1])); let x = 1; while (set.has(x)) x++; return String(x); },
    tests() { const g = rng(203); const perm = (n) => arr(shuffle(g, many(n, (i) => i + 1))); return ['4\n3 4 -1 1\n', '3\n1 2 3\n', '1\n1\n', '1\n2\n', '1\n-5\n', '5\n7 8 9 11 12\n', '4\n1 1 1 1\n', '5\n2 2 3 3 1\n', arr(randArray(g, 15, -3, 18)), perm(2000), arr(shuffle(g, many(2000, (i) => (i === 1000 ? 1000000000 : i + 1)))), perm(20000), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, 1, 20000))]; }
  },

  {
    slug: 'median-of-two-sorted-arrays',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'hard',
    tags: ['arrays', 'binary-search', 'partition'],
    concept: {
      title: 'Binary search for the right split',
      body: [
        'The median splits the merged data into a left half and a right half of (almost) equal size. You can find that split **without merging**: cut array `a` at position `i` and array `b` at position `j = half - i`, where `half = (n + m + 1) // 2`. The cut is correct when everything on the left is at most everything on the right. As both arrays are sorted, this only needs two comparisons: `aLeft <= bRight` and `bLeft <= aRight`.',
        { code: 'i = (lo + hi) // 2;  j = half - i\naL = a[i-1] (or -inf)   aR = a[i] (or +inf)\nbL = b[j-1] (or -inf)   bR = b[j] (or +inf)\nif aL <= bR and bL <= aR:   # correct split\nelif aL > bR: hi = i - 1    # took too many from a\nelse: lo = i + 1' },
        'Binary search over `i` in the shorter array takes O(log(min(n, m))). With a correct split, the middle values are `max(aL, bL)` and, for an even total, `min(aR, bR)`. To avoid fractions, this problem asks for **twice the median**.'
      ]
    },
    statement: ['You are given two sorted arrays (increasing order). Consider all `n + m` numbers together in sorted order. Print **twice the median**: for an odd total that is twice the middle number, for an even total it is the sum of the two middle numbers. (This keeps the answer an integer.)'],
    inputFormat: ['The first line has `n` and `m`.', 'The second line has the `n` numbers of the first array.', 'The third line has the `m` numbers of the second array.'],
    outputFormat: ['Print twice the median.'],
    constraints: ['1 <= n, m <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '2 1\n1 3\n2\n', note: 'Together: 1 2 3. The median is 2, so the answer is 4.' }, { input: '2 2\n1 2\n3 4\n', note: 'The middle numbers are 2 and 3, so the answer is 5 (the median is 2.5).' }],
    hints: ['Merging both arrays works but costs O(n + m); a binary search is faster.', 'Cut the shorter array at `i` and the other at `half - i`; the left parts together hold the smaller half.', 'The cut is right if `aL <= bR` and `bL <= aR`; otherwise move `i` left or right.'],
    program: {
      io: ['n:int m:int', 'a:int[n]', 'b:int[m]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        x, y = a, b
        if len(x) > len(y):
            x, y = y, x
        nx, ny = len(x), len(y)
        INF = 10**18
        half = (nx + ny + 1) // 2
        lo, hi = 0, nx
        while lo <= hi:
            i = (lo + hi) // 2
            j = half - i
            aL = x[i - 1] if i > 0 else -INF
            aR = x[i] if i < nx else INF
            bL = y[j - 1] if j > 0 else -INF
            bR = y[j] if j < ny else INF
            if aL <= bR and bL <= aR:
                if (nx + ny) % 2 == 1:
                    print(2 * max(aL, bL))
                else:
                    print(max(aL, bL) + min(aR, bR))
                break
            elif aL > bR:
                hi = i - 1
            else:
                lo = i + 1`,
      cpp: r`
        vector<long long> x = a, y = b;
        if (x.size() > y.size()) swap(x, y);
        long long nx = x.size(), ny = y.size();
        const long long INF = 4000000000000000000LL;
        long long half = (nx + ny + 1) / 2, lo = 0, hi = nx;
        while (lo <= hi) {
            long long i = (lo + hi) / 2, j = half - i;
            long long aL = i > 0 ? x[i - 1] : -INF;
            long long aR = i < nx ? x[i] : INF;
            long long bL = j > 0 ? y[j - 1] : -INF;
            long long bR = j < ny ? y[j] : INF;
            if (aL <= bR && bL <= aR) {
                if ((nx + ny) % 2 == 1) cout << 2 * max(aL, bL) << "\n";
                else cout << max(aL, bL) + min(aR, bR) << "\n";
                break;
            } else if (aL > bR) {
                hi = i - 1;
            } else {
                lo = i + 1;
            }
        }`,
      java: r`
        long[] x = a, y = b;
        if (x.length > y.length) {
            long[] t = x; x = y; y = t;
        }
        int nx = x.length, ny = y.length;
        final long INF = 4000000000000000000L;
        int half = (nx + ny + 1) / 2, lo = 0, hi = nx;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = half - i;
            long aL = i > 0 ? x[i - 1] : -INF;
            long aR = i < nx ? x[i] : INF;
            long bL = j > 0 ? y[j - 1] : -INF;
            long bR = j < ny ? y[j] : INF;
            if (aL <= bR && bL <= aR) {
                if ((nx + ny) % 2 == 1) System.out.println(2 * Math.max(aL, bL));
                else System.out.println(Math.max(aL, bL) + Math.min(aR, bR));
                break;
            } else if (aL > bR) {
                hi = i - 1;
            } else {
                lo = i + 1;
            }
        }`
    },
    solution: { explanation: ['A correct cut puts the smaller half of all numbers on the left. Binary search on the cut of the shorter array finds it in O(log(min(n, m))) comparisons.'], complexity: 'Time O(log(min(n, m))) after reading, space O(1).' },
    solve(input) { const rs = rows(input); const all = [...nums(rs[1]), ...nums(rs[2])].sort((p, s) => p - s); const t = all.length; return String(t % 2 ? 2 * all[(t - 1) / 2] : all[t / 2 - 1] + all[t / 2]); },
    tests() { const g = rng(204); const two = (n, m, lo, hi) => `${n} ${m}\n${randArray(g, n, lo, hi).sort((p, s) => p - s).join(' ')}\n${randArray(g, m, lo, hi).sort((p, s) => p - s).join(' ')}\n`; return ['2 1\n1 3\n2\n', '2 2\n1 2\n3 4\n', '1 1\n5\n5\n', '1 1\n-1000000000\n1000000000\n', '3 1\n1 2 3\n100\n', '1 3\n-100\n1 2 3\n', '2 2\n1 2\n1 2\n', two(5, 8, -20, 20), two(100, 3, -100, 100), two(20000, 20000, -1000000000, 1000000000), two(20000, 1, -1000000000, 1000000000), two(15000, 20000, 0, 10), two(1, 20000, -1000, 1000)]; }
  },

  {
    slug: 'days-to-make-bouquets',
    title: 'Days to Make Bouquets',
    difficulty: 'hard',
    tags: ['arrays', 'binary-search', 'binary-search-on-answer'],
    concept: {
      title: 'Binary search on the day',
      body: [
        'Flower `i` blooms on day `d[i]`. A bouquet needs `k` flowers that are **next to each other** and already bloomed. For a fixed day `D`, count how many bouquets you can make: walk along the garden, count the length of the current run of bloomed flowers (`d[i] <= D`), and every time the run reaches `k` make a bouquet and start a new run.',
        { code: 'def bouquets(D):\n    count = run = 0\n    for x in d:\n        if x <= D:\n            run += 1\n            if run == k: count += 1; run = 0\n        else:\n            run = 0\n    return count' },
        'More days never give fewer bouquets, so "bouquets(D) >= m" is monotone in `D`. Binary search the smallest day for which it holds. If the garden does not even have `m * k` flowers, the answer is -1.'
      ]
    },
    statement: ['A garden has `n` flowers in a row. Flower `i` blooms on day `d[i]` and stays bloomed. You need to make `m` bouquets. Each bouquet uses `k` flowers that are next to each other in the garden, all bloomed, and a flower can be used in one bouquet only. Find the earliest day on which `m` bouquets can be made, or print -1 if it is impossible.'],
    inputFormat: ['The first line has `n`, `m` and `k`.', 'The second line has the `n` bloom days.'],
    outputFormat: ['Print the day, or -1.'],
    constraints: ['1 <= n <= 20000', '1 <= m, k <= n', '1 <= each bloom day <= 10^9'],
    examples: [{ input: '5 2 1\n1 10 3 10 2\n', note: 'On day 3 the flowers 1, 3 and 5 are bloomed: two bouquets of one flower are possible.' }],
    hints: ['If `m * k > n`, the answer is -1.', 'For a given day, scan the garden and cut a bouquet whenever a run of `k` bloomed flowers is complete.', 'Binary search the smallest day (between the smallest and the largest bloom day) with enough bouquets.'],
    program: {
      io: ['n:int m:int k:int', 'd:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        if m * k > n:
            print(-1)
        else:
            lo, hi = min(d), max(d)
            while lo < hi:
                mid = (lo + hi) // 2
                count = run = 0
                for x in d:
                    if x <= mid:
                        run += 1
                        if run == k:
                            count += 1
                            run = 0
                    else:
                        run = 0
                if count >= m:
                    hi = mid
                else:
                    lo = mid + 1
            print(lo)`,
      cpp: r`
        if (m * k > n) {
            cout << -1 << "\n";
        } else {
            long long lo = *min_element(d.begin(), d.end()), hi = *max_element(d.begin(), d.end());
            while (lo < hi) {
                long long mid = (lo + hi) / 2, count = 0, run = 0;
                for (int i = 0; i < n; i++) {
                    if (d[i] <= mid) {
                        run++;
                        if (run == k) {
                            count++;
                            run = 0;
                        }
                    } else {
                        run = 0;
                    }
                }
                if (count >= m) hi = mid;
                else lo = mid + 1;
            }
            cout << lo << "\n";
        }`,
      java: r`
        if (m * k > n) {
            System.out.println(-1);
        } else {
            long lo = Long.MAX_VALUE, hi = 0;
            for (int i = 0; i < n; i++) {
                lo = Math.min(lo, d[i]);
                hi = Math.max(hi, d[i]);
            }
            while (lo < hi) {
                long mid = (lo + hi) / 2, count = 0, run = 0;
                for (int i = 0; i < n; i++) {
                    if (d[i] <= mid) {
                        run++;
                        if (run == k) {
                            count++;
                            run = 0;
                        }
                    } else {
                        run = 0;
                    }
                }
                if (count >= m) hi = mid;
                else lo = mid + 1;
            }
            System.out.println(lo);
        }`
    },
    solution: { explanation: ['For one day the greedy scan counts the bouquets exactly. The count never decreases with the day, so binary search finds the first day with at least `m` bouquets.'], complexity: 'Time O(n log(max day)), space O(1).' },
    solve(input) { const rs = rows(input); const [n, m, k] = nums(rs[0]); const d = nums(rs[1]); if (m * k > n) return '-1'; const ok = (D) => { let c = 0, run = 0; for (const x of d) { if (x <= D) { run++; if (run === k) { c++; run = 0; } } else run = 0; } return c >= m; }; const days = [...new Set(d)].sort((p, s) => p - s); let lo = 0, hi = days.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (ok(days[mid])) hi = mid; else lo = mid + 1; } return String(days[lo]); },
    tests() { const g = rng(205); const make = (n, m, k, hi) => `${n} ${m} ${k}\n${randArray(g, n, 1, hi).join(' ')}\n`; return ['5 2 1\n1 10 3 10 2\n', '5 3 2\n1 10 3 10 2\n', '7 2 3\n7 7 7 7 12 7 7\n', '1 1 1\n5\n', '3 1 3\n1 2 3\n', make(12, 2, 3, 20), make(500, 20, 7, 1000), make(20000, 100, 100, 1000000000), make(20000, 20000, 1, 1000000000), make(20000, 1, 20000, 1000000000), make(20000, 5000, 3, 50), make(20000, 7, 2000, 1000)]; }
  },

  {
    slug: 'aggressive-cows',
    title: 'Place the Cows Far Apart',
    difficulty: 'hard',
    tags: ['arrays', 'binary-search', 'greedy', 'binary-search-on-answer'],
    concept: {
      title: 'Binary search on the distance, greedy for the check',
      body: [
        'You must place `c` cows in `n` stalls so that the smallest distance between two cows is as large as possible. Ask the yes/no question: "can we place all cows with every two at least `D` apart?" With the stall positions sorted, a **greedy** check answers it: put the first cow in the first stall and always put the next cow in the nearest stall that is at least `D` away from the previous one.',
        { code: 'def can(D):\n    count, last = 1, x[0]\n    for p in x[1:]:\n        if p - last >= D:\n            count += 1; last = p\n    return count >= c' },
        'If `D` works, any smaller distance works too, so the answers are "yes ... yes no ... no" and the largest `D` with "yes" can be found by binary search. Because we look for the **largest** good value, use `mid = (lo + hi + 1) // 2` to avoid an endless loop.'
      ]
    },
    statement: ['A farm has `n` stalls at different positions on a line. Place `c` cows in different stalls so that the smallest distance between any two cows is as large as possible. Print that largest possible smallest distance.'],
    inputFormat: ['The first line has `n` and `c`.', 'The second line has the `n` stall positions (all different, in any order).'],
    outputFormat: ['Print the largest possible minimum distance.'],
    constraints: ['2 <= c <= n <= 20000', '0 <= each position <= 10^9'],
    examples: [{ input: '5 3\n1 2 8 4 9\n', note: 'Place the cows at 1, 4 and 9: the smallest distance is 3.' }],
    hints: ['Sort the positions first.', 'To test a distance D, place the first cow at the first stall and then each cow in the first stall at least D after the last cow.', 'Binary search the largest D that fits all cows; use `mid = (lo + hi + 1) // 2`.'],
    program: {
      io: ['n:int c:int', 'x:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        x.sort()
        lo, hi = 1, x[-1] - x[0]
        while lo < hi:
            mid = (lo + hi + 1) // 2
            count = 1
            last = x[0]
            for p in x[1:]:
                if p - last >= mid:
                    count += 1
                    last = p
            if count >= c:
                lo = mid
            else:
                hi = mid - 1
        print(lo)`,
      cpp: r`
        sort(x.begin(), x.end());
        long long lo = 1, hi = x[n - 1] - x[0];
        while (lo < hi) {
            long long mid = (lo + hi + 1) / 2, count = 1, last = x[0];
            for (int i = 1; i < n; i++) {
                if (x[i] - last >= mid) {
                    count++;
                    last = x[i];
                }
            }
            if (count >= c) lo = mid;
            else hi = mid - 1;
        }
        cout << lo << "\n";`,
      java: r`
        Arrays.sort(x);
        long lo = 1, hi = x[(int) n - 1] - x[0];
        while (lo < hi) {
            long mid = (lo + hi + 1) / 2, count = 1, last = x[0];
            for (int i = 1; i < n; i++) {
                if (x[i] - last >= mid) {
                    count++;
                    last = x[i];
                }
            }
            if (count >= c) lo = mid;
            else hi = mid - 1;
        }
        System.out.println(lo);`
    },
    solution: { explanation: ['Greedy placement decides whether a distance is possible, and feasibility is monotone in the distance. Binary search finds the largest feasible distance.'], complexity: 'Time O(n log n + n log(range)), space O(1).' },
    solve(input) { const rs = rows(input); const c = nums(rs[0])[1]; const x = nums(rs[1]).sort((p, s) => p - s); const can = (D) => { let cnt = 1, last = x[0]; for (let i = 1; i < x.length; i++) if (x[i] - last >= D) { cnt++; last = x[i]; } return cnt >= c; }; let lo = 1, hi = x[x.length - 1] - x[0]; while (lo < hi) { const mid = Math.floor((lo + hi + 1) / 2); if (can(mid)) lo = mid; else hi = mid - 1; } return String(lo); },
    tests() {
      const g = rng(206);
      const make = (n, c, hi) => `${n} ${c}\n${shuffle(g, randDistinct(g, n, 0, hi)).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const c = nums(rs[0])[1]; const x = nums(rs[1]).sort((p, s) => p - s); const n = x.length; let best = 0; const pick = (start, left, last, minGap) => { if (left === 0) { best = Math.max(best, minGap); return; } for (let i = start; i < n; i++) pick(i + 1, left - 1, x[i], last === null ? Infinity : Math.min(minGap, x[i] - last)); }; for (let i = 0; i < n; i++) pick(i + 1, c - 1, x[i], Infinity); return String(best); };
      for (let t = 0; t < 60; t++) { const n = randInt(g, 2, 9); const input = make(n, randInt(g, 2, n), 40); if (brute(input) !== this.solve(input)) throw new Error('cows reference differs from brute force'); }
      return ['5 3\n1 2 8 4 9\n', '2 2\n5 7\n', '3 3\n1 2 3\n', '4 2\n0 1000000000 5 6\n', make(10, 4, 50), make(50, 7, 1000), make(300, 100, 100000), make(2000, 2, 1000000000), make(2000, 700, 100000), make(20000, 10, 1000000000), make(20000, 5000, 1000000000)];
    }
  },

  {
    slug: 'kth-smallest-in-sorted-matrix',
    title: 'k-th Smallest in a Sorted Matrix',
    difficulty: 'hard',
    tags: ['matrix', 'binary-search', 'binary-search-on-answer'],
    concept: {
      title: 'Binary search on the value, count with the staircase',
      body: [
        'The `n` by `n` matrix is sorted in every row and every column, but not as a whole. To find the k-th smallest value, binary search on the **value** `v` between the smallest cell (top left) and the largest (bottom right). For a candidate `v`, count the cells that are `<= v`. The k-th smallest is the smallest `v` for which this count is at least `k`.',
        { code: 'def count_at_most(v):\n    count, j = 0, n - 1\n    for i in range(n):\n        while j >= 0 and g[i][j] > v:\n            j -= 1\n        count += j + 1\n    return count' },
        'The count uses the staircase walk from the previous problems: when you move to the next row, the boundary `j` can only move left, so the whole count costs O(n). The binary search needs about 31 rounds for 32-bit values.'
      ]
    },
    statement: ['An `n` by `n` matrix has rows sorted left to right and columns sorted top to bottom (in non-decreasing order). Find the k-th smallest number among all its `n * n` cells, counting duplicates separately (the 1st smallest is the smallest cell).'],
    inputFormat: ['The first line has `n` and `k`.', 'The next `n` lines have `n` integers each.'],
    outputFormat: ['Print the k-th smallest number.'],
    constraints: ['1 <= n <= 100', '1 <= k <= n * n', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '3 8\n1 5 9\n10 11 13\n12 13 15\n', note: 'Sorted: 1 5 9 10 11 12 13 13 15; the 8th is 13.' }],
    hints: ['Binary search on the value between the top left and the bottom right cell.', 'Count the cells not larger than the value with a staircase walk in O(n).', 'If the count is at least k, the answer is at most the value, otherwise it is bigger.'],
    program: {
      io: ['n:int k:int', 'g:int[n][n]'],
      python: r`
        lo, hi = g[0][0], g[n - 1][n - 1]
        while lo < hi:
            mid = lo + (hi - lo) // 2
            count = 0
            j = n - 1
            for i in range(n):
                while j >= 0 and g[i][j] > mid:
                    j -= 1
                count += j + 1
            if count >= k:
                hi = mid
            else:
                lo = mid + 1
        print(lo)`,
      cpp: r`
        long long lo = g[0][0], hi = g[n - 1][n - 1];
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2, count = 0;
            int j = n - 1;
            for (int i = 0; i < n; i++) {
                while (j >= 0 && g[i][j] > mid) j--;
                count += j + 1;
            }
            if (count >= k) hi = mid;
            else lo = mid + 1;
        }
        cout << lo << "\n";`,
      java: r`
        long lo = g[0][0], hi = g[(int) n - 1][(int) n - 1];
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2, count = 0;
            int j = (int) n - 1;
            for (int i = 0; i < n; i++) {
                while (j >= 0 && g[i][j] > mid) j--;
                count += j + 1;
            }
            if (count >= k) hi = mid;
            else lo = mid + 1;
        }
        System.out.println(lo);`
    },
    solution: { explanation: ['`count_at_most(v)` is monotone in `v`. The k-th smallest value is the smallest `v` whose count reaches `k`, found by binary search with O(n) counting.'], complexity: 'Time O(n log(max - min)), space O(1).' },
    solve(input) { const rs = rows(input); const [n, k] = nums(rs[0]); const all = rs.slice(1, 1 + n).flatMap(nums).sort((p, s) => p - s); return String(all[k - 1]); },
    tests() { const g = rng(207); const make = (n, k, spread, offset) => `${n} ${k}\n${mat(sortedSquare(g, n, spread, offset))}`; return ['3 8\n1 5 9\n10 11 13\n12 13 15\n', '1 1\n-5\n', '2 1\n1 2\n1 3\n', '2 4\n1 2\n1 3\n', make(5, 13, 10, -20), make(20, 1, 50, 0), make(20, 400, 50, 0), make(60, 1800, 1000, -100000), make(100, 5000, 100000, -500000000), make(100, 10000, 5, 1000000), make(100, 1, 3, 0)]; }
  },

  {
    slug: 'kth-smallest-pair-distance',
    title: 'k-th Smallest Pair Distance',
    difficulty: 'hard',
    tags: ['arrays', 'binary-search', 'two-pointers', 'sorting'],
    concept: {
      title: 'Count pairs below a distance with two pointers',
      body: [
        'There are `n * (n - 1) / 2` pairs, far too many to list for big `n`. Instead binary search the **distance** `D`. After sorting the array, the number of pairs with distance at most `D` is found with two pointers: for every right end `r`, the left pointer `l` is the first index with `a[r] - a[l] <= D`, and all `r - l` elements between them form a good pair with `a[r]`.',
        { code: 'a.sort()\ndef count_at_most(D):\n    count = l = 0\n    for r in range(n):\n        while a[r] - a[l] > D: l += 1\n        count += r - l\n    return count' },
        'The k-th smallest distance is the smallest `D` with `count_at_most(D) >= k`. The left pointer never moves back as `r` grows, so each count is O(n), and the search takes about 30 rounds.'
      ]
    },
    statement: ['Given an array of `n` integers, consider the distance `|a[i] - a[j]|` of every pair of positions `i < j`. Print the k-th smallest of these `n * (n - 1) / 2` distances (the 1st smallest is the smallest distance).'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the k-th smallest distance.'],
    constraints: ['2 <= n <= 20000', '1 <= k <= n * (n - 1) / 2', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '3 2\n1 3 1\n', note: 'The distances are 2, 0, 2 (pairs 1-3, 1-1, 3-1); sorted 0 2 2, the 2nd is 2.' }],
    hints: ['Sort the array so that equal distances are easy to count.', 'For a distance D count the pairs with distance at most D with two pointers in O(n).', 'Binary search the smallest D for which the count reaches k.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        a.sort()
        lo, hi = 0, a[-1] - a[0]
        while lo < hi:
            mid = lo + (hi - lo) // 2
            count = 0
            l = 0
            for rr in range(n):
                while a[rr] - a[l] > mid:
                    l += 1
                count += rr - l
            if count >= k:
                hi = mid
            else:
                lo = mid + 1
        print(lo)`,
      cpp: r`
        sort(a.begin(), a.end());
        long long lo = 0, hi = a[n - 1] - a[0];
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2, count = 0;
            int l = 0;
            for (int rr = 0; rr < n; rr++) {
                while (a[rr] - a[l] > mid) l++;
                count += rr - l;
            }
            if (count >= k) hi = mid;
            else lo = mid + 1;
        }
        cout << lo << "\n";`,
      java: r`
        Arrays.sort(a);
        long lo = 0, hi = a[(int) n - 1] - a[0];
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2, count = 0;
            int l = 0;
            for (int rr = 0; rr < n; rr++) {
                while (a[rr] - a[l] > mid) l++;
                count += rr - l;
            }
            if (count >= k) hi = mid;
            else lo = mid + 1;
        }
        System.out.println(lo);`
    },
    solution: { explanation: ['The number of pairs within distance `D` is monotone in `D` and can be counted in O(n) after sorting. Binary search on `D` finds the k-th smallest distance.'], complexity: 'Time O(n log n + n log(range)), space O(1).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]).sort((p, s) => p - s); const n = a.length; const count = (D) => { let c = 0, l = 0; for (let rr = 0; rr < n; rr++) { while (a[rr] - a[l] > D) l++; c += rr - l; } return c; }; let lo = 0, hi = a[n - 1] - a[0]; while (lo < hi) { const mid = lo + Math.floor((hi - lo) / 2); if (count(mid) >= k) hi = mid; else lo = mid + 1; } return String(lo); },
    tests() {
      const g = rng(208);
      const brute = (a, k) => { const d = []; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) d.push(Math.abs(a[i] - a[j])); return d.sort((p, s) => p - s)[k - 1]; };
      for (let t = 0; t < 200; t++) { const n = randInt(g, 2, 9); const a = randArray(g, n, -9, 9); const k = randInt(g, 1, (n * (n - 1)) / 2); if (String(brute(a, k)) !== this.solve(`${n} ${k}\n${a.join(' ')}\n`)) throw new Error('pair distance reference differs from brute force'); }
      const make = (n, k, lo, hi) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      return ['3 2\n1 3 1\n', '2 1\n5 5\n', '2 1\n-1000000000 1000000000\n', '4 6\n1 2 4 8\n', make(8, 10, -20, 20), make(500, 60000, -1000, 1000), make(20000, 1, -1000000000, 1000000000), make(20000, 199990000, -1000000000, 1000000000), make(20000, 100000000, 0, 1000000), make(20000, 5, 0, 10)];
    }
  },

  {
    slug: 'shortest-window-all-distinct',
    title: 'Shortest Block With All Different Letters',
    difficulty: 'hard',
    tags: ['strings', 'sliding-window', 'counting'],
    concept: {
      title: 'Count the different letters inside the window',
      body: [
        'First find out how many different letters the whole word has: call it `total`. A block is "complete" when it contains all `total` different letters (each at least once). Keep a count per letter inside the window and a variable `distinct` that says how many letters have a positive count.',
        { code: 'for r, ch in enumerate(s):\n    add ch to the window (distinct += 1 if its count was 0)\n    while distinct == total:\n        best = min(best, r - l + 1)\n        remove s[l] from the window (distinct -= 1 if its count becomes 0)\n        l += 1' },
        'This is the same window pattern as the smallest window containing a given set of letters; here the "set" is simply all letters of the word, which is why the target does not have to be read from the input.'
      ]
    },
    statement: ['A word contains some number of different letters. Find the length of its shortest block of consecutive letters that contains every one of those different letters at least once.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the length of the shortest such block.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'aabcbcdbca\n', note: 'The word has the letters a, b, c, d. The block dbca (length 4) contains all of them.' }],
    hints: ['Count how many different letters the whole word has.', 'Grow the window on the right until it contains all of them.', 'Then shrink it from the left while it still does, and record the shortest length.'],
    program: {
      io: ['s:word'],
      includes: ['<algorithm>'],
      python: r`
        total = len(set(s))
        count = [0] * 26
        distinct = 0
        l = 0
        best = len(s)
        for rr, ch in enumerate(s):
            c = ord(ch) - ord("a")
            if count[c] == 0:
                distinct += 1
            count[c] += 1
            while distinct == total:
                best = min(best, rr - l + 1)
                d = ord(s[l]) - ord("a")
                count[d] -= 1
                if count[d] == 0:
                    distinct -= 1
                l += 1
        print(best)`,
      cpp: r`
        int seen[26] = {0}, total = 0;
        for (char ch : s) {
            if (!seen[ch - 'a']) total++;
            seen[ch - 'a'] = 1;
        }
        int count[26] = {0};
        int distinct = 0, l = 0, best = s.size();
        for (int rr = 0; rr < (int) s.size(); rr++) {
            int c = s[rr] - 'a';
            if (count[c] == 0) distinct++;
            count[c]++;
            while (distinct == total) {
                best = min(best, rr - l + 1);
                int d = s[l] - 'a';
                count[d]--;
                if (count[d] == 0) distinct--;
                l++;
            }
        }
        cout << best << "\n";`,
      java: r`
        boolean[] seen = new boolean[26];
        int total = 0;
        for (int i = 0; i < s.length(); i++) {
            if (!seen[s.charAt(i) - 'a']) total++;
            seen[s.charAt(i) - 'a'] = true;
        }
        int[] count = new int[26];
        int distinct = 0, l = 0, best = s.length();
        for (int rr = 0; rr < s.length(); rr++) {
            int c = s.charAt(rr) - 'a';
            if (count[c] == 0) distinct++;
            count[c]++;
            while (distinct == total) {
                best = Math.min(best, rr - l + 1);
                int d = s.charAt(l) - 'a';
                count[d]--;
                if (count[d] == 0) distinct--;
                l++;
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The window grows until it has all the different letters of the word, then shrinks from the left as far as possible. The shortest length seen is the answer.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const s = input.trim(); const total = new Set(s).size; const count = {}; let distinct = 0, l = 0, best = s.length; for (let rr = 0; rr < s.length; rr++) { if (!count[s[rr]]) distinct++; count[s[rr]] = (count[s[rr]] || 0) + 1; while (distinct === total) { best = Math.min(best, rr - l + 1); count[s[l]]--; if (!count[s[l]]) distinct--; l++; } } return String(best); },
    tests() {
      const g = rng(209);
      const brute = (s) => { const total = new Set(s).size; let best = s.length; for (let i = 0; i < s.length; i++) { const seen = new Set(); for (let j = i; j < s.length; j++) { seen.add(s[j]); if (seen.size === total) { best = Math.min(best, j - i + 1); break; } } } return String(best); };
      for (let t = 0; t < 200; t++) { const s = randWord(g, randInt(g, 1, 16), 'abcd'); if (brute(s) !== this.solve(`${s}\n`)) throw new Error('window reference differs from brute force'); }
      return ['aabcbcdbca\n', 'a\n', 'aaaa\n', 'abc\n', 'abcabc\n', 'aaabbbccc\n', `${randWord(g, 40, 'abcd')}\n`, `${randWord(g, 2000, 'abcdef')}\n`, `${randWord(g, 20000, LOW)}\n`, `${'a'.repeat(10000)}${'b'.repeat(9999)}c\n`, `${randWord(g, 20000, 'abc')}\n`];
    }
  }
];
