import { r, rng, randInt, many, nums, rows, randWord, shuffle } from '../../lib.mjs';
import { treeProgram } from '../../scaffolds.mjs';
import { node, treeText, treeOfInput, randomBst, bstFromInsertions, balancedBst, distinctValues, inorder, toTokens, allNodes, clone, height } from '../../treelib.mjs';

const TREE_INPUT = ['The first line has `t`, the number of words in the description of the tree.', 'The second line has the tree in level order: the root first, then the children of the nodes row by row from left to right. `N` stands for a missing child. There is no `N` at the end.'];
const BST_NOTE = 'In a binary search tree the values are different, and every value in the left subtree of a node is smaller than the node, and every value in the right subtree is larger.';
const LIMITS = ['1 <= number of nodes <= 20000', '-10^9 <= every value <= 10^9', 'The height of the tree is at most 800.'];
const BIG = [-1000000000, 1000000000];
const easy = { difficulty: 'easy' };
const bst = { ...easy, inputFormat: TREE_INPUT, constraints: [...LIMITS, 'The tree is a binary search tree (all values are different).'] };
const numberText = (list) => `${list.length}\n${list.join(' ')}\n`;

// binary search trees for the tests: random ones, balanced ones and a few long paths
const searchTrees = (g) => [node(randInt(g, ...BIG)), randomBst(g, 2, ...BIG), randomBst(g, 7, ...BIG), randomBst(g, 31, ...BIG), randomBst(g, 500, ...BIG), randomBst(g, 5000, ...BIG), randomBst(g, 20000, ...BIG),
  balancedBst(distinctValues(g, 4095, ...BIG).sort((a, b) => a - b)), bstFromInsertions(Array.from({ length: 700 }, (_, i) => i * 3 - 1000)), bstFromInsertions(Array.from({ length: 700 }, (_, i) => 1000 - i * 3))];
const bstText = (root) => treeText(root);

