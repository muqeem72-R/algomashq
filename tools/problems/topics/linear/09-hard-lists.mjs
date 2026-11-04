import { r, rng, randInt, randArray, many, arr, nums, rows } from '../../lib.mjs';
import { listProgram } from '../../scaffolds.mjs';

const LIST_NOTE = 'The first line has `n`, the number of nodes. The second line has the values of the nodes, from the head to the tail.';
const show = (a) => (a.length ? a.join(' ') : 'empty');
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const call = (fnPy, fnCpp, extraPy = '', extraCpp = '') => ({ python: `print_list(${fnPy}(build_list(a)${extraPy}))`, cpp: `printList(${fnCpp}(buildList(a)${extraCpp}));`, java: `printList(${fnCpp}(buildList(a)${extraCpp}));` });

// ---- Helpers for merging k lists: the input gives all lists in one flat array ----
const MANY_LISTS = {
  python: r`
    # Builds the lists from their lengths and the flat array of all values (the lists may be empty).
    def build_lists(lens, vals):
        lists = []
        pos = 0
        for length in lens:
            lists.append(build_list(vals[pos:pos + length]))
            pos += length
        return lists`,
  cpp: r`
    // Builds the lists from their lengths and the flat array of all values (the lists may be empty).
    vector<ListNode*> buildLists(const vector<long long>& lens, const vector<long long>& vals) {
        vector<ListNode*> lists;
        size_t pos = 0;
        for (long long length : lens) {
            vector<long long> part(vals.begin() + pos, vals.begin() + pos + length);
            lists.push_back(buildList(part));
            pos += length;
        }
        return lists;
    }`,
  java: r`
    // Builds the lists from their lengths and the flat array of all values (the lists may be empty).
    static ListNode[] buildLists(long[] lens, long[] vals) {
        ListNode[] lists = new ListNode[lens.length];
        int pos = 0;
        for (int i = 0; i < lens.length; i++) {
            lists[i] = buildList(Arrays.copyOfRange(vals, pos, pos + (int) lens[i]));
            pos += (int) lens[i];
        }
        return lists;
    }`
};

// ---- Helpers for copying a list whose nodes have a second pointer (random) ----
const RANDOM_BASE = {
  python: r`
    # Every node is also remembered in this list; free_nodes() (called at the end) cuts all links so that Python in the
    # browser can free the nodes one by one.
    all_nodes = []


    class RNode:
        def __init__(self, val):
            self.val = val
            self.next = None
            self.random = None
            all_nodes.append(self)


    def free_nodes():
        for node in all_nodes:
            node.next = None
            node.random = None
        all_nodes.clear()


    # Builds the list: node i gets the value values[i] and its random pointer points to the node with the index random_index[i]
    # (-1 means no random pointer).
    def build_random(values, random_index):
        nodes = [RNode(v) for v in values]
        for i, node in enumerate(nodes):
            if i + 1 < len(nodes):
                node.next = nodes[i + 1]
            if random_index[i] >= 0:
                node.random = nodes[random_index[i]]
        return nodes[0] if nodes else None


    def nodes_of(head):
        nodes = []
        while head is not None:
            nodes.append(head)
            head = head.next
        return nodes


    # "value:index of the random target" for every node (-1: none, -2: a node of another list).
    def serialize(head):
        nodes = nodes_of(head)
        index = {id(node): i for i, node in enumerate(nodes)}
        return " ".join("%d:%d" % (node.val, index.get(id(node.random), -2) if node.random is not None else -1) for node in nodes)`,
  cpp: r`
    struct RNode {
        long long val;
        RNode* next;
        RNode* random;
        RNode(long long v) : val(v), next(nullptr), random(nullptr) {}
    };

    // Builds the list: node i gets the value values[i] and its random pointer points to the node with the index randomIndex[i]
    // (-1 means no random pointer).
    RNode* buildRandom(const vector<long long>& values, const vector<long long>& randomIndex) {
        vector<RNode*> nodes;
        for (long long v : values) nodes.push_back(new RNode(v));
        for (size_t i = 0; i < nodes.size(); i++) {
            if (i + 1 < nodes.size()) nodes[i]->next = nodes[i + 1];
            if (randomIndex[i] >= 0) nodes[i]->random = nodes[randomIndex[i]];
        }
        return nodes.empty() ? nullptr : nodes[0];
    }

    // "value:index of the random target" for every node (-1: none, -2: a node of another list).
    string serialize(RNode* head) {
        unordered_map<RNode*, int> index;
        int count = 0;
        for (RNode* p = head; p != nullptr; p = p->next) index[p] = count++;
        string out;
        for (RNode* p = head; p != nullptr; p = p->next) {
            int target = -1;
            if (p->random != nullptr) target = index.count(p->random) ? index[p->random] : -2;
            if (!out.empty()) out += " ";
            out += to_string(p->val) + ":" + to_string(target);
        }
        return out;
    }`,
  java: r`
    static class RNode {
        long val;
        RNode next;
        RNode random;

        RNode(long val) {
            this.val = val;
        }
    }

    // Builds the list: node i gets the value values[i] and its random pointer points to the node with the index randomIndex[i]
    // (-1 means no random pointer).
    static RNode buildRandom(long[] values, long[] randomIndex) {
        RNode[] nodes = new RNode[values.length];
        for (int i = 0; i < nodes.length; i++) nodes[i] = new RNode(values[i]);
        for (int i = 0; i < nodes.length; i++) {
            if (i + 1 < nodes.length) nodes[i].next = nodes[i + 1];
            if (randomIndex[i] >= 0) nodes[i].random = nodes[(int) randomIndex[i]];
        }
        return nodes.length == 0 ? null : nodes[0];
    }

    // "value:index of the random target" for every node (-1: none, -2: a node of another list).
    static String serialize(RNode head) {
        Map<RNode, Integer> index = new IdentityHashMap<>();
        int count = 0;
        for (RNode p = head; p != null; p = p.next) index.put(p, count++);
        StringBuilder out = new StringBuilder();
        for (RNode p = head; p != null; p = p.next) {
            int target = -1;
            if (p.random != null) target = index.containsKey(p.random) ? index.get(p.random) : -2;
            if (out.length() > 0) out.append(" ");
            out.append(p.val).append(":").append(target);
        }
        return out.toString();
    }`
};

