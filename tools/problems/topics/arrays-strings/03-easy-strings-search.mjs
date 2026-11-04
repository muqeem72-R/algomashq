import { r, rng, randInt, randArray, many, arr, nums, rows, randWord, randDistinct } from '../../lib.mjs';

const sentence = (g, count, alphabet = 'abcdefxyz') => many(count, () => randWord(g, randInt(g, 1, 9), alphabet)).join(' ');

export default [
  {
    slug: 'reverse-each-word',
    title: 'Reverse Each Word',
    difficulty: 'easy',
    tags: ['strings', 'words', 'reverse'],
    concept: {
      title: 'Apply an operation to every word',
      body: [
        'Once a line is split into words, you can treat each word on its own: change it, and put the pieces back together in the same order. Reversing a word is a slice with a negative step in Python (`w[::-1]`), `reverse` in C++ and `new StringBuilder(w).reverse()` in Java.',
        { code: 'words = line.split()\nresult = " ".join(w[::-1] for w in words)' },
        'Do not confuse this with reversing the order of the words: here the words stay in their places and only their letters change direction.'
      ]
    },
    statement: ['Given a line of text, reverse the letters of every word but keep the words in their original order. Print the words separated by single spaces.'],
    inputFormat: ['A single line of text with at least one word. Words are separated by one or more spaces.'],
    outputFormat: ['Print the line with every word reversed.'],
    constraints: ['The line has between 1 and 1000 characters.'],
    examples: [{ input: 'hello world\n', note: 'olleh dlrow' }],
    hints: ['Split the line into words.', 'Reverse each word on its own.', 'Join the reversed words with single spaces, in the original order.'],
    program: {
      io: ['s:line'],
      includes: ['<sstream>', '<algorithm>'],
      python: r`
        words = s.split()
        print(" ".join(w[::-1] for w in words))`,
      cpp: r`
        stringstream ss(s);
        string word;
        bool first = true;
        while (ss >> word) {
            reverse(word.begin(), word.end());
            if (!first) cout << " ";
            cout << word;
            first = false;
        }
        cout << "\n";`,
      java: r`
        String[] words = s.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            if (i > 0) sb.append(" ");
            sb.append(new StringBuilder(words[i]).reverse());
        }
        System.out.println(sb);`
    },
    solution: { explanation: ['Split into words, reverse each word separately and join them again in the same order.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { return input.replace(/\n$/, '').trim().split(/\s+/).map((w) => [...w].reverse().join('')).join(' '); },
    tests() { const g = rng(121); return ['hello world\n', 'a\n', 'ab cd\n', '  spaced   out   words  \n', 'palindrome level\n', `${sentence(g, 6)}\n`, `${sentence(g, 100)}\n`, `${sentence(g, 90, 'abcdefghij0123')}\n`]; }
  },

  {
    slug: 'compress-string',
    title: 'Compress the String',
    difficulty: 'easy',
    tags: ['strings', 'runs', 'two-pointers'],
    concept: {
      title: 'Walking over runs of equal letters',
      body: [
        'A **run** is a block of equal letters. To process the runs, put an index `i` at the start of a run and move a second index `j` forward while the letters stay the same. The run is `s[i:j]`; then continue from `j`.',
        { code: 'i = 0\nwhile i < len(s):\n    j = i\n    while j < len(s) and s[j] == s[i]:\n        j += 1\n    # run of s[i], length j - i\n    i = j' },
        'Each letter is looked at once by `j`, so the whole string costs O(n) although there are two loops.'
      ]
    },
    statement: ['Compress a word by replacing every run of equal letters by the letter followed by the length of the run. For example `aaabcc` becomes `a3b1c2`. A letter that appears once still gets the count 1.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the compressed word.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'aaabcc\n', note: 'a three times, b once, c twice.' }],
    hints: ['Find where a run of equal letters ends.', 'Use two indexes: `i` at the start of the run and `j` moving to its end.', 'Write the letter and `j - i`, then continue with `i = j`.'],
    program: {
      io: ['s:word'],
      python: r`
        out = []
        i = 0
        while i < len(s):
            j = i
            while j < len(s) and s[j] == s[i]:
                j += 1
            out.append(s[i] + str(j - i))
            i = j
        print("".join(out))`,
      cpp: r`
        string out;
        size_t i = 0;
        while (i < s.size()) {
            size_t j = i;
            while (j < s.size() && s[j] == s[i]) j++;
            out += s[i];
            out += to_string(j - i);
            i = j;
        }
        cout << out << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            int j = i;
            while (j < s.length() && s.charAt(j) == s.charAt(i)) j++;
            out.append(s.charAt(i)).append(j - i);
            i = j;
        }
        System.out.println(out);`
    },
    solution: { explanation: ['For each run, write its letter and its length, then jump to the first letter after the run.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const s = input.trim(); let out = ''; let i = 0; while (i < s.length) { let j = i; while (j < s.length && s[j] === s[i]) j++; out += s[i] + (j - i); i = j; } return out; },
    tests() { const g = rng(122); const runs = (count, max) => many(count, () => randWord(g, 1, 'abcxyz').repeat(randInt(g, 1, max))).join(''); return ['aaabcc\n', 'a\n', 'abc\n', 'zzzzzzzzzzzz\n', 'aabbaabb\n', `${randWord(g, 40, 'ab')}\n`, `${runs(30, 5)}\n`, `${'a'.repeat(20000)}\n`, `${randWord(g, 20000, 'abc')}\n`]; }
  },

  {
    slug: 'remove-consecutive-duplicates',
    title: 'Remove Consecutive Duplicates',
    difficulty: 'easy',
    tags: ['strings', 'build-result'],
    concept: {
      title: 'Build the result and look at its last letter',
      body: [
        'To drop repeated neighbours you can build a new string and add a letter only when it differs from the **last letter of the result so far**. Comparing with the result instead of the input also works when you extend the idea to longer chains.',
        { code: 'out = []\nfor ch in s:\n    if not out or out[-1] != ch:\n        out.append(ch)' },
        'In Python a list of characters is joined at the end; in Java a `StringBuilder` plays that role, and in C++ a `string` can be appended to directly.'
      ]
    },
    statement: ['Replace every block of equal neighbouring letters of a word by a single letter. For example `aabbbcaa` becomes `abca`. Equal letters that are not neighbours stay.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the shortened word.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'aabbbcaa\n', note: 'The second a-block is not next to the first one, so it stays.' }],
    hints: ['Keep a result that you build letter by letter.', 'Add a letter only if the result is empty or its last letter is different.', 'Compare with the last letter of the result, not with a letter you have already thrown away.'],
    program: {
      io: ['s:word'],
      python: r`
        out = []
        for ch in s:
            if not out or out[-1] != ch:
                out.append(ch)
        print("".join(out))`,
      cpp: r`
        string out;
        for (char ch : s) {
            if (out.empty() || out.back() != ch) out += ch;
        }
        cout << out << "\n";`,
      java: r`
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (out.length() == 0 || out.charAt(out.length() - 1) != ch) out.append(ch);
        }
        System.out.println(out);`
    },
    solution: { explanation: ['A letter is kept only when it differs from the last kept letter.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const s = input.trim(); let out = ''; for (const ch of s) if (!out || out[out.length - 1] !== ch) out += ch; return out; },
    tests() { const g = rng(123); return ['aabbbcaa\n', 'a\n', 'aaaa\n', 'abab\n', 'aabbcc\n', `${randWord(g, 40, 'ab')}\n`, `${randWord(g, 20000, 'abc')}\n`, `${'ab'.repeat(5000)}${'c'.repeat(5000)}\n`]; }
  },

  {
    slug: 'is-subsequence',
    title: 'Is It a Subsequence?',
    difficulty: 'easy',
    tags: ['strings', 'two-pointers', 'subsequence'],
    concept: {
      title: 'Two pointers that only move forward',
      body: [
        'A word `s` is a **subsequence** of `t` if you can delete some letters of `t` (maybe none) and get `s`. The letters of `s` must appear in `t` in the same order, but not next to each other.',
        { code: 'i = 0                      # next letter of s we are waiting for\nfor ch in t:\n    if i < len(s) and ch == s[i]:\n        i += 1\nanswer = (i == len(s))' },
        'Go through `t` once. Whenever the current letter is the one `s` is waiting for, move on to the next letter of `s`. If every letter of `s` was found, it is a subsequence.'
      ]
    },
    statement: ['You are given two words `s` and `t`. Print `yes` if `s` is a subsequence of `t`, otherwise print `no`.'],
    inputFormat: ['The first line has `s`.', 'The second line has `t`.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length of s, t <= 20000', 'The words contain lowercase letters.'],
    examples: [{ input: 'ace\nabcde\n', note: 'Delete b and d from abcde.' }, { input: 'aec\nabcde\n', note: 'e comes after c in t, so the order is wrong.' }],
    hints: ['Keep an index `i` into `s`: the next letter you are waiting for.', 'Walk through `t`; when the letter equals `s[i]`, add one to `i`.', 'If `i` reached the length of `s`, the answer is yes.'],
    program: {
      io: ['s:word', 't:word'],
      python: r`
        i = 0
        for ch in t:
            if i < len(s) and ch == s[i]:
                i += 1
        print("yes" if i == len(s) else "no")`,
      cpp: r`
        size_t i = 0;
        for (char ch : t) {
            if (i < s.size() && ch == s[i]) i++;
        }
        cout << (i == s.size() ? "yes" : "no") << "\n";`,
      java: r`
        int i = 0;
        for (int k = 0; k < t.length(); k++) {
            if (i < s.length() && t.charAt(k) == s.charAt(i)) i++;
        }
        System.out.println(i == s.length() ? "yes" : "no");`
    },
    solution: { explanation: ['One pass over `t` while waiting for the next letter of `s`. The answer is yes when all letters of `s` were matched.'], complexity: 'Time O(|t|), space O(1).' },
    solve(input) { const [s, t] = rows(input); let i = 0; for (const ch of t) if (i < s.length && ch === s[i]) i++; return i === s.length ? 'yes' : 'no'; },
    tests() { const g = rng(124); const t1 = randWord(g, 20000, 'abc'); const pick = (t, k) => { let out = ''; for (let i = 0; i < t.length && out.length < k; i++) if (g() < 0.01) out += t[i]; return out || 'a'; }; return ['ace\nabcde\n', 'aec\nabcde\n', 'a\na\n', 'b\na\n', 'abc\nab\n', 'abc\nabc\n', `${pick(t1, 50)}\n${t1}\n`, `${randWord(g, 20, 'abc')}\n${randWord(g, 30, 'abc')}\n`, `${'z'}\n${t1}\n`, `${t1}\n${t1.slice(0, 19999)}\n`]; }
  },

  {
    slug: 'rotated-string',
    title: 'Rotated String',
    difficulty: 'easy',
    tags: ['strings', 'rotation', 'substring'],
    concept: {
      title: 'Doubling a string shows all its rotations',
      body: [
        'A rotation moves some letters from the front to the back: `abcde` can become `cdeab`. If you write the word twice, `abcdeabcde`, then every rotation of the word appears in it as a block of the same length.',
        { code: 'is_rotation = len(s) == len(t) and t in s + s' },
        'The length check matters: without it `t = "cd"` would be found inside `abcdeabcde` although `cd` is not a rotation of `abcde`.'
      ]
    },
    statement: ['Print `yes` if the word `t` can be obtained from the word `s` by moving some letters from the front of `s` to its back (zero letters is allowed), otherwise print `no`.'],
    inputFormat: ['The first line has `s`.', 'The second line has `t`.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length of s, t <= 5000', 'The words contain lowercase letters.'],
    examples: [{ input: 'abcde\ncdeab\n', note: 'Move ab to the back.' }, { input: 'abcde\nabced\n', note: 'Not a rotation.' }],
    hints: ['A rotation must have the same length as the original.', 'Write the word twice: all rotations are inside `s + s`.', 'Check that `t` occurs in `s + s`.'],
    program: {
      io: ['s:word', 't:word'],
      python: r`
        print("yes" if len(s) == len(t) and t in s + s else "no")`,
      cpp: r`
        bool ok = s.size() == t.size() && (s + s).find(t) != string::npos;
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        boolean ok = s.length() == t.length() && (s + s).contains(t);
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['Every rotation of `s` is a block of `s + s` with the length of `s`. So `t` is a rotation exactly when the lengths agree and `t` occurs in `s + s`.'], complexity: 'Time O(n) to O(n * m) depending on the search used, space O(n).' },
    solve(input) { const [s, t] = rows(input); return s.length === t.length && (s + s).includes(t) ? 'yes' : 'no'; },
    tests() { const g = rng(125); const w = randWord(g, 5000, 'abc'); const k = 1234; return ['abcde\ncdeab\n', 'abcde\nabced\n', 'a\na\n', 'ab\nba\n', 'abc\nab\n', 'abcde\ncd\n', 'aab\naba\n', `${w}\n${w.slice(k)}${w.slice(0, k)}\n`, `${w}\n${w.slice(k)}${w.slice(0, k - 1)}z\n`, `${'a'.repeat(4999)}b\n${'a'.repeat(4998)}ba\n`]; }
  },

  {
    slug: 'count-pattern-occurrences',
    title: 'Count the Occurrences of a Pattern',
    difficulty: 'easy',
    tags: ['strings', 'substring', 'brute-force'],
    concept: {
      title: 'Try every starting position',
      body: [
        'To find where a pattern `p` occurs in a text `s`, try every starting position `i` from `0` to `len(s) - len(p)` and compare the next `len(p)` letters. Occurrences may **overlap**: in `aaaa` the pattern `aa` starts at positions 0, 1 and 2.',
        { code: 'count = 0\nfor i in range(len(s) - len(p) + 1):\n    if s[i:i + len(p)] == p:\n        count += 1' },
        'Since the loop goes through every start, overlapping matches are counted automatically. Faster algorithms exist (you will meet some later), but this one is simple and enough for short texts.'
      ]
    },
    statement: ['Count how many times the word `p` occurs in the text `s`. Occurrences may overlap.'],
    inputFormat: ['The first line has the text `s`.', 'The second line has the pattern `p`.'],
    outputFormat: ['Print the number of occurrences.'],
    constraints: ['1 <= length of s <= 3000', '1 <= length of p <= 100', 'Both contain lowercase letters.'],
    examples: [{ input: 'aaaa\naa\n', note: 'It starts at positions 0, 1 and 2.' }],
    hints: ['A match can start at any position from 0 to `len(s) - len(p)`.', 'Compare the block of `len(p)` letters starting at `i` with `p`.', 'Do not skip ahead after a match; overlapping matches count.'],
    program: {
      io: ['s:word', 'p:word'],
      python: r`
        count = 0
        for i in range(len(s) - len(p) + 1):
            if s[i:i + len(p)] == p:
                count += 1
        print(count)`,
      cpp: r`
        int count = 0;
        for (int i = 0; i + (int) p.size() <= (int) s.size(); i++) {
            if (s.compare(i, p.size(), p) == 0) count++;
        }
        cout << count << "\n";`,
      java: r`
        int count = 0;
        for (int i = 0; i + p.length() <= s.length(); i++) {
            if (s.startsWith(p, i)) count++;
        }
        System.out.println(count);`
    },
    solution: { explanation: ['Check the block of the pattern length at every start position and count the equal ones.'], complexity: 'Time O(|s| * |p|), space O(1).' },
    solve(input) { const [s, p] = rows(input); let c = 0; for (let i = 0; i + p.length <= s.length; i++) if (s.startsWith(p, i)) c++; return String(c); },
    tests() { const g = rng(126); return ['aaaa\naa\n', 'abc\nd\n', 'a\na\n', 'ab\nabc\n', 'abababab\naba\n', `${randWord(g, 60, 'ab')}\nab\n`, `${randWord(g, 3000, 'ab')}\nabab\n`, `${'a'.repeat(3000)}\n${'a'.repeat(100)}\n`, `${randWord(g, 3000, 'abc')}\n${randWord(g, 2, 'abc')}\n`]; }
  },

  {
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: 'easy',
    tags: ['arrays', 'binary-search', 'sorted'],
    concept: {
      title: 'Halve the search range',
      body: [
        'In a **sorted** array you do not have to look at every element. Look at the middle one: if it is the target you are done; if the target is smaller, it can only be in the left half; if larger, only in the right half. Each step throws away half of the remaining places, so about `log2(n)` steps are enough.',
        { code: 'lo, hi = 0, n - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if a[mid] == x:\n        return mid\n    if a[mid] < x:\n        lo = mid + 1\n    else:\n        hi = mid - 1\nreturn -1' },
        'Both `lo` and `hi` are inclusive limits of the part that may still contain the target. The loop ends when this part is empty.'
      ]
    },
    statement: ['You are given a sorted array of `n` different integers (increasing order) and `q` target numbers. For each target print its index in the array (counting from 0), or -1 if it is not in the array.'],
    inputFormat: ['The first line has `n` and `q`.', 'The second line has the `n` sorted integers.', 'The third line has the `q` targets.'],
    outputFormat: ['Print `q` lines, one answer per target.'],
    constraints: ['1 <= n, q <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5 3\n-4 0 3 8 20\n8 1 -4\n', note: '8 is at index 3, 1 is missing, -4 is at index 0.' }],
    hints: ['Look at the middle element of the part that is still possible.', 'If the target is bigger than the middle, continue in the right half, otherwise in the left half.', 'Keep `lo` and `hi` as inclusive limits and stop when `lo > hi`.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'x:int[q]'],
      fast: true,
      python: r`
        out = []
        for target in x:
            lo, hi = 0, n - 1
            found = -1
            while lo <= hi:
                mid = (lo + hi) // 2
                if a[mid] == target:
                    found = mid
                    break
                if a[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            out.append(found)
        print("\n".join(map(str, out)))`,
      cpp: r`
        for (int k = 0; k < q; k++) {
            int lo = 0, hi = n - 1, found = -1;
            while (lo <= hi) {
                int mid = (lo + hi) / 2;
                if (a[mid] == x[k]) {
                    found = mid;
                    break;
                }
                if (a[mid] < x[k]) lo = mid + 1;
                else hi = mid - 1;
            }
            cout << found << "\n";
        }`,
      java: r`
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < q; k++) {
            int lo = 0, hi = (int) n - 1, found = -1;
            while (lo <= hi) {
                int mid = (lo + hi) / 2;
                if (a[mid] == x[k]) {
                    found = mid;
                    break;
                }
                if (a[mid] < x[k]) lo = mid + 1;
                else hi = mid - 1;
            }
            sb.append(found).append("\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Each comparison with the middle element removes half of the remaining range, so a search takes O(log n) steps.'], complexity: 'Time O((n + q) log n) with reading, space O(1) besides the input.' },
    solve(input) { const rs = rows(input); const a = nums(rs[1]); const x = nums(rs[2]); return x.map((t) => a.indexOf(t)).join('\n'); },
    tests() { const g = rng(127); const make = (n, q, lo, hi) => { const a = randDistinct(g, n, lo, hi).sort((p, s) => p - s); const xs = many(q, (i) => (i % 2 ? a[randInt(g, 0, n - 1)] : randInt(g, lo, hi))); return `${n} ${q}\n${a.join(' ')}\n${xs.join(' ')}\n`; }; return ['5 3\n-4 0 3 8 20\n8 1 -4\n', '1 2\n7\n7 8\n', '1 1\n7\n6\n', '3 3\n1 2 3\n1 2 3\n', make(12, 20, -30, 30), make(2000, 2000, -100000, 100000), make(20000, 20000, -1000000000, 1000000000), make(20000, 5000, 0, 25000)]; }
  },

  {
    slug: 'sorted-squares',
    title: 'Squares of a Sorted Array',
    difficulty: 'easy',
    tags: ['arrays', 'two-pointers', 'sorted'],
    concept: {
      title: 'Two pointers from both ends',
      body: [
        'In a sorted array with negative numbers, the largest squares are at the **two ends**: a very negative number and a very positive number both have a big square. The smallest square is somewhere in the middle, near zero.',
        { code: 'l, r = 0, n - 1\nfor k in range(n - 1, -1, -1):      # fill from the biggest\n    if abs(a[l]) > abs(a[r]):\n        res[k] = a[l] * a[l]; l += 1\n    else:\n        res[k] = a[r] * a[r]; r -= 1' },
        'At each step the larger of the two end squares is the biggest square not yet placed, so you place it at the back of the result and move that pointer inward. No sorting is needed after squaring.'
      ]
    },
    statement: ['You are given an array of `n` integers sorted in non-decreasing order. Print the squares of its elements, also sorted in non-decreasing order.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers in non-decreasing order.'],
    outputFormat: ['Print `n` integers on one line.'],
    constraints: ['1 <= n <= 20000', '-10^6 <= each number <= 10^6'],
    examples: [{ input: '5\n-4 -1 0 3 10\n', note: 'The squares are 16 1 0 9 100, sorted: 0 1 9 16 100.' }],
    hints: ['The biggest square is either at the left end or at the right end.', 'Use two pointers `l` and `r` and fill the result from the back.', 'Compare `abs(a[l])` with `abs(a[r])` and place the bigger square.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      includes: ['<cstdlib>'],
      python: r`
        res = [0] * n
        l, rr = 0, n - 1
        for k in range(n - 1, -1, -1):
            if abs(a[l]) > abs(a[rr]):
                res[k] = a[l] * a[l]
                l += 1
            else:
                res[k] = a[rr] * a[rr]
                rr -= 1
        print(*res)`,
      cpp: r`
        vector<long long> res(n);
        int l = 0, rr = n - 1;
        for (int k = n - 1; k >= 0; k--) {
            if (llabs(a[l]) > llabs(a[rr])) {
                res[k] = a[l] * a[l];
                l++;
            } else {
                res[k] = a[rr] * a[rr];
                rr--;
            }
        }
        for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        long[] res = new long[(int) n];
        int l = 0, rr = (int) n - 1;
        for (int k = (int) n - 1; k >= 0; k--) {
            if (Math.abs(a[l]) > Math.abs(a[rr])) {
                res[k] = a[l] * a[l];
                l++;
            } else {
                res[k] = a[rr] * a[rr];
                rr--;
            }
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(res[i]).append(i + 1 < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The largest remaining square is always at one of the two ends. Placing it at the back and moving that pointer inward builds the sorted result in one pass.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); return a.map((x) => x * x).sort((p, s) => p - s).join(' '); },
    tests() { const g = rng(128); const sorted = (n, lo, hi) => arr(randArray(g, n, lo, hi).sort((p, s) => p - s)); return ['5\n-4 -1 0 3 10\n', '1\n-7\n', '1\n0\n', '3\n-3 -2 -1\n', '3\n1 2 3\n', '4\n-2 -2 2 2\n', sorted(15, -10, 10), sorted(20000, -1000000, 1000000), sorted(20000, -1000000, -1), sorted(20000, 0, 1000000)]; }
  },

  {
    slug: 'two-sum-sorted',
    title: 'Pair with a Given Sum',
    difficulty: 'easy',
    tags: ['arrays', 'two-pointers', 'sorted'],
    concept: {
      title: 'Two pointers closing in',
      body: [
        'In a sorted array, put one pointer `l` at the smallest element and one pointer `r` at the largest. Look at their sum: if it is **too small**, only a bigger left element can help, so move `l` right. If it is **too big**, move `r` left. If it is right, you found the pair.',
        { code: 'l, r = 0, n - 1\nwhile l < r:\n    s = a[l] + a[r]\n    if s == target: break\n    if s < target: l += 1\n    else: r -= 1' },
        'Every step discards one element that cannot be part of any answer, so the pointers meet after at most `n` steps. This beats trying all pairs, which needs about `n * n / 2` checks.'
      ]
    },
    statement: ['You are given an array of `n` different integers sorted in increasing order and a number `target`. Exactly one pair of positions `i < j` has `a[i] + a[j] = target`. Print the two positions, counting from 1.'],
    inputFormat: ['The first line has `n` and `target`.', 'The second line has the `n` sorted integers.'],
    outputFormat: ['Print `i` and `j` separated by a space, with `i < j`.'],
    constraints: ['2 <= n <= 20000', '-10^9 <= each number <= 10^9', '-2 * 10^9 <= target <= 2 * 10^9', 'Exactly one valid pair exists.'],
    examples: [{ input: '4 9\n2 7 11 15\n', note: '2 + 7 = 9, at positions 1 and 2.' }],
    hints: ['Start with a pointer at each end.', 'If the sum is too small move the left pointer right, if too big move the right pointer left.', 'Print `l + 1` and `r + 1` because positions start at 1.'],
    program: {
      io: ['n:int target:int', 'a:int[n]'],
      fast: true,
      python: r`
        l, rr = 0, n - 1
        while l < rr:
            s = a[l] + a[rr]
            if s == target:
                break
            if s < target:
                l += 1
            else:
                rr -= 1
        print(l + 1, rr + 1)`,
      cpp: r`
        int l = 0, rr = n - 1;
        while (l < rr) {
            long long s = a[l] + a[rr];
            if (s == target) break;
            if (s < target) l++;
            else rr--;
        }
        cout << l + 1 << " " << rr + 1 << "\n";`,
      java: r`
        int l = 0, rr = (int) n - 1;
        while (l < rr) {
            long s = a[l] + a[rr];
            if (s == target) break;
            if (s < target) l++;
            else rr--;
        }
        System.out.println((l + 1) + " " + (rr + 1));`
    },
    solution: { explanation: ['Two pointers move towards each other. A sum that is too small can only grow by moving the left pointer, a sum that is too big can only shrink by moving the right pointer.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const target = nums(rs[0])[1]; const a = nums(rs[1]); let l = 0, rr = a.length - 1; while (l < rr) { const s = a[l] + a[rr]; if (s === target) break; if (s < target) l++; else rr--; } return `${l + 1} ${rr + 1}`; },
    tests() {
      const g = rng(129);
      const pairs = (a, t) => { const seen = new Set(a); let c = 0; for (const x of a) if (seen.has(t - x) && t - x > x) c++; return c; };
      const make = (n, lo, hi) => {
        for (;;) {
          const a = randDistinct(g, n, lo, hi).sort((p, s) => p - s);
          const i = randInt(g, 0, n - 2), j = randInt(g, i + 1, n - 1);
          const t = a[i] + a[j];
          if (pairs(a, t) === 1) return `${n} ${t}\n${a.join(' ')}\n`;
        }
      };
      return ['4 9\n2 7 11 15\n', '2 5\n2 3\n', '3 0\n-5 1 5\n', '5 -3\n-10 -6 -1 4 9\n', make(8, -1000, 1000), make(100, -1000000, 1000000), make(20000, -1000000000, 1000000000), make(20000, -1000000000, 1000000000)];
    }
  },

  {
    slug: 'pascal-triangle',
    title: "Pascal's Triangle",
    difficulty: 'easy',
    tags: ['arrays', '2d-arrays', 'math'],
    concept: {
      title: 'Each row from the row above',
      body: [
        "In Pascal's triangle every row starts and ends with 1, and every other number is the **sum of the two numbers above it**: the one directly above-left and the one directly above-right. So a row can be computed from the previous row alone.",
        { code: 'row = [1]\nfor _ in range(n):\n    print(*row)\n    row = [1] + [row[i] + row[i + 1] for i in range(len(row) - 1)] + [1]' },
        'You only need to keep the current row in memory, not the whole triangle.'
      ]
    },
    statement: ["Print the first `n` rows of Pascal's triangle. Row 1 is `1`, row 2 is `1 1`, row 3 is `1 2 1`, and so on."],
    inputFormat: ['A single integer `n`.'],
    outputFormat: ['Print `n` lines. Line `k` has `k` numbers separated by spaces.'],
    constraints: ['1 <= n <= 30'],
    examples: [{ input: '5\n', note: 'The fifth row is 1 4 6 4 1.' }],
    hints: ['Each row begins and ends with 1.', 'A number in the middle is the sum of the two numbers above it in the previous row.', 'Keep only the previous row and build the next one from it.'],
    program: {
      io: ['n:int'],
      python: r`
        row = [1]
        for _ in range(n):
            print(*row)
            row = [1] + [row[i] + row[i + 1] for i in range(len(row) - 1)] + [1]`,
      cpp: r`
        vector<long long> row = {1};
        for (int k = 0; k < n; k++) {
            for (size_t i = 0; i < row.size(); i++) cout << row[i] << (i + 1 < row.size() ? " " : "\n");
            vector<long long> next(row.size() + 1, 1);
            for (size_t i = 1; i < row.size(); i++) next[i] = row[i - 1] + row[i];
            row = next;
        }`,
      java: r`
        long[] row = {1};
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < n; k++) {
            for (int i = 0; i < row.length; i++) sb.append(row[i]).append(i + 1 < row.length ? " " : "\n");
            long[] next = new long[row.length + 1];
            next[0] = 1;
            next[row.length] = 1;
            for (int i = 1; i < row.length; i++) next[i] = row[i - 1] + row[i];
            row = next;
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['The next row is built from the current one: the ends are 1 and each inner number is the sum of its two upper neighbours.'], complexity: 'Time O(n^2), space O(n).' },
    solve(input) { const n = Number(input.trim()); let row = [1]; const out = []; for (let k = 0; k < n; k++) { out.push(row.join(' ')); const next = [1]; for (let i = 1; i < row.length; i++) next.push(row[i - 1] + row[i]); next.push(1); row = next; } return out.join('\n'); },
    tests() { return ['5\n', '1\n', '2\n', '3\n', '8\n', '15\n', '25\n', '30\n']; }
  }
];
