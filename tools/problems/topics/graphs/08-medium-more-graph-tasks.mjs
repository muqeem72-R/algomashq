import { r, rng, randInt, many, nums, rows, shuffle } from '../../lib.mjs';
import { graphText, randomEdges, randomTreeEdges, connectedEdges, randomDirected, adjacency, mix, Heap, Dsu, randomGrid, gridText, dijkstraSlow } from '../../graphlib.mjs';
import { J, ADJ, DIR, WADJ, DSU, EDGE_INPUT, DIR_INPUT, WEDGE_INPUT, GRID_INPUT } from '../../graphcode.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const parse = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); return { n, m, edges: many(m, (i) => nums(rs[i + 1])), rs }; };
const inside = (h, w, a, b) => a >= 0 && a < h && b >= 0 && b < w;
const WE = (g, n, m, hi) => mix(g, randomEdges(g, n, m, [1, hi]));
const LIM = ['2 <= n <= 20000', '1 <= m <= 30000', 'There are no self-loops and no repeated edges.'];

export default [
  {
    ...medium,
    inputFormat: WEDGE_INPUT,
    constraints: ['2 <= n <= 20000', '1 <= m <= 30000', '1 <= w <= 10^9', 'There are no self-loops and no repeated edges.'],
    slug: 'widest-path',
    title: 'The Widest Road From Town 1 to Town n',
    tags: ['graph', 'union-find', 'greedy', 'bottleneck'],
    concept: {
      title: 'Add the roads from the widest to the narrowest; the road that first joins the two towns is the bottleneck',
      body: [
        'Every road has a **width** (how heavy a truck can be). A route is only as good as its **narrowest road**. Find a route from town 1 to town `n` whose narrowest road is as wide as possible, and print that width. This is a *bottleneck* (or *maximin*) path problem.',
        'Think of lowering a threshold: with the threshold `T`, only roads of width at least `T` may be used. For a large `T` few roads remain; as `T` falls, more roads join in. The answer is the **largest `T` for which the towns 1 and `n` are connected**. To find it, add the roads in the order of **decreasing width** to a union-find, and stop when 1 and `n` first become connected: the width of the road just added is the answer.',
        { code: 'edges.sort(key=lambda e: -e[2])          # the widest road first\nfor u, v, w in edges:\n    union(u, v)\n    if find(1) == find(n):\n        print(w)                          # the narrowest road of the best route\n        break\nelse:\n    print(-1)' },
        'This is Kruskal\'s algorithm run on the **maximum** spanning tree, and the answer is the smallest edge on the tree path between the two towns. The time is O(m log m).'
      ]
    },
    statement: ['A road network has `n` towns and `m` two-way roads; each road has a width. The width of a route is the width of its narrowest road. Print the largest possible width of a route from town 1 to town `n`, or -1 if there is no route.'],
    outputFormat: ['Print the width or -1.'],
    examples: [{ input: '4 4\n1 2 5\n2 4 3\n1 3 2\n3 4 9\n', note: 'The route 1, 2, 4 has the width 3; the route 1, 3, 4 has the width 2: 3.' }],
    hints: ['Sort the roads by width, widest first.', 'Add them to a union-find one by one.', 'When towns 1 and n become connected, the width of the road just added is the answer.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      includes: ['<algorithm>'],
      helpers: DSU,
      python: r`
        parent.extend(range(n + 1))
        size.extend([1] * (n + 1))
        edges.sort(key=lambda e: -e[2])
        answer = -1
        for u, v, w in edges:
            union(u, v)
            if find(1) == find(n):
                answer = w
                break
        print(answer)`,
      cpp: r`
        parent.resize(n + 1);
        sizes.assign(n + 1, 1);
        for (int v = 0; v <= n; v++) parent[v] = v;
        sort(edges.begin(), edges.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[2] > y[2]; });
        long long answer = -1;
        for (const vector<long long>& e : edges) {
            unite((int)e[0], (int)e[1]);
            if (findRoot(1) == findRoot((int)n)) {
                answer = e[2];
                break;
            }
        }
        cout << answer << "\n";`,
      java: r`
        int nodes = (int) n;
        parent = new int[nodes + 1];
        sizes = new int[nodes + 1];
        for (int v = 0; v <= nodes; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        Arrays.sort(edges, (x, y) -> Long.compare(y[2], x[2]));
        long answer = -1;
        for (long[] e : edges) {
            unite((int) e[0], (int) e[1]);
            if (findRoot(1) == findRoot(nodes)) {
                answer = e[2];
                break;
            }
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['The roads are added to a union-find from the widest to the narrowest; the width of the road that first connects town 1 and town n is the largest possible width of the narrowest road on a route.'], complexity: 'Time O(m log m), space O(n).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges);
      // maximin Dijkstra with a heap (independent of the union-find method)
      const best = new Array(n + 1).fill(-1); best[1] = Infinity; const heap = new Heap((a, b) => a[0] > b[0]); heap.push([Infinity, 1]);
      while (heap.size) { const [d, u] = heap.pop(); if (d < best[u]) continue; for (const [v, w] of adj[u]) { const c = Math.min(d, w); if (c > best[v]) { best[v] = c; heap.push([c, v]); } } }
      return String(best[n] < 0 ? -1 : best[n]);
    },
    tests() {
      const g = rng(971); const out = ['4 4\n1 2 5\n2 4 3\n1 3 2\n3 4 9\n', '2 1\n1 2 7\n', '3 1\n1 2 7\n'];
      for (const [n, m, hi] of [[8, 12, 20], [60, 150, 1000], [1000, 2500, 1000000], [20000, 30000, 1000000000], [20000, 12000, 1000000000], [20000, 25000, 5], [300, 30000, 1000]]) out.push(graphText(n, WE(g, n, m, hi)));
      out.push(graphText(20000, connectedEdges(g, 20000, 9000, [1, 1000000000])), graphText(20000, many(19999, (i) => [i + 1, i + 2, 1000000000 - i])));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: DIR_INPUT,
    constraints: LIM,
    slug: 'routes-with-reversals',
    title: 'Turn the Fewest One-Way Streets Around',
    tags: ['graph', 'bfs', '0-1-bfs', 'deque', 'directed-graph'],
    concept: {
      title: 'Allow every street in both directions, but charge 1 for going against its arrow',
      body: [
        'A city has one-way streets (directed edges). You want to drive from node 1 to node `n`, and you may **turn some streets around** (reverse them). What is the fewest number of streets you must reverse so that a route from 1 to `n` exists?',
        'Model this as a shortest-path problem with two kinds of moves for every street `u -> v`: going from `u` to `v` along the arrow costs **0** (nothing to reverse), and going from `v` to `u` against the arrow costs **1** (this street has to be reversed). The cheapest way from 1 to `n` in this graph is the answer, because a street that is used in a route is used in one direction only (a shortest route never uses a street twice).',
        'All costs are 0 or 1, so the *0-1 BFS* with a double-ended queue is the right tool: a move of cost 0 puts the node at the **front** of the deque and a move of cost 1 at the **back**.',
        { code: 'adj[u].append((v, 0))              # along the arrow\nadj[v].append((u, 1))              # against the arrow: this street must be reversed\ndist[1] = 0\ndq = deque([1])\nwhile dq:\n    u = dq.popleft()\n    for v, cost in adj[u]:\n        if dist[u] + cost < dist[v]:\n            dist[v] = dist[u] + cost\n            if cost == 0:\n                dq.appendleft(v)\n            else:\n                dq.append(v)' },
        'The time is O(n + m). If the answer is not finite, there is no route even when the directions are ignored: print -1.'
      ]
    },
    statement: ['A directed graph has `n` nodes and `m` one-way streets. You may reverse the direction of some streets. Print the smallest number of streets you must reverse so that there is a route from node 1 to node `n`, or -1 if there is no route even if all streets could be used in both directions.'],
    outputFormat: ['Print the number of streets or -1.'],
    examples: [{ input: '4 3\n1 2\n3 2\n3 4\n', note: 'The route 1, 2, 3, 4 uses the street 3 -> 2 against its direction: 1 street to reverse.' }],
    hints: ['For every street u -> v add an edge u to v with cost 0 and an edge v to u with cost 1.', 'Run a 0-1 BFS from node 1 using a deque.', 'Print the distance of node n, or -1 if it was not reached.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<deque>'],
      python: r`
        from collections import deque
        INF = 10 ** 9
        adj = [[] for _ in range(n + 1)]
        for u, v in edges:
            adj[u].append((v, 0))
            adj[v].append((u, 1))
        dist = [INF] * (n + 1)
        dist[1] = 0
        dq = deque([1])
        while dq:
            u = dq.popleft()
            for v, cost in adj[u]:
                if dist[u] + cost < dist[v]:
                    dist[v] = dist[u] + cost
                    if cost == 0:
                        dq.appendleft(v)
                    else:
                        dq.append(v)
        print(dist[n] if dist[n] < INF else -1)`,
      cpp: r`
        const int INF = 1000000000;
        vector<vector<pair<int, int>>> adj(n + 1);
        for (const vector<long long>& e : edges) {
            adj[e[0]].push_back({(int)e[1], 0});
            adj[e[1]].push_back({(int)e[0], 1});
        }
        vector<int> dist(n + 1, INF);
        dist[1] = 0;
        deque<int> dq;
        dq.push_back(1);
        while (!dq.empty()) {
            int u = dq.front();
            dq.pop_front();
            for (const auto& edge : adj[u]) {
                if (dist[u] + edge.second < dist[edge.first]) {
                    dist[edge.first] = dist[u] + edge.second;
                    if (edge.second == 0) dq.push_front(edge.first);
                    else dq.push_back(edge.first);
                }
            }
        }
        cout << (dist[n] < INF ? dist[n] : -1) << "\n";`,
      java: r`
        int nodes = (int) n;
        int INF = 1000000000;
        List<List<int[]>> adj = new ArrayList<>();
        for (int v = 0; v <= nodes; v++) adj.add(new ArrayList<>());
        for (long[] e : edges) {
            adj.get((int) e[0]).add(new int[] {(int) e[1], 0});
            adj.get((int) e[1]).add(new int[] {(int) e[0], 1});
        }
        int[] dist = new int[nodes + 1];
        Arrays.fill(dist, INF);
        dist[1] = 0;
        ArrayDeque<Integer> dq = new ArrayDeque<>();
        dq.addLast(1);
        while (!dq.isEmpty()) {
            int u = dq.pollFirst();
            for (int[] edge : adj.get(u)) {
                if (dist[u] + edge[1] < dist[edge[0]]) {
                    dist[edge[0]] = dist[u] + edge[1];
                    if (edge[1] == 0) dq.addFirst(edge[0]);
                    else dq.addLast(edge[0]);
                }
            }
        }
        System.out.println(dist[nodes] < INF ? dist[nodes] : -1);`
    },
    solution: { explanation: ['Every street gets a cost-0 edge along its direction and a cost-1 edge against it; a 0-1 BFS with a deque from node 1 gives the smallest number of reversals to reach node n.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = Array.from({ length: n + 1 }, () => []); for (const [u, v] of edges) { adj[u].push([v, 0]); adj[v].push([u, 1]); }
      const dist = new Array(n + 1).fill(Infinity); dist[1] = 0; const heap = new Heap((a, b) => a[0] < b[0]); heap.push([0, 1]);
      while (heap.size) { const [d, u] = heap.pop(); if (d > dist[u]) continue; for (const [v, c] of adj[u]) if (d + c < dist[v]) { dist[v] = d + c; heap.push([d + c, v]); } }
      return String(dist[n] === Infinity ? -1 : dist[n]);
    },
    tests() {
      const g = rng(972); const out = ['4 3\n1 2\n3 2\n3 4\n', '2 1\n2 1\n', '2 1\n1 2\n', '3 1\n1 2\n'];
      for (const [n, m] of [[6, 7], [40, 60], [1000, 1500], [20000, 25000], [20000, 20500], [20000, 30000]]) out.push(graphText(n, shuffle(g, randomDirected(g, n, m))));
      out.push(graphText(20000, many(19999, (i) => [i + 2, i + 1])), graphText(20000, many(19999, (i) => (i % 2 ? [i + 2, i + 1] : [i + 1, i + 2]))), graphText(20000, many(19999, (i) => [i + 1, i + 2])));
      for (const n of [10, 3000]) out.push(graphText(n, shuffle(g, randomTreeEdges(g, n).map(([a, b]) => (g() < 0.5 ? [a, b] : [b, a])))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, the number of points.', 'Each of the next `n` lines has two numbers `x` and `y`: the coordinates of a point.'],
    constraints: ['1 <= n <= 1000', '-10^6 <= x, y <= 10^6', 'The points are different.'],
    slug: 'connect-points-minimum-cost',
    title: 'Join All the Points With the Least Cable',
    tags: ['graph', 'mst', 'prim', 'geometry'],
    concept: {
      title: 'Prim\'s algorithm on a complete graph: grow one tree, always adding the closest outside point',
      body: [
        'There are `n` points on a plane. Joining two points costs the **Manhattan distance** `|x1 - x2| + |y1 - y2|`. Connect all the points with the smallest total cost. Every pair of points can be joined, so the graph is *complete*: it has `n * (n - 1) / 2` edges, almost half a million for `n = 1000`. Writing all edges down and sorting them (Kruskal) works, but there is a method that does not need the edge list.',
        '*Prim\'s algorithm* grows a single tree from one point. Keep for every point outside the tree the **cheapest connection to the tree** so far (`best[v]`). Repeat `n` times: take the outside point with the smallest `best` (scan all points, O(n)), add it to the tree (add its `best` to the total), and then update `best` of the other outside points with their distance to the new point.',
        { code: 'best = [INF] * n\nused = [False] * n\nbest[0] = 0\ntotal = 0\nfor _ in range(n):\n    u = min((v for v in range(n) if not used[v]), key=lambda v: best[v])   # the closest outside point\n    used[u] = True\n    total += best[u]\n    for v in range(n):\n        if not used[v]:\n            best[v] = min(best[v], abs(x[u] - x[v]) + abs(y[u] - y[v]))' },
        'With a scan instead of a heap the time is O(n^2), which is just right for a complete graph (a heap would not help, since all `n^2` edges must be looked at anyway). The sum can reach 4 * 10^9, so use 64-bit integers.'
      ]
    },
    statement: ['`n` points are given on a plane. Joining two points costs the sum of the absolute differences of their coordinates, `|x1 - x2| + |y1 - y2|`. Print the smallest total cost of joinings such that all points are connected to each other (directly or through other points).'],
    outputFormat: ['Print the smallest total cost.'],
    examples: [{ input: '5\n0 0\n2 2\n3 10\n5 2\n7 0\n', note: 'Join (0,0)-(2,2) for 4, (2,2)-(5,2) for 3, (5,2)-(7,0) for 4 and (2,2)-(3,10) for 9: 20 in total.' }],
    hints: ['Keep for every point not yet in the tree the cheapest distance to the tree.', 'Repeat n times: take the closest such point, add its cost, and update the others with their distance to it.', 'The scan makes the whole algorithm O(n^2).'],
    program: {
      io: ['n:int', 'pts:int[n][2]'],
      fast: true,
      python: r`
        INF = 10 ** 18
        best = [INF] * n
        used = [False] * n
        best[0] = 0
        total = 0
        for _ in range(n):
            u = -1
            for v in range(n):
                if not used[v] and (u == -1 or best[v] < best[u]):
                    u = v
            used[u] = True
            total += best[u]
            ux, uy = pts[u]
            for v in range(n):
                if not used[v]:
                    d = abs(ux - pts[v][0]) + abs(uy - pts[v][1])
                    if d < best[v]:
                        best[v] = d
        print(total)`,
      cpp: r`
        const long long INF = 1000000000000000000LL;
        vector<long long> best(n, INF);
        vector<char> used(n, 0);
        best[0] = 0;
        long long total = 0;
        for (int round = 0; round < n; round++) {
            int u = -1;
            for (int v = 0; v < n; v++) {
                if (!used[v] && (u == -1 || best[v] < best[u])) u = v;
            }
            used[u] = 1;
            total += best[u];
            for (int v = 0; v < n; v++) {
                if (!used[v]) {
                    long long d = llabs(pts[u][0] - pts[v][0]) + llabs(pts[u][1] - pts[v][1]);
                    if (d < best[v]) best[v] = d;
                }
            }
        }
        cout << total << "\n";`,
      java: r`
        int count = (int) n;
        long INF = 1000000000000000000L;
        long[] best = new long[count];
        Arrays.fill(best, INF);
        boolean[] used = new boolean[count];
        best[0] = 0;
        long total = 0;
        for (int round = 0; round < count; round++) {
            int u = -1;
            for (int v = 0; v < count; v++) {
                if (!used[v] && (u == -1 || best[v] < best[u])) u = v;
            }
            used[u] = true;
            total += best[u];
            for (int v = 0; v < count; v++) {
                if (!used[v]) {
                    long d = Math.abs(pts[u][0] - pts[v][0]) + Math.abs(pts[u][1] - pts[v][1]);
                    if (d < best[v]) best[v] = d;
                }
            }
        }
        System.out.println(total);`,
      includes: ['<cstdlib>']
    },
    solution: { explanation: ['Prim\'s algorithm with a scan: the closest point outside the tree is added in every round, and the cheapest connections of the other points are updated with their distance to it.'], complexity: 'Time O(n^2), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const pts = many(n, (i) => nums(rs[i + 1])); const edges = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) edges.push([Math.abs(pts[i][0] - pts[j][0]) + Math.abs(pts[i][1] - pts[j][1]), i, j]);
      edges.sort((a, b) => a[0] - b[0]); const d = new Dsu(n); let total = 0; for (const [w, i, j] of edges) if (d.union(i, j)) total += w; return String(total);
    },
    tests() {
      const g = rng(973); const out = ['5\n0 0\n2 2\n3 10\n5 2\n7 0\n', '1\n5 5\n', '2\n-1000000 -1000000\n1000000 1000000\n', '3\n0 0\n0 1\n0 2\n'];
      const make = (n, span) => { const seen = new Set(); const pts = []; while (pts.length < n) { const x = randInt(g, -span, span), y = randInt(g, -span, span); if (seen.has(`${x},${y}`)) continue; seen.add(`${x},${y}`); pts.push(`${x} ${y}`); } return `${n}\n${pts.join('\n')}\n`; };
      for (const [n, span] of [[4, 5], [10, 10], [30, 100], [200, 1000], [500, 1000000], [1000, 1000000], [1000, 40], [1000, 600]]) out.push(make(n, span));
      out.push(`1000\n${many(1000, (i) => `${i * 1000} ${(i % 2) * 1000000}`).join('\n')}\n`, `1000\n${many(1000, (i) => `${i} 0`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `m`: the number of villages and the number of possible pipes.', 'The second line has `n` numbers: `cost[i]` is the cost of building a well in the village `i`.', 'Each of the next `m` lines has three numbers `u`, `v` and `c`: a pipe between the villages `u` and `v` costs `c`.'],
    constraints: ['1 <= n <= 20000', '1 <= m <= 30000', '1 <= every cost, c <= 10^9', 'There are no self-loops and no repeated pipes.'],
    slug: 'water-supply-wells',
    title: 'Wells and Pipes for Every Village',
    tags: ['graph', 'mst', 'kruskal', 'union-find', 'virtual-node'],
    concept: {
      title: 'Add a virtual "water source" node connected to each village by the cost of its well; then it is a plain MST',
      body: [
        'Each village needs water, either from **its own well** (a cost per village) or from a neighbour through a **pipe** (a cost per pipe). Pipes carry water in both directions, and a village that is connected by pipes to a village with a well gets water. What is the smallest total cost to supply all villages?',
        'The trick: add an extra node `0`, a *virtual water source*, and an edge from `0` to every village `i` whose cost is the cost of a well in `i`. Now "a village has a well" means "the village is connected to the source by that edge". Supplying water to all villages means that **all villages (and the source) are connected**, and the cheapest way is a **minimum spanning tree** of this enlarged graph. The graph is always connected thanks to the well edges, so a spanning tree exists.',
        { code: 'edges = pipes + [(0, i, well_cost[i]) for i in range(1, n + 1)]\nedges.sort(key=lambda e: e[2])\ntotal = 0\nfor u, v, c in edges:\n    if union(u, v):          # Kruskal on n + 1 nodes\n        total += c' },
        'Some of the chosen edges are wells (edges from node 0), the others are pipes. There is no need to treat them differently. The total can reach 2 * 10^13, so use 64-bit integers. The time is O((n + m) log(n + m)).'
      ]
    },
    statement: ['There are `n` villages. A well in village `i` costs `cost[i]`. A pipe between two villages costs the given amount and carries water both ways. Every village must get water, either from its own well or through pipes from a village that has a well. Print the smallest total cost of wells and pipes.'],
    outputFormat: ['Print the smallest total cost.'],
    examples: [{ input: '3 2\n1 2 2\n1 2 1\n2 3 1\n', note: 'Build one well in village 1 (cost 1) and the pipes 1-2 and 2-3 (cost 1 each): 3.' }],
    hints: ['Add a virtual node 0 and an edge (0, i) for the well of each village.', 'The answer is the weight of a minimum spanning tree of the new graph.', 'Use Kruskal with union-find on n + 1 nodes.'],
    program: {
      io: ['n:int m:int', 'cost:int[n]', 'pipes:int[m][3]'],
      fast: true,
      includes: ['<algorithm>'],
      helpers: DSU,
      python: r`
        parent.extend(range(n + 1))
        size.extend([1] * (n + 1))
        edges = pipes + [[0, i + 1, cost[i]] for i in range(n)]
        edges.sort(key=lambda e: e[2])
        total = 0
        for u, v, c in edges:
            if union(u, v):
                total += c
        print(total)`,
      cpp: r`
        parent.resize(n + 1);
        sizes.assign(n + 1, 1);
        for (int v = 0; v <= n; v++) parent[v] = v;
        vector<vector<long long>> edges = pipes;
        for (int i = 0; i < n; i++) edges.push_back({0, i + 1, cost[i]});
        sort(edges.begin(), edges.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[2] < y[2]; });
        long long total = 0;
        for (const vector<long long>& e : edges) {
            if (unite((int)e[0], (int)e[1])) total += e[2];
        }
        cout << total << "\n";`,
      java: r`
        int villages = (int) n;
        parent = new int[villages + 1];
        sizes = new int[villages + 1];
        for (int v = 0; v <= villages; v++) {
            parent[v] = v;
            sizes[v] = 1;
        }
        List<long[]> edges = new ArrayList<>(Arrays.asList(pipes));
        for (int i = 0; i < villages; i++) edges.add(new long[] {0, i + 1, cost[i]});
        edges.sort((x, y) -> Long.compare(x[2], y[2]));
        long total = 0;
        for (long[] e : edges) {
            if (unite((int) e[0], (int) e[1])) total += e[2];
        }
        System.out.println(total);`
    },
    solution: { explanation: ['A virtual node 0 is joined to every village by an edge with the cost of its well; Kruskal\'s algorithm on the enlarged graph gives the minimum spanning tree, whose weight is the smallest total cost.'], complexity: 'Time O((n + m) log(n + m)), space O(n + m).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const cost = nums(rs[1]); const pipes = many(m, (i) => nums(rs[2 + i]));
      // Prim on the enlarged graph with a heap (independent of Kruskal)
      const adj = Array.from({ length: n + 1 }, () => []); for (let i = 0; i < n; i++) { adj[0].push([i + 1, cost[i]]); adj[i + 1].push([0, cost[i]]); } for (const [u, v, c] of pipes) { adj[u].push([v, c]); adj[v].push([u, c]); }
      const seen = new Array(n + 1).fill(false); const heap = new Heap((a, b) => a[0] < b[0]); heap.push([0, 0]); let total = 0; while (heap.size) { const [d, u] = heap.pop(); if (seen[u]) continue; seen[u] = true; total += d; for (const [v, c] of adj[u]) if (!seen[v]) heap.push([c, v]); }
      return String(total);
    },
    tests() {
      const g = rng(974); const out = ['3 2\n1 2 2\n1 2 1\n2 3 1\n', '2 1\n5 7\n1 2 1\n', '2 1\n10 10\n1 2 3\n'];
      const make = (n, m, hi, wellHi) => { const e = WE(g, n, m, hi); return `${n} ${e.length}\n${many(n, () => randInt(g, 1, wellHi)).join(' ')}\n${e.map((x) => x.join(' ')).join('\n')}\n`; };
      for (const [n, m, hi, wh] of [[5, 6, 9, 9], [30, 60, 100, 100], [1000, 2500, 1000000, 1000000], [20000, 30000, 1000000000, 1000000000], [20000, 30000, 100, 1000000000], [20000, 30000, 1000000000, 100], [20000, 10000, 1000, 1000]]) out.push(make(n, m, hi, wh));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: WEDGE_INPUT,
    constraints: ['2 <= n <= 20000', '1 <= m <= 30000', '1 <= w <= 10^9', 'There are no self-loops and no repeated edges.'],
    slug: 'shortest-path-with-one-free-edge',
    title: 'One Free Road on the Way',
    tags: ['graph', 'shortest-path', 'dijkstra', 'state-graph'],
    concept: {
      title: 'Make a copy of the graph for "free road already used": Dijkstra on pairs (node, used)',
      body: [
        'You drive from town 1 to town `n` and, once on the way, you may use **one road for free** (a coupon). Which route is the cheapest? The best road to make free depends on the whole route, so you cannot decide it in advance; and you cannot just run Dijkstra, because the cost of an edge depends on whether the coupon is still in your pocket.',
        'The standard way is to put the **extra information into the node**: the state is `(town, used)` where `used` is 0 if you still have the coupon and 1 if you have spent it. This is a graph with `2n` nodes. From `(u, 0)` an ordinary road to `v` leads to `(v, 0)` at its cost, **and** the same road can be taken for free, leading to `(v, 1)` at cost 0. From `(u, 1)` roads lead to `(v, 1)` at their cost. Running Dijkstra\'s algorithm on this graph from `(1, 0)` gives the cheapest way to every state; the answer is the smaller of the distances of `(n, 0)` and `(n, 1)`.',
        { code: 'dist = [[INF] * (n + 1) for _ in range(2)]        # dist[used][town]\ndist[0][1] = 0\nheap = [(0, 1, 0)]\nwhile heap:\n    d, u, used = heappop(heap)\n    if d > dist[used][u]:\n        continue\n    for v, w in adj[u]:\n        if d + w < dist[used][v]:                  # pay for the road\n            dist[used][v] = d + w\n            heappush(heap, (d + w, v, used))\n        if used == 0 and d < dist[1][v]:           # use the coupon on this road\n            dist[1][v] = d\n            heappush(heap, (d, v, 1))\nprint(min(dist[0][n], dist[1][n]))' },
        'The idea "add a few layers to the graph for extra state" solves many puzzles: limited coupons, a number of allowed breaks, fuel, keys. The time is O((n + m) log n), twice as large as for one layer.'
      ]
    },
    statement: ['A road network has `n` towns and `m` two-way roads with lengths. You drive from town 1 to town `n` and may choose one road on your route (at most one, possibly none) and drive along it for free, in either direction. Print the smallest total length you have to pay, or -1 if town `n` cannot be reached.'],
    outputFormat: ['Print the smallest cost or -1.'],
    examples: [{ input: '3 2\n1 2 10\n2 3 4\n', note: 'There is only one route; make the road of length 10 free and pay 4.' }],
    hints: ['Let a state be a town together with a flag: is the free road still unused?', 'From the unused flag, every road can either be paid for (flag stays) or be taken for free (flag becomes used).', 'Run Dijkstra on the states; the answer is the smaller distance of town n.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      includes: ['<queue>', '<functional>', '<utility>', '<algorithm>'],
      python: J(WADJ.python, r`
        import heapq
        INF = 10 ** 18
        dist = [[INF] * (n + 1) for _ in range(2)]
        dist[0][1] = 0
        heap = [(0, 1, 0)]
        while heap:
            d, u, used = heapq.heappop(heap)
            if d > dist[used][u]:
                continue
            for v, w in adj[u]:
                if d + w < dist[used][v]:
                    dist[used][v] = d + w
                    heapq.heappush(heap, (d + w, v, used))
                if used == 0 and d < dist[1][v]:
                    dist[1][v] = d
                    heapq.heappush(heap, (d, v, 1))
        answer = min(dist[0][n], dist[1][n])
        print(answer if answer < INF else -1)`),
      cpp: J(WADJ.cpp, r`
        const long long INF = 1000000000000000000LL;
        vector<vector<long long>> dist(2, vector<long long>(n + 1, INF));
        dist[0][1] = 0;
        typedef pair<long long, pair<int, int>> Item;
        priority_queue<Item, vector<Item>, greater<Item>> heap;
        heap.push({0, {1, 0}});
        while (!heap.empty()) {
            Item top = heap.top();
            heap.pop();
            long long d = top.first;
            int u = top.second.first, used = top.second.second;
            if (d > dist[used][u]) continue;
            for (const auto& edge : adj[u]) {
                int v = edge.first;
                if (d + edge.second < dist[used][v]) {
                    dist[used][v] = d + edge.second;
                    heap.push({dist[used][v], {v, used}});
                }
                if (used == 0 && d < dist[1][v]) {
                    dist[1][v] = d;
                    heap.push({d, {v, 1}});
                }
            }
        }
        long long answer = min(dist[0][n], dist[1][n]);
        cout << (answer < INF ? answer : -1) << "\n";`),
      java: J(WADJ.java, r`
        long INF = 1000000000000000000L;
        long[][] dist = new long[2][nodes + 1];
        for (long[] row : dist) Arrays.fill(row, INF);
        dist[0][1] = 0;
        PriorityQueue<long[]> heap = new PriorityQueue<>((p, q) -> Long.compare(p[0], q[0]));
        heap.add(new long[] {0, 1, 0});
        while (!heap.isEmpty()) {
            long[] top = heap.poll();
            long d = top[0];
            int u = (int) top[1], used = (int) top[2];
            if (d > dist[used][u]) continue;
            for (long[] edge : adj.get(u)) {
                int v = (int) edge[0];
                if (d + edge[1] < dist[used][v]) {
                    dist[used][v] = d + edge[1];
                    heap.add(new long[] {dist[used][v], v, used});
                }
                if (used == 0 && d < dist[1][v]) {
                    dist[1][v] = d;
                    heap.add(new long[] {d, v, 1});
                }
            }
        }
        long answer = Math.min(dist[0][nodes], dist[1][nodes]);
        System.out.println(answer < INF ? answer : -1);`)
    },
    solution: { explanation: ['Dijkstra on the states (town, coupon used): paying for a road keeps the flag, taking it for free moves from the unused layer to the used layer at cost 0. The answer is the smaller distance of town n in the two layers.'], complexity: 'Time O((n + m) log n), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges); const d1 = dijkstraSlow2(adj, n, 1), dn = dijkstraSlow2(adj, n, n);
      // the best road to make free is the one that maximises its length saving: min over edges (u, v) of d1[u] + dn[v] (or the reverse)
      let best = d1[n]; for (const [u, v] of edges) best = Math.min(best, d1[u] + dn[v], d1[v] + dn[u]);
      return String(best === Infinity ? -1 : best);
    },
    tests() {
      const g = rng(975); const out = ['3 2\n1 2 10\n2 3 4\n', '2 1\n1 2 5\n', '3 1\n1 2 5\n'];
      const brute = (input) => { const { n, edges } = parse(input); let best = Infinity; for (let skip = -1; skip < edges.length; skip++) { const e2 = edges.map((e, i) => (i === skip ? [e[0], e[1], 0] : e)); const d = dijkstraSlow(adjacency(n, e2), n, 1)[n]; best = Math.min(best, d); } return String(best === Infinity ? -1 : best); };
      crossCheck(() => { const n = randInt(g, 2, 8); return graphText(n, WE(g, n, randInt(g, 1, Math.min(12, n * (n - 1) / 2)), 9)); }, (i) => this.solve(i), brute, 300);
      for (const [n, m, hi] of [[8, 12, 20], [60, 150, 1000], [1000, 2500, 1000000], [20000, 30000, 1000000000], [20000, 20000, 1000000000], [20000, 25000, 5], [300, 30000, 1000]]) out.push(graphText(n, WE(g, n, m, hi)));
      out.push(graphText(20000, many(19999, (i) => [i + 1, i + 2, 1000000000])), graphText(20000, connectedEdges(g, 20000, 8000, [1, 1000000000])));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: DIR_INPUT,
    constraints: ['1 <= n <= 20000', '1 <= m <= 30000', 'There are no self-loops and no repeated edges.'],
    slug: 'mother-vertex-count',
    title: 'Nodes From Which Everything Can Be Reached',
    tags: ['graph', 'directed-graph', 'dfs', 'reachability'],
    concept: {
      title: 'Only the last "root" of a full traversal can be a mother vertex; check it, then collect all nodes that can reach it',
      body: [
        'A *mother vertex* of a directed graph is a node from which **every node** can be reached by following the edges. How many mother vertices does the graph have? Starting a search from every node costs O(n * (n + m)).',
        'Here is a fast way. Run searches so that **every node gets visited**: for each node `v` in order, if it has not been visited, start a search from it (and mark everything it reaches). Remember the **last node from which a new search was started**, call it `c`. If a mother vertex exists at all, then `c` must be reachable from it, and since any mother vertex also reaches `c`... in fact, the last search started at `c` visited everything not yet visited, so a mother vertex `m` has to come in a search that started at `c` or before; if `m` was visited earlier than `c` started, then `c` would have been reached from `m` and not started a new search. Hence **if any mother vertex exists, `c` is one**. Check it with one search from `c`: if it does not reach all `n` nodes, there are no mother vertices: answer 0.',
        'If `c` is a mother vertex, which other nodes are? A node `x` is a mother vertex exactly when it can reach `c` (because `c` reaches everything). Count the nodes that can reach `c` with a search over the **reversed** edges starting at `c`; this count includes `c` itself.',
        { code: 'last = 0\nfor v in range(1, n + 1):\n    if not seen[v]:\n        last = v                        # a new search starts here\n        flood(v)                        # mark everything reachable\n# does `last` reach everything?\nif reach_count(adj, last) != n:\n    answer = 0\nelse:\n    answer = reach_count(reversed_adj, last)     # the nodes that can reach `last`' },
        'Every search is made with a stack in a loop (the graph may be a path of 20000 nodes). The total time is O(n + m).'
      ]
    },
    statement: ['A directed graph has `n` nodes and `m` edges. A mother vertex is a node from which every node of the graph can be reached by following the edges (the node itself counts as reached). Print the number of mother vertices (it can be 0).'],
    outputFormat: ['Print the number of mother vertices.'],
    examples: [{ input: '5 5\n1 2\n2 3\n3 1\n3 4\n4 5\n', note: 'From each of the nodes 1, 2 and 3 all five nodes can be reached; from 4 and 5 not: 3.' }],
    hints: ['Search from every unvisited node and remember the last node that started a search.', 'Only that node can be a mother vertex: check that it reaches all nodes.', 'If it does, the mother vertices are the nodes that can reach it: search from it on the reversed edges and count.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: J(DIR.python, r`
        radj = [[] for _ in range(n + 1)]
        for u, v in edges:
            radj[v].append(u)

        def flood(graph, start, seen):
            seen[start] = True
            stack = [start]
            count = 1
            while stack:
                u = stack.pop()
                for v in graph[u]:
                    if not seen[v]:
                        seen[v] = True
                        count += 1
                        stack.append(v)
            return count

        visited = [False] * (n + 1)
        last = 0
        for v in range(1, n + 1):
            if not visited[v]:
                last = v
                flood(adj, v, visited)
        if flood(adj, last, [False] * (n + 1)) != n:
            print(0)
        else:
            print(flood(radj, last, [False] * (n + 1)))`),
      cpp: J(DIR.cpp, r`
        vector<vector<int>> radj(n + 1);
        for (const vector<long long>& e : edges) radj[e[1]].push_back((int)e[0]);
        auto flood = [&](const vector<vector<int>>& graph, int start, vector<char>& seen) {
            seen[start] = 1;
            vector<int> stack = {start};
            long long count = 1;
            while (!stack.empty()) {
                int u = stack.back();
                stack.pop_back();
                for (int v : graph[u]) {
                    if (!seen[v]) {
                        seen[v] = 1;
                        count++;
                        stack.push_back(v);
                    }
                }
            }
            return count;
        };
        vector<char> visited(n + 1, 0);
        int last = 0;
        for (int v = 1; v <= n; v++) {
            if (!visited[v]) {
                last = v;
                flood(adj, v, visited);
            }
        }
        vector<char> first(n + 1, 0), second(n + 1, 0);
        if (flood(adj, last, first) != n) cout << 0 << "\n";
        else cout << flood(radj, last, second) << "\n";`),
      java: J(DIR.java, r`
        List<List<Integer>> radj = new ArrayList<>();
        for (int v = 0; v <= nodes; v++) radj.add(new ArrayList<>());
        for (long[] e : edges) radj.get((int) e[1]).add((int) e[0]);
        boolean[] visited = new boolean[nodes + 1];
        int last = 0;
        for (int v = 1; v <= nodes; v++) {
            if (!visited[v]) {
                last = v;
                flood(adj, v, visited);
            }
        }
        long reach = flood(adj, last, new boolean[nodes + 1]);
        System.out.println(reach != nodes ? 0 : flood(radj, last, new boolean[nodes + 1]));`),
      helpers: {
        python: '',
        cpp: '',
        java: r`
          static long flood(List<List<Integer>> graph, int start, boolean[] seen) {
              seen[start] = true;
              ArrayList<Integer> stack = new ArrayList<>();
              stack.add(start);
              long count = 1;
              while (!stack.isEmpty()) {
                  int u = stack.remove(stack.size() - 1);
                  for (int v : graph.get(u)) {
                      if (!seen[v]) {
                          seen[v] = true;
                          count++;
                          stack.add(v);
                      }
                  }
              }
              return count;
          }`
      }
    },
    solution: { explanation: ['Searches are started from every unvisited node; the last node that started a search is the only possible mother vertex and is checked by one search. If it is one, the mother vertices are the nodes that can reach it, counted by a search on the reversed edges.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges, true); const rev = Array.from({ length: n + 1 }, () => []); for (const [u, v] of edges) rev[v].push(u);
      const reach = (graph, s) => { const seen = new Array(n + 1).fill(false); seen[s] = true; const q = [s]; for (let h = 0; h < q.length; h++) for (const v of graph[q[h]]) if (!seen[v]) { seen[v] = true; q.push(v); } return q.length; };
      // a mother vertex reaches all n nodes; count them with one search per node when the graph is small, otherwise with the condensation idea (the reverse search from a candidate)
      if (n <= 400) { let c = 0; for (let v = 1; v <= n; v++) if (reach(adj, v) === n) c++; return String(c); }
      const seen = new Array(n + 1).fill(false); let last = 0; for (let v = 1; v <= n; v++) if (!seen[v]) { last = v; seen[v] = true; const q = [v]; for (let h = 0; h < q.length; h++) for (const w of adj[q[h]]) if (!seen[w]) { seen[w] = true; q.push(w); } }
      return reach(adj, last) !== n ? '0' : String(reach(rev, last));
    },
    tests() {
      const g = rng(976); const out = ['5 5\n1 2\n2 3\n3 1\n3 4\n4 5\n', '2 1\n1 2\n', '2 1\n2 1\n', '3 2\n1 2\n3 2\n'];
      const brute = (input) => { const { n, edges } = parse(input); const adj = adjacency(n, edges, true); let c = 0; for (let v = 1; v <= n; v++) { const seen = new Set([v]); const st = [v]; while (st.length) { const u = st.pop(); for (const w of adj[u]) if (!seen.has(w)) { seen.add(w); st.push(w); } } if (seen.size === n) c++; } return String(c); };
      // a strongly connected core (a cycle with chords) with trees and forward edges hanging out of it
      const mother = (n, core, extra) => { const label = shuffle(g, many(n, (i) => i + 1)); const e = []; if (core > 1) for (let i = 0; i < core; i++) e.push([label[i], label[(i + 1) % core]]); const have = new Set(e.map(([a, b]) => a * (n + 1) + b)); const add = (a, b) => { if (a !== b && !have.has(a * (n + 1) + b)) { have.add(a * (n + 1) + b); e.push([a, b]); } };
        for (let i = core; i < n; i++) add(label[randInt(g, 0, i - 1)], label[i]);
        for (let t = 0; t < extra; t++) { const a = randInt(g, 0, n - 1), b = randInt(g, 0, n - 1); if ((a < core && b < core) || (a < b && b >= core)) add(label[a], label[b]); }
        return graphText(n, shuffle(g, e)); };
      crossCheck(() => { const n = randInt(g, 2, 8); return graphText(n, shuffle(g, randomDirected(g, n, randInt(g, 1, Math.min(14, n * (n - 1)))))); }, (i) => this.solve(i), brute, 300);
      for (const [n, core, extra] of [[6, 3, 2], [30, 10, 20], [300, 100, 400], [1000, 50, 800], [20000, 5000, 6000], [20000, 20000, 0], [20000, 1, 3000], [20000, 12000, 5000]]) out.push(mother(n, core, extra));
      for (const [n, m] of [[8, 12], [300, 900], [20000, 25000], [20000, 30000]]) out.push(graphText(n, shuffle(g, randomDirected(g, n, m))));
      out.push(graphText(20000, many(19999, (i) => [i + 1, i + 2])), graphText(20000, [...many(19999, (i) => [i + 1, i + 2]), [20000, 1]]));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, the length of the array.', 'The second line has the `n` numbers of the array.'],
    constraints: ['1 <= n <= 20000', '0 <= every number <= 10^9'],
    slug: 'jump-game-with-equal-values',
    title: 'Jump to Any Place With the Same Number',
    tags: ['graph', 'bfs', 'hashing', 'implicit-graph'],
    concept: {
      title: 'BFS over positions, where equal values are connected; use each group of equal values only once',
      body: [
        'You stand at position 1 of an array and want to reach position `n` with the fewest jumps. From position `i` you may jump to `i - 1`, to `i + 1`, or to **any position `j` that holds the same number** as position `i`. The positions are the nodes of a graph, and the jumps are its edges.',
        'The graph can have a **huge number of edges**: if all 20000 numbers are equal, every position is joined to every other, which is 200 million edges. A normal BFS that looks at all edges would be too slow. The way out: the first time the search uses a "same value" jump from some position with the value `v`, **all** positions with the value `v` get their distance (they are all at distance `dist + 1`). Doing it again from another position with the same value can add nothing new. So after the first use, **empty the list** of positions of the value `v`.',
        { code: 'where = {}                                    # value -> the list of its positions\nfor i, v in enumerate(arr):\n    where.setdefault(v, []).append(i)\ndist = [-1] * n\ndist[0] = 0\nqueue = [0]\nfor i in queue:\n    for j in [i - 1, i + 1] + where.pop(arr[i], []):    # pop: this value is used only once\n        if 0 <= j < n and dist[j] < 0:\n            dist[j] = dist[i] + 1\n            queue.append(j)' },
        'Now every position is processed once, and every group of equal values is expanded once, so the time is O(n). This "remove a group once it has been used" trick is common when a node is connected to a whole class of nodes.'
      ]
    },
    statement: ['An array has `n` numbers. You start at the position 1. In one jump you can go to the position `i - 1`, to the position `i + 1` (if they exist), or to any position `j` with the same number as the position `i` where you are. Print the smallest number of jumps needed to reach the position `n`.'],
    outputFormat: ['Print the smallest number of jumps.'],
    examples: [{ input: '10\n100 23 23 404 100 25 25 25 3 404\n', note: 'Jump from position 1 to position 5 (both 100), step to 4, jump to position 10 (both 404): 3 jumps.' }],
    hints: ['Group the positions by their number in a dictionary.', 'Run a breadth-first search from position 1; from a position also push all positions with the same number.', 'After using a group of equal numbers, remove it from the dictionary so that it is used only once.'],
    program: {
      io: ['n:int', 'arr:int[n]'],
      fast: true,
      includes: ['<unordered_map>'],
      python: r`
        where = {}
        for i, v in enumerate(arr):
            where.setdefault(v, []).append(i)
        dist = [-1] * n
        dist[0] = 0
        queue = [0]
        for i in queue:
            for j in [i - 1, i + 1] + where.pop(arr[i], []):
                if 0 <= j < n and dist[j] < 0:
                    dist[j] = dist[i] + 1
                    queue.append(j)
        print(dist[n - 1])`,
      cpp: r`
        unordered_map<long long, vector<int>> where;
        for (int i = 0; i < n; i++) where[arr[i]].push_back(i);
        vector<int> dist(n, -1);
        dist[0] = 0;
        vector<int> queue = {0};
        for (size_t q = 0; q < queue.size(); q++) {
            int i = queue[q];
            vector<int> targets = {i - 1, i + 1};
            auto it = where.find(arr[i]);
            if (it != where.end()) {
                for (int j : it->second) targets.push_back(j);
                where.erase(it);
            }
            for (int j : targets) {
                if (j >= 0 && j < n && dist[j] < 0) {
                    dist[j] = dist[i] + 1;
                    queue.push_back(j);
                }
            }
        }
        cout << dist[n - 1] << "\n";`,
      java: r`
        int size = (int) n;
        Map<Long, List<Integer>> where = new HashMap<>();
        for (int i = 0; i < size; i++) where.computeIfAbsent(arr[i], k -> new ArrayList<>()).add(i);
        int[] dist = new int[size];
        Arrays.fill(dist, -1);
        dist[0] = 0;
        List<Integer> queue = new ArrayList<>();
        queue.add(0);
        for (int q = 0; q < queue.size(); q++) {
            int i = queue.get(q);
            List<Integer> targets = new ArrayList<>();
            targets.add(i - 1);
            targets.add(i + 1);
            List<Integer> same = where.remove(arr[i]);
            if (same != null) targets.addAll(same);
            for (int j : targets) {
                if (j >= 0 && j < size && dist[j] < 0) {
                    dist[j] = dist[i] + 1;
                    queue.add(j);
                }
            }
        }
        System.out.println(dist[size - 1]);`
    },
    solution: { explanation: ['A breadth-first search over positions: from a position the neighbours are i - 1, i + 1 and all positions with the same number; the group of equal numbers is removed from the dictionary after its first use, so every position is handled once.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const arr = nums(rs[1]); const dist = new Array(n).fill(-1); dist[0] = 0; const q = [0]; const where = new Map(); arr.forEach((v, i) => { if (!where.has(v)) where.set(v, []); where.get(v).push(i); });
      for (let h = 0; h < q.length; h++) { const i = q[h]; const targets = [i - 1, i + 1, ...(where.get(arr[i]) || [])]; where.delete(arr[i]); for (const j of targets) if (j >= 0 && j < n && dist[j] < 0) { dist[j] = dist[i] + 1; q.push(j); } }
      return String(dist[n - 1]);
    },
    tests() {
      const g = rng(977); const out = ['10\n100 23 23 404 100 25 25 25 3 404\n', '1\n5\n', '2\n5 7\n', '5\n7 7 7 7 7\n'];
      const brute = (input) => { const rs = rows(input); const n = Number(rs[0]); const arr = nums(rs[1]); const dist = new Array(n).fill(-1); dist[0] = 0; const q = [0]; for (let h = 0; h < q.length; h++) { const i = q[h]; for (let j = 0; j < n; j++) if (dist[j] < 0 && (j === i - 1 || j === i + 1 || arr[j] === arr[i])) { dist[j] = dist[i] + 1; q.push(j); } } return String(dist[n - 1]); };
      crossCheck(() => { const n = randInt(g, 1, 12); return `${n}\n${many(n, () => randInt(g, 0, 4)).join(' ')}\n`; }, (i) => this.solve(i), brute, 300);
      for (const [n, hi] of [[8, 3], [30, 6], [300, 20], [5000, 100], [20000, 5], [20000, 1000], [20000, 1000000000], [20000, 0], [20000, 19999]]) out.push(`${n}\n${many(n, () => randInt(g, 0, hi)).join(' ')}\n`);
      out.push(`20000\n${many(20000, (i) => i).join(' ')}\n`, `20000\n${many(20000, (i) => (i < 10000 ? i : 20000 - i)).join(' ')}\n`, `20000\n${many(20000, (i) => (i % 2 ? 1 : 2)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: [...GRID_INPUT, 'The next line has four numbers `r1`, `c1`, `r2` and `c2`: the start and the destination (row and column, counted from 1).'],
    constraints: ['1 <= h, w <= 100', 'Every character is `.` (an empty cell) or `#` (a wall).', 'The start and the destination are empty cells.'],
    slug: 'rolling-ball-maze',
    title: 'A Ball That Rolls Until It Hits a Wall',
    tags: ['graph', 'grid', 'dijkstra', 'implicit-graph'],
    concept: {
      title: 'The nodes are the places where the ball can stop; one roll is an edge whose weight is the number of cells it passes',
      body: [
        'A ball in a maze rolls in one of four directions and does not stop until it hits a wall (or the edge of the maze); then you choose a new direction. The ball is only at rest at certain cells. The question: what is the shortest distance (number of cells the ball passes) for the ball to **stop exactly at** the destination?',
        'The cells where the ball may stop are the nodes. From a stopping cell, each of the 4 directions is one edge: roll until the next cell is a wall or outside, and the cell where the ball ends is the other end of the edge. The **weight** of the edge is the number of cells passed. The weights differ, so use Dijkstra\'s algorithm, and the distance of the destination is the answer. It matters that the ball must stop at the destination: rolling through it does not count.',
        { code: 'dist[sx][sy] = 0\nheap = [(0, sx, sy)]\nwhile heap:\n    d, x, y = heappop(heap)\n    if d > dist[x][y]:\n        continue\n    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n        a, b, steps = x, y, 0\n        while inside(a + dx, b + dy) and grid[a + dx][b + dy] == ".":\n            a, b, steps = a + dx, b + dy, steps + 1          # keep rolling\n        if steps > 0 and d + steps < dist[a][b]:\n            dist[a][b] = d + steps\n            heappush(heap, (d + steps, a, b))' },
        'A roll can be up to `h` or `w` cells long, so each popped cell costs O(h + w), and the total is O(h * w * (h + w) + h * w * log) which is fine for a 100 x 100 maze.'
      ]
    },
    statement: ['A maze has `h` rows and `w` columns of empty cells (`.`) and walls (`#`). A ball is at the start cell. In one move you choose a direction (up, down, left or right), and the ball rolls in it through empty cells until the next cell is a wall or lies outside the maze; there it stops. The length of a move is the number of cells the ball passed (not counting the start cell). Print the smallest total length of moves that make the ball stop at the destination cell, or -1 if it is impossible. If the start is the destination, the answer is 0.'],
    outputFormat: ['Print the smallest distance or -1.'],
    examples: [{ input: '5 5\n..#..\n.....\n...#.\n##.##\n.....\n1 5 5 5\n', note: 'One way is: left, down, left, down, right, down, right, with the lengths 1 + 1 + 3 + 1 + 2 + 2 + 2 = 12.' }],
    hints: ['The nodes are the cells where the ball can stop; the edges are the rolls.', 'From a cell, roll in each direction until a wall; the number of cells passed is the weight.', 'Run Dijkstra\'s algorithm; the destination counts only if the ball stops there.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]', 'r1:int c1:int r2:int c2:int'],
      fast: true,
      includes: ['<queue>', '<functional>', '<utility>'],
      python: r`
        import heapq
        INF = 10 ** 18
        dist = [[INF] * w for _ in range(h)]
        dist[r1 - 1][c1 - 1] = 0
        heap = [(0, r1 - 1, c1 - 1)]
        while heap:
            d, x, y = heapq.heappop(heap)
            if d > dist[x][y]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                a, b, steps = x, y, 0
                while 0 <= a + dx < h and 0 <= b + dy < w and grid[a + dx][b + dy] == ".":
                    a += dx
                    b += dy
                    steps += 1
                if steps > 0 and d + steps < dist[a][b]:
                    dist[a][b] = d + steps
                    heapq.heappush(heap, (d + steps, a, b))
        answer = dist[r2 - 1][c2 - 1]
        print(answer if answer < INF else -1)`,
      cpp: r`
        const long long INF = 1000000000000000000LL;
        vector<vector<long long>> dist(h, vector<long long>(w, INF));
        dist[r1 - 1][c1 - 1] = 0;
        typedef pair<long long, pair<int, int>> Item;
        priority_queue<Item, vector<Item>, greater<Item>> heap;
        heap.push({0, {(int)r1 - 1, (int)c1 - 1}});
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        while (!heap.empty()) {
            Item top = heap.top();
            heap.pop();
            long long d = top.first;
            int x = top.second.first, y = top.second.second;
            if (d > dist[x][y]) continue;
            for (int k = 0; k < 4; k++) {
                int a = x, b = y;
                long long steps = 0;
                while (a + dx[k] >= 0 && a + dx[k] < h && b + dy[k] >= 0 && b + dy[k] < w && grid[a + dx[k]][b + dy[k]] == '.') {
                    a += dx[k];
                    b += dy[k];
                    steps++;
                }
                if (steps > 0 && d + steps < dist[a][b]) {
                    dist[a][b] = d + steps;
                    heap.push({dist[a][b], {a, b}});
                }
            }
        }
        long long answer = dist[r2 - 1][c2 - 1];
        cout << (answer < INF ? answer : -1) << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        long INF = 1000000000000000000L;
        long[][] dist = new long[rowsCount][colsCount];
        for (long[] row : dist) Arrays.fill(row, INF);
        dist[(int) r1 - 1][(int) c1 - 1] = 0;
        PriorityQueue<long[]> heap = new PriorityQueue<>((p, q) -> Long.compare(p[0], q[0]));
        heap.add(new long[] {0, r1 - 1, c1 - 1});
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        while (!heap.isEmpty()) {
            long[] top = heap.poll();
            long d = top[0];
            int x = (int) top[1], y = (int) top[2];
            if (d > dist[x][y]) continue;
            for (int k = 0; k < 4; k++) {
                int a = x, b = y;
                long steps = 0;
                while (a + dx[k] >= 0 && a + dx[k] < rowsCount && b + dy[k] >= 0 && b + dy[k] < colsCount && grid[a + dx[k]].charAt(b + dy[k]) == '.') {
                    a += dx[k];
                    b += dy[k];
                    steps++;
                }
                if (steps > 0 && d + steps < dist[a][b]) {
                    dist[a][b] = d + steps;
                    heap.add(new long[] {dist[a][b], a, b});
                }
            }
        }
        long answer = dist[(int) r2 - 1][(int) c2 - 1];
        System.out.println(answer < INF ? answer : -1);`
    },
    solution: { explanation: ['Dijkstra\'s algorithm over the cells where the ball can stop: each direction rolls the ball until a wall, and the number of cells passed is the weight of that edge. The distance of the destination is the answer.'], complexity: 'Time O(h * w * (h + w) + h * w log(h * w)), space O(h * w).' },
    solve(input) {
      const rs = rows(input); const [h, w] = nums(rs[0]); const grid = rs.slice(1, 1 + h); const [r1, c1, r2, c2] = nums(rs[1 + h]); const dist = grid.map((row) => [...row].map(() => Infinity)); dist[r1 - 1][c1 - 1] = 0; const heap = new Heap((a, b) => a[0] < b[0]); heap.push([0, r1 - 1, c1 - 1]);
      while (heap.size) { const [d, x, y] = heap.pop(); if (d > dist[x][y]) continue; for (const [dx, dy] of DIRS) { let a = x, b = y, s = 0; while (inside(h, w, a + dx, b + dy) && grid[a + dx][b + dy] === '.') { a += dx; b += dy; s++; } if (s > 0 && d + s < dist[a][b]) { dist[a][b] = d + s; heap.push([d + s, a, b]); } } }
      return String(dist[r2 - 1][c2 - 1] === Infinity ? -1 : dist[r2 - 1][c2 - 1]);
    },
    tests() {
      const g = rng(978); const out = ['5 5\n..#..\n.....\n...#.\n##.##\n.....\n1 5 5 5\n', '1 1\n.\n1 1 1 1\n', '1 3\n...\n1 1 1 3\n', '1 3\n...\n1 2 1 3\n'];
      const make = (h, w, pWall) => { const cells = randomGrid(g, h, w, ['.', '#'], [1 - pWall, pWall]); const open = []; cells.forEach((row, x) => [...row].forEach((c, y) => { if (c === '.') open.push([x + 1, y + 1]); })); if (open.length < 2) return null; const a = open[randInt(g, 0, open.length - 1)], b = open[randInt(g, 0, open.length - 1)]; return `${gridText(cells)}${a[0]} ${a[1]} ${b[0]} ${b[1]}\n`; };
      for (const [h, w, p] of [[4, 5, 0.3], [10, 10, 0.3], [30, 40, 0.25], [100, 100, 0.2], [100, 100, 0.1], [100, 100, 0.35], [1, 100, 0.1], [100, 1, 0.1]]) for (let t = 0; t < 2; t++) { const text = make(h, w, p); if (text) out.push(text); }
      out.push(`${gridText(many(100, () => '.'.repeat(100)))}1 1 100 100\n`, `${gridText(many(99, (i) => (i % 2 === 0 ? '.'.repeat(99) : (i % 4 === 1 ? '#'.repeat(98) + '.' : '.' + '#'.repeat(98)))))}1 1 99 99\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, the size of the square grid.', 'Each of the next `n` lines has `n` characters, `0` (open) or `1` (blocked).'],
    constraints: ['1 <= n <= 200', 'Every character is `0` or `1`.'],
    slug: 'clear-path-in-grid',
    title: 'The Shortest Clear Path, Diagonals Allowed',
    tags: ['graph', 'grid', 'bfs', 'shortest-path'],
    concept: {
      title: 'The same BFS, with eight neighbours instead of four',
      body: [
        'In a square grid some cells are blocked. You go from the top left cell to the bottom right cell through open cells. A step goes to any of the **eight** neighbouring cells (the four sides and the four diagonals). What is the length of the shortest clear path, counted in **cells** on the path (so the start and the end are both counted)?',
        'It is a plain breadth-first search from the start; the only changes are the list of eight direction pairs and the counting convention. A convenient way: let the distance of the start cell be **1**, and each step adds 1 to the distance, so the distance of the end cell is the number of cells of the path. If the start or the end is blocked, there is no path at all.',
        { code: 'moves = [(dx, dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if dx or dy]    # eight directions\nif grid[0][0] == "1" or grid[n - 1][n - 1] == "1":\n    answer = -1\nelse:\n    dist = [[-1] * n for _ in range(n)]\n    dist[0][0] = 1\n    queue = [(0, 0)]\n    for x, y in queue:\n        for dx, dy in moves:\n            a, b = x + dx, y + dy\n            if 0 <= a < n and 0 <= b < n and grid[a][b] == "0" and dist[a][b] < 0:\n                dist[a][b] = dist[x][y] + 1\n                queue.append((a, b))\n    answer = dist[n - 1][n - 1]' },
        'Diagonal steps may cut between two blocked cells that touch at a corner; the rule of this task allows it. The time is O(n^2).'
      ]
    },
    statement: ['A square grid of `n x n` cells has open cells (`0`) and blocked cells (`1`). A clear path goes from the top left cell to the bottom right cell through open cells; consecutive cells of the path are neighbours in any of the 8 directions (sides and corners). Print the number of cells of the shortest clear path (the start and the end are counted), or -1 if there is none.'],
    outputFormat: ['Print the number of cells or -1.'],
    examples: [{ input: '3\n000\n110\n110\n', note: 'The path (1,1), (1,2), (2,3), (3,3) has 4 cells: 4.' }],
    hints: ['Use eight direction pairs (dx, dy) with dx and dy in -1, 0, 1, not both zero.', 'Start the distance at 1 for the first cell, since cells are counted.', 'If the first or the last cell is blocked, print -1 at once.'],
    program: {
      io: ['n:int', 'grid:rows[n]'],
      fast: true,
      python: r`
        moves = [(dx, dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if dx or dy]
        if grid[0][0] == "1" or grid[n - 1][n - 1] == "1":
            print(-1)
        else:
            dist = [[-1] * n for _ in range(n)]
            dist[0][0] = 1
            queue = [(0, 0)]
            for x, y in queue:
                for dx, dy in moves:
                    a, b = x + dx, y + dy
                    if 0 <= a < n and 0 <= b < n and grid[a][b] == "0" and dist[a][b] < 0:
                        dist[a][b] = dist[x][y] + 1
                        queue.append((a, b))
            print(dist[n - 1][n - 1])`,
      cpp: r`
        if (grid[0][0] == '1' || grid[n - 1][n - 1] == '1') {
            cout << -1 << "\n";
        } else {
            vector<vector<int>> dist(n, vector<int>(n, -1));
            dist[0][0] = 1;
            vector<pair<int, int>> queue = {{0, 0}};
            for (size_t i = 0; i < queue.size(); i++) {
                int x = queue[i].first, y = queue[i].second;
                for (int dx = -1; dx <= 1; dx++) {
                    for (int dy = -1; dy <= 1; dy++) {
                        if (dx == 0 && dy == 0) continue;
                        int a = x + dx, b = y + dy;
                        if (a >= 0 && a < n && b >= 0 && b < n && grid[a][b] == '0' && dist[a][b] < 0) {
                            dist[a][b] = dist[x][y] + 1;
                            queue.push_back({a, b});
                        }
                    }
                }
            }
            cout << dist[n - 1][n - 1] << "\n";
        }`,
      java: r`
        int size = (int) n;
        if (grid[0].charAt(0) == '1' || grid[size - 1].charAt(size - 1) == '1') {
            System.out.println(-1);
        } else {
            int[][] dist = new int[size][size];
            for (int[] row : dist) Arrays.fill(row, -1);
            dist[0][0] = 1;
            List<int[]> queue = new ArrayList<>();
            queue.add(new int[] {0, 0});
            for (int i = 0; i < queue.size(); i++) {
                int x = queue.get(i)[0], y = queue.get(i)[1];
                for (int dx = -1; dx <= 1; dx++) {
                    for (int dy = -1; dy <= 1; dy++) {
                        if (dx == 0 && dy == 0) continue;
                        int a = x + dx, b = y + dy;
                        if (a >= 0 && a < size && b >= 0 && b < size && grid[a].charAt(b) == '0' && dist[a][b] < 0) {
                            dist[a][b] = dist[x][y] + 1;
                            queue.add(new int[] {a, b});
                        }
                    }
                }
            }
            System.out.println(dist[size - 1][size - 1]);
        }`
    },
    solution: { explanation: ['A breadth-first search over the open cells with the eight neighbour directions, counting the start as 1; the distance of the last cell is the number of cells of the shortest path, or -1 if it is blocked or not reached.'], complexity: 'Time O(n^2), space O(n^2).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const grid = rs.slice(1, 1 + n); if (grid[0][0] === '1' || grid[n - 1][n - 1] === '1') return '-1'; const dist = grid.map((row) => [...row].map(() => -1)); dist[0][0] = 1; const q = [[0, 0]];
      for (let h = 0; h < q.length; h++) { const [x, y] = q[h]; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { if (!dx && !dy) continue; const a = x + dx, b = y + dy; if (a >= 0 && a < n && b >= 0 && b < n && grid[a][b] === '0' && dist[a][b] < 0) { dist[a][b] = dist[x][y] + 1; q.push([a, b]); } } }
      return String(dist[n - 1][n - 1]);
    },
    tests() {
      const g = rng(979); const out = ['3\n000\n110\n110\n', '1\n0\n', '1\n1\n', '2\n01\n10\n', '2\n00\n11\n'];
      const make = (n, p) => `${n}\n${randomGrid(g, n, n, ['0', '1'], [1 - p, p]).map((row, i) => (i === 0 ? '0' + row.slice(1) : i === n - 1 ? row.slice(0, n - 1) + '0' : row)).join('\n')}\n`;
      for (const [n, p] of [[4, 0.3], [10, 0.3], [30, 0.35], [200, 0.2], [200, 0.35], [200, 0.45], [200, 0.1], [200, 0.5]]) { out.push(make(n, p)); }
      out.push(`200\n${many(200, (i) => (i % 2 === 0 ? '0'.repeat(200) : (i % 4 === 1 ? '1'.repeat(199) + '0' : '0' + '1'.repeat(199)))).join('\n')}\n`, `200\n${many(200, () => '0'.repeat(200)).join('\n')}\n`);
      return out;
    }
  }
];

// plain Dijkstra with a heap over adjacency lists of [v, w] pairs; unreachable nodes get Infinity
function dijkstraSlow2(adj, n, s) {
  const dist = new Array(n + 1).fill(Infinity); dist[s] = 0; const heap = new Heap((a, b) => a[0] < b[0]); heap.push([0, s]);
  while (heap.size) { const [d, u] = heap.pop(); if (d > dist[u]) continue; for (const [v, w] of adj[u]) if (d + w < dist[v]) { dist[v] = d + w; heap.push([d + w, v]); } }
  return dist;
}
