import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct } from '../../lib.mjs';
import { listProgram } from '../../scaffolds.mjs';

const LIST_NOTE = 'The first line has `n`, the number of nodes. The second line has the values of the nodes, from the head to the tail.';
const sorted = (g, n, lo, hi) => arr(randArray(g, n, lo, hi).sort((p, s) => p - s));
const show = (a) => (a.length ? a.join(' ') : 'empty');

export default [
  {
    slug: 'reverse-linked-list',
    title: 'Reverse a Linked List',
    difficulty: 'easy',
    tags: ['linked-list', 'pointers'],
    concept: {
      title: 'A list is nodes that point to the next node',
      body: [
        'A **singly linked list** is a chain of **nodes**. Every node holds a value (`val`) and a reference to the next node (`next`); the last node points to nothing (`None`, `nullptr` or `null`). You hold only the **head**, the first node, and reach everything else by following `next`.',
        'In these problems the starter code already builds the list from the input for you (the `ListNode` type, `build_list` and `print_list` are given). You only write the function that works on the nodes.',
        'To **reverse** a list, walk along it and turn every `next` pointer around. You need three references: the node you are at (`head`), the node before it (`prev`, which becomes its new `next`), and the next node, saved **before** you overwrite the pointer, otherwise the rest of the list is lost.',
        { code: 'prev = None\nwhile head is not None:\n    nxt = head.next      # save the rest of the list\n    head.next = prev     # turn the pointer around\n    prev = head          # move both references one step\n    head = nxt\nreturn prev              # the old tail is the new head' },
        'No new nodes are created: only pointers change, so the work is O(n) time and O(1) memory.'
      ]
    },
    statement: ['Reverse a singly linked list and print its values from the new head to the new tail.'],
    inputFormat: [LIST_NOTE],
    outputFormat: ['Print the values of the reversed list on one line.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5\n1 2 3 4 5\n', note: 'The list becomes 5 4 3 2 1.' }],
    hints: ['Walk along the list once and change every `next` pointer.', 'Before you change `head.next`, save it in another variable.', 'Keep a reference `prev` to the node you came from; at the end it is the new head.'],
    program: listProgram({
      solution: {
        python: r`
          def reverse_list(head):
              prev = None
              while head is not None:
                  nxt = head.next
                  head.next = prev
                  prev = head
                  head = nxt
              return prev`,
        cpp: r`
          ListNode* reverseList(ListNode* head) {
              ListNode* prev = nullptr;
              while (head != nullptr) {
                  ListNode* next = head->next;
                  head->next = prev;
                  prev = head;
                  head = next;
              }
              return prev;
          }`,
        java: r`
          static ListNode reverseList(ListNode head) {
              ListNode prev = null;
              while (head != null) {
                  ListNode next = head.next;
                  head.next = prev;
                  prev = head;
                  head = next;
              }
              return prev;
          }`
      },
      stub: {
        python: r`
          def reverse_list(head):
              # Your code here
              return head`,
        cpp: r`
          ListNode* reverseList(ListNode* head) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode reverseList(ListNode head) {
              // Your code here
              return head;
          }`
      },
      call: { python: 'print_list(reverse_list(build_list(a)))', cpp: 'printList(reverseList(buildList(a)));', java: 'printList(reverseList(buildList(a)));' }
    }),
    solution: { explanation: ['Each step saves the next node, points the current node to the previous one, and moves on. At the end `prev` is the old tail, which is the new head.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { return show(nums(rows(input)[1]).reverse()); },
    tests() { const g = rng(501); return ['5\n1 2 3 4 5\n', '1\n7\n', '2\n1 2\n', '3\n-5 0 5\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 2000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(many(20000, (i) => i))]; }
  },

  {
    slug: 'middle-of-the-list',
    title: 'The Middle of the List',
    difficulty: 'easy',
    tags: ['linked-list', 'two-pointers', 'slow-fast'],
    concept: {
      title: 'Slow and fast pointers',
      body: [
        'A linked list does not know its own length, and you cannot jump to position `n / 2`. A neat trick finds the middle in **one pass**: keep two references, **slow** and **fast**. In every step `slow` moves one node forward and `fast` moves two nodes forward. When `fast` reaches the end, `slow` has covered half of the distance: it is in the middle.',
        { code: 'slow = fast = head\nwhile fast is not None and fast.next is not None:\n    slow = slow.next\n    fast = fast.next.next\nreturn slow' },
        'For a list with an even number of nodes there are two middle nodes; this loop stops at the **second** one. The two-speed idea (the "tortoise and the hare") is used again for cycles and for palindromes.'
      ]
    },
    statement: ['Find the middle node of a singly linked list and print the values from the middle node to the end of the list. If the list has two middle nodes, use the second one.'],
    inputFormat: [LIST_NOTE],
    outputFormat: ['Print the values from the middle node to the tail on one line.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5\n1 2 3 4 5\n', note: 'The middle node is 3: print 3 4 5.' }, { input: '6\n1 2 3 4 5 6\n', note: 'Two middle nodes, 3 and 4: the second one is used. Print 4 5 6.' }],
    hints: ['Use two references that start at the head.', 'Move `slow` by one node and `fast` by two nodes in every step.', 'Stop when `fast` is at the last node or past it (check `fast` and `fast.next`).'],
    program: listProgram({
      solution: {
        python: r`
          def middle_node(head):
              slow = fast = head
              while fast is not None and fast.next is not None:
                  slow = slow.next
                  fast = fast.next.next
              return slow`,
        cpp: r`
          ListNode* middleNode(ListNode* head) {
              ListNode* slow = head;
              ListNode* fast = head;
              while (fast != nullptr && fast->next != nullptr) {
                  slow = slow->next;
                  fast = fast->next->next;
              }
              return slow;
          }`,
        java: r`
          static ListNode middleNode(ListNode head) {
              ListNode slow = head, fast = head;
              while (fast != null && fast.next != null) {
                  slow = slow.next;
                  fast = fast.next.next;
              }
              return slow;
          }`
      },
      stub: {
        python: r`
          def middle_node(head):
              # Your code here
              return head`,
        cpp: r`
          ListNode* middleNode(ListNode* head) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode middleNode(ListNode head) {
              // Your code here
              return head;
          }`
      },
      call: { python: 'print_list(middle_node(build_list(a)))', cpp: 'printList(middleNode(buildList(a)));', java: 'printList(middleNode(buildList(a)));' }
    }),
    solution: { explanation: ['`fast` moves twice as fast as `slow`. When `fast` cannot move on, `slow` has walked half of the list and stands on the middle node (the second one for an even length).'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); return show(a.slice(Math.floor(a.length / 2))); },
    tests() { const g = rng(502); return ['5\n1 2 3 4 5\n', '6\n1 2 3 4 5 6\n', '1\n9\n', '2\n1 2\n', '3\n7 8 9\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 19999, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000))]; }
  },

  {
    slug: 'remove-duplicates-from-sorted-list',
    title: 'Remove Duplicates From a Sorted List',
    difficulty: 'easy',
    tags: ['linked-list', 'sorted', 'in-place'],
    concept: {
      title: 'Skip a node by changing one pointer',
      body: [
        'Deleting a node from a linked list does not move any data: you make the **previous node point to the node after it**. In a sorted list, equal values stand next to each other, so you only need to compare a node with its successor. If they are equal, cut the successor out with `cur.next = cur.next.next`. Do **not** move `cur` in that case: the new successor may be equal too.',
        { code: 'cur = head\nwhile cur is not None and cur.next is not None:\n    if cur.val == cur.next.val:\n        cur.next = cur.next.next     # remove the duplicate\n    else:\n        cur = cur.next' },
        'The first node of every group of equal values stays, so the head of the list never changes here.'
      ]
    },
    statement: ['A singly linked list is sorted in non-decreasing order. Delete the duplicates so that every value appears only once, and print the resulting list.'],
    inputFormat: [LIST_NOTE + ' The values are in non-decreasing order.'],
    outputFormat: ['Print the values of the new list on one line.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '6\n1 1 2 3 3 3\n', note: 'The result is 1 2 3.' }],
    hints: ['Equal values are neighbours, because the list is sorted.', 'If a node and its successor are equal, set `cur.next = cur.next.next`.', 'Move to the next node only when the successor is different.'],
    program: listProgram({
      solution: {
        python: r`
          def delete_duplicates(head):
              cur = head
              while cur is not None and cur.next is not None:
                  if cur.val == cur.next.val:
                      cur.next = cur.next.next
                  else:
                      cur = cur.next
              return head`,
        cpp: r`
          ListNode* deleteDuplicates(ListNode* head) {
              ListNode* cur = head;
              while (cur != nullptr && cur->next != nullptr) {
                  if (cur->val == cur->next->val) cur->next = cur->next->next;
                  else cur = cur->next;
              }
              return head;
          }`,
        java: r`
          static ListNode deleteDuplicates(ListNode head) {
              ListNode cur = head;
              while (cur != null && cur.next != null) {
                  if (cur.val == cur.next.val) cur.next = cur.next.next;
                  else cur = cur.next;
              }
              return head;
          }`
      },
      stub: {
        python: r`
          def delete_duplicates(head):
              # Your code here
              return head`,
        cpp: r`
          ListNode* deleteDuplicates(ListNode* head) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode deleteDuplicates(ListNode head) {
              // Your code here
              return head;
          }`
      },
      call: { python: 'print_list(delete_duplicates(build_list(a)))', cpp: 'printList(deleteDuplicates(buildList(a)));', java: 'printList(deleteDuplicates(buildList(a)));' }
    }),
    solution: { explanation: ['A node whose successor has the same value is bypassed by changing one pointer. The reference only moves on when the successor is different.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); return show(a.filter((x, i) => i === 0 || x !== a[i - 1])); },
    tests() { const g = rng(503); return ['6\n1 1 2 3 3 3\n', '1\n4\n', '4\n5 5 5 5\n', '4\n1 2 3 4\n', sorted(g, 25, -4, 4), sorted(g, 2000, -100, 100), sorted(g, 20000, -1000000000, 1000000000), sorted(g, 20000, 0, 10)]; }
  },

  {
    slug: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    difficulty: 'easy',
    tags: ['linked-list', 'merge', 'dummy-node'],
    concept: {
      title: 'A dummy node saves the special case',
      body: [
        'Merging two sorted lists is the merge step of merge sort, but done by **re-linking** the existing nodes. Keep one reference into each list and a `tail` reference to the end of the merged list. In each step append the smaller of the two current nodes to `tail` and move that list forward.',
        { code: 'dummy = ListNode(0)\ntail = dummy\nwhile a is not None and b is not None:\n    if a.val <= b.val:\n        tail.next = a; a = a.next\n    else:\n        tail.next = b; b = b.next\n    tail = tail.next\ntail.next = a if a is not None else b       # one list is left: attach the rest' },
        'The **dummy node** is a fake first node. Without it, the first appended node would need special code, because the merged list has no head yet. At the end the real head is `dummy.next`.'
      ]
    },
    statement: ['Two singly linked lists are sorted in non-decreasing order. Merge them into one sorted list by re-linking their nodes, and print it. If two values are equal, the node of the first list comes first.'],
    inputFormat: ['The first line has `n` and `m`, the sizes of the two lists.', 'The second line has the values of the first list.', 'The third line has the values of the second list.'],
    outputFormat: ['Print the values of the merged list on one line.'],
    constraints: ['1 <= n, m <= 20000', '-10^9 <= each value <= 10^9', 'Both lists are sorted in non-decreasing order.'],
    examples: [{ input: '3 3\n1 2 4\n1 3 4\n', note: 'The merged list is 1 1 2 3 4 4.' }],
    hints: ['Compare the heads of the two lists and append the smaller node.', 'Use a dummy first node so that the first append is not a special case.', 'When one list is empty, attach the rest of the other list in one step.'],
    program: listProgram({
      io: ['n:int m:int', 'a:int[n]', 'b:int[m]'],
      solution: {
        python: r`
          def merge_lists(a, b):
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
              return dummy.next`,
        cpp: r`
          ListNode* mergeLists(ListNode* a, ListNode* b) {
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
          }`,
        java: r`
          static ListNode mergeLists(ListNode a, ListNode b) {
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
          }`
      },
      stub: {
        python: r`
          def merge_lists(a, b):
              # Your code here
              return a`,
        cpp: r`
          ListNode* mergeLists(ListNode* a, ListNode* b) {
              // Your code here
              return a;
          }`,
        java: r`
          static ListNode mergeLists(ListNode a, ListNode b) {
              // Your code here
              return a;
          }`
      },
      call: { python: 'print_list(merge_lists(build_list(a), build_list(b)))', cpp: 'printList(mergeLists(buildList(a), buildList(b)));', java: 'printList(mergeLists(buildList(a), buildList(b)));' }
    }),
    solution: { explanation: ['Like the merge step of merge sort: always append the smaller head. The dummy node makes the first append an ordinary step, and the rest of the longer list is attached in one move.'], complexity: 'Time O(n + m), space O(1).' },
    solve(input) { const rs = rows(input); return show([...nums(rs[1]), ...nums(rs[2])].sort((p, s) => p - s)); },
    tests() { const g = rng(504); const two = (n, m, lo, hi) => `${n} ${m}\n${randArray(g, n, lo, hi).sort((p, s) => p - s).join(' ')}\n${randArray(g, m, lo, hi).sort((p, s) => p - s).join(' ')}\n`; /* a one-node list that is the smallest or the largest value against a long list; a single value in the middle of a long list is avoided on purpose, because it makes the Java engine in the browser throw a NullPointerException in a correct solution (see ROADMAP) */ const one = (v, m) => `1 ${m}\n${v}\n${randArray(g, m, -1000, 1000).sort((p, s) => p - s).join(' ')}\n`; return ['3 3\n1 2 4\n1 3 4\n', '1 1\n5\n5\n', '1 3\n10\n1 2 3\n', '3 1\n1 2 3\n10\n', two(10, 7, -20, 20), two(2000, 1500, -1000, 1000), two(20000, 20000, -1000000000, 1000000000), two(20000, 20000, 0, 20), one(-1000000000, 20000), one(1000000000, 20000), two(1, 60, -1000, 1000), two(60, 1, -1000, 1000)]; }
  },

  {
    slug: 'palindrome-linked-list',
    title: 'Is the List a Palindrome?',
    difficulty: 'easy',
    tags: ['linked-list', 'two-pointers', 'palindrome'],
    concept: {
      title: 'Reverse the second half and compare',
      body: [
        'In an array you could compare `a[i]` with `a[n - 1 - i]`. A linked list has no indexes and cannot be walked backwards. Copying the values into an array costs O(n) memory. There is a trick that needs **no extra memory**: find the middle (slow and fast pointers), **reverse the second half** of the list, and compare the first half with the reversed second half node by node.',
        { code: 'slow = fast = head\nwhile fast is not None and fast.next is not None:\n    slow = slow.next; fast = fast.next.next    # slow is at the middle\nprev = None\nwhile slow is not None:                          # reverse from the middle on\n    nxt = slow.next; slow.next = prev; prev = slow; slow = nxt\nleft, right = head, prev\nwhile right is not None:\n    if left.val != right.val: return False\n    left = left.next; right = right.next\nreturn True' },
        'For an odd length the middle node ends up at the end of the first half and is compared with itself; that is harmless. This combines two earlier ideas: the middle by two speeds, and reversal by turning pointers.'
      ]
    },
    statement: ['Print `yes` if the values of a singly linked list read the same from the head to the tail and from the tail to the head, otherwise print `no`.'],
    inputFormat: [LIST_NOTE],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5\n1 2 3 2 1\n', note: 'A palindrome.' }, { input: '4\n1 2 3 1\n', note: 'Not a palindrome.' }],
    hints: ['Find the middle of the list with a slow and a fast reference.', 'Reverse the part of the list that starts at the middle.', 'Walk from the head and from the reversed half at the same time and compare the values.'],
    program: listProgram({
      solution: {
        python: r`
          def is_palindrome(head):
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
              left, right = head, prev
              while right is not None:
                  if left.val != right.val:
                      return False
                  left = left.next
                  right = right.next
              return True`,
        cpp: r`
          bool isPalindrome(ListNode* head) {
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
              ListNode* left = head;
              ListNode* right = prev;
              while (right != nullptr) {
                  if (left->val != right->val) return false;
                  left = left->next;
                  right = right->next;
              }
              return true;
          }`,
        java: r`
          static boolean isPalindrome(ListNode head) {
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
              ListNode left = head, right = prev;
              while (right != null) {
                  if (left.val != right.val) return false;
                  left = left.next;
                  right = right.next;
              }
              return true;
          }`
      },
      stub: {
        python: r`
          def is_palindrome(head):
              # Your code here
              return False`,
        cpp: r`
          bool isPalindrome(ListNode* head) {
              // Your code here
              return false;
          }`,
        java: r`
          static boolean isPalindrome(ListNode head) {
              // Your code here
              return false;
          }`
      },
      call: { python: 'print("yes" if is_palindrome(build_list(a)) else "no")', cpp: 'cout << (isPalindrome(buildList(a)) ? "yes" : "no") << "\\n";', java: 'System.out.println(isPalindrome(buildList(a)) ? "yes" : "no");' }
    }),
    solution: { explanation: ['The slow and fast pointers find the middle. The second half is reversed in place, and the two halves are compared node by node.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); return a.every((x, i) => x === a[a.length - 1 - i]) ? 'yes' : 'no'; },
    tests() { const g = rng(505); const pal = (half, mid) => { const h = randArray(g, half, -9, 9); return arr([...h, ...(mid ? [randInt(g, -9, 9)] : []), ...[...h].reverse()]); }; return ['5\n1 2 3 2 1\n', '4\n1 2 3 1\n', '1\n8\n', '2\n4 4\n', '2\n4 5\n', pal(10, true), pal(10, false), pal(9999, true), pal(10000, false), arr(randArray(g, 20000, -9, 9)), arr([...many(9999, (i) => i), 5, ...many(10000, (i) => 9998 - i)].map((x, i) => (i === 15000 ? 77 : x)))]; }
  },

  {
    slug: 'remove-linked-list-elements',
    title: 'Remove All Nodes With a Value',
    difficulty: 'easy',
    tags: ['linked-list', 'dummy-node', 'in-place'],
    concept: {
      title: 'The head can be removed too',
      body: [
        'To delete a node you need the node **before** it. That is a problem for the head: nothing stands before it, and removing the head changes which node is the head. Many list algorithms avoid this special case with a **dummy node** placed in front of the real head. After the work, the answer is `dummy.next`.',
        { code: 'dummy = ListNode(0, head)\ncur = dummy\nwhile cur.next is not None:\n    if cur.next.val == target:\n        cur.next = cur.next.next      # delete\n    else:\n        cur = cur.next\nreturn dummy.next' },
        'The loop looks one node ahead of `cur` (`cur.next`), which is exactly the node to be deleted. When the whole list is removed, `dummy.next` becomes `None` and the output is `empty`.'
      ]
    },
    statement: ['Remove all nodes of a singly linked list whose value equals `val`, and print the remaining list. If no node remains, print `empty`.'],
    inputFormat: ['The first line has `n` and `val`.', 'The second line has the values of the nodes, from the head to the tail.'],
    outputFormat: ['Print the remaining values on one line, or `empty`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value, val <= 10^9'],
    examples: [{ input: '7 6\n1 2 6 3 4 5 6\n', note: 'Both 6 are removed: 1 2 3 4 5.' }],
    hints: ['Put a dummy node in front of the head, so that the head can be removed like any other node.', 'Look at `cur.next`: if its value is the target, set `cur.next = cur.next.next`.', 'Move `cur` forward only when you did not delete.'],
    program: listProgram({
      io: ['n:int val:int', 'a:int[n]'],
      solution: {
        python: r`
          def remove_elements(head, val):
              dummy = ListNode(0, head)
              cur = dummy
              while cur.next is not None:
                  if cur.next.val == val:
                      cur.next = cur.next.next
                  else:
                      cur = cur.next
              return dummy.next`,
        cpp: r`
          ListNode* removeElements(ListNode* head, long long val) {
              ListNode dummy(0);
              dummy.next = head;
              ListNode* cur = &dummy;
              while (cur->next != nullptr) {
                  if (cur->next->val == val) cur->next = cur->next->next;
                  else cur = cur->next;
              }
              return dummy.next;
          }`,
        java: r`
          static ListNode removeElements(ListNode head, long val) {
              ListNode dummy = new ListNode(0);
              dummy.next = head;
              ListNode cur = dummy;
              while (cur.next != null) {
                  if (cur.next.val == val) cur.next = cur.next.next;
                  else cur = cur.next;
              }
              return dummy.next;
          }`
      },
      stub: {
        python: r`
          def remove_elements(head, val):
              # Your code here
              return head`,
        cpp: r`
          ListNode* removeElements(ListNode* head, long long val) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode removeElements(ListNode head, long val) {
              // Your code here
              return head;
          }`
      },
      call: { python: 'print_list(remove_elements(build_list(a), val))', cpp: 'printList(removeElements(buildList(a), val));', java: 'printList(removeElements(buildList(a), val));' }
    }),
    solution: { explanation: ['A dummy node in front of the head lets the head be deleted like any other node. `cur.next` is the candidate for deletion; `cur` only advances when nothing was deleted.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const val = nums(rs[0])[1]; return show(nums(rs[1]).filter((x) => x !== val)); },
    tests() { const g = rng(506); const make = (n, lo, hi, val) => `${n} ${val}\n${randArray(g, n, lo, hi).join(' ')}\n`; return ['7 6\n1 2 6 3 4 5 6\n', '1 5\n5\n', '1 5\n4\n', '4 7\n7 7 7 7\n', '5 1\n1 1 2 1 1\n', make(25, 0, 3, 2), make(2000, -5, 5, 0), make(20000, -1000000000, 1000000000, 0), make(20000, 0, 2, 1), make(20000, 7, 7, 7), make(20000, 0, 1, 9)]; }
  },

  {
    slug: 'kth-node-from-the-end',
    title: 'The k-th Node From the End',
    difficulty: 'easy',
    tags: ['linked-list', 'two-pointers', 'gap'],
    concept: {
      title: 'Two references with a fixed gap',
      body: [
        'To find the `k`-th node from the end you would like to know the length `n` and walk `n - k` steps, which takes two passes. With **one pass** you can use two references with a **fixed gap** of `k` nodes: first move `lead` forward `k` steps. Then move `lead` and `follow` together. When `lead` falls off the end (is `None`), `follow` stands `k` nodes before the end: on the `k`-th node from the end.',
        { code: 'lead = follow = head\nfor _ in range(k):\n    lead = lead.next          # create the gap\nwhile lead is not None:\n    lead = lead.next\n    follow = follow.next\nreturn follow' },
        'The same "gap" technique is used for removing the n-th node from the end, which comes next in the medium problems.'
      ]
    },
    statement: ['Print the value of the `k`-th node from the end of a singly linked list (the last node is the 1st from the end).'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has the values of the nodes, from the head to the tail.'],
    outputFormat: ['Print the value of that node.'],
    constraints: ['1 <= k <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5 2\n10 20 30 40 50\n', note: 'The 2nd node from the end is 40.' }],
    hints: ['You may not know the length of the list.', 'Move one reference `k` steps ahead, then move both references together.', 'When the front reference is past the last node, the other one is the answer.'],
    program: listProgram({
      io: ['n:int k:int', 'a:int[n]'],
      solution: {
        python: r`
          def kth_from_end(head, k):
              lead = follow = head
              for _ in range(k):
                  lead = lead.next
              while lead is not None:
                  lead = lead.next
                  follow = follow.next
              return follow`,
        cpp: r`
          ListNode* kthFromEnd(ListNode* head, int k) {
              ListNode* lead = head;
              ListNode* follow = head;
              for (int i = 0; i < k; i++) lead = lead->next;
              while (lead != nullptr) {
                  lead = lead->next;
                  follow = follow->next;
              }
              return follow;
          }`,
        java: r`
          static ListNode kthFromEnd(ListNode head, int k) {
              ListNode lead = head, follow = head;
              for (int i = 0; i < k; i++) lead = lead.next;
              while (lead != null) {
                  lead = lead.next;
                  follow = follow.next;
              }
              return follow;
          }`
      },
      stub: {
        python: r`
          def kth_from_end(head, k):
              # Your code here
              return head`,
        cpp: r`
          ListNode* kthFromEnd(ListNode* head, int k) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode kthFromEnd(ListNode head, int k) {
              // Your code here
              return head;
          }`
      },
      call: { python: 'print(kth_from_end(build_list(a), k).val)', cpp: 'cout << kthFromEnd(buildList(a), k)->val << "\\n";', java: 'System.out.println(kthFromEnd(buildList(a), (int) k).val);' }
    }),
    solution: { explanation: ['The front reference is moved `k` nodes ahead; then both move together. When the front reference leaves the list, the other one is `k` nodes before the end.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]); return String(a[a.length - k]); },
    tests() { const g = rng(507); const make = (n, k) => `${n} ${k}\n${randArray(g, n, -1000000000, 1000000000).join(' ')}\n`; return ['5 2\n10 20 30 40 50\n', '1 1\n7\n', '3 3\n1 2 3\n', '3 1\n1 2 3\n', make(20, 7), make(2000, 1000), make(20000, 1), make(20000, 20000), make(20000, 12345)]; }
  },

  {
    slug: 'linked-list-cycle',
    title: 'Does the List Have a Cycle?',
    difficulty: 'easy',
    tags: ['linked-list', 'two-pointers', 'cycle-detection'],
    concept: {
      title: 'Floyd\'s tortoise and hare',
      body: [
        'If the last node of a list points back to an earlier node, the list contains a **cycle** and walking along `next` never ends. How can you detect it without remembering every visited node (which needs O(n) memory)?',
        'Use the two-speed idea again: `slow` moves one node per step, `fast` moves two. If the list ends, `fast` reaches the end and there is no cycle. If there is a cycle, both end up running around it, and the faster one **catches up** with the slower one from behind: they meet at the same node.',
        { code: 'slow = fast = head\nwhile fast is not None and fast.next is not None:\n    slow = slow.next\n    fast = fast.next.next\n    if slow is fast:\n        return True\nreturn False' },
        'Compare the **nodes** (`slow is fast`, `slow == fast` for pointers), not their values: values can repeat. The starter builds the cycle from the input `pos`: the last node points to the node at index `pos`.'
      ]
    },
    statement: ['A linked list may have a cycle: the last node points back to the node at index `pos` (counting from 0) instead of to nothing. If `pos` is -1, there is no cycle. Print `yes` if the list has a cycle, otherwise `no`.'],
    inputFormat: ['The first line has `n` and `pos`.', 'The second line has the values of the nodes (the values may repeat).'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20000', '-1 <= pos < n', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '4 1\n3 2 0 -4\n', note: 'The last node points back to the node at index 1: a cycle.' }, { input: '2 -1\n1 2\n', note: 'No cycle.' }],
    hints: ['Visiting every node and remembering it works, but needs extra memory.', 'Move one reference by one node and another one by two nodes.', 'If they ever stand on the same node, there is a cycle; if the fast one reaches the end, there is none.'],
    program: listProgram({
      io: ['n:int pos:int', 'a:int[n]'],
      solution: {
        python: r`
          def has_cycle(head):
              slow = fast = head
              while fast is not None and fast.next is not None:
                  slow = slow.next
                  fast = fast.next.next
                  if slow is fast:
                      return True
              return False`,
        cpp: r`
          bool hasCycle(ListNode* head) {
              ListNode* slow = head;
              ListNode* fast = head;
              while (fast != nullptr && fast->next != nullptr) {
                  slow = slow->next;
                  fast = fast->next->next;
                  if (slow == fast) return true;
              }
              return false;
          }`,
        java: r`
          static boolean hasCycle(ListNode head) {
              ListNode slow = head, fast = head;
              while (fast != null && fast.next != null) {
                  slow = slow.next;
                  fast = fast.next.next;
                  if (slow == fast) return true;
              }
              return false;
          }`
      },
      stub: {
        python: r`
          def has_cycle(head):
              # Your code here
              return False`,
        cpp: r`
          bool hasCycle(ListNode* head) {
              // Your code here
              return false;
          }`,
        java: r`
          static boolean hasCycle(ListNode head) {
              // Your code here
              return false;
          }`
      },
      call: { python: 'print("yes" if has_cycle(build_list(a, pos)) else "no")', cpp: 'cout << (hasCycle(buildList(a, (int) pos)) ? "yes" : "no") << "\\n";', java: 'System.out.println(hasCycle(buildList(a, (int) pos)) ? "yes" : "no");' }
    }),
    solution: { explanation: ['The fast reference gains one node on the slow one in every step. Inside a cycle it must catch up with it, so meeting proves a cycle; reaching the end proves there is none.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const [n, pos] = nums(rows(input)[0]); return pos >= 0 ? 'yes' : 'no'; },
    tests() { const g = rng(508); const make = (n, pos) => `${n} ${pos}\n${randArray(g, n, -5, 5).join(' ')}\n`; return ['4 1\n3 2 0 -4\n', '2 -1\n1 2\n', '1 0\n5\n', '1 -1\n5\n', '2 0\n1 1\n', make(20, 7), make(20, -1), make(20000, -1), make(20000, 0), make(20000, 19999), make(20000, 10000), make(19999, 5)]; }
  },

  {
    slug: 'insert-into-sorted-list',
    title: 'Insert Into a Sorted List',
    difficulty: 'easy',
    tags: ['linked-list', 'sorted', 'insertion'],
    concept: {
      title: 'Insertion: new node, two pointer changes',
      body: [
        'To **insert** a node after a node `p`, make the new node point to what `p` pointed to, and then make `p` point to the new node. The order matters: if you change `p.next` first, you lose the rest of the list.',
        { code: 'node = ListNode(x)\nnode.next = p.next      # 1. the new node takes over the rest of the list\np.next = node           # 2. p now points to the new node' },
        'In a sorted list, walk until the next node is **not smaller** than `x`; then `cur` is the last node that is smaller than `x`, and you insert after it. A dummy node in front handles the case when `x` is the new smallest value and becomes the head. If `x` equals existing values, insert it **before** them.'
      ]
    },
    statement: ['A singly linked list is sorted in non-decreasing order. Insert a new node with the value `x` so that the list stays sorted. If the list already contains the value `x`, the new node goes before the nodes with that value. Print the resulting list.'],
    inputFormat: ['The first line has `n` and `x`.', 'The second line has the values of the sorted list.'],
    outputFormat: ['Print the values of the new list on one line.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value, x <= 10^9'],
    examples: [{ input: '4 3\n1 2 4 5\n', note: 'The new node goes between 2 and 4: 1 2 3 4 5.' }],
    hints: ['Use a dummy node in front of the head.', 'Move `cur` while `cur.next` exists and is smaller than `x`.', 'Link the new node in two steps: first its `next`, then `cur.next`.'],
    program: listProgram({
      io: ['n:int x:int', 'a:int[n]'],
      solution: {
        python: r`
          def insert_sorted(head, x):
              dummy = ListNode(0, head)
              cur = dummy
              while cur.next is not None and cur.next.val < x:
                  cur = cur.next
              node = ListNode(x)
              node.next = cur.next
              cur.next = node
              return dummy.next`,
        cpp: r`
          ListNode* insertSorted(ListNode* head, long long x) {
              ListNode dummy(0);
              dummy.next = head;
              ListNode* cur = &dummy;
              while (cur->next != nullptr && cur->next->val < x) cur = cur->next;
              ListNode* node = new ListNode(x);
              node->next = cur->next;
              cur->next = node;
              return dummy.next;
          }`,
        java: r`
          static ListNode insertSorted(ListNode head, long x) {
              ListNode dummy = new ListNode(0);
              dummy.next = head;
              ListNode cur = dummy;
              while (cur.next != null && cur.next.val < x) cur = cur.next;
              ListNode node = new ListNode(x);
              node.next = cur.next;
              cur.next = node;
              return dummy.next;
          }`
      },
      stub: {
        python: r`
          def insert_sorted(head, x):
              # Your code here
              return head`,
        cpp: r`
          ListNode* insertSorted(ListNode* head, long long x) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode insertSorted(ListNode head, long x) {
              // Your code here
              return head;
          }`
      },
      call: { python: 'print_list(insert_sorted(build_list(a), x))', cpp: 'printList(insertSorted(buildList(a), x));', java: 'printList(insertSorted(buildList(a), x));' }
    }),
    solution: { explanation: ['`cur` stops at the last node that is smaller than `x`. The new node first takes over `cur.next`, and then `cur` points to it. The dummy node covers insertion at the front.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const x = nums(rs[0])[1]; const a = nums(rs[1]); let i = 0; while (i < a.length && a[i] < x) i++; return show([...a.slice(0, i), x, ...a.slice(i)]); },
    tests() { const g = rng(509); const make = (n, lo, hi, x) => `${n} ${x}\n${randArray(g, n, lo, hi).sort((p, s) => p - s).join(' ')}\n`; return ['4 3\n1 2 4 5\n', '1 5\n3\n', '1 5\n9\n', '3 2\n2 2 2\n', '3 0\n1 2 3\n', make(20, -9, 9, 0), make(2000, -100, 100, 37), make(20000, -1000000000, 1000000000, 123456789), make(20000, -1000000000, 1000000000, -1000000000), make(20000, -1000000000, 1000000000, 1000000000), make(20000, 0, 10, 5)]; }
  },

  {
    slug: 'binary-list-to-number',
    title: 'Binary Number in a Linked List',
    difficulty: 'easy',
    tags: ['linked-list', 'traversal', 'binary'],
    concept: {
      title: 'Build the number while you walk',
      body: [
        'The nodes hold the bits of a binary number, **most significant bit first**. You can compute the value in one walk without knowing the length: every new bit shifts the number built so far one place to the left (multiplying by 2) and adds the new bit.',
        { code: 'value = 0\nwhile head is not None:\n    value = value * 2 + head.val\n    head = head.next\nreturn value' },
        'For `1 0 1`: `0 -> 1 -> 2 -> 5`. This "accumulate while traversing" pattern is the basic way to compute anything over a list: a sum, a maximum, a count, or here a number. In C++ and Java use 64-bit integers.'
      ]
    },
    statement: ['The nodes of a singly linked list hold the bits 0 or 1 of a binary number, most significant bit first. Print the value of the number in decimal.'],
    inputFormat: [LIST_NOTE],
    outputFormat: ['Print the decimal value.'],
    constraints: ['1 <= n <= 62', 'Each value is 0 or 1.'],
    examples: [{ input: '3\n1 0 1\n', note: 'The binary number 101 is 5.' }],
    hints: ['The first node is the most significant bit.', 'For every node, double the value so far and add the bit.', 'Use 64-bit integers; the number can have up to 62 bits.'],
    program: listProgram({
      solution: {
        python: r`
          def get_decimal(head):
              value = 0
              while head is not None:
                  value = value * 2 + head.val
                  head = head.next
              return value`,
        cpp: r`
          long long getDecimal(ListNode* head) {
              long long value = 0;
              while (head != nullptr) {
                  value = value * 2 + head->val;
                  head = head->next;
              }
              return value;
          }`,
        java: r`
          static long getDecimal(ListNode head) {
              long value = 0;
              while (head != null) {
                  value = value * 2 + head.val;
                  head = head.next;
              }
              return value;
          }`
      },
      stub: {
        python: r`
          def get_decimal(head):
              # Your code here
              return 0`,
        cpp: r`
          long long getDecimal(ListNode* head) {
              // Your code here
              return 0;
          }`,
        java: r`
          static long getDecimal(ListNode head) {
              // Your code here
              return 0;
          }`
      },
      call: { python: 'print(get_decimal(build_list(a)))', cpp: 'cout << getDecimal(buildList(a)) << "\\n";', java: 'System.out.println(getDecimal(buildList(a)));' }
    }),
    solution: { explanation: ['Each bit shifts the value so far one place to the left and is added at the right end; after the last node the value is complete.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { return BigInt('0b' + nums(rows(input)[1]).join('')).toString(); },
    tests() { const g = rng(510); const bits = (n) => arr(many(n, () => randInt(g, 0, 1))); return ['3\n1 0 1\n', '1\n0\n', '1\n1\n', '4\n0 0 0 1\n', '62\n' + '1 '.repeat(61) + '1\n', bits(10), bits(30), bits(62), bits(62), bits(61)]; }
  }
];
