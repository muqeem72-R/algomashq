import { r, rng, randInt, many, nums, rows, shuffle } from '../../lib.mjs';
import { graphText, randomEdges, randomTreeEdges, connectedEdges, adjacency, mix, Heap, Dsu, dijkstraSlow } from '../../graphlib.mjs';
import { J, ADJ, WADJ, DSU, EDGE_INPUT, WEDGE_INPUT } from '../../graphcode.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const BS = String.fromCharCode(92);
const parse = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); return { n, m, edges: many(m, (i) => nums(rs[i + 1])), rs }; };
const E = (g, n, m) => mix(g, randomEdges(g, n, m));
const WE = (g, n, m, hi) => mix(g, randomEdges(g, n, m, [1, hi]));
const WC = (g, n, extra, hi) => connectedEdges(g, n, extra, [1, hi]);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const inside = (h, w, a, b) => a >= 0 && a < h && b >= 0 && b < w;
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export default [
  {
    ...hard,
    inputFormat: EDGE_INPUT,
    constraints: ['2 <= n <= 14', '1 <= m <= 91', 'The graph is connected.', 'There are no self-loops and no repeated edges.'],
    slug: 'visit-all-nodes-shortest',
    title: 'The Shortest Walk That Touches Every Node',
    tags: ['graph', 'bfs', 'bitmask', 'state-space'],
    concept: {
      title: 'The state is (set of visited nodes, current node): breadth-first search on at most 2^n * n states',
      body: [
        'A walk may start at any node, may use edges and nodes many times, and has to **visit every node at least once**. What is the smallest number of edges of such a walk? There is no simple formula: the choice of where to go next depends on **which nodes are already visited**. So put that information into the state.',
        'A state is a pair `(mask, v)`: `mask` is the set of the visited nodes written as the bits of an integer, and `v` is the current node. From `(mask, v)` the walk can step along an edge to a neighbour `w` and reach `(mask | (1 << w), w)`. All steps cost 1, so **breadth-first search** over the states gives the shortest walk. Start the search with **all** the states `(1 << v, v)` at distance 0 (the walk may begin anywhere); the first state whose mask has all bits set is the answer.',
        { code: 'full = (1 << n) - 1\ndist = [[-1] * n for _ in range(1 << n)]\nqueue = []\nfor v in range(n):\n    dist[1 << v][v] = 0\n    queue.append((1 << v, v))                 # start anywhere\nfor mask, v in queue:\n    if mask == full:\n        print(dist[mask][v])\n        break\n    for w in adj[v]:\n        nm = mask | (1 << w)\n        if dist[nm][w] < 0:\n            dist[nm][w] = dist[mask][v] + 1\n            queue.append((nm, w))' },
        'There are at most `2^14 * 14`, about 230000 states, each with a few neighbours. This is the idea of *bitmask dynamic programming / BFS*; the same state `(set, position)` appears in the travelling salesman problem. Revisiting nodes is allowed, which is why a plain graph search is not enough but the state space is still small.'
      ]
    },
    statement: ['A connected undirected graph has `n` nodes and `m` edges. A walk may start at any node and moves along edges; nodes and edges may be used again. Print the smallest number of edges of a walk that visits every node at least once.'],
    outputFormat: ['Print the smallest number of edges.'],
    examples: [{ input: '4 3\n1 2\n1 3\n1 4\n', note: 'A star: for example 2, 1, 3, 1, 4 visits all nodes with 4 edges: 4.' }, { input: '4 4\n1 2\n2 3\n3 4\n4 1\n', note: 'Around the cycle: 3 edges.' }],
    hints: ['A state is the set of visited nodes together with the current node.', 'Start the search from every node with only that node visited.', 'The first state in which all nodes are visited gives the answer.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: r`
        adj0 = [[] for _ in range(n)]
        for u, v in edges:
            adj0[u - 1].append(v - 1)
            adj0[v - 1].append(u - 1)
        full = (1 << n) - 1
        dist = [[-1] * n for _ in range(1 << n)]
        queue = []
        for v in range(n):
            dist[1 << v][v] = 0
            queue.append((1 << v, v))
        answer = 0
        for mask, v in queue:
            if mask == full:
                answer = dist[mask][v]
                break
            for w in adj0[v]:
                nm = mask | (1 << w)
                if dist[nm][w] < 0:
                    dist[nm][w] = dist[mask][v] + 1
                    queue.append((nm, w))
        print(answer)`,
      cpp: r`
        int count = (int)n;
        vector<vector<int>> adj0(count);
        for (const vector<long long>& e : edges) {
            adj0[e[0] - 1].push_back((int)e[1] - 1);
            adj0[e[1] - 1].push_back((int)e[0] - 1);
        }
        int full = (1 << count) - 1;
        vector<vector<int>> dist(1 << count, vector<int>(count, -1));
        vector<pair<int, int>> queue;
        for (int v = 0; v < count; v++) {
            dist[1 << v][v] = 0;
            queue.push_back({1 << v, v});
        }
        int answer = 0;
        for (size_t i = 0; i < queue.size(); i++) {
            int mask = queue[i].first, v = queue[i].second;
            if (mask == full) {
                answer = dist[mask][v];
                break;
            }
            for (int w : adj0[v]) {
                int nm = mask | (1 << w);
                if (dist[nm][w] < 0) {
                    dist[nm][w] = dist[mask][v] + 1;
                    queue.push_back({nm, w});
                }
            }
        }
        cout << answer << "\n";`,
      java: r`
        int count = (int) n;
        List<List<Integer>> adj0 = new ArrayList<>();
        for (int v = 0; v < count; v++) adj0.add(new ArrayList<>());
        for (long[] e : edges) {
            adj0.get((int) e[0] - 1).add((int) e[1] - 1);
            adj0.get((int) e[1] - 1).add((int) e[0] - 1);
        }
        int full = (1 << count) - 1;
        int[][] dist = new int[1 << count][count];
        for (int[] row : dist) Arrays.fill(row, -1);
        int[] queueMask = new int[(1 << count) * count];
        int[] queueNode = new int[(1 << count) * count];
        int head = 0, tail = 0;
        for (int v = 0; v < count; v++) {
            dist[1 << v][v] = 0;
            queueMask[tail] = 1 << v;
            queueNode[tail++] = v;
        }
        int answer = 0;
        while (head < tail) {
            int mask = queueMask[head], v = queueNode[head++];
            if (mask == full) {
                answer = dist[mask][v];
                break;
            }
            for (int w : adj0.get(v)) {
                int nm = mask | (1 << w);
                if (dist[nm][w] < 0) {
                    dist[nm][w] = dist[mask][v] + 1;
                    queueMask[tail] = nm;
                    queueNode[tail++] = w;
                }
            }
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['A breadth-first search over the states (set of visited nodes, current node) that starts from all single-node states; the first state with all nodes visited gives the smallest number of edges.'], complexity: 'Time O(2^n * n * deg), space O(2^n * n).' },
    solve(input) {
      const { n, edges } = parse(input); const INF = 1e9; const d = Array.from({ length: n }, () => new Array(n).fill(INF)); for (let i = 0; i < n; i++) d[i][i] = 0; for (const [u, v] of edges) { d[u - 1][v - 1] = 1; d[v - 1][u - 1] = 1; }
      for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
      // the travelling-salesman style DP over subsets with the shortest distances between nodes (a different method from the BFS of the solutions)
      const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(INF)); for (let v = 0; v < n; v++) dp[1 << v][v] = 0;
      for (let mask = 1; mask < (1 << n); mask++) for (let v = 0; v < n; v++) { if (dp[mask][v] >= INF) continue; for (let w = 0; w < n; w++) if (!(mask >> w & 1)) { const nm = mask | (1 << w); dp[nm][w] = Math.min(dp[nm][w], dp[mask][v] + d[v][w]); } }
      return String(Math.min(...dp[(1 << n) - 1]));
    },
    tests() {
      const g = rng(991); const out = ['4 3\n1 2\n1 3\n1 4\n', '4 4\n1 2\n2 3\n3 4\n4 1\n', '2 1\n1 2\n'];
      const conn = (n, extra, shape) => graphText(n, connectedEdges(g, n, extra, null, shape));
      for (const [n, extra, shape] of [[3, 0, 'random'], [5, 2, 'random'], [8, 3, 'random'], [8, 0, 'star'], [10, 0, 'path'], [12, 4, 'random'], [12, 0, 'binary'], [14, 0, 'star'], [14, 0, 'path'], [14, 5, 'random'], [14, 20, 'random'], [14, 100, 'random'], [14, 0, 'binary'], [14, 0, 'deep']]) out.push(conn(n, extra, shape));
      out.push(graphText(14, many(14, (i) => [i + 1, (i + 1) % 14 + 1])));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: WEDGE_INPUT,
    constraints: ['2 <= n <= 20000', '1 <= m <= 30000', '1 <= w <= 10^9', 'There are no self-loops and no repeated edges.'],
    slug: 'second-shortest-route',
    title: 'The Second-Best Route (Strictly Longer)',
    tags: ['graph', 'shortest-path', 'dijkstra', 'k-shortest'],
    concept: {
      title: 'Dijkstra with two distances per node: the shortest and the shortest strictly longer one',
      body: [
        'The shortest route from town 1 to town `n` is found by Dijkstra\'s algorithm. What is the **second-shortest** route, the shortest one that is **strictly longer** than the best? A route may repeat towns and roads (going back and forth over a road is a valid way to make a route longer).',
        'Keep **two** values for every town: `d1[v]`, the shortest distance, and `d2[v]`, the shortest distance that is strictly greater than `d1[v]`. A new candidate distance `nd` for the town `v` is used like this: if `nd < d1[v]`, it becomes the new `d1[v]` and the old `d1[v]` becomes the new `d2[v]`; else if `d1[v] < nd < d2[v]`, it becomes `d2[v]`. Equal values to `d1[v]` are ignored (they are not strictly longer). Both kinds of improvements go into the heap, and the algorithm pops entries as in Dijkstra\'s algorithm, discarding an entry whose distance is larger than `d2` of its town (it can no longer help).',
        { code: 'while heap:\n    d, u = heappop(heap)\n    if d > d2[u]:\n        continue\n    for v, w in adj[u]:\n        nd = d + w\n        if nd < d1[v]:\n            d2[v] = d1[v]                    # the old best becomes the second\n            d1[v] = nd\n            heappush(heap, (nd, v))\n            if d2[v] < INF:\n                heappush(heap, (d2[v], v))\n        elif d1[v] < nd < d2[v]:\n            d2[v] = nd\n            heappush(heap, (nd, v))' },
        'Every town has at most two final values, so each is settled at most twice and the time is O((n + m) log n). If town `n` has no second distance (for example the graph is not connected to it), print -1; in any connected graph with `n >= 2` a second distance exists, because one can walk back and forth over a road.'
      ]
    },
    statement: ['A road network has `n` towns and `m` two-way roads with positive lengths. A route may use towns and roads several times. Let `D` be the length of the shortest route from town 1 to town `n`. Print the length of the shortest route that is strictly longer than `D`, or -1 if town `n` cannot be reached.'],
    outputFormat: ['Print the length or -1.'],
    examples: [{ input: '3 3\n1 2 2\n2 3 3\n1 3 6\n', note: 'The shortest route is 1, 2, 3 with the length 5. The next length is 6 (the road 1-3): 6.' }, { input: '2 1\n1 2 5\n', note: 'The only road gives 5; the next route is 1, 2, 1, 2 with 15: 15.' }],
    hints: ['Keep the best and the second-best distance for every town.', 'A new distance equal to the best is not a second-best; only a strictly longer one is.', 'Put each improvement of d1 or d2 into the heap, and skip entries larger than d2 of their town.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      includes: ['<queue>', '<functional>', '<utility>'],
      python: J(WADJ.python, r`
        import heapq
        INF = 10 ** 18
        d1 = [INF] * (n + 1)
        d2 = [INF] * (n + 1)
        d1[1] = 0
        heap = [(0, 1)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > d2[u]:
                continue
            for v, w in adj[u]:
                nd = d + w
                if nd < d1[v]:
                    d2[v] = d1[v]
                    d1[v] = nd
                    heapq.heappush(heap, (nd, v))
                    if d2[v] < INF:
                        heapq.heappush(heap, (d2[v], v))
                elif d1[v] < nd < d2[v]:
                    d2[v] = nd
                    heapq.heappush(heap, (nd, v))
        print(d2[n] if d2[n] < INF else -1)`),
      cpp: J(WADJ.cpp, r`
        const long long INF = 1000000000000000000LL;
        vector<long long> d1(n + 1, INF), d2(n + 1, INF);
        d1[1] = 0;
        priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> heap;
        heap.push({0, 1});
        while (!heap.empty()) {
            pair<long long, int> top = heap.top();
            heap.pop();
            long long d = top.first;
            int u = top.second;
            if (d > d2[u]) continue;
            for (const auto& edge : adj[u]) {
                int v = edge.first;
                long long nd = d + edge.second;
                if (nd < d1[v]) {
                    d2[v] = d1[v];
                    d1[v] = nd;
                    heap.push({nd, v});
                    if (d2[v] < INF) heap.push({d2[v], v});
                } else if (d1[v] < nd && nd < d2[v]) {
                    d2[v] = nd;
                    heap.push({nd, v});
                }
            }
        }
        cout << (d2[n] < INF ? d2[n] : -1) << "\n";`),
      java: J(WADJ.java, r`
        long INF = 1000000000000000000L;
        long[] d1 = new long[nodes + 1];
        long[] d2 = new long[nodes + 1];
        Arrays.fill(d1, INF);
        Arrays.fill(d2, INF);
        d1[1] = 0;
        PriorityQueue<long[]> heap = new PriorityQueue<>((p, q) -> Long.compare(p[0], q[0]));
        heap.add(new long[] {0, 1});
        while (!heap.isEmpty()) {
            long[] top = heap.poll();
            long d = top[0];
            int u = (int) top[1];
            if (d > d2[u]) continue;
            for (long[] edge : adj.get(u)) {
                int v = (int) edge[0];
                long nd = d + edge[1];
                if (nd < d1[v]) {
                    d2[v] = d1[v];
                    d1[v] = nd;
                    heap.add(new long[] {nd, v});
                    if (d2[v] < INF) heap.add(new long[] {d2[v], v});
                } else if (d1[v] < nd && nd < d2[v]) {
                    d2[v] = nd;
                    heap.add(new long[] {nd, v});
                }
            }
        }
        System.out.println(d2[nodes] < INF ? d2[nodes] : -1);`)
    },
    solution: { explanation: ['Dijkstra\'s algorithm with two distances per town (the best and the best strictly longer one), pushing every improvement into the heap and skipping entries larger than the second distance of their town.'], complexity: 'Time O((n + m) log n), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges);
      // K shortest walks by Dijkstra over (distance, node) pairs, popping every pair at most twice per node: the two smallest distinct walk lengths
      const found = Array.from({ length: n + 1 }, () => []); const heap = new Heap((a, b) => a[0] < b[0]); heap.push([0, 1]);
      while (heap.size) { const [d, u] = heap.pop(); if (found[u].includes(d)) continue; if (found[u].length >= 2) continue; found[u].push(d); for (const [v, w] of adj[u]) if (found[v].length < 2) heap.push([d + w, v]); }
      return String(found[n].length === 2 ? found[n][1] : -1);
    },
    tests() {
      const g = rng(992); const out = ['3 3\n1 2 2\n2 3 3\n1 3 6\n', '2 1\n1 2 5\n', '3 1\n1 2 5\n', '3 2\n1 2 1\n2 3 1\n'];
      const brute = (input) => { const { n, edges } = parse(input); const LIMIT = 400; const reach = Array.from({ length: LIMIT + 1 }, () => new Array(n + 1).fill(false)); reach[0][1] = true; for (let L = 1; L <= LIMIT; L++) for (const [u, v, w] of edges) { if (L - w >= 0) { if (reach[L - w][u]) reach[L][v] = true; if (reach[L - w][v]) reach[L][u] = true; } } const lengths = []; for (let L = 0; L <= LIMIT; L++) if (reach[L][n]) lengths.push(L); return String(lengths.length >= 2 ? lengths[1] : -1); };
      crossCheck(() => { const n = randInt(g, 2, 7); return graphText(n, WE(g, n, randInt(g, 1, Math.min(10, n * (n - 1) / 2)), 9)); }, (i) => this.solve(i), brute, 300);
      for (const [n, m, hi] of [[8, 12, 20], [60, 150, 1000], [1000, 2500, 1000000], [20000, 30000, 1000000000], [20000, 20000, 1000000000], [20000, 25000, 5], [300, 30000, 1000], [20000, 12000, 1000]]) out.push(graphText(n, WE(g, n, m, hi)));
      out.push(graphText(20000, WC(g, 20000, 9000, 1000000000)), graphText(20000, many(19999, (i) => [i + 1, i + 2, 1000000000])), graphText(20000, many(19999, (i) => [i + 1, i + 2, 1])));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: WEDGE_INPUT,
    constraints: ['2 <= n <= 100', 'n - 1 <= m <= 300', '1 <= w <= 1000', 'The graph is connected.', 'There are no self-loops and no repeated edges.'],
    slug: 'critical-and-pseudo-critical-edges',
    title: 'Edges That Every Cheapest Network Needs, and Edges That It May Use',
    tags: ['graph', 'mst', 'kruskal', 'union-find'],
    concept: {
      title: 'Compare the minimum weight with the edge removed, and with the edge forced in',
      body: [
        'A graph can have several minimum spanning trees with the same total weight. For each edge there are three possibilities: it is in **every** MST (a *critical* edge), in **some but not all** MSTs (*pseudo-critical*), or in **no** MST. Which edges are of which kind?',
        'Let `W` be the weight of an MST. Test every edge `e` with two Kruskal runs:',
        '- **Remove `e`** and compute the MST weight of what is left (or infinity if the graph falls apart). If it is **larger than `W`**, then every MST needs `e`: it is **critical**.\n- Otherwise some MST avoids `e`. Now **force `e` in**: start Kruskal by taking `e`, then continue as usual. If the resulting weight **equals `W`**, some MST contains `e`, and since not all of them do, `e` is **pseudo-critical**. If the weight is larger than `W`, no MST contains `e`.',
        { code: 'def kruskal(skip, force):\n    parent = list(range(n + 1))\n    total, taken = 0, 0\n    if force >= 0:\n        union(edges[force]); total += weight; taken += 1\n    for i in order:                    # edges sorted by weight\n        if i != skip and i != force and union(edge i):\n            total += weight; taken += 1\n    return total if taken == n - 1 else INF\n\nbest = kruskal(-1, -1)\nfor i in range(m):\n    if kruskal(i, -1) > best:\n        critical.append(i)\n    elif kruskal(-1, i) == best:\n        pseudo.append(i)' },
        'Each run costs O(m alpha), and there are about `2m` runs, so the time is O(m^2 alpha): fine for 300 edges. The sorted order is computed once, and the parent array is reset for each run.'
      ]
    },
    statement: ['A connected undirected graph has `n` nodes and `m` weighted edges, numbered 1 to `m` in the order of the input. An edge is critical if it belongs to every minimum spanning tree, and pseudo-critical if it belongs to some but not all of them. Print two lines. The first line has the number of critical edges followed by their numbers in increasing order; the second line has the number of pseudo-critical edges followed by their numbers in increasing order.'],
    outputFormat: ['Two lines: `count numbers...` for the critical edges, then for the pseudo-critical edges.'],
    examples: [{ input: '5 7\n1 2 1\n2 3 1\n3 4 2\n1 4 2\n1 5 3\n4 5 3\n2 5 6\n', note: 'The edges 1 and 2 are in every minimum spanning tree. The edges 3, 4, 5 and 6 can be exchanged with each other: pseudo-critical. The edge 7 is in no minimum spanning tree.' }],
    hints: ['Compute the weight W of a minimum spanning tree with Kruskal.', 'If the MST without the edge is heavier than W, the edge is critical.', 'Otherwise, if the MST that is forced to contain the edge still weighs W, the edge is pseudo-critical.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      includes: ['<algorithm>', '<numeric>'],
      python: r`
        INF = 10 ** 18
        order = sorted(range(m), key=lambda i: edges[i][2])

        def kruskal(skip, force):
            parent = list(range(n + 1))

            def find(x):
                while parent[x] != x:
                    parent[x] = parent[parent[x]]
                    x = parent[x]
                return x

            total = 0
            taken = 0
            if force >= 0:
                u, v, w = edges[force]
                parent[find(u)] = find(v)
                total += w
                taken += 1
            for i in order:
                if i == skip or i == force:
                    continue
                u, v, w = edges[i]
                a, b = find(u), find(v)
                if a != b:
                    parent[a] = b
                    total += w
                    taken += 1
            return total if taken == n - 1 else INF

        best = kruskal(-1, -1)
        critical = []
        pseudo = []
        for i in range(m):
            if kruskal(i, -1) > best:
                critical.append(i + 1)
            elif kruskal(-1, i) == best:
                pseudo.append(i + 1)
        print(len(critical), *critical)
        print(len(pseudo), *pseudo)`,
      cpp: r`
        const long long INF = 1000000000000000000LL;
        vector<int> order(m);
        for (int i = 0; i < m; i++) order[i] = i;
        sort(order.begin(), order.end(), [&](int x, int y) { return edges[x][2] < edges[y][2]; });
        auto kruskal = [&](int skip, int force) {
            vector<int> parent(n + 1);
            for (int v = 0; v <= n; v++) parent[v] = v;
            auto find = [&](int x) {
                while (parent[x] != x) {
                    parent[x] = parent[parent[x]];
                    x = parent[x];
                }
                return x;
            };
            long long total = 0, taken = 0;
            if (force >= 0) {
                parent[find((int)edges[force][0])] = find((int)edges[force][1]);
                total += edges[force][2];
                taken++;
            }
            for (int i : order) {
                if (i == skip || i == force) continue;
                int a = find((int)edges[i][0]), b = find((int)edges[i][1]);
                if (a != b) {
                    parent[a] = b;
                    total += edges[i][2];
                    taken++;
                }
            }
            return taken == n - 1 ? total : INF;
        };
        long long best = kruskal(-1, -1);
        vector<int> critical, pseudo;
        for (int i = 0; i < m; i++) {
            if (kruskal(i, -1) > best) critical.push_back(i + 1);
            else if (kruskal(-1, i) == best) pseudo.push_back(i + 1);
        }
        cout << critical.size();
        for (int x : critical) cout << " " << x;
        cout << "\n" << pseudo.size();
        for (int x : pseudo) cout << " " << x;
        cout << "\n";`,
      java: r`
        int nodes = (int) n, count = (int) m;
        long INF = 1000000000000000000L;
        Integer[] order = new Integer[count];
        for (int i = 0; i < count; i++) order[i] = i;
        Arrays.sort(order, (x, y) -> Long.compare(edges[x][2], edges[y][2]));
        long best = kruskal(edges, order, nodes, -1, -1);
        List<Integer> critical = new ArrayList<>(), pseudo = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            if (kruskal(edges, order, nodes, i, -1) > best) critical.add(i + 1);
            else if (kruskal(edges, order, nodes, -1, i) == best) pseudo.add(i + 1);
        }
        StringBuilder out = new StringBuilder();
        out.append(critical.size());
        for (int x : critical) out.append(" ").append(x);
        out.append("\n").append(pseudo.size());
        for (int x : pseudo) out.append(" ").append(x);
        System.out.println(out);`,
      helpers: {
        python: '',
        cpp: '',
        java: r`
          static int find(int[] parent, int x) {
              while (parent[x] != x) {
                  parent[x] = parent[parent[x]];
                  x = parent[x];
              }
              return x;
          }

          static long kruskal(long[][] edges, Integer[] order, int n, int skip, int force) {
              long INF = 1000000000000000000L;
              int[] parent = new int[n + 1];
              for (int v = 0; v <= n; v++) parent[v] = v;
              long total = 0, taken = 0;
              if (force >= 0) {
                  parent[find(parent, (int) edges[force][0])] = find(parent, (int) edges[force][1]);
                  total += edges[force][2];
                  taken++;
              }
              for (int i : order) {
                  if (i == skip || i == force) continue;
                  int a = find(parent, (int) edges[i][0]), b = find(parent, (int) edges[i][1]);
                  if (a != b) {
                      parent[a] = b;
                      total += edges[i][2];
                      taken++;
                  }
              }
              return taken == n - 1 ? total : INF;
          }`
      }
    },
    solution: { explanation: ['Kruskal\'s algorithm is run for the whole graph, for the graph without each edge, and with each edge forced in. An edge whose removal raises the weight is critical; an edge whose forced inclusion keeps the minimum weight is pseudo-critical.'], complexity: 'Time O(m^2 alpha(n)), space O(n + m).' },
    solve(input) {
      const { n, m, edges } = parse(input);
      // all spanning trees found by trying subsets of n - 1 edges (small graphs) are too many for the big tests, so use the same two-run idea with a different union-find
      const order = edges.map((_, i) => i).sort((a, b) => edges[a][2] - edges[b][2]); const run = (skip, force) => { const d = new Dsu(n); let total = 0, taken = 0; if (force >= 0) { d.union(edges[force][0], edges[force][1]); total += edges[force][2]; taken++; } for (const i of order) { if (i === skip || i === force) continue; if (d.union(edges[i][0], edges[i][1])) { total += edges[i][2]; taken++; } } return taken === n - 1 ? total : Infinity; };
      const best = run(-1, -1); const critical = [], pseudo = []; for (let i = 0; i < m; i++) { if (run(i, -1) > best) critical.push(i + 1); else if (run(-1, i) === best) pseudo.push(i + 1); }
      return `${[critical.length, ...critical].join(' ')}\n${[pseudo.length, ...pseudo].join(' ')}`;
    },
    tests() {
      const g = rng(993); const out = ['5 7\n1 2 1\n2 3 1\n3 4 2\n1 4 2\n1 5 3\n4 5 3\n2 5 6\n', '2 1\n1 2 5\n', '3 3\n1 2 1\n2 3 1\n1 3 1\n'];
      const brute = (input) => { const { n, m, edges } = parse(input); let bestW = Infinity; const trees = []; const go = (idx, chosen) => { if (chosen.length === n - 1) { const d = new Dsu(n); let ok = true; let w = 0; for (const i of chosen) { if (!d.union(edges[i][0], edges[i][1])) { ok = false; break; } w += edges[i][2]; } if (ok) { trees.push([w, chosen.slice()]); bestW = Math.min(bestW, w); } return; } if (idx >= m || chosen.length + (m - idx) < n - 1) return; chosen.push(idx); go(idx + 1, chosen); chosen.pop(); go(idx + 1, chosen); }; go(0, []); const best = trees.filter(([w]) => w === bestW); const count = new Array(m).fill(0); for (const [, set] of best) for (const i of set) count[i]++; const critical = [], pseudo = []; for (let i = 0; i < m; i++) { if (count[i] === best.length) critical.push(i + 1); else if (count[i] > 0) pseudo.push(i + 1); } return `${[critical.length, ...critical].join(' ')}\n${[pseudo.length, ...pseudo].join(' ')}`; };
      const make = (n, extra, hi) => { const e = shuffle(g, connectedEdges(g, n, extra, [1, hi])); return `${n} ${e.length}\n${e.map((x) => x.join(' ')).join('\n')}\n`; };
      crossCheck(() => make(randInt(g, 2, 6), randInt(g, 0, 4), 3), (i) => this.solve(i), brute, 300);
      for (const [n, extra, hi] of [[6, 4, 3], [10, 8, 4], [20, 30, 5], [30, 60, 3], [50, 100, 10], [100, 200, 1000], [100, 201, 5], [100, 0, 1000], [100, 150, 2], [100, 200, 1]]) out.push(make(n, extra, hi));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: WEDGE_INPUT,
    constraints: ['2 <= n <= 5000', 'n - 1 <= m <= 10000', '1 <= w <= 10^9', 'The graph is connected.', 'There are no self-loops and no repeated edges.'],
    slug: 'second-best-spanning-tree',
    title: 'The Second-Cheapest Spanning Tree',
    tags: ['graph', 'mst', 'binary-lifting', 'lca'],
    concept: {
      title: 'The second-best tree differs from the best by one swap: add an outside edge, remove the heaviest edge on the cycle it makes',
      body: [
        'List the total weights of **all** different spanning trees of the graph from the smallest to the largest (trees with equal weights are listed separately). The first is the minimum spanning tree. What is the second? It turns out that it can always be reached from an MST `T` by a **single swap**: add one edge `e = (u, v)` that is not in `T`, which creates exactly one cycle (the edge plus the tree path between `u` and `v`), and remove an edge of that cycle, best the **heaviest** edge `f` of the tree path. The new weight is `W + w(e) - w(f)`. Try every edge outside the tree and take the smallest result.',
        'To do this fast we need, for the tree path between any two nodes, its **heaviest edge**. This is a query for binary lifting with maxima. Root the MST at node 1. Let `up[j][v]` be the `2^j`-th ancestor of `v` and `mx[j][v]` the heaviest edge on the road from `v` up to that ancestor. To get the heaviest edge on the path `u - v`, lift the deeper node to the depth of the other (taking maxima), and then lift both together while their ancestors differ, taking maxima again; at the end add the two edges to the common parent.',
        { code: 'def path_max(u, v):\n    best = 0\n    if depth[u] < depth[v]:\n        u, v = v, u\n    diff = depth[u] - depth[v]\n    for j in range(LOG):\n        if diff >> j & 1:\n            best = max(best, mx[j][u])\n            u = up[j][u]\n    if u == v:\n        return best\n    for j in reversed(range(LOG)):\n        if up[j][u] != up[j][v]:\n            best = max(best, mx[j][u], mx[j][v])\n            u, v = up[j][u], up[j][v]\n    return max(best, mx[0][u], mx[0][v])' },
        'If every edge of the graph is in the tree (`m = n - 1`) there is only one spanning tree: print -1. Otherwise the answer is `W + min over the outside edges of (w(e) - path_max(u, v))`; the difference is never negative, so the second-best weight can be equal to `W` when the graph has several MSTs. The time is O(m log m + (n + m) log n).'
      ]
    },
    statement: ['Consider all different spanning trees (sets of `n - 1` edges that connect all nodes without a cycle) of a connected weighted graph, and list their total weights in non-decreasing order, once for every tree (equal weights repeat). Print the second number of this list, or -1 if the graph has only one spanning tree.'],
    outputFormat: ['Print the weight or -1.'],
    examples: [{ input: '4 5\n1 2 1\n2 3 2\n3 4 3\n1 4 4\n1 3 5\n', note: 'The minimum spanning tree has the weight 1 + 2 + 3 = 6. Exchanging the edge of weight 3 for the edge 1-4 (weight 4) gives 7, which is the next one: 7.' }],
    hints: ['Find an MST with Kruskal and root it.', 'For each edge outside the tree, the best swap removes the heaviest edge on the tree path between its ends.', 'Use binary lifting with maxima to get that heaviest edge; the answer is W plus the smallest (w(e) minus that maximum).'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      helpers: DSU,
      python: r`
        parent.extend(range(n + 1))
        size.extend([1] * (n + 1))
        order = sorted(range(m), key=lambda i: edges[i][2])
        in_tree = [False] * m
        total = 0
        tree = [[] for _ in range(n + 1)]
        for i in order:
            u, v, w = edges[i]
            if union(u, v):
                in_tree[i] = True
                total += w
                tree[u].append((v, w))
                tree[v].append((u, w))
        if m == n - 1:
            print(-1)
        else:
            LOG = 13
            depth = [0] * (n + 1)
            up = [[0] * (n + 1) for _ in range(LOG)]
            mx = [[0] * (n + 1) for _ in range(LOG)]
            seen = [False] * (n + 1)
            seen[1] = True
            queue = [1]
            for u in queue:
                for v, w in tree[u]:
                    if not seen[v]:
                        seen[v] = True
                        depth[v] = depth[u] + 1
                        up[0][v] = u
                        mx[0][v] = w
                        queue.append(v)
            for j in range(1, LOG):
                for v in range(1, n + 1):
                    mid = up[j - 1][v]
                    up[j][v] = up[j - 1][mid]
                    mx[j][v] = max(mx[j - 1][v], mx[j - 1][mid])

            def path_max(u, v):
                best = 0
                if depth[u] < depth[v]:
                    u, v = v, u
                diff = depth[u] - depth[v]
                for j in range(LOG):
                    if diff >> j & 1:
                        best = max(best, mx[j][u])
                        u = up[j][u]
                if u == v:
                    return best
                for j in range(LOG - 1, -1, -1):
                    if up[j][u] != up[j][v]:
                        best = max(best, mx[j][u], mx[j][v])
                        u = up[j][u]
                        v = up[j][v]
                return max(best, mx[0][u], mx[0][v])

            extra = 10 ** 18
            for i in range(m):
                if not in_tree[i]:
                    u, v, w = edges[i]
                    extra = min(extra, w - path_max(u, v))
            print(total + extra)`,
      cpp: r`
        parent.resize(n + 1);
        sizes.assign(n + 1, 1);
        for (int v = 0; v <= n; v++) parent[v] = v;
        vector<int> order(m);
        for (int i = 0; i < m; i++) order[i] = i;
        sort(order.begin(), order.end(), [&](int x, int y) { return edges[x][2] < edges[y][2]; });
        vector<char> inTree(m, 0);
        long long total = 0;
        vector<vector<pair<int, long long>>> tree(n + 1);
        for (int i : order) {
            if (unite((int)edges[i][0], (int)edges[i][1])) {
                inTree[i] = 1;
                total += edges[i][2];
                tree[edges[i][0]].push_back({(int)edges[i][1], edges[i][2]});
                tree[edges[i][1]].push_back({(int)edges[i][0], edges[i][2]});
            }
        }
        if (m == n - 1) {
            cout << -1 << "\n";
        } else {
            const int LOG = 13;
            vector<int> depth(n + 1, 0);
            vector<vector<int>> up(LOG, vector<int>(n + 1, 0));
            vector<vector<long long>> mx(LOG, vector<long long>(n + 1, 0));
            vector<char> seen(n + 1, 0);
            seen[1] = 1;
            vector<int> queue = {1};
            for (size_t i = 0; i < queue.size(); i++) {
                int u = queue[i];
                for (const auto& edge : tree[u]) {
                    int v = edge.first;
                    if (!seen[v]) {
                        seen[v] = 1;
                        depth[v] = depth[u] + 1;
                        up[0][v] = u;
                        mx[0][v] = edge.second;
                        queue.push_back(v);
                    }
                }
            }
            for (int j = 1; j < LOG; j++) {
                for (int v = 1; v <= n; v++) {
                    int mid = up[j - 1][v];
                    up[j][v] = up[j - 1][mid];
                    mx[j][v] = max(mx[j - 1][v], mx[j - 1][mid]);
                }
            }
            auto pathMax = [&](int u, int v) {
                long long best = 0;
                if (depth[u] < depth[v]) swap(u, v);
                int diff = depth[u] - depth[v];
                for (int j = 0; j < LOG; j++) {
                    if ((diff >> j) & 1) {
                        best = max(best, mx[j][u]);
                        u = up[j][u];
                    }
                }
                if (u == v) return best;
                for (int j = LOG - 1; j >= 0; j--) {
                    if (up[j][u] != up[j][v]) {
                        best = max(best, max(mx[j][u], mx[j][v]));
                        u = up[j][u];
                        v = up[j][v];
                    }
                }
                return max(best, max(mx[0][u], mx[0][v]));
            };
            long long extra = 1000000000000000000LL;
            for (int i = 0; i < m; i++) {
                if (!inTree[i]) extra = min(extra, edges[i][2] - pathMax((int)edges[i][0], (int)edges[i][1]));
            }
            cout << total + extra << "\n";
        }`,
      java: r`
        int nodes = (int) n, count = (int) m;
        parent = new int[nodes + 1];
        sizes = new int[nodes + 1];
        for (int v = 0; v <= nodes; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        Integer[] order = new Integer[count];
        for (int i = 0; i < count; i++) order[i] = i;
        Arrays.sort(order, (x, y) -> Long.compare(edges[x][2], edges[y][2]));
        boolean[] inTree = new boolean[count];
        long total = 0;
        List<List<long[]>> tree = new ArrayList<>();
        for (int v = 0; v <= nodes; v++) tree.add(new ArrayList<>());
        for (int i : order) {
            if (unite((int) edges[i][0], (int) edges[i][1])) {
                inTree[i] = true;
                total += edges[i][2];
                tree.get((int) edges[i][0]).add(new long[] {edges[i][1], edges[i][2]});
                tree.get((int) edges[i][1]).add(new long[] {edges[i][0], edges[i][2]});
            }
        }
        if (count == nodes - 1) {
            System.out.println(-1);
        } else {
            int LOG = 13;
            int[] depth = new int[nodes + 1];
            int[][] up = new int[LOG][nodes + 1];
            long[][] mx = new long[LOG][nodes + 1];
            boolean[] seen = new boolean[nodes + 1];
            seen[1] = true;
            List<Integer> queue = new ArrayList<>();
            queue.add(1);
            for (int i = 0; i < queue.size(); i++) {
                int u = queue.get(i);
                for (long[] edge : tree.get(u)) {
                    int v = (int) edge[0];
                    if (!seen[v]) {
                        seen[v] = true;
                        depth[v] = depth[u] + 1;
                        up[0][v] = u;
                        mx[0][v] = edge[1];
                        queue.add(v);
                    }
                }
            }
            for (int j = 1; j < LOG; j++) {
                for (int v = 1; v <= nodes; v++) {
                    int mid = up[j - 1][v];
                    up[j][v] = up[j - 1][mid];
                    mx[j][v] = Math.max(mx[j - 1][v], mx[j - 1][mid]);
                }
            }
            long extra = 1000000000000000000L;
            for (int i = 0; i < count; i++) {
                if (inTree[i]) continue;
                int u = (int) edges[i][0], v = (int) edges[i][1];
                long best = 0;
                if (depth[u] < depth[v]) {
                    int t = u;
                    u = v;
                    v = t;
                }
                int diff = depth[u] - depth[v];
                for (int j = 0; j < LOG; j++) {
                    if (((diff >> j) & 1) != 0) {
                        best = Math.max(best, mx[j][u]);
                        u = up[j][u];
                    }
                }
                if (u != v) {
                    for (int j = LOG - 1; j >= 0; j--) {
                        if (up[j][u] != up[j][v]) {
                            best = Math.max(best, Math.max(mx[j][u], mx[j][v]));
                            u = up[j][u];
                            v = up[j][v];
                        }
                    }
                    best = Math.max(best, Math.max(mx[0][u], mx[0][v]));
                }
                extra = Math.min(extra, edges[i][2] - best);
            }
            System.out.println(total + extra);
        }`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['An MST is built with Kruskal and rooted; binary lifting with maxima gives the heaviest edge on the tree path between the ends of every outside edge. The second-best weight is the MST weight plus the smallest value of (edge weight - heaviest path edge), or -1 if the graph is a tree.'], complexity: 'Time O(m log m + (n + m) log n), space O(n log n).' },
    solve(input) {
      const { n, m, edges } = parse(input); if (m === n - 1) return '-1';
      // the smallest swap found by walking the tree path of every outside edge (slow but simple); fine for the sizes of the tests thanks to a depth array
      const order = edges.map((_, i) => i).sort((a, b) => edges[a][2] - edges[b][2]); const d = new Dsu(n); const inTree = new Array(m).fill(false); const tree = Array.from({ length: n + 1 }, () => []); let total = 0;
      for (const i of order) { const [u, v, w] = edges[i]; if (d.union(u, v)) { inTree[i] = true; total += w; tree[u].push([v, w]); tree[v].push([u, w]); } }
      const par = new Array(n + 1).fill(0), pw = new Array(n + 1).fill(0), depth = new Array(n + 1).fill(0); const q = [1]; const seen = new Array(n + 1).fill(false); seen[1] = true; for (let h = 0; h < q.length; h++) for (const [v, w] of tree[q[h]]) if (!seen[v]) { seen[v] = true; par[v] = q[h]; pw[v] = w; depth[v] = depth[q[h]] + 1; q.push(v); }
      let extra = Infinity; for (let i = 0; i < m; i++) { if (inTree[i]) continue; let [u, v, w] = edges[i]; let best = 0; while (u !== v) { if (depth[u] >= depth[v]) { best = Math.max(best, pw[u]); u = par[u]; } else { best = Math.max(best, pw[v]); v = par[v]; } } extra = Math.min(extra, w - best); }
      return String(total + extra);
    },
    tests() {
      const g = rng(994); const out = ['4 5\n1 2 1\n2 3 2\n3 4 3\n1 4 4\n1 3 5\n', '2 1\n1 2 5\n', '3 3\n1 2 1\n2 3 1\n1 3 1\n'];
      const brute = (input) => { const { n, m, edges } = parse(input); if (m === n - 1) return '-1'; const weights = []; const go = (idx, chosen) => { if (chosen.length === n - 1) { const d = new Dsu(n); let w = 0; for (const i of chosen) { if (!d.union(edges[i][0], edges[i][1])) return; w += edges[i][2]; } weights.push(w); return; } if (idx >= m || chosen.length + (m - idx) < n - 1) return; chosen.push(idx); go(idx + 1, chosen); chosen.pop(); go(idx + 1, chosen); }; go(0, []); weights.sort((a, b) => a - b); return String(weights[1]); };
      const make = (n, extra, hi) => { const e = shuffle(g, connectedEdges(g, n, extra, [1, hi])); return `${n} ${e.length}\n${e.map((x) => x.join(' ')).join('\n')}\n`; };
      crossCheck(() => make(randInt(g, 2, 6), randInt(g, 0, 4), 4), (i) => this.solve(i), brute, 300);
      for (const [n, extra, hi] of [[8, 5, 20], [60, 100, 1000], [500, 800, 1000000], [3000, 5000, 1000000000], [5000, 5001, 1000000000], [5000, 5001, 3], [5000, 100, 1000000000], [5000, 1, 1000000000]]) out.push(make(n, extra, hi));
      out.push(`5000 5000\n${[...many(4999, (i) => `${i + 1} ${i + 2} 1`), '1 5000 1000000000'].join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `h`, `w` and `q`: the size of the grid and the number of operations.', 'Each of the next `q` lines has two numbers `r` and `c`: a cell (row and column, counted from 1) that becomes land. The grid is water at the start.'],
    constraints: ['1 <= h, w <= 200', '1 <= q <= 20000', 'A cell can be turned into land more than once; the second time changes nothing.'],
    slug: 'islands-added-one-by-one',
    title: 'Count the Islands As Land Appears',
    tags: ['graph', 'grid', 'union-find', 'online'],
    concept: {
      title: 'Each new land cell either starts an island or merges the neighbouring islands: count with union-find',
      body: [
        'A map starts as all water. Land cells appear one at a time. After each new land cell, how many islands (groups of side-connected land cells) are there? Recounting the islands with a flood fill after each operation costs O(h * w) per operation, up to 40000 * 20000 steps in total. A **union-find over the cells** handles each operation in almost constant time.',
        'Keep a counter of islands. When a cell `p` becomes land (if it was not land already), a **new island** appears: the counter goes up by one. Then look at the four neighbours of `p`; for each neighbour that is land, `union(p, neighbour)`. If the union merged two different islands (it returned true), the number of islands goes **down** by one. The counter after the operation is the answer for it. Operations on cells that are already land change nothing.',
        { code: 'land = [False] * (h * w)\ncount = 0\nfor r, c in operations:\n    p = (r - 1) * w + (c - 1)\n    if not land[p]:\n        land[p] = True\n        count += 1                              # a new island\n        for a, b in neighbours(r - 1, c - 1):\n            if inside(a, b) and land[a * w + b]:\n                if union(p, a * w + b):\n                    count -= 1                  # two islands became one\n    answers.append(count)' },
        'This is a good example of an *online* structure: islands can only merge, never split, as land is added, which is exactly what union-find supports. The time is O(q * alpha).'
      ]
    },
    statement: ['A grid of `h` rows and `w` columns is all water at first. Then `q` operations turn a cell into land, one after another (a cell that is already land stays land). After every operation print the number of islands, where an island is a group of land cells connected through their sides.'],
    outputFormat: ['One line with `q` numbers.'],
    examples: [{ input: '3 3 4\n1 1\n1 2\n2 3\n3 2\n', note: 'After 1: one island; after 2: the cells (1,1) and (1,2) are joined, still one; after 3: the cell (2,3) is alone, two islands; after 4: three islands: 1 1 2 3.' }],
    hints: ['Number the cells and use union-find over them.', 'A new land cell adds one island and then merges with each land neighbour (each real merge removes one).', 'If the cell is already land, just print the same count again.'],
    program: {
      io: ['h:int w:int q:int', 'ops:int[q][2]'],
      fast: true,
      helpers: DSU,
      python: r`
        parent.extend(range(h * w))
        size.extend([1] * (h * w))
        land = [False] * (h * w)
        count = 0
        out = []
        for r, c in ops:
            p = (r - 1) * w + (c - 1)
            if not land[p]:
                land[p] = True
                count += 1
                for a, b in ((r, c - 1), (r - 2, c - 1), (r - 1, c), (r - 1, c - 2)):
                    if 0 <= a < h and 0 <= b < w and land[a * w + b]:
                        if union(p, a * w + b):
                            count -= 1
            out.append(count)
        print(*out)`,
      cpp: r`
        int cells = (int)(h * w);
        parent.resize(cells);
        sizes.assign(cells, 1);
        for (int v = 0; v < cells; v++) parent[v] = v;
        vector<char> land(cells, 0);
        long long count = 0;
        int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
        for (size_t i = 0; i < ops.size(); i++) {
            int r = (int)ops[i][0] - 1, c = (int)ops[i][1] - 1;
            int p = r * (int)w + c;
            if (!land[p]) {
                land[p] = 1;
                count++;
                for (int d = 0; d < 4; d++) {
                    int a = r + dr[d], b = c + dc[d];
                    if (a >= 0 && a < h && b >= 0 && b < w && land[a * (int)w + b]) {
                        if (unite(p, a * (int)w + b)) count--;
                    }
                }
            }
            cout << (i ? " " : "") << count;
        }
        cout << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        int cells = rowsCount * colsCount;
        parent = new int[cells];
        sizes = new int[cells];
        for (int v = 0; v < cells; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        boolean[] land = new boolean[cells];
        long count = 0;
        int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < ops.length; i++) {
            int r = (int) ops[i][0] - 1, c = (int) ops[i][1] - 1;
            int p = r * colsCount + c;
            if (!land[p]) {
                land[p] = true;
                count++;
                for (int d = 0; d < 4; d++) {
                    int a = r + dr[d], b = c + dc[d];
                    if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount && land[a * colsCount + b]) {
                        if (unite(p, a * colsCount + b)) count--;
                    }
                }
            }
            out.append(i > 0 ? " " : "").append(count);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['Union-find over the cells: a new land cell adds one island and every successful union with a land neighbour removes one; the counter is printed after each operation.'], complexity: 'Time O(q * alpha(h * w)), space O(h * w).' },
    solve(input) {
      const rs = rows(input); const [h, w, q] = nums(rs[0]); const land = Array.from({ length: h }, () => new Array(w).fill(false)); const out = [];
      const count = () => { const seen = land.map((row) => row.map(() => false)); let c = 0; for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) { if (!land[x][y] || seen[x][y]) continue; c++; seen[x][y] = true; const st = [[x, y]]; while (st.length) { const [p, qq] = st.pop(); for (const [dx, dy] of DIRS) { const a = p + dx, b = qq + dy; if (inside(h, w, a, b) && land[a][b] && !seen[a][b]) { seen[a][b] = true; st.push([a, b]); } } } } return c; };
      // a full recount after every operation is too slow for the big grids, so use the counter method with a union-find written for the reference
      if (h * w <= 400) { for (let i = 0; i < q; i++) { const [r0, c0] = nums(rs[1 + i]); land[r0 - 1][c0 - 1] = true; out.push(count()); } return out.join(' '); }
      const d = new Dsu(h * w); const isLand = new Array(h * w).fill(false); let c = 0;
      for (let i = 0; i < q; i++) { const [r0, c0] = nums(rs[1 + i]); const p = (r0 - 1) * w + (c0 - 1); if (!isLand[p]) { isLand[p] = true; c++; for (const [dx, dy] of DIRS) { const a = r0 - 1 + dx, b = c0 - 1 + dy; if (inside(h, w, a, b) && isLand[a * w + b] && d.union(p, a * w + b)) c--; } } out.push(c); }
      return out.join(' ');
    },
    tests() {
      const g = rng(995); const out = ['3 3 4\n1 1\n1 2\n2 3\n3 2\n', '1 1 2\n1 1\n1 1\n', '2 2 4\n1 1\n2 2\n1 2\n2 1\n'];
      const make = (h, w, q) => `${h} ${w} ${q}\n${many(q, () => `${randInt(g, 1, h)} ${randInt(g, 1, w)}`).join('\n')}\n`;
      const order = (h, w) => { const cells = shuffle(g, many(h * w, (i) => `${Math.floor(i / w) + 1} ${i % w + 1}`)); return `${h} ${w} ${cells.length}\n${cells.join('\n')}\n`; };
      for (const [h, w, q] of [[3, 4, 10], [8, 8, 40], [20, 20, 400], [50, 60, 3000], [200, 200, 20000], [200, 200, 20000], [1, 200, 300], [200, 1, 300], [100, 100, 20000]]) out.push(make(h, w, q));
      out.push(order(20, 20), order(100, 200),`200 200 20000\n${many(20000, (i) => `${Math.floor(i / 200) + 1} ${i % 200 + 1}`).join('\n')}\n`, `200 200 20000\n${many(20000, (i) => `${Math.floor(i / 100) * 2 % 200 + 1} ${(i % 100) * 2 + 1}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines is a string of `n` characters: `/` and `' + BS + '` are the two diagonals that cut a square, and `.` is an uncut square.'],
    constraints: ['1 <= n <= 100', 'Every character is `/`, `' + BS + '` or `.`.'],
    slug: 'regions-cut-by-slashes',
    title: 'How Many Regions Do the Slashes Make?',
    tags: ['graph', 'grid', 'union-find', 'geometry'],
    concept: {
      title: 'Cut every square into four triangles, merge the triangles that touch, and count the groups',
      body: [
        'An `n x n` board is made of squares; some squares have a diagonal line from corner to corner (`/` or `\\`), the others are empty (`.`). The lines cut the board into regions. How many regions are there? The regions are not made of whole squares, so a grid search over squares does not work.',
        'Split each square into **four triangles** by drawing both of its diagonals: the triangles are called top, right, bottom and left. Number them `4 * (cell) + k`. Now the regions are exactly the groups of triangles that are joined, and a union-find can build the groups:',
        '- inside a square with `.` all four triangles are joined; with `/` the top is joined to the left and the bottom to the right; with `\\` the top is joined to the right and the bottom to the left;\n- between squares the triangles touching across the common side are joined: the bottom triangle of a square with the top triangle of the square below it, and the right triangle with the left triangle of the square to the right.',
        { code: 'for each cell (i, j), id = 4 * (i * n + j):          # top = id, right = id + 1, bottom = id + 2, left = id + 3\n    if ch == ".":   union all four\n    if ch == "/":   union(top, left), union(bottom, right)\n    if ch == "\\\\":  union(top, right), union(bottom, left)\n    if i + 1 < n:   union(bottom of (i, j), top of (i + 1, j))\n    if j + 1 < n:   union(right of (i, j), left of (i, j + 1))\nregions = number of groups of the 4 * n * n triangles' },
        'Counting the groups is easy: start with `4 * n * n` and subtract one for every union that really merged two groups. There are at most 40000 triangles, so the time is O(n^2 alpha).'
      ]
    },
    statement: ['An `n x n` board has squares that are cut by a diagonal line `/` or `' + BS + '`, or uncut (`.`). The lines are drawn from corner to corner of their squares. Print the number of regions into which the lines divide the board (two points are in the same region if one can walk from one to the other without crossing a line).'],
    outputFormat: ['Print the number of regions.'],
    examples: [{ input: `2\n./\n/.\n`, note: 'The two slashes cut off the top right corner and the bottom left corner from the middle: 2.' }, { input: `2\n${BS}/\n/${BS}\n`, note: 'The four diagonals form a small diamond in the middle and four corners around it: 4.' }],
    hints: ['Cut each square into four triangles (top, right, bottom, left).', 'Use union-find: join the triangles inside a square according to its character, and join the triangles that touch across a side between two squares.', 'The number of regions is the number of groups of triangles.'],
    program: {
      io: ['n:int', 'board:rows[n]'],
      fast: true,
      helpers: DSU,
      python: r`
        total = 4 * n * n
        parent.extend(range(total))
        size.extend([1] * total)
        groups = total

        def join(a, b):
            global groups
            if union(a, b):
                groups -= 1

        for i in range(n):
            for j in range(n):
                base = 4 * (i * n + j)
                ch = board[i][j]
                if ch == ".":
                    join(base, base + 1)
                    join(base + 1, base + 2)
                    join(base + 2, base + 3)
                elif ch == "/":
                    join(base, base + 3)
                    join(base + 2, base + 1)
                else:
                    join(base, base + 1)
                    join(base + 2, base + 3)
                if i + 1 < n:
                    join(base + 2, 4 * ((i + 1) * n + j))
                if j + 1 < n:
                    join(base + 1, 4 * (i * n + j + 1) + 3)
        print(groups)`,
      cpp: r`
        int cells = (int)n;
        int total = 4 * cells * cells;
        parent.resize(total);
        sizes.assign(total, 1);
        for (int v = 0; v < total; v++) parent[v] = v;
        int groups = total;
        auto join = [&](int a, int b) {
            if (unite(a, b)) groups--;
        };
        for (int i = 0; i < cells; i++) {
            for (int j = 0; j < cells; j++) {
                int base = 4 * (i * cells + j);
                char ch = board[i][j];
                if (ch == '.') {
                    join(base, base + 1);
                    join(base + 1, base + 2);
                    join(base + 2, base + 3);
                } else if (ch == '/') {
                    join(base, base + 3);
                    join(base + 2, base + 1);
                } else {
                    join(base, base + 1);
                    join(base + 2, base + 3);
                }
                if (i + 1 < cells) join(base + 2, 4 * ((i + 1) * cells + j));
                if (j + 1 < cells) join(base + 1, 4 * (i * cells + j + 1) + 3);
            }
        }
        cout << groups << "\n";`,
      java: r`
        int cells = (int) n;
        int total = 4 * cells * cells;
        parent = new int[total];
        sizes = new int[total];
        for (int v = 0; v < total; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        int groups = total;
        for (int i = 0; i < cells; i++) {
            for (int j = 0; j < cells; j++) {
                int base = 4 * (i * cells + j);
                char ch = board[i].charAt(j);
                int[][] pairs;
                if (ch == '.') pairs = new int[][] {{base, base + 1}, {base + 1, base + 2}, {base + 2, base + 3}};
                else if (ch == '/') pairs = new int[][] {{base, base + 3}, {base + 2, base + 1}};
                else pairs = new int[][] {{base, base + 1}, {base + 2, base + 3}};
                for (int[] pair : pairs) {
                    if (unite(pair[0], pair[1])) groups--;
                }
                if (i + 1 < cells && unite(base + 2, 4 * ((i + 1) * cells + j))) groups--;
                if (j + 1 < cells && unite(base + 1, 4 * (i * cells + j + 1) + 3)) groups--;
            }
        }
        System.out.println(groups);`
    },
    solution: { explanation: ['Every square is split into four triangles, which are merged with union-find according to the character of the square and across the sides between neighbouring squares; the number of groups is the number of regions.'], complexity: 'Time O(n^2 alpha(n)), space O(n^2).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const board = rs.slice(1, 1 + n);
      // draw the board on a grid three times as fine and count the connected pieces that are not on a line
      const N = 3 * n; const pix = Array.from({ length: N }, () => new Array(N).fill(false));
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const ch = board[i][j]; for (let k = 0; k < 3; k++) { if (ch === '/') pix[3 * i + k][3 * j + 2 - k] = true; else if (ch === BS) pix[3 * i + k][3 * j + k] = true; } }
      let regions = 0; const seen = pix.map((row) => row.map((v) => v)); for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) { if (seen[x][y]) continue; regions++; seen[x][y] = true; const st = [[x, y]]; while (st.length) { const [p, q] = st.pop(); for (const [dx, dy] of DIRS) { const a = p + dx, b = q + dy; if (inside(N, N, a, b) && !seen[a][b]) { seen[a][b] = true; st.push([a, b]); } } } }
      return String(regions);
    },
    tests() {
      const g = rng(996); const out = [`2\n./\n/.\n`, `2\n${BS}/\n/${BS}\n`, '1\n.\n', `1\n/\n`, `1\n${BS}\n`];
      const make = (n, p) => { const pick = () => { const x = g(); return x < p ? '/' : x < 2 * p ? BS : '.'; }; return `${n}\n${many(n, () => many(n, pick).join('')).join('\n')}\n`; };
      // the triangle method with a union-find (the idea of the solutions) against the pixel method of solve()
      const triangles = (input) => { const rs = rows(input); const n = Number(rs[0]); const d = new Dsu(4 * n * n); let groups = 4 * n * n; const join = (a, b) => { if (d.union(a, b)) groups--; }; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const base = 4 * (i * n + j); const ch = rs[1 + i][j]; if (ch === '.') { join(base, base + 1); join(base + 1, base + 2); join(base + 2, base + 3); } else if (ch === '/') { join(base, base + 3); join(base + 2, base + 1); } else { join(base, base + 1); join(base + 2, base + 3); } if (i + 1 < n) join(base + 2, 4 * ((i + 1) * n + j)); if (j + 1 < n) join(base + 1, 4 * (i * n + j + 1) + 3); } return String(groups); };
      crossCheck(() => make(randInt(g, 1, 8), 0.3), (i) => this.solve(i), triangles, 300);
      for (const [n, p] of [[3, 0.3], [6, 0.4], [10, 0.3], [30, 0.25], [100, 0.4], [100, 0.1], [100, 0.5], [100, 0.02]]) { out.push(make(n, p)); out.push(make(n, p)); }
      out.push(`100\n${many(100, () => '.'.repeat(100)).join('\n')}\n`, `100\n${many(100, (i) => (i % 2 ? '/'.repeat(100) : BS.repeat(100))).join('\n')}\n`, `100\n${many(100, () => '/'.repeat(100)).join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `m`: the number of nodes and the number of edges (`m = n - 1`).', 'The second line has `n` numbers: the value of every node.', 'Each of the next `m` lines has two numbers `u` and `v`: an edge of the tree.'],
    constraints: ['2 <= n <= 20000', 'm = n - 1, and the edges form a tree', '0 <= every value <= 10^9'],
    slug: 'good-paths-in-a-tree',
    title: 'Paths Where Both Ends Are the Highest',
    tags: ['graph', 'tree', 'union-find', 'sorting', 'counting'],
    concept: {
      title: 'Add the nodes from the lowest value up; at a value, nodes that sit in the same group are connected through lower or equal nodes',
      body: [
        'Every node of a tree has a value. A path is *good* if its two end nodes have the **same value** and **no node on the path has a larger value** than that. A path of a single node is good. Count the good paths (a path is the same as its reverse; count it once).',
        'Process the nodes in **increasing order of value**, group by group (all nodes with the same value together). Maintain a union-find of the nodes processed so far that are connected by edges whose both ends have been processed. For a value `x`: first **connect** every node of value `x` with each neighbour whose value is at most `x`. Now two nodes of value `x` are in the same union-find group exactly when the path between them uses only nodes of value at most `x` (no higher node): that path is good. So if `c` nodes of value `x` fall into one group, they make `c * (c - 1) / 2` good paths between them. Add the `n` single-node paths separately.',
        { code: 'order = sorted(range(1, n + 1), key=lambda v: value[v - 1])\ntotal = n                                          # the paths of one node\ni = 0\nwhile i < n:\n    j = i\n    x = value[order[i] - 1]\n    while j < n and value[order[j] - 1] == x:\n        j += 1\n    group = order[i:j]                              # the nodes with the value x\n    for v in group:\n        for w in adj[v]:\n            if value[w - 1] <= x:\n                union(v, w)\n    count = {}\n    for v in group:\n        root = find(v)\n        count[root] = count.get(root, 0) + 1\n    total += sum(c * (c - 1) // 2 for c in count.values())\n    i = j' },
        'The answer can be large (if all values are equal on a path of 20000 nodes, about 2 * 10^8 pairs), so use 64-bit integers. The time is O(n log n).'
      ]
    },
    statement: ['A tree with `n` nodes has a value at every node. A path in the tree is good if its two ends have the same value and no node on the path has a larger value than that. A path of a single node is good. Count the good paths; a path and its reverse are the same path.'],
    outputFormat: ['Print the number of good paths.'],
    examples: [{ input: '5 4\n1 3 2 1 3\n1 2\n1 3\n3 4\n3 5\n', note: 'There are 5 paths of one node, and the path 2-1-3-5 joins the two nodes with the value 3 through nodes of lower value: 6.' }],
    hints: ['Process the nodes in increasing order of value, handling all nodes of the same value together.', 'First join each node of the current value with the neighbours of lower or equal value, using union-find.', 'Count the nodes of the current value in every group: c nodes make c * (c - 1) / 2 good paths. Add n for the single nodes.'],
    program: {
      io: ['n:int m:int', 'value:int[n]', 'edges:int[m][2]'],
      fast: true,
      includes: ['<algorithm>', '<map>'],
      helpers: DSU,
      python: J(ADJ.python, r`
        parent.extend(range(n + 1))
        size.extend([1] * (n + 1))
        order = sorted(range(1, n + 1), key=lambda v: value[v - 1])
        total = n
        i = 0
        while i < n:
            j = i
            x = value[order[i] - 1]
            while j < n and value[order[j] - 1] == x:
                j += 1
            group = order[i:j]
            for v in group:
                for w in adj[v]:
                    if value[w - 1] <= x:
                        union(v, w)
            count = {}
            for v in group:
                root = find(v)
                count[root] = count.get(root, 0) + 1
            total += sum(c * (c - 1) // 2 for c in count.values())
            i = j
        print(total)`),
      cpp: J(ADJ.cpp, r`
        parent.resize(n + 1);
        sizes.assign(n + 1, 1);
        for (int v = 0; v <= n; v++) parent[v] = v;
        vector<int> order(n);
        for (int i = 0; i < n; i++) order[i] = i + 1;
        sort(order.begin(), order.end(), [&](int a, int b) { return value[a - 1] < value[b - 1]; });
        long long total = n;
        int i = 0;
        while (i < n) {
            int j = i;
            long long x = value[order[i] - 1];
            while (j < n && value[order[j] - 1] == x) j++;
            for (int k = i; k < j; k++) {
                int v = order[k];
                for (int w : adj[v]) {
                    if (value[w - 1] <= x) unite(v, w);
                }
            }
            map<int, long long> count;
            for (int k = i; k < j; k++) count[findRoot(order[k])]++;
            for (const auto& entry : count) total += entry.second * (entry.second - 1) / 2;
            i = j;
        }
        cout << total << "\n";`),
      java: J(ADJ.java, r`
        parent = new int[nodes + 1];
        sizes = new int[nodes + 1];
        for (int v = 0; v <= nodes; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        Integer[] order = new Integer[nodes];
        for (int i = 0; i < nodes; i++) order[i] = i + 1;
        Arrays.sort(order, (a, b) -> Long.compare(value[a - 1], value[b - 1]));
        long total = nodes;
        int i = 0;
        while (i < nodes) {
            int j = i;
            long x = value[order[i] - 1];
            while (j < nodes && value[order[j] - 1] == x) j++;
            for (int k = i; k < j; k++) {
                int v = order[k];
                for (int w : adj.get(v)) {
                    if (value[w - 1] <= x) unite(v, w);
                }
            }
            Map<Integer, Long> count = new HashMap<>();
            for (int k = i; k < j; k++) count.merge(findRoot(order[k]), 1L, Long::sum);
            for (long c : count.values()) total += c * (c - 1) / 2;
            i = j;
        }
        System.out.println(total);`)
    },
    solution: { explanation: ['Nodes are handled in increasing order of value, equal values together: each node is joined with neighbours of lower or equal value, and c nodes of the same value in one group give c(c - 1)/2 good paths; the single-node paths are added.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const value = nums(rs[1]); const edges = many(m, (i) => nums(rs[i + 2])); const adj = adjacency(n, edges);
      if (n <= 300) { // check every pair of nodes with the same value: the largest value on the path between them
        let count = n; for (let s = 1; s <= n; s++) { const best = new Array(n + 1).fill(-1); best[s] = value[s - 1]; const q = [s]; for (let h = 0; h < q.length; h++) for (const w of adj[q[h]]) if (best[w] < 0) { best[w] = Math.max(best[q[h]], value[w - 1]); q.push(w); } for (let t = s + 1; t <= n; t++) if (value[t - 1] === value[s - 1] && best[t] === value[s - 1]) count++; } return String(count); }
      const order = many(n, (i) => i + 1).sort((a, b) => value[a - 1] - value[b - 1]); const d = new Dsu(n); let total = n; let i = 0;
      while (i < n) { let j = i; const x = value[order[i] - 1]; while (j < n && value[order[j] - 1] === x) j++; for (let k = i; k < j; k++) for (const w of adj[order[k]]) if (value[w - 1] <= x) d.union(order[k], w); const cnt = new Map(); for (let k = i; k < j; k++) { const rt = d.find(order[k]); cnt.set(rt, (cnt.get(rt) || 0) + 1); } for (const c of cnt.values()) total += c * (c - 1) / 2; i = j; }
      return String(total);
    },
    tests() {
      const g = rng(997); const out = ['5 4\n1 3 2 1 3\n1 2\n1 3\n3 4\n3 5\n', '2 1\n5 5\n1 2\n', '2 1\n5 6\n1 2\n'];
      const make = (n, hi, shape) => { const e = mix(g, randomTreeEdges(g, n, shape)); return `${n} ${e.length}\n${many(n, () => randInt(g, 0, hi)).join(' ')}\n${e.map((x) => x.join(' ')).join('\n')}\n`; };
      crossCheck(() => make(randInt(g, 2, 12), 3, 'random'), (i) => this.solve(i), (i) => { const rs = rows(i); const [n, m] = nums(rs[0]); const value = nums(rs[1]); const adj = adjacency(n, many(m, (k) => nums(rs[k + 2]))); let count = n; for (let s = 1; s <= n; s++) for (let t = s + 1; t <= n; t++) { if (value[s - 1] !== value[t - 1]) continue; const prev = new Array(n + 1).fill(0); prev[s] = -1; const q = [s]; for (let h = 0; h < q.length; h++) for (const w of adj[q[h]]) if (!prev[w]) { prev[w] = q[h]; q.push(w); } let ok = true; for (let x = t; x !== -1 && x !== 0; x = prev[x]) if (value[x - 1] > value[s - 1]) ok = false; if (ok) count++; } return String(count); }, 300);
      for (const [n, hi, shape] of [[8, 3, 'random'], [50, 5, 'random'], [300, 10, 'binary'], [3000, 3, 'random'], [20000, 5, 'random'], [20000, 1000000000, 'random'], [20000, 2, 'path'], [20000, 0, 'path'], [20000, 0, 'star'], [20000, 1, 'deep'], [20000, 50, 'binary']]) out.push(make(n, hi, shape));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`, `t` and `q`: the number of cities (numbered 1 to n), the threshold and the number of questions.', 'Each of the next `q` lines has two cities `a` and `b`.'],
    constraints: ['2 <= n <= 50000', '0 <= t <= n', '1 <= q <= 20000', '1 <= a, b <= n'],
    slug: 'connected-by-common-divisor',
    title: 'Cities Linked by a Big Common Divisor',
    tags: ['graph', 'union-find', 'number-theory', 'sieve'],
    concept: {
      title: 'Instead of testing all pairs, join every number to the other multiples of each divisor larger than the threshold',
      body: [
        'There are cities numbered `1` to `n`. Two cities `a` and `b` are joined by a road if their **greatest common divisor is larger than a threshold `t`**. There are no other roads. For each question, are the cities `a` and `b` connected (directly or through other cities)? Testing all pairs of cities costs about `n^2 / 2` gcd computations, much too slow for `n = 50000`.',
        'Look at it from the side of the divisors. If `gcd(a, b) = g > t`, then `g` divides both `a` and `b`. Conversely, if some number `d > t` divides both `a` and `b`, then `gcd(a, b) >= d > t`, so the cities are joined. So `a` and `b` are joined **exactly when they have a common divisor `d > t`**. For each `d` from `t + 1` to `n`, all the multiples of `d` (`d, 2d, 3d, ...`) are therefore joined to each other, and it is enough to **union them all with `d` itself** (or with each other in a chain). The number of unions is `n/(t+1) + n/(t+2) + ... + n/n`, about `n ln n`, at most about half a million for `n = 50000`.',
        { code: 'for d in range(t + 1, n + 1):\n    for multiple in range(2 * d, n + 1, d):\n        union(d, multiple)          # d and all its multiples are in one group\n# a question (a, b):  find(a) == find(b)' },
        'This is the *harmonic sum* trick (as in the sieve of Eratosthenes): looping over the multiples of every number takes O(n log n) in total. If `t = 0`, every `d` from 1 joins all numbers, so everyone is connected. If `t >= n`, nobody is joined.'
      ]
    },
    statement: ['There are `n` cities numbered 1 to `n`. Two cities `a` and `b` are directly connected by a road if `gcd(a, b) > t`. For each of `q` questions with two cities `a` and `b`, print `yes` if there is a way to get from `a` to `b` along roads (a city is connected to itself), and `no` otherwise.'],
    outputFormat: ['`q` lines: `yes` or `no`.'],
    examples: [{ input: '6 2 3\n1 4\n2 5\n3 6\n', note: 'Only the cities 3 and 6 share a divisor larger than 2 (the number 3): no, no, yes.' }],
    hints: ['Two cities are directly connected exactly when they have a common divisor larger than t.', 'For every d larger than t, join d with all its multiples up to n.', 'A question is answered by comparing the groups of the two cities.'],
    program: {
      io: ['n:int t:int q:int', 'qs:int[q][2]'],
      fast: true,
      helpers: DSU,
      python: r`
        parent.extend(range(n + 1))
        size.extend([1] * (n + 1))
        for d in range(t + 1, n + 1):
            for multiple in range(2 * d, n + 1, d):
                union(d, multiple)
        print("\n".join("yes" if find(a) == find(b) else "no" for a, b in qs))`,
      cpp: r`
        parent.resize(n + 1);
        sizes.assign(n + 1, 1);
        for (int v = 0; v <= n; v++) parent[v] = v;
        for (long long d = t + 1; d <= n; d++) {
            for (long long multiple = 2 * d; multiple <= n; multiple += d) unite((int)d, (int)multiple);
        }
        for (const vector<long long>& query : qs) cout << (findRoot((int)query[0]) == findRoot((int)query[1]) ? "yes" : "no") << "\n";`,
      java: r`
        int cities = (int) n;
        parent = new int[cities + 1];
        sizes = new int[cities + 1];
        for (int v = 0; v <= cities; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        for (long d = t + 1; d <= n; d++) {
            for (long multiple = 2 * d; multiple <= n; multiple += d) unite((int) d, (int) multiple);
        }
        StringBuilder out = new StringBuilder();
        for (long[] query : qs) out.append(findRoot((int) query[0]) == findRoot((int) query[1]) ? "yes" : "no").append("\n");
        System.out.print(out);`
    },
    solution: { explanation: ['Every number d above the threshold is joined with all its multiples; two cities are connected exactly when they end in the same group of the union-find.'], complexity: 'Time O(n log n + q), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, t, q] = nums(rs[0]); const out = [];
      if (n <= 300) { const d = new Dsu(n); for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) if (gcd(a, b) > t) d.union(a, b); for (let i = 0; i < q; i++) { const [a, b] = nums(rs[1 + i]); out.push(d.find(a) === d.find(b) ? 'yes' : 'no'); } return out.join('\n'); }
      const d = new Dsu(n); for (let k = t + 1; k <= n; k++) for (let m2 = 2 * k; m2 <= n; m2 += k) d.union(k, m2); for (let i = 0; i < q; i++) { const [a, b] = nums(rs[1 + i]); out.push(d.find(a) === d.find(b) ? 'yes' : 'no'); } return out.join('\n');
    },
    tests() {
      const g = rng(998); const out = ['6 2 3\n1 4\n2 5\n3 6\n', '2 0 1\n1 2\n', '2 2 2\n1 2\n2 2\n'];
      const make = (n, t, q) => `${n} ${t} ${q}\n${many(q, () => `${randInt(g, 1, n)} ${randInt(g, 1, n)}`).join('\n')}\n`;
      for (const [n, t, q] of [[10, 1, 15], [30, 2, 40], [100, 5, 100], [300, 10, 300], [1000, 3, 500], [50000, 0, 20000], [50000, 1, 20000], [50000, 2, 20000], [50000, 100, 20000], [50000, 1000, 20000], [50000, 10000, 20000], [50000, 24999, 20000], [50000, 50000, 20000], [50000, 25000, 20000]]) out.push(make(n, t, q));
      return out;
    }
  }
];
