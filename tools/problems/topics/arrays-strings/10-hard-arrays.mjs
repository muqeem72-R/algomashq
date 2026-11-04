import { r, rng, randInt, randArray, many, arr, nums, rows, mat, shuffle, randDistinct } from '../../lib.mjs';

export default [
  {
    slug: 'count-inversions',
    title: 'Count the Inversions',
    difficulty: 'hard',
    tags: ['arrays', 'merge-sort', 'divide-and-conquer'],
    concept: {
      title: 'Count while merging',
      body: [
        'An **inversion** is a pair of positions `i < j` with `a[i] > a[j]`: two elements in the wrong order. Checking all pairs costs O(n^2). Merge sort counts them for free. Sort the left half and the right half (counting their own inversions recursively). Then merge: whenever the next element of the right half is taken **before** the remaining elements of the left half, it is smaller than **all** of them, so it forms an inversion with each.',
        { code: 'if a[i] <= a[j]:          # take from the left: no new inversion\n    tmp[k] = a[i]; i += 1\nelse:                     # take from the right\n    tmp[k] = a[j]; j += 1\n    inv += mid - i        # it jumps over all remaining left elements' },
        'Counting happens during the usual O(n) merge step, so the total work is O(n log n). Use 64-bit numbers for the count: for 20000 elements it can reach about 2 * 10^8, and in general it is as large as `n * (n - 1) / 2`.'
      ]
    },
    statement: ['Count the pairs of positions `i < j` with `a[i] > a[j]` in an array of `n` integers.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of inversions.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5\n2 4 1 3 5\n', note: 'The inversions are (2, 1), (4, 1) and (4, 3).' }],
    hints: ['Counting all pairs is O(n^2); think of merge sort.', 'When merging two sorted halves, an element taken from the right half is smaller than every element still waiting in the left half.', 'Add the number of waiting left elements (`mid - i`) to the answer at that moment.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      helpers: {
        python: r`
          def merge_count(a, tmp, lo, hi):
              if hi - lo <= 1:
                  return 0
              mid = (lo + hi) // 2
              inv = merge_count(a, tmp, lo, mid) + merge_count(a, tmp, mid, hi)
              i, j, k = lo, mid, lo
              while i < mid and j < hi:
                  if a[i] <= a[j]:
                      tmp[k] = a[i]
                      i += 1
                  else:
                      tmp[k] = a[j]
                      j += 1
                      inv += mid - i
                  k += 1
              while i < mid:
                  tmp[k] = a[i]
                  i += 1
                  k += 1
              while j < hi:
                  tmp[k] = a[j]
                  j += 1
                  k += 1
              a[lo:hi] = tmp[lo:hi]
              return inv`,
        cpp: r`
          long long mergeCount(vector<long long>& a, vector<long long>& tmp, int lo, int hi) {
              if (hi - lo <= 1) return 0;
              int mid = (lo + hi) / 2;
              long long inv = mergeCount(a, tmp, lo, mid) + mergeCount(a, tmp, mid, hi);
              int i = lo, j = mid, k = lo;
              while (i < mid && j < hi) {
                  if (a[i] <= a[j]) {
                      tmp[k++] = a[i++];
                  } else {
                      tmp[k++] = a[j++];
                      inv += mid - i;
                  }
              }
              while (i < mid) tmp[k++] = a[i++];
              while (j < hi) tmp[k++] = a[j++];
              for (int t = lo; t < hi; t++) a[t] = tmp[t];
              return inv;
          }`,
        java: r`
          static long mergeCount(long[] a, long[] tmp, int lo, int hi) {
              if (hi - lo <= 1) return 0;
              int mid = (lo + hi) / 2;
              long inv = mergeCount(a, tmp, lo, mid) + mergeCount(a, tmp, mid, hi);
              int i = lo, j = mid, k = lo;
              while (i < mid && j < hi) {
                  if (a[i] <= a[j]) {
                      tmp[k++] = a[i++];
                  } else {
                      tmp[k++] = a[j++];
                      inv += mid - i;
                  }
              }
              while (i < mid) tmp[k++] = a[i++];
              while (j < hi) tmp[k++] = a[j++];
              for (int t = lo; t < hi; t++) a[t] = tmp[t];
              return inv;
          }`
      },
      python: r`
        tmp = [0] * n
        print(merge_count(a, tmp, 0, n))`,
      cpp: r`
        vector<long long> tmp(n);
        cout << mergeCount(a, tmp, 0, n) << "\n";`,
      java: r`
        long[] tmp = new long[(int) n];
        System.out.println(mergeCount(a, tmp, 0, (int) n));`
    },
    solution: { explanation: ['Merge sort splits the array, counts the inversions inside each half, and counts the pairs that cross the middle during the merge: every element taken from the right half forms an inversion with all waiting left elements.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const sorted = [...new Set(a)].sort((p, s) => p - s); const rank = new Map(sorted.map((v, i) => [v, i + 1])); const bit = new Array(sorted.length + 2).fill(0); let inv = 0; for (let i = a.length - 1; i >= 0; i--) { let x = rank.get(a[i]) - 1; while (x > 0) { inv += bit[x]; x -= x & -x; } x = rank.get(a[i]); while (x < bit.length) { bit[x]++; x += x & -x; } } return String(inv); },
    tests() {
      const g = rng(211);
      const brute = (a) => { let c = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) c++; return String(c); };
      for (let t = 0; t < 200; t++) { const a = randArray(g, randInt(g, 1, 12), -5, 5); if (brute(a) !== this.solve(arr(a))) throw new Error('inversion reference differs from brute force'); }
      return ['5\n2 4 1 3 5\n', '1\n7\n', '3\n3 2 1\n', '3\n1 2 3\n', '4\n2 2 2 2\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 2000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(many(20000, (i) => 20000 - i)), arr(randArray(g, 20000, 0, 5)), arr(many(20000, (i) => i))];
    }
  },

  {
    slug: 'reverse-pairs',
    title: 'Count the Reverse Pairs',
    difficulty: 'hard',
    tags: ['arrays', 'merge-sort', 'divide-and-conquer'],
    concept: {
      title: 'Count the crossing pairs before merging',
      body: [
        'A **reverse pair** is `i < j` with `a[i] > 2 * a[j]`. The condition is not the simple "greater than" of an inversion, so the counting cannot be mixed into the plain merge. Do it in a separate step: after both halves are sorted, count for every element `a[i]` of the left half how many elements of the right half satisfy `a[i] > 2 * a[j]`. As `i` increases, the left values increase too, so the right pointer `j` only moves forward.',
        { code: 'j = mid\nfor i in range(lo, mid):\n    while j < hi and a[i] > 2 * a[j]:\n        j += 1\n    count += j - mid' },
        'After counting, merge (or simply sort) the whole range and return to the caller. The total work is O(n log n) for the recursion with O(n) counting per level, plus the sorting cost.'
      ]
    },
    statement: ['Count the pairs of positions `i < j` with `a[i] > 2 * a[j]` in an array of `n` integers.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of such pairs.'],
    constraints: ['1 <= n <= 20000', '-2^31 <= each number <= 2^31 - 1'],
    examples: [{ input: '5\n1 3 2 3 1\n', note: 'The pairs are (3, 1) at positions 2 and 5, and (3, 1) at positions 4 and 5: 3 > 2*1.' }],
    hints: ['The condition is `a[i] > 2 * a[j]`, so counting cannot be fused into the merge step.', 'Sort each half recursively. For every left element, advance a pointer in the right half while the condition holds.', 'The pointer never moves back as the left value grows. Then sort or merge the whole range.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def count_pairs(a, lo, hi):
              if hi - lo <= 1:
                  return 0
              mid = (lo + hi) // 2
              count = count_pairs(a, lo, mid) + count_pairs(a, mid, hi)
              j = mid
              for i in range(lo, mid):
                  while j < hi and a[i] > 2 * a[j]:
                      j += 1
                  count += j - mid
              a[lo:hi] = sorted(a[lo:hi])
              return count`,
        cpp: r`
          long long countPairs(vector<long long>& a, int lo, int hi) {
              if (hi - lo <= 1) return 0;
              int mid = (lo + hi) / 2;
              long long count = countPairs(a, lo, mid) + countPairs(a, mid, hi);
              int j = mid;
              for (int i = lo; i < mid; i++) {
                  while (j < hi && a[i] > 2 * a[j]) j++;
                  count += j - mid;
              }
              inplace_merge(a.begin() + lo, a.begin() + mid, a.begin() + hi);
              return count;
          }`,
        java: r`
          static long countPairs(long[] a, int lo, int hi) {
              if (hi - lo <= 1) return 0;
              int mid = (lo + hi) / 2;
              long count = countPairs(a, lo, mid) + countPairs(a, mid, hi);
              int j = mid;
              for (int i = lo; i < mid; i++) {
                  while (j < hi && a[i] > 2 * a[j]) j++;
                  count += j - mid;
              }
              Arrays.sort(a, lo, hi);
              return count;
          }`
      },
      python: r`
        print(count_pairs(a, 0, n))`,
      cpp: r`
        cout << countPairs(a, 0, n) << "\n";`,
      java: r`
        System.out.println(countPairs(a, 0, (int) n));`
    },
    solution: { explanation: ['After both halves are sorted, a moving pointer in the right half counts the matching elements for every left element in linear time. Then the range is merged and the recursion returns.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const sorted = [...new Set([...a, ...a.map((x) => 2 * x)])].sort((p, s) => p - s); const rank = new Map(sorted.map((v, k) => [v, k + 1])); const bit = new Array(sorted.length + 2).fill(0); const add = (x) => { while (x < bit.length) { bit[x]++; x += x & -x; } }; const query = (x) => { let t = 0; while (x > 0) { t += bit[x]; x -= x & -x; } return t; }; let total = 0; for (let j = 0; j < a.length; j++) { total += j - query(rank.get(2 * a[j])); add(rank.get(a[j])); } return String(total); },
    tests() {
      const g = rng(212);
      const brute = (a) => { let c = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > 2 * a[j]) c++; return String(c); };
      for (let t = 0; t < 200; t++) { const a = randArray(g, randInt(g, 1, 12), -6, 6); if (brute(a) !== this.solve(arr(a))) throw new Error('reverse-pair reference differs from brute force'); }
      return ['5\n1 3 2 3 1\n', '5\n2 4 3 5 1\n', '1\n0\n', '2\n5 -1\n', '2\n-5 -3\n', '3\n2147483647 -2147483648 0\n', arr(randArray(g, 20, -20, 20)), arr(randArray(g, 2000, -2147483648, 2147483647)), arr(randArray(g, 20000, -2147483648, 2147483647)), arr(many(20000, (i) => 20000 - i)), arr(randArray(g, 20000, 0, 100))];
    }
  },

  {
    slug: 'subarrays-with-k-different',
    title: 'Subarrays With Exactly k Different Numbers',
    difficulty: 'hard',
    tags: ['arrays', 'sliding-window', 'counting'],
    concept: {
      title: 'Exactly k = at most k minus at most k-1',
      body: [
        'Counting blocks with **exactly** `k` different values directly is awkward for a sliding window, because a window can stop being valid in two directions. Counting blocks with **at most** `k` different values is easy: it is valid as long as it has `<= k` different values, so shrink it from the left when it has too many.',
        { code: 'def at_most(k):\n    count = [0] * (n + 1); distinct = l = total = 0\n    for r in range(n):\n        if count[a[r]] == 0: distinct += 1\n        count[a[r]] += 1\n        while distinct > k:\n            count[a[l]] -= 1\n            if count[a[l]] == 0: distinct -= 1\n            l += 1\n        total += r - l + 1       # all blocks ending at r that start at l..r' },
        'Every block with exactly `k` different values has at most `k` and not at most `k - 1`. So the answer is `at_most(k) - at_most(k - 1)`. The trick of turning "exactly" into a difference of two "at most" counts is very common.'
      ]
    },
    statement: ['Given an array of `n` integers between 1 and `n` and a number `k`, count the blocks of consecutive elements that contain exactly `k` different values.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers between 1 and `n`.'],
    outputFormat: ['Print the number of blocks.'],
    constraints: ['1 <= k <= n <= 20000', '1 <= each number <= n'],
    examples: [{ input: '5 2\n1 2 1 2 3\n', note: 'The blocks with exactly two different values are [1 2], [2 1], [1 2], [2 3], [1 2 1], [2 1 2] and [1 2 1 2]: 7.' }],
    hints: ['Counting "at most k different" with a window is easier than "exactly k".', 'For every right end r, all starts from the window start l to r give blocks with at most k different values.', 'The answer is `atMost(k) - atMost(k - 1)`.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      helpers: {
        python: r`
          def at_most(a, n, k):
              count = [0] * (n + 1)
              distinct = l = total = 0
              for rr in range(n):
                  if count[a[rr]] == 0:
                      distinct += 1
                  count[a[rr]] += 1
                  while distinct > k:
                      count[a[l]] -= 1
                      if count[a[l]] == 0:
                          distinct -= 1
                      l += 1
                  total += rr - l + 1
              return total`,
        cpp: r`
          long long atMost(const vector<long long>& a, int n, long long k) {
              vector<int> count(n + 1, 0);
              long long distinct = 0, total = 0;
              int l = 0;
              for (int rr = 0; rr < n; rr++) {
                  if (count[a[rr]] == 0) distinct++;
                  count[a[rr]]++;
                  while (distinct > k) {
                      count[a[l]]--;
                      if (count[a[l]] == 0) distinct--;
                      l++;
                  }
                  total += rr - l + 1;
              }
              return total;
          }`,
        java: r`
          static long atMost(long[] a, int n, long k) {
              int[] count = new int[n + 1];
              long distinct = 0, total = 0;
              int l = 0;
              for (int rr = 0; rr < n; rr++) {
                  if (count[(int) a[rr]] == 0) distinct++;
                  count[(int) a[rr]]++;
                  while (distinct > k) {
                      count[(int) a[l]]--;
                      if (count[(int) a[l]] == 0) distinct--;
                      l++;
                  }
                  total += rr - l + 1;
              }
              return total;
          }`
      },
      python: r`
        print(at_most(a, n, k) - at_most(a, n, k - 1))`,
      cpp: r`
        cout << atMost(a, n, k) - atMost(a, n, k - 1) << "\n";`,
      java: r`
        System.out.println(atMost(a, (int) n, k) - atMost(a, (int) n, k - 1));`
    },
    solution: { explanation: ['`atMost(k)` counts blocks with at most `k` different values using one sliding window. The blocks with exactly `k` are the difference between `atMost(k)` and `atMost(k - 1)`.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); let c = 0; for (let i = 0; i < n; i++) { const set = new Set(); for (let j = i; j < n; j++) { set.add(a[j]); if (set.size === k) c++; else if (set.size > k) break; } } return String(c); },
    tests() { const g = rng(213); const make = (n, k, hi) => `${n} ${k}\n${randArray(g, n, 1, Math.min(hi, n)).join(' ')}\n`; return ['5 2\n1 2 1 2 3\n', '5 3\n1 2 1 3 4\n', '1 1\n1\n', '4 1\n1 1 1 1\n', '4 4\n1 2 3 4\n', make(12, 2, 4), make(500, 3, 8), make(2000, 5, 30), make(3000, 1, 3000), make(3000, 40, 100), make(3000, 3000, 3000)]; }
  },

  {
    slug: 'two-non-overlapping-subarrays',
    title: 'Two Non-Overlapping Blocks',
    difficulty: 'hard',
    tags: ['arrays', 'prefix-sum', 'dynamic-programming'],
    concept: {
      title: 'Best first block so far, plus the second block',
      body: [
        'You must choose a block of length `p` and a block of length `q` that do not overlap, in either order, with the largest total sum. First assume the `p`-block comes **before** the `q`-block. Walk with `i` as the end of the `q`-block. Keep `bestFirst`, the best sum of a `p`-block that ends at or before the start of the `q`-block, and combine it with the `q`-block ending at `i`.',
        { code: 'for i in range(p + q, n + 1):\n    bestFirst = max(bestFirst, pre[i - q] - pre[i - q - p])   # a p-block that ends at i - q\n    result = max(result, bestFirst + pre[i] - pre[i - q])     # the q-block ends at i' },
        'Block sums come from prefix sums. Then swap the roles of `p` and `q` to cover the other order, and take the larger result. One pass, constant work per position.'
      ]
    },
    statement: ['Given an array of `n` integers and two lengths `p` and `q` (with `p + q <= n`), choose a block of `p` consecutive elements and a block of `q` consecutive elements that do not share any position. The first block may be on either side of the second. Print the largest possible total sum of the chosen elements.'],
    inputFormat: ['The first line has `n`, `p` and `q`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the largest total sum.'],
    constraints: ['2 <= n <= 20000', '1 <= p, q and p + q <= n', '-10^6 <= each number <= 10^6'],
    examples: [{ input: '9 1 2\n0 6 5 2 2 5 1 9 4\n', note: 'Choose the block [9] of length 1 and the block [6 5] of length 2: 9 + 11 = 20.' }],
    hints: ['Build prefix sums so that any block sum is a difference of two entries.', 'Assume the p-block is first: while moving the end of the q-block, remember the best p-block that finishes before it starts.', 'Do the same with the roles swapped and take the larger result.'],
    program: {
      io: ['n:int p:int q:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def best_total(pre, n, first, second):
              INF = 10**18
              bestFirst = -INF
              result = -INF
              for i in range(first + second, n + 1):
                  bestFirst = max(bestFirst, pre[i - second] - pre[i - second - first])
                  result = max(result, bestFirst + pre[i] - pre[i - second])
              return result`,
        cpp: r`
          long long bestTotal(const vector<long long>& pre, int n, int first, int second) {
              const long long INF = 4000000000000000000LL;
              long long bestFirst = -INF, result = -INF;
              for (int i = first + second; i <= n; i++) {
                  bestFirst = max(bestFirst, pre[i - second] - pre[i - second - first]);
                  result = max(result, bestFirst + pre[i] - pre[i - second]);
              }
              return result;
          }`,
        java: r`
          static long bestTotal(long[] pre, int n, int first, int second) {
              final long INF = 4000000000000000000L;
              long bestFirst = -INF, result = -INF;
              for (int i = first + second; i <= n; i++) {
                  bestFirst = Math.max(bestFirst, pre[i - second] - pre[i - second - first]);
                  result = Math.max(result, bestFirst + pre[i] - pre[i - second]);
              }
              return result;
          }`
      },
      python: r`
        pre = [0] * (n + 1)
        for i in range(n):
            pre[i + 1] = pre[i] + a[i]
        print(max(best_total(pre, n, p, q), best_total(pre, n, q, p)))`,
      cpp: r`
        vector<long long> pre(n + 1, 0);
        for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
        cout << max(bestTotal(pre, n, p, q), bestTotal(pre, n, q, p)) << "\n";`,
      java: r`
        long[] pre = new long[(int) n + 1];
        for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
        System.out.println(Math.max(bestTotal(pre, (int) n, (int) p, (int) q), bestTotal(pre, (int) n, (int) q, (int) p)));`
    },
    solution: { explanation: ['With prefix sums every block sum is O(1). For a fixed order, keep the best first block ending before the second block starts and combine it with the second block ending at each position. Try both orders.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const rs = rows(input); const [n, p, q] = nums(rs[0]); const a = nums(rs[1]); const pre = [0]; for (const x of a) pre.push(pre[pre.length - 1] + x); const go = (first, second) => { let bestFirst = -Infinity, res = -Infinity; for (let i = first + second; i <= n; i++) { bestFirst = Math.max(bestFirst, pre[i - second] - pre[i - second - first]); res = Math.max(res, bestFirst + pre[i] - pre[i - second]); } return res; }; return String(Math.max(go(p, q), go(q, p))); },
    tests() {
      const g = rng(214);
      const make = (n, p, q, lo, hi) => `${n} ${p} ${q}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, p, q] = nums(rs[0]); const a = nums(rs[1]); let best = -Infinity; for (let i = 0; i + p <= n; i++) for (let j = 0; j + q <= n; j++) if (i + p <= j || j + q <= i) { let t = 0; for (let k = i; k < i + p; k++) t += a[k]; for (let k = j; k < j + q; k++) t += a[k]; best = Math.max(best, t); } return String(best); };
      for (let t = 0; t < 200; t++) { const n = randInt(g, 2, 12); const p = randInt(g, 1, n - 1); const input = make(n, p, randInt(g, 1, n - p), -9, 9); if (brute(input) !== this.solve(input)) throw new Error('block reference differs from brute force'); }
      return ['9 1 2\n0 6 5 2 2 5 1 9 4\n', '2 1 1\n-5 -7\n', '3 1 2\n1 2 3\n', '4 2 2\n-1 -2 -3 -4\n', make(12, 3, 4, -9, 9), make(60, 10, 7, -50, 50), make(100, 1, 1, -1000, 1000), make(300, 100, 100, -1000000, 1000000), make(300, 1, 299, -1000000, 1000000), make(20000, 5000, 7000, -1000000, 1000000), make(20000, 1, 1, -1000000, 1000000), make(20000, 10000, 10000, 0, 1000000)];
    }
  },

  {
    slug: 'maximum-sum-rectangle',
    title: 'Maximum Sum Rectangle',
    difficulty: 'hard',
    tags: ['matrix', 'kadane', 'dynamic-programming'],
    concept: {
      title: 'Fix two rows, then it is a one-dimensional problem',
      body: [
        'To find the best rectangle of a matrix, fix its **top row** and **bottom row**. Now add up each column between those rows: `colSum[j]` is the sum of column `j` from the top row to the bottom row. A rectangle between these rows is a block of consecutive columns, and its sum is the sum of the block in `colSum`. That is exactly the maximum subarray problem, solved by Kadane\'s algorithm.',
        { code: 'for top in range(n):\n    colSum = [0] * m\n    for bottom in range(top, n):\n        for j in range(m):\n            colSum[j] += g[bottom][j]       # extend the rows by one\n        best = max(best, kadane(colSum))' },
        'Moving `bottom` down by one row only adds one more row to `colSum`. There are `n * (n + 1) / 2` pairs of rows and each costs O(m), so the total is O(n^2 * m).'
      ]
    },
    statement: ['Given a matrix with `n` rows and `m` columns of integers (some may be negative), find the largest sum of a non-empty rectangular block of consecutive rows and columns.'],
    inputFormat: ['The first line has `n` and `m`.', 'The next `n` lines have `m` integers each.'],
    outputFormat: ['Print the largest sum.'],
    constraints: ['1 <= n, m <= 100', '-10^6 <= each number <= 10^6'],
    examples: [{ input: '3 3\n1 -2 3\n-4 5 -6\n7 -8 9\n', note: 'The best rectangle is the single cell 9.' }],
    hints: ['Fix a top row and a bottom row.', 'Add the rows into an array of column sums.', 'The best rectangle between these rows is the maximum subarray of the column sums (Kadane).'],
    program: {
      io: ['n:int m:int', 'g:int[n][m]'],
      includes: ['<algorithm>'],
      python: r`
        best = -10**18
        for top in range(n):
            colSum = [0] * m
            for bottom in range(top, n):
                for j in range(m):
                    colSum[j] += g[bottom][j]
                cur = colSum[0]
                best = max(best, cur)
                for j in range(1, m):
                    cur = max(colSum[j], cur + colSum[j])
                    best = max(best, cur)
        print(best)`,
      cpp: r`
        long long best = -4000000000000000000LL;
        for (int top = 0; top < n; top++) {
            vector<long long> colSum(m, 0);
            for (int bottom = top; bottom < n; bottom++) {
                for (int j = 0; j < m; j++) colSum[j] += g[bottom][j];
                long long cur = colSum[0];
                best = max(best, cur);
                for (int j = 1; j < m; j++) {
                    cur = max(colSum[j], cur + colSum[j]);
                    best = max(best, cur);
                }
            }
        }
        cout << best << "\n";`,
      java: r`
        long best = Long.MIN_VALUE;
        for (int top = 0; top < n; top++) {
            long[] colSum = new long[(int) m];
            for (int bottom = top; bottom < n; bottom++) {
                for (int j = 0; j < m; j++) colSum[j] += g[bottom][j];
                long cur = colSum[0];
                best = Math.max(best, cur);
                for (int j = 1; j < m; j++) {
                    cur = Math.max(colSum[j], cur + colSum[j]);
                    best = Math.max(best, cur);
                }
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['For each pair of rows the column sums form an array, and the best rectangle between those rows is its maximum subarray. Trying all pairs of rows covers every rectangle.'], complexity: 'Time O(n^2 * m), space O(m).' },
    solve(input) { const { n, m, g } = parseGridLocal(input); const p = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0)); for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) p[i][j] = g[i - 1][j - 1] + p[i - 1][j] + p[i][j - 1] - p[i - 1][j - 1]; let best = -Infinity; for (let r1 = 1; r1 <= n; r1++) for (let r2 = r1; r2 <= n; r2++) { let cur = -Infinity; for (let c = 1; c <= m; c++) { const colSum = p[r2][c] - p[r1 - 1][c] - p[r2][c - 1] + p[r1 - 1][c - 1]; cur = Math.max(colSum, cur + colSum); best = Math.max(best, cur); } } return String(best); },
    tests() {
      const g = rng(215);
      const brute = (input) => { const { n, m, g: gr } = parseGridLocal(input); let best = -Infinity; for (let r1 = 0; r1 < n; r1++) for (let r2 = r1; r2 < n; r2++) for (let c1 = 0; c1 < m; c1++) for (let c2 = c1; c2 < m; c2++) { let s = 0; for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) s += gr[i][j]; best = Math.max(best, s); } return String(best); };
      for (let t = 0; t < 100; t++) { const input = grid(g, randInt(g, 1, 6), randInt(g, 1, 6), -9, 9); if (brute(input) !== this.solve(input)) throw new Error('rectangle reference differs from brute force'); }
      return ['3 3\n1 -2 3\n-4 5 -6\n7 -8 9\n', '1 1\n-5\n', '1 4\n-1 2 -3 4\n', '3 1\n-1\n2\n-3\n', '2 2\n-1 -2\n-3 -4\n', grid(g, 8, 8, -9, 9), grid(g, 30, 40, -1000, 1000), grid(g, 100, 100, -1000000, 1000000), grid(g, 100, 100, -1000000, -1), grid(g, 100, 100, -10, 12)];
    }
  },

  {
    slug: 'max-chunks-to-sort',
    title: 'Maximum Chunks to Sort',
    difficulty: 'hard',
    tags: ['arrays', 'monotonic-stack', 'sorting'],
    concept: {
      title: 'A stack of chunk maxima',
      body: [
        'Cut the array into consecutive chunks, sort each chunk on its own, and put the chunks back. The result is sorted exactly when **every element of a chunk is at most every element of the chunks after it**. You want as many chunks as possible.',
        'Process the elements left to right and keep a stack with one number for every chunk: its **maximum**. A new element `x` starts a new chunk. But if `x` is smaller than the maximum of the chunk(s) before it, it must belong to them, so they merge into one chunk whose maximum is the largest of the merged maxima.',
        { code: 'stack = []\nfor x in a:\n    mx = x\n    while stack and stack[-1] > x:     # the previous chunk has a bigger element than x\n        mx = max(mx, stack.pop())      # merge it\n    stack.append(mx)\nanswer = len(stack)' },
        'The stack keeps the chunk maxima in increasing order. Every element is pushed once and popped at most once, so the algorithm is O(n).'
      ]
    },
    statement: ['Split an array of `n` integers (duplicates are possible) into the largest possible number of consecutive chunks such that sorting every chunk separately and joining them gives the whole array sorted in non-decreasing order. Print the number of chunks.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the largest number of chunks.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5\n2 1 3 4 4\n', note: 'The chunks [2 1] [3] [4] [4] work: 4 chunks.' }],
    hints: ['Maintain a stack with the maximum of every chunk found so far.', 'A new element smaller than the top maximum must merge into that chunk (and maybe the ones below it).', 'The number of chunks is the size of the stack at the end.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        stack = []
        for x in a:
            mx = x
            while stack and stack[-1] > x:
                mx = max(mx, stack.pop())
            stack.append(mx)
        print(len(stack))`,
      cpp: r`
        vector<long long> stack;
        for (int i = 0; i < n; i++) {
            long long mx = a[i];
            while (!stack.empty() && stack.back() > a[i]) {
                mx = max(mx, stack.back());
                stack.pop_back();
            }
            stack.push_back(mx);
        }
        cout << stack.size() << "\n";`,
      java: r`
        long[] stack = new long[(int) n];
        int size = 0;
        for (int i = 0; i < n; i++) {
            long mx = a[i];
            while (size > 0 && stack[size - 1] > a[i]) {
                mx = Math.max(mx, stack[size - 1]);
                size--;
            }
            stack[size++] = mx;
        }
        System.out.println(size);`
    },
    solution: { explanation: ['The stack holds one maximum per chunk, in increasing order. A smaller new element merges the chunks whose maximum exceeds it. The final stack size is the number of chunks.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const n = a.length; const suffixMin = new Array(n + 1).fill(Infinity); for (let i = n - 1; i >= 0; i--) suffixMin[i] = Math.min(suffixMin[i + 1], a[i]); let chunks = 0, prefixMax = -Infinity; for (let i = 0; i < n; i++) { prefixMax = Math.max(prefixMax, a[i]); if (prefixMax <= suffixMin[i + 1]) chunks++; } return String(chunks); },
    tests() { const g = rng(216); return ['5\n2 1 3 4 4\n', '5\n5 4 3 2 1\n', '5\n1 2 3 4 5\n', '1\n7\n', '4\n2 2 2 2\n', '6\n1 0 2 3 4 4\n', arr(randArray(g, 15, 0, 6)), arr(randArray(g, 2000, -50, 50)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(many(20000, (i) => i + randInt(g, -3, 3))), arr(many(20000, (i) => 20000 - i))]; }
  },

  {
    slug: 'subarray-sums-in-range',
    title: 'Blocks With a Sum in a Range',
    difficulty: 'hard',
    tags: ['arrays', 'sliding-window', 'two-pointers'],
    concept: {
      title: 'Difference of two "at most" counts',
      body: [
        'With **positive** numbers the number of blocks whose sum is at most `X` is easy to count with two pointers: for every right end `r`, shrink the window from the left while its sum exceeds `X`. Then all blocks that end at `r` and start between `l` and `r` have a sum of at most `X`, which gives `r - l + 1` blocks.',
        { code: 'def at_most(X):\n    total = l = s = 0\n    for r in range(n):\n        s += a[r]\n        while s > X:\n            s -= a[l]; l += 1\n        total += r - l + 1\n    return total' },
        'The blocks with a sum between `L` and `R` are those with a sum at most `R` but not at most `L - 1`, so the answer is `at_most(R) - at_most(L - 1)`. The answer can be large (up to about 2 * 10^8), so use 64-bit numbers.'
      ]
    },
    statement: ['Given `n` positive integers and two numbers `L` and `R`, count the blocks of consecutive elements whose sum is at least `L` and at most `R`.'],
    inputFormat: ['The first line has `n`, `L` and `R`.', 'The second line has `n` positive integers.'],
    outputFormat: ['Print the number of blocks.'],
    constraints: ['1 <= n <= 20000', '1 <= each number <= 10^4', '1 <= L <= R <= 10^9'],
    examples: [{ input: '4 3 5\n1 2 3 4\n', note: 'The sums of the blocks: 1 2 3 4, 3 5 7, 6 9, 10. Those between 3 and 5 are 3, 4, 3, 5: four blocks.' }],
    hints: ['Counting blocks with a sum at most X is a standard two-pointer job for positive numbers.', 'For each right end the valid starts form a range, so add its size.', 'Subtract `atMost(L - 1)` from `atMost(R)`.'],
    program: {
      io: ['n:int lo:int hi:int', 'a:int[n]'],
      fast: true,
      helpers: {
        python: r`
          def at_most(a, n, limit):
              total = l = s = 0
              for rr in range(n):
                  s += a[rr]
                  while s > limit:
                      s -= a[l]
                      l += 1
                  total += rr - l + 1
              return total`,
        cpp: r`
          long long atMost(const vector<long long>& a, int n, long long limit) {
              long long total = 0, s = 0;
              int l = 0;
              for (int rr = 0; rr < n; rr++) {
                  s += a[rr];
                  while (s > limit) {
                      s -= a[l];
                      l++;
                  }
                  total += rr - l + 1;
              }
              return total;
          }`,
        java: r`
          static long atMost(long[] a, int n, long limit) {
              long total = 0, s = 0;
              int l = 0;
              for (int rr = 0; rr < n; rr++) {
                  s += a[rr];
                  while (s > limit) {
                      s -= a[l];
                      l++;
                  }
                  total += rr - l + 1;
              }
              return total;
          }`
      },
      python: r`
        print(at_most(a, n, hi) - at_most(a, n, lo - 1))`,
      cpp: r`
        cout << atMost(a, n, hi) - atMost(a, n, lo - 1) << "\n";`,
      java: r`
        System.out.println(atMost(a, (int) n, hi) - atMost(a, (int) n, lo - 1));`
    },
    solution: { explanation: ['`atMost(X)` counts blocks with sum at most `X` with a sliding window (valid because the numbers are positive). The answer is the difference for `R` and `L - 1`.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const [n, L, R] = nums(rs[0]); const a = nums(rs[1]); const pre = [0]; for (const x of a) pre.push(pre[pre.length - 1] + x); let c = 0; for (let j = 1; j <= n; j++) { const lowBound = pre[j] - R, highBound = pre[j] - L; const first = lower(pre, lowBound, 0, j), after = lower(pre, highBound + 1, 0, j); c += after - first; } return String(c); },
    tests() {
      const g = rng(217);
      const make = (n, L, R, hi) => `${n} ${L} ${R}\n${randArray(g, n, 1, hi).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, L, R] = nums(rs[0]); const a = nums(rs[1]); let c = 0; for (let i = 0; i < n; i++) { let s = 0; for (let j = i; j < n; j++) { s += a[j]; if (s >= L && s <= R) c++; } } return String(c); };
      for (let t = 0; t < 100; t++) { const input = make(randInt(g, 1, 12), randInt(g, 1, 10), randInt(g, 10, 40), 9); if (brute(input) !== this.solve(input)) throw new Error('range-sum reference differs from brute force'); }
      return ['4 3 5\n1 2 3 4\n', '1 5 5\n5\n', '1 6 10\n5\n', '3 1 1000000000\n1 1 1\n', make(15, 5, 20, 9), make(1000, 100, 500, 100), make(20000, 1000, 100000, 10000), make(20000, 1, 1000000000, 10000), make(20000, 50000, 60000, 10000), make(20000, 1, 3, 1)];
    }
  },

  {
    slug: 'minimum-swaps-to-sort',
    title: 'Minimum Swaps to Sort',
    difficulty: 'hard',
    tags: ['arrays', 'permutations', 'cycles'],
    concept: {
      title: 'Cycles of the permutation',
      body: [
        'Sort the array in your head and note, for each sorted position `k`, the index `order[k]` where the element that belongs there currently sits. This is a **permutation** of the indexes, and it breaks into cycles: a cycle of length `c` means `c` elements that must rotate among `c` places.',
        { code: 'order = sorted(range(n), key=lambda i: a[i])\nvisited = [False] * n\nfor i in range(n):\n    if not visited[i]:\n        length, j = 0, i\n        while not visited[j]:\n            visited[j] = True; j = order[j]; length += 1\n        swaps += length - 1' },
        'One swap can fix at most one cycle step, and a cycle of length `c` needs exactly `c - 1` swaps. Fixed points (cycles of length 1) cost nothing. So the minimum number of swaps is `n` minus the number of cycles.'
      ]
    },
    statement: ['Given an array of `n` different integers, find the smallest number of swaps (exchanging any two elements, not only neighbours) needed to sort the array in increasing order.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` different integers.'],
    outputFormat: ['Print the minimum number of swaps.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5\n4 3 2 1 5\n', note: 'Swap 4 with 1 and 3 with 2: two swaps.' }],
    hints: ['Find where each element must go in the sorted array.', 'The "should go there" relation splits the positions into cycles.', 'A cycle of length c needs c - 1 swaps; add them up.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>', '<numeric>'],
      python: r`
        order = sorted(range(n), key=lambda i: a[i])
        visited = [False] * n
        swaps = 0
        for i in range(n):
            if not visited[i]:
                length = 0
                j = i
                while not visited[j]:
                    visited[j] = True
                    j = order[j]
                    length += 1
                swaps += length - 1
        print(swaps)`,
      cpp: r`
        vector<int> order(n);
        iota(order.begin(), order.end(), 0);
        sort(order.begin(), order.end(), [&](int x, int y) { return a[x] < a[y]; });
        vector<bool> visited(n, false);
        long long swaps = 0;
        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                int length = 0, j = i;
                while (!visited[j]) {
                    visited[j] = true;
                    j = order[j];
                    length++;
                }
                swaps += length - 1;
            }
        }
        cout << swaps << "\n";`,
      java: r`
        int m = (int) n;
        Integer[] order = new Integer[m];
        for (int i = 0; i < m; i++) order[i] = i;
        Arrays.sort(order, (x, y) -> Long.compare(a[x], a[y]));
        boolean[] visited = new boolean[m];
        long swaps = 0;
        for (int i = 0; i < m; i++) {
            if (!visited[i]) {
                int length = 0, j = i;
                while (!visited[j]) {
                    visited[j] = true;
                    j = order[j];
                    length++;
                }
                swaps += length - 1;
            }
        }
        System.out.println(swaps);`
    },
    solution: { explanation: ['The positions form cycles under the "belongs there" map. Each cycle of length `c` can be fixed with `c - 1` swaps and not fewer, so the answer is the sum of `c - 1`, i.e. `n` minus the number of cycles.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const n = a.length; const idx = a.map((v, i) => [v, i]).sort((p, s) => p[0] - s[0]); const pos = new Array(n); idx.forEach(([, i], k) => { pos[i] = k; }); const seen = new Array(n).fill(false); let cycles = 0; for (let i = 0; i < n; i++) { if (!seen[i]) { cycles++; let j = i; while (!seen[j]) { seen[j] = true; j = pos[j]; } } } return String(n - cycles); },
    tests() {
      const g = rng(218);
      const brute = (a) => { const target = [...a].sort((p, s) => p - s).join(','); const start = a.join(','); const dist = new Map([[start, 0]]); const queue = [a]; while (queue.length) { const cur = queue.shift(); const d = dist.get(cur.join(',')); if (cur.join(',') === target) return String(d); for (let i = 0; i < cur.length; i++) for (let j = i + 1; j < cur.length; j++) { const nxt = [...cur]; [nxt[i], nxt[j]] = [nxt[j], nxt[i]]; const key = nxt.join(','); if (!dist.has(key)) { dist.set(key, d + 1); queue.push(nxt); } } } return '0'; };
      for (let t = 0; t < 60; t++) { const a = shuffle(g, randDistinct(g, randInt(g, 1, 6), -20, 20)); if (brute(a) !== this.solve(arr(a))) throw new Error('swap reference differs from brute force'); }
      return ['5\n4 3 2 1 5\n', '1\n9\n', '2\n2 1\n', '3\n1 2 3\n', '4\n2 3 4 1\n', arr(shuffle(g, randDistinct(g, 20, -50, 50))), arr(shuffle(g, randDistinct(g, 2000, -1000000, 1000000))), arr(shuffle(g, randDistinct(g, 20000, -1000000000, 1000000000))), arr(many(20000, (i) => 20000 - i)), arr(many(20000, (i) => (i + 1) % 20000))];
    }
  },

  {
    slug: 'minimum-k-bit-flips',
    title: 'Minimum Flips of k Neighbours',
    difficulty: 'hard',
    tags: ['arrays', 'greedy', 'sliding-window', 'binary'],
    concept: {
      title: 'The leftmost zero decides',
      body: [
        'You may flip `k` neighbouring bits at a time (0 becomes 1 and 1 becomes 0) and want every bit to be 1. Look at the **leftmost zero**. Only a flip that starts exactly there can fix it without disturbing the bits on its left, so you are forced to flip the window starting at that position. Repeating this greedy rule gives the minimum number of flips (or shows that it is impossible near the right end).',
        'Flipping the window physically costs O(k) each time. To make it fast, remember only **how many active flips cover the current position**: a flip that started at `i` covers `i .. i + k - 1`. The current bit value is `a[i]` changed by the parity of the active flips. Mark the end of a flip in a helper array.',
        { code: 'flip = 0                       # parity of the flips covering position i\nfor i in range(n):\n    flip ^= end[i]             # a flip that stopped just before i\n    if a[i] ^ flip == 0:        # the bit is a 0 now\n        if i + k > n: impossible\n        flip ^= 1; end[i + k] ^= 1; count += 1' }
      ]
    },
    statement: ['You are given a binary array of length `n` and a number `k`. In one move you choose `k` consecutive positions and flip all their bits (0 becomes 1, 1 becomes 0). Find the smallest number of moves that makes all the bits 1, or print -1 if it is impossible.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` numbers, each 0 or 1.'],
    outputFormat: ['Print the minimum number of moves, or -1.'],
    constraints: ['1 <= k <= n <= 20000'],
    examples: [{ input: '5 2\n0 1 0 1 1\n', note: 'Flip positions 1-2 to get 1 0 0 1 1, then positions 2-3: 1 1 1 1 1. Two moves.' }, { input: '3 2\n0 0 0\n', note: 'It is impossible to fix all three bits.' }],
    hints: ['The leftmost 0 can only be fixed by a flip that starts at it.', 'Keep the parity of the number of flips that cover the current position instead of flipping k bits each time.', 'If a flip would stick out of the array, the answer is -1.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      python: r`
        end = [0] * (n + 1)
        flip = 0
        count = 0
        possible = True
        for i in range(n):
            flip ^= end[i]
            if a[i] ^ flip == 0:
                if i + k > n:
                    possible = False
                    break
                flip ^= 1
                end[i + k] ^= 1
                count += 1
        print(count if possible else -1)`,
      cpp: r`
        vector<int> end(n + 1, 0);
        int flip = 0;
        long long count = 0;
        bool possible = true;
        for (int i = 0; i < n; i++) {
            flip ^= end[i];
            if ((a[i] ^ flip) == 0) {
                if (i + k > n) {
                    possible = false;
                    break;
                }
                flip ^= 1;
                end[i + k] ^= 1;
                count++;
            }
        }
        cout << (possible ? count : -1) << "\n";`,
      java: r`
        int[] end = new int[(int) n + 1];
        int flip = 0;
        long count = 0;
        boolean possible = true;
        for (int i = 0; i < n; i++) {
            flip ^= end[i];
            if ((a[i] ^ flip) == 0) {
                if (i + k > n) {
                    possible = false;
                    break;
                }
                flip ^= 1;
                end[(int) (i + k)] ^= 1;
                count++;
            }
        }
        System.out.println(possible ? count : -1);`
    },
    solution: { explanation: ['The leftmost zero forces a flip starting there. A helper array marks where each flip stops, so the parity of the flips covering a position is maintained in O(1).'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); let count = 0; for (let i = 0; i < n; i++) { if (a[i] === 0) { if (i + k > n) return '-1'; for (let j = i; j < i + k; j++) a[j] ^= 1; count++; } } return String(count); },
    tests() {
      const g = rng(219);
      const make = (n, k, p) => `${n} ${k}\n${many(n, () => (g() < p ? 1 : 0)).join(' ')}\n`;
      const brute = (n, k, a) => { let best = Infinity; const starts = n - k + 1; for (let mask = 0; mask < (1 << starts); mask++) { const b = [...a]; let c = 0; for (let s = 0; s < starts; s++) if (mask & (1 << s)) { c++; for (let j = s; j < s + k; j++) b[j] ^= 1; } if (b.every((x) => x === 1)) best = Math.min(best, c); } return best === Infinity ? '-1' : String(best); };
      for (let t = 0; t < 200; t++) { const n = randInt(g, 1, 10), k = randInt(g, 1, n); const a = many(n, () => randInt(g, 0, 1)); if (brute(n, k, a) !== this.solve(`${n} ${k}\n${a.join(' ')}\n`)) throw new Error('flip reference differs from brute force'); }
      return ['5 2\n0 1 0 1 1\n', '3 2\n0 0 0\n', '1 1\n0\n', '1 1\n1\n', '4 4\n1 1 1 1\n', '6 3\n0 0 0 1 1 1\n', make(12, 3, 0.5), make(2000, 5, 0.6), make(20000, 1, 0.5), make(20000, 3, 0.9), make(20000, 100, 0.5), make(20000, 20000, 0.5)];
    }
  },

  {
    slug: 'max-sum-with-one-deletion',
    title: 'Maximum Block Sum With One Deletion',
    difficulty: 'hard',
    tags: ['arrays', 'kadane', 'dynamic-programming'],
    concept: {
      title: 'Two states: nothing deleted yet, or one element deleted',
      body: [
        'Extend Kadane\'s algorithm. For every position keep two values for blocks that **end at this position**: `noDel`, the best sum with nothing deleted, and `oneDel`, the best sum with exactly one element deleted (the block still has to contain at least one element).',
        { code: 'for x in a[1:]:\n    oneDel = max(oneDel + x, noDel)    # keep x after an earlier deletion, or delete x itself\n    noDel  = max(noDel + x, x)          # the usual Kadane step\n    best = max(best, noDel, oneDel)' },
        'Deleting `x` itself means the block ends just before `x` in the "no deletion" state, so `oneDel` can start from the old `noDel`. The order of the two updates matters: `oneDel` must use the *old* `noDel`.'
      ]
    },
    statement: ['Given an array of `n` integers, choose a non-empty block of consecutive elements and you may delete at most one element from it (the block must still be non-empty after the deletion). Print the largest possible sum of the remaining elements.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the largest sum.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5\n1 -2 0 3 -1\n', note: 'Take 1 -2 0 3 and delete -2: 1 + 0 + 3 = 4.' }, { input: '3\n-1 -1 -1\n', note: 'All numbers are negative: the best is a single -1.' }],
    hints: ['Run Kadane, but keep a second value for "one element already deleted".', 'To delete the current element, extend the best no-deletion block that ended just before it.', 'Update the deletion state with the old no-deletion value, before updating that one.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        noDel = best = a[0]
        oneDel = -10**18
        for i in range(1, n):
            x = a[i]
            oneDel = max(oneDel + x, noDel)
            noDel = max(noDel + x, x)
            best = max(best, noDel, oneDel)
        print(best)`,
      cpp: r`
        long long noDel = a[0], best = a[0], oneDel = -2000000000000000000LL;
        for (int i = 1; i < n; i++) {
            long long x = a[i];
            oneDel = max(oneDel + x, noDel);
            noDel = max(noDel + x, x);
            best = max(best, max(noDel, oneDel));
        }
        cout << best << "\n";`,
      java: r`
        long noDel = a[0], best = a[0], oneDel = -2000000000000000000L;
        for (int i = 1; i < n; i++) {
            long x = a[i];
            oneDel = Math.max(oneDel + x, noDel);
            noDel = Math.max(noDel + x, x);
            best = Math.max(best, Math.max(noDel, oneDel));
        }
        System.out.println(best);`
    },
    solution: { explanation: ['`noDel` is the usual Kadane value. `oneDel` either extends an earlier deletion by the current element or deletes the current element after the best no-deletion block that ended before it.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); const n = a.length; const pre = [0]; for (const x of a) pre.push(pre[pre.length - 1] + x); const fwd = new Array(n), bwd = new Array(n); fwd[0] = a[0]; for (let i = 1; i < n; i++) fwd[i] = Math.max(fwd[i - 1] + a[i], a[i]); bwd[n - 1] = a[n - 1]; for (let i = n - 2; i >= 0; i--) bwd[i] = Math.max(bwd[i + 1] + a[i], a[i]); let best = Math.max(...fwd); for (let i = 1; i < n - 1; i++) best = Math.max(best, fwd[i - 1] + bwd[i + 1]); return String(best); },
    tests() {
      const g = rng(220);
      const brute = (a) => { let best = -Infinity; for (let i = 0; i < a.length; i++) { let s = 0; for (let j = i; j < a.length; j++) { s += a[j]; best = Math.max(best, s); if (j > i) for (let d = i; d <= j; d++) best = Math.max(best, s - a[d]); } } return String(best); };
      for (let t = 0; t < 300; t++) { const a = randArray(g, randInt(g, 1, 9), -6, 6); if (brute(a) !== this.solve(arr(a))) throw new Error('deletion reference differs from brute force'); }
      return ['5\n1 -2 0 3 -1\n', '3\n-1 -1 -1\n', '1\n-4\n', '1\n4\n', '2\n-5 3\n', '4\n1 -1 -1 1\n', arr(randArray(g, 15, -9, 9)), arr(randArray(g, 2000, -1000, 1000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, -1)), arr(randArray(g, 20000, -10, 100))];
    }
  }
];

// ---- helpers for the tests of this file ----
function parseGridLocal(input) { const rs = rows(input); const [n, m] = nums(rs[0]); return { n, m, g: rs.slice(1, 1 + n).map(nums) }; }
function grid(g, n, m, lo, hi) { return `${n} ${m}\n${mat(Array.from({ length: n }, () => randArray(g, m, lo, hi)))}`; }
function lower(a, x, lo, hi) { let l = lo, h = hi + 1; while (l < h) { const mid = (l + h) >> 1; if (a[mid] < x) l = mid + 1; else h = mid; } return l; }
