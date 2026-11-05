import { r, rng, randInt, many, nums, rows, shuffle } from '../../lib.mjs';
import { treeProgram } from '../../scaffolds.mjs';
import { node, treeText, treeOfInput, standardTrees, randomTree, completeTree, chainTree, randomBst, relabelDistinct, boundedTree, allNodes, inorder, preorder, toTokens, bstFromInsertions, balancedBst, distinctValues, clone } from '../../treelib.mjs';

const TREE_INPUT = ['The first line has `t`, the number of words in the description of the tree.', 'The second line has the tree in level order: the root first, then the children of the nodes row by row from left to right. `N` stands for a missing child. There is no `N` at the end.'];
const LIMITS = ['1 <= number of nodes <= 20000', '-10^9 <= every value <= 10^9', 'The height of the tree is at most 800.'];
const BIG = [-1000000000, 1000000000];
const hard = { difficulty: 'hard', inputFormat: TREE_INPUT, constraints: LIMITS };
const show = (root) => (root ? toTokens(root).join(' ') : 'empty');
const splitInput = (input) => { const rs = input.replace(/\n$/, '').split('\n'); return { root: treeOfInput(rs.slice(0, 2).join('\n') + '\n'), rest: rs.slice(2) }; };
const withLine = (root, line) => `${treeText(root)}${line}\n`;
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const parentsOf = (root) => { const parent = new Map(); for (const c of allNodes(root)) { if (c.left) parent.set(c.left, c); if (c.right) parent.set(c.right, c); } return parent; };
const distinctTrees = (g) => standardTrees(g, ...BIG).map((t) => relabelDistinct(g, t));

