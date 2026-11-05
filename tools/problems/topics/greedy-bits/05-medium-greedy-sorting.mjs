import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const arrOf = (input) => nums(rows(input)[1]);
const sum = (a) => a.reduce((x, y) => x + y, 0);

// a small binary min-heap of numbers for the reference solutions
class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(x) { const a = this.a; a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p] <= a[i]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a; const top = a[0]; const last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, rr = l + 1; let m = i; if (l < a.length && a[l] < a[m]) m = l; if (rr < a.length && a[rr] < a[m]) m = rr; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; }
}

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n` and `k`: the number of values and the number of operations.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 50000', '1 <= k <= 10^9', '-10^9 <= each number <= 10^9'],
    slug: 'negate-exactly-k-times',
    title: 'Negate Exactly K Times for the Largest Sum',
    tags: ['greedy', 'sorting', 'parity'],
    concept: {
      title: 'Flip the most negative numbers first; the leftover flips are wasted in pairs, and one odd flip hits the smallest absolute value',
      body: [
        'You are given a list and a number `k`. In one operation you choose **any element** (the same one may be chosen again) and replace it by its negation. You must make **exactly `k` operations**. What is the **largest sum** the list can have in the end? For `4 2 3` and `k = 1` the answer is 5: the only choice that costs the least is to negate the 2. For `3 -1 0 2` and `k = 3` the answer is 6.',
        'Negating a negative number **gains** `2 * |x|`, so the best use of the first operations is on the **most negative** numbers, in the order from the smallest. If `k` is not larger than the number of negative values, negate the `k` smallest of them and stop. Otherwise all the negatives become positive, and `rest = k - (number of negatives)` operations are left. Two operations on the same element cancel each other, so the operations come in useless pairs: only the **parity** of `rest` matters. If `rest` is even, nothing more happens. If it is odd, exactly one more element must end up negated, and the cheapest choice is the element with the **smallest absolute value**: the sum drops by `2 * min|x|` (this is 0 if the list contains a zero).',
        { code: 'a.sort()\ni = 0\nwhile i < n and i < k and a[i] < 0:\n    a[i] = -a[i]                    # a gain of 2 * |a[i]|\n    i += 1\nrest = k - i\ntotal = sum(a)\nif rest % 2 == 1:\n    total -= 2 * min(a)             # all values are non-negative here\nprint(total)' },
        'If `k` is smaller than the number of negatives, then `rest` is 0 and the odd step is skipped, so `min(a)` is never taken over a list that still contains negatives. The whole solution is a sort plus one pass: O(n log n) time. Use 64-bit numbers: the sum can reach 5 * 10^13.'
      ]
    },
    statement: ['A list of `n` integers and a number `k` are given. In one operation you choose an element (possibly one you have already chosen) and replace it with its negation. Make exactly `k` operations so that the sum of the list is as large as possible, and print that sum.'],
    outputFormat: ['Print the largest possible sum.'],
    examples: [{ input: '3 1\n4 2 3\n', note: 'One operation is forced; negating the 2 gives 4 - 2 + 3 = 5.' }, { input: '4 3\n3 -1 0 2\n', note: 'Negate -1, then negate the 0 twice: 3 + 1 + 0 + 2 = 6.' }],
    hints: ['Negating a negative number increases the sum by twice its absolute value.', 'Two operations on one element cancel each other, so only the parity of the leftover operations matters.', 'An odd leftover must be spent on the element with the smallest absolute value.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      python: r`
        a.sort()
        i = 0
        while i < n and i < k and a[i] < 0:
            a[i] = -a[i]
            i += 1
        rest = k - i
        total = sum(a)
        if rest % 2 == 1:
            total -= 2 * min(a)
        print(total)`,
      cpp: r`
        sort(a.begin(), a.end());
        long long i = 0;
        while (i < n && i < k && a[i] < 0) {
            a[i] = -a[i];
            i++;
        }
        long long rest = k - i, total = 0, smallest = a[0];
        for (long long x : a) {
            total += x;
            smallest = min(smallest, x);
        }
        if (rest % 2 == 1) total -= 2 * smallest;
        cout << total << "\n";`,
      java: r`
        Arrays.sort(a);
        int i = 0;
        while (i < n && i < k && a[i] < 0) {
            a[i] = -a[i];
            i++;
        }
        long rest = k - i, total = 0, smallest = a[0];
        for (long x : a) {
            total += x;
            smallest = Math.min(smallest, x);
        }
        if (rest % 2 == 1) total -= 2 * smallest;
        System.out.println(total);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The most negative numbers are negated first (as long as operations remain); if an odd number of operations is left after all negatives are gone, the smallest absolute value is negated once more.'], complexity: 'Time O(n log n), space O(1) extra.' },
    solve(input) {
      const [, k] = nums(rows(input)[0]); const a = arrOf(input).slice().sort((x, y) => x - y); const negs = a.filter((x) => x < 0).length;
      if (k <= negs) { let t = sum(a); for (let i = 0; i < k; i++) t -= 2 * a[i]; return String(t); } // k flips on the k most negative numbers
      const rest = k - negs; let t = a.reduce((s, x) => s + Math.abs(x), 0); const minAbs = a.reduce((m, x) => Math.min(m, Math.abs(x)), Infinity); if (rest % 2 === 1) t -= 2 * minAbs; return String(t);
    },
    tests() {
      const g = rng(3051); const out = ['3 1\n4 2 3\n', '4 3\n3 -1 0 2\n', '1 1\n5\n', '1 1000000000\n-7\n', '3 2\n-5 -4 -3\n'];
      const make = (n, k, lo, hi) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (input) => { const [n, k] = nums(rows(input)[0]); const a = arrOf(input); let best = -Infinity; const go = (arr, left) => { if (left === 0) { best = Math.max(best, sum(arr)); return; } for (let i = 0; i < n; i++) { arr[i] = -arr[i]; go(arr, left - 1); arr[i] = -arr[i]; } }; go(a.slice(), k); return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 4); return make(n, randInt(g, 1, 6), -4, 4); }, (i) => this.solve(i), brute, 700);
      for (const [n, k, lo, hi] of [[10, 5, -10, 10], [100, 30, -100, 100], [1000, 5000, -1000000, 1000000], [30000, 7, -1000000000, 1000000000], [50000, 1000000000, -1000000000, 1000000000], [50000, 49999, -1000000000, 0], [50000, 25001, -1000000000, 1000000000], [49999, 123456789, 1, 1000000000], [50000, 3, -5, 5]]) out.push(make(n, k, lo, hi));
      out.push(`50000 50000\n${new Array(50000).fill(-1000000000).join(' ')}\n`, `50000 1000000000\n${new Array(50000).fill(0).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of cards each player has.', 'The second line has `n` numbers: your cards.', 'The third line has `n` numbers: the cards of the opponent, in the order in which they will be played.'],
    constraints: ['1 <= n <= 50000', '0 <= each card <= 10^9'],
    slug: 'beat-the-opponents-cards',
    title: 'Win As Many Rounds Against the Opponent as You Can',
    tags: ['greedy', 'sorting', 'two-pointers', 'matching'],
    concept: {
      title: 'Spend the cheapest card that still wins; sacrifice your weakest card on the rounds you cannot win',
      body: [
        'You and an opponent each hold `n` cards with numbers on them. You know the order in which the opponent will play his cards, and you may play yours **in any order you like**. In every round the higher card wins; equal cards win nothing. What is the **largest number of rounds** you can win? For your cards `2 7 11 15` against `1 10 4 11` you can win all four rounds: `2` beats `1`, `11` beats `10`, `7` beats `4`, `15` beats `11`.',
        'Because you choose the order freely, the question is a matching: pair each of your cards with a different opponent card so that as many pairs as possible have *your card bigger*. Sort both lists. Look at the opponent\'s **strongest** card first. If your strongest card beats it, use that card on it, since no weaker card of yours can win this round, and this is the only use of a strong card that cannot be made worse. If your strongest card does not beat it, then **no card** of yours does, so this round is lost anyway, and it should absorb your **weakest** card, because the weakest card is the least useful anywhere else.',
        { code: 'a.sort(); b.sort()\nlo, hi = 0, n - 1                     # my weakest and my strongest remaining card\nwins = 0\nfor j in range(n - 1, -1, -1):        # the opponent\'s cards from the strongest\n    if a[hi] > b[j]:\n        wins += 1\n        hi -= 1\n    else:\n        lo += 1                         # a lost round takes my weakest card\nprint(wins)' },
        'The program in the editor does the same from the other end: for each of my cards from the weakest, it tries to beat the *weakest unbeaten* opponent card with the *weakest* card that does. Both are the classic "greedy matching" on two sorted lists, with the same O(n log n) cost from the sort.'
      ]
    },
    statement: ['Two players each have `n` cards. The first player may play his cards in any order; the second plays his in the given order. In every round the higher card wins the round (equal cards: no winner). Print the largest possible number of rounds the first player can win.'],
    outputFormat: ['Print the largest number of rounds you can win.'],
    examples: [{ input: '4\n2 7 11 15\n1 10 4 11\n', note: 'All four rounds can be won: 4.' }, { input: '3\n1 1 1\n1 1 1\n', note: 'Equal cards win nothing: 0.' }],
    hints: ['Sort both lists.', 'Walk over your cards from the weakest; a card that beats the weakest unbeaten opponent card should be used on it.', 'A card that cannot win anything is simply skipped.'],
    program: {
      io: ['n:int', 'a:int[n]', 'b:int[n]'],
      fast: true,
      python: r`
        a.sort()
        b.sort()
        wins = 0
        for x in a:
            if x > b[wins]:
                wins += 1
        print(wins)`,
      cpp: r`
        sort(a.begin(), a.end());
        sort(b.begin(), b.end());
        long long wins = 0;
        for (long long x : a) {
            if (x > b[wins]) wins++;
        }
        cout << wins << "\n";`,
      java: r`
        Arrays.sort(a);
        Arrays.sort(b);
        int wins = 0;
        for (long x : a) {
            if (x > b[wins]) wins++;
        }
        System.out.println(wins);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Both lists are sorted; each of my cards, from the weakest, is compared with the weakest opponent card that is still unbeaten, and if it wins, that pair is counted and the pointer moves on.'], complexity: 'Time O(n log n), space O(1) extra.' },
    solve(input) {
      const n = Number(rows(input)[0]); const a = nums(rows(input)[1]).sort((x, y) => x - y), b = nums(rows(input)[2]).sort((x, y) => x - y);
      let hi = n - 1, wins = 0; for (let j = n - 1; j >= 0; j--) { if (a[hi] > b[j]) { wins++; hi--; } } // from the opponent's strongest card: my strongest wins it, otherwise my weakest is given up
      return String(wins);
    },
    tests() {
      const g = rng(3052); const out = ['4\n2 7 11 15\n1 10 4 11\n', '3\n1 1 1\n1 1 1\n', '1\n5\n4\n', '1\n4\n4\n'];
      const make = (n, hi) => `${n}\n${randArray(g, n, 0, hi).join(' ')}\n${randArray(g, n, 0, hi).join(' ')}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); const a = nums(rows(input)[1]), b = nums(rows(input)[2]); let best = 0; const used = new Array(n).fill(false); const go = (j, w) => { if (j === n) { best = Math.max(best, w); return; } for (let i = 0; i < n; i++) { if (used[i]) continue; used[i] = true; go(j + 1, w + (a[i] > b[j] ? 1 : 0)); used[i] = false; } }; go(0, 0); return String(best); };
      crossCheck(() => make(randInt(g, 1, 6), 6), (i) => this.solve(i), brute, 600);
      for (const [n, hi] of [[10, 10], [100, 50], [1000, 1000000], [50000, 1000000000], [30000, 1000000000], [50000, 1000], [49999, 3], [50000, 0]]) out.push(make(n, hi));
      out.push(`30000\n${many(30000, (i) => i + 1).join(' ')}\n${many(30000, (i) => i).join(' ')}\n`, `30000\n${many(30000, (i) => i).join(' ')}\n${many(30000, (i) => i + 1).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `power`: the number of tokens and your starting power.', 'The second line has `n` numbers: the values of the tokens.'],
    constraints: ['1 <= n <= 50000', '0 <= power <= 10^9', '1 <= each token <= 10^9'],
    slug: 'highest-token-score',
    title: 'Play the Tokens for the Highest Score',
    tags: ['greedy', 'sorting', 'two-pointers', 'game'],
    concept: {
      title: 'Buy score with the cheapest tokens; when you cannot afford one, sell score for the most expensive token',
      body: [
        'You start with some **power** and **score 0**, and a bag of tokens, each with a value. Every token may be played **once**, in one of two ways. **Face up:** if your power is at least the value, you lose that much power and gain **1 score**. **Face down:** if your score is at least 1, you gain the value as power and lose **1 score**. Tokens can be played in any order, and you may leave some unplayed. What is the **highest score** you can have at any moment? With power 150 and the tokens `100 200 300 400` the answer is 2.',
        'A face-up play should always use the **cheapest** token, because the score gained is the same (1) whatever the token, and the cheaper it is the more power remains. A face-down play should always use the **most expensive** remaining token, because the score lost is the same (1) and the power gained is the largest. So sort the tokens and keep two ends: the cheapest unplayed token at the left, the most expensive at the right.',
        { code: 't.sort()\nlo, hi = 0, n - 1\nscore = best = 0\nwhile lo <= hi:\n    if power >= t[lo]:                 # buy score with the cheapest token\n        power -= t[lo]; lo += 1\n        score += 1\n        best = max(best, score)\n    elif score > 0:                    # sell one score for the most expensive token\n        power += t[hi]; hi -= 1\n        score -= 1\n    else:\n        break                          # no power and no score: nothing more can be played\nprint(best)' },
        'Selling score for power is only worth it when it lets us buy more score later, but the algorithm does it only when it is the *only* possible move, and the best score is recorded after every purchase, so a useless sale at the very end never lowers the answer. The sort dominates the work: O(n log n).'
      ]
    },
    statement: ['You have some power, a score of 0 and `n` tokens. A token can be played once: face up (needs power >= its value; power decreases by the value, score increases by 1) or face down (needs score >= 1; power increases by the value, score decreases by 1). Print the largest score you can have at any moment, if you play the tokens in the best way.'],
    outputFormat: ['Print the highest score.'],
    examples: [{ input: '4 150\n100 200 300 400\n', note: 'Play 100 face up (score 1, power 50); the score cannot go higher: 1.' }, { input: '4 200\n100 200 300 400\n', note: 'Play 100 up (power 100, score 1), play 400 down (power 500, score 0), then 200 and 300 up: score 2.' }],
    hints: ['Sort the tokens.', 'Face up always with the cheapest token, face down always with the most expensive one.', 'Record the best score after every face-up play.'],
    program: {
      io: ['n:int power:int', 't:int[n]'],
      fast: true,
      python: r`
        t.sort()
        lo, hi = 0, n - 1
        score = best = 0
        while lo <= hi:
            if power >= t[lo]:
                power -= t[lo]
                lo += 1
                score += 1
                if score > best:
                    best = score
            elif score > 0:
                power += t[hi]
                hi -= 1
                score -= 1
            else:
                break
        print(best)`,
      cpp: r`
        sort(t.begin(), t.end());
        long long lo = 0, hi = n - 1, score = 0, best = 0;
        while (lo <= hi) {
            if (power >= t[lo]) {
                power -= t[lo];
                lo++;
                score++;
                best = max(best, score);
            } else if (score > 0) {
                power += t[hi];
                hi--;
                score--;
            } else {
                break;
            }
        }
        cout << best << "\n";`,
      java: r`
        Arrays.sort(t);
        int lo = 0, hi = (int) n - 1;
        long score = 0, best = 0;
        while (lo <= hi) {
            if (power >= t[lo]) {
                power -= t[lo];
                lo++;
                score++;
                best = Math.max(best, score);
            } else if (score > 0) {
                power += t[hi];
                hi--;
                score--;
            } else {
                break;
            }
        }
        System.out.println(best);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The tokens are sorted. While possible, the cheapest token is played face up (score + 1); otherwise, if the score is positive, the most expensive token is played face down. The best score after every face-up play is the answer.'], complexity: 'Time O(n log n), space O(1) extra.' },
    solve(input) {
      const [n, power0] = nums(rows(input)[0]); const t = arrOf(input).slice().sort((x, y) => x - y); // the same strategy written with a deque
      const dq = t.slice(); let head = 0, tail = n - 1, p = power0, score = 0, best = 0; while (head <= tail) { if (p >= dq[head]) { p -= dq[head++]; best = Math.max(best, ++score); } else if (score > 0) { p += dq[tail--]; score--; } else break; } return String(best);
    },
    tests() {
      const g = rng(3053); const out = ['4 150\n100 200 300 400\n', '4 200\n100 200 300 400\n', '1 0\n5\n', '1 5\n5\n', '3 0\n1 2 3\n'];
      const make = (n, power, hi) => `${n} ${power}\n${randArray(g, n, 1, hi).join(' ')}\n`;
      const brute = (input) => { const [n, power] = nums(rows(input)[0]); const t = arrOf(input); let best = 0; const seen = new Set(); const go = (mask, p, s) => { const key = mask + ',' + p + ',' + s; if (seen.has(key)) return; seen.add(key); best = Math.max(best, s); for (let i = 0; i < n; i++) { if (mask >> i & 1) continue; if (p >= t[i]) go(mask | (1 << i), p - t[i], s + 1); if (s >= 1) go(mask | (1 << i), p + t[i], s - 1); } }; go(0, power, 0); return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 6); return make(n, randInt(g, 0, 8), 7); }, (i) => this.solve(i), brute, 800);
      for (const [n, power, hi] of [[10, 10, 10], [100, 50, 100], [1000, 5000, 1000], [50000, 1000000000, 1000000000], [50000, 100000, 100000], [50000, 0, 1000000000], [50000, 1000000000, 20000], [49999, 500, 1000], [50000, 25000, 2]]) out.push(make(n, power, hi));
      out.push(`50000 1\n${new Array(50000).fill(1).join(' ')}\n`, `50000 1000000000\n${new Array(50000).fill(1000000000).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the length of the list.', 'The second line has `n` numbers.'],
    constraints: ['1 <= n <= 50000', '1 <= each number <= 10^9'],
    slug: 'halve-the-list',
    title: 'Delete the Fewest Different Values to Halve the List',
    tags: ['greedy', 'sorting', 'counting'],
    concept: {
      title: 'Always delete the value that occurs most often',
      body: [
        'You may choose some **values** and delete **every occurrence** of each chosen value from the list. What is the **smallest number of different values** you must choose so that **at least half** of the elements of the list are removed? For `3 3 3 3 5 5 5 2 2 7` the answer is 2: delete all the 3s (4 elements) and all the 5s (3 elements): 7 of 10 are removed, and one value alone (4 elements) is not enough.',
        'Counting the occurrences of each distinct value gives a list of counts, for example `4 3 2 1`. Choosing a value removes exactly its count, so we need to pick **as few counts as possible whose sum is at least `n / 2`**. The best way is to take the **largest** counts first: any other choice of the same number of values removes no more elements than the choice of the largest ones.',
        { code: 'count = {}\nfor x in a: count[x] = count.get(x, 0) + 1\nremoved = chosen = 0\nfor c in sorted(count.values(), reverse=True):\n    removed += c\n    chosen += 1\n    if 2 * removed >= n:          # at least half of the list is gone\n        break\nprint(chosen)' },
        'Counting with a hash map or by sorting is O(n) or O(n log n), and sorting the counts is at most O(n log n). The same "take the biggest items until the target is reached" pattern appears whenever the cost of an item is the same (here: 1 per value) but its benefit differs.'
      ]
    },
    statement: ['A list of `n` integers is given. You choose some values and delete all occurrences of each chosen value. Print the smallest number of different values you must choose so that at least half of the elements are deleted (that is, the number of deleted elements times 2 is at least `n`).'],
    outputFormat: ['Print the smallest number of chosen values.'],
    examples: [{ input: '10\n3 3 3 3 5 5 5 2 2 7\n', note: 'Delete the 3s and the 5s: 7 of 10 elements: 2 values.' }, { input: '5\n7 7 7 7 7\n', note: 'One value removes everything: 1.' }],
    hints: ['Count how many times each value occurs.', 'Removing a value removes exactly its count of elements.', 'Take the largest counts first until twice the removed amount reaches n.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        removed = chosen = 0
        for c in sorted(count.values(), reverse=True):
            removed += c
            chosen += 1
            if 2 * removed >= n:
                break
        print(chosen)`,
      cpp: r`
        sort(a.begin(), a.end());
        vector<long long> counts;
        for (long long i = 0; i < n;) {
            long long j = i;
            while (j < n && a[j] == a[i]) j++;
            counts.push_back(j - i);
            i = j;
        }
        sort(counts.rbegin(), counts.rend());
        long long removed = 0, chosen = 0;
        for (long long c : counts) {
            removed += c;
            chosen++;
            if (2 * removed >= n) break;
        }
        cout << chosen << "\n";`,
      java: r`
        Arrays.sort(a);
        long[] counts = new long[(int) n];
        int distinct = 0;
        for (int i = 0; i < n;) {
            int j = i;
            while (j < n && a[j] == a[i]) j++;
            counts[distinct++] = j - i;
            i = j;
        }
        Arrays.sort(counts, 0, distinct);
        long removed = 0, chosen = 0;
        for (int k = distinct - 1; k >= 0; k--) {
            removed += counts[k];
            chosen++;
            if (2 * removed >= n) break;
        }
        System.out.println(chosen);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The occurrences of every value are counted and the counts are taken from the largest down until at least half of the list is removed; the number of counts taken is the answer.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const a = arrOf(input); const n = a.length; const cnt = new Map(); for (const x of a) cnt.set(x, (cnt.get(x) || 0) + 1); const counts = [...cnt.values()].sort((x, y) => x - y); let removed = 0, chosen = 0; while (2 * removed < n) { removed += counts.pop(); chosen++; } return String(chosen);
    },
    tests() {
      const g = rng(3054); const out = ['10\n3 3 3 3 5 5 5 2 2 7\n', '5\n7 7 7 7 7\n', '1\n4\n', '2\n1 2\n', '6\n1 2 3 4 5 6\n'];
      const make = (n, hi) => `${n}\n${randArray(g, n, 1, hi).join(' ')}\n`;
      const brute = (input) => { const a = arrOf(input); const n = a.length; const cnt = new Map(); for (const x of a) cnt.set(x, (cnt.get(x) || 0) + 1); const c = [...cnt.values()]; let best = c.length; for (let mask = 1; mask < (1 << c.length); mask++) { let removed = 0, size = 0; for (let i = 0; i < c.length; i++) if (mask >> i & 1) { removed += c[i]; size++; } if (2 * removed >= n) best = Math.min(best, size); } return String(best); };
      crossCheck(() => make(randInt(g, 1, 14), randInt(g, 1, 7)), (i) => this.solve(i), brute, 800);
      for (const [n, hi] of [[10, 5], [100, 20], [1000, 1000], [50000, 1000000000], [50000, 50000], [50000, 3000], [50000, 10], [49999, 2], [50000, 1]]) out.push(make(n, hi));
      out.push(`50000\n${many(50000, (i) => 1 + Math.floor(Math.sqrt(i))).join(' ')}\n`, `50000\n${many(50000, (i) => i + 1).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 100000', 'The word consists of lowercase English letters.'],
    slug: 'distinct-letter-counts',
    title: 'Delete the Fewest Letters So No Two Letters Share a Count',
    tags: ['greedy', 'counting', 'sorting', 'string'],
    concept: {
      title: 'Sort the letter counts from the largest and push every count just below the previous one',
      body: [
        'From the word you may delete any letters. After the deletions the word must be *good*: **no two different letters occur the same number of times** (a letter that is deleted completely does not count, so many letters may have the count 0). What is the **fewest deletions** that make the word good? For `aaabbbcc` the counts are 3, 3, 2; deleting one `b` gives 3, 2, 2 which is still bad; deleting one `b` and one `c` gives 3, 2, 1, so the answer is 2.',
        'Only the multiset of the **counts** matters, not the order of the letters. Sort the counts from the largest. The largest count can stay as it is. Each next count must become **strictly smaller than the count before it** (after that one was adjusted): `allowed = min(count, previous - 1)`, and never below 0. Lowering a count further than necessary only wastes deletions, and raising is not allowed, so this choice is the cheapest one for the current letter and leaves the most room for the next ones.',
        { code: 'counts = [0] * 26\nfor c in s: counts[ord(c) - 97] += 1\ncounts.sort(reverse=True)\ndeleted = 0\nprevious = len(s) + 1\nfor c in counts:\n    allowed = max(0, min(c, previous - 1))\n    deleted += c - allowed\n    previous = allowed         # once previous is 0, every later letter is deleted completely\nprint(deleted)' },
        'The sorting is over only 26 numbers, so the algorithm is O(n + 26 log 26): one pass over the word to count the letters and a tiny loop. The same idea works for any set of items whose "sizes" must become pairwise different by decreasing them.'
      ]
    },
    statement: ['A word is given. You may delete letters from it. Print the smallest number of deletions after which no two different letters of the word occur the same number of times.'],
    outputFormat: ['Print the smallest number of deletions.'],
    examples: [{ input: 'aaabbbcc\n', note: 'The counts 3, 3, 2 become 3, 2, 1 with two deletions: 2.' }, { input: 'abc\n', note: 'The counts 1, 1, 1 become 1, 0, 0 (two letters are deleted completely): 2.' }],
    hints: ['Only the 26 counts matter.', 'Sort the counts in descending order.', 'Make each count at most one less than the previous (adjusted) count, but not below 0.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        counts = [0] * 26
        for ch in s:
            counts[ord(ch) - 97] += 1
        counts.sort(reverse=True)
        deleted = 0
        previous = len(s) + 1
        for c in counts:
            allowed = max(0, min(c, previous - 1))
            deleted += c - allowed
            previous = allowed
        print(deleted)`,
      cpp: r`
        vector<long long> counts(26, 0);
        for (char ch : s) counts[ch - 'a']++;
        sort(counts.rbegin(), counts.rend());
        long long deleted = 0, previous = (long long)s.size() + 1;
        for (long long c : counts) {
            long long allowed = max(0LL, min(c, previous - 1));
            deleted += c - allowed;
            previous = allowed;
        }
        cout << deleted << "\n";`,
      java: r`
        long[] counts = new long[26];
        for (int i = 0; i < s.length(); i++) counts[s.charAt(i) - 'a']++;
        Arrays.sort(counts);
        long deleted = 0, previous = s.length() + 1;
        for (int k = 25; k >= 0; k--) {
            long allowed = Math.max(0L, Math.min(counts[k], previous - 1));
            deleted += counts[k] - allowed;
            previous = allowed;
        }
        System.out.println(deleted);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The 26 letter counts are processed from the largest; each count is lowered to the largest value below the previous adjusted count (and at least 0), and the total of the decreases is the number of deletions.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const s = rows(input)[0]; const cnt = {}; for (const ch of s) cnt[ch] = (cnt[ch] || 0) + 1; // each count steps down until it is free (a set of used counts)
      const used = new Set(); let deleted = 0; for (const c0 of Object.values(cnt).sort((x, y) => y - x)) { let c = c0; while (c > 0 && used.has(c)) { c--; deleted++; } if (c > 0) used.add(c); } return String(deleted);
    },
    tests() {
      const g = rng(3055); const out = ['aaabbbcc\n', 'abc\n', 'a\n', 'aab\n', 'aaaabbbbccccdddd\n'];
      const fromCounts = (counts) => shuffle(g, counts.flatMap((c, i) => new Array(c).fill(String.fromCharCode(97 + i)))).join('') + '\n';
      const brute = (input) => { const s = rows(input)[0]; const n = s.length; let best = 0; for (let mask = 0; mask < (1 << n); mask++) { const cnt = new Array(26).fill(0); let kept = 0; for (let i = 0; i < n; i++) if (mask >> i & 1) { cnt[s.charCodeAt(i) - 97]++; kept++; } const seen = new Set(); let ok = true; for (const c of cnt) if (c > 0) { if (seen.has(c)) ok = false; seen.add(c); } if (ok) best = Math.max(best, kept); } return String(n - best); };
      crossCheck(() => randWord(g, randInt(g, 1, 11), 'abcde') + '\n', (i) => this.solve(i), brute, 600);
      for (const [n, al] of [[30, 'abcdefg'], [200, 'abcdefghijklmnopqrstuvwxyz'], [100000, 'abcdefghijklmnopqrstuvwxyz'], [100000, 'abcdef'], [99999, 'ab']]) out.push(randWord(g, n, al) + '\n');
      out.push(fromCounts(many(26, () => 3846)), fromCounts(many(26, (i) => 1 + (i % 3))), fromCounts(many(26, (i) => 3000 + 20 * i)), fromCounts(many(26, () => randInt(g, 3000, 3100))), fromCounts([100000]), fromCounts([50000, 50000]), fromCounts(many(26, (i) => (i < 13 ? 7000 : 0))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of dishes.', 'The second line has `n` numbers: the satisfaction of each dish.'],
    constraints: ['1 <= n <= 50000', '-10^4 <= each satisfaction <= 10^4'],
    slug: 'dishes-in-the-best-order',
    title: 'Cook the Dishes in the Order with the Best Like-Time Total',
    tags: ['greedy', 'sorting', 'prefix-sums'],
    concept: {
      title: 'Cook the dishes in increasing satisfaction; take the best ones while the running total of the top dishes stays positive',
      body: [
        'A cook can prepare the dishes in any order, one per minute, and may **skip** some of them. A dish cooked in the minute `t` (1, 2, 3, ...) with satisfaction `s` adds `t * s` to the *like-time coefficient*. What is the **largest total** the cook can reach? For the satisfactions `-1 -8 0 5 -9` the best is to skip `-8` and `-9` and cook `-1 0 5` in this order: `1*(-1) + 2*0 + 3*5 = 14`.',
        'For a fixed set of dishes, the best order is **increasing satisfaction**: the best dishes get the largest multipliers. Now decide *which* dishes to take. If we take the `k` best dishes, sorted from the best `d1 >= d2 >= ... >= dk`, then the dish `di` is multiplied by `k - i + 1`, and the total equals `P1 + P2 + ... + Pk`, where `Pm = d1 + ... + dm` is the sum of the `m` best dishes. So going from `k - 1` to `k` dishes adds exactly `Pk` to the total.',
        { code: 's.sort(reverse=True)\nprefix = total = 0\nfor x in s:\n    prefix += x                  # the sum of the best dishes so far\n    if prefix <= 0:              # taking one more dish would not add anything positive\n        break\n    total += prefix\nprint(total)' },
        'Why can we stop at the first non-positive prefix? The dishes are sorted downward, so once `Pk <= 0` the dish `dk` is not positive, every later dish is even smaller, and all the next prefix sums stay non-positive too. The work is a sort plus one pass: O(n log n). The totals reach about 2.5 * 10^13, so use 64-bit numbers.'
      ]
    },
    statement: ['A cook prepares dishes one per minute in any order and may skip some of them. A dish with satisfaction `s` that is cooked in the minute `t` (counting from 1) adds `t * s` to the total. Print the largest total the cook can get.'],
    outputFormat: ['Print the largest total (it may be 0).'],
    examples: [{ input: '5\n-1 -8 0 5 -9\n', note: 'Cook -1, 0, 5: 1*(-1) + 2*0 + 3*5 = 14.' }, { input: '3\n-5 -2 -1\n', note: 'Every dish is negative; cooking nothing gives 0.' }],
    hints: ['For a chosen set, cook it from the smallest satisfaction to the largest.', 'Taking the k best dishes gives P1 + P2 + ... + Pk, where Pm is the sum of the m best dishes.', 'Stop as soon as a prefix sum is not positive.'],
    program: {
      io: ['n:int', 's:int[n]'],
      fast: true,
      python: r`
        s.sort(reverse=True)
        prefix = total = 0
        for x in s:
            prefix += x
            if prefix <= 0:
                break
            total += prefix
        print(total)`,
      cpp: r`
        sort(s.begin(), s.end(), greater<long long>());
        long long prefix = 0, total = 0;
        for (long long x : s) {
            prefix += x;
            if (prefix <= 0) break;
            total += prefix;
        }
        cout << total << "\n";`,
      java: r`
        Arrays.sort(s);
        long prefix = 0, total = 0;
        for (int i = (int) n - 1; i >= 0; i--) {
            prefix += s[i];
            if (prefix <= 0) break;
            total += prefix;
        }
        System.out.println(total);`,
      includes: ['<algorithm>', '<functional>']
    },
    solution: { explanation: ['The satisfactions are sorted from the best; taking the k best dishes gives the sum of the first k prefix sums, so dishes are added while the prefix sum stays positive.'], complexity: 'Time O(n log n), space O(1) extra.' },
    solve(input) {
      const s = arrOf(input).slice().sort((x, y) => y - x); let P = 0, F = 0, best = 0; for (const x of s) { P += x; F += P; best = Math.max(best, F); } return String(best); // F is the total after taking the k best dishes; keep the maximum over all k
    },
    tests() {
      const g = rng(3056); const out = ['5\n-1 -8 0 5 -9\n', '3\n-5 -2 -1\n', '1\n7\n', '1\n-7\n', '4\n4 3 2 0\n'];
      const make = (n, lo, hi) => `${n}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (input) => { const s = arrOf(input); const n = s.length; const evalAll = (items) => { let best = -Infinity; const go = (rem, time, total) => { if (!rem.length) { best = Math.max(best, total); return; } for (let i = 0; i < rem.length; i++) go(rem.slice(0, i).concat(rem.slice(i + 1)), time + 1, total + time * rem[i]); }; go(items, 1, 0); return best; }; let best = 0; for (let mask = 0; mask < (1 << n); mask++) { const items = []; for (let i = 0; i < n; i++) if (mask >> i & 1) items.push(s[i]); best = Math.max(best, evalAll(items)); } return String(best); };
      crossCheck(() => make(randInt(g, 1, 6), -6, 6), (i) => this.solve(i), brute, 300);
      for (const [n, lo, hi] of [[10, -10, 10], [100, -100, 100], [1000, -10000, 10000], [50000, -10000, 10000], [50000, -10000, 10000], [50000, -10000, 3000], [50000, -10000, 0], [50000, 0, 10000], [49999, -1, 10000]]) out.push(make(n, lo, hi));
      out.push(`50000\n${new Array(50000).fill(10000).join(' ')}\n`, `50000\n${many(50000, (i) => (i % 2 ? 10000 : -10000)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with `n` and `k`: the number of letters and the letter sum.'],
    constraints: ['1 <= n <= 100000', 'n <= k <= 26 * n'],
    slug: 'smallest-word-with-letter-sum',
    title: 'The Smallest Word With a Given Length and Letter Sum',
    tags: ['greedy', 'string', 'lexicographic'],
    concept: {
      title: 'Fill the word from the right with the largest letters, keeping every earlier position at least `a`',
      body: [
        'Give each letter a value: `a = 1`, `b = 2`, ..., `z = 26`. Among all words of **length `n`** whose letters add up to **`k`** (a word always exists when `n <= k <= 26 * n`), print the **alphabetically smallest** one. For `n = 3` and `k = 27` the answer is `aay`: `1 + 1 + 25 = 27`, and nothing smaller exists. For `n = 5` and `k = 73` it is `aaszz`.',
        'To make a word smaller alphabetically, make its **left** letters as small as possible, even at the cost of the right letters. So push as much of the sum as possible to the **right**: go from the last position to the first. At the position `i` (counting from 0) there are `i` positions before it, and each of them needs at least `1`, so the letter here can be at most `k_left - i`. Take the largest possible letter, `min(26, k_left - i)`, and subtract it from `k_left`.',
        { code: 'k_left = k\nletters = [0] * n\nfor i in range(n - 1, -1, -1):\n    c = min(26, k_left - i)       # the earlier i positions keep at least 1 each\n    letters[i] = c\n    k_left -= c\nprint("".join(chr(96 + c) for c in letters))' },
        'The result looks like `aaa...a`, then one middle letter, then `zzz...z`. The earlier positions end up with exactly 1 because the sum that remains for them is just enough. The algorithm is O(n), and the output is built with one pass. (A different but equal way is to go from the left and give each position the smallest letter after which the rest can still reach the sum.)'
      ]
    },
    statement: ['Letters have the values `a = 1`, `b = 2`, ..., `z = 26`. Print the alphabetically smallest word of length `n` whose letter values add up to `k`. It is guaranteed that such a word exists.'],
    outputFormat: ['Print the word.'],
    examples: [{ input: '3 27\n', note: 'The smallest word is aay (1 + 1 + 25).' }, { input: '5 73\n', note: 'aaszz: 1 + 1 + 19 + 26 + 26 = 73.' }],
    hints: ['Make the leftmost letters as small as possible.', 'Go from the last position to the first.', 'At the position i the letter is min(26, remaining sum - i).'],
    program: {
      io: ['n:int k:int'],
      fast: true,
      python: r`
        left = k
        letters = [0] * n
        for i in range(n - 1, -1, -1):
            c = min(26, left - i)
            letters[i] = c
            left -= c
        print("".join(chr(96 + c) for c in letters))`,
      cpp: r`
        long long remaining = k;
        string word(n, 'a');
        for (long long i = n - 1; i >= 0; i--) {
            long long c = min(26LL, remaining - i);
            word[i] = (char)('a' + c - 1);
            remaining -= c;
        }
        cout << word << "\n";`,
      java: r`
        long left = k;
        char[] word = new char[(int) n];
        for (int i = (int) n - 1; i >= 0; i--) {
            long c = Math.min(26L, left - i);
            word[i] = (char) ('a' + c - 1);
            left -= c;
        }
        System.out.println(new String(word));`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The word is filled from the last position to the first; each position gets the largest letter that still leaves at least 1 for every earlier position.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const [n, k0] = nums(rows(input)[0]); let k = k0; const letters = []; // from the left: the smallest letter after which the rest can still reach the sum
      for (let i = 0; i < n; i++) { const rest = n - i - 1; const c = Math.max(1, k - 26 * rest); letters.push(String.fromCharCode(96 + c)); k -= c; } return letters.join('');
    },
    tests() {
      const g = rng(3057); const out = ['3 27\n', '5 73\n', '1 1\n', '1 26\n', '2 2\n', '2 52\n'];
      const brute = (input) => { const [n, k] = nums(rows(input)[0]); let found = null; const go = (pos, left, word) => { if (found !== null) return; if (pos === n) { if (left === 0) found = word; return; } for (let c = 1; c <= 26; c++) { go(pos + 1, left - c, word + String.fromCharCode(96 + c)); if (found !== null) return; } }; go(0, k, ''); return found; };
      crossCheck(() => { const n = randInt(g, 1, 3); return `${n} ${randInt(g, n, 26 * n)}\n`; }, (i) => this.solve(i), brute, 300);
      for (const n of [10, 100, 1000, 100000, 99999, 50000]) { out.push(`${n} ${n}\n`, `${n} ${26 * n}\n`, `${n} ${n + 1}\n`, `${n} ${26 * n - 1}\n`, `${n} ${randInt(g, n, 26 * n)}\n`); }
      out.push('100000 1300000\n', '100000 2000000\n', '100000 123457\n', '77777 1000000\n');
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `w`: the number of cards and the size of a group.', 'The second line has `n` numbers: the values of the cards.'],
    constraints: ['1 <= w <= n <= 50000', '1 <= each card <= 10^9'],
    slug: 'deal-in-consecutive-groups',
    title: 'Can the Cards Be Dealt in Groups of Consecutive Values?',
    tags: ['greedy', 'sorting', 'counting', 'sweep'],
    concept: {
      title: 'The smallest card must start a group; process the values in increasing order and track how many groups are open',
      body: [
        'A hand of `n` cards is given. Can you split **all** the cards into groups of exactly `w` cards, where each group consists of `w` **consecutive values** (like `4 5 6`)? For the hand `1 2 3 6 2 3 4 7 8` and `w = 3` the answer is YES: `(1,2,3)`, `(2,3,4)`, `(6,7,8)`. For `1 2 3 4 5` and `w = 4` it is NO.',
        'Look at the **smallest** card. It cannot be inside any group except as its first card (a group that contains a smaller value would need that smaller card). So it starts a group, and the group needs the next `w - 1` values. Repeating this with the smallest remaining card is the classic solution with a counter per value: `count[v] -= 1` for `v, v + 1, ..., v + w - 1`. An equivalent O(n) sweep goes through the **distinct values in increasing order** and keeps `running`, the number of *open groups* that already took a card of the previous value.',
        { code: 'running = 0                              # groups that contain the previous value\nfor i, v in enumerate(values):           # distinct values in increasing order\n    running -= expire[i]                # groups that started w values ago are complete\n    if running > 0 and v != values[i - 1] + 1: NO    # an open group needs the next value\n    if count[i] < running: NO                         # not enough cards to continue the groups\n    started = count[i] - running                      # the extra cards start new groups\n    expire[i + w] += started\n    running = count[i]\n# at the end every group must be complete: running == expire[len(values)]' },
        'The sweep uses the fact that every group occupies `w` consecutive *distinct values*, so a group that starts at the position `i` of the sorted distinct list ends at the position `i + w - 1`. If `n` is not a multiple of `w` the answer is NO at once. Sorting dominates the time: O(n log n); the sweep itself is linear.'
      ]
    },
    statement: ['A hand of `n` cards is given. Decide whether all the cards can be split into groups of exactly `w` cards so that the cards of each group have consecutive values (`x, x + 1, ..., x + w - 1`). Print YES or NO.'],
    outputFormat: ['Print YES if the split exists, otherwise NO.'],
    examples: [{ input: '9 3\n1 2 3 6 2 3 4 7 8\n', note: 'The groups (1,2,3), (2,3,4), (6,7,8): YES.' }, { input: '5 4\n1 2 3 4 5\n', note: '5 cards cannot form groups of 4: NO.' }],
    hints: ['If n is not divisible by w, the answer is NO.', 'The smallest remaining card must be the first card of a group.', 'Sort the cards, count each value, and sweep the distinct values while tracking the open groups.'],
    program: {
      io: ['n:int w:int', 'cards:int[n]'],
      fast: true,
      python: r`
        cards.sort()
        ok = n % w == 0
        if ok:
            values = []
            counts = []
            for x in cards:
                if values and values[-1] == x:
                    counts[-1] += 1
                else:
                    values.append(x)
                    counts.append(1)
            u = len(values)
            expire = [0] * (u + w + 2)
            running = 0
            for i in range(u):
                running -= expire[i]
                if running > 0 and values[i] != values[i - 1] + 1:
                    ok = False
                    break
                if counts[i] < running:
                    ok = False
                    break
                expire[i + w] += counts[i] - running
                running = counts[i]
            if ok and running != expire[u]:
                ok = False
        print("YES" if ok else "NO")`,
      cpp: r`
        sort(cards.begin(), cards.end());
        bool ok = (n % w == 0);
        if (ok) {
            vector<long long> values, counts;
            for (long long x : cards) {
                if (!values.empty() && values.back() == x) counts.back()++;
                else {
                    values.push_back(x);
                    counts.push_back(1);
                }
            }
            long long u = values.size();
            vector<long long> expire(u + w + 2, 0);
            long long running = 0;
            for (long long i = 0; i < u && ok; i++) {
                running -= expire[i];
                if (running > 0 && values[i] != values[i - 1] + 1) ok = false;
                else if (counts[i] < running) ok = false;
                else {
                    expire[i + w] += counts[i] - running;
                    running = counts[i];
                }
            }
            if (ok && running != expire[u]) ok = false;
        }
        cout << (ok ? "YES" : "NO") << "\n";`,
      java: r`
        Arrays.sort(cards);
        boolean ok = (n % w == 0);
        if (ok) {
            int count = (int) n;
            long[] values = new long[count];
            long[] counts = new long[count];
            int u = 0;
            for (int i = 0; i < count; i++) {
                if (u > 0 && values[u - 1] == cards[i]) counts[u - 1]++;
                else {
                    values[u] = cards[i];
                    counts[u] = 1;
                    u++;
                }
            }
            long[] expire = new long[u + (int) w + 2];
            long running = 0;
            for (int i = 0; i < u && ok; i++) {
                running -= expire[i];
                if (running > 0 && values[i] != values[i - 1] + 1) ok = false;
                else if (counts[i] < running) ok = false;
                else {
                    expire[i + (int) w] += counts[i] - running;
                    running = counts[i];
                }
            }
            if (ok && running != expire[u]) ok = false;
        }
        System.out.println(ok ? "YES" : "NO");`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The cards are sorted and counted per distinct value. Sweeping the distinct values, the groups that are still open must continue with the next consecutive value, extra cards start new groups that expire after w values, and at the end no group may be left incomplete.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const [, w] = nums(rows(input)[0]); const cards = arrOf(input); const cnt = new Map(); for (const x of cards) cnt.set(x, (cnt.get(x) || 0) + 1); // the classic greedy: the smallest card starts a group
      for (const v of [...cnt.keys()].sort((x, y) => x - y)) { const c = cnt.get(v); if (c > 0) for (let j = 0; j < w; j++) { const have = cnt.get(v + j) || 0; if (have < c) return 'NO'; cnt.set(v + j, have - c); } } return 'YES';
    },
    tests() {
      const g = rng(3058); const out = ['9 3\n1 2 3 6 2 3 4 7 8\n', '5 4\n1 2 3 4 5\n', '1 1\n5\n', '4 2\n1 2 2 3\n', '6 3\n1 2 3 3 4 5\n', '6 2\n1 1 2 2 3 3\n'];
      const brute = (input) => { const [n, w] = nums(rows(input)[0]); const c = arrOf(input).sort((x, y) => x - y); if (n % w) return 'NO'; const used = new Array(n).fill(false); const go = () => { let i = 0; while (i < n && used[i]) i++; if (i === n) return true; used[i] = true; const base = c[i]; const group = (off) => { if (off === w) return go(); for (let j = 0; j < n; j++) { if (used[j] || c[j] !== base + off) continue; used[j] = true; const ok = group(off + 1); used[j] = false; if (ok) return true; } return false; }; const ok = group(1); used[i] = false; return ok; }; return go() ? 'YES' : 'NO'; };
      const fromGroups = (groups, w, spread, tweak) => { const cards = []; for (let j = 0; j < groups; j++) { const s = randInt(g, 1, spread); for (let t = 0; t < w; t++) cards.push(s + t); } if (tweak) { const i = randInt(g, 0, cards.length - 1); cards[i] += randInt(g, 1, 3); } const sh = shuffle(g, cards); return `${sh.length} ${w}\n${sh.join(' ')}\n`; };
      crossCheck(() => { const w = randInt(g, 1, 3); const groups = randInt(g, 1, 3); return g() < 0.3 ? `${w * groups} ${w}\n${randArray(g, w * groups, 1, 4).join(' ')}\n` : fromGroups(groups, w, 4, g() < 0.5); }, (i) => this.solve(i), brute, 800);
      for (const [groups, w, spread, tweak] of [[10, 3, 8, false], [100, 5, 50, false], [100, 5, 50, true], [5000, 10, 20, false], [5000, 10, 20, true], [2500, 20, 1000000000 - 20, false], [50, 1000, 100, false], [1, 50000, 5, false], [25000, 2, 1000, false], [25000, 2, 1000, true], [49999, 1, 1000000000, false], [10000, 5, 7, false], [1000, 50, 100000, true]]) out.push(fromGroups(groups, w, spread, tweak));
      out.push(`50000 7\n${randArray(g, 50000, 1, 1000000000).join(' ')}\n`, `50000 2\n${many(50000, (i) => 1 + (i >> 1)).join(' ')}\n`, `50000 50000\n${many(50000, (i) => i + 1).join(' ')}\n`, `50000 25000\n${many(50000, (i) => 1 + (i % 25000)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of jobs.', 'Each of the next `n` lines has two numbers `d` and `p`: the deadline and the profit of a job.'],
    constraints: ['1 <= n <= 30000', '1 <= d <= 10^9', '1 <= p <= 10^9'],
    slug: 'jobs-with-deadlines',
    title: 'Pick the Most Profitable Jobs That Meet Their Deadlines',
    tags: ['greedy', 'sorting', 'union-find', 'scheduling'],
    concept: {
      title: 'Take jobs from the most profitable; give each the latest free time slot not after its deadline',
      body: [
        'There are `n` jobs. Each job takes **exactly one unit of time**, has a **deadline** `d` (it must be done in one of the time slots `1, 2, ..., d`) and brings a **profit** `p` if it is done in time. Only one job can run in each slot. What is the **largest total profit**? For the jobs `(deadline, profit) = (2,100) (1,19) (2,27) (1,25) (3,15)` the answer is 142: do `27` in the slot 1, `100` in the slot 2 and `15` in the slot 3.',
        'The jobs we skip are the cheap ones, so go through the jobs **from the most profitable**. A job should be put into the **latest free slot not later than its deadline**: the late slot is the least valuable for the other jobs, because jobs with an earlier deadline cannot use it anyway. If no such slot is free (all slots `1..d` are taken), the job is dropped. This is correct because a more profitable job already placed can never be replaced profitably by a cheaper one, which is the matroid structure of the problem.',
        { code: 'order = sorted(range(n), key=lambda i: -profit[i])\nparent = list(range(n + 1))               # find(x): the latest free slot <= x, or 0 if none\ntotal = 0\nfor i in order:\n    slot = find(min(deadline[i], n))     # no more than n jobs can ever be done\n    if slot > 0:\n        total += profit[i]\n        parent[slot] = slot - 1          # the slot is now taken\nprint(total)' },
        '"The latest free slot <= x" is answered with a **union-find** structure: when a slot is taken it is merged with the slot before it. With path compression, all operations together cost almost O(n) after the O(n log n) sort. Deadlines larger than `n` can be cut down to `n`, since at most `n` jobs exist.'
      ]
    },
    statement: ['`n` jobs are given, each with a deadline `d` and a profit `p`. A job takes one unit of time, the time slots are numbered 1, 2, 3, ..., only one job can run per slot, and a job with the deadline `d` must run in one of the slots 1..d to bring its profit. Print the largest total profit.'],
    outputFormat: ['Print the largest total profit.'],
    examples: [{ input: '5\n2 100\n1 19\n2 27\n1 25\n3 15\n', note: 'Do 27 in the slot 1, 100 in the slot 2 and 15 in the slot 3: 142.' }],
    hints: ['Sort the jobs by profit, largest first.', 'Place a job in the latest free slot that is not after its deadline.', 'Find that slot quickly with union-find, where a taken slot points to the slot before it.'],
    program: {
      io: ['n:int', 'jobs:int[n][2]'],
      fast: true,
      helpers: {
      python: r`
        parent = []

        def find(x):
            root = x
            while parent[root] != root:
                root = parent[root]
            while parent[x] != root:
                parent[x], x = root, parent[x]
            return root`,
      cpp: r`
        vector<int> parent;

        int findRoot(int x) {
            int root = x;
            while (parent[root] != root) root = parent[root];
            while (parent[x] != root) {
                int next = parent[x];
                parent[x] = root;
                x = next;
            }
            return root;
        }`,
      java: r`
        static int[] parent;

        static int findRoot(int x) {
            int root = x;
            while (parent[root] != root) root = parent[root];
            while (parent[x] != root) {
                int next = parent[x];
                parent[x] = root;
                x = next;
            }
            return root;
        }`
      },
      python: r`
        parent.extend(range(n + 1))
        order = sorted(range(n), key=lambda i: -jobs[i][1])
        total = 0
        for i in order:
            slot = find(min(jobs[i][0], n))
            if slot > 0:
                total += jobs[i][1]
                parent[slot] = slot - 1
        print(total)`,
      cpp: r`
        parent.resize(n + 1);
        for (int v = 0; v <= n; v++) parent[v] = v;
        vector<int> order(n);
        for (int i = 0; i < n; i++) order[i] = i;
        sort(order.begin(), order.end(), [&](int x, int y) { return jobs[x][1] > jobs[y][1]; });
        long long total = 0;
        for (int i : order) {
            int slot = findRoot((int)min(jobs[i][0], n));
            if (slot > 0) {
                total += jobs[i][1];
                parent[slot] = slot - 1;
            }
        }
        cout << total << "\n";`,
      java: r`
        int count = (int) n;
        long[] keys = new long[count];
        for (int i = 0; i < count; i++) keys[i] = jobs[i][1] * 65536L + i;
        Arrays.sort(keys);
        parent = new int[count + 1];
        for (int v = 0; v <= count; v++) parent[v] = v;
        long total = 0;
        for (int t = count - 1; t >= 0; t--) {
            int i = (int) (keys[t] % 65536L);
            int slot = findRoot((int) Math.min(jobs[i][0], (long) count));
            if (slot > 0) {
                total += jobs[i][1];
                parent[slot] = slot - 1;
            }
        }
        System.out.println(total);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The jobs are taken from the most profitable; each is put into the latest free slot not after its deadline (found with union-find where a used slot points to the previous slot), and skipped if there is none.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const jobs = many(n, (i) => nums(rs[i + 1])).sort((x, y) => x[0] - y[0]); // by deadline; a min-heap keeps the best jobs that fit
      const heap = new MinHeap(); for (const [d, p] of jobs) { heap.push(p); if (heap.size > d) heap.pop(); } return String(sum(heap.a));
    },
    tests() {
      const g = rng(3059); const out = ['5\n2 100\n1 19\n2 27\n1 25\n3 15\n', '1\n1 5\n', '2\n1 5\n1 7\n', '3\n1000000000 1\n1000000000 2\n1000000000 3\n'];
      const make = (n, dMax, pMax) => `${n}\n${many(n, () => `${randInt(g, 1, dMax)} ${randInt(g, 1, pMax)}`).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const jobs = many(n, (i) => nums(rs[i + 1])); let best = 0; for (let mask = 0; mask < (1 << n); mask++) { const chosen = []; let profit = 0; for (let i = 0; i < n; i++) if (mask >> i & 1) { chosen.push(jobs[i]); profit += jobs[i][1]; } chosen.sort((x, y) => x[0] - y[0]); if (chosen.every((j, idx) => j[0] >= idx + 1)) best = Math.max(best, profit); } return String(best); };
      crossCheck(() => make(randInt(g, 1, 8), 5, 20), (i) => this.solve(i), brute, 800);
      for (const [n, dMax, pMax] of [[10, 5, 20], [100, 30, 1000], [1000, 600, 1000000], [30000, 1000000000, 1000000000], [30000, 15000, 1000000000], [30000, 100, 1000000000], [30000, 30000, 100], [29999, 3, 1000000000], [30000, 1, 1000000000]]) out.push(make(n, dMax, pMax));
      out.push(`30000\n${many(30000, () => '30000 1000000000').join('\n')}\n`, `30000\n${many(30000, (i) => `${i + 1} ${30000 - i}`).join('\n')}\n`, `30000\n${many(30000, (i) => `${30000 - i} ${1 + i}`).join('\n')}\n`);
      return out;
    }
  }
];
