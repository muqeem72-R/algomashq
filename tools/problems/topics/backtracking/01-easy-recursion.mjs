import { r, rng, randInt, many, nums, rows, bigs, randWord, shuffle } from '../../lib.mjs';

// Runs fast(input) against a slow, independent computation on many small random inputs; throws when they differ.
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };

const SMALL = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const below1000 = (n) => { const w = []; if (n >= 100) { w.push(SMALL[Math.floor(n / 100)], 'hundred'); n %= 100; } if (n >= 20) { w.push(TENS[Math.floor(n / 10)]); n %= 10; if (n > 0) w.push(SMALL[n]); } else if (n > 0) w.push(SMALL[n]); return w; };
const inWords = (n) => { if (n === 0) return 'zero'; const scale = ['', 'thousand', 'million', 'billion']; const words = []; for (let g = 3; g >= 0; g--) { const part = Math.floor(n / 1000 ** g) % 1000; if (part > 0) { words.push(...below1000(part)); if (scale[g]) words.push(scale[g]); } } return words.join(' '); };

export default [
  {
    slug: 'integer-partitions',
    title: 'Ways to Split a Number Into Parts',
    difficulty: 'easy',
    tags: ['recursion', 'memoization', 'counting'],
    concept: {
      title: 'Count by the largest part you may still use',
      body: [
        'Write `n` as a sum of positive integers. The order of the parts does not matter, so `3 + 2` and `2 + 3` are the same way. To avoid counting an order twice, write the parts from the biggest to the smallest and think of the problem as `parts(n, m)`: the number of ways to write `n` with parts that are **at most `m`**.',
        'Look at the biggest part `m`. Either at least one part is equal to `m`: take it away and write `n - m` with parts at most `m` again. Or no part is equal to `m`: write `n` with parts at most `m - 1`. The two cases never overlap and together they cover everything:',
        { code: 'def parts(n, m):\n    if n == 0:\n        return 1               # the empty sum: one way\n    if m == 0:\n        return 0               # nothing left to use, but n > 0\n    if m > n:\n        m = n                  # a part cannot be bigger than n\n    return parts(n - m, m) + parts(n, m - 1)' },
        'The same pair `(n, m)` is reached by many different paths, so store each answer in a table (a **memo**) the first time it is computed. With the table there are only `n * n` different states.'
      ]
    },
    statement: ['Count the ways to write `n` as a sum of positive integers when the order of the parts does not matter (`3 + 2` and `2 + 3` are one way). The number `n` itself is also a way.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['Print the number of ways.'],
    constraints: ['1 <= n <= 100 (the answer for 100 is 190569292)'],
    examples: [{ input: '5\n', note: 'The 7 ways are 5, 4+1, 3+2, 3+1+1, 2+2+1, 2+1+1+1 and 1+1+1+1+1.' }],
    hints: ['Define parts(n, m) as the number of ways to write n with parts of size at most m.', 'Either use a part of size m (then n - m is left, with parts at most m) or do not use it (parts at most m - 1).', 'Without a table the same states are computed again and again: store every answer.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          memo = {}

          def parts(n, m):
              if n == 0:
                  return 1
              if m == 0:
                  return 0
              if m > n:
                  m = n
              if (n, m) not in memo:
                  memo[(n, m)] = parts(n - m, m) + parts(n, m - 1)
              return memo[(n, m)]`,
        cpp: r`
          vector<vector<long long>> memo(101, vector<long long>(101, -1));

          long long parts(int n, int m) {
              if (n == 0) return 1;
              if (m == 0) return 0;
              if (m > n) m = n;
              if (memo[n][m] < 0) memo[n][m] = parts(n - m, m) + parts(n, m - 1);
              return memo[n][m];
          }`,
        java: r`
          static long[][] memo = new long[101][101];
          static {
              for (long[] row : memo) Arrays.fill(row, -1);
          }

          static long parts(int n, int m) {
              if (n == 0) return 1;
              if (m == 0) return 0;
              if (m > n) m = n;
              if (memo[n][m] < 0) memo[n][m] = parts(n - m, m) + parts(n, m - 1);
              return memo[n][m];
          }`
      },
      python: 'print(parts(n, n))',
      cpp: 'cout << parts((int)n, (int)n) << "\\n";',
      java: 'System.out.println(parts((int) n, (int) n));'
    },
    solution: { explanation: ['`parts(n, m)` is the number of ways to write `n` with parts of size at most `m`. It equals the ways that use a part `m` (`parts(n - m, m)`) plus the ways that do not (`parts(n, m - 1)`). The memo makes each of the `n * n` states cost one addition.'], complexity: 'Time O(n^2), space O(n^2).' },
    solve(input) { const n = Number(rows(input)[0]); const p = Array(n + 1).fill(0n); p[0] = 1n; for (let part = 1; part <= n; part++) for (let s = part; s <= n; s++) p[s] += p[s - part]; return String(p[n]); },
    tests() { return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 99, 100].map((n) => `${n}\n`); }
  },

  {
    slug: 'stair-climbing-with-broken-steps',
    title: 'Stairs With Broken Steps',
    difficulty: 'easy',
    tags: ['recursion', 'memoization', 'counting'],
    concept: {
      title: 'Count the ways by asking where you came from',
      body: [
        'To stand on step `n` you came from step `n - 1` (a 1-step move) or from step `n - 2` (a 2-step move). So `ways(n) = ways(n - 1) + ways(n - 2)`. The base cases are: `ways(0) = 1` (you start there, one way to be there) and the `ways` of a step below 0 is 0.',
        'A **broken step** is a step you cannot stand on: its `ways` is simply 0, whatever is below it. Plain recursion repeats the same steps again and again, so keep a table of the values already computed (a **memo**).',
        { code: 'def ways(step, blocked, memo):\n    if step < 0 or blocked[step]:\n        return 0\n    if step == 0:\n        return 1\n    if memo[step] < 0:\n        memo[step] = ways(step - 1, blocked, memo) + ways(step - 2, blocked, memo)\n    return memo[step]' },
        'This is how many counting problems start: **define the answer for a smaller state, write how a state depends on smaller states, and cache the results**. The answer can reach about 4.6 * 10^18, which still fits in a 64-bit integer.'
      ]
    },
    statement: ['You stand on step 0 of a staircase with steps numbered 0 to `n`. In one move you climb 1 or 2 steps. `m` of the steps are broken and you must never stand on them. Count the different sequences of moves that take you to step `n`.'],
    inputFormat: ['The first line has `n` and `m`.', 'The second line has the numbers of the `m` broken steps.'],
    outputFormat: ['Print the number of ways (it can be 0).'],
    constraints: ['3 <= n <= 90', '1 <= m <= n - 2', 'Every broken step is between 1 and n - 1, and the numbers are different.'],
    examples: [{ input: '5 1\n3\n', note: 'Step 3 is broken, so you must stand on step 2 and step 4: the moves are 1+1+2+1 and 2+2+1.' }],
    hints: ['You reach step s from step s - 1 or s - 2, so add the two counts.', 'A broken step has 0 ways, and the start (step 0) has 1 way.', 'Store the results in a table so that each step is computed once.'],
    program: {
      io: ['n:int m:int', 'broken:int[m]'],
      helpers: {
        python: r`
          def ways(step, blocked, memo):
              if step < 0 or blocked[step]:
                  return 0
              if step == 0:
                  return 1
              if memo[step] < 0:
                  memo[step] = ways(step - 1, blocked, memo) + ways(step - 2, blocked, memo)
              return memo[step]`,
        cpp: r`
          long long ways(int step, const vector<char>& blocked, vector<long long>& memo) {
              if (step < 0 || blocked[step]) return 0;
              if (step == 0) return 1;
              if (memo[step] < 0) memo[step] = ways(step - 1, blocked, memo) + ways(step - 2, blocked, memo);
              return memo[step];
          }`,
        java: r`
          static long ways(int step, boolean[] blocked, long[] memo) {
              if (step < 0 || blocked[step]) return 0;
              if (step == 0) return 1;
              if (memo[step] < 0) memo[step] = ways(step - 1, blocked, memo) + ways(step - 2, blocked, memo);
              return memo[step];
          }`
      },
      python: r`
        blocked = [False] * (n + 1)
        for b in broken:
            blocked[b] = True
        memo = [-1] * (n + 1)
        print(ways(n, blocked, memo))`,
      cpp: r`
        vector<char> blocked(n + 1, 0);
        for (int i = 0; i < m; i++) blocked[broken[i]] = 1;
        vector<long long> memo(n + 1, -1);
        cout << ways((int)n, blocked, memo) << "\n";`,
      java: r`
        boolean[] blocked = new boolean[(int) n + 1];
        for (int i = 0; i < m; i++) blocked[(int) broken[i]] = true;
        long[] memo = new long[(int) n + 1];
        Arrays.fill(memo, -1);
        System.out.println(ways((int) n, blocked, memo));`
    },
    solution: { explanation: ['`ways(step)` is 0 for a broken step or a step below 0, 1 for step 0, and the sum of the two previous steps otherwise. The table makes each step cost one addition.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const rs = rows(input); const [n] = nums(rs[0]); const bad = new Set(nums(rs[1])); const w = [1n]; for (let s = 1; s <= n; s++) w.push(bad.has(s) ? 0n : w[s - 1] + (s >= 2 ? w[s - 2] : 0n)); return String(w[n]); },
    tests() {
      const g = rng(607);
      const make = (n, bad) => `${n} ${bad.length}\n${bad.join(' ')}\n`;
      const pick = (n, m) => { const set = new Set(); while (set.size < m) set.add(randInt(g, 1, n - 1)); return [...set]; };
      const naive = (n, bad) => { const f = (s) => (s < 0 || bad.has(s) ? 0 : s === 0 ? 1 : f(s - 1) + f(s - 2)); return f(n); };
      crossCheck(() => { const n = randInt(g, 3, 18); return make(n, pick(n, randInt(g, 1, Math.min(n - 2, 6)))); }, (i) => this.solve(i), (i) => { const rs = rows(i); return naive(nums(rs[0])[0], new Set(nums(rs[1]))); });
      return ['5 1\n3\n', '3 1\n1\n', '3 1\n2\n', '4 2\n1 3\n', '4 2\n2 3\n', '10 3\n3 5 8\n', make(90, [45]), make(90, [89]), make(90, [1]), make(90, pick(90, 5)), make(90, pick(90, 30)), make(60, pick(60, 10)), make(90, [10, 20, 30, 40, 50, 60, 70, 80]), make(90, many(44, (i) => 2 * i + 2).filter((s) => s < 90))];
    }
  },

  {
    slug: 'lucky-numbers-four-seven',
    title: 'Numbers Made of Fours and Sevens',
    difficulty: 'easy',
    tags: ['recursion', 'enumeration', 'numbers'],
    concept: {
      title: 'Grow a number one digit at a time and stop when it is too big',
      body: [
        'A number made only of the digits 4 and 7 can be built from a shorter one by **appending** a digit: from `x` you get `x * 10 + 4` and `x * 10 + 7`. That is a tree of numbers: 4 and 7 at the top, then 44, 47, 74, 77, then eight numbers with three digits, and so on.',
        'To count the ones that are at most `limit`, walk this tree with a recursive function. As soon as a number is **bigger than the limit**, none of its children can be small enough either (appending a digit only makes it bigger), so the whole branch is cut off.',
        { code: 'def count(x, limit):\n    if x > limit:\n        return 0              # this branch is too big: stop\n    return 1 + count(x * 10 + 4, limit) + count(x * 10 + 7, limit)\n\nprint(count(4, limit) + count(7, limit))' },
        'Cutting a branch that cannot lead to an answer is the idea of **pruning**, the most important tool of backtracking. Here the tree has about half a million numbers at most (2 + 4 + ... + 2^18), so every number is visited once.'
      ]
    },
    statement: ['A positive integer is *lucky* if all its decimal digits are 4 or 7 (for example 4, 47, 7744). Count the lucky numbers that are not greater than `n`.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['Print the number of lucky numbers up to `n`.'],
    constraints: ['1 <= n <= 10^18'],
    examples: [{ input: '100\n', note: 'The lucky numbers are 4, 7, 44, 47, 74 and 77.' }],
    hints: ['Build the numbers by appending a 4 or a 7 to a shorter lucky number.', 'If a number is already greater than n, appending more digits cannot help: return 0.', 'Start the recursion from 4 and from 7 and add the two results.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def count(x, limit):
              if x > limit:
                  return 0
              return 1 + count(x * 10 + 4, limit) + count(x * 10 + 7, limit)`,
        cpp: r`
          long long countLucky(long long x, long long limit) {
              if (x > limit) return 0;
              return 1 + countLucky(x * 10 + 4, limit) + countLucky(x * 10 + 7, limit);
          }`,
        java: r`
          static long countLucky(long x, long limit) {
              if (x > limit) return 0;
              return 1 + countLucky(x * 10 + 4, limit) + countLucky(x * 10 + 7, limit);
          }`
      },
      python: 'print(count(4, n) + count(7, n))',
      cpp: 'cout << countLucky(4, n) + countLucky(7, n) << "\\n";',
      java: 'System.out.println(countLucky(4, n) + countLucky(7, n));'
    },
    solution: { explanation: ['Every lucky number is reached once by appending digits to 4 or 7. A number above the limit returns 0 and its branch is not explored further. A lucky number of at most 18 digits is below 7.8 * 10^17, so the numbers never overflow 64 bits.'], complexity: 'Time O(number of lucky numbers up to n), at most about 5 * 10^5.' },
    solve(input) {
      const s = rows(input)[0].trim(); const len = s.length; let total = 0;
      for (let d = 1; d < len; d++) total += 2 ** d;
      let rest = 0;
      for (let i = 0; i < len; i++) {
        const c = Number(s[i]);
        for (const o of [4, 7]) if (o < c) rest += 2 ** (len - i - 1);
        if (c !== 4 && c !== 7) return String(total + rest);
      }
      return String(total + rest + 1);
    },
    tests() {
      const g = rng(609);
      const lucky = (d) => many(d, () => (g() < 0.5 ? '4' : '7')).join('');
      return ['100\n', '1\n', '3\n', '4\n', '5\n', '7\n', '8\n', '43\n', '44\n', '45\n', '47\n', '48\n', '74\n', '77\n', '78\n', '777\n', '4444\n', '1000000000\n', '777777777\n', '1000000000000000000\n', '777777777777777777\n', '777777777777777776\n', '444444444444444444\n', '444444444444444443\n', '474747474747474747\n', `${lucky(17)}\n`, `${lucky(18)}\n`, `${lucky(9)}\n`, `${randInt(g, 1, 999999999)}${randInt(g, 100000000, 999999999)}\n`];
    }
  },

  {
    slug: 'cut-a-number-into-parts',
    title: 'Every Way to Cut a Number',
    difficulty: 'easy',
    tags: ['recursion', 'backtracking', 'strings'],
    concept: {
      title: 'At every gap: cut or do not cut',
      body: [
        'A string of `n` digits has `n - 1` gaps between neighbouring digits. In each gap you either put a cut or you do not, so there are `2^(n - 1)` ways to cut the string into consecutive parts. A recursive function can walk through all of them: it stands at a position `pos`, tries every possible **end** of the next part, and calls itself for the position after that end.',
        { code: 'def total(pos, so_far):\n    if pos == n:                   # the whole string is cut: one way is complete\n        return so_far\n    answer = 0\n    value = 0\n    for end in range(pos, n):\n        value = value * 10 + digit[end]          # the part digit[pos..end]\n        answer += total(end + 1, so_far + value)\n    return answer' },
        'This is the basic shape of **backtracking**: make a choice (here, the end of the next part), recurse on what is left, and then try the next choice. The variable `so_far` carries the choices made until now, so no undo step is needed.'
      ]
    },
    statement: ['A string of `n` digits is cut into consecutive parts (between two neighbouring digits there is either a cut or there is none). Every part is read as a decimal number; leading zeros are allowed, so the part `007` is the number 7. For each way to cut the string, add the numbers of its parts. Print the sum of these sums over all `2^(n - 1)` ways.'],
    inputFormat: ['The only line has a string of `n` digits.'],
    outputFormat: ['Print the total.'],
    constraints: ['1 <= n <= 14'],
    examples: [{ input: '123\n', note: 'The four ways give 123, 12 + 3 = 15, 1 + 23 = 24 and 1 + 2 + 3 = 6; the total is 168.' }],
    hints: ['Write a function with the current position and the sum of the parts chosen so far.', 'Try every end of the next part: grow its value by one digit in each step of a loop.', 'When the position reaches the end of the string, one way is complete: return its sum.'],
    program: {
      io: ['digits:word'],
      helpers: {
        python: r`
          def total(digits, pos, so_far):
              if pos == len(digits):
                  return so_far
              answer = 0
              value = 0
              for end in range(pos, len(digits)):
                  value = value * 10 + int(digits[end])
                  answer += total(digits, end + 1, so_far + value)
              return answer`,
        cpp: r`
          long long total(const string& digits, int pos, long long soFar) {
              if (pos == (int)digits.size()) return soFar;
              long long answer = 0, value = 0;
              for (int end = pos; end < (int)digits.size(); end++) {
                  value = value * 10 + (digits[end] - '0');
                  answer += total(digits, end + 1, soFar + value);
              }
              return answer;
          }`,
        java: r`
          static long total(String digits, int pos, long soFar) {
              if (pos == digits.length()) return soFar;
              long answer = 0, value = 0;
              for (int end = pos; end < digits.length(); end++) {
                  value = value * 10 + (digits.charAt(end) - '0');
                  answer += total(digits, end + 1, soFar + value);
              }
              return answer;
          }`
      },
      python: 'print(total(digits, 0, 0))',
      cpp: 'cout << total(digits, 0, 0) << "\\n";',
      java: 'System.out.println(total(digits, 0, 0));'
    },
    solution: { explanation: ['`total(pos, soFar)` chooses the end of the next part, adds its value to the running sum and continues after it. When the whole string is used, the running sum of this way is returned and the sums of all ways are added up.'], complexity: 'Time O(2^n), space O(n).' },
    solve(input) {
      const s = rows(input)[0].trim(); const n = s.length; let total = 0n;
      for (let mask = 0; mask < 2 ** (n - 1); mask++) { let value = 0n; for (let i = 0; i < n; i++) { value = value * 10n + BigInt(s[i]); if (i === n - 1 || (mask >> i) & 1) { total += value; value = 0n; } } }
      return String(total);
    },
    tests() {
      const g = rng(610);
      const digits = (n, lo = 0) => many(n, () => randInt(g, lo, 9)).join('');
      return ['123\n', '7\n', '0\n', '10\n', '100\n', '909\n', `${'9'.repeat(14)}\n`, `${'0'.repeat(14)}\n`, `1${'0'.repeat(13)}\n`, `${digits(14, 1)}\n`, `${digits(14)}\n`, `${digits(13)}\n`, `${digits(10, 1)}\n`, `${'12'.repeat(7)}\n`];
    }
  },

  {
    slug: 'nested-list-weighted-sum',
    title: 'Numbers in Nested Lists',
    difficulty: 'easy',
    tags: ['recursion', 'parsing', 'nesting'],
    concept: {
      title: 'A list inside a list is a smaller copy of the same problem',
      body: [
        'A nested list such as `[1,[2,3],[[4]],5]` is a list whose items are numbers **or lists**. Handling an item that is a list is exactly the original problem again, only on a smaller piece of the text. So a recursive function that reads **one list** and calls itself whenever it meets `[` is the natural tool.',
        { code: 'def read_list(s, pos, depth):        # s[pos[0]] is the "[" of this list\n    pos[0] += 1\n    total = 0\n    while s[pos[0]] != "]":\n        if s[pos[0]] == ",":\n            pos[0] += 1\n        elif s[pos[0]] == "[":\n            total += read_list(s, pos, depth + 1)   # a smaller list\n        else:\n            start = pos[0]\n            while s[pos[0]] not in ",]":\n                pos[0] += 1\n            total += int(s[start:pos[0]]) * depth\n    pos[0] += 1                                  # skip the "]"\n    return total' },
        'The position is shared by all calls (a list with one element in Python, a reference in C++, an array in Java), so that after an inner list returns, the outer call continues **after** it. The nesting depth of the text is the depth of the recursion, which is why the nesting is limited to 400 here.'
      ]
    },
    statement: ['A nested list is written with square brackets and commas; its items are integers or nested lists, for example `[1,[2,3],[[4]],5]`. The items of the outermost list have depth 1, the items of a list inside it have depth 2, and so on. Print the sum of every integer multiplied by its depth.'],
    inputFormat: ['The only line has the nested list. It has no spaces. The outermost item is a list.'],
    outputFormat: ['Print the weighted sum.'],
    constraints: ['2 <= length of the line <= 4000', '-10^6 <= every integer <= 10^6', 'Lists can be empty. The nesting is at most 400 levels deep.'],
    examples: [{ input: '[1,[2,3],[[4]],5]\n', note: '1*1 + (2 + 3)*2 + 4*3 + 5*1 = 28.' }],
    hints: ['Write a function that reads one list: it starts after a [ and stops after the matching ].', 'When you meet another [, call the same function with a depth larger by one.', 'Keep the reading position where all calls can see it, so an outer call continues after an inner list.'],
    program: {
      io: ['s:word'],
      helpers: {
        python: r`
          def read_list(s, pos, depth):
              pos[0] += 1
              total = 0
              while s[pos[0]] != "]":
                  if s[pos[0]] == ",":
                      pos[0] += 1
                  elif s[pos[0]] == "[":
                      total += read_list(s, pos, depth + 1)
                  else:
                      start = pos[0]
                      while s[pos[0]] not in ",]":
                          pos[0] += 1
                      total += int(s[start:pos[0]]) * depth
              pos[0] += 1
              return total`,
        cpp: r`
          long long readList(const string& s, int& pos, int depth) {
              pos++;
              long long total = 0;
              while (s[pos] != ']') {
                  if (s[pos] == ',') {
                      pos++;
                  } else if (s[pos] == '[') {
                      total += readList(s, pos, depth + 1);
                  } else {
                      int start = pos;
                      while (s[pos] != ',' && s[pos] != ']') pos++;
                      total += stoll(s.substr(start, pos - start)) * depth;
                  }
              }
              pos++;
              return total;
          }`,
        java: r`
          static long readList(String s, int[] pos, int depth) {
              pos[0]++;
              long total = 0;
              while (s.charAt(pos[0]) != ']') {
                  if (s.charAt(pos[0]) == ',') {
                      pos[0]++;
                  } else if (s.charAt(pos[0]) == '[') {
                      total += readList(s, pos, depth + 1);
                  } else {
                      int start = pos[0];
                      while (s.charAt(pos[0]) != ',' && s.charAt(pos[0]) != ']') pos[0]++;
                      total += Long.parseLong(s.substring(start, pos[0])) * depth;
                  }
              }
              pos[0]++;
              return total;
          }`
      },
      python: 'print(read_list(s, [0], 1))',
      cpp: r`
        int pos = 0;
        cout << readList(s, pos, 1) << "\n";`,
      java: 'System.out.println(readList(s, new int[] {0}, 1));'
    },
    solution: { explanation: ['`read_list` reads the items of one list. An integer adds `value * depth`; an opening bracket calls the function for the inner list with `depth + 1`. The shared position makes the outer list continue right after the inner one.'], complexity: 'Time O(length), space O(nesting depth).' },
    solve(input) {
      const s = rows(input)[0].trim(); let depth = 0, total = 0, i = 0;
      while (i < s.length) {
        const c = s[i];
        if (c === '[') { depth++; i++; } else if (c === ']') { depth--; i++; } else if (c === ',') i++;
        else { let j = i; while (j < s.length && s[j] !== ',' && s[j] !== ']') j++; total += Number(s.slice(i, j)) * depth; i = j; }
      }
      return String(total);
    },
    tests() {
      const g = rng(611);
      const nested = (depthLeft, items) => { const parts = []; for (let i = 0; i < items; i++) parts.push(depthLeft > 0 && g() < 0.35 ? nested(depthLeft - 1, randInt(g, 0, 3)) : String(randInt(g, -1000000, 1000000))); return `[${parts.join(',')}]`; };
      const chain = (d) => (d === 0 ? '[0]' : `[${d},${chain(d - 1)}]`);
      const check = (s) => { if (s.length > 4000) throw new Error('nested list too long: ' + s.length); return `${s}\n`; };
      return ['[1,[2,3],[[4]],5]\n', '[]\n', '[5]\n', '[[]]\n', '[-7]\n', '[[[-1]]]\n', '[1,[],2,[[]],3]\n', check(nested(3, 6)), check(nested(5, 8)), check(nested(8, 10)), check(`${'['.repeat(400)}5${']'.repeat(400)}`), check(chain(399)), check(`[${many(400, () => randInt(g, -1000000, 1000000)).join(',')}]`), check(`[${many(250, () => `[${randInt(g, -99, 99)},[${randInt(g, -99, 99)}]]`).join(',')}]`), check(`[${'1,'.repeat(1000)}1]`)];
    }
  },

  {
    slug: 'cantor-set-string',
    title: 'A Pattern That Contains Itself',
    difficulty: 'easy',
    tags: ['recursion', 'strings', 'fractals'],
    concept: {
      title: 'The big picture is made of two smaller pictures',
      body: [
        'Some patterns are defined by themselves. The **Cantor set** is drawn like this: start with one block `#`. To get the next picture, take the previous one, then leave a gap of the **same width**, then copy the previous one again. Level 0 is `#`, level 1 is `#.#`, level 2 is `#.#...#.#`.',
        { code: 'def cantor(n):\n    if n == 0:\n        return "#"                  # the smallest picture\n    left = cantor(n - 1)\n    return left + "." * len(left) + left   # picture, gap of the same width, picture' },
        'The function builds the picture for `n` from the picture for `n - 1`. Notice that it calls `cantor(n - 1)` **once** and uses the result twice; calling it twice would do twice the work in every level. The length grows as 3^n, so level 9 already has 19683 characters.'
      ]
    },
    statement: ['Level 0 of a picture is the single character `#`. Level `k` is level `k - 1`, followed by a row of `.` characters whose length is the length of level `k - 1`, followed by level `k - 1` again. Print level `n`.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['Print the picture of level `n` on one line.'],
    constraints: ['0 <= n <= 9'],
    examples: [{ input: '2\n', note: 'Level 1 is #.# (length 3), so level 2 is #.#, then three dots, then #.# again: #.#...#.#.' }],
    hints: ['Level 0 is the base case: a single #.', 'Build level n from level n - 1: copy, gap, copy.', 'Compute the smaller level once and reuse it for both copies.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def cantor(n):
              if n == 0:
                  return "#"
              left = cantor(n - 1)
              return left + "." * len(left) + left`,
        cpp: r`
          string cantor(int n) {
              if (n == 0) return "#";
              string left = cantor(n - 1);
              return left + string(left.size(), '.') + left;
          }`,
        java: r`
          static String cantor(int n) {
              if (n == 0) return "#";
              String left = cantor(n - 1);
              return left + ".".repeat(left.length()) + left;
          }`
      },
      python: 'print(cantor(n))',
      cpp: 'cout << cantor((int)n) << "\\n";',
      java: 'System.out.println(cantor((int) n));'
    },
    solution: { explanation: ['Level 0 is `#`. Every other level is the previous level, a gap of the same length, and the previous level again; the previous level is computed once per call.'], complexity: 'Time O(3^n), space O(3^n).' },
    solve(input) { let s = '#'; for (let i = 0; i < Number(rows(input)[0]); i++) s = s + '.'.repeat(s.length) + s; return s; },
    tests() { return many(10, (i) => `${i}\n`); }
  },

  {
    slug: 'number-in-words',
    title: 'A Number in English Words',
    difficulty: 'easy',
    tags: ['recursion', 'strings', 'numbers'],
    concept: {
      title: 'A big number is a smaller number, a name and a rest',
      body: [
        'English reads a number by splitting it into pieces: `1234567` is "one million" + "two hundred thirty four thousand" + "five hundred sixty seven". Each piece before a name (`thousand`, `million`, `billion`) is itself a number below 1000, so it is read by the **same function**. And "two hundred thirty four" is "two hundred" followed by the number `34`, again read by the same function.',
        { code: 'def say(n):\n    if n < 20:\n        return ONES[n]\n    if n < 100:\n        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])\n    if n < 1000:\n        return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " " + say(n % 100))\n    for size, name in ((10**9, "billion"), (10**6, "million"), (1000, "thousand")):\n        if n >= size:\n            rest = n % size\n            return say(n // size) + " " + name + ("" if rest == 0 else " " + say(rest))' },
        'The ranges are checked from the smallest to the biggest, and a part that is zero is skipped (1000 is just "one thousand"). Splitting a problem into "a smaller number, a name, and the rest" and reusing the function for both numbers is a typical use of recursion.'
      ]
    },
    statement: ['Write the integer `n` in English words in lowercase, using single spaces and no hyphens and no word `and`. Use `zero`, `one` ... `nineteen`, then `twenty`, `thirty`, ..., `ninety` (a number such as 21 is `twenty one`), `hundred`, `thousand`, `million` and `billion`. A part that is zero is not written (1000 is `one thousand`).'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['Print the words on one line.'],
    constraints: ['0 <= n <= 10^9'],
    examples: [{ input: '1234\n', note: 'one thousand, two hundred, thirty, four: "one thousand two hundred thirty four".' }],
    hints: ['Numbers below 20 are single words from a table; tens (20 to 90) are single words too.', 'For a number below 1000, say the hundreds digit and the word hundred, then say the rest with the same function.', 'For a bigger number split off the largest of billion, million, thousand and say the two parts with the same function.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
                  "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
          TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

          def say(n):
              if n < 20:
                  return ONES[n]
              if n < 100:
                  return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
              if n < 1000:
                  return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " " + say(n % 100))
              for size, name in ((10**9, "billion"), (10**6, "million"), (1000, "thousand")):
                  if n >= size:
                      rest = n % size
                      return say(n // size) + " " + name + ("" if rest == 0 else " " + say(rest))`,
        cpp: r`
          const string ONES[20] = {"zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
                                   "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"};
          const string TENS[10] = {"", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"};

          string say(long long n) {
              if (n < 20) return ONES[n];
              if (n < 100) return TENS[n / 10] + (n % 10 == 0 ? "" : " " + ONES[n % 10]);
              if (n < 1000) return ONES[n / 100] + " hundred" + (n % 100 == 0 ? "" : " " + say(n % 100));
              long long sizes[3] = {1000000000LL, 1000000LL, 1000LL};
              string names[3] = {"billion", "million", "thousand"};
              for (int i = 0; i < 3; i++) {
                  if (n >= sizes[i]) {
                      long long rest = n % sizes[i];
                      return say(n / sizes[i]) + " " + names[i] + (rest == 0 ? "" : " " + say(rest));
                  }
              }
              return "";
          }`,
        java: r`
          static final String[] ONES = {"zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
                                        "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"};
          static final String[] TENS = {"", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"};

          static String say(long n) {
              if (n < 20) return ONES[(int) n];
              if (n < 100) return TENS[(int) (n / 10)] + (n % 10 == 0 ? "" : " " + ONES[(int) (n % 10)]);
              if (n < 1000) return ONES[(int) (n / 100)] + " hundred" + (n % 100 == 0 ? "" : " " + say(n % 100));
              long[] sizes = {1000000000L, 1000000L, 1000L};
              String[] names = {"billion", "million", "thousand"};
              for (int i = 0; i < 3; i++) {
                  if (n >= sizes[i]) {
                      long rest = n % sizes[i];
                      return say(n / sizes[i]) + " " + names[i] + (rest == 0 ? "" : " " + say(rest));
                  }
              }
              return "";
          }`
      },
      python: 'print(say(n))',
      cpp: 'cout << say(n) << "\\n";',
      java: 'System.out.println(say(n));'
    },
    solution: { explanation: ['Numbers below 20 and the tens come from tables. A number below 1000 is its hundreds word plus the rest; a bigger number is split by the largest of billion, million and thousand into a smaller number, the name, and the rest, and the same function reads both numbers.'], complexity: 'Time O(1) for these sizes (a handful of calls).' },
    solve(input) { return inWords(Number(rows(input)[0])); },
    tests() {
      const g = rng(612);
      return ['1234\n', '0\n', '1\n', '10\n', '11\n', '19\n', '20\n', '21\n', '99\n', '100\n', '101\n', '110\n', '999\n', '1000\n', '1001\n', '1010\n', '1100\n', '12345\n', '100000\n', '999999\n', '1000000\n', '1000001\n', '1234567\n', '90000000\n', '999999999\n', '1000000000\n', `${randInt(g, 1, 999)}\n`, `${randInt(g, 1000, 999999)}\n`, `${randInt(g, 1000000, 999999999)}\n`, `${randInt(g, 1000000, 999999999)}\n`];
    }
  },

  {
    slug: 'brace-expansion',
    title: 'Expand the Choices',
    difficulty: 'easy',
    tags: ['recursion', 'backtracking', 'strings'],
    concept: {
      title: 'One choice per group, built left to right',
      body: [
        'A pattern like `a{b,c}d{e,f}` stands for several words: letters outside braces are fixed, and every `{...}` is a **group of options**, of which exactly one is used. Here the words are `abde`, `abdf`, `acde`, `acdf`. First turn the pattern into a list of parts, where each part is a list of options (a fixed letter is a part with one option).',
        'Then a recursive function builds the word from left to right: it stands at part number `k`, and for **every option** of this part it appends the option to the word built so far and calls itself for part `k + 1`. When all parts are used, the word is complete.',
        { code: 'def expand(parts, k, current, out):\n    if k == len(parts):\n        out.add(current)               # a complete word\n        return\n    for option in parts[k]:\n        expand(parts, k + 1, current + option, out)' },
        'This **choose, recurse, try the next choice** loop is the skeleton of every backtracking solution. A set removes duplicates, because different choices can give the same word (`{a,ab}{bc,c}` gives `abc` twice).'
      ]
    },
    statement: ['A pattern is made of lowercase letters and groups. A group is written `{x,y,z}`: a list of options separated by commas, and one option must be used. Print every different word that the pattern can produce, in alphabetical (dictionary) order, one word per line.'],
    inputFormat: ['The only line has the pattern. It has no spaces and the groups are not nested.'],
    outputFormat: ['The words in alphabetical order, one per line, without repeats.'],
    constraints: ['1 <= length of the pattern <= 100', 'There are at most 5 groups. Each group has 1 to 4 different options, and each option has 1 to 6 lowercase letters.'],
    examples: [{ input: 'a{b,c}d{e,f}\n', note: 'The words are abde, abdf, acde and acdf.' }],
    hints: ['Split the pattern into parts: every group is one part with its options, every other letter is a part with one option.', 'Build the word from left to right: try each option of the current part and recurse on the next part.', 'Put the finished words in a set and print them sorted: different choices can give the same word.'],
    program: {
      io: ['s:word'],
      includes: ['<set>'],
      helpers: {
        python: r`
          def parse(s):
              parts = []
              i = 0
              while i < len(s):
                  if s[i] == "{":
                      j = s.index("}", i)
                      parts.append(s[i + 1:j].split(","))
                      i = j + 1
                  else:
                      parts.append([s[i]])
                      i += 1
              return parts

          def expand(parts, k, current, out):
              if k == len(parts):
                  out.add(current)
                  return
              for option in parts[k]:
                  expand(parts, k + 1, current + option, out)`,
        cpp: r`
          vector<vector<string>> parsePattern(const string& s) {
              vector<vector<string>> parts;
              size_t i = 0;
              while (i < s.size()) {
                  if (s[i] == '{') {
                      size_t j = s.find('}', i);
                      vector<string> options;
                      string current;
                      for (size_t k = i + 1; k < j; k++) {
                          if (s[k] == ',') {
                              options.push_back(current);
                              current.clear();
                          } else {
                              current += s[k];
                          }
                      }
                      options.push_back(current);
                      parts.push_back(options);
                      i = j + 1;
                  } else {
                      parts.push_back({string(1, s[i])});
                      i++;
                  }
              }
              return parts;
          }

          void expand(const vector<vector<string>>& parts, size_t k, const string& current, set<string>& out) {
              if (k == parts.size()) {
                  out.insert(current);
                  return;
              }
              for (const string& option : parts[k]) expand(parts, k + 1, current + option, out);
          }`,
        java: r`
          static List<List<String>> parsePattern(String s) {
              List<List<String>> parts = new ArrayList<>();
              int i = 0;
              while (i < s.length()) {
                  if (s.charAt(i) == '{') {
                      int j = s.indexOf('}', i);
                      parts.add(Arrays.asList(s.substring(i + 1, j).split(",")));
                      i = j + 1;
                  } else {
                      parts.add(Arrays.asList(String.valueOf(s.charAt(i))));
                      i++;
                  }
              }
              return parts;
          }

          static void expand(List<List<String>> parts, int k, String current, Set<String> out) {
              if (k == parts.size()) {
                  out.add(current);
                  return;
              }
              for (String option : parts.get(k)) expand(parts, k + 1, current + option, out);
          }`
      },
      python: r`
        out = set()
        expand(parse(s), 0, "", out)
        print("\n".join(sorted(out)))`,
      cpp: r`
        set<string> out;
        expand(parsePattern(s), 0, "", out);
        for (const string& word : out) cout << word << "\n";`,
      java: r`
        Set<String> out = new TreeSet<>();
        expand(parsePattern(s), 0, "", out);
        StringBuilder sb = new StringBuilder();
        for (String word : out) sb.append(word).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The pattern becomes a list of parts, each a list of options. `expand` appends each option of part `k` to the word and recurses on part `k + 1`; a complete word goes into a sorted set, which also removes repeats.'], complexity: 'Time O(number of words * length), at most 1024 words.' },
    solve(input) {
      const s = rows(input)[0].trim(); const parts = []; let i = 0;
      while (i < s.length) { if (s[i] === '{') { const j = s.indexOf('}', i); parts.push(s.slice(i + 1, j).split(',')); i = j + 1; } else { parts.push([s[i]]); i++; } }
      let words = ['']; for (const options of parts) words = words.flatMap((w) => options.map((o) => w + o));
      return [...new Set(words)].sort().join('\n');
    },
    tests() {
      const g = rng(613);
      const letters = (n) => randWord(g, n, 'abcd');
      const group = (k) => { const set = new Set(); while (set.size < k) set.add(letters(randInt(g, 1, 3))); return `{${[...set].join(',')}}`; };
      const build = (groups, fixed) => { let s = letters(fixed); for (let i = 0; i < groups; i++) s += group(randInt(g, 1, 4)) + letters(randInt(g, 0, fixed)); return s; };
      const check = (s) => { if (s.length > 100) throw new Error('pattern too long'); return `${s}\n`; };
      return ['a{b,c}d{e,f}\n', 'abc\n', '{a}\n', '{a,b}\n', '{a,ab}{bc,c}\n', 'x{a,b,c,d}y\n', '{a,b,c,d}{a,b,c,d}{a,b,c,d}{a,b,c,d}{a,b,c,d}\n', '{ab,cd}{ef,gh}z{ij,kl}{mn,op}{qr,st}\n', check(build(2, 2)), check(build(3, 2)), check(build(5, 1)), check(build(4, 3)), check(`${'a'.repeat(50)}{b,c}${'d'.repeat(40)}\n`.trim()), check(`{aaaaaa,bbbbbb,cccccc,dddddd}${'e'.repeat(60)}{x,y}`)];
    }
  },

  {
    slug: 'paths-in-a-dag',
    title: 'Routes Between the First and the Last Stop',
    difficulty: 'easy',
    tags: ['recursion', 'memoization', 'graph'],
    concept: {
      title: 'The routes from a stop are the routes from the stops after it',
      body: [
        'Stops are numbered 1 to `n`, and every one-way road goes from a **smaller** number to a **bigger** one, so a route can never come back to a stop it has left. To count the routes from stop `u` to stop `n`, look at the roads that leave `u`: every route goes along one of them and then continues from the next stop. So `routes(u)` is the **sum of `routes(v)`** over the roads `u -> v`, and `routes(n) = 1` (you are already there).',
        { code: 'def routes(u):\n    if u == n:\n        return 1\n    if memo[u] < 0:\n        memo[u] = sum(routes(v) for v in roads[u])\n    return memo[u]' },
        'Without the memo the same stop would be explored again for every route that reaches it, and the number of routes can be astronomically large (2^58 in a graph with 60 stops). With the memo each stop is solved **once** and each road is looked at once. Notice that the answer for a stop is stored only after all stops after it are known: recursion visits them in the right order by itself.'
      ]
    },
    statement: ['There are `n` stops and `m` one-way roads. Every road goes from a stop `u` to a stop `v` with `u < v`. Count the different routes that start at stop 1 and end at stop `n` (two routes are different if they use different roads).'],
    inputFormat: ['The first line has `n` and `m`.', 'Each of the next `m` lines has `u` and `v`: a road from `u` to `v`.'],
    outputFormat: ['Print the number of routes (it can be 0).'],
    constraints: ['2 <= n <= 60', '1 <= m <= n * (n - 1) / 2', '1 <= u < v <= n, and every road appears once.'],
    examples: [{ input: '4 5\n1 2\n1 3\n2 3\n2 4\n3 4\n', note: 'The routes are 1-2-4, 1-2-3-4, 1-3-4.' }],
    hints: ['Define routes(u) as the number of routes from u to the last stop.', 'routes(n) is 1, and routes(u) is the sum of routes(v) over the roads u -> v.', 'Store routes(u) in a table: without it the program takes far too long.'],
    program: {
      io: ['n:int m:int', 'roads:int[m][2]'],
      fast: true,
      helpers: {
        python: r`
          def routes(u, n, adj, memo):
              if u == n:
                  return 1
              if memo[u] < 0:
                  total = 0
                  for v in adj[u]:
                      total += routes(v, n, adj, memo)
                  memo[u] = total
              return memo[u]`,
        cpp: r`
          long long routes(int u, int n, const vector<vector<int>>& adj, vector<long long>& memo) {
              if (u == n) return 1;
              if (memo[u] < 0) {
                  long long total = 0;
                  for (int v : adj[u]) total += routes(v, n, adj, memo);
                  memo[u] = total;
              }
              return memo[u];
          }`,
        java: r`
          static long routes(int u, int n, List<List<Integer>> adj, long[] memo) {
              if (u == n) return 1;
              if (memo[u] < 0) {
                  long total = 0;
                  for (int v : adj.get(u)) total += routes(v, n, adj, memo);
                  memo[u] = total;
              }
              return memo[u];
          }`
      },
      python: r`
        adj = [[] for _ in range(n + 1)]
        for u, v in roads:
            adj[u].append(v)
        memo = [-1] * (n + 1)
        print(routes(1, n, adj, memo))`,
      cpp: r`
        vector<vector<int>> adj(n + 1);
        for (int i = 0; i < m; i++) adj[roads[i][0]].push_back((int)roads[i][1]);
        vector<long long> memo(n + 1, -1);
        cout << routes(1, (int)n, adj, memo) << "\n";`,
      java: r`
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int i = 0; i < m; i++) adj.get((int) roads[i][0]).add((int) roads[i][1]);
        long[] memo = new long[(int) n + 1];
        Arrays.fill(memo, -1);
        System.out.println(routes(1, (int) n, adj, memo));`
    },
    solution: { explanation: ['`routes(u)` is 1 at the last stop and the sum of `routes(v)` over the roads leaving `u` elsewhere. Because roads go to bigger numbers the recursion ends, and the memo makes each stop cost one pass over its roads.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const adj = Array.from({ length: n + 1 }, () => []);
      for (let i = 1; i <= m; i++) { const [u, v] = nums(rs[i]); adj[u].push(v); }
      const ways = Array(n + 1).fill(0n); ways[n] = 1n;
      for (let u = n - 1; u >= 1; u--) for (const v of adj[u]) ways[u] += ways[v];
      return String(ways[1]);
    },
    tests() {
      const g = rng(614);
      const make = (n, edges) => `${n} ${edges.length}\n${edges.map((e) => e.join(' ')).join('\n')}\n`;
      const allPairs = (n) => { const e = []; for (let u = 1; u <= n; u++) for (let v = u + 1; v <= n; v++) e.push([u, v]); return e; };
      const sparse = (n, p) => { const e = allPairs(n).filter(() => g() < p); return e.length ? e : [[1, n]]; };
      const slow = (n, edges) => { const adj = Array.from({ length: n + 1 }, () => []); for (const [u, v] of edges) adj[u].push(v); const f = (u) => (u === n ? 1 : adj[u].reduce((s, v) => s + f(v), 0)); return f(1); };
      crossCheck(() => { const n = randInt(g, 2, 10); return make(n, sparse(n, 0.5)); }, (i) => this.solve(i), (i) => { const rs = rows(i); const [n, m] = nums(rs[0]); return slow(n, rs.slice(1, m + 1).map(nums)); });
      const chain = many(59, (i) => [i + 1, i + 2]);
      const layeredEdges = (() => { const w = 4, L = 14; const e = []; for (let b = 0; b < w; b++) e.push([1, 2 + b]); for (let l = 0; l + 1 < L; l++) for (let a = 0; a < w; a++) for (let b = 0; b < w; b++) e.push([2 + l * w + a, 2 + (l + 1) * w + b]); for (let a = 0; a < w; a++) e.push([2 + (L - 1) * w + a, 2 + L * w]); return e; })();
      const jumps = [...chain, ...many(58, (i) => [i + 1, i + 3])];
      return ['4 5\n1 2\n1 3\n2 3\n2 4\n3 4\n', '2 1\n1 2\n', '3 1\n1 2\n', '5 3\n1 2\n3 4\n4 5\n', make(60, allPairs(60)), make(60, chain), make(60, jumps), make(60, sparse(60, 0.3)), make(60, sparse(60, 0.1)), make(40, sparse(40, 0.6)), make(58, layeredEdges)];
    }
  },

  {
    slug: 'splits-without-conflicts',
    title: 'Groups Without Conflicts',
    difficulty: 'easy',
    tags: ['backtracking', 'recursion', 'counting'],
    concept: {
      title: 'Put each item in an existing group or start a new one',
      body: [
        'To split `n` items into groups, handle them one by one in order. The next item can join **any group that already exists**, or start **a new group**. If `g` groups exist, the item has `g + 1` choices. Because the groups have no names, this way of numbering the groups (a new group gets the next free number) produces every split **exactly once**.',
        'Some pairs of items are in **conflict** and must not share a group. A choice is checked before it is made: the item may join group `g` only if none of the items already in `g` is in conflict with it. Choices that fail the check are **skipped**, so the whole branch below them is never explored. That is **backtracking**: build the answer step by step and drop a partial answer as soon as it breaks a rule.',
        { code: 'def count(i, used):\n    if i == n:\n        return 1\n    total = 0\n    for g in range(used + 1):          # g == used means a new group\n        if any(group[j] == g and conflict[i][j] for j in range(i)):\n            continue                    # a conflict: this choice is not allowed\n        group[i] = g\n        total += count(i + 1, max(used, g + 1))\n    return total' },
        'With no conflicts the answer is the **Bell number** (1, 2, 5, 15, 52, 203, 877, 4140, 21147, 115975 for 1 to 10 items).'
      ]
    },
    statement: ['Split the items `1` to `n` into any number of non-empty groups. The groups are not named and the order inside a group does not matter, so only the sets count. Some pairs of items are in conflict: the two items of a conflicting pair must be in different groups. Count the ways to split the items.'],
    inputFormat: ['The first line has `n` and `m`, the number of items and of conflicting pairs.', 'Each of the next `m` lines has two different items `a` and `b` that must be in different groups.'],
    outputFormat: ['Print the number of ways.'],
    constraints: ['1 <= n <= 10', '0 <= m <= n * (n - 1) / 2', 'Every pair appears at most once.'],
    examples: [{ input: '3 1\n1 2\n', note: 'Items 1 and 2 must be apart. The ways are {1,3} {2}, {1} {2,3} and {1} {2} {3}.' }],
    hints: ['Place the items one by one: the next item joins an existing group or opens a new one.', 'Before putting an item into a group, check that none of the items already there conflicts with it.', 'Remember how many groups are open so far: a new group gets the next number, which avoids counting the same split twice.'],
    program: {
      io: ['n:int m:int', 'pairs:int[m][2]'],
      helpers: {
        python: r`
          def count(i, n, used, group, conflict):
              if i == n:
                  return 1
              total = 0
              for g in range(used + 1):
                  if any(group[j] == g and conflict[i][j] for j in range(i)):
                      continue
                  group[i] = g
                  total += count(i + 1, n, max(used, g + 1), group, conflict)
              return total`,
        cpp: r`
          long long countSplits(int i, int n, int used, vector<int>& group, const vector<vector<char>>& conflict) {
              if (i == n) return 1;
              long long total = 0;
              for (int g = 0; g <= used; g++) {
                  bool clash = false;
                  for (int j = 0; j < i; j++) {
                      if (group[j] == g && conflict[i][j]) clash = true;
                  }
                  if (clash) continue;
                  group[i] = g;
                  total += countSplits(i + 1, n, max(used, g + 1), group, conflict);
              }
              return total;
          }`,
        java: r`
          static long countSplits(int i, int n, int used, int[] group, boolean[][] conflict) {
              if (i == n) return 1;
              long total = 0;
              for (int g = 0; g <= used; g++) {
                  boolean clash = false;
                  for (int j = 0; j < i; j++) {
                      if (group[j] == g && conflict[i][j]) clash = true;
                  }
                  if (clash) continue;
                  group[i] = g;
                  total += countSplits(i + 1, n, Math.max(used, g + 1), group, conflict);
              }
              return total;
          }`
      },
      python: r`
        conflict = [[False] * n for _ in range(n)]
        for a, b in pairs:
            conflict[a - 1][b - 1] = conflict[b - 1][a - 1] = True
        print(count(0, n, 0, [0] * n, conflict))`,
      cpp: r`
        vector<vector<char>> conflict(n, vector<char>(n, 0));
        for (int i = 0; i < m; i++) {
            conflict[pairs[i][0] - 1][pairs[i][1] - 1] = 1;
            conflict[pairs[i][1] - 1][pairs[i][0] - 1] = 1;
        }
        vector<int> group(n, 0);
        cout << countSplits(0, (int)n, 0, group, conflict) << "\n";`,
      java: r`
        boolean[][] conflict = new boolean[(int) n][(int) n];
        for (int i = 0; i < m; i++) {
            conflict[(int) pairs[i][0] - 1][(int) pairs[i][1] - 1] = true;
            conflict[(int) pairs[i][1] - 1][(int) pairs[i][0] - 1] = true;
        }
        System.out.println(countSplits(0, (int) n, 0, new int[(int) n], conflict));`
    },
    solution: { explanation: ['Items are placed in order; item `i` may join any open group `g < used` or open group `used`, but only if no item already in that group conflicts with it. Every complete placement is one split, and numbering new groups in order counts each split once.'], complexity: 'Time O(Bell(n) * n) at most, space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const bad = Array(n).fill(0);
      for (let i = 1; i <= m; i++) { const [a, b] = nums(rs[i]); bad[a - 1] |= 1 << (b - 1); bad[b - 1] |= 1 << (a - 1); }
      const independent = (mask) => { for (let i = 0; i < n; i++) if ((mask >> i) & 1 && bad[i] & mask) return false; return true; };
      const f = Array(1 << n).fill(0); f[0] = 1;
      for (let mask = 1; mask < 1 << n; mask++) {
        const low = mask & -mask; let total = 0;
        for (let sub = mask; sub > 0; sub = (sub - 1) & mask) if ((sub & low) && independent(sub)) total += f[mask ^ sub];
        f[mask] = total;
      }
      return String(f[(1 << n) - 1]);
    },
    tests() {
      const g = rng(615);
      const make = (n, pairs) => `${n} ${pairs.length}\n${pairs.map((p) => p.join(' ')).join('\n')}${pairs.length ? '\n' : ''}`;
      const allPairs = (n) => { const e = []; for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) e.push([a, b]); return e; };
      const some = (n, p) => allPairs(n).filter(() => g() < p);
      const brute = (n, pairs) => { const bad = new Set(pairs.map(([a, b]) => `${a},${b}`)); let count = 0; const group = Array(n).fill(0); const go = (i, used) => { if (i === n) { count++; return; } for (let k = 0; k <= used; k++) { let ok = true; for (let j = 0; j < i; j++) if (group[j] === k && (bad.has(`${j + 1},${i + 1}`) || bad.has(`${i + 1},${j + 1}`))) ok = false; if (ok) { group[i] = k; go(i + 1, Math.max(used, k + 1)); } } }; go(0, 0); return count; };
      crossCheck(() => { const n = randInt(g, 1, 7); return make(n, some(n, 0.3)); }, (i) => this.solve(i), (i) => { const rs = rows(i); const [n, m] = nums(rs[0]); return brute(n, rs.slice(1, m + 1).map(nums)); });
      return ['3 1\n1 2\n', '1 0\n', '2 0\n', '2 1\n1 2\n', '4 0\n', '10 0\n', '9 0\n', make(10, allPairs(10)), make(10, some(10, 0.1)), make(10, some(10, 0.2)), make(10, some(10, 0.4)), make(10, [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]]), make(10, many(9, (i) => [i + 1, i + 2])), make(8, some(8, 0.5))];
    }
  }
];
