import { r, rng, randInt, randArray, many, nums, rows, randWord, shuffle } from '../../lib.mjs';

// Runs fast(input) against a slow, independent computation on many small random inputs; throws when they differ.
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const isPal = (s) => s === [...s].reverse().join('');
const lenCompare = (p, q) => { for (let i = 0; i < Math.min(p.length, q.length); i++) if (p[i] !== q[i]) return p[i] - q[i]; return p.length - q.length; };

export default [
  {
    slug: 'palindrome-partitions',
    title: 'Cut a Word Into Palindromes',
    difficulty: 'medium',
    tags: ['backtracking', 'strings', 'palindrome'],
    concept: {
      title: 'Try every length for the next piece, keep only the good ones',
      body: [
        'To cut a word into pieces that are all palindromes, look at the start of the part that is not cut yet. Try every length for the **next piece**: if the piece is a palindrome, take it, cut the rest recursively, and then remove the piece again. A piece that is not a palindrome is not tried further, so the search never builds a wrong cut.',
        { code: 'def split(s, start, current, out):\n    if start == len(s):\n        out.append("|".join(current))        # the whole word is cut\n        return\n    for end in range(start + 1, len(s) + 1):\n        piece = s[start:end]\n        if piece == piece[::-1]:               # only a palindrome may be a piece\n            current.append(piece)\n            split(s, end, current, out)\n            current.pop()' },
        'Every letter alone is a palindrome, so there is always at least one cut (every letter in its own piece). A word of `n` equal letters has `2^(n-1)` cuts: a cut or no cut between any two neighbours. Trying the shorter piece first gives the order used in the statement.'
      ]
    },
    statement: ['Cut a word into pieces so that every piece is a palindrome (reads the same forwards and backwards). Print all possible cuts. Write the pieces of a cut separated by `|`. Order the cuts by the lengths of their pieces from left to right: a cut with a shorter first piece comes first; if the first pieces are equal, compare the second pieces, and so on.'],
    inputFormat: ['The only line has the word of lowercase letters.'],
    outputFormat: ['All cuts, one per line, pieces separated by `|`.'],
    constraints: ['1 <= length of the word <= 12'],
    examples: [{ input: 'aab\n', note: 'The cuts are a|a|b and aa|b.' }],
    hints: ['Try every end for the next piece, from the shortest to the longest.', 'Go deeper only when the piece is a palindrome.', 'When the start reaches the end of the word, record the cut.'],
    program: {
      io: ['s:word'],
      helpers: {
        python: r`
          def split(s, start, current, out):
              if start == len(s):
                  out.append("|".join(current))
                  return
              for end in range(start + 1, len(s) + 1):
                  piece = s[start:end]
                  if piece == piece[::-1]:
                      current.append(piece)
                      split(s, end, current, out)
                      current.pop()`,
        cpp: r`
          bool palindrome(const string& s, int i, int j) {
              while (i < j) {
                  if (s[i] != s[j]) return false;
                  i++;
                  j--;
              }
              return true;
          }

          void split(const string& s, size_t start, vector<string>& current, vector<string>& out) {
              if (start == s.size()) {
                  string line;
                  for (size_t i = 0; i < current.size(); i++) line += (i ? "|" : "") + current[i];
                  out.push_back(line);
                  return;
              }
              for (size_t end = start + 1; end <= s.size(); end++) {
                  if (palindrome(s, (int)start, (int)end - 1)) {
                      current.push_back(s.substr(start, end - start));
                      split(s, end, current, out);
                      current.pop_back();
                  }
              }
          }`,
        java: r`
          static boolean palindrome(String s, int i, int j) {
              while (i < j) {
                  if (s.charAt(i) != s.charAt(j)) return false;
                  i++;
                  j--;
              }
              return true;
          }

          static void split(String s, int start, List<String> current, List<String> out) {
              if (start == s.length()) {
                  out.add(String.join("|", current));
                  return;
              }
              for (int end = start + 1; end <= s.length(); end++) {
                  if (palindrome(s, start, end - 1)) {
                      current.add(s.substring(start, end));
                      split(s, end, current, out);
                      current.remove(current.size() - 1);
                  }
              }
          }`
      },
      python: r`
        out = []
        split(s, 0, [], out)
        print("\n".join(out))`,
      cpp: r`
        vector<string> out;
        vector<string> current;
        split(s, 0, current, out);
        for (const string& line : out) cout << line << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        split(s, 0, new ArrayList<>(), out);
        StringBuilder sb = new StringBuilder();
        for (String line : out) sb.append(line).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['At each start position, the function tries pieces from the shortest to the longest, goes deeper only for palindromes, and records the cut when the start reaches the end of the word.'], complexity: 'Time O(2^n * n) in the worst case, space O(n) besides the output.' },
    solve(input) {
      const s = rows(input)[0].trim(); const n = s.length; const cuts = [];
      for (let mask = 0; mask < 1 << (n - 1); mask++) { const pieces = []; let start = 0; for (let i = 0; i < n; i++) if (i === n - 1 || (mask >> i) & 1) { pieces.push(s.slice(start, i + 1)); start = i + 1; } if (pieces.every(isPal)) cuts.push(pieces); }
      cuts.sort((p, q) => lenCompare(p.map((x) => x.length), q.map((x) => x.length)));
      return cuts.map((p) => p.join('|')).join('\n');
    },
    tests() { const g = rng(634); return ['aab\n', 'a\n', 'ab\n', 'aaa\n', 'abcba\n', 'aaaaaaaaaaaa\n', 'abababababab\n', 'abacabacabad\n', `${randWord(g, 12, 'ab')}\n`, `${randWord(g, 12, 'abc')}\n`, `${randWord(g, 11, 'a')}\n`, 'aabbaabbaabb\n', 'racecarracec\n']; }
  },

  {
    slug: 'restore-ip-addresses',
    title: 'Put the Dots Back in an Address',
    difficulty: 'medium',
    tags: ['backtracking', 'strings', 'pruning'],
    concept: {
      title: 'Four pieces of length 1 to 3, with a rule for each piece',
      body: [
        'An IPv4 address has four numbers from 0 to 255 separated by dots, and a number with more than one digit has no leading zero (`01` is not allowed, `0` is). You get the digits without dots and must put three dots back in every valid way. That is a search of depth **four**: for each of the four numbers choose its length (1, 2 or 3), check the piece, and continue.',
        { code: 'def restore(s, start, parts, out):\n    if len(parts) == 4:\n        if start == len(s):                  # all the digits are used\n            out.append(".".join(parts))\n        return\n    for length in (1, 2, 3):\n        piece = s[start:start + length]\n        if len(piece) < length:\n            break                              # not enough digits left\n        if (len(piece) > 1 and piece[0] == "0") or int(piece) > 255:\n            continue                           # a leading zero or a number that is too big\n        parts.append(piece)\n        restore(s, start + length, parts, out)\n        parts.pop()' },
        'The rule for a piece is checked **before** the piece is taken, so no invalid address is ever built. The depth is only 4 and each level has at most 3 choices, so there are at most 81 paths, whatever the input. The smaller length is tried first and the dot (code 46) is smaller than a digit (code 48), so the addresses come out in dictionary order.'
      ]
    },
    statement: ['Given a string of digits, insert three dots to make a valid IPv4 address: four numbers from 0 to 255, each written without a leading zero (the number 0 is written as `0`), using all the digits in order. Print every valid address in dictionary order, one per line. If there is none, print `-1`.'],
    inputFormat: ['The only line has the digits.'],
    outputFormat: ['The addresses in dictionary order, one per line, or `-1`.'],
    constraints: ['1 <= number of digits <= 12'],
    examples: [{ input: '25525511135\n', note: 'The two addresses are 255.255.11.135 and 255.255.111.35.' }],
    hints: ['The address has exactly four parts, and each part has 1, 2 or 3 digits.', 'A part must be at most 255 and must not start with 0 unless it is just 0.', 'The four parts must use all the digits: check that at the end.'],
    program: {
      io: ['s:word'],
      helpers: {
        python: r`
          def restore(s, start, parts, out):
              if len(parts) == 4:
                  if start == len(s):
                      out.append(".".join(parts))
                  return
              for length in (1, 2, 3):
                  piece = s[start:start + length]
                  if len(piece) < length:
                      break
                  if (len(piece) > 1 and piece[0] == "0") or int(piece) > 255:
                      continue
                  parts.append(piece)
                  restore(s, start + length, parts, out)
                  parts.pop()`,
        cpp: r`
          void restore(const string& s, size_t start, vector<string>& parts, vector<string>& out) {
              if (parts.size() == 4) {
                  if (start == s.size()) out.push_back(parts[0] + "." + parts[1] + "." + parts[2] + "." + parts[3]);
                  return;
              }
              for (size_t length = 1; length <= 3 && start + length <= s.size(); length++) {
                  string piece = s.substr(start, length);
                  if ((piece.size() > 1 && piece[0] == '0') || stoi(piece) > 255) continue;
                  parts.push_back(piece);
                  restore(s, start + length, parts, out);
                  parts.pop_back();
              }
          }`,
        java: r`
          static void restore(String s, int start, List<String> parts, List<String> out) {
              if (parts.size() == 4) {
                  if (start == s.length()) out.add(String.join(".", parts));
                  return;
              }
              for (int length = 1; length <= 3 && start + length <= s.length(); length++) {
                  String piece = s.substring(start, start + length);
                  if ((piece.length() > 1 && piece.charAt(0) == '0') || Integer.parseInt(piece) > 255) continue;
                  parts.add(piece);
                  restore(s, start + length, parts, out);
                  parts.remove(parts.size() - 1);
              }
          }`
      },
      python: r`
        out = []
        restore(s, 0, [], out)
        print("\n".join(out) if out else -1)`,
      cpp: r`
        vector<string> out;
        vector<string> parts;
        restore(s, 0, parts, out);
        if (out.empty()) cout << -1 << "\n";
        for (const string& line : out) cout << line << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        restore(s, 0, new ArrayList<>(), out);
        if (out.isEmpty()) System.out.println(-1);
        StringBuilder sb = new StringBuilder();
        for (String line : out) sb.append(line).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Four levels, each choosing a part of 1 to 3 digits. A part with a leading zero or a value above 255 is skipped. After four parts, the address is recorded only if all digits were used.'], complexity: 'Time O(1): at most 81 paths of depth 4.' },
    solve(input) {
      const s = rows(input)[0].trim(); const out = [];
      for (let a = 1; a <= 3; a++) for (let b = 1; b <= 3; b++) for (let c = 1; c <= 3; c++) { const d = s.length - a - b - c; if (d < 1 || d > 3) continue; const parts = [s.slice(0, a), s.slice(a, a + b), s.slice(a + b, a + b + c), s.slice(a + b + c)]; if (parts.every((p) => (p.length === 1 || p[0] !== '0') && Number(p) <= 255)) out.push(parts.join('.')); }
      out.sort(); return out.length ? out.join('\n') : '-1';
    },
    tests() { const g = rng(635); const digits = (n) => many(n, () => randInt(g, 0, 9)).join(''); return ['25525511135\n', '0000\n', '101023\n', '1\n', '123\n', '1111\n', '255255255255\n', '255255255256\n', '010010\n', '000000000000\n', '100100100100\n', '172162541\n', `${digits(8)}\n`, `${digits(10)}\n`, `${digits(12)}\n`, '1111111111\n', '999999999999\n']; }
  },

  {
    slug: 'word-break-sentences',
    title: 'All the Sentences From a Dictionary',
    difficulty: 'medium',
    tags: ['backtracking', 'strings', 'recursion'],
    concept: {
      title: 'At each position, try every word that starts there',
      body: [
        'You have a string without spaces and a small dictionary. A **sentence** is a way to cut the string into dictionary words. The search stands at a position `start`. For each dictionary word, check whether the string **continues with this word** at `start`; if so, take it and go on from the end of the word.',
        { code: 'def sentences(s, start, words, current, out):\n    if start == len(s):\n        out.append(" ".join(current))      # the whole string is used\n        return\n    for w in words:\n        if s.startswith(w, start):\n            current.append(w)\n            sentences(s, start + len(w), words, current, out)\n            current.pop()' },
        'Different sequences of words are different sentences, even when they use the same words in the same positions otherwise. The number of sentences can grow very fast (a string `aaaa...` with the words `a`, `aa`, `aaa` has more than 100 000 sentences for 20 letters), which is why the tests keep the number of sentences small. The sentences are sorted at the end, because the order in which the search finds them depends on the dictionary order.'
      ]
    },
    statement: ['You are given a string `s` and a dictionary of `k` different words. Print every sentence that can be made by cutting `s` into dictionary words (words separated by single spaces, a word can be used many times). Print the sentences in dictionary order of the whole line, one per line. If there is no sentence, print `-1`.'],
    inputFormat: ['The first line has `s`.', 'The second line has `k`.', 'The third line has the `k` words.'],
    outputFormat: ['The sentences in dictionary order, one per line, or `-1`.'],
    constraints: ['1 <= length of s <= 20', '1 <= k <= 10, and each word has 1 to 10 lowercase letters', 'There are at most 2000 sentences.'],
    examples: [{ input: 'catsanddog\n5\ncat cats and sand dog\n', note: 'The sentences are cat sand dog and cats and dog.' }],
    hints: ['At each position test every dictionary word with a starts-with check.', 'Go on from the position after the word, and remove the word again afterwards.', 'When the position reaches the end of the string, record the sentence; sort all sentences at the end.'],
    program: {
      io: ['s:word', 'k:int', 'words:word[k]'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def sentences(s, start, words, current, out):
              if start == len(s):
                  out.append(" ".join(current))
                  return
              for w in words:
                  if s.startswith(w, start):
                      current.append(w)
                      sentences(s, start + len(w), words, current, out)
                      current.pop()`,
        cpp: r`
          void sentences(const string& s, size_t start, const vector<string>& words, vector<string>& current, vector<string>& out) {
              if (start == s.size()) {
                  string line;
                  for (size_t i = 0; i < current.size(); i++) line += (i ? " " : "") + current[i];
                  out.push_back(line);
                  return;
              }
              for (const string& w : words) {
                  if (s.compare(start, w.size(), w) == 0) {
                      current.push_back(w);
                      sentences(s, start + w.size(), words, current, out);
                      current.pop_back();
                  }
              }
          }`,
        java: r`
          static void sentences(String s, int start, String[] words, List<String> current, List<String> out) {
              if (start == s.length()) {
                  out.add(String.join(" ", current));
                  return;
              }
              for (String w : words) {
                  if (s.startsWith(w, start)) {
                      current.add(w);
                      sentences(s, start + w.length(), words, current, out);
                      current.remove(current.size() - 1);
                  }
              }
          }`
      },
      python: r`
        out = []
        sentences(s, 0, words, [], out)
        out.sort()
        print("\n".join(out) if out else -1)`,
      cpp: r`
        vector<string> out;
        vector<string> current;
        sentences(s, 0, words, current, out);
        sort(out.begin(), out.end());
        if (out.empty()) cout << -1 << "\n";
        for (const string& line : out) cout << line << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        sentences(s, 0, words, new ArrayList<>(), out);
        Collections.sort(out);
        if (out.isEmpty()) System.out.println(-1);
        StringBuilder sb = new StringBuilder();
        for (String line : out) sb.append(line).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['At each position every dictionary word that matches there is tried; the recursion continues after it. A completed cut is joined with spaces, and all sentences are sorted at the end.'], complexity: 'Time proportional to the number of partial cuts, at most a few thousand here.' },
    solve(input) {
      const rs = rows(input); const s = rs[0].trim(); const words = rs[2].trim().split(/\s+/);
      const memo = new Map(); const go = (i) => { if (i === s.length) return ['']; if (memo.has(i)) return memo.get(i); const out = []; for (const w of words) if (s.startsWith(w, i)) for (const rest of go(i + w.length)) out.push(rest ? w + ' ' + rest : w); memo.set(i, out); return out; };
      const all = go(0).sort(); return all.length ? all.join('\n') : '-1';
    },
    tests() {
      const g = rng(636);
      const make = (s, words) => `${s}\n${words.length}\n${words.join(' ')}\n`;
      const check = (s, words) => { const n = this.solve(make(s, words)).split('\n').length; if (n > 2000) throw new Error('too many sentences ' + n); return make(s, words); };
      return ['catsanddog\n5\ncat cats and sand dog\n', make('a', ['a']), make('a', ['b']), make('aaaa', ['a', 'aa']), make('pineapplepenapple', ['apple', 'pen', 'applepen', 'pine', 'pineapple']), check('aaaaaaaaaaaa', ['a', 'aa', 'aaa']), check('abababababab', ['a', 'b', 'ab', 'ba']), check('abcdefghij', ['a', 'ab', 'abc', 'bc', 'cd', 'def', 'de', 'efg', 'fgh', 'ghij']), check('catcatcatcat', ['cat', 'c', 'at', 'ca', 't']), check('thequickbrownfox', ['the', 'quick', 'brown', 'fox', 'th', 'e', 'qu', 'ick', 'bro', 'wn']), check('aaaaaaaaaaab', ['a', 'aa', 'aaa', 'b']), make('xyz', ['x', 'y']), check('bbbbbbbbbbbbbb', ['b', 'bb', 'bbbbbbbbbb']), check('aaaaaaaaaaaaaaaaaaaa', ['aaaaaaaaaa', 'aaaaaaa', 'aaaaa', 'aaa', 'a'.repeat(4), 'a'.repeat(6), 'a'.repeat(9), 'a'.repeat(8), 'a'.repeat(2), 'a'.repeat(1) + 'b'].slice(0, 4))];
    }
  },

  {
    slug: 'additive-sequence',
    title: 'Is the Digit String an Additive Sequence?',
    difficulty: 'medium',
    tags: ['backtracking', 'strings', 'recursion'],
    concept: {
      title: 'Guess the first two numbers, then the rest is forced',
      body: [
        'An *additive sequence* has at least three numbers and every number from the third one on is the **sum of the two numbers before it**, like `1, 99, 100, 199`. A string of digits is additive if it can be cut into such a sequence. Once the first two numbers are chosen, the whole rest of the string is **forced**: the next number must be their sum, and the sum must appear in the string right there.',
        { code: 'def follows(s, pos, x, y):           # the numbers x, y are done; s[pos:] must continue\n    if pos == len(s):\n        return True\n    t = str(x + y)                    # the next number is forced\n    return s.startswith(t, pos) and follows(s, pos + len(t), y, x + y)' },
        'So the search is only over the **lengths of the first two numbers** (two nested loops). For each choice the check `follows` is a recursion that either succeeds or fails at the first mismatch. Numbers may not have leading zeros (a number `0` is fine, `01` is not). The numbers stay below 10^17 here, so sums fit in a 64-bit integer.'
      ]
    },
    statement: ['A string of digits is *additive* if it can be cut into at least three numbers (no number has a leading zero, except the number 0 itself) so that every number after the first two is the sum of the two numbers before it. Decide whether the given string is additive.'],
    inputFormat: ['The only line has the digit string.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length of the string <= 18'],
    examples: [{ input: '199100199\n', note: '1 + 99 = 100, 99 + 100 = 199: the sequence is 1, 99, 100, 199.' }],
    hints: ['Try every length for the first number and for the second number.', 'The next number must be the sum of the last two; write it as text and check that the string continues with it.', 'A number with more than one digit must not start with 0.'],
    program: {
      io: ['s:word'],
      helpers: {
        python: r`
          def follows(s, pos, x, y):
              if pos == len(s):
                  return True
              t = str(x + y)
              return s.startswith(t, pos) and follows(s, pos + len(t), y, x + y)`,
        cpp: r`
          bool follows(const string& s, size_t pos, long long x, long long y) {
              if (pos == s.size()) return true;
              string t = to_string(x + y);
              if (s.compare(pos, t.size(), t) != 0) return false;
              return follows(s, pos + t.size(), y, x + y);
          }`,
        java: r`
          static boolean follows(String s, int pos, long x, long y) {
              if (pos == s.length()) return true;
              String t = String.valueOf(x + y);
              if (!s.startsWith(t, pos)) return false;
              return follows(s, pos + t.length(), y, x + y);
          }`
      },
      python: r`
        n = len(s)
        found = False
        for i in range(1, n):
            for j in range(i + 1, n):
                a, b = s[:i], s[i:j]
                if (len(a) > 1 and a[0] == "0") or (len(b) > 1 and b[0] == "0"):
                    continue
                if follows(s, j, int(a), int(b)):
                    found = True
        print("yes" if found else "no")`,
      cpp: r`
        int len = (int)s.size();
        bool found = false;
        for (int i = 1; i < len; i++) {
            for (int j = i + 1; j < len; j++) {
                string a = s.substr(0, i), b = s.substr(i, j - i);
                if ((a.size() > 1 && a[0] == '0') || (b.size() > 1 && b[0] == '0')) continue;
                if (follows(s, j, stoll(a), stoll(b))) found = true;
            }
        }
        cout << (found ? "yes" : "no") << "\n";`,
      java: r`
        int len = s.length();
        boolean found = false;
        for (int i = 1; i < len; i++) {
            for (int j = i + 1; j < len; j++) {
                String a = s.substring(0, i), b = s.substring(i, j);
                if ((a.length() > 1 && a.charAt(0) == '0') || (b.length() > 1 && b.charAt(0) == '0')) continue;
                if (follows(s, j, Long.parseLong(a), Long.parseLong(b))) found = true;
            }
        }
        System.out.println(found ? "yes" : "no");`
    },
    solution: { explanation: ['For each pair of lengths of the first two numbers (without leading zeros), the following numbers are forced: each must be the sum of the previous two and must appear in the string at the current position. The string is additive if one choice consumes it all.'], complexity: 'Time O(n^3) at most, space O(n).' },
    solve(input) {
      const s = rows(input)[0].trim(); const n = s.length;
      for (let i = 1; i < n; i++) for (let j = i + 1; j < n; j++) { const a = s.slice(0, i), b = s.slice(i, j); if ((a.length > 1 && a[0] === '0') || (b.length > 1 && b[0] === '0')) continue; let x = BigInt(a), y = BigInt(b), pos = j, ok = true; while (pos < n) { const t = String(x + y); if (s.slice(pos, pos + t.length) !== t) { ok = false; break; } pos += t.length; [x, y] = [y, x + y]; } if (ok) return 'yes'; }
      return 'no';
    },
    tests() {
      const g = rng(637);
      const seq = (a, b, count) => { const out = [a, b]; while (out.length < count) out.push(out[out.length - 1] + out[out.length - 2]); return out.join(''); };
      const noise = (s) => { const d = [...s]; const k = randInt(g, 0, d.length - 1); d[k] = String((Number(d[k]) + 1) % 10); return d.join(''); };
      const longSeq = (a, b) => { let out = [a, b]; for (;;) { const next = out[out.length - 1] + out[out.length - 2]; if ((out.join('') + next).length > 18) break; out.push(next); } return out.join(''); };
      return ['199100199\n', '112358\n', '101\n', '1023\n', '000\n', '123\n', '1\n', '12\n', `${seq(1, 2, 9)}\n`, `${noise(seq(1, 2, 9))}\n`, `${seq(7, 11, 6)}\n`, `${seq(100, 200, 5)}\n`, `${seq(5, 0, 6)}\n`, `${seq(0, 0, 6)}\n`, `${seq(12, 99, 5)}\n`, `${noise(seq(12, 99, 5))}\n`, `${longSeq(1, 1)}\n`, `${longSeq(3, 7)}\n`, `${noise(longSeq(1, 1))}\n`, `${longSeq(1234, 56789)}\n`, '199001200\n', '1111122335588\n'];
    }
  },

  {
    slug: 'strobogrammatic-numbers',
    title: 'Numbers That Look the Same Upside Down',
    difficulty: 'medium',
    tags: ['recursion', 'strings', 'enumeration'],
    concept: {
      title: 'Build from the middle outwards in matching pairs',
      body: [
        'Turn a number upside down (rotate it by 180 degrees): `0`, `1` and `8` look the same, `6` becomes `9` and `9` becomes `6`, other digits are not valid. A number is **strobogrammatic** if it reads the same after the rotation. The first digit and the last digit must be a pair `(a, b)` from `00`, `11`, `88`, `69`, `96`, and the digits between them form a shorter strobogrammatic number.',
        { code: 'def build(m, n):            # all strobogrammatic strings of length m; n is the full length\n    if m == 0:\n        return [""]\n    if m == 1:\n        return ["0", "1", "8"]      # the middle digit is its own mirror\n    result = []\n    for mid in build(m - 2, n):\n        for a, b in (("0", "0"), ("1", "1"), ("6", "9"), ("8", "8"), ("9", "6")):\n            if m == n and a == "0":\n                continue               # no leading zero in the whole number\n            result.append(a + mid + b)\n    return result' },
        'The recursion goes from `m` to `m - 2`, wrapping a pair around every shorter answer. The pair `00` is allowed inside but never as the outermost pair (the number would start with 0), except for the single digit `0`. The base cases are the empty string and the three one-digit numbers.'
      ]
    },
    statement: ['A number is *strobogrammatic* if it looks the same when rotated by 180 degrees (the digits `0`, `1`, `8` stay, `6` and `9` swap, no other digit can be used). Print all strobogrammatic numbers with exactly `n` digits in increasing order, one per line. A number does not start with 0, except the number 0 itself when `n = 1`.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['The numbers in increasing order, one per line.'],
    constraints: ['1 <= n <= 9'],
    examples: [{ input: '2\n', note: 'The numbers are 11, 69, 88 and 96.' }],
    hints: ['The outer pair of digits is one of 00, 11, 88, 69, 96; the inside is a shorter answer.', 'Do not allow 0 as the first digit of the whole number.', 'Length 0 gives one empty string, length 1 gives 0, 1 and 8.'],
    program: {
      io: ['n:int'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def build(m, n):
              if m == 0:
                  return [""]
              if m == 1:
                  return ["0", "1", "8"]
              result = []
              for mid in build(m - 2, n):
                  for a, b in (("0", "0"), ("1", "1"), ("6", "9"), ("8", "8"), ("9", "6")):
                      if m == n and a == "0":
                          continue
                      result.append(a + mid + b)
              return result`,
        cpp: r`
          vector<string> build(int m, int n) {
              if (m == 0) return {""};
              if (m == 1) return {"0", "1", "8"};
              vector<string> result;
              const char* pairs[5][2] = {{"0", "0"}, {"1", "1"}, {"6", "9"}, {"8", "8"}, {"9", "6"}};
              for (const string& mid : build(m - 2, n)) {
                  for (int p = 0; p < 5; p++) {
                      if (m == n && p == 0) continue;
                      result.push_back(string(pairs[p][0]) + mid + pairs[p][1]);
                  }
              }
              return result;
          }`,
        java: r`
          static List<String> build(int m, int n) {
              if (m == 0) return new ArrayList<>(List.of(""));
              if (m == 1) return new ArrayList<>(List.of("0", "1", "8"));
              String[][] pairs = {{"0", "0"}, {"1", "1"}, {"6", "9"}, {"8", "8"}, {"9", "6"}};
              List<String> result = new ArrayList<>();
              for (String mid : build(m - 2, n)) {
                  for (int p = 0; p < 5; p++) {
                      if (m == n && p == 0) continue;
                      result.add(pairs[p][0] + mid + pairs[p][1]);
                  }
              }
              return result;
          }`
      },
      python: 'print("\\n".join(sorted(build(n, n))))',
      cpp: r`
        vector<string> out = build((int)n, (int)n);
        sort(out.begin(), out.end());
        for (const string& s : out) cout << s << "\n";`,
      java: r`
        List<String> out = build((int) n, (int) n);
        Collections.sort(out);
        StringBuilder sb = new StringBuilder();
        for (String s : out) sb.append(s).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The answers of length `m` are the answers of length `m - 2` wrapped in one of the pairs 00, 11, 69, 88, 96 (without 00 on the outside). Lengths 0 and 1 are the base cases. All strings of one length sort the same as the numbers.'], complexity: 'Time O(count * n), where count is at most 1500.' },
    solve(input) {
      const n = Number(rows(input)[0]); const flip = { 0: '0', 1: '1', 6: '9', 8: '8', 9: '6' };
      const ok = (s) => { for (let i = 0; i < s.length; i++) if (flip[s[i]] !== s[s.length - 1 - i]) return false; return true; };
      const all = []; const go = (s) => { if (s.length === n) { if ((n === 1 || s[0] !== '0') && ok(s)) all.push(s); return; } for (const d of '01689') go(s + d); };
      go(''); return all.sort().join('\n');
    },
    tests() { return many(9, (i) => `${i + 1}\n`); }
  },

  {
    slug: 'max-unique-concatenation',
    title: 'The Longest Word Without a Repeated Letter',
    difficulty: 'medium',
    tags: ['backtracking', 'bitmask', 'subsets'],
    concept: {
      title: 'A set of letters as one number',
      body: [
        'Choose some of the words and glue them together so that **no letter appears twice** in the result. The only thing that matters about a chosen set of words is the **set of letters used**. There are 26 letters, so a set of letters fits in the bits of an integer: bit `c` is 1 if the letter number `c` is used. Two words can be glued only if their masks have **no common bit**: `mask1 & mask2 == 0`.',
        { code: 'def best(masks, lengths, i, used):\n    if i == len(masks):\n        return 0\n    result = best(masks, lengths, i + 1, used)                 # skip word i\n    if masks[i] >= 0 and masks[i] & used == 0:                 # word i fits\n        result = max(result, lengths[i] + best(masks, lengths, i + 1, used | masks[i]))\n    return result' },
        'A word that already repeats a letter inside itself can never be used; give it the mask `-1` so that it is always skipped. The recursion makes a take-or-skip decision for every word, so there are `2^n` leaves at most, but a taken word that clashes with the used letters is never explored: a conflict ends that branch at once.'
      ]
    },
    statement: ['You are given `n` words of lowercase letters. Choose some of the words (possibly none) and write them one after another so that **all the letters of the result are different**. Print the largest possible length of the result.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` words.'],
    outputFormat: ['Print the largest length.'],
    constraints: ['1 <= n <= 16', '1 <= length of each word <= 26'],
    examples: [{ input: '3\nun iq ue\n', note: 'The words un and iq fit together (u, n, i, q are different), and ue cannot be added because u would repeat. The best length is 4.' }],
    hints: ['Represent the letters of a word as a bit mask; a word with a repeated letter is unusable.', 'Two words fit together only if their masks share no bit.', 'For every word decide: skip it, or take it if it fits.'],
    program: {
      io: ['n:int', 'words:word[n]'],
      helpers: {
        python: r`
          def best(masks, lengths, i, used):
              if i == len(masks):
                  return 0
              result = best(masks, lengths, i + 1, used)
              if masks[i] >= 0 and masks[i] & used == 0:
                  result = max(result, lengths[i] + best(masks, lengths, i + 1, used | masks[i]))
              return result`,
        cpp: r`
          int best(const vector<int>& masks, const vector<int>& lengths, size_t i, int used) {
              if (i == masks.size()) return 0;
              int result = best(masks, lengths, i + 1, used);
              if (masks[i] >= 0 && (masks[i] & used) == 0) result = max(result, lengths[i] + best(masks, lengths, i + 1, used | masks[i]));
              return result;
          }`,
        java: r`
          static int best(int[] masks, int[] lengths, int i, int used) {
              if (i == masks.length) return 0;
              int result = best(masks, lengths, i + 1, used);
              if (masks[i] >= 0 && (masks[i] & used) == 0) result = Math.max(result, lengths[i] + best(masks, lengths, i + 1, used | masks[i]));
              return result;
          }`
      },
      python: r`
        masks = []
        lengths = []
        for w in words:
            mask = 0
            for ch in w:
                bit = 1 << (ord(ch) - 97)
                if mask & bit:
                    mask = -1
                    break
                mask |= bit
            masks.append(mask)
            lengths.append(len(w))
        print(best(masks, lengths, 0, 0))`,
      cpp: r`
        vector<int> masks, lengths;
        for (const string& w : words) {
            int mask = 0;
            for (char ch : w) {
                int bit = 1 << (ch - 'a');
                if (mask != -1 && (mask & bit)) mask = -1;
                if (mask == -1) break;
                mask |= bit;
            }
            masks.push_back(mask);
            lengths.push_back((int)w.size());
        }
        cout << best(masks, lengths, 0, 0) << "\n";`,
      java: r`
        int[] masks = new int[(int) n];
        int[] lengths = new int[(int) n];
        for (int k = 0; k < n; k++) {
            int mask = 0;
            for (char ch : words[k].toCharArray()) {
                int bit = 1 << (ch - 'a');
                if (mask != -1 && (mask & bit) != 0) mask = -1;
                if (mask == -1) break;
                mask |= bit;
            }
            masks[k] = mask;
            lengths[k] = words[k].length();
        }
        System.out.println(best(masks, lengths, 0, 0));`
    },
    solution: { explanation: ['Each word becomes a bit mask of its letters (or -1 if it repeats a letter). The recursion either skips a word or takes it when its mask does not overlap the letters already used, and returns the best total length.'], complexity: 'Time O(2^n) in the worst case, space O(n).' },
    solve(input) { const ws = rows(input)[1].trim().split(/\s+/); let bestLen = 0; for (let mask = 0; mask < 1 << ws.length; mask++) { const letters = new Set(); let total = 0, ok = true; for (let i = 0; i < ws.length && ok; i++) if ((mask >> i) & 1) for (const ch of ws[i]) { if (letters.has(ch)) { ok = false; break; } letters.add(ch); total++; } if (ok) bestLen = Math.max(bestLen, total); } return String(bestLen); },
    tests() {
      const g = rng(638);
      const LOW = 'abcdefghijklmnopqrstuvwxyz';
      const oneWord = (len, pool = LOW) => shuffle(g, [...pool]).slice(0, len).join('');
      const make = (ws) => `${ws.length}\n${ws.join(' ')}\n`;
      const randWords = (n, maxLen, pool) => many(n, () => (g() < 0.15 ? randWord(g, randInt(g, 2, 4), pool.slice(0, 3)) : oneWord(randInt(g, 1, maxLen), pool)));
      return ['3\nun iq ue\n', '1\nabcdefghijklmnopqrstuvwxyz\n', '1\naa\n', '2\nab ab\n', '2\nab cd\n', make(['abcdefghijklmnopqrstuvwxyz', 'a']), make(randWords(16, 6, LOW)), make(randWords(16, 3, 'abcdefghijklmnopqrstuvwxyz')), make(randWords(16, 8, 'abcdefghijklm')), make(many(16, (i) => LOW[i])), make(many(16, (i) => LOW[i] + LOW[(i + 1) % 16])), make(randWords(12, 10, LOW)), make(['abcd', 'efgh', 'ijkl', 'mnop', 'qrst', 'uvwx', 'yz', 'abef', 'cdgh', 'ijmn', 'klop', 'qruv', 'stwx', 'yzab', 'cdef', 'ghij'])];
    }
  },

  {
    slug: 'max-score-words',
    title: 'The Best Words From a Bag of Letters',
    difficulty: 'medium',
    tags: ['backtracking', 'subsets', 'counting'],
    concept: {
      title: 'Take a word only if the bag still has its letters',
      body: [
        'You have a bag of letters (letters can repeat) and a list of words. Each word can be written at most once, using one letter from the bag for each of its letters; a used letter is gone. Every letter is worth some points, and a word is worth the sum of its letters. Choose the words with the largest total score.',
        { code: 'def best(need, value, i, avail):          # need[i][c]: how many letters c word i needs\n    if i == len(need):\n        return 0\n    result = best(need, value, i + 1, avail)        # skip word i\n    if all(need[i][c] <= avail[c] for c in range(26)):\n        for c in range(26): avail[c] -= need[i][c]  # take the letters\n        result = max(result, value[i] + best(need, value, i + 1, avail))\n        for c in range(26): avail[c] += need[i][c]  # give them back\n    return result' },
        'This is the classical **take it or leave it** search with a table that is changed and restored (`avail`). The word is taken only if the bag can supply it, so no search is made on an impossible choice. Computing the letter counts and the value of every word once, before the search, keeps the recursion cheap.'
      ]
    },
    statement: ['You are given `n` words, a bag of letters and the score of each of the 26 letters (`a` to `z`). Each word can be written at most once and writing a word uses up one letter from the bag for each letter of the word. The score of a word is the sum of the scores of its letters. Print the largest total score of the words you can write.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` words.', 'The third line has the letters of the bag as one word.', 'The fourth line has the 26 scores.'],
    outputFormat: ['Print the largest total score.'],
    constraints: ['1 <= n <= 14, and each word has 1 to 10 letters', '1 <= number of letters in the bag <= 40', '0 <= each score <= 10'],
    examples: [{ input: '2\ncat tac\ncatt\n1 0 3 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 5 0 0 0 0 0 0\n', note: 'The bag has c, a, t, t. Only one of the words can be written (it needs c, a, t), worth 3 + 1 + 5 = 9.' }],
    hints: ['Count how many of each letter every word needs, and compute the value of every word first.', 'For every word decide: skip it, or take it if the bag has enough of all its letters.', 'Give the letters back to the bag after the recursive call.'],
    program: {
      io: ['n:int', 'words:word[n]', 'letters:word', 'score:int[26]'],
      helpers: {
        python: r`
          def best(need, value, i, avail):
              if i == len(need):
                  return 0
              result = best(need, value, i + 1, avail)
              if all(need[i][c] <= avail[c] for c in range(26)):
                  for c in range(26):
                      avail[c] -= need[i][c]
                  result = max(result, value[i] + best(need, value, i + 1, avail))
                  for c in range(26):
                      avail[c] += need[i][c]
              return result`,
        cpp: r`
          long long best(const vector<vector<int>>& need, const vector<long long>& value, size_t i, vector<int>& avail) {
              if (i == need.size()) return 0;
              long long result = best(need, value, i + 1, avail);
              bool fits = true;
              for (int c = 0; c < 26; c++) {
                  if (need[i][c] > avail[c]) fits = false;
              }
              if (fits) {
                  for (int c = 0; c < 26; c++) avail[c] -= need[i][c];
                  result = max(result, value[i] + best(need, value, i + 1, avail));
                  for (int c = 0; c < 26; c++) avail[c] += need[i][c];
              }
              return result;
          }`,
        java: r`
          static long best(int[][] need, long[] value, int i, int[] avail) {
              if (i == need.length) return 0;
              long result = best(need, value, i + 1, avail);
              boolean fits = true;
              for (int c = 0; c < 26; c++) {
                  if (need[i][c] > avail[c]) fits = false;
              }
              if (fits) {
                  for (int c = 0; c < 26; c++) avail[c] -= need[i][c];
                  result = Math.max(result, value[i] + best(need, value, i + 1, avail));
                  for (int c = 0; c < 26; c++) avail[c] += need[i][c];
              }
              return result;
          }`
      },
      python: r`
        need = []
        value = []
        for w in words:
            row = [0] * 26
            for ch in w:
                row[ord(ch) - 97] += 1
            need.append(row)
            value.append(sum(score[ord(ch) - 97] for ch in w))
        avail = [0] * 26
        for ch in letters:
            avail[ord(ch) - 97] += 1
        print(best(need, value, 0, avail))`,
      cpp: r`
        vector<vector<int>> need(n, vector<int>(26, 0));
        vector<long long> value(n, 0);
        for (int k = 0; k < n; k++) {
            for (char ch : words[k]) {
                need[k][ch - 'a']++;
                value[k] += score[ch - 'a'];
            }
        }
        vector<int> avail(26, 0);
        for (char ch : letters) avail[ch - 'a']++;
        cout << best(need, value, 0, avail) << "\n";`,
      java: r`
        int[][] need = new int[(int) n][26];
        long[] value = new long[(int) n];
        for (int k = 0; k < n; k++) {
            for (char ch : words[k].toCharArray()) {
                need[k][ch - 'a']++;
                value[k] += score[ch - 'a'];
            }
        }
        int[] avail = new int[26];
        for (char ch : letters.toCharArray()) avail[ch - 'a']++;
        System.out.println(best(need, value, 0, avail));`
    },
    solution: { explanation: ['For each word the recursion either skips it, or takes it when the bag has enough of every letter, subtracting the letters, recursing and adding them back. The result is the best total score.'], complexity: 'Time O(2^n * 26) in the worst case, space O(n).' },
    solve(input) {
      const rs = rows(input); const ws = rs[1].trim().split(/\s+/); const bag = rs[2].trim(); const score = nums(rs[3]);
      let bestScore = 0;
      for (let mask = 0; mask < 1 << ws.length; mask++) { const have = Array(26).fill(0); for (const ch of bag) have[ch.charCodeAt(0) - 97]++; let total = 0, ok = true; for (let i = 0; i < ws.length && ok; i++) if ((mask >> i) & 1) for (const ch of ws[i]) { const c = ch.charCodeAt(0) - 97; if (--have[c] < 0) { ok = false; break; } total += score[c]; } if (ok) bestScore = Math.max(bestScore, total); }
      return String(bestScore);
    },
    tests() {
      const g = rng(639);
      const scores = () => randArray(g, 26, 0, 10);
      const make = (ws, bag, sc) => `${ws.length}\n${ws.join(' ')}\n${bag}\n${sc.join(' ')}\n`;
      const words = (n, len, pool) => many(n, () => randWord(g, randInt(g, 1, len), pool));
      return ['2\ncat tac\ncatt\n1 0 3 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 5 0 0 0 0 0 0\n', make(['a'], 'a', many(26, () => 1)), make(['a'], 'b', many(26, () => 1)), make(['aa', 'a'], 'aa', many(26, () => 2)), make(words(14, 4, 'abcd'), randWord(g, 24, 'abcd'), scores()), make(words(14, 10, 'abcdefg'), randWord(g, 40, 'abcdefg'), scores()), make(words(14, 6, 'abcdefghij'), randWord(g, 30, 'abcdefghij'), scores()), make(words(14, 3, 'abc'), randWord(g, 20, 'abc'), scores()), make(words(12, 5, 'abcdefghijklmnopqrstuvwxyz'), randWord(g, 40, 'abcdefghijklmnopqrstuvwxyz'), scores()), make(many(14, () => 'abcdefghij'), 'abcdefghijabcdefghijabcdefghijabcdefghij', many(26, () => 10)), make(words(14, 8, 'xyz'), randWord(g, 40, 'xyz'), scores())];
    }
  },

  {
    slug: 'parenthesize-results',
    title: 'All Values of an Expression With Any Brackets',
    difficulty: 'medium',
    tags: ['recursion', 'divide-and-conquer', 'expressions'],
    concept: {
      title: 'Choose the operator that is applied last',
      body: [
        'Without brackets, `2*3-4*5` is read with the usual priorities, but here you may **put brackets anywhere** and every different bracketing can give a different value. Think about the **last** operator that is applied. If it is the operator number `k`, then the numbers on its left form one expression and the numbers on its right form another expression, and each of them can again be bracketed in any way.',
        { code: 'def results(nums, ops, lo, hi):          # all values of the numbers lo..hi\n    if lo == hi:\n        return {nums[lo]}\n    values = set()\n    for k in range(lo, hi):               # ops[k] is the last operator applied\n        for x in results(nums, ops, lo, k):\n            for y in results(nums, ops, k + 1, hi):\n                values.add(x + y if ops[k] == "+" else x - y if ops[k] == "-" else x * y)\n    return values' },
        'This is **divide and conquer** by the split point: for every operator, combine every value of the left part with every value of the right part. A set removes equal values, because different bracketings often meet the same result. The number of bracketings of 8 numbers is 429 (a Catalan number), small enough for the plain recursion.'
      ]
    },
    statement: ['An expression has numbers separated by the operators `+`, `-` and `*`, with no spaces. You may put brackets anywhere, in any way, so that the order of the operations changes. Print all different values that the expression can get, in increasing order, one per line.'],
    inputFormat: ['The only line has the expression.'],
    outputFormat: ['The different values in increasing order, one per line.'],
    constraints: ['The expression has 1 to 8 numbers, each between 0 and 99 (without leading zeros).', 'All values fit in a 64-bit integer.'],
    examples: [{ input: '2*3-4*5\n', note: 'The five bracketings give 10, -14, -10, -10 and -34, so the different values are -34, -14, -10 and 10.' }],
    hints: ['Pick the last operator to apply: the numbers to its left and right form two smaller expressions.', 'For every pair (value of the left part, value of the right part) apply the operator.', 'Keep the values in a set, because different bracketings can give the same value.'],
    program: {
      io: ['expr:word'],
      includes: ['<set>', '<cctype>'],
      helpers: {
        python: r`
          def results(nums, ops, lo, hi):
              if lo == hi:
                  return {nums[lo]}
              values = set()
              for k in range(lo, hi):
                  for x in results(nums, ops, lo, k):
                      for y in results(nums, ops, k + 1, hi):
                          if ops[k] == "+":
                              values.add(x + y)
                          elif ops[k] == "-":
                              values.add(x - y)
                          else:
                              values.add(x * y)
              return values`,
        cpp: r`
          set<long long> results(const vector<long long>& nums, const string& ops, int lo, int hi) {
              set<long long> values;
              if (lo == hi) {
                  values.insert(nums[lo]);
                  return values;
              }
              for (int k = lo; k < hi; k++) {
                  set<long long> left = results(nums, ops, lo, k);
                  set<long long> right = results(nums, ops, k + 1, hi);
                  for (long long x : left) {
                      for (long long y : right) {
                          if (ops[k] == '+') values.insert(x + y);
                          else if (ops[k] == '-') values.insert(x - y);
                          else values.insert(x * y);
                      }
                  }
              }
              return values;
          }`,
        java: r`
          static TreeSet<Long> results(List<Long> nums, String ops, int lo, int hi) {
              TreeSet<Long> values = new TreeSet<>();
              if (lo == hi) {
                  values.add(nums.get(lo));
                  return values;
              }
              for (int k = lo; k < hi; k++) {
                  TreeSet<Long> left = results(nums, ops, lo, k);
                  TreeSet<Long> right = results(nums, ops, k + 1, hi);
                  for (long x : left) {
                      for (long y : right) {
                          if (ops.charAt(k) == '+') values.add(x + y);
                          else if (ops.charAt(k) == '-') values.add(x - y);
                          else values.add(x * y);
                      }
                  }
              }
              return values;
          }`
      },
      python: r`
        nums = []
        ops = []
        current = ""
        for ch in expr:
            if ch.isdigit():
                current += ch
            else:
                nums.append(int(current))
                ops.append(ch)
                current = ""
        nums.append(int(current))
        print("\n".join(map(str, sorted(results(nums, ops, 0, len(nums) - 1)))))`,
      cpp: r`
        vector<long long> nums;
        string ops, current;
        for (char ch : expr) {
            if (isdigit((unsigned char)ch)) {
                current += ch;
            } else {
                nums.push_back(stoll(current));
                ops += ch;
                current.clear();
            }
        }
        nums.push_back(stoll(current));
        for (long long v : results(nums, ops, 0, (int)nums.size() - 1)) cout << v << "\n";`,
      java: r`
        List<Long> nums = new ArrayList<>();
        StringBuilder ops = new StringBuilder();
        StringBuilder current = new StringBuilder();
        for (char ch : expr.toCharArray()) {
            if (Character.isDigit(ch)) {
                current.append(ch);
            } else {
                nums.add(Long.parseLong(current.toString()));
                ops.append(ch);
                current.setLength(0);
            }
        }
        nums.add(Long.parseLong(current.toString()));
        StringBuilder sb = new StringBuilder();
        for (long v : results(nums, ops.toString(), 0, nums.size() - 1)) sb.append(v).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['For every choice of the last operator, all values of the left part are combined with all values of the right part. The base case is a single number. A set keeps each value once, and the values are printed in increasing order.'], complexity: 'Time proportional to the Catalan number of the operators (429 for seven operators), space O(that).' },
    solve(input) {
      const parts = rows(input)[0].trim().match(/\d+|[-+*]/g); const nums2 = [], ops = [];
      parts.forEach((p, i) => (i % 2 === 0 ? nums2.push(BigInt(p)) : ops.push(p)));
      const memo = new Map();
      const go = (lo, hi) => { const key = lo * 10 + hi; if (memo.has(key)) return memo.get(key); let set = new Set(); if (lo === hi) set.add(nums2[lo]); else for (let k = lo; k < hi; k++) for (const x of go(lo, k)) for (const y of go(k + 1, hi)) set.add(ops[k] === '+' ? x + y : ops[k] === '-' ? x - y : x * y); memo.set(key, set); return set; };
      return [...go(0, nums2.length - 1)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).join('\n');
    },
    tests() {
      const g = rng(640);
      const expr = (count, hi) => many(count, (i) => String(randInt(g, 0, hi)) + (i < count - 1 ? '+-*'[randInt(g, 0, 2)] : '')).join('') + '\n';
      return ['2*3-4*5\n', '7\n', '1+1\n', '2-3\n', '5*5*5\n', '0-0*0\n', '1+2+3+4\n', '9-8-7-6-5\n', expr(5, 9), expr(6, 9), expr(7, 20), expr(8, 99), expr(8, 9), expr(8, 99), '99*99*99*99*99*99*99*99\n', '99-99*99-99*99-99*99-99\n'];
    }
  },

  {
    slug: 'word-abbreviations',
    title: 'Every Way to Abbreviate a Word',
    difficulty: 'medium',
    tags: ['backtracking', 'strings', 'subsets'],
    concept: {
      title: 'Each letter is kept or skipped, and skipped runs become numbers',
      body: [
        'To abbreviate a word, you replace some **non-overlapping runs of consecutive letters** by the length of the run: `word` can become `w2d` (the two letters `or` are replaced by 2), `4`, `1o2`, and so on. Every letter has two possible fates: it is **kept**, or it is **skipped** (becomes part of a number). A run of skipped letters is written as one number.',
        'The search walks along the word and remembers how many letters were skipped since the last kept letter. When a letter is kept, the pending number (if not zero) is written first, then the letter. At the end of the word, a pending number is written last.',
        { code: 'def abbr(w, pos, skipped, current, out):\n    if pos == len(w):\n        out.append("".join(current) + (str(skipped) if skipped else ""))\n        return\n    abbr(w, pos + 1, skipped + 1, current, out)                   # skip this letter\n    current.append((str(skipped) if skipped else "") + w[pos])   # keep it\n    abbr(w, pos + 1, 0, current, out)\n    current.pop()' },
        'Every one of the `2^n` choices gives a different text, so no duplicate has to be removed. Digits have smaller codes than letters, so the sorted order puts the abbreviations that begin with a number first.'
      ]
    },
    statement: ['Print all abbreviations of a word. An abbreviation is made by replacing any number of non-overlapping runs of consecutive letters with the length of the run (the replaced letters of one run become one number). Print the abbreviations in ascending order (digits come before letters; compare character by character), one per line.'],
    inputFormat: ['The only line has the word of lowercase letters.'],
    outputFormat: ['The `2^n` abbreviations in ascending order, one per line.'],
    constraints: ['1 <= length of the word <= 10'],
    examples: [{ input: 'ab\n', note: 'The four abbreviations are 1b, 2, a1 and ab.' }],
    hints: ['Every letter is either kept or skipped: two calls per position.', 'Count the letters skipped in a row; write the count before the next kept letter, or at the end.', 'There are 2^n results and they are all different; sort them at the end.'],
    program: {
      io: ['word:word'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def abbr(w, pos, skipped, current, out):
              if pos == len(w):
                  out.append("".join(current) + (str(skipped) if skipped else ""))
                  return
              abbr(w, pos + 1, skipped + 1, current, out)
              current.append((str(skipped) if skipped else "") + w[pos])
              abbr(w, pos + 1, 0, current, out)
              current.pop()`,
        cpp: r`
          void abbr(const string& w, size_t pos, int skipped, string& current, vector<string>& out) {
              if (pos == w.size()) {
                  out.push_back(current + (skipped ? to_string(skipped) : ""));
                  return;
              }
              abbr(w, pos + 1, skipped + 1, current, out);
              size_t before = current.size();
              if (skipped) current += to_string(skipped);
              current += w[pos];
              abbr(w, pos + 1, 0, current, out);
              current.resize(before);
          }`,
        java: r`
          static void abbr(String w, int pos, int skipped, StringBuilder current, List<String> out) {
              if (pos == w.length()) {
                  out.add(current.toString() + (skipped > 0 ? String.valueOf(skipped) : ""));
                  return;
              }
              abbr(w, pos + 1, skipped + 1, current, out);
              int before = current.length();
              if (skipped > 0) current.append(skipped);
              current.append(w.charAt(pos));
              abbr(w, pos + 1, 0, current, out);
              current.setLength(before);
          }`
      },
      python: r`
        out = []
        abbr(word, 0, 0, [], out)
        out.sort()
        print("\n".join(out))`,
      cpp: r`
        vector<string> out;
        string current;
        abbr(word, 0, 0, current, out);
        sort(out.begin(), out.end());
        for (const string& s : out) cout << s << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        abbr(word, 0, 0, new StringBuilder(), out);
        Collections.sort(out);
        StringBuilder sb = new StringBuilder();
        for (String s : out) sb.append(s).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Each letter is skipped (the run counter grows) or kept (the pending number is written, then the letter). At the end a pending number is written. The `2^n` texts are sorted.'], complexity: 'Time O(2^n * n), space O(n) besides the output.' },
    solve(input) { const w = rows(input)[0].trim(); const out = []; for (let mask = 0; mask < 1 << w.length; mask++) { let s = '', run = 0; for (let i = 0; i < w.length; i++) { if ((mask >> i) & 1) { run++; } else { if (run) { s += run; run = 0; } s += w[i]; } } if (run) s += run; out.push(s); } return out.sort().join('\n'); },
    tests() { const g = rng(641); return ['ab\n', 'a\n', 'word\n', 'abc\n', 'aaaa\n', `${randWord(g, 6, 'abcdef')}\n`, `${randWord(g, 8, 'abcdefg')}\n`, `${randWord(g, 9, 'xyzw')}\n`, `${randWord(g, 10, 'abcdefghij')}\n`, 'abcdefghij\n', 'zzzzzzzzzz\n']; }
  },

  {
    slug: 'signs-between-digits',
    title: 'Plus, Minus or Nothing Between the Digits',
    difficulty: 'medium',
    tags: ['backtracking', 'expressions', 'strings'],
    concept: {
      title: 'Three choices in every gap: plus, minus, or glue the digits together',
      body: [
        'Between two neighbouring digits you may write `+`, `-`, or **nothing** (the digits then belong to the same number). From `123` you can make `1+2+3`, `1+23`, `12-3`, `123` and so on. A search that builds the expression from left to right chooses, at each position, **how long the next number is** (one digit, two digits, ...), and then which sign comes before it.',
        { code: 'def search(d, target, pos, total, expr, out):\n    if pos == len(d):\n        if total == target:\n            out.append(expr)\n        return\n    value = 0\n    for end in range(pos, len(d)):\n        if end > pos and d[pos] == "0":\n            break                                   # no number with a leading zero\n        value = value * 10 + int(d[end])\n        piece = d[pos:end + 1]\n        if pos == 0:\n            search(d, target, end + 1, value, piece, out)           # the first number has no sign\n        else:\n            search(d, target, end + 1, total + value, expr + "+" + piece, out)\n            search(d, target, end + 1, total - value, expr + "-" + piece, out)' },
        'Passing `total` and `expr` **by value** to the recursive call means there is nothing to undo afterwards. The loop `break` is placed on the leading zero rule: once a number would start with 0 and have a second digit, all longer pieces from this start are invalid too. The expressions are compared as text: `+` (code 43) comes before `-` (code 45), and both before the digits.'
      ]
    },
    statement: ['You are given a string of digits and a target. Write the digits in order and put `+`, `-` or nothing between neighbouring digits (a run of digits without a sign is one number; a number does not start with 0 unless it is just `0`). The expression has no sign in front of its first number. Print every expression whose value is the target, in ascending text order, one per line. If there is none, print `-1`.'],
    inputFormat: ['The first line has the digits.', 'The second line has the target.'],
    outputFormat: ['The expressions in ascending text order (the character + comes before -, and both come before digits), or `-1`.'],
    constraints: ['1 <= number of digits <= 9', '-10^9 <= target <= 10^9', 'There are at most 3000 expressions.'],
    examples: [{ input: '123\n6\n', note: 'Of the nine expressions only 1+2+3 has the value 6.' }],
    hints: ['At each position choose how many digits the next number has.', 'A number with more than one digit cannot start with 0.', 'Pass the running total and the text of the expression to the recursive call; the first number has no sign.'],
    program: {
      io: ['digits:word', 'target:int'],
      includes: ['<algorithm>'],
      helpers: {
        python: r`
          def search(d, target, pos, total, expr, out):
              if pos == len(d):
                  if total == target:
                      out.append(expr)
                  return
              value = 0
              for end in range(pos, len(d)):
                  if end > pos and d[pos] == "0":
                      break
                  value = value * 10 + int(d[end])
                  piece = d[pos:end + 1]
                  if pos == 0:
                      search(d, target, end + 1, value, piece, out)
                  else:
                      search(d, target, end + 1, total + value, expr + "+" + piece, out)
                      search(d, target, end + 1, total - value, expr + "-" + piece, out)`,
        cpp: r`
          void search(const string& d, long long target, size_t pos, long long total, const string& expr, vector<string>& out) {
              if (pos == d.size()) {
                  if (total == target) out.push_back(expr);
                  return;
              }
              long long value = 0;
              for (size_t end = pos; end < d.size(); end++) {
                  if (end > pos && d[pos] == '0') break;
                  value = value * 10 + (d[end] - '0');
                  string piece = d.substr(pos, end - pos + 1);
                  if (pos == 0) {
                      search(d, target, end + 1, value, piece, out);
                  } else {
                      search(d, target, end + 1, total + value, expr + "+" + piece, out);
                      search(d, target, end + 1, total - value, expr + "-" + piece, out);
                  }
              }
          }`,
        java: r`
          static void search(String d, long target, int pos, long total, String expr, List<String> out) {
              if (pos == d.length()) {
                  if (total == target) out.add(expr);
                  return;
              }
              long value = 0;
              for (int end = pos; end < d.length(); end++) {
                  if (end > pos && d.charAt(pos) == '0') break;
                  value = value * 10 + (d.charAt(end) - '0');
                  String piece = d.substring(pos, end + 1);
                  if (pos == 0) {
                      search(d, target, end + 1, value, piece, out);
                  } else {
                      search(d, target, end + 1, total + value, expr + "+" + piece, out);
                      search(d, target, end + 1, total - value, expr + "-" + piece, out);
                  }
              }
          }`
      },
      python: r`
        out = []
        search(digits, target, 0, 0, "", out)
        out.sort()
        print("\n".join(out) if out else -1)`,
      cpp: r`
        vector<string> out;
        search(digits, target, 0, 0, "", out);
        sort(out.begin(), out.end());
        if (out.empty()) cout << -1 << "\n";
        for (const string& e : out) cout << e << "\n";`,
      java: r`
        List<String> out = new ArrayList<>();
        search(digits, target, 0, 0, "", out);
        Collections.sort(out);
        if (out.isEmpty()) System.out.println(-1);
        StringBuilder sb = new StringBuilder();
        for (String e : out) sb.append(e).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['At each position the loop extends the next number digit by digit (stopping at a leading zero), and the recursion adds or subtracts it. The expression text and the total are passed down, so nothing needs to be undone. Complete expressions with the right value are collected and sorted.'], complexity: 'Time O(3^(n-1) * n), space O(n) besides the output.' },
    solve(input) {
      const rs = rows(input); const d = rs[0].trim(); const target = Number(rs[1]); const n = d.length; const out = [];
      for (let mask = 0; mask < 3 ** (n - 1); mask++) { let m = mask; const ops = []; for (let i = 0; i < n - 1; i++) { ops.push(m % 3); m = Math.floor(m / 3); } const pieces = [d[0]]; const signs = []; for (let i = 1; i < n; i++) { if (ops[i - 1] === 0) pieces[pieces.length - 1] += d[i]; else { signs.push(ops[i - 1] === 1 ? '+' : '-'); pieces.push(d[i]); } } if (pieces.some((p) => p.length > 1 && p[0] === '0')) continue; let total = Number(pieces[0]); for (let i = 0; i < signs.length; i++) total += signs[i] === '+' ? Number(pieces[i + 1]) : -Number(pieces[i + 1]); if (total === target) out.push(pieces.reduce((s, p, i) => s + (i ? signs[i - 1] : '') + p, '')); }
      out.sort(); return out.length ? out.join('\n') : '-1';
    },
    tests() {
      const g = rng(642);
      const digits = (n, lo = 0) => many(n, () => randInt(g, lo, 9)).join('');
      const make = (d, t) => `${d}\n${t}\n`;
      const check = (d, t) => { const count = this.solve(make(d, t)).split('\n').length; if (count > 3000) throw new Error('too many expressions'); return make(d, t); };
      return ['123\n6\n', '1\n1\n', '1\n2\n', '0\n0\n', '00\n0\n', '105\n6\n', '123456789\n100\n', '123456789\n0\n', '123456789\n-1\n', '111111111\n1\n', '000000000\n0\n', check(digits(9, 1), 20), check(digits(9, 1), 0), check(digits(9), 5), check(digits(8, 1), -10), check(digits(7), 33), '123456789\n1000000000\n', check('987654321', 45), check('100000009', 109)];
    }
  }
];
