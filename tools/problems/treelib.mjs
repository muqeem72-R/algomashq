// Helpers for the tree problems: trees as plain objects { val, left, right } for the reference solutions and the test generators.
// A tree is written in level order, with N for a missing child and no N at the end (the form that the starter code reads).

import { randInt, shuffle } from './lib.mjs';

export const node = (val, left = null, right = null) => ({ val, left, right });

// The tree of a level-order list of words.
export function fromTokens(tokens) {
  if (!tokens.length || tokens[0] === 'N') return null;
  const root = node(Number(tokens[0]));
  const queue = [root];
  let head = 0, i = 1;
  while (head < queue.length && i < tokens.length) {
    const cur = queue[head++];
    if (tokens[i] !== 'N') { cur.left = node(Number(tokens[i])); queue.push(cur.left); }
    i++;
    if (i < tokens.length && tokens[i] !== 'N') { cur.right = node(Number(tokens[i])); queue.push(cur.right); }
    i++;
  }
  return root;
}

// The level-order words of a tree ("N" alone for no tree).
export function toTokens(root) {
  if (!root) return ['N'];
  const out = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    if (!cur) out.push('N');
    else { out.push(String(cur.val)); queue.push(cur.left, cur.right); }
  }
  while (out.length > 1 && out[out.length - 1] === 'N') out.pop();
  return out;
}

// The two lines of a test input that describe a tree.
export const treeText = (root) => { const t = toTokens(root); return `${t.length}\n${t.join(' ')}\n`; };
export const treeOfInput = (input) => fromTokens(input.replace(/\n$/, '').split('\n')[1].trim().split(/\s+/));

// The two trees of an input with two trees (four lines).
export const twoTreesOfInput = (input) => { const rs = input.replace(/\n$/, '').split('\n'); return [fromTokens(rs[1].trim().split(/\s+/)), fromTokens(rs[3].trim().split(/\s+/))]; };
export const twoTreesText = (a, b) => treeText(a) + treeText(b);

export function clone(root) {
  if (!root) return null;
  const copy = node(root.val);
  const stack = [[root, copy]];
  while (stack.length) { const [from, to] = stack.pop(); if (from.left) { to.left = node(from.left.val); stack.push([from.left, to.left]); } if (from.right) { to.right = node(from.right.val); stack.push([from.right, to.right]); } }
  return copy;
}

// The mirror image (left and right swapped everywhere), as a new tree.
export function mirror(root) {
  if (!root) return null;
  const copy = node(root.val);
  const stack = [[root, copy]];
  while (stack.length) { const [from, to] = stack.pop(); if (from.left) { to.right = node(from.left.val); stack.push([from.left, to.right]); } if (from.right) { to.left = node(from.right.val); stack.push([from.right, to.left]); } }
  return copy;
}

// All the nodes of a tree, in level order.
export function allNodes(root) {
  const out = root ? [root] : [];
  for (let head = 0; head < out.length; head++) { const c = out[head]; if (c.left) out.push(c.left); if (c.right) out.push(c.right); }
  return out;
}

// The values of the leaves from left to right.
export function leafValues(root) {
  const out = [], stack = root ? [root] : [];
  while (stack.length) { const c = stack.pop(); if (!c.left && !c.right) out.push(c.val); if (c.right) stack.push(c.right); if (c.left) stack.push(c.left); }
  return out;
}

// A tree in which every inner node has two children, whose leaves read the given values from left to right.
export function treeWithLeaves(g, leaves, lo = -50, hi = 50) {
  if (leaves.length === 1) return node(leaves[0]);
  const k = 1 + Math.floor(g() * (leaves.length - 1));
  return node(randInt(g, lo, hi), treeWithLeaves(g, leaves.slice(0, k), lo, hi), treeWithLeaves(g, leaves.slice(k), lo, hi));
}

export function height(root) {
  if (!root) return 0;
  let h = 0, level = [root];
  while (level.length) { h++; const next = []; for (const c of level) { if (c.left) next.push(c.left); if (c.right) next.push(c.right); } level = next; }
  return h;
}

export function size(root) {
  let count = 0; const stack = root ? [root] : [];
  while (stack.length) { const c = stack.pop(); count++; if (c.left) stack.push(c.left); if (c.right) stack.push(c.right); }
  return count;
}

export const inorder = (root) => { const out = [], stack = []; let cur = root; while (cur || stack.length) { while (cur) { stack.push(cur); cur = cur.left; } cur = stack.pop(); out.push(cur.val); cur = cur.right; } return out; };
export const preorder = (root) => { const out = [], stack = root ? [root] : []; while (stack.length) { const c = stack.pop(); out.push(c.val); if (c.right) stack.push(c.right); if (c.left) stack.push(c.left); } return out; };
export const postorder = (root) => { const out = [], stack = root ? [root] : []; while (stack.length) { const c = stack.pop(); out.push(c.val); if (c.left) stack.push(c.left); if (c.right) stack.push(c.right); } return out.reverse(); };
export const levels = (root) => { const out = []; let level = root ? [root] : []; while (level.length) { out.push(level.map((c) => c.val)); const next = []; for (const c of level) { if (c.left) next.push(c.left); if (c.right) next.push(c.right); } level = next; } return out; };

