import { r, rng, randInt } from '../../lib.mjs';
import { treeProgram } from '../../scaffolds.mjs';
import { node, treeText, treeOfInput, standardTrees, randomTree, completeTree, chainTree, randomBst, relabelDistinct, boundedTree, allNodes, levels, inorder, clone, height, distinctValues, balancedBst } from '../../treelib.mjs';

const TREE_INPUT = ['The first line has `t`, the number of words in the description of the tree.', 'The second line has the tree in level order: the root first, then the children of the nodes row by row from left to right. `N` stands for a missing child. There is no `N` at the end.'];
const LIMITS = ['1 <= number of nodes <= 20000', '-10^9 <= every value <= 10^9', 'The height of the tree is at most 800.'];
const BIG = [-1000000000, 1000000000];
const medium = { difficulty: 'medium', inputFormat: TREE_INPUT, constraints: LIMITS };
const withLine = (root, line) => `${treeText(root)}${line}\n`;
const sumsOfPaths = (root) => { const sums = []; const go = (c, s) => { if (!c) return; const t = s + c.val; if (!c.left && !c.right) sums.push(t); go(c.left, t); go(c.right, t); }; go(root, 0); return sums; };
const splitInput = (input) => { const rs = input.replace(/\n$/, '').split('\n'); return { root: treeOfInput(rs.slice(0, 2).join('\n') + '\n'), rest: rs.slice(2) }; };
// trees with different values, for the problems that need to name nodes by their values
const distinctTrees = (g) => standardTrees(g, ...BIG).map((t) => relabelDistinct(g, t));
const pick = (g, root) => { const nodes = allNodes(root); return nodes[randInt(g, 0, nodes.length - 1)].val; };

