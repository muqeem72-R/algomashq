import { r, rng, randInt, randArray, many, nums, rows, randWord, shuffle } from '../../lib.mjs';

// Runs fast(input) against a slow, independent computation on many small random inputs; throws when they differ.
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const popcount = (m) => { let c = 0; while (m) { m &= m - 1; c++; } return c; };

export default [
  {
    slug: 'smallest-sufficient-team',
    title: 'The Smallest Team That Knows Every Skill',
    difficulty: 'hard',
    tags: ['backtracking', 'bitmask', 'set-cover', 'pruning'],
    concept: {
      title: 'Take the first skill nobody covers yet and try only people who have it',
      body: [
        'A project needs `s` skills and there are `p` people, each with some of the skills. Find the smallest team that together has **all** the skills. Each person is a bit mask of skills, and the team so far is the OR of its members\' masks (`covered`). This is the *set cover* problem: no fast general method is known, but a clever search is enough for small sizes.',
        'The key idea: look at the **first skill that is not covered yet**. Some member of the final team **must** have it, so it is enough to try, as the next member, each person who has this skill. We never try a person who cannot help with this skill, and the order in which members are added does not matter, so no team is built twice in different orders.',
        { code: 'def search(covered, size):\n    if covered == full:\n        best[0] = min(best[0], size)\n        return\n    if size + 1 >= best[0]:\n        return                              # one more person cannot beat the best team\n    skill = (~covered & (covered + 1)).bit_length() - 1      # lowest uncovered skill\n    for mask in by_skill[skill]:\n        search(covered | mask, size + 1)' },
        'The line `size + 1 >= best[0]` is a **bound**: if a team of `size` people is still incomplete, it needs at least one more member, so it cannot be smaller than `best`. Together with the rule "branch on an uncovered skill" this keeps the search tiny for 12 skills and 20 people.'
      ]
    },
    statement: ['A project needs `s` skills, numbered 1 to `s`. There are `p` people. Each person is described by a string of `s` characters: character `i` is `1` if the person has skill `i`, and `0` otherwise. Every skill is known by at least one person. Print the smallest number of people whose skills together cover all `s` skills.'],
    inputFormat: ['The first line has `s` and `p`.', 'Each of the next `p` lines has the string of one person.'],
    outputFormat: ['Print the size of the smallest team.'],
    constraints: ['1 <= s <= 12', '1 <= p <= 20', 'Every skill is known by at least one person.'],
    examples: [{ input: '4 3\n1100\n0011\n0110\n', note: 'The first two people together know all four skills: the team size is 2.' }],
    hints: ['Store the skills of a person as a bit mask and the team as the OR of the masks.', 'Branch on the first skill that nobody in the team has: the next member must have it.', 'Keep the size of the best team found; stop a branch that cannot be smaller than it.'],
    program: {
      io: ['s:int p:int', 'people:rows[p]'],
      helpers: {
        python: r`
          def search(covered, size, full, by_skill, best):
              if covered == full:
                  best[0] = min(best[0], size)
                  return
              if size + 1 >= best[0]:
                  return
              skill = (~covered & (covered + 1)).bit_length() - 1
              for mask in by_skill[skill]:
                  search(covered | mask, size + 1, full, by_skill, best)`,
        cpp: r`
          void search(int covered, int size, int full, const vector<vector<int>>& bySkill, int& best) {
              if (covered == full) {
                  best = min(best, size);
                  return;
              }
              if (size + 1 >= best) return;
              int skill = __builtin_ctz(~covered & (covered + 1));
              for (int mask : bySkill[skill]) search(covered | mask, size + 1, full, bySkill, best);
          }`,
        java: r`
          static void search(int covered, int size, int full, List<List<Integer>> bySkill, int[] best) {
              if (covered == full) {
                  best[0] = Math.min(best[0], size);
                  return;
              }
              if (size + 1 >= best[0]) return;
              int skill = Integer.numberOfTrailingZeros(~covered & (covered + 1));
              for (int mask : bySkill.get(skill)) search(covered | mask, size + 1, full, bySkill, best);
          }`
      },
      includes: ['<algorithm>'],
      python: r`
        masks = [sum(1 << i for i, ch in enumerate(row) if ch == "1") for row in people]
        by_skill = [[m for m in masks if m >> i & 1] for i in range(s)]
        best = [p + 1]
        search(0, 0, (1 << s) - 1, by_skill, best)
        print(best[0])`,
      cpp: r`
        vector<int> masks;
        for (const string& row : people) {
            int mask = 0;
            for (int i = 0; i < s; i++) {
                if (row[i] == '1') mask |= 1 << i;
            }
            masks.push_back(mask);
        }
        vector<vector<int>> bySkill(s);
        for (int i = 0; i < s; i++) {
            for (int mask : masks) {
                if ((mask >> i) & 1) bySkill[i].push_back(mask);
            }
        }
        int best = (int)p + 1;
        search(0, 0, (1 << s) - 1, bySkill, best);
        cout << best << "\n";`,
      java: r`
        List<Integer> masks = new ArrayList<>();
        for (String row : people) {
            int mask = 0;
            for (int i = 0; i < s; i++) {
                if (row.charAt(i) == '1') mask |= 1 << i;
            }
            masks.add(mask);
        }
        List<List<Integer>> bySkill = new ArrayList<>();
        for (int i = 0; i < s; i++) {
            List<Integer> list = new ArrayList<>();
            for (int mask : masks) {
                if (((mask >> i) & 1) != 0) list.add(mask);
            }
            bySkill.add(list);
        }
        int[] best = {(int) p + 1};
        search(0, 0, (1 << (int) s) - 1, bySkill, best);
        System.out.println(best[0]);`
    },
    solution: { explanation: ['The skills of a team are a bit mask. The search takes the lowest skill not yet covered and tries only the people who have it as the next member; a branch whose size plus one cannot beat the best team is cut.'], complexity: 'Time exponential in the worst case but small here, space O(s).' },
    solve(input) {
      const rs = rows(input); const [s, p] = nums(rs[0]); const masks = rs.slice(1, 1 + p).map((row) => [...row.trim()].reduce((m, ch, i) => (ch === '1' ? m | (1 << i) : m), 0));
      const dp = Array(1 << s).fill(Infinity); dp[0] = 0; for (let mask = 0; mask < 1 << s; mask++) { if (dp[mask] === Infinity) continue; for (const m of masks) dp[mask | m] = Math.min(dp[mask | m], dp[mask] + 1); }
      return String(dp[(1 << s) - 1]);
    },
    tests() {
      const g = rng(680);
      const make = (s, people) => `${s} ${people.length}\n${people.join('\n')}\n`;
      const randomPeople = (s, p, density) => { const m = many(p, () => many(s, () => (g() < density ? '1' : '0'))); for (let i = 0; i < s; i++) if (!m.some((row) => row[i] === '1')) m[randInt(g, 0, p - 1)][i] = '1'; return m.map((row) => row.join('')); };
      return ['4 3\n1100\n0011\n0110\n', '1 1\n1\n', '3 3\n100\n010\n001\n', '3 3\n111\n100\n011\n', make(12, randomPeople(12, 20, 0.2)), make(12, randomPeople(12, 20, 0.3)), make(12, randomPeople(12, 20, 0.15)), make(12, randomPeople(12, 20, 0.1)), make(10, randomPeople(10, 18, 0.25)), make(12, many(12, (i) => '0'.repeat(i) + '1' + '0'.repeat(11 - i))), make(12, [...many(12, (i) => '0'.repeat(i) + '1' + '0'.repeat(11 - i)), '1'.repeat(12)]), make(8, randomPeople(8, 20, 0.4)), make(12, randomPeople(12, 16, 0.18)), make(11, randomPeople(11, 20, 0.12))];
    }
  },

  {
    slug: 'minimum-work-sessions',
    title: 'The Fewest Work Sessions',
    difficulty: 'hard',
    tags: ['backtracking', 'bitmask', 'bin-packing', 'memoization'],
    concept: {
      title: 'The state is the set of finished tasks; keep the best (sessions, load)',
      body: [
        'You have `n` tasks with given durations, and a work session lasts at most `t`. A task must be done completely inside one session. Find the smallest number of sessions. This is *bin packing*: hard in general, but for 14 tasks the state space is small. Whatever order tasks were done in, what matters for the future is only **which tasks are done** (a bit mask), how many sessions were started, and how much time is used in the **last** session.',
        'For every set of done tasks, keep the best pair `(sessions, load)`: fewer sessions is better, and with the same number of sessions, a smaller load in the last session is better (more room left). From a set, add one more task `i`: if it fits into the last session, the load grows; otherwise a new session is opened and the load becomes `a[i]`.',
        { code: 'dp = [(n + 1, 0)] * (1 << n)\ndp[0] = (1, 0)                           # one (empty) session is open\nfor mask in range(1 << n):\n    sessions, load = dp[mask]\n    for i in range(n):\n        if not mask >> i & 1:\n            if load + a[i] <= t:\n                cand = (sessions, load + a[i])      # fits in the last session\n            else:\n                cand = (sessions + 1, a[i])         # open a new session\n            if cand < dp[mask | 1 << i]:\n                dp[mask | 1 << i] = cand\nprint(dp[(1 << n) - 1][0])' },
        'The comparison of two pairs is the comparison of tuples: first the sessions, then the load. Doing the tasks in some order and always keeping the best state for each set of tasks is the idea of **dynamic programming over subsets**: `2^14 * 14` steps instead of the `14!` orders a plain search would explore.'
      ]
    },
    statement: ['There are `n` tasks; task `i` takes `a[i]` units of time and cannot be split. A work session lasts at most `t` units of time. The tasks of one session are done one after another, and a task must be finished inside one session. Print the smallest number of sessions needed to finish all the tasks.'],
    inputFormat: ['The first line has `n` and `t`.', 'The second line has the `n` durations.'],
    outputFormat: ['Print the number of sessions.'],
    constraints: ['1 <= n <= 14', '1 <= a[i] <= t <= 100'],
    examples: [{ input: '3 5\n1 2 3\n', note: 'The tasks 2 and 3 fill one session of length 5, and the task 1 goes into a second session. One session is not enough because the total is 6.' }],
    hints: ['Describe the state by the set of finished tasks (a bit mask).', 'For every state keep the pair (number of sessions, load of the last session) and prefer the smaller pair.', 'Adding a task either fits in the last session or opens a new one.'],
    program: {
      io: ['n:int t:int', 'a:int[n]'],
      python: r`
        dp = [(n + 1, 0)] * (1 << n)
        dp[0] = (1, 0)
        for mask in range(1 << n):
            sessions, load = dp[mask]
            for i in range(n):
                if not mask >> i & 1:
                    if load + a[i] <= t:
                        cand = (sessions, load + a[i])
                    else:
                        cand = (sessions + 1, a[i])
                    if cand < dp[mask | 1 << i]:
                        dp[mask | 1 << i] = cand
        print(dp[(1 << n) - 1][0])`,
      cpp: r`
        int full = (1 << n) - 1;
        vector<int> sessions(full + 1, (int)n + 1), load(full + 1, 0);
        sessions[0] = 1;
        for (int mask = 0; mask <= full; mask++) {
            for (int i = 0; i < n; i++) {
                if ((mask >> i) & 1) continue;
                int ns, nl;
                if (load[mask] + a[i] <= t) {
                    ns = sessions[mask];
                    nl = load[mask] + (int)a[i];
                } else {
                    ns = sessions[mask] + 1;
                    nl = (int)a[i];
                }
                int to = mask | (1 << i);
                if (ns < sessions[to] || (ns == sessions[to] && nl < load[to])) {
                    sessions[to] = ns;
                    load[to] = nl;
                }
            }
        }
        cout << sessions[full] << "\n";`,
      java: r`
        int full = (1 << (int) n) - 1;
        int[] sessions = new int[full + 1];
        int[] load = new int[full + 1];
        Arrays.fill(sessions, (int) n + 1);
        sessions[0] = 1;
        for (int mask = 0; mask <= full; mask++) {
            for (int i = 0; i < n; i++) {
                if (((mask >> i) & 1) != 0) continue;
                int ns, nl;
                if (load[mask] + a[i] <= t) {
                    ns = sessions[mask];
                    nl = load[mask] + (int) a[i];
                } else {
                    ns = sessions[mask] + 1;
                    nl = (int) a[i];
                }
                int to = mask | (1 << i);
                if (ns < sessions[to] || (ns == sessions[to] && nl < load[to])) {
                    sessions[to] = ns;
                    load[to] = nl;
                }
            }
        }
        System.out.println(sessions[full]);`
    },
    solution: { explanation: ['For each set of finished tasks, the best pair (sessions, load of the last session) is kept. Adding a task either fits in the last session or starts a new one. The answer is the session count of the full set.'], complexity: 'Time O(2^n * n), space O(2^n).' },
    solve(input) {
      const rs = rows(input); const [n, t] = nums(rs[0]); const a = nums(rs[1]);
      let best = n; const loads = []; // backtracking over bins: independent of the subset table
      const go = (i) => { if (loads.length >= best) return; if (i === n) { best = Math.min(best, loads.length); return; } const seen = new Set(); for (let b = 0; b < loads.length; b++) if (loads[b] + a[i] <= t && !seen.has(loads[b])) { seen.add(loads[b]); loads[b] += a[i]; go(i + 1); loads[b] -= a[i]; } loads.push(a[i]); go(i + 1); loads.pop(); };
      const order = a.slice().sort((x, y) => y - x); const saved = a.slice(); a.splice(0, a.length, ...order); go(0); a.splice(0, a.length, ...saved);
      return String(best);
    },
    tests() {
      const g = rng(681);
      const make = (t, a) => `${a.length} ${t}\n${a.join(' ')}\n`;
      const subsetDp = (t, a) => { const n = a.length; const dp = Array(1 << n).fill([n + 1, 0]); dp[0] = [1, 0]; for (let mask = 0; mask < 1 << n; mask++) { const [s, l] = dp[mask]; for (let i = 0; i < n; i++) if (!((mask >> i) & 1)) { const cand = l + a[i] <= t ? [s, l + a[i]] : [s + 1, a[i]]; const cur = dp[mask | (1 << i)]; if (cand[0] < cur[0] || (cand[0] === cur[0] && cand[1] < cur[1])) dp[mask | (1 << i)] = cand; } } return dp[(1 << n) - 1][0]; };
      crossCheck(() => { const t = randInt(g, 5, 20); return make(t, randArray(g, randInt(g, 1, 9), 1, t)); }, (i) => this.solve(i), (i) => { const rs = rows(i); const [, t] = nums(rs[0]); return subsetDp(t, nums(rs[1])); });
      return ['3 5\n1 2 3\n', '1 1\n1\n', '1 100\n100\n', '2 4\n2 2\n', '3 3\n2 2 2\n', make(100, many(14, () => 100)), make(100, many(14, () => 1)), make(100, many(14, () => 51)), make(100, many(14, (i) => 30 + (i % 3))), make(100, randArray(g, 14, 1, 100)), make(10, randArray(g, 14, 1, 10)), make(100, randArray(g, 14, 20, 60)), make(50, many(14, (i) => 10 + (i % 7) * 5)), make(97, randArray(g, 13, 10, 90)), make(100, [51, 51, 51, 50, 50, 50, 49, 49, 49, 48, 48, 48, 47, 47])];
    }
  },

  {
    slug: 'closest-subset-sum',
    title: 'The Subset Sum Closest to a Goal',
    difficulty: 'hard',
    tags: ['backtracking', 'meet-in-the-middle', 'sorting'],
    concept: {
      title: 'Split the list in two halves: 2^17 + 2^17 instead of 2^34',
      body: [
        'Choose some of `n` numbers (negative numbers are possible) so that their sum is as close as possible to a goal `g`. Trying all `2^n` subsets is hopeless for `n = 34` (more than 10^10). **Meet in the middle** splits the numbers into two halves of 17 numbers. Each half has only `2^17 = 131072` subset sums, easy to list. A subset of the whole list is a subset of the left half joined with a subset of the right half, so its sum is `left sum + right sum`.',
        'For each left sum `x` we need the right sum `y` that makes `x + y` closest to `g`: that is the right sum **nearest to `g - x`**. If the right sums are **sorted**, this can be found by binary search, or by two pointers when the left sums are sorted as well (as `x` grows, `g - x` shrinks, so the pointer only moves down).',
        { code: 'def all_sums(a):\n    sums = [0]\n    for x in a:\n        sums += [s + x for s in sums]      # each number: leave it, or add it\n    return sums\n\nleft = sorted(all_sums(a[:half]))\nright = sorted(all_sums(a[half:]))\nbest = None\nj = len(right) - 1\nfor x in left:\n    while j > 0 and x + right[j] > g:\n        j -= 1                              # right[j]: the largest sum with x + y <= g\n    for k in (j, j + 1):\n        if k < len(right):\n            d = abs(x + right[k] - g)\n            best = d if best is None else min(best, d)' },
        'The work drops from `2^34` to about `2 * 2^17 * log` steps: the square root of the brute force. Splitting a search space into two halves that are combined cleverly is a standard way to double the size of a problem that can be solved exactly.'
      ]
    },
    statement: ['Given `n` integers (possibly negative) and a goal `g`, choose any subset of the integers (the empty subset is allowed, with sum 0) so that the absolute difference between the sum of the subset and `g` is as small as possible. Print this smallest difference.'],
    inputFormat: ['The first line has `n` and `g`.', 'The second line has the `n` integers.'],
    outputFormat: ['Print the smallest absolute difference.'],
    constraints: ['1 <= n <= 34', '-10^7 <= each integer <= 10^7', '-10^9 <= g <= 10^9'],
    examples: [{ input: '3 -7\n5 -7 3\n', note: 'The subset {-7} has the sum -7 exactly, so the difference is 0.' }],
    hints: ['Split the numbers into two halves and list all subset sums of each half.', 'Sort the sums of the right half.', 'For every left sum look for the right sum nearest to the goal minus the left sum, from both sides.'],
    program: {
      io: ['n:int g:int', 'a:int[n]'],
      fast: true,
      includes: ['<algorithm>', '<cstdlib>'],
      helpers: {
        python: r`
          def all_sums(a):
              sums = [0]
              for x in a:
                  sums += [s + x for s in sums]
              return sums`,
        cpp: r`
          vector<long long> allSums(const vector<long long>& a, size_t from, size_t to) {
              vector<long long> sums = {0};
              for (size_t i = from; i < to; i++) {
                  size_t size = sums.size();
                  for (size_t k = 0; k < size; k++) sums.push_back(sums[k] + a[i]);
              }
              return sums;
          }`,
        java: r`
          static long[] allSums(long[] a, int from, int to) {
              long[] sums = new long[1 << (to - from)];
              int size = 1;
              for (int i = from; i < to; i++) {
                  for (int k = 0; k < size; k++) sums[size + k] = sums[k] + a[i];
                  size *= 2;
              }
              return sums;
          }`
      },
      python: r`
        half = n // 2
        left = sorted(all_sums(a[:half]))
        right = sorted(all_sums(a[half:]))
        best = abs(g)
        j = len(right) - 1
        for x in left:
            while j > 0 and x + right[j] > g:
                j -= 1
            for k in (j, j + 1):
                if k < len(right):
                    best = min(best, abs(x + right[k] - g))
        print(best)`,
      cpp: r`
        size_t half = n / 2;
        vector<long long> left = allSums(a, 0, half), right = allSums(a, half, n);
        sort(left.begin(), left.end());
        sort(right.begin(), right.end());
        long long best = llabs(g);
        long long j = (long long)right.size() - 1;
        for (long long x : left) {
            while (j > 0 && x + right[j] > g) j--;
            for (long long k = j; k <= j + 1; k++) {
                if (k < (long long)right.size()) best = min(best, llabs(x + right[k] - g));
            }
        }
        cout << best << "\n";`,
      java: r`
        int half = (int) n / 2;
        long[] left = allSums(a, 0, half), right = allSums(a, half, (int) n);
        Arrays.sort(left);
        Arrays.sort(right);
        long best = Math.abs(g);
        int j = right.length - 1;
        for (long x : left) {
            while (j > 0 && x + right[j] > g) j--;
            for (int k = j; k <= j + 1; k++) {
                if (k < right.length) best = Math.min(best, Math.abs(x + right[k] - g));
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Both halves list their subset sums; the right list is sorted. For each left sum, the two-pointer (or binary search) position in the right list gives the nearest sums on both sides of `g - x`, and the smallest difference is kept.'], complexity: 'Time O(2^(n/2) * n), space O(2^(n/2)).' },
    solve(input) {
      const rs = rows(input); const [n, g] = nums(rs[0]); const a = nums(rs[1]); const half = Math.floor(n / 2);
      const sums = (arr) => { let s = [0]; for (const x of arr) s = s.concat(s.map((v) => v + x)); return s; };
      const left = sums(a.slice(0, half)); const right = sums(a.slice(half)).sort((p, q) => p - q);
      let best = Math.abs(g);
      for (const x of left) { let lo = 0, hi = right.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (x + right[mid] < g) lo = mid + 1; else hi = mid; } for (const k of [lo - 1, lo]) if (k >= 0 && k < right.length) best = Math.min(best, Math.abs(x + right[k] - g)); }
      return String(best);
    },
    tests() {
      const g = rng(682);
      const make = (goal, a) => `${a.length} ${goal}\n${a.join(' ')}\n`;
      const brute = (goal, a) => { let best = Infinity; for (let mask = 0; mask < 1 << a.length; mask++) { let s = 0; for (let i = 0; i < a.length; i++) if ((mask >> i) & 1) s += a[i]; best = Math.min(best, Math.abs(s - goal)); } return best; };
      crossCheck(() => make(randInt(g, -60, 60), randArray(g, randInt(g, 1, 12), -20, 20)), (i) => this.solve(i), (i) => { const rs = rows(i); return brute(nums(rs[0])[1], nums(rs[1])); });
      return ['3 -7\n5 -7 3\n', '1 0\n5\n', '1 3\n5\n', '2 1000000000\n10000000 10000000\n', make(0, randArray(g, 34, -10000000, 10000000)), make(1000000000, randArray(g, 34, -10000000, 10000000)), make(-1000000000, randArray(g, 34, -10000000, 10000000)), make(123456789, randArray(g, 34, 1000000, 10000000)), make(5000000, randArray(g, 34, -10000000, 10000000)), make(7, randArray(g, 34, 1, 5)), make(-300000000, many(34, () => -10000000)), make(300000000, many(34, () => 10000000)), make(299999999, many(34, () => 10000000)), make(1, randArray(g, 33, -10000000, 10000000)), make(99999999, randArray(g, 34, 5000000, 10000000)), make(-5, randArray(g, 20, -100, 100))];
    }
  },

  {
    slug: 'optimal-account-balancing',
    title: 'Settle the Debts With the Fewest Payments',
    difficulty: 'hard',
    tags: ['backtracking', 'greedy', 'pruning'],
    concept: {
      title: 'Clear the first person with one payment, and try every possible partner',
      body: [
        'People lend money to each other, and we only care about the **net balance** of each person: the coins they received minus the coins they gave. A balance of 0 is already settled. The others must be settled by new payments, each between two people, and we want **as few payments as possible**. A payment between a person with a positive balance and a person with a negative balance moves coins from one to the other, and brings both balances closer to zero.',
        'Take the **first** person with a nonzero balance. Some payment must settle them, so try, one after the other, every later person with the opposite sign, and imagine that the first person\'s whole balance is moved onto that partner (one payment). The first person is now settled, and the problem has one person less:',
        { code: 'def settle(debts, start):\n    while start < len(debts) and debts[start] == 0:\n        start += 1\n    if start == len(debts):\n        return 0\n    best = 10 ** 9\n    seen = set()\n    for j in range(start + 1, len(debts)):\n        if debts[j] * debts[start] < 0 and debts[j] not in seen:\n            seen.add(debts[j])                  # partners with the same balance are the same choice\n            debts[j] += debts[start]            # one payment settles the first person\n            best = min(best, 1 + settle(debts, start + 1))\n            debts[j] -= debts[start]\n    return best' },
        'The set `seen` is a pruning: two partners with the same balance lead to the same situation, so only one of them is tried. The people with balance 0 are dropped first. The result is the number of nonzero people minus the largest number of groups of people whose balances add up to 0 inside the group.'
      ]
    },
    statement: ['`p` people lend money to each other. Each of the `m` records says that person `a` gave `z` coins to person `b`. After all records, some people are owed money and some owe money. Everyone can be settled with new payments, each payment moving some coins from one person to another. Print the smallest number of payments that makes everybody\'s balance zero.'],
    inputFormat: ['The first line has `p` and `m`.', 'Each of the next `m` lines has `a`, `b` and `z`.'],
    outputFormat: ['Print the smallest number of payments.'],
    constraints: ['2 <= p <= 12, 1 <= m <= 30', '1 <= a, b <= p and a != b', '1 <= z <= 100'],
    examples: [{ input: '3 3\n1 2 10\n2 3 5\n3 1 5\n', note: 'The balances (received minus given) are -5, +5 and 0, so one payment of 5 between persons 1 and 2 settles everything.' }],
    hints: ['Compute the net balance of every person and keep only the nonzero ones.', 'Take the first nonzero balance and try to move it onto each later person with the opposite sign.', 'Do not try two partners with the same balance; stop a branch that cannot be better than the best.'],
    program: {
      io: ['p:int m:int', 'tx:int[m][3]'],
      includes: ['<set>', '<algorithm>'],
      helpers: {
        python: r`
          def settle(debts, start):
              while start < len(debts) and debts[start] == 0:
                  start += 1
              if start == len(debts):
                  return 0
              best = 10 ** 9
              seen = set()
              for j in range(start + 1, len(debts)):
                  if debts[j] * debts[start] < 0 and debts[j] not in seen:
                      seen.add(debts[j])
                      debts[j] += debts[start]
                      best = min(best, 1 + settle(debts, start + 1))
                      debts[j] -= debts[start]
              return best`,
        cpp: r`
          int settle(vector<long long>& debts, size_t start) {
              while (start < debts.size() && debts[start] == 0) start++;
              if (start == debts.size()) return 0;
              int best = 1000000000;
              set<long long> seen;
              for (size_t j = start + 1; j < debts.size(); j++) {
                  if (debts[j] * debts[start] < 0 && !seen.count(debts[j])) {
                      seen.insert(debts[j]);
                      debts[j] += debts[start];
                      best = min(best, 1 + settle(debts, start + 1));
                      debts[j] -= debts[start];
                  }
              }
              return best;
          }`,
        java: r`
          static int settle(long[] debts, int start) {
              while (start < debts.length && debts[start] == 0) start++;
              if (start == debts.length) return 0;
              int best = 1000000000;
              Set<Long> seen = new HashSet<>();
              for (int j = start + 1; j < debts.length; j++) {
                  if (debts[j] * debts[start] < 0 && !seen.contains(debts[j])) {
                      seen.add(debts[j]);
                      debts[j] += debts[start];
                      best = Math.min(best, 1 + settle(debts, start + 1));
                      debts[j] -= debts[start];
                  }
              }
              return best;
          }`
      },
      python: r`
        bal = [0] * p
        for a, b, z in tx:
            bal[a - 1] -= z
            bal[b - 1] += z
        debts = [x for x in bal if x != 0]
        print(settle(debts, 0))`,
      cpp: r`
        vector<long long> bal(p, 0);
        for (int i = 0; i < m; i++) {
            bal[tx[i][0] - 1] -= tx[i][2];
            bal[tx[i][1] - 1] += tx[i][2];
        }
        vector<long long> debts;
        for (long long x : bal) {
            if (x != 0) debts.push_back(x);
        }
        cout << settle(debts, 0) << "\n";`,
      java: r`
        long[] bal = new long[(int) p];
        for (int i = 0; i < m; i++) {
            bal[(int) tx[i][0] - 1] -= tx[i][2];
            bal[(int) tx[i][1] - 1] += tx[i][2];
        }
        int count = 0;
        for (long x : bal) {
            if (x != 0) count++;
        }
        long[] debts = new long[count];
        int k = 0;
        for (long x : bal) {
            if (x != 0) debts[k++] = x;
        }
        System.out.println(settle(debts, 0));`
    },
    solution: { explanation: ['Balances are computed and zeros dropped. The recursion takes the first nonzero balance and moves it onto each later person of the opposite sign (once per distinct balance), counting one payment, then continues with the next person.'], complexity: 'Time exponential in the number of nonzero balances (at most 12), small in practice.' },
    solve(input) {
      const rs = rows(input); const [p, m] = nums(rs[0]); const bal = Array(p).fill(0);
      for (let i = 1; i <= m; i++) { const [a, b, z] = nums(rs[i]); bal[a - 1] -= z; bal[b - 1] += z; }
      const d = bal.filter((x) => x !== 0); const k = d.length; if (!k) return '0';
      const sum = Array(1 << k).fill(0); for (let mask = 1; mask < 1 << k; mask++) { const low = Math.log2(mask & -mask); sum[mask] = sum[mask & (mask - 1)] + d[low]; }
      const groups = Array(1 << k).fill(0); for (let mask = 1; mask < 1 << k; mask++) { let best = 0; for (let i = 0; i < k; i++) if ((mask >> i) & 1) best = Math.max(best, groups[mask ^ (1 << i)]); groups[mask] = best + (sum[mask] === 0 ? 1 : 0); }
      return String(k - groups[(1 << k) - 1]);
    },
    tests() {
      const g = rng(683);
      const make = (p, tx) => `${p} ${tx.length}\n${tx.map((t) => t.join(' ')).join('\n')}\n`;
      const randomTx = (p, m, hi) => many(m, () => { const a = randInt(g, 1, p); let b = randInt(g, 1, p - 1); if (b >= a) b++; return [a, b, randInt(g, 1, hi)]; });
      const settled = (p, m) => { const tx = []; while (tx.length < m) { const a = randInt(g, 1, p); let b = randInt(g, 1, p - 1); if (b >= a) b++; tx.push([a, b, randInt(g, 1, 20)]); } return tx; };
      const ring = (p) => many(p, (i) => [i + 1, ((i + 1) % p) + 1, 10]);
      const brute = (tx, p) => { const bal = Array(p).fill(0); for (const [a, b, z] of tx) { bal[a - 1] -= z; bal[b - 1] += z; } const d = bal.filter((x) => x !== 0); const go = (i) => { while (i < d.length && d[i] === 0) i++; if (i === d.length) return 0; let best = Infinity; for (let j = i + 1; j < d.length; j++) if (d[j] * d[i] < 0) { d[j] += d[i]; best = Math.min(best, 1 + go(i + 1)); d[j] -= d[i]; } return best; }; return go(0); };
      crossCheck(() => { const p = randInt(g, 2, 7); return make(p, randomTx(p, randInt(g, 1, 8), 10)); }, (i) => this.solve(i), (i) => { const rs = rows(i); const [p, m] = nums(rs[0]); return brute(rs.slice(1, 1 + m).map(nums), p); });
      return ['3 3\n1 2 10\n2 3 5\n3 1 5\n', make(2, [[1, 2, 5]]), make(3, [[1, 2, 5], [2, 1, 5]]), make(12, randomTx(12, 30, 100)), make(12, randomTx(12, 25, 100)), make(12, randomTx(12, 12, 100)), make(12, ring(12)), make(12, settled(12, 20)), make(10, randomTx(10, 30, 5)), make(11, randomTx(11, 20, 3)), make(12, [[1, 2, 10], [3, 4, 10], [5, 6, 10], [7, 8, 10], [9, 10, 10], [11, 12, 10]]), make(12, [[1, 12, 5], [2, 12, 5], [3, 12, 5], [4, 12, 5], [5, 12, 5], [6, 12, 5], [12, 7, 6], [12, 8, 7], [12, 9, 8], [12, 10, 9], [12, 11, 10]]), make(9, randomTx(9, 30, 100)), make(12, randomTx(12, 30, 1))];
    }
  },

  {
    slug: 'shortest-superstring',
    title: 'The Shortest Text That Contains All Words',
    difficulty: 'hard',
    tags: ['backtracking', 'bitmask', 'strings', 'overlap'],
    concept: {
      title: 'An order of the words, with overlaps saved between neighbours',
      body: [
        'We want the shortest string that contains every given word as a substring. Assume no word is inside another one. Then the answer is some **order** of the words, written one after another where each word starts at the place it **overlaps** the end of the previous one: `abc` followed by `bcd` can be glued as `abcd`, saving the 2 letters `bc`. For every pair `overlap[i][j]` is the longest suffix of word `i` that is a prefix of word `j`.',
        'The length of a string for an order of the words is the sum of all lengths minus the sum of the overlaps of neighbours. Trying all `n!` orders is possible for `n = 7` but not for 10. A better way: for a set of used words (a bit mask) and the last word, the best length so far is all that the future needs.',
        { code: 'INF = 10 ** 9\ndp = [[INF] * n for _ in range(1 << n)]       # dp[mask][last]: shortest text for the words in mask, ending with word last\nfor i in range(n):\n    dp[1 << i][i] = len(words[i])\nfor mask in range(1 << n):\n    for last in range(n):\n        if dp[mask][last] < INF:\n            for nxt in range(n):\n                if not mask >> nxt & 1:\n                    cand = dp[mask][last] + len(words[nxt]) - overlap[last][nxt]\n                    if cand < dp[mask | 1 << nxt][nxt]:\n                        dp[mask | 1 << nxt][nxt] = cand\nprint(min(dp[(1 << n) - 1]))' },
        'The table has `2^n * n` entries instead of `n!` orders. Notice that the search never glues words in a bad order: a state only keeps the shortest text for each pair (set of words, last word).'
      ]
    },
    statement: ['You are given `n` different words. No word is a substring of another word. Print the length of the shortest string that contains all the words as substrings.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` words.'],
    outputFormat: ['Print the length of the shortest string.'],
    constraints: ['1 <= n <= 10', 'Each word has 1 to 10 lowercase letters.', 'No word is a substring of another word.'],
    examples: [{ input: '3\nalex loves leetcode\n', note: 'No word ends with the beginning of another word, so nothing can be saved: alexlovesleetcode has 4 + 5 + 8 = 17 letters.' }],
    hints: ['Compute for each ordered pair the longest suffix of the first word that is a prefix of the second word.', 'The length of a text for an order is the sum of the lengths minus the overlaps of neighbouring words.', 'For each set of used words and each last word keep the shortest length.'],
    program: {
      io: ['n:int', 'words:word[n]'],
      helpers: {
        python: r`
          def overlap(a, b):
              for k in range(min(len(a), len(b)), 0, -1):
                  if a.endswith(b[:k]):
                      return k
              return 0`,
        cpp: r`
          int overlap(const string& a, const string& b) {
              for (int k = (int)min(a.size(), b.size()); k > 0; k--) {
                  if (a.compare(a.size() - k, k, b, 0, k) == 0) return k;
              }
              return 0;
          }`,
        java: r`
          static int overlap(String a, String b) {
              for (int k = Math.min(a.length(), b.length()); k > 0; k--) {
                  if (a.endsWith(b.substring(0, k))) return k;
              }
              return 0;
          }`
      },
      includes: ['<algorithm>'],
      python: r`
        INF = 10 ** 9
        ov = [[overlap(words[i], words[j]) if i != j else 0 for j in range(n)] for i in range(n)]
        dp = [[INF] * n for _ in range(1 << n)]
        for i in range(n):
            dp[1 << i][i] = len(words[i])
        for mask in range(1 << n):
            for last in range(n):
                if dp[mask][last] < INF:
                    for nxt in range(n):
                        if not mask >> nxt & 1:
                            cand = dp[mask][last] + len(words[nxt]) - ov[last][nxt]
                            if cand < dp[mask | 1 << nxt][nxt]:
                                dp[mask | 1 << nxt][nxt] = cand
        print(min(dp[(1 << n) - 1]))`,
      cpp: r`
        const int INF = 1000000000;
        vector<vector<int>> ov(n, vector<int>(n, 0));
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i != j) ov[i][j] = overlap(words[i], words[j]);
            }
        }
        int full = (1 << n) - 1;
        vector<vector<int>> dp(full + 1, vector<int>(n, INF));
        for (int i = 0; i < n; i++) dp[1 << i][i] = (int)words[i].size();
        for (int mask = 0; mask <= full; mask++) {
            for (int last = 0; last < n; last++) {
                if (dp[mask][last] >= INF) continue;
                for (int nxt = 0; nxt < n; nxt++) {
                    if ((mask >> nxt) & 1) continue;
                    int cand = dp[mask][last] + (int)words[nxt].size() - ov[last][nxt];
                    if (cand < dp[mask | (1 << nxt)][nxt]) dp[mask | (1 << nxt)][nxt] = cand;
                }
            }
        }
        cout << *min_element(dp[full].begin(), dp[full].end()) << "\n";`,
      java: r`
        int INF = 1000000000;
        int[][] ov = new int[(int) n][(int) n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i != j) ov[i][j] = overlap(words[i], words[j]);
            }
        }
        int full = (1 << (int) n) - 1;
        int[][] dp = new int[full + 1][(int) n];
        for (int[] row : dp) Arrays.fill(row, INF);
        for (int i = 0; i < n; i++) dp[1 << i][i] = words[i].length();
        for (int mask = 0; mask <= full; mask++) {
            for (int last = 0; last < n; last++) {
                if (dp[mask][last] >= INF) continue;
                for (int nxt = 0; nxt < n; nxt++) {
                    if (((mask >> nxt) & 1) != 0) continue;
                    int cand = dp[mask][last] + words[nxt].length() - ov[last][nxt];
                    if (cand < dp[mask | (1 << nxt)][nxt]) dp[mask | (1 << nxt)][nxt] = cand;
                }
            }
        }
        int answer = INF;
        for (int last = 0; last < n; last++) answer = Math.min(answer, dp[full][last]);
        System.out.println(answer);`
    },
    solution: { explanation: ['`overlap[i][j]` is the longest suffix of word `i` that starts word `j`. `dp[mask][last]` is the shortest text containing the words of `mask` and ending with word `last`; appending a new word adds its length minus the overlap. The answer is the best value for the full set.'], complexity: 'Time O(2^n * n^2), space O(2^n * n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const w = rs[1].trim().split(/\s+/);
      const overlap = (a, b) => { for (let k = Math.min(a.length, b.length); k > 0; k--) if (a.endsWith(b.slice(0, k))) return k; return 0; };
      let best = Infinity; const used = Array(n).fill(false);
      const go = (count, last, len) => { if (len >= best) return; if (count === n) { best = len; return; } for (let i = 0; i < n; i++) if (!used[i]) { used[i] = true; go(count + 1, i, len + w[i].length - (last < 0 ? 0 : overlap(w[last], w[i]))); used[i] = false; } };
      if (n <= 9) { go(0, -1, 0); return String(best); }
      const ov = w.map((a, i) => w.map((b, j) => (i === j ? 0 : overlap(a, b)))); const dp = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
      for (let i = 0; i < n; i++) dp[1 << i][i] = w[i].length;
      for (let mask = 1; mask < 1 << n; mask++) for (let last = 0; last < n; last++) if (dp[mask][last] < Infinity) for (let nxt = 0; nxt < n; nxt++) if (!((mask >> nxt) & 1)) dp[mask | (1 << nxt)][nxt] = Math.min(dp[mask | (1 << nxt)][nxt], dp[mask][last] + w[nxt].length - ov[last][nxt]);
      return String(Math.min(...dp[(1 << n) - 1]));
    },
    tests() {
      const g = rng(684);
      const make = (ws) => `${ws.length}\n${ws.join(' ')}\n`;
      const noInside = (ws) => ws.every((a, i) => ws.every((b, j) => i === j || !b.includes(a)));
      const distinctWords = (n, maxLen, pool) => { for (let attempt = 0; attempt < 1000; attempt++) { const ws = []; for (let tries = 0; tries < 400 && ws.length < n; tries++) { const w = randWord(g, randInt(g, 2, maxLen), pool); if (!ws.includes(w) && noInside([...ws, w])) ws.push(w); } if (ws.length === n) return ws; } throw new Error('could not make words'); };
      return ['3\nalex loves leetcode\n', '1\nabc\n', '2\nabc bcd\n', '2\nabc def\n', '3\nabc bcd cde\n', make(distinctWords(5, 5, 'abc')), make(distinctWords(7, 6, 'abc')), make(distinctWords(8, 7, 'abcd')), make(distinctWords(9, 8, 'abc')), make(distinctWords(10, 10, 'abc')), make(distinctWords(10, 6, 'abcd')), make(distinctWords(10, 10, 'ab')), make(['abcdefghij', 'cdefghijkl', 'efghijklmn', 'ghijklmnop', 'ijklmnopqr', 'klmnopqrst', 'mnopqrstuv', 'opqrstuvwx', 'qrstuvwxyz', 'stuvwxyzab'])];
    }
  },

  {
    slug: 'stickers-to-spell-word',
    title: 'The Fewest Stickers That Spell a Word',
    difficulty: 'hard',
    tags: ['backtracking', 'memoization', 'strings', 'counting'],
    concept: {
      title: 'Always fix the first missing letter, and try only stickers that have it',
      body: [
        'You have several kinds of stickers, each with some letters, and you can use each kind as many times as you like. You may cut a sticker\'s letters out one by one: from each sticker you use, you can take any of its letters. You want to build a target word with as few stickers as possible. The state of the search is what is **still missing**: how many of each letter.',
        'To avoid trying the same stickers in all orders, always look at the **first letter that is still missing**. Some sticker used later must supply it, so try only the stickers that **contain this letter**. Each try removes the sticker\'s letters from the missing letters, and the search continues with fewer missing letters.',
        { code: 'def need(remaining):                        # remaining: counts of the 26 letters\n    if sum(remaining) == 0:\n        return 0\n    if remaining in memo:\n        return memo[remaining]\n    first = next(i for i in range(26) if remaining[i] > 0)\n    best = INF\n    for sticker in stickers:                # sticker: counts of the 26 letters\n        if sticker[first] > 0:\n            rest = tuple(max(0, remaining[i] - sticker[i]) for i in range(26))\n            best = min(best, 1 + need(rest))\n    memo[remaining] = best\n    return best' },
        'The memo is keyed by the tuple of missing counts, so each situation is solved once, even if many orders of stickers lead to it. If no sticker has a missing letter, the loop does nothing and the value stays `INF`: the word cannot be built, and the answer is -1.'
      ]
    },
    statement: ['You have `n` kinds of stickers (a word each) and a target word. You may use a kind of sticker any number of times, and from every sticker you use you may cut out any of its letters (each letter once). Print the smallest number of stickers needed to build the target word with the cut out letters, or `-1` if it is impossible.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` stickers.', 'The third line has the target word.'],
    outputFormat: ['Print the smallest number of stickers, or `-1`.'],
    constraints: ['1 <= n <= 20', 'Each sticker has 1 to 10 lowercase letters.', '1 <= length of the target <= 14'],
    examples: [{ input: '3\nwith example science\nthehat\n', note: 'Two stickers "with" give t, h, t, h and one sticker "example" gives e and a: 3 stickers build thehat.' }],
    hints: ['Describe what is still missing as 26 letter counts.', 'Take the first letter that is still missing and try only stickers that contain it.', 'Remember the answer for each list of missing counts.'],
    program: {
      io: ['n:int', 'stickers:word[n]', 'target:word'],
      includes: ['<map>', '<algorithm>'],
      helpers: {
        python: r`
          INF = 1000

          def need(remaining, stickers, memo):
              if sum(remaining) == 0:
                  return 0
              if remaining in memo:
                  return memo[remaining]
              first = next(i for i in range(26) if remaining[i] > 0)
              best = INF
              for sticker in stickers:
                  if sticker[first] > 0:
                      rest = tuple(max(0, remaining[i] - sticker[i]) for i in range(26))
                      best = min(best, 1 + need(rest, stickers, memo))
              memo[remaining] = best
              return best`,
        cpp: r`
          const int INF = 1000;

          int need(const vector<int>& remaining, const vector<vector<int>>& stickers, map<vector<int>, int>& memo) {
              int total = 0;
              for (int x : remaining) total += x;
              if (total == 0) return 0;
              auto found = memo.find(remaining);
              if (found != memo.end()) return found->second;
              int first = 0;
              while (remaining[first] == 0) first++;
              int best = INF;
              for (const vector<int>& sticker : stickers) {
                  if (sticker[first] > 0) {
                      vector<int> rest(26);
                      for (int i = 0; i < 26; i++) rest[i] = max(0, remaining[i] - sticker[i]);
                      best = min(best, 1 + need(rest, stickers, memo));
                  }
              }
              memo[remaining] = best;
              return best;
          }`,
        java: r`
          static final int INF = 1000;

          static int need(int[] remaining, int[][] stickers, Map<String, Integer> memo) {
              int total = 0;
              for (int x : remaining) total += x;
              if (total == 0) return 0;
              String key = Arrays.toString(remaining);
              Integer found = memo.get(key);
              if (found != null) return found;
              int first = 0;
              while (remaining[first] == 0) first++;
              int best = INF;
              for (int[] sticker : stickers) {
                  if (sticker[first] > 0) {
                      int[] rest = new int[26];
                      for (int i = 0; i < 26; i++) rest[i] = Math.max(0, remaining[i] - sticker[i]);
                      best = Math.min(best, 1 + need(rest, stickers, memo));
                  }
              }
              memo.put(key, best);
              return best;
          }`
      },
      python: r`
        counts = []
        for w in stickers:
            c = [0] * 26
            for ch in w:
                c[ord(ch) - 97] += 1
            counts.append(c)
        remaining = [0] * 26
        for ch in target:
            remaining[ord(ch) - 97] += 1
        answer = need(tuple(remaining), counts, {})
        print(answer if answer < INF else -1)`,
      cpp: r`
        vector<vector<int>> counts;
        for (const string& w : stickers) {
            vector<int> c(26, 0);
            for (char ch : w) c[ch - 'a']++;
            counts.push_back(c);
        }
        vector<int> remaining(26, 0);
        for (char ch : target) remaining[ch - 'a']++;
        map<vector<int>, int> memo;
        int answer = need(remaining, counts, memo);
        cout << (answer < INF ? answer : -1) << "\n";`,
      java: r`
        int[][] counts = new int[(int) n][26];
        for (int i = 0; i < n; i++) {
            for (char ch : stickers[i].toCharArray()) counts[i][ch - 'a']++;
        }
        int[] remaining = new int[26];
        for (char ch : target.toCharArray()) remaining[ch - 'a']++;
        int answer = need(remaining, counts, new HashMap<>());
        System.out.println(answer < INF ? answer : -1);`
    },
    solution: { explanation: ['The state is the vector of missing letter counts. The first missing letter must come from some sticker, so only stickers containing it are tried; their letters are subtracted and the search continues. A memo on the vector avoids repeated work; an unreachable word gives infinity, printed as -1.'], complexity: 'Time proportional to the number of distinct missing-letter vectors reached times n * 26.' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const stickers = rs[1].trim().split(/\s+/); const target = rs[2].trim(); const m = target.length;
      const INF = 1000; const dp = Array(1 << m).fill(INF); dp[0] = 0;
      for (let mask = 0; mask < 1 << m; mask++) { if (dp[mask] >= INF) continue; for (const s of stickers) { const have = Array(26).fill(0); for (const ch of s) have[ch.charCodeAt(0) - 97]++; let nm = mask; for (let i = 0; i < m; i++) if (!((nm >> i) & 1) && have[target.charCodeAt(i) - 97] > 0) { have[target.charCodeAt(i) - 97]--; nm |= 1 << i; } if (nm !== mask && dp[mask] + 1 < dp[nm]) dp[nm] = dp[mask] + 1; } }
      return String(dp[(1 << m) - 1] >= INF ? -1 : dp[(1 << m) - 1]);
    },
    tests() {
      const g = rng(685);
      const make = (stickers, target) => `${stickers.length}\n${stickers.join(' ')}\n${target}\n`;
      const pool = 'abcdefg';
      const stickerSet = (n, len, letters) => many(n, () => randWord(g, randInt(g, 1, len), letters));
      return ['3\nwith example science\nthehat\n', '2\nnotice possible\nbasicbasic\n',make(['a'], 'a'), make(['a'], 'b'), make(['ab', 'bc'], 'abc'), make(stickerSet(10, 5, pool), randWord(g, 14, pool)), make(stickerSet(20, 4, pool), randWord(g, 14, pool)), make(stickerSet(20, 10, 'abcdefghij'), randWord(g, 14, 'abcdefghij')), make(stickerSet(15, 3, 'abcdef'), randWord(g, 13, 'abcdef')), make(['abcd', 'efg', 'hij'], 'aaaaaaaaaabbbb'), make(stickerSet(20, 6, 'abcd'), randWord(g, 14, 'abcd')), make(stickerSet(12, 8, 'abcdefghijklmnop'), randWord(g, 12, 'abcdefghijklmnop')), make(['zz', 'yy', 'xx', 'ww'], 'zyxwzyxwzyxwzy')];
    }
  },

  {
    slug: 'exact-cover-count',
    title: 'Cover Every Element Exactly Once',
    difficulty: 'hard',
    tags: ['backtracking', 'bitmask', 'exact-cover', 'pruning'],
    concept: {
      title: 'Cover the lowest uncovered element, with a set that does not overlap',
      body: [
        'We have the elements `1 .. m` and `k` sets of elements. An **exact cover** is a choice of some of the sets such that every element lies in **exactly one** chosen set (no overlap, no gap). Sudoku and many tiling puzzles are exact cover problems in disguise. Count the exact covers.',
        'Keep the covered elements as a bit mask. Look at the **lowest element that is not covered yet**. It must be covered by some chosen set, so try every set that **contains it** and **does not overlap** the already covered elements. Because the lowest uncovered element is always the one we decide, each exact cover is generated by exactly one sequence of choices: no cover is counted twice.',
        { code: 'def cover(covered):\n    if covered == full:\n        return 1\n    low = ~covered & (covered + 1)               # the lowest uncovered element\n    total = 0\n    for mask in masks:\n        if mask & low and not mask & covered:    # contains it and no overlap\n            total += cover(covered | mask)\n    return total' },
        'Choosing the element with the **fewest** candidate sets (as in Knuth\'s Algorithm X) cuts even more, but even the lowest uncovered element is enough for this size. Each recursive call adds at least one new element to the covered set, so the depth is at most `m`.'
      ]
    },
    statement: ['The elements are `1, 2, ..., m`. There are `k` sets of elements (each non-empty). Count the ways to choose some of the sets (as a set of indexes) so that every element belongs to exactly one chosen set. Equal sets with different indexes count as different choices.'],
    inputFormat: ['The first line has `m` and `k`.', 'Each of the next `k` lines has a string of `m` characters: character `i` is `1` if the element `i` is in the set.'],
    outputFormat: ['Print the number of exact covers.'],
    constraints: ['1 <= m <= 12', '1 <= k <= 24', 'Every set has at least one element.'],
    examples: [{ input: '4 4\n1100\n0011\n1000\n0111\n', note: 'The exact covers are {set 1, set 2} and {set 3, set 4}.' }],
    hints: ['Store each set as a bit mask and keep the covered elements as a mask.', 'Find the lowest element that is not covered yet.', 'Try every set that contains this element and has no common element with the covered ones.'],
    program: {
      io: ['m:int k:int', 'sets:rows[k]'],
      helpers: {
        python: r`
          def cover(covered, full, masks):
              if covered == full:
                  return 1
              low = ~covered & (covered + 1)
              total = 0
              for mask in masks:
                  if mask & low and not mask & covered:
                      total += cover(covered | mask, full, masks)
              return total`,
        cpp: r`
          long long cover(int covered, int full, const vector<int>& masks) {
              if (covered == full) return 1;
              int low = ~covered & (covered + 1);
              long long total = 0;
              for (int mask : masks) {
                  if ((mask & low) && !(mask & covered)) total += cover(covered | mask, full, masks);
              }
              return total;
          }`,
        java: r`
          static long cover(int covered, int full, int[] masks) {
              if (covered == full) return 1;
              int low = ~covered & (covered + 1);
              long total = 0;
              for (int mask : masks) {
                  if ((mask & low) != 0 && (mask & covered) == 0) total += cover(covered | mask, full, masks);
              }
              return total;
          }`
      },
      python: r`
        masks = [sum(1 << i for i, ch in enumerate(row) if ch == "1") for row in sets]
        print(cover(0, (1 << m) - 1, masks))`,
      cpp: r`
        vector<int> masks;
        for (const string& row : sets) {
            int mask = 0;
            for (int i = 0; i < m; i++) {
                if (row[i] == '1') mask |= 1 << i;
            }
            masks.push_back(mask);
        }
        cout << cover(0, (1 << m) - 1, masks) << "\n";`,
      java: r`
        int[] masks = new int[(int) k];
        for (int j = 0; j < k; j++) {
            int mask = 0;
            for (int i = 0; i < m; i++) {
                if (sets[j].charAt(i) == '1') mask |= 1 << i;
            }
            masks[j] = mask;
        }
        System.out.println(cover(0, (1 << (int) m) - 1, masks));`
    },
    solution: { explanation: ['The covered elements are a bit mask. The recursion decides the lowest uncovered element: it tries each set that contains it and does not overlap the covered elements. A complete mask counts one exact cover; every cover is built in exactly one order.'], complexity: 'Time proportional to the number of partial covers, small for these sizes; space O(m).' },
    solve(input) {
      const rs = rows(input); const [m, k] = nums(rs[0]); const masks = rs.slice(1, 1 + k).map((row) => [...row.trim()].reduce((x, ch, i) => (ch === '1' ? x | (1 << i) : x), 0));
      const full = (1 << m) - 1; const ways = Array(1 << m).fill(0); ways[0] = 1;
      // process masks of covered elements in increasing order; every cover is built by always taking the lowest uncovered element
      for (let covered = 0; covered < full; covered++) { if (!ways[covered]) continue; const low = ~covered & (covered + 1); for (const mask of masks) if ((mask & low) && !(mask & covered)) ways[covered | mask] += ways[covered]; }
      return String(ways[full]);
    },
    tests() {
      const g = rng(686);
      const make = (m, sets) => `${m} ${sets.length}\n${sets.join('\n')}\n`;
      const randomSets = (m, k, density) => many(k, () => { const row = many(m, () => (g() < density ? '1' : '0')); if (!row.includes('1')) row[randInt(g, 0, m - 1)] = '1'; return row.join(''); });
      const partitionSets = (m, parts, k) => { const sets = []; const make1 = () => { const labels = many(m, () => randInt(g, 0, parts - 1)); for (let p = 0; p < parts; p++) { const row = labels.map((l) => (l === p ? '1' : '0')); if (row.includes('1')) sets.push(row.join('')); } }; while (sets.length < k) make1(); return shuffle(g, sets).slice(0, k); };
      const brute = (m, sets) => { const masks = sets.map((row) => [...row].reduce((x, ch, i) => (ch === '1' ? x | (1 << i) : x), 0)); let count = 0; for (let pick = 0; pick < 1 << masks.length; pick++) { let seen = 0, ok = true; for (let j = 0; j < masks.length && ok; j++) if ((pick >> j) & 1) { if (seen & masks[j]) ok = false; seen |= masks[j]; } if (ok && seen === (1 << m) - 1) count++; } return count; };
      crossCheck(() => { const m = randInt(g, 1, 7); return make(m, randomSets(m, randInt(g, 1, 12), 0.35)); }, (i) => this.solve(i), (i) => { const rs = rows(i); const [m, k] = nums(rs[0]); return brute(m, rs.slice(1, 1 + k)); });
      return ['4 4\n1100\n0011\n1000\n0111\n', '1 1\n1\n', '2 2\n10\n01\n', '2 1\n10\n', '3 3\n100\n010\n001\n', make(12, many(12, (i) => '0'.repeat(i) + '1' + '0'.repeat(11 - i))), make(12, partitionSets(12, 4, 24)), make(12, partitionSets(12, 3, 24)), make(12, randomSets(12, 24, 0.2)), make(12, randomSets(12, 24, 0.3)), make(10, partitionSets(10, 5, 24)), make(12, [...many(12, (i) => '0'.repeat(i) + '1' + '0'.repeat(11 - i)), ...many(11, (i) => '0'.repeat(i) + '11' + '0'.repeat(10 - i))]), make(12, randomSets(12, 24, 0.1)), make(9, partitionSets(9, 3, 20))];
    }
  }
];
