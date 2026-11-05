import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const MOD = 1000000007;
const head2 = (a, b, arr) => `${a} ${b}\n${arr.join(' ')}\n`;
const parse2 = (input) => { const rs = rows(input); const [a, b] = nums(rs[0]); return { a, b, arr: nums(rs[1]) }; };
const distinctCoins = (g, n, hi) => { const set = new Set(); while (set.size < n) set.add(randInt(g, 1, hi)); return shuffle(g, [...set]); };

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n` and `amount`: the number of coin kinds and the amount to pay.', 'The second line has `n` numbers: the values of the coins (each kind can be used any number of times).'],
    constraints: ['1 <= n <= 100', '1 <= coin value <= 10000', '0 <= amount <= 20000'],
    slug: 'fewest-coins-for-amount',
    title: 'Pay the Exact Amount With the Fewest Coins',
    tags: ['dp', 'coins', 'unbounded-knapsack', 'min-count'],
    concept: {
      title: 'For every amount from 0 upwards: the best way is one coin plus the best way for the rest',
      body: [
        'You have coins of several values, and as many coins of each value as you need. What is the **smallest number of coins** that add up to exactly `amount`? With the coins `1 2 5` and the amount `11` the answer is 3 (5 + 5 + 1). If the amount cannot be paid exactly (for the coins `2` and the amount `3`) the answer is -1. A greedy "take the biggest coin first" fails for some coin sets (coins `1 3 4`, amount `6`: greedy takes 4 + 1 + 1, but 3 + 3 is better), so we use DP.',
        'Let `best(v)` be the smallest number of coins that add up to `v`, with `best(0) = 0`. The last coin of an optimal payment for `v` is some coin `c <= v`, and the rest is an optimal payment for `v - c`, so **`best(v) = 1 + min over all coins c <= v of best(v - c)`**. If no coin fits or the rest cannot be paid, `best(v)` is "impossible" (a large number). We can fill the table coin by coin: for each coin `c` walk `v` from `c` up to `amount` and try `best(v - c) + 1`; walking **upwards** allows the same coin to be used again.',
        { code: 'INF = amount + 1                          # more coins than any real answer\nbest = [0] + [INF] * amount\nfor c in coins:\n    for v in range(c, amount + 1):          # upwards: the coin may be used again\n        if best[v - c] + 1 < best[v]:\n            best[v] = best[v - c] + 1\nprint(best[amount] if best[amount] < INF else -1)' },
        'This is the *unbounded knapsack* pattern: each item can be taken many times, so the inner loop goes upwards. (When each item can be taken only once, the loop goes downwards, as the next problems show.) The time is O(n * amount) and the memory O(amount).'
      ]
    },
    statement: ['There are `n` kinds of coins, each available without limit. Print the smallest number of coins whose values add up to exactly `amount`, or -1 if that is impossible (for `amount = 0` the answer is 0).'],
    outputFormat: ['Print the smallest number of coins, or -1.'],
    examples: [{ input: '3 11\n1 2 5\n', note: '5 + 5 + 1: 3 coins.' }, { input: '1 3\n2\n', note: 'Odd amounts cannot be paid with the coin 2: -1.' }],
    hints: ['Let best(v) be the smallest number of coins for the amount v; best(0) = 0.', 'The last coin c gives best(v) = best(v - c) + 1; take the smallest over all coins.', 'Fill the table coin by coin with v going upwards, so that a coin can be reused.'],
    program: {
      io: ['n:int amount:int', 'coins:int[n]'],
      fast: true,
      python: r`
        INF = amount + 1
        best = [0] + [INF] * amount
        for c in coins:
            for v in range(c, amount + 1):
                if best[v - c] + 1 < best[v]:
                    best[v] = best[v - c] + 1
        print(best[amount] if best[amount] < INF else -1)`,
      cpp: r`
        long long INF = amount + 1;
        vector<long long> best(amount + 1, INF);
        best[0] = 0;
        for (long long c : coins) {
            for (long long v = c; v <= amount; v++) {
                if (best[v - c] + 1 < best[v]) best[v] = best[v - c] + 1;
            }
        }
        cout << (best[amount] < INF ? best[amount] : -1) << "\n";`,
      java: r`
        int target = (int) amount;
        long inf = target + 1;
        long[] best = new long[target + 1];
        Arrays.fill(best, inf);
        best[0] = 0;
        for (int k = 0; k < n; k++) {
            int c = (int) coins[k];
            for (int v = c; v <= target; v++) {
                if (best[v - c] + 1 < best[v]) best[v] = best[v - c] + 1;
            }
        }
        System.out.println(best[target] < inf ? best[target] : -1);`
    },
    solution: { explanation: ['best(v) is the smallest number of coins that add up to v; for each coin c the table is walked upwards with best(v) = min(best(v), best(v - c) + 1), so that the same coin can be used many times. The answer is best(amount), or -1 if it stayed at the large starting value.'], complexity: 'Time O(n * amount), space O(amount).' },
    solve(input) {
      const { a: n, b: amount, arr: coins } = parse2(input); const INF = 1e9; const best = new Array(amount + 1).fill(INF); best[0] = 0; // by amount: try every coin for the last position
      for (let v = 1; v <= amount; v++) for (const c of coins) if (c <= v && best[v - c] + 1 < best[v]) best[v] = best[v - c] + 1; return String(best[amount] >= INF ? -1 : best[amount]);
    },
    tests() {
      const g = rng(2031); const out = ['3 11\n1 2 5\n', '1 3\n2\n', '1 0\n7\n', '2 6\n1 3\n', '3 6\n1 3 4\n'];
      const brute = (input) => { const { b: amount, arr: coins } = parse2(input); let best = Infinity; const go = (i, left, used) => { if (left === 0) { best = Math.min(best, used); return; } if (i === coins.length || used >= best) return; for (let k = 0; k * coins[i] <= left; k++) go(i + 1, left - k * coins[i], used + k); }; go(0, amount, 0); return String(best === Infinity ? -1 : best); };
      crossCheck(() => { const n = randInt(g, 1, 4); return head2(n, randInt(g, 0, 40), distinctCoins(g, n, 12)); }, (i) => this.solve(i), brute, 300);
      for (const [n, amount, hi] of [[5, 100, 20], [10, 1000, 50], [30, 5000, 300], [100, 20000, 10000], [100, 20000, 200], [100, 19999, 5000], [50, 20000, 7], [3, 20000, 10000], [100, 20000, 100], [1, 20000, 1], [2, 20000, 10000]]) { const coins = distinctCoins(g, Math.min(n, hi), hi); out.push(head2(coins.length, amount, coins)); }
      out.push(head2(4, 20000, [7919, 6007, 9001, 10000]), head2(3, 19999, [2, 4, 10000]), head2(2, 20000, [9999, 10000]));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `amount`: the number of coin kinds and the amount.', 'The second line has `n` different coin values (each kind can be used any number of times).'],
    constraints: ['1 <= n <= 100', '1 <= coin value <= 10000', '0 <= amount <= 20000'],
    slug: 'ways-to-make-change',
    title: 'In How Many Ways Can the Change Be Paid?',
    tags: ['dp', 'coins', 'unbounded-knapsack', 'counting'],
    concept: {
      title: 'Counting combinations, not orders: put the coins in the outer loop',
      body: [
        'With unlimited coins of given values, count the **combinations** of coins that add up to `amount`. Two payments are the same if they use the same number of coins of each value, whatever the order. For the coins `1 2 5` and the amount `5` there are 4 combinations: 5; 2+2+1; 2+1+1+1; 1+1+1+1+1. Print the number modulo 1 000 000 007.',
        'Let `ways(v)` be the number of combinations for the amount `v`; `ways(0) = 1` (pay nothing). Process the coin kinds **one at a time**. After the coin kinds `c1 .. ck` are processed, `ways(v)` counts the combinations that use only those kinds. Adding a new kind `c` allows any number of coins `c` on top of the old combinations, which gives **`ways(v) += ways(v - c)`** for `v` from `c` upwards (the `ways(v - c)` is already updated, so it includes combinations with several coins `c`).',
        { code: 'ways = [1] + [0] * amount\nfor c in coins:                          # the coins in the OUTER loop\n    for v in range(c, amount + 1):\n        ways[v] = (ways[v] + ways[v - c]) % MOD\nprint(ways[amount])' },
        'The order of the loops matters. With the amounts in the outer loop and the coins in the inner loop, `1 + 2` and `2 + 1` would both be counted (that counts *orders*, the stairs problem). With the coins outside, each combination is counted once, because the kinds are used in a fixed sequence. Time O(n * amount), memory O(amount).'
      ]
    },
    statement: ['There are `n` kinds of coins with different values, each available without limit. Print the number of different combinations of coins (the order does not matter) whose values add up to exactly `amount`, modulo 1000000007. For `amount = 0` the answer is 1.'],
    outputFormat: ['Print the number of combinations modulo 1000000007.'],
    examples: [{ input: '3 5\n1 2 5\n', note: '5; 2+2+1; 2+1+1+1; 1+1+1+1+1: 4 combinations.' }, { input: '1 3\n2\n', note: 'The amount 3 cannot be paid with the coin 2: 0.' }],
    hints: ['Let ways(v) be the number of combinations for v; ways(0) = 1.', 'Process the coin kinds one by one: ways(v) += ways(v - c) for v from c upwards.', 'Put the coins in the outer loop, otherwise different orders are counted separately.'],
    program: {
      io: ['n:int amount:int', 'coins:int[n]'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        ways = [1] + [0] * amount
        for c in coins:
            for v in range(c, amount + 1):
                ways[v] = (ways[v] + ways[v - c]) % MOD
        print(ways[amount])`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<long long> ways(amount + 1, 0);
        ways[0] = 1;
        for (long long c : coins) {
            for (long long v = c; v <= amount; v++) {
                ways[v] = (ways[v] + ways[v - c]) % MOD;
            }
        }
        cout << ways[amount] << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int target = (int) amount;
        long[] ways = new long[target + 1];
        ways[0] = 1;
        for (int k = 0; k < n; k++) {
            int c = (int) coins[k];
            for (int v = c; v <= target; v++) {
                ways[v] = (ways[v] + ways[v - c]) % MOD;
            }
        }
        System.out.println(ways[target]);`
    },
    solution: { explanation: ['The coin kinds are added one at a time: ways(v) += ways(v - c) for v from c upwards, starting from ways(0) = 1, so that every combination is counted once. The answer is ways(amount) modulo 1000000007.'], complexity: 'Time O(n * amount), space O(amount).' },
    solve(input) {
      const { b: amount, arr: coins } = parse2(input); // a 2D table: ways[i][v] uses only the first i kinds
      let prev = new Array(amount + 1).fill(0); prev[0] = 1; for (let i = 0; i < coins.length; i++) { const cur = prev.slice(); for (let v = coins[i]; v <= amount; v++) cur[v] = (cur[v] + cur[v - coins[i]]) % MOD; prev = cur; } return String(prev[amount]);
    },
    tests() {
      const g = rng(2032); const out = ['3 5\n1 2 5\n', '1 3\n2\n', '1 0\n7\n', '2 10\n2 5\n'];
      const brute = (input) => { const { b: amount, arr: coins } = parse2(input); let count = 0; const go = (i, left) => { if (left === 0) { count++; return; } if (i === coins.length) return; for (let k = 0; k * coins[i] <= left; k++) go(i + 1, left - k * coins[i]); }; go(0, amount); return String(count % MOD); };
      crossCheck(() => { const n = randInt(g, 1, 4); return head2(n, randInt(g, 0, 40), distinctCoins(g, n, 12)); }, (i) => this.solve(i), brute, 300);
      for (const [n, amount, hi] of [[5, 100, 20], [10, 1000, 50], [30, 5000, 300], [100, 20000, 10000], [100, 20000, 200], [100, 19999, 5000], [50, 20000, 60], [3, 20000, 10000], [100, 20000, 100], [1, 20000, 1], [2, 20000, 10000]]) { const coins = distinctCoins(g, Math.min(n, hi), hi); out.push(head2(coins.length, amount, coins)); }
      out.push(head2(4, 20000, [7919, 6007, 9001, 10000]), head2(100, 20000, many(100, (i) => i + 1)));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of numbers.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 200', '1 <= each number <= 100'],
    slug: 'equal-halves-partition',
    title: 'Can the Numbers Be Split Into Two Equal Halves?',
    tags: ['dp', 'subset-sum', 'knapsack', 'bitset'],
    concept: {
      title: 'Subset sum: which totals can be made from some of the numbers?',
      body: [
        'Split a list of positive numbers into two groups with **exactly the same sum**. Is it possible? For `1 5 11 5` yes: `1 + 5 + 5 = 11`. For `1 2 3 5` no. If the total is odd the answer is no at once. Otherwise we need a group of numbers whose sum is **half of the total**; the rest then has the same sum automatically.',
        'This is the *subset sum* problem. Let `can(s)` be true if some of the numbers add up to exactly `s`. At the start only `can(0)` is true (take nothing). Take the numbers one by one: with a new number `x`, every sum `s` that was possible stays possible, and `s + x` becomes possible too. When each number may be used **once**, the table must be updated from the **top downwards** (`s` from the target to `x`), so that `x` is not used twice in the same round: `can(s) = can(s) or can(s - x)`.',
        { code: 'half = total // 2\ncan = [False] * (half + 1)\ncan[0] = True\nfor x in a:\n    for s in range(half, x - 1, -1):         # downwards: each number is used at most once\n        if can[s - x]:\n            can[s] = True\nprint("yes" if can[half] else "no")' },
        'The table can also be one big number whose **bits** are the possible sums: `bits |= bits << x` adds `x` to all possible sums at once, and Python handles such big numbers well (C++ has `bitset` for the same trick). The time of the table is O(n * total), here at most 200 * 20 000 = 4 million steps. Compare with the coin problems: there each coin could be used again (loop upwards); here each number is used once (loop downwards).'
      ]
    },
    statement: ['A list of `n` positive integers is given. Print `yes` if the numbers can be divided into two groups (every number in exactly one group) with equal sums, otherwise print `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '4\n1 5 11 5\n', note: '1 + 5 + 5 = 11: yes.' }, { input: '4\n1 2 3 5\n', note: 'The total is 11, odd: no.' }],
    hints: ['If the total is odd the answer is no. Otherwise look for a group with the sum total / 2.', 'can(s) is true if some of the numbers add up to s; start with can(0) = true.', 'For each number x update s from the top down to x: can(s) |= can(s - x).'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        total = sum(a)
        if total % 2:
            print("no")
        else:
            bits = 1
            for x in a:
                bits |= bits << x
            print("yes" if (bits >> (total // 2)) & 1 else "no")`,
      cpp: r`
        long long total = 0;
        for (long long x : a) total += x;
        if (total % 2) {
            cout << "no\n";
        } else {
            int half = (int)(total / 2);
            vector<char> can(half + 1, 0);
            can[0] = 1;
            for (long long x : a) {
                for (int s = half; s >= x; s--) {
                    if (can[s - x]) can[s] = 1;
                }
            }
            cout << (can[half] ? "yes" : "no") << "\n";
        }`,
      java: r`
        long total = 0;
        for (long x : a) total += x;
        if (total % 2 != 0) {
            System.out.println("no");
        } else {
            int half = (int) (total / 2);
            boolean[] can = new boolean[half + 1];
            can[0] = true;
            for (int k = 0; k < n; k++) {
                int x = (int) a[k];
                for (int s = half; s >= x; s--) {
                    if (can[s - x]) can[s] = true;
                }
            }
            System.out.println(can[half] ? "yes" : "no");
        }`
    },
    solution: { explanation: ['If the total is odd the answer is no. Otherwise the possible subset sums are marked in a table (each number updates it from the top down so that it is used once), and the answer is whether the half of the total can be made.'], complexity: 'Time O(n * total), space O(total).' },
    solve(input) {
      const a = nums(rows(input)[1]); const total = a.reduce((x, y) => x + y, 0); if (total % 2) return 'no'; const half = total / 2; let sums = new Set([0]); for (const x of a) { const next = new Set(sums); for (const s of sums) if (s + x <= half) next.add(s + x); sums = next; } return sums.has(half) ? 'yes' : 'no';
    },
    tests() {
      const g = rng(2033); const out = ['4\n1 5 11 5\n', '4\n1 2 3 5\n', '1\n1\n', '2\n3 3\n', '3\n1 1 2\n'];
      const brute = (input) => { const a = nums(rows(input)[1]); const total = a.reduce((x, y) => x + y, 0); for (let mask = 0; mask < (1 << a.length); mask++) { let s = 0; for (let i = 0; i < a.length; i++) if (mask >> i & 1) s += a[i]; if (s * 2 === total) return 'yes'; } return 'no'; };
      const list = (n, hi) => `${n}\n${randArray(g, n, 1, hi).join(' ')}\n`;
      crossCheck(() => list(randInt(g, 1, 12), 15), (i) => this.solve(i), brute, 400);
      for (const [n, hi] of [[10, 10], [30, 30], [100, 100], [200, 100], [200, 100], [200, 99], [200, 3], [199, 100], [150, 50]]) out.push(list(n, hi));
      // many equal parts and a guaranteed split: two halves with the same sum
      const half = many(100, () => randInt(g, 1, 100)); const sum = half.reduce((x, y) => x + y, 0); const other = []; let rest = sum; while (rest > 0) { const x = Math.min(rest, randInt(g, 1, 100)); other.push(x); rest -= x; }
      const both = shuffle(g, [...half, ...other]); if (both.length <= 200) out.push(`${both.length}\n${both.join(' ')}\n`);
      out.push(`200\n${new Array(200).fill(100).join(' ')}\n`, `199\n${new Array(199).fill(100).join(' ')}\n`, `200\n${many(200, (i) => (i === 0 ? 99 : 100)).join(' ')}\n`, `200\n${many(200, (i) => (i === 0 ? 1 : 100)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `target`.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 100', '0 <= each number <= 100', '-10000 <= target <= 10000'],
    slug: 'target-sum-signs',
    title: 'Put a Plus or a Minus in Front of Every Number',
    tags: ['dp', 'subset-sum', 'counting', 'knapsack'],
    concept: {
      title: 'Signs become a subset: the numbers with a plus form a group with a known sum',
      body: [
        'Put a **+ or a - sign in front of every number** of a list and add everything up. In how many of the `2^n` ways is the result exactly `target`? For the numbers `1 1 1 1 1` and the target `3` there are 5 ways (one of the five numbers gets the minus). Print the count modulo 1 000 000 007. Numbers can be zero, and a zero can take either sign, so it doubles the count.',
        'Let `P` be the sum of the numbers that get a plus and `N` the sum of those with a minus. Then `P - N = target` and `P + N = total`. Adding the two equations gives **`P = (total + target) / 2`**. So the question becomes: **in how many ways can a group of numbers with the sum exactly `P` be chosen?** If `total + target` is odd, or `|target| > total`, the answer is 0. This is a *counting subset sum*: `ways(s)` is the number of groups with the sum `s`, `ways(0) = 1`.',
        { code: 'total = sum(a)\nif abs(target) > total or (total + target) % 2:\n    print(0)\nelse:\n    need = (total + target) // 2\n    ways = [1] + [0] * need\n    for x in a:\n        for s in range(need, x - 1, -1):       # downwards: each number once\n            ways[s] = (ways[s] + ways[s - x]) % MOD\n    print(ways[need])' },
        'For `x = 0` the inner loop runs over the whole table and `ways[s] += ways[s]` doubles every entry, which is exactly the factor 2 for the free sign. Turning a problem about signs into a problem about one chosen group is a classic reduction; the time is O(n * total) and the memory O(total).'
      ]
    },
    statement: ['A list of `n` non-negative integers and a number `target` are given. Each number gets a `+` or a `-` sign, and all the signed numbers are added. Print the number of sign assignments (there are `2^n` of them) whose sum equals `target`, modulo 1000000007.'],
    outputFormat: ['Print the number of ways modulo 1000000007.'],
    examples: [{ input: '5 3\n1 1 1 1 1\n', note: 'Exactly one of the five numbers gets the minus: 5 ways.' }, { input: '1 1\n1\n', note: '+1: 1 way.' }],
    hints: ['Let P be the sum of the numbers with a plus: P = (total + target) / 2.', 'If total + target is odd or |target| is bigger than total, the answer is 0.', 'Count the groups of numbers with the sum P, each number used at most once.'],
    program: {
      io: ['n:int target:int', 'a:int[n]'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        total = sum(a)
        if abs(target) > total or (total + target) % 2:
            print(0)
        else:
            need = (total + target) // 2
            ways = [1] + [0] * need
            for x in a:
                for s in range(need, x - 1, -1):
                    ways[s] = (ways[s] + ways[s - x]) % MOD
            print(ways[need])`,
      cpp: r`
        const long long MOD = 1000000007;
        long long total = 0;
        for (long long x : a) total += x;
        if (llabs(target) > total || (total + target) % 2 != 0) {
            cout << 0 << "\n";
        } else {
            long long need = (total + target) / 2;
            vector<long long> ways(need + 1, 0);
            ways[0] = 1;
            for (long long x : a) {
                for (long long s = need; s >= x; s--) {
                    ways[s] = (ways[s] + ways[s - x]) % MOD;
                }
            }
            cout << ways[need] << "\n";
        }`,
      java: r`
        final long MOD = 1000000007L;
        long total = 0;
        for (long x : a) total += x;
        if (Math.abs(target) > total || (total + target) % 2 != 0) {
            System.out.println(0);
        } else {
            int need = (int) ((total + target) / 2);
            long[] ways = new long[need + 1];
            ways[0] = 1;
            for (int k = 0; k < n; k++) {
                int x = (int) a[k];
                for (int s = need; s >= x; s--) {
                    ways[s] = (ways[s] + ways[s - x]) % MOD;
                }
            }
            System.out.println(ways[need]);
        }`,
      includes: ['<cstdlib>']
    },
    solution: { explanation: ['With P the sum of the numbers that get a plus, P = (total + target) / 2; the answer is the number of groups of numbers with the sum P (0 if that is not a whole non-negative number reachable), counted with a downward knapsack table.'], complexity: 'Time O(n * total), space O(total).' },
    solve(input) {
      const { b: target, arr: a } = parse2(input); // a table over the sum reached so far (offset by the total), adding or subtracting each number
      const total = a.reduce((x, y) => x + y, 0); let cur = new Array(2 * total + 1).fill(0); cur[total] = 1; for (const x of a) { const nxt = new Array(2 * total + 1).fill(0); for (let s = 0; s <= 2 * total; s++) if (cur[s]) { if (s + x <= 2 * total) nxt[s + x] = (nxt[s + x] + cur[s]) % MOD; if (s - x >= 0) nxt[s - x] = (nxt[s - x] + cur[s]) % MOD; } cur = nxt; } const idx = target + total; return String(idx >= 0 && idx <= 2 * total ? cur[idx] : 0);
    },
    tests() {
      const g = rng(2034); const out = ['5 3\n1 1 1 1 1\n', '1 1\n1\n', '1 0\n0\n', '3 0\n0 0 0\n', '2 10000\n1 1\n'];
      const brute = (input) => { const { b: target, arr: a } = parse2(input); let count = 0; for (let mask = 0; mask < (1 << a.length); mask++) { let s = 0; for (let i = 0; i < a.length; i++) s += mask >> i & 1 ? a[i] : -a[i]; if (s === target) count++; } return String(count % MOD); };
      crossCheck(() => { const n = randInt(g, 1, 10); return head2(n, randInt(g, -15, 15), randArray(g, n, 0, 6)); }, (i) => this.solve(i), brute, 400);
      for (const [n, hi, t] of [[10, 10, 5], [30, 30, 0], [60, 50, 100], [100, 100, 0], [100, 100, 500], [100, 100, -777], [100, 100, 10000], [100, 1, 40], [100, 0, 0], [99, 100, 1], [100, 2, 0]]) { const a = randArray(g, n, 0, hi); out.push(head2(n, t, a)); }
      out.push(head2(100, 0, new Array(100).fill(100)), head2(100, 5000, new Array(100).fill(100)), head2(100, 10000, new Array(100).fill(100)));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `k`, `m` and `n`: the number of strings, the largest total number of zeros and the largest total number of ones.', 'Each of the next `k` lines has one string of `0` and `1` characters.'],
    constraints: ['1 <= k <= 300', '0 <= m, n <= 80', '1 <= length of each string <= 100'],
    slug: 'ones-and-zeros-strings',
    title: 'How Many Binary Strings Fit in the Budget?',
    tags: ['dp', 'knapsack', 'two-dimensional', 'strings'],
    concept: {
      title: 'A knapsack with two capacities: a table over (zeros left, ones left)',
      body: [
        'You have `k` strings made of `0` and `1`. You may take some of them, but the strings you take may contain **at most `m` zeros and at most `n` ones in total**. What is the largest number of strings you can take? For the strings `10 0001 111001 1 0` with `m = 5` and `n = 3` the answer is 4: take `10`, `0001`, `1` and `0` (5 zeros and 3 ones in total).',
        'This is the 0/1 knapsack where every item has **two weights** (its zeros and its ones) and a value of 1. Let `best(i, j)` be the largest number of strings that fit into `i` zeros and `j` ones. For a string with `z` zeros and `o` ones: taking it is possible when `i >= z` and `j >= o`, and then the result is `best(i - z, j - o) + 1`. So **`best(i, j) = max(best(i, j), best(i - z, j - o) + 1)`**. Each string is used once, so the table is updated with **both indices going downwards**; then `best(i - z, j - o)` is still the value from before this string.',
        { code: 'best = [[0] * (n + 1) for _ in range(m + 1)]\nfor s in strs:\n    z = s.count("0"); o = len(s) - z\n    for i in range(m, z - 1, -1):\n        for j in range(n, o - 1, -1):\n            best[i][j] = max(best[i][j], best[i - z][j - o] + 1)\nprint(best[m][n])' },
        'A knapsack with several limits just has a table with several dimensions. The time is O(k * m * n), about 2 million steps at the largest sizes, and the memory O(m * n). The answer is `best[m][n]`: since `best` never decreases with more room, the corner of the table holds the maximum.'
      ]
    },
    statement: ['`k` binary strings are given. Choose as many of them as possible so that the chosen strings contain in total at most `m` characters `0` and at most `n` characters `1`. Print the largest possible number of chosen strings.'],
    outputFormat: ['Print the largest number of strings.'],
    examples: [{ input: '5 5 3\n10\n0001\n111001\n1\n0\n', note: 'Take 10, 0001, 1 and 0: 5 zeros and 3 ones in total, 4 strings.' }, { input: '3 1 1\n10\n0\n1\n', note: 'Take 0 and 1 (one zero, one one): 2 strings.' }],
    hints: ['Each string has a number of zeros z and ones o and counts for 1 string.', 'Let best(i, j) be the largest number of strings that fit into i zeros and j ones.', 'Update best(i, j) = max(best(i, j), best(i - z, j - o) + 1) with i and j both going downwards.'],
    program: {
      io: ['k:int m:int n:int', 'strs:rows[k]'],
      fast: true,
      python: r`
        best = [[0] * (n + 1) for _ in range(m + 1)]
        for s in strs:
            z = s.count("0")
            o = len(s) - z
            for i in range(m, z - 1, -1):
                row = best[i]
                prev = best[i - z]
                for j in range(n, o - 1, -1):
                    if prev[j - o] + 1 > row[j]:
                        row[j] = prev[j - o] + 1
        print(best[m][n])`,
      cpp: r`
        vector<vector<int>> best(m + 1, vector<int>(n + 1, 0));
        for (const string& s : strs) {
            int z = (int)count(s.begin(), s.end(), '0');
            int o = (int)s.size() - z;
            for (int i = (int)m; i >= z; i--) {
                for (int j = (int)n; j >= o; j--) {
                    best[i][j] = max(best[i][j], best[i - z][j - o] + 1);
                }
            }
        }
        cout << best[m][n] << "\n";`,
      java: r`
        int zeros = (int) m, ones = (int) n;
        int[][] best = new int[zeros + 1][ones + 1];
        for (int t = 0; t < k; t++) {
            String s = strs[t];
            int z = 0;
            for (int p = 0; p < s.length(); p++) if (s.charAt(p) == '0') z++;
            int o = s.length() - z;
            for (int i = zeros; i >= z; i--) {
                for (int j = ones; j >= o; j--) {
                    best[i][j] = Math.max(best[i][j], best[i - z][j - o] + 1);
                }
            }
        }
        System.out.println(best[zeros][ones]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['A two-dimensional knapsack: best(i, j) is the largest number of strings that fit into i zeros and j ones; every string with z zeros and o ones updates the table with both indices going downwards, best(i, j) = max(best(i, j), best(i - z, j - o) + 1). The answer is best(m, n).'], complexity: 'Time O(k * m * n), space O(m * n).' },
    solve(input) {
      const rs = rows(input); const [k, m, n] = nums(rs[0]); const strs = rs.slice(1, 1 + k); // exhaustive memo over (string index, zeros left, ones left), implemented bottom-up over the strings
      let cur = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0)); for (const s of strs) { const z = [...s].filter((c) => c === '0').length; const o = s.length - z; const nxt = cur.map((row) => row.slice()); for (let i = z; i <= m; i++) for (let j = o; j <= n; j++) nxt[i][j] = Math.max(cur[i][j], cur[i - z][j - o] + 1); cur = nxt; } return String(cur[m][n]);
    },
    tests() {
      const g = rng(2035); const out = ['5 5 3\n10\n0001\n111001\n1\n0\n', '3 1 1\n10\n0\n1\n', '1 0 0\n0\n', '2 3 3\n1\n0\n'];
      const make = (k, m, n, maxLen, bias) => `${k} ${m} ${n}\n${many(k, () => many(randInt(g, 1, maxLen), () => (g() < bias ? '0' : '1')).join('')).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const [k, m, n] = nums(rs[0]); const strs = rs.slice(1, 1 + k); let best = 0; for (let mask = 0; mask < (1 << k); mask++) { let z = 0, o = 0, c = 0; for (let i = 0; i < k; i++) if (mask >> i & 1) { for (const ch of strs[i]) ch === '0' ? z++ : o++; c++; } if (z <= m && o <= n) best = Math.max(best, c); } return String(best); };
      crossCheck(() => make(randInt(g, 1, 9), randInt(g, 0, 8), randInt(g, 0, 8), 5, 0.5), (i) => this.solve(i), brute, 300);
      for (const [k, m, n, len, p] of [[10, 10, 10, 6, 0.5], [50, 30, 30, 10, 0.5], [100, 50, 50, 20, 0.5], [300, 80, 80, 4, 0.5], [300, 80, 80, 2, 0.5], [300, 80, 80, 8, 0.3], [300, 80, 80, 1, 0.5], [300, 0, 80, 3, 0.5], [300, 80, 0, 3, 0.5], [300, 80, 80, 100, 0.5], [300, 80, 79, 3, 0.7]]) out.push(make(k, m, n, len, p));
      out.push(`300 80 80\n${many(300, (i) => (i % 2 ? '0' : '1')).join('\n')}\n`, `300 80 80\n${many(300, () => '01').join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `cap`: the number of items and the capacity of the bag.', 'Each of the next `n` lines has two numbers: the weight and the value of one item.'],
    constraints: ['1 <= n <= 200', '1 <= cap <= 10000', '1 <= weight <= 1000', '1 <= value <= 1000000'],
    slug: 'zero-one-knapsack-value',
    title: 'Pack the Bag With the Most Valuable Items',
    tags: ['dp', 'knapsack', '0-1-knapsack'],
    concept: {
      title: 'The classic knapsack: for each item decide take or leave, with a table over the room left',
      body: [
        'A thief has a bag that carries a total weight of at most `cap`. There are `n` items, each with a weight and a value, and each item exists **once**. Which items should be taken to get the largest total value? With the items (weight, value) `(1, 15) (3, 20) (4, 30)` and the capacity `4` the best is the first and the second item: value 35, weight 4. (Taking the most valuable item first is not always right: the item `(4, 30)` alone gives only 30.)',
        'Let `best(c)` be the largest value that fits into the weight `c`, starting with `best(c) = 0` for all `c` (no items yet). Process the items one at a time. For an item with the weight `w` and the value `v`: for each capacity `c >= w` we may take the item (value `best(c - w) + v`, where `best(c - w)` describes the bag **without** this item) or leave it (value `best(c)`). So **`best(c) = max(best(c), best(c - w) + v)`**. The loop over `c` must go **downwards**, so that `best(c - w)` has not yet been changed by the same item.',
        { code: 'best = [0] * (cap + 1)\nfor w, v in items:\n    for c in range(cap, w - 1, -1):          # downwards: each item at most once\n        best[c] = max(best[c], best[c - w] + v)\nprint(best[cap])' },
        'This is the template of all "choose items under a limit" problems. The time is O(n * cap) = 2 million steps at most, the memory O(cap). (A greedy choice by value per weight is wrong for such items, because items cannot be split.) Because `best` is a maximum over "weight at most `c`", the answer is simply `best[cap]`.'
      ]
    },
    statement: ['There are `n` items; the item `i` has the weight `w[i]` and the value `v[i]`. A bag can carry a total weight of at most `cap`. Each item can be taken at most once. Print the largest total value of the items that fit in the bag.'],
    outputFormat: ['Print the largest total value.'],
    examples: [{ input: '3 4\n1 15\n3 20\n4 30\n', note: 'Take the first two items: weight 4, value 35.' }, { input: '2 5\n6 100\n5 7\n', note: 'Only the second item fits: 7.' }],
    hints: ['Let best(c) be the largest value that fits into the weight c, starting from all zeros.', 'For every item update best(c) = max(best(c), best(c - w) + v) for c from the capacity down to w.', 'Going downwards makes sure that each item is used only once.'],
    program: {
      io: ['n:int cap:int', 'item:int[n][2]'],
      fast: true,
      python: r`
        best = [0] * (cap + 1)
        for w, v in item:
            for c in range(cap, w - 1, -1):
                if best[c - w] + v > best[c]:
                    best[c] = best[c - w] + v
        print(best[cap])`,
      cpp: r`
        vector<long long> best(cap + 1, 0);
        for (const vector<long long>& it : item) {
            long long w = it[0], v = it[1];
            for (long long c = cap; c >= w; c--) {
                best[c] = max(best[c], best[c - w] + v);
            }
        }
        cout << best[cap] << "\n";`,
      java: r`
        int room = (int) cap;
        long[] best = new long[room + 1];
        for (int t = 0; t < n; t++) {
            int w = (int) item[t][0];
            long v = item[t][1];
            for (int c = room; c >= w; c--) {
                best[c] = Math.max(best[c], best[c - w] + v);
            }
        }
        System.out.println(best[room]);`
    },
    solution: { explanation: ['best(c) is the largest value that fits into the weight c; every item updates the table from the top downwards with best(c) = max(best(c), best(c - w) + v), so that each item is used at most once. The answer is best(cap).'], complexity: 'Time O(n * cap), space O(cap).' },
    solve(input) {
      const rs = rows(input); const [n, cap] = nums(rs[0]); const items = many(n, (i) => nums(rs[i + 1])); // a full table over (items used, capacity)
      let prev = new Array(cap + 1).fill(0); for (const [w, v] of items) { const cur = prev.slice(); for (let c = w; c <= cap; c++) cur[c] = Math.max(prev[c], prev[c - w] + v); prev = cur; } return String(prev[cap]);
    },
    tests() {
      const g = rng(2036); const out = ['3 4\n1 15\n3 20\n4 30\n', '2 5\n6 100\n5 7\n', '1 1\n1 1\n', '1 1\n2 5\n'];
      const make = (n, cap, wh, vh) => `${n} ${cap}\n${many(n, () => `${randInt(g, 1, wh)} ${randInt(g, 1, vh)}`).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, cap] = nums(rs[0]); const items = many(n, (i) => nums(rs[i + 1])); let best = 0; for (let mask = 0; mask < (1 << n); mask++) { let w = 0, v = 0; for (let i = 0; i < n; i++) if (mask >> i & 1) { w += items[i][0]; v += items[i][1]; } if (w <= cap) best = Math.max(best, v); } return String(best); };
      crossCheck(() => make(randInt(g, 1, 10), randInt(g, 1, 25), 10, 30), (i) => this.solve(i), brute, 400);
      for (const [n, cap, wh, vh] of [[10, 50, 20, 100], [50, 500, 100, 1000], [100, 3000, 300, 100000], [200, 10000, 1000, 1000000], [200, 10000, 1000, 1000000], [200, 10000, 100, 1000000], [200, 10000, 1000, 5], [200, 9999, 50, 1000000], [200, 1, 1000, 1000000], [200, 10000, 1, 1000000]]) out.push(make(n, cap, wh, vh));
      out.push(`200 10000\n${many(200, () => '1000 1000000').join('\n')}\n`, `200 10000\n${many(200, (i) => `${i + 1} ${(i + 1) * 3}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the length of the rod.', 'The second line has `n` numbers: `price[i]` is the price of a piece of length `i` (the lengths are 1 to `n`).'],
    constraints: ['1 <= n <= 2000', '1 <= each price <= 10^9'],
    slug: 'cut-the-rod-for-the-best-price',
    title: 'Cut the Rod for the Best Price',
    tags: ['dp', 'unbounded-knapsack', 'rod-cutting'],
    concept: {
      title: 'The first piece of the cut can have any length; the rest is a smaller rod',
      body: [
        'A rod has the length `n` (a whole number). A shop buys pieces of any whole length from 1 to `n`, paying a given price for each length, and the prices need not grow evenly. You may cut the rod into several pieces (or not cut at all) and sell all the pieces. What is the **largest total price**? With the prices `1 5 8 9 10 17 17 20` for the lengths 1 to 8, a rod of length 8 is best cut into 2 + 6 for 5 + 17 = 22.',
        'Let `best(L)` be the largest price for a rod of length `L`, with `best(0) = 0`. Look at the **first piece**: its length is some `c` from 1 to `L`, it brings `price(c)`, and what remains is a rod of the length `L - c`, which can be sold as well as possible: **`best(L) = max over c from 1 to L of price(c) + best(L - c)`**. The table is filled from short rods to long ones.',
        { code: 'best = [0] * (n + 1)\nfor length in range(1, n + 1):\n    top = 0\n    for cut in range(1, length + 1):\n        top = max(top, price[cut - 1] + best[length - cut])\n    best[length] = top\nprint(best[n])' },
        'This is the unbounded knapsack again: the "items" are the piece lengths, the "capacity" is the rod, and a length can be used many times. Here every cell tries all `L` first pieces, so the time is O(n^2) (4 million steps at the limit) and the memory O(n). Always check whether a recurrence over "the first/last choice" gives a new problem of the same kind but smaller.'
      ]
    },
    statement: ['A rod has the length `n`. For every whole length `i` from 1 to `n` a piece of that length can be sold for `price[i]`. The rod may be cut into any number of pieces of whole lengths (also not cut at all), and all the pieces are sold. Print the largest total price.'],
    outputFormat: ['Print the largest total price.'],
    examples: [{ input: '8\n1 5 8 9 10 17 17 20\n', note: 'Cut into 2 + 6: 5 + 17 = 22.' }, { input: '3\n3 2 1\n', note: 'Three pieces of length 1: 9.' }],
    hints: ['Let best(L) be the largest price for a rod of length L; best(0) = 0.', 'The first piece has some length c: best(L) = max(price(c) + best(L - c)).', 'Fill the table for L = 1, 2, ..., n.'],
    program: {
      io: ['n:int', 'price:int[n]'],
      fast: true,
      python: r`
        best = [0] * (n + 1)
        for length in range(1, n + 1):
            top = 0
            for cut in range(1, length + 1):
                v = price[cut - 1] + best[length - cut]
                if v > top:
                    top = v
            best[length] = top
        print(best[n])`,
      cpp: r`
        vector<long long> best(n + 1, 0);
        for (long long length = 1; length <= n; length++) {
            long long top = 0;
            for (long long cut = 1; cut <= length; cut++) {
                top = max(top, price[cut - 1] + best[length - cut]);
            }
            best[length] = top;
        }
        cout << best[n] << "\n";`,
      java: r`
        int len = (int) n;
        long[] best = new long[len + 1];
        for (int length = 1; length <= len; length++) {
            long top = 0;
            for (int cut = 1; cut <= length; cut++) {
                top = Math.max(top, price[cut - 1] + best[length - cut]);
            }
            best[length] = top;
        }
        System.out.println(best[len]);`
    },
    solution: { explanation: ['best(L) = the largest over the length c of the first piece of price(c) + best(L - c), with best(0) = 0, filled for increasing L; the answer is best(n).'], complexity: 'Time O(n^2), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const price = nums(rs[1]); const best = new Array(n + 1).fill(0); // forward: from every reachable length add one more piece
      for (let l = 0; l <= n; l++) for (let c = 1; l + c <= n; c++) best[l + c] = Math.max(best[l + c], best[l] + price[c - 1]); return String(best[n]);
    },
    tests() {
      const g = rng(2037); const out = ['8\n1 5 8 9 10 17 17 20\n', '3\n3 2 1\n', '1\n7\n', '4\n1 1 1 100\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const price = nums(rs[1]); const go = (l) => { if (l === 0) return 0; let best = 0; for (let c = 1; c <= l; c++) best = Math.max(best, price[c - 1] + go(l - c)); return best; }; return String(go(n)); };
      crossCheck(() => { const n = randInt(g, 1, 9); return `${n}\n${randArray(g, n, 1, 30).join(' ')}\n`; }, (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[10, 100], [100, 1000], [500, 1000000], [1000, 1000000000], [2000, 1000000000], [2000, 100], [2000, 2], [1999, 1000000]]) out.push(`${n}\n${randArray(g, n, 1, hi).join(' ')}\n`);
      out.push(`2000\n${many(2000, (i) => i + 1).join(' ')}\n`, `2000\n${many(2000, (i) => (i + 1) * (i + 1)).join(' ')}\n`, `2000\n${many(2000, () => 1000000000).join(' ')}\n`, `2000\n${many(2000, (i) => Math.floor(Math.sqrt(i + 1) * 1000)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of stones.', 'The second line has `n` numbers: the weights of the stones.'],
    constraints: ['1 <= n <= 200', '1 <= each weight <= 100'],
    slug: 'smallest-stone-difference',
    title: 'Two Piles of Stones With the Smallest Difference',
    tags: ['dp', 'subset-sum', 'partition', 'bitset'],
    concept: {
      title: 'The best split is the subset sum closest to half of the total',
      body: [
        'Stones with given weights must be divided into **two piles** (every stone goes to exactly one pile, a pile may be empty). The difference of the pile weights should be as **small** as possible. For `2 7 4 1 8 1` the total is 23, and piles of weights 11 and 12 give the difference 1.',
        'If one pile weighs `s`, the other weighs `total - s`, and the difference is `total - 2s` (when `s <= total / 2`). So we want the **largest `s` not above half of the total that can be made as the sum of some stones**. This is the subset-sum table again: `can(s)` is true if some of the stones weigh exactly `s`; process the stones one by one with the loop going downwards (each stone once). At the end look for the biggest `s <= total / 2` with `can(s)`.',
        { code: 'half = total // 2\ncan = [False] * (half + 1)\ncan[0] = True\nfor x in a:\n    for s in range(half, x - 1, -1):\n        if can[s - x]: can[s] = True\ns = half\nwhile not can[s]:\n    s -= 1\nprint(total - 2 * s)' },
        'The search for `s` terminates because `can[0]` is true. The table needs only sums up to half the total, which halves the work: O(n * total / 2) time and O(total) memory. Problems about "split into two groups with the smallest difference" are always subset-sum problems in disguise.'
      ]
    },
    statement: ['`n` stones with the given weights are divided into two piles (each stone in exactly one pile; a pile may be empty). Print the smallest possible difference between the weights of the two piles.'],
    outputFormat: ['Print the smallest difference.'],
    examples: [{ input: '6\n2 7 4 1 8 1\n', note: 'The piles 2 + 7 + 1 + 1 = 11 and 4 + 8 = 12 differ by 1.' }, { input: '1\n5\n', note: 'One stone: the piles weigh 5 and 0.' }],
    hints: ['If one pile weighs s, the difference is total - 2s.', 'Find the largest s not above total / 2 that is a sum of some of the stones.', 'Use the subset-sum table with the loop going downwards.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        total = sum(a)
        half = total // 2
        bits = 1
        for x in a:
            bits |= bits << x
        s = half
        while not (bits >> s) & 1:
            s -= 1
        print(total - 2 * s)`,
      cpp: r`
        long long total = 0;
        for (long long x : a) total += x;
        int half = (int)(total / 2);
        vector<char> can(half + 1, 0);
        can[0] = 1;
        for (long long x : a) {
            for (int s = half; s >= x; s--) {
                if (can[s - x]) can[s] = 1;
            }
        }
        int s = half;
        while (!can[s]) s--;
        cout << total - 2 * s << "\n";`,
      java: r`
        long total = 0;
        for (long x : a) total += x;
        int half = (int) (total / 2);
        boolean[] can = new boolean[half + 1];
        can[0] = true;
        for (int k = 0; k < n; k++) {
            int x = (int) a[k];
            for (int s = half; s >= x; s--) {
                if (can[s - x]) can[s] = true;
            }
        }
        int s = half;
        while (!can[s]) s--;
        System.out.println(total - 2 * s);`
    },
    solution: { explanation: ['A subset-sum table up to half of the total tells which pile weights are possible; the best split uses the largest possible weight s not above half of the total, and the difference is total - 2s.'], complexity: 'Time O(n * total), space O(total).' },
    solve(input) {
      const a = nums(rows(input)[1]); const total = a.reduce((x, y) => x + y, 0); let sums = new Set([0]); for (const x of a) { const nxt = new Set(sums); for (const s of sums) nxt.add(s + x); sums = nxt; } let best = Infinity; for (const s of sums) best = Math.min(best, Math.abs(total - 2 * s)); return String(best);
    },
    tests() {
      const g = rng(2038); const out = ['6\n2 7 4 1 8 1\n', '1\n5\n', '2\n3 3\n', '3\n1 1 100\n'];
      const brute = (input) => { const a = nums(rows(input)[1]); const total = a.reduce((x, y) => x + y, 0); let best = Infinity; for (let mask = 0; mask < (1 << a.length); mask++) { let s = 0; for (let i = 0; i < a.length; i++) if (mask >> i & 1) s += a[i]; best = Math.min(best, Math.abs(total - 2 * s)); } return String(best); };
      const list = (n, lo, hi) => `${n}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      crossCheck(() => list(randInt(g, 1, 12), 1, 20), (i) => this.solve(i), brute, 300);
      for (const [n, lo, hi] of [[10, 1, 10], [30, 1, 50], [100, 1, 100], [200, 1, 100], [200, 50, 100], [200, 99, 100], [200, 1, 3], [199, 1, 100], [200, 100, 100]]) out.push(list(n, lo, hi));
      out.push(`200\n${many(200, (i) => (i === 0 ? 100 : 1)).join(' ')}\n`, `200\n${many(200, () => 97).join(' ')}\n`, `200\n${many(200, (i) => (i % 2 ? 100 : 99)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with three numbers `n`, `f` and `s`: the number of dice, the number of faces of each die and the wanted sum.'],
    constraints: ['1 <= n <= 30', '1 <= f <= 30', '1 <= s <= 900'],
    slug: 'dice-sum-ways',
    title: 'In How Many Ways Can the Dice Show the Sum s?',
    tags: ['dp', 'counting', 'dice'],
    concept: {
      title: 'Add one die at a time: the sum after i dice comes from the sums after i - 1 dice',
      body: [
        'You roll `n` dice, and every die has the faces `1, 2, ..., f`. In how many of the `f^n` equally likely outcomes (the dice are distinguishable: `1 + 2` and `2 + 1` are different) is the sum of the faces exactly `s`? With 2 dice with 6 faces and `s = 7` there are 6 ways: 1+6, 2+5, 3+4, 4+3, 5+2, 6+1. Print the count modulo 1 000 000 007.',
        'Let `ways(i, t)` be the number of ways for `i` dice to give the sum `t`. For no dice only the sum 0 is possible: `ways(0, 0) = 1`. The last die shows a face `k` from 1 to `f`, and the first `i - 1` dice give the rest: **`ways(i, t) = sum over k from 1 to f of ways(i - 1, t - k)`**. We never need more than the previous round, so two arrays are enough.',
        { code: 'ways = [1] + [0] * s                         # zero dice\nfor _ in range(n):\n    new = [0] * (s + 1)\n    for t in range(s + 1):\n        if ways[t]:\n            for face in range(1, f + 1):\n                if t + face > s: break\n                new[t + face] = (new[t + face] + ways[t]) % MOD\n    ways = new\nprint(ways[s])' },
        'The state is (number of dice used, sum so far) and each state has `f` transitions: O(n * s * f) steps in total, at most 810 000 here. (For many more faces one would add the `f` neighbouring values with a running sum, which makes each round O(s).) The same table gives the probability of a sum after dividing by `f^n`.'
      ]
    },
    statement: ['`n` dice are rolled; each die has the faces 1 to `f`. The dice are distinguishable. Print the number of outcomes in which the sum of the faces is exactly `s`, modulo 1000000007.'],
    outputFormat: ['Print the number of outcomes modulo 1000000007.'],
    examples: [{ input: '2 6 7\n', note: 'Six outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1).' }, { input: '1 2 3\n', note: 'One die with faces 1 and 2 cannot show 3: 0.' }],
    hints: ['Let ways(i, t) be the number of outcomes of i dice with the sum t.', 'The last die shows a face k from 1 to f: ways(i, t) = the sum of ways(i - 1, t - k).', 'Two arrays (the previous round and the new one) are enough.'],
    program: {
      io: ['n:int f:int s:int'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        ways = [1] + [0] * s
        for _ in range(n):
            new = [0] * (s + 1)
            for t in range(s + 1):
                if ways[t]:
                    for face in range(1, f + 1):
                        if t + face > s:
                            break
                        new[t + face] = (new[t + face] + ways[t]) % MOD
            ways = new
        print(ways[s])`,
      cpp: r`
        const long long MOD = 1000000007;
        vector<long long> ways(s + 1, 0);
        ways[0] = 1;
        for (long long i = 0; i < n; i++) {
            vector<long long> next(s + 1, 0);
            for (long long t = 0; t <= s; t++) {
                if (ways[t] == 0) continue;
                for (long long face = 1; face <= f && t + face <= s; face++) {
                    next[t + face] = (next[t + face] + ways[t]) % MOD;
                }
            }
            ways = next;
        }
        cout << ways[s] << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int target = (int) s;
        long[] ways = new long[target + 1];
        long[] next = new long[target + 1];
        ways[0] = 1;
        for (int i = 0; i < n; i++) {
            Arrays.fill(next, 0);
            for (int t = 0; t <= target; t++) {
                if (ways[t] == 0) continue;
                for (int face = 1; face <= f && t + face <= target; face++) {
                    next[t + face] = (next[t + face] + ways[t]) % MOD;
                }
            }
            long[] swap = ways;
            ways = next;
            next = swap;
        }
        System.out.println(ways[target]);`
    },
    solution: { explanation: ['ways(i, t), the number of outcomes of i dice with the sum t, is the sum of ways(i - 1, t - k) over the face k of the last die; two arrays hold the previous and the new round, and the answer is ways(n, s).'], complexity: 'Time O(n * s * f), space O(s).' },
    solve(input) {
      const [n, f, s] = nums(input); // exact counts with big integers by repeated polynomial multiplication (the generating function of one die is x + x^2 + ... + x^f)
      let poly = [1n]; for (let i = 0; i < n; i++) { const nxt = new Array(Math.min(poly.length + f, s + 1)).fill(0n); for (let t = 0; t < poly.length; t++) for (let k = 1; k <= f && t + k <= s; k++) nxt[t + k] += poly[t]; poly = nxt; } return String((poly[s] || 0n) % BigInt(MOD));
    },
    tests() {
      const g = rng(2039); const out = ['2 6 7\n', '1 2 3\n', '1 1 1\n', '3 6 10\n'];
      const brute = (input) => { const [n, f, s] = nums(input); let count = 0; const go = (i, sum) => { if (sum > s) return; if (i === n) { if (sum === s) count++; return; } for (let k = 1; k <= f; k++) go(i + 1, sum + k); }; go(0, 0); return String(count % MOD); };
      crossCheck(() => `${randInt(g, 1, 6)} ${randInt(g, 1, 6)} ${randInt(g, 1, 36)}\n`, (i) => this.solve(i), brute, 300);
      for (const [n, f, s] of [[10, 6, 35], [30, 30, 900], [30, 30, 465], [30, 30, 31], [30, 30, 30], [30, 30, 29], [30, 1, 30], [30, 1, 29], [20, 20, 210], [30, 2, 45], [25, 29, 500], [30, 30, 899]]) out.push(`${n} ${f} ${s}\n`);
      return out;
    }
  }
];
