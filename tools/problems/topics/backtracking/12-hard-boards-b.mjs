import { r, rng, randInt, randArray, many, nums, rows, randWord, shuffle } from '../../lib.mjs';

// Runs fast(input) against a slow, independent computation on many small random inputs; throws when they differ.
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const popcount = (m) => { let c = 0; while (m) { m &= m - 1; c++; } return c; };
const allPairs = (n) => { const e = []; for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) e.push([a, b]); return e; };
const graphText = (n, edges) => `${n} ${edges.length}\n${edges.map((e) => e.join(' ')).join('\n')}${edges.length ? '\n' : ''}`;
const adjacency = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); const adj = Array(n).fill(0); for (let i = 1; i <= m; i++) { const [a, b] = nums(rs[i]); adj[a - 1] |= 1 << (b - 1); adj[b - 1] |= 1 << (a - 1); } return { n, m, adj }; };
// all Latin squares of order n as arrays of n*n numbers (only used by the reference solutions and for tests)
const LATIN = {};
const latinSquares = (n) => {
  if (LATIN[n]) return LATIN[n];
  const out = []; const cells = Array(n * n).fill(0); const rowM = Array(n).fill(0), colM = Array(n).fill(0);
  const go = (i) => { if (i === n * n) { out.push(cells.slice()); return; } const rr = Math.floor(i / n), cc = i % n; for (let d = 1; d <= n; d++) { const bit = 1 << d; if ((rowM[rr] | colM[cc]) & bit) continue; cells[i] = d; rowM[rr] |= bit; colM[cc] |= bit; go(i + 1); rowM[rr] &= ~bit; colM[cc] &= ~bit; } cells[i] = 0; };
  go(0); LATIN[n] = out; return out;
};

