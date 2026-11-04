import { r, rng, randInt, randArray, many, nums, rows, randWord, shuffle } from '../../lib.mjs';

// Runs fast(input) against a slow, independent computation on many small random inputs; throws when they differ.
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const popcount = (m) => { let c = 0; while (m) { m &= m - 1; c++; } return c; };

// Sudoku helpers for the reference and the test generator: counts the solutions of a 81-number board (0 = empty), stopping at "limit".
const sudoku = (cells, limit, wantGrid = false) => {
  const grid = cells.slice(); const rowM = Array(9).fill(0), colM = Array(9).fill(0), boxM = Array(9).fill(0);
  const boxOf = (i) => Math.floor(i / 27) * 3 + Math.floor((i % 9) / 3);
  for (let i = 0; i < 81; i++) if (grid[i]) { const bit = 1 << grid[i]; if ((rowM[Math.floor(i / 9)] | colM[i % 9] | boxM[boxOf(i)]) & bit) return wantGrid ? null : 0; rowM[Math.floor(i / 9)] |= bit; colM[i % 9] |= bit; boxM[boxOf(i)] |= bit; }
  let count = 0, first = null;
  const go = () => {
    let best = -1, bestMask = 0, bestCount = 10;
    for (let i = 0; i < 81; i++) if (!grid[i]) { const mask = ~(rowM[Math.floor(i / 9)] | colM[i % 9] | boxM[boxOf(i)]) & 0x3fe; const cnt = popcount(mask); if (cnt < bestCount) { best = i; bestMask = mask; bestCount = cnt; if (cnt <= 1) break; } }
    if (best === -1) { count++; if (!first) first = grid.slice(); return count >= limit; }
    if (bestCount === 0) return false;
    const rr = Math.floor(best / 9), cc = best % 9, bb = boxOf(best);
    for (let d = 1; d <= 9; d++) { const bit = 1 << d; if (!(bestMask & bit)) continue; grid[best] = d; rowM[rr] |= bit; colM[cc] |= bit; boxM[bb] |= bit; if (go()) return true; grid[best] = 0; rowM[rr] &= ~bit; colM[cc] &= ~bit; boxM[bb] &= ~bit; }
    return false;
  };
  go(); return wantGrid ? first : count;
};

