import { r, rng, randInt, many, nums, shuffle } from '../../lib.mjs';
import { treeProgram } from '../../scaffolds.mjs';
import { node, treeText, treeOfInput, twoTreesOfInput, twoTreesText, randomBst, bstFromInsertions, balancedBst, distinctValues, inorder, preorder, toTokens, allNodes, clone } from '../../treelib.mjs';

const TREE_INPUT = ['The first line has `t`, the number of words in the description of the tree.', 'The second line has the tree in level order: the root first, then the children of the nodes row by row from left to right. `N` stands for a missing child. There is no `N` at the end.'];
const TWO_INPUT = ['The first two lines describe the first tree and the next two lines describe the second tree. A tree is described by a line with the number of words `t`, and a line with the tree in level order (the root first, then the children row by row from left to right, `N` for a missing child, no `N` at the end).'];
const LIMITS = ['1 <= number of nodes <= 20000', '-10^9 <= every value <= 10^9', 'The height of the tree is at most 800.', 'The tree is a binary search tree (all values are different).'];
const BIG = [-1000000000, 1000000000];
const bst = { difficulty: 'medium', inputFormat: TREE_INPUT, constraints: LIMITS };
const TWO_IO = ['t:int', 'a:word[t]', 'u:int', 'b:word[u]'];
const show = (root) => (root ? toTokens(root).join(' ') : 'empty');
const splitInput = (input) => { const rs = input.replace(/\n$/, '').split('\n'); return { root: treeOfInput(rs.slice(0, 2).join('\n') + '\n'), rest: rs.slice(2) }; };
const numberText = (list) => `${list.length}\n${list.join(' ')}\n`;
const choose = (g, list) => list[randInt(g, 0, list.length - 1)];
const kindsOf = (root) => { const nodes = allNodes(root); return { leaf: nodes.filter((c) => !c.left && !c.right), one: nodes.filter((c) => !c.left !== !c.right), two: nodes.filter((c) => c.left && c.right) }; };
const missingValue = (g, root) => { const have = new Set(inorder(root)); let v = randInt(g, ...BIG); while (have.has(v)) v = randInt(g, ...BIG); return v; };

// search trees for the tests: random ones, balanced ones and long paths (height at most 800)
const searchTrees = (g) => [node(randInt(g, ...BIG)), randomBst(g, 2, ...BIG), randomBst(g, 7, ...BIG), randomBst(g, 31, ...BIG), randomBst(g, 500, ...BIG), randomBst(g, 5000, ...BIG), randomBst(g, 20000, ...BIG),
  balancedBst(distinctValues(g, 4095, ...BIG).sort((a, b) => a - b)), bstFromInsertions(Array.from({ length: 700 }, (_, i) => i * 3 - 1000)), bstFromInsertions(Array.from({ length: 700 }, (_, i) => 1000 - i * 3))];

