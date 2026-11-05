import { r, rng, randInt, many, nums, rows, shuffle } from '../../lib.mjs';
import { graphText, randomEdges, connectedEdges, randomDirected, randomDag, adjacency, mix, Heap, dijkstraSlow, gridText } from '../../graphlib.mjs';
import { J, WADJ, WDIR, WEDGE_INPUT, WDIR_INPUT } from '../../graphcode.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const parse = (input) => { const rs = rows(input); const first = nums(rs[0]); const [n, m] = first; return { n, m, first, edges: many(m, (i) => nums(rs[i + 1])), rs }; };
const inside = (h, w, a, b) => a >= 0 && a < h && b >= 0 && b < w;
const WE = (g, n, m, hi) => mix(g, randomEdges(g, n, m, [1, hi]));
const WCON = (g, n, extra, hi) => connectedEdges(g, n, extra, [1, hi]);
const WDIRG = (g, n, m, hi) => shuffle(g, randomDirected(g, n, m, [1, hi]));
const WLIM = ['1 <= n <= 20000', '1 <= m <= 30000', '1 <= w <= 10^9', 'There are no self-loops and no repeated edges.'];
const weightedUndirected = { ...medium, inputFormat: WEDGE_INPUT, constraints: WLIM };
// Dijkstra with a heap, for the reference solutions; adj entries are [v, w]
function dijkstra(adj, n, s) {
  const dist = new Array(n + 1).fill(Infinity); dist[s] = 0; const heap = new Heap((a, b) => a[0] < b[0]); heap.push([0, s]);
  while (heap.size) { const [d, u] = heap.pop(); if (d > dist[u]) continue; for (const [v, w] of adj[u]) if (d + w < dist[v]) { dist[v] = d + w; heap.push([d + w, v]); } }
  return dist;
}
const DIJKSTRA_PY = r`
  import heapq
  INF = 10 ** 18
  dist = [INF] * (n + 1)
  dist[1] = 0
  heap = [(0, 1)]
  while heap:
      d, u = heapq.heappop(heap)
      if d > dist[u]:
          continue
      for v, w in adj[u]:
          if d + w < dist[v]:
              dist[v] = d + w
              heapq.heappush(heap, (d + w, v))`;

