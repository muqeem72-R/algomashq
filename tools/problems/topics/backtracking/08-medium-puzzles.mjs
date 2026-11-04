import { r, rng, randInt, randArray, many, nums, rows, randWord, shuffle } from '../../lib.mjs';

// Runs fast(input) against a slow, independent computation on many small random inputs; throws when they differ.
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };

export default [
  {
    slug: 'shopping-offers',
    title: 'The Cheapest Way to Buy With Special Offers',
    difficulty: 'medium',
    tags: ['recursion', 'memoization', 'optimization'],
    concept: {
      title: 'The state is what is still needed; try every offer that fits',
      body: [
        'A shop sells `n` items at normal prices, and it has some *special offers*: a bundle of items for one price. You need an exact list of items (you may not buy more than you need). The cheapest way: the **state** of the search is the list of what you still need. From a state, either buy everything item by item at normal prices, or use one offer that **fits** (it does not give more than you still need), pay its price, and continue with the smaller list of needs.',
        { code: 'def cheapest(needs):\n    key = tuple(needs)\n    if key in memo:\n        return memo[key]\n    best = sum(p * q for p, q in zip(price, needs))          # no offers at all\n    for o in range(len(offers)):\n        if all(offers[o][i] <= needs[i] for i in range(n)):  # the offer fits\n            rest = [needs[i] - offers[o][i] for i in range(n)]\n            best = min(best, offer_price[o] + cheapest(rest))\n    memo[key] = best\n    return best' },
        'Every offer has at least one item, so the list of needs gets smaller with every offer used, and the recursion ends. Many different orders of using the same offers lead to the **same** list of needs, which is why a memo keyed by the list of needs saves a lot of work. Using an offer twice is allowed if the needs still contain it twice.'
      ]
    },
    statement: ['A shop sells `n` items; item `i` costs `price[i]` if bought alone. There are `s` special offers; offer `j` gives `qty[j][i]` pieces of each item `i` together for the price `offerPrice[j]`. You need exactly `needs[i]` pieces of each item: you must not buy more than needed. Offers can be used many times. Print the smallest amount of money you have to pay.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` prices.', 'The third line has `s`.', 'The next `s` lines have the `n` quantities of each offer.', 'The next line has the `s` prices of the offers.', 'The last line has the `n` needs.'],
    outputFormat: ['Print the smallest cost.'],
    constraints: ['1 <= n <= 6, 1 <= s <= 20', '1 <= price <= 10, 1 <= offer price <= 50', '0 <= quantity in an offer <= 4, and every offer has at least one piece', '0 <= needs[i] <= 4'],
    examples: [{ input: '2\n2 5\n2\n3 0\n1 2\n5 10\n3 2\n', note: 'Buy the offer (3 of item 1 for 5), then 2 pieces of item 2 alone (10): total 15; or buy offer 2 (1 + 2 pieces for 10) and 2 + 0 of item 1 for 4: total 14.' }],
    hints: ['Describe the state by the numbers of pieces still needed.', 'Without offers you pay the normal prices; try every offer that does not give more than is needed.', 'Store the best cost for each list of needs.'],
    program: {
      io: ['n:int', 'price:int[n]', 's:int', 'qty:int[s][n]', 'offerPrice:int[s]', 'needs:int[n]'],
      includes: ['<map>', '<algorithm>'],
      helpers: {
        python: r`
          def cheapest(price, qty, offer_price, needs, memo):
              key = tuple(needs)
              if key in memo:
                  return memo[key]
              best = sum(p * q for p, q in zip(price, needs))
              for o in range(len(qty)):
                  if all(qty[o][i] <= needs[i] for i in range(len(needs))):
                      rest = [needs[i] - qty[o][i] for i in range(len(needs))]
                      best = min(best, offer_price[o] + cheapest(price, qty, offer_price, rest, memo))
              memo[key] = best
              return best`,
        cpp: r`
          long long cheapest(const vector<long long>& price, const vector<vector<long long>>& qty, const vector<long long>& offerPrice, const vector<long long>& needs, map<vector<long long>, long long>& memo) {
              auto found = memo.find(needs);
              if (found != memo.end()) return found->second;
              long long best = 0;
              for (size_t i = 0; i < needs.size(); i++) best += price[i] * needs[i];
              for (size_t o = 0; o < qty.size(); o++) {
                  bool fits = true;
                  for (size_t i = 0; i < needs.size(); i++) {
                      if (qty[o][i] > needs[i]) fits = false;
                  }
                  if (!fits) continue;
                  vector<long long> rest(needs);
                  for (size_t i = 0; i < needs.size(); i++) rest[i] -= qty[o][i];
                  best = min(best, offerPrice[o] + cheapest(price, qty, offerPrice, rest, memo));
              }
              memo[needs] = best;
              return best;
          }`,
        java: r`
          static long cheapest(long[] price, long[][] qty, long[] offerPrice, long[] needs, Map<String, Long> memo) {
              String key = Arrays.toString(needs);
              Long found = memo.get(key);
              if (found != null) return found;
              long best = 0;
              for (int i = 0; i < needs.length; i++) best += price[i] * needs[i];
              for (int o = 0; o < qty.length; o++) {
                  boolean fits = true;
                  for (int i = 0; i < needs.length; i++) {
                      if (qty[o][i] > needs[i]) fits = false;
                  }
                  if (!fits) continue;
                  long[] rest = needs.clone();
                  for (int i = 0; i < needs.length; i++) rest[i] -= qty[o][i];
                  best = Math.min(best, offerPrice[o] + cheapest(price, qty, offerPrice, rest, memo));
              }
              memo.put(key, best);
              return best;
          }`
      },
      python: 'print(cheapest(price, qty, offerPrice, needs, {}))',
      cpp: r`
        map<vector<long long>, long long> memo;
        cout << cheapest(price, qty, offerPrice, needs, memo) << "\n";`,
      java: 'System.out.println(cheapest(price, qty, offerPrice, needs, new HashMap<>()));'
    },
    solution: { explanation: ['The cost of a list of needs is the minimum of buying all items at normal prices and, for every offer that fits, the offer price plus the cost of the smaller list of needs. A memo keyed by the list of needs stores each result.'], complexity: 'Time O(states * s * n) with at most 5^6 = 15625 states, space O(states).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const price = nums(rs[1]); const s = Number(rs[2]); const qty = rs.slice(3, 3 + s).map(nums); const offerPrice = nums(rs[3 + s]); const needs = nums(rs[4 + s]);
      const radix = needs.map((x) => x + 1); const total = radix.reduce((x, y) => x * y, 1); const decode = (code) => { const v = []; for (let i = 0; i < n; i++) { v.push(code % radix[i]); code = Math.floor(code / radix[i]); } return v; }; const encode = (v) => { let code = 0, mul = 1; for (let i = 0; i < n; i++) { code += v[i] * mul; mul *= radix[i]; } return code; };
      const dp = Array(total).fill(Infinity); dp[0] = 0;
      for (let code = 1; code < total; code++) { const v = decode(code); for (let i = 0; i < n; i++) if (v[i] > 0) { const w = v.slice(); w[i]--; dp[code] = Math.min(dp[code], dp[encode(w)] + price[i]); } for (let o = 0; o < s; o++) if (v.every((x, i) => x >= qty[o][i])) dp[code] = Math.min(dp[code], dp[encode(v.map((x, i) => x - qty[o][i]))] + offerPrice[o]); }
      return String(dp[total - 1]);
    },
    tests() {
      const g = rng(660);
      const make = (price, qty, offerPrice, needs) => `${price.length}\n${price.join(' ')}\n${qty.length}\n${qty.map((q) => q.join(' ')).join('\n')}\n${offerPrice.join(' ')}\n${needs.join(' ')}\n`;
      const offersFor = (n, s) => many(s, () => { const q = many(n, () => randInt(g, 0, 3)); if (q.every((x) => x === 0)) q[randInt(g, 0, n - 1)] = 1; return q; });
      const random = (n, s, needHi) => make(many(n, () => randInt(g, 1, 10)), offersFor(n, s), many(s, () => randInt(g, 1, 40)), many(n, () => randInt(g, 0, needHi)));
      return ['2\n2 5\n2\n3 0\n1 2\n5 10\n3 2\n', make([5], [[3]], [10], [3]), make([5], [[3]], [20], [3]), make([5], [[1]], [3], [4]), make([2, 3, 4], [[1, 1, 1]], [3], [0, 0, 0]), make([1, 1, 1, 1, 1, 1], [[1, 1, 1, 1, 1, 1]], [5], [4, 4, 4, 4, 4, 4]), random(3, 5, 4), random(4, 10, 4), random(5, 15, 4), random(6, 20, 4), random(6, 20, 4), random(6, 20, 3), random(2, 3, 4), random(6, 4, 4)];
    }
  },

  {
    slug: 'cryptarithm-count',
    title: 'Letters Instead of Digits',
    difficulty: 'medium',
    tags: ['backtracking', 'permutations', 'puzzle'],
    concept: {
      title: 'Give each letter a different digit, then check the sum',
      body: [
        'In a *cryptarithm* the digits of a sum are replaced by letters: the same letter always stands for the same digit and different letters for different digits. For example `ab + ba = cc` is true for `a = 1, b = 2, c = 3` (12 + 21 = 33). A number does not start with a zero, so the first letter of a word with more than one letter cannot be 0.',
        'The search assigns a digit to the letters one by one, in order of first appearance, with a table `used` for the digits that are taken. A digit is skipped if it is taken, or if it is 0 and the letter is a leading letter. When every letter has a digit, the sum is checked.',
        { code: 'def assign(idx):\n    if idx == len(letters):\n        return 1 if value(a) + value(b) == value(c) else 0\n    total = 0\n    for d in range(10):\n        if used[d] or (d == 0 and letters[idx] in leading):\n            continue\n        used[d] = True\n        digit[letters[idx]] = d\n        total += assign(idx + 1)\n        used[d] = False\n    return total' },
        'With `L` letters there are at most `10 * 9 * ... * (10 - L + 1)` assignments, 151200 for six letters, which is why the number of different letters is limited. Smarter solutions check the sum column by column from the right and cut many assignments early, but even this plain version is fast enough here.'
      ]
    },
    statement: ['You are given three words `a`, `b` and `c` of lowercase letters. Replace every letter by a digit: the same letter by the same digit and different letters by different digits. A word with more than one letter must not start with the digit 0. Count the replacements for which `a + b = c` is a true sum of numbers.'],
    inputFormat: ['The only line has the three words.'],
    outputFormat: ['Print the number of replacements.'],
    constraints: ['Each word has 1 to 6 letters.', 'There are at most 6 different letters in the three words together.'],
    examples: [{ input: 'ab ba cc\n', note: 'a + b = c with a, b, c different, and a, b not 0: for example 12 + 21 = 33. There are 32 such replacements.' }],
    hints: ['List the different letters in order of first appearance and give them digits one by one.', 'A digit that is already used for another letter is not allowed.', 'A first letter of a longer word cannot be 0; check the sum when all letters have a digit.'],
    program: {
      io: ['a:word b:word c:word'],
      helpers: {
        python: r`
          def value(word, digit):
              v = 0
              for ch in word:
                  v = v * 10 + digit[ch]
              return v

          def assign(idx, letters, digit, used, words, leading):
              if idx == len(letters):
                  return 1 if value(words[0], digit) + value(words[1], digit) == value(words[2], digit) else 0
              total = 0
              for d in range(10):
                  if used[d] or (d == 0 and letters[idx] in leading):
                      continue
                  used[d] = True
                  digit[letters[idx]] = d
                  total += assign(idx + 1, letters, digit, used, words, leading)
                  used[d] = False
              return total`,
        cpp: r`
          long long value(const string& word, const vector<int>& digit) {
              long long v = 0;
              for (char ch : word) v = v * 10 + digit[ch - 'a'];
              return v;
          }

          long long assign(size_t idx, const vector<char>& letters, vector<int>& digit, vector<char>& used, const vector<string>& words, const vector<char>& leading) {
              if (idx == letters.size()) return value(words[0], digit) + value(words[1], digit) == value(words[2], digit) ? 1 : 0;
              long long total = 0;
              for (int d = 0; d < 10; d++) {
                  if (used[d] || (d == 0 && leading[letters[idx] - 'a'])) continue;
                  used[d] = 1;
                  digit[letters[idx] - 'a'] = d;
                  total += assign(idx + 1, letters, digit, used, words, leading);
                  used[d] = 0;
              }
              return total;
          }`,
        java: r`
          static long value(String word, int[] digit) {
              long v = 0;
              for (char ch : word.toCharArray()) v = v * 10 + digit[ch - 'a'];
              return v;
          }

          static long assign(int idx, List<Character> letters, int[] digit, boolean[] used, String[] words, boolean[] leading) {
              if (idx == letters.size()) return value(words[0], digit) + value(words[1], digit) == value(words[2], digit) ? 1 : 0;
              long total = 0;
              char letter = letters.get(idx);
              for (int d = 0; d < 10; d++) {
                  if (used[d] || (d == 0 && leading[letter - 'a'])) continue;
                  used[d] = true;
                  digit[letter - 'a'] = d;
                  total += assign(idx + 1, letters, digit, used, words, leading);
                  used[d] = false;
              }
              return total;
          }`
      },
      python: r`
        words = [a, b, c]
        letters = []
        for w in words:
            for ch in w:
                if ch not in letters:
                    letters.append(ch)
        leading = set(w[0] for w in words if len(w) > 1)
        print(assign(0, letters, {}, [False] * 10, words, leading))`,
      cpp: r`
        vector<string> words = {a, b, c};
        vector<char> letters;
        vector<char> seen(26, 0), leading(26, 0);
        for (const string& w : words) {
            for (char ch : w) {
                if (!seen[ch - 'a']) {
                    seen[ch - 'a'] = 1;
                    letters.push_back(ch);
                }
            }
            if (w.size() > 1) leading[w[0] - 'a'] = 1;
        }
        vector<int> digit(26, 0);
        vector<char> used(10, 0);
        cout << assign(0, letters, digit, used, words, leading) << "\n";`,
      java: r`
        String[] words = {a, b, c};
        List<Character> letters = new ArrayList<>();
        boolean[] leading = new boolean[26];
        for (String w : words) {
            for (char ch : w.toCharArray()) {
                if (!letters.contains(ch)) letters.add(ch);
            }
            if (w.length() > 1) leading[w.charAt(0) - 'a'] = true;
        }
        System.out.println(assign(0, letters, new int[26], new boolean[10], words, leading));`
    },
    solution: { explanation: ['Letters get distinct digits in order of first appearance (never 0 for a leading letter of a longer word). When all letters are assigned, the two sides of the sum are computed and compared.'], complexity: 'Time O(10!/(10-L)! * length) for L letters, at most 151200 assignments here.' },
    solve(input) {
      const words = rows(input)[0].trim().split(/\s+/); const letters = [...new Set(words.join('').split(''))]; const leading = new Set(words.filter((w) => w.length > 1).map((w) => w[0]));
      let count = 0; const digit = {}; const used = Array(10).fill(false);
      const val = (w) => [...w].reduce((v, ch) => v * 10 + digit[ch], 0);
      const go = (i) => { if (i === letters.length) { if (val(words[0]) + val(words[1]) === val(words[2])) count++; return; } for (let d = 0; d < 10; d++) { if (used[d] || (d === 0 && leading.has(letters[i]))) continue; used[d] = true; digit[letters[i]] = d; go(i + 1); used[d] = false; } };
      go(0); return String(count);
    },
    tests() {
      const g = rng(661);
      const pick = (pool, len) => many(len, () => pool[randInt(g, 0, pool.length - 1)]).join('');
      const make = (a, b, c) => `${a} ${b} ${c}\n`;
      const randomSum = (pool) => { const x = pick(pool, randInt(g, 1, 4)); const y = pick(pool, randInt(g, 1, 4)); const z = pick(pool, randInt(g, Math.max(x.length, y.length), Math.max(x.length, y.length) + 1)); return make(x, y, z); };
      return ['ab ba cc\n', 'a b c\n', 'a a b\n', 'a b a\n', 'ab ab ba\n', 'abc cba dcb\n', 'abc def abd\n', make('ab', 'cd', 'cdb'), make('abc', 'bca', 'cabd'), randomSum('abcdef'), randomSum('abcdef'), randomSum('abcde'), randomSum('abcd'), randomSum('abcdef'), randomSum('abc'), 'aaa bbb ccc\n', 'abcde fedcb abcdf\n', 'abab baba cccc\n'];
    }
  },

  {
    slug: 'paint-grid-count',
    title: 'Paint the Grid So Neighbours Differ',
    difficulty: 'medium',
    tags: ['backtracking', 'grid', 'counting'],
    concept: {
      title: 'Colour cell by cell and look only at the two neighbours already painted',
      body: [
        'A grid with `r` rows and `c` columns must be painted with `k` colours so that two cells that **share an edge** have different colours. Paint the cells in reading order (row by row, left to right). When a cell is painted, only two of its neighbours are painted already: the one on the **left** and the one **above**. The other two will check against this cell later.',
        { code: 'def paint(pos):\n    if pos == r * c:\n        return 1\n    row, col = divmod(pos, c)\n    total = 0\n    for color in range(k):\n        if col > 0 and cells[pos - 1] == color:\n            continue                         # the same as the left neighbour\n        if row > 0 and cells[pos - c] == color:\n            continue                         # the same as the neighbour above\n        cells[pos] = color\n        total += paint(pos + 1)\n    return total' },
        'Again no undo is needed: the value `cells[pos]` is overwritten by the next try, and later cells only read cells with smaller positions. This "decide in an order in which every rule looks backwards" pattern is the simplest kind of backtracking. A single row of 10 cells with 4 colours already has `4 * 3^9 = 78732` colourings.'
      ]
    },
    statement: ['A grid has `r` rows and `c` columns. Count the ways to paint every cell with one of `k` colours so that any two cells that share an edge (left-right or up-down) have different colours. The colours are different from each other.'],
    inputFormat: ['The only line has `r`, `c` and `k`.'],
    outputFormat: ['Print the number of ways.'],
    constraints: ['1 <= r, c and r * c <= 10', '1 <= k <= 4'],
    examples: [{ input: '2 2 3\n', note: 'The top-left cell has 3 colours, the others follow: the 2 by 2 grid has 18 valid paintings with 3 colours.' }],
    hints: ['Paint the cells in reading order.', 'A cell has to differ from the cell on its left and the cell above it, when they exist.', 'The result of the loop does not need an undo step, because later cells only look at earlier cells.'],
    program: {
      io: ['r:int c:int k:int'],
      helpers: {
        python: r`
          def paint(pos, r, c, k, cells):
              if pos == r * c:
                  return 1
              row, col = divmod(pos, c)
              total = 0
              for color in range(k):
                  if col > 0 and cells[pos - 1] == color:
                      continue
                  if row > 0 and cells[pos - c] == color:
                      continue
                  cells[pos] = color
                  total += paint(pos + 1, r, c, k, cells)
              return total`,
        cpp: r`
          long long paint(int pos, int r, int c, int k, vector<int>& cells) {
              if (pos == r * c) return 1;
              int row = pos / c, col = pos % c;
              long long total = 0;
              for (int color = 0; color < k; color++) {
                  if (col > 0 && cells[pos - 1] == color) continue;
                  if (row > 0 && cells[pos - c] == color) continue;
                  cells[pos] = color;
                  total += paint(pos + 1, r, c, k, cells);
              }
              return total;
          }`,
        java: r`
          static long paint(int pos, int r, int c, int k, int[] cells) {
              if (pos == r * c) return 1;
              int row = pos / c, col = pos % c;
              long total = 0;
              for (int color = 0; color < k; color++) {
                  if (col > 0 && cells[pos - 1] == color) continue;
                  if (row > 0 && cells[pos - c] == color) continue;
                  cells[pos] = color;
                  total += paint(pos + 1, r, c, k, cells);
              }
              return total;
          }`
      },
      python: 'print(paint(0, r, c, k, [-1] * (r * c)))',
      cpp: r`
        vector<int> cells(r * c, -1);
        cout << paint(0, (int)r, (int)c, (int)k, cells) << "\n";`,
      java: 'System.out.println(paint(0, (int) r, (int) c, (int) k, new int[(int) (r * c)]));'
    },
    solution: { explanation: ['The cells are painted in reading order; a colour is rejected when it equals the colour of the left or the upper neighbour. A fully painted grid counts one.'], complexity: 'Time proportional to the answer, up to about 80 000 paintings here; space O(r * c).' },
    solve(input) {
      const [r, c, k] = nums(rows(input)[0]); const total = k ** (r * c); let count = 0;
      for (let code = 0; code < total; code++) { const cells = []; let x = code; for (let i = 0; i < r * c; i++) { cells.push(x % k); x = Math.floor(x / k); } let ok = true; for (let i = 0; i < r && ok; i++) for (let j = 0; j < c; j++) { if (j + 1 < c && cells[i * c + j] === cells[i * c + j + 1]) { ok = false; break; } if (i + 1 < r && cells[i * c + j] === cells[(i + 1) * c + j]) { ok = false; break; } } if (ok) count++; }
      return String(count);
    },
    tests() { return ['2 2 3\n', '1 1 1\n', '1 1 4\n', '1 2 1\n', '1 2 2\n', '2 2 2\n', '1 10 4\n', '10 1 4\n', '2 5 4\n', '5 2 4\n', '3 3 4\n', '3 3 3\n', '2 4 4\n', '3 3 2\n', '1 10 2\n', '4 2 4\n', '2 3 4\n']; }
  },

  {
    slug: 'non-attacking-rooks',
    title: 'Rooks That Do Not Attack Each Other',
    difficulty: 'medium',
    tags: ['backtracking', 'chessboard', 'counting'],
    concept: {
      title: 'For every row: leave it empty, or put the rook in a free column',
      body: [
        'Rooks attack along rows and columns. To place `k` rooks that do not attack each other, no two may share a row or a column. Go through the rows from the top. In each row there are two kinds of choices: **no rook in this row**, or **a rook in some column** that is allowed (the square is not forbidden) and not used by an earlier rook. A table `cols` remembers the used columns.',
        { code: 'def place(row, k):                       # k rooks are still to be placed\n    if k == 0:\n        return 1\n    if row == n:\n        return 0                          # the board is over but rooks are missing\n    total = place(row + 1, k)             # no rook in this row\n    for col in range(n):\n        if board[row][col] == "." and not cols[col]:\n            cols[col] = True\n            total += place(row + 1, k - 1)\n            cols[col] = False\n    return total' },
        'The line `if row == n: return 0` is the base case for "failure". Note that a placement is **complete** as soon as `k` reaches 0, so the rest of the board is not even visited. If fewer rows remain than rooks still to place, the branch could be cut earlier; adding the check `n - row < k` is a good pruning.'
      ]
    },
    statement: ['A board has `n` rows and `n` columns; some squares are forbidden (`#`), the others are free (`.`). Count the ways to place exactly `k` rooks on free squares so that no two rooks are in the same row or in the same column. Two placements are different if the sets of squares are different.'],
    inputFormat: ['The first line has `n` and `k`.', 'Each of the next `n` lines has `n` characters, `.` or `#`.'],
    outputFormat: ['Print the number of placements.'],
    constraints: ['1 <= n <= 7', '1 <= k <= n'],
    examples: [{ input: '2 2\n..\n..\n', note: 'The two rooks are on a diagonal; there are 2 diagonals.' }],
    hints: ['For each row decide: no rook, or a rook in an allowed column that is not used.', 'Remember the used columns in a table and clear the entry after the recursive call.', 'Stop with the answer 1 as soon as all k rooks are placed.'],
    program: {
      io: ['n:int k:int', 'board:rows[n]'],
      helpers: {
        python: r`
          def place(board, n, row, k, cols):
              if k == 0:
                  return 1
              if n - row < k:
                  return 0
              total = place(board, n, row + 1, k, cols)
              for col in range(n):
                  if board[row][col] == "." and not cols[col]:
                      cols[col] = True
                      total += place(board, n, row + 1, k - 1, cols)
                      cols[col] = False
              return total`,
        cpp: r`
          long long place(const vector<string>& board, int n, int row, int k, vector<char>& cols) {
              if (k == 0) return 1;
              if (n - row < k) return 0;
              long long total = place(board, n, row + 1, k, cols);
              for (int col = 0; col < n; col++) {
                  if (board[row][col] == '.' && !cols[col]) {
                      cols[col] = 1;
                      total += place(board, n, row + 1, k - 1, cols);
                      cols[col] = 0;
                  }
              }
              return total;
          }`,
        java: r`
          static long place(String[] board, int n, int row, int k, boolean[] cols) {
              if (k == 0) return 1;
              if (n - row < k) return 0;
              long total = place(board, n, row + 1, k, cols);
              for (int col = 0; col < n; col++) {
                  if (board[row].charAt(col) == '.' && !cols[col]) {
                      cols[col] = true;
                      total += place(board, n, row + 1, k - 1, cols);
                      cols[col] = false;
                  }
              }
              return total;
          }`
      },
      python: 'print(place(board, n, 0, k, [False] * n))',
      cpp: r`
        vector<char> cols(n, 0);
        cout << place(board, (int)n, 0, (int)k, cols) << "\n";`,
      java: 'System.out.println(place(board, (int) n, 0, (int) k, new boolean[(int) n]));'
    },
    solution: { explanation: ['Row by row, either no rook is placed or a rook goes to a free square in an unused column. The count of placements is returned when `k` rooks are placed; a branch with too few rows left is cut.'], complexity: 'Time proportional to the number of partial placements (at most about 10^5 here), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, k] = nums(rs[0]); const board = rs.slice(1, 1 + n);
      let f = new Map([[0, 1]]); // column mask -> number of ways, rooks = popcount
      for (let row = 0; row < n; row++) { const next = new Map(f); for (const [mask, ways] of f) for (let col = 0; col < n; col++) if (board[row][col] === '.' && !((mask >> col) & 1)) next.set(mask | (1 << col), (next.get(mask | (1 << col)) || 0) + ways); f = next; }
      let total = 0; for (const [mask, ways] of f) { let bits = 0; for (let m = mask; m; m &= m - 1) bits++; if (bits === k) total += ways; } return String(total);
    },
    tests() {
      const g = rng(662);
      const make = (n, k, p) => { const m = many(n, () => many(n, () => (g() < p ? '#' : '.'))); return `${n} ${k}\n${m.map((x) => x.join('')).join('\n')}\n`; };
      return ['2 2\n..\n..\n', '1 1\n.\n', '1 1\n#\n', '3 2\n...\n...\n...\n', '3 3\n.#.\n#.#\n.#.\n', make(7, 3, 0), make(7, 5, 0), make(7, 4, 0.1), make(7, 7, 0.1), make(7, 6, 0.2), make(6, 3, 0.3), make(7, 2, 0.5), make(5, 5, 0), make(7, 1, 0.2), make(6, 4, 0.15), make(7, 6, 0)];
    }
  },

  {
    slug: 'domino-tilings-count',
    title: 'Cover the Board With Dominoes',
    difficulty: 'medium',
    tags: ['backtracking', 'grid', 'tiling'],
    concept: {
      title: 'Always cover the first empty square, in one of two ways',
      body: [
        'A *domino* covers two squares that share an edge: two side by side (horizontal) or two on top of each other (vertical). Count the ways to cover **all free squares** of a board with dominoes, with no overlap. Different orders in which the same dominoes are placed must not be counted twice. The trick: always cover the **first empty square** in reading order. Whatever domino covers it, it must be one of two: the square to its right, or the square below it. (The square on the left or above is already covered.)',
        { code: 'def tilings(pos):\n    while pos < r * c and covered[pos // c][pos % c]:\n        pos += 1                          # find the first empty square\n    if pos == r * c:\n        return 1                          # nothing is left: one tiling\n    row, col = divmod(pos, c)\n    total = 0\n    covered[row][col] = True\n    if col + 1 < c and not covered[row][col + 1]:       # horizontal\n        covered[row][col + 1] = True\n        total += tilings(pos + 1)\n        covered[row][col + 1] = False\n    if row + 1 < r and not covered[row + 1][col]:       # vertical\n        covered[row + 1][col] = True\n        total += tilings(pos + 1)\n        covered[row + 1][col] = False\n    covered[row][col] = False\n    return total' },
        'Choosing the *position first, then the piece* is a general way to count tilings without duplicates: every tiling is built in exactly one order. A hole (`#`) is just a square that is covered from the start. An odd number of free squares gives 0 at once. A 6 by 6 board has 6728 tilings.'
      ]
    },
    statement: ['A board has `r` rows and `c` columns; some squares are holes (`#`) and the others are free (`.`). Count the ways to cover every free square with dominoes (each domino covers two free squares that share an edge, dominoes do not overlap, holes stay uncovered). Two tilings are different if some domino position differs.'],
    inputFormat: ['The first line has `r` and `c`.', 'Each of the next `r` lines has `c` characters, `.` or `#`.'],
    outputFormat: ['Print the number of tilings (it can be 0).'],
    constraints: ['1 <= r, c <= 6'],
    examples: [{ input: '2 2\n..\n..\n', note: 'Two horizontal dominoes or two vertical dominoes: 2 tilings.' }],
    hints: ['Find the first free square (in reading order) that is not covered yet.', 'Try a horizontal domino to the right and a vertical domino below.', 'Mark the squares of the domino before the recursive call and unmark them afterwards.'],
    program: {
      io: ['r:int c:int', 'board:rows[r]'],
      helpers: {
        python: r`
          def tilings(covered, r, c, pos):
              while pos < r * c and covered[pos // c][pos % c]:
                  pos += 1
              if pos == r * c:
                  return 1
              row, col = divmod(pos, c)
              total = 0
              covered[row][col] = True
              if col + 1 < c and not covered[row][col + 1]:
                  covered[row][col + 1] = True
                  total += tilings(covered, r, c, pos + 1)
                  covered[row][col + 1] = False
              if row + 1 < r and not covered[row + 1][col]:
                  covered[row + 1][col] = True
                  total += tilings(covered, r, c, pos + 1)
                  covered[row + 1][col] = False
              covered[row][col] = False
              return total`,
        cpp: r`
          long long tilings(vector<vector<char>>& covered, int r, int c, int pos) {
              while (pos < r * c && covered[pos / c][pos % c]) pos++;
              if (pos == r * c) return 1;
              int row = pos / c, col = pos % c;
              long long total = 0;
              covered[row][col] = 1;
              if (col + 1 < c && !covered[row][col + 1]) {
                  covered[row][col + 1] = 1;
                  total += tilings(covered, r, c, pos + 1);
                  covered[row][col + 1] = 0;
              }
              if (row + 1 < r && !covered[row + 1][col]) {
                  covered[row + 1][col] = 1;
                  total += tilings(covered, r, c, pos + 1);
                  covered[row + 1][col] = 0;
              }
              covered[row][col] = 0;
              return total;
          }`,
        java: r`
          static long tilings(boolean[][] covered, int r, int c, int pos) {
              while (pos < r * c && covered[pos / c][pos % c]) pos++;
              if (pos == r * c) return 1;
              int row = pos / c, col = pos % c;
              long total = 0;
              covered[row][col] = true;
              if (col + 1 < c && !covered[row][col + 1]) {
                  covered[row][col + 1] = true;
                  total += tilings(covered, r, c, pos + 1);
                  covered[row][col + 1] = false;
              }
              if (row + 1 < r && !covered[row + 1][col]) {
                  covered[row + 1][col] = true;
                  total += tilings(covered, r, c, pos + 1);
                  covered[row + 1][col] = false;
              }
              covered[row][col] = false;
              return total;
          }`
      },
      python: r`
        covered = [[ch == "#" for ch in row] for row in board]
        print(tilings(covered, r, c, 0))`,
      cpp: r`
        vector<vector<char>> covered(r, vector<char>(c, 0));
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) covered[i][j] = board[i][j] == '#';
        }
        cout << tilings(covered, (int)r, (int)c, 0) << "\n";`,
      java: r`
        boolean[][] covered = new boolean[(int) r][(int) c];
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) covered[i][j] = board[i].charAt(j) == '#';
        }
        System.out.println(tilings(covered, (int) r, (int) c, 0));`
    },
    solution: { explanation: ['The function finds the first uncovered free square and covers it with a horizontal domino (if the right neighbour is free) or a vertical domino (if the square below is free), recursing after each. Every tiling is built in exactly one order, so none is counted twice.'], complexity: 'Time proportional to the number of partial tilings (small for 6 by 6), space O(r * c).' },
    solve(input) {
      const rs = rows(input); const [r, c] = nums(rs[0]); const board = rs.slice(1, 1 + r);
      // row by row dynamic programming over the squares of the next row already covered by vertical dominoes
      let f = new Map([[0, 1]]);
      for (let row = 0; row < r; row++) {
        const next = new Map();
        for (const [mask, ways] of f) {
          const fill = (col, cur, out) => { if (col === c) { next.set(out, (next.get(out) || 0) + ways); return; } const blocked = board[row][col] === '#'; const taken = (cur >> col) & 1; if (blocked || taken) { if (blocked && taken) return; fill(col + 1, cur, out); return; } // a free square not yet covered
            if (row + 1 < r && board[row + 1][col] !== '#') fill(col + 1, cur, out | (1 << col)); // vertical
            if (col + 1 < c && board[row][col + 1] !== '#' && !((cur >> (col + 1)) & 1)) fill(col + 2, cur, out); // horizontal
          };
          fill(0, mask, 0);
        }
        f = next;
      }
      return String(f.get(0) || 0);
    },
    tests() {
      const g = rng(663);
      const make = (r, c, p) => { const m = many(r, () => many(c, () => (g() < p ? '#' : '.'))); return `${r} ${c}\n${m.map((x) => x.join('')).join('\n')}\n`; };
      return ['2 2\n..\n..\n', '1 1\n.\n', '1 1\n#\n', '1 2\n..\n', '2 3\n...\n...\n', '3 3\n...\n.#.\n...\n', '6 6\n' + many(6, () => '......').join('\n') + '\n', '5 6\n' + many(5, () => '......').join('\n') + '\n', '6 5\n' + many(6, () => '.....').join('\n') + '\n', '4 4\n' + many(4, () => '....').join('\n') + '\n', make(6, 6, 0.05), make(6, 6, 0.1), make(5, 6, 0.1), make(6, 4, 0.15), make(6, 6, 0.2), make(3, 6, 0.1)];
    }
  },

  {
    slug: 'prime-rings-count',
    title: 'Rings of Numbers With Prime Sums',
    difficulty: 'medium',
    tags: ['backtracking', 'permutations', 'primes'],
    concept: {
      title: 'Fix the first number to avoid counting rotations',
      body: [
        'Arrange the numbers `1 .. n` in a circle so that every two neighbours (including the last and the first) add up to a **prime number**. Count the arrangements. A circle can be turned, so to avoid counting the same ring `n` times we **fix** the number 1 in the first place: all rings are written starting from 1, going around in one direction. (The same ring read in the opposite direction is a different arrangement here and counts separately.)',
        { code: 'def count(ring, used):\n    if len(ring) == n:\n        return 1 if prime[ring[-1] + ring[0]] else 0     # close the circle\n    total = 0\n    for v in range(2, n + 1):\n        if not used[v] and prime[ring[-1] + v]:         # the new neighbour sum must be prime\n            used[v] = True\n            ring.append(v)\n            total += count(ring, used)\n            ring.pop()\n            used[v] = False\n    return total' },
        'The sum of two numbers is at most `2n`, so a table of primes up to `2n` answers every question at once (a **sieve**). Two odd numbers add up to an even number above 2, which is never prime, so in any ring odd and even numbers must alternate: for an odd `n` there are no rings. The search finds this out by itself, but only after trying many starts, so the limit is `n <= 14`.'
      ]
    },
    statement: ['Count the ways to write the numbers `1, 2, ..., n` in a circle, starting with 1 and going around in one direction, so that every two neighbouring numbers add up to a prime number (the last number and the first number are also neighbours). The same circle read in the opposite direction is counted as a different way.'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['Print the number of rings.'],
    constraints: ['2 <= n <= 14'],
    examples: [{ input: '4\n', note: 'The rings are 1 2 3 4 and 1 4 3 2 (sums 3, 5, 7, 5 and 5, 7, 5, 3).' }],
    hints: ['Fix 1 as the first number of the ring.', 'A new number can follow the last one only if their sum is prime.', 'When all numbers are placed, check that the last number and 1 also add up to a prime.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def count(n, ring, used, prime):
              if len(ring) == n:
                  return 1 if prime[ring[-1] + ring[0]] else 0
              total = 0
              for v in range(2, n + 1):
                  if not used[v] and prime[ring[-1] + v]:
                      used[v] = True
                      ring.append(v)
                      total += count(n, ring, used, prime)
                      ring.pop()
                      used[v] = False
              return total`,
        cpp: r`
          long long countRings(int n, vector<int>& ring, vector<char>& used, const vector<char>& prime) {
              if ((int)ring.size() == n) return prime[ring.back() + ring[0]] ? 1 : 0;
              long long total = 0;
              for (int v = 2; v <= n; v++) {
                  if (!used[v] && prime[ring.back() + v]) {
                      used[v] = 1;
                      ring.push_back(v);
                      total += countRings(n, ring, used, prime);
                      ring.pop_back();
                      used[v] = 0;
                  }
              }
              return total;
          }`,
        java: r`
          static long countRings(int n, List<Integer> ring, boolean[] used, boolean[] prime) {
              if (ring.size() == n) return prime[ring.get(ring.size() - 1) + ring.get(0)] ? 1 : 0;
              long total = 0;
              for (int v = 2; v <= n; v++) {
                  if (!used[v] && prime[ring.get(ring.size() - 1) + v]) {
                      used[v] = true;
                      ring.add(v);
                      total += countRings(n, ring, used, prime);
                      ring.remove(ring.size() - 1);
                      used[v] = false;
                  }
              }
              return total;
          }`
      },
      python: r`
        prime = [x >= 2 and all(x % d != 0 for d in range(2, int(x ** 0.5) + 1)) for x in range(2 * n + 1)]
        print(count(n, [1], [False] * (n + 1), prime))`,
      cpp: r`
        vector<char> prime(2 * n + 1, 0);
        for (int x = 2; x <= 2 * n; x++) {
            prime[x] = 1;
            for (int d = 2; d * d <= x; d++) {
                if (x % d == 0) prime[x] = 0;
            }
        }
        vector<int> ring = {1};
        vector<char> used(n + 1, 0);
        cout << countRings((int)n, ring, used, prime) << "\n";`,
      java: r`
        boolean[] prime = new boolean[2 * (int) n + 1];
        for (int x = 2; x <= 2 * n; x++) {
            prime[x] = true;
            for (int d = 2; d * d <= x; d++) {
                if (x % d == 0) prime[x] = false;
            }
        }
        List<Integer> ring = new ArrayList<>();
        ring.add(1);
        System.out.println(countRings((int) n, ring, new boolean[(int) n + 1], prime));`
    },
    solution: { explanation: ['The ring starts with 1; each next number must be unused and sum to a prime with the previous one. When all `n` numbers are placed, the closing sum with the first number must be prime too.'], complexity: 'Time about 60 000 steps for n = 14, space O(n).' },
    solve(input) {
      const n = Number(rows(input)[0]); const isPrime = (x) => { if (x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true; };
      const ring = [1]; const used = Array(n + 1).fill(false); let count = 0;
      const go = () => { if (ring.length === n) { if (isPrime(ring[n - 1] + 1)) count++; return; } for (let v = 2; v <= n; v++) if (!used[v] && isPrime(ring[ring.length - 1] + v)) { used[v] = true; ring.push(v); go(); ring.pop(); used[v] = false; } };
      go(); return String(count);
    },
    tests() { return many(13, (i) => `${i + 2}\n`); }
  },

  {
    slug: 'peaceful-kings',
    title: 'Kings That Do Not Touch',
    difficulty: 'medium',
    tags: ['backtracking', 'chessboard', 'counting'],
    concept: {
      title: 'For every square: leave it empty, or put a king if no neighbour has one',
      body: [
        'A king attacks the eight squares around it (also the diagonals). Count the ways to place `k` kings on an `n` by `n` board so that **no two kings are neighbours** (no two kings touch, even at a corner). Go through the squares in reading order. For each square there are two choices: leave it empty, or put a king there. A king is allowed only if none of the kings placed before is within one row and one column of it.',
        { code: 'def place(pos, k):                       # k kings are still to be placed\n    if k == 0:\n        return 1\n    if pos == n * n or n * n - pos < k:\n        return 0                          # not enough squares left\n    row, col = divmod(pos, n)\n    total = place(pos + 1, k)             # leave this square empty\n    if all(abs(row - r2) > 1 or abs(col - c2) > 1 for r2, c2 in placed):\n        placed.append((row, col))\n        total += place(pos + 1, k - 1)\n        placed.pop()\n    return total' },
        'The check `n * n - pos < k` stops a branch that can no longer place all the kings: with few squares left there is no hope. Pruning of this kind ("not enough room left") is common in problems where you must choose exactly `k` objects. Squares where a king would touch an earlier king are skipped.'
      ]
    },
    statement: ['Count the ways to place exactly `k` kings on an `n` by `n` chessboard so that no two kings attack each other, that is, no two kings are in squares that share a side or a corner. Two placements are different if the sets of squares are different.'],
    inputFormat: ['The only line has `n` and `k`.'],
    outputFormat: ['Print the number of placements (it can be 0).'],
    constraints: ['1 <= n <= 5', '1 <= k <= n * n'],
    examples: [{ input: '3 2\n', note: 'There are C(9, 2) = 36 pairs of squares and 20 of them touch, so 16 placements remain.' }],
    hints: ['Handle the squares in reading order and decide: empty, or a king.', 'A king may be placed if no earlier king is within one row and one column.', 'Stop a branch when there are fewer squares left than kings still to place.'],
    program: {
      io: ['n:int k:int'],
      helpers: {
        python: r`
          def place(n, pos, k, placed):
              if k == 0:
                  return 1
              if pos == n * n or n * n - pos < k:
                  return 0
              row, col = divmod(pos, n)
              total = place(n, pos + 1, k, placed)
              if all(abs(row - r2) > 1 or abs(col - c2) > 1 for r2, c2 in placed):
                  placed.append((row, col))
                  total += place(n, pos + 1, k - 1, placed)
                  placed.pop()
              return total`,
        cpp: r`
          long long place(int n, int pos, int k, vector<pair<int, int>>& placed) {
              if (k == 0) return 1;
              if (pos == n * n || n * n - pos < k) return 0;
              int row = pos / n, col = pos % n;
              long long total = place(n, pos + 1, k, placed);
              bool free = true;
              for (const auto& p : placed) {
                  if (abs(row - p.first) <= 1 && abs(col - p.second) <= 1) free = false;
              }
              if (free) {
                  placed.push_back({row, col});
                  total += place(n, pos + 1, k - 1, placed);
                  placed.pop_back();
              }
              return total;
          }`,
        java: r`
          static long place(int n, int pos, int k, List<int[]> placed) {
              if (k == 0) return 1;
              if (pos == n * n || n * n - pos < k) return 0;
              int row = pos / n, col = pos % n;
              long total = place(n, pos + 1, k, placed);
              boolean free = true;
              for (int[] p : placed) {
                  if (Math.abs(row - p[0]) <= 1 && Math.abs(col - p[1]) <= 1) free = false;
              }
              if (free) {
                  placed.add(new int[] {row, col});
                  total += place(n, pos + 1, k - 1, placed);
                  placed.remove(placed.size() - 1);
              }
              return total;
          }`
      },
      includes: ['<cstdlib>'],
      python: 'print(place(n, 0, k, []))',
      cpp: r`
        vector<pair<int, int>> placed;
        cout << place((int)n, 0, (int)k, placed) << "\n";`,
      java: 'System.out.println(place((int) n, 0, (int) k, new ArrayList<>()));'
    },
    solution: { explanation: ['Squares are taken in reading order: leave empty, or place a king when no earlier king is within one row and one column. A branch ends with 1 when all `k` kings are placed and with 0 when too few squares remain.'], complexity: 'Time proportional to the number of partial placements (at most about 16 000 for n = 5), space O(k).' },
    solve(input) {
      const [n, k] = nums(rows(input)[0]); const okRow = []; for (let m = 0; m < 1 << n; m++) if ((m & (m >> 1)) === 0) okRow.push(m);
      const pop = (m) => { let c = 0; for (; m; m &= m - 1) c++; return c; };
      let f = new Map([['0,0', 1]]); // (previous row mask, kings so far)
      for (let row = 0; row < n; row++) { const next = new Map(); for (const [key, ways] of f) { const [prev, used] = key.split(',').map(Number); for (const m of okRow) { if ((m & prev) || (m & (prev << 1)) || (m & (prev >> 1))) continue; const total = used + pop(m); if (total > k) continue; const nk = `${m},${total}`; next.set(nk, (next.get(nk) || 0) + ways); } } f = next; }
      let answer = 0; for (const [key, ways] of f) if (Number(key.split(',')[1]) === k) answer += ways; return String(answer);
    },
    tests() { return ['3 2\n', '1 1\n', '2 1\n', '2 2\n', '3 4\n', '4 4\n', '4 3\n', '5 6\n', '5 5\n', '5 7\n', '5 9\n', '5 10\n', '5 1\n', '5 4\n', '5 8\n', '4 6\n', '2 4\n', '3 9\n']; }
  }
];
