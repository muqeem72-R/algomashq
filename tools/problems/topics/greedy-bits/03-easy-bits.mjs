import { r, rng, randInt, many, rows, shuffle } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const easy = { difficulty: 'easy' };
const LIMIT = 10n ** 18n;
const big = (g, bits) => { let x = 0n; for (let i = 0; i < bits; i += 30) x = (x << 30n) | BigInt(Math.floor(g() * 2 ** 30)); return x & ((1n << BigInt(bits)) - 1n); };
const randBelow = (g, limit) => big(g, 64) % limit;
const bigList = (input) => rows(input)[1].split(' ').map(BigInt);
const listText = (a) => `${a.length}\n${a.join(' ')}\n`;
const pairsText = (a) => `${a.length}\n${a.map((p) => p.join(' ')).join('\n')}\n`;
const ONE_TO_LIMIT = (g) => 1n + randBelow(g, LIMIT);
// numbers of every size from 1 bit to 59 bits, random inside each size
const varied = (g, n) => many(n, (i) => { const bits = 1 + (i % 59); return (1n << BigInt(bits - 1)) | (big(g, bits) & ((1n << BigInt(bits - 1)) - 1n)); }).map((x) => (x > LIMIT ? LIMIT : x));
const QUERY_INPUT = ['The first line has `q`: the number of questions.', 'The second line has `q` numbers.'];

