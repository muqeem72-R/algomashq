import { r, rng, randInt, randBig, many, nums, rows, bigs, shuffle, randArray } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const arrOf = (input) => nums(rows(input)[1]);
const MAXV = 1000000000000000000n;
const LIM = 1 << 30;
const MOD = 1000000007n;
const popBig = (x) => { let c = 0; while (x > 0n) { c += Number(x & 1n); x >>= 1n; } return c; };
const pop = (x) => { let c = 0; while (x > 0) { c += x & 1; x >>= 1; } return c; };
const sparseNumber = (g, ands) => { let x = randInt(g, 0, LIM - 1); for (let t = 0; t < ands; t++) x &= randInt(g, 0, LIM - 1); return x; };

export default [
  {
    ...hard,
    inputFormat: ['The first line has `n` and `L`: the number of values and the smallest allowed length.', 'The second line has `n` numbers.'],
    constraints: ['1 <= L <= n <= 30000', '0 <= each number < 2^30'],
    slug: 'largest-xor-of-a-long-subarray',
    title: 'The Largest XOR of a Subarray With At Least L Elements',
    tags: ['bit-manipulation', 'xor', 'trie', 'prefix-xor'],
    concept: {
      title: 'The XOR of a subarray is the XOR of two prefix values: insert the allowed prefixes into a binary trie and ask for the best partner',
      body: [
        'Among all subarrays with **at least `L` elements**, find the largest XOR of their elements. For `8 1 2 12 7` and `L = 2` the answer is 15: the subarray `1 2 12` has the XOR `1 ^ 2 ^ 12 = 15`. The brute force over all O(n^2) subarrays is too slow for 30000 numbers.',
        'Let `P[i]` be the XOR of the first `i` numbers (`P[0] = 0`). The XOR of the subarray from `j + 1` to `i` is `P[i] ^ P[j]`, and the length is `i - j`. So we want the largest `P[i] ^ P[j]` over pairs with `i - j >= L`. For every `i`, the partners `j` are the prefixes with index `0 .. i - L`, a set that only **grows** when `i` grows: insert `P[i - L]` before handling `i`.',
        { code: 'P = prefix XORs, P[0] = 0\nbest = 0\nfor i in range(L, n + 1):\n    insert(P[i - L])              # the prefix P[i - L] becomes an allowed partner\n    best = max(best, query(P[i])) # the largest P[i] ^ P[j] over the allowed partners j' },
        'The structure that finds the partner maximising the XOR with a given number is a **binary trie** of 30 levels: `insert(x)` follows the bits of `x` from the top and creates the missing nodes; `query(y)` walks down and, at each level, prefers the child with the **opposite** bit (it puts a 1 in the result); if that child does not exist it takes the other one. Each operation costs 30 steps, so the whole program is O(30 n). The trie has at most `30 (n + 1) + 1` nodes.'
      ]
    },
    statement: ['A list of `n` numbers and a number `L` are given. Among all subarrays (consecutive parts) with at least `L` elements find the largest XOR of the elements, and print it.'],
    outputFormat: ['Print the largest XOR.'],
    examples: [{ input: '5 2\n8 1 2 12 7\n', note: 'The subarray 1 2 12 has the XOR 15, the largest among the subarrays with at least 2 elements.' }, { input: '1 1\n5\n', note: 'Only the single element: 5.' }],
    hints: ['Use prefix XORs: the XOR of a subarray is P[i] ^ P[j].', 'For position i the allowed partners are P[0], ..., P[i - L].', 'Keep the allowed prefixes in a binary trie and walk it preferring opposite bits.'],
    program: {
      io: ['n:int L:int', 'a:int[n]'],
      fast: true,
      helpers: {
        python: r`
          c0 = [0]
          c1 = [0]

          def insert(x):
              v = 0
              for b in range(29, -1, -1):
                  if (x >> b) & 1:
                      if not c1[v]:
                          c0.append(0)
                          c1.append(0)
                          c1[v] = len(c1) - 1
                      v = c1[v]
                  else:
                      if not c0[v]:
                          c0.append(0)
                          c1.append(0)
                          c0[v] = len(c0) - 1
                      v = c0[v]

          def query(y):
              v = 0
              res = 0
              for b in range(29, -1, -1):
                  if (y >> b) & 1:
                      want, other = c0[v], c1[v]
                  else:
                      want, other = c1[v], c0[v]
                  if want:
                      res |= 1 << b
                      v = want
                  else:
                      v = other
              return res`,
        cpp: r`
          vector<int> c0(1, 0), c1(1, 0);

          void insertValue(long long x) {
              int v = 0;
              for (int b = 29; b >= 0; b--) {
                  vector<int>& next = ((x >> b) & 1) ? c1 : c0;
                  if (!next[v]) {
                      c0.push_back(0);
                      c1.push_back(0);
                      next[v] = (int)c0.size() - 1;
                  }
                  v = next[v];
              }
          }

          long long queryValue(long long y) {
              int v = 0;
              long long res = 0;
              for (int b = 29; b >= 0; b--) {
                  int want, other;
                  if ((y >> b) & 1) {
                      want = c0[v];
                      other = c1[v];
                  } else {
                      want = c1[v];
                      other = c0[v];
                  }
                  if (want) {
                      res |= 1LL << b;
                      v = want;
                  } else {
                      v = other;
                  }
              }
              return res;
          }`,
        java: r`
          static int[] c0, c1;
          static int nodes;

          static void insertValue(long x) {
              int v = 0;
              for (int b = 29; b >= 0; b--) {
                  if (((x >> b) & 1L) != 0) {
                      if (c1[v] == 0) c1[v] = ++nodes;
                      v = c1[v];
                  } else {
                      if (c0[v] == 0) c0[v] = ++nodes;
                      v = c0[v];
                  }
              }
          }

          static long queryValue(long y) {
              int v = 0;
              long res = 0;
              for (int b = 29; b >= 0; b--) {
                  int want, other;
                  if (((y >> b) & 1L) != 0) {
                      want = c0[v];
                      other = c1[v];
                  } else {
                      want = c1[v];
                      other = c0[v];
                  }
                  if (want != 0) {
                      res |= 1L << b;
                      v = want;
                  } else {
                      v = other;
                  }
              }
              return res;
          }`
      },
      python: r`
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] ^ a[i]
        best = 0
        for i in range(L, n + 1):
            insert(prefix[i - L])
            q = query(prefix[i])
            if q > best:
                best = q
        print(best)`,
      cpp: r`
        vector<long long> prefix(n + 1, 0);
        for (long long i = 0; i < n; i++) prefix[i + 1] = prefix[i] ^ a[i];
        long long best = 0;
        for (long long i = L; i <= n; i++) {
            insertValue(prefix[i - L]);
            best = max(best, queryValue(prefix[i]));
        }
        cout << best << "\n";`,
      java: r`
        int cn = (int) n, cl = (int) L;
        long[] prefix = new long[cn + 1];
        for (int i = 0; i < cn; i++) prefix[i + 1] = prefix[i] ^ a[i];
        c0 = new int[30 * (cn + 1) + 5];
        c1 = new int[30 * (cn + 1) + 5];
        nodes = 0;
        long best = 0;
        for (int i = cl; i <= cn; i++) {
            insertValue(prefix[i - cl]);
            best = Math.max(best, queryValue(prefix[i]));
        }
        System.out.println(best);`,
      includes: ['<algorithm>', '<vector>']
    },
    solution: { explanation: ['With prefix XORs P the XOR of a subarray is P[i] ^ P[j]; the allowed partners P[0..i-L] are inserted into a binary trie one by one, and for every i the trie gives the partner that maximises the XOR.'], complexity: 'Time O(30 n), space O(30 n).' },
    solve(input) {
      const [n, L] = nums(rows(input)[0]); const a = arrOf(input); const P = new Int32Array(n + 1); for (let i = 0; i < n; i++) P[i + 1] = P[i] ^ a[i];
      const c0 = new Int32Array(30 * (n + 1) + 5), c1 = new Int32Array(30 * (n + 1) + 5); let nodes = 0; let best = 0; for (let i = L; i <= n; i++) { let v = 0; const x = P[i - L]; for (let b = 29; b >= 0; b--) { const arr = (x >> b) & 1 ? c1 : c0; if (!arr[v]) arr[v] = ++nodes; v = arr[v]; } let u = 0, res = 0; const y = P[i]; for (let b = 29; b >= 0; b--) { const bit = (y >> b) & 1; const want = bit ? c0 : c1, other = bit ? c1 : c0; if (want[u]) { res |= 1 << b; u = want[u]; } else u = other[u]; } best = Math.max(best, res); } return String(best);
    },
    tests() {
      const g = rng(3111); const out = ['5 2\n8 1 2 12 7\n', '1 1\n5\n', '3 3\n1 2 4\n', '3 1\n1 2 4\n'];
      const make = (n, L, hi) => `${n} ${L}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (input) => { const [n, L] = nums(rows(input)[0]); const a = arrOf(input); let best = 0; for (let i = 0; i < n; i++) { let v = 0; for (let j = i; j < n; j++) { v ^= a[j]; if (j - i + 1 >= L) best = Math.max(best, v); } } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 12); return make(n, randInt(g, 1, n), 40); }, (i) => this.solve(i), brute, 800);
      crossCheck(() => { const n = randInt(g, 50, 300); return make(n, randInt(g, 1, n), LIM - 1); }, (i) => this.solve(i), brute, 60);
      for (const [n, L, hi] of [[10, 3, 100], [100, 20, 1000], [1000, 500, LIM - 1], [30000, 1, LIM - 1], [30000, 15000, LIM - 1], [30000, 29999, LIM - 1], [30000, 30000, LIM - 1], [30000, 100, 3], [29999, 1000, LIM - 1]]) out.push(make(n, L, hi));
      out.push(`30000 5000\n${many(30000, (i) => LIM - 1 - (i % 1000)).join(' ')}\n`, `30000 10\n${many(30000, (i) => sparseNumber(g, 3)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`, `lo` and `hi`.', 'The second line has `n` numbers.'],
    constraints: ['2 <= n <= 20000', '0 <= each number < 2^30', '0 <= lo <= hi < 2^30'],
    slug: 'pairs-with-xor-in-a-range',
    title: 'Count the Pairs Whose XOR Lies in a Range',
    tags: ['bit-manipulation', 'xor', 'trie', 'counting'],
    concept: {
      title: 'Count the pairs with XOR below a limit x with a counting trie, then subtract: count(hi + 1) - count(lo)',
      body: [
        'Given `n` numbers, count the pairs of positions `i < j` for which `lo <= a[i] ^ a[j] <= hi`. For `1 4 2 7` with `lo = 2` and `hi = 6` the answer is 6: all six pairs have XORs 5, 3, 6, 6, 3, 5. Checking every pair costs O(n^2) = 2 * 10^8 steps here.',
        'A range query is a difference of two prefix queries: the number of pairs with XOR in `[lo, hi]` is `F(hi + 1) - F(lo)`, where `F(x)` is the number of pairs with XOR **strictly less than `x`**. To compute `F` insert the numbers into a **binary trie** where every node also stores `cnt`, the number of inserted numbers that pass through it. For a new number `a` count the earlier numbers `y` with `a ^ y < x` by walking down from the top bit: at each bit compare the bit `xb` of `x` with the choice of the XOR bit. If `xb = 1`, then every number that continues with the XOR bit **0** (the child with the same bit as `a`) is already smaller than `x` in this position, so add its `cnt`; and the walk continues into the child that gives the XOR bit **1**. If `xb = 0` the XOR bit must be 0, and the walk goes into the child with the same bit as `a`.',
        { code: 'def less(a, x):                       # the inserted y with a ^ y < x\n    v = 0; res = 0\n    for b in range(30, -1, -1):\n        abit, xbit = (a >> b) & 1, (x >> b) & 1\n        same = child(v, abit)             # XOR bit 0\n        diff = child(v, abit ^ 1)         # XOR bit 1\n        if xbit:\n            res += cnt[same]              # all of them are smaller than x\n            v = diff\n        else:\n            v = same\n        if not v: break\n    return res\n\nfor a in arr:\n    total += less(a, hi + 1) - less(a, lo)\n    insert(a)                              # now a can be a partner of the later numbers' },
        'The numbers are processed in order and each is inserted **after** it is queried, so every pair is counted once. We use 31 levels because `hi + 1` can be `2^30`. The time is O(31 n) per query type (two queries and one insert per number), and the answer is at most about 2 * 10^8.'
      ]
    },
    statement: ['A list of `n` numbers and two bounds `lo` and `hi` are given. Count the pairs of positions `i < j` such that `lo <= a[i] XOR a[j] <= hi`, and print the count.'],
    outputFormat: ['Print the number of pairs.'],
    examples: [{ input: '4 2 6\n1 4 2 7\n', note: 'The XORs of the six pairs are 5, 3, 6, 6, 3, 5: all lie in 2..6, so the answer is 6.' }, { input: '3 1 1\n5 5 5\n', note: 'All XORs are 0: 0 pairs.' }],
    hints: ['The answer is F(hi + 1) - F(lo), where F(x) counts pairs with XOR < x.', 'Store the number of passing values in every trie node.', 'Walk down the trie by the bits of x and a; when the bit of x is 1, add the whole subtree of the child that gives XOR bit 0.'],
    program: {
      io: ['n:int lo:int hi:int', 'a:int[n]'],
      fast: true,
      helpers: {
        python: r`
          c0 = [0]
          c1 = [0]
          cnt = [0]

          def insert(x):
              v = 0
              for b in range(30, -1, -1):
                  if (x >> b) & 1:
                      if not c1[v]:
                          c0.append(0)
                          c1.append(0)
                          cnt.append(0)
                          c1[v] = len(c1) - 1
                      v = c1[v]
                  else:
                      if not c0[v]:
                          c0.append(0)
                          c1.append(0)
                          cnt.append(0)
                          c0[v] = len(c0) - 1
                      v = c0[v]
                  cnt[v] += 1

          def less(a, x):
              v = 0
              res = 0
              for b in range(30, -1, -1):
                  if (a >> b) & 1:
                      same, diff = c1[v], c0[v]
                  else:
                      same, diff = c0[v], c1[v]
                  if (x >> b) & 1:
                      if same:
                          res += cnt[same]
                      v = diff
                  else:
                      v = same
                  if not v:
                      break
              return res`,
        cpp: r`
          vector<int> c0(1, 0), c1(1, 0), cnt(1, 0);

          void insertValue(long long x) {
              int v = 0;
              for (int b = 30; b >= 0; b--) {
                  vector<int>& next = ((x >> b) & 1) ? c1 : c0;
                  if (!next[v]) {
                      c0.push_back(0);
                      c1.push_back(0);
                      cnt.push_back(0);
                      next[v] = (int)c0.size() - 1;
                  }
                  v = next[v];
                  cnt[v]++;
              }
          }

          long long lessCount(long long a, long long x) {
              int v = 0;
              long long res = 0;
              for (int b = 30; b >= 0; b--) {
                  int same, diff;
                  if ((a >> b) & 1) {
                      same = c1[v];
                      diff = c0[v];
                  } else {
                      same = c0[v];
                      diff = c1[v];
                  }
                  if ((x >> b) & 1) {
                      if (same) res += cnt[same];
                      v = diff;
                  } else {
                      v = same;
                  }
                  if (!v) break;
              }
              return res;
          }`,
        java: r`
          static int[] c0, c1, cnt;
          static int nodes;

          static void insertValue(long x) {
              int v = 0;
              for (int b = 30; b >= 0; b--) {
                  if (((x >> b) & 1L) != 0) {
                      if (c1[v] == 0) c1[v] = ++nodes;
                      v = c1[v];
                  } else {
                      if (c0[v] == 0) c0[v] = ++nodes;
                      v = c0[v];
                  }
                  cnt[v]++;
              }
          }

          static long lessCount(long a, long x) {
              int v = 0;
              long res = 0;
              for (int b = 30; b >= 0; b--) {
                  int same, diff;
                  if (((a >> b) & 1L) != 0) {
                      same = c1[v];
                      diff = c0[v];
                  } else {
                      same = c0[v];
                      diff = c1[v];
                  }
                  if (((x >> b) & 1L) != 0) {
                      if (same != 0) res += cnt[same];
                      v = diff;
                  } else {
                      v = same;
                  }
                  if (v == 0) break;
              }
              return res;
          }`
      },
      python: r`
        total = 0
        for x in a:
            total += less(x, hi + 1) - less(x, lo)
            insert(x)
        print(total)`,
      cpp: r`
        long long total = 0;
        for (long long x : a) {
            total += lessCount(x, hi + 1) - lessCount(x, lo);
            insertValue(x);
        }
        cout << total << "\n";`,
      java: r`
        int cn = (int) n;
        c0 = new int[31 * (cn + 1) + 5];
        c1 = new int[31 * (cn + 1) + 5];
        cnt = new int[31 * (cn + 1) + 5];
        nodes = 0;
        long total = 0;
        for (int i = 0; i < cn; i++) {
            total += lessCount(a[i], hi + 1) - lessCount(a[i], lo);
            insertValue(a[i]);
        }
        System.out.println(total);`,
      includes: ['<vector>']
    },
    solution: { explanation: ['A counting binary trie stores the earlier numbers; for each new number the pairs with XOR below hi + 1 and below lo are counted by walking down the trie, and their difference is added to the answer before the number is inserted.'], complexity: 'Time O(31 n), space O(31 n).' },
    solve(input) {
      const [n, lo, hi] = nums(rows(input)[0]); const a = arrOf(input); const size = 31 * (n + 1) + 5; const c0 = new Int32Array(size), c1 = new Int32Array(size), cnt = new Int32Array(size); let nodes = 0; let total = 0; // the same counting trie, typed arrays
      const less = (v0, x) => { let v = 0, res = 0; for (let b = 30; b >= 0; b--) { const abit = (v0 >> b) & 1, xbit = (x >> b) & 1; const same = abit ? c1[v] : c0[v], diff = abit ? c0[v] : c1[v]; if (xbit) { if (same) res += cnt[same]; v = diff; } else v = same; if (!v) break; } return res; };
      for (const x of a) { total += less(x, hi + 1) - less(x, lo); let v = 0; for (let b = 30; b >= 0; b--) { const arr = (x >> b) & 1 ? c1 : c0; if (!arr[v]) arr[v] = ++nodes; v = arr[v]; cnt[v]++; } } return String(total);
    },
    tests() {
      const g = rng(3112); const out = ['4 2 6\n1 4 2 7\n', '3 1 1\n5 5 5\n', '2 0 0\n3 3\n', '2 0 1073741823\n0 1073741823\n'];
      const make = (n, hi, lo, up) => `${n} ${lo} ${up}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (input) => { const [n, lo, hi] = nums(rows(input)[0]); const a = arrOf(input); let count = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const x = a[i] ^ a[j]; if (x >= lo && x <= hi) count++; } return String(count); };
      crossCheck(() => { const n = randInt(g, 2, 12); const lo = randInt(g, 0, 20); return make(n, 31, lo, randInt(g, lo, 40)); }, (i) => this.solve(i), brute, 800);
      crossCheck(() => { const n = randInt(g, 100, 500); const lo = randInt(g, 0, LIM - 1); return make(n, LIM - 1, lo, randInt(g, lo, LIM - 1)); }, (i) => this.solve(i), brute, 30);
      for (const [n, hi, lo, up] of [[10, 100, 10, 80], [100, 1000, 100, 700], [1000, LIM - 1, 0, LIM - 1], [20000, LIM - 1, 1000, 500000000], [20000, LIM - 1, 0, 100000000], [20000, 255, 3, 200], [20000, 3, 1, 2], [19999, LIM - 1, 500000000, LIM - 1], [20000, LIM - 1, LIM - 1, LIM - 1]]) out.push(make(n, hi, lo, up));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 1000', '0 <= each number < 2^16'],
    slug: 'triples-with-zero-and',
    title: 'Count the Triples Whose AND Is Zero',
    tags: ['bit-manipulation', 'sos-dp', 'submasks', 'counting'],
    concept: {
      title: 'Count the ANDs of all pairs first, then ask how many numbers fit inside the complement of each pair-AND',
      body: [
        'Count the **ordered triples** of positions `(i, j, k)` (the positions may repeat) such that `a[i] & a[j] & a[k] == 0`. For the list `2 1 3` the answer is 12. Trying all `n^3` triples is 10^9 steps for `n = 1000`. The numbers are small (below `2^16 = 65536`), and this will be used.',
        'Split the triple into a pair and a single number. Let `pairs[x]` be the number of ordered pairs `(i, j)` with `a[i] & a[j] = x`: there are `n^2 = 10^6` pairs, so this takes a million steps. For a given `x`, the number `a[k]` works if `x & a[k] == 0`, that is, if every bit of `a[k]` is **outside** `x`: `a[k]` is a **submask of the complement** `~x` (within 16 bits). So we need `f[m]`, the number of values `a[k]` that are submasks of `m`, for every mask `m`. The answer is the sum of `pairs[x] * f[~x]` over all `x`.',
        { code: 'FULL = (1 << 16) - 1\nf = [0] * (1 << 16)\nfor v in a: f[v] += 1\nfor b in range(16):                       # sum over submasks (SOS DP)\n    for m in range(1 << 16):\n        if (m >> b) & 1:\n            f[m] += f[m ^ (1 << b)]\npairs = [0] * (1 << 16)\nfor x in a:\n    for y in a: pairs[x & y] += 1\nanswer = sum(pairs[x] * f[FULL ^ x] for x in range(1 << 16))' },
        'The table `f` is built by the **sum-over-subsets** transform: process the bits one by one, and for every mask that has the bit add the value of the mask without the bit. After all 16 bits, `f[m]` holds the number of values that are submasks of `m`. The cost is `16 * 65536` steps. Together with the million pairs the program runs in about 2 * 10^6 steps instead of 10^9; the answer is at most `n^3 = 10^9`.'
      ]
    },
    statement: ['A list of `n` numbers (all below 65536) is given. Count the ordered triples of positions `(i, j, k)`, where the positions need not be different, for which `a[i] & a[j] & a[k] = 0`.'],
    outputFormat: ['Print the number of triples.'],
    examples: [{ input: '3\n2 1 3\n', note: 'The triples (in any order of positions) with AND 0 number 12.' }],
    hints: ['Count first how many ordered pairs have each possible AND value.', 'A number fits with the pair AND x when it is a submask of the complement of x.', 'Compute "number of values that are submasks of m" for all m with the sum-over-subsets transform.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        size = 1 << 16
        full = size - 1
        f = [0] * size
        for v in a:
            f[v] += 1
        for b in range(16):
            bit = 1 << b
            for m in range(size):
                if m & bit:
                    f[m] += f[m ^ bit]
        pairs = [0] * size
        for x in a:
            for y in a:
                pairs[x & y] += 1
        total = 0
        for x in range(size):
            if pairs[x]:
                total += pairs[x] * f[full ^ x]
        print(total)`,
      cpp: r`
        const int SIZE = 1 << 16, FULL = SIZE - 1;
        vector<long long> f(SIZE, 0), pairs(SIZE, 0);
        for (long long v : a) f[v]++;
        for (int b = 0; b < 16; b++) {
            for (int m = 0; m < SIZE; m++) {
                if (m & (1 << b)) f[m] += f[m ^ (1 << b)];
            }
        }
        for (long long x : a) {
            for (long long y : a) pairs[x & y]++;
        }
        long long total = 0;
        for (int x = 0; x < SIZE; x++) total += pairs[x] * f[FULL ^ x];
        cout << total << "\n";`,
      java: r`
        int size = 1 << 16, full = size - 1;
        long[] f = new long[size];
        long[] pairs = new long[size];
        for (long v : a) f[(int) v]++;
        for (int b = 0; b < 16; b++) {
            for (int m = 0; m < size; m++) {
                if ((m & (1 << b)) != 0) f[m] += f[m ^ (1 << b)];
            }
        }
        for (long x : a) {
            for (long y : a) pairs[(int) (x & y)]++;
        }
        long total = 0;
        for (int x = 0; x < size; x++) total += pairs[x] * f[full ^ x];
        System.out.println(total);`
    },
    solution: { explanation: ['The numbers of ordered pairs with each AND value are counted; a sum-over-subsets transform gives, for every mask, how many numbers are its submasks; the answer sums pairs[x] times the count of numbers inside the complement of x.'], complexity: 'Time O(n^2 + 16 * 2^16), space O(2^16).' },
    solve(input) {
      const a = arrOf(input); const size = 1 << 16; const f = new Array(size).fill(0); for (const v of a) f[v]++; for (let b = 0; b < 16; b++) for (let m = 0; m < size; m++) if (m & (1 << b)) f[m] += f[m ^ (1 << b)]; const pairs = new Array(size).fill(0); for (const x of a) for (const y of a) pairs[x & y]++; let total = 0; for (let x = 0; x < size; x++) if (pairs[x]) total += pairs[x] * f[(size - 1) ^ x]; return String(total);
    },
    tests() {
      const g = rng(3113); const out = ['3\n2 1 3\n', '1\n0\n', '1\n1\n', '2\n65535 65535\n', '3\n1 2 4\n'];
      const make = (n, hi) => `${n}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (input) => { const a = arrOf(input); let count = 0; for (const x of a) for (const y of a) for (const z of a) if ((x & y & z) === 0) count++; return String(count); };
      crossCheck(() => make(randInt(g, 1, 9), randInt(g, 0, 1) ? 15 : 65535), (i) => this.solve(i), brute, 600);
      crossCheck(() => make(randInt(g, 20, 60), randInt(g, 3, 65535)), (i) => this.solve(i), brute, 60);
      for (const [n, hi] of [[10, 100], [100, 65535], [1000, 65535], [1000, 255], [1000, 3], [1000, 65535], [999, 4095], [1000, 1]]) out.push(make(n, hi));
      out.push(`1000\n${many(1000, (i) => 65535 - (1 << (i % 16))).join(' ')}\n`, `1000\n${many(1000, () => 65535).join(' ')}\n`, `1000\n${many(1000, (i) => (i % 2 ? 43690 : 21845)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the length of both lists.', 'The second line has `n` numbers: the list `a`.', 'The third line has `n` numbers: the list `b`.'],
    constraints: ['1 <= n <= 16', '0 <= each number < 2^30'],
    slug: 'smallest-xor-sum-of-a-pairing',
    title: 'The Smallest XOR Sum of a Pairing',
    tags: ['bit-manipulation', 'bitmask-dp', 'assignment'],
    concept: {
      title: 'A bitmask records which elements of b are already used; the number of used elements tells which element of a is next',
      body: [
        'Two lists `a` and `b` of the same length `n` are given. Pair every `a[i]` with a **different** element of `b` (reorder `b` freely) and compute the sum of the XORs of the pairs. What is the **smallest** possible sum? For `a = 1 2` and `b = 2 3` the answer is 2: pair `1` with `3` (XOR 2) and `2` with `2` (XOR 0). Trying all `n!` orders is impossible even for `n = 16` (2 * 10^13).',
        'There are only `2^n` subsets of `b`, so use dynamic programming over the subsets. Assign the elements of `a` **in order**: `a[0]` first, then `a[1]`, and so on. Let `dp[mask]` be the smallest cost of pairing the first `popcount(mask)` elements of `a` with exactly the elements of `b` in the set `mask`. The next element to assign is `a[popcount(mask)]`, and it may be paired with any `b[j]` that is not in the mask: `dp[mask | (1 << j)] = min(dp[mask] + (a[i] ^ b[j]))`, where `i = popcount(mask)`.',
        { code: 'INF = 1 << 60\ndp = [INF] * (1 << n)\ndp[0] = 0\nfor mask in range(1 << n):\n    i = bin(mask).count("1")                 # the next element of a to place\n    if i == n or dp[mask] == INF: continue\n    for j in range(n):\n        if not (mask >> j) & 1:\n            cost = dp[mask] + (a[i] ^ b[j])\n            if cost < dp[mask | (1 << j)]:\n                dp[mask | (1 << j)] = cost\nprint(dp[(1 << n) - 1])' },
        'The table has `2^n` entries and each is extended in `n` ways, so the work is `n * 2^n = 10^6` for `n = 16`. The answer is `dp` of the full mask. Fixing the order of `a` removes the factor `n!` and keeps the optimal substructure: the cost of the remaining pairs depends only on which elements of `b` are still free.'
      ]
    },
    statement: ['Two lists `a` and `b`, both of length `n`, are given. Pair each element of `a` with a different element of `b` (a perfect matching). Print the smallest possible sum of `a[i] XOR b[j]` over the pairs.'],
    outputFormat: ['Print the smallest sum.'],
    examples: [{ input: '2\n1 2\n2 3\n', note: 'Pairs (1,3) and (2,2): 2 + 0 = 2.' }, { input: '3\n1 0 3\n5 3 4\n', note: 'The best pairing has the XOR sum 8.' }],
    hints: ['Assign the elements of a one by one in order.', 'dp[mask] is the cost when the elements of b in mask have been used.', 'The next element of a has the index popcount(mask).'],
    program: {
      io: ['n:int', 'a:int[n]', 'b:int[n]'],
      fast: true,
      python: r`
        inf = 1 << 60
        dp = [inf] * (1 << n)
        dp[0] = 0
        for mask in range(1 << n):
            i = bin(mask).count("1")
            if i == n or dp[mask] == inf:
                continue
            base = dp[mask]
            ai = a[i]
            for j in range(n):
                if not (mask >> j) & 1:
                    nm = mask | (1 << j)
                    cost = base + (ai ^ b[j])
                    if cost < dp[nm]:
                        dp[nm] = cost
        print(dp[(1 << n) - 1])`,
      cpp: r`
        int cn = (int)n;
        const long long INF = 1LL << 60;
        vector<long long> dp(1 << cn, INF);
        dp[0] = 0;
        for (int mask = 0; mask < (1 << cn); mask++) {
            int i = __builtin_popcount(mask);
            if (i == cn || dp[mask] == INF) continue;
            for (int j = 0; j < cn; j++) {
                if (!((mask >> j) & 1)) {
                    int nm = mask | (1 << j);
                    dp[nm] = min(dp[nm], dp[mask] + (a[i] ^ b[j]));
                }
            }
        }
        cout << dp[(1 << cn) - 1] << "\n";`,
      java: r`
        int cn = (int) n;
        long inf = 1L << 60;
        long[] dp = new long[1 << cn];
        Arrays.fill(dp, inf);
        dp[0] = 0;
        for (int mask = 0; mask < (1 << cn); mask++) {
            int i = Integer.bitCount(mask);
            if (i == cn || dp[mask] == inf) continue;
            for (int j = 0; j < cn; j++) {
                if ((mask & (1 << j)) == 0) {
                    int nm = mask | (1 << j);
                    long cost = dp[mask] + (a[i] ^ b[j]);
                    if (cost < dp[nm]) dp[nm] = cost;
                }
            }
        }
        System.out.println(dp[(1 << cn) - 1]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['dp[mask] is the smallest XOR sum when the first popcount(mask) elements of a are matched with the elements of b in mask; each state is extended by pairing the next element of a with an unused element of b.'], complexity: 'Time O(n 2^n), space O(2^n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const a = nums(rs[1]), b = nums(rs[2]); const dp = new Array(1 << n).fill(Infinity); dp[0] = 0; for (let mask = 0; mask < (1 << n); mask++) { const i = pop(mask); if (i === n || dp[mask] === Infinity) continue; for (let j = 0; j < n; j++) if (!(mask >> j & 1)) { const nm = mask | (1 << j); dp[nm] = Math.min(dp[nm], dp[mask] + (a[i] ^ b[j])); } } return String(dp[(1 << n) - 1]);
    },
    tests() {
      const g = rng(3114); const out = ['2\n1 2\n2 3\n', '3\n1 0 3\n5 3 4\n', '1\n7\n7\n', '1\n0\n1073741823\n'];
      const make = (n, hi) => `${n}\n${randArray(g, n, 0, hi).join(' ')}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const a = nums(rs[1]), b = nums(rs[2]); let best = Infinity; const used = new Array(n).fill(false); const go = (i, sum) => { if (sum >= best) return; if (i === n) { best = sum; return; } for (let j = 0; j < n; j++) if (!used[j]) { used[j] = true; go(i + 1, sum + (a[i] ^ b[j])); used[j] = false; } }; go(0, 0); return String(best); };
      crossCheck(() => make(randInt(g, 1, 7), randInt(g, 0, 1) ? 15 : LIM - 1), (i) => this.solve(i), brute, 600);
      for (const [n, hi] of [[8, 255], [12, LIM - 1], [16, LIM - 1], [16, 255], [16, 3], [15, LIM - 1], [16, 1], [14, 100000]]) out.push(make(n, hi));
      out.push(`16\n${many(16, (i) => 1 << i).join(' ')}\n${many(16, (i) => LIM - 1 - (1 << i)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 20000', '0 <= each number <= 10^18'],
    slug: 'largest-xor-of-a-subset',
    title: 'The Largest XOR of Any Subset',
    tags: ['bit-manipulation', 'xor', 'linear-basis', 'gaussian-elimination'],
    concept: {
      title: 'Keep a linear basis over the two-element field: one vector per highest bit, and every other number reduces against it',
      body: [
        'Choose **any subset** of the given numbers (possibly empty, possibly all) so that the **XOR of the chosen numbers is as large as possible**. For `8 1 2 12` the answer is 15: the subset `1 2 12` gives `1 ^ 2 = 3` and `3 ^ 12 = 15`. There are `2^n` subsets, but the set of all XOR values has a very regular structure.',
        'View every number as a vector of 60 bits over the field with two elements, where addition is XOR. Build a **linear basis** with one slot per bit: `basis[b]` is a number whose highest bit is `b`, or 0 if none. To insert `x`, look at its highest bit `b`: if the slot is empty, store `x` there; otherwise replace `x` by `x ^ basis[b]` (this clears the bit `b`) and continue with the next highest bit. A number that reduces to 0 adds nothing new. The XOR values of subsets of the input are **exactly** the XOR values of subsets of the basis, and the basis has at most 60 vectors.',
        { code: 'basis = [0] * 60\nfor x in a:\n    for bit in range(59, -1, -1):\n        if not (x >> bit) & 1: continue\n        if basis[bit] == 0:\n            basis[bit] = x; break\n        x ^= basis[bit]\nres = 0\nfor bit in range(59, -1, -1):        # greedy: take a basis vector if it makes the result bigger\n    if (res ^ basis[bit]) > res:\n        res ^= basis[bit]\nprint(res)' },
        'The final greedy works from the top: the vector with the highest bit `b` is XOR-ed in whenever the bit `b` of the current result is 0, because a 1 at a higher position beats everything below. The basis building costs 60 steps per number: O(60 n) in total. The number 10^18 is below `2^60`, so 60 bit positions are enough; in C++ and Java use 64-bit numbers.'
      ]
    },
    statement: ['A list of `n` numbers is given. Choose any subset of them (the empty subset gives 0) so that the XOR of the chosen numbers is as large as possible. Print this largest XOR.'],
    outputFormat: ['Print the largest XOR of a subset.'],
    examples: [{ input: '4\n8 1 2 12\n', note: 'The subset 1, 2, 12 gives 3 ^ 12 = 15.' }, { input: '2\n5 5\n', note: 'The numbers are equal: the best is 5.' }],
    hints: ['Think of the numbers as vectors of bits; addition is XOR.', 'Keep one basis vector per highest bit and reduce each new number against them.', 'Build the answer greedily from the top bit using the basis.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        basis = [0] * 60
        for x in a:
            for bit in range(59, -1, -1):
                if not (x >> bit) & 1:
                    continue
                if basis[bit] == 0:
                    basis[bit] = x
                    break
                x ^= basis[bit]
        res = 0
        for bit in range(59, -1, -1):
            if (res ^ basis[bit]) > res:
                res ^= basis[bit]
        print(res)`,
      cpp: r`
        long long basis[60] = {0};
        for (long long x : a) {
            for (int bit = 59; bit >= 0; bit--) {
                if (!((x >> bit) & 1)) continue;
                if (basis[bit] == 0) {
                    basis[bit] = x;
                    break;
                }
                x ^= basis[bit];
            }
        }
        long long res = 0;
        for (int bit = 59; bit >= 0; bit--) {
            if ((res ^ basis[bit]) > res) res ^= basis[bit];
        }
        cout << res << "\n";`,
      java: r`
        long[] basis = new long[60];
        for (long v : a) {
            long x = v;
            for (int bit = 59; bit >= 0; bit--) {
                if (((x >> bit) & 1L) == 0) continue;
                if (basis[bit] == 0) {
                    basis[bit] = x;
                    break;
                }
                x ^= basis[bit];
            }
        }
        long res = 0;
        for (int bit = 59; bit >= 0; bit--) {
            if ((res ^ basis[bit]) > res) res ^= basis[bit];
        }
        System.out.println(res);`
    },
    solution: { explanation: ['A linear basis with one vector per highest bit is built by reducing each number against it; the maximum subset XOR is found greedily from the top bit by XOR-ing a basis vector whenever it increases the result.'], complexity: 'Time O(60 n), space O(60).' },
    solve(input) {
      const a = bigs(rows(input)[1]); const basis = new Array(60).fill(0n); for (let x of a) { for (let bit = 59; bit >= 0; bit--) { if (!((x >> BigInt(bit)) & 1n)) continue; if (basis[bit] === 0n) { basis[bit] = x; break; } x ^= basis[bit]; } } let res = 0n; for (let bit = 59; bit >= 0; bit--) if ((res ^ basis[bit]) > res) res ^= basis[bit]; return String(res);
    },
    tests() {
      const g = rng(3115); const out = ['4\n8 1 2 12\n', '2\n5 5\n', '1\n0\n', '3\n1000000000000000000 1 2\n'];
      const mixed = () => { const bits = randInt(g, 1, 59); return randBig(g, 0n, (1n << BigInt(bits)) - 1n < MAXV ? (1n << BigInt(bits)) - 1n : MAXV); };
      const lowRank = (n, r) => { const vecs = many(r, () => randBig(g, 1n, MAXV)); return many(n, () => { let x = 0n; for (const v of vecs) if (g() < 0.5) x ^= v; return x > MAXV ? x & ((1n << 59n) - 1n) : x; }); };
      const make = (list) => `${list.length}\n${list.join(' ')}\n`;
      const brute = (input) => { const a = bigs(rows(input)[1]); let best = 0n; for (let mask = 0; mask < (1 << a.length); mask++) { let x = 0n; for (let i = 0; i < a.length; i++) if (mask >> i & 1) x ^= a[i]; if (x > best) best = x; } return String(best); };
      crossCheck(() => make(many(randInt(g, 1, 9), () => randBig(g, 0n, 60n))), (i) => this.solve(i), brute, 800);
      for (const [n, mode] of [[10, 'big'], [100, 'mixed'], [1000, 'big'], [20000, 'big'], [20000, 'mixed'], [20000, 'low5'], [20000, 'low30'], [19999, 'low59']]) out.push(make(mode === 'big' ? many(n, () => randBig(g, 0n, MAXV)) : mode === 'mixed' ? many(n, mixed) : lowRank(n, Number(mode.slice(3)))));
      out.push(make(many(20000, (i) => 1n << BigInt(i % 60))), make(many(20000, () => MAXV)));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the number of values and the number of questions.', 'The second line has `n` numbers.', 'The third line has `q` numbers `k`.'],
    constraints: ['1 <= n, q <= 20000', '0 <= each number <= 10^18', '1 <= k <= 10^18'],
    slug: 'kth-smallest-subset-xor',
    title: 'The K-th Smallest XOR of a Subset',
    tags: ['bit-manipulation', 'xor', 'linear-basis', 'order-statistics'],
    concept: {
      title: 'Reduce the basis so that each pivot bit lives in one vector only; then the binary digits of k - 1 choose the vectors',
      body: [
        'Consider the XOR values of **all subsets** of the given numbers (including the empty subset, which gives 0), and sort the **distinct** values. For each question `k` print the **k-th smallest** value, or -1 if there are fewer than `k` distinct values. For the numbers `1 2 3` the values are `0 1 2 3`, so `k = 3` gives 2 and `k = 5` gives -1.',
        'Build the linear basis as in the problem on the largest XOR of a subset: it has `r` vectors with different highest bits, and the number of distinct XOR values is exactly `2^r`. Then make the basis **reduced**: for every pivot bit `i`, clear the bit `i` from all the other basis vectors by XOR-ing the vector with pivot `i` into them. After this each pivot bit appears in exactly one vector, the one with that pivot. Sort the vectors by pivot: `v_0 < v_1 < ... < v_{r-1}`.',
        { code: 'basis = [0] * 60            # ... built by inserting every number ...\nfor i in range(60):\n    if basis[i]:\n        for j in range(i + 1, 60):\n            if (basis[j] >> i) & 1:\n                basis[j] ^= basis[i]          # now the pivot bit i is only in basis[i]\nvs = [b for b in basis if b]                  # sorted by pivot\nr = len(vs)\ndef kth(k):\n    if k > (1 << r): return -1\n    idx = k - 1\n    x = 0\n    for t in range(r):\n        if (idx >> t) & 1: x ^= vs[t]\n    return x' },
        'Why does this work? In the reduced basis the value built from a set of vectors has, at the pivot positions, exactly the pattern of the chosen vectors, and the pivot positions are the most significant ones that differ. So **comparing two XOR values is the same as comparing the binary numbers that tell which vectors are used**. Therefore the `k`-th smallest value is the XOR of the vectors selected by the bits of `k - 1`. Each question costs O(60), and building the basis costs O(60 n).'
      ]
    },
    statement: ['A list of `n` numbers is given. Take the XOR values of all subsets of the list (the empty subset gives 0), remove duplicates and sort them. For each question `k` print the k-th smallest value (the smallest is the 1st), or -1 if there are fewer than `k` distinct values. Print the answers on one line.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '3 3\n1 2 3\n3 1 5\n', note: 'The values are 0, 1, 2, 3: the answers are 2, 0 and -1.' }],
    hints: ['The number of distinct values is 2^r, where r is the rank of the basis.', 'Reduce the basis so that every pivot bit appears in only one vector.', 'The binary digits of k - 1 tell which vectors (sorted by pivot) to XOR.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ks:int[q]'],
      fast: true,
      python: r`
        basis = [0] * 60
        for x in a:
            for bit in range(59, -1, -1):
                if not (x >> bit) & 1:
                    continue
                if basis[bit] == 0:
                    basis[bit] = x
                    break
                x ^= basis[bit]
        for i in range(60):
            if basis[i]:
                for j in range(i + 1, 60):
                    if (basis[j] >> i) & 1:
                        basis[j] ^= basis[i]
        vs = [b for b in basis if b]
        r = len(vs)
        out = []
        for k in ks:
            if k > (1 << r):
                out.append(-1)
            else:
                idx = k - 1
                x = 0
                for t in range(r):
                    if (idx >> t) & 1:
                        x ^= vs[t]
                out.append(x)
        print(*out)`,
      cpp: r`
        long long basis[60] = {0};
        for (long long x : a) {
            for (int bit = 59; bit >= 0; bit--) {
                if (!((x >> bit) & 1)) continue;
                if (basis[bit] == 0) {
                    basis[bit] = x;
                    break;
                }
                x ^= basis[bit];
            }
        }
        for (int i = 0; i < 60; i++) {
            if (!basis[i]) continue;
            for (int j = i + 1; j < 60; j++) {
                if ((basis[j] >> i) & 1) basis[j] ^= basis[i];
            }
        }
        vector<long long> vs;
        for (int i = 0; i < 60; i++) if (basis[i]) vs.push_back(basis[i]);
        int r = (int)vs.size();
        for (long long t = 0; t < q; t++) {
            long long k = ks[t], result;
            if (k > (1LL << r)) {
                result = -1;
            } else {
                long long idx = k - 1;
                result = 0;
                for (int s = 0; s < r; s++) if ((idx >> s) & 1) result ^= vs[s];
            }
            cout << (t ? " " : "") << result;
        }
        cout << "\n";`,
      java: r`
        long[] basis = new long[60];
        for (long v : a) {
            long x = v;
            for (int bit = 59; bit >= 0; bit--) {
                if (((x >> bit) & 1L) == 0) continue;
                if (basis[bit] == 0) {
                    basis[bit] = x;
                    break;
                }
                x ^= basis[bit];
            }
        }
        for (int i = 0; i < 60; i++) {
            if (basis[i] == 0) continue;
            for (int j = i + 1; j < 60; j++) {
                if (((basis[j] >> i) & 1L) != 0) basis[j] ^= basis[i];
            }
        }
        long[] vs = new long[60];
        int r = 0;
        for (int i = 0; i < 60; i++) if (basis[i] != 0) vs[r++] = basis[i];
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            long k = ks[t], result;
            if (k > (1L << r)) {
                result = -1;
            } else {
                long idx = k - 1;
                result = 0;
                for (int s = 0; s < r; s++) if (((idx >> s) & 1L) != 0) result ^= vs[s];
            }
            if (t > 0) out.append(" ");
            out.append(result);
        }
        System.out.println(out);`,
      includes: ['<vector>']
    },
    solution: { explanation: ['The linear basis is built and reduced so that each pivot bit is in one vector only; there are 2^r distinct XOR values and the k-th smallest is the XOR of the basis vectors selected by the binary digits of k - 1.'], complexity: 'Time O(60 n + 60 q), space O(60).' },
    solve(input) {
      const rs = rows(input); const a = rs[1].split(' ').map(BigInt); const ks = rs[2].split(' ').map(BigInt); const basis = new Array(60).fill(0n); for (let x of a) { for (let bit = 59; bit >= 0; bit--) { if (!((x >> BigInt(bit)) & 1n)) continue; if (basis[bit] === 0n) { basis[bit] = x; break; } x ^= basis[bit]; } }
      for (let i = 0; i < 60; i++) if (basis[i]) for (let j = i + 1; j < 60; j++) if ((basis[j] >> BigInt(i)) & 1n) basis[j] ^= basis[i]; const vs = basis.filter((b) => b !== 0n); const rank = BigInt(vs.length);
      return ks.map((k) => { if (k > (1n << rank)) return -1n; const idx = k - 1n; let x = 0n; for (let t = 0; t < vs.length; t++) if ((idx >> BigInt(t)) & 1n) x ^= vs[t]; return x; }).join(' ');
    },
    tests() {
      const g = rng(3116); const out = ['3 3\n1 2 3\n3 1 5\n', '1 2\n0\n1 2\n', '2 3\n5 5\n1 2 3\n', '1 1\n1000000000000000000\n2\n'];
      const lowRank = (n, r) => { const vecs = many(r, () => randBig(g, 1n, MAXV)); return many(n, () => { let x = 0n; for (const v of vecs) if (g() < 0.5) x ^= v; return x > MAXV ? x & ((1n << 59n) - 1n) : x; }); };
      const rankOf = (list) => { const basis = new Array(60).fill(0n); let rank = 0; for (let x of list) { for (let bit = 59; bit >= 0; bit--) { if (!((x >> BigInt(bit)) & 1n)) continue; if (basis[bit] === 0n) { basis[bit] = x; rank++; break; } x ^= basis[bit]; } } return rank; };
      const make = (list, q) => { const rank = rankOf(list); const top = rank >= 60 ? MAXV : 1n << BigInt(rank); const ks = many(q, (i) => { const roll = g(); if (roll < 0.1) return 1n; if (roll < 0.2) return top > MAXV ? MAXV : top; if (roll < 0.3) return (top + 1n > MAXV ? MAXV : top + 1n); return randBig(g, 1n, (top + 3n) > MAXV ? MAXV : top + 3n); }); return `${list.length} ${q}\n${list.join(' ')}\n${ks.join(' ')}\n`; };
      const brute = (input) => { const rs = rows(input); const a = rs[1].split(' ').map(BigInt); const ks = rs[2].split(' ').map(BigInt); const vals = new Set(); for (let mask = 0; mask < (1 << a.length); mask++) { let x = 0n; for (let i = 0; i < a.length; i++) if (mask >> i & 1) x ^= a[i]; vals.add(x); } const sorted = [...vals].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)); return ks.map((k) => (k > BigInt(sorted.length) ? -1n : sorted[Number(k) - 1])).join(' '); };
      crossCheck(() => make(many(randInt(g, 1, 8), () => randBig(g, 0n, 40n)), randInt(g, 1, 6)), (i) => this.solve(i), brute, 800);
      for (const [n, q, r] of [[10, 10, 5], [100, 100, 20], [1000, 1000, 40], [20000, 20000, 59], [10000, 10000, 10], [8000, 8000, 1], [15000, 15000, 30], [16000, 16000, 58]]) out.push(make(lowRank(n, r), q));
      out.push(make(many(12000, () => randBig(g, 0n, MAXV)), 12000));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 50000', '0 <= each number < 2^30'],
    slug: 'shortest-subarray-with-full-or-from-each-start',
    title: 'The Shortest Subarray From Each Start That Reaches the Largest OR',
    tags: ['bit-manipulation', 'or', 'subarrays', 'next-occurrence'],
    concept: {
      title: 'The largest OR from a start is the OR of the whole suffix; the shortest subarray must reach the nearest occurrence of every bit',
      body: [
        'For every starting position `i` consider the subarrays that **start at `i`**. Their ORs grow when the subarray gets longer, so the **largest OR** is the OR of the whole suffix `a[i..n-1]`. Print, for every `i`, the **length of the shortest subarray starting at `i` whose OR equals this largest OR**. For `1 0 2 1 3` the answers are `3 3 2 2 1`: from the position 0 the suffix OR is 3 and `1 0 2` already reaches it.',
        'For a bit `b`, the subarray must contain **a number with this bit** if the suffix has it at all; the shortest way is to reach the **nearest** number at or after `i` that has the bit `b`. So the answer for `i` is the farthest of these nearest positions over all bits that occur in the suffix, plus one, minus `i` (and at least 1). Scan the array from the right to the left, keeping `last[b]`, the nearest position at or to the right of the current one that has the bit `b` (or -1).',
        { code: 'last = [-1] * 30\nfor i in range(n - 1, -1, -1):\n    far = i\n    for b in range(30):\n        if (a[i] >> b) & 1:\n            last[b] = i                    # the nearest number with the bit b is now a[i]\n        if last[b] > far:\n            far = last[b]                  # a bit that exists in the suffix must be reached\n    result[i] = far - i + 1' },
        'The loop makes 30 steps for each of the `n` positions, so the program runs in O(30 n). The idea that the OR is built bit by bit is the same as the one in the "shortest window with all letters" problems: every needed element has to be inside, so the window ends at the farthest of the nearest ones. The OR of the subarray `i..far` contains every bit of the suffix, hence equals the suffix OR, and no shorter subarray can contain all these bits.'
      ]
    },
    statement: ['A list of `n` numbers is given. For every starting position `i` print the length of the shortest subarray that starts at `i` and whose bitwise OR is equal to the largest OR of all subarrays that start at `i` (that is, the OR of `a[i..n-1]`).'],
    outputFormat: ['Print `n` numbers on one line, separated by spaces.'],
    examples: [{ input: '5\n1 0 2 1 3\n', note: 'The suffix ORs are 3, 3, 3, 3, 3; the shortest subarrays are 1 0 2 (3), 0 2 1 (3), 2 1 (2), 1 3 (2) and 3 (1): 3 3 2 2 1.' }],
    hints: ['The largest OR from a start is the OR of the entire suffix.', 'Every bit of the suffix must be reached at its nearest occurrence.', 'Scan from the right and keep, for each bit, the nearest position that has it.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        last = [-1] * 30
        res = [0] * n
        for i in range(n - 1, -1, -1):
            far = i
            x = a[i]
            for b in range(30):
                if (x >> b) & 1:
                    last[b] = i
                if last[b] > far:
                    far = last[b]
            res[i] = far - i + 1
        print(*res)`,
      cpp: r`
        vector<long long> last(30, -1), res(n);
        for (long long i = n - 1; i >= 0; i--) {
            long long far = i;
            for (int b = 0; b < 30; b++) {
                if ((a[i] >> b) & 1) last[b] = i;
                if (last[b] > far) far = last[b];
            }
            res[i] = far - i + 1;
        }
        for (long long i = 0; i < n; i++) cout << (i ? " " : "") << res[i];
        cout << "\n";`,
      java: r`
        int cn = (int) n;
        long[] last = new long[30];
        Arrays.fill(last, -1);
        long[] res = new long[cn];
        for (int i = cn - 1; i >= 0; i--) {
            long far = i;
            for (int b = 0; b < 30; b++) {
                if (((a[i] >> b) & 1L) != 0) last[b] = i;
                if (last[b] > far) far = last[b];
            }
            res[i] = far - i + 1;
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < cn; i++) {
            if (i > 0) out.append(" ");
            out.append(res[i]);
        }
        System.out.println(out);`,
      includes: ['<vector>']
    },
    solution: { explanation: ['Scanning from the right, for every bit the nearest position at or after the current one that has it is kept; the shortest subarray from the current start ends at the farthest of these nearest positions (or at the start itself).'], complexity: 'Time O(30 n), space O(n).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; const levels = [Int32Array.from(a)]; while ((1 << levels.length) <= n) { const prev = levels[levels.length - 1]; const half = 1 << (levels.length - 1); const cur = new Int32Array(n); for (let i = 0; i + 2 * half <= n; i++) cur[i] = prev[i] | prev[i + half]; levels.push(cur); } // a sparse table of ORs and a binary search on the length
      const orRange = (i, len) => { let v = 0; let pos = i; for (let k = levels.length - 1; k >= 0; k--) if (len & (1 << k)) { v |= levels[k][pos]; pos += 1 << k; } return v; };
      const suffix = new Int32Array(n + 1); for (let i = n - 1; i >= 0; i--) suffix[i] = suffix[i + 1] | a[i]; const out = []; for (let i = 0; i < n; i++) { let lo = 1, hi = n - i; while (lo < hi) { const mid = (lo + hi) >> 1; if (orRange(i, mid) === suffix[i]) hi = mid; else lo = mid + 1; } out.push(lo); } return out.join(' ');
    },
    tests() {
      const g = rng(3117); const out = ['5\n1 0 2 1 3\n', '1\n0\n', '1\n5\n', '3\n0 0 0\n'];
      const make = (n, ands, zeroChance) => `${n}\n${many(n, () => (g() < zeroChance ? 0 : sparseNumber(g, ands))).join(' ')}\n`;
      const brute = (input) => { const a = arrOf(input); const n = a.length; return a.map((_, i) => { let total = 0; for (let j = i; j < n; j++) total |= a[j]; let v = 0; for (let j = i; j < n; j++) { v |= a[j]; if (v === total) return j - i + 1; } }).join(' '); };
      crossCheck(() => { const n = randInt(g, 1, 12); return `${n}\n${randArray(g, n, 0, 15).join(' ')}\n`; }, (i) => this.solve(i), brute, 800);
      for (const [n, ands, zero] of [[10, 2, 0.2], [100, 4, 0.1], [1000, 6, 0], [50000, 6, 0], [50000, 12, 0.3], [50000, 2, 0], [50000, 25, 0.5], [49999, 8, 0.1], [50000, 0, 0]]) out.push(make(n, ands, zero));
      out.push(`50000\n${many(50000, (i) => 1 << (i % 30)).join(' ')}\n`, `50000\n${many(50000, (i) => (i === 49999 ? 1073741823 : 0)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 30000', '0 <= each number < 2^16'],
    slug: 'subsets-with-zero-and',
    title: 'How Many Subsets Have an AND of Zero?',
    tags: ['bit-manipulation', 'sos-dp', 'inclusion-exclusion', 'counting-modulo'],
    concept: {
      title: 'Inclusion-exclusion over the masks of common bits, with "how many numbers contain this mask" from a superset-sum transform',
      body: [
        'Count the **non-empty subsets** of the list (subsets of positions, so equal numbers at different positions count as different elements) whose **AND is 0**. Print the count modulo `1 000 000 007`. For `1 2 3` the answer is 2: the subsets `{1, 2}` and `{1, 2, 3}`. With `n = 30000` there are `2^30000` subsets, so only a formula can work.',
        'Let `S(m)` be the number of non-empty subsets whose AND **contains all the bits of the mask `m`** (the AND is a superset of `m`). Such a subset consists only of elements that are supersets of `m`. If `c[m]` elements are supersets of `m`, then `S(m) = 2^{c[m]} - 1`. We want the subsets with AND equal to 0, i.e. those that contain **no** bit in the AND. By **inclusion-exclusion** over the set of bits that the AND is required to contain: the answer is `sum over all masks m of (-1)^{popcount(m)} * S(m)`.',
        { code: 'c = [0] * (1 << 16)\nfor v in a: c[v] += 1\nfor b in range(16):                  # c[m] = the number of elements that are supersets of m\n    for m in range(1 << 16):\n        if not (m >> b) & 1:\n            c[m] += c[m | (1 << b)]\nanswer = 0\nfor m in range(1 << 16):\n    term = pow2[c[m]] - 1\n    answer += term if popcount(m) % 2 == 0 else -term\nprint(answer % MOD)' },
        'The table `c` is computed by the *superset-sum* transform: for every bit and every mask **without** this bit, add the value of the mask with it. The powers of two up to `n` are precomputed modulo `10^9 + 7`. The work is `16 * 65536` for the transform plus `65536` for the final sum. The modulus is important: the real answer has up to 30000 binary digits, and the subtraction of terms needs a final `% MOD` to give a non-negative result.'
      ]
    },
    statement: ['A list of `n` numbers (each below 65536) is given. Count the non-empty subsets of positions whose bitwise AND is 0, and print the count modulo 1000000007.'],
    outputFormat: ['Print the number of subsets modulo 1000000007.'],
    examples: [{ input: '3\n1 2 3\n', note: 'Only {1, 2} and {1, 2, 3} have the AND 0: 2.' }, { input: '2\n7 7\n', note: 'Every non-empty subset has the AND 7: 0.' }],
    hints: ['Count the subsets whose elements all contain a given mask of bits: 2^c - 1.', 'Use inclusion-exclusion over the masks with the sign (-1)^popcount.', 'c[m] (the number of supersets of m) comes from a superset-sum transform over the 16 bits.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        MOD = 1000000007
        size = 1 << 16
        c = [0] * size
        for v in a:
            c[v] += 1
        for b in range(16):
            bit = 1 << b
            for m in range(size):
                if not m & bit:
                    c[m] += c[m | bit]
        pow2 = [1] * (n + 1)
        for i in range(1, n + 1):
            pow2[i] = pow2[i - 1] * 2 % MOD
        answer = 0
        for m in range(size):
            term = pow2[c[m]] - 1
            if bin(m).count("1") % 2 == 0:
                answer += term
            else:
                answer -= term
        print(answer % MOD)`,
      cpp: r`
        const long long MOD = 1000000007LL;
        const int SIZE = 1 << 16;
        vector<long long> c(SIZE, 0), pow2(n + 1, 1);
        for (long long v : a) c[v]++;
        for (int b = 0; b < 16; b++) {
            for (int m = 0; m < SIZE; m++) {
                if (!(m & (1 << b))) c[m] += c[m | (1 << b)];
            }
        }
        for (long long i = 1; i <= n; i++) pow2[i] = pow2[i - 1] * 2 % MOD;
        long long answer = 0;
        for (int m = 0; m < SIZE; m++) {
            long long term = (pow2[c[m]] - 1 + MOD) % MOD;
            if (__builtin_popcount(m) % 2 == 0) answer = (answer + term) % MOD;
            else answer = (answer - term + MOD) % MOD;
        }
        cout << answer << "\n";`,
      java: r`
        long mod = 1000000007L;
        int size = 1 << 16;
        int cn = (int) n;
        long[] c = new long[size];
        long[] pow2 = new long[cn + 1];
        for (long v : a) c[(int) v]++;
        for (int b = 0; b < 16; b++) {
            for (int m = 0; m < size; m++) {
                if ((m & (1 << b)) == 0) c[m] += c[m | (1 << b)];
            }
        }
        pow2[0] = 1;
        for (int i = 1; i <= cn; i++) pow2[i] = pow2[i - 1] * 2 % mod;
        long answer = 0;
        for (int m = 0; m < size; m++) {
            long term = (pow2[(int) c[m]] - 1 + mod) % mod;
            if (Integer.bitCount(m) % 2 == 0) answer = (answer + term) % mod;
            else answer = (answer - term + mod) % mod;
        }
        System.out.println(answer);`,
      includes: ['<vector>']
    },
    solution: { explanation: ['c[m] counts the elements that are supersets of m (superset-sum transform); the number of non-empty subsets whose AND contains m is 2^c[m] - 1; inclusion-exclusion with the sign (-1)^popcount(m) over all masks gives the number of subsets with AND 0, modulo 10^9 + 7.'], complexity: 'Time O(n + 16 * 2^16), space O(2^16 + n).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; const size = 1 << 16; const c = new Array(size).fill(0); for (const v of a) c[v]++; for (let b = 0; b < 16; b++) for (let m = 0; m < size; m++) if (!(m & (1 << b))) c[m] += c[m | (1 << b)]; const pow2 = [1n]; for (let i = 1; i <= n; i++) pow2.push(pow2[i - 1] * 2n % MOD); let answer = 0n; for (let m = 0; m < size; m++) { const term = pow2[c[m]] - 1n; answer += pop(m) % 2 === 0 ? term : -term; } return String(((answer % MOD) + MOD) % MOD);
    },
    tests() {
      const g = rng(3118); const out = ['3\n1 2 3\n', '2\n7 7\n', '1\n0\n', '1\n5\n', '3\n0 0 0\n'];
      const make = (n, hi) => `${n}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (input) => { const a = arrOf(input); let count = 0n; for (let mask = 1; mask < (1 << a.length); mask++) { let v = 65535; for (let i = 0; i < a.length; i++) if (mask >> i & 1) v &= a[i]; if (v === 0) count++; } return String(count % MOD); };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 0, 1) ? 15 : 65535), (i) => this.solve(i), brute, 800);
      for (const [n, hi] of [[10, 100], [100, 65535], [1000, 4095], [30000, 65535], [30000, 255], [30000, 3], [29999, 65535], [30000, 1]]) out.push(make(n, hi));
      out.push(`30000\n${many(30000, (i) => 65535 - (1 << (i % 16))).join(' ')}\n`, `30000\n${many(30000, () => 65535).join(' ')}\n`, `30000\n${many(30000, (i) => (i % 2 ? 43690 : 21845)).join(' ')}\n`);
      return out;
    }
  }
];
