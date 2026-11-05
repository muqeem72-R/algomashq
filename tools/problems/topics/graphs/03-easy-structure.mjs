import { r, rng, randInt, many, nums, rows, shuffle } from '../../lib.mjs';
import { graphText, randomEdges, randomTreeEdges, connectedEdges, randomDirected, randomDag, adjacency, components, bfsDistances, mix } from '../../graphlib.mjs';
import { J, ADJ, DIR, EDGE_INPUT, DIR_INPUT, EDGE_LIMITS } from '../../graphcode.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const easy = { difficulty: 'easy' };
const edgesIn = { ...easy, inputFormat: EDGE_INPUT, constraints: EDGE_LIMITS };
const parse = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); return { n, m, edges: many(m, (i) => nums(rs[i + 1])), rs }; };
const E = (g, n, m) => mix(g, randomEdges(g, n, m));
const shapes = (g) => [
  [2, [[1, 2]]], [5, [[1, 2], [2, 3], [4, 5]]], [8, E(g, 8, 6)], [30, E(g, 30, 25)], [200, E(g, 200, 150)], [1000, E(g, 1000, 800)],
  [20000, E(g, 20000, 5000)], [20000, E(g, 20000, 30000)], [20000, mix(g, randomTreeEdges(g, 20000, 'path'))], [20000, mix(g, randomTreeEdges(g, 20000, 'star'))],
  [20000, connectedEdges(g, 20000, 10000)], [300, E(g, 300, 30000)]
];
// graphs with at most 2000 nodes (for the tasks that compare neighbour lists)
const medium = (g) => [
  [3, [[1, 2], [2, 3]]], [5, [[1, 2], [1, 3], [2, 3], [2, 4], [3, 4], [4, 5]]], [10, E(g, 10, 20)], [60, E(g, 60, 300)], [300, E(g, 300, 3000)], [2000, E(g, 2000, 20000)], [2000, E(g, 2000, 2500)],
  [2000, mix(g, randomTreeEdges(g, 2000, 'star'))], [2000, mix(g, randomTreeEdges(g, 2000, 'path'))],
  [250, mix(g, [...many(200, (i) => i + 1).flatMap((u) => many(200 - u, (k) => [u, u + k + 1])), [201, 202], [202, 203]])]
];
const SMALL = (g) => { const n = randInt(g, 2, 9); return [n, E(g, n, randInt(g, 1, n * (n - 1) / 2))]; };
const key = (n, u, v) => Math.min(u, v) * (n + 1) + Math.max(u, v);
const adjSets = (n, edges) => { const a = Array.from({ length: n + 1 }, () => new Set()); for (const [u, v] of edges) { a[u].add(v); a[v].add(u); } return a; };

