// Pieces of solution code shared by the graph problems. Each piece is placed at the start of a program body:
// J(piece, r`...rest`) joins pieces written at different indentations.
import { r } from './lib.mjs';
import { dedent } from './programs.mjs';

export const J = (...parts) => parts.map((p) => dedent(p)).join('\n');

// Adjacency lists of an undirected graph read as n, m and edges (u, v).
export const ADJ = {
  python: r`
    adj = [[] for _ in range(n + 1)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)`,
  cpp: r`
    vector<vector<int>> adj(n + 1);
    for (const vector<long long>& e : edges) {
        adj[e[0]].push_back((int)e[1]);
        adj[e[1]].push_back((int)e[0]);
    }`,
  java: r`
    int nodes = (int) n;
    List<List<Integer>> adj = new ArrayList<>();
    for (int v = 0; v <= nodes; v++) adj.add(new ArrayList<>());
    for (long[] e : edges) {
        adj.get((int) e[0]).add((int) e[1]);
        adj.get((int) e[1]).add((int) e[0]);
    }`
};

// Adjacency lists of a directed graph: an edge (u, v) goes from u to v.
export const DIR = {
  python: r`
    adj = [[] for _ in range(n + 1)]
    for u, v in edges:
        adj[u].append(v)`,
  cpp: r`
    vector<vector<int>> adj(n + 1);
    for (const vector<long long>& e : edges) adj[e[0]].push_back((int)e[1]);`,
  java: r`
    int nodes = (int) n;
    List<List<Integer>> adj = new ArrayList<>();
    for (int v = 0; v <= nodes; v++) adj.add(new ArrayList<>());
    for (long[] e : edges) adj.get((int) e[0]).add((int) e[1]);`
};

// Weighted undirected graph: edges (u, v, w); adj[u] holds pairs (v, w).
export const WADJ = {
  python: r`
    adj = [[] for _ in range(n + 1)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))`,
  cpp: r`
    vector<vector<pair<int, long long>>> adj(n + 1);
    for (const vector<long long>& e : edges) {
        adj[e[0]].push_back({(int)e[1], e[2]});
        adj[e[1]].push_back({(int)e[0], e[2]});
    }`,
  java: r`
    int nodes = (int) n;
    List<List<long[]>> adj = new ArrayList<>();
    for (int v = 0; v <= nodes; v++) adj.add(new ArrayList<>());
    for (long[] e : edges) {
        adj.get((int) e[0]).add(new long[] {e[1], e[2]});
        adj.get((int) e[1]).add(new long[] {e[0], e[2]});
    }`
};

// Weighted directed graph: an edge (u, v, w) goes from u to v.
export const WDIR = {
  python: r`
    adj = [[] for _ in range(n + 1)]
    for u, v, w in edges:
        adj[u].append((v, w))`,
  cpp: r`
    vector<vector<pair<int, long long>>> adj(n + 1);
    for (const vector<long long>& e : edges) adj[e[0]].push_back({(int)e[1], e[2]});`,
  java: r`
    int nodes = (int) n;
    List<List<long[]>> adj = new ArrayList<>();
    for (int v = 0; v <= nodes; v++) adj.add(new ArrayList<>());
    for (long[] e : edges) adj.get((int) e[0]).add(new long[] {e[1], e[2]});`
};

// Text of the input for a graph, and the usual descriptions of it.
export const EDGE_INPUT = ['The first line has `n` and `m`: the number of nodes (numbered 1 to n) and the number of edges.', 'Each of the next `m` lines has two numbers `u` and `v`: an edge between the nodes `u` and `v`.'];
export const DIR_INPUT = ['The first line has `n` and `m`: the number of nodes (numbered 1 to n) and the number of edges.', 'Each of the next `m` lines has two numbers `u` and `v`: an edge that goes from the node `u` to the node `v`.'];
export const WEDGE_INPUT = ['The first line has `n` and `m`: the number of nodes (numbered 1 to n) and the number of edges.', 'Each of the next `m` lines has three numbers `u`, `v` and `w`: an edge between the nodes `u` and `v` with the weight `w`.'];
export const WDIR_INPUT = ['The first line has `n` and `m`: the number of nodes (numbered 1 to n) and the number of edges.', 'Each of the next `m` lines has three numbers `u`, `v` and `w`: an edge that goes from the node `u` to the node `v` with the weight `w`.'];
export const EDGE_LIMITS = ['1 <= n <= 20000', '1 <= m <= 30000', 'There are no self-loops and no repeated edges.'];
export const GRID_INPUT = ['The first line has `h` and `w`: the number of rows and columns.', 'Each of the next `h` lines has a row of `w` characters.'];

// Disjoint sets (union-find) with path compression and union by size. Set the arrays before use:
// Python: parent.extend(range(N)); size.extend([1] * N)    C++: parent.resize(N), sizes.assign(N, 1)    Java: parent = new int[N]; sizes = new int[N]
export const DSU = {
  python: r`
    parent = []
    size = []

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        a, b = find(a), find(b)
        if a == b:
            return False
        if size[a] < size[b]:
            a, b = b, a
        parent[b] = a
        size[a] += size[b]
        return True`,
  cpp: r`
    vector<int> parent, sizes;

    int findRoot(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    bool unite(int a, int b) {
        a = findRoot(a);
        b = findRoot(b);
        if (a == b) return false;
        if (sizes[a] < sizes[b]) swap(a, b);
        parent[b] = a;
        sizes[a] += sizes[b];
        return true;
    }`,
  java: r`
    static int[] parent;
    static int[] sizes;

    static int findRoot(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    static boolean unite(int a, int b) {
        a = findRoot(a);
        b = findRoot(b);
        if (a == b) return false;
        if (sizes[a] < sizes[b]) {
            int t = a;
            a = b;
            b = t;
        }
        parent[b] = a;
        sizes[a] += sizes[b];
        return true;
    }`
};