export default [
  {
    ...bst,
    inputFormat: [...TREE_INPUT, 'The third line has the number `key`.'],
    constraints: [...LIMITS, '-10^9 <= key <= 10^9'],
    slug: 'delete-node-in-bst',
    title: 'Delete a Key From a Search Tree',
    tags: ['tree', 'bst', 'recursion'],
    concept: {
      title: 'Three cases: no child, one child, two children',
      body: [
        'To delete a value from a binary search tree, first **find** its node (go left when the key is smaller, right when it is larger). Then there are three cases for the node that has to disappear:',
        '- **no children**: just remove it (the parent gets an empty child);\n- **one child**: the child takes its place (the parent links straight to the child);\n- **two children**: the hole cannot be filled by one child, so take the **in-order successor**, the smallest value of the right subtree, copy its value into the node, and then delete the successor from the right subtree. The successor has no left child, so that delete is one of the easy cases.',
        { code: 'def delete_key(root, key):\n    if root is None:\n        return None\n    if key < root.val:\n        root.left = delete_key(root.left, key)\n    elif key > root.val:\n        root.right = delete_key(root.right, key)\n    else:\n        if root.left is None:\n            return root.right\n        if root.right is None:\n            return root.left\n        smallest = root.right\n        while smallest.left is not None:\n            smallest = smallest.left\n        root.val = smallest.val\n        root.right = delete_key(root.right, smallest.val)\n    return root' },
        'The pattern `root.left = f(root.left, ...)` is the standard way to change a tree recursively: the function returns the new root of the subtree, and the caller stores it. It handles the case where the root itself is replaced without special code.'
      ]
    },
    statement: ['A binary search tree and a number `key` are given. If the tree has a node with the value `key`, delete it: a node without a left child is replaced by its right subtree, a node without a right child is replaced by its left subtree, and a node with two children gets the value of the smallest node of its right subtree, which is then deleted from the right subtree. If there is no such node, nothing changes. Print the resulting tree in level order in the same form as a tree in the input (`N` for a missing child, no `N` at the end), or `empty` if no node is left.'],
    outputFormat: ['The tree in level order on one line, or `empty`.'],
    examples: [{ input: '7\n5 3 6 2 4 N 7\n3\n', note: 'The node 3 has two children. The smallest value of its right subtree is 4, so 4 moves up: 5 4 6 2 N N 7.' }],
    hints: ['Find the node by going left or right as in a search.', 'With at most one child, return the other child (or nothing) in its place.', 'With two children, copy the smallest value of the right subtree into the node and delete that value from the right subtree.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'key:int'],
      solution: {
        python: r`
          def delete_key(root, key):
              if root is None:
                  return None
              if key < root.val:
                  root.left = delete_key(root.left, key)
              elif key > root.val:
                  root.right = delete_key(root.right, key)
              else:
                  if root.left is None:
                      return root.right
                  if root.right is None:
                      return root.left
                  smallest = root.right
                  while smallest.left is not None:
                      smallest = smallest.left
                  root.val = smallest.val
                  root.right = delete_key(root.right, smallest.val)
              return root`,
        cpp: r`
          TreeNode* deleteKey(TreeNode* root, long long key) {
              if (root == nullptr) return nullptr;
              if (key < root->val) {
                  root->left = deleteKey(root->left, key);
              } else if (key > root->val) {
                  root->right = deleteKey(root->right, key);
              } else {
                  if (root->left == nullptr) return root->right;
                  if (root->right == nullptr) return root->left;
                  TreeNode* smallest = root->right;
                  while (smallest->left != nullptr) smallest = smallest->left;
                  root->val = smallest->val;
                  root->right = deleteKey(root->right, smallest->val);
              }
              return root;
          }`,
        java: r`
          static TreeNode deleteKey(TreeNode root, long key) {
              if (root == null) return null;
              if (key < root.val) {
                  root.left = deleteKey(root.left, key);
              } else if (key > root.val) {
                  root.right = deleteKey(root.right, key);
              } else {
                  if (root.left == null) return root.right;
                  if (root.right == null) return root.left;
                  TreeNode smallest = root.right;
                  while (smallest.left != null) smallest = smallest.left;
                  root.val = smallest.val;
                  root.right = deleteKey(root.right, smallest.val);
              }
              return root;
          }`
      },
      stub: {
        python: r`
          def delete_key(root, key):
              # Your code here: return the root of the tree after the deletion
              return root`,
        cpp: r`
          TreeNode* deleteKey(TreeNode* root, long long key) {
              // Your code here: return the root of the tree after the deletion
              return root;
          }`,
        java: r`
          static TreeNode deleteKey(TreeNode root, long key) {
              // Your code here: return the root of the tree after the deletion
              return root;
          }`
      },
      call: { python: 'print_tree(delete_key(build_tree(vals), key))', cpp: 'printTree(deleteKey(buildTree(vals), key));', java: 'printTree(deleteKey(buildTree(vals), key));' }
    }),
    solution: { explanation: ['The node is found like in a search. A node with at most one child is replaced by that child; a node with two children takes the smallest value of its right subtree, which is then deleted from the right subtree.'], complexity: 'Time O(h), space O(h), where h is the height.' },
    solve(input) {
      const { root, rest } = splitInput(input); const key = Number(rest[0]);
      const del = (c, k) => { if (!c) return null; if (k < c.val) c.left = del(c.left, k); else if (k > c.val) c.right = del(c.right, k); else { if (!c.left) return c.right; if (!c.right) return c.left; let s = c.right; while (s.left) s = s.left; c.val = s.val; c.right = del(c.right, s.val); } return c; };
      return show(del(root, key));
    },
    tests() {
      const g = rng(761); const out = ['7\n5 3 6 2 4 N 7\n3\n', '1\n5\n5\n', '1\n5\n6\n', '3\n5 3 N\n3\n', '3\n5 N 8\n5\n'];
      for (const t of searchTrees(g)) {
        const k = kindsOf(t); const keys = [t.val, missingValue(g, t)]; const small = k.leaf.length + k.one.length + k.two.length < 1000;
        for (const list of [k.leaf, k.one, k.two]) if (list.length) { keys.push(choose(g, list).val); if (small) keys.push(choose(g, list).val); }
        for (const key of keys) out.push(`${treeText(t)}${key}\n`);
      }
      return out;
    }
  },

  {
    ...bst,
    inputFormat: [...TREE_INPUT, 'The third line has `low` and `high`.'],
    constraints: [...LIMITS, '-10^9 <= low <= high <= 10^9'],
    slug: 'trim-bst',
    title: 'Keep Only a Range of a Search Tree',
    tags: ['tree', 'bst', 'recursion'],
    concept: {
      title: 'If the root is out of range, one whole side can be thrown away',
      body: [
        'Remove from a binary search tree all values outside the range `[low, high]`, so that the remaining nodes keep their relative structure. The search tree order tells how to do it with almost no work:',
        '- if the root is **smaller than `low`**, then the root and its whole **left subtree** are too small; the answer is the trimmed **right** subtree;\n- if the root is **larger than `high`**, the root and its whole **right subtree** are too big; the answer is the trimmed **left** subtree;\n- otherwise the root stays, and both subtrees are trimmed.',
        { code: 'def trim(root, low, high):\n    if root is None:\n        return None\n    if root.val < low:\n        return trim(root.right, low, high)      # the root and everything on its left are too small\n    if root.val > high:\n        return trim(root.left, low, high)       # the root and everything on its right are too big\n    root.left = trim(root.left, low, high)\n    root.right = trim(root.right, low, high)\n    return root' },
        'The whole removed subtrees are never visited, so for a narrow range the work is far less than the size of the tree. The same recursion shape as in the deletion problem: the function returns the new root of the subtree.'
      ]
    },
    statement: ['A binary search tree and two numbers `low` and `high` are given. Remove all nodes whose value is smaller than `low` or larger than `high`. The nodes that stay keep their relative structure: when a node is removed, its subtree on the side that is still in range takes its place. Print the resulting tree in level order in the same form as a tree in the input (`N` for a missing child, no `N` at the end), or `empty` if no node is left.'],
    outputFormat: ['The tree in level order on one line, or `empty`.'],
    examples: [{ input: '8\n3 0 4 N 2 N N 1\n1 3\n', note: 'The node 0 is too small, so its right subtree (2 with the child 1) takes its place; the node 4 is too big: 3 2 N 1.' }],
    hints: ['A root that is too small can be replaced by the trimmed right subtree.', 'A root that is too big can be replaced by the trimmed left subtree.', 'A root in the range stays, and both subtrees are trimmed.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'low:int high:int'],
      solution: {
        python: r`
          def trim(root, low, high):
              if root is None:
                  return None
              if root.val < low:
                  return trim(root.right, low, high)
              if root.val > high:
                  return trim(root.left, low, high)
              root.left = trim(root.left, low, high)
              root.right = trim(root.right, low, high)
              return root`,
        cpp: r`
          TreeNode* trim(TreeNode* root, long long low, long long high) {
              if (root == nullptr) return nullptr;
              if (root->val < low) return trim(root->right, low, high);
              if (root->val > high) return trim(root->left, low, high);
              root->left = trim(root->left, low, high);
              root->right = trim(root->right, low, high);
              return root;
          }`,
        java: r`
          static TreeNode trim(TreeNode root, long low, long high) {
              if (root == null) return null;
              if (root.val < low) return trim(root.right, low, high);
              if (root.val > high) return trim(root.left, low, high);
              root.left = trim(root.left, low, high);
              root.right = trim(root.right, low, high);
              return root;
          }`
      },
      stub: {
        python: r`
          def trim(root, low, high):
              # Your code here: return the root of the trimmed tree
              return root`,
        cpp: r`
          TreeNode* trim(TreeNode* root, long long low, long long high) {
              // Your code here: return the root of the trimmed tree
              return root;
          }`,
        java: r`
          static TreeNode trim(TreeNode root, long low, long high) {
              // Your code here: return the root of the trimmed tree
              return root;
          }`
      },
      call: { python: 'print_tree(trim(build_tree(vals), low, high))', cpp: 'printTree(trim(buildTree(vals), low, high));', java: 'printTree(trim(buildTree(vals), low, high));' }
    }),
    solution: { explanation: ['A root below the range is replaced by the trimmed right subtree, a root above the range by the trimmed left subtree; a root in the range keeps both trimmed subtrees.'], complexity: 'Time O(n), space O(h).' },
    solve(input) {
      const { root, rest } = splitInput(input); const [low, high] = nums(rest[0]);
      const trim = (c) => { if (!c) return null; if (c.val < low) return trim(c.right); if (c.val > high) return trim(c.left); c.left = trim(c.left); c.right = trim(c.right); return c; };
      return show(trim(root));
    },
    tests() {
      const g = rng(762); const out = ['8\n3 0 4 N 2 N N 1\n1 3\n', '1\n5\n5 5\n', '1\n5\n6 9\n', '1\n5\n1 4\n', '3\n5 3 8\n3 8\n'];
      for (const t of searchTrees(g)) {
        const v = inorder(t); const pick = () => v[randInt(g, 0, v.length - 1)];
        const ranges = [[v[0], v[v.length - 1]], [-1000000000, 1000000000], [Math.min(v[v.length - 1] + 1, 1000000000), 1000000000], [pick(), pick()], [pick(), pick()], [pick(), pick()], [v[0], v[0]], [v[Math.floor(v.length / 4)], v[Math.floor(3 * v.length / 4)]]];
        for (let [lo, hi] of v.length < 1000 ? ranges : ranges.slice(2, 5)) { if (lo > hi) [lo, hi] = [hi, lo]; out.push(`${treeText(t)}${lo} ${hi}\n`); }
      }
      return out;
    }
  },

  {
    ...bst,
    slug: 'convert-bst-to-greater-tree',
    title: 'Add the Bigger Values to Every Node',
    tags: ['tree', 'bst', 'traversal'],
    concept: {
      title: 'Walk the tree from the largest value to the smallest, keeping a running sum',
      body: [
        'Change the value of every node of a binary search tree to **its own value plus the sum of all values that are larger**. Doing this for each node separately would be slow, but there is an order that makes it trivial: visit the nodes **from the largest to the smallest** and keep the sum of everything seen so far.',
        'The in-order walk (left, node, right) visits the values in increasing order. Its mirror, the **reverse in-order walk** (right, node, left), visits them in **decreasing** order. Each node adds its value to the running total and takes the total as its new value.',
        { code: 'total = 0\nstack = []\nnode = root\nwhile stack or node is not None:\n    while node is not None:               # go right as far as possible\n        stack.append(node)\n        node = node.right\n    node = stack.pop()\n    total += node.val                     # the largest unvisited value\n    node.val = total\n    node = node.left' },
        'The total can be large (20000 values of 10^9 give 2 * 10^13), so use 64-bit integers.'
      ]
    },
    statement: ['Replace the value of every node of a binary search tree with its own value plus the sum of all values in the tree that are larger than it. Print the resulting tree (the same shape) in level order, in the same form as a tree in the input (`N` for a missing child, no `N` at the end).'],
    outputFormat: ['The tree in level order on one line.'],
    examples: [{ input: '15\n4 1 6 0 2 5 7 N N N 3 N N N 8\n', note: 'The values 0 1 2 3 4 5 6 7 8 become 36 36 35 33 30 26 21 15 8: 30 36 21 36 35 26 15 N N N 33 N N N 8.' }],
    hints: ['The reverse in-order walk (right, node, left) visits the values from the largest to the smallest.', 'Keep a running total of the values visited so far.', 'At each node add its value to the total and store the total in the node.'],
    program: treeProgram({
      solution: {
        python: r`
          def convert(root):
              total = 0
              stack = []
              node = root
              while stack or node is not None:
                  while node is not None:
                      stack.append(node)
                      node = node.right
                  node = stack.pop()
                  total += node.val
                  node.val = total
                  node = node.left
              return root`,
        cpp: r`
          TreeNode* convert(TreeNode* root) {
              long long total = 0;
              vector<TreeNode*> stack;
              TreeNode* node = root;
              while (!stack.empty() || node != nullptr) {
                  while (node != nullptr) {
                      stack.push_back(node);
                      node = node->right;
                  }
                  node = stack.back();
                  stack.pop_back();
                  total += node->val;
                  node->val = total;
                  node = node->left;
              }
              return root;
          }`,
        java: r`
          static TreeNode convert(TreeNode root) {
              long total = 0;
              ArrayList<TreeNode> stack = new ArrayList<>();
              TreeNode node = root;
              while (!stack.isEmpty() || node != null) {
                  while (node != null) {
                      stack.add(node);
                      node = node.right;
                  }
                  node = stack.remove(stack.size() - 1);
                  total += node.val;
                  node.val = total;
                  node = node.left;
              }
              return root;
          }`
      },
      stub: {
        python: r`
          def convert(root):
              # Your code here: change the values in the tree and return its root
              return root`,
        cpp: r`
          TreeNode* convert(TreeNode* root) {
              // Your code here: change the values in the tree and return its root
              return root;
          }`,
        java: r`
          static TreeNode convert(TreeNode root) {
              // Your code here: change the values in the tree and return its root
              return root;
          }`
      },
      call: { python: 'print_tree(convert(build_tree(vals)))', cpp: 'printTree(convert(buildTree(vals)));', java: 'printTree(convert(buildTree(vals)));' }
    }),
    solution: { explanation: ['A reverse in-order walk visits the values from the largest to the smallest; a running total is added to each node and stored in it.'], complexity: 'Time O(n), space O(h).' },
    solve(input) {
      const root = treeOfInput(input); const nodes = allNodes(root).sort((p, q) => q.val - p.val); let total = 0; for (const c of nodes) { total += c.val; c.val = total; }
      return show(root);
    },
    tests() {
      const g = rng(763); const out = ['15\n4 1 6 0 2 5 7 N N N 3 N N N 8\n', '1\n5\n', '3\n2 1 3\n'];
      for (const t of searchTrees(g).slice(1)) out.push(treeText(t));
      return out;
    }
  },

  {
    ...bst,
    inputFormat: [...TREE_INPUT, 'The third line has `q`, the number of operations.', 'The fourth line has `q` words, each `next` or `has`.'],
    constraints: [...LIMITS, '1 <= q <= 60000', '`next` is used only when there is a next value, and at least one operation is `next`.'],
    slug: 'bst-iterator-ops',
    title: 'An Iterator Over a Search Tree',
    tags: ['tree', 'bst', 'stack', 'design'],
    concept: {
      title: 'Keep the left road on a stack and take values one at a time',
      body: [
        'An *iterator* gives the values of a collection one by one, in order, without building the whole list first. For a binary search tree the order is the in-order one (increasing). The iterative in-order walk already has the right shape: it keeps a **stack** with the road of nodes going left from the root. The top of the stack is always the **next** value.',
        'To move on: pop the top node, give its value, and then push the left road of its **right child**, because the nodes of the right subtree come next.',
        { code: 'stack = []\nnode = root\nwhile node:                      # start: the left road from the root\n    stack.append(node)\n    node = node.left\n\ndef has_next():\n    return len(stack) > 0\n\ndef next_value():\n    top = stack.pop()\n    node = top.right             # the right subtree comes after this node\n    while node:\n        stack.append(node)\n        node = node.left\n    return top.val' },
        'Each node is pushed and popped once, so any series of `n` calls to `next` costs O(n) in total (O(1) on average per call), and the stack holds at most the height of the tree, so the memory is O(h). Building the full sorted list would also work but needs O(n) memory, which is exactly what an iterator avoids.'
      ]
    },
    statement: ['A binary search tree is given, and then a list of operations on its in-order iterator, which starts before the smallest value. `next` moves the iterator to the next value in increasing order and prints it. `has` prints `yes` if there is still a value after the current position and `no` if not. Print one line for every operation.'],
    outputFormat: ['One line for every operation: the value for `next`, `yes` or `no` for `has`.'],
    examples: [{ input: '3\n2 1 3\n5\nnext has next next has\n', note: 'The values come in the order 1 2 3: next prints 1, has prints yes, next prints 2, next prints 3, has prints no.' }],
    hints: ['Keep a stack with the nodes on the road that goes left from the root.', 'The top of the stack is the next value.', 'After taking a node from the stack, push the left road of its right child.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'q:int', 'ops:word[q]'],
      solution: {
        python: r`
          def run(root, ops):
              stack = []
              node = root
              while node is not None:
                  stack.append(node)
                  node = node.left
              out = []
              for op in ops:
                  if op == "next":
                      top = stack.pop()
                      out.append(str(top.val))
                      node = top.right
                      while node is not None:
                          stack.append(node)
                          node = node.left
                  else:
                      out.append("yes" if stack else "no")
              return out`,
        cpp: r`
          vector<string> run(TreeNode* root, const vector<string>& ops) {
              vector<TreeNode*> stack;
              TreeNode* node = root;
              while (node != nullptr) {
                  stack.push_back(node);
                  node = node->left;
              }
              vector<string> out;
              for (const string& op : ops) {
                  if (op == "next") {
                      TreeNode* top = stack.back();
                      stack.pop_back();
                      out.push_back(to_string(top->val));
                      node = top->right;
                      while (node != nullptr) {
                          stack.push_back(node);
                          node = node->left;
                      }
                  } else {
                      out.push_back(stack.empty() ? "no" : "yes");
                  }
              }
              return out;
          }`,
        java: r`
          static List<String> run(TreeNode root, String[] ops) {
              ArrayList<TreeNode> stack = new ArrayList<>();
              TreeNode node = root;
              while (node != null) {
                  stack.add(node);
                  node = node.left;
              }
              List<String> out = new ArrayList<>();
              for (String op : ops) {
                  if (op.equals("next")) {
                      TreeNode top = stack.remove(stack.size() - 1);
                      out.add(String.valueOf(top.val));
                      node = top.right;
                      while (node != null) {
                          stack.add(node);
                          node = node.left;
                      }
                  } else {
                      out.add(stack.isEmpty() ? "no" : "yes");
                  }
              }
              return out;
          }`
      },
      stub: {
        python: r`
          def run(root, ops):
              # Your code here: return a list with one string for every operation
              return []`,
        cpp: r`
          vector<string> run(TreeNode* root, const vector<string>& ops) {
              // Your code here: return one string for every operation
              return {};
          }`,
        java: r`
          static List<String> run(TreeNode root, String[] ops) {
              // Your code here: return one string for every operation
              return new ArrayList<>();
          }`
      },
      call: {
        python: 'print("\\n".join(run(build_tree(vals), ops)))',
        cpp: 'for (const string& line : run(buildTree(vals), ops)) cout << line << "\\n";',
        java: 'StringBuilder sb = new StringBuilder();\nfor (String line : run(buildTree(vals), ops)) sb.append(line).append("\\n");\nSystem.out.print(sb);'
      }
    }),
    solution: { explanation: ['A stack holds the road of nodes going left. `next` pops the top, answers its value and pushes the left road of its right child; `has` checks that the stack is not empty.'], complexity: 'Time O(1) on average per operation, space O(h).' },
    solve(input) {
      const { root, rest } = splitInput(input); const values = inorder(root); let at = 0; const out = [];
      for (const op of rest[1].trim().split(/\s+/)) out.push(op === 'next' ? String(values[at++]) : (at < values.length ? 'yes' : 'no'));
      return out.join('\n');
    },
    tests() {
      const g = rng(764); const out = ['3\n2 1 3\n5\nnext has next next has\n', '1\n5\n3\nhas next has\n'];
      const script = (n, length) => { const ops = []; let left = n; for (let i = 0; i < length; i++) { if (left > 0 && g() < 0.6) { ops.push('next'); left--; } else ops.push('has'); } if (!ops.includes('next')) ops[0] = 'next'; return ops; };
      for (const t of searchTrees(g)) { const n = inorder(t).length; for (const length of [Math.min(n + 5, 30), Math.min(2 * n, 60000)]) { const ops = script(n, length); out.push(`${treeText(t)}${ops.length}\n${ops.join(' ')}\n`); } }
      const t = searchTrees(g)[6]; const all = Array.from({ length: 20000 }, () => 'next'); out.push(`${treeText(t)}${all.length}\n${all.join(' ')}\n`);
      return out;
    }
  },

  {
    ...bst,
    inputFormat: [...TREE_INPUT, 'The third line has the number `k`.'],
    constraints: [...LIMITS, '-2 * 10^9 <= k <= 2 * 10^9'],
    slug: 'two-sum-in-bst',
    title: 'Pairs With a Given Sum in a Search Tree',
    tags: ['tree', 'bst', 'two-pointers'],
    concept: {
      title: 'The in-order walk is a sorted list: use two pointers',
      body: [
        'The in-order walk of a binary search tree gives the values in **increasing order**, so a question about pairs of values in the tree is a question about pairs in a sorted list. The classic method for "how many pairs add up to `k`" in a sorted list uses two pointers, one at each end:',
        '- if `values[i] + values[j] == k`, count a pair and move both pointers inwards (the values are different, so no other pair uses these two);\n- if the sum is **smaller** than `k`, the left value is too small for any partner left of `j`, so move `i` right;\n- if the sum is **larger**, move `j` left.',
        { code: 'values = in_order(root)             # sorted, all different\ni, j, count = 0, len(values) - 1, 0\nwhile i < j:\n    s = values[i] + values[j]\n    if s == k:\n        count += 1\n        i += 1\n        j -= 1\n    elif s < k:\n        i += 1\n    else:\n        j -= 1' },
        'Each step moves a pointer, so the loop takes O(n) steps. Compare with putting the values in a set and checking `k - v` for each value, which is also O(n) but needs no order: here the order gives the same speed with O(1) extra memory after the walk.'
      ]
    },
    statement: ['A binary search tree and a number `k` are given. Count the pairs of different nodes whose values add up to `k` (a pair is counted once, whatever the order of the two nodes).'],
    outputFormat: ['Print the number of pairs.'],
    examples: [{ input: '7\n5 3 6 2 4 N 7\n9\n', note: 'The pairs are 2 + 7, 3 + 6 and 4 + 5: three pairs.' }],
    hints: ['Write the values of the tree in increasing order with an in-order walk.', 'Put one pointer at the smallest and one at the largest value.', 'If the sum is too small move the left pointer right; if it is too big move the right pointer left; if it is k count the pair and move both.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'k:int'],
      solution: {
        python: r`
          def count_pairs(root, k):
              values = []
              stack = []
              node = root
              while stack or node is not None:
                  while node is not None:
                      stack.append(node)
                      node = node.left
                  node = stack.pop()
                  values.append(node.val)
                  node = node.right
              i, j, count = 0, len(values) - 1, 0
              while i < j:
                  s = values[i] + values[j]
                  if s == k:
                      count += 1
                      i += 1
                      j -= 1
                  elif s < k:
                      i += 1
                  else:
                      j -= 1
              return count`,
        cpp: r`
          long long countPairs(TreeNode* root, long long k) {
              vector<long long> values;
              vector<TreeNode*> stack;
              TreeNode* node = root;
              while (!stack.empty() || node != nullptr) {
                  while (node != nullptr) {
                      stack.push_back(node);
                      node = node->left;
                  }
                  node = stack.back();
                  stack.pop_back();
                  values.push_back(node->val);
                  node = node->right;
              }
              long long i = 0, j = (long long)values.size() - 1, count = 0;
              while (i < j) {
                  long long s = values[i] + values[j];
                  if (s == k) {
                      count++;
                      i++;
                      j--;
                  } else if (s < k) {
                      i++;
                  } else {
                      j--;
                  }
              }
              return count;
          }`,
        java: r`
          static long countPairs(TreeNode root, long k) {
              ArrayList<Long> values = new ArrayList<>();
              ArrayList<TreeNode> stack = new ArrayList<>();
              TreeNode node = root;
              while (!stack.isEmpty() || node != null) {
                  while (node != null) {
                      stack.add(node);
                      node = node.left;
                  }
                  node = stack.remove(stack.size() - 1);
                  values.add(node.val);
                  node = node.right;
              }
              int i = 0, j = values.size() - 1;
              long count = 0;
              while (i < j) {
                  long s = values.get(i) + values.get(j);
                  if (s == k) {
                      count++;
                      i++;
                      j--;
                  } else if (s < k) {
                      i++;
                  } else {
                      j--;
                  }
              }
              return count;
          }`
      },
      stub: {
        python: r`
          def count_pairs(root, k):
              # Your code here
              return 0`,
        cpp: r`
          long long countPairs(TreeNode* root, long long k) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long countPairs(TreeNode root, long k) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(count_pairs(build_tree(vals), k))', cpp: 'cout << countPairs(buildTree(vals), k) << "\\n";', java: 'System.out.println(countPairs(buildTree(vals), k));' }
    }),
    solution: { explanation: ['The in-order walk gives a sorted list of different values; two pointers from both ends count the pairs with the sum k in one pass.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const { root, rest } = splitInput(input); const k = Number(rest[0]); const set = new Set(inorder(root)); let count = 0;
      for (const v of set) if (set.has(k - v) && v < k - v) count++;
      return String(count);
    },
    tests() {
      const g = rng(765); const out = ['7\n5 3 6 2 4 N 7\n9\n', '1\n5\n10\n', '2\n5 3\n8\n', '3\n4 2 6\n8\n'];
      for (const t of searchTrees(g)) {
        const v = inorder(t); const a = choose(g, v), b = choose(g, v);
        for (const k of (v.length < 1000 ? [a + b, randInt(g, -2000000000, 2000000000), 2 * choose(g, v), v[0] + v[v.length - 1]] : [a + b, v[0] + v[v.length - 1]])) out.push(`${treeText(t)}${k}\n`);
      }
      const line = Array.from({ length: 20000 }, (_, i) => i);
      for (const k of [19999, 30000, 1]) out.push(`${treeText(balancedBst(line))}${k}\n`);
      return out;
    }
  },

  {
    ...bst,
    inputFormat: [...TREE_INPUT, 'The third line has `q`, the number of queries.', 'The fourth line has `q` numbers `x`.'],
    constraints: [...LIMITS, '1 <= q <= 20000', '-10^9 <= x <= 10^9'],
    slug: 'inorder-successor-queries',
    title: 'The Next Larger Value, Many Times',
    tags: ['tree', 'bst', 'search'],
    concept: {
      title: 'Walk down once, remembering the last time you went left',
      body: [
        'The *in-order successor* of a number `x` in a binary search tree is the **smallest value in the tree that is larger than `x`**. The number `x` does not have to be in the tree. A search from the root finds it in one walk down:',
        '- if the current node is **larger than `x`**, it is a candidate for the answer (it is bigger than `x`), but a smaller candidate may exist on the left, so remember its value and go **left**;\n- otherwise (the node is `x` or smaller), the answer can only be on the **right**, so go right.',
        { code: 'def successor(root, x):\n    best = None\n    node = root\n    while node is not None:\n        if node.val > x:\n            best = node.val        # a candidate; maybe there is a smaller one on the left\n            node = node.left\n        else:\n            node = node.right\n    return best' },
        'The last remembered candidate is the answer, or there is none (`best` stays empty). One query takes O(h); for `q` queries the total is O(q * h), much better than scanning the whole tree for every query. The same walk with the roles of left and right swapped finds the predecessor, the largest value smaller than `x`.'
      ]
    },
    statement: ['A binary search tree and `q` numbers are given. For every number `x`, print the smallest value in the tree that is strictly larger than `x`, or `none` if there is no such value.'],
    outputFormat: ['`q` lines: for every query the smallest larger value or `none`.'],
    examples: [{ input: '7\n5 3 8 2 4 N 9\n5\n4 5 9 1 7\n', note: 'After 4 comes 5, after 5 comes 8, after 9 there is none, after 1 comes 2, after 7 comes 8.' }],
    hints: ['Walk down from the root; when a node is larger than x, remember it and go left.', 'When a node is not larger than x, go right.', 'The remembered value at the end is the answer; if nothing was remembered, print none.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'q:int', 'xs:int[q]'],
      solution: {
        python: r`
          def successor(root, x):
              best = None
              node = root
              while node is not None:
                  if node.val > x:
                      best = node.val
                      node = node.left
                  else:
                      node = node.right
              return best`,
        cpp: r`
          bool successor(TreeNode* root, long long x, long long& answer) {
              bool found = false;
              TreeNode* node = root;
              while (node != nullptr) {
                  if (node->val > x) {
                      answer = node->val;
                      found = true;
                      node = node->left;
                  } else {
                      node = node->right;
                  }
              }
              return found;
          }`,
        java: r`
          static Long successor(TreeNode root, long x) {
              Long best = null;
              TreeNode node = root;
              while (node != null) {
                  if (node.val > x) {
                      best = node.val;
                      node = node.left;
                  } else {
                      node = node.right;
                  }
              }
              return best;
          }`
      },
      stub: {
        python: r`
          def successor(root, x):
              # Your code here: return the smallest value larger than x, or None
              return None`,
        cpp: r`
          bool successor(TreeNode* root, long long x, long long& answer) {
              // Your code here: if there is a value larger than x, store the smallest one in answer and return true
              return false;
          }`,
        java: r`
          static Long successor(TreeNode root, long x) {
              // Your code here: return the smallest value larger than x, or null
              return null;
          }`
      },
      call: {
        python: 'root = build_tree(vals)\nout = []\nfor x in xs:\n    answer = successor(root, x)\n    out.append("none" if answer is None else str(answer))\nprint("\\n".join(out))',
        cpp: 'TreeNode* root = buildTree(vals);\nfor (long long x : xs) {\n    long long answer = 0;\n    if (successor(root, x, answer)) cout << answer << "\\n";\n    else cout << "none\\n";\n}',
        java: 'TreeNode root = buildTree(vals);\nStringBuilder sb = new StringBuilder();\nfor (long x : xs) {\n    Long answer = successor(root, x);\n    sb.append(answer == null ? "none" : String.valueOf(answer)).append("\\n");\n}\nSystem.out.print(sb);'
      }
    }),
    solution: { explanation: ['Walk down from the root: a node larger than x is remembered as a candidate and the walk goes left, otherwise it goes right. The last candidate is the answer.'], complexity: 'Time O(h) per query, space O(1) extra.' },
    solve(input) {
      const { root, rest } = splitInput(input); const xs = nums(rest[1]); const values = inorder(root); const out = [];
      for (const x of xs) { let lo = 0, hi = values.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (values[mid] <= x) lo = mid + 1; else hi = mid; } out.push(lo < values.length ? String(values[lo]) : 'none'); }
      return out.join('\n');
    },
    tests() {
      const g = rng(766); const out = ['7\n5 3 8 2 4 N 9\n5\n4 5 9 1 7\n', '1\n5\n3\n4 5 6\n'];
      for (const t of searchTrees(g).slice(1)) { const v = inorder(t); const xs = []; for (let i = 0; i < 60; i++) xs.push(i % 3 === 0 ? randInt(g, ...BIG) : choose(g, v) + (i % 3 === 1 ? 0 : -1)); xs.push(v[0] - 1, v[v.length - 1], v[v.length - 1] + 1); out.push(`${treeText(t)}${numberText(xs.map((x) => Math.max(-1000000000, Math.min(1000000000, x))))}`); }
      const big = randomBst(g, 20000, ...BIG); const v = inorder(big); out.push(`${treeText(big)}${numberText(many(20000, (i) => (i % 2 ? choose(g, v) : randInt(g, ...BIG))))}`);
      return out;
    }
  },

  {
    difficulty: 'medium',
    inputFormat: ['The first line has `n`, the number of values.', 'The second line has `n` different integers.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= every value <= 10^9, and all values are different'],
    slug: 'validate-preorder-of-bst',
    title: 'Could This Be a Pre-Order of a Search Tree?',
    tags: ['tree', 'bst', 'stack'],
    concept: {
      title: 'Keep a stack of the road to the right; a value may never go below a bound you have passed',
      body: [
        'A list of different numbers is given. Is it the **pre-order** list (node, left subtree, right subtree) of some binary search tree? Building the tree is not necessary: the pre-order list of a search tree has a strong structure that a **stack** can check in one pass.',
        'Read the numbers left to right. A number smaller than the previous one is the left child of the previous one (the road goes left), so push it. A number **larger** than the stack top is a right child of some earlier node: pop the stack while the top is smaller than the number; the last popped value is then the node whose right child this number is, so from now on **every later number must be larger than that node** (everything after the right child lies in the right subtree). That is a lower bound `low`.',
        { code: 'low = -infinity\nstack = []\nfor x in a:\n    if x < low:                      # it would have to be in an already closed left part\n        print("no")\n        break\n    while stack and stack[-1] < x:\n        low = stack.pop()            # we moved into the right subtree of this node\n    stack.append(x)\nelse:\n    print("yes")' },
        'Every number is pushed once and popped at most once, so the check is O(n). The bound `low` only ever increases, which is what makes the single pass enough.'
      ]
    },
    statement: ['Given `n` different integers, decide whether they are the pre-order list of some binary search tree (the root first, then the left subtree, then the right subtree; in a search tree every value in the left subtree is smaller than the node and every value in the right subtree is larger). Print `yes` or `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '5\n8 5 1 7 10\n', note: 'It is the pre-order of the tree with the root 8, left subtree 5 (children 1 and 7) and right child 10: yes.' }, { input: '5\n8 5 1 9 7\n', note: 'After 9 (which is larger than 8, so it belongs to the right subtree of 8) the number 7 cannot follow: no.' }],
    hints: ['Use a stack for the nodes whose right subtree has not started yet.', 'When a number is larger than the top of the stack, pop while the top is smaller; remember the last popped value as a lower bound.', 'If a later number is smaller than the lower bound, the answer is no.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        low = -10 ** 18
        stack = []
        valid = True
        for x in a:
            if x < low:
                valid = False
                break
            while stack and stack[-1] < x:
                low = stack.pop()
            stack.append(x)
        print("yes" if valid else "no")`,
      cpp: r`
        long long low = -1000000000000000000LL;
        vector<long long> stack;
        bool valid = true;
        for (long long x : a) {
            if (x < low) {
                valid = false;
                break;
            }
            while (!stack.empty() && stack.back() < x) {
                low = stack.back();
                stack.pop_back();
            }
            stack.push_back(x);
        }
        cout << (valid ? "yes" : "no") << "\n";`,
      java: r`
        long low = -1000000000000000000L;
        ArrayList<Long> stack = new ArrayList<>();
        boolean valid = true;
        for (long x : a) {
            if (x < low) {
                valid = false;
                break;
            }
            while (!stack.isEmpty() && stack.get(stack.size() - 1) < x) {
                low = stack.remove(stack.size() - 1);
            }
            stack.add(x);
        }
        System.out.println(valid ? "yes" : "no");`
    },
    solution: { explanation: ['A stack keeps the nodes whose right subtree has not started. A larger number pops the smaller tops, and the last popped value becomes a lower bound that every later number must exceed.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const a = nums(input.replace(/\n$/, '').split('\n')[1]); let low = -Infinity; const stack = [];
      for (const x of a) { if (x < low) return 'no'; while (stack.length && stack[stack.length - 1] < x) low = stack.pop(); stack.push(x); }
      return 'yes';
    },
    tests() {
      const g = rng(767); const out = ['5\n8 5 1 7 10\n', '5\n8 5 1 9 7\n', '1\n5\n', '2\n2 1\n', '2\n1 2\n', '3\n3 1 2\n', '3\n2 3 1\n'];
      const slow = (a) => { const t = bstFromInsertions(a); const p = preorder(t); return p.length === a.length && p.every((v, i) => v === a[i]); };
      const stackAnswer = (a) => { let low = -Infinity; const st = []; for (const x of a) { if (x < low) return 'no'; while (st.length && st[st.length - 1] < x) low = st.pop(); st.push(x); } return 'yes'; };
      const check = (a) => { if (slow(a) !== (stackAnswer(a) === 'yes')) throw new Error('validate-preorder-of-bst: the stack method and the tree method disagree'); };
      const yesList = [], noList = [];
      for (const [n, lo, hi] of [[5, -20, 20], [8, -50, 50], [30, -1000, 1000], [200, -100000, 100000], [3000, -1000000000, 1000000000], [20000, -1000000000, 1000000000]]) {
        const t = randomBst(g, n, lo, hi); const p = preorder(t); yesList.push(p);
        for (let tries = 0; tries < 2; tries++) { const q = p.slice(); const i = randInt(g, 0, n - 1), j = randInt(g, 0, n - 1); [q[i], q[j]] = [q[j], q[i]]; noList.push(q); }
        const q2 = p.slice(); q2.push(q2.shift()); noList.push(q2);
        const q3 = shuffle(g, p.slice()); noList.push(q3);
      }
      yesList.push(Array.from({ length: 20000 }, (_, i) => i - 10000), Array.from({ length: 20000 }, (_, i) => 10000 - i), preorder(balancedBst(Array.from({ length: 16383 }, (_, i) => i * 7 - 5000))));
      noList.push([...Array.from({ length: 19999 }, (_, i) => 1000 + i), 5], [...Array.from({ length: 10000 }, (_, i) => 10000 - i), 20000, 0], [7, 3, 9, 5, 4, 10, 2]);
      for (const a of [...yesList, ...noList]) { if (new Set(a).size !== a.length) continue; check(a); out.push(numberText(a)); }
      return out;
    }
  },

  {
    ...bst,
    inputFormat: [...TREE_INPUT, 'The third line has `q`, the number of queries.', 'Each of the next `q` lines has a kind of query and a number: `kth k` or `rank x`.'],
    constraints: [...LIMITS, '1 <= q <= 20000', '-10^9 <= x <= 10^9', 'For `kth`, 1 <= k <= number of nodes.'],
    slug: 'rank-and-kth-in-bst',
    title: 'Rank and k-th Value With Subtree Sizes',
    tags: ['tree', 'bst', 'design'],
    concept: {
      title: 'Store the size of every subtree, then descend in O(h)',
      body: [
        'Two questions are asked many times about a binary search tree: **which value is the k-th smallest?** and **how many values are smaller than `x`** (the *rank* of `x`)? Counting by walking the in-order list takes O(n) per query, too slow for many queries. The trick is to know, for every node, **how many nodes are in its subtree**. One pass computes these sizes (children before parents: the reverse of a level-order list does that, with no recursion).',
        'With sizes, both queries are one walk from the root. For the **k-th smallest** value at a node: let `left` be the size of its left subtree. If `k <= left` the answer is in the left subtree; if `k == left + 1` it is this node; otherwise go right and look for the `(k - left - 1)`-th value there.',
        { code: 'node = root\nwhile True:\n    left = size.get(node.left, 0)\n    if k <= left:\n        node = node.left\n    elif k == left + 1:\n        return node.val\n    else:\n        k -= left + 1\n        node = node.right' },
        'For the **rank** of `x` (the number of values smaller than `x`): at a node smaller than `x`, the node and its whole left subtree are smaller (add `left + 1`) and the walk continues to the right; at a node that is not smaller, go left. Both queries cost O(h).'
      ]
    },
    statement: ['A binary search tree is given, and then `q` queries. `kth k` asks for the k-th smallest value of the tree (counting from 1). `rank x` asks how many values in the tree are smaller than `x` (the number `x` does not have to be in the tree). Print the answer of every query on its own line.'],
    outputFormat: ['`q` lines, one number for every query.'],
    examples: [{ input: '7\n5 3 8 2 4 N 9\n4\nkth 1\nkth 4\nrank 5\nrank 100\n', note: 'The values in order are 2 3 4 5 8 9. The 1st is 2, the 4th is 5; three values (2, 3, 4) are smaller than 5; all six are smaller than 100.' }],
    hints: ['Compute the number of nodes in every subtree once.', 'For kth, compare k with the size of the left subtree to decide whether to go left, stop, or go right with a smaller k.', 'For rank, when the node is smaller than x add the size of its left subtree plus one and go right; otherwise go left.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'q:int', 'ops:word[q][2]'],
      includes: ['<unordered_map>'],
      solution: {
        python: r`
          def answer_queries(root, ops):
              order = [root]
              for node in order:
                  if node.left is not None:
                      order.append(node.left)
                  if node.right is not None:
                      order.append(node.right)
              size = {}
              for node in reversed(order):
                  size[node] = 1 + size.get(node.left, 0) + size.get(node.right, 0)
              out = []
              for kind, text in ops:
                  number = int(text)
                  node = root
                  if kind == "kth":
                      k = number
                      while True:
                          left = size.get(node.left, 0)
                          if k <= left:
                              node = node.left
                          elif k == left + 1:
                              out.append(node.val)
                              break
                          else:
                              k -= left + 1
                              node = node.right
                  else:
                      count = 0
                      while node is not None:
                          if node.val < number:
                              count += size.get(node.left, 0) + 1
                              node = node.right
                          else:
                              node = node.left
                      out.append(count)
              return out`,
        cpp: r`
          vector<long long> answerQueries(TreeNode* root, const vector<vector<string>>& ops) {
              vector<TreeNode*> order = {root};
              for (size_t i = 0; i < order.size(); i++) {
                  if (order[i]->left) order.push_back(order[i]->left);
                  if (order[i]->right) order.push_back(order[i]->right);
              }
              unordered_map<TreeNode*, long long> size;
              for (size_t i = order.size(); i-- > 0;) {
                  TreeNode* node = order[i];
                  size[node] = 1 + (node->left ? size[node->left] : 0) + (node->right ? size[node->right] : 0);
              }
              vector<long long> out;
              for (const vector<string>& op : ops) {
                  long long number = stoll(op[1]);
                  TreeNode* node = root;
                  if (op[0] == "kth") {
                      long long k = number;
                      for (;;) {
                          long long left = node->left ? size[node->left] : 0;
                          if (k <= left) {
                              node = node->left;
                          } else if (k == left + 1) {
                              out.push_back(node->val);
                              break;
                          } else {
                              k -= left + 1;
                              node = node->right;
                          }
                      }
                  } else {
                      long long count = 0;
                      while (node != nullptr) {
                          if (node->val < number) {
                              count += (node->left ? size[node->left] : 0) + 1;
                              node = node->right;
                          } else {
                              node = node->left;
                          }
                      }
                      out.push_back(count);
                  }
              }
              return out;
          }`,
        java: r`
          static List<Long> answerQueries(TreeNode root, String[][] ops) {
              List<TreeNode> order = new ArrayList<>();
              order.add(root);
              for (int i = 0; i < order.size(); i++) {
                  if (order.get(i).left != null) order.add(order.get(i).left);
                  if (order.get(i).right != null) order.add(order.get(i).right);
              }
              Map<TreeNode, Long> size = new HashMap<>();
              for (int i = order.size() - 1; i >= 0; i--) {
                  TreeNode node = order.get(i);
                  size.put(node, 1 + (node.left != null ? size.get(node.left) : 0L) + (node.right != null ? size.get(node.right) : 0L));
              }
              List<Long> out = new ArrayList<>();
              for (String[] op : ops) {
                  long number = Long.parseLong(op[1]);
                  TreeNode node = root;
                  if (op[0].equals("kth")) {
                      long k = number;
                      for (;;) {
                          long left = node.left != null ? size.get(node.left) : 0L;
                          if (k <= left) {
                              node = node.left;
                          } else if (k == left + 1) {
                              out.add(node.val);
                              break;
                          } else {
                              k -= left + 1;
                              node = node.right;
                          }
                      }
                  } else {
                      long count = 0;
                      while (node != null) {
                          if (node.val < number) {
                              count += (node.left != null ? size.get(node.left) : 0L) + 1;
                              node = node.right;
                          } else {
                              node = node.left;
                          }
                      }
                      out.add(count);
                  }
              }
              return out;
          }`
      },
      stub: {
        python: r`
          def answer_queries(root, ops):
              # Your code here: ops is a list of [kind, number] pairs (both are strings); return one number per query
              return []`,
        cpp: r`
          vector<long long> answerQueries(TreeNode* root, const vector<vector<string>>& ops) {
              // Your code here: each query is {kind, number} (both strings); return one number per query
              return {};
          }`,
        java: r`
          static List<Long> answerQueries(TreeNode root, String[][] ops) {
              // Your code here: each query is {kind, number} (both strings); return one number per query
              return new ArrayList<>();
          }`
      },
      call: {
        python: 'print("\\n".join(map(str, answer_queries(build_tree(vals), ops))))',
        cpp: 'for (long long value : answerQueries(buildTree(vals), ops)) cout << value << "\\n";',
        java: 'StringBuilder sb = new StringBuilder();\nfor (long value : answerQueries(buildTree(vals), ops)) sb.append(value).append("\\n");\nSystem.out.print(sb);'
      }
    }),
    solution: { explanation: ['One pass computes the number of nodes in every subtree. A kth query walks down comparing k with the size of the left subtree; a rank query adds the left size plus one whenever it passes a smaller node.'], complexity: 'Time O(n + q * h), space O(n).' },
    solve(input) {
      const { root, rest } = splitInput(input); const values = inorder(root); const q = Number(rest[0]); const out = [];
      for (let i = 1; i <= q; i++) {
        const [kind, text] = rest[i].split(' '); const number = Number(text);
        if (kind === 'kth') out.push(String(values[number - 1]));
        else { let lo = 0, hi = values.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (values[mid] < number) lo = mid + 1; else hi = mid; } out.push(String(lo)); }
      }
      return out.join('\n');
    },
    tests() {
      const g = rng(768); const out = ['7\n5 3 8 2 4 N 9\n4\nkth 1\nkth 4\nrank 5\nrank 100\n', '1\n5\n3\nkth 1\nrank 5\nrank 6\n'];
      for (const t of searchTrees(g).slice(1)) {
        const v = inorder(t); const lines = []; const m = Math.min(40, 2 * v.length);
        for (let i = 0; i < m; i++) lines.push(i % 2 ? `rank ${i % 4 === 1 ? randInt(g, ...BIG) : choose(g, v)}` : `kth ${randInt(g, 1, v.length)}`);
        lines.push('kth 1', `kth ${v.length}`, `rank ${v[0]}`, `rank ${Math.min(1000000000, v[v.length - 1] + 1)}`);
        out.push(`${treeText(t)}${lines.length}\n${lines.join('\n')}\n`);
      }
      const big = randomBst(g, 20000, ...BIG); const v = inorder(big); const lines = many(20000, (i) => (i % 2 ? `rank ${i % 4 === 1 ? randInt(g, ...BIG) : choose(g, v)}` : `kth ${randInt(g, 1, v.length)}`));
      out.push(`${treeText(big)}${lines.length}\n${lines.join('\n')}\n`);
      return out;
    }
  },

  {
    difficulty: 'medium',
    inputFormat: TWO_INPUT,
    constraints: ['1 <= number of nodes of each tree <= 20000', '-10^9 <= every value <= 10^9', 'The height of each tree is at most 800.', 'Both trees are binary search trees; inside one tree all values are different, but the same value may be in both trees.'],
    slug: 'all-elements-in-two-bsts',
    title: 'Merge Two Search Trees Into One Sorted List',
    tags: ['tree', 'bst', 'merge', 'two-pointers'],
    concept: {
      title: 'Two sorted lists from two in-order walks, then the merge step',
      body: [
        'The in-order walk of a binary search tree is a **sorted list**. So the sorted list of all values of two search trees is the merge of two sorted lists, the same "merge" step as in merge sort: keep an index in each list, and always take the smaller of the two current values.',
        { code: 'x, y = in_order(a), in_order(b)\nresult = []\ni = j = 0\nwhile i < len(x) and j < len(y):\n    if x[i] <= y[j]:\n        result.append(x[i])\n        i += 1\n    else:\n        result.append(y[j])\n        j += 1\nresult += x[i:] + y[j:]            # one of the two is empty; the other one still has its tail' },
        'The walks are O(n + m) and the merge is O(n + m), so the whole is linear: much better than putting everything in one list and sorting it (O((n + m) log (n + m))). The same idea is in "merge two sorted lists" and in the merge step of merge sort: whenever the inputs are already sorted, use their order.'
      ]
    },
    statement: ['Two binary search trees are given. Print all their values in increasing order on one line (a value that is in both trees is printed twice).'],
    outputFormat: ['All the values in increasing order on one line.'],
    examples: [{ input: '3\n2 1 4\n3\n1 0 3\n', note: 'The trees have the values 1 2 4 and 0 1 3: 0 1 1 2 3 4.' }],
    hints: ['An in-order walk of a search tree gives its values in increasing order.', 'Write both lists, then merge them with one index in each list.', 'Take the smaller current value each time; when one list ends, copy the rest of the other.'],
    program: treeProgram({
      io: TWO_IO,
      solution: {
        python: r`
          def inorder_values(root):
              values = []
              stack = []
              node = root
              while stack or node is not None:
                  while node is not None:
                      stack.append(node)
                      node = node.left
                  node = stack.pop()
                  values.append(node.val)
                  node = node.right
              return values

          def merge_trees(first, second):
              x, y = inorder_values(first), inorder_values(second)
              result = []
              i = j = 0
              while i < len(x) and j < len(y):
                  if x[i] <= y[j]:
                      result.append(x[i])
                      i += 1
                  else:
                      result.append(y[j])
                      j += 1
              return result + x[i:] + y[j:]`,
        cpp: r`
          vector<long long> inorderValues(TreeNode* root) {
              vector<long long> values;
              vector<TreeNode*> stack;
              TreeNode* node = root;
              while (!stack.empty() || node != nullptr) {
                  while (node != nullptr) {
                      stack.push_back(node);
                      node = node->left;
                  }
                  node = stack.back();
                  stack.pop_back();
                  values.push_back(node->val);
                  node = node->right;
              }
              return values;
          }

          vector<long long> mergeTrees(TreeNode* first, TreeNode* second) {
              vector<long long> x = inorderValues(first), y = inorderValues(second), result;
              size_t i = 0, j = 0;
              while (i < x.size() && j < y.size()) {
                  if (x[i] <= y[j]) result.push_back(x[i++]);
                  else result.push_back(y[j++]);
              }
              while (i < x.size()) result.push_back(x[i++]);
              while (j < y.size()) result.push_back(y[j++]);
              return result;
          }`,
        java: r`
          static List<Long> inorderValues(TreeNode root) {
              List<Long> values = new ArrayList<>();
              ArrayList<TreeNode> stack = new ArrayList<>();
              TreeNode node = root;
              while (!stack.isEmpty() || node != null) {
                  while (node != null) {
                      stack.add(node);
                      node = node.left;
                  }
                  node = stack.remove(stack.size() - 1);
                  values.add(node.val);
                  node = node.right;
              }
              return values;
          }

          static List<Long> mergeTrees(TreeNode first, TreeNode second) {
              List<Long> x = inorderValues(first), y = inorderValues(second);
              List<Long> result = new ArrayList<>();
              int i = 0, j = 0;
              while (i < x.size() && j < y.size()) {
                  if (x.get(i) <= y.get(j)) result.add(x.get(i++));
                  else result.add(y.get(j++));
              }
              while (i < x.size()) result.add(x.get(i++));
              while (j < y.size()) result.add(y.get(j++));
              return result;
          }`
      },
      stub: {
        python: r`
          def merge_trees(first, second):
              # Your code here: return the sorted list of all values of both trees
              return []`,
        cpp: r`
          vector<long long> mergeTrees(TreeNode* first, TreeNode* second) {
              // Your code here: return the sorted vector of all values of both trees
              return {};
          }`,
        java: r`
          static List<Long> mergeTrees(TreeNode first, TreeNode second) {
              // Your code here: return the sorted list of all values of both trees
              return new ArrayList<>();
          }`
      },
      call: {
        python: 'print(*merge_trees(build_tree(a), build_tree(b)))',
        cpp: 'vector<long long> merged = mergeTrees(buildTree(a), buildTree(b));\nfor (size_t i = 0; i < merged.size(); i++) cout << (i ? " " : "") << merged[i];\ncout << "\\n";',
        java: 'List<Long> merged = mergeTrees(buildTree(a), buildTree(b));\nStringBuilder sb = new StringBuilder();\nfor (int i = 0; i < merged.size(); i++) sb.append(i > 0 ? " " : "").append(merged.get(i));\nSystem.out.println(sb);'
      }
    }),
    solution: { explanation: ['An in-order walk of each tree gives a sorted list; the two lists are merged by always taking the smaller current value.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) { const [a, b] = twoTreesOfInput(input); return [...inorder(a), ...inorder(b)].sort((p, q) => p - q).join(' '); },
    tests() {
      const g = rng(769); const out = ['3\n2 1 4\n3\n1 0 3\n', '1\n5\n1\n5\n', '1\n5\n3\n8 7 9\n'];
      const pair = (n, m, lo, hi) => twoTreesText(bstFromInsertions(distinctValues(g, n, lo, hi)), bstFromInsertions(distinctValues(g, m, lo, hi)));
      for (const [n, m, lo, hi] of [[5, 6, -10, 10], [30, 20, -50, 50], [200, 300, -500, 500], [3000, 2000, -5000, 5000], [20000, 20000, -1000000000, 1000000000], [20000, 1, -1000000000, 1000000000], [1, 20000, -1000000000, 1000000000], [15000, 15000, -20000, 20000]]) out.push(pair(n, m, lo, hi));
      out.push(twoTreesText(bstFromInsertions(Array.from({ length: 700 }, (_, i) => i * 2)), bstFromInsertions(Array.from({ length: 700 }, (_, i) => 1400 - i * 2))));
      out.push(twoTreesText(balancedBst(Array.from({ length: 20000 }, (_, i) => i)), balancedBst(Array.from({ length: 20000 }, (_, i) => i))));
      return out;
    }
  }
];
