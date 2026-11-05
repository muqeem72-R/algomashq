import { r, rng, randInt, randBig, many, nums, rows, bigs, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const arrOf = (input) => nums(rows(input)[1]);
const MAXV = 1000000000000000000n;
const popBig = (x) => { let c = 0; while (x > 0n) { c += Number(x & 1n); x >>= 1n; } return c; };
const bigRows = (input, from, count, width) => { const rs = rows(input); return many(count, (i) => rs[from + i].split(' ').map(BigInt)); };
// a random number below the limit; every few calls it is small, so the tests mix sizes
const mixedBig = (g, hi) => { const bits = randInt(g, 1, 60); const top = (1n << BigInt(bits)) - 1n; const cap = top < hi ? top : hi; return randBig(g, 0n, cap); };

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers. Every value appears exactly three times except one value, which appears once.'],
    constraints: ['1 <= n <= 30000 and n = 3k + 1 for some k', '0 <= each number <= 10^9'],
    slug: 'single-among-triples',
    title: 'The Number That Appears Once Among Triples',
    tags: ['bit-manipulation', 'xor', 'counting-in-binary'],
    concept: {
      title: 'Count every bit position modulo 3: two bits per position are enough to remember a count from 0 to 2',
      body: [
        'In a list every value appears **exactly three times**, except one value that appears **once**. Find that value. For `2 2 3 2` it is 3, and for `0 1 0 1 0 1 99` it is 99. The trick that finds the single value among pairs (XOR of everything) does not work here, since `x ^ x ^ x = x`, not 0.',
        'Look at **one bit position** at a time. Every value that appears three times contributes 0 or 3 ones to that position, so the **number of ones at the position, taken modulo 3, equals the bit of the single value**. That already gives a solution: for each of the 30 bit positions count the ones among all numbers and write `count % 3` into the answer. It costs 30 passes over the list.',
        { code: 'ones = twos = 0                 # for every bit: the count of ones modulo 3 is stored as (twos, ones)\nfor x in a:\n    ones = (ones ^ x) & ~twos     # the count 0 -> 1 -> 2 -> 0 ...\n    twos = (twos ^ x) & ~ones\nprint(ones)                       # the bits whose count is 1 modulo 3' },
        'The code above handles **all bit positions at once** with two numbers: `ones` and `twos` store, for each position, the count of ones modulo 3 as a two-bit counter (`00`, `01`, `10`). Adding a bit 1 moves the counter `00 -> 01 -> 10 -> 00`, which is what the two lines do for every position in parallel. After the whole list, every position of the repeated values is back at 0, and `ones` holds exactly the bits of the single value. One pass, O(n) time and O(1) memory.'
      ]
    },
    statement: ['A list has `n` numbers. Every value appears exactly three times except one value, which appears exactly once. Print that value.'],
    outputFormat: ['Print the value that appears once.'],
    examples: [{ input: '4\n2 2 3 2\n', note: 'The value 2 appears three times, 3 appears once: 3.' }, { input: '7\n0 1 0 1 0 1 99\n', note: '99.' }],
    hints: ['XOR does not cancel three equal values.', 'For one bit position, the number of ones modulo 3 is the bit of the answer.', 'Keep two bit masks, ones and twos, that count modulo 3 for all positions at once.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        ones = twos = 0
        for x in a:
            ones = (ones ^ x) & ~twos
            twos = (twos ^ x) & ~ones
        print(ones)`,
      cpp: r`
        long long ones = 0, twos = 0;
        for (long long x : a) {
            ones = (ones ^ x) & ~twos;
            twos = (twos ^ x) & ~ones;
        }
        cout << ones << "\n";`,
      java: r`
        long ones = 0, twos = 0;
        for (long x : a) {
            ones = (ones ^ x) & ~twos;
            twos = (twos ^ x) & ~ones;
        }
        System.out.println(ones);`
    },
    solution: { explanation: ['Two masks store, for every bit position at once, the count of ones modulo 3; after all numbers the mask `ones` holds the bits of the value that appears once.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const a = arrOf(input); let result = 0; for (let bit = 0; bit < 31; bit++) { let c = 0; for (const x of a) c += (x >> bit) & 1; if (c % 3) result |= 1 << bit; } return String(result); // the ones of every bit position modulo 3
    },
    tests() {
      const g = rng(3071); const out = ['4\n2 2 3 2\n', '7\n0 1 0 1 0 1 99\n', '1\n7\n', '4\n0 5 5 5\n'];
      const make = (k, hi) => { const vals = new Set(); while (vals.size < k + 1) vals.add(randInt(g, 0, hi)); const v = [...vals]; const arr = [v[0]]; for (const x of v.slice(1)) arr.push(x, x, x); const sh = shuffle(g, arr); return `${sh.length}\n${sh.join(' ')}\n`; };
      const brute = (input) => { const a = arrOf(input); const cnt = new Map(); for (const x of a) cnt.set(x, (cnt.get(x) || 0) + 1); for (const [x, c] of cnt) if (c === 1) return String(x); };
      crossCheck(() => make(randInt(g, 0, 5), 20), (i) => this.solve(i), brute, 600);
      for (const [k, hi] of [[5, 100], [100, 1000], [1000, 1000000000], [9999, 1000000000], [9999, 10000], [9999, 1073741], [5000, 1000000000], [9998, 1000000000]]) out.push(make(k, hi));
      out.push(`29998\n${[1000000000, ...many(9999, (i) => i + 1).flatMap((x) => [x, x, x])].join(' ')}\n`, `29998\n${[0, ...many(9999, (i) => 1000000000 - i).flatMap((x) => [x, x, x])].join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers. Every value appears exactly twice except two different values, which appear once each.'],
    constraints: ['2 <= n <= 30000 and n is even', '0 <= each number <= 10^9'],
    slug: 'two-numbers-that-appear-once',
    title: 'The Two Numbers That Appear Only Once',
    tags: ['bit-manipulation', 'xor', 'lowest-set-bit', 'partition'],
    concept: {
      title: 'XOR everything, then split the numbers by a bit in which the two answers differ',
      body: [
        'In a list every value appears **twice**, except **two different values** that appear **once**. Find those two. For `1 2 1 3 2 5` the answers are 3 and 5. If there were only one such value, XOR-ing all numbers would give it, since `x ^ x = 0`. Here the XOR gives `x = p ^ q`, the XOR of the two unknown values, which is **not zero** because `p` and `q` are different.',
        'The number `x = p ^ q` has a bit equal to 1 exactly where `p` and `q` **differ**. Take any such bit, for example the lowest one: `low = x & -x` (this trick keeps only the lowest set bit). Now split all the numbers into two groups by this bit: the numbers that **have** the bit and the numbers that **do not**. `p` and `q` fall into **different groups**, and every pair of equal numbers falls into the **same** group.',
        { code: 'x = 0\nfor v in a: x ^= v                 # x = p ^ q\nlow = x & -x                       # a bit where p and q differ\np = q = 0\nfor v in a:\n    if v & low: p ^= v             # one group: the pairs cancel, p remains\n    else:       q ^= v             # the other group: q remains\nprint(min(p, q), max(p, q))' },
        'In each group the equal pairs cancel by XOR, and exactly one of the unknown values is left, so the two XORs are the two answers. The program makes two passes and uses O(1) memory: O(n) time. The expression `x & -x` works because `-x` is `~x + 1`, which flips all the bits above the lowest set bit and keeps that bit.'
      ]
    },
    statement: ['A list has `n` numbers. Every value appears exactly twice except two different values, each of which appears exactly once. Print these two values in increasing order.'],
    outputFormat: ['Print the two values separated by a space, the smaller first.'],
    examples: [{ input: '6\n1 2 1 3 2 5\n', note: '3 and 5.' }],
    hints: ['The XOR of the whole list is p ^ q.', 'The lowest set bit of p ^ q is a bit where p and q differ.', 'XOR the numbers of each group (with and without that bit) separately.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        x = 0
        for v in a:
            x ^= v
        low = x & -x
        p = q = 0
        for v in a:
            if v & low:
                p ^= v
            else:
                q ^= v
        print(min(p, q), max(p, q))`,
      cpp: r`
        long long x = 0;
        for (long long v : a) x ^= v;
        long long low = x & -x, p = 0, q = 0;
        for (long long v : a) {
            if (v & low) p ^= v;
            else q ^= v;
        }
        cout << min(p, q) << " " << max(p, q) << "\n";`,
      java: r`
        long x = 0;
        for (long v : a) x ^= v;
        long low = x & -x, p = 0, q = 0;
        for (long v : a) {
            if ((v & low) != 0) p ^= v;
            else q ^= v;
        }
        System.out.println(Math.min(p, q) + " " + Math.max(p, q));`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The XOR of all numbers equals p ^ q; its lowest set bit separates p from q, and XOR-ing the two groups of numbers separately leaves p in one group and q in the other.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const a = arrOf(input); const cnt = new Map(); for (const x of a) cnt.set(x, (cnt.get(x) || 0) + 1); const once = [...cnt].filter(([, c]) => c === 1).map(([x]) => x).sort((x, y) => x - y); return once.join(' '); // counting with a hash map
    },
    tests() {
      const g = rng(3072); const out = ['6\n1 2 1 3 2 5\n', '2\n0 1000000000\n', '2\n5 4\n', '4\n7 7 0 1\n'];
      const make = (k, hi) => { const vals = new Set(); while (vals.size < k + 2) vals.add(randInt(g, 0, hi)); const v = [...vals]; const arr = [v[0], v[1]]; for (const x of v.slice(2)) arr.push(x, x); const sh = shuffle(g, arr); return `${sh.length}\n${sh.join(' ')}\n`; };
      const brute = (input) => { const a = arrOf(input); const once = a.filter((x) => a.filter((y) => y === x).length === 1).sort((x, y) => x - y); return once.join(' '); };
      crossCheck(() => make(randInt(g, 0, 6), 20), (i) => this.solve(i), brute, 600);
      for (const [k, hi] of [[5, 100], [100, 1000], [1000, 1000000000], [14999, 1000000000], [14999, 20000], [14000, 1000000000], [7000, 1000000000], [14998, 1000000000]]) out.push(make(k, hi));
      out.push(`30000\n${[0, 1000000000, ...many(14999, (i) => i + 1).flatMap((x) => [x, x])].join(' ')}\n`, `30000\n${[1, 3, ...many(14999, (i) => 1000000000 - i).flatMap((x) => [x, x])].join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` numbers.'],
    constraints: ['2 <= n <= 20000', '0 <= each number <= 10^18'],
    slug: 'bit-differences-of-all-pairs',
    title: 'Total Bit Differences Over All Pairs of Numbers',
    tags: ['bit-manipulation', 'counting', 'hamming-distance', 'combinatorics'],
    concept: {
      title: 'Handle each bit position separately: a pair differs there exactly when one number has the bit and the other does not',
      body: [
        'The *Hamming distance* of two numbers is the number of bit positions in which they differ. For `n` numbers there are `n * (n - 1) / 2` pairs. What is the **sum of the Hamming distances of all pairs**? For `4, 14, 2` the three distances are 2, 2 and 2, and the total is 6.',
        'Computing every pair costs O(n^2), too slow for 20000 numbers. Instead look at **one bit position** at a time. If `c` of the `n` numbers have 1 at this position, then the other `n - c` have 0, and a pair differs at this position exactly when it takes **one number from each group**: there are `c * (n - c)` such pairs. The total is the sum of `c * (n - c)` over all bit positions. The positions are independent, which is the whole idea.',
        { code: 'total = 0\nfor bit in range(60):\n    c = 0\n    for x in a:\n        c += (x >> bit) & 1      # numbers with the bit set\n    total += c * (n - c)         # pairs that differ at this bit\nprint(total)' },
        'The cost is 60 passes over the list, O(60 n). The answer is at most 60 * (n/2)^2 = 6 * 10^9 here, which does not fit in 32 bits, so use a 64-bit type for the total (and for `c * (n - c)`). This "split the sum by bit position" trick is the same one used for sums of XORs or ANDs over all pairs.'
      ]
    },
    statement: ['A list of `n` numbers is given. The Hamming distance of two numbers is the number of bit positions in which their binary notations differ. Print the sum of the Hamming distances over all pairs `i < j`.'],
    outputFormat: ['Print the sum of the Hamming distances of all pairs.'],
    examples: [{ input: '3\n4 14 2\n', note: 'The distances between 4 and 14, 4 and 2, 14 and 2 are 2, 2, 2: 6.' }],
    hints: ['Look at one bit position at a time.', 'If c numbers have the bit set, then c * (n - c) pairs differ in it.', 'Add up the 60 contributions in a 64-bit variable.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        total = 0
        for bit in range(60):
            c = 0
            for x in a:
                c += (x >> bit) & 1
            total += c * (n - c)
        print(total)`,
      cpp: r`
        long long total = 0;
        for (int bit = 0; bit < 60; bit++) {
            long long c = 0;
            for (long long x : a) c += (x >> bit) & 1;
            total += c * (n - c);
        }
        cout << total << "\n";`,
      java: r`
        long total = 0;
        for (int bit = 0; bit < 60; bit++) {
            long c = 0;
            for (long x : a) c += (x >> bit) & 1;
            total += c * (n - c);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['For every bit position, if c of the n numbers have the bit set, then c * (n - c) pairs differ in this position; the contributions of the 60 positions are added.'], complexity: 'Time O(60 n), space O(1).' },
    solve(input) {
      const a = bigs(rows(input)[1]); const n = BigInt(a.length); let total = 0n; for (let bit = 0n; bit < 60n; bit++) { let c = 0n; for (const x of a) c += (x >> bit) & 1n; total += c * (n - c); } return String(total);
    },
    tests() {
      const g = rng(3073); const out = ['3\n4 14 2\n', '2\n0 0\n', '2\n0 1000000000000000000\n', '4\n1 1 1 1\n'];
      const make = (n, mode) => `${n}\n${many(n, () => (mode === 'big' ? randBig(g, 0n, MAXV) : mode === 'mixed' ? mixedBig(g, MAXV) : BigInt(randInt(g, 0, mode)))).join(' ')}\n`;
      const brute = (input) => { const a = bigs(rows(input)[1]); let total = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) total += popBig(a[i] ^ a[j]); return String(total); };
      crossCheck(() => make(randInt(g, 2, 8), 40), (i) => this.solve(i), brute, 600);
      for (const [n, mode] of [[10, 'big'], [100, 'mixed'], [1000, 'big'], [20000, 'big'], [20000, 'mixed'], [20000, 1], [20000, 1000], [19999, 'big']]) out.push(make(n, mode));
      out.push(`20000\n${many(20000, (i) => (i % 2 ? '1000000000000000000' : '0')).join(' ')}\n`, `20000\n${many(20000, (i) => String(2n ** BigInt(i % 60))).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `q`: the number of questions.', 'Each of the next `q` lines has two numbers `l` and `r`.'],
    constraints: ['1 <= q <= 15000', '0 <= l <= r <= 10^18'],
    slug: 'and-of-a-whole-range',
    title: 'The AND of Every Number in a Range',
    tags: ['bit-manipulation', 'common-prefix', 'shifts'],
    concept: {
      title: 'The AND of a range is the common binary prefix of its ends, followed by zeros',
      body: [
        'For each question `l r`, compute the **bitwise AND of all the integers from `l` to `r`** (both included). For `5 7` it is `5 & 6 & 7 = 4`. For `26 30` it is 24. Running the loop is impossible when the range holds 10^18 numbers.',
        'Look at the binary notations of `l` and `r`. As the numbers run from `l` up to `r`, a bit position that is **not** in the common prefix of `l` and `r` takes both values 0 and 1 somewhere in the range, because counting up must pass the place where the first differing bit flips (and when it flips from 0 to 1, all lower bits are 0 at that moment, and just before it they were all 1). So every bit **after** the common prefix is 0 in the AND. Bits of the common prefix are the same in all numbers of the range, so they stay.',
        { code: 'shift = 0\nwhile l != r:                # remove the bits below the common prefix\n    l >>= 1\n    r >>= 1\n    shift += 1\nanswer = l << shift          # the common prefix, followed by `shift` zeros' },
        'The loop runs at most 60 times for each question. For `26 = 11010` and `30 = 11110` the common prefix is `11`, `shift = 3`, and the answer is `11000 = 24`. If `l = r`, the loop does not run and the answer is `l`. The idea of "shift both ends until they meet" is a standard way to find the common prefix without bit-by-bit comparisons.'
      ]
    },
    statement: ['For each question with two numbers `l` and `r` (`l <= r`) print the bitwise AND of all integers from `l` to `r`, both ends included.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '3\n5 7\n0 0\n26 30\n', note: '5 & 6 & 7 = 4, 0, and 24: 4 0 24.' }],
    hints: ['Write both ends in binary and look at their common prefix.', 'Bits after the common prefix become 0.', 'Shift both numbers right until they are equal, remembering how many shifts were made.'],
    program: {
      io: ['q:int', 'qs:int[q][2]'],
      fast: true,
      python: r`
        out = []
        for l, rr in qs:
            shift = 0
            while l != rr:
                l >>= 1
                rr >>= 1
                shift += 1
            out.append(l << shift)
        print(*out)`,
      cpp: r`
        for (long long t = 0; t < q; t++) {
            long long l = qs[t][0], rr = qs[t][1];
            int shift = 0;
            while (l != rr) {
                l >>= 1;
                rr >>= 1;
                shift++;
            }
            cout << (t ? " " : "") << (l << shift);
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            long l = qs[t][0], rr = qs[t][1];
            int shift = 0;
            while (l != rr) {
                l >>= 1;
                rr >>= 1;
                shift++;
            }
            if (t > 0) out.append(" ");
            out.append(l << shift);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['Both ends are shifted right until they are equal; the common value shifted back left by the number of shifts is the AND of the whole range.'], complexity: 'Time O(60 q), space O(1).' },
    solve(input) {
      const n = Number(rows(input)[0]); return bigRows(input, 1, n).map(([l, rr]) => { const a = l.toString(2).padStart(64, '0'), b = rr.toString(2).padStart(64, '0'); let k = 0; while (k < 64 && a[k] === b[k]) k++; return BigInt('0b' + a.slice(0, k) + '0'.repeat(64 - k)); }).join(' ');
    },
    tests() {
      const g = rng(3074); const out = ['3\n5 7\n0 0\n26 30\n', '1\n1000000000000000000 1000000000000000000\n', '1\n0 1000000000000000000\n', '2\n7 8\n8 15\n'];
      const pair = (mode) => { const l = mixedBig(g, MAXV); let rr; if (mode === 0) rr = l; else if (mode === 1) rr = l + randBig(g, 0n, 100n); else if (mode === 2) rr = randBig(g, l, MAXV); else rr = l + randBig(g, 0n, 1n << BigInt(randInt(g, 1, 59))); if (rr > MAXV) rr = MAXV; return `${l} ${rr}`; };
      const make = (q) => `${q}\n${many(q, () => pair(randInt(g, 0, 3))).join('\n')}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); return many(n, (i) => { const [l, rr] = nums(rows(input)[1 + i]); let v = l; for (let x = l; x <= rr; x++) v &= x; return v; }).join(' '); };
      crossCheck(() => { const q = randInt(g, 1, 5); return `${q}\n${many(q, () => { const l = randInt(g, 0, 60); return `${l} ${randInt(g, l, l + 40)}`; }).join('\n')}\n`; }, (i) => this.solve(i), brute, 600);
      for (const q of [10, 100, 1000, 15000, 15000, 15000, 14999]) out.push(make(q));
      out.push(`15000\n${many(15000, (i) => `${1000000000000000000n - BigInt(i)} 1000000000000000000`).join('\n')}\n`, `15000\n${many(15000, (i) => `${(1n << 59n) - BigInt(i % 100)} ${(1n << 59n) + BigInt(i)}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `q`: the number of questions.', 'Each of the next `q` lines has two numbers `a` and `b`.'],
    constraints: ['1 <= q <= 15000', '0 <= a, b <= 10^18'],
    slug: 'carries-in-binary-addition',
    title: 'How Many Carries Happen in a Binary Addition?',
    tags: ['bit-manipulation', 'popcount', 'carry', 'math'],
    concept: {
      title: 'Every carry removes one 1-bit: the number of carries is popcount(a) + popcount(b) - popcount(a + b)',
      body: [
        'Add two numbers in the binary notation, as you would on paper: go from the lowest bit to the highest, add the two bits and the carry from the previous position, write the lowest bit of the sum and carry the rest to the next position. How many times is a **carry** produced? For `1 + 1` there is 1 carry. For `7 + 9 = 0111 + 1001 = 10000` there are 4 carries (in the positions 0, 1, 2 and 3).',
        'Simulating the addition bit by bit costs about 60 steps per question. There is a much shorter way. Think about the number of 1-bits, the *popcount*. In one position, adding two bits and a carry-in gives a sum from 0 to 3; the written bit is `sum % 2`, and the carry-out is `sum / 2`. Compare the number of ones before and after: two ones (`1 + 1`) turn into one written 0 and a carry (which becomes a one in the next position), so every carry **reduces the total number of ones by exactly one** when you count the ones of `a`, `b` and the result.',
        { code: 'carries = bin(a).count("1") + bin(b).count("1") - bin(a + b).count("1")' },
        'For `7 + 9`: popcount(7) = 3, popcount(9) = 2, popcount(16) = 1, so 3 + 2 - 1 = 4 carries. For `1 + 1`: 1 + 1 - popcount(2) = 1. In C++ use `__builtin_popcountll` and in Java `Long.bitCount`; the sums fit in 64-bit signed numbers (at most 2 * 10^18). The result of each question is found in O(1) after the popcounts. This is *Kummer\'s theorem* for the prime 2.'
      ]
    },
    statement: ['For each question with two numbers `a` and `b` add them in binary notation, going from the lowest bit to the highest. Print how many times a carry into the next position occurs.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '2\n1 1\n7 9\n', note: 'One carry for 1 + 1; four carries for 7 + 9: 1 4.' }],
    hints: ['Adding two bits 1 + 1 gives a written 0 and a carry.', 'Each carry destroys exactly one 1-bit in the total count of ones.', 'carries = popcount(a) + popcount(b) - popcount(a + b).'],
    program: {
      io: ['q:int', 'qs:int[q][2]'],
      fast: true,
      python: r`
        out = []
        for a, b in qs:
            out.append(bin(a).count("1") + bin(b).count("1") - bin(a + b).count("1"))
        print(*out)`,
      cpp: r`
        for (long long t = 0; t < q; t++) {
            long long a = qs[t][0], b = qs[t][1];
            int carries = __builtin_popcountll(a) + __builtin_popcountll(b) - __builtin_popcountll(a + b);
            cout << (t ? " " : "") << carries;
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            long a = qs[t][0], b = qs[t][1];
            int carries = Long.bitCount(a) + Long.bitCount(b) - Long.bitCount(a + b);
            if (t > 0) out.append(" ");
            out.append(carries);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['Every carry reduces the total number of 1-bits by one, so the number of carries is popcount(a) + popcount(b) - popcount(a + b).'], complexity: 'Time O(q * 60), space O(1).' },
    solve(input) {
      const n = Number(rows(input)[0]); return bigRows(input, 1, n).map(([a, b]) => { let carry = 0n, count = 0; for (let bit = 0n; bit < 64n; bit++) { const s = ((a >> bit) & 1n) + ((b >> bit) & 1n) + carry; carry = s >> 1n; if (carry) count++; } return count; }).join(' '); // the schoolbook addition
    },
    tests() {
      const g = rng(3075); const out = ['2\n1 1\n7 9\n', '1\n0 0\n', '1\n1000000000000000000 1000000000000000000\n', '2\n576460752303423487 576460752303423487\n3 3\n'];
      const make = (q, mode) => `${q}\n${many(q, () => (mode === 'big' ? `${randBig(g, 0n, MAXV)} ${randBig(g, 0n, MAXV)}` : mode === 'mixed' ? `${mixedBig(g, MAXV)} ${mixedBig(g, MAXV)}` : `${randInt(g, 0, mode)} ${randInt(g, 0, mode)}`)).join('\n')}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); return many(n, (i) => { const [a, b] = nums(rows(input)[1 + i]); const x = a.toString(2).padStart(10, '0'), y = b.toString(2).padStart(10, '0'); let carry = 0, count = 0; for (let k = 9; k >= 0; k--) { const s = Number(x[k]) + Number(y[k]) + carry; carry = s >= 2 ? 1 : 0; count += carry; } return count; }).join(' '); };
      crossCheck(() => make(randInt(g, 1, 5), 500), (i) => this.solve(i), brute, 600);
      for (const [q, mode] of [[10, 'big'], [100, 'mixed'], [1000, 'big'], [15000, 'big'], [15000, 'mixed'], [15000, 255], [14999, 'big']]) out.push(make(q, mode));
      out.push(`15000\n${many(15000, (i) => `${(1n << BigInt(i % 60)) - 1n} ${(1n << BigInt(i % 60)) - 1n}`).join('\n')}\n`, `15000\n${many(15000, () => '576460752303423487 576460752303423487').join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `q`: the number of questions.', 'The second line has `q` numbers `g`, the words of the Gray code.'],
    constraints: ['1 <= q <= 25000', '0 <= g <= 10^18'],
    slug: 'position-in-the-gray-sequence',
    title: 'At Which Position Does a Gray Code Word Appear?',
    tags: ['bit-manipulation', 'gray-code', 'prefix-xor'],
    concept: {
      title: 'Undo "i xor (i shifted right by one)": every bit of the position is the XOR of all the higher bits of the word',
      body: [
        'The *Gray code* lists the non-negative integers in an order in which two neighbouring words differ in exactly one bit. The word at the position `i` (counting from 0) is `g(i) = i ^ (i >> 1)`. The first words are `0, 1, 3, 2, 6, 7, 5, 4`: position 2 holds 3, position 3 holds 2, position 4 holds 6. Given a word `g`, at which **position** `i` does it stand? For `6 5 4 7` the positions are `4 6 7 5`.',
        'Write the formula bit by bit. The top bit of `g` equals the top bit of `i`. Every other bit of `g` is `g_k = i_k ^ i_{k+1}` (the bit of `i` XOR the bit of `i` above it). Going from the **top** down we can solve this: `i_k = g_k ^ i_{k+1}`. Unrolling it, `i_k` is the XOR of the bits `g_k, g_{k+1}, g_{k+2}, ...` of the word, that is, **the XOR of all the bits of `g` at or above the position `k`**. In other words, `i` is the *prefix XOR* of the bits of `g` read from the top.',
        { code: 'i = 0\nwhile g:\n    i ^= g          # adds g, g >> 1, g >> 2, ... (all by XOR)\n    g >>= 1\nprint(i)' },
        'The loop adds `g`, `g >> 1`, `g >> 2`, ... by XOR, and the bit `k` of that XOR is exactly the XOR of the bits of `g` at positions `k` and above. At most 60 iterations per question. The same loop is the inverse of the formula `i ^ (i >> 1)`, so `g(i)` for the found `i` gives back `g`.'
      ]
    },
    statement: ['The Gray code lists the non-negative integers so that the word at the position `i` (from 0) is `i ^ (i >> 1)`. For each given word `g` print the position at which it appears.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '4\n6 5 4 7\n', note: 'The words 6, 5, 4, 7 stand at the positions 4, 6, 7, 5.' }],
    hints: ['g = i ^ (i >> 1), so each bit of g is a bit of i XOR the bit above it.', 'Solve from the top bit down: i_k = g_k ^ i_{k+1}.', 'The whole thing is the loop i ^= g; g >>= 1.'],
    program: {
      io: ['q:int', 'gs:int[q]'],
      fast: true,
      python: r`
        out = []
        for g in gs:
            i = 0
            while g:
                i ^= g
                g >>= 1
            out.append(i)
        print(*out)`,
      cpp: r`
        for (long long t = 0; t < q; t++) {
            long long g = gs[t], i = 0;
            while (g) {
                i ^= g;
                g >>= 1;
            }
            cout << (t ? " " : "") << i;
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            long g = gs[t], i = 0;
            while (g != 0) {
                i ^= g;
                g >>= 1;
            }
            if (t > 0) out.append(" ");
            out.append(i);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['The position is the prefix XOR of the bits of the word read from the top; the loop that XORs g, g >> 1, g >> 2, ... computes it.'], complexity: 'Time O(60 q), space O(1).' },
    solve(input) {
      return bigs(rows(input)[1]).map((g) => { const s = g.toString(2); let prev = 0, bits = ''; for (const ch of s) { prev ^= Number(ch); bits += prev; } return BigInt('0b' + bits); }).join(' '); // the bits of the position, from the top
    },
    tests() {
      const g = rng(3076); const out = ['4\n6 5 4 7\n', '1\n0\n', '1\n1000000000000000000\n', '8\n0 1 3 2 6 7 5 4\n'];
      const make = (q, mode) => `${q}\n${many(q, () => (mode === 'big' ? randBig(g, 0n, MAXV) : mode === 'mixed' ? mixedBig(g, MAXV) : BigInt(randInt(g, 0, mode)))).join(' ')}\n`;
      const brute = (input) => { const gs = nums(rows(input)[1]); const at = new Map(); for (let i = 0; i < 5000; i++) at.set(i ^ (i >> 1), i); return gs.map((x) => at.get(x)).join(' '); };
      crossCheck(() => make(randInt(g, 1, 6), 4000), (i) => this.solve(i), brute, 600);
      for (const [q, mode] of [[10, 'big'], [100, 'mixed'], [1000, 'big'], [25000, 'big'], [25000, 'mixed'], [25000, 1000], [24999, 'big']]) out.push(make(q, mode));
      out.push(`25000\n${many(25000, (i) => String(1000000000000000000n - BigInt(i))).join(' ')}\n`, `25000\n${many(25000, (i) => String(1n << BigInt(i % 60))).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of words.', 'The second line has `n` words.'],
    constraints: ['2 <= n <= 2000', 'Each word has 1 to 50 lowercase English letters.'],
    slug: 'disjoint-words-best-product',
    title: 'Two Words With No Common Letter: The Largest Product of Lengths',
    tags: ['bit-manipulation', 'bitmask', 'strings'],
    concept: {
      title: 'Store the letters of every word as a 26-bit mask; two words share no letter when their masks have an empty AND',
      body: [
        'From a list of words choose **two words that have no letter in common** so that the **product of their lengths** is the largest. Print that product, or 0 if every pair shares a letter. For `abcw baz foo bar xtfn abcdef` the answer is 16: `abcw` and `xtfn` have no common letter and the product is `4 * 4`.',
        'Checking whether two words share a letter by comparing the strings takes up to 50 * 50 steps, which is too slow for millions of pairs. Instead turn each word into a **bitmask** of 26 bits: the bit `c` is 1 when the letter number `c` occurs in the word. Then "no common letter" is simply `mask_i & mask_j == 0`, one operation. A mask is built once per word.',
        { code: 'masks, lens = [], []\nfor w in words:\n    m = 0\n    for ch in w:\n        m |= 1 << (ord(ch) - 97)     # switch on the bit of the letter\n    masks.append(m); lens.append(len(w))\nbest = 0\nfor i in range(n):\n    for j in range(i + 1, n):\n        if masks[i] & masks[j] == 0:        # no common letter\n            best = max(best, lens[i] * lens[j])\nprint(best)' },
        'The pair loop costs O(n^2) = 2 million checks for 2000 words, each in constant time. Building the masks costs the total length of the words. If many words have the same mask, only the longest of them matters, which can shrink the loop in practice, but it is not needed here.'
      ]
    },
    statement: ['A list of `n` words is given. Choose two different words (two positions) that have no common letter. Print the largest possible product of their lengths, or 0 if there is no such pair.'],
    outputFormat: ['Print the largest product, or 0.'],
    examples: [{ input: '6\nabcw baz foo bar xtfn abcdef\n', note: 'abcw and xtfn: 4 * 4 = 16.' }, { input: '3\nab ba abab\n', note: 'Every pair shares a letter: 0.' }],
    hints: ['Represent the letters of a word as a 26-bit number.', 'Two words are disjoint when the AND of their masks is 0.', 'Check all pairs and keep the best product.'],
    program: {
      io: ['n:int', 'words:word[n]'],
      fast: true,
      python: r`
        masks = []
        lens = []
        for w in words:
            m = 0
            for ch in w:
                m |= 1 << (ord(ch) - 97)
            masks.append(m)
            lens.append(len(w))
        best = 0
        for i in range(n):
            mi = masks[i]
            li = lens[i]
            for j in range(i + 1, n):
                if mi & masks[j] == 0:
                    v = li * lens[j]
                    if v > best:
                        best = v
        print(best)`,
      cpp: r`
        vector<int> masks(n, 0), lens(n, 0);
        for (long long i = 0; i < n; i++) {
            for (char ch : words[i]) masks[i] |= 1 << (ch - 'a');
            lens[i] = (int)words[i].size();
        }
        long long best = 0;
        for (long long i = 0; i < n; i++) {
            for (long long j = i + 1; j < n; j++) {
                if ((masks[i] & masks[j]) == 0) best = max(best, (long long)lens[i] * lens[j]);
            }
        }
        cout << best << "\n";`,
      java: r`
        int count = (int) n;
        int[] masks = new int[count];
        int[] lens = new int[count];
        for (int i = 0; i < count; i++) {
            for (int k = 0; k < words[i].length(); k++) masks[i] |= 1 << (words[i].charAt(k) - 'a');
            lens[i] = words[i].length();
        }
        long best = 0;
        for (int i = 0; i < count; i++) {
            for (int j = i + 1; j < count; j++) {
                if ((masks[i] & masks[j]) == 0) best = Math.max(best, (long) lens[i] * lens[j]);
            }
        }
        System.out.println(best);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The letters of every word are stored in a bit mask; two words are disjoint when the AND of their masks is zero, and the best product over all disjoint pairs is printed.'], complexity: 'Time O(total length + n^2), space O(n).' },
    solve(input) {
      const w = rows(input)[1].split(' '); const bestLen = new Map(); for (const word of w) { let m = 0; for (const ch of word) m |= 1 << (ch.charCodeAt(0) - 97); bestLen.set(m, Math.max(bestLen.get(m) || 0, word.length)); } // only the longest word of every distinct mask matters
      const items = [...bestLen]; let best = 0; for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) if ((items[i][0] & items[j][0]) === 0) best = Math.max(best, items[i][1] * items[j][1]); return String(best); // equal masks always share a letter, so only pairs of different masks can be disjoint
    },
    tests() {
      const g = rng(3077); const out = ['6\nabcw baz foo bar xtfn abcdef\n', '3\nab ba abab\n', '2\na b\n', '2\naa a\n'];
      const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
      const makeWords = (n, maxLen, alphaSize) => `${n}\n${many(n, () => { const size = randInt(g, 1, alphaSize); const letters = shuffle(g, alphabet).slice(0, size).join(''); return randWord(g, randInt(g, 1, maxLen), letters); }).join(' ')}\n`;
      const brute = (input) => { const w = rows(input)[1].split(' '); let best = 0; for (let i = 0; i < w.length; i++) for (let j = i + 1; j < w.length; j++) { if ([...w[i]].some((c) => w[j].includes(c))) continue; best = Math.max(best, w[i].length * w[j].length); } return String(best); };
      crossCheck(() => makeWords(randInt(g, 2, 8), 5, 6), (i) => this.solve(i), brute, 800);
      for (const [n, maxLen, size] of [[20, 10, 5], [100, 20, 8], [500, 50, 10], [2000, 50, 4], [2000, 50, 12], [2000, 50, 26], [2000, 6, 3], [1999, 50, 8]]) out.push(makeWords(n, maxLen, size));
      out.push(`2000\n${many(2000, (i) => 'abcdefghijklmnopqrstuvwxyz'.slice(0, 1 + (i % 26))).join(' ')}\n`, `2000\n${many(2000, (i) => String.fromCharCode(97 + (i % 26)).repeat(1 + (i % 50))).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `q`: the number of questions.', 'Each of the next `q` lines has three numbers `a`, `b` and `c`.'],
    constraints: ['1 <= q <= 10000', '0 <= a, b, c <= 10^18'],
    slug: 'flips-to-make-or-equal',
    title: 'The Fewest Bit Flips to Make A OR B Equal C',
    tags: ['bit-manipulation', 'popcount', 'per-bit-reasoning'],
    concept: {
      title: 'Decide every bit position separately, and count them all at once with popcount',
      body: [
        'For each question you are given `a`, `b` and `c`. One **flip** changes one bit (0 to 1 or 1 to 0) of `a` or of `b`. What is the **fewest flips** after which `a OR b` equals `c`? For `a = 2` (`010`), `b = 6` (`110`), `c = 5` (`101`) the answer is 3: flip `a` to `001`, `b` to `100`; the OR is `101`.',
        'The positions are independent, so look at one position with the bits `x` (of `a`), `y` (of `b`) and `z` (of `c`). If `z = 1`, we need `x OR y = 1`: nothing to do when one of them is 1, and exactly **one** flip when both are 0. If `z = 0`, we need `x = y = 0`: the cost is the number of ones among `x` and `y`, which is 0, 1 or **2** (both are 1).',
        { code: 'need = (a | b) ^ c           # positions where a|b and c differ: one flip each\nextra = a & b & ~c           # positions with c = 0 and both a and b equal to 1: one more flip\nanswer = bin(need).count("1") + bin(extra).count("1")' },
        'Let us check the formula. In the positions where `a|b` differs from `c`, either `c = 1` and `a|b = 0` (one flip), or `c = 0` and `a|b = 1` (one flip to clear the one bit, or two if both bits are 1). The first group costs 1, and the second costs 1 in `need` plus one more in `extra` when both are 1. Each question costs O(1) popcounts, so the whole input takes O(q).'
      ]
    },
    statement: ['For each question with three numbers `a`, `b`, `c`: one flip changes a single bit of `a` or of `b`. Print the smallest number of flips after which `a OR b` is equal to `c`.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '3\n2 6 5\n4 2 7\n1 2 3\n', note: 'The answers are 3, 1 and 0.' }],
    hints: ['Look at one bit position: the bits of a, b and c decide the cost.', 'Where c has 1 and a|b has 0, one flip is needed.', 'Where c has 0, each of a and b that has 1 needs a flip.'],
    program: {
      io: ['q:int', 'qs:int[q][3]'],
      fast: true,
      python: r`
        out = []
        for a, b, c in qs:
            out.append(bin((a | b) ^ c).count("1") + bin(a & b & ~c).count("1"))
        print(*out)`,
      cpp: r`
        for (long long t = 0; t < q; t++) {
            long long a = qs[t][0], b = qs[t][1], c = qs[t][2];
            int flips = __builtin_popcountll((a | b) ^ c) + __builtin_popcountll(a & b & ~c);
            cout << (t ? " " : "") << flips;
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            long a = qs[t][0], b = qs[t][1], c = qs[t][2];
            int flips = Long.bitCount((a | b) ^ c) + Long.bitCount(a & b & ~c);
            if (t > 0) out.append(" ");
            out.append(flips);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['The positions where a OR b differs from c each need one flip, and the positions where c is 0 while both a and b are 1 need one more; both counts are popcounts.'], complexity: 'Time O(q), space O(1).' },
    solve(input) {
      const n = Number(rows(input)[0]); return bigRows(input, 1, n).map(([a, b, c]) => { let cost = 0; for (let bit = 0n; bit < 61n; bit++) { const x = Number((a >> bit) & 1n), y = Number((b >> bit) & 1n), z = Number((c >> bit) & 1n); if (z === 1) cost += x | y ? 0 : 1; else cost += x + y; } return cost; }).join(' '); // position by position
    },
    tests() {
      const g = rng(3078); const out = ['3\n2 6 5\n4 2 7\n1 2 3\n', '1\n0 0 0\n', '1\n1000000000000000000 1000000000000000000 0\n', '1\n0 0 1000000000000000000\n'];
      const trip = (mode) => (mode === 'big' ? `${randBig(g, 0n, MAXV)} ${randBig(g, 0n, MAXV)} ${randBig(g, 0n, MAXV)}` : mode === 'mixed' ? `${mixedBig(g, MAXV)} ${mixedBig(g, MAXV)} ${mixedBig(g, MAXV)}` : `${randInt(g, 0, mode)} ${randInt(g, 0, mode)} ${randInt(g, 0, mode)}`);
      const make = (q, mode) => `${q}\n${many(q, () => trip(mode)).join('\n')}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); const pop = (x) => x.toString(2).replace(/0/g, '').length; return many(n, (i) => { const [a, b, c] = nums(rows(input)[1 + i]); let best = Infinity; for (let a2 = 0; a2 < 32; a2++) for (let b2 = 0; b2 < 32; b2++) if ((a2 | b2) === c) best = Math.min(best, pop(a ^ a2) + pop(b ^ b2)); return best; }).join(' '); };
      crossCheck(() => make(randInt(g, 1, 5), 15), (i) => this.solve(i), brute, 600);
      for (const [q, mode] of [[10, 'big'], [100, 'mixed'], [1000, 'big'], [10000, 'big'], [10000, 'mixed'], [10000, 255], [9999, 'big']]) out.push(make(q, mode));
      out.push(`10000\n${many(10000, (i) => `${(1n << 59n) - 1n} ${(1n << 58n) - 1n} ${BigInt(i)}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of bytes.', 'The second line has `n` numbers from 0 to 255.'],
    constraints: ['1 <= n <= 50000', '0 <= each byte <= 255'],
    slug: 'valid-utf8-bytes',
    title: 'Is This Byte Sequence a Valid UTF-8 Text?',
    tags: ['bit-manipulation', 'simulation', 'validation'],
    concept: {
      title: 'The leading bits of a byte tell how many continuation bytes must follow, and every continuation byte starts with 10',
      body: [
        'UTF-8 writes a character in **1 to 4 bytes**. The first byte of a character shows its length by the leading bits: `0xxxxxxx` is a 1-byte character, `110xxxxx` starts a 2-byte character, `1110xxxx` a 3-byte one and `11110xxx` a 4-byte one. Every following byte of the character (a *continuation byte*) has the form `10xxxxxx`. Given a list of bytes, is it a **valid** sequence of characters? For `197 130 1` the answer is YES; for `235 140 4` it is NO, since `4` is not a continuation byte.',
        'Read the bytes in order and keep one number: `need`, how many continuation bytes are still expected. When `need > 0`, the byte must have the top two bits `10`, that is `byte >> 6 == 2`, and `need` decreases. When `need == 0`, the byte starts a new character, and the number of leading ones decides: `byte >> 7 == 0` (no more bytes), `byte >> 5 == 0b110` (need 1), `byte >> 4 == 0b1110` (need 2), `byte >> 3 == 0b11110` (need 3). Any other pattern (a lone `10xxxxxx` or `11111xxx`) is invalid.',
        { code: 'need = 0\nok = True\nfor x in data:\n    if need > 0:\n        if x >> 6 != 0b10: ok = False; break    # a continuation byte is expected\n        need -= 1\n    elif x >> 7 == 0: pass\n    elif x >> 5 == 0b110: need = 1\n    elif x >> 4 == 0b1110: need = 2\n    elif x >> 3 == 0b11110: need = 3\n    else: ok = False; break\nprint("YES" if ok and need == 0 else "NO")' },
        'At the end `need` must be 0: a character cut off at the end of the list is also invalid. The check uses only shifts and comparisons on every byte, so it takes O(n) time and O(1) memory. (Real UTF-8 has extra rules about overlong forms and surrogates; this problem uses only the structural rules above.)'
      ]
    },
    statement: ['A list of bytes (numbers from 0 to 255) is given. It is a valid UTF-8 text if it splits into characters, where a character is either a byte `0xxxxxxx`, or a byte `110xxxxx` followed by 1 byte `10xxxxxx`, or `1110xxxx` followed by 2 bytes `10xxxxxx`, or `11110xxx` followed by 3 bytes `10xxxxxx`. Print YES if the list is valid, otherwise NO.'],
    outputFormat: ['Print YES or NO.'],
    examples: [{ input: '3\n197 130 1\n', note: '197 = 11000101 starts a 2-byte character, 130 = 10000010 continues it, 1 is a 1-byte character: YES.' }, { input: '3\n235 140 4\n', note: '235 = 11101011 needs two continuation bytes, but 4 = 00000100 is not one: NO.' }],
    hints: ['Keep how many continuation bytes are still expected.', 'A continuation byte has the top two bits 10, i.e. x >> 6 == 2.', 'At the end nothing may be expected.'],
    program: {
      io: ['n:int', 'data:int[n]'],
      fast: true,
      python: r`
        need = 0
        ok = True
        for x in data:
            if need > 0:
                if (x >> 6) != 2:
                    ok = False
                    break
                need -= 1
            elif (x >> 7) == 0:
                pass
            elif (x >> 5) == 6:
                need = 1
            elif (x >> 4) == 14:
                need = 2
            elif (x >> 3) == 30:
                need = 3
            else:
                ok = False
                break
        print("YES" if ok and need == 0 else "NO")`,
      cpp: r`
        int need = 0;
        bool ok = true;
        for (long long x : data) {
            if (need > 0) {
                if ((x >> 6) != 2) {
                    ok = false;
                    break;
                }
                need--;
            } else if ((x >> 7) == 0) {
            } else if ((x >> 5) == 6) {
                need = 1;
            } else if ((x >> 4) == 14) {
                need = 2;
            } else if ((x >> 3) == 30) {
                need = 3;
            } else {
                ok = false;
                break;
            }
        }
        cout << (ok && need == 0 ? "YES" : "NO") << "\n";`,
      java: r`
        int need = 0;
        boolean ok = true;
        for (long x : data) {
            if (need > 0) {
                if ((x >> 6) != 2) {
                    ok = false;
                    break;
                }
                need--;
            } else if ((x >> 7) == 0) {
            } else if ((x >> 5) == 6) {
                need = 1;
            } else if ((x >> 4) == 14) {
                need = 2;
            } else if ((x >> 3) == 30) {
                need = 3;
            } else {
                ok = false;
                break;
            }
        }
        System.out.println(ok && need == 0 ? "YES" : "NO");`
    },
    solution: { explanation: ['The leading bits of each character start byte give the number of continuation bytes still expected; every continuation byte must have the top bits 10, and no character may be left unfinished at the end.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const d = arrOf(input); let i = 0; // decode character by character
      while (i < d.length) { const b = d[i]; let len; if (b < 128) len = 1; else if (b >> 5 === 6) len = 2; else if (b >> 4 === 14) len = 3; else if (b >> 3 === 30) len = 4; else return 'NO'; if (i + len > d.length) return 'NO'; for (let k = 1; k < len; k++) if (d[i + k] >> 6 !== 2) return 'NO'; i += len; } return 'YES';
    },
    tests() {
      const g = rng(3079); const out = ['3\n197 130 1\n', '3\n235 140 4\n', '1\n0\n', '1\n128\n', '2\n240 128\n'];
      const rnd = (bits) => randInt(g, 0, (1 << bits) - 1);
      const encode = (t) => (t === 1 ? [rnd(7)] : t === 2 ? [0xc0 | rnd(5), 0x80 | rnd(6)] : t === 3 ? [0xe0 | rnd(4), 0x80 | rnd(6), 0x80 | rnd(6)] : [0xf0 | rnd(3), 0x80 | rnd(6), 0x80 | rnd(6), 0x80 | rnd(6)]);
      const valid = (n) => { const bytes = []; while (bytes.length < n) bytes.push(...encode(randInt(g, 1, Math.min(4, n - bytes.length)))); return bytes; };
      const mutate = (bytes) => { const b = bytes.slice(); const m = randInt(g, 0, 3); if (m === 0) b[randInt(g, 0, b.length - 1)] = randInt(g, 0, 255); else if (m === 1 && b.length > 1) b.pop(); else if (m === 2) b[randInt(g, 0, b.length - 1)] = 255; else b[b.length - 1] = 0xe0 | rnd(4); return b; };
      const make = (n, bad) => { let b = valid(n); if (bad) b = mutate(b); return `${b.length}\n${b.join(' ')}\n`; };
      const brute = (input) => { const d = arrOf(input); const bits = d.map((x) => x.toString(2).padStart(8, '0')).join(''); return /^(?:0[01]{7}|110[01]{5}10[01]{6}|1110[01]{4}(?:10[01]{6}){2}|11110[01]{3}(?:10[01]{6}){3})*$/.test(bits) ? 'YES' : 'NO'; };
      crossCheck(() => (g() < 0.3 ? `6\n${randArray(g, 6, 0, 255).join(' ')}\n` : make(randInt(g, 1, 8), g() < 0.5)), (i) => this.solve(i), brute, 1500);
      for (const [n, bad] of [[10, false], [10, true], [100, false], [1000, true], [50000, false], [50000, true], [50000, false], [49999, true], [49998, false]]) out.push(make(n, bad));
      out.push(`50000\n${new Array(50000).fill(65).join(' ')}\n`, `50000\n${many(50000, (i) => [0xf0, 0x90, 0x80, 0x80, 0xc2, 0xa9, 0xe2, 0x82, 0xac, 65][i % 10]).join(' ')}\n`, `50000\n${many(50000, (i) => (i === 0 ? 0xf0 : i < 4 ? 0x80 : 65)).join(' ')}\n`);
      return out;
    }
  }
];
