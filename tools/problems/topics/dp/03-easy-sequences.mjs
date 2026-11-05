import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const easy = { difficulty: 'easy' };
const MOD = 1000000007;
const list = (n, a) => `${n}\n${a.join(' ')}\n`;
const arrOf = (input) => { const rs = rows(input); return nums(rs[1]); };

export default [
  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 100000', '1 <= each number <= 10^9'],
    slug: 'alternating-subsequence-sum',
    title: 'The Biggest Alternating Sum of a Subsequence',
    tags: ['dp', 'subsequence', 'two-states'],
    concept: {
      title: 'Two states: the next chosen number will be added, or it will be subtracted',
      body: [
        'Choose some of the numbers of a list, keeping their order (a *subsequence*). The **alternating sum** of the chosen numbers is the first one minus the second plus the third minus the fourth, and so on. Find the largest alternating sum. For `4 2 5 3` the subsequence `4, 2, 5` gives 4 - 2 + 5 = 7, which is the best.',
        'Walk along the list and decide for every number: take it or leave it. What matters about the past is only **how many numbers were taken so far, even or odd**, because that decides the sign of the next one. So keep two values: `ev` is the best alternating sum when an **even** number of values has been taken (the next one will be added; at the start it is 0, the empty choice) and `od` is the best when an **odd** number has been taken (the next one will be subtracted; at the start there is no such choice, so it is "minus infinity"). For a new number `x`: taking it after an even count gives `ev + x` for the odd state, and taking it after an odd count gives `od - x` for the even state; leaving it changes nothing.',
        { code: 'NEG = -10 ** 18                          # "impossible"\nev, od = 0, NEG\nfor x in a:\n    ev, od = max(ev, od - x), max(od, ev + x)     # both new values use the old ones\nprint(max(ev, od))' },
        'The two values are updated **together**: in Python the tuple assignment evaluates the right side first, in C++ and Java use temporary variables. Every number is positive, so the answer ends with the odd state, but taking the maximum of both is the safe way. This is a DP with a state of two numbers; the time is O(n) and the memory O(1). The sum can reach 10^14, so use 64-bit numbers.'
      ]
    },
    statement: ['A list of `n` positive numbers is given. Choose some of them (at least one), keeping their order, so that the alternating sum (first - second + third - ...) of the chosen numbers is as large as possible. Print that largest alternating sum.'],
    outputFormat: ['Print the largest alternating sum.'],
    examples: [{ input: '4\n4 2 5 3\n', note: 'The subsequence 4, 2, 5 gives 4 - 2 + 5 = 7.' }, { input: '5\n5 6 7 8 9\n', note: 'Take only the 9: 9.' }],
    hints: ['Keep two values: the best sum when an even number of values has been taken, and when an odd number has been taken.', 'A new number x is added after an even count and subtracted after an odd count.', 'Update both values at the same time, using the old ones.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        NEG = -10 ** 18
        ev, od = 0, NEG
        for x in a:
            ev, od = max(ev, od - x), max(od, ev + x)
        print(max(ev, od))`,
      cpp: r`
        long long ev = 0, od = -1000000000000000000LL;
        for (long long x : a) {
            long long newEv = max(ev, od - x);
            long long newOd = max(od, ev + x);
            ev = newEv;
            od = newOd;
        }
        cout << max(ev, od) << "\n";`,
      java: r`
        long ev = 0, od = -1000000000000000000L;
        for (int i = 0; i < n; i++) {
            long newEv = Math.max(ev, od - a[i]);
            long newOd = Math.max(od, ev + a[i]);
            ev = newEv;
            od = newOd;
        }
        System.out.println(Math.max(ev, od));`
    },
    solution: { explanation: ['Two values are kept: the best alternating sum with an even number of chosen values (the next one is added) and with an odd number (the next one is subtracted). Each number either extends one of them with the right sign or is left out; the answer is the larger value at the end.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const a = arrOf(input); // a table over (position, parity) written as two arrays
      const n = a.length; const ev = new Array(n + 1).fill(0); const od = new Array(n + 1).fill(-Infinity); for (let i = 0; i < n; i++) { ev[i + 1] = Math.max(ev[i], od[i] - a[i]); od[i + 1] = Math.max(od[i], ev[i] + a[i]); } return String(Math.max(ev[n], od[n]));
    },
    tests() {
      const g = rng(2021); const out = ['4\n4 2 5 3\n', '5\n5 6 7 8 9\n', '1\n7\n', '2\n1 1000000000\n', '2\n1000000000 1\n'];
      const brute = (input) => { const a = arrOf(input); const n = a.length; let best = -Infinity; for (let mask = 1; mask < (1 << n); mask++) { let sum = 0, sign = 1; for (let i = 0; i < n; i++) if (mask >> i & 1) { sum += sign * a[i]; sign = -sign; } best = Math.max(best, sum); } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 11); return list(n, randArray(g, n, 1, 20)); }, (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[10, 100], [100, 1000], [1000, 1000000], [10000, 1000000000], [100000, 1000000000], [100000, 100], [100000, 2]]) out.push(list(n, randArray(g, n, 1, hi)));
      out.push(list(100000, many(100000, (i) => i + 1)), list(100000, many(100000, (i) => 100000 - i)), list(50000, many(50000, (i) => (i % 2 ? 1 : 1000000000))), list(100000, new Array(100000).fill(7)));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 100000', '-10^9 <= each number <= 10^9'],
    slug: 'arithmetic-slices-count',
    title: 'Count the Stretches With a Constant Step',
    tags: ['dp', 'array', 'arithmetic-progression'],
    concept: {
      title: 'A stretch that ends here is a stretch that ended one place earlier, made one longer',
      body: [
        'In a list of numbers, call a stretch of **at least three consecutive numbers** *arithmetic* if the difference between neighbours is the same all the way, such as `3 5 7 9` or `10 7 4`. How many arithmetic stretches does the list contain (stretches in different places are counted separately, even if they overlap)? In `1 2 3 4` there are 3: `1 2 3`, `2 3 4` and `1 2 3 4`.',
        'Let `run(i)` be the number of arithmetic stretches that **end** at the position `i`. If `a[i] - a[i-1]` equals `a[i-1] - a[i-2]`, then every stretch that ended at `i - 1` can be made one number longer, and in addition the new three-number stretch `a[i-2], a[i-1], a[i]` appears: **`run(i) = run(i - 1) + 1`**. Otherwise no stretch can end at `i`: `run(i) = 0`. The answer is the sum of all `run(i)`.',
        { code: 'total = 0\nrun = 0\nfor i in range(2, n):\n    if a[i] - a[i - 1] == a[i - 1] - a[i - 2]:\n        run += 1                  # one more stretch than the one that ended at i - 1\n        total += run\n    else:\n        run = 0\nprint(total)' },
        'Counting every stretch by itself would be O(n^3) (or O(n^2) with care); the DP gives O(n) time and O(1) memory. A list of 200 000 equal numbers has about 2 * 10^10 stretches, so the answer needs 64 bits. The trick "how many things end here" is the standard way to count subarrays with a property that can only be extended.'
      ]
    },
    statement: ['A list of `n` numbers is given. Count the stretches of at least three consecutive numbers in which the difference between every two neighbours is the same. Overlapping stretches are all counted.'],
    outputFormat: ['Print the number of such stretches.'],
    examples: [{ input: '4\n1 2 3 4\n', note: 'The stretches are 1 2 3, 2 3 4 and 1 2 3 4: 3.' }, { input: '2\n5 9\n', note: 'Too short: 0.' }],
    hints: ['Let run(i) be the number of such stretches that end at position i.', 'If the last two differences are equal, run(i) = run(i - 1) + 1; otherwise run(i) = 0.', 'Add all the run values; use 64-bit numbers.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        total = 0
        run = 0
        for i in range(2, n):
            if a[i] - a[i - 1] == a[i - 1] - a[i - 2]:
                run += 1
                total += run
            else:
                run = 0
        print(total)`,
      cpp: r`
        long long total = 0, run = 0;
        for (long long i = 2; i < n; i++) {
            if (a[i] - a[i - 1] == a[i - 1] - a[i - 2]) {
                run++;
                total += run;
            } else {
                run = 0;
            }
        }
        cout << total << "\n";`,
      java: r`
        long total = 0, run = 0;
        for (int i = 2; i < n; i++) {
            if (a[i] - a[i - 1] == a[i - 1] - a[i - 2]) {
                run++;
                total += run;
            } else {
                run = 0;
            }
        }
        System.out.println(total);`
    },
    solution: { explanation: ['run(i), the number of arithmetic stretches that end at i, is run(i - 1) + 1 when the last two differences are equal and 0 otherwise; the answer is the sum of all run values.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; // count by maximal blocks of equal differences: a block of d equal differences holds d * (d - 1) / 2 stretches
      let total = 0; let i = 1; while (i < n) { let j = i; while (j + 1 < n && a[j + 1] - a[j] === a[i] - a[i - 1]) j++; const d = j - i + 1; total += d * (d - 1) / 2; i = j + 1; } return String(total);
    },
    tests() {
      const g = rng(2022); const out = ['4\n1 2 3 4\n', '2\n5 9\n', '1\n3\n', '3\n1 2 4\n', '3\n-5 0 5\n'];
      const brute = (input) => { const a = arrOf(input); const n = a.length; let count = 0; for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) { let ok = true; for (let k = i + 2; k <= j; k++) if (a[k] - a[k - 1] !== a[i + 1] - a[i]) { ok = false; break; } if (ok) count++; } return String(count); };
      crossCheck(() => { const n = randInt(g, 1, 12); return list(n, randArray(g, n, 0, 3)); }, (i) => this.solve(i), brute, 300);
      const walk = (n, step, noise) => { const a = []; let x = 0; for (let i = 0; i < n; i++) { a.push(x); x += g() < noise ? randInt(g, -3, 3) : step; } return a; };
      for (const [n, hi] of [[10, 3], [100, 5], [1000, 3], [50000, 3], [20000, 1000000000]]) out.push(list(n, randArray(g, n, -hi, hi)));
      out.push(list(100000, new Array(100000).fill(5)), list(100000, many(100000, (i) => i)), list(100000, many(100000, (i) => 1000000000 - 9000 * i)), list(100000, walk(100000, 1, 0.01)), list(100000, walk(100000, 2, 0.001)), list(100000, walk(100000, 7, 0.1)), list(100000, many(100000, (i) => (i % 2 ? 1 : 0))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of squares.', 'The second line has `n` numbers: `a[i]` is the longest hop you may make from the square `i`.'],
    constraints: ['1 <= n <= 100000', '0 <= each number <= 100000'],
    slug: 'can-reach-the-end',
    title: 'Can You Hop to the Last Square?',
    tags: ['dp', 'jump-game', 'reachability'],
    concept: {
      title: 'Walk from left to right and remember the farthest square you can still reach',
      body: [
        'You stand on the first of `n` squares in a row. From the square `i` you may hop **any distance from 1 up to `a[i]`** to the right (a square with `a[i] = 0` is a dead end). Can you reach the last square? For `2 3 1 1 4` yes: hop 1 square, then 3 squares to the end. For `3 2 1 0 4` no: every route gets stuck on the square with the 0.',
        'Let `reachable(i)` be true if some route ends on square `i`. The square `i` is reachable if some earlier reachable square `j` can hop far enough: `j + a[j] >= i`. Checking all earlier squares is O(n^2). But we only need **the farthest square that is reachable by any hop so far**: call it `far`. All squares up to `far` are reachable (squares in between can be hopped over to by shorter hops), so the square `i` is reachable exactly when `i <= far`, and then it extends the reach: `far = max(far, i + a[i])`.',
        { code: 'far = 0                                   # the farthest square reachable so far\nok = True\nfor i in range(n):\n    if i > far:                           # square i cannot be reached: we are stuck\n        ok = False\n        break\n    far = max(far, i + a[i])\nprint("yes" if ok else "no")' },
        'The key is that reachability is **monotone**: reachable squares fill a block from the start, with no gaps, because a hop of any shorter length is also allowed. The whole table of "reachable or not" shrinks to one number, and the time is O(n), the memory O(1). If the loop finishes without getting stuck, the last square is reachable.'
      ]
    },
    statement: ['There are `n` squares in a row. From the square `i` (counting from 0) you may hop to the right by any distance from 1 to `a[i]` squares (not at all if `a[i] = 0`). You start on the square 0. Print `yes` if you can reach the square `n - 1`, otherwise print `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '5\n2 3 1 1 4\n', note: 'Hop 1 square, then 3 squares: yes.' }, { input: '5\n3 2 1 0 4\n', note: 'Every route ends on the square 3, where the hop length is 0: no.' }],
    hints: ['Keep the farthest square that can be reached so far.', 'If the current square is farther than that, you are stuck.', 'Otherwise the farthest reach becomes max(far, i + a[i]).'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        far = 0
        ok = True
        for i in range(n):
            if i > far:
                ok = False
                break
            far = max(far, i + a[i])
        print("yes" if ok else "no")`,
      cpp: r`
        long long far = 0;
        bool ok = true;
        for (long long i = 0; i < n; i++) {
            if (i > far) {
                ok = false;
                break;
            }
            far = max(far, i + a[i]);
        }
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        long far = 0;
        boolean ok = true;
        for (int i = 0; i < n; i++) {
            if (i > far) {
                ok = false;
                break;
            }
            far = Math.max(far, i + a[i]);
        }
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['The squares that can be reached form a block from the start, so only the farthest reachable square is kept: if the current square lies beyond it we are stuck, otherwise the reach grows to max(far, i + a[i]). Reaching the end of the loop means the last square is reachable.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; const reach = new Array(n).fill(false); reach[0] = true;
      if (n <= 3000) { for (let i = 0; i < n; i++) if (reach[i]) for (let j = i + 1; j <= Math.min(n - 1, i + a[i]); j++) reach[j] = true; return reach[n - 1] ? 'yes' : 'no'; } // mark every square that a hop can land on
      let far = 0; for (let i = 0; i < n; i++) { if (i > far) return 'no'; far = Math.max(far, i + a[i]); } return 'yes';
    },
    tests() {
      const g = rng(2023); const out = ['5\n2 3 1 1 4\n', '5\n3 2 1 0 4\n', '1\n0\n', '2\n0 5\n', '2\n1 0\n'];
      const brute = (input) => { const a = arrOf(input); const n = a.length; const memo = new Map(); const go = (i) => { if (i === n - 1) return true; if (memo.has(i)) return memo.get(i); let ok = false; for (let d = 1; d <= a[i] && !ok; d++) if (i + d < n && go(i + d)) ok = true; memo.set(i, ok); return ok; }; return go(0) ? 'yes' : 'no'; };
      crossCheck(() => { const n = randInt(g, 1, 12); return list(n, randArray(g, n, 0, 3)); }, (i) => this.solve(i), brute, 400);
      const sparse = (n, pZero, hi) => many(n, () => (g() < pZero ? 0 : randInt(g, 1, hi)));
      for (const [n, p, hi] of [[10, 0.3, 3], [100, 0.3, 4], [1000, 0.5, 5], [50000, 0.7, 10], [100000, 0.6, 3], [100000, 0.9, 100000], [100000, 0.5, 2], [100000, 0.0, 1], [99999, 0.3, 4]]) out.push(list(n, sparse(n, p, hi)));
      out.push(list(100000, many(100000, (i) => (i === 50000 ? 0 : 100000))), list(100000, many(100000, (i) => (i === 99999 ? 0 : 1))), list(100000, many(100000, (i) => (i === 50000 ? 0 : 1))), list(100000, new Array(100000).fill(0)), list(100000, many(100000, (i) => (i === 0 ? 100000 : 0))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `q`: the number of questions.', 'The second line has `q` numbers `n`.'],
    constraints: ['1 <= q <= 20000', '1 <= n <= 1000000'],
    slug: 'steps-down-to-one',
    title: 'The Fewest Steps From n Down to 1',
    tags: ['dp', 'min-steps', 'queries'],
    concept: {
      title: 'The answer for n comes from the answers for smaller numbers: n - 1, n / 2 and n / 3',
      body: [
        'Start with a number `n`. In one step you may **subtract 1**, or **divide by 2** (if it is even), or **divide by 3** (if it is divisible by 3). What is the smallest number of steps to reach 1? For `10` the best is `10 -> 9 -> 3 -> 1`: 3 steps. A greedy choice (always divide when you can) does not always win, so we compare all options.',
        'Let `steps(v)` be the smallest number of steps from `v` to 1, with `steps(1) = 0`. The first step goes to `v - 1`, to `v / 2` (if even) or to `v / 3` (if divisible by 3), and then the rest is the best way from there: **`steps(v) = 1 + min(steps(v - 1), steps(v / 2), steps(v / 3))`** (using only the options that exist). All three targets are smaller than `v`, so the table is filled from 2 up to the biggest question, once.',
        { code: 'limit = max(queries)\nsteps = [0] * (limit + 1)\nfor v in range(2, limit + 1):\n    best = steps[v - 1]\n    if v % 2 == 0: best = min(best, steps[v // 2])\n    if v % 3 == 0: best = min(best, steps[v // 3])\n    steps[v] = best + 1\nprint(*[steps[n] for n in queries])' },
        'Why not recursion with memory (a top-down memo)? For `n` up to a million the recursion would be a million levels deep, which overflows the stack in Python and Java. The bottom-up table has no recursion at all. The time is O(limit + q) and the memory O(limit). Building one table and answering all questions from it is the pattern to remember.'
      ]
    },
    statement: ['In one step a number can be decreased by 1, or divided by 2 (if it is even), or divided by 3 (if it is divisible by 3). For each of the `q` given numbers `n`, print the smallest number of steps that turns it into 1.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces: the answers in the order of the questions.'],
    examples: [{ input: '4\n1 2 10 15\n', note: '1 needs no step; 2 -> 1 takes 1 step; 10 -> 9 -> 3 -> 1 takes 3 steps; 15 -> 5 -> 4 -> 2 -> 1 takes 4 steps.' }],
    hints: ['Let steps(v) be the answer for v; steps(1) = 0.', 'steps(v) = 1 + the smallest of steps(v - 1), steps(v / 2) (if even) and steps(v / 3) (if divisible).', 'Fill one table up to the largest question and answer all questions from it.'],
    program: {
      io: ['q:int', 'queries:int[q]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        limit = max(queries)
        steps = [0] * (limit + 1)
        for v in range(2, limit + 1):
            best = steps[v - 1]
            if v % 2 == 0 and steps[v // 2] < best:
                best = steps[v // 2]
            if v % 3 == 0 and steps[v // 3] < best:
                best = steps[v // 3]
            steps[v] = best + 1
        print(*[steps[n] for n in queries])`,
      cpp: r`
        long long limit = *max_element(queries.begin(), queries.end());
        vector<int> steps(limit + 1, 0);
        for (long long v = 2; v <= limit; v++) {
            int best = steps[v - 1];
            if (v % 2 == 0) best = min(best, steps[v / 2]);
            if (v % 3 == 0) best = min(best, steps[v / 3]);
            steps[v] = best + 1;
        }
        for (long long i = 0; i < q; i++) cout << (i ? " " : "") << steps[queries[i]];
        cout << "\n";`,
      java: r`
        int limit = 0;
        for (long x : queries) limit = Math.max(limit, (int) x);
        int[] steps = new int[limit + 1];
        for (int v = 2; v <= limit; v++) {
            int best = steps[v - 1];
            if (v % 2 == 0) best = Math.min(best, steps[v / 2]);
            if (v % 3 == 0) best = Math.min(best, steps[v / 3]);
            steps[v] = best + 1;
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) out.append(i > 0 ? " " : "").append(steps[(int) queries[i]]);
        System.out.println(out);`
    },
    solution: { explanation: ['steps(v) = 1 + the smallest of steps(v - 1), steps(v / 2) and steps(v / 3) (only the possible ones), with steps(1) = 0, filled from 2 up to the largest question; every question is a lookup.'], complexity: 'Time O(M + q) where M is the largest n, space O(M).' },
    solve(input) {
      const rs = rows(input); const ns = nums(rs[1]); // a breadth-first search over the numbers from 1 upwards: every number reaches the numbers 1 larger, 2 times and 3 times larger
      const limit = Math.max(...ns); const dist = new Int32Array(limit + 1).fill(-1); dist[1] = 0; let layer = [1]; while (layer.length) { const next = []; for (const v of layer) for (const w of [v + 1, v * 2, v * 3]) if (w <= limit && dist[w] < 0) { dist[w] = dist[v] + 1; next.push(w); } layer = next; } return ns.map((n) => dist[n]).join(' ');
    },
    tests() {
      const g = rng(2024); const out = ['4\n1 2 10 15\n', '1\n1\n', '1\n1000000\n', '3\n3 6 7\n'];
      const brute = (input) => { const rs = rows(input); const ns = nums(rs[1]); const memo = new Map(); const go = (v) => { if (v === 1) return 0; if (memo.has(v)) return memo.get(v); let best = go(v - 1); if (v % 2 === 0) best = Math.min(best, go(v / 2)); if (v % 3 === 0) best = Math.min(best, go(v / 3)); memo.set(v, best + 1); return best + 1; }; return ns.map(go).join(' '); };
      crossCheck(() => { const q = randInt(g, 1, 6); return `${q}\n${randArray(g, q, 1, 400).join(' ')}\n`; }, (i) => this.solve(i), brute, 200);
      const make = (q, hi) => `${q}\n${randArray(g, q, 1, hi).join(' ')}\n`;
      for (const [q, hi] of [[10, 100], [100, 1000], [1000, 100000], [20000, 1000000], [20000, 1000000], [20000, 1000], [20000, 999999]]) out.push(make(q, hi));
      out.push(`20000\n${many(20000, (i) => 1000000 - i).join(' ')}\n`, `20000\n${many(20000, (i) => i + 1).join(' ')}\n`, `20000\n${many(20000, (i) => [1000000, 999999, 531441, 524288][i % 4]).join(' ')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of sights.', 'The second line has `n` numbers: the value of each sight, in the order along the road.'],
    constraints: ['2 <= n <= 100000', '1 <= each value <= 10^9'],
    slug: 'best-sightseeing-pair',
    title: 'The Best Pair of Sights Along the Road',
    tags: ['dp', 'array', 'best-so-far'],
    concept: {
      title: 'Split the score into a part that depends on i and a part that depends on j',
      body: [
        'Along a road there are `n` sights, the sight `i` is worth `a[i]` and stands at the distance `i` from the start. A visitor picks two sights `i < j`, and the score of the pair is the sum of their values **minus the distance between them**: `a[i] + a[j] - (j - i)`. Find the best score. For the values `8 1 5 2 6` the pair at the positions 0 and 2 scores 8 + 5 - 2 = 11.',
        'Trying all pairs is O(n^2). Rewrite the score as **`(a[i] + i) + (a[j] - j)`**: the first part depends only on `i`, the second only on `j`. Walk along the road with `j`; for each `j` the best partner `i < j` is the one with the **largest `a[i] + i` among the earlier sights**. So keep that maximum as you go: `left = max(left, a[j] + j)` after using it.',
        { code: 'best = 0\nleft = a[0]                         # the largest a[i] + i among the sights before j\nfor j in range(1, n):\n    best = max(best, left + a[j] - j)\n    left = max(left, a[j] + j)\nprint(best)' },
        'The running maximum `left` is a tiny DP: `left(j) = max(left(j - 1), a[j - 1] + j - 1)`. Splitting a score into independent parts, so that a prefix maximum can be used, is the standard way to speed up "best pair" problems from O(n^2) to O(n). The result can reach 2 * 10^9, so use 64-bit numbers.'
      ]
    },
    statement: ['Along a road there are `n` sights; the sight `i` (counting from 0) has the value `a[i]`. The score of a pair of sights `i < j` is `a[i] + a[j] - (j - i)`. Print the largest score of a pair.'],
    outputFormat: ['Print the largest score.'],
    examples: [{ input: '5\n8 1 5 2 6\n', note: 'The sights 0 and 2 give 8 + 5 - 2 = 11.' }, { input: '2\n1 2\n', note: 'Only one pair: 1 + 2 - 1 = 2.' }],
    hints: ['Write the score as (a[i] + i) + (a[j] - j).', 'For each j the best i is the one with the largest a[i] + i before j.', 'Keep that maximum while walking along the road.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        best = 0
        left = a[0]
        for j in range(1, n):
            best = max(best, left + a[j] - j)
            left = max(left, a[j] + j)
        print(best)`,
      cpp: r`
        long long best = 0, left = a[0];
        for (long long j = 1; j < n; j++) {
            best = max(best, left + a[j] - j);
            left = max(left, a[j] + j);
        }
        cout << best << "\n";`,
      java: r`
        long best = 0, left = a[0];
        for (int j = 1; j < n; j++) {
            best = Math.max(best, left + a[j] - j);
            left = Math.max(left, a[j] + j);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The score a[i] + a[j] - (j - i) equals (a[i] + i) + (a[j] - j), so for every j the best i is the one with the largest a[i] + i before it; this maximum is kept while walking along the road.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; const pre = new Array(n).fill(-Infinity); let m = -Infinity; for (let j = 0; j < n; j++) { pre[j] = m; m = Math.max(m, a[j] + j); } let best = -Infinity; for (let j = 1; j < n; j++) best = Math.max(best, pre[j] + a[j] - j); return String(best);
    },
    tests() {
      const g = rng(2025); const out = ['5\n8 1 5 2 6\n', '2\n1 2\n', '3\n1 1 1\n', '2\n1000000000 1000000000\n'];
      const brute = (input) => { const a = arrOf(input); let best = -Infinity; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) best = Math.max(best, a[i] + a[j] - (j - i)); return String(best); };
      crossCheck(() => { const n = randInt(g, 2, 12); return list(n, randArray(g, n, 1, 30)); }, (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[10, 100], [100, 1000], [1000, 1000000], [50000, 1000000000], [100000, 1000000], [100000, 50], [100000, 1]]) out.push(list(n, randArray(g, n, 1, hi)));
      out.push(list(100000, many(100000, (i) => 100000 - i)), list(100000, many(100000, (i) => i + 1)), list(50000, new Array(50000).fill(1000000000)), list(100000, many(100000, (i) => (i === 3 || i === 99990 ? 1000000000 : 1))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 100000', '-10^9 <= each number <= 10^9'],
    slug: 'positive-product-run',
    title: 'The Longest Stretch With a Positive Product',
    tags: ['dp', 'array', 'sign', 'two-states'],
    concept: {
      title: 'Track two lengths at every position: the longest stretch ending here with a positive product and with a negative product',
      body: [
        'In a list of numbers (negative, zero or positive), find the length of the **longest stretch of consecutive numbers whose product is positive**. For `1 -2 -3 4` the whole list works (the two negatives cancel): 4. For `0 1 -2 -3 -4` the best is `1 -2 -3`, length 3. We never need the actual product, only its **sign**.',
        'At every position keep two numbers for the stretches that **end there**: `pos` is the length of the longest one whose product is positive, and `neg` the length of the longest one whose product is negative (0 means that no such stretch exists). When the next number is **positive**, the sign of a stretch does not change: `pos` grows by one, and `neg` grows by one if it exists. When it is **negative**, the signs swap: the new `pos` is the old `neg` plus one (if the old `neg` existed), and the new `neg` is the old `pos` plus one. A **zero** destroys every stretch: both become 0.',
        { code: 'best = pos = neg = 0\nfor x in a:\n    if x > 0:\n        pos, neg = pos + 1, (neg + 1 if neg else 0)\n    elif x < 0:\n        pos, neg = (neg + 1 if neg else 0), pos + 1\n    else:\n        pos = neg = 0\n    best = max(best, pos)\nprint(best)' },
        'The value `pos + 1` is right even when `pos` is 0: the empty stretch has the product 1 (positive), so a single number starts a stretch of length 1. The time is O(n) and the memory O(1). Whenever a property depends only on the sign (or the parity, or the remainder) of a running quantity, keep one best value for each possible class.'
      ]
    },
    statement: ['A list of `n` integers is given (they may be negative or zero). Print the length of the longest stretch of consecutive numbers whose product is strictly positive, or 0 if there is none.'],
    outputFormat: ['Print the length of the longest stretch.'],
    examples: [{ input: '4\n1 -2 -3 4\n', note: 'The product of the whole list is positive: 4.' }, { input: '5\n0 1 -2 -3 -4\n', note: 'The stretch 1 -2 -3 has the product 6: 3.' }],
    hints: ['Keep, for the stretches ending at the current number, the longest with a positive and the longest with a negative product.', 'A negative number swaps the two lengths (and adds one); a positive number keeps them; a zero resets both.', 'Remember that a stretch of length 0 counts as positive when you add a number to it.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        best = pos = neg = 0
        for x in a:
            if x > 0:
                pos, neg = pos + 1, (neg + 1 if neg else 0)
            elif x < 0:
                pos, neg = (neg + 1 if neg else 0), pos + 1
            else:
                pos = neg = 0
            best = max(best, pos)
        print(best)`,
      cpp: r`
        long long best = 0, pos = 0, neg = 0;
        for (long long x : a) {
            long long newPos, newNeg;
            if (x > 0) {
                newPos = pos + 1;
                newNeg = neg ? neg + 1 : 0;
            } else if (x < 0) {
                newPos = neg ? neg + 1 : 0;
                newNeg = pos + 1;
            } else {
                newPos = 0;
                newNeg = 0;
            }
            pos = newPos;
            neg = newNeg;
            best = max(best, pos);
        }
        cout << best << "\n";`,
      java: r`
        long best = 0, pos = 0, neg = 0;
        for (int i = 0; i < n; i++) {
            long newPos, newNeg;
            if (a[i] > 0) {
                newPos = pos + 1;
                newNeg = neg > 0 ? neg + 1 : 0;
            } else if (a[i] < 0) {
                newPos = neg > 0 ? neg + 1 : 0;
                newNeg = pos + 1;
            } else {
                newPos = 0;
                newNeg = 0;
            }
            pos = newPos;
            neg = newNeg;
            best = Math.max(best, pos);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['For the stretches that end at the current number the longest one with a positive product and the longest one with a negative product are kept; a positive number extends both, a negative number swaps their roles, and a zero resets both. The answer is the largest positive length.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; // split at zeros; in a block with k negatives: all of it if k is even, otherwise cut at the first or the last negative
      let best = 0; let i = 0; while (i < n) { if (a[i] === 0) { i++; continue; } let j = i; const negs = []; while (j < n && a[j] !== 0) { if (a[j] < 0) negs.push(j); j++; } const len = j - i; if (negs.length % 2 === 0) best = Math.max(best, len); else best = Math.max(best, len - (negs[0] - i + 1), len - (j - negs[negs.length - 1])); i = j; } return String(best);
    },
    tests() {
      const g = rng(2026); const out = ['4\n1 -2 -3 4\n', '5\n0 1 -2 -3 -4\n', '1\n0\n', '1\n-5\n', '1\n5\n', '3\n-1 -1 -1\n'];
      const brute = (input) => { const a = arrOf(input); let best = 0; for (let i = 0; i < a.length; i++) { let sign = 1; for (let j = i; j < a.length; j++) { if (a[j] === 0) break; if (a[j] < 0) sign = -sign; if (sign > 0) best = Math.max(best, j - i + 1); } } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 14); return list(n, many(n, () => randInt(g, -2, 2))); }, (i) => this.solve(i), brute, 400);
      const signs = (n, pz, pn, hi = 100) => many(n, () => { const x = g(); return x < pz ? 0 : x < pz + pn ? -randInt(g, 1, hi) : randInt(g, 1, hi); });
      for (const [n, pz, pn] of [[10, 0.1, 0.5], [100, 0.05, 0.5], [1000, 0.01, 0.5], [50000, 0.001, 0.5], [100000, 0.0001, 0.5], [100000, 0.00001, 0.5], [100000, 0, 0.5], [100000, 0, 0.0], [100000, 0.5, 0.25], [100000, 0.00001, 0.01]]) out.push(list(n, signs(n, pz, pn)));
      out.push(list(20000, signs(20000, 0.0001, 0.5, 1000000000)), list(100000, new Array(100000).fill(-9)), list(99999, new Array(99999).fill(-1)), list(100000, many(100000, (i) => (i === 50000 ? 0 : -1))), list(100000, many(100000, (i) => (i === 0 || i === 99999 ? -1 : 1))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of houses.', 'Each of the next `n` lines has three numbers: the price of painting the house red, blue and green.'],
    constraints: ['1 <= n <= 30000', '1 <= each price <= 10000'],
    slug: 'paint-houses-three-colours',
    title: 'Paint the Street With Three Colours',
    tags: ['dp', 'states', 'min-cost'],
    concept: {
      title: 'The state is the colour of the last house',
      body: [
        'A street has `n` houses in a row. Each house is painted red, blue or green, and painting a house costs a different price for each colour. **Two neighbouring houses must not have the same colour.** What is the smallest total cost? With the prices `17 2 17 / 16 16 5 / 14 3 19` the best plan is blue, green, blue for 2 + 5 + 3 = 10.',
        'What decides the choice for the next house is only the colour of the previous one. So the DP state is **(house, colour of this house)**. Let `a`, `b`, `c` be the smallest total cost for the houses so far when the last house is painted with the colour 1, 2 or 3. For the next house with the prices `x`, `y`, `z`: painting it colour 1 means that the previous one had colour 2 or 3, so the new `a = x + min(b, c)`, and likewise `b = y + min(a, c)` and `c = z + min(a, b)`.',
        { code: 'a, b, c = cost[0]\nfor i in range(1, n):\n    x, y, z = cost[i]\n    a, b, c = x + min(b, c), y + min(a, c), z + min(a, b)    # all three use the old values\nprint(min(a, b, c))' },
        'All three new values must be computed from the **old** ones, so use a simultaneous assignment (or temporary variables in C++ and Java). The time is O(n) and the memory O(1). When a rule says "not the same as the previous one", make the previous choice a part of the state: this works for three colours here and for any number of colours with a little more work.'
      ]
    },
    statement: ['A street has `n` houses in a row. House `i` can be painted red, blue or green at three given prices. Neighbouring houses must get different colours. Print the smallest total price of painting all houses.'],
    outputFormat: ['Print the smallest total price.'],
    examples: [{ input: '3\n17 2 17\n16 16 5\n14 3 19\n', note: 'Blue (2), green (5), blue (3): 10.' }, { input: '1\n7 3 9\n', note: 'One house: the cheapest colour, 3.' }],
    hints: ['Keep three values: the cheapest total when the last house has each of the three colours.', 'For a new colour take the smaller of the other two old values and add the price.', 'Compute all three new values from the old ones.'],
    program: {
      io: ['n:int', 'cost:int[n][3]'],
      fast: true,
      python: r`
        a, b, c = cost[0]
        for i in range(1, n):
            x, y, z = cost[i]
            a, b, c = x + min(b, c), y + min(a, c), z + min(a, b)
        print(min(a, b, c))`,
      cpp: r`
        long long a = cost[0][0], b = cost[0][1], c = cost[0][2];
        for (long long i = 1; i < n; i++) {
            long long na = cost[i][0] + min(b, c);
            long long nb = cost[i][1] + min(a, c);
            long long nc = cost[i][2] + min(a, b);
            a = na;
            b = nb;
            c = nc;
        }
        cout << min(a, min(b, c)) << "\n";`,
      java: r`
        long a = cost[0][0], b = cost[0][1], c = cost[0][2];
        for (int i = 1; i < n; i++) {
            long na = cost[i][0] + Math.min(b, c);
            long nb = cost[i][1] + Math.min(a, c);
            long nc = cost[i][2] + Math.min(a, b);
            a = na;
            b = nb;
            c = nc;
        }
        System.out.println(Math.min(a, Math.min(b, c)));`
    },
    solution: { explanation: ['Three values are kept: the cheapest total when the last house has each colour. A house painted with a colour adds its price to the cheaper of the other two old values; the answer is the smallest of the three values after the last house.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const cost = many(n, (i) => nums(rs[i + 1])); const t = cost.map((row) => row.slice()); for (let i = 1; i < n; i++) for (let c = 0; c < 3; c++) t[i][c] = cost[i][c] + Math.min(t[i - 1][(c + 1) % 3], t[i - 1][(c + 2) % 3]); return String(Math.min(...t[n - 1]));
    },
    tests() {
      const g = rng(2027); const out = ['3\n17 2 17\n16 16 5\n14 3 19\n', '1\n7 3 9\n', '2\n1 1 1\n1 1 1\n'];
      const make = (n, hi) => `${n}\n${many(n, () => randArray(g, 3, 1, hi).join(' ')).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const cost = many(n, (i) => nums(rs[i + 1])); let best = Infinity; const go = (i, prev, sum) => { if (i === n) { best = Math.min(best, sum); return; } for (let c = 0; c < 3; c++) if (c !== prev) go(i + 1, c, sum + cost[i][c]); }; go(0, -1, 0); return String(best); };
      crossCheck(() => make(randInt(g, 1, 9), 20), (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[10, 100], [100, 1000], [1000, 10000], [20000, 10000], [30000, 10000], [30000, 10000], [30000, 3], [30000, 1]]) out.push(make(n, hi));
      out.push(`20000\n${many(20000, () => '10000 10000 10000').join('\n')}\n`, `30000\n${many(30000, (i) => (i % 3 === 0 ? '1 10000 10000' : i % 3 === 1 ? '10000 1 10000' : '10000 10000 1')).join('\n')}\n`, `20000\n${many(20000, () => '1 10000 10000').join('\n')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the number `n`.'],
    constraints: ['1 <= n <= 1000000'],
    slug: 'counters-on-two-rows',
    title: 'Place Counters on a Two-Row Board',
    tags: ['dp', 'counting', 'column-states'],
    concept: {
      title: 'Go column by column: the state is what the last column holds',
      body: [
        'A board has 2 rows and `n` columns. You may put a counter on any cells, including no counters at all, but **no two counters may share a side**: not two in the same column and not two next to each other in a row. How many ways are there to place the counters? For `n = 1` there are 3 ways (empty, a counter on the top cell, a counter on the bottom cell); for `n = 2` there are 7. The answer is printed modulo 1 000 000 007.',
        'A column can be in one of three states: **empty**, **top** (a counter in the top cell) or **bottom**. The next column is constrained only by the last one: after an empty column anything goes; after a *top* column the next one cannot be *top* (the two top cells would be neighbours; and not both cells in one column, which is excluded already); likewise after a *bottom* column. Let `none`, `top`, `bottom` be the numbers of ways for the columns so far, ending in each state. For the next column: **`none` = none + top + bottom, `top` = none + bottom, `bottom` = none + top**.',
        { code: 'none, top, bottom = 1, 1, 1                 # one column\nfor _ in range(n - 1):\n    none, top, bottom = (none + top + bottom) % MOD, (none + bottom) % MOD, (none + top) % MOD\nprint((none + top + bottom) % MOD)' },
        'Check for two columns: `none = 3`, `top = 2`, `bottom = 2`, total 7 (the 9 pairs of column states minus the two forbidden pairs top-top and bottom-bottom). This "profile" idea (the state of the last column) is how tilings and placements on narrow boards are counted; wider boards just have more states. The time is O(n) and the memory O(1).'
      ]
    },
    statement: ['A board has 2 rows and `n` columns. Counters are placed on some cells (possibly none) so that no two counters are in cells that share a side. Print the number of different placements, modulo 1000000007.'],
    outputFormat: ['Print one number: the number of placements modulo 1000000007.'],
    examples: [{ input: '1\n', note: 'Empty, top or bottom: 3.' }, { input: '2\n', note: '9 combinations of two columns minus top-top and bottom-bottom: 7.' }],
    hints: ['A column is empty, has a counter on top, or has a counter at the bottom.', 'After a top column the next column cannot have a top counter; after a bottom column it cannot have a bottom counter.', 'Keep the three counts and update them together.'],
    program: {
      io: ['n:int'],
      fast: true,
      python: r`
        MOD = 10 ** 9 + 7
        none, top, bottom = 1, 1, 1
        for _ in range(n - 1):
            none, top, bottom = (none + top + bottom) % MOD, (none + bottom) % MOD, (none + top) % MOD
        print((none + top + bottom) % MOD)`,
      cpp: r`
        const long long MOD = 1000000007;
        long long none = 1, top = 1, bottom = 1;
        for (long long i = 1; i < n; i++) {
            long long newNone = (none + top + bottom) % MOD;
            long long newTop = (none + bottom) % MOD;
            long long newBottom = (none + top) % MOD;
            none = newNone;
            top = newTop;
            bottom = newBottom;
        }
        cout << (none + top + bottom) % MOD << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        long none = 1, top = 1, bottom = 1;
        for (long i = 1; i < n; i++) {
            long newNone = (none + top + bottom) % MOD;
            long newTop = (none + bottom) % MOD;
            long newBottom = (none + top) % MOD;
            none = newNone;
            top = newTop;
            bottom = newBottom;
        }
        System.out.println((none + top + bottom) % MOD);`
    },
    solution: { explanation: ['Columns are added one by one with three counts (the last column is empty, has a top counter, has a bottom counter); an empty column may follow anything, a top column may follow an empty or a bottom column, a bottom column may follow an empty or a top column.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const [n] = nums(input); // a(n) = 2 * a(n - 1) + a(n - 2), with a(0) = 1 and a(1) = 3
      let x = 1n, y = 3n; if (n === 1) return '3'; for (let i = 2; i <= n; i++) { const z = (2n * y + x) % BigInt(MOD); x = y; y = z; } return String(y);
    },
    tests() {
      const out = ['1\n', '2\n', '3\n', '4\n'];
      const brute = (n) => { let count = 0; const cells = 2 * n; for (let mask = 0; mask < (1 << cells); mask++) { let ok = true; for (let c = 0; c < n && ok; c++) { const top = mask >> (2 * c) & 1, bot = mask >> (2 * c + 1) & 1; if (top && bot) ok = false; if (c + 1 < n) { if (top && (mask >> (2 * c + 2) & 1)) ok = false; if (bot && (mask >> (2 * c + 3) & 1)) ok = false; } } if (ok) count++; } return count; };
      for (let n = 1; n <= 8; n++) if (String(this.solve(`${n}\n`)) !== String(brute(n))) throw new Error('reference differs from brute force for ' + n);
      for (const n of [5, 6, 7, 10, 20, 30, 31, 50, 100, 1000, 12345, 100000, 500000, 999999, 1000000, 1000000]) out.push(`${n}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the string `s` of `0` and `1` characters.'],
    constraints: ['3 <= length of s <= 200000'],
    slug: 'alternating-building-triples',
    title: 'Count the Alternating Triples of Buildings',
    tags: ['dp', 'subsequence-count', 'string'],
    concept: {
      title: 'Count the patterns "0", "1", "01", "10", "010", "101" as subsequences, one letter at a time',
      body: [
        'A street has buildings of two kinds, written as a string of `0` (office) and `1` (restaurant). An inspector chooses **three buildings** (at positions `i < j < k`) so that **no two neighbours in the chosen triple have the same kind**; that means the kinds read `0 1 0` or `1 0 1`. In how many ways can the three buildings be chosen? For `001101` the answer is 6.',
        'The triple is a *subsequence* of the string equal to `010` or `101`. Count such subsequences **while reading the string once**, with counters for the shorter patterns: `c0` = the number of subsequences equal to `0`, `c1` for `1`, `c01` for `01`, `c10` for `10`, `c010` and `c101`. A new letter `0` can extend a `01` to a `010`, extend a `1` to a `10`, and be a `0` by itself; a new letter `1` extends `10` to `101`, `0` to `01`, and counts as a `1`.',
        { code: 'c0 = c1 = c01 = c10 = c010 = c101 = 0\nfor ch in s:\n    if ch == "0":\n        c010 += c01          # every "01" before this letter becomes a "010"\n        c10 += c1\n        c0 += 1\n    else:\n        c101 += c10\n        c01 += c0\n        c1 += 1\nprint(c010 + c101)' },
        'The order of the three updates matters little here, but it must not use the new value of the same letter: a `0` must not extend a `01` that it has just created (a `0` never creates a `01`, so the order above is safe). Counting how many ways each prefix of the pattern can be matched is the idea behind many "number of subsequences" problems. The answer is up to about 10^14, so use 64-bit numbers. Time O(n), memory O(1).'
      ]
    },
    statement: ['A string `s` of characters `0` and `1` is given. Count the triples of positions `i < j < k` such that the characters at these positions are `0 1 0` or `1 0 1`. Print the number of such triples.'],
    outputFormat: ['Print the number of triples.'],
    examples: [{ input: '001101\n', note: 'The triples 0 1 0 use the positions (0 or 1), (2 or 3) and 4: four of them; the triples 1 0 1 use (2 or 3), 4 and 5: two of them. Total 6.' }, { input: '11100\n', note: 'No alternating triple: 0.' }],
    hints: ['A triple is a subsequence equal to 010 or 101.', 'Keep counters for the subsequences 0, 1, 01, 10, 010 and 101.', 'Each new letter extends the shorter patterns that end in the other letter.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        c0 = c1 = c01 = c10 = c010 = c101 = 0
        for ch in s:
            if ch == "0":
                c010 += c01
                c10 += c1
                c0 += 1
            else:
                c101 += c10
                c01 += c0
                c1 += 1
        print(c010 + c101)`,
      cpp: r`
        long long c0 = 0, c1 = 0, c01 = 0, c10 = 0, c010 = 0, c101 = 0;
        for (char ch : s) {
            if (ch == '0') {
                c010 += c01;
                c10 += c1;
                c0++;
            } else {
                c101 += c10;
                c01 += c0;
                c1++;
            }
        }
        cout << c010 + c101 << "\n";`,
      java: r`
        long c0 = 0, c1 = 0, c01 = 0, c10 = 0, c010 = 0, c101 = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '0') {
                c010 += c01;
                c10 += c1;
                c0++;
            } else {
                c101 += c10;
                c01 += c0;
                c1++;
            }
        }
        System.out.println(c010 + c101);`
    },
    solution: { explanation: ['The string is read once with counters for the subsequences 0, 1, 01, 10, 010 and 101; every letter extends the shorter patterns that end in the other letter, and the answer is the sum of the counters of 010 and 101.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const s = rows(input)[0]; // for every middle position count the different letters on both sides
      const n = s.length; const pre0 = [0], pre1 = [0]; for (const ch of s) { pre0.push(pre0[pre0.length - 1] + (ch === '0' ? 1 : 0)); pre1.push(pre1[pre1.length - 1] + (ch === '1' ? 1 : 0)); } let total = 0; for (let j = 0; j < n; j++) { const other = s[j] === '0' ? pre1 : pre0; total += other[j] * (other[n] - other[j + 1]); } return String(total);
    },
    tests() {
      const g = rng(2029); const out = ['001101\n', '11100\n', '010\n', '000\n', '101\n'];
      const brute = (input) => { const s = rows(input)[0]; let count = 0; for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) for (let k = j + 1; k < s.length; k++) if (s[i] !== s[j] && s[j] !== s[k]) count++; return String(count); };
      crossCheck(() => randWord(g, randInt(g, 3, 14), '01') + '\n', (i) => this.solve(i), brute, 400);
      for (const [n, p] of [[10, 0.5], [100, 0.5], [1000, 0.3], [50000, 0.5], [200000, 0.5], [200000, 0.1], [200000, 0.9], [200000, 0.5]]) out.push(`${many(n, () => (g() < p ? '1' : '0')).join('')}\n`);
      out.push(`${'01'.repeat(100000)}\n`, `${'0'.repeat(100000)}${'1'.repeat(100000)}\n`, `${'0'.repeat(66666)}${'1'.repeat(66667)}${'0'.repeat(66667)}\n`, `${'0'.repeat(200000)}\n`, `${'10'.repeat(99999)}1\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of stones.', 'The second line has `n` numbers: the height of each stone, in order.'],
    constraints: ['2 <= n <= 100000', '1 <= each height <= 10^9'],
    slug: 'frog-crosses-the-stones',
    title: 'The Frog Crosses the Stones',
    tags: ['dp', 'min-cost', 'jumps'],
    concept: {
      title: 'The cost of reaching a stone is the cheaper of the two ways it can be entered',
      body: [
        'A frog sits on the first of `n` stones in a row; the stone `i` has the height `h[i]`. From a stone it can jump to the **next** stone or to the stone **after the next**, and a jump from the stone `i` to the stone `j` costs `|h[i] - h[j]|` (the difference of the heights). What is the smallest total cost for the frog to reach the last stone? For the heights `10 30 40 20` the best plan is 10 -> 30 -> 20, for 20 + 10 = 30.',
        'Let `cost(i)` be the smallest total cost to reach the stone `i`. The last jump came from the stone `i - 1` or from the stone `i - 2`, so **`cost(i) = min(cost(i - 1) + |h[i] - h[i-1]|, cost(i - 2) + |h[i] - h[i-2]|)`**. We start with `cost(0) = 0` and `cost(1) = |h[1] - h[0]|`, since the only way to the stone 1 is one jump. The answer is `cost(n - 1)`.',
        { code: 'a = 0                                 # cost(i - 2)\nb = abs(h[1] - h[0])                  # cost(i - 1)\nfor i in range(2, n):\n    a, b = b, min(b + abs(h[i] - h[i - 1]), a + abs(h[i] - h[i - 2]))\nprint(b)' },
        'This is the stairs problem where the price of a move depends on **both ends** of the move instead of the place it leaves. The recurrence is the same; only the price changes. The time is O(n) and the memory O(1); the total can reach about 2 * 10^14, so use 64-bit numbers.'
      ]
    },
    statement: ['`n` stones stand in a row; the stone `i` has the height `h[i]`. A frog starts on the first stone and, in one jump, moves to the next stone or to the one after it. A jump from the stone `i` to the stone `j` costs `|h[i] - h[j]|`. Print the smallest total cost to reach the last stone.'],
    outputFormat: ['Print the smallest total cost.'],
    examples: [{ input: '4\n10 30 40 20\n', note: 'Jump 10 -> 30 (cost 20), then 30 -> 20 (cost 10): 30.' }, { input: '2\n10 10\n', note: 'One jump between equal heights: 0.' }],
    hints: ['Let cost(i) be the smallest cost to reach the stone i.', 'The last jump came from i - 1 or from i - 2; add the height difference of that jump.', 'cost(0) = 0 and cost(1) = |h[1] - h[0]|.'],
    program: {
      io: ['n:int', 'h:int[n]'],
      fast: true,
      python: r`
        a = 0
        b = abs(h[1] - h[0])
        for i in range(2, n):
            a, b = b, min(b + abs(h[i] - h[i - 1]), a + abs(h[i] - h[i - 2]))
        print(b)`,
      cpp: r`
        long long a = 0, b = llabs(h[1] - h[0]);
        for (long long i = 2; i < n; i++) {
            long long c = min(b + llabs(h[i] - h[i - 1]), a + llabs(h[i] - h[i - 2]));
            a = b;
            b = c;
        }
        cout << b << "\n";`,
      java: r`
        long a = 0, b = Math.abs(h[1] - h[0]);
        for (int i = 2; i < n; i++) {
            long c = Math.min(b + Math.abs(h[i] - h[i - 1]), a + Math.abs(h[i] - h[i - 2]));
            a = b;
            b = c;
        }
        System.out.println(b);`,
      includes: ['<cstdlib>']
    },
    solution: { explanation: ['cost(i) = min(cost(i - 1) + |h[i] - h[i - 1]|, cost(i - 2) + |h[i] - h[i - 2]|) with cost(0) = 0 and cost(1) = |h[1] - h[0]|, computed with two variables.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const h = arrOf(input); const n = h.length; const cost = new Array(n).fill(Infinity); cost[0] = 0; for (let i = 0; i < n; i++) { if (i + 1 < n) cost[i + 1] = Math.min(cost[i + 1], cost[i] + Math.abs(h[i + 1] - h[i])); if (i + 2 < n) cost[i + 2] = Math.min(cost[i + 2], cost[i] + Math.abs(h[i + 2] - h[i])); } return String(cost[n - 1]);
    },
    tests() {
      const g = rng(2030); const out = ['4\n10 30 40 20\n', '2\n10 10\n', '6\n30 10 60 10 60 50\n', '3\n1 1000000000 1\n'];
      const brute = (input) => { const h = arrOf(input); const n = h.length; let best = Infinity; const go = (i, sum) => { if (i === n - 1) { best = Math.min(best, sum); return; } if (i + 1 < n) go(i + 1, sum + Math.abs(h[i + 1] - h[i])); if (i + 2 < n) go(i + 2, sum + Math.abs(h[i + 2] - h[i])); }; go(0, 0); return String(best); };
      crossCheck(() => { const n = randInt(g, 2, 12); return list(n, randArray(g, n, 1, 30)); }, (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[10, 100], [100, 1000], [1000, 1000000], [30000, 1000000000], [100000, 1000000], [100000, 5]]) out.push(list(n, randArray(g, n, 1, hi)));
      out.push(list(50000, many(50000, (i) => (i % 2 ? 1 : 1000000000))), list(100000, many(100000, (i) => i + 1)), list(50000, new Array(50000).fill(1000000000)), list(50000, many(50000, (i) => (i % 3 === 0 ? 1000000000 : 1))));
      return out;
    }
  }
];
