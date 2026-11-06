import { r, rng, randInt, many, nums, rows, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const lines = (list) => list.map((p) => p.join(' ')).join('\n');
const rowsOfNums = (input, from, count) => { const rs = rows(input); return many(count, (i) => nums(rs[from + i])); };
const gcd = (a, b) => { while (b) { [a, b] = [b, a % b]; } return a; };
const dedent = (s) => { const ls = s.replace(/^\n/, '').split('\n'); const ind = Math.min(...ls.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)); return ls.map((l) => l.slice(ind)).join('\n'); };
class Fen {
  constructor(n) { this.n = n; this.t = new Array(n + 1).fill(0); }
  add(i, x) { for (; i <= this.n; i += i & -i) this.t[i] += x; }
  sum(i) { let s = 0; for (; i > 0; i -= i & -i) s += this.t[i]; return s; }
}
const fib = (n) => { let a = 'a', b = 'ab'; while (b.length < n) [a, b] = [b, b + a]; return b.slice(0, n); };
const prefixFn = (s) => { const pi = new Array(s.length).fill(0); for (let i = 1; i < s.length; i++) { let k = pi[i - 1]; while (k && s[i] !== s[k]) k = pi[k - 1]; if (s[i] === s[k]) k++; pi[i] = k; } return pi; };
const FENWICK = {
  python: r`
    def bit_add(t, i, x):
        n = len(t) - 1
        while i <= n:
            t[i] += x
            i += i & -i

    def bit_sum(t, i):
        s = 0
        while i > 0:
            s += t[i]
            i -= i & -i
        return s`,
  cpp: r`
    void bitAdd(vector<long long>& t, long long i, long long x) {
        long long n = (long long)t.size() - 1;
        for (; i <= n; i += i & -i) t[i] += x;
    }

    long long bitSum(const vector<long long>& t, long long i) {
        long long s = 0;
        for (; i > 0; i -= i & -i) s += t[i];
        return s;
    }`,
  java: r`
    static void bitAdd(long[] t, int i, long x) {
        int n = t.length - 1;
        for (; i <= n; i += i & -i) t[i] += x;
    }

    static long bitSum(long[] t, int i) {
        long s = 0;
        for (; i > 0; i -= i & -i) s += t[i];
        return s;
    }`
};
const PREFIX = {
  python: r`
    def prefix_function(s):
        n = len(s)
        pi = [0] * n
        for i in range(1, n):
            k = pi[i - 1]
            while k and s[i] != s[k]:
                k = pi[k - 1]
            if s[i] == s[k]:
                k += 1
            pi[i] = k
        return pi`,
  cpp: r`
    vector<int> prefixFunction(const string& s) {
        int n = (int)s.size();
        vector<int> pi(n, 0);
        for (int i = 1; i < n; i++) {
            int k = pi[i - 1];
            while (k > 0 && s[i] != s[k]) k = pi[k - 1];
            if (s[i] == s[k]) k++;
            pi[i] = k;
        }
        return pi;
    }`,
  java: r`
    static int[] prefixFunction(String s) {
        int n = s.length();
        int[] pi = new int[n];
        for (int i = 1; i < n; i++) {
            int k = pi[i - 1];
            while (k > 0 && s.charAt(i) != s.charAt(k)) k = pi[k - 1];
            if (s.charAt(i) == s.charAt(k)) k++;
            pi[i] = k;
        }
        return pi;
    }`
};

// a random rooted tree given by the parent of every node (the parent has a smaller number); the root is node 1 with parent 0
const parents = (g, n, shape) => { const p = [0]; for (let v = 2; v <= n; v++) p.push(shape === 'path' ? v - 1 : shape === 'star' ? 1 : shape === 'deep' ? Math.max(1, v - randInt(g, 1, 3)) : randInt(g, 1, v - 1)); return p; };
// tin / size of every node of such a tree, in the order of a depth-first walk
const euler = (p) => { const n = p.length; const sz = new Array(n + 1).fill(1); for (let v = n; v >= 2; v--) sz[p[v - 1]] += sz[v]; const tin = new Array(n + 1).fill(0); const nxt = new Array(n + 1).fill(0); nxt[1] = 1; for (let v = 2; v <= n; v++) { tin[v] = nxt[p[v - 1]]; nxt[p[v - 1]] += sz[v]; nxt[v] = tin[v] + 1; } return { sz, tin }; };

