import { r, rng, randInt, many, nums, rows } from '../../lib.mjs';
import { graphText, randomEdges, randomTreeEdges, connectedEdges, randomDirected, adjacency, components, bfsDistances, mix } from '../../graphlib.mjs';
import { J, ADJ, DIR, EDGE_INPUT, DIR_INPUT, EDGE_LIMITS } from '../../graphcode.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const easy = { difficulty: 'easy', inputFormat: EDGE_INPUT, constraints: EDGE_LIMITS };
const parse = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); return { n, m, edges: many(m, (i) => nums(rs[i + 1])), rs }; };
const E = (g, n, m) => mix(g, randomEdges(g, n, m));
// graphs for the tests: tiny, random, many components, one long path, a star, dense
const shapes = (g) => [
  [2, [[1, 2]]], [5, [[1, 2], [2, 3], [4, 5]]], [8, E(g, 8, 6)], [30, E(g, 30, 25)], [200, E(g, 200, 150)], [1000, E(g, 1000, 800)],
  [20000, E(g, 20000, 5000)], [20000, E(g, 20000, 30000)], [20000, mix(g, randomTreeEdges(g, 20000, 'path'))], [20000, mix(g, randomTreeEdges(g, 20000, 'star'))],
  [20000, connectedEdges(g, 20000, 10000)], [300, E(g, 300, 30000)]
];
const small = (g) => { const n = randInt(g, 2, 12); return [n, E(g, n, randInt(g, 1, Math.min(n * (n - 1) / 2, 14)))]; };

