import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';
import { listProgram } from '../../scaffolds.mjs';

const LIST_NOTE = 'The first line has `n`, the number of nodes. The second line has the values of the nodes, from the head to the tail.';
const show = (a) => (a.length ? a.join(' ') : 'empty');
const call = (fnPy, fnCpp, args = 'build_list(a)', argsCpp = 'buildList(a)') => ({ python: `print_list(${fnPy}(${args}))`, cpp: `printList(${fnCpp}(${argsCpp}));`, java: `printList(${fnCpp}(${argsCpp}));` });

export default [
  {
    slug: 'remove-nth-from-end',
    title: 'Remove the k-th Node From the End',
    difficulty: 'medium',
    tags: ['linked-list', 'two-pointers', 'dummy-node'],
    concept: {
      title: 'Stop one node early, so that you stand before the target',
      body: [
        'To delete a node you need a reference to the node **before** it. Use the gap technique from the easy problem, but arrange that the follower stops **one node before** the target: put a **dummy** node in front of the head, move `lead` forward `k` steps, then move both until `lead` is on the **last** node (`lead.next is None`). Now `follow` is the node just before the `k`-th node from the end.',
        { code: 'dummy = ListNode(0, head)\nlead = follow = dummy\nfor _ in range(k):\n    lead = lead.next\nwhile lead.next is not None:\n    lead = lead.next\n    follow = follow.next\nfollow.next = follow.next.next      # skip the target node\nreturn dummy.next' },
        'The dummy node makes the case "remove the head" (`k = n`) work without special code: then `follow` stays on the dummy and `dummy.next` becomes the old second node.'
      ]
    },
    statement: ['Remove the `k`-th node from the end of a singly linked list (the last node is the 1st from the end) and print the remaining list, or `empty` if no node remains.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has the values of the nodes, from the head to the tail.'],
    outputFormat: ['Print the remaining values on one line, or `empty`.'],
    constraints: ['1 <= k <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5 2\n1 2 3 4 5\n', note: 'The 2nd node from the end is 4: the result is 1 2 3 5.' }],
    hints: ['Use a dummy node in front of the head.', 'Move a front reference `k` steps, then move both references until the front one is at the last node.', 'The back reference now stands before the node to delete: set `follow.next = follow.next.next`.'],
    program: listProgram({
      io: ['n:int k:int', 'a:int[n]'],
      solution: {
        python: r`
          def remove_nth_from_end(head, k):
              dummy = ListNode(0, head)
              lead = follow = dummy
              for _ in range(k):
                  lead = lead.next
              while lead.next is not None:
                  lead = lead.next
                  follow = follow.next
              follow.next = follow.next.next
              return dummy.next`,
        cpp: r`
          ListNode* removeNthFromEnd(ListNode* head, int k) {
              ListNode dummy(0);
              dummy.next = head;
              ListNode* lead = &dummy;
              ListNode* follow = &dummy;
              for (int i = 0; i < k; i++) lead = lead->next;
              while (lead->next != nullptr) {
                  lead = lead->next;
                  follow = follow->next;
              }
              follow->next = follow->next->next;
              return dummy.next;
          }`,
        java: r`
          static ListNode removeNthFromEnd(ListNode head, int k) {
              ListNode dummy = new ListNode(0);
              dummy.next = head;
              ListNode lead = dummy, follow = dummy;
              for (int i = 0; i < k; i++) lead = lead.next;
              while (lead.next != null) {
                  lead = lead.next;
                  follow = follow.next;
              }
              follow.next = follow.next.next;
              return dummy.next;
          }`
      },
      stub: {
        python: r`
          def remove_nth_from_end(head, k):
              # Your code here
              return head`,
        cpp: r`
          ListNode* removeNthFromEnd(ListNode* head, int k) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode removeNthFromEnd(ListNode head, int k) {
              // Your code here
              return head;
          }`
      },
      call: { python: 'print_list(remove_nth_from_end(build_list(a), k))', cpp: 'printList(removeNthFromEnd(buildList(a), k));', java: 'printList(removeNthFromEnd(buildList(a), (int) k));' }
    }),
    solution: { explanation: ['The dummy node and the gap of `k` nodes put `follow` right before the target node, so one pointer change deletes it, also when it is the head.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const [n, k] = nums(rs[0]); const a = nums(rs[1]); a.splice(n - k, 1); return show(a); },
    tests() { const g = rng(541); const make = (n, k) => `${n} ${k}\n${randArray(g, n, -1000000000, 1000000000).join(' ')}\n`; return ['5 2\n1 2 3 4 5\n', '1 1\n7\n', '2 1\n1 2\n', '2 2\n1 2\n', make(20, 7), make(2000, 1000), make(20000, 1), make(20000, 20000), make(20000, 12345)]; }
  },

  {
    slug: 'swap-nodes-in-pairs',
    title: 'Swap Every Two Neighbouring Nodes',
    difficulty: 'medium',
    tags: ['linked-list', 'pointers', 'dummy-node'],
    concept: {
      title: 'Rewire three links per pair',
      body: [
        'Swapping the **values** of two nodes is easy, but the task is to change the **links**: the nodes themselves move. For one pair `first -> second` with a node `prev` before it, three links change: `prev` must point to `second`, `second` must point to `first`, and `first` must point to whatever followed `second`. Do them in an order that never loses a node.',
        { code: 'while prev.next is not None and prev.next.next is not None:\n    first = prev.next\n    second = first.next\n    first.next = second.next      # first jumps over second\n    second.next = first           # second goes in front\n    prev.next = second            # prev points to the new front of the pair\n    prev = first                  # first is now the last node of the pair' },
        'The dummy node plays the role of `prev` for the first pair. If the number of nodes is odd, the last node has no partner and stays where it is.'
      ]
    },
    statement: ['Swap every two neighbouring nodes of a singly linked list (nodes 1 and 2, nodes 3 and 4, and so on) by changing the links, not the values. If the number of nodes is odd, the last node stays. Print the resulting list.'],
    inputFormat: [LIST_NOTE],
    outputFormat: ['Print the values of the new list on one line.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5\n1 2 3 4 5\n', note: 'The result is 2 1 4 3 5.' }],
    hints: ['Use a dummy node and a reference `prev` to the node before the pair.', 'Three links change: `prev.next`, `second.next` and `first.next`. Save what you need before you overwrite it.', 'After the pair, `first` is the node before the next pair.'],
    program: listProgram({
      solution: {
        python: r`
          def swap_pairs(head):
              dummy = ListNode(0, head)
              prev = dummy
              while prev.next is not None and prev.next.next is not None:
                  first = prev.next
                  second = first.next
                  first.next = second.next
                  second.next = first
                  prev.next = second
                  prev = first
              return dummy.next`,
        cpp: r`
          ListNode* swapPairs(ListNode* head) {
              ListNode dummy(0);
              dummy.next = head;
              ListNode* prev = &dummy;
              while (prev->next != nullptr && prev->next->next != nullptr) {
                  ListNode* first = prev->next;
                  ListNode* second = first->next;
                  first->next = second->next;
                  second->next = first;
                  prev->next = second;
                  prev = first;
              }
              return dummy.next;
          }`,
        java: r`
          static ListNode swapPairs(ListNode head) {
              ListNode dummy = new ListNode(0);
              dummy.next = head;
              ListNode prev = dummy;
              while (prev.next != null && prev.next.next != null) {
                  ListNode first = prev.next;
                  ListNode second = first.next;
                  first.next = second.next;
                  second.next = first;
                  prev.next = second;
                  prev = first;
              }
              return dummy.next;
          }`
      },
      stub: {
        python: r`
          def swap_pairs(head):
              # Your code here
              return head`,
        cpp: r`
          ListNode* swapPairs(ListNode* head) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode swapPairs(ListNode head) {
              // Your code here
              return head;
          }`
      },
      call: call('swap_pairs', 'swapPairs')
    }),
    solution: { explanation: ['For each pair the three links are rewired in a safe order; the dummy node and `prev` handle the first pair like any other, and an unpaired last node is simply left alone.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); for (let i = 0; i + 1 < a.length; i += 2) [a[i], a[i + 1]] = [a[i + 1], a[i]]; return show(a); },
    tests() { const g = rng(542); return ['5\n1 2 3 4 5\n', '1\n9\n', '2\n1 2\n', '3\n1 2 3\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 19999, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000))]; }
  },

  {
    slug: 'rotate-list',
    title: 'Rotate a List to the Right',
    difficulty: 'medium',
    tags: ['linked-list', 'pointers', 'rotation'],
    concept: {
      title: 'Close the list into a ring, then cut it at the right place',
      body: [
        'Rotating a list to the right by `k` places moves the last `k` nodes to the front. A short way: find the **length** `n` and the **tail**; connect the tail to the head (a ring); walk to the new tail, which is the node at index `n - k - 1`; its successor is the new head; cut the ring there.',
        { code: 'k %= length                       # rotating by the length changes nothing\nif k == 0: return head\nnew_tail = head\nfor _ in range(length - k - 1):\n    new_tail = new_tail.next\nnew_head = new_tail.next\nnew_tail.next = None              # cut the ring\ntail.next = head                  # old tail now points to the old head\nreturn new_head' },
        'Always reduce `k` with `k % length` first: `k` can be huge (here up to 10^9), and rotating by a multiple of the length gives the same list. Do not forget the lists with one node or none.'
      ]
    },
    statement: ['Rotate a singly linked list to the right by `k` places (the last `k` nodes move to the front, in the same order) and print the result.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has the values of the nodes, from the head to the tail.'],
    outputFormat: ['Print the values of the rotated list on one line.'],
    constraints: ['1 <= n <= 20000', '0 <= k <= 10^9', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5 2\n1 2 3 4 5\n', note: 'The last two nodes move to the front: 4 5 1 2 3.' }],
    hints: ['Find the length and the tail node in one walk.', 'Replace `k` by `k % length`; if it is 0 the list does not change.', 'The new tail is the node at index `length - k - 1`. Cut after it and link the old tail to the old head.'],
    program: listProgram({
      io: ['n:int k:int', 'a:int[n]'],
      solution: {
        python: r`
          def rotate_right(head, k):
              if head is None or head.next is None:
                  return head
              length = 1
              tail = head
              while tail.next is not None:
                  tail = tail.next
                  length += 1
              k %= length
              if k == 0:
                  return head
              new_tail = head
              for _ in range(length - k - 1):
                  new_tail = new_tail.next
              new_head = new_tail.next
              new_tail.next = None
              tail.next = head
              return new_head`,
        cpp: r`
          ListNode* rotateRight(ListNode* head, long long k) {
              if (head == nullptr || head->next == nullptr) return head;
              long long length = 1;
              ListNode* tail = head;
              while (tail->next != nullptr) {
                  tail = tail->next;
                  length++;
              }
              k %= length;
              if (k == 0) return head;
              ListNode* newTail = head;
              for (long long i = 0; i < length - k - 1; i++) newTail = newTail->next;
              ListNode* newHead = newTail->next;
              newTail->next = nullptr;
              tail->next = head;
              return newHead;
          }`,
        java: r`
          static ListNode rotateRight(ListNode head, long k) {
              if (head == null || head.next == null) return head;
              long length = 1;
              ListNode tail = head;
              while (tail.next != null) {
                  tail = tail.next;
                  length++;
              }
              k %= length;
              if (k == 0) return head;
              ListNode newTail = head;
              for (long i = 0; i < length - k - 1; i++) newTail = newTail.next;
              ListNode newHead = newTail.next;
              newTail.next = null;
              tail.next = head;
              return newHead;
          }`
      },
      stub: {
        python: r`
          def rotate_right(head, k):
              # Your code here
              return head`,
        cpp: r`
          ListNode* rotateRight(ListNode* head, long long k) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode rotateRight(ListNode head, long k) {
              // Your code here
              return head;
          }`
      },
      call: { python: 'print_list(rotate_right(build_list(a), k))', cpp: 'printList(rotateRight(buildList(a), k));', java: 'printList(rotateRight(buildList(a), k));' }
    }),
    solution: { explanation: ['The list is closed into a ring through the tail and cut again after the node at index `length - k - 1`, which becomes the new tail.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const [n, k0] = nums(rs[0]); const a = nums(rs[1]); const k = k0 % n; return show([...a.slice(n - k), ...a.slice(0, n - k)]); },
    tests() { const g = rng(543); const make = (n, k) => `${n} ${k}\n${randArray(g, n, -1000000000, 1000000000).join(' ')}\n`; return ['5 2\n1 2 3 4 5\n', '1 99\n4\n', '3 0\n1 2 3\n', '3 3\n1 2 3\n', '3 1000000000\n1 2 3\n', make(20, 7), make(2000, 1999), make(20000, 1), make(20000, 19999), make(20000, 1000000000), make(20000, 12345)]; }
  },

  {
    slug: 'partition-list',
    title: 'Partition a List Around a Value',
    difficulty: 'medium',
    tags: ['linked-list', 'two-lists', 'stable'],
    concept: {
      title: 'Build two lists, then join them',
      body: [
        'Move all nodes with a value **smaller than `x`** in front of the nodes with a value **at least `x`**, and keep the original order inside both groups (a **stable** partition). Moving nodes around inside one list is awkward. Instead build **two new lists**: a `small` list and a `large` list. Walk through the original list once and append each node to one of them, then connect the end of `small` to the beginning of `large`.',
        { code: 'small = ListNode(0); large = ListNode(0)      # two dummy heads\ns, l = small, large\nwhile head is not None:\n    if head.val < x: s.next = head; s = head\n    else:            l.next = head; l = head\n    head = head.next\nl.next = None            # important: cut the end of the large list\ns.next = large.next\nreturn small.next' },
        'The line `l.next = None` matters: the last node of the large list may still point to a node of the small list from the original order, which would create a cycle. Dummy nodes avoid the special case of an empty group.'
      ]
    },
    statement: ['Rearrange a singly linked list so that all nodes with a value smaller than `x` come before all nodes with a value greater than or equal to `x`. The nodes keep their original relative order inside each group. Print the new list.'],
    inputFormat: ['The first line has `n` and `x`.', 'The second line has the values of the nodes, from the head to the tail.'],
    outputFormat: ['Print the values of the new list on one line.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value, x <= 10^9'],
    examples: [{ input: '6 3\n1 4 3 2 5 2\n', note: 'Smaller than 3: 1 2 2. The others: 4 3 5. Result: 1 2 2 4 3 5.' }],
    hints: ['Build two lists with dummy heads: one for small values, one for the rest.', 'Append every node to the right list while walking along the original one.', 'Set the `next` of the last node of the second list to None, then link the two lists.'],
    program: listProgram({
      io: ['n:int x:int', 'a:int[n]'],
      solution: {
        python: r`
          def partition(head, x):
              small = ListNode(0)
              large = ListNode(0)
              s, l = small, large
              while head is not None:
                  if head.val < x:
                      s.next = head
                      s = head
                  else:
                      l.next = head
                      l = head
                  head = head.next
              l.next = None
              s.next = large.next
              return small.next`,
        cpp: r`
          ListNode* partition(ListNode* head, long long x) {
              ListNode small(0), large(0);
              ListNode* s = &small;
              ListNode* l = &large;
              while (head != nullptr) {
                  if (head->val < x) {
                      s->next = head;
                      s = head;
                  } else {
                      l->next = head;
                      l = head;
                  }
                  head = head->next;
              }
              l->next = nullptr;
              s->next = large.next;
              return small.next;
          }`,
        java: r`
          static ListNode partition(ListNode head, long x) {
              ListNode small = new ListNode(0), large = new ListNode(0);
              ListNode s = small, l = large;
              while (head != null) {
                  if (head.val < x) {
                      s.next = head;
                      s = head;
                  } else {
                      l.next = head;
                      l = head;
                  }
                  head = head.next;
              }
              l.next = null;
              s.next = large.next;
              return small.next;
          }`
      },
      stub: {
        python: r`
          def partition(head, x):
              # Your code here
              return head`,
        cpp: r`
          ListNode* partition(ListNode* head, long long x) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode partition(ListNode head, long x) {
              // Your code here
              return head;
          }`
      },
      call: { python: 'print_list(partition(build_list(a), x))', cpp: 'printList(partition(buildList(a), x));', java: 'printList(partition(buildList(a), x));' }
    }),
    solution: { explanation: ['Two lists with dummy heads collect the nodes in their original order; the end of the second list is cut and the lists are joined.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const x = nums(rs[0])[1]; const a = nums(rs[1]); return show([...a.filter((v) => v < x), ...a.filter((v) => v >= x)]); },
    tests() { const g = rng(544); const make = (n, lo, hi, x) => `${n} ${x}\n${randArray(g, n, lo, hi).join(' ')}\n`; return ['6 3\n1 4 3 2 5 2\n', '1 5\n3\n', '3 0\n1 2 3\n', '3 10\n1 2 3\n', make(20, -9, 9, 0), make(2000, -100, 100, 7), make(20000, -1000000000, 1000000000, 0), make(20000, 0, 3, 2), make(20000, -1000000000, 1000000000, 1000000000)]; }
  },

  {
    slug: 'add-two-numbers-in-lists',
    title: 'Add Two Numbers Stored in Lists',
    difficulty: 'medium',
    tags: ['linked-list', 'math', 'carry'],
    concept: {
      title: 'Addition on paper, starting with the last digit',
      body: [
        'Two non-negative numbers are stored as lists of digits, with the **least significant digit first**: `342` is the list `2 -> 4 -> 3`. This is the natural order for addition by hand: you add the lowest digits first and carry on to the next ones.',
        { code: 'carry = 0\nwhile a is not None or b is not None or carry:\n    total = carry\n    if a is not None: total += a.val; a = a.next\n    if b is not None: total += b.val; b = b.next\n    tail.next = ListNode(total % 10)    # the digit to write\n    tail = tail.next\n    carry = total // 10                 # the digit to carry' },
        'The loop continues while **either list has digits left or a carry remains**: `99 + 1` ends with a new digit from the carry. The lists may have different lengths; a missing digit counts as 0. This builds a **new** list, one node per digit.'
      ]
    },
    statement: ['Two non-negative integers are stored in two linked lists, one digit per node, **least significant digit first** (the number 342 is the list 2, 4, 3). The numbers have no leading zeros, except the number 0 itself. Print the sum in the same form: a list of digits, least significant first.'],
    inputFormat: ['The first line has `n` and `m`, the lengths of the lists.', 'The second line has the digits of the first number.', 'The third line has the digits of the second number.'],
    outputFormat: ['Print the digits of the sum, least significant digit first.'],
    constraints: ['1 <= n, m <= 20000', 'Every digit is between 0 and 9.'],
    examples: [{ input: '3 3\n2 4 3\n5 6 4\n', note: '342 + 465 = 807, written as 7 0 8.' }],
    hints: ['Add digit by digit from the head, with a carry.', 'A missing digit (shorter list) counts as 0.', 'Keep going while a list has digits left or the carry is not 0.'],
    program: listProgram({
      io: ['n:int m:int', 'a:int[n]', 'b:int[m]'],
      solution: {
        python: r`
          def add_two_numbers(a, b):
              dummy = ListNode(0)
              tail = dummy
              carry = 0
              while a is not None or b is not None or carry:
                  total = carry
                  if a is not None:
                      total += a.val
                      a = a.next
                  if b is not None:
                      total += b.val
                      b = b.next
                  tail.next = ListNode(total % 10)
                  tail = tail.next
                  carry = total // 10
              return dummy.next`,
        cpp: r`
          ListNode* addTwoNumbers(ListNode* a, ListNode* b) {
              ListNode dummy(0);
              ListNode* tail = &dummy;
              long long carry = 0;
              while (a != nullptr || b != nullptr || carry != 0) {
                  long long total = carry;
                  if (a != nullptr) {
                      total += a->val;
                      a = a->next;
                  }
                  if (b != nullptr) {
                      total += b->val;
                      b = b->next;
                  }
                  tail->next = new ListNode(total % 10);
                  tail = tail->next;
                  carry = total / 10;
              }
              return dummy.next;
          }`,
        java: r`
          static ListNode addTwoNumbers(ListNode a, ListNode b) {
              ListNode dummy = new ListNode(0);
              ListNode tail = dummy;
              long carry = 0;
              while (a != null || b != null || carry != 0) {
                  long total = carry;
                  if (a != null) {
                      total += a.val;
                      a = a.next;
                  }
                  if (b != null) {
                      total += b.val;
                      b = b.next;
                  }
                  tail.next = new ListNode(total % 10);
                  tail = tail.next;
                  carry = total / 10;
              }
              return dummy.next;
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
    solution: { explanation: ['Digits are added from the least significant end with a carry. A new node is created for every result digit, and the loop runs until both lists and the carry are used up.'], complexity: 'Time O(max(n, m)), space O(max(n, m)) for the result.' },
    solve(input) { const rs = rows(input); const a = nums(rs[1]), b = nums(rs[2]); const out = []; let carry = 0; for (let i = 0; i < Math.max(a.length, b.length) || carry; i++) { const t = (a[i] || 0) + (b[i] || 0) + carry; out.push(t % 10); carry = Math.floor(t / 10); } return out.join(' '); },
    tests() {
      const g = rng(545);
      const digits = (n) => (n === 1 ? [randInt(g, 0, 9)] : [...randArray(g, n - 1, 0, 9), randInt(g, 1, 9)]);
      const two = (n, m) => `${n} ${m}\n${digits(n).join(' ')}\n${digits(m).join(' ')}\n`;
      const nines = (n) => Array(n).fill(9).join(' ');
      return ['3 3\n2 4 3\n5 6 4\n', '1 1\n0\n0\n', '1 1\n5\n5\n', `4 1\n${nines(4)}\n1\n`, two(5, 8), two(300, 250), two(20000, 20000), two(20000, 1), `20000 20000\n${nines(20000)}\n${nines(20000)}\n`, `20000 1\n${nines(20000)}\n1\n`];
    }
  },

  {
    slug: 'odd-even-linked-list',
    title: 'Group Odd and Even Positions',
    difficulty: 'medium',
    tags: ['linked-list', 'pointers', 'in-place'],
    concept: {
      title: 'Two chains built in one walk',
      body: [
        'Put all nodes at **odd positions** (1st, 3rd, 5th, ...) first, followed by all nodes at **even positions** (2nd, 4th, ...), keeping the order inside both groups. The positions count from 1 and are about the **place** in the list, not about the value.',
        'Use two references, `odd` and `even`, both advancing by **two** nodes in each step and relinking as they go: the odd chain skips the even node, the even chain skips the odd node. Remember the head of the even chain (`even_head`) because at the end the odd chain has to be connected to it.',
        { code: 'odd, even = head, head.next\neven_head = even\nwhile even is not None and even.next is not None:\n    odd.next = even.next;  odd = odd.next\n    even.next = odd.next;  even = even.next\nodd.next = even_head' },
        'The pointers are changed in place, so no extra memory is needed. An empty list has nothing to do.'
      ]
    },
    statement: ['Rearrange a singly linked list: first all nodes at odd positions (1st, 3rd, 5th, ...) and then all nodes at even positions (2nd, 4th, ...), each group in its original order. Print the new list.'],
    inputFormat: [LIST_NOTE],
    outputFormat: ['Print the values of the new list on one line.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5\n1 2 3 4 5\n', note: 'The 1st, 3rd and 5th nodes (1 3 5) come first, then 2 4: 1 3 5 2 4.' }],
    hints: ['Keep two references: the last node of the odd chain and the last node of the even chain.', 'In every step, `odd` links to the node after `even`, then `even` links to the node after the new `odd`.', 'Save the head of the even chain and attach it behind the odd chain at the end.'],
    program: listProgram({
      solution: {
        python: r`
          def odd_even_list(head):
              if head is None:
                  return head
              odd = head
              even = head.next
              even_head = even
              while even is not None and even.next is not None:
                  odd.next = even.next
                  odd = odd.next
                  even.next = odd.next
                  even = even.next
              odd.next = even_head
              return head`,
        cpp: r`
          ListNode* oddEvenList(ListNode* head) {
              if (head == nullptr) return head;
              ListNode* odd = head;
              ListNode* even = head->next;
              ListNode* evenHead = even;
              while (even != nullptr && even->next != nullptr) {
                  odd->next = even->next;
                  odd = odd->next;
                  even->next = odd->next;
                  even = even->next;
              }
              odd->next = evenHead;
              return head;
          }`,
        java: r`
          static ListNode oddEvenList(ListNode head) {
              if (head == null) return head;
              ListNode odd = head, even = head.next, evenHead = even;
              while (even != null && even.next != null) {
                  odd.next = even.next;
                  odd = odd.next;
                  even.next = odd.next;
                  even = even.next;
              }
              odd.next = evenHead;
              return head;
          }`
      },
      stub: {
        python: r`
          def odd_even_list(head):
              # Your code here
              return head`,
        cpp: r`
          ListNode* oddEvenList(ListNode* head) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode oddEvenList(ListNode head) {
              // Your code here
              return head;
          }`
      },
      call: call('odd_even_list', 'oddEvenList')
    }),
    solution: { explanation: ['The odd and the even chain are built at the same time by relinking two nodes per step; the head of the even chain is attached behind the odd chain at the end.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); return show([...a.filter((_, i) => i % 2 === 0), ...a.filter((_, i) => i % 2 === 1)]); },
    tests() { const g = rng(546); return ['5\n1 2 3 4 5\n', '1\n9\n', '2\n1 2\n', '4\n1 2 3 4\n', arr(randArray(g, 21, -9, 9)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 19999, -1000000000, 1000000000))]; }
  },

  {
    slug: 'reverse-linked-list-between',
    title: 'Reverse Part of a List',
    difficulty: 'medium',
    tags: ['linked-list', 'pointers', 'reversal'],
    concept: {
      title: 'Reverse in place by pulling nodes to the front of the block',
      body: [
        'Reverse only the nodes from position `left` to position `right` (counting from 1), and leave the rest. First walk to the node `prev` that stands **just before** the block (use a dummy node, so that `left = 1` also works). The first node of the block, `cur`, will end up as the **last** node of the reversed block.',
        'Then repeat `right - left` times: take the node **after** `cur` and move it to the front of the block (right after `prev`). This reverses the block step by step, in place.',
        { code: 'for _ in range(right - left):\n    nxt = cur.next\n    cur.next = nxt.next        # cut nxt out\n    nxt.next = prev.next       # put nxt in front of the block\n    prev.next = nxt' },
        '`cur` never moves: it keeps its place while more nodes are pulled in front of it, so after the loop it is at the end of the reversed block and already points to the first node after the block.'
      ]
    },
    statement: ['Reverse the nodes of a singly linked list from position `left` to position `right` (both included, counting from 1) and print the whole list.'],
    inputFormat: ['The first line has `n`, `left` and `right`.', 'The second line has the values of the nodes, from the head to the tail.'],
    outputFormat: ['Print the values of the new list on one line.'],
    constraints: ['1 <= left <= right <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5 2 4\n1 2 3 4 5\n', note: 'The nodes 2 3 4 are reversed: 1 4 3 2 5.' }],
    hints: ['Use a dummy node and walk `left - 1` steps to the node before the block.', 'The first node of the block stays in place while the following nodes are moved to the front of the block.', 'Repeat `right - left` times.'],
    program: listProgram({
      io: ['n:int left:int right:int', 'a:int[n]'],
      solution: {
        python: r`
          def reverse_between(head, left, right):
              dummy = ListNode(0, head)
              prev = dummy
              for _ in range(left - 1):
                  prev = prev.next
              cur = prev.next
              for _ in range(right - left):
                  nxt = cur.next
                  cur.next = nxt.next
                  nxt.next = prev.next
                  prev.next = nxt
              return dummy.next`,
        cpp: r`
          ListNode* reverseBetween(ListNode* head, int left, int right) {
              ListNode dummy(0);
              dummy.next = head;
              ListNode* prev = &dummy;
              for (int i = 0; i < left - 1; i++) prev = prev->next;
              ListNode* cur = prev->next;
              for (int i = 0; i < right - left; i++) {
                  ListNode* next = cur->next;
                  cur->next = next->next;
                  next->next = prev->next;
                  prev->next = next;
              }
              return dummy.next;
          }`,
        java: r`
          static ListNode reverseBetween(ListNode head, int left, int right) {
              ListNode dummy = new ListNode(0);
              dummy.next = head;
              ListNode prev = dummy;
              for (int i = 0; i < left - 1; i++) prev = prev.next;
              ListNode cur = prev.next;
              for (int i = 0; i < right - left; i++) {
                  ListNode next = cur.next;
                  cur.next = next.next;
                  next.next = prev.next;
                  prev.next = next;
              }
              return dummy.next;
          }`
      },
      stub: {
        python: r`
          def reverse_between(head, left, right):
              # Your code here
              return head`,
        cpp: r`
          ListNode* reverseBetween(ListNode* head, int left, int right) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode reverseBetween(ListNode head, int left, int right) {
              // Your code here
              return head;
          }`
      },
      call: { python: 'print_list(reverse_between(build_list(a), left, right))', cpp: 'printList(reverseBetween(buildList(a), left, right));', java: 'printList(reverseBetween(buildList(a), (int) left, (int) right));' }
    }),
    solution: { explanation: ['The node before the block is found first. Then the node after the block start is moved to the front of the block `right - left` times, which reverses the block in place.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const [n, l, rr] = nums(rs[0]); const a = nums(rs[1]); return show([...a.slice(0, l - 1), ...a.slice(l - 1, rr).reverse(), ...a.slice(rr)]); },
    tests() { const g = rng(547); const make = (n, l, rr) => `${n} ${l} ${rr}\n${randArray(g, n, -1000000000, 1000000000).join(' ')}\n`; return ['5 2 4\n1 2 3 4 5\n', '1 1 1\n7\n', '2 1 2\n1 2\n', '5 3 3\n1 2 3 4 5\n', '5 1 5\n1 2 3 4 5\n', make(20, 5, 15), make(2000, 1, 1000), make(20000, 1, 20000), make(20000, 2, 19999), make(20000, 10000, 10001), make(20000, 19990, 20000)]; }
  },

  {
    slug: 'reorder-list',
    title: 'Reorder a List: First, Last, Second, Second Last',
    difficulty: 'medium',
    tags: ['linked-list', 'two-pointers', 'reversal', 'merge'],
    concept: {
      title: 'Three known steps in a row',
      body: [
        'A list `L0, L1, ..., Ln` must be reordered to `L0, Ln, L1, Ln-1, L2, Ln-2, ...`: take one node from the front, then one from the back, alternately. A singly linked list cannot be read from the back, but you already know the tools. Solve it in three steps:',
        '1. **Find the middle** with a slow and a fast reference and cut the list there into a first half and a second half.\n2. **Reverse the second half**, so that its first node is the old tail.\n3. **Merge** the two halves alternately: one node of the first half, one of the reversed second half, and so on.',
        { code: 'second = slow.next; slow.next = None            # cut after the middle\nprev = None\nwhile second is not None:                         # reverse the second half\n    nxt = second.next; second.next = prev; prev = second; second = nxt\nfirst, second = head, prev\nwhile second is not None:                         # interleave\n    n1, n2 = first.next, second.next\n    first.next = second; second.next = n1\n    first, second = n1, n2' },
        'For an odd length the first half is one node longer, which is exactly what the pattern needs: the last node of the result is the middle node.'
      ]
    },
    statement: ['Reorder a singly linked list `L0, L1, ..., L(n-1)` into `L0, L(n-1), L1, L(n-2), L2, ...` by changing the links, and print the result.'],
    inputFormat: [LIST_NOTE],
    outputFormat: ['Print the values of the reordered list on one line.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5\n1 2 3 4 5\n', note: 'The order becomes 1 5 2 4 3.' }],
    hints: ['Find the middle node and cut the list in two halves.', 'Reverse the second half.', 'Merge the halves alternately: first-half node, second-half node, ...'],
    program: listProgram({
      solution: {
        python: r`
          def reorder_list(head):
              if head is None or head.next is None:
                  return head
              slow = fast = head
              while fast.next is not None and fast.next.next is not None:
                  slow = slow.next
                  fast = fast.next.next
              second = slow.next
              slow.next = None
              prev = None
              while second is not None:
                  nxt = second.next
                  second.next = prev
                  prev = second
                  second = nxt
              first, second = head, prev
              while second is not None:
                  n1, n2 = first.next, second.next
                  first.next = second
                  second.next = n1
                  first, second = n1, n2
              return head`,
        cpp: r`
          ListNode* reorderList(ListNode* head) {
              if (head == nullptr || head->next == nullptr) return head;
              ListNode* slow = head;
              ListNode* fast = head;
              while (fast->next != nullptr && fast->next->next != nullptr) {
                  slow = slow->next;
                  fast = fast->next->next;
              }
              ListNode* second = slow->next;
              slow->next = nullptr;
              ListNode* prev = nullptr;
              while (second != nullptr) {
                  ListNode* next = second->next;
                  second->next = prev;
                  prev = second;
                  second = next;
              }
              ListNode* first = head;
              second = prev;
              while (second != nullptr) {
                  ListNode* n1 = first->next;
                  ListNode* n2 = second->next;
                  first->next = second;
                  second->next = n1;
                  first = n1;
                  second = n2;
              }
              return head;
          }`,
        java: r`
          static ListNode reorderList(ListNode head) {
              if (head == null || head.next == null) return head;
              ListNode slow = head, fast = head;
              while (fast.next != null && fast.next.next != null) {
                  slow = slow.next;
                  fast = fast.next.next;
              }
              ListNode second = slow.next;
              slow.next = null;
              ListNode prev = null;
              while (second != null) {
                  ListNode next = second.next;
                  second.next = prev;
                  prev = second;
                  second = next;
              }
              ListNode first = head;
              second = prev;
              while (second != null) {
                  ListNode n1 = first.next, n2 = second.next;
                  first.next = second;
                  second.next = n1;
                  first = n1;
                  second = n2;
              }
              return head;
          }`
      },
      stub: {
        python: r`
          def reorder_list(head):
              # Your code here
              return head`,
        cpp: r`
          ListNode* reorderList(ListNode* head) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode reorderList(ListNode head) {
              // Your code here
              return head;
          }`
      },
      call: call('reorder_list', 'reorderList')
    }),
    solution: { explanation: ['The list is cut in the middle, the second half is reversed, and the two halves are interleaved node by node.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); const out = []; let i = 0, j = a.length - 1; while (i <= j) { out.push(a[i++]); if (i <= j) out.push(a[j--]); } return show(out); },
    tests() { const g = rng(548); return ['5\n1 2 3 4 5\n', '1\n9\n', '2\n1 2\n', '3\n1 2 3\n', '4\n1 2 3 4\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 19999, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000))]; }
  }
];
