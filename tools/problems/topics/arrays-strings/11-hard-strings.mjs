import { r, rng, randInt, randArray, many, arr, nums, rows, randWord, shuffle } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const SCALE = ['', 'Thousand', 'Million', 'Billion'];
const threeDigits = (x) => { const w = []; if (x >= 100) { w.push(ONES[Math.floor(x / 100)], 'Hundred'); x %= 100; } if (x >= 20) { w.push(TENS[Math.floor(x / 10)]); x %= 10; } if (x > 0) w.push(ONES[x]); return w; };
const toWords = (n) => { if (n === 0) return 'Zero'; const parts = []; for (let unit = 0; n > 0; unit++, n = Math.floor(n / 1000)) { const chunk = n % 1000; if (chunk) parts.unshift([...threeDigits(chunk), ...(unit ? [SCALE[unit]] : [])].join(' ')); } return parts.join(' '); };

export default [
  {
    slug: 'text-justification',
    title: 'Justify the Text',
    difficulty: 'hard',
    tags: ['strings', 'simulation', 'greedy'],
    concept: {
      title: 'Greedy line packing, then spread the spaces',
      body: [
        'Put as many words as possible on a line: keep adding the next word while the words and **one space between each pair** still fit into the width `W`. Then the extra room is spread over the gaps. With `spaces = W - (total letters)` and `slots = count - 1` gaps, every gap gets `spaces // slots` spaces, and the first `spaces % slots` gaps get one more.',
        { code: 'base, extra = divmod(spaces, slots)\ngaps = [base + 1 if k < extra else base for k in range(slots)]' },
        'Two special cases are not stretched: a line with a single word (it has no gap) and the last line of the text. They use single spaces between words and the rest of the width is empty space at the end. To make the result checkable, this problem asks you to print, for each line, the layout as numbers instead of the text itself.'
      ]
    },
    statement: ['A text of `n` words must be arranged in lines of exactly `W` characters. Fill each line greedily with as many words as fit, with at least one space between neighbouring words. Then distribute the remaining spaces: every gap between words gets the same number of spaces; if they cannot be divided evenly, the left gaps get one extra space each. A line with only one word, and the last line, are not stretched: words in them are separated by exactly one space and the remaining spaces come after the last word.', 'Instead of the text, print the layout of every line: the number of words `k`, then the `k - 1` gap sizes from left to right, then the number of spaces at the end of the line.'],
    inputFormat: ['The first line has `n` and `W`.', 'The second line has the `n` words separated by spaces.'],
    outputFormat: ['For each line print `k`, the `k - 1` gaps and the trailing spaces, separated by spaces.'],
    constraints: ['1 <= n <= 2000', '1 <= W <= 80', 'Every word has between 1 and W lowercase letters.'],
    examples: [{ input: '6 16\nthis is an example of text\n', note: 'Line 1 is "this is an": 8 letters and 8 spaces in 2 gaps, so the gaps are 4 and 4. Line 2 is the last line, "example of text": single spaces and 1 trailing space.' }],
    hints: ['Fill a line greedily: add the next word if the line length with one space before it is at most `W`.', 'For a normal line divide the spare spaces over the gaps with `divmod`; the left gaps get the extra ones.', 'Treat a one-word line and the last line separately: all gaps are 1 and the rest is trailing space.'],
    program: {
      io: ['n:int w:int', 'words:word[n]'],
      python: r`
        i = 0
        out = []
        while i < n:
            j = i
            length = len(words[i])
            while j + 1 < n and length + 1 + len(words[j + 1]) <= w:
                j += 1
                length += 1 + len(words[j])
            count = j - i + 1
            letters = sum(len(x) for x in words[i:j + 1])
            if j == n - 1 or count == 1:
                gaps = [1] * (count - 1)
                trailing = w - letters - (count - 1)
            else:
                spaces = w - letters
                slots = count - 1
                base, extra = divmod(spaces, slots)
                gaps = [base + 1 if k < extra else base for k in range(slots)]
                trailing = 0
            out.append(" ".join(map(str, [count] + gaps + [trailing])))
            i = j + 1
        print("\n".join(out))`,
      cpp: r`
        int i = 0;
        while (i < n) {
            int j = i, length = words[i].size();
            while (j + 1 < n && length + 1 + (int) words[j + 1].size() <= w) {
                j++;
                length += 1 + words[j].size();
            }
            int count = j - i + 1, letters = 0;
            for (int k = i; k <= j; k++) letters += words[k].size();
            vector<int> gaps;
            int trailing = 0;
            if (j == n - 1 || count == 1) {
                gaps.assign(count - 1, 1);
                trailing = w - letters - (count - 1);
            } else {
                int spaces = w - letters, slots = count - 1;
                for (int k = 0; k < slots; k++) gaps.push_back(spaces / slots + (k < spaces % slots ? 1 : 0));
            }
            cout << count;
            for (int g : gaps) cout << " " << g;
            cout << " " << trailing << "\n";
            i = j + 1;
        }`,
      java: r`
        int i = 0;
        StringBuilder sb = new StringBuilder();
        while (i < n) {
            int j = i, length = words[i].length();
            while (j + 1 < n && length + 1 + words[j + 1].length() <= w) {
                j++;
                length += 1 + words[j].length();
            }
            int count = j - i + 1, letters = 0;
            for (int k = i; k <= j; k++) letters += words[k].length();
            sb.append(count);
            if (j == n - 1 || count == 1) {
                for (int k = 0; k < count - 1; k++) sb.append(" 1");
                sb.append(" ").append(w - letters - (count - 1));
            } else {
                int spaces = (int) w - letters, slots = count - 1;
                for (int k = 0; k < slots; k++) sb.append(" ").append(spaces / slots + (k < spaces % slots ? 1 : 0));
                sb.append(" 0");
            }
            sb.append("\n");
            i = j + 1;
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Pack words greedily, then compute the gap sizes with an integer division of the spare spaces by the number of gaps. The last line and one-word lines use single spaces.'], complexity: 'Time O(total letters), space O(n).' },
    solve(input) { const rs = rows(input); const [n, w] = nums(rs[0]); const words = rs[1].split(' '); const out = []; let i = 0; while (i < n) { let j = i, len = words[i].length; while (j + 1 < n && len + 1 + words[j + 1].length <= w) { j++; len += 1 + words[j].length; } const count = j - i + 1; const letters = words.slice(i, j + 1).reduce((s, x) => s + x.length, 0); let gaps, trailing; if (j === n - 1 || count === 1) { gaps = Array(count - 1).fill(1); trailing = w - letters - (count - 1); } else { const spaces = w - letters, slots = count - 1; const base = Math.floor(spaces / slots), extra = spaces % slots; gaps = many(slots, (k) => (k < extra ? base + 1 : base)); trailing = 0; } out.push([count, ...gaps, trailing].join(' ')); i = j + 1; } return out.join('\n'); },
    tests() {
      const g = rng(221);
      const make = (n, w, maxLen) => `${n} ${w}\n${many(n, () => randWord(g, randInt(g, 1, Math.min(w, maxLen)), LOW)).join(' ')}\n`;
      return ['6 16\nthis is an example of text\n', '1 5\nabc\n', '3 5\nabcde abcde abcde\n', '4 10\na b c d\n', '5 20\nscience is what we understand\n', make(12, 20, 8), make(100, 30, 10), make(2000, 80, 15), make(2000, 12, 12), make(2000, 80, 80)];
    }
  },

  {
    slug: 'kth-permutation',
    title: 'The k-th Permutation',
    difficulty: 'hard',
    tags: ['math', 'permutations', 'factorials'],
    concept: {
      title: 'Factorials tell how many permutations start with each digit',
      body: [
        'Write all permutations of `1..n` in dictionary order. The first `(n-1)!` permutations start with 1, the next `(n-1)!` with 2, and so on. So the first digit of the k-th permutation is found with a division: `index = (k - 1) // (n-1)!`, and then the problem repeats for the remaining digits with `k` reduced to the position inside that block.',
        { code: 'digits = list(range(1, n + 1))\nk -= 1                             # count from 0\nfor i in range(n, 0, -1):\n    f = factorial(i - 1)\n    out.append(digits.pop(k // f))   # take the digit at that index\n    k %= f' },
        'Every step removes one digit from the list of unused digits, so the unused digits stay in increasing order. Use 64-bit numbers: `20!` is about 2.4 * 10^18, the largest factorial that fits.'
      ]
    },
    statement: ['List all permutations of the numbers 1, 2, ..., n in dictionary (lexicographic) order, comparing them number by number. Print the k-th permutation of this list (the first one is 1 2 ... n).'],
    inputFormat: ['A single line with `n` and `k`.'],
    outputFormat: ['Print the permutation as `n` numbers separated by spaces.'],
    constraints: ['1 <= n <= 20', '1 <= k <= n!'],
    examples: [{ input: '3 3\n', note: 'The permutations in order are 123, 132, 213, 231, 312, 321; the third is 2 1 3.' }],
    hints: ['There are (n-1)! permutations that start with each possible first number.', 'The first number is the one at index `(k - 1) // (n-1)!` of the sorted unused numbers.', 'Remove it from the list, replace `k` by the position inside its block and repeat.'],
    program: {
      io: ['n:int k:int'],
      python: r`
        fact = [1] * (n + 1)
        for i in range(1, n + 1):
            fact[i] = fact[i - 1] * i
        digits = list(range(1, n + 1))
        k -= 1
        out = []
        for i in range(n, 0, -1):
            f = fact[i - 1]
            out.append(digits.pop(k // f))
            k %= f
        print(*out)`,
      cpp: r`
        vector<long long> fact(n + 1, 1);
        for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i;
        vector<int> digits;
        for (int i = 1; i <= n; i++) digits.push_back(i);
        k--;
        for (int i = n; i >= 1; i--) {
            long long f = fact[i - 1];
            int idx = k / f;
            cout << digits[idx] << (i > 1 ? " " : "\n");
            digits.erase(digits.begin() + idx);
            k %= f;
        }`,
      java: r`
        long[] fact = new long[(int) n + 1];
        fact[0] = 1;
        for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i;
        List<Integer> digits = new ArrayList<>();
        for (int i = 1; i <= n; i++) digits.add(i);
        k--;
        StringBuilder sb = new StringBuilder();
        for (int i = (int) n; i >= 1; i--) {
            long f = fact[i - 1];
            int idx = (int) (k / f);
            sb.append(digits.remove(idx)).append(i > 1 ? " " : "\n");
            k %= f;
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['The factorial number system: dividing by `(n-1)!`, `(n-2)!`, ... gives, for each position, the index of the digit among the digits not used yet.'], complexity: 'Time O(n^2), space O(n).' },
    solve(input) { const [n0, k0] = input.trim().split(/\s+/); const n = Number(n0); let k = BigInt(k0) - 1n; const fact = [1n]; for (let i = 1; i <= n; i++) fact.push(fact[i - 1] * BigInt(i)); const digits = many(n, (i) => i + 1); const out = []; for (let i = n; i >= 1; i--) { const f = fact[i - 1]; out.push(digits.splice(Number(k / f), 1)[0]); k %= f; } return out.join(' '); },
    tests() {
      const g = rng(222);
      const fact = (n) => { let f = 1n; for (let i = 2n; i <= BigInt(n); i++) f *= i; return f; };
      const randK = (n) => { const f = fact(n); let v = 0n; for (let i = 0; i < 4; i++) v = (v << 20n) | BigInt(Math.floor(g() * 1048576)); return (v % f) + 1n; };
      return ['3 3\n', '1 1\n', '2 2\n', '4 9\n', '3 1\n', '3 6\n', `20 ${fact(20)}\n`, '20 1\n', `20 ${randK(20)}\n`, `20 ${randK(20)}\n`, `15 ${randK(15)}\n`, `10 ${randK(10)}\n`, `7 ${randK(7)}\n`];
    }
  },

  {
    slug: 'number-to-english-words',
    title: 'Number to English Words',
    difficulty: 'hard',
    tags: ['strings', 'math', 'simulation'],
    concept: {
      title: 'Work in groups of three digits',
      body: [
        'English reads a number in groups of three digits, from the left: "one billion, two hundred thirty-four million, ..." The words for a group of three digits are always built the same way, and the group is followed by its scale word (Thousand, Million, Billion). So write a helper for **numbers below 1000** and call it for each group.',
        { code: 'def three(x):\n    words = []\n    if x >= 100: words += [ONES[x // 100], "Hundred"]; x %= 100\n    if x >= 20: words.append(TENS[x // 10]); x %= 10\n    if x > 0: words.append(ONES[x])      # 1..19 have their own words\n    return words' },
        'Take the groups from the right with `n % 1000` and `n // 1000`, skip groups that are zero (no "Zero Thousand"), and put the results in the right order at the end. The number 0 itself is the special case "Zero".'
      ]
    },
    statement: ['Write a non-negative integer in English words. Use capitalised words separated by single spaces, no "and" and no hyphens: `123` is `One Hundred Twenty Three`, `1000010` is `One Million Ten`. The scale words are Thousand, Million and Billion. Zero is written as `Zero`.'],
    inputFormat: ['A single integer `n`.'],
    outputFormat: ['Print the words.'],
    constraints: ['0 <= n <= 2^31 - 1'],
    examples: [{ input: '12345\n', note: 'Twelve Thousand Three Hundred Forty Five' }, { input: '1000010\n', note: 'The zero thousands group is skipped.' }],
    hints: ['Handle numbers below 1000 with a helper: hundreds, then tens, then ones.', 'The numbers 1 to 19 have their own words; 20, 30, ..., 90 are in a separate list.', 'Split the number into groups of three digits from the right, skip empty groups, and add the scale word to each used group.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
                  "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
          TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
          SCALE = ["", "Thousand", "Million", "Billion"]


          def three(x):
              words = []
              if x >= 100:
                  words += [ONES[x // 100], "Hundred"]
                  x %= 100
              if x >= 20:
                  words.append(TENS[x // 10])
                  x %= 10
              if x > 0:
                  words.append(ONES[x])
              return words`,
        cpp: r`
          const char* ONES[] = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
                                "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"};
          const char* TENS[] = {"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};
          const char* SCALE[] = {"", "Thousand", "Million", "Billion"};

          void three(int x, vector<string>& out) {
              if (x >= 100) {
                  out.push_back(ONES[x / 100]);
                  out.push_back("Hundred");
                  x %= 100;
              }
              if (x >= 20) {
                  out.push_back(TENS[x / 10]);
                  x %= 10;
              }
              if (x > 0) out.push_back(ONES[x]);
          }`,
        java: r`
          static final String[] ONES = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
                                        "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"};
          static final String[] TENS = {"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};
          static final String[] SCALE = {"", "Thousand", "Million", "Billion"};

          static void three(int x, List<String> out) {
              if (x >= 100) {
                  out.add(ONES[x / 100]);
                  out.add("Hundred");
                  x %= 100;
              }
              if (x >= 20) {
                  out.add(TENS[x / 10]);
                  x %= 10;
              }
              if (x > 0) out.add(ONES[x]);
          }`
      },
      python: r`
        if n == 0:
            print("Zero")
        else:
            parts = []
            unit = 0
            while n > 0:
                chunk = n % 1000
                if chunk:
                    words = three(chunk)
                    if unit:
                        words.append(SCALE[unit])
                    parts.append(words)
                n //= 1000
                unit += 1
            print(" ".join(w for part in reversed(parts) for w in part))`,
      cpp: r`
        if (n == 0) {
            cout << "Zero\n";
        } else {
            vector<vector<string>> parts;
            long long rest = n;
            int unit = 0;
            while (rest > 0) {
                int chunk = rest % 1000;
                if (chunk > 0) {
                    vector<string> words;
                    three(chunk, words);
                    if (unit > 0) words.push_back(SCALE[unit]);
                    parts.push_back(words);
                }
                rest /= 1000;
                unit++;
            }
            bool first = true;
            for (int i = (int) parts.size() - 1; i >= 0; i--) {
                for (const string& w : parts[i]) {
                    if (!first) cout << " ";
                    cout << w;
                    first = false;
                }
            }
            cout << "\n";
        }`,
      java: r`
        if (n == 0) {
            System.out.println("Zero");
        } else {
            List<List<String>> parts = new ArrayList<>();
            long rest = n;
            int unit = 0;
            while (rest > 0) {
                int chunk = (int) (rest % 1000);
                if (chunk > 0) {
                    List<String> words = new ArrayList<>();
                    three(chunk, words);
                    if (unit > 0) words.add(SCALE[unit]);
                    parts.add(words);
                }
                rest /= 1000;
                unit++;
            }
            List<String> all = new ArrayList<>();
            for (int i = parts.size() - 1; i >= 0; i--) all.addAll(parts.get(i));
            System.out.println(String.join(" ", all));
        }`
    },
    solution: { explanation: ['A number is a sequence of three-digit groups. Each group is spelled with the same small helper and followed by its scale word; empty groups are skipped.'], complexity: 'Time O(number of digits), space O(1).' },
    solve(input) { return toWords(Number(input.trim())); },
    tests() { const g = rng(223); return ['12345\n', '1000010\n', '0\n', '7\n', '13\n', '20\n', '100\n', '101\n', '1000\n', '1000000\n', '1000000000\n', '2147483647\n', '123\n', '90000\n', '999999999\n', ...many(5, () => `${randInt(g, 0, 2147483647)}\n`)]; }
  },

  {
    slug: 'longest-substring-frequent-letters',
    title: 'Longest Block of Frequent Letters',
    difficulty: 'hard',
    tags: ['strings', 'divide-and-conquer', 'counting'],
    concept: {
      title: 'A rare letter can never be inside the answer',
      body: [
        'You want the longest block in which **every letter that occurs appears at least `k` times**. Count the letters of the whole word. If every letter has a count of at least `k`, the whole word is the answer. Otherwise there is a letter with fewer than `k` occurrences in total, and **no valid block can contain it** (a block has even fewer of them). So cut the word at every occurrence of such rare letters and solve each piece separately.',
        { code: 'def best(lo, hi):\n    count the letters of s[lo:hi]\n    if no letter has 0 < count < k: return hi - lo\n    split at every letter with count < k, return the max of best(piece) over the pieces' },
        'Each recursion level removes at least one of the 26 letters from consideration, so the depth is at most 26 and each level reads the word once: O(26 * n) in total.'
      ]
    },
    statement: ['Given a word and a number `k`, find the length of the longest block of consecutive letters in which every letter that appears in the block appears at least `k` times. If there is no such block, print 0.'],
    inputFormat: ['The first line has `k`.', 'The second line has the word.'],
    outputFormat: ['Print one integer.'],
    constraints: ['1 <= k <= 20000', '1 <= length of the word <= 20000', 'The word contains lowercase letters.'],
    examples: [{ input: '3\naaabb\n', note: 'The block aaa (b appears only twice).' }, { input: '2\nababbc\n', note: 'The block ababb: a appears 2 times and b 3 times.' }],
    hints: ['If every letter of the word appears at least k times, the whole word is the answer.', 'A letter with fewer than k occurrences in the word cannot be in any valid block.', 'Split the word at those letters and solve the pieces recursively.'],
    program: {
      io: ['k:int', 's:word'],
      helpers: {
        python: r`
          def best_block(s, k, lo, hi):
              if hi - lo < k:
                  return 0
              count = [0] * 26
              for i in range(lo, hi):
                  count[ord(s[i]) - ord("a")] += 1
              start = lo
              best = 0
              split = False
              for i in range(lo, hi):
                  if count[ord(s[i]) - ord("a")] < k:
                      split = True
                      best = max(best, best_block(s, k, start, i))
                      start = i + 1
              if not split:
                  return hi - lo
              return max(best, best_block(s, k, start, hi))`,
        cpp: r`
          int bestBlock(const string& s, int k, int lo, int hi) {
              if (hi - lo < k) return 0;
              int count[26] = {0};
              for (int i = lo; i < hi; i++) count[s[i] - 'a']++;
              int start = lo, best = 0;
              bool split = false;
              for (int i = lo; i < hi; i++) {
                  if (count[s[i] - 'a'] < k) {
                      split = true;
                      best = max(best, bestBlock(s, k, start, i));
                      start = i + 1;
                  }
              }
              if (!split) return hi - lo;
              return max(best, bestBlock(s, k, start, hi));
          }`,
        java: r`
          static int bestBlock(String s, int k, int lo, int hi) {
              if (hi - lo < k) return 0;
              int[] count = new int[26];
              for (int i = lo; i < hi; i++) count[s.charAt(i) - 'a']++;
              int start = lo, best = 0;
              boolean split = false;
              for (int i = lo; i < hi; i++) {
                  if (count[s.charAt(i) - 'a'] < k) {
                      split = true;
                      best = Math.max(best, bestBlock(s, k, start, i));
                      start = i + 1;
                  }
              }
              if (!split) return hi - lo;
              return Math.max(best, bestBlock(s, k, start, hi));
          }`
      },
      includes: ['<algorithm>'],
      python: r`
        print(best_block(s, k, 0, len(s)))`,
      cpp: r`
        cout << bestBlock(s, k, 0, s.size()) << "\n";`,
      java: r`
        System.out.println(bestBlock(s, (int) k, 0, s.length()));`
    },
    solution: { explanation: ['Letters that are rare in the whole word cannot belong to any valid block, so the word is cut at them and each piece is solved by the same rule.'], complexity: 'Time O(26 * n), space O(26) recursion depth.' },
    solve(input) { const [k0, s] = rows(input); const k = Number(k0); const go = (lo, hi) => { if (hi - lo < k) return 0; const c = {}; for (let i = lo; i < hi; i++) c[s[i]] = (c[s[i]] || 0) + 1; let start = lo, best = 0, split = false; for (let i = lo; i < hi; i++) if (c[s[i]] < k) { split = true; best = Math.max(best, go(start, i)); start = i + 1; } return split ? Math.max(best, go(start, hi)) : hi - lo; }; return String(go(0, s.length)); },
    tests() {
      const g = rng(224);
      const brute = (s, k) => { let best = 0; for (let i = 0; i < s.length; i++) { const c = {}; for (let j = i; j < s.length; j++) { c[s[j]] = (c[s[j]] || 0) + 1; if (Object.values(c).every((v) => v >= k)) best = Math.max(best, j - i + 1); } } return String(best); };
      for (let t = 0; t < 200; t++) { const s = randWord(g, randInt(g, 1, 14), 'abc'); const k = randInt(g, 1, 4); if (brute(s, k) !== this.solve(`${k}\n${s}\n`)) throw new Error('frequent-letter reference differs from brute force'); }
      return ['3\naaabb\n', '2\nababbc\n', '1\na\n', '2\na\n', '1\nabcabc\n', '3\nabcabcabc\n', `3\n${randWord(g, 60, 'abc')}\n`, `5\n${randWord(g, 3000, 'abcd')}\n`, `100\n${randWord(g, 20000, 'abcdef')}\n`, `2000\n${randWord(g, 20000, 'abcdefghij')}\n`, `10\n${randWord(g, 20000, LOW)}\n`, `7\n${'a'.repeat(5000)}b${'a'.repeat(5000)}\n`];
    }
  },

  {
    slug: 'four-sum-count',
    title: 'Quadruples With a Given Sum',
    difficulty: 'hard',
    tags: ['arrays', 'two-pointers', 'sorting'],
    concept: {
      title: 'Fix two numbers, then two pointers',
      body: [
        'This is the three-sum idea one level deeper. After sorting, fix the first number `a[i]` and the second number `a[j]`; the remaining two must add up to `target - a[i] - a[j]`, which two pointers `l` and `r` find in O(n). Two nested loops times a linear scan give O(n^3).',
        { code: 'for i in range(n - 3):\n    if i > 0 and a[i] == a[i - 1]: continue\n    for j in range(i + 1, n - 2):\n        if j > i + 1 and a[j] == a[j - 1]: continue\n        l, r = j + 1, n - 1\n        while l < r:\n            s = a[i] + a[j] + a[l] + a[r]\n            ... same as three-sum ...' },
        'To count each combination of values once, skip equal neighbours at all four levels: at the first and second number when starting the loop body, and at the third (and fourth) after a hit.'
      ]
    },
    statement: ['Given `n` integers and a number `target`, count the different quadruples of **values** `(w, x, y, z)` with `w <= x <= y <= z` and `w + x + y + z = target`. Two quadruples are the same if they contain the same values; the four elements must come from four different positions.'],
    inputFormat: ['The first line has `n` and `target`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of different quadruples.'],
    constraints: ['1 <= n <= 200', '-10^9 <= each number <= 10^9', '-4 * 10^9 <= target <= 4 * 10^9'],
    examples: [{ input: '6 0\n1 0 -1 0 -2 2\n', note: 'The quadruples are (-2, -1, 1, 2), (-2, 0, 0, 2) and (-1, 0, 0, 1).' }],
    hints: ['Sort the array.', 'Fix the first two numbers with two loops and find the other two with two pointers.', 'Skip repeated values at every level so that a quadruple of values is counted once.'],
    program: {
      io: ['n:int target:int', 'a:int[n]'],
      includes: ['<algorithm>'],
      python: r`
        a.sort()
        count = 0
        for i in range(n - 3):
            if i > 0 and a[i] == a[i - 1]:
                continue
            for j in range(i + 1, n - 2):
                if j > i + 1 and a[j] == a[j - 1]:
                    continue
                l, rr = j + 1, n - 1
                while l < rr:
                    s = a[i] + a[j] + a[l] + a[rr]
                    if s < target:
                        l += 1
                    elif s > target:
                        rr -= 1
                    else:
                        count += 1
                        l += 1
                        rr -= 1
                        while l < rr and a[l] == a[l - 1]:
                            l += 1
        print(count)`,
      cpp: r`
        sort(a.begin(), a.end());
        long long count = 0;
        for (int i = 0; i + 3 < n; i++) {
            if (i > 0 && a[i] == a[i - 1]) continue;
            for (int j = i + 1; j + 2 < n; j++) {
                if (j > i + 1 && a[j] == a[j - 1]) continue;
                int l = j + 1, rr = n - 1;
                while (l < rr) {
                    long long s = a[i] + a[j] + a[l] + a[rr];
                    if (s < target) l++;
                    else if (s > target) rr--;
                    else {
                        count++;
                        l++;
                        rr--;
                        while (l < rr && a[l] == a[l - 1]) l++;
                    }
                }
            }
        }
        cout << count << "\n";`,
      java: r`
        Arrays.sort(a);
        long count = 0;
        for (int i = 0; i + 3 < n; i++) {
            if (i > 0 && a[i] == a[i - 1]) continue;
            for (int j = i + 1; j + 2 < n; j++) {
                if (j > i + 1 && a[j] == a[j - 1]) continue;
                int l = j + 1, rr = (int) n - 1;
                while (l < rr) {
                    long s = a[i] + a[j] + a[l] + a[rr];
                    if (s < target) l++;
                    else if (s > target) rr--;
                    else {
                        count++;
                        l++;
                        rr--;
                        while (l < rr && a[l] == a[l - 1]) l++;
                    }
                }
            }
        }
        System.out.println(count);`
    },
    solution: { explanation: ['Fixing the two smallest values leaves a pair-sum problem on a sorted range, solved with two pointers. Skipping equal values makes each quadruple of values count once.'], complexity: 'Time O(n^3), space O(1) besides sorting.' },
    solve(input) { const rs = rows(input); const target = nums(rs[0])[1]; const a = nums(rs[1]); const cnt = new Map(); for (const x of a) cnt.set(x, (cnt.get(x) || 0) + 1); const vals = [...cnt.keys()].sort((p, s) => p - s); let c = 0; for (let i = 0; i < vals.length; i++) for (let j = i; j < vals.length; j++) for (let k = j; k < vals.length; k++) { const z = target - vals[i] - vals[j] - vals[k]; if (!cnt.has(z) || z < vals[k]) continue; const need = new Map(); for (const v of [vals[i], vals[j], vals[k], z]) need.set(v, (need.get(v) || 0) + 1); if ([...need].every(([v, q]) => cnt.get(v) >= q)) c++; } return String(c); },
    tests() {
      const g = rng(225);
      const make = (n, range, target) => `${n} ${target}\n${randArray(g, n, -range, range).join(' ')}\n`;
      const brute = (input) => { const rs = rows(input); const [n, target] = nums(rs[0]); const a = nums(rs[1]); const set = new Set(); for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) for (let l = k + 1; l < n; l++) if (a[i] + a[j] + a[k] + a[l] === target) set.add([a[i], a[j], a[k], a[l]].sort((p, s) => p - s).join(',')); return String(set.size); };
      for (let t = 0; t < 100; t++) { const input = make(randInt(g, 1, 12), 4, randInt(g, -6, 6)); if (brute(input) !== this.solve(input)) throw new Error('four-sum reference differs from brute force'); }
      return ['6 0\n1 0 -1 0 -2 2\n', '4 8\n2 2 2 2\n', '3 0\n0 0 0\n', '4 0\n0 0 0 0\n', '5 4\n1 1 1 1 1\n', make(20, 5, 0), make(60, 10, 3), make(120, 20, 10), make(200, 5, 0), make(200, 1000000000, 0), make(200, 3, 4)];
    }
  },

  {
    slug: 'evaluate-expression',
    title: 'Evaluate an Expression',
    difficulty: 'hard',
    tags: ['strings', 'parsing', 'simulation'],
    concept: {
      title: 'Multiplication binds tighter than addition',
      body: [
        'In `3+2*2` the product is calculated first. A neat way to respect this without a stack is to keep two values: `total`, the sum of all finished terms, and `last`, the term that is still being built. A `+` or `-` finishes the last term (add it to `total`) and starts a new term. A `*` or `/` changes only the last term.',
        { code: 'for each number num, read together with the operator op that stood before it:\n    if op == "+": total += last; last = num\n    if op == "-": total += last; last = -num\n    if op == "*": last = last * num\n    if op == "/": last = trunc(last / num)\n# at the end: total + last' },
        'Read the digits of a number one by one (`num = num * 10 + digit`) and process the previous number when the next operator (or the end, imitated by an extra `+`) arrives. Division of whole numbers rounds towards zero: in Python do not use `//` on negative values directly.'
      ]
    },
    statement: ['Evaluate an arithmetic expression that contains positive whole numbers and the operators `+`, `-`, `*` and `/`, without spaces and without parentheses. `*` and `/` come before `+` and `-`, and operators of the same kind are applied from left to right. Division of whole numbers rounds towards zero (`7/2 = 3`, and a negative part such as `-7/2` would give `-3`). The expression never divides by zero.'],
    inputFormat: ['A single word: the expression.'],
    outputFormat: ['Print the value.'],
    constraints: ['The expression has between 1 and 200 characters, it starts and ends with a number, and all numbers are between 1 and 10^6.', 'All intermediate values fit into 64 bits.'],
    examples: [{ input: '3+2*2\n', note: '2*2 = 4 first, then 3 + 4 = 7.' }, { input: '3-5/2\n', note: '5/2 = 2, so the value is 1.' }],
    hints: ['Keep a `total` of finished terms and the `last` term in progress.', 'On `+` or `-`: add `last` to `total` and start a new term (with a negative sign for `-`).', 'On `*` or `/`: update `last`. Append a sentinel `+` so that the final number is processed too.'],
    program: {
      io: ['s:word'],
      python: r`
        total = 0
        last = 0
        num = 0
        op = "+"
        for ch in s + "+":
            if "0" <= ch <= "9":
                num = num * 10 + int(ch)
            else:
                if op == "+":
                    total += last
                    last = num
                elif op == "-":
                    total += last
                    last = -num
                elif op == "*":
                    last *= num
                else:
                    last = -(-last // num) if last < 0 else last // num
                op = ch
                num = 0
        print(total + last)`,
      cpp: r`
        long long total = 0, last = 0, num = 0;
        char op = '+';
        for (size_t i = 0; i <= s.size(); i++) {
            char ch = i < s.size() ? s[i] : '+';
            if (ch >= '0' && ch <= '9') {
                num = num * 10 + (ch - '0');
            } else {
                if (op == '+') {
                    total += last;
                    last = num;
                } else if (op == '-') {
                    total += last;
                    last = -num;
                } else if (op == '*') {
                    last *= num;
                } else {
                    last /= num;
                }
                op = ch;
                num = 0;
            }
        }
        cout << total + last << "\n";`,
      java: r`
        long total = 0, last = 0, num = 0;
        char op = '+';
        for (int i = 0; i <= s.length(); i++) {
            char ch = i < s.length() ? s.charAt(i) : '+';
            if (ch >= '0' && ch <= '9') {
                num = num * 10 + (ch - '0');
            } else {
                if (op == '+') {
                    total += last;
                    last = num;
                } else if (op == '-') {
                    total += last;
                    last = -num;
                } else if (op == '*') {
                    last *= num;
                } else {
                    last /= num;
                }
                op = ch;
                num = 0;
            }
        }
        System.out.println(total + last);`
    },
    solution: { explanation: ['`total` holds the finished terms and `last` the term being built. `*` and `/` change `last` only, `+` and `-` finish it. A sentinel `+` at the end flushes the last number.'], complexity: 'Time O(n), space O(1).' },
    solve(input) {
      const tokens = input.trim().match(/\d+|[+\-*/]/g);
      const terms = []; let cur = BigInt(tokens[0]); let sign = 1n;
      for (let i = 1; i < tokens.length; i += 2) {
        const op = tokens[i], v = BigInt(tokens[i + 1]);
        if (op === '*') cur *= v;
        else if (op === '/') cur = cur / v;
        else { terms.push(sign * cur); sign = op === '+' ? 1n : -1n; cur = v; }
      }
      terms.push(sign * cur);
      return terms.reduce((a, b) => a + b, 0n).toString();
    },
    tests() {
      const g = rng(226);
      const expr = (count, hi, mulChance) => { const maxOps = hi >= 100000 ? 2 : hi >= 1000 ? 3 : 5; let out = String(randInt(g, 1, hi)); let run = 0; for (let i = 1; i < count; i++) { let op = ['+', '-', '*', '/'][randInt(g, 0, 3)]; if (op === '*' || op === '/') { if (g() > mulChance || run >= maxOps) op = g() < 0.5 ? '+' : '-'; } run = op === '*' || op === '/' ? run + 1 : 0; out += op + randInt(g, 1, hi); } return out; };
      return ['3+2*2\n', '3-5/2\n', '42\n', '1-1\n', '7/2\n', '14-3/2\n', '100000*100000/7\n', '1+2*3-4/2+5*6/3-7\n', '2*3*4*5-1000\n', '999999/1000-1\n', `${expr(6, 9, 0.6)}\n`, `${expr(30, 99, 0.4)}\n`, `${expr(60, 999, 0.3)}\n`, `${expr(18, 1000000, 0.2)}\n`].filter((t) => t.length <= 201);
    }
  }
];
