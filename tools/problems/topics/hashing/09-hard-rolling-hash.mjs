import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };

// ---- A suffix automaton: exact answers for the reference solutions (substring questions without any hashing) ----
function buildSam(s) {
  const n = s.length, maxStates = 2 * n + 2;
  const len = new Int32Array(maxStates), link = new Int32Array(maxStates).fill(-1), cnt = new Int32Array(maxStates);
  const next = Array.from({ length: maxStates }, () => new Int32Array(26).fill(-1));
  let size = 1, last = 0;
  for (const ch of s) {
    const c = ch.charCodeAt(0) - 97, cur = size++;
    len[cur] = len[last] + 1; cnt[cur] = 1;
    let p = last;
    while (p !== -1 && next[p][c] === -1) { next[p][c] = cur; p = link[p]; }
    if (p === -1) link[cur] = 0;
    else {
      const q = next[p][c];
      if (len[p] + 1 === len[q]) link[cur] = q;
      else {
        const clone = size++;
        len[clone] = len[p] + 1; next[clone].set(next[q]); link[clone] = link[q];
        while (p !== -1 && next[p][c] === q) { next[p][c] = clone; p = link[p]; }
        link[q] = link[cur] = clone;
      }
    }
    last = cur;
  }
  const order = Array.from({ length: size }, (_, i) => i).sort((a, b) => len[b] - len[a]);
  for (const v of order) if (link[v] >= 0) cnt[link[v]] += cnt[v];
  return { size, len, link, cnt, next };
}
const longestRepeated = (s) => { const m = buildSam(s); let best = 0; for (let v = 1; v < m.size; v++) if (m.cnt[v] >= 2) best = Math.max(best, m.len[v]); return best; };
const distinctSubstrings = (s) => { const m = buildSam(s); let d = 0; for (let v = 1; v < m.size; v++) d += m.len[v] - m.len[m.link[v]]; return d; };
const longestCommon = (a, b) => { const m = buildSam(a); let v = 0, l = 0, best = 0; for (const ch of b) { const c = ch.charCodeAt(0) - 97; while (v !== 0 && m.next[v][c] === -1) { v = m.link[v]; l = m.len[v]; } if (m.next[v][c] !== -1) { v = m.next[v][c]; l++; } best = Math.max(best, l); } return best; };

// ---- Shared helper code of the programs: a double polynomial hash of a word, giving one 62-bit key for every block ----
const HASH_PY = r`
  M1, M2 = 1000000007, 998244353
  B1, B2 = 911382323, 972663749


  def build_hash(s):
      n = len(s)
      h1 = [0] * (n + 1)
      h2 = [0] * (n + 1)
      p1 = [1] * (n + 1)
      p2 = [1] * (n + 1)
      for i, ch in enumerate(s):
          v = ord(ch) - 96
          h1[i + 1] = (h1[i] * B1 + v) % M1
          h2[i + 1] = (h2[i] * B2 + v) % M2
          p1[i + 1] = p1[i] * B1 % M1
          p2[i + 1] = p2[i] * B2 % M2
      return h1, h2, p1, p2


  def sub_key(hash_data, l, r):
      h1, h2, p1, p2 = hash_data
      a = (h1[r] - h1[l] * p1[r - l]) % M1
      b = (h2[r] - h2[l] * p2[r - l]) % M2
      return a * M2 + b`;
const HASH_CPP = r`
  const long long M1 = 1000000007LL, M2 = 998244353LL, B1 = 911382323LL, B2 = 972663749LL;

  struct Hasher {
      vector<long long> h1, h2, p1, p2;

      Hasher(const string& s) : h1(s.size() + 1, 0), h2(s.size() + 1, 0), p1(s.size() + 1, 1), p2(s.size() + 1, 1) {
          for (size_t i = 0; i < s.size(); i++) {
              long long v = s[i] - 'a' + 1;
              h1[i + 1] = (h1[i] * B1 + v) % M1;
              h2[i + 1] = (h2[i] * B2 + v) % M2;
              p1[i + 1] = p1[i] * B1 % M1;
              p2[i + 1] = p2[i] * B2 % M2;
          }
      }

      long long key(int l, int r) const {
          long long a = ((h1[r] - h1[l] * p1[r - l]) % M1 + M1) % M1;
          long long b = ((h2[r] - h2[l] * p2[r - l]) % M2 + M2) % M2;
          return a * M2 + b;
      }
  };`;
const HASH_JAVA = r`
  static final long M1 = 1000000007L, M2 = 998244353L, B1 = 911382323L, B2 = 972663749L;

  static class Hasher {
      long[] h1, h2, p1, p2;

      Hasher(String s) {
          int n = s.length();
          h1 = new long[n + 1];
          h2 = new long[n + 1];
          p1 = new long[n + 1];
          p2 = new long[n + 1];
          p1[0] = 1;
          p2[0] = 1;
          for (int i = 0; i < n; i++) {
              long v = s.charAt(i) - 'a' + 1;
              h1[i + 1] = (h1[i] * B1 + v) % M1;
              h2[i + 1] = (h2[i] * B2 + v) % M2;
              p1[i + 1] = p1[i] * B1 % M1;
              p2[i + 1] = p2[i] * B2 % M2;
          }
      }

      long key(int l, int r) {
          long a = ((h1[r] - h1[l] * p1[r - l]) % M1 + M1) % M1;
          long b = ((h2[r] - h2[l] * p2[r - l]) % M2 + M2) % M2;
          return a * M2 + b;
      }
  }`;