export default [
  {
    slug: 'reverse-nodes-in-k-group',
    title: 'Reverse a List in Groups of k',
    difficulty: 'hard',
    tags: ['linked-list', 'pointers', 'reversal'],
    concept: {
      title: 'Reverse one group at a time, and stop when fewer than k nodes remain',
      body: [
        'Cut the list into groups of `k` nodes and reverse **each complete group**; a last group with fewer than `k` nodes stays as it is. You already know how to reverse a list segment in place; the difficulty is to do it for many groups and to keep every group connected to the one before it.',
        'Use a dummy node and `prev`, the last node of the part that is already done. In each round: (1) walk `k` steps from `prev` to find the `k`-th node `kth`; if there are fewer than `k` nodes, stop. (2) Remember `group_next = kth.next`, the first node after the group. (3) Reverse the nodes from `prev.next` up to `kth`, making the first node of the reversed part point to `group_next`. (4) Connect `prev` to `kth` (the new first node of the group). (5) Move `prev` to the old first node of the group, which is now its last node.',
        { code: 'while True:\n    kth = prev\n    for _ in range(k):\n        kth = kth.next\n        if kth is None: return dummy.next        # fewer than k nodes left\n    group_next = kth.next\n    p, cur = group_next, prev.next                # reverse and point the old head at group_next\n    while cur is not group_next:\n        nxt = cur.next; cur.next = p; p = cur; cur = nxt\n    tail = prev.next                               # the old first node, now the last of the group\n    prev.next = kth\n    prev = tail' },
        'The trick of starting the reversal with `p = group_next` connects the group to what comes after it without an extra step.'
      ]
    },
    statement: ['Reverse the nodes of a singly linked list in groups of `k`: the first `k` nodes are reversed, then the next `k` nodes, and so on. If the last group has fewer than `k` nodes, it stays as it is. Change the links, not the values. Print the resulting list.'],
    inputFormat: ['The first line has `n` and `k`.', 'The second line has the values of the nodes, from the head to the tail.'],
    outputFormat: ['Print the values of the new list on one line.'],
    constraints: ['1 <= k <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '5 2\n1 2 3 4 5\n', note: 'The groups (1 2) and (3 4) are reversed; 5 stays: 2 1 4 3 5.' }, { input: '5 3\n1 2 3 4 5\n', note: '(1 2 3) becomes 3 2 1; the last two nodes stay: 3 2 1 4 5.' }],
    hints: ['Use a dummy node and a reference `prev` to the node before the current group.', 'First check that `k` nodes are available; if not, stop.', 'Reverse the group so that its first node ends up pointing to the node after the group, then reconnect `prev`.'],
    program: listProgram({
      io: ['n:int k:int', 'a:int[n]'],
      solution: {
        python: r`
          def reverse_k_group(head, k):
              dummy = ListNode(0, head)
              prev = dummy
              while True:
                  kth = prev
                  for _ in range(k):
                      kth = kth.next
                      if kth is None:
                          return dummy.next
                  group_next = kth.next
                  p, cur = group_next, prev.next
                  while cur is not group_next:
                      nxt = cur.next
                      cur.next = p
                      p = cur
                      cur = nxt
                  tail = prev.next
                  prev.next = kth
                  prev = tail`,
        cpp: r`
          ListNode* reverseKGroup(ListNode* head, int k) {
              ListNode dummy(0);
              dummy.next = head;
              ListNode* prev = &dummy;
              while (true) {
                  ListNode* kth = prev;
                  for (int i = 0; i < k; i++) {
                      kth = kth->next;
                      if (kth == nullptr) return dummy.next;
                  }
                  ListNode* groupNext = kth->next;
                  ListNode* p = groupNext;
                  ListNode* cur = prev->next;
                  while (cur != groupNext) {
                      ListNode* next = cur->next;
                      cur->next = p;
                      p = cur;
                      cur = next;
                  }
                  ListNode* tail = prev->next;
                  prev->next = kth;
                  prev = tail;
              }
          }`,
        java: r`
          static ListNode reverseKGroup(ListNode head, int k) {
              ListNode dummy = new ListNode(0);
              dummy.next = head;
              ListNode prev = dummy;
              while (true) {
                  ListNode kth = prev;
                  for (int i = 0; i < k; i++) {
                      kth = kth.next;
                      if (kth == null) return dummy.next;
                  }
                  ListNode groupNext = kth.next;
                  ListNode p = groupNext, cur = prev.next;
                  while (cur != groupNext) {
                      ListNode next = cur.next;
                      cur.next = p;
                      p = cur;
                      cur = next;
                  }
                  ListNode tail = prev.next;
                  prev.next = kth;
                  prev = tail;
              }
          }`
      },
      stub: {
        python: r`
          def reverse_k_group(head, k):
              # Your code here
              return head`,
        cpp: r`
          ListNode* reverseKGroup(ListNode* head, int k) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode reverseKGroup(ListNode head, int k) {
              // Your code here
              return head;
          }`
      },
      call: { python: 'print_list(reverse_k_group(build_list(a), k))', cpp: 'printList(reverseKGroup(buildList(a), k));', java: 'printList(reverseKGroup(buildList(a), (int) k));' }
    }),
    solution: { explanation: ['For each group, `prev` finds the k-th node, the group is reversed with its first node pointing to what follows the group, and `prev` is reconnected and moved to the old first node.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const k = nums(rs[0])[1]; const a = nums(rs[1]); const out = []; for (let i = 0; i < a.length; i += k) { const g = a.slice(i, i + k); out.push(...(g.length === k ? g.reverse() : g)); } return show(out); },
    tests() { const g = rng(601); const make = (n, k) => `${n} ${k}\n${randArray(g, n, -1000000000, 1000000000).join(' ')}\n`; return ['5 2\n1 2 3 4 5\n', '5 3\n1 2 3 4 5\n', '1 1\n9\n', '4 4\n1 2 3 4\n', '4 1\n1 2 3 4\n', make(20, 3), make(2000, 7), make(20000, 2), make(20000, 20000), make(20000, 19999), make(20000, 1), make(20000, 137)]; }
  },

  {
    slug: 'merge-k-sorted-lists',
    title: 'Merge k Sorted Lists',
    difficulty: 'hard',
    tags: ['linked-list', 'heap', 'priority-queue', 'merge'],
    concept: {
      title: 'A heap that always knows the smallest head',
      body: [
        'To merge `k` sorted lists, the next node of the result is the smallest of the `k` current heads. Finding it with a scan costs `k` per node. A **heap** (priority queue) gives the smallest element in O(log k): put the head of every list into a min-heap. Repeatedly **pop** the smallest node, append it to the result, and **push** the next node of the same list (if any).',
        { code: 'heap = [(node.val, i, node) for i, node in enumerate(lists) if node]   # i breaks ties\nheapq.heapify(heap)\nwhile heap:\n    val, i, node = heapq.heappop(heap)\n    tail.next = node; tail = node\n    if node.next: heapq.heappush(heap, (node.next.val, i, node.next))' },
        'The index `i` in the tuple makes the comparison well defined when two values are equal (Python would otherwise try to compare the nodes). The heap holds at most `k` nodes, so every step costs O(log k) and the whole merge O(N log k) for `N` nodes in total. (Merging the lists two at a time, in a tournament, has the same cost.)',
        'In this problem the starter builds all the lists from the input, `lists` can contain empty lists (`None`), and all lists are sorted in non-decreasing order.'
      ]
    },
    statement: ['`k` singly linked lists are sorted in non-decreasing order (some may be empty). Merge them into one sorted list and print it, or `empty` if there are no nodes at all.'],
    inputFormat: ['The first line has `k` and `t`, the number of lists and the total number of nodes.', 'The second line has the `k` lengths of the lists.', 'The third line has all the `t` values: first the values of list 1, then of list 2, and so on.'],
    outputFormat: ['Print the values of the merged list on one line, or `empty`.'],
    constraints: ['1 <= k <= 5000', '0 <= t <= 20000 (if t is 0, the third line is empty)', '-10^9 <= each value <= 10^9, and every list is sorted'],
    examples: [{ input: '3 6\n3 2 1\n1 4 5 1 3 2\n', note: 'The lists are 1 4 5, 1 3 and 2. The merged list is 1 1 2 3 4 5.' }],
    hints: ['Put the head of every non-empty list in a min-heap together with the index of its list.', 'Pop the smallest node, append it to the result, and push its successor.', 'The heap never holds more than `k` nodes.'],
    program: listProgram({
      io: ['k:int t:int', 'lens:int[k]', 'vals:int[t]'],
      extra: MANY_LISTS,
      includes: ['<queue>', '<functional>'],
      solution: {
        python: r`
          def merge_k_lists(lists):
              import heapq
              heap = []
              for i, node in enumerate(lists):
                  if node is not None:
                      heap.append((node.val, i, node))
              heapq.heapify(heap)
              dummy = ListNode(0)
              tail = dummy
              while heap:
                  val, i, node = heapq.heappop(heap)
                  tail.next = node
                  tail = node
                  if node.next is not None:
                      heapq.heappush(heap, (node.next.val, i, node.next))
              return dummy.next`,
        cpp: r`
          ListNode* mergeKLists(vector<ListNode*>& lists) {
              typedef pair<long long, int> Entry;
              priority_queue<Entry, vector<Entry>, greater<Entry>> heap;
              vector<ListNode*> current = lists;
              for (int i = 0; i < (int) current.size(); i++) {
                  if (current[i] != nullptr) heap.push({current[i]->val, i});
              }
              ListNode dummy(0);
              ListNode* tail = &dummy;
              while (!heap.empty()) {
                  int i = heap.top().second;
                  heap.pop();
                  ListNode* node = current[i];
                  tail->next = node;
                  tail = node;
                  current[i] = node->next;
                  if (current[i] != nullptr) heap.push({current[i]->val, i});
              }
              tail->next = nullptr;
              return dummy.next;
          }`,
        java: r`
          static ListNode mergeKLists(ListNode[] lists) {
              PriorityQueue<ListNode> heap = new PriorityQueue<>((x, y) -> Long.compare(x.val, y.val));
              for (ListNode node : lists) {
                  if (node != null) heap.add(node);
              }
              ListNode dummy = new ListNode(0);
              ListNode tail = dummy;
              while (!heap.isEmpty()) {
                  ListNode node = heap.poll();
                  tail.next = node;
                  tail = node;
                  if (node.next != null) heap.add(node.next);
              }
              return dummy.next;
          }`
      },
      stub: {
        python: r`
          def merge_k_lists(lists):
              # Your code here
              return None`,
        cpp: r`
          ListNode* mergeKLists(vector<ListNode*>& lists) {
              // Your code here
              return nullptr;
          }`,
        java: r`
          static ListNode mergeKLists(ListNode[] lists) {
              // Your code here
              return null;
          }`
      },
      call: { python: 'print_list(merge_k_lists(build_lists(lens, vals)))', cpp: 'vector<ListNode*> lists = buildLists(lens, vals);\nprintList(mergeKLists(lists));', java: 'printList(mergeKLists(buildLists(lens, vals)));' }
    }),
    solution: { explanation: ['A min-heap holds the current head of every list. The smallest node is moved to the result and the next node of its list is pushed, so every step costs O(log k).'], complexity: 'Time O(N log k), space O(k).' },
    solve(input) { const rs = rows(input); return show(nums(rs[2] || '').sort((p, s) => p - s)); },
    tests() {
      const g = rng(602);
      const make = (k, t, lo, hi) => { const lens = Array(k).fill(0); for (let i = 0; i < t; i++) lens[randInt(g, 0, k - 1)]++; const lists = lens.map((len) => randArray(g, len, lo, hi).sort((p, s) => p - s)); return `${k} ${t}\n${lens.join(' ')}\n${lists.flat().join(' ')}\n`; };
      return ['3 6\n3 2 1\n1 4 5 1 3 2\n', '1 1\n1\n7\n', '2 0\n0 0\n\n', '3 3\n0 3 0\n1 2 3\n', make(5, 12, -9, 9), make(50, 300, -1000, 1000), make(1000, 20000, -1000000000, 1000000000), make(5000, 20000, -1000000000, 1000000000), make(2, 20000, -1000000000, 1000000000), make(100, 20000, 0, 5), make(1, 20000, -1000000000, 1000000000)];
    }
  },

  {
    slug: 'copy-list-with-random-pointer',
    title: 'Copy a List With Random Pointers',
    difficulty: 'hard',
    tags: ['linked-list', 'hash-map', 'deep-copy'],
    concept: {
      title: 'A copy has to map every old node to its new node',
      body: [
        'Every node has two pointers: `next` and `random` (which may point to any node of the list, or to nothing). You must build a **deep copy**: new nodes with the same values, where the `next` and `random` pointers of the copy point to **copied nodes**, never to the original ones. The original list must stay unchanged.',
        'The difficulty is that `random` can point **forward** to a node that does not exist in the copy yet. A hash map from **original node to copied node** solves it in two passes: (1) create a copy of every node and store it in the map; (2) walk the list again and set `copy.next = map[node.next]` and `copy.random = map[node.random]`.',
        { code: 'copy = {None: None}\nnode = head\nwhile node: copy[node] = Node(node.val); node = node.next        # pass 1: the nodes\nnode = head\nwhile node:\n    copy[node].next = copy[node.next]                           # pass 2: the pointers\n    copy[node].random = copy[node.random]\n    node = node.next\nreturn copy[head]' },
        'Mapping `None` to `None` removes the checks for missing pointers. There is also a way without a map and with O(1) extra memory (weave the copies between the original nodes, set the random pointers, then separate the two lists), which is a good exercise. In this problem the starter checks that your copy shares no node with the original and that the original list is unchanged.'
      ]
    },
    statement: ['A singly linked list has `n` nodes. Besides `next`, every node has a `random` pointer that points to any node of the list (also to itself) or to nothing. Create a deep copy of the list: `n` new nodes whose `next` and `random` pointers point to the new nodes in the same way as the original. Print the copy: for each node of the copy, from the head to the tail, the value and the index of its random target, as `value:index` (the index is -1 if there is no random pointer). If the copy shares a node with the original or the original changed, the output is `invalid`.'],
    inputFormat: ['The first line has `n`.', 'The second line has the values of the nodes.', 'The third line has, for every node, the index of the node its random pointer points to, or -1.'],
    outputFormat: ['Print `value:index` for every node of the copy, separated by spaces.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value <= 10^9', '-1 <= each random index < n'],
    examples: [{ input: '3\n7 13 11\n-1 0 2\n', note: 'The second node points to the first, the third node points to itself.' }],
    hints: ['A random pointer can point to a node that has no copy yet.', 'First make a copy of every node and remember it in a map from the old node to the new node.', 'Then walk the list again and set the `next` and `random` of every copy through the map.'],
    program: listProgram({
      io: ['n:int', 'a:int[n]', 'rnd:int[n]'],
      base: RANDOM_BASE,
      includes: ['<unordered_map>', '<unordered_set>', '<string>'],
      solution: {
        python: r`
          def copy_random_list(head):
              copy = {None: None}
              node = head
              while node is not None:
                  copy[node] = RNode(node.val)
                  node = node.next
              node = head
              while node is not None:
                  copy[node].next = copy[node.next]
                  copy[node].random = copy[node.random]
                  node = node.next
              return copy[head]`,
        cpp: r`
          RNode* copyRandomList(RNode* head) {
              unordered_map<RNode*, RNode*> copy;
              copy[nullptr] = nullptr;
              for (RNode* node = head; node != nullptr; node = node->next) copy[node] = new RNode(node->val);
              for (RNode* node = head; node != nullptr; node = node->next) {
                  copy[node]->next = copy[node->next];
                  copy[node]->random = copy[node->random];
              }
              return copy[head];
          }`,
        java: r`
          static RNode copyRandomList(RNode head) {
              Map<RNode, RNode> copy = new IdentityHashMap<>();
              copy.put(null, null);
              for (RNode node = head; node != null; node = node.next) copy.put(node, new RNode(node.val));
              for (RNode node = head; node != null; node = node.next) {
                  copy.get(node).next = copy.get(node.next);
                  copy.get(node).random = copy.get(node.random);
              }
              return copy.get(head);
          }`
      },
      stub: {
        python: r`
          def copy_random_list(head):
              # Your code here
              return None`,
        cpp: r`
          RNode* copyRandomList(RNode* head) {
              // Your code here
              return nullptr;
          }`,
        java: r`
          static RNode copyRandomList(RNode head) {
              // Your code here
              return null;
          }`
      },
      call: {
        python: 'head = build_random(a, rnd)\nbefore = serialize(head)\noriginals = set(id(x) for x in nodes_of(head))\ncopy = copy_random_list(head)\nafter = serialize(head)\nshared = any(id(x) in originals for x in nodes_of(copy))\nprint(serialize(copy) if before == after and not shared else "invalid")',
        cpp: 'RNode* head = buildRandom(a, rnd);\nstring before = serialize(head);\nunordered_set<RNode*> originals;\nfor (RNode* p = head; p != nullptr; p = p->next) originals.insert(p);\nRNode* copy = copyRandomList(head);\nstring after = serialize(head);\nbool shared = false;\nfor (RNode* p = copy; p != nullptr; p = p->next) {\n    if (originals.count(p)) shared = true;\n}\ncout << (before == after && !shared ? serialize(copy) : "invalid") << "\\n";',
        java: 'RNode head = buildRandom(a, rnd);\nString before = serialize(head);\nSet<RNode> originals = Collections.newSetFromMap(new IdentityHashMap<>());\nfor (RNode p = head; p != null; p = p.next) originals.add(p);\nRNode copy = copyRandomList(head);\nString after = serialize(head);\nboolean shared = false;\nfor (RNode p = copy; p != null; p = p.next) {\n    if (originals.contains(p)) shared = true;\n}\nSystem.out.println(before.equals(after) && !shared ? serialize(copy) : "invalid");'
      }
    }),
    solution: { explanation: ['A map from every original node to its copy is filled in a first pass; a second pass sets `next` and `random` of every copy through the map, with `None` mapped to `None`.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const rs = rows(input); const a = nums(rs[1]), rnd = nums(rs[2]); return a.map((v, i) => `${v}:${rnd[i]}`).join(' '); },
    tests() {
      const g = rng(603);
      const make = (n, pNone, hi) => `${n}\n${randArray(g, n, -hi, hi).join(' ')}\n${many(n, () => (g() < pNone ? -1 : randInt(g, 0, n - 1))).join(' ')}\n`;
      return ['3\n7 13 11\n-1 0 2\n', '1\n5\n-1\n', '1\n5\n0\n', '2\n1 1\n1 0\n', make(10, 0.3, 9), make(300, 0.3, 1000), make(20000, 0.3, 1000000000), make(20000, 0, 1000000000), make(20000, 1, 1000000000), `20000\n${many(20000, (i) => i).join(' ')}\n${many(20000, (i) => 19999 - i).join(' ')}\n`];
    }
  },

  {
    slug: 'lru-cache-operations',
    title: 'An LRU Cache',
    difficulty: 'hard',
    tags: ['design', 'hash-map', 'linked-list', 'cache'],
    concept: {
      title: 'A hash map for finding, a list for the order of use',
      body: [
        'A **cache** keeps a limited number of items in fast memory. When it is full, the **least recently used** (LRU) item is thrown out to make room. Both `get` and `put` must be O(1). Two structures work together: a **hash map** finds an item by its key in O(1), and a **doubly linked list** keeps the items in the order of their last use (the most recent at one end). Moving a node to the front or removing the node at the back are O(1) pointer changes in a doubly linked list.',
        'Rules: `get key` returns the value (or -1 if absent) and makes the key the most recently used. `put key value` stores or updates the value and makes the key the most recently used; if the cache is full and the key is new, the least recently used key is removed first.',
        { code: 'get:  if key in cache: move to the most recent position; return value; else -1\nput:  if key in cache: update, move to the most recent position\n      else: if len(cache) == capacity: remove the oldest; insert as the most recent' },
        'Languages offer shortcuts for the pair "map plus order": in Python the built-in `dict` remembers the insertion order, so `pop` and insert again moves a key to the end, and `next(iter(d))` is the oldest key; Java\'s `LinkedHashMap` can do the same. In C++ the standard way is `list` plus `unordered_map` of iterators. Building the doubly linked list yourself is a very good exercise.'
      ]
    },
    statement: ['Implement an LRU cache with the capacity `cap`. Process `n` operations. Each line has an operation and two numbers: `get key 0` prints the value of the key, or -1 if the key is not in the cache, and makes the key the most recently used; `put key value` stores the value (updating it if the key exists) and makes the key the most recently used; if the cache is full and the key is new, the least recently used key is removed first. Print the answer of every `get`.'],
    inputFormat: ['The first line has `n` and `cap`.', 'Each of the next `n` lines has an operation and two numbers.'],
    outputFormat: ['One line for every `get` operation.'],
    constraints: ['1 <= n <= 20000', '1 <= cap <= 20000', '0 <= key, value <= 10^9', 'There is at least one `get` operation.'],
    examples: [{ input: '8 2\nput 1 1\nput 2 2\nget 1 0\nput 3 3\nget 2 0\nput 4 4\nget 1 0\nget 3 0\n', note: 'After get 1, key 2 is the least recently used and is removed by put 3: get 2 gives -1. Put 4 removes key 1: get 1 gives -1, get 3 gives 3.' }],
    hints: ['You need to find a key quickly and to know which key was used longest ago.', 'Keep the keys in order of use: the oldest first. On every use, move the key to the end.', 'When the cache is full and a new key comes, remove the oldest key.'],
    program: {
      io: ['n:int cap:int', 'ops:word[n][3]'],
      fast: true,
      includes: ['<list>', '<unordered_map>'],
      python: r`
        cache = {}
        out = []
        for op, k, v in ops:
            key = int(k)
            if op == "get":
                if key in cache:
                    value = cache.pop(key)
                    cache[key] = value
                    out.append(value)
                else:
                    out.append(-1)
            else:
                if key in cache:
                    cache.pop(key)
                elif len(cache) == cap:
                    del cache[next(iter(cache))]
                cache[key] = int(v)
        print("\n".join(map(str, out)))`,
      cpp: r`
        list<pair<long long, long long>> items;
        unordered_map<long long, list<pair<long long, long long>>::iterator> where;
        for (int i = 0; i < n; i++) {
            long long key = stoll(ops[i][1]);
            if (ops[i][0] == "get") {
                auto it = where.find(key);
                if (it == where.end()) {
                    cout << -1 << "\n";
                } else {
                    items.splice(items.end(), items, it->second);
                    cout << it->second->second << "\n";
                }
            } else {
                long long value = stoll(ops[i][2]);
                auto it = where.find(key);
                if (it != where.end()) {
                    it->second->second = value;
                    items.splice(items.end(), items, it->second);
                } else {
                    if ((long long) items.size() == cap) {
                        where.erase(items.front().first);
                        items.pop_front();
                    }
                    items.push_back({key, value});
                    where[key] = prev(items.end());
                }
            }
        }`,
      java: r`
        Map<Long, Long> cache = new LinkedHashMap<>();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            long key = Long.parseLong(ops[i][1]);
            if (ops[i][0].equals("get")) {
                Long value = cache.remove(key);
                if (value == null) {
                    sb.append(-1).append("\n");
                } else {
                    cache.put(key, value);
                    sb.append(value).append("\n");
                }
            } else {
                if (cache.containsKey(key)) {
                    cache.remove(key);
                } else if (cache.size() == cap) {
                    cache.remove(cache.keySet().iterator().next());
                }
                cache.put(key, Long.parseLong(ops[i][2]));
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['An ordered map keeps the keys from the least to the most recently used. Every use moves the key to the end; when the cache is full, the first key is removed.'], complexity: 'O(1) per operation on average, space O(cap).' },
    solve(input) { const rs = rows(input); const cap = nums(rs[0])[1]; const cache = new Map(); const out = []; for (const l of rs.slice(1)) { const [op, k, v] = l.split(' '); const key = Number(k); if (op === 'get') { if (cache.has(key)) { const val = cache.get(key); cache.delete(key); cache.set(key, val); out.push(val); } else out.push(-1); } else { if (cache.has(key)) cache.delete(key); else if (cache.size === cap) cache.delete(cache.keys().next().value); cache.set(key, Number(v)); } } return out.join('\n'); },
    tests() {
      const g = rng(604);
      const make = (n, cap, keys, pGet, hi) => { const ops = many(n, (i) => (i === n - 1 || g() < pGet ? `get ${randInt(g, 0, keys)} 0` : `put ${randInt(g, 0, keys)} ${randInt(g, 0, hi)}`)); return `${n} ${cap}\n${ops.join('\n')}\n`; };
      return ['8 2\nput 1 1\nput 2 2\nget 1 0\nput 3 3\nget 2 0\nput 4 4\nget 1 0\nget 3 0\n', '2 1\nput 5 6\nget 5 0\n', '4 1\nput 1 1\nput 2 2\nget 1 0\nget 2 0\n', make(20, 3, 6, 0.5, 9), make(300, 10, 30, 0.5, 1000), make(20000, 1000, 2000, 0.5, 1000000000), make(20000, 5, 10, 0.5, 1000000000), make(20000, 20000, 100000, 0.5, 1000000000), make(20000, 1, 3, 0.5, 100), make(20000, 100, 120, 0.7, 1000)];
    }
  },

  {
    slug: 'lfu-cache-operations',
    title: 'An LFU Cache',
    difficulty: 'hard',
    tags: ['design', 'hash-map', 'linked-list', 'cache'],
    concept: {
      title: 'Buckets of keys by frequency, each bucket ordered by recency',
      body: [
        'An **LFU** cache removes the **least frequently used** key when it is full; if several keys share the lowest frequency, the **least recently used** of them goes. Each `get` or `put` of a key counts as one use. All operations must be O(1).',
        'Keep three things: `value[key]`, `freq[key]`, and for every frequency `f` an **ordered set of keys** with that frequency, ordered by recency (the oldest first). Also keep `min_freq`, the lowest frequency that exists. To **touch** a key with frequency `f`: remove it from the bucket `f` (if the bucket becomes empty and `f == min_freq`, then `min_freq` becomes `f + 1`), and append it to the bucket `f + 1`. To **evict**, remove the first key of the bucket `min_freq`. A new key starts with frequency 1, so `min_freq` is 1 after inserting it.',
        { code: 'touch(key): f = freq[key]; del buckets[f][key]\n            if not buckets[f]: del buckets[f]; if min_freq == f: min_freq += 1\n            freq[key] = f + 1; buckets[f + 1][key] = None      # appended: most recent\nevict:      key = first key of buckets[min_freq]; remove it everywhere' },
        'Python dictionaries keep the insertion order, so a `dict` works as the ordered set. In Java use `LinkedHashSet`, in C++ a `list` with a map of iterators.'
      ]
    },
    statement: ['Implement an LFU cache with the capacity `cap`. Process `n` operations (each line has an operation and two numbers). `get key 0` prints the value of the key, or -1 if it is not in the cache; a successful `get` counts as a use of the key. `put key value` stores the value; if the key exists, its value is replaced and this counts as a use; if the key is new and the cache is full, the key with the smallest number of uses is removed first (among such keys the one that was used longest ago). A new key has one use. Print the answer of every `get`.'],
    inputFormat: ['The first line has `n` and `cap`.', 'Each of the next `n` lines has an operation and two numbers.'],
    outputFormat: ['One line for every `get` operation.'],
    constraints: ['1 <= n <= 20000', '1 <= cap <= 20000', '0 <= key, value <= 10^9', 'There is at least one `get` operation.'],
    examples: [{ input: '9 2\nput 1 1\nput 2 2\nget 1 0\nput 3 3\nget 2 0\nget 3 0\nput 4 4\nget 1 0\nget 3 0\n', note: 'Key 1 has two uses, key 2 has one: put 3 removes key 2, so get 2 gives -1. After get 3, keys 1 and 3 both have two uses; put 4 removes key 1, the one used longer ago: get 1 gives -1 and get 3 gives 3.' }],
    hints: ['Keep, for every frequency, the keys with this frequency in order of use.', 'Remember the smallest frequency in the cache.', 'When a key is used, move it from its frequency bucket to the next one; evict from the bucket of the smallest frequency, taking its oldest key.'],
    program: {
      io: ['n:int cap:int', 'ops:word[n][3]'],
      fast: true,
      includes: ['<list>', '<unordered_map>', '<map>'],
      python: r`
        vals = {}
        freq = {}
        buckets = {}
        minFreq = 0
        out = []
        for op, k, v in ops:
            key = int(k)
            if op == "get":
                if key not in vals:
                    out.append(-1)
                    continue
                out.append(vals[key])
                touch = True
            else:
                if key in vals:
                    vals[key] = int(v)
                    touch = True
                else:
                    touch = False
                    if len(vals) == cap:
                        evict = next(iter(buckets[minFreq]))
                        del buckets[minFreq][evict]
                        if not buckets[minFreq]:
                            del buckets[minFreq]
                        del vals[evict]
                        del freq[evict]
                    vals[key] = int(v)
                    freq[key] = 1
                    buckets.setdefault(1, {})[key] = None
                    minFreq = 1
            if touch:
                f = freq[key]
                del buckets[f][key]
                if not buckets[f]:
                    del buckets[f]
                    if minFreq == f:
                        minFreq = f + 1
                freq[key] = f + 1
                buckets.setdefault(f + 1, {})[key] = None
        print("\n".join(map(str, out)))`,
      cpp: r`
        unordered_map<long long, long long> vals;
        unordered_map<long long, long long> freq;
        unordered_map<long long, list<long long>> buckets;
        unordered_map<long long, list<long long>::iterator> where;
        long long minFreq = 0;
        auto touch = [&](long long key) {
            long long f = freq[key];
            buckets[f].erase(where[key]);
            if (buckets[f].empty()) {
                buckets.erase(f);
                if (minFreq == f) minFreq = f + 1;
            }
            freq[key] = f + 1;
            buckets[f + 1].push_back(key);
            where[key] = prev(buckets[f + 1].end());
        };
        for (int i = 0; i < n; i++) {
            long long key = stoll(ops[i][1]);
            if (ops[i][0] == "get") {
                if (!vals.count(key)) {
                    cout << -1 << "\n";
                } else {
                    cout << vals[key] << "\n";
                    touch(key);
                }
            } else {
                long long value = stoll(ops[i][2]);
                if (vals.count(key)) {
                    vals[key] = value;
                    touch(key);
                } else {
                    if ((long long) vals.size() == cap) {
                        long long evict = buckets[minFreq].front();
                        buckets[minFreq].pop_front();
                        if (buckets[minFreq].empty()) buckets.erase(minFreq);
                        vals.erase(evict);
                        freq.erase(evict);
                        where.erase(evict);
                    }
                    vals[key] = value;
                    freq[key] = 1;
                    buckets[1].push_back(key);
                    where[key] = prev(buckets[1].end());
                    minFreq = 1;
                }
            }
        }`,
      java: r`
        Map<Long, Long> vals = new HashMap<>();
        Map<Long, Integer> freq = new HashMap<>();
        Map<Integer, LinkedHashSet<Long>> buckets = new HashMap<>();
        int minFreq = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            long key = Long.parseLong(ops[i][1]);
            boolean touch;
            if (ops[i][0].equals("get")) {
                if (!vals.containsKey(key)) {
                    sb.append(-1).append("\n");
                    continue;
                }
                sb.append(vals.get(key)).append("\n");
                touch = true;
            } else if (vals.containsKey(key)) {
                vals.put(key, Long.parseLong(ops[i][2]));
                touch = true;
            } else {
                touch = false;
                if (vals.size() == cap) {
                    LinkedHashSet<Long> oldest = buckets.get(minFreq);
                    long evict = oldest.iterator().next();
                    oldest.remove(evict);
                    if (oldest.isEmpty()) buckets.remove(minFreq);
                    vals.remove(evict);
                    freq.remove(evict);
                }
                vals.put(key, Long.parseLong(ops[i][2]));
                freq.put(key, 1);
                buckets.computeIfAbsent(1, f -> new LinkedHashSet<>()).add(key);
                minFreq = 1;
            }
            if (touch) {
                int f = freq.get(key);
                buckets.get(f).remove(key);
                if (buckets.get(f).isEmpty()) {
                    buckets.remove(f);
                    if (minFreq == f) minFreq = f + 1;
                }
                freq.put(key, f + 1);
                buckets.computeIfAbsent(f + 1, x -> new LinkedHashSet<>()).add(key);
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Keys are grouped by frequency in ordered buckets. A use moves a key to the next bucket, and eviction takes the oldest key of the bucket with the smallest frequency.'], complexity: 'O(1) per operation on average, space O(cap).' },
    solve(input) { const rs = rows(input); const cap = nums(rs[0])[1]; const items = new Map(); let clock = 0; const out = []; for (const l of rs.slice(1)) { const [op, k, v] = l.split(' '); const key = Number(k); if (op === 'get') { if (items.has(key)) { const it = items.get(key); it.f++; it.t = ++clock; out.push(it.v); } else out.push(-1); } else if (items.has(key)) { const it = items.get(key); it.v = Number(v); it.f++; it.t = ++clock; } else { if (items.size === cap) { let worst = null; for (const [kk, it] of items) if (worst === null || it.f < worst[1].f || (it.f === worst[1].f && it.t < worst[1].t)) worst = [kk, it]; items.delete(worst[0]); } items.set(key, { v: Number(v), f: 1, t: ++clock }); } } return out.join('\n'); },
    tests() {
      const g = rng(605);
      const make = (n, cap, keys, pGet, hi) => { const ops = many(n, (i) => (i === n - 1 || g() < pGet ? `get ${randInt(g, 0, keys)} 0` : `put ${randInt(g, 0, keys)} ${randInt(g, 0, hi)}`)); return `${n} ${cap}\n${ops.join('\n')}\n`; };
      return ['9 2\nput 1 1\nput 2 2\nget 1 0\nput 3 3\nget 2 0\nget 3 0\nput 4 4\nget 1 0\nget 3 0\n', '2 1\nput 5 6\nget 5 0\n', make(20, 3, 6, 0.5, 9), make(300, 10, 30, 0.5, 1000), make(2000, 100, 150, 0.5, 1000000000), make(20000, 50, 80, 0.6, 1000000000), make(20000, 5, 10, 0.5, 1000000000), make(20000, 1, 3, 0.5, 100), make(20000, 20000, 100000, 0.5, 1000000000)];
    }
  },

  {
    slug: 'remove-zero-sum-consecutive-nodes',
    title: 'Remove Blocks That Add Up to Zero',
    difficulty: 'hard',
    tags: ['linked-list', 'prefix-sum', 'hash-map'],
    concept: {
      title: 'Prefix sums: equal sums mean a zero block in between',
      body: [
        'Repeatedly delete a block of consecutive nodes whose values add up to **zero**. Which blocks have sum zero? Let `P(x)` be the **prefix sum** up to and including node `x` (and 0 for a dummy node in front of the head). The nodes **after** `x` up to `y` have sum `P(y) - P(x)`, which is zero exactly when `P(x) = P(y)`. So two nodes with the **same prefix sum** enclose a zero block.',
        'The rule of this problem: always delete the zero-sum block that **starts leftmost**, and if several start there, the **longest** one; repeat until none is left. This is done in **two passes** with a hash map. Pass 1: walk the list (starting at the dummy) and store for every prefix sum the **last node** that has it. Pass 2: walk again; for each node with prefix sum `p`, set `node.next = last[p].next`, which skips everything up to the last node with the same sum.',
        { code: 'last = {}; prefix = 0; node = dummy\nwhile node: prefix += node.val; last[prefix] = node; node = node.next\nprefix = 0; node = dummy\nwhile node:\n    prefix += node.val\n    node.next = last[prefix].next        # skip the longest zero block that starts after node\n    node = node.next' },
        'In `1 2 -3 3 1`, the prefix sums are 0 (dummy), 1, 3, 0, 3, 4: the dummy and the node with sum 0 enclose `1 2 -3`, which is skipped; the result is `3 1`.'
      ]
    },
    statement: ['Repeat the following step until it is no longer possible: among all blocks of consecutive nodes whose values add up to 0, delete the one that starts leftmost (if several blocks start at the same node, the longest one). Print the remaining list, or `empty` if no node remains.'],
    inputFormat: [LIST_NOTE],
    outputFormat: ['Print the remaining values on one line, or `empty`.'],
    constraints: ['1 <= n <= 20000', '-1000 <= each value <= 1000'],
    examples: [{ input: '5\n1 2 -3 3 1\n', note: 'The block 1 2 -3 starts leftmost: the result is 3 1.' }],
    hints: ['Equal prefix sums mean that the nodes between them add up to zero.', 'In a first pass store the last node for every prefix sum, starting with a dummy node.', 'In a second pass link every node to the node after the last node that has the same prefix sum.'],
    program: listProgram({
      solution: {
        python: r`
          def remove_zero_sum(head):
              dummy = ListNode(0, head)
              last = {}
              prefix = 0
              node = dummy
              while node is not None:
                  prefix += node.val
                  last[prefix] = node
                  node = node.next
              prefix = 0
              node = dummy
              while node is not None:
                  prefix += node.val
                  node.next = last[prefix].next
                  node = node.next
              return dummy.next`,
        cpp: r`
          ListNode* removeZeroSum(ListNode* head) {
              ListNode dummy(0);
              dummy.next = head;
              unordered_map<long long, ListNode*> last;
              long long prefix = 0;
              for (ListNode* node = &dummy; node != nullptr; node = node->next) {
                  prefix += node->val;
                  last[prefix] = node;
              }
              prefix = 0;
              for (ListNode* node = &dummy; node != nullptr; node = node->next) {
                  prefix += node->val;
                  node->next = last[prefix]->next;
              }
              return dummy.next;
          }`,
        java: r`
          static ListNode removeZeroSum(ListNode head) {
              ListNode dummy = new ListNode(0);
              dummy.next = head;
              Map<Long, ListNode> last = new HashMap<>();
              long prefix = 0;
              for (ListNode node = dummy; node != null; node = node.next) {
                  prefix += node.val;
                  last.put(prefix, node);
              }
              prefix = 0;
              for (ListNode node = dummy; node != null; node = node.next) {
                  prefix += node.val;
                  node.next = last.get(prefix).next;
              }
              return dummy.next;
          }`
      },
      stub: {
        python: r`
          def remove_zero_sum(head):
              # Your code here
              return head`,
        cpp: r`
          ListNode* removeZeroSum(ListNode* head) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode removeZeroSum(ListNode head) {
              // Your code here
              return head;
          }`
      },
      includes: ['<unordered_map>'],
      call: call('remove_zero_sum', 'removeZeroSum')
    }),
    solution: { explanation: ['Two nodes with the same prefix sum enclose a zero block. Remembering the last node of every prefix sum and linking each node behind it removes the leftmost, longest zero blocks.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { return fastZero(nums(rows(input)[1])); },
    tests() {
      const g = rng(606);
      const make = (n, lo, hi) => arr(randArray(g, n, lo, hi));
      const brute = (input) => { let a = nums(rows(input)[1]); for (;;) { let found = false; for (let s = 0; s < a.length && !found; s++) { let sum = 0; let longest = -1; for (let e = s; e < a.length; e++) { sum += a[e]; if (sum === 0) longest = e; } if (longest >= 0) { a = [...a.slice(0, s), ...a.slice(longest + 1)]; found = true; } } if (!found) break; } return show(a); };
      crossCheck(() => make(randInt(g, 1, 12), -3, 3), (i) => this.solve(i), brute, 500);
      return ['5\n1 2 -3 3 1\n', '1\n0\n', '1\n5\n', '3\n1 2 3\n', '4\n1 -1 1 -1\n', '5\n1 2 3 -3 -2\n', make(20, -3, 3), make(300, -5, 5), make(20000, -1000, 1000), make(20000, 1, 1000), make(20000, -1, 1), make(20000, -3, 3)];
    }
  },

  {
    slug: 'reverse-even-length-groups',
    title: 'Reverse the Even-Length Groups',
    difficulty: 'hard',
    tags: ['linked-list', 'pointers', 'reversal'],
    concept: {
      title: 'Groups of growing size, and the last group may be short',
      body: [
        'Cut the list into groups: the first group has 1 node, the second 2 nodes, the third 3 nodes, and so on (group `g` has `g` nodes). The **last** group may have fewer nodes than its number, because the list ends. **Reverse every group whose real length is even**; groups with an odd length stay as they are.',
        'Use a dummy node and `prev`, the last node before the current group. For each group: count its **real** length `count` (walk at most `size` nodes without going past the end). If `count` is even, **reverse in place**: keep `cur = prev.next` fixed and `count - 1` times pull the node after `cur` to the front of the group (`prev.next`); afterwards `cur` is the last node of the group and becomes the new `prev`. If `count` is odd, just advance `prev` by `count` nodes. Then the next group has `size + 1` nodes.',
        { code: 'count = 0; node = prev\nwhile count < size and node.next: node = node.next; count += 1\nif count % 2 == 0:\n    cur = prev.next\n    for _ in range(count - 1):\n        nxt = cur.next; cur.next = nxt.next\n        nxt.next = prev.next; prev.next = nxt\n    prev = cur\nelse:\n    for _ in range(count): prev = prev.next' },
        'Counting the real length first is important: for the last group, its length decides whether to reverse, not its number.'
      ]
    },
    statement: ['The nodes of a singly linked list are split into consecutive groups: the 1st group has 1 node, the 2nd group has 2 nodes, the 3rd group has 3 nodes, and so on. The last group has fewer nodes than its number if the list ends earlier. Reverse each group that has an even number of nodes. Print the resulting list.'],
    inputFormat: [LIST_NOTE],
    outputFormat: ['Print the values of the new list on one line.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each value <= 10^9'],
    examples: [{ input: '8\n5 2 6 3 9 1 7 3\n', note: 'Groups: (5) (2 6) (3 9 1) (7 3). The groups of length 2 are reversed: 5 6 2 3 9 1 3 7.' }],
    hints: ['Use a dummy node and a reference to the node before the group.', 'Count how many nodes the group really has: at most its number, fewer at the end of the list.', 'Reverse the group in place if the count is even, otherwise skip it.'],
    program: listProgram({
      solution: {
        python: r`
          def reverse_even_groups(head):
              dummy = ListNode(0, head)
              prev = dummy
              size = 1
              while prev.next is not None:
                  count = 0
                  node = prev
                  while count < size and node.next is not None:
                      node = node.next
                      count += 1
                  if count % 2 == 0:
                      cur = prev.next
                      for _ in range(count - 1):
                          nxt = cur.next
                          cur.next = nxt.next
                          nxt.next = prev.next
                          prev.next = nxt
                      prev = cur
                  else:
                      for _ in range(count):
                          prev = prev.next
                  size += 1
              return dummy.next`,
        cpp: r`
          ListNode* reverseEvenGroups(ListNode* head) {
              ListNode dummy(0);
              dummy.next = head;
              ListNode* prev = &dummy;
              int size = 1;
              while (prev->next != nullptr) {
                  int count = 0;
                  ListNode* node = prev;
                  while (count < size && node->next != nullptr) {
                      node = node->next;
                      count++;
                  }
                  if (count % 2 == 0) {
                      ListNode* cur = prev->next;
                      for (int i = 0; i < count - 1; i++) {
                          ListNode* next = cur->next;
                          cur->next = next->next;
                          next->next = prev->next;
                          prev->next = next;
                      }
                      prev = cur;
                  } else {
                      for (int i = 0; i < count; i++) prev = prev->next;
                  }
                  size++;
              }
              return dummy.next;
          }`,
        java: r`
          static ListNode reverseEvenGroups(ListNode head) {
              ListNode dummy = new ListNode(0);
              dummy.next = head;
              ListNode prev = dummy;
              int size = 1;
              while (prev.next != null) {
                  int count = 0;
                  ListNode node = prev;
                  while (count < size && node.next != null) {
                      node = node.next;
                      count++;
                  }
                  if (count % 2 == 0) {
                      ListNode cur = prev.next;
                      for (int i = 0; i < count - 1; i++) {
                          ListNode next = cur.next;
                          cur.next = next.next;
                          next.next = prev.next;
                          prev.next = next;
                      }
                      prev = cur;
                  } else {
                      for (int i = 0; i < count; i++) prev = prev.next;
                  }
                  size++;
              }
              return dummy.next;
          }`
      },
      stub: {
        python: r`
          def reverse_even_groups(head):
              # Your code here
              return head`,
        cpp: r`
          ListNode* reverseEvenGroups(ListNode* head) {
              // Your code here
              return head;
          }`,
        java: r`
          static ListNode reverseEvenGroups(ListNode head) {
              // Your code here
              return head;
          }`
      },
      call: call('reverse_even_groups', 'reverseEvenGroups')
    }),
    solution: { explanation: ['Each group is measured first. A group with an even real length is reversed in place by pulling nodes to its front; an odd group is skipped. The group size grows by one each time.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); const out = []; let i = 0, size = 1; while (i < a.length) { const g = a.slice(i, i + size); out.push(...(g.length % 2 === 0 ? g.reverse() : g)); i += size; size++; } return show(out); },
    tests() { const g = rng(607); return ['8\n5 2 6 3 9 1 7 3\n', '1\n7\n', '2\n1 2\n', '3\n1 2 3\n', '6\n1 2 3 4 5 6\n', '10\n1 2 3 4 5 6 7 8 9 10\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 2000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(randArray(g, 19999, -1000000000, 1000000000)), arr(randArray(g, 19900, -1000000000, 1000000000))]; }
  }
];

function fastZero(a) { const n = a.length; const nodes = a.map((v) => ({ v })); const dummy = { v: 0 }; let cur = dummy; for (const nd of nodes) { cur.next = nd; cur = nd; } const last = new Map(); let p = 0; for (let x = dummy; x; x = x.next) { p += x.v; last.set(p, x); } p = 0; for (let x = dummy; x; x = x.next) { p += x.v; x.next = last.get(p).next; } const out = []; for (let x = dummy.next; x; x = x.next) out.push(x.v); return out.length ? out.join(' ') : 'empty'; }
