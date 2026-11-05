// More pieces of solution code for the graph problems: strongly connected components and maximum bipartite matching.
import { r } from './lib.mjs';

// Strongly connected components of a directed graph by Kosaraju's algorithm, without recursion. The graph is `adj` (nodes 1..N).
// The result is comp[v] (0, 1, 2, ...) with the components numbered in topological order of the condensation (sources first), and the number of components.
// Python names: comp, comp_count. C++ and Java names: comp, compCount. N is an expression for the number of nodes.
export const SCC = (lang, N) => {
  if (lang === 'python') return `
radj = [[] for _ in range(${N} + 1)]
for u in range(1, ${N} + 1):
    for v in adj[u]:
        radj[v].append(u)
order = []
seen = [False] * (${N} + 1)
pos = [0] * (${N} + 1)
for s in range(1, ${N} + 1):
    if seen[s]:
        continue
    seen[s] = True
    stack = [s]
    while stack:
        v = stack[-1]
        if pos[v] < len(adj[v]):
            w = adj[v][pos[v]]
            pos[v] += 1
            if not seen[w]:
                seen[w] = True
                stack.append(w)
        else:
            order.append(v)
            stack.pop()
comp = [-1] * (${N} + 1)
comp_count = 0
for s in reversed(order):
    if comp[s] != -1:
        continue
    comp[s] = comp_count
    stack = [s]
    while stack:
        v = stack.pop()
        for w in radj[v]:
            if comp[w] == -1:
                comp[w] = comp_count
                stack.append(w)
    comp_count += 1`;
  if (lang === 'cpp') return `
const int NN = (int)(${N});
vector<vector<int>> radj(NN + 1);
for (int u = 1; u <= NN; u++) {
    for (int v : adj[u]) radj[v].push_back(u);
}
vector<int> order, pos(NN + 1, 0);
vector<char> seen(NN + 1, 0);
for (int s = 1; s <= NN; s++) {
    if (seen[s]) continue;
    seen[s] = 1;
    vector<int> stack = {s};
    while (!stack.empty()) {
        int v = stack.back();
        if (pos[v] < (int)adj[v].size()) {
            int w = adj[v][pos[v]++];
            if (!seen[w]) {
                seen[w] = 1;
                stack.push_back(w);
            }
        } else {
            order.push_back(v);
            stack.pop_back();
        }
    }
}
vector<int> comp(NN + 1, -1);
int compCount = 0;
for (size_t i = order.size(); i-- > 0;) {
    int s = order[i];
    if (comp[s] != -1) continue;
    comp[s] = compCount;
    vector<int> stack = {s};
    while (!stack.empty()) {
        int v = stack.back();
        stack.pop_back();
        for (int w : radj[v]) {
            if (comp[w] == -1) {
                comp[w] = compCount;
                stack.push_back(w);
            }
        }
    }
    compCount++;
}`;
  return `
final int NN = (int) (${N});
int[] fHead = new int[NN + 2];
int[] rHead = new int[NN + 2];
for (int i = 0; i < eu.length; i++) {
    fHead[eu[i] + 1]++;
    rHead[ev[i] + 1]++;
}
for (int v = 1; v <= NN; v++) {
    fHead[v + 1] += fHead[v];
    rHead[v + 1] += rHead[v];
}
int[] fTo = new int[eu.length];
int[] rTo = new int[eu.length];
int[] fFill = new int[NN + 2];
int[] rFill = new int[NN + 2];
for (int i = 0; i < eu.length; i++) {
    int a = eu[i], b = ev[i];
    fTo[fHead[a] + fFill[a]] = b;
    fFill[a]++;
    rTo[rHead[b] + rFill[b]] = a;
    rFill[b]++;
}
int[] order = new int[NN];
int orderSize = 0;
int[] pos = new int[NN + 2];
boolean[] seen = new boolean[NN + 2];
int[] stack = new int[NN + 2];
for (int s = 1; s <= NN; s++) {
    if (seen[s]) continue;
    seen[s] = true;
    int top = 0;
    stack[top++] = s;
    while (top > 0) {
        int v = stack[top - 1];
        if (fHead[v] + pos[v] < fHead[v + 1]) {
            int w = fTo[fHead[v] + pos[v]];
            pos[v]++;
            if (!seen[w]) {
                seen[w] = true;
                stack[top++] = w;
            }
        } else {
            order[orderSize++] = v;
            top--;
        }
    }
}
int[] comp = new int[NN + 2];
Arrays.fill(comp, -1);
int compCount = 0;
for (int i = orderSize - 1; i >= 0; i--) {
    int s = order[i];
    if (comp[s] != -1) continue;
    comp[s] = compCount;
    int top = 0;
    stack[top++] = s;
    while (top > 0) {
        int v = stack[--top];
        for (int k = rHead[v]; k < rHead[v + 1]; k++) {
            int w = rTo[k];
            if (comp[w] == -1) {
                comp[w] = compCount;
                stack[top++] = w;
            }
        }
    }
    compCount++;
}`;
};

