import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct } from '../../lib.mjs';
import { listProgram } from '../../scaffolds.mjs';

const LIST_NOTE = 'The first line has `n`, the number of nodes. The second line has the values of the nodes, from the head to the tail.';
const show = (a) => (a.length ? a.join(' ') : 'empty');
const call = (fnPy, fnCpp) => ({ python: `print_list(${fnPy}(build_list(a)))`, cpp: `printList(${fnCpp}(buildList(a)));`, java: `printList(${fnCpp}(buildList(a)));` });

// Helpers for problems where two lists share their tail, or where the node that is returned has to be named by its index.
const SHARED = {
  python: r`
    # Builds two lists that share their last nodes: x then z, and y then z (the nodes of z are the same objects).
    def build_shared(x, y, z):
        common = build_list(z)
        head_x = common
        for v in reversed(x):
            head_x = ListNode(v, head_x)
        head_y = common
        for v in reversed(y):
            head_y = ListNode(v, head_y)
        return head_x, head_y


    # The number of nodes from this node to the end of its list.
    def count_from(node):
        count = 0
        while node is not None:
            count += 1
            node = node.next
        return count`,
  cpp: r`
    // Builds two lists that share their last nodes: x then z, and y then z (the nodes of z are the same objects).
    void buildShared(const vector<long long>& x, const vector<long long>& y, const vector<long long>& z, ListNode*& headX, ListNode*& headY) {
        ListNode* common = buildList(z);
        headX = common;
        for (int i = (int) x.size() - 1; i >= 0; i--) {
            ListNode* node = new ListNode(x[i]);
            node->next = headX;
            headX = node;
        }
        headY = common;
        for (int i = (int) y.size() - 1; i >= 0; i--) {
            ListNode* node = new ListNode(y[i]);
            node->next = headY;
            headY = node;
        }
    }

    // The number of nodes from this node to the end of its list.
    int countFrom(ListNode* node) {
        int count = 0;
        for (; node != nullptr; node = node->next) count++;
        return count;
    }`,
  java: r`
    // Builds two lists that share their last nodes: x then z, and y then z (the nodes of z are the same objects).
    static ListNode[] buildShared(long[] x, long[] y, long[] z) {
        ListNode common = buildList(z);
        ListNode headX = common;
        for (int i = x.length - 1; i >= 0; i--) {
            ListNode node = new ListNode(x[i]);
            node.next = headX;
            headX = node;
        }
        ListNode headY = common;
        for (int i = y.length - 1; i >= 0; i--) {
            ListNode node = new ListNode(y[i]);
            node.next = headY;
            headY = node;
        }
        return new ListNode[] {headX, headY};
    }

    // The number of nodes from this node to the end of its list.
    static int countFrom(ListNode node) {
        int count = 0;
        for (; node != null; node = node.next) count++;
        return count;
    }`
};

const INDEX_OF = {
  python: r`
    # The index (counting from 0) of a node in the list that starts at head.
    def index_of(head, node):
        index = 0
        while head is not node:
            head = head.next
            index += 1
        return index`,
  cpp: r`
    // The index (counting from 0) of a node in the list that starts at head.
    int indexOf(ListNode* head, ListNode* node) {
        int index = 0;
        while (head != node) {
            head = head->next;
            index++;
        }
        return index;
    }`,
  java: r`
    // The index (counting from 0) of a node in the list that starts at head.
    static int indexOf(ListNode head, ListNode node) {
        int index = 0;
        while (head != node) {
            head = head.next;
            index++;
        }
        return index;
    }`
};

