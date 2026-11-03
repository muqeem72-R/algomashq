// The 10-topic DSA roadmap (see ROADMAP.md). Every topic will have Easy, Medium and Hard problems.

export const TOPICS = [
  {
    id: 'basics',
    title: 'Basics',
    summary: 'The foundation every other topic builds on.',
    points: ['Time and space complexity (Big-O)', 'Recursion', 'Language syntax in C++, Java and Python']
  },
  {
    id: 'arrays-strings',
    title: 'Arrays and Strings',
    summary: 'The most common interview patterns live here.',
    points: ['Prefix sum', 'Two pointers', 'Sliding window', 'Sorting', 'Binary search']
  },
  {
    id: 'hashing',
    title: 'Hashing',
    summary: 'Trade a little memory for a lot of speed.',
    points: ['HashMap', 'HashSet', 'Frequency counting']
  },
  {
    id: 'linear',
    title: 'Linked List, Stack, Queue',
    summary: 'Sequential structures and the patterns built on them.',
    points: ['Linked list', 'Stack', 'Queue', 'Monotonic stack']
  },
  {
    id: 'backtracking',
    title: 'Recursion and Backtracking',
    summary: 'Explore every choice, then undo it.',
    points: ['Subsets', 'Permutations', 'N-Queens']
  },
  {
    id: 'trees',
    title: 'Trees',
    summary: 'Hierarchical data and everything that grows from it.',
    points: ['Binary tree and BST', 'Traversals', 'Heap and priority queue', 'Trie']
  },
  {
    id: 'graphs',
    title: 'Graphs',
    summary: 'Model networks, maps and dependencies.',
    points: ['BFS and DFS', 'Topological sort', 'Union-Find', 'Dijkstra', 'Minimum spanning tree']
  },
  {
    id: 'dp',
    title: 'Dynamic Programming',
    summary: 'Break a problem down and remember the answers.',
    points: ['1D and 2D DP', 'Knapsack', 'LIS', 'String DP']
  },
  {
    id: 'greedy-bits',
    title: 'Greedy, Bit Manipulation, Intervals',
    summary: 'Clever shortcuts for specific problem shapes.',
    points: ['Greedy choices', 'Bit tricks', 'Interval problems']
  },
  {
    id: 'advanced',
    title: 'Advanced',
    summary: 'For when the standard toolbox is not enough.',
    points: ['Segment tree', 'Fenwick tree', 'KMP']
  }
];

export const LANGUAGES = [
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python' }
];
