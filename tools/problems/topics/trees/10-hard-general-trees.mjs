import { r, rng, randInt, many, nums, rows, shuffle, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const listText = (a) => `${a.length}\n${a.join(' ')}\n`;

// the parent array (1-based, 0 for the root) of a tree of one of several shapes, with the nodes numbered in random order
function parentTree(g, n, kind) {
  const parentOf = (i) => (i === 0 ? -1 : kind === 'chain' ? i - 1 : kind === 'star' ? 0 : kind === 'binary' ? (i - 1) >> 1 : kind === 'broom' ? (i < n / 2 ? i - 1 : Math.floor(n / 2) - 1) : kind === 'deep' ? Math.max(0, i - 1 - randInt(g, 0, 2)) : randInt(g, 0, i - 1));
  const label = shuffle(g, many(n, (i) => i + 1)); const par = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) par[label[i]] = i === 0 ? 0 : label[parentOf(i)];
  return par.slice(1);
}
const SHAPES = ['random', 'chain', 'star', 'binary', 'broom', 'deep'];
const edgesOf = (g, n, kind) => { const par = parentTree(g, n, kind); const lines = []; for (let v = 1; v <= n; v++) if (par[v - 1]) lines.push(g() < 0.5 ? `${par[v - 1]} ${v}` : `${v} ${par[v - 1]}`); return `${lines.length}\n${shuffle(g, lines).join('\n')}\n`; };
const adjacency = (input) => { const rs = rows(input); const m = Number(rs[0]); const n = m + 1; const adj = Array.from({ length: n + 1 }, () => []); for (let i = 1; i <= m; i++) { const [u, v] = nums(rs[i]); adj[u].push(v); adj[v].push(u); } return { n, adj }; };
const distancesFrom = (adj, n, s) => { const dist = new Array(n + 1).fill(-1); dist[s] = 0; const q = [s]; for (let h = 0; h < q.length; h++) for (const w of adj[q[h]]) if (dist[w] < 0) { dist[w] = dist[q[h]] + 1; q.push(w); } return dist; };
const childrenOf = (par) => { const kids = Array.from({ length: par.length + 1 }, () => []); let root = 0; par.forEach((p, i) => { if (p === 0) root = i + 1; else kids[p].push(i + 1); }); return { kids, root }; };
const orderOf = (kids, root) => { const order = [root]; for (let i = 0; i < order.length; i++) order.push(...kids[order[i]]); return order; };
const depthsOf = (par) => { const { kids, root } = childrenOf(par); const depth = new Array(par.length + 1).fill(0); for (const v of orderOf(kids, root)) for (const c of kids[v]) depth[c] = depth[v] + 1; return depth; };
const EDGES_INPUT = ['The first line has `m`, the number of edges.', 'Each of the next `m` lines has two numbers `u` and `v`: an edge between the nodes `u` and `v`.'];
const EDGES_LIMITS = ['1 <= m <= 19999', 'The nodes are numbered 1 to m + 1, and the edges form a tree.', 'The tree can be a long path.'];
const PARENT_INPUT = ['The first line has `n`, the number of nodes (numbered 1 to n).', 'The second line has `n` numbers: for each node its parent, and 0 for the root.'];
const PARENT_LIMITS = ['1 <= n <= 20000', 'The numbers describe one tree: exactly one node has the parent 0, and following parents always reaches it.', 'A parent can have a larger number than its child.', 'The tree can be a long path (depth up to n - 1).'];

