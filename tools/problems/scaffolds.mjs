// Shared helper code for problems whose data structure cannot be read from plain numbers.
//
// Linked lists. The judge gives a program only text on stdin, so a linked-list problem reads the VALUES of the list, and its starter
// code builds the list for the learner and prints the answer list. The learner only writes the function that works on the nodes.
// `listProgram` turns a short description into a `program` entry (see programs.mjs): the starter shows the node type, the helpers
// to build and print a list, an empty function with the right signature, and the code that reads the input and calls it.

import { r } from './lib.mjs';
import { dedent } from './programs.mjs';

export const LIST = {
  python: r`
    # Every node is also remembered in this list. Python in the browser cannot free a very long chain of nodes at once,
    # so free_nodes() (called at the end) cuts the links first and the nodes are then freed one by one.
    all_nodes = []


    class ListNode:
        def __init__(self, val, next=None):
            self.val = val
            self.next = next
            all_nodes.append(self)


    def free_nodes():
        for node in all_nodes:
            node.next = None
            if hasattr(node, "random"):
                node.random = None
        all_nodes.clear()


    # Builds a list from the values. If pos is 0 or more, the last node points back to the node at index pos (a cycle).
    def build_list(values, pos=-1):
        head = None
        for v in reversed(values):
            head = ListNode(v, head)
        if pos >= 0:
            tail = head
            while tail.next is not None:
                tail = tail.next
            target = head
            for _ in range(pos):
                target = target.next
            tail.next = target
        return head


    # Prints the values of a list on one line ("empty" for an empty list).
    def print_list(head):
        out = []
        while head is not None:
            out.append(head.val)
            head = head.next
        print(*(out if out else ["empty"]))`,
  cpp: r`
    struct ListNode {
        long long val;
        ListNode* next;
        ListNode(long long v) : val(v), next(nullptr) {}
    };

    // Builds a list from the values. If pos is 0 or more, the last node points back to the node at index pos (a cycle).
    ListNode* buildList(const vector<long long>& values, int pos = -1) {
        ListNode* head = nullptr;
        for (int i = (int) values.size() - 1; i >= 0; i--) {
            ListNode* node = new ListNode(values[i]);
            node->next = head;
            head = node;
        }
        if (pos >= 0) {
            ListNode* tail = head;
            while (tail->next != nullptr) tail = tail->next;
            ListNode* target = head;
            for (int i = 0; i < pos; i++) target = target->next;
            tail->next = target;
        }
        return head;
    }

    // Prints the values of a list on one line ("empty" for an empty list).
    void printList(ListNode* head) {
        if (head == nullptr) {
            cout << "empty\n";
            return;
        }
        for (ListNode* p = head; p != nullptr; p = p->next) cout << p->val << (p->next ? " " : "\n");
    }`,
  java: r`
    static class ListNode {
        long val;
        ListNode next;

        ListNode(long val) {
            this.val = val;
        }
    }

    // Builds a list from the values. If pos is 0 or more, the last node points back to the node at index pos (a cycle).
    static ListNode buildList(long[] values, int pos) {
        ListNode head = null;
        for (int i = values.length - 1; i >= 0; i--) {
            ListNode node = new ListNode(values[i]);
            node.next = head;
            head = node;
        }
        if (pos >= 0) {
            ListNode tail = head;
            while (tail.next != null) tail = tail.next;
            ListNode target = head;
            for (int i = 0; i < pos; i++) target = target.next;
            tail.next = target;
        }
        return head;
    }

    static ListNode buildList(long[] values) {
        return buildList(values, -1);
    }

    // Prints the values of a list on one line ("empty" for an empty list).
    static void printList(ListNode head) {
        if (head == null) {
            System.out.println("empty");
            return;
        }
        StringBuilder sb = new StringBuilder();
        for (ListNode p = head; p != null; p = p.next) sb.append(p.val).append(p.next != null ? " " : "");
        System.out.println(sb);
    }`
};