// Java: the edge list as two int arrays (the nodes are numbered from 1), built from `long[][] edges`. SCC('java', ...) needs these arrays.
export const EDGE_ARRAYS_JAVA = `
int nodes = (int) n;
int[] eu = new int[edges.length];
int[] ev = new int[edges.length];
for (int i = 0; i < edges.length; i++) {
    eu[i] = (int) edges[i][0];
    ev[i] = (int) edges[i][1];
}`;

// Maximum bipartite matching with augmenting paths found by a breadth-first search (Kuhn's idea, no recursion).
// adjl[u] lists the right nodes of the left node u (nodes are numbered from 1). Returns the size of a maximum matching.
export const MATCHING = {
  python: r`
    def max_matching(adjl, left, right):
        match_r = [0] * (right + 1)
        match_l = [0] * (left + 1)
        size = 0
        for u in range(1, left + 1):
            parent = {}
            queue = [u]
            found = 0
            for x in queue:
                for r in adjl[x]:
                    if r in parent:
                        continue
                    parent[r] = x
                    if match_r[r] == 0:
                        found = r
                        break
                    queue.append(match_r[r])
                if found:
                    break
            if found:
                r = found
                while True:
                    x = parent[r]
                    prev = match_l[x]
                    match_l[x] = r
                    match_r[r] = x
                    if x == u:
                        break
                    r = prev
                size += 1
        return size`,
  cpp: r`
    int maxMatching(const vector<vector<int>>& adjl, int left, int right) {
        vector<int> matchR(right + 1, 0), matchL(left + 1, 0);
        int size = 0;
        for (int u = 1; u <= left; u++) {
            vector<int> parent(right + 1, 0);
            vector<int> queue = {u};
            int found = 0;
            for (size_t i = 0; i < queue.size() && !found; i++) {
                int x = queue[i];
                for (int r : adjl[x]) {
                    if (parent[r]) continue;
                    parent[r] = x;
                    if (matchR[r] == 0) {
                        found = r;
                        break;
                    }
                    queue.push_back(matchR[r]);
                }
            }
            if (found) {
                int r = found;
                for (;;) {
                    int x = parent[r];
                    int prev = matchL[x];
                    matchL[x] = r;
                    matchR[r] = x;
                    if (x == u) break;
                    r = prev;
                }
                size++;
            }
        }
        return size;
    }`,
  java: r`
    static int maxMatching(long[][] edges, int left, int right) {
        int[] head = new int[left + 2];
        for (int i = 0; i < edges.length; i++) head[(int) edges[i][0] + 1]++;
        for (int u = 1; u <= left; u++) head[u + 1] += head[u];
        int[] to = new int[edges.length];
        int[] fill = new int[left + 2];
        for (int i = 0; i < edges.length; i++) {
            int a = (int) edges[i][0];
            to[head[a] + fill[a]] = (int) edges[i][1];
            fill[a]++;
        }
        int[] matchR = new int[right + 1];
        int[] matchL = new int[left + 1];
        int[] parent = new int[right + 1];
        int[] queue = new int[left + 2];
        int size = 0;
        for (int u = 1; u <= left; u++) {
            Arrays.fill(parent, 0);
            int qh = 0, qt = 0;
            queue[qt++] = u;
            int found = 0;
            while (qh < qt && found == 0) {
                int x = queue[qh++];
                for (int k = head[x]; k < head[x + 1]; k++) {
                    int r = to[k];
                    if (parent[r] != 0) continue;
                    parent[r] = x;
                    if (matchR[r] == 0) {
                        found = r;
                        break;
                    }
                    queue[qt++] = matchR[r];
                }
            }
            if (found != 0) {
                int r = found;
                for (;;) {
                    int x = parent[r];
                    int prev = matchL[x];
                    matchL[x] = r;
                    matchR[r] = x;
                    if (x == u) break;
                    r = prev;
                }
                size++;
            }
        }
        return size;
    }`
};

// Java: an undirected graph from `long[][] edges` (nodes 1..n) in primitive arrays (compressed rows).
// The neighbours of v are to[head[v]] .. to[head[v + 1] - 1]; eid[k] is the index of the edge behind slot k. Defines nodes, head, to, eid.
export const CSR_JAVA = `
int nodes = (int) n;
int[] head = new int[nodes + 2];
for (int i = 0; i < edges.length; i++) {
    head[(int) edges[i][0] + 1]++;
    head[(int) edges[i][1] + 1]++;
}
for (int v = 1; v <= nodes; v++) head[v + 1] += head[v];
int[] to = new int[2 * edges.length];
int[] eid = new int[2 * edges.length];
int[] fill = new int[nodes + 2];
for (int i = 0; i < edges.length; i++) {
    int a = (int) edges[i][0], b = (int) edges[i][1];
    to[head[a] + fill[a]] = b;
    eid[head[a] + fill[a]] = i;
    fill[a]++;
    to[head[b] + fill[b]] = a;
    eid[head[b] + fill[b]] = i;
    fill[b]++;
}`;
