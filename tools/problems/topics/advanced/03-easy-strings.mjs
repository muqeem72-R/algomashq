import { r, rng, randInt, many, nums, rows, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const easy = { difficulty: 'easy' };

// reference implementations used by several solutions
const prefixFn = (s) => { const pi = new Array(s.length).fill(0); for (let i = 1; i < s.length; i++) { let k = pi[i - 1]; while (k && s[i] !== s[k]) k = pi[k - 1]; if (s[i] === s[k]) k++; pi[i] = k; } return pi; };
const zFn = (s) => { const n = s.length; const z = new Array(n).fill(0); z[0] = n; let l = 0, rr = 0; for (let i = 1; i < n; i++) { if (i < rr) z[i] = Math.min(rr - i, z[i - l]); while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++; if (i + z[i] > rr) { l = i; rr = i + z[i]; } } return z; };
const word = (input, i = 0) => rows(input)[i];
// strings with many repeats: powers of a short block, Fibonacci words, random words over a tiny alphabet
const fib = (n) => { let a = 'a', b = 'ab'; while (b.length < n) [a, b] = [b, b + a]; return b.slice(0, n); };
const periodic = (g, n, period, alpha, noise) => { const block = randWord(g, period, alpha); let s = block.repeat(Math.ceil(n / period)).slice(0, n); if (noise) { const pos = randInt(g, 0, n - 1); s = s.slice(0, pos) + (s[pos] === 'a' ? 'b' : 'a') + s.slice(pos + 1); } return s; };

const PREFIX = {
  python: r`
    def prefix_function(s):
        n = len(s)
        pi = [0] * n
        for i in range(1, n):
            k = pi[i - 1]
            while k and s[i] != s[k]:
                k = pi[k - 1]
            if s[i] == s[k]:
                k += 1
            pi[i] = k
        return pi`,
  cpp: r`
    vector<int> prefixFunction(const string& s) {
        int n = (int)s.size();
        vector<int> pi(n, 0);
        for (int i = 1; i < n; i++) {
            int k = pi[i - 1];
            while (k > 0 && s[i] != s[k]) k = pi[k - 1];
            if (s[i] == s[k]) k++;
            pi[i] = k;
        }
        return pi;
    }`,
  java: r`
    static int[] prefixFunction(String s) {
        int n = s.length();
        int[] pi = new int[n];
        for (int i = 1; i < n; i++) {
            int k = pi[i - 1];
            while (k > 0 && s.charAt(i) != s.charAt(k)) k = pi[k - 1];
            if (s.charAt(i) == s.charAt(k)) k++;
            pi[i] = k;
        }
        return pi;
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

const oneWordTests = (g, seed, brute, solve) => {
  crossCheck(() => randWord(g, randInt(g, 1, 14), 'ab') + '\n', solve, brute, 800);
  const out = ['a\n', 'aaaa\n', 'abcabcab\n', 'abab\n', 'abcd\n'];
  for (const [n, alpha] of [[30, 'ab'], [1000, 'abc'], [50000, 'ab'], [50000, 'abcdefghijklmnopqrstuvwxyz'], [49999, 'a']]) out.push(randWord(g, n, alpha) + '\n');
  out.push(periodic(g, 50000, 7, 'ab', false) + '\n', periodic(g, 50000, 12345, 'abc', true) + '\n', fib(50000) + '\n', 'a'.repeat(49999) + 'b\n', 'ab'.repeat(25000) + '\n');
  return out;
};

export default [
  {
    ...easy,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 50000', 'The word consists of lowercase English letters.'],
    slug: 'prefix-function-values',
    title: 'The Prefix Function of a Word',
    tags: ['kmp', 'prefix-function', 'strings', 'borders'],
    concept: {
      title: 'For every prefix, the longest proper prefix that is also its suffix; each value is built from the previous one',
      body: [
        'A *border* of a word is a proper prefix that is also a suffix. For `abcab` the border `ab` has length 2. The **prefix function** `pi[i]` is the length of the **longest border of the prefix `s[0..i]`** (the first `i + 1` letters). For `aabaaab` the values are `0 1 0 1 2 2 3`: the prefix `aabaaa` (length 6) has the border `aa`, so `pi[5] = 2`; the prefix `aabaaab` has the border `aab`, so `pi[6] = 3`.',
        'Computing every border from scratch costs O(n^2). The trick is that `pi[i]` is found from `pi[i - 1]`. Let `k = pi[i - 1]`: the prefix `s[0..i-1]` has a border of length `k`, and if the next letter `s[i]` equals `s[k]`, that border grows by one: `pi[i] = k + 1`. If not, we have to try a **shorter border of the same prefix**: the next shorter border of a border of length `k` is the border of the prefix of length `k`, namely `pi[k - 1]`. So set `k = pi[k - 1]` and compare again, until the letters match or `k` is 0.',
        { code: 'pi = [0] * n\nfor i in range(1, n):\n    k = pi[i - 1]\n    while k and s[i] != s[k]:\n        k = pi[k - 1]          # try the next shorter border\n    if s[i] == s[k]:\n        k += 1\n    pi[i] = k' },
        'Why is this fast? The value `k` grows by at most 1 in each step of the outer loop, and every step of the inner loop decreases it, so the total number of steps of the inner loop is at most `n`. The whole function is **O(n)**. It is the heart of the Knuth–Morris–Pratt algorithm: the other KMP problems use it directly.'
      ]
    },
    statement: ['A word `s` is given. For every `i` print the length of the longest proper prefix of `s[0..i]` that is also a suffix of `s[0..i]` (0 if there is none). Print the `n` numbers on one line.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    examples: [{ input: 'aabaaab\n', note: 'The prefix function is 0 1 0 1 2 2 3.' }, { input: 'abcd\n', note: 'No prefix has a border: 0 0 0 0.' }],
    hints: ['pi[0] = 0.', 'Start from k = pi[i - 1] and try to extend the border with the next letter.', 'If the letters differ, fall back to k = pi[k - 1] and repeat.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        n = len(s)
        pi = [0] * n
        for i in range(1, n):
            k = pi[i - 1]
            while k and s[i] != s[k]:
                k = pi[k - 1]
            if s[i] == s[k]:
                k += 1
            pi[i] = k
        print(*pi)`,
      cpp: r`
        int n = (int)s.size();
        vector<int> pi(n, 0);
        for (int i = 1; i < n; i++) {
            int k = pi[i - 1];
            while (k > 0 && s[i] != s[k]) k = pi[k - 1];
            if (s[i] == s[k]) k++;
            pi[i] = k;
        }
        for (int i = 0; i < n; i++) cout << (i ? " " : "") << pi[i];
        cout << "\n";`,
      java: r`
        int n = s.length();
        int[] pi = new int[n];
        for (int i = 1; i < n; i++) {
            int k = pi[i - 1];
            while (k > 0 && s.charAt(i) != s.charAt(k)) k = pi[k - 1];
            if (s.charAt(i) == s.charAt(k)) k++;
            pi[i] = k;
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) out.append(" ");
            out.append(pi[i]);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['pi[i] is obtained from pi[i - 1] by trying to extend the border with the next letter and falling back through shorter borders; the total work is linear.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      return prefixFn(word(input)).join(' ');
    },
    tests() {
      const g = rng(4201); const brute = (input) => { const s = word(input); const res = []; for (let i = 0; i < s.length; i++) { const p = s.slice(0, i + 1); let best = 0; for (let k = 1; k < p.length; k++) if (p.slice(0, k) === p.slice(p.length - k)) best = k; res.push(best); } return res.join(' '); };
      return oneWordTests(g, 0, brute, (i) => this.solve(i));
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 50000', 'The word consists of lowercase English letters.'],
    slug: 'z-function-values',
    title: 'The Z-Function of a Word',
    tags: ['z-function', 'strings', 'prefix-match'],
    concept: {
      title: 'For every position, how far the word matches itself from the start; a window [l, r) of the rightmost match is reused',
      body: [
        'The **Z-function** of a word `s` gives, for each position `i`, the length `z[i]` of the **longest common prefix of `s` and the suffix `s[i..]`**. For `aabxaab` the values are `7 1 0 0 3 1 0` (we define `z[0] = n`): the suffix `aab` at the position 4 shares the prefix `aab` with `s`, so `z[4] = 3`. Comparing letters from scratch for every position costs O(n^2) on a word like `aaaa...a`.',
        'Keep a window `[l, r)`: the **rightmost** segment found so far that matches a prefix of `s` (so `s[l..r)` equals `s[0..r-l)`). For a new position `i` inside the window, the letters at `i` are the same as at `i - l` near the start of the word, so `z[i]` starts at `min(r - i, z[i - l])` without any comparison. Only if this reaches the border of the window do we try to extend it by comparing the following letters. When the match extends past `r`, the window moves to `[i, i + z[i])`.',
        { code: 'z = [0] * n\nz[0] = n\nl = r = 0\nfor i in range(1, n):\n    if i < r:\n        z[i] = min(r - i, z[i - l])    # copy from the matching place near the start\n    while i + z[i] < n and s[z[i]] == s[i + z[i]]:\n        z[i] += 1                       # extend by direct comparison\n    if i + z[i] > r:\n        l, r = i, i + z[i]' },
        'Each direct comparison either moves `r` to the right or fails once, so the total work is O(n). The Z-function and the prefix function carry the same information and can be converted into each other; the Z-function is often more convenient for questions about how a word starts again later.'
      ]
    },
    statement: ['A word `s` is given. For every position `i` (counting from 0) print the length of the longest common prefix of `s` and the suffix of `s` that starts at `i`; the value for the position 0 is the length of `s`. Print the `n` numbers on one line.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    examples: [{ input: 'aabxaab\n', note: 'The Z-function is 7 1 0 0 3 1 0.' }],
    hints: ['Maintain the window [l, r) of the rightmost match with a prefix.', 'Inside the window start from min(r - i, z[i - l]).', 'Extend by comparison and move the window if it grows.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
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
        print(*z)`,
      cpp: r`
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
        for (int i = 0; i < n; i++) cout << (i ? " " : "") << z[i];
        cout << "\n";`,
      java: r`
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
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) out.append(" ");
            out.append(z[i]);
        }
        System.out.println(out);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The window of the rightmost prefix match is maintained; z[i] starts from the value copied near the beginning and is extended by direct comparison only beyond the window.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const s = word(input); const pi = prefixFn(s); const n = s.length; // the Z-function from the definition for each position using the prefix function of s + '#' + suffix is too slow; use direct comparison with a skip
      const z = new Array(n).fill(0); z[0] = n; let l = 0, rr = 0; for (let i = 1; i < n; i++) { let k = i < rr ? Math.min(rr - i, z[i - l]) : 0; while (i + k < n && s[k] === s[i + k]) k++; z[i] = k; if (i + k > rr) { l = i; rr = i + k; } } return z.join(' ');
    },
    tests() {
      const g = rng(4202); const brute = (input) => { const s = word(input); return s.split('').map((_, i) => { if (i === 0) return s.length; let k = 0; while (i + k < s.length && s[k] === s[i + k]) k++; return k; }).join(' '); };
      return oneWordTests(g, 0, brute, (i) => this.solve(i));
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has the text `t`.', 'The second line has the pattern `p`.'],
    constraints: ['1 <= length of p <= length of t <= 50000', 'Both words consist of lowercase English letters.'],
    slug: 'positions-of-a-pattern',
    title: 'Where Does the Pattern Occur in the Text?',
    tags: ['kmp', 'pattern-matching', 'prefix-function', 'strings'],
    concept: {
      title: 'Glue pattern + a separator + text, compute the prefix function, and read off where it reaches the pattern length',
      body: [
        'Find **all positions** where a pattern `p` occurs in a text `t` (occurrences may overlap). For `t = ababa` and `p = aba` the positions are 1 and 3 (counting from 1). Comparing the pattern at every position takes O(|t| * |p|), which is up to 2.5 * 10^9 comparisons for words of 50000 letters.',
        'Make one word `p + "#" + t`, where `#` is a letter that occurs in neither word. Compute its prefix function. A value `pi[i] = |p|` at a position in the text part means that a border of length `|p|` ends here: the last `|p|` letters equal the first `|p|` letters, that is, the pattern. Because of the separator, no border can be longer than `|p|`. If the value is found at the index `i` of the glued word, the occurrence ends at the text index `i - |p| - 1` (0-based) and starts `|p| - 1` earlier.',
        { code: 'c = p + "#" + t\npi = prefix_function(c)\nm = len(p)\npositions = []\nfor i in range(m + 1, len(c)):\n    if pi[i] == m:\n        positions.append(i - 2 * m + 1)      # the start in t, counted from 1\nprint(len(positions), *positions)' },
        'The prefix function is computed in O(|p| + |t|), so the search is linear. The first number printed is the number of occurrences; if there is none, only `0` is printed. This is the original use of the Knuth–Morris–Pratt algorithm: the pattern is processed once, and the text is never scanned backwards.'
      ]
    },
    statement: ['A text `t` and a pattern `p` are given. Print the number of occurrences of `p` in `t` (overlapping occurrences are counted) followed by the positions where they start, counted from 1, in increasing order. If there are no occurrences, print just 0.'],
    outputFormat: ['Print the number of occurrences, then their starting positions, all on one line.'],
    examples: [{ input: 'ababa\naba\n', note: 'The pattern occurs at 1 and 3: 2 1 3.' }, { input: 'abc\nd\n', note: 'No occurrence: 0.' }],
    hints: ['Build p + "#" + t and its prefix function.', 'An occurrence ends where the prefix function equals the length of p.', 'Convert the index in the glued word to the start in the text.'],
    program: {
      io: ['t:word', 'p:word'],
      fast: true,
      helpers: PREFIX,
      python: r`
        c = p + "#" + t
        pi = prefix_function(c)
        m = len(p)
        positions = []
        for i in range(m + 1, len(c)):
            if pi[i] == m:
                positions.append(i - 2 * m + 1)
        print(len(positions), *positions)`,
      cpp: r`
        string c = p + "#" + t;
        vector<int> pi = prefixFunction(c);
        int m = (int)p.size();
        vector<int> positions;
        for (int i = m + 1; i < (int)c.size(); i++) if (pi[i] == m) positions.push_back(i - 2 * m + 1);
        cout << positions.size();
        for (int x : positions) cout << " " << x;
        cout << "\n";`,
      java: r`
        String c = p + "#" + t;
        int[] pi = prefixFunction(c);
        int m = p.length();
        StringBuilder out = new StringBuilder();
        int count = 0;
        for (int i = m + 1; i < c.length(); i++) {
            if (pi[i] == m) {
                count++;
                out.append(" ").append(i - 2 * m + 1);
            }
        }
        System.out.println(count + out.toString());`,
      includes: ['<string>']
    },
    solution: { explanation: ['The prefix function of pattern + "#" + text equals the pattern length exactly where an occurrence ends; the start is computed from the index.'], complexity: 'Time O(|t| + |p|), space O(|t| + |p|).' },
    solve(input) {
      const [t, p] = rows(input); const z = zFn(p + '#' + t); const m = p.length; const pos = []; for (let i = m + 1; i < z.length; i++) if (z[i] >= m) pos.push(i - m); return [pos.length, ...pos].join(' ');
    },
    tests() {
      const g = rng(4203); const out = ['ababa\naba\n', 'abc\nd\n', 'a\na\n', 'aaaa\naa\n', 'abcabcabc\nabc\n'];
      const brute = (input) => { const [t, p] = rows(input); const pos = []; for (let i = 0; i + p.length <= t.length; i++) if (t.startsWith(p, i)) pos.push(i + 1); return [pos.length, ...pos].join(' '); };
      crossCheck(() => { const t = randWord(g, randInt(g, 1, 14), 'ab'); const m = randInt(g, 1, t.length); const start = randInt(g, 0, t.length - m); const p = g() < 0.6 ? t.slice(start, start + m) : randWord(g, m, 'ab'); return `${t}\n${p}\n`; }, (i) => this.solve(i), brute, 800);
      const plant = (n, m, alpha) => { const p = randWord(g, m, alpha); let t = ''; while (t.length < n) t += g() < 0.4 ? p : randWord(g, randInt(g, 1, m), alpha); return `${t.slice(0, n)}\n${p}\n`; };
      for (const [n, m, alpha] of [[40, 3, 'ab'], [1000, 5, 'ab'], [50000, 6, 'ab'], [50000, 100, 'abc'], [50000, 3, 'abcdefghijklmnopqrstuvwxyz']]) out.push(plant(n, m, alpha));
      out.push(`${'a'.repeat(50000)}\n${'a'.repeat(25000)}\n`, `${'ab'.repeat(25000)}\nabab\n`, `${'a'.repeat(50000)}\n${'a'.repeat(50000)}\n`, `${fib(50000)}\n${fib(500)}\n`, `${'a'.repeat(49999)}b\n${'a'.repeat(30)}b\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 50000', 'The word consists of lowercase English letters.'],
    slug: 'longest-border-of-a-word',
    title: 'The Longest Border of a Word',
    tags: ['kmp', 'prefix-function', 'borders', 'strings'],
    concept: {
      title: 'The longest border of the whole word is the last value of the prefix function',
      body: [
        'A **border** of a word is a proper prefix of it that is also a suffix. The word `abcabcab` has the borders `ab` (length 2) and `abcab` (length 5); the **longest border** has length 5. The word `abcd` has no border, so the answer is 0. Checking all prefix lengths and comparing them with the suffixes costs O(n^2).',
        'The prefix function `pi[i]` is by definition the length of the longest border of the prefix `s[0..i]`. For the whole word the answer is therefore the **last value**, `pi[n - 1]`. There is nothing else to do: the entire work is the computation of the prefix function in O(n).',
        { code: 'pi = prefix_function(s)\nprint(pi[-1])' },
        'The border has a useful interpretation: if the longest border has length `b`, then the word looks the same when shifted by `n - b` positions, so `n - b` is the shortest "period" of the word. This is used in the next problems on repetitions, rotations and covers.'
      ]
    },
    statement: ['A word `s` is given. A border is a proper prefix of `s` that is also a suffix of `s` (the empty word is allowed). Print the length of the longest border.'],
    outputFormat: ['Print the length of the longest border.'],
    examples: [{ input: 'abcabcab\n', note: 'The longest border is abcab: 5.' }, { input: 'abcd\n', note: 'No border: 0.' }],
    hints: ['A border is a proper prefix that is also a suffix; think of the prefix function.', 'The prefix function of the whole word holds the answer.', 'It is the last value pi[n - 1].'],
    program: {
      io: ['s:word'],
      fast: true,
      helpers: PREFIX,
      python: r`
        pi = prefix_function(s)
        print(pi[-1])`,
      cpp: r`
        vector<int> pi = prefixFunction(s);
        cout << pi.back() << "\n";`,
      java: r`
        int[] pi = prefixFunction(s);
        System.out.println(pi[pi.length - 1]);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The prefix function of the whole word at its last position is the length of the longest border.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const s = word(input); const z = zFn(s); for (let k = s.length - 1; k >= 1; k--) if (z[s.length - k] === k) return String(k); return '0'; // the longest suffix that is also a prefix, from the Z-function
    },
    tests() {
      const g = rng(4204); const brute = (input) => { const s = word(input); for (let k = s.length - 1; k >= 1; k--) if (s.slice(0, k) === s.slice(s.length - k)) return String(k); return '0'; };
      return oneWordTests(g, 0, brute, (i) => this.solve(i));
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 50000', 'The word consists of lowercase English letters.'],
    slug: 'shortest-repeating-unit',
    title: 'The Shortest Block That Builds the Word by Repetition',
    tags: ['kmp', 'prefix-function', 'period', 'strings'],
    concept: {
      title: 'If the word is a repetition, its block length is n minus the longest border, and it divides n',
      body: [
        'Some words are a block repeated several times: `abcabcabc` is `abc` three times, `aaaa` is `a` four times. Find the **length of the shortest block** that builds the word by repetition. A word that is not a repetition of a shorter block is its own block, and the answer is its whole length. For `abab` the answer is 2, for `abcab` it is 5.',
        'Let `b` be the length of the longest border of the word. If the word is `k` copies of a block of length `L`, then shifting by `L` positions maps the word to itself, so the prefix of length `n - L` equals the suffix of length `n - L`: that is a border of length `n - L`. The longest border gives the **smallest shift** `p = n - b`. If `p` divides `n`, the word consists of `n / p` copies of its first `p` letters; if `p` does not divide `n`, the word is not a pure repetition and the answer is `n`.',
        { code: 'pi = prefix_function(s)\nn = len(s)\np = n - pi[-1]          # the smallest shift that maps the word to itself\nprint(p if n % p == 0 else n)' },
        'Example: for `abcabcab` the longest border is 5, so `p = 3`, but 8 is not divisible by 3, so the word is not a repetition and the answer is 8. For `abababab` the longest border is 6, `p = 2` divides 8, and the answer is 2. The whole algorithm is linear.'
      ]
    },
    statement: ['A word `s` is given. Print the length of the shortest block `b` such that `s` is the word `b` repeated several times (a word is always a repetition of itself once).'],
    outputFormat: ['Print the length of the shortest block.'],
    examples: [{ input: 'abababab\n', note: 'The block is ab: 2.' }, { input: 'abcabcab\n', note: 'Not a repetition: 8.' }],
    hints: ['Compute the longest border b of the word.', 'The smallest shift is p = n - b.', 'If p divides n the answer is p, otherwise it is n.'],
    program: {
      io: ['s:word'],
      fast: true,
      helpers: PREFIX,
      python: r`
        pi = prefix_function(s)
        n = len(s)
        p = n - pi[-1]
        print(p if n % p == 0 else n)`,
      cpp: r`
        vector<int> pi = prefixFunction(s);
        int n = (int)s.size();
        int p = n - pi.back();
        cout << (n % p == 0 ? p : n) << "\n";`,
      java: r`
        int[] pi = prefixFunction(s);
        int n = s.length();
        int p = n - pi[n - 1];
        System.out.println(n % p == 0 ? p : n);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The smallest shift mapping the word to itself is n minus the longest border; if it divides n the word is a repetition of that block, otherwise the block is the whole word.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const s = word(input); const n = s.length; for (let L = 1; L <= n; L++) { if (n % L === 0 && s.slice(0, L).repeat(n / L) === s) return String(L); } return String(n);
    },
    tests() {
      const g = rng(4205); const brute = (input) => { const s = word(input); const n = s.length; for (let L = 1; L <= n; L++) if (n % L === 0 && s.slice(0, L).repeat(n / L) === s) return String(L); return String(n); };
      const out = oneWordTests(g, 0, brute, (i) => this.solve(i));
      out.push(('ab'.repeat(5) + 'c').repeat(4000) + '\n', 'abc'.repeat(16666) + '\n', 'a'.repeat(50000) + '\n');
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has the word `a`.', 'The second line has the word `b`.'],
    constraints: ['1 <= length of a, length of b <= 50000', 'Both words consist of lowercase English letters.'],
    slug: 'is-one-word-a-rotation-of-the-other',
    title: 'Is One Word a Rotation of the Other?',
    tags: ['kmp', 'pattern-matching', 'rotation', 'strings'],
    concept: {
      title: 'All rotations of a word are substrings of the word written twice',
      body: [
        'A *rotation* of a word moves some letters from the front to the back: the rotations of `abcde` include `cdeab` and `eabcd`. Given two words `a` and `b`, decide whether `b` is a rotation of `a`. For `abcde` and `cdeab` the answer is YES; for `abcde` and `abced` it is NO. Trying every rotation and comparing costs O(n^2).',
        'Write `a` twice: `aa = a + a`. Every rotation of `a` is a window of length `n` inside `aa`: the rotation that starts at the position `i` is `aa[i..i+n)`. So **`b` is a rotation of `a` exactly when the lengths are equal and `b` occurs as a substring of `a + a`**. The substring search can be done with the prefix function in linear time: find `b` in `a + a`.',
        { code: 'if len(a) != len(b): answer NO\nelse:\n    c = b + "#" + a + a\n    pi = prefix_function(c)\n    answer YES if some value pi[i] == len(b) else NO' },
        'The length check is important: for `a = ab` and `b = b`, the word `b` occurs in `abab`, but it is not a rotation of `a`; only when the lengths agree is an occurrence a rotation. The method is linear in the length of the words. The same doubling trick finds the smallest rotation and counts the different rotations in later problems.'
      ]
    },
    statement: ['Two words `a` and `b` are given. A rotation of a word is obtained by moving some letters (possibly none) from its start to its end. Print YES if `b` is a rotation of `a`, otherwise NO.'],
    outputFormat: ['Print YES or NO.'],
    examples: [{ input: 'abcde\ncdeab\n', note: 'cdeab is a rotation of abcde: YES.' }, { input: 'abcde\nabced\n', note: 'NO.' }],
    hints: ['Every rotation of a is a window of a + a.', 'The lengths must be equal.', 'Search b in a + a with the prefix function of b + "#" + a + a.'],
    program: {
      io: ['a:word', 'b:word'],
      fast: true,
      helpers: PREFIX,
      python: r`
        found = False
        if len(a) == len(b):
            c = b + "#" + a + a
            pi = prefix_function(c)
            m = len(b)
            found = any(v == m for v in pi)
        print("YES" if found else "NO")`,
      cpp: r`
        bool found = false;
        if (a.size() == b.size()) {
            string c = b + "#" + a + a;
            vector<int> pi = prefixFunction(c);
            for (int v : pi) if (v == (int)b.size()) found = true;
        }
        cout << (found ? "YES" : "NO") << "\n";`,
      java: r`
        boolean found = false;
        if (a.length() == b.length()) {
            String c = b + "#" + a + a;
            int[] pi = prefixFunction(c);
            for (int v : pi) if (v == b.length()) found = true;
        }
        System.out.println(found ? "YES" : "NO");`,
      includes: ['<string>']
    },
    solution: { explanation: ['b is a rotation of a exactly when the lengths agree and b is a substring of a + a; the search is done with the prefix function.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const [a, b] = rows(input); return a.length === b.length && (a + a).includes(b) ? 'YES' : 'NO';
    },
    tests() {
      const g = rng(4206); const out = ['abcde\ncdeab\n', 'abcde\nabced\n', 'a\na\n', 'ab\nabc\n', 'aab\nbaa\n'];
      const brute = (input) => { const [a, b] = rows(input); if (a.length !== b.length) return 'NO'; for (let i = 0; i < a.length; i++) if (a.slice(i) + a.slice(0, i) === b) return 'YES'; return 'NO'; };
      const pair = (n, alpha, kind) => { const a = randWord(g, n, alpha); const k = randInt(g, 0, n - 1); const rot = a.slice(k) + a.slice(0, k); if (kind === 'yes') return `${a}\n${rot}\n`; if (kind === 'len') return `${a}\n${rot}${alpha[0]}\n`; const pos = randInt(g, 0, n - 1); const c = rot.slice(0, pos) + (rot[pos] === alpha[0] ? alpha[alpha.length - 1] : alpha[0]) + rot.slice(pos + 1); return `${a}\n${c}\n`; };
      crossCheck(() => pair(randInt(g, 1, 8), 'ab', ['yes', 'no', 'len'][randInt(g, 0, 2)]), (i) => this.solve(i), brute, 800);
      for (const [n, alpha, kind] of [[30, 'ab', 'yes'], [1000, 'abc', 'no'], [50000, 'ab', 'yes'], [50000, 'abcdefghijklmnopqrstuvwxyz', 'yes'], [50000, 'ab', 'no'], [49999, 'abc', 'len']]) out.push(pair(n, alpha, kind));
      out.push(`${'a'.repeat(49999)}b\n${'a'.repeat(25000)}b${'a'.repeat(24999)}\n`, `${'ab'.repeat(25000)}\n${'ba'.repeat(25000)}\n`, `${'a'.repeat(50000)}\n${'a'.repeat(49999)}b\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has the text `t`.', 'The second line has the pattern `p`.'],
    constraints: ['1 <= length of p, length of t <= 50000', 'Both words consist of lowercase English letters.'],
    slug: 'longest-pattern-prefix-at-each-position',
    title: 'The Longest Part of the Pattern That Ends at Each Position',
    tags: ['kmp', 'automaton', 'pattern-matching', 'strings'],
    concept: {
      title: 'Run the KMP matcher over the text and write down its state after every letter',
      body: [
        'For every position `i` of the text `t`, find the **longest prefix of the pattern `p` that ends at the position `i`**, that is, the largest `k` such that the last `k` letters of `t[0..i]` equal the first `k` letters of `p`. For `t = ababab` and `p = abab` the answers are `1 2 3 4 3 4`: after `a` the prefix `a` matches (1); after `ab` it is 2; after `aba` it is 3; after `abab` it is 4, a full match; after `ababa` it is 3 (the end `aba` is again a prefix of the pattern); after `ababab` it is 4.',
        'This is exactly the **state of the KMP matcher**. Keep `k`, the length of the currently matched prefix. For each new letter `c`: while `k > 0` and `p[k] != c`, fall back with `k = pi[k - 1]` (the next shorter border); then if `p[k] == c`, increase `k`. The value of `k` after the letter is the answer for this position. When `k` reaches `|p|` we have a full match; before we process the next letter we fall back with `k = pi[k - 1]`, because the whole pattern cannot be extended.',
        { code: 'pi = prefix_function(p)\nk = 0\nfor c in t:\n    if k == len(p):\n        k = pi[k - 1]               # a full match cannot be extended: fall back\n    while k and p[k] != c:\n        k = pi[k - 1]\n    if p[k] == c:\n        k += 1\n    answer.append(k)' },
        'The state `k` changes by at most +1 per letter, so the falls back are paid for by the increases and the whole scan is O(|t| + |p|). Looking at the matcher in this way shows that KMP is a finite automaton whose states are the lengths of the matched prefix.'
      ]
    },
    statement: ['A text `t` and a pattern `p` are given. For every position `i` of the text print the length of the longest prefix of `p` that is a suffix of `t[0..i]` (the first `i + 1` letters of the text). Print the numbers on one line.'],
    outputFormat: ['Print `|t|` numbers separated by spaces.'],
    examples: [{ input: 'ababab\nabab\n', note: 'The values are 1 2 3 4 3 4.' }],
    hints: ['Keep the length k of the matched prefix.', 'On a mismatch fall back through the prefix function.', 'After a full match fall back once before reading the next letter.'],
    program: {
      io: ['t:word', 'p:word'],
      fast: true,
      helpers: PREFIX,
      python: r`
        pi = prefix_function(p)
        m = len(p)
        k = 0
        out = []
        for c in t:
            if k == m:
                k = pi[k - 1]
            while k and p[k] != c:
                k = pi[k - 1]
            if p[k] == c:
                k += 1
            out.append(k)
        print(*out)`,
      cpp: r`
        vector<int> pi = prefixFunction(p);
        int m = (int)p.size(), k = 0;
        string out;
        for (size_t i = 0; i < t.size(); i++) {
            if (k == m) k = pi[k - 1];
            while (k > 0 && p[k] != t[i]) k = pi[k - 1];
            if (p[k] == t[i]) k++;
            if (i) out += " ";
            out += to_string(k);
        }
        cout << out << "\n";`,
      java: r`
        int[] pi = prefixFunction(p);
        int m = p.length(), k = 0;
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < t.length(); i++) {
            char c = t.charAt(i);
            if (k == m) k = pi[k - 1];
            while (k > 0 && p.charAt(k) != c) k = pi[k - 1];
            if (p.charAt(k) == c) k++;
            if (i > 0) out.append(" ");
            out.append(k);
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The KMP matcher keeps the length k of the matched prefix; after each text letter k is the answer for that position, and after a full match it falls back through the prefix function.'], complexity: 'Time O(|t| + |p|), space O(|p|).' },
    solve(input) {
      const [t, p] = rows(input); const m = p.length; const z = zFn(p + '#' + t); // the longest prefix of p ending at i: the largest k with t[i-k+1..i] = p[0..k)
      const res = []; const best = new Array(t.length).fill(0); for (let j = 0; j < t.length; j++) { const len = z[m + 1 + j]; for (let k = 0; k < len && k < m; k++) if (j + k < t.length && k + 1 > best[j + k]) best[j + k] = k + 1; } return best.join(' ');
    },
    tests() {
      const g = rng(4207); const out = ['ababab\nabab\n', 'a\na\n', 'aaaa\naa\n', 'abc\nxyz\n'];
      const brute = (input) => { const [t, p] = rows(input); return t.split('').map((_, i) => { let best = 0; for (let k = 1; k <= Math.min(p.length, i + 1); k++) if (t.slice(i + 1 - k, i + 1) === p.slice(0, k)) best = k; return best; }).join(' '); };
      crossCheck(() => `${randWord(g, randInt(g, 1, 14), 'ab')}\n${randWord(g, randInt(g, 1, 6), 'ab')}\n`, (i) => this.solve(i), brute, 800);
      const text = (n, m, alpha) => { const p = randWord(g, m, alpha); let t = ''; while (t.length < n) t += g() < 0.5 ? p.slice(0, randInt(g, 1, m)) : randWord(g, randInt(g, 1, 4), alpha); return `${t.slice(0, n)}\n${p}\n`; };
      for (const [n, m, alpha] of [[40, 4, 'ab'], [1000, 7, 'ab'], [30000, 6, 'ab'], [30000, 50, 'abc'], [30000, 3, 'abcdefghijklmnopqrstuvwxyz']]) out.push(text(n, m, alpha));
      out.push(`${'a'.repeat(30000)}\n${'a'.repeat(15000)}\n`, `${'ab'.repeat(15000)}\n${'ab'.repeat(40)}c\n`, `${fib(30000)}\n${fib(300)}\n`);
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 50000', 'The word consists of lowercase English letters.'],
    slug: 'all-borders-of-a-word',
    title: 'List Every Border of a Word',
    tags: ['kmp', 'prefix-function', 'borders', 'strings'],
    concept: {
      title: 'The borders of a word form a chain: the border of a border is a border',
      body: [
        'A *border* of a word is a proper prefix that is also a suffix. A word can have many borders, for example `aaaa` has the borders `a`, `aa`, `aaa` (lengths 1, 2, 3), and `abaababaab` has the borders `ab`, `abaab` (lengths 2 and 5). List **all** border lengths, from the shortest to the longest.',
        'The longest border has the length `b = pi[n - 1]`. Every other border is a **border of that longest border** (a shorter prefix that is also a suffix of the longest border, which is a suffix of the word). The borders of the prefix of length `b` are found the same way: the longest is `pi[b - 1]`, and so on. So the list of all borders is the **chain** `pi[n - 1], pi[pi[n - 1] - 1], ...`, which ends when the value is 0.',
        { code: 'pi = prefix_function(s)\nborders = []\nk = pi[-1]\nwhile k > 0:\n    borders.append(k)\n    k = pi[k - 1]               # the next shorter border\nborders.reverse()               # from the shortest to the longest\nprint(len(borders), *borders)' },
        'The chain has at most `n` elements (for `aaaa...a`), so the program is linear. The same chain is what the KMP matcher walks when a comparison fails. The first number of the output is the number of borders; if the word has none, only `0` is printed.'
      ]
    },
    statement: ['A word `s` is given. Print the number of borders of `s` (proper prefixes that are also suffixes, not counting the empty word), followed by their lengths in increasing order, all on one line.'],
    outputFormat: ['Print the number of borders, then their lengths in increasing order.'],
    examples: [{ input: 'abaababaab\n', note: 'The borders are ab and abaab: 2 2 5.' }, { input: 'abcd\n', note: 'No border: 0.' }],
    hints: ['The longest border is the last value of the prefix function.', 'The next shorter border is pi[k - 1].', 'Collect the chain and print it in increasing order.'],
    program: {
      io: ['s:word'],
      fast: true,
      helpers: PREFIX,
      python: r`
        pi = prefix_function(s)
        borders = []
        k = pi[-1]
        while k > 0:
            borders.append(k)
            k = pi[k - 1]
        borders.reverse()
        print(len(borders), *borders)`,
      cpp: r`
        vector<int> pi = prefixFunction(s);
        vector<int> borders;
        for (int k = pi.back(); k > 0; k = pi[k - 1]) borders.push_back(k);
        reverse(borders.begin(), borders.end());
        cout << borders.size();
        for (int b : borders) cout << " " << b;
        cout << "\n";`,
      java: r`
        int[] pi = prefixFunction(s);
        int n = s.length();
        int[] chain = new int[n + 1];
        int count = 0;
        for (int k = pi[n - 1]; k > 0; k = pi[k - 1]) chain[count++] = k;
        StringBuilder out = new StringBuilder();
        out.append(count);
        for (int i = count - 1; i >= 0; i--) out.append(" ").append(chain[i]);
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['The borders are the chain pi[n - 1], pi[pi[n - 1] - 1], ... until 0; the chain is collected and printed in increasing order.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const s = word(input); const z = zFn(s); const n = s.length; const b = []; for (let k = 1; k < n; k++) if (z[n - k] === k) b.push(k); return [b.length, ...b].join(' ');
    },
    tests() {
      const g = rng(4208); const brute = (input) => { const s = word(input); const b = []; for (let k = 1; k < s.length; k++) if (s.slice(0, k) === s.slice(s.length - k)) b.push(k); return [b.length, ...b].join(' '); };
      return oneWordTests(g, 0, brute, (i) => this.solve(i));
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 50000', 'The word consists of lowercase English letters.'],
    slug: 'sum-of-the-z-function',
    title: 'The Total Similarity of a Word With Its Suffixes',
    tags: ['z-function', 'strings', 'prefix-match', 'counting'],
    concept: {
      title: 'The sum of all Z values counts, for every suffix, the letters it shares with the beginning of the word',
      body: [
        'The *similarity* of two words is the length of their longest common prefix. Find the **sum of the similarities of the word `s` with each of its suffixes** (the suffix that starts at the position 0 is the whole word, which is similar to `s` in all `n` letters). For `ababaa` the similarities are `6 0 3 0 1 1` and the sum is 11. Comparing each suffix directly would cost O(n^2) on a word like `aaaa...a` (the sum is then about n^2 / 2).',
        'The similarity of `s` with its suffix at the position `i` is exactly the Z-function value `z[i]` (with `z[0] = n`). The Z-function is computed in O(n), so the answer is simply the sum of all its values. For an input such as `aaaa...a` of 50000 letters the sum is about 1.25 * 10^9, which does not fit in 32 bits: use 64-bit numbers.',
        { code: 'z = z_function(s)           # z[0] = n\nprint(sum(z))' },
        'This problem is a good test of the Z-function implementation: the linear algorithm must be used, because the quadratic comparison would take about 10^9 steps on the worst words. The number of occurrences of every prefix inside the word can be derived from the same values in the harder problems later.'
      ]
    },
    statement: ['A word `s` is given. The similarity of `s` and a word `u` is the length of their longest common prefix. Print the sum of the similarities of `s` with all its suffixes (the whole word counts as a suffix).'],
    outputFormat: ['Print the sum.'],
    examples: [{ input: 'ababaa\n', note: 'The similarities are 6, 0, 3, 0, 1, 1: 11.' }],
    hints: ['The similarity with the suffix at the position i is z[i].', 'Use z[0] = n.', 'The sum can exceed 32 bits.'],
    program: {
      io: ['s:word'],
      fast: true,
      helpers: ZFUNC,
      python: r`
        z = z_function(s)
        print(sum(z))`,
      cpp: r`
        vector<int> z = zFunction(s);
        long long total = 0;
        for (int v : z) total += v;
        cout << total << "\n";`,
      java: r`
        int[] z = zFunction(s);
        long total = 0;
        for (int v : z) total += v;
        System.out.println(total);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The similarity with the suffix at i is z[i]; the Z-function is computed in linear time and its values are summed in 64-bit arithmetic.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const s = word(input); const z = zFn(s); return String(z.reduce((a, b) => a + b, 0));
    },
    tests() {
      const g = rng(4209); const brute = (input) => { const s = word(input); let total = 0; for (let i = 0; i < s.length; i++) { let k = 0; while (i + k < s.length && s[k] === s[i + k]) k++; total += k; } return String(total); };
      return oneWordTests(g, 0, brute, (i) => this.solve(i));
    }
  },

  {
    ...easy,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 50000', 'The word consists of lowercase English letters.'],
    slug: 'longest-prefix-that-occurs-again',
    title: 'The Longest Prefix That Appears Again Later in the Word',
    tags: ['z-function', 'strings', 'prefix-match', 'maximum'],
    concept: {
      title: 'A prefix that appears again starting at the position i has the length at most z[i]; the best is the maximum of z[1..]',
      body: [
        'Find the length of the **longest prefix of the word that occurs again** somewhere else in the word (starting at a later position; the two occurrences may overlap). For `abcabcab` the prefix `abcab` occurs again at the position 3, so the answer is 5. For `abcd` no prefix occurs again, so the answer is 0.',
        'A prefix of length `L` occurs again at the position `i >= 1` exactly when the letters starting at `i` match the first `L` letters of the word, that is, when `z[i] >= L`. So the longest prefix that occurs again at the position `i` has the length `z[i]`, and over all positions the answer is `max(z[1], z[2], ..., z[n - 1])` (0 for a word of one letter).',
        { code: 'z = z_function(s)\nprint(max(z[1:], default=0))' },
        'The overlap is allowed: for `aaaa` the prefix `aaa` occurs again at the position 1 (`aaa` is the suffix), so the answer is 3, which is `z[1]`. The Z-function does all the work in linear time.'
      ]
    },
    statement: ['A word `s` is given. Print the length of the longest prefix of `s` that also occurs in `s` starting at some later position (occurrences may overlap).'],
    outputFormat: ['Print the length.'],
    examples: [{ input: 'abcabcab\n', note: 'The prefix abcab occurs again at the position 4: 5.' }, { input: 'abcd\n', note: '0.' }],
    hints: ['Compute the Z-function: z[i] is how long the word matches itself from the position i.', 'A prefix of length L occurs at the position i exactly when z[i] >= L.', 'Take the maximum of z[1], ..., z[n - 1].'],
    program: {
      io: ['s:word'],
      fast: true,
      helpers: ZFUNC,
      python: r`
        z = z_function(s)
        print(max(z[1:], default=0))`,
      cpp: r`
        vector<int> z = zFunction(s);
        int best = 0;
        for (size_t i = 1; i < z.size(); i++) best = max(best, z[i]);
        cout << best << "\n";`,
      java: r`
        int[] z = zFunction(s);
        int best = 0;
        for (int i = 1; i < z.length; i++) best = Math.max(best, z[i]);
        System.out.println(best);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['The longest prefix occurring again at the position i is z[i]; the answer is the maximum of z[1..n-1].'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const s = word(input); let best = 0; const z = zFn(s); for (let i = 1; i < z.length; i++) if (z[i] > best) best = z[i]; return String(best); // the maximum of z[1..]
    },
    tests() {
      const g = rng(4210); const brute = (input) => { const s = word(input); let best = 0; for (let L = 1; L < s.length; L++) if (s.indexOf(s.slice(0, L), 1) !== -1) best = L; return String(best); };
      const out = oneWordTests(g, 0, brute, (i) => this.solve(i));
      return out;
    }
  }
];