export default [
  {
    ...hard,
    inputFormat: EDGES_INPUT, constraints: EDGES_LIMITS,
    slug: 'sum-of-distances-in-tree',
    title: 'The Total Distance From Every Node',
    tags: ['tree', 'rerooting', 'tree-dp', 'bfs'],
    concept: {
      title: 'Compute the answer for the root, then move the root along an edge and fix the answer',
      body: [
        'For every node `v` of a tree, find the **sum of the distances from `v` to all the other nodes**. A search from every node costs O(n^2), too slow for 20000 nodes. The technique called *rerooting* computes everything in O(n) with two passes.',
        '**Pass 1 (bottom-up):** root the tree at node 1. For each node compute `size[v]`, the number of nodes in its subtree, and `down[v]`, the sum of the distances from `v` to the nodes of its own subtree: `down[v] = sum over children c of (down[c] + size[c])` (each node of the subtree of `c` is one edge farther from `v` than from `c`).',
        '**Pass 2 (top-down):** the answer for the root is `down[root]`. Move the root from a node `p` to its child `c` along one edge: the `size[c]` nodes of the subtree of `c` become **one step closer**, and the other `n - size[c]` nodes become **one step farther**. So',
        { code: 'answer[c] = answer[p] - size[c] + (n - size[c])' },
        'Both passes need an order in which parents come before children (or after): the breadth-first order, walked forwards for the top-down pass and backwards for the bottom-up pass. No recursion is needed, which is important because the tree can be a path of 20000 nodes. The totals reach about 2 * 10^8, so use 64-bit integers to be safe.'
      ]
    },
    statement: ['A tree with `m + 1` nodes is given by its `m` edges. For every node print the sum of the distances (the number of edges on the road) from that node to all the other nodes.'],
    outputFormat: ['One line with `m + 1` numbers: the sums for the nodes 1, 2, ..., m + 1.'],
    examples: [{ input: '5\n1 2\n1 3\n3 4\n3 5\n5 6\n', note: 'From node 1 the distances are 1, 1, 2, 2, 3 (sum 9); from node 2 they are 1, 2, 3, 3, 4 (sum 13); the whole answer is 9 13 7 11 9 13.' }],
    hints: ['Root the tree at node 1 and compute the subtree sizes and the sums of distances inside the subtrees from the bottom up.', 'The answer for the root is the sum inside its whole tree.', 'When the root moves from a parent to a child, size[child] nodes get closer and n - size[child] nodes get farther.'],
    program: {
      io: ['m:int', 'edges:int[m][2]'],
      fast: true,
      python: r`
        n = m + 1
        adj = [[] for _ in range(n + 1)]
        for u, v in edges:
            adj[u].append(v)
            adj[v].append(u)
        parent = [0] * (n + 1)
        parent[1] = -1
        order = [1]
        for v in order:
            for w in adj[v]:
                if w != parent[v]:
                    parent[w] = v
                    order.append(w)
        size = [1] * (n + 1)
        down = [0] * (n + 1)
        for v in reversed(order[1:]):
            size[parent[v]] += size[v]
            down[parent[v]] += down[v] + size[v]
        answer = [0] * (n + 1)
        answer[1] = down[1]
        for v in order[1:]:
            answer[v] = answer[parent[v]] - size[v] + (n - size[v])
        print(*answer[1:])`,
      cpp: r`
        int count = (int)m + 1;
        vector<vector<int>> adj(count + 1);
        for (const vector<long long>& e : edges) {
            adj[e[0]].push_back((int)e[1]);
            adj[e[1]].push_back((int)e[0]);
        }
        vector<int> parent(count + 1, 0), order = {1};
        parent[1] = -1;
        for (size_t i = 0; i < order.size(); i++) {
            int v = order[i];
            for (int w : adj[v]) {
                if (w != parent[v]) {
                    parent[w] = v;
                    order.push_back(w);
                }
            }
        }
        vector<long long> sizes(count + 1, 1), down(count + 1, 0), answer(count + 1, 0);
        for (size_t i = order.size(); i-- > 1;) {
            int v = order[i];
            sizes[parent[v]] += sizes[v];
            down[parent[v]] += down[v] + sizes[v];
        }
        answer[1] = down[1];
        for (size_t i = 1; i < order.size(); i++) {
            int v = order[i];
            answer[v] = answer[parent[v]] - sizes[v] + (count - sizes[v]);
        }
        for (int v = 1; v <= count; v++) cout << (v > 1 ? " " : "") << answer[v];
        cout << "\n";`,
      java: r`
        int count = (int) m + 1;
        List<List<Integer>> adj = new ArrayList<>();
        for (int v = 0; v <= count; v++) adj.add(new ArrayList<>());
        for (long[] e : edges) {
            adj.get((int) e[0]).add((int) e[1]);
            adj.get((int) e[1]).add((int) e[0]);
        }
        int[] parent = new int[count + 1];
        parent[1] = -1;
        List<Integer> order = new ArrayList<>();
        order.add(1);
        for (int i = 0; i < order.size(); i++) {
            int v = order.get(i);
            for (int w : adj.get(v)) {
                if (w != parent[v]) {
                    parent[w] = v;
                    order.add(w);
                }
            }
        }
        long[] sizes = new long[count + 1];
        Arrays.fill(sizes, 1);
        long[] down = new long[count + 1];
        long[] answer = new long[count + 1];
        for (int i = order.size() - 1; i >= 1; i--) {
            int v = order.get(i);
            sizes[parent[v]] += sizes[v];
            down[parent[v]] += down[v] + sizes[v];
        }
        answer[1] = down[1];
        for (int i = 1; i < order.size(); i++) {
            int v = order.get(i);
            answer[v] = answer[parent[v]] - sizes[v] + (count - sizes[v]);
        }
        StringBuilder out = new StringBuilder();
        for (int v = 1; v <= count; v++) out.append(v > 1 ? " " : "").append(answer[v]);
        System.out.println(out);`
    },
    solution: { explanation: ['A bottom-up pass over the breadth-first order computes the subtree sizes and the sum of distances inside each subtree; the answer of the root is known. A top-down pass moves the root along every edge: answer[child] = answer[parent] - size[child] + (n - size[child]).'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const { n, adj } = adjacency(input); const parent = new Array(n + 1).fill(0); parent[1] = -1; const order = [1];
      for (let i = 0; i < order.length; i++) for (const w of adj[order[i]]) if (w !== parent[order[i]]) { parent[w] = order[i]; order.push(w); }
      const size = new Array(n + 1).fill(1), down = new Array(n + 1).fill(0); for (let i = n - 1; i >= 1; i--) { const v = order[i]; size[parent[v]] += size[v]; down[parent[v]] += down[v] + size[v]; }
      const answer = new Array(n + 1).fill(0); answer[1] = down[1]; for (let i = 1; i < n; i++) { const v = order[i]; answer[v] = answer[parent[v]] - size[v] + (n - size[v]); }
      return answer.slice(1).join(' ');
    },
    tests() {
      const g = rng(801); const out = ['5\n1 2\n1 3\n3 4\n3 5\n5 6\n', '1\n1 2\n', '2\n2 1\n3 2\n'];
      const brute = (input) => { const { n, adj } = adjacency(input); return many(n, (i) => distancesFrom(adj, n, i + 1).slice(1).reduce((a, b) => a + b, 0)).join(' '); };
      crossCheck(() => edgesOf(g, randInt(g, 2, 12), SHAPES[randInt(g, 0, 5)]), (i) => this.solve(i), brute);
      for (const kind of SHAPES) for (const n of [7, 100, 3000, 20000]) out.push(edgesOf(g, n, kind));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: [...PARENT_INPUT, 'The third line has `q`, the number of queries.', 'Each of the next `q` lines has a node `v` and a number `k`.'],
    constraints: [...PARENT_LIMITS, '1 <= q <= 20000', '0 <= k <= 10^9'],
    slug: 'kth-ancestor-queries',
    title: 'Jump k Steps Up the Tree',
    tags: ['tree', 'binary-lifting', 'queries'],
    concept: {
      title: 'Binary lifting: store the 1st, 2nd, 4th, 8th, ... ancestor of every node',
      body: [
        'The *k-th ancestor* of a node is the node reached by going up `k` times along the parents (the 0th ancestor is the node itself; the parent of the root does not exist). Going up one step at a time costs O(k) per query, which is O(n) on a long path, and too slow for 20000 queries on 20000 nodes.',
        '*Binary lifting* uses the binary representation of `k`. Precompute a table `up[j][v]`: the **2^j-th ancestor** of `v` (or 0 if there is none). The first row is the parent, and each next row is made from the previous one: going up `2^j` steps is going up `2^(j-1)` steps twice.',
        { code: 'LOG = 15                                    # 2^15 = 32768 > 20000\nup[0][v] = parent[v]\nfor j in range(1, LOG):\n    for v in range(1, n + 1):\n        up[j][v] = up[j - 1][up[j - 1][v]]   # twice 2^(j-1) steps\n\n# query: write k in binary and jump for every 1 bit\nfor j in range(LOG):\n    if k >> j & 1:\n        v = up[j][v]' },
        'Use 0 as the "no node" value, with `up[j][0] = 0`, so that jumping beyond the root keeps the result 0 (print -1 then). A `k` of at least `n` is always beyond the root. The table has `LOG * n` entries and is built in O(n log n); every query takes O(log n). The same table solves the lowest common ancestor problem, in the next task.'
      ]
    },
    statement: ['A tree with `n` nodes is given by the parent of each node (0 for the root). For each query `v k`, print the k-th ancestor of the node `v` (the node reached by going up `k` times; for `k = 0` it is `v` itself), or -1 if the road upward ends before `k` steps.'],
    outputFormat: ['`q` lines: the node number or -1.'],
    examples: [{ input: '7\n0 1 1 2 2 3 3\n4\n4 1\n4 2\n4 3\n7 0\n', note: 'Node 4 has the parent 2, whose parent is 1, the root: 2, 1, -1; and node 7 is its own 0th ancestor: 7.' }],
    hints: ['Make a table up[j][v] with the 2^j-th ancestor of every node; each row comes from the previous row.', 'Use 0 as "no node" and keep it at 0 in every row.', 'For a query go through the bits of k and jump up[j][v] for every bit that is set; answer -1 if you end at 0.'],
    program: {
      io: ['n:int', 'par:int[n]', 'q:int', 'qs:int[q][2]'],
      fast: true,
      python: r`
        LOG = 15
        up = [[0] * (n + 1) for _ in range(LOG)]
        for v in range(1, n + 1):
            up[0][v] = par[v - 1]
        for j in range(1, LOG):
            for v in range(1, n + 1):
                up[j][v] = up[j - 1][up[j - 1][v]]
        out = []
        for v, k in qs:
            if k >= n:
                out.append(-1)
                continue
            for j in range(LOG):
                if k >> j & 1:
                    v = up[j][v]
            out.append(v if v else -1)
        print("\n".join(map(str, out)))`,
      cpp: r`
        const int LOG = 15;
        int count = (int)n;
        vector<vector<int>> up(LOG, vector<int>(count + 1, 0));
        for (int v = 1; v <= count; v++) up[0][v] = (int)par[v - 1];
        for (int j = 1; j < LOG; j++) {
            for (int v = 1; v <= count; v++) up[j][v] = up[j - 1][up[j - 1][v]];
        }
        for (const vector<long long>& query : qs) {
            int v = (int)query[0];
            long long k = query[1];
            if (k >= count) {
                cout << -1 << "\n";
                continue;
            }
            for (int j = 0; j < LOG; j++) {
                if ((k >> j) & 1) v = up[j][v];
            }
            cout << (v == 0 ? -1 : v) << "\n";
        }`,
      java: r`
        int LOG = 15;
        int count = (int) n;
        int[][] up = new int[LOG][count + 1];
        for (int v = 1; v <= count; v++) up[0][v] = (int) par[v - 1];
        for (int j = 1; j < LOG; j++) {
            for (int v = 1; v <= count; v++) up[j][v] = up[j - 1][up[j - 1][v]];
        }
        StringBuilder out = new StringBuilder();
        for (long[] query : qs) {
            int v = (int) query[0];
            long k = query[1];
            if (k >= count) {
                out.append(-1).append("\n");
                continue;
            }
            for (int j = 0; j < LOG; j++) {
                if (((k >> j) & 1) != 0) v = up[j][v];
            }
            out.append(v == 0 ? -1 : v).append("\n");
        }
        System.out.print(out);`
    },
    solution: { explanation: ['The table up[j][v] holds the 2^j-th ancestor of v (0 if none), each row built from the previous one. A query jumps once for every set bit of k; ending at 0 (or k >= n) means there is no such ancestor.'], complexity: 'Time O(n log n + q log n), space O(n log n).' },
    solve(input) {
      const rs = rows(input); const par = nums(rs[1]); const q = Number(rs[2]); const out = [];
      for (let i = 0; i < q; i++) { let [v, k] = nums(rs[3 + i]); while (k > 0 && v !== 0) { v = par[v - 1]; k--; } out.push(v === 0 ? -1 : v); }
      return out.join('\n');
    },
    tests() {
      const g = rng(802); const out = ['7\n0 1 1 2 2 3 3\n4\n4 1\n4 2\n4 3\n7 0\n', '1\n0\n3\n1 0\n1 1\n1 1000000000\n'];
      const make = (n, kind, q) => { const par = parentTree(g, n, kind); const depth = depthsOf(par); const lines = many(q, (i) => { const v = randInt(g, 1, n); const d = depth[v]; const k = i % 5 === 0 ? randInt(g, 0, 1000000000) : i % 5 === 1 ? d : i % 5 === 2 ? d + 1 : randInt(g, 0, d); return `${v} ${k}`; }); return `${listText(par)}${q}\n${lines.join('\n')}\n`; };
      for (const kind of SHAPES) for (const [n, q] of [[7, 15], [100, 100], [3000, 3000], [20000, kind === 'random' || kind === 'chain' || kind === 'deep' ? 20000 : 6000]]) out.push(make(n, kind, q));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: [...PARENT_INPUT, 'The third line has `q`, the number of queries.', 'Each of the next `q` lines has two nodes `u` and `v`.'],
    constraints: [...PARENT_LIMITS, '1 <= q <= 20000'],
    slug: 'lca-queries-binary-lifting',
    title: 'Common Ancestors for Many Pairs of Nodes',
    tags: ['tree', 'binary-lifting', 'lca', 'queries'],
    concept: {
      title: 'Lift the deeper node to the same depth, then lift both as high as possible while they differ',
      body: [
        'The *lowest common ancestor* (LCA) of two nodes is the deepest node that is an ancestor of both (a node is its own ancestor). Walking up one step at a time, as in the simple solution, costs O(depth) per query; for many queries on a tall tree use the table of the previous task, `up[j][v]` = the 2^j-th ancestor of `v` (0 if none).',
        'The query has two phases:',
        '1. **Equalize the depths.** If `u` is deeper than `v` by `diff`, lift `u` by `diff` steps using the bits of `diff`. If now `u == v`, that node is the answer.\n2. **Lift both together.** Go through `j` from the highest bit to 0. If the ancestors `up[j][u]` and `up[j][v]` are **different**, jump both (they are still below the LCA). In the end `u` and `v` are different children of the LCA, so the answer is their parent `up[0][u]`.',
        { code: 'if depth[u] < depth[v]:\n    u, v = v, u\ndiff = depth[u] - depth[v]\nfor j in range(LOG):\n    if diff >> j & 1:\n        u = up[j][u]\nif u == v:\n    return u\nfor j in reversed(range(LOG)):\n    if up[j][u] != up[j][v]:           # still below the LCA: jump\n        u, v = up[j][u], up[j][v]\nreturn up[0][u]' },
        'The depths come from a breadth-first walk from the root (the parents of this task can have larger numbers than their children, so the node numbers give no order). A query costs O(log n), and the table O(n log n). No recursion is used anywhere, so a path of 20000 nodes is no problem.'
      ]
    },
    statement: ['A tree with `n` nodes is given by the parent of each node (0 for the root). For each query `u v`, print the lowest common ancestor of the nodes `u` and `v`: the deepest node that has both of them in its subtree (a node is in its own subtree).'],
    outputFormat: ['`q` lines: the lowest common ancestor of every pair.'],
    examples: [{ input: '7\n0 1 1 2 2 3 3\n3\n4 5\n4 6\n2 4\n', note: 'The nodes 4 and 5 are the children of 2; 4 and 6 meet at the root 1; the node 2 is an ancestor of 4.' }],
    hints: ['Compute the depth of every node with a breadth-first walk and build the table up[j][v].', 'First lift the deeper node so both have the same depth; if they are equal now, that is the answer.', 'Then, for j from the highest bit down, jump both nodes when their 2^j-th ancestors differ; the answer is the parent.'],
    program: {
      io: ['n:int', 'par:int[n]', 'q:int', 'qs:int[q][2]'],
      fast: true,
      python: r`
        LOG = 15
        kids = [[] for _ in range(n + 1)]
        root = 0
        for v in range(1, n + 1):
            if par[v - 1] == 0:
                root = v
            else:
                kids[par[v - 1]].append(v)
        depth = [0] * (n + 1)
        order = [root]
        for v in order:
            for c in kids[v]:
                depth[c] = depth[v] + 1
                order.append(c)
        up = [[0] * (n + 1) for _ in range(LOG)]
        for v in range(1, n + 1):
            up[0][v] = par[v - 1]
        for j in range(1, LOG):
            for v in range(1, n + 1):
                up[j][v] = up[j - 1][up[j - 1][v]]
        out = []
        for u, v in qs:
            if depth[u] < depth[v]:
                u, v = v, u
            diff = depth[u] - depth[v]
            for j in range(LOG):
                if diff >> j & 1:
                    u = up[j][u]
            if u == v:
                out.append(u)
                continue
            for j in range(LOG - 1, -1, -1):
                if up[j][u] != up[j][v]:
                    u = up[j][u]
                    v = up[j][v]
            out.append(up[0][u])
        print("\n".join(map(str, out)))`,
      cpp: r`
        const int LOG = 15;
        int count = (int)n;
        vector<vector<int>> kids(count + 1);
        int root = 0;
        for (int v = 1; v <= count; v++) {
            if (par[v - 1] == 0) root = v;
            else kids[par[v - 1]].push_back(v);
        }
        vector<int> depth(count + 1, 0), order = {root};
        for (size_t i = 0; i < order.size(); i++) {
            for (int c : kids[order[i]]) {
                depth[c] = depth[order[i]] + 1;
                order.push_back(c);
            }
        }
        vector<vector<int>> up(LOG, vector<int>(count + 1, 0));
        for (int v = 1; v <= count; v++) up[0][v] = (int)par[v - 1];
        for (int j = 1; j < LOG; j++) {
            for (int v = 1; v <= count; v++) up[j][v] = up[j - 1][up[j - 1][v]];
        }
        for (const vector<long long>& query : qs) {
            int u = (int)query[0], v = (int)query[1];
            if (depth[u] < depth[v]) swap(u, v);
            int diff = depth[u] - depth[v];
            for (int j = 0; j < LOG; j++) {
                if ((diff >> j) & 1) u = up[j][u];
            }
            if (u == v) {
                cout << u << "\n";
                continue;
            }
            for (int j = LOG - 1; j >= 0; j--) {
                if (up[j][u] != up[j][v]) {
                    u = up[j][u];
                    v = up[j][v];
                }
            }
            cout << up[0][u] << "\n";
        }`,
      includes: ['<utility>'],
      java: r`
        int LOG = 15;
        int count = (int) n;
        List<List<Integer>> kids = new ArrayList<>();
        for (int v = 0; v <= count; v++) kids.add(new ArrayList<>());
        int root = 0;
        for (int v = 1; v <= count; v++) {
            if (par[v - 1] == 0) root = v;
            else kids.get((int) par[v - 1]).add(v);
        }
        int[] depth = new int[count + 1];
        List<Integer> order = new ArrayList<>();
        order.add(root);
        for (int i = 0; i < order.size(); i++) {
            int v = order.get(i);
            for (int c : kids.get(v)) {
                depth[c] = depth[v] + 1;
                order.add(c);
            }
        }
        int[][] up = new int[LOG][count + 1];
        for (int v = 1; v <= count; v++) up[0][v] = (int) par[v - 1];
        for (int j = 1; j < LOG; j++) {
            for (int v = 1; v <= count; v++) up[j][v] = up[j - 1][up[j - 1][v]];
        }
        StringBuilder out = new StringBuilder();
        for (long[] query : qs) {
            int u = (int) query[0], v = (int) query[1];
            if (depth[u] < depth[v]) {
                int t = u;
                u = v;
                v = t;
            }
            int diff = depth[u] - depth[v];
            for (int j = 0; j < LOG; j++) {
                if (((diff >> j) & 1) != 0) u = up[j][u];
            }
            if (u == v) {
                out.append(u).append("\n");
                continue;
            }
            for (int j = LOG - 1; j >= 0; j--) {
                if (up[j][u] != up[j][v]) {
                    u = up[j][u];
                    v = up[j][v];
                }
            }
            out.append(up[0][u]).append("\n");
        }
        System.out.print(out);`
    },
    solution: { explanation: ['With the depths and the table of 2^j-th ancestors, the deeper node is lifted to the depth of the other; if they coincide that is the answer, otherwise both are lifted together from the highest bit down while their ancestors differ, and the answer is the parent.'], complexity: 'Time O(n log n + q log n), space O(n log n).' },
    solve(input) {
      const rs = rows(input); const par = nums(rs[1]); const depth = depthsOf(par); const q = Number(rs[2]); const out = [];
      for (let i = 0; i < q; i++) { let [u, v] = nums(rs[3 + i]); while (depth[u] > depth[v]) u = par[u - 1]; while (depth[v] > depth[u]) v = par[v - 1]; while (u !== v) { u = par[u - 1]; v = par[v - 1]; } out.push(u); }
      return out.join('\n');
    },
    tests() {
      const g = rng(803); const out = ['7\n0 1 1 2 2 3 3\n3\n4 5\n4 6\n2 4\n', '1\n0\n1\n1 1\n'];
      const make = (n, kind, q) => { const par = parentTree(g, n, kind); const lines = many(q, () => `${randInt(g, 1, n)} ${randInt(g, 1, n)}`); return `${listText(par)}${q}\n${lines.join('\n')}\n`; };
      for (const kind of SHAPES) for (const [n, q] of [[7, 15], [100, 100], [3000, 3000], [20000, kind === 'random' || kind === 'chain' || kind === 'deep' ? 20000 : 6000]]) out.push(make(n, kind, q));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: [...PARENT_INPUT, 'The third line has `n` numbers: the starting value of every node.', 'The fourth line has `q`, the number of operations.', 'Each of the next `q` lines has an operation and two numbers: `add v x` adds `x` to the value of the node `v`; `sum v 0` asks for the sum of the values in the subtree of `v` (the second number of `sum` is 0 and must be ignored).'],
    constraints: [...PARENT_LIMITS, '-10^9 <= starting values, x <= 10^9', '1 <= q <= 20000', 'There is at least one `sum`.'],
    slug: 'subtree-sums-with-updates',
    title: 'Subtree Sums While the Values Change',
    tags: ['tree', 'euler-tour', 'fenwick-tree', 'queries'],
    concept: {
      title: 'Flatten the tree with a DFS order so that every subtree is a range, then use a Fenwick tree',
      body: [
        'We need two operations on a tree, many times: **change** the value of one node, and ask for the **sum of the values in a subtree**. Recomputing the subtree sum walks the whole subtree, O(n) per question. The trick is to turn the tree into an **array**.',
        'Number the nodes in the order of a **depth-first (pre-order) walk**: the *entry time* `tin[v]`. All nodes of the subtree of `v` get **consecutive** numbers: from `tin[v]` to `tin[v] + size[v] - 1`. This is the *Euler tour* idea. So "sum of the subtree of `v`" is "sum of the array from `tin[v]` to `tin[v] + size[v] - 1`", and "change the value of `v`" is "change one array cell".',
        'A range sum with point changes is the job of a **Fenwick tree** (binary indexed tree): an array `bit` where `bit[i]` stores the sum of a block of cells ending at `i`, whose length is the lowest set bit of `i`.',
        { code: 'def update(pos, delta):                  # add delta to the cell pos (1-based)\n    while pos <= n:\n        bit[pos] += delta\n        pos += pos & -pos\n\ndef prefix(pos):                         # the sum of the cells 1..pos\n    total = 0\n    while pos > 0:\n        total += bit[pos]\n        pos -= pos & -pos\n    return total\n\n# subtree sum of v:  prefix(tin[v] + size[v] - 1) - prefix(tin[v] - 1)' },
        'Both operations take O(log n). The DFS order is made without recursion (a stack: pop a node, number it, push its children), and the sizes come from the breadth-first order walked backwards. The sums reach 2 * 10^13 in absolute value, so use 64-bit integers.'
      ]
    },
    statement: ['A tree with `n` nodes is given by the parent of each node (0 for the root), and every node has a starting value. Then `q` operations follow. `add v x` adds `x` to the value of the node `v`. `sum v 0` asks for the sum of the current values of all nodes in the subtree of `v` (the node `v` and everything below it); the second number is 0 and must be ignored. Print the answer to every `sum`.'],
    outputFormat: ['One line for every `sum` operation, in order.'],
    examples: [{ input: '5\n0 1 1 2 2\n1 2 3 4 5\n4\nsum 1 0\nadd 4 10\nsum 2 0\nsum 3 0\n', note: 'The whole tree sums to 15; after adding 10 to node 4 the subtree of 2 (nodes 2, 4, 5) sums to 2 + 14 + 5 = 21; the subtree of 3 is just 3.' }],
    hints: ['Number the nodes in a depth-first order; every subtree is then a block of consecutive numbers.', 'The block of v is from tin[v] to tin[v] + size[v] - 1.', 'Keep the values in a Fenwick tree: a point update and a prefix sum both take O(log n).'],
    program: {
      io: ['n:int', 'par:int[n]', 'vals:int[n]', 'q:int', 'ops:word[q][3]'],
      fast: true,
      python: r`
        kids = [[] for _ in range(n + 1)]
        root = 0
        for v in range(1, n + 1):
            if par[v - 1] == 0:
                root = v
            else:
                kids[par[v - 1]].append(v)
        order = [root]
        for v in order:
            order.extend(kids[v])
        size = [1] * (n + 1)
        for v in reversed(order):
            if par[v - 1] != 0:
                size[par[v - 1]] += size[v]
        tin = [0] * (n + 1)
        timer = 0
        stack = [root]
        while stack:
            v = stack.pop()
            timer += 1
            tin[v] = timer
            stack.extend(kids[v])
        bit = [0] * (n + 1)

        def update(pos, delta):
            while pos <= n:
                bit[pos] += delta
                pos += pos & -pos

        def prefix(pos):
            total = 0
            while pos > 0:
                total += bit[pos]
                pos -= pos & -pos
            return total

        for v in range(1, n + 1):
            update(tin[v], vals[v - 1])
        out = []
        for kind, a, b in ops:
            v = int(a)
            if kind == "add":
                update(tin[v], int(b))
            else:
                out.append(prefix(tin[v] + size[v] - 1) - prefix(tin[v] - 1))
        print("\n".join(map(str, out)))`,
      helpers: {
        python: '',
        cpp: r`
          vector<long long> bit;
          int cells = 0;

          void update(int pos, long long delta) {
              for (; pos <= cells; pos += pos & -pos) bit[pos] += delta;
          }

          long long prefix(int pos) {
              long long total = 0;
              for (; pos > 0; pos -= pos & -pos) total += bit[pos];
              return total;
          }`,
        java: r`
          static long[] bit;
          static int cells;

          static void update(int pos, long delta) {
              for (; pos <= cells; pos += pos & -pos) bit[pos] += delta;
          }

          static long prefix(int pos) {
              long total = 0;
              for (; pos > 0; pos -= pos & -pos) total += bit[pos];
              return total;
          }`
      },
      cpp: r`
        int count = (int)n;
        vector<vector<int>> kids(count + 1);
        int root = 0;
        for (int v = 1; v <= count; v++) {
            if (par[v - 1] == 0) root = v;
            else kids[par[v - 1]].push_back(v);
        }
        vector<int> order = {root};
        for (size_t i = 0; i < order.size(); i++) {
            for (int c : kids[order[i]]) order.push_back(c);
        }
        vector<int> sizes(count + 1, 1);
        for (size_t i = order.size(); i-- > 0;) {
            int v = order[i];
            if (par[v - 1] != 0) sizes[par[v - 1]] += sizes[v];
        }
        vector<int> tin(count + 1, 0), stack = {root};
        int timer = 0;
        while (!stack.empty()) {
            int v = stack.back();
            stack.pop_back();
            tin[v] = ++timer;
            for (int c : kids[v]) stack.push_back(c);
        }
        cells = count;
        bit.assign(count + 1, 0);
        for (int v = 1; v <= count; v++) update(tin[v], vals[v - 1]);
        for (int i = 0; i < q; i++) {
            int v = stoi(ops[i][1]);
            if (ops[i][0] == "add") update(tin[v], stoll(ops[i][2]));
            else cout << prefix(tin[v] + sizes[v] - 1) - prefix(tin[v] - 1) << "\n";
        }`,
      java: r`
        int count = (int) n;
        List<List<Integer>> kids = new ArrayList<>();
        for (int v = 0; v <= count; v++) kids.add(new ArrayList<>());
        int root = 0;
        for (int v = 1; v <= count; v++) {
            if (par[v - 1] == 0) root = v;
            else kids.get((int) par[v - 1]).add(v);
        }
        List<Integer> order = new ArrayList<>();
        order.add(root);
        for (int i = 0; i < order.size(); i++) order.addAll(kids.get(order.get(i)));
        int[] sizes = new int[count + 1];
        Arrays.fill(sizes, 1);
        for (int i = order.size() - 1; i >= 0; i--) {
            int v = order.get(i);
            if (par[v - 1] != 0) sizes[(int) par[v - 1]] += sizes[v];
        }
        int[] tin = new int[count + 1];
        ArrayList<Integer> stack = new ArrayList<>();
        stack.add(root);
        int timer = 0;
        while (!stack.isEmpty()) {
            int v = stack.remove(stack.size() - 1);
            tin[v] = ++timer;
            stack.addAll(kids.get(v));
        }
        cells = count;
        bit = new long[count + 1];
        for (int v = 1; v <= count; v++) update(tin[v], vals[v - 1]);
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            int v = Integer.parseInt(ops[i][1]);
            if (ops[i][0].equals("add")) update(tin[v], Long.parseLong(ops[i][2]));
            else out.append(prefix(tin[v] + sizes[v] - 1) - prefix(tin[v] - 1)).append("\n");
        }
        System.out.print(out);`
    },
    solution: { explanation: ['A stack-based depth-first walk numbers the nodes so that every subtree is a block of consecutive numbers; a Fenwick tree over these numbers supports changing one value and summing a block in O(log n).'], complexity: 'Time O((n + q) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const par = nums(rs[1]); const vals = nums(rs[2]); const n = par.length; const { kids, root } = childrenOf(par); const order = orderOf(kids, root);
      const size = new Array(n + 1).fill(1); for (let i = n - 1; i >= 0; i--) { const v = order[i]; if (par[v - 1]) size[par[v - 1]] += size[v]; }
      const tin = new Array(n + 1).fill(0); let timer = 0; const stack = [root]; while (stack.length) { const v = stack.pop(); tin[v] = ++timer; for (const c of kids[v]) stack.push(c); }
      const bit = new Array(n + 1).fill(0); const upd = (p, d) => { for (; p <= n; p += p & -p) bit[p] += d; }; const pre = (p) => { let s = 0; for (; p > 0; p -= p & -p) s += bit[p]; return s; };
      for (let v = 1; v <= n; v++) upd(tin[v], vals[v - 1]);
      const q = Number(rs[3]); const out = [];
      for (let i = 0; i < q; i++) { const [kind, a, b] = rs[4 + i].split(' '); const v = Number(a); if (kind === 'add') upd(tin[v], Number(b)); else out.push(pre(tin[v] + size[v] - 1) - pre(tin[v] - 1)); }
      return out.join('\n');
    },
    tests() {
      const g = rng(804); const out = ['5\n0 1 1 2 2\n1 2 3 4 5\n4\nsum 1 0\nadd 4 10\nsum 2 0\nsum 3 0\n', '1\n0\n5\n3\nsum 1 0\nadd 1 -7\nsum 1 0\n'];
      const brute = (input) => { const rs = rows(input); const par = nums(rs[1]); const vals = nums(rs[2]); const n = par.length; const q = Number(rs[3]); const res = []; for (let i = 0; i < q; i++) { const [kind, a, b] = rs[4 + i].split(' '); const v = Number(a); if (kind === 'add') vals[v - 1] += Number(b); else { let s = 0; for (let u = 1; u <= n; u++) { let c = u; for (;;) { if (c === v) { s += vals[u - 1]; break; } if (par[c - 1] === 0) break; c = par[c - 1]; } } res.push(s); } } return res.join('\n'); };
      const make = (n, kind, q, lo, hi) => { const par = parentTree(g, n, kind); const ops = many(q, (i) => (i % 2 ? `add ${randInt(g, 1, n)} ${randInt(g, lo, hi)}` : `sum ${randInt(g, 1, n)} 0`)); return `${listText(par)}${many(n, () => randInt(g, lo, hi)).join(' ')}\n${q}\n${ops.join('\n')}\n`; };
      crossCheck(() => make(randInt(g, 1, 12), SHAPES[randInt(g, 0, 5)], randInt(g, 2, 14), -20, 20), (i) => this.solve(i), brute);
      for (const kind of SHAPES) for (const [n, q, lo, hi] of [[7, 12, -9, 9], [100, 100, -1000, 1000], [3000, 3000, -1000000000, 1000000000], [20000, 8000, -1000000, 1000000]]) out.push(make(n, kind, q, lo, hi));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: EDGES_INPUT, constraints: EDGES_LIMITS,
    slug: 'tree-centroids',
    title: 'The Centroid of a Tree',
    tags: ['tree', 'centroid', 'bfs'],
    concept: {
      title: 'A centroid is a node whose removal leaves no component bigger than half of the tree',
      body: [
        'If you remove a node from a tree, the rest falls apart into several components (one per neighbour). A **centroid** is a node for which the **largest** remaining component has at most `n / 2` nodes: it splits the tree into balanced parts. Every tree has one or two centroids (two only when the tree has an even number of nodes and an edge cuts it into two halves of `n / 2`). Centroids are the basis of divide and conquer on trees: cut at the centroid, and every piece is at most half as big, so there are only O(log n) levels.',
        'To test a node `v`, root the tree anywhere and compute `size[v]`, the number of nodes in the subtree of `v`. The components after removing `v` are the subtrees of its children (sizes `size[c]`) and the "rest of the tree" above it, of size `n - size[v]`. So',
        { code: 'biggest[v] = max(n - size[v], max over children c of size[c])\nv is a centroid  <=>  2 * biggest[v] <= n' },
        'The sizes are computed without recursion: list the nodes in breadth-first order and walk the list backwards, adding every node\'s size to its parent. While doing this, keep for every node the largest child size. The tree can be a path of 20000 nodes, so recursion is not an option. Print the centroids in increasing order.'
      ]
    },
    statement: ['A tree with `m + 1` nodes is given by its `m` edges. A centroid is a node such that after its removal every remaining component has at most half of all the nodes (more precisely, at most `n / 2`, where `n = m + 1`, so twice the size of every component is at most `n`). Print all the centroids in increasing order, separated by spaces (there are one or two).'],
    outputFormat: ['The centroids in increasing order on one line.'],
    examples: [{ input: '5\n1 2\n1 3\n3 4\n3 5\n5 6\n', note: 'Removing node 3 leaves the components {1, 2}, {4} and {5, 6}, all of size at most 3 = 6 / 2. Node 1 leaves {2} and {3, 4, 5, 6}: 4 > 3, so it is not a centroid. The only centroid is 3.' }],
    hints: ['Root the tree at node 1 and compute the subtree sizes from the breadth-first order, walked backwards.', 'The components after removing v are the child subtrees and the rest above v, of size n - size[v].', 'v is a centroid when twice the largest of these sizes is at most n.'],
    program: {
      io: ['m:int', 'edges:int[m][2]'],
      fast: true,
      python: r`
        n = m + 1
        adj = [[] for _ in range(n + 1)]
        for u, v in edges:
            adj[u].append(v)
            adj[v].append(u)
        parent = [0] * (n + 1)
        parent[1] = -1
        order = [1]
        for v in order:
            for w in adj[v]:
                if w != parent[v]:
                    parent[w] = v
                    order.append(w)
        size = [1] * (n + 1)
        biggest_child = [0] * (n + 1)
        for v in reversed(order[1:]):
            p = parent[v]
            size[p] += size[v]
            biggest_child[p] = max(biggest_child[p], size[v])
        centroids = [v for v in range(1, n + 1) if 2 * max(n - size[v], biggest_child[v]) <= n]
        print(*centroids)`,
      cpp: r`
        int count = (int)m + 1;
        vector<vector<int>> adj(count + 1);
        for (const vector<long long>& e : edges) {
            adj[e[0]].push_back((int)e[1]);
            adj[e[1]].push_back((int)e[0]);
        }
        vector<int> parent(count + 1, 0), order = {1};
        parent[1] = -1;
        for (size_t i = 0; i < order.size(); i++) {
            int v = order[i];
            for (int w : adj[v]) {
                if (w != parent[v]) {
                    parent[w] = v;
                    order.push_back(w);
                }
            }
        }
        vector<int> sizes(count + 1, 1), biggestChild(count + 1, 0);
        for (size_t i = order.size(); i-- > 1;) {
            int v = order[i];
            sizes[parent[v]] += sizes[v];
            biggestChild[parent[v]] = max(biggestChild[parent[v]], sizes[v]);
        }
        bool first = true;
        for (int v = 1; v <= count; v++) {
            if (2 * max(count - sizes[v], biggestChild[v]) <= count) {
                cout << (first ? "" : " ") << v;
                first = false;
            }
        }
        cout << "\n";`,
      includes: ['<algorithm>'],
      java: r`
        int count = (int) m + 1;
        List<List<Integer>> adj = new ArrayList<>();
        for (int v = 0; v <= count; v++) adj.add(new ArrayList<>());
        for (long[] e : edges) {
            adj.get((int) e[0]).add((int) e[1]);
            adj.get((int) e[1]).add((int) e[0]);
        }
        int[] parent = new int[count + 1];
        parent[1] = -1;
        List<Integer> order = new ArrayList<>();
        order.add(1);
        for (int i = 0; i < order.size(); i++) {
            int v = order.get(i);
            for (int w : adj.get(v)) {
                if (w != parent[v]) {
                    parent[w] = v;
                    order.add(w);
                }
            }
        }
        int[] sizes = new int[count + 1];
        Arrays.fill(sizes, 1);
        int[] biggestChild = new int[count + 1];
        for (int i = order.size() - 1; i >= 1; i--) {
            int v = order.get(i);
            sizes[parent[v]] += sizes[v];
            biggestChild[parent[v]] = Math.max(biggestChild[parent[v]], sizes[v]);
        }
        StringBuilder out = new StringBuilder();
        for (int v = 1; v <= count; v++) {
            if (2 * Math.max(count - sizes[v], biggestChild[v]) <= count) out.append(out.length() > 0 ? " " : "").append(v);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['With subtree sizes from a breadth-first order walked backwards, the largest component after removing v is the larger of n - size[v] and the biggest child subtree; v is a centroid when twice that is at most n.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const { n, adj } = adjacency(input); const out = [];
      for (let v = 1; v <= n; v++) {
        // the sizes of the components after removing v, found by searching from each neighbour
        let biggest = 0; const seen = new Array(n + 1).fill(false); seen[v] = true;
        for (const s of adj[v]) { if (seen[s]) continue; let c = 0; const q = [s]; seen[s] = true; for (let h = 0; h < q.length; h++) { c++; for (const w of adj[q[h]]) if (!seen[w]) { seen[w] = true; q.push(w); } } biggest = Math.max(biggest, c); }
        if (2 * biggest <= n) out.push(v);
      }
      return out.join(' ');
    },
    tests() {
      const g = rng(805); const out = ['5\n1 2\n1 3\n3 4\n3 5\n5 6\n', '1\n1 2\n', '2\n2 1\n3 2\n', '3\n1 2\n2 3\n3 4\n'];
      const fast = (input) => { const { n, adj } = adjacency(input); const parent = new Array(n + 1).fill(0); parent[1] = -1; const order = [1]; for (let i = 0; i < order.length; i++) for (const w of adj[order[i]]) if (w !== parent[order[i]]) { parent[w] = order[i]; order.push(w); } const size = new Array(n + 1).fill(1), big = new Array(n + 1).fill(0); for (let i = n - 1; i >= 1; i--) { const v = order[i]; size[parent[v]] += size[v]; big[parent[v]] = Math.max(big[parent[v]], size[v]); } const res = []; for (let v = 1; v <= n; v++) if (2 * Math.max(n - size[v], big[v]) <= n) res.push(v); return res.join(' '); };
      for (let t = 0; t < 40; t++) { const input = edgesOf(g, randInt(g, 2, 14), SHAPES[randInt(g, 0, 5)]); if (fast(input) !== this.solve(input)) throw new Error('tree-centroids: reference mismatch'); }
      for (const kind of SHAPES) for (const n of [7, 100, 3000, 20000]) out.push(edgesOf(g, n, kind));
      out.push(`1\n1 2\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: [...PARENT_INPUT, 'The third line has a string `s` of `n` lowercase letters: `s[i]` is the letter of the node `i`.'],
    constraints: [...PARENT_LIMITS],
    slug: 'longest-path-different-adjacent',
    title: 'The Longest Path With No Equal Neighbours',
    tags: ['tree', 'tree-dp', 'string'],
    concept: {
      title: 'Each node keeps its two longest downward chains that are allowed to continue',
      body: [
        'Every node of the tree carries a letter. A path is *allowed* if no two **neighbouring nodes on it have the same letter**. Find the allowed path with the most nodes. As in the "best path with negative values" problem, every path has a **highest node**, where it comes up from one child and goes down to another.',
        'For each node `v` let `down[v]` be the number of nodes in the longest allowed chain that starts at `v` and goes **down** (`down[v] = 1 + the best of the allowed child chains`). A child `c` can extend the chain of `v` only if its letter differs from the letter of `v`. At each node keep the **two longest** such child chains `m1 >= m2`: the longest path whose highest node is `v` has `1 + m1 + m2` nodes, and the chain returned to the parent is `1 + m1`.',
        { code: 'best = 1\nfor v in reversed(order):                   # children before parents\n    best = max(best, 1 + m1[v] + m2[v])      # the path that bends at v\n    chain = 1 + m1[v]                        # the chain to give to the parent\n    p = parent[v]\n    if p and letter[v] != letter[p]:         # only if the letters differ\n        if chain > m1[p]:\n            m2[p], m1[p] = m1[p], chain\n        elif chain > m2[p]:\n            m2[p] = chain' },
        'Walking the breadth-first order backwards visits every node after all its children, so no recursion is needed (the tree can be a path of 20000 nodes). Remember that the answer counts **nodes**, and a single node is always an allowed path.'
      ]
    },
    statement: ['A tree with `n` nodes is given by the parent of each node (0 for the root), and every node has a lowercase letter. A path is allowed if no two neighbouring nodes on it have the same letter. Print the largest number of nodes of an allowed path (a single node is an allowed path).'],
    outputFormat: ['Print the largest number of nodes.'],
    examples: [{ input: '6\n0 1 1 2 2 3\nabacbe\n', note: 'The letters of the nodes 1..6 are a b a c b e. The path 4-2-1 (letters c, b, a) is allowed and has 3 nodes; longer paths contain two neighbours with the same letter (the nodes 1 and 3, or 2 and 5). The answer is 3.' }],
    hints: ['For each node compute the longest downward chain whose neighbours have different letters.', 'A child with the same letter as its parent cannot extend the chain of the parent.', 'Keep the two best chains at every node: they give the best path bent at the node, 1 + m1 + m2.'],
    program: {
      io: ['n:int', 'par:int[n]', 's:word'],
      fast: true,
      python: r`
        kids = [[] for _ in range(n + 1)]
        root = 0
        for v in range(1, n + 1):
            if par[v - 1] == 0:
                root = v
            else:
                kids[par[v - 1]].append(v)
        order = [root]
        for v in order:
            order.extend(kids[v])
        m1 = [0] * (n + 1)
        m2 = [0] * (n + 1)
        best = 1
        for v in reversed(order):
            best = max(best, 1 + m1[v] + m2[v])
            chain = 1 + m1[v]
            p = par[v - 1]
            if p != 0 and s[v - 1] != s[p - 1]:
                if chain > m1[p]:
                    m2[p] = m1[p]
                    m1[p] = chain
                elif chain > m2[p]:
                    m2[p] = chain
        print(best)`,
      cpp: r`
        int count = (int)n;
        vector<vector<int>> kids(count + 1);
        int root = 0;
        for (int v = 1; v <= count; v++) {
            if (par[v - 1] == 0) root = v;
            else kids[par[v - 1]].push_back(v);
        }
        vector<int> order = {root};
        for (size_t i = 0; i < order.size(); i++) {
            for (int c : kids[order[i]]) order.push_back(c);
        }
        vector<int> m1(count + 1, 0), m2(count + 1, 0);
        int best = 1;
        for (size_t i = order.size(); i-- > 0;) {
            int v = order[i];
            best = max(best, 1 + m1[v] + m2[v]);
            int chain = 1 + m1[v];
            int p = (int)par[v - 1];
            if (p != 0 && s[v - 1] != s[p - 1]) {
                if (chain > m1[p]) {
                    m2[p] = m1[p];
                    m1[p] = chain;
                } else if (chain > m2[p]) {
                    m2[p] = chain;
                }
            }
        }
        cout << best << "\n";`,
      includes: ['<algorithm>'],
      java: r`
        int count = (int) n;
        List<List<Integer>> kids = new ArrayList<>();
        for (int v = 0; v <= count; v++) kids.add(new ArrayList<>());
        int root = 0;
        for (int v = 1; v <= count; v++) {
            if (par[v - 1] == 0) root = v;
            else kids.get((int) par[v - 1]).add(v);
        }
        List<Integer> order = new ArrayList<>();
        order.add(root);
        for (int i = 0; i < order.size(); i++) order.addAll(kids.get(order.get(i)));
        int[] m1 = new int[count + 1];
        int[] m2 = new int[count + 1];
        int best = 1;
        for (int i = order.size() - 1; i >= 0; i--) {
            int v = order.get(i);
            best = Math.max(best, 1 + m1[v] + m2[v]);
            int chain = 1 + m1[v];
            int p = (int) par[v - 1];
            if (p != 0 && s.charAt(v - 1) != s.charAt(p - 1)) {
                if (chain > m1[p]) {
                    m2[p] = m1[p];
                    m1[p] = chain;
                } else if (chain > m2[p]) {
                    m2[p] = chain;
                }
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['In reverse breadth-first order every node already has the chains of its children. It keeps the two longest chains coming from children with a different letter; the path bent at the node has 1 + m1 + m2 nodes, and 1 + m1 is offered to the parent.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const rs = rows(input); const par = nums(rs[1]); const s = rs[2]; const n = par.length; const { kids, root } = childrenOf(par); const order = orderOf(kids, root);
      const m1 = new Array(n + 1).fill(0), m2 = new Array(n + 1).fill(0); let best = 1;
      for (let i = n - 1; i >= 0; i--) { const v = order[i]; best = Math.max(best, 1 + m1[v] + m2[v]); const chain = 1 + m1[v]; const p = par[v - 1]; if (p && s[v - 1] !== s[p - 1]) { if (chain > m1[p]) { m2[p] = m1[p]; m1[p] = chain; } else if (chain > m2[p]) m2[p] = chain; } }
      return String(best);
    },
    tests() {
      const g = rng(806); const out = ['6\n0 1 1 2 2 3\nabacbe\n', '1\n0\na\n', '3\n0 1 1\naaa\n', '3\n0 1 2\nabc\n'];
      const brute = (input) => { const rs = rows(input); const par = nums(rs[1]); const s = rs[2]; const n = par.length; const adj = Array.from({ length: n + 1 }, () => []); par.forEach((p, i) => { if (p) { adj[p].push(i + 1); adj[i + 1].push(p); } }); let best = 1; const go = (v, from, len) => { best = Math.max(best, len); for (const w of adj[v]) if (w !== from && s[w - 1] !== s[v - 1]) go(w, v, len + 1); }; for (let v = 1; v <= n; v++) go(v, 0, 1); return String(best); };
      const make = (n, kind, alphabet) => { const par = parentTree(g, n, kind); return `${listText(par)}${randWord(g, n, alphabet)}\n`; };
      crossCheck(() => make(randInt(g, 1, 12), SHAPES[randInt(g, 0, 5)], 'ab'), (i) => this.solve(i), brute);
      for (const kind of SHAPES) for (const [n, al] of [[7, 'ab'], [100, 'abc'], [3000, 'ab'], [20000, 'abcdefghijklmnopqrstuvwxyz'], [20000, 'ab']]) out.push(make(n, kind, al));
      out.push(`20000\n${['0', ...many(19999, (i) => String(i + 1))].join(' ')}\n${'ab'.repeat(10000)}\n`, `20000\n${['0', ...many(19999, (i) => String(i + 1))].join(' ')}\n${'a'.repeat(20000)}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`, the number of nodes of the first tree.', 'The second line has `n` numbers: the parent of each node of the first tree (0 for the root).', 'The third line has `m`, the number of nodes of the second tree.', 'The fourth line has `m` numbers: the parent of each node of the second tree.'],
    constraints: ['1 <= n, m <= 20000', 'Both lines describe a tree: exactly one node has the parent 0, and following parents always reaches it.', 'A parent can have a larger number than its child.', 'The trees can be long paths.'],
    slug: 'rooted-tree-isomorphism',
    title: 'Are These Two Trees the Same Shape?',
    tags: ['tree', 'hashing', 'isomorphism', 'canonical-form'],
    concept: {
      title: 'Name every subtree shape by the sorted names of its children',
      body: [
        'Two rooted trees are *isomorphic* if one can be turned into the other by renaming the nodes and reordering the children of any node. In other words, they have the same **shape**; the node numbers and the order of the children do not matter. Comparing the trees by trying all orderings would be hopeless.',
        'Give every possible subtree shape a small number (an *id*), assigned in the order of discovery, with this rule: the id of a node is decided by the **sorted list of the ids of its children**. A leaf has the empty list. Two nodes get the same id exactly when their subtrees have the same shape (by induction from the leaves up), and the sorting removes the dependence on the order of the children.',
        { code: 'ids = {}                                    # sorted tuple of child ids -> id (shared by both trees!)\nfor v in reversed(bfs_order):               # children before parents\n    key = tuple(sorted(id_of[c] for c in kids[v]))\n    if key not in ids:\n        ids[key] = len(ids)\n    id_of[v] = ids[key]\n# the trees are isomorphic  <=>  id_of[root1] == id_of[root2]' },
        'The dictionary must be **shared** between the two trees, otherwise the ids would not be comparable. Sorting the children of all nodes costs O(n log n) in total, and the keys have O(n) numbers in total. No recursion is used, so a tree that is a path of 20000 nodes is no problem. This is the algorithm of Aho, Hopcroft and Ullman for rooted tree isomorphism.'
      ]
    },
    statement: ['Two rooted trees are given by the parents of their nodes (0 for the root). They are isomorphic if the second can be obtained from the first by renaming the nodes and reordering the children of nodes (the roots correspond to each other). Print `yes` if the trees are isomorphic and `no` otherwise.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '4\n0 1 1 2\n4\n0 1 2 2\n', note: 'The first tree: the root 1 with the children 2 (which has the child 4) and 3. The second tree: the root 1 with the single child 2, which has two children. The roots have different numbers of children: no.' }, { input: '4\n0 1 1 2\n4\n3 0 2 2\n', note: 'In the second tree the root is node 2, with the children 3 (which has the child 1) and 4. This is the same shape as the first tree: yes.' }],
    hints: ['Give each distinct shape an id, from the leaves upwards.', 'The id of a node is determined by the sorted list of the ids of its children; use one shared dictionary for both trees.', 'The trees are isomorphic exactly when their roots get the same id.'],
    program: {
      io: ['n:int', 'p1:int[n]', 'm:int', 'p2:int[m]'],
      fast: true,
      includes: ['<map>', '<algorithm>'],
      helpers: {
        python: r`
          def canon(par, ids):
              n = len(par)
              kids = [[] for _ in range(n + 1)]
              root = 0
              for v in range(1, n + 1):
                  if par[v - 1] == 0:
                      root = v
                  else:
                      kids[par[v - 1]].append(v)
              order = [root]
              for v in order:
                  order.extend(kids[v])
              ident = [0] * (n + 1)
              for v in reversed(order):
                  key = tuple(sorted(ident[c] for c in kids[v]))
                  if key not in ids:
                      ids[key] = len(ids)
                  ident[v] = ids[key]
              return ident[root]`,
        cpp: r`
          int canon(const vector<long long>& par, map<vector<int>, int>& ids) {
              int n = (int)par.size();
              vector<vector<int>> kids(n + 1);
              int root = 0;
              for (int v = 1; v <= n; v++) {
                  if (par[v - 1] == 0) root = v;
                  else kids[par[v - 1]].push_back(v);
              }
              vector<int> order = {root};
              for (size_t i = 0; i < order.size(); i++) {
                  for (int c : kids[order[i]]) order.push_back(c);
              }
              vector<int> ident(n + 1, 0);
              for (size_t i = order.size(); i-- > 0;) {
                  int v = order[i];
                  vector<int> key;
                  for (int c : kids[v]) key.push_back(ident[c]);
                  sort(key.begin(), key.end());
                  if (!ids.count(key)) {
                      int fresh = (int)ids.size();
                      ids[key] = fresh;
                  }
                  ident[v] = ids[key];
              }
              return ident[root];
          }`,
        java: r`
          static int canon(long[] par, Map<List<Integer>, Integer> ids) {
              int n = par.length;
              List<List<Integer>> kids = new ArrayList<>();
              for (int v = 0; v <= n; v++) kids.add(new ArrayList<>());
              int root = 0;
              for (int v = 1; v <= n; v++) {
                  if (par[v - 1] == 0) root = v;
                  else kids.get((int) par[v - 1]).add(v);
              }
              List<Integer> order = new ArrayList<>();
              order.add(root);
              for (int i = 0; i < order.size(); i++) order.addAll(kids.get(order.get(i)));
              int[] ident = new int[n + 1];
              for (int i = order.size() - 1; i >= 0; i--) {
                  int v = order.get(i);
                  List<Integer> key = new ArrayList<>();
                  for (int c : kids.get(v)) key.add(ident[c]);
                  Collections.sort(key);
                  if (!ids.containsKey(key)) ids.put(key, ids.size());
                  ident[v] = ids.get(key);
              }
              return ident[root];
          }`
      },
      python: r`
        ids = {}
        first = canon(p1, ids)
        second = canon(p2, ids)
        print("yes" if first == second else "no")`,
      cpp: r`
        map<vector<int>, int> ids;
        int first = canon(p1, ids);
        int second = canon(p2, ids);
        cout << (first == second ? "yes" : "no") << "\n";`,
      java: r`
        Map<List<Integer>, Integer> ids = new HashMap<>();
        int first = canon(p1, ids);
        int second = canon(p2, ids);
        System.out.println(first == second ? "yes" : "no");`
    },
    solution: { explanation: ['From the leaves up, each node gets an id decided by the sorted list of its children ids, with one dictionary shared by both trees. The trees are isomorphic exactly when the roots have the same id.'], complexity: 'Time O((n + m) log(n + m)), space O(n + m).' },
    solve(input) {
      const rs = rows(input); const a = nums(rs[1]), b = nums(rs[3]); const ids = new Map();
      const canon = (par) => { const { kids, root } = childrenOf(par); const order = orderOf(kids, root); const ident = new Array(par.length + 1).fill(0); for (let i = order.length - 1; i >= 0; i--) { const v = order[i]; const key = kids[v].map((c) => ident[c]).sort((x, y) => x - y).join(','); if (!ids.has(key)) ids.set(key, ids.size); ident[v] = ids.get(key); } return ident[root]; };
      return canon(a) === canon(b) ? 'yes' : 'no';
    },
    tests() {
      const g = rng(807); const out = ['4\n0 1 1 2\n4\n0 1 2 2\n', '4\n0 1 1 2\n4\n3 0 2 2\n', '1\n0\n1\n0\n', '1\n0\n2\n0 1\n'];
      const brute = (input) => { const rs = rows(input); const nested = (par) => { const { kids, root } = childrenOf(par); const go = (v) => `(${kids[v].map(go).sort().join('')})`; return go(root); }; return nested(nums(rs[1])) === nested(nums(rs[3])) ? 'yes' : 'no'; };
      // a tree with the same shape but renamed nodes and shuffled children, and a tree with one leaf moved
      const rename = (par) => { const n = par.length; const label = shuffle(g, many(n, (i) => i + 1)); const out2 = new Array(n).fill(0); par.forEach((p, i) => { out2[label[i] - 1] = p ? label[p - 1] : 0; }); return out2; };
      const moved = (par) => { const n = par.length; const copy = par.slice(); if (n < 3) return copy; const { kids } = childrenOf(par); const leaves = []; for (let v = 1; v <= n; v++) if (!kids[v].length && par[v - 1]) leaves.push(v); if (!leaves.length) return copy; const leaf = leaves[randInt(g, 0, leaves.length - 1)]; let target = randInt(g, 1, n); while (target === leaf || target === par[leaf - 1]) target = randInt(g, 1, n); copy[leaf - 1] = target; return copy; };
      const isTree = (par) => { const n = par.length; for (let v = 1; v <= n; v++) { let c = v, steps = 0; while (par[c - 1] !== 0 && steps <= n) { c = par[c - 1]; steps++; } if (steps > n) return false; } return true; };
      const pair = (a, b) => `${listText(a)}${listText(b)}`;
      crossCheck(() => { const a = parentTree(g, randInt(g, 1, 9), SHAPES[randInt(g, 0, 5)]); const kind = randInt(g, 0, 2); const b = kind === 0 ? rename(a) : kind === 1 ? parentTree(g, a.length, SHAPES[randInt(g, 0, 5)]) : moved(a); return pair(a, isTree(b) ? b : a); }, (i) => this.solve(i), brute, 300);
      for (const kind of SHAPES) for (const n of [7, 100, 3000, 20000]) {
        const a = parentTree(g, n, kind); out.push(pair(a, rename(a)));
        if (n >= 3) out.push(pair(a, moved(a)));
        if (n <= 3000) out.push(pair(a, parentTree(g, n, SHAPES[(SHAPES.indexOf(kind) + 1) % 6])));
      }
      return out;
    }
  },

  {
    ...hard,
    inputFormat: EDGES_INPUT, constraints: EDGES_LIMITS,
    slug: 'minimum-height-roots',
    title: 'The Best Roots for the Lowest Tree',
    tags: ['tree', 'graph', 'bfs', 'topological-order'],
    concept: {
      title: 'Peel the leaves layer by layer; the last one or two nodes are the best roots',
      body: [
        'Choose any node of a tree as its root: the *height* is the number of edges on the longest road down from the root. Different roots give different heights, and we want the roots that give the **smallest height**. Trying every root costs O(n^2). Think about where the roots with a low height must be: in the **middle** of the tree, so that the longest road from the root is as short as possible (the roots are the centers of the longest road, the diameter).',
        'A neat way to find the middle without computing the diameter: **peel the leaves**. Remove all current leaves (nodes of degree 1) at once; this makes new leaves; repeat. The tree shrinks like an onion, and **the last one or two nodes** that remain are the middle: one node if the diameter has an even number of edges, two if it is odd.',
        { code: 'degree = [len(adj[v]) for v in range(n + 1)]\nleaves = [v for v in range(1, n + 1) if degree[v] <= 1]\nremaining = n\nwhile remaining > 2:\n    remaining -= len(leaves)\n    next_leaves = []\n    for leaf in leaves:\n        for w in adj[leaf]:\n            degree[w] -= 1\n            if degree[w] == 1:           # w became a leaf\n                next_leaves.append(w)\n    leaves = next_leaves\nprint(*sorted(leaves))' },
        'Each node is removed once and each edge looked at twice, so the time is O(n). Layers are processed with loops, not recursion, and a path of 20000 nodes needs about 10000 rounds. The method is also a *topological order* from the leaves inward.'
      ]
    },
    statement: ['A tree with `m + 1` nodes is given by its `m` edges. If a node is chosen as the root, the height of the tree is the largest number of edges on a road from the root downward. Print all the nodes that give the smallest possible height when chosen as the root, in increasing order, separated by spaces (there are one or two such nodes).'],
    outputFormat: ['The best roots in increasing order on one line.'],
    examples: [{ input: '5\n1 2\n1 3\n3 4\n3 5\n5 6\n', note: 'The longest road is 2-1-3-5-6 (4 edges) or 4-3-5-6; the middle of the road 2-1-3-5-6 is node 3, which gives the height 2. Only node 3 does.' }, { input: '3\n1 2\n2 3\n3 4\n', note: 'The path has 3 edges; both middle nodes 2 and 3 give the height 2: 2 3.' }],
    hints: ['A root with a small height is near the middle of the longest road.', 'Remove all leaves, then the new leaves, and so on, until one or two nodes remain.', 'Keep the degrees of the nodes up to date and collect the nodes that become leaves.'],
    program: {
      io: ['m:int', 'edges:int[m][2]'],
      fast: true,
      python: r`
        n = m + 1
        adj = [[] for _ in range(n + 1)]
        for u, v in edges:
            adj[u].append(v)
            adj[v].append(u)
        degree = [len(adj[v]) for v in range(n + 1)]
        leaves = [v for v in range(1, n + 1) if degree[v] <= 1]
        remaining = n
        while remaining > 2:
            remaining -= len(leaves)
            next_leaves = []
            for leaf in leaves:
                for w in adj[leaf]:
                    degree[w] -= 1
                    if degree[w] == 1:
                        next_leaves.append(w)
            leaves = next_leaves
        print(*sorted(leaves))`,
      cpp: r`
        int count = (int)m + 1;
        vector<vector<int>> adj(count + 1);
        for (const vector<long long>& e : edges) {
            adj[e[0]].push_back((int)e[1]);
            adj[e[1]].push_back((int)e[0]);
        }
        vector<int> degree(count + 1, 0);
        for (int v = 1; v <= count; v++) degree[v] = (int)adj[v].size();
        vector<int> leaves;
        for (int v = 1; v <= count; v++) {
            if (degree[v] <= 1) leaves.push_back(v);
        }
        int remaining = count;
        while (remaining > 2) {
            remaining -= (int)leaves.size();
            vector<int> next;
            for (int leaf : leaves) {
                for (int w : adj[leaf]) {
                    degree[w]--;
                    if (degree[w] == 1) next.push_back(w);
                }
            }
            leaves = next;
        }
        sort(leaves.begin(), leaves.end());
        for (size_t i = 0; i < leaves.size(); i++) cout << (i ? " " : "") << leaves[i];
        cout << "\n";`,
      includes: ['<algorithm>'],
      java: r`
        int count = (int) m + 1;
        List<List<Integer>> adj = new ArrayList<>();
        for (int v = 0; v <= count; v++) adj.add(new ArrayList<>());
        for (long[] e : edges) {
            adj.get((int) e[0]).add((int) e[1]);
            adj.get((int) e[1]).add((int) e[0]);
        }
        int[] degree = new int[count + 1];
        for (int v = 1; v <= count; v++) degree[v] = adj.get(v).size();
        List<Integer> leaves = new ArrayList<>();
        for (int v = 1; v <= count; v++) {
            if (degree[v] <= 1) leaves.add(v);
        }
        int remaining = count;
        while (remaining > 2) {
            remaining -= leaves.size();
            List<Integer> next = new ArrayList<>();
            for (int leaf : leaves) {
                for (int w : adj.get(leaf)) {
                    degree[w]--;
                    if (degree[w] == 1) next.add(w);
                }
            }
            leaves = next;
        }
        Collections.sort(leaves);
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < leaves.size(); i++) out.append(i > 0 ? " " : "").append(leaves.get(i));
        System.out.println(out);`
    },
    solution: { explanation: ['Leaves are peeled layer by layer while more than two nodes remain; the last one or two nodes are the middle of the longest road and give the smallest height.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const { n, adj } = adjacency(input);
      // the height of the tree for every possible root, by one search from each node (fast enough only for small trees); for big trees use the middle of the diameter
      if (n <= 400) { const heights = many(n, (i) => Math.max(...distancesFrom(adj, n, i + 1).slice(1))); const best = Math.min(...heights); return heights.map((h, i) => (h === best ? i + 1 : 0)).filter(Boolean).join(' '); }
      const far = (s) => { const d = distancesFrom(adj, n, s); let at = s; for (let v = 1; v <= n; v++) if (d[v] > d[at]) at = v; return at; };
      const a = far(1), b = far(a); const da = distancesFrom(adj, n, a), db = distancesFrom(adj, n, b); const diameter = da[b]; const centers = [];
      for (let v = 1; v <= n; v++) if (da[v] + db[v] === diameter && Math.abs(da[v] - db[v]) <= 1) centers.push(v);
      return centers.join(' ');
    },
    tests() {
      const g = rng(808); const out = ['5\n1 2\n1 3\n3 4\n3 5\n5 6\n', '3\n1 2\n2 3\n3 4\n', '1\n1 2\n', '2\n2 1\n3 2\n'];
      const peel = (input) => { const { n, adj } = adjacency(input); const degree = adj.map((l) => l.length); let leaves = []; for (let v = 1; v <= n; v++) if (degree[v] <= 1) leaves.push(v); let remaining = n; while (remaining > 2) { remaining -= leaves.length; const next = []; for (const leaf of leaves) for (const w of adj[leaf]) { degree[w]--; if (degree[w] === 1) next.push(w); } leaves = next; } return leaves.sort((x, y) => x - y).join(' '); };
      for (let t = 0; t < 60; t++) { const input = edgesOf(g, randInt(g, 2, 16), SHAPES[randInt(g, 0, 5)]); if (peel(input) !== this.solve(input)) throw new Error('minimum-height-roots: reference mismatch'); }
      for (const kind of SHAPES) for (const n of [7, 100, 3000, 20000]) { const input = edgesOf(g, n, kind); if (n >= 3000 && peel(input) !== this.solve(input)) throw new Error('minimum-height-roots: big reference mismatch'); out.push(input); }
      return out;
    }
  }
];