// A random tree with n nodes: every new node takes a random free child slot, so the shapes are bushy and uneven.
export function randomTree(g, n, lo = -50, hi = 50) {
  const root = node(randInt(g, lo, hi));
  const slots = [[root, 'left'], [root, 'right']];
  for (let i = 1; i < n; i++) {
    const k = Math.floor(g() * slots.length);
    const [parent, side] = slots[k];
    slots[k] = slots[slots.length - 1]; slots.pop();
    const child = node(randInt(g, lo, hi));
    parent[side] = child;
    slots.push([child, 'left'], [child, 'right']);
  }
  return root;
}

// The same tree shape with different random values (level order gets the values in a random order).
export function relabelDistinct(g, root, lo = -1000000000, hi = 1000000000) {
  const copy = clone(root); const nodes = allNodes(copy); const values = distinctValues(g, nodes.length, lo, hi);
  nodes.forEach((c, i) => { c.val = values[i]; });
  return copy;
}

// A random tree with n nodes and at most maxHeight levels (a node at the last level gets no children).
export function boundedTree(g, n, maxHeight, lo = -50, hi = 50) {
  const root = node(randInt(g, lo, hi));
  const slots = maxHeight > 1 ? [[root, 'left', 2], [root, 'right', 2]] : [];
  for (let i = 1; i < n && slots.length; i++) {
    const k = Math.floor(g() * slots.length);
    const [parent, side, level] = slots[k];
    slots[k] = slots[slots.length - 1]; slots.pop();
    const child = node(randInt(g, lo, hi));
    parent[side] = child;
    if (level < maxHeight) slots.push([child, 'left', level + 1], [child, 'right', level + 1]);
  }
  return root;
}

// A complete tree: node i has the children 2i + 1 and 2i + 2.
export function completeTree(g, n, lo = -50, hi = 50) {
  const nodes = Array.from({ length: n }, () => node(randInt(g, lo, hi)));
  for (let i = 0; i < n; i++) { if (2 * i + 1 < n) nodes[i].left = nodes[2 * i + 1]; if (2 * i + 2 < n) nodes[i].right = nodes[2 * i + 2]; }
  return nodes[0];
}

// A path of n nodes. direction: 'left', 'right' or 'zigzag'.
export function chainTree(g, n, direction = 'left', lo = -50, hi = 50) {
  const root = node(randInt(g, lo, hi)); let cur = root;
  for (let i = 1; i < n; i++) { const side = direction === 'zigzag' ? (i % 2 ? 'left' : 'right') : direction; cur[side] = node(randInt(g, lo, hi)); cur = cur[side]; }
  return root;
}

// A binary search tree made by inserting the values one after the other (the values should be different).
export function bstFromInsertions(values) {
  let root = null;
  for (const v of values) {
    const fresh = node(v);
    if (!root) { root = fresh; continue; }
    let cur = root;
    for (;;) { if (v < cur.val) { if (cur.left) cur = cur.left; else { cur.left = fresh; break; } } else if (cur.right) cur = cur.right; else { cur.right = fresh; break; } }
  }
  return root;
}

// A balanced search tree from sorted values: the root is the lower middle value.
export function balancedBst(sorted, from = 0, to = sorted.length - 1) {
  if (from > to) return null;
  const mid = Math.floor((from + to) / 2);
  return node(sorted[mid], balancedBst(sorted, from, mid - 1), balancedBst(sorted, mid + 1, to));
}

// A standard set of trees for the tests: one node, small and big random trees, complete trees and long paths (height at most 800).
export function standardTrees(g, lo = -50, hi = 50) {
  return [node(randInt(g, lo, hi)), randomTree(g, 2, lo, hi), randomTree(g, 7, lo, hi), randomTree(g, 31, lo, hi), randomTree(g, 500, lo, hi), randomTree(g, 5000, lo, hi), randomTree(g, 20000, lo, hi),
    completeTree(g, 15, lo, hi), completeTree(g, 4095, lo, hi), completeTree(g, 20000, lo, hi), chainTree(g, 800, 'left', lo, hi), chainTree(g, 800, 'right', lo, hi), chainTree(g, 799, 'zigzag', lo, hi)];
}

// n different random integers in [lo, hi], in random order.
export function distinctValues(g, n, lo, hi) {
  const set = new Set();
  while (set.size < n) set.add(randInt(g, lo, hi));
  return shuffle(g, [...set]);
}

// A random binary search tree of n nodes (different values) from random insertions.
export const randomBst = (g, n, lo = -1000, hi = 1000) => bstFromInsertions(distinctValues(g, n, lo, hi));