export default [
  {
    ...weightedUndirected,
    slug: 'dijkstra-distances',
    title: 'Shortest Distances on Weighted Roads',
    tags: ['graph', 'shortest-path', 'dijkstra', 'heap'],
    concept: {
      title: 'Dijkstra: always settle the unsettled node that is closest to the start',
      body: [
        'When the edges have **weights** (road lengths), breadth-first search is no longer right: the walk with the fewest edges is not the shortest. *Dijkstra\'s algorithm* works when all weights are **non-negative**. It keeps a table `dist[v]`, the best distance known so far (infinite at the start, 0 for the start node), and repeats: take the node `u` with the smallest `dist` among those not finished, and **relax** its edges: for an edge `u - v` of weight `w`, if `dist[u] + w < dist[v]`, then `dist[v]` becomes `dist[u] + w`.',
        'Why is it correct? The unfinished node with the smallest distance cannot be improved any more: any other road to it would pass through an unfinished node, which is at least as far, plus a non-negative weight. So when a node is taken, its distance is final.',
        'To find the closest unfinished node quickly use a **min-heap** of pairs `(distance, node)`. A node can be pushed several times (every time its distance improves), so when a pair is taken from the heap, **skip it if it is out of date** (`d > dist[u]`).',
        { code: 'dist = [INF] * (n + 1)\ndist[1] = 0\nheap = [(0, 1)]\nwhile heap:\n    d, u = heappop(heap)\n    if d > dist[u]:\n        continue                       # an older, longer entry for u\n    for v, w in adj[u]:\n        if d + w < dist[v]:\n            dist[v] = d + w\n            heappush(heap, (d + w, v))' },
        'The time is O((n + m) log n). The distances can reach 2 * 10^13 (20000 edges of 10^9), so use 64-bit integers, and a large "infinity" such as 10^18 for the nodes that cannot be reached.'
      ]
    },
    statement: ['A road network has `n` towns and `m` two-way roads; a road joins two towns and has a length. Print the length of the shortest route from town 1 to every town (in the order 1, 2, ..., n), or -1 for a town that cannot be reached.'],
    outputFormat: ['One line with `n` numbers.'],
    examples: [{ input: '5 4\n1 2 4\n1 3 1\n3 2 2\n2 4 5\n', note: 'Town 3 is 1 away; town 2 is reached through 3 with 1 + 2 = 3 (not 4 directly); town 4 is 3 + 5 = 8; town 5 has no road: 0 3 1 8 -1.' }],
    hints: ['Keep a distance table and a min-heap of (distance, town).', 'Take the closest entry; skip it if its distance is out of date; relax the roads of the town.', 'Print -1 for towns whose distance is still infinite.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      includes: ['<queue>', '<functional>', '<utility>'],
      python: J(WADJ.python, DIJKSTRA_PY, r`
        print(*[d if d < INF else -1 for d in dist[1:]])`),
      cpp: J(WADJ.cpp, r`
        const long long INF = 1000000000000000000LL;
        vector<long long> dist(n + 1, INF);
        dist[1] = 0;
        priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> heap;
        heap.push({0, 1});
        while (!heap.empty()) {
            pair<long long, int> top = heap.top();
            heap.pop();
            int u = top.second;
            if (top.first > dist[u]) continue;
            for (const auto& edge : adj[u]) {
                long long next = top.first + edge.second;
                if (next < dist[edge.first]) {
                    dist[edge.first] = next;
                    heap.push({next, edge.first});
                }
            }
        }
        for (int v = 1; v <= n; v++) cout << (v > 1 ? " " : "") << (dist[v] < INF ? dist[v] : -1);
        cout << "\n";`),
      java: J(WADJ.java, r`
        long INF = 1000000000000000000L;
        long[] dist = new long[nodes + 1];
        Arrays.fill(dist, INF);
        dist[1] = 0;
        PriorityQueue<long[]> heap = new PriorityQueue<>((p, q) -> Long.compare(p[0], q[0]));
        heap.add(new long[] {0, 1});
        while (!heap.isEmpty()) {
            long[] top = heap.poll();
            int u = (int) top[1];
            if (top[0] > dist[u]) continue;
            for (long[] edge : adj.get(u)) {
                int v = (int) edge[0];
                long next = top[0] + edge[1];
                if (next < dist[v]) {
                    dist[v] = next;
                    heap.add(new long[] {next, v});
                }
            }
        }
        StringBuilder out = new StringBuilder();
        for (int v = 1; v <= nodes; v++) out.append(v > 1 ? " " : "").append(dist[v] < INF ? dist[v] : -1);
        System.out.println(out);`)
    },
    solution: { explanation: ['Dijkstra\'s algorithm with a min-heap: the closest unfinished town is taken, out-of-date heap entries are skipped, and the roads of the town are relaxed. Unreached towns are printed as -1.'], complexity: 'Time O((n + m) log n), space O(n + m).' },
    solve(input) { const { n, edges } = parse(input); const adj = adjacency(n, edges); const d = dijkstra(adj, n, 1); return d.slice(1).map((x) => (x === Infinity ? -1 : x)).join(' '); },
    tests() {
      const g = rng(961); const out = ['5 4\n1 2 4\n1 3 1\n3 2 2\n2 4 5\n', '2 1\n2 1 7\n', '3 1\n2 3 5\n'];
      crossCheck(() => { const n = randInt(g, 2, 9); return graphText(n, WE(g, n, randInt(g, 1, Math.min(14, n * (n - 1) / 2)), 9)); }, (i) => this.solve(i), (i) => { const { n, edges } = parse(i); return dijkstraSlow(adjacency(n, edges), n, 1).slice(1).map((x) => (x === Infinity ? -1 : x)).join(' '); }, 300);
      for (const [n, m, hi] of [[8, 12, 10], [60, 150, 1000], [1000, 2500, 1000000], [20000, 30000, 1000000000], [20000, 12000, 1000000000], [20000, 20000, 3], [300, 30000, 1000]]) out.push(graphText(n, WE(g, n, m, hi)));
      out.push(graphText(20000, WCON(g, 20000, 9000, 1000000000)), graphText(20000, many(19999, (i) => [i + 1, i + 2, 1000000000])), graphText(20000, many(19999, (i) => [i + 2, 1, 1000000000])));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, `m` and `k`: the number of nodes, the number of directed edges and the node where the signal starts.', 'Each of the next `m` lines has three numbers `u`, `v` and `w`: an edge from `u` to `v` that a signal needs `w` time units to travel.'],
    constraints: ['1 <= n <= 20000', '1 <= m <= 30000', '1 <= k <= n', '1 <= w <= 10^9', 'There are no self-loops and no repeated edges.'],
    slug: 'network-delay-time',
    title: 'When Does the Last Node Get the Signal?',
    tags: ['graph', 'shortest-path', 'dijkstra', 'directed-graph'],
    concept: {
      title: 'The last node to receive the signal is the node with the largest shortest distance',
      body: [
        'A signal is sent from the node `k` along directed edges; travelling along an edge takes the time given as its weight. The signal is copied at every node, so it spreads along **all** edges at once. A node receives it for the first time after the **shortest** travel time from `k`. All nodes have received it after the **largest** of these shortest times.',
        'So the task is Dijkstra\'s algorithm from the node `k` on a **directed** graph (an edge `u v w` is stored only in the list of `u`), followed by taking the maximum distance. If some node can never be reached (its distance stays infinite), the signal never arrives everywhere: print -1.',
        { code: 'dist = dijkstra(from k)                      # on the directed graph\nif any(d == INF for d in dist[1:]):\n    answer = -1\nelse:\n    answer = max(dist[1:])' },
        'The note about directions is the only new detail compared with the previous task. The time is O((n + m) log n).'
      ]
    },
    statement: ['A network has `n` nodes and `m` directed edges; the edge `u v w` carries a signal from `u` to `v` in `w` time units. A signal starts at the node `k` at time 0 and is copied along every edge. Print the time at which all nodes have received the signal, or -1 if some node never receives it.'],
    outputFormat: ['Print the time or -1.'],
    examples: [{ input: '4 3 2\n2 1 1\n2 3 1\n3 4 1\n', note: 'The signal reaches the nodes 1 and 3 after 1 and the node 4 after 2: 2.' }],
    hints: ['Run Dijkstra\'s algorithm from the node k on the directed graph.', 'If some node still has an infinite distance, print -1.', 'Otherwise print the largest distance.'],
    program: {
      io: ['n:int m:int k:int', 'edges:int[m][3]'],
      fast: true,
      includes: ['<queue>', '<functional>', '<utility>', '<algorithm>'],
      python: J(WDIR.python, r`
        import heapq
        INF = 10 ** 18
        dist = [INF] * (n + 1)
        dist[k] = 0
        heap = [(0, k)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > dist[u]:
                continue
            for v, w in adj[u]:
                if d + w < dist[v]:
                    dist[v] = d + w
                    heapq.heappush(heap, (d + w, v))
        print(-1 if max(dist[1:]) >= INF else max(dist[1:]))`),
      cpp: J(WDIR.cpp, r`
        const long long INF = 1000000000000000000LL;
        vector<long long> dist(n + 1, INF);
        dist[k] = 0;
        priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> heap;
        heap.push({0, (int)k});
        while (!heap.empty()) {
            pair<long long, int> top = heap.top();
            heap.pop();
            int u = top.second;
            if (top.first > dist[u]) continue;
            for (const auto& edge : adj[u]) {
                long long next = top.first + edge.second;
                if (next < dist[edge.first]) {
                    dist[edge.first] = next;
                    heap.push({next, edge.first});
                }
            }
        }
        long long answer = 0;
        for (int v = 1; v <= n; v++) answer = max(answer, dist[v]);
        cout << (answer >= INF ? -1 : answer) << "\n";`),
      java: J(WDIR.java, r`
        long INF = 1000000000000000000L;
        long[] dist = new long[nodes + 1];
        Arrays.fill(dist, INF);
        dist[(int) k] = 0;
        PriorityQueue<long[]> heap = new PriorityQueue<>((p, q) -> Long.compare(p[0], q[0]));
        heap.add(new long[] {0, k});
        while (!heap.isEmpty()) {
            long[] top = heap.poll();
            int u = (int) top[1];
            if (top[0] > dist[u]) continue;
            for (long[] edge : adj.get(u)) {
                int v = (int) edge[0];
                long next = top[0] + edge[1];
                if (next < dist[v]) {
                    dist[v] = next;
                    heap.add(new long[] {next, v});
                }
            }
        }
        long answer = 0;
        for (int v = 1; v <= nodes; v++) answer = Math.max(answer, dist[v]);
        System.out.println(answer >= INF ? -1 : answer);`)
    },
    solution: { explanation: ['Dijkstra from the node k on the directed graph gives the arrival time of the signal at every node; the answer is the largest distance, or -1 if some node is unreachable.'], complexity: 'Time O((n + m) log n), space O(n + m).' },
    solve(input) { const rs = rows(input); const [n, m, k] = nums(rs[0]); const edges = many(m, (i) => nums(rs[i + 1])); const adj = adjacency(n, edges, true); const d = dijkstra(adj, n, k).slice(1); return d.includes(Infinity) ? '-1' : String(Math.max(...d)); },
    tests() {
      const g = rng(962); const out = ['4 3 2\n2 1 1\n2 3 1\n3 4 1\n', '2 1 1\n1 2 5\n', '2 1 2\n1 2 5\n', '3 2 1\n1 2 1\n1 3 4\n'];
      const make = (n, m, hi) => { const e = WDIRG(g, n, m, hi); return `${n} ${e.length} ${randInt(g, 1, n)}\n${e.map((x) => x.join(' ')).join('\n')}\n`; };
      for (const [n, m, hi] of [[6, 10, 9], [40, 150, 100], [1000, 5000, 1000000], [20000, 30000, 1000000000], [20000, 30000, 5], [300, 30000, 1000]]) out.push(make(n, m, hi));
      const chain = many(19999, (i) => [i + 1, i + 2, 1000000000]); out.push(`20000 19999 1\n${chain.map((x) => x.join(' ')).join('\n')}\n`, `20000 19999 2\n${chain.map((x) => x.join(' ')).join('\n')}\n`);
      // a strongly connected random graph: a cycle through all nodes plus random edges
      const cyc = many(20000, (i) => [i + 1, (i + 1) % 20000 + 1, randInt(g, 1, 1000000)]); out.push(`20000 20000 7\n${cyc.map((x) => x.join(' ')).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n` and `m`: the number of cities and the number of flights.', 'Each of the next `m` lines has three numbers `u`, `v` and `p`: a flight from the city `u` to the city `v` with the price `p`.', 'The next line has `src`, `dst` and `k`.'],
    constraints: ['2 <= n <= 500', '1 <= m <= 3000', '1 <= p <= 10^9', '0 <= k <= n', '1 <= src, dst <= n, src != dst', 'There are no self-loops and no repeated flights.'],
    slug: 'cheapest-flights-within-k-stops',
    title: 'The Cheapest Trip With at Most k Stops',
    tags: ['graph', 'shortest-path', 'bellman-ford', 'dp'],
    concept: {
      title: 'Bellman-Ford with a limit: after i rounds you know the cheapest way that uses at most i flights',
      body: [
        'You want the cheapest trip from `src` to `dst` with **at most `k` stops** in between, which means at most `k + 1` flights. Dijkstra\'s algorithm does not fit: the cheapest way to a city may use too many flights, while a slightly more expensive way with fewer flights is the one that is needed later.',
        '*Bellman-Ford* thinks in rounds. Let `dist_i[v]` be the cheapest price to reach `v` with **at most `i` flights**. Round `i + 1` is made from round `i`: for each flight `u -> v` with price `p`, `dist_{i+1}[v] = min(dist_i[v], dist_i[u] + p)`. After `k + 1` rounds, `dist[dst]` is the answer. The important detail: compute each round from a **copy** of the previous one, so that one round adds exactly one flight (updating in place would let a trip use several flights in a single round).',
        { code: 'INF = 10 ** 18\ndist = [INF] * (n + 1)\ndist[src] = 0\nfor _ in range(k + 1):\n    nxt = dist[:]                             # a copy: each round adds one flight\n    for u, v, p in flights:\n        if dist[u] < INF and dist[u] + p < nxt[v]:\n            nxt[v] = dist[u] + p\n    if nxt == dist:\n        break                                  # nothing changed: more rounds cannot help\n    dist = nxt' },
        'The time is O(k * m). The loop can stop early when a round changes nothing. The answer is -1 if `dst` is not reached within the limit.'
      ]
    },
    statement: ['There are `n` cities and `m` flights; a flight goes from `u` to `v` for the price `p`. Print the cheapest price of a trip from `src` to `dst` that uses at most `k` stops (at most `k + 1` flights), or -1 if there is no such trip.'],
    outputFormat: ['Print the price or -1.'],
    examples: [{ input: '4 5\n1 2 100\n2 3 100\n3 1 100\n2 4 600\n3 4 200\n1 4 1\n', note: 'With one stop the trip 1, 2, 4 costs 700; the trip 1, 2, 3, 4 has two stops and costs 400, which is not allowed: 700.' }],
    hints: ['Keep the cheapest price to every city with at most i flights.', 'Build every round from a copy of the previous round.', 'Run k + 1 rounds and print the price of the destination, or -1.'],
    program: {
      io: ['n:int m:int', 'flights:int[m][3]', 'src:int dst:int k:int'],
      fast: true,
      python: r`
        INF = 10 ** 18
        dist = [INF] * (n + 1)
        dist[src] = 0
        for _ in range(k + 1):
            nxt = dist[:]
            for u, v, p in flights:
                if dist[u] < INF and dist[u] + p < nxt[v]:
                    nxt[v] = dist[u] + p
            if nxt == dist:
                break
            dist = nxt
        print(dist[dst] if dist[dst] < INF else -1)`,
      cpp: r`
        const long long INF = 1000000000000000000LL;
        vector<long long> dist(n + 1, INF);
        dist[src] = 0;
        for (long long round = 0; round <= k; round++) {
            vector<long long> next = dist;
            for (const vector<long long>& f : flights) {
                if (dist[f[0]] < INF && dist[f[0]] + f[2] < next[f[1]]) next[f[1]] = dist[f[0]] + f[2];
            }
            if (next == dist) break;
            dist = next;
        }
        cout << (dist[dst] < INF ? dist[dst] : -1) << "\n";`,
      java: r`
        long INF = 1000000000000000000L;
        long[] dist = new long[(int) n + 1];
        Arrays.fill(dist, INF);
        dist[(int) src] = 0;
        for (long round = 0; round <= k; round++) {
            long[] next = dist.clone();
            for (long[] f : flights) {
                if (dist[(int) f[0]] < INF && dist[(int) f[0]] + f[2] < next[(int) f[1]]) next[(int) f[1]] = dist[(int) f[0]] + f[2];
            }
            if (Arrays.equals(next, dist)) break;
            dist = next;
        }
        System.out.println(dist[(int) dst] < INF ? dist[(int) dst] : -1);`
    },
    solution: { explanation: ['Bellman-Ford limited to k + 1 rounds: each round is computed from a copy of the previous prices so that it adds exactly one flight; the price of the destination after the rounds is the answer.'], complexity: 'Time O(k * m), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const flights = many(m, (i) => nums(rs[i + 1])); const [src, dst, k] = nums(rs[m + 1]);
      // all trips with at most k + 1 flights, found by trying every path of that length with a memo on (city, flights left)
      const adj = adjacency(n, flights, true); const memo = new Map(); const go = (u, left) => { if (u === dst) return 0; if (left === 0) return Infinity; const key = u * 1000 + left; if (memo.has(key)) return memo.get(key); let best = Infinity; for (const [v, p] of adj[u]) best = Math.min(best, p + go(v, left - 1)); memo.set(key, best); return best; };
      const res = go(src, k + 1); return String(res === Infinity ? -1 : res);
    },
    tests() {
      const g = rng(963); const out = ['4 5\n1 2 100\n2 3 100\n3 1 100\n2 4 600\n3 4 200\n1 4 1\n', '3 2\n1 2 5\n2 3 5\n1 3 0\n', '3 2\n1 2 5\n2 3 5\n1 3 1\n', '2 1\n1 2 9\n2 1 0\n'];
      const make = (n, m, hi, kMax) => { const e = WDIRG(g, n, m, hi); const src = randInt(g, 1, n); let dst = randInt(g, 1, n); while (dst === src) dst = randInt(g, 1, n); return `${n} ${e.length}\n${e.map((x) => x.join(' ')).join('\n')}\n${src} ${dst} ${randInt(g, 0, kMax)}\n`; };
      for (const [n, m, hi, kMax] of [[5, 10, 9, 3], [10, 25, 100, 4], [40, 200, 1000, 10], [200, 1500, 1000000, 20], [500, 3000, 1000000000, 100], [500, 3000, 1000, 500], [500, 800, 1000, 500], [100, 3000, 5, 2]]) for (let t = 0; t < 2; t++) out.push(make(n, m, hi, kMax));
      out.push(`500 499\n${many(499, (i) => `${i + 1} ${i + 2} 1000000000`).join('\n')}\n1 500 498\n`, `500 499\n${many(499, (i) => `${i + 1} ${i + 2} 1000000000`).join('\n')}\n1 500 499\n`, `500 500\n${[...many(499, (i) => `${i + 1} ${i + 2} 1`), '1 500 600'].join('\n')}\n1 500 0\n`.replace('500 500\n', '500 500\n'));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `h` and `w`.', 'Each of the next `h` lines has `w` numbers: the heights of the cells of a row.'],
    constraints: ['1 <= h, w <= 100', '0 <= every height <= 10^9'],
    slug: 'path-with-minimum-effort',
    title: 'The Hike With the Smallest Steepest Step',
    tags: ['graph', 'grid', 'dijkstra', 'minimax'],
    concept: {
      title: 'Dijkstra works for any path cost that never decreases along the path, such as "the largest step so far"',
      body: [
        'A hiker walks from the top left to the bottom right cell of a map of heights, moving up, down, left or right. The *effort* of a path is the **largest height difference** between two neighbouring cells on it (the steepest single step). Find the path with the smallest effort. The sum of the steps does not matter, only the biggest one.',
        'Dijkstra\'s algorithm does not need the cost to be a sum. What it needs is that the cost of a path **never gets smaller** when the path is extended, and that the cost of reaching a node by a better path is never worse for what follows. Here the cost of a path is `max(steps)`: extending a path can only keep the maximum or raise it. So keep for each cell the smallest effort `best[cell]` with which it can be reached, and relax with `max` instead of `+`:',
        { code: 'best = [[INF] * w for _ in range(h)]\nbest[0][0] = 0\nheap = [(0, 0, 0)]                               # (effort, row, column)\nwhile heap:\n    effort, x, y = heappop(heap)\n    if effort > best[x][y]:\n        continue\n    for a, b in neighbours(x, y):\n        if inside(a, b):\n            cost = max(effort, abs(height[a][b] - height[x][y]))     # max, not +\n            if cost < best[a][b]:\n                best[a][b] = cost\n                heappush(heap, (cost, a, b))' },
        'This "minimise the worst edge on the path" problem (a *minimax* or *bottleneck* path) is also solvable by binary search on the answer plus a plain search, or by a spanning tree. The heap version is the shortest to write. The time is O(h * w * log(h * w)).'
      ]
    },
    statement: ['A grid of `h` rows and `w` columns gives the height of every cell. You walk from the top left cell to the bottom right cell, moving one step up, down, left or right at a time. The effort of a walk is the largest absolute difference of the heights of two cells that are neighbours on the walk. Print the smallest effort of a walk from the top left to the bottom right cell.'],
    outputFormat: ['Print the smallest effort.'],
    examples: [{ input: '3 3\n1 2 2\n3 8 2\n5 3 5\n', note: 'The walk 1, 3, 5, 3, 5 has the biggest step 2; no walk does better: 2.' }],
    hints: ['Use Dijkstra on the grid cells with a min-heap.', 'The cost of reaching a neighbour is the larger of the cost so far and the height difference of the step.', 'The answer is the best cost of the bottom right cell.'],
    program: {
      io: ['h:int w:int', 'a:int[h][w]'],
      fast: true,
      includes: ['<queue>', '<functional>', '<utility>', '<cstdlib>', '<algorithm>'],
      python: r`
        import heapq
        INF = 10 ** 18
        best = [[INF] * w for _ in range(h)]
        best[0][0] = 0
        heap = [(0, 0, 0)]
        while heap:
            effort, x, y = heapq.heappop(heap)
            if effort > best[x][y]:
                continue
            for p, q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= p < h and 0 <= q < w:
                    cost = max(effort, abs(a[p][q] - a[x][y]))
                    if cost < best[p][q]:
                        best[p][q] = cost
                        heapq.heappush(heap, (cost, p, q))
        print(best[h - 1][w - 1])`,
      cpp: r`
        const long long INF = 1000000000000000000LL;
        vector<vector<long long>> best(h, vector<long long>(w, INF));
        best[0][0] = 0;
        typedef pair<long long, pair<int, int>> Item;
        priority_queue<Item, vector<Item>, greater<Item>> heap;
        heap.push({0, {0, 0}});
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        while (!heap.empty()) {
            Item top = heap.top();
            heap.pop();
            long long effort = top.first;
            int x = top.second.first, y = top.second.second;
            if (effort > best[x][y]) continue;
            for (int d = 0; d < 4; d++) {
                int p = x + dx[d], q = y + dy[d];
                if (p >= 0 && p < h && q >= 0 && q < w) {
                    long long cost = max(effort, llabs(a[p][q] - a[x][y]));
                    if (cost < best[p][q]) {
                        best[p][q] = cost;
                        heap.push({cost, {p, q}});
                    }
                }
            }
        }
        cout << best[h - 1][w - 1] << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        long INF = 1000000000000000000L;
        long[][] best = new long[rowsCount][colsCount];
        for (long[] row : best) Arrays.fill(row, INF);
        best[0][0] = 0;
        PriorityQueue<long[]> heap = new PriorityQueue<>((u, v) -> Long.compare(u[0], v[0]));
        heap.add(new long[] {0, 0, 0});
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        while (!heap.isEmpty()) {
            long[] top = heap.poll();
            long effort = top[0];
            int x = (int) top[1], y = (int) top[2];
            if (effort > best[x][y]) continue;
            for (int d = 0; d < 4; d++) {
                int p = x + dx[d], q = y + dy[d];
                if (p >= 0 && p < rowsCount && q >= 0 && q < colsCount) {
                    long cost = Math.max(effort, Math.abs(a[p][q] - a[x][y]));
                    if (cost < best[p][q]) {
                        best[p][q] = cost;
                        heap.add(new long[] {cost, p, q});
                    }
                }
            }
        }
        System.out.println(best[rowsCount - 1][colsCount - 1]);`
    },
    solution: { explanation: ['Dijkstra on the grid with the cost "largest step so far": a neighbour is reached with max(effort, height difference), and the best cost of the bottom right cell is the answer.'], complexity: 'Time O(h * w * log(h * w)), space O(h * w).' },
    solve(input) {
      const rs = rows(input); const [h, w] = nums(rs[0]); const a = many(h, (i) => nums(rs[i + 1]));
      // binary search on the effort, with a plain search for each candidate (independent of the heap method)
      const ok = (limit) => { const seen = a.map((row) => row.map(() => false)); seen[0][0] = true; const st = [[0, 0]]; while (st.length) { const [x, y] = st.pop(); if (x === h - 1 && y === w - 1) return true; for (const [dx, dy] of DIRS) { const p = x + dx, q = y + dy; if (inside(h, w, p, q) && !seen[p][q] && Math.abs(a[p][q] - a[x][y]) <= limit) { seen[p][q] = true; st.push([p, q]); } } } return false; };
      let lo = 0, hi = 1000000000; while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (ok(mid)) hi = mid; else lo = mid + 1; } return String(lo);
    },
    tests() {
      const g = rng(964); const out = ['3 3\n1 2 2\n3 8 2\n5 3 5\n', '1 1\n5\n', '1 2\n1 100\n', '2 2\n1 5\n5 1\n'];
      const make = (h, w, hi) => `${h} ${w}\n${many(h, () => many(w, () => randInt(g, 0, hi)).join(' ')).join('\n')}\n`;
      const smooth = (h, w) => `${h} ${w}\n${many(h, (i) => many(w, (j) => Math.floor(100000 * (Math.sin(i / 9) + Math.cos(j / 6) + 2)) + randInt(g, 0, 50)).join(' ')).join('\n')}\n`;
      for (const [h, w, hi] of [[3, 4, 9], [8, 8, 100], [30, 40, 1000000], [100, 100, 1000000000], [100, 100, 10], [100, 100, 0], [1, 100, 1000], [100, 1, 1000]]) out.push(make(h, w, hi));
      out.push(smooth(60, 60), smooth(100, 100), `100 100\n${many(100, (i) => many(100, (j) => (i + j) * 1000).join(' ')).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: WDIR_INPUT,
    constraints: ['2 <= n <= 20000', '1 <= m <= 30000', '-10^9 <= w <= 10^9', 'The graph has no directed cycle.', 'There are no self-loops and no repeated edges.'],
    slug: 'shortest-path-in-a-dag',
    title: 'The Cheapest Route in an Acyclic Network (Costs Can Be Negative)',
    tags: ['graph', 'shortest-path', 'dag', 'dp', 'topological-sort'],
    concept: {
      title: 'In a DAG, relax the edges in topological order: this works even with negative weights',
      body: [
        'Dijkstra\'s algorithm needs non-negative weights. But if the graph has **no directed cycle**, an edge may cost less than zero (a refund, a downhill road) and the shortest path is still easy to find, with no heap. Process the nodes in a **topological order** (Kahn\'s algorithm): when a node `u` is processed, every edge into it has already been relaxed (all its predecessors come earlier in the order), so `dist[u]` is final, and it can be used to relax the edges out of `u`.',
        { code: 'dist = [INF] * (n + 1)\ndist[1] = 0\nfor u in topological_order:\n    if dist[u] < INF:\n        for v, w in adj[u]:\n            if dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w' },
        'Each edge is relaxed once, so the time is O(n + m), faster than Dijkstra. The same loop with `>` instead of `<` gives the longest path. With cycles and negative weights one needs Bellman-Ford (a later task). Note that the destination may be unreachable: print `unreachable`. The weights are up to 10^9 in absolute value and a path has up to 20000 edges, so use 64-bit integers.'
      ]
    },
    statement: ['A directed graph with `n` nodes and `m` weighted edges has no cycle; weights can be negative. Print the smallest total weight of a path from node 1 to node `n`, or `unreachable` if there is no such path.'],
    outputFormat: ['Print the smallest weight or `unreachable`.'],
    examples: [{ input: '4 4\n1 2 3\n1 3 2\n2 4 -5\n3 4 1\n', note: 'The path 1, 2, 4 weighs 3 - 5 = -2, and 1, 3, 4 weighs 3: -2.' }],
    hints: ['Compute a topological order with Kahn\'s algorithm.', 'Process the nodes in that order and relax their outgoing edges, skipping nodes that were not reached.', 'If the distance of node n is still infinite, print unreachable.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      python: J(WDIR.python, r`
        INF = 10 ** 18
        indeg = [0] * (n + 1)
        for u, v, w in edges:
            indeg[v] += 1
        order = [v for v in range(1, n + 1) if indeg[v] == 0]
        for u in order:
            for v, w in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    order.append(v)
        dist = [INF] * (n + 1)
        dist[1] = 0
        for u in order:
            if dist[u] < INF:
                for v, w in adj[u]:
                    if dist[u] + w < dist[v]:
                        dist[v] = dist[u] + w
        print(dist[n] if dist[n] < INF else "unreachable")`),
      cpp: J(WDIR.cpp, r`
        const long long INF = 1000000000000000000LL;
        vector<int> indeg(n + 1, 0), order;
        for (const vector<long long>& e : edges) indeg[e[1]]++;
        for (int v = 1; v <= n; v++) {
            if (indeg[v] == 0) order.push_back(v);
        }
        for (size_t i = 0; i < order.size(); i++) {
            for (const auto& edge : adj[order[i]]) {
                indeg[edge.first]--;
                if (indeg[edge.first] == 0) order.push_back(edge.first);
            }
        }
        vector<long long> dist(n + 1, INF);
        dist[1] = 0;
        for (int u : order) {
            if (dist[u] >= INF) continue;
            for (const auto& edge : adj[u]) {
                if (dist[u] + edge.second < dist[edge.first]) dist[edge.first] = dist[u] + edge.second;
            }
        }
        if (dist[n] < INF) cout << dist[n] << "\n";
        else cout << "unreachable\n";`),
      java: J(WDIR.java, r`
        long INF = 1000000000000000000L;
        int[] indeg = new int[nodes + 1];
        for (long[] e : edges) indeg[(int) e[1]]++;
        List<Integer> order = new ArrayList<>();
        for (int v = 1; v <= nodes; v++) {
            if (indeg[v] == 0) order.add(v);
        }
        for (int i = 0; i < order.size(); i++) {
            for (long[] edge : adj.get(order.get(i))) {
                int v = (int) edge[0];
                indeg[v]--;
                if (indeg[v] == 0) order.add(v);
            }
        }
        long[] dist = new long[nodes + 1];
        Arrays.fill(dist, INF);
        dist[1] = 0;
        for (int u : order) {
            if (dist[u] >= INF) continue;
            for (long[] edge : adj.get(u)) {
                int v = (int) edge[0];
                if (dist[u] + edge[1] < dist[v]) dist[v] = dist[u] + edge[1];
            }
        }
        System.out.println(dist[nodes] < INF ? String.valueOf(dist[nodes]) : "unreachable");`)
    },
    solution: { explanation: ['The nodes are processed in topological order; each reached node relaxes its outgoing edges, so every edge is relaxed once and negative weights cause no trouble in an acyclic graph.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges, true); const indeg = new Array(n + 1).fill(0); for (const [, v] of edges) indeg[v]++; const order = []; for (let v = 1; v <= n; v++) if (!indeg[v]) order.push(v);
      for (let h = 0; h < order.length; h++) for (const [v] of adj[order[h]]) if (--indeg[v] === 0) order.push(v);
      const dist = new Array(n + 1).fill(Infinity); dist[1] = 0; for (const u of order) if (dist[u] < Infinity) for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
      return dist[n] === Infinity ? 'unreachable' : String(dist[n]);
    },
    tests() {
      const g = rng(965); const out = ['4 4\n1 2 3\n1 3 2\n2 4 -5\n3 4 1\n', '2 1\n1 2 -7\n', '3 1\n2 3 1\n'];
      // a DAG in which node 1 comes first and node n comes last in the order, so that a route often exists; every second test also gets a spine 1 - 2 - ... - n
      let spineToggle = 0;
      const wdag = (n, m, lo, hi) => {
        const label = [0, 1, ...shuffle(g, many(n - 2, (i) => i + 2)), n]; const have = new Map(); const add = (a, b) => { if (!have.has(a * (n + 1) + b)) have.set(a * (n + 1) + b, [label[a], label[b], randInt(g, lo, hi)]); };
        if (spineToggle++ % 2 === 0) for (let i = 1; i < n; i++) add(i, i + 1);
        const cap = n * (n - 1) / 2; while (have.size < Math.min(m, cap)) { let a = randInt(g, 1, n), b = randInt(g, 1, n); if (a === b) continue; if (a > b) [a, b] = [b, a]; add(a, b); }
        const e = shuffle(g, [...have.values()]); return `${n} ${e.length}\n${e.map((x) => x.join(' ')).join('\n')}\n`;
      };
      const brute = (input) => { const { n, edges } = parse(input); const adj = adjacency(n, edges, true); const memo = new Map(); const go = (u) => { if (u === n) return 0; if (memo.has(u)) return memo.get(u); let best = Infinity; for (const [v, w] of adj[u]) best = Math.min(best, w + go(v)); memo.set(u, best); return best; }; const res = go(1); return res === Infinity ? 'unreachable' : String(res); };
      crossCheck(() => wdag(randInt(g, 2, 9), randInt(g, 1, 14), -9, 9), (i) => this.solve(i), brute, 300);
      for (const [n, m, lo, hi] of [[6, 9, -5, 9], [40, 120, -100, 1000], [1000, 3000, -1000000, 1000000], [20000, 30000, -1000000000, 1000000000], [20000, 30000, -1000000000, 0], [20000, 25000, 1, 1000000000], [20000, 20000, -3, 3]]) out.push(wdag(n, m, lo, hi));
      const chain = many(19999, (i) => [i + 1, i + 2, -1000000000]); out.push(`20000 19999\n${chain.map((x) => x.join(' ')).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `h` and `w`.', 'Each of the next `h` lines has `w` numbers: the cost of entering each cell of a row.'],
    constraints: ['1 <= h, w <= 200', '1 <= every cost <= 10^9'],
    slug: 'minimum-cost-grid-path',
    title: 'The Cheapest Walk Across a Toll Grid',
    tags: ['graph', 'grid', 'dijkstra', 'shortest-path'],
    concept: {
      title: 'Dijkstra on a grid: the cells are nodes, and the weight of a step is the cost of the cell you step on',
      body: [
        'Every cell of a grid has a toll that you pay each time you **enter** the cell (and also for the starting cell). You may move up, down, left and right. What is the cheapest walk from the top left to the bottom right cell? Because you can go in all four directions, the cheapest walk can go around a very expensive cell, or even backwards, so the simple "only right and down" dynamic programming is not enough.',
        'This is Dijkstra\'s algorithm on the grid graph. The node is the cell `(x, y)`, and the edge to a neighbour has the weight of the **neighbour\'s** cost. `dist[x][y]` is the cheapest total toll to be standing on that cell, including its own toll.',
        { code: 'dist[0][0] = cost[0][0]\nheap = [(cost[0][0], 0, 0)]\nwhile heap:\n    d, x, y = heappop(heap)\n    if d > dist[x][y]:\n        continue\n    for a, b in neighbours(x, y):\n        if inside(a, b) and d + cost[a][b] < dist[a][b]:\n            dist[a][b] = d + cost[a][b]\n            heappush(heap, (dist[a][b], a, b))' },
        'The grid has up to 40000 cells and 160000 directed edges, so the heap-based algorithm runs in O(h * w * log(h * w)). The total can reach about 4 * 10^13, so use 64-bit integers.'
      ]
    },
    statement: ['A grid of `h` rows and `w` columns gives the toll of every cell. You start on the top left cell and want to reach the bottom right cell, moving one step up, down, left or right at a time. You pay the toll of every cell you enter, and also the toll of the starting cell. Print the smallest total toll.'],
    outputFormat: ['Print the smallest toll.'],
    examples: [{ input: '3 3\n1 3 1\n1 5 1\n4 2 1\n', note: 'The walk 1, 3, 1, 1, 1 costs 7; going through the 5 costs more: 7.' }],
    hints: ['Use Dijkstra\'s algorithm with a heap of (cost so far, row, column).', 'The weight of a step is the toll of the cell you enter.', 'The start cell already costs its own toll.'],
    program: {
      io: ['h:int w:int', 'cost:int[h][w]'],
      fast: true,
      includes: ['<queue>', '<functional>', '<utility>'],
      python: r`
        import heapq
        INF = 10 ** 18
        dist = [[INF] * w for _ in range(h)]
        dist[0][0] = cost[0][0]
        heap = [(cost[0][0], 0, 0)]
        while heap:
            d, x, y = heapq.heappop(heap)
            if d > dist[x][y]:
                continue
            for p, q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= p < h and 0 <= q < w and d + cost[p][q] < dist[p][q]:
                    dist[p][q] = d + cost[p][q]
                    heapq.heappush(heap, (dist[p][q], p, q))
        print(dist[h - 1][w - 1])`,
      cpp: r`
        const long long INF = 1000000000000000000LL;
        vector<vector<long long>> dist(h, vector<long long>(w, INF));
        dist[0][0] = cost[0][0];
        typedef pair<long long, pair<int, int>> Item;
        priority_queue<Item, vector<Item>, greater<Item>> heap;
        heap.push({cost[0][0], {0, 0}});
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        while (!heap.empty()) {
            Item top = heap.top();
            heap.pop();
            int x = top.second.first, y = top.second.second;
            if (top.first > dist[x][y]) continue;
            for (int d = 0; d < 4; d++) {
                int p = x + dx[d], q = y + dy[d];
                if (p >= 0 && p < h && q >= 0 && q < w && top.first + cost[p][q] < dist[p][q]) {
                    dist[p][q] = top.first + cost[p][q];
                    heap.push({dist[p][q], {p, q}});
                }
            }
        }
        cout << dist[h - 1][w - 1] << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        long INF = 1000000000000000000L;
        long[][] dist = new long[rowsCount][colsCount];
        for (long[] row : dist) Arrays.fill(row, INF);
        dist[0][0] = cost[0][0];
        PriorityQueue<long[]> heap = new PriorityQueue<>((u, v) -> Long.compare(u[0], v[0]));
        heap.add(new long[] {cost[0][0], 0, 0});
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        while (!heap.isEmpty()) {
            long[] top = heap.poll();
            int x = (int) top[1], y = (int) top[2];
            if (top[0] > dist[x][y]) continue;
            for (int d = 0; d < 4; d++) {
                int p = x + dx[d], q = y + dy[d];
                if (p >= 0 && p < rowsCount && q >= 0 && q < colsCount && top[0] + cost[p][q] < dist[p][q]) {
                    dist[p][q] = top[0] + cost[p][q];
                    heap.add(new long[] {dist[p][q], p, q});
                }
            }
        }
        System.out.println(dist[rowsCount - 1][colsCount - 1]);`
    },
    solution: { explanation: ['Dijkstra on the grid graph where a step costs the toll of the cell entered; the distance of the bottom right cell, including the toll of the start, is the answer.'], complexity: 'Time O(h * w * log(h * w)), space O(h * w).' },
    solve(input) {
      const rs = rows(input); const [h, w] = nums(rs[0]); const c = many(h, (i) => nums(rs[i + 1])); const dist = c.map((row) => row.map(() => Infinity)); dist[0][0] = c[0][0]; const heap = new Heap((a, b) => a[0] < b[0]); heap.push([c[0][0], 0, 0]);
      while (heap.size) { const [d, x, y] = heap.pop(); if (d > dist[x][y]) continue; for (const [dx, dy] of DIRS) { const p = x + dx, q = y + dy; if (inside(h, w, p, q) && d + c[p][q] < dist[p][q]) { dist[p][q] = d + c[p][q]; heap.push([dist[p][q], p, q]); } } }
      return String(dist[h - 1][w - 1]);
    },
    tests() {
      const g = rng(966); const out = ['3 3\n1 3 1\n1 5 1\n4 2 1\n', '1 1\n9\n', '1 3\n1 1000000000 1\n', '2 2\n1 1000\n1000 1\n'];
      const make = (h, w, hi) => `${h} ${w}\n${many(h, () => many(w, () => randInt(g, 1, hi)).join(' ')).join('\n')}\n`;
      const brute = (input) => { const rs = rows(input); const [h, w] = nums(rs[0]); const c = many(h, (i) => nums(rs[i + 1])); const dist = c.map((row) => row.map(() => Infinity)); dist[0][0] = c[0][0]; let changed = true; while (changed) { changed = false; for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) for (const [dx, dy] of DIRS) { const p = x + dx, q = y + dy; if (inside(h, w, p, q) && dist[x][y] + c[p][q] < dist[p][q]) { dist[p][q] = dist[x][y] + c[p][q]; changed = true; } } } return String(dist[h - 1][w - 1]); };
      crossCheck(() => make(randInt(g, 1, 6), randInt(g, 1, 6), 20), (i) => this.solve(i), brute, 300);
      for (const [h, w, hi] of [[4, 5, 9], [12, 12, 100], [40, 60, 1000000], [200, 200, 1000000000], [200, 200, 3], [1, 200, 1000], [200, 1, 1000]]) out.push(make(h, w, hi));
      out.push(`200 200\n${many(200, (i) => many(200, (j) => ((i % 2 === 1) && ((i % 4 === 1 && j < 199) || (i % 4 === 3 && j > 0)) ? 1000000000 : 1)).join(' ')).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, `m` and `t`: the number of cities, the number of roads and the distance threshold.', 'Each of the next `m` lines has three numbers `u`, `v` and `w`: a two-way road of length `w` between the cities `u` and `v`.'],
    constraints: ['2 <= n <= 100', '1 <= m <= 4950', '1 <= w, t <= 10^6', 'There are no self-loops and no repeated roads.'],
    slug: 'city-with-fewest-neighbours',
    title: 'The Loneliest City',
    tags: ['graph', 'shortest-path', 'floyd-warshall'],
    concept: {
      title: 'Floyd-Warshall: all distances between all pairs of nodes, with three nested loops',
      body: [
        'Sometimes the distance between **every pair** of nodes is needed. Running Dijkstra from every node works, but for small `n` there is a shorter method, the *Floyd-Warshall algorithm*. Let `dist[i][j]` be the length of the best known route from `i` to `j`, at first the length of the road `i - j` (or infinity if none) and 0 for `i = j`. Then try each city `k` as a **stop on the way**: if going through `k` is shorter, use it.',
        { code: 'for k in range(n):\n    for i in range(n):\n        for j in range(n):\n            if dist[i][k] + dist[k][j] < dist[i][j]:\n                dist[i][j] = dist[i][k] + dist[k][j]' },
        'The order of the loops matters: **the stop `k` is the outermost loop**. After round `k`, `dist[i][j]` is the shortest route that uses only the cities `1..k` as stops. The time is O(n^3), fine for `n <= 100` (one million steps).',
        'Here, after computing the distances, count for every city `i` the number of other cities `j` with `dist[i][j] <= t` (the neighbours within the threshold). Print the city with the **fewest** such neighbours; if several cities tie, print the one with the **largest number**.'
      ]
    },
    statement: ['There are `n` cities and `m` two-way roads with lengths. A city `j` is a neighbour of the city `i` if the shortest route from `i` to `j` (over any roads) has the length at most `t`, `j != i`. Print the city that has the fewest neighbours; if several cities have the same smallest number, print the one with the largest number.'],
    outputFormat: ['Print the number of the city.'],
    examples: [{ input: '4 4 4\n1 2 3\n2 3 1\n2 4 4\n3 4 1\n', note: 'City 1 reaches 2 and 3 within 4; city 2 reaches 1, 3 and 4; city 3 reaches 1, 2 and 4; city 4 reaches 2 and 3. The cities 1 and 4 tie with two neighbours; the largest number is 4.' }],
    hints: ['Compute all pairs shortest distances with Floyd-Warshall (the intermediate city is the outer loop).', 'For each city count the other cities within distance t.', 'Choose the smallest count; on a tie choose the larger city number.'],
    program: {
      io: ['n:int m:int t:int', 'edges:int[m][3]'],
      fast: true,
      python: r`
        INF = 10 ** 18
        dist = [[INF] * n for _ in range(n)]
        for i in range(n):
            dist[i][i] = 0
        for u, v, w in edges:
            dist[u - 1][v - 1] = min(dist[u - 1][v - 1], w)
            dist[v - 1][u - 1] = min(dist[v - 1][u - 1], w)
        for k in range(n):
            for i in range(n):
                for j in range(n):
                    if dist[i][k] + dist[k][j] < dist[i][j]:
                        dist[i][j] = dist[i][k] + dist[k][j]
        best_city = -1
        best_count = n + 1
        for i in range(n):
            count = sum(1 for j in range(n) if j != i and dist[i][j] <= t)
            if count <= best_count:
                best_count = count
                best_city = i + 1
        print(best_city)`,
      cpp: r`
        const long long INF = 1000000000000000000LL;
        vector<vector<long long>> dist(n, vector<long long>(n, INF));
        for (int i = 0; i < n; i++) dist[i][i] = 0;
        for (const vector<long long>& e : edges) {
            dist[e[0] - 1][e[1] - 1] = min(dist[e[0] - 1][e[1] - 1], e[2]);
            dist[e[1] - 1][e[0] - 1] = min(dist[e[1] - 1][e[0] - 1], e[2]);
        }
        for (int k = 0; k < n; k++) {
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
        int bestCity = -1, bestCount = (int)n + 1;
        for (int i = 0; i < n; i++) {
            int count = 0;
            for (int j = 0; j < n; j++) {
                if (j != i && dist[i][j] <= t) count++;
            }
            if (count <= bestCount) {
                bestCount = count;
                bestCity = i + 1;
            }
        }
        cout << bestCity << "\n";`,
      java: r`
        int cities = (int) n;
        long INF = 1000000000000000000L;
        long[][] dist = new long[cities][cities];
        for (long[] row : dist) Arrays.fill(row, INF);
        for (int i = 0; i < cities; i++) dist[i][i] = 0;
        for (long[] e : edges) {
            int u = (int) e[0] - 1, v = (int) e[1] - 1;
            dist[u][v] = Math.min(dist[u][v], e[2]);
            dist[v][u] = Math.min(dist[v][u], e[2]);
        }
        for (int k = 0; k < cities; k++) {
            for (int i = 0; i < cities; i++) {
                for (int j = 0; j < cities; j++) {
                    if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
        int bestCity = -1, bestCount = cities + 1;
        for (int i = 0; i < cities; i++) {
            int count = 0;
            for (int j = 0; j < cities; j++) {
                if (j != i && dist[i][j] <= t) count++;
            }
            if (count <= bestCount) {
                bestCount = count;
                bestCity = i + 1;
            }
        }
        System.out.println(bestCity);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Floyd-Warshall computes all shortest distances (the intermediate city is the outer loop); for each city the cities within the threshold are counted and the city with the smallest count, the largest number on ties, is printed.'], complexity: 'Time O(n^3), space O(n^2).' },
    solve(input) {
      const rs = rows(input); const [n, m, t] = nums(rs[0]); const edges = many(m, (i) => nums(rs[i + 1])); const adj = adjacency(n, edges); let bestCity = -1, bestCount = n + 1;
      for (let i = 1; i <= n; i++) { const d = dijkstraSlow(adj, n, i); let count = 0; for (let j = 1; j <= n; j++) if (j !== i && d[j] <= t) count++; if (count <= bestCount) { bestCount = count; bestCity = i; } }
      return String(bestCity);
    },
    tests() {
      const g = rng(967); const out = ['4 4 4\n1 2 3\n2 3 1\n2 4 4\n3 4 1\n', '2 1 5\n1 2 5\n', '2 1 4\n1 2 5\n', '3 2 1\n1 2 1\n2 3 1\n'];
      const make = (n, m, hi, t) => { const e = WE(g, n, m, hi); return `${n} ${e.length} ${t}\n${e.map((x) => x.join(' ')).join('\n')}\n`; };
      for (const [n, m, hi, t] of [[5, 6, 9, 8], [10, 20, 20, 15], [30, 80, 100, 120], [60, 300, 1000, 1500], [100, 500, 1000000, 2000000], [100, 4950, 1000000, 600000], [100, 150, 1000, 800], [100, 99, 1000000, 1000000], [100, 600, 5, 4]]) out.push(make(n, m, hi, t));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: WDIR_INPUT,
    constraints: ['1 <= n <= 1000', '1 <= m <= 2500', '-1000 <= w <= 1000', 'There are no self-loops and no repeated edges.'],
    slug: 'negative-cycle-exists',
    title: 'Is There a Cycle That Pays You Back?',
    tags: ['graph', 'shortest-path', 'bellman-ford', 'cycle'],
    concept: {
      title: 'Bellman-Ford: if the distances still improve in round n, some cycle has a negative total weight',
      body: [
        'When edge weights can be **negative**, Dijkstra\'s algorithm fails. The *Bellman-Ford algorithm* repeats one simple step: go through all edges and relax each one (`dist[v] = min(dist[v], dist[u] + w)`). A shortest path without a cycle has at most `n - 1` edges, so after `n - 1` rounds all shortest distances are final, **if** there is no negative cycle.',
        'A *negative cycle* is a cycle whose weights add up to less than zero; going round it makes the walk cheaper again and again, so there is no shortest walk. Bellman-Ford detects it: if in round number `n` **some edge can still be relaxed**, the distances keep improving, which is only possible with a negative cycle.',
        'To look for a negative cycle **anywhere** in the graph (not only reachable from node 1), start with `dist[v] = 0` for **all** nodes, as if there were a hidden start node with a zero-weight edge to every node. Then run the rounds:',
        { code: 'dist = [0] * (n + 1)\nanswer = "no"\nfor round in range(n):\n    changed = False\n    for u, v, w in edges:\n        if dist[u] + w < dist[v]:\n            dist[v] = dist[u] + w\n            changed = True\n    if not changed:\n        break                          # settled: no negative cycle\n    if round == n - 1:\n        answer = "yes"                 # still changing in the n-th round' },
        'The time is O(n * m); with `n <= 1000` and `m <= 2500` that is 2.5 million steps, and the early stop makes ordinary graphs much faster.'
      ]
    },
    statement: ['A directed graph has `n` nodes and `m` weighted edges; weights can be negative. A negative cycle is a directed cycle whose weights add up to less than 0. Print `yes` if the graph contains a negative cycle (anywhere) and `no` otherwise.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '3 3\n1 2 1\n2 3 -1\n3 1 -1\n', note: 'The cycle 1, 2, 3, 1 adds up to -1: yes.' }, { input: '3 3\n1 2 1\n2 3 -1\n3 1 1\n', note: 'The cycle adds up to 1: no.' }],
    hints: ['Start with distance 0 for every node, so that cycles anywhere are found.', 'Repeat n rounds of relaxing every edge.', 'If the n-th round still changes something, there is a negative cycle.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      python: r`
        dist = [0] * (n + 1)
        answer = "no"
        for round_number in range(n):
            changed = False
            for u, v, w in edges:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    changed = True
            if not changed:
                break
            if round_number == n - 1:
                answer = "yes"
        print(answer)`,
      cpp: r`
        vector<long long> dist(n + 1, 0);
        bool negative = false;
        for (long long round = 0; round < n; round++) {
            bool changed = false;
            for (const vector<long long>& e : edges) {
                if (dist[e[0]] + e[2] < dist[e[1]]) {
                    dist[e[1]] = dist[e[0]] + e[2];
                    changed = true;
                }
            }
            if (!changed) break;
            if (round == n - 1) negative = true;
        }
        cout << (negative ? "yes" : "no") << "\n";`,
      java: r`
        long[] dist = new long[(int) n + 1];
        boolean negative = false;
        for (long round = 0; round < n; round++) {
            boolean changed = false;
            for (long[] e : edges) {
                if (dist[(int) e[0]] + e[2] < dist[(int) e[1]]) {
                    dist[(int) e[1]] = dist[(int) e[0]] + e[2];
                    changed = true;
                }
            }
            if (!changed) break;
            if (round == n - 1) negative = true;
        }
        System.out.println(negative ? "yes" : "no");`
    },
    solution: { explanation: ['Bellman-Ford starting with distance 0 at every node: if the edges can still be relaxed in the n-th round, a negative cycle exists; if a round changes nothing, none exists.'], complexity: 'Time O(n * m), space O(n).' },
    solve(input) {
      const { n, edges } = parse(input);
      // a negative cycle exists when the Floyd-Warshall distance of some node to itself becomes negative (checked for small graphs by brute force, otherwise by Bellman-Ford)
      const dist = new Array(n + 1).fill(0); for (let round = 0; round < n; round++) { let changed = false; for (const [u, v, w] of edges) if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; changed = true; } if (!changed) return 'no'; } return 'yes';
    },
    tests() {
      const g = rng(968); const out = ['3 3\n1 2 1\n2 3 -1\n3 1 -1\n', '3 3\n1 2 1\n2 3 -1\n3 1 1\n', '2 1\n1 2 -5\n', '2 2\n1 2 -5\n2 1 5\n'];
      const rnd = (n, m, lo, hi) => { const e = shuffle(g, randomDirected(g, n, m, [lo, hi])); return `${n} ${e.length}\n${e.map((x) => x.join(' ')).join('\n')}\n`; };
      const brute = (input) => { const { n, edges } = parse(input); const d = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(Infinity)); for (let i = 1; i <= n; i++) d[i][i] = 0; for (const [u, v, w] of edges) d[u][v] = Math.min(d[u][v], w); for (let k = 1; k <= n; k++) for (let i = 1; i <= n; i++) for (let j = 1; j <= n; j++) if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j]; for (let i = 1; i <= n; i++) if (d[i][i] < 0) return 'yes'; return 'no'; };
      crossCheck(() => rnd(randInt(g, 2, 7), randInt(g, 1, 12), -4, 9), (i) => this.solve(i), brute, 400);
      for (const [n, m, lo, hi] of [[6, 10, -3, 20], [30, 80, -5, 50], [200, 500, -10, 1000], [1000, 2500, -1, 1000], [1000, 2500, -1000, 1000], [1000, 1500, 0, 1000], [1000, 2500, -1000, -1]]) for (let t = 0; t < 2; t++) out.push(rnd(n, m, lo, hi));
      // a long chain of negative edges (no cycle), and the same chain closed by a cheap edge back to the start
      const chain = many(999, (i) => `${i + 1} ${i + 2} -1`); out.push(`1000 999\n${chain.join('\n')}\n`, `1000 1000\n${[...chain, '1000 1 500'].join('\n')}\n`, `1000 1000\n${[...chain, '1000 1 998'].join('\n')}\n`, `1000 1000\n${[...chain, '1000 1 999'].join('\n')}\n`);
      return out;
    }
  },

  {
    ...weightedUndirected,
    slug: 'count-shortest-paths',
    title: 'How Many Shortest Routes Are There?',
    tags: ['graph', 'shortest-path', 'dijkstra', 'counting', 'modular-arithmetic'],
    concept: {
      title: 'Count the ways while Dijkstra settles the nodes: equal distances add up their counts',
      body: [
        'There may be several **different** routes of the same shortest length. How many are there from town 1 to town `n`? Their number can be huge, so it is printed modulo 1000000007 (when the exact value is not needed this is the common way).',
        'Extend Dijkstra\'s algorithm with a second table, `ways[v]`: the number of shortest routes from town 1 to `v`. When an edge `u - v` of weight `w` is relaxed there are three cases:',
        '- `dist[u] + w < dist[v]`: a **shorter** route to `v` was found, so the old routes no longer count: `dist[v]` is updated and `ways[v] = ways[u]`;\n- `dist[u] + w == dist[v]`: another route of the **same** length: `ways[v] += ways[u]`;\n- otherwise nothing changes.',
        { code: 'dist[1], ways[1] = 0, 1\nwhile heap:\n    d, u = heappop(heap)\n    if d > dist[u]:\n        continue\n    for v, w in adj[u]:\n        if d + w < dist[v]:\n            dist[v] = d + w\n            ways[v] = ways[u]                 # a better route: forget the old count\n            heappush(heap, (dist[v], v))\n        elif d + w == dist[v]:\n            ways[v] = (ways[v] + ways[u]) % MOD' },
        'This works because all weights are positive: when `u` is taken from the heap, `ways[u]` is final (every shortest route to `u` ends with an edge from a node that was settled earlier). With zero-weight edges the counts could be wrong, which is why the weights are at least 1. If the town `n` cannot be reached, print -1.'
      ]
    },
    statement: ['A road network has `n` towns and `m` two-way roads with positive lengths. Print the number of different shortest routes from town 1 to town `n`, modulo 1000000007 (two routes are different if they use different sequences of roads), or -1 if town `n` cannot be reached.'],
    outputFormat: ['Print the number of shortest routes modulo 1000000007, or -1.'],
    examples: [{ input: '4 4\n1 2 1\n1 3 1\n2 4 1\n3 4 1\n', note: 'The routes 1, 2, 4 and 1, 3, 4 both have the length 2: 2.' }],
    hints: ['Keep a table with the number of shortest routes to every town.', 'When a shorter distance is found, copy the count; when an equal distance is found, add the counts.', 'Take the counts modulo 1000000007.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      includes: ['<queue>', '<functional>', '<utility>'],
      python: J(WADJ.python, r`
        import heapq
        MOD = 1000000007
        INF = 10 ** 18
        dist = [INF] * (n + 1)
        ways = [0] * (n + 1)
        dist[1] = 0
        ways[1] = 1
        heap = [(0, 1)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > dist[u]:
                continue
            for v, w in adj[u]:
                if d + w < dist[v]:
                    dist[v] = d + w
                    ways[v] = ways[u]
                    heapq.heappush(heap, (dist[v], v))
                elif d + w == dist[v]:
                    ways[v] = (ways[v] + ways[u]) % MOD
        print(ways[n] % MOD if dist[n] < INF else -1)`),
      cpp: J(WADJ.cpp, r`
        const long long MOD = 1000000007LL, INF = 1000000000000000000LL;
        vector<long long> dist(n + 1, INF), ways(n + 1, 0);
        dist[1] = 0;
        ways[1] = 1;
        priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> heap;
        heap.push({0, 1});
        while (!heap.empty()) {
            pair<long long, int> top = heap.top();
            heap.pop();
            int u = top.second;
            if (top.first > dist[u]) continue;
            for (const auto& edge : adj[u]) {
                int v = edge.first;
                long long next = top.first + edge.second;
                if (next < dist[v]) {
                    dist[v] = next;
                    ways[v] = ways[u];
                    heap.push({next, v});
                } else if (next == dist[v]) {
                    ways[v] = (ways[v] + ways[u]) % MOD;
                }
            }
        }
        cout << (dist[n] < INF ? ways[n] % MOD : -1) << "\n";`),
      java: J(WADJ.java, r`
        long MOD = 1000000007L, INF = 1000000000000000000L;
        long[] dist = new long[nodes + 1];
        long[] ways = new long[nodes + 1];
        Arrays.fill(dist, INF);
        dist[1] = 0;
        ways[1] = 1;
        PriorityQueue<long[]> heap = new PriorityQueue<>((p, q) -> Long.compare(p[0], q[0]));
        heap.add(new long[] {0, 1});
        while (!heap.isEmpty()) {
            long[] top = heap.poll();
            int u = (int) top[1];
            if (top[0] > dist[u]) continue;
            for (long[] edge : adj.get(u)) {
                int v = (int) edge[0];
                long next = top[0] + edge[1];
                if (next < dist[v]) {
                    dist[v] = next;
                    ways[v] = ways[u];
                    heap.add(new long[] {next, v});
                } else if (next == dist[v]) {
                    ways[v] = (ways[v] + ways[u]) % MOD;
                }
            }
        }
        System.out.println(dist[nodes] < INF ? ways[nodes] % MOD : -1);`)
    },
    solution: { explanation: ['Dijkstra\'s algorithm with a second table: a shorter route to a town copies the count of the previous town, an equally long route adds it. The count of town n is printed modulo 1000000007, or -1 if it is not reached.'], complexity: 'Time O((n + m) log n), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges); const MOD = 1000000007n; const dist = new Array(n + 1).fill(Infinity), ways = new Array(n + 1).fill(0n); dist[1] = 0; ways[1] = 1n; const heap = new Heap((a, b) => a[0] < b[0]); heap.push([0, 1]);
      while (heap.size) { const [d, u] = heap.pop(); if (d > dist[u]) continue; for (const [v, w] of adj[u]) { if (d + w < dist[v]) { dist[v] = d + w; ways[v] = ways[u]; heap.push([d + w, v]); } else if (d + w === dist[v]) ways[v] = (ways[v] + ways[u]) % MOD; } }
      return dist[n] === Infinity ? '-1' : String(ways[n] % MOD);
    },
    tests() {
      const g = rng(969); const out = ['4 4\n1 2 1\n1 3 1\n2 4 1\n3 4 1\n', '2 1\n2 1 5\n', '3 1\n1 2 1\n'];
      const brute = (input) => { const { n, edges } = parse(input); const adj = adjacency(n, edges); const d = dijkstraSlow(adj, n, 1); if (d[n] === Infinity) return '-1'; // count paths by depth-first search over the shortest-path edges
        const memo = new Map(); const go = (u) => { if (u === n) return 1n; if (memo.has(u)) return memo.get(u); let c = 0n; for (const [v, w] of adj[u]) if (d[u] + w === d[v]) c += go(v); memo.set(u, c); return c; }; return String(go(1) % 1000000007n); };
      crossCheck(() => { const n = randInt(g, 2, 9); return graphText(n, WE(g, n, randInt(g, 1, Math.min(16, n * (n - 1) / 2)), 3)); }, (i) => this.solve(i), brute, 300);
      for (const [n, m, hi] of [[8, 14, 3], [60, 200, 4], [1000, 5000, 3], [20000, 30000, 3], [20000, 30000, 1], [20000, 25000, 1000000000], [300, 30000, 2]]) out.push(graphText(n, WE(g, n, m, hi)));
      // a ladder: many equally short routes (2^k of them), so the count needs the modulus
      const diamonds = 5000; const chain = []; for (let i = 0; i < diamonds; i++) { const a = i === 0 ? 1 : 3 * i + 1, b1 = 3 * i + 2, b2 = 3 * i + 3, c = 3 * i + 4; chain.push([a, b1, 1], [a, b2, 1], [b1, c, 1], [b2, c, 1]); }
      out.push(graphText(3 * diamonds + 1, mix(g, chain)));
      return out;
    }
  }
];
