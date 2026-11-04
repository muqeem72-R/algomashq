import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const counts = (a) => { const c = new Map(); for (const x of a) c.set(x, (c.get(x) || 0) + 1); return c; };
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };

// A valid, completely filled sudoku board (rows of 9 digits), mixed up with random permutations.
function sudoku(g) {
  const digits = shuffle(g, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const band = () => shuffle(g, [0, 1, 2]);
  const rowOrder = shuffle(g, [0, 1, 2]).flatMap((b) => band().map((x) => b * 3 + x));
  const colOrder = shuffle(g, [0, 1, 2]).flatMap((b) => band().map((x) => b * 3 + x));
  return rowOrder.map((i) => colOrder.map((j) => digits[(i * 3 + Math.floor(i / 3) + j) % 9]));
}
const board = (b) => b.map((row) => row.join('')).join('\n') + '\n';

export default [
  {
    slug: 'boomerang-triples',
    title: 'Equal Distances From a Point',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'geometry', 'counting'],
    concept: {
      title: 'For each centre, group the other points by distance',
      body: [
        'Count ordered triples `(i, j, k)` of different points where the distance from `i` to `j` equals the distance from `i` to `k`. Fix the point `i` as the **centre**. Compute the squared distance to every other point (squared, so that no square roots or decimals are needed) and count in a map how many points have each distance.',
        { code: 'for each centre i:\n    d = {}\n    for each other point j:\n        dist = (xj - xi) ** 2 + (yj - yi) ** 2\n        d[dist] = d.get(dist, 0) + 1\n    for c in d.values():\n        total += c * (c - 1)       # ordered pairs (j, k) among c points' },
        'If `c` points have the same distance from the centre, there are `c * (c - 1)` ordered pairs `(j, k)` of different points among them. The work is `n` rounds of `n` map operations: O(n^2) instead of the `n^3` triples.'
      ]
    },
    statement: ['Given `n` different points with integer coordinates, count the ordered triples `(i, j, k)` of three different points such that the distance from point `i` to point `j` equals the distance from point `i` to point `k`. Triples with the same points in a different order are different triples.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has the coordinates `x` and `y` of a point.'],
    outputFormat: ['Print the number of triples.'],
    constraints: ['1 <= n <= 600', '-10^4 <= x, y <= 10^4', 'All points are different.'],
    examples: [{ input: '3\n0 0\n1 0\n2 0\n', note: 'Only the middle point (1, 0) works as the centre: the other two points are both at distance 1, in two orders.' }],
    hints: ['Use the squared distance, so everything stays an integer.', 'Fix a centre and count the points at each distance with a map.', 'Each distance with `c` points gives `c * (c - 1)` ordered pairs.'],
    program: {
      io: ['n:int', 'pts:int[n][2]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        total = 0
        for i in range(n):
            xi, yi = pts[i]
            d = {}
            for j in range(n):
                if j != i:
                    dist = (pts[j][0] - xi) ** 2 + (pts[j][1] - yi) ** 2
                    d[dist] = d.get(dist, 0) + 1
            for c in d.values():
                total += c * (c - 1)
        print(total)`,
      cpp: r`
        long long total = 0;
        unordered_map<long long, long long> d;
        for (int i = 0; i < n; i++) {
            d.clear();
            for (int j = 0; j < n; j++) {
                if (j == i) continue;
                long long dx = pts[j][0] - pts[i][0], dy = pts[j][1] - pts[i][1];
                d[dx * dx + dy * dy]++;
            }
            for (auto& entry : d) total += entry.second * (entry.second - 1);
        }
        cout << total << "\n";`,
      java: r`
        long total = 0;
        for (int i = 0; i < n; i++) {
            Map<Long, Long> d = new HashMap<>();
            for (int j = 0; j < n; j++) {
                if (j == i) continue;
                long dx = pts[j][0] - pts[i][0], dy = pts[j][1] - pts[i][1];
                d.merge(dx * dx + dy * dy, 1L, Long::sum);
            }
            for (long c : d.values()) total += c * (c - 1);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['For each centre the other points are grouped by squared distance. A group of `c` points gives `c * (c - 1)` ordered pairs.'], complexity: 'Time O(n^2) on average, space O(n).' },
    solve(input) { const rs = rows(input); const n = Number(rs[0]); const p = rs.slice(1, 1 + n).map(nums); let t = 0; for (let i = 0; i < n; i++) { const d = new Map(); for (let j = 0; j < n; j++) if (j !== i) { const k = (p[j][0] - p[i][0]) ** 2 + (p[j][1] - p[i][1]) ** 2; d.set(k, (d.get(k) || 0) + 1); } for (const c of d.values()) t += c * (c - 1); } return String(t); },
    tests() {
      const g = rng(351);
      const make = (n, span) => { const seen = new Set(); const pts = []; while (pts.length < n) { const x = randInt(g, -span, span), y = randInt(g, -span, span); if (!seen.has(x + ',' + y)) { seen.add(x + ',' + y); pts.push([x, y]); } } return `${n}\n${pts.map((q) => q.join(' ')).join('\n')}\n`; };
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const p = rs.slice(1, 1 + n).map(nums); let t = 0; const dd = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) if (i !== j && i !== k && j !== k && dd(p[i], p[j]) === dd(p[i], p[k])) t++; return t; };
      crossCheck(() => make(randInt(g, 1, 8), 3), (i) => this.solve(i), brute);
      const grid = (side) => `${side * side}\n${many(side * side, (i) => `${(i % side) - 12} ${Math.floor(i / side) - 12}`).join('\n')}\n`;
      return ['3\n0 0\n1 0\n2 0\n', '1\n5 5\n', '2\n0 0\n10000 10000\n', make(8, 3), make(100, 8), make(300, 10000), make(600, 10000), make(600, 15), grid(24), make(500, 25)];
    }
  },

  {
    slug: 'minimum-index-sum',
    title: 'Favourite Lists: Smallest Index Sum',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'strings'],
    concept: {
      title: 'Index the first list, then scan the second',
      body: [
        'Two people each wrote a list of favourite places (no place is repeated within one list). A place that is in both lists has a position `i` in the first and `j` in the second. You want the common places with the **smallest `i + j`**. Put the first list into a map from place to position. Then scan the second list: for a place found in the map compute the index sum and keep the best ones.',
        { code: 'pos = {place: i for i, place in enumerate(a)}\nbest, result = None, []\nfor j, place in enumerate(b):\n    if place in pos:\n        s = pos[place] + j\n        if best is None or s < best: best, result = s, [place]\n        elif s == best: result.append(place)' },
        'Keep a list of all places that reach the current best sum; when a smaller sum shows up, start the list again.'
      ]
    },
    statement: ['Two lists of distinct words (places) are given; within a list no word repeats. Positions count from 0. Among the words that occur in both lists, find those with the smallest sum of the position in the first list and the position in the second list. Print how many such words there are, and then the words in alphabetical order. At least one word occurs in both lists.'],
    inputFormat: ['The first line has `n` and `m`.', 'The second line has the `n` words of the first list.', 'The third line has the `m` words of the second list.'],
    outputFormat: ['The first line: the number of words.', 'The second line: the words in alphabetical order.'],
    constraints: ['1 <= n, m <= 20000', 'Each word has 1 to 10 lowercase letters.'],
    examples: [{ input: '4 4\nshogun tapioca burger kfc\nkfc burger tapioca shogun\n', note: 'Index sums: shogun 0+3, tapioca 1+2, burger 2+1, kfc 3+0: all 3; sorted: burger kfc shogun tapioca.' }],
    hints: ['Put the first list into a map from word to position.', 'Scan the second list and compute the index sum for the words found in the map.', 'Keep all words with the smallest sum, and sort them at the end.'],
    program: {
      io: ['n:int m:int', 'a:word[n]', 'b:word[m]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        pos = {}
        for i, place in enumerate(a):
            pos[place] = i
        best = None
        result = []
        for j, place in enumerate(b):
            if place in pos:
                s = pos[place] + j
                if best is None or s < best:
                    best = s
                    result = [place]
                elif s == best:
                    result.append(place)
        result.sort()
        print(len(result))
        print(*result)`,
      cpp: r`
        unordered_map<string, int> pos;
        for (int i = 0; i < n; i++) pos[a[i]] = i;
        int best = -1;
        vector<string> result;
        for (int j = 0; j < m; j++) {
            auto it = pos.find(b[j]);
            if (it == pos.end()) continue;
            int s = it->second + j;
            if (best == -1 || s < best) {
                best = s;
                result.assign(1, b[j]);
            } else if (s == best) {
                result.push_back(b[j]);
            }
        }
        sort(result.begin(), result.end());
        cout << result.size() << "\n";
        for (size_t i = 0; i < result.size(); i++) cout << result[i] << (i + 1 < result.size() ? " " : "\n");`,
      java: r`
        Map<String, Integer> pos = new HashMap<>();
        for (int i = 0; i < n; i++) pos.put(a[i], i);
        int best = -1;
        List<String> result = new ArrayList<>();
        for (int j = 0; j < m; j++) {
            Integer i = pos.get(b[j]);
            if (i == null) continue;
            int s = i + j;
            if (best == -1 || s < best) {
                best = s;
                result.clear();
                result.add(b[j]);
            } else if (s == best) {
                result.add(b[j]);
            }
        }
        Collections.sort(result);
        System.out.println(result.size());
        System.out.println(String.join(" ", result));`
    },
    solution: { explanation: ['A map gives the position of each word of the first list. The second list is scanned once and the words with the smallest index sum are collected.'], complexity: 'Time O(n + m) on average, space O(n).' },
    solve(input) { const rs = rows(input); const a = rs[1].split(' '), b = rs[2].split(' '); const pos = new Map(a.map((w, i) => [w, i])); let best = Infinity, res = []; b.forEach((w, j) => { if (pos.has(w)) { const s = pos.get(w) + j; if (s < best) { best = s; res = [w]; } else if (s === best) res.push(w); } }); res.sort(); return `${res.length}\n${res.join(' ')}`; },
    tests() {
      const g = rng(352);
      const words = (k, len) => { const s = new Set(); while (s.size < k) s.add(randWord(g, randInt(g, 1, len), LOW)); return [...s]; };
      const make = (n, m, common, len) => { const pool = words(n + m, len); const A = pool.slice(0, n); const B = pool.slice(n); const shared = shuffle(g, A).slice(0, common); const Bm = B.slice(0, m - common); const mixed = shuffle(g, [...Bm, ...shared]); return `${n} ${m}\n${A.join(' ')}\n${mixed.join(' ')}\n`; };
      return ['4 4\nshogun tapioca burger kfc\nkfc burger tapioca shogun\n', '1 1\na\na\n', '3 3\nab cd ef\nzz ef yy\n', '3 2\na b c\nc a\n', make(10, 8, 3, 3), make(300, 250, 20, 4), make(20000, 20000, 2000, 10), make(20000, 20000, 1, 10), make(20000, 5, 5, 10), make(5, 20000, 5, 10), make(2000, 2000, 2000, 6)];
    }
  },

  {
    slug: 'longest-harmonious-subsequence',
    title: 'Longest Harmonious Subsequence',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'counting'],
    concept: {
      title: 'Neighbouring values, counted together',
      body: [
        'A **harmonious** subsequence is one in which the largest value minus the smallest value is exactly 1. You may pick elements from anywhere (a subsequence does not have to be contiguous, and the order does not matter for the length). So such a subsequence uses only two values `x` and `x + 1`, and you can take **all** copies of both.',
        { code: 'count = counts of a\nbest = 0\nfor x, c in count.items():\n    if x + 1 in count:\n        best = max(best, c + count[x + 1])' },
        'Both values must be present: with only one value the difference would be 0, not 1. A hash map of counts answers "is `x + 1` present and how often?" for every value in O(1).'
      ]
    },
    statement: ['Choose some elements of an array (not necessarily next to each other) so that the difference between the largest and the smallest chosen value is exactly 1. Print the largest number of elements you can choose, or 0 if no two values differ by exactly 1.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the largest number of elements.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '8\n1 3 2 2 5 2 3 7\n', note: 'Take 3, 2, 2, 2, 3: five elements with values 2 and 3.' }],
    hints: ['The chosen values must be x and x + 1 for some x.', 'You can take all copies of both values.', 'Count the values and check every x for which x + 1 is present.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        best = 0
        for x, c in count.items():
            if x + 1 in count:
                best = max(best, c + count[x + 1])
        print(best)`,
      cpp: r`
        unordered_map<long long, int> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        int best = 0;
        for (auto& entry : count) {
            auto it = count.find(entry.first + 1);
            if (it != count.end()) best = max(best, entry.second + it->second);
        }
        cout << best << "\n";`,
      java: r`
        Map<Long, Integer> count = new HashMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1, Integer::sum);
        int best = 0;
        for (Map.Entry<Long, Integer> entry : count.entrySet()) {
            Integer next = count.get(entry.getKey() + 1);
            if (next != null) best = Math.max(best, entry.getValue() + next);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['A harmonious subsequence uses exactly two neighbouring values and can contain all their copies. The best pair is found with the map of counts.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const c = counts(nums(rows(input)[1])); let best = 0; for (const [x, k] of c) if (c.has(x + 1)) best = Math.max(best, k + c.get(x + 1)); return String(best); },
    tests() { const g = rng(353); return ['8\n1 3 2 2 5 2 3 7\n', '1\n4\n', '4\n1 1 1 1\n', '2\n1 2\n', '3\n1 3 5\n', arr(randArray(g, 30, -5, 5)), arr(randArray(g, 2000, -500, 500)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, 0, 100)), arr(randArray(g, 20000, 0, 1)), arr(many(20000, (i) => i * 2))]; }
  },

  {
    slug: 'bulls-and-cows',
    title: 'Bulls and Cows',
    difficulty: 'medium',
    tags: ['hashing', 'counting', 'strings', 'game'],
    concept: {
      title: 'Exact matches first, then the shared digits',
      body: [
        'In the game *Bulls and Cows* you guess a secret number. A **bull** is a digit that is right and in the right place. A **cow** is a digit that occurs in the secret but stands at a wrong place in the guess. Every digit of the secret can be used only once.',
        { code: 'bulls = sum(1 for x, y in zip(secret, guess) if x == y)\ncommon = sum(min(count_secret[d], count_guess[d]) for d in digits)\ncows = common - bulls' },
        '`common` is the total number of digits the two words share, counted with multiplicity (the smaller of the two counts for every digit). Bulls are among them, so the cows are what remains after subtracting the bulls. Tables of 10 counters are enough; the idea of "shared with multiplicity" works for any alphabet.'
      ]
    },
    statement: ['A secret and a guess are two strings of digits of the same length. A **bull** is a position where both have the same digit. A **cow** is a digit of the guess that occurs in the secret but not as a bull; each digit of the secret may be matched at most once (a bull or a cow). Print the number of bulls and the number of cows.'],
    inputFormat: ['The first line has the secret.', 'The second line has the guess.'],
    outputFormat: ['Print the bulls and the cows separated by a space.'],
    constraints: ['1 <= length <= 20000', 'Both strings contain only the digits 0 to 9 and have the same length.'],
    examples: [{ input: '1807\n7810\n', note: 'One bull (the 8), and three cows (1, 0, 7).' }, { input: '1123\n0111\n', note: 'One bull (the second 1) and one cow (a different 1).' }],
    hints: ['Count the positions with equal digits: the bulls.', 'Count the digits of both strings in two tables of 10 counters.', 'The shared digits are the sum of the smaller counts; the cows are the shared digits minus the bulls.'],
    program: {
      io: ['secret:word', 'guess:word'],
      includes: ['<algorithm>'],
      python: r`
        bulls = 0
        cs = [0] * 10
        cg = [0] * 10
        for x, y in zip(secret, guess):
            if x == y:
                bulls += 1
            cs[int(x)] += 1
            cg[int(y)] += 1
        common = sum(min(cs[d], cg[d]) for d in range(10))
        print(bulls, common - bulls)`,
      cpp: r`
        int bulls = 0, cs[10] = {0}, cg[10] = {0};
        for (size_t i = 0; i < secret.size(); i++) {
            if (secret[i] == guess[i]) bulls++;
            cs[secret[i] - '0']++;
            cg[guess[i] - '0']++;
        }
        int common = 0;
        for (int d = 0; d < 10; d++) common += min(cs[d], cg[d]);
        cout << bulls << " " << common - bulls << "\n";`,
      java: r`
        int bulls = 0;
        int[] cs = new int[10], cg = new int[10];
        for (int i = 0; i < secret.length(); i++) {
            if (secret.charAt(i) == guess.charAt(i)) bulls++;
            cs[secret.charAt(i) - '0']++;
            cg[guess.charAt(i) - '0']++;
        }
        int common = 0;
        for (int d = 0; d < 10; d++) common += Math.min(cs[d], cg[d]);
        System.out.println(bulls + " " + (common - bulls));`
    },
    solution: { explanation: ['Bulls are counted position by position; the digits shared with multiplicity are the sum of the smaller counts, and the cows are those minus the bulls.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const [s, t] = rows(input); let bulls = 0; const cs = Array(10).fill(0), cg = Array(10).fill(0); for (let i = 0; i < s.length; i++) { if (s[i] === t[i]) bulls++; cs[+s[i]]++; cg[+t[i]]++; } let common = 0; for (let d = 0; d < 10; d++) common += Math.min(cs[d], cg[d]); return `${bulls} ${common - bulls}`; },
    tests() { const g = rng(354); const digits = (n, alpha) => randWord(g, n, alpha); return ['1807\n7810\n', '1123\n0111\n', '5\n5\n', '5\n6\n', '0000\n0000\n', `${digits(12, '0123')}\n${digits(12, '0123')}\n`, `${digits(2000, '0123456789')}\n${digits(2000, '0123456789')}\n`, `${digits(20000, '0123456789')}\n${digits(20000, '0123456789')}\n`, `${digits(20000, '01')}\n${digits(20000, '01')}\n`, `${'1234567890'.repeat(2000)}\n${'0987654321'.repeat(2000)}\n`]; }
  },

  {
    slug: 'check-sudoku-board',
    title: 'Is the Sudoku Board Valid?',
    difficulty: 'medium',
    tags: ['hashing', 'hash-set', 'simulation', 'grid'],
    concept: {
      title: 'One set for every row, column and box',
      body: [
        'A sudoku board is valid when no digit repeats in any **row**, any **column** or any of the nine **3 by 3 boxes**. Walk over all filled cells and record, for each cell, three facts in a set: "digit `d` is in row `i`", "digit `d` is in column `j`" and "digit `d` is in box `(i // 3, j // 3)`". If one of the three facts is already in the set, a rule is broken.',
        { code: 'seen = set()\nfor i in range(9):\n    for j in range(9):\n        d = g[i][j]\n        if d != ".":\n            for key in (("r", i, d), ("c", j, d), ("b", i // 3, j // 3, d)):\n                if key in seen: invalid\n                seen.add(key)' },
        'The board only has to be valid so far: it does not have to be solvable. The box of a cell is found by integer division of its row and column by 3.'
      ]
    },
    statement: ['A partially filled sudoku board has 9 lines of 9 characters: a digit from 1 to 9 or a dot for an empty cell. Print `yes` if no digit occurs twice in any row, any column or any of the nine 3 by 3 boxes, otherwise print `no`. You do not have to check that the board can be solved.'],
    inputFormat: ['9 lines with 9 characters each.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['Each character is a digit from 1 to 9 or a dot.'],
    examples: [{ input: '53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79\n', note: 'A valid board.' }],
    hints: ['Use a set of facts such as (row, i, digit), (column, j, digit) and (box, bi, bj, digit).', 'The box of a cell is `(i // 3, j // 3)`.', 'If a fact is already in the set when a cell is read, the board is invalid.'],
    program: {
      io: ['g:rows[9]'],
      includes: ['<unordered_set>'],
      python: r`
        seen = set()
        ok = True
        for i in range(9):
            for j in range(9):
                d = g[i][j]
                if d != ".":
                    for key in (("r", i, d), ("c", j, d), ("b", i // 3, j // 3, d)):
                        if key in seen:
                            ok = False
                        seen.add(key)
        print("yes" if ok else "no")`,
      cpp: r`
        unordered_set<string> seen;
        bool ok = true;
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                char d = g[i][j];
                if (d == '.') continue;
                string keys[3] = {string("r") + to_string(i) + d, string("c") + to_string(j) + d,
                                  string("b") + to_string(i / 3) + to_string(j / 3) + d};
                for (const string& key : keys) {
                    if (seen.count(key)) ok = false;
                    seen.insert(key);
                }
            }
        }
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        Set<String> seen = new HashSet<>();
        boolean ok = true;
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                char d = g[i].charAt(j);
                if (d == '.') continue;
                String[] keys = {"r" + i + d, "c" + j + d, "b" + (i / 3) + (j / 3) + d};
                for (String key : keys) {
                    if (!seen.add(key)) ok = false;
                }
            }
        }
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['Each filled cell adds three facts (row, column, box) to a set. A fact that is already present means a repeated digit.'], complexity: 'Time O(81), space O(81).' },
    solve(input) { const g = rows(input); const seen = new Set(); let ok = true; for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) { const d = g[i][j]; if (d === '.') continue; for (const key of [`r${i}${d}`, `c${j}${d}`, `b${Math.floor(i / 3)}${Math.floor(j / 3)}${d}`]) { if (seen.has(key)) ok = false; seen.add(key); } } return ok ? 'yes' : 'no'; },
    tests() {
      const g = rng(355);
      const blank = (b, p) => b.map((row) => row.map((d) => (g() < p ? '.' : d)));
      const full = () => sudoku(g);
      const corrupt = (b, kind) => { const c = b.map((row) => [...row]); const i = randInt(g, 0, 8), j = randInt(g, 0, 8); if (kind === 'row') { const j2 = (j + randInt(g, 1, 8)) % 9; c[i][j2] = c[i][j]; } else if (kind === 'col') { const i2 = (i + randInt(g, 1, 8)) % 9; c[i2][j] = c[i][j]; } else { const bi = Math.floor(i / 3) * 3, bj = Math.floor(j / 3) * 3; let i2 = bi + randInt(g, 0, 2), j2 = bj + randInt(g, 0, 2); while (i2 === i || j2 === j) { i2 = bi + randInt(g, 0, 2); j2 = bj + randInt(g, 0, 2); } c[i2][j2] = c[i][j]; } return c; };
      const classic = '53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79\n';
      const wrong = '83..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79\n';
      return [classic, wrong, board(full()), board(blank(full(), 0.5)), board(blank(full(), 0.8)), board(blank(corrupt(full(), 'row'), 0.1)), board(blank(corrupt(full(), 'col'), 0.1)), board(corrupt(full(), 'box')), '.........\n.........\n.........\n.........\n.........\n.........\n.........\n.........\n.........\n', '1........\n.1.......\n.........\n.........\n.........\n.........\n.........\n.........\n.........\n', '1........\n.........\n.........\n.........\n.........\n.........\n.........\n.........\n........1\n'];
    }
  },

  {
    slug: 'pairs-sum-divisible',
    title: 'Pairs Whose Sum Is Divisible by d',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'modulo', 'counting'],
    concept: {
      title: 'The partner of a remainder',
      body: [
        'Two numbers `x` and `y` have a sum divisible by `d` exactly when their remainders add up to `0` or to `d`: the remainder of `y` must be `(d - x % d) % d`, the **complement** of the remainder of `x`. Count how many earlier numbers have each remainder, and when you read `x`, add the count of the complement.',
        { code: 'count = {}\ntotal = 0\nfor x in a:\n    r = x % d\n    total += count.get((d - r) % d, 0)\n    count[r] = count.get(r, 0) + 1' },
        'The outer `% d` makes the complement of remainder 0 again 0 (two multiples of `d` add up to a multiple of `d`) and keeps `d - r` below `d`. When `r` is exactly half of `d`, the number pairs with other numbers of the same remainder, which the same formula covers.'
      ]
    },
    statement: ['Given `n` positive integers and a number `d`, count the pairs of positions `i < j` for which `a[i] + a[j]` is divisible by `d`.'],
    inputFormat: ['The first line has `n` and `d`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of pairs.'],
    constraints: ['1 <= n <= 20000', '1 <= d <= 10^9', '1 <= each number <= 10^9'],
    examples: [{ input: '6 60\n30 20 150 100 40 10\n', note: 'The pairs (30, 150), (20, 100), (20, 40) have sums 180, 120, 60.' }],
    hints: ['Look at the remainders when dividing by d.', 'The partner of remainder r has remainder `(d - r) % d`.', 'Count the earlier numbers with each remainder in a map.'],
    program: {
      io: ['n:int d:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        count = {}
        total = 0
        for x in a:
            rem = x % d
            total += count.get((d - rem) % d, 0)
            count[rem] = count.get(rem, 0) + 1
        print(total)`,
      cpp: r`
        unordered_map<long long, long long> count;
        long long total = 0;
        for (int i = 0; i < n; i++) {
            long long rem = a[i] % d;
            auto it = count.find((d - rem) % d);
            if (it != count.end()) total += it->second;
            count[rem]++;
        }
        cout << total << "\n";`,
      java: r`
        Map<Long, Long> count = new HashMap<>();
        long total = 0;
        for (int i = 0; i < n; i++) {
            long rem = a[i] % d;
            total += count.getOrDefault((d - rem) % d, 0L);
            count.merge(rem, 1L, Long::sum);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Two numbers have a sum divisible by `d` exactly when their remainders are complements of each other. A map of remainder counts gives the earlier partners.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const d = nums(rs[0])[1]; const c = new Map(); let t = 0; for (const x of nums(rs[1])) { const rem = x % d; t += c.get((d - rem) % d) || 0; c.set(rem, (c.get(rem) || 0) + 1); } return String(t); },
    tests() {
      const g = rng(356);
      const make = (n, hi, d) => `${n} ${d}\n${randArray(g, n, 1, hi).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const d = nums(rs[0])[1]; const a = nums(rs[1]); let t = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if ((a[i] + a[j]) % d === 0) t++; return t; };
      crossCheck(() => make(randInt(g, 1, 12), 30, randInt(g, 1, 9)), (i) => this.solve(i), brute);
      return ['6 60\n30 20 150 100 40 10\n', '2 5\n2 3\n', '2 5\n2 4\n', '3 1\n1 2 3\n', '3 2\n2 4 6\n', make(30, 100, 60), make(20000, 1000000000, 60), make(20000, 1000000000, 1), make(20000, 1000000000, 999999937), make(20000, 1000, 2), make(20000, 100, 100)];
    }
  },

  {
    slug: 'max-number-of-k-sum-pairs',
    title: 'Remove Pairs With Sum k',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'counting', 'greedy'],
    concept: {
      title: 'Each number is used once, so pair up the counts',
      body: [
        'In one operation you pick two numbers that add up to `k` and remove them. Because every number can be removed only once, the question is how many disjoint pairs exist. Count the values. For a value `x` with partner `y = k - x`: if `x` and `y` are different, you can form `min(count[x], count[y])` pairs; count each such couple only **once** (for `x < y`). If `x = y`, the numbers pair among themselves: `count[x] // 2` pairs.',
        { code: 'ops = 0\nfor x, c in count.items():\n    y = k - x\n    if x < y and y in count:\n        ops += min(c, count[y])\n    elif x == y:\n        ops += c // 2' },
        'This is a good example where counting beats checking pairs of positions: the answer depends only on how many copies of each value there are.'
      ]
    },
    statement: ['Given `n` integers and a number `k`, you may repeat this operation: choose two different elements whose sum is `k` and remove them both. Print the largest possible number of operations.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the largest number of operations.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9', '-2 * 10^9 <= k <= 2 * 10^9'],
    examples: [{ input: '5 5\n1 2 3 4 4\n', note: 'Remove (1, 4) and (2, 3): two operations.' }, { input: '5 6\n3 1 3 4 3\n', note: 'Remove (3, 3) once: the other 3 has no partner.' }],
    hints: ['Count the copies of each value.', 'For different partners x and `k - x` you can form the smaller of the two counts of pairs.', 'For `x = k - x` you can form `count // 2` pairs.'],
    program: {
      io: ['n:int k:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        count = {}
        for x in a:
            count[x] = count.get(x, 0) + 1
        ops = 0
        for x, c in count.items():
            y = k - x
            if x < y and y in count:
                ops += min(c, count[y])
            elif x == y:
                ops += c // 2
        print(ops)`,
      cpp: r`
        unordered_map<long long, int> count;
        for (int i = 0; i < n; i++) count[a[i]]++;
        long long ops = 0;
        for (auto& entry : count) {
            long long x = entry.first, y = k - x;
            if (x < y) {
                auto it = count.find(y);
                if (it != count.end()) ops += min(entry.second, it->second);
            } else if (x == y) {
                ops += entry.second / 2;
            }
        }
        cout << ops << "\n";`,
      java: r`
        Map<Long, Integer> count = new HashMap<>();
        for (int i = 0; i < n; i++) count.merge(a[i], 1, Integer::sum);
        long ops = 0;
        for (Map.Entry<Long, Integer> entry : count.entrySet()) {
            long x = entry.getKey(), y = k - x;
            if (x < y) {
                Integer other = count.get(y);
                if (other != null) ops += Math.min(entry.getValue(), other);
            } else if (x == y) {
                ops += entry.getValue() / 2;
            }
        }
        System.out.println(ops);`
    },
    solution: { explanation: ['The number of disjoint pairs only depends on the counts: `min(count[x], count[k - x])` for each couple of different values, and `count // 2` for a value that pairs with itself.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const c = counts(nums(rs[1])); let ops = 0; for (const [x, cx] of c) { const y = k - x; if (x < y && c.has(y)) ops += Math.min(cx, c.get(y)); else if (x === y) ops += Math.floor(cx / 2); } return String(ops); },
    tests() {
      const g = rng(357);
      const make = (n, lo, hi, k) => `${n} ${k}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      const brute = (i) => { const rs = rows(i); const k = nums(rs[0])[1]; const a = nums(rs[1]); let best = 0; const go = (used, ops) => { best = Math.max(best, ops); for (let x = 0; x < a.length; x++) if (!(used & (1 << x))) for (let y = x + 1; y < a.length; y++) if (!(used & (1 << y)) && a[x] + a[y] === k) go(used | (1 << x) | (1 << y), ops + 1); }; go(0, 0); return best; };
      crossCheck(() => make(randInt(g, 1, 9), -3, 3, randInt(g, -3, 3)), (i) => this.solve(i), brute, 100);
      return ['5 5\n1 2 3 4 4\n', '5 6\n3 1 3 4 3\n', '1 4\n2\n', '2 4\n2 2\n', '3 100\n1 2 3\n', make(30, -5, 5, 2), make(2000, -100, 100, 0), make(20000, -1000000000, 1000000000, 7), make(20000, 0, 100, 100), make(20000, 0, 3, 4), make(20000, -50000, 50000, 0)];
    }
  },

  {
    slug: 'equal-row-and-column',
    title: 'Rows That Equal Columns',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'matrix', 'sequences'],
    concept: {
      title: 'Whole rows as keys',
      body: [
        'Count the pairs `(r, c)` for which row `r` and column `c` of a square matrix contain exactly the same numbers in the same order. Comparing every row with every column costs `n^3`. Instead use **the whole row as a key** of a hash map: store how often each row occurs. Then turn each column into the same kind of key and look it up.',
        { code: 'rows_count = {}\nfor row in g:\n    key = tuple(row)\n    rows_count[key] = rows_count.get(key, 0) + 1\ntotal = 0\nfor j in range(n):\n    total += rows_count.get(tuple(g[i][j] for i in range(n)), 0)' },
        'A sequence of numbers can be a map key (a tuple in Python, a `vector` in C++, a `List` or a joined string in Java). Hashing a key of length `n` costs `n`, so the whole job is `n^2` instead of `n^3`.'
      ]
    },
    statement: ['Given a square matrix with `n` rows and `n` columns, count the pairs (row `r`, column `c`) such that row `r` read from left to right is the same sequence as column `c` read from top to bottom. Different rows (or columns) that look alike are counted separately.'],
    inputFormat: ['The first line has `n`.', 'The next `n` lines have `n` integers each.'],
    outputFormat: ['Print the number of pairs.'],
    constraints: ['1 <= n <= 300', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '3\n3 2 1\n1 7 6\n2 7 7\n', note: 'Row 3 (2 7 7) is the same sequence as column 2 (2 7 7); no other row equals a column: 1 pair.' }],
    hints: ['Turn every row into a key and count the rows with a map.', 'Turn every column into the same kind of key.', 'For each column add the number of equal rows.'],
    program: {
      io: ['n:int', 'g:int[n][n]'],
      fast: true,
      includes: ['<map>'],
      python: r`
        rowsCount = {}
        for row in g:
            key = tuple(row)
            rowsCount[key] = rowsCount.get(key, 0) + 1
        total = 0
        for j in range(n):
            col = tuple(g[i][j] for i in range(n))
            total += rowsCount.get(col, 0)
        print(total)`,
      cpp: r`
        map<vector<long long>, long long> rowsCount;
        for (int i = 0; i < n; i++) rowsCount[g[i]]++;
        long long total = 0;
        for (int j = 0; j < n; j++) {
            vector<long long> col(n);
            for (int i = 0; i < n; i++) col[i] = g[i][j];
            auto it = rowsCount.find(col);
            if (it != rowsCount.end()) total += it->second;
        }
        cout << total << "\n";`,
      java: r`
        Map<String, Integer> rowsCount = new HashMap<>();
        for (int i = 0; i < n; i++) {
            StringBuilder key = new StringBuilder();
            for (int j = 0; j < n; j++) key.append(g[i][j]).append(',');
            rowsCount.merge(key.toString(), 1, Integer::sum);
        }
        long total = 0;
        for (int j = 0; j < n; j++) {
            StringBuilder key = new StringBuilder();
            for (int i = 0; i < n; i++) key.append(g[i][j]).append(',');
            total += rowsCount.getOrDefault(key.toString(), 0);
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Rows are counted in a map keyed by the whole sequence; every column is turned into the same kind of key and looked up.'], complexity: 'Time O(n^2) on average, space O(n^2).' },
    solve(input) { const rs = rows(input); const n = Number(rs[0]); const g = rs.slice(1, 1 + n).map(nums); const c = new Map(); for (const row of g) c.set(row.join(','), (c.get(row.join(',')) || 0) + 1); let t = 0; for (let j = 0; j < n; j++) t += c.get(g.map((row) => row[j]).join(',')) || 0; return String(t); },
    tests() {
      const g = rng(358);
      const sq = (n, lo, hi) => `${n}\n${many(n, () => randArray(g, n, lo, hi).join(' ')).join('\n')}\n`;
      const sym = (n, lo, hi) => { const m = Array.from({ length: n }, () => Array(n).fill(0)); for (let i = 0; i < n; i++) for (let j = i; j < n; j++) m[i][j] = m[j][i] = randInt(g, lo, hi); return `${n}\n${m.map((row) => row.join(' ')).join('\n')}\n`; };
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const m = rs.slice(1, 1 + n).map(nums); let t = 0; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { let same = true; for (let k = 0; k < n; k++) if (m[r][k] !== m[k][c]) same = false; if (same) t++; } return t; };
      crossCheck(() => (g() < 0.5 ? sq(randInt(g, 1, 4), 0, 1) : sym(randInt(g, 1, 5), 0, 2)), (i) => this.solve(i), brute);
      return ['3\n3 2 1\n1 7 6\n2 7 7\n', '1\n5\n', '2\n1 2\n2 1\n', '2\n1 2\n3 4\n', sq(6, 0, 1), sym(7, 0, 2), sym(100, -1000000000, 1000000000), sym(300, -1000000000, 1000000000), sq(300, 0, 1), sym(300, 0, 1), `300\n${many(300, () => Array(300).fill(7).join(' ')).join('\n')}\n`];
    }
  },

  {
    slug: 'unique-email-addresses',
    title: 'Count the Real Mailboxes',
    difficulty: 'medium',
    tags: ['hashing', 'hash-set', 'strings', 'normalisation'],
    concept: {
      title: 'Normalise first, then put into a set',
      body: [
        'Several different-looking texts can mean the same thing. The trick for counting the **really different** ones is to convert each text to a **normal form** (a fixed way of writing it) and put the normal forms in a set. The size of the set is the answer.',
        { code: 'local, domain = email.split("@")\nlocal = local.split("+")[0].replace(".", "")\nnormal = local + "@" + domain' },
        'The rules here: in the part before the `@`, dots do not matter, and everything from the first `+` on is ignored. The part after the `@` (the domain) is used exactly as written.'
      ]
    },
    statement: ['An email address is a local part, an `@` and a domain. In the local part, all dots are ignored, and the first `+` and everything after it (up to the `@`) is ignored. The domain is not changed. Two addresses reach the same mailbox if they are equal after these rules. Given `n` addresses, count how many different mailboxes they reach.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` addresses (each without spaces).'],
    outputFormat: ['Print the number of different mailboxes.'],
    constraints: ['1 <= n <= 20000', 'Each address has one `@`, a local part of letters, dots and `+` that starts with a letter, and a domain of lowercase letters and dots.', 'Each address has at most 40 characters.'],
    examples: [{ input: '3\ntest.email+alex@mail.com test.e.mail+bob.cathy@mail.com testemail+david@lee.tcode.com\n', note: 'The first two are the mailbox testemail@mail.com; the third has another domain: 2 mailboxes.' }],
    hints: ['Split the address at the `@`.', 'Cut the local part at the first `+` and remove all dots.', 'Put the normal form into a set; the answer is the size of the set.'],
    program: {
      io: ['n:int', 'e:word[n]'],
      fast: true,
      includes: ['<unordered_set>'],
      python: r`
        unique = set()
        for email in e:
            local, domain = email.split("@")
            local = local.split("+")[0].replace(".", "")
            unique.add(local + "@" + domain)
        print(len(unique))`,
      cpp: r`
        unordered_set<string> unique;
        for (int i = 0; i < n; i++) {
            size_t at = e[i].find('@');
            string clean;
            for (size_t j = 0; j < at; j++) {
                if (e[i][j] == '+') break;
                if (e[i][j] != '.') clean += e[i][j];
            }
            unique.insert(clean + e[i].substr(at));
        }
        cout << unique.size() << "\n";`,
      java: r`
        Set<String> unique = new HashSet<>();
        for (int i = 0; i < n; i++) {
            int at = e[i].indexOf('@');
            StringBuilder clean = new StringBuilder();
            for (int j = 0; j < at; j++) {
                char ch = e[i].charAt(j);
                if (ch == '+') break;
                if (ch != '.') clean.append(ch);
            }
            unique.add(clean + e[i].substring(at));
        }
        System.out.println(unique.size());`
    },
    solution: { explanation: ['Each address is converted to its normal form (no dots, cut at `+`, same domain); the set of normal forms counts the mailboxes.'], complexity: 'Time O(total length), space O(total length).' },
    solve(input) { const set = new Set(); for (const email of rows(input)[1].split(' ')) { const [l, d] = email.split('@'); set.add(l.split('+')[0].replace(/\./g, '') + '@' + d); } return String(set.size); },
    tests() {
      const g = rng(359);
      const domains = ['mail.com', 'lee.tcode.com', 'x.org', 'a.b.c', 'mail.com'];
      const mailbox = (k) => many(k, () => randWord(g, randInt(g, 2, 6), 'abc')).map((l) => ({ l, d: domains[randInt(g, 0, 4)] }));
      const variant = ({ l, d }) => { let s = ''; for (const ch of l) { s += ch; if (g() < 0.4) s += '.'; } s = s.replace(/\.$/, ''); if (g() < 0.5) s += '+' + randWord(g, randInt(g, 1, 5), 'ab.+c'); return `${s}@${d}`; };
      const build = (n, boxes) => `${n}\n${many(n, () => variant(boxes[randInt(g, 0, boxes.length - 1)])).join(' ')}\n`;
      return ['3\ntest.email+alex@mail.com test.e.mail+bob.cathy@mail.com testemail+david@lee.tcode.com\n', '1\na@b.c\n', '2\na.b@x.org ab@x.org\n', '2\nab@x.org ab@y.org\n', '3\na+b@x.org a+c@x.org a@x.org\n', build(10, mailbox(4)), build(300, mailbox(40)), build(20000, mailbox(200)), build(20000, mailbox(3000)), build(20000, mailbox(20000)), build(20000, mailbox(1))];
    }
  },

  {
    slug: 'shortest-subarray-same-degree',
    title: 'Shortest Block With the Same Degree',
    difficulty: 'medium',
    tags: ['hashing', 'hash-map', 'counting', 'subarray'],
    concept: {
      title: 'Count, first position and last position of every value',
      body: [
        'The **degree** of an array is the largest number of times any single value occurs. You look for the shortest block of consecutive elements that has the same degree as the whole array. Such a block must contain all copies of a value that reaches the degree, and it is shortest if it starts at the **first** copy and ends at the **last** copy of that value.',
        { code: 'first, last, count = {}, {}, {}\nfor i, x in enumerate(a):\n    first.setdefault(x, i)\n    last[x] = i\n    count[x] = count.get(x, 0) + 1\ndegree = max(count.values())\nbest = min(last[x] - first[x] + 1 for x in count if count[x] == degree)' },
        'Three maps (count, first position, last position) are filled in one pass. If several values reach the degree, the best block is the shortest one among them.'
      ]
    },
    statement: ['The degree of an array is the largest number of times any value occurs in it. Find the length of the shortest block of consecutive elements that has the same degree as the whole array.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the length of the shortest block.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5\n1 2 2 3 1\n', note: 'The degree is 2 (the values 1 and 2). The block 2 2 has length 2.' }],
    hints: ['Find the degree: the largest count of any value.', 'For a value with that count, the shortest block runs from its first to its last position.', 'Keep the smallest length over all such values.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<unordered_map>', '<algorithm>'],
      python: r`
        first, last, count = {}, {}, {}
        for i, x in enumerate(a):
            if x not in first:
                first[x] = i
            last[x] = i
            count[x] = count.get(x, 0) + 1
        degree = max(count.values())
        best = n
        for x, c in count.items():
            if c == degree:
                best = min(best, last[x] - first[x] + 1)
        print(best)`,
      cpp: r`
        unordered_map<long long, int> first, last, count;
        for (int i = 0; i < n; i++) {
            if (!first.count(a[i])) first[a[i]] = i;
            last[a[i]] = i;
            count[a[i]]++;
        }
        int degree = 0;
        for (auto& entry : count) degree = max(degree, entry.second);
        int best = n;
        for (auto& entry : count) {
            if (entry.second == degree) best = min(best, last[entry.first] - first[entry.first] + 1);
        }
        cout << best << "\n";`,
      java: r`
        Map<Long, Integer> first = new HashMap<>(), last = new HashMap<>(), count = new HashMap<>();
        for (int i = 0; i < n; i++) {
            first.putIfAbsent(a[i], i);
            last.put(a[i], i);
            count.merge(a[i], 1, Integer::sum);
        }
        int degree = 0;
        for (int c : count.values()) degree = Math.max(degree, c);
        int best = (int) n;
        for (Map.Entry<Long, Integer> entry : count.entrySet()) {
            if (entry.getValue() == degree) best = Math.min(best, last.get(entry.getKey()) - first.get(entry.getKey()) + 1);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['A value that reaches the degree needs all its copies inside the block, so the shortest block runs from its first to its last position. The best over all such values is the answer.'], complexity: 'Time O(n) on average, space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const first = new Map(), last = new Map(), cnt = new Map(); a.forEach((x, i) => { if (!first.has(x)) first.set(x, i); last.set(x, i); cnt.set(x, (cnt.get(x) || 0) + 1); }); const deg = Math.max(...cnt.values()); let best = a.length; for (const [x, c] of cnt) if (c === deg) best = Math.min(best, last.get(x) - first.get(x) + 1); return String(best); },
    tests() {
      const g = rng(360);
      const brute = (i) => { const a = nums(rows(i)[1]); const deg = Math.max(...counts(a).values()); for (let len = 1; len <= a.length; len++) for (let s = 0; s + len <= a.length; s++) if (Math.max(...counts(a.slice(s, s + len)).values()) === deg) return len; return a.length; };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 10), 0, 3)), (i) => this.solve(i), brute);
      return ['5\n1 2 2 3 1\n', '1\n9\n', '4\n1 2 3 4\n', '4\n7 7 7 7\n', '6\n1 2 2 3 1 4\n', arr(randArray(g, 30, -3, 3)), arr(randArray(g, 2000, -50, 50)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, 0, 100)), arr(randArray(g, 20000, 0, 2)), arr(many(20000, (i) => i))];
    }
  }
];