const staticQueries = (g, n, q, hi) => `${n} ${q}\n${randArray(g, n, 1, hi).join(' ')}\n${many(q, () => { const l = randInt(g, 1, n); return `${l} ${randInt(g, l, n)}`; }).join('\n')}\n`;

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of values and the number of questions.', 'The second line has `n` numbers.', 'Each of the next `q` lines has two numbers `l` and `r`: the question asks for the smallest number among the positions `l` to `r`.'],
    constraints: ['1 <= n, q <= 40000', '1 <= each number <= 10^9', '1 <= l <= r <= n'],
    slug: 'smallest-in-many-ranges',
    title: 'The Smallest Number in Each of Many Ranges',
    tags: ['sparse-table', 'range-minimum', 'static-queries', 'preprocessing'],
    concept: {
      title: 'A sparse table stores the minimum of every block of length 2^j, and two overlapping blocks cover any range',
      body: [
        'A list of numbers never changes, and there are many questions "what is the smallest number from the position `l` to the position `r`?" A segment tree answers each in O(log n). For a list that does not change, the **sparse table** answers each question in **O(1)** after an O(n log n) preparation.',
        'Let `table[j][i]` be the minimum of the `2^j` numbers starting at the position `i`. Level 0 is the list itself, and each higher level combines two blocks of the level below: `table[j][i] = min(table[j-1][i], table[j-1][i + 2^(j-1)])`. For a question `[l, r]` let `k` be the largest number with `2^k <= r - l + 1`. The two blocks of length `2^k` that start at `l` and end at `r` (they start at `l` and at `r - 2^k + 1`) **cover the whole range** and may overlap. For the minimum an overlap is harmless: `min(table[k][l], table[k][r - 2^k + 1])`.',
        { code: 'table = [a[:]]\nj = 1\nwhile (1 << j) <= n:\n    prev, half = table[-1], 1 << (j - 1)\n    table.append([min(prev[i], prev[i + half]) for i in range(n - (1 << j) + 1)])\n    j += 1\n\ndef smallest(l, r):                  # positions counted from 0, both included\n    k = (r - l + 1).bit_length() - 1  # the largest k with 2^k <= length\n    return min(table[k][l], table[k][r - (1 << k) + 1])' },
        'The trick works for every *idempotent* operation, where `x op x = x`: minimum, maximum, gcd, bitwise AND and OR. It does not work for sums (an overlap would count some numbers twice). The table has `n log n` numbers, about 640 thousand for 40000 values. The price of the O(1) questions is that the list cannot change.'
      ]
    },
    statement: ['A list of `n` numbers (it does not change) and `q` questions are given. For every question `l r` print the smallest number among the positions `l` to `r`. Print the answers on one line.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: '5 3\n4 2 7 1 9\n1 3\n3 5\n2 2\n', note: 'The smallest of 4 2 7 is 2, of 7 1 9 is 1, and of the single cell 2 is 2: 2 1 2.' }],
    hints: ['table[j][i] is the minimum of the 2^j numbers starting at i.', 'Two blocks of length 2^k cover a range of length at least 2^k; they may overlap.', 'k is the floor of log2 of the length of the range.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'qs:int[q][2]'],
      fast: true,
      python: r`
        table = [a[:]]
        j = 1
        while (1 << j) <= n:
            prev = table[-1]
            half = 1 << (j - 1)
            table.append([min(prev[i], prev[i + half]) for i in range(n - (1 << j) + 1)])
            j += 1
        out = []
        for l, rr in qs:
            k = (rr - l + 1).bit_length() - 1
            row = table[k]
            out.append(min(row[l - 1], row[rr - (1 << k)]))
        print(*out)`,
      cpp: r`
        int cn = (int)n;
        vector<vector<long long>> table;
        table.push_back(a);
        for (int j = 1; (1 << j) <= cn; j++) {
            int half = 1 << (j - 1);
            vector<long long> row(cn - (1 << j) + 1);
            for (int i = 0; i < (int)row.size(); i++) row[i] = min(table[j - 1][i], table[j - 1][i + half]);
            table.push_back(row);
        }
        string out;
        for (long long t = 0; t < q; t++) {
            int l = (int)qs[t][0], rr = (int)qs[t][1];
            int k = 31 - __builtin_clz(rr - l + 1);
            if (t) out += " ";
            out += to_string(min(table[k][l - 1], table[k][rr - (1 << k)]));
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        int levels = 1;
        while ((1 << levels) <= cn) levels++;
        long[][] table = new long[levels][];
        table[0] = a.clone();
        for (int j = 1; j < levels; j++) {
            int half = 1 << (j - 1);
            table[j] = new long[cn - (1 << j) + 1];
            for (int i = 0; i < table[j].length; i++) table[j][i] = Math.min(table[j - 1][i], table[j - 1][i + half]);
        }
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            int l = (int) qs[t][0], rr = (int) qs[t][1];
            int k = 31 - Integer.numberOfLeadingZeros(rr - l + 1);
            if (t > 0) out.append(" ");
            out.append(Math.min(table[k][l - 1], table[k][rr - (1 << k)]));
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>', '<vector>']
    },
    solution: { explanation: ['A sparse table stores the minimum of every block of length 2^j; a question takes the minimum of the two overlapping blocks of length 2^k (k = floor(log2 of the length)) that cover the range.'], complexity: 'Preparation O(n log n), each question O(1).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const out = []; // blocks of 64 with their minima, and a scan inside the partial blocks
      const B = 64; const bm = []; for (let i = 0; i < n; i += B) bm.push(Math.min(...a.slice(i, i + B))); for (let k = 0; k < q; k++) { const [l, rr] = nums(rs[2 + k]); let m = Infinity; let i = l - 1; while (i < rr && i % B !== 0) m = Math.min(m, a[i++]); while (i + B <= rr) { m = Math.min(m, bm[i / B]); i += B; } while (i < rr) m = Math.min(m, a[i++]); out.push(m); } return out.join(' ');
    },
    tests() {
      const g = rng(4601); const out = ['5 3\n4 2 7 1 9\n1 3\n3 5\n2 2\n', '1 1\n5\n1 1\n'];
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); return many(q, (k) => { const [l, rr] = nums(rs[2 + k]); return Math.min(...a.slice(l - 1, rr)); }).join(' '); };
      crossCheck(() => staticQueries(g, randInt(g, 1, 12), randInt(g, 1, 12), 9), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000000], [40000, 40000, 1000000000], [40000, 40000, 5], [39999, 40000, 1000000000]]) out.push(staticQueries(g, n, q, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of values and the number of questions.', 'The second line has `n` numbers.', 'Each of the next `q` lines has two numbers `l` and `r`: the question asks for the greatest common divisor of the numbers at the positions `l` to `r`.'],
    constraints: ['1 <= n, q <= 40000', '1 <= each number <= 10^9', '1 <= l <= r <= n'],
    slug: 'gcd-of-many-ranges',
    title: 'The Greatest Common Divisor of Each of Many Ranges',
    tags: ['sparse-table', 'gcd', 'static-queries', 'idempotent'],
    concept: {
      title: 'The gcd is idempotent, gcd(x, x) = x, so overlapping blocks of a sparse table give the right answer',
      body: [
        'A list of positive numbers never changes, and each question asks for the **greatest common divisor** of the numbers from `l` to `r`. For `12 18 30 8` the gcd of the positions 1 to 3 is 6. Computing the gcd of a range from scratch costs O(r - l) gcd steps per question.',
        'The sparse table from the problem about the smallest number works here as well, with `gcd` in place of `min`. Level `j` holds the gcd of every block of `2^j` numbers, and a question takes the gcd of the **two overlapping blocks** of length `2^k` that cover the range. Overlapping is safe because `gcd(x, x) = x`: a number that appears in both blocks does not change the common divisor. This is the property that makes a sparse table valid for minimum, maximum, gcd, AND and OR, and invalid for sums and products.',
        { code: 'table = [a[:]]\nj = 1\nwhile (1 << j) <= n:\n    prev, half = table[-1], 1 << (j - 1)\n    table.append([gcd(prev[i], prev[i + half]) for i in range(n - (1 << j) + 1)])\n    j += 1\n\nk = (r - l + 1).bit_length() - 1\nanswer = gcd(table[k][l], table[k][r - (1 << k) + 1])' },
        'The preparation computes about `n log n` gcds, each O(log max) in the worst case, and every question computes one gcd. The memory is `n log n` numbers. For a list that changes, the segment tree is the right tool; for a list that does not, the sparse table is shorter and faster to query.'
      ]
    },
    statement: ['A list of `n` positive numbers (it does not change) and `q` questions are given. For every question `l r` print the greatest common divisor of the numbers at the positions `l` to `r`. Print the answers on one line.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: '4 3\n12 18 30 8\n1 3\n1 4\n3 4\n', note: 'gcd(12, 18, 30) = 6, gcd of all four is 2 and gcd(30, 8) = 2: 6 2 2.' }],
    hints: ['Build the same table as for the minimum, but combine with gcd.', 'gcd(x, x) = x, so the two blocks may overlap.', 'The answer is the gcd of two entries of the level k.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'qs:int[q][2]'],
      fast: true,
      helpers: {
        python: r`
          def gcd(a, b):
              while b:
                  a, b = b, a % b
              return a`,
        cpp: r`
          long long gcdOf(long long a, long long b) {
              while (b) {
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
        table = [a[:]]
        j = 1
        while (1 << j) <= n:
            prev = table[-1]
            half = 1 << (j - 1)
            table.append([gcd(prev[i], prev[i + half]) for i in range(n - (1 << j) + 1)])
            j += 1
        out = []
        for l, rr in qs:
            k = (rr - l + 1).bit_length() - 1
            row = table[k]
            out.append(gcd(row[l - 1], row[rr - (1 << k)]))
        print(*out)`,
      cpp: r`
        int cn = (int)n;
        vector<vector<long long>> table;
        table.push_back(a);
        for (int j = 1; (1 << j) <= cn; j++) {
            int half = 1 << (j - 1);
            vector<long long> row(cn - (1 << j) + 1);
            for (int i = 0; i < (int)row.size(); i++) row[i] = gcdOf(table[j - 1][i], table[j - 1][i + half]);
            table.push_back(row);
        }
        string out;
        for (long long t = 0; t < q; t++) {
            int l = (int)qs[t][0], rr = (int)qs[t][1];
            int k = 31 - __builtin_clz(rr - l + 1);
            if (t) out += " ";
            out += to_string(gcdOf(table[k][l - 1], table[k][rr - (1 << k)]));
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        int levels = 1;
        while ((1 << levels) <= cn) levels++;
        long[][] table = new long[levels][];
        table[0] = a.clone();
        for (int j = 1; j < levels; j++) {
            int half = 1 << (j - 1);
            table[j] = new long[cn - (1 << j) + 1];
            for (int i = 0; i < table[j].length; i++) table[j][i] = gcdOf(table[j - 1][i], table[j - 1][i + half]);
        }
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            int l = (int) qs[t][0], rr = (int) qs[t][1];
            int k = 31 - Integer.numberOfLeadingZeros(rr - l + 1);
            if (t > 0) out.append(" ");
            out.append(gcdOf(table[k][l - 1], table[k][rr - (1 << k)]));
        }
        System.out.println(out);`,
      includes: ['<string>', '<vector>']
    },
    solution: { explanation: ['A sparse table of gcds of blocks of length 2^j; a question takes the gcd of the two overlapping blocks of length 2^k covering the range, which is valid because gcd is idempotent.'], complexity: 'Preparation O(n log n log max), each question O(log max).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); // a segment tree of gcds
      let size = 1; while (size < n) size *= 2; const t = new Array(2 * size).fill(0); a.forEach((v, i) => { t[size + i] = v; }); for (let v = size - 1; v >= 1; v--) t[v] = gcd(t[2 * v], t[2 * v + 1]); const out = []; for (let k = 0; k < q; k++) { let [l, rr] = nums(rs[2 + k]); l += size - 1; rr += size; let res = 0; while (l < rr) { if (l & 1) res = gcd(res, t[l++]); if (rr & 1) res = gcd(res, t[--rr]); l >>= 1; rr >>= 1; } out.push(res); } return out.join(' ');
    },
    tests() {
      const g = rng(4602); const out = ['4 3\n12 18 30 8\n1 3\n1 4\n3 4\n', '1 1\n7\n1 1\n'];
      const smooth = (n, q, base) => `${n} ${q}\n${many(n, () => base * randInt(g, 1, Math.max(1, Math.min(1000, Math.floor(1000000000 / base))))).join(' ')}\n${many(q, () => { const l = randInt(g, 1, n); return `${l} ${randInt(g, l, n)}`; }).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); return many(q, (k) => { const [l, rr] = nums(rs[2 + k]); let res = 0; for (let i = l - 1; i < rr; i++) res = gcd(res, a[i]); return res; }).join(' '); };
      crossCheck(() => smooth(randInt(g, 1, 12), randInt(g, 1, 12), randInt(g, 1, 6)), (i) => this.solve(i), brute, 800);
      for (const [n, q, base] of [[10, 10, 6], [100, 100, 12], [1000, 1000, 360], [40000, 40000, 1], [40000, 40000, 720720], [40000, 40000, 30], [39999, 40000, 1000000]]) out.push(smooth(n, q, base));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of values and the number of questions.', 'The second line has `n` numbers.', 'Each of the next `q` lines has two numbers `l` and `r`: the question asks for the difference between the largest and the smallest number among the positions `l` to `r`.'],
    constraints: ['1 <= n, q <= 40000', '1 <= each number <= 10^9', '1 <= l <= r <= n'],
    slug: 'spread-of-many-ranges',
    title: 'The Difference Between the Largest and the Smallest in Each Range',
    tags: ['sparse-table', 'range-maximum', 'range-minimum', 'static-queries'],
    concept: {
      title: 'Two sparse tables, one for the maximum and one for the minimum, give the spread of any range in O(1)',
      body: [
        'For a list that never changes, each question gives a range and asks for its **spread**: the largest number minus the smallest number in the range. For `4 2 7 1 9` the spread of the positions 1 to 3 is `7 - 2 = 5`, and of the positions 3 to 5 it is `9 - 1 = 8`. The spread is not an idempotent operation by itself (it cannot be combined from two overlapping blocks directly), but it is built from two idempotent ones.',
        'Build **two** sparse tables over the list: `mx` for the maximum and `mn` for the minimum. For a question take `k = floor(log2(r - l + 1))`; the largest number of the range is `max(mx[k][l], mx[k][r - 2^k + 1])` and the smallest is `min(mn[k][l], mn[k][r - 2^k + 1])`. The answer is their difference. Each table is the table of the previous problems with `max` and `min`.',
        { code: 'mx = sparse table with max; mn = sparse table with min\nk = (r - l + 1).bit_length() - 1\nhi = max(mx[k][l], mx[k][r - (1 << k) + 1])\nlo = min(mn[k][l], mn[k][r - (1 << k) + 1])\nanswer = hi - lo' },
        'Two tables use twice the memory (about 1.3 million numbers for 40000 values) but each question is still O(1). The idea of splitting a quantity into parts that the sparse table can combine is useful in many "range statistic" problems: for example the range of values, or whether a range contains only distinct values (with another preprocessing).'
      ]
    },
    statement: ['A list of `n` numbers (it does not change) and `q` questions are given. For every question `l r` print the largest number minus the smallest number among the positions `l` to `r`. Print the answers on one line.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: '5 3\n4 2 7 1 9\n1 3\n3 5\n2 2\n', note: 'The spreads are 7 - 2 = 5, 9 - 1 = 8 and 2 - 2 = 0: 5 8 0.' }],
    hints: ['Keep one sparse table for the maximum and one for the minimum.', 'Use the same two overlapping blocks for both tables.', 'The answer is the maximum minus the minimum.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'qs:int[q][2]'],
      fast: true,
      python: r`
        mx = [a[:]]
        mn = [a[:]]
        j = 1
        while (1 << j) <= n:
            pmx, pmn = mx[-1], mn[-1]
            half = 1 << (j - 1)
            cnt = n - (1 << j) + 1
            mx.append([max(pmx[i], pmx[i + half]) for i in range(cnt)])
            mn.append([min(pmn[i], pmn[i + half]) for i in range(cnt)])
            j += 1
        out = []
        for l, rr in qs:
            k = (rr - l + 1).bit_length() - 1
            hi = max(mx[k][l - 1], mx[k][rr - (1 << k)])
            lo = min(mn[k][l - 1], mn[k][rr - (1 << k)])
            out.append(hi - lo)
        print(*out)`,
      cpp: r`
        int cn = (int)n;
        vector<vector<long long>> mx, mn;
        mx.push_back(a);
        mn.push_back(a);
        for (int j = 1; (1 << j) <= cn; j++) {
            int half = 1 << (j - 1);
            int cnt = cn - (1 << j) + 1;
            vector<long long> rowMax(cnt), rowMin(cnt);
            for (int i = 0; i < cnt; i++) {
                rowMax[i] = max(mx[j - 1][i], mx[j - 1][i + half]);
                rowMin[i] = min(mn[j - 1][i], mn[j - 1][i + half]);
            }
            mx.push_back(rowMax);
            mn.push_back(rowMin);
        }
        string out;
        for (long long t = 0; t < q; t++) {
            int l = (int)qs[t][0], rr = (int)qs[t][1];
            int k = 31 - __builtin_clz(rr - l + 1);
            long long hi = max(mx[k][l - 1], mx[k][rr - (1 << k)]);
            long long lo = min(mn[k][l - 1], mn[k][rr - (1 << k)]);
            if (t) out += " ";
            out += to_string(hi - lo);
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        int levels = 1;
        while ((1 << levels) <= cn) levels++;
        long[][] mx = new long[levels][];
        long[][] mn = new long[levels][];
        mx[0] = a.clone();
        mn[0] = a.clone();
        for (int j = 1; j < levels; j++) {
            int half = 1 << (j - 1);
            int cnt = cn - (1 << j) + 1;
            mx[j] = new long[cnt];
            mn[j] = new long[cnt];
            for (int i = 0; i < cnt; i++) {
                mx[j][i] = Math.max(mx[j - 1][i], mx[j - 1][i + half]);
                mn[j][i] = Math.min(mn[j - 1][i], mn[j - 1][i + half]);
            }
        }
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            int l = (int) qs[t][0], rr = (int) qs[t][1];
            int k = 31 - Integer.numberOfLeadingZeros(rr - l + 1);
            long hi = Math.max(mx[k][l - 1], mx[k][rr - (1 << k)]);
            long lo = Math.min(mn[k][l - 1], mn[k][rr - (1 << k)]);
            if (t > 0) out.append(" ");
            out.append(hi - lo);
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>', '<vector>']
    },
    solution: { explanation: ['Two sparse tables (maximum and minimum) give the largest and smallest numbers of a range from two overlapping blocks; the answer is their difference.'], complexity: 'Preparation O(n log n), each question O(1).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); // a monotonic scan is not available for arbitrary ranges; use blocks of 64 with their maxima and minima
      const B = 64; const bmx = [], bmn = []; for (let i = 0; i < n; i += B) { const part = a.slice(i, i + B); bmx.push(Math.max(...part)); bmn.push(Math.min(...part)); } const out = []; for (let k = 0; k < q; k++) { const [l, rr] = nums(rs[2 + k]); let hi = -Infinity, lo = Infinity; let i = l - 1; while (i < rr && i % B !== 0) { hi = Math.max(hi, a[i]); lo = Math.min(lo, a[i]); i++; } while (i + B <= rr) { hi = Math.max(hi, bmx[i / B]); lo = Math.min(lo, bmn[i / B]); i += B; } while (i < rr) { hi = Math.max(hi, a[i]); lo = Math.min(lo, a[i]); i++; } out.push(hi - lo); } return out.join(' ');
    },
    tests() {
      const g = rng(4603); const out = ['5 3\n4 2 7 1 9\n1 3\n3 5\n2 2\n', '1 1\n5\n1 1\n'];
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); return many(q, (k) => { const [l, rr] = nums(rs[2 + k]); const part = a.slice(l - 1, rr); return Math.max(...part) - Math.min(...part); }).join(' '); };
      crossCheck(() => staticQueries(g, randInt(g, 1, 12), randInt(g, 1, 12), 9), (i) => this.solve(i), brute, 800);
      for (const [n, q, hi] of [[10, 10, 100], [100, 100, 1000], [1000, 1000, 1000000000], [40000, 40000, 1000000000], [40000, 40000, 5], [39999, 40000, 1000000000]]) out.push(staticQueries(g, n, q, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of nodes and the number of operations.', 'The second line has `n` numbers: the parent of every node (0 for the root, which is the node 1; the parent of a node has a smaller number).', 'The third line has `n` numbers: the values of the nodes.', 'Each of the next `q` lines has three numbers `t`, `v` and `x`. If `t = 1`, add `x` to the value of the node `v` (`x` is the added number). If `t = 2`, print the sum of the values on the path from the root to the node `v` (`x` is 0).'],
    constraints: ['1 <= n, q <= 30000', '|each value| <= 10^6, |x| <= 10^6'],
    slug: 'path-sum-from-the-root-with-changes',
    title: 'The Sum of the Values on the Way From the Root, With Changes',
    tags: ['fenwick-tree', 'euler-tour', 'tree', 'range-update'],
    concept: {
      title: 'Number the nodes in the order of a depth-first walk: a subtree is then one range, and a change of a node is a range addition',
      body: [
        'A rooted tree has a number written in every node. An operation **adds a number to the value of one node**, and a question asks for the **sum of the values of all the nodes on the way from the root down to a node `v`** (both ends included). For a path `1 - 2 - 3` with the values `5, 1, 4`, the sum to the node 3 is 10; after adding 10 to the node 2 it is 20. Walking up from `v` to the root costs O(depth) per question, which is O(n) on a long chain.',
        'The *Euler tour* trick: number the nodes `0..n-1` in the order of a depth-first walk (preorder), `tin[v]`, and let `size[v]` be the number of nodes in the subtree of `v`. The subtree of `v` is exactly the range `tin[v] .. tin[v] + size[v] - 1`. Adding `x` to the value of `v` changes the root-path sum of **every node in the subtree of `v`** (and of no other node) by `x`. So the operation is a **range addition** on the positions of the subtree, and a question is a **point query** at `tin[v]`: the structure is the Fenwick tree for "range add, point query" (a tree of differences). Keep also the starting path sum `init[v] = init[parent] + value[v]`, computed once.',
        { code: 'order the nodes so that every parent comes before its children  (guaranteed by the input)\nsize[v]: add the size of every node to its parent, from the last node to the first\ntin[v]: the first child gets the parent\'s tin + 1, the next gets the previous sibling\'s tin + size ...\ninit[v] = init[parent[v]] + value[v]\n\nadd x to the node v:   bit_add(t, tin[v] + 1, x);  bit_add(t, tin[v] + size[v] + 1, -x)\nquestion for v:        init[v] + bit_sum(t, tin[v] + 1)' },
        'The numbering can be done without recursion because the parent of every node has a smaller number: process the nodes in increasing order, keeping for each node the next free position `nxt[parent]`. Everything is O((n + q) log n). The same Euler-tour numbering turns many tree questions (sums over subtrees, changes of subtrees) into questions about ranges.'
      ]
    },
    statement: ['A rooted tree with `n` nodes (the root is the node 1, and the parent of every node has a smaller number) has a value in every node. Process `q` operations: type 1 `v x` adds `x` to the value of the node `v`; type 2 `v 0` asks for the sum of the values of all nodes on the path from the root to the node `v`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '3 3\n0 1 2\n5 1 4\n2 3 0\n1 2 10\n2 3 0\n', note: 'The path 1 - 2 - 3 has the sum 5 + 1 + 4 = 10; after the addition 5 + 11 + 4 = 20: 10 20.' }],
    hints: ['Number the nodes in a depth-first order; a subtree is a range.', 'Adding to a node adds to the whole subtree range of root-path sums.', 'Use a Fenwick tree of differences for range add and point query, plus the initial path sums.'],
    program: {
      io: ['n:int q:int', 'par:int[n]', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      helpers: FENWICK,
      python: r`
        sz = [1] * (n + 1)
        for v in range(n, 1, -1):
            sz[par[v - 1]] += sz[v]
        tin = [0] * (n + 1)
        nxt = [0] * (n + 1)
        nxt[1] = 1
        init = [0] * (n + 1)
        init[1] = a[0]
        for v in range(2, n + 1):
            p = par[v - 1]
            tin[v] = nxt[p]
            nxt[p] += sz[v]
            nxt[v] = tin[v] + 1
            init[v] = init[p] + a[v - 1]
        t = [0] * (n + 2)
        out = []
        for kind, v, x in ops:
            if kind == 1:
                bit_add(t, tin[v] + 1, x)
                bit_add(t, tin[v] + sz[v] + 1, -x)
            else:
                out.append(init[v] + bit_sum(t, tin[v] + 1))
        print(*out)`,
      cpp: r`
        int cn = (int)n;
        vector<long long> sz(cn + 1, 1), tin(cn + 1, 0), nxt(cn + 1, 0), init(cn + 1, 0);
        for (int v = cn; v >= 2; v--) sz[par[v - 1]] += sz[v];
        nxt[1] = 1;
        init[1] = a[0];
        for (int v = 2; v <= cn; v++) {
            long long p = par[v - 1];
            tin[v] = nxt[p];
            nxt[p] += sz[v];
            nxt[v] = tin[v] + 1;
            init[v] = init[p] + a[v - 1];
        }
        vector<long long> t(cn + 2, 0);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], v = ops[k][1], x = ops[k][2];
            if (kind == 1) {
                bitAdd(t, tin[v] + 1, x);
                bitAdd(t, tin[v] + sz[v] + 1, -x);
            } else {
                if (!out.empty()) out += " ";
                out += to_string(init[v] + bitSum(t, tin[v] + 1));
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        long[] sz = new long[cn + 1];
        long[] tin = new long[cn + 1];
        long[] nxt = new long[cn + 1];
        long[] init = new long[cn + 1];
        java.util.Arrays.fill(sz, 1);
        for (int v = cn; v >= 2; v--) sz[(int) par[v - 1]] += sz[v];
        nxt[1] = 1;
        init[1] = a[0];
        for (int v = 2; v <= cn; v++) {
            int p = (int) par[v - 1];
            tin[v] = nxt[p];
            nxt[p] += sz[v];
            nxt[v] = tin[v] + 1;
            init[v] = init[p] + a[v - 1];
        }
        long[] t = new long[cn + 2];
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int v = (int) ops[k][1];
            long x = ops[k][2];
            if (kind == 1) {
                bitAdd(t, (int) tin[v] + 1, x);
                bitAdd(t, (int) (tin[v] + sz[v]) + 1, -x);
            } else {
                if (out.length() > 0) out.append(" ");
                out.append(init[v] + bitSum(t, (int) tin[v] + 1));
            }
        }
        System.out.println(out);`,
      includes: ['<string>', '<vector>']
    },
    solution: { explanation: ['The nodes are numbered in depth-first order so that every subtree is a range; adding to a node is a range addition on its subtree in a Fenwick tree of differences, and the path sum of a node is its initial path sum plus the point value at its position.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const par = nums(rs[1]); const a = nums(rs[2]); const out = []; // walk up to the root for every question
      for (let k = 0; k < q; k++) { const [t, v, x] = nums(rs[3 + k]); if (t === 1) a[v - 1] += x; else { let s = 0, u = v; while (u !== 0) { s += a[u - 1]; u = par[u - 1]; } out.push(s); } } return out.join(' ');
    },
    tests() {
      const g = rng(4604); const out = ['3 3\n0 1 2\n5 1 4\n2 3 0\n1 2 10\n2 3 0\n', '1 2\n0\n7\n2 1 0\n1 1 -7\n'];
      const make = (n, q, shape, hi) => { const p = parents(g, n, shape); const ops = many(q, () => (g() < 0.5 ? [1, randInt(g, 1, n), randInt(g, -hi, hi)] : [2, randInt(g, 1, n), 0])); ops.push([2, n, 0]); return `${n} ${ops.length}\n${p.join(' ')}\n${randArray(g, n, -hi, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => this.solve(input);
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), ['random', 'path', 'star'][randInt(g, 0, 2)], 20), (i) => this.solve(i), brute, 100);
      const fast = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const par = nums(rs[1]); const a = nums(rs[2]); const { sz, tin } = euler(par); const init = new Array(n + 1).fill(0); init[1] = a[0]; for (let v = 2; v <= n; v++) init[v] = init[par[v - 1]] + a[v - 1]; const f = new Fen(n + 1); const res = []; for (let k = 0; k < q; k++) { const [t, v, x] = nums(rs[3 + k]); if (t === 1) { f.add(tin[v] + 1, x); f.add(tin[v] + sz[v] + 1, -x); } else res.push(init[v] + f.sum(tin[v] + 1)); } return res.join(' '); };
      for (let rep = 0; rep < 60; rep++) { const input = make(randInt(g, 1, 300), randInt(g, 1, 300), ['random', 'path', 'star', 'deep'][randInt(g, 0, 3)], 1000); if (fast(input) !== this.solve(input)) throw new Error('the Euler tour method differs from the walk to the root'); }
      for (const [n, q, shape, hi] of [[10, 10, 'random', 100], [100, 100, 'deep', 1000], [1000, 1000, 'random', 1000000], [30000, 29999, 'random', 1000000], [30000, 29999, 'path', 1000000], [30000, 29999, 'star', 1000000], [29999, 29999, 'deep', 1000000]]) out.push(make(n, q, shape, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `q`: the number of nodes and the number of operations.', 'The second line has `n` numbers: the parent of every node (0 for the root, which is the node 1; the parent of a node has a smaller number).', 'The third line has `n` numbers: the values of the nodes.', 'Each of the next `q` lines has three numbers `t`, `v` and `x`. If `t = 1`, set the value of the node `v` to `x`. If `t = 2`, print the largest value in the subtree of the node `v` (`x` is 0).'],
    constraints: ['1 <= n, q <= 30000', '|each value| <= 10^9'],
    slug: 'largest-value-in-a-subtree-with-changes',
    title: 'The Largest Value in a Subtree, With Changes',
    tags: ['segment-tree', 'euler-tour', 'tree', 'subtree-query'],
    concept: {
      title: 'After numbering the nodes in a depth-first order, the subtree of a node is a range of positions, and a segment tree answers its maximum',
      body: [
        'A rooted tree has a number in every node. An operation **replaces the value of a node**, and a question asks for the **largest value in the subtree of a node** (the node itself and all its descendants). For the tree with the root 1 and its children 2 and 3, with the values `4, 9, 2`, the largest value in the subtree of the root is 9, and in the subtree of the node 3 it is 2. Collecting the values of a subtree for every question costs O(size of the subtree).',
        'Number the nodes in the order of a depth-first walk (the *Euler tour*). Then the subtree of `v` occupies the **consecutive positions** `tin[v] .. tin[v] + size[v] - 1`. The question turns into "what is the largest number in this range of positions?", which a segment tree answers in O(log n), and a change of a node value is a change of one cell at the position `tin[v]`. The numbering needs no recursion here, because the parent of every node has a smaller number: the sizes are collected from the last node to the first, and the positions are handed out from the first node to the last.',
        { code: 'size[v] = 1 + the sizes of its children      # add each node to its parent, last node first\ntin[1] = 0; nxt[1] = 1\nfor v in 2 .. n:\n    tin[v] = nxt[parent[v]]; nxt[parent[v]] += size[v]; nxt[v] = tin[v] + 1\nleaf[tin[v]] = value[v]\n# change:    set the leaf at tin[v]\n# question:  the maximum over the positions tin[v] .. tin[v] + size[v] - 1' },
        'Each operation costs O(log n). The same numbering supports "sum of a subtree", "add to a subtree" and "count nodes with a property in a subtree" with the matching structure (a Fenwick or a segment tree) over the positions.'
      ]
    },
    statement: ['A rooted tree with `n` nodes (the root is the node 1, and the parent of every node has a smaller number) has a value in every node. Process `q` operations: type 1 `v x` sets the value of the node `v` to `x`; type 2 `v 0` asks for the largest value among the node `v` and all its descendants. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '3 3\n0 1 1\n4 9 2\n2 1 0\n2 3 0\n1 2 1\n', note: 'The largest value in the whole tree is 9, and in the subtree of the node 3 it is 2: 9 2.' }],
    hints: ['Number the nodes in depth-first order so that every subtree is a range.', 'Compute the sizes from the last node to the first, since parents have smaller numbers.', 'Use a maximum segment tree over the positions.'],
    program: {
      io: ['n:int q:int', 'par:int[n]', 'a:int[n]', 'ops:int[q][3]'],
      fast: true,
      python: r`
        sz = [1] * (n + 1)
        for v in range(n, 1, -1):
            sz[par[v - 1]] += sz[v]
        tin = [0] * (n + 1)
        nxt = [0] * (n + 1)
        nxt[1] = 1
        for v in range(2, n + 1):
            p = par[v - 1]
            tin[v] = nxt[p]
            nxt[p] += sz[v]
            nxt[v] = tin[v] + 1
        size = 1
        while size < n:
            size *= 2
        low = -(1 << 62)
        tree = [low] * (2 * size)
        for v in range(1, n + 1):
            tree[size + tin[v]] = a[v - 1]
        for v in range(size - 1, 0, -1):
            tree[v] = max(tree[2 * v], tree[2 * v + 1])
        out = []
        for kind, v, x in ops:
            if kind == 1:
                u = size + tin[v]
                tree[u] = x
                u //= 2
                while u:
                    tree[u] = max(tree[2 * u], tree[2 * u + 1])
                    u //= 2
            else:
                lo = size + tin[v]
                hi = lo + sz[v]
                res = low
                while lo < hi:
                    if lo & 1:
                        res = max(res, tree[lo])
                        lo += 1
                    if hi & 1:
                        hi -= 1
                        res = max(res, tree[hi])
                    lo //= 2
                    hi //= 2
                out.append(res)
        print(*out)`,
      cpp: r`
        int cn = (int)n;
        vector<long long> sz(cn + 1, 1), tin(cn + 1, 0), nxt(cn + 1, 0);
        for (int v = cn; v >= 2; v--) sz[par[v - 1]] += sz[v];
        nxt[1] = 1;
        for (int v = 2; v <= cn; v++) {
            long long p = par[v - 1];
            tin[v] = nxt[p];
            nxt[p] += sz[v];
            nxt[v] = tin[v] + 1;
        }
        long long size = 1;
        while (size < cn) size *= 2;
        const long long LOW = -(1LL << 62);
        vector<long long> tree(2 * size, LOW);
        for (int v = 1; v <= cn; v++) tree[size + tin[v]] = a[v - 1];
        for (long long v = size - 1; v >= 1; v--) tree[v] = max(tree[2 * v], tree[2 * v + 1]);
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], v = ops[k][1], x = ops[k][2];
            if (kind == 1) {
                long long u = size + tin[v];
                tree[u] = x;
                for (u /= 2; u >= 1; u /= 2) tree[u] = max(tree[2 * u], tree[2 * u + 1]);
            } else {
                long long lo = size + tin[v], hi = lo + sz[v], res = LOW;
                while (lo < hi) {
                    if (lo & 1) res = max(res, tree[lo++]);
                    if (hi & 1) res = max(res, tree[--hi]);
                    lo /= 2;
                    hi /= 2;
                }
                if (!out.empty()) out += " ";
                out += to_string(res);
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        long[] sz = new long[cn + 1];
        long[] tin = new long[cn + 1];
        long[] nxt = new long[cn + 1];
        java.util.Arrays.fill(sz, 1);
        for (int v = cn; v >= 2; v--) sz[(int) par[v - 1]] += sz[v];
        nxt[1] = 1;
        for (int v = 2; v <= cn; v++) {
            int p = (int) par[v - 1];
            tin[v] = nxt[p];
            nxt[p] += sz[v];
            nxt[v] = tin[v] + 1;
        }
        int size = 1;
        while (size < cn) size *= 2;
        long low = -(1L << 62);
        long[] tree = new long[2 * size];
        java.util.Arrays.fill(tree, low);
        for (int v = 1; v <= cn; v++) tree[size + (int) tin[v]] = a[v - 1];
        for (int v = size - 1; v >= 1; v--) tree[v] = Math.max(tree[2 * v], tree[2 * v + 1]);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0];
            int v = (int) ops[k][1];
            long x = ops[k][2];
            if (kind == 1) {
                int u = size + (int) tin[v];
                tree[u] = x;
                for (u /= 2; u >= 1; u /= 2) tree[u] = Math.max(tree[2 * u], tree[2 * u + 1]);
            } else {
                int lo = size + (int) tin[v];
                int hi = lo + (int) sz[v];
                long res = low;
                while (lo < hi) {
                    if ((lo & 1) == 1) res = Math.max(res, tree[lo++]);
                    if ((hi & 1) == 1) res = Math.max(res, tree[--hi]);
                    lo /= 2;
                    hi /= 2;
                }
                if (out.length() > 0) out.append(" ");
                out.append(res);
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>', '<vector>']
    },
    solution: { explanation: ['The nodes are numbered in depth-first order so that every subtree is a range of positions; a maximum segment tree over these positions answers the largest value of a subtree and supports changing a node.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const par = nums(rs[1]); const a = nums(rs[2]); const { sz, tin } = euler(par); const pos = new Array(n).fill(0); for (let v = 1; v <= n; v++) pos[tin[v]] = v; // scan the range of positions of the subtree
      const out = []; for (let k = 0; k < q; k++) { const [t, v, x] = nums(rs[3 + k]); if (t === 1) a[v - 1] = x; else { let m = -Infinity; for (let i = tin[v]; i < tin[v] + sz[v]; i++) m = Math.max(m, a[pos[i] - 1]); out.push(m); } } return out.join(' ');
    },
    tests() {
      const g = rng(4605); const out = ['3 3\n0 1 1\n4 9 2\n2 1 0\n2 3 0\n1 2 1\n', '1 2\n0\n7\n2 1 0\n1 1 -7\n'];
      const make = (n, q, shape, hi) => { const p = parents(g, n, shape); const ops = many(q, () => (g() < 0.5 ? [1, randInt(g, 1, n), randInt(g, -hi, hi)] : [2, randInt(g, 1, n), 0])); ops.push([2, 1, 0]); return `${n} ${ops.length}\n${p.join(' ')}\n${randArray(g, n, -hi, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const par = nums(rs[1]); const a = nums(rs[2]); const kids = Array.from({ length: n + 1 }, () => []); for (let v = 2; v <= n; v++) kids[par[v - 1]].push(v); const out = []; for (let k = 0; k < q; k++) { const [t, v, x] = nums(rs[3 + k]); if (t === 1) a[v - 1] = x; else { let m = -Infinity; const stack = [v]; while (stack.length) { const u = stack.pop(); m = Math.max(m, a[u - 1]); stack.push(...kids[u]); } out.push(m); } } return out.join(' '); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 12), ['random', 'path', 'star'][randInt(g, 0, 2)], 20), (i) => this.solve(i), brute, 800);
      for (const [n, q, shape, hi] of [[10, 10, 'random', 100], [100, 100, 'deep', 1000], [1000, 1000, 'random', 1000000000], [30000, 29999, 'random', 1000000000], [30000, 29999, 'path', 1000000000], [30000, 29999, 'star', 1000000000], [29999, 29999, 'deep', 1000000000]]) out.push(make(n, q, shape, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the word `a`.', 'The second line has the word `b`.'],
    constraints: ['1 <= length of a, length of b <= 40000', 'Both words consist of lowercase English letters.'],
    slug: 'longest-overlap-of-two-words',
    title: 'How Much Does the End of One Word Overlap the Start of the Other?',
    tags: ['kmp', 'prefix-function', 'overlap', 'strings'],
    concept: {
      title: 'The prefix function of b + a separator + a, read at its last position, is the longest suffix of a that is a prefix of b',
      body: [
        'Two words `a` and `b` are given. When the word `b` is glued after `a`, their ends can overlap: the last letters of `a` may be the same as the first letters of `b`. Find the **longest overlap**, that is, the length of the longest word that is a **suffix of `a`** and a **prefix of `b`**. For `a = abcab` and `b = cabxyz` the overlap is `cab` (3), so `a` and `b` can be glued as `abcabxyz`. For `a = abc` and `b = abc` it is 3, for `a = abc` and `b = xyz` it is 0.',
        'Write one word `c = b + "#" + a`, with a separator `#` that is not a letter. In the prefix function of `c`, the value at the last position is the length of the longest proper prefix of `c` that is also a suffix of `c`. A prefix of `c` that is also a suffix cannot contain the separator (the suffix part lies after it), so it is a prefix of `b` that is also a suffix of `a`: exactly the overlap. The separator also prevents the value from exceeding `|b|`.',
        { code: 'c = b + "#" + a\npi = prefix_function(c)\nprint(pi[-1])                   # the longest suffix of a that is a prefix of b' },
        'The time is O(|a| + |b|). The overlap is the key quantity in gluing words together, for example when building the shortest word that contains both of them (the next problems use this).'
      ]
    },
    statement: ['Two words `a` and `b` are given. Print the length of the longest word that is both a suffix of `a` and a prefix of `b` (0 if there is none).'],
    outputFormat: ['Print the length of the overlap.'],
    examples: [{ input: 'abcab\ncabxyz\n', note: 'The overlap is cab: 3.' }, { input: 'abc\nxyz\n', note: '0.' }],
    hints: ['Glue the words as b + "#" + a.', 'Compute the prefix function of the glued word.', 'The last value is the longest suffix of a that is a prefix of b.'],
    program: {
      io: ['a:word', 'b:word'],
      fast: true,
      helpers: PREFIX,
      python: r`
        c = b + "#" + a
        pi = prefix_function(c)
        print(pi[-1])`,
      cpp: r`
        string c = b + "#" + a;
        vector<int> pi = prefixFunction(c);
        cout << pi.back() << "\n";`,
      java: r`
        String c = b + "#" + a;
        int[] pi = prefixFunction(c);
        System.out.println(pi[pi.length - 1]);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The prefix function of b + "#" + a at its last position is the length of the longest prefix of b that is a suffix of a.'], complexity: 'Time O(|a| + |b|), space O(|a| + |b|).' },
    solve(input) {
      const [a, b] = rows(input); for (let L = Math.min(a.length, b.length); L >= 1; L--) if (a.endsWith(b.slice(0, L))) return String(L); return '0';
    },
    tests() {
      const g = rng(4606); const out = ['abcab\ncabxyz\n', 'abc\nxyz\n', 'a\na\n', 'abc\nabc\n', 'aaaa\naa\n'];
      const brute = (input) => this.solve(input);
      crossCheck(() => `${randWord(g, randInt(g, 1, 12), 'ab')}\n${randWord(g, randInt(g, 1, 12), 'ab')}\n`, (i) => this.solve(i), brute, 100);
      const glued = (n, m, ov, alpha) => { const mid = randWord(g, ov, alpha); return `${randWord(g, n - ov, alpha)}${mid}\n${mid}${randWord(g, m - ov, alpha)}\n`; };
      for (const [n, m, ov, alpha] of [[30, 20, 5, 'ab'], [1000, 800, 100, 'abc'], [40000, 40000, 12345, 'ab'], [40000, 39000, 0, 'abcdefghijklmnopqrstuvwxyz'], [40000, 40000, 40000, 'a']]) out.push(glued(n, m, ov, alpha));
      out.push(`${'a'.repeat(40000)}\n${'a'.repeat(39999)}b\n`, `${'ab'.repeat(20000)}\n${'ab'.repeat(20000)}\n`, `${fib(40000)}\n${fib(30000)}\n`, `x${'a'.repeat(39999)}\n${'a'.repeat(39999)}x\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `m`: the length of the list and the length of the pattern.', 'The second line has `n` numbers.', 'The third line has `m` numbers, each -1, 0 or 1: the pattern.'],
    constraints: ['2 <= n <= 40000', '1 <= m <= n - 1', '|each number| <= 10^9', 'Each number of the pattern is -1, 0 or 1.'],
    slug: 'subarrays-that-follow-a-pattern-of-ups-and-downs',
    title: 'Count the Subarrays That Follow a Pattern of Rises and Falls',
    tags: ['kmp', 'pattern-matching', 'arrays', 'sign-sequence'],
    concept: {
      title: 'Replace the list by the signs of the differences of neighbours; then it is ordinary pattern matching over a three-letter alphabet',
      body: [
        'A list of numbers and a *pattern* of `m` symbols are given, each symbol being `1` (the next number is larger), `0` (equal) or `-1` (smaller). A subarray of `m + 1` consecutive numbers **follows the pattern** if for every `k` the relation between its `k`-th and `(k + 1)`-th number is the one the pattern says. For the list `1 2 3 4 5 6` and the pattern `1 1` there are 4 such subarrays (each three consecutive numbers rise twice). Checking every start costs O(n * m).',
        'Turn the list into the list of **signs of the differences**: `d[i] = sign(a[i+1] - a[i])`, which has `n - 1` symbols from the alphabet `{-1, 0, 1}`. A subarray follows the pattern exactly when its `m` differences, which are `m` consecutive symbols of `d`, are **equal to the pattern**. So the question is to count the occurrences of the pattern in the sequence `d`, the string matching problem that KMP solves in linear time for any alphabet (here the "letters" are numbers).',
        { code: 'd = [sign(a[i + 1] - a[i]) for i in range(n - 1)]\npi = prefix function of the pattern (as a list of numbers)\nk = count = 0\nfor x in d:\n    while k and pat[k] != x: k = pi[k - 1]\n    if pat[k] == x: k += 1\n    if k == m:\n        count += 1\n        k = pi[k - 1]               # keep looking: occurrences may overlap\nprint(count)' },
        'Occurrences may overlap (for `1 1` on a rising list every window counts). The prefix function and the matcher work on arrays of numbers exactly as on strings; no separator is needed because the matcher is run on the text directly. Time O(n + m).'
      ]
    },
    statement: ['A list `a` of `n` numbers and a pattern of `m` symbols (each -1, 0 or 1) are given. A subarray of `m + 1` consecutive numbers follows the pattern if, for each `k` from 1 to `m`, the number `k + 1` of the subarray is larger than (pattern 1), equal to (pattern 0) or smaller than (pattern -1) the number `k`. Print the number of subarrays that follow the pattern.'],
    outputFormat: ['Print the number of subarrays.'],
    examples: [{ input: '6 2\n1 2 3 4 5 6\n1 1\n', note: 'The four windows of three numbers all rise twice: 4.' }, { input: '6 2\n1 4 4 3 2 1\n1 0\n', note: 'Only the window 1 4 4 rises and then stays: 1.' }],
    hints: ['Replace the list by the signs of the differences of neighbours.', 'Count the occurrences of the pattern in that sequence.', 'Use KMP on arrays of numbers; occurrences may overlap.'],
    program: {
      io: ['n:int m:int', 'a:int[n]', 'pat:int[m]'],
      fast: true,
      python: r`
        d = [(a[i + 1] > a[i]) - (a[i + 1] < a[i]) for i in range(n - 1)]
        pi = [0] * m
        for i in range(1, m):
            k = pi[i - 1]
            while k and pat[i] != pat[k]:
                k = pi[k - 1]
            if pat[i] == pat[k]:
                k += 1
            pi[i] = k
        k = 0
        count = 0
        for x in d:
            while k and pat[k] != x:
                k = pi[k - 1]
            if pat[k] == x:
                k += 1
            if k == m:
                count += 1
                k = pi[k - 1]
        print(count)`,
      cpp: r`
        int cn = (int)n, cm = (int)m;
        vector<int> d(cn - 1);
        for (int i = 0; i + 1 < cn; i++) d[i] = (a[i + 1] > a[i]) - (a[i + 1] < a[i]);
        vector<int> pi(cm, 0);
        for (int i = 1; i < cm; i++) {
            int k = pi[i - 1];
            while (k > 0 && pat[i] != pat[k]) k = pi[k - 1];
            if (pat[i] == pat[k]) k++;
            pi[i] = k;
        }
        int k = 0;
        long long count = 0;
        for (int x : d) {
            while (k > 0 && pat[k] != x) k = pi[k - 1];
            if (pat[k] == x) k++;
            if (k == cm) {
                count++;
                k = pi[k - 1];
            }
        }
        cout << count << "\n";`,
      java: r`
        int cn = (int) n, cm = (int) m;
        int[] d = new int[cn - 1];
        for (int i = 0; i + 1 < cn; i++) d[i] = Long.compare(a[i + 1], a[i]);
        int[] pi = new int[cm];
        for (int i = 1; i < cm; i++) {
            int k = pi[i - 1];
            while (k > 0 && pat[i] != pat[k]) k = pi[k - 1];
            if (pat[i] == pat[k]) k++;
            pi[i] = k;
        }
        int k = 0;
        long count = 0;
        for (int x : d) {
            while (k > 0 && pat[k] != x) k = pi[k - 1];
            if (pat[k] == x) k++;
            if (k == cm) {
                count++;
                k = pi[k - 1];
            }
        }
        System.out.println(count);`,
      includes: ['<vector>']
    },
    solution: { explanation: ['The list is replaced by the signs of the differences of neighbours, and KMP counts the occurrences of the pattern in that sequence, allowing overlaps.'], complexity: 'Time O(n + m), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const a = nums(rs[1]); const pat = nums(rs[2]); let c = 0; for (let i = 0; i + m < n; i++) { let ok = true; for (let k = 0; k < m; k++) if (Math.sign(a[i + k + 1] - a[i + k]) !== pat[k]) { ok = false; break; } if (ok) c++; } return String(c); // direct check of every start
    },
    tests() {
      const g = rng(4607); const out = ['6 2\n1 2 3 4 5 6\n1 1\n', '6 2\n1 4 4 3 2 1\n1 0\n', '2 1\n5 5\n0\n'];
      const brute = (input) => this.solve(input);
      const make = (n, m, hi, mode) => { const a = mode === 'rising' ? many(n, (i) => i) : mode === 'flat' ? many(n, () => 7) : mode === 'zigzag' ? many(n, (i) => (i % 2 ? 5 : 3)) : randArray(g, n, -hi, hi); const pat = mode === 'rising' ? new Array(m).fill(1) : mode === 'flat' ? new Array(m).fill(0) : mode === 'zigzag' ? many(m, (i) => (i % 2 ? -1 : 1)) : many(m, () => randInt(g, -1, 1)); return `${n} ${m}\n${a.join(' ')}\n${pat.join(' ')}\n`; };
      crossCheck(() => { const n = randInt(g, 2, 12); const a = randArray(g, n, 0, 2); const m = randInt(g, 1, n - 1); const start = randInt(g, 0, n - 1 - m); const pat = g() < 0.6 ? many(m, (k) => Math.sign(a[start + k + 1] - a[start + k])) : many(m, () => randInt(g, -1, 1)); return `${n} ${m}\n${a.join(' ')}\n${pat.join(' ')}\n`; }, (i) => this.solve(i), brute, 300);
      for (const [n, m, hi, mode] of [[20, 3, 5, 'random'], [1000, 4, 3, 'random'], [40000, 5, 2, 'random'], [40000, 20000, 0, 'rising'], [40000, 100, 0, 'flat'], [40000, 7, 0, 'zigzag'], [39999, 39998, 0, 'rising'], [40000, 12, 1000000000, 'random']]) out.push(make(n, m, hi, mode));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the text `t`.', 'The second line has the pattern `p`.', 'The third line has `q`: the number of questions.', 'Each of the next `q` lines has two numbers `l` and `r`: the question asks for the number of occurrences of `p` that lie completely inside the part of the text from `l` to `r`.'],
    constraints: ['1 <= length of p <= length of t <= 40000', '1 <= q <= 40000', '1 <= l <= r <= length of t', 'Both words consist of lowercase English letters.'],
    slug: 'occurrences-of-a-pattern-inside-ranges',
    title: 'How Many Occurrences of the Pattern Lie Inside a Part of the Text?',
    tags: ['kmp', 'prefix-sums', 'queries', 'pattern-matching'],
    concept: {
      title: 'Find all the occurrences once, then answer each range with a prefix count over their starting positions',
      body: [
        'A text `t` and a pattern `p` are given, and then many questions `l r`: **how many occurrences of `p` lie completely inside the part of the text from the position `l` to the position `r`?** For `t = ababab`, `p = ab` and the part 2..6 (`babab`), the occurrences start at the positions 3 and 5 (counting from 1), so the answer is 2; the occurrence at the position 1 is not inside. Searching the part with a new KMP run costs O(r - l) per question.',
        'Run KMP **once** to find the starting positions of all the occurrences of `p` in `t`. Let `pref[i]` be the number of occurrences that start at a position before `i` (a prefix count). An occurrence that starts at `s` (counting from 1) lies inside `[l, r]` exactly when `s >= l` and `s + m - 1 <= r`, that is, when `l <= s <= r - m + 1`. So the answer to a question is the number of starts in this window, `pref[r - m + 2] - pref[l]` (with the prefix counts counted from the position 1), and it is 0 when `r - l + 1 < m`.',
        { code: 'starts = positions where p occurs in t (counted from 1), found with the prefix function\npref = [0] * (n + 2)\nfor s in starts: pref[s] += 1          # then take the running sum: pref[i] = number of starts <= i\nfor i in range(1, n + 1): pref[i] += pref[i - 1]\n\nif r - l + 1 < m: answer 0\nelse: answer = pref[r - m + 1] - pref[l - 1]    # starts in [l, r - m + 1]' },
        'The search costs O(|t| + |p|), the prefix table O(|t|), and every question O(1). This pattern, "find the events once, count them in a window", is the basic way to combine a string algorithm with range questions.'
      ]
    },
    statement: ['A text `t`, a pattern `p` and `q` questions are given. For every question `l r` print the number of occurrences of `p` in `t` that lie completely inside the positions `l` to `r` of the text (counting from 1). Print the answers on one line.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: 'ababab\nab\n3\n1 6\n2 6\n1 3\n', note: 'The occurrences start at 1, 3, 5. Inside 1..6 there are 3, inside 2..6 there are 2 (starts 3 and 5), inside 1..3 there is 1: 3 2 1.' }],
    hints: ['Find all the starting positions of the pattern with KMP.', 'Build prefix counts over the starting positions.', 'An occurrence is inside [l, r] when l <= start <= r - m + 1.'],
    program: {
      io: ['t:word', 'p:word', 'q:int', 'qs:int[q][2]'],
      fast: true,
      helpers: PREFIX,
      python: r`
        n = len(t)
        m = len(p)
        c = p + "#" + t
        pi = prefix_function(c)
        pref = [0] * (n + 2)
        for i in range(m + 1, len(c)):
            if pi[i] == m:
                start = i - 2 * m + 1
                pref[start] += 1
        for i in range(1, n + 2):
            pref[i] += pref[i - 1]
        out = []
        for l, rr in qs:
            if rr - l + 1 < m:
                out.append(0)
            else:
                out.append(pref[rr - m + 1] - pref[l - 1])
        print(*out)`,
      cpp: r`
        int n = (int)t.size(), m = (int)p.size();
        string c = p + "#" + t;
        vector<int> pi = prefixFunction(c);
        vector<long long> pref(n + 2, 0);
        for (int i = m + 1; i < (int)c.size(); i++) if (pi[i] == m) pref[i - 2 * m + 1]++;
        for (int i = 1; i < n + 2; i++) pref[i] += pref[i - 1];
        string out;
        for (long long k = 0; k < q; k++) {
            long long l = qs[k][0], rr = qs[k][1];
            long long ans = (rr - l + 1 < m) ? 0 : pref[rr - m + 1] - pref[l - 1];
            if (k) out += " ";
            out += to_string(ans);
        }
        cout << out << "\n";`,
      java: r`
        int n = t.length(), m = p.length();
        String c = p + "#" + t;
        int[] pi = prefixFunction(c);
        long[] pref = new long[n + 2];
        for (int i = m + 1; i < c.length(); i++) if (pi[i] == m) pref[i - 2 * m + 1]++;
        for (int i = 1; i < n + 2; i++) pref[i] += pref[i - 1];
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            int l = (int) qs[k][0], rr = (int) qs[k][1];
            long ans = (rr - l + 1 < m) ? 0 : pref[rr - m + 1] - pref[l - 1];
            if (k > 0) out.append(" ");
            out.append(ans);
        }
        System.out.println(out);`,
      includes: ['<string>', '<vector>']
    },
    solution: { explanation: ['KMP finds the starting positions of all occurrences once; prefix counts over these positions give, for each question, the number of starts in [l, r - m + 1].'], complexity: 'Time O(|t| + |p| + q), space O(|t| + |p|).' },
    solve(input) {
      const rs = rows(input); const [t, p] = rs; const q = Number(rs[2]); const m = p.length; const starts = []; for (let i = 0; i + m <= t.length; i++) if (t.startsWith(p, i)) starts.push(i + 1); const out = []; for (let k = 0; k < q; k++) { const [l, rr] = nums(rs[3 + k]); let c = 0; // binary search for the window of starts
        let lo = 0, hi = starts.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (starts[mid] < l) lo = mid + 1; else hi = mid; } let lo2 = 0, hi2 = starts.length; while (lo2 < hi2) { const mid = (lo2 + hi2) >> 1; if (starts[mid] <= rr - m + 1) lo2 = mid + 1; else hi2 = mid; } c = Math.max(0, lo2 - lo); out.push(c); } return out.join(' ');
    },
    tests() {
      const g = rng(4608); const out = ['ababab\nab\n3\n1 6\n2 6\n1 3\n', 'a\na\n1\n1 1\n'];
      const brute = (input) => { const rs = rows(input); const [t, p] = rs; const q = Number(rs[2]); const m = p.length; return many(q, (k) => { const [l, rr] = nums(rs[3 + k]); let c = 0; for (let s = l - 1; s + m <= rr; s++) if (t.startsWith(p, s)) c++; return c; }).join(' '); };
      const make = (n, m, q, alpha) => { const p = randWord(g, m, alpha); let t = ''; while (t.length < n) t += g() < 0.4 ? p : randWord(g, randInt(g, 1, m), alpha); t = t.slice(0, n); return `${t}\n${p}\n${q}\n${many(q, () => { const l = randInt(g, 1, n); return `${l} ${randInt(g, l, n)}`; }).join('\n')}\n`; };
      crossCheck(() => make(randInt(g, 3, 14), randInt(g, 1, 3), randInt(g, 1, 8), 'ab'), (i) => this.solve(i), brute, 300);
      for (const [n, m, q, alpha] of [[40, 3, 10, 'ab'], [1000, 5, 1000, 'ab'], [40000, 6, 40000, 'ab'], [40000, 100, 40000, 'abc'], [40000, 3, 40000, 'abcdefghijklmnopqrstuvwxyz'], [39999, 1, 40000, 'ab']]) out.push(make(n, m, q, alpha));
      out.push(`${'a'.repeat(40000)}\n${'a'.repeat(500)}\n40000\n${many(40000, (i) => `${1 + (i % 100)} ${40000 - (i % 77)}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the word `a`.', 'The second line has the word `b`.'],
    constraints: ['1 <= length of a, length of b <= 40000', 'Both words consist of lowercase English letters.'],
    slug: 'shortest-word-containing-both-words',
    title: 'The Length of the Shortest Word That Contains Both Words',
    tags: ['kmp', 'prefix-function', 'superstring', 'overlap'],
    concept: {
      title: 'Check whether one word contains the other; otherwise glue them with the longest overlap in either order',
      body: [
        'Given two words `a` and `b`, find the length of the **shortest word that contains both of them as substrings**. For `a = abcde` and `b = cdefg` the shortest word is `abcdefg` (length 7): the end `cde` of `a` is also the start of `b`. For `a = abc` and `b = b` the word `abc` already contains both, so the answer is 3. For `a = ab` and `b = cd` nothing overlaps and the answer is 4.',
        'There are two cases. **(1)** If one word occurs inside the other (`b` inside `a`, or `a` inside `b`), the longer word already contains both, and the answer is its length. **(2)** Otherwise any word that contains both has to put one of them first and the other later, and the best way is to **glue** them with the largest overlap: `a` then `b` saves `ov(a, b)` letters (the longest suffix of `a` that is a prefix of `b`), and `b` then `a` saves `ov(b, a)`. The answer is `|a| + |b| - max(ov(a, b), ov(b, a))`.',
        { code: 'def info(x, y):                    # does y occur in x? and the longest suffix of x that is a prefix of y\n    pi = prefix_function(y + "#" + x)\n    return (len(y) in pi), pi[-1]\n\ninside_ab, ov_ab = info(a, b)   # b inside a, a-then-b overlap\ninside_ba, ov_ba = info(b, a)\nif inside_ab: answer = len(a)\nelif inside_ba: answer = len(b)\nelse: answer = len(a) + len(b) - max(ov_ab, ov_ba)' },
        'Both questions come from one prefix function of `y + "#" + x`: the value `|y|` appears in it exactly when `y` occurs in `x`, and the last value is the overlap. Time O(|a| + |b|). This is the two-word case of the shortest common superstring problem, which is hard for many words but easy for two.'
      ]
    },
    statement: ['Two words `a` and `b` are given. Print the length of the shortest word that contains both `a` and `b` as substrings.'],
    outputFormat: ['Print the length.'],
    examples: [{ input: 'abcde\ncdefg\n', note: 'The shortest word is abcdefg: 7.' }, { input: 'abc\nb\n', note: 'abc contains b: 3.' }],
    hints: ['If one word occurs inside the other, the answer is the longer length.', 'Otherwise glue the words with the largest overlap, trying both orders.', 'One prefix function of y + "#" + x gives both the containment and the overlap.'],
    program: {
      io: ['a:word', 'b:word'],
      fast: true,
      helpers: {
        python: dedent(PREFIX.python) + '\n\n' + r`
def info(x, y):
    pi = prefix_function(y + "#" + x)
    return (len(y) in pi), pi[-1]`.replace(/^\n/, ''),
        cpp: dedent(PREFIX.cpp) + '\n\n' + r`
pair<bool, int> info(const string& x, const string& y) {
    vector<int> pi = prefixFunction(y + "#" + x);
    bool inside = false;
    for (int v : pi) if (v == (int)y.size()) inside = true;
    return make_pair(inside, pi.back());
}`.replace(/^\n/, ''),
        java: dedent(PREFIX.java) + '\n\n' + r`
static int[] info(String x, String y) {
    int[] pi = prefixFunction(y + "#" + x);
    int inside = 0;
    for (int v : pi) if (v == y.length()) inside = 1;
    return new int[] {inside, pi[pi.length - 1]};
}`.replace(/^\n/, '')
      },
      python: r`
        inside_ab, ov_ab = info(a, b)
        inside_ba, ov_ba = info(b, a)
        if inside_ab:
            print(len(a))
        elif inside_ba:
            print(len(b))
        else:
            print(len(a) + len(b) - max(ov_ab, ov_ba))`,
      cpp: r`
        pair<bool, int> ab = info(a, b), ba = info(b, a);
        if (ab.first) cout << a.size() << "\n";
        else if (ba.first) cout << b.size() << "\n";
        else cout << (long long)a.size() + (long long)b.size() - max(ab.second, ba.second) << "\n";`,
      java: r`
        int[] ab = info(a, b);
        int[] ba = info(b, a);
        if (ab[0] == 1) System.out.println(a.length());
        else if (ba[0] == 1) System.out.println(b.length());
        else System.out.println((long) a.length() + b.length() - Math.max(ab[1], ba[1]));`,
      includes: ['<algorithm>', '<string>', '<utility>']
    },
    solution: { explanation: ['If one word occurs in the other, the answer is the longer length; otherwise the words are glued with the larger of the two overlaps, both obtained from the prefix function of y + "#" + x.'], complexity: 'Time O(|a| + |b|), space O(|a| + |b|).' },
    solve(input) {
      const [a, b] = rows(input); if (a.includes(b)) return String(a.length); if (b.includes(a)) return String(b.length); const ov = (x, y) => { for (let L = Math.min(x.length, y.length); L >= 1; L--) if (x.endsWith(y.slice(0, L))) return L; return 0; }; return String(a.length + b.length - Math.max(ov(a, b), ov(b, a)));
    },
    tests() {
      const g = rng(4609); const out = ['abcde\ncdefg\n', 'abc\nb\n', 'ab\ncd\n', 'a\na\n', 'aab\nabb\n'];
      const brute = (input) => { const [a, b] = rows(input); const alpha = 'ab'; // try all words up to the sum of lengths? use the known formula via the naive overlap
        if (a.includes(b)) return String(a.length); if (b.includes(a)) return String(b.length); let best = a.length + b.length; for (const [x, y] of [[a, b], [b, a]]) for (let L = Math.min(x.length, y.length); L >= 0; L--) if (x.endsWith(y.slice(0, L))) { best = Math.min(best, x.length + y.length - L); break; } return String(best); };
      crossCheck(() => `${randWord(g, randInt(g, 1, 8), 'ab')}\n${randWord(g, randInt(g, 1, 8), 'ab')}\n`, (i) => this.solve(i), brute, 600);
      const glued = (n, m, ov, alpha) => { const mid = randWord(g, ov, alpha); return `${randWord(g, n - ov, alpha)}${mid}\n${mid}${randWord(g, m - ov, alpha)}\n`; };
      for (const [n, m, ov, alpha] of [[30, 20, 5, 'ab'], [1000, 800, 100, 'abc'], [40000, 40000, 12345, 'ab'], [40000, 39000, 0, 'abcdefghijklmnopqrstuvwxyz']]) out.push(glued(n, m, ov, alpha));
      out.push(`${'a'.repeat(40000)}\n${'a'.repeat(39999)}b\n`, `${'ab'.repeat(20000)}\n${'ab'.repeat(10000)}\n`, `${fib(40000)}\n${fib(30000)}\n`, `x${'a'.repeat(39999)}\n${'a'.repeat(39999)}x\n`, `${'a'.repeat(20000)}b${'a'.repeat(19999)}\n${'a'.repeat(10000)}b${'a'.repeat(9999)}\n`);
      return out;
    }
  }
];
