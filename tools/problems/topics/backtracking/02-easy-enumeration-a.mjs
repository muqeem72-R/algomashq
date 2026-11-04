import { r, rng, randInt, randArray, many, nums, rows, shuffle } from '../../lib.mjs';

// Runs fast(input) against a slow, independent computation on many small random inputs; throws when they differ.
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const sortedLetters = (g, n) => shuffle(g, [...LOWER]).slice(0, n).sort().join('');

export default [
  {
    slug: 'all-subsets-of-letters',
    title: 'All Subsets of a Set of Letters',
    difficulty: 'easy',
    tags: ['backtracking', 'subsets', 'recursion'],
    concept: {
      title: 'Choose, explore, unchoose',
      body: [
        'A set of `n` letters has `2^n` subsets. To list them all, build every subset one letter at a time. Keep the subset built so far in a list `current`. At each step the next letter must come **after** the last chosen one (this avoids listing the same subset in two different orders), so the function receives the position `start` where the next letter may be taken from.',
        { code: 'def subsets(word, start, current, out):\n    for i in range(start, len(word)):\n        current.append(word[i])             # choose\n        out.append("".join(current))        # this subset is complete as it is\n        subsets(word, i + 1, current, out)  # explore the larger subsets\n        current.pop()                       # unchoose: go back' },
        'The three lines **choose - explore - unchoose** are the heart of **backtracking**. After the exploration the list `current` must be exactly as before the choice, otherwise the next iteration would start from a wrong state. Because the letters are given in alphabetical order, the subsets come out in dictionary order: `a`, `ab`, `abc`, `ac`, `b`, `bc`, `c`.'
      ]
    },
    statement: ['You are given `n` different lowercase letters in alphabetical order. Print all non-empty subsets of the letters. Inside a subset the letters keep their alphabetical order. Print the subsets in dictionary order, one per line.'],
    inputFormat: ['The only line has the letters as one word.'],
    outputFormat: ['The `2^n - 1` non-empty subsets in dictionary order, one per line.'],
    constraints: ['1 <= n <= 10', 'The letters are different and in alphabetical order.'],
    examples: [{ input: 'abc\n', note: 'The 7 subsets in dictionary order are a, ab, abc, ac, b, bc, c.' }],
    hints: ['Build each subset in a list: add a letter, record the subset, recurse, then remove the letter again.', 'After a letter at position i, only letters at positions i + 1 and later may be added.', 'Recording the subset before going deeper gives the dictionary order: a shorter subset comes before the longer ones that start with it.'],
    program: {
      io: ['word:word'],
      helpers: {
        python: r`
          def subsets(word, start, current, out):
              for i in range(start, len(word)):
                  current.append(word[i])
                  out.append("".join(current))
                  subsets(word, i + 1, current, out)
                  current.pop()`,
        cpp: r`
          void subsets(const string& word, size_t start, string& current, vector<string>& out) {
              for (size_t i = start; i < word.size(); i++) {
                  current.push_back(word[i]);
                  out.push_back(current);
                  subsets(word, i + 1, current, out);
                  current.pop_back();
              }
          }`,
        java: r`
          static void subsets(String word, int start, StringBuilder current, List<String> out) {
              for (int i = start; i < word.length(); i++) {
                  current.append(word.charAt(i));
                  out.add(current.toString());
                  subsets(word, i + 1, current, out);
                  current.deleteCharAt(current.length() - 1);
              }
          }`
      },
      python: r`
        out = []
        subsets(word, 0, [], out)
        print("\n".join(out))`,
      cpp: r`
        vector<string> out;
        string current;
        subsets(word, 0, current, out);
        for (const string& s : out) cout << s << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        subsets(word, 0, new StringBuilder(), out);
        StringBuilder sb = new StringBuilder();
        for (String s : out) sb.append(s).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Every call tries each letter from `start` on: it adds the letter, records the subset, explores the subsets that extend it, and removes the letter. Each non-empty subset is recorded exactly once, in dictionary order.'], complexity: 'Time O(2^n * n), space O(n) besides the output.' },
    solve(input) { const w = rows(input)[0].trim(); const out = []; for (let mask = 1; mask < 1 << w.length; mask++) { let s = ''; for (let i = 0; i < w.length; i++) if ((mask >> i) & 1) s += w[i]; out.push(s); } return out.sort().join('\n'); },
    tests() { const g = rng(616); return ['abc\n', 'a\n', 'ab\n', 'xyz\n', `${sortedLetters(g, 4)}\n`, `${sortedLetters(g, 6)}\n`, `${sortedLetters(g, 8)}\n`, `${sortedLetters(g, 9)}\n`, `${sortedLetters(g, 10)}\n`, 'abcdefghij\n', 'qrstuvwxyz\n']; }
  },

  {
    slug: 'subsets-with-given-sum',
    title: 'How Many Subsets Add Up to s',
    difficulty: 'easy',
    tags: ['backtracking', 'subsets', 'pruning'],
    concept: {
      title: 'Take it or leave it',
      body: [
        'For every number there are two choices: it is **in** the subset or **out**. A recursive function looks at the numbers one by one with the target that is **still missing**: `count(i, remaining)`. Taking `a[i]` lowers the missing amount, leaving it does not, and when all numbers have been decided, the subset is good exactly when nothing is missing.',
        { code: 'def count(a, i, remaining):\n    if remaining < 0:                  # too much was taken: prune\n        return 0\n    if i == len(a):\n        return 1 if remaining == 0 else 0\n    return count(a, i + 1, remaining) + count(a, i + 1, remaining - a[i])' },
        'All numbers are not negative, so as soon as `remaining` becomes negative it can never come back to 0, and the whole branch is cut. That **pruning** removes many of the `2^n` leaves. Subsets are told apart by the positions of their numbers: two equal values at different positions give different subsets.'
      ]
    },
    statement: ['You are given `n` non-negative integers and a target `s`. Count the subsets (sets of positions, the empty set included) whose numbers add up to exactly `s`. The sum of the empty subset is 0.'],
    inputFormat: ['The first line has `n` and `s`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print the number of subsets.'],
    constraints: ['1 <= n <= 18', '0 <= each number <= 1000', '0 <= s <= 18000'],
    examples: [{ input: '4 5\n1 2 3 4\n', note: 'The subsets {2, 3} and {1, 4} have sum 5.' }],
    hints: ['For every number you can take it or leave it: two recursive calls.', 'Pass the amount that is still missing; at the end it must be exactly 0.', 'A negative missing amount can never become 0 again (all numbers are not negative), so stop there.'],
    program: {
      io: ['n:int s:int', 'a:int[n]'],
      helpers: {
        python: r`
          def count(a, i, remaining):
              if remaining < 0:
                  return 0
              if i == len(a):
                  return 1 if remaining == 0 else 0
              return count(a, i + 1, remaining) + count(a, i + 1, remaining - a[i])`,
        cpp: r`
          long long countSubsets(const vector<long long>& a, size_t i, long long remaining) {
              if (remaining < 0) return 0;
              if (i == a.size()) return remaining == 0 ? 1 : 0;
              return countSubsets(a, i + 1, remaining) + countSubsets(a, i + 1, remaining - a[i]);
          }`,
        java: r`
          static long countSubsets(long[] a, int i, long remaining) {
              if (remaining < 0) return 0;
              if (i == a.length) return remaining == 0 ? 1 : 0;
              return countSubsets(a, i + 1, remaining) + countSubsets(a, i + 1, remaining - a[i]);
          }`
      },
      python: 'print(count(a, 0, s))',
      cpp: 'cout << countSubsets(a, 0, s) << "\\n";',
      java: 'System.out.println(countSubsets(a, 0, s));'
    },
    solution: { explanation: ['`count(i, remaining)` decides number `i`: leave it, or take it and lower `remaining`. A negative `remaining` ends the branch; after the last number the subset counts if `remaining` is 0.'], complexity: 'Time O(2^n) in the worst case (all zeros), space O(n).' },
    solve(input) { const rs = rows(input); const [, s] = nums(rs[0]); const dp = Array(s + 1).fill(0); dp[0] = 1; for (const x of nums(rs[1])) for (let t = s; t >= x; t--) dp[t] += dp[t - x]; return String(dp[s]); },
    tests() {
      const g = rng(617);
      const make = (n, s, a) => `${n} ${s}\n${a.join(' ')}\n`;
      const brute = (a, s) => { let c = 0; for (let mask = 0; mask < 1 << a.length; mask++) { let t = 0; for (let i = 0; i < a.length; i++) if ((mask >> i) & 1) t += a[i]; if (t === s) c++; } return c; };
      crossCheck(() => { const n = randInt(g, 1, 10); return make(n, randInt(g, 0, 30), randArray(g, n, 0, 8)); }, (i) => this.solve(i), (i) => { const rs = rows(i); return brute(nums(rs[1]), nums(rs[0])[1]); });
      const a18 = randArray(g, 18, 0, 1000);
      return ['4 5\n1 2 3 4\n', '1 0\n0\n', '1 5\n5\n', '1 3\n5\n', '3 0\n0 0 0\n', make(18, 0, many(18, () => 0)), make(18, 1000, many(18, () => 100)), make(18, 9000, many(18, () => 1000).map((x, i) => x - 100 * (i % 4))), make(18, 4500, a18), make(18, 18000, many(18, () => 1000)), make(18, 17999, many(18, () => 1000)), make(18, 50, randArray(g, 18, 0, 10)), make(18, 30, randArray(g, 18, 0, 6)), make(17, 2000, randArray(g, 17, 0, 300))];
    }
  },

  {
    slug: 'combinations-of-numbers',
    title: 'Choose k Numbers Out of n',
    difficulty: 'easy',
    tags: ['backtracking', 'combinations', 'pruning'],
    concept: {
      title: 'Always move forward, and stop when there are not enough numbers left',
      body: [
        'To choose `k` numbers from `1..n` without caring about their order, always choose them in **increasing** order. Then each group appears exactly once (as `1 3` and not also as `3 1`). A function that has already chosen some numbers picks the next one from the numbers **after the last chosen one**.',
        { code: 'def combine(n, k, start, current, out):\n    if len(current) == k:\n        out.append(" ".join(map(str, current)))\n        return\n    last = n - (k - len(current)) + 1   # leave room for the numbers still needed\n    for x in range(start, last + 1):\n        current.append(x)\n        combine(n, k, x + 1, current, out)\n        current.pop()' },
        'The variable `last` is a **pruning** rule: if `3` more numbers are needed, the next number cannot be larger than `n - 2`, because there would be no room for the others. Without this rule the search enters many branches that can never finish. The groups come out in dictionary order automatically.'
      ]
    },
    statement: ['Print all groups of `k` different numbers chosen from `1, 2, ..., n`. Inside a group the numbers are in increasing order. Print the groups in dictionary order (compare the first numbers, then the second numbers, and so on), one group per line.'],
    inputFormat: ['The only line has `n` and `k`.'],
    outputFormat: ['The groups, one per line, numbers separated by single spaces.'],
    constraints: ['1 <= k <= n <= 15'],
    examples: [{ input: '4 2\n', note: 'The six groups are 1 2, 1 3, 1 4, 2 3, 2 4 and 3 4.' }],
    hints: ['Choose the numbers in increasing order, so that a group is never produced twice.', 'The next number must be larger than the last chosen one.', 'Stop trying numbers that are so large that there is no room left for the numbers still needed.'],
    program: {
      io: ['n:int k:int'],
      helpers: {
        python: r`
          def combine(n, k, start, current, out):
              if len(current) == k:
                  out.append(" ".join(map(str, current)))
                  return
              last = n - (k - len(current)) + 1
              for x in range(start, last + 1):
                  current.append(x)
                  combine(n, k, x + 1, current, out)
                  current.pop()`,
        cpp: r`
          void combine(int n, int k, int start, vector<int>& current, vector<string>& out) {
              if ((int)current.size() == k) {
                  string line;
                  for (size_t i = 0; i < current.size(); i++) line += (i ? " " : "") + to_string(current[i]);
                  out.push_back(line);
                  return;
              }
              int last = n - (k - (int)current.size()) + 1;
              for (int x = start; x <= last; x++) {
                  current.push_back(x);
                  combine(n, k, x + 1, current, out);
                  current.pop_back();
              }
          }`,
        java: r`
          static void combine(int n, int k, int start, List<Integer> current, List<String> out) {
              if (current.size() == k) {
                  StringBuilder line = new StringBuilder();
                  for (int i = 0; i < current.size(); i++) line.append(i > 0 ? " " : "").append(current.get(i));
                  out.add(line.toString());
                  return;
              }
              int last = n - (k - current.size()) + 1;
              for (int x = start; x <= last; x++) {
                  current.add(x);
                  combine(n, k, x + 1, current, out);
                  current.remove(current.size() - 1);
              }
          }`
      },
      python: r`
        out = []
        combine(n, k, 1, [], out)
        print("\n".join(out))`,
      cpp: r`
        vector<string> out;
        vector<int> current;
        combine((int)n, (int)k, 1, current, out);
        for (const string& line : out) cout << line << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        combine((int) n, (int) k, 1, new ArrayList<>(), out);
        StringBuilder sb = new StringBuilder();
        for (String line : out) sb.append(line).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The function chooses the next number from `start` up to the largest value that still leaves room for the remaining numbers, recurses with `x + 1`, and removes the number again. Groups are completed in dictionary order.'], complexity: 'Time O(C(n, k) * k), space O(k) besides the output.' },
    solve(input) { const [n, k] = nums(rows(input)[0]); const groups = []; for (let mask = 1; mask < 1 << n; mask++) { const ones = []; for (let i = 0; i < n; i++) if ((mask >> i) & 1) ones.push(i + 1); if (ones.length === k) groups.push(ones); } groups.sort((p, q) => { for (let i = 0; i < k; i++) if (p[i] !== q[i]) return p[i] - q[i]; return 0; }); return groups.map((x) => x.join(' ')).join('\n'); },
    tests() { return ['4 2\n', '1 1\n', '5 5\n', '5 1\n', '6 3\n', '8 4\n', '10 5\n', '12 6\n', '15 7\n', '15 8\n', '15 1\n', '15 15\n', '15 14\n', '15 3\n', '14 10\n']; }
  },

  {
    slug: 'permutations-of-letters',
    title: 'All Orders of Different Letters',
    difficulty: 'easy',
    tags: ['backtracking', 'permutations', 'recursion'],
    concept: {
      title: 'Fill the positions one by one with letters not used yet',
      body: [
        'A **permutation** is an arrangement of all the letters in some order. Fill the positions from left to right. For each position try **every letter that has not been used yet**. A boolean array `used` remembers which letters are already placed. When all positions are filled, one permutation is complete.',
        { code: 'def permute(letters, used, current, out):\n    if len(current) == len(letters):\n        out.append("".join(current))\n        return\n    for i in range(len(letters)):\n        if not used[i]:\n            used[i] = True                  # choose\n            current.append(letters[i])\n            permute(letters, used, current, out)\n            current.pop()                   # unchoose\n            used[i] = False' },
        'If the letters are tried in alphabetical order, the permutations come out in **dictionary order** with no sorting at the end. There are `n!` permutations: 5040 for 7 letters, which is why the word is short.'
      ]
    },
    statement: ['You are given a word of `n` different lowercase letters (in any order). Print all permutations of its letters, one per line, in dictionary order.'],
    inputFormat: ['The only line has the word.'],
    outputFormat: ['The `n!` permutations in dictionary order, one per line.'],
    constraints: ['1 <= n <= 7', 'The letters are different.'],
    examples: [{ input: 'bca\n', note: 'The six permutations in dictionary order are abc, acb, bac, bca, cab and cba.' }],
    hints: ['Sort the letters first, then fill the positions from left to right.', 'Mark a letter as used when you place it and free it again after the recursive call.', 'When the arrangement has n letters, record it.'],
    program: {
      io: ['word:word'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def permute(letters, used, current, out):
              if len(current) == len(letters):
                  out.append("".join(current))
                  return
              for i in range(len(letters)):
                  if not used[i]:
                      used[i] = True
                      current.append(letters[i])
                      permute(letters, used, current, out)
                      current.pop()
                      used[i] = False`,
        cpp: r`
          void permute(const string& letters, vector<char>& used, string& current, vector<string>& out) {
              if (current.size() == letters.size()) {
                  out.push_back(current);
                  return;
              }
              for (size_t i = 0; i < letters.size(); i++) {
                  if (!used[i]) {
                      used[i] = 1;
                      current.push_back(letters[i]);
                      permute(letters, used, current, out);
                      current.pop_back();
                      used[i] = 0;
                  }
              }
          }`,
        java: r`
          static void permute(char[] letters, boolean[] used, StringBuilder current, List<String> out) {
              if (current.length() == letters.length) {
                  out.add(current.toString());
                  return;
              }
              for (int i = 0; i < letters.length; i++) {
                  if (!used[i]) {
                      used[i] = true;
                      current.append(letters[i]);
                      permute(letters, used, current, out);
                      current.deleteCharAt(current.length() - 1);
                      used[i] = false;
                  }
              }
          }`
      },
      python: r`
        out = []
        permute(sorted(word), [False] * len(word), [], out)
        print("\n".join(out))`,
      cpp: r`
        string letters = word;
        sort(letters.begin(), letters.end());
        vector<string> out;
        vector<char> used(letters.size(), 0);
        string current;
        permute(letters, used, current, out);
        for (const string& s : out) cout << s << "\n";`,
      java: r`
        char[] letters = word.toCharArray();
        Arrays.sort(letters);
        List<String> out = new ArrayList<>();
        permute(letters, new boolean[letters.length], new StringBuilder(), out);
        StringBuilder sb = new StringBuilder();
        for (String s : out) sb.append(s).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The letters are sorted, then each position tries every unused letter in order. A letter is marked used while it is placed and freed afterwards, so all `n!` arrangements are produced in dictionary order.'], complexity: 'Time O(n! * n), space O(n) besides the output.' },
    solve(input) {
      const a = [...rows(input)[0].trim()].sort(); const out = [a.join('')];
      for (;;) { let i = a.length - 2; while (i >= 0 && a[i] >= a[i + 1]) i--; if (i < 0) break; let j = a.length - 1; while (a[j] <= a[i]) j--; [a[i], a[j]] = [a[j], a[i]]; const tail = a.splice(i + 1).reverse(); a.push(...tail); out.push(a.join('')); }
      return out.join('\n');
    },
    tests() { const g = rng(618); return ['bca\n', 'a\n', 'ba\n', 'abc\n', 'zyx\n', `${shuffle(g, [...LOWER]).slice(0, 4).join('')}\n`, `${shuffle(g, [...LOWER]).slice(0, 5).join('')}\n`, `${shuffle(g, [...LOWER]).slice(0, 6).join('')}\n`, `${shuffle(g, [...LOWER]).slice(0, 7).join('')}\n`, 'gfedcba\n', 'abcdefg\n']; }
  },

  {
    slug: 'derangements-by-search',
    title: 'Nobody in Their Own Place',
    difficulty: 'easy',
    tags: ['backtracking', 'permutations', 'counting'],
    concept: {
      title: 'A permutation search with a rule for every position',
      body: [
        'Fill positions `0 .. n-1` with the numbers `0 .. n-1`, each number used once, as in a normal permutation search. The new rule is on **every single choice**: the number placed at position `p` must not be `p` itself. A choice that breaks the rule is simply not tried.',
        { code: 'def count(n, position, used):\n    if position == n:\n        return 1\n    total = 0\n    for value in range(n):\n        if not used[value] and value != position:     # the rule\n            used[value] = True\n            total += count(n, position + 1, used)\n            used[value] = False\n    return total' },
        'Checking a rule **while building** (instead of building everything and filtering at the end) is what makes backtracking faster than brute force: for `n = 9` there are 362880 permutations, but the search never even starts most of the arrangements that break the rule early. The answers 1, 0, 1, 2, 9, 44, 265, 1854, 14833, 133496 are known as *derangement numbers*.'
      ]
    },
    statement: ['Count the permutations of the numbers `1, 2, ..., n` in which no number stands at its own position, that is, the number at position `i` is never `i`.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['Print the number of such permutations.'],
    constraints: ['1 <= n <= 9'],
    examples: [{ input: '3\n', note: 'The permutations 2 3 1 and 3 1 2 are the only ones with no fixed place.' }],
    hints: ['Fill the positions one by one with numbers that are not used yet.', 'Skip the number that equals the position you are filling.', 'When all positions are filled, count one permutation.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def count(n, position, used):
              if position == n:
                  return 1
              total = 0
              for value in range(n):
                  if not used[value] and value != position:
                      used[value] = True
                      total += count(n, position + 1, used)
                      used[value] = False
              return total`,
        cpp: r`
          long long countDerangements(int n, int position, vector<char>& used) {
              if (position == n) return 1;
              long long total = 0;
              for (int value = 0; value < n; value++) {
                  if (!used[value] && value != position) {
                      used[value] = 1;
                      total += countDerangements(n, position + 1, used);
                      used[value] = 0;
                  }
              }
              return total;
          }`,
        java: r`
          static long countDerangements(int n, int position, boolean[] used) {
              if (position == n) return 1;
              long total = 0;
              for (int value = 0; value < n; value++) {
                  if (!used[value] && value != position) {
                      used[value] = true;
                      total += countDerangements(n, position + 1, used);
                      used[value] = false;
                  }
              }
              return total;
          }`
      },
      python: 'print(count(n, 0, [False] * n))',
      cpp: r`
        vector<char> used(n, 0);
        cout << countDerangements((int)n, 0, used) << "\n";`,
      java: 'System.out.println(countDerangements((int) n, 0, new boolean[(int) n]));'
    },
    solution: { explanation: ['The search fills position after position with unused numbers other than the position itself. Each complete arrangement is one derangement.'], complexity: 'Time O(D(n) * n) about, space O(n).' },
    solve(input) { const n = Number(rows(input)[0]); const d = [1n, 0n]; for (let i = 2; i <= n; i++) d.push(BigInt(i - 1) * (d[i - 1] + d[i - 2])); return String(d[n]); },
    tests() { return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${n}\n`); }
  },

  {
    slug: 'no-two-adjacent-ones',
    title: 'Binary Strings Without Two Ones in a Row',
    difficulty: 'easy',
    tags: ['backtracking', 'strings', 'pruning'],
    concept: {
      title: 'Check the rule before the choice, not after the string is done',
      body: [
        'To generate all binary strings of length `n`, decide the characters from left to right: every position has two choices, `0` and `1`. Here a rule is added: two neighbouring characters must not both be `1`. The rule only concerns the **last** character placed and the new one, so it can be checked immediately.',
        { code: 'def build(n, current, out):\n    if len(current) == n:\n        out.append("".join(current))\n        return\n    current.append("0")                  # a 0 is always allowed\n    build(n, current, out)\n    current.pop()\n    if not current or current[-1] != "1":   # a 1 only after a 0 or at the start\n        current.append("1")\n        build(n, current, out)\n        current.pop()' },
        'Strings that break the rule are never started, so no time is lost on them. Trying `0` before `1` produces the strings in increasing order. The number of valid strings follows the Fibonacci numbers (for `n = 14` there are 987), far fewer than the `2^14 = 16384` strings of all kinds.'
      ]
    },
    statement: ['Print all binary strings of length `n` (made of `0` and `1`) that do not contain two `1` characters next to each other. Print them in increasing order (as binary strings), one per line.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['The strings in increasing order, one per line.'],
    constraints: ['1 <= n <= 14'],
    examples: [{ input: '3\n', note: 'The valid strings are 000, 001, 010, 100 and 101.' }],
    hints: ['Build the string from left to right; a 0 can always be added.', 'A 1 can be added only if the string is empty or ends with a 0.', 'Try 0 first and then 1 to get the strings in increasing order.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def build(n, current, out):
              if len(current) == n:
                  out.append("".join(current))
                  return
              current.append("0")
              build(n, current, out)
              current.pop()
              if not current or current[-1] != "1":
                  current.append("1")
                  build(n, current, out)
                  current.pop()`,
        cpp: r`
          void build(int n, string& current, vector<string>& out) {
              if ((int)current.size() == n) {
                  out.push_back(current);
                  return;
              }
              current.push_back('0');
              build(n, current, out);
              current.pop_back();
              if (current.empty() || current.back() != '1') {
                  current.push_back('1');
                  build(n, current, out);
                  current.pop_back();
              }
          }`,
        java: r`
          static void build(int n, StringBuilder current, List<String> out) {
              if (current.length() == n) {
                  out.add(current.toString());
                  return;
              }
              current.append('0');
              build(n, current, out);
              current.deleteCharAt(current.length() - 1);
              if (current.length() == 0 || current.charAt(current.length() - 1) != '1') {
                  current.append('1');
                  build(n, current, out);
                  current.deleteCharAt(current.length() - 1);
              }
          }`
      },
      python: r`
        out = []
        build(n, [], out)
        print("\n".join(out))`,
      cpp: r`
        vector<string> out;
        string current;
        build((int)n, current, out);
        for (const string& s : out) cout << s << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        build((int) n, new StringBuilder(), out);
        StringBuilder sb = new StringBuilder();
        for (String s : out) sb.append(s).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The string grows by one character per call. A `0` is always allowed and a `1` only when the string is empty or ends with `0`. Trying `0` first gives increasing order.'], complexity: 'Time O(F(n) * n), where F(n) is the number of valid strings; space O(n) besides the output.' },
    solve(input) { const n = Number(rows(input)[0]); const out = []; for (let v = 0; v < 2 ** n; v++) { const s = v.toString(2).padStart(n, '0'); if (!s.includes('11')) out.push(s); } return out.join('\n'); },
    tests() { return [1, 2, 3, 4, 5, 6, 8, 10, 12, 13, 14].map((n) => `${n}\n`); }
  },

  {
    slug: 'balanced-parentheses-list',
    title: 'Generate the Balanced Brackets',
    difficulty: 'easy',
    tags: ['backtracking', 'strings', 'parentheses'],
    concept: {
      title: 'Count what is open, and never close more than you opened',
      body: [
        'A string of brackets is balanced if every `(` is closed by a later `)` and no `)` comes before its `(`. Build the string from left to right and remember two numbers: how many `(` and how many `)` were placed so far. There are exactly two rules:',
        '- an opening bracket may be added while fewer than `n` were used;\n- a closing bracket may be added only while there are more `(` than `)` in the string, so that every `)` has an open bracket to close.',
        { code: 'def build(n, opened, closed, current, out):\n    if len(current) == 2 * n:\n        out.append("".join(current))\n        return\n    if opened < n:\n        current.append("(")\n        build(n, opened + 1, closed, current, out)\n        current.pop()\n    if closed < opened:\n        current.append(")")\n        build(n, opened, closed + 1, current, out)\n        current.pop()' },
        'Because the rules are checked at every step, **every** string that is started can be finished, and no unbalanced string is ever built. In the ASCII table `(` comes before `)`, so trying `(` first produces the strings in dictionary order. The number of strings is the Catalan number (1430 for `n = 8`).'
      ]
    },
    statement: ['Print all balanced strings made of `n` pairs of brackets `(` and `)`, in dictionary order (where `(` is smaller than `)`), one per line.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['All balanced strings in dictionary order, one per line.'],
    constraints: ['1 <= n <= 8'],
    examples: [{ input: '3\n', note: 'The five strings are ((())), (()()), (())(), ()(()) and ()()().' }],
    hints: ['Remember how many opening and closing brackets are used so far.', 'You may add ( if fewer than n opening brackets were used.', 'You may add ) only if the string has more ( than ).'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def build(n, opened, closed, current, out):
              if len(current) == 2 * n:
                  out.append("".join(current))
                  return
              if opened < n:
                  current.append("(")
                  build(n, opened + 1, closed, current, out)
                  current.pop()
              if closed < opened:
                  current.append(")")
                  build(n, opened, closed + 1, current, out)
                  current.pop()`,
        cpp: r`
          void build(int n, int opened, int closed, string& current, vector<string>& out) {
              if ((int)current.size() == 2 * n) {
                  out.push_back(current);
                  return;
              }
              if (opened < n) {
                  current.push_back('(');
                  build(n, opened + 1, closed, current, out);
                  current.pop_back();
              }
              if (closed < opened) {
                  current.push_back(')');
                  build(n, opened, closed + 1, current, out);
                  current.pop_back();
              }
          }`,
        java: r`
          static void build(int n, int opened, int closed, StringBuilder current, List<String> out) {
              if (current.length() == 2 * n) {
                  out.add(current.toString());
                  return;
              }
              if (opened < n) {
                  current.append('(');
                  build(n, opened + 1, closed, current, out);
                  current.deleteCharAt(current.length() - 1);
              }
              if (closed < opened) {
                  current.append(')');
                  build(n, opened, closed + 1, current, out);
                  current.deleteCharAt(current.length() - 1);
              }
          }`
      },
      python: r`
        out = []
        build(n, 0, 0, [], out)
        print("\n".join(out))`,
      cpp: r`
        vector<string> out;
        string current;
        build((int)n, 0, 0, current, out);
        for (const string& s : out) cout << s << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        build((int) n, 0, 0, new StringBuilder(), out);
        StringBuilder sb = new StringBuilder();
        for (String s : out) sb.append(s).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The string is built left to right. `(` is allowed while fewer than `n` were used and `)` while it has an open bracket to close. Trying `(` first gives dictionary order.'], complexity: 'Time O(Catalan(n) * n), space O(n) besides the output.' },
    solve(input) {
      const n = Number(rows(input)[0]); const out = [];
      for (let v = 0; v < 2 ** (2 * n); v++) { const s = v.toString(2).padStart(2 * n, '0').replaceAll('0', '(').replaceAll('1', ')'); let bal = 0, ok = true; for (const c of s) { bal += c === '(' ? 1 : -1; if (bal < 0) { ok = false; break; } } if (ok && bal === 0) out.push(s); }
      return out.join('\n');
    },
    tests() { return [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `${n}\n`); }
  },

  {
    slug: 'phone-keypad-words',
    title: 'Letters on a Phone Keypad',
    difficulty: 'easy',
    tags: ['backtracking', 'strings', 'recursion'],
    concept: {
      title: 'One digit, one choice among its letters',
      body: [
        'On an old phone keypad every digit stands for a few letters: `2` is `abc`, `3` is `def`, `4` is `ghi`, `5` is `jkl`, `6` is `mno`, `7` is `pqrs`, `8` is `tuv`, `9` is `wxyz`. A string of digits stands for many words: for every digit you choose **one** of its letters.',
        'That is a search with a fixed depth, one level for each digit. At level `pos`, try each letter of the digit, add it to the word, recurse on the next digit, and take it away again:',
        { code: 'def words(digits, pos, current, out):\n    if pos == len(digits):\n        out.append("".join(current))\n        return\n    for letter in PAD[digits[pos]]:\n        current.append(letter)\n        words(digits, pos + 1, current, out)\n        current.pop()' },
        'The number of words is the product of the letter counts (at most `4^6 = 4096` here). Going through the letters of a key in alphabetical order puts the words in dictionary order.'
      ]
    },
    statement: ['A phone keypad has these letters: 2 = abc, 3 = def, 4 = ghi, 5 = jkl, 6 = mno, 7 = pqrs, 8 = tuv, 9 = wxyz. Given a string of digits from 2 to 9, print all words (one letter for every digit) that it can stand for, in dictionary order, one word per line.'],
    inputFormat: ['The only line has the digits.'],
    outputFormat: ['All words in dictionary order, one per line.'],
    constraints: ['1 <= number of digits <= 6', 'Every digit is between 2 and 9.'],
    examples: [{ input: '23\n', note: 'The words are ad ae af bd be bf cd ce cf.' }],
    hints: ['Handle the digits from left to right: one level of recursion per digit.', 'For the current digit try each of its letters in alphabetical order.', 'When all digits are used, the word is complete.'],
    program: {
      io: ['digits:word'],
      helpers: {
        python: r`
          PAD = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}

          def words(digits, pos, current, out):
              if pos == len(digits):
                  out.append("".join(current))
                  return
              for letter in PAD[digits[pos]]:
                  current.append(letter)
                  words(digits, pos + 1, current, out)
                  current.pop()`,
        cpp: r`
          const string PAD[10] = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

          void words(const string& digits, size_t pos, string& current, vector<string>& out) {
              if (pos == digits.size()) {
                  out.push_back(current);
                  return;
              }
              for (char letter : PAD[digits[pos] - '0']) {
                  current.push_back(letter);
                  words(digits, pos + 1, current, out);
                  current.pop_back();
              }
          }`,
        java: r`
          static final String[] PAD = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

          static void words(String digits, int pos, StringBuilder current, List<String> out) {
              if (pos == digits.length()) {
                  out.add(current.toString());
                  return;
              }
              for (char letter : PAD[digits.charAt(pos) - '0'].toCharArray()) {
                  current.append(letter);
                  words(digits, pos + 1, current, out);
                  current.deleteCharAt(current.length() - 1);
              }
          }`
      },
      python: r`
        out = []
        words(digits, 0, [], out)
        print("\n".join(out))`,
      cpp: r`
        vector<string> out;
        string current;
        words(digits, 0, current, out);
        for (const string& s : out) cout << s << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        words(digits, 0, new StringBuilder(), out);
        StringBuilder sb = new StringBuilder();
        for (String s : out) sb.append(s).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Level `pos` of the recursion chooses the letter for digit number `pos`. After the last digit the word is recorded. Alphabetical order of the letters gives dictionary order of the words.'], complexity: 'Time O(number of words * length), at most 4096 words.' },
    solve(input) { const pad = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' }; let words = ['']; for (const d of rows(input)[0].trim()) words = words.flatMap((w) => [...pad[d]].map((c) => w + c)); return words.join('\n'); },
    tests() { const g = rng(619); const digits = (n) => many(n, () => randInt(g, 2, 9)).join(''); return ['23\n', '2\n', '7\n', '9\n', '79\n', '234\n', '7777\n', '9999\n', '999999\n', '777777\n', `${digits(3)}\n`, `${digits(5)}\n`, `${digits(6)}\n`, `${digits(6)}\n`, '222222\n']; }
  },

  {
    slug: 'gray-code-list',
    title: 'The Gray Code',
    difficulty: 'easy',
    tags: ['recursion', 'bits', 'strings'],
    concept: {
      title: 'Reflect the smaller list',
      body: [
        'A **Gray code** is an order of all binary strings of length `n` in which each string differs from the next one in exactly one position. There is a beautiful recursive way to build it: take the Gray code of length `n - 1`, put a `0` in front of every string; then take the same list **in reverse order** and put a `1` in front of every string; write the two lists one after the other.',
        { code: 'def gray(n):\n    if n == 0:\n        return [""]                      # one empty string\n    smaller = gray(n - 1)\n    return ["0" + code for code in smaller] + ["1" + code for code in reversed(smaller)]' },
        'Why does it work? Inside each half the neighbours differ in one place because the smaller list already does. Where the halves meet, the last string of the first half and the first string of the second half are the **same** string of length `n - 1` (that is why the list is reversed), and they differ only in the new first character. For `n = 2` the list is `00 01 11 10`.'
      ]
    },
    statement: ['The Gray code of length 0 is the list with one empty string. The Gray code of length `n` is: every string of the Gray code of length `n - 1` with `0` added in front (in the same order), followed by every string of the Gray code of length `n - 1` with `1` added in front, in reverse order. Print the Gray code of length `n`, one string per line.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['The `2^n` strings, one per line.'],
    constraints: ['1 <= n <= 12'],
    examples: [{ input: '3\n', note: 'The list is 000 001 011 010 110 111 101 100: neighbours differ in one place.' }],
    hints: ['The Gray code of length 0 is a list with one empty string.', 'Build the list for n from the list for n - 1: first the strings with 0 in front, then the reversed list with 1 in front.', 'Compute the smaller list once and use it twice.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def gray(n):
              if n == 0:
                  return [""]
              smaller = gray(n - 1)
              return ["0" + code for code in smaller] + ["1" + code for code in reversed(smaller)]`,
        cpp: r`
          vector<string> gray(int n) {
              if (n == 0) return {""};
              vector<string> smaller = gray(n - 1);
              vector<string> result;
              for (const string& code : smaller) result.push_back("0" + code);
              for (int i = (int)smaller.size() - 1; i >= 0; i--) result.push_back("1" + smaller[i]);
              return result;
          }`,
        java: r`
          static List<String> gray(int n) {
              if (n == 0) return new ArrayList<>(List.of(""));
              List<String> smaller = gray(n - 1);
              List<String> result = new ArrayList<>();
              for (String code : smaller) result.add("0" + code);
              for (int i = smaller.size() - 1; i >= 0; i--) result.add("1" + smaller.get(i));
              return result;
          }`
      },
      python: 'print("\\n".join(gray(n)))',
      cpp: r`
        for (const string& code : gray((int)n)) cout << code << "\n";`,
      java: r`
        StringBuilder sb = new StringBuilder();
        for (String code : gray((int) n)) sb.append(code).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The list for `n` is the list for `n - 1` with `0` in front, followed by the same list reversed with `1` in front. The two halves meet at the same string, so neighbours always differ in one place.'], complexity: 'Time O(2^n * n), space O(2^n * n).' },
    solve(input) { const n = Number(rows(input)[0]); return many(2 ** n, (i) => (i ^ (i >> 1)).toString(2).padStart(n, '0')).join('\n'); },
    tests() { return [1, 2, 3, 4, 5, 6, 8, 10, 11, 12].map((n) => `${n}\n`); }
  },

  {
    slug: 'equal-sum-split',
    title: 'Two Piles With the Same Sum',
    difficulty: 'easy',
    tags: ['backtracking', 'subsets', 'pruning'],
    concept: {
      title: 'Find one subset with half of the total',
      body: [
        'Splitting the numbers into two piles with equal sums means: the total is even, and some subset has the sum `total / 2` (the other numbers then also add up to `total / 2`). So the question is whether **one subset reaches a given target**.',
        'The search takes or leaves each number and stops at the **first** success: if the target is reached, return `True` at once and let all the calls above return `True` too.',
        { code: 'def find(a, i, remaining):\n    if remaining == 0:\n        return True                    # found: stop everything\n    if i == len(a) or remaining < 0:\n        return False\n    return find(a, i + 1, remaining - a[i]) or find(a, i + 1, remaining)' },
        'The `or` is lazy: if the first call returns `True`, the second one is not even started. A search that looks for **one** solution can stop early; a search that has to count or list all solutions cannot. If the total is odd, the answer is `no` without any search.'
      ]
    },
    statement: ['Given `n` positive integers, decide whether they can be split into two piles with the same sum. Every number goes to exactly one of the piles.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20', '1 <= each number <= 1000'],
    examples: [{ input: '5\n3 1 1 2 1\n', note: 'The total is 8. The piles {3, 1} and {1, 2, 1} both have sum 4.' }],
    hints: ['If the total is odd, the answer is no.', 'Otherwise look for any subset whose sum is half of the total.', 'For every number take it or leave it, and stop as soon as the missing amount is 0 or negative.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      helpers: {
        python: r`
          def find(a, i, remaining):
              if remaining == 0:
                  return True
              if i == len(a) or remaining < 0:
                  return False
              return find(a, i + 1, remaining - a[i]) or find(a, i + 1, remaining)`,
        cpp: r`
          bool findSubset(const vector<long long>& a, size_t i, long long remaining) {
              if (remaining == 0) return true;
              if (i == a.size() || remaining < 0) return false;
              return findSubset(a, i + 1, remaining - a[i]) || findSubset(a, i + 1, remaining);
          }`,
        java: r`
          static boolean findSubset(long[] a, int i, long remaining) {
              if (remaining == 0) return true;
              if (i == a.length || remaining < 0) return false;
              return findSubset(a, i + 1, remaining - a[i]) || findSubset(a, i + 1, remaining);
          }`
      },
      python: r`
        total = sum(a)
        print("yes" if total % 2 == 0 and find(a, 0, total // 2) else "no")`,
      cpp: r`
        long long total = 0;
        for (long long x : a) total += x;
        cout << (total % 2 == 0 && findSubset(a, 0, total / 2) ? "yes" : "no") << "\n";`,
      java: r`
        long total = 0;
        for (long x : a) total += x;
        System.out.println(total % 2 == 0 && findSubset(a, 0, total / 2) ? "yes" : "no");`
    },
    solution: { explanation: ['An odd total gives `no`. Otherwise the search takes or leaves each number looking for a subset with half of the total and stops at the first success.'], complexity: 'Time O(2^n) in the worst case, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const total = a.reduce((x, y) => x + y, 0); if (total % 2) return 'no'; let reach = new Set([0]); for (const x of a) reach = new Set([...reach, ...[...reach].map((s) => s + x)]); return reach.has(total / 2) ? 'yes' : 'no'; },
    tests() {
      const g = rng(620);
      const make = (a) => `${a.length}\n${a.join(' ')}\n`;
      const brute = (a) => { const total = a.reduce((x, y) => x + y, 0); for (let mask = 0; mask < 1 << a.length; mask++) { let t = 0; for (let i = 0; i < a.length; i++) if ((mask >> i) & 1) t += a[i]; if (2 * t === total) return 'yes'; } return 'no'; };
      crossCheck(() => make(randArray(g, randInt(g, 1, 12), 1, 9)), (i) => this.solve(i), (i) => brute(nums(rows(i)[1])));
      const noButEven = many(20, () => 2 * randInt(g, 1, 500)); if ((noButEven.reduce((x, y) => x + y, 0) / 2) % 2 === 0) noButEven[0] += 2;
      return ['5\n3 1 1 2 1\n', '1\n4\n', '2\n5 5\n', '2\n5 6\n', '3\n1 2 4\n', make(many(20, () => 1)), make(many(20, () => 1000)), make(noButEven), make(randArray(g, 20, 1, 1000)), make(randArray(g, 20, 1, 50)), make(many(20, (i) => i + 1)), make(many(19, () => 1000).concat([999])), make([...many(19, () => 2), 3]), make(many(20, (i) => 2 * (i + 1)))];
    }
  }
];
