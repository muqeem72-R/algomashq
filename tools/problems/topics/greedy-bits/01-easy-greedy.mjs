import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const easy = { difficulty: 'easy' };
const list = (n, a) => `${n}\n${a.join(' ')}\n`;
const head2 = (a, b, arr) => `${a} ${b}\n${arr.join(' ')}\n`;
const parse2 = (input) => { const rs = rows(input); const [a, b] = nums(rs[0]); return { a, b, rs }; };

export default [
  {
    ...easy,
    inputFormat: ['The first line has `q`: the number of questions.', 'The second line has `q` numbers: the amounts to pay.'],
    constraints: ['1 <= q <= 50000', '1 <= each amount <= 10^9'],
    slug: 'fewest-banknotes',
    title: 'Pay With the Fewest Banknotes',
    tags: ['greedy', 'coins', 'sorting'],
    concept: {
      title: 'Take the biggest note that still fits, again and again',
      body: [
        'A country has banknotes of the values `2000, 500, 200, 100, 50, 20, 10, 5, 2, 1`, and any number of notes of each value. To pay an amount you may give any notes that add up to **exactly** that amount. What is the smallest number of notes? For `2896` the answer is 9: `2000 + 500 + 200 + 100 + 50 + 20 + 20 + 5 + 1`, which has 9 notes (no combination uses fewer).',
        'A *greedy* algorithm makes the choice that looks best **right now** and never looks back: take the **largest note that does not exceed the remaining amount**, subtract it, and repeat. It does not look at the future, so it is fast, and for this particular set of values it is also **correct** (each value is at least about twice the one below it and the set has no tricky gaps). For a note value `v` we can take `remaining // v` notes at once and continue with `remaining % v`.',
        { code: 'NOTES = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1]\nfor amount in amounts:\n    count = 0\n    for v in NOTES:                     # from the largest to the smallest\n        count += amount // v\n        amount %= v\n    print(count)' },
        'Greedy is **not** always right. With the values `1, 3, 4` and the amount 6, greedy takes `4 + 1 + 1` (3 notes), but `3 + 3` uses only 2. Whenever you use a greedy method you should have a reason why the first choice cannot hurt. Here the reason is that the values divide the tail of the amount cleanly; for general coin sets the dynamic programming solution is needed. The work is O(q * 10).'
      ]
    },
    statement: ['Banknotes of the values 2000, 500, 200, 100, 50, 20, 10, 5, 2 and 1 are available without limit. For each of the `q` amounts, print the smallest number of notes that add up to exactly that amount.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces: the answers in the order of the questions.'],
    examples: [{ input: '3\n2896 1 40\n', note: '2896 = 2000 + 500 + 200 + 100 + 50 + 20 + 20 + 5 + 1 needs 9 notes; 1 needs 1 note; 40 = 20 + 20 needs 2 notes.' }],
    hints: ['Take as many of the largest note as fit, then continue with the remainder.', 'For a note value v use amount // v and amount % v.', 'Go through the values from the largest to the smallest.'],
    program: {
      io: ['q:int', 'amounts:int[q]'],
      fast: true,
      python: r`
        NOTES = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1]
        out = []
        for amount in amounts:
            count = 0
            for v in NOTES:
                count += amount // v
                amount %= v
            out.append(count)
        print(*out)`,
      cpp: r`
        long long notes[10] = {2000, 500, 200, 100, 50, 20, 10, 5, 2, 1};
        for (long long i = 0; i < q; i++) {
            long long amount = amounts[i], count = 0;
            for (int k = 0; k < 10; k++) {
                count += amount / notes[k];
                amount %= notes[k];
            }
            cout << (i ? " " : "") << count;
        }
        cout << "\n";`,
      java: r`
        long[] notes = {2000, 500, 200, 100, 50, 20, 10, 5, 2, 1};
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long amount = amounts[i], count = 0;
            for (int k = 0; k < 10; k++) {
                count += amount / notes[k];
                amount %= notes[k];
            }
            out.append(i > 0 ? " " : "").append(count);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['For each amount the largest note is taken as many times as it fits, then the next note on the remainder, and so on down to 1; for this set of values the greedy choice gives the fewest notes.'], complexity: 'Time O(q * 10), space O(1).' },
    solve(input) {
      const rs = rows(input); const amounts = nums(rs[1]); const notes = [1, 2, 5, 10, 20, 50, 100, 200, 500, 2000]; // the exact table for the amounts up to 3999, and the number of 2000-notes for the rest
      const best = new Array(4000).fill(Infinity); best[0] = 0; for (let v = 1; v < 4000; v++) for (const n of notes) if (n <= v && best[v - n] + 1 < best[v]) best[v] = best[v - n] + 1;
      return amounts.map((a) => (a < 4000 ? best[a] : (a - 2000 - (a % 2000)) / 2000 + best[2000 + (a % 2000)])).join(' ');
    },
    tests() {
      const g = rng(3001); const out = ['3\n2896 1 40\n', '1\n1\n', '1\n1000000000\n', '5\n2 3 4 6 7\n'];
      const brute = (input) => { const amounts = nums(rows(input)[1]); const notes = [1, 2, 5, 10, 20, 50, 100, 200, 500, 2000]; const limit = Math.max(...amounts); const best = new Array(limit + 1).fill(Infinity); best[0] = 0; for (let v = 1; v <= limit; v++) for (const n of notes) if (n <= v && best[v - n] + 1 < best[v]) best[v] = best[v - n] + 1; return amounts.map((a) => best[a]).join(' '); };
      crossCheck(() => { const q = randInt(g, 1, 8); return list(q, randArray(g, q, 1, 4000)); }, (i) => this.solve(i), brute, 200);
      for (const [q, hi] of [[10, 100], [100, 5000], [1000, 1000000], [20000, 1000000000], [50000, 1000000000], [50000, 2000], [50000, 10], [49999, 999999999]]) out.push(list(q, randArray(g, q, 1, hi)));
      out.push(list(50000, many(50000, (i) => 1000000000 - i)), list(50000, many(50000, (i) => i + 1)), list(50000, new Array(50000).fill(1999)));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `m`: the number of children and the number of cookies.', 'The second line has `n` numbers: the smallest cookie size that makes each child content.', 'The third line has `m` numbers: the sizes of the cookies.'],
    constraints: ['1 <= n, m <= 50000', '1 <= each number <= 10^9'],
    slug: 'feed-the-children',
    title: 'How Many Children Can Get a Cookie They Like?',
    tags: ['greedy', 'sorting', 'two-pointers', 'matching'],
    concept: {
      title: 'Give each child the smallest cookie that satisfies them',
      body: [
        'Each child has a *greed*, the smallest size of cookie that makes them content. Each cookie has a size, and one cookie can go to at most one child. A child is content with a cookie at least as big as their greed. What is the largest number of content children? For the greeds `1 2 3` and the cookies `1 1` the answer is 1: only the child with the greed 1 can be satisfied.',
        'Sort both lists. Look at the **least greedy child** first: if the **smallest cookie** is big enough for them, give it to them; a bigger cookie would be wasted on a child who needs little, and the smallest cookie cannot satisfy anyone greedier either. If the smallest cookie is too small for the least greedy child, it is too small for **every** child, so throw it away. That is a greedy rule with two pointers: one on the children, one on the cookies; move the cookie pointer every time, and the child pointer only when the child gets a cookie.',
        { code: 'greed.sort(); cookies.sort()\nchild = 0\nfor size in cookies:                     # from the smallest cookie\n    if child < len(greed) and size >= greed[child]:\n        child += 1                       # this child is content\nprint(child)' },
        'After sorting, the matching is found in one pass. Sorting costs O(n log n) and the pass O(n + m). Why is the greedy choice safe? Suppose some optimal answer gives the smallest cookie to another child or to nobody; swapping the cookies cannot reduce the number of content children, because the least greedy child is the easiest to satisfy. This kind of **exchange argument** is the standard way to prove a greedy algorithm.'
      ]
    },
    statement: ['There are `n` children, the child `i` is content with a cookie of the size `greed[i]` or bigger. There are `m` cookies; each can be given to at most one child, and each child gets at most one cookie. Print the largest number of content children.'],
    outputFormat: ['Print the largest number of content children.'],
    examples: [{ input: '3 2\n1 2 3\n1 1\n', note: 'Only one child (greed 1) can be satisfied: 1.' }, { input: '2 3\n1 2\n1 2 3\n', note: 'Both children get a cookie: 2.' }],
    hints: ['Sort the greeds and the cookie sizes.', 'Go through the cookies from the smallest; give the cookie to the least greedy child who is not content yet if it is big enough.', 'A cookie that is too small for the least greedy child is useless and can be skipped.'],
    program: {
      io: ['n:int m:int', 'greed:int[n]', 'cookies:int[m]'],
      fast: true,
      python: r`
        greed.sort()
        cookies.sort()
        child = 0
        for size in cookies:
            if child < n and size >= greed[child]:
                child += 1
        print(child)`,
      cpp: r`
        sort(greed.begin(), greed.end());
        sort(cookies.begin(), cookies.end());
        long long child = 0;
        for (long long size : cookies) {
            if (child < n && size >= greed[child]) child++;
        }
        cout << child << "\n";`,
      java: r`
        Arrays.sort(greed);
        Arrays.sort(cookies);
        int child = 0;
        for (int j = 0; j < m; j++) {
            if (child < n && cookies[j] >= greed[child]) child++;
        }
        System.out.println(child);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Both lists are sorted; the cookies are taken from the smallest and each one is given to the least greedy child who has no cookie yet if it is big enough, otherwise it is skipped. The number of children served is the answer.'], complexity: 'Time O(n log n + m log m), space O(1) extra.' },
    solve(input) {
      const rs = rows(input); const greed = nums(rs[1]).sort((x, y) => y - x); const cookies = nums(rs[2]).sort((x, y) => y - x); // from the other end: the biggest cookie goes to the most greedy child it can satisfy
      let j = 0, count = 0; for (const c of cookies) { while (j < greed.length && greed[j] > c) j++; if (j < greed.length) { count++; j++; } } return String(count);
    },
    tests() {
      const g = rng(3002); const out = ['3 2\n1 2 3\n1 1\n', '2 3\n1 2\n1 2 3\n', '1 1\n5\n4\n', '1 1\n5\n5\n'];
      const make = (n, m, hi) => `${n} ${m}\n${randArray(g, n, 1, hi).join(' ')}\n${randArray(g, m, 1, hi).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); const greed = nums(rs[1]), cookies = nums(rs[2]); let best = 0; const used = new Array(m).fill(false); const go = (i, count) => { best = Math.max(best, count); if (i === n) return; go(i + 1, count); for (let j = 0; j < m; j++) if (!used[j] && cookies[j] >= greed[i]) { used[j] = true; go(i + 1, count + 1); used[j] = false; } }; go(0, 0); return String(best); };
      crossCheck(() => make(randInt(g, 1, 6), randInt(g, 1, 6), 6), (i) => this.solve(i), brute, 400);
      for (const [n, m, hi] of [[10, 10, 20], [100, 120, 100], [1000, 900, 1000000], [50000, 50000, 1000000000], [30000, 20000, 1000000000], [20000, 30000, 1000000000], [50000, 50000, 5], [50000, 50000, 1000], [30000, 49999, 1000000000]]) out.push(make(n, m, hi));
      out.push(`25000 25000\n${many(25000, (i) => i + 1).join(' ')}\n${many(25000, (i) => i + 1).join(' ')}\n`, `25000 25000\n${many(25000, (i) => i + 1).join(' ')}\n${many(25000, (i) => i).map((x) => Math.max(1, x)).join(' ')}\n`, `25000 25000\n${new Array(25000).fill(1000000000).join(' ')}\n${new Array(25000).fill(999999999).join(' ')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of customers.', 'The second line has `n` numbers, each 5, 10 or 20: the bill that each customer pays with, in the order of the queue.'],
    constraints: ['1 <= n <= 100000', 'Every bill is 5, 10 or 20.'],
    slug: 'change-at-the-stand',
    title: 'Can the Lemonade Stand Always Give Change?',
    tags: ['greedy', 'simulation', 'counting'],
    concept: {
      title: 'When there are two ways to give change, use the one that keeps the more useful bills',
      body: [
        'A lemonade costs 5. Customers stand in a queue and each pays with **one bill** of 5, 10 or 20, and you must give the right change at once from the bills you have received so far (you start with no money). Can you serve all the customers in order? For `5 5 5 10 20` yes; for `5 5 10 10 20` no: after the first four customers you hold two 10-bills and no 5-bill, so the change of 15 for the last customer cannot be given.',
        'Count the bills you hold: `fives` and `tens` (twenties are never given as change, so they need no count). A 5-bill needs no change. A 10-bill needs the change 5: one five. A 20-bill needs the change 15, and there are two ways: **one 10 and one 5**, or **three 5s**. The greedy rule: **prefer the 10 and the 5**. Why? A 10-bill is useful only for giving change to a 20, while 5-bills are useful for everybody, so keep the 5s. If you cannot make the change, the answer is no.',
        { code: 'fives = tens = 0\nok = True\nfor bill in bills:\n    if bill == 5:\n        fives += 1\n    elif bill == 10:\n        if fives == 0: ok = False; break\n        fives -= 1; tens += 1\n    else:                                   # 20: change 15\n        if tens > 0 and fives > 0: tens -= 1; fives -= 1\n        elif fives >= 3: fives -= 3\n        else: ok = False; break\nprint("yes" if ok else "no")' },
        'The choice "10 + 5 before 5 + 5 + 5" is the greedy decision, and it is safe by the same exchange argument: any plan that uses three 5s while a 10 is available can use the 10 instead and keep two 5s more. The simulation takes O(n) time and O(1) memory.'
      ]
    },
    statement: ['A lemonade costs 5. `n` customers come in order; each pays with one bill of 5, 10 or 20 and must get the right change immediately, using only the bills received from the earlier customers (there is no money at the start). Print `yes` if every customer can be served, otherwise `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '5\n5 5 5 10 20\n', note: 'Change 5 for the 10, change 10 + 5 for the 20: yes.' }, { input: '5\n5 5 10 10 20\n', note: 'The second 10 uses the last 5; for the 20 there is only one 10 and no 5: no.' }],
    hints: ['Keep the number of 5-bills and 10-bills.', 'A 20 needs 15 in change: use a 10 and a 5 if possible, otherwise three 5s.', 'Stop with no as soon as the change cannot be given.'],
    program: {
      io: ['n:int', 'bills:int[n]'],
      fast: true,
      python: r`
        fives = tens = 0
        ok = True
        for bill in bills:
            if bill == 5:
                fives += 1
            elif bill == 10:
                if fives == 0:
                    ok = False
                    break
                fives -= 1
                tens += 1
            else:
                if tens > 0 and fives > 0:
                    tens -= 1
                    fives -= 1
                elif fives >= 3:
                    fives -= 3
                else:
                    ok = False
                    break
        print("yes" if ok else "no")`,
      cpp: r`
        long long fives = 0, tens = 0;
        bool ok = true;
        for (long long bill : bills) {
            if (bill == 5) {
                fives++;
            } else if (bill == 10) {
                if (fives == 0) { ok = false; break; }
                fives--;
                tens++;
            } else {
                if (tens > 0 && fives > 0) { tens--; fives--; }
                else if (fives >= 3) fives -= 3;
                else { ok = false; break; }
            }
        }
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        long fives = 0, tens = 0;
        boolean ok = true;
        for (int i = 0; i < n; i++) {
            long bill = bills[i];
            if (bill == 5) {
                fives++;
            } else if (bill == 10) {
                if (fives == 0) { ok = false; break; }
                fives--;
                tens++;
            } else {
                if (tens > 0 && fives > 0) { tens--; fives--; }
                else if (fives >= 3) fives -= 3;
                else { ok = false; break; }
            }
        }
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['The number of 5-bills and 10-bills held is tracked. A 5 needs no change, a 10 needs a 5, and a 20 is changed with a 10 and a 5 when possible (the greedy choice, since 5s are more useful) and with three 5s otherwise; if the change cannot be given the answer is no.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const bills = nums(rows(input)[1]); // a search over all ways to give the change of a 20, with memory of the states (fives, tens)
      let states = new Set(['0,0']); for (const b of bills) { const next = new Set(); for (const key of states) { const [f, t] = key.split(',').map(Number); if (b === 5) next.add(`${f + 1},${t}`); else if (b === 10) { if (f >= 1) next.add(`${f - 1},${t + 1}`); } else { if (t >= 1 && f >= 1) next.add(`${f - 1},${t - 1}`); if (f >= 3) next.add(`${f - 3},${t}`); } } states = next; if (!states.size) return 'no'; } return 'yes';
    },
    tests() {
      const g = rng(3003); const out = ['5\n5 5 5 10 20\n', '5\n5 5 10 10 20\n', '1\n5\n', '1\n10\n', '1\n20\n'];
      const brute = (input) => { const bills = nums(rows(input)[1]); const go = (i, f, t) => { if (i === bills.length) return true; const b = bills[i]; if (b === 5) return go(i + 1, f + 1, t); if (b === 10) return f >= 1 && go(i + 1, f - 1, t + 1); return (t >= 1 && f >= 1 && go(i + 1, f - 1, t - 1)) || (f >= 3 && go(i + 1, f - 3, t)); }; return go(0, 0, 0) ? 'yes' : 'no'; };
      const make = (n, p5, p10) => list(n, many(n, () => { const x = g(); return x < p5 ? 5 : x < p5 + p10 ? 10 : 20; }));
      crossCheck(() => make(randInt(g, 1, 12), 0.5, 0.25), (i) => this.solve(i), brute, 600);
      for (const [n, p5, p10] of [[10, 0.6, 0.2], [100, 0.5, 0.25], [1000, 0.55, 0.25], [100000, 0.5, 0.25], [100000, 0.6, 0.2], [100000, 0.45, 0.3], [100000, 0.34, 0.33], [99999, 0.7, 0.1]]) out.push(make(n, p5, p10));
      out.push(list(100000, many(100000, () => 5)), list(100000, many(100000, (i) => (i < 50000 ? 5 : 10))), list(100000, many(100000, (i) => (i % 4 === 3 ? 20 : 5))), list(100000, many(100000, (i) => (i % 2 ? 10 : 5))), list(99999, many(99999, (i) => (i % 3 === 2 ? 20 : i % 3 === 1 ? 10 : 5))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `coins`: the number of ice cream bars and the number of coins you have.', 'The second line has `n` numbers: the price of each bar.'],
    constraints: ['1 <= n <= 100000', '1 <= each price <= 100000', '1 <= coins <= 10^9'],
    slug: 'most-ice-creams',
    title: 'How Many Ice Creams Can You Buy?',
    tags: ['greedy', 'sorting', 'counting-sort'],
    concept: {
      title: 'To buy the most items, always buy the cheapest one that is left',
      body: [
        'A shop sells `n` ice cream bars, each at its own price, and you have a number of coins. Every bar can be bought **once**. What is the **largest number of bars** you can buy? For the prices `1 3 2 4 1` and 7 coins the answer is 4 (the bars costing 1, 1, 2 and 3: total 7).',
        'The goal is the **count**, not the value, so each bar is worth exactly 1 whatever its price. Then buying the **cheapest** bars first is always best: if a plan buys a bar that is not among the cheapest ones, replacing it by a cheaper bar that is not in the plan keeps the count and does not increase the cost. So **sort the prices** and buy bars from the cheapest while the coins are enough.',
        { code: 'prices.sort()\nbought = 0\nfor p in prices:\n    if p > coins: break\n    coins -= p\n    bought += 1\nprint(bought)' },
        'The sorting costs O(n log n). Because the prices are small numbers (at most 100 000) one can also count how many bars have each price and walk over the prices (a *counting sort*) in O(n + max price). The same "cheapest first" rule fails when items have different values, as in the knapsack problem; the key here is that all the bars are equally valuable.'
      ]
    },
    statement: ['A shop has `n` ice cream bars with the given prices. You have `coins` coins and can buy each bar at most once. Print the largest number of bars you can buy.'],
    outputFormat: ['Print the largest number of bars.'],
    examples: [{ input: '5 7\n1 3 2 4 1\n', note: 'Buy the bars costing 1, 1, 2 and 3: 4 bars for 7 coins.' }, { input: '3 1\n2 3 4\n', note: 'Nothing costs 1 or less: 0.' }],
    hints: ['Every bar counts as 1, so cheap bars are always better.', 'Sort the prices and buy from the smallest while you can pay.', 'Stop at the first price you cannot pay.'],
    program: {
      io: ['n:int coins:int', 'prices:int[n]'],
      fast: true,
      python: r`
        prices.sort()
        bought = 0
        for p in prices:
            if p > coins:
                break
            coins -= p
            bought += 1
        print(bought)`,
      cpp: r`
        sort(prices.begin(), prices.end());
        long long bought = 0;
        for (long long p : prices) {
            if (p > coins) break;
            coins -= p;
            bought++;
        }
        cout << bought << "\n";`,
      java: r`
        Arrays.sort(prices);
        long bought = 0;
        for (int i = 0; i < n; i++) {
            if (prices[i] > coins) break;
            coins -= prices[i];
            bought++;
        }
        System.out.println(bought);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Because every bar counts the same, the cheapest bars are bought first: the prices are sorted and bought one by one while the coins are enough.'], complexity: 'Time O(n log n), space O(1) extra.' },
    solve(input) {
      const { a: n, b: coins, rs } = parse2(input); const prices = nums(rs[1]); const count = new Array(100001).fill(0); for (const p of prices) count[p]++; // counting sort: how many bars of each price can still be bought
      let left = coins, bought = 0; for (let price = 1; price <= 100000 && left >= price; price++) { const take = Math.min(count[price], Math.floor(left / price)); bought += take; left -= take * price; if (take < count[price]) break; } return String(bought);
    },
    tests() {
      const g = rng(3004); const out = ['5 7\n1 3 2 4 1\n', '3 1\n2 3 4\n', '1 5\n5\n', '1 4\n5\n'];
      const brute = (input) => { const { a: n, b: coins, rs } = parse2(input); const prices = nums(rs[1]); let best = 0; for (let mask = 0; mask < (1 << n); mask++) { let s = 0, c = 0; for (let i = 0; i < n; i++) if (mask >> i & 1) { s += prices[i]; c++; } if (s <= coins) best = Math.max(best, c); } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 10); return head2(n, randInt(g, 1, 40), randArray(g, n, 1, 15)); }, (i) => this.solve(i), brute, 400);
      for (const [n, coins, hi] of [[10, 30, 20], [100, 500, 100], [1000, 100000, 1000], [100000, 1000000000, 100000], [100000, 100000000, 100000], [100000, 1000, 100000], [100000, 1, 100000], [100000, 500000, 10], [99999, 123456789, 100000]]) out.push(head2(n, coins, randArray(g, n, 1, hi)));
      out.push(head2(100000, 1000000000, new Array(100000).fill(100000)), head2(100000, 1000000000, many(100000, (i) => i + 1)), head2(100000, 500000, new Array(100000).fill(1)));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `size` and `k`: the length of the flowerbed and the number of flowers to plant.', 'The second line has `size` numbers, each 0 or 1: `0` is an empty place and `1` is a place that already has a flower.'],
    constraints: ['1 <= size <= 100000', '0 <= k <= size', 'No two flowers in the bed are next to each other.'],
    slug: 'plant-flowers',
    title: 'Can k More Flowers Be Planted Without Neighbours?',
    tags: ['greedy', 'array', 'scan'],
    concept: {
      title: 'Plant a flower in every place that is allowed, from left to right',
      body: [
        'A flowerbed is a row of places; some already have a flower (`1`) and some are empty (`0`). Flowers cannot be planted in **neighbouring** places (the rule also forbids a new flower next to an old one). Can `k` more flowers be planted? For the bed `1 0 0 0 1` and `k = 1` yes (the middle place); for `k = 2` no.',
        'Walk from the left to the right and plant a flower in **every place where it is allowed**: the place is empty, the place on the left is empty (or there is none) and the place on the right is empty (or there is none). Planting as early as possible never hurts: a flower in the leftmost possible place blocks only the next place, and anything planted further right could be planted just as well. Count the new flowers; the answer is yes if the count reaches `k`.',
        { code: 'planted = 0\nfor i in range(len(bed)):\n    left_free = i == 0 or bed[i - 1] == 0\n    right_free = i == len(bed) - 1 or bed[i + 1] == 0\n    if bed[i] == 0 and left_free and right_free:\n        bed[i] = 1                              # plant here\n        planted += 1\nprint("yes" if planted >= k else "no")' },
        'Setting `bed[i] = 1` also makes the next place unavailable, as the check at the next step sees. A different way to count: a stretch of `z` empty places between two flowers holds `(z - 1) // 2` new flowers. The scan takes O(n) time and O(1) memory.'
      ]
    },
    statement: ['A flowerbed has `size` places; `1` means a flower is there and `0` means the place is empty. No two flowers may be in neighbouring places. Print `yes` if `k` more flowers can be planted without breaking this rule, otherwise `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '5 1\n1 0 0 0 1\n', note: 'The middle place is free: yes.' }, { input: '5 2\n1 0 0 0 1\n', note: 'Only one flower fits: no.' }],
    hints: ['A flower can be planted in an empty place if both neighbours (when they exist) are empty.', 'Plant as early as possible, from the left to the right.', 'Compare the number of planted flowers with k.'],
    program: {
      io: ['size:int k:int', 'bed:int[size]'],
      fast: true,
      python: r`
        planted = 0
        for i in range(size):
            left_free = i == 0 or bed[i - 1] == 0
            right_free = i == size - 1 or bed[i + 1] == 0
            if bed[i] == 0 and left_free and right_free:
                bed[i] = 1
                planted += 1
        print("yes" if planted >= k else "no")`,
      cpp: r`
        long long planted = 0;
        for (long long i = 0; i < size; i++) {
            bool leftFree = i == 0 || bed[i - 1] == 0;
            bool rightFree = i == size - 1 || bed[i + 1] == 0;
            if (bed[i] == 0 && leftFree && rightFree) {
                bed[i] = 1;
                planted++;
            }
        }
        cout << (planted >= k ? "yes" : "no") << "\n";`,
      java: r`
        long planted = 0;
        for (int i = 0; i < size; i++) {
            boolean leftFree = i == 0 || bed[i - 1] == 0;
            boolean rightFree = i == size - 1 || bed[i + 1] == 0;
            if (bed[i] == 0 && leftFree && rightFree) {
                bed[i] = 1;
                planted++;
            }
        }
        System.out.println(planted >= k ? "yes" : "no");`
    },
    solution: { explanation: ['The bed is scanned from left to right and a flower is planted in every empty place whose neighbours are empty (or missing); the number of planted flowers is compared with k.'], complexity: 'Time O(size), space O(1).' },
    solve(input) {
      const { a: len, b: k, rs } = parse2(input); const bed = nums(rs[1]); // count with the padded bed: a stretch of z empty places between two flowers holds floor((z - 1) / 2) new ones
      const padded = [1, 0, ...bed, 0, 1]; let total = 0; let run = 0; for (const x of padded) { if (x === 0) run++; else { total += Math.max(0, Math.floor((run - 1) / 2)); run = 0; } } return total >= k ? 'yes' : 'no';
    },
    tests() {
      const g = rng(3005); const out = ['5 1\n1 0 0 0 1\n', '5 2\n1 0 0 0 1\n', '1 1\n0\n', '1 1\n1\n', '1 0\n1\n', '3 2\n0 0 0\n'];
      const bed = (len, p) => { const a = new Array(len).fill(0); for (let i = 0; i < len; i++) if (g() < p && (i === 0 || a[i - 1] === 0)) a[i] = 1; return a; };
      const make = (len, p, kOffset) => { const a = bed(len, p); const best = (() => { const b = a.slice(); let c = 0; for (let i = 0; i < len; i++) if (b[i] === 0 && (i === 0 || b[i - 1] === 0) && (i === len - 1 || b[i + 1] === 0)) { b[i] = 1; c++; } return c; })(); return head2(len, Math.max(0, best + kOffset), a); };
      const brute = (input) => { const { a: len, b: k, rs } = parse2(input); const a = nums(rs[1]); let best = 0; const go = (i, count) => { if (i === len) { best = Math.max(best, count); return; } go(i + 1, count); if (a[i] === 0 && (i === 0 || a[i - 1] === 0) && (i === len - 1 || a[i + 1] === 0)) { a[i] = 1; go(i + 1, count + 1); a[i] = 0; } }; go(0, 0); return best >= k ? 'yes' : 'no'; };
      crossCheck(() => make(randInt(g, 1, 12), 0.25, randInt(g, -1, 1)), (i) => this.solve(i), brute, 600);
      for (const [len, p, off] of [[10, 0.2, 0], [100, 0.1, 0], [1000, 0.05, 1], [100000, 0.1, 0], [100000, 0.1, 1], [100000, 0.3, 0], [100000, 0.02, -1], [99999, 0.15, 0]]) out.push(make(len, p, off));
      out.push(head2(100000, 50000, new Array(100000).fill(0)), head2(100000, 50001, new Array(100000).fill(0)), head2(100000, 0, many(100000, (i) => (i % 2 ? 0 : 1))), head2(99999, 1, many(99999, (i) => (i % 2 ? 0 : 1))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `m`: the number of values (an even number).', 'The second line has `m` numbers.'],
    constraints: ['2 <= m <= 100000, and `m` is even', '-10^4 <= each number <= 10^4'],
    slug: 'pairs-with-biggest-minimums',
    title: 'Pair Up the Numbers for the Biggest Sum of Minimums',
    tags: ['greedy', 'sorting', 'pairing'],
    concept: {
      title: 'Pair neighbours in the sorted order: the bigger number of a pair is wasted, so keep it close to its partner',
      body: [
        'You have `m` numbers (`m` is even) and must split them into `m / 2` pairs. The score of a pair is its **smaller** number, and the total score is the sum over the pairs. What is the largest total score? For `1 4 3 2` the answer is 4: pair `(1, 2)` and `(3, 4)` to get `1 + 3`.',
        'In every pair the bigger number is "wasted": it does not count. So we want to waste as **little** as possible: pair each number with a partner that is **as close to it as possible**, so that the wasted bigger number is only slightly bigger. Sort the numbers and pair the neighbours: `(a[0], a[1])`, `(a[2], a[3])`, and so on. The score is the sum of the numbers at the **even** positions of the sorted list. If the biggest number were paired with a small one, it would be wasted completely.',
        { code: 'a.sort()\nprint(sum(a[0::2]))                  # the numbers at the positions 0, 2, 4, ...' },
        'An exchange argument shows that neighbours are best: take any pairing in which the smallest number `a[0]` is not paired with `a[1]`; its partner `x` is at least `a[1]`, and swapping the partners of `a[1]` and `x` does not decrease the total (the minimum of the first pair is still `a[0]`, and the other pair gets a minimum that is at least as big). The cost is the sorting, O(m log m).'
      ]
    },
    statement: ['`m` integers are given (`m` is even). Split them into `m / 2` pairs; the score of a pair is the smaller number of the pair. Print the largest possible sum of the scores.'],
    outputFormat: ['Print the largest possible sum.'],
    examples: [{ input: '4\n1 4 3 2\n', note: 'The pairs (1, 2) and (3, 4) give 1 + 3 = 4.' }, { input: '6\n6 2 6 5 1 2\n', note: 'Sorted: 1 2 2 5 6 6 gives 1 + 2 + 6 = 9.' }],
    hints: ['The bigger number of each pair does not count.', 'Pair numbers that are neighbours in the sorted order.', 'The answer is the sum of the numbers at the even positions of the sorted list.'],
    program: {
      io: ['m:int', 'a:int[m]'],
      fast: true,
      python: r`
        a.sort()
        print(sum(a[0::2]))`,
      cpp: r`
        sort(a.begin(), a.end());
        long long total = 0;
        for (size_t i = 0; i < a.size(); i += 2) total += a[i];
        cout << total << "\n";`,
      java: r`
        Arrays.sort(a);
        long total = 0;
        for (int i = 0; i < a.length; i += 2) total += a[i];
        System.out.println(total);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The numbers are sorted and neighbours are paired; the sum of the smaller numbers of the pairs is the sum of the elements at the even positions of the sorted list.'], complexity: 'Time O(m log m), space O(1) extra.' },
    solve(input) {
      const a = nums(rows(input)[1]).sort((x, y) => y - x); let total = 0; for (let i = 1; i < a.length; i += 2) total += a[i]; return String(total); // from the big end: the second number of each pair of the descending order
    },
    tests() {
      const g = rng(3006); const out = ['4\n1 4 3 2\n', '6\n6 2 6 5 1 2\n', '2\n5 5\n', '2\n-3 7\n'];
      const brute = (input) => { const a = nums(rows(input)[1]); const go = (rest) => { if (!rest.length) return 0; let best = -Infinity; for (let j = 1; j < rest.length; j++) { const left = rest.filter((_, k) => k !== 0 && k !== j); best = Math.max(best, Math.min(rest[0], rest[j]) + go(left)); } return best; }; return String(go(a)); };
      crossCheck(() => { const m = 2 * randInt(g, 1, 4); return list(m, randArray(g, m, -9, 9)); }, (i) => this.solve(i), brute, 400);
      for (const [m, lo, hi] of [[10, -10, 10], [100, -100, 100], [1000, -10000, 10000], [100000, -10000, 10000], [100000, 0, 10000], [100000, -10000, 0], [100000, -3, 3], [99998, -10000, 10000]]) out.push(list(m, randArray(g, m, lo, hi)));
      out.push(list(100000, many(100000, (i) => i % 20001 - 10000)), list(100000, new Array(100000).fill(10000)), list(100000, new Array(100000).fill(-10000)));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `t` and `cap`: the number of kinds of boxes and the number of boxes that fit on the truck.', 'Each of the next `t` lines has two numbers: the number of boxes of this kind and the number of units in each box of this kind.'],
    constraints: ['1 <= t <= 50000', '1 <= each count <= 10000', '1 <= units per box <= 10000', '1 <= cap <= 10^9'],
    slug: 'load-the-truck',
    title: 'Load the Truck With the Most Units',
    tags: ['greedy', 'sorting', 'knapsack-like'],
    concept: {
      title: 'Take the boxes with the most units per box first',
      body: [
        'A warehouse has several kinds of boxes. For each kind you know how many boxes there are and how many **units of goods** each box holds. A truck can carry at most `cap` boxes (the boxes have the same size, only the content differs). Which boxes should be loaded to carry the **largest number of units**? For the kinds `(1 box, 3 units)`, `(2, 2)`, `(3, 1)` and `cap = 4` the best is the box with 3 units and the two with 2 units, and one with 1 unit: 3 + 4 + 1 = 8.',
        'Every box takes the same room, so a box with more units is always better than a box with fewer. **Sort the kinds by the units per box, from the largest to the smallest**, and load whole kinds while there is room; for the last kind load as many boxes as still fit. This is a *fractional-knapsack-like* problem in which all items have the same weight (1), and then the value-per-weight rule is simply "the biggest value first".',
        { code: 'kinds.sort(key=lambda k: -k[1])              # by units per box, descending\ntotal = 0\nfor boxes, units in kinds:\n    take = min(boxes, cap)\n    total += take * units\n    cap -= take\n    if cap == 0: break\nprint(total)' },
        'The sum can reach about 10^4 * 10^4 * 50 000 = 5 * 10^12, so 64-bit numbers are needed. Sorting costs O(t log t). The exchange argument is the same as before: if a plan skips a box with more units while carrying a box with fewer, swapping them cannot make the total smaller.'
      ]
    },
    statement: ['There are `t` kinds of boxes: the kind `i` has `count[i]` boxes, each holding `units[i]` units. The truck can carry at most `cap` boxes. Print the largest total number of units that can be carried.'],
    outputFormat: ['Print the largest total number of units.'],
    examples: [{ input: '3 4\n1 3\n2 2\n3 1\n', note: 'Load the 3-unit box, the two 2-unit boxes and one 1-unit box: 3 + 4 + 1 = 8.' }, { input: '2 10\n5 10\n3 7\n', note: 'All 8 boxes fit: 50 + 21 = 71.' }],
    hints: ['Every box takes the same space, so more units per box is better.', 'Sort the kinds by units per box, descending.', 'Take whole kinds while the truck has room, and part of the last kind.'],
    program: {
      io: ['t:int cap:int', 'kinds:int[t][2]'],
      fast: true,
      python: r`
        kinds.sort(key=lambda k: -k[1])
        total = 0
        for boxes, units in kinds:
            take = min(boxes, cap)
            total += take * units
            cap -= take
            if cap == 0:
                break
        print(total)`,
      cpp: r`
        sort(kinds.begin(), kinds.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[1] > y[1]; });
        long long total = 0;
        for (const vector<long long>& kind : kinds) {
            long long take = min(kind[0], cap);
            total += take * kind[1];
            cap -= take;
            if (cap == 0) break;
        }
        cout << total << "\n";`,
      java: r`
        long[] keys = new long[(int) t];
        for (int i = 0; i < t; i++) keys[i] = kinds[i][1] * 100000L + i;
        Arrays.sort(keys);
        long total = 0;
        for (int p = (int) t - 1; p >= 0 && cap > 0; p--) {
            int i = (int) (keys[p] % 100000L);
            long take = Math.min(kinds[i][0], cap);
            total += take * kinds[i][1];
            cap -= take;
        }
        System.out.println(total);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The kinds are sorted by the units per box in descending order; whole kinds are loaded while the truck has room, and the last kind partly. The total number of loaded units is the answer.'], complexity: 'Time O(t log t), space O(t).' },
    solve(input) {
      const rs = rows(input); const [t, cap0] = nums(rs[0]); let cap = cap0; const boxes = []; for (let i = 1; i <= t; i++) { const [c, u] = nums(rs[i]); for (let k = 0; k < 1; k++) boxes.push([u, c]); } // by units value: count how many boxes there are of each value, from the value 10000 down to 1
      const byValue = new Array(10001).fill(0); for (const [u, c] of boxes) byValue[u] += c; let total = 0; for (let u = 10000; u >= 1 && cap > 0; u--) { const take = Math.min(byValue[u], cap); total += take * u; cap -= take; } return String(total);
    },
    tests() {
      const g = rng(3007); const out = ['3 4\n1 3\n2 2\n3 1\n', '2 10\n5 10\n3 7\n', '1 1\n5 5\n', '1 100\n3 4\n'];
      const make = (t, cap, ch, uh) => `${t} ${cap}\n${many(t, () => `${randInt(g, 1, ch)} ${randInt(g, 1, uh)}`).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const [t, cap] = nums(rs[0]); const all = []; for (let i = 1; i <= t; i++) { const [c, u] = nums(rs[i]); for (let k = 0; k < c; k++) all.push(u); } all.sort((x, y) => y - x); return String(all.slice(0, cap).reduce((s, x) => s + x, 0)); };
      crossCheck(() => make(randInt(g, 1, 5), randInt(g, 1, 20), 4, 9), (i) => this.solve(i), brute, 400);
      for (const [t, cap, ch, uh] of [[10, 50, 20, 100], [100, 1000, 100, 1000], [1000, 100000, 1000, 10000], [50000, 1000000000, 10000, 10000], [50000, 100000000, 10000, 10000], [50000, 1000000, 10000, 10000], [50000, 1, 10000, 10000], [50000, 1000000000, 1, 1], [49999, 123456789, 10000, 10000]]) out.push(make(t, cap, ch, uh));
      out.push(`50000 1000000000\n${many(50000, () => '10000 10000').join('\n')}\n`, `50000 250000000\n${many(50000, (i) => `10000 ${1 + (i % 10000)}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of sticks.', 'The second line has `n` numbers: the lengths of the sticks.'],
    constraints: ['1 <= n <= 50000', '1 <= each length <= 10^9'],
    slug: 'largest-triangle-perimeter',
    title: 'The Largest Triangle That Can Be Made From Three Sticks',
    tags: ['greedy', 'sorting', 'geometry'],
    concept: {
      title: 'Sort the sticks: if three sticks cannot make a triangle, the biggest one can be dropped',
      body: [
        'Choose three of the given sticks to make a triangle with a **positive area**, and make the **perimeter** (the sum of the three lengths) as large as possible. Three lengths `a <= b <= c` make a triangle exactly when the two shorter ones are together **longer** than the longest: `a + b > c`. If no three sticks work, the answer is 0. For the sticks `2 1 2` the answer is 5; for `1 2 1` it is 0 (1 + 1 = 2 is not enough).',
        'Sort the sticks from the **longest** to the shortest and look at three **neighbours** `x >= y >= z` in this order. If `y + z > x`, they make a triangle, and it is the best one: any other triangle uses sticks that are not longer in the sorted order, so its perimeter is not bigger. If `y + z <= x`, then `x` is too long for any pair of shorter sticks (the biggest sum of two sticks smaller than `x` is `y + z`), so `x` is useless in any triangle: **drop it** and continue with the next three.',
        { code: 'a.sort(reverse=True)\nanswer = 0\nfor i in range(len(a) - 2):\n    if a[i + 1] + a[i + 2] > a[i]:\n        answer = a[i] + a[i + 1] + a[i + 2]\n        break\nprint(answer)' },
        'Only neighbours need to be checked, thanks to this argument: for a fixed longest stick, the best pair of the other two is the pair just after it in the sorted order. Sorting costs O(n log n) and the scan O(n). The perimeter can reach 3 * 10^9, so 64-bit numbers are used.'
      ]
    },
    statement: ['`n` sticks with the given lengths are available. Choose three of them that form a triangle with a positive area, so that the perimeter is as large as possible. Print the largest perimeter, or 0 if no triangle can be made.'],
    outputFormat: ['Print the largest perimeter, or 0.'],
    examples: [{ input: '3\n2 1 2\n', note: 'The sticks 2, 1, 2 make a triangle: 5.' }, { input: '3\n1 2 1\n', note: '1 + 1 is not longer than 2: 0.' }],
    hints: ['Three lengths a <= b <= c form a triangle exactly when a + b > c.', 'Sort in descending order and test three neighbours.', 'The first triple that works gives the largest perimeter.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        a.sort(reverse=True)
        answer = 0
        for i in range(n - 2):
            if a[i + 1] + a[i + 2] > a[i]:
                answer = a[i] + a[i + 1] + a[i + 2]
                break
        print(answer)`,
      cpp: r`
        sort(a.begin(), a.end(), greater<long long>());
        long long answer = 0;
        for (long long i = 0; i + 2 < n; i++) {
            if (a[i + 1] + a[i + 2] > a[i]) {
                answer = a[i] + a[i + 1] + a[i + 2];
                break;
            }
        }
        cout << answer << "\n";`,
      java: r`
        Arrays.sort(a);
        long answer = 0;
        for (int i = (int) n - 1; i >= 2; i--) {
            if (a[i - 1] + a[i - 2] > a[i]) {
                answer = a[i] + a[i - 1] + a[i - 2];
                break;
            }
        }
        System.out.println(answer);`,
      includes: ['<algorithm>', '<functional>']
    },
    solution: { explanation: ['The lengths are sorted in descending order; for three neighbours x >= y >= z the triple makes a triangle when y + z > x, and the first such triple is the best, because a stick that is too long for its two neighbours is too long for any pair of shorter sticks.'], complexity: 'Time O(n log n), space O(1) extra.' },
    solve(input) {
      const a = nums(rows(input)[1]); const n = a.length; let best = 0; if (n <= 150) { for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) { const [x, y, z] = [a[i], a[j], a[k]].sort((p, q) => p - q); if (x + y > z) best = Math.max(best, x + y + z); } return String(best); }
      const s = [...a].sort((p, q) => p - q); for (let i = n - 1; i >= 2; i--) if (s[i - 1] + s[i - 2] > s[i]) return String(s[i] + s[i - 1] + s[i - 2]); return '0';
    },
    tests() {
      const g = rng(3008); const out = ['3\n2 1 2\n', '3\n1 2 1\n', '3\n3 3 3\n', '4\n1 1 1 10\n'];
      const brute = (input) => { const a = nums(rows(input)[1]); let best = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) for (let k = j + 1; k < a.length; k++) { const [x, y, z] = [a[i], a[j], a[k]].sort((p, q) => p - q); if (x + y > z) best = Math.max(best, x + y + z); } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 9); return list(n, randArray(g, n, 1, 15)); }, (i) => this.solve(i), brute, 500);
      for (const [n, hi] of [[10, 20], [100, 100], [1000, 1000000], [50000, 1000000000], [50000, 1000], [50000, 5], [49999, 1000000000]]) out.push(list(n, randArray(g, n, 1, hi)));
      // the lengths of a growing sequence like Fibonacci cannot make a triangle at all; add a few good ones at the end
      const fib = [1, 1]; while (fib.length < 44) fib.push(fib[fib.length - 1] + fib[fib.length - 2]); out.push(list(44, fib), list(46, [...fib, 5, 6]), list(50000, many(50000, (i) => 1 << Math.min(i, 29))), list(50000, many(50000, (i) => 1000000000 - i)), list(50000, new Array(50000).fill(1)));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 50000', '1 <= each number <= 10^9'],
    slug: 'moves-to-equalize',
    title: 'The Fewest Moves to Make All the Numbers Equal',
    tags: ['greedy', 'median', 'sorting'],
    concept: {
      title: 'The best meeting point of numbers on a line is the median',
      body: [
        'In one move you may **add 1 to a number or subtract 1 from it**. What is the smallest number of moves that makes all the numbers in a list **equal**? For `1 2 3` the answer is 2 (change both 1 and 3 to 2). For `1 10 2 9` it is 16.',
        'If all the numbers become the value `x`, the moves needed are `|a[0] - x| + |a[1] - x| + ...`. Think of the numbers as people standing on a line who must all walk to the same house; the sum of the distances is smallest at the **median**. Reason: if `x` has more numbers on its left than on its right (or the same number), moving `x` one step to the right makes the sum smaller or equal when there are more numbers on the right, and the other way round. The point where the two sides are balanced is the median. So **sort the numbers, take the middle one, and add up the distances to it**.',
        { code: 'a.sort()\nmedian = a[len(a) // 2]\nprint(sum(abs(x - median) for x in a))' },
        'For an even count any value between the two middle numbers gives the same sum, so either middle number works. The sum can reach 5 * 10^13, so 64-bit numbers are necessary. Another way to compute the same sum without the median: pair the smallest with the largest, the second smallest with the second largest, and add the distances of the pairs.'
      ]
    },
    statement: ['A list of `n` integers is given. In one move you can increase or decrease one number by 1. Print the smallest number of moves after which all the numbers are equal.'],
    outputFormat: ['Print the smallest number of moves.'],
    examples: [{ input: '3\n1 2 3\n', note: 'Change 1 to 2 and 3 to 2: 2 moves.' }, { input: '4\n1 10 2 9\n', note: 'All numbers can become 9 (or 2): 8 + 1 + 7 + 0 = 16 moves.' }],
    hints: ['The sum of the distances to a point is smallest at the median.', 'Sort the numbers and take the middle one.', 'Add up the absolute differences; use 64-bit numbers.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        a.sort()
        median = a[n // 2]
        print(sum(abs(x - median) for x in a))`,
      cpp: r`
        sort(a.begin(), a.end());
        long long median = a[n / 2], total = 0;
        for (long long x : a) total += llabs(x - median);
        cout << total << "\n";`,
      java: r`
        Arrays.sort(a);
        long median = a[(int) n / 2], total = 0;
        for (int i = 0; i < n; i++) total += Math.abs(a[i] - median);
        System.out.println(total);`,
      includes: ['<algorithm>', '<cstdlib>']
    },
    solution: { explanation: ['The sum of the distances to a common value is smallest at the median, so the numbers are sorted, the middle one is taken and the absolute differences to it are added up.'], complexity: 'Time O(n log n), space O(1) extra.' },
    solve(input) {
      const a = nums(rows(input)[1]).sort((x, y) => x - y); let total = 0; for (let i = 0, j = a.length - 1; i < j; i++, j--) total += a[j] - a[i]; return String(total); // pair the smallest with the largest
    },
    tests() {
      const g = rng(3009); const out = ['3\n1 2 3\n', '4\n1 10 2 9\n', '1\n5\n', '2\n1 1000000000\n', '3\n7 7 7\n'];
      const brute = (input) => { const a = nums(rows(input)[1]); let best = Infinity; for (let x = Math.min(...a); x <= Math.max(...a); x++) best = Math.min(best, a.reduce((s, v) => s + Math.abs(v - x), 0)); return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 9); return list(n, randArray(g, n, 1, 30)); }, (i) => this.solve(i), brute, 500);
      for (const [n, hi] of [[10, 20], [100, 1000], [1000, 1000000], [50000, 1000000000], [50000, 10], [50000, 1000000000], [49999, 1000000000]]) out.push(list(n, randArray(g, n, 1, hi)));
      out.push(list(50000, many(50000, (i) => (i % 2 ? 1 : 1000000000))), list(50000, many(50000, (i) => i + 1)), list(50000, new Array(50000).fill(1000000000)), list(49999, many(49999, (i) => (i < 25000 ? 1 : 1000000000))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['One line with a string of the letters `L` and `R`.'],
    constraints: ['2 <= length <= 100000', 'The string contains the same number of `L` and `R`.'],
    slug: 'cut-balanced-strings',
    title: 'Cut the String Into the Most Balanced Pieces',
    tags: ['greedy', 'string', 'counting'],
    concept: {
      title: 'Cut as soon as the pieces are balanced: the running balance returns to zero',
      body: [
        'A string of `L` and `R` is *balanced* if it has the same number of `L` and `R`. The given string is balanced. Cut it into **consecutive pieces** so that every piece is balanced, and make the **number of pieces as large as possible**. For `RLRRLLRLRL` the answer is 4: `RL`, `RRLL`, `RL`, `RL`.',
        'Walk along the string and keep the **balance**: add 1 for an `R` and subtract 1 for an `L`. A prefix is balanced exactly when the balance is 0. The greedy rule: **cut every time the balance becomes 0**, because a balanced piece that ends here is as short as possible, and a shorter piece leaves more room for further pieces. The number of cuts (the places where the balance is zero) is the number of pieces; the last zero is at the end of the string.',
        { code: 'balance = pieces = 0\nfor c in s:\n    balance += 1 if c == "R" else -1\n    if balance == 0:\n        pieces += 1\nprint(pieces)' },
        'Why is this the maximum? Every cut position of any valid division is a position where the prefix balance is 0, and our greedy uses **all** such positions; so it cuts at least as often as any other division. The scan takes O(n) time and O(1) memory.'
      ]
    },
    statement: ['A string of `L` and `R` with the same number of both letters is given. Cut it into consecutive pieces so that every piece has the same number of `L` and `R`. Print the largest possible number of pieces.'],
    outputFormat: ['Print the largest number of pieces.'],
    examples: [{ input: 'RLRRLLRLRL\n', note: 'RL, RRLL, RL, RL: 4 pieces.' }, { input: 'LLLLRRRR\n', note: 'Only the whole string is balanced: 1.' }],
    hints: ['Keep a balance: +1 for R, -1 for L.', 'Every position where the balance is 0 is a possible cut.', 'Count them; the last one is the end of the string.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        balance = pieces = 0
        for c in s:
            balance += 1 if c == "R" else -1
            if balance == 0:
                pieces += 1
        print(pieces)`,
      cpp: r`
        long long balance = 0, pieces = 0;
        for (char c : s) {
            balance += (c == 'R') ? 1 : -1;
            if (balance == 0) pieces++;
        }
        cout << pieces << "\n";`,
      java: r`
        long balance = 0, pieces = 0;
        for (int i = 0; i < s.length(); i++) {
            balance += (s.charAt(i) == 'R') ? 1 : -1;
            if (balance == 0) pieces++;
        }
        System.out.println(pieces);`
    },
    solution: { explanation: ['The balance (+1 for R, -1 for L) is tracked; every position where it is 0 ends a balanced piece, and cutting at all such positions gives the largest number of pieces.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const s = rows(input)[0]; const n = s.length; const pre = [0]; for (const c of s) pre.push(pre[pre.length - 1] + (c === 'R' ? 1 : -1)); // the number of prefixes with a zero balance
      return String(pre.slice(1).filter((x) => x === 0).length);
    },
    tests() {
      const g = rng(3010); const out = ['RLRRLLRLRL\n', 'LLLLRRRR\n', 'RL\n', 'LR\n', 'RLRLRL\n'];
      const balanced = (pairs, mode) => { const chars = [...'R'.repeat(pairs), ...'L'.repeat(pairs)]; if (mode === 'shuffle') return shuffle(g, chars).join(''); if (mode === 'zigzag') return many(pairs, (i) => (g() < 0.5 ? 'RL' : 'LR')).join(''); return chars.join(''); };
      const brute = (input) => { const s = rows(input)[0]; const n = s.length; let best = 1; for (let mask = 0; mask < (1 << (n - 1)); mask++) { let ok = true, pieces = 1, bal = 0; for (let i = 0; i < n; i++) { bal += s[i] === 'R' ? 1 : -1; if (i === n - 1 || (mask >> i & 1)) { if (bal !== 0) { ok = false; break; } if (i < n - 1) pieces++; } } if (ok) best = Math.max(best, pieces); } return String(best); };
      crossCheck(() => balanced(randInt(g, 1, 6), 'shuffle') + '\n', (i) => this.solve(i), brute, 400);
      for (const [pairs, mode] of [[5, 'shuffle'], [50, 'shuffle'], [500, 'shuffle'], [50000, 'shuffle'], [50000, 'zigzag'], [50000, 'sorted'], [49999, 'shuffle'], [1, 'sorted']]) out.push(balanced(pairs, mode) + '\n');
      out.push('RL'.repeat(50000) + '\n', 'LR'.repeat(50000) + '\n', 'R'.repeat(50000) + 'L'.repeat(50000) + '\n', 'RRLL'.repeat(25000) + '\n');
      return out;
    }
  }
];