export default [
  {
    ...hard,
    slug: 'binary-tree-max-path-sum',
    title: 'The Best Path in a Tree With Negative Values',
    tags: ['tree', 'recursion', 'tree-dp'],
    concept: {
      title: 'A path bends at one highest node: join the best downward arm on each side',
      body: [
        'A *path* in a binary tree is a sequence of nodes where neighbours are connected by an edge and no node is used twice. It does not have to start at the root or end at a leaf, and the values can be **negative**. Find the path with the largest sum of values (it has at least one node).',
        'Every path has a **highest node**, the one closest to the root, where it may bend: it comes up from one child, passes through the node, and goes down to the other child. So the best path whose highest node is `v` has the sum `v.val + (best downward arm on the left) + (best downward arm on the right)`, where an arm that would make the sum smaller is simply **not taken** (its value is 0 instead).',
        'A recursive function can return, for each node, the best **downward arm** that starts there: `v.val + max(left arm, right arm, 0)`. (A path that continues upward can use only one of the two children.) While computing it, the function also tries the bent path through the node and keeps the best answer seen.',
        { code: 'best = None\ndef arm(node):                      # the best sum of a path that starts at node and goes down\n    global best\n    if node is None:\n        return 0\n    left = max(arm(node.left), 0)   # a negative arm is not worth taking\n    right = max(arm(node.right), 0)\n    through = node.val + left + right\n    if best is None or through > best:\n        best = through              # the path bends at this node\n    return node.val + max(left, right)' },
        'The two ideas to remember: the function **returns** something different from what it **records** (one arm vs. a bent path), and a negative arm is replaced by 0, but the node itself must be in the path, so the answer can be negative when all values are negative. Use 64-bit integers: 20000 values of 10^9 sum to 2 * 10^13.'
      ]
    },
    statement: ['Find the path with the largest sum of values in a binary tree. A path is a sequence of at least one node in which every two neighbours are connected by an edge of the tree and no node appears twice; it does not need to pass through the root. Print the largest sum.'],
    outputFormat: ['Print the largest sum of a path.'],
    examples: [{ input: '7\n-10 9 20 N N 15 7\n', note: 'The best path is 15, 20, 7 with the sum 42.' }],
    hints: ['Every path has one highest node where it may bend.', 'For each node compute the best downward arm; ignore an arm whose sum is negative.', 'The path bent at a node has the value node + left arm + right arm; keep the maximum of these. The function itself returns node + the better single arm.'],
    program: treeProgram({
      includes: ['<algorithm>'],
      solution: {
        python: r`
          def max_path(root):
              best = [None]

              def arm(node):
                  if node is None:
                      return 0
                  left = max(arm(node.left), 0)
                  right = max(arm(node.right), 0)
                  through = node.val + left + right
                  if best[0] is None or through > best[0]:
                      best[0] = through
                  return node.val + max(left, right)

              arm(root)
              return best[0]`,
        cpp: r`
          long long arm(TreeNode* node, long long& best) {
              if (node == nullptr) return 0;
              long long left = max(arm(node->left, best), 0LL);
              long long right = max(arm(node->right, best), 0LL);
              best = max(best, node->val + left + right);
              return node->val + max(left, right);
          }

          long long maxPath(TreeNode* root) {
              long long best = -4000000000000000000LL;
              arm(root, best);
              return best;
          }`,
        java: r`
          static long arm(TreeNode node, long[] best) {
              if (node == null) return 0;
              long left = Math.max(arm(node.left, best), 0);
              long right = Math.max(arm(node.right, best), 0);
              best[0] = Math.max(best[0], node.val + left + right);
              return node.val + Math.max(left, right);
          }

          static long maxPath(TreeNode root) {
              long[] best = {Long.MIN_VALUE};
              arm(root, best);
              return best[0];
          }`
      },
      stub: {
        python: r`
          def max_path(root):
              # Your code here
              return 0`,
        cpp: r`
          long long maxPath(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long maxPath(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(max_path(build_tree(vals)))', cpp: 'cout << maxPath(buildTree(vals)) << "\\n";', java: 'System.out.println(maxPath(buildTree(vals)));' }
    }),
    solution: { explanation: ['A post-order recursion returns the best downward arm of every node (its value plus the better non-negative child arm) and records the best bent path through the node (its value plus both non-negative arms).'], complexity: 'Time O(n), space O(h).' },
    solve(input) {
      const root = treeOfInput(input); let best = null;
      const arm = (c) => { if (!c) return 0; const left = Math.max(arm(c.left), 0), right = Math.max(arm(c.right), 0); const through = c.val + left + right; if (best === null || through > best) best = through; return c.val + Math.max(left, right); };
      arm(root); return String(best);
    },
    tests() {
      const g = rng(791); const out = ['7\n-10 9 20 N N 15 7\n', '1\n-5\n', '3\n1 2 3\n', '3\n-3 -2 -1\n', '5\n2 -1 N -2 -3\n'];
      const brute = (input) => { const root = treeOfInput(input); const nodes = allNodes(root); const parent = parentsOf(root); const up = (c) => { const chain = []; for (let x = c; x; x = parent.get(x)) chain.push(x); return chain; }; let best = -Infinity; for (const u of nodes) for (const v of nodes) { const a = up(u), b = up(v); const inB = new Set(b); const meet = a.find((x) => inB.has(x)); const path = new Set([...a.slice(0, a.indexOf(meet) + 1), ...b.slice(0, b.indexOf(meet) + 1)]); let s = 0; for (const x of path) s += x.val; best = Math.max(best, s); } return String(best); };
      crossCheck(() => treeText(randomTree(g, randInt(g, 1, 11), -6, 6)), (i) => this.solve(i), brute);
      for (const t of standardTrees(g, ...BIG).slice(1)) out.push(treeText(t));
      for (const t of standardTrees(g, -5, 5).slice(1)) out.push(treeText(t));
      out.push(treeText(randomTree(g, 20000, -BIG[1], -1)), treeText(chainTree(g, 800, 'zigzag', -1000, 1000)));
      return out;
    }
  },

  {
    ...hard,
    constraints: ['1 <= number of nodes <= 20000', 'Every value is 0 (the values do not matter).', 'The height of the tree is at most 800.'],
    slug: 'binary-tree-cameras',
    title: 'Watch Every Node With the Fewest Cameras',
    tags: ['tree', 'greedy', 'recursion', 'tree-dp'],
    concept: {
      title: 'Decide from the bottom up, and put cameras as high as possible: on the parents of leaves',
      body: [
        'A camera placed on a node watches **the node itself, its parent and its children**. What is the smallest number of cameras that watch **every** node of the tree?',
        'The greedy idea: a leaf should never get a camera. A camera on its **parent** watches the leaf, the parent, the grandparent and the sibling, which is more than a camera on the leaf. So work **bottom-up** and put a camera on a node exactly when one of its children is **not watched** yet. Each node reports one of three states to its parent:',
        '- **0**: the node is not watched (its parent must get a camera);\n- **1**: the node has a camera;\n- **2**: the node is watched, but has no camera (a child has a camera).',
        { code: 'cameras = 0\ndef state(node):\n    global cameras\n    if node is None:\n        return 2                       # nothing to watch: counts as "watched"\n    left, right = state(node.left), state(node.right)\n    if left == 0 or right == 0:        # a child is not watched: put a camera here\n        cameras += 1\n        return 1\n    if left == 1 or right == 1:        # a child has a camera: this node is watched\n        return 2\n    return 0                           # both children are watched, but nobody watches this node\n\nif state(root) == 0:                   # the root itself is not watched\n    cameras += 1' },
        'The greedy choice is safe because moving a camera from a node to its parent never watches fewer nodes except possibly the node\'s own children, and those are watched in the other states anyway. The total work is O(n).'
      ]
    },
    statement: ['A camera on a node of a binary tree watches that node, its parent and its children. Print the smallest number of cameras needed to watch every node of the tree. (The values of the nodes do not matter; they are all 0.)'],
    outputFormat: ['Print the smallest number of cameras.'],
    examples: [{ input: '5\n0 0 N 0 0\n', note: 'One camera on the left child of the root watches itself, the root and its two children: 1.' }, { input: '7\n0 0 N 0 N 0 N\n', note: 'A path of four nodes needs 2 cameras.' }],
    hints: ['A camera on a leaf is a waste: its parent watches more.', 'Return a state from every node: not watched, has a camera, or watched without a camera.', 'Put a camera on a node when a child is not watched; check the root at the end.'],
    program: treeProgram({
      solution: {
        python: r`
          def min_cameras(root):
              cameras = [0]

              def state(node):
                  if node is None:
                      return 2
                  left = state(node.left)
                  right = state(node.right)
                  if left == 0 or right == 0:
                      cameras[0] += 1
                      return 1
                  if left == 1 or right == 1:
                      return 2
                  return 0

              if state(root) == 0:
                  cameras[0] += 1
              return cameras[0]`,
        cpp: r`
          int state(TreeNode* node, int& cameras) {
              if (node == nullptr) return 2;
              int left = state(node->left, cameras);
              int right = state(node->right, cameras);
              if (left == 0 || right == 0) {
                  cameras++;
                  return 1;
              }
              if (left == 1 || right == 1) return 2;
              return 0;
          }

          int minCameras(TreeNode* root) {
              int cameras = 0;
              if (state(root, cameras) == 0) cameras++;
              return cameras;
          }`,
        java: r`
          static int state(TreeNode node, int[] cameras) {
              if (node == null) return 2;
              int left = state(node.left, cameras);
              int right = state(node.right, cameras);
              if (left == 0 || right == 0) {
                  cameras[0]++;
                  return 1;
              }
              if (left == 1 || right == 1) return 2;
              return 0;
          }

          static int minCameras(TreeNode root) {
              int[] cameras = {0};
              if (state(root, cameras) == 0) cameras[0]++;
              return cameras[0];
          }`
      },
      stub: {
        python: r`
          def min_cameras(root):
              # Your code here
              return 0`,
        cpp: r`
          int minCameras(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static int minCameras(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(min_cameras(build_tree(vals)))', cpp: 'cout << minCameras(buildTree(vals)) << "\\n";', java: 'System.out.println(minCameras(buildTree(vals)));' }
    }),
    solution: { explanation: ['Each node reports a state to its parent: 0 not watched, 1 has a camera, 2 watched without a camera. A node gets a camera when a child is not watched; the root gets one if it is left unwatched.'], complexity: 'Time O(n), space O(h).' },
    solve(input) {
      const root = treeOfInput(input); let cameras = 0;
      const state = (c) => { if (!c) return 2; const l = state(c.left), rr = state(c.right); if (l === 0 || rr === 0) { cameras++; return 1; } if (l === 1 || rr === 1) return 2; return 0; };
      if (state(root) === 0) cameras++; return String(cameras);
    },
    tests() {
      const g = rng(792); const out = ['5\n0 0 N 0 0\n', '7\n0 0 N 0 N 0 N\n', '1\n0\n', '3\n0 0 0\n'];
      const brute = (input) => { const root = treeOfInput(input); const nodes = allNodes(root); const parent = parentsOf(root); const n = nodes.length; let best = n; for (let mask = 0; mask < (1 << n); mask++) { let count = 0; for (let b = 0; b < n; b++) if (mask >> b & 1) count++; if (count >= best) continue; const watched = new Set(); nodes.forEach((c, b) => { if (mask >> b & 1) { watched.add(c); if (c.left) watched.add(c.left); if (c.right) watched.add(c.right); if (parent.get(c)) watched.add(parent.get(c)); } }); if (watched.size === n) best = count; } return String(best); };
      crossCheck(() => treeText(randomTree(g, randInt(g, 1, 12), 0, 0)), (i) => this.solve(i), brute, 300);
      for (const t of standardTrees(g, 0, 0).slice(1)) out.push(treeText(t));
      for (const n of [15, 100, 1000, 20000]) out.push(treeText(randomTree(g, n, 0, 0)), treeText(boundedTree(g, n, 12, 0, 0)));
      out.push(treeText(chainTree(g, 799, 'left', 0, 0)), treeText(chainTree(g, 800, 'right', 0, 0)), treeText(completeTree(g, 8191, 0, 0)));
      return out;
    }
  },

  {
    ...hard,
    constraints: ['2 <= number of nodes <= 20000', '-10^9 <= every value <= 10^9, and all values are different', 'The height of the tree is at most 800.', 'The tree was a binary search tree before exactly two of its values were swapped.'],
    slug: 'recover-bst',
    title: 'Two Values Were Swapped in a Search Tree',
    tags: ['tree', 'bst', 'inorder'],
    concept: {
      title: 'In the in-order list a swap leaves one or two places where the order goes down',
      body: [
        'The in-order walk of a binary search tree gives the values in increasing order. If **two values are swapped**, the in-order list is almost sorted: it has exactly one or two places where a value is **larger than the next one** (a "descent").',
        '- If the swapped values are neighbours in the list (`... 3 [5 4] 6 ...` becomes `... 3 5 4 6 ...`... or similar), there is **one** descent, and the two values around it are the swapped nodes.\n- Otherwise there are **two** descents; the first node of the **first** descent and the second node of the **second** descent are the swapped ones (the big value moved to the left, the small value moved to the right).',
        { code: 'first = second = prev = None\nstack, node = [], root\nwhile stack or node:                      # an iterative in-order walk\n    while node:\n        stack.append(node)\n        node = node.left\n    node = stack.pop()\n    if prev and prev.val > node.val:      # a descent\n        if first is None:\n            first = prev                  # the first descent gives the first node\n        second = node                     # the last descent gives the second node\n    prev = node\n    node = node.right\nfirst.val, second.val = second.val, first.val' },
        'Both swapped nodes are found in one in-order walk; the values are then swapped back, and the shape of the tree never changes. (Another way: collect all nodes in in-order, sort their values, and write them back: O(n log n).)'
      ]
    },
    statement: ['Exactly two nodes of a binary search tree had their values swapped. Swap them back, so that the tree is a binary search tree again (only values change, the shape stays). Print the recovered tree in level order in the same form as a tree in the input (`N` for a missing child, no `N` at the end).'],
    outputFormat: ['The recovered tree in level order on one line.'],
    examples: [{ input: '5\n1 3 N N 2\n', note: 'The values 1 and 3 were swapped: 3 1 N N 2.' }],
    hints: ['The in-order list of a search tree is increasing.', 'After a swap, scan the in-order list for places where a value is larger than the next one.', 'The first node of the first such place and the second node of the last such place are the swapped nodes.'],
    program: treeProgram({
      solution: {
        python: r`
          def recover(root):
              first = second = prev = None
              stack = []
              node = root
              while stack or node is not None:
                  while node is not None:
                      stack.append(node)
                      node = node.left
                  node = stack.pop()
                  if prev is not None and prev.val > node.val:
                      if first is None:
                          first = prev
                      second = node
                  prev = node
                  node = node.right
              first.val, second.val = second.val, first.val`,
        cpp: r`
          void recover(TreeNode* root) {
              TreeNode* first = nullptr;
              TreeNode* second = nullptr;
              TreeNode* prev = nullptr;
              vector<TreeNode*> stack;
              TreeNode* node = root;
              while (!stack.empty() || node != nullptr) {
                  while (node != nullptr) {
                      stack.push_back(node);
                      node = node->left;
                  }
                  node = stack.back();
                  stack.pop_back();
                  if (prev != nullptr && prev->val > node->val) {
                      if (first == nullptr) first = prev;
                      second = node;
                  }
                  prev = node;
                  node = node->right;
              }
              swap(first->val, second->val);
          }`,
        java: r`
          static void recover(TreeNode root) {
              TreeNode first = null, second = null, prev = null;
              ArrayList<TreeNode> stack = new ArrayList<>();
              TreeNode node = root;
              while (!stack.isEmpty() || node != null) {
                  while (node != null) {
                      stack.add(node);
                      node = node.left;
                  }
                  node = stack.remove(stack.size() - 1);
                  if (prev != null && prev.val > node.val) {
                      if (first == null) first = prev;
                      second = node;
                  }
                  prev = node;
                  node = node.right;
              }
              long t = first.val;
              first.val = second.val;
              second.val = t;
          }`
      },
      includes: ['<utility>'],
      stub: {
        python: r`
          def recover(root):
              # Your code here: change the tree in place
              pass`,
        cpp: r`
          void recover(TreeNode* root) {
              // Your code here: change the tree in place
          }`,
        java: r`
          static void recover(TreeNode root) {
              // Your code here: change the tree in place
          }`
      },
      call: { python: 'root = build_tree(vals)\nrecover(root)\nprint_tree(root)', cpp: 'TreeNode* root = buildTree(vals);\nrecover(root);\nprintTree(root);', java: 'TreeNode root = buildTree(vals);\nrecover(root);\nprintTree(root);' }
    }),
    solution: { explanation: ['An iterative in-order walk finds the descents of the in-order list: the first node of the first descent and the second node of the last descent are the swapped nodes, and their values are swapped back.'], complexity: 'Time O(n), space O(h).' },
    solve(input) {
      const root = treeOfInput(input); const stack = [], order = []; let cur = root;
      while (cur || stack.length) { while (cur) { stack.push(cur); cur = cur.left; } cur = stack.pop(); order.push(cur); cur = cur.right; }
      const values = order.map((c) => c.val).sort((a, b) => a - b); order.forEach((c, i) => { c.val = values[i]; });
      return show(root);
    },
    tests() {
      const g = rng(793); const out = ['5\n1 3 N N 2\n', '3\n2 3 1\n', '2\n1 2\n'];
      const swapped = (t, how) => { const copy = clone(t); const order = []; const st = []; let c = copy; while (c || st.length) { while (c) { st.push(c); c = c.left; } c = st.pop(); order.push(c); c = c.right; } const n = order.length; let i, j; if (how === 'adjacent') { i = randInt(g, 0, n - 2); j = i + 1; } else if (how === 'ends') { i = 0; j = n - 1; } else if (how === 'root') { i = order.indexOf(copy); j = randInt(g, 0, n - 1); if (j === i) j = (i + 1) % n; } else { i = randInt(g, 0, n - 1); j = randInt(g, 0, n - 1); if (j === i) j = (i + 1) % n; } [order[i].val, order[j].val] = [order[j].val, order[i].val]; return copy; };
      const sets = [randomBst(g, 2, ...BIG), randomBst(g, 3, ...BIG), randomBst(g, 7, ...BIG), randomBst(g, 31, ...BIG), randomBst(g, 500, ...BIG), randomBst(g, 5000, ...BIG), randomBst(g, 20000, ...BIG), balancedBst(distinctValues(g, 4095, ...BIG).sort((a, b) => a - b)), bstFromInsertions(Array.from({ length: 700 }, (_, i) => i * 3 - 1000)), bstFromInsertions(Array.from({ length: 700 }, (_, i) => 1000 - i * 3))];
      for (const t of sets) for (const how of (inorder(t).length > 1000 ? ['random'] : ['adjacent', 'ends', 'root', 'random'])) out.push(treeText(swapped(t, how)));
      return out;
    }
  },

  {
    difficulty: 'hard',
    inputFormat: ['The first line has `n`.', 'The second line has `n` different integers: the order in which the values are inserted into an empty binary search tree.'],
    constraints: ['1 <= n <= 800', '-10^9 <= every value <= 10^9, and all values are different'],
    slug: 'same-bst-orderings',
    title: 'Other Orders That Build the Same Search Tree',
    tags: ['tree', 'bst', 'combinatorics', 'recursion', 'modular-arithmetic'],
    concept: {
      title: 'The first number is the root; the two halves may be interleaved in any way',
      body: [
        'Inserting the numbers of a list one by one into an empty binary search tree builds a tree. Different lists can build the **same** tree: the list `[2, 1, 3]` and the list `[2, 3, 1]` both give the root 2 with the children 1 and 3. How many lists (orderings of the same numbers) give exactly the same tree?',
        'Look at the first number: it is the **root**, in every ordering that builds this tree. The numbers smaller than the root all go to the left subtree and the larger ones to the right subtree, and each subtree is built by its own numbers **in the order they appear**. The only freedom is how the left numbers and the right numbers are **interleaved**: any interleaving works, as long as each side keeps its own order (otherwise the shape inside a subtree would change).',
        'If the left part has `a` numbers and the right part `b`, the number of interleavings is the binomial coefficient `C(a + b, a)`, and the two sides can be ordered independently inside. So:',
        { code: 'ways(list) = C(len(list) - 1, len(left)) * ways(left) * ways(right)\n   where left = the numbers smaller than list[0], right = the larger ones, both in the original order\nways(list with at most 2 numbers) = 1' },
        'The number of **other** orderings is `ways(list) - 1`. The result is large, so it is printed modulo 1000000007. The binomial coefficients come from Pascal\'s triangle modulo the same number: `C(i, j) = C(i - 1, j - 1) + C(i - 1, j)`. For `n` up to 800 the table has about 320000 entries, and the recursion has at most `n` levels.'
      ]
    },
    statement: ['The numbers of a list are inserted one by one, in the given order, into an initially empty binary search tree (a number smaller than a node goes to its left subtree, a larger one to its right subtree). How many other orderings of the same numbers build exactly the same tree? Print the answer modulo 1000000007.'],
    outputFormat: ['Print the number of other orderings modulo 1000000007.'],
    examples: [{ input: '3\n2 1 3\n', note: 'Only [2, 3, 1] builds the same tree: 1.' }, { input: '5\n3 4 5 1 2\n', note: 'The root 3 has the left part [1, 2] and the right part [4, 5]: C(4, 2) = 6 interleavings, so 6 - 1 = 5 other orderings.' }],
    hints: ['The first number is the root of the tree in every such ordering.', 'Split the rest into the smaller and the larger numbers, keeping their order; the two halves are interleaved in C(a + b, a) ways.', 'Multiply by the answers of the two halves, subtract 1 at the end, and take everything modulo 1000000007.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      helpers: {
        python: r`
          MOD = 1000000007
          C = [[1]]
          for i in range(1, 801):
              row = [1] * (i + 1)
              for j in range(1, i):
                  row[j] = (C[i - 1][j - 1] + C[i - 1][j]) % MOD
              C.append(row)

          def ways(seq):
              if len(seq) <= 2:
                  return 1
              root = seq[0]
              left = [x for x in seq if x < root]
              right = [x for x in seq if x > root]
              return C[len(seq) - 1][len(left)] * ways(left) % MOD * ways(right) % MOD`,
        cpp: r`
          const long long MOD = 1000000007LL;
          vector<vector<long long>> C;

          void buildTable() {
              C.assign(801, vector<long long>());
              C[0] = {1};
              for (int i = 1; i <= 800; i++) {
                  C[i].assign(i + 1, 1);
                  for (int j = 1; j < i; j++) C[i][j] = (C[i - 1][j - 1] + C[i - 1][j]) % MOD;
              }
          }

          long long ways(const vector<long long>& seq) {
              if (seq.size() <= 2) return 1;
              vector<long long> left, right;
              for (long long x : seq) {
                  if (x < seq[0]) left.push_back(x);
                  else if (x > seq[0]) right.push_back(x);
              }
              return C[seq.size() - 1][left.size()] * ways(left) % MOD * ways(right) % MOD;
          }`,
        java: r`
          static final long MOD = 1000000007L;
          static long[][] C = new long[801][];

          static void buildTable() {
              C[0] = new long[] {1};
              for (int i = 1; i <= 800; i++) {
                  C[i] = new long[i + 1];
                  Arrays.fill(C[i], 1);
                  for (int j = 1; j < i; j++) C[i][j] = (C[i - 1][j - 1] + C[i - 1][j]) % MOD;
              }
          }

          static long ways(List<Long> seq) {
              if (seq.size() <= 2) return 1;
              List<Long> left = new ArrayList<>(), right = new ArrayList<>();
              long root = seq.get(0);
              for (long x : seq) {
                  if (x < root) left.add(x);
                  else if (x > root) right.add(x);
              }
              return C[seq.size() - 1][left.size()] * ways(left) % MOD * ways(right) % MOD;
          }`
      },
      python: 'print((ways(a) - 1) % MOD)',
      cpp: r`
        buildTable();
        cout << (ways(a) - 1 + MOD) % MOD << "\n";`,
      java: r`
        buildTable();
        List<Long> seq = new ArrayList<>();
        for (long x : a) seq.add(x);
        System.out.println((ways(seq) - 1 + MOD) % MOD);`
    },
    solution: { explanation: ['The first number is the root; the smaller and the larger numbers (in their original order) form the two subtrees, which can be interleaved in C(a + b, a) ways. The answer is the product over all subtrees, minus one, modulo 1000000007.'], complexity: 'Time O(n^2), space O(n^2) for Pascal\'s triangle.' },
    solve(input) {
      const a = nums(input.replace(/\n$/, '').split('\n')[1]); const MOD = 1000000007n; const C = [[1n]];
      for (let i = 1; i <= a.length; i++) { const row = new Array(i + 1).fill(1n); for (let j = 1; j < i; j++) row[j] = (C[i - 1][j - 1] + C[i - 1][j]) % MOD; C.push(row); }
      const ways = (seq) => { if (seq.length <= 2) return 1n; const left = seq.filter((x) => x < seq[0]), right = seq.filter((x) => x > seq[0]); return C[seq.length - 1][left.length] * ways(left) % MOD * ways(right) % MOD; };
      return String((ways(a) - 1n + MOD) % MOD);
    },
    tests() {
      const g = rng(794); const out = ['3\n2 1 3\n', '5\n3 4 5 1 2\n', '1\n7\n', '2\n1 2\n', '3\n1 2 3\n'];
      const permutations = (arr) => (arr.length <= 1 ? [arr] : arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p])));
      const brute = (input) => { const a = nums(input.replace(/\n$/, '').split('\n')[1]); const shape = (list) => JSON.stringify(toTokens(bstFromInsertions(list))); const want = shape(a); return String(permutations(a).filter((p) => shape(p) === want).length - 1); };
      crossCheck(() => { const n = randInt(g, 1, 7); return `${n}\n${distinctValues(g, n, -20, 20).join(' ')}\n`; }, (i) => this.solve(i), brute, 150);
      const list = (a) => `${a.length}\n${a.join(' ')}\n`;
      for (const n of [10, 40, 120, 400, 800]) out.push(list(distinctValues(g, n, -BIG[1], BIG[1])));
      out.push(list(Array.from({ length: 800 }, (_, i) => i)), list(Array.from({ length: 800 }, (_, i) => 800 - i)), list(Array.from({ length: 800 }, (_, i) => (i % 2 ? i : -i))));
      const balanced = (lo, hi) => (lo > hi ? [] : [Math.floor((lo + hi) / 2), ...balanced(lo, Math.floor((lo + hi) / 2) - 1), ...balanced(Math.floor((lo + hi) / 2) + 1, hi)]);
      out.push(list(balanced(1, 511)), list(balanced(1, 800)), list([5, ...Array.from({ length: 399 }, (_, i) => 6 + i), ...Array.from({ length: 400 }, (_, i) => 4 - i)]));
      return out;
    }
  },

  {
    ...hard,
    slug: 'max-sum-bst-subtree',
    title: 'The Richest Search Tree Hidden Inside',
    tags: ['tree', 'bst', 'recursion', 'tree-dp'],
    concept: {
      title: 'Each subtree reports: am I a search tree, my smallest and largest value, my sum',
      body: [
        'A binary tree is given (it is **not** a search tree as a whole). Some of its **subtrees** (a node together with everything below it) happen to be binary search trees. Among them, find the one with the **largest sum of values**. The empty tree counts as a search tree with the sum 0, so the answer is never negative.',
        'Testing every subtree separately with an in-order walk would cost O(n^2) on a long tree. Do it in **one bottom-up pass**: each subtree returns four facts to its parent: **is it a search tree**, its **smallest value**, its **largest value**, and the **sum** of its values. A node is the root of a search tree when both children are search trees, the **largest value of the left** subtree is smaller than the node, and the **smallest value of the right** subtree is larger than the node.',
        { code: 'INF = 10 ** 18\nbest = 0\ndef go(node):                          # returns (is_bst, low, high, total)\n    global best\n    if node is None:\n        return (True, INF, -INF, 0)      # empty: its low/high never block the parent\n    lok, llo, lhi, lsum = go(node.left)\n    rok, rlo, rhi, rsum = go(node.right)\n    if lok and rok and lhi < node.val < rlo:\n        total = lsum + rsum + node.val\n        best = max(best, total)\n        return (True, min(llo, node.val), max(rhi, node.val), total)\n    return (False, 0, 0, 0)            # not a search tree: so no ancestor is either' },
        'The empty subtree returns `low = +infinity` and `high = -infinity`, so the comparison with the parent always succeeds. Once a subtree is not a search tree, no subtree that contains it can be one, which is why its other numbers are not needed. Note that the best subtree can be small: a single node with a big value, in a tree full of negative numbers.'
      ]
    },
    statement: ['A binary tree is given. A subtree (a node with everything below it) may be a binary search tree: every value in its left part is smaller than the node, every value in its right part is larger, and so on for all its nodes (all values in it are different). Print the largest sum of the values of a subtree that is a binary search tree. The empty tree is a binary search tree with the sum 0, so print 0 if every such sum is negative.'],
    outputFormat: ['Print the largest sum (at least 0).'],
    examples: [{ input: '15\n1 4 3 2 4 2 5 N N N N N N 4 6\n', note: 'The subtree whose root is 3 (with the children 2 and 5, and 5 has the children 4 and 6) is a search tree with the sum 20.' }],
    hints: ['Return four facts from every subtree: is it a search tree, its smallest value, its largest value and its sum.', 'A node is a search tree root if both children are, the left maximum is smaller than the node and the right minimum is larger.', 'For an empty subtree return minimum +infinity and maximum -infinity; keep the best sum over all search-tree subtrees, starting from 0.'],
    program: treeProgram({
      includes: ['<algorithm>'],
      solution: {
        python: r`
          def max_sum_bst(root):
              INF = 10 ** 18
              best = [0]

              def go(node):
                  if node is None:
                      return (True, INF, -INF, 0)
                  lok, llo, lhi, lsum = go(node.left)
                  rok, rlo, rhi, rsum = go(node.right)
                  if lok and rok and lhi < node.val < rlo:
                      total = lsum + rsum + node.val
                      best[0] = max(best[0], total)
                      return (True, min(llo, node.val), max(rhi, node.val), total)
                  return (False, 0, 0, 0)

              go(root)
              return best[0]`,
        cpp: r`
          struct Info {
              bool ok;
              long long low, high, total;
          };

          Info go(TreeNode* node, long long& best) {
              const long long INF = 1000000000000000000LL;
              if (node == nullptr) return {true, INF, -INF, 0};
              Info l = go(node->left, best);
              Info rt = go(node->right, best);
              if (l.ok && rt.ok && l.high < node->val && node->val < rt.low) {
                  long long total = l.total + rt.total + node->val;
                  best = max(best, total);
                  return {true, min(l.low, node->val), max(rt.high, node->val), total};
              }
              return {false, 0, 0, 0};
          }

          long long maxSumBst(TreeNode* root) {
              long long best = 0;
              go(root, best);
              return best;
          }`,
        java: r`
          static long[] go(TreeNode node, long[] best) {
              long INF = 1000000000000000000L;
              if (node == null) return new long[] {1, INF, -INF, 0};
              long[] l = go(node.left, best);
              long[] rt = go(node.right, best);
              if (l[0] == 1 && rt[0] == 1 && l[2] < node.val && node.val < rt[1]) {
                  long total = l[3] + rt[3] + node.val;
                  best[0] = Math.max(best[0], total);
                  return new long[] {1, Math.min(l[1], node.val), Math.max(rt[2], node.val), total};
              }
              return new long[] {0, 0, 0, 0};
          }

          static long maxSumBst(TreeNode root) {
              long[] best = {0};
              go(root, best);
              return best[0];
          }`
      },
      stub: {
        python: r`
          def max_sum_bst(root):
              # Your code here
              return 0`,
        cpp: r`
          long long maxSumBst(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long maxSumBst(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(max_sum_bst(build_tree(vals)))', cpp: 'cout << maxSumBst(buildTree(vals)) << "\\n";', java: 'System.out.println(maxSumBst(buildTree(vals)));' }
    }),
    solution: { explanation: ['A post-order recursion returns (is a search tree, smallest, largest, sum) for every subtree; a node is a search tree when both children are and left maximum < value < right minimum. The best sum over all such nodes, starting from 0, is the answer.'], complexity: 'Time O(n), space O(h).' },
    solve(input) {
      const root = treeOfInput(input); let best = 0; const INF = Infinity;
      const go = (c) => { if (!c) return [true, INF, -INF, 0]; const l = go(c.left), rt = go(c.right); if (l[0] && rt[0] && l[2] < c.val && c.val < rt[1]) { const total = l[3] + rt[3] + c.val; best = Math.max(best, total); return [true, Math.min(l[1], c.val), Math.max(rt[2], c.val), total]; } return [false, 0, 0, 0]; };
      go(root); return String(best);
    },
    tests() {
      const g = rng(795); const out = ['15\n1 4 3 2 4 2 5 N N N N N N 4 6\n', '3\n-4 -2 -7\n', '1\n5\n', '1\n-5\n', '3\n2 1 3\n'];
      const brute = (input) => { const nodes = allNodes(treeOfInput(input)); let best = 0; for (const c of nodes) { const inord = inorder(c); if (inord.every((v, i) => i === 0 || inord[i - 1] < v)) best = Math.max(best, inord.reduce((s, v) => s + v, 0)); } return String(best); };
      crossCheck(() => treeText(randomTree(g, randInt(g, 1, 14), -6, 6)), (i) => this.solve(i), brute, 300);
      // search trees with a few values replaced, so that big search-tree subtrees stay inside
      const perturbed = (t, k, lo, hi) => { const copy = clone(t); const nodes = allNodes(copy); for (let i = 0; i < k; i++) nodes[randInt(g, 0, nodes.length - 1)].val = randInt(g, lo, hi); return copy; };
      for (const t of standardTrees(g, -10, 10).slice(1)) out.push(treeText(t));
      for (const [n, k] of [[7, 1], [31, 2], [500, 3], [5000, 5], [20000, 8]]) out.push(treeText(perturbed(randomBst(g, n, -100000, 100000), k, -100000, 100000)));
      out.push(treeText(randomBst(g, 20000, ...BIG)), treeText(perturbed(bstFromInsertions(Array.from({ length: 700 }, (_, i) => i * 3 - 1000)), 2, -1000, 1000)), treeText(perturbed(randomBst(g, 5000, -1000000, -1), 6, -1000000, 1000000)));
      return out;
    }
  },

  {
    ...hard,
    slug: 'duplicate-subtrees-count',
    title: 'How Many Subtrees Appear Twice?',
    tags: ['tree', 'hashing', 'recursion', 'serialization'],
    concept: {
      title: 'Give every distinct subtree a small number, built from the numbers of its children',
      body: [
        'Two subtrees are *equal* if they have the same shape and the same values in the same places. Count the **different** subtrees that occur **at least twice** in the tree (as subtrees of different nodes). A leaf with the value 5 is a subtree, so two leaves with the value 5 form one such pair-group.',
        'One idea is to write each subtree as a text (its serialization) and count equal texts in a dictionary. It is correct, but on a tall tree the texts are long: a path of 800 nodes gives 800 texts with 1 to 800 values, and a bigger tree makes the total length quadratic. A better way is to give each distinct subtree a **small number (id)**: the subtree of a node is described by the triple `(value, id of the left subtree, id of the right subtree)`, three numbers whatever the size. A dictionary maps each triple to its id (a new id for a new triple), and a second dictionary counts how many times each id was seen.',
        { code: 'ids, seen = {}, {}\ndef go(node):                      # returns the id of the subtree; 0 is the empty tree\n    if node is None:\n        return 0\n    key = (node.val, go(node.left), go(node.right))\n    if key not in ids:\n        ids[key] = len(ids) + 1\n    seen[ids[key]] = seen.get(ids[key], 0) + 1\n    return ids[key]\n\ngo(root)\nprint(sum(1 for c in seen.values() if c >= 2))' },
        'Equal subtrees get the same id because their children have the same ids (this is correct by induction from the leaves up). Each node costs O(1) dictionary work, so the total is O(n). This "replace a big structure by a small id" trick, also used to compare trees quickly, is called *hash consing*.'
      ]
    },
    statement: ['Two subtrees (a node with everything below it) are equal if they have the same shape and the same values at the same places. Print the number of different subtrees that occur at least twice in the tree.'],
    outputFormat: ['Print the number of such different subtrees.'],
    examples: [{ input: '10\n1 2 3 4 N 2 4 N N 4\n', note: 'The leaf 4 occurs three times and the subtree 2 with the left child 4 occurs twice: 2 different repeated subtrees.' }],
    hints: ['Describe the subtree of a node by the triple (value, id of the left subtree, id of the right subtree).', 'Keep a dictionary from triples to ids and count how often each id occurs.', 'Count the ids that occurred at least twice.'],
    program: treeProgram({
      includes: ['<map>'],
      solution: {
        python: r`
          def count_duplicates(root):
              ids = {}
              seen = {}

              def go(node):
                  if node is None:
                      return 0
                  key = (node.val, go(node.left), go(node.right))
                  if key not in ids:
                      ids[key] = len(ids) + 1
                  seen[ids[key]] = seen.get(ids[key], 0) + 1
                  return ids[key]

              go(root)
              return sum(1 for c in seen.values() if c >= 2)`,
        cpp: r`
          long long go(TreeNode* node, map<vector<long long>, long long>& ids, map<long long, long long>& seen) {
              if (node == nullptr) return 0;
              long long l = go(node->left, ids, seen);
              long long rt = go(node->right, ids, seen);
              vector<long long> key = {node->val, l, rt};
              if (!ids.count(key)) {
                  long long fresh = (long long)ids.size() + 1;
                  ids[key] = fresh;
              }
              long long id = ids[key];
              seen[id]++;
              return id;
          }

          long long countDuplicates(TreeNode* root) {
              map<vector<long long>, long long> ids;
              map<long long, long long> seen;
              go(root, ids, seen);
              long long groups = 0;
              for (const auto& entry : seen) {
                  if (entry.second >= 2) groups++;
              }
              return groups;
          }`,
        java: r`
          static long go(TreeNode node, Map<String, Long> ids, Map<Long, Long> seen) {
              if (node == null) return 0;
              long l = go(node.left, ids, seen);
              long rt = go(node.right, ids, seen);
              String key = node.val + "," + l + "," + rt;
              if (!ids.containsKey(key)) ids.put(key, (long) ids.size() + 1);
              long id = ids.get(key);
              seen.merge(id, 1L, Long::sum);
              return id;
          }

          static long countDuplicates(TreeNode root) {
              Map<String, Long> ids = new HashMap<>();
              Map<Long, Long> seen = new HashMap<>();
              go(root, ids, seen);
              long groups = 0;
              for (long c : seen.values()) {
                  if (c >= 2) groups++;
              }
              return groups;
          }`
      },
      stub: {
        python: r`
          def count_duplicates(root):
              # Your code here
              return 0`,
        cpp: r`
          long long countDuplicates(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long countDuplicates(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(count_duplicates(build_tree(vals)))', cpp: 'cout << countDuplicates(buildTree(vals)) << "\\n";', java: 'System.out.println(countDuplicates(buildTree(vals)));' }
    }),
    solution: { explanation: ['Every distinct subtree gets an id from the triple (value, left id, right id) in a dictionary; a second dictionary counts how often each id occurs, and the answer is the number of ids seen at least twice.'], complexity: 'Time O(n log n) with ordered maps (O(n) with hashing), space O(n).' },
    solve(input) {
      const root = treeOfInput(input); const ids = new Map(), seen = new Map();
      const go = (c) => { if (!c) return 0; const key = `${c.val},${go(c.left)},${go(c.right)}`; if (!ids.has(key)) ids.set(key, ids.size + 1); const id = ids.get(key); seen.set(id, (seen.get(id) || 0) + 1); return id; };
      go(root); return String([...seen.values()].filter((c) => c >= 2).length);
    },
    tests() {
      const g = rng(796); const out = ['10\n1 2 3 4 N 2 4 N N 4\n', '1\n5\n', '3\n1 1 1\n', '3\n1 2 3\n'];
      const brute = (input) => { const nodes = allNodes(treeOfInput(input)); const texts = nodes.map((c) => { const go = (x) => (x ? `(${x.val} ${go(x.left)} ${go(x.right)})` : '()'); return go(c); }); const count = new Map(); for (const t of texts) count.set(t, (count.get(t) || 0) + 1); return String([...count.values()].filter((c) => c >= 2).length); };
      crossCheck(() => treeText(randomTree(g, randInt(g, 1, 14), 1, 2)), (i) => this.solve(i), brute, 300);
      for (const t of standardTrees(g, 1, 2).slice(1)) out.push(treeText(t));
      for (const t of standardTrees(g, 0, 0).slice(1)) out.push(treeText(t));
      out.push(treeText(randomTree(g, 20000, ...BIG)), treeText(randomTree(g, 5000, -3, 3)), treeText(completeTree(g, 16383, 7, 7)));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: [...TREE_INPUT, 'The third line has the number `d`.'],
    constraints: ['1 <= number of nodes <= 20000', 'Every value is 0 (the values do not matter).', 'The height of the tree is at most 800.', '1 <= d <= 10'],
    slug: 'good-leaf-pairs',
    title: 'Pairs of Leaves That Are Close',
    tags: ['tree', 'recursion', 'tree-dp', 'counting'],
    concept: {
      title: 'Each node reports how many leaves lie at every small distance below it',
      body: [
        'A pair of leaves is *good* if the shortest road between them (in edges) is at most `d`. Count the good pairs, where a pair is counted once. Checking all pairs of leaves is too slow for 10000 leaves (5 * 10^7 pairs, each with a road to measure).',
        'The road between two leaves goes up to their **lowest common ancestor** and down again. So count each pair **at its lowest common ancestor**. For this, every node needs to know **how many leaves lie at distance 1, 2, ..., d below it**; call this list `count[i]`. A node combines the lists of its two children: a leaf at distance `i` below the left child and a leaf at distance `j` below the right child are at distance `(i + 1) + (j + 1)` from each other through this node.',
        { code: 'def go(node):                       # count[i] = number of leaves at distance i below node (0 <= i <= d)\n    if node is None:\n        return [0] * (d + 1)\n    if node.left is None and node.right is None:\n        c = [0] * (d + 1)\n        c[0] = 1                    # the leaf itself\n        return c\n    left, right = go(node.left), go(node.right)\n    for i in range(d + 1):\n        for j in range(d + 1):\n            if i + j + 2 <= d:\n                total += left[i] * right[j]   # the pairs whose road bends at this node\n    c = [0] * (d + 1)\n    for i in range(d):\n        c[i + 1] = left[i] + right[i]         # one step further from the node\n    return c' },
        'A leaf farther than `d` from a node can never form a good pair through this node or any ancestor, so the lists need only `d + 1` places, and each node costs O(d^2). With `d <= 10` this is cheap. The answer can be as big as 5 * 10^7, which still fits in 32 bits, but use 64-bit integers anyway.'
      ]
    },
    statement: ['A binary tree is given. Two different leaves form a good pair if the shortest road between them has at most `d` edges. Print the number of good pairs (a pair is counted once, whatever the order of its two leaves). The values of the nodes do not matter; they are all 0.'],
    outputFormat: ['Print the number of good pairs.'],
    examples: [{ input: '5\n0 0 0 N 0\n3\n', note: 'The leaves are the node below the left child (distance 3 to the right child, going up two edges and down one) and the right child: 1 good pair.' }],
    hints: ['Count every pair of leaves at their lowest common ancestor.', 'Let each node return a list: how many leaves are at distance 0, 1, ..., d below it.', 'At a node, a left leaf at distance i and a right leaf at distance j form a good pair if i + j + 2 <= d; then shift the combined lists by one for the parent.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'd:int'],
      solution: {
        python: r`
          def good_pairs(root, d):
              total = [0]

              def go(node):
                  if node is None:
                      return [0] * (d + 1)
                  if node.left is None and node.right is None:
                      c = [0] * (d + 1)
                      c[0] = 1
                      return c
                  left = go(node.left)
                  right = go(node.right)
                  for i in range(d + 1):
                      for j in range(d + 1):
                          if i + j + 2 <= d:
                              total[0] += left[i] * right[j]
                  c = [0] * (d + 1)
                  for i in range(d):
                      c[i + 1] = left[i] + right[i]
                  return c

              go(root)
              return total[0]`,
        cpp: r`
          vector<long long> go(TreeNode* node, int d, long long& total) {
              vector<long long> c(d + 1, 0);
              if (node == nullptr) return c;
              if (node->left == nullptr && node->right == nullptr) {
                  c[0] = 1;
                  return c;
              }
              vector<long long> left = go(node->left, d, total);
              vector<long long> right = go(node->right, d, total);
              for (int i = 0; i <= d; i++) {
                  for (int j = 0; j <= d; j++) {
                      if (i + j + 2 <= d) total += left[i] * right[j];
                  }
              }
              for (int i = 0; i < d; i++) c[i + 1] = left[i] + right[i];
              return c;
          }

          long long goodPairs(TreeNode* root, int d) {
              long long total = 0;
              go(root, d, total);
              return total;
          }`,
        java: r`
          static long[] go(TreeNode node, int d, long[] total) {
              long[] c = new long[d + 1];
              if (node == null) return c;
              if (node.left == null && node.right == null) {
                  c[0] = 1;
                  return c;
              }
              long[] left = go(node.left, d, total);
              long[] right = go(node.right, d, total);
              for (int i = 0; i <= d; i++) {
                  for (int j = 0; j <= d; j++) {
                      if (i + j + 2 <= d) total[0] += left[i] * right[j];
                  }
              }
              for (int i = 0; i < d; i++) c[i + 1] = left[i] + right[i];
              return c;
          }

          static long goodPairs(TreeNode root, int d) {
              long[] total = {0};
              go(root, d, total);
              return total[0];
          }`
      },
      stub: {
        python: r`
          def good_pairs(root, d):
              # Your code here
              return 0`,
        cpp: r`
          long long goodPairs(TreeNode* root, int d) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long goodPairs(TreeNode root, int d) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(good_pairs(build_tree(vals), d))', cpp: 'cout << goodPairs(buildTree(vals), (int)d) << "\\n";', java: 'System.out.println(goodPairs(buildTree(vals), (int) d));' }
    }),
    solution: { explanation: ['Each pair of leaves is counted at its lowest common ancestor: every node returns how many leaves lie at distances 0..d below it, combines the lists of its children to count the pairs with a road of at most d edges, and shifts the sum by one for its parent.'], complexity: 'Time O(n * d^2), space O(h * d).' },
    solve(input) {
      const { root, rest } = splitInput(input); const d = Number(rest[0]); const nodes = allNodes(root); const parent = parentsOf(root);
      const leaves = nodes.filter((c) => !c.left && !c.right); const depth = new Map([[root, 0]]); for (const c of nodes) { if (c.left) depth.set(c.left, depth.get(c) + 1); if (c.right) depth.set(c.right, depth.get(c) + 1); }
      let total = 0; const dist = (a, b) => { let x = a, y = b, steps = 0; while (x !== y) { if (depth.get(x) >= depth.get(y)) x = parent.get(x); else y = parent.get(y); steps++; } return steps; };
      // the road between two leaves is found by climbing to their lowest common ancestor; with thousands of leaves use the counting method below
      if (leaves.length <= 400) { for (let i = 0; i < leaves.length; i++) for (let j = i + 1; j < leaves.length; j++) if (dist(leaves[i], leaves[j]) <= d) total++; return String(total); }
      const go = (c) => { const arr = new Array(d + 1).fill(0); if (!c) return arr; if (!c.left && !c.right) { arr[0] = 1; return arr; } const l = go(c.left), rr = go(c.right); for (let i = 0; i <= d; i++) for (let j = 0; j <= d; j++) if (i + j + 2 <= d) total += l[i] * rr[j]; for (let i = 0; i < d; i++) arr[i + 1] = l[i] + rr[i]; return arr; };
      go(root); return String(total);
    },
    tests() {
      const g = rng(797); const out = ['5\n0 0 0 N 0\n3\n', '1\n0\n1\n', '3\n0 0 0\n2\n', '3\n0 0 0\n1\n'];
      const counting = (input) => { const { root, rest } = splitInput(input); const d = Number(rest[0]); let total = 0; const go = (c) => { const arr = new Array(d + 1).fill(0); if (!c) return arr; if (!c.left && !c.right) { arr[0] = 1; return arr; } const l = go(c.left), rr = go(c.right); for (let i = 0; i <= d; i++) for (let j = 0; j <= d; j++) if (i + j + 2 <= d) total += l[i] * rr[j]; for (let i = 0; i < d; i++) arr[i + 1] = l[i] + rr[i]; return arr; }; go(root); return String(total); };
      crossCheck(() => withLine(randomTree(g, randInt(g, 1, 40), 0, 0), randInt(g, 1, 10)), (i) => this.solve(i), counting, 300);
      for (const t of standardTrees(g, 0, 0).slice(1)) for (const d of [1, 3, 10]) out.push(withLine(t, d));
      for (const d of [2, 5, 7, 10]) out.push(withLine(randomTree(g, 20000, 0, 0), d), withLine(boundedTree(g, 20000, 20, 0, 0), d));
      return out;
    }
  },

  {
    ...hard,
    slug: 'most-frequent-subtree-sum',
    title: 'The Most Common Subtree Sum',
    tags: ['tree', 'recursion', 'hashing'],
    concept: {
      title: 'Compute every subtree sum bottom-up and count them in a dictionary',
      body: [
        'The *subtree sum* of a node is the sum of all values in its subtree: `node.val + sum(left) + sum(right)`. A tree with `n` nodes has `n` such sums, and some of them can be equal. Find the sum (or all the sums, if several are equally frequent) that occurs **most often**.',
        'A post-order recursion computes each sum from the sums of the children **once**, and a dictionary counts how many times every sum appeared. Then take the highest count and collect every sum with that count.',
        { code: 'count = {}\ndef total(node):\n    if node is None:\n        return 0\n    s = node.val + total(node.left) + total(node.right)\n    count[s] = count.get(s, 0) + 1\n    return s\n\ntotal(root)\ntop = max(count.values())\nprint(*sorted(s for s, c in count.items() if c == top))' },
        'The idea is the same as in all "bottom-up" tree problems: a function that returns the value needed by the parent and, as a side job, records something about the node. The sums can reach 2 * 10^13 in absolute value, so 64-bit integers are needed. Several sums can tie for the most common one, so the answer is a sorted list.'
      ]
    },
    statement: ['The subtree sum of a node is the sum of the values of the node and of all nodes below it. Print the subtree sum that occurs most often among all nodes of the tree. If several sums occur equally often, print all of them in increasing order, separated by spaces.'],
    outputFormat: ['The most frequent subtree sums in increasing order on one line.'],
    examples: [{ input: '3\n5 2 -3\n', note: 'The sums are 4 (root), 2 and -3; each occurs once, so all are printed: -3 2 4.' }, { input: '3\n5 2 -5\n', note: 'The sums are 2 (root), 2 and -5: the sum 2 occurs twice, so only 2 is printed.' }],
    hints: ['Compute the sum of every subtree from the sums of its children.', 'Count how many times each sum appears in a dictionary.', 'Find the largest count and print all sums with that count in increasing order.'],
    program: treeProgram({
      includes: ['<map>'],
      solution: {
        python: r`
          def frequent_sums(root):
              count = {}

              def total(node):
                  if node is None:
                      return 0
                  s = node.val + total(node.left) + total(node.right)
                  count[s] = count.get(s, 0) + 1
                  return s

              total(root)
              top = max(count.values())
              return sorted(s for s, c in count.items() if c == top)`,
        cpp: r`
          long long total(TreeNode* node, map<long long, long long>& count) {
              if (node == nullptr) return 0;
              long long s = node->val + total(node->left, count) + total(node->right, count);
              count[s]++;
              return s;
          }

          vector<long long> frequentSums(TreeNode* root) {
              map<long long, long long> count;
              total(root, count);
              long long top = 0;
              for (const auto& entry : count) top = max(top, entry.second);
              vector<long long> result;
              for (const auto& entry : count) {
                  if (entry.second == top) result.push_back(entry.first);
              }
              return result;
          }`,
        java: r`
          static long total(TreeNode node, Map<Long, Long> count) {
              if (node == null) return 0;
              long s = node.val + total(node.left, count) + total(node.right, count);
              count.merge(s, 1L, Long::sum);
              return s;
          }

          static List<Long> frequentSums(TreeNode root) {
              Map<Long, Long> count = new TreeMap<>();
              total(root, count);
              long top = 0;
              for (long c : count.values()) top = Math.max(top, c);
              List<Long> result = new ArrayList<>();
              for (Map.Entry<Long, Long> entry : count.entrySet()) {
                  if (entry.getValue() == top) result.add(entry.getKey());
              }
              return result;
          }`
      },
      stub: {
        python: r`
          def frequent_sums(root):
              # Your code here: return the sorted list of the most frequent subtree sums
              return []`,
        cpp: r`
          vector<long long> frequentSums(TreeNode* root) {
              // Your code here: return the sorted vector of the most frequent subtree sums
              return {};
          }`,
        java: r`
          static List<Long> frequentSums(TreeNode root) {
              // Your code here: return the sorted list of the most frequent subtree sums
              return new ArrayList<>();
          }`
      },
      call: {
        python: 'print(*frequent_sums(build_tree(vals)))',
        cpp: 'vector<long long> result = frequentSums(buildTree(vals));\nfor (size_t i = 0; i < result.size(); i++) cout << (i ? " " : "") << result[i];\ncout << "\\n";',
        java: 'List<Long> result = frequentSums(buildTree(vals));\nStringBuilder sb = new StringBuilder();\nfor (int i = 0; i < result.size(); i++) sb.append(i > 0 ? " " : "").append(result.get(i));\nSystem.out.println(sb);'
      }
    }),
    solution: { explanation: ['A post-order recursion computes the sum of every subtree and counts the sums in a dictionary; the sums with the highest count are printed in increasing order.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const root = treeOfInput(input); const count = new Map();
      const total = (c) => { if (!c) return 0; const s = c.val + total(c.left) + total(c.right); count.set(s, (count.get(s) || 0) + 1); return s; };
      total(root); const top = Math.max(...count.values()); return [...count].filter(([, c]) => c === top).map(([s]) => s).sort((a, b) => a - b).join(' ');
    },
    tests() {
      const g = rng(798); const out = ['3\n5 2 -3\n', '3\n5 2 -5\n', '1\n5\n', '3\n0 0 0\n'];
      for (const t of standardTrees(g, -3, 3).slice(1)) out.push(treeText(t));
      for (const t of standardTrees(g, 0, 1).slice(1)) out.push(treeText(t));
      out.push(treeText(randomTree(g, 20000, ...BIG)), treeText(completeTree(g, 4095, 1, 1)), treeText(chainTree(g, 800, 'left', -1, 1)));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: [...TREE_INPUT, 'The third line has `d`, the number of values to delete.', 'The fourth line has the `d` values to delete.'],
    constraints: ['1 <= number of nodes <= 20000', '-10^9 <= every value <= 10^9, and all values are different', 'The height of the tree is at most 800.', '1 <= d <= number of nodes; the values to delete are different and are in the tree.'],
    slug: 'delete-nodes-return-forest',
    title: 'Cut Nodes Out and List the Remaining Trees',
    tags: ['tree', 'recursion', 'forest'],
    concept: {
      title: 'A node is a new root when its parent was deleted and it was not',
      body: [
        'If some nodes are deleted from a tree, what is left is usually several separate trees, a *forest*. Every **surviving node whose parent was deleted** (or the original root, if it survives) becomes the **root** of one of the trees in the forest. Print all these trees.',
        'A single recursion over the tree can do it. The function receives the node and a flag "is the parent deleted (or is there no parent)?". It decides whether the node itself is deleted; if it is **not deleted but its parent was**, it is a new root, and it is added to the list. Then both children are processed with the flag "my deletion state", and the child links are updated: a deleted child is replaced by "nothing".',
        { code: 'def prune(node, is_root):               # is_root: no parent, or the parent was deleted\n    if node is None:\n        return None\n    deleted = node.val in gone\n    if is_root and not deleted:\n        roots.append(node)              # a new tree starts here\n    node.left = prune(node.left, deleted)\n    node.right = prune(node.right, deleted)\n    return None if deleted else node    # the parent forgets a deleted child' },
        'The roots are collected in the order in which the recursion meets them, which is the **pre-order** of the original tree. A set of the values to delete makes each test O(1). After the recursion, each root in the list is the root of a finished tree, because the links to the deleted nodes were cut on the way.'
      ]
    },
    statement: ['A binary tree with different values and a list of values are given. Delete the nodes with these values; every remaining node whose parent was deleted becomes the root of a separate tree (and the original root stays a root if it is not deleted). Print the remaining trees, one per line, each in level order in the same form as a tree in the input (`N` for a missing child, no `N` at the end). The trees are ordered by the position of their roots in the pre-order of the original tree. If no node remains, print `empty`.'],
    outputFormat: ['One line for every remaining tree, or `empty`.'],
    examples: [{ input: '7\n1 2 3 4 5 6 7\n2\n3 5\n', note: 'Deleting 3 and 5 leaves the trees 1 2 N 4 (the root 1 with the child 2 whose child is 4), 6 and 7.' }],
    hints: ['Put the values to delete into a set.', 'Recurse with a flag that tells whether the parent was deleted; a surviving node with such a parent is a new root.', 'Return nothing for a deleted node so that its parent drops the link; print the roots in the order they were found.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'd:int', 'gone:int[d]'],
      includes: ['<unordered_set>'],
      solution: {
        python: r`
          def delete_nodes(root, to_delete):
              gone = set(to_delete)
              roots = []

              def prune(node, is_root):
                  if node is None:
                      return None
                  deleted = node.val in gone
                  if is_root and not deleted:
                      roots.append(node)
                  node.left = prune(node.left, deleted)
                  node.right = prune(node.right, deleted)
                  return None if deleted else node

              prune(root, True)
              return roots`,
        cpp: r`
          TreeNode* prune(TreeNode* node, bool isRoot, const unordered_set<long long>& gone, vector<TreeNode*>& roots) {
              if (node == nullptr) return nullptr;
              bool deleted = gone.count(node->val) > 0;
              if (isRoot && !deleted) roots.push_back(node);
              node->left = prune(node->left, deleted, gone, roots);
              node->right = prune(node->right, deleted, gone, roots);
              return deleted ? nullptr : node;
          }

          vector<TreeNode*> deleteNodes(TreeNode* root, const vector<long long>& toDelete) {
              unordered_set<long long> gone(toDelete.begin(), toDelete.end());
              vector<TreeNode*> roots;
              prune(root, true, gone, roots);
              return roots;
          }`,
        java: r`
          static TreeNode prune(TreeNode node, boolean isRoot, Set<Long> gone, List<TreeNode> roots) {
              if (node == null) return null;
              boolean deleted = gone.contains(node.val);
              if (isRoot && !deleted) roots.add(node);
              node.left = prune(node.left, deleted, gone, roots);
              node.right = prune(node.right, deleted, gone, roots);
              return deleted ? null : node;
          }

          static List<TreeNode> deleteNodes(TreeNode root, long[] toDelete) {
              Set<Long> gone = new HashSet<>();
              for (long v : toDelete) gone.add(v);
              List<TreeNode> roots = new ArrayList<>();
              prune(root, true, gone, roots);
              return roots;
          }`
      },
      stub: {
        python: r`
          def delete_nodes(root, to_delete):
              # Your code here: return the list of the roots of the remaining trees, in pre-order of the original tree
              return []`,
        cpp: r`
          vector<TreeNode*> deleteNodes(TreeNode* root, const vector<long long>& toDelete) {
              // Your code here: return the roots of the remaining trees, in pre-order of the original tree
              return {};
          }`,
        java: r`
          static List<TreeNode> deleteNodes(TreeNode root, long[] toDelete) {
              // Your code here: return the roots of the remaining trees, in pre-order of the original tree
              return new ArrayList<>();
          }`
      },
      call: {
        python: 'roots = delete_nodes(build_tree(vals), gone)\nif not roots:\n    print("empty")\nfor root in roots:\n    print_tree(root)',
        cpp: 'vector<TreeNode*> roots = deleteNodes(buildTree(vals), gone);\nif (roots.empty()) cout << "empty\\n";\nfor (TreeNode* root : roots) printTree(root);',
        java: 'List<TreeNode> roots = deleteNodes(buildTree(vals), gone);\nif (roots.isEmpty()) System.out.println("empty");\nfor (TreeNode root : roots) printTree(root);'
      }
    }),
    solution: { explanation: ['A recursion with the flag "the parent was deleted or does not exist" adds every surviving node with such a parent to the list of roots, and returns nothing for a deleted node so that its parent drops the link.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const { root, rest } = splitInput(input); const gone = new Set(nums(rest[1])); const roots = [];
      const prune = (c, isRoot) => { if (!c) return null; const deleted = gone.has(c.val); if (isRoot && !deleted) roots.push(c); c.left = prune(c.left, deleted); c.right = prune(c.right, deleted); return deleted ? null : c; };
      prune(root, true); return roots.length ? roots.map((x) => show(x)).join('\n') : 'empty';
    },
    tests() {
      const g = rng(799); const out = ['7\n1 2 3 4 5 6 7\n2\n3 5\n', '1\n5\n1\n5\n', '3\n1 2 3\n3\n1 2 3\n', '3\n1 2 3\n1\n1\n'];
      for (const t of distinctTrees(g).slice(1)) {
        const values = allNodes(t).map((c) => c.val); const n = values.length; const pick = (k) => shuffle(g, values.slice()).slice(0, Math.max(1, Math.min(n, k)));
        const sets = n <= 600 ? [pick(1), pick(Math.floor(n / 10)), pick(Math.floor(n / 2)), pick(n)] : [pick(Math.floor(n / 20)), pick(Math.floor(n / 2))];
        for (const s of sets) out.push(`${treeText(t)}${s.length}\n${s.join(' ')}\n`);
      }
      return out;
    }
  }
];
