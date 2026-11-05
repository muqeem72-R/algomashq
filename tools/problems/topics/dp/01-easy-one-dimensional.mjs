import { r, rng, randInt, many, nums, rows, shuffle, randArray } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const easy = { difficulty: 'easy' };
const MOD = 1000000007;
const MODN = BigInt(MOD);
const list = (n, a) => `${n}\n${a.join(' ')}\n`;
const single = (n) => `${n}\n`;

export default [
  {
    ...easy,
    inputFormat: ['One line with the number `n`.'],
    constraints: ['1 <= n <= 1000000'],
    slug: 'ways-up-the-stairs',
    title: 'Count the Ways Up the Stairs',
    tags: ['dp', 'fibonacci', 'counting'],
    concept: {
      title: 'Build the answer for n steps from the answers for fewer steps',
      body: [
        'You stand at the bottom of a staircase with `n` steps. In one move you climb **1 step or 2 steps**. In how many different orders of moves can you reach the top? For `n = 4` the orders are 1+1+1+1, 1+1+2, 1+2+1, 2+1+1 and 2+2: five ways. For a big `n` the number is enormous, so the problem asks for it **modulo 1 000 000 007** (the remainder after division by that number).',
        '*Dynamic programming* means three things: define the answer for a **small part** of the problem, find out how a bigger answer is made from smaller ones, and compute the answers **in order** so that nothing is computed twice. Let `ways(i)` be the number of ways to stand on step `i`. The last move into step `i` came from step `i - 1` (a 1-step move) or from step `i - 2` (a 2-step move), and these two groups of ways are different, so `ways(i) = ways(i - 1) + ways(i - 2)`. At the start `ways(0) = 1` (do nothing) and `ways(1) = 1`.',
        { code: 'MOD = 10 ** 9 + 7\na, b = 1, 1                      # ways(0) and ways(1)\nfor _ in range(n - 1):\n    a, b = b, (a + b) % MOD     # move one step up the table\nprint(b)' },
        'A plain recursion `ways(n) = ways(n - 1) + ways(n - 2)` would call itself an exponential number of times, because the same small values are asked again and again. The table (or the two variables) computes each value once: O(n) time. Only the last two values are ever needed, so the memory is O(1). The remainder is taken after **every** addition, which keeps the numbers small (in C++ and Java they would overflow otherwise).'
      ]
    },
    statement: ['A staircase has `n` steps. In one move you climb 1 step or 2 steps. Print the number of different sequences of moves that lead from the bottom exactly to the top, modulo 1000000007.'],
    outputFormat: ['Print one number: the number of ways modulo 1000000007.'],
    examples: [{ input: '4\n', note: 'The five ways are 1+1+1+1, 1+1+2, 1+2+1, 2+1+1 and 2+2: 5.' }, { input: '1\n', note: 'Only one move is possible: 1.' }],
    hints: ['Let ways(i) be the number of ways to reach step i. How can the last move look?', 'ways(i) = ways(i - 1) + ways(i - 2), with ways(0) = ways(1) = 1.', 'Keep only the last two values and take the remainder after each addition.'],
    program: {
      io: ['n:int'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        a, b = 1, 1
        for _ in range(n - 1):
            a, b = b, (a + b) % MOD
        print(b)`,
      cpp: r`
        const long long MOD = 1000000007;
        long long a = 1, b = 1;
        for (long long i = 1; i < n; i++) {
            long long c = (a + b) % MOD;
            a = b;
            b = c;
        }
        cout << b << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        long a = 1, b = 1;
        for (long i = 1; i < n; i++) {
            long c = (a + b) % MOD;
            a = b;
            b = c;
        }
        System.out.println(b);`
    },
    solution: { explanation: ['ways(i) = ways(i - 1) + ways(i - 2) with ways(0) = ways(1) = 1, computed from the bottom up with two variables and a remainder after every addition.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const [n] = nums(input); const ways = new Array(n + 1).fill(0); ways[0] = 1; ways[1] = 1; for (let i = 2; i <= n; i++) ways[i] = (ways[i - 1] + ways[i - 2]) % MOD; return String(ways[n]);
    },
    tests() {
      const out = ['4\n', '1\n', '2\n', '3\n'];
      const count = (n) => (n < 0 ? 0 : n === 0 ? 1 : count(n - 1) + count(n - 2));
      for (let n = 1; n <= 18; n++) if (String(this.solve(single(n))) !== String(count(n))) throw new Error('reference differs from the recursion for ' + n);
      for (const n of [5, 6, 10, 20, 30, 44, 45, 46, 47, 50, 90, 91, 100, 1000, 12345, 100000, 500000, 999999, 1000000, 1000000]) out.push(single(n));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the number `n`.'],
    constraints: ['1 <= n <= 1000000'],
    slug: 'three-step-hops',
    title: 'Hops of One, Two or Three Steps',
    tags: ['dp', 'counting', 'tribonacci'],
    concept: {
      title: 'The same idea with three choices for the last move',
      body: [
        'A child climbs a staircase of `n` steps and may hop **1, 2 or 3 steps** at a time. How many different sequences of hops reach the top exactly? For `n = 3` they are 1+1+1, 1+2, 2+1 and 3: four ways.',
        'This is the stairs problem with one more kind of move. Let `ways(i)` be the number of ways to stand on step `i`. The last hop came from step `i - 1`, `i - 2` or `i - 3`, and the three groups are different, so **`ways(i) = ways(i - 1) + ways(i - 2) + ways(i - 3)`**. The first values are `ways(0) = 1` and the ways to reach a negative step are 0. This time we keep the whole **table**: it makes the idea easy to see, and a table of a million numbers is small.',
        { code: 'MOD = 10 ** 9 + 7\nways = [0] * (n + 1)\nways[0] = 1\nfor i in range(1, n + 1):\n    total = ways[i - 1]\n    if i >= 2: total += ways[i - 2]\n    if i >= 3: total += ways[i - 3]\n    ways[i] = total % MOD\nprint(ways[n])' },
        'A DP table is filled **in an order where everything a cell needs is already there**: here from the left to the right. Whenever the last move can be one of several kinds, the number of ways is the **sum** over the kinds (and the cost, when we look for the cheapest way, would be the minimum over the kinds).'
      ]
    },
    statement: ['A staircase has `n` steps. In one hop you climb 1, 2 or 3 steps. Print the number of different sequences of hops that lead from the bottom exactly to the top, modulo 1000000007.'],
    outputFormat: ['Print one number: the number of ways modulo 1000000007.'],
    examples: [{ input: '3\n', note: 'The four ways are 1+1+1, 1+2, 2+1 and 3: 4.' }, { input: '4\n', note: 'There are 7 ways: 1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2, 1+3 and 3+1.' }],
    hints: ['Think about the last hop: it can be 1, 2 or 3 steps long.', 'ways(i) = ways(i - 1) + ways(i - 2) + ways(i - 3), where a negative step has 0 ways and ways(0) = 1.', 'Take the remainder modulo 1000000007 after each step.'],
    program: {
      io: ['n:int'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        ways = [0] * (n + 1)
        ways[0] = 1
        for i in range(1, n + 1):
            total = ways[i - 1]
            if i >= 2:
                total += ways[i - 2]
            if i >= 3:
                total += ways[i - 3]
            ways[i] = total % MOD
        print(ways[n])`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<long long> ways(n + 1, 0);
        ways[0] = 1;
        for (long long i = 1; i <= n; i++) {
            long long total = ways[i - 1];
            if (i >= 2) total += ways[i - 2];
            if (i >= 3) total += ways[i - 3];
            ways[i] = total % MOD;
        }
        cout << ways[n] << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        long[] ways = new long[(int) n + 1];
        ways[0] = 1;
        for (int i = 1; i <= n; i++) {
            long total = ways[i - 1];
            if (i >= 2) total += ways[i - 2];
            if (i >= 3) total += ways[i - 3];
            ways[i] = total % MOD;
        }
        System.out.println(ways[(int) n]);`
    },
    solution: { explanation: ['ways(i) = ways(i - 1) + ways(i - 2) + ways(i - 3), where the ways to stand on a negative step are 0 and ways(0) = 1; the table is filled from left to right with a remainder after every step.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const [n] = nums(input); // ways(0), ways(1), ways(2) as big numbers, then a sliding window of three values
      let x = 1n, y = 1n, z = 2n; if (n === 1) return '1'; if (n === 2) return '2'; for (let i = 3; i <= n; i++) { const w = (x + y + z) % MODN; x = y; y = z; z = w; } return String(z);
    },
    tests() {
      const out = ['3\n', '4\n', '1\n', '2\n'];
      const count = (n) => (n < 0 ? 0 : n === 0 ? 1 : count(n - 1) + count(n - 2) + count(n - 3));
      for (let n = 1; n <= 16; n++) if (String(this.solve(single(n))) !== String(count(n))) throw new Error('reference differs from the recursion for ' + n);
      for (const n of [5, 6, 7, 10, 20, 30, 33, 34, 35, 40, 60, 100, 1000, 54321, 100000, 500000, 999999, 1000000, 1000000]) out.push(single(n));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of steps.', 'The second line has `n` numbers: `cost[i]` is the price you pay when you leave the step `i` (the steps are numbered from 0).'],
    constraints: ['2 <= n <= 100000', '0 <= cost[i] <= 10^9'],
    slug: 'cheapest-stairs',
    title: 'The Cheapest Way to the Top of the Stairs',
    tags: ['dp', 'min-cost', 'stairs'],
    concept: {
      title: 'Counting the ways becomes finding the best way: replace the sum by a minimum',
      body: [
        'A staircase has `n` steps numbered 0 to `n - 1`, and the **top** is the place just after the last step (position `n`). Whenever you leave a step `i` you pay `cost[i]`, and you climb 1 or 2 steps. You may **start** on step 0 or on step 1 for free. What is the smallest total price to reach the top? For the costs `10 15 20` the best plan is to start on step 1, pay 15 and jump over the last step: total 15.',
        'Let `best(i)` be the smallest price to **stand on** position `i`. You arrive from `i - 1` (and paid `cost[i - 1]` when you left it) or from `i - 2` (and paid `cost[i - 2]`), so **`best(i) = min(best(i - 1) + cost[i - 1], best(i - 2) + cost[i - 2])`**. The starting values are `best(0) = best(1) = 0`, because the start is free. The answer is `best(n)`.',
        { code: 'a, b = 0, 0                        # best(i - 2) and best(i - 1)\nfor i in range(2, n + 1):\n    a, b = b, min(b + cost[i - 1], a + cost[i - 2])\nprint(b)' },
        'It is the same table as in the counting problems, but each cell takes the **smallest** of its options instead of the sum of them. This pattern, "the best of the ways to make the last move", is the heart of most optimisation DP problems. The time is O(n) and the memory O(1); the answer can reach 2 * 10^14, so use 64-bit numbers in C++ and Java.'
      ]
    },
    statement: ['A staircase has `n` steps numbered 0 to `n - 1`; the top is position `n`. Leaving the step `i` costs `cost[i]`. In one move you climb 1 or 2 steps, and you may start on the step 0 or on the step 1 without paying anything. Print the smallest total cost to reach the top.'],
    outputFormat: ['Print the smallest total cost.'],
    examples: [{ input: '3\n10 15 20\n', note: 'Start on step 1, pay 15 and jump to the top: 15.' }, { input: '10\n1 100 1 1 1 100 1 1 100 1\n', note: 'Start on step 0 and use the cheap steps 0, 2, 3, 4, 6, 7, 9: the total is 6.' }],
    hints: ['Let best(i) be the smallest cost to stand on position i.', 'You come from i - 1 or i - 2; each way costs the price of the step you left.', 'best(0) = best(1) = 0 and the answer is best(n).'],
    program: {
      io: ['n:int', 'cost:int[n]'],
      fast: true,
      python: r`
        a, b = 0, 0
        for i in range(2, n + 1):
            a, b = b, min(b + cost[i - 1], a + cost[i - 2])
        print(b)`,
      cpp: r`
        long long a = 0, b = 0;
        for (long long i = 2; i <= n; i++) {
            long long c = min(b + cost[i - 1], a + cost[i - 2]);
            a = b;
            b = c;
        }
        cout << b << "\n";`,
      java: r`
        long a = 0, b = 0;
        for (int i = 2; i <= n; i++) {
            long c = Math.min(b + cost[i - 1], a + cost[i - 2]);
            a = b;
            b = c;
        }
        System.out.println(b);`
    },
    solution: { explanation: ['best(i) = min(best(i - 1) + cost[i - 1], best(i - 2) + cost[i - 2]) with best(0) = best(1) = 0; the answer is best(n), computed with two variables.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const cost = nums(rs[1]); const best = new Array(n + 1).fill(0); for (let i = 2; i <= n; i++) best[i] = Math.min(best[i - 1] + cost[i - 1], best[i - 2] + cost[i - 2]); return String(best[n]);
    },
    tests() {
      const g = rng(2003); const out = ['3\n10 15 20\n', '10\n1 100 1 1 1 100 1 1 100 1\n', '2\n5 7\n', '2\n0 0\n', '3\n1000000000 0 1000000000\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const cost = nums(rs[1]); let best = Infinity; const go = (pos, paid) => { if (pos >= n) { best = Math.min(best, paid); return; } go(pos + 1, paid + cost[pos]); go(pos + 2, paid + cost[pos]); }; go(0, 0); go(1, 0); return String(best); };
      crossCheck(() => { const n = randInt(g, 2, 12); return list(n, randArray(g, n, 0, 20)); }, (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[10, 100], [100, 1000], [1000, 1000000], [20000, 1000000000], [100000, 1000000000], [100000, 10], [100000, 1], [99999, 1000000]]) out.push(list(n, randArray(g, n, 0, hi)));
      out.push(list(50000, new Array(50000).fill(1000000000)), list(50000, new Array(50000).fill(0)), list(50000, many(50000, (i) => (i % 2 ? 0 : 1000000000))), list(50000, many(50000, (i) => (i % 2 ? 1000000000 : 0))), list(50000, many(50000, (i) => i)));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of houses.', 'The second line has `n` numbers: the amount of money in each house, in the order along the street.'],
    constraints: ['1 <= n <= 100000', '0 <= money <= 10^9'],
    slug: 'rob-the-street',
    title: 'The Richest Houses With No Two Neighbours',
    tags: ['dp', 'take-or-skip', 'array'],
    concept: {
      title: 'For every item decide: take it or skip it',
      body: [
        'Houses stand along a street, and every house holds some money. You may collect from any houses, but **never from two houses that stand next to each other** (the alarm would ring). What is the largest total you can collect? For `1 2 3 1` the best is houses 1 and 3 (1 + 3 = 4); for `2 7 9 3 1` it is 2 + 9 + 1 = 12.',
        'Walk along the street and keep two numbers: `take` is the best total when the **current house is collected**, and `skip` is the best total when it is **not collected**. Moving to the next house `x`: if you take it, the previous house must be skipped, so the new `take = skip + x`; if you skip it, the previous house may be anything, so the new `skip = max(skip, take)`. The answer is `max(take, skip)` after the last house.',
        { code: 'take = skip = 0\nfor x in money:\n    take, skip = skip + x, max(skip, take)\nprint(max(take, skip))' },
        'The two numbers are the whole **state** of the problem: all we need to know about the past is whether the last house was taken. Finding the right small state is the main skill in DP. The time is O(n), the memory O(1). The total can be as large as 2 * 10^14, so C++ and Java need 64-bit numbers.'
      ]
    },
    statement: ['There are `n` houses in a row; the house `i` holds `money[i]`. You may collect the money of any set of houses in which no two houses are neighbours. Print the largest total you can collect.'],
    outputFormat: ['Print the largest total.'],
    examples: [{ input: '4\n1 2 3 1\n', note: 'Collect the houses 1 and 3: 1 + 3 = 4.' }, { input: '5\n2 7 9 3 1\n', note: 'Collect the houses 1, 3 and 5: 2 + 9 + 1 = 12.' }],
    hints: ['After each house keep two values: the best total if this house is taken, and if it is not taken.', 'If you take the house, the previous one must have been skipped.', 'If you skip it, the previous one can be anything: take the larger of the two values.'],
    program: {
      io: ['n:int', 'money:int[n]'],
      fast: true,
      python: r`
        take = skip = 0
        for x in money:
            take, skip = skip + x, max(skip, take)
        print(max(take, skip))`,
      cpp: r`
        long long take = 0, skip = 0;
        for (long long x : money) {
            long long newTake = skip + x;
            skip = max(skip, take);
            take = newTake;
        }
        cout << max(take, skip) << "\n";`,
      java: r`
        long take = 0, skip = 0;
        for (int i = 0; i < n; i++) {
            long newTake = skip + money[i];
            skip = Math.max(skip, take);
            take = newTake;
        }
        System.out.println(Math.max(take, skip));`
    },
    solution: { explanation: ['Two values are kept while walking along the street: the best total when the current house is taken (the previous one was skipped) and the best total when it is skipped (the larger of the two earlier values). The answer is the larger one after the last house.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const money = nums(rs[1]); const best = new Array(n + 2).fill(0); for (let i = 0; i < n; i++) best[i + 2] = Math.max(best[i + 1], best[i] + money[i]); return String(best[n + 1]);
    },
    tests() {
      const g = rng(2004); const out = ['4\n1 2 3 1\n', '5\n2 7 9 3 1\n', '1\n5\n', '2\n3 4\n', '3\n0 0 0\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const money = nums(rs[1]); let best = 0; for (let mask = 0; mask < (1 << n); mask++) { if (mask & (mask >> 1)) continue; let sum = 0; for (let i = 0; i < n; i++) if (mask >> i & 1) sum += money[i]; best = Math.max(best, sum); } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 12); return list(n, randArray(g, n, 0, 30)); }, (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[10, 100], [100, 1000], [1000, 1000000], [20000, 1000000000], [100000, 1000000000], [100000, 5], [99999, 1000000]]) out.push(list(n, randArray(g, n, 0, hi)));
      out.push(list(50000, new Array(50000).fill(1000000000)), list(50000, new Array(50000).fill(0)), list(50000, many(50000, (i) => (i % 2 ? 0 : 1000000000))), list(50000, many(50000, (i) => (i % 2 ? 1000000000 : 1))), list(50000, many(50000, (i) => i)), list(50000, many(50000, (i) => 50000 - i)), list(50000, many(50000, (i) => (i % 3 === 1 ? 1000000000 : 1))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of houses.', 'The second line has `n` numbers: the amount of money in each house, in the order around the circle.'],
    constraints: ['1 <= n <= 100000', '0 <= money <= 10^9'],
    slug: 'rob-the-circle',
    title: 'The Same Houses Around a Round Square',
    tags: ['dp', 'take-or-skip', 'circular'],
    concept: {
      title: 'A circle is two lines: either the first house or the last house is left out',
      body: [
        'Now the houses stand around a round square, so the **last house is a neighbour of the first one**. Again you may not collect from two neighbours. For `2 3 2` the answer is 3 (the middle house alone): collecting the first and the last house is not allowed.',
        'The circle breaks the line into two cases. If you do not collect from the **first** house, the rest is an ordinary street: the houses `1 .. n - 1`. If you do not collect from the **last** house, the rest is the street `0 .. n - 2`. Every valid plan skips at least one of the two ends (they are neighbours!), so the answer is the **larger of the two street answers**. A single house (`n = 1`) has no neighbour, and the answer is its money.',
        { code: 'def street(money, lo, hi):               # the best total for money[lo:hi] along a line\n    take = skip = 0\n    for i in range(lo, hi):\n        take, skip = skip + money[i], max(skip, take)\n    return max(take, skip)\n\nprint(money[0] if n == 1 else max(street(money, 0, n - 1), street(money, 1, n)))' },
        'Reducing a new problem to a few runs of an old one is often the fastest way to solve it. Here the cost is two passes over the array: O(n) time and O(1) memory.'
      ]
    },
    statement: ['There are `n` houses placed around a circle: the house `i` is a neighbour of the houses `i - 1` and `i + 1`, and the last house is a neighbour of the first one. You may collect the money of any set of houses that has no two neighbours. Print the largest total (for `n = 1` the single house has no neighbour).'],
    outputFormat: ['Print the largest total.'],
    examples: [{ input: '3\n2 3 2\n', note: 'The first and the last house are neighbours, so the best is the middle house: 3.' }, { input: '4\n1 2 3 1\n', note: 'The first and the last house are neighbours. The best is the first and the third house: 1 + 3 = 4.' }],
    hints: ['Every valid plan leaves out the first house or the last house.', 'Solve the ordinary street for the houses 0 .. n - 2 and for 1 .. n - 1.', 'Handle n = 1 separately.'],
    program: {
      io: ['n:int', 'money:int[n]'],
      fast: true,
      helpers: {
        python: r`
          def street(money, lo, hi):
              take = skip = 0
              for i in range(lo, hi):
                  take, skip = skip + money[i], max(skip, take)
              return max(take, skip)`,
        cpp: r`
          long long street(const vector<long long>& money, int lo, int hi) {
              long long take = 0, skip = 0;
              for (int i = lo; i < hi; i++) {
                  long long newTake = skip + money[i];
                  skip = max(skip, take);
                  take = newTake;
              }
              return max(take, skip);
          }`,
        java: r`
          static long street(long[] money, int lo, int hi) {
              long take = 0, skip = 0;
              for (int i = lo; i < hi; i++) {
                  long newTake = skip + money[i];
                  skip = Math.max(skip, take);
                  take = newTake;
              }
              return Math.max(take, skip);
          }`
      },
      python: r`
        if n == 1:
            print(money[0])
        else:
            print(max(street(money, 0, n - 1), street(money, 1, n)))`,
      cpp: r`
        if (n == 1) cout << money[0] << "\n";
        else cout << max(street(money, 0, (int)n - 1), street(money, 1, (int)n)) << "\n";`,
      java: r`
        if (n == 1) System.out.println(money[0]);
        else System.out.println(Math.max(street(money, 0, (int) n - 1), street(money, 1, (int) n)));`
    },
    solution: { explanation: ['Every valid plan leaves out the first or the last house, so the answer is the larger of the best totals of the street without the last house and of the street without the first house (for one house it is its money).'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const money = nums(rs[1]); if (n === 1) return String(money[0]);
      const line = (lo, hi) => { const best = new Array(hi - lo + 2).fill(0); for (let i = lo; i < hi; i++) best[i - lo + 2] = Math.max(best[i - lo + 1], best[i - lo] + money[i]); return best[hi - lo + 1]; };
      return String(Math.max(line(0, n - 1), line(1, n)));
    },
    tests() {
      const g = rng(2005); const out = ['3\n2 3 2\n', '4\n1 2 3 1\n', '1\n7\n', '2\n3 4\n', '3\n5 1 5\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const money = nums(rs[1]); let best = 0; for (let mask = 0; mask < (1 << n); mask++) { let ok = true; for (let i = 0; i < n && n > 1; i++) if ((mask >> i & 1) && (mask >> ((i + 1) % n) & 1)) { ok = n === 1; break; } if (!ok) continue; let sum = 0; for (let i = 0; i < n; i++) if (mask >> i & 1) sum += money[i]; best = Math.max(best, sum); } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 12); return list(n, randArray(g, n, 0, 30)); }, (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[10, 100], [100, 1000], [1000, 1000000], [20000, 1000000000], [100000, 1000000000], [100000, 5], [99999, 1000000]]) out.push(list(n, randArray(g, n, 0, hi)));
      out.push(list(50000, new Array(50000).fill(1000000000)), list(50000, new Array(50000).fill(0)), list(49999, many(49999, (i) => (i % 2 ? 0 : 1000000000))), list(50000, many(50000, (i) => (i === 0 || i === 49999 ? 1000000000 : 1))), list(50000, many(50000, (i) => i)));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the number `n`.'],
    constraints: ['1 <= n <= 1000000'],
    slug: 'tile-with-dominoes-and-l-pieces',
    title: 'Tile a Two-Row Floor With Dominoes and L-Pieces',
    tags: ['dp', 'counting', 'tiling'],
    concept: {
      title: 'Split every tiling into blocks that cannot be cut by a vertical line',
      body: [
        'A floor has 2 rows and `n` columns. You have unlimited **dominoes** (2 cells, laid flat or standing) and **L-pieces** (3 cells, an L-shape in any of its 4 turns). In how many ways can the floor be covered exactly, with no overlap and no gap? For `n = 3` there are 5 ways, for `n = 4` there are 11. The answer is printed modulo 1 000 000 007.',
        'Look at the **left end** of a tiling. Cut it by the first vertical line (between two columns) that no piece crosses; the part to the left of that line is a *block* that cannot be cut again, and the rest is any tiling of the remaining columns. How can a block that cannot be cut look? Width 1: one standing domino. Width 2: two flat dominoes (two standing ones would be two blocks of width 1). Width `k >= 3`: exactly **2** shapes, a chain of L-pieces that interlock (and the same chain mirrored).',
        { code: 'f[0] = 1\nfor i in range(1, n + 1):\n    f[i] = f[i - 1]                       # a block of width 1\n    if i >= 2: f[i] += f[i - 2]            # a block of width 2\n    if i >= 3: f[i] += 2 * prefix[i - 3]   # a block of width k >= 3: 2 shapes, any tiling of the rest\n    prefix[i] = prefix[i - 1] + f[i]       # prefix[i] = f[0] + ... + f[i]' },
        'Here `prefix[j]` is the sum `f[0] + ... + f[j]`, kept so that the sum over all block widths costs O(1). Check by hand: `f(2) = 2`, `f(3) = f(2) + f(1) + 2 * f(0) = 5`, `f(4) = 5 + 2 + 2 * (1 + 1) = 11`. The time is O(n). A neat formula `f(n) = 2 f(n - 1) + f(n - 3)` follows from the same table, but the block idea is what carries over to other tiling problems.'
      ]
    },
    statement: ['A floor has 2 rows and `n` columns. You have unlimited dominoes (two joined cells, in either direction) and L-pieces (three cells, in any of the four turns). Print the number of ways to cover the floor exactly, modulo 1000000007.'],
    outputFormat: ['Print one number: the number of tilings modulo 1000000007.'],
    examples: [{ input: '3\n', note: 'Three standing dominoes; a flat pair and a standing one in two orders; two L-pieces in two ways: 5.' }, { input: '4\n', note: '11 tilings.' }],
    hints: ['Find the first vertical line that no piece crosses; what can the part to its left look like?', 'Widths 1 and 2 have one block each; every width of 3 or more has two blocks.', 'Keep prefix sums of f to add f over all widths at once.'],
    program: {
      io: ['n:int'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        f = [0] * (n + 1)
        prefix = [0] * (n + 1)
        f[0] = 1
        prefix[0] = 1
        for i in range(1, n + 1):
            total = f[i - 1]
            if i >= 2:
                total += f[i - 2]
            if i >= 3:
                total += 2 * prefix[i - 3]
            f[i] = total % MOD
            prefix[i] = (prefix[i - 1] + f[i]) % MOD
        print(f[n])`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<long long> f(n + 1, 0), prefix(n + 1, 0);
        f[0] = 1;
        prefix[0] = 1;
        for (long long i = 1; i <= n; i++) {
            long long total = f[i - 1];
            if (i >= 2) total += f[i - 2];
            if (i >= 3) total += 2 * prefix[i - 3];
            f[i] = total % MOD;
            prefix[i] = (prefix[i - 1] + f[i]) % MOD;
        }
        cout << f[n] << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        long[] f = new long[(int) n + 1];
        long[] prefix = new long[(int) n + 1];
        f[0] = 1;
        prefix[0] = 1;
        for (int i = 1; i <= n; i++) {
            long total = f[i - 1];
            if (i >= 2) total += f[i - 2];
            if (i >= 3) total += 2 * prefix[i - 3];
            f[i] = total % MOD;
            prefix[i] = (prefix[i - 1] + f[i]) % MOD;
        }
        System.out.println(f[(int) n]);`
    },
    solution: { explanation: ['Every tiling is a sequence of blocks that cannot be cut by a vertical line: one block of width 1, one of width 2, and two of every width 3 or more. So f(i) = f(i - 1) + f(i - 2) + 2 * (f(0) + ... + f(i - 3)), computed with prefix sums.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const [n] = nums(input); const f = [1n, 1n, 2n, 5n]; for (let i = 4; i <= n; i++) f[i] = (2n * f[i - 1] + f[i - 3]) % MODN; return String(f[n] % MODN);
    },
    tests() {
      const out = ['3\n', '4\n', '1\n', '2\n'];
      // brute force: cover the cells of a 2 x n floor with every placement of a domino or an L-piece
      const count = (n) => {
        const cells = 2 * n; const idx = (r0, c) => c * 2 + r0; const shapes = []; for (let c = 0; c < n; c++) {
          if (c + 1 < n) { shapes.push([[0, c], [0, c + 1]], [[1, c], [1, c + 1]]); } shapes.push([[0, c], [1, c]]);
          if (c + 1 < n) { shapes.push([[0, c], [1, c], [0, c + 1]], [[0, c], [1, c], [1, c + 1]], [[0, c], [0, c + 1], [1, c + 1]], [[1, c], [0, c + 1], [1, c + 1]]); }
        }
        const masks = shapes.map((s) => s.reduce((m, [r0, c]) => m | (1 << idx(r0, c)), 0)); const full = (1 << cells) - 1; const memo = new Map();
        const go = (mask) => { if (mask === full) return 1; if (memo.has(mask)) return memo.get(mask); let first = 0; while (mask >> first & 1) first++; let total = 0; for (const m of masks) if ((m >> first & 1) && !(m & mask)) total += go(mask | m); memo.set(mask, total); return total; };
        return go(0);
      };
      for (let n = 1; n <= 9; n++) if (String(this.solve(single(n))) !== String(count(n))) throw new Error('reference differs from the tiling search for ' + n);
      for (const n of [5, 6, 7, 10, 20, 31, 32, 33, 50, 100, 1000, 12345, 100000, 500000, 999999, 1000000, 1000000]) out.push(single(n));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['One line with two numbers `n` and `k`: the number of fence posts and the number of colours.'],
    constraints: ['1 <= n <= 1000000', '1 <= k <= 10^9'],
    slug: 'paint-the-fence',
    title: 'Paint the Fence Posts',
    tags: ['dp', 'counting', 'two-states'],
    concept: {
      title: 'Two states: the last two posts have the same colour, or different colours',
      body: [
        'A fence has `n` posts in a row, and you have `k` colours. Every post gets one colour, but **no three posts in a row may have the same colour**. How many different paintings are there? For `n = 3` and `k = 2` the answer is 6 (all 8 paintings except the two single-colour ones). Print the answer modulo 1 000 000 007.',
        'What do we need to know about the posts painted so far to continue? Only whether the **last two posts have the same colour** (then the next post must differ) or **different colours** (then the next post may copy the last one or differ). So keep two numbers: `same` is the number of paintings whose last two posts have the same colour, and `diff` is the number whose last two posts differ. The first post has `k` paintings and no pair yet, so we start with `same = 0`, `diff = k`.',
        { code: 'same, diff = 0, k                     # after the first post\nfor _ in range(n - 1):\n    same, diff = diff, (same + diff) * (k - 1) % MOD\nprint((same + diff) % MOD)' },
        'Why these steps? A new post that **repeats** the last colour is possible only after a pair of different colours: new `same = diff`. A new post with a **new** colour has `k - 1` choices after any painting: new `diff = (same + diff) * (k - 1)`. The state has just two numbers, so this takes O(n) time and O(1) memory. Take the remainder before multiplying so the numbers fit in 64 bits.'
      ]
    },
    statement: ['A fence has `n` posts in a row and there are `k` colours. Each post is painted with one colour, and no three consecutive posts may have the same colour. Print the number of different ways to paint the fence, modulo 1000000007.'],
    outputFormat: ['Print one number: the number of ways modulo 1000000007.'],
    examples: [{ input: '3 2\n', note: 'Of the 8 paintings with two colours only AAA and BBB are not allowed: 6.' }, { input: '3 1\n', note: 'With one colour three posts must have the same colour: 0.' }],
    hints: ['Remember only two numbers: paintings whose last two posts are equal, and paintings whose last two posts differ.', 'A post can repeat the colour only after two different ones; a post can change the colour in k - 1 ways after anything.', 'Start with same = 0 and diff = k after the first post.'],
    program: {
      io: ['n:int k:int'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        same, diff = 0, k % MOD
        for _ in range(n - 1):
            same, diff = diff, (same + diff) % MOD * ((k - 1) % MOD) % MOD
        print((same + diff) % MOD)`,
      cpp: r`
        const long long MOD = 1000000007;
        long long same = 0, diff = k % MOD;
        for (long long i = 1; i < n; i++) {
            long long newSame = diff;
            long long newDiff = (same + diff) % MOD * ((k - 1) % MOD) % MOD;
            same = newSame;
            diff = newDiff;
        }
        cout << (same + diff) % MOD << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        long same = 0, diff = k % MOD;
        for (long i = 1; i < n; i++) {
            long newSame = diff;
            long newDiff = (same + diff) % MOD * ((k - 1) % MOD) % MOD;
            same = newSame;
            diff = newDiff;
        }
        System.out.println((same + diff) % MOD);`
    },
    solution: { explanation: ['Two counts are kept: paintings whose last two posts have the same colour and paintings whose last two posts differ. A post that repeats the colour is possible only after a pair of different colours, and a post with a new colour has k - 1 choices after any painting; the answer is the sum of the two counts.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const [n, k] = nums(input); const K = BigInt(k); // f(1) = k, f(2) = k * k, f(i) = (k - 1) * (f(i - 1) + f(i - 2))
      if (n === 1) return String(K % MODN); let a = K, b = K * K % MODN; for (let i = 3; i <= n; i++) { const c = (K - 1n) * ((a + b) % MODN) % MODN; a = b; b = c; } return String(b % MODN);
    },
    tests() {
      const g = rng(2007); const out = ['3 2\n', '3 1\n', '1 1\n', '2 1\n', '1 1000000000\n', '2 1000000000\n'];
      const brute = (input) => { const [n, k] = nums(input); let count = 0; const go = (pos, a, b) => { if (pos === n) { count++; return; } for (let c = 0; c < k; c++) { if (a === c && b === c) continue; go(pos + 1, b, c); } }; go(0, -1, -2); return String(count); };
      crossCheck(() => `${randInt(g, 1, 7)} ${randInt(g, 1, 4)}\n`, (i) => this.solve(i), brute, 300);
      for (const [n, k] of [[5, 2], [10, 3], [30, 2], [100, 5], [1000, 7], [5000, 1000000000], [100000, 2], [100000, 1000000000], [500000, 3], [999999, 999999937], [1000000, 1000000000], [1000000, 2], [1000000, 3], [1000000, 1], [1000000, 999999999]]) out.push(`${n} ${k}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the number `n`.'],
    constraints: ['1 <= n <= 1000000'],
    slug: 'bit-count-total',
    title: 'How Many One-Bits Are There From 0 to n?',
    tags: ['dp', 'bits', 'table'],
    concept: {
      title: 'A number is a smaller number with one more bit at the end',
      body: [
        'Write every integer from 0 to `n` in binary and count the ones: `0` has none, `1` has one, `2 = 10` has one, `3 = 11` has two, `4 = 100` has one, `5 = 101` has two. For `n = 5` the total number of one-bits is 0 + 1 + 1 + 2 + 1 + 2 = 7. Print the total for the given `n`.',
        'Counting bits one number at a time costs about `log n` steps each. A DP table does it in O(1) per number, because **removing the last bit of `i` gives a smaller number that we have already counted**: `i >> 1` is `i` without its last bit, and that last bit is `i & 1`. So **`bits[i] = bits[i >> 1] + (i & 1)`**, with `bits[0] = 0`.',
        { code: 'bits = [0] * (n + 1)\nfor i in range(1, n + 1):\n    bits[i] = bits[i >> 1] + (i & 1)\nprint(sum(bits))' },
        'Every number `i >> 1` is smaller than `i`, so it is in the table when we need it: the table is filled from left to right. The total is at most about `20 * n`, which fits in 64 bits (and in a normal 32-bit integer for these limits). The time and the memory are O(n).'
      ]
    },
    statement: ['Print the total number of one-bits in the binary representations of all integers from 0 to `n`.'],
    outputFormat: ['Print one number: the total number of one-bits.'],
    examples: [{ input: '5\n', note: '0, 1, 1, 2, 1, 2 bits for the numbers 0 to 5: 7.' }, { input: '1\n', note: '0 + 1 = 1.' }],
    hints: ['i >> 1 is the number i without its last bit; i & 1 is that bit.', 'bits[i] = bits[i >> 1] + (i & 1).', 'Add up the whole table.'],
    program: {
      io: ['n:int'],
      fast: true,
      python: r`
        bits = [0] * (n + 1)
        for i in range(1, n + 1):
            bits[i] = bits[i >> 1] + (i & 1)
        print(sum(bits))`,
      cpp: r`
        vector<int> bits(n + 1, 0);
        long long total = 0;
        for (long long i = 1; i <= n; i++) {
            bits[i] = bits[i >> 1] + (int)(i & 1);
            total += bits[i];
        }
        cout << total << "\n";`,
      java: r`
        int[] bits = new int[(int) n + 1];
        long total = 0;
        for (int i = 1; i <= n; i++) {
            bits[i] = bits[i >> 1] + (i & 1);
            total += bits[i];
        }
        System.out.println(total);`
    },
    solution: { explanation: ['bits[i] = bits[i >> 1] + (i & 1) fills a table of the number of one-bits of every number up to n; the answer is the sum of the table.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const [n] = nums(input); let total = 0; for (let i = 0; i <= n; i++) { let x = i; while (x) { total += x & 1; x >>= 1; } } return String(total);
    },
    tests() {
      const out = ['5\n', '1\n', '2\n', '3\n', '7\n', '8\n'];
      for (const n of [15, 16, 17, 31, 32, 63, 64, 100, 255, 256, 1000, 1023, 1024, 4095, 65535, 65536, 100000, 524287, 524288, 999999, 1000000, 1000000]) out.push(single(n));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of days.', 'The second line has `n` numbers: the price of a share on each day.'],
    constraints: ['1 <= n <= 100000', '0 <= price <= 10^9'],
    slug: 'one-trade-profit',
    title: 'The Best Day to Buy and the Best Day to Sell',
    tags: ['dp', 'array', 'prefix-minimum'],
    concept: {
      title: 'Selling today: the best profit uses the lowest price seen so far',
      body: [
        'You know the price of a share for each of the next `n` days. You may buy **once** and sell **once**, and the sale must come on a later day than the purchase. What is the largest profit? If no profit is possible, the answer is 0 (you simply do not trade). For the prices `7 1 5 3 6 4` buy at 1 and sell at 6: profit 5. For `7 6 4 3 1` the prices only fall: 0.',
        'A slow way tries every pair of days: O(n^2). Instead, think about **which day you sell**. If you sell today at price `p`, the best purchase is the **lowest price on the days before**. So walk along the days and keep `low`, the lowest price seen so far. The best profit of selling today is `p - low`, and the answer is the maximum of that over all days.',
        { code: 'best = 0\nlow = prices[0]\nfor p in prices:\n    best = max(best, p - low)    # sell today\n    low = min(low, p)            # remember the cheapest day so far\nprint(best)' },
        '`low` is a tiny DP table: `low[i]` = the minimum of the first `i + 1` prices, computed from `low[i - 1]`. The same "best so far" idea turns many quadratic loops into one pass. The time is O(n), the memory O(1).'
      ]
    },
    statement: ['The prices of a share on `n` days are given. You may buy once and sell once, selling on a later day than buying. Print the largest profit you can make, or 0 if no profit is possible.'],
    outputFormat: ['Print the largest profit (at least 0).'],
    examples: [{ input: '6\n7 1 5 3 6 4\n', note: 'Buy at 1 and sell at 6: 5.' }, { input: '5\n7 6 4 3 1\n', note: 'The prices only fall: 0.' }],
    hints: ['Fix the day you sell; which buying day is best?', 'Keep the lowest price seen so far while walking along the days.', 'The answer is the maximum of (price - lowest price before it), and at least 0.'],
    program: {
      io: ['n:int', 'prices:int[n]'],
      fast: true,
      python: r`
        best = 0
        low = prices[0]
        for p in prices:
            best = max(best, p - low)
            low = min(low, p)
        print(best)`,
      cpp: r`
        long long best = 0, low = prices[0];
        for (long long p : prices) {
            best = max(best, p - low);
            low = min(low, p);
        }
        cout << best << "\n";`,
      java: r`
        long best = 0, low = prices[0];
        for (int i = 0; i < n; i++) {
            best = Math.max(best, prices[i] - low);
            low = Math.min(low, prices[i]);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['While walking along the days the lowest price so far is kept; selling today gives the profit price - lowest, and the answer is the largest such profit (at least 0).'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const p = nums(rs[1]); const low = []; let m = Infinity; for (let i = 0; i < n; i++) { m = Math.min(m, p[i]); low.push(m); } let best = 0; for (let i = 0; i < n; i++) best = Math.max(best, p[i] - low[i]); return String(best);
    },
    tests() {
      const g = rng(2009); const out = ['6\n7 1 5 3 6 4\n', '5\n7 6 4 3 1\n', '1\n5\n', '2\n1 2\n', '2\n2 1\n', '3\n3 3 3\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const p = nums(rs[1]); let best = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) best = Math.max(best, p[j] - p[i]); return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 12); return list(n, randArray(g, n, 0, 30)); }, (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[10, 100], [100, 1000], [1000, 1000000], [20000, 1000000000], [100000, 1000000000], [100000, 5], [99999, 1000000]]) out.push(list(n, randArray(g, n, 0, hi)));
      out.push(list(50000, many(50000, (i) => i)), list(50000, many(50000, (i) => 1000000000 - i)), list(50000, many(50000, (i) => (i < 25000 ? 1000000000 - i : i))), list(50000, new Array(50000).fill(1000000000)), list(50000, many(50000, (i) => (i === 12000 ? 0 : i === 40000 ? 1000000000 : 500000000))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the number `n`.'],
    constraints: ['1 <= n <= 1500'],
    slug: 'count-search-tree-shapes',
    title: 'How Many Different Search Trees Have n Nodes?',
    tags: ['dp', 'counting', 'catalan', 'bst'],
    concept: {
      title: 'Choose the root, then multiply the counts of the left and the right part',
      body: [
        'A *binary search tree* (BST) keeps its keys in order: everything in the left part of a node is smaller, everything in the right part is bigger. How many structurally different BSTs can be built from the keys `1 .. n`? For `n = 3` there are 5 (any of the three keys can be the root, and the others are arranged around it). Print the answer modulo 1 000 000 007.',
        'Let `count(m)` be the number of BSTs with `m` keys (the actual values do not matter, only their order). Choose the **root**: if the root is the `j`-th smallest key, the `j - 1` smaller keys must form the left part and the `m - j` bigger keys the right part. The two parts are built **independently**, so we multiply: `count(j - 1) * count(m - j)`. Summing over all choices of the root gives **`count(m) = sum over left from 0 to m - 1 of count(left) * count(m - 1 - left)`**, with `count(0) = 1` (the empty tree).',
        { code: 'count = [0] * (n + 1)\ncount[0] = 1\nfor m in range(1, n + 1):\n    total = 0\n    for left in range(m):                      # the number of keys in the left part\n        total += count[left] * count[m - 1 - left]\n    count[m] = total % MOD\nprint(count[n])' },
        'The numbers `1, 1, 2, 5, 14, 42, ...` are the *Catalan numbers*; they count many things (bracket sequences, triangulations, paths that stay below a line). The table needs O(n^2) time, because each cell sums over `m` splits, and O(n) memory. Each product is below 10^18 after the remainder, so it fits in 64 bits.'
      ]
    },
    statement: ['Print the number of structurally different binary search trees that store the keys 1 to `n`, modulo 1000000007.'],
    outputFormat: ['Print one number: the number of trees modulo 1000000007.'],
    examples: [{ input: '3\n', note: 'Five different shapes: 5.' }, { input: '1\n', note: 'A single node: 1.' }],
    hints: ['Fix the root; the keys before it form the left part, the keys after it form the right part.', 'The number of trees with the given root is the product of the counts of the two parts.', 'count(m) is the sum over all sizes of the left part; count(0) = 1.'],
    program: {
      io: ['n:int'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        count = [0] * (n + 1)
        count[0] = 1
        for m in range(1, n + 1):
            total = 0
            for left in range(m):
                total += count[left] * count[m - 1 - left]
            count[m] = total % MOD
        print(count[n])`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<long long> count(n + 1, 0);
        count[0] = 1;
        for (long long m = 1; m <= n; m++) {
            long long total = 0;
            for (long long left = 0; left < m; left++) {
                total = (total + count[left] * count[m - 1 - left]) % MOD;
            }
            count[m] = total;
        }
        cout << count[n] << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        long[] count = new long[(int) n + 1];
        count[0] = 1;
        for (int m = 1; m <= n; m++) {
            long total = 0;
            for (int left = 0; left < m; left++) {
                total = (total + count[left] * count[m - 1 - left]) % MOD;
            }
            count[m] = total;
        }
        System.out.println(count[(int) n]);`
    },
    solution: { explanation: ['count(m) = sum over the size of the left part of count(left) * count(m - 1 - left), with count(0) = 1: the root splits the keys into a left and a right part that are built independently.'], complexity: 'Time O(n^2), space O(n).' },
    solve(input) {
      const [n] = nums(input); // Catalan numbers by the formula C(n) = C(n - 1) * 2 * (2n - 1) / (n + 1) with exact big integers
      let c = 1n; for (let i = 1; i <= n; i++) c = c * BigInt(2 * (2 * i - 1)) / BigInt(i + 1); return String(c % MODN);
    },
    tests() {
      const out = ['3\n', '1\n', '2\n', '4\n', '5\n'];
      for (const n of [6, 7, 10, 15, 19, 20, 30, 50, 100, 250, 500, 750, 1000, 1234, 1499, 1500, 1500]) out.push(single(n));
      return out;
    }
  }
];
