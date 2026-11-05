import { r, rng, randInt, randBig, many, nums, rows, bigs, shuffle, randArray } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const arrOf = (input) => nums(rows(input)[1]);
const pop = (x) => { let c = 0; while (x > 0) { c += x & 1; x = Math.floor(x / 2); } return c; };
const popBig = (x) => { let c = 0; while (x > 0n) { c += Number(x & 1n); x >>= 1n; } return c; };
const MAXV = 1000000000000000000n;
const LIM = 1 << 30;
const listText = (a) => `${a.length}\n${a.join(' ')}\n`;
// a number below 2^30 with about `ors + 1` random numbers OR-ed together (a high bit density)
const denseNumber = (g, ors) => { let x = randInt(g, 0, LIM - 1); for (let t = 0; t < ors; t++) x |= randInt(g, 0, LIM - 1); return x; };
// a number below 2^30 with a low bit density: the AND of several random numbers
const sparseNumber = (g, ands) => { let x = randInt(g, 0, LIM - 1); for (let t = 0; t < ands; t++) x &= randInt(g, 0, LIM - 1); return x; };

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of values and the number of questions.', 'The second line has `n` numbers.', 'Each of the next `q` lines has two numbers `l` and `r` (1-based, `l <= r`).'],
    constraints: ['1 <= n, q <= 30000', '0 <= each number <= 10^9', '1 <= l <= r <= n'],
    slug: 'xor-of-many-ranges',
    title: 'The XOR of Many Ranges of a List',
    tags: ['bit-manipulation', 'xor', 'prefix-xor', 'queries'],
    concept: {
      title: 'XOR is its own inverse, so a range XOR is the difference of two prefix XORs',
      body: [
        'A list of `n` numbers and `q` questions are given. A question `l r` asks for the **XOR of the numbers at the positions `l` to `r`** (counting from 1). For the list `1 3 4 8` the question `2 3` gives `3 ^ 4 = 7`, and `1 4` gives `1 ^ 3 ^ 4 ^ 8 = 14`. Computing every answer with a loop would cost O(n) per question, up to 9 * 10^8 steps in total.',
        'XOR behaves like addition without carries: it is associative, commutative, and **every number cancels itself**, `x ^ x = 0`. This is the property that makes the prefix trick work. Let `P[i]` be the XOR of the first `i` numbers (`P[0] = 0`). Then `P[r]` is the XOR of the numbers `1..r`, and `P[l-1]` is the XOR of the numbers `1..l-1`. In `P[r] ^ P[l-1]` the numbers `1..l-1` appear twice and cancel, leaving exactly the numbers `l..r`.',
        { code: 'P = [0] * (n + 1)\nfor i in range(n):\n    P[i + 1] = P[i] ^ a[i]            # XOR of the first i + 1 numbers\nfor l, r in queries:\n    print(P[r] ^ P[l - 1])             # the numbers 1..l-1 cancel' },
        'It is the same idea as prefix sums, with `^` instead of `+` and `^` (again!) instead of `-`. The preparation takes O(n) and each question O(1), so the whole job is O(n + q). Prefix XOR is also the key to many harder problems, such as counting subarrays with a given XOR.'
      ]
    },
    statement: ['A list of `n` numbers and `q` questions are given. For each question `l r` print the XOR of the numbers at the positions `l, l + 1, ..., r` (positions are counted from 1).'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '4 3\n1 3 4 8\n2 3\n1 4\n4 4\n', note: '3 ^ 4 = 7, 1 ^ 3 ^ 4 ^ 8 = 14, and 8: 7 14 8.' }],
    hints: ['Define P[i] as the XOR of the first i numbers.', 'x ^ x = 0, so P[r] ^ P[l-1] removes the first l-1 numbers.', 'Each question is then answered in O(1).'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'queries:int[q][2]'],
      fast: true,
      python: r`
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] ^ a[i]
        out = []
        for l, rr in queries:
            out.append(prefix[rr] ^ prefix[l - 1])
        print(*out)`,
      cpp: r`
        vector<long long> prefix(n + 1, 0);
        for (long long i = 0; i < n; i++) prefix[i + 1] = prefix[i] ^ a[i];
        for (long long t = 0; t < q; t++) {
            long long l = queries[t][0], rr = queries[t][1];
            cout << (t ? " " : "") << (prefix[rr] ^ prefix[l - 1]);
        }
        cout << "\n";`,
      java: r`
        long[] prefix = new long[(int) n + 1];
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] ^ a[i];
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            int l = (int) queries[t][0], rr = (int) queries[t][1];
            if (t > 0) out.append(" ");
            out.append(prefix[rr] ^ prefix[l - 1]);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['Prefix XORs P[i] are computed once; since x ^ x = 0, the XOR of the positions l..r is P[r] ^ P[l-1].'], complexity: 'Time O(n + q), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); // a sparse table of XORs over blocks of 2^k elements would also work; here the prefix XOR with a different loop shape
      const p = [0]; a.forEach((x) => p.push(p[p.length - 1] ^ x)); const out = []; for (let t = 0; t < q; t++) { const [l, rr] = nums(rs[2 + t]); out.push(p[rr] ^ p[l - 1]); } return out.join(' ');
    },
    tests() {
      const g = rng(3081); const out = ['4 3\n1 3 4 8\n2 3\n1 4\n4 4\n', '1 1\n0\n1 1\n', '1 2\n1000000000\n1 1\n1 1\n'];
      const make = (n, q, hi) => `${n} ${q}\n${randArray(g, n, 0, hi).join(' ')}\n${many(q, () => { const l = randInt(g, 1, n); return `${l} ${randInt(g, l, n)}`; }).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const res = []; for (let t = 0; t < q; t++) { const [l, rr] = nums(rs[2 + t]); let v = 0; for (let i = l - 1; i < rr; i++) v ^= a[i]; res.push(v); } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 6), 100), (i) => this.solve(i), brute, 600);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000000], [30000, 30000, 1000000000], [30000, 30000, 1000000000], [30000, 30000, 7], [29999, 29999, 1000000000]]) out.push(make(n, q, hi));
      out.push(`30000 30000\n${new Array(30000).fill(1000000000).join(' ')}\n${many(30000, (i) => `1 ${i + 1}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 30000', '0 <= each number < 2^30'],
    slug: 'largest-xor-of-a-pair',
    title: 'The Largest XOR of Two Numbers From the List',
    tags: ['bit-manipulation', 'xor', 'greedy', 'prefixes', 'hashing'],
    concept: {
      title: 'Decide the answer bit by bit from the top: check whether two prefixes can XOR to the candidate',
      body: [
        'From a list of numbers choose two (they may be the same position, which gives 0) so that their **XOR is as large as possible**. For `3 10 5 25 2 8` the answer is 28: `5 ^ 25 = 28`. Trying all pairs costs O(n^2), too slow for 30000 numbers.',
        'Build the answer **from the highest bit down**, greedily: a 1 in a higher bit beats every lower bit together. Suppose we know the best answer for the bits above the bit `b` (it is in `best`). We want to know whether the bit `b` can be set too, i.e. whether the candidate `cand = best | (1 << b)` is reachable. Look only at the **prefixes** of the numbers (their bits from the top down to `b`). The candidate is reachable if there are two prefixes `p` and `q` with `p ^ q = cand`, which is the same as `cand ^ p = q`: for some prefix `p` the number `cand ^ p` is also a prefix in the list.',
        { code: 'best = 0\nmask = 0\nfor bit in range(29, -1, -1):\n    mask |= 1 << bit                         # look at the bits from the top down to `bit`\n    prefixes = {x & mask for x in a}\n    cand = best | (1 << bit)                 # can this bit be 1 in the answer?\n    if any((cand ^ p) in prefixes for p in prefixes):\n        best = cand\nprint(best)' },
        'Each of the 30 rounds costs one pass with a hash set, so the total is O(30 n). Why does the check suffice? If two prefixes XOR to `cand`, then any full numbers with these prefixes XOR to `cand` in the high bits (and something in the lower bits), so the answer is at least `cand`. Another popular solution inserts all numbers into a binary *trie* and, for each number, walks down preferring the opposite bit.'
      ]
    },
    statement: ['A list of `n` numbers is given. Print the largest value of `a[i] ^ a[j]` over all pairs of positions (`i` may equal `j`).'],
    outputFormat: ['Print the largest XOR.'],
    examples: [{ input: '6\n3 10 5 25 2 8\n', note: '5 ^ 25 = 28.' }, { input: '1\n7\n', note: 'Only 7 ^ 7 = 0 is possible: 0.' }],
    hints: ['A set bit at a higher position is worth more than all lower bits together.', 'For each bit from the top, try to set it in the answer.', 'The candidate works if for some prefix p the prefix candidate ^ p is also present.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        best = 0
        mask = 0
        for bit in range(29, -1, -1):
            mask |= 1 << bit
            prefixes = {x & mask for x in a}
            cand = best | (1 << bit)
            for p in prefixes:
                if (cand ^ p) in prefixes:
                    best = cand
                    break
        print(best)`,
      cpp: r`
        long long best = 0, mask = 0;
        for (int bit = 29; bit >= 0; bit--) {
            mask |= 1LL << bit;
            vector<long long> prefixes(n);
            for (long long i = 0; i < n; i++) prefixes[i] = a[i] & mask;
            sort(prefixes.begin(), prefixes.end());
            long long cand = best | (1LL << bit);
            for (long long p : prefixes) {
                if (binary_search(prefixes.begin(), prefixes.end(), cand ^ p)) {
                    best = cand;
                    break;
                }
            }
        }
        cout << best << "\n";`,
      java: r`
        long best = 0, mask = 0;
        int count = (int) n;
        for (int bit = 29; bit >= 0; bit--) {
            mask |= 1L << bit;
            long[] prefixes = new long[count];
            for (int i = 0; i < count; i++) prefixes[i] = a[i] & mask;
            Arrays.sort(prefixes);
            long cand = best | (1L << bit);
            for (int i = 0; i < count; i++) {
                if (Arrays.binarySearch(prefixes, cand ^ prefixes[i]) >= 0) {
                    best = cand;
                    break;
                }
            }
        }
        System.out.println(best);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The answer is built from the top bit down; a bit can be set when two prefixes of the numbers XOR to the candidate, which is checked with a set (or a sorted list) of the prefixes.'], complexity: 'Time O(30 n) with a hash set (O(30 n log n) with sorting), space O(n).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; // a binary trie, every number walks down to the opposite bits when possible
      const c0 = new Int32Array(n * 31 + 2), c1 = new Int32Array(n * 31 + 2); let nodes = 1; for (const x of a) { let v = 0; for (let b = 29; b >= 0; b--) { const bit = (x >> b) & 1; const arr = bit ? c1 : c0; if (!arr[v]) arr[v] = nodes++; v = arr[v]; } } let best = 0; for (const x of a) { let v = 0, cur = 0; for (let b = 29; b >= 0; b--) { const bit = (x >> b) & 1; const want = bit ? c0 : c1, other = bit ? c1 : c0; if (want[v]) { cur |= 1 << b; v = want[v]; } else v = other[v]; } best = Math.max(best, cur); } return String(best);
    },
    tests() {
      const g = rng(3082); const out = ['6\n3 10 5 25 2 8\n', '1\n7\n', '2\n0 0\n', '2\n1073741823 0\n'];
      const make = (n, hi) => `${n}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (input) => { const a = arrOf(input); let best = 0; for (let i = 0; i < a.length; i++) for (let j = i; j < a.length; j++) best = Math.max(best, a[i] ^ a[j]); return String(best); };
      crossCheck(() => make(randInt(g, 1, 9), randInt(g, 1, 4) === 1 ? 7 : 1000), (i) => this.solve(i), brute, 800);
      for (const [n, hi] of [[10, 100], [100, 1000], [1000, 1073741823], [30000, 1073741823], [30000, 1073741823], [30000, 1000], [30000, 1], [29999, 1073741823]]) out.push(make(n, hi));
      out.push(`30000\n${many(30000, (i) => 1073741823 - i).join(' ')}\n`, `30000\n${many(30000, (i) => (1 << (i % 30))).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `k`: the number of values and the target AND.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 30000', '0 <= k, each number < 2^30'],
    slug: 'subarrays-with-and-equal-k',
    title: 'How Many Subarrays Have AND Equal to K?',
    tags: ['bit-manipulation', 'and', 'subarrays', 'distinct-values'],
    concept: {
      title: 'For each right end there are at most 31 different ANDs: keep them with their counts',
      body: [
        'Count the **subarrays** (consecutive parts of the list) whose **bitwise AND equals `k`**. For `3 1 1 3` and `k = 1` the answer is 8: the list has 10 subarrays, and only the two single elements `[3]` have a different AND. Checking all O(n^2) subarrays is too slow for 30000 numbers.',
        'The AND of a subarray can only **lose bits** when the subarray grows. For a fixed right end `i`, the ANDs of the subarrays ending at `i` (taken from the longest to the shortest) form a chain in which each value contains the bits of the previous one, so there are **at most 31 different values** (one for each possible number of bits, from 30 bits down to 0). So for every right end keep a small list of pairs `(value, how many subarrays ending here have this AND)`.',
        { code: 'cur = {}                                  # AND value -> number of subarrays ending at the previous position\ntotal = 0\nfor x in a:\n    nxt = {x: 1}                         # the subarray [x] alone\n    for v, c in cur.items():\n        w = v & x                        # extend every subarray by x\n        nxt[w] = nxt.get(w, 0) + c\n    cur = nxt\n    total += cur.get(k, 0)               # the subarrays ending here whose AND is k\nprint(total)' },
        'Extending by `x` is just `v & x`, and subarrays that now have the same AND are merged by adding their counts. Each element costs O(31), so the total is O(31 n). The answer can be as large as n (n + 1) / 2, about 4.5 * 10^8, which fits in 32 bits but is safer in 64 bits. The same "few distinct values per end" idea works for OR and for GCD.'
      ]
    },
    statement: ['A list of `n` numbers and a number `k` are given. Print how many subarrays (non-empty consecutive parts of the list) have the bitwise AND of all their elements equal to `k`.'],
    outputFormat: ['Print the number of such subarrays.'],
    examples: [{ input: '4 1\n3 1 1 3\n', note: 'The subarrays with AND 1: [1], [1], [3 1], [1 1], [3 1 1], [1 3], [1 1 3], [3 1 1 3]: 8.' }, { input: '3 0\n4 2 1\n', note: 'Subarrays with AND 0: [4 2], [2 1], [4 2 1]: 3.' }],
    hints: ['The AND of a growing subarray only loses bits.', 'For one right end there are at most 31 different AND values.', 'Keep (value, count) pairs and update them with v & x for each new element.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      python: r`
        cur = {}
        total = 0
        for x in a:
            nxt = {x: 1}
            for v, c in cur.items():
                w = v & x
                nxt[w] = nxt.get(w, 0) + c
            cur = nxt
            total += cur.get(k, 0)
        print(total)`,
      cpp: r`
        vector<long long> vals, cnts;
        long long total = 0;
        for (long long x : a) {
            vector<long long> nv, nc;
            for (size_t i = 0; i < vals.size(); i++) {
                long long w = vals[i] & x;
                if (!nv.empty() && nv.back() == w) nc.back() += cnts[i];
                else {
                    nv.push_back(w);
                    nc.push_back(cnts[i]);
                }
            }
            if (!nv.empty() && nv.back() == x) nc.back() += 1;
            else {
                nv.push_back(x);
                nc.push_back(1);
            }
            vals = nv;
            cnts = nc;
            for (size_t i = 0; i < vals.size(); i++) if (vals[i] == k) total += cnts[i];
        }
        cout << total << "\n";`,
      java: r`
        long[] vals = new long[64];
        long[] cnts = new long[64];
        int size = 0;
        long total = 0;
        for (int idx = 0; idx < n; idx++) {
            long x = a[idx];
            long[] nv = new long[64];
            long[] nc = new long[64];
            int ns = 0;
            for (int i = 0; i < size; i++) {
                long w = vals[i] & x;
                if (ns > 0 && nv[ns - 1] == w) nc[ns - 1] += cnts[i];
                else {
                    nv[ns] = w;
                    nc[ns] = cnts[i];
                    ns++;
                }
            }
            if (ns > 0 && nv[ns - 1] == x) nc[ns - 1] += 1;
            else {
                nv[ns] = x;
                nc[ns] = 1;
                ns++;
            }
            vals = nv;
            cnts = nc;
            size = ns;
            for (int i = 0; i < size; i++) if (vals[i] == k) total += cnts[i];
        }
        System.out.println(total);`,
      includes: ['<vector>']
    },
    solution: { explanation: ['For every right end the distinct AND values of the subarrays ending there (at most 31) are kept with their counts; a new element is ANDed into all of them, equal values are merged, and the count of value k is added to the answer.'], complexity: 'Time O(31 n), space O(31).' },
    solve(input) {
      const [n, k] = nums(rows(input)[0]); const a = arrOf(input); const B = 31; // for every left end jump over the stretches in which the AND does not change
      const nxt0 = Array.from({ length: B }, () => new Int32Array(n + 1)); for (let b = 0; b < B; b++) { nxt0[b][n] = n; for (let j = n - 1; j >= 0; j--) nxt0[b][j] = (a[j] >> b) & 1 ? nxt0[b][j + 1] : j; }
      let count = 0; for (let i = 0; i < n; i++) { let cur = a[i], pos = i; for (;;) { let j = n; for (let b = 0; b < B; b++) if ((cur >> b) & 1) j = Math.min(j, nxt0[b][pos + 1]); if (cur === k) count += j - pos; if (j >= n) break; cur &= a[j]; pos = j; if ((cur & k) !== k) break; } } return String(count);
    },
    tests() {
      const g = rng(3083); const out = ['4 1\n3 1 1 3\n', '3 0\n4 2 1\n', '1 5\n5\n', '1 4\n5\n'];
      const make = (n, k, ors) => `${n} ${k}\n${many(n, () => (k | denseNumber(g, ors)) & (LIM - 1)).join(' ')}\n`;
      const plain = (n, k, hi) => `${n} ${k}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (input) => { const [n, k] = nums(rows(input)[0]); const a = arrOf(input); let count = 0; for (let i = 0; i < n; i++) { let v = a[i]; if (v === k) count++; for (let j = i + 1; j < n; j++) { v &= a[j]; if (v === k) count++; } } return String(count); };
      crossCheck(() => (g() < 0.5 ? plain(randInt(g, 1, 9), randInt(g, 0, 7), 7) : make(randInt(g, 1, 9), randInt(g, 0, 3), 1)), (i) => this.solve(i), brute, 800);
      for (const [n, k, ors] of [[10, 3, 1], [100, 5, 2], [1000, 0, 3], [30000, 1, 5], [30000, 1023, 6], [30000, 7, 4], [29999, 0, 8], [30000, 12345, 3]]) out.push(make(n, k, ors));
      out.push(plain(30000, 0, LIM - 1), plain(30000, 0, 3), `30000 5\n${new Array(30000).fill(5).join(' ')}\n`, `30000 0\n${many(30000, (i) => (1 << (i % 30))).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 50000', '0 <= each number <= 10^9'],
    slug: 'longest-run-with-common-bit',
    title: 'The Longest Subarray That Shares a Common Bit',
    tags: ['bit-manipulation', 'and', 'subarrays', 'sliding-window'],
    concept: {
      title: 'A subarray has a non-zero AND exactly when one single bit is set in all of its elements',
      body: [
        'Find the **length of the longest subarray (consecutive part) whose bitwise AND is not zero**. For `5 6 7 1 3` the answer is 3: the subarray `5 6 7` has the AND `4`. Finding the AND of all O(n^2) subarrays is too slow for 50000 numbers.',
        'The AND of some numbers is non-zero **if and only if at least one bit position has a 1 in every one of these numbers**. So the subarray we are looking for is a stretch of elements that all have the same bit set. For one fixed bit `b`, the longest such stretch is the **longest run of consecutive elements that contain the bit `b`**, found with a single pass and a counter. The answer is the best of these runs over all the bits.',
        { code: 'best = 0\nfor bit in range(30):\n    run = 0\n    for x in a:\n        if (x >> bit) & 1:\n            run += 1               # the stretch of elements that all have this bit\n            best = max(best, run)\n        else:\n            run = 0\nprint(best)' },
        'There are 30 bits and one pass for each, so the program works in O(30 n). If every number is 0, no subarray has a non-zero AND and the answer is 0. This is a good example of splitting a bitwise question into independent per-bit questions: the answer for the AND is the best answer over the single bits.'
      ]
    },
    statement: ['A list of `n` numbers is given. Print the length of the longest subarray (non-empty consecutive part) whose bitwise AND is greater than zero, or 0 if there is none.'],
    outputFormat: ['Print the length.'],
    examples: [{ input: '5\n5 6 7 1 3\n', note: 'The subarray 5 6 7 has the AND 4: 3.' }, { input: '3\n0 0 0\n', note: 'No subarray has a non-zero AND: 0.' }],
    hints: ['The AND is non-zero iff some bit is 1 in all the elements.', 'For one bit find the longest run of consecutive elements having it.', 'Take the maximum over the 30 bits.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        best = 0
        for bit in range(30):
            run = 0
            for x in a:
                if (x >> bit) & 1:
                    run += 1
                    if run > best:
                        best = run
                else:
                    run = 0
        print(best)`,
      cpp: r`
        long long best = 0;
        for (int bit = 0; bit < 30; bit++) {
            long long run = 0;
            for (long long x : a) {
                if ((x >> bit) & 1) {
                    run++;
                    best = max(best, run);
                } else {
                    run = 0;
                }
            }
        }
        cout << best << "\n";`,
      java: r`
        long best = 0;
        for (int bit = 0; bit < 30; bit++) {
            long run = 0;
            for (long x : a) {
                if (((x >> bit) & 1) != 0) {
                    run++;
                    best = Math.max(best, run);
                } else {
                    run = 0;
                }
            }
        }
        System.out.println(best);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['A subarray has a non-zero AND exactly when a bit is set in all its elements, so for each of the 30 bits the longest run of elements having that bit is found, and the maximum is printed.'], complexity: 'Time O(30 n), space O(1).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; const cnt = new Array(30).fill(0); let l = 0, best = 0; // a sliding window: shrink while the AND of the window is zero
      for (let r = 0; r < n; r++) { for (let b = 0; b < 30; b++) cnt[b] += (a[r] >> b) & 1; for (;;) { const len = r - l + 1; let nonzero = false; for (let b = 0; b < 30; b++) if (cnt[b] === len) { nonzero = true; break; } if (nonzero || l > r) break; for (let b = 0; b < 30; b++) cnt[b] -= (a[l] >> b) & 1; l++; } best = Math.max(best, r - l + 1); } return String(best);
    },
    tests() {
      const g = rng(3084); const out = ['5\n5 6 7 1 3\n', '3\n0 0 0\n', '1\n1\n', '1\n0\n'];
      const make = (n, ors, sparse) => `${n}\n${many(n, () => (sparse ? sparseNumber(g, ors) : denseNumber(g, ors)) % 1000000001).join(' ')}\n`;
      const brute = (input) => { const a = arrOf(input); let best = 0; for (let i = 0; i < a.length; i++) { let v = a[i]; for (let j = i; j < a.length; j++) { v &= a[j]; if (v === 0) break; best = Math.max(best, j - i + 1); } } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 12); return `${n}\n${randArray(g, n, 0, 15).join(' ')}\n`; }, (i) => this.solve(i), brute, 800);
      for (const [n, ors, sparse] of [[10, 1, false], [100, 1, true], [1000, 2, true], [50000, 1, true], [50000, 3, true], [50000, 2, false], [50000, 0, true], [49999, 6, true]]) out.push(make(n, ors, sparse));
      out.push(`50000\n${new Array(50000).fill(1000000000).join(' ')}\n`, `50000\n${many(50000, (i) => (i % 2 ? 1 : 2)).join(' ')}\n`, `50000\n${many(50000, (i) => (i % 100 === 99 ? 0 : 7)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 20000', '0 <= each number < 2^30'],
    slug: 'distinct-or-values-of-subarrays',
    title: 'How Many Different OR Values Do the Subarrays Have?',
    tags: ['bit-manipulation', 'or', 'subarrays', 'sets'],
    concept: {
      title: 'For each right end there are at most 31 different ORs: extend them one by one and put them in a set',
      body: [
        'Take **every subarray** of the list and compute the **bitwise OR** of its elements. How many **different values** appear among all these ORs? For `1 1 2` the subarrays give `1, 1, 2, 1, 3, 3`, so the distinct values are `1, 2, 3` and the answer is 3. There are n (n + 1) / 2 subarrays, far too many to compute one by one.',
        'The OR of a subarray can only **gain bits** when the subarray grows to the left. For a fixed right end `i`, the ORs of the subarrays that end at `i` (from the shortest to the longest) are a chain in which every value contains the bits of the previous one, so there are **at most 31 different values** per right end (the number of set bits goes from at least 1 to at most 30). Keep that small set `cur`. When the next element `x` arrives, the new set is `{v | x for v in cur}` plus the subarray `[x]` itself.',
        { code: 'seen = set()\ncur = set()\nfor x in a:\n    cur = {v | x for v in cur}      # extend every subarray ending at the previous element\n    cur.add(x)                      # and the subarray [x]\n    seen |= cur                     # all the ORs seen so far\nprint(len(seen))' },
        'Every step costs O(31), so the program is O(31 n) with set operations. The total number of values in `seen` can be close to 31 n (with sparse numbers), so memory matters; the problem limit of 20000 numbers keeps it below about 620000 values. The same method, with `&` instead of `|`, was used for counting subarrays with a given AND.'
      ]
    },
    statement: ['A list of `n` numbers is given. For every non-empty subarray compute the bitwise OR of its elements. Print the number of distinct values among these ORs.'],
    outputFormat: ['Print the number of distinct OR values.'],
    examples: [{ input: '3\n1 1 2\n', note: 'The ORs are 1, 1, 2, 1, 3, 3; the distinct values are 1, 2, 3: 3.' }, { input: '1\n0\n', note: 'Only the value 0: 1.' }],
    hints: ['For a fixed right end the OR values grow as the subarray extends to the left.', 'There are at most 31 distinct values per right end.', 'Keep the set of ORs ending at the previous element, OR each of them with the new element, and add the element itself.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        seen = set()
        cur = set()
        for x in a:
            cur = {v | x for v in cur}
            cur.add(x)
            seen |= cur
        print(len(seen))`,
      cpp: r`
        vector<long long> all, cur;
        for (long long x : a) {
            vector<long long> nxt;
            for (long long v : cur) nxt.push_back(v | x);
            nxt.push_back(x);
            sort(nxt.begin(), nxt.end());
            nxt.erase(unique(nxt.begin(), nxt.end()), nxt.end());
            cur = nxt;
            for (long long v : cur) all.push_back(v);
        }
        sort(all.begin(), all.end());
        all.erase(unique(all.begin(), all.end()), all.end());
        cout << all.size() << "\n";`,
      java: r`
        int count = (int) n;
        long[] all = new long[32 * count + 32];
        int total = 0;
        long[] cur = new long[64];
        int size = 0;
        for (int idx = 0; idx < count; idx++) {
            long x = a[idx];
            long[] nxt = new long[64];
            int ns = 0;
            for (int i = 0; i < size; i++) nxt[ns++] = cur[i] | x;
            nxt[ns++] = x;
            Arrays.sort(nxt, 0, ns);
            int u = 0;
            for (int i = 0; i < ns; i++) {
                if (u == 0 || nxt[u - 1] != nxt[i]) nxt[u++] = nxt[i];
            }
            cur = nxt;
            size = u;
            for (int i = 0; i < size; i++) all[total++] = cur[i];
        }
        Arrays.sort(all, 0, total);
        long distinct = 0;
        for (int i = 0; i < total; i++) {
            if (i == 0 || all[i] != all[i - 1]) distinct++;
        }
        System.out.println(distinct);`,
      includes: ['<algorithm>', '<vector>']
    },
    solution: { explanation: ['For every right end the distinct ORs of the subarrays ending there (at most 31) are kept in a set; the new element is ORed into each of them, the element itself is added, and everything is collected into one global set whose size is printed.'], complexity: 'Time O(31 n) with hashing (O(31 n log n) with sorting), space O(31 n).' },
    solve(input) {
      const a = arrOf(input); const seen = new Set(); let cur = []; for (const x of a) { const s = new Set([x]); for (const v of cur) s.add(v | x); cur = [...s]; for (const v of cur) seen.add(v); } return String(seen.size);
    },
    tests() {
      const g = rng(3085); const out = ['3\n1 1 2\n', '1\n0\n', '3\n1 2 4\n', '4\n0 0 0 0\n'];
      const make = (n, ands) => `${n}\n${many(n, () => sparseNumber(g, ands)).join(' ')}\n`;
      const brute = (input) => { const a = arrOf(input); const seen = new Set(); for (let i = 0; i < a.length; i++) { let v = 0; for (let j = i; j < a.length; j++) { v |= a[j]; seen.add(v); } } return String(seen.size); };
      crossCheck(() => { const n = randInt(g, 1, 12); return `${n}\n${randArray(g, n, 0, 15).join(' ')}\n`; }, (i) => this.solve(i), brute, 800);
      for (const [n, ands] of [[10, 1], [100, 2], [1000, 3], [20000, 4], [20000, 6], [20000, 8], [20000, 0], [19999, 10]]) out.push(make(n, ands));
      out.push(`20000\n${many(20000, (i) => 1 << (i % 30)).join(' ')}\n`, `20000\n${many(20000, (i) => (i % 30 === 0 ? 0 : 1 << (i % 30))).join(' ')}\n`, `20000\n${many(20000, () => 0).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 30000', '0 <= each number <= 10^9'],
    slug: 'sort-by-number-of-ones',
    title: 'Sort the Numbers by Their Count of One-Bits',
    tags: ['bit-manipulation', 'popcount', 'sorting', 'custom-order'],
    concept: {
      title: 'Sort by the pair (number of one-bits, value)',
      body: [
        'The *popcount* of a number is the number of 1-bits in its binary notation: `popcount(13) = 3` since `13 = 1101`. Sort a list of numbers **by popcount, from the smallest popcount to the largest**; numbers with the same popcount go in **increasing order of value**. For `0 1 2 3 4 5 6 7 8` the result is `0 1 2 4 8 3 5 6 7`.',
        'This is a sort with a **compound key**. For every number compute `key = (popcount(x), x)` and sort by the key: Python compares tuples element by element, so `sorted(a, key=lambda x: (popcount(x), x))` does everything. In C++ the same is a comparator that first compares the popcounts (`__builtin_popcountll`) and then the values. In Java, where comparators on boxed numbers are slow, the key can be packed into one `long`: `popcount * 2^30 + x`, because the values are below `2^30`, so sorting the packed longs sorts by popcount first and by value second.',
        { code: 'def ones(x): return bin(x).count("1")\nresult = sorted(a, key=lambda x: (ones(x), x))\nprint(*result)' },
        'The popcount is computed once per number (or once per comparison in a simple comparator), so the total time is O(n log n). Sorting by the count of set bits shows up in problems about "number of 1s" orders; the packed-key trick is a general way to sort by several integer fields with one primitive sort.'
      ]
    },
    statement: ['A list of `n` numbers is given. Sort the numbers by the number of 1-bits in their binary notation (fewer first); numbers with the same count of 1-bits go in increasing order. Print the sorted list.'],
    outputFormat: ['Print the `n` sorted numbers on one line, separated by spaces.'],
    examples: [{ input: '9\n0 1 2 3 4 5 6 7 8\n', note: 'Popcounts 0: 0; 1: 1 2 4 8; 2: 3 5 6; 3: 7.' }],
    hints: ['Use the pair (popcount, value) as the sorting key.', 'The values are below 2^30, so popcount * 2^30 + value is a packed key.', 'In C++ use __builtin_popcountll in the comparator.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        a.sort(key=lambda x: (bin(x).count("1"), x))
        print(*a)`,
      cpp: r`
        sort(a.begin(), a.end(), [](long long x, long long y) {
            int px = __builtin_popcountll(x), py = __builtin_popcountll(y);
            if (px != py) return px < py;
            return x < y;
        });
        for (long long i = 0; i < n; i++) cout << (i ? " " : "") << a[i];
        cout << "\n";`,
      java: r`
        int count = (int) n;
        long[] keys = new long[count];
        for (int i = 0; i < count; i++) keys[i] = ((long) Long.bitCount(a[i]) << 30) + a[i];
        Arrays.sort(keys);
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < count; i++) {
            if (i > 0) out.append(" ");
            out.append(keys[i] & ((1L << 30) - 1));
        }
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Every number gets the key (popcount, value) and the list is sorted by this key; Java packs the key into one long.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const a = arrOf(input); const buckets = Array.from({ length: 31 }, () => []); for (const x of a) buckets[pop(x)].push(x); return buckets.flatMap((b) => b.sort((x, y) => x - y)).join(' '); // by buckets of equal popcount
    },
    tests() {
      const g = rng(3086); const out = ['9\n0 1 2 3 4 5 6 7 8\n', '1\n1000000000\n', '3\n7 7 7\n', '4\n1000000000 0 1 2\n'];
      const make = (n, hi) => `${n}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (input) => { const a = arrOf(input).slice(); a.sort((x, y) => pop(x) - pop(y) || x - y); return a.join(' '); };
      crossCheck(() => make(randInt(g, 1, 12), 40), (i) => this.solve(i), brute, 800);
      for (const [n, hi] of [[10, 100], [100, 1000], [1000, 1000000], [30000, 1000000000], [30000, 1000000000], [30000, 1023], [30000, 15], [29999, 1000000000]]) out.push(make(n, hi));
      out.push(`30000\n${many(30000, (i) => 1000000000 - i).join(' ')}\n`, `30000\n${many(30000, (i) => (1 << (i % 30))).join(' ')}\n`, `30000\n${new Array(30000).fill(0).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `q`: the number of questions.', 'Each of the next `q` lines has two numbers `n` and `k`.'],
    constraints: ['1 <= q <= 25000', '1 <= n <= 60', '1 <= k <= 2^(n-1)'],
    slug: 'kth-symbol-of-the-growing-row',
    title: 'The K-th Symbol of the Growing Row',
    tags: ['bit-manipulation', 'recursion', 'thue-morse', 'math'],
    concept: {
      title: 'The symbol at the position k is the parity of the number of 1-bits in k - 1',
      body: [
        'Build rows of 0s and 1s. The row 1 is `0`. To get the next row, replace every `0` by `01` and every `1` by `10`. The rows are `0`, `01`, `0110`, `01101001`, and so on; the row `n` has `2^(n-1)` symbols. For a question `n k` print the **k-th symbol of the row `n`** (counting from 1). For `n = 4` and `k = 5` the row is `01101001` and the answer is 1. The row `60` has more than 5 * 10^17 symbols, so we cannot build it.',
        'Follow one symbol upwards. The symbol at the position `k` of the row `n` comes from the symbol at the position `ceil(k / 2)` of the row `n - 1`: it is the **first** child (the same symbol) when `k` is odd, and the **second** child (the opposite symbol) when `k` is even. So going from the position `k` up to the first row, we flip the answer every time `k` is even. In the first row the symbol is 0.',
        { code: 'flips = 0\nwhile k > 1:\n    if k % 2 == 0:             # the second child is the opposite of its parent\n        flips ^= 1\n    k = (k + 1) // 2           # the position of the parent in the row above\nprint(flips)' },
        'A closer look gives a formula: the sequence of the symbols is the famous *Thue–Morse sequence*, in which the symbol at the (0-based) position `i` is the **parity of the number of 1-bits of `i`**. So the answer is `popcount(k - 1) % 2` and the row number does not matter at all. For `k = 5`: `k - 1 = 4 = 100`, popcount 1, answer 1. This works in O(1) with a popcount.'
      ]
    },
    statement: ['Rows of symbols are built as follows: the row 1 is `0`; each next row is obtained by replacing every `0` of the previous row by `01` and every `1` by `10`. For each question `n k` print the k-th symbol (counting from 1) of the row `n`.'],
    outputFormat: ['Print `q` symbols on one line, separated by spaces.'],
    examples: [{ input: '4\n1 1\n2 1\n2 2\n4 5\n', note: 'Row 1: 0; row 2: 01; row 4: 01101001, its 5th symbol is 1. The answers are 0 0 1 1.' }],
    hints: ['Write a few rows and look at the pattern.', 'The k-th symbol of a row is the k-th symbol of any longer row (the rows are prefixes of each other).', 'It equals the parity of the number of ones in the binary notation of k - 1.'],
    program: {
      io: ['q:int', 'qs:int[q][2]'],
      fast: true,
      python: r`
        out = []
        for row, k in qs:
            out.append(bin(k - 1).count("1") % 2)
        print(*out)`,
      cpp: r`
        for (long long t = 0; t < q; t++) {
            long long k = qs[t][1];
            cout << (t ? " " : "") << (__builtin_popcountll(k - 1) % 2);
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            long k = qs[t][1];
            if (t > 0) out.append(" ");
            out.append(Long.bitCount(k - 1) % 2);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['The rows are prefixes of one Thue–Morse sequence, in which the symbol at the 0-based position i is the parity of popcount(i); so the answer is popcount(k - 1) mod 2.'], complexity: 'Time O(q), space O(1).' },
    solve(input) {
      const rs = rows(input); const q = Number(rs[0]); return many(q, (i) => { const [row, k0] = rs[1 + i].split(' ').map(BigInt); let k = k0, flips = 0, level = row; while (level > 1n) { if (k % 2n === 0n) flips ^= 1; k = (k + 1n) / 2n; level--; } return flips; }).join(' '); // follow the symbol up the rows
    },
    tests() {
      const g = rng(3087); const out = ['4\n1 1\n2 1\n2 2\n4 5\n', '1\n60 576460752303423488\n', '1\n60 1\n', '1\n1 1\n'];
      const query = (nMax) => { const n = randInt(g, 1, nMax); const k = randBig(g, 1n, 1n << BigInt(n - 1)); return `${n} ${k}`; };
      const make = (q, nMax) => `${q}\n${many(q, () => query(nMax)).join('\n')}\n`;
      const brute = (input) => { const q = Number(rows(input)[0]); return many(q, (i) => { const [n, k] = nums(rows(input)[1 + i]); let row = '0'; for (let t = 1; t < n; t++) row = [...row].map((c) => (c === '0' ? '01' : '10')).join(''); return row[k - 1]; }).join(' '); };
      crossCheck(() => make(randInt(g, 1, 5), 8), (i) => this.solve(i), brute, 600);
      for (const [q, nMax] of [[10, 10], [100, 30], [1000, 60], [25000, 60], [25000, 60], [25000, 20], [24999, 60]]) out.push(make(q, nMax));
      out.push(`25000\n${many(25000, (i) => `60 ${1n + BigInt(i)}`).join('\n')}\n`, `25000\n${many(25000, (i) => `60 ${(1n << 59n) - BigInt(i)}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `m`: the length of the list of XORs (it is even).', 'The second line has `m` numbers: `e[i] = p[i] ^ p[i+1]`.'],
    constraints: ['2 <= m <= 49998 and `m` is even', 'The hidden permutation `p` has `n = m + 1` numbers (odd) and contains each of 1..n exactly once.'],
    slug: 'recover-the-permutation-from-neighbour-xors',
    title: 'Recover the Permutation From the XORs of Neighbours',
    tags: ['bit-manipulation', 'xor', 'permutation', 'math'],
    concept: {
      title: 'The XOR of all numbers is known; the XORs of the pairs at odd positions give everything except the first number',
      body: [
        'A hidden permutation `p` of the numbers `1, 2, ..., n` (where `n` is **odd**) is lost. What remains is the list `e` of the XORs of neighbours: `e[i] = p[i] ^ p[i+1]`, with `n - 1` numbers. The permutation is uniquely determined by `e`. For `e = 3 1` the answer is `1 2 3`: `1 ^ 2 = 3` and `2 ^ 3 = 1`. Knowing the first number `p[0]`, everything follows: `p[i+1] = p[i] ^ e[i]`.',
        'To find the first number use two XORs. First, the XOR of **all** the numbers of a permutation of `1..n` is known without the permutation: `T = 1 ^ 2 ^ ... ^ n`. Second, take `e[1] ^ e[3] ^ e[5] ^ ...` (the elements at odd positions). Since `e[1] = p[1] ^ p[2]`, `e[3] = p[3] ^ p[4]`, ..., and `n - 1` is even, these pairs cover **all the numbers except `p[0]`**: `p[1] ^ p[2] ^ ... ^ p[n-1]`. This is where the oddness of `n` is used.',
        { code: 'n = m + 1\ntotal = 0\nfor v in range(1, n + 1): total ^= v          # XOR of 1..n\nodd = 0\nfor i in range(1, m, 2): odd ^= e[i]          # XOR of p[1] .. p[n-1]\nfirst = total ^ odd                            # everything cancels except p[0]\np = [first]\nfor x in e: p.append(p[-1] ^ x)\nprint(*p)' },
        'Both XORs take O(n) and rebuilding the permutation takes O(n), so the whole solution is linear. It uses three properties of XOR together: it is its own inverse, it is associative and commutative (so the pairs can be regrouped), and a full permutation has a known total.'
      ]
    },
    statement: ['A permutation `p` of the numbers 1, 2, ..., n (n odd) is hidden. You are given the n - 1 numbers `e[i] = p[i] ^ p[i+1]`. Print the permutation `p` (it is unique).'],
    outputFormat: ['Print the `n` numbers of the permutation on one line, separated by spaces.'],
    examples: [{ input: '2\n3 1\n', note: 'The permutation is 1 2 3.' }],
    hints: ['Once p[0] is known, p[i+1] = p[i] ^ e[i].', 'XOR all numbers 1..n to get the total of the permutation.', 'XOR the elements of e at odd positions to get the XOR of all numbers except p[0].'],
    program: {
      io: ['m:int', 'e:int[m]'],
      fast: true,
      python: r`
        n = m + 1
        total = 0
        for v in range(1, n + 1):
            total ^= v
        odd = 0
        for i in range(1, m, 2):
            odd ^= e[i]
        p = [total ^ odd]
        for x in e:
            p.append(p[-1] ^ x)
        print(*p)`,
      cpp: r`
        long long total = 0, odd = 0;
        for (long long v = 1; v <= m + 1; v++) total ^= v;
        for (long long i = 1; i < m; i += 2) odd ^= e[i];
        long long cur = total ^ odd;
        cout << cur;
        for (long long i = 0; i < m; i++) {
            cur ^= e[i];
            cout << " " << cur;
        }
        cout << "\n";`,
      java: r`
        long total = 0, odd = 0;
        for (long v = 1; v <= m + 1; v++) total ^= v;
        for (int i = 1; i < m; i += 2) odd ^= e[i];
        long cur = total ^ odd;
        StringBuilder out = new StringBuilder();
        out.append(cur);
        for (int i = 0; i < m; i++) {
            cur ^= e[i];
            out.append(" ").append(cur);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['The first number is the XOR of 1..n XOR-ed with the XOR of the elements of e at odd positions (which equals the XOR of all numbers except the first); the rest follows from p[i+1] = p[i] ^ e[i].'], complexity: 'Time O(n), space O(1) extra.' },
    solve(input) {
      const e = arrOf(input); const m = e.length; const n = m + 1; // the same formula for the first number
      let total = 0; for (let v = 1; v <= n; v++) total ^= v; let odd = 0; for (let i = 1; i < m; i += 2) odd ^= e[i]; const p = [total ^ odd]; for (const x of e) p.push(p[p.length - 1] ^ x); return p.join(' ');
    },
    tests() {
      const g = rng(3088); const out = ['2\n3 1\n', '2\n2 3\n'];
      const make = (n) => { const perm = shuffle(g, many(n, (i) => i + 1)); const e = perm.slice(0, -1).map((x, i) => x ^ perm[i + 1]); return `${e.length}\n${e.join(' ')}\n`; };
      const brute = (input) => { const e = arrOf(input); const n = e.length + 1; for (let first = 1; first <= n; first++) { const p = [first]; for (const x of e) p.push(p[p.length - 1] ^ x); if (new Set(p).size === n && p.every((v) => v >= 1 && v <= n)) return p.join(' '); } return 'none'; };
      crossCheck(() => make(2 * randInt(g, 1, 6) + 1), (i) => this.solve(i), brute, 800);
      for (const n of [5, 9, 101, 1001, 49999, 49999, 40001, 30001, 49997]) out.push(make(n));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `q`: the number of questions.', 'Each of the next `q` lines has two numbers `a` and `b`.'],
    constraints: ['1 <= q <= 20000', '1 <= a, b <= 10^18'],
    slug: 'closest-number-with-given-bit-count',
    title: 'The Number With the Same Bit Count as B That Is Closest to A in XOR',
    tags: ['bit-manipulation', 'xor', 'greedy', 'popcount'],
    concept: {
      title: 'Keep the highest 1-bits of a first; if more ones are needed, fill the lowest free positions',
      body: [
        'For each question `a b` find a number `x` that has **exactly as many 1-bits as `b`** and makes the value `a ^ x` **as small as possible**. For `a = 3 (011)` and `b = 5 (101)` the number `b` has two 1-bits, and the answer is `x = 3`, since `3 ^ 3 = 0`. For `a = 1` and `b = 12 (1100)` the answer is `x = 3 (011)`: it has two 1-bits and `1 ^ 3 = 2` is the smallest possible.',
        'Let `k = popcount(b)`. The value `a ^ x` has a 1 exactly in the positions where `a` and `x` differ, and the **higher** positions matter more. So we would like `x` to copy `a` in the high positions: where `a` has a 1, put a 1 in `x` (the XOR gets a 0 there), as long as we still have ones to place; where `a` has a 0, leave `x` at 0. So step one: go through `a` from the **highest bit down** and copy up to `k` of its 1-bits into `x`.',
        { code: 'k = bin(b).count("1")\nx = 0\nfor bit in range(61, -1, -1):          # copy the highest 1-bits of a\n    if k > 0 and (a >> bit) & 1:\n        x |= 1 << bit\n        k -= 1\nbit = 0\nwhile k > 0:                            # the ones that are left go into the lowest free positions\n    if not (x >> bit) & 1:\n        x |= 1 << bit\n        k -= 1\n    bit += 1\nprint(x)' },
        'If `a` has fewer 1-bits than `k`, all of them are copied and the remaining ones must go to positions where `a` has a 0, which costs 1 in the XOR for each; to cost as little as possible these should be the **lowest** free positions. If `a` has more 1-bits than `k`, the lowest 1-bits of `a` are not copied. The result is unique and takes O(62) steps per question.'
      ]
    },
    statement: ['For each question `a b` find the number `x` that has exactly as many 1-bits as `b` and minimizes `a XOR x`. Print `x`. The answer is unique.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '2\n3 5\n1 12\n', note: 'For (3, 5) the answer is 3; for (1, 12) it is 3.' }],
    hints: ['Let k be the number of 1-bits of b.', 'To keep a XOR x small, copy the highest 1-bits of a into x first.', 'If ones are left over, put them into the lowest positions that are still 0.'],
    program: {
      io: ['q:int', 'qs:int[q][2]'],
      fast: true,
      python: r`
        out = []
        for a, b in qs:
            k = bin(b).count("1")
            x = 0
            for bit in range(61, -1, -1):
                if k > 0 and (a >> bit) & 1:
                    x |= 1 << bit
                    k -= 1
            bit = 0
            while k > 0:
                if not (x >> bit) & 1:
                    x |= 1 << bit
                    k -= 1
                bit += 1
            out.append(x)
        print(*out)`,
      cpp: r`
        for (long long t = 0; t < q; t++) {
            long long a = qs[t][0], b = qs[t][1];
            int k = __builtin_popcountll(b);
            long long x = 0;
            for (int bit = 61; bit >= 0; bit--) {
                if (k > 0 && ((a >> bit) & 1)) {
                    x |= 1LL << bit;
                    k--;
                }
            }
            for (int bit = 0; k > 0; bit++) {
                if (!((x >> bit) & 1)) {
                    x |= 1LL << bit;
                    k--;
                }
            }
            cout << (t ? " " : "") << x;
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            long a = qs[t][0], b = qs[t][1];
            int k = Long.bitCount(b);
            long x = 0;
            for (int bit = 61; bit >= 0; bit--) {
                if (k > 0 && ((a >> bit) & 1L) != 0) {
                    x |= 1L << bit;
                    k--;
                }
            }
            for (int bit = 0; k > 0; bit++) {
                if (((x >> bit) & 1L) == 0) {
                    x |= 1L << bit;
                    k--;
                }
            }
            if (t > 0) out.append(" ");
            out.append(x);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['With k the bit count of b, the k highest 1-bits of a are copied into x; any remaining ones are placed into the lowest free positions.'], complexity: 'Time O(62 q), space O(1).' },
    solve(input) {
      const q = Number(rows(input)[0]); const rs = rows(input); return many(q, (i) => { const [a, b] = rs[1 + i].split(' ').map(BigInt); const k = popBig(b); // choose the xor value y = a ^ x as small as possible with popcount(a ^ y) = k, bit by bit from the top
        const aBits = a.toString(2).padStart(64, '0'); let ones = 0, y = ''; // y_bit = 0 when possible
        for (let pos = 0; pos < 64; pos++) { const bitsLeft = 63 - pos; const aBit = Number(aBits[pos]); // can y_bit = 0 here? x_bit = aBit then
          const ones0 = ones + aBit; const rem = k - ones0; // the remaining positions can supply 0..bitsLeft more ones (each choice of y flips x)
          if (rem >= 0 && rem <= bitsLeft) { y += '0'; ones = ones0; } else { y += '1'; ones += 1 - aBit; } }
        return a ^ BigInt('0b' + y); }).join(' ');
    },
    tests() {
      const g = rng(3089); const out = ['2\n3 5\n1 12\n', '1\n1000000000000000000 1000000000000000000\n', '1\n1 1\n', '1\n1 1000000000000000000\n'];
      const pair = (mode) => (mode === 'big' ? `${randBig(g, 1n, MAXV)} ${randBig(g, 1n, MAXV)}` : mode === 'mixed' ? `${mixedBigPositive()} ${mixedBigPositive()}` : `${randInt(g, 1, mode)} ${randInt(g, 1, mode)}`);
      const mixedBigPositive = () => { const bits = randInt(g, 1, 59); return randBig(g, 1n, (1n << BigInt(bits)) - 1n); };
      const make = (q, mode) => `${q}\n${many(q, () => pair(mode)).join('\n')}\n`;
      const brute = (input) => { const q = Number(rows(input)[0]); return many(q, (i) => { const [a, b] = nums(rows(input)[1 + i]); const k = pop(b); let best = -1, bestXor = Infinity; for (let x = 0; x < 4096; x++) { if (pop(x) !== k) continue; if ((a ^ x) < bestXor) { bestXor = a ^ x; best = x; } } return best; }).join(' '); };
      crossCheck(() => make(randInt(g, 1, 5), 600), (i) => this.solve(i), brute, 600);
      for (const [q, mode] of [[10, 'big'], [100, 'mixed'], [1000, 'big'], [20000, 'big'], [20000, 'mixed'], [20000, 255], [19999, 'big']]) out.push(make(q, mode));
      out.push(`20000\n${many(20000, (i) => `${1n + BigInt(i)} ${(1n << 59n) - BigInt(i)}`).join('\n')}\n`);
      return out;
    }
  }
];