export default [
  {
    slug: 'sort-linked-list',
    title: 'Sort a Linked List',
    difficulty: 'medium',
    tags: ['linked-list', 'merge-sort', 'divide-and-conquer'],
    concept: {
      title: 'Merge sort fits linked lists very well',
      body: [
        'Sorting an array with quicksort or heapsort needs fast access to **any position**, which a linked list does not have. **Merge sort** only needs to split a sequence in two halves and to merge two sorted sequences, and both are natural for lists: finding the middle is the slow and fast pointer trick, and merging relinks nodes without any extra memory.',
        { code: 'def sort_list(head):\n    if head is None or head.next is None: return head     # 0 or 1 node: sorted\n    slow, fast = head, head.next\n    while fast is not None and fast.next is not None:     # find the middle\n        slow = slow.next; fast = fast.next.next\n    second = slow.next; slow.next = None                  # cut into two halves\n    return merge(sort_list(head), sort_list(second))' },
        'Start `fast` one node ahead (`head.next`), so that for two nodes `slow` ends on the **first** one and the cut produces two non-empty halves; otherwise the recursion would never end. The recursion is only about `log n` levels deep, and the total work is O(n log n).'
      ]
    },
    statement: ['Sort a singly linked list in non-decreasing order and print it.'],
    inputFormat: [LIST_NOTE],
    outputFormat: ['Print the sorted values on one line.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5\n4 2 1 3 2\n', note: 'The sorted list is 1 2 2 3 4.' }],
    hints: ['Cut the list in the middle with a slow and a fast reference.', 'Sort both halves recursively.', 'Merge the two sorted halves by relinking the nodes (you did this in an easy problem).'],
    program: listProgram({
      solution: {
        python: r`
          def merge_two(a, b):
              dummy = ListNode(0)
              tail = dummy
              while a is not None and b is not None:
                  if a.val <= b.val:
                      tail.next = a
                      a = a.next
                  else:
                      tail.next = b
                      b = b.next
                  tail = tail.next
              tail.next = a if a is not None else b
              return dummy.next


          def sort_list(head):
              if head is None or head.next is None:
                  return head
              slow, fast = head, head.next
              while fast is not None and fast.next is not None:
                  slow = slow.next
                  fast = fast.next.next
              second = slow.next
              slow.next = None
              return merge_two(sort_list(head), sort_list(second))`,
        cpp: r`
          ListNode* mergeTwo(ListNode* a, ListNode* b) {
              ListNode dummy(0);
              ListNode* tail = &dummy;
              while (a != nullptr && b != nullptr) {
                  if (a->val <= b->val) {
                      tail->next = a;
                      a = a->next;
                  } else {
                      tail->next = b;
                      b = b->next;
                  }
                  tail = tail->next;
              }
              tail->next = a != nullptr ? a : b;
              return dummy.next;
          }

          ListNode* sortList(ListNode* head) {
              if (head == nullptr || head->next == nullptr) return head;
              ListNode* slow = head;
              ListNode* fast = head->next;
              while (fast != nullptr && fast->next != nullptr) {
                  slow = slow->next;
                  fast = fast->next->next;
              }
              ListNode* second = slow->next;
              slow->next = nullptr;
              return mergeTwo(sortList(head), sortList(second));
          }`,
        java: r`
          static ListNode mergeTwo(ListNode a, ListNode b) {
              ListNode dummy = new ListNode(0);
              ListNode tail = dummy;
              while (a != null && b != null) {
                  if (a.val <= b.val) {
                      tail.next = a;
                      a = a.next;
                  } else {
                      tail.next = b;
                      b = b.next;
                  }
                  tail = tail.next;
              }
              tail.next = a != null ? a : b;
              return dummy.next;
          }

          static ListNode sortList(ListNode head) {
              if (head == null || head.next == null) return head;
              ListNode slow = head, fast = head.next;
              while (fast != null && fast.next != null) {
                  slow = slow.next;
                  fast = fast.next.next;
              }
              ListNode second = slow.next;
              slow.next = null;
              return mergeTwo(sortList(head), sortList(second));
          }`
      },
      stub: {
        python: r`
          def sort_list(head):
              # Your code here
              return head`,
        cpp: r`
          ListNode* sortList(ListNode* head) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode sortList(ListNode head) {
              // Your code here
              return head;
          }`
      },
      call: call('sort_list', 'sortList')
    }),
    solution: { explanation: ['The list is cut in the middle, both halves are sorted recursively, and the sorted halves are merged by relinking nodes.'], complexity: 'Time O(n log n), space O(log n) for the recursion.' },
    solve(input) { return show(nums(rows(input)[1]).sort((p, s) => p - s)); },
    tests() { const g = rng(551); return ['5\n4 2 1 3 2\n', '1\n7\n', '2\n2 1\n', '3\n3 2 1\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 2000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(many(20000, (i) => 20000 - i)), arr(many(20000, (i) => i)), arr(randArray(g, 20000, 0, 3))]; }
  },

  {
    slug: 'remove-all-duplicates-from-sorted-list',
    title: 'Remove Every Value That Occurs More Than Once',
    difficulty: 'medium',
    tags: ['linked-list', 'sorted', 'dummy-node'],
    concept: {
      title: 'A tail pointer that lags behind the scan',
      body: [
        'In the easy problem one copy of every value stayed. Now **every node whose value occurs more than once** must go, so a whole group of equal values is deleted, and the group may start at the head. Use a **dummy** node and a reference `prev` to the **last node that is kept**. Look at the group that starts at `prev.next`: if it has more than one node, skip it completely, otherwise keep the node.',
        { code: 'dummy = ListNode(0, head)\nprev = dummy\nwhile head is not None:\n    if head.next is not None and head.val == head.next.val:\n        value = head.val\n        while head is not None and head.val == value:   # skip the whole group\n            head = head.next\n        prev.next = head\n    else:\n        prev = head                                       # a single node: keep it\n        head = head.next\nreturn dummy.next' },
        '`prev` is not moved when a group is skipped, because the node after the group may start a new group that has to be skipped too.'
      ]
    },
    statement: ['A singly linked list is sorted in non-decreasing order. Delete all nodes that have a value that appears more than once in the list, so that only the values that occur exactly once remain. Print the resulting list, or `empty` if nothing remains.'],
    inputFormat: [LIST_NOTE + ' The values are in non-decreasing order.'],
    outputFormat: ['Print the values of the new list on one line, or `empty`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '7\n1 2 3 3 4 4 5\n', note: 'The values 3 and 4 occur twice and are removed: 1 2 5.' }],
    hints: ['Use a dummy node and a reference to the last node that is kept.', 'If the current node has the same value as the next one, skip the whole group of this value.', 'Only move the `prev` reference when you keep a node.'],
    program: listProgram({
      solution: {
        python: r`
          def delete_all_duplicates(head):
              dummy = ListNode(0, head)
              prev = dummy
              while head is not None:
                  if head.next is not None and head.val == head.next.val:
                      value = head.val
                      while head is not None and head.val == value:
                          head = head.next
                      prev.next = head
                  else:
                      prev = head
                      head = head.next
              return dummy.next`,
        cpp: r`
          ListNode* deleteAllDuplicates(ListNode* head) {
              ListNode dummy(0);
              dummy.next = head;
              ListNode* prev = &dummy;
              while (head != nullptr) {
                  if (head->next != nullptr && head->val == head->next->val) {
                      long long value = head->val;
                      while (head != nullptr && head->val == value) head = head->next;
                      prev->next = head;
                  } else {
                      prev = head;
                      head = head->next;
                  }
              }
              return dummy.next;
          }`,
        java: r`
          static ListNode deleteAllDuplicates(ListNode head) {
              ListNode dummy = new ListNode(0);
              dummy.next = head;
              ListNode prev = dummy;
              while (head != null) {
                  if (head.next != null && head.val == head.next.val) {
                      long value = head.val;
                      while (head != null && head.val == value) head = head.next;
                      prev.next = head;
                  } else {
                      prev = head;
                      head = head.next;
                  }
              }
              return dummy.next;
          }`
      },
      stub: {
        python: r`
          def delete_all_duplicates(head):
              # Your code here
              return head`,
        cpp: r`
          ListNode* deleteAllDuplicates(ListNode* head) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode deleteAllDuplicates(ListNode head) {
              // Your code here
              return head;
          }`
      },
      call: call('delete_all_duplicates', 'deleteAllDuplicates')
    }),
    solution: { explanation: ['`prev` marks the last kept node. A group of equal values is skipped as a whole and `prev.next` jumps behind it; a single node is kept and `prev` moves on.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); const c = new Map(); for (const x of a) c.set(x, (c.get(x) || 0) + 1); return show(a.filter((x) => c.get(x) === 1)); },
    tests() { const g = rng(552); const sorted = (n, lo, hi) => arr(randArray(g, n, lo, hi).sort((p, s) => p - s)); return ['7\n1 2 3 3 4 4 5\n', '1\n4\n', '2\n5 5\n', '4\n1 1 1 2\n', '4\n1 2 2 2\n', sorted(25, -4, 4), sorted(2000, -1000, 1000), sorted(20000, -1000000000, 1000000000), sorted(20000, 0, 10000), sorted(20000, 0, 3), arr(many(20000, (i) => i))]; }
  },

  {
    slug: 'linked-list-cycle-start',
    title: 'Where Does the Cycle Begin?',
    difficulty: 'medium',
    tags: ['linked-list', 'two-pointers', 'cycle-detection', 'math'],
    concept: {
      title: 'Meeting point, then walk from the head together',
      body: [
        'Floyd\'s algorithm finds out **whether** a list has a cycle. Here you must find **the node where the cycle begins**. Let `a` be the number of nodes before the cycle starts, and `c` the length of the cycle. When the slow reference (one step at a time) and the fast one (two steps) meet inside the cycle, the slow one has walked `a + x` steps, where `x` is the distance it went into the cycle, and the fast one has walked twice as much.',
        'The fast one walked exactly `k` more full circles than the slow one, so `a + x = k * c`: the distance from the meeting point **to the start of the cycle** (going on around the cycle) is `c - x = a`... modulo the cycle length, **it is exactly `a`**. So after the meeting, start a second reference at the **head** and move it and the slow reference one step at a time: they meet at the cycle start.',
        { code: 'slow = fast = head\nwhile fast is not None and fast.next is not None:\n    slow = slow.next; fast = fast.next.next\n    if slow is fast:\n        slow = head\n        while slow is not fast:          # both now need the same number of steps\n            slow = slow.next; fast = fast.next\n        return slow\nreturn None' },
        'In the starter, the answer node is converted to its index by walking from the head until the node is found.'
      ]
    },
    statement: ['A linked list may have a cycle: the last node points back to the node at index `pos` (counting from 0), or `pos` is -1 and there is no cycle. Print the index of the node where the cycle begins, or -1 if there is no cycle.'],
    inputFormat: ['The first line has `n` and `pos`.', 'The second line has the values of the nodes (values may repeat).'],
    outputFormat: ['Print the index of the first node of the cycle, or -1.'],
    constraints: ['1 <= n <= 20000', '-1 <= pos < n', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '4 1\n3 2 0 -4\n', note: 'The last node points back to index 1.' }],
    hints: ['First find a meeting point of a slow and a fast reference.', 'After they meet, put one reference back on the head.', 'Move both references one step at a time; the node where they meet is the start of the cycle.'],
    program: listProgram({
      io: ['n:int pos:int', 'a:int[n]'],
      extra: INDEX_OF,
      solution: {
        python: r`
          def detect_cycle(head):
              slow = fast = head
              while fast is not None and fast.next is not None:
                  slow = slow.next
                  fast = fast.next.next
                  if slow is fast:
                      slow = head
                      while slow is not fast:
                          slow = slow.next
                          fast = fast.next
                      return slow
              return None`,
        cpp: r`
          ListNode* detectCycle(ListNode* head) {
              ListNode* slow = head;
              ListNode* fast = head;
              while (fast != nullptr && fast->next != nullptr) {
                  slow = slow->next;
                  fast = fast->next->next;
                  if (slow == fast) {
                      slow = head;
                      while (slow != fast) {
                          slow = slow->next;
                          fast = fast->next;
                      }
                      return slow;
                  }
              }
              return nullptr;
          }`,
        java: r`
          static ListNode detectCycle(ListNode head) {
              ListNode slow = head, fast = head;
              while (fast != null && fast.next != null) {
                  slow = slow.next;
                  fast = fast.next.next;
                  if (slow == fast) {
                      slow = head;
                      while (slow != fast) {
                          slow = slow.next;
                          fast = fast.next;
                      }
                      return slow;
                  }
              }
              return null;
          }`
      },
      stub: {
        python: r`
          def detect_cycle(head):
              # Your code here
              return None`,
        cpp: r`
          ListNode* detectCycle(ListNode* head) {
              // Your code here
              return nullptr;
          }`,
        java: r`
          static ListNode detectCycle(ListNode head) {
              // Your code here
              return null;
          }`
      },
      call: {
        python: 'head = build_list(a, pos)\nstart = detect_cycle(head)\nprint(-1 if start is None else index_of(head, start))',
        cpp: 'ListNode* head = buildList(a, (int) pos);\nListNode* start = detectCycle(head);\ncout << (start == nullptr ? -1 : indexOf(head, start)) << "\\n";',
        java: 'ListNode head = buildList(a, (int) pos);\nListNode start = detectCycle(head);\nSystem.out.println(start == null ? -1 : indexOf(head, start));'
      }
    }),
    solution: { explanation: ['When the references meet inside the cycle, the distance from the head to the cycle start equals the distance from the meeting point to the cycle start (going around). Walking both one step at a time makes them meet at the start.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { return String(nums(rows(input)[0])[1]); },
    tests() { const g = rng(553); const make = (n, pos) => `${n} ${pos}\n${randArray(g, n, -5, 5).join(' ')}\n`; return ['4 1\n3 2 0 -4\n', '1 0\n5\n', '1 -1\n5\n', '2 0\n1 1\n', '2 1\n1 1\n', make(20, 7), make(20, -1), make(20000, -1), make(20000, 0), make(20000, 19999), make(20000, 10000), make(19999, 5), make(20000, 3)]; }
  },

  {
    slug: 'intersection-of-two-lists',
    title: 'Where Do the Two Lists Meet?',
    difficulty: 'medium',
    tags: ['linked-list', 'two-pointers', 'intersection'],
    concept: {
      title: 'Walk both lists and swap at the end',
      body: [
        'Two lists may **merge**: from some node on, they are the **same nodes** (not just equal values). Their last nodes are shared, so from the merging node to the end both lists have the same length. If list A has `a` nodes before the merging point, list B has `b`, and the shared part has `c` nodes, then A has length `a + c` and B has `b + c`.',
        'Use two references, `p` on A and `q` on B. When one reaches the end, it **jumps to the head of the other list**. Then `p` walks `a + c + b` nodes and `q` walks `b + c + a` nodes in total: the same number. So after at most that many steps they stand on the merging node together. If the lists do not merge, both become `None` at the same moment and the loop ends.',
        { code: 'p, q = head_a, head_b\nwhile p is not q:\n    p = p.next if p is not None else head_b\n    q = q.next if q is not None else head_a\nreturn p            # the merging node, or None' },
        'The comparison must be about **node identity** (`is` in Python, `==` on pointers in C++ and Java), not about the values. The starter builds the two lists so that they share their last `c` nodes, and prints how many nodes there are from the returned node to the end.'
      ]
    },
    statement: ['Two singly linked lists share their last `c` nodes (the very same nodes). List A consists of its own `a` nodes followed by the shared nodes, list B of its own `b` nodes followed by the same shared nodes. Find the first shared node, and print the number of nodes from it to the end of the list (this is `c`, and 0 if `c = 0` and the lists do not meet).'],
    inputFormat: ['The first line has `a`, `b` and `c`.', 'The second line has the values of the own nodes of A.', 'The third line has the values of the own nodes of B.', 'The fourth line has the values of the shared nodes. A line is empty when its count is 0.'],
    outputFormat: ['Print the number of nodes from the first shared node to the end, or 0.'],
    constraints: ['0 <= a, b, c; a + c >= 1 and b + c >= 1; a + c, b + c <= 20000', '-10^9 <= each value <= 10^9 (values may repeat, also between the lists)'],
    examples: [{ input: '2 3 2\n4 1\n5 6 1\n8 4\n', note: 'A is 4 1 8 4 and B is 5 6 1 8 4; they meet at 8: 2 nodes remain.' }],
    hints: ['Equal values do not mean the same node: compare the nodes themselves.', 'Move two references; when one falls off the end, send it to the head of the other list.', 'After both have walked both lists, they meet at the shared node or both become empty.'],
    program: listProgram({
      io: ['a:int b:int c:int', 'x:int[a]', 'y:int[b]', 'z:int[c]'],
      extra: SHARED,
      solution: {
        python: r`
          def get_intersection(head_a, head_b):
              p, q = head_a, head_b
              while p is not q:
                  p = p.next if p is not None else head_b
                  q = q.next if q is not None else head_a
              return p`,
        cpp: r`
          ListNode* getIntersection(ListNode* headA, ListNode* headB) {
              ListNode* p = headA;
              ListNode* q = headB;
              while (p != q) {
                  p = p != nullptr ? p->next : headB;
                  q = q != nullptr ? q->next : headA;
              }
              return p;
          }`,
        java: r`
          static ListNode getIntersection(ListNode headA, ListNode headB) {
              ListNode p = headA, q = headB;
              while (p != q) {
                  p = p != null ? p.next : headB;
                  q = q != null ? q.next : headA;
              }
              return p;
          }`
      },
      stub: {
        python: r`
          def get_intersection(head_a, head_b):
              # Your code here
              return None`,
        cpp: r`
          ListNode* getIntersection(ListNode* headA, ListNode* headB) {
              // Your code here
              return nullptr;
          }`,
        java: r`
          static ListNode getIntersection(ListNode headA, ListNode headB) {
              // Your code here
              return null;
          }`
      },
      call: {
        python: 'head_a, head_b = build_shared(x, y, z)\nprint(count_from(get_intersection(head_a, head_b)))',
        cpp: 'ListNode* headA;\nListNode* headB;\nbuildShared(x, y, z, headA, headB);\ncout << countFrom(getIntersection(headA, headB)) << "\\n";',
        java: 'ListNode[] heads = buildShared(x, y, z);\nSystem.out.println(countFrom(getIntersection(heads[0], heads[1])));'
      }
    }),
    solution: { explanation: ['Each reference walks its own list and then the other one, so both walk `a + b + c` nodes and meet at the first shared node, or become empty together if there is none.'], complexity: 'Time O(a + b + c), space O(1).' },
    solve(input) { return String(nums(rows(input)[0])[2]); },
    tests() {
      const g = rng(554);
      const make = (a, b, c, hi) => `${a} ${b} ${c}\n${randArray(g, a, -hi, hi).join(' ')}\n${randArray(g, b, -hi, hi).join(' ')}\n${randArray(g, c, -hi, hi).join(' ')}\n`;
      const same = (a, b, c) => `${a} ${b} ${c}\n${many(a, () => 7).join(' ')}\n${many(b, () => 7).join(' ')}\n${many(c, () => 7).join(' ')}\n`;
      return ['2 3 2\n4 1\n5 6 1\n8 4\n', '1 1 0\n2\n3\n\n', '0 0 1\n\n\n5\n', '0 2 1\n\n1 2\n3\n', '3 0 2\n1 2 3\n\n4 5\n', make(5, 7, 4, 9), make(300, 100, 500, 1000), make(10000, 9000, 10000, 1000000000), make(20000, 20000, 0, 1000000000), make(1, 19999, 1, 1000000000), same(10000, 10000, 10000), make(1, 19999, 0, 5)];
    }
  },

  {
    slug: 'add-two-numbers-ii-lists',
    title: 'Add Two Numbers Stored in Lists, Most Significant First',
    difficulty: 'medium',
    tags: ['linked-list', 'stack', 'math', 'carry'],
    concept: {
      title: 'Use a stack to read a list backwards',
      body: [
        'Now the digits are stored with the **most significant digit first**, as we write numbers: `342` is `3 -> 4 -> 3`... the list `3 4 2`. Addition has to start at the **last** digit, but a singly linked list can only be read from the front. A **stack** reverses the reading order: push the digits of each list while walking along it, then pop them to get the last digit first.',
        'Add the digits from the two stacks while there is a digit or a carry. Each result digit becomes a new node that you put **in front** of the result built so far, because the results come out from the least significant one:',
        { code: 'result = None\nwhile stack_a or stack_b or carry:\n    total = carry + (stack_a.pop() if stack_a else 0) + (stack_b.pop() if stack_b else 0)\n    result = ListNode(total % 10, result)      # insert at the front\n    carry = total // 10' },
        'Inserting at the front of a linked list is O(1) and builds the list in the right order without any reversal at the end.'
      ]
    },
    statement: ['Two non-negative integers are stored in two linked lists, one digit per node, **most significant digit first** (342 is the list 3, 4, 2). The numbers have no leading zeros except the number 0 itself. Print the sum in the same form.'],
    inputFormat: ['The first line has `n` and `m`.', 'The second line has the digits of the first number.', 'The third line has the digits of the second number.'],
    outputFormat: ['Print the digits of the sum, most significant digit first.'],
    constraints: ['1 <= n, m <= 20000', 'Every digit is between 0 and 9.'],
    examples: [{ input: '4 3\n7 2 4 3\n5 6 4\n', note: '7243 + 564 = 7807.' }],
    hints: ['Push the digits of both lists on two stacks.', 'Pop digits from both stacks, add them with the carry.', 'Put every new digit in front of the result list.'],
    program: listProgram({
      io: ['n:int m:int', 'a:int[n]', 'b:int[m]'],
      solution: {
        python: r`
          def add_two_numbers(a, b):
              stack_a = []
              stack_b = []
              while a is not None:
                  stack_a.append(a.val)
                  a = a.next
              while b is not None:
                  stack_b.append(b.val)
                  b = b.next
              result = None
              carry = 0
              while stack_a or stack_b or carry:
                  total = carry
                  if stack_a:
                      total += stack_a.pop()
                  if stack_b:
                      total += stack_b.pop()
                  result = ListNode(total % 10, result)
                  carry = total // 10
              return result`,
        cpp: r`
          ListNode* addTwoNumbers(ListNode* a, ListNode* b) {
              vector<long long> stackA, stackB;
              for (; a != nullptr; a = a->next) stackA.push_back(a->val);
              for (; b != nullptr; b = b->next) stackB.push_back(b->val);
              ListNode* result = nullptr;
              long long carry = 0;
              while (!stackA.empty() || !stackB.empty() || carry != 0) {
                  long long total = carry;
                  if (!stackA.empty()) {
                      total += stackA.back();
                      stackA.pop_back();
                  }
                  if (!stackB.empty()) {
                      total += stackB.back();
                      stackB.pop_back();
                  }
                  ListNode* node = new ListNode(total % 10);
                  node->next = result;
                  result = node;
                  carry = total / 10;
              }
              return result;
          }`,
        java: r`
          static ListNode addTwoNumbers(ListNode a, ListNode b) {
              Deque<Long> stackA = new ArrayDeque<>(), stackB = new ArrayDeque<>();
              for (; a != null; a = a.next) stackA.push(a.val);
              for (; b != null; b = b.next) stackB.push(b.val);
              ListNode result = null;
              long carry = 0;
              while (!stackA.isEmpty() || !stackB.isEmpty() || carry != 0) {
                  long total = carry;
                  if (!stackA.isEmpty()) total += stackA.pop();
                  if (!stackB.isEmpty()) total += stackB.pop();
                  ListNode node = new ListNode(total % 10);
                  node.next = result;
                  result = node;
                  carry = total / 10;
              }
              return result;
          }`
      },
      stub: {
        python: r`
          def add_two_numbers(a, b):
              # Your code here
              return a`,
        cpp: r`
          ListNode* addTwoNumbers(ListNode* a, ListNode* b) {
              // Your code here
              return a;
          }`,
        java: r`
          static ListNode addTwoNumbers(ListNode a, ListNode b) {
              // Your code here
              return a;
          }`
      },
      call: { python: 'print_list(add_two_numbers(build_list(a), build_list(b)))', cpp: 'printList(addTwoNumbers(buildList(a), buildList(b)));', java: 'printList(addTwoNumbers(buildList(a), buildList(b)));' }
    }),
    solution: { explanation: ['Two stacks give the digits from the least significant end; each result digit is put in front of the result list, so the list comes out most significant first.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) { const rs = rows(input); const a = nums(rs[1]).reverse(), b = nums(rs[2]).reverse(); const out = []; let carry = 0; for (let i = 0; i < Math.max(a.length, b.length) || carry; i++) { const t = (a[i] || 0) + (b[i] || 0) + carry; out.push(t % 10); carry = Math.floor(t / 10); } return out.reverse().join(' '); },
    tests() {
      const g = rng(555);
      const digits = (n) => (n === 1 ? [randInt(g, 0, 9)] : [randInt(g, 1, 9), ...randArray(g, n - 1, 0, 9)]);
      const two = (n, m) => `${n} ${m}\n${digits(n).join(' ')}\n${digits(m).join(' ')}\n`;
      const nines = (n) => Array(n).fill(9).join(' ');
      return ['4 3\n7 2 4 3\n5 6 4\n', '1 1\n0\n0\n', '1 1\n5\n5\n', `4 1\n${nines(4)}\n1\n`, two(5, 8), two(300, 250), two(20000, 20000), two(20000, 1), `20000 20000\n${nines(20000)}\n${nines(20000)}\n`, `1 20000\n1\n${nines(20000)}\n`];
    }
  },

  {
    slug: 'delete-middle-node',
    title: 'Delete the Middle Node',
    difficulty: 'medium',
    tags: ['linked-list', 'two-pointers', 'slow-fast'],
    concept: {
      title: 'Slow and fast pointers, one step behind',
      body: [
        'The middle node is the node at index `floor(n / 2)` (counting from 0): for 5 nodes index 2, for 4 nodes index 2, for 1 node index 0. To delete it you need the node **before** it. With the slow and fast pointers, let `slow` stand on the node before the middle: start `fast` two nodes ahead of `slow`, or use a dummy node in front of the head and start both from there.',
        { code: 'dummy = ListNode(0, head)\nslow, fast = dummy, head           # fast is one step ahead of slow... and moves by two\nwhile fast is not None and fast.next is not None:\n    slow = slow.next\n    fast = fast.next.next\nslow.next = slow.next.next          # slow is right before the middle node\nreturn dummy.next' },
        'Check the loop with small lists. For one node: `fast = head`, `fast.next` is `None`, so the loop does not run, `slow` stays on the dummy and the only node is deleted: the result is empty. For two nodes: one step, `slow` is the first node, the second (index 1 = floor(2 / 2)) is deleted.'
      ]
    },
    statement: ['Delete the middle node (the node at index `floor(n / 2)`, counting from 0) of a singly linked list and print the remaining list, or `empty` if no node remains.'],
    inputFormat: [LIST_NOTE],
    outputFormat: ['Print the remaining values on one line, or `empty`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5\n1 3 4 7 1\n', note: 'The middle node has index 2 (value 4): 1 3 7 1.' }, { input: '4\n1 2 3 4\n', note: 'The middle node has index 2 (value 3): 1 2 4.' }],
    hints: ['You need the node before the middle node.', 'Use a dummy node in front of the head and let `fast` start at the head.', 'When `fast` cannot move on, `slow.next` is the middle node: skip it.'],
    program: listProgram({
      solution: {
        python: r`
          def delete_middle(head):
              dummy = ListNode(0, head)
              slow, fast = dummy, head
              while fast is not None and fast.next is not None:
                  slow = slow.next
                  fast = fast.next.next
              slow.next = slow.next.next
              return dummy.next`,
        cpp: r`
          ListNode* deleteMiddle(ListNode* head) {
              ListNode dummy(0);
              dummy.next = head;
              ListNode* slow = &dummy;
              ListNode* fast = head;
              while (fast != nullptr && fast->next != nullptr) {
                  slow = slow->next;
                  fast = fast->next->next;
              }
              slow->next = slow->next->next;
              return dummy.next;
          }`,
        java: r`
          static ListNode deleteMiddle(ListNode head) {
              ListNode dummy = new ListNode(0);
              dummy.next = head;
              ListNode slow = dummy, fast = head;
              while (fast != null && fast.next != null) {
                  slow = slow.next;
                  fast = fast.next.next;
              }
              slow.next = slow.next.next;
              return dummy.next;
          }`
      },
      stub: {
        python: r`
          def delete_middle(head):
              # Your code here
              return head`,
        cpp: r`
          ListNode* deleteMiddle(ListNode* head) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode deleteMiddle(ListNode head) {
              // Your code here
              return head;
          }`
      },
      call: call('delete_middle', 'deleteMiddle')
    }),
    solution: { explanation: ['`slow` starts one node behind `fast`, so when `fast` reaches the end `slow` stands right before the middle node, which is bypassed with one pointer change.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); a.splice(Math.floor(a.length / 2), 1); return show(a); },
    tests() { const g = rng(556); return ['5\n1 3 4 7 1\n', '4\n1 2 3 4\n', '1\n7\n', '2\n1 2\n', '3\n1 2 3\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 19999, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000))]; }
  },

  {
    slug: 'maximum-twin-sum',
    title: 'Maximum Twin Sum of a List',
    difficulty: 'medium',
    tags: ['linked-list', 'two-pointers', 'reversal'],
    concept: {
      title: 'Pair the first half with the reversed second half',
      body: [
        'A list with an **even** number `n` of nodes has **twins**: node `i` and node `n - 1 - i` (the first and the last, the second and the second last, ...). You want the largest sum `value(i) + value(n - 1 - i)`.',
        'This is the palindrome pattern again, with a sum instead of a comparison. Find the middle, **reverse the second half**, and walk the first half and the reversed second half at the same time: the two nodes you see are always twins.',
        { code: 'slow = fast = head\nwhile fast is not None and fast.next is not None:\n    slow = slow.next; fast = fast.next.next\nprev = None                                    # reverse from the middle on\nwhile slow is not None:\n    nxt = slow.next; slow.next = prev; prev = slow; slow = nxt\nbest = 0\nleft, right = head, prev\nwhile right is not None:\n    best = max(best, left.val + right.val)\n    left = left.next; right = right.next' },
        'Because `n` is even, the middle node is the first node of the second half, so the halves have the same length and the walk stops exactly at the end.'
      ]
    },
    statement: ['A singly linked list has an even number `n` of nodes. The twin of the node at index `i` (counting from 0) is the node at index `n - 1 - i`. Print the largest value of `value(i) + value(n - 1 - i)` over all twin pairs.'],
    inputFormat: ['The first line has `n` (even).', 'The second line has the values of the nodes, from the head to the tail.'],
    outputFormat: ['Print the maximum twin sum.'],
    constraints: ['2 <= n <= 20000 (n is even)', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '4\n5 4 2 1\n', note: 'The twin sums are 5 + 1 = 6 and 4 + 2 = 6: the maximum is 6.' }],
    hints: ['Find the middle node with a slow and a fast reference.', 'Reverse the second half of the list.', 'Walk both halves together and keep the largest sum.'],
    program: listProgram({
      solution: {
        python: r`
          def twin_sum(head):
              slow = fast = head
              while fast is not None and fast.next is not None:
                  slow = slow.next
                  fast = fast.next.next
              prev = None
              while slow is not None:
                  nxt = slow.next
                  slow.next = prev
                  prev = slow
                  slow = nxt
              best = None
              left, right = head, prev
              while right is not None:
                  s = left.val + right.val
                  if best is None or s > best:
                      best = s
                  left = left.next
                  right = right.next
              return best`,
        cpp: r`
          long long twinSum(ListNode* head) {
              ListNode* slow = head;
              ListNode* fast = head;
              while (fast != nullptr && fast->next != nullptr) {
                  slow = slow->next;
                  fast = fast->next->next;
              }
              ListNode* prev = nullptr;
              while (slow != nullptr) {
                  ListNode* next = slow->next;
                  slow->next = prev;
                  prev = slow;
                  slow = next;
              }
              long long best = LLONG_MIN;
              ListNode* left = head;
              ListNode* right = prev;
              while (right != nullptr) {
                  best = max(best, left->val + right->val);
                  left = left->next;
                  right = right->next;
              }
              return best;
          }`,
        java: r`
          static long twinSum(ListNode head) {
              ListNode slow = head, fast = head;
              while (fast != null && fast.next != null) {
                  slow = slow.next;
                  fast = fast.next.next;
              }
              ListNode prev = null;
              while (slow != null) {
                  ListNode next = slow.next;
                  slow.next = prev;
                  prev = slow;
                  slow = next;
              }
              long best = Long.MIN_VALUE;
              ListNode left = head, right = prev;
              while (right != null) {
                  best = Math.max(best, left.val + right.val);
                  left = left.next;
                  right = right.next;
              }
              return best;
          }`
      },
      stub: {
        python: r`
          def twin_sum(head):
              # Your code here
              return 0`,
        cpp: r`
          long long twinSum(ListNode* head) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long twinSum(ListNode head) {
              // Your code here
              return 0;
          }`
      },
      includes: ['<algorithm>', '<climits>'],
      call: { python: 'print(twin_sum(build_list(a)))', cpp: 'cout << twinSum(buildList(a)) << "\\n";', java: 'System.out.println(twinSum(buildList(a)));' }
    }),
    solution: { explanation: ['After reversing the second half, walking the first half and the reversed half together visits the twin pairs, and the largest sum is kept.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); let best = -Infinity; for (let i = 0; i < a.length / 2; i++) best = Math.max(best, a[i] + a[a.length - 1 - i]); return String(best); },
    tests() { const g = rng(557); return ['4\n5 4 2 1\n', '2\n1 2\n', '2\n-5 -7\n', '6\n3 7 4 6 2 1\n',arr(randArray(g, 20, -9, 9)), arr(randArray(g, 2000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, -1)), arr(many(20000, (i) => i))]; }
  }
];
