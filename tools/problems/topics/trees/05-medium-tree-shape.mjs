import { r, rng, randInt, nums } from '../../lib.mjs';
import { treeProgram } from '../../scaffolds.mjs';
import { node, treeText, treeOfInput, standardTrees, randomTree, completeTree, chainTree, randomBst, relabelDistinct, boundedTree, allNodes, levels, inorder, preorder, postorder, clone, height, distinctValues, bstFromInsertions, fromTokens, toTokens } from '../../treelib.mjs';

const TREE_INPUT = ['The first line has `t`, the number of words in the description of the tree.', 'The second line has the tree in level order: the root first, then the children of the nodes row by row from left to right. `N` stands for a missing child. There is no `N` at the end.'];
const LIMITS = ['1 <= number of nodes <= 20000', '-10^9 <= every value <= 10^9', 'The height of the tree is at most 800.'];
const BIG = [-1000000000, 1000000000];
const medium = { difficulty: 'medium', inputFormat: TREE_INPUT, constraints: LIMITS };
const numberLine = (list) => `${list.length}\n${list.join(' ')}\n`;
const distinctTrees = (g) => standardTrees(g, ...BIG).map((t) => relabelDistinct(g, t));
const splitInput = (input) => { const rs = input.replace(/\n$/, '').split('\n'); return { root: treeOfInput(rs.slice(0, 2).join('\n') + '\n'), rest: rs.slice(2) }; };
// the largest width of a level (positions numbered like a complete tree), with big integers
function widthOf(root) {
  let best = 0n; let level = [[root, 0n]];
  while (level.length) {
    const first = level[0][1]; const w = level[level.length - 1][1] - first + 1n; if (w > best) best = w;
    const next = [];
    for (const [c, i] of level) { const k = i - first; if (c.left) next.push([c.left, 2n * k]); if (c.right) next.push([c.right, 2n * k + 1n]); }
    level = next;
  }
  return best;
}
const ORDERS_INPUT =['The first line has `n`.', 'The second line has the `n` values in one order.', 'The third line has the `n` values in the other order.'];
const ORDERS_LIMITS = ['1 <= n <= 20000', '-10^9 <= every value <= 10^9, and all values are different', 'The height of the tree is at most 800.'];

