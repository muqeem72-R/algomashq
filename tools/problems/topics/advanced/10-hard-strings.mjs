import { r, rng, randInt, many, nums, rows, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const lines = (list) => list.map((p) => p.join(' ')).join('\n');
const dedent = (s) => { const ls = s.replace(/^\n/, '').split('\n'); const ind = Math.min(...ls.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)); return ls.map((l) => l.slice(ind)).join('\n'); };
const fib = (n) => { let a = 'a', b = 'ab'; while (b.length < n) [a, b] = [b, b + a]; return b.slice(0, n); };
const periodic = (g, n, period, alpha, noise) => { const block = randWord(g, period, alpha); let s = block.repeat(Math.ceil(n / period)).slice(0, n); if (noise) { const pos = randInt(g, 0, n - 1); s = s.slice(0, pos) + (s[pos] === 'a' ? 'b' : 'a') + s.slice(pos + 1); } return s; };
const zFn = (s) => { const n = s.length; const z = new Array(n).fill(0); z[0] = n; let l = 0, rr = 0; for (let i = 1; i < n; i++) { if (i < rr) z[i] = Math.min(rr - i, z[i - l]); while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++; if (i + z[i] > rr) { l = i; rr = i + z[i]; } } return z; };
const suffixArray = (s) => { const n = s.length; let rank = Array.from(s, (c) => c.charCodeAt(0)); const sa = Array.from({ length: n }, (_, i) => i); const m = n + 130; for (let k = 1; ; k *= 2) { const key = rank.map((v, i) => (v + 1) * m + (i + k < n ? rank[i + k] + 1 : 0)); sa.sort((a, b) => key[a] - key[b]); const nr = new Array(n).fill(0); for (let j = 1; j < n; j++) nr[sa[j]] = nr[sa[j - 1]] + (key[sa[j]] !== key[sa[j - 1]] ? 1 : 0); rank = nr; if (rank[sa[n - 1]] === n - 1) break; } return sa; };
const lcpArray = (s, sa) => { const n = s.length; const rk = new Array(n); for (let i = 0; i < n; i++) rk[sa[i]] = i; const lcp = new Array(n).fill(0); let h = 0; for (let i = 0; i < n; i++) { if (rk[i] > 0) { const j = sa[rk[i] - 1]; while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++; lcp[rk[i]] = h; if (h > 0) h--; } else h = 0; } return lcp; };
const distinctCount = (s) => { const sa = suffixArray(s); const lcp = lcpArray(s, sa); let c = 0; for (let i = 0; i < s.length; i++) c += s.length - sa[i] - lcp[i]; return c; };
const wordSet = (g, extra = []) => { const out = [...extra]; for (const [n, alpha] of [[30, 'ab'], [500, 'abc'], [30000, 'ab'], [30000, 'abcdefghijklmnopqrstuvwxyz'], [29999, 'a']]) out.push(randWord(g, n, alpha)); out.push(periodic(g, 30000, 7, 'ab', false), periodic(g, 30000, 12345, 'abc', true), fib(30000), 'a'.repeat(29999) + 'b', 'ab'.repeat(15000)); return out; };

const SUFFIX = {
  python: r`
    def suffix_array(s):
        n = len(s)
        m = n + 130
        rank = [ord(c) for c in s]
        sa = list(range(n))
        k = 1
        while True:
            key = [(rank[i] + 1) * m + (rank[i + k] + 1 if i + k < n else 0) for i in range(n)]
            sa.sort(key=key.__getitem__)
            new = [0] * n
            for j in range(1, n):
                new[sa[j]] = new[sa[j - 1]] + (1 if key[sa[j]] != key[sa[j - 1]] else 0)
            rank = new
            if rank[sa[n - 1]] == n - 1:
                break
            k *= 2
        return sa

    def lcp_array(s, sa):
        n = len(s)
        rk = [0] * n
        for i in range(n):
            rk[sa[i]] = i
        lcp = [0] * n
        h = 0
        for i in range(n):
            if rk[i] > 0:
                j = sa[rk[i] - 1]
                while i + h < n and j + h < n and s[i + h] == s[j + h]:
                    h += 1
                lcp[rk[i]] = h
                if h > 0:
                    h -= 1
            else:
                h = 0
        return lcp`,
  cpp: r`
    vector<int> suffixArray(const string& s) {
        int n = (int)s.size();
        long long m = n + 130;
        vector<long long> rk(n), key(n), nr(n);
        vector<int> sa(n);
        for (int i = 0; i < n; i++) {
            rk[i] = (unsigned char)s[i];
            sa[i] = i;
        }
        for (int k = 1;; k *= 2) {
            for (int i = 0; i < n; i++) key[i] = (rk[i] + 1) * m + (i + k < n ? rk[i + k] + 1 : 0);
            sort(sa.begin(), sa.end(), [&](int a, int b) { return key[a] < key[b]; });
            nr[sa[0]] = 0;
            for (int j = 1; j < n; j++) nr[sa[j]] = nr[sa[j - 1]] + (key[sa[j]] != key[sa[j - 1]] ? 1 : 0);
            rk = nr;
            if (rk[sa[n - 1]] == n - 1) break;
        }
        return sa;
    }

    vector<int> lcpArray(const string& s, const vector<int>& sa) {
        int n = (int)s.size();
        vector<int> rk(n), lcp(n, 0);
        for (int i = 0; i < n; i++) rk[sa[i]] = i;
        int h = 0;
        for (int i = 0; i < n; i++) {
            if (rk[i] > 0) {
                int j = sa[rk[i] - 1];
                while (i + h < n && j + h < n && s[i + h] == s[j + h]) h++;
                lcp[rk[i]] = h;
                if (h > 0) h--;
            } else {
                h = 0;
            }
        }
        return lcp;
    }`,
  java: r`
    static int[] suffixArray(String s) {
        int n = s.length();
        long m = n + 130;
        int[] rk = new int[n];
        int[] nr = new int[n];
        int[] sa = new int[n];
        long[] packed = new long[n];
        for (int i = 0; i < n; i++) rk[i] = s.charAt(i);
        for (int k = 1; ; k *= 2) {
            for (int i = 0; i < n; i++) {
                long key = (rk[i] + 1) * m + (i + k < n ? rk[i + k] + 1 : 0);
                packed[i] = (key << 15) | i;
            }
            Arrays.sort(packed);
            for (int j = 0; j < n; j++) sa[j] = (int) (packed[j] & 32767);
            nr[sa[0]] = 0;
            for (int j = 1; j < n; j++) nr[sa[j]] = nr[sa[j - 1]] + ((packed[j] >> 15) != (packed[j - 1] >> 15) ? 1 : 0);
            int[] t = rk;
            rk = nr;
            nr = t;
            if (rk[sa[n - 1]] == n - 1) break;
        }
        return sa;
    }

    static int[] lcpArray(String s, int[] sa) {
        int n = s.length();
        int[] rk = new int[n];
        int[] lcp = new int[n];
        for (int i = 0; i < n; i++) rk[sa[i]] = i;
        int h = 0;
        for (int i = 0; i < n; i++) {
            if (rk[i] > 0) {
                int j = sa[rk[i] - 1];
                while (i + h < n && j + h < n && s.charAt(i + h) == s.charAt(j + h)) h++;
                lcp[rk[i]] = h;
                if (h > 0) h--;
            } else {
                h = 0;
            }
        }
        return lcp;
    }`
};

const ZFUNC = {
  python: r`
    def z_function(s):
        n = len(s)
        z = [0] * n
        z[0] = n
        l = rr = 0
        for i in range(1, n):
            if i < rr:
                z[i] = min(rr - i, z[i - l])
            while i + z[i] < n and s[z[i]] == s[i + z[i]]:
                z[i] += 1
            if i + z[i] > rr:
                l, rr = i, i + z[i]
        return z`,
  cpp: r`
    vector<int> zFunction(const string& s) {
        int n = (int)s.size();
        vector<int> z(n, 0);
        z[0] = n;
        int l = 0, rr = 0;
        for (int i = 1; i < n; i++) {
            if (i < rr) z[i] = min(rr - i, z[i - l]);
            while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
            if (i + z[i] > rr) {
                l = i;
                rr = i + z[i];
            }
        }
        return z;
    }`,
  java: r`
    static int[] zFunction(String s) {
        int n = s.length();
        int[] z = new int[n];
        z[0] = n;
        int l = 0, rr = 0;
        for (int i = 1; i < n; i++) {
            if (i < rr) z[i] = Math.min(rr - i, z[i - l]);
            while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) z[i]++;
            if (i + z[i] > rr) {
                l = i;
                rr = i + z[i];
            }
        }
        return z;
    }`
};