export default [
  {
    ...medium,
    slug: 'lowest-common-ancestor',
    title: 'The Lowest Common Ancestor',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'Ask both subtrees whether they contain one of the two nodes',
      body: [
        'The **lowest common ancestor** (LCA) of two nodes `p` and `q` is the deepest node that has both of them in its subtree (a node counts as part of its own subtree). Think of it as the place where the roads from the root to `p` and to `q` separate.',
        'A neat recursion: ask each subtree to return "the node I found". The function returns the root itself if it is `p` or `q`; otherwise it asks the left and the right subtree. If **both** answers are non-empty, `p` and `q` are in different subtrees, so this node is the LCA. If only one answer is non-empty, return that one: it is either the LCA found below, or the single node that was found.',
        { code: 'def lca(root, p, q):\n    if root is None or root.val == p or root.val == q:\n        return root\n    left = lca(root.left, p, q)\n    right = lca(root.right, p, q)\n    if left is not None and right is not None:\n        return root                          # p and q are on different sides\n    return left if left is not None else right' },
        'One pass over the tree is enough. It works also when `p` is an ancestor of `q`: the search returns `p` itself from above and never looks below it.'
      ]
    },
    statement: ['All values of a binary tree are different. Given two values `p` and `q` that are in the tree (they can be equal), print the value of their lowest common ancestor: the deepest node that has both of them in its subtree (a node is in its own subtree).'],
    inputFormat: [...TREE_INPUT, 'The third line has `p` and `q`.'],
    outputFormat: ['Print the value of the lowest common ancestor.'],
    constraints: [...LIMITS, 'All values are different.', 'Both `p` and `q` are values of nodes of the tree.'],
    examples: [{ input: '11\n3 5 1 6 2 0 8 N N 7 4\n5 1\n', note: '5 is in the left subtree of the root 3 and 1 in the right one: the common ancestor is the root 3.' }, { input: '11\n3 5 1 6 2 0 8 N N 7 4\n5 4\n', note: '4 is in the subtree of 5: the answer is 5.' }],
    hints: ['A node that is p or q is its own answer for the subtree below it.', 'Ask the left and the right subtree.', 'If both subtrees return a node, the current node is the lowest common ancestor.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'p:int q:int'],
      solution: {
        python: r`
          def lca(root, p, q):
              if root is None or root.val == p or root.val == q:
                  return root
              left = lca(root.left, p, q)
              right = lca(root.right, p, q)
              if left is not None and right is not None:
                  return root
              return left if left is not None else right`,
        cpp: r`
          TreeNode* lca(TreeNode* root, long long p, long long q) {
              if (root == nullptr || root->val == p || root->val == q) return root;
              TreeNode* left = lca(root->left, p, q);
              TreeNode* right = lca(root->right, p, q);
              if (left != nullptr && right != nullptr) return root;
              return left != nullptr ? left : right;
          }`,
        java: r`
          static TreeNode lca(TreeNode root, long p, long q) {
              if (root == null || root.val == p || root.val == q) return root;
              TreeNode left = lca(root.left, p, q);
              TreeNode right = lca(root.right, p, q);
              if (left != null && right != null) return root;
              return left != null ? left : right;
          }`
      },
      stub: {
        python: r`
          def lca(root, p, q):
              # Your code here: return the node that is the lowest common ancestor
              return root`,
        cpp: r`
          TreeNode* lca(TreeNode* root, long long p, long long q) {
              // Your code here: return the node that is the lowest common ancestor
              return root;
          }`,
        java: r`
          static TreeNode lca(TreeNode root, long p, long q) {
              // Your code here: return the node that is the lowest common ancestor
              return root;
          }`
      },
      call: { python: 'print(lca(build_tree(vals), p, q).val)', cpp: 'cout << lca(buildTree(vals), p, q)->val << "\\n";', java: 'System.out.println(lca(buildTree(vals), p, q).val);' }
    }),
    solution: { explanation: ['Each call returns the node of p or q found in its subtree (or the LCA if both were found below); a node whose two subtrees both return something is the lowest common ancestor.'], complexity: 'Time O(n), space O(h).' },
    solve(input) {
      const { root, rest } = splitInput(input); const [p, q] = rest[0].trim().split(/\s+/).map(Number);
      const parent = new Map([[root, null]]); const byVal = new Map([[root.val, root]]); for (const c of allNodes(root)) for (const k of [c.left, c.right]) if (k) { parent.set(k, c); byVal.set(k.val, k); }
      const ancestors = new Set(); for (let c = byVal.get(p); c; c = parent.get(c)) ancestors.add(c);
      let c = byVal.get(q); while (!ancestors.has(c)) c = parent.get(c); return String(c.val);
    },
    tests() {
      const g = rng(731); const out = ['11\n3 5 1 6 2 0 8 N N 7 4\n5 1\n', '11\n3 5 1 6 2 0 8 N N 7 4\n5 4\n', '1\n7\n7 7\n'];
      for (const t of distinctTrees(g).slice(1)) { const nodes = allNodes(t); for (let i = 0; i < (nodes.length > 10000 ? 2 : 4); i++) { const a = pick(g, t), b = i === 0 ? a : i === 1 ? t.val : pick(g, t); out.push(withLine(t, `${a} ${b}`)); } }
      return out;
    }
  },

  {
    ...medium,
    slug: 'lca-in-bst',
    title: 'The Lowest Common Ancestor in a Search Tree',
    tags: ['tree', 'bst'],
    concept: {
      title: 'The order of the values tells you where the two nodes separate',
      body: [
        'In a binary search tree the common ancestor can be found **without searching both subtrees**. Start at the root. If both `p` and `q` are **smaller** than the node, they are both in the left subtree: go left. If both are **larger**, go right. In every other case (one is smaller and the other larger, or one equals the node) the roads to `p` and `q` split exactly here, so this node is the lowest common ancestor.',
        { code: 'def lca_bst(root, p, q):\n    cur = root\n    while cur is not None:\n        if p < cur.val and q < cur.val:\n            cur = cur.left\n        elif p > cur.val and q > cur.val:\n            cur = cur.right\n        else:\n            return cur                    # the roads split here (or one of them ends here)\n    return None' },
        'This takes one step per level, O(h), and needs no recursion. Compare it with the general tree version: there the values give no hint where the nodes are, so the whole tree may have to be searched.'
      ]
    },
    statement: ['Given a binary search tree and two values `p` and `q` that are in the tree (they can be equal), print the value of their lowest common ancestor: the deepest node that has both of them in its subtree (a node is in its own subtree).'],
    inputFormat: [...TREE_INPUT, 'The third line has `p` and `q`.'],
    outputFormat: ['Print the value of the lowest common ancestor.'],
    constraints: [...LIMITS, 'The tree is a binary search tree (all values are different).', 'Both `p` and `q` are values of nodes of the tree.'],
    examples: [{ input: '7\n6 2 8 0 4 7 9\n2 8\n', note: '2 is in the left subtree of 6 and 8 in the right one: the answer is 6.' }, { input: '7\n6 2 8 0 4 7 9\n2 4\n', note: '4 is in the subtree of 2: the answer is 2.' }],
    hints: ['If p and q are both smaller than the node value, go left; if both are larger, go right.', 'Otherwise the current node is the answer.', 'A loop is enough; no recursion is needed.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'p:int q:int'],
      solution: {
        python: r`
          def lca_bst(root, p, q):
              cur = root
              while cur is not None:
                  if p < cur.val and q < cur.val:
                      cur = cur.left
                  elif p > cur.val and q > cur.val:
                      cur = cur.right
                  else:
                      return cur
              return None`,
        cpp: r`
          TreeNode* lcaBst(TreeNode* root, long long p, long long q) {
              TreeNode* cur = root;
              while (cur != nullptr) {
                  if (p < cur->val && q < cur->val) cur = cur->left;
                  else if (p > cur->val && q > cur->val) cur = cur->right;
                  else return cur;
              }
              return nullptr;
          }`,
        java: r`
          static TreeNode lcaBst(TreeNode root, long p, long q) {
              TreeNode cur = root;
              while (cur != null) {
                  if (p < cur.val && q < cur.val) cur = cur.left;
                  else if (p > cur.val && q > cur.val) cur = cur.right;
                  else return cur;
              }
              return null;
          }`
      },
      stub: {
        python: r`
          def lca_bst(root, p, q):
              # Your code here: return the node that is the lowest common ancestor
              return root`,
        cpp: r`
          TreeNode* lcaBst(TreeNode* root, long long p, long long q) {
              // Your code here: return the node that is the lowest common ancestor
              return root;
          }`,
        java: r`
          static TreeNode lcaBst(TreeNode root, long p, long q) {
              // Your code here: return the node that is the lowest common ancestor
              return root;
          }`
      },
      call: { python: 'print(lca_bst(build_tree(vals), p, q).val)', cpp: 'cout << lcaBst(buildTree(vals), p, q)->val << "\\n";', java: 'System.out.println(lcaBst(buildTree(vals), p, q).val);' }
    }),
    solution: { explanation: ['The walk goes left when both values are smaller and right when both are larger; the first node where they are not on the same side (or equal to it) is the lowest common ancestor.'], complexity: 'Time O(h), space O(1).' },
    solve(input) {
      const { root, rest } = splitInput(input); const [p, q] = rest[0].trim().split(/\s+/).map(Number); const lo = Math.min(p, q), hi = Math.max(p, q);
      let c = root; while (c) { if (hi < c.val) c = c.left; else if (lo > c.val) c = c.right; else return String(c.val); } return '?';
    },
    tests() {
      const g = rng(732); const out = ['7\n6 2 8 0 4 7 9\n2 8\n', '7\n6 2 8 0 4 7 9\n2 4\n', '1\n7\n7 7\n'];
      const trees = [randomBst(g, 2, ...BIG), randomBst(g, 7, ...BIG), randomBst(g, 31, ...BIG), randomBst(g, 500, ...BIG), randomBst(g, 5000, ...BIG), randomBst(g, 20000, ...BIG), balancedBst(distinctValues(g, 4095, ...BIG).sort((a, b) => a - b))];
      const chain = node(0); let cur = chain; for (let i = 1; i < 700; i++) { cur.right = node(i); cur = cur.right; }
      for (const t of [...trees, chain]) { for (let i = 0; i < 4; i++) { const a = pick(g, t), b = i === 0 ? a : i === 1 ? t.val : pick(g, t); out.push(withLine(t, `${a} ${b}`)); } }
      return out;
    }
  },

  {
    ...medium,
    slug: 'tree-diameter',
    title: 'The Longest Road in a Tree',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'The longest road bends at some node: left height plus right height',
      body: [
        'The **diameter** of a tree is the number of edges on the longest road between any two nodes. The road does not have to pass through the root. Every road has a **highest node** where it turns (it goes down to the left and down to the right from there). The longest road that turns at a node `v` has the length `height(left of v) + height(right of v)` (heights counted as the number of nodes on the longest downward road, so that the sum is the number of edges). The diameter is the best value over all nodes.',
        { code: 'best = 0\n\ndef height(node):                          # number of nodes on the longest downward road\n    global best\n    if node is None:\n        return 0\n    left = height(node.left)\n    right = height(node.right)\n    best = max(best, left + right)         # the road that bends at this node\n    return 1 + max(left, right)\n\nheight(root)\nprint(best)' },
        'The same function computes two things at once: it **returns** the height to its parent, and it **records** the best road bending here in an outside variable. This "return one thing, update another" pattern appears in many tree problems (maximum path sum, longest streak, and so on).'
      ]
    },
    statement: ['The diameter of a binary tree is the number of edges on the longest path between any two nodes of the tree. The path does not have to pass through the root. Print the diameter.'],
    outputFormat: ['Print the diameter.'],
    examples: [{ input: '5\n1 2 3 4 5\n', note: 'The longest path is 4 - 2 - 1 - 3 (or 5 - 2 - 1 - 3): 3 edges.' }],
    hints: ['Every path turns at its highest node.', 'The longest path turning at a node is the height of its left subtree plus the height of its right subtree.', 'Compute heights bottom-up and keep the best sum in a variable that all calls can change.'],
    program: treeProgram({
      solution: {
        python: r`
          def diameter(root):
              best = [0]

              def height(node):
                  if node is None:
                      return 0
                  left = height(node.left)
                  right = height(node.right)
                  best[0] = max(best[0], left + right)
                  return 1 + max(left, right)

              height(root)
              return best[0]`,
        cpp: r`
          int heightAndDiameter(TreeNode* node, int& best) {
              if (node == nullptr) return 0;
              int left = heightAndDiameter(node->left, best);
              int right = heightAndDiameter(node->right, best);
              best = max(best, left + right);
              return 1 + max(left, right);
          }

          int diameter(TreeNode* root) {
              int best = 0;
              heightAndDiameter(root, best);
              return best;
          }`,
        java: r`
          static int heightAndDiameter(TreeNode node, int[] best) {
              if (node == null) return 0;
              int left = heightAndDiameter(node.left, best);
              int right = heightAndDiameter(node.right, best);
              best[0] = Math.max(best[0], left + right);
              return 1 + Math.max(left, right);
          }

          static int diameter(TreeNode root) {
              int[] best = {0};
              heightAndDiameter(root, best);
              return best[0];
          }`
      },
      stub: {
        python: r`
          def diameter(root):
              # Your code here
              return 0`,
        cpp: r`
          int diameter(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static int diameter(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(diameter(build_tree(vals)))', cpp: 'cout << diameter(buildTree(vals)) << "\\n";', java: 'System.out.println(diameter(buildTree(vals)));' },
      includes: ['<algorithm>']
    }),
    solution: { explanation: ['A post-order pass returns the height of every subtree and records, at each node, the length (left height + right height) of the longest path that bends there; the diameter is the largest recorded value.'], complexity: 'Time O(n), space O(h).' },
    solve(input) {
      const root = treeOfInput(input); const nodes = allNodes(root); let best = 0; for (const c of nodes) best = Math.max(best, height(c.left) + height(c.right)); return String(best);
    },
    tests() { const g = rng(733); return ['5\n1 2 3 4 5\n', '1\n5\n', '3\n1 2 3\n', ...standardTrees(g, ...BIG).slice(1).map(treeText), treeText(node(1, chainTree(g, 300, 'left'), chainTree(g, 400, 'right')))]; }
  },

  {
    ...medium,
    slug: 'path-sum-count',
    title: 'Roads Down With a Given Sum',
    tags: ['tree', 'prefix-sum', 'hashing', 'recursion'],
    concept: {
      title: 'Prefix sums along the road, kept in a table',
      body: [
        'Count the **downward roads** (from a node to one of its descendants, not necessarily from the root and not necessarily to a leaf) whose values add up to `target`. Trying every start node and walking down from it takes O(n * h). The idea of the prefix sums from arrays works on a tree, too.',
        'Walk down from the root and keep the sum `prefix` of the values from the root to the current node. A road that starts just below an ancestor `a` and ends at the current node has the sum `prefix(current) - prefix(a)`. So the number of good roads ending here is the number of ancestors with `prefix(a) = prefix(current) - target`. A table `seen` counts how often each prefix sum occurs on the **current road** (the empty prefix 0 counts once).',
        { code: 'def count_paths(root, target):\n    seen = {0: 1}\n    total = 0\n    def walk(node, prefix):\n        nonlocal total\n        if node is None:\n            return\n        prefix += node.val\n        total += seen.get(prefix - target, 0)         # roads that end here\n        seen[prefix] = seen.get(prefix, 0) + 1         # this prefix is now on the road\n        walk(node.left, prefix)\n        walk(node.right, prefix)\n        seen[prefix] -= 1                              # leaving this node: undo' },
        'The last line is the **backtracking** step: when the walk leaves a node, its prefix sum is no longer on the current road, and the table must be restored. Sums can reach 800 * 10^9, so use 64-bit integers.'
      ]
    },
    statement: ['Count the downward paths of a binary tree whose values add up to `target`. A path starts at any node and goes down through children to any descendant (it can be a single node); it does not have to start at the root or end at a leaf.'],
    inputFormat: [...TREE_INPUT, 'The third line has `target`.'],
    outputFormat: ['Print the number of paths.'],
    constraints: [...LIMITS, '-10^12 <= target <= 10^12'],
    examples: [{ input: '9\n10 5 -3 3 2 N 11 3 -2\n8\n', note: 'The roads 5 - 3 and -3 - 11 have the sum 8.' }],
    hints: ['Keep the sum of the values from the root to the current node.', 'A good road ending here exists for every ancestor whose prefix sum is the current prefix minus the target.', 'Count prefix sums in a table, and take the current prefix out of the table when leaving the node.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'target:int'],
      includes: ['<unordered_map>'],
      solution: {
        python: r`
          def count_paths(root, target):
              seen = {0: 1}
              total = [0]

              def walk(node, prefix):
                  if node is None:
                      return
                  prefix += node.val
                  total[0] += seen.get(prefix - target, 0)
                  seen[prefix] = seen.get(prefix, 0) + 1
                  walk(node.left, prefix)
                  walk(node.right, prefix)
                  seen[prefix] -= 1

              walk(root, 0)
              return total[0]`,
        cpp: r`
          void walkPaths(TreeNode* node, long long prefix, long long target, unordered_map<long long, long long>& seen, long long& total) {
              if (node == nullptr) return;
              prefix += node->val;
              auto found = seen.find(prefix - target);
              if (found != seen.end()) total += found->second;
              seen[prefix]++;
              walkPaths(node->left, prefix, target, seen, total);
              walkPaths(node->right, prefix, target, seen, total);
              seen[prefix]--;
          }

          long long countPaths(TreeNode* root, long long target) {
              unordered_map<long long, long long> seen;
              seen[0] = 1;
              long long total = 0;
              walkPaths(root, 0, target, seen, total);
              return total;
          }`,
        java: r`
          static void walkPaths(TreeNode node, long prefix, long target, Map<Long, Long> seen, long[] total) {
              if (node == null) return;
              prefix += node.val;
              total[0] += seen.getOrDefault(prefix - target, 0L);
              seen.merge(prefix, 1L, Long::sum);
              walkPaths(node.left, prefix, target, seen, total);
              walkPaths(node.right, prefix, target, seen, total);
              seen.merge(prefix, -1L, Long::sum);
          }

          static long countPaths(TreeNode root, long target) {
              Map<Long, Long> seen = new HashMap<>();
              seen.put(0L, 1L);
              long[] total = {0};
              walkPaths(root, 0, target, seen, total);
              return total[0];
          }`
      },
      stub: {
        python: r`
          def count_paths(root, target):
              # Your code here
              return 0`,
        cpp: r`
          long long countPaths(TreeNode* root, long long target) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long countPaths(TreeNode root, long target) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(count_paths(build_tree(vals), target))', cpp: 'cout << countPaths(buildTree(vals), target) << "\\n";', java: 'System.out.println(countPaths(buildTree(vals), target));' }
    }),
    solution: { explanation: ['While walking down, the prefix sum from the root is kept; the number of ancestors with prefix (current - target) is the number of good roads ending at the current node; the prefix is put into the table before the children are visited and removed afterwards.'], complexity: 'Time O(n), space O(h).' },
    solve(input) {
      const { root, rest } = splitInput(input); const target = Number(rest[0]); let count = 0;
      const down = (c, s) => { if (!c) return; const t = s + c.val; if (t === target) count++; down(c.left, t); down(c.right, t); };
      for (const c of allNodes(root)) down(c, 0); return String(count);
    },
    tests() {
      const g = rng(734); const out = ['9\n10 5 -3 3 2 N 11 3 -2\n8\n', '1\n5\n5\n', '1\n5\n6\n', '3\n1 1 1\n2\n'];
      for (const t of standardTrees(g, -3, 3).slice(1)) { const sums = sumsOfPaths(t); out.push(withLine(t, String(randInt(g, -3, 5)))); out.push(withLine(t, String(sums[randInt(g, 0, sums.length - 1)]))); }
      const big = standardTrees(g, ...BIG)[6]; out.push(withLine(big, String(sumsOfPaths(big)[3])));
      out.push(treeText(completeTree(g, 4095, 1, 1)) + '3\n', treeText(chainTree(g, 800, 'left', 1, 1)) + '400\n', treeText(chainTree(g, 800, 'right', 0, 0)) + '0\n');
      return out;
    }
  },

  {
    ...medium,
    slug: 'root-to-leaf-paths-with-sum',
    title: 'List the Roads With a Given Sum',
    tags: ['tree', 'backtracking', 'recursion'],
    concept: {
      title: 'Choose a node, explore below it, and take it back',
      body: [
        'This time every road from the root down to a leaf whose values add up to `target` must be **listed**, not only counted. This is backtracking on a tree: keep the current road in a list `path`, **add** the value of a node when entering it, and **remove** it when leaving. When a leaf is reached and the remaining target is exactly its value, a copy of the current road is stored.',
        { code: 'def paths(root, target):\n    result, path = [], []\n    def walk(node, rest):\n        if node is None:\n            return\n        path.append(node.val)                        # choose\n        if node.left is None and node.right is None and node.val == rest:\n            result.append(list(path))                # a copy: the list changes later\n        walk(node.left, rest - node.val)             # explore\n        walk(node.right, rest - node.val)\n        path.pop()                                   # unchoose\n    walk(root, target)\n    return result' },
        'Do not store `path` itself: it is changed later, so a **copy** (`list(path)`) is needed. The roads come out in the order of their leaves from left to right, because the left subtree is explored before the right one.'
      ]
    },
    statement: ['Print every road from the root down to a leaf whose values add up to `target`. Write a road as its values from the root to the leaf separated by spaces, one road per line, in the order of the leaves from left to right. If there is no such road, print `-1`.'],
    inputFormat: [...TREE_INPUT, 'The third line has `target`.'],
    outputFormat: ['The roads, one per line, or `-1`.'],
    constraints: [...LIMITS, '-10^12 <= target <= 10^12', 'At most 1000 roads have the sum `target`.'],
    examples: [{ input: '9\n5 4 8 11 N 13 4 7 2\n22\n', note: 'The only road with the sum 22 is 5 4 11 2.' }],
    hints: ['Keep the current road in a list; add the value on entering a node and remove it on leaving.', 'At a leaf, compare the rest of the target with the value of the leaf.', 'Store a copy of the list when the road is good.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'target:int'],
      solution: {
        python: r`
          def paths(root, target):
              result, path = [], []

              def walk(node, rest):
                  if node is None:
                      return
                  path.append(node.val)
                  if node.left is None and node.right is None and node.val == rest:
                      result.append(list(path))
                  walk(node.left, rest - node.val)
                  walk(node.right, rest - node.val)
                  path.pop()

              walk(root, target)
              return result`,
        cpp: r`
          void walkRoads(TreeNode* node, long long rest, vector<long long>& path, vector<vector<long long>>& result) {
              if (node == nullptr) return;
              path.push_back(node->val);
              if (node->left == nullptr && node->right == nullptr && node->val == rest) result.push_back(path);
              walkRoads(node->left, rest - node->val, path, result);
              walkRoads(node->right, rest - node->val, path, result);
              path.pop_back();
          }

          vector<vector<long long>> paths(TreeNode* root, long long target) {
              vector<vector<long long>> result;
              vector<long long> path;
              walkRoads(root, target, path, result);
              return result;
          }`,
        java: r`
          static void walkRoads(TreeNode node, long rest, List<Long> path, List<List<Long>> result) {
              if (node == null) return;
              path.add(node.val);
              if (node.left == null && node.right == null && node.val == rest) result.add(new ArrayList<>(path));
              walkRoads(node.left, rest - node.val, path, result);
              walkRoads(node.right, rest - node.val, path, result);
              path.remove(path.size() - 1);
          }

          static List<List<Long>> paths(TreeNode root, long target) {
              List<List<Long>> result = new ArrayList<>();
              walkRoads(root, target, new ArrayList<>(), result);
              return result;
          }`
      },
      stub: {
        python: r`
          def paths(root, target):
              # Your code here: return a list of the roads, each road a list of values
              return []`,
        cpp: r`
          vector<vector<long long>> paths(TreeNode* root, long long target) {
              // Your code here: return the roads, each road a vector of values
              return {};
          }`,
        java: r`
          static List<List<Long>> paths(TreeNode root, long target) {
              // Your code here: return the roads, each road a list of values
              return new ArrayList<>();
          }`
      },
      call: {
        python: 'result = paths(build_tree(vals), target)\nif result:\n    for road in result:\n        print(*road)\nelse:\n    print(-1)',
        cpp: 'vector<vector<long long>> result = paths(buildTree(vals), target);\nif (result.empty()) cout << -1 << "\\n";\nfor (const vector<long long>& road : result) {\n    for (size_t i = 0; i < road.size(); i++) cout << (i ? " " : "") << road[i];\n    cout << "\\n";\n}',
        java: 'List<List<Long>> result = paths(buildTree(vals), target);\nif (result.isEmpty()) System.out.println(-1);\nStringBuilder sb = new StringBuilder();\nfor (List<Long> road : result) {\n    for (int i = 0; i < road.size(); i++) sb.append(i > 0 ? " " : "").append(road.get(i));\n    sb.append("\\n");\n}\nSystem.out.print(sb);'
      }
    }),
    solution: { explanation: ['A depth-first walk keeps the current road in a list (choose on entering, unchoose on leaving) and stores a copy of it at every leaf whose value equals the rest of the target.'], complexity: 'Time O(n + total length of the stored roads), space O(h).' },
    solve(input) {
      const { root, rest } = splitInput(input); const target = Number(rest[0]); const out = []; const path = [];
      const go = (c, left) => { if (!c) return; path.push(c.val); if (!c.left && !c.right && c.val === left) out.push(path.join(' ')); go(c.left, left - c.val); go(c.right, left - c.val); path.pop(); };
      go(root, target); return out.length ? out.join('\n') : '-1';
    },
    tests() {
      const g = rng(735); const out = ['9\n5 4 8 11 N 13 4 7 2\n22\n', '1\n5\n5\n', '1\n5\n6\n'];
      const ok = (t, target) => this.solve(withLine(t, String(target))).split('\n').length <= 1000;
      for (const t of standardTrees(g, -3, 3).slice(1)) { const sums = sumsOfPaths(t); for (const target of [sums[randInt(g, 0, sums.length - 1)], 100000, sums[0]]) if (ok(t, target)) out.push(withLine(t, String(target))); }
      const t = standardTrees(g, ...BIG)[4]; const s = sumsOfPaths(t); out.push(withLine(t, String(s[2])));
      out.push(treeText(completeTree(g, 1023, 1, 1)) + '10\n', treeText(chainTree(g, 800, 'left', 1, 1)) + '800\n');
      return out;
    }
  },

  {
    ...medium,
    difficulty: 'medium',
    constraints: ['1 <= number of nodes <= 2000', '0 <= every value <= 9', 'The height of the tree is at most 10.'],
    slug: 'sum-of-root-to-leaf-numbers',
    title: 'Numbers Written Down the Tree',
    tags: ['tree', 'recursion', 'math'],
    concept: {
      title: 'Build the number on the way down: multiply by 10 and add the digit',
      body: [
        'Each value of the tree is a digit from 0 to 9. A road from the root down to a leaf reads as a decimal number (the root is the first digit). For example the road `1 - 2 - 3` is the number 123. We want the **sum of the numbers of all roads**.',
        'Carry the number read so far as an argument: entering a node with the digit `d` turns `prefix` into `prefix * 10 + d`. At a leaf the road is complete, and `prefix` is its number. Inner nodes pass the new prefix to their children and add the results.',
        { code: 'def total(root, prefix):\n    if root is None:\n        return 0\n    prefix = prefix * 10 + root.val\n    if root.left is None and root.right is None:\n        return prefix                       # a complete road\n    return total(root.left, prefix) + total(root.right, prefix)' },
        'With a height of at most 10 every number has at most 10 digits and the sum of up to 1000 such numbers fits in a 64-bit integer. Passing information **down** (the prefix) and adding results **up** (the sum) is a very common combination.'
      ]
    },
    statement: ['Every node of a binary tree holds a digit from 0 to 9. A road from the root down to a leaf is read as a decimal number (the root is the first digit). Print the sum of the numbers of all roads from the root to a leaf.'],
    outputFormat: ['Print the sum.'],
    examples: [{ input: '3\n1 2 3\n', note: 'The roads 1 2 and 1 3 are the numbers 12 and 13: 25.' }, { input: '5\n4 9 0 5 1\n', note: 'The numbers are 495, 491 and 40: 1026.' }],
    hints: ['Pass the number read so far down to the children.', 'Entering a node with digit d turns the prefix p into p * 10 + d.', 'At a leaf return the prefix; at other nodes add the results of the two children.'],
    program: treeProgram({
      solution: {
        python: r`
          def total(root, prefix):
              if root is None:
                  return 0
              prefix = prefix * 10 + root.val
              if root.left is None and root.right is None:
                  return prefix
              return total(root.left, prefix) + total(root.right, prefix)`,
        cpp: r`
          long long total(TreeNode* root, long long prefix) {
              if (root == nullptr) return 0;
              prefix = prefix * 10 + root->val;
              if (root->left == nullptr && root->right == nullptr) return prefix;
              return total(root->left, prefix) + total(root->right, prefix);
          }`,
        java: r`
          static long total(TreeNode root, long prefix) {
              if (root == null) return 0;
              prefix = prefix * 10 + root.val;
              if (root.left == null && root.right == null) return prefix;
              return total(root.left, prefix) + total(root.right, prefix);
          }`
      },
      stub: {
        python: r`
          def total(root, prefix):
              # Your code here: prefix is the number read on the way down so far
              return 0`,
        cpp: r`
          long long total(TreeNode* root, long long prefix) {
              // Your code here: prefix is the number read on the way down so far
              return 0;
          }`,
        java: r`
          static long total(TreeNode root, long prefix) {
              // Your code here: prefix is the number read on the way down so far
              return 0;
          }`
      },
      call: { python: 'print(total(build_tree(vals), 0))', cpp: 'cout << total(buildTree(vals), 0) << "\\n";', java: 'System.out.println(total(buildTree(vals), 0));' }
    }),
    solution: { explanation: ['The prefix grows by one digit at each step down; a leaf contributes its complete number, and an inner node contributes the sum of its two subtrees.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { const root = treeOfInput(input); let sum = 0; const go = (c, p) => { if (!c) return; const v = p * 10 + c.val; if (!c.left && !c.right) sum += v; go(c.left, v); go(c.right, v); }; go(root, 0); return String(sum); },
    tests() {
      const g = rng(736); const out = ['3\n1 2 3\n', '5\n4 9 0 5 1\n', '1\n7\n'];
      for (const [n, h] of [[7, 3], [30, 5], [200, 8], [800, 10], [2000, 10], [60, 10]]) out.push(treeText(boundedTree(g, n, h, 0, 9)));
      out.push(treeText(completeTree(g, 1023, 0, 9)), treeText(chainTree(g, 10, 'left', 0, 9)), treeText(chainTree(g, 10, 'zigzag', 9, 9)), treeText(completeTree(g, 1023, 9, 9)));
      return out;
    }
  },

  {
    ...medium,
    slug: 'count-good-nodes',
    title: 'Nodes That Are Not Beaten From Above',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'Carry the maximum of the road down with you',
      body: [
        'Call a node **good** if on the road from the root to the node there is no value larger than the value of the node (the root is always good). To decide this at a node, it is enough to know the **maximum value seen on the road so far**. Pass it down as an argument: a node is good when its value is at least that maximum, and the children get the larger of the old maximum and this node\'s value.',
        { code: 'def good(root, biggest):                     # biggest: the maximum on the road above\n    if root is None:\n        return 0\n    count = 1 if root.val >= biggest else 0\n    biggest = max(biggest, root.val)\n    return count + good(root.left, biggest) + good(root.right, biggest)\n\n# call: good(root, -infinity)' },
        'This is the same idea as the prefix in the previous problems: **information flows down** through an argument. Start with a number smaller than every possible value so that the root is counted.'
      ]
    },
    statement: ['A node of a binary tree is good if no node on the road from the root to it (the node itself not counted) has a larger value than the node. The root is always good. Print the number of good nodes.'],
    outputFormat: ['Print the number of good nodes.'],
    examples: [{ input: '7\n3 1 4 3 N 1 5\n', note: 'The good nodes are the root 3, then 4, then the 3 below the 1 (the road 3 1 3 has no larger value), and 5: four nodes.' }],
    hints: ['Pass the largest value of the road above the node down as an argument.', 'The node is good if its value is at least that largest value.', 'The children receive the larger of the old maximum and the value of the node.'],
    program: treeProgram({
      solution: {
        python: r`
          def good(root, biggest):
              if root is None:
                  return 0
              count = 1 if root.val >= biggest else 0
              biggest = max(biggest, root.val)
              return count + good(root.left, biggest) + good(root.right, biggest)`,
        cpp: r`
          long long good(TreeNode* root, long long biggest) {
              if (root == nullptr) return 0;
              long long count = root->val >= biggest ? 1 : 0;
              biggest = max(biggest, root->val);
              return count + good(root->left, biggest) + good(root->right, biggest);
          }`,
        java: r`
          static long good(TreeNode root, long biggest) {
              if (root == null) return 0;
              long count = root.val >= biggest ? 1 : 0;
              biggest = Math.max(biggest, root.val);
              return count + good(root.left, biggest) + good(root.right, biggest);
          }`
      },
      stub: {
        python: r`
          def good(root, biggest):
              # Your code here: biggest is the largest value on the road above
              return 0`,
        cpp: r`
          long long good(TreeNode* root, long long biggest) {
              // Your code here: biggest is the largest value on the road above
              return 0;
          }`,
        java: r`
          static long good(TreeNode root, long biggest) {
              // Your code here: biggest is the largest value on the road above
              return 0;
          }`
      },
      call: { python: 'print(good(build_tree(vals), -10 ** 18))', cpp: 'cout << good(buildTree(vals), -1000000000000000000LL) << "\\n";', java: 'System.out.println(good(buildTree(vals), -1000000000000000000L));' },
      includes: ['<algorithm>']
    }),
    solution: { explanation: ['Each call receives the maximum of the road above, counts the node when its value reaches that maximum, and passes the updated maximum to both children.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { const root = treeOfInput(input); let count = 0; const go = (c, m) => { if (!c) return; if (c.val >= m) count++; const nm = Math.max(m, c.val); go(c.left, nm); go(c.right, nm); }; go(root, -Infinity); return String(count); },
    tests() { const g = rng(737); return ['7\n3 1 4 3 N 1 5\n', '5\n3 3 N 4 2\n', '1\n-5\n', ...standardTrees(g, ...BIG).slice(1).map(treeText), treeText(chainTree(g, 800, 'left', 1, 1)), treeText(completeTree(g, 4095, -5, 5))]; }
  },

  {
    ...medium,
    slug: 'right-side-view',
    title: 'What You See From the Right',
    tags: ['tree', 'bfs', 'level-order'],
    concept: {
      title: 'The last node of every level',
      body: [
        'Stand on the right side of a tree and look at it: on each level you see the **rightmost node**, because it hides the others on the same level. So the answer is the last node of every level. A level-order walk that processes one level at a time gives it directly: after taking the nodes of a level, the last one taken is the rightmost.',
        { code: 'view = []\nlevel = [root]\nwhile level:\n    view.append(level[-1].val)               # the rightmost node of this level\n    level = [child for node in level for child in (node.left, node.right) if child is not None]\nprint(*view)' },
        'A node on a deeper level can still be seen when the right side of the tree is shorter: the left subtree can have a deeper level that is visible because the right side has no node there. The level-by-level walk handles this automatically.'
      ]
    },
    statement: ['Imagine standing on the right side of a binary tree. Print the values of the nodes that you see, from the top level to the bottom level: on every level the rightmost node. Print them on one line separated by spaces.'],
    outputFormat: ['The values on one line.'],
    examples: [{ input: '7\n1 2 3 N 5 N 4\n', note: 'The rightmost nodes of the levels are 1, 3 and 4.' }, { input: '4\n1 2 3 4\n', note: 'The deepest level has only the node 4, which is visible from the right.' }],
    hints: ['Go through the tree level by level.', 'The last node of each level is the one that is visible.', 'Keep the nodes of the current level in a list and build the next level from their children.'],
    program: treeProgram({
      solution: {
        python: r`
          def right_view(root):
              view = []
              level = [root]
              while level:
                  view.append(level[-1].val)
                  level = [child for node in level for child in (node.left, node.right) if child is not None]
              return view`,
        cpp: r`
          vector<long long> rightView(TreeNode* root) {
              vector<long long> view;
              vector<TreeNode*> level = {root};
              while (!level.empty()) {
                  view.push_back(level.back()->val);
                  vector<TreeNode*> next;
                  for (TreeNode* node : level) {
                      if (node->left) next.push_back(node->left);
                      if (node->right) next.push_back(node->right);
                  }
                  level = next;
              }
              return view;
          }`,
        java: r`
          static List<Long> rightView(TreeNode root) {
              List<Long> view = new ArrayList<>();
              List<TreeNode> level = new ArrayList<>();
              level.add(root);
              while (!level.isEmpty()) {
                  view.add(level.get(level.size() - 1).val);
                  List<TreeNode> next = new ArrayList<>();
                  for (TreeNode node : level) {
                      if (node.left != null) next.add(node.left);
                      if (node.right != null) next.add(node.right);
                  }
                  level = next;
              }
              return view;
          }`
      },
      stub: {
        python: r`
          def right_view(root):
              # Your code here: return the list of the visible values
              return []`,
        cpp: r`
          vector<long long> rightView(TreeNode* root) {
              // Your code here: return the visible values
              return {};
          }`,
        java: r`
          static List<Long> rightView(TreeNode root) {
              // Your code here: return the visible values
              return new ArrayList<>();
          }`
      },
      call: {
        python: 'print(*right_view(build_tree(vals)))',
        cpp: 'vector<long long> view = rightView(buildTree(vals));\nfor (size_t i = 0; i < view.size(); i++) cout << (i ? " " : "") << view[i];\ncout << "\\n";',
        java: 'List<Long> view = rightView(buildTree(vals));\nStringBuilder sb = new StringBuilder();\nfor (int i = 0; i < view.size(); i++) sb.append(i > 0 ? " " : "").append(view.get(i));\nSystem.out.println(sb);'
      }
    }),
    solution: { explanation: ['The tree is processed one level at a time; the last node of each level is recorded, and the next level is made of the children of the nodes of this level.'], complexity: 'Time O(n), space O(width).' },
    solve(input) { return levels(treeOfInput(input)).map((row) => row[row.length - 1]).join(' '); },
    tests() { const g = rng(738); return ['7\n1 2 3 N 5 N 4\n', '4\n1 2 3 4\n', '1\n5\n', ...standardTrees(g, ...BIG).slice(1).map(treeText), treeText(chainTree(g, 800, 'left')), treeText(chainTree(g, 800, 'zigzag'))]; }
  },

  {
    ...medium,
    slug: 'zigzag-level-order',
    title: 'Levels in a Zigzag',
    tags: ['tree', 'bfs', 'level-order'],
    concept: {
      title: 'Take the levels as usual, and reverse every second one',
      body: [
        'In a zigzag walk the first level is read from left to right, the second from right to left, the third from left to right again, and so on. The simplest way: get each level with the ordinary level-order walk and **reverse every second level** (the levels with an odd index, counting from 0).',
        { code: 'rows = []\nlevel = [root]\nleft_to_right = True\nwhile level:\n    values = [node.val for node in level]\n    rows.append(values if left_to_right else values[::-1])\n    left_to_right = not left_to_right\n    level = [child for node in level for child in (node.left, node.right) if child is not None]' },
        'The order in which the **next** level is built does not change: it is always from left to right. Only the way the values are written down alternates. Keep these two things apart: the traversal order and the output order.'
      ]
    },
    statement: ['Print the values of a binary tree level by level, in a zigzag: the first level from left to right, the second level from right to left, the third level from left to right, and so on. Every level is one line.'],
    outputFormat: ['One line for every level.'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'The lines are 3, then 20 9, then 15 7.' }],
    hints: ['Get the levels one by one as in the ordinary level-order walk.', 'Reverse every second level when you write it.', 'Building the next level always goes from left to right.'],
    program: treeProgram({
      solution: {
        python: r`
          def zigzag(root):
              rows = []
              level = [root]
              forward = True
              while level:
                  values = [node.val for node in level]
                  rows.append(values if forward else values[::-1])
                  forward = not forward
                  level = [child for node in level for child in (node.left, node.right) if child is not None]
              return rows`,
        cpp: r`
          vector<vector<long long>> zigzag(TreeNode* root) {
              vector<vector<long long>> rows;
              vector<TreeNode*> level = {root};
              bool forward = true;
              while (!level.empty()) {
                  vector<long long> values;
                  vector<TreeNode*> next;
                  for (TreeNode* node : level) {
                      values.push_back(node->val);
                      if (node->left) next.push_back(node->left);
                      if (node->right) next.push_back(node->right);
                  }
                  if (!forward) reverse(values.begin(), values.end());
                  rows.push_back(values);
                  forward = !forward;
                  level = next;
              }
              return rows;
          }`,
        java: r`
          static List<List<Long>> zigzag(TreeNode root) {
              List<List<Long>> rows = new ArrayList<>();
              List<TreeNode> level = new ArrayList<>();
              level.add(root);
              boolean forward = true;
              while (!level.isEmpty()) {
                  List<Long> values = new ArrayList<>();
                  List<TreeNode> next = new ArrayList<>();
                  for (TreeNode node : level) {
                      values.add(node.val);
                      if (node.left != null) next.add(node.left);
                      if (node.right != null) next.add(node.right);
                  }
                  if (!forward) Collections.reverse(values);
                  rows.add(values);
                  forward = !forward;
                  level = next;
              }
              return rows;
          }`
      },
      stub: {
        python: r`
          def zigzag(root):
              # Your code here: return a list with one list of values for every level
              return []`,
        cpp: r`
          vector<vector<long long>> zigzag(TreeNode* root) {
              // Your code here: return one vector of values for every level
              return {};
          }`,
        java: r`
          static List<List<Long>> zigzag(TreeNode root) {
              // Your code here: return one list of values for every level
              return new ArrayList<>();
          }`
      },
      call: {
        python: 'for row in zigzag(build_tree(vals)):\n    print(*row)',
        cpp: 'for (const vector<long long>& row : zigzag(buildTree(vals))) {\n    for (size_t i = 0; i < row.size(); i++) cout << (i ? " " : "") << row[i];\n    cout << "\\n";\n}',
        java: 'StringBuilder sb = new StringBuilder();\nfor (List<Long> row : zigzag(buildTree(vals))) {\n    for (int i = 0; i < row.size(); i++) sb.append(i > 0 ? " " : "").append(row.get(i));\n    sb.append("\\n");\n}\nSystem.out.print(sb);'
      },
      includes: ['<algorithm>']
    }),
    solution: { explanation: ['The levels are produced as usual, from left to right, and every second one is reversed when it is written.'], complexity: 'Time O(n), space O(width).' },
    solve(input) { return levels(treeOfInput(input)).map((row, i) => (i % 2 ? row.slice().reverse() : row).join(' ')).join('\n'); },
    tests() { const g = rng(739); return ['7\n3 9 20 N N 15 7\n', '1\n5\n', '3\n1 2 3\n', ...standardTrees(g, ...BIG).slice(1).map(treeText)]; }
  },

  {
    ...medium,
    slug: 'bottom-left-value',
    title: 'The Leftmost Value in the Last Row',
    tags: ['tree', 'bfs', 'level-order'],
    concept: {
      title: 'Walk the levels from right to left, the last node is the answer',
      body: [
        'We want the leftmost value of the deepest level. A level-order walk that adds the **right child before the left child** visits every level from right to left, and the very last node it visits is the leftmost node of the deepest level. So the answer is simply "the last node taken from the queue".',
        { code: 'from collections import deque\n\nqueue = deque([root])\nnode = root\nwhile queue:\n    node = queue.popleft()\n    if node.right:\n        queue.append(node.right)           # right first\n    if node.left:\n        queue.append(node.left)\nprint(node.val)                             # the last node visited' },
        'Another way is a depth-first walk that remembers the depth: the first node found on a new deepest level (when going left before right) is the answer. Both versions need only one pass over the tree.'
      ]
    },
    statement: ['Print the value of the leftmost node on the deepest level (the last row) of a binary tree.'],
    outputFormat: ['Print the value.'],
    examples: [{ input: '7\n1 2 3 4 N 5 6\n', note: 'The last row has the nodes 4, 5 and 6; the leftmost is 4.' }],
    hints: ['The deepest level is the last one in a level-order walk.', 'Visit the right child before the left child; then the last visited node is the leftmost node of the last row.', 'Or remember the depth and take the first node of the deepest level in a left-first walk.'],
    program: treeProgram({
      solution: {
        python: r`
          from collections import deque

          def bottom_left(root):
              queue = deque([root])
              node = root
              while queue:
                  node = queue.popleft()
                  if node.right:
                      queue.append(node.right)
                  if node.left:
                      queue.append(node.left)
              return node.val`,
        cpp: r`
          long long bottomLeft(TreeNode* root) {
              vector<TreeNode*> queue = {root};
              size_t head = 0;
              TreeNode* node = root;
              while (head < queue.size()) {
                  node = queue[head++];
                  if (node->right) queue.push_back(node->right);
                  if (node->left) queue.push_back(node->left);
              }
              return node->val;
          }`,
        java: r`
          static long bottomLeft(TreeNode root) {
              ArrayList<TreeNode> queue = new ArrayList<>();
              queue.add(root);
              int head = 0;
              TreeNode node = root;
              while (head < queue.size()) {
                  node = queue.get(head++);
                  if (node.right != null) queue.add(node.right);
                  if (node.left != null) queue.add(node.left);
              }
              return node.val;
          }`
      },
      stub: {
        python: r`
          def bottom_left(root):
              # Your code here
              return 0`,
        cpp: r`
          long long bottomLeft(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long bottomLeft(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(bottom_left(build_tree(vals)))', cpp: 'cout << bottomLeft(buildTree(vals)) << "\\n";', java: 'System.out.println(bottomLeft(buildTree(vals)));' }
    }),
    solution: { explanation: ['A queue walk that enqueues the right child before the left child ends with the leftmost node of the deepest level; that last visited node is the answer.'], complexity: 'Time O(n), space O(width).' },
    solve(input) { const rowsOfTree = levels(treeOfInput(input)); return String(rowsOfTree[rowsOfTree.length - 1][0]); },
    tests() { const g = rng(740); return ['7\n1 2 3 4 N 5 6\n', '1\n5\n', '3\n2 1 3\n', ...standardTrees(g, ...BIG).slice(1).map(treeText)]; }
  }
];