export default [
  {
    ...edgesIn,
    slug: 'euler-circuit-exists',
    title: 'Walk Along Every Road Exactly Once',
    tags: ['graph', 'euler', 'degree', 'connected-components'],
    concept: {
      title: 'Euler: a closed walk that uses every edge once exists when all degrees are even and the edges are connected',
      body: [
        'The seven bridges of Königsberg started graph theory. Is there a walk that uses **every edge exactly once** and ends where it began (an *Euler circuit*)? Euler found a simple rule. Every time the walk passes through a node, it enters by one edge and leaves by another, so it uses the edges of that node **in pairs**: the node must have an **even degree**. The start node is also left once and entered once at the end. So **all degrees must be even**.',
        'That is also enough, with one more condition: all the edges must belong to **one connected piece**. (Isolated nodes without edges do not matter, because the walk has no business there.) Two separate triangles have all degrees even, but one walk cannot visit both.',
        { code: 'degree = [0] * (n + 1)\nfor u, v in edges:\n    degree[u] += 1\n    degree[v] += 1\nall_even = all(d % 2 == 0 for d in degree)\n\n# search from the end of any edge and count the nodes with edges that were reached\nreached = ...   # nodes with degree > 0 reached from edges[0][0]\nwanted = sum(1 for d in degree if d > 0)\nanswer = all_even and reached == wanted' },
        'The check costs O(n + m). Finding the circuit itself (Hierholzer\'s algorithm) is a harder task of this topic; here only its existence is asked, which shows how a global property can follow from a local one (the degrees).'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m >= 1` edges. Is there a closed walk that uses every edge exactly once? (A node can be visited many times.) Print `yes` or `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '3 3\n1 2\n2 3\n3 1\n', note: 'The triangle: walk 1, 2, 3, 1: yes.' }, { input: '6 6\n1 2\n2 3\n3 1\n4 5\n5 6\n6 4\n', note: 'Two separate triangles: every degree is even, but one walk cannot cover both: no.' }],
    hints: ['Compute the degrees: all of them must be even.', 'The edges must be connected: search from one end of the first edge and count the reached nodes that have edges.', 'Compare with the number of nodes that have at least one edge.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: J(ADJ.python, r`
        degree = [len(adj[v]) for v in range(n + 1)]
        ok = all(d % 2 == 0 for d in degree)
        if ok:
            seen = [False] * (n + 1)
            start = edges[0][0]
            seen[start] = True
            queue = [start]
            for v in queue:
                for w in adj[v]:
                    if not seen[w]:
                        seen[w] = True
                        queue.append(w)
            ok = len(queue) == sum(1 for d in degree if d > 0)
        print("yes" if ok else "no")`),
      cpp: J(ADJ.cpp, r`
        bool ok = true;
        long long withEdges = 0;
        for (int v = 1; v <= n; v++) {
            if (adj[v].size() % 2 != 0) ok = false;
            if (!adj[v].empty()) withEdges++;
        }
        if (ok) {
            vector<char> seen(n + 1, 0);
            int start = (int)edges[0][0];
            seen[start] = 1;
            vector<int> queue = {start};
            for (size_t i = 0; i < queue.size(); i++) {
                for (int w : adj[queue[i]]) {
                    if (!seen[w]) {
                        seen[w] = 1;
                        queue.push_back(w);
                    }
                }
            }
            ok = ((long long)queue.size() == withEdges);
        }
        cout << (ok ? "yes" : "no") << "\n";`),
      java: J(ADJ.java, r`
        boolean ok = true;
        int withEdges = 0;
        for (int v = 1; v <= nodes; v++) {
            if (adj.get(v).size() % 2 != 0) ok = false;
            if (!adj.get(v).isEmpty()) withEdges++;
        }
        if (ok) {
            boolean[] seen = new boolean[nodes + 1];
            int start = (int) edges[0][0];
            seen[start] = true;
            List<Integer> queue = new ArrayList<>();
            queue.add(start);
            for (int i = 0; i < queue.size(); i++) {
                for (int w : adj.get(queue.get(i))) {
                    if (!seen[w]) {
                        seen[w] = true;
                        queue.add(w);
                    }
                }
            }
            ok = (queue.size() == withEdges);
        }
        System.out.println(ok ? "yes" : "no");`)
    },
    solution: { explanation: ['An Euler circuit exists exactly when every degree is even and all the nodes that have edges are connected: the degrees are checked, then a search from the end of the first edge must reach all nodes with degree above zero.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const d = new Array(n + 1).fill(0); for (const [u, v] of edges) { d[u]++; d[v]++; } if (d.some((x) => x % 2)) return 'no';
      const dist = bfsDistances(adjacency(n, edges), n, edges[0][0]); for (let v = 1; v <= n; v++) if (d[v] > 0 && dist[v] < 0) return 'no'; return 'yes';
    },
    tests() {
      const g = rng(921); const out = ['3 3\n1 2\n2 3\n3 1\n', '6 6\n1 2\n2 3\n3 1\n4 5\n5 6\n6 4\n', '3 2\n1 2\n2 3\n'];
      // graphs with all degrees even: the sum (xor) of random cycles
      const even = (n, cycles, maxLen) => { const have = new Set(); for (let c = 0; c < cycles; c++) { const k = randInt(g, 3, Math.min(n, maxLen)); const nodes = shuffle(g, many(n, (i) => i + 1)).slice(0, k); for (let i = 0; i < k; i++) { const kk = key(n, nodes[i], nodes[(i + 1) % k]); if (have.has(kk)) have.delete(kk); else have.add(kk); } } return [...have].map((x) => [Math.floor(x / (n + 1)), x % (n + 1)]); };
      for (const [n, c, len] of [[6, 2, 4], [10, 3, 5], [30, 6, 10], [200, 30, 40], [3000, 600, 30], [20000, 2000, 12], [20000, 3500, 8]]) { let e = even(n, c, len); if (!e.length) e = [[1, 2], [2, 3], [3, 1]]; out.push(graphText(n, mix(g, e))); }
      const cyc = (k, off) => many(k, (i) => [off + i + 1, off + ((i + 1) % k) + 1]);
      out.push(graphText(20000, cyc(20000, 0)), graphText(20000, [...cyc(10000, 0), ...cyc(10000, 10000)]), graphText(20000, [...cyc(19999, 0), [20000, 1]]), graphText(9, [...cyc(4, 0), ...cyc(5, 4)]), graphText(7, [...cyc(4, 0), [4, 1]]));
      for (const [n, e] of shapes(g).slice(0, 8)) out.push(graphText(n, e));
      return out;
    }
  },

  {
    ...edgesIn,
    slug: 'connect-the-network',
    title: 'Move the Cables to Connect All Computers',
    tags: ['graph', 'union-find', 'connected-components'],
    concept: {
      title: 'Each move can join two groups, and a spare cable is any cable that closes a cycle',
      body: [
        'A network has `n` computers and `m` cables, each cable joining two computers. In one move you can take a cable (it stays attached to nothing meanwhile) and plug it between **any** two computers. What is the fewest moves needed so that every computer can reach every other one?',
        'Think in components. If the network falls into `c` groups, you must join them, and joining two groups needs one cable, so you need at least `c - 1` moves. Are there enough cables? A connected network of `n` computers needs `n - 1` cables at least. If `m < n - 1`, there are not enough cables at all: print -1. If `m >= n - 1`, there are always enough **spare** cables (cables that sit on a cycle inside a group and can be removed without splitting the group), so exactly `c - 1` moves are enough.',
        { code: 'if m < n - 1:\n    answer = -1\nelse:\n    answer = components - 1' },
        'Counting the components is the task you already know (a search or union-find). The reasoning, "a lower bound plus a construction that reaches it", is the typical way to solve this kind of problem without simulating the moves.'
      ]
    },
    statement: ['A network has `n` computers (numbered 1 to n) and `m` cables; a cable joins two computers. In one move you can take any cable and plug it between any two computers instead. Print the smallest number of moves after which every computer can reach every other one, or -1 if it is impossible.'],
    outputFormat: ['Print the number of moves or -1.'],
    examples: [{ input: '6 5\n1 2\n1 3\n2 3\n4 5\n5 6\n', note: 'There are two groups, {1, 2, 3} and {4, 5, 6}. The cable 2-3 is spare; move it to join the groups: 1.' }, { input: '6 3\n1 2\n2 3\n4 5\n', note: 'Five cables are needed to connect six computers, but there are only 3: -1.' }],
    hints: ['Count the components.', 'Connecting c components needs c - 1 cables, and the whole network needs at least n - 1 cables.', 'If m < n - 1 print -1, otherwise print c - 1.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: J(ADJ.python, r`
        if m < n - 1:
            print(-1)
        else:
            seen = [False] * (n + 1)
            groups = 0
            for start in range(1, n + 1):
                if seen[start]:
                    continue
                groups += 1
                seen[start] = True
                queue = [start]
                for v in queue:
                    for w in adj[v]:
                        if not seen[w]:
                            seen[w] = True
                            queue.append(w)
            print(groups - 1)`),
      cpp: J(ADJ.cpp, r`
        if (m < n - 1) {
            cout << -1 << "\n";
        } else {
            vector<char> seen(n + 1, 0);
            int groups = 0;
            for (int start = 1; start <= n; start++) {
                if (seen[start]) continue;
                groups++;
                seen[start] = 1;
                vector<int> queue = {start};
                for (size_t i = 0; i < queue.size(); i++) {
                    for (int w : adj[queue[i]]) {
                        if (!seen[w]) {
                            seen[w] = 1;
                            queue.push_back(w);
                        }
                    }
                }
            }
            cout << groups - 1 << "\n";
        }`),
      java: J(ADJ.java, r`
        if (m < n - 1) {
            System.out.println(-1);
        } else {
            boolean[] seen = new boolean[nodes + 1];
            int groups = 0;
            for (int start = 1; start <= nodes; start++) {
                if (seen[start]) continue;
                groups++;
                seen[start] = true;
                List<Integer> queue = new ArrayList<>();
                queue.add(start);
                for (int i = 0; i < queue.size(); i++) {
                    for (int w : adj.get(queue.get(i))) {
                        if (!seen[w]) {
                            seen[w] = true;
                            queue.add(w);
                        }
                    }
                }
            }
            System.out.println(groups - 1);
        }`)
    },
    solution: { explanation: ['Connecting the network needs at least n - 1 cables; if there are fewer the answer is -1. Otherwise there are enough spare cables, and exactly (number of components - 1) moves are needed.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) { const { n, m, edges } = parse(input); return m < n - 1 ? '-1' : String(components(n, edges).count - 1); },
    tests() {
      const g = rng(922); const out = ['6 5\n1 2\n1 3\n2 3\n4 5\n5 6\n', '6 3\n1 2\n2 3\n4 5\n', '2 1\n1 2\n', '3 1\n1 2\n'];
      for (const [n, m] of [[5, 4], [5, 7], [30, 29], [30, 25], [30, 60], [1000, 999], [1000, 1500], [20000, 19999], [20000, 25000], [20000, 30000], [20000, 12000]]) out.push(graphText(n, E(g, n, m)));
      out.push(graphText(20000, mix(g, [...randomTreeEdges(g, 10000), ...randomTreeEdges(g, 10000).map(([u, v]) => [u + 10000, v + 10000])])), graphText(20000, mix(g, [...connectedEdges(g, 10000, 600), ...connectedEdges(g, 10000, 600).map(([u, v]) => [u + 10000, v + 10000])])));
      return out;
    }
  },

  {
    ...edgesIn,
    slug: 'adjacency-lists',
    title: 'Write the Neighbours of Every Node',
    tags: ['graph', 'adjacency-list', 'sorting'],
    concept: {
      title: 'The adjacency list is the most useful way to store a graph',
      body: [
        'An *edge list* (the input) is easy to read but slow to search: to find the neighbours of one node you would scan all `m` edges. The **adjacency list** keeps, for each node, the list of its neighbours, so the neighbours are found at once and a walk along the edges costs only O(n + m) in total. Other forms exist: the **adjacency matrix** (an `n x n` table with a 1 where an edge exists) answers "is there an edge between `u` and `v`?" in O(1) but needs `n * n` memory, which is far too much for 20000 nodes (400 million cells).',
        { code: 'adj = [[] for _ in range(n + 1)]\nfor u, v in edges:\n    adj[u].append(v)           # an undirected edge is stored at both ends\n    adj[v].append(u)\nfor v in range(1, n + 1):\n    adj[v].sort()\n    print(len(adj[v]), *adj[v])' },
        'The exercise is only to build the lists and print them, but it shows the representation that almost every later task starts with. The number of values on the line of a node is its degree, and the total number of values is `2 * m`.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. For each node 1, 2, ..., n print one line: its degree `k`, followed by its `k` neighbours in increasing order.'],
    outputFormat: ['`n` lines: the degree and the sorted neighbours of every node.'],
    examples: [{ input: '4 3\n1 2\n1 3\n3 4\n', note: 'Node 1 has the neighbours 2 and 3; node 2 has 1; node 3 has 1 and 4; node 4 has 3.' }],
    hints: ['Build a list of neighbours for every node; add each edge to both lists.', 'Sort every list.', 'Print the length of the list and then the list.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: J(ADJ.python, r`
        out = []
        for v in range(1, n + 1):
            adj[v].sort()
            out.append(" ".join(map(str, [len(adj[v])] + adj[v])))
        print("\n".join(out))`),
      cpp: J(ADJ.cpp, r`
        for (int v = 1; v <= n; v++) {
            sort(adj[v].begin(), adj[v].end());
            cout << adj[v].size();
            for (int w : adj[v]) cout << " " << w;
            cout << "\n";
        }`),
      java: J(ADJ.java, r`
        StringBuilder out = new StringBuilder();
        for (int v = 1; v <= nodes; v++) {
            Collections.sort(adj.get(v));
            out.append(adj.get(v).size());
            for (int w : adj.get(v)) out.append(" ").append(w);
            out.append("\n");
        }
        System.out.print(out);`)
    },
    solution: { explanation: ['The neighbour list of every node is built from the edges, sorted, and printed with its length in front.'], complexity: 'Time O(n + m log m), space O(n + m).' },
    solve(input) { const { n, edges } = parse(input); const adj = adjacency(n, edges); return many(n, (i) => { const l = adj[i + 1].sort((a, b) => a - b); return [l.length, ...l].join(' '); }).join('\n'); },
    tests() {
      const g = rng(923); const out = ['4 3\n1 2\n1 3\n3 4\n', '2 1\n2 1\n'];
      for (const [n, e] of shapes(g)) out.push(graphText(n, e));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: DIR_INPUT,
    constraints: ['2 <= n <= 20000', '1 <= m <= 30000', 'There are no self-loops and no repeated edges.'],
    slug: 'sources-and-sinks',
    title: 'Where Does the Flow Start and End?',
    tags: ['graph', 'directed-graph', 'degree'],
    concept: {
      title: 'A source has no incoming edge, a sink has no outgoing edge',
      body: [
        'In a directed graph the **in-degree** of a node counts the edges that end at it and the **out-degree** counts the edges that start at it. A **source** is a node with in-degree 0: nothing flows into it, so it is where things start (a task with no prerequisite, a river spring). A **sink** is a node with out-degree 0: nothing flows out of it (a final result, the sea). A node with no edges at all is both.',
        { code: 'in_degree = [0] * (n + 1)\nout_degree = [0] * (n + 1)\nfor u, v in edges:\n    out_degree[u] += 1\n    in_degree[v] += 1\nsources = sum(1 for v in range(1, n + 1) if in_degree[v] == 0)\nsinks = sum(1 for v in range(1, n + 1) if out_degree[v] == 0)' },
        'Sources are the starting points of a topological order (the next tasks use the in-degrees to process a graph layer by layer). It is a good habit to count both degrees in the same loop over the edges.'
      ]
    },
    statement: ['A directed graph has `n` nodes and `m` edges; an edge `u v` goes from `u` to `v`. A source is a node with no incoming edge and a sink is a node with no outgoing edge (a node without edges is both). Print the number of sources and the number of sinks.'],
    outputFormat: ['Print two numbers: the number of sources and the number of sinks.'],
    examples: [{ input: '5 3\n1 2\n1 3\n3 4\n', note: 'Sources: 1 and 5. Sinks: 2, 4 and 5. The answer is 2 3.' }],
    hints: ['Count the in-degree and the out-degree of every node.', 'A source has in-degree 0, a sink has out-degree 0.', 'A node with no edges counts in both.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: r`
        in_degree = [0] * (n + 1)
        out_degree = [0] * (n + 1)
        for u, v in edges:
            out_degree[u] += 1
            in_degree[v] += 1
        sources = sum(1 for v in range(1, n + 1) if in_degree[v] == 0)
        sinks = sum(1 for v in range(1, n + 1) if out_degree[v] == 0)
        print(sources, sinks)`,
      cpp: r`
        vector<long long> inDegree(n + 1, 0), outDegree(n + 1, 0);
        for (const vector<long long>& e : edges) {
            outDegree[e[0]]++;
            inDegree[e[1]]++;
        }
        long long sources = 0, sinks = 0;
        for (int v = 1; v <= n; v++) {
            if (inDegree[v] == 0) sources++;
            if (outDegree[v] == 0) sinks++;
        }
        cout << sources << " " << sinks << "\n";`,
      java: r`
        long[] inDegree = new long[(int) n + 1];
        long[] outDegree = new long[(int) n + 1];
        for (long[] e : edges) {
            outDegree[(int) e[0]]++;
            inDegree[(int) e[1]]++;
        }
        long sources = 0, sinks = 0;
        for (int v = 1; v <= n; v++) {
            if (inDegree[v] == 0) sources++;
            if (outDegree[v] == 0) sinks++;
        }
        System.out.println(sources + " " + sinks);`
    },
    solution: { explanation: ['In-degrees and out-degrees are counted in one pass over the edges; sources have in-degree 0 and sinks have out-degree 0.'], complexity: 'Time O(n + m), space O(n).' },
    solve(input) { const { n, edges } = parse(input); const a = new Array(n + 1).fill(0), b = new Array(n + 1).fill(0); for (const [u, v] of edges) { b[u]++; a[v]++; } let s = 0, t = 0; for (let v = 1; v <= n; v++) { if (!a[v]) s++; if (!b[v]) t++; } return `${s} ${t}`; },
    tests() {
      const g = rng(924); const out = ['5 3\n1 2\n1 3\n3 4\n', '2 1\n2 1\n', '3 1\n1 2\n'];
      for (const [n, m] of [[5, 6], [30, 40], [1000, 900], [20000, 5000], [20000, 30000]]) { out.push(graphText(n, shuffle(g, randomDag(g, n, m)))); out.push(graphText(n, shuffle(g, randomDirected(g, n, m)))); }
      return out;
    }
  },

  {
    ...edgesIn,
    slug: 'graph-is-a-simple-path',
    title: 'Is the Graph One Straight Path?',
    tags: ['graph', 'degree', 'connected-components'],
    concept: {
      title: 'A path through all nodes: connected, n - 1 edges, and no node with more than two neighbours',
      body: [
        'A *simple path* through all `n` nodes looks like `a - b - c - ... - z`: two end nodes of degree 1, and all the others of degree 2. Is the given graph exactly such a path? The graph must be a tree (connected, `n - 1` edges) and no node may have a degree above 2, which would be a branching point.',
        'These conditions are cheap to check: count the degrees, check `m == n - 1` and `max degree <= 2`, and check that the graph is connected (a search from node 1 reaches all nodes). A graph with `n - 1` edges and maximum degree 2 that is **not** connected consists of a path and a cycle (or of several pieces), which is why the connectivity test is needed.',
        { code: 'ok = (m == n - 1) and max(degree) <= 2\nif ok:\n    ok = (nodes reached by a search from node 1) == n' },
        'Another way to see it: such a graph is a tree whose all nodes have degree at most 2. The task trains reading a graph by its **degree sequence** plus one connectivity check.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. Print `yes` if its nodes can be arranged in a line so that the edges are exactly the pairs of neighbours in the line (the graph is a single path through all nodes), and `no` otherwise.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '4 3\n2 1\n3 2\n4 3\n', note: 'The nodes in a line: 1, 2, 3, 4: yes.' }, { input: '4 3\n1 2\n1 3\n1 4\n', note: 'Node 1 has three neighbours: no.' }],
    hints: ['A path of n nodes has n - 1 edges.', 'No node may have more than two neighbours.', 'Run a search from node 1 to check that the graph is connected.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: J(ADJ.python, r`
        ok = (m == n - 1) and all(len(adj[v]) <= 2 for v in range(1, n + 1))
        if ok:
            seen = [False] * (n + 1)
            seen[1] = True
            queue = [1]
            for v in queue:
                for w in adj[v]:
                    if not seen[w]:
                        seen[w] = True
                        queue.append(w)
            ok = len(queue) == n
        print("yes" if ok else "no")`),
      cpp: J(ADJ.cpp, r`
        bool ok = (m == n - 1);
        for (int v = 1; v <= n && ok; v++) {
            if (adj[v].size() > 2) ok = false;
        }
        if (ok) {
            vector<char> seen(n + 1, 0);
            seen[1] = 1;
            vector<int> queue = {1};
            for (size_t i = 0; i < queue.size(); i++) {
                for (int w : adj[queue[i]]) {
                    if (!seen[w]) {
                        seen[w] = 1;
                        queue.push_back(w);
                    }
                }
            }
            ok = ((long long)queue.size() == n);
        }
        cout << (ok ? "yes" : "no") << "\n";`),
      java: J(ADJ.java, r`
        boolean ok = (m == n - 1);
        for (int v = 1; v <= nodes && ok; v++) {
            if (adj.get(v).size() > 2) ok = false;
        }
        if (ok) {
            boolean[] seen = new boolean[nodes + 1];
            seen[1] = true;
            List<Integer> queue = new ArrayList<>();
            queue.add(1);
            for (int i = 0; i < queue.size(); i++) {
                for (int w : adj.get(queue.get(i))) {
                    if (!seen[w]) {
                        seen[w] = true;
                        queue.add(w);
                    }
                }
            }
            ok = (queue.size() == nodes);
        }
        System.out.println(ok ? "yes" : "no");`)
    },
    solution: { explanation: ['A path through all nodes has n - 1 edges, no node of degree above 2, and is connected; the three conditions are checked in that order.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) { const { n, m, edges } = parse(input); const d = new Array(n + 1).fill(0); for (const [u, v] of edges) { d[u]++; d[v]++; } return m === n - 1 && d.every((x) => x <= 2) && components(n, edges).count === 1 ? 'yes' : 'no'; },
    tests() {
      const g = rng(925); const out = ['4 3\n2 1\n3 2\n4 3\n', '4 3\n1 2\n1 3\n1 4\n', '2 1\n1 2\n'];
      for (const n of [3, 7, 100, 20000]) { out.push(graphText(n, mix(g, randomTreeEdges(g, n, 'path')))); out.push(graphText(n, mix(g, [...randomTreeEdges(g, n, 'path').slice(1), [1, n].sort((a, b) => a - b)]))); }
      for (const n of [6, 100, 20000]) { out.push(graphText(n, mix(g, randomTreeEdges(g, n, 'star')))); out.push(graphText(n, mix(g, randomTreeEdges(g, n, 'binary')))); }
      // a path plus a separate cycle: n - 1 edges, all degrees at most 2, but not connected
      for (const n of [7, 101, 20000]) { const k = Math.floor(n / 2); const path = many(k - 1, (i) => [i + 1, i + 2]); const rest = n - k; const cyc = many(rest, (i) => [k + i + 1, k + ((i + 1) % rest) + 1]); out.push(graphText(n, mix(g, [...path, ...cyc].slice(0, n - 1)))); }
      for (const [n, e] of shapes(g).slice(0, 6)) out.push(graphText(n, e));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: [...EDGE_INPUT, 'The next line has `q`, the number of questions.', 'Each of the next `q` lines has two different nodes `a` and `b`.'],
    constraints: ['2 <= n <= 2000', '1 <= m <= 20000', '1 <= q <= 2000', 'There are no self-loops and no repeated edges.'],
    slug: 'common-neighbours',
    title: 'Friends Two People Have in Common',
    tags: ['graph', 'adjacency-list', 'sets'],
    concept: {
      title: 'Store each neighbour list as a set, and a question becomes an intersection',
      body: [
        'In a friendship network the *mutual friends* of two people are the people who are friends with both. In graph terms: the **common neighbours** of `a` and `b`. With the adjacency lists as **sets**, this is just the **intersection** of two sets, and sets answer "is this a member?" in O(1). Python\'s `a & b` and C++\'s sorted-list merge both walk only through the smaller (or both) lists, so one question costs O(degree), much less than testing all `n` nodes.',
        { code: 'neighbours = [set() for _ in range(n + 1)]\nfor u, v in edges:\n    neighbours[u].add(v)\n    neighbours[v].add(u)\nfor a, b in questions:\n    print(len(neighbours[a] & neighbours[b]))' },
        'In C++ and Java it is common to keep the neighbour lists **sorted** and to merge two sorted lists with two pointers (as in merging in merge sort), counting the equal values. Both approaches cost O(deg(a) + deg(b)) per question. This is the basic step of counting triangles, the next-but-one task.'
      ]
    },
    slug: 'common-neighbours',
    statement: ['An undirected graph has `n` nodes and `m` edges. For each of `q` questions with two different nodes `a` and `b`, print the number of nodes that are joined by an edge to both `a` and `b`.'],
    outputFormat: ['`q` lines: the number of common neighbours for every question.'],
    examples: [{ input: '5 6\n1 2\n1 3\n2 3\n2 4\n3 4\n4 5\n3\n2 3\n1 4\n1 5\n', note: 'The nodes 2 and 3 share the neighbours 1 and 4; the nodes 1 and 4 share 2 and 3; the nodes 1 and 5 share none: 2, 2, 0.' }],
    hints: ['Keep the neighbours of every node in a set (or in a sorted list).', 'The answer is the size of the intersection of the two sets.', 'With sorted lists, merge them with two pointers and count equal values.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]', 'q:int', 'qs:int[q][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        neighbours = [set() for _ in range(n + 1)]
        for u, v in edges:
            neighbours[u].add(v)
            neighbours[v].add(u)
        print("\n".join(str(len(neighbours[a] & neighbours[b])) for a, b in qs))`,
      cpp: J(ADJ.cpp, r`
        for (auto& lst : adj) sort(lst.begin(), lst.end());
        for (const vector<long long>& query : qs) {
            const vector<int>& x = adj[query[0]];
            const vector<int>& y = adj[query[1]];
            size_t i = 0, j = 0;
            long long common = 0;
            while (i < x.size() && j < y.size()) {
                if (x[i] == y[j]) {
                    common++;
                    i++;
                    j++;
                } else if (x[i] < y[j]) {
                    i++;
                } else {
                    j++;
                }
            }
            cout << common << "\n";
        }`),
      java: J(ADJ.java, r`
        for (List<Integer> lst : adj) Collections.sort(lst);
        StringBuilder out = new StringBuilder();
        for (long[] query : qs) {
            List<Integer> x = adj.get((int) query[0]);
            List<Integer> y = adj.get((int) query[1]);
            int i = 0, j = 0;
            long common = 0;
            while (i < x.size() && j < y.size()) {
                int p = x.get(i), q2 = y.get(j);
                if (p == q2) {
                    common++;
                    i++;
                    j++;
                } else if (p < q2) {
                    i++;
                } else {
                    j++;
                }
            }
            out.append(common).append("\n");
        }
        System.out.print(out);`)
    },
    solution: { explanation: ['The neighbour lists are kept as sets (or sorted lists); the answer to a question is the size of the intersection of the two lists.'], complexity: 'Time O(m + q * max degree), space O(n + m).' },
    solve(input) { const { n, m, edges, rs } = parse(input); const a = adjSets(n, edges); const q = Number(rs[m + 1]); return many(q, (i) => { const [x, y] = nums(rs[m + 2 + i]); let c = 0; for (const v of a[x]) if (a[y].has(v)) c++; return c; }).join('\n'); },
    tests() {
      const g = rng(926); const out = ['5 6\n1 2\n1 3\n2 3\n2 4\n3 4\n4 5\n3\n2 3\n1 4\n1 5\n'];
      for (const [n, e] of medium(g)) { const q = Math.min(n >= 1000 ? 1500 : 200, 2000); out.push(`${graphText(n, e)}${q}\n${many(q, () => { const a = randInt(g, 1, n); let b = randInt(g, 1, n); while (b === a) b = randInt(g, 1, n); return `${a} ${b}`; }).join('\n')}\n`); }
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `s`: the length of the array and the starting position (counted from 1).', 'The second line has the `n` numbers of the array.'],
    constraints: ['1 <= n <= 20000', '1 <= s <= n', '0 <= every number <= n'],
    slug: 'jump-game-reachability',
    title: 'Jump Left or Right to Reach a Zero',
    tags: ['graph', 'bfs', 'implicit-graph', 'array'],
    concept: {
      title: 'An array with jump rules is a graph: positions are nodes and jumps are edges',
      body: [
        'You stand on position `s` of an array. From position `i` you may jump to `i + arr[i]` or to `i - arr[i]`, as long as the new position is inside the array. Can you reach a position that holds a 0? The graph is **hidden in the rules**: the nodes are the positions `1..n`, and every position has at most two outgoing edges, to `i + arr[i]` and `i - arr[i]`. No edge list is needed, because the neighbours of a position are computed from its value.',
        'So it is reachability again: a search from `s` that follows jumps and stops when it finds a 0. Mark the positions as seen so that no position is processed twice (the jumps can go back and forth, so without marks the search could run for ever).',
        { code: 'seen = [False] * (n + 1)\nseen[s] = True\nstack = [s]\nfound = False\nwhile stack:\n    i = stack.pop()\n    if arr[i - 1] == 0:\n        found = True\n        break\n    for j in (i + arr[i - 1], i - arr[i - 1]):\n        if 1 <= j <= n and not seen[j]:\n            seen[j] = True\n            stack.append(j)' },
        'There are `n` nodes and at most `2n` edges, so the search takes O(n) time. Recognising that a puzzle is a graph is half of the work in many problems.'
      ]
    },
    statement: ['An array has `n` non-negative numbers. You start at position `s` (positions are numbered from 1). From position `i` you can jump to position `i + arr[i]` or to position `i - arr[i]` (only if the position exists). Print `yes` if you can reach a position whose value is 0, and `no` otherwise.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '7 6\n4 2 3 0 3 1 2\n', note: 'From position 6 (value 1) jump to 5 (value 3), then to 2 (value 2), then to 4, where the value is 0: yes.' }],
    hints: ['The positions are the nodes; from i the neighbours are i + arr[i] and i - arr[i].', 'Run a search from s and mark positions as seen.', 'Stop with yes as soon as you reach a position with the value 0.'],
    program: {
      io: ['n:int s:int', 'arr:int[n]'],
      fast: true,
      python: r`
        seen = [False] * (n + 1)
        seen[s] = True
        stack = [s]
        found = False
        while stack:
            i = stack.pop()
            if arr[i - 1] == 0:
                found = True
                break
            for j in (i + arr[i - 1], i - arr[i - 1]):
                if 1 <= j <= n and not seen[j]:
                    seen[j] = True
                    stack.append(j)
        print("yes" if found else "no")`,
      cpp: r`
        vector<char> seen(n + 1, 0);
        seen[s] = 1;
        vector<long long> stack = {s};
        bool found = false;
        while (!stack.empty()) {
            long long i = stack.back();
            stack.pop_back();
            if (arr[i - 1] == 0) {
                found = true;
                break;
            }
            long long targets[2] = {i + arr[i - 1], i - arr[i - 1]};
            for (long long j : targets) {
                if (j >= 1 && j <= n && !seen[j]) {
                    seen[j] = 1;
                    stack.push_back(j);
                }
            }
        }
        cout << (found ? "yes" : "no") << "\n";`,
      java: r`
        boolean[] seen = new boolean[(int) n + 1];
        seen[(int) s] = true;
        ArrayList<Long> stack = new ArrayList<>();
        stack.add(s);
        boolean found = false;
        while (!stack.isEmpty()) {
            long i = stack.remove(stack.size() - 1);
            if (arr[(int) i - 1] == 0) {
                found = true;
                break;
            }
            long[] targets = {i + arr[(int) i - 1], i - arr[(int) i - 1]};
            for (long j : targets) {
                if (j >= 1 && j <= n && !seen[(int) j]) {
                    seen[(int) j] = true;
                    stack.add(j);
                }
            }
        }
        System.out.println(found ? "yes" : "no");`
    },
    solution: { explanation: ['The positions are nodes with at most two jumps each; a search from the start position marks the reachable positions and stops with yes at a position with value 0.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, s] = nums(rs[0]); const arr = nums(rs[1]); const seen = new Array(n + 1).fill(false); seen[s] = true; const q = [s];
      for (let h = 0; h < q.length; h++) { const i = q[h]; if (arr[i - 1] === 0) return 'yes'; for (const j of [i + arr[i - 1], i - arr[i - 1]]) if (j >= 1 && j <= n && !seen[j]) { seen[j] = true; q.push(j); } }
      return 'no';
    },
    tests() {
      const g = rng(927); const out = ['7 6\n4 2 3 0 3 1 2\n', '1 1\n0\n', '1 1\n1\n', '5 3\n3 0 2 1 2\n'];
      const make = (n, hi, zeros) => { const arr = many(n, () => randInt(g, 1, hi)); for (let i = 0; i < zeros; i++) arr[randInt(g, 0, n - 1)] = 0; return `${n} ${randInt(g, 1, n)}\n${arr.join(' ')}\n`; };
      for (const [n, hi, z] of [[6, 4, 1], [10, 5, 1], [30, 6, 1], [30, 3, 0], [500, 8, 1], [500, 3, 2], [5000, 10, 1], [5000, 2, 1], [20000, 20, 1], [20000, 3, 1], [20000, 20000, 3]]) for (let t = 0; t < 2; t++) out.push(make(n, hi, z));
      out.push(`20000 1\n${['1', ...many(19998, () => '1'), '0'].join(' ')}\n`, `20000 20000\n${['0', ...many(19998, () => '1'), '1'].join(' ')}\n`, `20000 10000\n${many(20000, (i) => (i === 0 ? 0 : 2)).join(' ')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`, the size of the board.', 'The second line has four numbers `r1 c1 r2 c2`: the row and column of the start and of the target square (rows and columns are numbered from 1).'],
    constraints: ['1 <= n <= 200', '1 <= r1, c1, r2, c2 <= n'],
    slug: 'knight-on-a-board',
    title: 'The Knight\'s Shortest Trip',
    tags: ['graph', 'bfs', 'grid', 'implicit-graph'],
    concept: {
      title: 'Squares are nodes and legal moves are edges; BFS counts the moves',
      body: [
        'A chess *knight* moves two squares in one direction and one square in the other, so from the square `(r, c)` it can go to up to **eight** squares: `(r ± 1, c ± 2)` and `(r ± 2, c ± 1)`. What is the smallest number of moves from one square to another on an `n x n` board?',
        'The squares are nodes, a legal move is an edge, and all moves cost the same, so it is the shortest-path problem of the BFS tasks. The only new thing is the list of **eight direction pairs**, and the check that a new square is **on the board**. A two-dimensional distance array filled with -1 serves as the "seen" marker.',
        { code: 'moves = [(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)]\ndist = [[-1] * n for _ in range(n)]\ndist[r1][c1] = 0\nqueue = [(r1, c1)]\nfor x, y in queue:\n    for dx, dy in moves:\n        a, b = x + dx, y + dy\n        if 0 <= a < n and 0 <= b < n and dist[a][b] < 0:\n            dist[a][b] = dist[x][y] + 1\n            queue.append((a, b))' },
        'On very small boards some squares cannot be reached (on a 3 x 3 board the centre square has no knight moves at all), so the answer can be -1. The time is O(n^2).'
      ]
    },
    statement: ['A knight stands on the square `(r1, c1)` of an `n x n` chessboard. A move goes two squares in one direction and one square in a perpendicular direction, and must end on the board. Print the smallest number of moves needed to reach the square `(r2, c2)`, or -1 if it cannot be reached.'],
    outputFormat: ['Print the smallest number of moves or -1.'],
    examples: [{ input: '8\n1 1 8 8\n', note: 'From one corner of a normal chessboard to the opposite corner takes 6 moves.' }, { input: '3\n2 2 1 1\n', note: 'On a 3 x 3 board the knight cannot leave the centre: -1.' }],
    hints: ['The squares are nodes; list the eight moves of the knight.', 'Run a breadth-first search from the start square, keeping the distance of every square.', 'Print the distance of the target square (it is -1 if it was never reached).'],
    program: {
      io: ['n:int', 'a:int b:int c:int d:int'],
      fast: true,
      python: r`
        moves = [(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)]
        dist = [[-1] * n for _ in range(n)]
        dist[a - 1][b - 1] = 0
        queue = [(a - 1, b - 1)]
        for x, y in queue:
            for dx, dy in moves:
                p, q = x + dx, y + dy
                if 0 <= p < n and 0 <= q < n and dist[p][q] < 0:
                    dist[p][q] = dist[x][y] + 1
                    queue.append((p, q))
        print(dist[c - 1][d - 1])`,
      cpp: r`
        int dx[8] = {1, 2, -1, -2, 1, 2, -1, -2}, dy[8] = {2, 1, 2, 1, -2, -1, -2, -1};
        vector<vector<int>> dist(n, vector<int>(n, -1));
        dist[a - 1][b - 1] = 0;
        vector<pair<int, int>> queue = {{(int)a - 1, (int)b - 1}};
        for (size_t i = 0; i < queue.size(); i++) {
            int x = queue[i].first, y = queue[i].second;
            for (int k = 0; k < 8; k++) {
                int p = x + dx[k], q = y + dy[k];
                if (p >= 0 && p < n && q >= 0 && q < n && dist[p][q] < 0) {
                    dist[p][q] = dist[x][y] + 1;
                    queue.push_back({p, q});
                }
            }
        }
        cout << dist[c - 1][d - 1] << "\n";`,
      java: r`
        int size = (int) n;
        int[] dx = {1, 2, -1, -2, 1, 2, -1, -2}, dy = {2, 1, 2, 1, -2, -1, -2, -1};
        int[][] dist = new int[size][size];
        for (int[] row : dist) Arrays.fill(row, -1);
        dist[(int) a - 1][(int) b - 1] = 0;
        List<int[]> queue = new ArrayList<>();
        queue.add(new int[] {(int) a - 1, (int) b - 1});
        for (int i = 0; i < queue.size(); i++) {
            int x = queue.get(i)[0], y = queue.get(i)[1];
            for (int k = 0; k < 8; k++) {
                int p = x + dx[k], q = y + dy[k];
                if (p >= 0 && p < size && q >= 0 && q < size && dist[p][q] < 0) {
                    dist[p][q] = dist[x][y] + 1;
                    queue.add(new int[] {p, q});
                }
            }
        }
        System.out.println(dist[(int) c - 1][(int) d - 1]);`
    },
    solution: { explanation: ['A breadth-first search over the squares using the eight knight moves gives the smallest number of moves to every reachable square; the target is read from the distance table.'], complexity: 'Time O(n^2), space O(n^2).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const [a, b, c, d] = nums(rs[1]); const dist = Array.from({ length: n }, () => new Array(n).fill(-1)); dist[a - 1][b - 1] = 0; const q = [[a - 1, b - 1]];
      for (let h = 0; h < q.length; h++) { const [x, y] = q[h]; for (const [dx, dy] of [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]) { const p = x + dx, qq = y + dy; if (p >= 0 && p < n && qq >= 0 && qq < n && dist[p][qq] < 0) { dist[p][qq] = dist[x][y] + 1; q.push([p, qq]); } } }
      return String(dist[c - 1][d - 1]);
    },
    tests() {
      const g = rng(928); const out = ['8\n1 1 8 8\n', '3\n2 2 1 1\n', '1\n1 1 1 1\n', '2\n1 1 2 2\n', '4\n1 1 4 4\n'];
      for (const n of [3, 4, 5, 8, 20, 100, 200]) for (let t = 0; t < 3; t++) out.push(`${n}\n${randInt(g, 1, n)} ${randInt(g, 1, n)} ${randInt(g, 1, n)} ${randInt(g, 1, n)}\n`);
      out.push('200\n1 1 200 200\n', '200\n1 200 200 1\n', '200\n100 100 101 100\n', '3\n1 1 3 3\n', '3\n1 1 2 3\n');
      return out;
    }
  },

  {
    ...edgesIn,
    slug: 'level-sizes',
    title: 'How Many Nodes Are at Each Distance?',
    tags: ['graph', 'bfs'],
    concept: {
      title: 'BFS works in layers: the queue holds all nodes of one distance, then the next',
      body: [
        'In a breadth-first search, all nodes at distance `d` from the start enter the queue before any node at distance `d + 1`. So the search proceeds in **layers** (also called levels). Counting how many nodes there are in each layer shows the shape of the graph: how quickly it spreads from the start. In a social network the layer sizes are the number of friends, friends of friends, and so on.',
        'You can count the layers with the distance array of the earlier task: after the search, count how many nodes have each distance. Or process one layer at a time: keep the current layer in a list, build the next layer from the unseen neighbours of its nodes, and record the length.',
        { code: 'seen = [False] * (n + 1)\nseen[1] = True\nlayer = [1]\nsizes = []\nwhile layer:\n    sizes.append(len(layer))\n    next_layer = []\n    for v in layer:\n        for w in adj[v]:\n            if not seen[w]:\n                seen[w] = True\n                next_layer.append(w)\n    layer = next_layer' },
        'The number of layers is one more than the largest distance from the start (the *eccentricity* of the start). Nodes that cannot be reached are not counted in any layer.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. For distance 0, 1, 2, ... (up to the largest distance of a reachable node) print how many nodes are at exactly that distance from node 1. Nodes that cannot be reached from node 1 are not counted.'],
    outputFormat: ['The numbers of nodes at the distances 0, 1, 2, ... on one line.'],
    examples: [{ input: '6 5\n1 3\n1 2\n2 5\n3 4\n4 5\n', note: 'Distance 0: node 1; distance 1: nodes 2 and 3; distance 2: nodes 4 and 5. Node 6 is not reachable: 1 2 2.' }],
    hints: ['Run a breadth-first search from node 1.', 'Handle one layer at a time, or count the nodes of each distance afterwards.', 'Print the layer sizes in order.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: J(ADJ.python, r`
        seen = [False] * (n + 1)
        seen[1] = True
        layer = [1]
        sizes = []
        while layer:
            sizes.append(len(layer))
            next_layer = []
            for v in layer:
                for w in adj[v]:
                    if not seen[w]:
                        seen[w] = True
                        next_layer.append(w)
            layer = next_layer
        print(*sizes)`),
      cpp: J(ADJ.cpp, r`
        vector<char> seen(n + 1, 0);
        seen[1] = 1;
        vector<int> layer = {1};
        vector<long long> sizes;
        while (!layer.empty()) {
            sizes.push_back((long long)layer.size());
            vector<int> next;
            for (int v : layer) {
                for (int w : adj[v]) {
                    if (!seen[w]) {
                        seen[w] = 1;
                        next.push_back(w);
                    }
                }
            }
            layer = next;
        }
        for (size_t i = 0; i < sizes.size(); i++) cout << (i ? " " : "") << sizes[i];
        cout << "\n";`),
      java: J(ADJ.java, r`
        boolean[] seen = new boolean[nodes + 1];
        seen[1] = true;
        List<Integer> layer = new ArrayList<>();
        layer.add(1);
        List<Integer> sizes = new ArrayList<>();
        while (!layer.isEmpty()) {
            sizes.add(layer.size());
            List<Integer> next = new ArrayList<>();
            for (int v : layer) {
                for (int w : adj.get(v)) {
                    if (!seen[w]) {
                        seen[w] = true;
                        next.add(w);
                    }
                }
            }
            layer = next;
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < sizes.size(); i++) out.append(i > 0 ? " " : "").append(sizes.get(i));
        System.out.println(out);`)
    },
    solution: { explanation: ['The search handles one layer at a time: the length of the current layer is recorded and the unseen neighbours of its nodes form the next layer.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) { const { n, edges } = parse(input); const d = bfsDistances(adjacency(n, edges), n, 1); const c = []; for (let v = 1; v <= n; v++) if (d[v] >= 0) c[d[v]] = (c[d[v]] || 0) + 1; return c.join(' '); },
    tests() {
      const g = rng(929); const out = ['6 5\n1 3\n1 2\n2 5\n3 4\n4 5\n', '2 1\n2 1\n', '3 1\n2 3\n'];
      for (const [n, e] of shapes(g)) out.push(graphText(n, e));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: EDGE_INPUT,
    constraints: ['3 <= n <= 2000', '1 <= m <= 20000', 'There are no self-loops and no repeated edges.'],
    slug: 'number-of-triangles',
    title: 'Count the Triangles',
    tags: ['graph', 'adjacency-list', 'sets', 'counting'],
    concept: {
      title: 'A triangle is an edge plus a common neighbour of its two ends',
      body: [
        'A *triangle* is a set of three nodes that are all joined to each other: `a - b`, `b - c` and `a - c`. Triangles measure how clustered a network is (friends of friends are often friends). Testing all triples of nodes costs O(n^3), far too slow for 2000 nodes (8 billion triples).',
        'Look at it edge by edge. Every triangle `{a, b, c}` contains the edge `(a, b)`, and `c` is a **common neighbour** of `a` and `b`. So for every edge `(u, v)` count the common neighbours of `u` and `v`, and add up. But each triangle has **three** edges, so it has been counted three times: divide the total by 3.',
        { code: 'neighbours = [set() for _ in range(n + 1)]\nfor u, v in edges:\n    neighbours[u].add(v)\n    neighbours[v].add(u)\ntotal = 0\nfor u, v in edges:\n    total += len(neighbours[u] & neighbours[v])    # common neighbours of an edge\nprint(total // 3)' },
        'With at most 20000 edges and 2000 nodes, the work per edge is at most the smaller degree, so the total stays within a few million steps even for a dense group of nodes. The division is exact: the total is always a multiple of 3.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. Print the number of triangles: the sets of three different nodes that are joined to each other in pairs.'],
    outputFormat: ['Print the number of triangles.'],
    examples: [{ input: '5 6\n1 2\n1 3\n2 3\n2 4\n3 4\n4 5\n', note: 'The triangles are {1, 2, 3} and {2, 3, 4}: 2.' }],
    hints: ['Keep the neighbours of each node in a set.', 'For every edge (u, v) count the nodes that are neighbours of both.', 'Every triangle is counted three times (once per edge), so divide by 3.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        neighbours = [set() for _ in range(n + 1)]
        for u, v in edges:
            neighbours[u].add(v)
            neighbours[v].add(u)
        total = 0
        for u, v in edges:
            total += len(neighbours[u] & neighbours[v])
        print(total // 3)`,
      cpp: J(ADJ.cpp, r`
        for (auto& lst : adj) sort(lst.begin(), lst.end());
        long long total = 0;
        for (const vector<long long>& e : edges) {
            const vector<int>& x = adj[e[0]];
            const vector<int>& y = adj[e[1]];
            size_t i = 0, j = 0;
            while (i < x.size() && j < y.size()) {
                if (x[i] == y[j]) {
                    total++;
                    i++;
                    j++;
                } else if (x[i] < y[j]) {
                    i++;
                } else {
                    j++;
                }
            }
        }
        cout << total / 3 << "\n";`),
      java: J(ADJ.java, r`
        for (List<Integer> lst : adj) Collections.sort(lst);
        long total = 0;
        for (long[] e : edges) {
            List<Integer> x = adj.get((int) e[0]);
            List<Integer> y = adj.get((int) e[1]);
            int i = 0, j = 0;
            while (i < x.size() && j < y.size()) {
                int p = x.get(i), q = y.get(j);
                if (p == q) {
                    total++;
                    i++;
                    j++;
                } else if (p < q) {
                    i++;
                } else {
                    j++;
                }
            }
        }
        System.out.println(total / 3);`)
    },
    solution: { explanation: ['For every edge the common neighbours of its two ends are counted (each one completes a triangle); every triangle is counted once for each of its three edges, so the total is divided by 3.'], complexity: 'Time O(m * max degree), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const a = adjSets(n, edges); let t = 0; for (const [u, v] of edges) for (const w of a[u]) if (a[v].has(w)) t++; return String(t / 3);
    },
    tests() {
      const g = rng(930); const out = ['5 6\n1 2\n1 3\n2 3\n2 4\n3 4\n4 5\n', '3 3\n1 2\n2 3\n3 1\n', '3 2\n1 2\n2 3\n'];
      const brute = (input) => { const { n, edges } = parse(input); const a = adjSets(n, edges); let c = 0; for (let x = 1; x <= n; x++) for (let y = x + 1; y <= n; y++) for (let z = y + 1; z <= n; z++) if (a[x].has(y) && a[y].has(z) && a[x].has(z)) c++; return String(c); };
      crossCheck(() => { const n = randInt(g, 3, 9); return graphText(n, E(g, n, randInt(g, 1, n * (n - 1) / 2))); }, (i) => this.solve(i), brute, 300);
      for (const [n, e] of medium(g)) out.push(graphText(n, e));
      out.push(graphText(2000, mix(g, [...many(150, (i) => i + 1).flatMap((u) => many(150 - u, (k) => [u, u + k + 1])), ...E(g, 2000, 3000).filter(([u, v]) => u > 150 && v > 150)])));
      return out;
    }
  }
];