export default [
  {
    ...easy,
    slug: 'count-components',
    title: 'How Many Separate Groups?',
    tags: ['graph', 'bfs', 'connected-components'],
    concept: {
      title: 'A graph is dots and lines; a component is a group of dots you can walk between',
      body: [
        'A **graph** is a set of **nodes** (the dots) and **edges** (the lines between two nodes). Here the edges are *undirected*: an edge between `u` and `v` can be walked in both directions. Graphs describe roads between towns, friends in a network, links between web pages, and many other things. In a problem the nodes are numbered `1` to `n`, and the graph is given as a list of edges.',
        'The best way to store a graph for walking in it is the **adjacency list**: for every node, a list of its neighbours. Each edge `(u, v)` puts `v` in the list of `u` and `u` in the list of `v`.',
        'Two nodes are *connected* if there is a walk from one to the other along edges. All nodes that are connected to each other form a **connected component**; a node with no edges is a component of its own. To count the components, walk through the nodes: when you meet a node that no earlier search has reached, a **new component** starts, and a **breadth-first search** (visit the node, then its neighbours, then their neighbours, using a queue) marks every node of that component as seen.',
        { code: 'adj = [[] for _ in range(n + 1)]\nfor u, v in edges:\n    adj[u].append(v)\n    adj[v].append(u)\n\nseen = [False] * (n + 1)\ncount = 0\nfor start in range(1, n + 1):\n    if seen[start]:\n        continue                    # already reached from an earlier node\n    count += 1                      # a new component\n    seen[start] = True\n    queue = [start]\n    for v in queue:                 # the list grows while we walk through it\n        for w in adj[v]:\n            if not seen[w]:\n                seen[w] = True\n                queue.append(w)' },
        'Every node is put in the queue once and every edge is looked at twice, so the time is O(n + m). The walk uses a loop and a queue instead of recursion on purpose: a graph can be a path of 20000 nodes, and a recursive search that deep overflows the call stack in Python.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. Print the number of connected components (a node without edges counts as a component).'],
    outputFormat: ['Print the number of components.'],
    examples: [{ input: '6 3\n1 2\n2 3\n5 6\n', note: 'The components are {1, 2, 3}, {4} and {5, 6}: 3.' }],
    hints: ['Build the list of neighbours of every node.', 'Walk through the nodes from 1 to n; a node that has not been seen starts a new component.', 'From such a node run a breadth-first search with a queue and mark everything it reaches as seen.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: J(ADJ.python, r`
        seen = [False] * (n + 1)
        count = 0
        for start in range(1, n + 1):
            if seen[start]:
                continue
            count += 1
            seen[start] = True
            queue = [start]
            for v in queue:
                for w in adj[v]:
                    if not seen[w]:
                        seen[w] = True
                        queue.append(w)
        print(count)`),
      cpp: J(ADJ.cpp, r`
        vector<char> seen(n + 1, 0);
        int count = 0;
        for (int start = 1; start <= n; start++) {
            if (seen[start]) continue;
            count++;
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
        cout << count << "\n";`),
      java: J(ADJ.java, r`
        boolean[] seen = new boolean[nodes + 1];
        int count = 0;
        for (int start = 1; start <= nodes; start++) {
            if (seen[start]) continue;
            count++;
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
        System.out.println(count);`)
    },
    solution: { explanation: ['The neighbour lists are built from the edges. Every node that has not been reached yet starts a new component, and a breadth-first search from it marks the whole component.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) { const { n, edges } = parse(input); return String(components(n, edges).count); },
    tests() {
      const g = rng(901); const out = ['6 3\n1 2\n2 3\n5 6\n', '2 1\n1 2\n', '3 1\n2 3\n'];
      for (const [n, e] of shapes(g)) out.push(graphText(n, e));
      return out;
    }
  },

  {
    ...easy,
    slug: 'node-degrees',
    title: 'How Many Neighbours Has Each Node?',
    tags: ['graph', 'degree'],
    concept: {
      title: 'The degree of a node is the number of edges that touch it',
      body: [
        'The **degree** of a node is the number of edges at that node, which is the number of its neighbours when there are no repeated edges. Degrees are the simplest facts about a graph, and they are used all the time: a node of degree 0 is isolated, a node of degree 1 is a *leaf*, and in a road map the node with the largest degree is the biggest crossing.',
        'You do not need the adjacency lists to count degrees. Go through the edge list once, and for each edge `(u, v)` add one to the degree of `u` and one to the degree of `v`.',
        { code: 'degree = [0] * (n + 1)\nfor u, v in edges:\n    degree[u] += 1\n    degree[v] += 1' },
        'Every edge adds 2 to the sum of all degrees (one for each end), so **the sum of the degrees is always `2 * m`**. This is the *handshake lemma*, and it gives a quick check of your answer: the printed numbers must add up to twice the number of edges. It also shows that the number of nodes with an odd degree is always even.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. Print the degree of every node, for the nodes 1, 2, ..., n.'],
    outputFormat: ['One line with `n` numbers.'],
    examples: [{ input: '4 3\n1 2\n1 3\n1 4\n', note: 'Node 1 has three edges, the others one each: 3 1 1 1.' }],
    hints: ['Keep an array with one counter for every node.', 'For each edge, add one to the counters of both of its ends.', 'Print the counters of the nodes 1 to n.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: r`
        degree = [0] * (n + 1)
        for u, v in edges:
            degree[u] += 1
            degree[v] += 1
        print(*degree[1:])`,
      cpp: r`
        vector<long long> degree(n + 1, 0);
        for (const vector<long long>& e : edges) {
            degree[e[0]]++;
            degree[e[1]]++;
        }
        for (int v = 1; v <= n; v++) cout << (v > 1 ? " " : "") << degree[v];
        cout << "\n";`,
      java: r`
        long[] degree = new long[(int) n + 1];
        for (long[] e : edges) {
            degree[(int) e[0]]++;
            degree[(int) e[1]]++;
        }
        StringBuilder out = new StringBuilder();
        for (int v = 1; v <= n; v++) out.append(v > 1 ? " " : "").append(degree[v]);
        System.out.println(out);`
    },
    solution: { explanation: ['One pass over the edge list adds one to the counters of both ends of every edge.'], complexity: 'Time O(n + m), space O(n).' },
    solve(input) { const { n, edges } = parse(input); const d = new Array(n + 1).fill(0); for (const [u, v] of edges) { d[u]++; d[v]++; } return d.slice(1).join(' '); },
    tests() {
      const g = rng(902); const out = ['4 3\n1 2\n1 3\n1 4\n', '2 1\n2 1\n'];
      for (const [n, e] of shapes(g)) out.push(graphText(n, e));
      return out;
    }
  },

  {
    ...easy,
    slug: 'graph-is-a-tree',
    title: 'Is This Graph a Tree?',
    tags: ['graph', 'tree', 'bfs'],
    concept: {
      title: 'A tree is a graph that is connected and has exactly n - 1 edges',
      body: [
        'A **tree** is a connected graph without cycles. It has a very handy description in numbers: a graph with `n` nodes is a tree exactly when it is **connected** and has **exactly `n - 1` edges**. (A connected graph needs at least `n - 1` edges to hold together; with exactly that many there is no edge to spare, so no cycle can exist.)',
        'So the test has two parts. First, `m == n - 1` is a one-line check. Second, connectivity: a search from node 1 must reach all `n` nodes. If the edge count is right but the graph is not connected (a triangle and a separate node, for example), then there must be a cycle somewhere, and the graph is not a tree.',
        { code: 'is_tree = (m == n - 1)\nif is_tree:\n    # a breadth-first search from node 1 ...\n    is_tree = (number of nodes reached == n)' },
        'Checking the edge count first saves the search when the answer is already "no". The search needs O(n + m) time, and the two conditions together are all one has to know.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. Print `yes` if the graph is a tree (connected and without cycles) and `no` otherwise.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '4 3\n1 2\n2 3\n3 4\n', note: 'A path of four nodes: a tree, yes.' }, { input: '4 3\n1 2\n2 3\n1 3\n', note: 'Three edges, but they form a triangle and node 4 is alone: no.' }],
    hints: ['A tree with n nodes has exactly n - 1 edges, so compare m with n - 1 first.', 'Then run a search from node 1 and count the nodes it reaches.', 'It is a tree only if the count is n.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: J(ADJ.python, r`
        ok = (m == n - 1)
        if ok:
            seen = [False] * (n + 1)
            seen[1] = True
            queue = [1]
            for v in queue:
                for w in adj[v]:
                    if not seen[w]:
                        seen[w] = True
                        queue.append(w)
            ok = (len(queue) == n)
        print("yes" if ok else "no")`),
      cpp: J(ADJ.cpp, r`
        bool ok = (m == n - 1);
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
    solution: { explanation: ['A tree has exactly n - 1 edges and is connected. The edge count is compared first; then a search from node 1 must reach all n nodes.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) { const { n, m, edges } = parse(input); return m === n - 1 && components(n, edges).count === 1 ? 'yes' : 'no'; },
    tests() {
      const g = rng(903); const out = ['4 3\n1 2\n2 3\n3 4\n', '4 3\n1 2\n2 3\n1 3\n', '2 1\n1 2\n'];
      for (const kind of ['random', 'path', 'star', 'binary', 'deep']) for (const n of [5, 100, 20000]) out.push(graphText(n, mix(g, randomTreeEdges(g, n, kind))));
      // a tree with one edge replaced by another edge: n - 1 edges, but usually not connected
      const replaced = (n) => { const t = randomTreeEdges(g, n); const have = new Set(t.map(([a, b]) => Math.min(a, b) * (n + 1) + Math.max(a, b))); for (;;) { const u = randInt(g, 1, n), v = randInt(g, 1, n); if (u === v || have.has(Math.min(u, v) * (n + 1) + Math.max(u, v))) continue; t[randInt(g, 0, n - 2)] = [u, v]; return t; } };
      for (const n of [6, 6, 100, 100, 20000]) out.push(graphText(n, mix(g, replaced(n))));
      for (const [n, e] of shapes(g)) out.push(graphText(n, e));
      for (const n of [5, 100, 20000]) { const e = connectedEdges(g, n, 1); out.push(graphText(n, e)); }
      return out;
    }
  },

  {
    ...easy,
    slug: 'bfs-visit-order',
    title: 'Visit the Nodes Level by Level',
    tags: ['graph', 'bfs'],
    concept: {
      title: 'Breadth-first search visits the nodes in order of their distance from the start',
      body: [
        '*Breadth-first search* (BFS) starts at one node, visits all its neighbours, then all the neighbours of those neighbours, and so on: it explores the graph **in rings** around the start. It is done with a **queue**: take the node at the front, and put its unvisited neighbours at the back.',
        'To make the visiting order unique, the neighbours of a node are taken **in increasing order of their numbers**: sort every neighbour list once after building it. A node is marked as seen **when it is put in the queue**, not when it is taken out, so that it enters the queue only once.',
        { code: 'for lst in adj:\n    lst.sort()\nseen = [False] * (n + 1)\nseen[1] = True\norder = [1]                       # the queue is also the answer\nfor v in order:\n    for w in adj[v]:\n        if not seen[w]:\n            seen[w] = True\n            order.append(w)' },
        'The order in which nodes enter the queue is the BFS order, and it has a very useful property: the **distance** (number of edges) from the start never goes down along it. That is why BFS finds shortest paths in graphs without weights, which the next tasks use.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. Do a breadth-first search from node 1 in which the neighbours of a node are taken in increasing order. Print the nodes in the order in which they are visited (only the nodes that can be reached from node 1).'],
    outputFormat: ['The visited nodes in order on one line.'],
    examples: [{ input: '6 5\n1 3\n1 2\n2 5\n3 4\n4 5\n', note: 'Node 1 first, then its neighbours 2 and 3, then the new neighbours of 2 (node 5) and of 3 (node 4): 1 2 3 5 4. Node 6 is not reachable.' }],
    hints: ['Sort the neighbour list of every node.', 'Use a queue that starts with node 1 and mark nodes as seen when they enter the queue.', 'The order in which nodes enter the queue is the answer.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: J(ADJ.python, r`
        for lst in adj:
            lst.sort()
        seen = [False] * (n + 1)
        seen[1] = True
        order = [1]
        for v in order:
            for w in adj[v]:
                if not seen[w]:
                    seen[w] = True
                    order.append(w)
        print(*order)`),
      cpp: J(ADJ.cpp, r`
        for (auto& lst : adj) sort(lst.begin(), lst.end());
        vector<char> seen(n + 1, 0);
        seen[1] = 1;
        vector<int> order = {1};
        for (size_t i = 0; i < order.size(); i++) {
            for (int w : adj[order[i]]) {
                if (!seen[w]) {
                    seen[w] = 1;
                    order.push_back(w);
                }
            }
        }
        for (size_t i = 0; i < order.size(); i++) cout << (i ? " " : "") << order[i];
        cout << "\n";`),
      java: J(ADJ.java, r`
        for (List<Integer> lst : adj) Collections.sort(lst);
        boolean[] seen = new boolean[nodes + 1];
        seen[1] = true;
        List<Integer> order = new ArrayList<>();
        order.add(1);
        for (int i = 0; i < order.size(); i++) {
            for (int w : adj.get(order.get(i))) {
                if (!seen[w]) {
                    seen[w] = true;
                    order.add(w);
                }
            }
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < order.size(); i++) out.append(i > 0 ? " " : "").append(order.get(i));
        System.out.println(out);`)
    },
    solution: { explanation: ['The neighbour lists are sorted; a queue starting with node 1 takes the nodes in front-to-back order and appends the unseen neighbours of each. The queue is the visiting order.'], complexity: 'Time O(n + m log m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges); adj.forEach((l) => l.sort((a, b) => a - b));
      const seen = new Array(n + 1).fill(false); seen[1] = true; const order = [1];
      for (let h = 0; h < order.length; h++) for (const w of adj[order[h]]) if (!seen[w]) { seen[w] = true; order.push(w); }
      return order.join(' ');
    },
    tests() {
      const g = rng(904); const out = ['6 5\n1 3\n1 2\n2 5\n3 4\n4 5\n', '2 1\n2 1\n', '3 1\n2 3\n'];
      for (const [n, e] of shapes(g)) out.push(graphText(n, e));
      out.push(graphText(20000, connectedEdges(g, 20000, 3000, null, 'binary')));
      return out;
    }
  },

  {
    ...easy,
    slug: 'dfs-visit-order',
    title: 'Dive Deep Before Turning Back',
    tags: ['graph', 'dfs', 'stack'],
    concept: {
      title: 'Depth-first search goes as deep as it can, then backs up; a stack does it without recursion',
      body: [
        '*Depth-first search* (DFS) explores one road to its end before trying another: from the current node it goes to an **unvisited neighbour**, and from there to an unvisited neighbour of that one, and so on; when a node has no unvisited neighbour left, the search **backs up** to the previous node. It is the natural way to explore a maze, and it is the basis of many algorithms (cycles, components, topological order).',
        'The usual way to write it is a recursive function, but in a graph that is a path of 20000 nodes the recursion is 20000 calls deep, which fails in Python. The same order can be produced with an **explicit stack**: pop a node; if it was seen already, skip it; otherwise mark it, visit it, and push its neighbours. To make the smallest neighbour come out first, push the neighbours in **decreasing** order (the last pushed is the first popped).',
        { code: 'for lst in adj:\n    lst.sort()\nseen = [False] * (n + 1)\nstack = [1]\norder = []\nwhile stack:\n    v = stack.pop()\n    if seen[v]:\n        continue                       # it was reached by a shorter way meanwhile\n    seen[v] = True\n    order.append(v)\n    for w in reversed(adj[v]):         # the smallest neighbour is pushed last, so it comes first\n        if not seen[w]:\n            stack.append(w)' },
        'The nodes are marked as seen **when they are popped**, not when they are pushed, because a node may be pushed several times by different neighbours; only its first pop counts. The order produced is exactly the order of the recursive version. The time is O(n + m).'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. Do a depth-first search from node 1: from the current node go to its smallest unvisited neighbour; when there is none, go back to the node you came from. Print the nodes in the order in which they are first visited (only the nodes that can be reached from node 1).'],
    outputFormat: ['The visited nodes in order on one line.'],
    examples: [{ input: '6 5\n1 3\n1 2\n2 5\n3 4\n4 5\n', note: 'From 1 go to 2, then to 5, then to 4, then to 3; node 6 is not reachable: 1 2 5 4 3.' }],
    hints: ['Sort the neighbour lists.', 'Use a stack; pop a node, skip it if it was seen, otherwise visit it and push its unseen neighbours.', 'Push the neighbours from the largest to the smallest, so that the smallest is popped first.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: J(ADJ.python, r`
        for lst in adj:
            lst.sort()
        seen = [False] * (n + 1)
        stack = [1]
        order = []
        while stack:
            v = stack.pop()
            if seen[v]:
                continue
            seen[v] = True
            order.append(v)
            for w in reversed(adj[v]):
                if not seen[w]:
                    stack.append(w)
        print(*order)`),
      cpp: J(ADJ.cpp, r`
        for (auto& lst : adj) sort(lst.begin(), lst.end());
        vector<char> seen(n + 1, 0);
        vector<int> stack = {1}, order;
        while (!stack.empty()) {
            int v = stack.back();
            stack.pop_back();
            if (seen[v]) continue;
            seen[v] = 1;
            order.push_back(v);
            for (size_t i = adj[v].size(); i-- > 0;) {
                if (!seen[adj[v][i]]) stack.push_back(adj[v][i]);
            }
        }
        for (size_t i = 0; i < order.size(); i++) cout << (i ? " " : "") << order[i];
        cout << "\n";`),
      java: J(ADJ.java, r`
        for (List<Integer> lst : adj) Collections.sort(lst);
        boolean[] seen = new boolean[nodes + 1];
        ArrayList<Integer> stack = new ArrayList<>();
        stack.add(1);
        List<Integer> order = new ArrayList<>();
        while (!stack.isEmpty()) {
            int v = stack.remove(stack.size() - 1);
            if (seen[v]) continue;
            seen[v] = true;
            order.add(v);
            List<Integer> next = adj.get(v);
            for (int i = next.size() - 1; i >= 0; i--) {
                if (!seen[next.get(i)]) stack.add(next.get(i));
            }
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < order.size(); i++) out.append(i > 0 ? " " : "").append(order.get(i));
        System.out.println(out);`)
    },
    solution: { explanation: ['An explicit stack replaces the recursion: a node is visited when it is first popped, and its unseen neighbours are pushed from the largest to the smallest so that the smallest comes out first.'], complexity: 'Time O(n + m log m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges); adj.forEach((l) => l.sort((a, b) => a - b));
      const seen = new Array(n + 1).fill(false); const order = [];
      // the recursive order, made without recursion: keep for every node on the road the index of its next neighbour
      const road = [1]; const next = new Array(n + 1).fill(0); seen[1] = true; order.push(1);
      while (road.length) { const v = road[road.length - 1]; if (next[v] < adj[v].length) { const w = adj[v][next[v]++]; if (!seen[w]) { seen[w] = true; order.push(w); road.push(w); } } else road.pop(); }
      return order.join(' ');
    },
    tests() {
      const g = rng(905); const out = ['6 5\n1 3\n1 2\n2 5\n3 4\n4 5\n', '2 1\n2 1\n', '3 1\n2 3\n'];
      for (const [n, e] of shapes(g)) out.push(graphText(n, e));
      out.push(graphText(20000, connectedEdges(g, 20000, 3000, null, 'deep')));
      return out;
    }
  },

  {
    ...easy,
    slug: 'distances-from-one',
    title: 'How Far Is Every Node From Node 1?',
    tags: ['graph', 'bfs', 'shortest-path'],
    concept: {
      title: 'In a graph without weights, BFS gives the shortest distance to every node',
      body: [
        'The **distance** between two nodes is the smallest number of edges on a walk between them. Breadth-first search finds it for all nodes at once: the start has distance 0; when a node with distance `d` is taken from the queue, each unseen neighbour gets the distance `d + 1`. A node is reached first by its shortest walk, because the queue holds the nodes in order of non-decreasing distance.',
        'Instead of a separate "seen" array, a **distance array filled with -1** does both jobs: `dist[v] == -1` means "not reached yet". Nodes that are never reached keep the value -1, which is also the answer for them.',
        { code: 'dist = [-1] * (n + 1)\ndist[1] = 0\nqueue = [1]\nfor v in queue:\n    for w in adj[v]:\n        if dist[w] < 0:\n            dist[w] = dist[v] + 1\n            queue.append(w)' },
        'This is the model for all later shortest-path tasks: with edge weights the queue has to be replaced by a priority queue (Dijkstra\'s algorithm), but the idea "settle the closest node first" stays the same.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. For every node print the distance (the smallest number of edges on a walk) from node 1 to it, or -1 if it cannot be reached.'],
    outputFormat: ['One line with `n` numbers: the distances of the nodes 1, 2, ..., n.'],
    examples: [{ input: '6 5\n1 3\n1 2\n2 5\n3 4\n4 5\n', note: 'Nodes 2 and 3 are one edge away, nodes 4 and 5 two edges, and node 6 cannot be reached: 0 1 1 2 2 -1.' }],
    hints: ['Fill a distance array with -1 and set the start to 0.', 'Take nodes from a queue; an unreached neighbour gets the distance of the current node plus 1 and goes into the queue.', 'Nodes that are never reached stay at -1.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: J(ADJ.python, r`
        dist = [-1] * (n + 1)
        dist[1] = 0
        queue = [1]
        for v in queue:
            for w in adj[v]:
                if dist[w] < 0:
                    dist[w] = dist[v] + 1
                    queue.append(w)
        print(*dist[1:])`),
      cpp: J(ADJ.cpp, r`
        vector<long long> dist(n + 1, -1);
        dist[1] = 0;
        vector<int> queue = {1};
        for (size_t i = 0; i < queue.size(); i++) {
            int v = queue[i];
            for (int w : adj[v]) {
                if (dist[w] < 0) {
                    dist[w] = dist[v] + 1;
                    queue.push_back(w);
                }
            }
        }
        for (int v = 1; v <= n; v++) cout << (v > 1 ? " " : "") << dist[v];
        cout << "\n";`),
      java: J(ADJ.java, r`
        long[] dist = new long[nodes + 1];
        Arrays.fill(dist, -1);
        dist[1] = 0;
        List<Integer> queue = new ArrayList<>();
        queue.add(1);
        for (int i = 0; i < queue.size(); i++) {
            int v = queue.get(i);
            for (int w : adj.get(v)) {
                if (dist[w] < 0) {
                    dist[w] = dist[v] + 1;
                    queue.add(w);
                }
            }
        }
        StringBuilder out = new StringBuilder();
        for (int v = 1; v <= nodes; v++) out.append(v > 1 ? " " : "").append(dist[v]);
        System.out.println(out);`)
    },
    solution: { explanation: ['A breadth-first search from node 1 gives every unreached neighbour the distance of the current node plus one; nodes never reached keep -1.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) { const { n, edges } = parse(input); return bfsDistances(adjacency(n, edges), n, 1).slice(1).join(' '); },
    tests() {
      const g = rng(906); const out = ['6 5\n1 3\n1 2\n2 5\n3 4\n4 5\n', '2 1\n2 1\n', '3 1\n2 3\n'];
      for (const [n, e] of shapes(g)) out.push(graphText(n, e));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: [...EDGE_INPUT, 'The next line has `q`, the number of questions.', 'Each of the next `q` lines has two nodes `a` and `b`.'],
    constraints: [...EDGE_LIMITS, '1 <= q <= 20000'],
    slug: 'connected-queries',
    title: 'Can You Get From a to b?',
    tags: ['graph', 'connected-components', 'queries'],
    concept: {
      title: 'Label every node with its component once; each question is a comparison of two labels',
      body: [
        'Two nodes are connected exactly when they are in the same **component**. If there are many questions "can you get from `a` to `b`?", searching the graph for each question would cost O(n + m) every time. It is much better to **prepare once**: run the component search of the first task and give every node a **label**, the number of its component. Then each question is a comparison of two numbers, in O(1).',
        { code: 'label = [0] * (n + 1)\ncount = 0\nfor start in range(1, n + 1):\n    if label[start]:\n        continue\n    count += 1\n    label[start] = count\n    queue = [start]\n    for v in queue:\n        for w in adj[v]:\n            if not label[w]:\n                label[w] = count\n                queue.append(w)\n\n# a question (a, b):  label[a] == label[b]' },
        'The label array replaces the "seen" array, because 0 means "not labelled yet" and any positive number is both "seen" and the name of the component. This "preprocess once, answer many questions fast" pattern is everywhere: the same idea with a disjoint-set structure (union-find) is used when edges are added over time.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. Then `q` questions follow, each with two nodes `a` and `b`. For every question print `yes` if there is a walk from `a` to `b` along the edges (a node is connected to itself), and `no` otherwise.'],
    outputFormat: ['`q` lines: `yes` or `no`.'],
    examples: [{ input: '6 5\n1 3\n1 2\n2 5\n3 4\n4 5\n3\n1 4\n2 6\n6 6\n', note: 'The nodes 1 and 4 are connected; node 6 has no edges, so it is connected only to itself.' }],
    hints: ['Label every node with the number of its component, using one search per component.', 'Two nodes are connected exactly when their labels are equal.', 'Answer each question by comparing two labels.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]', 'q:int', 'qs:int[q][2]'],
      fast: true,
      python: J(ADJ.python, r`
        label = [0] * (n + 1)
        count = 0
        for start in range(1, n + 1):
            if label[start]:
                continue
            count += 1
            label[start] = count
            queue = [start]
            for v in queue:
                for w in adj[v]:
                    if not label[w]:
                        label[w] = count
                        queue.append(w)
        print("\n".join("yes" if label[a] == label[b] else "no" for a, b in qs))`),
      cpp: J(ADJ.cpp, r`
        vector<int> label(n + 1, 0);
        int count = 0;
        for (int start = 1; start <= n; start++) {
            if (label[start]) continue;
            count++;
            label[start] = count;
            vector<int> queue = {start};
            for (size_t i = 0; i < queue.size(); i++) {
                for (int w : adj[queue[i]]) {
                    if (!label[w]) {
                        label[w] = count;
                        queue.push_back(w);
                    }
                }
            }
        }
        for (const vector<long long>& query : qs) cout << (label[query[0]] == label[query[1]] ? "yes" : "no") << "\n";`),
      java: J(ADJ.java, r`
        int[] label = new int[nodes + 1];
        int count = 0;
        for (int start = 1; start <= nodes; start++) {
            if (label[start] != 0) continue;
            count++;
            label[start] = count;
            List<Integer> queue = new ArrayList<>();
            queue.add(start);
            for (int i = 0; i < queue.size(); i++) {
                for (int w : adj.get(queue.get(i))) {
                    if (label[w] == 0) {
                        label[w] = count;
                        queue.add(w);
                    }
                }
            }
        }
        StringBuilder out = new StringBuilder();
        for (long[] query : qs) out.append(label[(int) query[0]] == label[(int) query[1]] ? "yes" : "no").append("\n");
        System.out.print(out);`)
    },
    solution: { explanation: ['One search per component gives every node the number of its component; a question is answered by comparing the labels of its two nodes.'], complexity: 'Time O(n + m + q), space O(n + m).' },
    solve(input) {
      const { n, m, edges, rs } = parse(input); const { comp } = components(n, edges); const q = Number(rs[m + 1]);
      return many(q, (i) => { const [a, b] = nums(rs[m + 2 + i]); return comp[a] === comp[b] ? 'yes' : 'no'; }).join('\n');
    },
    tests() {
      const g = rng(907); const out = ['6 5\n1 3\n1 2\n2 5\n3 4\n4 5\n3\n1 4\n2 6\n6 6\n', '2 1\n1 2\n2\n1 2\n2 1\n'];
      for (const [n, e] of shapes(g)) { const q = Math.min(n >= 20000 ? 8000 : 400, 20000); out.push(`${graphText(n, e)}${q}\n${many(q, () => `${randInt(g, 1, n)} ${randInt(g, 1, n)}`).join('\n')}\n`); }
      return out;
    }
  },

  {
    ...easy,
    slug: 'component-sizes',
    title: 'The Sizes of All the Groups',
    tags: ['graph', 'bfs', 'connected-components', 'sorting'],
    concept: {
      title: 'The size of a component is the number of nodes the search reaches from its first node',
      body: [
        'In the component search, the queue of a search holds **exactly the nodes of one component** when it ends. So the size of the component is simply the **length of the queue** at the end of the search. Collect the sizes of all the components in a list, then sort it.',
        { code: 'sizes = []\nseen = [False] * (n + 1)\nfor start in range(1, n + 1):\n    if seen[start]:\n        continue\n    seen[start] = True\n    queue = [start]\n    for v in queue:\n        for w in adj[v]:\n            if not seen[w]:\n                seen[w] = True\n                queue.append(w)\n    sizes.append(len(queue))\nsizes.sort(reverse=True)' },
        'The sizes always add up to `n` (every node is in exactly one component), which is a quick check. The largest component is called the *giant component* in networks, and the number of components of each size is a useful way to describe a network.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. Print the sizes of all its connected components in non-increasing order (a node without edges is a component of size 1).'],
    outputFormat: ['The sizes on one line, from the largest to the smallest.'],
    examples: [{ input: '7 3\n1 2\n2 3\n4 5\n', note: 'The components {1, 2, 3}, {4, 5}, {6} and {7}: 3 2 1 1.' }],
    hints: ['After a search from a new node, the queue contains exactly its component.', 'Remember the length of the queue as the size of the component.', 'Sort all the sizes from the largest to the smallest.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<algorithm>', '<functional>'],
      python: J(ADJ.python, r`
        sizes = []
        seen = [False] * (n + 1)
        for start in range(1, n + 1):
            if seen[start]:
                continue
            seen[start] = True
            queue = [start]
            for v in queue:
                for w in adj[v]:
                    if not seen[w]:
                        seen[w] = True
                        queue.append(w)
            sizes.append(len(queue))
        sizes.sort(reverse=True)
        print(*sizes)`),
      cpp: J(ADJ.cpp, r`
        vector<long long> sizes;
        vector<char> seen(n + 1, 0);
        for (int start = 1; start <= n; start++) {
            if (seen[start]) continue;
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
            sizes.push_back((long long)queue.size());
        }
        sort(sizes.begin(), sizes.end(), greater<long long>());
        for (size_t i = 0; i < sizes.size(); i++) cout << (i ? " " : "") << sizes[i];
        cout << "\n";`),
      java: J(ADJ.java, r`
        List<Integer> sizes = new ArrayList<>();
        boolean[] seen = new boolean[nodes + 1];
        for (int start = 1; start <= nodes; start++) {
            if (seen[start]) continue;
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
            sizes.add(queue.size());
        }
        Collections.sort(sizes, Collections.reverseOrder());
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < sizes.size(); i++) out.append(i > 0 ? " " : "").append(sizes.get(i));
        System.out.println(out);`)
    },
    solution: { explanation: ['After a search from each new node the queue is exactly one component, so its length is the size; the sizes are sorted from the largest to the smallest.'], complexity: 'Time O(n + m + c log c) for c components, space O(n + m).' },
    solve(input) { const { n, edges } = parse(input); const { comp, count } = components(n, edges); const size = new Array(count + 1).fill(0); for (let v = 1; v <= n; v++) size[comp[v]]++; return size.slice(1).sort((a, b) => b - a).join(' '); },
    tests() {
      const g = rng(908); const out = ['7 3\n1 2\n2 3\n4 5\n', '2 1\n1 2\n'];
      for (const [n, e] of shapes(g)) out.push(graphText(n, e));
      return out;
    }
  },

  {
    ...easy,
    constraints: ['3 <= n <= 20000', 'm = n - 1', 'The graph is a star: one node, the centre, is joined to each of the other nodes, and there are no other edges.'],
    slug: 'center-of-a-star',
    title: 'Find the Centre of the Star',
    tags: ['graph', 'degree'],
    concept: {
      title: 'The centre of a star is the node that every edge touches',
      body: [
        'A **star graph** has one *centre* joined to every other node, and no other edges. It is the simplest shape with a "hub". The centre has degree `n - 1`; every other node has degree 1.',
        'There are two easy ways to find the centre. One is to count the degrees and pick the node with degree `n - 1`. The other is to notice that **every edge contains the centre**: so the centre is the node that appears in both the first edge and the second edge. Only two edges are needed, because two different edges of a star share exactly the centre.',
        { code: 'a, b = edges[0]\nc, d = edges[1]\ncentre = a if a == c or a == d else b' },
        'This is a tiny example of the way graph problems are often solved by a **structural property** (here: the centre lies on every edge), without any search. The condition `n >= 3` avoids the case of a single edge, where both ends would be a valid "centre".'
      ]
    },
    statement: ['The graph with `n` nodes and `n - 1` edges is a star: one node (the centre) is joined to each of the other nodes, and there are no other edges. Print the centre.'],
    outputFormat: ['Print the number of the centre.'],
    examples: [{ input: '5 4\n4 1\n2 4\n4 3\n5 4\n', note: 'Node 4 is in all four edges.' }],
    hints: ['The centre belongs to every edge.', 'Look at the first two edges: they share exactly one node.', 'Or count the degrees and take the node with degree n - 1.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: r`
        a, b = edges[0]
        c, d = edges[1]
        print(a if a == c or a == d else b)`,
      cpp: r`
        long long a = edges[0][0], b = edges[0][1], c = edges[1][0], d = edges[1][1];
        cout << (a == c || a == d ? a : b) << "\n";`,
      java: r`
        long a = edges[0][0], b = edges[0][1], c = edges[1][0], d = edges[1][1];
        System.out.println(a == c || a == d ? a : b);`
    },
    solution: { explanation: ['The centre is on every edge, so it is the node shared by the first two edges.'], complexity: 'Time O(1) after reading the input, space O(1).' },
    solve(input) { const { edges } = parse(input); const [a, b] = edges[0]; return String(edges[1].includes(a) ? a : b); },
    tests() {
      const g = rng(909); const out = ['5 4\n4 1\n2 4\n4 3\n5 4\n', '3 2\n1 2\n2 3\n', '3 2\n2 1\n3 1\n'];
      for (const n of [4, 5, 10, 100, 1000, 20000]) for (let t = 0; t < 2; t++) out.push(graphText(n, mix(g, randomTreeEdges(g, n, 'star'))));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: DIR_INPUT,
    constraints: ['2 <= n <= 20000', '1 <= m <= 30000', 'No self-loops and no repeated edges. An edge `u v` means that the person `u` trusts the person `v`.'],
    slug: 'town-judge',
    title: 'Find the Town Judge',
    tags: ['graph', 'directed-graph', 'degree'],
    concept: {
      title: 'In a directed graph every node has an in-degree and an out-degree',
      body: [
        'In a **directed graph** an edge `u -> v` goes from `u` to `v` only; it may be followed in one direction. A node then has two degrees: the **out-degree**, the number of edges that start at it, and the **in-degree**, the number of edges that end at it. Directed graphs describe one-way streets, "follows" relations, dependencies between tasks, and trust.',
        'Here an edge `u v` means "person `u` trusts person `v`". The *town judge* is a person who **trusts nobody** (out-degree 0) and is **trusted by everybody else** (in-degree `n - 1`). There is at most one such person. Count the two degrees in one pass over the edges and look for a node with out-degree 0 and in-degree `n - 1`.',
        { code: 'out_degree = [0] * (n + 1)\nin_degree = [0] * (n + 1)\nfor u, v in edges:\n    out_degree[u] += 1\n    in_degree[v] += 1\nfor v in range(1, n + 1):\n    if out_degree[v] == 0 and in_degree[v] == n - 1:\n        print(v)\n        break\nelse:\n    print(-1)' },
        'No search is needed. The edge list is read once, so the time is O(n + m). The two numbers per node ("how many point to me" and "how many I point to") are also the start of the topological sort, in a later task.'
      ]
    },
    statement: ['In a town of `n` people, an edge `u v` means that person `u` trusts person `v`. The town judge trusts nobody, and everybody else trusts the judge. Print the number of the judge, or -1 if there is no judge.'],
    outputFormat: ['Print the judge or -1.'],
    examples: [{ input: '3 2\n1 3\n2 3\n', note: 'Person 3 trusts nobody and is trusted by 1 and 2.' }, { input: '3 3\n1 3\n2 3\n3 1\n', note: 'Person 3 trusts person 1, so nobody can be the judge: -1.' }],
    hints: ['Count for every person how many people he trusts (out) and how many trust him (in).', 'The judge has out-degree 0 and in-degree n - 1.', 'Print the first such person, or -1.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: r`
        out_degree = [0] * (n + 1)
        in_degree = [0] * (n + 1)
        for u, v in edges:
            out_degree[u] += 1
            in_degree[v] += 1
        judge = -1
        for v in range(1, n + 1):
            if out_degree[v] == 0 and in_degree[v] == n - 1:
                judge = v
                break
        print(judge)`,
      cpp: r`
        vector<long long> outDegree(n + 1, 0), inDegree(n + 1, 0);
        for (const vector<long long>& e : edges) {
            outDegree[e[0]]++;
            inDegree[e[1]]++;
        }
        long long judge = -1;
        for (int v = 1; v <= n; v++) {
            if (outDegree[v] == 0 && inDegree[v] == n - 1) {
                judge = v;
                break;
            }
        }
        cout << judge << "\n";`,
      java: r`
        long[] outDegree = new long[(int) n + 1];
        long[] inDegree = new long[(int) n + 1];
        for (long[] e : edges) {
            outDegree[(int) e[0]]++;
            inDegree[(int) e[1]]++;
        }
        long judge = -1;
        for (int v = 1; v <= n; v++) {
            if (outDegree[v] == 0 && inDegree[v] == n - 1) {
                judge = v;
                break;
            }
        }
        System.out.println(judge);`
    },
    solution: { explanation: ['The out-degree and the in-degree of every person are counted in one pass; the judge is the person with out-degree 0 and in-degree n - 1.'], complexity: 'Time O(n + m), space O(n).' },
    solve(input) { const { n, edges } = parse(input); const o = new Array(n + 1).fill(0), i = new Array(n + 1).fill(0); for (const [u, v] of edges) { o[u]++; i[v]++; } for (let v = 1; v <= n; v++) if (o[v] === 0 && i[v] === n - 1) return String(v); return '-1'; },
    tests() {
      const g = rng(910); const out = ['3 2\n1 3\n2 3\n', '3 3\n1 3\n2 3\n3 1\n', '2 1\n1 2\n', '2 1\n2 1\n'];
      const withJudge = (n, extra) => { const j = randInt(g, 1, n); const edges = []; for (let v = 1; v <= n; v++) if (v !== j) edges.push([v, j]); const seen = new Set(edges.map((e) => e[0] * (n + 1) + e[1]));
        while (edges.length < n - 1 + extra) { const u = randInt(g, 1, n), v = randInt(g, 1, n); if (u === v || u === j || seen.has(u * (n + 1) + v)) continue; seen.add(u * (n + 1) + v); edges.push([u, v]); }
        return edges; };
      for (const [n, extra] of [[3, 0], [10, 5], [200, 300], [20000, 0], [20000, 9000]]) out.push(graphText(n, mix(g, withJudge(n, extra))));
      for (const n of [4, 50, 20000]) { const e = withJudge(n, 3); e.pop(); e.splice(0, 1); out.push(graphText(n, mix(g, e.length ? e : [[1, 2]]))); } // one trust missing: no judge
      for (const n of [5, 100, 20000]) out.push(graphText(n, mix(g, randomDirected(g, n, Math.min(n * 2, 30000)))));
      return out;
    }
  }
];
