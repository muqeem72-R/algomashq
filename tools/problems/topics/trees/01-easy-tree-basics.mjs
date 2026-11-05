import { r, rng } from '../../lib.mjs';
import { treeProgram } from '../../scaffolds.mjs';
import { treeText, treeOfInput, standardTrees, size, height, inorder, preorder, postorder, levels, node } from '../../treelib.mjs';

const TREE_INPUT = ['The first line has `t`, the number of words in the description of the tree.', 'The second line has the tree in level order: the root first, then the children of the nodes row by row from left to right. `N` stands for a missing child. There is no `N` at the end.'];
const LIMITS = ['1 <= number of nodes <= 20000', '-10^9 <= every value <= 10^9', 'The height of the tree is at most 800.'];
const common = { difficulty: 'easy', inputFormat: TREE_INPUT, constraints: LIMITS };
const treeTests = (seed, lo = -1000000000, hi = 1000000000, examples = []) => () => { const g = rng(seed); return [...examples, ...standardTrees(g, lo, hi).map(treeText)]; };
const leaves = (root) => { let count = 0; const stack = [root]; while (stack.length) { const c = stack.pop(); if (!c.left && !c.right) count++; if (c.left) stack.push(c.left); if (c.right) stack.push(c.right); } return count; };
const valuesOf = (root) => preorder(root);