export default [
  {
    ...bst,
    slug: 'search-in-bst',
    title: 'Look Up Keys in a Search Tree',
    tags: ['tree', 'bst', 'search'],
    concept: {
      title: 'Each comparison throws away half of the tree',
      body: [
        'A **binary search tree** (BST) keeps its values in order. ' + BST_NOTE + ' To look for a key, compare it with the root: if it is equal, you found it; if it is smaller, the key can only be in the left subtree; if it is larger, only in the right subtree. Each step discards a whole subtree.',
        { code: 'def contains(root, key):\n    cur = root\n    while cur is not None:\n        if key == cur.val:\n            return True\n        cur = cur.left if key < cur.val else cur.right\n    return False' },
        'In a balanced tree this takes about log2(n) steps; in the worst case (a path) it takes n steps. A loop is enough here, no recursion is needed. Compare with the ordinary binary tree, where a missing value forces you to look at **every** node.'
      ]
    },
    statement: ['A binary search tree and `q` keys are given. For each key print `yes` if some node of the tree has this value and `no` otherwise, one answer per line.'],
    inputFormat: [...TREE_INPUT, 'The third line has `q`.', 'The fourth line has the `q` keys.'],
    outputFormat: ['`q` lines with `yes` or `no`.'],
    constraints: [...bst.constraints, '1 <= q <= 20000', '-10^9 <= every key <= 10^9'],
    examples: [{ input: '7\n4 2 7 1 3 6 9\n3\n3 5 9\n', note: 'The values 3 and 9 are in the tree, 5 is not.' }],
    hints: ['Compare the key with the value of the current node.', 'If the key is smaller, go to the left child; if it is larger, go to the right child.', 'If you reach an empty place, the key is not in the tree.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'q:int', 'keys:int[q]'],
      solution: {
        python: r`
          def contains(root, key):
              cur = root
              while cur is not None:
                  if key == cur.val:
                      return True
                  cur = cur.left if key < cur.val else cur.right
              return False`,
        cpp: r`
          bool contains(TreeNode* root, long long key) {
              TreeNode* cur = root;
              while (cur != nullptr) {
                  if (key == cur->val) return true;
                  cur = key < cur->val ? cur->left : cur->right;
              }
              return false;
          }`,
        java: r`
          static boolean contains(TreeNode root, long key) {
              TreeNode cur = root;
              while (cur != null) {
                  if (key == cur.val) return true;
                  cur = key < cur.val ? cur.left : cur.right;
              }
              return false;
          }`
      },
      stub: {
        python: r`
          def contains(root, key):
              # Your code here
              return False`,
        cpp: r`
          bool contains(TreeNode* root, long long key) {
              // Your code here
              return false;
          }`,
        java: r`
          static boolean contains(TreeNode root, long key) {
              // Your code here
              return false;
          }`
      },
      call: {
        python: 'root = build_tree(vals)\nfor key in keys:\n    print("yes" if contains(root, key) else "no")',
        cpp: 'TreeNode* root = buildTree(vals);\nfor (long long key : keys) cout << (contains(root, key) ? "yes" : "no") << "\\n";',
        java: 'TreeNode root = buildTree(vals);\nStringBuilder sb = new StringBuilder();\nfor (long key : keys) sb.append(contains(root, key) ? "yes" : "no").append("\\n");\nSystem.out.print(sb);'
      }
    }),
    solution: { explanation: ['Starting at the root, the search goes left when the key is smaller than the node value and right when it is larger, and stops with yes on equality or with no at an empty place.'], complexity: 'Time O(h) per key, space O(1).' },
    solve(input) { const rs = input.replace(/\n$/, '').split('\n'); const values = new Set(inorder(treeOfInput(rs.slice(0, 2).join('\n') + '\n'))); return rs[3].trim().split(/\s+/).map((k) => (values.has(Number(k)) ? 'yes' : 'no')).join('\n'); },
    tests() {
      const g = rng(721); const out = ['7\n4 2 7 1 3 6 9\n3\n3 5 9\n', '1\n5\n2\n5 6\n'];
      for (const t of searchTrees(g)) { const values = inorder(t); const keys = []; for (let i = 0; i < 40; i++) keys.push(i % 2 ? values[randInt(g, 0, values.length - 1)] : randInt(g, ...BIG)); keys.push(values[0], values[values.length - 1], values[0] - 1, values[values.length - 1] + 1); out.push(`${bstText(t)}${numberText(keys)}`); }
      const big = randomBst(g, 20000, ...BIG); const v = inorder(big); out.push(`${bstText(big)}${numberText(many(20000, (i) => (i % 3 ? v[randInt(g, 0, v.length - 1)] : randInt(g, ...BIG))))}`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: TREE_INPUT,
    constraints: LIMITS,
    slug: 'is-valid-bst',
    title: 'Is It a Search Tree?',
    tags: ['tree', 'bst', 'recursion'],
    concept: {
      title: 'Every node must fit between two limits',
      body: [
        'To check that a tree is a binary search tree, it is not enough to compare each node with its two children: the node `7` below the left child `5` of a root `6` has a good parent but is wrong, because it lies in the left subtree of `6` and must be smaller than `6`. The right condition is: **every node must be strictly between two limits**, the values of the nearest ancestors on each side.',
        { code: 'def valid(root, low, high):                 # low < every value < high\n    if root is None:\n        return True\n    if not (low < root.val < high):\n        return False\n    return valid(root.left, low, root.val) and valid(root.right, root.val, high)\n\n# start with the widest limits: valid(root, -infinity, +infinity)' },
        'Going left, the upper limit becomes the value of the node; going right, the lower limit becomes it. Equal values are not allowed (the comparison is strict). Another way: the **in-order** list of a BST is strictly increasing, which is easy to check, too.'
      ]
    },
    statement: ['Decide whether a binary tree is a binary search tree: for every node, all values in its left subtree are smaller than the value of the node, and all values in its right subtree are larger (so equal values are not allowed).'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '3\n2 1 3\n', note: 'A valid search tree.' }, { input: '7\n5 1 4 N N 3 6\n', note: 'The right child 4 is smaller than the root 5: not a search tree.' }],
    hints: ['Comparing a node only with its children is not enough.', 'Pass down limits: a lower and an upper limit that every value in the subtree must respect.', 'Going left changes the upper limit, going right changes the lower limit; the limits are strict.'],
    program: treeProgram({
      solution: {
        python: r`
          def valid(root, low, high):
              if root is None:
                  return True
              if not (low < root.val < high):
                  return False
              return valid(root.left, low, root.val) and valid(root.right, root.val, high)`,
        cpp: r`
          bool valid(TreeNode* root, long long low, long long high) {
              if (root == nullptr) return true;
              if (!(low < root->val && root->val < high)) return false;
              return valid(root->left, low, root->val) && valid(root->right, root->val, high);
          }`,
        java: r`
          static boolean valid(TreeNode root, long low, long high) {
              if (root == null) return true;
              if (!(low < root.val && root.val < high)) return false;
              return valid(root.left, low, root.val) && valid(root.right, root.val, high);
          }`
      },
      stub: {
        python: r`
          def valid(root, low, high):
              # Your code here: every value of the tree must be between low and high
              return False`,
        cpp: r`
          bool valid(TreeNode* root, long long low, long long high) {
              // Your code here: every value of the tree must be between low and high
              return false;
          }`,
        java: r`
          static boolean valid(TreeNode root, long low, long high) {
              // Your code here: every value of the tree must be between low and high
              return false;
          }`
      },
      call: { python: 'print("yes" if valid(build_tree(vals), -10 ** 18, 10 ** 18) else "no")', cpp: 'cout << (valid(buildTree(vals), -1000000000000000000LL, 1000000000000000000LL) ? "yes" : "no") << "\\n";', java: 'System.out.println(valid(buildTree(vals), -1000000000000000000L, 1000000000000000000L) ? "yes" : "no");' }
    }),
    solution: { explanation: ['Each call checks that the node value lies strictly between the limits and passes the node value as the new upper limit to the left and as the new lower limit to the right.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { const v = inorder(treeOfInput(input)); return v.every((x, i) => i === 0 || v[i - 1] < x) ? 'yes' : 'no'; },
    tests() {
      const g = rng(722); const out = ['3\n2 1 3\n', '7\n5 1 4 N N 3 6\n', '1\n5\n', '3\n2 2 3\n', '3\n2 1 2\n', '5\n6 5 8 N 7\n'];
      for (const t of searchTrees(g)) out.push(bstText(t));
      for (const t of searchTrees(g).slice(1, 8)) { const copy = clone(t); const nodes = allNodes(copy); const a = nodes[randInt(g, 1, nodes.length - 1)], b = nodes[randInt(g, 0, nodes.length - 1)]; a.val = b.val + (g() < 0.5 ? 1 : 0); out.push(bstText(copy)); }
      const dup = clone(searchTrees(g)[5]); const dn = allNodes(dup); dn[dn.length - 1].val = dn[0].val; out.push(bstText(dup));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`.', 'The second line has `n` different integers: the keys that are inserted into an empty search tree one after the other, from left to right.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= every key <= 10^9, and the keys are different', 'The tree that the insertions make has a height of at most 800.'],
    slug: 'insert-into-bst',
    title: 'Build a Search Tree by Inserting Keys',
    tags: ['tree', 'bst', 'recursion'],
    concept: {
      title: 'A new key goes where a search for it would end',
      body: [
        'To insert a key into a binary search tree, search for it. The search ends at an empty place, and that is exactly where the new node belongs. Recursively: inserting into an empty tree makes a new node; otherwise insert into the left subtree if the key is smaller than the root, and into the right subtree if it is larger, and put the changed subtree back.',
        { code: 'def insert(root, key):\n    if root is None:\n        return TreeNode(key)               # the empty place found\n    if key < root.val:\n        root.left = insert(root.left, key)\n    else:\n        root.right = insert(root.right, key)\n    return root                            # the root does not change' },
        'The shape of the tree depends on the **order** of the insertions: keys that arrive in increasing order build a path (every key is the right child of the previous one) while random keys give a bushy tree of height about 2 log n. The starter code calls your function for every key and prints the tree in level order.'
      ]
    },
    statement: ['Insert the given keys one after the other into an initially empty binary search tree (a key smaller than the node goes to the left, a larger one to the right). Print the final tree in level order in the same form as a tree in the input (`N` for a missing child, no `N` at the end).'],
    outputFormat: ['The tree in level order on one line.'],
    examples: [{ input: '5\n4 2 7 1 3\n', note: 'The tree has the root 4, the children 2 and 7, and 2 has the children 1 and 3: 4 2 7 1 3.' }],
    hints: ['Inserting into an empty tree creates a new node.', 'Otherwise go left for a smaller key and right for a larger key, and insert there.', 'Return the root, so that the caller can store the new node when the tree was empty.'],
    program: treeProgram({
      io: ['n:int', 'a:int[n]'],
      solution: {
        python: r`
          def insert(root, key):
              if root is None:
                  return TreeNode(key)
              if key < root.val:
                  root.left = insert(root.left, key)
              else:
                  root.right = insert(root.right, key)
              return root`,
        cpp: r`
          TreeNode* insert(TreeNode* root, long long key) {
              if (root == nullptr) return new TreeNode(key);
              if (key < root->val) root->left = insert(root->left, key);
              else root->right = insert(root->right, key);
              return root;
          }`,
        java: r`
          static TreeNode insert(TreeNode root, long key) {
              if (root == null) return new TreeNode(key);
              if (key < root.val) root.left = insert(root.left, key);
              else root.right = insert(root.right, key);
              return root;
          }`
      },
      stub: {
        python: r`
          def insert(root, key):
              # Your code here: return the root of the tree after the insertion
              return root`,
        cpp: r`
          TreeNode* insert(TreeNode* root, long long key) {
              // Your code here: return the root of the tree after the insertion
              return root;
          }`,
        java: r`
          static TreeNode insert(TreeNode root, long key) {
              // Your code here: return the root of the tree after the insertion
              return root;
          }`
      },
      call: {
        python: 'root = None\nfor x in a:\n    root = insert(root, x)\nprint_tree(root)',
        cpp: 'TreeNode* root = nullptr;\nfor (long long x : a) root = insert(root, x);\nprintTree(root);',
        java: 'TreeNode root = null;\nfor (long x : a) root = insert(root, x);\nprintTree(root);'
      }
    }),
    solution: { explanation: ['The recursion follows the search path of the key and creates a node at the empty place; each call stores the (possibly new) subtree back into the child link.'], complexity: 'Time O(h) per insertion, space O(h).' },
    solve(input) { const a = nums(input.replace(/\n$/, '').split('\n')[1]); return toTokens(bstFromInsertions(a)).join(' '); },
    tests() {
      const g = rng(723); const out = ['5\n4 2 7 1 3\n', '1\n5\n', '3\n3 2 1\n', '3\n1 2 3\n'];
      for (const n of [7, 31, 500, 5000, 20000]) out.push(numberText(distinctValues(g, n, ...BIG)));
      out.push(numberText(Array.from({ length: 790 }, (_, i) => i - 400)), numberText(Array.from({ length: 790 }, (_, i) => 400 - i)), numberText(Array.from({ length: 790 }, (_, i) => (i % 2 ? 1 : -1) * (i + 1)).map((x, i) => x)));
      out.push(numberText(distinctValues(g, 2, ...BIG)), numberText(distinctValues(g, 15, -20, 20)), numberText(distinctValues(g, 1000, -1000000, 1000000)));
      return out;
    }
  },

  {
    ...bst,
    slug: 'kth-smallest-in-bst',
    title: 'The k-th Smallest Key',
    tags: ['tree', 'bst', 'inorder'],
    concept: {
      title: 'The in-order walk of a search tree is sorted',
      body: [
        'Because the left subtree holds the smaller values and the right subtree the larger ones, the **in-order** walk (left, node, right) of a BST visits the values in **increasing order**. So the `k`-th smallest value is the `k`-th node visited by the in-order walk, and the walk can stop as soon as that node is reached.',
        { code: 'def kth_smallest(root, k):\n    stack = []\n    cur = root\n    while stack or cur is not None:\n        while cur is not None:           # go as far left as possible\n            stack.append(cur)\n            cur = cur.left\n        cur = stack.pop()                # the next smallest value\n        k -= 1\n        if k == 0:\n            return cur.val\n        cur = cur.right' },
        'This version uses an explicit **stack** instead of recursion: the stack holds the nodes whose left subtree is being visited. It also works for very deep trees where the recursion would be too deep, and it stops early, visiting only `k` nodes plus the nodes on the way down.'
      ]
    },
    statement: ['Given a binary search tree and a number `k`, print the `k`-th smallest value in the tree (the smallest value is the 1st).'],
    inputFormat: [...TREE_INPUT, 'The third line has `k`.'],
    outputFormat: ['Print the `k`-th smallest value.'],
    constraints: [...bst.constraints, '1 <= k <= number of nodes'],
    examples: [{ input: '7\n4 2 7 1 3 6 9\n3\n', note: 'The values in increasing order are 1 2 3 4 6 7 9; the 3rd is 3.' }],
    hints: ['The in-order walk of a search tree gives the values in increasing order.', 'Count the visited nodes and stop at the k-th one.', 'An explicit stack (or recursion with a counter) does the walk.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'k:int'],
      solution: {
        python: r`
          def kth_smallest(root, k):
              stack = []
              cur = root
              while stack or cur is not None:
                  while cur is not None:
                      stack.append(cur)
                      cur = cur.left
                  cur = stack.pop()
                  k -= 1
                  if k == 0:
                      return cur.val
                  cur = cur.right
              return 0`,
        cpp: r`
          long long kthSmallest(TreeNode* root, long long k) {
              vector<TreeNode*> stack;
              TreeNode* cur = root;
              long long remaining = k;
              while (!stack.empty() || cur != nullptr) {
                  while (cur != nullptr) {
                      stack.push_back(cur);
                      cur = cur->left;
                  }
                  cur = stack.back();
                  stack.pop_back();
                  remaining--;
                  if (remaining == 0) return cur->val;
                  cur = cur->right;
              }
              return 0;
          }`,
        java: r`
          static long kthSmallest(TreeNode root, long k) {
              ArrayList<TreeNode> stack = new ArrayList<>();
              TreeNode cur = root;
              long remaining = k;
              while (!stack.isEmpty() || cur != null) {
                  while (cur != null) {
                      stack.add(cur);
                      cur = cur.left;
                  }
                  cur = stack.remove(stack.size() - 1);
                  remaining--;
                  if (remaining == 0) return cur.val;
                  cur = cur.right;
              }
              return 0;
          }`
      },
      stub: {
        python: r`
          def kth_smallest(root, k):
              # Your code here
              return 0`,
        cpp: r`
          long long kthSmallest(TreeNode* root, long long k) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long kthSmallest(TreeNode root, long k) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(kth_smallest(build_tree(vals), k))', cpp: 'cout << kthSmallest(buildTree(vals), k) << "\\n";', java: 'System.out.println(kthSmallest(buildTree(vals), k));' }
    }),
    solution: { explanation: ['An iterative in-order walk with a stack visits the values in increasing order; the k-th visited value is the answer.'], complexity: 'Time O(h + k), space O(h).' },
    solve(input) { const rs = input.replace(/\n$/, '').split('\n'); const v = inorder(treeOfInput(rs.slice(0, 2).join('\n') + '\n')); return String(v[Number(rs[2]) - 1]); },
    tests() {
      const g = rng(724); const out = ['7\n4 2 7 1 3 6 9\n3\n', '1\n5\n1\n'];
      for (const t of searchTrees(g).slice(1)) { const n = inorder(t).length; for (const k of [1, n, Math.ceil(n / 2), randInt(g, 1, n)]) out.push(`${bstText(t)}${k}\n`); }
      return out;
    }
  },

  {
    ...bst,
    slug: 'range-sum-of-bst',
    title: 'Sum of the Keys in a Range',
    tags: ['tree', 'bst', 'recursion', 'pruning'],
    concept: {
      title: 'Skip the subtrees that cannot contain a key of the range',
      body: [
        'Add up all values of a search tree that lie between `lo` and `hi` (both included). A plain walk over every node works, but the order of the BST lets you **skip** whole subtrees. If the value of the node is smaller than `lo`, then the **left subtree** is even smaller, so it contains nothing in the range: skip it. If the value is larger than `hi`, skip the **right subtree**.',
        { code: 'def range_sum(root, lo, hi):\n    if root is None:\n        return 0\n    if root.val < lo:\n        return range_sum(root.right, lo, hi)       # the left side is too small\n    if root.val > hi:\n        return range_sum(root.left, lo, hi)        # the right side is too large\n    return root.val + range_sum(root.left, lo, hi) + range_sum(root.right, lo, hi)' },
        'Cutting off parts of the search that cannot contain an answer is called **pruning**. Here it turns the O(n) walk into one that visits only about the nodes in the range plus the nodes on two roads. The sum can reach 2 * 10^13, so use a 64-bit integer.'
      ]
    },
    statement: ['Given a binary search tree and two numbers `lo` and `hi`, print the sum of all values `v` with `lo <= v <= hi`. If there is no such value, print 0.'],
    inputFormat: [...TREE_INPUT, 'The third line has `lo` and `hi`.'],
    outputFormat: ['Print the sum.'],
    constraints: [...bst.constraints, '-10^9 <= lo <= hi <= 10^9'],
    examples: [{ input: '7\n10 5 15 3 7 N 18\n7 15\n', note: 'The values 7, 10 and 15 are in the range: 32.' }],
    hints: ['If the node value is below the range, only the right subtree can contain values of the range.', 'If the node value is above the range, only the left subtree can.', 'Otherwise add the value and search both subtrees.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'lo:int hi:int'],
      solution: {
        python: r`
          def range_sum(root, lo, hi):
              if root is None:
                  return 0
              if root.val < lo:
                  return range_sum(root.right, lo, hi)
              if root.val > hi:
                  return range_sum(root.left, lo, hi)
              return root.val + range_sum(root.left, lo, hi) + range_sum(root.right, lo, hi)`,
        cpp: r`
          long long rangeSum(TreeNode* root, long long lo, long long hi) {
              if (root == nullptr) return 0;
              if (root->val < lo) return rangeSum(root->right, lo, hi);
              if (root->val > hi) return rangeSum(root->left, lo, hi);
              return root->val + rangeSum(root->left, lo, hi) + rangeSum(root->right, lo, hi);
          }`,
        java: r`
          static long rangeSum(TreeNode root, long lo, long hi) {
              if (root == null) return 0;
              if (root.val < lo) return rangeSum(root.right, lo, hi);
              if (root.val > hi) return rangeSum(root.left, lo, hi);
              return root.val + rangeSum(root.left, lo, hi) + rangeSum(root.right, lo, hi);
          }`
      },
      stub: {
        python: r`
          def range_sum(root, lo, hi):
              # Your code here
              return 0`,
        cpp: r`
          long long rangeSum(TreeNode* root, long long lo, long long hi) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long rangeSum(TreeNode root, long lo, long hi) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(range_sum(build_tree(vals), lo, hi))', cpp: 'cout << rangeSum(buildTree(vals), lo, hi) << "\\n";', java: 'System.out.println(rangeSum(buildTree(vals), lo, hi));' }
    }),
    solution: { explanation: ['A node below the range sends the search to its right subtree only, a node above the range to its left subtree only, and a node inside the range adds its value and searches both sides.'], complexity: 'Time O(h + number of nodes in the range), space O(h).' },
    solve(input) { const rs = input.replace(/\n$/, '').split('\n'); const v = inorder(treeOfInput(rs.slice(0, 2).join('\n') + '\n')); const [lo, hi] = nums(rs[2]); return String(v.filter((x) => x >= lo && x <= hi).reduce((a, b) => a + b, 0)); },
    tests() {
      const g = rng(725); const out = ['7\n10 5 15 3 7 N 18\n7 15\n', '1\n5\n5 5\n', '1\n5\n6 9\n'];
      for (const t of searchTrees(g).slice(1)) { const v = inorder(t); const a = v[randInt(g, 0, v.length - 1)], b = v[randInt(g, 0, v.length - 1)]; out.push(`${bstText(t)}${Math.min(a, b)} ${Math.max(a, b)}\n`, `${bstText(t)}${BIG[0]} ${BIG[1]}\n`, `${bstText(t)}${v[0] - 5} ${v[0] - 1}\n`); }
      return out;
    }
  },

  {
    ...bst,
    slug: 'closest-value-in-bst',
    title: 'The Key Closest to a Target',
    tags: ['tree', 'bst', 'search'],
    concept: {
      title: 'Walk down like a search and remember the best value seen',
      body: [
        'Find the value in the tree that is closest to a target number. Walk down from the root as if you were searching for the target: at each node compare the node with the best value found so far, and then go to the side where the target would be. Values in the other subtree are farther away than this node, so they cannot be closer than the nodes you will still meet on the road.',
        { code: 'def closest(root, target):\n    best = root.val\n    cur = root\n    while cur is not None:\n        d, bd = abs(cur.val - target), abs(best - target)\n        if d < bd or (d == bd and cur.val < best):    # a tie goes to the smaller value\n            best = cur.val\n        if target == cur.val:\n            break\n        cur = cur.left if target < cur.val else cur.right\n    return best' },
        'When two values are equally far from the target (one smaller, one larger), the problem asks for the **smaller** one, so the comparison needs the extra tie rule. The walk uses only the path from the root, so it takes O(h) time.'
      ]
    },
    statement: ['Given a binary search tree and an integer `target`, print the value in the tree that is closest to the target. If two values are equally close, print the smaller one.'],
    inputFormat: [...TREE_INPUT, 'The third line has `target`.'],
    outputFormat: ['Print the closest value.'],
    constraints: [...bst.constraints, '-2 * 10^9 <= target <= 2 * 10^9'],
    examples: [{ input: '5\n4 2 5 1 3\n3\n', note: 'The value 3 is in the tree: distance 0.' }, { input: '5\n4 2 5 1 3\n6\n', note: 'The closest value to 6 is 5, at distance 1.' }],
    hints: ['Walk from the root as if you looked for the target.', 'At every node update the best value if the node is closer (or equally close and smaller).', 'Go left when the target is smaller than the node, otherwise right.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'target:int'],
      solution: {
        python: r`
          def closest(root, target):
              best = root.val
              cur = root
              while cur is not None:
                  d = abs(cur.val - target)
                  bd = abs(best - target)
                  if d < bd or (d == bd and cur.val < best):
                      best = cur.val
                  if target == cur.val:
                      break
                  cur = cur.left if target < cur.val else cur.right
              return best`,
        cpp: r`
          long long closest(TreeNode* root, long long target) {
              long long best = root->val;
              TreeNode* cur = root;
              while (cur != nullptr) {
                  long long d = llabs(cur->val - target), bd = llabs(best - target);
                  if (d < bd || (d == bd && cur->val < best)) best = cur->val;
                  if (target == cur->val) break;
                  cur = target < cur->val ? cur->left : cur->right;
              }
              return best;
          }`,
        java: r`
          static long closest(TreeNode root, long target) {
              long best = root.val;
              TreeNode cur = root;
              while (cur != null) {
                  long d = Math.abs(cur.val - target), bd = Math.abs(best - target);
                  if (d < bd || (d == bd && cur.val < best)) best = cur.val;
                  if (target == cur.val) break;
                  cur = target < cur.val ? cur.left : cur.right;
              }
              return best;
          }`
      },
      stub: {
        python: r`
          def closest(root, target):
              # Your code here
              return 0`,
        cpp: r`
          long long closest(TreeNode* root, long long target) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long closest(TreeNode root, long target) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(closest(build_tree(vals), target))', cpp: 'cout << closest(buildTree(vals), target) << "\\n";', java: 'System.out.println(closest(buildTree(vals), target));' },
      includes: ['<cstdlib>']
    }),
    solution: { explanation: ['The walk follows the search path of the target, updating the best value whenever a node is closer (or equally close and smaller).'], complexity: 'Time O(h), space O(1).' },
    solve(input) { const rs = input.replace(/\n$/, '').split('\n'); const v = inorder(treeOfInput(rs.slice(0, 2).join('\n') + '\n')); const target = Number(rs[2]); let best = v[0]; for (const x of v) if (Math.abs(x - target) < Math.abs(best - target) || (Math.abs(x - target) === Math.abs(best - target) && x < best)) best = x; return String(best); },
    tests() {
      const g = rng(726); const out = ['5\n4 2 5 1 3\n3\n', '5\n4 2 5 1 3\n6\n', '5\n4 2 5 1 3\n0\n', '1\n5\n9\n', '3\n4 2 6\n5\n'];
      for (const t of searchTrees(g).slice(1)) { const v = inorder(t); for (let i = 0; i < 4; i++) out.push(`${bstText(t)}${i === 0 ? v[randInt(g, 0, v.length - 1)] : i === 1 ? randInt(g, -2000000000, 2000000000) : i === 2 ? Math.floor((v[0] + v[v.length > 1 ? 1 : 0]) / 2) : v[v.length - 1] + 1}\n`); }
      return out;
    }
  },

  {
    ...bst,
    slug: 'minimum-difference-in-bst',
    title: 'The Two Closest Keys',
    tags: ['tree', 'bst', 'inorder'],
    concept: {
      title: 'The closest pair is always neighbours in sorted order',
      body: [
        'What is the smallest difference between two values of the tree? Comparing every pair would take O(n^2). But the two values with the smallest difference must be **neighbours in sorted order**: if some value lay between them, it would make a smaller difference with one of them. And the in-order walk of a BST gives the values in sorted order, so it is enough to compare each value with the **previous** value of the walk.',
        { code: 'def min_diff(root):\n    best = None\n    prev = None\n    stack, cur = [], root\n    while stack or cur is not None:\n        while cur is not None:\n            stack.append(cur)\n            cur = cur.left\n        cur = stack.pop()\n        if prev is not None and (best is None or cur.val - prev < best):\n            best = cur.val - prev\n        prev = cur.val\n        cur = cur.right\n    return best' },
        'Remembering the previously visited value while walking is a typical technique for sorted structures. The differences are always non-negative because the walk is increasing. The tree has at least two nodes, so the answer always exists.'
      ]
    },
    statement: ['Given a binary search tree with at least two nodes, print the smallest difference between the values of two different nodes.'],
    outputFormat: ['Print the smallest difference.'],
    constraints: ['2 <= number of nodes <= 20000', '-10^9 <= every value <= 10^9', 'The height of the tree is at most 800.', 'The tree is a binary search tree (all values are different).'],
    examples: [{ input: '5\n4 2 6 1 3\n', note: 'The sorted values are 1 2 3 4 6; the smallest gap is 1.' }],
    hints: ['In sorted order, the closest two values are neighbours.', 'Walk the tree in-order and remember the previous value.', 'Update the best difference with the difference to the previous value.'],
    program: treeProgram({
      solution: {
        python: r`
          def min_diff(root):
              best = None
              prev = None
              stack = []
              cur = root
              while stack or cur is not None:
                  while cur is not None:
                      stack.append(cur)
                      cur = cur.left
                  cur = stack.pop()
                  if prev is not None and (best is None or cur.val - prev < best):
                      best = cur.val - prev
                  prev = cur.val
                  cur = cur.right
              return best`,
        cpp: r`
          long long minDiff(TreeNode* root) {
              vector<TreeNode*> stack;
              TreeNode* cur = root;
              bool hasPrev = false;
              long long prev = 0, best = 4000000000000000000LL;
              while (!stack.empty() || cur != nullptr) {
                  while (cur != nullptr) {
                      stack.push_back(cur);
                      cur = cur->left;
                  }
                  cur = stack.back();
                  stack.pop_back();
                  if (hasPrev && cur->val - prev < best) best = cur->val - prev;
                  prev = cur->val;
                  hasPrev = true;
                  cur = cur->right;
              }
              return best;
          }`,
        java: r`
          static long minDiff(TreeNode root) {
              ArrayList<TreeNode> stack = new ArrayList<>();
              TreeNode cur = root;
              boolean hasPrev = false;
              long prev = 0, best = Long.MAX_VALUE;
              while (!stack.isEmpty() || cur != null) {
                  while (cur != null) {
                      stack.add(cur);
                      cur = cur.left;
                  }
                  cur = stack.remove(stack.size() - 1);
                  if (hasPrev && cur.val - prev < best) best = cur.val - prev;
                  prev = cur.val;
                  hasPrev = true;
                  cur = cur.right;
              }
              return best;
          }`
      },
      stub: {
        python: r`
          def min_diff(root):
              # Your code here
              return 0`,
        cpp: r`
          long long minDiff(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long minDiff(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(min_diff(build_tree(vals)))', cpp: 'cout << minDiff(buildTree(vals)) << "\\n";', java: 'System.out.println(minDiff(buildTree(vals)));' }
    }),
    solution: { explanation: ['The in-order walk produces the values in increasing order, so the answer is the smallest difference between consecutive visited values.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { const v = inorder(treeOfInput(input)); let best = Infinity; for (let i = 1; i < v.length; i++) best = Math.min(best, v[i] - v[i - 1]); return String(best); },
    tests() { const g = rng(727); const out = ['5\n4 2 6 1 3\n', '2\n1 2\n', '3\n10 -1000000000 1000000000\n']; for (const t of searchTrees(g).slice(1)) out.push(bstText(t)); out.push(bstText(balancedBst(Array.from({ length: 20000 }, (_, i) => i * 7 + (i % 5 === 0 ? 3 : 0))))); return out; }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`.', 'The second line has `n` different integers in increasing order.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= every value <= 10^9, and the values are different and in increasing order'],
    slug: 'sorted-array-to-balanced-bst',
    title: 'A Balanced Tree From a Sorted List',
    tags: ['tree', 'bst', 'recursion', 'divide-and-conquer'],
    concept: {
      title: 'Take the middle element as the root',
      body: [
        'A sorted list can be turned into a **balanced** binary search tree: choose the **middle** element as the root, build the left subtree from the elements before it and the right subtree from the elements after it, each time with the same rule. The two halves differ in size by at most one, so the tree has a height of about log2(n) and every search is fast.',
        { code: 'def build(a, lo, hi):                     # the tree of a[lo..hi]\n    if lo > hi:\n        return None\n    mid = (lo + hi) // 2                  # with two middle elements, the left one\n    root = TreeNode(a[mid])\n    root.left = build(a, lo, mid - 1)\n    root.right = build(a, mid + 1, hi)\n    return root' },
        'This is **divide and conquer**: split the problem in two halves of nearly equal size and solve each half recursively. The rule "the left one of two middle elements" makes the answer unique (it is the lower middle, `(lo + hi) // 2`). The depth of the recursion is only log2(n).'
      ]
    },
    statement: ['Build a height-balanced binary search tree from `n` increasing integers: the root of every subtree is the middle element of its part of the list (if the part has an even number of elements, the left one of the two middle elements), the left subtree is built from the elements before it and the right subtree from the elements after it. Print the tree in level order in the same form as a tree in the input (`N` for a missing child, no `N` at the end).'],
    outputFormat: ['The tree in level order on one line.'],
    examples: [{ input: '5\n-10 -3 0 5 9\n', note: 'The root is 0; the left part -10 -3 has the root -10 with the right child -3; the right part 5 9 has the root 5 with the right child 9: 0 -10 5 N -3 N 9.' }],
    hints: ['The root is the middle element: index (lo + hi) / 2.', 'Build the left subtree from the part before the middle and the right subtree from the part after it.', 'An empty part gives an empty tree.'],
    program: treeProgram({
      io: ['n:int', 'a:int[n]'],
      solution: {
        python: r`
          def build(a, lo, hi):
              if lo > hi:
                  return None
              mid = (lo + hi) // 2
              root = TreeNode(a[mid])
              root.left = build(a, lo, mid - 1)
              root.right = build(a, mid + 1, hi)
              return root`,
        cpp: r`
          TreeNode* build(const vector<long long>& a, int lo, int hi) {
              if (lo > hi) return nullptr;
              int mid = (lo + hi) / 2;
              TreeNode* root = new TreeNode(a[mid]);
              root->left = build(a, lo, mid - 1);
              root->right = build(a, mid + 1, hi);
              return root;
          }`,
        java: r`
          static TreeNode build(long[] a, int lo, int hi) {
              if (lo > hi) return null;
              int mid = (lo + hi) / 2;
              TreeNode root = new TreeNode(a[mid]);
              root.left = build(a, lo, mid - 1);
              root.right = build(a, mid + 1, hi);
              return root;
          }`
      },
      stub: {
        python: r`
          def build(a, lo, hi):
              # Your code here: return the root of the tree built from a[lo..hi]
              return None`,
        cpp: r`
          TreeNode* build(const vector<long long>& a, int lo, int hi) {
              // Your code here: return the root of the tree built from a[lo..hi]
              return nullptr;
          }`,
        java: r`
          static TreeNode build(long[] a, int lo, int hi) {
              // Your code here: return the root of the tree built from a[lo..hi]
              return null;
          }`
      },
      call: { python: 'print_tree(build(a, 0, n - 1))', cpp: 'printTree(build(a, 0, (int)n - 1));', java: 'printTree(build(a, 0, (int) n - 1));' }
    }),
    solution: { explanation: ['The middle element becomes the root; the two parts around it are turned into the left and the right subtree by the same rule.'], complexity: 'Time O(n), space O(log n) for the recursion.' },
    solve(input) { const a = nums(input.replace(/\n$/, '').split('\n')[1]); return toTokens(balancedBst(a)).join(' '); },
    tests() {
      const g = rng(728); const out = ['5\n-10 -3 0 5 9\n', '1\n7\n', '2\n1 2\n', '4\n1 2 3 4\n'];
      for (const n of [3, 6, 7, 31, 100, 1000, 20000]) out.push(numberText(distinctValues(g, n, ...BIG).sort((x, y) => x - y)));
      out.push(numberText(Array.from({ length: 4095 }, (_, i) => i)), numberText(Array.from({ length: 4096 }, (_, i) => i - 2000)));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`, the number of operations.', 'Each of the next `n` lines has an operation and a number: `push x`, `pop 0` or `top 0` (for `pop` and `top` the number is 0 and must be ignored).'],
    constraints: ['1 <= n <= 20000', '-10^9 <= x <= 10^9', 'The heap is never empty when `pop` or `top` is used, and there is at least one `pop` or `top`.'],
    slug: 'min-heap-operations',
    title: 'A Min-Heap by Hand',
    tags: ['heap', 'priority-queue', 'design'],
    concept: {
      title: 'A tree stored in an array',
      body: [
        'A **min-heap** is a **complete binary tree** in which every node is **not larger than its children**, so the smallest value is always at the root. It is stored in an array without any pointers: the node at index `i` has the children `2i + 1` and `2i + 2`, and the parent `(i - 1) / 2`.',
        'To **push** a value, put it at the end of the array and let it **float up**: while it is smaller than its parent, swap them. To **pop** the smallest value, take the root, move the last element to the root and let it **sink down**: while some child is smaller, swap it with the smaller child. Both walks follow one road of the tree, so each operation takes O(log n).',
        { code: 'def push(x):\n    heap.append(x)\n    i = len(heap) - 1\n    while i > 0 and heap[(i - 1) // 2] > heap[i]:\n        heap[(i - 1) // 2], heap[i] = heap[i], heap[(i - 1) // 2]\n        i = (i - 1) // 2\n\ndef pop():\n    top, last = heap[0], heap.pop()\n    if heap:\n        heap[0] = last\n        i = 0\n        while True:\n            small = i\n            for c in (2 * i + 1, 2 * i + 2):\n                if c < len(heap) and heap[c] < heap[small]:\n                    small = c\n            if small == i:\n                break\n            heap[i], heap[small] = heap[small], heap[i]\n            i = small\n    return top' },
        'Libraries have this built in (`heapq` in Python, `priority_queue` in C++, `PriorityQueue` in Java), and they are fine in later problems; here the point is to see how the array works.'
      ]
    },
    statement: ['Process `n` operations on an initially empty min-heap. `push x` adds the number `x`. `pop 0` removes the smallest number and prints it. `top 0` prints the smallest number without removing it. For `pop` and `top` the number is 0 and must be ignored. Print one line for every `pop` and `top`.'],
    outputFormat: ['One line for every `pop` and `top` operation, in order.'],
    examples: [{ input: '6\npush 5\npush 2\ntop 0\npop 0\npush 1\npop 0\n', note: 'top prints 2; pop prints 2; then 1 is the smallest and pop prints 1.' }],
    hints: ['Keep the values in an array where the children of index i are 2i + 1 and 2i + 2.', 'After a push, swap the new element up while it is smaller than its parent.', 'After a pop, put the last element at the root and swap it down with the smaller child while a child is smaller.'],
    program: {
      io: ['n:int', 'ops:word[n][2]'],
      fast: true,
      helpers: {
        python: r`
          heap = []

          def push(x):
              heap.append(x)
              i = len(heap) - 1
              while i > 0 and heap[(i - 1) // 2] > heap[i]:
                  heap[(i - 1) // 2], heap[i] = heap[i], heap[(i - 1) // 2]
                  i = (i - 1) // 2

          def pop():
              top = heap[0]
              last = heap.pop()
              if heap:
                  heap[0] = last
                  i = 0
                  while True:
                      small = i
                      for c in (2 * i + 1, 2 * i + 2):
                          if c < len(heap) and heap[c] < heap[small]:
                              small = c
                      if small == i:
                          break
                      heap[i], heap[small] = heap[small], heap[i]
                      i = small
              return top`,
        cpp: r`
          vector<long long> heap;

          void push(long long x) {
              heap.push_back(x);
              size_t i = heap.size() - 1;
              while (i > 0 && heap[(i - 1) / 2] > heap[i]) {
                  swap(heap[(i - 1) / 2], heap[i]);
                  i = (i - 1) / 2;
              }
          }

          long long pop() {
              long long top = heap[0];
              long long last = heap.back();
              heap.pop_back();
              if (!heap.empty()) {
                  heap[0] = last;
                  size_t i = 0;
                  for (;;) {
                      size_t small = i;
                      for (size_t c = 2 * i + 1; c <= 2 * i + 2; c++) {
                          if (c < heap.size() && heap[c] < heap[small]) small = c;
                      }
                      if (small == i) break;
                      swap(heap[i], heap[small]);
                      i = small;
                  }
              }
              return top;
          }`,
        java: r`
          static ArrayList<Long> heap = new ArrayList<>();

          static void push(long x) {
              heap.add(x);
              int i = heap.size() - 1;
              while (i > 0 && heap.get((i - 1) / 2) > heap.get(i)) {
                  long t = heap.get((i - 1) / 2);
                  heap.set((i - 1) / 2, heap.get(i));
                  heap.set(i, t);
                  i = (i - 1) / 2;
              }
          }

          static long pop() {
              long top = heap.get(0);
              long last = heap.remove(heap.size() - 1);
              if (!heap.isEmpty()) {
                  heap.set(0, last);
                  int i = 0;
                  for (;;) {
                      int small = i;
                      for (int c = 2 * i + 1; c <= 2 * i + 2; c++) {
                          if (c < heap.size() && heap.get(c) < heap.get(small)) small = c;
                      }
                      if (small == i) break;
                      long t = heap.get(i);
                      heap.set(i, heap.get(small));
                      heap.set(small, t);
                      i = small;
                  }
              }
              return top;
          }`
      },
      includes: ['<algorithm>'],
      python: r`
        out = []
        for op, val in ops:
            if op == "push":
                push(int(val))
            elif op == "pop":
                out.append(pop())
            else:
                out.append(heap[0])
        print("\n".join(map(str, out)))`,
      cpp: r`
        for (int i = 0; i < n; i++) {
            const string& op = ops[i][0];
            if (op == "push") push(stoll(ops[i][1]));
            else if (op == "pop") cout << pop() << "\n";
            else cout << heap[0] << "\n";
        }`,
      java: r`
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            String op = ops[i][0];
            if (op.equals("push")) push(Long.parseLong(ops[i][1]));
            else if (op.equals("pop")) sb.append(pop()).append("\n");
            else sb.append(heap.get(0)).append("\n");
        }
        System.out.print(sb);`,
    },
    solution: { explanation: ['The heap is an array: a push floats the new element up while it is smaller than its parent; a pop moves the last element to the root and sinks it down along the smaller child.'], complexity: 'Time O(log n) per operation, space O(n).' },
    solve(input) {
      const rs = input.replace(/\n$/, '').split('\n'); const n = Number(rs[0]); const h = []; const out = [];
      for (let i = 1; i <= n; i++) { const [op, val] = rs[i].split(' '); if (op === 'push') { const x = Number(val); let lo = 0, hi = h.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (h[mid] < x) lo = mid + 1; else hi = mid; } h.splice(lo, 0, x); } else if (op === 'pop') out.push(h.shift()); else out.push(h[0]); }
      return out.join('\n');
    },
    tests() {
      const g = rng(729); const out = ['6\npush 5\npush 2\ntop 0\npop 0\npush 1\npop 0\n', '2\npush 1\ntop 0\n'];
      const script = (n, lo, hi, popRate) => { const lines = []; let size = 0; for (let i = 0; i < n; i++) { if (size > 0 && g() < popRate) { lines.push(g() < 0.7 ? 'pop 0' : 'top 0'); if (lines[lines.length - 1] === 'pop 0') size--; } else { lines.push(`push ${randInt(g, lo, hi)}`); size++; } } if (!lines.some((l) => l !== 'push' && !l.startsWith('push'))) { lines.push('top 0'); } return `${lines.length}\n${lines.join('\n')}\n`; };
      for (const [n, lo, hi, p] of [[10, -5, 5, 0.4], [100, -100, 100, 0.4], [1000, -1000000000, 1000000000, 0.45], [5000, -50, 50, 0.3], [20000, -1000000000, 1000000000, 0.4], [20000, 0, 3, 0.45]]) out.push(script(n, lo, hi, p));
      const sortedPush = Array.from({ length: 10000 }, (_, i) => `push ${i}`).concat(Array.from({ length: 5000 }, () => 'pop 0')); out.push(`${sortedPush.length}\n${sortedPush.join('\n')}\n`);
      const reversePush = Array.from({ length: 10000 }, (_, i) => `push ${10000 - i}`).concat(Array.from({ length: 5000 }, () => 'pop 0')); out.push(`${reversePush.length}\n${reversePush.join('\n')}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n`.', 'The second line has the `n` words that are stored.', 'The third line has `q`.', 'Each of the next `q` lines has a kind of query and a string: `word s` asks whether `s` is one of the stored words, `prefix s` asks whether some stored word starts with `s`.'],
    constraints: ['1 <= n, q <= 5000', 'Every word and every query string has 1 to 20 lowercase letters.'],
    slug: 'trie-words-and-prefixes',
    title: 'Words and Prefixes in a Trie',
    tags: ['trie', 'strings', 'design'],
    concept: {
      title: 'A tree of letters',
      body: [
        'A **trie** (prefix tree) stores a set of words in a tree where every edge is labelled with a letter. The words that share a beginning share the first part of their road: `car`, `cart` and `cat` all start with the road `c - a`. A node can be marked "a word ends here". Looking up a word or a prefix takes one step per letter, whatever the number of stored words.',
        { code: 'root = {}\n\ndef trie_insert(word):\n    node = root\n    for ch in word:\n        node = node.setdefault(ch, {})       # follow or create the edge\n    node["$"] = True                         # a word ends here\n\ndef trie_find(s):                             # the node at the end of s, or None\n    node = root\n    for ch in s:\n        if ch not in node:\n            return None\n        node = node[ch]\n    return node\n\n# "word s":   node = trie_find(s); node is not None and "$" in node\n# "prefix s": trie_find(s) is not None' },
        'The difference between the two queries is the end mark: `ca` is a **prefix** of `car`, but not a stored **word** unless it was inserted itself. Python dictionaries are a simple way to write a trie; in C++ and Java a node usually has an array of 26 children.'
      ]
    },
    statement: ['Store `n` words in a set. Then answer `q` queries. A query `word s` asks whether `s` is exactly one of the stored words. A query `prefix s` asks whether at least one stored word starts with `s` (a word starts with itself). Print `yes` or `no` for every query.'],
    outputFormat: ['`q` lines with `yes` or `no`.'],
    examples: [{ input: '3\ncar cart cat\n4\nword car\nword ca\nprefix ca\nprefix cx\n', note: 'car is stored; ca is not a word but it is a prefix; cx is neither.' }],
    hints: ['Build a tree with one edge per letter; mark the node where a word ends.', 'For a query, follow the letters; if an edge is missing, the answer is no.', 'A word query also needs the end mark; a prefix query does not.'],
    program: {
      io: ['n:int', 'words:word[n]', 'q:int', 'queries:word[q][2]'],
      fast: true,
      helpers: {
        python: r`
          root = {}

          def trie_insert(word):
              node = root
              for ch in word:
                  node = node.setdefault(ch, {})
              node["$"] = True

          def trie_find(s):
              node = root
              for ch in s:
                  if ch not in node:
                      return None
                  node = node[ch]
              return node`,
        cpp: r`
          struct TrieNode {
              int next[26];
              bool end = false;
              TrieNode() { for (int i = 0; i < 26; i++) next[i] = -1; }
          };

          vector<TrieNode> trie(1);

          void trieInsert(const string& word) {
              int node = 0;
              for (char ch : word) {
                  if (trie[node].next[ch - 'a'] < 0) {
                      trie[node].next[ch - 'a'] = (int)trie.size();
                      trie.push_back(TrieNode());
                  }
                  node = trie[node].next[ch - 'a'];
              }
              trie[node].end = true;
          }

          int trieFind(const string& s) {
              int node = 0;
              for (char ch : s) {
                  node = trie[node].next[ch - 'a'];
                  if (node < 0) return -1;
              }
              return node;
          }`,
        java: r`
          static int[][] child = new int[100001][26];
          static boolean[] endMark = new boolean[100001];
          static int nodes = 1;

          static void trieInsert(String word) {
              int node = 0;
              for (char ch : word.toCharArray()) {
                  if (child[node][ch - 'a'] == 0) child[node][ch - 'a'] = nodes++;
                  node = child[node][ch - 'a'];
              }
              endMark[node] = true;
          }

          static int trieFind(String s) {
              int node = 0;
              for (char ch : s.toCharArray()) {
                  node = child[node][ch - 'a'];
                  if (node == 0) return -1;
              }
              return node;
          }`
      },
      python: r`
        for w in words:
            trie_insert(w)
        out = []
        for kind, s in queries:
            node = trie_find(s)
            if kind == "word":
                out.append("yes" if node is not None and "$" in node else "no")
            else:
                out.append("yes" if node is not None else "no")
        print("\n".join(out))`,
      cpp: r`
        for (const string& w : words) trieInsert(w);
        for (int i = 0; i < q; i++) {
            int node = trieFind(queries[i][1]);
            bool ok = queries[i][0] == "word" ? (node >= 0 && trie[node].end) : node >= 0;
            cout << (ok ? "yes" : "no") << "\n";
        }`,
      java: r`
        for (String w : words) trieInsert(w);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < q; i++) {
            int node = trieFind(queries[i][1]);
            boolean ok = queries[i][0].equals("word") ? (node >= 0 && endMark[node]) : node >= 0;
            sb.append(ok ? "yes" : "no").append("\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Each word is inserted letter by letter, creating missing edges and marking its last node. A query follows its letters from the root: a missing edge means no; a word query also needs the end mark.'], complexity: 'Time O(total length of words and queries), space O(total length of words).' },
    solve(input) {
      const rs = input.replace(/\n$/, '').split('\n'); const words = new Set(rs[1].trim().split(/\s+/)); const list = [...words]; const q = Number(rs[2]); const out = [];
      for (let i = 0; i < q; i++) { const [kind, s] = rs[3 + i].split(' '); out.push(kind === 'word' ? (words.has(s) ? 'yes' : 'no') : (list.some((w) => w.startsWith(s)) ? 'yes' : 'no')); }
      return out.join('\n');
    },
    tests() {
      const g = rng(730); const out = ['3\ncar cart cat\n4\nword car\nword ca\nprefix ca\nprefix cx\n', '1\na\n2\nword a\nprefix a\n'];
      const make = (n, q, alphabet, maxLen) => { const words = many(n, () => randWord(g, randInt(g, 1, maxLen), alphabet)); const queries = many(q, () => { const w = words[randInt(g, 0, n - 1)]; const kind = g() < 0.5 ? 'word' : 'prefix'; const pick = g(); const s = pick < 0.4 ? w : pick < 0.7 ? w.slice(0, randInt(g, 1, w.length)) : randWord(g, randInt(g, 1, maxLen), alphabet); return `${kind} ${s}`; }); return `${n}\n${words.join(' ')}\n${q}\n${queries.join('\n')}\n`; };
      out.push(make(10, 20, 'ab', 4), make(100, 200, 'abc', 6), make(1000, 1000, 'abcd', 10), make(5000, 5000, 'abcdefghij', 20), make(5000, 5000, 'ab', 20), make(3000, 5000, 'abcdefghijklmnopqrstuvwxyz', 20), make(50, 5000, 'abc', 5));
      return out;
    }
  }
];