const ROLLING_CONCEPT = [
  'Comparing two blocks of a word letter by letter costs as much as their length. A **polynomial rolling hash** turns every block into a number in O(1) after one preparation pass. Treat the letters as digits of a number in some base `B` (modulo a big prime `M`): `hash(s[l..r)) = s[l]*B^(r-l-1) + ... + s[r-1]`.',
  { code: 'h[i + 1] = (h[i] * B + value(s[i])) % M        # prefix hashes, one pass\nblock(l, r) = (h[r] - h[l] * B^(r - l)) % M       # O(1) for any block' },
  'Equal blocks always have equal hashes. Different blocks have different hashes with very high probability, and using **two moduli at once** makes a collision practically impossible (the two values are packed into one 62-bit number). With such keys, blocks can be put into hash sets and compared in O(1).'
];

export default [
  {
    slug: 'longest-repeated-substring',
    title: 'Longest Substring That Occurs Twice',
    difficulty: 'hard',
    tags: ['hashing', 'rolling-hash', 'binary-search', 'strings'],
    concept: {
      title: 'Binary search on the length, a hash set for the check',
      body: [
        ...ROLLING_CONCEPT,
        'Now the question: what is the longest block that occurs at least twice (the two occurrences may overlap)? If a block of length `L` occurs twice, then so does every shorter block (cut a letter off both copies). So the answer can be found by **binary search on the length**: for a given `L`, put the keys of all blocks of length `L` into a set and look for a repeated key.',
        'Each check costs O(n), and the binary search needs about `log2(n)` checks: O(n log n) in total, instead of comparing all pairs of blocks.'
      ]
    },
    statement: ['Given a word, find the length of the longest block of consecutive letters that occurs at least twice in the word. The two occurrences may overlap. If no block occurs twice, print 0.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the length.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'banana\n', note: 'The block ana occurs at positions 1 and 3 (they overlap).' }, { input: 'abcd\n', note: 'No block occurs twice.' }],
    hints: ['If a block of length L occurs twice, so does every shorter block: use binary search on L.', 'To test a length, put the keys of all blocks of that length into a set; a key that is already in the set is a repeat.', 'Use a rolling hash so that the key of a block costs O(1).'],
    program: {
      io: ['s:word'],
      includes: ['<unordered_set>'],
      helpers: { python: HASH_PY, cpp: HASH_CPP, java: HASH_JAVA },
      python: r`
        n = len(s)
        data = build_hash(s)
        lo, hi = 0, n - 1
        while lo < hi:
            mid = (lo + hi + 1) // 2
            seen = set()
            found = False
            for i in range(n - mid + 1):
                key = sub_key(data, i, i + mid)
                if key in seen:
                    found = True
                    break
                seen.add(key)
            if found:
                lo = mid
            else:
                hi = mid - 1
        print(lo)`,
      cpp: r`
        int n = s.size();
        Hasher hasher(s);
        int lo = 0, hi = n - 1;
        while (lo < hi) {
            int mid = (lo + hi + 1) / 2;
            unordered_set<long long> seen;
            bool found = false;
            for (int i = 0; i + mid <= n && !found; i++) {
                if (!seen.insert(hasher.key(i, i + mid)).second) found = true;
            }
            if (found) lo = mid;
            else hi = mid - 1;
        }
        cout << lo << "\n";`,
      java: r`
        int n = s.length();
        Hasher hasher = new Hasher(s);
        int lo = 0, hi = n - 1;
        while (lo < hi) {
            int mid = (lo + hi + 1) / 2;
            Set<Long> seen = new HashSet<>();
            boolean found = false;
            for (int i = 0; i + mid <= n && !found; i++) {
                if (!seen.add(hasher.key(i, i + mid))) found = true;
            }
            if (found) lo = mid;
            else hi = mid - 1;
        }
        System.out.println(lo);`
    },
    solution: { explanation: ['The property "some block of length L occurs twice" is monotone in L, so binary search finds the longest such L. Each check puts the rolling-hash keys of all blocks of that length into a set.'], complexity: 'Time O(n log n) on average, space O(n).' },
    solve(input) { return String(longestRepeated(input.trim())); },
    tests() {
      const g = rng(401);
      const brute = (i) => { const s = i.trim(); let best = 0; for (let L = 1; L < s.length; L++) { const seen = new Set(); for (let k = 0; k + L <= s.length; k++) { const b = s.slice(k, k + L); if (seen.has(b)) { best = L; break; } seen.add(b); } } return best; };
      crossCheck(() => `${randWord(g, randInt(g, 1, 14), 'ab')}\n`, (i) => this.solve(i), brute);
      const x = randWord(g, 5000, LOW);
      return ['banana\n', 'abcd\n', 'a\n', 'aa\n', 'abcabc\n', `${randWord(g, 40, 'abc')}\n`, `${randWord(g, 20000, 'ab')}\n`, `${randWord(g, 20000, LOW)}\n`, `${'a'.repeat(20000)}\n`, `${x}${randWord(g, 5000, LOW)}${x}\n`, `${'ab'.repeat(10000)}\n`, `${randWord(g, 9999, 'abc')}z${randWord(g, 9999, 'abc')}\n`];
    }
  },

  {
    slug: 'count-distinct-substrings',
    title: 'Count the Different Substrings',
    difficulty: 'hard',
    tags: ['hashing', 'rolling-hash', 'strings', 'counting'],
    concept: {
      title: 'Every block gets a key, equal keys are one substring',
      body: [
        ...ROLLING_CONCEPT,
        'A word of length `n` has `n * (n + 1) / 2` blocks, but many of them are equal. Give **every block** its key and count the **different keys**: put them all in a set, or write them into an array, sort it and count the runs of equal numbers.',
        'Storing the blocks themselves as strings would need `O(n^3)` memory. Storing one 62-bit number per block needs only `O(n^2)` numbers, which is the reason to use hashing here. (Suffix structures count them even faster, but this method is the simplest to write.)'
      ]
    },
    statement: ['Count the different non-empty substrings (blocks of consecutive letters) of a word. Two blocks that consist of the same letters in the same order count as one substring, wherever they are in the word.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the number of different substrings.'],
    constraints: ['1 <= length <= 1500'],
    examples: [{ input: 'abab\n', note: 'The different substrings are a, b, ab, ba, aba, bab and abab: 7.' }],
    hints: ['Every block `s[i..j)` needs a key that is cheap to compute: use a rolling hash.', 'Collect the keys of all blocks of all lengths.', 'The answer is the number of different keys (a set, or sort and count runs).'],
    program: {
      io: ['s:word'],
      includes: ['<algorithm>'],
      helpers: { python: HASH_PY, cpp: HASH_CPP, java: HASH_JAVA },
      python: r`
        n = len(s)
        data = build_hash(s)
        seen = set()
        for i in range(n):
            for j in range(i + 1, n + 1):
                seen.add(sub_key(data, i, j))
        print(len(seen))`,
      cpp: r`
        int n = s.size();
        Hasher hasher(s);
        vector<long long> keys;
        keys.reserve((long long) n * (n + 1) / 2);
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j <= n; j++) keys.push_back(hasher.key(i, j));
        }
        sort(keys.begin(), keys.end());
        long long distinct = 0;
        for (size_t i = 0; i < keys.size(); i++) {
            if (i == 0 || keys[i] != keys[i - 1]) distinct++;
        }
        cout << distinct << "\n";`,
      java: r`
        int n = s.length();
        Hasher hasher = new Hasher(s);
        long[] keys = new long[n * (n + 1) / 2];
        int count = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j <= n; j++) keys[count++] = hasher.key(i, j);
        }
        Arrays.sort(keys);
        long distinct = 0;
        for (int i = 0; i < keys.length; i++) {
            if (i == 0 || keys[i] != keys[i - 1]) distinct++;
        }
        System.out.println(distinct);`
    },
    solution: { explanation: ['Every block has a rolling-hash key; the number of different keys is the number of different substrings.'], complexity: 'Time O(n^2) (plus sorting), space O(n^2).' },
    solve(input) { return String(distinctSubstrings(input.trim())); },
    tests() {
      const g = rng(402);
      const brute = (i) => { const s = i.trim(); const set = new Set(); for (let a = 0; a < s.length; a++) for (let b = a + 1; b <= s.length; b++) set.add(s.slice(a, b)); return set.size; };
      crossCheck(() => `${randWord(g, randInt(g, 1, 12), 'abc')}\n`, (i) => this.solve(i), brute);
      return ['abab\n', 'a\n', 'aaaa\n', 'abc\n', `${randWord(g, 40, 'ab')}\n`, `${randWord(g, 400, 'abc')}\n`, `${randWord(g, 1500, LOW)}\n`, `${'a'.repeat(1500)}\n`, `${'ab'.repeat(750)}\n`, `${randWord(g, 1500, 'ab')}\n`, `${randWord(g, 100, 'abc').repeat(15)}\n`];
    }
  },

  {
    slug: 'longest-common-substring',
    title: 'Longest Common Block of Two Words',
    difficulty: 'hard',
    tags: ['hashing', 'rolling-hash', 'binary-search', 'strings'],
    concept: {
      title: 'Binary search on the length, keys of both words',
      body: [
        ...ROLLING_CONCEPT,
        'The longest block that occurs in **both** words has the same monotone property as before: if a block of length `L` is common, so is every shorter one. Binary search on `L`: put the keys of all blocks of length `L` of the first word into a set, and look for any block of the second word with a key in the set.',
        'The two words are hashed with the **same** base and moduli, so equal blocks get equal keys even though they come from different words.'
      ]
    },
    statement: ['Given two words `a` and `b`, find the length of the longest block of consecutive letters that occurs in both words. If they have no letter in common, print 0.'],
    inputFormat: ['The first line has `a`.', 'The second line has `b`.'],
    outputFormat: ['Print the length.'],
    constraints: ['1 <= length of a, b <= 20000', 'Both words contain lowercase letters.'],
    examples: [{ input: 'xabcdy\nzzbcdzz\n', note: 'The common block is bcd.' }],
    hints: ['If a block of length L is common, every shorter one is too.', 'For a length L, put the keys of the blocks of `a` into a set.', 'Check whether any block of length L of `b` has a key in the set.'],
    program: {
      io: ['a:word', 'b:word'],
      includes: ['<unordered_set>', '<algorithm>'],
      helpers: { python: HASH_PY, cpp: HASH_CPP, java: HASH_JAVA },
      python: r`
        n, m = len(a), len(b)
        da = build_hash(a)
        db = build_hash(b)
        lo, hi = 0, min(n, m)
        while lo < hi:
            mid = (lo + hi + 1) // 2
            keys = {sub_key(da, i, i + mid) for i in range(n - mid + 1)}
            found = any(sub_key(db, j, j + mid) in keys for j in range(m - mid + 1))
            if found:
                lo = mid
            else:
                hi = mid - 1
        print(lo)`,
      cpp: r`
        int n = a.size(), m = b.size();
        Hasher ha(a), hb(b);
        int lo = 0, hi = min(n, m);
        while (lo < hi) {
            int mid = (lo + hi + 1) / 2;
            unordered_set<long long> keys;
            for (int i = 0; i + mid <= n; i++) keys.insert(ha.key(i, i + mid));
            bool found = false;
            for (int j = 0; j + mid <= m && !found; j++) {
                if (keys.count(hb.key(j, j + mid))) found = true;
            }
            if (found) lo = mid;
            else hi = mid - 1;
        }
        cout << lo << "\n";`,
      java: r`
        int n = a.length(), m = b.length();
        Hasher ha = new Hasher(a), hb = new Hasher(b);
        int lo = 0, hi = Math.min(n, m);
        while (lo < hi) {
            int mid = (lo + hi + 1) / 2;
            Set<Long> keys = new HashSet<>();
            for (int i = 0; i + mid <= n; i++) keys.add(ha.key(i, i + mid));
            boolean found = false;
            for (int j = 0; j + mid <= m && !found; j++) {
                if (keys.contains(hb.key(j, j + mid))) found = true;
            }
            if (found) lo = mid;
            else hi = mid - 1;
        }
        System.out.println(lo);`
    },
    solution: { explanation: ['Being a common block is monotone in the length. For each tested length the keys of the first word are stored in a set and the blocks of the second word are looked up.'], complexity: 'Time O((n + m) log(min(n, m))) on average, space O(n).' },
    solve(input) { const [a, b] = rows(input); return String(longestCommon(a, b)); },
    tests() {
      const g = rng(403);
      const brute = (i) => { const [a, b] = rows(i); let best = 0; for (let x = 0; x < a.length; x++) for (let y = 0; y < b.length; y++) { let k = 0; while (x + k < a.length && y + k < b.length && a[x + k] === b[y + k]) k++; best = Math.max(best, k); } return best; };
      crossCheck(() => `${randWord(g, randInt(g, 1, 12), 'abc')}\n${randWord(g, randInt(g, 1, 12), 'abc')}\n`, (i) => this.solve(i), brute);
      const core = randWord(g, 7000, LOW);
      return ['xabcdy\nzzbcdzz\n', 'a\na\n', 'a\nb\n', 'abc\nabc\n', 'abcdef\nfedcba\n', `${randWord(g, 30, 'ab')}\n${randWord(g, 30, 'ab')}\n`, `${randWord(g, 20000, 'ab')}\n${randWord(g, 20000, 'ab')}\n`, `${randWord(g, 20000, LOW)}\n${randWord(g, 20000, LOW)}\n`, `${'a'.repeat(20000)}\n${'a'.repeat(15000)}\n`, `${randWord(g, 6000, 'abc')}${core}${randWord(g, 7000, 'abc')}\n${randWord(g, 3000, 'abc')}${core}${randWord(g, 9000, 'abc')}\n`, `${randWord(g, 20000, 'abcd')}\n${randWord(g, 20000, 'wxyz')}\n`];
    }
  },

  {
    slug: 'shortest-palindrome-by-prepending',
    title: 'Shortest Palindrome by Adding Letters in Front',
    difficulty: 'hard',
    tags: ['hashing', 'rolling-hash', 'palindrome', 'strings'],
    concept: {
      title: 'Find the longest palindrome at the start',
      body: [
        'You may add letters only at the **front** of the word. Suppose the longest prefix of the word that is already a palindrome has length `p`. The remaining letters `s[p..]` are not covered, so the best you can do is to copy them in reverse order to the front: the result is `reverse(s[p:]) + s`. A longer palindromic prefix means fewer letters to add.',
        'To find `p` fast, compare **hashes**: the prefix `s[0..i)` is a palindrome exactly when it equals its own reversal. The reversal of that prefix is a block of the reversed word, namely `rs[n-i..n)`. So prefix `i` is a palindrome when `hash(s[0..i)) == hash(rs[n-i..n))`. Try `i` from `n` down to 1 and stop at the first success.',
        { code: 'rs = s[::-1]\nfor i in range(n, 0, -1):\n    if key(s, 0, i) == key(rs, n - i, n):\n        p = i; break\nanswer = s[p:][::-1] + s' },
        'The one-letter prefix is always a palindrome, so the loop always stops. With hashing each test costs O(1); the whole search is O(n).'
      ]
    },
    statement: ['You may add letters only at the beginning of a word. Print the shortest palindrome you can make this way.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the shortest palindrome that ends with the given word.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'aacecaaa\n', note: 'The prefix aacecaa is a palindrome; add one `a` in front: aaacecaaa.' }, { input: 'abcd\n', note: 'Only a is a palindromic prefix: add dcb in front.' }],
    hints: ['Find the longest prefix of the word that is a palindrome.', 'The letters after that prefix, reversed, go to the front.', 'A prefix is a palindrome when its hash equals the hash of the matching block of the reversed word.'],
    program: {
      io: ['s:word'],
      includes: ['<algorithm>'],
      helpers: { python: HASH_PY, cpp: HASH_CPP, java: HASH_JAVA },
      python: r`
        n = len(s)
        rs = s[::-1]
        da = build_hash(s)
        db = build_hash(rs)
        p = 1
        for i in range(n, 0, -1):
            if sub_key(da, 0, i) == sub_key(db, n - i, n):
                p = i
                break
        print(s[p:][::-1] + s)`,
      cpp: r`
        int n = s.size();
        string rs(s.rbegin(), s.rend());
        Hasher ha(s), hb(rs);
        int p = 1;
        for (int i = n; i >= 1; i--) {
            if (ha.key(0, i) == hb.key(n - i, n)) {
                p = i;
                break;
            }
        }
        string front = s.substr(p);
        reverse(front.begin(), front.end());
        cout << front + s << "\n";`,
      java: r`
        int n = s.length();
        String rs = new StringBuilder(s).reverse().toString();
        Hasher ha = new Hasher(s), hb = new Hasher(rs);
        int p = 1;
        for (int i = n; i >= 1; i--) {
            if (ha.key(0, i) == hb.key(n - i, n)) {
                p = i;
                break;
            }
        }
        System.out.println(new StringBuilder(s.substring(p)).reverse() + s);`
    },
    solution: { explanation: ['The longest palindromic prefix is found by comparing the hash of each prefix with the hash of its reversal; the rest of the word, reversed, is put in front.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const s = input.trim(); const t = s + '#' + [...s].reverse().join(''); const f = new Array(t.length).fill(0); for (let i = 1; i < t.length; i++) { let k = f[i - 1]; while (k > 0 && t[i] !== t[k]) k = f[k - 1]; if (t[i] === t[k]) k++; f[i] = k; } const p = f[t.length - 1]; return [...s.slice(p)].reverse().join('') + s; },
    tests() {
      const g = rng(404);
      const brute = (i) => { const s = i.trim(); for (let p = s.length; p >= 1; p--) { const pre = s.slice(0, p); if (pre === [...pre].reverse().join('')) return [...s.slice(p)].reverse().join('') + s; } return s; };
      crossCheck(() => `${randWord(g, randInt(g, 1, 10), 'ab')}\n`, (i) => this.solve(i), brute);
      const half = randWord(g, 9000, 'abc');
      return ['aacecaaa\n', 'abcd\n', 'a\n', 'aa\n', 'ab\n', 'abab\n', `${randWord(g, 40, 'ab')}\n`, `${randWord(g, 20000, 'ab')}\n`, `${randWord(g, 20000, LOW)}\n`, `${'a'.repeat(20000)}\n`, `${half}${[...half].reverse().join('')}xyz\n`, `${half}c${[...half].reverse().join('')}\n`];
    }
  },

  {
    slug: 'find-substring-with-hash-value',
    title: 'Find the Block With a Given Hash',
    difficulty: 'hard',
    tags: ['hashing', 'rolling-hash', 'modular-arithmetic', 'strings'],
    concept: {
      title: 'Roll the hash from the right, so that nothing has to be divided',
      body: [
        'Here the hash is defined for you: for a block `t` of length `k`, `hash(t) = t[0]*p^0 + t[1]*p^1 + ... + t[k-1]*p^(k-1) (mod m)`, where a = 1, b = 2, ..., z = 26. You are given `p`, `m`, `k` and a target value, and must find the **first** block of `s` of length `k` with exactly this hash.',
        'Rolling from the left would need a division by `p` (a modular inverse, which does not exist for every `m`). Roll from the **right** instead. Let `H_i = s[i] + s[i+1]*p + s[i+2]*p^2 + ...` over the whole suffix starting at `i`. Then `H_i = s[i] + p * H_(i+1)`. The window `[i, i+k)` is `H_i` without the terms from position `i+k` on, and the first removed term is `s[i+k] * p^k`.',
        { code: 'h = 0\nfor i in range(n - 1, -1, -1):\n    h = (h * p + val(s[i])) % m\n    if i + k < n:\n        h = (h - val(s[i + k]) * p**k) % m      # drop the letter that left the window\n    if i + k <= n and h == target:\n        answer = i                                # the last assignment is the smallest i' },
        'Because the scan goes from right to left, the last block that matches has the smallest start position.'
      ]
    },
    statement: ['The hash of a block `t` of length `k` is `t[0] * p^0 + t[1] * p^1 + ... + t[k-1] * p^(k-1)`, taken modulo `m`, where the letter a has the value 1, b has 2, ..., z has 26. Given the word `s` and the numbers `p`, `m`, `k` and `target`, find the block of length `k` of `s` with the smallest starting position (counting from 0) whose hash equals `target`. Such a block exists.'],
    inputFormat: ['The first line has the word `s`.', 'The second line has `p`, `m`, `k` and `target`.'],
    outputFormat: ['Print the starting position of the first matching block.'],
    constraints: ['1 <= k <= length of s <= 20000', '1 <= p < m <= 10^9 (m need not be prime)', '0 <= target < m', 'A matching block exists.'],
    examples: [{ input: 'leetcode\n7 20 2 0\n', note: 'The block `ee` has hash 5 + 5 * 7 = 40, which is 0 modulo 20. It starts at position 1.' }],
    hints: ['Dividing by p is not always possible modulo m, so roll the hash from the right end.', 'The suffix hash satisfies `H_i = s[i] + p * H_(i+1)`.', 'When the window moves left, remove the term of the letter at `i + k`, which has the factor `p^k` in the suffix hash.'],
    program: {
      io: ['s:word', 'p:int m:int k:int target:int'],
      python: r`
        n = len(s)
        pk = pow(p, k, m)
        h = 0
        answer = -1
        for i in range(n - 1, -1, -1):
            h = (h * p + ord(s[i]) - 96) % m
            if i + k < n:
                h = (h - (ord(s[i + k]) - 96) * pk) % m
            if i + k <= n and h == target:
                answer = i
        print(answer)`,
      cpp: r`
        int n = s.size();
        long long pk = 1;
        for (int i = 0; i < k; i++) pk = pk * p % m;
        long long h = 0;
        int answer = -1;
        for (int i = n - 1; i >= 0; i--) {
            h = (h * p + (s[i] - 'a' + 1)) % m;
            if (i + k < n) h = ((h - (s[i + k] - 'a' + 1) * pk) % m + m) % m;
            if (i + k <= n && h == target) answer = i;
        }
        cout << answer << "\n";`,
      java: r`
        int n = s.length();
        long pk = 1;
        for (int i = 0; i < k; i++) pk = pk * p % m;
        long h = 0;
        int answer = -1;
        for (int i = n - 1; i >= 0; i--) {
            h = (h * p + (s.charAt(i) - 'a' + 1)) % m;
            if (i + k < n) h = ((h - (s.charAt((int) (i + k)) - 'a' + 1) * pk) % m + m) % m;
            if (i + k <= n && h == target) answer = i;
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['The suffix hash is rolled from right to left; the term of the letter that leaves the window is removed with the factor `p^k`. The last matching window of the scan has the smallest start.'], complexity: 'Time O(n + k), space O(1).' },
    solve(input) { const [s, line] = rows(input); const [p, m, k, target] = nums(line).map(BigInt); const n = s.length; const K = Number(k); let pk = 1n; for (let i = 0; i < K; i++) pk = (pk * p) % m; let h = 0n, ans = -1; for (let i = n - 1; i >= 0; i--) { h = (h * p + BigInt(s.charCodeAt(i) - 96)) % m; if (i + K < n) h = (((h - BigInt(s.charCodeAt(i + K) - 96) * pk) % m) + m) % m; if (i + K <= n && h === target) ans = i; } return String(ans); },
    tests() {
      const g = rng(405);
      const direct = (s, i, k, p, m) => { let h = 0n, pw = 1n; for (let j = 0; j < k; j++) { h = (h + BigInt(s.charCodeAt(i + j) - 96) * pw) % m; pw = (pw * p) % m; } return h; };
      const make = (n, k, p, m, alpha) => { const s = randWord(g, n, alpha); const at = randInt(g, 0, n - k); return `${s}\n${p} ${m} ${k} ${direct(s, at, k, BigInt(p), BigInt(m))}\n`; };
      const brute = (input) => { const [s, line] = rows(input); const [p, m, k, target] = nums(line); for (let i = 0; i + k <= s.length; i++) if (direct(s, i, k, BigInt(p), BigInt(m)) === BigInt(target)) return i; return -1; };
      crossCheck(() => { const n = randInt(g, 2, 12); return make(n, randInt(g, 1, n), randInt(g, 1, 9), randInt(g, 10, 60), 'abc'); }, (i) => this.solve(i), brute, 150);
      return ['leetcode\n7 20 2 0\n', 'a\n1 2 1 1\n', make(10, 3, 7, 20, 'ab'), make(200, 20, 31, 1000000007, LOW), make(20000, 10, 911382323, 998244353, LOW), make(20000, 10000, 31, 1000000000, LOW), make(20000, 5000, 1000, 1024, 'ab'), make(20000, 1, 999999999, 1000000000, LOW), make(20000, 20000, 17, 999999937, LOW)];
    }
  },

  {
    slug: 'distinct-doubled-substrings',
    title: 'Different Substrings of the Form xx',
    difficulty: 'hard',
    tags: ['hashing', 'rolling-hash', 'strings', 'counting'],
    concept: {
      title: 'Compare the two halves with one key each',
      body: [
        ...ROLLING_CONCEPT,
        'A **doubled** substring is a block `xx`: a non-empty block `x` written twice in a row, like `abcabc`. For each half-length `L` and each start `i`, the blocks `s[i..i+L)` and `s[i+L..i+2L)` are equal exactly when their keys are equal, which costs O(1) instead of O(L).',
        { code: 'for L in range(1, n // 2 + 1):\n    for i in range(n - 2 * L + 1):\n        if key(i, i + L) == key(i + L, i + 2 * L):\n            found.add(key(i, i + 2 * L))' },
        'To count each different doubled substring only once, store the key of the whole block `xx` in a set. There are about `n^2 / 4` candidates, so the method is O(n^2) with a very small constant.'
      ]
    },
    statement: ['A substring is **doubled** if it is a non-empty block written twice in a row, such as `abab` or `aa`. Count the different doubled substrings of a word: the same text found in several places counts once.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the number of different doubled substrings.'],
    constraints: ['1 <= length <= 1500'],
    examples: [{ input: 'abcabcabc\n', note: 'abcabc, bcabca and cabcab: 3 different doubled substrings.' }, { input: 'leetcodeleetcode\n', note: 'The different doubled substrings are ee and leetcodeleetcode.' }],
    hints: ['For a half-length L and a start i, compare the keys of the two halves.', 'Two halves with equal keys make a doubled substring.', 'Put the key of the whole block into a set so that equal blocks count once.'],
    program: {
      io: ['s:word'],
      includes: ['<unordered_set>'],
      helpers: { python: HASH_PY, cpp: HASH_CPP, java: HASH_JAVA },
      python: r`
        n = len(s)
        data = build_hash(s)
        found = set()
        for L in range(1, n // 2 + 1):
            for i in range(n - 2 * L + 1):
                if sub_key(data, i, i + L) == sub_key(data, i + L, i + 2 * L):
                    found.add(sub_key(data, i, i + 2 * L))
        print(len(found))`,
      cpp: r`
        int n = s.size();
        Hasher hasher(s);
        unordered_set<long long> found;
        for (int L = 1; 2 * L <= n; L++) {
            for (int i = 0; i + 2 * L <= n; i++) {
                if (hasher.key(i, i + L) == hasher.key(i + L, i + 2 * L)) found.insert(hasher.key(i, i + 2 * L));
            }
        }
        cout << found.size() << "\n";`,
      java: r`
        int n = s.length();
        Hasher hasher = new Hasher(s);
        Set<Long> found = new HashSet<>();
        for (int L = 1; 2 * L <= n; L++) {
            for (int i = 0; i + 2 * L <= n; i++) {
                if (hasher.key(i, i + L) == hasher.key(i + L, i + 2 * L)) found.add(hasher.key(i, i + 2 * L));
            }
        }
        System.out.println(found.size());`
    },
    solution: { explanation: ['For each half-length and start, equal keys of the two halves identify a doubled substring; the key of the whole block goes into a set to count it once.'], complexity: 'Time O(n^2) on average, space O(number of different doubled substrings).' },
    solve(input) { const s = input.trim(); const found = new Set(); for (let L = 1; 2 * L <= s.length; L++) for (let i = 0; i + 2 * L <= s.length; i++) if (s.startsWith(s.slice(i, i + L), i + L)) found.add(s.slice(i, i + 2 * L)); return String(found.size); },
    tests() { const g = rng(406); return ['abcabcabc\n', 'leetcodeleetcode\n', 'a\n', 'aa\n', 'abab\n', `${randWord(g, 40, 'ab')}\n`, `${randWord(g, 400, 'ab')}\n`, `${randWord(g, 1500, 'ab')}\n`, `${randWord(g, 1500, LOW)}\n`, `${'a'.repeat(1500)}\n`, `${randWord(g, 30, 'abc').repeat(50)}\n`]; }
  },

  {
    slug: 'anagram-block-pairs',
    title: 'Pairs of Blocks That Are Anagrams',
    difficulty: 'hard',
    tags: ['hashing', 'zobrist-hash', 'counting', 'strings'],
    concept: {
      title: 'A hash that does not depend on the order of the letters',
      body: [
        'Two blocks are anagrams when they have the same letter counts. A rolling hash that depends on letter **order** is no help here. Instead give every letter a **random-looking 64-bit number** `val[c]` and define the key of a block as the **sum** of the values of its letters (modulo 2^64). A sum does not care about order, so anagrams get equal keys. Different letter counts give different sums with overwhelming probability.',
        { code: 'val[c] = mix(c + 1)               # a scrambling function makes the 26 numbers look random\nwindow += val[new letter] - val[old letter]   # sliding the block by one: O(1)' },
        'This is called **Zobrist hashing**. For every block length `L`, slide a block over the word, collect the keys, and count the groups of equal keys: a group of `c` equal keys gives `c * (c - 1) / 2` pairs. The "scrambling function" is needed: with plain numbers such as 1, 2, 3 the sums of different letter counts collide all the time.'
      ]
    },
    statement: ['Count the pairs of blocks of consecutive letters that have the same length, start at different positions, and are anagrams of each other (they consist of the same letters with the same counts, in any order). Blocks may overlap. Block lengths from 1 up to the length of the word minus 1 are considered.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the number of pairs.'],
    constraints: ['1 <= length <= 1500'],
    examples: [{ input: 'abba\n', note: 'Length 1: the two a and the two b give 2 pairs. Length 2: ab, bb, ba: ab and ba are anagrams: 1 pair. Length 3: abb and bba: 1 pair. Total 4.' }],
    hints: ['A block key must not depend on the order of the letters: use the sum of a random number per letter.', 'For each length, slide a block over the word and keep the key up to date in O(1).', 'For every group of `c` equal keys add `c * (c - 1) / 2` pairs.'],
    program: {
      io: ['s:word'],
      includes: ['<algorithm>', '<unordered_map>'],
      helpers: {
        python: r`
          MASK = (1 << 64) - 1


          def mix(x):
              x = (x + 0x9E3779B97F4A7C15) & MASK
              x = ((x ^ (x >> 30)) * 0xBF58476D1CE4E5B9) & MASK
              x = ((x ^ (x >> 27)) * 0x94D049BB133111EB) & MASK
              return x ^ (x >> 31)`,
        cpp: r`
          unsigned long long mix(unsigned long long x) {
              x += 0x9E3779B97F4A7C15ULL;
              x = (x ^ (x >> 30)) * 0xBF58476D1CE4E5B9ULL;
              x = (x ^ (x >> 27)) * 0x94D049BB133111EBULL;
              return x ^ (x >> 31);
          }`,
        java: r`
          static long mix(long x) {
              x += 0x9E3779B97F4A7C15L;
              x = (x ^ (x >>> 30)) * 0xBF58476D1CE4E5B9L;
              x = (x ^ (x >>> 27)) * 0x94D049BB133111EBL;
              return x ^ (x >>> 31);
          }`
      },
      python: r`
        n = len(s)
        val = [mix(c + 1) for c in range(26)]
        total = 0
        for L in range(1, n):
            window = 0
            for j in range(L):
                window = (window + val[ord(s[j]) - 97]) & MASK
            count = {window: 1}
            for i in range(1, n - L + 1):
                window = (window + val[ord(s[i + L - 1]) - 97] - val[ord(s[i - 1]) - 97]) & MASK
                count[window] = count.get(window, 0) + 1
            for c in count.values():
                total += c * (c - 1) // 2
        print(total)`,
      cpp: r`
        int n = s.size();
        unsigned long long val[26];
        for (int c = 0; c < 26; c++) val[c] = mix(c + 1);
        long long total = 0;
        vector<unsigned long long> keys;
        for (int L = 1; L < n; L++) {
            keys.clear();
            unsigned long long window = 0;
            for (int j = 0; j < L; j++) window += val[s[j] - 'a'];
            keys.push_back(window);
            for (int i = 1; i + L <= n; i++) {
                window += val[s[i + L - 1] - 'a'] - val[s[i - 1] - 'a'];
                keys.push_back(window);
            }
            sort(keys.begin(), keys.end());
            size_t a = 0;
            while (a < keys.size()) {
                size_t b = a;
                while (b < keys.size() && keys[b] == keys[a]) b++;
                long long c = b - a;
                total += c * (c - 1) / 2;
                a = b;
            }
        }
        cout << total << "\n";`,
      java: r`
        int n = s.length();
        long[] val = new long[26];
        for (int c = 0; c < 26; c++) val[c] = mix(c + 1);
        long total = 0;
        long[] keys = new long[n];
        for (int L = 1; L < n; L++) {
            int count = 0;
            long window = 0;
            for (int j = 0; j < L; j++) window += val[s.charAt(j) - 'a'];
            keys[count++] = window;
            for (int i = 1; i + L <= n; i++) {
                window += val[s.charAt(i + L - 1) - 'a'] - val[s.charAt(i - 1) - 'a'];
                keys[count++] = window;
            }
            Arrays.sort(keys, 0, count);
            int a = 0;
            while (a < count) {
                int b = a;
                while (b < count && keys[b] == keys[a]) b++;
                long c = b - a;
                total += c * (c - 1) / 2;
                a = b;
            }
        }
        System.out.println(total);`
    },
    solution: { explanation: ['The sum of a random 64-bit number per letter is a key that ignores the order of the letters. For every length the keys of the blocks are grouped and each group of `c` blocks gives `c * (c - 1) / 2` pairs.'], complexity: 'Time O(n^2 log n), space O(n).' },
    solve(input) { const s = input.trim(); const n = s.length; let total = 0; for (let L = 1; L < n; L++) { const cnt = new Array(26).fill(0); for (let j = 0; j < L; j++) cnt[s.charCodeAt(j) - 97]++; const m = new Map(); const put = () => { const k = cnt.join(','); m.set(k, (m.get(k) || 0) + 1); }; put(); for (let i = 1; i + L <= n; i++) { cnt[s.charCodeAt(i + L - 1) - 97]++; cnt[s.charCodeAt(i - 1) - 97]--; put(); } for (const c of m.values()) total += (c * (c - 1)) / 2; } return String(total); },
    tests() { const g = rng(407); return ['abba\n', 'a\n', 'ab\n', 'aaaa\n', 'abcabc\n', `${randWord(g, 40, 'ab')}\n`, `${randWord(g, 300, 'abc')}\n`, `${randWord(g, 1200, 'ab')}\n`, `${randWord(g, 1200, LOW)}\n`, `${'a'.repeat(1200)}\n`, `${'ab'.repeat(600)}\n`]; }
  }
];