export default [
  {
    ...common,
    slug: 'tree-depth',
    title: 'How Deep Is the Tree?',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'A tree is a node with two smaller trees',
      body: [
        'A **binary tree** is made of nodes. Every node holds a value and has at most two children, a **left** child and a **right** child. The first node is the **root**; a node without children is a **leaf**. A node together with everything below it is again a tree, so a tree is either **empty** or a root with two smaller trees (the left and the right subtree). That is why recursion is the natural tool.',
        'In the input a tree is written in **level order**: the root, then its two children, then the children of those, row by row. `N` stands for a missing child. For example `3 9 20 N N 15 7` is the root 3 with the children 9 and 20, where 9 has no children (`N N`) and 20 has the children 15 and 7.',
        { code: 'def depth(root):\n    if root is None:                      # the empty tree\n        return 0\n    return 1 + max(depth(root.left), depth(root.right))' },
        'The **depth** (also called height) is the number of nodes on the longest road from the root down to a leaf. The empty tree has depth 0 (the base case); any other tree is one more than its deeper subtree. The starter code builds the tree for you; you only write the function.'
      ]
    },
    statement: ['Find the depth of a binary tree: the number of nodes on the longest path from the root down to a leaf.'],
    outputFormat: ['Print the depth.'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'The longest road is 3 - 20 - 15 (or 3 - 20 - 7): 3 nodes.' }],
    hints: ['The empty tree has depth 0.', 'The depth of a tree is 1 plus the larger depth of its two subtrees.', 'Write a recursive function that calls itself on root.left and root.right.'],
    program: treeProgram({
      solution: {
        python: r`
          def depth(root):
              if root is None:
                  return 0
              return 1 + max(depth(root.left), depth(root.right))`,
        cpp: r`
          int depth(TreeNode* root) {
              if (root == nullptr) return 0;
              return 1 + max(depth(root->left), depth(root->right));
          }`,
        java: r`
          static int depth(TreeNode root) {
              if (root == null) return 0;
              return 1 + Math.max(depth(root.left), depth(root.right));
          }`
      },
      stub: {
        python: r`
          def depth(root):
              # Your code here
              return 0`,
        cpp: r`
          int depth(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static int depth(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(depth(build_tree(vals)))', cpp: 'cout << depth(buildTree(vals)) << "\\n";', java: 'System.out.println(depth(buildTree(vals)));' },
      includes: ['<algorithm>']
    }),
    solution: { explanation: ['The empty tree has depth 0. Otherwise the depth is 1 (for the root) plus the larger of the depths of the left and the right subtree.'], complexity: 'Time O(n), space O(h) for the recursion, where h is the height.' },
    solve(input) { return String(height(treeOfInput(input))); },
    tests: treeTests(701, -1000000000, 1000000000, ['7\n3 9 20 N N 15 7\n', '1\n5\n', '2\n1 2\n'])
  },

  {
    ...common,
    slug: 'count-tree-nodes',
    title: 'Count the Nodes',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'Count the root, then count both subtrees',
      body: [
        'Many questions about a tree are answered by one pattern: **solve the question for the left subtree, solve it for the right subtree, and combine the two answers with the root**. The questions about the empty tree are the base case.',
        'For counting nodes the combination is a sum: the tree has one node (the root) plus all nodes of the left subtree plus all nodes of the right subtree.',
        { code: 'def count(root):\n    if root is None:\n        return 0\n    return 1 + count(root.left) + count(root.right)' },
        'Each node is visited exactly once, so the time is proportional to the number of nodes. The recursion goes as deep as the tree is high, which is why the trees of this topic are limited to a height of 800 (Python allows about 1000 nested calls).'
      ]
    },
    statement: ['Print the number of nodes of a binary tree.'],
    outputFormat: ['Print the number of nodes.'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'The nodes are 3, 9, 20, 15 and 7.' }],
    hints: ['The empty tree has no nodes.', 'Count the root as 1 and add the sizes of the left and the right subtree.', 'The input already tells you nothing more: just walk the tree.'],
    program: treeProgram({
      solution: {
        python: r`
          def count(root):
              if root is None:
                  return 0
              return 1 + count(root.left) + count(root.right)`,
        cpp: r`
          long long countNodes(TreeNode* root) {
              if (root == nullptr) return 0;
              return 1 + countNodes(root->left) + countNodes(root->right);
          }`,
        java: r`
          static long countNodes(TreeNode root) {
              if (root == null) return 0;
              return 1 + countNodes(root.left) + countNodes(root.right);
          }`
      },
      stub: {
        python: r`
          def count(root):
              # Your code here
              return 0`,
        cpp: r`
          long long countNodes(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long countNodes(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(count(build_tree(vals)))', cpp: 'cout << countNodes(buildTree(vals)) << "\\n";', java: 'System.out.println(countNodes(buildTree(vals)));' }
    }),
    solution: { explanation: ['The empty tree has 0 nodes; any other tree has the root plus the nodes of its two subtrees.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { return String(size(treeOfInput(input))); },
    tests: treeTests(702, -1000000000, 1000000000, ['7\n3 9 20 N N 15 7\n', '1\n0\n'])
  },

  {
    ...common,
    slug: 'sum-of-tree-values',
    title: 'The Sum of All Values',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'The same pattern, with a different combination',
      body: [
        'The sum of all values of a tree is the value of the root plus the sum of the left subtree plus the sum of the right subtree. The empty tree has sum 0. It is the same shape as counting the nodes: only the number added for the root changes from `1` to `root.val`.',
        { code: 'def total(root):\n    if root is None:\n        return 0\n    return root.val + total(root.left) + total(root.right)' },
        'Values can be negative, and a tree can have 20000 nodes with values up to 10^9 in absolute value, so the sum can reach 2 * 10^13: it needs a 64-bit integer in C++ (`long long`) and Java (`long`). In Python integers never overflow.'
      ]
    },
    statement: ['Print the sum of the values of all nodes of a binary tree.'],
    outputFormat: ['Print the sum.'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: '3 + 9 + 20 + 15 + 7 = 54.' }],
    hints: ['The empty tree has the sum 0.', 'Add the value of the root to the sums of the two subtrees.', 'Use a 64-bit type for the sum.'],
    program: treeProgram({
      solution: {
        python: r`
          def total(root):
              if root is None:
                  return 0
              return root.val + total(root.left) + total(root.right)`,
        cpp: r`
          long long total(TreeNode* root) {
              if (root == nullptr) return 0;
              return root->val + total(root->left) + total(root->right);
          }`,
        java: r`
          static long total(TreeNode root) {
              if (root == null) return 0;
              return root.val + total(root.left) + total(root.right);
          }`
      },
      stub: {
        python: r`
          def total(root):
              # Your code here
              return 0`,
        cpp: r`
          long long total(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long total(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(total(build_tree(vals)))', cpp: 'cout << total(buildTree(vals)) << "\\n";', java: 'System.out.println(total(buildTree(vals)));' }
    }),
    solution: { explanation: ['The sum of an empty tree is 0; otherwise it is the root value plus the sums of the left and the right subtree.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { return String(valuesOf(treeOfInput(input)).reduce((a, b) => a + b, 0)); },
    tests: treeTests(703, -1000000000, 1000000000, ['7\n3 9 20 N N 15 7\n', '1\n-1000000000\n', '3\n1000000000 1000000000 1000000000\n'])
  },

  {
    ...common,
    slug: 'count-tree-leaves',
    title: 'Count the Leaves',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'A leaf is a node with no children',
      body: [
        'A **leaf** is a node that has no left child and no right child. To count the leaves, recurse over the tree, and treat three cases: the empty tree (no leaves), a leaf (exactly one), and an inner node (the leaves of its two subtrees).',
        { code: 'def leaves(root):\n    if root is None:\n        return 0\n    if root.left is None and root.right is None:\n        return 1                              # this node is a leaf\n    return leaves(root.left) + leaves(root.right)' },
        'Note the order of the checks: the test for the empty tree must come first, because the test for a leaf reads `root.left`. A node with only one child is **not** a leaf: its one subtree is searched.'
      ]
    },
    statement: ['Print the number of leaves (nodes without any child) of a binary tree.'],
    outputFormat: ['Print the number of leaves.'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'The leaves are 9, 15 and 7.' }],
    hints: ['A node whose left and right children are both missing is a leaf.', 'The empty tree has no leaves.', 'For any other node, add the leaves of the two subtrees.'],
    program: treeProgram({
      solution: {
        python: r`
          def leaves(root):
              if root is None:
                  return 0
              if root.left is None and root.right is None:
                  return 1
              return leaves(root.left) + leaves(root.right)`,
        cpp: r`
          long long leaves(TreeNode* root) {
              if (root == nullptr) return 0;
              if (root->left == nullptr && root->right == nullptr) return 1;
              return leaves(root->left) + leaves(root->right);
          }`,
        java: r`
          static long leaves(TreeNode root) {
              if (root == null) return 0;
              if (root.left == null && root.right == null) return 1;
              return leaves(root.left) + leaves(root.right);
          }`
      },
      stub: {
        python: r`
          def leaves(root):
              # Your code here
              return 0`,
        cpp: r`
          long long leaves(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long leaves(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(leaves(build_tree(vals)))', cpp: 'cout << leaves(buildTree(vals)) << "\\n";', java: 'System.out.println(leaves(buildTree(vals)));' }
    }),
    solution: { explanation: ['An empty tree has no leaves, a node without children is one leaf, and every other node has the leaves of its two subtrees.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { return String(leaves(treeOfInput(input))); },
    tests: treeTests(704, -1000000000, 1000000000, ['7\n3 9 20 N N 15 7\n', '1\n5\n', '3\n1 N 2\n'])
  },

  {
    ...common,
    slug: 'inorder-walk',
    title: 'Left, Root, Right',
    tags: ['tree', 'traversal', 'recursion'],
    concept: {
      title: 'Three ways to visit all nodes',
      body: [
        'A **traversal** visits every node of the tree exactly once, in some order. The three classical depth-first orders differ only in **when the root is visited**, compared with its two subtrees:',
        '- **in-order**: left subtree, root, right subtree;\n- **pre-order**: root, left subtree, right subtree;\n- **post-order**: left subtree, right subtree, root.',
        { code: 'def inorder(root, out):\n    if root is None:\n        return\n    inorder(root.left, out)       # everything on the left\n    out.append(root.val)          # the root\n    inorder(root.right, out)      # everything on the right' },
        'For a **binary search tree** (a tree where the left subtree has smaller values than the root and the right subtree has larger values) the in-order walk lists the values in increasing order. The list `out` is passed down so that all calls add to the same list.'
      ]
    },
    statement: ['Print the values of a binary tree in in-order: first the left subtree, then the root, then the right subtree (the same rule inside every subtree). Print all values on one line separated by spaces.'],
    outputFormat: ['The values in in-order on one line.'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'The left subtree is 9, then the root 3, then the right subtree: 15 20 7.' }],
    hints: ['Visit the left subtree first, then add the root value, then visit the right subtree.', 'Pass a list to the recursive function and append to it.', 'An empty tree adds nothing.'],
    program: treeProgram({
      solution: {
        python: r`
          def inorder(root, out):
              if root is None:
                  return
              inorder(root.left, out)
              out.append(root.val)
              inorder(root.right, out)`,
        cpp: r`
          void inorder(TreeNode* root, vector<long long>& out) {
              if (root == nullptr) return;
              inorder(root->left, out);
              out.push_back(root->val);
              inorder(root->right, out);
          }`,
        java: r`
          static void inorder(TreeNode root, List<Long> out) {
              if (root == null) return;
              inorder(root.left, out);
              out.add(root.val);
              inorder(root.right, out);
          }`
      },
      stub: {
        python: r`
          def inorder(root, out):
              # Your code here
              pass`,
        cpp: r`
          void inorder(TreeNode* root, vector<long long>& out) {
              // Your code here
          }`,
        java: r`
          static void inorder(TreeNode root, List<Long> out) {
              // Your code here
          }`
      },
      call: {
        python: 'out = []\ninorder(build_tree(vals), out)\nprint(*out)',
        cpp: 'vector<long long> out;\ninorder(buildTree(vals), out);\nfor (size_t i = 0; i < out.size(); i++) cout << (i ? " " : "") << out[i];\ncout << "\\n";',
        java: 'List<Long> out = new ArrayList<>();\ninorder(buildTree(vals), out);\nStringBuilder sb = new StringBuilder();\nfor (int i = 0; i < out.size(); i++) sb.append(i > 0 ? " " : "").append(out.get(i));\nSystem.out.println(sb);'
      }
    }),
    solution: { explanation: ['In-order visits the left subtree, then the root, then the right subtree, so the recursion adds the root value between the two recursive calls.'], complexity: 'Time O(n), space O(h) besides the output.' },
    solve(input) { return inorder(treeOfInput(input)).join(' '); },
    tests: treeTests(705, -1000000000, 1000000000, ['7\n3 9 20 N N 15 7\n', '1\n5\n', '7\n4 2 6 1 3 5 7\n'])
  },

  {
    ...common,
    slug: 'preorder-walk',
    title: 'Root, Left, Right',
    tags: ['tree', 'traversal', 'recursion'],
    concept: {
      title: 'The root comes first',
      body: [
        'In **pre-order** the root is visited **before** its two subtrees: first the root, then everything in the left subtree, then everything in the right subtree. Compared with in-order, only the place of the line that records the root changes.',
        { code: 'def preorder(root, out):\n    if root is None:\n        return\n    out.append(root.val)          # the root first\n    preorder(root.left, out)\n    preorder(root.right, out)' },
        'Pre-order lists a parent before its children, so it is the order in which a tree is **copied** or written to a file: reading the values back in the same order, you meet every parent before its children. Together with the in-order list it identifies a tree uniquely (a later problem).'
      ]
    },
    statement: ['Print the values of a binary tree in pre-order: the root first, then the left subtree, then the right subtree (the same rule inside every subtree). Print all values on one line separated by spaces.'],
    outputFormat: ['The values in pre-order on one line.'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'The root 3, then the left subtree (9), then the right subtree (20 15 7).' }],
    hints: ['Add the root value before visiting the subtrees.', 'Visit the left subtree before the right subtree.', 'An empty tree adds nothing.'],
    program: treeProgram({
      solution: {
        python: r`
          def preorder(root, out):
              if root is None:
                  return
              out.append(root.val)
              preorder(root.left, out)
              preorder(root.right, out)`,
        cpp: r`
          void preorder(TreeNode* root, vector<long long>& out) {
              if (root == nullptr) return;
              out.push_back(root->val);
              preorder(root->left, out);
              preorder(root->right, out);
          }`,
        java: r`
          static void preorder(TreeNode root, List<Long> out) {
              if (root == null) return;
              out.add(root.val);
              preorder(root.left, out);
              preorder(root.right, out);
          }`
      },
      stub: {
        python: r`
          def preorder(root, out):
              # Your code here
              pass`,
        cpp: r`
          void preorder(TreeNode* root, vector<long long>& out) {
              // Your code here
          }`,
        java: r`
          static void preorder(TreeNode root, List<Long> out) {
              // Your code here
          }`
      },
      call: {
        python: 'out = []\npreorder(build_tree(vals), out)\nprint(*out)',
        cpp: 'vector<long long> out;\npreorder(buildTree(vals), out);\nfor (size_t i = 0; i < out.size(); i++) cout << (i ? " " : "") << out[i];\ncout << "\\n";',
        java: 'List<Long> out = new ArrayList<>();\npreorder(buildTree(vals), out);\nStringBuilder sb = new StringBuilder();\nfor (int i = 0; i < out.size(); i++) sb.append(i > 0 ? " " : "").append(out.get(i));\nSystem.out.println(sb);'
      }
    }),
    solution: { explanation: ['Pre-order records the root value first and then visits the left and the right subtree.'], complexity: 'Time O(n), space O(h) besides the output.' },
    solve(input) { return preorder(treeOfInput(input)).join(' '); },
    tests: treeTests(706, -1000000000, 1000000000, ['7\n3 9 20 N N 15 7\n', '1\n5\n', '7\n4 2 6 1 3 5 7\n'])
  },

  {
    ...common,
    slug: 'postorder-walk',
    title: 'Left, Right, Root',
    tags: ['tree', 'traversal', 'recursion'],
    concept: {
      title: 'The root comes last',
      body: [
        'In **post-order** the root is visited **after** both subtrees: first everything in the left subtree, then everything in the right subtree, then the root. A node is processed only when all its descendants are already done.',
        { code: 'def postorder(root, out):\n    if root is None:\n        return\n    postorder(root.left, out)\n    postorder(root.right, out)\n    out.append(root.val)          # the root last' },
        'This is the order to use when the answer for a node **depends on the answers for its children**: for example to compute sizes and heights from the bottom up, or to delete a tree (children before the parent). Many harder tree problems are post-order computations in disguise.'
      ]
    },
    statement: ['Print the values of a binary tree in post-order: the left subtree first, then the right subtree, then the root (the same rule inside every subtree). Print all values on one line separated by spaces.'],
    outputFormat: ['The values in post-order on one line.'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'The left subtree (9), the right subtree (15 7 20), and at last the root 3.' }],
    hints: ['Visit both subtrees before recording the root value.', 'Visit the left subtree before the right subtree.', 'An empty tree adds nothing.'],
    program: treeProgram({
      solution: {
        python: r`
          def postorder(root, out):
              if root is None:
                  return
              postorder(root.left, out)
              postorder(root.right, out)
              out.append(root.val)`,
        cpp: r`
          void postorder(TreeNode* root, vector<long long>& out) {
              if (root == nullptr) return;
              postorder(root->left, out);
              postorder(root->right, out);
              out.push_back(root->val);
          }`,
        java: r`
          static void postorder(TreeNode root, List<Long> out) {
              if (root == null) return;
              postorder(root.left, out);
              postorder(root.right, out);
              out.add(root.val);
          }`
      },
      stub: {
        python: r`
          def postorder(root, out):
              # Your code here
              pass`,
        cpp: r`
          void postorder(TreeNode* root, vector<long long>& out) {
              // Your code here
          }`,
        java: r`
          static void postorder(TreeNode root, List<Long> out) {
              // Your code here
          }`
      },
      call: {
        python: 'out = []\npostorder(build_tree(vals), out)\nprint(*out)',
        cpp: 'vector<long long> out;\npostorder(buildTree(vals), out);\nfor (size_t i = 0; i < out.size(); i++) cout << (i ? " " : "") << out[i];\ncout << "\\n";',
        java: 'List<Long> out = new ArrayList<>();\npostorder(buildTree(vals), out);\nStringBuilder sb = new StringBuilder();\nfor (int i = 0; i < out.size(); i++) sb.append(i > 0 ? " " : "").append(out.get(i));\nSystem.out.println(sb);'
      }
    }),
    solution: { explanation: ['Post-order visits the left subtree, the right subtree and only then records the root value.'], complexity: 'Time O(n), space O(h) besides the output.' },
    solve(input) { return postorder(treeOfInput(input)).join(' '); },
    tests: treeTests(707, -1000000000, 1000000000, ['7\n3 9 20 N N 15 7\n', '1\n5\n', '7\n4 2 6 1 3 5 7\n'])
  },

  {
    ...common,
    slug: 'levels-of-a-tree',
    title: 'The Tree Level by Level',
    tags: ['tree', 'bfs', 'queue', 'level-order'],
    concept: {
      title: 'Breadth first: use a queue and process one level at a time',
      body: [
        'The depth-first walks go deep before they go wide. The **level order** (breadth-first) visits the nodes row by row: first the root, then its children, then the children of those, and so on. A **queue** does this: the nodes of the next row are added at the back while the nodes of the current row are taken from the front.',
        'To keep the rows apart, process the queue **one row at a time**: at the start of a round the queue holds exactly one row, so remember its size, take that many nodes, and add their children for the next round.',
        { code: 'queue = [root]\nwhile queue:\n    row = []\n    for _ in range(len(queue)):        # exactly the nodes of this row\n        node = queue.pop(0)\n        row.append(node.val)\n        if node.left:  queue.append(node.left)\n        if node.right: queue.append(node.right)\n    print(*row)' },
        '`pop(0)` on a Python list is slow for big lists (it moves all items); use `collections.deque` and `popleft()`, or keep an index. The row-by-row pattern is the basis of many problems: the right view, the widest level, the zigzag order, the largest value in each row.'
      ]
    },
    statement: ['Print the values of a binary tree level by level. Every level is one line: its values from left to right separated by spaces. The first line has the root.'],
    outputFormat: ['One line for every level.'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'Three lines: 3, then 9 20, then 15 7.' }],
    hints: ['Use a queue that starts with the root.', 'In each round take exactly as many nodes as the queue holds at the start of the round.', 'Add the children of the taken nodes to the back of the queue.'],
    program: treeProgram({
      solution: {
        python: r`
          from collections import deque

          def level_rows(root):
              rows = []
              queue = deque([root])
              while queue:
                  row = []
                  for _ in range(len(queue)):
                      node = queue.popleft()
                      row.append(node.val)
                      if node.left:
                          queue.append(node.left)
                      if node.right:
                          queue.append(node.right)
                  rows.append(row)
              return rows`,
        cpp: r`
          vector<vector<long long>> levelRows(TreeNode* root) {
              vector<vector<long long>> rows;
              vector<TreeNode*> level = {root};
              while (!level.empty()) {
                  vector<long long> row;
                  vector<TreeNode*> next;
                  for (TreeNode* node : level) {
                      row.push_back(node->val);
                      if (node->left) next.push_back(node->left);
                      if (node->right) next.push_back(node->right);
                  }
                  rows.push_back(row);
                  level = next;
              }
              return rows;
          }`,
        java: r`
          static List<List<Long>> levelRows(TreeNode root) {
              List<List<Long>> rows = new ArrayList<>();
              List<TreeNode> level = new ArrayList<>();
              level.add(root);
              while (!level.isEmpty()) {
                  List<Long> row = new ArrayList<>();
                  List<TreeNode> next = new ArrayList<>();
                  for (TreeNode node : level) {
                      row.add(node.val);
                      if (node.left != null) next.add(node.left);
                      if (node.right != null) next.add(node.right);
                  }
                  rows.add(row);
                  level = next;
              }
              return rows;
          }`
      },
      stub: {
        python: r`
          def level_rows(root):
              # Your code here: return a list with one list of values for every level
              return []`,
        cpp: r`
          vector<vector<long long>> levelRows(TreeNode* root) {
              // Your code here: return one vector of values for every level
              return {};
          }`,
        java: r`
          static List<List<Long>> levelRows(TreeNode root) {
              // Your code here: return one list of values for every level
              return new ArrayList<>();
          }`
      },
      call: {
        python: 'for row in level_rows(build_tree(vals)):\n    print(*row)',
        cpp: 'for (const vector<long long>& row : levelRows(buildTree(vals))) {\n    for (size_t i = 0; i < row.size(); i++) cout << (i ? " " : "") << row[i];\n    cout << "\\n";\n}',
        java: 'StringBuilder sb = new StringBuilder();\nfor (List<Long> row : levelRows(buildTree(vals))) {\n    for (int i = 0; i < row.size(); i++) sb.append(i > 0 ? " " : "").append(row.get(i));\n    sb.append("\\n");\n}\nSystem.out.print(sb);'
      }
    }),
    solution: { explanation: ['A queue holds the nodes of the current level. Each round takes exactly that many nodes from the front, records their values as one row, and appends their children for the next round.'], complexity: 'Time O(n), space O(width of the tree).' },
    solve(input) { return levels(treeOfInput(input)).map((row) => row.join(' ')).join('\n'); },
    tests: treeTests(708, -1000000000, 1000000000, ['7\n3 9 20 N N 15 7\n', '1\n5\n', '3\n1 N 2\n'])
  },

  {
    ...common,
    slug: 'minimum-depth-of-a-tree',
    title: 'The Shortest Way Down',
    tags: ['tree', 'recursion', 'bfs'],
    concept: {
      title: 'Careful: a node with one child is not a leaf',
      body: [
        'The **minimum depth** is the number of nodes on the shortest road from the root down to a **leaf**. It looks like the maximum depth with `min` instead of `max`, but this has a trap. For a node with only one child, `min(depth(left), depth(right))` would pick the empty side with depth 0 and wrongly count this node as the end of a road, although it is not a leaf.',
        { code: 'def min_depth(root):\n    if root is None:\n        return 0\n    if root.left is None:\n        return 1 + min_depth(root.right)      # only the right side leads to a leaf\n    if root.right is None:\n        return 1 + min_depth(root.left)\n    return 1 + min(min_depth(root.left), min_depth(root.right))' },
        'The cases are: no left child (follow the right one), no right child (follow the left one), or both (take the smaller). A level-order search finds the answer too: the first leaf met in the row-by-row walk is on the shortest road. Compare with the maximum depth problem to see why the base case needs more care here.'
      ]
    },
    statement: ['Find the minimum depth of a binary tree: the number of nodes on the shortest path from the root down to a leaf (a node without children).'],
    outputFormat: ['Print the minimum depth.'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'The leaf 9 is reached by the road 3 - 9: 2 nodes.' }, { input: '5\n2 N 3 N 4\n', note: 'The root has only a right child; the only leaf is at depth 3.' }],
    hints: ['A leaf has no children; a node with one child is not a leaf.', 'If one child is missing, the answer comes from the other child only.', 'If both children exist, take the smaller of the two answers.'],
    program: treeProgram({
      solution: {
        python: r`
          def min_depth(root):
              if root is None:
                  return 0
              if root.left is None:
                  return 1 + min_depth(root.right)
              if root.right is None:
                  return 1 + min_depth(root.left)
              return 1 + min(min_depth(root.left), min_depth(root.right))`,
        cpp: r`
          int minDepth(TreeNode* root) {
              if (root == nullptr) return 0;
              if (root->left == nullptr) return 1 + minDepth(root->right);
              if (root->right == nullptr) return 1 + minDepth(root->left);
              return 1 + min(minDepth(root->left), minDepth(root->right));
          }`,
        java: r`
          static int minDepth(TreeNode root) {
              if (root == null) return 0;
              if (root.left == null) return 1 + minDepth(root.right);
              if (root.right == null) return 1 + minDepth(root.left);
              return 1 + Math.min(minDepth(root.left), minDepth(root.right));
          }`
      },
      stub: {
        python: r`
          def min_depth(root):
              # Your code here
              return 0`,
        cpp: r`
          int minDepth(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static int minDepth(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(min_depth(build_tree(vals)))', cpp: 'cout << minDepth(buildTree(vals)) << "\\n";', java: 'System.out.println(minDepth(buildTree(vals)));' },
      includes: ['<algorithm>']
    }),
    solution: { explanation: ['With a missing child, only the other subtree can lead to a leaf, so the answer is 1 plus its minimum depth; with two children, 1 plus the smaller of the two minimum depths; an empty tree is 0.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { const root = treeOfInput(input); let level = [root], depth = 0; for (;;) { depth++; const next = []; for (const c of level) { if (!c.left && !c.right) return String(depth); if (c.left) next.push(c.left); if (c.right) next.push(c.right); } level = next; } },
    tests: treeTests(709, -1000000000, 1000000000, ['7\n3 9 20 N N 15 7\n', '5\n2 N 3 N 4\n', '1\n5\n'])
  },

  {
    ...common,
    slug: 'largest-and-smallest-in-tree',
    title: 'The Largest and the Smallest Value',
    tags: ['tree', 'recursion', 'binary-tree'],
    concept: {
      title: 'Combine the answers of the two subtrees with the root',
      body: [
        'The largest value of a tree is the largest of three numbers: the root value, the largest of the left subtree and the largest of the right subtree. The smallest value works the same way with `min`. There is no value for an empty tree, so the base case must be chosen so that it **does not disturb** the combination: use a very small number as the maximum and a very large number as the minimum of an empty tree (the neutral elements of `max` and `min`).',
        { code: 'NEG = -10 ** 18\nPOS = 10 ** 18\n\ndef extremes(root):                         # returns (largest, smallest)\n    if root is None:\n        return (NEG, POS)\n    lo_big, lo_small = extremes(root.left)\n    ro_big, ro_small = extremes(root.right)\n    return (max(root.val, lo_big, ro_big), min(root.val, lo_small, ro_small))' },
        'This returns **two numbers** from one pass. Whenever a question needs several facts about a subtree (here the largest and the smallest value), compute them together and return them as a pair, instead of walking the tree twice.'
      ]
    },
    statement: ['Print the largest and the smallest value of a binary tree, in this order, separated by a space.'],
    outputFormat: ['Two numbers: the largest value and the smallest value.'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'The largest value is 20 and the smallest is 3.' }],
    hints: ['The largest value is the maximum of the root value and the largest values of both subtrees.', 'Use a very small number as the largest value of an empty tree, and a very large number as its smallest value.', 'Return both numbers from one recursive function.'],
    program: treeProgram({
      solution: {
        python: r`
          NEG = -10 ** 18
          POS = 10 ** 18

          def extremes(root):
              if root is None:
                  return (NEG, POS)
              lb, ls = extremes(root.left)
              rb, rs = extremes(root.right)
              return (max(root.val, lb, rb), min(root.val, ls, rs))`,
        cpp: r`
          pair<long long, long long> extremes(TreeNode* root) {
              if (root == nullptr) return {-1000000000000000000LL, 1000000000000000000LL};
              pair<long long, long long> l = extremes(root->left), rt = extremes(root->right);
              return {max(root->val, max(l.first, rt.first)), min(root->val, min(l.second, rt.second))};
          }`,
        java: r`
          static long[] extremes(TreeNode root) {
              if (root == null) return new long[] {-1000000000000000000L, 1000000000000000000L};
              long[] l = extremes(root.left), rt = extremes(root.right);
              return new long[] {Math.max(root.val, Math.max(l[0], rt[0])), Math.min(root.val, Math.min(l[1], rt[1]))};
          }`
      },
      stub: {
        python: r`
          def extremes(root):
              # Your code here: return (largest value, smallest value)
              return (0, 0)`,
        cpp: r`
          pair<long long, long long> extremes(TreeNode* root) {
              // Your code here: return {largest value, smallest value}
              return {0, 0};
          }`,
        java: r`
          static long[] extremes(TreeNode root) {
              // Your code here: return {largest value, smallest value}
              return new long[] {0, 0};
          }`
      },
      call: {
        python: 'big, small = extremes(build_tree(vals))\nprint(big, small)',
        cpp: 'pair<long long, long long> e = extremes(buildTree(vals));\ncout << e.first << " " << e.second << "\\n";',
        java: 'long[] e = extremes(buildTree(vals));\nSystem.out.println(e[0] + " " + e[1]);'
      },
      includes: ['<algorithm>', '<utility>']
    }),
    solution: { explanation: ['Each call returns the pair (largest, smallest) of its subtree; an empty tree returns the neutral pair. The pair of a node combines the root value with the pairs of both children.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { const v = valuesOf(treeOfInput(input)); return `${Math.max(...v)} ${Math.min(...v)}`; },
    tests: treeTests(710, -1000000000, 1000000000, ['7\n3 9 20 N N 15 7\n', '1\n-5\n', '3\n7 7 7\n'])
  }
];
