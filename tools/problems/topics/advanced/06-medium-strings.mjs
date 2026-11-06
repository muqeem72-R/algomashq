import { r, rng, randInt, many, nums, rows, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const prefixFn = (s) => { const pi = new Array(s.length).fill(0); for (let i = 1; i < s.length; i++) { let k = pi[i - 1]; while (k && s[i] !== s[k]) k = pi[k - 1]; if (s[i] === s[k]) k++; pi[i] = k; } return pi; };
const zFn = (s) => { const n = s.length; const z = new Array(n).fill(0); z[0] = n; let l = 0, rr = 0; for (let i = 1; i < n; i++) { if (i < rr) z[i] = Math.min(rr - i, z[i - l]); while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++; if (i + z[i] > rr) { l = i; rr = i + z[i]; } } return z; };
const word = (input, i = 0) => rows(input)[i];
const fib = (n) => { let a = 'a', b = 'ab'; while (b.length < n) [a, b] = [b, b + a]; return b.slice(0, n); };
const periodic = (g, n, period, alpha, noise) => { const block = randWord(g, period, alpha); let s = block.repeat(Math.ceil(n / period)).slice(0, n); if (noise) { const pos = randInt(g, 0, n - 1); s = s.slice(0, pos) + (s[pos] === 'a' ? 'b' : 'a') + s.slice(pos + 1); } return s; };
const dedent = (s) => { const ls = s.replace(/^\n/, '').split('\n'); const ind = Math.min(...ls.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)); return ls.map((l) => l.slice(ind)).join('\n'); };
const wordTests = (g, extra = []) => { const out = ['a\n', 'aaaa\n', 'abcabcab\n', 'abab\n', 'abcd\n', ...extra]; for (const [n, alpha] of [[30, 'ab'], [1000, 'abc'], [40000, 'ab'], [40000, 'abcdefghijklmnopqrstuvwxyz'], [39999, 'a']]) out.push(randWord(g, n, alpha) + '\n'); out.push(periodic(g, 40000, 7, 'ab', false) + '\n', periodic(g, 40000, 12345, 'abc', true) + '\n', fib(40000) + '\n', 'a'.repeat(39999) + 'b\n', 'ab'.repeat(20000) + '\n'); return out; };

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