export default [
  {
    slug: 'sudoku-solver',
    title: 'Solve the Sudoku',
    difficulty: 'hard',
    tags: ['backtracking', 'sudoku', 'bitmask', 'constraints'],
    concept: {
      title: 'Always fill the square with the fewest possibilities',
      body: [
        'A sudoku board has 81 squares. Each row, column and 3 by 3 box must contain the digits 1 to 9 once. Three arrays of **bit masks** remember which digits are used in every row, column and box (bit `d` is set when the digit `d` is used). The digits still possible in a square are the bits that are in none of its three masks.',
        'The simplest search fills the empty squares in reading order, trying the digits 1 to 9. It works for easy puzzles but can take millions of steps on hard ones, because it may guess in a square with seven possibilities while another square has only one. The big improvement is the **fewest-candidates rule**: at every step find the empty square with the **fewest possible digits** and fill that one. A square with a single candidate is forced; a square with none means the current guesses are wrong, so we backtrack at once.',
        { code: 'def search(cells, rows, cols, boxes):\n    best, best_mask, best_count = -1, 0, 10\n    for i in range(81):\n        if cells[i] == 0:\n            mask = ~(rows[i // 9] | cols[i % 9] | boxes[(i // 27) * 3 + (i % 9) // 3]) & 0x3FE\n            count = bin(mask).count("1")\n            if count < best_count:\n                best, best_mask, best_count = i, mask, count\n    if best == -1:\n        return True                        # no empty square: solved\n    for d in range(1, 10):\n        if best_mask >> d & 1:\n            ...                            # place d, update the three masks, recurse, undo\n    return False' },
        'The search is still plain backtracking (place, recurse, undo), but the choice of **which square to decide next** makes the tree thousands of times smaller. Even the puzzle often called the hardest sudoku is solved in a few thousand steps this way.'
      ]
    },
    statement: ['Solve a 9 by 9 sudoku. Each of the 9 lines of input has 9 characters: a digit from 1 to 9, or `0` for an empty square. Fill the empty squares so that every row, every column and every 3 by 3 box contains each of the digits 1 to 9 exactly once. The puzzle has exactly one solution. Print the completed board in the same format.'],
    inputFormat: ['9 lines with 9 characters each (digits 0 to 9, no spaces).'],
    outputFormat: ['9 lines with 9 digits each: the solved board.'],
    constraints: ['The puzzle has exactly one solution.'],
    examples: [{ input: '530070000\n600195000\n098000060\n800060003\n400803001\n700020006\n060000280\n000419005\n000080079\n', note: 'The classic example puzzle; its solution starts with 534678912.' }],
    hints: ['Keep three tables of used digits (for rows, columns and boxes) and update them when you place or remove a digit.', 'Do not fill the squares in reading order: at each step choose the empty square with the fewest possible digits.', 'If an empty square has no possible digit, return false at once.'],
    program: {
      io: ['board:rows[9]'],
      helpers: {
        python: r`
          def search(cells, rows, cols, boxes):
              best, best_mask, best_count = -1, 0, 10
              for i in range(81):
                  if cells[i] == 0:
                      mask = ~(rows[i // 9] | cols[i % 9] | boxes[(i // 27) * 3 + (i % 9) // 3]) & 0x3FE
                      count = bin(mask).count("1")
                      if count < best_count:
                          best, best_mask, best_count = i, mask, count
                          if count <= 1:
                              break
              if best == -1:
                  return True
              if best_count == 0:
                  return False
              r, c, b = best // 9, best % 9, (best // 27) * 3 + (best % 9) // 3
              for d in range(1, 10):
                  bit = 1 << d
                  if best_mask & bit:
                      cells[best] = d
                      rows[r] |= bit
                      cols[c] |= bit
                      boxes[b] |= bit
                      if search(cells, rows, cols, boxes):
                          return True
                      cells[best] = 0
                      rows[r] &= ~bit
                      cols[c] &= ~bit
                      boxes[b] &= ~bit
              return False`,
        cpp: r`
          bool search(vector<int>& cells, vector<int>& rows, vector<int>& cols, vector<int>& boxes) {
              int best = -1, bestMask = 0, bestCount = 10;
              for (int i = 0; i < 81; i++) {
                  if (cells[i] != 0) continue;
                  int mask = ~(rows[i / 9] | cols[i % 9] | boxes[(i / 27) * 3 + (i % 9) / 3]) & 0x3FE;
                  int count = __builtin_popcount(mask);
                  if (count < bestCount) {
                      best = i;
                      bestMask = mask;
                      bestCount = count;
                      if (count <= 1) break;
                  }
              }
              if (best == -1) return true;
              if (bestCount == 0) return false;
              int r = best / 9, c = best % 9, b = (best / 27) * 3 + (best % 9) / 3;
              for (int d = 1; d <= 9; d++) {
                  int bit = 1 << d;
                  if (!(bestMask & bit)) continue;
                  cells[best] = d;
                  rows[r] |= bit;
                  cols[c] |= bit;
                  boxes[b] |= bit;
                  if (search(cells, rows, cols, boxes)) return true;
                  cells[best] = 0;
                  rows[r] &= ~bit;
                  cols[c] &= ~bit;
                  boxes[b] &= ~bit;
              }
              return false;
          }`,
        java: r`
          static boolean search(int[] cells, int[] rows, int[] cols, int[] boxes) {
              int best = -1, bestMask = 0, bestCount = 10;
              for (int i = 0; i < 81; i++) {
                  if (cells[i] != 0) continue;
                  int mask = ~(rows[i / 9] | cols[i % 9] | boxes[(i / 27) * 3 + (i % 9) / 3]) & 0x3FE;
                  int count = Integer.bitCount(mask);
                  if (count < bestCount) {
                      best = i;
                      bestMask = mask;
                      bestCount = count;
                      if (count <= 1) break;
                  }
              }
              if (best == -1) return true;
              if (bestCount == 0) return false;
              int r = best / 9, c = best % 9, b = (best / 27) * 3 + (best % 9) / 3;
              for (int d = 1; d <= 9; d++) {
                  int bit = 1 << d;
                  if ((bestMask & bit) == 0) continue;
                  cells[best] = d;
                  rows[r] |= bit;
                  cols[c] |= bit;
                  boxes[b] |= bit;
                  if (search(cells, rows, cols, boxes)) return true;
                  cells[best] = 0;
                  rows[r] &= ~bit;
                  cols[c] &= ~bit;
                  boxes[b] &= ~bit;
              }
              return false;
          }`
      },
      python: r`
        cells = [int(ch) for row in board for ch in row]
        rows, cols, boxes = [0] * 9, [0] * 9, [0] * 9
        for i, d in enumerate(cells):
            if d:
                bit = 1 << d
                rows[i // 9] |= bit
                cols[i % 9] |= bit
                boxes[(i // 27) * 3 + (i % 9) // 3] |= bit
        search(cells, rows, cols, boxes)
        for i in range(9):
            print("".join(map(str, cells[i * 9:i * 9 + 9])))`,
      cpp: r`
        vector<int> cells(81), rows(9, 0), cols(9, 0), boxes(9, 0);
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                int d = board[i][j] - '0';
                cells[i * 9 + j] = d;
                if (d) {
                    int bit = 1 << d;
                    rows[i] |= bit;
                    cols[j] |= bit;
                    boxes[(i / 3) * 3 + j / 3] |= bit;
                }
            }
        }
        search(cells, rows, cols, boxes);
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) cout << cells[i * 9 + j];
            cout << "\n";
        }`,
      java: r`
        int[] cells = new int[81], rows = new int[9], cols = new int[9], boxes = new int[9];
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                int d = board[i].charAt(j) - '0';
                cells[i * 9 + j] = d;
                if (d != 0) {
                    int bit = 1 << d;
                    rows[i] |= bit;
                    cols[j] |= bit;
                    boxes[(i / 3) * 3 + j / 3] |= bit;
                }
            }
        }
        search(cells, rows, cols, boxes);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) sb.append(cells[i * 9 + j]);
            sb.append("\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Bit masks record the used digits of every row, column and box. Each call picks the empty square with the fewest candidate digits (stopping early at a forced square), tries those digits, and undoes the masks on failure. A square with no candidate ends the branch.'], complexity: 'Time: a few thousand steps for typical puzzles, each step scanning 81 squares; space O(81).' },
    solve(input) { const cells = rows(input).join('').split('').map(Number); const solved = sudoku(cells, 1, true); return [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => solved.slice(i * 9, i * 9 + 9).join('')).join('\n'); },
    tests() {
      const g = rng(670);
      const randomSolved = () => { const cells = Array(81).fill(0); const rowM = Array(9).fill(0), colM = Array(9).fill(0), boxM = Array(9).fill(0); const boxOf = (i) => Math.floor(i / 27) * 3 + Math.floor((i % 9) / 3); const go = (i) => { if (i === 81) return true; const order = shuffle(g, [1, 2, 3, 4, 5, 6, 7, 8, 9]); for (const d of order) { const bit = 1 << d; if ((rowM[Math.floor(i / 9)] | colM[i % 9] | boxM[boxOf(i)]) & bit) continue; cells[i] = d; rowM[Math.floor(i / 9)] |= bit; colM[i % 9] |= bit; boxM[boxOf(i)] |= bit; if (go(i + 1)) return true; cells[i] = 0; rowM[Math.floor(i / 9)] &= ~bit; colM[i % 9] &= ~bit; boxM[boxOf(i)] &= ~bit; } return false; }; go(0); return cells; };
      const puzzle = (keepAtMost) => { const cells = randomSolved(); let clues = 81; for (const i of shuffle(g, many(81, (k) => k))) { if (clues <= keepAtMost) break; const saved = cells[i]; cells[i] = 0; if (sudoku(cells, 2) === 1) clues--; else cells[i] = saved; } return cells; };
      const text = (cells) => many(9, (i) => cells.slice(i * 9, i * 9 + 9).join('')).join('\n') + '\n';
      const unique = (t) => { if (sudoku(t.replace(/\n/g, '').split('').map(Number), 2) !== 1) throw new Error('the puzzle does not have exactly one solution'); return t; };
      const solved = randomSolved(); const almost = solved.slice(); almost[40] = 0; almost[3] = 0;
      return [
        '530070000\n600195000\n098000060\n800060003\n400803001\n700020006\n060000280\n000419005\n000080079\n',
        unique('800000000\n003600000\n070090200\n050007000\n000045700\n000100030\n001000068\n008500010\n090000400\n'),
        unique(text(almost)), unique(text(puzzle(30))), unique(text(puzzle(24))), unique(text(puzzle(22))), unique(text(puzzle(20))), unique(text(puzzle(17))), unique(text(puzzle(26))), unique(text(puzzle(23))), unique(text(puzzle(28)))
      ];
    }
  },

  {
    slug: 'expression-add-operators',
    title: 'Reach the Target With Plus, Minus and Times',
    difficulty: 'hard',
    tags: ['backtracking', 'expressions', 'recursion'],
    concept: {
      title: 'Remember the last term, so that a multiplication can fix the sum',
      body: [
        'Between the digits of a string you may put `+`, `-`, `*` or nothing (digits glued into one number). Multiplication has priority, so the value of `2+3*4` is 14 and **not** 20: when the search reaches `*4`, the term `3` that was already added must be **replaced** by `3 * 4`. To do this, the recursion carries two values: `total` (the value of the expression so far) and `last` (the term that was added or subtracted last, with its sign).',
        { code: 'def search(pos, total, last):\n    if pos == n:\n        return 1 if total == target else 0\n    count = 0\n    value = 0\n    for end in range(pos, n):\n        if end > pos and d[pos] == "0":\n            break                                # no number with a leading zero\n        value = value * 10 + int(d[end])\n        if pos == 0:\n            count += search(end + 1, value, value)\n        else:\n            count += search(end + 1, total + value, value)                      # +\n            count += search(end + 1, total - value, -value)                     # -\n            count += search(end + 1, total - last + last * value, last * value)  # *\n    return count' },
        'For `*` the old term `last` is taken away from the total and the product `last * value` is added instead; the new `last` is that product, so that a chain such as `2*3*4` also works. For `+` the new term is `value`, and for `-` it is `-value`. This **bookkeeping of the last term** is the whole trick; the rest is the usual search over lengths of the next number.'
      ]
    },
    statement: ['You are given a string of digits and a target number. Between neighbouring digits you may write `+`, `-`, `*` or nothing (digits written together form one number). Numbers have no leading zeros (the number `0` itself is allowed, `05` is not). The expression has no sign in front of its first number, and `*` has priority over `+` and `-`. Count the expressions whose value equals the target.'],
    inputFormat: ['The first line has the digits.', 'The second line has the target.'],
    outputFormat: ['Print the number of expressions.'],
    constraints: ['1 <= number of digits <= 9', '-2^31 <= target <= 2^31 - 1'],
    examples: [{ input: '123\n6\n', note: 'The expressions 1+2+3 and 1*2*3 have the value 6.' }],
    hints: ['Carry the value of the expression so far and the last term, with its sign.', 'For a multiplication, subtract the last term from the total and add the last term times the new number.', 'A number with more than one digit cannot start with 0.'],
    program: {
      io: ['digits:word', 'target:int'],
      helpers: {
        python: r`
          def search(d, target, pos, total, last):
              if pos == len(d):
                  return 1 if total == target else 0
              count = 0
              value = 0
              for end in range(pos, len(d)):
                  if end > pos and d[pos] == "0":
                      break
                  value = value * 10 + int(d[end])
                  if pos == 0:
                      count += search(d, target, end + 1, value, value)
                  else:
                      count += search(d, target, end + 1, total + value, value)
                      count += search(d, target, end + 1, total - value, -value)
                      count += search(d, target, end + 1, total - last + last * value, last * value)
              return count`,
        cpp: r`
          long long search(const string& d, long long target, size_t pos, long long total, long long last) {
              if (pos == d.size()) return total == target ? 1 : 0;
              long long count = 0, value = 0;
              for (size_t end = pos; end < d.size(); end++) {
                  if (end > pos && d[pos] == '0') break;
                  value = value * 10 + (d[end] - '0');
                  if (pos == 0) {
                      count += search(d, target, end + 1, value, value);
                  } else {
                      count += search(d, target, end + 1, total + value, value);
                      count += search(d, target, end + 1, total - value, -value);
                      count += search(d, target, end + 1, total - last + last * value, last * value);
                  }
              }
              return count;
          }`,
        java: r`
          static long search(String d, long target, int pos, long total, long last) {
              if (pos == d.length()) return total == target ? 1 : 0;
              long count = 0, value = 0;
              for (int end = pos; end < d.length(); end++) {
                  if (end > pos && d.charAt(pos) == '0') break;
                  value = value * 10 + (d.charAt(end) - '0');
                  if (pos == 0) {
                      count += search(d, target, end + 1, value, value);
                  } else {
                      count += search(d, target, end + 1, total + value, value);
                      count += search(d, target, end + 1, total - value, -value);
                      count += search(d, target, end + 1, total - last + last * value, last * value);
                  }
              }
              return count;
          }`
      },
      python: 'print(search(digits, target, 0, 0, 0))',
      cpp: 'cout << search(digits, target, 0, 0, 0) << "\\n";',
      java: 'System.out.println(search(digits, target, 0, 0, 0));'
    },
    solution: { explanation: ['`total` is the value so far and `last` the last term with its sign. A plus adds the new number, a minus subtracts it, and a multiplication removes `last` from `total` and adds `last * value`, which also becomes the new `last`. Numbers with leading zeros are not generated.'], complexity: 'Time O(4^n * n) in the worst case (65 536 leaves for n = 9), space O(n).' },
    solve(input) {
      const rs = rows(input); const d = rs[0].trim(); const target = Number(rs[1]); const n = d.length; let count = 0;
      for (let mask = 0; mask < 4 ** (n - 1); mask++) {
        let m = mask; const pieces = [d[0]]; const ops = [];
        for (let i = 1; i < n; i++) { const o = m % 4; m = Math.floor(m / 4); if (o === 0) pieces[pieces.length - 1] += d[i]; else { ops.push('+-*'[o - 1]); pieces.push(d[i]); } }
        if (pieces.some((p) => p.length > 1 && p[0] === '0')) continue;
        const terms = [Number(pieces[0])]; for (let i = 0; i < ops.length; i++) { const v = Number(pieces[i + 1]); if (ops[i] === '*') terms[terms.length - 1] *= v; else terms.push(ops[i] === '+' ? v : -v); }
        if (terms.reduce((a, b) => a + b, 0) === target) count++;
      }
      return String(count);
    },
    tests() {
      const g = rng(671);
      const make = (d, t) => `${d}\n${t}\n`;
      const digits = (n, lo = 0) => many(n, () => randInt(g, lo, 9)).join('');
      return ['123\n6\n', '232\n8\n', '105\n5\n', '00\n0\n', '345623749\n9191\n','1\n1\n', '1\n2\n', '000000000\n0\n', '123456789\n45\n', '123456789\n100\n', '123456789\n2147483647\n', '123456789\n-2147483648\n', make(digits(9, 1), randInt(g, -50, 100)), make(digits(9), randInt(g, 0, 60)), make(digits(8, 1), 24), make(digits(7), 7), make('999999999', 81), make('987654321', 1000), make('111111111', 11), make('100000009', 100)];
    }
  },

  {
    slug: 'remove-invalid-parentheses',
    title: 'Fix the Brackets by Deleting as Few as Possible',
    difficulty: 'hard',
    tags: ['backtracking', 'strings', 'parentheses', 'pruning'],
    concept: {
      title: 'Count how many of each bracket must go, then search with that exact budget',
      body: [
        'A string with letters and round brackets is *valid* if the brackets are balanced. We may delete brackets (never letters) and we want to delete as **few** as possible. First one pass finds how many `(` and how many `)` have to be removed: scan the string with a balance counter; a `)` that finds the balance at 0 is surplus (`right += 1`); at the end the balance that is left over are surplus `(` (`left`).',
        'Then a search decides for each character: **remove it** (only if the budget of that bracket is not used up) or **keep it**. The kept brackets must never let the balance go below zero. At the end of the string the budgets must both be 0 and the balance must be 0.',
        { code: 'def dfs(i, left, right, balance, current):\n    if i == len(s):\n        if left == 0 and right == 0 and balance == 0:\n            result.add("".join(current))\n        return\n    ch = s[i]\n    if ch == "(" and left > 0:\n        dfs(i + 1, left - 1, right, balance, current)         # remove this (\n    if ch == ")" and right > 0:\n        dfs(i + 1, left, right - 1, balance, current)         # remove this )\n    current.append(ch)                                         # keep it\n    if ch == "(":\n        dfs(i + 1, left, right, balance + 1, current)\n    elif ch == ")":\n        if balance > 0:\n            dfs(i + 1, left, right, balance - 1, current)\n    else:\n        dfs(i + 1, left, right, balance, current)\n    current.pop()' },
        'Different removals can give the **same** string (removing the first or the second of two equal brackets), so the results are kept in a set. Because the budget is exact, the search never goes deeper into a branch that would delete more than the minimum.'
      ]
    },
    statement: ['A string contains lowercase letters and the brackets `(` and `)`. Delete the smallest possible number of brackets so that the brackets become balanced (every `(` has a matching later `)`, no `)` comes without an open `(`). Print all different strings that can result from a deletion of the smallest size, in ascending order (`(` comes before `)`, and both before letters), one per line. If the string is already balanced, print it as it is.'],
    inputFormat: ['The only line has the string.'],
    outputFormat: ['All different results in ascending order, one per line.'],
    constraints: ['1 <= length of the string <= 20', 'The string contains at least one letter, so no result is empty.'],
    examples: [{ input: '()())()a\n', note: 'One closing bracket is too many. Deleting the first ) gives (())()a; deleting the second or the third ) gives ()()()a.' }],
    hints: ['Count in one pass the number of surplus ( and ) that must be removed.', 'In the search, remove a bracket only while its budget is above zero, and keep a balance so that a kept ) always has an open (.', 'Store the results in a set, because equal brackets next to each other give the same string.'],
    program: {
      io: ['s:word'],
      includes: ['<set>'],
      helpers: {
        python: r`
          def dfs(s, opens, closes, i, left, right, balance, current, result):
              if left > opens[i] or right > closes[i]:
                  return
              if i == len(s):
                  if balance == 0:
                      result.add("".join(current))
                  return
              ch = s[i]
              if ch == "(" and left > 0:
                  dfs(s, opens, closes, i + 1, left - 1, right, balance, current, result)
              if ch == ")" and right > 0:
                  dfs(s, opens, closes, i + 1, left, right - 1, balance, current, result)
              current.append(ch)
              if ch == "(":
                  dfs(s, opens, closes, i + 1, left, right, balance + 1, current, result)
              elif ch == ")":
                  if balance > 0:
                      dfs(s, opens, closes, i + 1, left, right, balance - 1, current, result)
              else:
                  dfs(s, opens, closes, i + 1, left, right, balance, current, result)
              current.pop()`,
        cpp: r`
          void dfs(const string& s, const vector<int>& opens, const vector<int>& closes, size_t i, int left, int right, int balance, string& current, set<string>& result) {
              if (left > opens[i] || right > closes[i]) return;
              if (i == s.size()) {
                  if (balance == 0) result.insert(current);
                  return;
              }
              char ch = s[i];
              if (ch == '(' && left > 0) dfs(s, opens, closes, i + 1, left - 1, right, balance, current, result);
              if (ch == ')' && right > 0) dfs(s, opens, closes, i + 1, left, right - 1, balance, current, result);
              current.push_back(ch);
              if (ch == '(') {
                  dfs(s, opens, closes, i + 1, left, right, balance + 1, current, result);
              } else if (ch == ')') {
                  if (balance > 0) dfs(s, opens, closes, i + 1, left, right, balance - 1, current, result);
              } else {
                  dfs(s, opens, closes, i + 1, left, right, balance, current, result);
              }
              current.pop_back();
          }`,
        java: r`
          static void dfs(String s, int[] opens, int[] closes, int i, int left, int right, int balance, StringBuilder current, Set<String> result) {
              if (left > opens[i] || right > closes[i]) return;
              if (i == s.length()) {
                  if (balance == 0) result.add(current.toString());
                  return;
              }
              char ch = s.charAt(i);
              if (ch == '(' && left > 0) dfs(s, opens, closes, i + 1, left - 1, right, balance, current, result);
              if (ch == ')' && right > 0) dfs(s, opens, closes, i + 1, left, right - 1, balance, current, result);
              current.append(ch);
              if (ch == '(') {
                  dfs(s, opens, closes, i + 1, left, right, balance + 1, current, result);
              } else if (ch == ')') {
                  if (balance > 0) dfs(s, opens, closes, i + 1, left, right, balance - 1, current, result);
              } else {
                  dfs(s, opens, closes, i + 1, left, right, balance, current, result);
              }
              current.deleteCharAt(current.length() - 1);
          }`
      },
      python: r`
        left = right = 0
        for ch in s:
            if ch == "(":
                left += 1
            elif ch == ")":
                if left > 0:
                    left -= 1
                else:
                    right += 1
        opens = [0] * (len(s) + 1)
        closes = [0] * (len(s) + 1)
        for i in range(len(s) - 1, -1, -1):
            opens[i] = opens[i + 1] + (s[i] == "(")
            closes[i] = closes[i + 1] + (s[i] == ")")
        result = set()
        dfs(s, opens, closes, 0, left, right, 0, [], result)
        print("\n".join(sorted(result)))`,
      cpp: r`
        int left = 0, right = 0;
        for (char ch : s) {
            if (ch == '(') {
                left++;
            } else if (ch == ')') {
                if (left > 0) left--;
                else right++;
            }
        }
        vector<int> opens(s.size() + 1, 0), closes(s.size() + 1, 0);
        for (int i = (int)s.size() - 1; i >= 0; i--) {
            opens[i] = opens[i + 1] + (s[i] == '(');
            closes[i] = closes[i + 1] + (s[i] == ')');
        }
        set<string> result;
        string current;
        dfs(s, opens, closes, 0, left, right, 0, current, result);
        for (const string& r : result) cout << r << "\n";`,
      java: r`
        int left = 0, right = 0;
        for (char ch : s.toCharArray()) {
            if (ch == '(') {
                left++;
            } else if (ch == ')') {
                if (left > 0) left--;
                else right++;
            }
        }
        int[] opens = new int[s.length() + 1], closes = new int[s.length() + 1];
        for (int i = s.length() - 1; i >= 0; i--) {
            opens[i] = opens[i + 1] + (s.charAt(i) == '(' ? 1 : 0);
            closes[i] = closes[i + 1] + (s.charAt(i) == ')' ? 1 : 0);
        }
        Set<String> result = new TreeSet<>();
        dfs(s, opens, closes, 0, left, right, 0, new StringBuilder(), result);
        StringBuilder sb = new StringBuilder();
        for (String r : result) sb.append(r).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['One scan counts the surplus brackets of each kind. The search keeps or removes every character, never removing more than the budget and never letting a kept `)` appear without an open `(`; complete balanced strings with the budgets used up are collected in a set.'], complexity: 'Time exponential in the number of brackets, small for 20 characters; space O(n).' },
    solve(input) {
      const s = rows(input)[0].trim(); const valid = (t) => { let b = 0; for (const ch of t) { if (ch === '(') b++; else if (ch === ')') { b--; if (b < 0) return false; } } return b === 0; };
      let level = new Set([s]);
      for (;;) { const good = [...level].filter(valid); if (good.length) return good.sort().join('\n'); const next = new Set(); for (const t of level) for (let i = 0; i < t.length; i++) if (t[i] === '(' || t[i] === ')') next.add(t.slice(0, i) + t.slice(i + 1)); level = next; }
    },
    tests() {
      const g = rng(672);
      const make = (n, alphabet) => `${many(n, () => alphabet[randInt(g, 0, alphabet.length - 1)]).join('')}\n`;
      const withLetter = (t) => (/[a-z]/.test(t) ? t : t.replace(/\n$/, 'a\n'));
      return ['()())()a\n', '(a)())()\n', ')(a\n', 'a\n', '(a\n', 'a)\n', '(a)\n', 'n\n', ')a(\n', '((a))\n', '(((((a)))))\n', 'a((((((((((((((((((a\n', 'a))))))))))))))))))a\n', withLetter(make(14, '()()a')), withLetter(make(16, '(()a')), withLetter(make(18, '(())ab')), withLetter(make(20, '()(a')), withLetter(make(12, '))(a')), withLetter(make(20, '()ab(')), '(()(()(()(()(()a\n'];
    }
  },

  {
    slug: 'word-search-ii',
    title: 'Which Words Hide in the Grid?',
    difficulty: 'hard',
    tags: ['backtracking', 'trie', 'grid', 'dfs'],
    concept: {
      title: 'Search for all words at once with a trie',
      body: [
        'Searching a grid for **one** word is a simple backtracking. For many words, repeating that search for every word wastes time, because words share beginnings. A **trie** (prefix tree) stores all the words together: each node stands for a prefix, each step to a child adds one letter, and a node can be marked "a word ends here".',
        'Now one search from each cell walks the grid and the trie **at the same time**: from a cell with letter `ch`, go to the child `ch` of the current trie node. If there is **no such child**, no word starts with this prefix and the path is cut at once. If the node ends a word, record that word, and continue (longer words may share the path).',
        { code: 'def explore(row, col, node):\n    ch = grid[row][col]\n    if ch not in node:\n        return                            # no word has this prefix: cut\n    nxt = node[ch]\n    if "$" in nxt:\n        found.add(nxt["$"])               # a word ends here\n    grid[row][col] = "#"                  # mark the cell as used\n    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n        nr, nc = row + dr, col + dc\n        if 0 <= nr < r and 0 <= nc < c and grid[nr][nc] != "#":\n            explore(nr, nc, nxt)\n    grid[row][col] = ch                   # free the cell again' },
        'The prefix cut makes this fast: the search follows only roads that can still become one of the words. A cell is marked with `#` while it is on the current road (letters never equal `#`), which is the same as a table of visited cells.'
      ]
    },
    statement: ['A grid of lowercase letters and a list of words are given. A word is *in the grid* if its letters can be read by walking from cell to neighbouring cell (above, below, left or right) without using any cell twice. Print all words of the list that are in the grid, in alphabetical order, one per line. If none is in the grid, print `-1`.'],
    inputFormat: ['The first line has `r` and `c`.', 'Each of the next `r` lines has `c` letters.', 'The next line has `k`, the number of words.', 'The last line has the `k` words.'],
    outputFormat: ['The words found, in alphabetical order, one per line, or `-1`.'],
    constraints: ['1 <= r, c <= 6', '1 <= k <= 20; the words are different and have 1 to 7 letters'],
    examples: [{ input: '3 3\noaa\netn\nihk\n4\noath pea eat rain\n', note: 'The words oath and eat are in the grid.' }],
    hints: ['Build a trie of all the words.', 'Walk the grid and the trie together; stop when the trie has no child for the next letter.', 'Mark the cells of the current road, and record a word when the trie node ends one.'],
    program: {
      io: ['r:int c:int', 'grid:rows[r]', 'k:int', 'words:word[k]'],
      includes: ['<set>'],
      helpers: {
        python: r`
          def build(words):
              root = {}
              for w in words:
                  node = root
                  for ch in w:
                      node = node.setdefault(ch, {})
                  node["$"] = w
              return root

          def explore(grid, r, c, row, col, node, found):
              ch = grid[row][col]
              if ch not in node:
                  return
              nxt = node[ch]
              if "$" in nxt:
                  found.add(nxt["$"])
              grid[row][col] = "#"
              for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                  nr, nc = row + dr, col + dc
                  if 0 <= nr < r and 0 <= nc < c and grid[nr][nc] != "#":
                      explore(grid, r, c, nr, nc, nxt, found)
              grid[row][col] = ch`,
        cpp: r`
          struct Node {
              int next[26];
              string word;
              Node() { for (int i = 0; i < 26; i++) next[i] = -1; }
          };

          void explore(vector<string>& grid, int r, int c, int row, int col, int node, const vector<Node>& trie, set<string>& found) {
              char ch = grid[row][col];
              int nxt = trie[node].next[ch - 'a'];
              if (nxt < 0) return;
              if (!trie[nxt].word.empty()) found.insert(trie[nxt].word);
              grid[row][col] = '#';
              int dr[4] = {1, -1, 0, 0};
              int dc[4] = {0, 0, 1, -1};
              for (int d = 0; d < 4; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] != '#') explore(grid, r, c, nr, nc, nxt, trie, found);
              }
              grid[row][col] = ch;
          }`,
        java: r`
          static class TrieNode {
              TrieNode[] next = new TrieNode[26];
              String word;
          }

          static void explore(char[][] grid, int r, int c, int row, int col, TrieNode node, Set<String> found) {
              char ch = grid[row][col];
              TrieNode nxt = node.next[ch - 'a'];
              if (nxt == null) return;
              if (nxt.word != null) found.add(nxt.word);
              grid[row][col] = '#';
              int[] dr = {1, -1, 0, 0};
              int[] dc = {0, 0, 1, -1};
              for (int d = 0; d < 4; d++) {
                  int nr = row + dr[d], nc = col + dc[d];
                  if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] != '#') explore(grid, r, c, nr, nc, nxt, found);
              }
              grid[row][col] = ch;
          }`
      },
      python: r`
        root = build(words)
        g = [list(row) for row in grid]
        found = set()
        for i in range(r):
            for j in range(c):
                explore(g, r, c, i, j, root, found)
        print("\n".join(sorted(found)) if found else -1)`,
      cpp: r`
        vector<Node> trie(1);
        for (const string& w : words) {
            int node = 0;
            for (char ch : w) {
                if (trie[node].next[ch - 'a'] < 0) {
                    trie[node].next[ch - 'a'] = (int)trie.size();
                    trie.push_back(Node());
                }
                node = trie[node].next[ch - 'a'];
            }
            trie[node].word = w;
        }
        set<string> found;
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) explore(grid, (int)r, (int)c, i, j, 0, trie, found);
        }
        if (found.empty()) cout << -1 << "\n";
        for (const string& w : found) cout << w << "\n";`,
      java: r`
        TrieNode root = new TrieNode();
        for (String w : words) {
            TrieNode node = root;
            for (char ch : w.toCharArray()) {
                if (node.next[ch - 'a'] == null) node.next[ch - 'a'] = new TrieNode();
                node = node.next[ch - 'a'];
            }
            node.word = w;
        }
        char[][] g = new char[(int) r][];
        for (int i = 0; i < r; i++) g[i] = grid[i].toCharArray();
        Set<String> found = new TreeSet<>();
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) explore(g, (int) r, (int) c, i, j, root, found);
        }
        if (found.isEmpty()) System.out.println(-1);
        StringBuilder sb = new StringBuilder();
        for (String w : found) sb.append(w).append("\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['A trie holds all the words. Starting from every cell, the search follows the grid and the trie together, stops when the trie has no child for the next letter, records the word of every node that ends one, and marks and unmarks the cells of the current road.'], complexity: 'Time O(cells * 4 * 3^(L-1)) in the worst case, far less in practice; space O(total length of the words).' },
    solve(input) {
      const rs = rows(input); const [r, c] = nums(rs[0]); const grid = rs.slice(1, 1 + r); const words = rs[2 + r].trim().split(/\s+/);
      const has = (word) => { const seen = grid.map((row) => [...row].map(() => false)); const go = (i, j, k) => { if (grid[i][j] !== word[k]) return false; if (k === word.length - 1) return true; seen[i][j] = true; let ok = false; for (const [di, dj] of DIRS) { const a = i + di, b = j + dj; if (a >= 0 && a < r && b >= 0 && b < c && !seen[a][b] && go(a, b, k + 1)) { ok = true; break; } } seen[i][j] = false; return ok; }; for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) if (go(i, j, 0)) return true; return false; };
      const found = words.filter(has).sort(); return found.length ? found.join('\n') : '-1';
    },
    tests() {
      const g = rng(673);
      const make = (grid, words) => `${grid.length} ${grid[0].length}\n${grid.join('\n')}\n${words.length}\n${words.join(' ')}\n`;
      const randGrid = (r, c, pool) => many(r, () => randWord(g, c, pool));
      const distinct = (k, len, pool) => { const set = new Set(); while (set.size < k) set.add(randWord(g, randInt(g, 1, len), pool)); return [...set]; };
      const walk = (grid, len) => { const r = grid.length, c = grid[0].length; for (let attempt = 0; attempt < 40; attempt++) { let i = randInt(g, 0, r - 1), j = randInt(g, 0, c - 1); const seen = new Set([`${i},${j}`]); let w = grid[i][j]; while (w.length < len) { const opts = DIRS.map(([di, dj]) => [i + di, j + dj]).filter(([a, b]) => a >= 0 && a < r && b >= 0 && b < c && !seen.has(`${a},${b}`)); if (!opts.length) break; [i, j] = opts[randInt(g, 0, opts.length - 1)]; seen.add(`${i},${j}`); w += grid[i][j]; } if (w.length === len) return w; } return null; };
      const mixed = (grid, hits, noise, len) => { const set = new Set(); for (let t = 0; t < 200 && set.size < hits; t++) { const w = walk(grid, randInt(g, 2, len)); if (w) set.add(w); } for (const w of distinct(noise, len, 'abcdefg')) set.add(w); return [...set].slice(0, 20); };
      const g1 = randGrid(6, 6, 'abc'), g2 = randGrid(6, 6, 'abcd'), g3 = randGrid(5, 6, 'abcdef'), g4 = randGrid(4, 4, 'ab');
      return ['3 3\noaa\netn\nihk\n4\noath pea eat rain\n', make(['a'], ['a']), make(['a'], ['b']), make(['ab', 'cd'], ['abdc', 'abcd', 'a', 'dcba']), make(many(6, () => 'aaaaaa'), ['a', 'aa', 'aaa', 'aaaa', 'aaaaa', 'aaaaaa', 'aaaaaaa', 'aaaaaab']), make(g1, mixed(g1, 10, 10, 7)), make(g2, mixed(g2, 12, 8, 7)), make(g3, mixed(g3, 8, 12, 6)), make(g4, mixed(g4, 15, 5, 7)), make(randGrid(6, 6, 'ab'), distinct(20, 7, 'ab')), make(randGrid(6, 6, 'abcdefghij'), distinct(20, 5, 'abcdefghij')), make(['abcdef', 'bcdefa', 'cdefab', 'defabc', 'efabcd', 'fabcde'], ['abcdef', 'afedcb', 'adgjm', 'abcfed', 'bcde', 'aaaa'])];
    }
  },

  {
    slug: 'word-squares-count',
    title: 'Squares Where Rows Equal Columns',
    difficulty: 'hard',
    tags: ['backtracking', 'strings', 'prefix'],
    concept: {
      title: 'The letters already placed decide the beginning of the next word',
      body: [
        'A *word square* with `l` words of `l` letters has this property: for every `k`, the `k`-th word read **across** (row `k`) is the same as the `k`-th word read **down** (column `k`). For example `ball`, `area`, `lead`, `lady` form a square: the first column reads `b-a-l-l`, the first row `ball`; the second column reads `a-r-e-a`. The squares are built one row at a time.',
        'Suppose the first `k` words are fixed. The next word is row `k + 1`, and its first `k` letters are forced: they must equal column `k + 1` of the rows already chosen, that is the letters number `k + 1` of the first `k` words. So the next word must **start with a given prefix**. If the words are indexed by all their prefixes (a dictionary from prefix to the list of words with that prefix), the candidates for the next row are found at once.',
        { code: 'def count(square):\n    k = len(square)\n    if k == l:\n        return 1\n    prefix = "".join(square[i][k] for i in range(k))     # forced by the columns\n    total = 0\n    for w in by_prefix.get(prefix, []):\n        square.append(w)\n        total += count(square)\n        square.pop()\n    return total' },
        'For the first word the prefix is empty and every word is a candidate. Most prefixes have **no** word, so most branches die immediately. The same word may be used in several rows. Squares that differ in the order of the words are different squares.'
      ]
    },
    statement: ['You are given `n` different words, all with the same length `l`. A *word square* is a sequence of `l` words (a word may be used more than once) such that for every `k`, the `k`-th word is equal to the word formed by the `k`-th letters of all `l` words from top to bottom. Count the word squares.'],
    inputFormat: ['The first line has `n` and `l`.', 'The second line has the `n` words.'],
    outputFormat: ['Print the number of word squares.'],
    constraints: ['1 <= n <= 30', '1 <= l <= 4', 'The words are different and consist of lowercase letters.'],
    examples: [{ input: '5 4\nball area lead lady wall\n', note: 'There are two squares: ball, area, lead, lady and wall, area, lead, lady.' }],
    hints: ['Build the square one word at a time; the first k words decide the first k letters of the next word.', 'Keep a dictionary from every prefix to the words that start with it.', 'A word can be used again, and the order of the rows matters.'],
    program: {
      io: ['n:int l:int', 'words:word[n]'],
      includes: ['<unordered_map>'],
      helpers: {
        python: r`
          def count(l, by_prefix, square):
              k = len(square)
              if k == l:
                  return 1
              prefix = "".join(square[i][k] for i in range(k))
              total = 0
              for w in by_prefix.get(prefix, []):
                  square.append(w)
                  total += count(l, by_prefix, square)
                  square.pop()
              return total`,
        cpp: r`
          long long countSquares(int l, const unordered_map<string, vector<string>>& byPrefix, vector<string>& square) {
              int k = (int)square.size();
              if (k == l) return 1;
              string prefix;
              for (int i = 0; i < k; i++) prefix += square[i][k];
              auto found = byPrefix.find(prefix);
              if (found == byPrefix.end()) return 0;
              long long total = 0;
              for (const string& w : found->second) {
                  square.push_back(w);
                  total += countSquares(l, byPrefix, square);
                  square.pop_back();
              }
              return total;
          }`,
        java: r`
          static long countSquares(int l, Map<String, List<String>> byPrefix, List<String> square) {
              int k = square.size();
              if (k == l) return 1;
              StringBuilder prefix = new StringBuilder();
              for (int i = 0; i < k; i++) prefix.append(square.get(i).charAt(k));
              List<String> candidates = byPrefix.get(prefix.toString());
              if (candidates == null) return 0;
              long total = 0;
              for (String w : candidates) {
                  square.add(w);
                  total += countSquares(l, byPrefix, square);
                  square.remove(square.size() - 1);
              }
              return total;
          }`
      },
      python: r`
        by_prefix = {}
        for w in words:
            for i in range(len(w) + 1):
                by_prefix.setdefault(w[:i], []).append(w)
        print(count(l, by_prefix, []))`,
      cpp: r`
        unordered_map<string, vector<string>> byPrefix;
        for (const string& w : words) {
            for (size_t i = 0; i <= w.size(); i++) byPrefix[w.substr(0, i)].push_back(w);
        }
        vector<string> square;
        cout << countSquares((int)l, byPrefix, square) << "\n";`,
      java: r`
        Map<String, List<String>> byPrefix = new HashMap<>();
        for (String w : words) {
            for (int i = 0; i <= w.length(); i++) byPrefix.computeIfAbsent(w.substring(0, i), key -> new ArrayList<>()).add(w);
        }
        System.out.println(countSquares((int) l, byPrefix, new ArrayList<>()));`
    },
    solution: { explanation: ['The words are indexed by all their prefixes. After `k` rows are chosen, the next row must begin with the `k`-th... the letters `square[i][k]` of the earlier rows; only words with that prefix are tried, and a complete square of `l` rows counts one.'], complexity: 'Time proportional to the number of partial squares, usually small; space O(n * l).' },
    solve(input) {
      const rs = rows(input); const [n, l] = nums(rs[0]); const words = rs[1].trim().split(/\s+/); let count = 0; const total = words.length ** l;
      for (let code = 0; code < total; code++) { const pick = []; let x = code; for (let i = 0; i < l; i++) { pick.push(words[x % words.length]); x = Math.floor(x / words.length); } let ok = true; for (let i = 0; i < l && ok; i++) for (let j = 0; j < l; j++) if (pick[i][j] !== pick[j][i]) { ok = false; break; } if (ok) count++; }
      return String(count);
    },
    tests() {
      const g = rng(674);
      const make = (l, words) => `${words.length} ${l}\n${words.join(' ')}\n`;
      const distinct = (k, l, pool) => { const set = new Set(); const want = Math.min(k, pool.length ** l); while (set.size < want) set.add(randWord(g, l, pool)); return [...set]; };
      return ['5 4\nball area lead lady wall\n', make(4, ['ball', 'area', 'lead', 'lady']), make(1, ['a', 'b']), make(1, ['z']), make(2, ['ab', 'ba', 'aa', 'bb']), make(2, ['ab', 'cd']), make(3, ['abc', 'bca', 'cab', 'aaa', 'bbb', 'ccc']), make(3, distinct(30, 3, 'ab').slice(0, 8)), make(3, distinct(8, 3, 'abc')), make(4, distinct(20, 4, 'ab').slice(0, 16)), make(4, distinct(30, 4, 'abc')), make(4, distinct(30, 4, 'abcd')), make(3, distinct(27, 3, 'abc')), make(2, distinct(9, 2, 'abc')), make(4, ['aaaa', 'aaab', 'aaba', 'abaa', 'baaa', 'aabb', 'abab', 'abba', 'baab', 'baba', 'bbaa', 'abbb', 'babb', 'bbab', 'bbba', 'bbbb'])];
    }
  },

  {
    slug: 'largest-valid-sequence',
    title: 'The Largest Sequence With Spaced Pairs',
    difficulty: 'hard',
    tags: ['backtracking', 'greedy', 'constraints'],
    concept: {
      title: 'Place the largest number first, and let the order of trying give the answer',
      body: [
        'Build a sequence of length `2n - 1` that contains the number `1` once and every number `i` from 2 to `n` twice, so that the two copies of `i` are exactly `i` positions apart (there are `i - 1` other numbers between them). Among all valid sequences we want the one that is **largest in dictionary order**: the first number as large as possible, then the second, and so on.',
        'Fill the positions from left to right. At the first empty position try the numbers from the **largest to the smallest**: a number `i > 1` can go there only if the position `i` further on is empty too (both copies are placed at once), and the number 1 needs just this one position. Because the largest choice is tried first, the first complete sequence found is the largest one.',
        { code: 'def build(pos):\n    while pos < size and seq[pos] != 0:\n        pos += 1                          # skip the filled positions\n    if pos == size:\n        return True\n    for v in range(n, 0, -1):\n        if used[v]:\n            continue\n        if v == 1:\n            seq[pos] = 1\n        elif pos + v < size and seq[pos + v] == 0:\n            seq[pos] = seq[pos + v] = v\n        else:\n            continue\n        used[v] = True\n        if build(pos + 1):\n            return True\n        used[v] = False\n        seq[pos] = 0\n        if v > 1:\n            seq[pos + v] = 0\n    return False' },
        'A valid sequence exists for every `n`, and the search finds the first one after a modest number of wrong tries. "Try the best choice first and stop at the first success" is the general way to get an extremal answer from backtracking, whenever the order of trying is the order of the answers.'
      ]
    },
    statement: ['Given `n`, build a sequence of `2n - 1` integers in which the number 1 appears once and each of the numbers 2, 3, ..., `n` appears exactly twice, and the distance between the two copies of a number `i` (the difference of their positions) is exactly `i`. Print the sequence that is the largest in dictionary order (compare the first numbers, then the second numbers, and so on).'],
    inputFormat: ['The only line has `n`.'],
    outputFormat: ['The `2n - 1` numbers separated by spaces.'],
    constraints: ['1 <= n <= 20'],
    examples: [{ input: '3\n', note: 'The sequence 3 1 2 3 2 is valid: the 3s are 3 apart and the 2s are 2 apart. It is the largest one.' }],
    hints: ['Fill the first empty position; try the numbers from n down to 1.', 'A number i greater than 1 needs the position i further on to be empty; place both copies at once.', 'Return true as soon as the whole sequence is filled; undo the placement when a deeper call fails.'],
    program: {
      io: ['n:int'],
      helpers: {
        python: r`
          def build(n, seq, used, pos):
              size = len(seq)
              while pos < size and seq[pos] != 0:
                  pos += 1
              if pos == size:
                  return True
              for v in range(n, 0, -1):
                  if used[v]:
                      continue
                  if v == 1:
                      seq[pos] = 1
                  elif pos + v < size and seq[pos + v] == 0:
                      seq[pos] = seq[pos + v] = v
                  else:
                      continue
                  used[v] = True
                  if build(n, seq, used, pos + 1):
                      return True
                  used[v] = False
                  seq[pos] = 0
                  if v > 1:
                      seq[pos + v] = 0
              return False`,
        cpp: r`
          bool build(int n, vector<int>& seq, vector<char>& used, int pos) {
              int size = (int)seq.size();
              while (pos < size && seq[pos] != 0) pos++;
              if (pos == size) return true;
              for (int v = n; v >= 1; v--) {
                  if (used[v]) continue;
                  if (v == 1) {
                      seq[pos] = 1;
                  } else if (pos + v < size && seq[pos + v] == 0) {
                      seq[pos] = seq[pos + v] = v;
                  } else {
                      continue;
                  }
                  used[v] = 1;
                  if (build(n, seq, used, pos + 1)) return true;
                  used[v] = 0;
                  seq[pos] = 0;
                  if (v > 1) seq[pos + v] = 0;
              }
              return false;
          }`,
        java: r`
          static boolean build(int n, int[] seq, boolean[] used, int pos) {
              int size = seq.length;
              while (pos < size && seq[pos] != 0) pos++;
              if (pos == size) return true;
              for (int v = n; v >= 1; v--) {
                  if (used[v]) continue;
                  if (v == 1) {
                      seq[pos] = 1;
                  } else if (pos + v < size && seq[pos + v] == 0) {
                      seq[pos] = seq[pos + v] = v;
                  } else {
                      continue;
                  }
                  used[v] = true;
                  if (build(n, seq, used, pos + 1)) return true;
                  used[v] = false;
                  seq[pos] = 0;
                  if (v > 1) seq[pos + v] = 0;
              }
              return false;
          }`
      },
      python: r`
        seq = [0] * (2 * n - 1)
        build(n, seq, [False] * (n + 1), 0)
        print(" ".join(map(str, seq)))`,
      cpp: r`
        vector<int> seq(2 * n - 1, 0);
        vector<char> used(n + 1, 0);
        build((int)n, seq, used, 0);
        for (size_t i = 0; i < seq.size(); i++) cout << (i ? " " : "") << seq[i];
        cout << "\n";`,
      java: r`
        int[] seq = new int[2 * (int) n - 1];
        build((int) n, seq, new boolean[(int) n + 1], 0);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < seq.length; i++) sb.append(i > 0 ? " " : "").append(seq[i]);
        System.out.println(sb);`
    },
    solution: { explanation: ['The first empty position is filled with the largest number that fits: a number `v > 1` needs the position `v` further on to be free, and then both copies are written. The first complete sequence found is the largest, because larger choices are tried first; failed placements are undone.'], complexity: 'Time: small for n <= 20 (the first success is found quickly), space O(n).' },
    solve(input) {
      const n = Number(rows(input)[0]); const size = 2 * n - 1; const seq = Array(size).fill(0); const used = Array(n + 1).fill(false);
      const go = (pos) => { while (pos < size && seq[pos]) pos++; if (pos === size) return true; for (let v = n; v >= 1; v--) { if (used[v]) continue; if (v === 1) seq[pos] = 1; else if (pos + v < size && !seq[pos + v]) seq[pos] = seq[pos + v] = v; else continue; used[v] = true; if (go(pos + 1)) return true; used[v] = false; seq[pos] = 0; if (v > 1) seq[pos + v] = 0; } return false; };
      go(0); return seq.join(' ');
    },
    tests() {
      const valid = (n, s) => { if (s.length !== 2 * n - 1) return false; for (let v = 1; v <= n; v++) { const at = s.map((x, i) => (x === v ? i : -1)).filter((i) => i >= 0); if (v === 1 ? at.length !== 1 : at.length !== 2 || at[1] - at[0] !== v) return false; } return true; };
      const largest = (n) => { let best = null; const size = 2 * n - 1; const seq = Array(size).fill(0); const used = Array(n + 1).fill(false); const go = (pos) => { while (pos < size && seq[pos]) pos++; if (pos === size) { if (best === null || seq.join(',') > best.join(',')) best = seq.slice(); return; } for (let v = 1; v <= n; v++) { if (used[v]) continue; if (v === 1) seq[pos] = 1; else if (pos + v < size && !seq[pos + v]) seq[pos] = seq[pos + v] = v; else continue; used[v] = true; go(pos + 1); used[v] = false; seq[pos] = 0; if (v > 1) seq[pos + v] = 0; } }; go(0); return best; };
      for (let n = 1; n <= 20; n++) if (!valid(n, this.solve(`${n}\n`).split(' ').map(Number))) throw new Error('invalid sequence for ' + n);
      for (let n = 1; n <= 7; n++) if (this.solve(`${n}\n`) !== largest(n).join(' ')) throw new Error('not the largest sequence for ' + n);
      return many(20, (i) => `${i + 1}\n`);
    }
  }
];
