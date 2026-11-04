import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct } from '../../lib.mjs';

const MOD = 1000000007n;
const kadane = (a) => { let cur = a[0], best = a[0]; for (let i = 1; i < a.length; i++) { cur = Math.max(a[i], cur + a[i]); best = Math.max(best, cur); } return best; };

export default [
  {
    slug: 'maximum-subarray-sum',
    title: 'Maximum Subarray Sum',
    difficulty: 'medium',
    tags: ['arrays', 'kadane', 'dynamic-programming'],
    concept: {
      title: 'Best sum ending here',
      body: [
        'Among all blocks of consecutive elements, which one has the largest sum? Look at the best block that **ends at position i**. It is either the element `a[i]` alone, or the best block ending at `i - 1` extended by `a[i]`. If the earlier block has a negative sum, it only hurts, so we start fresh.',
        { code: 'cur = best = a[0]\nfor x in a[1:]:\n    cur = max(x, cur + x)    # best block ending at this element\n    best = max(best, cur)' },
        'This is **Kadane\'s algorithm**: one pass, two variables. The block must contain at least one element, so for an array of only negative numbers the answer is its largest (least negative) element.'
      ]
    },
    statement: ['Given an array of `n` integers, find the largest sum of a non-empty block of consecutive elements.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the largest sum.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '9\n-2 1 -3 4 -1 2 1 -5 4\n', note: 'The block 4 -1 2 1 has sum 6.' }, { input: '3\n-5 -2 -9\n', note: 'All numbers are negative: the best block is the single element -2.' }],
    hints: ['Think about the best block that ends at the current element.', 'It is either the element alone or the previous best block plus the element.', 'Keep the largest value of that "best ending here" over the whole pass.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        cur = best = a[0]
        for i in range(1, n):
            cur = max(a[i], cur + a[i])
            best = max(best, cur)
        print(best)`,
      cpp: r`
        long long cur = a[0], best = a[0];
        for (int i = 1; i < n; i++) {
            cur = max(a[i], cur + a[i]);
            best = max(best, cur);
        }
        cout << best << "\n";`,
      java: r`
        long cur = a[0], best = a[0];
        for (int i = 1; i < n; i++) {
            cur = Math.max(a[i], cur + a[i]);
            best = Math.max(best, cur);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['`cur` is the best sum of a block ending at the current element. A negative `cur` is dropped, which is what `max(x, cur + x)` does.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { return String(kadane(nums(rows(input)[1]))); },
    tests() {
      const g = rng(161);
      const brute = (a) => { let best = -Infinity; for (let i = 0; i < a.length; i++) { let s = 0; for (let j = i; j < a.length; j++) { s += a[j]; best = Math.max(best, s); } } return best; };
      for (let t = 0; t < 200; t++) { const a = randArray(g, randInt(g, 1, 12), -9, 9); if (brute(a) !== kadane(a)) throw new Error('Kadane differs from brute force'); }
      const make = (n, lo, hi) => arr(randArray(g, n, lo, hi));
      return ['9\n-2 1 -3 4 -1 2 1 -5 4\n', '3\n-5 -2 -9\n', '1\n7\n', '1\n-7\n', '4\n1 2 3 4\n', make(15, -9, 9), make(2000, -1000, 1000), make(20000, -1000000000, 1000000000), make(20000, -1000000000, -1), make(20000, -100, 120)];
    }
  },

  {
    slug: 'maximum-product-subarray',
    title: 'Maximum Product Subarray',
    difficulty: 'medium',
    tags: ['arrays', 'kadane', 'dynamic-programming'],
    concept: {
      title: 'Keep the biggest and the smallest product',
      body: [
        'For products the same idea as for sums works with one twist: multiplying by a **negative** number turns the smallest (most negative) product into the biggest one. So for the blocks ending at the current element keep both the largest product `hi` and the smallest product `lo`.',
        { code: 'hi = lo = best = a[0]\nfor x in a[1:]:\n    candidates = (x, hi * x, lo * x)\n    hi, lo = max(candidates), min(candidates)\n    best = max(best, hi)' },
        'A zero resets both to 0 automatically, because `hi * 0` and `lo * 0` are 0, and the element itself (`x`) is the other candidate for the next step.'
      ]
    },
    statement: ['Given an array of `n` integers, find the largest product of a non-empty block of consecutive elements.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the largest product.'],
    constraints: ['1 <= n <= 35', '-3 <= each number <= 3 (so every product fits in 64 bits)'],
    examples: [{ input: '4\n2 3 -2 4\n', note: 'The block 2 3 has product 6.' }, { input: '3\n-2 0 -1\n', note: 'The best block is the single element 0.' }],
    hints: ['A negative number can turn the smallest product into the largest.', 'Keep the largest and the smallest product of a block ending at the current element.', 'For each new element, the candidates are the element itself and both products times the element.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      includes: ['<algorithm>'],
      python: r`
        hi = lo = best = a[0]
        for i in range(1, n):
            x = a[i]
            candidates = (x, hi * x, lo * x)
            hi = max(candidates)
            lo = min(candidates)
            best = max(best, hi)
        print(best)`,
      cpp: r`
        long long hi = a[0], lo = a[0], best = a[0];
        for (int i = 1; i < n; i++) {
            long long x = a[i], p = hi * x, q = lo * x;
            hi = max(x, max(p, q));
            lo = min(x, min(p, q));
            best = max(best, hi);
        }
        cout << best << "\n";`,
      java: r`
        long hi = a[0], lo = a[0], best = a[0];
        for (int i = 1; i < n; i++) {
            long x = a[i], p = hi * x, q = lo * x;
            hi = Math.max(x, Math.max(p, q));
            lo = Math.min(x, Math.min(p, q));
            best = Math.max(best, hi);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Both the largest and the smallest product ending at an element are needed, because multiplying by a negative number swaps their roles.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]).map(BigInt); let best = a[0]; for (let i = 0; i < a.length; i++) { let p = 1n; for (let j = i; j < a.length; j++) { p *= a[j]; if (p > best) best = p; } } return best.toString(); },
    tests() { const g = rng(162); return ['4\n2 3 -2 4\n', '3\n-2 0 -1\n', '1\n-3\n', '1\n0\n', '2\n-3 -3\n', '35\n' + '-3 3 '.repeat(17) + '3\n', '35\n' + '-3 '.repeat(35).trim() + '\n', ...many(5, () => arr(randArray(g, randInt(g, 5, 35), -3, 3))), ...many(2, () => arr(randArray(g, 35, -1, 3)))]; }
  },

  {
    slug: 'product-of-others',
    title: 'Product of All the Others',
    difficulty: 'medium',
    tags: ['arrays', 'prefix-product', 'modulo'],
    concept: {
      title: 'Prefix and suffix products',
      body: [
        'For each position you want the product of all elements except the one at that position. Dividing the total by `a[i]` is not allowed (it fails for zeros, and under a modulo it needs an inverse). Instead notice that the product of the others is **(product of everything to the left) times (product of everything to the right)**.',
        { code: 'left[i] = a[0] * ... * a[i - 1]      # computed left to right\nright   = a[i + 1] * ... * a[n - 1]  # kept in a running variable, right to left\nresult[i] = left[i] * right' },
        'Two passes give all results in O(n). Because the products get huge, they are asked modulo 1000000007 (take every number modulo 1000000007 first, making negative numbers non-negative).'
      ]
    },
    statement: ['Given an array of `n` integers, print for every position `i` the product of all elements except `a[i]`, **modulo 1000000007**. The printed results must be in the range 0 to 1000000006 (a negative product is made positive by adding multiples of the modulus).'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `n` integers separated by spaces.'],
    constraints: ['2 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '4\n1 2 3 4\n', note: '2*3*4 = 24, 1*3*4 = 12, 1*2*4 = 8, 1*2*3 = 6.' }, { input: '3\n-1 2 3\n', note: 'The products are 6, -3 and -2; modulo 1000000007 the last two are 1000000004 and 1000000005.' }],
    hints: ['Compute for every i the product of the elements to its left.', 'Go from the right with a running product of the elements to the right of i.', 'Take every number modulo 1000000007 first, and the product modulo after each multiplication.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        MOD = 10**9 + 7
        vals = [x % MOD for x in a]
        left = [1] * n
        for i in range(1, n):
            left[i] = left[i - 1] * vals[i - 1] % MOD
        right = 1
        res = [0] * n
        for i in range(n - 1, -1, -1):
            res[i] = left[i] * right % MOD
            right = right * vals[i] % MOD
        print(*res)`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<long long> vals(n), left(n, 1), res(n);
        for (int i = 0; i < n; i++) vals[i] = ((a[i] % MOD) + MOD) % MOD;
        for (int i = 1; i < n; i++) left[i] = left[i - 1] * vals[i - 1] % MOD;
        long long right = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] = left[i] * right % MOD;
            right = right * vals[i] % MOD;
        }
        for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        final long MOD = 1000000007L;
        int m = (int) n;
        long[] vals = new long[m], left = new long[m], res = new long[m];
        for (int i = 0; i < m; i++) vals[i] = Math.floorMod(a[i], MOD);
        left[0] = 1;
        for (int i = 1; i < m; i++) left[i] = left[i - 1] * vals[i - 1] % MOD;
        long right = 1;
        for (int i = m - 1; i >= 0; i--) {
            res[i] = left[i] * right % MOD;
            right = right * vals[i] % MOD;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < m; i++) sb.append(res[i]).append(i + 1 < m ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The product of the others is the product on the left times the product on the right. One pass stores the left products, a second pass from the right multiplies in the right products.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]).map((x) => ((BigInt(x) % MOD) + MOD) % MOD); const n = a.length; const left = [1n]; for (let i = 1; i < n; i++) left.push((left[i - 1] * a[i - 1]) % MOD); let right = 1n; const res = new Array(n); for (let i = n - 1; i >= 0; i--) { res[i] = (left[i] * right) % MOD; right = (right * a[i]) % MOD; } return res.join(' '); },
    tests() { const g = rng(163); return ['4\n1 2 3 4\n', '3\n-1 2 3\n', '2\n5 7\n', '3\n0 4 5\n', '4\n0 0 3 4\n', '3\n1000000000 1000000000 -1000000000\n', arr(randArray(g, 12, -9, 9)), arr(randArray(g, 2000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, 0, 3))]; }
  },

  {
    slug: 'next-permutation',
    title: 'Next Permutation',
    difficulty: 'medium',
    tags: ['arrays', 'permutations', 'in-place'],
    concept: {
      title: 'The smallest step up',
      body: [
        'To find the next arrangement in dictionary order: go from the right to the first position `i` with `a[i] < a[i + 1]`. Everything after `i` is in decreasing order, which is the largest arrangement of that tail, so `a[i]` must grow. Swap it with the **smallest element to its right that is bigger than it** (found from the right), then reverse the tail so that it becomes the smallest possible.',
        { code: 'i = n - 2\nwhile i >= 0 and a[i] >= a[i + 1]: i -= 1\nif i >= 0:\n    j = n - 1\n    while a[j] <= a[i]: j -= 1\n    a[i], a[j] = a[j], a[i]\na[i + 1:] = reversed(a[i + 1:])' },
        'If there is no such `i`, the array is the last arrangement; reversing the whole array gives the first one (sorted increasingly).'
      ]
    },
    statement: ['Given an array of `n` integers (duplicates are possible), print the next arrangement in dictionary (lexicographic) order, comparing the arrays element by element. If the array is already the largest arrangement, print the smallest one, i.e. the array sorted in increasing order.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the resulting array on one line.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '3\n1 2 3\n', note: 'The next arrangement is 1 3 2.' }, { input: '3\n3 2 1\n', note: 'This is the last arrangement; the answer is the first one: 1 2 3.' }],
    hints: ['Find the last position `i` where `a[i] < a[i + 1]`.', 'Swap `a[i]` with the last element to the right of it that is larger than `a[i]`.', 'Reverse everything after position `i`.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        i = n - 2
        while i >= 0 and a[i] >= a[i + 1]:
            i -= 1
        if i >= 0:
            j = n - 1
            while a[j] <= a[i]:
                j -= 1
            a[i], a[j] = a[j], a[i]
        a[i + 1:] = reversed(a[i + 1:])
        print(*a)`,
      cpp: r`
        int i = n - 2;
        while (i >= 0 && a[i] >= a[i + 1]) i--;
        if (i >= 0) {
            int j = n - 1;
            while (a[j] <= a[i]) j--;
            swap(a[i], a[j]);
        }
        reverse(a.begin() + i + 1, a.end());
        for (int k = 0; k < n; k++) cout << a[k] << (k + 1 < n ? " " : "\n");`,
      java: r`
        int i = (int) n - 2;
        while (i >= 0 && a[i] >= a[i + 1]) i--;
        if (i >= 0) {
            int j = (int) n - 1;
            while (a[j] <= a[i]) j--;
            long t = a[i]; a[i] = a[j]; a[j] = t;
        }
        for (int lo = i + 1, hi = (int) n - 1; lo < hi; lo++, hi--) {
            long t = a[lo]; a[lo] = a[hi]; a[hi] = t;
        }
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < n; k++) sb.append(a[k]).append(k + 1 < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The tail after the pivot is in decreasing order. Swapping the pivot with the next larger element of the tail and then sorting the tail (by reversing it) gives the smallest larger arrangement.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const a = nums(rows(input)[1]); const n = a.length; let i = n - 2;
      while (i >= 0 && a[i] >= a[i + 1]) i--;
      if (i >= 0) { let j = n - 1; while (a[j] <= a[i]) j--; [a[i], a[j]] = [a[j], a[i]]; }
      const tail = a.splice(i + 1).reverse();
      return [...a, ...tail].join(' ');
    },
    tests() {
      const g = rng(164);
      const sorted = (n, desc) => arr(randArray(g, n, -1000, 1000).sort((p, s) => (desc ? s - p : p - s)));
      return ['3\n1 2 3\n', '3\n3 2 1\n', '1\n5\n', '3\n1 1 5\n', '4\n1 3 2 2\n', '4\n2 2 2 2\n', arr(randArray(g, 10, 0, 3)), arr(randArray(g, 2000, -5, 5)), arr(randArray(g, 20000, -1000000000, 1000000000)), sorted(20000, true), sorted(20000, false), arr([...randArray(g, 5, 0, 9), ...randArray(g, 15000, 10, 20).sort((p, s) => s - p)])];
    }
  },

  {
    slug: 'circular-maximum-subarray',
    title: 'Maximum Sum on a Circle',
    difficulty: 'medium',
    tags: ['arrays', 'kadane', 'circular'],
    concept: {
      title: 'A circular block is a block, or the rest minus a block',
      body: [
        'On a circle a block of consecutive elements either fits in the array as usual, or it **wraps around** the end. A wrapping block is everything *except* a normal block in the middle. So its sum is `total - (sum of that middle block)`, and it is the largest when the middle block has the **smallest** possible sum.',
        { code: 'answer = max(max_subarray_sum, total - min_subarray_sum)' },
        'Both the maximum and the minimum block sums come from one Kadane pass each. There is one special case: if all numbers are negative, the "wrapping" block would be empty, which is not allowed; then the answer is just the largest single element (which is the ordinary Kadane result).'
      ]
    },
    statement: ['The `n` numbers are written on a circle, so the last number is followed by the first one. Find the largest sum of a non-empty block of consecutive numbers on the circle. A block may use each number at most once.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the largest sum.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5\n5 -3 5 -4 6\n', note: 'The block 6, 5, -3, 5 wraps around the end of the array: its sum is 13.' }],
    hints: ['Case 1: the best block does not wrap; use Kadane.', 'Case 2: the best block wraps; it is the total minus the smallest block sum in the middle.', 'If all numbers are negative, return the plain Kadane answer.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        total = sum(a)
        curMax = bestMax = a[0]
        curMin = bestMin = a[0]
        for i in range(1, n):
            curMax = max(a[i], curMax + a[i])
            bestMax = max(bestMax, curMax)
            curMin = min(a[i], curMin + a[i])
            bestMin = min(bestMin, curMin)
        print(bestMax if bestMax < 0 else max(bestMax, total - bestMin))`,
      cpp: r`
        long long total = a[0];
        long long curMax = a[0], bestMax = a[0], curMin = a[0], bestMin = a[0];
        for (int i = 1; i < n; i++) {
            total += a[i];
            curMax = max(a[i], curMax + a[i]);
            bestMax = max(bestMax, curMax);
            curMin = min(a[i], curMin + a[i]);
            bestMin = min(bestMin, curMin);
        }
        cout << (bestMax < 0 ? bestMax : max(bestMax, total - bestMin)) << "\n";`,
      java: r`
        long total = a[0];
        long curMax = a[0], bestMax = a[0], curMin = a[0], bestMin = a[0];
        for (int i = 1; i < n; i++) {
            total += a[i];
            curMax = Math.max(a[i], curMax + a[i]);
            bestMax = Math.max(bestMax, curMax);
            curMin = Math.min(a[i], curMin + a[i]);
            bestMin = Math.min(bestMin, curMin);
        }
        System.out.println(bestMax < 0 ? bestMax : Math.max(bestMax, total - bestMin));`
    },
    solution: { explanation: ['The best wrapping block is the whole circle minus the worst ordinary block. Take the larger of the two cases; an all-negative array is handled separately.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const a = nums(rows(input)[1]); const n = a.length; const total = a.reduce((s, x) => s + x, 0);
      const big = kadane(a); const small = -kadane(a.map((x) => -x));
      return String(big < 0 ? big : Math.max(big, total - small));
    },
    tests() {
      const g = rng(165);
      const brute = (a) => { const n = a.length; let best = -Infinity; for (let i = 0; i < n; i++) { let s = 0; for (let len = 1; len <= n; len++) { s += a[(i + len - 1) % n]; best = Math.max(best, s); } } return best; };
      const fast = (a) => { const total = a.reduce((s, x) => s + x, 0); const big = kadane(a); const small = -kadane(a.map((x) => -x)); return big < 0 ? big : Math.max(big, total - small); };
      for (let t = 0; t < 300; t++) { const a = randArray(g, randInt(g, 1, 10), -9, 9); if (brute(a) !== fast(a)) throw new Error('circular reference differs from brute force'); }
      return ['5\n5 -3 5 -4 6\n', '4\n5 -3 5 -4\n', '1\n-4\n', '3\n-3 -2 -5\n', '3\n1 2 3\n', '4\n8 -8 9 -9\n', arr(randArray(g, 12, -9, 9)), arr(randArray(g, 2000, -1000, 1000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, -1)), arr(randArray(g, 20000, -10, 100))];
    }
  },

  {
    slug: 'range-updates',
    title: 'Add to a Range',
    difficulty: 'medium',
    tags: ['arrays', 'difference-array', 'queries'],
    concept: {
      title: 'The difference array',
      body: [
        'Adding a value `v` to every element of a range `[l, r]` one by one costs O(n) per update. A **difference array** `d` makes it O(1): put `+v` at `d[l]` and `-v` at `d[r + 1]`. The real values are the running sums of `d`: the `+v` starts to count at `l` and is cancelled by the `-v` after `r`.',
        { code: 'd = [0] * (n + 2)\nfor l, r, v in updates:\n    d[l] += v\n    d[r + 1] -= v\ncur = 0\nfor i in range(1, n + 1):\n    cur += d[i]      # value of position i\n    result.append(cur)' },
        'This is the reverse of prefix sums: prefix sums answer many range *queries* after one preparation; the difference array applies many range *updates* before one final pass.'
      ]
    },
    statement: ['An array of `n` zeros is given (positions 1 to n). Then `q` updates follow. Each update gives `l`, `r` and `v` and adds `v` to every position from `l` to `r`. Print the final array.'],
    inputFormat: ['The first line has `n` and `q`.', 'Each of the next `q` lines has `l`, `r` and `v`.'],
    outputFormat: ['Print the `n` final values on one line.'],
    constraints: ['1 <= n, q <= 20000', '1 <= l <= r <= n', '-10^9 <= v <= 10^9'],
    examples: [{ input: '5 3\n1 3 2\n2 5 3\n3 3 -1\n', note: 'After the updates: 2 5 4 3 3.' }],
    hints: ['Changing a whole range one position at a time is too slow for many updates.', 'Add `v` at position `l` and subtract `v` at position `r + 1` in a helper array.', 'Finally, the value of position `i` is the sum of the helper array up to `i`.'],
    program: {
      io: ['n:int q:int', 'u:int[q][3]'],
      fast: true,
      python: r`
        d = [0] * (n + 2)
        for l, rr, v in u:
            d[l] += v
            d[rr + 1] -= v
        cur = 0
        out = []
        for i in range(1, n + 1):
            cur += d[i]
            out.append(cur)
        print(*out)`,
      cpp: r`
        vector<long long> d(n + 2, 0);
        for (int k = 0; k < q; k++) {
            d[u[k][0]] += u[k][2];
            d[u[k][1] + 1] -= u[k][2];
        }
        long long cur = 0;
        for (int i = 1; i <= n; i++) {
            cur += d[i];
            cout << cur << (i < n ? " " : "\n");
        }`,
      java: r`
        long[] d = new long[(int) n + 2];
        for (int k = 0; k < q; k++) {
            d[(int) u[k][0]] += u[k][2];
            d[(int) u[k][1] + 1] -= u[k][2];
        }
        long cur = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= n; i++) {
            cur += d[i];
            sb.append(cur).append(i < n ? " " : "\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Each update touches only two cells of the difference array. One prefix-sum pass at the end turns the differences into the real values.'], complexity: 'Time O(n + q), space O(n).' },
    solve(input) { const rs = rows(input); const [n, q] = nums(rs[0]); const d = new Array(n + 2).fill(0); for (let k = 0; k < q; k++) { const [l, rr, v] = nums(rs[1 + k]); d[l] += v; d[rr + 1] -= v; } const out = []; let cur = 0; for (let i = 1; i <= n; i++) { cur += d[i]; out.push(cur); } return out.join(' '); },
    tests() { const g = rng(166); const make = (n, q, hi) => { let s = `${n} ${q}\n`; for (let k = 0; k < q; k++) { const l = randInt(g, 1, n); s += `${l} ${randInt(g, l, n)} ${randInt(g, -hi, hi)}\n`; } return s; }; return ['5 3\n1 3 2\n2 5 3\n3 3 -1\n', '1 1\n1 1 -5\n', '3 2\n1 3 1000000000\n1 3 1000000000\n', make(10, 8, 9), make(200, 300, 1000), make(20000, 20000, 1000000000), make(20000, 20000, 5), make(20000, 1, 1000000000)]; }
  },

  {
    slug: 'longest-mountain',
    title: 'Longest Mountain in an Array',
    difficulty: 'medium',
    tags: ['arrays', 'two-pointers', 'one-pass'],
    concept: {
      title: 'Expand from each peak',
      body: [
        'A **mountain** is a block with at least 3 elements that strictly increases up to a peak and then strictly decreases. Find a peak first (`a[i-1] < a[i] > a[i+1]`), then walk left while the values keep decreasing, and right while they keep decreasing. The mountain is everything between.',
        { code: 'if a[i-1] < a[i] > a[i+1]:\n    l = i - 1\n    while l > 0 and a[l-1] < a[l]: l -= 1\n    r = i + 1\n    while r < n - 1 and a[r] > a[r+1]: r += 1\n    best = max(best, r - l + 1)\n    i = r        # nothing before r can start another peak' },
        'Jumping `i` to the end of the mountain makes every element visited a constant number of times, so the whole scan is O(n) although there are loops inside the loop.'
      ]
    },
    statement: ['A **mountain** is a block of at least 3 consecutive elements that strictly increases up to one element (the peak) and then strictly decreases. Print the length of the longest mountain in the array, or 0 if there is none.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print one integer.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '7\n2 1 4 7 3 2 5\n', note: 'The mountain 1 4 7 3 2 has length 5.' }],
    hints: ['A peak is an element that is greater than both neighbours.', 'From a peak, walk left while the values decrease and right while they decrease.', 'The mountain length is `right - left + 1`. Continue after the right end.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        best = 0
        i = 1
        while i < n - 1:
            if a[i - 1] < a[i] and a[i] > a[i + 1]:
                l = i - 1
                while l > 0 and a[l - 1] < a[l]:
                    l -= 1
                rr = i + 1
                while rr < n - 1 and a[rr] > a[rr + 1]:
                    rr += 1
                best = max(best, rr - l + 1)
                i = rr
            else:
                i += 1
        print(best)`,
      cpp: r`
        int best = 0, i = 1;
        while (i < n - 1) {
            if (a[i - 1] < a[i] && a[i] > a[i + 1]) {
                int l = i - 1;
                while (l > 0 && a[l - 1] < a[l]) l--;
                int rr = i + 1;
                while (rr < n - 1 && a[rr] > a[rr + 1]) rr++;
                best = max(best, rr - l + 1);
                i = rr;
            } else {
                i++;
            }
        }
        cout << best << "\n";`,
      java: r`
        int best = 0, i = 1;
        while (i < n - 1) {
            if (a[i - 1] < a[i] && a[i] > a[i + 1]) {
                int l = i - 1;
                while (l > 0 && a[l - 1] < a[l]) l--;
                int rr = i + 1;
                while (rr < n - 1 && a[rr] > a[rr + 1]) rr++;
                best = Math.max(best, rr - l + 1);
                i = rr;
            } else {
                i++;
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Every mountain has exactly one peak. Expand from each peak to both sides and skip to the end of the mountain, so no element is scanned many times.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); const n = a.length; let best = 0; for (let p = 1; p < n - 1; p++) { if (a[p - 1] < a[p] && a[p] > a[p + 1]) { let l = p - 1; while (l > 0 && a[l - 1] < a[l]) l--; let rr = p + 1; while (rr < n - 1 && a[rr] > a[rr + 1]) rr++; best = Math.max(best, rr - l + 1); } } return String(best); },
    tests() { const g = rng(167); const hills = (count) => arr(many(count, () => { const up = randInt(g, 1, 6), down = randInt(g, 1, 6); const base = randInt(g, 0, 100); return [...many(up, (i) => base + i), ...many(down, (i) => base + up - i)].join(' '); }).join(' ').split(' ').map(Number)); return ['7\n2 1 4 7 3 2 5\n', '1\n5\n', '3\n1 2 1\n', '3\n1 2 2\n', '5\n1 2 3 4 5\n', '5\n5 4 3 2 1\n', arr(randArray(g, 15, 0, 4)), hills(500), arr(randArray(g, 20000, 0, 3)), arr(randArray(g, 20000, -1000000000, 1000000000)), `20000\n${[...many(10000, (i) => i), ...many(10000, (i) => 10000 - i)].join(' ')}\n`]; }
  },

  {
    slug: 'find-the-duplicate',
    title: 'Find the Repeated Number',
    difficulty: 'medium',
    tags: ['arrays', 'cycle-detection', 'two-pointers'],
    concept: {
      title: 'An array as a chain of jumps',
      body: [
        'You get `m` numbers, all between 1 and `m - 1`. By the pigeonhole principle some number repeats. Treat the array as a "jump table": from position `i` you jump to position `a[i]`. Because every value is a valid position and the value 0 is never a target, following the jumps from position 0 must eventually enter a **cycle**, and the entrance of the cycle is exactly the repeated number (two different positions jump to it).',
        { code: 'slow = fast = 0\nwhile True:\n    slow = a[slow]\n    fast = a[a[fast]]\n    if slow == fast: break\nslow = 0\nwhile slow != fast:\n    slow = a[slow]\n    fast = a[fast]\n# slow is the repeated number' },
        'This is Floyd\'s "tortoise and hare" idea: the hare moves twice as fast; when they meet, restarting one of them from the beginning and moving both one step at a time makes them meet again at the entrance of the cycle. It uses no extra memory and does not change the array.'
      ]
    },
    statement: ['You are given `m` integers, each between 1 and `m - 1`. Exactly one value occurs more than once (it may occur many times); every other value occurs once or not at all. Print the repeated value.'],
    inputFormat: ['The first line has `m`.', 'The second line has `m` integers.'],
    outputFormat: ['Print the repeated value.'],
    constraints: ['2 <= m <= 20000'],
    examples: [{ input: '5\n1 3 4 2 2\n', note: 'The value 2 appears twice.' }],
    hints: ['Think of position `i` as pointing to position `a[i]`.', 'Starting at position 0 you must run into a cycle; use a slow and a fast pointer to meet inside it.', 'After they meet, restart one pointer from position 0 and move both by one step: they meet at the repeated value.'],
    program: {
      io: ['m:int', 'a:int[m]'],
      fast: true,
      python: r`
        slow = fast = 0
        while True:
            slow = a[slow]
            fast = a[a[fast]]
            if slow == fast:
                break
        slow = 0
        while slow != fast:
            slow = a[slow]
            fast = a[fast]
        print(slow)`,
      cpp: r`
        int slow = 0, fast = 0;
        do {
            slow = a[slow];
            fast = a[a[fast]];
        } while (slow != fast);
        slow = 0;
        while (slow != fast) {
            slow = a[slow];
            fast = a[fast];
        }
        cout << slow << "\n";`,
      java: r`
        int slow = 0, fast = 0;
        do {
            slow = (int) a[slow];
            fast = (int) a[(int) a[fast]];
        } while (slow != fast);
        slow = 0;
        while (slow != fast) {
            slow = (int) a[slow];
            fast = (int) a[fast];
        }
        System.out.println(slow);`
    },
    solution: { explanation: ['The jumps `i -> a[i]` form a path that ends in a cycle, and the cycle starts at the repeated value. Floyd\'s algorithm finds the start of the cycle with two pointers.'], complexity: 'Time O(m), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); const seen = new Set(); for (const x of a) { if (seen.has(x)) return String(x); seen.add(x); } return '?'; },
    tests() {
      const g = rng(168);
      const make = (m, copies) => {
        const n = m - 1;
        const d = randInt(g, 1, n);
        const others = shuffle(g, many(n, (i) => i + 1).filter((x) => x !== d)).slice(0, m - copies);
        return arr(shuffle(g, [...Array(copies).fill(d), ...others]));
      };
      const tests = ['5\n1 3 4 2 2\n', '2\n1 1\n', '3\n2 2 1\n', '5\n2 2 2 2 2\n', make(10, 2), make(10, 4), make(500, 2), make(2000, 7), make(20000, 2), make(20000, 3), make(20000, 5000)];
      for (const t of tests) { const a = nums(t.split('\n')[1]); const counts = new Map(); for (const x of a) counts.set(x, (counts.get(x) || 0) + 1); if ([...counts.values()].filter((c) => c > 1).length !== 1) throw new Error('a test must have exactly one repeated value'); }
      return tests;
    }
  },

  {
    slug: 'h-index',
    title: 'The h-Index',
    difficulty: 'medium',
    tags: ['arrays', 'sorting'],
    concept: {
      title: 'Sort, then compare rank with value',
      body: [
        'A researcher has an **h-index** of `h` if `h` of their papers were cited at least `h` times each. Sort the citation counts in increasing order. The paper at position `i` (counting from 0) has `n - i` papers with at least its citations, itself included. So paper `i` supports an h-index of `min(c[i], n - i)`.',
        { code: 'c.sort()\nh = 0\nfor i in range(n):\n    h = max(h, min(c[i], n - i))' },
        'The answer is the largest such value. Sorting turns "how many papers have at least this many citations" into a simple position, a trick that is useful whenever a question compares a value with the number of elements above it.'
      ]
    },
    statement: ['Given the number of citations of each of `n` papers, find the largest `h` such that at least `h` papers have at least `h` citations each.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` non-negative integers.'],
    outputFormat: ['Print `h`.'],
    constraints: ['1 <= n <= 20000', '0 <= each number <= 10^9'],
    examples: [{ input: '5\n3 0 6 1 5\n', note: 'Three papers (3, 6, 5) have at least 3 citations, but not four papers with 4. So h = 3.' }],
    hints: ['Sort the numbers in increasing order.', 'The paper at index i has `n - i` papers with at least as many citations (counting itself).', 'Take the maximum of `min(c[i], n - i)` over all i.'],
    program: {
      io: ['n:int', 'c:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        c.sort()
        h = 0
        for i in range(n):
            h = max(h, min(c[i], n - i))
        print(h)`,
      cpp: r`
        sort(c.begin(), c.end());
        long long h = 0;
        for (int i = 0; i < n; i++) h = max(h, min(c[i], n - i));
        cout << h << "\n";`,
      java: r`
        Arrays.sort(c);
        long h = 0;
        for (int i = 0; i < n; i++) h = Math.max(h, Math.min(c[i], n - i));
        System.out.println(h);`
    },
    solution: { explanation: ['After sorting increasingly, the paper at index `i` has `n - i` papers with at least its citations, so it supports an h-index of `min(c[i], n - i)`. The best of these is the answer.'], complexity: 'Time O(n log n), space O(1) besides sorting.' },
    solve(input) { const c = nums(rows(input)[1]); let h = 0; while (c.filter((x) => x >= h + 1).length >= h + 1) h++; return String(h); },
    tests() { const g = rng(169); return ['5\n3 0 6 1 5\n', '1\n0\n', '1\n10\n', '3\n1 1 1\n', '4\n100 100 100 100\n', '4\n0 0 0 0\n', arr(randArray(g, 15, 0, 10)), arr(randArray(g, 2000, 0, 3000)), arr(randArray(g, 20000, 0, 1000000000)), arr(randArray(g, 20000, 0, 15000)), arr(randArray(g, 20000, 5000, 10000))]; }
  },

  {
    slug: 'merge-intervals',
    title: 'Merge Overlapping Intervals',
    difficulty: 'medium',
    tags: ['intervals', 'sorting'],
    concept: {
      title: 'Sort by start, then sweep',
      body: [
        'After sorting the intervals by their **start**, any interval that overlaps the previous result must overlap its *last* merged interval. So one sweep is enough: if the next start is not beyond the end of the last merged interval, extend that end (to the larger of the two ends), otherwise begin a new merged interval.',
        { code: 'iv.sort()\nmerged = []\nfor l, r in iv:\n    if merged and l <= merged[-1][1]:\n        merged[-1][1] = max(merged[-1][1], r)\n    else:\n        merged.append([l, r])' },
        'Intervals that only touch, like `[1, 3]` and `[3, 5]`, count as overlapping here. Merging intervals is the first step of many scheduling problems.'
      ]
    },
    statement: ['You are given `n` closed intervals `[l, r]`. Merge all intervals that overlap or touch (`[1, 3]` and `[3, 5]` become `[1, 5]`). Print the number of resulting intervals, followed by the intervals sorted by their start.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has `l` and `r` with `l <= r`.'],
    outputFormat: ['The first line: the number `k` of merged intervals.', 'Then `k` lines with `l` and `r`.'],
    constraints: ['1 <= n <= 20000', '0 <= l <= r <= 10^9'],
    examples: [{ input: '4\n1 3\n8 10\n2 6\n15 18\n', note: '[1, 3] and [2, 6] merge into [1, 6].' }],
    hints: ['Sort the intervals by their start.', 'Compare the start of each interval with the end of the last merged one.', 'If it starts at or before that end, extend the end with `max`, otherwise start a new interval.'],
    program: {
      io: ['n:int', 'iv:int[n][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        iv.sort()
        merged = []
        for l, rr in iv:
            if merged and l <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], rr)
            else:
                merged.append([l, rr])
        print(len(merged))
        for l, rr in merged:
            print(l, rr)`,
      cpp: r`
        sort(iv.begin(), iv.end());
        vector<pair<long long, long long>> merged;
        for (int i = 0; i < n; i++) {
            if (!merged.empty() && iv[i][0] <= merged.back().second) {
                merged.back().second = max(merged.back().second, iv[i][1]);
            } else {
                merged.push_back({iv[i][0], iv[i][1]});
            }
        }
        cout << merged.size() << "\n";
        for (auto& p : merged) cout << p.first << " " << p.second << "\n";`,
      java: r`
        Arrays.sort(iv, (x, y) -> Long.compare(x[0], y[0]));
        List<long[]> merged = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            if (!merged.isEmpty() && iv[i][0] <= merged.get(merged.size() - 1)[1]) {
                long[] last = merged.get(merged.size() - 1);
                last[1] = Math.max(last[1], iv[i][1]);
            } else {
                merged.add(new long[] {iv[i][0], iv[i][1]});
            }
        }
        StringBuilder sb = new StringBuilder();
        sb.append(merged.size()).append("\n");
        for (long[] p : merged) sb.append(p[0]).append(" ").append(p[1]).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['After sorting by start, each interval either extends the last merged interval or starts a new one.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) { const iv = rows(input).slice(1).map(nums).sort((p, s) => p[0] - s[0] || p[1] - s[1]); const merged = []; for (const [l, rr] of iv) { if (merged.length && l <= merged[merged.length - 1][1]) merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], rr); else merged.push([l, rr]); } return `${merged.length}\n${merged.map((p) => p.join(' ')).join('\n')}`; },
    tests() { const g = rng(170); const make = (n, span, maxLen) => `${n}\n` + many(n, () => { const l = randInt(g, 0, span); return `${l} ${l + randInt(g, 0, maxLen)}`; }).join('\n') + '\n'; return ['4\n1 3\n8 10\n2 6\n15 18\n', '1\n5 5\n', '2\n1 3\n3 5\n', '2\n1 2\n3 4\n', '3\n1 10\n2 3\n4 5\n', make(10, 30, 5), make(300, 1000, 20), make(20000, 1000000000, 100000), make(20000, 1000000, 100), make(20000, 100000, 100000)]; }
  },

  {
    slug: 'largest-number',
    title: 'Arrange Numbers to Form the Largest',
    difficulty: 'medium',
    tags: ['sorting', 'strings', 'comparator'],
    concept: {
      title: 'A custom order for sorting',
      body: [
        'To glue numbers together into the biggest possible number you cannot sort them as numbers (9 should come before 34) nor as plain strings (`30` before `3` is wrong: `330` beats `303`). The right rule compares two numbers `x` and `y` by the two possible gluings: put `x` first if `x + y` is greater than `y + x` as strings.',
        { code: 'from functools import cmp_to_key\ndef order(x, y):\n    if x + y > y + x: return -1     # x goes first\n    if x + y < y + x: return 1\n    return 0\na.sort(key=cmp_to_key(order))' },
        'This comparison is consistent, so sorting works. If the biggest number starts with `0`, every number was 0 and the answer is just `0`.'
      ]
    },
    statement: ['Given `n` non-negative integers, arrange them in an order so that the number made by writing them one after another is as large as possible. Print that number.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` non-negative integers (without leading zeros).'],
    outputFormat: ['Print the largest number as a string of digits.'],
    constraints: ['1 <= n <= 1000', '0 <= each number <= 10^9'],
    examples: [{ input: '5\n3 30 34 5 9\n', note: 'The order 9 5 34 3 30 gives 9534330.' }],
    hints: ['Treat the numbers as strings.', 'Put `x` before `y` when the text `x + y` is greater than `y + x`.', 'If the result starts with 0, print just 0.'],
    program: {
      io: ['n:int', 'a:word[n]'],
      includes: ['<algorithm>'],
      python: r`
        from functools import cmp_to_key
        a.sort(key=cmp_to_key(lambda x, y: -1 if x + y > y + x else (1 if x + y < y + x else 0)))
        result = "".join(a)
        print("0" if result[0] == "0" else result)`,
      cpp: r`
        sort(a.begin(), a.end(), [](const string& x, const string& y) { return x + y > y + x; });
        string result;
        for (const string& s : a) result += s;
        cout << (result[0] == '0' ? "0" : result) << "\n";`,
      java: r`
        Arrays.sort(a, (x, y) -> (y + x).compareTo(x + y));
        StringBuilder sb = new StringBuilder();
        for (String s : a) sb.append(s);
        System.out.println(sb.charAt(0) == '0' ? "0" : sb.toString());`
    },
    solution: { explanation: ['`x` must come before `y` exactly when `x + y > y + x` as text. Sorting with this rule and joining gives the largest number.'], complexity: 'Time O(n log n * L) for numbers of L digits, space O(n * L).' },
    solve(input) { const a = rows(input)[1].split(' '); a.sort((x, y) => (x + y > y + x ? -1 : x + y < y + x ? 1 : 0)); const res = a.join(''); return res[0] === '0' ? '0' : res; },
    tests() { const g = rng(171); const make = (n, hi) => `${n}\n${many(n, () => randInt(g, 0, hi)).join(' ')}\n`; return ['5\n3 30 34 5 9\n', '1\n0\n', '3\n0 0 0\n', '2\n10 2\n', '3\n121 12 120\n', '4\n824 8247 8 82\n', make(8, 20), make(100, 1000), make(1000, 1000000000), make(1000, 99), make(1000, 3)]; }
  },

  {
    slug: 'maximum-overlap',
    title: 'Busiest Moment',
    difficulty: 'medium',
    tags: ['intervals', 'sorting', 'sweep'],
    concept: {
      title: 'Starts and ends as separate sorted lists',
      body: [
        'To find how many intervals are active at the same time, you do not need to compare all pairs. Sort the **starts** and the **ends** separately. Then sweep through time: every start adds one active interval, every end removes one. The largest number of active intervals seen during the sweep is the answer.',
        { code: 'starts.sort(); ends.sort()\ni = j = cur = best = 0\nwhile i < n:\n    if starts[i] < ends[j]:     # an interval begins before the next one ends\n        cur += 1; i += 1\n        best = max(best, cur)\n    else:\n        cur -= 1; j += 1' },
        'Here an interval `[s, e)` includes `s` but not `e`, so an interval that ends at time 5 does not overlap one that starts at time 5: the end is processed first (`starts[i] < ends[j]` is false when they are equal).'
      ]
    },
    statement: ['There are `n` events. Event `i` starts at time `s` and ends at time `e` (it is active during `[s, e)`: it includes the start but not the end moment). Print the largest number of events that are active at the same moment.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has `s` and `e` with `s < e`.'],
    outputFormat: ['Print one integer.'],
    constraints: ['1 <= n <= 20000', '0 <= s < e <= 10^9'],
    examples: [{ input: '4\n1 4\n2 5\n4 6\n7 8\n', note: 'At time 2 or 3 two events are active. The event ending at 4 does not overlap the one starting at 4.' }],
    hints: ['Sort the start times and the end times separately.', 'Sweep: if the next start is before the next end, one more event is active; otherwise one event ended.', 'When a start and an end are at the same time, process the end first.'],
    program: {
      io: ['n:int', 'ev:int[n][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        starts = sorted(s for s, e in ev)
        ends = sorted(e for s, e in ev)
        i = j = cur = best = 0
        while i < n:
            if starts[i] < ends[j]:
                cur += 1
                i += 1
                best = max(best, cur)
            else:
                cur -= 1
                j += 1
        print(best)`,
      cpp: r`
        vector<long long> starts(n), ends(n);
        for (int k = 0; k < n; k++) {
            starts[k] = ev[k][0];
            ends[k] = ev[k][1];
        }
        sort(starts.begin(), starts.end());
        sort(ends.begin(), ends.end());
        int i = 0, j = 0, cur = 0, best = 0;
        while (i < n) {
            if (starts[i] < ends[j]) {
                cur++;
                i++;
                best = max(best, cur);
            } else {
                cur--;
                j++;
            }
        }
        cout << best << "\n";`,
      java: r`
        long[] starts = new long[(int) n], ends = new long[(int) n];
        for (int k = 0; k < n; k++) {
            starts[k] = ev[k][0];
            ends[k] = ev[k][1];
        }
        Arrays.sort(starts);
        Arrays.sort(ends);
        int i = 0, j = 0, cur = 0, best = 0;
        while (i < n) {
            if (starts[i] < ends[j]) {
                cur++;
                i++;
                best = Math.max(best, cur);
            } else {
                cur--;
                j++;
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Two sorted lists of start and end times are merged like in merge sort. The counter of active events rises at a start and falls at an end; its maximum is the answer.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) { const ev = rows(input).slice(1).map(nums); const times = []; for (const [s, e] of ev) { times.push([s, 1]); times.push([e, -1]); } times.sort((p, q) => p[0] - q[0] || p[1] - q[1]); let cur = 0, best = 0; for (const [, d] of times) { cur += d; best = Math.max(best, cur); } return String(best); },
    tests() { const g = rng(172); const make = (n, span, maxLen) => `${n}\n` + many(n, () => { const s = randInt(g, 0, span); return `${s} ${s + randInt(g, 1, maxLen)}`; }).join('\n') + '\n'; return ['4\n1 4\n2 5\n4 6\n7 8\n', '1\n0 1\n', '2\n1 3\n3 5\n', '3\n1 10\n2 9\n3 8\n', make(10, 20, 6), make(300, 1000, 50), make(20000, 1000000000, 1000000), make(20000, 100000, 30000), make(20000, 1000, 1000)]; }
  }
];
