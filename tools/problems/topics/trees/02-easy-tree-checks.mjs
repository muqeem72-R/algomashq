import { r, rng, randInt } from '../../lib.mjs';
import { treeProgram } from '../../scaffolds.mjs';
import { node, treeText, treeOfInput, twoTreesOfInput, twoTreesText, standardTrees, randomTree, completeTree, chainTree, clone, mirror, allNodes, leafValues, treeWithLeaves, toTokens, levels, height } from '../../treelib.mjs';

const TREE_INPUT = ['The first line has `t`, the number of words in the description of the tree.', 'The second line has the tree in level order: the root first, then the children of the nodes row by row from left to right. `N` stands for a missing child. There is no `N` at the end.'];
const TWO_INPUT = ['The first two lines describe the first tree and the next two lines describe the second tree. A tree is described by a line with the number of words `t`, and a line with the tree in level order (the root first, then the children row by row from left to right, `N` for a missing child, no `N` at the end).'];
const LIMITS = ['1 <= number of nodes <= 20000 (in each tree)', '-10^9 <= every value <= 10^9', 'The height of a tree is at most 800.'];
const common = { difficulty: 'easy', inputFormat: TREE_INPUT, constraints: LIMITS };
const two = { difficulty: 'easy', inputFormat: TWO_INPUT, constraints: LIMITS };
const TWO_IO = ['t:int', 'a:word[t]', 'u:int', 'b:word[u]'];
const YES_NO = ['Print `yes` or `no`.'];

// The pieces of the tests: copies that are changed a little.
const changeValue = (root, g) => { const copy = clone(root); const nodes = allNodes(copy); nodes[randInt(g, 0, nodes.length - 1)].val += 1; return copy; };
const dropLeaf = (root, g) => { const copy = clone(root); const leaves = allNodes(copy).filter((c) => !c.left && !c.right); if (allNodes(copy).length < 2) return copy; const victim = leaves[randInt(g, 0, leaves.length - 1)]; for (const c of allNodes(copy)) { if (c.left === victim) c.left = null; else if (c.right === victim) c.right = null; } return copy; };
const sameTree = (a, b) => { if (!a || !b) return a === b; return a.val === b.val && sameTree(a.left, b.left) && sameTree(a.right, b.right); };
const same = (a, b) => (sameTree(a, b) ? 'yes' : 'no');
const bigRange = [-1000000000, 1000000000];

