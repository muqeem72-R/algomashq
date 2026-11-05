// Helpers for the graph problems: random graphs, special shapes and the text of a graph as it appears in a test input.
// Nodes are numbered 1..n, an edge is a pair [u, v] (or [u, v, w] with a weight).

import { randInt, shuffle } from './lib.mjs';

// "n m" and then one edge per line.
export const graphText = (n, edges) => `${n} ${edges.length}\n${edges.map((e) => e.join(' ')).join('\n')}\n`;

// A random tree on the nodes 1..n in a random numbering: node i gets a random earlier parent.
export function randomTreeEdges(g, n, shape = 'random') {
  const label = shuffle(g, Array.from({ length: n }, (_, i) => i + 1));
  const edges = [];
  for (let i = 1; i < n; i++) {
    const p = shape === 'path' ? i - 1 : shape === 'star' ? 0 : shape === 'binary' ? (i - 1) >> 1 : shape === 'deep' ? Math.max(0, i - 1 - randInt(g, 0, 2)) : randInt(g, 0, i - 1);
    edges.push([label[p], label[i]]);
  }
  return edges;
}

// Shuffles the edges and turns each edge around with probability 1/2 (the weight, if any, stays at the end).
export const mix = (g, edges) => shuffle(g, edges.slice()).map((e) => (g() < 0.5 ? e : [e[1], e[0], ...e.slice(2)]));

// Random simple graph with n nodes and m different edges (m is capped by the number of possible edges).
export function randomEdges(g, n, m, weight = null) {
  const cap = n * (n - 1) / 2; m = Math.min(m, cap);
  const seen = new Set(); const edges = [];
  while (edges.length < m) {
    let u = randInt(g, 1, n), v = randInt(g, 1, n);
    if (u === v) continue;
    if (u > v) [u, v] = [v, u];
    const key = u * (n + 1) + v;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push(weight ? [u, v, randInt(g, weight[0], weight[1])] : [u, v]);
  }
  return edges;
}

// A connected random graph: a random tree plus extra random edges.
export function connectedEdges(g, n, extra, weight = null, shape = 'random') {
  const edges = randomTreeEdges(g, n, shape).map((e) => (weight ? [...e, randInt(g, weight[0], weight[1])] : e));
  const seen = new Set(edges.map((e) => Math.min(e[0], e[1]) * (n + 1) + Math.max(e[0], e[1])));
  const cap = n * (n - 1) / 2 - edges.length; extra = Math.min(extra, cap);
  let added = 0;
  while (added < extra) {
    let u = randInt(g, 1, n), v = randInt(g, 1, n);
    if (u === v) continue;
    if (u > v) [u, v] = [v, u];
    const key = u * (n + 1) + v;
    if (seen.has(key)) continue;
    seen.add(key); added++;
    edges.push(weight ? [u, v, randInt(g, weight[0], weight[1])] : [u, v]);
  }
  return shuffle(g, edges).map((e) => (g() < 0.5 ? e : [e[1], e[0], ...e.slice(2)]));
}

// A random directed acyclic graph: edges go from a smaller rank to a larger rank, nodes are numbered in random order.
export function randomDag(g, n, m, weight = null) {
  const rank = shuffle(g, Array.from({ length: n }, (_, i) => i + 1)); // rank[i] = node with rank i
  const cap = n * (n - 1) / 2; m = Math.min(m, cap);
  const seen = new Set(); const edges = [];
  while (edges.length < m) {
    let a = randInt(g, 0, n - 1), b = randInt(g, 0, n - 1);
    if (a === b) continue;
    if (a > b) [a, b] = [b, a];
    const key = a * n + b;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push(weight ? [rank[a], rank[b], randInt(g, weight[0], weight[1])] : [rank[a], rank[b]]);
  }
  return edges;
}

// A random directed graph (cycles allowed), no self loops, no repeated edge.
export function randomDirected(g, n, m, weight = null) {
  const cap = n * (n - 1); m = Math.min(m, cap);
  const seen = new Set(); const edges = [];
  while (edges.length < m) {
    const u = randInt(g, 1, n), v = randInt(g, 1, n);
    if (u === v) continue;
    const key = u * (n + 1) + v;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push(weight ? [u, v, randInt(g, weight[0], weight[1])] : [u, v]);
  }
  return edges;
}

// Adjacency lists (1-based) of an undirected edge list.
export function adjacency(n, edges, directed = false) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of edges) { adj[u].push(w === undefined ? v : [v, w]); if (!directed) adj[v].push(w === undefined ? u : [u, w]); }
  return adj;
}

// Component number of every node (1..k), found with a plain breadth-first search.
export function components(n, edges) {
  const adj = adjacency(n, edges); const comp = new Array(n + 1).fill(0); let k = 0;
  for (let s = 1; s <= n; s++) {
    if (comp[s]) continue;
    comp[s] = ++k; const q = [s];
    for (let h = 0; h < q.length; h++) for (const w of adj[q[h]]) if (!comp[w]) { comp[w] = k; q.push(w); }
  }
  return { comp, count: k };
}

// Breadth-first distances from s (-1 for unreachable nodes).
export function bfsDistances(adj, n, s) {
  const dist = new Array(n + 1).fill(-1); dist[s] = 0; const q = [s];
  for (let h = 0; h < q.length; h++) for (const w of adj[q[h]]) if (dist[w] < 0) { dist[w] = dist[q[h]] + 1; q.push(w); }
  return dist;
}

// Dijkstra with a plain O(n^2) scan (for brute-force checks of small graphs). adj entries are [v, w].
export function dijkstraSlow(adj, n, s, inf = Infinity) {
  const dist = new Array(n + 1).fill(inf); dist[s] = 0; const done = new Array(n + 1).fill(false);
  for (let round = 0; round < n; round++) {
    let u = -1; for (let v = 1; v <= n; v++) if (!done[v] && dist[v] < inf && (u < 0 || dist[v] < dist[u])) u = v;
    if (u < 0) break; done[u] = true;
    for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
  }
  return dist;
}

// A binary heap for the reference solutions; less(a, b) is true when a must come out before b.
export class Heap {
  constructor(less) { this.a = []; this.less = less; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) { const a = this.a; a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (!this.less(a[i], a[p])) break; [a[i], a[p]] = [a[p], a[i]]; i = p; } }
  pop() { const a = this.a; const top = a[0]; const last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { let s = i; for (const c of [2 * i + 1, 2 * i + 2]) if (c < a.length && this.less(a[c], a[s])) s = c; if (s === i) break; [a[i], a[s]] = [a[s], a[i]]; i = s; } } return top; }
}

// Disjoint sets for the reference solutions.
export class Dsu {
  constructor(n) { this.p = Array.from({ length: n + 1 }, (_, i) => i); this.size = new Array(n + 1).fill(1); }
  find(x) { while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x]; } return x; }
  union(a, b) { a = this.find(a); b = this.find(b); if (a === b) return false; if (this.size[a] < this.size[b]) [a, b] = [b, a]; this.p[b] = a; this.size[a] += this.size[b]; return true; }
}

// A random grid of characters; rows are strings.
export function randomGrid(g, h, w, chars, weights = null) {
  const pick = () => { if (!weights) return chars[randInt(g, 0, chars.length - 1)]; let x = g() * weights.reduce((a, b) => a + b, 0); for (let i = 0; i < chars.length; i++) { x -= weights[i]; if (x < 0) return chars[i]; } return chars[chars.length - 1]; };
  return Array.from({ length: h }, () => Array.from({ length: w }, pick).join(''));
}
export const gridText = (grid) => `${grid.length} ${grid[0].length}\n${grid.join('\n')}\n`;