export default [
  {
    ...hard,
    inputFormat: ['The first line has the word `s`.', 'The second line has the number `k`.'],
    constraints: ['1 <= |s| <= 30000', '`s` has lowercase letters only.', '1 <= k <= the number of different substrings of `s`'],
    slug: 'kth-different-substring',
    title: 'The k-th Different Substring in Dictionary Order',
    tags: ['suffix-array', 'lcp', 'strings', 'counting'],
    concept: {
      title: 'Sort all suffixes; the new substrings that each suffix brings are its prefixes longer than the common part with the previous suffix',
      body: [
        'List **every different substring** of a word in dictionary order and take the `k`-th. For `abab` the different substrings in order are `a, ab, aba, abab, b, ba, bab`, and the 5th is `b`. A word of length 30000 has up to 450 million substrings, so we cannot even list them.',
        'Every substring is a prefix of some suffix. Sort the **suffixes** (the *suffix array* `sa`) and compute the **longest common prefix** of every suffix with the one before it in that order (the *LCP array* `lcp`). Walking through the sorted suffixes, the suffix number `i` contributes exactly the prefixes whose length is **more than `lcp[i]`**: the shorter ones were already produced by an earlier suffix. That is `n - sa[i] - lcp[i]` new substrings, and they come out in dictionary order, shorter first. So the walk subtracts these counts from `k` until `k` fits inside one suffix.',
        { code: 'sa = suffix_array(s); lcp = lcp_array(s, sa)\nfor i in range(n):\n    cnt = n - sa[i] - lcp[i]                   # new substrings of this suffix\n    if k <= cnt:\n        print(s[sa[i] : sa[i] + lcp[i] + k])   # its prefix of length lcp[i] + k\n        break\n    k -= cnt' },
        'The suffix array is built by **doubling**: sort the suffixes by their first 1 letter, then by the first 2 (using the ranks of the 1-letter parts as the key), then 4, 8, and so on; after about log n rounds all suffixes are ordered. The LCP array comes from Kasai\'s algorithm in linear time, using the fact that `lcp` of the suffix at `i + 1` is at least `lcp` of the suffix at `i` minus one. The whole solution is O(n log^2 n) with a plain sort in each round.'
      ]
    },
    statement: ['A word `s` and a number `k` are given. Consider all **different** substrings of `s` (a text that occurs several times is counted once) and sort them in dictionary order, where a word comes before every longer word that starts with it. Print the `k`-th substring of this list.'],
    outputFormat: ['Print the `k`-th different substring.'],
    examples: [{ input: 'abab\n5\n', note: 'The different substrings in dictionary order are a, ab, aba, abab, b, ba and bab. The 5th is b.' }],
    hints: ['Every substring is a prefix of one of the suffixes.', 'After sorting the suffixes, suffix number i brings n - sa[i] - lcp[i] new substrings: the prefixes longer than its common part with the previous suffix.', 'Subtract these counts from k until k falls inside a suffix; the answer is a prefix of that suffix.'],
    program: {
      io: ['s:word', 'k:int'],
      fast: true,
      helpers: SUFFIX,
      python: r`
        n = len(s)
        sa = suffix_array(s)
        lcp = lcp_array(s, sa)
        for i in range(n):
            cnt = n - sa[i] - lcp[i]
            if k <= cnt:
                print(s[sa[i]:sa[i] + lcp[i] + k])
                break
            k -= cnt`,
      cpp: r`
        long long n = s.size();
        vector<int> sa = suffixArray(s);
        vector<int> lcp = lcpArray(s, sa);
        for (long long i = 0; i < n; i++) {
            long long cnt = n - sa[i] - lcp[i];
            if (k <= cnt) {
                cout << s.substr(sa[i], lcp[i] + k) << "\n";
                break;
            }
            k -= cnt;
        }`,
      java: r`
        int len = s.length();
        int[] sa = suffixArray(s);
        int[] lcp = lcpArray(s, sa);
        for (int i = 0; i < len; i++) {
            long cnt = len - sa[i] - lcp[i];
            if (k <= cnt) {
                System.out.println(s.substring(sa[i], sa[i] + lcp[i] + (int) k));
                break;
            }
            k -= cnt;
        }`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The suffixes are sorted by doubling and the LCP array is built by Kasai. The suffix number i adds n - sa[i] - lcp[i] new substrings in dictionary order, so the walk subtracts these counts from k and cuts the answer out of the suffix where k fits.'], complexity: 'Time O(n log^2 n), space O(n).' },
    solve(input) {
      const [s, kk] = rows(input); let k = Number(kk); const n = s.length; const sa = suffixArray(s); const lcp = lcpArray(s, sa);
      for (let i = 0; i < n; i++) { const cnt = n - sa[i] - lcp[i]; if (k <= cnt) return s.slice(sa[i], sa[i] + lcp[i] + k); k -= cnt; } return '';
    },
    tests() {
      const g = rng(5001); const out = ['abab\n5\n', 'a\n1\n', 'aaaa\n3\n'];
      const brute = (input) => { const [s, kk] = rows(input); const set = new Set(); for (let i = 0; i < s.length; i++) for (let j = i + 1; j <= s.length; j++) set.add(s.slice(i, j)); return [...set].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))[Number(kk) - 1]; };
      const make = (s, mode) => { const total = distinctCount(s); const k = mode === 'first' ? 1 : mode === 'last' ? total : mode === 'middle' ? Math.ceil(total / 2) : randInt(g, 1, total); return `${s}\n${k}\n`; };
      crossCheck(() => make(randWord(g, randInt(g, 1, 9), 'ab'), 'random'), (i) => this.solve(i), brute, 800);
      crossCheck(() => make(randWord(g, randInt(g, 1, 9), 'abc'), 'random'), (i) => this.solve(i), brute, 300);
      const words = wordSet(g); const modes = ['random', 'last', 'middle', 'first', 'random', 'random', 'last', 'random', 'middle', 'random'];
      words.forEach((s, i) => out.push(make(s, modes[i % modes.length])));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `m`: the number of keywords.', 'Each of the next `m` lines has one keyword.', 'The last line has the text.'],
    constraints: ['1 <= m <= 5000', 'The total length of the keywords is at most 30000, and every keyword is not empty.', '1 <= |text| <= 100000', 'All words have lowercase letters only.'],
    slug: 'count-keyword-occurrences-in-a-text',
    title: 'Count All Keyword Occurrences in a Text',
    tags: ['aho-corasick', 'trie', 'automaton', 'strings'],
    concept: {
      title: 'Aho-Corasick: a trie of the keywords with "failure" links, so the text is read letter by letter with no step back',
      body: [
        'Given many keywords and a text, count how many times keywords occur in the text, with overlaps and with every keyword counted separately. For the keywords `he, she, his, hers` and the text `ushers`, the occurrences are `she` (at 2 to 4), `he` (at 3 to 4) and `hers` (at 3 to 6): 3. Searching every keyword separately costs the total length of the text times the number of keywords.',
        'Put the keywords in a **trie**. A state is a trie node, which stands for the longest suffix of the text read so far that is a prefix of some keyword. Reading the next letter `c` moves along the edge `c` if there is one. If not, we must fall back to the longest proper suffix of the current state that is still in the trie: the **failure link** of the node. Computing the links in breadth-first order lets us fill in all the missing edges at once, so that the transition table `nxt[state][c]` is complete (`nxt[u][c] = nxt[fail[u]][c]` if the edge is missing): the text is then read in one step per letter.',
        { code: 'for u in bfs order (parents before children):\n    cnt[u] += cnt[fail[u]]                         # keywords that end here as suffixes\n    for c in range(26):\n        v = nxt[u][c]\n        if v == -1: nxt[u][c] = nxt[fail[u]][c]    # the missing edge follows the failure link\n        else:       fail[v] = nxt[fail[u]][c]; queue.append(v)' },
        'A state may complete several keywords at the same time (a keyword can be a suffix of another one), so `cnt[u]` is the number of keywords that end at `u` **plus** the count of the failure link, which is the number of keywords that are suffixes of the text read so far. The answer is the sum of `cnt[state]` over all positions of the text. Time O(total length * 26 + |text|), and the answer can be large (a text of `a`s with many keywords), so use 64-bit integers.'
      ]
    },
    statement: ['`m` keywords and a text are given. Count the pairs (keyword, position) such that the keyword occurs in the text ending at that position. Occurrences may overlap, and if the same keyword is given several times in the list, every copy counts. Print the count.'],
    outputFormat: ['Print one number: the number of occurrences.'],
    examples: [{ input: '4\nhe\nshe\nhis\nhers\nushers\n', note: 'In the text ushers the keywords occur as she (letters 2 to 4), he (letters 3 to 4) and hers (letters 3 to 6): 3.' }],
    hints: ['Put the keywords in a trie.', 'Add a failure link to every node (the longest proper suffix that is also in the trie) in breadth-first order, and complete the missing edges with them.', 'Let cnt[u] include the keywords that end at the failure link of u, and add cnt[state] after every letter of the text.'],
    program: {
      io: ['m:int', 'words:rows[m]', 't:word'],
      fast: true,
      python: r`
        nxt = [[-1] * 26]
        fail = [0]
        cnt = [0]
        for w in words:
            node = 0
            for ch in w:
                c = ord(ch) - 97
                if nxt[node][c] == -1:
                    nxt[node][c] = len(nxt)
                    nxt.append([-1] * 26)
                    fail.append(0)
                    cnt.append(0)
                node = nxt[node][c]
            cnt[node] += 1
        queue = []
        for c in range(26):
            v = nxt[0][c]
            if v == -1:
                nxt[0][c] = 0
            else:
                queue.append(v)
        head = 0
        while head < len(queue):
            u = queue[head]
            head += 1
            cnt[u] += cnt[fail[u]]
            for c in range(26):
                v = nxt[u][c]
                if v == -1:
                    nxt[u][c] = nxt[fail[u]][c]
                else:
                    fail[v] = nxt[fail[u]][c]
                    queue.append(v)
        total = 0
        state = 0
        for ch in t:
            state = nxt[state][ord(ch) - 97]
            total += cnt[state]
        print(total)`,
      cpp: r`
        vector<array<int, 26>> nxt(1);
        nxt[0].fill(-1);
        vector<int> fail(1, 0);
        vector<long long> cnt(1, 0);
        for (long long wi = 0; wi < m; wi++) {
            int node = 0;
            for (char ch : words[wi]) {
                int c = ch - 'a';
                if (nxt[node][c] == -1) {
                    nxt[node][c] = (int)nxt.size();
                    array<int, 26> blank;
                    blank.fill(-1);
                    nxt.push_back(blank);
                    fail.push_back(0);
                    cnt.push_back(0);
                }
                node = nxt[node][c];
            }
            cnt[node]++;
        }
        vector<int> queue;
        for (int c = 0; c < 26; c++) {
            int v = nxt[0][c];
            if (v == -1) nxt[0][c] = 0;
            else queue.push_back(v);
        }
        for (size_t head = 0; head < queue.size(); head++) {
            int u = queue[head];
            cnt[u] += cnt[fail[u]];
            for (int c = 0; c < 26; c++) {
                int v = nxt[u][c];
                if (v == -1) {
                    nxt[u][c] = nxt[fail[u]][c];
                } else {
                    fail[v] = nxt[fail[u]][c];
                    queue.push_back(v);
                }
            }
        }
        long long total = 0;
        int state = 0;
        for (char ch : t) {
            state = nxt[state][ch - 'a'];
            total += cnt[state];
        }
        cout << total << "\n";`,
      java: r`
        int cap = 1;
        for (int wi = 0; wi < m; wi++) cap += words[wi].length();
        int[][] nxt = new int[cap][26];
        for (int[] row : nxt) Arrays.fill(row, -1);
        int[] fail = new int[cap];
        long[] cnt = new long[cap];
        int size = 1;
        for (int wi = 0; wi < m; wi++) {
            int node = 0;
            for (int p = 0; p < words[wi].length(); p++) {
                int c = words[wi].charAt(p) - 'a';
                if (nxt[node][c] == -1) nxt[node][c] = size++;
                node = nxt[node][c];
            }
            cnt[node]++;
        }
        int[] queue = new int[size];
        int tail = 0;
        for (int c = 0; c < 26; c++) {
            int v = nxt[0][c];
            if (v == -1) nxt[0][c] = 0;
            else queue[tail++] = v;
        }
        for (int head = 0; head < tail; head++) {
            int u = queue[head];
            cnt[u] += cnt[fail[u]];
            for (int c = 0; c < 26; c++) {
                int v = nxt[u][c];
                if (v == -1) {
                    nxt[u][c] = nxt[fail[u]][c];
                } else {
                    fail[v] = nxt[fail[u]][c];
                    queue[tail++] = v;
                }
            }
        }
        long total = 0;
        int state = 0;
        for (int p = 0; p < t.length(); p++) {
            state = nxt[state][t.charAt(p) - 'a'];
            total += cnt[state];
        }
        System.out.println(total);`,
      includes: ['<array>']
    },
    solution: { explanation: ['The keywords form a trie. Failure links are computed in breadth-first order, and they also fill in the missing edges, so the text is read with one transition per letter. cnt[u] adds the keywords that end at the failure link, and the answer is the sum of cnt over the visited states.'], complexity: 'Time O(26 L + |text|) where L is the total length of the keywords, space O(26 L).' },
    solve(input) {
      const rs = rows(input); const m = Number(rs[0]); const words = rs.slice(1, 1 + m); const t = rs[1 + m];
      const nxt = [new Array(26).fill(-1)], fail = [0], cnt = [0]; for (const w of words) { let node = 0; for (const ch of w) { const c = ch.charCodeAt(0) - 97; if (nxt[node][c] === -1) { nxt[node][c] = nxt.length; nxt.push(new Array(26).fill(-1)); fail.push(0); cnt.push(0); } node = nxt[node][c]; } cnt[node]++; }
      const queue = []; for (let c = 0; c < 26; c++) { const v = nxt[0][c]; if (v === -1) nxt[0][c] = 0; else queue.push(v); }
      for (let head = 0; head < queue.length; head++) { const u = queue[head]; cnt[u] += cnt[fail[u]]; for (let c = 0; c < 26; c++) { const v = nxt[u][c]; if (v === -1) nxt[u][c] = nxt[fail[u]][c]; else { fail[v] = nxt[fail[u]][c]; queue.push(v); } } }
      let total = 0, state = 0; for (const ch of t) { state = nxt[state][ch.charCodeAt(0) - 97]; total += cnt[state]; } return total;
    },
    tests() {
      const g = rng(5002); const out = ['4\nhe\nshe\nhis\nhers\nushers\n', '1\na\naaaa\n', '2\nab\nab\nabab\n'];
      const brute = (input) => { const rs = rows(input); const m = Number(rs[0]); const words = rs.slice(1, 1 + m); const t = rs[1 + m]; let c = 0; for (const w of words) for (let i = 0; i + w.length <= t.length; i++) if (t.startsWith(w, i)) c++; return c; };
      const make = (m, totalLen, alpha, tLen, fromText) => { const t = randWord(g, tLen, alpha); const words = []; let used = 0; for (let i = 0; i < m; i++) { const left = totalLen - used - (m - i - 1); const len = Math.max(1, Math.min(left, randInt(g, 1, Math.max(1, Math.floor((2 * totalLen) / m))))); let w; if (fromText && g() < 0.7 && len <= t.length) { const p = randInt(g, 0, t.length - len); w = t.slice(p, p + len); } else w = randWord(g, len, alpha); words.push(w); used += len; } return `${m}\n${words.join('\n')}\n${t}\n`; };
      crossCheck(() => make(randInt(g, 1, 5), 30, 'ab', randInt(g, 1, 20), true), (i) => this.solve(i), brute, 800);
      crossCheck(() => make(randInt(g, 1, 6), 40, 'abc', randInt(g, 1, 25), false), (i) => this.solve(i), brute, 300);
      for (const [m, tl, alpha, n, ft] of [[5, 30, 'ab', 100, true], [50, 300, 'abc', 1000, true], [2000, 20000, 'abcdefghijklmnopqrstuvwxyz', 100000, true], [5000, 30000, 'ab', 100000, true], [3000, 29000, 'abcd', 100000, false], [100, 5050, 'a', 100000, false]]) out.push(make(m, tl, alpha, n, ft));
      out.push(`1000\n${many(1000, (i) => 'a'.repeat(1 + (i % 30))).join('\n')}\n${'a'.repeat(100000)}\n`);
      out.push(`26\n${many(26, (i) => String.fromCharCode(97 + i)).join('\n')}\n${randWord(g, 100000, 'abcdefghijklmnopqrstuvwxyz')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `a`, `len` and `m`: the number of letters in the alphabet, the length of the words to count, and the number of forbidden words.', 'Each of the next `m` lines has one forbidden word.'],
    constraints: ['1 <= a <= 26, 1 <= len <= 1000, 1 <= m <= 20', 'The forbidden words are not empty, use only the first `a` letters, and have the total length at most 60.'],
    slug: 'count-words-that-avoid-all-keywords',
    title: 'How Many Words of a Given Length Contain No Forbidden Word?',
    tags: ['aho-corasick', 'dp', 'automaton', 'counting', 'modular-arithmetic'],
    concept: {
      title: 'Count walks of a given length in the Aho-Corasick automaton that never enter a state where a forbidden word has just ended',
      body: [
        'How many words of length `len` over the first `a` letters contain **none of the forbidden words** as a substring, modulo `1000000007`? With the alphabet `{a, b}`, length 3 and the forbidden word `ab`, the good words are `aaa, baa, bba, bbb`: 4. There are `a^len` words in all, so listing them is impossible.',
        'Build the **Aho-Corasick automaton** of the forbidden words (a trie with failure links and complete transitions). Reading a word letter by letter moves between the states, and the state always represents the longest suffix read so far that is a prefix of a forbidden word. A forbidden word appears somewhere in the text exactly when the walk visits a **bad state**: a state where a word ends, or whose failure link is bad (a forbidden word is a suffix of the current text). Counting words becomes counting walks that avoid bad states.',
        { code: 'dp = [0] * states; dp[0] = 1\nfor step in range(len):\n    new = [0] * states\n    for u in range(states):\n        if dp[u] == 0: continue\n        for c in range(a):\n            v = nxt[u][c]\n            if not bad[v]:\n                new[v] = (new[v] + dp[u]) % MOD\n    dp = new\nanswer = sum(dp) % MOD' },
        'The mark `bad[u]` is computed together with the failure links: `bad[u] = terminal[u] or bad[fail[u]]`. Different words give different walks and different walks give different words, so the count of walks is the count of words. The time is O(len * states * a), at most about 1000 * 61 * 26 steps here.'
      ]
    },
    statement: ['The alphabet has the first `a` lowercase letters. `m` forbidden words are given. Count the words of exactly `len` letters over this alphabet that do not contain any forbidden word as a block of neighbouring letters. Print the count modulo 1 000 000 007.'],
    outputFormat: ['Print one number: the count modulo 1000000007.'],
    examples: [{ input: '2 3 1\nab\n', note: 'Over the letters a and b, the words of length 3 without ab are aaa, baa, bba and bbb: 4.' }],
    hints: ['Build the Aho-Corasick automaton of the forbidden words and mark the states where a forbidden word ends.', 'A state is also bad if its failure link is bad, because then a forbidden word is a suffix of the text read so far.', 'Count the walks of length len from the root that never enter a bad state, with a table over the states.'],
    program: {
      io: ['a:int length:int m:int', 'words:rows[m]'],
      fast: true,
      python: r`
        MOD = 1000000007
        nxt = [[-1] * a]
        fail = [0]
        bad = [False]
        for w in words:
            node = 0
            for ch in w:
                c = ord(ch) - 97
                if nxt[node][c] == -1:
                    nxt[node][c] = len(nxt)
                    nxt.append([-1] * a)
                    fail.append(0)
                    bad.append(False)
                node = nxt[node][c]
            bad[node] = True
        queue = []
        for c in range(a):
            v = nxt[0][c]
            if v == -1:
                nxt[0][c] = 0
            else:
                queue.append(v)
        head = 0
        while head < len(queue):
            u = queue[head]
            head += 1
            if bad[fail[u]]:
                bad[u] = True
            for c in range(a):
                v = nxt[u][c]
                if v == -1:
                    nxt[u][c] = nxt[fail[u]][c]
                else:
                    fail[v] = nxt[fail[u]][c]
                    queue.append(v)
        states = len(nxt)
        dp = [0] * states
        dp[0] = 1
        for step in range(length):
            new = [0] * states
            for u in range(states):
                if dp[u] == 0:
                    continue
                row = nxt[u]
                for c in range(a):
                    v = row[c]
                    if not bad[v]:
                        new[v] += dp[u]
            dp = [x % MOD for x in new]
        print(sum(dp) % MOD)`,
      cpp: r`
        const long long MOD = 1000000007;
        int alpha = (int)a;
        vector<vector<int>> nxt(1, vector<int>(alpha, -1));
        vector<int> fail(1, 0);
        vector<char> bad(1, 0);
        for (long long wi = 0; wi < m; wi++) {
            int node = 0;
            for (char ch : words[wi]) {
                int c = ch - 'a';
                if (nxt[node][c] == -1) {
                    nxt[node][c] = (int)nxt.size();
                    nxt.push_back(vector<int>(alpha, -1));
                    fail.push_back(0);
                    bad.push_back(0);
                }
                node = nxt[node][c];
            }
            bad[node] = 1;
        }
        vector<int> queue;
        for (int c = 0; c < alpha; c++) {
            int v = nxt[0][c];
            if (v == -1) nxt[0][c] = 0;
            else queue.push_back(v);
        }
        for (size_t head = 0; head < queue.size(); head++) {
            int u = queue[head];
            if (bad[fail[u]]) bad[u] = 1;
            for (int c = 0; c < alpha; c++) {
                int v = nxt[u][c];
                if (v == -1) {
                    nxt[u][c] = nxt[fail[u]][c];
                } else {
                    fail[v] = nxt[fail[u]][c];
                    queue.push_back(v);
                }
            }
        }
        int states = (int)nxt.size();
        vector<long long> dp(states, 0), cur(states, 0);
        dp[0] = 1;
        for (long long step = 0; step < length; step++) {
            fill(cur.begin(), cur.end(), 0);
            for (int u = 0; u < states; u++) {
                if (dp[u] == 0) continue;
                for (int c = 0; c < alpha; c++) {
                    int v = nxt[u][c];
                    if (!bad[v]) cur[v] = (cur[v] + dp[u]) % MOD;
                }
            }
            dp = cur;
        }
        long long total = 0;
        for (int u = 0; u < states; u++) total = (total + dp[u]) % MOD;
        cout << total << "\n";`,
      java: r`
        long MOD = 1000000007L;
        int alpha = (int) a;
        int cap = 1;
        for (int wi = 0; wi < m; wi++) cap += words[wi].length();
        int[][] nxt = new int[cap][alpha];
        for (int[] row : nxt) Arrays.fill(row, -1);
        int[] fail = new int[cap];
        boolean[] bad = new boolean[cap];
        int size = 1;
        for (int wi = 0; wi < m; wi++) {
            int node = 0;
            for (int p = 0; p < words[wi].length(); p++) {
                int c = words[wi].charAt(p) - 'a';
                if (nxt[node][c] == -1) nxt[node][c] = size++;
                node = nxt[node][c];
            }
            bad[node] = true;
        }
        int[] queue = new int[size];
        int tail = 0;
        for (int c = 0; c < alpha; c++) {
            int v = nxt[0][c];
            if (v == -1) nxt[0][c] = 0;
            else queue[tail++] = v;
        }
        for (int head = 0; head < tail; head++) {
            int u = queue[head];
            if (bad[fail[u]]) bad[u] = true;
            for (int c = 0; c < alpha; c++) {
                int v = nxt[u][c];
                if (v == -1) {
                    nxt[u][c] = nxt[fail[u]][c];
                } else {
                    fail[v] = nxt[fail[u]][c];
                    queue[tail++] = v;
                }
            }
        }
        long[] dp = new long[size];
        long[] cur = new long[size];
        dp[0] = 1;
        for (int step = 0; step < length; step++) {
            Arrays.fill(cur, 0);
            for (int u = 0; u < size; u++) {
                if (dp[u] == 0) continue;
                for (int c = 0; c < alpha; c++) {
                    int v = nxt[u][c];
                    if (!bad[v]) cur[v] = (cur[v] + dp[u]) % MOD;
                }
            }
            long[] swap = dp;
            dp = cur;
            cur = swap;
        }
        long total = 0;
        for (int u = 0; u < size; u++) total = (total + dp[u]) % MOD;
        System.out.println(total);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['An Aho-Corasick automaton of the forbidden words is built, and a state is bad if a forbidden word ends there or at its failure link. The words that avoid all keywords correspond to the walks of length len from the root that never enter a bad state, counted with a table over the states.'], complexity: 'Time O(len * states * a), space O(states * a).' },
    solve(input) {
      const rs = rows(input); const [a, len, m] = nums(rs[0]); const words = rs.slice(1, 1 + m); const MOD = 1000000007;
      const nxt = [new Array(a).fill(-1)], fail = [0], bad = [false]; for (const w of words) { let node = 0; for (const ch of w) { const c = ch.charCodeAt(0) - 97; if (nxt[node][c] === -1) { nxt[node][c] = nxt.length; nxt.push(new Array(a).fill(-1)); fail.push(0); bad.push(false); } node = nxt[node][c]; } bad[node] = true; }
      const queue = []; for (let c = 0; c < a; c++) { const v = nxt[0][c]; if (v === -1) nxt[0][c] = 0; else queue.push(v); }
      for (let head = 0; head < queue.length; head++) { const u = queue[head]; if (bad[fail[u]]) bad[u] = true; for (let c = 0; c < a; c++) { const v = nxt[u][c]; if (v === -1) nxt[u][c] = nxt[fail[u]][c]; else { fail[v] = nxt[fail[u]][c]; queue.push(v); } } }
      let dp = new Array(nxt.length).fill(0); dp[0] = 1; for (let step = 0; step < len; step++) { const nw = new Array(nxt.length).fill(0); for (let u = 0; u < nxt.length; u++) { if (!dp[u]) continue; for (let c = 0; c < a; c++) { const v = nxt[u][c]; if (!bad[v]) nw[v] = (nw[v] + dp[u]) % MOD; } } dp = nw; } return dp.reduce((s, v) => (s + v) % MOD, 0);
    },
    tests() {
      const g = rng(5003); const out = ['2 3 1\nab\n', '1 5 1\na\n', '3 4 2\nab\nc\n'];
      const brute = (input) => { const rs = rows(input); const [a, len, m] = nums(rs[0]); const words = rs.slice(1, 1 + m); let count = 0; const rec = (s) => { if (s.length === len) { if (!words.some((w) => s.includes(w))) count++; return; } for (let c = 0; c < a; c++) rec(s + String.fromCharCode(97 + c)); }; rec(''); return count; };
      const make = (a, len, m, maxWord) => { const mw = Math.max(1, Math.min(maxWord, Math.floor(60 / m))); const words = many(m, () => randWord(g, randInt(g, 1, mw), 'abcdefghijklmnopqrstuvwxyz'.slice(0, a))); return `${a} ${len} ${m}\n${words.join('\n')}\n`; };
      crossCheck(() => make(randInt(g, 1, 3), randInt(g, 1, 7), randInt(g, 1, 3), 3), (i) => this.solve(i), brute, 600);
      crossCheck(() => make(randInt(g, 2, 4), randInt(g, 1, 6), randInt(g, 1, 4), 4), (i) => this.solve(i), brute, 200);
      for (const [a, len, m, mw] of [[2, 20, 3, 5], [3, 100, 5, 6], [4, 300, 6, 8], [26, 1000, 10, 6], [26, 1000, 20, 3], [2, 1000, 5, 12], [3, 1000, 4, 15], [10, 999, 8, 7], [1, 1000, 1, 5]]) out.push(make(a, len, m, mw));
      out.push('26 1000 1\n' + 'z'.repeat(60) + '\n');
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has the word `s`.', 'The second line has `q`: the number of questions.', 'Each of the next `q` lines has two numbers `i` and `j`.'],
    constraints: ['1 <= |s| <= 30000', '1 <= q <= 100000', '1 <= i, j <= |s|', '`s` has lowercase letters only.'],
    slug: 'how-far-do-two-suffixes-match',
    title: 'How Far Do Two Positions of the Word Match?',
    tags: ['suffix-array', 'lcp', 'sparse-table', 'range-minimum'],
    concept: {
      title: 'The common prefix of two suffixes is the minimum of the LCP array between their places in the sorted order',
      body: [
        'For two positions `i` and `j` of a word, how many letters match when reading forward from both places? That is the **longest common prefix** of the suffixes starting at `i` and `j`. In `abaab`, the suffixes at the positions 1 and 4 are `abaab` and `ab`, and they share 2 letters. With 100000 questions and a word of length 30000, comparing letter by letter can take 30000 steps per question (for a word like `aaaa...`).',
        'Build the **suffix array** and the **LCP array** (`lcp[r]` is the common prefix of the suffixes at the places `r - 1` and `r` in sorted order). For two suffixes at the sorted places `ra < rb`, the common prefix is the **minimum of `lcp[ra + 1 .. rb]`**: sorted order keeps the shared prefix constant for all suffixes between them, and the shortest step bounds it. This is a range-minimum question on a fixed array, which a **sparse table** answers in O(1) after an O(n log n) preparation.',
        { code: 'table[0] = lcp;  table[k][x] = min(table[k-1][x], table[k-1][x + 2^(k-1)])\n\ndef lce(i, j):\n    if i == j: return n - i\n    a, b = sorted((rank[i], rank[j]))\n    lo, hi = a + 1, b                            # the range lcp[lo..hi]\n    k = (hi - lo + 1).bit_length() - 1\n    return min(table[k][lo], table[k][hi - (1 << k) + 1])' },
        'Two overlapping blocks of length `2^k` cover the whole range, and for a minimum the overlap does no harm. When `i = j` the answer is the whole suffix. All of this is built once and then every question is a few array reads.'
      ]
    },
    statement: ['A word `s` is given. Answer `q` questions. Each question has two positions `i` and `j` (counting from 1). Find the largest `len` such that the `len` letters starting at the position `i` are the same as the `len` letters starting at the position `j` (both blocks must fit in the word). Print the answers on one line, in order.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: 'abaab\n3\n1 4\n2 5\n3 3\n', note: 'The suffixes abaab and ab share 2 letters. The suffixes baab and b share 1. The suffix at the position 3 matches itself in all its 3 letters: 2 1 3.' }],
    hints: ['Build the suffix array and the LCP array of the word.', 'For two suffixes with sorted places a < b, the answer is the minimum of lcp[a + 1 .. b].', 'Answer the range minimum in O(1) with a sparse table, and treat i = j separately.'],
    program: {
      io: ['s:word', 'q:int', 'qs:int[q][2]'],
      fast: true,
      helpers: SUFFIX,
      python: r`
        n = len(s)
        sa = suffix_array(s)
        lcp = lcp_array(s, sa)
        rk = [0] * n
        for i in range(n):
            rk[sa[i]] = i
        table = [lcp]
        k = 1
        while 2 * k <= n:
            prev = table[-1]
            table.append([min(prev[x], prev[x + k]) for x in range(n - 2 * k + 1)])
            k *= 2
        out = []
        for i, j in qs:
            i -= 1
            j -= 1
            if i == j:
                out.append(n - i)
                continue
            a = rk[i]
            b = rk[j]
            if a > b:
                a, b = b, a
            lo = a + 1
            span = b - lo + 1
            level = span.bit_length() - 1
            out.append(min(table[level][lo], table[level][b - (1 << level) + 1]))
        print(*out)`,
      cpp: r`
        int len = (int)s.size();
        vector<int> sa = suffixArray(s);
        vector<int> lcp = lcpArray(s, sa);
        vector<int> rk(len);
        for (int i = 0; i < len; i++) rk[sa[i]] = i;
        vector<vector<int>> table(1, lcp);
        for (int k = 1; 2 * k <= len; k *= 2) {
            const vector<int>& prev = table.back();
            vector<int> cur(len - 2 * k + 1);
            for (int x = 0; x + 2 * k <= len; x++) cur[x] = min(prev[x], prev[x + k]);
            table.push_back(cur);
        }
        string out;
        for (long long t = 0; t < q; t++) {
            int i = (int)qs[t][0] - 1, j = (int)qs[t][1] - 1;
            if (t > 0) out += " ";
            if (i == j) {
                out += to_string(len - i);
                continue;
            }
            int a = rk[i], b = rk[j];
            if (a > b) swap(a, b);
            int lo = a + 1;
            int span = b - lo + 1;
            int level = 31 - __builtin_clz(span);
            out += to_string(min(table[level][lo], table[level][b - (1 << level) + 1]));
        }
        cout << out << "\n";`,
      java: r`
        int len = s.length();
        int[] sa = suffixArray(s);
        int[] lcp = lcpArray(s, sa);
        int[] rk = new int[len];
        for (int i = 0; i < len; i++) rk[sa[i]] = i;
        int levels = 1;
        while ((1 << levels) <= len) levels++;
        int[][] table = new int[levels][];
        table[0] = lcp;
        for (int lv = 1; lv < levels; lv++) {
            int k = 1 << (lv - 1);
            int size = len - 2 * k + 1;
            table[lv] = new int[Math.max(size, 0)];
            for (int x = 0; x < size; x++) table[lv][x] = Math.min(table[lv - 1][x], table[lv - 1][x + k]);
        }
        StringBuilder out = new StringBuilder();
        for (int t = 0; t < q; t++) {
            int i = (int) qs[t][0] - 1, j = (int) qs[t][1] - 1;
            if (t > 0) out.append(" ");
            if (i == j) {
                out.append(len - i);
                continue;
            }
            int a = rk[i], b = rk[j];
            if (a > b) {
                int tmp = a;
                a = b;
                b = tmp;
            }
            int lo = a + 1;
            int span = b - lo + 1;
            int level = 31 - Integer.numberOfLeadingZeros(span);
            out.append(Math.min(table[level][lo], table[level][b - (1 << level) + 1]));
        }
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The suffix array and the LCP array are built once. For two suffixes at the sorted places a < b the longest common prefix is the minimum of lcp[a + 1 .. b], answered in O(1) by a sparse table; equal positions give the whole suffix.'], complexity: 'Time O(n log^2 n + q), space O(n log n).' },
    solve(input) {
      const rs = rows(input); const s = rs[0]; const q = Number(rs[1]); const n = s.length; const sa = suffixArray(s); const lcp = lcpArray(s, sa); const rank = new Array(n); for (let i = 0; i < n; i++) rank[sa[i]] = i;
      const table = [lcp]; for (let k = 1; 2 * k <= n; k *= 2) { const prev = table[table.length - 1]; const cur = new Array(n - 2 * k + 1); for (let x = 0; x < cur.length; x++) cur[x] = Math.min(prev[x], prev[x + k]); table.push(cur); }
      const out = []; for (let t = 0; t < q; t++) { let [i, j] = nums(rs[2 + t]); i--; j--; if (i === j) { out.push(n - i); continue; } let a = rank[i], b = rank[j]; if (a > b) [a, b] = [b, a]; const lo = a + 1; const span = b - lo + 1; const level = 31 - Math.clz32(span); out.push(Math.min(table[level][lo], table[level][b - (1 << level) + 1])); } return out.join(' ');
    },
    tests() {
      const g = rng(5004); const out = ['abaab\n3\n1 4\n2 5\n3 3\n', 'a\n1\n1 1\n'];
      const brute = (input) => { const rs = rows(input); const s = rs[0]; const q = Number(rs[1]); const res = []; for (let t = 0; t < q; t++) { const [i, j] = nums(rs[2 + t]); let l = 0; while (i - 1 + l < s.length && j - 1 + l < s.length && s[i - 1 + l] === s[j - 1 + l]) l++; res.push(l); } return res.join(' '); };
      const make = (s, q) => `${s}\n${q}\n${lines(many(q, () => [randInt(g, 1, s.length), randInt(g, 1, s.length)]))}\n`;
      crossCheck(() => { const s = randWord(g, randInt(g, 1, 10), 'ab'); return make(s, randInt(g, 1, 10)); }, (i) => this.solve(i), brute, 800);
      crossCheck(() => { const s = randWord(g, randInt(g, 1, 12), 'abc'); return make(s, randInt(g, 1, 10)); }, (i) => this.solve(i), brute, 300);
      const words = wordSet(g); const sizes = [100, 1000, 100000, 40000, 40000, 20000, 20000, 20000, 20000, 20000];
      words.forEach((s, i) => out.push(make(s, sizes[i % sizes.length])));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `q`: the number of operations.', 'Each of the next `q` lines has two numbers `t` and `c`. If `t = 1`, add the letter number `c` (1 is a, 2 is b, and so on) to the end of the word. If `t = 2`, remove the last letter (`c` is 0).'],
    constraints: ['1 <= q <= 100000', '1 <= c <= 26 for an addition.', 'A removal is never made on an empty word.'],
    slug: 'border-after-each-push-or-pop',
    title: 'The Longest Border of a Word That Grows and Shrinks at the End',
    tags: ['prefix-function', 'kmp-automaton', 'rollback', 'strings'],
    concept: {
      title: 'Store the KMP automaton row of every position: adding a letter costs 26 steps, removing one costs nothing',
      body: [
        'A **border** of a word is a proper prefix that is also a suffix. The word `abaab` has the borders `ab` and (shorter) none other, so its longest border has length 2. The word is changed at its end only: a letter is added, or the last letter is removed. After **every** operation print the length of the longest border of the current word (0 for an empty word).',
        'For adding letters only, the prefix function is computed in amortised O(1) per letter. With removals the amortisation breaks: take `aaaa...a` (many letters) and repeat "add `b`, remove it". Each addition falls back through the whole chain of borders, which has length about `n`, so the total is O(n^2). The cure is to store, for every position `i`, the **automaton row** `aut[i][c]`: the length of the longest prefix of the word that is a suffix of (the first `i` letters + the letter `c`). Then the new border is found in one step.',
        { code: 'push c at position p = len(word):\n    pi[p] = aut[pi[p-1]][c]           # one lookup (0 if p == 0 and c differs)\n    row = copy of aut[pi[p-1]]        # the transitions of state p follow the border\'s state\n    row[c] = p + 1                    # but matching the letter at position p moves forward\n    aut.append(row)\n\npop:  pi.pop(); aut.pop()             # a row never depends on the letters after its position' },
        'The row of the state `i` depends only on the letters at the positions up to `i` (it is the row of `pi[i-1]` with the entry for the letter at `i` replaced by `i + 1`), so removing the last letter simply removes the last row and the last prefix-function value; nothing below changes. Every operation costs O(26) at most, and the memory is 26 numbers per letter of the longest word.'
      ]
    },
    statement: ['A word starts empty. Process `q` operations: type 1 `c` appends the letter number `c` (1 means a, 2 means b, up to 26 for z) to the end; type 2 `0` removes the last letter of the word (it is not empty). After every operation print the length of the longest proper prefix of the word that is also a suffix of it (0 if the word is empty or has no such prefix). Print the numbers on one line.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: '7\n1 1\n1 2\n1 1\n1 2\n2 0\n1 1\n1 2\n', note: 'The words are a, ab, aba, abab, aba, abaa and abaab, with the longest borders 0, 0, 1, 2, 1, 1 and 2: 0 0 1 2 1 1 2.' }],
    hints: ['The plain prefix function is fast for additions only: a removal followed by an addition can be slow again.', 'Store for every position the automaton row: where the matched length goes after reading each of the 26 letters.', 'A row is the row of the border state, except that the letter at the position itself moves forward; removing the last letter removes the last row.'],
    program: {
      io: ['q:int', 'ops:int[q][2]'],
      fast: true,
      python: r`
        aut = []
        pi = []
        out = []
        for kind, c in ops:
            if kind == 1:
                c -= 1
                p = len(pi)
                if p == 0:
                    pi.append(0)
                    row = [0] * 26
                else:
                    pi.append(aut[pi[p - 1]][c])
                    row = aut[pi[p - 1]][:]
                row[c] = p + 1
                aut.append(row)
            else:
                pi.pop()
                aut.pop()
            out.append(pi[-1] if pi else 0)
        print(*out)`,
      cpp: r`
        vector<array<int, 26>> aut;
        vector<int> pi;
        string out;
        for (long long j = 0; j < q; j++) {
            long long kind = ops[j][0];
            if (kind == 1) {
                int c = (int)ops[j][1] - 1;
                int p = (int)pi.size();
                array<int, 26> row;
                if (p == 0) {
                    row.fill(0);
                    pi.push_back(0);
                } else {
                    row = aut[pi[p - 1]];
                    pi.push_back(row[c]);
                }
                row[c] = p + 1;
                aut.push_back(row);
            } else {
                pi.pop_back();
                aut.pop_back();
            }
            if (j > 0) out += " ";
            out += to_string(pi.empty() ? 0 : pi.back());
        }
        cout << out << "\n";`,
      java: r`
        int cap = (int) q + 1;
        int[][] aut = new int[cap][26];
        int[] pi = new int[cap];
        int size = 0;
        StringBuilder out = new StringBuilder();
        for (int j = 0; j < q; j++) {
            long kind = ops[j][0];
            if (kind == 1) {
                int c = (int) ops[j][1] - 1;
                int p = size;
                if (p == 0) {
                    pi[0] = 0;
                    Arrays.fill(aut[0], 0);
                } else {
                    pi[p] = aut[pi[p - 1]][c];
                    System.arraycopy(aut[pi[p - 1]], 0, aut[p], 0, 26);
                }
                aut[p][c] = p + 1;
                size++;
            } else {
                size--;
            }
            if (j > 0) out.append(" ");
            out.append(size == 0 ? 0 : pi[size - 1]);
        }
        System.out.println(out);`,
      includes: ['<array>', '<string>']
    },
    solution: { explanation: ['For every position the KMP automaton row is stored: it is the row of the border state with the entry for the letter at that position replaced by position + 1. An addition costs one lookup and a row copy, a removal just drops the last row and the last prefix-function value.'], complexity: 'Time O(26 q), space O(26 q).' },
    solve(input) {
      const rs = rows(input); const q = Number(rs[0]); const aut = [], pi = []; const out = []; for (let j = 0; j < q; j++) { const [t, c0] = nums(rs[1 + j]); if (t === 1) { const c = c0 - 1; const p = pi.length; let row; if (p === 0) { pi.push(0); row = new Array(26).fill(0); } else { pi.push(aut[pi[p - 1]][c]); row = aut[pi[p - 1]].slice(); } row[c] = p + 1; aut.push(row); } else { pi.pop(); aut.pop(); } out.push(pi.length ? pi[pi.length - 1] : 0); } return out.join(' ');
    },
    tests() {
      const g = rng(5005); const out = ['7\n1 1\n1 2\n1 1\n1 2\n2 0\n1 1\n1 2\n', '1\n1 5\n', '3\n1 1\n2 0\n1 1\n'];
      const brute = (input) => { const rs = rows(input); const q = Number(rs[0]); const w = []; const res = []; for (let j = 0; j < q; j++) { const [t, c] = nums(rs[1 + j]); if (t === 1) w.push(c); else w.pop(); let best = 0; for (let b = w.length - 1; b >= 1; b--) { let ok = true; for (let i = 0; i < b; i++) if (w[i] !== w[w.length - b + i]) { ok = false; break; } if (ok) { best = b; break; } } res.push(best); } return res.join(' '); };
      const make = (q, alpha, pPush, startLetters, pattern) => { const ops = []; let depth = 0; for (const c of startLetters) { ops.push([1, c]); depth++; } while (ops.length < q) { if (pattern) { ops.push(pattern(ops.length, depth)); depth += ops[ops.length - 1][0] === 1 ? 1 : -1; continue; } if (depth === 0 || g() < pPush) { ops.push([1, randInt(g, 1, alpha)]); depth++; } else { ops.push([2, 0]); depth--; } } return `${ops.length}\n${lines(ops)}\n`; };
      crossCheck(() => make(randInt(g, 1, 14), 2, 0.6, [], null), (i) => this.solve(i), brute, 1000);
      crossCheck(() => make(randInt(g, 1, 14), 3, 0.5, [], null), (i) => this.solve(i), brute, 300);
      for (const [q, alpha, p] of [[30, 2, 0.6], [1000, 2, 0.55], [100000, 2, 0.55], [50000, 26, 0.6], [40000, 1, 0.5], [50000, 3, 0.52]]) out.push(make(q, alpha, p, [], null));
      const aaa = many(40000, () => 1);
      out.push(make(100000, 2, 0.5, aaa, (len, depth) => ((len - 40000) % 2 === 0 ? [1, 2] : [2, 0])));
      const periodicStart = many(30000, (i) => 1 + (i % 3 === 2 ? 1 : 0));
      out.push(make(100000, 2, 0.5, periodicStart, (len, depth) => ((len - 30000) % 4 === 0 ? [1, 1] : (len - 30000) % 4 === 1 ? [1, 2] : [2, 0])));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has the word `s`.'],
    constraints: ['1 <= |s| <= 30000', '`s` has lowercase letters only.'],
    slug: 'shortest-unique-substring-from-each-position',
    title: 'The Shortest Substring From Each Position That Occurs Only Once',
    tags: ['suffix-array', 'lcp', 'strings', 'uniqueness'],
    concept: {
      title: 'A prefix of a suffix is unique exactly when it is longer than the common part with both neighbours in sorted order',
      body: [
        'For every position `i` of a word, find the length of the **shortest substring that starts at `i` and occurs in the word exactly once** (overlapping occurrences count). If there is none, print 0. In `abaab` the position 1 gives 3 (`aba` occurs once; `a` and `ab` occur several times), and the last two positions give 0, because every substring that starts there also occurs elsewhere.',
        'Another occurrence of the substring `s[i..i+len)` would be another suffix with the same first `len` letters. In the **sorted order of the suffixes** such suffixes are neighbours, so the prefix of length `len` of the suffix number `r` in sorted order is unique exactly when `len` is larger than the common prefix with the **previous** suffix and also larger than the common prefix with the **next** one. In terms of the LCP array this is `len > max(lcp[r], lcp[r + 1])`.',
        { code: 'sa = suffix_array(s); lcp = lcp_array(s, sa)\nfor r in range(n):\n    need = max(lcp[r], lcp[r + 1] if r + 1 < n else 0) + 1\n    pos = sa[r]\n    ans[pos] = need if need <= n - pos else 0      # the suffix is too short to be unique' },
        'If `need` is longer than the suffix itself, no prefix works and the answer is 0 (for example the last letter of `abaab` equals an earlier substring). The whole solution is the suffix array in O(n log^2 n) plus a linear pass. Each position needs only its two sorted neighbours.'
      ]
    },
    statement: ['A word `s` is given. For every position `i` (from 1 to |s|), find the length of the shortest block of neighbouring letters that starts at the position `i` and occurs in `s` exactly once (occurrences may overlap). If no such block exists, the answer for the position is 0. Print the answers for all positions on one line.'],
    outputFormat: ['Print |s| numbers separated by spaces.'],
    examples: [{ input: 'abaab\n', note: 'At the position 1: a occurs 3 times and ab twice, aba once: 3. At the position 2: b twice, ba once: 2. At the position 3: aa once: 2. At the positions 4 and 5 every block also occurs elsewhere: 0 0.' }],
    hints: ['Another occurrence of a block is another suffix that starts with the same letters, and in the sorted order of the suffixes it is a neighbour.', 'The prefix of a suffix is unique if it is longer than the common prefix with the previous and with the next suffix.', 'So the answer for a position is max(lcp with the previous, lcp with the next) + 1, or 0 if that exceeds the length of the suffix.'],
    program: {
      io: ['s:word'],
      fast: true,
      helpers: SUFFIX,
      python: r`
        n = len(s)
        sa = suffix_array(s)
        lcp = lcp_array(s, sa)
        ans = [0] * n
        for r in range(n):
            left = lcp[r]
            right = lcp[r + 1] if r + 1 < n else 0
            need = max(left, right) + 1
            pos = sa[r]
            if need <= n - pos:
                ans[pos] = need
        print(*ans)`,
      cpp: r`
        int len = (int)s.size();
        vector<int> sa = suffixArray(s);
        vector<int> lcp = lcpArray(s, sa);
        vector<int> ans(len, 0);
        for (int rk = 0; rk < len; rk++) {
            int left = lcp[rk];
            int right = rk + 1 < len ? lcp[rk + 1] : 0;
            int need = max(left, right) + 1;
            int pos = sa[rk];
            if (need <= len - pos) ans[pos] = need;
        }
        string out;
        for (int i = 0; i < len; i++) {
            if (i > 0) out += " ";
            out += to_string(ans[i]);
        }
        cout << out << "\n";`,
      java: r`
        int len = s.length();
        int[] sa = suffixArray(s);
        int[] lcp = lcpArray(s, sa);
        int[] ans = new int[len];
        for (int rk = 0; rk < len; rk++) {
            int left = lcp[rk];
            int right = rk + 1 < len ? lcp[rk + 1] : 0;
            int need = Math.max(left, right) + 1;
            int pos = sa[rk];
            if (need <= len - pos) ans[pos] = need;
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < len; i++) {
            if (i > 0) out.append(" ");
            out.append(ans[i]);
        }
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['In the sorted order of the suffixes, a prefix of the suffix number r is unique exactly when it is longer than the common prefix with both neighbours. The answer for the position sa[r] is max(lcp[r], lcp[r + 1]) + 1, or 0 when that is longer than the suffix.'], complexity: 'Time O(n log^2 n), space O(n).' },
    solve(input) {
      const s = rows(input)[0]; const n = s.length; const sa = suffixArray(s); const lcp = lcpArray(s, sa); const ans = new Array(n).fill(0); for (let r = 0; r < n; r++) { const need = Math.max(lcp[r], r + 1 < n ? lcp[r + 1] : 0) + 1; if (need <= n - sa[r]) ans[sa[r]] = need; } return ans.join(' ');
    },
    tests() {
      const g = rng(5006); const out = ['abaab\n', 'a\n', 'aa\n', 'abcd\n'];
      const brute = (input) => { const s = rows(input)[0]; const n = s.length; const res = []; for (let i = 0; i < n; i++) { let ans = 0; for (let len = 1; i + len <= n; len++) { const sub = s.slice(i, i + len); let c = 0; for (let p = s.indexOf(sub); p >= 0; p = s.indexOf(sub, p + 1)) c++; if (c === 1) { ans = len; break; } } res.push(ans); } return res.join(' '); };
      crossCheck(() => randWord(g, randInt(g, 1, 12), 'ab') + '\n', (i) => this.solve(i), brute, 1000);
      crossCheck(() => randWord(g, randInt(g, 1, 12), 'abc') + '\n', (i) => this.solve(i), brute, 300);
      for (const w of wordSet(g)) out.push(w + '\n');
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has the word `s`.', 'The second line has the number `k`.'],
    constraints: ['1 <= |s| <= 30000', '1 <= k <= 30000', '`s` has lowercase letters only.'],
    slug: 'longest-substring-occurring-k-times',
    title: 'The Longest Block That Appears At Least k Times',
    tags: ['suffix-array', 'lcp', 'sliding-window-minimum', 'strings'],
    concept: {
      title: 'A block that occurs k times is a common prefix of k suffixes that are neighbours in sorted order, so slide a window of k - 1 over the LCP array',
      body: [
        'Find the **longest block of neighbouring letters** that occurs in the word **at least `k` times** (occurrences may overlap). In `banana` the block `ana` occurs 2 times (at the positions 2 and 4), so for `k = 2` the answer is 3; for `k = 3` the block `a` occurs three times, and the answer is 1. If no block occurs `k` times, the answer is 0.',
        'A block that occurs `k` times is the common prefix of `k` different suffixes. Among the suffixes in sorted order those that start with the same block are **consecutive**, so we need `k` consecutive suffixes in the sorted order, and the longest block they share is the **minimum of the `k - 1` LCP values between them**. The answer is the maximum, over all windows of `k - 1` consecutive LCP values, of the minimum in the window.',
        { code: 'w = k - 1                               # window over lcp[1..n-1]\nfor i in range(1, n):\n    while dq and lcp[dq[-1]] >= lcp[i]: dq.pop()    # a monotonic queue keeps the minimum in front\n    dq.append(i)\n    if dq[0] <= i - w: dq.popleft()\n    if i >= w: best = max(best, lcp[dq[0]])' },
        'The sliding-window minimum with a monotonic queue is linear. For `k = 1` the whole word is the answer (`n`), and for `k > n` there is no answer (0). The suffix array is the only expensive part: O(n log^2 n).'
      ]
    },
    statement: ['A word `s` and a number `k` are given. Find the largest length of a block of neighbouring letters of `s` that occurs in `s` at least `k` times. Occurrences may overlap. If no block occurs `k` times, print 0.'],
    outputFormat: ['Print one number: the largest length, or 0.'],
    examples: [{ input: 'banana\n2\n', note: 'The block ana occurs at the positions 2 and 4 (overlapping), and no longer block repeats: 3.' }],
    hints: ['A block that occurs k times is a common prefix of k suffixes.', 'In the sorted order of the suffixes they are consecutive, and their common prefix is the minimum of k - 1 neighbouring LCP values.', 'Take the maximum over all windows of k - 1 values of the LCP array, using a monotonic queue for the minimum.'],
    program: {
      io: ['s:word', 'k:int'],
      fast: true,
      helpers: SUFFIX,
      python: r`
        from collections import deque
        n = len(s)
        if k == 1:
            print(n)
        elif k > n:
            print(0)
        else:
            sa = suffix_array(s)
            lcp = lcp_array(s, sa)
            w = k - 1
            best = 0
            dq = deque()
            for i in range(1, n):
                while dq and lcp[dq[-1]] >= lcp[i]:
                    dq.pop()
                dq.append(i)
                if dq[0] <= i - w:
                    dq.popleft()
                if i >= w and lcp[dq[0]] > best:
                    best = lcp[dq[0]]
            print(best)`,
      cpp: r`
        long long len = s.size();
        if (k == 1) {
            cout << len << "\n";
        } else if (k > len) {
            cout << 0 << "\n";
        } else {
            vector<int> sa = suffixArray(s);
            vector<int> lcp = lcpArray(s, sa);
            long long w = k - 1;
            int best = 0;
            vector<int> dq(len);
            int head = 0, tail = 0;
            for (int i = 1; i < len; i++) {
                while (tail > head && lcp[dq[tail - 1]] >= lcp[i]) tail--;
                dq[tail++] = i;
                if (dq[head] <= i - w) head++;
                if (i >= w && lcp[dq[head]] > best) best = lcp[dq[head]];
            }
            cout << best << "\n";
        }`,
      java: r`
        int len = s.length();
        if (k == 1) {
            System.out.println(len);
        } else if (k > len) {
            System.out.println(0);
        } else {
            int[] sa = suffixArray(s);
            int[] lcp = lcpArray(s, sa);
            int w = (int) k - 1;
            int best = 0;
            int[] dq = new int[len];
            int head = 0, tail = 0;
            for (int i = 1; i < len; i++) {
                while (tail > head && lcp[dq[tail - 1]] >= lcp[i]) tail--;
                dq[tail++] = i;
                if (dq[head] <= i - w) head++;
                if (i >= w && lcp[dq[head]] > best) best = lcp[dq[head]];
            }
            System.out.println(best);
        }`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['A block that occurs k times is a common prefix of k consecutive suffixes in sorted order, so the answer is the maximum, over windows of k - 1 consecutive LCP values, of their minimum. A monotonic queue computes all window minima in linear time.'], complexity: 'Time O(n log^2 n), space O(n).' },
    solve(input) {
      const [s, kk] = rows(input); const k = Number(kk); const n = s.length; if (k === 1) return n; if (k > n) return 0; const sa = suffixArray(s); const lcp = lcpArray(s, sa); const w = k - 1; let best = 0; const dq = []; let head = 0; for (let i = 1; i < n; i++) { while (dq.length > head && lcp[dq[dq.length - 1]] >= lcp[i]) dq.pop(); dq.push(i); if (dq[head] <= i - w) head++; if (i >= w && lcp[dq[head]] > best) best = lcp[dq[head]]; } return best;
    },
    tests() {
      const g = rng(5007); const out = ['banana\n2\n', 'banana\n3\n', 'a\n1\n', 'abc\n2\n'];
      const brute = (input) => { const [s, kk] = rows(input); const k = Number(kk); let best = 0; for (let len = 1; len <= s.length; len++) { const count = new Map(); for (let i = 0; i + len <= s.length; i++) { const sub = s.slice(i, i + len); count.set(sub, (count.get(sub) || 0) + 1); } if ([...count.values()].some((v) => v >= k)) best = len; } return best; };
      const make = (s, k) => `${s}\n${k}\n`;
      crossCheck(() => { const s = randWord(g, randInt(g, 1, 12), 'ab'); return make(s, randInt(g, 1, 5)); }, (i) => this.solve(i), brute, 1000);
      crossCheck(() => { const s = randWord(g, randInt(g, 1, 12), 'abc'); return make(s, randInt(g, 1, 6)); }, (i) => this.solve(i), brute, 300);
      const ks = [2, 3, 5, 2, 10, 100, 2, 1000, 3, 15000, 30000, 4];
      wordSet(g).forEach((s, i) => out.push(make(s, ks[i % ks.length])));
      out.push(make(randWord(g, 30000, 'abcdefghijklmnopqrstuvwxyz'), 30000), make(randWord(g, 30000, 'ab'), 1), make('abc'.repeat(10000), 10000), make('abc'.repeat(10000), 10001));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has the text `t`.', 'The second line has the pattern `p`.'],
    constraints: ['1 <= |t| <= 100000', '1 <= |p| <= 50000', 'Both words have lowercase letters only.'],
    slug: 'matches-with-at-most-one-wrong-letter',
    title: 'Where Does the Pattern Fit With At Most One Wrong Letter?',
    tags: ['z-function', 'strings', 'approximate-matching', 'prefix-suffix'],
    concept: {
      title: 'A window matches with at most one mismatch exactly when its matching prefix and its matching suffix together cover all but one letter',
      body: [
        'Count the positions of a text where the pattern can be placed so that **at most one letter differs**. For the text `abcabd` and the pattern `abc`, the pattern fits at the position 1 exactly and at the position 4 with one wrong letter (`abd`), but not at the positions 2 and 3: the answer is 2. Comparing the pattern with every window letter by letter takes O(|t| |p|) steps.',
        'For a window starting at `i`, let `pre` be the length of the longest common **prefix** of the pattern and the text from `i`, and `suf` the longest common **suffix** of the pattern and the text up to `i + m - 1` (with `m = |p|`). The window has at most one mismatch exactly when **`pre + suf >= m - 1`**: if the two matching parts overlap or touch, everything matches; if they leave a single letter between them, that one letter is the mismatch (it must differ, because `pre` is the longest). With two or more letters left over, there are at least two mismatches.',
        { code: 'zf = z_function(p + "#" + t)              # zf[m + 1 + i] = pre for the window at i\nzr = z_function(p[::-1] + "#" + t[::-1])  # the same for the reversed words gives the suffixes\nfor i in range(n - m + 1):\n    pre = zf[m + 1 + i]\n    suf = zr[n + 1 - i]                   # the window ends at i + m - 1, i.e. at n - i - m in reverse\n    if pre + suf >= m - 1: count += 1' },
        'The separator `#` keeps every Z value from running past the pattern. Two Z-function runs give all the `pre` and `suf` values in linear time, so the whole count is O(|t| + |p|).'
      ]
    },
    statement: ['A text `t` and a pattern `p` are given. Count the positions `i` (from 1 to |t| - |p| + 1) such that the block of the text of length |p| that starts at `i` differs from `p` in **at most one** position. Print the count.'],
    outputFormat: ['Print one number: the count of positions (0 if the pattern is longer than the text).'],
    examples: [{ input: 'abcabd\nabc\n', note: 'The windows abc (0 differences), bca (3), cab (3) and abd (1) give 2 good positions.' }],
    hints: ['For each window, let pre be the length of the matching prefix with the pattern, and suf the length of the matching suffix.', 'If pre + suf >= m - 1, the window has at most one mismatch.', 'Both values for all windows come from the Z-function: one run on pattern + # + text, and one on the reversed words.'],
    program: {
      io: ['t:word', 'p:word'],
      fast: true,
      helpers: ZFUNC,
      python: r`
        n = len(t)
        m = len(p)
        if m > n:
            print(0)
        else:
            zf = z_function(p + '#' + t)
            zr = z_function(p[::-1] + '#' + t[::-1])
            count = 0
            for i in range(n - m + 1):
                if zf[m + 1 + i] + zr[n + 1 - i] >= m - 1:
                    count += 1
            print(count)`,
      cpp: r`
        int n = (int)t.size(), m = (int)p.size();
        if (m > n) {
            cout << 0 << "\n";
        } else {
            string rp(p.rbegin(), p.rend()), rt(t.rbegin(), t.rend());
            vector<int> zf = zFunction(p + "#" + t);
            vector<int> zr = zFunction(rp + "#" + rt);
            long long count = 0;
            for (int i = 0; i + m <= n; i++) {
                if (zf[m + 1 + i] + zr[n + 1 - i] >= m - 1) count++;
            }
            cout << count << "\n";
        }`,
      java: r`
        int n = t.length(), m = p.length();
        if (m > n) {
            System.out.println(0);
        } else {
            String rp = new StringBuilder(p).reverse().toString();
            String rt = new StringBuilder(t).reverse().toString();
            int[] zf = zFunction(p + "#" + t);
            int[] zr = zFunction(rp + "#" + rt);
            long count = 0;
            for (int i = 0; i + m <= n; i++) {
                if (zf[m + 1 + i] + zr[n + 1 - i] >= m - 1) count++;
            }
            System.out.println(count);
        }`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['For every window the Z-function gives the length pre of the matching prefix and, on the reversed words, the length suf of the matching suffix. The window has at most one mismatch exactly when pre + suf >= m - 1.'], complexity: 'Time O(|t| + |p|), space O(|t| + |p|).' },
    solve(input) {
      const [t, p] = rows(input); const n = t.length, m = p.length; if (m > n) return 0; const rev = (x) => [...x].reverse().join(''); const zf = zFn(p + '#' + t), zr = zFn(rev(p) + '#' + rev(t)); let count = 0; for (let i = 0; i + m <= n; i++) if (zf[m + 1 + i] + zr[n + 1 - i] >= m - 1) count++; return count;
    },
    tests() {
      const g = rng(5008); const out = ['abcabd\nabc\n', 'a\na\n', 'a\nb\n', 'ab\nabc\n', 'aaaa\nab\n'];
      const brute = (input) => { const [t, p] = rows(input); let c = 0; for (let i = 0; i + p.length <= t.length; i++) { let d = 0; for (let j = 0; j < p.length && d < 2; j++) if (t[i + j] !== p[j]) d++; if (d <= 1) c++; } return c; };
      const mutate = (w, k) => { let s = w; for (let i = 0; i < k; i++) { const pos = randInt(g, 0, s.length - 1); s = s.slice(0, pos) + String.fromCharCode(97 + randInt(g, 0, 1)) + s.slice(pos + 1); } return s; };
      const make = (n, m, alpha, noise) => { const t = noise === 'periodic' ? periodic(g, n, 3, alpha, true) : randWord(g, n, alpha); const p = noise === 'sub' ? mutate(t.slice(0, m), 1) : noise === 'periodic' ? mutate(periodic(g, m, 3, alpha, false), 1) : randWord(g, m, alpha); return `${t}\n${p}\n`; };
      crossCheck(() => make(randInt(g, 1, 14), randInt(g, 1, 6), 'ab', 'random'), (i) => this.solve(i), brute, 1000);
      crossCheck(() => make(randInt(g, 6, 20), randInt(g, 1, 6), 'ab', 'periodic'), (i) => this.solve(i), brute, 600);
      for (const [n, m, alpha, mode] of [[30, 4, 'ab', 'random'], [1000, 7, 'ab', 'periodic'], [100000, 3, 'ab', 'random'], [100000, 20, 'ab', 'periodic'], [100000, 50000, 'ab', 'periodic'], [100000, 1000, 'a', 'random'], [100000, 99999 > 50000 ? 50000 : 5, 'abc', 'sub'], [99999, 30, 'abcdefghijklmnopqrstuvwxyz', 'random'], [100000, 500, 'ab', 'sub'], [60000, 50000, 'a', 'random']]) out.push(make(n, m, alpha, mode));
      out.push(`${'a'.repeat(100000)}\n${'a'.repeat(49999)}b\n`, `${'ab'.repeat(50000)}\n${'ab'.repeat(25000)}\n`);
      return out;
    }
  }
];