export default [
  {
    ...two,
    slug: 'same-tree',
    title: 'Are the Two Trees the Same?',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'Walk two trees at the same time',
      body: [
        'Two trees are the same if they have the same **shape** and the same **values**. Compare them from the roots down: two empty trees are the same; an empty tree and a non-empty one are different; two non-empty trees are the same when the roots have equal values **and** the left subtrees are the same **and** the right subtrees are the same.',
        { code: 'def same(a, b):\n    if a is None and b is None:\n        return True\n    if a is None or b is None:\n        return False                         # one tree ends here, the other does not\n    return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)' },
        'The function walks both trees in step. Because `and` stops at the first false, the walk ends as soon as a difference is found. The order of the checks matters: first handle the empty cases, and only then read `a.val` and `b.val`.'
      ]
    },
    statement: ['Two binary trees are the same if they have the same shape and the nodes at the same places have the same values. Decide whether the two given trees are the same.'],
    outputFormat: YES_NO,
    examples: [{ input: '3\n1 2 3\n3\n1 2 3\n', note: 'Both trees have the root 1 with the children 2 and 3.' }, { input: '3\n1 2 N\n3\n1 N 2\n', note: 'The value 2 is a left child in the first tree and a right child in the second one: different shapes.' }],
    hints: ['Two empty trees are the same.', 'If only one of the two is empty, they are different.', 'Otherwise the values of the roots must be equal and both pairs of subtrees must be the same.'],
    program: treeProgram({
      io: TWO_IO,
      solution: {
        python: r`
          def same(a, b):
              if a is None and b is None:
                  return True
              if a is None or b is None:
                  return False
              return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)`,
        cpp: r`
          bool same(TreeNode* a, TreeNode* b) {
              if (a == nullptr && b == nullptr) return true;
              if (a == nullptr || b == nullptr) return false;
              return a->val == b->val && same(a->left, b->left) && same(a->right, b->right);
          }`,
        java: r`
          static boolean same(TreeNode a, TreeNode b) {
              if (a == null && b == null) return true;
              if (a == null || b == null) return false;
              return a.val == b.val && same(a.left, b.left) && same(a.right, b.right);
          }`
      },
      stub: {
        python: r`
          def same(a, b):
              # Your code here
              return False`,
        cpp: r`
          bool same(TreeNode* a, TreeNode* b) {
              // Your code here
              return false;
          }`,
        java: r`
          static boolean same(TreeNode a, TreeNode b) {
              // Your code here
              return false;
          }`
      },
      call: { python: 'print("yes" if same(build_tree(a), build_tree(b)) else "no")', cpp: 'cout << (same(buildTree(a), buildTree(b)) ? "yes" : "no") << "\\n";', java: 'System.out.println(same(buildTree(a), buildTree(b)) ? "yes" : "no");' }
    }),
    solution: { explanation: ['Both trees are walked together: equal emptiness, equal root values, and the same left and right subtrees.'], complexity: 'Time O(min(n, m)), space O(h).' },
    solve(input) { const [a, b] = twoTreesOfInput(input); return same(a, b); },
    tests() {
      const g = rng(711); const trees = standardTrees(g, ...bigRange); const out = ['3\n1 2 3\n3\n1 2 3\n', '1\n5\n1\n6\n', '3\n1 2 N\n3\n1 N 2\n'];
      for (const t of trees.slice(1)) out.push(twoTreesText(t, clone(t)));
      for (const t of [trees[3], trees[4], trees[5], trees[7], trees[10]]) { out.push(twoTreesText(t, changeValue(t, g))); out.push(twoTreesText(t, dropLeaf(t, g))); }
      out.push(twoTreesText(trees[5], trees[6]), twoTreesText(trees[4], mirror(trees[4])));
      return out;
    }
  },

  {
    ...common,
    slug: 'symmetric-tree',
    title: 'Is the Tree a Mirror of Itself?',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'Compare the left subtree with the mirror image of the right one',
      body: [
        'A tree is **symmetric** if its left half is the mirror image of its right half. Define the helper "are these two trees mirror images of each other?": two empty trees are mirrors; if only one is empty they are not; otherwise the roots must have equal values, the **left of the first** must mirror the **right of the second**, and the **right of the first** must mirror the **left of the second**.',
        { code: 'def mirror(a, b):\n    if a is None and b is None:\n        return True\n    if a is None or b is None:\n        return False\n    return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)\n\n# the whole tree is symmetric when its two halves are mirrors\n# mirror(root.left, root.right)' },
        'This is the "same tree" check with the children **crossed**. A tree with only a root is symmetric; a root with exactly one child is not.'
      ]
    },
    statement: ['A binary tree is symmetric if its left subtree is the mirror image of its right subtree (the same shape with left and right swapped, and the same values at the matching places). Decide whether the given tree is symmetric.'],
    outputFormat: YES_NO,
    examples: [{ input: '7\n1 2 2 3 4 4 3\n', note: 'The left half (2 with 3, 4) mirrors the right half (2 with 4, 3).' }, { input: '5\n1 2 2 N 3\n', note: 'Both halves have only a right child: not mirror images.' }],
    hints: ['Write a helper that tests whether two trees are mirror images of each other.', 'The left child of the first must match the right child of the second, and the other way round.', 'The tree is symmetric when its left and right subtrees are mirror images.'],
    program: treeProgram({
      solution: {
        python: r`
          def is_mirror(a, b):
              if a is None and b is None:
                  return True
              if a is None or b is None:
                  return False
              return a.val == b.val and is_mirror(a.left, b.right) and is_mirror(a.right, b.left)

          def symmetric(root):
              return root is None or is_mirror(root.left, root.right)`,
        cpp: r`
          bool isMirror(TreeNode* a, TreeNode* b) {
              if (a == nullptr && b == nullptr) return true;
              if (a == nullptr || b == nullptr) return false;
              return a->val == b->val && isMirror(a->left, b->right) && isMirror(a->right, b->left);
          }

          bool symmetric(TreeNode* root) {
              return root == nullptr || isMirror(root->left, root->right);
          }`,
        java: r`
          static boolean isMirror(TreeNode a, TreeNode b) {
              if (a == null && b == null) return true;
              if (a == null || b == null) return false;
              return a.val == b.val && isMirror(a.left, b.right) && isMirror(a.right, b.left);
          }

          static boolean symmetric(TreeNode root) {
              return root == null || isMirror(root.left, root.right);
          }`
      },
      stub: {
        python: r`
          def symmetric(root):
              # Your code here
              return False`,
        cpp: r`
          bool symmetric(TreeNode* root) {
              // Your code here
              return false;
          }`,
        java: r`
          static boolean symmetric(TreeNode root) {
              // Your code here
              return false;
          }`
      },
      call: { python: 'print("yes" if symmetric(build_tree(vals)) else "no")', cpp: 'cout << (symmetric(buildTree(vals)) ? "yes" : "no") << "\\n";', java: 'System.out.println(symmetric(buildTree(vals)) ? "yes" : "no");' }
    }),
    solution: { explanation: ['The two halves of the root are compared with a helper that crosses the children: left of one against right of the other.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { const root = treeOfInput(input); return !root || sameTree(root.left, mirror(root.right)) ? 'yes' : 'no'; },
    tests() {
      const g = rng(712); const half = (n) => randomTree(g, n, ...bigRange); const sym = (n) => { const l = half(n); return node(randInt(g, ...bigRange), l, mirror(l)); };
      const out = ['7\n1 2 2 3 4 4 3\n', '5\n1 2 2 N 3\n', '1\n7\n', '2\n1 2\n'];
      for (const n of [1, 2, 6, 40, 700, 9000]) out.push(treeText(sym(n)));
      for (const n of [3, 40, 700, 9000]) { const t = sym(n); const nodes = allNodes(t); nodes[randInt(g, 1, nodes.length - 1)].val += 1; out.push(treeText(t)); }
      out.push(treeText(completeTree(g, 4095, 5, 5)), treeText(completeTree(g, 4095, ...bigRange)), treeText(chainTree(g, 800, 'left')), treeText(node(1, chainTree(g, 399, 'left', 1, 1), chainTree(g, 399, 'right', 1, 1))));
      return out;
    }
  },

  {
    ...common,
    slug: 'invert-a-tree',
    title: 'Swap Left and Right Everywhere',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'Change the tree itself, and return its root',
      body: [
        'So far the functions only **read** the tree. This one **changes** it: every node swaps its left and right child. A recursive function can do it in the usual way: invert the left subtree, invert the right subtree, and swap the two results at the root.',
        { code: 'def invert(root):\n    if root is None:\n        return None\n    left = invert(root.left)\n    right = invert(root.right)\n    root.left = right\n    root.right = left\n    return root                    # the same root, now with swapped children' },
        'Returning the root makes the function easy to use and also lets it handle the empty tree. The result is the **mirror image** of the tree. Remember: you modify the nodes that the starter code built, so the printed tree is the inverted one.'
      ]
    },
    statement: ['Invert a binary tree: swap the left and right children of every node. Print the inverted tree in level order in the same form as the input (`N` for a missing child, no `N` at the end).'],
    outputFormat: ['The inverted tree in level order on one line.'],
    examples: [{ input: '7\n4 2 7 1 3 6 9\n', note: 'The result is 4 7 2 9 6 3 1.' }],
    hints: ['Swap the two children of every node.', 'Invert both subtrees first (or after), then swap.', 'Return the root so the caller can print the tree.'],
    program: treeProgram({
      solution: {
        python: r`
          def invert(root):
              if root is None:
                  return None
              left = invert(root.left)
              right = invert(root.right)
              root.left = right
              root.right = left
              return root`,
        cpp: r`
          TreeNode* invert(TreeNode* root) {
              if (root == nullptr) return nullptr;
              TreeNode* left = invert(root->left);
              TreeNode* right = invert(root->right);
              root->left = right;
              root->right = left;
              return root;
          }`,
        java: r`
          static TreeNode invert(TreeNode root) {
              if (root == null) return null;
              TreeNode left = invert(root.left);
              TreeNode right = invert(root.right);
              root.left = right;
              root.right = left;
              return root;
          }`
      },
      stub: {
        python: r`
          def invert(root):
              # Your code here
              return root`,
        cpp: r`
          TreeNode* invert(TreeNode* root) {
              // Your code here
              return root;
          }`,
        java: r`
          static TreeNode invert(TreeNode root) {
              // Your code here
              return root;
          }`
      },
      call: { python: 'print_tree(invert(build_tree(vals)))', cpp: 'printTree(invert(buildTree(vals)));', java: 'printTree(invert(buildTree(vals)));' }
    }),
    solution: { explanation: ['Each call inverts its two subtrees and then stores them swapped, so every node ends up with its children exchanged.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { return toTokens(mirror(treeOfInput(input))).join(' '); },
    tests() { const g = rng(713); return ['7\n4 2 7 1 3 6 9\n', '1\n5\n', '2\n1 2\n', ...standardTrees(g, ...bigRange).map(treeText)]; }
  },

  {
    ...common,
    slug: 'root-to-leaf-sum-exists',
    title: 'A Road Down With a Given Sum',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'Hand the rest of the target down the tree',
      body: [
        'Is there a road from the root down to a **leaf** whose values add up to a given number `target`? Instead of adding values on the way down and comparing at the end, **subtract** each value from the target: at a node with value `v`, the rest of the road must add up to `target - v`. At a leaf the road is complete, and it is a good road exactly when the remaining target equals the value of the leaf.',
        { code: 'def has_path_sum(root, target):\n    if root is None:\n        return False\n    if root.left is None and root.right is None:\n        return root.val == target                 # a leaf: the road ends here\n    rest = target - root.val\n    return has_path_sum(root.left, rest) or has_path_sum(root.right, rest)' },
        'Passing the changed target as an **argument** is a common way to carry information down a tree; nothing has to be undone afterwards. The road must end at a **leaf**: a node with one child is not the end of a road. The values can be negative, so you cannot stop early when the remaining target becomes negative.'
      ]
    },
    statement: ['Given a binary tree and a number `target`, decide whether there is a road from the root down to a leaf (a node without children) such that the sum of the values of the nodes on the road equals `target`.'],
    inputFormat: [...TREE_INPUT, 'The third line has `target`.'],
    outputFormat: YES_NO,
    constraints: [...LIMITS, '-10^12 <= target <= 10^12'],
    examples: [{ input: '9\n5 4 8 11 N 13 4 7 2\n22\n', note: 'The road 5 - 4 - 11 - 2 has the sum 22.' }],
    hints: ['At a leaf, compare the remaining target with the value of the leaf.', 'At other nodes, subtract the value and ask both children.', 'Do not accept a road that ends in a node with only one child.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'target:int'],
      solution: {
        python: r`
          def has_path_sum(root, target):
              if root is None:
                  return False
              if root.left is None and root.right is None:
                  return root.val == target
              rest = target - root.val
              return has_path_sum(root.left, rest) or has_path_sum(root.right, rest)`,
        cpp: r`
          bool hasPathSum(TreeNode* root, long long target) {
              if (root == nullptr) return false;
              if (root->left == nullptr && root->right == nullptr) return root->val == target;
              long long rest = target - root->val;
              return hasPathSum(root->left, rest) || hasPathSum(root->right, rest);
          }`,
        java: r`
          static boolean hasPathSum(TreeNode root, long target) {
              if (root == null) return false;
              if (root.left == null && root.right == null) return root.val == target;
              long rest = target - root.val;
              return hasPathSum(root.left, rest) || hasPathSum(root.right, rest);
          }`
      },
      stub: {
        python: r`
          def has_path_sum(root, target):
              # Your code here
              return False`,
        cpp: r`
          bool hasPathSum(TreeNode* root, long long target) {
              // Your code here
              return false;
          }`,
        java: r`
          static boolean hasPathSum(TreeNode root, long target) {
              // Your code here
              return false;
          }`
      },
      call: { python: 'print("yes" if has_path_sum(build_tree(vals), target) else "no")', cpp: 'cout << (hasPathSum(buildTree(vals), target) ? "yes" : "no") << "\\n";', java: 'System.out.println(hasPathSum(buildTree(vals), target) ? "yes" : "no");' }
    }),
    solution: { explanation: ['The target shrinks by the value of each node on the way down; at a leaf the road is good when the leaf value equals what is left.'], complexity: 'Time O(n), space O(h).' },
    solve(input) {
      const rs = input.replace(/\n$/, '').split('\n'); const root = treeOfInput(rs.slice(0, 2).join('\n') + '\n'); const target = Number(rs[2]);
      const go = (c, rest) => { if (!c) return false; if (!c.left && !c.right) return c.val === rest; return go(c.left, rest - c.val) || go(c.right, rest - c.val); };
      return go(root, target) ? 'yes' : 'no';
    },
    tests() {
      const g = rng(714); const out = ['9\n5 4 8 11 N 13 4 7 2\n22\n', '1\n5\n5\n', '1\n5\n6\n', '2\n1 2\n1\n', '2\n1 2\n3\n'];
      const leafSums = (root) => { const sums = []; const go = (c, s) => { if (!c) return; if (!c.left && !c.right) sums.push(s + c.val); go(c.left, s + c.val); go(c.right, s + c.val); }; go(root, 0); return sums; };
      for (const t of standardTrees(g, -1000000000, 1000000000).slice(2)) { const sums = leafSums(t); out.push(`${treeText(t)}${sums[randInt(g, 0, sums.length - 1)]}\n`, `${treeText(t)}${sums[randInt(g, 0, sums.length - 1)] + 1}\n`); }
      return out;
    }
  },

  {
    ...common,
    slug: 'height-balanced-tree',
    title: 'Is the Tree Balanced?',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'Return the height, and use a special value for "not balanced"',
      body: [
        'A tree is **height balanced** if at **every** node the heights of the left and right subtrees differ by at most 1. A first idea is to compute the height of both subtrees at every node, but this walks the same parts of the tree again and again (O(n^2) for a path). Better: let one recursive function return the **height**, and a special value (here `-1`) when it finds that a subtree is **not** balanced. The problem is then solved in one pass, in post-order.',
        { code: 'def check(root):                         # the height, or -1 if not balanced\n    if root is None:\n        return 0\n    left = check(root.left)\n    if left == -1:\n        return -1\n    right = check(root.right)\n    if right == -1 or abs(left - right) > 1:\n        return -1\n    return 1 + max(left, right)' },
        'The answer is `check(root) != -1`. Returning "failure" as a special value that the callers pass up is a convenient way to stop a deep recursion early. The special value must not be a possible real height: heights are never negative.'
      ]
    },
    statement: ['A binary tree is height balanced if, for every node, the heights of its left and right subtrees differ by at most 1. Decide whether the given tree is height balanced.'],
    outputFormat: YES_NO,
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'At every node the two heights differ by at most 1.' }, { input: '9\n1 2 2 3 3 N N 4 4\n', note: 'The left subtree of the root is too deep compared with the right one.' }],
    hints: ['Compute heights from the bottom up (post-order).', 'Return a special value such as -1 when a subtree is unbalanced.', 'Check the difference of the two heights at every node.'],
    program: treeProgram({
      solution: {
        python: r`
          def check(root):
              if root is None:
                  return 0
              left = check(root.left)
              if left == -1:
                  return -1
              right = check(root.right)
              if right == -1 or abs(left - right) > 1:
                  return -1
              return 1 + max(left, right)`,
        cpp: r`
          int check(TreeNode* root) {
              if (root == nullptr) return 0;
              int left = check(root->left);
              if (left == -1) return -1;
              int right = check(root->right);
              if (right == -1 || abs(left - right) > 1) return -1;
              return 1 + max(left, right);
          }`,
        java: r`
          static int check(TreeNode root) {
              if (root == null) return 0;
              int left = check(root.left);
              if (left == -1) return -1;
              int right = check(root.right);
              if (right == -1 || Math.abs(left - right) > 1) return -1;
              return 1 + Math.max(left, right);
          }`
      },
      stub: {
        python: r`
          def check(root):
              # Your code here: return the height, or -1 if the tree is not balanced
              return 0`,
        cpp: r`
          int check(TreeNode* root) {
              // Your code here: return the height, or -1 if the tree is not balanced
              return 0;
          }`,
        java: r`
          static int check(TreeNode root) {
              // Your code here: return the height, or -1 if the tree is not balanced
              return 0;
          }`
      },
      call: { python: 'print("yes" if check(build_tree(vals)) != -1 else "no")', cpp: 'cout << (check(buildTree(vals)) != -1 ? "yes" : "no") << "\\n";', java: 'System.out.println(check(buildTree(vals)) != -1 ? "yes" : "no");' },
      includes: ['<algorithm>', '<cstdlib>']
    }),
    solution: { explanation: ['One post-order pass returns the height of each subtree, or -1 as soon as some node has subtrees whose heights differ by more than 1.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { const root = treeOfInput(input); const bal = (c) => { if (!c) return true; return Math.abs(height(c.left) - height(c.right)) <= 1 && bal(c.left) && bal(c.right); }; return bal(root) ? 'yes' : 'no'; },
    tests() {
      const g = rng(715); const out = ['7\n3 9 20 N N 15 7\n', '9\n1 2 2 3 3 N N 4 4\n', '1\n5\n', '2\n1 2\n', '3\n1 2 3\n'];
      const balancedSorted = (n) => { const values = Array.from({ length: n }, (_, i) => i); const build = (lo, hi) => (lo > hi ? null : (() => { const mid = (lo + hi) >> 1; return node(values[mid] * 3 - 1000, build(lo, mid - 1), build(mid + 1, hi)); })()); return build(0, n - 1); };
      for (const t of standardTrees(g, ...bigRange)) out.push(treeText(t));
      for (const n of [10, 100, 1000, 20000]) out.push(treeText(balancedSorted(n)));
      const broken = balancedSorted(1000); let cur = broken; while (cur.left) cur = cur.left; cur.left = chainTree(g, 5, 'left'); out.push(treeText(broken));
      return out;
    }
  },

  {
    ...common,
    slug: 'sum-of-left-leaves',
    title: 'The Sum of the Left Leaves',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'Tell the child whether it is a left child',
      body: [
        'A **left leaf** is a leaf that is the **left** child of its parent. The root is never a left leaf (it has no parent). When a function looks at a node, it does not know whether the node is a left or right child, unless the **caller tells it**. The simplest way is to check at the parent: when the left child is a leaf, add its value; otherwise recurse into it.',
        { code: 'def left_leaves(root):\n    if root is None:\n        return 0\n    total = 0\n    child = root.left\n    if child is not None and child.left is None and child.right is None:\n        total += child.val                   # a leaf on the left\n    else:\n        total += left_leaves(child)          # look inside the left subtree\n    return total + left_leaves(root.right)' },
        'Another way is a flag argument: `walk(node, is_left)`. In both versions the decision uses the **position** of the node, which is a fact about the parent-child link and not about the node alone.'
      ]
    },
    statement: ['Print the sum of the values of all left leaves of a binary tree: leaves (nodes without children) that are the left child of their parent.'],
    outputFormat: ['Print the sum (0 if there is no left leaf).'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'The left leaves are 9 and 15: 9 + 15 = 24.' }],
    hints: ['A left leaf is recognised from its parent: the left child exists and has no children.', 'If the left child is not a leaf, search inside it.', 'Always search the right subtree as well.'],
    program: treeProgram({
      solution: {
        python: r`
          def left_leaves(root):
              if root is None:
                  return 0
              total = 0
              child = root.left
              if child is not None and child.left is None and child.right is None:
                  total += child.val
              else:
                  total += left_leaves(child)
              return total + left_leaves(root.right)`,
        cpp: r`
          long long leftLeaves(TreeNode* root) {
              if (root == nullptr) return 0;
              long long total = 0;
              TreeNode* child = root->left;
              if (child != nullptr && child->left == nullptr && child->right == nullptr) total += child->val;
              else total += leftLeaves(child);
              return total + leftLeaves(root->right);
          }`,
        java: r`
          static long leftLeaves(TreeNode root) {
              if (root == null) return 0;
              long total = 0;
              TreeNode child = root.left;
              if (child != null && child.left == null && child.right == null) total += child.val;
              else total += leftLeaves(child);
              return total + leftLeaves(root.right);
          }`
      },
      stub: {
        python: r`
          def left_leaves(root):
              # Your code here
              return 0`,
        cpp: r`
          long long leftLeaves(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long leftLeaves(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(left_leaves(build_tree(vals)))', cpp: 'cout << leftLeaves(buildTree(vals)) << "\\n";', java: 'System.out.println(leftLeaves(buildTree(vals)));' }
    }),
    solution: { explanation: ['At every node the left child is added when it is a leaf, otherwise it is searched; the right child is always searched.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { const root = treeOfInput(input); let total = 0; for (const c of allNodes(root)) if (c.left && !c.left.left && !c.left.right) total += c.left.val; return String(total); },
    tests() { const g = rng(716); return ['7\n3 9 20 N N 15 7\n', '1\n5\n', '3\n1 N 2\n', '2\n1 2\n', ...standardTrees(g, ...bigRange).map(treeText)]; }
  },

  {
    ...common,
    slug: 'level-with-largest-sum',
    title: 'The Heaviest Level',
    tags: ['tree', 'bfs', 'level-order'],
    concept: {
      title: 'Sum the values of each level',
      body: [
        'Level order gives the nodes row by row. For each row add up the values, remember the **largest sum** and the **number of the row** where it was found. Rows are numbered from 1 at the root. When two rows have the same largest sum, the question asks for the **smallest** row number, so only replace the best row when the new sum is **strictly larger**.',
        { code: 'best_sum = None\nbest_level = 0\nlevel = 0\nrow = [root]\nwhile row:\n    level += 1\n    total = sum(node.val for node in row)\n    if best_sum is None or total > best_sum:     # strictly larger keeps the earlier level on ties\n        best_sum, best_level = total, level\n    row = [child for node in row for child in (node.left, node.right) if child is not None]' },
        'The values can be negative, so the first row must not be compared with 0: start with "no best yet". The list comprehension builds the next row from the children of the current row.'
      ]
    },
    statement: ['The root of a binary tree is at level 1, its children are at level 2, and so on. Print the smallest level number whose values have the largest sum.'],
    outputFormat: ['Print the level number.'],
    examples: [{ input: '7\n1 7 0 7 -8 N N\n', note: 'The level sums are 1, 7, -1: level 2 has the largest sum.' }],
    hints: ['Process the tree row by row and add the values of each row.', 'Do not start the best sum at 0: sums can be negative.', 'Replace the best level only when a sum is strictly larger.'],
    program: treeProgram({
      solution: {
        python: r`
          def best_level(root):
              best_sum = None
              best = 0
              level = 0
              row = [root]
              while row:
                  level += 1
                  total = sum(node.val for node in row)
                  if best_sum is None or total > best_sum:
                      best_sum, best = total, level
                  row = [child for node in row for child in (node.left, node.right) if child is not None]
              return best`,
        cpp: r`
          int bestLevel(TreeNode* root) {
              vector<TreeNode*> row = {root};
              bool first = true;
              long long bestSum = 0;
              int best = 0, level = 0;
              while (!row.empty()) {
                  level++;
                  long long total = 0;
                  vector<TreeNode*> next;
                  for (TreeNode* node : row) {
                      total += node->val;
                      if (node->left) next.push_back(node->left);
                      if (node->right) next.push_back(node->right);
                  }
                  if (first || total > bestSum) {
                      first = false;
                      bestSum = total;
                      best = level;
                  }
                  row = next;
              }
              return best;
          }`,
        java: r`
          static int bestLevel(TreeNode root) {
              List<TreeNode> row = new ArrayList<>();
              row.add(root);
              boolean first = true;
              long bestSum = 0;
              int best = 0, level = 0;
              while (!row.isEmpty()) {
                  level++;
                  long total = 0;
                  List<TreeNode> next = new ArrayList<>();
                  for (TreeNode node : row) {
                      total += node.val;
                      if (node.left != null) next.add(node.left);
                      if (node.right != null) next.add(node.right);
                  }
                  if (first || total > bestSum) {
                      first = false;
                      bestSum = total;
                      best = level;
                  }
                  row = next;
              }
              return best;
          }`
      },
      stub: {
        python: r`
          def best_level(root):
              # Your code here
              return 0`,
        cpp: r`
          int bestLevel(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static int bestLevel(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(best_level(build_tree(vals)))', cpp: 'cout << bestLevel(buildTree(vals)) << "\\n";', java: 'System.out.println(bestLevel(buildTree(vals)));' }
    }),
    solution: { explanation: ['The tree is processed one level at a time; each level sum is compared with the best so far and replaces it only when strictly larger, so the smallest level wins ties.'], complexity: 'Time O(n), space O(width).' },
    solve(input) { const rowsOfTree = levels(treeOfInput(input)); let best = 0, bestSum = null; rowsOfTree.forEach((row, i) => { const s = row.reduce((a, b) => a + b, 0); if (bestSum === null || s > bestSum) { bestSum = s; best = i + 1; } }); return String(best); },
    tests() { const g = rng(717); return ['7\n1 7 0 7 -8 N N\n', '1\n-5\n', '3\n1 -2 -2\n', ...standardTrees(g, -1000000000, 1000000000).map(treeText), treeText(completeTree(g, 4095, 5, 5)), treeText(completeTree(g, 1023, -1, -1))]; }
  },

  {
    ...two,
    slug: 'leaf-similar-trees',
    title: 'Trees With the Same Leaves',
    tags: ['tree', 'recursion', 'traversal'],
    concept: {
      title: 'Collect the leaves in order and compare the lists',
      body: [
        'Two trees can have a very different shape and still carry the same **leaf sequence**: the values of their leaves read from left to right. To compare, collect the leaves of each tree with a depth-first walk that visits the left subtree before the right one, and compare the two lists.',
        { code: 'def leaves(root, out):\n    if root is None:\n        return\n    if root.left is None and root.right is None:\n        out.append(root.val)               # a leaf, in left-to-right order\n    leaves(root.left, out)\n    leaves(root.right, out)\n\n# leaf-similar when the two lists are equal' },
        'In every depth-first order that goes left before right (pre-, in- or post-order), the leaves come out in the same left-to-right order, so any of them can be used. Comparing two lists is a plain equality check.'
      ]
    },
    statement: ['The leaf sequence of a binary tree is the list of the values of its leaves (nodes without children) from left to right. Decide whether the two given trees have the same leaf sequence.'],
    outputFormat: YES_NO,
    examples: [{ input: '11\n3 5 1 6 2 9 8 N N 7 4\n15\n3 5 1 6 7 4 2 N N N N N N 9 8\n', note: 'Both trees have the leaves 6, 7, 4, 9, 8 in this order, although their shapes differ.' }],
    hints: ['Collect the leaf values of a tree into a list, visiting the left subtree before the right one.', 'Do this for both trees.', 'The answer is yes when the two lists are equal.'],
    program: treeProgram({
      io: TWO_IO,
      solution: {
        python: r`
          def leaves(root, out):
              if root is None:
                  return
              if root.left is None and root.right is None:
                  out.append(root.val)
              leaves(root.left, out)
              leaves(root.right, out)`,
        cpp: r`
          void leaves(TreeNode* root, vector<long long>& out) {
              if (root == nullptr) return;
              if (root->left == nullptr && root->right == nullptr) out.push_back(root->val);
              leaves(root->left, out);
              leaves(root->right, out);
          }`,
        java: r`
          static void leaves(TreeNode root, List<Long> out) {
              if (root == null) return;
              if (root.left == null && root.right == null) out.add(root.val);
              leaves(root.left, out);
              leaves(root.right, out);
          }`
      },
      stub: {
        python: r`
          def leaves(root, out):
              # Your code here: append the values of the leaves, from left to right
              pass`,
        cpp: r`
          void leaves(TreeNode* root, vector<long long>& out) {
              // Your code here: append the values of the leaves, from left to right
          }`,
        java: r`
          static void leaves(TreeNode root, List<Long> out) {
              // Your code here: append the values of the leaves, from left to right
          }`
      },
      call: {
        python: 'first, second = [], []\nleaves(build_tree(a), first)\nleaves(build_tree(b), second)\nprint("yes" if first == second else "no")',
        cpp: 'vector<long long> first, second;\nleaves(buildTree(a), first);\nleaves(buildTree(b), second);\ncout << (first == second ? "yes" : "no") << "\\n";',
        java: 'List<Long> first = new ArrayList<>(), second = new ArrayList<>();\nleaves(buildTree(a), first);\nleaves(buildTree(b), second);\nSystem.out.println(first.equals(second) ? "yes" : "no");'
      }
    }),
    solution: { explanation: ['A depth-first walk that goes left before right appends the leaf values of each tree to a list; the trees are leaf-similar exactly when the lists are equal.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) { const [a, b] = twoTreesOfInput(input); return leafValues(a).join(',') === leafValues(b).join(',') ? 'yes' : 'no'; },
    tests() {
      const g = rng(718); const out = ['7\n3 5 1 6 2 9 8\n7\n3 5 1 6 2 9 8\n', '1\n5\n1\n5\n', '1\n5\n1\n6\n', '3\n1 2 3\n3\n1 3 2\n'];
      for (const k of [2, 5, 40, 300, 400]) { const leaves = Array.from({ length: k }, () => randInt(g, -20, 20)); out.push(twoTreesText(treeWithLeaves(g, leaves), treeWithLeaves(g, leaves))); const other = leaves.slice(); other[randInt(g, 0, k - 1)] += 1; out.push(twoTreesText(treeWithLeaves(g, leaves), treeWithLeaves(g, other))); }
      const shorter = Array.from({ length: 100 }, () => randInt(g, -5, 5)); out.push(twoTreesText(treeWithLeaves(g, shorter), treeWithLeaves(g, shorter.slice(0, 99))));
      out.push(twoTreesText(standardTrees(g)[6], standardTrees(g)[5]));
      return out;
    }
  },

  {
    ...two,
    slug: 'merge-two-trees',
    title: 'Lay One Tree on the Other',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'Walk both trees at once and merge where they overlap',
      body: [
        'Put the second tree on top of the first one so that the roots match. Where both trees have a node, the new node holds the **sum** of the two values. Where only one tree has a node, that node (with everything below it) is simply taken over. This is again a walk through two trees at the same time, but now the function **builds** a result.',
        { code: 'def merge(a, b):\n    if a is None:\n        return b                         # nothing on top: keep the other tree\n    if b is None:\n        return a\n    a.val += b.val\n    a.left = merge(a.left, b.left)\n    a.right = merge(a.right, b.right)\n    return a' },
        'The function reuses the nodes of the first tree for the result. Notice the base cases: when one side is empty, the other **whole subtree** can be returned without looking at it; no recursion is needed there. The values can add up to 2 * 10^9, which needs a 64-bit integer in C++ and Java.'
      ]
    },
    statement: ['Two binary trees are laid on each other with their roots at the same place. Make a new tree: where both trees have a node, the node holds the sum of the two values; where only one has a node, the node is copied. Print the merged tree in level order in the same form as the input.'],
    outputFormat: ['The merged tree in level order on one line.'],
    examples: [{ input: '4\n1 3 2 5\n7\n2 1 3 N 4 N 7\n', note: 'The roots add to 3, the left children to 4 and the right children to 5; the node 5 is copied from the first tree, and 4 and 7 from the second.' }],
    hints: ['If one of the nodes is missing, return the other node.', 'If both exist, add the values and merge the left children and the right children.', 'Print the resulting tree with the given print function.'],
    program: treeProgram({
      io: TWO_IO,
      solution: {
        python: r`
          def merge(a, b):
              if a is None:
                  return b
              if b is None:
                  return a
              a.val += b.val
              a.left = merge(a.left, b.left)
              a.right = merge(a.right, b.right)
              return a`,
        cpp: r`
          TreeNode* merge(TreeNode* a, TreeNode* b) {
              if (a == nullptr) return b;
              if (b == nullptr) return a;
              a->val += b->val;
              a->left = merge(a->left, b->left);
              a->right = merge(a->right, b->right);
              return a;
          }`,
        java: r`
          static TreeNode merge(TreeNode a, TreeNode b) {
              if (a == null) return b;
              if (b == null) return a;
              a.val += b.val;
              a.left = merge(a.left, b.left);
              a.right = merge(a.right, b.right);
              return a;
          }`
      },
      stub: {
        python: r`
          def merge(a, b):
              # Your code here: return the root of the merged tree
              return a`,
        cpp: r`
          TreeNode* merge(TreeNode* a, TreeNode* b) {
              // Your code here: return the root of the merged tree
              return a;
          }`,
        java: r`
          static TreeNode merge(TreeNode a, TreeNode b) {
              // Your code here: return the root of the merged tree
              return a;
          }`
      },
      call: { python: 'print_tree(merge(build_tree(a), build_tree(b)))', cpp: 'printTree(merge(buildTree(a), buildTree(b)));', java: 'printTree(merge(buildTree(a), buildTree(b)));' }
    }),
    solution: { explanation: ['Where both nodes exist the values are added and both pairs of children are merged; where one is missing the other subtree is returned as it is.'], complexity: 'Time O(min(n, m)), space O(h).' },
    solve(input) {
      const [a, b] = twoTreesOfInput(input);
      const merge = (x, y) => { if (!x) return y ? clone(y) : null; if (!y) return clone(x); return node(x.val + y.val, merge(x.left, y.left), merge(x.right, y.right)); };
      return toTokens(merge(a, b)).join(' ');
    },
    tests() {
      const g = rng(719); const out = ['5\n1 3 2 5 N\n6\n2 1 3 N 4 7\n', '1\n5\n1\n6\n', '3\n1 2 N\n3\n1 N 2\n'];
      const trees = standardTrees(g, -1000000000, 1000000000);
      for (let i = 1; i < trees.length; i++) out.push(twoTreesText(trees[i], trees[(i * 5) % trees.length]));
      out.push(twoTreesText(trees[6], clone(trees[6])), twoTreesText(trees[10], trees[11]));
      return out;
    }
  },

  {
    ...two,
    slug: 'subtree-of-another-tree',
    title: 'Is It a Subtree?',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'Try every node of the big tree as the place where the small tree could start',
      body: [
        'The second tree is a **subtree** of the first one if some node of the first tree has exactly the second tree below it: the same shape and the same values, **down to the leaves**. First write the check "are these two trees the same?" (the earlier problem). Then walk through every node of the first tree and apply the check there.',
        { code: 'def same(a, b): ...                     # as in the problem "Are the Two Trees the Same?"\n\ndef is_subtree(big, small):\n    if big is None:\n        return False\n    if same(big, small):\n        return True\n    return is_subtree(big.left, small) or is_subtree(big.right, small)' },
        'The check at a node costs at most the size of the small tree, because it stops at the first difference, so the whole search is O(n * m) in the worst case and usually much faster. A match must include **all** descendants: the small tree `1 2` is not a subtree of a tree where the node 1 has a second child.'
      ]
    },
    statement: ['Given two binary trees, decide whether the second tree is a subtree of the first one: that is, whether some node of the first tree, together with all its descendants, forms a tree that is the same as the second tree (same shape, same values).'],
    outputFormat: YES_NO,
    examples: [{ input: '5\n3 4 5 1 2\n3\n4 1 2\n', note: 'The node 4 with its children 1 and 2 is the second tree.' }, { input: '5\n3 4 5 1 2\n3\n4 1 N\n', note: 'The node 4 has the extra child 2, so it does not match.' }],
    hints: ['First write a function that tells whether two trees are the same.', 'Apply it at every node of the first tree.', 'The answer is yes if it succeeds at any node.'],
    program: treeProgram({
      io: TWO_IO,
      solution: {
        python: r`
          def same(a, b):
              if a is None and b is None:
                  return True
              if a is None or b is None:
                  return False
              return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)

          def is_subtree(big, small):
              if big is None:
                  return False
              if same(big, small):
                  return True
              return is_subtree(big.left, small) or is_subtree(big.right, small)`,
        cpp: r`
          bool same(TreeNode* a, TreeNode* b) {
              if (a == nullptr && b == nullptr) return true;
              if (a == nullptr || b == nullptr) return false;
              return a->val == b->val && same(a->left, b->left) && same(a->right, b->right);
          }

          bool isSubtree(TreeNode* big, TreeNode* small) {
              if (big == nullptr) return false;
              if (same(big, small)) return true;
              return isSubtree(big->left, small) || isSubtree(big->right, small);
          }`,
        java: r`
          static boolean same(TreeNode a, TreeNode b) {
              if (a == null && b == null) return true;
              if (a == null || b == null) return false;
              return a.val == b.val && same(a.left, b.left) && same(a.right, b.right);
          }

          static boolean isSubtree(TreeNode big, TreeNode small) {
              if (big == null) return false;
              if (same(big, small)) return true;
              return isSubtree(big.left, small) || isSubtree(big.right, small);
          }`
      },
      stub: {
        python: r`
          def is_subtree(big, small):
              # Your code here
              return False`,
        cpp: r`
          bool isSubtree(TreeNode* big, TreeNode* small) {
              // Your code here
              return false;
          }`,
        java: r`
          static boolean isSubtree(TreeNode big, TreeNode small) {
              // Your code here
              return false;
          }`
      },
      call: { python: 'print("yes" if is_subtree(build_tree(a), build_tree(b)) else "no")', cpp: 'cout << (isSubtree(buildTree(a), buildTree(b)) ? "yes" : "no") << "\\n";', java: 'System.out.println(isSubtree(buildTree(a), buildTree(b)) ? "yes" : "no");' }
    }),
    solution: { explanation: ['Every node of the first tree is tried as the root of a copy of the second tree, using the same-tree check; the first success gives yes.'], complexity: 'Time O(n * m) in the worst case, space O(h).' },
    solve(input) {
      const [big, small] = twoTreesOfInput(input);
      const found = allNodes(big).some((c) => sameTree(c, small)); return found ? 'yes' : 'no';
    },
    tests() {
      const g = rng(720); const out = ['5\n3 4 5 1 2\n3\n4 1 2\n', '5\n3 4 5 1 2\n3\n4 1 N\n', '1\n5\n1\n5\n', '1\n5\n1\n6\n'];
      const trees = standardTrees(g, -5, 5);
      for (const t of [trees[3], trees[4], trees[5], trees[6], trees[8], trees[9]]) {
        const nodes = allNodes(t); const pick = nodes[randInt(g, 0, nodes.length - 1)];
        if (allNodes(pick).length <= 3000) { out.push(twoTreesText(t, clone(pick))); out.push(twoTreesText(t, changeValue(pick, g))); out.push(twoTreesText(t, dropLeaf(pick, g))); }
      }
      out.push(twoTreesText(trees[9], completeTree(g, 7, 0, 0)), twoTreesText(completeTree(g, 20000, 0, 0), completeTree(g, 1023, 0, 0)), twoTreesText(chainTree(g, 800, 'left', 0, 0), chainTree(g, 400, 'left', 0, 0)), twoTreesText(chainTree(g, 800, 'left', 0, 0), chainTree(g, 400, 'right', 0, 0)));
      return out;
    }
  }
];
