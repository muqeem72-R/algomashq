import { r, rng, randInt, many, nums, rows, shuffle } from '../../lib.mjs';
import { graphText, randomEdges, randomTreeEdges, connectedEdges, randomDirected, randomDag, adjacency, mix, Heap } from '../../graphlib.mjs';
import { J, ADJ, DIR, EDGE_INPUT, DIR_INPUT, WDIR_INPUT } from '../../graphcode.mjs';
import { SCC, MATCHING, EDGE_ARRAYS_JAVA, CSR_JAVA } from '../../graphcode2.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const parse = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); return { n, m, edges: many(m, (i) => nums(rs[i + 1])), rs }; };
const E = (g, n, m) => mix(g, randomEdges(g, n, m));
const D = (g, n, m) => shuffle(g, randomDirected(g, n, m));
const DAG = (g, n, m) => shuffle(g, randomDag(g, n, m));
const LIM = ['1 <= n <= 20000', '1 <= m <= 30000', 'There are no self-loops and no repeated edges.'];
const dirHard = { ...hard, inputFormat: DIR_INPUT, constraints: LIM };
const undirHard = { ...hard, inputFormat: EDGE_INPUT, constraints: ['2 <= n <= 20000', '1 <= m <= 30000', 'There are no self-loops and no repeated edges.'] };

// strongly connected components found with a plain reachability matrix (for the brute-force checks of small graphs)
function sccByMatrix(n, edges) {
  const reach = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(false)); for (let v = 1; v <= n; v++) reach[v][v] = true; for (const [u, v] of edges) reach[u][v] = true;
  for (let k = 1; k <= n; k++) for (let i = 1; i <= n; i++) if (reach[i][k]) for (let j = 1; j <= n; j++) if (reach[k][j]) reach[i][j] = true;
  const comp = new Array(n + 1).fill(-1); let count = 0; for (let v = 1; v <= n; v++) { if (comp[v] !== -1) continue; for (let w = 1; w <= n; w++) if (reach[v][w] && reach[w][v]) comp[w] = count; count++; }
  return { comp, count };
}
// the bridges and the cut vertices of a small undirected graph by removing each edge or vertex in turn
const componentsCount = (n, edges, skipEdge, skipNode) => { const adj = Array.from({ length: n + 1 }, () => []); edges.forEach(([u, v], i) => { if (i !== skipEdge && u !== skipNode && v !== skipNode) { adj[u].push(v); adj[v].push(u); } }); const seen = new Array(n + 1).fill(false); let c = 0; for (let s = 1; s <= n; s++) { if (s === skipNode || seen[s]) continue; c++; seen[s] = true; const q = [s]; for (let h = 0; h < q.length; h++) for (const w of adj[q[h]]) if (!seen[w]) { seen[w] = true; q.push(w); } } return c; };

