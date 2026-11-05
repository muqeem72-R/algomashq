import { r, rng, randInt, many, nums, rows, shuffle, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const wordsText = (list) => `${list.length}\n${list.join(' ')}\n`;

// words that share prefixes (small alphabets) and words that do not
const wordList = (g, n, minLen, maxLen, alphabet) => many(n, () => randWord(g, randInt(g, minLen, maxLen), alphabet));
// different words, none of them a prefix of another one (sort, then compare neighbours)
function prefixFree(g, n, minLen, maxLen, alphabet) {
  const pool = [...new Set(wordList(g, n * 3, minLen, maxLen, alphabet))].sort(); const keep = [];
  for (let i = 0; i < pool.length; i++) if (i + 1 === pool.length || !pool[i + 1].startsWith(pool[i])) keep.push(pool[i]);
  return shuffle(g, keep).slice(0, n);
}
// the parent array (1-based, 0 for the root) of a tree of one of several shapes, with the nodes numbered in random order
function parentTree(g, n, kind) {
  const parentOf = (i) => (i === 0 ? -1 : kind === 'chain' ? i - 1 : kind === 'star' ? 0 : kind === 'binary' ? (i - 1) >> 1 : kind === 'broom' ? (i < n / 2 ? i - 1 : Math.floor(n / 2) - 1) : kind === 'deep' ? Math.max(0, i - 1 - randInt(g, 0, 2)) : randInt(g, 0, i - 1));
  const label = shuffle(g, many(n, (i) => i + 1)); const par = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) par[label[i]] = i === 0 ? 0 : label[parentOf(i)];
  return par.slice(1);
}
const SHAPES = ['random', 'chain', 'star', 'binary', 'broom', 'deep'];

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n`.', 'The second line has the `n` words.', 'The third line has `q`.', 'The fourth line has the `q` prefixes.'],
    constraints: ['1 <= n, q <= 5000', 'Every word and every prefix has 1 to 20 lowercase letters.', 'The same word can appear several times.'],
    slug: 'autocomplete-counts',
    title: 'How Many Words Start With This?',
    tags: ['trie', 'string', 'design'],
    concept: {
      title: 'A trie that counts how many words pass through every node',
      body: [
        'A **trie** (prefix tree) stores words letter by letter: the root is the empty word, every node is a prefix, and a child is the prefix extended by one letter. Words with a common beginning share the nodes of that beginning, and a prefix is found by walking down from the root: O(length of the prefix), independent of the number of words.',
        'To answer **"how many words start with `p`?"**, store in every node a counter: the number of words that **pass through** the node. While inserting a word, add 1 to the counter of every node on its path. Then the answer for `p` is the counter of the node reached by walking `p`, or 0 if the walk falls off the trie.',
        { code: 'children = [{}]               # node -> {letter: node}\ncount = [0]                   # node -> number of words through it\nfor word in words:\n    node = 0\n    for ch in word:\n        if ch not in children[node]:\n            children[node][ch] = len(children)\n            children.append({})\n            count.append(0)\n        node = children[node][ch]\n        count[node] += 1' },
        'Compare with checking every word against every prefix: n * q comparisons of up to 20 letters. The trie needs only (total length of the words) steps to build and (length of the prefix) per question. Hash maps from a prefix to a count work too, but they store every prefix as a separate string; the trie shares the common parts.'
      ]
    },
    statement: ['`n` words (a word may appear more than once) and then `q` prefixes are given. For every prefix, print how many of the `n` words start with it (a word starts with itself; a repeated word is counted every time).'],
    outputFormat: ['`q` lines: for every prefix the number of words that start with it.'],
    examples: [{ input: '5\napple app apple apply banana\n4\napp appl b z\n', note: 'Four words start with app, three with appl, one with b, none with z.' }],
    hints: ['Build a trie and keep a counter in every node.', 'When inserting a word, add 1 to the counter of every node on the path.', 'To answer, walk the prefix; if you fall off the trie the answer is 0, otherwise it is the counter of the last node.'],
    program: {
      io: ['n:int', 'words:word[n]', 'q:int', 'prefixes:word[q]'],
      fast: true,
      python: r`
        children = [{}]
        count = [0]
        for w in words:
            node = 0
            for ch in w:
                nxt = children[node].get(ch)
                if nxt is None:
                    nxt = len(children)
                    children[node][ch] = nxt
                    children.append({})
                    count.append(0)
                node = nxt
                count[node] += 1
        out = []
        for p in prefixes:
            node = 0
            for ch in p:
                node = children[node].get(ch, -1)
                if node < 0:
                    break
            out.append(count[node] if node >= 0 else 0)
        print("\n".join(map(str, out)))`,
      cpp: r`
        vector<vector<int>> child(1, vector<int>(26, -1));
        vector<int> cnt(1, 0);
        for (const string& w : words) {
            int node = 0;
            for (char c : w) {
                int k = c - 'a';
                if (child[node][k] < 0) {
                    int fresh = (int)child.size();
                    child[node][k] = fresh;
                    child.push_back(vector<int>(26, -1));
                    cnt.push_back(0);
                }
                node = child[node][k];
                cnt[node]++;
            }
        }
        for (const string& p : prefixes) {
            int node = 0;
            for (char c : p) {
                node = child[node][c - 'a'];
                if (node < 0) break;
            }
            cout << (node < 0 ? 0 : cnt[node]) << "\n";
        }`,
      java: r`
        int total = 1;
        for (String w : words) total += w.length();
        int[][] child = new int[total][26];
        for (int[] row : child) Arrays.fill(row, -1);
        int[] cnt = new int[total];
        int size = 1;
        for (String w : words) {
            int node = 0;
            for (char c : w.toCharArray()) {
                int k = c - 'a';
                if (child[node][k] < 0) child[node][k] = size++;
                node = child[node][k];
                cnt[node]++;
            }
        }
        StringBuilder out = new StringBuilder();
        for (String p : prefixes) {
            int node = 0;
            for (char c : p.toCharArray()) {
                node = child[node][c - 'a'];
                if (node < 0) break;
            }
            out.append(node < 0 ? 0 : cnt[node]).append("\n");
        }
        System.out.print(out);`
    },
    solution: { explanation: ['A trie with a counter in every node: inserting a word increases the counters on its path, and a prefix is answered by the counter of the node at the end of its walk, or 0 if the walk leaves the trie.'], complexity: 'Time O(total length of words + total length of prefixes), space O(total length of words).' },
    solve(input) {
      const rs = rows(input); const words = rs[1].split(' '); const prefixes = rs[3].split(' '); const seen = new Map();
      for (const w of words) for (let i = 1; i <= w.length; i++) { const p = w.slice(0, i); seen.set(p, (seen.get(p) || 0) + 1); }
      return prefixes.map((p) => String(seen.get(p) || 0)).join('\n');
    },
    tests() {
      const g = rng(781); const out = ['5\napple app apple apply banana\n4\napp appl b z\n', '1\na\n2\na b\n'];
      const brute = (input) => { const rs = rows(input); const words = rs[1].split(' '); return rs[3].split(' ').map((p) => words.filter((w) => w.startsWith(p)).length).join('\n'); };
      const make = (n, q, minLen, maxLen, alphabet) => { const words = wordList(g, n, minLen, maxLen, alphabet); const prefixes = many(q, (i) => { const w = words[randInt(g, 0, n - 1)]; return i % 3 === 0 ? randWord(g, randInt(g, 1, maxLen), alphabet) : i % 3 === 1 ? w.slice(0, randInt(g, 1, w.length)) : w; }); return `${wordsText(words)}${wordsText(prefixes)}`; };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 12), 1, 5, 'ab'), (i) => this.solve(i), brute);
      for (const [n, q, lo, hi, al] of [[10, 10, 1, 5, 'ab'], [50, 40, 1, 8, 'abc'], [300, 300, 1, 10, 'abcd'], [2000, 2000, 1, 20, 'abcdefghijklmnopqrstuvwxyz'], [5000, 5000, 1, 20, 'ab'], [5000, 5000, 15, 20, 'abc'], [5000, 5000, 20, 20, 'abcdefghijklmnopqrstuvwxyz'], [5000, 5000, 1, 3, 'abcdefghijklmnopqrstuvwxyz']]) out.push(make(n, q, lo, hi, al));
      out.push(`5000\n${many(5000, () => 'a'.repeat(20)).join(' ')}\n3\na ${'a'.repeat(20)} ${'a'.repeat(19)}b\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`.', 'The second line has the `n` words.'],
    constraints: ['1 <= n <= 5000', 'Every word has 1 to 20 lowercase letters.', 'All words are different and no word is a prefix of another word.'],
    slug: 'shortest-unique-prefixes',
    title: 'The Shortest Prefix That Names a Word',
    tags: ['trie', 'string'],
    concept: {
      title: 'Walk down the trie until the counter drops to 1',
      body: [
        'A **unique prefix** of a word is a prefix that no other word has. The shortest unique prefix tells how many letters you must type before a name is no longer ambiguous (as in the abbreviations of commands in a shell: `ge` may be enough for `get`).',
        'In a trie where every node counts the **words that pass through it**, the answer is easy: walk down along the letters of the word; the first node whose counter is **1** means that only this word passes through it, so the letters up to that node are the shortest unique prefix. Because no word is a prefix of another, such a node exists on every word\'s path (at the latest at its last letter).',
        { code: 'for word in words:\n    node = 0\n    for i, ch in enumerate(word):\n        node = children[node][ch]\n        if count[node] == 1:               # only this word goes through here\n            print(word[:i + 1])\n            break' },
        'Building the trie costs the total length of the words, and each answer costs at most the length of its word. Comparing each word with all the others letter by letter would cost n * n * 20.'
      ]
    },
    statement: ['`n` different words are given, and no word is a prefix of another word. For every word, in the order of the input, print its shortest prefix that is not a prefix of any other word.'],
    outputFormat: ['`n` lines: the shortest unique prefix of every word, in the input order.'],
    examples: [{ input: '4\nzebra dog duck dove\n', note: 'zebra: z. dog: d and do are shared with other words, so dog. duck: du. dove: dov.' }],
    hints: ['Build a trie where every node counts the words through it.', 'Walk each word down the trie and stop at the first node with the counter 1.', 'The prefix is the part of the word up to that node.'],
    program: {
      io: ['n:int', 'words:word[n]'],
      fast: true,
      python: r`
        children = [{}]
        count = [0]
        for w in words:
            node = 0
            for ch in w:
                nxt = children[node].get(ch)
                if nxt is None:
                    nxt = len(children)
                    children[node][ch] = nxt
                    children.append({})
                    count.append(0)
                node = nxt
                count[node] += 1
        out = []
        for w in words:
            node = 0
            for i, ch in enumerate(w):
                node = children[node][ch]
                if count[node] == 1:
                    out.append(w[:i + 1])
                    break
        print("\n".join(out))`,
      cpp: r`
        vector<vector<int>> child(1, vector<int>(26, -1));
        vector<int> cnt(1, 0);
        for (const string& w : words) {
            int node = 0;
            for (char c : w) {
                int k = c - 'a';
                if (child[node][k] < 0) {
                    int fresh = (int)child.size();
                    child[node][k] = fresh;
                    child.push_back(vector<int>(26, -1));
                    cnt.push_back(0);
                }
                node = child[node][k];
                cnt[node]++;
            }
        }
        for (const string& w : words) {
            int node = 0;
            for (size_t i = 0; i < w.size(); i++) {
                node = child[node][w[i] - 'a'];
                if (cnt[node] == 1) {
                    cout << w.substr(0, i + 1) << "\n";
                    break;
                }
            }
        }`,
      java: r`
        int total = 1;
        for (String w : words) total += w.length();
        int[][] child = new int[total][26];
        for (int[] row : child) Arrays.fill(row, -1);
        int[] cnt = new int[total];
        int size = 1;
        for (String w : words) {
            int node = 0;
            for (char c : w.toCharArray()) {
                int k = c - 'a';
                if (child[node][k] < 0) child[node][k] = size++;
                node = child[node][k];
                cnt[node]++;
            }
        }
        StringBuilder out = new StringBuilder();
        for (String w : words) {
            int node = 0;
            for (int i = 0; i < w.length(); i++) {
                node = child[node][w.charAt(i) - 'a'];
                if (cnt[node] == 1) {
                    out.append(w, 0, i + 1).append("\n");
                    break;
                }
            }
        }
        System.out.print(out);`
    },
    solution: { explanation: ['A trie counts the words through every node. For each word the walk stops at the first node with the counter 1; the letters up to that node are the shortest unique prefix.'], complexity: 'Time O(total length), space O(total length).' },
    solve(input) {
      const words = rows(input)[1].split(' '); const seen = new Map();
      for (const w of words) for (let i = 1; i <= w.length; i++) { const p = w.slice(0, i); seen.set(p, (seen.get(p) || 0) + 1); }
      return words.map((w) => { for (let i = 1; i <= w.length; i++) if (seen.get(w.slice(0, i)) === 1) return w.slice(0, i); throw new Error('no unique prefix for ' + w); }).join('\n');
    },
    tests() {
      const g = rng(782); const out = ['4\nzebra dog duck dove\n', '1\na\n', '2\nab ba\n'];
      const brute = (input) => { const words = rows(input)[1].split(' '); return words.map((w) => { for (let i = 1; i <= w.length; i++) if (words.filter((x) => x.startsWith(w.slice(0, i))).length === 1) return w.slice(0, i); return '?'; }).join('\n'); };
      crossCheck(() => wordsText(prefixFree(g, randInt(g, 1, 8), 1, 6, 'ab')), (i) => this.solve(i), brute);
      for (const [n, lo, hi, al] of [[6, 1, 5, 'abc'], [30, 1, 8, 'abc'], [300, 1, 10, 'abcd'], [2000, 3, 20, 'abcdefghijklmnopqrstuvwxyz'], [5000, 6, 20, 'ab'], [5000, 12, 20, 'abc'], [5000, 4, 6, 'abcdefghijklmnopqrstuvwxyz']]) out.push(wordsText(prefixFree(g, n, lo, hi, al)));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `q`, the number of operations.', 'Each of the next `q` lines has an operation and a string: `add w` or `search p`.'],
    constraints: ['1 <= q <= 2000', 'Every word has 1 to 10 lowercase letters.', 'A pattern `p` has 1 to 10 characters, lowercase letters and at most two dots.', 'There is at least one `search`.'],
    slug: 'word-dictionary-with-dots',
    title: 'A Dictionary That Understands Dots',
    tags: ['trie', 'string', 'recursion', 'design'],
    concept: {
      title: 'A trie lookup that branches at every dot',
      body: [
        'A dictionary supports two operations: `add` a word and `search` a pattern. The pattern is a word in which a **dot** stands for **any one letter**, so `b.d` matches `bad`, `bid` and `bed`. A trie stores the words; a normal letter in the pattern follows one edge, but a dot has to **try every child** of the current node.',
        'That is a small recursion over the trie: `search(node, i)` asks whether the pattern from position `i` on can be matched starting at `node`. At the end of the pattern the node must be the end of a stored word.',
        { code: 'def search(node, pattern, i):\n    if i == len(pattern):\n        return ends[node]                  # a stored word must end exactly here\n    c = pattern[i]\n    if c == ".":\n        for nxt in children[node].values():\n            if search(nxt, pattern, i + 1):\n                return True\n        return False\n    nxt = children[node].get(c)\n    return nxt is not None and search(nxt, pattern, i + 1)' },
        'The recursion is at most 10 levels deep (the length of the pattern). With no dots a search is one walk. A dot multiplies the work by at most 26, so a pattern with two dots visits at most 26 * 26 short branches; that is why the number of dots is limited. A "match a letter" check against every stored word would cost O(number of words) per search.'
      ]
    },
    statement: ['Process `q` operations on an initially empty dictionary. `add w` stores the word `w`. `search p` asks whether some stored word matches the pattern `p`: the word must have the same length, and every character of `p` is either equal to the letter of the word or is a dot, which matches any letter. Print `yes` or `no` for every `search`.'],
    outputFormat: ['One line `yes` or `no` for every `search`, in order.'],
    examples: [{ input: '6\nadd bad\nadd dad\nsearch pad\nsearch .ad\nsearch b..\nsearch b.\n', note: 'pad: no; .ad matches bad: yes; b.. matches bad: yes; b. has the wrong length: no.' }],
    hints: ['Store the words in a trie with a mark at the end of each word.', 'A letter in the pattern follows one edge; a dot tries all the children.', 'At the end of the pattern, answer yes only if the node is marked as the end of a word.'],
    program: {
      io: ['q:int', 'ops:word[q][2]'],
      fast: true,
      helpers: {
        python: r`
          children = [{}]
          ends = [False]

          def add(word):
              node = 0
              for ch in word:
                  nxt = children[node].get(ch)
                  if nxt is None:
                      nxt = len(children)
                      children[node][ch] = nxt
                      children.append({})
                      ends.append(False)
                  node = nxt
              ends[node] = True

          def search(node, pattern, i):
              if i == len(pattern):
                  return ends[node]
              c = pattern[i]
              if c == ".":
                  for nxt in children[node].values():
                      if search(nxt, pattern, i + 1):
                          return True
                  return False
              nxt = children[node].get(c)
              return nxt is not None and search(nxt, pattern, i + 1)`,
        cpp: r`
          vector<vector<int>> child(1, vector<int>(26, -1));
          vector<char> isEnd(1, 0);

          void add(const string& word) {
              int node = 0;
              for (char c : word) {
                  int k = c - 'a';
                  if (child[node][k] < 0) {
                      int fresh = (int)child.size();
                      child[node][k] = fresh;
                      child.push_back(vector<int>(26, -1));
                      isEnd.push_back(0);
                  }
                  node = child[node][k];
              }
              isEnd[node] = 1;
          }

          bool search(int node, const string& pattern, size_t i) {
              if (i == pattern.size()) return isEnd[node] != 0;
              if (pattern[i] == '.') {
                  for (int k = 0; k < 26; k++) {
                      if (child[node][k] >= 0 && search(child[node][k], pattern, i + 1)) return true;
                  }
                  return false;
              }
              int next = child[node][pattern[i] - 'a'];
              return next >= 0 && search(next, pattern, i + 1);
          }`,
        java: r`
          static List<int[]> child = new ArrayList<>();
          static List<Boolean> ends = new ArrayList<>();

          static int newNode() {
              int[] row = new int[26];
              Arrays.fill(row, -1);
              child.add(row);
              ends.add(false);
              return child.size() - 1;
          }

          static void add(String word) {
              int node = 0;
              for (char c : word.toCharArray()) {
                  int k = c - 'a';
                  if (child.get(node)[k] < 0) {
                      int fresh = newNode();
                      child.get(node)[k] = fresh;
                  }
                  node = child.get(node)[k];
              }
              ends.set(node, true);
          }

          static boolean search(int node, String pattern, int i) {
              if (i == pattern.length()) return ends.get(node);
              if (pattern.charAt(i) == '.') {
                  for (int k = 0; k < 26; k++) {
                      int next = child.get(node)[k];
                      if (next >= 0 && search(next, pattern, i + 1)) return true;
                  }
                  return false;
              }
              int next = child.get(node)[pattern.charAt(i) - 'a'];
              return next >= 0 && search(next, pattern, i + 1);
          }`
      },
      python: r`
        out = []
        for op, text in ops:
            if op == "add":
                add(text)
            else:
                out.append("yes" if search(0, text, 0) else "no")
        print("\n".join(out))`,
      cpp: r`
        for (int i = 0; i < q; i++) {
            if (ops[i][0] == "add") add(ops[i][1]);
            else cout << (search(0, ops[i][1], 0) ? "yes" : "no") << "\n";
        }`,
      java: r`
        newNode();
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < q; i++) {
            if (ops[i][0].equals("add")) add(ops[i][1]);
            else out.append(search(0, ops[i][1], 0) ? "yes" : "no").append("\n");
        }
        System.out.print(out);`
    },
    solution: { explanation: ['The words are stored in a trie with an end mark. A search follows one edge for a letter and tries every child for a dot, and at the end of the pattern the node must carry an end mark.'], complexity: 'Time O(length) per add, up to O(26^2 * length) per search with two dots; space O(total length).' },
    solve(input) {
      const rs = rows(input); const q = Number(rs[0]); const words = []; const out = [];
      for (let i = 1; i <= q; i++) {
        const [op, text] = rs[i].split(' ');
        if (op === 'add') words.push(text);
        else out.push(words.some((w) => w.length === text.length && [...text].every((c, j) => c === '.' || c === w[j])) ? 'yes' : 'no');
      }
      return out.join('\n');
    },
    tests() {
      const g = rng(783); const out = ['6\nadd bad\nadd dad\nsearch pad\nsearch .ad\nsearch b..\nsearch b.\n', '2\nadd a\nsearch .\n', '2\nadd a\nsearch b\n'];
      const make = (q, minLen, maxLen, alphabet, addRate) => {
        const words = []; const lines = [];
        for (let i = 0; i < q; i++) {
          if (i < 2 || g() < addRate) { const w = randWord(g, randInt(g, minLen, maxLen), alphabet); words.push(w); lines.push(`add ${w}`); }
          else {
            const base = g() < 0.7 ? words[randInt(g, 0, words.length - 1)] : randWord(g, randInt(g, minLen, maxLen), alphabet); const chars = [...base];
            for (let d = randInt(g, 0, 2); d > 0; d--) chars[randInt(g, 0, chars.length - 1)] = '.';
            if (g() < 0.2) chars[randInt(g, 0, chars.length - 1)] = alphabet[randInt(g, 0, alphabet.length - 1)];
            lines.push(`search ${chars.join('')}`);
          }
        }
        if (!lines.some((l) => l.startsWith('search'))) lines[lines.length - 1] = 'search a';
        return `${lines.length}\n${lines.join('\n')}\n`;
      };
      for (const [q, lo, hi, al, rate] of [[10, 1, 4, 'ab', 0.5], [30, 1, 5, 'abc', 0.5], [200, 1, 8, 'abc', 0.5], [1000, 3, 6, 'abcdefghijklmnopqrstuvwxyz', 0.5], [2000, 1, 10, 'abcdefghijklmnopqrstuvwxyz', 0.5], [2000, 8, 10, 'abcdefghijklmnopqrstuvwxyz', 0.5], [2000, 10, 10, 'ab', 0.4], [2000, 4, 4, 'abcdefghijklmnopqrstuvwxyz', 0.5]]) out.push(make(q, lo, hi, al, rate));
      const dots = ['..', '.a.', 'a..', '..a'].map((p) => `search ${p}`); const wide = many(1000, () => `add ${randWord(g, 3, 'abcdefghijklmnopqrstuvwxyz')}`);
      out.push(`${wide.length + dots.length * 200}\n${wide.join('\n')}\n${many(800, (i) => dots[i % 4]).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `d`, the number of roots.', 'The second line has the `d` roots.', 'The third line has `m`, the number of words of the sentence.', 'The fourth line has the `m` words of the sentence.'],
    constraints: ['1 <= d <= 3000', '1 <= m <= 20000', 'Every root and every word has 1 to 20 lowercase letters.'],
    slug: 'replace-words-with-roots',
    title: 'Replace Words With Their Roots',
    tags: ['trie', 'string'],
    concept: {
      title: 'Stop at the first node that ends a root',
      body: [
        'A *root* is a short word from which longer words are derived (`help` is a root of `helpful`). A dictionary of roots and a sentence are given; every word of the sentence that **starts with a root** is replaced by that root, and if several roots fit, by the **shortest** one.',
        'Store the roots in a trie with an **end mark** on the node of every root. For a word of the sentence, walk down the trie along its letters: the **first** end mark that is met belongs to the shortest root that is a prefix of the word, so stop there. If the walk leaves the trie or the word ends before any mark, the word stays as it is.',
        { code: 'for word in sentence:\n    node, cut = 0, len(word)\n    for i, ch in enumerate(word):\n        node = children[node].get(ch, -1)\n        if node < 0:\n            break                  # no root starts like this\n        if ends[node]:\n            cut = i + 1            # the shortest root found\n            break\n    result.append(word[:cut])' },
        'Each word costs at most its own length, however many roots there are. Without a trie one would test every root against every word.'
      ]
    },
    statement: ['A dictionary of roots and a sentence (a list of words) are given. Replace every word of the sentence that starts with a root by the shortest root that is a prefix of it; words that do not start with any root stay unchanged. Print the new sentence with the words separated by single spaces.'],
    outputFormat: ['The new sentence on one line.'],
    examples: [{ input: '3\ncat bat rat\n7\nthe cattle was rattled by the battery\n', note: 'cattle becomes cat, rattled becomes rat, battery becomes bat; the other words stay: the cat was rat by the bat.' }],
    hints: ['Put the roots into a trie and mark the last node of every root.', 'Walk each word down the trie and stop at the first marked node.', 'If no marked node is met, keep the whole word.'],
    program: {
      io: ['d:int', 'roots:word[d]', 'm:int', 'words:word[m]'],
      fast: true,
      python: r`
        children = [{}]
        ends = [False]
        for root in roots:
            node = 0
            for ch in root:
                nxt = children[node].get(ch)
                if nxt is None:
                    nxt = len(children)
                    children[node][ch] = nxt
                    children.append({})
                    ends.append(False)
                node = nxt
            ends[node] = True
        result = []
        for word in words:
            node = 0
            cut = len(word)
            for i, ch in enumerate(word):
                node = children[node].get(ch, -1)
                if node < 0:
                    break
                if ends[node]:
                    cut = i + 1
                    break
            result.append(word[:cut])
        print(" ".join(result))`,
      cpp: r`
        vector<vector<int>> child(1, vector<int>(26, -1));
        vector<char> ends(1, 0);
        for (const string& root : roots) {
            int node = 0;
            for (char c : root) {
                int k = c - 'a';
                if (child[node][k] < 0) {
                    int fresh = (int)child.size();
                    child[node][k] = fresh;
                    child.push_back(vector<int>(26, -1));
                    ends.push_back(0);
                }
                node = child[node][k];
            }
            ends[node] = 1;
        }
        for (size_t w = 0; w < words.size(); w++) {
            const string& word = words[w];
            int node = 0;
            size_t cut = word.size();
            for (size_t i = 0; i < word.size(); i++) {
                node = child[node][word[i] - 'a'];
                if (node < 0) break;
                if (ends[node]) {
                    cut = i + 1;
                    break;
                }
            }
            cout << (w ? " " : "") << word.substr(0, cut);
        }
        cout << "\n";`,
      java: r`
        List<int[]> child = new ArrayList<>();
        List<Boolean> ends = new ArrayList<>();
        child.add(new int[26]);
        Arrays.fill(child.get(0), -1);
        ends.add(false);
        for (String root : roots) {
            int node = 0;
            for (char c : root.toCharArray()) {
                int k = c - 'a';
                if (child.get(node)[k] < 0) {
                    int[] row = new int[26];
                    Arrays.fill(row, -1);
                    child.add(row);
                    ends.add(false);
                    child.get(node)[k] = child.size() - 1;
                }
                node = child.get(node)[k];
            }
            ends.set(node, true);
        }
        StringBuilder out = new StringBuilder();
        for (int w = 0; w < words.length; w++) {
            String word = words[w];
            int node = 0;
            int cut = word.length();
            for (int i = 0; i < word.length(); i++) {
                node = child.get(node)[word.charAt(i) - 'a'];
                if (node < 0) break;
                if (ends.get(node)) {
                    cut = i + 1;
                    break;
                }
            }
            out.append(w > 0 ? " " : "").append(word, 0, cut);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['The roots are stored in a trie with end marks. Each word is walked down the trie and cut at the first end mark, which belongs to its shortest root.'], complexity: 'Time O(total length of roots and words), space O(total length of roots).' },
    solve(input) {
      const rs = rows(input); const roots = new Set(rs[1].split(' ')); const words = rs[3].split(' ');
      return words.map((w) => { for (let i = 1; i <= w.length; i++) if (roots.has(w.slice(0, i))) return w.slice(0, i); return w; }).join(' ');
    },
    tests() {
      const g = rng(784); const out = ['3\ncat bat rat\n7\nthe cattle was rattled by the battery\n', '1\na\n1\nb\n', '2\nab abc\n2\nabcd ab\n'];
      const make = (d, m, al, rootMax, wordMax) => { const roots = wordList(g, d, 1, rootMax, al); const words = many(m, (i) => (i % 2 ? randWord(g, randInt(g, 1, wordMax), al) : roots[randInt(g, 0, d - 1)] + randWord(g, randInt(g, 0, wordMax - 1), al))).map((w) => w.slice(0, 20)); return `${wordsText(roots)}${wordsText(words)}`; };
      for (const [d, m, al, rm, wm] of [[3, 6, 'ab', 3, 5], [10, 30, 'abc', 4, 8], [100, 300, 'abc', 6, 12], [1000, 5000, 'abcdefghijklmnopqrstuvwxyz', 6, 20], [3000, 20000, 'ab', 12, 20], [3000, 20000, 'abc', 20, 20], [50, 20000, 'abcdefghijklmnopqrstuvwxyz', 3, 20]]) out.push(make(d, m, al, rm, wm));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, the number of nodes (numbered 1 to n).', 'The second line has `n` numbers: for each node its parent, and 0 for the root.'],
    constraints: ['1 <= n <= 20000', 'The numbers describe one tree: exactly one node has the parent 0, and following parents always reaches it.', 'A parent can have a larger number than its child.', 'The tree can be a long path (depth up to n - 1).'],
    slug: 'depth-of-a-general-tree',
    title: 'The Depth of a Tree Given by Parents',
    tags: ['tree', 'bfs', 'iteration'],
    concept: {
      title: 'Turn parents into children lists, then go level by level',
      body: [
        'Not every tree has exactly two children per node. A **general tree** is often given as an array of **parents**: `parent[v]` is the parent of node `v`, and the root has no parent (here 0). This form is compact, but most questions are easier with the **children lists**, which one pass builds: for every node `v` with a parent `p`, add `v` to the list of `p`.',
        'The **depth** of the tree is the number of edges on the longest road from the root to a leaf. A level-by-level walk (*breadth-first search*) from the root finds it: the number of levels minus one.',
        { code: 'kids = [[] for _ in range(n + 1)]\nfor v in range(1, n + 1):\n    if parent[v] == 0:\n        root = v\n    else:\n        kids[parent[v]].append(v)\n\ndepth, level = 0, [root]\nwhile True:\n    next_level = [c for v in level for c in kids[v]]\n    if not next_level:\n        break\n    depth += 1\n    level = next_level' },
        'Why not recursion? The tree may be a path of 20000 nodes, and a recursive function that deep overflows the stack in Python (the default limit is about 1000 calls) and can overflow it in C++ and Java. A loop over levels uses no call stack at all. This is the rule for big trees: **when the depth can be as big as `n`, use an iterative walk**.'
      ]
    },
    statement: ['A tree has `n` nodes numbered 1 to `n`. For every node its parent is given (0 for the root). Print the depth of the tree: the number of edges on the longest road that starts at the root and goes down to a leaf (0 if the tree is a single node).'],
    outputFormat: ['Print the depth.'],
    examples: [{ input: '6\n0 1 1 2 2 3\n', note: 'The root is 1; the longest road is 1-2-4 (or 1-2-5, or 1-3-6): 2 edges.' }],
    hints: ['Build for every node the list of its children from the parent array.', 'Find the root: the node whose parent is 0.', 'Go level by level (a loop, not recursion) and count the levels.'],
    program: {
      io: ['n:int', 'par:int[n]'],
      fast: true,
      python: r`
        kids = [[] for _ in range(n + 1)]
        root = 0
        for v in range(1, n + 1):
            p = par[v - 1]
            if p == 0:
                root = v
            else:
                kids[p].append(v)
        depth = 0
        level = [root]
        while True:
            next_level = []
            for v in level:
                next_level.extend(kids[v])
            if not next_level:
                break
            depth += 1
            level = next_level
        print(depth)`,
      cpp: r`
        vector<vector<int>> kids(n + 1);
        int root = 0;
        for (int v = 1; v <= n; v++) {
            if (par[v - 1] == 0) root = v;
            else kids[par[v - 1]].push_back(v);
        }
        long long depth = 0;
        vector<int> level = {root};
        for (;;) {
            vector<int> next;
            for (int v : level) {
                for (int c : kids[v]) next.push_back(c);
            }
            if (next.empty()) break;
            depth++;
            level = next;
        }
        cout << depth << "\n";`,
      java: r`
        int count = (int) n;
        List<List<Integer>> kids = new ArrayList<>();
        for (int v = 0; v <= count; v++) kids.add(new ArrayList<>());
        int root = 0;
        for (int v = 1; v <= count; v++) {
            if (par[v - 1] == 0) root = v;
            else kids.get((int) par[v - 1]).add(v);
        }
        long depth = 0;
        List<Integer> level = new ArrayList<>();
        level.add(root);
        for (;;) {
            List<Integer> next = new ArrayList<>();
            for (int v : level) next.addAll(kids.get(v));
            if (next.isEmpty()) break;
            depth++;
            level = next;
        }
        System.out.println(depth);`
    },
    solution: { explanation: ['The parent array is turned into children lists, and a level-by-level walk from the root counts the levels; the depth is the number of levels minus one. No recursion is used, so a path of 20000 nodes is no problem.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const par = nums(rows(input)[1]); const n = par.length; const kids = Array.from({ length: n + 1 }, () => []); let root = 0;
      par.forEach((p, i) => { if (p === 0) root = i + 1; else kids[p].push(i + 1); });
      let depth = 0, level = [root]; for (;;) { const next = []; for (const v of level) next.push(...kids[v]); if (!next.length) break; depth++; level = next; }
      return String(depth);
    },
    tests() {
      const g = rng(785); const out = ['6\n0 1 1 2 2 3\n', '1\n0\n', '2\n2 0\n', '3\n0 1 2\n'];
      const brute = (input) => { const par = nums(rows(input)[1]); let best = 0; for (let v = 1; v <= par.length; v++) { let d = 0, c = v; while (par[c - 1] !== 0) { c = par[c - 1]; d++; } best = Math.max(best, d); } return String(best); };
      crossCheck(() => wordsText(parentTree(g, randInt(g, 1, 12), SHAPES[randInt(g, 0, SHAPES.length - 1)])), (i) => this.solve(i), brute);
      for (const kind of SHAPES) for (const n of [7, 100, 3000, 20000]) out.push(wordsText(parentTree(g, n, kind)));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, the number of nodes (numbered 1 to n).', 'The second line has `n` numbers: for each node its parent, and 0 for the root.'],
    constraints: ['1 <= n <= 20000', 'The numbers describe one tree: exactly one node has the parent 0, and following parents always reaches it.', 'A parent can have a larger number than its child.', 'The tree can be a long path (depth up to n - 1).'],
    slug: 'subtree-sizes-from-parents',
    title: 'The Size of Every Subtree',
    tags: ['tree', 'bfs', 'iteration', 'tree-dp'],
    concept: {
      title: 'Process the nodes in reverse level order: children are finished before their parents',
      body: [
        'The *subtree* of a node is the node together with everything below it. Its size is `1 + the sizes of the subtrees of its children`. A recursive function computes this directly, but a tree of 20000 nodes can be a path, and a recursion that deep is not safe. The same computation can be done **without recursion** by processing the nodes in the right order.',
        'List the nodes in **breadth-first order** (the root, then its children, then their children, and so on). In this list every node comes **after its parent**. So walking the list **backwards** meets every node **before its parent**: when a node is reached, all of its children have been handled and its size is final, and it can be added to the size of its parent.',
        { code: 'order = [root]\nfor v in order:                       # the list grows while we walk it\n    order.extend(kids[v])\n\nsize = [1] * (n + 1)\nfor v in reversed(order):\n    if parent[v] != 0:\n        size[parent[v]] += size[v]      # v is final, pass it up' },
        'This "BFS order, then backwards" pattern replaces a post-order recursion in many tree problems (heights, sums, counts, tree dynamic programming) and works for any depth.'
      ]
    },
    statement: ['A tree has `n` nodes numbered 1 to `n`. For every node its parent is given (0 for the root). For every node print the number of nodes in its subtree (the node itself and all nodes below it).'],
    outputFormat: ['One line with `n` numbers: the subtree size of the nodes 1, 2, ..., n.'],
    examples: [{ input: '6\n0 1 1 2 2 3\n', note: 'The root 1 has 6 nodes in its subtree, node 2 has 3 (2, 4, 5), node 3 has 2 (3, 6), the others 1: 6 3 2 1 1 1.' }],
    hints: ['Build the children lists and list the nodes in breadth-first order.', 'Every node comes after its parent in that list, so go through it backwards.', 'When you reach a node, its size is final: add it to the size of its parent.'],
    program: {
      io: ['n:int', 'par:int[n]'],
      fast: true,
      python: r`
        kids = [[] for _ in range(n + 1)]
        root = 0
        for v in range(1, n + 1):
            p = par[v - 1]
            if p == 0:
                root = v
            else:
                kids[p].append(v)
        order = [root]
        for v in order:
            order.extend(kids[v])
        size = [1] * (n + 1)
        for v in reversed(order):
            p = par[v - 1]
            if p != 0:
                size[p] += size[v]
        print(*size[1:])`,
      cpp: r`
        vector<vector<int>> kids(n + 1);
        int root = 0;
        for (int v = 1; v <= n; v++) {
            if (par[v - 1] == 0) root = v;
            else kids[par[v - 1]].push_back(v);
        }
        vector<int> order = {root};
        for (size_t i = 0; i < order.size(); i++) {
            for (int c : kids[order[i]]) order.push_back(c);
        }
        vector<long long> sizes(n + 1, 1);
        for (size_t i = order.size(); i-- > 0;) {
            int v = order[i];
            if (par[v - 1] != 0) sizes[par[v - 1]] += sizes[v];
        }
        for (int v = 1; v <= n; v++) cout << (v > 1 ? " " : "") << sizes[v];
        cout << "\n";`,
      java: r`
        int count = (int) n;
        List<List<Integer>> kids = new ArrayList<>();
        for (int v = 0; v <= count; v++) kids.add(new ArrayList<>());
        int root = 0;
        for (int v = 1; v <= count; v++) {
            if (par[v - 1] == 0) root = v;
            else kids.get((int) par[v - 1]).add(v);
        }
        List<Integer> order = new ArrayList<>();
        order.add(root);
        for (int i = 0; i < order.size(); i++) order.addAll(kids.get(order.get(i)));
        long[] size = new long[count + 1];
        Arrays.fill(size, 1);
        for (int i = order.size() - 1; i >= 0; i--) {
            int v = order.get(i);
            if (par[v - 1] != 0) size[(int) par[v - 1]] += size[v];
        }
        StringBuilder out = new StringBuilder();
        for (int v = 1; v <= count; v++) out.append(v > 1 ? " " : "").append(size[v]);
        System.out.println(out);`
    },
    solution: { explanation: ['The nodes are listed in breadth-first order and processed backwards, so every node is final before its parent; each node adds its size to its parent. No recursion is needed.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const par = nums(rows(input)[1]); const n = par.length; const kids = Array.from({ length: n + 1 }, () => []); let root = 0;
      par.forEach((p, i) => { if (p === 0) root = i + 1; else kids[p].push(i + 1); });
      const order = [root]; for (let i = 0; i < order.length; i++) order.push(...kids[order[i]]);
      const size = new Array(n + 1).fill(1); for (let i = order.length - 1; i >= 0; i--) { const p = par[order[i] - 1]; if (p) size[p] += size[order[i]]; }
      return size.slice(1).join(' ');
    },
    tests() {
      const g = rng(786); const out = ['6\n0 1 1 2 2 3\n', '1\n0\n', '2\n2 0\n', '3\n0 1 2\n'];
      const brute = (input) => { const par = nums(rows(input)[1]); const size = new Array(par.length + 1).fill(0); for (let v = 1; v <= par.length; v++) { let c = v; for (;;) { size[c]++; if (par[c - 1] === 0) break; c = par[c - 1]; } } return size.slice(1).join(' '); };
      crossCheck(() => wordsText(parentTree(g, randInt(g, 1, 12), SHAPES[randInt(g, 0, SHAPES.length - 1)])), (i) => this.solve(i), brute);
      for (const kind of SHAPES) for (const n of [7, 100, 3000, 20000]) out.push(wordsText(parentTree(g, n, kind)));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `m`, the number of edges.', 'Each of the next `m` lines has two numbers `u` and `v`: an edge between the nodes `u` and `v`.'],
    constraints: ['1 <= m <= 19999', 'The nodes are numbered 1 to m + 1, and the edges form a tree.', 'The tree can be a long path.'],
    slug: 'tree-diameter-from-edges',
    title: 'The Diameter of a Tree Given by Edges',
    tags: ['tree', 'bfs', 'graph'],
    concept: {
      title: 'Two breadth-first searches: from anywhere to the farthest node, then from there again',
      body: [
        'The **diameter** of a tree is the number of edges on the **longest road** between two nodes. For a tree given by its edges (an undirected graph without cycles) there is a neat method that needs only two searches.',
        '**Claim:** start a breadth-first search from **any** node and let `a` be the farthest node found; then the farthest node `b` from `a` is the other end of a longest road, and the distance between `a` and `b` is the diameter. Why: a longest road always ends in a "far" node as seen from any starting point, so the first search finds one of its ends; the second search measures from that end.',
        { code: 'def farthest(start):\n    dist = [-1] * (n + 1)\n    dist[start] = 0\n    queue = [start]\n    for v in queue:\n        for w in adj[v]:\n            if dist[w] < 0:\n                dist[w] = dist[v] + 1\n                queue.append(w)\n    last = queue[-1]               # BFS order: the last node is a farthest one\n    return last, dist[last]\n\na, _ = farthest(1)\nb, diameter = farthest(a)' },
        'Each search is O(n). The tree can be a path of 20000 nodes, so the searches are loops, not recursive calls. In a path, the diameter is `n - 1`.'
      ]
    },
    statement: ['A tree with `m + 1` nodes is given by its `m` edges. The diameter is the largest number of edges on a road between two nodes. Print the diameter.'],
    outputFormat: ['Print the diameter.'],
    examples: [{ input: '4\n1 2\n1 3\n3 4\n4 5\n', note: 'The longest road is 2-1-3-4-5 with 4 edges.' }],
    hints: ['Build the adjacency lists of the nodes.', 'Run a breadth-first search from node 1 and take the farthest node a.', 'Run a second search from a: the largest distance is the diameter.'],
    program: {
      io: ['m:int', 'edges:int[m][2]'],
      fast: true,
      python: r`
        n = m + 1
        adj = [[] for _ in range(n + 1)]
        for u, v in edges:
            adj[u].append(v)
            adj[v].append(u)

        def farthest(start):
            dist = [-1] * (n + 1)
            dist[start] = 0
            queue = [start]
            for v in queue:
                for w in adj[v]:
                    if dist[w] < 0:
                        dist[w] = dist[v] + 1
                        queue.append(w)
            last = queue[-1]
            return last, dist[last]

        a, _ = farthest(1)
        b, diameter = farthest(a)
        print(diameter)`,
      cpp: r`
        int count = (int)m + 1;
        vector<vector<int>> adj(count + 1);
        for (const vector<long long>& e : edges) {
            adj[e[0]].push_back((int)e[1]);
            adj[e[1]].push_back((int)e[0]);
        }
        auto farthest = [&](int start, long long& far) {
            vector<long long> dist(count + 1, -1);
            dist[start] = 0;
            vector<int> queue = {start};
            for (size_t i = 0; i < queue.size(); i++) {
                int v = queue[i];
                for (int w : adj[v]) {
                    if (dist[w] < 0) {
                        dist[w] = dist[v] + 1;
                        queue.push_back(w);
                    }
                }
            }
            far = dist[queue.back()];
            return queue.back();
        };
        long long ignored = 0, diameter = 0;
        int a = farthest(1, ignored);
        farthest(a, diameter);
        cout << diameter << "\n";`,
      java: r`
        int count = (int) m + 1;
        List<List<Integer>> adj = new ArrayList<>();
        for (int v = 0; v <= count; v++) adj.add(new ArrayList<>());
        for (long[] e : edges) {
            adj.get((int) e[0]).add((int) e[1]);
            adj.get((int) e[1]).add((int) e[0]);
        }
        int a = 1;
        long diameter = 0;
        for (int round = 0; round < 2; round++) {
            long[] dist = new long[count + 1];
            Arrays.fill(dist, -1);
            dist[a] = 0;
            List<Integer> queue = new ArrayList<>();
            queue.add(a);
            for (int i = 0; i < queue.size(); i++) {
                int v = queue.get(i);
                for (int w : adj.get(v)) {
                    if (dist[w] < 0) {
                        dist[w] = dist[v] + 1;
                        queue.add(w);
                    }
                }
            }
            a = queue.get(queue.size() - 1);
            diameter = dist[a];
        }
        System.out.println(diameter);`
    },
    solution: { explanation: ['A breadth-first search from any node finds a farthest node a; a second search from a finds the largest distance, which is the diameter of the tree.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const rs = rows(input); const m = Number(rs[0]); const n = m + 1; const adj = Array.from({ length: n + 1 }, () => []);
      for (let i = 1; i <= m; i++) { const [u, v] = nums(rs[i]); adj[u].push(v); adj[v].push(u); }
      const far = (s) => { const dist = new Array(n + 1).fill(-1); dist[s] = 0; const q = [s]; for (let h = 0; h < q.length; h++) for (const w of adj[q[h]]) if (dist[w] < 0) { dist[w] = dist[q[h]] + 1; q.push(w); } return [q[q.length - 1], dist[q[q.length - 1]]]; };
      return String(far(far(1)[0])[1]);
    },
    tests() {
      const g = rng(787); const out = ['4\n1 2\n1 3\n3 4\n4 5\n', '1\n1 2\n', '2\n2 1\n3 2\n'];
      const edgesOf = (n, kind) => { const par = parentTree(g, n, kind); const lines = []; for (let v = 1; v <= n; v++) if (par[v - 1]) lines.push(g() < 0.5 ? `${par[v - 1]} ${v}` : `${v} ${par[v - 1]}`); return `${lines.length}\n${shuffle(g, lines).join('\n')}\n`; };
      const brute = (input) => { const rs = rows(input); const m = Number(rs[0]); const n = m + 1; const adj = Array.from({ length: n + 1 }, () => []); for (let i = 1; i <= m; i++) { const [u, v] = nums(rs[i]); adj[u].push(v); adj[v].push(u); } let best = 0; for (let s = 1; s <= n; s++) { const dist = new Array(n + 1).fill(-1); dist[s] = 0; const q = [s]; for (let h = 0; h < q.length; h++) for (const w of adj[q[h]]) if (dist[w] < 0) { dist[w] = dist[q[h]] + 1; q.push(w); } best = Math.max(best, ...dist); } return String(best); };
      crossCheck(() => edgesOf(randInt(g, 2, 12), SHAPES[randInt(g, 0, SHAPES.length - 1)]), (i) => this.solve(i), brute);
      for (const kind of SHAPES) for (const n of [7, 100, 3000, 20000]) out.push(edgesOf(n, kind));
      return out;
    }
  }
];
