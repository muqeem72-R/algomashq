import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randWord } from '../../lib.mjs';

const UP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOW = 'abcdefghijklmnopqrstuvwxyz';

export default [
  {
    slug: 'max-sum-of-k-elements',
    title: 'Best Window of Size k',
    difficulty: 'medium',
    tags: ['arrays', 'sliding-window'],
    concept: {
      title: 'A window that slides',
      body: [
        'The sum of `k` consecutive elements (a **window**) is not recomputed from scratch when the window moves one step to the right. The new window loses its first element and gains one new element, so the sum changes by `a[i] - a[i - k]`.',
        { code: 'window = sum(a[:k])\nbest = window\nfor i in range(k, n):\n    window += a[i] - a[i - k]\n    best = max(best, window)' },
        'That makes the work O(n) instead of O(n * k). Sliding windows are used whenever the answer is about a block of consecutive elements.'
      ]
    },
    statement: ['Given an array of `n` integers (negative numbers are possible) and a number `k`, find the largest sum of `k` consecutive elements.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the largest sum.'],
    constraints: ['1 <= k <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6 3\n1 -2 5 4 -1 2\n', note: 'The windows have sums 4, 7, 8 and 5, so the answer is 8 (5 4 -1).' }],
    hints: ['Compute the sum of the first window directly.', 'When the window moves, subtract the element that leaves and add the element that enters.', 'Keep the largest sum seen.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        window = sum(a[:k])
        best = window
        for i in range(k, n):
            window += a[i] - a[i - k]
            best = max(best, window)
        print(best)`,
      cpp: r`
        long long window = 0;
        for (int i = 0; i < k; i++) window += a[i];
        long long best = window;
        for (int i = k; i < n; i++) {
            window += a[i] - a[i - k];
            best = max(best, window);
        }
        cout << best << "\n";`,
      java: r`
        long window = 0;
        for (int i = 0; i < k; i++) window += a[i];
        long best = window;
        for (int i = (int) k; i < n; i++) {
            window += a[i] - a[(int) (i - k)];
            best = Math.max(best, window);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Each step of the window changes the sum by one added and one removed element, so every window sum is found in O(1).'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); let w = 0; for (let i = 0; i < k; i++) w += a[i]; let best = w; for (let i = k; i < n; i++) { w += a[i] - a[i - k]; best = Math.max(best, w); } return String(best); },
    tests() { const g = rng(141); const make = (n, k, lo, hi) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`; return ['6 3\n1 -2 5 4 -1 2\n', '1 1\n-5\n', '3 3\n1 2 3\n', '4 1\n-3 -1 -2 -9\n', make(12, 4, -9, 9), make(500, 50, -1000, 1000), make(20000, 7, -1000000000, 1000000000), make(20000, 10000, -1000000000, 1000000000), make(20000, 20000, -1000000000, 1000000000), make(20000, 19999, -5, 5)]; }
  },

  {
    slug: 'shortest-subarray-with-sum',
    title: 'Shortest Subarray With Large Enough Sum',
    difficulty: 'medium',
    tags: ['arrays', 'sliding-window', 'two-pointers'],
    concept: {
      title: 'A window that grows and shrinks',
      body: [
        'When all numbers are **positive**, adding an element to a window can only increase its sum and removing one can only decrease it. So you can grow the window on the right until the sum is big enough, then shrink it from the left as far as the sum stays big enough, recording the length every time.',
        { code: 'l = total = 0\nfor r in range(n):\n    total += a[r]\n    while total >= s:\n        best = min(best, r - l + 1)\n        total -= a[l]\n        l += 1' },
        'Both pointers only move forward, so each element enters and leaves the window once: O(n). With negative numbers this idea breaks, because shrinking could increase the sum.'
      ]
    },
    statement: ['Given `n` positive integers and a number `s`, find the length of the shortest block of consecutive elements whose sum is at least `s`. If no block has such a sum, print 0.'],
    inputFormat: ['The first line has `n` and `s`.', 'The second line has `n` positive integers.'],
    outputFormat: ['Print one integer.'],
    constraints: ['1 <= n <= 20000', '1 <= each number <= 10^4', '1 <= s <= 10^9'],
    examples: [{ input: '6 7\n2 3 1 2 4 3\n', note: 'The block 4 3 has sum 7 and length 2.' }],
    hints: ['All numbers are positive, so a longer window never has a smaller sum.', 'Grow the window to the right; while its sum is at least `s`, record its length and shrink it from the left.', 'If nothing was recorded, print 0.'],
    program: {
      io: ['n:int s:int', 'a:int[n]'],
      fast: true,
      python: r`
        best = 0
        l = 0
        total = 0
        for rr in range(n):
            total += a[rr]
            while total >= s:
                length = rr - l + 1
                if best == 0 or length < best:
                    best = length
                total -= a[l]
                l += 1
        print(best)`,
      cpp: r`
        int best = 0, l = 0;
        long long total = 0;
        for (int rr = 0; rr < n; rr++) {
            total += a[rr];
            while (total >= s) {
                int length = rr - l + 1;
                if (best == 0 || length < best) best = length;
                total -= a[l];
                l++;
            }
        }
        cout << best << "\n";`,
      java: r`
        int best = 0, l = 0;
        long total = 0;
        for (int rr = 0; rr < n; rr++) {
            total += a[rr];
            while (total >= s) {
                int length = rr - l + 1;
                if (best == 0 || length < best) best = length;
                total -= a[l];
                l++;
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The right pointer adds elements; whenever the sum reaches `s` the left pointer removes elements as long as possible. The smallest recorded length is the answer.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const [n, s] = nums(rs[0]); const a = nums(rs[1]); let best = 0, l = 0, total = 0; for (let r2 = 0; r2 < n; r2++) { total += a[r2]; while (total >= s) { const len = r2 - l + 1; if (best === 0 || len < best) best = len; total -= a[l]; l++; } } return String(best); },
    tests() { const g = rng(142); const make = (n, s, hi) => `${n} ${s}\n${randArray(g, n, 1, hi).join(' ')}\n`; return ['6 7\n2 3 1 2 4 3\n', '1 5\n5\n', '1 6\n5\n', '3 100\n1 2 3\n', '5 11\n1 2 3 4 5\n', make(15, 20, 9), make(1000, 3000, 100), make(20000, 5000, 10000), make(20000, 1000000, 10000), make(20000, 1000000000, 10000), make(20000, 100000000, 10000)]; }
  },

  {
    slug: 'longest-subarray-sum-at-most',
    title: 'Longest Block With Small Sum',
    difficulty: 'medium',
    tags: ['arrays', 'sliding-window', 'two-pointers'],
    concept: {
      title: 'A window that stays valid',
      body: [
        'Another common window pattern: keep the window **valid** at all times. Extend it by one element on the right, and while it became invalid (here: the sum is too large) move the left end forward until it is valid again. The window length after each step is a candidate for the answer.',
        { code: 'l = total = best = 0\nfor r in range(n):\n    total += a[r]\n    while total > k:\n        total -= a[l]\n        l += 1\n    best = max(best, r - l + 1)' },
        'This works because the numbers are positive: removing an element from the left always lowers the sum, so one forward move of `l` at a time is enough and `l` never has to go back.'
      ]
    },
    statement: ['Given `n` positive integers and a number `k`, find the length of the longest block of consecutive elements whose sum is at most `k`. If even a single element is larger than `k`, print 0.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` positive integers.'],
    outputFormat: ['Print one integer.'],
    constraints: ['1 <= n <= 20000', '1 <= each number <= 10^4', '1 <= k <= 10^9'],
    examples: [{ input: '6 8\n3 1 2 7 1 2\n', note: 'The block 3 1 2 has sum 6 and length 3; adding the 7 would pass 8.' }],
    hints: ['Add the new element on the right.', 'While the sum is larger than `k`, remove the element at the left end.', 'After fixing the window, its length is a candidate for the answer.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        l = 0
        total = 0
        best = 0
        for rr in range(n):
            total += a[rr]
            while total > k:
                total -= a[l]
                l += 1
            best = max(best, rr - l + 1)
        print(best)`,
      cpp: r`
        int l = 0, best = 0;
        long long total = 0;
        for (int rr = 0; rr < n; rr++) {
            total += a[rr];
            while (total > k) {
                total -= a[l];
                l++;
            }
            best = max(best, rr - l + 1);
        }
        cout << best << "\n";`,
      java: r`
        int l = 0, best = 0;
        long total = 0;
        for (int rr = 0; rr < n; rr++) {
            total += a[rr];
            while (total > k) {
                total -= a[l];
                l++;
            }
            best = Math.max(best, rr - l + 1);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Keep a window whose sum is at most `k`. Each new element may break it; then the left end moves right until the sum is small enough again.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); let l = 0, total = 0, best = 0; for (let r2 = 0; r2 < n; r2++) { total += a[r2]; while (total > k) { total -= a[l]; l++; } best = Math.max(best, r2 - l + 1); } return String(best); },
    tests() { const g = rng(143); const make = (n, k, hi) => `${n} ${k}\n${randArray(g, n, 1, hi).join(' ')}\n`; return ['6 8\n3 1 2 7 1 2\n', '1 5\n5\n', '1 4\n5\n', '4 100\n1 2 3 4\n', '4 1\n1 1 1 1\n', make(15, 20, 9), make(1000, 3000, 100), make(20000, 5000, 10000), make(20000, 1000000000, 10000), make(20000, 77777, 10000), make(20000, 9999, 10000)]; }
  },

  {
    slug: 'longest-unique-substring',
    title: 'Longest Substring Without Repeats',
    difficulty: 'medium',
    tags: ['strings', 'sliding-window', 'last-seen'],
    concept: {
      title: 'Remember where each letter was last seen',
      body: [
        'Keep a window `[start, i]` that contains no repeated letter. When the next letter `ch` already occurs inside the window, the window must start right after the previous occurrence of `ch`. A table `last` that stores the last position of every letter gives this in O(1).',
        { code: 'start = best = 0\nlast = {}\nfor i, ch in enumerate(s):\n    if ch in last and last[ch] >= start:\n        start = last[ch] + 1\n    last[ch] = i\n    best = max(best, i - start + 1)' },
        'The test `last[ch] >= start` ignores occurrences that are already outside the window. The start never moves backwards, so one pass is enough.'
      ]
    },
    statement: ['Given a word, find the length of its longest block of consecutive letters in which all letters are different.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print one integer.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'abcabcbb\n', note: 'The longest such block is abc, length 3.' }, { input: 'pwwkew\n', note: 'wke has length 3.' }],
    hints: ['Keep a window with all letters different.', 'Remember the last position of every letter.', 'When a letter repeats inside the window, move the start to just after its previous position.'],
    program: {
      io: ['s:word'],
      includes: ['<algorithm>'],
      python: r`
        last = {}
        start = 0
        best = 0
        for i, ch in enumerate(s):
            if ch in last and last[ch] >= start:
                start = last[ch] + 1
            last[ch] = i
            best = max(best, i - start + 1)
        print(best)`,
      cpp: r`
        vector<int> last(128, -1);
        int start = 0, best = 0;
        for (int i = 0; i < (int) s.size(); i++) {
            if (last[s[i]] >= start) start = last[s[i]] + 1;
            last[s[i]] = i;
            best = max(best, i - start + 1);
        }
        cout << best << "\n";`,
      java: r`
        int[] last = new int[128];
        Arrays.fill(last, -1);
        int start = 0, best = 0;
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (last[ch] >= start) start = last[ch] + 1;
            last[ch] = i;
            best = Math.max(best, i - start + 1);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The window start jumps to just after the previous occurrence of a repeated letter, so the window never contains duplicates.'], complexity: 'Time O(n), space O(1) (a table with one entry per letter).' },
    solve(input) { const s = input.trim(); const last = {}; let start = 0, best = 0; for (let i = 0; i < s.length; i++) { const ch = s[i]; if (ch in last && last[ch] >= start) start = last[ch] + 1; last[ch] = i; best = Math.max(best, i - start + 1); } return String(best); },
    tests() { const g = rng(144); return ['abcabcbb\n', 'pwwkew\n', 'a\n', 'bbbbb\n', 'abcdef\n', 'abba\n', 'dvdf\n', `${randWord(g, 40, 'abcd')}\n`, `${randWord(g, 20000, LOW)}\n`, `${randWord(g, 20000, 'abc')}\n`, `${LOW.repeat(700)}\n`]; }
  },

  {
    slug: 'longest-substring-k-distinct',
    title: 'At Most k Different Letters',
    difficulty: 'medium',
    tags: ['strings', 'sliding-window', 'counting'],
    concept: {
      title: 'A window with a counter for each letter',
      body: [
        'To limit the number of **different** letters in a window, keep a table `count` with the number of times each letter occurs in the window, and a variable `distinct` with the number of letters whose count is above zero.',
        { code: 'c = ord(ch) - 97\nif count[c] == 0: distinct += 1\ncount[c] += 1\nwhile distinct > k:\n    d = ord(s[l]) - 97\n    count[d] -= 1\n    if count[d] == 0: distinct -= 1\n    l += 1' },
        'Adding a letter can only increase `distinct`; removing letters from the left shrinks it again. After the loop the window is valid and its length is a candidate for the answer.'
      ]
    },
    statement: ['Given a word and a number `k`, find the length of the longest block of consecutive letters that contains at most `k` different letters.'],
    inputFormat: ['The first line has `k`.', 'The second line has the word.'],
    outputFormat: ['Print one integer.'],
    constraints: ['1 <= k <= 26', '1 <= length of the word <= 20000', 'The word contains lowercase letters.'],
    examples: [{ input: '2\neceba\n', note: 'The block ece has two different letters and length 3.' }],
    hints: ['Count the letters inside the window and keep the number of different letters.', 'When there are more than k different letters, remove letters from the left.', 'Update the best length after the window is valid again.'],
    program: {
      io: ['k:int', 's:word'],
      includes: ['<algorithm>'],
      python: r`
        count = [0] * 26
        distinct = 0
        l = 0
        best = 0
        for rr, ch in enumerate(s):
            c = ord(ch) - ord("a")
            if count[c] == 0:
                distinct += 1
            count[c] += 1
            while distinct > k:
                d = ord(s[l]) - ord("a")
                count[d] -= 1
                if count[d] == 0:
                    distinct -= 1
                l += 1
            best = max(best, rr - l + 1)
        print(best)`,
      cpp: r`
        int count[26] = {0};
        int distinct = 0, l = 0, best = 0;
        for (int rr = 0; rr < (int) s.size(); rr++) {
            int c = s[rr] - 'a';
            if (count[c] == 0) distinct++;
            count[c]++;
            while (distinct > k) {
                int d = s[l] - 'a';
                count[d]--;
                if (count[d] == 0) distinct--;
                l++;
            }
            best = max(best, rr - l + 1);
        }
        cout << best << "\n";`,
      java: r`
        int[] count = new int[26];
        int distinct = 0, l = 0, best = 0;
        for (int rr = 0; rr < s.length(); rr++) {
            int c = s.charAt(rr) - 'a';
            if (count[c] == 0) distinct++;
            count[c]++;
            while (distinct > k) {
                int d = s.charAt(l) - 'a';
                count[d]--;
                if (count[d] == 0) distinct--;
                l++;
            }
            best = Math.max(best, rr - l + 1);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The window keeps at most `k` different letters. The counters tell when a letter disappears from the window completely.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const [k0, s] = rows(input); const k = Number(k0); let best = 0; for (let i = 0; i < s.length; i++) { const set = new Set(); for (let j = i; j < s.length; j++) { set.add(s[j]); if (set.size > k) break; best = Math.max(best, j - i + 1); } } return String(best); },
    tests() { const g = rng(145); return ['2\neceba\n', '1\na\n', '1\naaabbb\n', '3\nabcabc\n', '26\nabcdefghijklmnopqrstuvwxyz\n', `3\n${randWord(g, 60, 'abcdef')}\n`, `2\n${randWord(g, 3000, 'abcde')}\n`, `4\n${randWord(g, 3000, 'abcdefgh')}\n`, `5\n${randWord(g, 3000, LOW)}\n`]; }
  },

  {
    slug: 'longest-repeating-replacement',
    title: 'Longest Block After k Replacements',
    difficulty: 'medium',
    tags: ['strings', 'sliding-window', 'counting'],
    concept: {
      title: 'Cost of making a window equal',
      body: [
        'To turn a block into a block of one repeated letter, it is best to keep the letter that is already **most frequent** in it and replace all others. So the number of replacements the block needs is `length - (count of the most frequent letter)`.',
        { code: 'while (r - l + 1) - max(count) > k:\n    count[ord(s[l]) - 65] -= 1\n    l += 1' },
        'Keep the window valid, meaning that its cost is at most `k`. Extend it on the right and shrink it from the left when the cost gets too big. With 26 letters, finding the maximum of the counters is a short loop.'
      ]
    },
    statement: ['You are given a word of uppercase letters and a number `k`. You may replace at most `k` letters of the word by any other letters. After the replacements, what is the length of the longest block that consists of one repeated letter?'],
    inputFormat: ['The first line has `k`.', 'The second line has the word.'],
    outputFormat: ['Print one integer.'],
    constraints: ['0 <= k <= 20000', '1 <= length of the word <= 20000', 'The word contains uppercase letters.'],
    examples: [{ input: '1\nAABABBA\n', note: 'Replace the B at index 3 to get AAAABBA; the block AAAA has length 4.' }],
    hints: ['A block needs `length - (count of its most frequent letter)` replacements.', 'Keep a window whose cost is at most k.', 'The counters of 26 letters are enough to find the most frequent letter.'],
    program: {
      io: ['k:int', 's:word'],
      includes: ['<algorithm>'],
      python: r`
        count = [0] * 26
        l = 0
        best = 0
        for rr, ch in enumerate(s):
            count[ord(ch) - ord("A")] += 1
            while (rr - l + 1) - max(count) > k:
                count[ord(s[l]) - ord("A")] -= 1
                l += 1
            best = max(best, rr - l + 1)
        print(best)`,
      cpp: r`
        int count[26] = {0};
        int l = 0, best = 0;
        for (int rr = 0; rr < (int) s.size(); rr++) {
            count[s[rr] - 'A']++;
            while ((rr - l + 1) - *max_element(count, count + 26) > k) {
                count[s[l] - 'A']--;
                l++;
            }
            best = max(best, rr - l + 1);
        }
        cout << best << "\n";`,
      java: r`
        int[] count = new int[26];
        int l = 0, best = 0;
        for (int rr = 0; rr < s.length(); rr++) {
            count[s.charAt(rr) - 'A']++;
            int most = 0;
            for (int c : count) most = Math.max(most, c);
            while ((rr - l + 1) - most > k) {
                count[s.charAt(l) - 'A']--;
                l++;
                most = 0;
                for (int c : count) most = Math.max(most, c);
            }
            best = Math.max(best, rr - l + 1);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['A window can be fixed with `k` replacements when its length minus the count of its most frequent letter is at most `k`. The window grows to the right and shrinks from the left to keep that true.'], complexity: 'Time O(26 * n), space O(1).' },
    solve(input) { const [k0, s] = rows(input); const k = Number(k0); let best = 0; for (let c = 0; c < 26; c++) { const ch = UP[c]; let l = 0, bad = 0; for (let rr = 0; rr < s.length; rr++) { if (s[rr] !== ch) bad++; while (bad > k) { if (s[l] !== ch) bad--; l++; } best = Math.max(best, rr - l + 1); } } return String(best); },
    tests() { const g = rng(146); return ['1\nAABABBA\n', '0\nA\n', '0\nABAB\n', '2\nABAB\n', '4\nABCDE\n', `2\n${randWord(g, 40, 'ABC')}\n`, `10\n${randWord(g, 3000, 'ABCD')}\n`, `0\n${randWord(g, 3000, 'AAB')}\n`, `300\n${randWord(g, 20000, UP)}\n`, `20000\n${randWord(g, 20000, 'AB')}\n`]; }
  },

  {
    slug: 'longest-ones-with-flips',
    title: 'Longest Run of Ones With k Flips',
    difficulty: 'medium',
    tags: ['arrays', 'sliding-window', 'binary'],
    concept: {
      title: 'A window that may hold k bad elements',
      body: [
        'Flipping at most `k` zeros means: choose a block that contains **at most `k` zeros**; flipping those zeros turns the whole block into ones. So the question becomes the longest block with at most `k` zeros.',
        { code: 'zeros = l = best = 0\nfor r in range(n):\n    if a[r] == 0: zeros += 1\n    while zeros > k:\n        if a[l] == 0: zeros -= 1\n        l += 1\n    best = max(best, r - l + 1)' },
        'This is the same shape as the previous windows: extend on the right, repair on the left, record the length. Only the "bad" thing being counted changes.'
      ]
    },
    statement: ['You are given an array of 0s and 1s and a number `k`. You may change at most `k` zeros into ones. Print the length of the longest block of consecutive ones you can obtain.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` numbers, each 0 or 1.'],
    outputFormat: ['Print one integer.'],
    constraints: ['1 <= n <= 20000', '0 <= k <= n'],
    examples: [{ input: '8 2\n1 1 0 0 1 0 1 1\n', note: 'Flip the zeros at indexes 2 and 3 (or 3 and 5): the longest block has length 5.' }],
    hints: ['Look for the longest block that has at most k zeros.', 'Count the zeros in the window; when there are more than k, move the left end.', 'Remember to reduce the count when the element that leaves is a zero.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        zeros = 0
        l = 0
        best = 0
        for rr in range(n):
            if a[rr] == 0:
                zeros += 1
            while zeros > k:
                if a[l] == 0:
                    zeros -= 1
                l += 1
            best = max(best, rr - l + 1)
        print(best)`,
      cpp: r`
        int zeros = 0, l = 0, best = 0;
        for (int rr = 0; rr < n; rr++) {
            if (a[rr] == 0) zeros++;
            while (zeros > k) {
                if (a[l] == 0) zeros--;
                l++;
            }
            best = max(best, rr - l + 1);
        }
        cout << best << "\n";`,
      java: r`
        int zeros = 0, l = 0, best = 0;
        for (int rr = 0; rr < n; rr++) {
            if (a[rr] == 0) zeros++;
            while (zeros > k) {
                if (a[l] == 0) zeros--;
                l++;
            }
            best = Math.max(best, rr - l + 1);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The best result is the longest window containing at most `k` zeros: all its zeros can be flipped.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); let zeros = 0, l = 0, best = 0; for (let i = 0; i < n; i++) { if (a[i] === 0) zeros++; while (zeros > k) { if (a[l] === 0) zeros--; l++; } best = Math.max(best, i - l + 1); } return String(best); },
    tests() { const g = rng(147); const make = (n, k, p) => `${n} ${k}\n${many(n, () => (g() < p ? 1 : 0)).join(' ')}\n`; return ['8 2\n1 1 0 0 1 0 1 1\n', '1 0\n0\n', '1 1\n0\n', '5 0\n1 1 1 1 1\n', '5 0\n0 0 0 0 0\n', make(20, 3, 0.5), make(2000, 10, 0.7), make(20000, 0, 0.9), make(20000, 100, 0.5), make(20000, 20000, 0.5), make(20000, 5000, 0.1)]; }
  },

  {
    slug: 'permutation-in-string',
    title: 'Does a Permutation Appear?',
    difficulty: 'medium',
    tags: ['strings', 'sliding-window', 'anagram'],
    concept: {
      title: 'A fixed-size window of letter counts',
      body: [
        'A block of `s` is a permutation of `p` exactly when it has the same length as `p` and the same letter counts. So slide a window of length `len(p)` over `s` and compare the counts of the window with the counts of `p`.',
        { code: 'need = counts of p\nhave = counts of s[0:m]\nif have == need: ...\nfor i in range(m, len(s)):\n    have[s[i]] += 1\n    have[s[i - m]] -= 1     # the window moved one place\n    if have == need: ...' },
        'Moving the window changes two counters only. Comparing two tables of 26 numbers costs a constant, so the whole scan is O(26 * n).'
      ]
    },
    statement: ['You are given two words `p` and `s`. Print `yes` if some block of consecutive letters of `s` is a rearrangement (permutation) of `p`, otherwise print `no`.'],
    inputFormat: ['The first line has `p`.', 'The second line has `s`.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length of p, s <= 20000', 'Both words contain lowercase letters.'],
    examples: [{ input: 'ab\neidbaooo\n', note: 'The block ba is a permutation of ab.' }, { input: 'ab\neidboaoo\n', note: 'No block of length 2 has the letters a and b.' }],
    hints: ['The block must have exactly `len(p)` letters.', 'Count the letters of `p` and of the current window.', 'When the window moves, add the new letter and remove the old one, then compare the two tables.'],
    program: {
      io: ['p:word', 's:word'],
      python: r`
        m = len(p)
        found = False
        if m <= len(s):
            need = [0] * 26
            have = [0] * 26
            for ch in p:
                need[ord(ch) - ord("a")] += 1
            for i in range(len(s)):
                have[ord(s[i]) - ord("a")] += 1
                if i >= m:
                    have[ord(s[i - m]) - ord("a")] -= 1
                if i >= m - 1 and have == need:
                    found = True
                    break
        print("yes" if found else "no")`,
      cpp: r`
        int m = p.size();
        bool found = false;
        if (m <= (int) s.size()) {
            vector<int> need(26, 0), have(26, 0);
            for (char ch : p) need[ch - 'a']++;
            for (int i = 0; i < (int) s.size(); i++) {
                have[s[i] - 'a']++;
                if (i >= m) have[s[i - m] - 'a']--;
                if (i >= m - 1 && have == need) {
                    found = true;
                    break;
                }
            }
        }
        cout << (found ? "yes" : "no") << "\n";`,
      java: r`
        int m = p.length();
        boolean found = false;
        if (m <= s.length()) {
            int[] need = new int[26];
            int[] have = new int[26];
            for (int i = 0; i < m; i++) need[p.charAt(i) - 'a']++;
            for (int i = 0; i < s.length(); i++) {
                have[s.charAt(i) - 'a']++;
                if (i >= m) have[s.charAt(i - m) - 'a']--;
                if (i >= m - 1 && Arrays.equals(have, need)) {
                    found = true;
                    break;
                }
            }
        }
        System.out.println(found ? "yes" : "no");`
    },
    solution: { explanation: ['A fixed window of the length of `p` slides over `s`. Two table updates per step keep the window counts current, and equal tables mean a permutation.'], complexity: 'Time O(26 * n), space O(1).' },
    solve(input) { const [p, s] = rows(input); const m = p.length; const key = (w) => [...w].sort().join(''); const kp = key(p); for (let i = 0; i + m <= s.length; i++) if (key(s.slice(i, i + m)) === kp) return 'yes'; return 'no'; },
    tests() { const g = rng(148); const embed = (p, len) => { const s = randWord(g, len, 'xyz'); const at = randInt(g, 0, len - p.length); return s.slice(0, at) + shuffle(g, [...p]).join('') + s.slice(at + p.length); }; const p1 = randWord(g, 50, 'abc'); return ['ab\neidbaooo\n', 'ab\neidboaoo\n', 'a\na\n', 'ab\na\n', 'abc\ncba\n', `${p1}\n${embed(p1, 600)}\n`, `${p1}\n${randWord(g, 600, 'xyz')}\n`, `${p1}\n${randWord(g, 600, 'abc')}\n`, `${'ab'.repeat(2000)}\n${embed('ab'.repeat(2000), 20000)}\n`]; }
  },

  {
    slug: 'container-with-most-water',
    title: 'Container With Most Water',
    difficulty: 'medium',
    tags: ['arrays', 'two-pointers', 'greedy'],
    concept: {
      title: 'Move the shorter wall',
      body: [
        'Two vertical walls of heights `h[i]` and `h[j]` hold an amount of water equal to `min(h[i], h[j]) * (j - i)`. Start with the widest pair, the first and the last wall. To get a bigger area you must find a taller **shorter wall**, because the width can only shrink.',
        { code: 'l, r = 0, n - 1\nwhile l < r:\n    best = max(best, min(h[l], h[r]) * (r - l))\n    if h[l] < h[r]: l += 1\n    else: r -= 1' },
        'Moving the taller wall inward can never help: the height is limited by the shorter wall and the width gets smaller. So we always move the shorter one, and no better pair is skipped.'
      ]
    },
    statement: ['There are `n` vertical walls standing at the positions 1, 2, ..., n with the given heights. Choose two walls; together with the ground they form a container whose area is the distance between the walls times the height of the shorter wall. Print the largest possible area.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` heights.'],
    outputFormat: ['Print the largest area.'],
    constraints: ['2 <= n <= 20000', '0 <= each height <= 10^4'],
    examples: [{ input: '9\n1 8 6 2 5 4 8 3 7\n', note: 'The walls of height 8 (position 2) and 7 (position 9) give 7 * 7 = 49.' }],
    hints: ['The widest container is formed by the first and the last wall.', 'Its area is limited by the shorter wall, so moving the taller one inward cannot help.', 'Move the pointer of the shorter wall and keep the best area.'],
    program: {
      io: ['n:int', 'h:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        l, rr = 0, n - 1
        best = 0
        while l < rr:
            best = max(best, min(h[l], h[rr]) * (rr - l))
            if h[l] < h[rr]:
                l += 1
            else:
                rr -= 1
        print(best)`,
      cpp: r`
        int l = 0, rr = n - 1;
        long long best = 0;
        while (l < rr) {
            best = max(best, min(h[l], h[rr]) * (rr - l));
            if (h[l] < h[rr]) l++;
            else rr--;
        }
        cout << best << "\n";`,
      java: r`
        int l = 0, rr = (int) n - 1;
        long best = 0;
        while (l < rr) {
            best = Math.max(best, Math.min(h[l], h[rr]) * (rr - l));
            if (h[l] < h[rr]) l++;
            else rr--;
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Starting from the widest pair, always discard the shorter wall: any container using it with a narrower partner is not better than the one just measured.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const h = nums(rows(input)[1]); let best = 0; for (let i = 0; i < h.length; i++) for (let j = i + 1; j < h.length; j++) best = Math.max(best, Math.min(h[i], h[j]) * (j - i)); return String(best); },
    tests() { const g = rng(149); const make = (n, hi) => arr(randArray(g, n, 0, hi)); return ['9\n1 8 6 2 5 4 8 3 7\n', '2\n1 1\n', '2\n0 5\n', '5\n5 5 5 5 5\n', make(12, 20), make(300, 10000), make(1500, 10000), make(1500, 3), `1500\n${many(1500, (i) => i + 1).join(' ')}\n`]; }
  },

  {
    slug: 'three-sum-count',
    title: 'Triplets That Sum to Zero',
    difficulty: 'medium',
    tags: ['arrays', 'two-pointers', 'sorting'],
    concept: {
      title: 'Fix one number, then two pointers',
      body: [
        'To find three numbers with sum 0, **sort** the array, fix the first number `a[i]`, and look for a pair in the rest that adds up to `-a[i]` with two pointers, as in a sorted pair-sum search. That is O(n) per fixed number, O(n^2) in total.',
        { code: 'a.sort()\nfor i in range(n - 2):\n    if i > 0 and a[i] == a[i - 1]: continue     # same first number as before\n    l, r = i + 1, n - 1\n    while l < r:\n        t = a[i] + a[l] + a[r]\n        if t < 0: l += 1\n        elif t > 0: r -= 1\n        else:\n            count += 1; l += 1; r -= 1\n            while l < r and a[l] == a[l - 1]: l += 1' },
        'Duplicates are skipped at every level (the first number, and the second number after a hit), so that each different triplet of values is counted once.'
      ]
    },
    statement: ['Given `n` integers, count the different triplets of **values** `(x, y, z)` with `x <= y <= z` and `x + y + z = 0`. Two triplets are the same if they contain the same values. Elements at different positions may be used together, but each position only once in a triplet.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of different triplets.'],
    constraints: ['1 <= n <= 2000', '-10^5 <= each number <= 10^5'],
    examples: [{ input: '6\n-1 0 1 2 -1 -4\n', note: 'The triplets are (-1, -1, 2) and (-1, 0, 1).' }],
    hints: ['Sort the array first.', 'Fix the smallest number a[i], then look for a pair with sum -a[i] using two pointers.', 'Skip equal values for the fixed number and, after finding a triplet, for the left pointer.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      includes: ['<algorithm>'],
      python: r`
        a.sort()
        count = 0
        for i in range(n - 2):
            if i > 0 and a[i] == a[i - 1]:
                continue
            l, rr = i + 1, n - 1
            while l < rr:
                t = a[i] + a[l] + a[rr]
                if t < 0:
                    l += 1
                elif t > 0:
                    rr -= 1
                else:
                    count += 1
                    l += 1
                    rr -= 1
                    while l < rr and a[l] == a[l - 1]:
                        l += 1
        print(count)`,
      cpp: r`
        sort(a.begin(), a.end());
        int count = 0;
        for (int i = 0; i + 2 < n; i++) {
            if (i > 0 && a[i] == a[i - 1]) continue;
            int l = i + 1, rr = n - 1;
            while (l < rr) {
                long long t = a[i] + a[l] + a[rr];
                if (t < 0) l++;
                else if (t > 0) rr--;
                else {
                    count++;
                    l++;
                    rr--;
                    while (l < rr && a[l] == a[l - 1]) l++;
                }
            }
        }
        cout << count << "\n";`,
      java: r`
        Arrays.sort(a);
        int count = 0;
        for (int i = 0; i + 2 < n; i++) {
            if (i > 0 && a[i] == a[i - 1]) continue;
            int l = i + 1, rr = (int) n - 1;
            while (l < rr) {
                long t = a[i] + a[l] + a[rr];
                if (t < 0) l++;
                else if (t > 0) rr--;
                else {
                    count++;
                    l++;
                    rr--;
                    while (l < rr && a[l] == a[l - 1]) l++;
                }
            }
        }
        System.out.println(count);`
    },
    solution: { explanation: ['After sorting, every fixed first number is combined with a two-pointer search for the other two. Skipping equal values makes each triplet of values appear once.'], complexity: 'Time O(n^2), space O(1) besides sorting.' },
    solve(input) { const a = nums(rows(input)[1]); const seen = new Set(); const n = a.length; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) if (a[i] + a[j] + a[k] === 0) seen.add([a[i], a[j], a[k]].sort((p, s) => p - s).join(',')); return String(seen.size); },
    tests() { const g = rng(150); const make = (n, hi) => arr(randArray(g, n, -hi, hi)); return ['6\n-1 0 1 2 -1 -4\n', '1\n0\n', '3\n0 0 0\n', '5\n0 0 0 0 0\n', '3\n1 2 3\n', '4\n-2 0 0 2\n', make(20, 5), make(60, 30), make(120, 100), make(120, 3), make(150, 100000), `150\n${many(150, (i) => (i % 3) - 1).join(' ')}\n`]; }
  },

  {
    slug: 'sort-colors',
    title: 'Sort Zeros, Ones and Twos',
    difficulty: 'medium',
    tags: ['arrays', 'two-pointers', 'sorting', 'in-place'],
    concept: {
      title: 'Three regions with three pointers',
      body: [
        'An array that holds only 0, 1 and 2 can be sorted in **one pass without extra memory**. Keep three regions: zeros at the front (before `lo`), twos at the back (after `hi`), and the unknown part between `mid` and `hi`. Look at `a[mid]`:',
        { code: 'lo = mid = 0; hi = n - 1\nwhile mid <= hi:\n    if a[mid] == 0:\n        a[lo], a[mid] = a[mid], a[lo]; lo += 1; mid += 1\n    elif a[mid] == 1:\n        mid += 1\n    else:\n        a[mid], a[hi] = a[hi], a[mid]; hi -= 1' },
        'After swapping with `hi` do not move `mid`: the element that came from the back has not been looked at yet. This is the "Dutch national flag" algorithm.'
      ]
    },
    statement: ['You are given an array that contains only the numbers 0, 1 and 2. Sort it in increasing order and print it.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` numbers, each 0, 1 or 2.'],
    outputFormat: ['Print the sorted array on one line.'],
    constraints: ['1 <= n <= 20000'],
    examples: [{ input: '6\n2 0 2 1 1 0\n', note: 'The sorted array is 0 0 1 1 2 2.' }],
    hints: ['Keep three regions: zeros, ones and twos, and an unknown region in the middle.', 'A 0 is swapped to the front region, a 2 is swapped to the back region, a 1 stays.', 'After swapping a 2 to the back, do not advance `mid` yet.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        lo = mid = 0
        hi = n - 1
        while mid <= hi:
            if a[mid] == 0:
                a[lo], a[mid] = a[mid], a[lo]
                lo += 1
                mid += 1
            elif a[mid] == 1:
                mid += 1
            else:
                a[mid], a[hi] = a[hi], a[mid]
                hi -= 1
        print(*a)`,
      cpp: r`
        int lo = 0, mid = 0, hi = n - 1;
        while (mid <= hi) {
            if (a[mid] == 0) swap(a[lo++], a[mid++]);
            else if (a[mid] == 1) mid++;
            else swap(a[mid], a[hi--]);
        }
        for (int i = 0; i < n; i++) cout << a[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        int lo = 0, mid = 0, hi = (int) n - 1;
        while (mid <= hi) {
            if (a[mid] == 0) {
                long t = a[lo]; a[lo] = a[mid]; a[mid] = t;
                lo++;
                mid++;
            } else if (a[mid] == 1) {
                mid++;
            } else {
                long t = a[mid]; a[mid] = a[hi]; a[hi] = t;
                hi--;
            }
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(a[i]).append(i + 1 < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Zeros are swapped to the front and twos to the back while `mid` scans. When the scan meets the twos region, everything is in place.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { return nums(rows(input)[1]).sort((p, s) => p - s).join(' '); },
    tests() { const g = rng(151); const make = (n, w) => arr(many(n, () => { const x = g() * w.reduce((p, s) => p + s, 0); return x < w[0] ? 0 : x < w[0] + w[1] ? 1 : 2; })); return ['6\n2 0 2 1 1 0\n', '1\n1\n', '1\n2\n', '3\n2 1 0\n', '5\n1 1 1 1 1\n', '4\n2 2 0 0\n', make(25, [1, 1, 1]), make(20000, [1, 1, 1]), make(20000, [10, 1, 1]), make(20000, [1, 1, 10])]; }
  }
];