export default [
  {
    ...dirHard,
    slug: 'scc-count-and-sizes',
    title: 'Groups That Can All Reach Each Other',
    tags: ['graph', 'directed-graph', 'scc', 'kosaraju'],
    concept: {
      title: 'Strongly connected components: DFS finishing order on the graph, then DFS on the reversed graph',
      body: [
        'In a directed graph, two nodes `u` and `v` are in the same *strongly connected component* (SCC) if there is a walk from `u` to `v` **and** a walk from `v` to `u`. The SCCs partition the nodes, and if every SCC is shrunk to one node, the result (the *condensation*) is a DAG. SCCs are the key to many problems about cycles in directed graphs.',
        '*Kosaraju\'s algorithm* finds them in two passes. **Pass 1:** run depth-first searches on the graph and record the nodes in the order in which they **finish** (all their descendants are done). **Pass 2:** go through the nodes in **decreasing finishing order**; for each node not yet assigned, run a search on the **reversed** graph (all edges turned around) and give everything it reaches the next component number. Why does it work? The node that finishes last lies in a *source* component (no edges come in from other components). In the reversed graph the edges leave the component only backwards, so the search stays inside the component and finds exactly it. Then that component is "removed" and the argument repeats.',
        'Both passes use an **explicit stack** instead of recursion, because a path of 20000 nodes is too deep for recursion in Python. In the first pass the stack keeps for each node on it the position of its next edge to try:',
        { code: 'for s in range(1, n + 1):\n    if seen[s]:\n        continue\n    seen[s] = True\n    stack = [s]\n    while stack:\n        v = stack[-1]\n        if pos[v] < len(adj[v]):          # try the next edge of v\n            w = adj[v][pos[v]]\n            pos[v] += 1\n            if not seen[w]:\n                seen[w] = True\n                stack.append(w)\n        else:\n            order.append(v)               # v is finished\n            stack.pop()' },
        'As a by-product the components are numbered in a **topological order** of the condensation: a component with a smaller number never has an edge coming from a component with a larger number. The time is O(n + m).'
      ]
    },
    statement: ['A directed graph has `n` nodes and `m` edges. Two nodes are in the same strongly connected component if each can be reached from the other. Print the number of strongly connected components on the first line, and on the second line the sizes of the components in non-increasing order.'],
    outputFormat: ['Line 1: the number of components. Line 2: their sizes from the largest to the smallest.'],
    examples: [{ input: '6 7\n1 2\n2 3\n3 1\n3 4\n4 5\n5 4\n6 5\n', note: 'The components are {1, 2, 3}, {4, 5} and {6}: 3 components of sizes 3 2 1.' }],
    hints: ['Do a depth-first search over all nodes and record the order in which nodes finish (use an explicit stack).', 'Go through the nodes from the last finished to the first and search on the reversed graph.', 'Each search of the second pass gives one component; count its nodes.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<algorithm>', '<functional>'],
      python: J(DIR.python, SCC('python', 'n'), r`
        sizes = [0] * comp_count
        for v in range(1, n + 1):
            sizes[comp[v]] += 1
        sizes.sort(reverse=True)
        print(comp_count)
        print(*sizes)`),
      cpp: J(DIR.cpp, SCC('cpp', 'n'), r`
        vector<long long> sizes(compCount, 0);
        for (int v = 1; v <= NN; v++) sizes[comp[v]]++;
        sort(sizes.begin(), sizes.end(), greater<long long>());
        cout << compCount << "\n";
        for (size_t i = 0; i < sizes.size(); i++) cout << (i ? " " : "") << sizes[i];
        cout << "\n";`),
      java: J(EDGE_ARRAYS_JAVA, SCC('java', 'nodes'), r`
        long[] sizes = new long[compCount];
        for (int v = 1; v <= NN; v++) sizes[comp[v]]++;
        Arrays.sort(sizes);
        StringBuilder out = new StringBuilder();
        out.append(compCount).append("\n");
        for (int i = compCount - 1; i >= 0; i--) out.append(i < compCount - 1 ? " " : "").append(sizes[i]);
        System.out.println(out);`)
    },
    solution: { explanation: ['Kosaraju\'s algorithm: an iterative depth-first search records the finishing order, then searches on the reversed graph in decreasing finishing order collect one component each. The sizes are counted and sorted.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const { comp, count } = sccByMatrixOrFast(n, edges); const sizes = new Array(count).fill(0); for (let v = 1; v <= n; v++) sizes[comp[v]]++; sizes.sort((a, b) => b - a); return `${count}\n${sizes.join(' ')}`;
    },
    tests() {
      const g = rng(981); const out = ['6 7\n1 2\n2 3\n3 1\n3 4\n4 5\n5 4\n6 5\n', '2 1\n1 2\n', '2 2\n1 2\n2 1\n'];
      crossCheck(() => { const n = randInt(g, 2, 8); return graphText(n, D(g, n, randInt(g, 1, Math.min(14, n * (n - 1))))); }, (i) => this.solve(i), (i) => { const { n, edges } = parse(i); const { comp, count } = sccByMatrix(n, edges); const sizes = new Array(count).fill(0); for (let v = 1; v <= n; v++) sizes[comp[v]]++; const list = sizes.sort((a, b) => b - a); return `${count}\n${list.join(' ')}`; }, 300);
      for (const [n, m] of [[6, 9], [40, 70], [1000, 1500], [1000, 3000], [20000, 20000], [20000, 25000], [20000, 30000], [20000, 12000]]) out.push(graphText(n, D(g, n, m)));
      out.push(graphText(20000, DAG(g, 20000, 30000)), graphText(20000, many(20000, (i) => [i + 1, (i + 1) % 20000 + 1])), graphText(20000, many(19999, (i) => [i + 1, i + 2])), graphText(20000, [...many(19999, (i) => [i + 1, i + 2]), [20000, 1]]));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `m`.', 'The second line has `n` numbers: the value of every node.', 'Each of the next `m` lines has two numbers `u` and `v`: an edge from `u` to `v`.'],
    constraints: ['1 <= n <= 20000', '1 <= m <= 30000', '1 <= every value <= 10^9', 'There are no self-loops and no repeated edges.'],
    slug: 'condensation-longest-path',
    title: 'Collect the Most Treasure on a One-Way Tour',
    tags: ['graph', 'directed-graph', 'scc', 'dp', 'condensation'],
    concept: {
      title: 'Shrink every cycle group to one node: the graph becomes acyclic and a simple DP works',
      body: [
        'Each node has a treasure value. You start at any node and walk along the edges; you may visit nodes again, but a node\'s treasure counts **only once**. What is the largest total treasure you can collect? If the graph has cycles, you can go round a cycle and collect **all** its treasures, and then leave. In fact, inside a strongly connected component you can visit all of its nodes before leaving.',
        'So replace every strongly connected component by a single node whose value is the **sum of the values of its nodes**. The new graph, the *condensation*, has no cycle, and the problem becomes the "heaviest path in a DAG" task: `best[c]` = the largest total of a path that ends in the component `c`. Process the components in a topological order: the Kosaraju numbering already gives one (sources first). A component `c` passes `best[c]` on to every component `d` that it has an edge to: `best[d] = max(best[d], best[c] + value[d])`.',
        { code: 'total = [0] * comp_count                      # the treasure of each component\nfor v in range(1, n + 1):\n    total[comp[v]] += value[v]\nbest = total[:]                                # a path may start in any component\nfor c in range(comp_count):                    # topological order\n    for v in members[c]:\n        for w in adj[v]:\n            d = comp[w]\n            if d != c and best[c] + total[d] > best[d]:\n                best[d] = best[c] + total[d]\nanswer = max(best)' },
        'The answer can reach 2 * 10^13 (20000 values of 10^9), so 64-bit integers are needed. The time is O(n + m).'
      ]
    },
    statement: ['A directed graph has `n` nodes with treasure values and `m` edges. You choose a starting node and walk along edges as far as you like; you may visit a node many times, but its treasure is collected only once. Print the largest total treasure you can collect.'],
    outputFormat: ['Print the largest total.'],
    examples: [{ input: '5 5\n1 2 3 4 5\n1 2\n2 1\n2 3\n3 4\n1 5\n', note: 'The nodes 1 and 2 form a cycle (1 + 2 = 3). The best tour is 1, 2, 3, 4 with 1 + 2 + 3 + 4 = 10; going to node 5 instead gives 1 + 2 + 5 = 8.' }],
    hints: ['Find the strongly connected components and add up the values inside each.', 'The components are numbered in topological order; process them in that order.', 'Pass the best total from a component to the components it points to, and print the largest value.'],
    program: {
      io: ['n:int m:int', 'value:int[n]', 'edges:int[m][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: J(DIR.python, SCC('python', 'n'), r`
        total = [0] * comp_count
        members = [[] for _ in range(comp_count)]
        for v in range(1, n + 1):
            total[comp[v]] += value[v - 1]
            members[comp[v]].append(v)
        best = total[:]
        for c in range(comp_count):
            for v in members[c]:
                for w in adj[v]:
                    d = comp[w]
                    if d != c and best[c] + total[d] > best[d]:
                        best[d] = best[c] + total[d]
        print(max(best))`),
      cpp: J(DIR.cpp, SCC('cpp', 'n'), r`
        vector<long long> total(compCount, 0);
        vector<vector<int>> members(compCount);
        for (int v = 1; v <= NN; v++) {
            total[comp[v]] += value[v - 1];
            members[comp[v]].push_back(v);
        }
        vector<long long> best = total;
        for (int c = 0; c < compCount; c++) {
            for (int v : members[c]) {
                for (int w : adj[v]) {
                    int d = comp[w];
                    if (d != c && best[c] + total[d] > best[d]) best[d] = best[c] + total[d];
                }
            }
        }
        cout << *max_element(best.begin(), best.end()) << "\n";`),
      java: J(EDGE_ARRAYS_JAVA, SCC('java', 'nodes'), r`
        long[] total = new long[compCount];
        int[] start = new int[compCount + 1];
        for (int v = 1; v <= NN; v++) {
            total[comp[v]] += value[v - 1];
            start[comp[v] + 1]++;
        }
        for (int c = 0; c < compCount; c++) start[c + 1] += start[c];
        int[] members = new int[NN];
        int[] filled = new int[compCount];
        for (int v = 1; v <= NN; v++) {
            members[start[comp[v]] + filled[comp[v]]] = v;
            filled[comp[v]]++;
        }
        long[] best = total.clone();
        for (int c = 0; c < compCount; c++) {
            for (int i = start[c]; i < start[c + 1]; i++) {
                int v = members[i];
                for (int k = fHead[v]; k < fHead[v + 1]; k++) {
                    int d = comp[fTo[k]];
                    if (d != c && best[c] + total[d] > best[d]) best[d] = best[c] + total[d];
                }
            }
        }
        long answer = 0;
        for (long x : best) answer = Math.max(answer, x);
        System.out.println(answer);`)
    },
    solution: { explanation: ['Strongly connected components are found and their values summed; processing the components in topological order, each component offers its best total to the components it points to. The answer is the largest total of any component.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const value = nums(rs[1]); const edges = many(m, (i) => nums(rs[i + 2])); const { comp, count } = sccByMatrixOrFast(n, edges);
      const total = new Array(count).fill(0); for (let v = 1; v <= n; v++) total[comp[v]] += value[v - 1];
      // the longest path in the condensation by a memoised search over components
      const out = Array.from({ length: count }, () => new Set()); for (const [u, v] of edges) if (comp[u] !== comp[v]) out[comp[u]].add(comp[v]);
      const memo = new Array(count).fill(-1); const order = []; const seen = new Array(count).fill(false); for (let c = 0; c < count; c++) { if (seen[c]) continue; const st = [[c, [...out[c]], 0]]; seen[c] = true; while (st.length) { const top = st[st.length - 1]; if (top[2] < top[1].length) { const d = top[1][top[2]++]; if (!seen[d]) { seen[d] = true; st.push([d, [...out[d]], 0]); } } else { order.push(top[0]); st.pop(); } } }
      for (const c of order) { let best = 0; for (const d of out[c]) best = Math.max(best, memo[d]); memo[c] = total[c] + best; }
      return String(Math.max(...memo));
    },
    tests() {
      const g = rng(982); const out = ['5 5\n1 2 3 4 5\n1 2\n2 1\n2 3\n3 4\n1 5\n', '2 1\n7 8\n1 2\n', '2 1\n7 8\n2 1\n'];
      const make = (n, m, hi, kind) => { const e = kind === 'dag' ? DAG(g, n, m) : D(g, n, m); return `${n} ${e.length}\n${many(n, () => randInt(g, 1, hi)).join(' ')}\n${e.map((x) => x.join(' ')).join('\n')}\n`; };
      for (const [n, m, hi, kind] of [[6, 9, 9, 'any'], [40, 70, 100, 'any'], [1000, 1500, 1000000, 'any'], [20000, 25000, 1000000000, 'any'], [20000, 30000, 1000000000, 'any'], [20000, 22000, 1000000000, 'dag'], [20000, 12000, 1000000000, 'any']]) out.push(make(n, m, hi, kind));
      out.push(`20000 20000\n${many(20000, () => '1000000000').join(' ')}\n${many(20000, (i) => `${i + 1} ${(i + 1) % 20000 + 1}`).join('\n')}\n`, `20000 19999\n${many(20000, () => '1000000000').join(' ')}\n${many(19999, (i) => `${i + 1} ${i + 2}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...undirHard,
    slug: 'critical-connections',
    title: 'Which Cables Cannot Be Lost?',
    tags: ['graph', 'bridges', 'tarjan', 'dfs'],
    concept: {
      title: 'A bridge is an edge whose removal splits the graph; low-link values find them in one DFS',
      body: [
        'A *bridge* (critical connection) is an edge of an undirected graph whose removal disconnects some nodes that were connected before. Bridges are the single points of failure of a network. Testing each edge by removing it and searching again costs O(m * (n + m)), far too slow.',
        '*Tarjan\'s algorithm* finds all bridges in one depth-first search. Number the nodes in the order the DFS **enters** them (`tin[v]`). For each node compute `low[v]`: the smallest `tin` that can be reached from the subtree of `v` using the tree edges downwards and **at most one back edge** (an edge to an already visited node, other than the edge to the parent). An edge from a parent `p` to its child `v` in the DFS tree is a **bridge** exactly when `low[v] > tin[p]`: nothing in the subtree of `v` can reach `p` or above by another way.',
        { code: 'if tin[w]:                                  # an old node: a back edge\n    low[v] = min(low[v], tin[w])\nelse:                                        # a new node: a tree edge\n    tin[w] = low[w] = next_time\n    ...                                      # go down; when w is finished (popped):\n    low[p] = min(low[p], low[w])\n    if low[w] > tin[p]:\n        (p, w) is a bridge' },
        'The edge to the parent must not be used as a back edge: skip it by its **edge number** (so that two parallel edges, if there were any, would still be handled right). A recursive DFS would overflow the stack on a path of 20000 nodes, so the DFS uses an explicit stack with a pointer to the next edge of every node on it. The time is O(n + m).'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges (it may be disconnected). A bridge is an edge such that removing it increases the number of connected components. Print the number of bridges on the first line, and then every bridge as `u v` with `u < v`, one per line, sorted by `u` and then by `v`.'],
    outputFormat: ['The number of bridges, then the bridges (nothing more if there are none).'],
    examples: [{ input: '5 5\n1 2\n2 3\n3 1\n3 4\n4 5\n', note: 'The triangle 1-2-3 has no bridge; the edges 3-4 and 4-5 are bridges: 2, then "3 4" and "4 5".' }],
    hints: ['Number the nodes by the order of entering (tin) and keep low, the smallest tin reachable by the subtree with one back edge.', 'Do not use the edge to the parent (compare edge numbers).', 'The tree edge parent-child is a bridge when low[child] > tin[parent].'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        adj = [[] for _ in range(n + 1)]
        for i, (u, v) in enumerate(edges):
            adj[u].append((v, i))
            adj[v].append((u, i))
        tin = [0] * (n + 1)
        low = [0] * (n + 1)
        parent_edge = [-1] * (n + 1)
        pos = [0] * (n + 1)
        timer = 0
        bridges = []
        for s in range(1, n + 1):
            if tin[s]:
                continue
            timer += 1
            tin[s] = low[s] = timer
            stack = [s]
            while stack:
                v = stack[-1]
                if pos[v] < len(adj[v]):
                    w, edge_id = adj[v][pos[v]]
                    pos[v] += 1
                    if edge_id == parent_edge[v]:
                        continue
                    if tin[w]:
                        low[v] = min(low[v], tin[w])
                    else:
                        timer += 1
                        tin[w] = low[w] = timer
                        parent_edge[w] = edge_id
                        stack.append(w)
                else:
                    stack.pop()
                    if stack:
                        p = stack[-1]
                        low[p] = min(low[p], low[v])
                        if low[v] > tin[p]:
                            bridges.append((min(p, v), max(p, v)))
        bridges.sort()
        out = [str(len(bridges))] + [str(a) + " " + str(b) for a, b in bridges]
        print("\n".join(out))`,
      cpp: r`
        vector<vector<pair<int, int>>> adj(n + 1);
        for (size_t i = 0; i < edges.size(); i++) {
            adj[edges[i][0]].push_back({(int)edges[i][1], (int)i});
            adj[edges[i][1]].push_back({(int)edges[i][0], (int)i});
        }
        vector<int> tin(n + 1, 0), low(n + 1, 0), parentEdge(n + 1, -1), pos(n + 1, 0);
        int timer = 0;
        vector<pair<int, int>> bridges;
        for (int s = 1; s <= n; s++) {
            if (tin[s]) continue;
            timer++;
            tin[s] = low[s] = timer;
            vector<int> stack = {s};
            while (!stack.empty()) {
                int v = stack.back();
                if (pos[v] < (int)adj[v].size()) {
                    int w = adj[v][pos[v]].first, edgeId = adj[v][pos[v]].second;
                    pos[v]++;
                    if (edgeId == parentEdge[v]) continue;
                    if (tin[w]) {
                        low[v] = min(low[v], tin[w]);
                    } else {
                        timer++;
                        tin[w] = low[w] = timer;
                        parentEdge[w] = edgeId;
                        stack.push_back(w);
                    }
                } else {
                    stack.pop_back();
                    if (!stack.empty()) {
                        int p = stack.back();
                        low[p] = min(low[p], low[v]);
                        if (low[v] > tin[p]) bridges.push_back({min(p, v), max(p, v)});
                    }
                }
            }
        }
        sort(bridges.begin(), bridges.end());
        cout << bridges.size() << "\n";
        for (const auto& b : bridges) cout << b.first << " " << b.second << "\n";`,
      java: J(CSR_JAVA, r`
        int[] tin = new int[nodes + 1], low = new int[nodes + 1], parentEdge = new int[nodes + 1], pos = new int[nodes + 1];
        Arrays.fill(parentEdge, -1);
        int timer = 0;
        long[] bridges = new long[nodes + 1];
        int bridgeCount = 0;
        int[] stack = new int[nodes + 1];
        for (int s = 1; s <= nodes; s++) {
            if (tin[s] != 0) continue;
            timer++;
            tin[s] = low[s] = timer;
            int top = 0;
            stack[top++] = s;
            while (top > 0) {
                int v = stack[top - 1];
                if (head[v] + pos[v] < head[v + 1]) {
                    int k = head[v] + pos[v];
                    pos[v]++;
                    int w = to[k], edgeId = eid[k];
                    if (edgeId == parentEdge[v]) continue;
                    if (tin[w] != 0) {
                        low[v] = Math.min(low[v], tin[w]);
                    } else {
                        timer++;
                        tin[w] = low[w] = timer;
                        parentEdge[w] = edgeId;
                        stack[top++] = w;
                    }
                } else {
                    top--;
                    if (top > 0) {
                        int p = stack[top - 1];
                        low[p] = Math.min(low[p], low[v]);
                        if (low[v] > tin[p]) bridges[bridgeCount++] = (long) Math.min(p, v) * (nodes + 1) + Math.max(p, v);
                    }
                }
            }
        }
        Arrays.sort(bridges, 0, bridgeCount);
        StringBuilder out = new StringBuilder();
        out.append(bridgeCount).append("\n");
        for (int i = 0; i < bridgeCount; i++) out.append(bridges[i] / (nodes + 1)).append(" ").append(bridges[i] % (nodes + 1)).append("\n");
        System.out.print(out);`)
    },
    solution: { explanation: ['An iterative depth-first search computes entering times and low-link values; a tree edge from p to v is a bridge when low[v] > tin[p]. The bridges are sorted and printed with their number first.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const base = componentsCount(n, edges, -1, -1); const list = [];
      if (n <= 60) { edges.forEach(([u, v], i) => { if (componentsCount(n, edges, i, -1) > base) list.push([Math.min(u, v), Math.max(u, v)]); }); }
      else { // low-link values with an explicit stack (same idea as the solutions, written independently)
        const adj = Array.from({ length: n + 1 }, () => []); edges.forEach(([u, v], i) => { adj[u].push([v, i]); adj[v].push([u, i]); }); const tin = new Array(n + 1).fill(0), low = new Array(n + 1).fill(0), pe = new Array(n + 1).fill(-1), it = new Array(n + 1).fill(0); let timer = 0;
        for (let s = 1; s <= n; s++) { if (tin[s]) continue; tin[s] = low[s] = ++timer; const st = [s]; while (st.length) { const v = st[st.length - 1]; if (it[v] < adj[v].length) { const [w, id] = adj[v][it[v]++]; if (id === pe[v]) continue; if (tin[w]) low[v] = Math.min(low[v], tin[w]); else { tin[w] = low[w] = ++timer; pe[w] = id; st.push(w); } } else { st.pop(); if (st.length) { const p = st[st.length - 1]; low[p] = Math.min(low[p], low[v]); if (low[v] > tin[p]) list.push([Math.min(p, v), Math.max(p, v)]); } } } } }
      list.sort((a, b) => a[0] - b[0] || a[1] - b[1]); return [String(list.length), ...list.map((x) => x.join(' '))].join('\n');
    },
    tests() {
      const g = rng(983); const out = ['5 5\n1 2\n2 3\n3 1\n3 4\n4 5\n', '2 1\n1 2\n', '3 3\n1 2\n2 3\n3 1\n'];
      crossCheck(() => { const n = randInt(g, 2, 9); return graphText(n, E(g, n, randInt(g, 1, Math.min(14, n * (n - 1) / 2)))); }, (i) => this.solve(i), (i) => { const { n, edges } = parse(i); const base = componentsCount(n, edges, -1, -1); const list = []; edges.forEach(([u, v], k) => { if (componentsCount(n, edges, k, -1) > base) list.push([Math.min(u, v), Math.max(u, v)]); }); list.sort((a, b) => a[0] - b[0] || a[1] - b[1]); return [String(list.length), ...list.map((x) => x.join(' '))].join('\n'); }, 300);
      for (const [n, m] of [[8, 9], [40, 50], [1000, 1100], [20000, 20000], [20000, 21000], [20000, 30000], [20000, 12000]]) out.push(graphText(n, E(g, n, m)));
      out.push(graphText(20000, mix(g, randomTreeEdges(g, 20000))), graphText(20000, mix(g, randomTreeEdges(g, 20000, 'path'))), graphText(20000, many(20000, (i) => [i + 1, (i + 1) % 20000 + 1])), graphText(20000, connectedEdges(g, 20000, 500)));
      return out;
    }
  },

  {
    ...undirHard,
    slug: 'articulation-points',
    title: 'Which Junctions Cut the Network in Two?',
    tags: ['graph', 'articulation-points', 'tarjan', 'dfs'],
    concept: {
      title: 'A cut vertex is a node whose removal disconnects the graph; the same low-link values show them',
      body: [
        'An *articulation point* (cut vertex) is a node of an undirected graph such that removing it, together with its edges, increases the number of connected components. These are the single points of failure among **routers or junctions**, in the same way as bridges are among cables.',
        'The same depth-first search as for bridges works. With `tin` and `low` as before, a node `p` that is **not the root** of its DFS tree is an articulation point if it has a DFS child `v` with `low[v] >= tin[p]`: the subtree of `v` cannot get above `p` without passing through `p`. (Note `>=` here, not `>` as for bridges: reaching `p` itself is not enough to avoid it.) The **root** is a special case: it is an articulation point exactly when it has **two or more children** in the DFS tree, because then the children\'s subtrees are not connected to each other except through the root.',
        { code: 'pop v, parent p = stack top:\n    low[p] = min(low[p], low[v])\n    if p != root and low[v] >= tin[p]:\n        cut[p] = True\n    if p == root:\n        children += 1\n# after finishing the tree of the root:\nif children >= 2:\n    cut[root] = True' },
        'The search is iterative, with a pointer to the next edge of every node on the stack. Each connected component is searched separately, and the time is O(n + m). The answer is the number of such nodes and their list in increasing order.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges (it may be disconnected). An articulation point is a node such that removing it (with all its edges) increases the number of connected components. Print the number of articulation points on the first line and, if there is at least one, their numbers in increasing order on the second line.'],
    outputFormat: ['The number of articulation points, and then their list on one line (no second line if there are none).'],
    examples: [{ input: '5 5\n1 2\n2 3\n3 1\n3 4\n4 5\n', note: 'Removing 3 separates {1, 2} from {4, 5}, and removing 4 separates 5: the articulation points are 3 and 4.' }],
    hints: ['Use the same DFS as for bridges: entering times tin and low-link values low.', 'A non-root node p is an articulation point if some child v has low[v] >= tin[p].', 'The root is one if it has at least two DFS children.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: J(ADJ.python, r`
        tin = [0] * (n + 1)
        low = [0] * (n + 1)
        pos = [0] * (n + 1)
        parent = [0] * (n + 1)
        cut = [False] * (n + 1)
        timer = 0
        for root in range(1, n + 1):
            if tin[root]:
                continue
            timer += 1
            tin[root] = low[root] = timer
            children = 0
            stack = [root]
            while stack:
                v = stack[-1]
                if pos[v] < len(adj[v]):
                    w = adj[v][pos[v]]
                    pos[v] += 1
                    if w == parent[v]:
                        continue
                    if tin[w]:
                        low[v] = min(low[v], tin[w])
                    else:
                        timer += 1
                        tin[w] = low[w] = timer
                        parent[w] = v
                        stack.append(w)
                else:
                    stack.pop()
                    if stack:
                        p = stack[-1]
                        low[p] = min(low[p], low[v])
                        if p != root and low[v] >= tin[p]:
                            cut[p] = True
                        if p == root:
                            children += 1
            if children >= 2:
                cut[root] = True
        found = [v for v in range(1, n + 1) if cut[v]]
        print(len(found))
        if found:
            print(*found)`),
      cpp: J(ADJ.cpp, r`
        vector<int> tin(n + 1, 0), low(n + 1, 0), pos(n + 1, 0), parent(n + 1, 0);
        vector<char> cut(n + 1, 0);
        int timer = 0;
        for (int root = 1; root <= n; root++) {
            if (tin[root]) continue;
            timer++;
            tin[root] = low[root] = timer;
            int children = 0;
            vector<int> stack = {root};
            while (!stack.empty()) {
                int v = stack.back();
                if (pos[v] < (int)adj[v].size()) {
                    int w = adj[v][pos[v]++];
                    if (w == parent[v]) continue;
                    if (tin[w]) {
                        low[v] = min(low[v], tin[w]);
                    } else {
                        timer++;
                        tin[w] = low[w] = timer;
                        parent[w] = v;
                        stack.push_back(w);
                    }
                } else {
                    stack.pop_back();
                    if (!stack.empty()) {
                        int p = stack.back();
                        low[p] = min(low[p], low[v]);
                        if (p != root && low[v] >= tin[p]) cut[p] = 1;
                        if (p == root) children++;
                    }
                }
            }
            if (children >= 2) cut[root] = 1;
        }
        vector<int> found;
        for (int v = 1; v <= n; v++) {
            if (cut[v]) found.push_back(v);
        }
        cout << found.size() << "\n";
        for (size_t i = 0; i < found.size(); i++) cout << (i ? " " : "") << found[i];
        if (!found.empty()) cout << "\n";`),
      java: J(CSR_JAVA, r`
        int[] tin = new int[nodes + 1], low = new int[nodes + 1], pos = new int[nodes + 1], parent = new int[nodes + 1];
        boolean[] cut = new boolean[nodes + 1];
        int[] stack = new int[nodes + 1];
        int timer = 0;
        for (int root = 1; root <= nodes; root++) {
            if (tin[root] != 0) continue;
            timer++;
            tin[root] = low[root] = timer;
            int children = 0;
            int top = 0;
            stack[top++] = root;
            while (top > 0) {
                int v = stack[top - 1];
                if (head[v] + pos[v] < head[v + 1]) {
                    int w = to[head[v] + pos[v]];
                    pos[v]++;
                    if (w == parent[v]) continue;
                    if (tin[w] != 0) {
                        low[v] = Math.min(low[v], tin[w]);
                    } else {
                        timer++;
                        tin[w] = low[w] = timer;
                        parent[w] = v;
                        stack[top++] = w;
                    }
                } else {
                    top--;
                    if (top > 0) {
                        int p = stack[top - 1];
                        low[p] = Math.min(low[p], low[v]);
                        if (p != root && low[v] >= tin[p]) cut[p] = true;
                        if (p == root) children++;
                    }
                }
            }
            if (children >= 2) cut[root] = true;
        }
        StringBuilder out = new StringBuilder();
        int count = 0;
        for (int v = 1; v <= nodes; v++) {
            if (cut[v]) {
                out.append(count > 0 ? " " : "").append(v);
                count++;
            }
        }
        System.out.println(count);
        if (count > 0) System.out.println(out);`)
    },
    solution: { explanation: ['With entering times and low-link values from an iterative DFS, a non-root node is an articulation point when some child has low >= tin of the node; the root is one when it has at least two DFS children.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const base = componentsCount(n, edges, -1, -1); const list = [];
      if (n <= 60) {
        for (let v = 1; v <= n; v++) { // removing v leaves n - 1 nodes; v itself was one component if it is isolated
          const isolated = !edges.some(([a, b]) => a === v || b === v); const after = componentsCount(n, edges, -1, v); if (after > base - (isolated ? 1 : 0)) list.push(v); }
      } else { // entering times and low-link values with explicit stacks (written independently of the solutions)
        const adj = Array.from({ length: n + 1 }, () => []); for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
        const tin = new Array(n + 1).fill(0), low = new Array(n + 1).fill(0), par = new Array(n + 1).fill(0), it = new Array(n + 1).fill(0), cut = new Array(n + 1).fill(false); let timer = 0;
        for (let root = 1; root <= n; root++) { if (tin[root]) continue; tin[root] = low[root] = ++timer; let kids = 0; const st = [root]; while (st.length) { const v = st[st.length - 1]; if (it[v] < adj[v].length) { const w = adj[v][it[v]++]; if (w === par[v]) continue; if (tin[w]) low[v] = Math.min(low[v], tin[w]); else { tin[w] = low[w] = ++timer; par[w] = v; st.push(w); } } else { st.pop(); if (st.length) { const p = st[st.length - 1]; low[p] = Math.min(low[p], low[v]); if (p !== root && low[v] >= tin[p]) cut[p] = true; if (p === root) kids++; } } } if (kids >= 2) cut[root] = true; }
        for (let v = 1; v <= n; v++) if (cut[v]) list.push(v);
      }
      return list.length ? `${list.length}\n${list.join(' ')}` : '0';
    },
    tests() {
      const g = rng(984); const out = ['5 5\n1 2\n2 3\n3 1\n3 4\n4 5\n', '2 1\n1 2\n', '3 2\n1 2\n2 3\n'];
      crossCheck(() => { const n = randInt(g, 2, 9); return graphText(n, E(g, n, randInt(g, 1, Math.min(14, n * (n - 1) / 2)))); }, (i) => this.solve(i), (i) => { const { n, edges } = parse(i); const adj = adjacency(n, edges); const res = []; for (let v = 1; v <= n; v++) { const before = componentsCount(n, edges, -1, -1); const isolated = adj[v].length === 0; if (componentsCount(n, edges, -1, v) > before - (isolated ? 1 : 0)) res.push(v); } return res.length ? `${res.length}\n${res.join(' ')}` : '0'; }, 300);
      for (const [n, m] of [[8, 9], [40, 50], [1000, 1100], [20000, 20000], [20000, 21000], [20000, 30000], [20000, 12000]]) out.push(graphText(n, E(g, n, m)));
      out.push(graphText(20000, mix(g, randomTreeEdges(g, 20000))), graphText(20000, mix(g, randomTreeEdges(g, 20000, 'path'))), graphText(20000, mix(g, randomTreeEdges(g, 20000, 'star'))), graphText(20000, many(20000, (i) => [i + 1, (i + 1) % 20000 + 1])));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `m`: the number of variables and the number of clauses.', 'Each of the next `m` lines has two non-zero numbers `a` and `b`: the clause (`a` or `b`). A positive number `x` means that the variable `x` is true, a negative number `-x` means that the variable `x` is false.'],
    constraints: ['1 <= n <= 10000', '1 <= m <= 30000', '1 <= |a|, |b| <= n'],
    slug: 'two-sat-satisfiable',
    title: 'Can All the "Either-Or" Conditions Hold?',
    tags: ['graph', 'directed-graph', 'scc', '2-sat', 'logic'],
    concept: {
      title: '2-SAT: every clause (a or b) gives two implications; the formula is satisfiable unless x and not-x imply each other',
      body: [
        'A formula is a list of clauses; each clause says that **at least one of two literals is true**, such as `(x1 or not x2)`. Can the variables be set to true or false so that **all** clauses hold? This is called *2-SAT*. (With three literals per clause the problem is hard, but with two it is easy, thanks to graphs.)',
        'A clause `(a or b)` is the same as two **implications**: if `a` is false then `b` must be true (`not a -> b`), and if `b` is false then `a` must be true (`not b -> a`). Build a directed graph with a node for every literal (`x` and `not x` for each variable, so `2n` nodes) and these two edges for each clause. A path `l1 -> ... -> l2` means that if `l1` is true then `l2` must be true.',
        'If a variable `x` and its negation are in the **same strongly connected component**, then `x` implies `not x` and `not x` implies `x`: a contradiction, so the formula is **not** satisfiable. If no variable is in the same component as its negation, the formula **is** satisfiable (one can choose, for each variable, the literal whose component comes later in the topological order). So the answer needs only the SCCs of the implication graph:',
        { code: 'def node(l):\n    return 2 * l - 1 if l > 0 else -2 * l          # x true -> 2x - 1, x false -> 2x\nfor a, b in clauses:\n    adj[node(-a)].append(node(b))                   # not a -> b\n    adj[node(-b)].append(node(a))                   # not b -> a\n# SCCs of the graph with 2n nodes (Kosaraju, no recursion)\nsatisfiable = all(comp[2 * x - 1] != comp[2 * x] for x in range(1, n + 1))' },
        'The time is O(n + m). This reduction of a logic question to graph reachability is a classic.'
      ]
    },
    statement: ['There are `n` boolean variables and `m` clauses; each clause `a b` is true if the literal `a` or the literal `b` is true (a literal `x` is the variable `x`, a literal `-x` is its negation). Print `yes` if the variables can be given values so that all clauses are true, and `no` otherwise.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '2 3\n1 2\n-1 2\n1 -2\n', note: 'Setting both variables to true satisfies all three clauses: yes.' }, { input: '1 2\n1 1\n-1 -1\n', note: 'The first clause needs x true and the second needs x false: no.' }],
    hints: ['Each clause (a or b) gives the edges "not a -> b" and "not b -> a" in a graph with a node for each literal.', 'Find the strongly connected components of this graph.', 'If some variable and its negation are in one component, print no; otherwise yes.'],
    program: {
      io: ['n:int m:int', 'clauses:int[m][2]'],
      fast: true,
      python: J(r`
        adj = [[] for _ in range(2 * n + 1)]

        def node(literal):
            return 2 * literal - 1 if literal > 0 else -2 * literal

        for a, b in clauses:
            adj[node(-a)].append(node(b))
            adj[node(-b)].append(node(a))`, SCC('python', '2 * n'), r`
        print("yes" if all(comp[2 * x - 1] != comp[2 * x] for x in range(1, n + 1)) else "no")`),
      cpp: J(r`
        vector<vector<int>> adj(2 * n + 1);
        auto node = [](long long literal) { return (int)(literal > 0 ? 2 * literal - 1 : -2 * literal); };
        for (const vector<long long>& c : clauses) {
            adj[node(-c[0])].push_back(node(c[1]));
            adj[node(-c[1])].push_back(node(c[0]));
        }`, SCC('cpp', '2 * n'), r`
        bool ok = true;
        for (int x = 1; x <= n; x++) {
            if (comp[2 * x - 1] == comp[2 * x]) ok = false;
        }
        cout << (ok ? "yes" : "no") << "\n";`),
      java: J(r`
        int nodes = (int) (2 * n);
        int[] eu = new int[2 * clauses.length];
        int[] ev = new int[2 * clauses.length];
        for (int i = 0; i < clauses.length; i++) {
            eu[2 * i] = node(-clauses[i][0]);
            ev[2 * i] = node(clauses[i][1]);
            eu[2 * i + 1] = node(-clauses[i][1]);
            ev[2 * i + 1] = node(clauses[i][0]);
        }`, SCC('java', 'nodes'), r`
        boolean ok = true;
        for (int x = 1; x <= n; x++) {
            if (comp[2 * x - 1] == comp[2 * x]) ok = false;
        }
        System.out.println(ok ? "yes" : "no");`),
      helpers: {
        python: '',
        cpp: '',
        java: r`
          static int node(long literal) {
              return (int) (literal > 0 ? 2 * literal - 1 : -2 * literal);
          }`
      }
    },
    solution: { explanation: ['Each clause adds the implications not a -> b and not b -> a; the strongly connected components of the implication graph are computed, and the formula is satisfiable exactly when no variable shares a component with its negation.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const clauses = many(m, (i) => nums(rs[i + 1]));
      if (n <= 14) { for (let mask = 0; mask < (1 << n); mask++) { const val = (l) => (l > 0 ? (mask >> (l - 1)) & 1 : 1 - ((mask >> (-l - 1)) & 1)); if (clauses.every(([a, b]) => val(a) || val(b))) return 'yes'; } return 'no'; }
      const node = (l) => (l > 0 ? 2 * l - 1 : -2 * l); const N = 2 * n; const edges = []; for (const [a, b] of clauses) { edges.push([node(-a), node(b)], [node(-b), node(a)]); }
      const { comp } = sccByMatrixOrFast(N, edges); for (let x = 1; x <= n; x++) if (comp[2 * x - 1] === comp[2 * x]) return 'no'; return 'yes';
    },
    tests() {
      const g = rng(985); const out = ['2 3\n1 2\n-1 2\n1 -2\n', '1 2\n1 1\n-1 -1\n', '1 1\n1 -1\n'];
      const lit = (n) => (g() < 0.5 ? 1 : -1) * randInt(g, 1, n);
      const random = (n, m) => `${n} ${m}\n${many(m, () => `${lit(n)} ${lit(n)}`).join('\n')}\n`;
      const planted = (n, m, spoil) => { const val = many(n + 1, () => g() < 0.5); const cl = []; while (cl.length < m) { const a = lit(n), b = lit(n); const t = (l) => (l > 0 ? val[l] : !val[-l]); if (t(a) || t(b)) cl.push(`${a} ${b}`); } if (spoil) { const x = randInt(g, 1, n); cl[0] = `${x} ${x}`; cl[1] = `${-x} ${-x}`; } return `${n} ${cl.length}\n${shuffle(g, cl).join('\n')}\n`; };
      for (const [n, m] of [[5, 6], [8, 12], [12, 20], [14, 30]]) for (let t = 0; t < 3; t++) out.push(random(n, m));
      crossCheck(() => random(randInt(g, 1, 8), randInt(g, 1, 14)), (i) => this.solve(i), (i) => { const rs = rows(i); const [n, m] = nums(rs[0]); const cl = many(m, (k) => nums(rs[k + 1])); for (let mask = 0; mask < (1 << n); mask++) { const val = (l) => (l > 0 ? (mask >> (l - 1)) & 1 : 1 - ((mask >> (-l - 1)) & 1)); if (cl.every(([a, b]) => val(a) || val(b))) return 'yes'; } return 'no'; }, 300);
      for (const [n, m] of [[200, 150], [200, 300], [1000, 1000], [1000, 1500], [10000, 10000], [10000, 15000], [10000, 30000]]) out.push(random(n, m));
      for (const [n, m] of [[100, 300], [3000, 9000], [10000, 30000], [10000, 14000]]) { out.push(planted(n, m, false)); out.push(planted(n, m, true)); }
      out.push(`10000 10000\n${many(10000, (i) => `${-(i + 1)} ${i === 9999 ? 1 : i + 2}`).join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `l`, `r` and `m`: the number of left nodes, the number of right nodes and the number of edges.', 'Each of the next `m` lines has two numbers `a` and `b`: an edge between the left node `a` and the right node `b`.'],
    constraints: ['1 <= l, r <= 500', '1 <= m <= 6000', 'There are no repeated edges.'],
    slug: 'maximum-bipartite-matching',
    title: 'Pair Up As Many As Possible',
    tags: ['graph', 'bipartite', 'matching', 'augmenting-path'],
    concept: {
      title: 'Matching by augmenting paths: a pair can be rearranged to make room for one more',
      body: [
        'Workers on the left, jobs on the right; an edge means "this worker can do this job". A *matching* gives each worker at most one job and each job at most one worker. Find a matching with as **many pairs** as possible. A greedy choice (take any free pair) can get stuck: giving job B to worker 1 may block worker 2, who could only do B, while worker 1 could also do job A.',
        'The cure is the *augmenting path* idea. Given a matching, an augmenting path starts at a **free** left node, then alternates: a non-matching edge to a right node, a matching edge back to the left, and so on, and finally ends at a **free** right node. Flipping the path (the matching edges become non-matching and vice versa) gives a matching with **one more pair**. A matching is maximum exactly when there is no augmenting path (Berge\'s theorem).',
        'So go through the left nodes one by one and search for an augmenting path from each. The search is a breadth-first search over the alternating paths: from a left node `x`, look at every right node `r` it is joined to; if `r` is free, we found the path end; otherwise `r` is matched to a left node `y`, and we continue the search from `y`.',
        { code: 'for u in range(1, left + 1):\n    parent = {}                            # right node -> the left node from which we reached it\n    queue = [u]\n    for x in queue:\n        for r in adjl[x]:\n            if r in parent:\n                continue\n            parent[r] = x\n            if match_r[r] == 0:             # a free right node: flip the path back to u\n                ...\n            else:\n                queue.append(match_r[r])    # continue from the left node that holds r' },
        'One search costs O(m), and there are `l` searches, so the time is O(l * m) (the Hopcroft-Karp algorithm is faster, but not needed here). The answer is the number of successful searches. This problem is also the key to "minimum vertex cover", "minimum path cover" and many assignment tasks.'
      ]
    },
    statement: ['A bipartite graph has `l` left nodes, `r` right nodes and `m` edges; each edge joins a left node and a right node. A matching is a set of edges in which no node appears twice. Print the largest possible number of edges in a matching.'],
    outputFormat: ['Print the size of a maximum matching.'],
    examples: [{ input: '3 3 4\n1 1\n1 2\n2 1\n3 3\n', note: 'Match 1 with 2, 2 with 1 and 3 with 3: 3 pairs.' }],
    hints: ['For each left node look for an augmenting path with a breadth-first search.', 'Keep for each right node the left node it is matched to (0 if free).', 'When the search reaches a free right node, flip the pairs along the path back to the start; count the successes.'],
    program: {
      io: ['l:int r:int m:int', 'edges:int[m][2]'],
      fast: true,
      helpers: MATCHING,
      python: r`
        adjl = [[] for _ in range(l + 1)]
        for a, b in edges:
            adjl[a].append(b)
        print(max_matching(adjl, l, r))`,
      cpp: r`
        vector<vector<int>> adjl(l + 1);
        for (const vector<long long>& e : edges) adjl[e[0]].push_back((int)e[1]);
        cout << maxMatching(adjl, (int)l, (int)r) << "\n";`,
      java: r`
        int left = (int) l, right = (int) r;
        System.out.println(maxMatching(edges, left, right));`
    },
    solution: { explanation: ['For each left node a breadth-first search looks for an augmenting path in the alternating graph; when one ends at a free right node, the path is flipped and the matching grows by one.'], complexity: 'Time O(l * m), space O(l + r + m).' },
    solve(input) {
      const rs = rows(input); const [l, r0, m] = nums(rs[0]); const adjl = Array.from({ length: l + 1 }, () => []); for (let i = 1; i <= m; i++) { const [a, b] = nums(rs[i]); adjl[a].push(b); }
      // the classic recursive search (the depth is at most l <= 500)
      const matchR = new Array(r0 + 1).fill(0); const tryUser = (u, seen) => { for (const v of adjl[u]) { if (seen[v]) continue; seen[v] = true; if (!matchR[v] || tryUser(matchR[v], seen)) { matchR[v] = u; return true; } } return false; };
      let size = 0; for (let u = 1; u <= l; u++) if (tryUser(u, new Array(r0 + 1).fill(false))) size++; return String(size);
    },
    tests() {
      const g = rng(986); const out = ['3 3 4\n1 1\n1 2\n2 1\n3 3\n', '1 1 1\n1 1\n', '2 2 2\n1 1\n2 1\n'];
      const brute = (input) => { const rs = rows(input); const [l, r0, m] = nums(rs[0]); const adjl = Array.from({ length: l + 1 }, () => []); for (let i = 1; i <= m; i++) { const [a, b] = nums(rs[i]); adjl[a].push(b); } const go = (u, used) => { if (u > l) return 0; let best = go(u + 1, used); for (const v of adjl[u]) if (!(used >> v & 1)) best = Math.max(best, 1 + go(u + 1, used | (1 << v))); return best; }; return String(go(1, 0)); };
      const make = (l, r0, m) => { const seen = new Set(); const e = []; const cap = Math.min(m, l * r0); while (e.length < cap) { const a = randInt(g, 1, l), b = randInt(g, 1, r0); if (seen.has(a * 1000 + b)) continue; seen.add(a * 1000 + b); e.push(`${a} ${b}`); } return `${l} ${r0} ${e.length}\n${e.join('\n')}\n`; };
      crossCheck(() => make(randInt(g, 1, 6), randInt(g, 1, 6), randInt(g, 1, 14)), (i) => this.solve(i), brute, 300);
      for (const [l, r0, m] of [[5, 5, 8], [20, 20, 40], [100, 100, 200], [500, 500, 1000], [500, 500, 3000], [500, 500, 6000], [500, 300, 3000], [300, 500, 3000], [500, 500, 500]]) out.push(make(l, r0, m));
      out.push(`500 500 500\n${many(500, (i) => `${i + 1} ${i + 1}`).join('\n')}\n`, `500 500 999\n${[...many(500, (i) => `${i + 1} ${i + 1}`), ...many(499, (i) => `${i + 1} ${i + 2}`)].join('\n')}\n`, `500 500 500\n${many(500, (i) => `${i + 1} 1`).join('\n')}\n`.replace('500 500 500\n', '500 500 500\n'));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: WDIR_INPUT.map((x, i) => (i === 1 ? 'Each of the next `m` lines has three numbers `u`, `v` and `c`: an edge from `u` to `v` that can carry `c` units.' : x)),
    constraints: ['2 <= n <= 200', '1 <= m <= 2000', '1 <= c <= 10^9', 'There are no self-loops and no repeated edges.'],
    slug: 'maximum-flow',
    title: 'How Much Can Flow Through the Network?',
    tags: ['graph', 'flow', 'dinic', 'directed-graph'],
    concept: {
      title: 'Max flow: keep pushing along paths that still have room, using reverse edges to undo bad choices',
      body: [
        'A network of pipes: each directed edge `u -> v` has a *capacity* `c`. How much can flow from the source (node 1) to the sink (node `n`) per second? The **flow** on each edge must be at most its capacity, and at every other node what flows in equals what flows out. This is the *maximum flow* problem; it models traffic, pipelines, scheduling, and matching.',
        'The basic method (Ford-Fulkerson): while there is a path from the source to the sink in which every edge has **room left** (its *residual capacity* is positive), push as much as the narrowest edge of the path allows. The trick that makes it correct is the **reverse edge**: for every edge `u -> v` keep also an edge `v -> u` whose residual capacity is the flow already sent; pushing along a reverse edge **cancels** some of the earlier flow, so a bad early choice can be corrected.',
        '*Dinic\'s algorithm* makes it fast. In each phase: (1) a breadth-first search from the source gives every node a **level** (distance in edges using edges with room left); (2) a depth-first search sends flow only along edges that go from a level to the **next** level, finding paths until no more can be found (a *blocking flow*). The levels increase from phase to phase, so there are at most `n` phases.',
        { code: 'while True:\n    level = bfs()                        # levels over edges with cap > 0\n    if level[sink] < 0:\n        break\n    pos = [0] * (n + 1)                   # the next edge to try at each node\n    while True:\n        path = find_path_by_levels()      # iterative DFS using pos\n        if not path:\n            break\n        push = min(cap[e] for e in path)\n        for e in path:\n            cap[e] -= push                # use up the room\n            cap[e ^ 1] += push            # give room to the reverse edge\n        flow += push' },
        'Edges are stored in pairs (`e` and `e ^ 1` are an edge and its reverse). The DFS is written with an explicit stack of edges. The answer can reach 2 * 10^12, so use 64-bit integers.'
      ]
    },
    statement: ['A directed network has `n` nodes and `m` edges; the edge `u v c` can carry at most `c` units of flow per second from `u` to `v`. Node 1 is the source and node `n` is the sink. Print the largest amount of flow per second that can be sent from the source to the sink.'],
    outputFormat: ['Print the maximum flow.'],
    examples: [{ input: '4 5\n1 2 3\n1 3 2\n2 3 1\n2 4 2\n3 4 3\n', note: 'The cut {1} has the capacity 3 + 2 = 5, but the edges into node 4 carry at most 2 + 3 = 5, and the paths 1-2-4 (2), 1-3-4 (2) and 1-2-3-4 (1) give 5.' }],
    hints: ['Store every edge together with a reverse edge of capacity 0.', 'Build levels with a BFS and push flow only along edges to the next level (Dinic).', 'After pushing along a path, decrease the capacities on it and increase the reverse ones.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      python: r`
        to = []
        cap = []
        graph = [[] for _ in range(n + 1)]
        for u, v, c in edges:
            graph[u].append(len(to))
            to.append(v)
            cap.append(c)
            graph[v].append(len(to))
            to.append(u)
            cap.append(0)
        flow = 0
        while True:
            level = [-1] * (n + 1)
            level[1] = 0
            queue = [1]
            for v in queue:
                for e in graph[v]:
                    if cap[e] > 0 and level[to[e]] < 0:
                        level[to[e]] = level[v] + 1
                        queue.append(to[e])
            if level[n] < 0:
                break
            pos = [0] * (n + 1)
            while True:
                path = []
                v = 1
                while v != n:
                    moved = False
                    while pos[v] < len(graph[v]):
                        e = graph[v][pos[v]]
                        if cap[e] > 0 and level[to[e]] == level[v] + 1:
                            path.append(e)
                            v = to[e]
                            moved = True
                            break
                        pos[v] += 1
                    if not moved:
                        if not path:
                            break
                        e = path.pop()
                        v = to[e ^ 1]
                        pos[v] += 1
                if v != n:
                    break
                push = min(cap[e] for e in path)
                for e in path:
                    cap[e] -= push
                    cap[e ^ 1] += push
                flow += push
        print(flow)`,
      cpp: r`
        vector<int> to;
        vector<long long> cap;
        vector<vector<int>> graph(n + 1);
        for (const vector<long long>& ed : edges) {
            graph[ed[0]].push_back((int)to.size());
            to.push_back((int)ed[1]);
            cap.push_back(ed[2]);
            graph[ed[1]].push_back((int)to.size());
            to.push_back((int)ed[0]);
            cap.push_back(0);
        }
        long long flow = 0;
        for (;;) {
            vector<int> level(n + 1, -1);
            level[1] = 0;
            vector<int> queue = {1};
            for (size_t i = 0; i < queue.size(); i++) {
                int v = queue[i];
                for (int e : graph[v]) {
                    if (cap[e] > 0 && level[to[e]] < 0) {
                        level[to[e]] = level[v] + 1;
                        queue.push_back(to[e]);
                    }
                }
            }
            if (level[n] < 0) break;
            vector<int> pos(n + 1, 0);
            for (;;) {
                vector<int> path;
                int v = 1;
                while (v != n) {
                    bool moved = false;
                    while (pos[v] < (int)graph[v].size()) {
                        int e = graph[v][pos[v]];
                        if (cap[e] > 0 && level[to[e]] == level[v] + 1) {
                            path.push_back(e);
                            v = to[e];
                            moved = true;
                            break;
                        }
                        pos[v]++;
                    }
                    if (!moved) {
                        if (path.empty()) break;
                        int e = path.back();
                        path.pop_back();
                        v = to[e ^ 1];
                        pos[v]++;
                    }
                }
                if (v != n) break;
                long long push = cap[path[0]];
                for (int e : path) push = min(push, cap[e]);
                for (int e : path) {
                    cap[e] -= push;
                    cap[e ^ 1] += push;
                }
                flow += push;
            }
        }
        cout << flow << "\n";`,
      java: r`
        int nodes = (int) n;
        int[] to = new int[2 * edges.length];
        long[] cap = new long[2 * edges.length];
        int[] gHead = new int[nodes + 2];
        for (int i = 0; i < edges.length; i++) {
            gHead[(int) edges[i][0] + 1]++;
            gHead[(int) edges[i][1] + 1]++;
        }
        for (int v = 1; v <= nodes; v++) gHead[v + 1] += gHead[v];
        int[] gSlot = new int[2 * edges.length];
        int[] gFill = new int[nodes + 2];
        for (int i = 0; i < edges.length; i++) {
            int a = (int) edges[i][0], b = (int) edges[i][1];
            to[2 * i] = b;
            cap[2 * i] = edges[i][2];
            to[2 * i + 1] = a;
            cap[2 * i + 1] = 0;
            gSlot[gHead[a] + gFill[a]] = 2 * i;
            gFill[a]++;
            gSlot[gHead[b] + gFill[b]] = 2 * i + 1;
            gFill[b]++;
        }
        long flow = 0;
        int[] level = new int[nodes + 1];
        int[] queue = new int[nodes + 1];
        int[] pos = new int[nodes + 1];
        int[] path = new int[nodes + 1];
        for (;;) {
            Arrays.fill(level, -1);
            level[1] = 0;
            int qh = 0, qt = 0;
            queue[qt++] = 1;
            while (qh < qt) {
                int v = queue[qh++];
                for (int k = gHead[v]; k < gHead[v + 1]; k++) {
                    int e = gSlot[k];
                    if (cap[e] > 0 && level[to[e]] < 0) {
                        level[to[e]] = level[v] + 1;
                        queue[qt++] = to[e];
                    }
                }
            }
            if (level[nodes] < 0) break;
            Arrays.fill(pos, 0);
            for (;;) {
                int len = 0;
                int v = 1;
                while (v != nodes) {
                    boolean moved = false;
                    while (gHead[v] + pos[v] < gHead[v + 1]) {
                        int e = gSlot[gHead[v] + pos[v]];
                        if (cap[e] > 0 && level[to[e]] == level[v] + 1) {
                            path[len++] = e;
                            v = to[e];
                            moved = true;
                            break;
                        }
                        pos[v]++;
                    }
                    if (!moved) {
                        if (len == 0) break;
                        len--;
                        v = to[path[len] ^ 1];
                        pos[v]++;
                    }
                }
                if (v != nodes) break;
                long push = Long.MAX_VALUE;
                for (int i = 0; i < len; i++) push = Math.min(push, cap[path[i]]);
                for (int i = 0; i < len; i++) {
                    cap[path[i]] -= push;
                    cap[path[i] ^ 1] += push;
                }
                flow += push;
            }
        }
        System.out.println(flow);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['Dinic\'s algorithm: a BFS builds levels over edges with remaining capacity, and an iterative DFS sends blocking flow along level-increasing edges, updating the capacities of the edges and of their reverse edges. The sum of the pushed amounts is the maximum flow.'], complexity: 'Time O(n^2 * m) in the worst case, much faster in practice; space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const cap = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0)); for (const [u, v, c] of edges) cap[u][v] += c;
      // Edmonds-Karp on a capacity matrix (a different algorithm from the solutions)
      let flow = 0; for (;;) { const parent = new Array(n + 1).fill(0); parent[1] = -1; const q = [1]; for (let h = 0; h < q.length && !parent[n]; h++) for (let v = 1; v <= n; v++) if (!parent[v] && cap[q[h]][v] > 0) { parent[v] = q[h]; q.push(v); } if (!parent[n]) break; let push = Infinity; for (let v = n; v !== 1; v = parent[v]) push = Math.min(push, cap[parent[v]][v]); for (let v = n; v !== 1; v = parent[v]) { cap[parent[v]][v] -= push; cap[v][parent[v]] += push; } flow += push; }
      return String(flow);
    },
    tests() {
      const g = rng(987); const out = ['4 5\n1 2 3\n1 3 2\n2 3 1\n2 4 2\n3 4 3\n', '2 1\n1 2 5\n', '3 1\n1 2 5\n', '2 1\n2 1 5\n'];
      const make = (n, m, hi) => { const e = D(g, n, m).map(([u, v]) => [u, v, randInt(g, 1, hi)]); return `${n} ${e.length}\n${e.map((x) => x.join(' ')).join('\n')}\n`; };
      const minCut = (input) => { const { n, edges } = parse(input); let best = Infinity; for (let mask = 0; mask < (1 << (n - 2)); mask++) { const side = (v) => (v === 1 ? 1 : v === n ? 0 : (mask >> (v - 2)) & 1); let cut = 0; for (const [u, v, c] of edges) if (side(u) && !side(v)) cut += c; best = Math.min(best, cut); } return String(best); };
      crossCheck(() => make(randInt(g, 2, 8), randInt(g, 1, 20), 9), (i) => this.solve(i), minCut, 300);
      for (const [n, m, hi] of [[6, 14, 9], [20, 80, 100], [50, 300, 1000000], [100, 1000, 1000000000], [200, 2000, 1000000000], [200, 2000, 5], [200, 800, 1000], [200, 1999, 1]]) for (let t = 0; t < 2; t++) out.push(make(n, m, hi));
      // a layered network, and the network that is slow for plain augmenting paths (two long routes sharing a cross edge)
      const layers = 10, width = 18; const lay = []; const idOf = (a, b) => 2 + a * width + b; const total = 2 + layers * width + 0; const sink = total + 1;
      for (let b = 0; b < width; b++) lay.push([1, idOf(0, b), randInt(g, 1, 1000000000)]); for (let a = 0; a + 1 < layers; a++) for (let b = 0; b < width; b++) for (let k = 0; k < 4; k++) lay.push([idOf(a, b), idOf(a + 1, randInt(g, 0, width - 1)), randInt(g, 1, 1000000000)]); for (let b = 0; b < width; b++) lay.push([idOf(layers - 1, b), sink, randInt(g, 1, 1000000000)]);
      const seenE = new Set(); const uniq = lay.filter(([u, v]) => { const k = u * 1000 + v; if (seenE.has(k)) return false; seenE.add(k); return true; });
      // relabel: source 1, sink n = sink, the other nodes keep their numbers (node ids 2..total are inner nodes)
      const relabel = (x) => (x === sink ? sink : x); out.push(`${sink} ${uniq.length}\n${uniq.map(([u, v, c]) => `${relabel(u)} ${relabel(v)} ${c}`).join('\n')}\n`);
      out.push('4 5\n1 2 1000000000\n1 3 1000000000\n2 3 1\n2 4 1000000000\n3 4 1000000000\n');
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `m`: the number of airports (numbered 1 to n) and the number of tickets.', 'Each of the next `m` lines has two numbers `u` and `v`: a ticket for a flight from `u` to `v`.'],
    constraints: ['1 <= n <= 5000', '1 <= m <= 30000', 'Several tickets can be equal, and a ticket can go from an airport to itself.', 'It is guaranteed that all tickets can be used exactly once in a trip that starts at airport 1.'],
    slug: 'reconstruct-itinerary',
    title: 'Use Every Ticket Exactly Once, in the Smallest Order',
    tags: ['graph', 'euler-path', 'hierholzer', 'directed-graph'],
    concept: {
      title: 'Hierholzer\'s algorithm: walk until stuck, then splice in the detours while backing up',
      body: [
        'You have a pile of one-way plane tickets and must use **every ticket exactly once** in one trip that starts at airport 1. A trip that uses every edge of a graph exactly once is an *Euler path*; its existence was settled by Euler (the degrees must fit), and here it is guaranteed to exist. Among all valid trips print the one that is **smallest** when compared airport number by airport number.',
        '*Hierholzer\'s algorithm* builds the trip. Keep a stack with the current walk. Look at the top airport `v`: if `v` still has an unused ticket, take the one to the **smallest** destination, remove it, and push that destination. If `v` has no unused ticket, the walk cannot continue from `v`: pop `v` and **add it to the trip** (the trip is built backwards). When the stack is empty, reverse the trip.',
        { code: 'for lst in adj:\n    lst.sort(reverse=True)           # so that pop() gives the smallest destination\nstack = [1]\ntrip = []\nwhile stack:\n    v = stack[-1]\n    if adj[v]:\n        stack.append(adj[v].pop())    # use the ticket to the smallest destination\n    else:\n        trip.append(stack.pop())      # stuck: v is the end of what is left\ntrip.reverse()' },
        'Why is the result the smallest? When a smallest-first walk gets stuck, the stuck airport must be the **end** of the whole trip (only it can have a missing outgoing ticket), and the detours explored on the way back are spliced in front of it in the right places. The loop is iterative, and every ticket is used once, so the time is O(m log m) with the sorting.'
      ]
    },
    statement: ['There are `m` one-way tickets between airports numbered 1 to `n`. A trip starts at airport 1 and uses every ticket exactly once (it is guaranteed that such a trip exists). Among all such trips print the one whose sequence of airports is smallest in the lexicographic order (compare the first airports, then the second, and so on). Print the `m + 1` airports of the trip.'],
    outputFormat: ['The airports of the trip on one line.'],
    examples: [{ input: '4 5\n1 2\n2 3\n3 1\n1 4\n4 1\n', note: 'The trips 1 2 3 1 4 1 and 1 4 1 2 3 1 both use all tickets; the smaller one is 1 2 3 1 4 1.' }],
    hints: ['Sort the destinations of every airport and always take the smallest unused ticket.', 'Keep a stack of the current walk; when the top airport has no tickets left, move it to the finished trip.', 'The finished trip is built backwards: reverse it at the end.'],
    program: {
      io: ['n:int m:int', 'tickets:int[m][2]'],
      fast: true,
      includes: ['<algorithm>', '<functional>'],
      python: r`
        adj = [[] for _ in range(n + 1)]
        for u, v in tickets:
            adj[u].append(v)
        for lst in adj:
            lst.sort(reverse=True)
        stack = [1]
        trip = []
        while stack:
            v = stack[-1]
            if adj[v]:
                stack.append(adj[v].pop())
            else:
                trip.append(stack.pop())
        trip.reverse()
        print(*trip)`,
      cpp: r`
        vector<vector<int>> adj(n + 1);
        for (const vector<long long>& t : tickets) adj[t[0]].push_back((int)t[1]);
        for (auto& lst : adj) sort(lst.begin(), lst.end(), greater<int>());
        vector<int> stack = {1}, trip;
        while (!stack.empty()) {
            int v = stack.back();
            if (!adj[v].empty()) {
                stack.push_back(adj[v].back());
                adj[v].pop_back();
            } else {
                trip.push_back(v);
                stack.pop_back();
            }
        }
        reverse(trip.begin(), trip.end());
        for (size_t i = 0; i < trip.size(); i++) cout << (i ? " " : "") << trip[i];
        cout << "\n";`,
      java: r`
        int airports = (int) n;
        int[] head = new int[airports + 2];
        for (int i = 0; i < tickets.length; i++) head[(int) tickets[i][0] + 1]++;
        for (int v = 1; v <= airports; v++) head[v + 1] += head[v];
        int[] dest = new int[tickets.length];
        int[] ptr = new int[airports + 2];
        for (int i = 0; i < tickets.length; i++) {
            int a = (int) tickets[i][0];
            dest[head[a] + ptr[a]] = (int) tickets[i][1];
            ptr[a]++;
        }
        for (int v = 1; v <= airports; v++) {
            Arrays.sort(dest, head[v], head[v + 1]);
            ptr[v] = head[v];
        }
        int[] stack = new int[tickets.length + 2];
        int[] trip = new int[tickets.length + 2];
        int top = 0, tripSize = 0;
        stack[top++] = 1;
        while (top > 0) {
            int v = stack[top - 1];
            if (ptr[v] < head[v + 1]) {
                stack[top++] = dest[ptr[v]];
                ptr[v]++;
            } else {
                trip[tripSize++] = v;
                top--;
            }
        }
        StringBuilder out = new StringBuilder();
        for (int i = tripSize - 1; i >= 0; i--) out.append(i < tripSize - 1 ? " " : "").append(trip[i]);
        System.out.println(out);`
    },
    solution: { explanation: ['Hierholzer\'s algorithm with the destinations sorted so that the smallest is taken first: airports with no tickets left are moved from the stack to the trip, which is reversed at the end.'], complexity: 'Time O(m log m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = Array.from({ length: n + 1 }, () => []); for (const [u, v] of edges) adj[u].push(v); adj.forEach((l) => l.sort((a, b) => b - a));
      const stack = [1], trip = []; while (stack.length) { const v = stack[stack.length - 1]; if (adj[v].length) stack.push(adj[v].pop()); else trip.push(stack.pop()); } return trip.reverse().join(' ');
    },
    tests() {
      const g = rng(988); const out = ['4 5\n1 2\n2 3\n3 1\n1 4\n4 1\n', '2 1\n1 2\n', '1 2\n1 1\n1 1\n'];
      // a random walk from airport 1 gives the tickets of a trip that exists
      const walk = (n, m) => { let at = 1; const e = []; for (let i = 0; i < m; i++) { const next = randInt(g, 1, n); e.push([at, next]); at = next; } return `${n} ${m}\n${shuffle(g, e).map((x) => x.join(' ')).join('\n')}\n`; };
      const brute = (input) => { const { n, edges } = parse(input); const adj = Array.from({ length: n + 1 }, () => []); edges.forEach(([u, v], i) => adj[u].push([v, i])); let best = null; const used = new Array(edges.length).fill(false); const path = [1]; const go = (v, count) => { if (count === edges.length) { if (!best || path.join(' ') < best.join(' ')) best = path.slice(); return; } for (const [w, i] of adj[v]) if (!used[i]) { used[i] = true; path.push(w); go(w, count + 1); path.pop(); used[i] = false; } }; go(1, 0); return best.join(' '); };
      const cmp = (a, b) => { for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i]; return a.length - b.length; };
      crossCheck(() => walk(randInt(g, 1, 5), randInt(g, 1, 7)), (i) => this.solve(i), (i) => { const { n, edges } = parse(i); let best = null; const used = new Array(edges.length).fill(false); const path = [1]; const adj = Array.from({ length: n + 1 }, () => []); edges.forEach(([u, v], k) => adj[u].push([v, k])); const go = (v, count) => { if (count === edges.length) { if (!best || cmp(path, best) < 0) best = path.slice(); return; } for (const [w, k] of adj[v]) if (!used[k]) { used[k] = true; path.push(w); go(w, count + 1); path.pop(); used[k] = false; } }; go(1, 0); return best.join(' '); }, 300);
      for (const [n, m] of [[3, 8], [6, 20], [20, 100], [100, 1000], [1000, 10000], [5000, 30000], [5, 30000], [2, 30000], [5000, 5000]]) out.push(walk(n, m));
      out.push(`3 30000\n${[...many(15000, (i) => (i % 2 ? '2 1' : '1 2')), ...many(15000, (i) => (i % 2 ? '3 1' : '1 3'))].join('\n')}\n`.replace('3 30000', '3 30000'));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: DIR_INPUT,
    constraints: ['1 <= n <= 500', '1 <= m <= 3000', 'The graph has no directed cycle.', 'There are no self-loops and no repeated edges.'],
    slug: 'minimum-path-cover',
    title: 'Cover All Nodes With the Fewest Separate Paths',
    tags: ['graph', 'dag', 'matching', 'bipartite', 'path-cover'],
    concept: {
      title: 'Each edge that joins two path pieces saves one path: the answer is n minus a maximum matching',
      body: [
        'A directed acyclic graph is given. Cover **all nodes** with paths so that every node lies on **exactly one** path (the paths do not share nodes, and a path of a single node is allowed). What is the smallest number of paths? With no edge used we need `n` paths (one per node). Every edge `u -> v` that we use to **join** the end of one path to the start of another saves one path. Each node can be followed by at most one used edge (its out-edge) and preceded by at most one (its in-edge).',
        'This is a matching problem. Build a bipartite graph with **two copies of every node**: a left copy `u_out` and a right copy `v_in`, and an edge `u_out - v_in` for each edge `u -> v` of the DAG. A set of used edges in which no node has two out-edges and no node has two in-edges is exactly a **matching** in this bipartite graph. (No cycle can appear, because the graph is acyclic, so the used edges always form paths.) So the largest number of joins is the size of a maximum matching, and',
        { code: 'minimum number of paths = n - (size of a maximum matching)' },
        'The maximum matching is found by augmenting paths, as in the previous task. With `n <= 500` and `m <= 3000` it takes about `n * m` = 1.5 million steps. For example, a single long path of `n` nodes has a matching of size `n - 1`, hence one path; `n` nodes without edges have an empty matching, hence `n` paths.'
      ]
    },
    statement: ['A directed acyclic graph has `n` nodes and `m` edges. A path cover is a set of paths (a path may consist of a single node) such that every node belongs to exactly one path. Print the smallest possible number of paths in a path cover.'],
    outputFormat: ['Print the smallest number of paths.'],
    examples: [{ input: '4 3\n1 2\n1 3\n3 4\n', note: 'The paths 1, 2 and 3, 4 cover all four nodes with 2 paths; one path is not enough because node 1 has two successors: 2.' }],
    hints: ['Split every node into a left copy (outgoing) and a right copy (incoming).', 'Each edge u -> v becomes an edge from the left copy of u to the right copy of v.', 'The answer is n minus the size of a maximum matching of this bipartite graph.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      helpers: MATCHING,
      python: r`
        adjl = [[] for _ in range(n + 1)]
        for u, v in edges:
            adjl[u].append(v)
        print(n - max_matching(adjl, n, n))`,
      cpp: r`
        vector<vector<int>> adjl(n + 1);
        for (const vector<long long>& e : edges) adjl[e[0]].push_back((int)e[1]);
        cout << n - maxMatching(adjl, (int)n, (int)n) << "\n";`,
      java: r`
        int count = (int) n;
        System.out.println(count - maxMatching(edges, count, count));`
    },
    solution: { explanation: ['Every node is split into an outgoing and an incoming copy; the edges of the DAG become edges of a bipartite graph, and every matched edge joins two paths into one. The minimum number of paths is n minus the size of a maximum matching.'], complexity: 'Time O(n * m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adjl = Array.from({ length: n + 1 }, () => []); for (const [u, v] of edges) adjl[u].push(v);
      const matchR = new Array(n + 1).fill(0); const tryUser = (u, seen) => { for (const v of adjl[u]) { if (seen[v]) continue; seen[v] = true; if (!matchR[v] || tryUser(matchR[v], seen)) { matchR[v] = u; return true; } } return false; };
      let size = 0; for (let u = 1; u <= n; u++) if (tryUser(u, new Array(n + 1).fill(false))) size++; return String(n - size);
    },
    tests() {
      const g = rng(989); const out = ['4 3\n1 2\n1 3\n3 4\n', '2 1\n2 1\n', '3 1\n1 2\n'];
      const brute = (input) => { const { n, edges } = parse(input); const adj = Array.from({ length: n + 1 }, () => []); for (const [u, v] of edges) adj[u].push(v); let best = n; const go = (u, usedIn, joins) => { if (u > n) { best = Math.min(best, n - joins); return; } go(u + 1, usedIn, joins); for (const v of adj[u]) if (!(usedIn >> v & 1)) go(u + 1, usedIn | (1 << v), joins + 1); }; go(1, 0, 0); return String(best); };
      crossCheck(() => { const n = randInt(g, 1, 7); return graphText(n, DAG(g, n, randInt(g, 1, Math.max(1, Math.min(10, n * (n - 1) / 2))))); }, (i) => this.solve(i), brute, 200);
      for (const [n, m] of [[8, 10], [30, 60], [100, 300], [500, 600], [500, 1500], [500, 3000], [500, 499]]) out.push(graphText(n, DAG(g, n, m)));
      out.push(graphText(500, many(499, (i) => [i + 1, i + 2])), graphText(500, shuffle(g, many(499, (i) => [1, i + 2]))), graphText(500, shuffle(g, many(499, (i) => [i + 1, 500]))));
      return out;
    }
  }
];

// the strongly connected components of a small or big graph: a plain reachability matrix for small graphs, otherwise Kosaraju with explicit stacks (written for the reference, independent of the solutions' code)
function sccByMatrixOrFast(n, edges) {
  if (n <= 60) return sccByMatrix(n, edges);
  const adj = Array.from({ length: n + 1 }, () => []), radj = Array.from({ length: n + 1 }, () => []); for (const [u, v] of edges) { adj[u].push(v); radj[v].push(u); }
  const seen = new Array(n + 1).fill(false), order = [], it = new Array(n + 1).fill(0);
  for (let s = 1; s <= n; s++) { if (seen[s]) continue; seen[s] = true; const st = [s]; while (st.length) { const v = st[st.length - 1]; if (it[v] < adj[v].length) { const w = adj[v][it[v]++]; if (!seen[w]) { seen[w] = true; st.push(w); } } else { order.push(v); st.pop(); } } }
  const comp = new Array(n + 1).fill(-1); let count = 0; for (let i = order.length - 1; i >= 0; i--) { const s = order[i]; if (comp[s] !== -1) continue; comp[s] = count; const st = [s]; while (st.length) { const v = st.pop(); for (const w of radj[v]) if (comp[w] === -1) { comp[w] = count; st.push(w); } } count++; }
  return { comp, count };
}
