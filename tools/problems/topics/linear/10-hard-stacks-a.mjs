import { r, rng, randInt, randArray, many, arr, nums, rows } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };

// ---- A grid of 0 and 1 is given as n lines of m characters ----
const gridInput = (g, n, m, p) => `${n} ${m}\n${many(n, () => many(m, () => (g() < p ? '1' : '0')).join('')).join('\n')}\n`;
const parseBits = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); return { n, m, g: rs.slice(1, 1 + n) }; };
const heightsOf = (g, m) => { const h = new Array(m).fill(0); return (row) => { for (let j = 0; j < m; j++) h[j] = row[j] === '1' ? h[j] + 1 : 0; return h; }; };

function bestHistogram(h) { let best = 0; const st = []; for (let i = 0; i <= h.length; i++) { const cur = i < h.length ? h[i] : 0; while (st.length && h[st[st.length - 1]] >= cur) { const height = h[st.pop()]; const left = st.length ? st[st.length - 1] : -1; best = Math.max(best, height * (i - left - 1)); } st.push(i); } return best; }
function bruteRectangle(g, n, m) { let best = 0; for (let a = 0; a < n; a++) for (let b = a; b < n; b++) for (let c = 0; c < m; c++) for (let d = c; d < m; d++) { let ok = true; for (let i = a; i <= b && ok; i++) for (let j = c; j <= d; j++) if (g[i][j] !== '1') { ok = false; break; } if (ok) best = Math.max(best, (b - a + 1) * (d - c + 1)); } return best; }
function bruteCount(g, n, m) { let total = 0; for (let a = 0; a < n; a++) for (let b = a; b < n; b++) for (let c = 0; c < m; c++) for (let d = c; d < m; d++) { let ok = true; for (let i = a; i <= b && ok; i++) for (let j = c; j <= d; j++) if (g[i][j] !== '1') { ok = false; break; } if (ok) total++; } return total; }

// ---- Arithmetic expressions: random valid expression with its value (integer division truncates towards zero) ----
const trunc = (a, b) => { const q = Math.floor(Math.abs(a) / Math.abs(b)); return (a < 0) === (b < 0) ? q : -q; };
function genExpr(g, depth, terms, allOps) {
  // returns { s, v, p }: a valid expression with "terms" numbers and nesting up to "depth", its value, and the precedence of its outermost
  // operator (1: + or -, 2: * or /, 3: a number or a parenthesis). The divisor is never zero. An operand is parenthesised when the
  // text would otherwise be read in a different way, so "v" is the real value of "s".
  if (terms === 1) {
    if (depth > 0 && g() < 0.3) { const inner = genExpr(g, depth - 1, 1 + Math.floor(g() * 3), allOps); return { s: `(${inner.s})`, v: inner.v, p: 3 }; }
    const v = randInt(g, 0, 99); return { s: String(v), v, p: 3 };
  }
  const left = Math.max(1, Math.floor(g() * terms)); const a = genExpr(g, depth, left, allOps); const b = genExpr(g, depth, terms - left, allOps);
  const ops = allOps ? ['+', '-', '*', '/'] : ['+', '-'];
  let op = ops[Math.floor(g() * ops.length)];
  if (op === '/' && b.v === 0) op = '+';
  const calc = (o) => (o === '+' ? a.v + b.v : o === '-' ? a.v - b.v : o === '*' ? a.v * b.v : trunc(a.v, b.v));
  let v = calc(op);
  if (Math.abs(v) > 1e12) { op = '+'; v = calc(op); }
  const prec = op === '+' || op === '-' ? 1 : 2;
  const sp = () => (g() < 0.2 ? ' ' : '');
  const as = a.p < prec ? `(${a.s})` : a.s;
  const bs = b.p <= prec ? `(${b.s})` : b.s;
  return { s: `${as}${sp()}${op}${sp()}${bs}`, v, p: prec };
}

