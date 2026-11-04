import { r, rng, randInt, randArray, many, nums, rows, bigs, randWord, shuffle } from '../../lib.mjs';

// Runs fast(input) against a slow, independent computation on many small random inputs; throws when they differ.
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const lexCompare = (p, q) => { for (let i = 0; i < Math.min(p.length, q.length); i++) if (p[i] !== q[i]) return p[i] - q[i]; return p.length - q.length; };

export default [
  {
    slug: 'distinct-subsets-of-multiset',
    title: 'Different Subsets of a List With Repeats',
    difficulty: 'medium',
    tags: ['backtracking', 'subsets', 'duplicates'],
    concept: {
      title: 'Skip a number that was already tried at the same position',
      body: [
        'With repeated numbers, the plain subset search lists the same subset more than once: for the list `1 2 2` the subsets `{1, 2}` made with the first 2 and with the second 2 look the same. The fix is simple once the numbers are **sorted**: equal numbers are then neighbours, and at one step of the search you try a value only **once**.',
        { code: 'def subsets(a, start, current, out):\n    for i in range(start, len(a)):\n        if i > start and a[i] == a[i - 1]:\n            continue          # this value was already tried at this step\n        current.append(a[i])\n        out.append(" ".join(map(str, current)))\n        subsets(a, i + 1, current, out)\n        current.pop()' },
        'Look at the condition carefully: `i > start` and not `i > 0`. Within one loop, the second copy of a value is skipped, but a **deeper** level may use the second copy after the first one was taken (`1 2 2` is a valid subset). The rule is "never start two equal choices at the same step". Because the numbers are sorted, the subsets also come out in dictionary order.'
      ]
    },
    statement: ['You are given `n` integers; some of them can be equal. Print every different non-empty subset (two subsets are the same if they have the same numbers, whatever the positions). Inside a subset the numbers are in increasing order. Print the subsets in dictionary order (compare the numbers one by one; a shorter subset comes first if it is the start of a longer one), one per line, numbers separated by spaces.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` integers.'],
    outputFormat: ['The different subsets in dictionary order, one per line.'],
    constraints: ['1 <= n <= 10', '1 <= each integer <= 9'],
    examples: [{ input: '3\n1 2 2\n', note: 'The five different subsets are 1, 1 2, 1 2 2, 2 and 2 2.' }],
    hints: ['Sort the numbers first, so that equal numbers are neighbours.', 'In the loop that chooses the next number, skip a value equal to the previous one, but only when it is not the first candidate of this loop.', 'Record the current subset every time you add a number.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def subsets(a, start, current, out):
              for i in range(start, len(a)):
                  if i > start and a[i] == a[i - 1]:
                      continue
                  current.append(a[i])
                  out.append(" ".join(map(str, current)))
                  subsets(a, i + 1, current, out)
                  current.pop()`,
        cpp: r`
          void subsets(const vector<long long>& a, size_t start, vector<long long>& current, vector<string>& out) {
              for (size_t i = start; i < a.size(); i++) {
                  if (i > start && a[i] == a[i - 1]) continue;
                  current.push_back(a[i]);
                  string line;
                  for (size_t j = 0; j < current.size(); j++) line += (j ? " " : "") + to_string(current[j]);
                  out.push_back(line);
                  subsets(a, i + 1, current, out);
                  current.pop_back();
              }
          }`,
        java: r`
          static void subsets(long[] a, int start, List<Long> current, List<String> out) {
              for (int i = start; i < a.length; i++) {
                  if (i > start && a[i] == a[i - 1]) continue;
                  current.add(a[i]);
                  StringBuilder line = new StringBuilder();
                  for (int j = 0; j < current.size(); j++) line.append(j > 0 ? " " : "").append(current.get(j));
                  out.add(line.toString());
                  subsets(a, i + 1, current, out);
                  current.remove(current.size() - 1);
              }
          }`
      },
      python: r`
        a.sort()
        out = []
        subsets(a, 0, [], out)
        print("\n".join(out))`,
      cpp: r`
        sort(a.begin(), a.end());
        vector<string> out;
        vector<long long> current;
        subsets(a, 0, current, out);
        for (const string& line : out) cout << line << "\n";`,
      java: r`
        Arrays.sort(a);
        List<String> out = new ArrayList<>();
        subsets(a, 0, new ArrayList<>(), out);
        StringBuilder sb = new StringBuilder();
        for (String line : out) sb.append(line).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['After sorting, the loop at each step skips a value equal to the one just tried at that step (`i > start`). Each different subset is created exactly once, and recording it when it is created gives dictionary order.'], complexity: 'Time O(2^n * n), space O(n) besides the output.' },
    solve(input) { const a = nums(rows(input)[1]); const seen = new Map(); for (let mask = 1; mask < 1 << a.length; mask++) { const s = []; for (let i = 0; i < a.length; i++) if ((mask >> i) & 1) s.push(a[i]); s.sort((x, y) => x - y); seen.set(s.join(' '), s); } return [...seen.values()].sort(lexCompare).map((s) => s.join(' ')).join('\n'); },
    tests() {
      const g = rng(626);
      const make = (a) => `${a.length}\n${a.join(' ')}\n`;
      return ['3\n1 2 2\n', '1\n5\n', '2\n3 3\n', '4\n1 1 1 1\n', '5\n9 8 7 6 5\n', make(randArray(g, 6, 1, 3)), make(randArray(g, 8, 1, 4)), make(randArray(g, 10, 1, 3)), make(randArray(g, 10, 1, 9)), make(randArray(g, 10, 1, 5)), make([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]), make([9, 9, 9, 8, 8, 1, 1, 1, 1, 2])];
    }
  },

  {
    slug: 'distinct-permutations-of-word',
    title: 'Different Arrangements of Letters With Repeats',
    difficulty: 'medium',
    tags: ['backtracking', 'permutations', 'duplicates'],
    concept: {
      title: 'Count the letters instead of marking positions',
      body: [
        'With repeated letters, the plain permutation search produces the same word several times: swapping two equal letters changes nothing. A clean fix is to stop thinking about **positions** of letters and think about **how many of each letter are left**. At each step the choice is a **letter** (not a position), so equal letters are one choice.',
        { code: 'def permute(count, length, current, out):\n    if len(current) == length:\n        out.append("".join(current))\n        return\n    for c in range(26):                    # a, b, c, ... in alphabetical order\n        if count[c] > 0:\n            count[c] -= 1                  # use one copy\n            current.append(chr(97 + c))\n            permute(count, length, current, out)\n            current.pop()\n            count[c] += 1                  # put it back' },
        'Every different word is built exactly once, in dictionary order, with no set and no sorting. The number of words is `n! / (c1! * c2! * ...)` where `ci` are the counts of the letters, which is at most `8! = 40320` here.'
      ]
    },
    statement: ['You are given a word of lowercase letters; letters can repeat. Print all different words that can be made by rearranging all its letters, in dictionary order, one per line.'],
    inputFormat: ['The only line has the word.'],
    outputFormat: ['The different arrangements in dictionary order, one per line.'],
    constraints: ['1 <= length of the word <= 8'],
    examples: [{ input: 'aab\n', note: 'Only three different words exist: aab, aba and baa.' }],
    hints: ['Keep a count of how many copies of each letter are still unused.', 'At each position try every letter whose count is above zero, in alphabetical order.', 'Give the copy back after the recursive call.'],
    program: {
      io: ['word:word'],
      helpers: {
        python: r`
          def permute(count, length, current, out):
              if len(current) == length:
                  out.append("".join(current))
                  return
              for c in range(26):
                  if count[c] > 0:
                      count[c] -= 1
                      current.append(chr(97 + c))
                      permute(count, length, current, out)
                      current.pop()
                      count[c] += 1`,
        cpp: r`
          void permute(vector<int>& count, size_t length, string& current, vector<string>& out) {
              if (current.size() == length) {
                  out.push_back(current);
                  return;
              }
              for (int c = 0; c < 26; c++) {
                  if (count[c] > 0) {
                      count[c]--;
                      current.push_back((char)('a' + c));
                      permute(count, length, current, out);
                      current.pop_back();
                      count[c]++;
                  }
              }
          }`,
        java: r`
          static void permute(int[] count, int length, StringBuilder current, List<String> out) {
              if (current.length() == length) {
                  out.add(current.toString());
                  return;
              }
              for (int c = 0; c < 26; c++) {
                  if (count[c] > 0) {
                      count[c]--;
                      current.append((char) ('a' + c));
                      permute(count, length, current, out);
                      current.deleteCharAt(current.length() - 1);
                      count[c]++;
                  }
              }
          }`
      },
      python: r`
        count = [0] * 26
        for ch in word:
            count[ord(ch) - 97] += 1
        out = []
        permute(count, len(word), [], out)
        print("\n".join(out))`,
      cpp: r`
        vector<int> count(26, 0);
        for (char ch : word) count[ch - 'a']++;
        vector<string> out;
        string current;
        permute(count, word.size(), current, out);
        for (const string& s : out) cout << s << "\n";`,
      java: r`
        int[] count = new int[26];
        for (char ch : word.toCharArray()) count[ch - 'a']++;
        List<String> out = new ArrayList<>();
        permute(count, word.length(), new StringBuilder(), out);
        StringBuilder sb = new StringBuilder();
        for (String s : out) sb.append(s).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The search chooses a letter, not a position: `count[c]` copies are left of each letter. Trying letters in alphabetical order builds each different word once, in dictionary order.'], complexity: 'Time O(number of words * n), space O(n) besides the output.' },
    solve(input) {
      const a = [...rows(input)[0].trim()].sort(); const out = [a.join('')];
      for (;;) { let i = a.length - 2; while (i >= 0 && a[i] >= a[i + 1]) i--; if (i < 0) break; let j = a.length - 1; while (a[j] <= a[i]) j--; [a[i], a[j]] = [a[j], a[i]]; const tail = a.splice(i + 1).reverse(); a.push(...tail); out.push(a.join('')); }
      return out.join('\n');
    },
    tests() { const g = rng(627); return ['aab\n', 'a\n', 'aa\n', 'ab\n', 'aaaaaaaa\n', 'aaaabbbb\n', 'abcdefgh\n', 'hgfedcba\n', `${randWord(g, 8, 'abc')}\n`, `${randWord(g, 8, 'abcd')}\n`, `${randWord(g, 7, 'ab')}\n`, `${randWord(g, 6, 'abcdef')}\n`, 'zzzyyyxx\n', 'aabbccdd\n']; }
  },

  {
    slug: 'rank-of-a-permutation',
    title: 'The Position of a Permutation in the Dictionary',
    difficulty: 'medium',
    tags: ['recursion', 'permutations', 'counting'],
    concept: {
      title: 'Count the permutations that come before, without listing them',
      body: [
        'List all permutations of `1 .. n` in dictionary order. What is the **rank** of a given permutation `p` (the first permutation is rank 1)? Listing them is hopeless for `n = 20` (more than 2 * 10^18 permutations), but they can be **counted** in blocks. Look at the first position: every permutation that starts with a smaller value than `p[0]` comes before `p`, and for each such starting value there are exactly `(n - 1)!` permutations. Then the same question is asked for the rest.',
        { code: 'def rank(p, i, used, fact):\n    n = len(p)\n    if i == n:\n        return 0\n    smaller = sum(1 for v in range(1, p[i]) if not used[v])   # unused values below p[i]\n    used[p[i]] = True\n    return smaller * fact[n - 1 - i] + rank(p, i + 1, used, fact)' },
        'Only the values that are **not used yet** can stand at position `i`, so `smaller` counts only those. The answer is one more than the number of permutations before `p`. This is the same idea as skipping whole branches in a search, but we do not walk the branches: we **count** them with a factorial and jump over them.'
      ]
    },
    statement: ['All permutations of the numbers `1, 2, ..., n` are written in dictionary order (compare the first numbers, then the second numbers, and so on). The first one is `1 2 ... n`. Given a permutation, print its position in this list (starting at 1).'],
    inputFormat: ['The first line has `n`.', 'The second line has the permutation.'],
    outputFormat: ['Print the position.'],
    constraints: ['1 <= n <= 20 (20! is about 2.4 * 10^18 and fits in a 64-bit integer)', 'The second line is a permutation of 1 to n.'],
    examples: [{ input: '3\n2 3 1\n', note: 'The order is 123, 132, 213, 231, 312, 321, so 231 is the 4th.' }],
    hints: ['Permutations that start with a smaller number all come before; there are (n - 1)! of them for each smaller number.', 'Count only the smaller numbers that are not used yet.', 'Repeat for the next position with one number less, and add one at the end because the ranks start at 1.'],
    program: {
      io: ['n:int', 'p:int[n]'],
      helpers: {
        python: r`
          def rank(p, i, used, fact):
              n = len(p)
              if i == n:
                  return 0
              smaller = sum(1 for v in range(1, p[i]) if not used[v])
              used[p[i]] = True
              return smaller * fact[n - 1 - i] + rank(p, i + 1, used, fact)`,
        cpp: r`
          long long rankOf(const vector<long long>& p, size_t i, vector<char>& used, const vector<long long>& fact) {
              size_t n = p.size();
              if (i == n) return 0;
              long long smaller = 0;
              for (long long v = 1; v < p[i]; v++) {
                  if (!used[v]) smaller++;
              }
              used[p[i]] = 1;
              return smaller * fact[n - 1 - i] + rankOf(p, i + 1, used, fact);
          }`,
        java: r`
          static long rankOf(long[] p, int i, boolean[] used, long[] fact) {
              int n = p.length;
              if (i == n) return 0;
              long smaller = 0;
              for (int v = 1; v < p[i]; v++) {
                  if (!used[v]) smaller++;
              }
              used[(int) p[i]] = true;
              return smaller * fact[n - 1 - i] + rankOf(p, i + 1, used, fact);
          }`
      },
      python: r`
        fact = [1] * (n + 1)
        for i in range(1, n + 1):
            fact[i] = fact[i - 1] * i
        print(rank(p, 0, [False] * (n + 1), fact) + 1)`,
      cpp: r`
        vector<long long> fact(n + 1, 1);
        for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i;
        vector<char> used(n + 1, 0);
        cout << rankOf(p, 0, used, fact) + 1 << "\n";`,
      java: r`
        long[] fact = new long[(int) n + 1];
        fact[0] = 1;
        for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i;
        System.out.println(rankOf(p, 0, new boolean[(int) n + 1], fact) + 1);`
    },
    solution: { explanation: ['At position `i`, every unused value smaller than `p[i]` starts `(n - 1 - i)!` permutations that come earlier. The function adds these blocks and continues with the next position; the final answer is one more than the count of earlier permutations.'], complexity: 'Time O(n^2), space O(n).' },
    solve(input) { const rs = rows(input); const n = Number(rs[0]); const p = nums(rs[1]); const fact = [1n]; for (let i = 1; i <= n; i++) fact.push(fact[i - 1] * BigInt(i)); const used = Array(n + 1).fill(false); let rank = 0n; for (let i = 0; i < n; i++) { let smaller = 0; for (let v = 1; v < p[i]; v++) if (!used[v]) smaller++; used[p[i]] = true; rank += BigInt(smaller) * fact[n - 1 - i]; } return String(rank + 1n); },
    tests() {
      const g = rng(628);
      const make = (p) => `${p.length}\n${p.join(' ')}\n`;
      const ident = (n) => many(n, (i) => i + 1);
      const perms = (n) => { const out = []; const go = (cur, left) => { if (!left.length) { out.push(cur); return; } for (let i = 0; i < left.length; i++) go([...cur, left[i]], [...left.slice(0, i), ...left.slice(i + 1)]); }; go([], ident(n)); return out; };
      const all5 = perms(5);
      crossCheck(() => make(all5[randInt(g, 0, all5.length - 1)]), (i) => this.solve(i), (i) => { const p = nums(rows(i)[1]); return all5.findIndex((q) => q.join(' ') === p.join(' ')) + 1; });
      return ['3\n2 3 1\n', '1\n1\n', '2\n2 1\n', make(ident(20)), make(ident(20).reverse()), make(shuffle(g, ident(20))), make(shuffle(g, ident(20))), make(shuffle(g, ident(15))), make(shuffle(g, ident(10))), make([2, 1, ...ident(18).map((x) => x + 2)]), make([20, ...ident(19)])];
    }
  },

  {
    slug: 'kth-combination',
    title: 'The k-th Group in the Dictionary',
    difficulty: 'medium',
    tags: ['recursion', 'combinations', 'counting'],
    concept: {
      title: 'Jump over whole blocks of groups by counting them',
      body: [
        'All groups of `k` numbers out of `1 .. n`, in increasing order inside a group, can be listed in dictionary order. We want the group at position `r` without listing the earlier ones. Decide the numbers from left to right. Suppose the next number can start from `x`. How many groups begin with `x` here? After taking `x`, we choose `k - 1` numbers from the `n - x` numbers larger than `x`: that is the binomial coefficient `C(n - x, k - 1)`.',
        'If `r` is **larger** than this count, our group does not start with `x`: subtract the count from `r` and try `x + 1`. Otherwise `x` is the next number of our group, and we continue with `k - 1` numbers starting from `x + 1`.',
        { code: 'def kth(n, k, r, start, c, current):\n    if k == 0:\n        return current\n    x = start\n    while r > c[n - x][k - 1]:       # our group is after all groups that start with x\n        r -= c[n - x][k - 1]\n        x += 1\n    current.append(x)\n    return kth(n, k - 1, r, x + 1, c, current)' },
        'The binomial table `c` comes from Pascal\'s triangle: `c[i][j] = c[i - 1][j - 1] + c[i - 1][j]`. `C(60, 30)` is about 1.2 * 10^17 and still fits in a 64-bit integer. Counting makes the search cost `O(n * k)` instead of `C(n, k)`.'
      ]
    },
    statement: ['All groups of `k` different numbers chosen from `1, 2, ..., n` are written in dictionary order; inside a group the numbers are increasing. Given `n`, `k` and `r`, print the group at position `r` (the first group has position 1).'],
    inputFormat: ['The only line has `n`, `k` and `r`.'],
    outputFormat: ['Print the `k` numbers of the group, separated by spaces.'],
    constraints: ['1 <= k <= n <= 60', '1 <= r <= C(n, k) (at most about 1.2 * 10^17)'],
    examples: [{ input: '4 2 5\n', note: 'The order is 12, 13, 14, 23, 24, 34, so the 5th group is 2 4.' }],
    hints: ['The groups that start with x are C(n - x, k - 1) in number.', 'If r is larger than that number, subtract it from r and try the next x.', 'Build a table of binomial coefficients with Pascal\'s rule.'],
    program: {
      io: ['n:int k:int r:int'],
      helpers: {
        python: r`
          def pascal(n):
              c = [[0] * (n + 1) for _ in range(n + 1)]
              for i in range(n + 1):
                  c[i][0] = 1
                  for j in range(1, i + 1):
                      c[i][j] = c[i - 1][j - 1] + c[i - 1][j]
              return c

          def kth(n, k, r, start, c, current):
              if k == 0:
                  return current
              x = start
              while r > c[n - x][k - 1]:
                  r -= c[n - x][k - 1]
                  x += 1
              current.append(x)
              return kth(n, k - 1, r, x + 1, c, current)`,
        cpp: r`
          vector<vector<long long>> pascal(int n) {
              vector<vector<long long>> c(n + 1, vector<long long>(n + 1, 0));
              for (int i = 0; i <= n; i++) {
                  c[i][0] = 1;
                  for (int j = 1; j <= i; j++) c[i][j] = c[i - 1][j - 1] + c[i - 1][j];
              }
              return c;
          }

          void kth(int n, int k, long long r, int start, const vector<vector<long long>>& c, vector<int>& current) {
              if (k == 0) return;
              int x = start;
              while (r > c[n - x][k - 1]) {
                  r -= c[n - x][k - 1];
                  x++;
              }
              current.push_back(x);
              kth(n, k - 1, r, x + 1, c, current);
          }`,
        java: r`
          static long[][] pascal(int n) {
              long[][] c = new long[n + 1][n + 1];
              for (int i = 0; i <= n; i++) {
                  c[i][0] = 1;
                  for (int j = 1; j <= i; j++) c[i][j] = c[i - 1][j - 1] + c[i - 1][j];
              }
              return c;
          }

          static void kth(int n, int k, long r, int start, long[][] c, List<Integer> current) {
              if (k == 0) return;
              int x = start;
              while (r > c[n - x][k - 1]) {
                  r -= c[n - x][k - 1];
                  x++;
              }
              current.add(x);
              kth(n, k - 1, r, x + 1, c, current);
          }`
      },
      python: r`
        c = pascal(n)
        print(" ".join(map(str, kth(n, k, r, 1, c, []))))`,
      cpp: r`
        vector<vector<long long>> c = pascal((int)n);
        vector<int> current;
        kth((int)n, (int)k, r, 1, c, current);
        for (size_t i = 0; i < current.size(); i++) cout << (i ? " " : "") << current[i];
        cout << "\n";`,
      java: r`
        long[][] c = pascal((int) n);
        List<Integer> current = new ArrayList<>();
        kth((int) n, (int) k, r, 1, c, current);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < current.size(); i++) sb.append(i > 0 ? " " : "").append(current.get(i));
        System.out.println(sb);`
    },
    solution: { explanation: ['For the next number `x`, there are `C(n - x, k - 1)` groups that start with it. While `r` is larger than that, the whole block is skipped and `r` is reduced; then `x` is taken and the same is done for the remaining numbers.'], complexity: 'Time O(n^2) for the table and O(n) for the search, space O(n^2).' },
    solve(input) {
      const [n, k, r0] = bigs(input); const N = Number(n); let K = Number(k); let r = r0;
      const c = Array.from({ length: N + 1 }, () => Array(N + 1).fill(0n));
      for (let i = 0; i <= N; i++) { c[i][0] = 1n; for (let j = 1; j <= i; j++) c[i][j] = c[i - 1][j - 1] + c[i - 1][j]; }
      const out = []; let x = 1;
      while (K > 0) { while (r > c[N - x][K - 1]) { r -= c[N - x][K - 1]; x++; } out.push(x); x++; K--; }
      return out.join(' ');
    },
    tests() {
      const g = rng(629);
      const binom = (n, k) => { let v = 1n; for (let i = 1; i <= k; i++) v = (v * BigInt(n - k + i)) / BigInt(i); return v; };
      const pickRank = (n, k) => (BigInt(Math.floor(g() * Number.MAX_SAFE_INTEGER)) * 1000003n + BigInt(Math.floor(g() * 1000000))) % binom(n, k) + 1n;
      const make = (n, k, r) => `${n} ${k} ${r}\n`;
      const listAll = (n, k) => { const out = []; const go = (start, cur) => { if (cur.length === k) { out.push(cur.join(' ')); return; } for (let x = start; x <= n; x++) go(x + 1, [...cur, x]); }; go(1, []); return out; };
      crossCheck(() => { const n = randInt(g, 1, 9); const k = randInt(g, 1, n); return make(n, k, randInt(g, 1, Number(binom(n, k)))); }, (i) => this.solve(i), (i) => { const [n, k, r] = nums(i); return listAll(n, k)[r - 1]; });
      return ['4 2 5\n', '1 1 1\n', '5 5 1\n', '5 1 5\n', make(60, 30, 1n), make(60, 30, binom(60, 30)), make(60, 30, binom(60, 30) / 2n), make(60, 30, pickRank(60, 30)), make(60, 20, pickRank(60, 20)), make(60, 59, 60n), make(50, 25, pickRank(50, 25)), make(60, 1, 37n), make(40, 10, pickRank(40, 10))];
    }
  },

  {
    slug: 'combination-sum-lists',
    title: 'Ways to Reach the Target With Reusable Numbers',
    difficulty: 'medium',
    tags: ['backtracking', 'combinations', 'pruning'],
    concept: {
      title: 'The same number may be chosen again: recurse with the same index',
      body: [
        'You have a few different numbers and may use each of them **as many times as you want**. List every way to add up to the target, ignoring the order of the terms (`2 + 3` and `3 + 2` are one way). To avoid different orders, write the terms in non-decreasing order: after choosing the number at index `i`, the next term may be that same number again or a later one, never an earlier one.',
        { code: 'def search(a, start, remaining, current, out):\n    if remaining == 0:\n        out.append(" ".join(map(str, current)))\n        return\n    for i in range(start, len(a)):\n        if a[i] > remaining:\n            break                          # a is sorted: the rest is too large too\n        current.append(a[i])\n        search(a, i, remaining - a[i], current, out)     # i, not i + 1: reuse is allowed\n        current.pop()' },
        'The two details that matter: the recursive call passes `i` (not `i + 1`), which allows reuse, and the loop **stops** with `break` as soon as a number is larger than what remains, because the numbers are sorted. The recursion always ends, because every term is at least 2 and lowers `remaining`.'
      ]
    },
    statement: ['You are given `n` different integers (each at least 2) and a target `t`. Print every way to write `t` as a sum of these numbers, where a number can be used any number of times and the order does not matter. Write each way with its terms in increasing order, and print the ways in dictionary order, one per line. If there is no way, print `-1`.'],
    inputFormat: ['The first line has `n` and `t`.', 'The second line has the `n` integers.'],
    outputFormat: ['The ways in dictionary order, one per line, or `-1`.'],
    constraints: ['1 <= n <= 6', '2 <= each integer <= 30, and the integers are different', '1 <= t <= 30 (there are at most 3000 ways)'],
    examples: [{ input: '3 7\n2 3 6\n', note: 'The only way is 2 2 3: with the number 6 the remaining 1 cannot be made.' }],
    hints: ['Sort the numbers and write the terms in non-decreasing order.', 'After choosing a number, call the function again with the same index, so that the number can be reused.', 'Stop the loop when a number is larger than the amount that remains.'],
    program: {
      io: ['n:int t:int', 'a:int[n]'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def search(a, start, remaining, current, out):
              if remaining == 0:
                  out.append(" ".join(map(str, current)))
                  return
              for i in range(start, len(a)):
                  if a[i] > remaining:
                      break
                  current.append(a[i])
                  search(a, i, remaining - a[i], current, out)
                  current.pop()`,
        cpp: r`
          void search(const vector<long long>& a, size_t start, long long remaining, vector<long long>& current, vector<string>& out) {
              if (remaining == 0) {
                  string line;
                  for (size_t j = 0; j < current.size(); j++) line += (j ? " " : "") + to_string(current[j]);
                  out.push_back(line);
                  return;
              }
              for (size_t i = start; i < a.size(); i++) {
                  if (a[i] > remaining) break;
                  current.push_back(a[i]);
                  search(a, i, remaining - a[i], current, out);
                  current.pop_back();
              }
          }`,
        java: r`
          static void search(long[] a, int start, long remaining, List<Long> current, List<String> out) {
              if (remaining == 0) {
                  StringBuilder line = new StringBuilder();
                  for (int j = 0; j < current.size(); j++) line.append(j > 0 ? " " : "").append(current.get(j));
                  out.add(line.toString());
                  return;
              }
              for (int i = start; i < a.length; i++) {
                  if (a[i] > remaining) break;
                  current.add(a[i]);
                  search(a, i, remaining - a[i], current, out);
                  current.remove(current.size() - 1);
              }
          }`
      },
      python: r`
        a.sort()
        out = []
        search(a, 0, t, [], out)
        print("\n".join(out) if out else -1)`,
      cpp: r`
        sort(a.begin(), a.end());
        vector<string> out;
        vector<long long> current;
        search(a, 0, t, current, out);
        if (out.empty()) cout << -1 << "\n";
        for (const string& line : out) cout << line << "\n";`,
      java: r`
        Arrays.sort(a);
        List<String> out = new ArrayList<>();
        search(a, 0, t, new ArrayList<>(), out);
        if (out.isEmpty()) System.out.println(-1);
        StringBuilder sb = new StringBuilder();
        for (String line : out) sb.append(line).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Terms are chosen in non-decreasing order: the recursive call keeps the same index so a number can repeat, and the sorted loop stops at the first number that is too large. A complete sum is recorded when nothing remains.'], complexity: 'Time O(number of ways * length), space O(t) for the recursion.' },
    solve(input) { const rs = rows(input); const [, t] = nums(rs[0]); const a = nums(rs[1]).sort((x, y) => x - y); const out = []; const go = (start, remaining, cur) => { if (remaining === 0) { out.push(cur.slice()); return; } for (let i = start; i < a.length && a[i] <= remaining; i++) { cur.push(a[i]); go(i, remaining - a[i], cur); cur.pop(); } }; go(0, t, []); out.sort(lexCompare); return out.length ? out.map((x) => x.join(' ')).join('\n') : '-1'; },
    tests() {
      const g = rng(630);
      const make = (t, a) => `${a.length} ${t}\n${a.join(' ')}\n`;
      const distinct = (n, lo, hi) => { const set = new Set(); while (set.size < n) set.add(randInt(g, lo, hi)); return [...set]; };
      const count = (t, a) => { const dp = Array(t + 1).fill(0); dp[0] = 1; for (const x of a) for (let s = x; s <= t; s++) dp[s] += dp[s - x]; return dp[t]; };
      crossCheck(() => make(randInt(g, 1, 20), distinct(randInt(g, 1, 5), 2, 12)), (i) => this.solve(i).split('\n').filter((l) => l !== '-1').length, (i) => { const rs = rows(i); return count(nums(rs[0])[1], nums(rs[1])); });
      const big = make(30, [2, 3, 4, 5, 6, 7]);
      if (this.solve(big).split('\n').length > 3000) throw new Error('too many combinations');
      return ['3 7\n2 3 6\n', '1 1\n2\n', '1 8\n2\n', '1 7\n2\n', '2 9\n2 4\n', '3 12\n3 4 5\n', big, make(30, [2, 3, 5]), make(30, [7, 11, 13, 17]), make(29, [4, 6, 10, 12]), make(25, distinct(6, 2, 15)), make(30, distinct(6, 2, 8)), make(12, [2, 3, 4, 5, 6, 7])];
    }
  },

  {
    slug: 'unique-combination-count',
    title: 'Different Groups of Numbers With a Given Sum',
    difficulty: 'medium',
    tags: ['backtracking', 'combinations', 'duplicates'],
    concept: {
      title: 'Each number once, and equal numbers are one choice',
      body: [
        'Now every number can be used **at most once**, but the list can contain equal numbers, such as `1 1 2 3`. Two groups are the same if they have the same values (`{1, 2}` made with the first 1 or the second 1 counts once). The tools are the ones from the subset problem with repeats: **sort**, and at one step of the loop skip a value equal to the previous one.',
        { code: 'def count(a, start, remaining):\n    if remaining == 0:\n        return 1                       # a complete group (all numbers are positive)\n    total = 0\n    for i in range(start, len(a)):\n        if a[i] > remaining:\n            break                      # sorted: nothing later can fit\n        if i > start and a[i] == a[i - 1]:\n            continue                   # the same value was just tried here\n        total += count(a, i + 1, remaining - a[i])\n    return total' },
        'Here the numbers are positive, so when `remaining` reaches 0 the group is complete and no larger group with this prefix can have the same sum: we return 1 at once. The loop condition `a[i] > remaining` is a pruning rule that works because the list is sorted.'
      ]
    },
    statement: ['You are given `n` positive integers (some may be equal) and a target `t`. Count the different groups of numbers with sum `t`, where each position can be used at most once, and two groups are the same if they contain the same values with the same multiplicities.'],
    inputFormat: ['The first line has `n` and `t`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print the number of different groups.'],
    constraints: ['1 <= n <= 16', '1 <= each integer <= 20', '1 <= t <= 40'],
    examples: [{ input: '5 4\n1 1 2 2 3\n', note: 'The groups are 1+1+2, 1+3 and 2+2.' }],
    hints: ['Sort the numbers and choose them in increasing order of index.', 'Skip a value that equals the previous one at the same step.', 'Stop the loop when a number is larger than what remains.'],
    program: {
      io: ['n:int t:int', 'a:int[n]'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def count(a, start, remaining):
              if remaining == 0:
                  return 1
              total = 0
              for i in range(start, len(a)):
                  if a[i] > remaining:
                      break
                  if i > start and a[i] == a[i - 1]:
                      continue
                  total += count(a, i + 1, remaining - a[i])
              return total`,
        cpp: r`
          long long countGroups(const vector<long long>& a, size_t start, long long remaining) {
              if (remaining == 0) return 1;
              long long total = 0;
              for (size_t i = start; i < a.size(); i++) {
                  if (a[i] > remaining) break;
                  if (i > start && a[i] == a[i - 1]) continue;
                  total += countGroups(a, i + 1, remaining - a[i]);
              }
              return total;
          }`,
        java: r`
          static long countGroups(long[] a, int start, long remaining) {
              if (remaining == 0) return 1;
              long total = 0;
              for (int i = start; i < a.length; i++) {
                  if (a[i] > remaining) break;
                  if (i > start && a[i] == a[i - 1]) continue;
                  total += countGroups(a, i + 1, remaining - a[i]);
              }
              return total;
          }`
      },
      python: r`
        a.sort()
        print(count(a, 0, t))`,
      cpp: r`
        sort(a.begin(), a.end());
        cout << countGroups(a, 0, t) << "\n";`,
      java: r`
        Arrays.sort(a);
        System.out.println(countGroups(a, 0, t));`
    },
    solution: { explanation: ['After sorting, the loop skips values equal to the previous one at the same step and stops at the first value that is too large. A group is complete when the remaining sum is 0.'], complexity: 'Time proportional to the number of groups and partial groups, space O(n).' },
    solve(input) { const rs = rows(input); const [, t] = nums(rs[0]); const have = new Map(); for (const x of nums(rs[1])) have.set(x, (have.get(x) || 0) + 1); let dp = new Map([[0, 1]]); for (const [v, cnt] of have) { const next = new Map(); for (const [s, ways] of dp) for (let c = 0; c <= cnt; c++) { const ns = s + c * v; if (ns <= t) next.set(ns, (next.get(ns) || 0) + ways); } dp = next; } return String(dp.get(t) || 0); },
    tests() {
      const g = rng(631);
      const make = (t, a) => `${a.length} ${t}\n${a.join(' ')}\n`;
      const brute = (t, a) => { const seen = new Set(); for (let mask = 1; mask < 1 << a.length; mask++) { const s = []; let sum = 0; for (let i = 0; i < a.length; i++) if ((mask >> i) & 1) { s.push(a[i]); sum += a[i]; } if (sum === t) seen.add(s.sort((x, y) => x - y).join(',')); } return seen.size; };
      crossCheck(() => make(randInt(g, 1, 15), randArray(g, randInt(g, 1, 10), 1, 8)), (i) => this.solve(i), (i) => { const rs = rows(i); return brute(nums(rs[0])[1], nums(rs[1])); });
      return ['5 4\n1 1 2 2 3\n', '1 5\n5\n', '1 4\n5\n', '4 8\n2 2 2 2\n', make(40, many(16, () => 1).map((x, i) => x + (i % 5))), make(20, randArray(g, 16, 1, 5)), make(40, randArray(g, 16, 1, 20)), make(30, randArray(g, 16, 1, 10)), make(15, many(16, () => 1)), make(21, many(16, (i) => i + 1)), make(40, many(16, (i) => 20 - (i % 4))), make(10, randArray(g, 16, 1, 3))];
    }
  },

  {
    slug: 'min-difference-split',
    title: 'Two Piles as Equal as Possible',
    difficulty: 'medium',
    tags: ['backtracking', 'pruning', 'subsets'],
    concept: {
      title: 'Track the difference, and cut a branch when the best end is known',
      body: [
        'Put each of `n` numbers into pile A or pile B so that the sums differ as little as possible. Track only the **difference** `diff = sum(A) - sum(B)`: a number added to A raises it, a number added to B lowers it. At the end the answer for this choice is `|diff|`.',
        'A strong pruning idea: look at `rest`, the sum of the numbers not yet placed. If `|diff|` is already at least `rest`, then the best possible ending is to put **all** remaining numbers on the lighter side, which gives exactly `|diff| - rest`. There is nothing left to try, so return it at once.',
        { code: 'def split(a, rest, i, diff):          # rest[i] is the sum of a[i:]\n    if i == len(a):\n        return abs(diff)\n    if abs(diff) >= rest[i]:\n        return abs(diff) - rest[i]        # the best ending is known\n    return min(split(a, rest, i + 1, diff + a[i]),\n               split(a, rest, i + 1, diff - a[i]))' },
        'Handling the **big numbers first** makes this prune much more often, because the remaining sum drops fast, so the numbers are sorted in decreasing order.'
      ]
    },
    statement: ['Given `n` positive integers, split them into two piles (every number goes to exactly one pile; a pile may be empty) so that the difference between the sums of the two piles is as small as possible. Print this smallest difference.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print the smallest difference.'],
    constraints: ['1 <= n <= 20', '1 <= each integer <= 1000'],
    examples: [{ input: '4\n8 6 5 7\n', note: 'The piles 8 + 5 = 13 and 6 + 7 = 13 have the same sum, so the difference is 0.' }],
    hints: ['Track sum(A) - sum(B): adding to A raises it, adding to B lowers it.', 'At the end the answer of a choice is the absolute value of the difference.', 'If the difference is at least the sum of the numbers still to place, put them all on the lighter pile and stop.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      includes: ['<algorithm>', '<cstdlib>'],
      helpers: {
        python: r`
          def split(a, rest, i, diff):
              if i == len(a):
                  return abs(diff)
              if abs(diff) >= rest[i]:
                  return abs(diff) - rest[i]
              return min(split(a, rest, i + 1, diff + a[i]), split(a, rest, i + 1, diff - a[i]))`,
        cpp: r`
          long long splitPiles(const vector<long long>& a, const vector<long long>& rest, size_t i, long long diff) {
              if (i == a.size()) return llabs(diff);
              if (llabs(diff) >= rest[i]) return llabs(diff) - rest[i];
              return min(splitPiles(a, rest, i + 1, diff + a[i]), splitPiles(a, rest, i + 1, diff - a[i]));
          }`,
        java: r`
          static long splitPiles(long[] a, long[] rest, int i, long diff) {
              if (i == a.length) return Math.abs(diff);
              if (Math.abs(diff) >= rest[i]) return Math.abs(diff) - rest[i];
              return Math.min(splitPiles(a, rest, i + 1, diff + a[i]), splitPiles(a, rest, i + 1, diff - a[i]));
          }`
      },
      python: r`
        a.sort(reverse=True)
        rest = [0] * (n + 1)
        for i in range(n - 1, -1, -1):
            rest[i] = rest[i + 1] + a[i]
        print(split(a, rest, 0, 0))`,
      cpp: r`
        sort(a.begin(), a.end(), greater<long long>());
        vector<long long> rest(n + 1, 0);
        for (int i = (int)n - 1; i >= 0; i--) rest[i] = rest[i + 1] + a[i];
        cout << splitPiles(a, rest, 0, 0) << "\n";`,
      java: r`
        Arrays.sort(a);
        for (int i = 0; i < a.length / 2; i++) {
            long t = a[i];
            a[i] = a[a.length - 1 - i];
            a[a.length - 1 - i] = t;
        }
        long[] rest = new long[(int) n + 1];
        for (int i = (int) n - 1; i >= 0; i--) rest[i] = rest[i + 1] + a[i];
        System.out.println(splitPiles(a, rest, 0, 0));`
    },
    solution: { explanation: ['The search tracks `diff = sum(A) - sum(B)` and places the numbers from the biggest to the smallest. When `|diff|` is at least the sum of the numbers left, all of them go to the lighter pile and `|diff| - rest` is the best result of this branch.'], complexity: 'Time O(2^n) in the worst case, usually much less; space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const total = a.reduce((x, y) => x + y, 0); let reach = new Set([0]); for (const x of a) reach = new Set([...reach, ...[...reach].map((s) => s + x)]); let best = Infinity; for (const s of reach) best = Math.min(best, Math.abs(total - 2 * s)); return String(best); },
    tests() {
      const g = rng(632);
      const make = (a) => `${a.length}\n${a.join(' ')}\n`;
      const brute = (a) => { let best = Infinity; const total = a.reduce((x, y) => x + y, 0); for (let mask = 0; mask < 1 << a.length; mask++) { let t = 0; for (let i = 0; i < a.length; i++) if ((mask >> i) & 1) t += a[i]; best = Math.min(best, Math.abs(total - 2 * t)); } return best; };
      crossCheck(() => make(randArray(g, randInt(g, 1, 12), 1, 30)), (i) => this.solve(i), (i) => brute(nums(rows(i)[1])));
      return ['4\n8 6 5 7\n', '1\n5\n', '2\n3 3\n', '2\n1 1000\n', '3\n1 1 1\n', make(many(20, () => 1000)), make(many(20, (i) => 1000 - 3 * i)), make(randArray(g, 20, 1, 1000)), make(randArray(g, 20, 500, 1000)), make(randArray(g, 20, 1, 20)), make(many(20, (i) => 2 * (i + 1))), make(many(20, (i) => 2 * (i + 1) - (i === 19 ? 1 : 0))), make(randArray(g, 19, 1, 1000)), make([...many(19, () => 999), 1000])];
    }
  },

  {
    slug: 'beautiful-arrangements',
    title: 'Numbers That Divide Their Positions',
    difficulty: 'medium',
    tags: ['backtracking', 'permutations', 'pruning'],
    concept: {
      title: 'Start with the most restricted position',
      body: [
        'An arrangement of `1 .. n` is *beautiful* if for every position `i` (counted from 1) the number `v` at position `i` divides `i` or is divisible by `i`: `v % i == 0` or `i % v == 0`. We fill positions with unused numbers and check this rule **at the time of placing**, as in any permutation search with constraints.',
        { code: 'def count(n, pos, used):\n    if pos == 0:\n        return 1\n    total = 0\n    for v in range(1, n + 1):\n        if not used[v] and (v % pos == 0 or pos % v == 0):\n            used[v] = True\n            total += count(n, pos - 1, used)\n            used[v] = False\n    return total' },
        'Notice the order: the code fills the positions from **`n` down to 1**. A big position such as `n` has very few numbers that fit (only its divisors, and itself), while position 1 accepts anything. Deciding the most restricted positions first makes failures appear early, near the root of the search, where a cut saves the most work. The order in which you fill the positions can change the running time a lot, although the answer is the same.'
      ]
    },
    statement: ['Count the permutations of `1, 2, ..., n` in which, for every position `i` (from 1 to `n`), the number at position `i` divides `i` or is divisible by `i`.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['Print the number of such permutations.'],
    constraints: ['1 <= n <= 15'],
    examples: [{ input: '3\n', note: 'The three arrangements are 1 2 3, 2 1 3 and 3 2 1.' }],
    hints: ['Fill the positions one by one, with unused numbers that satisfy the rule for this position.', 'Starting from the last position makes the search much faster, because it has the fewest candidates.', 'Count one when all positions are filled.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def count(n, pos, used):
              if pos == 0:
                  return 1
              total = 0
              for v in range(1, n + 1):
                  if not used[v] and (v % pos == 0 or pos % v == 0):
                      used[v] = True
                      total += count(n, pos - 1, used)
                      used[v] = False
              return total`,
        cpp: r`
          long long countArrangements(int n, int pos, vector<char>& used) {
              if (pos == 0) return 1;
              long long total = 0;
              for (int v = 1; v <= n; v++) {
                  if (!used[v] && (v % pos == 0 || pos % v == 0)) {
                      used[v] = 1;
                      total += countArrangements(n, pos - 1, used);
                      used[v] = 0;
                  }
              }
              return total;
          }`,
        java: r`
          static long countArrangements(int n, int pos, boolean[] used) {
              if (pos == 0) return 1;
              long total = 0;
              for (int v = 1; v <= n; v++) {
                  if (!used[v] && (v % pos == 0 || pos % v == 0)) {
                      used[v] = true;
                      total += countArrangements(n, pos - 1, used);
                      used[v] = false;
                  }
              }
              return total;
          }`
      },
      python: 'print(count(n, n, [False] * (n + 1)))',
      cpp: r`
        vector<char> used(n + 1, 0);
        cout << countArrangements((int)n, (int)n, used) << "\n";`,
      java: 'System.out.println(countArrangements((int) n, (int) n, new boolean[(int) n + 1]));'
    },
    solution: { explanation: ['Positions are filled from `n` down to 1 with unused numbers that satisfy the divisibility rule, which cuts most branches early. A completed arrangement counts one.'], complexity: 'Time proportional to the number of partial arrangements (small for n = 15), space O(n).' },
    solve(input) { const n = Number(rows(input)[0]); const dp = Array(1 << n).fill(0); dp[0] = 1; for (let mask = 0; mask < 1 << n; mask++) { if (!dp[mask]) continue; let pos = 1; for (let i = 0; i < n; i++) if ((mask >> i) & 1) pos++; if (pos > n) continue; for (let v = 1; v <= n; v++) if (!((mask >> (v - 1)) & 1) && (v % pos === 0 || pos % v === 0)) dp[mask | (1 << (v - 1))] += dp[mask]; } return String(dp[(1 << n) - 1]); },
    tests() { return many(15, (i) => `${i + 1}\n`); }
  },

  {
    slug: 'letter-tile-sequences',
    title: 'Words You Can Make From Tiles',
    difficulty: 'medium',
    tags: ['backtracking', 'counting', 'duplicates'],
    concept: {
      title: 'Every node of the search is a different word',
      body: [
        'You have letter tiles, some of them equal. Count the different non-empty words you can make using some or all of the tiles, each tile at most once. As with the arrangements of a word with repeats, the search chooses a **letter** (not a tile), with `count[c]` copies of every letter available: then each different word is reached by exactly one path.',
        { code: 'def sequences(count):\n    total = 0\n    for c in range(26):\n        if count[c] > 0:\n            count[c] -= 1                # use a tile with this letter\n            total += 1 + sequences(count)   # the word so far, plus all longer words that continue it\n            count[c] += 1\n    return total' },
        'Here there is no list of the word at all: the word is the **path** from the root of the search to the current call, and the call counts itself with the `1 +`. When a search only has to count, it needs no list to remember what was chosen; the counts of the unused letters are the whole state.'
      ]
    },
    statement: ['You have `n` tiles, each with a lowercase letter; letters can repeat. Count the different non-empty words that can be made with some or all of the tiles (each tile used at most once). Words are compared as strings.'],
    inputFormat: ['The only line has the letters of the tiles as one word.'],
    outputFormat: ['Print the number of different words.'],
    constraints: ['1 <= n <= 8'],
    examples: [{ input: 'aab\n', note: 'The words are a, b, aa, ab, ba, aab, aba and baa: eight in total.' }],
    hints: ['Keep a count of the unused tiles of every letter.', 'Choose a letter, not a tile: equal tiles give the same word.', 'Every call stands for one word; add 1 and the number of longer words it can continue to.'],
    program: {
      io: ['tiles:word'],
      helpers: {
        python: r`
          def sequences(count):
              total = 0
              for c in range(26):
                  if count[c] > 0:
                      count[c] -= 1
                      total += 1 + sequences(count)
                      count[c] += 1
              return total`,
        cpp: r`
          long long sequences(vector<int>& count) {
              long long total = 0;
              for (int c = 0; c < 26; c++) {
                  if (count[c] > 0) {
                      count[c]--;
                      total += 1 + sequences(count);
                      count[c]++;
                  }
              }
              return total;
          }`,
        java: r`
          static long sequences(int[] count) {
              long total = 0;
              for (int c = 0; c < 26; c++) {
                  if (count[c] > 0) {
                      count[c]--;
                      total += 1 + sequences(count);
                      count[c]++;
                  }
              }
              return total;
          }`
      },
      python: r`
        count = [0] * 26
        for ch in tiles:
            count[ord(ch) - 97] += 1
        print(sequences(count))`,
      cpp: r`
        vector<int> count(26, 0);
        for (char ch : tiles) count[ch - 'a']++;
        cout << sequences(count) << "\n";`,
      java: r`
        int[] count = new int[26];
        for (char ch : tiles.toCharArray()) count[ch - 'a']++;
        System.out.println(sequences(count));`
    },
    solution: { explanation: ['The state is the count of unused tiles per letter. Each call tries one letter at a time; the word reached is counted once (`1 +`) and the calls below count its longer continuations.'], complexity: 'Time O(number of words * 26), at most about 10^5 words; space O(n).' },
    solve(input) { const t = rows(input)[0].trim(); const seen = new Set(); const go = (cur, left) => { for (let i = 0; i < left.length; i++) { const w = cur + left[i]; seen.add(w); go(w, left.slice(0, i) + left.slice(i + 1)); } }; go('', t); return String(seen.size); },
    tests() { const g = rng(633); return ['aab\n', 'a\n', 'ab\n', 'aa\n', 'abcdefgh\n', 'aaaaaaaa\n', 'aabbccdd\n', 'aaabbbcc\n', `${randWord(g, 8, 'abc')}\n`, `${randWord(g, 8, 'abcde')}\n`, `${randWord(g, 7, 'abcdefgh')}\n`, `${randWord(g, 8, 'ab')}\n`, 'zzzzzzzy\n']; }
  }
];
