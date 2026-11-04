import { r, rng, randInt, randArray, many, arr, nums, rows, randDistinct, shuffle } from '../../lib.mjs';

const sortedArr = (g, n, lo, hi) => randArray(g, n, lo, hi).sort((p, s) => p - s);
const rotate = (a, k) => [...a.slice(k), ...a.slice(0, k)];
const lowerBound = (a, x) => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] < x) lo = mid + 1; else hi = mid; } return lo; };

export default [
  {
    slug: 'lower-bound',
    title: 'First Position Not Smaller Than x',
    difficulty: 'medium',
    tags: ['binary-search', 'sorted', 'lower-bound'],
    concept: {
      title: 'Binary search for a boundary',
      body: [
        'With duplicates, "find x" is not precise enough. A cleaner question is: where is the **first** element that is `>= x`? In a sorted array the elements `< x` come first and the elements `>= x` after them, so we are looking for the border between the two groups.',
        { code: 'lo, hi = 0, n            # the answer is in [lo, hi]; hi = n means "none"\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if a[mid] < x:\n        lo = mid + 1      # mid is too small: the border is to the right\n    else:\n        hi = mid          # mid could be the answer: keep it\nreturn lo' },
        'Here `hi` is not excluded when `a[mid] >= x`, because `mid` itself may be the first such element. The loop ends with `lo == hi`, which is the border. This "lower bound" is the building block for counting equal values and for many later problems.'
      ]
    },
    statement: ['You are given an array of `n` integers sorted in non-decreasing order (duplicates are possible) and `q` numbers `x`. For each `x` print the smallest index `i` (counting from 0) with `a[i] >= x`. If every element is smaller than `x`, print `n`.'],
    inputFormat: ['The first line has `n` and `q`.', 'The second line has the sorted array.', 'The third line has the `q` numbers `x`.'],
    outputFormat: ['Print `q` lines, one answer per number.'],
    constraints: ['1 <= n, q <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6 4\n1 2 2 2 5 9\n2 3 0 10\n', note: 'The answers: first 2 is at index 1; first value >= 3 is 5 at index 4; 0 gives index 0; 10 gives 6 = n.' }],
    hints: ['Look for the border between the elements smaller than x and the others.', 'Use `lo = 0`, `hi = n` and the loop `while lo < hi`.', 'If `a[mid] < x` set `lo = mid + 1`, otherwise set `hi = mid`.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'x:int[q]'],
      fast: true,
      python: r`
        out = []
        for v in x:
            lo, hi = 0, n
            while lo < hi:
                mid = (lo + hi) // 2
                if a[mid] < v:
                    lo = mid + 1
                else:
                    hi = mid
            out.append(lo)
        print("\n".join(map(str, out)))`,
      cpp: r`
        for (int k = 0; k < q; k++) {
            int lo = 0, hi = n;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (a[mid] < x[k]) lo = mid + 1;
                else hi = mid;
            }
            cout << lo << "\n";
        }`,
      java: r`
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < q; k++) {
            int lo = 0, hi = (int) n;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (a[mid] < x[k]) lo = mid + 1;
                else hi = mid;
            }
            sb.append(lo).append("\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['The array is a block of values `< x` followed by a block of values `>= x`. Binary search narrows `[lo, hi]` to the border between the blocks.'], complexity: 'Time O(q log n), space O(1) besides the input.' },
    solve(input) { const rs = rows(input); const a = nums(rs[1]); return nums(rs[2]).map((v) => lowerBound(a, v)).join('\n'); },
    tests() { const g = rng(131); const make = (n, q, lo, hi) => `${n} ${q}\n${sortedArr(g, n, lo, hi).join(' ')}\n${randArray(g, q, lo - 1, hi + 1).join(' ')}\n`; return ['6 4\n1 2 2 2 5 9\n2 3 0 10\n', '1 2\n5\n5 6\n', '1 2\n5\n4 5\n', '4 2\n3 3 3 3\n3 4\n', make(10, 12, 0, 8), make(2000, 2000, -50, 50), make(20000, 20000, -1000000000, 1000000000), make(20000, 20000, 0, 30)]; }
  },

  {
    slug: 'first-and-last-position',
    title: 'First and Last Position',
    difficulty: 'medium',
    tags: ['binary-search', 'sorted', 'lower-bound'],
    concept: {
      title: 'Two borders around a block of equal values',
      body: [
        'All copies of `x` in a sorted array form one block. Its left border is the first index with `a[i] >= x` (the **lower bound** of `x`) and the index right after its right border is the first index with `a[i] >= x + 1` (the lower bound of `x + 1`, for integers).',
        { code: 'first = lower_bound(a, x)\nafter = lower_bound(a, x + 1)\nif first == after:\n    # x does not occur\nelse:\n    last = after - 1' },
        'If both borders are the same index, the block is empty and `x` is missing. The difference `after - first` is also the number of copies of `x`.'
      ]
    },
    statement: ['Given a sorted array (non-decreasing) and a number `x`, print the index of the first and the index of the last occurrence of `x`, counting from 0. If `x` does not occur, print `-1 -1`.'],
    inputFormat: ['The first line has `n` and `x`.', 'The second line has the sorted array.'],
    outputFormat: ['Print two integers separated by a space.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '7 8\n5 7 7 8 8 8 10\n', note: 'The 8s occupy indexes 3 to 5.' }, { input: '3 4\n1 2 3\n', note: '4 is missing.' }],
    hints: ['Write a function that finds the first index with `a[i] >= v`.', 'The first occurrence is at `lower_bound(x)` if that element equals x.', 'The last occurrence is just before `lower_bound(x + 1)`.'],
    program: {
      io: ['n:int x:int', 'a:int[n]'],
      fast: true,
      helpers: {
        python: r`
          def lower_bound(a, v):
              lo, hi = 0, len(a)
              while lo < hi:
                  mid = (lo + hi) // 2
                  if a[mid] < v:
                      lo = mid + 1
                  else:
                      hi = mid
              return lo`,
        cpp: r`
          int lowerBound(const vector<long long>& a, long long v) {
              int lo = 0, hi = a.size();
              while (lo < hi) {
                  int mid = (lo + hi) / 2;
                  if (a[mid] < v) lo = mid + 1;
                  else hi = mid;
              }
              return lo;
          }`,
        java: r`
          static int lowerBound(long[] a, long v) {
              int lo = 0, hi = a.length;
              while (lo < hi) {
                  int mid = (lo + hi) / 2;
                  if (a[mid] < v) lo = mid + 1;
                  else hi = mid;
              }
              return lo;
          }`
      },
      python: r`
        first = lower_bound(a, x)
        after = lower_bound(a, x + 1)
        if first == after:
            print(-1, -1)
        else:
            print(first, after - 1)`,
      cpp: r`
        int first = lowerBound(a, x);
        int after = lowerBound(a, x + 1);
        if (first == after) cout << -1 << " " << -1 << "\n";
        else cout << first << " " << after - 1 << "\n";`,
      java: r`
        int first = lowerBound(a, x);
        int after = lowerBound(a, x + 1);
        if (first == after) System.out.println("-1 -1");
        else System.out.println(first + " " + (after - 1));`
    },
    solution: { explanation: ['`lower_bound(x)` is the left border of the block of x, `lower_bound(x + 1)` is just after its right border. Equal borders mean the block is empty.'], complexity: 'Time O(log n) per search, space O(1).' },
    solve(input) { const rs = rows(input); const x = nums(rs[0])[1]; const a = nums(rs[1]); const f = lowerBound(a, x), e = lowerBound(a, x + 1); return f === e ? '-1 -1' : `${f} ${e - 1}`; },
    tests() { const g = rng(132); const make = (n, lo, hi, pickPresent) => { const a = sortedArr(g, n, lo, hi); const x = pickPresent ? a[randInt(g, 0, n - 1)] : hi + 1; return `${n} ${x}\n${a.join(' ')}\n`; }; return ['7 8\n5 7 7 8 8 8 10\n', '3 4\n1 2 3\n', '1 5\n5\n', '1 4\n5\n', '4 2\n2 2 2 2\n', '5 0\n1 2 3 4 5\n', make(15, 0, 6, true), make(2000, -30, 30, true), make(20000, -1000000000, 1000000000, true), make(20000, 0, 20, true), make(20000, 0, 20, false)]; }
  },

  {
    slug: 'search-in-rotated-array',
    title: 'Search in a Rotated Array',
    difficulty: 'medium',
    tags: ['binary-search', 'rotated-array'],
    concept: {
      title: 'One half is always sorted',
      body: [
        'A sorted array of different numbers was rotated: `4 5 6 7 0 1 2`. If you cut it in the middle, at least one half is still sorted. You can tell which one by comparing `a[lo]` with `a[mid]`: if `a[lo] <= a[mid]`, the left half is sorted.',
        { code: 'if a[lo] <= a[mid]:              # left half is sorted\n    if a[lo] <= x < a[mid]: hi = mid - 1\n    else: lo = mid + 1\nelse:                            # right half is sorted\n    if a[mid] < x <= a[hi]: lo = mid + 1\n    else: hi = mid - 1' },
        'In the sorted half you can check with two comparisons whether `x` can be inside it. If yes, search there; if no, search the other half. Each step still halves the range.'
      ]
    },
    statement: ['A sorted array of `n` different integers was rotated at an unknown place (for example `0 1 2 4 5 6 7` can become `4 5 6 7 0 1 2`). Given the rotated array and a number `x`, print the index of `x` (counting from 0), or -1 if it is not in the array.'],
    inputFormat: ['The first line has `n` and `x`.', 'The second line has the rotated array.'],
    outputFormat: ['Print one integer.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '7 0\n4 5 6 7 0 1 2\n', note: '0 is at index 4.' }, { input: '7 3\n4 5 6 7 0 1 2\n', note: '3 is missing.' }],
    hints: ['After cutting at `mid`, one of the two halves is sorted.', 'The left half is sorted when `a[lo] <= a[mid]`.', 'Test whether `x` lies between the ends of the sorted half; if yes go there, otherwise go to the other half.'],
    program: {
      io: ['n:int x:int', 'a:int[n]'],
      fast: true,
      python: r`
        lo, hi = 0, n - 1
        answer = -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if a[mid] == x:
                answer = mid
                break
            if a[lo] <= a[mid]:
                if a[lo] <= x < a[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:
                if a[mid] < x <= a[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        print(answer)`,
      cpp: r`
        int lo = 0, hi = n - 1, answer = -1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (a[mid] == x) {
                answer = mid;
                break;
            }
            if (a[lo] <= a[mid]) {
                if (a[lo] <= x && x < a[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {
                if (a[mid] < x && x <= a[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        cout << answer << "\n";`,
      java: r`
        int lo = 0, hi = (int) n - 1, answer = -1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (a[mid] == x) {
                answer = mid;
                break;
            }
            if (a[lo] <= a[mid]) {
                if (a[lo] <= x && x < a[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {
                if (a[mid] < x && x <= a[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['At each step find the sorted half, decide whether `x` belongs to it, and keep only the half that can contain `x`.'], complexity: 'Time O(log n), space O(1).' },
    solve(input) { const rs = rows(input); const x = nums(rs[0])[1]; return String(nums(rs[1]).indexOf(x)); },
    tests() {
      const g = rng(133);
      const make = (n, lo, hi, present) => { const base = randDistinct(g, n, lo, hi).sort((p, s) => p - s); const a = rotate(base, randInt(g, 0, n - 1)); const x = present ? a[randInt(g, 0, n - 1)] : hi + 5; return `${n} ${x}\n${a.join(' ')}\n`; };
      return ['7 0\n4 5 6 7 0 1 2\n', '7 3\n4 5 6 7 0 1 2\n', '1 1\n1\n', '1 0\n1\n', '2 1\n3 1\n', '5 5\n1 2 3 4 5\n', make(9, 0, 30, true), make(9, 0, 30, false), make(2000, -5000, 5000, true), make(20000, -1000000000, 1000000000, true), make(20000, -1000000000, 1000000000, false), make(20000, 0, 100000, true)];
    }
  },

  {
    slug: 'minimum-in-rotated-array',
    title: 'Minimum of a Rotated Array',
    difficulty: 'medium',
    tags: ['binary-search', 'rotated-array'],
    concept: {
      title: 'Compare the middle with the right end',
      body: [
        'In a rotated sorted array of different numbers the minimum is the place where the order "restarts". Compare `a[mid]` with the last element `a[hi]`: if `a[mid] > a[hi]`, the restart is to the right of `mid`. Otherwise the part from `mid` to `hi` is sorted, so the minimum is at `mid` or to its left.',
        { code: 'lo, hi = 0, n - 1\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if a[mid] > a[hi]:\n        lo = mid + 1\n    else:\n        hi = mid' },
        'The index of the minimum is also the number of places the array was rotated to the left.'
      ]
    },
    statement: ['A sorted array of `n` different integers was rotated at an unknown place. Print the smallest element and its index (counting from 0).'],
    inputFormat: ['The first line has `n`.', 'The second line has the rotated array.'],
    outputFormat: ['Print the minimum and its index, separated by a space.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '7\n4 5 6 7 0 1 2\n', note: 'The minimum 0 is at index 4.' }],
    hints: ['Compare `a[mid]` with `a[hi]`.', 'If `a[mid] > a[hi]` the minimum is right of `mid`: `lo = mid + 1`.', 'Otherwise it is at `mid` or left of it: `hi = mid`.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        lo, hi = 0, n - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if a[mid] > a[hi]:
                lo = mid + 1
            else:
                hi = mid
        print(a[lo], lo)`,
      cpp: r`
        int lo = 0, hi = n - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (a[mid] > a[hi]) lo = mid + 1;
            else hi = mid;
        }
        cout << a[lo] << " " << lo << "\n";`,
      java: r`
        int lo = 0, hi = (int) n - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (a[mid] > a[hi]) lo = mid + 1;
            else hi = mid;
        }
        System.out.println(a[lo] + " " + lo);`
    },
    solution: { explanation: ['If the middle is greater than the last element, the drop lies to the right; otherwise the minimum is at the middle or to its left. The range shrinks to the minimum.'], complexity: 'Time O(log n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); const m = Math.min(...a); return `${m} ${a.indexOf(m)}`; },
    tests() { const g = rng(134); const make = (n, lo, hi, k) => { const base = randDistinct(g, n, lo, hi).sort((p, s) => p - s); return arr(rotate(base, k === undefined ? randInt(g, 0, n - 1) : k)); }; return ['7\n4 5 6 7 0 1 2\n', '1\n8\n', '2\n2 1\n', '2\n1 2\n', make(6, 0, 20, 0), make(10, -20, 20), make(2000, -5000, 5000), make(20000, -1000000000, 1000000000), make(20000, -1000000000, 1000000000, 19999), make(20000, 0, 50000, 1)]; }
  },

  {
    slug: 'mountain-peak',
    title: 'Peak of a Mountain',
    difficulty: 'medium',
    tags: ['binary-search', 'peak'],
    concept: {
      title: 'Follow the slope',
      body: [
        'A **mountain** array goes strictly up to a peak and then strictly down. The two neighbours tell you on which side of the peak you are standing: if `a[mid] < a[mid + 1]` you are still climbing, so the peak is to the right of `mid`. Otherwise you are on the way down (or on the peak), and the peak is at `mid` or to its left.',
        { code: 'lo, hi = 0, n - 1\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if a[mid] < a[mid + 1]:\n        lo = mid + 1\n    else:\n        hi = mid' },
        'This is binary search without a target value: the condition decides the direction by the local shape of the data.'
      ]
    },
    statement: ['An array of `n` integers (n >= 3) strictly increases up to some index (the peak) and then strictly decreases. The peak is neither the first nor the last element. Print the index of the peak, counting from 0.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the index of the peak.'],
    constraints: ['3 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6\n1 4 9 12 7 2\n', note: 'The peak 12 is at index 3.' }],
    hints: ['Compare `a[mid]` with `a[mid + 1]`.', 'If it is smaller you are going up, so the peak is on the right.', 'Otherwise the peak is at `mid` or on the left: `hi = mid`.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        lo, hi = 0, n - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if a[mid] < a[mid + 1]:
                lo = mid + 1
            else:
                hi = mid
        print(lo)`,
      cpp: r`
        int lo = 0, hi = n - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (a[mid] < a[mid + 1]) lo = mid + 1;
            else hi = mid;
        }
        cout << lo << "\n";`,
      java: r`
        int lo = 0, hi = (int) n - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (a[mid] < a[mid + 1]) lo = mid + 1;
            else hi = mid;
        }
        System.out.println(lo);`
    },
    solution: { explanation: ['An upward step at `mid` means the peak is to its right, otherwise it is at `mid` or to its left.'], complexity: 'Time O(log n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); return String(a.indexOf(Math.max(...a))); },
    tests() {
      const g = rng(135);
      const make = (n, peak, lo, hi) => {
        const vals = randDistinct(g, n, lo, hi).sort((p, s) => p - s);
        const top = vals.pop();
        const mix = shuffle(g, vals);
        const left = mix.slice(0, peak).sort((p, s) => p - s);
        const right = mix.slice(peak).sort((p, s) => s - p);
        return arr([...left, top, ...right]);
      };
      return ['6\n1 4 9 12 7 2\n', '3\n1 5 2\n', '3\n1 3 2\n', make(10, 4, 0, 40), make(2000, 1, -5000, 5000), make(2000, 1998, -5000, 5000), make(20000, 10000, -1000000000, 1000000000), make(20000, 1, -1000000000, 1000000000), make(20000, 19998, -1000000000, 1000000000)];
    }
  },

  {
    slug: 'smallest-divisor-threshold',
    title: 'Smallest Divisor Within a Limit',
    difficulty: 'medium',
    tags: ['binary-search', 'binary-search-on-answer'],
    concept: {
      title: 'Binary search on the answer',
      body: [
        'Sometimes the array is not what you search in. Instead you search for the best **value of the answer**, if you can test a value quickly and the test is *monotone*: once a value works, every bigger value works too. Then the possible answers split into "fail" values followed by "works" values, and binary search finds the border.',
        { code: 'def ok(d):\n    return sum((x + d - 1) // d for x in a) <= limit\n\nlo, hi = 1, max(a)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if ok(mid): hi = mid\n    else: lo = mid + 1' },
        'Here a bigger divisor makes every rounded-up quotient smaller or equal, so the sum can only fall. The check costs O(n) and is repeated about log(max) times.'
      ]
    },
    statement: ['You are given `n` positive integers and a limit `t` (with `t >= n`). Choose a positive integer divisor `d`, divide every number by `d` and round each result **up** to the next integer. Find the smallest `d` for which the sum of these rounded results is at most `t`.'],
    inputFormat: ['The first line has `n` and `t`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print the smallest valid divisor.'],
    constraints: ['1 <= n <= 20000', 'n <= t <= 10^9', '1 <= each number <= 10^6'],
    examples: [{ input: '4 6\n1 2 5 9\n', note: 'With d = 5 the results are 1+1+1+2 = 5 <= 6. With d = 4 they are 1+1+2+3 = 7 > 6.' }],
    hints: ['A larger d never increases the sum.', 'The answer lies between 1 and the largest number.', 'Binary search on d: if the sum for `mid` is at most `t`, try smaller, otherwise larger.'],
    program: {
      io: ['n:int t:int', 'a:int[n]'],
      fast: true,
      python: r`
        lo, hi = 1, max(a)
        while lo < hi:
            mid = (lo + hi) // 2
            total = 0
            for x in a:
                total += (x + mid - 1) // mid
            if total <= t:
                hi = mid
            else:
                lo = mid + 1
        print(lo)`,
      cpp: r`
        long long lo = 1, hi = 1;
        for (int i = 0; i < n; i++) hi = max(hi, a[i]);
        while (lo < hi) {
            long long mid = (lo + hi) / 2;
            long long total = 0;
            for (int i = 0; i < n; i++) total += (a[i] + mid - 1) / mid;
            if (total <= t) hi = mid;
            else lo = mid + 1;
        }
        cout << lo << "\n";`,
      includes: ['<algorithm>'],
      java: r`
        long lo = 1, hi = 1;
        for (int i = 0; i < n; i++) hi = Math.max(hi, a[i]);
        while (lo < hi) {
            long mid = (lo + hi) / 2;
            long total = 0;
            for (int i = 0; i < n; i++) total += (a[i] + mid - 1) / mid;
            if (total <= t) hi = mid;
            else lo = mid + 1;
        }
        System.out.println(lo);`
    },
    solution: { explanation: ['The sum is non-increasing in `d`, so the valid divisors form a range that starts at the answer. Binary search finds its start with about log(max) checks of O(n) each.'], complexity: 'Time O(n log max), space O(1).' },
    solve(input) { const rs = rows(input); const t = nums(rs[0])[1]; const a = nums(rs[1]); const ok = (d) => a.reduce((s, x) => s + Math.ceil(x / d), 0) <= t; let lo = 1, hi = Math.max(...a); while (lo < hi) { const mid = (lo + hi) >> 1; if (ok(mid)) hi = mid; else lo = mid + 1; } return String(lo); },
    tests() { const g = rng(136); const make = (n, hi, tLo, tHi) => { const a = randArray(g, n, 1, hi); return `${n} ${randInt(g, Math.max(n, tLo), Math.max(n, tHi))}\n${a.join(' ')}\n`; }; return ['4 6\n1 2 5 9\n', '1 1\n7\n', '1 7\n7\n', '3 3\n1 1 1\n', '3 1000000000\n5 6 7\n', make(10, 30, 10, 30), make(500, 1000, 500, 2000), make(20000, 1000000, 20000, 100000), make(20000, 1000000, 20000, 20005), make(20000, 1000000, 1000000, 100000000)]; }
  },

  {
    slug: 'ship-packages-in-days',
    title: 'Ship Packages Within D Days',
    difficulty: 'medium',
    tags: ['binary-search', 'binary-search-on-answer', 'greedy'],
    concept: {
      title: 'A feasibility check for a given capacity',
      body: [
        'Packages must be shipped in the given order, a ship carries a fixed weight per day, and you want the smallest capacity that finishes within `D` days. For a *given* capacity the number of days is easy to compute greedily: load packages in order and start a new day when the next one does not fit.',
        { code: 'def days(cap):\n    d, load = 1, 0\n    for w in weights:\n        if load + w > cap:\n            d += 1; load = 0\n        load += w\n    return d' },
        'A bigger capacity never needs more days, so "days(cap) <= D" is monotone in `cap`. The answer lies between the heaviest package (it must fit) and the total weight (everything in one day), and binary search finds the smallest capacity that works.'
      ]
    },
    statement: ['A conveyor belt has `n` packages with the given weights, to be shipped **in this order**. Each day the ship takes a block of consecutive packages whose total weight does not exceed its capacity. Find the smallest capacity that lets you ship all packages in at most `D` days.'],
    inputFormat: ['The first line has `n` and `D`.', 'The second line has the `n` weights.'],
    outputFormat: ['Print the smallest capacity.'],
    constraints: ['1 <= D <= n <= 20000', '1 <= each weight <= 10^5'],
    examples: [{ input: '10 5\n1 2 3 4 5 6 7 8 9 10\n', note: 'Capacity 15 works: (1 2 3 4 5) (6 7) (8) (9) (10).' }],
    hints: ['The capacity must be at least the heaviest package.', 'For a fixed capacity, count the days greedily: start a new day when the next package does not fit.', 'Binary search the capacity between the largest weight and the sum of all weights.'],
    program: {
      io: ['n:int days:int', 'w:int[n]'],
      fast: true,
      python: r`
        lo, hi = max(w), sum(w)
        while lo < hi:
            mid = (lo + hi) // 2
            used, load = 1, 0
            for x in w:
                if load + x > mid:
                    used += 1
                    load = 0
                load += x
            if used <= days:
                hi = mid
            else:
                lo = mid + 1
        print(lo)`,
      cpp: r`
        long long lo = 0, hi = 0;
        for (int i = 0; i < n; i++) {
            lo = max(lo, w[i]);
            hi += w[i];
        }
        while (lo < hi) {
            long long mid = (lo + hi) / 2;
            long long used = 1, load = 0;
            for (int i = 0; i < n; i++) {
                if (load + w[i] > mid) {
                    used++;
                    load = 0;
                }
                load += w[i];
            }
            if (used <= days) hi = mid;
            else lo = mid + 1;
        }
        cout << lo << "\n";`,
      includes: ['<algorithm>'],
      java: r`
        long lo = 0, hi = 0;
        for (int i = 0; i < n; i++) {
            lo = Math.max(lo, w[i]);
            hi += w[i];
        }
        while (lo < hi) {
            long mid = (lo + hi) / 2;
            long used = 1, load = 0;
            for (int i = 0; i < n; i++) {
                if (load + w[i] > mid) {
                    used++;
                    load = 0;
                }
                load += w[i];
            }
            if (used <= days) hi = mid;
            else lo = mid + 1;
        }
        System.out.println(lo);`
    },
    solution: { explanation: ['For a fixed capacity the greedy day count is exact, and it never grows when the capacity grows. Binary search on the capacity finds the smallest one that needs at most `D` days.'], complexity: 'Time O(n log(sum)), space O(1).' },
    solve(input) { const rs = rows(input); const D = nums(rs[0])[1]; const w = nums(rs[1]); const days = (cap) => { let d = 1, load = 0; for (const x of w) { if (load + x > cap) { d++; load = 0; } load += x; } return d; }; let lo = Math.max(...w), hi = w.reduce((s, x) => s + x, 0); while (lo < hi) { const mid = (lo + hi) >> 1; if (days(mid) <= D) hi = mid; else lo = mid + 1; } return String(lo); },
    tests() {
      const g = rng(137);
      const make = (n, D, hi) => `${n} ${D}\n${randArray(g, n, 1, hi).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const D = nums(rs[0])[1]; const w = nums(rs[1]); for (let cap = Math.max(...w); ; cap++) { let d = 1, load = 0; for (const x of w) { if (load + x > cap) { d++; load = 0; } load += x; } if (d <= D) return String(cap); } };
      const small = many(30, () => { const n = randInt(g, 1, 9); return make(n, randInt(g, 1, n), 12); });
      for (const t of small) if (brute(t) !== this.solve(t)) throw new Error('reference differs from brute force');
      return ['10 5\n1 2 3 4 5 6 7 8 9 10\n', '1 1\n7\n', '5 5\n3 1 4 1 5\n', '5 1\n3 1 4 1 5\n', ...small.slice(0, 4), make(500, 7, 500), make(20000, 1, 100000), make(20000, 20000, 100000), make(20000, 100, 100000), make(20000, 3000, 100000)];
    }
  }
];