export default [
  {
    slug: 'largest-rectangle-in-histogram',
    title: 'Largest Rectangle in a Histogram',
    difficulty: 'hard',
    tags: ['stack', 'monotonic-stack', 'arrays'],
    concept: {
      title: 'For every bar: how far can it stretch to the left and to the right?',
      body: [
        'A histogram has bars of width 1. The largest rectangle inside it has a **bar as its lowest bar** (otherwise it could be made taller). So for every bar `h[i]` we want the widest range around `i` in which all bars are at least `h[i]` high: the rectangle has the area `h[i] * width`. The range ends at the nearest **smaller** bar on each side.',
        'Both nearest smaller bars come from one pass with a **stack of indexes whose heights are increasing**. When a new bar `h[i]` is lower than or equal to the bar on top, the top bar cannot stretch further to the right: its right end is `i`. After popping it, the bar below it on the stack is the nearest smaller bar on its left. So at the moment of a pop we know both ends.',
        { code: 'best = 0; stack = []\nfor i in range(n + 1):\n    cur = h[i] if i < n else 0          # a bar of height 0 at the end empties the stack\n    while stack and h[stack[-1]] >= cur:\n        height = h[stack.pop()]\n        left = stack[-1] if stack else -1\n        best = max(best, height * (i - left - 1))\n    stack.append(i)' },
        'The width is `i - left - 1`: the bars strictly between the two nearest smaller bars. Every index is pushed and popped once, so the time is O(n). The area can be large (`20000 * 10^9`), so use 64-bit integers in C++ and Java.'
      ]
    },
    statement: ['A histogram has `n` bars, each of width 1, and the heights are given from left to right. Print the area of the largest rectangle that fits inside the histogram (the rectangle covers consecutive bars).'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` heights.'],
    outputFormat: ['Print the largest area.'],
    constraints: ['1 <= n <= 20000', '0 <= each height <= 10^9'],
    examples: [{ input: '6\n2 1 5 6 2 3\n', note: 'The bars 5 and 6 (height 5, width 2) give the area 10.' }],
    hints: ['In the best rectangle, the lowest bar touches the top edge. Try every bar as the lowest one.', 'For a bar you need the nearest smaller bar on the left and on the right.', 'Keep a stack of bars with increasing heights; when a lower bar arrives, pop and measure.'],
    program: {
      includes: ['<algorithm>'],
      io: ['n:int', 'h:int[n]'],
      fast: true,
      python: r`
        best = 0
        stack = []
        for i in range(n + 1):
            cur = h[i] if i < n else 0
            while stack and h[stack[-1]] >= cur:
                height = h[stack.pop()]
                left = stack[-1] if stack else -1
                best = max(best, height * (i - left - 1))
            stack.append(i)
        print(best)`,
      cpp: r`
        long long best = 0;
        vector<int> stack;
        for (int i = 0; i <= n; i++) {
            long long cur = i < n ? h[i] : 0;
            while (!stack.empty() && h[stack.back()] >= cur) {
                long long height = h[stack.back()];
                stack.pop_back();
                int left = stack.empty() ? -1 : stack.back();
                best = max(best, height * (i - left - 1));
            }
            stack.push_back(i);
        }
        cout << best << "\n";`,
      java: r`
        long best = 0;
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i <= n; i++) {
            long cur = i < n ? h[i] : 0;
            while (!stack.isEmpty() && h[stack.peek()] >= cur) {
                long height = h[stack.pop()];
                int left = stack.isEmpty() ? -1 : stack.peek();
                best = Math.max(best, height * (i - left - 1));
            }
            stack.push(i);
        }
        System.out.println(best);`
    },
    solution: { explanation: ['A stack keeps the indexes of bars with increasing heights. A lower bar pops the higher bars; at each pop the nearest smaller bars on both sides are known, so the widest rectangle of the popped bar is measured.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { return String(bestHistogram(nums(rows(input)[1]))); },
    tests() {
      const g = rng(611);
      const brute = (i) => { const h = nums(rows(i)[1]); let best = 0; for (let a = 0; a < h.length; a++) { let low = Infinity; for (let b = a; b < h.length; b++) { low = Math.min(low, h[b]); best = Math.max(best, low * (b - a + 1)); } } return best; };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 12), 0, 6)), (i) => this.solve(i), brute);
      return ['6\n2 1 5 6 2 3\n', '1\n0\n', '1\n7\n', '2\n2 4\n', '5\n0 0 0 0 0\n', arr(randArray(g, 20, 0, 9)), arr(randArray(g, 2000, 0, 1000)), arr(randArray(g, 20000, 0, 1000000000)), arr(many(20000, () => 1000000000)), arr(many(20000, (i) => i + 1)), arr(many(20000, (i) => 20000 - i)), arr(many(20000, (i) => (i % 2 ? 1000000000 : 1))), arr(randArray(g, 20000, 0, 3))];
    }
  },

  {
    slug: 'maximal-rectangle',
    title: 'The Largest Rectangle of Ones',
    difficulty: 'hard',
    tags: ['stack', 'monotonic-stack', 'matrix', 'histogram'],
    concept: {
      title: 'Every row is the bottom of a histogram',
      body: [
        'Look at the grid row by row. For each row, let `heights[j]` be the number of consecutive `1` cells that end in this row in column `j` (0 if the cell is `0`). Then the rectangles of ones whose **bottom edge is in this row** are exactly the rectangles inside the histogram with the bars `heights`. You already know how to find the largest rectangle in a histogram with a stack.',
        'Update the heights when you move to the next row (`heights[j] += 1` for a `1`, `heights[j] = 0` for a `0`), and run the histogram algorithm on them. The answer is the best result over all rows.',
        { code: 'heights = [0] * m; best = 0\nfor row in grid:\n    for j in range(m):\n        heights[j] = heights[j] + 1 if row[j] == "1" else 0\n    best = max(best, largest_in_histogram(heights))' },
        'One histogram costs O(m), so the whole grid costs O(n * m), instead of the O(n^2 * m^2) of trying every rectangle.'
      ]
    },
    statement: ['A grid has `n` rows and `m` columns of the characters `0` and `1`. Print the area of the largest rectangle that contains only `1`.'],
    inputFormat: ['The first line has `n` and `m`.', 'Each of the next `n` lines has `m` characters, `0` or `1`, without spaces.'],
    outputFormat: ['Print the area (0 if there is no `1`).'],
    constraints: ['1 <= n, m <= 200'],
    examples: [{ input: '4 5\n10100\n10111\n11111\n10010\n', note: 'The rectangle in rows 2-3 and columns 3-5 has the area 6.' }],
    hints: ['For one row, treat the number of ones above (and including) each cell as the height of a bar.', 'The largest rectangle with its bottom in this row is the largest rectangle in that histogram.', 'Reuse the histogram algorithm with a stack for every row.'],
    program: {
      includes: ['<algorithm>'],
      io: ['n:int m:int', 'g:rows[n]'],
      python: r`
        heights = [0] * m
        best = 0
        for row in g:
            for j in range(m):
                heights[j] = heights[j] + 1 if row[j] == "1" else 0
            stack = []
            for j in range(m + 1):
                cur = heights[j] if j < m else 0
                while stack and heights[stack[-1]] >= cur:
                    height = heights[stack.pop()]
                    left = stack[-1] if stack else -1
                    best = max(best, height * (j - left - 1))
                stack.append(j)
        print(best)`,
      cpp: r`
        vector<int> heights(m, 0);
        long long best = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) heights[j] = g[i][j] == '1' ? heights[j] + 1 : 0;
            vector<int> stack;
            for (int j = 0; j <= m; j++) {
                int cur = j < m ? heights[j] : 0;
                while (!stack.empty() && heights[stack.back()] >= cur) {
                    int height = heights[stack.back()];
                    stack.pop_back();
                    int left = stack.empty() ? -1 : stack.back();
                    best = max(best, (long long) height * (j - left - 1));
                }
                stack.push_back(j);
            }
        }
        cout << best << "\n";`,
      java: r`
        int[] heights = new int[(int) m];
        long best = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) heights[j] = g[i].charAt(j) == '1' ? heights[j] + 1 : 0;
            Deque<Integer> stack = new ArrayDeque<>();
            for (int j = 0; j <= m; j++) {
                int cur = j < m ? heights[j] : 0;
                while (!stack.isEmpty() && heights[stack.peek()] >= cur) {
                    int height = heights[stack.pop()];
                    int left = stack.isEmpty() ? -1 : stack.peek();
                    best = Math.max(best, (long) height * (j - left - 1));
                }
                stack.push(j);
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The ones above each cell form a histogram for every row; the stack algorithm finds the largest rectangle whose bottom edge is in that row.'], complexity: 'Time O(n * m), space O(m).' },
    solve(input) { const { n, m, g } = parseBits(input); const next = heightsOf(g, m); let best = 0; for (const row of g) best = Math.max(best, bestHistogram(next(row))); return String(best); },
    tests() {
      const g = rng(612);
      crossCheck(() => gridInput(g, randInt(g, 1, 6), randInt(g, 1, 6), 0.7), (i) => this.solve(i), (i) => { const { n, m, g: grid } = parseBits(i); return bruteRectangle(grid, n, m); }, 150);
      return ['4 5\n10100\n10111\n11111\n10010\n', '1 1\n0\n', '1 1\n1\n', '2 2\n11\n11\n', '3 3\n000\n000\n000\n', gridInput(g, 8, 9, 0.6), gridInput(g, 60, 70, 0.8), gridInput(g, 200, 200, 0.5), gridInput(g, 200, 200, 0.95), gridInput(g, 200, 200, 1), gridInput(g, 200, 200, 0), gridInput(g, 200, 1, 0.9), gridInput(g, 1, 200, 0.9)];
    }
  },

  {
    slug: 'count-submatrices-with-all-ones',
    title: 'Count the Rectangles of Ones',
    difficulty: 'hard',
    tags: ['stack', 'monotonic-stack', 'matrix', 'counting'],
    concept: {
      title: 'Count the rectangles that end at each cell, reusing the count of the previous smaller bar',
      body: [
        'Count **all** rectangles that consist only of ones (a single cell is a rectangle). Group them by their **bottom-right corner**. Use the heights `heights[j]` of the consecutive ones above (including) each cell of the current row, as in the problem of the largest rectangle of ones.',
        'Let `cnt[j]` be the number of rectangles of ones whose bottom-right corner is the cell in column `j` of the current row. Such a rectangle has some width `w` (it spans columns `j-w+1 .. j`) and any height up to the minimum of `heights` in that range. Find the nearest column `p` to the left with `heights[p] < heights[j]` (a **monotonic stack** gives it). For widths that reach to `p` or beyond, the minimum is no longer `heights[j]`, so the rectangles are the ones counted by `cnt[p]`. For the widths `1 .. j-p`, the minimum is `heights[j]`: they give `heights[j] * (j - p)` rectangles.',
        { code: 'for j in range(m):\n    while stack and heights[stack[-1]] >= heights[j]: stack.pop()\n    if stack:\n        p = stack[-1]\n        cnt[j] = cnt[p] + heights[j] * (j - p)\n    else:\n        cnt[j] = heights[j] * (j + 1)       # no smaller bar: every width up to j + 1\n    stack.append(j)\n    total += cnt[j]' },
        'Rows are processed one after another, so the whole grid costs O(n * m).'
      ]
    },
    statement: ['A grid has `n` rows and `m` columns of the characters `0` and `1`. Count the rectangles (submatrices) that contain only `1`. Different positions are different rectangles, and a single cell with `1` counts as one.'],
    inputFormat: ['The first line has `n` and `m`.', 'Each of the next `n` lines has `m` characters, `0` or `1`, without spaces.'],
    outputFormat: ['Print the number of rectangles.'],
    constraints: ['1 <= n, m <= 200'],
    examples: [{ input: '3 3\n011\n111\n011\n', note: '7 single cells, 4 rectangles of size 1x2, 1 of size 1x3, 4 of size 2x1, 2 of size 3x1, 2 of size 2x2 and 1 of size 3x2: 21 in total.' }],
    hints: ['Group the rectangles by their bottom-right corner and process the grid row by row with heights.', 'For a cell, rectangles that are not wider than the distance to the nearest lower bar are limited by the height of the cell.', 'Wider rectangles were already counted at that lower bar: add its count.'],
    program: {
      io: ['n:int m:int', 'g:rows[n]'],
      python: r`
        heights = [0] * m
        total = 0
        for row in g:
            for j in range(m):
                heights[j] = heights[j] + 1 if row[j] == "1" else 0
            stack = []
            cnt = [0] * m
            for j in range(m):
                while stack and heights[stack[-1]] >= heights[j]:
                    stack.pop()
                if stack:
                    p = stack[-1]
                    cnt[j] = cnt[p] + heights[j] * (j - p)
                else:
                    cnt[j] = heights[j] * (j + 1)
                stack.append(j)
                total += cnt[j]
        print(total)`,
      cpp: r`
        vector<int> heights(m, 0);
        long long total = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) heights[j] = g[i][j] == '1' ? heights[j] + 1 : 0;
            vector<int> stack;
            vector<long long> cnt(m, 0);
            for (int j = 0; j < m; j++) {
                while (!stack.empty() && heights[stack.back()] >= heights[j]) stack.pop_back();
                if (!stack.empty()) {
                    int p = stack.back();
                    cnt[j] = cnt[p] + (long long) heights[j] * (j - p);
                } else {
                    cnt[j] = (long long) heights[j] * (j + 1);
                }
                stack.push_back(j);
                total += cnt[j];
            }
        }
        cout << total << "\n";`,
      java: r`
        int[] heights = new int[(int) m];
        long total = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) heights[j] = g[i].charAt(j) == '1' ? heights[j] + 1 : 0;
            Deque<Integer> stack = new ArrayDeque<>();
            long[] cnt = new long[(int) m];
            for (int j = 0; j < m; j++) {
                while (!stack.isEmpty() && heights[stack.peek()] >= heights[j]) stack.pop();
                if (!stack.isEmpty()) {
                    int p = stack.peek();
                    cnt[j] = cnt[p] + (long) heights[j] * (j - p);
                } else {
                    cnt[j] = (long) heights[j] * (j + 1);
                }
                stack.push(j);
                total += cnt[j];
            }
        }
        System.out.println(total);`
    },
    solution: { explanation: ['For each row the heights of ones are kept. A stack finds the nearest lower bar to the left of a cell: rectangles at most that wide are bounded by the cell height, wider ones were counted at the lower bar.'], complexity: 'Time O(n * m), space O(m).' },
    solve(input) { const { n, m, g } = parseBits(input); const h = new Array(m).fill(0); let total = 0; for (const row of g) { for (let j = 0; j < m; j++) h[j] = row[j] === '1' ? h[j] + 1 : 0; const cnt = new Array(m).fill(0); const st = []; for (let j = 0; j < m; j++) { while (st.length && h[st[st.length - 1]] >= h[j]) st.pop(); if (st.length) { const p = st[st.length - 1]; cnt[j] = cnt[p] + h[j] * (j - p); } else cnt[j] = h[j] * (j + 1); st.push(j); total += cnt[j]; } } return String(total); },
    tests() {
      const g = rng(613);
      crossCheck(() => gridInput(g, randInt(g, 1, 6), randInt(g, 1, 6), 0.7), (i) => this.solve(i), (i) => { const { n, m, g: grid } = parseBits(i); return bruteCount(grid, n, m); }, 150);
      return ['3 3\n011\n111\n011\n', '1 1\n0\n', '1 1\n1\n', '2 2\n11\n11\n', '3 3\n000\n000\n000\n', gridInput(g, 8, 9, 0.6), gridInput(g, 60, 70, 0.8), gridInput(g, 200, 200, 0.5), gridInput(g, 200, 200, 0.95), gridInput(g, 200, 200, 1), gridInput(g, 200, 200, 0), gridInput(g, 200, 1, 0.9), gridInput(g, 1, 200, 0.9)];
    }
  },

  {
    slug: 'basic-calculator',
    title: 'A Calculator With Parentheses',
    difficulty: 'hard',
    tags: ['stack', 'parsing', 'expressions', 'strings'],
    concept: {
      title: 'A minus sign in front of a parenthesis flips everything inside',
      body: [
        'The expression contains numbers, `+`, `-`, spaces and parentheses. There is no multiplication, so there is no precedence to handle; the only difficulty is the parentheses: `10 - (2 + 3)` is `10 - 2 - 3`, because the sign before the parenthesis applies to **all** the terms inside.',
        'Process the characters from left to right and keep `result` (the value of the part read so far in the current level), `sign` (the sign of the next number, +1 or -1) and `num` (the number that is being read). On a **`(`**, push the pair `(result, sign)` on the stack and start a new level with `result = 0` and `sign = 1`. On a **`)`**, finish the number, pop `(prev_result, prev_sign)` and set `result = prev_result + prev_sign * result`.',
        { code: 'result = 0; sign = 1; num = 0; stack = []\nfor ch in s:\n    if ch.isdigit():  num = num * 10 + int(ch)\n    elif ch in "+-":  result += sign * num; num = 0; sign = 1 if ch == "+" else -1\n    elif ch == "(":   stack.append((result, sign)); result = 0; sign = 1\n    elif ch == ")":\n        result += sign * num; num = 0\n        prev_result, prev_sign = stack.pop()\n        result = prev_result + prev_sign * result\nresult += sign * num' },
        'A minus can also stand at the start of the expression or right after a `(` (for example `-(2+3)` or `(-4)`): the code handles this, because the number before it is just 0. Spaces are skipped.'
      ]
    },
    statement: ['Evaluate an expression that has non-negative integers, the operators `+` and `-`, parentheses and spaces. A `-` may also appear at the start of the expression or directly after `(`, as a sign of the number or of the parenthesis that follows. Print the value.'],
    inputFormat: ['One line with the expression. It is always valid. Two operators never follow each other directly (`--` does not occur).'],
    outputFormat: ['Print the value of the expression.'],
    constraints: ['1 <= length of the line <= 20000', 'Each number is at most 10^6, and every partial value fits in 64 bits.'],
    examples: [{ input: '1 + (4 + 5 + 2) - 3\n', note: '1 + 11 - 3 = 9.' }, { input: '10 - (2 + 3)\n', note: 'The minus applies to the whole parenthesis: 10 - 5 = 5.' }],
    hints: ['Without multiplication, the only thing that matters is the sign in front of each number.', 'When you meet `(`, save the result so far and the sign before the parenthesis on a stack.', 'On `)`, combine the saved result with the value of the parenthesis, using the saved sign.'],
    program: {
      io: ['s:line'],
      python: r`
        result = 0
        sign = 1
        num = 0
        stack = []
        for ch in s:
            if "0" <= ch <= "9":
                num = num * 10 + int(ch)
            elif ch == "+" or ch == "-":
                result += sign * num
                num = 0
                sign = 1 if ch == "+" else -1
            elif ch == "(":
                stack.append((result, sign))
                result = 0
                sign = 1
            elif ch == ")":
                result += sign * num
                num = 0
                prev_result, prev_sign = stack.pop()
                result = prev_result + prev_sign * result
        result += sign * num
        print(result)`,
      cpp: r`
        long long result = 0, num = 0;
        int sign = 1;
        vector<pair<long long, int>> stack;
        for (char ch : s) {
            if (ch >= '0' && ch <= '9') {
                num = num * 10 + (ch - '0');
            } else if (ch == '+' || ch == '-') {
                result += sign * num;
                num = 0;
                sign = ch == '+' ? 1 : -1;
            } else if (ch == '(') {
                stack.push_back({result, sign});
                result = 0;
                sign = 1;
            } else if (ch == ')') {
                result += sign * num;
                num = 0;
                result = stack.back().first + stack.back().second * result;
                stack.pop_back();
            }
        }
        result += sign * num;
        cout << result << "\n";`,
      java: r`
        long result = 0, num = 0;
        int sign = 1;
        Deque<long[]> stack = new ArrayDeque<>();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch >= '0' && ch <= '9') {
                num = num * 10 + (ch - '0');
            } else if (ch == '+' || ch == '-') {
                result += sign * num;
                num = 0;
                sign = ch == '+' ? 1 : -1;
            } else if (ch == '(') {
                stack.push(new long[] {result, sign});
                result = 0;
                sign = 1;
            } else if (ch == ')') {
                result += sign * num;
                num = 0;
                long[] saved = stack.pop();
                result = saved[0] + saved[1] * result;
            }
        }
        result += sign * num;
        System.out.println(result);`
    },
    solution: { explanation: ['The result and the sign before a parenthesis are saved on a stack at `(` and combined with the value of the parenthesis at `)`. Between them, numbers are added with their signs.'], complexity: 'Time O(n), space O(depth of the parentheses).' },
    solve(input) { const s = input.replace(/\n$/, ''); let result = 0n, sign = 1n, num = 0n; const st = []; for (const ch of s) { if (ch >= '0' && ch <= '9') num = num * 10n + BigInt(ch); else if (ch === '+' || ch === '-') { result += sign * num; num = 0n; sign = ch === '+' ? 1n : -1n; } else if (ch === '(') { st.push([result, sign]); result = 0n; sign = 1n; } else if (ch === ')') { result += sign * num; num = 0n; const [pr, ps] = st.pop(); result = pr + ps * result; } } result += sign * num; return result.toString(); },
    tests() {
      const g = rng(614);
      // random expressions with + - and parentheses, sometimes starting with a sign or with a sign after "("
      const make = (terms, depth) => { const e = genExpr(g, depth, terms, false); return e.s; };
      const withSigns = (s) => { const out = g() < 0.4 ? `-(${s})` : s; return out.replace(/\(/g, (m) => (g() < 0.2 ? '(-' : m)); };
      const brute = (i) => String(Function(`"use strict"; return (${i.replace(/\n$/, '')});`)());
      crossCheck(() => withSigns(make(randInt(g, 1, 8), 3)) + '\n', (i) => this.solve(i), brute, 300);
      const chain = (n) => { let s = '5'; for (let i = 0; i < n; i++) s += (i % 2 ? ' + ' : ' - ') + randInt(g, 100000, 999999); return s + '\n'; };
      const deep = (d) => `${'-('.repeat(d)}7${')'.repeat(d)}\n`;
      return ['1 + (4 + 5 + 2) - 3\n', '10 - (2 + 3)\n', '0\n', '(1)\n', '-(2+3)\n', '(-4)\n', '1-(-2)\n', ' 2 - 1 + 2 \n', make(30, 4) + '\n', make(300, 8) + '\n', chain(1500), chain(2000), deep(2000), deep(2001), `${'('.repeat(9000)}1${')'.repeat(9000)}\n`, `${'1-('.repeat(4900)}1${')'.repeat(4900)}\n`, '999999 - (999999 - (999999 - 999999))\n'];
    }
  },

  {
    slug: 'calculator-with-all-operations',
    title: 'A Calculator With Precedence',
    difficulty: 'hard',
    tags: ['stack', 'parsing', 'expressions', 'precedence'],
    concept: {
      title: 'Two stacks: values and operators, and a rule about who goes first',
      body: [
        'Now the expression has `+`, `-`, `*`, `/` and parentheses. `*` and `/` bind stronger than `+` and `-`, and `/` is the **integer division that truncates towards zero** (`-7 / 2` is `-3`). Use two stacks: one for **numbers** and one for **operators** (and `(`).',
        'Reading left to right: a **number** goes on the number stack. A **`(`** goes on the operator stack. A **`)`** applies operators until the matching `(` is on top, and then removes it. For an **operator** `op`: while the top of the operator stack is an operator with a precedence **greater or equal** to `op` (so that `a - b - c` is evaluated from left to right), apply it first; then push `op`. At the end apply all remaining operators.',
        { code: 'def apply():                                  # take two numbers and one operator\n    b = nums.pop(); a = nums.pop(); op = ops.pop()\n    nums.append(a + b if op == "+" else a - b if op == "-" else a * b if op == "*" else trunc_div(a, b))\n\n"+" or "-": while ops and ops[-1] != "(" and prec[ops[-1]] >= prec[op]: apply()\n          ops.append(op)' },
        'Python\'s `//` rounds towards minus infinity, so for negative results write the division with absolute values and fix the sign: `q = abs(a) // abs(b)`, negative if the signs differ. C++ and Java already truncate towards zero with `/`.'
      ]
    },
    statement: ['Evaluate an expression with non-negative integers, the operators `+`, `-`, `*`, `/`, parentheses and spaces. The division is an integer division that truncates towards zero. The expression is valid, a divisor is never zero, there is no unary minus (a `-` always has a number or a parenthesis on its left), and every partial value has an absolute value below 10^16.'],
    inputFormat: ['One line with the expression.'],
    outputFormat: ['Print the value of the expression.'],
    constraints: ['1 <= length of the line <= 20000', 'Each number is at most 10^6.', 'The parentheses are nested at most 1500 levels deep.'],
    examples: [{ input: '2 * (3 + 4) - 10 / 3\n', note: '14 - 3 = 11.' }, { input: '(1 - 6) / 2\n', note: '-5 / 2 truncates towards zero: -2.' }],
    hints: ['Keep a stack of numbers and a stack of operators.', 'Before pushing an operator, apply the operators on top that have the same or a higher precedence.', 'At `)` apply operators until `(` is on top. Remember that the division truncates towards zero.'],
    program: {
      io: ['s:line'],
      helpers: {
        python: r`
          def apply_top(nums, ops):
              b = nums.pop()
              a = nums.pop()
              op = ops.pop()
              if op == "+":
                  nums.append(a + b)
              elif op == "-":
                  nums.append(a - b)
              elif op == "*":
                  nums.append(a * b)
              else:
                  q = abs(a) // abs(b)
                  nums.append(q if (a < 0) == (b < 0) else -q)`,
        cpp: r`
          int precedence(char op) {
              return op == '*' || op == '/' ? 2 : 1;
          }

          void applyTop(vector<long long>& nums, vector<char>& ops) {
              long long b = nums.back();
              nums.pop_back();
              long long a = nums.back();
              nums.pop_back();
              char op = ops.back();
              ops.pop_back();
              if (op == '+') nums.push_back(a + b);
              else if (op == '-') nums.push_back(a - b);
              else if (op == '*') nums.push_back(a * b);
              else nums.push_back(a / b);
          }`,
        java: r`
          static int precedence(char op) {
              return op == '*' || op == '/' ? 2 : 1;
          }

          static void applyTop(Deque<Long> nums, Deque<Character> ops) {
              long b = nums.pop();
              long a = nums.pop();
              char op = ops.pop();
              if (op == '+') nums.push(a + b);
              else if (op == '-') nums.push(a - b);
              else if (op == '*') nums.push(a * b);
              else nums.push(a / b);
          }`
      },
      python: r`
        prec = {"+": 1, "-": 1, "*": 2, "/": 2}
        nums = []
        ops = []
        i = 0
        while i < len(s):
            ch = s[i]
            if "0" <= ch <= "9":
                j = i
                while j < len(s) and "0" <= s[j] <= "9":
                    j += 1
                nums.append(int(s[i:j]))
                i = j
                continue
            if ch == "(":
                ops.append(ch)
            elif ch == ")":
                while ops[-1] != "(":
                    apply_top(nums, ops)
                ops.pop()
            elif ch in prec:
                while ops and ops[-1] != "(" and prec[ops[-1]] >= prec[ch]:
                    apply_top(nums, ops)
                ops.append(ch)
            i += 1
        while ops:
            apply_top(nums, ops)
        print(nums[0])`,
      cpp: r`
        vector<long long> nums;
        vector<char> ops;
        int i = 0, len = s.size();
        while (i < len) {
            char ch = s[i];
            if (ch >= '0' && ch <= '9') {
                long long value = 0;
                while (i < len && s[i] >= '0' && s[i] <= '9') value = value * 10 + (s[i++] - '0');
                nums.push_back(value);
                continue;
            }
            if (ch == '(') {
                ops.push_back(ch);
            } else if (ch == ')') {
                while (ops.back() != '(') applyTop(nums, ops);
                ops.pop_back();
            } else if (ch == '+' || ch == '-' || ch == '*' || ch == '/') {
                while (!ops.empty() && ops.back() != '(' && precedence(ops.back()) >= precedence(ch)) applyTop(nums, ops);
                ops.push_back(ch);
            }
            i++;
        }
        while (!ops.empty()) applyTop(nums, ops);
        cout << nums.back() << "\n";`,
      java: r`
        Deque<Long> nums = new ArrayDeque<>();
        Deque<Character> ops = new ArrayDeque<>();
        int i = 0, len = s.length();
        while (i < len) {
            char ch = s.charAt(i);
            if (ch >= '0' && ch <= '9') {
                long value = 0;
                while (i < len && s.charAt(i) >= '0' && s.charAt(i) <= '9') value = value * 10 + (s.charAt(i++) - '0');
                nums.push(value);
                continue;
            }
            if (ch == '(') {
                ops.push(ch);
            } else if (ch == ')') {
                while (ops.peek() != '(') applyTop(nums, ops);
                ops.pop();
            } else if (ch == '+' || ch == '-' || ch == '*' || ch == '/') {
                while (!ops.isEmpty() && ops.peek() != '(' && precedence(ops.peek()) >= precedence(ch)) applyTop(nums, ops);
                ops.push(ch);
            }
            i++;
        }
        while (!ops.isEmpty()) applyTop(nums, ops);
        System.out.println(nums.peek());`
    },
    solution: { explanation: ['Numbers and operators are kept on two stacks. Before an operator is pushed, operators of the same or higher precedence on top are applied; `)` applies operators until `(`. Division truncates towards zero.'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      // a recursive-descent parser written differently from the stack version
      const s = input.replace(/\n$/, '').replace(/ /g, ''); let p = 0;
      const expr = () => { let v = term(); while (s[p] === '+' || s[p] === '-') { const op = s[p++]; const t = term(); v = op === '+' ? v + t : v - t; } return v; };
      const term = () => { let v = factor(); while (s[p] === '*' || s[p] === '/') { const op = s[p++]; const t = factor(); v = op === '*' ? v * t : trunc(v, t); } return v; };
      const factor = () => { if (s[p] === '(') { p++; const v = expr(); p++; return v; } let q = p; while (q < s.length && s[q] >= '0' && s[q] <= '9') q++; const v = Number(s.slice(p, q)); p = q; return v; };
      return String(expr());
    },
    tests() {
      const g = rng(615);
      const make = (terms, depth) => genExpr(g, depth, terms, true).s;
      // small cases against the evaluation of the generator (the generator computes the value while it builds the text)
      for (let t = 0; t < 400; t++) { const e = genExpr(g, 3, randInt(g, 1, 9), true); if (this.solve(e.s + '\n') !== String(e.v)) throw new Error('calculator reference differs from the generator on ' + e.s); }
      const chain = (n) => { let s = '7'; for (let i = 0; i < n; i++) s += [' + ', ' - ', ' * 1 + ', ' / 1 - '][i % 4] + randInt(g, 100000, 999999); return s + '\n'; };
      const deep = (d) => `${'(1 + '.repeat(d)}1${')'.repeat(d)}\n`;
      return ['2 * (3 + 4) - 10 / 3\n', '(1 - 6) / 2\n', '0\n', '7\n', '(7)\n', '8 / 3 * 3\n', '2 - 3 - 4\n', '100 / 10 / 5\n', '(0 - 7) / 2\n', '3 * (2 - 5) / 2\n', make(25, 3) + '\n', make(200, 6) + '\n', make(1500, 12) + '\n', chain(1500), chain(1700), deep(1500), `${'('.repeat(1500)}5${')'.repeat(1500)}\n`];
    }
  },

  {
    slug: 'longest-valid-parentheses',
    title: 'The Longest Valid Parentheses',
    difficulty: 'hard',
    tags: ['stack', 'strings', 'parentheses'],
    concept: {
      title: 'Keep the index of the last position that cannot be part of a valid substring',
      body: [
        'In a string of `(` and `)`, find the length of the longest **substring** (consecutive characters) that is a valid parentheses sequence. A subsequence would be easy; the substring has to be contiguous, so a `)` that has no partner **cuts** the string.',
        'Use a stack of **indexes**. Start with the index `-1` on the stack: it is the position just before the first character, the "last position that cannot be in a valid substring". For each index `i`: on `(` push `i`. On `)` pop the top. If the stack is now **empty**, this `)` has no partner, so push `i` as the new barrier. Otherwise the valid substring ends at `i` and starts right after the new top: its length is `i - stack[-1]`.',
        { code: 'stack = [-1]; best = 0\nfor i, ch in enumerate(s):\n    if ch == "(":\n        stack.append(i)\n    else:\n        stack.pop()\n        if not stack: stack.append(i)               # an unmatched ")" is a new barrier\n        else:         best = max(best, i - stack[-1])' },
        'Indexes in the stack: the barrier at the bottom and the positions of `(` that are still waiting for a `)`. The substring between the top of the stack and `i` is balanced, which is why the difference is the length.'
      ]
    },
    statement: ['A string consists of the characters `(` and `)`. Print the length of the longest contiguous substring that is a valid sequence of parentheses (every `(` has a matching `)` after it, and they are properly nested).'],
    inputFormat: ['One line with the string.'],
    outputFormat: ['Print the length (0 if there is no valid substring).'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: ')()())\n', note: 'The substring "()()" at positions 1-4 has the length 4.' }, { input: '(()\n', note: 'The longest valid substring is "()" with the length 2.' }],
    hints: ['Put the index -1 on the stack at the start.', 'A `(` pushes its index. A `)` pops, and if the stack becomes empty, push the index of this `)`.', 'Otherwise the current length is `i - stack.top()`.'],
    program: {
      includes: ['<algorithm>'],
      io: ['s:word'],
      python: r`
        stack = [-1]
        best = 0
        for i, ch in enumerate(s):
            if ch == "(":
                stack.append(i)
            else:
                stack.pop()
                if not stack:
                    stack.append(i)
                else:
                    best = max(best, i - stack[-1])
        print(best)`,
      cpp: r`
        vector<int> stack = {-1};
        int best = 0;
        for (int i = 0; i < (int) s.size(); i++) {
            if (s[i] == '(') {
                stack.push_back(i);
            } else {
                stack.pop_back();
                if (stack.empty()) stack.push_back(i);
                else best = max(best, i - stack.back());
            }
        }
        cout << best << "\n";`,
      java: r`
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(-1);
        int best = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') {
                stack.push(i);
            } else {
                stack.pop();
                if (stack.isEmpty()) stack.push(i);
                else best = Math.max(best, i - stack.peek());
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The stack holds the index before the current valid area and the positions of unmatched `(`. After a `)` the length of the valid substring ending here is the distance to the new top, or the `)` becomes the new barrier.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const s = input.trim(); const dp = new Array(s.length + 1).fill(0); let best = 0; for (let i = 1; i < s.length; i++) { if (s[i] === ')') { if (s[i - 1] === '(') dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2; else if (i - dp[i - 1] - 1 >= 0 && s[i - dp[i - 1] - 1] === '(') dp[i] = dp[i - 1] + 2 + (i - dp[i - 1] - 2 >= 0 ? dp[i - dp[i - 1] - 2] : 0); best = Math.max(best, dp[i]); } } return String(best); },
    tests() {
      const g = rng(616);
      const bracket = (n, p) => many(n, () => (g() < p ? '(' : ')')).join('');
      const brute = (i) => { const s = i.trim(); let best = 0; for (let a = 0; a < s.length; a++) { let bal = 0; for (let b = a; b < s.length; b++) { bal += s[b] === '(' ? 1 : -1; if (bal < 0) break; if (bal === 0) best = Math.max(best, b - a + 1); } } return best; };
      crossCheck(() => bracket(randInt(g, 1, 14), 0.5) + '\n', (i) => this.solve(i), brute, 400);
      return [')()())\n', '(()\n', '(\n', ')\n', '()\n', '()(()\n', '(()())\n', bracket(30, 0.5) + '\n', bracket(2000, 0.5) + '\n', bracket(20000, 0.5) + '\n', bracket(20000, 0.55) + '\n', `${'('.repeat(10000)}${')'.repeat(10000)}\n`, `${'()'.repeat(10000)}\n`, `${'('.repeat(20000)}\n`, `${')'.repeat(20000)}\n`, `${'()'.repeat(5000)})${'()'.repeat(4999)}\n`, `${'(()'.repeat(6666)}()\n`];
    }
  },

  {
    slug: 'sum-of-subarray-ranges',
    title: 'The Sum of Subarray Ranges',
    difficulty: 'hard',
    tags: ['stack', 'monotonic-stack', 'arrays', 'counting'],
    concept: {
      title: 'Sum of maximums minus sum of minimums, each by counting',
      body: [
        'The **range** of a subarray is `max - min`. The sum of the ranges over all subarrays is the **sum of all maximums** minus the **sum of all minimums**, and the two sums are found in the same way. Do not look at the subarrays. Look at the elements: how many subarrays have `a[j]` as their maximum? A subarray has `a[j]` as maximum if it starts after the nearest greater-or-equal element on the left (position `L`) and ends before the nearest strictly greater element on the right (position `R`): `(j - L)` choices for the start and `(R - j)` choices for the end. (The unequal treatment of equal values makes sure that a subarray with several equal maximums is counted once.)',
        'A monotonic stack finds `L` and `R` in one pass: when `a[i]` is greater than the top element `a[j]`, then `i` is the nearest strictly greater element to the right of `j`, and the element below `j` on the stack is its nearest greater-or-equal element on the left.',
        { code: 'def sum_of_maximums(a):\n    total = 0; stack = []\n    for i in range(len(a) + 1):\n        while stack and (i == len(a) or a[stack[-1]] < a[i]):\n            j = stack.pop()\n            left = stack[-1] if stack else -1\n            total += a[j] * (j - left) * (i - j)\n        stack.append(i)\n    return total\n\nranges = sum_of_maximums(a) + sum_of_maximums([-x for x in a])      # the minimum is the maximum of the negated values' },
        'The sum is large (up to about `4 * 10^17`), so use 64-bit integers in C++ and Java.'
      ]
    },
    statement: ['For an array of `n` numbers, the range of a subarray is its largest element minus its smallest element. Print the sum of the ranges of all contiguous subarrays.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` numbers.'],
    outputFormat: ['Print the sum.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '3\n1 3 3\n', note: 'The ranges: [1]=0, [3]=0, [3]=0, [1,3]=2, [3,3]=0, [1,3,3]=2. The sum is 4.' }],
    hints: ['The sum of ranges is the sum of the maximums minus the sum of the minimums.', 'For each element count the subarrays in which it is the maximum, using the nearest greater element on each side.', 'Break ties between equal values in one direction to avoid counting a subarray twice; get the minimums from the negated array.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      helpers: {
        python: r`
          def sum_of_maximums(a):
              total = 0
              stack = []
              for i in range(len(a) + 1):
                  while stack and (i == len(a) or a[stack[-1]] < a[i]):
                      j = stack.pop()
                      left = stack[-1] if stack else -1
                      total += a[j] * (j - left) * (i - j)
                  stack.append(i)
              return total`,
        cpp: r`
          long long sumOfMaximums(const vector<long long>& a) {
              int len = a.size();
              long long total = 0;
              vector<int> stack;
              for (int i = 0; i <= len; i++) {
                  while (!stack.empty() && (i == len || a[stack.back()] < a[i])) {
                      int j = stack.back();
                      stack.pop_back();
                      int left = stack.empty() ? -1 : stack.back();
                      total += a[j] * (j - left) * (i - j);
                  }
                  stack.push_back(i);
              }
              return total;
          }`,
        java: r`
          static long sumOfMaximums(long[] a) {
              int len = a.length;
              long total = 0;
              Deque<Integer> stack = new ArrayDeque<>();
              for (int i = 0; i <= len; i++) {
                  while (!stack.isEmpty() && (i == len || a[stack.peek()] < a[i])) {
                      int j = stack.pop();
                      int left = stack.isEmpty() ? -1 : stack.peek();
                      total += a[j] * (j - left) * (i - j);
                  }
                  stack.push(i);
              }
              return total;
          }`
      },
      python: r`
        print(sum_of_maximums(a) + sum_of_maximums([-x for x in a]))`,
      cpp: r`
        vector<long long> negated(a.size());
        for (size_t i = 0; i < a.size(); i++) negated[i] = -a[i];
        cout << sumOfMaximums(a) + sumOfMaximums(negated) << "\n";`,
      java: r`
        long[] negated = new long[a.length];
        for (int i = 0; i < a.length; i++) negated[i] = -a[i];
        System.out.println(sumOfMaximums(a) + sumOfMaximums(negated));`
    },
    solution: { explanation: ['A monotonic stack gives, for every element, how many subarrays have it as the maximum; the same on the negated array gives the minimums. The answer is the sum of the maximums minus the sum of the minimums.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]).map(BigInt); const sumMax = (x) => { let total = 0n; const st = []; for (let i = 0; i <= x.length; i++) { while (st.length && (i === x.length || x[st[st.length - 1]] < x[i])) { const j = st.pop(); const left = st.length ? st[st.length - 1] : -1; total += x[j] * BigInt(j - left) * BigInt(i - j); } st.push(i); } return total; }; return (sumMax(a) + sumMax(a.map((v) => -v))).toString(); },
    tests() {
      const g = rng(617);
      const brute = (i) => { const a = nums(rows(i)[1]); let total = 0n; for (let s = 0; s < a.length; s++) { let hi = -Infinity, lo = Infinity; for (let e = s; e < a.length; e++) { hi = Math.max(hi, a[e]); lo = Math.min(lo, a[e]); total += BigInt(hi - lo); } } return total.toString(); };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 10), -3, 3)), (i) => this.solve(i), brute);
      return ['3\n1 3 3\n', '1\n5\n', '2\n-1000000000 1000000000\n', '4\n2 2 2 2\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 2000, -1000, 1000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(many(20000, (i) => (i % 2 ? 1000000000 : -1000000000))), arr(many(20000, (i) => i * 50000 - 500000000)), arr(many(20000, (i) => 500000000 - i * 50000)), arr(many(20000, () => 1000000000)), arr(randArray(g, 20000, 0, 2))];
    }
  },

  {
    slug: 'maximum-width-ramp',
    title: 'The Widest Ramp',
    difficulty: 'hard',
    tags: ['stack', 'monotonic-stack', 'arrays', 'two-pointers'],
    concept: {
      title: 'Only the prefix minimums can be the start of the best ramp',
      body: [
        'A **ramp** is a pair of indexes `i < j` with `a[i] <= a[j]`. Its width is `j - i`. We want the widest ramp. A candidate for the **left** end `i` is useful only if it is a new **strict minimum** of the prefix: if some earlier element is `<=` `a[i]`, then using that earlier element is at least as good (it is further to the left and also not larger). So collect these candidates in a stack: the indexes of the strictly decreasing prefix minimums.',
        'Now look for the right end `j` **from the right to the left**. For each `j`, as long as the top candidate has `a[top] <= a[j]`, the pair is a ramp: record the width `j - top` and **pop** the candidate. Why can we pop it? Any later right end (further to the left) is closer to the candidate, so the width would only be smaller; the candidate cannot give a better answer. The candidates with smaller indexes are lower in the stack and the stack decreases in value, so the pop order is right.',
        { code: 'stack = []\nfor i in range(n):\n    if not stack or a[i] < a[stack[-1]]: stack.append(i)         # the prefix minimums\nbest = 0\nfor j in range(n - 1, -1, -1):\n    while stack and a[stack[-1]] <= a[j]:\n        best = max(best, j - stack.pop())' },
        'Each index is pushed once and popped at most once: O(n).'
      ]
    },
    statement: ['A ramp in an array is a pair of positions `i < j` with `a[i] <= a[j]`; its width is `j - i`. Print the largest width of a ramp, or 0 if there is no ramp.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` numbers.'],
    outputFormat: ['Print the largest width.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '6\n6 0 8 2 1 5\n', note: 'The ramp (1, 5): a[1] = 0 <= a[5] = 5, width 4.' }],
    hints: ['The left end of the best ramp is always a strict prefix minimum.', 'Collect the prefix minimums on a stack (as indexes).', 'Scan the right end from the right and pop every candidate that forms a ramp with it.'],
    program: {
      includes: ['<algorithm>'],
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        stack = []
        for i in range(n):
            if not stack or a[i] < a[stack[-1]]:
                stack.append(i)
        best = 0
        for j in range(n - 1, -1, -1):
            while stack and a[stack[-1]] <= a[j]:
                best = max(best, j - stack.pop())
        print(best)`,
      cpp: r`
        vector<int> stack;
        for (int i = 0; i < n; i++) {
            if (stack.empty() || a[i] < a[stack.back()]) stack.push_back(i);
        }
        int best = 0;
        for (int j = n - 1; j >= 0; j--) {
            while (!stack.empty() && a[stack.back()] <= a[j]) {
                best = max(best, j - stack.back());
                stack.pop_back();
            }
        }
        cout << best << "\n";`,
      java: r`
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            if (stack.isEmpty() || a[i] < a[stack.peek()]) stack.push(i);
        }
        int best = 0;
        for (int j = (int) n - 1; j >= 0; j--) {
            while (!stack.isEmpty() && a[stack.peek()] <= a[j]) {
                best = Math.max(best, j - stack.pop());
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The stack keeps the indexes of the strict prefix minimums, the only useful left ends. Scanning the right end from the right, every candidate that forms a ramp is popped after its width is recorded.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const n = a.length; const st = []; for (let i = 0; i < n; i++) if (!st.length || a[i] < a[st[st.length - 1]]) st.push(i); let best = 0; for (let j = n - 1; j >= 0; j--) while (st.length && a[st[st.length - 1]] <= a[j]) best = Math.max(best, j - st.pop()); return String(best); },
    tests() {
      const g = rng(618);
      const brute = (i) => { const a = nums(rows(i)[1]); let best = 0; for (let x = 0; x < a.length; x++) for (let y = x + 1; y < a.length; y++) if (a[x] <= a[y]) best = Math.max(best, y - x); return best; };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 12), -4, 4)), (i) => this.solve(i), brute);
      return ['6\n6 0 8 2 1 5\n', '1\n5\n', '2\n5 4\n', '2\n4 5\n', '5\n9 8 1 0 1\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 2000, -1000, 1000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(many(20000, (i) => 20000 - i)), arr(many(20000, (i) => i)), arr(many(20000, () => 7)), arr(many(20000, (i) => (i === 0 ? 1000000000 : i === 19999 ? 1000000000 : -i)))];
    }
  },

  {
    slug: 'number-of-atoms',
    title: 'Count the Atoms of a Formula',
    difficulty: 'hard',
    tags: ['stack', 'parsing', 'hash-map', 'strings'],
    concept: {
      title: 'A new counting table for every parenthesis',
      body: [
        'A chemical formula such as `K4(ON(SO3)2)2` has element names (an uppercase letter and optionally lowercase letters: `Mg`, `O`), counts after an element, and **groups in parentheses** that are repeated by a count after `)`. The total count of every element is needed. A group in parentheses is like a small formula of its own whose counts must be **multiplied** by the number after `)` and added to the surrounding formula. A stack of tables is the natural tool.',
        'Keep a **stack of maps** (element to count) and start with one empty map. On `(` push a new empty map. On `)` read the multiplier (1 if there is no number), pop the map on top, multiply every count in it, and add the result into the map that is now on top. On an element name read the count after it (1 if none) and add it to the map on top.',
        { code: 'stack = [{}]\n"(":  stack.append({})\n")":  mult = number after ")" or 1\n       top = stack.pop()\n       for name, c in top.items(): stack[-1][name] += c * mult\nname: count = number after the name or 1;  stack[-1][name] += count' },
        'At the end the bottom map has the answer. Print the elements **sorted by name**; a count of 1 is not printed: `K4N2O14S4`. Sorting is the ordinary comparison of strings (`C` comes before `Ca`).'
      ]
    },
    statement: ['A chemical formula is made of element names (an uppercase letter followed by any number of lowercase letters), counts (a number directly after an element or after a `)`; a missing number means 1) and groups in parentheses, which may be nested. Count how many atoms of each element the formula has. Print the elements sorted by name (the usual comparison of strings); after each name print its count, but only if the count is more than 1, with no separators.'],
    inputFormat: ['One line with the formula (no spaces). It is always valid.'],
    outputFormat: ['Print the result as one word, for example `K4N2O14S4`.'],
    constraints: ['1 <= length of the formula <= 1000', 'Every number in the formula is at most 1000.', 'Every count in the answer is at most 10^15.'],
    examples: [{ input: 'K4(ON(SO3)2)2\n', note: 'K: 4. Inside the group: O 1, N 1, S 2, O 6; times 2 gives O 14, N 2, S 4. Sorted: K4N2O14S4.' }, { input: 'Mg(OH)2\n', note: 'Mg 1, O 2, H 2. Sorted: H2MgO2.' }],
    hints: ['Treat each parenthesis as a new table of counts, kept on a stack.', 'At `)` multiply the table on top by the number that follows and merge it into the table below.', 'Sort the names before printing, and skip the number when the count is 1.'],
    program: {
      includes: ['<map>', '<cctype>'],
      io: ['s:word'],
      python: r`
        stack = [{}]
        i = 0
        n = len(s)
        while i < n:
            ch = s[i]
            if ch == "(":
                stack.append({})
                i += 1
            elif ch == ")":
                i += 1
                j = i
                while j < n and s[j].isdigit():
                    j += 1
                mult = int(s[i:j]) if j > i else 1
                i = j
                top = stack.pop()
                for name, c in top.items():
                    stack[-1][name] = stack[-1].get(name, 0) + c * mult
            else:
                j = i + 1
                while j < n and s[j].islower():
                    j += 1
                name = s[i:j]
                i = j
                while j < n and s[j].isdigit():
                    j += 1
                count = int(s[i:j]) if j > i else 1
                i = j
                stack[-1][name] = stack[-1].get(name, 0) + count
        print("".join(name + (str(c) if c > 1 else "") for name, c in sorted(stack[0].items())))`,
      cpp: r`
        vector<map<string, long long>> stack(1);
        int i = 0, len = s.size();
        while (i < len) {
            char ch = s[i];
            if (ch == '(') {
                stack.push_back({});
                i++;
            } else if (ch == ')') {
                i++;
                long long mult = 0;
                bool any = false;
                while (i < len && isdigit(s[i])) {
                    mult = mult * 10 + (s[i++] - '0');
                    any = true;
                }
                if (!any) mult = 1;
                map<string, long long> top = stack.back();
                stack.pop_back();
                for (auto& entry : top) stack.back()[entry.first] += entry.second * mult;
            } else {
                int j = i + 1;
                while (j < len && islower(s[j])) j++;
                string name = s.substr(i, j - i);
                i = j;
                long long count = 0;
                bool any = false;
                while (i < len && isdigit(s[i])) {
                    count = count * 10 + (s[i++] - '0');
                    any = true;
                }
                if (!any) count = 1;
                stack.back()[name] += count;
            }
        }
        string result;
        for (auto& entry : stack[0]) {
            result += entry.first;
            if (entry.second > 1) result += to_string(entry.second);
        }
        cout << result << "\n";`,
      java: r`
        List<TreeMap<String, Long>> stack = new ArrayList<>();
        stack.add(new TreeMap<>());
        int i = 0, len = s.length();
        while (i < len) {
            char ch = s.charAt(i);
            if (ch == '(') {
                stack.add(new TreeMap<>());
                i++;
            } else if (ch == ')') {
                i++;
                long mult = 0;
                boolean any = false;
                while (i < len && Character.isDigit(s.charAt(i))) {
                    mult = mult * 10 + (s.charAt(i++) - '0');
                    any = true;
                }
                if (!any) mult = 1;
                TreeMap<String, Long> top = stack.remove(stack.size() - 1);
                TreeMap<String, Long> below = stack.get(stack.size() - 1);
                for (Map.Entry<String, Long> entry : top.entrySet()) {
                    below.merge(entry.getKey(), entry.getValue() * mult, Long::sum);
                }
            } else {
                int j = i + 1;
                while (j < len && Character.isLowerCase(s.charAt(j))) j++;
                String name = s.substring(i, j);
                i = j;
                long count = 0;
                boolean any = false;
                while (i < len && Character.isDigit(s.charAt(i))) {
                    count = count * 10 + (s.charAt(i++) - '0');
                    any = true;
                }
                if (!any) count = 1;
                stack.get(stack.size() - 1).merge(name, count, Long::sum);
            }
        }
        StringBuilder result = new StringBuilder();
        for (Map.Entry<String, Long> entry : stack.get(0).entrySet()) {
            result.append(entry.getKey());
            if (entry.getValue() > 1) result.append(entry.getValue());
        }
        System.out.println(result);`
    },
    solution: { explanation: ['A stack of maps holds one table of counts per open parenthesis. At `)` the top table is multiplied by the number after it and merged into the table below; the sorted bottom table is printed.'], complexity: 'Time O(n * k) for k different elements, space O(n).' },
    solve(input) {
      // recursive version of the parser (formulas are short, so the recursion is shallow enough)
      const s = input.trim(); let p = 0;
      const number = () => { let q = p; while (q < s.length && s[q] >= '0' && s[q] <= '9') q++; const v = q > p ? BigInt(s.slice(p, q)) : 1n; p = q; return v; };
      const group = () => { const counts = new Map(); while (p < s.length && s[p] !== ')') { if (s[p] === '(') { p++; const inner = group(); p++; const mult = number(); for (const [k, v] of inner) counts.set(k, (counts.get(k) || 0n) + v * mult); } else { let q = p + 1; while (q < s.length && s[q] >= 'a' && s[q] <= 'z') q++; const name = s.slice(p, q); p = q; const c = number(); counts.set(name, (counts.get(name) || 0n) + c); } } return counts; };
      const total = group();
      return [...total.keys()].sort().map((k) => k + (total.get(k) > 1n ? total.get(k) : '')).join('');
    },
    tests() {
      const g = rng(619);
      const el = ['H', 'He', 'C', 'Ca', 'Mg', 'N', 'Na', 'O', 'S', 'K', 'Fe', 'Zn', 'Cl', 'Cu', 'Co', 'Cr', 'P', 'Ar', 'Ag', 'Au'];
      // a random formula of about `size` characters, nesting up to `depth`, counts up to `maxCount`
      const formula = (size, depth, maxCount) => { let out = ''; while (out.length < size) { if (depth > 0 && g() < 0.3) { out += '(' + formula(Math.max(3, Math.floor(g() * (size - out.length)) % 40 + 3), depth - 1, maxCount) + ')'; if (g() < 0.7) out += randInt(g, 2, maxCount); } else { out += el[randInt(g, 0, el.length - 1)]; if (g() < 0.6) out += randInt(g, 2, maxCount); } } return out; };
      const safe = (s) => { try { return Math.max(...[...this.solve(s + '\n').matchAll(/\d+/g)].map((x) => Number(x[0]))) <= 1e15; } catch (e) { return false; } };
      const pick = (size, depth, maxCount) => { for (let t = 0; t < 1000; t++) { const f = formula(size, depth, maxCount); if (f.length <= 1000 && safe(f)) return f + '\n'; } throw new Error('no formula found'); };
      return ['K4(ON(SO3)2)2\n', 'H2O\n', 'Mg(OH)2\n', 'H\n', '(H)\n', 'C\n', 'Ca(Ca(Ca)2)2\n', pick(20, 2, 5), pick(60, 3, 9), pick(200, 4, 50), pick(500, 6, 9), pick(900, 8, 3), `${'('.repeat(300)}H${')'.repeat(300)}\n`, `H${'(He'.repeat(45)}${')2'.repeat(45)}\n`, 'Fe1000C1000O1000\n', 'Fe1000(C1000(O1000)1000)1000\n', `${'(H)'.repeat(300)}\n`];
    }
  }
];