export default [
  {
    ...easy,
    inputFormat: QUERY_INPUT,
    constraints: ['1 <= q <= 30000', '1 <= each number <= 10^18'],
    slug: 'which-numbers-are-powers-of-two',
    title: 'Which Numbers Are Powers of Two?',
    tags: ['bits', 'bit-tricks', 'power-of-two'],
    concept: {
      title: 'A power of two has exactly one 1-bit, and n & (n - 1) removes the lowest 1-bit',
      body: [
        'A number is a *power of two* if it is `1, 2, 4, 8, 16, ...`. In binary these are `1, 10, 100, 1000, 10000, ...`: a single `1` followed by zeros. For each question number decide whether it is a power of two. For `16` yes, for `12` (binary `1100`) no.',
        'Subtracting 1 from a binary number turns its **lowest 1-bit into 0** and all the zeros below it into ones: `1100 - 1 = 1011`, and `10000 - 1 = 01111`. So `n & (n - 1)` is the number `n` with its lowest 1-bit removed. If `n` has **exactly one** 1-bit, removing it leaves 0. If `n` has more, something remains. So `n` is a power of two exactly when `n > 0` and `n & (n - 1) == 0`.',
        { code: 'for x in numbers:\n    answer.append("yes" if x > 0 and x & (x - 1) == 0 else "no")\nprint(*answer)' },
        'The test is one subtraction and one AND, so it takes O(1) per number, much faster than dividing by 2 again and again. The expression `n & (n - 1)` is one of the basic bit tricks that you will meet again in the next problems.'
      ]
    },
    statement: ['For each of the `q` given numbers print `yes` if it is a power of two (1, 2, 4, 8, ...) and `no` otherwise.'],
    outputFormat: ['Print `q` words (`yes` or `no`) on one line, separated by spaces.'],
    examples: [{ input: '5\n1 2 3 16 1000000000000000000\n', note: '1, 2 and 16 are powers of two; 3 and 10^18 are not.' }],
    hints: ['In binary a power of two has exactly one 1-bit.', 'n - 1 flips the lowest 1-bit and the zeros below it.', 'Test n > 0 and n & (n - 1) == 0.'],
    program: {
      io: ['q:int', 'ns:int[q]'],
      fast: true,
      python: r`
        answer = []
        for x in ns:
            answer.append("yes" if x > 0 and x & (x - 1) == 0 else "no")
        print(*answer)`,
      cpp: r`
        for (long long i = 0; i < q; i++) {
            long long x = ns[i];
            cout << (i ? " " : "") << ((x > 0 && (x & (x - 1)) == 0) ? "yes" : "no");
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long x = ns[i];
            out.append(i > 0 ? " " : "").append((x > 0 && (x & (x - 1)) == 0) ? "yes" : "no");
        }
        System.out.println(out);`
    },
    solution: { explanation: ['n & (n - 1) removes the lowest 1-bit of n, so it is 0 exactly when n has at most one 1-bit; for a positive n that means that n is a power of two.'], complexity: 'Time O(q), space O(1) extra.' },
    solve(input) {
      const powers = new Set(); for (let b = 0n; b < 62n; b++) powers.add(1n << b); return bigList(input).map((x) => (powers.has(x) ? 'yes' : 'no')).join(' ');
    },
    tests() {
      const g = rng(3021); const out = ['5\n1 2 3 16 1000000000000000000\n', '1\n1\n', '1\n576460752303423488\n', '3\n576460752303423487 576460752303423489 999999999999999999\n'];
      const brute = (input) => bigList(input).map((x) => { let y = x; while (y > 1n && y % 2n === 0n) y /= 2n; return y === 1n ? 'yes' : 'no'; }).join(' ');
      crossCheck(() => listText(many(randInt(g, 1, 8), () => 1n + randBelow(g, 70n))), (i) => this.solve(i), brute, 400);
      const mixed = (n) => many(n, (i) => { const bits = BigInt(randInt(g, 0, 59)); const p = 1n << bits; return i % 3 === 0 ? p : i % 3 === 1 ? (p > 1n ? p - 1n : 3n) : p + 1n; });
      for (const n of [10, 100, 1000, 30000, 30000]) out.push(listText(mixed(n)));
      out.push(listText(varied(g, 30000)), listText(many(30000, () => ONE_TO_LIMIT(g))), listText(many(30000, (i) => 1n << BigInt(i % 60))), listText(many(30000, (i) => LIMIT - BigInt(i))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: QUERY_INPUT,
    constraints: ['1 <= q <= 30000', '1 <= each number <= 10^18'],
    slug: 'ones-in-every-number',
    title: 'How Many One-Bits Does Each Number Have?',
    tags: ['bits', 'bit-tricks', 'popcount'],
    concept: {
      title: 'Remove the lowest 1-bit again and again, and count how many times it takes',
      body: [
        'The *binary representation* of a number is a string of bits, and the count of the bits that are `1` is called its *population count* (or *popcount*). For `7 = 111` it is 3, for `8 = 1000` it is 1, for `255 = 11111111` it is 8. For each question number print its popcount.',
        'The previous problem showed that `x & (x - 1)` removes the **lowest 1-bit** of `x`. Repeating this until `x` becomes 0 removes the 1-bits one by one, so the **number of repetitions equals the number of 1-bits**. This method (it is called *Kernighan\'s algorithm*) does not look at the zero bits at all, so its time depends on the number of ones, not on the length of the number: at most 60 steps for numbers up to 10^18.',
        { code: 'for x in numbers:\n    count = 0\n    while x:\n        x &= x - 1            # drop the lowest 1-bit\n        count += 1\n    answer.append(count)\nprint(*answer)' },
        'The usual alternative checks every bit position with `x & 1` and `x >>= 1`, which takes as many steps as the number has bits. Both are fine here; the first is shorter when there are few ones. Many languages have a built-in popcount function (`bin(x).count("1")` in Python, `__builtin_popcountll` in C++, `Long.bitCount` in Java), and it is good to know what they do inside.'
      ]
    },
    statement: ['For each of the `q` given numbers print the number of 1-bits in its binary representation.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '3\n7 8 255\n', note: '111 has three ones, 1000 has one, 11111111 has eight: 3 1 8.' }],
    hints: ['x & (x - 1) removes the lowest 1-bit.', 'Count how many times you can do it before x becomes 0.', 'The numbers are up to 10^18: use 64-bit integers.'],
    program: {
      io: ['q:int', 'ns:int[q]'],
      fast: true,
      python: r`
        answer = []
        for x in ns:
            count = 0
            while x:
                x &= x - 1
                count += 1
            answer.append(count)
        print(*answer)`,
      cpp: r`
        for (long long i = 0; i < q; i++) {
            long long x = ns[i], count = 0;
            while (x) {
                x &= x - 1;
                count++;
            }
            cout << (i ? " " : "") << count;
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long x = ns[i], count = 0;
            while (x != 0) {
                x &= x - 1;
                count++;
            }
            out.append(i > 0 ? " " : "").append(count);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['x & (x - 1) removes the lowest 1-bit, so repeating it until x is 0 takes exactly as many steps as x has 1-bits; the number of steps is printed for each number.'], complexity: 'Time O(q * 60), space O(1) extra.' },
    solve(input) {
      return bigList(input).map((x) => [...x.toString(2)].filter((c) => c === '1').length).join(' ');
    },
    tests() {
      const g = rng(3022); const out = ['3\n7 8 255\n', '1\n1\n', '1\n1000000000000000000\n', '2\n576460752303423487 576460752303423488\n'];
      const brute = (input) => bigList(input).map((x) => { let c = 0; for (let b = 0n; b < 62n; b++) if ((x >> b) & 1n) c++; return c; }).join(' ');
      crossCheck(() => listText(many(randInt(g, 1, 6), () => ONE_TO_LIMIT(g))), (i) => this.solve(i), brute, 400);
      for (const n of [10, 100, 1000, 30000]) out.push(listText(many(n, () => ONE_TO_LIMIT(g))));
      out.push(listText(varied(g, 30000)), listText(many(30000, (i) => (1n << BigInt(1 + (i % 59))) - 1n)), listText(many(30000, (i) => LIMIT - BigInt(i))), listText(many(30000, (i) => BigInt(i + 1))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `q`: the number of pairs.', 'Each of the next `q` lines has two numbers `a` and `b`.'],
    constraints: ['1 <= q <= 30000', '0 <= a, b <= 10^18'],
    slug: 'bits-that-differ',
    title: 'How Many Bits Differ Between Two Numbers?',
    tags: ['bits', 'xor', 'hamming-distance'],
    concept: {
      title: 'XOR is 1 exactly where the bits differ: count its ones',
      body: [
        'The *Hamming distance* of two numbers is the number of bit positions in which their binary representations are different. For `1 = 001` and `4 = 100` the distance is 2 (the lowest bit and the highest bit differ). For equal numbers it is 0. For each pair of numbers print the distance.',
        'The operation **XOR** (`^`) gives a bit 1 exactly when the two bits are **different**: `0 ^ 0 = 0`, `1 ^ 1 = 0`, `0 ^ 1 = 1 ^ 0 = 1`. So the positions in which `a` and `b` differ are exactly the 1-bits of `a ^ b`, and the Hamming distance is the number of 1-bits (the popcount) of `a ^ b`. One XOR and the popcount loop from the previous problem solve each pair.',
        { code: 'for a, b in pairs:\n    x = a ^ b                 # 1 where the bits differ\n    count = 0\n    while x:\n        x &= x - 1\n        count += 1\n    answer.append(count)\nprint(*answer)' },
        'Numbers are padded with leading zeros to the same length, which `^` does automatically. The Hamming distance is used in error-correcting codes and in comparing fingerprints: two codes at a small distance are almost the same. Each pair costs O(60) steps.'
      ]
    },
    statement: ['For each of the `q` pairs of numbers `a` and `b`, print the number of bit positions at which the binary representations of `a` and `b` differ (shorter numbers are filled with leading zeros).'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '2\n1 4\n7 7\n', note: '001 and 100 differ in 2 places; equal numbers differ in none: 2 0.' }],
    hints: ['a ^ b has a 1 exactly where the bits of a and b differ.', 'Count the 1-bits of a ^ b.', 'Use 64-bit integers.'],
    program: {
      io: ['q:int', 'pairs:int[q][2]'],
      fast: true,
      python: r`
        answer = []
        for a, b in pairs:
            x = a ^ b
            count = 0
            while x:
                x &= x - 1
                count += 1
            answer.append(count)
        print(*answer)`,
      cpp: r`
        for (long long i = 0; i < q; i++) {
            long long x = pairs[i][0] ^ pairs[i][1], count = 0;
            while (x) {
                x &= x - 1;
                count++;
            }
            cout << (i ? " " : "") << count;
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long x = pairs[i][0] ^ pairs[i][1], count = 0;
            while (x != 0) {
                x &= x - 1;
                count++;
            }
            out.append(i > 0 ? " " : "").append(count);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['a ^ b has a 1-bit exactly at the positions where a and b differ, so the Hamming distance is the number of 1-bits of a ^ b, counted by removing the lowest 1-bit repeatedly.'], complexity: 'Time O(q * 60), space O(1) extra.' },
    solve(input) {
      const rs = rows(input); const q = Number(rs[0]); const out = []; for (let i = 1; i <= q; i++) { const [a, b] = rs[i].split(' ').map(BigInt); const sa = a.toString(2).padStart(64, '0'), sb = b.toString(2).padStart(64, '0'); let c = 0; for (let k = 0; k < 64; k++) if (sa[k] !== sb[k]) c++; out.push(c); } return out.join(' ');
    },
    tests() {
      const g = rng(3023); const out = ['2\n1 4\n7 7\n', '1\n0 0\n', '1\n0 1000000000000000000\n', '1\n1000000000000000000 576460752303423487\n'];
      const brute = (input) => { const rs = rows(input); const q = Number(rs[0]); const res = []; for (let i = 1; i <= q; i++) { let [a, b] = rs[i].split(' ').map(BigInt); let c = 0; while (a > 0n || b > 0n) { if ((a & 1n) !== (b & 1n)) c++; a >>= 1n; b >>= 1n; } res.push(c); } return res.join(' '); };
      const make = (n) => pairsText(many(n, () => [randBelow(g, LIMIT + 1n), randBelow(g, LIMIT + 1n)]));
      crossCheck(() => pairsText(many(randInt(g, 1, 6), () => [randBelow(g, 300n), randBelow(g, 300n)])), (i) => this.solve(i), brute, 400);
      for (const n of [10, 100, 1000, 30000, 30000]) out.push(make(n));
      out.push(pairsText(many(30000, (i) => [LIMIT - BigInt(i), BigInt(i)])), pairsText(many(30000, (i) => [BigInt(i), BigInt(i)])), pairsText(many(30000, (i) => [0n, (1n << BigInt(i % 60)) - 1n])));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: QUERY_INPUT,
    constraints: ['1 <= q <= 30000', '1 <= each number <= 10^18'],
    slug: 'even-or-odd-number-of-ones',
    title: 'Is the Number of One-Bits Even or Odd?',
    tags: ['bits', 'xor', 'parity'],
    concept: {
      title: 'XOR the halves of the number onto each other until one bit holds the parity',
      body: [
        'The *parity* of a number\'s binary representation is whether the **number of 1-bits is even or odd**. For `3 = 11` it is even (2 ones), for `7 = 111` it is odd (3 ones). Parity bits are used to detect single-bit errors in data transmission. For each question number print `even` or `odd`.',
        'You could count the ones and look at the remainder modulo 2. A cleverer way uses XOR, because `1 ^ 1 = 0`: **XOR of a group of bits is 1 exactly when the group has an odd number of ones**. So the parity of a 64-bit number is the XOR of all its 64 bits. XOR the upper half onto the lower half: `x ^= x >> 32` — now the low 32 bits hold the XOR of the pairs, and the parity of the whole number is the parity of the low 32 bits. Repeat with 16, 8, 4, 2 and 1. After the last step the lowest bit is the parity.',
        { code: 'for x in numbers:\n    x ^= x >> 32\n    x ^= x >> 16\n    x ^= x >> 8\n    x ^= x >> 4\n    x ^= x >> 2\n    x ^= x >> 1\n    answer.append("odd" if x & 1 else "even")      # the lowest bit is the parity\nprint(*answer)' },
        'Each folding halves the number of bits that matter, so six steps handle 64 bits, a fixed amount of work for every number (no loop over the ones). This "fold by halves" idea also computes the popcount and reverses bits in parallel inside one machine word.'
      ]
    },
    statement: ['For each of the `q` given numbers print `odd` if its binary representation has an odd number of 1-bits, and `even` otherwise.'],
    outputFormat: ['Print `q` words (`even` or `odd`) on one line, separated by spaces.'],
    examples: [{ input: '4\n1 3 7 8\n', note: '1 and 8 have one 1-bit, 7 has three (odd); 3 has two (even): odd even odd odd.' }],
    hints: ['XOR of all the bits of the number is its parity.', 'Fold the number onto itself: x ^= x >> 32, then 16, 8, 4, 2, 1.', 'The lowest bit then holds the answer.'],
    program: {
      io: ['q:int', 'ns:int[q]'],
      fast: true,
      python: r`
        answer = []
        for x in ns:
            x ^= x >> 32
            x ^= x >> 16
            x ^= x >> 8
            x ^= x >> 4
            x ^= x >> 2
            x ^= x >> 1
            answer.append("odd" if x & 1 else "even")
        print(*answer)`,
      cpp: r`
        for (long long i = 0; i < q; i++) {
            long long x = ns[i];
            x ^= x >> 32;
            x ^= x >> 16;
            x ^= x >> 8;
            x ^= x >> 4;
            x ^= x >> 2;
            x ^= x >> 1;
            cout << (i ? " " : "") << ((x & 1) ? "odd" : "even");
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long x = ns[i];
            x ^= x >> 32;
            x ^= x >> 16;
            x ^= x >> 8;
            x ^= x >> 4;
            x ^= x >> 2;
            x ^= x >> 1;
            out.append(i > 0 ? " " : "").append((x & 1) != 0 ? "odd" : "even");
        }
        System.out.println(out);`
    },
    solution: { explanation: ['The upper half of the 64 bits is XORed onto the lower half (shift by 32, 16, 8, 4, 2, 1); after the last step the lowest bit is the XOR of all the bits, which is 1 exactly when the number of 1-bits is odd.'], complexity: 'Time O(q), space O(1) extra.' },
    solve(input) {
      return bigList(input).map((x) => ([...x.toString(2)].filter((c) => c === '1').length % 2 ? 'odd' : 'even')).join(' ');
    },
    tests() {
      const g = rng(3024); const out = ['4\n1 3 7 8\n', '1\n1\n', '1\n1000000000000000000\n', '2\n3 576460752303423487\n'];
      const brute = (input) => bigList(input).map((x) => { let p = 0n; let y = x; while (y > 0n) { p ^= y & 1n; y >>= 1n; } return p ? 'odd' : 'even'; }).join(' ');
      crossCheck(() => listText(many(randInt(g, 1, 6), () => ONE_TO_LIMIT(g))), (i) => this.solve(i), brute, 400);
      for (const n of [10, 100, 1000, 30000]) out.push(listText(many(n, () => ONE_TO_LIMIT(g))));
      out.push(listText(varied(g, 30000)), listText(many(30000, (i) => BigInt(i + 1))), listText(many(30000, (i) => LIMIT - BigInt(i))), listText(many(30000, (i) => (1n << BigInt(i % 60)) + (i % 2 ? 1n : 0n))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: QUERY_INPUT,
    constraints: ['1 <= q <= 30000', '1 <= each number <= 10^18'],
    slug: 'lowest-one-bit-value',
    title: 'The Value of the Lowest One-Bit of Each Number',
    tags: ['bits', 'bit-tricks', 'twos-complement'],
    concept: {
      title: 'x & -x isolates the lowest 1-bit, because -x is the bitwise complement plus one',
      body: [
        'Every positive number is a sum of different powers of two (its 1-bits). The **lowest 1-bit** is the smallest of them. For `12 = 8 + 4 = 1100` it is 4; for `40 = 32 + 8` it is 8; for `7` it is 1. For each question number print the **value** of its lowest 1-bit. This is the biggest power of two that divides the number.',
        'In the computer a negative number `-x` is stored as the *two\'s complement*: flip all the bits of `x` and add 1. Flipping turns the lowest 1-bit of `x` into a 0 with zeros below it turned into ones; adding 1 then carries through those ones and puts the 1 back **exactly at the position of the lowest 1-bit of `x`**, while the bits above stay flipped. So `x` and `-x` have a 1 in the same place at the lowest 1-bit and nothing in common above it (they are opposite there), and below it both are 0. Therefore **`x & -x`** keeps only the lowest 1-bit.',
        { code: 'for x in numbers:\n    answer.append(x & -x)          # for x = 1100 : -x = ...0100, and the AND is 0100\nprint(*answer)' },
        'This one-line trick is used in the *Fenwick tree* (`i += i & -i`) and in enumerating the subsets of a set. In Python negative numbers act as if they had infinitely many leading ones, so `x & -x` works as written; in C++ and Java use a signed 64-bit type.'
      ]
    },
    statement: ['For each of the `q` given numbers print the value of its lowest 1-bit: the largest power of two that divides the number.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '4\n12 8 7 40\n', note: '12 = 1100 has the lowest one-bit 4; 8 has 8; 7 has 1; 40 = 101000 has 8: 4 8 1 8.' }],
    hints: ['-x is the complement of x plus one.', 'x & -x keeps only the lowest 1-bit.', 'The result is the largest power of two that divides x.'],
    program: {
      io: ['q:int', 'ns:int[q]'],
      fast: true,
      python: r`
        answer = []
        for x in ns:
            answer.append(x & -x)
        print(*answer)`,
      cpp: r`
        for (long long i = 0; i < q; i++) {
            long long x = ns[i];
            cout << (i ? " " : "") << (x & -x);
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long x = ns[i];
            out.append(i > 0 ? " " : "").append(x & -x);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['In two\'s complement -x is the complement of x plus one, which keeps the lowest 1-bit of x in place and flips everything above it, so x & -x leaves exactly the lowest 1-bit.'], complexity: 'Time O(q), space O(1) extra.' },
    solve(input) {
      return bigList(input).map((x) => { let p = 1n; while (x % (p * 2n) === 0n) p *= 2n; return p; }).join(' ');
    },
    tests() {
      const g = rng(3025); const out = ['4\n12 8 7 40\n', '1\n1\n', '1\n576460752303423488\n', '1\n1000000000000000000\n'];
      const brute = (input) => bigList(input).map((x) => { for (let b = 0n; b < 62n; b++) if ((x >> b) & 1n) return 1n << b; return 0n; }).join(' ');
      crossCheck(() => listText(many(randInt(g, 1, 6), () => ONE_TO_LIMIT(g))), (i) => this.solve(i), brute, 400);
      for (const n of [10, 100, 1000, 30000]) out.push(listText(many(n, () => ONE_TO_LIMIT(g))));
      out.push(listText(varied(g, 30000)), listText(many(30000, (i) => BigInt(i + 1))), listText(many(30000, (i) => (1n << BigInt(i % 50)) * BigInt(2 * (i % 7) + 1))), listText(many(30000, (i) => LIMIT - BigInt(i))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: QUERY_INPUT,
    constraints: ['1 <= q <= 30000', '0 <= each number < 2^32'],
    slug: 'reverse-the-32-bits',
    title: 'Reverse the 32 Bits of Each Number',
    tags: ['bits', 'shifts', 'reverse'],
    concept: {
      title: 'Take the bits off the right end one by one and push them onto the right end of the answer',
      body: [
        'Write a number as a string of **exactly 32 bits** (with leading zeros), turn the string around, and read the result as a number. For `1 = 000...001` the reversed string is `1000...000`, which is `2147483648 = 2^31`. For `43261596` the answer is `964176192`. Each question number is smaller than `2^32` (an *unsigned* 32-bit number).',
        'Build the answer bit by bit. Start with `result = 0`. Repeat **32 times**: shift the result one place to the left to make room (`result << 1`), take the lowest bit of the number (`x & 1`) and put it into the result with OR, and shift the number one place to the right (`x >> 1`) to get to the next bit. The first bit taken from the number (its lowest bit) travels the farthest to the left, so the order is reversed.',
        { code: 'for x in numbers:\n    result = 0\n    for _ in range(32):\n        result = (result << 1) | (x & 1)\n        x >>= 1\n    answer.append(result)\nprint(*answer)' },
        'It is important to do all **32** steps even when `x` becomes 0 early, because the leading zeros of the number become the trailing zeros of the result. The loop costs 32 steps per number. In C++ and Java use a 64-bit type for the result, because the answer can be larger than `2^31` and would be negative in a signed 32-bit type.'
      ]
    },
    statement: ['For each of the `q` given numbers (each smaller than 2^32), write it with exactly 32 bits, reverse the order of the bits, and print the number that the reversed bits represent.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '2\n43261596 1\n', note: '43261596 becomes 964176192, and 1 becomes 2^31 = 2147483648.' }],
    hints: ['Repeat 32 times: result = (result << 1) | (x & 1), then x >>= 1.', 'Do all 32 steps, also when x is already 0.', 'Use 64-bit integers for the result.'],
    program: {
      io: ['q:int', 'ns:int[q]'],
      fast: true,
      python: r`
        answer = []
        for x in ns:
            result = 0
            for _ in range(32):
                result = (result << 1) | (x & 1)
                x >>= 1
            answer.append(result)
        print(*answer)`,
      cpp: r`
        for (long long i = 0; i < q; i++) {
            long long x = ns[i], result = 0;
            for (int step = 0; step < 32; step++) {
                result = (result << 1) | (x & 1);
                x >>= 1;
            }
            cout << (i ? " " : "") << result;
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long x = ns[i], result = 0;
            for (int step = 0; step < 32; step++) {
                result = (result << 1) | (x & 1);
                x >>= 1;
            }
            out.append(i > 0 ? " " : "").append(result);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['32 times the lowest bit of the number is moved to the right end of the result (after shifting the result left by one), and the number is shifted right; the result is the 32-bit reversal.'], complexity: 'Time O(q * 32), space O(1) extra.' },
    solve(input) {
      return bigList(input).map((x) => BigInt('0b' + x.toString(2).padStart(32, '0').split('').reverse().join(''))).join(' ');
    },
    tests() {
      const g = rng(3026); const out = ['2\n43261596 1\n', '1\n0\n', '1\n4294967295\n', '1\n4294967293\n'];
      const brute = (input) => bigList(input).map((x) => { let res = 0n; for (let b = 0n; b < 32n; b++) if ((x >> b) & 1n) res |= 1n << (31n - b); return res; }).join(' ');
      const below = () => randBelow(g, 1n << 32n);
      crossCheck(() => listText(many(randInt(g, 1, 6), below)), (i) => this.solve(i), brute, 400);
      for (const n of [10, 100, 1000, 30000]) out.push(listText(many(n, below)));
      out.push(listText(many(30000, (i) => BigInt(i))), listText(many(30000, (i) => (1n << 32n) - 1n - BigInt(i))), listText(many(30000, (i) => 1n << BigInt(i % 32))), listText(many(30000, (i) => (1n << BigInt(1 + (i % 32))) - 1n)));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: QUERY_INPUT,
    constraints: ['1 <= q <= 30000', '1 <= each number <= 10^18'],
    slug: 'flip-below-the-highest-bit',
    title: 'Flip All the Bits Below the Highest One-Bit',
    tags: ['bits', 'masks', 'complement'],
    concept: {
      title: 'Build a mask of ones as long as the number, and XOR the number with it',
      body: [
        'The *complement* of a number is obtained by writing it in binary **without leading zeros** and flipping every bit. For `5 = 101` the complement is `010 = 2`; for `1 = 1` it is `0`; for `10 = 1010` it is `0101 = 5`. Leading zeros are not flipped (otherwise the answer would depend on the word size). For each question number print its complement.',
        'XOR with a bit `1` flips the other bit, and XOR with `0` leaves it as it is. So flipping exactly the bits of the number is `x ^ mask`, where `mask` has a **1 in every position that `x` uses**: `mask = 2^k - 1`, where `k` is the **number of bits** of `x` (`101` uses 3 bits and the mask is `111 = 7`). To build the mask without a built-in function, start with `mask = 1` and keep doubling it while it is not bigger than `x`: the first power of two above `x` is `2^k`, and `mask - 1` is the wanted all-ones mask.',
        { code: 'for x in numbers:\n    mask = 1\n    while mask <= x:\n        mask <<= 1               # the first power of two above x\n    answer.append(x ^ (mask - 1))\nprint(*answer)' },
        'For `x = 5` the loop makes `mask = 8`, and `5 ^ 7 = 2`. The mask loop runs about 60 times at most per number. Python has `x.bit_length()` for the number of bits, and C++ has `__builtin_clzll`; the loop shows what these do. Masks of the form `2^k - 1` are used everywhere in bit manipulation to select the lowest `k` bits.'
      ]
    },
    statement: ['For each of the `q` given numbers write it in binary without leading zeros, flip every bit, and print the number that the flipped bits represent (leading zeros of the result are simply dropped).'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '3\n5 1 10\n', note: '101 becomes 010 = 2; 1 becomes 0; 1010 becomes 0101 = 5.' }],
    hints: ['XOR with a 1 flips a bit.', 'The mask must have ones exactly in the positions that the number uses: 2^k - 1.', 'Find the first power of two above the number by doubling.'],
    program: {
      io: ['q:int', 'ns:int[q]'],
      fast: true,
      python: r`
        answer = []
        for x in ns:
            mask = 1
            while mask <= x:
                mask <<= 1
            answer.append(x ^ (mask - 1))
        print(*answer)`,
      cpp: r`
        for (long long i = 0; i < q; i++) {
            long long x = ns[i], mask = 1;
            while (mask <= x) mask <<= 1;
            cout << (i ? " " : "") << (x ^ (mask - 1));
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long x = ns[i], mask = 1;
            while (mask <= x) mask <<= 1;
            out.append(i > 0 ? " " : "").append(x ^ (mask - 1));
        }
        System.out.println(out);`
    },
    solution: { explanation: ['The first power of two above x is found by doubling a mask; mask - 1 has ones exactly in the positions of x, and XOR with it flips those bits.'], complexity: 'Time O(q * 60), space O(1) extra.' },
    solve(input) {
      return bigList(input).map((x) => { const s = x.toString(2); return BigInt('0b' + s.split('').map((c) => (c === '1' ? '0' : '1')).join('')); }).join(' ');
    },
    tests() {
      const g = rng(3027); const out = ['3\n5 1 10\n', '1\n1\n', '1\n1000000000000000000\n', '2\n576460752303423487 576460752303423488\n'];
      const brute = (input) => bigList(input).map((x) => { let k = 0n; while ((1n << k) <= x) k++; return ((1n << k) - 1n) - x; }).join(' ');
      crossCheck(() => listText(many(randInt(g, 1, 6), () => ONE_TO_LIMIT(g))), (i) => this.solve(i), brute, 400);
      for (const n of [10, 100, 1000, 30000]) out.push(listText(many(n, () => ONE_TO_LIMIT(g))));
      out.push(listText(varied(g, 30000)), listText(many(30000, (i) => BigInt(i + 1))), listText(many(30000, (i) => LIMIT - BigInt(i))), listText(many(30000, (i) => 1n << BigInt(i % 59))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: QUERY_INPUT,
    constraints: ['1 <= q <= 30000', '1 <= each number <= 10^18'],
    slug: 'longest-distance-between-ones',
    title: 'The Longest Distance Between Two Neighbouring One-Bits',
    tags: ['bits', 'scan', 'binary-gap'],
    concept: {
      title: 'Scan the bits from the lowest, remember where the last 1 was',
      body: [
        'Number the bit positions of a number from the right, starting with 0. Look at two 1-bits that are **neighbours** (no other 1-bit between them). Their *distance* is the difference of their positions. What is the **largest distance** between two neighbouring ones in a number? For `22 = 10110` the ones are at the positions 1, 2 and 4: the distances are 1 and 2, so the answer is 2. For `5 = 101` it is 2, for `6 = 110` it is 1, and for `8 = 1000` (a single 1) it is 0.',
        'Walk through the bits from the lowest to the highest with a position counter `pos`. Keep `last`, the position of the previous 1-bit (or -1 if there was none yet). When the current bit is a 1: if a previous 1 exists, the distance is `pos - last`, and the maximum is updated; then `last = pos`. The bits are examined with `x & 1`, followed by `x >>= 1`. The zeros only advance the position counter.',
        { code: 'for x in numbers:\n    last = -1\n    best = 0\n    pos = 0\n    while x:\n        if x & 1:\n            if last >= 0:\n                best = max(best, pos - last)\n            last = pos\n        x >>= 1\n        pos += 1\n    answer.append(best)\nprint(*answer)' },
        'The loop runs once for every bit of the number (at most 60). The key variable is `last`, the memory of the previous event: many "gap" problems are solved by remembering the position of the last interesting item while scanning.'
      ]
    },
    statement: ['For each of the `q` given numbers, find the largest difference between the positions of two neighbouring 1-bits in its binary representation (the positions are counted from 0 at the lowest bit). Print 0 if the number has fewer than two 1-bits.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '4\n22 5 6 8\n', note: '22 = 10110: the ones are at the positions 1, 2 and 4, the largest distance is 2; 101: 2; 110: 1; 1000: 0.' }],
    hints: ['Scan the bits from the lowest and count the position.', 'Remember the position of the previous 1-bit.', 'Update the maximum with pos - last when you meet the next 1-bit.'],
    program: {
      io: ['q:int', 'ns:int[q]'],
      fast: true,
      python: r`
        answer = []
        for x in ns:
            last = -1
            best = 0
            pos = 0
            while x:
                if x & 1:
                    if last >= 0 and pos - last > best:
                        best = pos - last
                    last = pos
                x >>= 1
                pos += 1
            answer.append(best)
        print(*answer)`,
      cpp: r`
        for (long long i = 0; i < q; i++) {
            long long x = ns[i];
            int last = -1, best = 0, pos = 0;
            while (x) {
                if (x & 1) {
                    if (last >= 0 && pos - last > best) best = pos - last;
                    last = pos;
                }
                x >>= 1;
                pos++;
            }
            cout << (i ? " " : "") << best;
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long x = ns[i];
            int last = -1, best = 0, pos = 0;
            while (x != 0) {
                if ((x & 1) != 0) {
                    if (last >= 0 && pos - last > best) best = pos - last;
                    last = pos;
                }
                x >>= 1;
                pos++;
            }
            out.append(i > 0 ? " " : "").append(best);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['The bits are scanned from the lowest with a position counter; the position of the previous 1-bit is remembered, and the distance to it is used to update the maximum whenever another 1-bit is found.'], complexity: 'Time O(q * 60), space O(1) extra.' },
    solve(input) {
      return bigList(input).map((x) => { const s = x.toString(2); const ones = []; for (let i = 0; i < s.length; i++) if (s[i] === '1') ones.push(i); let best = 0; for (let i = 1; i < ones.length; i++) best = Math.max(best, ones[i] - ones[i - 1]); return best; }).join(' ');
    },
    tests() {
      const g = rng(3028); const out = ['4\n22 5 6 8\n', '1\n1\n', '1\n1000000000000000000\n', '1\n576460752303423489\n'];
      const brute = (input) => bigList(input).map((x) => { const pos = []; for (let b = 0n; b < 62n; b++) if ((x >> b) & 1n) pos.push(Number(b)); let best = 0; for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) if (j === i + 1) best = Math.max(best, pos[j] - pos[i]); return best; }).join(' ');
      crossCheck(() => listText(many(randInt(g, 1, 6), () => ONE_TO_LIMIT(g))), (i) => this.solve(i), brute, 400);
      for (const n of [10, 100, 1000, 30000]) out.push(listText(many(n, () => ONE_TO_LIMIT(g))));
      out.push(listText(varied(g, 30000)), listText(many(30000, (i) => BigInt(i + 1))), listText(many(30000, (i) => (1n << BigInt(i % 59)) | 1n)), listText(many(30000, (i) => LIMIT - BigInt(i))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: QUERY_INPUT,
    constraints: ['1 <= q <= 30000', '1 <= each number <= 10^18'],
    slug: 'do-the-bits-alternate',
    title: 'Do the Bits of the Number Alternate?',
    tags: ['bits', 'xor', 'patterns'],
    concept: {
      title: 'XOR the number with itself shifted by one: alternating bits turn into all ones',
      body: [
        'Does the binary representation of a number consist of bits that **alternate** between 0 and 1, so that no two neighbouring bits are equal? For `5 = 101` yes, for `10 = 1010` yes, for `7 = 111` no, for `11 = 1011` no. The number `1` (a single bit) alternates trivially.',
        'Compare every bit with its neighbour at the same time. The number `x >> 1` is `x` shifted one place to the right: its bit at the position `i` is the bit of `x` at the position `i + 1`. So the bit `i` of `x ^ (x >> 1)` is 1 exactly when the two **neighbouring bits** `i` and `i + 1` of `x` are **different**. If all neighbours are different, `y = x ^ (x >> 1)` is a number whose bits are **all 1**, like `111...1`. A number is all ones exactly when `y & (y + 1) == 0` (adding 1 to `111` gives `1000`, and `111 & 1000 = 0`).',
        { code: 'for x in numbers:\n    y = x ^ (x >> 1)             # 1 where neighbouring bits differ\n    answer.append("yes" if y & (y + 1) == 0 else "no")\nprint(*answer)' },
        'For `x = 5 = 101`: `y = 101 ^ 010 = 111`, all ones: yes. For `x = 7 = 111`: `y = 111 ^ 011 = 100`, and `100 & 101 = 100`, not zero: no. The highest bit of `y` always equals the highest bit of `x` (it has no neighbour above), which is why the leading ones are handled correctly. The test takes O(1) per number.'
      ]
    },
    statement: ['For each of the `q` given numbers print `yes` if the bits of its binary representation (without leading zeros) alternate, so that no two neighbouring bits are equal, and `no` otherwise.'],
    outputFormat: ['Print `q` words (`yes` or `no`) on one line, separated by spaces.'],
    examples: [{ input: '4\n5 7 11 10\n', note: '101 and 1010 alternate; 111 and 1011 do not: yes no no yes.' }],
    hints: ['x ^ (x >> 1) has a 1 where two neighbouring bits of x differ.', 'The bits alternate if this number is all ones.', 'A number y is all ones when y & (y + 1) == 0.'],
    program: {
      io: ['q:int', 'ns:int[q]'],
      fast: true,
      python: r`
        answer = []
        for x in ns:
            y = x ^ (x >> 1)
            answer.append("yes" if y & (y + 1) == 0 else "no")
        print(*answer)`,
      cpp: r`
        for (long long i = 0; i < q; i++) {
            long long x = ns[i];
            long long y = x ^ (x >> 1);
            cout << (i ? " " : "") << (((y & (y + 1)) == 0) ? "yes" : "no");
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long x = ns[i];
            long y = x ^ (x >> 1);
            out.append(i > 0 ? " " : "").append(((y & (y + 1)) == 0) ? "yes" : "no");
        }
        System.out.println(out);`
    },
    solution: { explanation: ['x ^ (x >> 1) has a 1 exactly where two neighbouring bits of x differ, so the bits alternate when this value is all ones, which is tested with y & (y + 1) == 0.'], complexity: 'Time O(q), space O(1) extra.' },
    solve(input) {
      return bigList(input).map((x) => { const s = x.toString(2); for (let i = 1; i < s.length; i++) if (s[i] === s[i - 1]) return 'no'; return 'yes'; }).join(' ');
    },
    tests() {
      const g = rng(3029); const out = ['4\n5 7 11 10\n', '1\n1\n', '1\n2\n', '1\n3\n'];
      const brute = (input) => bigList(input).map((x) => { let y = x; let prev = y & 1n; y >>= 1n; while (y > 0n) { const bit = y & 1n; if (bit === prev) return 'no'; prev = bit; y >>= 1n; } return 'yes'; }).join(' ');
      const alt = (bits, startOne) => { let s = ''; for (let i = 0; i < bits; i++) s += (i % 2 === 0) === startOne ? '1' : '0'; return BigInt('0b' + (s[0] === '0' ? '1' + s.slice(1) : s)); };
      crossCheck(() => listText(many(randInt(g, 1, 8), () => (g() < 0.4 ? alt(randInt(g, 1, 20), true) : ONE_TO_LIMIT(g) % 1000n + 1n))), (i) => this.solve(i), brute, 400);
      const mixed = (n) => many(n, (i) => { const x = i % 3 === 0 ? alt(randInt(g, 1, 59), true) : i % 3 === 1 ? alt(randInt(g, 2, 59), true) ^ (1n << BigInt(randInt(g, 0, 1))) : ONE_TO_LIMIT(g); return x === 0n ? 1n : x > LIMIT ? 1n : x; });
      for (const n of [10, 100, 1000, 30000]) out.push(listText(mixed(n)));
      out.push(listText(many(30000, (i) => alt(1 + (i % 59), true))), listText(many(30000, (i) => BigInt(i + 1))), listText(varied(g, 30000)));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: QUERY_INPUT,
    constraints: ['1 <= q <= 30000', '0 <= each number < 2^32'],
    slug: 'swap-neighbouring-bit-pairs',
    title: 'Swap the Bits at Even and Odd Positions',
    tags: ['bits', 'masks', 'shifts'],
    concept: {
      title: 'Select the even-position bits and the odd-position bits with masks, shift them past each other, and combine',
      body: [
        'Number the 32 bit positions of a number from 0 at the right. Swap the bit at the position 0 with the bit at the position 1, the bit at 2 with the bit at 3, and so on: all the bits at **even** positions move one place to the **left**, and all the bits at **odd** positions move one place to the **right**. For `1 = ...0001` the result is `2 = ...0010`; for `10 = 1010` it is `5 = 0101`; for `2 = 10` it is `1`.',
        'A *mask* selects some bits and clears the others when combined with AND. The mask `0x55555555` is `0101...0101` in binary: it has a 1 at every **even** position. The mask `0xAAAAAAAA` is `1010...1010`: it has a 1 at every **odd** position. Take the even bits `x & 0x55555555` and shift them left by one, so that they land on the odd positions; take the odd bits `x & 0xAAAAAAAA` and shift them right by one, so that they land on the even positions. The two results do not overlap, and combining them with OR gives the answer.',
        { code: 'for x in numbers:\n    even = (x & 0x55555555) << 1\n    odd = (x & 0xAAAAAAAA) >> 1\n    answer.append(even | odd)\nprint(*answer)' },
        'In hexadecimal each digit `5` is `0101` and each digit `A` is `1010`, which is why the masks are so short to write. Four operations per number give O(1) time; the answer is a 32-bit number, and in C++ and Java a 64-bit type is used so that the highest bit does not turn the value negative.'
      ]
    },
    statement: ['For each of the `q` given numbers (each smaller than 2^32), regard it as 32 bits and swap every bit at an even position (0, 2, 4, ...) with the bit just to its left (at the position one higher). Print the resulting numbers.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '3\n1 2 10\n', note: '1 becomes 2, 2 becomes 1, and 1010 becomes 0101 = 5.' }],
    hints: ['0x55555555 has ones at the even positions and 0xAAAAAAAA at the odd positions.', 'Shift the even bits left by one and the odd bits right by one.', 'Combine the two parts with OR; use 64-bit integers.'],
    program: {
      io: ['q:int', 'ns:int[q]'],
      fast: true,
      python: r`
        answer = []
        for x in ns:
            even = (x & 0x55555555) << 1
            odd = (x & 0xAAAAAAAA) >> 1
            answer.append(even | odd)
        print(*answer)`,
      cpp: r`
        for (long long i = 0; i < q; i++) {
            long long x = ns[i];
            long long even = (x & 0x55555555LL) << 1;
            long long odd = (x & 0xAAAAAAAALL) >> 1;
            cout << (i ? " " : "") << (even | odd);
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            long x = ns[i];
            long even = (x & 0x55555555L) << 1;
            long odd = (x & 0xAAAAAAAAL) >> 1;
            out.append(i > 0 ? " " : "").append(even | odd);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['The bits at even positions are selected with the mask 0x55555555 and shifted left by one, the bits at odd positions are selected with 0xAAAAAAAA and shifted right by one, and the two parts are combined with OR.'], complexity: 'Time O(q), space O(1) extra.' },
    solve(input) {
      return bigList(input).map((x) => { const bits = x.toString(2).padStart(32, '0').split('').reverse(); for (let i = 0; i < 32; i += 2) { const t = bits[i]; bits[i] = bits[i + 1]; bits[i + 1] = t; } return BigInt('0b' + bits.reverse().join('')); }).join(' ');
    },
    tests() {
      const g = rng(3030); const out = ['3\n1 2 10\n', '1\n0\n', '1\n4294967295\n', '1\n2863311530\n'];
      const brute = (input) => bigList(input).map((x) => { let res = 0n; for (let b = 0n; b < 32n; b++) if ((x >> b) & 1n) res |= 1n << (b ^ 1n); return res; }).join(' ');
      const below = () => randBelow(g, 1n << 32n);
      crossCheck(() => listText(many(randInt(g, 1, 6), below)), (i) => this.solve(i), brute, 400);
      for (const n of [10, 100, 1000, 30000]) out.push(listText(many(n, below)));
      out.push(listText(many(30000, (i) => BigInt(i))), listText(many(30000, (i) => (1n << 32n) - 1n - BigInt(i))), listText(many(30000, (i) => 1n << BigInt(i % 32))), listText(many(30000, (i) => (i % 2 ? 0x55555555n : 0xAAAAAAAAn) ^ BigInt(i))));
      return out;
    }
  }
];
