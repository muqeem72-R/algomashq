import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const NEG = -1e18;
const list = (n, a) => `${n}\n${a.join(' ')}\n`;
const head2 = (a, b, arr) => `${a} ${b}\n${arr.join(' ')}\n`;
const parse2 = (input) => { const rs = rows(input); const [a, b] = nums(rs[0]); return { a, b, arr: nums(rs[1]) }; };
const prices = (g, n, hi, mode) => { if (mode === 'walk') { const p = [randInt(g, 0, hi)]; for (let i = 1; i < n; i++) p.push(Math.max(0, Math.min(hi, p[i - 1] + randInt(g, -Math.max(1, Math.floor(hi / 50)), Math.max(1, Math.floor(hi / 50)))))); return p; } return randArray(g, n, 0, hi); };

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of days.', 'The second line has `n` numbers: the price of a share on each day.'],
    constraints: ['1 <= n <= 100000', '0 <= price <= 100000'],
    slug: 'trade-with-cooldown',
    title: 'Trade Shares With a Rest Day After Every Sale',
    tags: ['dp', 'state-machine', 'stock'],
    concept: {
      title: 'A small state machine: every day you are holding a share, just sold, or free to buy',
      body: [
        'You know the price of a share for `n` days and may trade as often as you like, but you can hold **at most one share** at a time, and after you **sell** you must wait one full day before you can buy again (a cooldown). What is the largest profit? For the prices `1 2 3 0 2` the best plan is buy at 1, sell at 2, rest, buy at 0, sell at 2: profit 3.',
        'Describe your situation at the end of each day by one of three states, and keep for each state the **best profit so far**: `hold` (you own a share), `sold` (you sold today, so tomorrow is the cooldown) and `rest` (you own nothing and may buy tomorrow). With the price `p` of today the new values are: **`hold = max(hold, rest - p)`** (keep it, or buy today from the free state), **`sold = hold + p`** (sell the share you held), **`rest = max(rest, sold)`** (stay free, or come out of yesterday\'s cooldown). Update the three values together from the old values.',
        { code: 'hold, sold, rest = -prices[0], 0, 0\nfor p in prices[1:]:\n    hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)\nprint(max(sold, rest))' },
        'The answer is the better of `sold` and `rest` on the last day (a share still held is worth nothing). Drawing the states and the allowed moves between them as a small *state machine* is the way to solve every "trading with rules" problem: each rule becomes an arrow, and the table keeps one number per state. The time is O(n) and the memory O(1).'
      ]
    },
    statement: ['The prices of a share on `n` days are given. You may buy and sell as many times as you like, but you can hold at most one share, and you cannot buy on the day after you sold. Print the largest possible profit.'],
    outputFormat: ['Print the largest profit.'],
    examples: [{ input: '5\n1 2 3 0 2\n', note: 'Buy at 1, sell at 2, rest, buy at 0, sell at 2: 1 + 2 = 3.' }, { input: '1\n5\n', note: 'One day: no trade is possible, 0.' }],
    hints: ['Use three states: holding a share, sold today, and free to buy.', 'hold = max(hold, rest - p); sold = hold + p; rest = max(rest, sold), all computed from the old values.', 'The answer is max(sold, rest) after the last day.'],
    program: {
      io: ['n:int', 'prices:int[n]'],
      fast: true,
      python: r`
        hold, sold, rest = -prices[0], 0, 0
        for i in range(1, n):
            p = prices[i]
            hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
        print(max(sold, rest))`,
      cpp: r`
        long long hold = -prices[0], sold = 0, rest = 0;
        for (long long i = 1; i < n; i++) {
            long long p = prices[i];
            long long newHold = max(hold, rest - p);
            long long newSold = hold + p;
            long long newRest = max(rest, sold);
            hold = newHold;
            sold = newSold;
            rest = newRest;
        }
        cout << max(sold, rest) << "\n";`,
      java: r`
        long hold = -prices[0], sold = 0, rest = 0;
        for (int i = 1; i < n; i++) {
            long p = prices[i];
            long newHold = Math.max(hold, rest - p);
            long newSold = hold + p;
            long newRest = Math.max(rest, sold);
            hold = newHold;
            sold = newSold;
            rest = newRest;
        }
        System.out.println(Math.max(sold, rest));`
    },
    solution: { explanation: ['Three best profits are kept: while holding a share, on the day of a sale, and while free to buy. A day updates them as hold = max(hold, rest - p), sold = hold + p, rest = max(rest, sold) from the old values; the answer is the larger of sold and rest at the end.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const p = nums(rows(input)[1]); const n = p.length; // best profit within the days so far, buying only after a day of rest following the last sale
      const best = new Array(n + 2).fill(0); // best[i + 2] = the best profit using the days 0..i
      let maxBuy = -Infinity; for (let i = 0; i < n; i++) { maxBuy = Math.max(maxBuy, best[i] - p[i]); best[i + 2] = Math.max(best[i + 1], maxBuy + p[i]); }
      return String(best[n + 1]);
    },
    tests() {
      const g = rng(2071); const out = ['5\n1 2 3 0 2\n', '1\n5\n', '2\n1 2\n', '2\n2 1\n', '4\n1 4 2 7\n'];
      const brute = (input) => { const p = nums(rows(input)[1]); const n = p.length; const go = (i, holding, cool) => { if (i >= n) return 0; let best = go(i + 1, holding, false); if (holding) best = Math.max(best, p[i] + go(i + 1, false, true)); else if (!cool) best = Math.max(best, -p[i] + go(i + 1, true, false)); return best; }; return String(go(0, false, false)); };
      crossCheck(() => { const n = randInt(g, 1, 12); return list(n, randArray(g, n, 0, 9)); }, (i) => this.solve(i), brute, 500);
      for (const [n, hi, mode] of [[10, 20, 'r'], [100, 100, 'walk'], [1000, 10000, 'walk'], [20000, 100000, 'r'], [50000, 100000, 'walk'], [100000, 100000, 'r'], [100000, 100000, 'walk'], [100000, 3, 'r'], [99999, 100000, 'walk']]) out.push(list(n, prices(g, n, hi, mode)));
      out.push(list(50000, many(50000, (i) => i)), list(50000, many(50000, (i) => 50000 - i)), list(50000, many(50000, (i) => (i % 2 ? 50000 : 0))), list(50000, new Array(50000).fill(7)), list(50000, many(50000, (i) => (i % 3 === 0 ? 0 : 50000))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `fee`: the number of days and the fee for every sale.', 'The second line has `n` numbers: the price of a share on each day.'],
    constraints: ['1 <= n <= 100000', '0 <= price <= 100000', '0 <= fee <= 100000'],
    slug: 'trade-with-fee',
    title: 'Trade Shares When Every Sale Costs a Fee',
    tags: ['dp', 'state-machine', 'stock'],
    concept: {
      title: 'Two states are enough: with a share in hand, or with cash',
      body: [
        'You may trade as many times as you like (holding at most one share), but **every sale costs a fee**. What is the largest total profit? For the prices `1 3 2 8 4 9` and the fee 2 the best plan is to buy at 1, sell at 8 (profit 7 - 2 = 5), buy at 4, sell at 9 (profit 5 - 2 = 3): total 8. Selling at 3 and again later would pay the fee twice and lose.',
        'Keep two numbers: `cash`, the best profit when you hold **no share**, and `hold`, the best profit when you **hold a share** (the price you paid is already subtracted). On a day with the price `p`: you can sell (paying the fee) and move to cash, **`cash = max(cash, hold + p - fee)`**, or you can buy from cash, **`hold = max(hold, cash - p)`**. Starting values: `cash = 0`, `hold = -prices[0]`. The answer is `cash` on the last day.',
        { code: 'cash, hold = 0, -prices[0]\nfor p in prices[1:]:\n    cash = max(cash, hold + p - fee)\n    hold = max(hold, cash - p)\nprint(cash)' },
        'Because the fee is paid once per trade (on the sale), the DP automatically decides when a trade is worth it: a small price rise does not repay the fee, so the best `hold` simply stays. Compare with the cooldown problem: a different rule changes the states and the arrows, but the method is the same. Time O(n), memory O(1).'
      ]
    },
    statement: ['The prices of a share on `n` days are given, and every sale costs `fee`. You may trade as many times as you like but can hold at most one share. Print the largest possible profit (the sum over the trades of sale price - purchase price - fee).'],
    outputFormat: ['Print the largest profit.'],
    examples: [{ input: '6 2\n1 3 2 8 4 9\n', note: 'Buy at 1, sell at 8 (5 after the fee), buy at 4, sell at 9 (3 after the fee): 8.' }, { input: '3 3\n1 3 7\n', note: 'Buy at 1, sell at 7: 7 - 1 - 3 = 3.' }],
    hints: ['Keep the best profit when holding no share (cash) and when holding one (hold).', 'Selling: cash = max(cash, hold + p - fee). Buying: hold = max(hold, cash - p).', 'Print cash after the last day.'],
    program: {
      io: ['n:int fee:int', 'prices:int[n]'],
      fast: true,
      python: r`
        cash, hold = 0, -prices[0]
        for i in range(1, n):
            p = prices[i]
            cash = max(cash, hold + p - fee)
            hold = max(hold, cash - p)
        print(cash)`,
      cpp: r`
        long long cash = 0, hold = -prices[0];
        for (long long i = 1; i < n; i++) {
            long long p = prices[i];
            cash = max(cash, hold + p - fee);
            hold = max(hold, cash - p);
        }
        cout << cash << "\n";`,
      java: r`
        long cash = 0, hold = -prices[0];
        for (int i = 1; i < n; i++) {
            long p = prices[i];
            cash = Math.max(cash, hold + p - fee);
            hold = Math.max(hold, cash - p);
        }
        System.out.println(cash);`
    },
    solution: { explanation: ['Two best profits are kept: cash (no share held) and hold (a share held, purchase price subtracted). Every day cash = max(cash, hold + p - fee) and hold = max(hold, cash - p); the answer is cash after the last day.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const { a: n, b: fee, arr: p } = parse2(input); // O(n^2) over the last sale day for small inputs, and the two-state table (written with arrays) for large ones
      if (n <= 2000) { const best = new Array(n + 1).fill(0); for (let i = 1; i <= n; i++) { best[i] = best[i - 1]; for (let j = 0; j < i - 1; j++) best[i] = Math.max(best[i], best[j] + p[i - 1] - p[j] - fee); } return String(best[n]); }
      const cash = new Array(n).fill(0), hold = new Array(n).fill(0); hold[0] = -p[0]; for (let i = 1; i < n; i++) { cash[i] = Math.max(cash[i - 1], hold[i - 1] + p[i] - fee); hold[i] = Math.max(hold[i - 1], cash[i - 1] - p[i]); } return String(cash[n - 1]);
    },
    tests() {
      const g = rng(2072); const out = ['6 2\n1 3 2 8 4 9\n', '3 3\n1 3 7\n', '1 0\n5\n', '2 0\n1 2\n', '2 5\n1 2\n'];
      const brute = (input) => { const { a: n, b: fee, arr: p } = parse2(input); const go = (i, holding) => { if (i >= n) return 0; let best = go(i + 1, holding); if (holding) best = Math.max(best, p[i] - fee + go(i + 1, false)); else best = Math.max(best, -p[i] + go(i + 1, true)); return best; }; return String(go(0, false)); };
      crossCheck(() => { const n = randInt(g, 1, 12); return head2(n, randInt(g, 0, 6), randArray(g, n, 0, 12)); }, (i) => this.solve(i), brute, 500);
      for (const [n, hi, fee, mode] of [[10, 20, 3, 'r'], [100, 100, 5, 'walk'], [1000, 10000, 100, 'walk'], [20000, 100000, 500, 'r'], [100000, 100000, 1000, 'walk'], [100000, 100000, 0, 'r'], [100000, 100000, 100000, 'r'], [100000, 3, 1, 'r'], [99999, 100000, 50, 'walk']]) out.push(head2(n, fee, prices(g, n, hi, mode)));
      out.push(head2(50000, 5, many(50000, (i) => i)), head2(50000, 5, many(50000, (i) => 50000 - i)), head2(50000, 10, many(50000, (i) => (i % 2 ? 50000 : 0))), head2(50000, 7, new Array(50000).fill(7)));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of days.', 'The second line has `n` numbers: the price of a share on each day.'],
    constraints: ['1 <= n <= 100000', '0 <= price <= 100000'],
    slug: 'two-trades-at-most',
    title: 'The Best Profit From at Most Two Trades',
    tags: ['dp', 'state-machine', 'stock'],
    concept: {
      title: 'Four states: first purchase, first sale, second purchase, second sale',
      body: [
        'You may buy and sell a share **at most twice**: the second purchase must come after the first sale (you hold at most one share). What is the largest profit? For the prices `3 3 5 0 0 3 1 4` it is 6: buy at 0, sell at 3 (profit 3), buy at 1, sell at 4 (profit 3). For `1 2 3 4 5` one trade is best: 4.',
        'A trade has two events, and there are two trades, so keep **four numbers**, the best profit after each event so far: `b1` after the first purchase (a negative number: the money spent), `s1` after the first sale, `b2` after the second purchase, `s2` after the second sale. Each day, with the price `p`, every state can either keep its value or take the step from the previous state: **`b1 = max(b1, -p)`**, **`s1 = max(s1, b1 + p)`**, **`b2 = max(b2, s1 - p)`**, **`s2 = max(s2, b2 + p)`**. They are updated in this order: the order lets a sale and a purchase on the same day happen (which does no harm: it has the profit 0).',
        { code: 'b1 = b2 = -10 ** 18\ns1 = s2 = 0\nfor p in prices:\n    b1 = max(b1, -p)\n    s1 = max(s1, b1 + p)\n    b2 = max(b2, s1 - p)\n    s2 = max(s2, b2 + p)\nprint(s2)' },
        'The answer is `s2`: it also covers the cases of one trade or no trade, because a "second trade" can have the profit 0. This is the stock problem with a limited number of trades; the next problem generalises it to `k` trades with the same four-step idea written as a loop. Time O(n), memory O(1).'
      ]
    },
    statement: ['The prices of a share on `n` days are given. You may complete at most two trades (a trade is a purchase followed by a sale), and you must sell before you buy again. Print the largest possible profit.'],
    outputFormat: ['Print the largest profit.'],
    examples: [{ input: '8\n3 3 5 0 0 3 1 4\n', note: 'Buy at 0, sell at 3; buy at 1, sell at 4: 3 + 3 = 6.' }, { input: '5\n7 6 4 3 1\n', note: 'The prices only fall: 0.' }],
    hints: ['Keep four numbers: the best profit after the first buy, the first sale, the second buy and the second sale.', 'Each state is max(keep, the previous state combined with today\'s price).', 'Print the value after the second sale.'],
    program: {
      io: ['n:int', 'prices:int[n]'],
      fast: true,
      python: r`
        b1 = b2 = -10 ** 18
        s1 = s2 = 0
        for p in prices:
            b1 = max(b1, -p)
            s1 = max(s1, b1 + p)
            b2 = max(b2, s1 - p)
            s2 = max(s2, b2 + p)
        print(s2)`,
      cpp: r`
        long long b1 = -1000000000000000000LL, b2 = -1000000000000000000LL, s1 = 0, s2 = 0;
        for (long long p : prices) {
            b1 = max(b1, -p);
            s1 = max(s1, b1 + p);
            b2 = max(b2, s1 - p);
            s2 = max(s2, b2 + p);
        }
        cout << s2 << "\n";`,
      java: r`
        long b1 = -1000000000000000000L, b2 = -1000000000000000000L, s1 = 0, s2 = 0;
        for (int i = 0; i < n; i++) {
            long p = prices[i];
            b1 = Math.max(b1, -p);
            s1 = Math.max(s1, b1 + p);
            b2 = Math.max(b2, s1 - p);
            s2 = Math.max(s2, b2 + p);
        }
        System.out.println(s2);`
    },
    solution: { explanation: ['Four best profits are kept: after the first purchase, the first sale, the second purchase and the second sale; every day each of them is the better of its old value and the step from the previous state with the day\'s price. The answer is the profit after the second sale.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const p = nums(rows(input)[1]); const n = p.length; // the best single trade in the prefix and in the suffix around every split point
      const left = new Array(n + 1).fill(0), right = new Array(n + 2).fill(0); let low = Infinity; for (let i = 0; i < n; i++) { low = Math.min(low, p[i]); left[i + 1] = Math.max(left[i], p[i] - low); } let high = -Infinity; for (let i = n - 1; i >= 0; i--) { high = Math.max(high, p[i]); right[i] = Math.max(right[i + 1], high - p[i]); } let best = 0; for (let i = 0; i <= n; i++) best = Math.max(best, left[i] + right[i]); return String(best);
    },
    tests() {
      const g = rng(2073); const out = ['8\n3 3 5 0 0 3 1 4\n', '5\n7 6 4 3 1\n', '5\n1 2 3 4 5\n', '1\n4\n', '3\n1 4 2\n'];
      const brute = (input) => { const p = nums(rows(input)[1]); const n = p.length; let best = 0; for (let a = 0; a < n; a++) for (let b = a; b < n; b++) for (let c = b; c < n; c++) for (let d = c; d < n; d++) best = Math.max(best, p[b] - p[a] + p[d] - p[c]); return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 11); return list(n, randArray(g, n, 0, 9)); }, (i) => this.solve(i), brute, 500);
      for (const [n, hi, mode] of [[10, 20, 'r'], [100, 100, 'walk'], [1000, 10000, 'walk'], [20000, 100000, 'r'], [100000, 100000, 'r'], [100000, 100000, 'walk'], [100000, 3, 'r'], [99999, 100000, 'walk']]) out.push(list(n, prices(g, n, hi, mode)));
      out.push(list(50000, many(50000, (i) => i)), list(50000, many(50000, (i) => 50000 - i)), list(50000, many(50000, (i) => Math.abs(50000 - i))), list(50000, many(50000, (i) => 50000 - Math.abs(50000 - i))), list(50000, new Array(50000).fill(7)));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `k` and `n`: the largest number of trades and the number of days.', 'The second line has `n` numbers: the price of a share on each day.'],
    constraints: ['1 <= k <= 100', '1 <= n <= 20000', '0 <= price <= 100000'],
    slug: 'k-trades-at-most',
    title: 'The Best Profit From at Most k Trades',
    tags: ['dp', 'state-machine', 'stock', 'k-transactions'],
    concept: {
      title: 'The same two states for every trade number, and a shortcut when k is large',
      body: [
        'The two-trade problem again, but now you may complete **at most `k` trades**. What is the largest profit? For `k = 2` and the prices `3 2 6 5 0 3` the answer is 7: buy at 2, sell at 6 (4); buy at 0, sell at 3 (3).',
        'Keep, for every trade number `j` from 1 to `k`, two values: `buy[j]` is the best profit while the **j-th trade is open** (you hold the share bought for this trade), and `sell[j]` the best profit after the **j-th trade is completed**. Each day, for `j = 1 .. k`: **`buy[j] = max(buy[j], sell[j - 1] - p)`** (start the j-th trade after the previous one is finished; `sell[0] = 0`) and **`sell[j] = max(sell[j], buy[j] + p)`**. The answer is `sell[k]`.',
        { code: 'if k >= n // 2:                                  # enough trades to take every rise\n    print(sum(max(0, prices[i] - prices[i - 1]) for i in range(1, n)))\nelse:\n    buy = [-10 ** 18] * (k + 1)\n    sell = [0] * (k + 1)\n    for p in prices:\n        for j in range(1, k + 1):\n            buy[j] = max(buy[j], sell[j - 1] - p)\n            sell[j] = max(sell[j], buy[j] + p)\n    print(sell[k])' },
        'A trade needs at least two days, so with `k >= n / 2` the limit does not matter: every rise between neighbouring days can be taken, and the answer is the sum of all rises. This shortcut also keeps the table small. Otherwise the table costs O(n * k) steps (at most one million) and O(k) memory.'
      ]
    },
    statement: ['The prices of a share on `n` days are given. You may complete at most `k` trades (a trade is a purchase followed by a sale) and must sell before buying again. Print the largest possible profit.'],
    outputFormat: ['Print the largest profit.'],
    examples: [{ input: '2 6\n3 2 6 5 0 3\n', note: 'Buy at 2, sell at 6; buy at 0, sell at 3: 4 + 3 = 7.' }, { input: '2 3\n3 2 1\n', note: 'The prices only fall: 0.' }],
    hints: ['For each trade number j keep buy[j] (while the j-th trade is open) and sell[j] (after it is finished).', 'buy[j] = max(buy[j], sell[j - 1] - p); sell[j] = max(sell[j], buy[j] + p).', 'If k >= n / 2, add up all the rises between neighbouring days.'],
    program: {
      io: ['k:int n:int', 'prices:int[n]'],
      fast: true,
      python: r`
        if k >= n // 2:
            total = 0
            for i in range(1, n):
                if prices[i] > prices[i - 1]:
                    total += prices[i] - prices[i - 1]
            print(total)
        else:
            buy = [-10 ** 18] * (k + 1)
            sell = [0] * (k + 1)
            for p in prices:
                for j in range(1, k + 1):
                    if sell[j - 1] - p > buy[j]:
                        buy[j] = sell[j - 1] - p
                    if buy[j] + p > sell[j]:
                        sell[j] = buy[j] + p
            print(sell[k])`,
      cpp: r`
        if (k >= n / 2) {
            long long total = 0;
            for (long long i = 1; i < n; i++) if (prices[i] > prices[i - 1]) total += prices[i] - prices[i - 1];
            cout << total << "\n";
        } else {
            vector<long long> buy(k + 1, -1000000000000000000LL), sell(k + 1, 0);
            for (long long p : prices) {
                for (long long j = 1; j <= k; j++) {
                    buy[j] = max(buy[j], sell[j - 1] - p);
                    sell[j] = max(sell[j], buy[j] + p);
                }
            }
            cout << sell[k] << "\n";
        }`,
      java: r`
        if (k >= n / 2) {
            long total = 0;
            for (int i = 1; i < n; i++) if (prices[i] > prices[i - 1]) total += prices[i] - prices[i - 1];
            System.out.println(total);
        } else {
            int trades = (int) k;
            long[] buy = new long[trades + 1];
            long[] sell = new long[trades + 1];
            Arrays.fill(buy, -1000000000000000000L);
            for (int i = 0; i < n; i++) {
                long p = prices[i];
                for (int j = 1; j <= trades; j++) {
                    buy[j] = Math.max(buy[j], sell[j - 1] - p);
                    sell[j] = Math.max(sell[j], buy[j] + p);
                }
            }
            System.out.println(sell[trades]);
        }`
    },
    solution: { explanation: ['For each trade number j the best profit while the j-th trade is open (buy[j]) and after it is finished (sell[j]) are kept; each day buy[j] = max(buy[j], sell[j - 1] - p) and sell[j] = max(sell[j], buy[j] + p). When k >= n / 2 the limit is irrelevant and the answer is the sum of all rises. The answer is sell[k].'], complexity: 'Time O(n * k), space O(k).' },
    solve(input) {
      const { a: k, b: n, arr: p } = parse2(input); const kk = Math.min(k, Math.floor(n / 2)); // dp[j][i]: the best profit with at most j trades in the first i days, with a running maximum
      let prev = new Array(n).fill(0); for (let j = 1; j <= kk; j++) { const cur = new Array(n).fill(0); let bestBuy = -p[0]; for (let i = 1; i < n; i++) { cur[i] = Math.max(cur[i - 1], p[i] + bestBuy); bestBuy = Math.max(bestBuy, prev[i] - p[i]); } prev = cur; } return String(prev[n - 1]);
    },
    tests() {
      const g = rng(2074); const out = ['2 6\n3 2 6 5 0 3\n', '2 3\n3 2 1\n', '1 1\n5\n', '100 8\n1 5 2 8 3 9 1 4\n', '1 5\n1 2 3 4 5\n'];
      const brute = (input) => { const { a: k, b: n, arr: p } = parse2(input); const go = (i, trades, holding, cost) => { if (i === n) return 0; let best = go(i + 1, trades, holding, cost); if (holding) best = Math.max(best, p[i] - cost + go(i + 1, trades, false, 0)); else if (trades < k) best = Math.max(best, go(i + 1, trades + 1, true, p[i])); return best; }; return String(go(0, 0, false, 0)); };
      crossCheck(() => { const n = randInt(g, 1, 11); return head2(randInt(g, 1, 4), n, randArray(g, n, 0, 9)); }, (i) => this.solve(i), brute, 500);
      for (const [k, n, hi, mode] of [[3, 20, 20, 'r'], [5, 100, 100, 'walk'], [10, 1000, 10000, 'walk'], [50, 20000, 100000, 'r'], [100, 20000, 100000, 'walk'], [100, 20000, 100000, 'r'], [1, 20000, 100000, 'walk'], [99, 19999, 3, 'r'], [100, 150, 100, 'r'], [7, 20000, 100000, 'walk']]) out.push(head2(k, n, prices(g, n, hi, mode)));
      out.push(head2(100, 20000, many(20000, (i) => i)), head2(100, 20000, many(20000, (i) => 20000 - i)), head2(50, 20000, many(20000, (i) => (i % 2 ? 100000 : 0))), head2(100, 20000, many(20000, (i) => (i % 400 < 200 ? (i % 400) * 100 : (400 - (i % 400)) * 100))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of days you travel.', 'The second line has `n` increasing day numbers (the days of the year on which you travel).', 'The third line has three numbers: the price of a 1-day pass, of a 7-day pass and of a 30-day pass.'],
    constraints: ['1 <= n <= 20000', '1 <= each day <= 100000, in strictly increasing order', '1 <= each price <= 1000'],
    slug: 'cheapest-travel-passes',
    title: 'The Cheapest Combination of Travel Passes',
    tags: ['dp', 'timeline', 'min-cost'],
    concept: {
      title: 'Go through the days in order: on a travel day, pay for the last pass that ends here',
      body: [
        'You will travel on certain days. A pass for **1, 7 or 30 consecutive days** can be bought on any day for a given price, and with a pass you travel free on every day it covers. What is the smallest total price that covers all the travel days? With the travel days `1 4 6 7 8 20` and the prices 2, 7, 15 the best is a 1-day pass for the day 1, a 7-day pass for the days 4 to 10, and a 1-day pass for the day 20: 2 + 7 + 2 = 11.',
        'Let `cost(d)` be the smallest price that covers all the travel days up to the day `d`. If `d` is **not** a travel day, nothing has to be paid for it: `cost(d) = cost(d - 1)`. On a travel day, the last pass must cover `d` and ends on `d` (or later; it is enough to look at passes that end exactly on `d`, because buying one earlier is no better): a 1-day pass gives `cost(d - 1) + c1`, a 7-day pass gives `cost(d - 7) + c7` and a 30-day pass gives `cost(d - 30) + c30`, with `cost` of a negative day being 0. **`cost(d) = min of the three`**.',
        { code: 'travel = set(days)\ncost = [0] * (last + 1)\nfor d in range(1, last + 1):\n    if d not in travel:\n        cost[d] = cost[d - 1]\n    else:\n        cost[d] = min(cost[d - 1] + c1, cost[max(0, d - 7)] + c7, cost[max(0, d - 30)] + c30)\nprint(cost[last])' },
        'The timeline is the table: one number per day up to the last travel day, 100 000 at most. The time is O(last day), the memory the same. This is the pattern for planning along a timeline: for each moment, the best way to be done up to this moment, built from earlier moments by the few possible last actions.'
      ]
    },
    statement: ['You travel on `n` given days. Passes can be bought for 1 day, 7 consecutive days or 30 consecutive days at the given prices; a pass bought for a start day covers that day and the following days of its length. Print the smallest total price of passes that cover every travel day.'],
    outputFormat: ['Print the smallest total price.'],
    examples: [{ input: '6\n1 4 6 7 8 20\n2 7 15\n', note: 'A 1-day pass for day 1, a 7-day pass for the days 4 to 10, a 1-day pass for day 20: 2 + 7 + 2 = 11.' }, { input: '1\n5\n3 5 9\n', note: 'One day: the 1-day pass, 3.' }],
    hints: ['Let cost(d) be the smallest price to cover all travel days up to the day d.', 'On a non-travel day cost(d) = cost(d - 1).', 'On a travel day take the smallest of cost(d - 1) + c1, cost(d - 7) + c7, cost(d - 30) + c30 (days before 1 cost 0).'],
    program: {
      io: ['n:int', 'days:int[n]', 'c1:int c7:int c30:int'],
      fast: true,
      python: r`
        last = days[-1]
        travel = bytearray(last + 1)
        for d in days:
            travel[d] = 1
        cost = [0] * (last + 1)
        for d in range(1, last + 1):
            if not travel[d]:
                cost[d] = cost[d - 1]
            else:
                a = cost[d - 1] + c1
                b = cost[d - 7 if d > 7 else 0] + c7
                c = cost[d - 30 if d > 30 else 0] + c30
                cost[d] = min(a, b, c)
        print(cost[last])`,
      cpp: r`
        int last = (int)days[n - 1];
        vector<char> travel(last + 1, 0);
        for (long long d : days) travel[d] = 1;
        vector<long long> cost(last + 1, 0);
        for (int d = 1; d <= last; d++) {
            if (!travel[d]) {
                cost[d] = cost[d - 1];
            } else {
                long long a = cost[d - 1] + c1;
                long long b = cost[d > 7 ? d - 7 : 0] + c7;
                long long c = cost[d > 30 ? d - 30 : 0] + c30;
                cost[d] = min(a, min(b, c));
            }
        }
        cout << cost[last] << "\n";`,
      java: r`
        int last = (int) days[(int) n - 1];
        boolean[] travel = new boolean[last + 1];
        for (int i = 0; i < n; i++) travel[(int) days[i]] = true;
        long[] cost = new long[last + 1];
        for (int d = 1; d <= last; d++) {
            if (!travel[d]) {
                cost[d] = cost[d - 1];
            } else {
                long a = cost[d - 1] + c1;
                long b = cost[d > 7 ? d - 7 : 0] + c7;
                long c = cost[d > 30 ? d - 30 : 0] + c30;
                cost[d] = Math.min(a, Math.min(b, c));
            }
        }
        System.out.println(cost[last]);`
    },
    solution: { explanation: ['cost(d), the smallest price that covers all travel days up to the day d, equals cost(d - 1) on a non-travel day and the smallest of cost(d - 1) + c1, cost(d - 7) + c7 and cost(d - 30) + c30 on a travel day (days before the first cost 0); the answer is the cost of the last day.'], complexity: 'Time O(last day), space O(last day).' },
    solve(input) {
      const rs = rows(input); const days = nums(rs[1]); const [c1, c7, c30] = nums(rs[2]); const m = days.length; // best[i]: the cheapest price that covers the first i travel days; a pass starts on a travel day
      const best = new Array(m + 1).fill(Infinity); best[0] = 0;
      for (let i = 0; i < m; i++) for (const [len, price] of [[1, c1], [7, c7], [30, c30]]) { let j = i; while (j < m && days[j] < days[i] + len) j++; best[j] = Math.min(best[j], best[i] + price); }
      return String(best[m]);
    },
    tests() {
      const g = rng(2075); const out = ['6\n1 4 6 7 8 20\n2 7 15\n', '1\n5\n3 5 9\n', '2\n1 100000\n1 1000 1000\n', '3\n1 2 3\n5 5 5\n'];
      const make = (n, maxDay, c1, c7, c30) => { const set = new Set(); while (set.size < n) set.add(randInt(g, 1, maxDay)); const days = [...set].sort((x, y) => x - y); return `${n}\n${days.join(' ')}\n${c1} ${c7} ${c30}\n`; };
      const brute = (input) => { const rs = rows(input); const days = nums(rs[1]); const [c1, c7, c30] = nums(rs[2]); const memo = new Map(); const go = (i) => { if (i >= days.length) return 0; if (memo.has(i)) return memo.get(i); let best = Infinity; for (const [len, c] of [[1, c1], [7, c7], [30, c30]]) { let j = i; while (j < days.length && days[j] < days[i] + len) j++; best = Math.min(best, c + go(j)); } memo.set(i, best); return best; }; return String(go(0)); };
      crossCheck(() => make(randInt(g, 1, 10), 40, randInt(g, 1, 10), randInt(g, 1, 30), randInt(g, 1, 60)), (i) => this.solve(i), brute, 500);
      for (const [n, maxDay, c1, c7, c30] of [[10, 365, 2, 7, 15], [50, 365, 3, 12, 30], [200, 1000, 10, 40, 100], [1000, 100000, 100, 400, 1000], [20000, 100000, 10, 30, 70], [20000, 100000, 1000, 1000, 1000], [20000, 20000, 1, 7, 30], [20000, 100000, 1, 1000, 1000], [5000, 6000, 5, 20, 100], [19999, 100000, 4, 18, 60]]) out.push(make(n, maxDay, c1, c7, c30));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of numbers.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 20000', '1 <= each number <= 10000'],
    slug: 'delete-and-earn',
    title: 'Pick a Number, Earn Its Value, Lose Its Neighbours',
    tags: ['dp', 'take-or-skip', 'counting', 'reduction'],
    concept: {
      title: 'Group equal numbers: picking a value means taking all its copies and skipping the values next to it',
      body: [
        'A list of numbers is given. In one move you pick a number `x` from the list: you **earn `x` points**, and every number equal to `x - 1` or `x + 1` is **deleted** from the list (the other copies of `x` stay and can be picked later). What is the largest total number of points? For `3 4 2` the best is to pick 4 (deleting 3), then pick 2: 6 points. For `2 2 3 3 3 4` pick all the 3s: 9 points (deleting the 2s and the 4).',
        'Picking a value once makes it worthwhile to pick **all its copies** (they are not deleted and give the same points), so the problem depends only on how many points each **value** is worth in total: `total(v) = v * (how many times v occurs)`. And the rule becomes: you may choose a set of values, but **not two values that differ by 1**. This is the *house robber* problem on the line of values `1, 2, ..., max`: values next to each other cannot both be taken.',
        { code: 'total = [0] * (limit + 1)\nfor x in a:\n    total[x] += x\ntake = skip = 0\nfor v in range(1, limit + 1):\n    take, skip = skip + total[v], max(skip, take)\nprint(max(take, skip))' },
        'The reduction from the original rules to a known pattern is the main step; the table over the values has at most 10 000 entries, so the time is O(n + max value). The same reduction works for any problem where choosing one item blocks its neighbours in some order.'
      ]
    },
    statement: ['A list of `n` positive integers is given. In one move you choose a number `x` of the list, take it out and earn `x` points; every number equal to `x - 1` or `x + 1` is also removed from the list (and earns nothing). You may continue until the list is empty. Print the largest total number of points.'],
    outputFormat: ['Print the largest total number of points.'],
    examples: [{ input: '3\n3 4 2\n', note: 'Pick 4 (the 3 is deleted) and then 2: 6 points.' }, { input: '6\n2 2 3 3 3 4\n', note: 'Pick the three 3s: 9 points.' }],
    hints: ['Equal numbers are always picked together: the value v is worth v times its count.', 'Two values that differ by 1 cannot both be taken.', 'Solve it like the street of houses, over the values 1 to the largest.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        limit = max(a)
        total = [0] * (limit + 1)
        for x in a:
            total[x] += x
        take = skip = 0
        for v in range(1, limit + 1):
            take, skip = skip + total[v], max(skip, take)
        print(max(take, skip))`,
      cpp: r`
        long long limit = *max_element(a.begin(), a.end());
        vector<long long> total(limit + 1, 0);
        for (long long x : a) total[x] += x;
        long long take = 0, skip = 0;
        for (long long v = 1; v <= limit; v++) {
            long long newTake = skip + total[v];
            skip = max(skip, take);
            take = newTake;
        }
        cout << max(take, skip) << "\n";`,
      java: r`
        int limit = 0;
        for (int i = 0; i < n; i++) limit = Math.max(limit, (int) a[i]);
        long[] total = new long[limit + 1];
        for (int i = 0; i < n; i++) total[(int) a[i]] += a[i];
        long take = 0, skip = 0;
        for (int v = 1; v <= limit; v++) {
            long newTake = skip + total[v];
            skip = Math.max(skip, take);
            take = newTake;
        }
        System.out.println(Math.max(take, skip));`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Picking a value means taking all its copies, worth value * count points, and no two values that differ by 1 can both be taken; this is the house robber problem over the values 1 to the maximum, solved with take and skip.'], complexity: 'Time O(n + max value), space O(max value).' },
    solve(input) {
      const a = nums(rows(input)[1]); const cnt = new Map(); for (const x of a) cnt.set(x, (cnt.get(x) || 0) + x); const vals = [...cnt.keys()].sort((p, q) => p - q); // over the distinct values only, with the neighbour check
      let take = 0, skip = 0, prevVal = -10; for (const v of vals) { const gain = cnt.get(v); if (v === prevVal + 1) { const newTake = skip + gain; skip = Math.max(skip, take); take = newTake; } else { const best = Math.max(take, skip); take = best + gain; skip = best; } prevVal = v; } return String(Math.max(take, skip));
    },
    tests() {
      const g = rng(2076); const out = ['3\n3 4 2\n', '6\n2 2 3 3 3 4\n', '1\n7\n', '2\n1 2\n', '3\n1 1 1\n'];
      const brute = (input) => { const a = nums(rows(input)[1]); const vals = [...new Set(a)]; let best = 0; for (let mask = 0; mask < (1 << vals.length); mask++) { const chosen = vals.filter((v, i) => mask >> i & 1); let ok = true; for (const v of chosen) if (chosen.includes(v + 1)) ok = false; if (!ok) continue; best = Math.max(best, a.filter((x) => chosen.includes(x)).reduce((s, x) => s + x, 0)); } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 12); return list(n, randArray(g, n, 1, 8)); }, (i) => this.solve(i), brute, 500);
      for (const [n, hi] of [[10, 20], [100, 100], [1000, 1000], [20000, 10000], [20000, 10000], [20000, 100], [20000, 5], [20000, 1], [19999, 10000]]) out.push(list(n, randArray(g, n, 1, hi)));
      out.push(list(10000, many(10000, (i) => i + 1)), list(20000, many(20000, (i) => (i % 2 ? 10000 : 9999))), list(20000, many(20000, (i) => 1 + (i % 3) * 5000)), list(20000, new Array(20000).fill(10000)));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `m`: the number of houses (nodes) and `m = n - 1`.', 'The second line has `n` numbers: the money in each house (the houses are numbered from 1).', 'The third line has `m` numbers: for the houses 2, 3, ..., n, the number of the house they hang from. The parent of a house always has a smaller number.'],
    constraints: ['2 <= n <= 100000', 'm = n - 1', '0 <= money <= 10^9'],
    slug: 'rob-the-village-tree',
    title: 'Rob the Houses of a Village Built as a Tree',
    tags: ['dp', 'tree-dp', 'take-or-skip'],
    concept: {
      title: 'Tree DP: for every node keep the best sum with the node taken and with the node skipped',
      body: [
        'The houses of a village form a **tree**: the house 1 is the root, and every other house hangs from a parent with a smaller number. A thief may rob any set of houses, but **never a house together with its parent** (the two are linked by an alarm). What is the largest amount of money? Take the houses 2 and 3 hanging from the house 1 and the house 4 hanging from the house 2, with the money `3 4 5 1`: the best choice is the houses 2 and 3, 4 + 5 = 9.',
        'This is the "no two neighbours" problem on a tree. For every house `v` keep two numbers about its **subtree** (the house and everything below it): `take[v]`, the best sum if `v` is robbed, and `skip[v]`, the best sum if `v` is not robbed. If `v` is robbed, its children must not be: `take[v] = money[v] + sum of skip[child]`. If `v` is not robbed, every child may be robbed or not, each independently: `skip[v] = sum of max(take[child], skip[child])`. The answer is `max(take[1], skip[1])`.',
        { code: 'take = money[:]                       # take[v]: money[v] + the skip values of the children so far\nskip = [0] * n\nfor v in range(n - 1, 0, -1):        # children before parents: a parent has a smaller number\n    p = parent[v] - 1\n    take[p] += skip[v]\n    skip[p] += max(take[v], skip[v])\nprint(max(take[0], skip[0]))' },
        'Because every parent has a smaller number than its children, going through the houses from the **last to the first** processes each house after all of its children, so no recursion is needed (a tree of 100 000 houses can be a chain that is too deep for recursion). The values of a house are final when the loop reaches it, and are then added to its parent. Time O(n), memory O(n).'
      ]
    },
    statement: ['A village has `n` houses forming a tree rooted at the house 1; the parent of the house `v` (for `v >= 2`) has a smaller number than `v`. The house `v` holds `money[v]`. A thief may rob any set of houses in which no house is robbed together with its parent. Print the largest amount of money.'],
    outputFormat: ['Print the largest amount of money.'],
    examples: [{ input: '4 3\n3 4 5 1\n1 1 2\n', note: 'The houses 2 and 3 (both hang from the house 1): 4 + 5 = 9.' }, { input: '2 1\n5 7\n1\n', note: 'The houses are linked: the richer one, 7.' }],
    hints: ['For each house keep the best sum of its subtree when the house is robbed and when it is not.', 'take[v] = money[v] + the skip values of the children; skip[v] = the sum of max(take, skip) of the children.', 'Go through the houses from the last to the first; every parent has a smaller number.'],
    program: {
      io: ['n:int m:int', 'money:int[n]', 'parent:int[m]'],
      fast: true,
      python: r`
        take = money[:]
        skip = [0] * n
        for v in range(n - 1, 0, -1):
            p = parent[v - 1] - 1
            take[p] += skip[v]
            skip[p] += take[v] if take[v] > skip[v] else skip[v]
        print(max(take[0], skip[0]))`,
      cpp: r`
        vector<long long> take = money, skip(n, 0);
        for (int v = (int)n - 1; v >= 1; v--) {
            int p = (int)parent[v - 1] - 1;
            take[p] += skip[v];
            skip[p] += max(take[v], skip[v]);
        }
        cout << max(take[0], skip[0]) << "\n";`,
      java: r`
        int count = (int) n;
        long[] take = money.clone();
        long[] skip = new long[count];
        for (int v = count - 1; v >= 1; v--) {
            int p = (int) parent[v - 1] - 1;
            take[p] += skip[v];
            skip[p] += Math.max(take[v], skip[v]);
        }
        System.out.println(Math.max(take[0], skip[0]));`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['take[v] is the best sum of the subtree of v when v is robbed (its money plus the skip values of its children) and skip[v] when it is not (the sum of the better values of its children); going from the last house to the first processes every house after its children, and the answer is the larger value at the root.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n] = nums(rs[0]); const money = nums(rs[1]); const par = nums(rs[2]); const kids = Array.from({ length: n }, () => []); for (let v = 1; v < n; v++) kids[par[v - 1] - 1].push(v); // an explicit stack walk from the root, children before parents in the reverse order
      const order = [0]; for (let i = 0; i < order.length; i++) for (const c of kids[order[i]]) order.push(c); const take = new Array(n).fill(0), skip = new Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { const v = order[i]; take[v] = money[v]; for (const c of kids[v]) { take[v] += skip[c]; skip[v] += Math.max(take[c], skip[c]); } } return String(Math.max(take[0], skip[0]));
    },
    tests() {
      const g = rng(2077); const out = ['4 3\n3 4 5 1\n1 1 2\n', '2 1\n5 7\n1\n', '3 2\n1 100 1\n1 2\n', '3 2\n10 1 1\n1 1\n'];
      const make = (n, hi, shape) => { const par = []; for (let v = 2; v <= n; v++) par.push(shape === 'chain' ? v - 1 : shape === 'star' ? 1 : shape === 'binary' ? Math.floor(v / 2) : shape === 'deep' ? Math.max(1, v - randInt(g, 1, 3)) : randInt(g, 1, v - 1)); return `${n} ${n - 1}\n${randArray(g, n, 0, hi).join(' ')}\n${par.join(' ')}\n`; };
      const brute = (input) => { const rs = rows(input); const [n] = nums(rs[0]); const money = nums(rs[1]); const par = nums(rs[2]); let best = 0; for (let mask = 0; mask < (1 << n); mask++) { let ok = true; for (let v = 1; v < n; v++) if ((mask >> v & 1) && (mask >> (par[v - 1] - 1) & 1)) { ok = false; break; } if (!ok) continue; let s = 0; for (let v = 0; v < n; v++) if (mask >> v & 1) s += money[v]; best = Math.max(best, s); } return String(best); };
      crossCheck(() => make(randInt(g, 2, 11), 20, ['rand', 'chain', 'star', 'binary', 'deep'][randInt(g, 0, 4)]), (i) => this.solve(i), brute, 500);
      for (const [n, hi, shape] of [[10, 100, 'rand'], [100, 1000, 'binary'], [1000, 1000000, 'rand'], [30000, 1000000000, 'rand'], [100000, 10, 'chain'], [60000, 1000000000, 'star'], [50000, 1000000, 'binary'], [30000, 1000000, 'deep'], [30000, 1000000, 'rand'], [30000, 3, 'rand'], [50000, 100, 'chain']]) out.push(make(n, hi, shape));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `k`: the number of values and the length of a window.', 'The second line has `n` numbers.'],
    constraints: ['3 <= n <= 100000', '1 <= k, 3 * k <= n', '0 <= each number <= 10000'],
    slug: 'three-best-windows',
    title: 'Three Separate Windows With the Biggest Total',
    tags: ['dp', 'windows', 'prefix-sums', 'multi-stage'],
    concept: {
      title: 'Build the answer in stages: the best 1 window, then 2, then 3, each using the stage before',
      body: [
        'In a list of numbers choose **three windows** (blocks of `k` consecutive numbers) that **do not overlap**, so that the total of all the numbers in the three windows is as large as possible. For `1 2 1 2 6 7 5 1` and `k = 2` the best total is 23 (the windows `1 2`, `2 6` and `7 5`). Print the largest total.',
        'First compute the sum of every window with prefix sums: `w[i]` is the sum of `a[i .. i + k - 1]`. Then build the answer in **three stages**. Let `f1[i]` be the best single window among the starts `0 .. i`: `f1[i] = max(f1[i - 1], w[i])`. Let `f2[i]` be the best total of two non-overlapping windows with the second one starting at most at `i`: the second window starts at `i` and the first is anywhere among the starts `0 .. i - k`, so `f2[i] = max(f2[i - 1], f1[i - k] + w[i])` for `i >= k`. Likewise **`f3[i] = max(f3[i - 1], f2[i - k] + w[i])`** for `i >= 2k`. The answer is the last value of `f3`.',
        { code: 'm = n - k + 1\nw = [prefix[i + k] - prefix[i] for i in range(m)]\nf1, f2, f3 = [NEG] * m, [NEG] * m, [NEG] * m\nfor i in range(m):\n    f1[i] = max(f1[i - 1] if i else NEG, w[i])\n    if i >= k:     f2[i] = max(f2[i - 1], f1[i - k] + w[i])\n    elif i:        f2[i] = f2[i - 1]\n    if i >= 2 * k: f3[i] = max(f3[i - 1], f2[i - k] + w[i])\n    elif i:        f3[i] = f3[i - 1]\nprint(f3[m - 1])' },
        'Each stage uses only the previous stage at a position `k` steps back, which guarantees that the windows do not overlap. The method extends to any number of windows: with `t` windows there are `t` stages, so the time is O(n * t) and the answer is one number from the last table. Choosing parts "in order" with a stage per part is the standard way to handle "choose a fixed number of things".'
      ]
    },
    statement: ['A list of `n` numbers and a window length `k` are given. Choose three windows of `k` consecutive numbers that do not overlap (they may touch) so that the sum of all the numbers in the three windows is as large as possible. Print that sum.'],
    outputFormat: ['Print the largest total.'],
    examples: [{ input: '8 2\n1 2 1 2 6 7 5 1\n', note: 'The windows 1 2 (positions 0-1), 2 6 (positions 3-4) and 7 5 (positions 5-6) give 3 + 8 + 12 = 23.' }, { input: '6 2\n4 4 4 4 4 4\n', note: 'Exactly three windows fit: 24.' }],
    hints: ['Compute the sum of every window with prefix sums.', 'Let f1 be the best single window up to a start, f2 the best two windows, f3 the best three; each stage looks back k positions.', 'The answer is the last value of f3.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      python: r`
        NEG = -10 ** 18
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + a[i]
        m = n - k + 1
        w = [prefix[i + k] - prefix[i] for i in range(m)]
        f1 = [NEG] * m
        f2 = [NEG] * m
        f3 = [NEG] * m
        for i in range(m):
            f1[i] = max(f1[i - 1], w[i]) if i else w[i]
            if i >= k:
                f2[i] = max(f2[i - 1], f1[i - k] + w[i])
            elif i:
                f2[i] = f2[i - 1]
            if i >= 2 * k:
                f3[i] = max(f3[i - 1], f2[i - k] + w[i])
            elif i:
                f3[i] = f3[i - 1]
        print(f3[m - 1])`,
      cpp: r`
        const long long NEG = -1000000000000000000LL;
        vector<long long> prefix(n + 1, 0);
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + a[i];
        int m = (int)(n - k + 1);
        int kk = (int)k;
        vector<long long> w(m), f1(m, NEG), f2(m, NEG), f3(m, NEG);
        for (int i = 0; i < m; i++) w[i] = prefix[i + kk] - prefix[i];
        for (int i = 0; i < m; i++) {
            f1[i] = i ? max(f1[i - 1], w[i]) : w[i];
            if (i >= kk) f2[i] = max(f2[i - 1], f1[i - kk] + w[i]);
            else if (i) f2[i] = f2[i - 1];
            if (i >= 2 * kk) f3[i] = max(f3[i - 1], f2[i - kk] + w[i]);
            else if (i) f3[i] = f3[i - 1];
        }
        cout << f3[m - 1] << "\n";`,
      java: r`
        final long NEG = -1000000000000000000L;
        int count = (int) n, kk = (int) k;
        long[] prefix = new long[count + 1];
        for (int i = 0; i < count; i++) prefix[i + 1] = prefix[i] + a[i];
        int m = count - kk + 1;
        long[] w = new long[m];
        long[] f1 = new long[m];
        long[] f2 = new long[m];
        long[] f3 = new long[m];
        Arrays.fill(f1, NEG);
        Arrays.fill(f2, NEG);
        Arrays.fill(f3, NEG);
        for (int i = 0; i < m; i++) w[i] = prefix[i + kk] - prefix[i];
        for (int i = 0; i < m; i++) {
            f1[i] = i > 0 ? Math.max(f1[i - 1], w[i]) : w[i];
            if (i >= kk) f2[i] = Math.max(f2[i - 1], f1[i - kk] + w[i]);
            else if (i > 0) f2[i] = f2[i - 1];
            if (i >= 2 * kk) f3[i] = Math.max(f3[i - 1], f2[i - kk] + w[i]);
            else if (i > 0) f3[i] = f3[i - 1];
        }
        System.out.println(f3[m - 1]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['After computing the sum of every window with prefix sums, f1, f2 and f3 hold the best total of one, two and three non-overlapping windows with the last window starting at most at the position; each stage adds a window at the position i to the previous stage at the position i - k. The answer is the last value of f3.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const { a: n, b: k, arr } = parse2(input); const w = []; for (let i = 0; i + k <= n; i++) { let s = 0; for (let j = i; j < i + k; j++) s += arr[j]; w.push(s); } const m = w.length; // the middle window by a scan, with the best window on its left and on its right
      const left = new Array(m).fill(-Infinity), right = new Array(m).fill(-Infinity); let best = -Infinity; for (let i = 0; i < m; i++) { best = Math.max(best, w[i]); left[i] = best; } best = -Infinity; for (let i = m - 1; i >= 0; i--) { best = Math.max(best, w[i]); right[i] = best; } let ans = -Infinity; for (let mid = k; mid + k < m; mid++) ans = Math.max(ans, left[mid - k] + w[mid] + right[mid + k]); return String(ans);
    },
    tests() {
      const g = rng(2078); const out = ['8 2\n1 2 1 2 6 7 5 1\n', '6 2\n4 4 4 4 4 4\n', '3 1\n1 2 3\n', '4 1\n9 1 1 9\n'];
      const make = (n, k, hi) => `${n} ${k}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (input) => { const { a: n, b: k, arr } = parse2(input); const w = (i) => { let s = 0; for (let j = i; j < i + k; j++) s += arr[j]; return s; }; let best = -Infinity; for (let i = 0; i + k <= n; i++) for (let j = i + k; j + k <= n; j++) for (let l = j + k; l + k <= n; l++) best = Math.max(best, w(i) + w(j) + w(l)); return String(best); };
      crossCheck(() => { const k = randInt(g, 1, 3); return make(randInt(g, 3 * k, 14), k, 9); }, (i) => this.solve(i), brute, 500);
      for (const [n, k, hi] of [[10, 2, 20], [100, 5, 100], [1000, 100, 10000], [100000, 1, 10000], [100000, 33333, 10000], [100000, 100, 10000], [100000, 1000, 10000], [99999, 7, 10000], [100000, 10, 1], [30000, 10000, 10000]]) out.push(make(n, k, hi));
      out.push(`100000 100\n${new Array(100000).fill(10000).join(' ')}\n`, `100000 100\n${new Array(100000).fill(0).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the string `s` of `0` and `1` characters.'],
    constraints: ['1 <= length of s <= 100000'],
    slug: 'flip-to-zeros-then-ones',
    title: 'Flip the Fewest Bits to Get Zeros and Then Ones',
    tags: ['dp', 'string', 'two-states', 'binary'],
    concept: {
      title: 'Track the cost of the prefix being all zeros so far, or having already switched to ones',
      body: [
        'A binary string is called *monotone* if it has some zeros followed by some ones (either part may be empty): `000111`, `0000`, `1111`. In one flip you change one character (`0` to `1` or `1` to `0`). What is the **smallest number of flips** that makes the given string monotone? For `00110` the answer is 1 (flip the last `0` to `1`); for `010110` it is 2.',
        'Read the string from left to right and keep two numbers: `f0`, the fewest flips so that the prefix read so far is **all zeros**, and `f1`, the fewest flips so that the prefix is **monotone and ends in a one** (it may still contain zeros before; it has already switched). For the next character `c`: if `c = 0`, staying all zeros costs nothing, so `f0` stays, while ending with a one needs this zero flipped: **`f1 = min(f0, f1) + 1`**. If `c = 1`, staying all zeros needs this one flipped: **`f0 = f0 + 1`**, while a one after any monotone prefix costs nothing: **`f1 = min(f0, f1)`**. The answer is `min(f0, f1)` at the end.',
        { code: 'f0 = f1 = 0\nfor c in s:\n    if c == "0":\n        f0, f1 = f0, min(f0, f1) + 1\n    else:\n        f0, f1 = f0 + 1, min(f0, f1)\nprint(min(f0, f1))' },
        'The two numbers are the whole state: the string so far is either still in the "zeros" part or already in the "ones" part. An alternative view is to try every place where the zeros end and count the ones before it plus the zeros after it, using prefix sums; the DP does the same in one pass with O(1) memory.'
      ]
    },
    statement: ['A string `s` of `0` and `1` characters is given. In one flip a character changes to the other value. Print the smallest number of flips that makes the string consist of some zeros followed by some ones (either part may be empty).'],
    outputFormat: ['Print the smallest number of flips.'],
    examples: [{ input: '00110\n', note: 'Flip the last 0: 00111, 1 flip.' }, { input: '010110\n', note: 'Flip the third and the last characters: 011111, 2 flips.' }],
    hints: ['Keep f0 = the fewest flips to make the prefix all zeros, f1 = the fewest flips to make it monotone with the last character a one.', 'A 0 keeps f0 and gives f1 = min(f0, f1) + 1; a 1 gives f0 + 1 and f1 = min(f0, f1).', 'The answer is min(f0, f1).'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        f0 = f1 = 0
        for c in s:
            if c == "0":
                f1 = min(f0, f1) + 1
            else:
                f0, f1 = f0 + 1, min(f0, f1)
        print(min(f0, f1))`,
      cpp: r`
        long long f0 = 0, f1 = 0;
        for (char c : s) {
            if (c == '0') {
                f1 = min(f0, f1) + 1;
            } else {
                long long newF0 = f0 + 1;
                f1 = min(f0, f1);
                f0 = newF0;
            }
        }
        cout << min(f0, f1) << "\n";`,
      java: r`
        long f0 = 0, f1 = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '0') {
                f1 = Math.min(f0, f1) + 1;
            } else {
                long newF0 = f0 + 1;
                f1 = Math.min(f0, f1);
                f0 = newF0;
            }
        }
        System.out.println(Math.min(f0, f1));`
    },
    solution: { explanation: ['f0, the fewest flips for the prefix to be all zeros, and f1, the fewest flips for it to be monotone ending in a one, are updated per character: a 0 keeps f0 and sets f1 = min(f0, f1) + 1; a 1 sets f0 = f0 + 1 and f1 = min(f0, f1). The answer is min(f0, f1).'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const s = rows(input)[0]; const n = s.length; // try every split: the ones before it are flipped to 0 and the zeros after it are flipped to 1
      const onesBefore = [0]; for (const c of s) onesBefore.push(onesBefore[onesBefore.length - 1] + (c === '1' ? 1 : 0)); const zerosAfter = new Array(n + 2).fill(0); for (let i = n - 1; i >= 0; i--) zerosAfter[i] = zerosAfter[i + 1] + (s[i] === '0' ? 1 : 0); let best = Infinity; for (let i = 0; i <= n; i++) best = Math.min(best, onesBefore[i] + zerosAfter[i]); return String(best);
    },
    tests() {
      const g = rng(2079); const out = ['00110\n', '010110\n', '0\n', '1\n', '10\n', '000\n', '111\n'];
      const brute = (input) => { const s = rows(input)[0]; const n = s.length; let best = n; for (let mask = 0; mask < (1 << n); mask++) { let flips = 0, ok = true; let seenOne = false; for (let i = 0; i < n; i++) { const c = (mask >> i & 1) ? '1' : '0'; if (c !== s[i]) flips++; if (c === '1') seenOne = true; else if (seenOne) { ok = false; break; } } if (ok) best = Math.min(best, flips); } return String(best); };
      crossCheck(() => randWord(g, randInt(g, 1, 12), '01') + '\n', (i) => this.solve(i), brute, 500);
      const rand = (n, p) => many(n, () => (g() < p ? '1' : '0')).join('');
      for (const [n, p] of [[10, 0.5], [100, 0.5], [1000, 0.3], [100000, 0.5], [100000, 0.1], [100000, 0.9], [99999, 0.5]]) out.push(rand(n, p) + '\n');
      out.push('0'.repeat(100000) + '\n', '1'.repeat(100000) + '\n', '01'.repeat(50000) + '\n', '10'.repeat(50000) + '\n', '1'.repeat(50000) + '0'.repeat(50000) + '\n', '0'.repeat(50000) + '1'.repeat(50000) + '\n', '0'.repeat(30000) + '1'.repeat(10000) + '0'.repeat(10000) + '1'.repeat(50000) + '\n');
      return out;
    }
  }
];