export default [
  {
    ...medium,
    inputFormat: ORDERS_INPUT, constraints: ORDERS_LIMITS,
    slug: 'tree-from-preorder-inorder',
    title: 'Rebuild a Tree From Two Walks',
    tags: ['tree', 'recursion', 'divide-and-conquer', 'hashing'],
    concept: {
      title: 'The pre-order says who the root is, the in-order says what is on each side',
      body: [
        'A tree is not determined by its pre-order list alone, but **pre-order together with in-order** (with all values different) identifies it exactly. The pre-order starts with the **root**. In the in-order list the root splits the values into the ones of the **left subtree** (before the root) and the ones of the **right subtree** (after it).',
        'So build the tree recursively: take the next value of the pre-order as the root, find its position in the in-order list, build the left subtree from the in-order part on the left, and then the right subtree from the part on the right. The pre-order list is consumed from left to right with one shared index, because the left subtree is built (and uses up its values) before the right subtree.',
        { code: 'pos = {v: i for i, v in enumerate(inorder)}      # where every value is in the in-order list\nindex = 0\n\ndef make(lo, hi):                                # build from inorder[lo..hi]\n    global index\n    if lo > hi:\n        return None\n    v = preorder[index]\n    index += 1\n    root = TreeNode(v)\n    mid = pos[v]\n    root.left = make(lo, mid - 1)\n    root.right = make(mid + 1, hi)\n    return root' },
        'Looking up the position of the root in the in-order list with a dictionary makes the whole construction O(n); scanning the list each time would be O(n^2).'
      ]
    },
    statement: ['A binary tree has different values. Its pre-order list (root, left subtree, right subtree) and its in-order list (left subtree, root, right subtree) are given. Rebuild the tree and print it in level order in the same form as a tree in the input (`N` for a missing child, no `N` at the end).'],
    outputFormat: ['The tree in level order on one line.'],
    examples: [{ input: '5\n3 9 20 15 7\n9 3 15 20 7\n', note: 'The root is 3. The in-order list puts 9 on its left and 15 20 7 on its right: 3 9 20 N N 15 7.' }],
    hints: ['The first value of the pre-order list is the root.', 'Find the root in the in-order list: the values before it form the left subtree, the values after it the right subtree.', 'Use one shared index into the pre-order list, and build the left subtree before the right subtree.'],
    program: treeProgram({
      io: ['n:int', 'pre:int[n]', 'ino:int[n]'],
      includes: ['<unordered_map>'],
      solution: {
        python: r`
          def rebuild(pre, ino):
              pos = {v: i for i, v in enumerate(ino)}
              index = [0]

              def make(lo, hi):
                  if lo > hi:
                      return None
                  v = pre[index[0]]
                  index[0] += 1
                  root = TreeNode(v)
                  mid = pos[v]
                  root.left = make(lo, mid - 1)
                  root.right = make(mid + 1, hi)
                  return root

              return make(0, len(ino) - 1)`,
        cpp: r`
          TreeNode* make(const vector<long long>& pre, const unordered_map<long long, int>& pos, int& index, int lo, int hi) {
              if (lo > hi) return nullptr;
              long long v = pre[index++];
              TreeNode* root = new TreeNode(v);
              int mid = pos.at(v);
              root->left = make(pre, pos, index, lo, mid - 1);
              root->right = make(pre, pos, index, mid + 1, hi);
              return root;
          }

          TreeNode* rebuild(const vector<long long>& pre, const vector<long long>& ino) {
              unordered_map<long long, int> pos;
              for (size_t i = 0; i < ino.size(); i++) pos[ino[i]] = (int)i;
              int index = 0;
              return make(pre, pos, index, 0, (int)ino.size() - 1);
          }`,
        java: r`
          static TreeNode make(long[] pre, Map<Long, Integer> pos, int[] index, int lo, int hi) {
              if (lo > hi) return null;
              long v = pre[index[0]++];
              TreeNode root = new TreeNode(v);
              int mid = pos.get(v);
              root.left = make(pre, pos, index, lo, mid - 1);
              root.right = make(pre, pos, index, mid + 1, hi);
              return root;
          }

          static TreeNode rebuild(long[] pre, long[] ino) {
              Map<Long, Integer> pos = new HashMap<>();
              for (int i = 0; i < ino.length; i++) pos.put(ino[i], i);
              return make(pre, pos, new int[] {0}, 0, ino.length - 1);
          }`
      },
      stub: {
        python: r`
          def rebuild(pre, ino):
              # Your code here: return the root of the tree
              return None`,
        cpp: r`
          TreeNode* rebuild(const vector<long long>& pre, const vector<long long>& ino) {
              // Your code here: return the root of the tree
              return nullptr;
          }`,
        java: r`
          static TreeNode rebuild(long[] pre, long[] ino) {
              // Your code here: return the root of the tree
              return null;
          }`
      },
      call: { python: 'print_tree(rebuild(pre, ino))', cpp: 'printTree(rebuild(pre, ino));', java: 'printTree(rebuild(pre, ino));' }
    }),
    solution: { explanation: ['The next pre-order value is the root; its place in the in-order list splits the in-order range into the left and the right part, which are rebuilt recursively (left first, so the pre-order index advances correctly).'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const rs = input.replace(/\n$/, '').split('\n'); const pre = nums(rs[1]), ino = nums(rs[2]); const pos = new Map(ino.map((v, i) => [v, i])); let index = 0;
      const make = (lo, hi) => { if (lo > hi) return null; const v = pre[index++]; const mid = pos.get(v); const left = make(lo, mid - 1); const right = make(mid + 1, hi); return node(v, left, right); };
      return toTokens(make(0, ino.length - 1)).join(' ');
    },
    tests() {
      const g = rng(741); const out = ['5\n3 9 20 15 7\n9 3 15 20 7\n', '1\n5\n5\n', '2\n1 2\n2 1\n', '2\n1 2\n1 2\n'];
      for (const t of distinctTrees(g).slice(1)) out.push(`${numberLine(preorder(t))}${inorder(t).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ORDERS_INPUT.map((x, i) => (i === 1 ? 'The second line has the `n` values in in-order.' : i === 2 ? 'The third line has the `n` values in post-order.' : x)), constraints: ORDERS_LIMITS,
    slug: 'tree-from-inorder-postorder',
    title: 'Rebuild a Tree From In-Order and Post-Order',
    tags: ['tree', 'recursion', 'divide-and-conquer', 'hashing'],
    concept: {
      title: 'The post-order ends with the root, so read it from the back',
      body: [
        'This is the previous idea turned around. In the **post-order** list the root is the **last** value (left subtree, right subtree, root). So the post-order list is consumed from the **end**: take the last value as the root, find it in the in-order list, and split the in-order values into the left part and the right part.',
        'The order of the recursive calls changes too. Reading the post-order from the back, you meet the root first, then the values of the **right** subtree (they come just before the root in post-order), then the values of the left subtree. So the **right subtree must be built first**:',
        { code: 'index = n - 1                                   # the last value of the post-order list\n\ndef make(lo, hi):                                # build from inorder[lo..hi]\n    global index\n    if lo > hi:\n        return None\n    v = postorder[index]\n    index -= 1\n    root = TreeNode(v)\n    mid = pos[v]\n    root.right = make(mid + 1, hi)               # the right subtree first!\n    root.left = make(lo, mid - 1)\n    return root' },
        'If you build the left subtree first, the index points into the values of the right subtree and the result is wrong. Getting this order right is the whole difficulty of the problem.'
      ]
    },
    statement: ['A binary tree has different values. Its in-order list (left subtree, root, right subtree) and its post-order list (left subtree, right subtree, root) are given. Rebuild the tree and print it in level order in the same form as a tree in the input (`N` for a missing child, no `N` at the end).'],
    outputFormat: ['The tree in level order on one line.'],
    examples: [{ input: '5\n9 3 15 20 7\n9 15 7 20 3\n', note: 'The last value of the post-order list is the root 3: 3 9 20 N N 15 7.' }],
    hints: ['The last value of the post-order list is the root.', 'Split the in-order range at the root.', 'Walk the post-order list from the end and build the right subtree before the left subtree.'],
    program: treeProgram({
      io: ['n:int', 'ino:int[n]', 'post:int[n]'],
      includes: ['<unordered_map>'],
      solution: {
        python: r`
          def rebuild(ino, post):
              pos = {v: i for i, v in enumerate(ino)}
              index = [len(post) - 1]

              def make(lo, hi):
                  if lo > hi:
                      return None
                  v = post[index[0]]
                  index[0] -= 1
                  root = TreeNode(v)
                  mid = pos[v]
                  root.right = make(mid + 1, hi)
                  root.left = make(lo, mid - 1)
                  return root

              return make(0, len(ino) - 1)`,
        cpp: r`
          TreeNode* make(const vector<long long>& post, const unordered_map<long long, int>& pos, int& index, int lo, int hi) {
              if (lo > hi) return nullptr;
              long long v = post[index--];
              TreeNode* root = new TreeNode(v);
              int mid = pos.at(v);
              root->right = make(post, pos, index, mid + 1, hi);
              root->left = make(post, pos, index, lo, mid - 1);
              return root;
          }

          TreeNode* rebuild(const vector<long long>& ino, const vector<long long>& post) {
              unordered_map<long long, int> pos;
              for (size_t i = 0; i < ino.size(); i++) pos[ino[i]] = (int)i;
              int index = (int)post.size() - 1;
              return make(post, pos, index, 0, (int)ino.size() - 1);
          }`,
        java: r`
          static TreeNode make(long[] post, Map<Long, Integer> pos, int[] index, int lo, int hi) {
              if (lo > hi) return null;
              long v = post[index[0]--];
              TreeNode root = new TreeNode(v);
              int mid = pos.get(v);
              root.right = make(post, pos, index, mid + 1, hi);
              root.left = make(post, pos, index, lo, mid - 1);
              return root;
          }

          static TreeNode rebuild(long[] ino, long[] post) {
              Map<Long, Integer> pos = new HashMap<>();
              for (int i = 0; i < ino.length; i++) pos.put(ino[i], i);
              return make(post, pos, new int[] {post.length - 1}, 0, ino.length - 1);
          }`
      },
      stub: {
        python: r`
          def rebuild(ino, post):
              # Your code here: return the root of the tree
              return None`,
        cpp: r`
          TreeNode* rebuild(const vector<long long>& ino, const vector<long long>& post) {
              // Your code here: return the root of the tree
              return nullptr;
          }`,
        java: r`
          static TreeNode rebuild(long[] ino, long[] post) {
              // Your code here: return the root of the tree
              return null;
          }`
      },
      call: { python: 'print_tree(rebuild(ino, post))', cpp: 'printTree(rebuild(ino, post));', java: 'printTree(rebuild(ino, post));' }
    }),
    solution: { explanation: ['The post-order list is read from the end: the next value is the root, its place in the in-order list splits the range, and the right part is rebuilt before the left part.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const rs = input.replace(/\n$/, '').split('\n'); const ino = nums(rs[1]), post = nums(rs[2]); const pos = new Map(ino.map((v, i) => [v, i])); let index = post.length - 1;
      const make = (lo, hi) => { if (lo > hi) return null; const v = post[index--]; const mid = pos.get(v); const right = make(mid + 1, hi); const left = make(lo, mid - 1); return node(v, left, right); };
      return toTokens(make(0, ino.length - 1)).join(' ');
    },
    tests() {
      const g = rng(742); const out = ['5\n9 3 15 20 7\n9 15 7 20 3\n', '1\n5\n5\n', '2\n2 1\n2 1\n', '2\n1 2\n2 1\n'];
      for (const t of distinctTrees(g).slice(1)) out.push(`${numberLine(inorder(t))}${postorder(t).join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`.', 'The second line has `n` different integers: the pre-order list of a binary search tree.'], constraints: ORDERS_LIMITS.map((x) => (x.startsWith('-10^9') ? '-10^9 <= every value <= 10^9, and all values are different' : x)),
    slug: 'bst-from-preorder',
    title: 'A Search Tree From Its Pre-Order',
    tags: ['tree', 'bst', 'recursion'],
    concept: {
      title: 'Each value must fit between two limits; build while the next value fits',
      body: [
        'For a **search tree** the pre-order list alone is enough, because the order of the values tells where each one belongs. The first value is the root. The values after it that are smaller than the root belong to the left subtree, the others to the right subtree. Instead of searching for the split point, build the tree with **limits**: a recursive function `make(low, high)` builds the subtree whose values must lie strictly between `low` and `high`, and takes values from the list for as long as the next value fits.',
        { code: 'index = 0\n\ndef make(low, high):\n    global index\n    if index == len(pre) or not (low < pre[index] < high):\n        return None                              # the next value does not belong here\n    v = pre[index]\n    index += 1\n    root = TreeNode(v)\n    root.left = make(low, v)                     # smaller values, at most v\n    root.right = make(v, high)                   # larger values\n    return root' },
        'Each value is placed once and never examined again, so the time is O(n). It is the same limits idea as in the "is it a search tree?" check, now used for **building**.'
      ]
    },
    statement: ['The pre-order list (root, left subtree, right subtree) of a binary search tree is given. Rebuild the tree and print it in level order in the same form as a tree in the input (`N` for a missing child, no `N` at the end).'],
    outputFormat: ['The tree in level order on one line.'],
    examples: [{ input: '6\n8 5 1 7 10 12\n', note: 'The root is 8, the left subtree has 5 (with 1 and 7), the right subtree 10 (with the right child 12): 8 5 10 1 7 N 12.' }],
    hints: ['The first value is the root.', 'A function with a lower and an upper limit builds a subtree from the next values for as long as they fit between the limits.', 'The left subtree uses the limits (low, root), the right subtree (root, high).'],
    program: treeProgram({
      io: ['n:int', 'pre:int[n]'],
      solution: {
        python: r`
          def from_preorder(pre):
              index = [0]

              def make(low, high):
                  if index[0] == len(pre) or not (low < pre[index[0]] < high):
                      return None
                  v = pre[index[0]]
                  index[0] += 1
                  root = TreeNode(v)
                  root.left = make(low, v)
                  root.right = make(v, high)
                  return root

              return make(-10 ** 18, 10 ** 18)`,
        cpp: r`
          TreeNode* makeBst(const vector<long long>& pre, size_t& index, long long low, long long high) {
              if (index == pre.size() || !(low < pre[index] && pre[index] < high)) return nullptr;
              long long v = pre[index++];
              TreeNode* root = new TreeNode(v);
              root->left = makeBst(pre, index, low, v);
              root->right = makeBst(pre, index, v, high);
              return root;
          }

          TreeNode* fromPreorder(const vector<long long>& pre) {
              size_t index = 0;
              return makeBst(pre, index, -1000000000000000000LL, 1000000000000000000LL);
          }`,
        java: r`
          static TreeNode makeBst(long[] pre, int[] index, long low, long high) {
              if (index[0] == pre.length || !(low < pre[index[0]] && pre[index[0]] < high)) return null;
              long v = pre[index[0]++];
              TreeNode root = new TreeNode(v);
              root.left = makeBst(pre, index, low, v);
              root.right = makeBst(pre, index, v, high);
              return root;
          }

          static TreeNode fromPreorder(long[] pre) {
              return makeBst(pre, new int[] {0}, -1000000000000000000L, 1000000000000000000L);
          }`
      },
      stub: {
        python: r`
          def from_preorder(pre):
              # Your code here: return the root of the search tree
              return None`,
        cpp: r`
          TreeNode* fromPreorder(const vector<long long>& pre) {
              // Your code here: return the root of the search tree
              return nullptr;
          }`,
        java: r`
          static TreeNode fromPreorder(long[] pre) {
              // Your code here: return the root of the search tree
              return null;
          }`
      },
      call: { python: 'print_tree(from_preorder(pre))', cpp: 'printTree(fromPreorder(pre));', java: 'printTree(fromPreorder(pre));' }
    }),
    solution: { explanation: ['`make(low, high)` takes the next pre-order value as a node when it lies strictly between the limits, then builds the left subtree with the limits (low, value) and the right subtree with (value, high).'], complexity: 'Time O(n), space O(h).' },
    solve(input) { const a = nums(input.replace(/\n$/, '').split('\n')[1]); return toTokens(bstFromInsertions(a)).join(' '); },
    tests() {
      const g = rng(743); const out = ['6\n8 5 1 7 10 12\n', '1\n5\n', '3\n3 2 1\n', '3\n1 2 3\n'];
      for (const t of [randomBst(g, 7, ...BIG), randomBst(g, 31, ...BIG), randomBst(g, 500, ...BIG), randomBst(g, 5000, ...BIG), randomBst(g, 20000, ...BIG)]) out.push(numberLine(preorder(t)));
      out.push(numberLine(Array.from({ length: 790 }, (_, i) => i - 400)), numberLine(Array.from({ length: 790 }, (_, i) => 400 - i)));
      return out;
    }
  },

  {
    ...medium,
    slug: 'serialize-with-hashes',
    title: 'Write a Tree as One Line of Text',
    tags: ['tree', 'recursion', 'serialization'],
    concept: {
      title: 'Pre-order plus a mark for every missing child',
      body: [
        '*Serialization* turns a structure into text from which it can be rebuilt exactly. For a binary tree a pre-order walk is not enough (many trees have the same pre-order list), but if you also write a **mark for every missing child**, the text is unambiguous. Use `#` for a missing child and write the values and marks separated by commas: the tree `1` with the children `2` and `3` becomes `1,2,#,#,3,#,#`.',
        { code: 'def serialize(root, out):\n    if root is None:\n        out.append("#")                    # a missing child\n        return\n    out.append(str(root.val))\n    serialize(root.left, out)\n    serialize(root.right, out)\n\n# print(",".join(out))' },
        'Why is it enough? When the text is read from the left, a value means "a node, then its left subtree, then its right subtree", and a `#` means "an empty tree here", so the structure can be followed without any other information (the next problem rebuilds a tree from such a text). A tree with `n` nodes gives `2n + 1` words: `n` values and `n + 1` marks.'
      ]
    },
    statement: ['Write a binary tree as one line of text: do a pre-order walk, write the value of every node and a `#` for every missing child, and join all the words with commas (no spaces).'],
    outputFormat: ['The text on one line.'],
    examples: [{ input: '3\n1 2 3\n', note: 'The root 1, the left child 2 with two missing children, the right child 3 with two missing children: 1,2,#,#,3,#,#.' }],
    hints: ['Walk the tree in pre-order: the node first, then the left subtree, then the right subtree.', 'An empty tree writes a #.', 'Collect the words in a list and join them with commas at the end.'],
    program: treeProgram({
      solution: {
        python: r`
          def serialize(root, out):
              if root is None:
                  out.append("#")
                  return
              out.append(str(root.val))
              serialize(root.left, out)
              serialize(root.right, out)`,
        cpp: r`
          void serialize(TreeNode* root, vector<string>& out) {
              if (root == nullptr) {
                  out.push_back("#");
                  return;
              }
              out.push_back(to_string(root->val));
              serialize(root->left, out);
              serialize(root->right, out);
          }`,
        java: r`
          static void serialize(TreeNode root, List<String> out) {
              if (root == null) {
                  out.add("#");
                  return;
              }
              out.add(String.valueOf(root.val));
              serialize(root.left, out);
              serialize(root.right, out);
          }`
      },
      stub: {
        python: r`
          def serialize(root, out):
              # Your code here: append the words of the tree to the list out
              pass`,
        cpp: r`
          void serialize(TreeNode* root, vector<string>& out) {
              // Your code here: append the words of the tree to the vector out
          }`,
        java: r`
          static void serialize(TreeNode root, List<String> out) {
              // Your code here: append the words of the tree to the list out
          }`
      },
      call: {
        python: 'out = []\nserialize(build_tree(vals), out)\nprint(",".join(out))',
        cpp: 'vector<string> out;\nserialize(buildTree(vals), out);\nfor (size_t i = 0; i < out.size(); i++) cout << (i ? "," : "") << out[i];\ncout << "\\n";',
        java: 'List<String> out = new ArrayList<>();\nserialize(buildTree(vals), out);\nSystem.out.println(String.join(",", out));'
      }
    }),
    solution: { explanation: ['A pre-order walk appends the value of each node and a # for each missing child.'], complexity: 'Time O(n), space O(h) besides the output.' },
    solve(input) { const out = []; const go = (c) => { if (!c) { out.push('#'); return; } out.push(String(c.val)); go(c.left); go(c.right); }; go(treeOfInput(input)); return out.join(','); },
    tests() { const g = rng(744); return ['3\n1 2 3\n', '1\n5\n', '3\n1 N 2\n', ...standardTrees(g, ...BIG).slice(1).map(treeText)]; }
  },

  {
    ...medium,
    difficulty: 'medium',
    inputFormat: ['The first line has `m`, the number of words.', 'The second line has `m` words: a tree written with the pre-order walk, where `#` stands for a missing child (a value is a node, followed by the text of its left subtree and the text of its right subtree).'],
    constraints: ['1 <= number of nodes <= 20000', '-10^9 <= every value <= 10^9', 'The height of the tree is at most 800.', 'The text is a correct description of a tree.'],
    slug: 'deserialize-from-hashes',
    title: 'Rebuild a Tree From Its Text',
    tags: ['tree', 'recursion', 'serialization'],
    concept: {
      title: 'Read the words from left to right with one shared index',
      body: [
        'This is the reverse of the previous problem. The text is the pre-order walk with `#` for missing children. To rebuild the tree, **read the words from left to right** with a shared index and follow the same recursion that wrote them: a `#` is an empty tree; a number is a node, and the text that follows is first its left subtree and then its right subtree.',
        { code: 'index = 0\n\ndef read():\n    global index\n    word = words[index]\n    index += 1\n    if word == "#":\n        return None\n    root = TreeNode(int(word))\n    root.left = read()                       # the left subtree comes first in the text\n    root.right = read()\n    return root' },
        'The index must be shared by all calls (a list with one element in Python, a reference in C++, an array of one element in Java), so that after the left subtree is read, the right subtree continues exactly where the left one ended.'
      ]
    },
    statement: ['A binary tree is written as a pre-order walk where a `#` marks a missing child: a value is a node followed by the text of its left subtree and then the text of its right subtree. Rebuild the tree and print it in level order in the same form as a tree in the input (`N` for a missing child, no `N` at the end).'],
    outputFormat: ['The tree in level order on one line.'],
    examples: [{ input: '7\n1 2 # # 3 # #\n', note: 'The root 1 has the children 2 and 3: 1 2 3.' }],
    hints: ['Read the words one by one with an index that all calls share.', 'A # means an empty tree.', 'For a number, create the node, read its left subtree and then its right subtree.'],
    program: treeProgram({
      io: ['m:int', 'words:word[m]'],
      solution: {
        python: r`
          def rebuild(words):
              index = [0]

              def read():
                  word = words[index[0]]
                  index[0] += 1
                  if word == "#":
                      return None
                  root = TreeNode(int(word))
                  root.left = read()
                  root.right = read()
                  return root

              return read()`,
        cpp: r`
          TreeNode* readTree(const vector<string>& words, size_t& index) {
              const string& word = words[index++];
              if (word == "#") return nullptr;
              TreeNode* root = new TreeNode(stoll(word));
              root->left = readTree(words, index);
              root->right = readTree(words, index);
              return root;
          }

          TreeNode* rebuild(const vector<string>& words) {
              size_t index = 0;
              return readTree(words, index);
          }`,
        java: r`
          static TreeNode readTree(String[] words, int[] index) {
              String word = words[index[0]++];
              if (word.equals("#")) return null;
              TreeNode root = new TreeNode(Long.parseLong(word));
              root.left = readTree(words, index);
              root.right = readTree(words, index);
              return root;
          }

          static TreeNode rebuild(String[] words) {
              return readTree(words, new int[] {0});
          }`
      },
      stub: {
        python: r`
          def rebuild(words):
              # Your code here: return the root of the tree
              return None`,
        cpp: r`
          TreeNode* rebuild(const vector<string>& words) {
              // Your code here: return the root of the tree
              return nullptr;
          }`,
        java: r`
          static TreeNode rebuild(String[] words) {
              // Your code here: return the root of the tree
              return null;
          }`
      },
      call: { python: 'print_tree(rebuild(words))', cpp: 'printTree(rebuild(words));', java: 'printTree(rebuild(words));' }
    }),
    solution: { explanation: ['The words are read once from left to right: # gives an empty tree, a number gives a node whose left and right subtrees are read recursively with the shared index.'], complexity: 'Time O(n), space O(h).' },
    solve(input) {
      const words = input.replace(/\n$/, '').split('\n')[1].trim().split(/\s+/); let index = 0;
      const read = () => { const w = words[index++]; if (w === '#') return null; const left = read(); const right = read(); return node(Number(w), left, right); };
      return toTokens(read()).join(' ');
    },
    tests() {
      const ser = (root) => { const out = []; const go = (c) => { if (!c) { out.push('#'); return; } out.push(String(c.val)); go(c.left); go(c.right); }; go(root); return out; };
      const g = rng(745); const out = ['7\n1 2 # # 3 # #\n', '3\n5 # #\n', '5\n1 # 2 # #\n'];
      for (const t of standardTrees(g, ...BIG).slice(1)) { const words = ser(t); out.push(`${words.length}\n${words.join(' ')}\n`); }
      return out;
    }
  },

  {
    ...medium,
    slug: 'flatten-to-preorder-list',
    title: 'Straighten the Tree Into a List',
    tags: ['tree', 'recursion', 'in-place'],
    concept: {
      title: 'Hang the left subtree between the root and the right subtree',
      body: [
        'Rearrange the nodes of a tree **in place** so that the tree becomes a chain: every node has no left child, and its right child is the next node in the **pre-order** walk of the original tree. For each node the new order is: the node, then the whole (flattened) left subtree, then the whole (flattened) right subtree.',
        'A recursive function flattens a subtree and returns its **last node** (the tail of the chain). At a node: flatten both children, then move the left chain to the right side: `root.right = root.left`, `root.left = None`, and attach the old right chain to the **tail of the left chain**.',
        { code: 'def flatten(root):                       # returns the last node of the chain\n    if root is None:\n        return None\n    left_tail = flatten(root.left)\n    right_tail = flatten(root.right)\n    if root.left is not None:\n        left_tail.right = root.right         # the old right chain follows the left chain\n        root.right = root.left\n        root.left = None\n    return right_tail or left_tail or root' },
        'The returned tail is the right tail if it exists, otherwise the left tail, otherwise the node itself. The printed result is a tree whose level-order form is `v1 N v2 N v3 ...`.'
      ]
    },
    statement: ['Rearrange the nodes of a binary tree in place so that no node has a left child and the right child of every node is the next node in the pre-order walk of the original tree. Print the resulting tree in level order in the same form as a tree in the input (`N` for a missing child, no `N` at the end).'],
    outputFormat: ['The flattened tree in level order on one line.'],
    examples: [{ input: '7\n1 2 5 3 4 N 6\n', note: 'The pre-order is 1 2 3 4 5 6; the result is the chain 1 N 2 N 3 N 4 N 5 N 6.' }],
    hints: ['Flatten the left and the right subtree first.', 'Put the flattened left subtree in the place of the right subtree, and attach the old right subtree at its end.', 'Have the function return the last node of the chain, so that you can attach the old right chain to it.'],
    program: treeProgram({
      extra: {
        python: r`
          # Python in the browser cannot free a very long chain of nodes at once, and the result of this task is one long chain,
          # so free_tree() (called at the end) cuts the links first and the nodes are then freed one by one.
          def free_tree(root):
              stack = [root]
              while stack:
                  node = stack.pop()
                  for child in (node.left, node.right):
                      if child is not None:
                          stack.append(child)
                  node.left = None
                  node.right = None`
      },
      solution: {
        python: r`
          def flatten(root):
              if root is None:
                  return None
              left_tail = flatten(root.left)
              right_tail = flatten(root.right)
              if root.left is not None:
                  left_tail.right = root.right
                  root.right = root.left
                  root.left = None
              return right_tail or left_tail or root`,
        cpp: r`
          TreeNode* flatten(TreeNode* root) {
              if (root == nullptr) return nullptr;
              TreeNode* leftTail = flatten(root->left);
              TreeNode* rightTail = flatten(root->right);
              if (root->left != nullptr) {
                  leftTail->right = root->right;
                  root->right = root->left;
                  root->left = nullptr;
              }
              if (rightTail != nullptr) return rightTail;
              if (leftTail != nullptr) return leftTail;
              return root;
          }`,
        java: r`
          static TreeNode flatten(TreeNode root) {
              if (root == null) return null;
              TreeNode leftTail = flatten(root.left);
              TreeNode rightTail = flatten(root.right);
              if (root.left != null) {
                  leftTail.right = root.right;
                  root.right = root.left;
                  root.left = null;
              }
              if (rightTail != null) return rightTail;
              if (leftTail != null) return leftTail;
              return root;
          }`
      },
      stub: {
        python: r`
          def flatten(root):
              # Your code here: change the tree in place; return the last node of the chain
              return root`,
        cpp: r`
          TreeNode* flatten(TreeNode* root) {
              // Your code here: change the tree in place; return the last node of the chain
              return root;
          }`,
        java: r`
          static TreeNode flatten(TreeNode root) {
              // Your code here: change the tree in place; return the last node of the chain
              return root;
          }`
      },
      call: { python: 'root = build_tree(vals)\nflatten(root)\nprint_tree(root)\nfree_tree(root)', cpp: 'TreeNode* root = buildTree(vals);\nflatten(root);\nprintTree(root);', java: 'TreeNode root = buildTree(vals);\nflatten(root);\nprintTree(root);' }
    }),
    solution: { explanation: ['Both subtrees are flattened first; then the left chain is moved to the right side and the old right chain is attached to the tail of the left chain. The function returns the tail of the whole chain.'], complexity: 'Time O(n), space O(h).' },
    solve(input) { const v = preorder(treeOfInput(input)); const tokens = []; v.forEach((x, i) => { tokens.push(String(x)); if (i < v.length - 1) tokens.push('N'); }); return tokens.join(' '); },
    tests() { const g = rng(746); return ['7\n1 2 5 3 4 N 6\n', '1\n5\n', '3\n1 2 3\n', '2\n1 2\n', ...standardTrees(g, ...BIG).slice(1).map(treeText)]; }
  },

  {
    ...medium,
    slug: 'vertical-order',
    title: 'The Tree in Vertical Slices',
    tags: ['tree', 'traversal', 'sorting'],
    concept: {
      title: 'Give every node a column and a row, then group by column',
      body: [
        'Draw the tree on a grid: the root is in column 0, a left child is one column to the left of its parent, a right child one column to the right; the row is the depth. The *vertical order* lists the nodes column by column, from the leftmost column to the rightmost one. Inside one column the nodes are listed from top to bottom, and two nodes in the same row and column are listed in increasing order of their values.',
        { code: 'cells = {}                                    # column -> list of (row, value)\nstack = [(root, 0, 0)]\nwhile stack:\n    node, col, row = stack.pop()\n    cells.setdefault(col, []).append((row, node.val))\n    if node.left:  stack.append((node.left, col - 1, row + 1))\n    if node.right: stack.append((node.right, col + 1, row + 1))\n\nfor col in sorted(cells):\n    values = [value for row, value in sorted(cells[col])]\n    print(len(values), *values)' },
        'The traversal can visit the nodes in any order, because the final sort by `(row, value)` puts every column in the required order. Separating "collect the facts" (column, row, value) from "decide the output order" (sort) keeps the code simple.'
      ]
    },
    statement: ['Place a binary tree on a grid: the root is in column 0 and row 0; the left child of a node in column `c` and row `r` is in column `c - 1` and row `r + 1`; the right child is in column `c + 1` and row `r + 1`. Print the values column by column, from the leftmost column to the rightmost one. Inside a column list the values from the top row to the bottom row, and when two values are in the same row, in increasing order. Every column is one line: the number of its values, then the values.'],
    outputFormat: ['One line for every column, from left to right: the number of values in the column, then the values from top to bottom.'],
    examples: [{ input: '7\n3 9 20 N N 15 7\n', note: 'The columns are 9 | 3 15 | 20 | 7, so the lines are "1 9", "2 3 15", "1 20" and "1 7".' }],
    hints: ['Walk the tree and remember the column and the row of every node.', 'Collect (row, value) pairs for each column.', 'Sort the columns from left to right and the pairs of a column by row and then by value.'],
    program: treeProgram({
      includes: ['<map>', '<algorithm>'],
      solution: {
        python: r`
          def vertical(root):
              cells = {}
              stack = [(root, 0, 0)]
              while stack:
                  node, col, row = stack.pop()
                  cells.setdefault(col, []).append((row, node.val))
                  if node.left:
                      stack.append((node.left, col - 1, row + 1))
                  if node.right:
                      stack.append((node.right, col + 1, row + 1))
              return [[v for _, v in sorted(cells[col])] for col in sorted(cells)]`,
        cpp: r`
          vector<vector<long long>> vertical(TreeNode* root) {
              map<int, vector<pair<int, long long>>> cells;
              vector<TreeNode*> nodes = {root};
              vector<int> cols = {0}, rowsOf = {0};
              while (!nodes.empty()) {
                  TreeNode* node = nodes.back();
                  int col = cols.back(), row = rowsOf.back();
                  nodes.pop_back();
                  cols.pop_back();
                  rowsOf.pop_back();
                  cells[col].push_back({row, node->val});
                  if (node->left) {
                      nodes.push_back(node->left);
                      cols.push_back(col - 1);
                      rowsOf.push_back(row + 1);
                  }
                  if (node->right) {
                      nodes.push_back(node->right);
                      cols.push_back(col + 1);
                      rowsOf.push_back(row + 1);
                  }
              }
              vector<vector<long long>> result;
              for (auto& entry : cells) {
                  sort(entry.second.begin(), entry.second.end());
                  vector<long long> column;
                  for (const auto& cell : entry.second) column.push_back(cell.second);
                  result.push_back(column);
              }
              return result;
          }`,
        java: r`
          static List<List<Long>> vertical(TreeNode root) {
              TreeMap<Integer, List<long[]>> cells = new TreeMap<>();
              ArrayList<Object[]> stack = new ArrayList<>();
              stack.add(new Object[] {root, 0, 0});
              while (!stack.isEmpty()) {
                  Object[] top = stack.remove(stack.size() - 1);
                  TreeNode node = (TreeNode) top[0];
                  int col = (Integer) top[1], row = (Integer) top[2];
                  cells.computeIfAbsent(col, k -> new ArrayList<>()).add(new long[] {row, node.val});
                  if (node.left != null) stack.add(new Object[] {node.left, col - 1, row + 1});
                  if (node.right != null) stack.add(new Object[] {node.right, col + 1, row + 1});
              }
              List<List<Long>> result = new ArrayList<>();
              for (List<long[]> column : cells.values()) {
                  column.sort((a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1]));
                  List<Long> values = new ArrayList<>();
                  for (long[] cell : column) values.add(cell[1]);
                  result.add(values);
              }
              return result;
          }`
      },
      stub: {
        python: r`
          def vertical(root):
              # Your code here: return a list with one list of values for every column, from left to right
              return []`,
        cpp: r`
          vector<vector<long long>> vertical(TreeNode* root) {
              // Your code here: return one vector of values for every column, from left to right
              return {};
          }`,
        java: r`
          static List<List<Long>> vertical(TreeNode root) {
              // Your code here: return one list of values for every column, from left to right
              return new ArrayList<>();
          }`
      },
      call: {
        python: 'for column in vertical(build_tree(vals)):\n    print(len(column), *column)',
        cpp: 'for (const vector<long long>& column : vertical(buildTree(vals))) {\n    cout << column.size();\n    for (size_t i = 0; i < column.size(); i++) cout << " " << column[i];\n    cout << "\\n";\n}',
        java: 'StringBuilder sb = new StringBuilder();\nfor (List<Long> column : vertical(buildTree(vals))) {\n    sb.append(column.size());\n    for (int i = 0; i < column.size(); i++) sb.append(" ").append(column.get(i));\n    sb.append("\\n");\n}\nSystem.out.print(sb);'
      }
    }),
    solution: { explanation: ['A walk records for each node its column, row and value; the columns are then taken from left to right and the cells of each column sorted by row and by value.'], complexity: 'Time O(n log n), space O(n).' },
    solve(input) {
      const root = treeOfInput(input); const cells = new Map(); const stack = [[root, 0, 0]];
      while (stack.length) { const [c, col, row] = stack.pop(); if (!cells.has(col)) cells.set(col, []); cells.get(col).push([row, c.val]); if (c.left) stack.push([c.left, col - 1, row + 1]); if (c.right) stack.push([c.right, col + 1, row + 1]); }
      return [...cells.keys()].sort((a, b) => a - b).map((col) => { const list = cells.get(col).sort((p, q) => p[0] - q[0] || p[1] - q[1]).map((x) => x[1]); return `${list.length} ${list.join(' ')}`; }).join('\n');
    },
    tests() {
      const g = rng(747); const out = ['7\n3 9 20 N N 15 7\n', '1\n5\n', '7\n1 2 3 4 6 5 7\n', '3\n1 2 3\n'];
      for (const t of standardTrees(g, -5, 5).slice(1)) out.push(treeText(t));
      out.push(treeText(standardTrees(g, ...BIG)[6]), treeText(standardTrees(g, 0, 0)[9]));
      return out;
    }
  },

  {
    ...medium,
    constraints: [...LIMITS, 'The width of the tree (defined above) is at most 10^18.'],
    slug: 'maximum-width',
    title: 'The Widest Level',
    tags: ['tree', 'bfs', 'indexing'],
    concept: {
      title: 'Number the positions like a heap, and keep the numbers small',
      body: [
        'The *width* of a level is the number of positions between its leftmost and its rightmost node, **counting the positions of missing nodes in between**, as if the tree were complete: the width of a level is `last index - first index + 1`. Number the positions of every level from the left, starting at 0: the node at position `i` has its left child at position `2i` and its right child at position `2i + 1` of the next level (counted from the same starting point).',
        { code: 'best = 0\nlevel = [(root, 0)]                      # (node, index)\nwhile level:\n    first = level[0][1]\n    best = max(best, level[-1][1] - first + 1)\n    next_level = []\n    for node, index in level:\n        index -= first                    # keep the numbers small\n        if node.left:  next_level.append((node.left, 2 * index))\n        if node.right: next_level.append((node.right, 2 * index + 1))\n    level = next_level' },
        'The line `index -= first` matters. Without it, the indexes double at every level and overflow a 64-bit integer after about 60 levels (Python has big integers, but C++ and Java do not). Subtracting the first index of the level keeps the numbers as small as the width itself; the width is limited to 10^18 here, so they always fit.'
      ]
    },
    statement: ['The width of a level of a binary tree is the number of positions from its leftmost node to its rightmost node (both included), counting the positions of missing nodes between them as if the tree were complete (the children of the node at position `i` of a level are at the positions `2i` and `2i + 1` of the next level). Print the largest width over all levels.'],
    outputFormat: ['Print the maximum width.'],
    examples: [{ input: '7\n1 3 2 5 N N 9\n', note: 'The last level has the nodes 5 (position 0) and 9 (position 3): width 4.' }],
    hints: ['Number the positions on each level: the children of position i get 2i and 2i + 1.', 'The width of a level is the last position minus the first position plus 1.', 'Subtract the first position of each level so that the numbers do not grow beyond 64 bits.'],
    program: treeProgram({
      solution: {
        python: r`
          def max_width(root):
              best = 0
              level = [(root, 0)]
              while level:
                  first = level[0][1]
                  best = max(best, level[-1][1] - first + 1)
                  next_level = []
                  for node, index in level:
                      index -= first
                      if node.left:
                          next_level.append((node.left, 2 * index))
                      if node.right:
                          next_level.append((node.right, 2 * index + 1))
                  level = next_level
              return best`,
        cpp: r`
          long long maxWidth(TreeNode* root) {
              long long best = 0;
              vector<pair<TreeNode*, long long>> level = {{root, 0}};
              while (!level.empty()) {
                  long long first = level.front().second;
                  best = max(best, level.back().second - first + 1);
                  vector<pair<TreeNode*, long long>> next;
                  for (const auto& entry : level) {
                      long long index = entry.second - first;
                      if (entry.first->left) next.push_back({entry.first->left, 2 * index});
                      if (entry.first->right) next.push_back({entry.first->right, 2 * index + 1});
                  }
                  level = next;
              }
              return best;
          }`,
        java: r`
          static long maxWidth(TreeNode root) {
              long best = 0;
              List<TreeNode> nodes = new ArrayList<>();
              List<Long> indexes = new ArrayList<>();
              nodes.add(root);
              indexes.add(0L);
              while (!nodes.isEmpty()) {
                  long first = indexes.get(0);
                  best = Math.max(best, indexes.get(indexes.size() - 1) - first + 1);
                  List<TreeNode> nextNodes = new ArrayList<>();
                  List<Long> nextIndexes = new ArrayList<>();
                  for (int i = 0; i < nodes.size(); i++) {
                      long index = indexes.get(i) - first;
                      if (nodes.get(i).left != null) {
                          nextNodes.add(nodes.get(i).left);
                          nextIndexes.add(2 * index);
                      }
                      if (nodes.get(i).right != null) {
                          nextNodes.add(nodes.get(i).right);
                          nextIndexes.add(2 * index + 1);
                      }
                  }
                  nodes = nextNodes;
                  indexes = nextIndexes;
              }
              return best;
          }`
      },
      stub: {
        python: r`
          def max_width(root):
              # Your code here
              return 0`,
        cpp: r`
          long long maxWidth(TreeNode* root) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long maxWidth(TreeNode root) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(max_width(build_tree(vals)))', cpp: 'cout << maxWidth(buildTree(vals)) << "\\n";', java: 'System.out.println(maxWidth(buildTree(vals)));' },
      includes: ['<algorithm>', '<utility>']
    }),
    solution: { explanation: ['Each level keeps (node, position) pairs; its width is last minus first plus one. Positions are shifted by the first position of the level before the children are numbered 2i and 2i + 1, so they never overflow.'], complexity: 'Time O(n), space O(width of nodes).' },
    solve(input) { return String(widthOf(treeOfInput(input))); },
    tests() {
      const g = rng(748); const out = ['7\n1 3 2 5 N N 9\n', '1\n5\n', '3\n1 2 3\n'];
      for (const t of standardTrees(g, ...BIG).slice(1)) out.push(treeText(t));
      const forks = (d) => node(1, chainTree(g, d, 'left', 1, 1), chainTree(g, d, 'right', 1, 1));
      out.push(treeText(forks(30)), treeText(forks(55)), treeText(boundedTree(g, 3000, 14, -5, 5)), treeText(boundedTree(g, 3000, 40, -5, 5)));
      for (const t of out) if (widthOf(treeOfInput(t)) > 1000000000000000000n) throw new Error('width too big');
      return out;
    }
  },

  {
    ...medium,
    inputFormat: [...TREE_INPUT, 'The third line has `target` and `k`.'],
    constraints: [...LIMITS, 'All values are different.', '`target` is the value of a node of the tree.', '0 <= k <= 20000'],
    slug: 'nodes-at-distance-k',
    title: 'All Nodes at Distance k',
    tags: ['tree', 'bfs', 'graph'],
    concept: {
      title: 'Give every node a link to its parent, then search outwards',
      body: [
        'The distance between two nodes is the number of edges on the road between them. The nodes at distance `k` from a **target** node can be below it (in its subtree), but also above it or in other branches, reached by going **up** to the parent first. A tree node only knows its children, so first record the **parent** of every node. Then the tree is an ordinary graph where each node has up to three neighbours (two children and the parent).',
        'A breadth-first search from the target, one layer at a time, finds the nodes at distance exactly `k`: after `k` rounds, the nodes in the queue are the answer. A set of visited nodes prevents going back to the node we came from.',
        { code: 'parent = {root: None}\nfor node in all nodes (a walk): record parent[child] = node\n\nlayer = [target]\nseen = {target}\nfor _ in range(k):\n    next_layer = []\n    for node in layer:\n        for nb in (node.left, node.right, parent[node]):\n            if nb is not None and nb not in seen:\n                seen.add(nb)\n                next_layer.append(nb)\n    layer = next_layer\n# layer now holds the nodes at distance k' },
        'This "turn the tree into a graph with parent links" step is useful whenever a question needs to move upwards. The values are printed in increasing order. If no node is at distance `k` (the layer becomes empty), print `-1`.'
      ]
    },
    statement: ['All values of a binary tree are different. Given the value `target` of a node and a number `k`, print the values of all nodes whose distance from the `target` node is exactly `k` (the distance is the number of edges on the road between two nodes; the road may go up and down). Print the values in increasing order on one line separated by spaces, or `-1` if there is no such node.'],
    outputFormat: ['The values in increasing order on one line, or `-1`.'],
    examples: [{ input: '11\n3 5 1 6 2 0 8 N N 7 4\n5 2\n', note: 'The nodes 7 and 4 (below 2) and 1 (up to 3, then down to 1) are at distance 2 from 5.' }],
    hints: ['A tree node cannot reach its parent: record the parent of each node first.', 'Search from the target layer by layer, moving to the children and to the parent.', 'Remember the visited nodes so that the search does not turn back.'],
    program: treeProgram({
      io: ['t:int', 'vals:word[t]', 'target:int k:int'],
      includes: ['<unordered_map>', '<unordered_set>', '<algorithm>'],
      solution: {
        python: r`
          def at_distance(root, target, k):
              parent = {root: None}
              found = None
              stack = [root]
              while stack:
                  node = stack.pop()
                  if node.val == target:
                      found = node
                  for child in (node.left, node.right):
                      if child is not None:
                          parent[child] = node
                          stack.append(child)
              layer = [found]
              seen = {found}
              for _ in range(k):
                  next_layer = []
                  for node in layer:
                      for nb in (node.left, node.right, parent[node]):
                          if nb is not None and nb not in seen:
                              seen.add(nb)
                              next_layer.append(nb)
                  layer = next_layer
              return sorted(node.val for node in layer)`,
        cpp: r`
          vector<long long> atDistance(TreeNode* root, long long target, long long k) {
              unordered_map<TreeNode*, TreeNode*> parent;
              parent[root] = nullptr;
              TreeNode* found = nullptr;
              vector<TreeNode*> stack = {root};
              while (!stack.empty()) {
                  TreeNode* node = stack.back();
                  stack.pop_back();
                  if (node->val == target) found = node;
                  for (TreeNode* child : {node->left, node->right}) {
                      if (child != nullptr) {
                          parent[child] = node;
                          stack.push_back(child);
                      }
                  }
              }
              vector<TreeNode*> layer = {found};
              unordered_set<TreeNode*> seen = {found};
              for (long long step = 0; step < k && !layer.empty(); step++) {
                  vector<TreeNode*> next;
                  for (TreeNode* node : layer) {
                      for (TreeNode* nb : {node->left, node->right, parent[node]}) {
                          if (nb != nullptr && !seen.count(nb)) {
                              seen.insert(nb);
                              next.push_back(nb);
                          }
                      }
                  }
                  layer = next;
              }
              vector<long long> result;
              for (TreeNode* node : layer) result.push_back(node->val);
              sort(result.begin(), result.end());
              return result;
          }`,
        java: r`
          static List<Long> atDistance(TreeNode root, long target, long k) {
              Map<TreeNode, TreeNode> parent = new HashMap<>();
              parent.put(root, null);
              TreeNode found = null;
              ArrayList<TreeNode> stack = new ArrayList<>();
              stack.add(root);
              while (!stack.isEmpty()) {
                  TreeNode node = stack.remove(stack.size() - 1);
                  if (node.val == target) found = node;
                  for (TreeNode child : new TreeNode[] {node.left, node.right}) {
                      if (child != null) {
                          parent.put(child, node);
                          stack.add(child);
                      }
                  }
              }
              List<TreeNode> layer = new ArrayList<>();
              layer.add(found);
              Set<TreeNode> seen = new HashSet<>();
              seen.add(found);
              for (long step = 0; step < k && !layer.isEmpty(); step++) {
                  List<TreeNode> next = new ArrayList<>();
                  for (TreeNode node : layer) {
                      for (TreeNode nb : new TreeNode[] {node.left, node.right, parent.get(node)}) {
                          if (nb != null && !seen.contains(nb)) {
                              seen.add(nb);
                              next.add(nb);
                          }
                      }
                  }
                  layer = next;
              }
              List<Long> result = new ArrayList<>();
              for (TreeNode node : layer) result.add(node.val);
              Collections.sort(result);
              return result;
          }`
      },
      stub: {
        python: r`
          def at_distance(root, target, k):
              # Your code here: return the sorted list of the values at distance k from the node with the value target
              return []`,
        cpp: r`
          vector<long long> atDistance(TreeNode* root, long long target, long long k) {
              // Your code here: return the sorted values at distance k from the node with the value target
              return {};
          }`,
        java: r`
          static List<Long> atDistance(TreeNode root, long target, long k) {
              // Your code here: return the sorted values at distance k from the node with the value target
              return new ArrayList<>();
          }`
      },
      call: {
        python: 'answer = at_distance(build_tree(vals), target, k)\nprint(*answer if answer else [-1])',
        cpp: 'vector<long long> answer = atDistance(buildTree(vals), target, k);\nif (answer.empty()) cout << -1;\nfor (size_t i = 0; i < answer.size(); i++) cout << (i ? " " : "") << answer[i];\ncout << "\\n";',
        java: 'List<Long> answer = atDistance(buildTree(vals), target, k);\nif (answer.isEmpty()) {\n    System.out.println(-1);\n} else {\n    StringBuilder sb = new StringBuilder();\n    for (int i = 0; i < answer.size(); i++) sb.append(i > 0 ? " " : "").append(answer.get(i));\n    System.out.println(sb);\n}'
      }
    }),
    solution: { explanation: ['A walk records the parent of every node. A breadth-first search from the target, over children and parent links with a visited set, runs for k rounds; the nodes left in the layer are at distance k.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const { root, rest } = splitInput(input); const [target, k] = rest[0].trim().split(/\s+/).map(Number);
      const adj = new Map(); const add = (a, b) => { if (!adj.has(a)) adj.set(a, []); adj.get(a).push(b); }; for (const c of allNodes(root)) { for (const ch of [c.left, c.right]) if (ch) { add(c.val, ch.val); add(ch.val, c.val); } } if (!adj.has(root.val)) adj.set(root.val, []);
      const dist = new Map([[target, 0]]); const queue = [target]; for (let h = 0; h < queue.length; h++) for (const nb of adj.get(queue[h])) if (!dist.has(nb)) { dist.set(nb, dist.get(queue[h]) + 1); queue.push(nb); }
      const answer = [...dist].filter(([, d]) => d === k).map(([v]) => v).sort((a, b) => a - b); return answer.length ? answer.join(' ') : '-1';
    },
    tests() {
      const g = rng(749); const out = ['11\n3 5 1 6 2 0 8 N N 7 4\n5 2\n', '1\n5\n5 0\n', '1\n5\n5 1\n', '3\n1 2 3\n2 2\n'];
      for (const t of distinctTrees(g).slice(1)) { const nodes = allNodes(t); const target = nodes[randInt(g, 0, nodes.length - 1)].val; for (const k of [0, 1, randInt(g, 2, 6), randInt(g, 7, 40), 20000]) out.push(`${treeText(t)}${target} ${k}\n`); }
      return out;
    }
  },

  {
    ...medium,
    constraints: ['1 <= number of nodes <= 20000', '0 <= every value <= 10^9', 'The height of the tree is at most 800.'],
    slug: 'house-robber-on-a-tree',
    title: 'Choose Nodes That Are Not Neighbours',
    tags: ['tree', 'recursion', 'tree-dp'],
    concept: {
      title: 'For every subtree compute two answers: with its root and without it',
      body: [
        'Choose a set of nodes so that **no two chosen nodes are directly connected** (no parent and child are both chosen), and the sum of the chosen values is as large as possible. (A thief robs houses on a tree-shaped street; robbing two connected houses sets off the alarm.) For each node there are two cases, and the answer for a subtree depends on which case its root is in:',
        '- **take** the node: its children must be skipped, so the total is `value + skip(left) + skip(right)`;\n- **skip** the node: its children are free, each one is taken or skipped, whichever is better: `max(take(left), skip(left)) + max(take(right), skip(right))`.',
        { code: 'def rob(root):                            # returns (best if root taken, best if root skipped)\n    if root is None:\n        return (0, 0)\n    lt, ls = rob(root.left)\n    rt, rs = rob(root.right)\n    take = root.val + ls + rs\n    skip = max(lt, ls) + max(rt, rs)\n    return (take, skip)\n\n# the answer: max(rob(root))' },
        'Returning a **pair** from each subtree is the typical form of *tree dynamic programming*: the facts about a subtree that its parent needs are computed once, bottom-up. Doing it with a single number per node does not work, because the parent has to know about both situations of its children.'
      ]
    },
    statement: ['Every node of a binary tree has a non-negative value. Choose some nodes so that no node and its parent are both chosen. Print the largest possible sum of the values of the chosen nodes.'],
    outputFormat: ['Print the largest sum.'],
    examples: [{ input: '7\n3 2 3 N 3 N 1\n', note: 'Choose the root 3 and the two bottom nodes 3 and 1: 3 + 3 + 1 = 7.' }],
    hints: ['For each subtree compute the best sum if its root is taken and the best sum if its root is skipped.', 'If the root is taken, both children are skipped.', 'If the root is skipped, each child contributes the better of its two answers.'],
    program: treeProgram({
      solution: {
        python: r`
          def rob(root):
              if root is None:
                  return (0, 0)
              lt, ls = rob(root.left)
              rt, rs = rob(root.right)
              take = root.val + ls + rs
              skip = max(lt, ls) + max(rt, rs)
              return (take, skip)`,
        cpp: r`
          pair<long long, long long> rob(TreeNode* root) {
              if (root == nullptr) return {0, 0};
              pair<long long, long long> l = rob(root->left), rt = rob(root->right);
              long long take = root->val + l.second + rt.second;
              long long skip = max(l.first, l.second) + max(rt.first, rt.second);
              return {take, skip};
          }`,
        java: r`
          static long[] rob(TreeNode root) {
              if (root == null) return new long[] {0, 0};
              long[] l = rob(root.left), rt = rob(root.right);
              long take = root.val + l[1] + rt[1];
              long skip = Math.max(l[0], l[1]) + Math.max(rt[0], rt[1]);
              return new long[] {take, skip};
          }`
      },
      stub: {
        python: r`
          def rob(root):
              # Your code here: return (best if the root is taken, best if the root is skipped)
              return (0, 0)`,
        cpp: r`
          pair<long long, long long> rob(TreeNode* root) {
              // Your code here: return {best if the root is taken, best if the root is skipped}
              return {0, 0};
          }`,
        java: r`
          static long[] rob(TreeNode root) {
              // Your code here: return {best if the root is taken, best if the root is skipped}
              return new long[] {0, 0};
          }`
      },
      call: { python: 'print(max(rob(build_tree(vals))))', cpp: 'pair<long long, long long> best = rob(buildTree(vals));\ncout << max(best.first, best.second) << "\\n";', java: 'long[] best = rob(buildTree(vals));\nSystem.out.println(Math.max(best[0], best[1]));' },
      includes: ['<algorithm>', '<utility>']
    }),
    solution: { explanation: ['Each subtree returns the pair (best sum with its root taken, best sum with its root skipped); taking the root forces both children to be skipped, skipping it lets each child choose its better case.'], complexity: 'Time O(n), space O(h).' },
    solve(input) {
      const root = treeOfInput(input); const order = []; const parentOf = new Map(); const stack = [root]; while (stack.length) { const c = stack.pop(); order.push(c); for (const k of [c.left, c.right]) if (k) { parentOf.set(k, c); stack.push(k); } }
      const take = new Map(), skip = new Map(); for (const c of order.reverse()) { const lt = c.left ? take.get(c.left) : 0, ls = c.left ? skip.get(c.left) : 0, rt = c.right ? take.get(c.right) : 0, rs = c.right ? skip.get(c.right) : 0; take.set(c, c.val + ls + rs); skip.set(c, Math.max(lt, ls) + Math.max(rt, rs)); }
      return String(Math.max(take.get(root), skip.get(root)));
    },
    tests() {
      const g = rng(750); const out = ['7\n3 2 3 N 3 N 1\n', '1\n5\n', '3\n1 2 3\n'];
      for (const t of standardTrees(g, 0, 1000000000).slice(1)) out.push(treeText(t));
      out.push(treeText(chainTree(g, 800, 'left', 5, 5)), treeText(completeTree(g, 4095, 7, 7)));
      return out;
    }
  }
];
