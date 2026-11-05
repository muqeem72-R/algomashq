import { r, rng, randInt, many, nums, rows, shuffle, randArray } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const pairsOf = (input, from, count) => { const rs = rows(input); return many(count, (i) => nums(rs[from + i])); };
const lines = (list) => list.map((p) => p.join(' ')).join('\n');
// `count` sorted, pairwise disjoint closed ranges [l, r] with l <= r and a gap of at least 1 between neighbours
const disjointRanges = (g, count, maxStep) => { const out = []; let pos = randInt(g, 0, maxStep); for (let i = 0; i < count; i++) { const l = pos; const rr = l + randInt(g, 0, maxStep); out.push([l, rr]); pos = rr + randInt(g, 1, maxStep); } return out; };
const stepFor = (count) => Math.max(1, Math.floor(1000000000 / (2 * count + 2)) - 1);
const randPairs = (g, count, hi, minLen = 1) => many(count, () => { const s = randInt(g, 0, hi - minLen); return [s, randInt(g, s + minLen, Math.min(hi, s + Math.max(minLen, Math.floor(hi / 3))))]; });

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of meetings.', 'Each of the next `n` lines has two numbers `s` and `e`: the meeting occupies the time from `s` up to `e`.'],
    constraints: ['1 <= n <= 30000', '0 <= s < e <= 10^9', 'Two meetings clash if they share some time; a meeting may start exactly when another one ends.'],
    slug: 'cancel-fewest-meetings',
    title: 'Cancel the Fewest Meetings So That None Clash',
    tags: ['greedy', 'intervals', 'sorting', 'activity-selection'],
    concept: {
      title: 'Keep the meeting that ends first, then the next one that starts after it, and so on',
      body: [
        'You are given `n` meetings, each from `s` to `e`. Two meetings **clash** when they share some time (a meeting that starts at the moment another ends is fine). What is the **smallest number of meetings you must cancel** so that no two of the remaining meetings clash? For `1-2, 2-3, 3-4, 1-3` the answer is 1: cancel `1-3`.',
        'Cancelling the fewest is the same as **keeping the most**. This is the classic *activity selection* problem. Sort the meetings by their **end time**. Always keep the meeting that ends the earliest, because it leaves the largest part of the timeline free for the others. Then skip every meeting that starts before this one ends, and keep the next one that starts at or after it. Repeat.',
        { code: 'meetings.sort(key=lambda m: m[1])       # by the end time\nkept = 0\nlast_end = -1\nfor s, e in meetings:\n    if s >= last_end:                  # no clash with the last kept meeting\n        kept += 1\n        last_end = e\nprint(n - kept)' },
        'Why is "the earliest end" safe? Take any best schedule and look at its first meeting. Replacing it by the meeting with the earliest end time cannot create a clash, since the new meeting finishes no later, so a best schedule that starts with the earliest-ending meeting exists. The same argument applies to the rest of the schedule. The cost is the sort: O(n log n).'
      ]
    },
    statement: ['`n` meetings are given by their start `s` and end `e`. Two meetings clash if they have some common time; a meeting that starts when another ends does not clash with it. Print the smallest number of meetings to cancel so that the remaining ones do not clash.'],
    outputFormat: ['Print the smallest number of meetings to cancel.'],
    examples: [{ input: '4\n1 2\n2 3\n3 4\n1 3\n', note: 'Cancel the meeting 1-3: 1.' }, { input: '3\n1 5\n1 5\n1 5\n', note: 'Only one of the three can stay: 2.' }],
    hints: ['Cancelling the fewest means keeping the most.', 'Sort the meetings by the end time.', 'Keep a meeting when its start is not before the end of the last kept one.'],
    program: {
      io: ['n:int', 'meetings:int[n][2]'],
      fast: true,
      python: r`
        meetings.sort(key=lambda m: m[1])
        kept = 0
        last_end = -1
        for s, e in meetings:
            if s >= last_end:
                kept += 1
                last_end = e
        print(n - kept)`,
      cpp: r`
        sort(meetings.begin(), meetings.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[1] < y[1]; });
        long long kept = 0, lastEnd = -1;
        for (const vector<long long>& m : meetings) {
            if (m[0] >= lastEnd) {
                kept++;
                lastEnd = m[1];
            }
        }
        cout << n - kept << "\n";`,
      java: r`
        int count = (int) n;
        long[] keys = new long[count];
        for (int i = 0; i < count; i++) keys[i] = (meetings[i][1] << 30) + meetings[i][0];
        Arrays.sort(keys);
        long kept = 0, lastEnd = -1;
        for (int i = 0; i < count; i++) {
            long e = keys[i] >> 30;
            long s = keys[i] & ((1L << 30) - 1);
            if (s >= lastEnd) {
                kept++;
                lastEnd = e;
            }
        }
        System.out.println(count - kept);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The meetings are sorted by end time; each meeting whose start is not before the end of the last kept meeting is kept. The answer is n minus the number of kept meetings.'], complexity: 'Time O(n log n), space O(1) extra.' },
    solve(input) {
      const n = Number(rows(input)[0]); const m = pairsOf(input, 1, n).sort((x, y) => x[0] - y[0] || x[1] - y[1]); // by the start: on a clash the meeting that ends later is the one to cancel
      let removed = 0, end = m[0][1]; for (let i = 1; i < n; i++) { if (m[i][0] < end) { removed++; end = Math.min(end, m[i][1]); } else end = m[i][1]; } return String(removed);
    },
    tests() {
      const g = rng(3061); const out = ['4\n1 2\n2 3\n3 4\n1 3\n', '3\n1 5\n1 5\n1 5\n', '1\n0 1\n', '2\n0 5\n5 9\n'];
      const make = (n, hi) => `${n}\n${lines(randPairs(g, n, hi))}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); const m = pairsOf(input, 1, n); let best = 0; for (let mask = 0; mask < (1 << n); mask++) { const chosen = []; for (let i = 0; i < n; i++) if (mask >> i & 1) chosen.push(m[i]); let ok = true; for (let i = 0; i < chosen.length && ok; i++) for (let j = i + 1; j < chosen.length; j++) if (chosen[i][0] < chosen[j][1] && chosen[j][0] < chosen[i][1]) { ok = false; break; } if (ok) best = Math.max(best, chosen.length); } return String(n - best); };
      crossCheck(() => make(randInt(g, 1, 9), 9), (i) => this.solve(i), brute, 800);
      for (const [n, hi] of [[10, 20], [100, 300], [1000, 100000], [30000, 1000000000], [30000, 1000000000], [30000, 100000], [30000, 50], [29999, 1000000000]]) out.push(make(n, hi));
      out.push(`30000\n${many(30000, (i) => `${i} ${i + 1}`).join('\n')}\n`, `30000\n${many(30000, () => '0 1000000000').join('\n')}\n`, `30000\n${many(30000, (i) => `${i} ${i + 2}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of balloons.', 'Each of the next `n` lines has two numbers `a` and `b`: the balloon covers every point from `a` to `b` on the line.'],
    constraints: ['1 <= n <= 30000', '0 <= a <= b <= 10^9'],
    slug: 'fewest-arrows-for-balloons',
    title: 'The Fewest Arrows That Burst Every Balloon',
    tags: ['greedy', 'intervals', 'sorting', 'stabbing'],
    concept: {
      title: 'Shoot at the right end of the balloon that ends first: it bursts everything that starts before that point',
      body: [
        'Balloons float on a line; the balloon `i` covers all the points from `a[i]` to `b[i]` (both ends included). An arrow shot at the point `x` bursts **every balloon that covers `x`**. What is the **smallest number of arrows** that burst all balloons? For the balloons `1-6, 2-8, 7-12, 10-16` the answer is 2: one arrow at 6 bursts the first two, one at 12 bursts the last two.',
        'This is the *stabbing* problem for intervals. Sort the balloons by the **right end**. The first balloon has to be burst by some arrow, and the best place for it is its **right end** `b`: any arrow that bursts this balloon is at most `b`, and moving it to `b` can only help, because every balloon that starts at or before `b` and ends at or after the old position still covers `b` (the balloons are sorted by their right end, so none of the remaining ends before `b`).',
        { code: 'balloons.sort(key=lambda x: x[1])      # by the right end\narrows = 0\nshot = -1                              # the position of the last arrow\nfor a, b in balloons:\n    if a > shot:                       # this balloon was missed by the last arrow\n        arrows += 1\n        shot = b                       # shoot at its right end\nprint(arrows)' },
        'Balloons that touch at a single point (like `1-5` and `5-9`) share the point 5, so one arrow bursts both. The algorithm is the same as the one for choosing the most non-overlapping meetings: the number of arrows equals the largest set of balloons no two of which share a point. Time O(n log n).'
      ]
    },
    statement: ['`n` balloons are given as ranges `[a, b]` of a line (the ends belong to the balloon). An arrow shot at a point bursts every balloon that contains the point. Print the smallest number of arrows that burst all balloons.'],
    outputFormat: ['Print the smallest number of arrows.'],
    examples: [{ input: '4\n1 6\n2 8\n7 12\n10 16\n', note: 'An arrow at 6 and an arrow at 12: 2.' }, { input: '3\n1 5\n5 9\n9 13\n', note: 'The arrows at 5 and 13 (or at 5 and 9): the neighbours touch: 2.' }],
    hints: ['Sort by the right end.', 'Shoot at the right end of the first balloon that was not burst yet.', 'A balloon is burst by the last arrow if its left end is not after the arrow position.'],
    program: {
      io: ['n:int', 'balloons:int[n][2]'],
      fast: true,
      python: r`
        balloons.sort(key=lambda x: x[1])
        arrows = 0
        shot = -1
        for a, b in balloons:
            if a > shot:
                arrows += 1
                shot = b
        print(arrows)`,
      cpp: r`
        sort(balloons.begin(), balloons.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[1] < y[1]; });
        long long arrows = 0, shot = -1;
        for (const vector<long long>& b : balloons) {
            if (b[0] > shot) {
                arrows++;
                shot = b[1];
            }
        }
        cout << arrows << "\n";`,
      java: r`
        int count = (int) n;
        long[] keys = new long[count];
        for (int i = 0; i < count; i++) keys[i] = (balloons[i][1] << 30) + balloons[i][0];
        Arrays.sort(keys);
        long arrows = 0, shot = -1;
        for (int i = 0; i < count; i++) {
            long b = keys[i] >> 30;
            long a = keys[i] & ((1L << 30) - 1);
            if (a > shot) {
                arrows++;
                shot = b;
            }
        }
        System.out.println(arrows);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The balloons are sorted by their right end; whenever a balloon starts after the position of the last arrow, a new arrow is shot at its right end.'], complexity: 'Time O(n log n), space O(1) extra.' },
    solve(input) {
      const n = Number(rows(input)[0]); const b = pairsOf(input, 1, n).sort((x, y) => x[0] - y[0] || x[1] - y[1]); // by the left end: keep the common part of the balloons that share the current arrow
      let arrows = 1, hi = b[0][1]; for (let i = 1; i < n; i++) { if (b[i][0] <= hi) hi = Math.min(hi, b[i][1]); else { arrows++; hi = b[i][1]; } } return String(arrows);
    },
    tests() {
      const g = rng(3062); const out = ['4\n1 6\n2 8\n7 12\n10 16\n', '3\n1 5\n5 9\n9 13\n', '1\n0 0\n', '2\n0 0\n1 1\n'];
      const make = (n, hi, minLen) => `${n}\n${lines(randPairs(g, n, hi, minLen))}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); const b = pairsOf(input, 1, n); for (let size = 1; size <= n; size++) { const pick = (start, chosen) => { if (chosen.length === size) return b.every(([x, y]) => chosen.some((p) => x <= p && p <= y)); for (let p = start; p <= 9; p++) { chosen.push(p); if (pick(p + 1, chosen)) return true; chosen.pop(); } return false; }; if (pick(0, [])) return String(size); } return String(n); };
      crossCheck(() => make(randInt(g, 1, 7), 9, 0), (i) => this.solve(i), brute, 700);
      for (const [n, hi, minLen] of [[10, 30, 0], [100, 1000, 1], [1000, 100000, 0], [30000, 1000000000, 0], [30000, 1000000000, 1000], [30000, 100000, 0], [30000, 20, 0], [29999, 1000000000, 0]]) out.push(make(n, hi, minLen));
      out.push(`30000\n${many(30000, (i) => `${i} ${i}`).join('\n')}\n`, `30000\n${many(30000, () => '0 1000000000').join('\n')}\n`, `30000\n${many(30000, (i) => `${i} ${i + 1}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of ranges in the list.', 'Each of the next `n` lines has two numbers `l` and `r`: a range of the list. The list is sorted and the ranges share no point.', 'The last line has two numbers `lo` and `hi`: the new range.'],
    constraints: ['1 <= n <= 20000', '0 <= l <= r <= 10^9', 'For neighbours, r of the earlier range < l of the next one.', '0 <= lo <= hi <= 10^9'],
    slug: 'insert-a-range',
    title: 'Insert a New Range Into a Sorted List of Ranges',
    tags: ['intervals', 'merging', 'sweep', 'array'],
    concept: {
      title: 'Copy the ranges before the new one, merge all that touch it, then copy the rest',
      body: [
        'A list of ranges is **sorted** and no two ranges share a point. A new range arrives. Insert it, and **merge** it with every range it overlaps (two ranges overlap when they share at least one point), so that the list stays sorted and has no overlaps. For the list `1-3, 6-9` and the new range `2-5` the result is `1-5, 6-9`. For `1-2, 3-5, 6-7, 8-10, 12-16` and `4-8` the result is `1-2, 3-10, 12-16`.',
        'Because the list is sorted, the ranges fall into **three groups** in this order. (1) Ranges that end **before** the new one starts (`r < lo`): they are copied unchanged. (2) Ranges that **overlap** the new one (`l <= hi`, and they are not in group 1): they are swallowed — the new range grows to `min` of all the left ends and `max` of all the right ends. (3) The remaining ranges start after the new one ends: copied unchanged.',
        { code: 'result = []\ni = 0\nwhile i < n and ranges[i][1] < lo:         # ends before the new range\n    result.append(ranges[i]); i += 1\nwhile i < n and ranges[i][0] <= hi:        # overlaps the new range\n    lo = min(lo, ranges[i][0])\n    hi = max(hi, ranges[i][1]); i += 1\nresult.append([lo, hi])\nresult.extend(ranges[i:])                  # starts after the new range' },
        'The program does one pass and no sorting, so it runs in O(n) time. The three-stage structure — "before", "overlapping", "after" — is the standard pattern for editing a sorted list of disjoint intervals. Ranges that merely touch without sharing a point, such as `1-2` and `3-4`, are **not** merged.'
      ]
    },
    statement: ['A sorted list of `n` pairwise disjoint ranges `[l, r]` and one new range `[lo, hi]` are given. Insert the new range and merge it with all ranges that share at least one point with it. Print the number of ranges in the resulting list, and then the ranges in increasing order, one per line.'],
    outputFormat: ['The first line has `m`, the number of ranges after the insertion.', 'The next `m` lines have the ranges `l r` in increasing order.'],
    examples: [{ input: '2\n1 3\n6 9\n2 5\n', note: 'The new range joins the first one: 2 ranges, 1-5 and 6-9.' }, { input: '5\n1 2\n3 5\n6 7\n8 10\n12 16\n4 8\n', note: 'The new range swallows 3-5, 6-7 and 8-10: 3 ranges, 1-2, 3-10 and 12-16.' }],
    hints: ['The ranges ending before lo are copied first.', 'The ranges starting not after hi (and not already copied) are merged into the new one.', 'Then copy the rest.'],
    program: {
      io: ['n:int', 'ranges:int[n][2]', 'lo:int hi:int'],
      fast: true,
      python: r`
        result = []
        i = 0
        while i < n and ranges[i][1] < lo:
            result.append(ranges[i])
            i += 1
        while i < n and ranges[i][0] <= hi:
            lo = min(lo, ranges[i][0])
            hi = max(hi, ranges[i][1])
            i += 1
        result.append([lo, hi])
        result.extend(ranges[i:])
        print(len(result))
        print("\n".join(str(a) + " " + str(b) for a, b in result))`,
      cpp: r`
        string body;
        long long total = 0;
        long long i = 0;
        while (i < n && ranges[i][1] < lo) {
            body += to_string(ranges[i][0]) + " " + to_string(ranges[i][1]) + "\n";
            total++;
            i++;
        }
        while (i < n && ranges[i][0] <= hi) {
            lo = min(lo, ranges[i][0]);
            hi = max(hi, ranges[i][1]);
            i++;
        }
        body += to_string(lo) + " " + to_string(hi) + "\n";
        total++;
        while (i < n) {
            body += to_string(ranges[i][0]) + " " + to_string(ranges[i][1]) + "\n";
            total++;
            i++;
        }
        cout << total << "\n" << body;`,
      java: r`
        StringBuilder body = new StringBuilder();
        long total = 0;
        int i = 0;
        int count = (int) n;
        while (i < count && ranges[i][1] < lo) {
            body.append(ranges[i][0]).append(" ").append(ranges[i][1]).append("\n");
            total++;
            i++;
        }
        while (i < count && ranges[i][0] <= hi) {
            lo = Math.min(lo, ranges[i][0]);
            hi = Math.max(hi, ranges[i][1]);
            i++;
        }
        body.append(lo).append(" ").append(hi).append("\n");
        total++;
        while (i < count) {
            body.append(ranges[i][0]).append(" ").append(ranges[i][1]).append("\n");
            total++;
            i++;
        }
        System.out.println(total);
        System.out.print(body);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['The ranges that end before the new range are copied, the ranges that overlap it are merged into it, and the remaining ranges are copied after it.'], complexity: 'Time O(n), space O(n) for the output.' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const all = pairsOf(input, 1, n); all.push(nums(rs[n + 1])); all.sort((x, y) => x[0] - y[0] || x[1] - y[1]); // merge everything from scratch
      const res = [all[0].slice()]; for (const [l, rr] of all.slice(1)) { const last = res[res.length - 1]; if (l <= last[1]) last[1] = Math.max(last[1], rr); else res.push([l, rr]); } return `${res.length}\n${lines(res)}`;
    },
    tests() {
      const g = rng(3063); const out = ['2\n1 3\n6 9\n2 5\n', '5\n1 2\n3 5\n6 7\n8 10\n12 16\n4 8\n', '1\n5 5\n5 5\n', '1\n5 5\n0 4\n', '1\n5 5\n6 9\n'];
      const make = (n, step, wide) => { const list = disjointRanges(g, n, step); const top = list[n - 1][1] + step; const a = randInt(g, 0, top); const b = wide ? randInt(g, a, top) : randInt(g, a, Math.min(top, a + step)); return `${n}\n${lines(list)}\n${a} ${b}\n`; };
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); let list = pairsOf(input, 1, n); list.push(nums(rs[n + 1])); let changed = true; while (changed) { changed = false; outer: for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) { if (list[i][0] <= list[j][1] && list[j][0] <= list[i][1]) { const merged = [Math.min(list[i][0], list[j][0]), Math.max(list[i][1], list[j][1])]; list = list.filter((_, k) => k !== i && k !== j); list.push(merged); changed = true; break outer; } } } list.sort((x, y) => x[0] - y[0]); return `${list.length}\n${lines(list)}`; };
      crossCheck(() => make(randInt(g, 1, 6), 3, g() < 0.5), (i) => this.solve(i), brute, 800);
      for (const [n, wide] of [[10, true], [100, false], [100, true], [5000, false], [20000, false], [20000, true], [19999, false]]) out.push(make(n, stepFor(n), wide));
      const big = disjointRanges(g, 20000, stepFor(20000)); out.push(`20000\n${lines(big)}\n0 1000000000\n`, `20000\n${lines(big)}\n${big[9999][0]} ${big[10000][1]}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of trips.', 'Each of the next `n` lines has three numbers `p`, `a` and `b`: the number of passengers, the point where they get in and the point where they get out.'],
    constraints: ['1 <= n <= 30000', '1 <= p <= 10^4', '0 <= a < b <= 10^9', 'Passengers who get out at a point leave before the passengers who get in at that point enter.'],
    slug: 'smallest-car-capacity',
    title: 'The Smallest Car That Can Take Every Trip',
    tags: ['greedy', 'sweep-line', 'events', 'difference-array'],
    concept: {
      title: 'Turn every trip into two events — passengers +p at the start and -p at the end — and sweep along the road',
      body: [
        'A car drives along a road in one direction. Each trip says: `p` passengers get in at the point `a` and get out at the point `b`. The car never turns back. What is the **smallest number of seats** the car needs so that it can carry all the trips? For the trips `(2, 1, 5)`, `(3, 3, 7)` the car holds 2 passengers between the points 1 and 3, and 5 between 3 and 5, so it needs 5 seats.',
        'The number of passengers in the car changes only at the endpoints of the trips. Make **two events** for every trip: `(a, +p)` and `(b, -p)`. Sort the events by their position; at one position put the **negative events first** (the passengers who get out leave before the new ones enter, so the car is never counted as fuller than it is). Walk through the events, keep the current load, and remember the **largest load** seen.',
        { code: 'events = []\nfor p, a, b in trips:\n    events.append((a, p))\n    events.append((b, -p))\nevents.sort()                          # at the same position -p comes before +p\nload = peak = 0\nfor pos, delta in events:\n    load += delta\n    peak = max(peak, load)\nprint(peak)' },
        'The answer is the maximum, over all points of the road, of the total number of passengers whose trip covers the point. The sweep costs O(n log n) for the sort. The same event-sweep idea answers "how many meetings are happening at once" and, with weights, "how much of a resource is in use at the same time".'
      ]
    },
    statement: ['`n` trips are given. In the trip `i`, `p` passengers get into the car at the point `a` and get out at the point `b` of a straight road, which the car drives along in one direction. Passengers who get out at a point leave before the passengers who get in at the same point enter. Print the smallest number of seats the car needs for all the trips.'],
    outputFormat: ['Print the smallest number of seats.'],
    examples: [{ input: '2\n2 1 5\n3 3 7\n', note: 'Between the points 3 and 5 there are 2 + 3 = 5 passengers: 5.' }, { input: '2\n4 1 3\n6 3 5\n', note: 'The first group leaves at 3 before the second enters: 6.' }],
    hints: ['Create two events per trip: +p at the start and -p at the end.', 'Sort the events by position; at equal positions the negative ones come first.', 'The answer is the largest running sum.'],
    program: {
      io: ['n:int', 'trips:int[n][3]'],
      fast: true,
      python: r`
        events = []
        for p, a, b in trips:
            events.append((a, p))
            events.append((b, -p))
        events.sort()
        load = peak = 0
        for pos, delta in events:
            load += delta
            if load > peak:
                peak = load
        print(peak)`,
      cpp: r`
        vector<pair<long long, long long>> events;
        for (const vector<long long>& t : trips) {
            events.push_back({t[1], t[0]});
            events.push_back({t[2], -t[0]});
        }
        sort(events.begin(), events.end());
        long long load = 0, peak = 0;
        for (const pair<long long, long long>& ev : events) {
            load += ev.second;
            peak = max(peak, load);
        }
        cout << peak << "\n";`,
      java: r`
        int count = (int) n;
        long[] keys = new long[2 * count];
        for (int i = 0; i < count; i++) {
            keys[2 * i] = (((trips[i][1] * 2 + 1) << 16) | i);
            keys[2 * i + 1] = (((trips[i][2] * 2) << 16) | i);
        }
        Arrays.sort(keys);
        long load = 0, peak = 0;
        for (int k = 0; k < 2 * count; k++) {
            int i = (int) (keys[k] & 65535L);
            long type = (keys[k] >> 16) & 1L;
            if (type == 1) load += trips[i][0];
            else load -= trips[i][0];
            peak = Math.max(peak, load);
        }
        System.out.println(peak);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Every trip adds the events +p at its start and -p at its end; the events are sorted (ends before starts at equal positions) and the largest running sum is the answer.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const n = Number(rows(input)[0]); const trips = pairsOf(input, 1, n); const xs = [...new Set(trips.flatMap(([, a, b]) => [a, b]))].sort((x, y) => x - y); const at = new Map(xs.map((x, i) => [x, i])); // compress the points and use a difference array
      const diff = new Array(xs.length + 1).fill(0); for (const [p, a, b] of trips) { diff[at.get(a)] += p; diff[at.get(b)] -= p; } let load = 0, peak = 0; for (let i = 0; i < xs.length; i++) { load += diff[i]; peak = Math.max(peak, load); } return String(peak);
    },
    tests() {
      const g = rng(3064); const out = ['2\n2 1 5\n3 3 7\n', '2\n4 1 3\n6 3 5\n', '1\n7 0 1\n', '3\n1 0 5\n1 0 5\n1 0 5\n'];
      const make = (n, hi, pMax) => `${n}\n${many(n, () => { const a = randInt(g, 0, hi - 1); return `${randInt(g, 1, pMax)} ${a} ${randInt(g, a + 1, Math.min(hi, a + Math.max(1, Math.floor(hi / 4))))}`; }).join('\n')}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); const trips = pairsOf(input, 1, n); let peak = 0; for (let t = 0; t <= 12; t++) { let load = 0; for (const [p, a, b] of trips) if (a <= t && t < b) load += p; peak = Math.max(peak, load); } return String(peak); };
      crossCheck(() => make(randInt(g, 1, 8), 10, 6), (i) => this.solve(i), brute, 800);
      for (const [n, hi, pMax] of [[10, 30, 10], [100, 1000, 100], [1000, 100000, 10000], [30000, 1000000000, 10000], [20000, 1000000000, 1], [20000, 100000, 10000], [30000, 40, 10000], [29999, 1000000000, 10000]]) out.push(make(n, hi, pMax));
      out.push(`20000\n${many(20000, () => '10000 0 1000000000').join('\n')}\n`, `30000\n${many(30000, (i) => `10000 ${i} ${i + 1}`).join('\n')}\n`, `20000\n${many(20000, (i) => `${1 + (i % 10000)} ${i * 7} ${i * 7 + 30000}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of meetings of all the workers together.', 'Each of the next `n` lines has two numbers `s` and `e`: a meeting that occupies the time from `s` up to `e`.'],
    constraints: ['1 <= n <= 30000', '0 <= s < e <= 10^9'],
    slug: 'common-free-time',
    title: 'The Free Time Common to All Workers',
    tags: ['intervals', 'merging', 'sweep-line', 'sorting'],
    concept: {
      title: 'Merge the busy times; the holes between the merged blocks are the free time',
      body: [
        'Several workers have meetings, and all the meetings are given in one list in any order (a meeting is the time from `s` up to `e`; two meetings of **different** workers may overlap, since they are different people). A moment is **common free time** when **nobody** is in a meeting. Find the **stretches of common free time between the first meeting start and the last meeting end** (time before the first meeting and after the last one is not counted). For the meetings `1-3, 2-4, 6-7, 9-12, 10-11` the free stretches are `4-6` and `7-9`.',
        'The moment is free when it is covered by **no meeting at all**, so the question is about the **union** of the meetings, no matter who attends each. Sort the meetings by the start, and keep `end`, the farthest end seen so far. When the next meeting starts **after** `end`, the time from `end` to this start is a free stretch (the length is positive, so something really is free). Then update `end = max(end, e)`.',
        { code: 'meetings.sort()\ngaps = []\nend = meetings[0][1]\nfor s, e in meetings[1:]:\n    if s > end:                     # nobody is busy between `end` and `s`\n        gaps.append((end, s))\n    end = max(end, e)\nprint(len(gaps))\nfor a, b in gaps: print(a, b)' },
        'A meeting that starts exactly when the previous block ends leaves no gap (the free stretch would have zero length). It is important to take the maximum of the ends: a long early meeting can hide many short ones. The sort makes the algorithm O(n log n); the gaps come out in increasing order.'
      ]
    },
    statement: ['`n` meetings of all workers are given in one list. A meeting is the time from `s` up to `e`. Print all the stretches of positive length between the earliest start and the latest end during which no meeting takes place. First print the number of stretches, then the stretches in increasing order, one per line (`from to`).'],
    outputFormat: ['The first line has the number of free stretches `m` (possibly 0).', 'Each of the next `m` lines has two numbers: the start and the end of a free stretch.'],
    examples: [{ input: '5\n1 3\n2 4\n6 7\n9 12\n10 11\n', note: 'The free stretches are 4-6 and 7-9.' }, { input: '2\n1 3\n3 5\n', note: 'The second meeting starts when the first ends: no free time, 0.' }],
    hints: ['Only the union of all the meetings matters.', 'Sort the meetings by the start and keep the farthest end so far.', 'A gap exists when the next start is greater than the farthest end.'],
    program: {
      io: ['n:int', 'meetings:int[n][2]'],
      fast: true,
      python: r`
        meetings.sort()
        gaps = []
        end = meetings[0][1]
        for i in range(1, n):
            s, e = meetings[i]
            if s > end:
                gaps.append(str(end) + " " + str(s))
            if e > end:
                end = e
        print(len(gaps))
        if gaps:
            print("\n".join(gaps))`,
      cpp: r`
        sort(meetings.begin(), meetings.end());
        string body;
        long long count = 0, end = meetings[0][1];
        for (long long i = 1; i < n; i++) {
            if (meetings[i][0] > end) {
                body += to_string(end) + " " + to_string(meetings[i][0]) + "\n";
                count++;
            }
            end = max(end, meetings[i][1]);
        }
        cout << count << "\n" << body;`,
      java: r`
        int total = (int) n;
        long[] keys = new long[total];
        for (int i = 0; i < total; i++) keys[i] = (meetings[i][0] << 30) + meetings[i][1];
        Arrays.sort(keys);
        StringBuilder body = new StringBuilder();
        long count = 0;
        long end = keys[0] & ((1L << 30) - 1);
        for (int i = 1; i < total; i++) {
            long s = keys[i] >> 30;
            long e = keys[i] & ((1L << 30) - 1);
            if (s > end) {
                body.append(end).append(" ").append(s).append("\n");
                count++;
            }
            end = Math.max(end, e);
        }
        System.out.println(count);
        System.out.print(body);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['The meetings are sorted by start; the farthest end so far is tracked, and every time a meeting starts after it, the stretch between them is reported as free time.'], complexity: 'Time O(n log n), space O(n) for the output.' },
    solve(input) {
      const n = Number(rows(input)[0]); const m = pairsOf(input, 1, n); const events = []; for (const [s, e] of m) { events.push([s, 1], [e, -1]); } events.sort((x, y) => x[0] - y[0] || x[1] - y[1]); // a sweep with a counter: a gap is a zero between two positions
      const gaps = []; let busy = 0, zeroAt = null; for (const [pos, d] of events) { if (d === 1 && busy === 0 && zeroAt !== null && pos > zeroAt) gaps.push([zeroAt, pos]); busy += d; if (busy === 0) zeroAt = pos; } return `${gaps.length}${gaps.length ? '\n' + lines(gaps) : ''}`;
    },
    tests() {
      const g = rng(3065); const out = ['5\n1 3\n2 4\n6 7\n9 12\n10 11\n', '2\n1 3\n3 5\n', '1\n0 1\n', '2\n0 1\n5 6\n'];
      const make = (n, hi, len) => `${n}\n${many(n, () => { const s = randInt(g, 0, hi - 1); return `${s} ${randInt(g, s + 1, Math.min(hi, s + len))}`; }).join('\n')}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); const m = pairsOf(input, 1, n); const lo = Math.min(...m.map((x) => x[0])), hi = Math.max(...m.map((x) => x[1])); const busy = new Array(hi + 1).fill(false); for (const [s, e] of m) for (let t = s; t < e; t++) busy[t] = true; const gaps = []; let t = lo; while (t < hi) { if (!busy[t]) { let u = t; while (u < hi && !busy[u]) u++; gaps.push([t, u]); t = u; } else t++; } return `${gaps.length}${gaps.length ? '\n' + lines(gaps) : ''}`; };
      crossCheck(() => make(randInt(g, 1, 7), 14, 3), (i) => this.solve(i), brute, 800);
      for (const [n, hi, len] of [[10, 100, 10], [100, 10000, 100], [1000, 1000000, 1000], [20000, 1000000000, 1000], [30000, 1000000000, 50000], [20000, 1000000000, 100000], [20000, 500000, 20], [19999, 1000000000, 10000]]) out.push(make(n, hi, len));
      out.push(`15000\n${many(15000, (i) => `${2 * i} ${2 * i + 1}`).join('\n')}\n`, `30000\n${many(30000, (i) => `${i} ${i + 1}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `T`: the number of clips and the length of the event.', 'Each of the next `n` lines has two numbers `s` and `e`: the clip shows the time from `s` to `e`.'],
    constraints: ['1 <= n <= 30000', '1 <= T <= 10^9', '0 <= s < e <= 10^9'],
    slug: 'fewest-clips-to-cover',
    title: 'The Fewest Video Clips That Cover the Whole Event',
    tags: ['greedy', 'intervals', 'jump-game', 'covering'],
    concept: {
      title: 'Among the clips that start inside the covered part, take the one that reaches farthest',
      body: [
        'An event lasts from the time 0 to the time `T`. You have `n` video clips, and the clip `i` shows the time from `s` to `e`. A clip may be cut, and two clips may be joined if the second starts no later than the first ends. What is the **smallest number of clips** that together show the **whole event**? If it is impossible, print -1. For `T = 10` and the clips `0-2, 4-6, 8-10, 1-9, 1-5, 5-9` the answer is 3: for example `0-2`, `1-9`, `8-10`.',
        'This is the interval version of the *jump game*. Suppose the time up to `need` is already covered (at the start `need = 0`). Among **all clips with `s <= need`**, pick the one with the **largest `e`**: it extends the coverage the farthest, and nothing else helps more. If even the best clip does not go beyond `need`, there is a hole and the answer is -1. Otherwise count one more clip and set `need = best`. Stop when `need >= T`.',
        { code: 'clips.sort()                                # by the start\nneed = count = i = 0\nwhile need < T:\n    best = need\n    while i < n and clips[i][0] <= need:    # the clips that can continue the coverage\n        best = max(best, clips[i][1])\n        i += 1\n    if best == need:\n        print(-1); break                    # nothing reaches farther: a hole\n    count += 1\n    need = best\nelse:\n    print(count)' },
        'The pointer `i` moves forward only, so each clip is looked at once: after the O(n log n) sort the greedy takes O(n). The method is correct because the set of clips available grows with `need`, so the best choice is always the farthest reach, exactly like choosing the next jump in the "fewest jumps" problem.'
      ]
    },
    statement: ['An event lasts from the time 0 to the time `T`. `n` video clips are given, each showing the time from `s` to `e`. Clips may be cut, and the event is covered if every moment from 0 to `T` is shown by some chosen clip (two clips that meet at a moment cover it). Print the smallest number of clips that cover the event, or -1 if the event cannot be covered.'],
    outputFormat: ['Print the smallest number of clips, or -1.'],
    examples: [{ input: '6 10\n0 2\n4 6\n8 10\n1 9\n1 5\n5 9\n', note: 'The clips 0-2, 1-9 and 8-10 cover everything: 3.' }, { input: '2 5\n0 1\n2 5\n', note: 'The time between 1 and 2 is not shown: -1.' }],
    hints: ['Sort the clips by the start.', 'Keep how far the event is covered.', 'Among the clips that start no later than that point choose the one that ends last; if it does not improve the coverage, answer -1.'],
    program: {
      io: ['n:int T:int', 'clips:int[n][2]'],
      fast: true,
      python: r`
        clips.sort()
        need = count = i = 0
        possible = True
        while need < T:
            best = need
            while i < n and clips[i][0] <= need:
                if clips[i][1] > best:
                    best = clips[i][1]
                i += 1
            if best == need:
                possible = False
                break
            count += 1
            need = best
        print(count if possible else -1)`,
      cpp: r`
        sort(clips.begin(), clips.end());
        long long need = 0, count = 0, i = 0;
        bool possible = true;
        while (need < T) {
            long long best = need;
            while (i < n && clips[i][0] <= need) {
                best = max(best, clips[i][1]);
                i++;
            }
            if (best == need) {
                possible = false;
                break;
            }
            count++;
            need = best;
        }
        cout << (possible ? count : -1) << "\n";`,
      java: r`
        int total = (int) n;
        long[] keys = new long[total];
        for (int i = 0; i < total; i++) keys[i] = (clips[i][0] << 30) + clips[i][1];
        Arrays.sort(keys);
        long need = 0, count = 0;
        int i = 0;
        boolean possible = true;
        while (need < T) {
            long best = need;
            while (i < total && (keys[i] >> 30) <= need) {
                best = Math.max(best, keys[i] & ((1L << 30) - 1));
                i++;
            }
            if (best == need) {
                possible = false;
                break;
            }
            count++;
            need = best;
        }
        System.out.println(possible ? count : -1);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The clips are sorted by start. While the covered time is below T, the clip that starts within the covered part and ends last is chosen; if no clip extends the coverage, the answer is -1.'], complexity: 'Time O(n log n), space O(1) extra.' },
    solve(input) {
      const [n, T] = nums(rows(input)[0]); const clips = pairsOf(input, 1, n).sort((x, y) => x[0] - y[0]); // prefix maxima of the ends and a binary search for the jump from every point
      const pm = []; let m = 0; for (const [, e] of clips) { m = Math.max(m, e); pm.push(m); } const reach = (x) => { let lo = 0, hi = n; while (lo < hi) { const mid = (lo + hi) >> 1; if (clips[mid][0] <= x) lo = mid + 1; else hi = mid; } return lo === 0 ? x : Math.max(x, pm[lo - 1]); }; let need = 0, count = 0; while (need < T) { const nx = reach(need); if (nx <= need) return '-1'; need = nx; count++; } return String(count);
    },
    tests() {
      const g = rng(3066); const out = ['6 10\n0 2\n4 6\n8 10\n1 9\n1 5\n5 9\n', '2 5\n0 1\n2 5\n', '1 1\n0 1\n', '1 3\n1 4\n'];
      const make = (n, T, hi, len) => `${n} ${T}\n${many(n, () => { const s = randInt(g, 0, hi - 1); return `${s} ${randInt(g, s + 1, Math.min(hi, s + len))}`; }).join('\n')}\n`;
      const brute = (input) => { const [n, T] = nums(rows(input)[0]); const clips = pairsOf(input, 1, n); let best = Infinity; for (let mask = 1; mask < (1 << n); mask++) { const chosen = []; for (let i = 0; i < n; i++) if (mask >> i & 1) chosen.push(clips[i]); chosen.sort((x, y) => x[0] - y[0]); let reach = 0, ok = true; for (const [s, e] of chosen) { if (s > reach) { ok = false; break; } reach = Math.max(reach, e); } if (ok && reach >= T) best = Math.min(best, chosen.length); } return String(best === Infinity ? -1 : best); };
      crossCheck(() => { const T = randInt(g, 1, 9); return make(randInt(g, 1, 8), T, 10, 5); }, (i) => this.solve(i), brute, 800);
      const chain = (n, T) => { const clips = []; for (let i = 0; i < n; i++) clips.push([Math.floor((i * T) / n), Math.min(T, Math.floor(((i + 2) * T) / n))]); return `${n} ${T}\n${lines(shuffle(g, clips))}\n`; };
      for (const [n, T, hi, len] of [[10, 20, 25, 10], [100, 1000, 1000, 100], [1000, 100000, 100000, 500], [30000, 1000000000, 1000000000, 1000000], [30000, 1000000, 1000000, 100], [30000, 100000, 100000, 100], [30000, 1000000000, 1000000000, 100000], [29999, 1000, 1000, 1]]) out.push(make(n, T, hi, len));
      out.push(chain(30000, 1000000000), chain(30000, 30000), `30000 1000000000\n${many(30000, () => '0 1000000000').join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `L` and `q`: the number of cells in a row and the number of additions.', 'The second line has `q` numbers: the cells that are filled one by one (a cell may be filled more than once).'],
    constraints: ['1 <= L <= 10^6', '1 <= q <= 30000', '1 <= each cell <= L'],
    slug: 'blocks-after-each-addition',
    title: 'Blocks of Filled Cells After Each Addition',
    tags: ['intervals', 'union-find', 'simulation', 'online'],
    concept: {
      title: 'Store the block length at both ends of every block, so a new cell can join its neighbours in constant time',
      body: [
        'A row has `L` cells, all empty at first. Cells are filled one at a time. A *block* is a maximal group of neighbouring filled cells. After **every** filling, print how many blocks there are and how long the **longest** block is. For `L = 10` and the cells `5 2 4 3 3` the blocks are: after `5`: 1 block, longest 1; after `2`: 2 blocks, longest 1; after `4`: 2 blocks (`2` and `4-5`), longest 2; after `3`: 1 block `2-5`, longest 4; after the second `3`: nothing changes.',
        'Let `length[x]` be the length of the block when `x` is one of its two **end** cells. When a new cell `x` is filled, its left neighbour `x-1` (if filled) is the right end of a block of length `left = length[x-1]`, and `x+1` is the left end of a block of length `right = length[x+1]`; both are 0 if the cell is empty. The new block has the length `total = left + right + 1`, and it begins at `x - left` and ends at `x + right`. We write `total` into **both** of these end cells (and into `x`). The number of blocks changes by `1 - (left > 0) - (right > 0)`: a new block appears, and each existing neighbour block disappears into it.',
        { code: 'length = [0] * (L + 2)\nblocks = longest = 0\nfor x in cells:\n    if length[x] == 0:                      # a new cell\n        left, right = length[x - 1], length[x + 1]\n        total = left + right + 1\n        length[x - left] = length[x + right] = length[x] = total\n        blocks += 1 - (left > 0) - (right > 0)\n        longest = max(longest, total)\n    # print blocks and longest after this step' },
        'Values inside a block may be out of date, but they are never read: we only read the cells next to the new cell, and those are always block ends with correct values. An already filled cell has `length[x] > 0`, so repeated additions are ignored. Each addition costs O(1). (A union-find structure with sizes gives the same answers in almost O(1).)'
      ]
    },
    statement: ['A row of `L` empty cells is given, and `q` cells are filled one after another (a cell can be filled again, which changes nothing). After each filling print the number of blocks of consecutive filled cells and the length of the longest block. Print two lines: the first has the `q` numbers of blocks, the second has the `q` longest lengths.'],
    outputFormat: ['The first line has `q` numbers: the number of blocks after each filling.', 'The second line has `q` numbers: the length of the longest block after each filling.'],
    examples: [{ input: '10 5\n5 2 4 3 3\n', note: 'Blocks: 1 2 2 1 1; longest: 1 1 2 4 4.' }],
    hints: ['A new cell can merge up to two blocks.', 'Keep the block length at the ends of each block.', 'The number of blocks changes by 1 minus the number of neighbouring filled cells.'],
    program: {
      io: ['L:int q:int', 'cells:int[q]'],
      fast: true,
      python: r`
        length = [0] * (L + 2)
        blocks = longest = 0
        blocks_out = []
        longest_out = []
        for x in cells:
            if length[x] == 0:
                left = length[x - 1]
                right = length[x + 1]
                total = left + right + 1
                length[x - left] = total
                length[x + right] = total
                length[x] = total
                blocks += 1 - (1 if left > 0 else 0) - (1 if right > 0 else 0)
                if total > longest:
                    longest = total
            blocks_out.append(blocks)
            longest_out.append(longest)
        print(*blocks_out)
        print(*longest_out)`,
      cpp: r`
        vector<int> length(L + 2, 0);
        long long blocks = 0, longest = 0;
        string blocksOut, longestOut;
        for (long long t = 0; t < q; t++) {
            long long x = cells[t];
            if (length[x] == 0) {
                long long left = length[x - 1], right = length[x + 1];
                long long total = left + right + 1;
                length[x - left] = (int)total;
                length[x + right] = (int)total;
                length[x] = (int)total;
                blocks += 1 - (left > 0 ? 1 : 0) - (right > 0 ? 1 : 0);
                longest = max(longest, total);
            }
            blocksOut += (t ? " " : "") + to_string(blocks);
            longestOut += (t ? " " : "") + to_string(longest);
        }
        cout << blocksOut << "\n" << longestOut << "\n";`,
      java: r`
        int[] length = new int[(int) L + 2];
        long blocks = 0, longest = 0;
        StringBuilder blocksOut = new StringBuilder();
        StringBuilder longestOut = new StringBuilder();
        for (int t = 0; t < q; t++) {
            int x = (int) cells[t];
            if (length[x] == 0) {
                int left = length[x - 1], right = length[x + 1];
                int total = left + right + 1;
                length[x - left] = total;
                length[x + right] = total;
                length[x] = total;
                blocks += 1 - (left > 0 ? 1 : 0) - (right > 0 ? 1 : 0);
                longest = Math.max(longest, total);
            }
            if (t > 0) {
                blocksOut.append(" ");
                longestOut.append(" ");
            }
            blocksOut.append(blocks);
            longestOut.append(longest);
        }
        System.out.println(blocksOut);
        System.out.println(longestOut);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['The length of every block is stored at both of its end cells; a new cell reads the lengths of its two neighbours, writes the merged length at the new ends, and updates the number of blocks and the longest length.'], complexity: 'Time O(L + q), space O(L).' },
    solve(input) {
      const [L, q] = nums(rows(input)[0]); const cells = nums(rows(input)[1]); // union-find with sizes
      const parent = new Int32Array(L + 2); const size = new Int32Array(L + 2); const filled = new Uint8Array(L + 2); for (let i = 0; i < L + 2; i++) parent[i] = i; const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
      let blocks = 0, longest = 0; const bo = [], lo = []; for (const x of cells) { if (!filled[x]) { filled[x] = 1; size[x] = 1; blocks++; for (const y of [x - 1, x + 1]) if (filled[y]) { const a = find(x), b = find(y); if (a !== b) { parent[a] = b; size[b] += size[a]; blocks--; } } longest = Math.max(longest, size[find(x)]); } bo.push(blocks); lo.push(longest); } return bo.join(' ') + '\n' + lo.join(' ');
    },
    tests() {
      const g = rng(3067); const out = ['10 5\n5 2 4 3 3\n', '1 1\n1\n', '5 5\n1 2 3 4 5\n', '5 5\n5 4 3 2 1\n', '5 5\n1 3 5 2 4\n'];
      const make = (L, q) => `${L} ${q}\n${randArray(g, q, 1, L).join(' ')}\n`;
      const brute = (input) => { const [L, q] = nums(rows(input)[0]); const cells = nums(rows(input)[1]); const filled = new Array(L + 2).fill(false); const bo = [], lo = []; for (const x of cells) { filled[x] = true; let blocks = 0, longest = 0, run = 0; for (let i = 1; i <= L + 1; i++) { if (i <= L && filled[i]) run++; else { if (run > 0) { blocks++; longest = Math.max(longest, run); } run = 0; } } bo.push(blocks); lo.push(longest); } return bo.join(' ') + '\n' + lo.join(' '); };
      crossCheck(() => { const L = randInt(g, 1, 12); return make(L, randInt(g, 1, 14)); }, (i) => this.solve(i), brute, 800);
      for (const [L, q] of [[20, 30], [100, 100], [1000, 3000], [1000000, 30000], [30000, 30000], [40000, 30000], [1000000, 30000], [500000, 29999]]) out.push(make(L, q));
      out.push(`1000000 30000\n${many(30000, (i) => i + 1).join(' ')}\n`, `1000000 30000\n${many(30000, (i) => 1000000 - i).join(' ')}\n`, `60000 30000\n${many(30000, (i) => (i < 15000 ? 2 * i + 1 : 2 * (i - 15000) + 2)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of ranges.', 'Each of the next `n` lines has two numbers `s` and `e`: the start and the end of a range.'],
    constraints: ['1 <= n <= 30000', '0 <= s < e <= 10^9'],
    slug: 'next-range-after-each-range',
    title: 'The Next Range That Starts After Each Range Ends',
    tags: ['intervals', 'sorting', 'binary-search', 'two-pointers'],
    concept: {
      title: 'Sort the starts once, then find for every end the first start that is not smaller',
      body: [
        'You are given `n` ranges numbered from 1. For every range `i`, look for its **right neighbour**: the range `j` whose start is **at least the end of `i`** and whose start is the **smallest** such. If several ranges have that same smallest start, choose the one with the **smallest number**. Print the number of the right neighbour for every range, or -1 if there is none. For the ranges `1-2, 3-4, 2-3` the answers are `3 -1 2`: after the range 1 ends at 2, the range 3 starts at 2; after the range 3 ends at 3, the range 2 starts at 3; nothing starts at or after 4.',
        'The query is "the first start that is `>= e`" over a fixed collection of starts, a typical job for **sorting plus binary search**. Make the list of pairs `(start, number)` and sort it (the tie on equal starts is broken by the number automatically). For each range, binary-search the first pair whose start is at least `e`: the *lower bound* of `e`. Because the pairs with the same start are sorted by number, the first one found has the smallest number.',
        { code: 'from bisect import bisect_left\norder = sorted(range(n), key=lambda i: (ranges[i][0], i))\nstarts = [ranges[i][0] for i in order]\nanswer = []\nfor s, e in ranges:\n    k = bisect_left(starts, e)            # the first start >= e\n    answer.append(order[k] + 1 if k < n else -1)\nprint(*answer)' },
        'The sort is O(n log n) and every query is a binary search in O(log n), so the total is O(n log n). If the queries are also sorted by `e`, a single moving pointer replaces the binary search, which gives the same complexity because of the sorting but only one pass over the starts.'
      ]
    },
    statement: ['`n` ranges are given, numbered from 1. For every range `i` find the range `j` whose start is at least the end of the range `i` and is the smallest among such starts (if several ranges have this start, take the one with the smallest number). Print the numbers `j` for `i = 1..n`, or -1 where no such range exists.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    examples: [{ input: '3\n1 2\n3 4\n2 3\n', note: 'The answers are 3 -1 2.' }],
    hints: ['Sort the pairs (start, number).', 'For each end, find the first pair with start >= end.', 'Equal starts are already ordered by the number, so the first one is the answer.'],
    program: {
      io: ['n:int', 'ranges:int[n][2]'],
      fast: true,
      helpers: { python: 'from bisect import bisect_left', cpp: '', java: '' },
      python: r`
        order = sorted(range(n), key=lambda i: (ranges[i][0], i))
        starts = [ranges[i][0] for i in order]
        answer = []
        for s, e in ranges:
            k = bisect_left(starts, e)
            answer.append(order[k] + 1 if k < n else -1)
        print(*answer)`,
      cpp: r`
        vector<pair<long long, long long>> sorted_(n);
        for (long long i = 0; i < n; i++) sorted_[i] = make_pair(ranges[i][0], i);
        sort(sorted_.begin(), sorted_.end());
        for (long long i = 0; i < n; i++) {
            auto it = lower_bound(sorted_.begin(), sorted_.end(), make_pair(ranges[i][1], -1LL));
            long long result = (it == sorted_.end()) ? -1 : it->second + 1;
            cout << (i ? " " : "") << result;
        }
        cout << "\n";`,
      java: r`
        int count = (int) n;
        long[] keys = new long[count];
        for (int i = 0; i < count; i++) keys[i] = ranges[i][0] * 65536L + i;
        Arrays.sort(keys);
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < count; i++) {
            long target = ranges[i][1] * 65536L;
            int lo = 0, hi = count;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (keys[mid] < target) lo = mid + 1;
                else hi = mid;
            }
            long result = (lo == count) ? -1 : (keys[lo] % 65536L) + 1;
            if (i > 0) out.append(" ");
            out.append(result);
        }
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The pairs (start, number) are sorted; for every range a binary search finds the first pair whose start is not smaller than the end of the range.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const n = Number(rows(input)[0]); const rg = pairsOf(input, 1, n); // the queries sorted by the end with one moving pointer over the sorted starts
      const byStart = rg.map((x, i) => [x[0], i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); const queries = rg.map((x, i) => [x[1], i]).sort((a, b) => a[0] - b[0]); const ans = new Array(n).fill(-1); let p = 0; for (const [e, i] of queries) { while (p < n && byStart[p][0] < e) p++; ans[i] = p < n ? byStart[p][1] + 1 : -1; } return ans.join(' ');
    },
    tests() {
      const g = rng(3068); const out = ['3\n1 2\n3 4\n2 3\n', '1\n0 5\n', '2\n0 5\n5 9\n', '3\n0 1\n0 1\n1 2\n'];
      const make = (n, hi) => `${n}\n${lines(randPairs(g, n, hi))}\n`;
      const brute = (input) => { const n = Number(rows(input)[0]); const rg = pairsOf(input, 1, n); return rg.map(([, e]) => { let best = -1; for (let j = 0; j < n; j++) { if (rg[j][0] < e) continue; if (best === -1 || rg[j][0] < rg[best][0]) best = j; } return best === -1 ? -1 : best + 1; }).join(' '); };
      crossCheck(() => make(randInt(g, 1, 9), 9), (i) => this.solve(i), brute, 800);
      for (const [n, hi] of [[10, 20], [100, 300], [1000, 100000], [30000, 1000000000], [20000, 1000000000], [30000, 100000], [30000, 50], [29999, 1000000000]]) out.push(make(n, hi));
      out.push(`20000\n${many(20000, (i) => `${i} ${i + 1}`).join('\n')}\n`, `20000\n${many(20000, () => '0 1000000000').join('\n')}\n`, `20000\n${many(20000, (i) => `${20000 - i} ${20001 - i}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, `m` and `d`: the number of free slots of the first person, of the second person, and the length of the meeting.', 'The next `n` lines have two numbers `s` and `e`: the free slots of the first person.', 'The next `m` lines have two numbers `s` and `e`: the free slots of the second person.'],
    constraints: ['1 <= n, m <= 20000', '1 <= d <= 10^9', '0 <= s < e <= 10^9', 'The slots of one person do not overlap (they are not necessarily sorted).'],
    slug: 'earliest-common-slot',
    title: 'The Earliest Time Two People Can Meet for a Given Length',
    tags: ['intervals', 'two-pointers', 'sorting', 'scheduling'],
    concept: {
      title: 'Sort both lists of slots and always move past the slot that ends first',
      body: [
        'Two people each give the time slots when they are free. The slots of one person never overlap. They want to meet for exactly `d` units of time, so the meeting `[x, x + d]` must lie **inside one slot of the first person and inside one slot of the second one**. Find the **earliest** possible `x`. For `d = 12`, the first person\'s slots `10-50, 60-120, 140-210` and the second one\'s `0-15, 60-70` give -1; for `d = 8` and the second one\'s slots `0-15, 60-100`, the earliest meeting is `60 68`.',
        'The common free time of two slots is their **intersection**: from `max(s1, s2)` to `min(e1, e2)`. A meeting of the length `d` fits when `min(e1, e2) - max(s1, s2) >= d`. Sort both lists by the start; since the slots of one person do not overlap, they are also sorted by the end. Use two pointers `i` and `j`. Look at the slots `a[i]` and `b[j]`: if their intersection is long enough, it is the earliest possible meeting (all earlier intersections were too short, and later ones start later). Otherwise **drop the slot that ends first**, because it cannot intersect anything else in a useful way.',
        { code: 'a.sort(); b.sort()\ni = j = 0\nwhile i < n and j < m:\n    lo = max(a[i][0], b[j][0])\n    hi = min(a[i][1], b[j][1])\n    if hi - lo >= d:\n        print(lo, lo + d); break\n    if a[i][1] < b[j][1]: i += 1       # the slot that ends first is finished\n    else: j += 1\nelse:\n    print(-1)' },
        'Each step advances one of the pointers, so the walk takes O(n + m) after the two sorts, O(n log n + m log m) in total. This "advance the one that ends first" rule is the same one used to intersect two sorted lists of ranges.'
      ]
    },
    statement: ['Two people have lists of free slots `[s, e]`; the slots of one person do not overlap. They want to meet for `d` units of time inside a slot of each person. Print the earliest start `x` and the end `x + d` of such a meeting (two numbers), or -1 if they cannot meet.'],
    outputFormat: ['Print `x` and `x + d` separated by a space, or -1.'],
    examples: [{ input: '3 2 8\n10 50\n60 120\n140 210\n0 15\n60 100\n', note: 'The slots 60-120 and 60-100 intersect in 60-100: the meeting 60 68.' }, { input: '3 2 12\n10 50\n60 120\n140 210\n0 15\n60 70\n', note: 'The intersections are 10-15 and 60-70, both shorter than 12: -1.' }],
    hints: ['Sort both lists by the start.', 'The common time of two slots is [max of starts, min of ends].', 'If the common time is too short, drop the slot that ends first.'],
    program: {
      io: ['n:int m:int d:int', 'a:int[n][2]', 'b:int[m][2]'],
      fast: true,
      python: r`
        a.sort()
        b.sort()
        i = j = 0
        answer = "-1"
        while i < n and j < m:
            lo = max(a[i][0], b[j][0])
            hi = min(a[i][1], b[j][1])
            if hi - lo >= d:
                answer = str(lo) + " " + str(lo + d)
                break
            if a[i][1] < b[j][1]:
                i += 1
            else:
                j += 1
        print(answer)`,
      cpp: r`
        sort(a.begin(), a.end());
        sort(b.begin(), b.end());
        long long i = 0, j = 0;
        string answer = "-1";
        while (i < n && j < m) {
            long long lo = max(a[i][0], b[j][0]);
            long long hi = min(a[i][1], b[j][1]);
            if (hi - lo >= d) {
                answer = to_string(lo) + " " + to_string(lo + d);
                break;
            }
            if (a[i][1] < b[j][1]) i++;
            else j++;
        }
        cout << answer << "\n";`,
      java: r`
        int na = (int) n, nb = (int) m;
        long[] ka = new long[na];
        long[] kb = new long[nb];
        for (int x = 0; x < na; x++) ka[x] = (a[x][0] << 30) + a[x][1];
        for (int x = 0; x < nb; x++) kb[x] = (b[x][0] << 30) + b[x][1];
        Arrays.sort(ka);
        Arrays.sort(kb);
        long mask = (1L << 30) - 1;
        int i = 0, j = 0;
        String answer = "-1";
        while (i < na && j < nb) {
            long sa = ka[i] >> 30, ea = ka[i] & mask;
            long sb = kb[j] >> 30, eb = kb[j] & mask;
            long lo = Math.max(sa, sb);
            long hi = Math.min(ea, eb);
            if (hi - lo >= d) {
                answer = lo + " " + (lo + d);
                break;
            }
            if (ea < eb) i++;
            else j++;
        }
        System.out.println(answer);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['Both lists are sorted by start; the two pointers compare the intersection of the current slots with the needed length and, if it is too short, skip the slot that ends first.'], complexity: 'Time O(n log n + m log m), space O(1) extra.' },
    solve(input) {
      const [n, m, d] = nums(rows(input)[0]); const a = pairsOf(input, 1, n), b = pairsOf(input, 1 + n, m).sort((x, y) => x[0] - y[0]); // for every slot of the first person find the second person's slots that overlap it by binary search
      let best = Infinity; for (const [s, e] of a) { let lo = 0, hi = m; while (lo < hi) { const mid = (lo + hi) >> 1; if (b[mid][1] > s) hi = mid; else lo = mid + 1; } for (let k = lo; k < m && b[k][0] < e; k++) { const start = Math.max(s, b[k][0]); const end = Math.min(e, b[k][1]); if (end - start >= d) { best = Math.min(best, start); break; } } } return best === Infinity ? '-1' : `${best} ${best + d}`;
    },
    tests() {
      const g = rng(3069); const out = ['3 2 8\n10 50\n60 120\n140 210\n0 15\n60 100\n', '3 2 12\n10 50\n60 120\n140 210\n0 15\n60 70\n', '1 1 1\n0 1\n0 1\n', '1 1 2\n0 1\n0 1\n'];
      const slots = (count, step) => shuffle(g, disjointRanges(g, count, step).map(([l, rr]) => [l, rr + 1]));
      const make = (n, m, d, step) => `${n} ${m} ${d}\n${lines(slots(n, step))}\n${lines(slots(m, step))}\n`;
      const brute = (input) => { const [n, m, d] = nums(rows(input)[0]); const a = pairsOf(input, 1, n), b = pairsOf(input, 1 + n, m); for (let x = 0; x <= 40; x++) { if (a.some(([s, e]) => s <= x && x + d <= e) && b.some(([s, e]) => s <= x && x + d <= e)) return `${x} ${x + d}`; } return '-1'; };
      crossCheck(() => make(randInt(g, 1, 4), randInt(g, 1, 4), randInt(g, 1, 5), 4), (i) => this.solve(i), brute, 800);
      for (const [n, m, d, step] of [[10, 10, 5, 100], [100, 100, 30, 1000], [1000, 1000, 1000, 100000], [15000, 15000, 100, stepFor(15000)], [15000, 15000, 5000, stepFor(15000)], [15000, 15000, 40000, stepFor(15000)], [20000, 100, 10, stepFor(20000)], [1, 15000, 3, stepFor(15000)]]) out.push(make(n, m, d, step));
      return out;
    }
  }
];