export default [
  {
    slug: 'minimum-colours-for-graph',
    title: 'The Fewest Colours for a Map',
    difficulty: 'hard',
    tags: ['backtracking', 'graph', 'coloring', 'pruning'],
    concept: {
      title: 'Try 1, 2, 3 ... colours; never open a new colour before the previous ones are used',
      body: [
        'The *chromatic number* of a graph is the smallest number of colours that can colour all vertices so that **two vertices joined by an edge always get different colours**. To find it, ask "can it be done with `k` colours?" for `k = 1, 2, 3, ...` and stop at the first yes. Each question is a backtracking colouring search.',
        'Two ideas keep the search small. First, **symmetry**: the colours have no meaning, so naming the first vertex colour 0 and the next new colour 1, and so on, loses nothing. A vertex may use the colours already in use, or **only the next unused colour**, never a colour with a larger number. Second, **order**: colour the vertices with many neighbours first, because they have the fewest choices and conflicts appear early.',
        { code: 'def colourable(i, k, used):                  # used: number of colours opened so far\n    if i == n:\n        return True\n    v = order[i]\n    for c in range(min(used + 1, k)):        # old colours, or the next new one\n        if all(colour[u] != c for u in adj[v]):\n            colour[v] = c\n            if colourable(i + 1, k, max(used, c + 1)):\n                return True\n            colour[v] = -1\n    return False' },
        'Without the symmetry rule the search would try every one of the `k!` renamings of each colouring. With it, each partition of the vertices into colour classes is visited once. Neighbours that are not yet coloured have colour `-1`, which never equals a real colour.'
      ]
    },
    statement: ['A graph has `n` vertices and `m` edges. Colour the vertices so that the two ends of every edge have different colours, using as few colours as possible. Print the smallest number of colours.'],
    inputFormat: ['The first line has `n` and `m`.', 'Each of the next `m` lines has two vertices joined by an edge.'],
    outputFormat: ['Print the smallest number of colours.'],
    constraints: ['1 <= n <= 14', '0 <= m <= n * (n - 1) / 2, no repeated edges and no loops'],
    examples: [{ input: '5 5\n1 2\n2 3\n3 4\n4 5\n5 1\n', note: 'An odd cycle needs 3 colours; 2 are not enough.' }],
    hints: ['Test k = 1, 2, 3, ... and stop at the first k for which a colouring exists.', 'A vertex may only use a colour that is already in use, or the next new one.', 'Colour the vertices of large degree first.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def colourable(i, k, used, order, colour, adj):
              if i == len(order):
                  return True
              v = order[i]
              for c in range(min(used + 1, k)):
                  if all(colour[u] != c for u in adj[v]):
                      colour[v] = c
                      if colourable(i + 1, k, max(used, c + 1), order, colour, adj):
                          return True
                      colour[v] = -1
              return False`,
        cpp: r`
          bool colourable(size_t i, int k, int used, const vector<int>& order, vector<int>& colour, const vector<vector<int>>& adj) {
              if (i == order.size()) return true;
              int v = order[i];
              for (int c = 0; c < min(used + 1, k); c++) {
                  bool ok = true;
                  for (int u : adj[v]) {
                      if (colour[u] == c) ok = false;
                  }
                  if (ok) {
                      colour[v] = c;
                      if (colourable(i + 1, k, max(used, c + 1), order, colour, adj)) return true;
                      colour[v] = -1;
                  }
              }
              return false;
          }`,
        java: r`
          static boolean colourable(int i, int k, int used, int[] order, int[] colour, List<List<Integer>> adj) {
              if (i == order.length) return true;
              int v = order[i];
              for (int c = 0; c < Math.min(used + 1, k); c++) {
                  boolean ok = true;
                  for (int u : adj.get(v)) {
                      if (colour[u] == c) ok = false;
                  }
                  if (ok) {
                      colour[v] = c;
                      if (colourable(i + 1, k, Math.max(used, c + 1), order, colour, adj)) return true;
                      colour[v] = -1;
                  }
              }
              return false;
          }`
      },
      python: r`
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a - 1].append(b - 1)
            adj[b - 1].append(a - 1)
        order = sorted(range(n), key=lambda v: -len(adj[v]))
        for k in range(1, n + 1):
            if colourable(0, k, 0, order, [-1] * n, adj):
                print(k)
                break`,
      cpp: r`
        vector<vector<int>> adj(n);
        for (int i = 0; i < m; i++) {
            adj[edges[i][0] - 1].push_back((int)edges[i][1] - 1);
            adj[edges[i][1] - 1].push_back((int)edges[i][0] - 1);
        }
        vector<int> order(n);
        for (int i = 0; i < n; i++) order[i] = i;
        stable_sort(order.begin(), order.end(), [&](int a, int b) { return adj[a].size() > adj[b].size(); });
        for (int k = 1; k <= n; k++) {
            vector<int> colour(n, -1);
            if (colourable(0, k, 0, order, colour, adj)) {
                cout << k << "\n";
                break;
            }
        }`,
      java: r`
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int i = 0; i < m; i++) {
            adj.get((int) edges[i][0] - 1).add((int) edges[i][1] - 1);
            adj.get((int) edges[i][1] - 1).add((int) edges[i][0] - 1);
        }
        Integer[] boxed = new Integer[(int) n];
        for (int i = 0; i < n; i++) boxed[i] = i;
        Arrays.sort(boxed, (a, b) -> adj.get(b).size() - adj.get(a).size());
        int[] order = new int[(int) n];
        for (int i = 0; i < n; i++) order[i] = boxed[i];
        for (int k = 1; k <= n; k++) {
            int[] colour = new int[(int) n];
            Arrays.fill(colour, -1);
            if (colourable(0, k, 0, order, colour, adj)) {
                System.out.println(k);
                break;
            }
        }`
    },
    solution: { explanation: ['For k = 1, 2, ... the search colours the vertices in order of decreasing degree; each vertex takes an old colour or the next new one if no neighbour has it. The first k that works is the chromatic number.'], complexity: 'Time exponential in the worst case, small for 14 vertices thanks to the symmetry rule; space O(n).' },
    solve(input) {
      const { n, adj } = adjacency(input); const indep = new Array(1 << n).fill(false);
      for (let mask = 0; mask < 1 << n; mask++) { let ok = true; for (let v = 0; v < n && ok; v++) if (((mask >> v) & 1) && (adj[v] & mask)) ok = false; indep[mask] = ok; }
      const f = Array(1 << n).fill(99); f[0] = 0;
      for (let mask = 1; mask < 1 << n; mask++) { const low = mask & -mask; for (let sub = mask; sub > 0; sub = (sub - 1) & mask) if ((sub & low) && indep[sub]) f[mask] = Math.min(f[mask], 1 + f[mask ^ sub]); }
      return String(f[(1 << n) - 1]);
    },
    tests() {
      const g = rng(700);
      const some = (n, p) => allPairs(n).filter(() => g() < p);
      return ['5 5\n1 2\n2 3\n3 4\n4 5\n5 1\n', '1 0\n', '2 0\n', '2 1\n1 2\n', graphText(14, []), graphText(14, allPairs(14)), graphText(14, some(14, 0.2)), graphText(14, some(14, 0.35)), graphText(14, some(14, 0.5)), graphText(14, some(14, 0.65)), graphText(14, some(14, 0.8)), graphText(14, many(14, (i) => [Math.min(i + 1, ((i + 1) % 14) + 1), Math.max(i + 1, ((i + 1) % 14) + 1)])), graphText(13, many(13, (i) => [Math.min(i + 1, ((i + 1) % 13) + 1), Math.max(i + 1, ((i + 1) % 13) + 1)])), graphText(12, some(12, 0.5)), graphText(14, allPairs(14).filter(([a, b]) => (a + b) % 3 !== 0))];
    }
  },

  {
    slug: 'smallest-dominating-set',
    title: 'The Fewest Guards for a Network',
    difficulty: 'hard',
    tags: ['backtracking', 'graph', 'bitmask', 'pruning'],
    concept: {
      title: 'Take a vertex that nobody watches: one of its neighbours (or itself) must be a guard',
      body: [
        'A *dominating set* of a graph is a set of vertices such that every vertex is **in the set or next to a vertex of the set** (a guard watches itself and its neighbours). We want the smallest one. For each vertex keep the bit mask `closed[v]` of the vertex and its neighbours; guarding `u` watches all vertices in `closed[u]`.',
        'Ask "is there a dominating set of size at most `k`?" for `k = 0, 1, 2, ...` (iterative deepening). To answer, take any vertex `v` that is **not yet watched**: some guard in `closed[v]` must be chosen, so try each of them as the next guard. The search is as deep as `k` and as wide as the size of `closed[v]`, much less than the `C(n, k)` subsets.',
        { code: 'def dominate(watched, chosen, k):\n    if watched == full:\n        return True\n    if chosen == k:\n        return False\n    unwatched = full & ~watched\n    if chosen + ceil(popcount(unwatched) / biggest) > k:\n        return False                          # even the best guards cannot finish in time\n    v = lowest set bit of unwatched\n    for u in the vertices of closed[v]:\n        if dominate(watched | closed[u], chosen + 1, k):\n            return True\n    return False' },
        'The test with `biggest` (the largest size of a closed neighbourhood) is a **bound**: each new guard watches at most `biggest` new vertices, so at least `ceil(unwatched / biggest)` more guards are needed. When that does not fit in the remaining budget, the branch is cut at once.'
      ]
    },
    statement: ['A graph has `n` vertices and `m` edges. A set of vertices is *dominating* if every vertex of the graph is either in the set or adjacent to a vertex of the set. Print the size of the smallest dominating set.'],
    inputFormat: ['The first line has `n` and `m`.', 'Each of the next `m` lines has two vertices joined by an edge.'],
    outputFormat: ['Print the smallest size.'],
    constraints: ['1 <= n <= 20', '0 <= m <= n * (n - 1) / 2, no repeated edges and no loops'],
    examples: [{ input: '5 4\n1 2\n2 3\n3 4\n4 5\n', note: 'The vertices 2 and 4 watch everything: the path of five vertices has a dominating set of size 2.' }],
    hints: ['For each vertex store a bit mask of the vertex and its neighbours.', 'Try the sizes k = 0, 1, 2, ... one after the other.', 'Pick an unwatched vertex; one of the vertices that can watch it must be chosen.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      helpers: {
        python: r`
          def dominate(watched, chosen, k, full, closed, biggest):
              if watched == full:
                  return True
              if chosen == k:
                  return False
              unwatched = full & ~watched
              need = (bin(unwatched).count("1") + biggest - 1) // biggest
              if chosen + need > k:
                  return False
              v = (unwatched & -unwatched).bit_length() - 1
              for u in range(len(closed)):
                  if closed[v] >> u & 1:
                      if dominate(watched | closed[u], chosen + 1, k, full, closed, biggest):
                          return True
              return False`,
        cpp: r`
          bool dominate(int watched, int chosen, int k, int full, const vector<int>& closed, int biggest) {
              if (watched == full) return true;
              if (chosen == k) return false;
              int unwatched = full & ~watched;
              int need = (__builtin_popcount(unwatched) + biggest - 1) / biggest;
              if (chosen + need > k) return false;
              int v = __builtin_ctz(unwatched);
              for (size_t u = 0; u < closed.size(); u++) {
                  if ((closed[v] >> u) & 1) {
                      if (dominate(watched | closed[u], chosen + 1, k, full, closed, biggest)) return true;
                  }
              }
              return false;
          }`,
        java: r`
          static boolean dominate(int watched, int chosen, int k, int full, int[] closed, int biggest) {
              if (watched == full) return true;
              if (chosen == k) return false;
              int unwatched = full & ~watched;
              int need = (Integer.bitCount(unwatched) + biggest - 1) / biggest;
              if (chosen + need > k) return false;
              int v = Integer.numberOfTrailingZeros(unwatched);
              for (int u = 0; u < closed.length; u++) {
                  if (((closed[v] >> u) & 1) != 0) {
                      if (dominate(watched | closed[u], chosen + 1, k, full, closed, biggest)) return true;
                  }
              }
              return false;
          }`
      },
      python: r`
        closed = [1 << v for v in range(n)]
        for a, b in edges:
            closed[a - 1] |= 1 << (b - 1)
            closed[b - 1] |= 1 << (a - 1)
        biggest = max(bin(x).count("1") for x in closed)
        full = (1 << n) - 1
        for k in range(n + 1):
            if dominate(0, 0, k, full, closed, biggest):
                print(k)
                break`,
      cpp: r`
        vector<int> closed(n);
        for (int v = 0; v < n; v++) closed[v] = 1 << v;
        for (int i = 0; i < m; i++) {
            closed[edges[i][0] - 1] |= 1 << (edges[i][1] - 1);
            closed[edges[i][1] - 1] |= 1 << (edges[i][0] - 1);
        }
        int biggest = 1;
        for (int x : closed) biggest = max(biggest, __builtin_popcount(x));
        int full = (1 << n) - 1;
        for (int k = 0; k <= n; k++) {
            if (dominate(0, 0, k, full, closed, biggest)) {
                cout << k << "\n";
                break;
            }
        }`,
      java: r`
        int[] closed = new int[(int) n];
        for (int v = 0; v < n; v++) closed[v] = 1 << v;
        for (int i = 0; i < m; i++) {
            closed[(int) edges[i][0] - 1] |= 1 << (edges[i][1] - 1);
            closed[(int) edges[i][1] - 1] |= 1 << (edges[i][0] - 1);
        }
        int biggest = 1;
        for (int x : closed) biggest = Math.max(biggest, Integer.bitCount(x));
        int full = (1 << (int) n) - 1;
        for (int k = 0; k <= n; k++) {
            if (dominate(0, 0, k, full, closed, biggest)) {
                System.out.println(k);
                break;
            }
        }`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['For k = 0, 1, 2, ... the search takes the lowest unwatched vertex and tries each vertex that could watch it as the next guard, stopping a branch when the number of guards still needed (unwatched vertices divided by the largest closed neighbourhood) exceeds the budget.'], complexity: 'Time exponential in k and the degrees, small for n <= 20; space O(k).' },
    solve(input) {
      const { n, adj } = adjacency(input); const closed = adj.map((a, v) => a | (1 << v)); const full = (1 << n) - 1;
      const dom = new Int32Array(1 << n); let best = n;
      for (let mask = 1; mask < 1 << n; mask++) { const low = mask & -mask; dom[mask] = dom[mask ^ low] | closed[Math.log2(low)]; if (dom[mask] === full) best = Math.min(best, popcount(mask)); }
      return String(best);
    },
    tests() {
      const g = rng(701);
      const some = (n, p) => allPairs(n).filter(() => g() < p);
      return ['5 4\n1 2\n2 3\n3 4\n4 5\n', '1 0\n', '2 0\n', '3 3\n1 2\n2 3\n1 3\n', graphText(20, []), graphText(20, allPairs(20)), graphText(20, many(19, (i) => [i + 1, i + 2])), graphText(20, many(20, (i) => [Math.min(i + 1, ((i + 1) % 20) + 1), Math.max(i + 1, ((i + 1) % 20) + 1)])), graphText(20, some(20, 0.08)), graphText(20, some(20, 0.12)), graphText(20, some(20, 0.2)), graphText(20, some(20, 0.35)), graphText(19, some(19, 0.1)), graphText(20, many(19, (i) => [1, i + 2])), graphText(18, some(18, 0.15)), graphText(20, [...many(10, (i) => [2 * i + 1, 2 * i + 2])])];
    }
  },

  {
    slug: 'latin-square-completions',
    title: 'Complete the Latin Square',
    difficulty: 'hard',
    tags: ['backtracking', 'constraints', 'bitmask', 'latin-square'],
    concept: {
      title: 'Always fill the cell with the fewest choices',
      body: [
        'A *Latin square* of order `n` is an `n` by `n` grid with the numbers `1 .. n` where every row and every column contains each number exactly once (a sudoku without the boxes). Some cells are already filled. Count the ways to fill the others. The state is kept in two arrays of bit masks, one per row and one per column; the choices of a cell are the numbers in neither mask of its row and column.',
        'Filling the cells in reading order is slow when the given numbers are in the last rows: the search finds the contradictions late. Instead, as in the sudoku, pick the **empty cell with the fewest possible numbers**. A cell with one possibility is forced, and a cell with none ends the branch at once. This choice does not change the answer, only the shape and size of the search tree.',
        { code: 'def count():\n    best, best_mask, best_count = -1, 0, n + 1\n    for i in range(n * n):\n        if cells[i] == 0:\n            mask = ~(rows[i // n] | cols[i % n]) & full\n            c = popcount(mask)\n            if c < best_count:\n                best, best_mask, best_count = i, mask, c\n    if best == -1:\n        return 1                          # no empty cell: one completed square\n    if best_count == 0:\n        return 0\n    total = 0\n    for d in the digits in best_mask:\n        place d in best; total += count(); remove d\n    return total' },
        'If the given numbers already break the rules (the same number twice in a row or a column), no completion exists, and the answer is 0: this is detected while the masks are filled in. For a 5 by 5 square there are 161280 Latin squares in total, so a few given numbers reduce the count a lot.'
      ]
    },
    statement: ['A grid of size `n` by `n` is partly filled with numbers from 1 to `n`; an empty cell is written as `0`. Count the ways to fill the empty cells so that every row and every column contains each of the numbers 1 to `n` exactly once. If the given numbers already break this rule, the answer is 0.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has `n` characters (digits 0 to `n`, without spaces).'],
    outputFormat: ['Print the number of completions.'],
    constraints: ['2 <= n <= 5', 'If n is at least 3, at least 3 of the cells are filled.'],
    examples: [{ input: '3\n100\n020\n003\n', note: 'The numbers on the diagonal force all the others: the only square is 1 3 2 / 3 2 1 / 2 1 3.' }],
    hints: ['Keep a bit mask of the used numbers for every row and every column; fill the masks from the given cells first.', 'If a given number repeats in a row or column, print 0.', 'Fill the empty cell with the fewest candidates first.'],
    program: {
      io: ['n:int', 'grid:rows[n]'],
      helpers: {
        python: r`
          def count(cells, n, rows, cols, full):
              best, best_mask, best_count = -1, 0, n + 1
              for i in range(n * n):
                  if cells[i] == 0:
                      mask = ~(rows[i // n] | cols[i % n]) & full
                      c = bin(mask).count("1")
                      if c < best_count:
                          best, best_mask, best_count = i, mask, c
                          if c <= 1:
                              break
              if best == -1:
                  return 1
              if best_count == 0:
                  return 0
              r, c0 = best // n, best % n
              total = 0
              for d in range(1, n + 1):
                  bit = 1 << d
                  if best_mask & bit:
                      cells[best] = d
                      rows[r] |= bit
                      cols[c0] |= bit
                      total += count(cells, n, rows, cols, full)
                      cells[best] = 0
                      rows[r] &= ~bit
                      cols[c0] &= ~bit
              return total`,
        cpp: r`
          long long count(vector<int>& cells, int n, vector<int>& rows, vector<int>& cols, int full) {
              int best = -1, bestMask = 0, bestCount = n + 1;
              for (int i = 0; i < n * n; i++) {
                  if (cells[i] != 0) continue;
                  int mask = ~(rows[i / n] | cols[i % n]) & full;
                  int c = __builtin_popcount(mask);
                  if (c < bestCount) {
                      best = i;
                      bestMask = mask;
                      bestCount = c;
                      if (c <= 1) break;
                  }
              }
              if (best == -1) return 1;
              if (bestCount == 0) return 0;
              int r = best / n, c0 = best % n;
              long long total = 0;
              for (int d = 1; d <= n; d++) {
                  int bit = 1 << d;
                  if (!(bestMask & bit)) continue;
                  cells[best] = d;
                  rows[r] |= bit;
                  cols[c0] |= bit;
                  total += count(cells, n, rows, cols, full);
                  cells[best] = 0;
                  rows[r] &= ~bit;
                  cols[c0] &= ~bit;
              }
              return total;
          }`,
        java: r`
          static long count(int[] cells, int n, int[] rows, int[] cols, int full) {
              int best = -1, bestMask = 0, bestCount = n + 1;
              for (int i = 0; i < n * n; i++) {
                  if (cells[i] != 0) continue;
                  int mask = ~(rows[i / n] | cols[i % n]) & full;
                  int c = Integer.bitCount(mask);
                  if (c < bestCount) {
                      best = i;
                      bestMask = mask;
                      bestCount = c;
                      if (c <= 1) break;
                  }
              }
              if (best == -1) return 1;
              if (bestCount == 0) return 0;
              int r = best / n, c0 = best % n;
              long total = 0;
              for (int d = 1; d <= n; d++) {
                  int bit = 1 << d;
                  if ((bestMask & bit) == 0) continue;
                  cells[best] = d;
                  rows[r] |= bit;
                  cols[c0] |= bit;
                  total += count(cells, n, rows, cols, full);
                  cells[best] = 0;
                  rows[r] &= ~bit;
                  cols[c0] &= ~bit;
              }
              return total;
          }`
      },
      python: r`
        cells = [int(ch) for row in grid for ch in row]
        rows_m, cols_m = [0] * n, [0] * n
        clash = False
        for i, d in enumerate(cells):
            if d:
                bit = 1 << d
                if rows_m[i // n] & bit or cols_m[i % n] & bit:
                    clash = True
                rows_m[i // n] |= bit
                cols_m[i % n] |= bit
        full = (1 << (n + 1)) - 2
        print(0 if clash else count(cells, n, rows_m, cols_m, full))`,
      cpp: r`
        vector<int> cells(n * n), rowsM(n, 0), colsM(n, 0);
        bool clash = false;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                int d = grid[i][j] - '0';
                cells[i * n + j] = d;
                if (d) {
                    int bit = 1 << d;
                    if ((rowsM[i] & bit) || (colsM[j] & bit)) clash = true;
                    rowsM[i] |= bit;
                    colsM[j] |= bit;
                }
            }
        }
        int full = (1 << (n + 1)) - 2;
        cout << (clash ? 0 : count(cells, (int)n, rowsM, colsM, full)) << "\n";`,
      java: r`
        int[] cells = new int[(int) (n * n)], rowsM = new int[(int) n], colsM = new int[(int) n];
        boolean clash = false;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                int d = grid[i].charAt(j) - '0';
                cells[i * (int) n + j] = d;
                if (d != 0) {
                    int bit = 1 << d;
                    if ((rowsM[i] & bit) != 0 || (colsM[j] & bit) != 0) clash = true;
                    rowsM[i] |= bit;
                    colsM[j] |= bit;
                }
            }
        }
        int full = (1 << ((int) n + 1)) - 2;
        System.out.println(clash ? 0 : count(cells, (int) n, rowsM, colsM, full));`
    },
    solution: { explanation: ['The masks of the used numbers per row and column are filled from the given cells (a repeat gives 0). The search then repeatedly takes the empty cell with the fewest candidate numbers, tries each, and undoes the masks, counting a completed square as one.'], complexity: 'Time small with the given cells (at most about 10^4 steps), space O(n^2).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const given = rs.slice(1, 1 + n).join('').split('').map(Number);
      return String(latinSquares(n).filter((sq) => sq.every((v, i) => given[i] === 0 || given[i] === v)).length);
    },
    tests() {
      const g = rng(702);
      const make = (n, cells) => `${n}\n${many(n, (i) => cells.slice(i * n, i * n + n).join('')).join('\n')}\n`;
      const fromSquare = (n, keep) => { const sq = latinSquares(n)[randInt(g, 0, latinSquares(n).length - 1)]; const cells = Array(n * n).fill(0); for (const i of shuffle(g, many(n * n, (k) => k)).slice(0, keep)) cells[i] = sq[i]; return make(n, cells); };
      const lastRowOnly = (n) => { const sq = latinSquares(n)[randInt(g, 0, latinSquares(n).length - 1)]; const cells = Array(n * n).fill(0); for (let j = 0; j < n; j++) cells[(n - 1) * n + j] = sq[(n - 1) * n + j]; return make(n, cells); };
      return ['3\n100\n020\n003\n', '2\n10\n00\n', '2\n12\n00\n', '2\n11\n00\n', '3\n123\n000\n000\n', '3\n120\n000\n003\n', '4\n1000\n0200\n0030\n0004\n', lastRowOnly(5), lastRowOnly(4), fromSquare(5, 3), fromSquare(5, 4), fromSquare(5, 5), fromSquare(5, 7), fromSquare(5, 10), fromSquare(4, 3), '5\n10000\n02000\n00300\n00040\n00005\n', '5\n12345\n00000\n00000\n00000\n00000\n'];
    }
  },

  {
    slug: 'count-automorphisms',
    title: 'How Many Ways Does a Graph Look the Same?',
    difficulty: 'hard',
    tags: ['backtracking', 'graph', 'permutations', 'pruning'],
    concept: {
      title: 'Map the vertices one by one and check the edges to the vertices already mapped',
      body: [
        'An *automorphism* of a graph is a way to rename its vertices (a permutation `p`) so that the graph looks exactly the same: there is an edge between `u` and `v` **if and only if** there is an edge between `p(u)` and `p(v)`. The identity is always one. A square has 8 automorphisms (4 rotations and 4 reflections); a complete graph on `n` vertices has `n!`. We want their number.',
        'Decide the images of the vertices in the order 0, 1, 2, ... For vertex `i` try every vertex `t` that is not yet an image. Check the new pair against **every vertex already decided**: `adj[i][j]` must be equal to `adj[t][image[j]]` for all `j < i`. A vertex can only map to a vertex of the **same degree**, which is an even earlier test.',
        { code: 'def count(i):\n    if i == n:\n        return 1\n    total = 0\n    for t in range(n):\n        if used[t] or deg[i] != deg[t]:\n            continue\n        if all(adj[i][j] == adj[t][image[j]] for j in range(i)):\n            image[i] = t\n            used[t] = True\n            total += count(i + 1)\n            used[t] = False\n    return total' },
        'The consistency check works because every edge and every non-edge is checked exactly when its second end gets an image. The count is a plain number of leaves of this tree: up to `n!` = 40320 for 8 vertices (no edges or all edges), and very few for graphs with little symmetry.'
      ]
    },
    statement: ['A graph has `n` vertices and `m` edges. Count the permutations `p` of the vertices such that for every pair of vertices `u` and `v`, there is an edge between `u` and `v` exactly when there is an edge between `p(u)` and `p(v)`.'],
    inputFormat: ['The first line has `n` and `m`.', 'Each of the next `m` lines has two vertices joined by an edge.'],
    outputFormat: ['Print the number of such permutations.'],
    constraints: ['1 <= n <= 8', '0 <= m <= n * (n - 1) / 2, no repeated edges and no loops'],
    examples: [{ input: '4 4\n1 2\n2 3\n3 4\n4 1\n', note: 'A square has 8 symmetries: 4 rotations and 4 reflections.' }],
    hints: ['Map the vertices in order; a vertex can only go to an unused vertex of the same degree.', 'For the new pair check the edge between the vertex and every earlier vertex against the edge between their images.', 'Count one when all vertices are mapped.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      helpers: {
        python: r`
          def count(i, n, adj, deg, image, used):
              if i == n:
                  return 1
              total = 0
              for t in range(n):
                  if used[t] or deg[i] != deg[t]:
                      continue
                  if all(adj[i][j] == adj[t][image[j]] for j in range(i)):
                      image[i] = t
                      used[t] = True
                      total += count(i + 1, n, adj, deg, image, used)
                      used[t] = False
              return total`,
        cpp: r`
          long long countMaps(int i, int n, const vector<vector<char>>& adj, const vector<int>& deg, vector<int>& image, vector<char>& used) {
              if (i == n) return 1;
              long long total = 0;
              for (int t = 0; t < n; t++) {
                  if (used[t] || deg[i] != deg[t]) continue;
                  bool ok = true;
                  for (int j = 0; j < i; j++) {
                      if (adj[i][j] != adj[t][image[j]]) ok = false;
                  }
                  if (ok) {
                      image[i] = t;
                      used[t] = 1;
                      total += countMaps(i + 1, n, adj, deg, image, used);
                      used[t] = 0;
                  }
              }
              return total;
          }`,
        java: r`
          static long countMaps(int i, int n, boolean[][] adj, int[] deg, int[] image, boolean[] used) {
              if (i == n) return 1;
              long total = 0;
              for (int t = 0; t < n; t++) {
                  if (used[t] || deg[i] != deg[t]) continue;
                  boolean ok = true;
                  for (int j = 0; j < i; j++) {
                      if (adj[i][j] != adj[t][image[j]]) ok = false;
                  }
                  if (ok) {
                      image[i] = t;
                      used[t] = true;
                      total += countMaps(i + 1, n, adj, deg, image, used);
                      used[t] = false;
                  }
              }
              return total;
          }`
      },
      python: r`
        adj = [[False] * n for _ in range(n)]
        for a, b in edges:
            adj[a - 1][b - 1] = adj[b - 1][a - 1] = True
        deg = [sum(row) for row in adj]
        print(count(0, n, adj, deg, [0] * n, [False] * n))`,
      cpp: r`
        vector<vector<char>> adj(n, vector<char>(n, 0));
        for (int i = 0; i < m; i++) {
            adj[edges[i][0] - 1][edges[i][1] - 1] = 1;
            adj[edges[i][1] - 1][edges[i][0] - 1] = 1;
        }
        vector<int> deg(n, 0), image(n, 0);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) deg[i] += adj[i][j];
        }
        vector<char> used(n, 0);
        cout << countMaps(0, (int)n, adj, deg, image, used) << "\n";`,
      java: r`
        boolean[][] adj = new boolean[(int) n][(int) n];
        for (int i = 0; i < m; i++) {
            adj[(int) edges[i][0] - 1][(int) edges[i][1] - 1] = true;
            adj[(int) edges[i][1] - 1][(int) edges[i][0] - 1] = true;
        }
        int[] deg = new int[(int) n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (adj[i][j]) deg[i]++;
            }
        }
        System.out.println(countMaps(0, (int) n, adj, deg, new int[(int) n], new boolean[(int) n]));`
    },
    solution: { explanation: ['Images are chosen vertex by vertex among unused vertices of equal degree; a choice must agree with the edge or non-edge to every earlier vertex and its image. A complete mapping is one automorphism.'], complexity: 'Time up to O(n! * n) (40 320 leaves for n = 8), space O(n).' },
    solve(input) {
      const { n, adj } = adjacency(input); let count = 0; const perm = Array.from({ length: n }, (_, i) => i);
      const go = (k) => { if (k === n) { for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (((adj[u] >> v) & 1) !== ((adj[perm[u]] >> perm[v]) & 1)) return; count++; return; } for (let i = k; i < n; i++) { [perm[k], perm[i]] = [perm[i], perm[k]]; go(k + 1); [perm[k], perm[i]] = [perm[i], perm[k]]; } };
      go(0); return String(count);
    },
    tests() {
      const g = rng(703);
      const some = (n, p) => allPairs(n).filter(() => g() < p);
      const cycle = (n) => many(n, (i) => [Math.min(i + 1, ((i + 1) % n) + 1), Math.max(i + 1, ((i + 1) % n) + 1)]);
      return ['4 4\n1 2\n2 3\n3 4\n4 1\n', '1 0\n', '2 0\n', '2 1\n1 2\n', graphText(8, []), graphText(8, allPairs(8)), graphText(8, cycle(8)), graphText(7, cycle(7)), graphText(8, many(7, (i) => [i + 1, i + 2])), graphText(8, many(7, (i) => [1, i + 2])), graphText(8, some(8, 0.3)), graphText(8, some(8, 0.5)), graphText(8, [[1, 2], [3, 4], [5, 6], [7, 8]]), graphText(8, [...allPairs(4), ...allPairs(8).filter(([a, b]) => a > 4)]), graphText(6, some(6, 0.4))];
    }
  },

  {
    slug: 'tromino-tilings-count',
    title: 'Cover the Board With L-Shaped Pieces',
    difficulty: 'hard',
    tags: ['backtracking', 'grid', 'tiling'],
    concept: {
      title: 'Cover the first empty square, with each of the four turns of the L',
      body: [
        'An *L-tromino* covers three squares of a 2 by 2 block (the block without one corner), so it has 4 orientations. As with dominoes, count the tilings by always covering the **first empty square in reading order**: whatever piece covers it, this square must be the **first square of the piece in reading order**. So each orientation can be described by the offsets of its three squares from its first square.',
        { code: 'SHAPES = [\n    [(0, 0), (0, 1), (1, 0)],     # the 2x2 block without its bottom right corner\n    [(0, 0), (0, 1), (1, 1)],     # without its bottom left corner\n    [(0, 0), (1, 0), (1, 1)],     # without its top right corner\n    [(0, 0), (1, -1), (1, 0)],    # without its top left corner: the first square is the top right one\n]' },
        'For every orientation check that the three squares are inside the board and free, cover them, recurse, and uncover them. Holes (`#`) are covered from the start. Compared with the domino problem, the only change is the list of pieces: the **same search** works for any set of shapes, which makes this method the standard way to attack tiling puzzles.'
      ]
    },
    statement: ['A board has `r` rows and `c` columns; some squares are holes (`#`), the others are free (`.`). A piece is an L-tromino: it covers three squares of a 2 by 2 block, in any of its 4 orientations. Count the ways to cover every free square with pieces that do not overlap and do not cover holes. Two tilings are different if some piece is different.'],
    inputFormat: ['The first line has `r` and `c`.', 'Each of the next `r` lines has `c` characters, `.` or `#`.'],
    outputFormat: ['Print the number of tilings (it can be 0).'],
    constraints: ['1 <= r, c <= 6'],
    examples: [{ input: '2 3\n...\n...\n', note: 'The 2 by 3 board can be covered with two L pieces in 2 ways.' }],
    hints: ['Always cover the first free square in reading order.', 'Describe each orientation by the offsets of its squares relative to its first square in reading order.', 'Check the three squares, cover them, recurse, and uncover them.'],
    program: {
      io: ['r:int c:int', 'board:rows[r]'],
      helpers: {
        python: r`
          SHAPES = [
              [(0, 0), (0, 1), (1, 0)],
              [(0, 0), (0, 1), (1, 1)],
              [(0, 0), (1, 0), (1, 1)],
              [(0, 0), (1, -1), (1, 0)],
          ]

          def tilings(covered, r, c, pos):
              while pos < r * c and covered[pos // c][pos % c]:
                  pos += 1
              if pos == r * c:
                  return 1
              row, col = divmod(pos, c)
              total = 0
              for shape in SHAPES:
                  cells = [(row + dr, col + dc) for dr, dc in shape]
                  if all(0 <= a < r and 0 <= b < c and not covered[a][b] for a, b in cells):
                      for a, b in cells:
                          covered[a][b] = True
                      total += tilings(covered, r, c, pos + 1)
                      for a, b in cells:
                          covered[a][b] = False
              return total`,
        cpp: r`
          const int SHAPES[4][3][2] = {
              {{0, 0}, {0, 1}, {1, 0}},
              {{0, 0}, {0, 1}, {1, 1}},
              {{0, 0}, {1, 0}, {1, 1}},
              {{0, 0}, {1, -1}, {1, 0}},
          };

          long long tilings(vector<vector<char>>& covered, int r, int c, int pos) {
              while (pos < r * c && covered[pos / c][pos % c]) pos++;
              if (pos == r * c) return 1;
              int row = pos / c, col = pos % c;
              long long total = 0;
              for (int s = 0; s < 4; s++) {
                  bool ok = true;
                  for (int k = 0; k < 3; k++) {
                      int a = row + SHAPES[s][k][0], b = col + SHAPES[s][k][1];
                      if (a < 0 || a >= r || b < 0 || b >= c || covered[a][b]) ok = false;
                  }
                  if (!ok) continue;
                  for (int k = 0; k < 3; k++) covered[row + SHAPES[s][k][0]][col + SHAPES[s][k][1]] = 1;
                  total += tilings(covered, r, c, pos + 1);
                  for (int k = 0; k < 3; k++) covered[row + SHAPES[s][k][0]][col + SHAPES[s][k][1]] = 0;
              }
              return total;
          }`,
        java: r`
          static final int[][][] SHAPES = {
              {{0, 0}, {0, 1}, {1, 0}},
              {{0, 0}, {0, 1}, {1, 1}},
              {{0, 0}, {1, 0}, {1, 1}},
              {{0, 0}, {1, -1}, {1, 0}},
          };

          static long tilings(boolean[][] covered, int r, int c, int pos) {
              while (pos < r * c && covered[pos / c][pos % c]) pos++;
              if (pos == r * c) return 1;
              int row = pos / c, col = pos % c;
              long total = 0;
              for (int[][] shape : SHAPES) {
                  boolean ok = true;
                  for (int[] cell : shape) {
                      int a = row + cell[0], b = col + cell[1];
                      if (a < 0 || a >= r || b < 0 || b >= c || covered[a][b]) ok = false;
                  }
                  if (!ok) continue;
                  for (int[] cell : shape) covered[row + cell[0]][col + cell[1]] = true;
                  total += tilings(covered, r, c, pos + 1);
                  for (int[] cell : shape) covered[row + cell[0]][col + cell[1]] = false;
              }
              return total;
          }`
      },
      python: r`
        covered = [[ch == "#" for ch in row] for row in board]
        print(tilings(covered, r, c, 0))`,
      cpp: r`
        vector<vector<char>> covered(r, vector<char>(c, 0));
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) covered[i][j] = board[i][j] == '#';
        }
        cout << tilings(covered, (int)r, (int)c, 0) << "\n";`,
      java: r`
        boolean[][] covered = new boolean[(int) r][(int) c];
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) covered[i][j] = board[i].charAt(j) == '#';
        }
        System.out.println(tilings(covered, (int) r, (int) c, 0));`
    },
    solution: { explanation: ['The function finds the first uncovered square, tries the four orientations of the L-piece whose first square (in reading order) is that square, covers its three squares when they are free and inside the board, recurses, and uncovers them.'], complexity: 'Time proportional to the number of partial tilings (small for 6 by 6), space O(r * c).' },
    solve(input) {
      const rs = rows(input); const [r, c] = nums(rs[0]); const board = rs.slice(1, 1 + r); const free = []; board.forEach((row, i) => [...row].forEach((ch, j) => { if (ch === '.') free.push([i, j]); }));
      if (free.length % 3) return '0';
      // independent: enumerate all pieces as sets of three cells, then exact cover over the free cells by the lowest free cell
      const idx = new Map(free.map(([i, j], k) => [`${i},${j}`, k])); const pieces = [];
      for (let i = 0; i + 1 < r; i++) for (let j = 0; j + 1 < c; j++) { const block = [[i, j], [i, j + 1], [i + 1, j], [i + 1, j + 1]]; for (let skip = 0; skip < 4; skip++) { const cells = block.filter((_, k) => k !== skip); if (cells.every(([a, b]) => idx.has(`${a},${b}`))) pieces.push(cells.map(([a, b]) => idx.get(`${a},${b}`))); } }
      const k = free.length; const byCell = Array.from({ length: k }, () => []); for (const p of pieces) for (const cell of p) byCell[cell].push(p);
      const used = Array(k).fill(false); const go = () => { let first = used.indexOf(false); if (first < 0) return 1; let total = 0; for (const p of byCell[first]) if (p.every((x) => !used[x])) { for (const x of p) used[x] = true; total += go(); for (const x of p) used[x] = false; } return total; };
      return String(go());
    },
    tests() {
      const g = rng(704);
      const make = (r, c, p) => { const m = many(r, () => many(c, () => (g() < p ? '#' : '.'))); return `${r} ${c}\n${m.map((x) => x.join('')).join('\n')}\n`; };
      const open = (r, c) => `${r} ${c}\n${many(r, () => '.'.repeat(c)).join('\n')}\n`;
      return ['2 3\n...\n...\n', '1 3\n...\n', '3 3\n...\n...\n...\n', '2 2\n..\n.#\n', open(3, 4), open(4, 6), open(6, 6), open(6, 5), open(5, 6), open(6, 4), make(6, 6, 0.08), make(6, 6, 0.12), make(5, 6, 0.1), make(6, 6, 0.2), make(4, 6, 0.1), make(3, 6, 0.1)];
    }
  },

  {
    slug: 'futoshiki-count',
    title: 'The Latin Square With Greater-Than Signs',
    difficulty: 'hard',
    tags: ['backtracking', 'constraints', 'puzzle', 'latin-square'],
    concept: {
      title: 'The same search as the Latin square, with one more rule for every sign',
      body: [
        'In a *futoshiki* puzzle you fill an `n` by `n` grid with the numbers `1 .. n`, each once per row and column, and some neighbouring cells carry a **less-than sign** between them: the number in one cell must be smaller than the number in the other. Some cells may be given. We count the solutions.',
        'The search is the one of the Latin square: bit masks for the used numbers of every row and column, and the empty cell with the fewest candidates first. The new rule is added to the candidates of a cell: for each sign that links the cell with a **neighbour that has a number already**, only the numbers that keep the sign true are allowed. If the neighbour must be bigger than this cell and has the number `v`, the cell may only take numbers from `1` to `v - 1`; if it must be smaller, from `v + 1` to `n`.',
        { code: 'def candidates(i):\n    mask = ~(rows[i // n] | cols[i % n]) & full\n    for j, sign in links[i]:                    # sign +1: this cell < cell j; sign -1: this cell > cell j\n        if cells[j]:\n            if sign == 1:\n                mask &= (1 << cells[j]) - 2                  # numbers below cells[j]\n            else:\n                mask &= full & ~((1 << (cells[j] + 1)) - 1)    # numbers above cells[j]\n    return mask' },
        'A sign between two **given** cells is checked once at the start; if it is false the answer is 0. As before, given numbers that repeat in a row or a column also give 0. With at least eight clues in total (given numbers and signs) the search is tiny.'
      ]
    },
    statement: ['An `n` by `n` grid is partly filled with numbers 1 to `n` (empty cells are `0`). There are `m` signs: each says that the number in a cell must be smaller than the number in a neighbouring cell (they share a side). Count the ways to fill the empty cells so that every row and every column has each of the numbers 1 to `n` exactly once and all signs are true. If the given numbers already break a rule, the answer is 0.'],
    inputFormat: ['The first line has `n` and `m`.', 'The next `n` lines have `n` characters each (digits 0 to `n`, no spaces).', 'The next `m` lines each have four numbers `r1 c1 r2 c2` (rows and columns from 1): the number at `(r1, c1)` must be smaller than the number at `(r2, c2)`.'],
    outputFormat: ['Print the number of solutions.'],
    constraints: ['2 <= n <= 5', '0 <= m <= 40', 'The two cells of a sign share a side.', 'If n is 5, the number of given cells plus m is at least 8.'],
    examples: [{ input: '3 4\n000\n000\n000\n1 1 1 2\n1 2 1 3\n2 1 3 1\n3 3 3 2\n', note: 'A 3 by 3 puzzle with four signs and no given numbers.' }],
    hints: ['Use the bit masks of the Latin square and the cell with the fewest candidates.', 'For every sign, remove from the candidates of a cell the numbers that would break it, when the other cell already has a number.', 'Check signs between two given numbers at the start.'],
    program: {
      io: ['n:int m:int', 'grid:rows[n]', 'signs:int[m][4]'],
      helpers: {
        python: r`
          def candidates(cells, n, rows, cols, links, full, i):
              mask = ~(rows[i // n] | cols[i % n]) & full
              for j, sign in links[i]:
                  if cells[j]:
                      if sign == 1:
                          mask &= (1 << cells[j]) - 2
                      else:
                          mask &= full & ~((1 << (cells[j] + 1)) - 1)
              return mask

          def count(cells, n, rows, cols, links, full):
              best, best_mask, best_count = -1, 0, n + 1
              for i in range(n * n):
                  if cells[i] == 0:
                      mask = candidates(cells, n, rows, cols, links, full, i)
                      c = bin(mask).count("1")
                      if c < best_count:
                          best, best_mask, best_count = i, mask, c
                          if c <= 1:
                              break
              if best == -1:
                  return 1
              if best_count == 0:
                  return 0
              r, c0 = best // n, best % n
              total = 0
              for d in range(1, n + 1):
                  bit = 1 << d
                  if best_mask & bit:
                      cells[best] = d
                      rows[r] |= bit
                      cols[c0] |= bit
                      total += count(cells, n, rows, cols, links, full)
                      cells[best] = 0
                      rows[r] &= ~bit
                      cols[c0] &= ~bit
              return total`,
        cpp: r`
          int candidates(const vector<int>& cells, int n, const vector<int>& rows, const vector<int>& cols, const vector<vector<pair<int, int>>>& links, int full, int i) {
              int mask = ~(rows[i / n] | cols[i % n]) & full;
              for (const auto& link : links[i]) {
                  int v = cells[link.first];
                  if (v) {
                      if (link.second == 1) mask &= (1 << v) - 2;
                      else mask &= full & ~((1 << (v + 1)) - 1);
                  }
              }
              return mask;
          }

          long long count(vector<int>& cells, int n, vector<int>& rows, vector<int>& cols, const vector<vector<pair<int, int>>>& links, int full) {
              int best = -1, bestMask = 0, bestCount = n + 1;
              for (int i = 0; i < n * n; i++) {
                  if (cells[i] != 0) continue;
                  int mask = candidates(cells, n, rows, cols, links, full, i);
                  int c = __builtin_popcount(mask);
                  if (c < bestCount) {
                      best = i;
                      bestMask = mask;
                      bestCount = c;
                      if (c <= 1) break;
                  }
              }
              if (best == -1) return 1;
              if (bestCount == 0) return 0;
              int r = best / n, c0 = best % n;
              long long total = 0;
              for (int d = 1; d <= n; d++) {
                  int bit = 1 << d;
                  if (!(bestMask & bit)) continue;
                  cells[best] = d;
                  rows[r] |= bit;
                  cols[c0] |= bit;
                  total += count(cells, n, rows, cols, links, full);
                  cells[best] = 0;
                  rows[r] &= ~bit;
                  cols[c0] &= ~bit;
              }
              return total;
          }`,
        java: r`
          static int candidates(int[] cells, int n, int[] rows, int[] cols, List<List<int[]>> links, int full, int i) {
              int mask = ~(rows[i / n] | cols[i % n]) & full;
              for (int[] link : links.get(i)) {
                  int v = cells[link[0]];
                  if (v != 0) {
                      if (link[1] == 1) mask &= (1 << v) - 2;
                      else mask &= full & ~((1 << (v + 1)) - 1);
                  }
              }
              return mask;
          }

          static long count(int[] cells, int n, int[] rows, int[] cols, List<List<int[]>> links, int full) {
              int best = -1, bestMask = 0, bestCount = n + 1;
              for (int i = 0; i < n * n; i++) {
                  if (cells[i] != 0) continue;
                  int mask = candidates(cells, n, rows, cols, links, full, i);
                  int c = Integer.bitCount(mask);
                  if (c < bestCount) {
                      best = i;
                      bestMask = mask;
                      bestCount = c;
                      if (c <= 1) break;
                  }
              }
              if (best == -1) return 1;
              if (bestCount == 0) return 0;
              int r = best / n, c0 = best % n;
              long total = 0;
              for (int d = 1; d <= n; d++) {
                  int bit = 1 << d;
                  if ((bestMask & bit) == 0) continue;
                  cells[best] = d;
                  rows[r] |= bit;
                  cols[c0] |= bit;
                  total += count(cells, n, rows, cols, links, full);
                  cells[best] = 0;
                  rows[r] &= ~bit;
                  cols[c0] &= ~bit;
              }
              return total;
          }`
      },
      includes: ['<algorithm>'],
      python: r`
        cells = [int(ch) for row in grid for ch in row]
        rows_m, cols_m = [0] * n, [0] * n
        bad = False
        for i, d in enumerate(cells):
            if d:
                bit = 1 << d
                if rows_m[i // n] & bit or cols_m[i % n] & bit:
                    bad = True
                rows_m[i // n] |= bit
                cols_m[i % n] |= bit
        links = [[] for _ in range(n * n)]
        for r1, c1, r2, c2 in signs:
            a, b = (r1 - 1) * n + (c1 - 1), (r2 - 1) * n + (c2 - 1)
            links[a].append((b, 1))
            links[b].append((a, -1))
            if cells[a] and cells[b] and cells[a] >= cells[b]:
                bad = True
        full = (1 << (n + 1)) - 2
        print(0 if bad else count(cells, n, rows_m, cols_m, links, full))`,
      cpp: r`
        vector<int> cells(n * n), rowsM(n, 0), colsM(n, 0);
        bool bad = false;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                int d = grid[i][j] - '0';
                cells[i * n + j] = d;
                if (d) {
                    int bit = 1 << d;
                    if ((rowsM[i] & bit) || (colsM[j] & bit)) bad = true;
                    rowsM[i] |= bit;
                    colsM[j] |= bit;
                }
            }
        }
        vector<vector<pair<int, int>>> links(n * n);
        for (int k = 0; k < m; k++) {
            int a = (signs[k][0] - 1) * n + (signs[k][1] - 1), b = (signs[k][2] - 1) * n + (signs[k][3] - 1);
            links[a].push_back({b, 1});
            links[b].push_back({a, -1});
            if (cells[a] && cells[b] && cells[a] >= cells[b]) bad = true;
        }
        int full = (1 << (n + 1)) - 2;
        cout << (bad ? 0 : count(cells, (int)n, rowsM, colsM, links, full)) << "\n";`,
      java: r`
        int size = (int) n;
        int[] cells = new int[size * size], rowsM = new int[size], colsM = new int[size];
        boolean bad = false;
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < size; j++) {
                int d = grid[i].charAt(j) - '0';
                cells[i * size + j] = d;
                if (d != 0) {
                    int bit = 1 << d;
                    if ((rowsM[i] & bit) != 0 || (colsM[j] & bit) != 0) bad = true;
                    rowsM[i] |= bit;
                    colsM[j] |= bit;
                }
            }
        }
        List<List<int[]>> links = new ArrayList<>();
        for (int i = 0; i < size * size; i++) links.add(new ArrayList<>());
        for (int k = 0; k < m; k++) {
            int a = ((int) signs[k][0] - 1) * size + ((int) signs[k][1] - 1), b = ((int) signs[k][2] - 1) * size + ((int) signs[k][3] - 1);
            links.get(a).add(new int[] {b, 1});
            links.get(b).add(new int[] {a, -1});
            if (cells[a] != 0 && cells[b] != 0 && cells[a] >= cells[b]) bad = true;
        }
        int full = (1 << (size + 1)) - 2;
        System.out.println(bad ? 0 : count(cells, size, rowsM, colsM, links, full));`
    },
    solution: { explanation: ['Bit masks for rows and columns give the basic candidates; every sign to a neighbour that already has a number trims the candidates to the numbers below or above it. The search takes the cell with the fewest candidates; contradictions among the givens (repeats or false signs) give 0.'], complexity: 'Time small with eight or more clues, space O(n^2).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const given = rs.slice(1, 1 + n).join('').split('').map(Number); const signs = rs.slice(1 + n, 1 + n + m).map(nums);
      return String(latinSquares(n).filter((sq) => sq.every((v, i) => given[i] === 0 || given[i] === v) && signs.every(([r1, c1, r2, c2]) => sq[(r1 - 1) * n + (c1 - 1)] < sq[(r2 - 1) * n + (c2 - 1)])).length);
    },
    tests() {
      const g = rng(705);
      const make = (n, cells, signs) => `${n} ${signs.length}\n${many(n, (i) => cells.slice(i * n, i * n + n).join('')).join('\n')}\n${signs.map((s) => s.join(' ')).join('\n')}${signs.length ? '\n' : ''}`;
      const puzzle = (n, givens, signCount) => { const sq = latinSquares(n)[randInt(g, 0, latinSquares(n).length - 1)]; const cells = Array(n * n).fill(0); for (const i of shuffle(g, many(n * n, (k) => k)).slice(0, givens)) cells[i] = sq[i]; const options = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { if (j + 1 < n) options.push([i, j, i, j + 1]); if (i + 1 < n) options.push([i, j, i + 1, j]); } const signs = shuffle(g, options).slice(0, signCount).map(([a, b, c, d]) => (sq[a * n + b] < sq[c * n + d] ? [a + 1, b + 1, c + 1, d + 1] : [c + 1, d + 1, a + 1, b + 1])); return make(n, cells, signs); };
      return ['3 4\n000\n000\n000\n1 1 1 2\n1 2 1 3\n2 1 3 1\n3 3 3 2\n', puzzle(3, 2, 6), puzzle(4, 3, 6), puzzle(4, 2, 8), puzzle(4, 0, 10), puzzle(5, 3, 5), puzzle(5, 2, 8), puzzle(5, 0, 12), puzzle(5, 4, 4), puzzle(5, 0, 20), puzzle(5, 1, 14), puzzle(5, 5, 3), make(2, [0, 0, 0, 0], [[1, 1, 1, 2], [1, 1, 2, 1], [1, 2, 2, 2], [2, 1, 2, 2]]), make(3, [1, 0, 0, 0, 0, 0, 0, 0, 1], [[1, 1, 1, 2], [1, 2, 1, 3], [2, 1, 2, 2], [2, 2, 2, 3], [3, 1, 3, 2], [3, 2, 3, 3]])];
    }
  }
];