export default [
  {
    ...medium,
    inputFormat: ['The first line has `n`: the length of the word.', 'The second line has `n` numbers: the prefix function of some word over lowercase English letters.'],
    constraints: ['1 <= n <= 40000', 'The numbers are the prefix function of at least one word of `n` letters.'],
    slug: 'restore-the-word-from-the-prefix-function',
    title: 'Restore the Smallest Word From Its Prefix Function',
    tags: ['kmp', 'prefix-function', 'construction', 'greedy'],
    concept: {
      title: 'A positive value copies a letter; a zero must use the smallest letter that no border of the previous prefix could extend',
      body: [
        'The prefix function of a word is given. Print the **alphabetically smallest** word (over `a`..`z`) that has this prefix function. For the prefix function `0 1 0 1 2 3` the answer is `aabaab`.',
        'Build the word from left to right. If `pi[i] > 0`, the border of length `pi[i]` ends at the position `i`, so the letter at `i` **must equal** the letter after that border: `s[i] = s[pi[i] - 1]`. There is no choice. If `pi[i] = 0`, the letter `s[i]` must **differ** from every letter that would have extended a border of the previous prefix: the borders of `s[0..i-1]` have the lengths `k = pi[i - 1], pi[k - 1], ...` down to 0, and the letters `s[k]` for each such `k` (including `s[0]`, for the border of length 0) are forbidden. Take the smallest letter that is not forbidden.',
        { code: 'forbidden letters at i (when pi[i] == 0):\n    k = pi[i - 1]\n    while True:\n        forbid(s[k])                  # s[k] would continue the border of length k\n        if k == 0: break\n        k = pi[k - 1]\ns[i] = the smallest letter not forbidden' },
        'Why the smallest letter is then correct: all the other positions are forced, so the word is determined by the choices at the zeros, and choosing the smallest allowed letter at each of them minimises the word position by position (an earlier choice cannot change which letters are allowed later in a way that helps). The chain of borders is short on average, so the construction is fast; it is a total of O(n) amortised because the chain walk is the same as in the prefix-function algorithm. About `log n` different letters are enough for any valid input.'
      ]
    },
    statement: ['The prefix function of a word (of lowercase English letters) is given: for each `i`, the length of the longest proper prefix of the first `i + 1` letters that is also its suffix. Print the alphabetically smallest word that has this prefix function. It is guaranteed that such a word exists and that it needs at most 26 different letters.'],
    outputFormat: ['Print the word.'],
    examples: [{ input: '6\n0 1 0 1 2 3\n', note: 'The word aabaab has this prefix function and is the smallest: aabaab.' }, { input: '4\n0 0 0 0\n', note: 'Every new letter only has to differ from the first letter a, so the smallest word is abbb.' }],
    hints: ['If pi[i] > 0 the letter is forced: s[i] = s[pi[i] - 1].', 'If pi[i] = 0 the letter must differ from s[k] for every border length k of the previous prefix, including k = 0.', 'Take the smallest letter that is not forbidden.'],
    program: {
      io: ['n:int', 'pi:int[n]'],
      fast: true,
      python: r`
        s = ["a"] * n
        for i in range(1, n):
            if pi[i] > 0:
                s[i] = s[pi[i] - 1]
            else:
                banned = set()
                k = pi[i - 1]
                while True:
                    banned.add(s[k])
                    if k == 0:
                        break
                    k = pi[k - 1]
                c = 0
                while chr(97 + c) in banned:
                    c += 1
                s[i] = chr(97 + c)
        print("".join(s))`,
      cpp: r`
        string s(n, 'a');
        for (long long i = 1; i < n; i++) {
            if (pi[i] > 0) {
                s[i] = s[pi[i] - 1];
            } else {
                bool banned[26] = {false};
                long long k = pi[i - 1];
                while (true) {
                    banned[s[k] - 'a'] = true;
                    if (k == 0) break;
                    k = pi[k - 1];
                }
                int c = 0;
                while (banned[c]) c++;
                s[i] = (char)('a' + c);
            }
        }
        cout << s << "\n";`,
      java: r`
        int cn = (int) n;
        char[] s = new char[cn];
        s[0] = 'a';
        for (int i = 1; i < cn; i++) {
            if (pi[i] > 0) {
                s[i] = s[(int) pi[i] - 1];
            } else {
                boolean[] banned = new boolean[26];
                int k = (int) pi[i - 1];
                while (true) {
                    banned[s[k] - 'a'] = true;
                    if (k == 0) break;
                    k = (int) pi[k - 1];
                }
                int c = 0;
                while (banned[c]) c++;
                s[i] = (char) ('a' + c);
            }
        }
        System.out.println(new String(s));`,
      includes: ['<string>']
    },
    solution: { explanation: ['Positions with a positive prefix function copy the letter after the border; at a zero the smallest letter that differs from the letters following every border of the previous prefix (including the empty border) is used.'], complexity: 'Time O(n) amortised, space O(n).' },
    solve(input) {
      const pi = nums(rows(input)[1]); const n = pi.length; const s = ['a']; for (let i = 1; i < n; i++) { if (pi[i] > 0) s.push(s[pi[i] - 1]); else { const banned = new Set(); let k = pi[i - 1]; for (;;) { banned.add(s[k]); if (k === 0) break; k = pi[k - 1]; } let c = 0; while (banned.has(String.fromCharCode(97 + c))) c++; s.push(String.fromCharCode(97 + c)); } } return s.join('');
    },
    tests() {
      const g = rng(4501); const out = ['6\n0 1 0 1 2 3\n', '1\n0\n', '4\n0 0 0 0\n', '5\n0 1 2 3 4\n'];
      const piInput = (s) => `${s.length}\n${prefixFn(s).join(' ')}\n`;
      const brute = (input) => { const pi = nums(rows(input)[1]); const n = pi.length; const target = pi.join(' '); const rec = (prefix) => { if (prefix.length === n) return prefixFn(prefix).join(' ') === target ? prefix : null; for (let c = 0; c < 4; c++) { const next = prefix + String.fromCharCode(97 + c); if (prefixFn(next).join(' ') !== pi.slice(0, next.length).join(' ')) continue; const res = rec(next); if (res) return res; } return null; }; return rec(''); };
      crossCheck(() => piInput(randWord(g, randInt(g, 1, 9), 'abc')), (i) => this.solve(i), brute, 600);
      for (const [n, alpha] of [[30, 'ab'], [1000, 'abc'], [40000, 'ab'], [40000, 'abcdefghijklmnopqrstuvwxyz'], [39999, 'abcd']]) out.push(piInput(randWord(g, n, alpha)));
      out.push(piInput(periodic(g, 40000, 7, 'ab', false)), piInput(fib(40000)), piInput('a'.repeat(40000)), piInput('abcdefghijklmnopqrstuvwxyz'.repeat(1500)));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 40000', 'The word consists of lowercase English letters.'],
    slug: 'how-often-does-each-prefix-occur',
    title: 'How Many Times Does Each Prefix Occur in the Word?',
    tags: ['kmp', 'prefix-function', 'counting', 'dp-on-borders'],
    concept: {
      title: 'Every occurrence of a prefix ends at a position where it is a border; counts flow along the chain of borders',
      body: [
        'For each prefix of the word `s` (the first `L` letters, for `L = 1..n`), count **how many times it occurs in `s` as a substring** (occurrences may overlap). For `ababa` the prefix `a` occurs 3 times, `ab` 2 times, `aba` 2 times, `abab` once and `ababa` once: `3 2 2 1 1`. Counting each prefix by a search costs O(n^2) in total.',
        'A prefix of length `L` ends at the position `i` of the word exactly when the prefix `s[0..i]` has a border of length `L` or is of length `L` itself (the prefix of length `L` is a suffix of `s[0..i]`). So each position `i` contributes 1 to the longest prefix that ends there, `pi[i + 1... ]`, hmm, in detail: position `i` contributes to the prefix of length `i + 1` (itself), to the prefix of length `pi[i]` (its longest border), then to `pi[pi[i] - 1]`, and so on down the whole chain of borders.',
        { code: 'cnt = [1] * (n + 1)                  # cnt[L]: each prefix occurs at least as itself\nfor i in range(n - 1, 0, -1):         # from the longest prefix to the shortest\n    cnt[pi[i]] += cnt[i + 1]           # the occurrences of the prefix of length i + 1\n                                       # are also occurrences of its longest border\nprint(cnt[1:])' },
        'Every occurrence of the prefix of length `i + 1` is also an occurrence of its longest border `pi[i]`, because that border is a suffix of the prefix; adding the count of the longer prefix to the border collects the whole chain without walking it, in the right order (from the longest prefix to the shortest). Time O(n). The entry for the zero border (`cnt[0]`) is ignored. The counts are at most `n`.'
      ]
    },
    statement: ['A word `s` is given. For every `L` from 1 to `n` print how many times the prefix of length `L` occurs in `s` as a substring (overlapping occurrences are counted). Print the `n` numbers on one line.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    examples: [{ input: 'ababa\n', note: 'The prefixes a, ab, aba, abab, ababa occur 3, 2, 2, 1, 1 times.' }],
    hints: ['Each occurrence of a prefix is also an occurrence of its longest border.', 'Start with 1 for every prefix (its own occurrence).', 'Go from the longest prefix to the shortest and add the count to its border.'],
    program: {
      io: ['s:word'],
      fast: true,
      helpers: PREFIX,
      python: r`
        n = len(s)
        pi = prefix_function(s)
        cnt = [1] * (n + 1)
        for i in range(n - 1, 0, -1):
            cnt[pi[i]] += cnt[i + 1]
        print(*cnt[1:])`,
      cpp: r`
        int n = (int)s.size();
        vector<int> pi = prefixFunction(s);
        vector<long long> cnt(n + 1, 1);
        for (int i = n - 1; i > 0; i--) cnt[pi[i]] += cnt[i + 1];
        for (int L = 1; L <= n; L++) cout << (L > 1 ? " " : "") << cnt[L];
        cout << "\n";`,
      java: r`
        int n = s.length();
        int[] pi = prefixFunction(s);
        long[] cnt = new long[n + 1];
        java.util.Arrays.fill(cnt, 1);
        for (int i = n - 1; i > 0; i--) cnt[pi[i]] += cnt[i + 1];
        StringBuilder out = new StringBuilder();
        for (int L = 1; L <= n; L++) {
            if (L > 1) out.append(" ");
            out.append(cnt[L]);
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['Every occurrence of a prefix is also an occurrence of its longest border, so the counts are pushed from the longest prefix to its border along pi, starting with 1 for each prefix.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const s = word(input); const n = s.length; const z = zFn(s); const res = new Array(n + 2).fill(0); // an occurrence at i contributes to the prefix lengths 1..z[i]: a difference array
      for (let i = 0; i < n; i++) { if (z[i] > 0) { res[1] += 1; res[z[i] + 1] -= 1; } } const out = []; let run = 0; for (let L = 1; L <= n; L++) { run += res[L]; out.push(run); } return out.join(' ');
    },
    tests() {
      const g = rng(4502); const brute = (input) => { const s = word(input); return s.split('').map((_, k) => { const p = s.slice(0, k + 1); let c = 0; for (let i = 0; i + p.length <= s.length; i++) if (s.startsWith(p, i)) c++; return c; }).join(' '); };
      crossCheck(() => randWord(g, randInt(g, 1, 14), 'ab') + '\n', (i) => this.solve(i), brute, 800);
      return wordTests(g);
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['2 <= length of s <= 40000', 'The word consists of lowercase English letters.'],
    slug: 'prefixes-that-are-repetitions',
    title: 'Which Prefixes of the Word Are a Block Repeated Several Times?',
    tags: ['kmp', 'prefix-function', 'period', 'repetition'],
    concept: {
      title: 'For each prefix the smallest shift is L - pi, and the prefix is a repetition exactly when this shift divides L and is smaller than L',
      body: [
        'Some prefixes of a word are a block repeated at least twice. For `aabaabaabaa` the prefix `aa` is `a` twice, `aabaab` is `aab` twice, `aabaabaab` is `aab` three times. Print **every such prefix** (its length and how many copies of the block it has), in increasing order of the length. A prefix such as `aabaa` is not a repetition.',
        'For the prefix of length `L` the smallest shift that maps it onto itself is `p = L - pi[L - 1]` (the length minus the longest border). The prefix is made of copies of its first `p` letters exactly when `p` divides `L`. It is a repetition of **at least two copies** when additionally `p < L`, that is, `pi[L - 1] > 0`. The number of copies is then `L / p`. So one pass over the prefix function finds all of them.',
        { code: 'pi = prefix_function(s)\nresult = []\nfor L in range(2, n + 1):\n    p = L - pi[L - 1]\n    if pi[L - 1] > 0 and L % p == 0:\n        result.append((L, L // p))\nprint(len(result))\nfor L, copies in result: print(L, copies)' },
        'This is the classical problem about the *periods of prefixes*. It works because the longest border gives the shortest period of every prefix, and a word that has a period `p` dividing its length is a power of its first `p` letters. Time O(n). If no prefix is a repetition, only `0` is printed.'
      ]
    },
    statement: ['A word `s` is given. Find all the prefixes of `s` that consist of a block repeated two or more times. Print their number, and then for each of them (in increasing order of the length) a line with its length and the number of repeated blocks.'],
    outputFormat: ['The first line has the number `m` of such prefixes.', 'Each of the next `m` lines has the length of a prefix and the number of blocks.'],
    examples: [{ input: 'aabaabaabaa\n', note: 'The prefixes aa (2 blocks of a), aabaab (2 blocks of aab) and aabaabaab (3 blocks of aab) qualify: 3 prefixes, printed as 2 2, 6 2, 9 3.' }, { input: 'abc\n', note: 'No prefix is a repetition: 0.' }],
    hints: ['The smallest shift of the prefix of length L is L - pi[L - 1].', 'The prefix is a repetition when this shift divides L and the border is not empty.', 'The number of blocks is L divided by the shift.'],
    program: {
      io: ['s:word'],
      fast: true,
      helpers: PREFIX,
      python: r`
        n = len(s)
        pi = prefix_function(s)
        result = []
        for L in range(2, n + 1):
            p = L - pi[L - 1]
            if pi[L - 1] > 0 and L % p == 0:
                result.append(str(L) + " " + str(L // p))
        print(len(result))
        if result:
            print("\n".join(result))`,
      cpp: r`
        int n = (int)s.size();
        vector<int> pi = prefixFunction(s);
        string body;
        long long count = 0;
        for (int L = 2; L <= n; L++) {
            int p = L - pi[L - 1];
            if (pi[L - 1] > 0 && L % p == 0) {
                count++;
                body += to_string(L) + " " + to_string(L / p) + "\n";
            }
        }
        cout << count << "\n" << body;`,
      java: r`
        int n = s.length();
        int[] pi = prefixFunction(s);
        StringBuilder body = new StringBuilder();
        long count = 0;
        for (int L = 2; L <= n; L++) {
            int p = L - pi[L - 1];
            if (pi[L - 1] > 0 && L % p == 0) {
                count++;
                body.append(L).append(" ").append(L / p).append("\n");
            }
        }
        System.out.println(count);
        System.out.print(body);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The smallest shift of the prefix of length L is L minus the longest border; the prefix is a repetition of at least two blocks when the border is not empty and the shift divides L.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const s = word(input); const n = s.length; const res = []; for (let L = 2; L <= n; L++) { for (let p = 1; p * 2 <= L; p++) { if (L % p === 0 && s.slice(0, p).repeat(L / p) === s.slice(0, L)) { res.push([L, L / p]); break; } } } return `${res.length}${res.length ? '\n' + res.map((x) => x.join(' ')).join('\n') : ''}`;
    },
    tests() {
      const g = rng(4503); const brute = (input) => this.solve(input);
      crossCheck(() => randWord(g, randInt(g, 2, 12), 'ab') + '\n', (i) => this.solve(i), brute, 100);
      const out = wordTests(g, ['aabaabaabaa\n', 'abc\n', 'aa\n']).filter((x) => x.length > 2);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 40000', 'The word consists of lowercase English letters.'],
    slug: 'border-that-also-occurs-inside',
    title: 'The Longest Prefix That Is Also a Suffix and Appears in the Middle',
    tags: ['kmp', 'prefix-function', 'borders', 'strings'],
    concept: {
      title: 'The longest border that is not longer than the largest prefix-function value found strictly inside the word',
      body: [
        'Find the longest word `t` that is simultaneously a **prefix** of `s`, a **suffix** of `s`, and also occurs **somewhere inside** `s` (at a position that is neither the beginning nor the end). Print its length, or 0 if there is no such word. For `fixprefixsuffix` the answer is 3 (`fix`): it is the beginning, the end, and also appears in the middle. For `abcdabc` there is no such `t` (the border `abc` does not appear inside) and the answer is 0.',
        'A candidate `t` is a **border** of `s`. It occurs in the middle exactly when it ends at a position `e < n - 1` (and starts after the beginning). Such an occurrence means that the prefix `s[0..e]` has a border of length at least `|t|` (the occurrence itself is a suffix of that prefix, and it equals a prefix of `s`), so `pi[e] >= |t|`. Let `m` be the **largest `pi[i]` for `i` from 0 to n - 2**. Then `|t| <= m` is necessary. It is also sufficient: take the position `i` where `pi[i] = m`; the suffix of `s[0..i]` of length `m` equals the prefix of `s` of length `m`, and `t` (a prefix of `s` with `|t| <= m`) is a prefix of it, so `t` occurs at the start of that suffix, which is inside the word. Therefore the answer is the **longest border of `s` that is at most `m`**.',
        { code: 'pi = prefix_function(s)\nm = max(pi[:-1], default=0)        # the largest value strictly before the end\nk = pi[-1]\nwhile k > m:                       # the borders of s: pi[n - 1], pi[pi[n - 1] - 1], ...\n    k = pi[k - 1]\nprint(k)' },
        'If the borders are `b1 > b2 > ...` (the chain), the first one that is `<= m` is the answer; the walk down the chain ends at 0 when no border qualifies. The prefix itself (the occurrence at the beginning) is not counted as "inside", which is why only the values `pi[i]` for `i < n - 1` are considered and why a value found at the position `|t| - 1` is impossible (`pi[|t| - 1] < |t|`).'
      ]
    },
    statement: ['A word `s` is given. Find the longest word `t` that is a prefix of `s`, a suffix of `s`, and also occurs in `s` at some other place that is neither the start nor the end (an occurrence in the middle may overlap with the beginning or the end). Print the length of `t`, or 0 if there is no such word.'],
    outputFormat: ['Print the length.'],
    examples: [{ input: 'fixprefixsuffix\n', note: 'The word fix is the beginning, the end and also occurs in the middle: 3.' }, { input: 'abcdabc\n', note: 'The border abc does not occur inside: 0.' }],
    hints: ['The answer is a border of the whole word.', 'It occurs inside when it is not longer than the maximum of pi[0..n - 2].', 'Walk down the chain of borders until the length is at most that maximum.'],
    program: {
      io: ['s:word'],
      fast: true,
      helpers: PREFIX,
      python: r`
        n = len(s)
        pi = prefix_function(s)
        m = max(pi[:-1], default=0)
        k = pi[-1]
        while k > m:
            k = pi[k - 1]
        print(k)`,
      cpp: r`
        int n = (int)s.size();
        vector<int> pi = prefixFunction(s);
        int m = 0;
        for (int i = 0; i + 1 < n; i++) m = max(m, pi[i]);
        int k = pi[n - 1];
        while (k > m) k = pi[k - 1];
        cout << k << "\n";`,
      java: r`
        int n = s.length();
        int[] pi = prefixFunction(s);
        int m = 0;
        for (int i = 0; i + 1 < n; i++) m = Math.max(m, pi[i]);
        int k = pi[n - 1];
        while (k > m) k = pi[k - 1];
        System.out.println(k);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['The answer is the longest border of the word that is not longer than the largest prefix-function value among the positions before the last one.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const s = word(input); const n = s.length; for (let L = n - 1; L >= 1; L--) { const t = s.slice(0, L); if (s.slice(n - L) !== t) continue; const idx = s.indexOf(t, 1); if (idx !== -1 && idx + L < n) return String(L); } return '0'; // the first later occurrence must end before the last letter
    },
    tests() {
      const g = rng(4504); const brute = (input) => { const s = word(input); const n = s.length; let best = 0; for (let L = 1; L < n; L++) { const t = s.slice(0, L); if (s.slice(n - L) !== t) continue; for (let i = 1; i + L < n; i++) if (s.startsWith(t, i)) { best = L; break; } } return String(best); };
      crossCheck(() => randWord(g, randInt(g, 1, 14), 'ab') + '\n', (i) => this.solve(i), brute, 800);
      return wordTests(g, ['fixprefixsuffix\n', 'abcdabc\n', 'aaa\n', 'aaaa\n']);
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the circular text `t`.', 'The second line has the pattern `p`.'],
    constraints: ['1 <= length of p <= length of t <= 40000', 'Both words consist of lowercase English letters.'],
    slug: 'matches-in-a-circular-text',
    title: 'How Many Starting Points of a Circular Text Spell the Pattern?',
    tags: ['kmp', 'pattern-matching', 'circular', 'strings'],
    concept: {
      title: 'Unroll the circle by appending the first |p| - 1 letters of the text, then count the matches that start inside the original text',
      body: [
        'A text is written around a circle, so after its last letter comes its first letter again. For every starting letter of the circle, read `|p|` letters clockwise. Count the starting letters for which the word read is **equal to the pattern**. For the circular text `abcab` and the pattern `cab`, the five starts give `abc`, `bca`, `cab`, `aba` and `bab`, so only one start matches and the answer is 1.',
        'A read of `|p|` letters that starts at the position `i` of the text and goes around the end is a substring of the text **written twice**. It is enough to append to the text its first `|p| - 1` letters: `u = t + t[0 .. |p| - 2]`. A match of `p` in `u` that starts at the position `i < |t|` corresponds to the start `i` on the circle (there are no matches that start at a position `>= |t|`, because there are only `|p| - 1` extra letters). So count the occurrences of `p` in `u` with the prefix function of `p + "#" + u`.',
        { code: 'u = t + t[:len(p) - 1]\nc = p + "#" + u\npi = prefix_function(c)\nm = len(p)\ncount = sum(1 for i in range(m + 1, len(c)) if pi[i] == m)\nprint(count)' },
        'Each start position of the circle is counted once, even if the pattern is as long as the text (then `u` has `|t| + |t| - 1` letters). For a text like `aaaa` and the pattern `aa` the answer is 4: every start gives `aa`. The program is linear in the size of the text.'
      ]
    },
    statement: ['A circular text `t` and a pattern `p` (not longer than `t`) are given. For each of the `|t|` letters of the circle, read `|p|` letters starting from it and going around. Print how many of these reads are equal to `p`.'],
    outputFormat: ['Print the number of starting letters.'],
    examples: [{ input: 'abcab\ncab\n', note: 'The five starts give abc, bca, cab, aba and bab; only the third matches: 1.' }, { input: 'aaaa\naa\n', note: 'Every start gives aa: 4.' }],
    hints: ['Extend the text with its first |p| - 1 letters.', 'Count the occurrences of the pattern in the extended text.', 'Occurrences can only start inside the original text.'],
    program: {
      io: ['t:word', 'p:word'],
      fast: true,
      helpers: PREFIX,
      python: r`
        m = len(p)
        u = t + t[:m - 1]
        c = p + "#" + u
        pi = prefix_function(c)
        print(sum(1 for i in range(m + 1, len(c)) if pi[i] == m))`,
      cpp: r`
        int m = (int)p.size();
        string u = t + t.substr(0, m - 1);
        string c = p + "#" + u;
        vector<int> pi = prefixFunction(c);
        long long count = 0;
        for (int i = m + 1; i < (int)c.size(); i++) if (pi[i] == m) count++;
        cout << count << "\n";`,
      java: r`
        int m = p.length();
        String u = t + t.substring(0, m - 1);
        String c = p + "#" + u;
        int[] pi = prefixFunction(c);
        long count = 0;
        for (int i = m + 1; i < c.length(); i++) if (pi[i] == m) count++;
        System.out.println(count);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The text is extended with its first |p| - 1 letters and the occurrences of the pattern in the extended text are counted with the prefix function; every occurrence starts inside the original text.'], complexity: 'Time O(|t| + |p|), space O(|t| + |p|).' },
    solve(input) {
      const [t, p] = rows(input); const m = p.length; let c = 0; const u = t + t.slice(0, m - 1); for (let i = 0; i < t.length; i++) if (u.startsWith(p, i)) c++; return String(c);
    },
    tests() {
      const g = rng(4505); const out = ['abcab\ncab\n', 'aaaa\naa\n', 'a\na\n'];
      const brute = (input) => { const [t, p] = rows(input); let c = 0; for (let i = 0; i < t.length; i++) { let ok = true; for (let k = 0; k < p.length; k++) if (t[(i + k) % t.length] !== p[k]) ok = false; if (ok) c++; } return String(c); };
      crossCheck(() => { const t = randWord(g, randInt(g, 1, 12), 'ab'); const m = randInt(g, 1, t.length); const start = randInt(g, 0, t.length - 1); const p = g() < 0.6 ? (t + t).slice(start, start + m) : randWord(g, m, 'ab'); return `${t}\n${p}\n`; }, (i) => this.solve(i), brute, 800);
      const make = (n, m, alpha) => { const p = randWord(g, m, alpha); let t = ''; while (t.length < n) t += g() < 0.5 ? p : randWord(g, randInt(g, 1, m), alpha); return `${t.slice(0, n)}\n${p}\n`; };
      for (const [n, m, alpha] of [[40, 3, 'ab'], [1000, 7, 'ab'], [40000, 6, 'ab'], [40000, 100, 'abc'], [40000, 3, 'abcdefghijklmnopqrstuvwxyz']]) out.push(make(n, m, alpha));
      out.push(`${'a'.repeat(40000)}\n${'a'.repeat(20000)}\n`, `${'ab'.repeat(20000)}\n${'ab'.repeat(20000)}\n`, `${'a'.repeat(40000)}\n${'a'.repeat(40000)}\n`, `${fib(40000)}\n${fib(300)}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 40000', 'The word consists of lowercase English letters.'],
    slug: 'prefixes-that-are-squares',
    title: 'How Many Prefixes of the Word Are Two Equal Halves?',
    tags: ['z-function', 'squares', 'strings', 'counting'],
    concept: {
      title: 'The prefix of length 2L is a square exactly when the Z-value at the position L is at least L',
      body: [
        'A *square* is a word made of two equal halves, such as `abab` or `aa`. Count the **prefixes of the word `s` that are squares**. For `abababc` only `abab` (two copies of `ab`) is a square prefix: `ababab` has the halves `aba` and `bab`, which differ, so the answer is 1. For `aaaa` the prefixes `aa` and `aaaa` are squares, so the answer is 2.',
        'The prefix of length `2L` is a square when its first half `s[0..L)` equals its second half `s[L..2L)`. That says that the suffix starting at the position `L` agrees with the beginning of the word for at least `L` letters, which is exactly `z[L] >= L` in the Z-function. So the answer is the number of `L` with `1 <= L <= n / 2` and `z[L] >= L`.',
        { code: 'z = z_function(s)\ncount = sum(1 for L in range(1, n // 2 + 1) if z[L] >= L)\nprint(count)' },
        'Checking all `L` directly with string comparisons costs O(n^2); the Z-function is computed in O(n), and the test for every `L` is one comparison. Note that `L` runs only up to `n / 2` (rounded down), because the square needs `2L` letters.'
      ]
    },
    statement: ['A word `s` is given. A square is a word whose first half equals its second half (such as `abab`). Print the number of prefixes of `s` that are squares.'],
    outputFormat: ['Print the number of prefixes that are squares.'],
    examples: [{ input: 'aaaa\n', note: 'The prefixes aa and aaaa are squares: 2.' }, { input: 'abababc\n', note: 'Only abab is a square prefix: 1.' }],
    hints: ['The prefix of length 2L is a square if its two halves of length L are equal.', 'The second half starts at the position L; compare it with the beginning via the Z-function.', 'Count the lengths L up to n / 2 with z[L] >= L.'],
    program: {
      io: ['s:word'],
      fast: true,
      helpers: ZFUNC,
      python: r`
        n = len(s)
        z = z_function(s)
        print(sum(1 for L in range(1, n // 2 + 1) if z[L] >= L))`,
      cpp: r`
        int n = (int)s.size();
        vector<int> z = zFunction(s);
        long long count = 0;
        for (int L = 1; 2 * L <= n; L++) if (z[L] >= L) count++;
        cout << count << "\n";`,
      java: r`
        int n = s.length();
        int[] z = zFunction(s);
        long count = 0;
        for (int L = 1; 2 * L <= n; L++) if (z[L] >= L) count++;
        System.out.println(count);`,
      includes: ['<string>']
    },
    solution: { explanation: ['The prefix of length 2L is a square exactly when z[L] >= L; the answer counts such L up to n / 2.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const s = word(input); let c = 0; for (let L = 1; 2 * L <= s.length; L++) if (s.slice(0, L) === s.slice(L, 2 * L)) c++; return String(c); // compare the two halves directly
    },
    tests() {
      const g = rng(4506); const brute = (input) => { const s = word(input); let c = 0; for (let L = 1; 2 * L <= s.length; L++) if (s.slice(0, L) === s.slice(L, 2 * L)) c++; return String(c); };
      crossCheck(() => randWord(g, randInt(g, 1, 14), 'ab') + '\n', (i) => this.solve(i), brute, 800);
      return wordTests(g, ['abababc\n']);
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 40000', 'The word consists of lowercase English letters.'],
    slug: 'smallest-rotation-of-a-word',
    title: 'The Alphabetically Smallest Rotation of a Word',
    tags: ['strings', 'rotation', 'two-pointers', 'minimal-cyclic-shift'],
    concept: {
      title: 'Compare two candidate starts letter by letter; the loser, and the next k starts after it, can never be the minimum',
      body: [
        'A rotation of a word moves some letters from the front to the back. The rotations of `cabab` are `cabab, ababc, babca, abcab, bcaba`; the alphabetically smallest is `ababc`. Generating and comparing all `n` rotations costs O(n^2).',
        'Keep two candidate starting positions `i` and `j` (at the start `0` and `1`) and a length `k` of the part where the two rotations have been found equal. Compare the letters `s[(i + k) mod n]` and `s[(j + k) mod n]`. If they are equal, increase `k`. If the letter at `i` is **larger**, then the rotations starting at `i, i + 1, ..., i + k` can never be the smallest: each of them is beaten by the rotation that starts the same number of letters later at `j` (it has the same first `k` letters of the comparison and a smaller next letter, or reaches a smaller one), so we can skip them all: `i += k + 1`. If the letter at `j` is larger, do `j += k + 1`. Restart `k = 0` and make sure `i != j`. When one of the pointers reaches `n` or `k = n`, the smaller of `i` and `j` is the start of the smallest rotation.',
        { code: 'i, j, k = 0, 1, 0\nwhile i < n and j < n and k < n:\n    a, b = s[(i + k) % n], s[(j + k) % n]\n    if a == b:\n        k += 1; continue\n    if a > b: i += k + 1      # the starts i .. i + k lose to the starts j .. j + k\n    else:     j += k + 1\n    if i == j: j += 1\n    k = 0\nstart = min(i, j)\nprint(s[start:] + s[:start])' },
        'Every step of the loop moves `i`, `j` or `k` forward in a way that the total number of steps is at most `3n`, so the algorithm is O(n). If the word is periodic, several starts give the same rotation, and the printed word is the same whichever is found. This is the *minimal cyclic shift* (Booth or two-pointer algorithm).'
      ]
    },
    statement: ['A word `s` is given. Print the alphabetically smallest of its rotations (a rotation moves some letters from the beginning to the end).'],
    outputFormat: ['Print the smallest rotation.'],
    examples: [{ input: 'cabab\n', note: 'The smallest rotation is ababc.' }, { input: 'aaa\n', note: 'All rotations are equal: aaa.' }],
    hints: ['Keep two candidate starts i and j and the length k of the common part.', 'If the letter at i is larger, skip the starts i .. i + k; if the letter at j is larger, skip j .. j + k.', 'The smaller pointer at the end is the start of the answer.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        n = len(s)
        i, j, k = 0, 1, 0
        while i < n and j < n and k < n:
            a = s[(i + k) % n]
            b = s[(j + k) % n]
            if a == b:
                k += 1
                continue
            if a > b:
                i += k + 1
            else:
                j += k + 1
            if i == j:
                j += 1
            k = 0
        start = min(i, j)
        print(s[start:] + s[:start])`,
      cpp: r`
        int n = (int)s.size();
        int i = 0, j = 1, k = 0;
        while (i < n && j < n && k < n) {
            char a = s[(i + k) % n], b = s[(j + k) % n];
            if (a == b) {
                k++;
                continue;
            }
            if (a > b) i += k + 1;
            else j += k + 1;
            if (i == j) j++;
            k = 0;
        }
        int start = min(i, j);
        cout << s.substr(start) + s.substr(0, start) << "\n";`,
      java: r`
        int n = s.length();
        int i = 0, j = 1, k = 0;
        while (i < n && j < n && k < n) {
            char a = s.charAt((i + k) % n), b = s.charAt((j + k) % n);
            if (a == b) {
                k++;
                continue;
            }
            if (a > b) i += k + 1;
            else j += k + 1;
            if (i == j) j++;
            k = 0;
        }
        int start = Math.min(i, j);
        System.out.println(s.substring(start) + s.substring(0, start));`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['Two candidate starts are compared letter by letter; the start with the larger letter and the k starts after it are discarded, and the smaller pointer at the end gives the smallest rotation.'], complexity: 'Time O(n), space O(1) extra.' },
    solve(input) {
      const s = word(input); const n = s.length; if (n <= 3000) { let best = s; const doubled = s + s; for (let i = 1; i < n; i++) { const cand = doubled.slice(i, i + n); if (cand < best) best = cand; } return best; } // compare every rotation; for long words the Lyndon factorization of the doubled word gives the start
      const d = s + s; let i = 0, start = 0; while (i < n) { start = i; let j = i + 1, k = i; while (j < 2 * n && d[k] <= d[j]) { k = d[k] < d[j] ? i : k + 1; j++; } while (i <= k) i += j - k; } return d.slice(start, start + n);
    },
    tests() {
      const g = rng(4507); const naive = (s) => { let best = s; const doubled = s + s; for (let i = 1; i < s.length; i++) { const cand = doubled.slice(i, i + s.length); if (cand < best) best = cand; } return best; };
      crossCheck(() => randWord(g, randInt(g, 1, 12), 'ab') + '\n', (i) => this.solve(i), (i) => naive(word(i)), 800);
      for (let rep = 0; rep < 30; rep++) { const input = randWord(g, randInt(g, 3001, 4000), 'ab') + '\n'; if (this.solve(input) !== naive(word(input))) throw new Error('the Lyndon method differs from the naive one'); }
      const out = ['cabab\n', 'aaa\n', 'a\n', 'ba\n', 'abcabca\n'];
      for (const [n, alpha] of [[30, 'ab'], [1000, 'abc'], [40000, 'ab'], [40000, 'abcdefghijklmnopqrstuvwxyz'], [39999, 'a']]) out.push(randWord(g, n, alpha) + '\n');
      out.push(periodic(g, 40000, 7, 'ab', false) + '\n', periodic(g, 40000, 12345, 'abc', true) + '\n', fib(40000) + '\n', 'b'.repeat(39999) + 'a\n', 'ab'.repeat(20000) + '\n', 'ba'.repeat(20000) + '\n');
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 40000', 'The word consists of lowercase English letters.'],
    slug: 'split-into-descending-lyndon-words',
    title: 'Split a Word Into Smaller and Smaller Lyndon Words',
    tags: ['strings', 'lyndon-words', 'duval', 'factorization'],
    concept: {
      title: 'Duval\'s algorithm grows a periodic block while the letters keep pace with it, and cuts off whole copies of the block when they stop',
      body: [
        'A *Lyndon word* is a non-empty word that is **strictly smaller than all its proper suffixes** (equivalently, than all its rotations): `a`, `ab`, `aab`, `abb` are Lyndon words, `ba` and `abab` are not. Every word can be written in exactly one way as `w1 w2 ... wk` with every `wi` a Lyndon word and `w1 >= w2 >= ... >= wk`. For `bababa` the factorization is `b`, `ab`, `ab`, `a`.',
        'Duval\'s algorithm finds the factorization in one pass. It keeps a position `i` (the start of the not yet cut part), a scanner `j` and a pointer `k` into the current block: the part `s[i..j)` has the form `u^m u\'` where `u` is a Lyndon word and `u\'` is a prefix of `u`. Look at the next letter `s[j]` and compare it with `s[k]`, the letter that would continue the periodic pattern. If `s[k] < s[j]`, the block `s[i..j]` becomes a single Lyndon word, so `k = i`. If they are equal, the pattern continues: `k += 1`. If `s[k] > s[j]`, the word cannot be extended; cut off all the **full copies** of `u` (each of length `j - k`) and restart from the first letter after them.',
        { code: 'i = 0\nlengths = []\nwhile i < n:\n    j, k = i + 1, i\n    while j < n and s[k] <= s[j]:\n        k = i if s[k] < s[j] else k + 1\n        j += 1\n    while i <= k:                  # cut the copies of the Lyndon word of length j - k\n        lengths.append(j - k)\n        i += j - k\nprint(len(lengths), *lengths)' },
        'Each letter is looked at a constant number of times, so the algorithm is O(n) in time and O(1) in extra memory. The same algorithm gives the smallest rotation (the start of the last factor of the doubled word), and it is the base of several string algorithms such as the construction of suffix arrays by sorting.'
      ]
    },
    statement: ['A Lyndon word is a non-empty word that is strictly smaller than each of its proper suffixes. Every word `s` can be written uniquely as a concatenation of Lyndon words that do not increase: `w1 >= w2 >= ... >= wk`. Print `k` and then the lengths of `w1, ..., wk` on one line.'],
    outputFormat: ['Print `k` followed by the `k` lengths of the factors, all on one line.'],
    examples: [{ input: 'bababa\n', note: 'The factors are b, ab, ab and a: four factors of the lengths 1, 2, 2, 1, so the output is 4 1 2 2 1.' }],
    hints: ['A factor is as long as possible; the factors do not increase.', 'Keep i (start), j (scanner) and k (the matching place in the block).', 'When s[k] > s[j], cut off the copies of the block of length j - k.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        n = len(s)
        i = 0
        lengths = []
        while i < n:
            j = i + 1
            k = i
            while j < n and s[k] <= s[j]:
                if s[k] < s[j]:
                    k = i
                else:
                    k += 1
                j += 1
            while i <= k:
                lengths.append(j - k)
                i += j - k
        print(len(lengths), *lengths)`,
      cpp: r`
        int n = (int)s.size();
        int i = 0;
        vector<int> lengths;
        while (i < n) {
            int j = i + 1, k = i;
            while (j < n && s[k] <= s[j]) {
                if (s[k] < s[j]) k = i;
                else k++;
                j++;
            }
            while (i <= k) {
                lengths.push_back(j - k);
                i += j - k;
            }
        }
        cout << lengths.size();
        for (int x : lengths) cout << " " << x;
        cout << "\n";`,
      java: r`
        int n = s.length();
        int i = 0;
        StringBuilder out = new StringBuilder();
        int count = 0;
        while (i < n) {
            int j = i + 1, k = i;
            while (j < n && s.charAt(k) <= s.charAt(j)) {
                if (s.charAt(k) < s.charAt(j)) k = i;
                else k++;
                j++;
            }
            while (i <= k) {
                count++;
                out.append(" ").append(j - k);
                i += j - k;
            }
        }
        System.out.println(count + out.toString());`,
      includes: ['<string>']
    },
    solution: { explanation: ['Duval\'s algorithm scans the word keeping the start of the uncut part, a scanner and a pointer inside the current Lyndon block; when the scanner letter is smaller than the pointer letter, all full copies of the block are cut off.'], complexity: 'Time O(n), space O(1) extra.' },
    solve(input) {
      const s = word(input); const n = s.length; if (n <= 300) { const isLyndon = (w) => { for (let i = 1; i < w.length; i++) if (w.slice(i) <= w) return false; return true; }; const out = []; let i = 0; while (i < n) { let best = 1; for (let L = 1; i + L <= n; L++) if (isLyndon(s.slice(i, i + L))) best = L; out.push(best); i += best; } return [out.length, ...out].join(' '); } // the longest Lyndon prefix of the rest, repeatedly; Duval for long words
      const out = []; let i = 0; while (i < n) { let j = i + 1, k = i; while (j < n && s[k] <= s[j]) { k = s[k] < s[j] ? i : k + 1; j++; } while (i <= k) { out.push(j - k); i += j - k; } } return [out.length, ...out].join(' ');
    },
    tests() {
      const g = rng(4508); const naive = (input) => { const s = word(input); const isLyndon = (w) => { for (let i = 1; i < w.length; i++) if (w.slice(i) <= w) return false; return true; }; const out = []; let i = 0; while (i < s.length) { let best = 1; for (let L = 1; i + L <= s.length; L++) if (isLyndon(s.slice(i, i + L))) best = L; out.push(best); i += best; } return [out.length, ...out].join(' '); };
      crossCheck(() => randWord(g, randInt(g, 1, 12), 'ab') + '\n', (i) => this.solve(i), naive, 800);
      for (let rep = 0; rep < 20; rep++) { const input = randWord(g, randInt(g, 301, 500), 'abc') + '\n'; if (this.solve(input) !== naive(input)) throw new Error('Duval differs from the naive factorization'); }
      const out = ['bababa\n', 'a\n', 'ba\n', 'abc\n', 'cba\n', 'aabaab\n'];
      for (const [n, alpha] of [[30, 'ab'], [300, 'abc'], [40000, 'ab'], [40000, 'abcdefghijklmnopqrstuvwxyz'], [39999, 'a']]) out.push(randWord(g, n, alpha) + '\n');
      out.push(periodic(g, 40000, 7, 'ab', false) + '\n', fib(40000) + '\n', 'zyxwvutsrqponmlkjihgfedcba'.repeat(1500) + '\n', 'abcdefghijklmnopqrstuvwxyz'.repeat(1500) + '\n');
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['One line with the word `s`.'],
    constraints: ['1 <= length of s <= 40000', 'The word consists of lowercase English letters.'],
    slug: 'palindromes-around-each-centre',
    title: 'The Longest Palindrome Around Each Letter',
    tags: ['strings', 'manacher', 'palindromes', 'linear-time'],
    concept: {
      title: 'Manacher\'s algorithm mirrors the radius of the centre inside the rightmost palindrome found so far',
      body: [
        'For every letter of the word `s` find the length of the **longest palindrome of odd length that has this letter in its centre**. For `abacaba` the answers are `1 3 1 7 1 3 1` (the whole word is a palindrome around its middle letter `c`). Expanding around every centre one letter at a time costs O(n^2) on a word like `aaaa...a`.',
        'Keep the palindrome `[l, r]` with the **rightmost end** found so far, and the radius array `d[i]` (the number of palindromes centred at `i`, equal to half the length plus one). For a new centre `i` inside `[l, r]` the mirror position `l + r - i` has already been computed. Because the palindrome `[l, r]` is symmetric, the palindrome around `i` starts with the same radius as the one around its mirror, but no more than the distance to the right end: `d[i] = min(d[l + r - i], r - i + 1)`. Then try to expand from there while the letters on both sides agree, and if the palindrome now reaches beyond `r`, update `[l, r]`.',
        { code: 'd = [0] * n\nl, r = 0, -1\nfor i in range(n):\n    k = 1 if i > r else min(d[l + r - i], r - i + 1)\n    while i - k >= 0 and i + k < n and s[i - k] == s[i + k]:\n        k += 1                              # expand only beyond the known part\n    d[i] = k\n    if i + k - 1 > r:\n        l, r = i - k + 1, i + k - 1\nprint(*[2 * k - 1 for k in d])' },
        'Each expansion step moves the right end `r` forward, and `r` never moves back, so there are at most `n` expansion steps in total: the algorithm is **O(n)**. The length of the longest odd palindrome around `i` is `2 * d[i] - 1`. The same method with the centres between letters gives the even palindromes.'
      ]
    },
    statement: ['A word `s` is given. For every position `i` print the length of the longest palindrome of odd length whose middle letter is the letter at the position `i`. Print the `n` numbers on one line.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    examples: [{ input: 'abacaba\n', note: 'The lengths are 1 3 1 7 1 3 1.' }, { input: 'aaaa\n', note: 'The lengths are 1 3 3 1.' }],
    hints: ['Keep the palindrome [l, r] that reaches farthest to the right.', 'For a centre inside it, start from the mirrored radius, limited by the right end.', 'Expand by comparison only beyond the known part, and update [l, r].'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        n = len(s)
        d = [0] * n
        l, rr = 0, -1
        for i in range(n):
            k = 1 if i > rr else min(d[l + rr - i], rr - i + 1)
            while i - k >= 0 and i + k < n and s[i - k] == s[i + k]:
                k += 1
            d[i] = k
            if i + k - 1 > rr:
                l, rr = i - k + 1, i + k - 1
        print(*[2 * k - 1 for k in d])`,
      cpp: r`
        int n = (int)s.size();
        vector<int> d(n, 0);
        int l = 0, rr = -1;
        for (int i = 0; i < n; i++) {
            int k = (i > rr) ? 1 : min(d[l + rr - i], rr - i + 1);
            while (i - k >= 0 && i + k < n && s[i - k] == s[i + k]) k++;
            d[i] = k;
            if (i + k - 1 > rr) {
                l = i - k + 1;
                rr = i + k - 1;
            }
        }
        for (int i = 0; i < n; i++) cout << (i ? " " : "") << 2 * d[i] - 1;
        cout << "\n";`,
      java: r`
        int n = s.length();
        int[] d = new int[n];
        int l = 0, rr = -1;
        for (int i = 0; i < n; i++) {
            int k = (i > rr) ? 1 : Math.min(d[l + rr - i], rr - i + 1);
            while (i - k >= 0 && i + k < n && s.charAt(i - k) == s.charAt(i + k)) k++;
            d[i] = k;
            if (i + k - 1 > rr) {
                l = i - k + 1;
                rr = i + k - 1;
            }
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) out.append(" ");
            out.append(2 * d[i] - 1);
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['Manacher\'s algorithm keeps the palindrome reaching farthest to the right, starts each radius from the mirrored one (limited by that right end) and expands only beyond the known part, so the total work is linear.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const s = word(input); const n = s.length; return s.split('').map((_, i) => { let k = 1; while (i - k >= 0 && i + k < n && s[i - k] === s[i + k]) k++; return 2 * k - 1; }).join(' '); // expand around each centre
    },
    tests() {
      const g = rng(4509); const brute = (input) => this.solve(input);
      crossCheck(() => randWord(g, randInt(g, 1, 14), 'ab') + '\n', (i) => this.solve(i), brute, 100);
      const out = ['abacaba\n', 'aaaa\n', 'a\n', 'ab\n', 'abcba\n'];
      for (const [n, alpha] of [[30, 'ab'], [1000, 'abc'], [30000, 'ab'], [30000, 'abcdefghijklmnopqrstuvwxyz']]) out.push(randWord(g, n, alpha) + '\n');
      const pal = (half, alpha) => { const h = randWord(g, half, alpha); return h + h.split('').reverse().join('').slice(1); };
      out.push(pal(15000, 'ab') + '\n', pal(15000, 'abc') + '\n', 'a'.repeat(30000) + '\n', ('ab'.repeat(5000) + 'a').repeat(2) + '\n', fib(30000) + '\n', 'a'.repeat(15000) + 'b' + 'a'.repeat(15000) + '\n');
      return out;
    }
  }
];
