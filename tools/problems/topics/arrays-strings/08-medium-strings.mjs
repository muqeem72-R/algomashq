import { r, rng, randInt, many, nums, rows, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const ROMAN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const toRoman = (n) => { let out = ''; for (const [v, t] of ROMAN) while (n >= v) { out += t; n -= v; } return out; };

// The longest palindrome (the leftmost one on ties) found by expanding around every centre.
function longestPalindrome(s) {
  const n = s.length; let bestL = 0, bestLen = 1;
  for (let c = 0; c < 2 * n - 1; c++) {
    let l = c >> 1, rr = l + (c & 1);
    while (l >= 0 && rr < n && s[l] === s[rr]) { l--; rr++; }
    if (rr - l - 1 > bestLen) { bestLen = rr - l - 1; bestL = l + 1; }
  }
  return s.slice(bestL, bestL + bestLen);
}

export default [
  {
    slug: 'longest-palindromic-substring',
    title: 'Longest Palindromic Substring',
    difficulty: 'medium',
    tags: ['strings', 'palindrome', 'expand-around-center'],
    concept: {
      title: 'Grow a palindrome from its centre',
      body: [
        'Every palindrome has a centre: a single letter (odd length) or the gap between two letters (even length). Starting from a centre and moving one step left and one step right as long as the two letters are equal grows the palindrome as far as it goes.',
        { code: 'for c in range(2 * n - 1):\n    l = c // 2\n    r = l + c % 2          # same letter for odd, next letter for even\n    while l >= 0 and r < n and s[l] == s[r]:\n        l -= 1\n        r += 1\n    # the palindrome is s[l + 1 : r], its length is r - l - 1' },
        'There are `2n - 1` centres and each expansion costs at most O(n), so the total is O(n^2): fine for a few thousand letters. (A cleverer linear algorithm exists, but this one is much simpler.)'
      ]
    },
    statement: ['Given a word, find its longest substring (block of consecutive letters) that reads the same forwards and backwards. If there are several of the same length, print the one that starts first.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the palindrome.'],
    constraints: ['1 <= length <= 2000'],
    examples: [{ input: 'babad\n', note: 'Both bab and aba have length 3; bab starts first.' }, { input: 'cbbd\n', note: 'bb is the longest.' }],
    hints: ['A palindrome grows symmetrically from its centre.', 'There are two kinds of centres: a letter and the gap between two letters.', 'For each centre expand while the two outer letters are equal, and remember the longest one (the first one on ties).'],
    program: {
      io: ['s:word'],
      python: r`
        n = len(s)
        bestL, bestLen = 0, 1
        for c in range(2 * n - 1):
            l = c // 2
            rr = l + c % 2
            while l >= 0 and rr < n and s[l] == s[rr]:
                l -= 1
                rr += 1
            if rr - l - 1 > bestLen:
                bestLen = rr - l - 1
                bestL = l + 1
        print(s[bestL:bestL + bestLen])`,
      cpp: r`
        int n = s.size(), bestL = 0, bestLen = 1;
        for (int c = 0; c < 2 * n - 1; c++) {
            int l = c / 2, rr = l + c % 2;
            while (l >= 0 && rr < n && s[l] == s[rr]) {
                l--;
                rr++;
            }
            if (rr - l - 1 > bestLen) {
                bestLen = rr - l - 1;
                bestL = l + 1;
            }
        }
        cout << s.substr(bestL, bestLen) << "\n";`,
      java: r`
        int n = s.length(), bestL = 0, bestLen = 1;
        for (int c = 0; c < 2 * n - 1; c++) {
            int l = c / 2, rr = l + c % 2;
            while (l >= 0 && rr < n && s.charAt(l) == s.charAt(rr)) {
                l--;
                rr++;
            }
            if (rr - l - 1 > bestLen) {
                bestLen = rr - l - 1;
                bestL = l + 1;
            }
        }
        System.out.println(s.substring(bestL, bestL + bestLen));`
    },
    solution: { explanation: ['Expand around each of the `2n - 1` centres. A palindrome is only replaced by a strictly longer one, so the first one of the maximum length is kept.'], complexity: 'Time O(n^2), space O(1).' },
    solve(input) { return longestPalindrome(input.trim()); },
    tests() {
      const g = rng(191);
      const brute = (s) => { let best = s[0]; for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) { const t = s.slice(i, j + 1); if (t === [...t].reverse().join('') && t.length > best.length) best = t; } return best; };
      for (let t = 0; t < 300; t++) { const s = randWord(g, randInt(g, 1, 14), 'ab'); if (brute(s) !== longestPalindrome(s)) throw new Error('palindrome reference differs from brute force'); }
      return ['babad\n', 'cbbd\n', 'a\n', 'ab\n', 'aaaa\n', 'abcda\n', `${randWord(g, 40, 'ab')}\n`, `${randWord(g, 2000, 'ab')}\n`, `${randWord(g, 2000, LOW)}\n`, `${'a'.repeat(2000)}\n`, `${randWord(g, 900, 'abc')}x${randWord(g, 900, 'abc')}\n`];
    }
  },

  {
    slug: 'count-palindromic-substrings',
    title: 'Count Palindromic Substrings',
    difficulty: 'medium',
    tags: ['strings', 'palindrome', 'expand-around-center'],
    concept: {
      title: 'Every successful expansion is one palindrome',
      body: [
        'Expanding around a centre finds a whole family of palindromes: when the letters at `l` and `r` match, the block `s[l..r]` is a palindrome, and expanding once more may give the next one. So **each step of the expansion that succeeds is one more palindromic substring**.',
        { code: 'count = 0\nfor c in range(2 * n - 1):\n    l = c // 2\n    r = l + c % 2\n    while l >= 0 and r < n and s[l] == s[r]:\n        count += 1        # s[l..r] is a palindrome\n        l -= 1\n        r += 1' },
        'Substrings are counted by their position, so equal substrings at different places count separately. In `aaa` there are 6: three `a`, two `aa` and one `aaa`.'
      ]
    },
    statement: ['Count the palindromic substrings of a word. Substrings at different positions are counted separately, even if they consist of the same letters.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the number of palindromic substrings.'],
    constraints: ['1 <= length <= 2000'],
    examples: [{ input: 'aaa\n', note: 'a, a, a, aa, aa, aaa: six substrings.' }],
    hints: ['Use the same centres as for the longest palindrome.', 'Every time the two outer letters match during an expansion, you found one more palindrome.', 'Add one to the counter at each successful step.'],
    program: {
      io: ['s:word'],
      python: r`
        n = len(s)
        count = 0
        for c in range(2 * n - 1):
            l = c // 2
            rr = l + c % 2
            while l >= 0 and rr < n and s[l] == s[rr]:
                count += 1
                l -= 1
                rr += 1
        print(count)`,
      cpp: r`
        int n = s.size();
        long long count = 0;
        for (int c = 0; c < 2 * n - 1; c++) {
            int l = c / 2, rr = l + c % 2;
            while (l >= 0 && rr < n && s[l] == s[rr]) {
                count++;
                l--;
                rr++;
            }
        }
        cout << count << "\n";`,
      java: r`
        int n = s.length();
        long count = 0;
        for (int c = 0; c < 2 * n - 1; c++) {
            int l = c / 2, rr = l + c % 2;
            while (l >= 0 && rr < n && s.charAt(l) == s.charAt(rr)) {
                count++;
                l--;
                rr++;
            }
        }
        System.out.println(count);`
    },
    solution: { explanation: ['Each successful expansion step around a centre corresponds to exactly one palindromic substring.'], complexity: 'Time O(n^2), space O(1).' },
    solve(input) { const s = input.trim(); let c = 0; for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) { let ok = true; for (let a = i, b = j; a < b; a++, b--) if (s[a] !== s[b]) { ok = false; break; } if (ok) c++; } return String(c); },
    tests() { const g = rng(192); return ['aaa\n', 'abc\n', 'a\n', 'abba\n', 'abacaba\n', `${randWord(g, 30, 'ab')}\n`, `${randWord(g, 300, 'abc')}\n`, `${randWord(g, 400, 'ab')}\n`, `${'a'.repeat(400)}\n`, `${randWord(g, 400, LOW)}\n`]; }
  },

  {
    slug: 'string-to-integer',
    title: 'Read an Integer From Text',
    difficulty: 'medium',
    tags: ['strings', 'parsing', 'simulation'],
    concept: {
      title: 'A small parser: skip, sign, digits, stop',
      body: [
        'Reading a number out of text follows fixed steps, and an index `i` moves through them: (1) skip the leading spaces, (2) read an optional `+` or `-`, (3) read digits and build the value as `value = value * 10 + digit`, stopping at the first character that is not a digit.',
        { code: 'i = 0\nwhile i < len(s) and s[i] == " ": i += 1\nsign = 1\nif i < len(s) and s[i] in "+-":\n    sign = -1 if s[i] == "-" else 1\n    i += 1\nvalue = 0\nwhile i < len(s) and s[i].isdigit():\n    value = value * 10 + int(s[i]); i += 1' },
        'If the number is too large for a 32-bit signed integer, clamp it: values above 2147483647 become 2147483647 and values below -2147483648 become -2147483648. In C++ and Java stop reading digits once the value is clearly out of range, so that it does not overflow your own variable.'
      ]
    },
    statement: ['Convert the text at the beginning of a line into an integer. Skip leading spaces; then read an optional sign (+ or -); then read digits until the first character that is not a digit. Ignore the rest of the line. If there are no digits, the result is 0. A result outside the range -2147483648 to 2147483647 is replaced by the nearest border value.'],
    inputFormat: ['A single line of text (it may start with spaces).'],
    outputFormat: ['Print the integer.'],
    constraints: ['1 <= length of the line <= 200', 'The line contains letters, digits, spaces and the characters + - .'],
    examples: [{ input: '   -42abc\n', note: 'Spaces are skipped, the sign is -, the digits are 42.' }, { input: 'words and 987\n', note: 'The first character is a letter: no digits at the start, so the result is 0.' }],
    hints: ['Use an index that moves forward in three phases: spaces, sign, digits.', 'Build the value with `value * 10 + digit` and stop at the first non-digit.', 'Clamp the result to the 32-bit range at the end (and stop early if the value gets huge).'],
    program: {
      io: ['s:line'],
      python: r`
        i = 0
        while i < len(s) and s[i] == " ":
            i += 1
        sign = 1
        if i < len(s) and (s[i] == "+" or s[i] == "-"):
            if s[i] == "-":
                sign = -1
            i += 1
        value = 0
        while i < len(s) and "0" <= s[i] <= "9":
            value = value * 10 + int(s[i])
            if value > 2147483648:
                break
            i += 1
        value *= sign
        print(max(-2147483648, min(2147483647, value)))`,
      cpp: r`
        size_t i = 0;
        while (i < s.size() && s[i] == ' ') i++;
        int sign = 1;
        if (i < s.size() && (s[i] == '+' || s[i] == '-')) {
            if (s[i] == '-') sign = -1;
            i++;
        }
        long long value = 0;
        while (i < s.size() && s[i] >= '0' && s[i] <= '9') {
            value = value * 10 + (s[i] - '0');
            if (value > 2147483648LL) break;
            i++;
        }
        value *= sign;
        if (value > 2147483647LL) value = 2147483647LL;
        if (value < -2147483648LL) value = -2147483648LL;
        cout << value << "\n";`,
      java: r`
        int i = 0;
        while (i < s.length() && s.charAt(i) == ' ') i++;
        int sign = 1;
        if (i < s.length() && (s.charAt(i) == '+' || s.charAt(i) == '-')) {
            if (s.charAt(i) == '-') sign = -1;
            i++;
        }
        long value = 0;
        while (i < s.length() && s.charAt(i) >= '0' && s.charAt(i) <= '9') {
            value = value * 10 + (s.charAt(i) - '0');
            if (value > 2147483648L) break;
            i++;
        }
        value *= sign;
        if (value > 2147483647L) value = 2147483647L;
        if (value < -2147483648L) value = -2147483648L;
        System.out.println(value);`
    },
    solution: { explanation: ['A single pass with an index through the three phases. The value is clamped at the end, and the digit loop stops early once the value is certainly out of range.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const s = input.replace(/\n$/, ''); let i = 0;
      while (i < s.length && s[i] === ' ') i++;
      let sign = 1;
      if (i < s.length && (s[i] === '+' || s[i] === '-')) { if (s[i] === '-') sign = -1; i++; }
      let v = 0n;
      while (i < s.length && s[i] >= '0' && s[i] <= '9') { v = v * 10n + BigInt(s[i]); if (v > 4000000000n) break; i++; }
      v *= BigInt(sign);
      if (v > 2147483647n) v = 2147483647n;
      if (v < -2147483648n) v = -2147483648n;
      return v.toString();
    },
    tests() { return ['   -42abc\n', 'words and 987\n', '42\n', '-\n', '+7\n', '   +0 123\n', '4193 with words\n', '-91283472332\n', '91283472332\n', '2147483647\n', '2147483648\n', '-2147483648\n', '-2147483649\n', '00000000000000000000000000012\n', '  x1\n', '3.14159\n', '+-12\n', '- 5\n', '99999999999999999999999999999999999999\n']; }
  },

  {
    slug: 'zigzag-conversion',
    title: 'Zigzag Conversion',
    difficulty: 'medium',
    tags: ['strings', 'simulation'],
    concept: {
      title: 'Bounce between the first and last row',
      body: [
        'Writing a word in a zigzag over `k` rows means: row 0, 1, 2, ..., k-1, then back k-2, ..., 1, then down again. You do not need a 2-D picture. Keep a list of strings, one per row, and a variable `row` for the row the next letter goes to, plus a direction `step` that flips at the first and the last row.',
        { code: 'rows = [""] * k\nrow, step = 0, 1\nfor ch in s:\n    rows[row] += ch\n    if row == 0: step = 1\n    elif row == k - 1: step = -1\n    row += step\nresult = "".join(rows)' },
        'With a single row there is nowhere to bounce, so handle `k = 1` (and `k >= length`) before the loop: the word stays as it is.'
      ]
    },
    statement: ['The letters of a word are written in a zigzag pattern on `k` rows: down the first column of letters from row 1 to row k, then diagonally up to row 1, then down again, and so on. Then the rows are read one after another. Print the word that is read.'],
    inputFormat: ['The first line has the word `s`.', 'The second line has `k`.'],
    outputFormat: ['Print the word read row by row.'],
    constraints: ['1 <= length of s <= 20000', '1 <= k <= 1000', 'The word contains lowercase letters.'],
    examples: [{ input: 'paypalishiring\n3\n', note: 'Rows: PAHN / APLSIIG / YIR, read as pahnaplsiigyir.' }],
    hints: ['Keep one string per row.', 'Move the row index down until the last row, then up until the first row.', 'Join the rows at the end. A single row needs no zigzag.'],
    program: {
      io: ['s:word', 'k:int'],
      python: r`
        if k == 1 or k >= len(s):
            print(s)
        else:
            lines = [""] * k
            row, step = 0, 1
            for ch in s:
                lines[row] += ch
                if row == 0:
                    step = 1
                elif row == k - 1:
                    step = -1
                row += step
            print("".join(lines))`,
      cpp: r`
        if (k == 1 || k >= (long long) s.size()) {
            cout << s << "\n";
        } else {
            vector<string> lines(k);
            int row = 0, step = 1;
            for (char ch : s) {
                lines[row] += ch;
                if (row == 0) step = 1;
                else if (row == k - 1) step = -1;
                row += step;
            }
            for (const string& line : lines) cout << line;
            cout << "\n";
        }`,
      java: r`
        if (k == 1 || k >= s.length()) {
            System.out.println(s);
        } else {
            StringBuilder[] lines = new StringBuilder[(int) k];
            for (int i = 0; i < k; i++) lines[i] = new StringBuilder();
            int row = 0, step = 1;
            for (int i = 0; i < s.length(); i++) {
                lines[row].append(s.charAt(i));
                if (row == 0) step = 1;
                else if (row == k - 1) step = -1;
                row += step;
            }
            StringBuilder out = new StringBuilder();
            for (StringBuilder line : lines) out.append(line);
            System.out.println(out);
        }`
    },
    solution: { explanation: ['Each letter is appended to the row it falls into while the row index bounces between the first and the last row. Concatenating the rows gives the answer.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const [s, k0] = rows(input); const k = Number(k0); if (k === 1 || k >= s.length) return s; const lines = Array(k).fill(''); let row = 0, step = 1; for (const ch of s) { lines[row] += ch; if (row === 0) step = 1; else if (row === k - 1) step = -1; row += step; } return lines.join(''); },
    tests() { const g = rng(194); return ['paypalishiring\n3\n', 'paypalishiring\n4\n', 'a\n1\n', 'abc\n1\n', 'abc\n2\n', 'abc\n5\n', 'abcd\n2\n', `${randWord(g, 60, LOW)}\n${randInt(g, 2, 8)}\n`, `${randWord(g, 20000, LOW)}\n2\n`, `${randWord(g, 20000, LOW)}\n7\n`, `${randWord(g, 20000, LOW)}\n1000\n`]; }
  },

  {
    slug: 'roman-to-integer',
    title: 'Roman Numeral to Number',
    difficulty: 'medium',
    tags: ['strings', 'parsing', 'lookup'],
    concept: {
      title: 'A smaller symbol before a bigger one is subtracted',
      body: [
        'Roman numerals use the symbols I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Symbols are normally added from left to right (`XII` = 12). But when a smaller symbol stands **in front of a bigger one**, it is subtracted (`IV` = 4, `XC` = 90).',
        { code: 'total = 0\nfor i in range(len(s)):\n    v = value[s[i]]\n    if i + 1 < len(s) and v < value[s[i + 1]]:\n        total -= v\n    else:\n        total += v' },
        'The rule needs only a look at the next symbol. A small lookup table (a dictionary in Python, a `switch` or a small function in other languages) gives the value of a symbol.'
      ]
    },
    statement: ['Convert a valid Roman numeral to a number. The symbols are I=1, V=5, X=10, L=50, C=100, D=500 and M=1000; a smaller symbol directly before a larger one is subtracted.'],
    inputFormat: ['A single word: a Roman numeral for a number from 1 to 3999.'],
    outputFormat: ['Print the number.'],
    constraints: ['The numeral is valid and its value is between 1 and 3999.'],
    examples: [{ input: 'MCMXCIV\n', note: 'M + (CM) + (XC) + (IV) = 1000 + 900 + 90 + 4 = 1994.' }],
    hints: ['Give each symbol its value.', 'If a symbol is smaller than the next one, subtract it; otherwise add it.', 'The last symbol is always added.'],
    program: {
      io: ['s:word'],
      helpers: {
        python: r`
          VALUE = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}`,
        cpp: r`
          int valueOf(char c) {
              switch (c) {
                  case 'I': return 1;
                  case 'V': return 5;
                  case 'X': return 10;
                  case 'L': return 50;
                  case 'C': return 100;
                  case 'D': return 500;
                  default: return 1000;
              }
          }`,
        java: r`
          static int valueOf(char c) {
              switch (c) {
                  case 'I': return 1;
                  case 'V': return 5;
                  case 'X': return 10;
                  case 'L': return 50;
                  case 'C': return 100;
                  default: return c == 'D' ? 500 : 1000;
              }
          }`
      },
      python: r`
        total = 0
        for i in range(len(s)):
            v = VALUE[s[i]]
            if i + 1 < len(s) and v < VALUE[s[i + 1]]:
                total -= v
            else:
                total += v
        print(total)`,
      cpp: r`
        int total = 0;
        for (size_t i = 0; i < s.size(); i++) {
            int v = valueOf(s[i]);
            if (i + 1 < s.size() && v < valueOf(s[i + 1])) total -= v;
            else total += v;
        }
        cout << total << "\n";`,
      java: r`
        int total = 0;
        for (int i = 0; i < s.length(); i++) {
            int v = valueOf(s.charAt(i));
            if (i + 1 < s.length() && v < valueOf(s.charAt(i + 1))) total -= v;
            else total += v;
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Add every symbol, but subtract it when the next symbol is larger.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const s = input.trim(); const V = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }; let t = 0; for (let i = 0; i < s.length; i++) { const v = V[s[i]]; if (i + 1 < s.length && v < V[s[i + 1]]) t -= v; else t += v; } return String(t); },
    tests() { const g = rng(195); return [1, 4, 9, 14, 40, 58, 90, 400, 900, 1994, 2024, 3888, 3999, ...many(6, () => randInt(g, 1, 3999))].map((v) => `${toRoman(v)}\n`); }
  },

  {
    slug: 'integer-to-roman',
    title: 'Number to Roman Numeral',
    difficulty: 'medium',
    tags: ['strings', 'greedy', 'lookup'],
    concept: {
      title: 'Greedy with a table that includes the subtractive forms',
      body: [
        'Write the largest symbol that still fits, subtract its value, and repeat. This works when the table also contains the six subtractive pairs, in descending order of value: 1000 M, 900 CM, 500 D, 400 CD, 100 C, 90 XC, 50 L, 40 XL, 10 X, 9 IX, 5 V, 4 IV, 1 I.',
        { code: 'out = ""\nfor value, text in table:\n    while n >= value:\n        out += text\n        n -= value' },
        'Because 900 and 400 and the others are in the table, you never have to think about "IIII" or "VIIII": the largest piece that fits is always taken first.'
      ]
    },
    statement: ['Convert a number from 1 to 3999 to a Roman numeral. Use the symbols I=1, V=5, X=10, L=50, C=100, D=500, M=1000 and the subtractive forms IV=4, IX=9, XL=40, XC=90, CD=400, CM=900.'],
    inputFormat: ['A single integer `n`.'],
    outputFormat: ['Print the Roman numeral.'],
    constraints: ['1 <= n <= 3999'],
    examples: [{ input: '1994\n', note: 'MCMXCIV' }, { input: '58\n', note: 'LVIII' }],
    hints: ['List the values from big to small, including 900, 400, 90, 40, 9 and 4.', 'For each value, write its text as many times as it fits.', 'Subtract the value each time you write its text.'],
    program: {
      io: ['n:int'],
      python: r`
        table = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
                 (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
        out = ""
        for value, text in table:
            while n >= value:
                out += text
                n -= value
        print(out)`,
      cpp: r`
        int values[] = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
        string texts[] = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
        string out;
        for (int k = 0; k < 13; k++) {
            while (n >= values[k]) {
                out += texts[k];
                n -= values[k];
            }
        }
        cout << out << "\n";`,
      java: r`
        int[] values = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
        String[] texts = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < 13; k++) {
            while (n >= values[k]) {
                out.append(texts[k]);
                n -= values[k];
            }
        }
        System.out.println(out);`
    },
    solution: { explanation: ['Take the biggest value in the table that still fits, write its text, subtract, and repeat.'], complexity: 'Time O(1) (at most 15 symbols), space O(1).' },
    solve(input) { return toRoman(Number(input.trim())); },
    tests() { const g = rng(196); return [1, 3, 4, 9, 14, 40, 49, 58, 90, 400, 944, 1994, 2024, 3888, 3999, ...many(5, () => randInt(g, 1, 3999))].map((v) => `${v}\n`); }
  },

  {
    slug: 'compare-version-numbers',
    title: 'Compare Version Numbers',
    difficulty: 'medium',
    tags: ['strings', 'parsing', 'split'],
    concept: {
      title: 'Compare the parts as numbers, missing parts are zero',
      body: [
        'A version such as `1.02.3` is a list of numbers separated by dots. Split both versions at the dots and compare the parts **as numbers**, from left to right: `02` is the number 2, so it equals `2`. The first part that differs decides the result.',
        { code: 'x = a.split(".")\ny = b.split(".")\nfor i in range(max(len(x), len(y))):\n    p = int(x[i]) if i < len(x) else 0\n    q = int(y[i]) if i < len(y) else 0\n    if p != q:\n        result = 1 if p > q else -1' },
        'If one version has fewer parts, the missing parts count as 0, so `1.0` and `1.0.0` are the same version. Comparing the parts as text would give wrong results (`"10"` is smaller than `"9"` as text).'
      ]
    },
    statement: ['Compare two version numbers. Each is a list of numbers separated by dots, possibly with leading zeros (for example `1.01.2`). Compare the numbers from left to right; missing numbers count as 0. Print 1 if the first version is bigger, -1 if it is smaller, and 0 if they are equal.'],
    inputFormat: ['The first line has version `a`.', 'The second line has version `b`.'],
    outputFormat: ['Print 1, -1 or 0.'],
    constraints: ['Each version has between 1 and 50 numbers, each between 0 and 10^9 (maybe written with leading zeros).'],
    examples: [{ input: '1.01\n1.001\n', note: 'Both are 1.1: equal.' }, { input: '1.0\n1.0.0\n', note: 'The missing part counts as 0.' }, { input: '0.1\n1.1\n', note: '0 < 1, so the first is smaller.' }],
    hints: ['Split each version at the dots.', 'Convert the parts to numbers so that leading zeros disappear.', 'If a version has no part at some position, use 0. Stop at the first difference.'],
    program: {
      io: ['a:word', 'b:word'],
      helpers: {
        cpp: r`
          vector<long long> parts(const string& v) {
              vector<long long> out;
              string cur;
              for (char ch : v) {
                  if (ch == '.') {
                      out.push_back(stoll(cur));
                      cur = "";
                  } else {
                      cur += ch;
                  }
              }
              out.push_back(stoll(cur));
              return out;
          }`
      },
      includes: ['<algorithm>'],
      python: r`
        x = a.split(".")
        y = b.split(".")
        result = 0
        for i in range(max(len(x), len(y))):
            p = int(x[i]) if i < len(x) else 0
            q = int(y[i]) if i < len(y) else 0
            if p != q:
                result = 1 if p > q else -1
                break
        print(result)`,
      cpp: r`
        vector<long long> x = parts(a), y = parts(b);
        int result = 0;
        for (size_t i = 0; i < max(x.size(), y.size()); i++) {
            long long p = i < x.size() ? x[i] : 0;
            long long q = i < y.size() ? y[i] : 0;
            if (p != q) {
                result = p > q ? 1 : -1;
                break;
            }
        }
        cout << result << "\n";`,
      java: r`
        String[] x = a.split("\\.");
        String[] y = b.split("\\.");
        int result = 0;
        for (int i = 0; i < Math.max(x.length, y.length); i++) {
            long p = i < x.length ? Long.parseLong(x[i]) : 0;
            long q = i < y.length ? Long.parseLong(y[i]) : 0;
            if (p != q) {
                result = p > q ? 1 : -1;
                break;
            }
        }
        System.out.println(result);`
    },
    solution: { explanation: ['Parse the parts as numbers and compare them pairwise; a missing part is 0. The first difference decides.'], complexity: 'Time O(length), space O(length).' },
    solve(input) { const [a, b] = rows(input); const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { const p = x[i] || 0, q = y[i] || 0; if (p !== q) return p > q ? '1' : '-1'; } return '0'; },
    tests() { const g = rng(197); const ver = (count, hi) => many(count, () => String(randInt(g, 0, hi)).padStart(randInt(g, 1, 4), '0')).join('.'); const same = () => { const v = ver(6, 20); return `${v}\n${v}.0.0\n`; }; return ['1.01\n1.001\n', '1.0\n1.0.0\n', '0.1\n1.1\n', '1.0.1\n1\n', '7.5.2.4\n7.5.3\n', '1\n1.0.0.1\n', '9\n10\n', same(), `${ver(3, 3)}\n${ver(3, 3)}\n`, `${ver(50, 1000000000)}\n${ver(50, 1000000000)}\n`, `${ver(5, 2)}\n${ver(7, 2)}\n`, '1000000000\n999999999\n']; }
  },

  {
    slug: 'count-and-say',
    title: 'Count and Say',
    difficulty: 'medium',
    tags: ['strings', 'runs', 'simulation'],
    concept: {
      title: 'Describe the previous term out loud',
      body: [
        'The "count and say" sequence starts with `1`. Each next term describes the previous term by reading it out loud: group equal neighbouring digits and say "how many, which digit". `1` is "one 1" = `11`; `11` is "two 1s" = `21`; `21` is "one 2, one 1" = `1211`; then `111221`.',
        { code: 'term = "1"\nfor _ in range(n - 1):\n    nxt = ""\n    i = 0\n    while i < len(term):\n        j = i\n        while j < len(term) and term[j] == term[i]: j += 1\n        nxt += str(j - i) + term[i]\n        i = j\n    term = nxt' },
        'Splitting a string into runs of equal characters is the same pattern as in string compression. The terms grow quickly (about 30% longer each time), so only small `n` is asked.'
      ]
    },
    statement: ['The terms of the sequence are: term 1 is `1`, and every next term describes the previous one by counting groups of equal neighbouring digits (the count first, then the digit). The first terms are 1, 11, 21, 1211, 111221, 312211. Print term number `n`.'],
    inputFormat: ['A single integer `n`.'],
    outputFormat: ['Print the n-th term.'],
    constraints: ['1 <= n <= 30'],
    examples: [{ input: '4\n', note: 'Term 3 is 21 ("one 2, one 1"), so term 4 is 1211.' }],
    hints: ['Start with the string "1".', 'To build the next term, split the current one into runs of equal digits.', 'For each run write its length and then its digit.'],
    program: {
      io: ['n:int'],
      python: r`
        term = "1"
        for _ in range(n - 1):
            nxt = []
            i = 0
            while i < len(term):
                j = i
                while j < len(term) and term[j] == term[i]:
                    j += 1
                nxt.append(str(j - i) + term[i])
                i = j
            term = "".join(nxt)
        print(term)`,
      cpp: r`
        string term = "1";
        for (int step = 1; step < n; step++) {
            string next;
            size_t i = 0;
            while (i < term.size()) {
                size_t j = i;
                while (j < term.size() && term[j] == term[i]) j++;
                next += to_string(j - i);
                next += term[i];
                i = j;
            }
            term = next;
        }
        cout << term << "\n";`,
      java: r`
        String term = "1";
        for (int step = 1; step < n; step++) {
            StringBuilder next = new StringBuilder();
            int i = 0;
            while (i < term.length()) {
                int j = i;
                while (j < term.length() && term.charAt(j) == term.charAt(i)) j++;
                next.append(j - i).append(term.charAt(i));
                i = j;
            }
            term = next.toString();
        }
        System.out.println(term);`
    },
    solution: { explanation: ['Each term is produced from the previous one by compressing it into (count, digit) pairs, exactly like run-length encoding.'], complexity: 'Time O(total length of all terms), space O(length of the last term).' },
    solve(input) { const n = Number(input.trim()); let term = '1'; for (let k = 1; k < n; k++) { let nxt = ''; let i = 0; while (i < term.length) { let j = i; while (j < term.length && term[j] === term[i]) j++; nxt += (j - i) + term[i]; i = j; } term = nxt; } return term; },
    tests() { return [4, 1, 2, 3, 5, 6, 10, 15, 20, 25, 30].map((v) => `${v}\n`); }
  }
];
