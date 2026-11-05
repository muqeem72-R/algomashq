import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const list = (n, a) => `${n}\n${a.join(' ')}\n`;
const head2 = (a, b, arr) => `${a} ${b}\n${arr.join(' ')}\n`;
const arrOf = (input) => nums(rows(input)[1]);
// a list of jump lengths in which the last square can be reached
const reachable = (g, n, pZero, hi) => { const a = many(n, () => (g() < pZero ? 0 : randInt(g, 1, hi))); let far = 0; for (let i = 0; i < n - 1; i++) { far = Math.max(far, i + a[i]); if (far <= i) { a[i] = 1; far = i + 1; } } return a; };

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of squares.', 'The second line has `n` numbers: `a[i]` is the longest jump you may make from the square `i`.'],
    constraints: ['1 <= n <= 50000', '0 <= a[i] <= 100000', 'The last square can always be reached.'],
    slug: 'fewest-jumps-to-the-end',
    title: 'The Fewest Jumps to Reach the Last Square',
    tags: ['greedy', 'jump-game', 'bfs-levels'],
    concept: {
      title: 'Jump only when you must: remember how far the current jump reaches and how far the next one could',
      body: [
        'You stand on the first of `n` squares in a row. From the square `i` you can jump **any distance from 1 up to `a[i]`** to the right. What is the **smallest number of jumps** that brings you to the last square? For `2 3 1 1 4` the answer is 2: jump 1 square, then 3 squares. It is guaranteed that the end can be reached.',
        'Think in *rounds*. After `k` jumps you can stand on any square from the start up to some farthest square, call it `cur_end`. While walking over the squares of the current round, keep `farthest`, the farthest square reachable from any of them with **one more jump**. When the walk reaches `cur_end` — the end of the current round — one more jump is needed, and after it the new reachable block ends at `farthest`: `jumps += 1`, `cur_end = farthest`. This is a breadth-first search in which a round is one level, but because the reachable squares always form a block, we only need two numbers.',
        { code: 'jumps = cur_end = farthest = 0\nfor i in range(n - 1):                 # the last square needs no jump from itself\n    farthest = max(farthest, i + a[i])\n    if i == cur_end:                   # the round is over: we must jump now\n        jumps += 1\n        cur_end = farthest\nprint(jumps)' },
        'Why is delaying the jump until the end of the round right? Any square of the round could be the one we jump from, and the one that reaches farthest is at least as good as the others, so the choice can be made afterwards, when we know `farthest`. This makes the algorithm one pass, O(n), instead of the O(n^2) table of "fewest jumps to each square". (The earlier question "can the end be reached at all?" was solved with just the farthest reach.)'
      ]
    },
    statement: ['There are `n` squares in a row and you start on the first one. From the square `i` you may jump to any square from `i + 1` to `i + a[i]`. Print the smallest number of jumps needed to reach the last square (0 if there is only one square). It is guaranteed that the last square can be reached.'],
    outputFormat: ['Print the smallest number of jumps.'],
    examples: [{ input: '5\n2 3 1 1 4\n', note: 'Jump from the square 0 to 1, then 3 squares to the end: 2 jumps.' }, { input: '1\n0\n', note: 'You are already on the last square: 0.' }],
    hints: ['Treat the squares reachable with k jumps as a block that ends at cur_end.', 'While scanning the block, keep the farthest square that one more jump can reach.', 'At the end of the block count a jump and move cur_end to that farthest square.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        jumps = cur_end = farthest = 0
        for i in range(n - 1):
            if i + a[i] > farthest:
                farthest = i + a[i]
            if i == cur_end:
                jumps += 1
                cur_end = farthest
        print(jumps)`,
      cpp: r`
        long long jumps = 0, curEnd = 0, farthest = 0;
        for (long long i = 0; i < n - 1; i++) {
            farthest = max(farthest, i + a[i]);
            if (i == curEnd) {
                jumps++;
                curEnd = farthest;
            }
        }
        cout << jumps << "\n";`,
      java: r`
        long jumps = 0, curEnd = 0, farthest = 0;
        for (int i = 0; i < n - 1; i++) {
            farthest = Math.max(farthest, i + a[i]);
            if (i == curEnd) {
                jumps++;
                curEnd = farthest;
            }
        }
        System.out.println(jumps);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The squares reachable with k jumps form a block ending at cur_end; while scanning the block the farthest square reachable with one more jump is kept, and at the end of the block a jump is counted and cur_end becomes that farthest square.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; let lo = 0, hi = 0, jumps = 0; // level by level: the squares reachable with exactly `jumps` jumps are lo..hi
      while (hi < n - 1) { let next = hi; for (let i = lo; i <= hi; i++) next = Math.max(next, i + a[i]); lo = hi + 1; hi = next; jumps++; } return String(jumps);
    },
    tests() {
      const g = rng(3031); const out = ['5\n2 3 1 1 4\n', '1\n0\n', '2\n1 0\n', '6\n2 3 0 1 4 0\n', '3\n5 0 0\n'];
      const brute = (input) => { const a = arrOf(input); const n = a.length; const best = new Array(n).fill(Infinity); best[0] = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j <= Math.min(n - 1, i + a[i]); j++) best[j] = Math.min(best[j], best[i] + 1); return String(best[n - 1]); };
      crossCheck(() => list(...(() => { const n = randInt(g, 1, 12); return [n, reachable(g, n, 0.3, 4)]; })()), (i) => this.solve(i), brute, 600);
      for (const [n, p, hi] of [[10, 0.3, 4], [100, 0.4, 5], [1000, 0.5, 10], [30000, 0.4, 3], [50000, 0.3, 100], [50000, 0.1, 5], [50000, 0.5, 2], [50000, 0.0, 1], [49999, 0.2, 100000]]) out.push(list(n, reachable(g, n, p, hi)));
      out.push(list(50000, many(50000, (i) => (i === 49999 ? 0 : 1))), list(50000, many(50000, () => 100000)), list(50000, many(50000, (i) => (i === 0 ? 49999 : 0))), list(50000, many(50000, (i) => (i % 2 ? 2 : 3))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of stations on the ring road.', 'The second line has `n` numbers: the fuel you can take at each station.', 'The third line has `n` numbers: the fuel needed to drive from each station to the next one.'],
    constraints: ['1 <= n <= 50000', '0 <= fuel and cost <= 10^9'],
    slug: 'gas-station-start',
    title: 'Where Can the Round Trip Around the Ring Road Start?',
    tags: ['greedy', 'circular', 'prefix-sums'],
    concept: {
      title: 'If the tank goes negative, no station before this point can be the start: restart right after it',
      body: [
        'There are `n` stations on a **ring road**. At the station `i` you can take `gas[i]` units of fuel, and driving from the station `i` to the next one costs `cost[i]` units. You start with an empty tank at some station, take its fuel, and drive around the ring, always in the same direction. Can you finish the whole circle, and where must you start? Print the **smallest start index** that works (counting from 0), or -1 if none does. For the fuel `1 2 3 4 5` and the costs `3 4 5 1 2` the start is 3.',
        'Let `d[i] = gas[i] - cost[i]` be the gain of the station `i`. If the **sum of all `d` is negative**, there is not enough fuel in total and the answer is -1. Otherwise some start works, and we find it in one pass: keep the current tank, starting with the first station. If the tank becomes **negative** at the station `i`, then the trip that started at any station from the start to `i` is impossible (each of them would have even less fuel when reaching `i` than the one we tried, since all of them passed through stations with a non-negative tank before `i`). So **restart** the trip at the station `i + 1` with an empty tank.',
        { code: 'total = tank = 0\nstart = 0\nfor i in range(n):\n    d = gas[i] - cost[i]\n    total += d\n    tank += d\n    if tank < 0:                 # the trip from `start` cannot get past the station i\n        start = i + 1\n        tank = 0\nprint(start if total >= 0 else -1)' },
        'The stations after the last restart are fine until the end of the list; the stations before it have a total gain that is compensated by the total being non-negative. This is the same "reset the running sum when it drops below zero" idea as in the maximum subarray problem. One pass, O(n) time and O(1) memory.'
      ]
    },
    statement: ['`n` stations stand on a ring road. At the station `i` you can take `gas[i]` units of fuel; driving from the station `i` to the next station (the station 0 follows the station `n - 1`) costs `cost[i]` units. The tank has no limit and is empty at the start. Print the smallest index of a station from which you can drive around the whole ring, or -1 if there is none.'],
    outputFormat: ['Print the smallest starting index, or -1.'],
    examples: [{ input: '5\n1 2 3 4 5\n3 4 5 1 2\n', note: 'Start at the station 3: 4 - 1 = 3, then 3 + 5 - 2 = 6, then 6 + 1 - 3 = 4, ... the trip works: 3.' }, { input: '3\n2 3 4\n3 4 3\n', note: 'The total fuel 9 is less than the total cost 10: -1.' }],
    hints: ['Let d[i] = gas[i] - cost[i]; if the sum of d is negative the answer is -1.', 'Walk along the stations with a running tank.', 'When the tank goes below zero, the next station becomes the new start and the tank is emptied.'],
    program: {
      io: ['n:int', 'gas:int[n]', 'cost:int[n]'],
      fast: true,
      python: r`
        total = tank = 0
        start = 0
        for i in range(n):
            d = gas[i] - cost[i]
            total += d
            tank += d
            if tank < 0:
                start = i + 1
                tank = 0
        print(start if total >= 0 else -1)`,
      cpp: r`
        long long total = 0, tank = 0, start = 0;
        for (long long i = 0; i < n; i++) {
            long long d = gas[i] - cost[i];
            total += d;
            tank += d;
            if (tank < 0) {
                start = i + 1;
                tank = 0;
            }
        }
        cout << (total >= 0 ? start : -1) << "\n";`,
      java: r`
        long total = 0, tank = 0, start = 0;
        for (int i = 0; i < n; i++) {
            long d = gas[i] - cost[i];
            total += d;
            tank += d;
            if (tank < 0) {
                start = i + 1;
                tank = 0;
            }
        }
        System.out.println(total >= 0 ? start : -1);`
    },
    solution: { explanation: ['If the total gain is negative the answer is -1. Otherwise the stations are scanned with a running tank, and whenever it becomes negative the next station becomes the new candidate start and the tank is reset; the last candidate is the answer.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const gas = nums(rs[1]), cost = nums(rs[2]); const d = gas.map((x, i) => x - cost[i]); const total = d.reduce((x, y) => x + y, 0); if (total < 0) return '-1'; // the start is the first place where the prefix sum of the gains reaches its minimum
      let prefix = 0, best = 0, bestAt = 0; for (let i = 0; i < n; i++) { if (prefix < best) { best = prefix; bestAt = i; } prefix += d[i]; } return String(bestAt);
    },
    tests() {
      const g = rng(3032); const out = ['5\n1 2 3 4 5\n3 4 5 1 2\n', '3\n2 3 4\n3 4 3\n', '1\n0\n0\n', '1\n5\n6\n', '2\n1 1\n1 1\n'];
      const make = (n, hi, mode) => { const gas = randArray(g, n, 0, hi); const cost = randArray(g, n, 0, hi); if (mode === 'ok') { const d = gas.map((x, i) => x - cost[i]); let total = d.reduce((x, y) => x + y, 0); let i = 0; while (total < 0) { const add = Math.min(-total, hi - gas[i % n]); gas[i % n] += add; total += add; i++; if (i > 4 * n) break; } } return `${n}\n${gas.join(' ')}\n${cost.join(' ')}\n`; };
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const gas = nums(rs[1]), cost = nums(rs[2]); for (let s = 0; s < n; s++) { let tank = 0, ok = true; for (let k = 0; k < n; k++) { const i = (s + k) % n; tank += gas[i] - cost[i]; if (tank < 0) { ok = false; break; } } if (ok) return String(s); } return '-1'; };
      crossCheck(() => make(randInt(g, 1, 8), 6, g() < 0.7 ? 'ok' : 'any'), (i) => this.solve(i), brute, 800);
      for (const [n, hi, mode] of [[10, 100, 'ok'], [100, 1000, 'ok'], [1000, 1000000, 'ok'], [50000, 1000000000, 'ok'], [50000, 1000000000, 'any'], [50000, 10, 'ok'], [50000, 1, 'ok']]) out.push(make(n, hi, mode));
      out.push(`50000\n${new Array(50000).fill(1000000000).join(' ')}\n${new Array(50000).fill(1000000000).join(' ')}\n`, `50000\n${many(50000, (i) => (i === 49999 ? 1000000000 : 0)).join(' ')}\n${many(50000, (i) => (i === 49999 ? 0 : 1)).join(' ')}\n`.replace(/^50000/, '50000'));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of children.', 'The second line has `n` numbers: the rating of each child, in the order of the line.'],
    constraints: ['1 <= n <= 50000', '0 <= rating <= 10^9'],
    slug: 'candy-for-every-child',
    title: 'The Fewest Candies That Respect the Ratings',
    tags: ['greedy', 'two-passes', 'array'],
    concept: {
      title: 'Satisfy the left neighbours in one pass, the right neighbours in another, and keep the larger of the two answers',
      body: [
        'Children stand in a line, each with a *rating*. Every child must get **at least one candy**, and a child with a **higher rating than a neighbour** must get **more candies than that neighbour** (children with equal ratings may get any numbers). What is the smallest total number of candies? For the ratings `1 0 2` the answer is 5 (candies `2 1 2`). For `1 2 2` it is 4 (`1 2 1`).',
        'The rule has two parts, one for each side, and each part can be satisfied by a simple pass. **Left to right:** if the child has a higher rating than the child on the left, give one candy more than the left child (otherwise the minimum, 1). This takes care of all the "bigger than my left neighbour" conditions. **Right to left:** if the child has a higher rating than the child on the right and does not have more candies yet, raise it to the right neighbour\'s candies plus one. Taking the **larger** of the demands from both sides satisfies both rules, and nothing is given beyond what one of the rules requires, so the total is as small as possible.',
        { code: 'candy = [1] * n\nfor i in range(1, n):                      # the left neighbour\n    if rating[i] > rating[i - 1]:\n        candy[i] = candy[i - 1] + 1\nfor i in range(n - 2, -1, -1):             # the right neighbour\n    if rating[i] > rating[i + 1] and candy[i] <= candy[i + 1]:\n        candy[i] = candy[i + 1] + 1\nprint(sum(candy))' },
        'The second pass may raise a child that the first pass had already set; it never needs to lower anyone, because it only adds when the right neighbour requires more. The total can reach about n^2 / 2 = 1.25 billion for a strictly increasing line, so use 64-bit numbers. Time O(n).'
      ]
    },
    statement: ['`n` children stand in a line with the given ratings. Each child must get at least one candy, and a child with a higher rating than an adjacent child must get more candies than that child. Print the smallest total number of candies.'],
    outputFormat: ['Print the smallest total number of candies.'],
    examples: [{ input: '3\n1 0 2\n', note: 'The candies 2, 1, 2 are enough: 5.' }, { input: '3\n1 2 2\n', note: 'The candies 1, 2, 1: 4.' }],
    hints: ['Give everybody 1 candy first.', 'Go from the left: a child with a higher rating than the left neighbour gets one more than that neighbour.', 'Go from the right: raise a child above the right neighbour if needed. Use 64-bit numbers for the sum.'],
    program: {
      io: ['n:int', 'rating:int[n]'],
      fast: true,
      python: r`
        candy = [1] * n
        for i in range(1, n):
            if rating[i] > rating[i - 1]:
                candy[i] = candy[i - 1] + 1
        for i in range(n - 2, -1, -1):
            if rating[i] > rating[i + 1] and candy[i] <= candy[i + 1]:
                candy[i] = candy[i + 1] + 1
        print(sum(candy))`,
      cpp: r`
        vector<long long> candy(n, 1);
        for (long long i = 1; i < n; i++) if (rating[i] > rating[i - 1]) candy[i] = candy[i - 1] + 1;
        for (long long i = n - 2; i >= 0; i--) if (rating[i] > rating[i + 1] && candy[i] <= candy[i + 1]) candy[i] = candy[i + 1] + 1;
        long long total = 0;
        for (long long x : candy) total += x;
        cout << total << "\n";`,
      java: r`
        long[] candy = new long[(int) n];
        Arrays.fill(candy, 1);
        for (int i = 1; i < n; i++) if (rating[i] > rating[i - 1]) candy[i] = candy[i - 1] + 1;
        for (int i = (int) n - 2; i >= 0; i--) if (rating[i] > rating[i + 1] && candy[i] <= candy[i + 1]) candy[i] = candy[i + 1] + 1;
        long total = 0;
        for (long x : candy) total += x;
        System.out.println(total);`
    },
    solution: { explanation: ['Everyone starts with one candy; a left-to-right pass gives a child one more than the left neighbour when the rating is higher, and a right-to-left pass raises a child above the right neighbour when needed. The sum of the candies is the answer.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const r0 = arrOf(input); const n = r0.length; // process the children from the lowest rating to the highest: a child needs one more than the best lower-rated neighbour
      const order = r0.map((_, i) => i).sort((x, y) => r0[x] - r0[y]); const candy = new Array(n).fill(1); for (const i of order) { for (const j of [i - 1, i + 1]) if (j >= 0 && j < n && r0[j] < r0[i]) candy[i] = Math.max(candy[i], candy[j] + 1); } return String(candy.reduce((x, y) => x + y, 0));
    },
    tests() {
      const g = rng(3033); const out = ['3\n1 0 2\n', '3\n1 2 2\n', '1\n7\n', '2\n1 1\n', '5\n1 2 3 4 5\n'];
      const brute = (input) => { const r0 = arrOf(input); const n = r0.length; const c = new Array(n).fill(1); let changed = true; while (changed) { changed = false; for (let i = 0; i < n; i++) { if (i > 0 && r0[i] > r0[i - 1] && c[i] <= c[i - 1]) { c[i] = c[i - 1] + 1; changed = true; } if (i < n - 1 && r0[i] > r0[i + 1] && c[i] <= c[i + 1]) { c[i] = c[i + 1] + 1; changed = true; } } } return String(c.reduce((x, y) => x + y, 0)); };
      crossCheck(() => { const n = randInt(g, 1, 10); return list(n, randArray(g, n, 0, 4)); }, (i) => this.solve(i), brute, 800);
      for (const [n, hi] of [[10, 5], [100, 10], [1000, 100], [50000, 1000000000], [50000, 3], [50000, 50000], [49999, 1]]) out.push(list(n, randArray(g, n, 0, hi)));
      out.push(list(50000, many(50000, (i) => i)), list(50000, many(50000, (i) => 50000 - i)), list(50000, many(50000, (i) => Math.min(i, 50000 - i))), list(50000, many(50000, (i) => Math.abs(25000 - i))), list(50000, new Array(50000).fill(5)));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 100000', 'The word consists of lowercase English letters.'],
    slug: 'cut-without-sharing-letters',
    title: 'Cut the Word So That No Letter Is in Two Pieces',
    tags: ['greedy', 'string', 'intervals', 'last-occurrence'],
    concept: {
      title: 'A piece must reach at least to the last occurrence of every letter it contains',
      body: [
        'Cut a word into **as many pieces as possible** (consecutive parts) so that **each letter appears in at most one piece**. Print the sizes of the pieces. For `ababcbacadefegdehijhklij` the answer is `9 7 8`: `ababcbaca`, `defegde`, `hijhklij`. Cutting anywhere else would put some letter into two pieces.',
        'First record the **last position of every letter**. Walk along the word with `end`, the **farthest last position** among the letters seen in the current piece. The piece started at `start` cannot end before `end`, because the letter whose last occurrence is at `end` would appear in the next piece too. Each new letter extends the piece: `end = max(end, last[letter])`. When the current position `i` reaches `end`, every letter of the piece has its last occurrence inside it, so the piece can be cut here: its size is `end - start + 1`, and the next piece starts at `i + 1`.',
        { code: 'last = {c: i for i, c in enumerate(s)}\nsizes = []\nstart = end = 0\nfor i, c in enumerate(s):\n    end = max(end, last[c])\n    if i == end:                        # all the letters of the piece end here\n        sizes.append(end - start + 1)\n    \n        start = i + 1\nprint(*sizes)' },
        'This greedy cuts as early as it is allowed, so it produces the largest number of pieces. The pieces are exactly what you get by merging the intervals `[first occurrence, last occurrence]` of all the letters, an interval-merging view of the same idea. The time is O(n) and the memory O(26).'
      ]
    },
    statement: ['A word is given. Cut it into the largest possible number of consecutive pieces such that no letter occurs in two different pieces. Print the sizes of the pieces from left to right on one line.'],
    outputFormat: ['Print the sizes of the pieces, separated by spaces.'],
    examples: [{ input: 'ababcbacadefegdehijhklij\n', note: 'The pieces ababcbaca, defegde and hijhklij: 9 7 8.' }, { input: 'abc\n', note: 'Each letter forms its own piece: 1 1 1.' }],
    hints: ['Remember the last position of every letter.', 'Keep the farthest last position of the letters in the current piece.', 'Cut when the position reaches that farthest last position.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        last = {}
        for i, c in enumerate(s):
            last[c] = i
        sizes = []
        start = end = 0
        for i, c in enumerate(s):
            if last[c] > end:
                end = last[c]
            if i == end:
                sizes.append(end - start + 1)
                start = i + 1
        print(*sizes)`,
      cpp: r`
        int last[26];
        for (int c = 0; c < 26; c++) last[c] = -1;
        for (size_t i = 0; i < s.size(); i++) last[s[i] - 'a'] = (int)i;
        vector<int> sizes;
        int start = 0, end = 0;
        for (size_t i = 0; i < s.size(); i++) {
            end = max(end, last[s[i] - 'a']);
            if ((int)i == end) {
                sizes.push_back(end - start + 1);
                start = (int)i + 1;
            }
        }
        for (size_t k = 0; k < sizes.size(); k++) cout << (k ? " " : "") << sizes[k];
        cout << "\n";`,
      java: r`
        int[] last = new int[26];
        for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i;
        StringBuilder out = new StringBuilder();
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            end = Math.max(end, last[s.charAt(i) - 'a']);
            if (i == end) {
                if (out.length() > 0) out.append(" ");
                out.append(end - start + 1);
                start = i + 1;
            }
        }
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The last position of every letter is recorded; scanning the word, the farthest last position of the letters of the current piece is kept, and when the position reaches it the piece is cut and its size is recorded.'], complexity: 'Time O(n), space O(26).' },
    solve(input) {
      const s = rows(input)[0]; const first = {}, last = {}; for (let i = 0; i < s.length; i++) { if (!(s[i] in first)) first[s[i]] = i; last[s[i]] = i; } // merge the intervals [first, last] of the letters
      const iv = Object.keys(first).map((c) => [first[c], last[c]]).sort((a, b) => a[0] - b[0]); const sizes = []; let [cs, ce] = iv[0]; for (const [a, b] of iv.slice(1)) { if (a <= ce) ce = Math.max(ce, b); else { sizes.push(ce - cs + 1); cs = a; ce = b; } } sizes.push(ce - cs + 1); return sizes.join(' ');
    },
    tests() {
      const g = rng(3034); const out = ['ababcbacadefegdehijhklij\n', 'abc\n', 'a\n', 'aaaa\n', 'abab\n'];
      const brute = (input) => { const s = rows(input)[0]; const n = s.length; const cuts = []; for (let p = 1; p < n; p++) { const left = new Set(s.slice(0, p)), right = new Set(s.slice(p)); let ok = true; for (const c of left) if (right.has(c)) ok = false; if (ok) cuts.push(p); } const sizes = []; let prev = 0; for (const p of cuts) { sizes.push(p - prev); prev = p; } sizes.push(n - prev); return sizes.join(' '); };
      crossCheck(() => randWord(g, randInt(g, 1, 12), 'abcd') + '\n', (i) => this.solve(i), brute, 800);
      const blocks = (count, len) => many(count, (i) => { const al = String.fromCharCode(97 + (i % 26)); return randWord(g, len, al + String.fromCharCode(97 + ((i + 1) % 26))); }).join('');
      for (const [n, al] of [[20, 'abcdefg'], [100, 'abcdefghij'], [1000, 'abcdefghijklmnopqrstuvwxyz'], [100000, 'abcdefghijklmnopqrstuvwxyz'], [100000, 'abc']]) out.push(randWord(g, n, al) + '\n');
      out.push('abcdefghijklmnopqrstuvwxyz'.repeat(3846) + '\n', 'a'.repeat(100000) + '\n', ('a'.repeat(1000) + 'b'.repeat(1000)).repeat(1) + '\n', many(26, (i) => String.fromCharCode(97 + i).repeat(3846)).join('') + '\n', 'a' + 'bcdefghijklmnopqrstuvwxyz'.repeat(3846) + 'a\n');
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of people.', 'Each of the next `n` lines has two numbers `h` and `k`: the height of a person and the number of people standing in front of this person who are at least as tall.'],
    constraints: ['1 <= n <= 5000', '1 <= h <= 100000', 'The pairs come from a real queue, so a queue that fits all of them exists.'],
    slug: 'rebuild-the-queue',
    title: 'Rebuild the Queue From Heights and Counts',
    tags: ['greedy', 'sorting', 'insertion'],
    concept: {
      title: 'Place the tallest people first: later, shorter people do not change the counts of the taller ones',
      body: [
        'People stood in a queue and then got mixed up. For each person you know the **height** `h` and the number `k` of people **in front** of them who are **at least as tall** as they are. Rebuild the queue. For the people `(7,0) (4,4) (7,1) (5,0) (6,1) (5,2)` the queue is `(5,0) (7,0) (5,2) (6,1) (4,4) (7,1)`. The input is in a random order.',
        'The count `k` of a person depends only on the **taller or equal** people, never on the shorter ones. So place the people **from the tallest to the shortest**. Among people of the same height, place those with a smaller `k` first. When a person is placed, all the taller people are already in the queue, and the people of the same height with a smaller `k` too. The person must have exactly `k` of them in front, so they go to **position `k`** of the current queue (inserted there). Shorter people placed later are inserted somewhere and push the existing people to the right, but they do not change who is in front of whom among the taller ones, and they do not count for the taller ones.',
        { code: 'people.sort(key=lambda p: (-p[0], p[1]))      # the tallest first; for equal heights the smaller k first\nqueue = []\nfor h, k in people:\n    queue.insert(k, (h, k))                    # exactly k people in front are at least as tall\nfor h, k in queue: print(h, k)' },
        'Inserting into a list at an arbitrary position costs O(n), so the whole algorithm is O(n^2) in the worst case, which is fine for 5000 people (a balanced tree or a Fenwick tree would reach O(n log n)). The point of the greedy order is that every insertion is **final** with respect to the people already there.'
      ]
    },
    statement: ['`n` people are given by a pair `(h, k)`: the height `h` and the number `k` of people in front of this person in the queue who are at least as tall (that is, have a height greater than or equal to `h`). A queue that fits all the pairs exists and is unique. Print the queue from the front to the back, one pair `h k` per line.'],
    outputFormat: ['Print `n` lines with the pairs `h k` in the order of the queue.'],
    examples: [{ input: '6\n7 0\n4 4\n7 1\n5 0\n6 1\n5 2\n', note: 'The queue is (5,0) (7,0) (5,2) (6,1) (4,4) (7,1).' }],
    hints: ['A person is not influenced by shorter people.', 'Sort by height descending and, for equal heights, by k ascending.', 'Insert each person at the position k of the queue built so far.'],
    program: {
      io: ['n:int', 'people:int[n][2]'],
      fast: true,
      python: r`
        people.sort(key=lambda p: (-p[0], p[1]))
        queue = []
        for h, k in people:
            queue.insert(k, (h, k))
        print("\n".join(str(h) + " " + str(k) for h, k in queue))`,
      cpp: r`
        sort(people.begin(), people.end(), [](const vector<long long>& x, const vector<long long>& y) {
            if (x[0] != y[0]) return x[0] > y[0];
            return x[1] < y[1];
        });
        vector<vector<long long>> queue;
        for (const vector<long long>& p : people) queue.insert(queue.begin() + p[1], p);
        for (const vector<long long>& p : queue) cout << p[0] << " " << p[1] << "\n";`,
      java: r`
        int count = (int) n;
        long[] keys = new long[count];
        for (int i = 0; i < count; i++) keys[i] = (100000L - people[i][0]) * 10000L + people[i][1];
        Arrays.sort(keys);
        long[] heights = new long[count];
        long[] counts = new long[count];
        int size = 0;
        for (int t = 0; t < count; t++) {
            long h = 100000L - keys[t] / 10000L;
            long k = keys[t] % 10000L;
            System.arraycopy(heights, (int) k, heights, (int) k + 1, size - (int) k);
            System.arraycopy(counts, (int) k, counts, (int) k + 1, size - (int) k);
            heights[(int) k] = h;
            counts[(int) k] = k;
            size++;
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < count; i++) out.append(heights[i]).append(" ").append(counts[i]).append("\n");
        System.out.print(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The people are sorted from the tallest to the shortest (smaller k first for equal heights) and each one is inserted at the position k of the queue built so far, since only people at least as tall are in the queue when it is placed.'], complexity: 'Time O(n^2) for the insertions, space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const people = many(n, (i) => nums(rs[i + 1])); // the shortest first: a person goes to the empty slot with exactly k empty slots before it
      const order = people.slice().sort((a, b) => a[0] - b[0] || b[1] - a[1]); const slots = new Array(n).fill(null); for (const [h, k] of order) { let free = -1; for (let p = 0; p < n; p++) if (slots[p] === null) { free++; if (free === k) { slots[p] = [h, k]; break; } } } return slots.map((p) => p.join(' ')).join('\n');
    },
    tests() {
      const g = rng(3035); const out = ['6\n7 0\n4 4\n7 1\n5 0\n6 1\n5 2\n', '1\n5 0\n', '2\n5 0\n5 1\n', '3\n1 2\n2 1\n3 0\n'];
      const make = (n, hMax) => { const queue = many(n, () => randInt(g, 1, hMax)); const pairs = queue.map((h, i) => [h, queue.slice(0, i).filter((x) => x >= h).length]); return `${n}\n${shuffle(g, pairs).map((p) => p.join(' ')).join('\n')}\n`; };
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const people = many(n, (i) => nums(rs[i + 1])); const used = new Array(n).fill(false); const cur = []; let found = null; const go = () => { if (found) return; if (cur.length === n) { found = cur.slice(); return; } for (let i = 0; i < n; i++) { if (used[i]) continue; const [h, k] = people[i]; if (cur.filter((p) => p[0] >= h).length !== k) continue; used[i] = true; cur.push(people[i]); go(); cur.pop(); used[i] = false; } }; go(); return found.map((p) => p.join(' ')).join('\n'); };
      crossCheck(() => make(randInt(g, 1, 6), 5), (i) => this.solve(i), brute, 500);
      for (const [n, hMax] of [[10, 10], [100, 50], [500, 1000], [5000, 100000], [5000, 100000], [5000, 5], [4999, 100], [5000, 1]]) out.push(make(n, hMax));
      out.push(`5000\n${many(5000, (i) => `${100000 - i} 0`).join('\n')}\n`, `5000\n${many(5000, (i) => `${5000 - i} ${i}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `m`: the number of people (an even number).', 'Each of the next `m` lines has two numbers `a` and `b`: the cost of sending this person to the city A and to the city B.'],
    constraints: ['2 <= m <= 50000, and `m` is even', '1 <= a, b <= 10^9'],
    slug: 'send-half-to-each-city',
    title: 'Send Half of the People to Each City at the Smallest Cost',
    tags: ['greedy', 'sorting', 'exchange-argument'],
    concept: {
      title: 'Sort the people by how much cheaper city A is than city B',
      body: [
        'A company must send **exactly half** of `m` people to the city A and the other half to the city B. Person `i` costs `a[i]` to send to A and `b[i]` to send to B. What is the smallest total cost? For the costs `(10,20) (30,200) (400,50) (30,20)` the answer is 110: send the first two to A (10 + 30) and the others to B (50 + 20).',
        'Start by sending **everybody to B**: the cost is the sum of all `b[i]`. Now we must move exactly `m / 2` people to A. Moving the person `i` changes the total by `a[i] - b[i]` (negative when A is cheaper for this person). To get the smallest total, **move the people with the smallest values of `a[i] - b[i]`**. So sort the people by `a - b` and send the first half to A and the second half to B.',
        { code: 'people.sort(key=lambda p: p[0] - p[1])         # who gains the most by going to A comes first\nhalf = m // 2\ntotal = sum(a for a, b in people[:half]) + sum(b for a, b in people[half:])\nprint(total)' },
        'Why does sorting by the difference work? Suppose in an optimal plan person `x` goes to A and person `y` goes to B but `a[x] - b[x] > a[y] - b[y]`. Swapping them (`x` to B, `y` to A) changes the cost by `(b[x] - a[x]) + (a[y] - b[y])`, which is negative, so the plan was not optimal. This **exchange argument** proves that the first half of the sorted list goes to A. The sort costs O(m log m).'
      ]
    },
    statement: ['`m` people (`m` even) are given with the costs `a` and `b` of sending each of them to the city A and to the city B. Exactly `m / 2` people must go to each city. Print the smallest possible total cost.'],
    outputFormat: ['Print the smallest total cost.'],
    examples: [{ input: '4\n10 20\n30 200\n400 50\n30 20\n', note: 'People 1 and 2 go to A (10 + 30), people 3 and 4 go to B (50 + 20): 110.' }],
    hints: ['Imagine everybody goes to B first; moving a person to A changes the cost by a - b.', 'Move the m / 2 people with the smallest a - b.', 'Sort by a - b and cut the list in half.'],
    program: {
      io: ['m:int', 'costs:int[m][2]'],
      fast: true,
      python: r`
        costs.sort(key=lambda p: p[0] - p[1])
        half = m // 2
        total = 0
        for i in range(m):
            total += costs[i][0] if i < half else costs[i][1]
        print(total)`,
      cpp: r`
        sort(costs.begin(), costs.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[0] - x[1] < y[0] - y[1]; });
        long long total = 0;
        for (long long i = 0; i < m; i++) total += (i < m / 2) ? costs[i][0] : costs[i][1];
        cout << total << "\n";`,
      java: r`
        int count = (int) m;
        long[] diff = new long[count];
        long sumB = 0;
        for (int i = 0; i < count; i++) {
            diff[i] = costs[i][0] - costs[i][1];
            sumB += costs[i][1];
        }
        Arrays.sort(diff);
        long total = sumB;
        for (int i = 0; i < count / 2; i++) total += diff[i];
        System.out.println(total);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Sending everybody to the city B costs the sum of all b; moving a person to A changes the cost by a - b, so the m / 2 smallest differences are added to that sum (equivalently: sort by a - b, the first half goes to A).'], complexity: 'Time O(m log m), space O(m).' },
    solve(input) {
      const rs = rows(input); const m = Number(rs[0]); const c = many(m, (i) => nums(rs[i + 1])); const half = m / 2;
      if (m <= 16) { let best = Infinity; for (let mask = 0; mask < (1 << m); mask++) { let ones = 0; for (let i = 0; i < m; i++) ones += mask >> i & 1; if (ones !== half) continue; let t = 0; for (let i = 0; i < m; i++) t += (mask >> i & 1) ? c[i][0] : c[i][1]; best = Math.min(best, t); } return String(best); } // exact subsets for small inputs
      const sumB = c.reduce((s, p) => s + p[1], 0); const d = c.map((p) => p[0] - p[1]).sort((x, y) => x - y); return String(sumB + d.slice(0, half).reduce((s, x) => s + x, 0));
    },
    tests() {
      const g = rng(3036); const out = ['4\n10 20\n30 200\n400 50\n30 20\n', '2\n1 1\n1 1\n', '2\n5 1\n1 5\n'];
      const make = (m, hi) => `${m}\n${many(m, () => `${randInt(g, 1, hi)} ${randInt(g, 1, hi)}`).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const m = Number(rs[0]); const c = many(m, (i) => nums(rs[i + 1])); let best = Infinity; for (let mask = 0; mask < (1 << m); mask++) { let ones = 0; for (let i = 0; i < m; i++) ones += mask >> i & 1; if (ones !== m / 2) continue; let t = 0; for (let i = 0; i < m; i++) t += (mask >> i & 1) ? c[i][0] : c[i][1]; best = Math.min(best, t); } return String(best); };
      crossCheck(() => make(2 * randInt(g, 1, 5), 20), (i) => this.solve(i), brute, 500);
      for (const [m, hi] of [[20, 100], [100, 1000], [1000, 1000000], [30000, 1000000000], [30000, 1000000000], [30000, 5], [29998, 1000000000]]) out.push(make(m, hi));
      out.push(`30000\n${many(30000, () => '1000000000 1').join('\n')}\n`, `30000\n${many(30000, (i) => `${1 + i} ${30000 - i}`).join('\n')}\n`, `30000\n${many(30000, () => '7 7').join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `limit`: the number of people and the largest total weight a boat can carry.', 'The second line has `n` numbers: the weights of the people.'],
    constraints: ['1 <= n <= 50000', '1 <= each weight <= limit <= 10^9', 'A boat carries at most two people.'],
    slug: 'boats-for-everyone',
    title: 'How Many Boats Carry Everyone?',
    tags: ['greedy', 'sorting', 'two-pointers'],
    concept: {
      title: 'Pair the heaviest person with the lightest one who still fits',
      body: [
        'Boats can carry **at most two people** and a total weight of at most `limit`. Every person fits in a boat alone. What is the **smallest number of boats** that carry everybody? For the weights `3 2 2 1` and `limit = 3` the answer is 3: `(1, 2)`, `(2)`, `(3)`.',
        'Look at the **heaviest** person. They need a boat, and the best partner for them is the **lightest** person: if even the lightest cannot share a boat with the heaviest, nobody can, so the heaviest goes alone. If the lightest fits, taking him is also the best, because we use up the least capable partner and keep the ones that are heavier for people who can take them. Sort the weights and use two pointers: `i` at the lightest and `j` at the heaviest. In every step the heaviest person `j` takes one boat; if `w[i] + w[j] <= limit`, the lightest `i` rides with them and the pointer `i` moves; then `j` moves.',
        { code: 'w.sort()\ni, j = 0, n - 1\nboats = 0\nwhile i <= j:\n    if w[i] + w[j] <= limit:\n        i += 1                      # the lightest shares the boat\n    j -= 1                          # the heaviest always rides\n    boats += 1\nprint(boats)' },
        'When `i == j` there is one person left who rides alone (the sum `w[i] + w[j]` is then counted twice, but both pointers cross anyway, so the count is right). The exchange argument: any plan that gives the heaviest person a different partner can swap that partner with the lightest one without breaking a boat. Sorting dominates: O(n log n).'
      ]
    },
    statement: ['`n` people with the given weights must cross a river in boats. A boat carries at most two people and a total weight of at most `limit`; every person can ride alone. Print the smallest number of boats.'],
    outputFormat: ['Print the smallest number of boats.'],
    examples: [{ input: '4 3\n3 2 2 1\n', note: 'The boats (1, 2), (2) and (3): 3.' }, { input: '3 5\n3 5 3\n', note: 'The boats (3), (3) and (5): 3.' }],
    hints: ['Sort the weights.', 'The heaviest person always takes a boat; the lightest rides with them if they fit.', 'Use two pointers and count the boats.'],
    program: {
      io: ['n:int limit:int', 'w:int[n]'],
      fast: true,
      python: r`
        w.sort()
        i, j = 0, n - 1
        boats = 0
        while i <= j:
            if w[i] + w[j] <= limit:
                i += 1
            j -= 1
            boats += 1
        print(boats)`,
      cpp: r`
        sort(w.begin(), w.end());
        long long i = 0, j = n - 1, boats = 0;
        while (i <= j) {
            if (w[i] + w[j] <= limit) i++;
            j--;
            boats++;
        }
        cout << boats << "\n";`,
      java: r`
        Arrays.sort(w);
        int i = 0, j = (int) n - 1;
        long boats = 0;
        while (i <= j) {
            if (w[i] + w[j] <= limit) i++;
            j--;
            boats++;
        }
        System.out.println(boats);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The weights are sorted; the heaviest person always takes a boat, and the lightest person who has not boarded rides with them if the total fits. Two pointers count the boats.'], complexity: 'Time O(n log n), space O(1) extra.' },
    solve(input) {
      const rs = rows(input); const [n, limit] = nums(rs[0]); const w = nums(rs[1]);
      if (n <= 14) { let best = n; const go = (mask, boats) => { if (boats >= best) return; if (mask === (1 << n) - 1) { best = boats; return; } let i = 0; while (mask >> i & 1) i++; go(mask | (1 << i), boats + 1); for (let j = i + 1; j < n; j++) if (!(mask >> j & 1) && w[i] + w[j] <= limit) go(mask | (1 << i) | (1 << j), boats + 1); }; go(0, 0); return String(best); } // exact search for small inputs
      const sorted = w.slice().sort((x, y) => x - y); const dq = sorted.slice(); let head = 0, tail = dq.length - 1, boats = 0; while (head <= tail) { if (head < tail && dq[head] + dq[tail] <= limit) head++; tail--; boats++; } return String(boats);
    },
    tests() {
      const g = rng(3037); const out = ['4 3\n3 2 2 1\n', '3 5\n3 5 3\n', '1 7\n7\n', '2 10\n5 5\n'];
      const make = (n, limit, lo) => `${n} ${limit}\n${randArray(g, n, Math.min(lo, limit), limit).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, limit] = nums(rs[0]); const w = nums(rs[1]); let best = n; const go = (mask, boats) => { if (boats >= best) return; if (mask === (1 << n) - 1) { best = boats; return; } let i = 0; while (mask >> i & 1) i++; go(mask | (1 << i), boats + 1); for (let j = i + 1; j < n; j++) if (!(mask >> j & 1) && w[i] + w[j] <= limit) go(mask | (1 << i) | (1 << j), boats + 1); }; go(0, 0); return String(best); };
      crossCheck(() => { const limit = randInt(g, 3, 12); return make(randInt(g, 1, 9), limit, 1); }, (i) => this.solve(i), brute, 800);
      for (const [n, limit, lo] of [[20, 100, 1], [100, 1000, 1], [1000, 1000000, 1], [30000, 1000000000, 1], [30000, 1000000000, 400000000], [30000, 100, 1], [30000, 2, 1], [29999, 1000000000, 1]]) out.push(make(n, limit, lo));
      out.push(`30000 1000000000\n${new Array(30000).fill(500000000).join(' ')}\n`, `30000 1000000000\n${new Array(30000).fill(500000001).join(' ')}\n`, `30000 30001\n${many(30000, (i) => i + 1).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 50000', '-10^9 <= each number <= 10^9'],
    slug: 'longest-zigzag-subsequence',
    title: 'The Longest Up-and-Down Subsequence',
    tags: ['greedy', 'subsequence', 'zigzag'],
    concept: {
      title: 'Count the turns of the sequence: every local peak and valley counts, flat parts are ignored',
      body: [
        'A *wiggle sequence* is a sequence in which the differences between neighbours **alternate between positive and negative** (the first difference may be either). `1 7 4 9 2 5` is a wiggle sequence; `1 4 7 2 5` is not, and neither is `1 7 7` (a zero difference breaks it). Given a list, find the length of its **longest subsequence** that is a wiggle sequence (delete any elements, keep the order). For `1 7 4 9 2 5` the whole list works: 6. For `1 17 5 10 13 15 10 5 16 8` the answer is 7.',
        'Walk through the list and keep two numbers: `up`, the length of the longest wiggle subsequence that **ends with a rise**, and `down`, the longest that **ends with a fall**. If the next number is **bigger** than the previous one, it can extend any subsequence that ended with a fall: `up = down + 1`. If it is **smaller**, `down = up + 1`. If it is equal, nothing changes. The answer is `max(up, down)`. The reason is that on a long rise like `1 2 3 4 5` we can always keep only the last element of the rise, which behaves like the top of a hill.',
        { code: 'up = down = 1\nfor i in range(1, n):\n    if a[i] > a[i - 1]:\n        up = down + 1\n    elif a[i] < a[i - 1]:\n        down = up + 1\nprint(max(up, down))' },
        'This greedy counts the *turning points* of the list: the number of direction changes plus 1 (ignoring flat parts). It runs in one pass, O(n) time and O(1) memory. A DP over all pairs would be O(n^2), and the greedy shows that only the neighbouring differences matter.'
      ]
    },
    statement: ['A list of `n` integers is given. A sequence is a wiggle sequence if the differences between consecutive elements strictly alternate between positive and negative (a sequence with one element, or two different elements, is a wiggle sequence). Print the length of the longest subsequence of the list that is a wiggle sequence.'],
    outputFormat: ['Print the length of the longest wiggle subsequence.'],
    examples: [{ input: '6\n1 7 4 9 2 5\n', note: 'The whole list is a wiggle sequence: 6.' }, { input: '10\n1 17 5 10 13 15 10 5 16 8\n', note: 'For example 1 17 5 15 5 16 8: 7.' }],
    hints: ['Keep the longest wiggle subsequence that ends with a rise (up) and with a fall (down).', 'A bigger number gives up = down + 1; a smaller number gives down = up + 1.', 'Equal neighbours change nothing.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        up = down = 1
        for i in range(1, n):
            if a[i] > a[i - 1]:
                up = down + 1
            elif a[i] < a[i - 1]:
                down = up + 1
        print(max(up, down))`,
      cpp: r`
        long long up = 1, down = 1;
        for (long long i = 1; i < n; i++) {
            if (a[i] > a[i - 1]) up = down + 1;
            else if (a[i] < a[i - 1]) down = up + 1;
        }
        cout << max(up, down) << "\n";`,
      java: r`
        long up = 1, down = 1;
        for (int i = 1; i < n; i++) {
            if (a[i] > a[i - 1]) up = down + 1;
            else if (a[i] < a[i - 1]) down = up + 1;
        }
        System.out.println(Math.max(up, down));`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['up and down are the lengths of the longest wiggle subsequences ending with a rise and with a fall; a bigger number sets up = down + 1, a smaller one sets down = up + 1. The answer is the larger of the two.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const a = arrOf(input); const n = a.length;
      if (n <= 2500) { const up = new Array(n).fill(1), down = new Array(n).fill(1); let best = 1; for (let i = 1; i < n; i++) { for (let j = 0; j < i; j++) { if (a[i] > a[j]) up[i] = Math.max(up[i], down[j] + 1); else if (a[i] < a[j]) down[i] = Math.max(down[i], up[j] + 1); } best = Math.max(best, up[i], down[i]); } return String(best); } // the quadratic table for the small and medium inputs
      let turns = 0, prevSign = 0; for (let i = 1; i < n; i++) { const d = Math.sign(a[i] - a[i - 1]); if (d !== 0 && d !== prevSign) { turns++; prevSign = d; } } return String(turns + 1);
    },
    tests() {
      const g = rng(3038); const out = ['6\n1 7 4 9 2 5\n', '10\n1 17 5 10 13 15 10 5 16 8\n', '1\n5\n', '3\n3 3 3\n', '4\n1 2 3 4\n'];
      const brute = (input) => { const a = arrOf(input); const n = a.length; let best = 1; for (let mask = 1; mask < (1 << n); mask++) { const sub = []; for (let i = 0; i < n; i++) if (mask >> i & 1) sub.push(a[i]); let ok = true; for (let i = 1; i < sub.length && ok; i++) { const d = sub[i] - sub[i - 1]; if (d === 0) ok = false; if (i >= 2 && Math.sign(d) === Math.sign(sub[i - 1] - sub[i - 2])) ok = false; } if (ok) best = Math.max(best, sub.length); } return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 11); return list(n, randArray(g, n, 0, 5)); }, (i) => this.solve(i), brute, 600);
      for (const [n, lo, hi] of [[10, 0, 5], [100, -50, 50], [1000, -1000000000, 1000000000], [2500, 0, 3], [30000, -1000000000, 1000000000], [50000, 0, 1], [50000, 0, 100], [49999, -5, 5]]) out.push(list(n, randArray(g, n, lo, hi)));
      out.push(list(50000, many(50000, (i) => i)), list(50000, many(50000, (i) => (i % 2 ? 1 : 0))), list(50000, many(50000, (i) => (i % 3 === 0 ? 5 : i % 3 === 1 ? 1 : 3))), list(50000, new Array(50000).fill(7)));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `q`: the number of questions.', 'The second line has `q` numbers `N` (written as digits, without leading zeros).'],
    constraints: ['1 <= q <= 2000', '1 <= N <= 10^18'],
    slug: 'largest-number-with-rising-digits',
    title: 'The Largest Number Not Above N Whose Digits Never Decrease',
    tags: ['greedy', 'digits', 'math'],
    concept: {
      title: 'Find the first place where the digits fall, lower the digit before it, and fill the rest with nines',
      body: [
        'A number has *non-decreasing digits* if each digit is at least as big as the digit before it: `1234` and `1233` and `11199` qualify, `132` and `10` do not. For each given `N` find the **largest number that does not exceed `N` and has non-decreasing digits**. For `N = 10` the answer is 9; for `N = 1234` it is 1234; for `N = 332` it is 299.',
        'If `N` already has non-decreasing digits, the answer is `N`. Otherwise look at the digits from the left to the right and find the **first place where a digit is bigger than the next one**, say `d[i] > d[i+1]`. All the digits up to and including `d[i]` form a non-decreasing run, and the number cannot keep `d[i]` as it is, because the next digit must be at least `d[i]`, which would make the number bigger than `N` (or equal digits are impossible). So **lower the digit `d[i]` by one** and set **all the digits after it to 9** (the largest possible). But lowering `d[i]` may break the order with the digit before it (`d[i-1] > d[i] - 1`); then repeat the same step to the left. A clean way: scan from the right to the left; whenever `d[i-1] > d[i]`, decrement `d[i-1]` and remember `i` as the place from which all digits become 9.',
        { code: 'digits = list(map(int, str(N)))\nmark = len(digits)                         # from this place on all digits become 9\nfor i in range(len(digits) - 1, 0, -1):\n    if digits[i - 1] > digits[i]:\n        digits[i - 1] -= 1\n        mark = i\nfor i in range(mark, len(digits)):\n    digits[i] = 9\nprint(int("".join(map(str, digits))))' },
        'Example: `332` — from the right, `3 > 2` makes the middle digit 2 and `mark = 2`; then `3 > 2` again makes the first digit 2 and `mark = 1`; the digits after the mark become 9: `299`. A leading digit that becomes 0 disappears when the string is converted to an integer (`10` gives `09 = 9`). The work per number is O(number of digits).'
      ]
    },
    statement: ['For each of the `q` given numbers `N`, print the largest number not greater than `N` whose digits (in the usual decimal notation, without leading zeros) never decrease from left to right.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '3\n10 1234 332\n', note: '10 becomes 9, 1234 is already fine, 332 becomes 299: 9 1234 299.' }],
    hints: ['If the digits already never decrease, the answer is N.', 'Otherwise find a place where a digit is bigger than the next one, lower it by 1 and make everything to the right 9.', 'Scan from the right to the left so that the lowered digit is checked against its left neighbour too.'],
    program: {
      io: ['q:int', 'ns:word[q]'],
      fast: true,
      python: r`
        answer = []
        for text in ns:
            digits = [ord(c) - 48 for c in text]
            mark = len(digits)
            for i in range(len(digits) - 1, 0, -1):
                if digits[i - 1] > digits[i]:
                    digits[i - 1] -= 1
                    mark = i
            for i in range(mark, len(digits)):
                digits[i] = 9
            answer.append(int("".join(map(str, digits))))
        print(*answer)`,
      cpp: r`
        for (long long t = 0; t < q; t++) {
            string d = ns[t];
            size_t mark = d.size();
            for (size_t i = d.size() - 1; i > 0; i--) {
                if (d[i - 1] > d[i]) {
                    d[i - 1]--;
                    mark = i;
                }
            }
            for (size_t i = mark; i < d.size(); i++) d[i] = '9';
            size_t first = 0;
            while (first + 1 < d.size() && d[first] == '0') first++;
            cout << (t ? " " : "") << d.substr(first);
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            char[] d = ns[t].toCharArray();
            int mark = d.length;
            for (int i = d.length - 1; i > 0; i--) {
                if (d[i - 1] > d[i]) {
                    d[i - 1]--;
                    mark = i;
                }
            }
            for (int i = mark; i < d.length; i++) d[i] = '9';
            int first = 0;
            while (first + 1 < d.length && d[first] == '0') first++;
            out.append(t > 0 ? " " : "").append(new String(d, first, d.length - first));
        }
        System.out.println(out);`
    },
    solution: { explanation: ['Scanning the digits from the right to the left, whenever a digit is smaller than the one before it, the earlier digit is decreased by 1 and the place is remembered; all the digits from the last remembered place on become 9, and leading zeros are dropped.'], complexity: 'Time O(q * digits), space O(digits).' },
    solve(input) {
      return rows(input)[1].split(' ').map((text) => { const N = BigInt(text); const s = text; const ok = (str) => { for (let i = 1; i < str.length; i++) if (str[i] < str[i - 1]) return false; return true; }; if (ok(s)) return text; // the answer has the form: a prefix of N lowered at one place and nines; try every place for the lowering and keep the largest valid one
        let best = 0n; for (let i = 0; i < s.length; i++) { const prefix = s.slice(0, i); const digit = Number(s[i]); if (digit === 0) continue; const cand = prefix + String(digit - 1) + '9'.repeat(s.length - i - 1); const stripped = cand.replace(/^0+/, '') || '0'; if (ok(stripped) && BigInt(stripped) <= N && BigInt(stripped) > best) best = BigInt(stripped); } return String(best); }).join(' ');
    },
    tests() {
      const g = rng(3039); const out = ['3\n10 1234 332\n', '1\n1\n', '1\n1000000000000000000\n', '2\n999999999999999999 100\n'];
      const brute = (input) => rows(input)[1].split(' ').map((t) => { let x = Number(t); const ok = (v) => { const s = String(v); for (let i = 1; i < s.length; i++) if (s[i] < s[i - 1]) return false; return true; }; while (!ok(x)) x--; return x; }).join(' ');
      crossCheck(() => { const q = randInt(g, 1, 6); return `${q}\n${many(q, () => randInt(g, 1, 3000)).join(' ')}\n`; }, (i) => this.solve(i), brute, 600);
      const bigNumber = (digits) => { let s = String(randInt(g, 1, 9)); while (s.length < digits) s += String(randInt(g, 0, 9)); return s; };
      const make = (q, maxDigits) => `${q}\n${many(q, () => bigNumber(randInt(g, 1, maxDigits))).join(' ')}\n`;
      for (const [q, d] of [[10, 5], [100, 9], [500, 12], [2000, 18], [2000, 18], [2000, 3]]) out.push(make(q, d));
      out.push(`2000\n${many(2000, (i) => String(10 ** (1 + (i % 17)))).join(' ')}\n`, `2000\n${many(2000, (i) => '9'.repeat(1 + (i % 18))).join(' ')}\n`, `2000\n${many(2000, (i) => '1' + '0'.repeat(i % 18) + String(i % 10)).map((x) => (x.length > 18 ? x.slice(0, 18) : x)).join(' ')}\n`);
      return out;
    }
  }
];