// Binary trees. The input of a tree problem is the tree written in level order, with N for a missing child (the form used by many
// online judges: "1 2 3 N N 4 5" is a root 1 with the children 2 and 3, and 3 has the children 4 and 5). The starter builds the tree
// and prints the answer; the learner only writes the function that works on the nodes.
export const TREE = {
  python: r`
    class TreeNode:
        def __init__(self, val, left=None, right=None):
            self.val = val
            self.left = left
            self.right = right


    # Builds a binary tree from a level-order list of words; "N" marks a missing child.
    def build_tree(vals):
        if not vals or vals[0] == "N":
            return None
        root = TreeNode(int(vals[0]))
        queue = [root]
        head = 0
        i = 1
        while head < len(queue) and i < len(vals):
            node = queue[head]
            head += 1
            if vals[i] != "N":
                node.left = TreeNode(int(vals[i]))
                queue.append(node.left)
            i += 1
            if i < len(vals) and vals[i] != "N":
                node.right = TreeNode(int(vals[i]))
                queue.append(node.right)
            i += 1
        return root


    # Prints a tree in the same level-order form ("empty" for no tree).
    def print_tree(root):
        if root is None:
            print("empty")
            return
        out = []
        queue = [root]
        head = 0
        while head < len(queue):
            node = queue[head]
            head += 1
            if node is None:
                out.append("N")
            else:
                out.append(str(node.val))
                queue.append(node.left)
                queue.append(node.right)
        while out and out[-1] == "N":
            out.pop()
        print(" ".join(out))`,
  cpp: r`
    struct TreeNode {
        long long val;
        TreeNode* left;
        TreeNode* right;
        TreeNode(long long v) : val(v), left(nullptr), right(nullptr) {}
    };

    // Builds a binary tree from a level-order list of words; "N" marks a missing child.
    TreeNode* buildTree(const vector<string>& vals) {
        if (vals.empty() || vals[0] == "N") return nullptr;
        TreeNode* root = new TreeNode(stoll(vals[0]));
        vector<TreeNode*> queue = {root};
        size_t head = 0, i = 1;
        while (head < queue.size() && i < vals.size()) {
            TreeNode* node = queue[head++];
            if (vals[i] != "N") {
                node->left = new TreeNode(stoll(vals[i]));
                queue.push_back(node->left);
            }
            i++;
            if (i < vals.size() && vals[i] != "N") {
                node->right = new TreeNode(stoll(vals[i]));
                queue.push_back(node->right);
            }
            i++;
        }
        return root;
    }

    // Prints a tree in the same level-order form ("empty" for no tree).
    void printTree(TreeNode* root) {
        if (root == nullptr) {
            cout << "empty\n";
            return;
        }
        vector<string> out;
        vector<TreeNode*> queue = {root};
        size_t head = 0;
        while (head < queue.size()) {
            TreeNode* node = queue[head++];
            if (node == nullptr) {
                out.push_back("N");
            } else {
                out.push_back(to_string(node->val));
                queue.push_back(node->left);
                queue.push_back(node->right);
            }
        }
        while (!out.empty() && out.back() == "N") out.pop_back();
        for (size_t k = 0; k < out.size(); k++) cout << (k ? " " : "") << out[k];
        cout << "\n";
    }`,
  java: r`
    static class TreeNode {
        long val;
        TreeNode left, right;

        TreeNode(long val) {
            this.val = val;
        }
    }

    // Builds a binary tree from a level-order list of words; "N" marks a missing child.
    static TreeNode buildTree(String[] vals) {
        if (vals.length == 0 || vals[0].equals("N")) return null;
        TreeNode root = new TreeNode(Long.parseLong(vals[0]));
        ArrayList<TreeNode> queue = new ArrayList<>();
        queue.add(root);
        int head = 0, i = 1;
        while (head < queue.size() && i < vals.length) {
            TreeNode node = queue.get(head++);
            if (!vals[i].equals("N")) {
                node.left = new TreeNode(Long.parseLong(vals[i]));
                queue.add(node.left);
            }
            i++;
            if (i < vals.length && !vals[i].equals("N")) {
                node.right = new TreeNode(Long.parseLong(vals[i]));
                queue.add(node.right);
            }
            i++;
        }
        return root;
    }

    // Prints a tree in the same level-order form ("empty" for no tree).
    static void printTree(TreeNode root) {
        if (root == null) {
            System.out.println("empty");
            return;
        }
        ArrayList<String> out = new ArrayList<>();
        ArrayList<TreeNode> queue = new ArrayList<>();
        queue.add(root);
        int head = 0;
        while (head < queue.size()) {
            TreeNode node = queue.get(head++);
            if (node == null) {
                out.add("N");
            } else {
                out.add(String.valueOf(node.val));
                queue.add(node.left);
                queue.add(node.right);
            }
        }
        while (!out.isEmpty() && out.get(out.size() - 1).equals("N")) out.remove(out.size() - 1);
        System.out.println(String.join(" ", out));
    }`
};

const join = (...parts) => parts.filter(Boolean).map(dedent).join('\n\n\n');

// A list problem: `solution` and `stub` hold the function in each language (the learner's function with its body, and the empty one);
// `call` is the code in main that uses the lists that the starter builds from the input.
export function listProgram({ io = ['n:int', 'a:int[n]'], solution, stub, call, includes, fast = true, extra, base = LIST }) {
  const both = (lang, tail) => join(base[lang], extra && extra[lang], tail[lang]);
  return {
    io, fast, includes,
    helpers: { python: both('python', solution), cpp: both('cpp', solution), java: both('java', solution) },
    starterHelpers: { python: both('python', stub), cpp: both('cpp', stub), java: both('java', stub) },
    python: `${call.python}\nfree_nodes()`, cpp: call.cpp, java: call.java,
    starterBody: { ...call, python: `${call.python}\nfree_nodes()` }
  };
}

// A tree problem: like listProgram, but the starter builds binary trees from the level-order words (`vals`) and nothing has to be freed.
export function treeProgram({ io = ['t:int', 'vals:word[t]'], solution, stub, call, includes, fast = true, extra, base = TREE }) {
  const both = (lang, tail) => join(base[lang], extra && extra[lang], tail[lang]);
  return {
    io, fast, includes,
    helpers: { python: both('python', solution), cpp: both('cpp', solution), java: both('java', solution) },
    starterHelpers: { python: both('python', stub), cpp: both('cpp', stub), java: both('java', stub) },
    python: call.python, cpp: call.cpp, java: call.java,
    starterBody: { ...call }
  };
}
