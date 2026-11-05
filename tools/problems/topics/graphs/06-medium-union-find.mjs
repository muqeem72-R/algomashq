import { r, rng, randInt, many, nums, rows, shuffle, randWord } from '../../lib.mjs';
import { graphText, randomEdges, randomTreeEdges, connectedEdges, adjacency, components, mix, Dsu } from '../../graphlib.mjs';
import { J, ADJ, DSU, EDGE_INPUT, WEDGE_INPUT, EDGE_LIMITS } from '../../graphcode.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const parse = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); return { n, m, edges: many(m, (i) => nums(rs[i + 1])), rs }; };
const E = (g, n, m) => mix(g, randomEdges(g, n, m));
const W = (g, n, m, hi) => mix(g, randomEdges(g, n, m, [1, hi]));
const WC = (g, n, extra, hi) => connectedEdges(g, n, extra, [1, hi]);
const key = (n, u, v) => Math.min(u, v) * (n + 1) + Math.max(u, v);

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n`: the number of nodes and also the number of edges.', 'Each of the next `n` lines has two numbers `u` and `v`: an edge between the nodes `u` and `v`.'],
    constraints: ['3 <= n <= 20000', 'The edges are a tree on the nodes 1 to n with one extra edge added (so there is exactly one cycle).', 'There are no self-loops and no repeated edges.'],
    slug: 'redundant-connection',
    title: 'Which Edge Closes the Cycle?',
    tags: ['graph', 'union-find', 'cycle'],
    concept: {
      title: 'Add the edges in the given order; the first edge whose ends are already connected is the one',
      body: [
        'A tree with `n` nodes has `n - 1` edges. Here one **extra** edge was added, so the graph has exactly one cycle, and removing **any** edge of that cycle would give a tree again. The task: print the extra edge, meaning the one among the cycle edges that appears **last** in the input.',
        'Use union-find and add the edges **in the order of the input**. While the edges seen so far form a forest, each new edge joins two different groups (a *union*). At some moment an edge has both ends in the **same** group: it closes the cycle. Since the first `n - 1` or fewer edges before that moment were still a forest, all the other cycle edges came before this one, so it is the last cycle edge in the input, exactly the one asked for.',
        { code: 'for u, v in edges:\n    if not union(u, v):             # the ends were already connected\n        print(u, v)\n        break' },
        'There is only one cycle in the whole graph, so there is exactly one such moment. Union by size and path compression make every operation almost constant, so the time is O(n * alpha(n)).'
      ]
    },
    statement: ['The `n` edges join `n` nodes into a tree plus one extra edge, so the graph has exactly one cycle. Removing any edge of the cycle leaves a tree. Print the edge of the cycle that appears last in the input, written exactly as it appears in the input.'],
    outputFormat: ['Print the two numbers of the edge.'],
    examples: [{ input: '3\n1 2\n1 3\n2 3\n', note: 'The three edges form a triangle; the last one is 2 3.' }, { input: '4\n1 2\n2 3\n3 4\n1 4\n', note: 'The cycle 1-2-3-4 is closed by the last edge: 1 4.' }],
    hints: ['Use union-find; start with every node as its own group.', 'Take the edges in the input order and merge the groups of the two ends.', 'The first edge whose ends are already in the same group is the answer.'],
    program: {
      io: ['n:int', 'edges:int[n][2]'],
      fast: true,
      helpers: DSU,
      python: r`
        parent.extend(range(n + 1))
        size.extend([1] * (n + 1))
        for u, v in edges:
            if not union(u, v):
                print(u, v)
                break`,
      cpp: r`
        parent.resize(n + 1);
        sizes.assign(n + 1, 1);
        for (int v = 0; v <= n; v++) parent[v] = v;
        for (const vector<long long>& e : edges) {
            if (!unite((int)e[0], (int)e[1])) {
                cout << e[0] << " " << e[1] << "\n";
                break;
            }
        }`,
      java: r`
        int nodes = (int) n;
        parent = new int[nodes + 1];
        sizes = new int[nodes + 1];
        for (int v = 0; v <= nodes; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        for (long[] e : edges) {
            if (!unite((int) e[0], (int) e[1])) {
                System.out.println(e[0] + " " + e[1]);
                break;
            }
        }`
    },
    solution: { explanation: ['With union-find the edges are added in input order; the first edge whose two ends are already in the same group closes the only cycle, and it is the last cycle edge in the input.'], complexity: 'Time O(n * alpha(n)), space O(n).' },
    solve(input) { const rs = rows(input); const n = Number(rs[0]); const d = new Dsu(n); for (let i = 1; i <= n; i++) { const [u, v] = nums(rs[i]); if (!d.union(u, v)) return `${u} ${v}`; } throw new Error('no cycle'); },
    tests() {
      const g = rng(951); const out = ['3\n1 2\n1 3\n2 3\n', '4\n1 2\n2 3\n3 4\n1 4\n'];
      const build = (n, shape) => { const tree = randomTreeEdges(g, n, shape); const have = new Set(tree.map(([a, b]) => key(n, a, b))); for (;;) { const u = randInt(g, 1, n), v = randInt(g, 1, n); if (u === v || have.has(key(n, u, v))) continue; return `${n}\n${mix(g, [...tree, [u, v]]).map((e) => e.join(' ')).join('\n')}\n`; } };
      for (const [n, shape] of [[3, 'random'], [5, 'random'], [10, 'path'], [100, 'random'], [100, 'star'], [3000, 'binary'], [20000, 'random'], [20000, 'path'], [20000, 'deep']]) { out.push(build(n, shape)); out.push(build(n, shape)); }
      out.push(`20000\n${[...many(19999, (i) => `${i + 1} ${i + 2}`), '1 20000'].join('\n')}\n`, `20000\n${['1 20000', ...many(19999, (i) => `${i + 1} ${i + 2}`)].join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `m`: the number of people and the number of log entries.', 'Each of the next `m` lines has three numbers `t`, `a` and `b`: at the time `t` the people `a` and `b` became friends.'],
    constraints: ['2 <= n <= 20000', '1 <= m <= 30000', '1 <= t <= 10^9, and the log is not sorted by time', '1 <= a, b <= n, a != b'],
    slug: 'earliest-moment-all-connected',
    title: 'When Does Everyone Know Everyone?',
    tags: ['graph', 'union-find', 'sorting'],
    concept: {
      title: 'Replay the events in time order; stop when only one group is left',
      body: [
        'Friendships appear over time: the log entry `(t, a, b)` says that `a` and `b` became friends at the time `t`. Friendship is transitive for this question: a group is a set of people connected through chains of friends. At what time did the whole crowd become **one group** for the first time? Print -1 if it never happens.',
        'The log is not in time order, so first **sort** it by `t`. Then replay the events with union-find, keeping a counter of the number of groups: it starts at `n`, and every union that really merges two groups lowers it by 1. The moment the counter reaches 1, the current time is the answer.',
        { code: 'logs.sort()                       # by time\ngroups = n\nfor t, a, b in logs:\n    if union(a, b):\n        groups -= 1\n        if groups == 1:\n            print(t)\n            break\nelse:\n    print(-1)' },
        'The idea "sort the events and apply them in order with union-find" is also how Kruskal\'s algorithm works, and the same pattern answers many offline questions about a graph that grows over time. The cost is the sorting, O(m log m).'
      ]
    },
    statement: ['There are `n` people. Each of `m` log entries `t a b` says that at the time `t` the people `a` and `b` became friends (the entries are not sorted). People are connected if they are linked by a chain of friends that already exist. Print the earliest time at which all the people are connected, or -1 if this never happens.'],
    outputFormat: ['Print the time or -1.'],
    examples: [{ input: '4 3\n1 1 2\n3 2 3\n2 3 4\n', note: 'At time 1: {1, 2}; at time 2: {1, 2} and {3, 4}; at time 3 the two groups join: 3.' }],
    hints: ['Sort the log entries by time.', 'Use union-find and count the groups; each successful union lowers the count.', 'When the count becomes 1, print the time of the entry; if it never does, print -1.'],
    program: {
      io: ['n:int m:int', 'logs:int[m][3]'],
      fast: true,
      includes: ['<algorithm>'],
      helpers: DSU,
      python: r`
        parent.extend(range(n + 1))
        size.extend([1] * (n + 1))
        logs.sort()
        groups = n
        answer = -1
        for t, a, b in logs:
            if union(a, b):
                groups -= 1
                if groups == 1:
                    answer = t
                    break
        print(answer)`,
      cpp: r`
        parent.resize(n + 1);
        sizes.assign(n + 1, 1);
        for (int v = 0; v <= n; v++) parent[v] = v;
        sort(logs.begin(), logs.end());
        long long groups = n, answer = -1;
        for (const vector<long long>& entry : logs) {
            if (unite((int)entry[1], (int)entry[2])) {
                groups--;
                if (groups == 1) {
                    answer = entry[0];
                    break;
                }
            }
        }
        cout << answer << "\n";`,
      java: r`
        int people = (int) n;
        parent = new int[people + 1];
        sizes = new int[people + 1];
        for (int v = 0; v <= people; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        Arrays.sort(logs, (x, y) -> Long.compare(x[0], y[0]));
        long groups = n, answer = -1;
        for (long[] entry : logs) {
            if (unite((int) entry[1], (int) entry[2])) {
                groups--;
                if (groups == 1) {
                    answer = entry[0];
                    break;
                }
            }
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['The log is sorted by time and replayed with union-find; the number of groups starts at n and drops with each real merge. The time of the entry that brings it to 1 is the answer, or -1.'], complexity: 'Time O(m log m), space O(n).' },
    solve(input) { const { n, edges } = parse(input); const logs = edges.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]); const d = new Dsu(n); let groups = n; for (const [t, a, b] of logs) if (d.union(a, b) && --groups === 1) return String(t); return '-1'; },
    tests() {
      const g = rng(952); const out = ['4 3\n1 1 2\n3 2 3\n2 3 4\n', '2 1\n5 1 2\n', '3 1\n1 1 2\n'];
      const make = (n, m, connected) => { const base = connected ? connectedEdges(g, n, Math.max(0, m - (n - 1))) : randomEdges(g, n, m); const logs = shuffle(g, base.map(([a, b]) => `${randInt(g, 1, 1000000000)} ${a} ${b}`)); return `${n} ${logs.length}\n${logs.join('\n')}\n`; };
      for (const [n, m, c] of [[4, 5, true], [10, 12, true], [10, 6, false], [100, 150, true], [100, 80, false], [3000, 5000, true], [20000, 30000, true], [20000, 19999, true], [20000, 25000, false], [20000, 30000, false]]) out.push(make(n, m, c));
      // the same time on many entries, and an exactly sorted log
      out.push(`20000 19999\n${many(19999, (i) => `7 ${i + 1} ${i + 2}`).join('\n')}\n`, `20000 19999\n${many(19999, (i) => `${i + 1} ${i + 1} ${i + 2}`).join('\n')}\n`, `20000 19999\n${many(19999, (i) => `${20000 - i} ${i + 1} ${i + 2}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, the number of stones.', 'Each of the next `n` lines has two numbers `x` and `y`: the row and the column of a stone.'],
    constraints: ['1 <= n <= 20000', '0 <= x, y <= 10^9', 'No two stones are on the same square.'],
    slug: 'most-stones-removed',
    title: 'Remove As Many Stones As You Can',
    tags: ['graph', 'union-find', 'hashing'],
    concept: {
      title: 'Stones that share a row or a column belong to one group, and each group can be reduced to one stone',
      body: [
        'Stones lie on squares of an infinite grid. In one move you can remove a stone that has another stone **in the same row or in the same column** (the other stone must still be on the board). What is the largest number of stones you can remove?',
        'Build a graph: two stones are connected if they share a row or a column. In a connected group of `k` stones you can always remove `k - 1` stones, leaving one: remove the stones in the order of a search from the group, starting with the farthest ones, so that every removed stone still has a neighbour. The last stone of a group has no partner. So the answer is **`n` minus the number of groups**.',
        'Counting the groups is a union-find job, but the stones are not nodes joined by listed edges. A neat trick: let the **rows and columns** be the nodes. A stone at `(x, y)` is an edge between the row `x` and the column `y`, so each stone **merges the row `x` and the column `y`**. Two stones are in the same group exactly when their rows/columns are connected. Count the groups of rows/columns that contain stones; each group of nodes is one group of stones.',
        { code: 'ids = {}                                       # a row or a column -> a number\ndef node(kind, value):\n    return ids.setdefault((kind, value), len(ids))\ngroups = 0\nfor x, y in stones:\n    a, b = node("row", x), node("col", y)\n    # make sure the union-find has places for a and b, then union(a, b)\n# groups = number of different roots among the nodes\nanswer = n - groups' },
        'Coordinates up to 10^9 are mapped to small numbers with a dictionary. Each stone causes one union, so the time is O(n * alpha(n)).'
      ]
    },
    statement: ['`n` stones lie on different squares of a grid, the stone `i` at the row `x` and the column `y`. A stone can be removed if another stone that is still there lies in the same row or in the same column. Print the largest number of stones that can be removed.'],
    outputFormat: ['Print the largest number of stones that can be removed.'],
    examples: [{ input: '6\n0 0\n0 1\n1 0\n1 2\n2 1\n2 2\n', note: 'All six stones are connected through rows and columns, so five can be removed: 5.' }],
    hints: ['Treat every row and every column that has a stone as a node; a stone joins its row and its column.', 'Count the connected groups with union-find (map the coordinates to small numbers with a dictionary).', 'In each group all stones but one can be removed: the answer is n minus the number of groups.'],
    program: {
      io: ['n:int', 'stones:int[n][2]'],
      fast: true,
      includes: ['<map>'],
      helpers: DSU,
      python: r`
        ids = {}
        pairs = []
        for x, y in stones:
            a = ids.setdefault(("row", x), len(ids))
            b = ids.setdefault(("col", y), len(ids))
            pairs.append((a, b))
        parent.extend(range(len(ids)))
        size.extend([1] * len(ids))
        groups = len(ids)
        for a, b in pairs:
            if union(a, b):
                groups -= 1
        print(n - groups)`,
      cpp: r`
        map<pair<int, long long>, int> ids;
        vector<pair<int, int>> pairsList;
        for (const vector<long long>& s : stones) {
            int a, b;
            auto itRow = ids.find({0, s[0]});
            if (itRow == ids.end()) {
                a = (int)ids.size();
                ids[{0, s[0]}] = a;
            } else {
                a = itRow->second;
            }
            auto itCol = ids.find({1, s[1]});
            if (itCol == ids.end()) {
                b = (int)ids.size();
                ids[{1, s[1]}] = b;
            } else {
                b = itCol->second;
            }
            pairsList.push_back({a, b});
        }
        int count = (int)ids.size();
        parent.resize(count);
        sizes.assign(count, 1);
        for (int v = 0; v < count; v++) parent[v] = v;
        long long groups = count;
        for (const auto& pr : pairsList) {
            if (unite(pr.first, pr.second)) groups--;
        }
        cout << n - groups << "\n";`,
      java: r`
        Map<String, Integer> ids = new HashMap<>();
        List<int[]> pairsList = new ArrayList<>();
        for (long[] s : stones) {
            int a = ids.computeIfAbsent("r" + s[0], k -> ids.size());
            int b = ids.computeIfAbsent("c" + s[1], k -> ids.size());
            pairsList.add(new int[] {a, b});
        }
        int count = ids.size();
        parent = new int[count];
        sizes = new int[count];
        for (int v = 0; v < count; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        long groups = count;
        for (int[] pr : pairsList) {
            if (unite(pr[0], pr[1])) groups--;
        }
        System.out.println(n - groups);`
    },
    solution: { explanation: ['Rows and columns are the nodes of a union-find (their coordinates are mapped to small numbers), and each stone merges its row with its column. All stones of a group but one can be removed, so the answer is n minus the number of groups.'], complexity: 'Time O(n * alpha(n)), space O(n).' },
    solve(input) {
      const stones = rows(input).slice(1).map((l) => nums(l)); const rowsOf = new Map(), colsOf = new Map();
      const d = new Dsu(2 * stones.length + 2); let next = 0; const id = (map, v) => { if (!map.has(v)) map.set(v, ++next); return map.get(v); }; const used = new Set();
      for (const [x, y] of stones) { const a = id(rowsOf, x), b = id(colsOf, y); d.union(a, b); used.add(a); used.add(b); }
      const roots = new Set([...used].map((v) => d.find(v))); return String(stones.length - roots.size);
    },
    tests() {
      const g = rng(953); const out = ['6\n0 0\n0 1\n1 0\n1 2\n2 1\n2 2\n', '1\n5 5\n', '2\n0 0\n1 1\n', '2\n0 0\n0 1\n'];
      // the most removals over all orders, found by trying every move (memoised on the set of stones that are left)
      const brute = (input) => { const stones = rows(input).slice(1).map((l) => nums(l)); const memo = new Map(); const best = (mask) => { if (memo.has(mask)) return memo.get(mask); let b = 0; for (let i = 0; i < stones.length; i++) { if (!(mask >> i & 1)) continue; if (stones.some((s, j) => j !== i && (mask >> j & 1) && (s[0] === stones[i][0] || s[1] === stones[i][1]))) b = Math.max(b, 1 + best(mask & ~(1 << i))); } memo.set(mask, b); return b; }; return String(best((1 << stones.length) - 1)); };
      const make = (n, span) => { const seen = new Set(); const list = []; while (list.length < Math.min(n, span * span)) { const x = randInt(g, 0, span - 1), y = randInt(g, 0, span - 1); if (seen.has(`${x},${y}`)) continue; seen.add(`${x},${y}`); list.push(`${x} ${y}`); } return `${list.length}\n${list.join('\n')}\n`; };
      crossCheck(() => make(randInt(g, 1, 9), 4), (i) => this.solve(i), brute, 200);
      for (const [n, span] of [[10, 5], [100, 30], [1000, 100], [5000, 1000], [20000, 1000000000], [20000, 30000], [20000, 200], [20000, 150]]) out.push(make(n, span));
      out.push(`20000\n${many(20000, (i) => `${i} ${i}`).join('\n')}\n`, `20000\n${many(20000, (i) => `0 ${i}`).join('\n')}\n`, `20000\n${many(20000, (i) => `${i} ${(i + 1) % 20000}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `m`: the length of the string and the number of pairs.', 'The second line has the string `s` of `n` lowercase letters.', 'Each of the next `m` lines has two positions `a` and `b` (counted from 1): the letters at these positions may be swapped, as often as you like.'],
    constraints: ['2 <= n <= 20000', '1 <= m <= 30000', '1 <= a, b <= n, a != b'],
    slug: 'smallest-string-with-swaps',
    title: 'The Smallest String After Allowed Swaps',
    tags: ['graph', 'union-find', 'sorting', 'strings'],
    concept: {
      title: 'Swappable positions form groups; inside a group any order is possible, so sort it',
      body: [
        'You may swap the letters at the positions of any given pair, any number of times. If you can swap positions `a` and `b`, and also `b` and `c`, then you can bring the letters of `a`, `b` and `c` into **any order** (swapping neighbours in a chain gives every permutation). So the positions fall into **groups** connected through the pairs, and inside a group the letters can be arranged freely.',
        'To get the lexicographically smallest string, arrange the letters inside every group in **increasing order along the positions of the group**: the smallest letter at the smallest position, and so on. Nothing else can be improved.',
        { code: 'for a, b in pairs:\n    union(a, b)\ngroups = {}\nfor i in range(n):\n    groups.setdefault(find(i), []).append(i)       # the positions of a group, in increasing order\nresult = list(s)\nfor positions in groups.values():\n    letters = sorted(s[i] for i in positions)\n    for i, letter in zip(positions, letters):       # the smallest letters at the smallest positions\n        result[i] = letter' },
        'Sorting all groups costs O(n log n) in total. The same "connected positions can be permuted freely" argument solves several swap puzzles.'
      ]
    },
    statement: ['A string `s` of length `n` and `m` pairs of positions are given. In one operation you can swap the letters at the two positions of any pair; you may use the operations as often as you like and in any order. Print the lexicographically smallest string you can make.'],
    outputFormat: ['Print the string.'],
    examples: [{ input: '4 2\ndcab\n1 4\n2 3\n', note: 'The positions {1, 4} hold d and b, and {2, 3} hold c and a. Sorted inside the groups: b a c d.' }],
    hints: ['Use union-find to group the positions that are connected through the pairs.', 'Collect the positions of every group (in increasing order) and the letters at them.', 'Sort the letters and write them back to the positions of the group in order.'],
    program: {
      io: ['n:int m:int', 's:word', 'pairs:int[m][2]'],
      fast: true,
      includes: ['<algorithm>', '<map>'],
      helpers: DSU,
      python: r`
        parent.extend(range(n))
        size.extend([1] * n)
        for a, b in pairs:
            union(a - 1, b - 1)
        groups = {}
        for i in range(n):
            groups.setdefault(find(i), []).append(i)
        result = list(s)
        for positions in groups.values():
            letters = sorted(s[i] for i in positions)
            for i, letter in zip(positions, letters):
                result[i] = letter
        print("".join(result))`,
      cpp: r`
        parent.resize(n);
        sizes.assign(n, 1);
        for (int v = 0; v < n; v++) parent[v] = v;
        for (const vector<long long>& p : pairs) unite((int)p[0] - 1, (int)p[1] - 1);
        map<int, vector<int>> groups;
        for (int i = 0; i < n; i++) groups[findRoot(i)].push_back(i);
        string result = s;
        for (auto& entry : groups) {
            string letters;
            for (int i : entry.second) letters += s[i];
            sort(letters.begin(), letters.end());
            for (size_t k = 0; k < entry.second.size(); k++) result[entry.second[k]] = letters[k];
        }
        cout << result << "\n";`,
      java: r`
        int length = (int) n;
        parent = new int[length];
        sizes = new int[length];
        for (int v = 0; v < length; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        for (long[] p : pairs) unite((int) p[0] - 1, (int) p[1] - 1);
        Map<Integer, List<Integer>> groups = new HashMap<>();
        for (int i = 0; i < length; i++) groups.computeIfAbsent(findRoot(i), k -> new ArrayList<>()).add(i);
        char[] result = s.toCharArray();
        for (List<Integer> positions : groups.values()) {
            char[] letters = new char[positions.size()];
            for (int k = 0; k < positions.size(); k++) letters[k] = s.charAt(positions.get(k));
            Arrays.sort(letters);
            for (int k = 0; k < positions.size(); k++) result[positions.get(k)] = letters[k];
        }
        System.out.println(new String(result));`
    },
    solution: { explanation: ['Union-find groups the positions connected by pairs; inside each group the letters are sorted and written back to the positions of the group in increasing order.'], complexity: 'Time O((n + m) alpha(n) + n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const s = rs[1]; const d = new Dsu(n); for (let i = 0; i < m; i++) { const [a, b] = nums(rs[2 + i]); d.union(a - 1, b - 1); }
      const groups = new Map(); for (let i = 0; i < n; i++) { const r0 = d.find(i); if (!groups.has(r0)) groups.set(r0, []); groups.get(r0).push(i); }
      const res = [...s]; for (const pos of groups.values()) { const letters = pos.map((i) => s[i]).sort(); pos.forEach((i, k) => { res[i] = letters[k]; }); } return res.join('');
    },
    tests() {
      const g = rng(954); const out = ['4 2\ndcab\n1 4\n2 3\n', '2 1\nba\n1 2\n', '3 1\ncba\n1 2\n'];
      const make = (n, m, letters) => { const seen = new Set(); const pairs = []; const cap = Math.min(m, n * (n - 1) / 2); while (pairs.length < cap) { const a = randInt(g, 1, n), b = randInt(g, 1, n); if (a === b || seen.has(key(n, a, b))) continue; seen.add(key(n, a, b)); pairs.push(`${a} ${b}`); } return `${n} ${pairs.length}\n${randWord(g, n, letters)}\n${pairs.join('\n')}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); let best = rs[1]; const seen = new Set([best]); const queue = [best]; const pairs = many(m, (i) => nums(rs[2 + i])); for (let h = 0; h < queue.length; h++) for (const [a, b] of pairs) { const c = [...queue[h]]; [c[a - 1], c[b - 1]] = [c[b - 1], c[a - 1]]; const t = c.join(''); if (!seen.has(t)) { seen.add(t); queue.push(t); if (t < best) best = t; } } return best; };
      crossCheck(() => make(randInt(g, 2, 6), randInt(g, 1, 4), 'abc'), (i) => this.solve(i), brute, 200);
      for (const [n, m, l] of [[8, 4, 'abcd'], [30, 15, 'abcdefg'], [300, 150, 'abcdefghijklmnopqrstuvwxyz'], [5000, 3000, 'ab'], [20000, 12000, 'abcdefghijklmnopqrstuvwxyz'], [20000, 30000, 'abc'], [20000, 5000, 'abcdefghijklmnopqrstuvwxyz'], [20000, 19999, 'abcdefghijklmnopqrstuvwxyz']]) out.push(make(n, m, l));
      out.push(`20000 19999\n${randWord(g, 20000, 'abcdefghijklmnopqrstuvwxyz')}\n${many(19999, (i) => `${i + 1} ${i + 2}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `k`, the number of equations.', 'The second line has the `k` equations, each written as `a==b` or `a!=b` with two lowercase letters `a` and `b`.'],
    constraints: ['1 <= k <= 5000', 'Every equation has exactly 4 characters: a letter, `==` or `!=`, and a letter.'],
    slug: 'equality-equations',
    title: 'Can All the Equations Be True?',
    tags: ['graph', 'union-find'],
    concept: {
      title: 'Equal means the same group; then every "not equal" must join two different groups',
      body: [
        'The equations talk about variables that are lowercase letters: `a==b` says that the two are equal, `a!=b` that they differ. Can numbers be given to the variables so that **all** equations are true?',
        'Equality is a relation that is *transitive*: if `a==b` and `b==c`, then `a==c`. So the `==` equations put variables into **groups of variables that must have the same value**: union-find does exactly this. After all the equalities have been processed, check each `!=` equation: if its two variables are in the **same group**, they are forced to be equal, which contradicts the equation: the answer is `no`. Otherwise the groups can be given different numbers and everything holds: `yes`.',
        { code: 'for eq in equations:\n    if eq[1:3] == "==":\n        union(eq[0], eq[3])\nfor eq in equations:\n    if eq[1:3] == "!=" and find(eq[0]) == find(eq[3]):\n        answer = "no"\n        break\nelse:\n    answer = "yes"' },
        'The order matters: **all** equalities must be applied before any inequality is checked, because a later equation can merge two groups that an earlier inequality wanted to keep apart. Note that `a!=a` is always false: both sides are in the same group, so the check finds it automatically.'
      ]
    },
    statement: ['Each of `k` equations has the form `x==y` or `x!=y`, where `x` and `y` are lowercase letters (variables). Can integers be assigned to the variables so that all the equations are true? Print `yes` or `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '2\na==b b!=a\n', note: 'a equals b, and b differs from a: no.' }, { input: '2\nb==a a==b\n', note: 'Both say the same: yes.' }],
    hints: ['First process all the == equations with union-find on the 26 letters.', 'Then go through the != equations.', 'If both letters of a != equation are in the same group the answer is no.'],
    program: {
      io: ['k:int', 'eq:word[k]'],
      fast: true,
      helpers: DSU,
      python: r`
        parent.extend(range(26))
        size.extend([1] * 26)
        for e in eq:
            if e[1] == "=":
                union(ord(e[0]) - 97, ord(e[3]) - 97)
        ok = True
        for e in eq:
            if e[1] == "!" and find(ord(e[0]) - 97) == find(ord(e[3]) - 97):
                ok = False
        print("yes" if ok else "no")`,
      cpp: r`
        parent.resize(26);
        sizes.assign(26, 1);
        for (int v = 0; v < 26; v++) parent[v] = v;
        for (const string& e : eq) {
            if (e[1] == '=') unite(e[0] - 'a', e[3] - 'a');
        }
        bool ok = true;
        for (const string& e : eq) {
            if (e[1] == '!' && findRoot(e[0] - 'a') == findRoot(e[3] - 'a')) ok = false;
        }
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        parent = new int[26];
        sizes = new int[26];
        for (int v = 0; v < 26; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        for (String e : eq) {
            if (e.charAt(1) == '=') unite(e.charAt(0) - 'a', e.charAt(3) - 'a');
        }
        boolean ok = true;
        for (String e : eq) {
            if (e.charAt(1) == '!' && findRoot(e.charAt(0) - 'a') == findRoot(e.charAt(3) - 'a')) ok = false;
        }
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['The == equations merge the variables into groups with union-find; the answer is no exactly when some != equation has both variables in the same group.'], complexity: 'Time O(k * alpha(26)), space O(1).' },
    solve(input) { const eq = rows(input)[1].split(' '); const d = new Dsu(26); for (const e of eq) if (e[1] === '=') d.union(e.charCodeAt(0) - 97, e.charCodeAt(3) - 97); for (const e of eq) if (e[1] === '!' && d.find(e.charCodeAt(0) - 97) === d.find(e.charCodeAt(3) - 97)) return 'no'; return 'yes'; },
    tests() {
      const g = rng(955); const out = ['2\na==b b!=a\n', '2\nb==a a==b\n', '1\na!=a\n', '3\na==b b==c a!=c\n', '3\na==b b!=c c==a\n'];
      const make = (k, letters, pEq) => { const eqs = many(k, () => { const a = letters[randInt(g, 0, letters.length - 1)], b = letters[randInt(g, 0, letters.length - 1)]; return `${a}${g() < pEq ? '==' : '!='}${b}`; }); return `${k}\n${eqs.join(' ')}\n`; };
      const brute = (input) => { const eq = rows(input)[1].split(' '); const vars = [...new Set(eq.flatMap((e) => [e[0], e[3]]))]; if (vars.length > 6) return null; const total = Math.pow(vars.length, vars.length); for (let code = 0; code < total; code++) { const value = {}; let c = code; for (const v of vars) { value[v] = c % vars.length; c = Math.floor(c / vars.length); } if (eq.every((e) => (e[1] === '=' ? value[e[0]] === value[e[3]] : value[e[0]] !== value[e[3]]))) return 'yes'; } return 'no'; };
      crossCheck(() => make(randInt(g, 1, 7), 'abcde', 0.5), (i) => this.solve(i), (i) => brute(i), 300);
      for (const [k, letters, p] of [[5, 'abc', 0.6], [30, 'abcdefghij', 0.7], [200, 'abcdefghijklmnopqrstuvwxyz', 0.1], [5000, 'abcdefghijklmnopqrstuvwxyz', 0.05], [5000, 'abcdefghijklmnopqrstuvwxyz', 0.02], [5000, 'abcdefghijklmnopqrstuvwxyz', 0.5], [5000, 'ab', 0.5]]) out.push(make(k, letters, p));
      const chain = 'abcdefghijklmnopqrstuvwxyz'; out.push(`26\n${[...many(25, (i) => `${chain[i]}==${chain[i + 1]}`), 'a!=z'].join(' ')}\n`, `26\n${[...many(25, (i) => `${chain[i]}==${chain[i + 1]}`), 'a!=a'].join(' ')}\n`.replace('a!=a', 'a!=a'), `25\n${[...many(24, (i) => `${chain[i]}==${chain[i + 1]}`), 'a!=z'].join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: EDGE_INPUT,
    constraints: EDGE_LIMITS,
    slug: 'largest-group-over-time',
    title: 'The Biggest Group After Every New Friendship',
    tags: ['graph', 'union-find', 'online'],
    concept: {
      title: 'Union-find keeps the size of every group, so the largest size can be kept up to date',
      body: [
        'Friendships are added one by one. After each new friendship, how many people are in the **biggest group** of friends (a group is a set of people linked through chains of friends)? Recomputing the groups after every edge would take O(m * (n + m)). Union-find handles an edge in almost constant time, because it can **merge two groups and know the size of the result**.',
        'Store the size of every group at its root. When an edge joins two different groups, the new group has the size `size[a] + size[b]`: update the running maximum with it. If the edge joins two people who are already in the same group, nothing changes. Printing the running maximum after every edge gives the answer.',
        { code: 'best = 1\nfor u, v in edges:\n    a, b = find(u), find(v)\n    if a != b:\n        # attach the smaller group to the larger one\n        if size[a] < size[b]:\n            a, b = b, a\n        parent[b] = a\n        size[a] += size[b]\n        best = max(best, size[a])\n    print(best)' },
        'This is an *online* algorithm: it answers after each edge without looking at the future. The union-find operations (find with path compression, union by size) cost almost O(1), so the whole run is O((n + m) alpha(n)).'
      ]
    },
    statement: ['There are `n` people and no friendships at first. Then `m` friendships are added one after another. After each one, print the size of the biggest group of people connected through chains of friends (at the beginning every group has one person, so the answer is at least 1). Print the `m` answers on one line.'],
    outputFormat: ['One line with `m` numbers.'],
    examples: [{ input: '5 4\n1 2\n3 4\n2 3\n4 5\n', note: 'After 1-2: {1, 2} has 2 people; after 3-4: still 2; after 2-3: {1, 2, 3, 4} has 4; after 4-5: all 5: 2 2 4 5.' }],
    hints: ['Keep the size of every group at its root.', 'When an edge joins two different groups, add the sizes and update the running maximum.', 'Print the maximum after every edge, even if the edge changed nothing.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<algorithm>'],
      helpers: DSU,
      python: r`
        parent.extend(range(n + 1))
        size.extend([1] * (n + 1))
        best = 1
        out = []
        for u, v in edges:
            if union(u, v):
                best = max(best, size[find(u)])
            out.append(best)
        print(*out)`,
      cpp: r`
        parent.resize(n + 1);
        sizes.assign(n + 1, 1);
        for (int v = 0; v <= n; v++) parent[v] = v;
        int best = 1;
        for (size_t i = 0; i < edges.size(); i++) {
            if (unite((int)edges[i][0], (int)edges[i][1])) best = max(best, sizes[findRoot((int)edges[i][0])]);
            cout << (i ? " " : "") << best;
        }
        cout << "\n";`,
      java: r`
        int people = (int) n;
        parent = new int[people + 1];
        sizes = new int[people + 1];
        for (int v = 0; v <= people; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        int best = 1;
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < edges.length; i++) {
            if (unite((int) edges[i][0], (int) edges[i][1])) best = Math.max(best, sizes[findRoot((int) edges[i][0])]);
            out.append(i > 0 ? " " : "").append(best);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['Union-find stores the size of each group at its root; every real merge produces a group of the combined size, which updates the running maximum printed after each edge.'], complexity: 'Time O((n + m) alpha(n)), space O(n).' },
    solve(input) { const { n, edges } = parse(input); const d = new Dsu(n); let best = 1; return edges.map(([u, v]) => { if (d.union(u, v)) best = Math.max(best, d.size[d.find(u)]); return best; }).join(' '); },
    tests() {
      const g = rng(956); const out = ['5 4\n1 2\n3 4\n2 3\n4 5\n', '2 1\n1 2\n', '3 1\n1 3\n'];
      for (const [n, e] of [[8, E(g, 8, 10)], [100, E(g, 100, 150)], [3000, E(g, 3000, 5000)], [20000, E(g, 20000, 30000)], [20000, E(g, 20000, 8000)], [20000, mix(g, randomTreeEdges(g, 20000, 'path'))], [20000, mix(g, randomTreeEdges(g, 20000, 'star'))], [300, E(g, 300, 30000)]]) out.push(graphText(n, e));
      out.push(graphText(20000, many(19999, (i) => [i + 1, i + 2])), graphText(20000, many(19999, (i) => [20000 - i, 19999 - i])), graphText(20000, many(19999, (i) => [1, i + 2])));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, the number of nodes (numbered 1 to n).', 'The second line has `n` numbers: `next[i]` is the node that the only outgoing edge of the node `i` leads to, or 0 if the node `i` has no outgoing edge.'],
    constraints: ['2 <= n <= 20000', '0 <= next[i] <= n, and next[i] != i', 'A node has at most one outgoing edge (but any number of incoming edges).'],
    slug: 'longest-cycle-in-functional-graph',
    title: 'The Longest Cycle When Every Node Points to One Other',
    tags: ['graph', 'directed-graph', 'cycle', 'functional-graph'],
    concept: {
      title: 'Follow the only edge from each unvisited node; meeting a node of the current walk means you found a cycle',
      body: [
        'In this graph every node has **at most one outgoing edge** (a *functional graph*): a walk from a node is forced, there is nothing to choose. Each walk either ends at a node without an outgoing edge, or enters a **cycle**, and since every node leads to one next node, every cycle is a separate "loop" with trees of nodes hanging on it. We want the length of the longest cycle, or -1 if there is none.',
        'Walk from every node that has not been visited yet, and keep, for every node on the **current walk**, the step number at which the walk reached it. Mark the nodes with the number of the walk that visited them. When the walk reaches a node that was visited by an **earlier** walk (or a dead end), it stops without a cycle. When it reaches a node that was visited by **the same walk**, it has closed a cycle, and the length is `current step - the step at which that node was first visited`.',
        { code: 'walk = [0] * (n + 1)                  # which walk visited the node (0 = none)\nstep = [0] * (n + 1)                  # the step number inside that walk\nbest = -1\nfor start in range(1, n + 1):\n    if walk[start]:\n        continue\n    v, t = start, 0\n    while v != 0 and not walk[v]:\n        walk[v], step[v] = start, t\n        t += 1\n        v = next_node[v]\n    if v != 0 and walk[v] == start:      # we came back to a node of this walk\n        best = max(best, t - step[v])' },
        'Every node is visited once, so the time is O(n), and there is no recursion: a chain of 20000 nodes is handled by the loop.'
      ]
    },
    statement: ['A directed graph has `n` nodes, and every node has at most one outgoing edge: `next[i]` is the node that the edge from `i` leads to, or 0 if there is none. A cycle is a closed walk that does not repeat a node. Print the number of nodes of the longest cycle, or -1 if the graph has no cycle.'],
    outputFormat: ['Print the length of the longest cycle or -1.'],
    examples: [{ input: '5\n3 3 4 2 3\n', note: 'The nodes 2, 3, 4 form a cycle (2 to 3 to 4 to 2): 3.' }, { input: '3\n2 3 0\n', note: 'The walk from 1 ends at the node 3, which has no edge: -1.' }],
    hints: ['Walk from each node that has not been visited, following the only edge.', 'Remember for each node on the current walk the step at which it was reached.', 'If the walk reaches a node of the same walk, the cycle length is the difference of the steps; use a different mark for every walk.'],
    program: {
      io: ['n:int', 'nxt:int[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        walk = [0] * (n + 1)
        step = [0] * (n + 1)
        best = -1
        for start in range(1, n + 1):
            if walk[start]:
                continue
            v = start
            t = 0
            while v != 0 and not walk[v]:
                walk[v] = start
                step[v] = t
                t += 1
                v = nxt[v - 1]
            if v != 0 and walk[v] == start:
                best = max(best, t - step[v])
        print(best)`,
      cpp: r`
        vector<int> walk(n + 1, 0);
        vector<long long> step(n + 1, 0);
        long long best = -1;
        for (int start = 1; start <= n; start++) {
            if (walk[start]) continue;
            int v = start;
            long long t = 0;
            while (v != 0 && !walk[v]) {
                walk[v] = start;
                step[v] = t;
                t++;
                v = (int)nxt[v - 1];
            }
            if (v != 0 && walk[v] == start) best = max(best, t - step[v]);
        }
        cout << best << "\n";`,
      java: r`
        int nodes = (int) n;
        int[] walk = new int[nodes + 1];
        long[] step = new long[nodes + 1];
        long best = -1;
        for (int start = 1; start <= nodes; start++) {
            if (walk[start] != 0) continue;
            int v = start;
            long t = 0;
            while (v != 0 && walk[v] == 0) {
                walk[v] = start;
                step[v] = t;
                t++;
                v = (int) nxt[v - 1];
            }
            if (v != 0 && walk[v] == start) best = Math.max(best, t - step[v]);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Each unvisited node starts a walk along the only outgoing edges, marking nodes with the walk number and the step; reaching a node of the same walk closes a cycle whose length is the difference of the steps.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const nxt = nums(rs[1]); let best = -1;
      for (let s = 1; s <= n; s++) { const seen = new Map(); let v = s, t = 0; while (v !== 0 && !seen.has(v)) { seen.set(v, t++); v = nxt[v - 1]; } if (v !== 0) best = Math.max(best, t - seen.get(v)); }
      return String(best);
    },
    tests() {
      const g = rng(957); const out = ['5\n3 3 4 2 3\n', '3\n2 3 0\n', '2\n2 1\n'];
      const rnd = (n, pNone) => { const list = many(n, (i) => { if (g() < pNone) return 0; let v = randInt(g, 1, n); while (v === i + 1) v = randInt(g, 1, n); return v; }); return `${n}\n${list.join(' ')}\n`; };
      for (const [n, p] of [[5, 0.2], [20, 0.1], [200, 0.05], [3000, 0.01], [3000, 0], [20000, 0.001], [20000, 0], [20000, 0.3]]) { out.push(rnd(n, p)); out.push(rnd(n, p)); }
      // one long cycle, a long chain into a small cycle, and a chain that ends
      out.push(`20000\n${many(20000, (i) => (i + 1) % 20000 + 1).join(' ')}\n`, `20000\n${many(20000, (i) => (i < 19997 ? i + 2 : (i === 19999 ? 19998 : i + 2))).join(' ')}\n`, `20000\n${many(20000, (i) => (i < 19999 ? i + 2 : 0)).join(' ')}\n`);
      out.push(`20000\n${many(20000, (i) => { const block = Math.floor(i / 5); const pos = i % 5; return block * 5 + ((pos + 1) % 5) + 1; }).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: [...WEDGE_INPUT, 'The next line has `q`, the number of questions.', 'Each of the next `q` lines has three numbers `a`, `b` and `limit`.'],
    constraints: ['2 <= n <= 20000', '1 <= m <= 30000', '1 <= q <= 20000', '1 <= w, limit <= 10^9', 'There are no self-loops and no repeated edges.'],
    slug: 'paths-under-a-limit',
    title: 'Is There a Road With Only Short Edges?',
    tags: ['graph', 'union-find', 'offline-queries', 'sorting'],
    concept: {
      title: 'Sort the questions by their limit and add the edges in step with them',
      body: [
        'A question `(a, b, limit)` asks: is there a path from `a` to `b` in which **every edge has a weight smaller than `limit`**? Answering each question with a search that ignores the heavy edges costs O(n + m) per question, too slow for 20000 questions.',
        'The questions are all known in advance, so they can be answered **offline**, in any order we like. Sort the questions by `limit` (smallest first) and the edges by weight. Then sweep: for each question in order, add to the union-find all the edges whose weight is **smaller than its limit** (the edges added earlier are still valid, since the limits only grow). Now the groups of the union-find are exactly the connected pieces that use only edges below the current limit, so the question is a comparison of `find(a)` and `find(b)`.',
        { code: 'edges.sort(key=lambda e: e[2])\norder = sorted(range(q), key=lambda i: questions[i][2])\nanswer = [None] * q\npointer = 0\nfor i in order:\n    a, b, limit = questions[i]\n    while pointer < m and edges[pointer][2] < limit:\n        union(edges[pointer][0], edges[pointer][1])\n        pointer += 1\n    answer[i] = find(a) == find(b)' },
        'The answers are stored by the original question number, because the sweep goes in a different order. Total time: sorting plus O((n + m + q) alpha(n)). "Offline processing in sorted order with union-find" is a standard technique.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` weighted edges. Then `q` questions follow, each with two nodes `a` and `b` and a number `limit`. For each question print `yes` if there is a path from `a` to `b` in which every edge has a weight strictly smaller than `limit`, and `no` otherwise. A node is connected to itself.'],
    outputFormat: ['`q` lines: `yes` or `no`.'],
    examples: [{ input: '3 3\n1 2 2\n2 3 4\n3 1 8\n3\n1 2 3\n1 3 5\n1 3 2\n', note: 'With the limit 3 only the edge of weight 2 is allowed: 1 and 2 are joined. With the limit 5 the edges 2 and 4 join all three nodes. With the limit 2 no edge is allowed: no.' }],
    hints: ['Sort the edges by weight and the questions by limit.', 'For each question in that order, add all edges with a weight smaller than its limit to a union-find.', 'The answer is whether a and b have the same root; store it at the original index of the question.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]', 'q:int', 'qs:int[q][3]'],
      fast: true,
      includes: ['<algorithm>'],
      helpers: DSU,
      python: r`
        parent.extend(range(n + 1))
        size.extend([1] * (n + 1))
        edges.sort(key=lambda e: e[2])
        order = sorted(range(q), key=lambda i: qs[i][2])
        answer = [""] * q
        pointer = 0
        for i in order:
            a, b, limit = qs[i]
            while pointer < m and edges[pointer][2] < limit:
                union(edges[pointer][0], edges[pointer][1])
                pointer += 1
            answer[i] = "yes" if find(a) == find(b) else "no"
        print("\n".join(answer))`,
      cpp: r`
        parent.resize(n + 1);
        sizes.assign(n + 1, 1);
        for (int v = 0; v <= n; v++) parent[v] = v;
        sort(edges.begin(), edges.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[2] < y[2]; });
        vector<int> order(q);
        for (int i = 0; i < q; i++) order[i] = i;
        sort(order.begin(), order.end(), [&](int x, int y) { return qs[x][2] < qs[y][2]; });
        vector<string> answer(q);
        size_t pointer = 0;
        for (int i : order) {
            while (pointer < edges.size() && edges[pointer][2] < qs[i][2]) {
                unite((int)edges[pointer][0], (int)edges[pointer][1]);
                pointer++;
            }
            answer[i] = findRoot((int)qs[i][0]) == findRoot((int)qs[i][1]) ? "yes" : "no";
        }
        for (const string& line : answer) cout << line << "\n";`,
      java: r`
        int people = (int) n, queries = (int) q;
        parent = new int[people + 1];
        sizes = new int[people + 1];
        for (int v = 0; v <= people; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        Arrays.sort(edges, (x, y) -> Long.compare(x[2], y[2]));
        Integer[] order = new Integer[queries];
        for (int i = 0; i < queries; i++) order[i] = i;
        Arrays.sort(order, (x, y) -> Long.compare(qs[x][2], qs[y][2]));
        String[] answer = new String[queries];
        int pointer = 0;
        for (int i : order) {
            while (pointer < edges.length && edges[pointer][2] < qs[i][2]) {
                unite((int) edges[pointer][0], (int) edges[pointer][1]);
                pointer++;
            }
            answer[i] = findRoot((int) qs[i][0]) == findRoot((int) qs[i][1]) ? "yes" : "no";
        }
        StringBuilder out = new StringBuilder();
        for (String line : answer) out.append(line).append("\n");
        System.out.print(out);`
    },
    solution: { explanation: ['Edges are sorted by weight and questions by limit; sweeping the questions, all edges lighter than the limit are added to a union-find, and the answer is whether the two nodes share a root. Answers are stored at the original question index.'], complexity: 'Time O((m + q) log + (n + m + q) alpha(n)), space O(n + q).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const edges = many(m, (i) => nums(rs[i + 1])); const q = Number(rs[m + 1]); const out = [];
      for (let i = 0; i < q; i++) { const [a, b, limit] = nums(rs[m + 2 + i]); const d = new Dsu(n); for (const [u, v, w] of edges) if (w < limit) d.union(u, v); out.push(d.find(a) === d.find(b) ? 'yes' : 'no'); }
      return out.join('\n');
    },
    tests() {
      const g = rng(958); const out = ['3 3\n1 2 2\n2 3 4\n3 1 8\n3\n1 2 3\n1 3 5\n1 3 2\n', '2 1\n1 2 5\n3\n1 2 5\n1 2 6\n2 2 1\n'];
      const make = (n, m, q, hi) => { const e = W(g, n, m, hi); return `${graphText(n, e)}${q}\n${many(q, () => `${randInt(g, 1, n)} ${randInt(g, 1, n)} ${randInt(g, 1, hi + 1)}`).join('\n')}\n`; };
      // the reference answers every question with its own union-find, so keep the big tests to a few thousand questions
      for (const [n, m, q, hi] of [[5, 6, 8, 9], [30, 40, 40, 50], [300, 500, 300, 1000], [3000, 6000, 600, 1000000], [20000, 30000, 400, 1000000000], [20000, 19999, 300, 100], [20000, 8000, 300, 1000]]) out.push(make(n, m, q, hi));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: WEDGE_INPUT,
    constraints: ['1 <= n <= 20000', '1 <= m <= 30000', '1 <= w <= 10^9', 'There are no self-loops and no repeated edges.'],
    slug: 'minimum-spanning-tree-weight',
    title: 'The Cheapest Way to Connect Everything',
    tags: ['graph', 'mst', 'kruskal', 'union-find', 'greedy'],
    concept: {
      title: 'Kruskal: take the edges from the cheapest, and skip every edge that would close a cycle',
      body: [
        'Towns must be joined by roads so that every town can be reached from every other, and every road has a cost. A *spanning tree* is a set of `n - 1` edges that connects all nodes without a cycle, and the **minimum spanning tree (MST)** is the one with the smallest total weight. (A graph that is not connected has no spanning tree.)',
        '*Kruskal\'s algorithm* is greedy: sort the edges by weight, and go through them from the cheapest. Take an edge **unless it would create a cycle**, which is exactly when its two ends are already connected. Union-find tests this in almost constant time: if `find(u) != find(v)`, the edge joins two different groups, so take it and merge the groups. After `n - 1` edges have been taken, the tree is complete.',
        { code: 'edges.sort(key=lambda e: e[2])\ntotal, taken = 0, 0\nfor u, v, w in edges:\n    if union(u, v):          # the ends were in different groups: no cycle\n        total += w\n        taken += 1\nprint(total if taken == n - 1 else -1)' },
        'Why is the greedy choice right? The cheapest edge that does not close a cycle can always be part of an optimal tree (the *cut property*): if an optimal tree did not contain it, adding it would create a cycle, and removing a more expensive edge of that cycle would give a tree that is no worse. The sorting dominates the time: O(m log m). The total weight can reach 2 * 10^13, so use 64-bit integers.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges with weights. Print the total weight of a minimum spanning tree (a set of edges that connects all the nodes with the smallest total weight), or -1 if the graph is not connected.'],
    outputFormat: ['Print the weight or -1.'],
    examples: [{ input: '4 5\n1 2 1\n2 3 2\n1 3 3\n3 4 4\n2 4 5\n', note: 'Take the edges of weight 1, 2 and 4: 7. The edge of weight 3 would close a cycle.' }],
    hints: ['Sort the edges by weight.', 'Use union-find: take an edge only if its ends are in different groups, then merge them.', 'If fewer than n - 1 edges were taken, the graph is not connected: print -1.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      includes: ['<algorithm>'],
      helpers: DSU,
      python: r`
        parent.extend(range(n + 1))
        size.extend([1] * (n + 1))
        edges.sort(key=lambda e: e[2])
        total = 0
        taken = 0
        for u, v, w in edges:
            if union(u, v):
                total += w
                taken += 1
        print(total if taken == n - 1 else -1)`,
      cpp: r`
        parent.resize(n + 1);
        sizes.assign(n + 1, 1);
        for (int v = 0; v <= n; v++) parent[v] = v;
        sort(edges.begin(), edges.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[2] < y[2]; });
        long long total = 0, taken = 0;
        for (const vector<long long>& e : edges) {
            if (unite((int)e[0], (int)e[1])) {
                total += e[2];
                taken++;
            }
        }
        cout << (taken == n - 1 ? total : -1) << "\n";`,
      java: r`
        int nodes = (int) n;
        parent = new int[nodes + 1];
        sizes = new int[nodes + 1];
        for (int v = 0; v <= nodes; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        Arrays.sort(edges, (x, y) -> Long.compare(x[2], y[2]));
        long total = 0, taken = 0;
        for (long[] e : edges) {
            if (unite((int) e[0], (int) e[1])) {
                total += e[2];
                taken++;
            }
        }
        System.out.println(taken == n - 1 ? total : -1);`
    },
    solution: { explanation: ['Kruskal\'s algorithm: the edges are sorted by weight and an edge is taken when its ends are in different union-find groups. If n - 1 edges are taken the total is the answer, otherwise the graph is not connected.'], complexity: 'Time O(m log m), space O(n).' },
    solve(input) {
      const { n, edges } = parse(input); const sorted = edges.slice().sort((a, b) => a[2] - b[2]); const d = new Dsu(n); let total = 0, taken = 0; for (const [u, v, w] of sorted) if (d.union(u, v)) { total += w; taken++; }
      return String(taken === n - 1 ? total : -1);
    },
    tests() {
      const g = rng(959); const out = ['4 5\n1 2 1\n2 3 2\n1 3 3\n3 4 4\n2 4 5\n', '2 1\n2 1 7\n', '3 1\n1 2 1\n'];
      const brute = (input) => { const { n, edges } = parse(input); if (n > 7) return null; let best = Infinity; const m = edges.length; for (let mask = 0; mask < (1 << m); mask++) { let count = 0, sum = 0; const d = new Dsu(n); let ok = true; for (let i = 0; i < m && ok; i++) if (mask >> i & 1) { count++; sum += edges[i][2]; if (!d.union(edges[i][0], edges[i][1])) ok = false; } if (ok && count === n - 1) best = Math.min(best, sum); } return best === Infinity ? '-1' : String(best); };
      crossCheck(() => { const n = randInt(g, 2, 6); return graphText(n, W(g, n, randInt(g, 1, Math.min(10, n * (n - 1) / 2)), 9)); }, (i) => this.solve(i), (i) => brute(i), 300);
      for (const [n, m, hi] of [[8, 14, 20], [30, 80, 1000], [300, 1000, 1000000], [3000, 6000, 1000000000]]) { out.push(graphText(n, WC(g, n, m - (n - 1), hi))); out.push(graphText(n, W(g, n, m, hi))); }
      for (const [n, extra, hi] of [[20000, 10000, 1000000000], [20000, 0, 1000000000], [20000, 10001, 5], [20000, 5000, 1]]) out.push(graphText(n, WC(g, n, extra, hi)));
      out.push(graphText(20000, W(g, 20000, 30000, 1000000000)), graphText(20000, many(19999, (i) => [i + 1, i + 2, 1000000000])));
      return out;
    }
  }
];
