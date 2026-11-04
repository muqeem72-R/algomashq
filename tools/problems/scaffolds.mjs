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
