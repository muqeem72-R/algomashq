import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const easy = { difficulty: 'easy' };
const pairsText = (ps) => `${ps.length}\n${ps.map((p) => p.join(' ')).join('\n')}\n`;
const readPairs = (rs, from, count) => many(count, (i) => nums(rs[from + i]));
// random ranges [s, e] with s < e (or s <= e when `closed`) inside 0..maxT
const randomRanges = (g, n, maxT, maxLen, closed = false) => many(n, () => { const s = randInt(g, 0, maxT - 1); const e = Math.min(maxT, s + randInt(g, closed ? 0 : 1, maxLen)); return [s, e]; });
// sorted disjoint ranges: cut points chosen at random, every second piece kept
const disjointRanges = (g, n, maxT, closed) => { const need = closed ? 2 * n : 2 * n; const cuts = new Set(); while (cuts.size < need) cuts.add(randInt(g, 0, maxT)); const c = [...cuts].sort((x, y) => x - y); return many(n, (i) => [c[2 * i], c[2 * i + 1]]); };

export default [
  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of meetings.', 'Each of the next `n` lines has two numbers `start` and `end`: the meeting takes the time from `start` up to (but not including) `end`.'],
    constraints: ['1 <= n <= 30000', '0 <= start < end <= 10^9'],
    slug: 'do-the-meetings-clash',
    title: 'Can One Person Attend All the Meetings?',
    tags: ['intervals', 'sorting', 'overlap'],
    concept: {
      title: 'Sort the meetings by their start: only neighbours in this order can clash',
      body: [
        'A person has `n` meetings; the meeting `i` lasts from `start` until `end`, and the person cannot be in two meetings at the same time. A meeting that ends at the moment 10 and one that starts at the moment 10 do **not** clash (the time is a half-open range: it includes the start and excludes the end). Can the person attend all the meetings? For `(0, 30) (5, 10) (15, 20)` no: the meeting `(0, 30)` covers the other two. For `(7, 10) (2, 4)` yes.',
        'Comparing every pair is O(n^2). Instead **sort the meetings by the start time**. If two meetings clash, then the meeting that starts first is still running when the second starts; and if some pair clashes, then a pair of **neighbours** in the sorted order clashes too (the meeting with the latest end so far reaches the next start, and the neighbour is a clash by itself or an earlier one already is). So scan the sorted list and compare each start with the **end of the previous meeting**: if `start < previous end`, there is a clash.',
        { code: 'meetings.sort()                         # by the start time\nprev_end = 0\nok = True\nfor start, end in meetings:\n    if start < prev_end:                # this meeting starts before the previous one ends\n        ok = False\n        break\n    prev_end = end\nprint("yes" if ok else "no")' },
        'Sorting costs O(n log n) and the scan O(n). Because the scan stops at the first clash, and each meeting only has to be compared with the previous one, no pair is ever compared twice. "Sort by start, then walk with the latest end" is the pattern for almost every interval problem in this part.'
      ]
    },
    statement: ['A person has `n` meetings; the meeting `i` takes the time from `start[i]` up to, but not including, `end[i]`. A person can attend a set of meetings only if no two of them overlap in time (a meeting may start exactly when another one ends). Print `yes` if the person can attend all the meetings, otherwise `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '3\n0 30\n5 10\n15 20\n', note: 'The first meeting lasts from 0 to 30 and clashes with the others: no.' }, { input: '2\n7 10\n2 4\n', note: 'The meetings do not overlap: yes.' }],
    hints: ['Sort the meetings by their start time.', 'Compare the start of each meeting with the end of the previous one in the sorted order.', 'A start equal to the previous end is allowed.'],
    program: {
      io: ['n:int', 'meetings:int[n][2]'],
      fast: true,
      python: r`
        meetings.sort()
        prev_end = 0
        ok = True
        for start, end in meetings:
            if start < prev_end:
                ok = False
                break
            prev_end = end
        print("yes" if ok else "no")`,
      cpp: r`
        sort(meetings.begin(), meetings.end());
        long long prevEnd = 0;
        bool ok = true;
        for (const vector<long long>& m : meetings) {
            if (m[0] < prevEnd) { ok = false; break; }
            prevEnd = m[1];
        }
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        long[] keys = new long[(int) n];
        for (int i = 0; i < n; i++) keys[i] = meetings[i][0] * 65536L + i;
        Arrays.sort(keys);
        long prevEnd = 0;
        boolean ok = true;
        for (int t = 0; t < n; t++) {
            int i = (int) (keys[t] % 65536L);
            if (meetings[i][0] < prevEnd) { ok = false; break; }
            prevEnd = meetings[i][1];
        }
        System.out.println(ok ? "yes" : "no");`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The meetings are sorted by their start; scanning them in this order, a clash exists exactly when some meeting starts before the end of the previous one. The answer is yes if the scan finds no such meeting.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const ps = readPairs(rs, 1, n); // a sweep over the events: at most one meeting may be running at any moment
      const ev = []; for (const [s, e] of ps) { ev.push([s, 1], [e, -1]); } ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]); let running = 0; for (const [, d] of ev) { running += d; if (running > 1) return 'no'; } return 'yes';
    },
    tests() {
      const g = rng(3011); const out = ['3\n0 30\n5 10\n15 20\n', '2\n7 10\n2 4\n', '1\n0 1\n', '2\n0 5\n5 9\n', '2\n0 5\n4 9\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const ps = readPairs(rs, 1, n); for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.max(ps[i][0], ps[j][0]) < Math.min(ps[i][1], ps[j][1])) return 'no'; return 'yes'; };
      crossCheck(() => pairsText(randomRanges(g, randInt(g, 1, 6), 30, 6)), (i) => this.solve(i), brute, 600);
      const clean = (n, maxT) => { const c = new Set(); while (c.size < n + 1) c.add(randInt(g, 0, maxT)); const cuts = [...c].sort((x, y) => x - y); return shuffle(g, many(n, (i) => [cuts[i], cuts[i + 1]])); };
      for (const n of [10, 100, 1000, 30000, 30000]) { out.push(pairsText(clean(n, 1000000000))); const bad = clean(n, 1000000000); const k = randInt(g, 0, n - 2); const sorted = bad.slice().sort((x, y) => x[0] - y[0]); sorted[k][1] = sorted[k + 1][0] + 1; out.push(pairsText(shuffle(g, sorted))); }
      out.push(pairsText(many(30000, (i) => [i, i + 1])), pairsText(many(30000, (i) => [i, i + 2])), pairsText(shuffle(g, many(30000, (i) => [i * 20000, i * 20000 + 19999]))), pairsText([[0, 1000000000], ...many(29999, (i) => [i + 1, i + 2])]));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of ranges.', 'Each of the next `n` lines has two numbers `start` and `end`: a range on a line, from the point `start` to the point `end`.'],
    constraints: ['1 <= n <= 30000', '0 <= start < end <= 10^9'],
    slug: 'total-length-covered',
    title: 'How Much of the Line Is Covered by the Ranges?',
    tags: ['intervals', 'merging', 'sorting'],
    concept: {
      title: 'Merge the ranges that overlap or touch, and add up the lengths of the merged pieces',
      body: [
        'Several ranges are drawn on a line; the range `(start, end)` covers everything from `start` to `end` and has the length `end - start`. Ranges may **overlap**, so adding the lengths of all ranges would count some parts several times. What is the **total length of the line that is covered by at least one range**? For `(1, 3) (2, 6) (8, 10) (15, 18)` the covered parts are `(1, 6)`, `(8, 10)`, `(15, 18)`: 5 + 2 + 3 = 10.',
        'Sort the ranges by the start. Walk through them and keep the current merged piece `(cur_start, cur_end)`. The next range `(s, e)` **belongs to the piece** if it starts at or before the current end, `s <= cur_end`: the piece then grows to `max(cur_end, e)`. Otherwise the piece is finished: add its length `cur_end - cur_start` to the total and start a new piece with `(s, e)`. Do not forget to add the last piece at the end. Touching ranges such as `(1, 4)` and `(4, 5)` merge into `(1, 5)`; it does not change the total length.',
        { code: 'ranges.sort()\ntotal = 0\ncur_start, cur_end = ranges[0]\nfor s, e in ranges[1:]:\n    if s <= cur_end:\n        cur_end = max(cur_end, e)          # the same piece grows\n    else:\n        total += cur_end - cur_start       # the piece is finished\n        cur_start, cur_end = s, e\ntotal += cur_end - cur_start\nprint(total)' },
        'A range can be completely inside the current piece (then `max` keeps the end unchanged). Sorting costs O(n log n), the scan O(n). This is the classic *merge intervals* routine; the next problems use it as a building block.'
      ]
    },
    statement: ['`n` ranges on a line are given; the range `(start, end)` covers all points from `start` to `end`. Print the total length of the part of the line that is covered by at least one range.'],
    outputFormat: ['Print the total covered length.'],
    examples: [{ input: '4\n1 3\n2 6\n8 10\n15 18\n', note: 'The covered parts are 1 to 6, 8 to 10 and 15 to 18: 5 + 2 + 3 = 10.' }, { input: '2\n1 4\n4 5\n', note: 'The ranges touch: 3 + 1 = 4.' }],
    hints: ['Sort the ranges by their start.', 'Keep one current merged piece; a range that starts at or before its end extends it.', 'Add the length of every finished piece, and the last piece too.'],
    program: {
      io: ['n:int', 'ranges:int[n][2]'],
      fast: true,
      python: r`
        ranges.sort()
        total = 0
        cur_start, cur_end = ranges[0]
        for i in range(1, n):
            s, e = ranges[i]
            if s <= cur_end:
                if e > cur_end:
                    cur_end = e
            else:
                total += cur_end - cur_start
                cur_start, cur_end = s, e
        total += cur_end - cur_start
        print(total)`,
      cpp: r`
        sort(ranges.begin(), ranges.end());
        long long total = 0, curStart = ranges[0][0], curEnd = ranges[0][1];
        for (long long i = 1; i < n; i++) {
            long long s = ranges[i][0], e = ranges[i][1];
            if (s <= curEnd) {
                curEnd = max(curEnd, e);
            } else {
                total += curEnd - curStart;
                curStart = s;
                curEnd = e;
            }
        }
        total += curEnd - curStart;
        cout << total << "\n";`,
      java: r`
        long[] keys = new long[(int) n];
        for (int i = 0; i < n; i++) keys[i] = ranges[i][0] * 65536L + i;
        Arrays.sort(keys);
        int first = (int) (keys[0] % 65536L);
        long total = 0, curStart = ranges[first][0], curEnd = ranges[first][1];
        for (int t = 1; t < n; t++) {
            int i = (int) (keys[t] % 65536L);
            long s = ranges[i][0], e = ranges[i][1];
            if (s <= curEnd) {
                curEnd = Math.max(curEnd, e);
            } else {
                total += curEnd - curStart;
                curStart = s;
                curEnd = e;
            }
        }
        total += curEnd - curStart;
        System.out.println(total);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The ranges are sorted by their start and merged: a range starting at or before the current end extends the current piece, otherwise the piece is finished and its length is added. The sum of the lengths of the merged pieces is the covered length.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const ps = readPairs(rs, 1, n); // a sweep over the events: the length where at least one range is open
      const ev = []; for (const [s, e] of ps) ev.push([s, 1], [e, -1]); ev.sort((a, b) => a[0] - b[0]); let open = 0, last = 0, total = 0; for (const [x, d] of ev) { if (open > 0) total += x - last; open += d; last = x; } return String(total);
    },
    tests() {
      const g = rng(3012); const out = ['4\n1 3\n2 6\n8 10\n15 18\n', '2\n1 4\n4 5\n', '1\n0 1000000000\n', '3\n1 10\n2 3\n4 5\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const ps = readPairs(rs, 1, n); const cell = new Set(); for (const [s, e] of ps) for (let x = s; x < e; x++) cell.add(x); return String(cell.size); };
      crossCheck(() => pairsText(randomRanges(g, randInt(g, 1, 7), 40, 12)), (i) => this.solve(i), brute, 500);
      for (const [n, maxT, maxLen] of [[10, 100, 20], [100, 1000, 50], [1000, 1000000, 5000], [25000, 1000000000, 1000], [25000, 1000000000, 100000], [25000, 1000000000, 100000000], [25000, 1000, 10], [24999, 1000000000, 20000]]) out.push(pairsText(randomRanges(g, n, maxT, maxLen)));
      out.push(pairsText(many(25000, (i) => [0, 1000000000 - i])), pairsText(many(25000, (i) => [i * 20000, i * 20000 + 20000])), pairsText(many(25000, (i) => [i * 20000, i * 20000 + 19999])), pairsText(shuffle(g, many(25000, (i) => [i * 2, i * 2 + 3]))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of ranges.', 'Each of the next `n` lines has two numbers `start` and `end`: a closed range that contains all the numbers from `start` to `end`, both included.'],
    constraints: ['1 <= n <= 25000', '0 <= start <= end <= 10^9'],
    slug: 'overlapping-pairs-of-ranges',
    title: 'How Many Pairs of Ranges Overlap?',
    tags: ['intervals', 'counting', 'sorting', 'two-pointers'],
    concept: {
      title: 'Count the pairs that do NOT overlap: for each range, how many ranges end before it starts?',
      body: [
        'Two closed ranges `(s1, e1)` and `(s2, e2)` **overlap** if they share at least one number, that is, if `max(s1, s2) <= min(e1, e2)`. Given `n` ranges, how many pairs of ranges overlap? For `(1, 3) (2, 4) (5, 6)` only the first two overlap: 1. For `(1, 5) (2, 3) (4, 6)` the answer is 2. Checking all pairs is O(n^2), which is too slow for 50 000 ranges (1.25 billion pairs).',
        'It is easier to count the pairs that are **disjoint** (do not share a number). Two disjoint ranges can be put in order: one of them ends **before the other starts**, `e_i < s_j`. For each range `j` count the ranges `i` that end before `s_j`; each disjoint pair is counted exactly once (the earlier range is `i`). The overlapping pairs are all pairs, `n * (n - 1) / 2`, minus the disjoint ones. To count quickly: sort all the **starts** and, separately, all the **ends**; for the starts in increasing order, a pointer on the sorted ends moves forward while `end < start`, and its position is the number of ranges that end before this start.',
        { code: 'starts = sorted(s for s, e in ranges)\nends = sorted(e for s, e in ranges)\ndisjoint = 0\np = 0\nfor s in starts:\n    while p < n and ends[p] < s:\n        p += 1\n    disjoint += p                    # the ranges that end before this start\nprint(n * (n - 1) // 2 - disjoint)' },
        'A range never ends before its own start (`e >= s`), so it is not counted against itself. The two sorted lists and a moving pointer give O(n log n) for the sorting and O(n) for the count. The result can be as large as 1.25 billion, which does not fit in a 32-bit integer.'
      ]
    },
    statement: ['`n` closed ranges are given; the range `(start, end)` contains all integers from `start` to `end`. Two ranges overlap if they have at least one integer in common. Print the number of pairs of ranges (unordered pairs of different ranges) that overlap.'],
    outputFormat: ['Print the number of overlapping pairs.'],
    examples: [{ input: '3\n1 3\n2 4\n5 6\n', note: 'Only (1, 3) and (2, 4) overlap: 1.' }, { input: '3\n1 5\n2 3\n4 6\n', note: '(1, 5) overlaps both others; (2, 3) and (4, 6) are apart: 2.' }],
    hints: ['Count the disjoint pairs instead: one range ends before the other starts.', 'Sort the starts and the ends separately and use a pointer on the ends.', 'Answer = n * (n - 1) / 2 minus the number of disjoint pairs; use 64-bit numbers.'],
    program: {
      io: ['n:int', 'ranges:int[n][2]'],
      fast: true,
      python: r`
        starts = sorted(r[0] for r in ranges)
        ends = sorted(r[1] for r in ranges)
        disjoint = 0
        p = 0
        for s in starts:
            while p < n and ends[p] < s:
                p += 1
            disjoint += p
        print(n * (n - 1) // 2 - disjoint)`,
      cpp: r`
        vector<long long> starts, ends;
        for (const vector<long long>& r0 : ranges) { starts.push_back(r0[0]); ends.push_back(r0[1]); }
        sort(starts.begin(), starts.end());
        sort(ends.begin(), ends.end());
        long long disjoint = 0, p = 0;
        for (long long s : starts) {
            while (p < n && ends[p] < s) p++;
            disjoint += p;
        }
        cout << n * (n - 1) / 2 - disjoint << "\n";`,
      java: r`
        long[] starts = new long[(int) n];
        long[] ends = new long[(int) n];
        for (int i = 0; i < n; i++) { starts[i] = ranges[i][0]; ends[i] = ranges[i][1]; }
        Arrays.sort(starts);
        Arrays.sort(ends);
        long disjoint = 0;
        int p = 0;
        for (int i = 0; i < n; i++) {
            while (p < n && ends[p] < starts[i]) p++;
            disjoint += p;
        }
        System.out.println(n * (n - 1) / 2 - disjoint);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The disjoint pairs are counted: for each start in increasing order a pointer on the sorted ends counts the ranges that end before it. The overlapping pairs are all n * (n - 1) / 2 pairs minus the disjoint ones.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const ps = readPairs(rs, 1, n); const ends = ps.map((p) => p[1]).sort((a, b) => a - b); // for each range count the ranges that end before it starts by a binary search
      const lower = (x) => { let lo = 0, hi = n; while (lo < hi) { const mid = (lo + hi) >> 1; if (ends[mid] < x) lo = mid + 1; else hi = mid; } return lo; }; let disjoint = 0; for (const [s] of ps) disjoint += lower(s); return String(n * (n - 1) / 2 - disjoint);
    },
    tests() {
      const g = rng(3013); const out = ['3\n1 3\n2 4\n5 6\n', '3\n1 5\n2 3\n4 6\n', '1\n0 0\n', '2\n0 0\n0 0\n', '2\n0 1\n2 3\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const ps = readPairs(rs, 1, n); let c = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.max(ps[i][0], ps[j][0]) <= Math.min(ps[i][1], ps[j][1])) c++; return String(c); };
      crossCheck(() => pairsText(randomRanges(g, randInt(g, 1, 9), 25, 8, true)), (i) => this.solve(i), brute, 600);
      for (const [n, maxT, maxLen] of [[10, 100, 20], [100, 1000, 50], [1000, 1000000, 5000], [30000, 1000000000, 1000], [30000, 1000000000, 100000000], [30000, 1000, 10], [29999, 1000000000, 1000000000]]) out.push(pairsText(randomRanges(g, n, maxT, maxLen, true)));
      out.push(pairsText(many(30000, () => [0, 1000000000])), pairsText(many(30000, (i) => [i * 2, i * 2])), pairsText(many(30000, (i) => [i, i + 1])), pairsText(shuffle(g, many(30000, (i) => [i * 20000, i * 20000 + 25000]))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`, `lo` and `hi`: the number of values and the ends of the range of interest.', 'The second line has `n` increasing numbers, all between `lo` and `hi`.'],
    constraints: ['1 <= n <= 30000', '0 <= lo <= each number <= hi <= 10^9', 'The numbers are different and given in increasing order.'],
    slug: 'missing-ranges',
    title: 'List the Numbers That Are Missing From a Sorted List',
    tags: ['intervals', 'gaps', 'scan'],
    concept: {
      title: 'Look at the gap between every two neighbours (and between the ends of the range and the list)',
      body: [
        'All the whole numbers from `lo` to `hi` belong to a segment, and a sorted list contains some of them. Write the numbers that are **missing** as the shortest possible list of ranges: a single missing number is written `x`, and a run of missing numbers is written `x->y`. For `lo = 0`, `hi = 99` and the list `2 4 5 50 75` the missing parts are `0->1`, `3`, `6->49`, `51->74`, `76->99`.',
        'Imagine two extra numbers: `lo - 1` before the list and `hi + 1` after it. Walk through the list and look at each pair of **neighbours** `prev` and `x` (starting with `prev = lo - 1`, finishing with `x = hi + 1`). If `x - prev >= 2`, the numbers `prev + 1 .. x - 1` are missing and form exactly one range; if `x - prev = 1`, nothing is missing between them. The ranges come out in increasing order.',
        { code: 'prev = lo - 1\nout = []\nfor x in a + [hi + 1]:\n    if x - prev >= 2:\n        s, e = prev + 1, x - 1\n        out.append(str(s) if s == e else f"{s}->{e}")\n    prev = x\nprint(len(out))                     # the number of ranges, then one range per line\nfor item in out: print(item)' },
        'The two sentinel values lo - 1 and hi + 1 make the first and the last gap look like all the others, so no special cases are needed. The time is O(n). The output is the number of missing ranges followed by the ranges, one per line (if nothing is missing, the output is just `0`).'
      ]
    },
    statement: ['All integers from `lo` to `hi` are considered, and a sorted list of different numbers from this segment is given. Print the integers of the segment that are not in the list, as ranges: first the number of ranges, then each range on its own line, in increasing order. A single number `x` is written as `x`, and a run from `x` to `y` (with `x < y`) is written as `x->y`.'],
    outputFormat: ['Print the number of missing ranges, then the ranges, one per line.'],
    examples: [{ input: '5 0 99\n2 4 5 50 75\n', note: 'The missing numbers are 0 to 1, 3, 6 to 49, 51 to 74 and 76 to 99.' }, { input: '3 1 3\n1 2 3\n', note: 'Nothing is missing: 0.' }],
    hints: ['Add the values lo - 1 and hi + 1 at the two ends of the list.', 'If two neighbours differ by more than 1, the numbers between them are one missing range.', 'Write a range of one number without the arrow.'],
    program: {
      io: ['n:int lo:int hi:int', 'a:int[n]'],
      fast: true,
      python: r`
        prev = lo - 1
        out = []
        for x in a + [hi + 1]:
            if x - prev >= 2:
                s, e = prev + 1, x - 1
                out.append(str(s) if s == e else str(s) + "->" + str(e))
            prev = x
        print("\n".join([str(len(out))] + out))`,
      cpp: r`
        vector<string> out;
        long long prev = lo - 1;
        for (long long i = 0; i <= n; i++) {
            long long x = i < n ? a[i] : hi + 1;
            if (x - prev >= 2) {
                long long s = prev + 1, e = x - 1;
                out.push_back(s == e ? to_string(s) : to_string(s) + "->" + to_string(e));
            }
            prev = x;
        }
        cout << out.size() << "\n";
        for (const string& item : out) cout << item << "\n";`,
      java: r`
        StringBuilder items = new StringBuilder();
        int count = 0;
        long prev = lo - 1;
        for (int i = 0; i <= n; i++) {
            long x = i < n ? a[i] : hi + 1;
            if (x - prev >= 2) {
                long s = prev + 1, e = x - 1;
                items.append(s == e ? String.valueOf(s) : s + "->" + e).append("\n");
                count++;
            }
            prev = x;
        }
        System.out.print(count + "\n" + items);`
    },
    solution: { explanation: ['With the sentinels lo - 1 and hi + 1 added at the ends, every pair of neighbours that differ by 2 or more gives one missing range from prev + 1 to x - 1, written with an arrow unless it is a single number.'], complexity: 'Time O(n), space O(n) for the output.' },
    solve(input) {
      const rs = rows(input); const [n, lo, hi] = nums(rs[0]); const a = nums(rs[1]); const out = []; // the gaps between the neighbours, written with the list b = [lo - 1, ...a, hi + 1]
      const b = [lo - 1, ...a, hi + 1]; for (let i = 1; i < b.length; i++) if (b[i] - b[i - 1] >= 2) { const s = b[i - 1] + 1, e = b[i] - 1; out.push(s === e ? String(s) : `${s}->${e}`); } return [out.length, ...out].join('\n');
    },
    tests() {
      const g = rng(3014); const out = ['5 0 99\n2 4 5 50 75\n', '3 1 3\n1 2 3\n', '1 5 5\n5\n', '1 0 10\n0\n', '1 0 10\n10\n', '1 0 10\n5\n'];
      const make = (n, lo, hi) => { const set = new Set(); while (set.size < Math.min(n, hi - lo + 1)) set.add(randInt(g, lo, hi)); const a = [...set].sort((x, y) => x - y); return `${a.length} ${lo} ${hi}\n${a.join(' ')}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, lo, hi] = nums(rs[0]); const present = new Set(nums(rs[1])); const out2 = []; let x = lo; while (x <= hi) { if (present.has(x)) { x++; continue; } let y = x; while (y + 1 <= hi && !present.has(y + 1)) y++; out2.push(x === y ? `${x}` : `${x}->${y}`); x = y + 1; } return [out2.length, ...out2].join('\n'); };
      crossCheck(() => { const lo = randInt(g, 0, 5); return make(randInt(g, 1, 8), lo, lo + randInt(g, 0, 20)); }, (i) => this.solve(i), brute, 500);
      for (const [n, lo, hi] of [[10, 0, 100], [100, 0, 1000], [1000, 5, 100000], [30000, 0, 1000000000], [30000, 0, 60000], [30000, 1000, 50999], [29999, 0, 100000], [30000, 123456789, 987654321]]) out.push(make(n, lo, hi));
      out.push(`30000 0 100000\n${many(30000, (i) => i * 2).join(' ')}\n`, `30000 0 29999\n${many(30000, (i) => i).join(' ')}\n`, `30000 0 1000000000\n${many(30000, (i) => i * 20000).join(' ')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of values.', 'The second line has `n` increasing numbers.'],
    constraints: ['1 <= n <= 30000', '-10^9 <= each number <= 10^9', 'The numbers are different and given in increasing order.'],
    slug: 'sorted-list-as-ranges',
    title: 'Write a Sorted List of Numbers as Ranges',
    tags: ['intervals', 'scan', 'grouping'],
    concept: {
      title: 'Group the numbers into runs of consecutive values',
      body: [
        'A sorted list of different integers can be written more briefly as **ranges of consecutive numbers**: a run `x, x+1, ..., y` of at least two numbers is written `x->y`, and a lonely number is written `x`. For `0 1 2 4 5 7` the result is `0->2 4->5 7`. For `0 2 3 4 6 8 9` it is `0 2->4 6 8->9`.',
        'Walk through the list with two positions: `i` is the **start of the current run** and `j` moves forward as long as the next number is **exactly one bigger** than the current one. When the run ends, write the run as `a[i]` if `i = j` and as `a[i]->a[j]` otherwise, and continue from `j + 1`. Each number is looked at once.',
        { code: 'out = []\ni = 0\nwhile i < n:\n    j = i\n    while j + 1 < n and a[j + 1] == a[j] + 1:\n        j += 1\n    out.append(str(a[i]) if i == j else f"{a[i]}->{a[j]}")\n    i = j + 1\nprint(" ".join(out))' },
        'The inner loop moves `j` forward and the outer loop then jumps to `j + 1`, so the two loops together touch every element once: O(n) time. This is the opposite of the missing-ranges problem: there the gaps were the answer, here the runs are. Remember that a difference of exactly 1 continues the run, and anything else starts a new one.'
      ]
    },
    statement: ['A sorted list of different integers is given. Write it as a list of ranges: every maximal run of consecutive integers `x, x + 1, ..., y` with `x < y` is written `x->y`, and every number that is not next to another is written alone. Print the ranges in increasing order on one line, separated by spaces.'],
    outputFormat: ['Print the ranges on one line, separated by spaces.'],
    examples: [{ input: '6\n0 1 2 4 5 7\n', note: 'The runs are 0 to 2, 4 to 5 and 7: 0->2 4->5 7.' }, { input: '3\n5 7 9\n', note: 'No two numbers are consecutive: 5 7 9.' }],
    hints: ['Find the end of each run of consecutive numbers with a second index.', 'A run of one number is written without the arrow.', 'Continue after the end of the run.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        out = []
        i = 0
        while i < n:
            j = i
            while j + 1 < n and a[j + 1] == a[j] + 1:
                j += 1
            out.append(str(a[i]) if i == j else str(a[i]) + "->" + str(a[j]))
            i = j + 1
        print(" ".join(out))`,
      cpp: r`
        vector<string> out;
        long long i = 0;
        while (i < n) {
            long long j = i;
            while (j + 1 < n && a[j + 1] == a[j] + 1) j++;
            out.push_back(i == j ? to_string(a[i]) : to_string(a[i]) + "->" + to_string(a[j]));
            i = j + 1;
        }
        for (size_t k = 0; k < out.size(); k++) cout << (k ? " " : "") << out[k];
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        int i = 0;
        while (i < n) {
            int j = i;
            while (j + 1 < n && a[j + 1] == a[j] + 1) j++;
            if (out.length() > 0) out.append(" ");
            out.append(i == j ? String.valueOf(a[i]) : a[i] + "->" + a[j]);
            i = j + 1;
        }
        System.out.println(out);`
    },
    solution: { explanation: ['For each run start i, the end j is moved forward while the next number is exactly one bigger; the run is written as a[i] when it has one number and as a[i]->a[j] otherwise, and the scan continues at j + 1.'], complexity: 'Time O(n), space O(n) for the output.' },
    solve(input) {
      const a = nums(rows(input)[1]); const out = []; // cut the list at the places where the difference is not 1
      let start = 0; for (let i = 1; i <= a.length; i++) { if (i === a.length || a[i] - a[i - 1] !== 1) { out.push(start === i - 1 ? String(a[start]) : `${a[start]}->${a[i - 1]}`); start = i; } } return out.join(' ');
    },
    tests() {
      const g = rng(3015); const out = ['6\n0 1 2 4 5 7\n', '3\n5 7 9\n', '1\n-3\n', '2\n-1 0\n', '4\n1 2 3 4\n'];
      const make = (n, lo, step, pGap) => { const a = [lo]; while (a.length < n) a.push(a[a.length - 1] + (g() < pGap ? randInt(g, 2, step) : 1)); return `${n}\n${a.join(' ')}\n`; };
      const brute = (input) => { const a = nums(rows(input)[1]); const groups = []; for (const x of a) { const last = groups[groups.length - 1]; if (last && last[last.length - 1] + 1 === x) last.push(x); else groups.push([x]); } return groups.map((q) => (q.length === 1 ? `${q[0]}` : `${q[0]}->${q[q.length - 1]}`)).join(' '); };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, -5, 5), 4, 0.4), (i) => this.solve(i), brute, 500);
      for (const [n, lo, step, p] of [[10, 0, 5, 0.3], [100, -50, 5, 0.5], [1000, 0, 3, 0.2], [30000, -1000000000, 10, 0.3], [30000, 0, 10, 0.05], [30000, 0, 10, 0.95], [30000, 0, 10, 0], [30000, -25000, 10, 0.5]]) out.push(make(n, lo, step, p));
      out.push(`30000\n${many(30000, (i) => i * 2).join(' ')}\n`, `30000\n${many(30000, (i) => -1000000000 + i).join(' ')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `m`: the number of ranges in the first list and in the second list.', 'Each of the next `n` lines has two numbers `start` and `end`: a range of the first list.', 'Each of the next `m` lines has two numbers `start` and `end`: a range of the second list.'],
    constraints: ['1 <= n, m <= 30000', '0 <= start < end <= 10^9', 'In each list the ranges are given in increasing order and do not overlap.'],
    slug: 'overlap-of-two-range-lists',
    title: 'How Long Are Two Lists of Ranges Both Open?',
    tags: ['intervals', 'two-pointers', 'intersection'],
    concept: {
      title: 'Two pointers: compare the current ranges of both lists, then advance the one that ends first',
      body: [
        'Two people write down the times in which they are free, each as a list of ranges `[start, end)` that are **sorted** and **do not overlap**. For how much time are **both free**? For `[0, 2) [5, 10) [13, 23) [24, 25)` and `[1, 5) [8, 12) [15, 24) [25, 26)` the common times are `[1, 2)`, `[8, 10)` and `[15, 23)`: 1 + 2 + 8 = 11.',
        'Keep a pointer `i` in the first list and a pointer `j` in the second. The common part of the two current ranges is `[max(start1, start2), min(end1, end2))`; if the start is smaller than the end, it has the length `min(end1, end2) - max(start1, start2)`, which is added to the total. Then **advance the pointer of the range that ends first**: that range cannot overlap anything later in the other list, because the other list continues with ranges that start later than its current range\'s start and the finished range is already over. If both end at the same moment, either can be advanced.',
        { code: 'i = j = 0\ntotal = 0\nwhile i < n and j < m:\n    lo = max(a[i][0], b[j][0])\n    hi = min(a[i][1], b[j][1])\n    if lo < hi:\n        total += hi - lo\n    if a[i][1] < b[j][1]:\n        i += 1\n    else:\n        j += 1\nprint(total)' },
        'Each step advances one pointer, so there are at most `n + m` steps: O(n + m) time with no sorting, because the input is already sorted. The merge-style two-pointer scan is the same as in merging two sorted arrays. The answer can be as large as 10^9, which still fits an ordinary integer, but the sum is kept in 64 bits.'
      ]
    },
    statement: ['Two lists of ranges are given. In each list the ranges are sorted by their start and do not overlap; the range `(start, end)` covers the time from `start` up to, but not including, `end`. Print the total length of the time that is covered by both lists.'],
    outputFormat: ['Print the total length of the common time.'],
    examples: [{ input: '4 4\n0 2\n5 10\n13 23\n24 25\n1 5\n8 12\n15 24\n25 26\n', note: 'The common parts are 1 to 2, 8 to 10 and 15 to 23: 1 + 2 + 8 = 11.' }, { input: '1 1\n0 5\n5 9\n', note: 'The ranges only touch: 0.' }],
    hints: ['The common part of two ranges is from the larger start to the smaller end, if that is a positive length.', 'Keep one pointer in each list.', 'Advance the pointer of the range that ends first.'],
    program: {
      io: ['n:int m:int', 'a:int[n][2]', 'b:int[m][2]'],
      fast: true,
      python: r`
        i = j = 0
        total = 0
        while i < n and j < m:
            lo = max(a[i][0], b[j][0])
            hi = min(a[i][1], b[j][1])
            if lo < hi:
                total += hi - lo
            if a[i][1] < b[j][1]:
                i += 1
            else:
                j += 1
        print(total)`,
      cpp: r`
        long long i = 0, j = 0, total = 0;
        while (i < n && j < m) {
            long long lo = max(a[i][0], b[j][0]);
            long long hi = min(a[i][1], b[j][1]);
            if (lo < hi) total += hi - lo;
            if (a[i][1] < b[j][1]) i++;
            else j++;
        }
        cout << total << "\n";`,
      java: r`
        int i = 0, j = 0;
        long total = 0;
        while (i < n && j < m) {
            long lo = Math.max(a[i][0], b[j][0]);
            long hi = Math.min(a[i][1], b[j][1]);
            if (lo < hi) total += hi - lo;
            if (a[i][1] < b[j][1]) i++;
            else j++;
        }
        System.out.println(total);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Two pointers walk through the lists; the common part of the current ranges is added when it has a positive length, and the pointer of the range that ends first is advanced.'], complexity: 'Time O(n + m), space O(1) extra.' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const a = readPairs(rs, 1, n), b = readPairs(rs, 1 + n, m); // events: the time where both lists are open (two open ranges at once)
      const ev = []; for (const [s, e] of [...a, ...b]) ev.push([s, 1], [e, -1]); ev.sort((x, y) => x[0] - y[0] || x[1] - y[1]); let open = 0, last = 0, total = 0; for (const [x, d] of ev) { if (open === 2) total += x - last; open += d; last = x; } return String(total);
    },
    tests() {
      const g = rng(3016); const out = ['4 4\n0 2\n5 10\n13 23\n24 25\n1 5\n8 12\n15 24\n25 26\n', '1 1\n0 5\n5 9\n', '1 1\n0 10\n3 4\n', '1 1\n0 1000000000\n0 1000000000\n'];
      const make = (n, m, maxT) => `${n} ${m}\n${disjointRanges(g, n, maxT, false).map((p) => p.join(' ')).join('\n')}\n${disjointRanges(g, m, maxT, false).map((p) => p.join(' ')).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); const a = readPairs(rs, 1, n), b = readPairs(rs, 1 + n, m); const inA = new Set(), inB = new Set(); for (const [s, e] of a) for (let x = s; x < e; x++) inA.add(x); for (const [s, e] of b) for (let x = s; x < e; x++) inB.add(x); let c = 0; for (const x of inA) if (inB.has(x)) c++; return String(c); };
      crossCheck(() => make(randInt(g, 1, 5), randInt(g, 1, 5), 60), (i) => this.solve(i), brute, 600);
      for (const [n, m, maxT] of [[10, 10, 100], [100, 80, 1000], [1000, 1000, 100000], [20000, 20000, 1000000000], [20000, 20000, 100000], [20000, 5, 1000000000], [5, 20000, 1000000000], [19999, 20000, 1000000000]]) out.push(make(n, m, maxT));
      out.push(`20000 20000\n${many(20000, (i) => `${i * 10} ${i * 10 + 5}`).join('\n')}\n${many(20000, (i) => `${i * 10 + 5} ${i * 10 + 10}`).join('\n')}\n`, `20000 20000\n${many(20000, (i) => `${i * 10} ${i * 10 + 7}`).join('\n')}\n${many(20000, (i) => `${i * 10 + 3} ${i * 10 + 10}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `q`: the number of ranges and the number of questions.', 'Each of the next `n` lines has two numbers `start` and `end`: a closed range (both ends belong to it). The ranges are given in increasing order and do not overlap.', 'The last line has `q` numbers: the points to look up.'],
    constraints: ['1 <= n, q <= 30000', '0 <= start <= end <= 10^9', '0 <= each point <= 10^9'],
    slug: 'which-range-holds-the-point',
    title: 'Which Range Holds the Point?',
    tags: ['intervals', 'binary-search', 'queries'],
    concept: {
      title: 'Binary search for the last range that starts at or before the point, then check its end',
      body: [
        'A timetable has `n` closed ranges (both the start and the end belong to the range). They are sorted and disjoint. For each query point, which range holds it? Print the **number of the range** (counting from 1) or `0` if no range holds the point. For the ranges `(1, 3) (5, 9) (12, 12)` the points `0 2 4 9 12 13` give `0 1 0 2 3 0`.',
        'Scanning all the ranges for every query is O(n * q), 2.5 billion steps in the worst case. But the ranges are sorted and do not overlap, so only **one** range can hold the point: the **last range whose start is at most the point**. Find it with a **binary search** on the starts, and then check whether the point is also at most the end of this range. If no start is at most the point, or the point is beyond that range\'s end, the answer is 0.',
        { code: 'from bisect import bisect_right\nstarts = [r[0] for r in ranges]\nout = []\nfor p in points:\n    k = bisect_right(starts, p) - 1          # the last start that is <= p\n    if k >= 0 and p <= ranges[k][1]:\n        out.append(k + 1)\n    else:\n        out.append(0)\nprint(*out)' },
        'Each query takes O(log n), so the whole work is O((n + q) log n). The key fact is that the sorted starts split the line into pieces and every point belongs to exactly one candidate range. In C++ the same search is `upper_bound`, and in Java it is written by hand.'
      ]
    },
    statement: ['`n` closed ranges are given in increasing order; they do not overlap. For each of `q` points print the number of the range (counting from 1) that contains it, or 0 if no range contains the point.'],
    outputFormat: ['Print `q` numbers on one line, separated by spaces.'],
    examples: [{ input: '3 6\n1 3\n5 9\n12 12\n0 2 4 9 12 13\n', note: 'The answers are 0, 1, 0, 2, 3, 0.' }],
    hints: ['Only the last range that starts at or before the point can hold it.', 'Find it with a binary search on the starts.', 'Then check that the point is not beyond its end.'],
    program: {
      io: ['n:int q:int', 'ranges:int[n][2]', 'points:int[q]'],
      fast: true,
      helpers: { python: 'from bisect import bisect_right', cpp: '', java: '' },
      python: r`
        starts = [r0[0] for r0 in ranges]
        out = []
        for p in points:
            k = bisect_right(starts, p) - 1
            if k >= 0 and p <= ranges[k][1]:
                out.append(k + 1)
            else:
                out.append(0)
        print(*out)`,
      cpp: r`
        vector<long long> starts;
        for (const vector<long long>& r0 : ranges) starts.push_back(r0[0]);
        for (long long i = 0; i < q; i++) {
            long long p = points[i];
            long long k = (long long)(upper_bound(starts.begin(), starts.end(), p) - starts.begin()) - 1;
            long long answer = (k >= 0 && p <= ranges[k][1]) ? k + 1 : 0;
            cout << (i ? " " : "") << answer;
        }
        cout << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            long p = points[t];
            int lo = 0, hi = (int) n;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (ranges[mid][0] <= p) lo = mid + 1;
                else hi = mid;
            }
            int k = lo - 1;
            long answer = (k >= 0 && p <= ranges[k][1]) ? k + 1 : 0;
            out.append(t > 0 ? " " : "").append(answer);
        }
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['For each point a binary search finds the last range whose start is at most the point; the point is inside that range exactly when it is not beyond its end, and the answer is the number of that range or 0.'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const ranges = readPairs(rs, 1, n); const points = nums(rs[1 + n]); // small cases by a linear scan, large cases by a binary search written on the ends
      return points.map((p) => { if (n <= 300) { for (let k = 0; k < n; k++) if (ranges[k][0] <= p && p <= ranges[k][1]) return k + 1; return 0; } let lo = 0, hi = n - 1, ans = 0; while (lo <= hi) { const mid = (lo + hi) >> 1; if (ranges[mid][1] < p) lo = mid + 1; else if (ranges[mid][0] > p) hi = mid - 1; else { ans = mid + 1; break; } } return ans; }).join(' ');
    },
    tests() {
      const g = rng(3017); const out = ['3 6\n1 3\n5 9\n12 12\n0 2 4 9 12 13\n', '1 3\n5 5\n4 5 6\n', '1 1\n0 1000000000\n1000000000\n'];
      const make = (n, q, maxT) => `${n} ${q}\n${disjointRanges(g, n, maxT, true).map((p) => p.join(' ')).join('\n')}\n${randArray(g, q, 0, maxT).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const ranges = readPairs(rs, 1, n); return nums(rs[1 + n]).map((p) => { for (let k = 0; k < n; k++) if (ranges[k][0] <= p && p <= ranges[k][1]) return k + 1; return 0; }).join(' '); };
      crossCheck(() => make(randInt(g, 1, 5), randInt(g, 1, 8), 40), (i) => this.solve(i), brute, 600);
      for (const [n, q, maxT] of [[10, 20, 100], [100, 200, 1000], [1000, 1000, 100000], [20000, 20000, 1000000000], [20000, 20000, 200000], [20000, 10, 1000000000], [10, 20000, 100], [19999, 20000, 1000000000]]) out.push(make(n, q, maxT));
      out.push(`20000 20000\n${many(20000, (i) => `${i * 3} ${i * 3 + 1}`).join('\n')}\n${many(20000, (i) => i * 3 + (i % 3)).join(' ')}\n`, `20000 20000\n${many(20000, (i) => `${i * 11} ${i * 11 + 10}`).join('\n')}\n${many(20000, (i) => i * 11 + (i % 12)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of meetings.', 'Each of the next `n` lines has two numbers `start` and `end`: the meeting takes the time from `start` up to (but not including) `end`.'],
    constraints: ['1 <= n <= 20000', '0 <= start < end <= 10^9'],
    slug: 'widest-gap-between-meetings',
    title: 'The Longest Free Time Between Two Meetings',
    tags: ['intervals', 'merging', 'gaps'],
    concept: {
      title: 'Merge the meetings, and the free times are the gaps between the merged blocks',
      body: [
        'An office has `n` meetings. Between meetings the room is free. What is the **longest stretch of free time that lies between two meetings** (not before the first or after the last)? For `(1, 3) (2, 6) (8, 10) (15, 18)` the meetings form the blocks `1-6`, `8-10`, `15-18`, so the free stretches are `6-8` (length 2) and `10-15` (length 5): the answer is 5. If all the meetings form one block, the answer is 0.',
        'The meetings may overlap, so the free time is not simply "next start minus this end". Sort the meetings by the start and keep `cur_end`, the **latest end among all the meetings processed so far**. When the next meeting starts after `cur_end`, the time between them is free and has the length `start - cur_end`; remember the largest such gap. Then update `cur_end = max(cur_end, end)`.',
        { code: 'meetings.sort()\ncur_end = meetings[0][1]\nwidest = 0\nfor start, end in meetings[1:]:\n    if start > cur_end:\n        widest = max(widest, start - cur_end)   # a free gap\n    cur_end = max(cur_end, end)\nprint(widest)' },
        'The maximum ends so far is needed because a short meeting inside a long one must not shorten `cur_end`. Touching meetings (the next start equals `cur_end`) leave no gap. Sorting O(n log n) plus one scan O(n). This is the merging routine of the earlier problem, looking at the holes instead of the covered parts.'
      ]
    },
    statement: ['`n` meetings are given; the meeting `i` takes the time from `start[i]` up to, but not including, `end[i]`. Between the earliest start and the latest end there may be moments with no meeting. Print the length of the longest stretch of time without any meeting that lies between two meetings, or 0 if there is no such stretch.'],
    outputFormat: ['Print the length of the longest free stretch.'],
    examples: [{ input: '4\n1 3\n2 6\n8 10\n15 18\n', note: 'The free stretches are 6 to 8 and 10 to 15: the longest has the length 5.' }, { input: '2\n0 5\n5 9\n', note: 'The meetings touch: 0.' }],
    hints: ['Sort the meetings by their start.', 'Keep the latest end of all the meetings seen so far.', 'A meeting that starts after that end leaves a gap of start - latest end.'],
    program: {
      io: ['n:int', 'meetings:int[n][2]'],
      fast: true,
      python: r`
        meetings.sort()
        cur_end = meetings[0][1]
        widest = 0
        for i in range(1, n):
            start, end = meetings[i]
            if start > cur_end and start - cur_end > widest:
                widest = start - cur_end
            if end > cur_end:
                cur_end = end
        print(widest)`,
      cpp: r`
        sort(meetings.begin(), meetings.end());
        long long curEnd = meetings[0][1], widest = 0;
        for (long long i = 1; i < n; i++) {
            if (meetings[i][0] > curEnd) widest = max(widest, meetings[i][0] - curEnd);
            curEnd = max(curEnd, meetings[i][1]);
        }
        cout << widest << "\n";`,
      java: r`
        long[] keys = new long[(int) n];
        for (int i = 0; i < n; i++) keys[i] = meetings[i][0] * 65536L + i;
        Arrays.sort(keys);
        long curEnd = meetings[(int) (keys[0] % 65536L)][1], widest = 0;
        for (int t = 1; t < n; t++) {
            int i = (int) (keys[t] % 65536L);
            if (meetings[i][0] > curEnd) widest = Math.max(widest, meetings[i][0] - curEnd);
            curEnd = Math.max(curEnd, meetings[i][1]);
        }
        System.out.println(widest);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The meetings are sorted by their start; the latest end seen so far is kept, and every meeting that starts after it leaves a free gap of start - latest end. The largest gap is printed (0 if there is none).'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const ps = readPairs(rs, 1, n); // events: gaps are the stretches between two moments where nothing is open, after the first meeting has started
      const ev = []; for (const [s, e] of ps) ev.push([s, 1], [e, -1]); ev.sort((a, b) => a[0] - b[0] || b[1] - a[1]); let open = 0, lastEnd = -1, widest = 0, seen = false; for (const [x, d] of ev) { if (d === 1) { if (seen && open === 0 && x > lastEnd) widest = Math.max(widest, x - lastEnd); seen = true; open++; } else { open--; if (open === 0) lastEnd = x; } } return String(widest);
    },
    tests() {
      const g = rng(3018); const out = ['4\n1 3\n2 6\n8 10\n15 18\n', '2\n0 5\n5 9\n', '1\n0 7\n', '2\n0 1\n999999999 1000000000\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const ps = readPairs(rs, 1, n); const lo = Math.min(...ps.map((p) => p[0])), hi = Math.max(...ps.map((p) => p[1])); const busy = new Array(hi - lo + 1).fill(false); for (const [s, e] of ps) for (let x = s; x < e; x++) busy[x - lo] = true; let widest = 0, run = 0; for (let x = 0; x < hi - lo; x++) { if (busy[x]) { widest = Math.max(widest, run); run = 0; } else run++; } return String(widest); };
      crossCheck(() => pairsText(randomRanges(g, randInt(g, 1, 7), 40, 6)), (i) => this.solve(i), brute, 600);
      for (const [n, maxT, maxLen] of [[10, 100, 10], [100, 1000, 20], [1000, 1000000, 500], [30000, 1000000000, 1000], [30000, 1000000000, 20000], [30000, 1000000000, 100000000], [29999, 1000000, 10]]) out.push(pairsText(randomRanges(g, n, maxT, maxLen)));
      out.push(pairsText(many(30000, (i) => [i * 20000, i * 20000 + 1])), pairsText(shuffle(g, many(30000, (i) => [i * 20000, i * 20000 + 19999]))), pairsText([[0, 1], [999999999, 1000000000], ...many(29998, (i) => [i + 1000, i + 1001])]));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of ranges.', 'Each of the next `n` lines has two numbers `start` and `end`: a closed range from `start` to `end`.'],
    constraints: ['1 <= n <= 30000', '0 <= start < end <= 10^9', 'All the ranges are different.'],
    slug: 'remove-covered-ranges',
    title: 'How Many Ranges Are Not Inside Another Range?',
    tags: ['intervals', 'sorting', 'domination'],
    concept: {
      title: 'Sort by start, and for equal starts put the longer range first',
      body: [
        'A range `(a, b)` is **covered** by a range `(c, d)` if `c <= a` and `b <= d`: it lies completely inside the other one. After removing all the covered ranges, how many ranges remain? For `(1, 4) (3, 6) (2, 8)` the range `(3, 6)` is covered by `(2, 8)`, so 2 remain. For `(1, 2) (1, 4) (3, 4)` the range `(1, 4)` covers the other two: 1 remains. All the ranges are different.',
        'Sort the ranges by the **start, increasing**, and for equal starts by the **end, decreasing**. Now every range that could cover the current one comes **before** it in the list: a range that covers it has a smaller start, or the same start and a larger end (which is why the longer one goes first when the starts are equal). While walking through the sorted list, keep `max_end`, the **largest end among the ranges before**. The current range is covered exactly when its end is **at most `max_end`**. Otherwise it is not covered: count it and update `max_end`.',
        { code: 'ranges.sort(key=lambda r: (r[0], -r[1]))\ncount = 0\nmax_end = -1\nfor start, end in ranges:\n    if end > max_end:               # nothing before covers it\n        count += 1\n        max_end = end\nprint(count)' },
        'The tie-break on equal starts matters: with the ends in increasing order the shorter range would be counted as not covered before its longer partner was seen. After the sort the work is one pass: O(n log n) in total. This is the shape of many *domination* problems: sort by one key, break ties in the right way, and scan with the best value of the other key.'
      ]
    },
    statement: ['`n` different closed ranges are given. A range is covered if some other range contains it completely: `other.start <= start` and `end <= other.end`. Print the number of ranges that are not covered by any other range.'],
    outputFormat: ['Print the number of ranges that are not covered.'],
    examples: [{ input: '3\n1 4\n3 6\n2 8\n', note: '(3, 6) is covered by (2, 8): 2.' }, { input: '3\n1 2\n1 4\n3 4\n', note: '(1, 4) covers the other two: 1.' }],
    hints: ['Sort by start increasing and, for equal starts, by end decreasing.', 'Keep the largest end seen so far.', 'A range whose end is not larger than that is covered.'],
    program: {
      io: ['n:int', 'ranges:int[n][2]'],
      fast: true,
      python: r`
        ranges.sort(key=lambda r0: (r0[0], -r0[1]))
        count = 0
        max_end = -1
        for start, end in ranges:
            if end > max_end:
                count += 1
                max_end = end
        print(count)`,
      cpp: r`
        sort(ranges.begin(), ranges.end(), [](const vector<long long>& x, const vector<long long>& y) {
            if (x[0] != y[0]) return x[0] < y[0];
            return x[1] > y[1];
        });
        long long count = 0, maxEnd = -1;
        for (const vector<long long>& r0 : ranges) {
            if (r0[1] > maxEnd) {
                count++;
                maxEnd = r0[1];
            }
        }
        cout << count << "\n";`,
      java: r`
        long[] keys = new long[(int) n];
        for (int i = 0; i < n; i++) keys[i] = ranges[i][0] * 2147483648L + (1000000000L - ranges[i][1]);
        Arrays.sort(keys);
        long count = 0, maxEnd = -1;
        for (int t = 0; t < n; t++) {
            long end = 1000000000L - (keys[t] & 2147483647L);
            if (end > maxEnd) {
                count++;
                maxEnd = end;
            }
        }
        System.out.println(count);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The ranges are sorted by start increasing and, for equal starts, by end decreasing; scanning them with the largest end seen so far, a range is covered exactly when its end is at most that value, otherwise it is counted.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const ps = readPairs(rs, 1, n); // for each range test whether another range covers it; for large inputs use the sort by end and the smallest start seen from the right
      if (n <= 600) { let c = 0; for (let i = 0; i < n; i++) { let covered = false; for (let j = 0; j < n && !covered; j++) if (j !== i && ps[j][0] <= ps[i][0] && ps[i][1] <= ps[j][1]) covered = true; if (!covered) c++; } return String(c); }
      const byEnd = ps.slice().sort((x, y) => y[1] - x[1] || x[0] - y[0]); let minStart = Infinity, c = 0; for (const [s] of byEnd) { if (s < minStart) { c++; minStart = s; } } return String(c);
    },
    tests() {
      const g = rng(3019); const out = ['3\n1 4\n3 6\n2 8\n', '3\n1 2\n1 4\n3 4\n', '1\n0 1\n', '2\n0 5\n0 6\n'];
      const distinct = (n, maxT, maxLen) => { const set = new Set(); const res = []; while (res.length < n) { const s = randInt(g, 0, maxT - 1); const e = Math.min(maxT, s + randInt(g, 1, maxLen)); const key = `${s},${e}`; if (!set.has(key)) { set.add(key); res.push([s, e]); } } return res; };
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const ps = readPairs(rs, 1, n); let c = 0; for (let i = 0; i < n; i++) { let covered = false; for (let j = 0; j < n; j++) if (j !== i && ps[j][0] <= ps[i][0] && ps[i][1] <= ps[j][1]) covered = true; if (!covered) c++; } return String(c); };
      crossCheck(() => pairsText(distinct(randInt(g, 1, 8), 15, 8)), (i) => this.solve(i), brute, 600);
      for (const [n, maxT, maxLen] of [[10, 100, 30], [100, 1000, 100], [1000, 100000, 5000], [30000, 1000000000, 100000000], [30000, 1000000000, 1000000], [30000, 100000, 30000], [30000, 1000, 1000], [29999, 1000000000, 1000000000]]) out.push(pairsText(distinct(n, maxT, maxLen)));
      out.push(pairsText(shuffle(g, many(30000, (i) => [i, i + 1]))), pairsText(shuffle(g, many(30000, (i) => [i, 1000000000 - i]))), pairsText(shuffle(g, many(30000, (i) => [0, i + 1]))), pairsText(shuffle(g, many(30000, (i) => [i, 100000 + i]))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`: the number of times.', 'The second line has `n` times written as `HH:MM` (24-hour clock, `00:00` to `23:59`).'],
    constraints: ['2 <= n <= 20000'],
    slug: 'closest-times-of-the-day',
    title: 'The Smallest Difference Between Two Times of the Day',
    tags: ['intervals', 'sorting', 'circular', 'time'],
    concept: {
      title: 'Turn the times into minutes, sort them, and compare neighbours, including the wrap past midnight',
      body: [
        'A list of times of the day is given in the form `HH:MM`. Find the **smallest number of minutes** between any two of them. The clock is a circle: from `23:59` to `00:00` is only 1 minute. For `23:59 00:00` the answer is 1; for `00:00 23:59 00:00` it is 0 (two equal times).',
        'First convert each time to the number of minutes since midnight: `hours * 60 + minutes`, a number from 0 to 1439. **Sort** these numbers. The two closest times are always **neighbours** in the sorted order (if a time `b` lies between `a` and `c`, then `b` is closer to both than `a` and `c` are to each other). So the answer is the smallest difference between two neighbours. The circle adds one more pair of neighbours: the **last** time and the **first** time of the next day, with the difference `first + 1440 - last`.',
        { code: 'minutes = sorted(int(t[:2]) * 60 + int(t[3:]) for t in times)\nbest = minutes[0] + 1440 - minutes[-1]         # across midnight\nfor i in range(1, n):\n    best = min(best, minutes[i] - minutes[i - 1])\nprint(best)' },
        'There are only 1440 different minutes in a day, so with more than 1440 times two of them are equal and the answer is 0 (the sort puts them next to each other and finds the difference 0). The sort costs O(n log n); a counting sort over the 1440 possible values would give O(n) time. Remember to include the pair across midnight: without it `23:59 00:01` would give 1438 instead of 2.'
      ]
    },
    statement: ['`n` times of the day are given as `HH:MM` on a 24-hour clock. Print the smallest number of minutes between any two of them, where the clock is cyclic (the time from `23:59` to `00:00` is 1 minute). Equal times have the difference 0.'],
    outputFormat: ['Print the smallest difference in minutes.'],
    examples: [{ input: '2\n23:59 00:00\n', note: 'Across midnight there is only 1 minute: 1.' }, { input: '3\n00:00 23:59 00:00\n', note: 'Two times are equal: 0.' }],
    hints: ['Convert every time to minutes after midnight (0 to 1439).', 'Sort the minutes; the closest pair is a pair of neighbours.', 'Also compare the first time + 1440 with the last time.'],
    program: {
      io: ['n:int', 'times:word[n]'],
      fast: true,
      python: r`
        minutes = sorted(int(t[:2]) * 60 + int(t[3:]) for t in times)
        best = minutes[0] + 1440 - minutes[-1]
        for i in range(1, n):
            d = minutes[i] - minutes[i - 1]
            if d < best:
                best = d
        print(best)`,
      cpp: r`
        vector<int> minutes;
        for (const string& t : times) minutes.push_back(((t[0] - '0') * 10 + (t[1] - '0')) * 60 + (t[3] - '0') * 10 + (t[4] - '0'));
        sort(minutes.begin(), minutes.end());
        int best = minutes[0] + 1440 - minutes.back();
        for (size_t i = 1; i < minutes.size(); i++) best = min(best, minutes[i] - minutes[i - 1]);
        cout << best << "\n";`,
      java: r`
        int[] minutes = new int[(int) n];
        for (int i = 0; i < n; i++) {
            String t = times[i];
            minutes[i] = ((t.charAt(0) - '0') * 10 + (t.charAt(1) - '0')) * 60 + (t.charAt(3) - '0') * 10 + (t.charAt(4) - '0');
        }
        Arrays.sort(minutes);
        int best = minutes[0] + 1440 - minutes[minutes.length - 1];
        for (int i = 1; i < minutes.length; i++) best = Math.min(best, minutes[i] - minutes[i - 1]);
        System.out.println(best);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The times are converted to minutes after midnight and sorted; the closest pair is a pair of neighbours, and the pair formed by the last time and the first time of the next day (first + 1440 - last) is checked as well.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const times = rows(input)[1].split(' '); const m = times.map((t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))); let best = Infinity; if (m.length <= 2000) { for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const d = Math.abs(m[i] - m[j]); best = Math.min(best, d, 1440 - d); } return String(best); } // large lists: only 1440 different minutes exist, mark them and look for a repeat or the closest marked pair
      const seen = new Array(1440).fill(0); for (const x of m) seen[x]++; if (seen.some((c) => c > 1)) return '0'; const marked = []; for (let x = 0; x < 1440; x++) if (seen[x]) marked.push(x); for (let i = 1; i < marked.length; i++) best = Math.min(best, marked[i] - marked[i - 1]); best = Math.min(best, marked[0] + 1440 - marked[marked.length - 1]); return String(best);
    },
    tests() {
      const g = rng(3020); const out = ['2\n23:59 00:00\n', '3\n00:00 23:59 00:00\n', '2\n12:00 12:01\n', '2\n00:00 12:00\n'];
      const fmt = (x) => `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`;
      const make = (n, distinctOnly) => { const set = []; if (distinctOnly) { const used = new Set(); while (set.length < n) { const x = randInt(g, 0, 1439); if (!used.has(x)) { used.add(x); set.push(x); } } } else for (let i = 0; i < n; i++) set.push(randInt(g, 0, 1439)); return `${n}\n${set.map(fmt).join(' ')}\n`; };
      const brute = (input) => { const m = rows(input)[1].split(' ').map((t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))); let best = Infinity; for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const d = Math.abs(m[i] - m[j]); best = Math.min(best, d, 1440 - d); } return String(best); };
      crossCheck(() => make(randInt(g, 2, 8), true), (i) => this.solve(i), brute, 600);
      for (const [n, d] of [[10, true], [100, true], [500, true], [1000, true], [1440, true], [1440, false], [5000, false], [20000, false], [19999, false]]) out.push(make(n, d));
      out.push(`1440\n${many(1440, (i) => fmt(i)).join(' ')}\n`, `2\n23:59 00:01\n`, `1000\n${many(1000, (i) => fmt((i * 7) % 1440)).join(' ')}\n`, `20000\n${many(20000, () => '07:07').join(' ')}\n`);
      return out;
    }
  }
];
