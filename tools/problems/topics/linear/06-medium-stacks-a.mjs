import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const show = (a) => (a.length ? a : 'empty');
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };

export default [
  {
    slug: 'daily-temperatures',
    title: 'Days Until a Warmer Day',
    difficulty: 'medium',
    tags: ['stack', 'monotonic-stack', 'arrays'],
    concept: {
      title: 'The next greater element, but with distances',
      body: [
        'For every day find how many days you must wait until a **warmer** temperature (0 if there is none). This is the "next greater element" problem where the answer is the **distance** between two positions instead of the value, which is why the stack stores **indexes**.',
        { code: 'res = [0] * n\nstack = []                                  # indexes of days that wait for a warmer day\nfor i in range(n):\n    while stack and t[stack[-1]] < t[i]:\n        j = stack.pop()\n        res[j] = i - j                      # the number of days between j and i\n    stack.append(i)' },
        'Because every day is pushed once and popped at most once, the loop is O(n). The temperatures on the stack are non-increasing from the bottom to the top (a **monotonic** stack), so the days that a new warm day satisfies are always on top.'
      ]
    },
    statement: ['Given the temperatures of `n` days, print for every day the number of days until a strictly warmer day, or 0 if there is no warmer day later.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` temperatures.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    constraints: ['1 <= n <= 20000', '-100 <= each temperature <= 100'],
    examples: [{ input: '8\n73 74 75 71 69 72 76 73\n', note: 'The answers: 1 1 4 2 1 1 0 0.' }],
    hints: ['A nested loop is too slow for n = 20000.', 'Keep a stack of the indexes of the days that are still waiting.', 'A warmer day settles all colder waiting days: the answer is the difference of the indexes.'],
    program: {
      io: ['n:int', 't:int[n]'],
      fast: true,
      python: r`
        res = [0] * n
        stack = []
        for i in range(n):
            while stack and t[stack[-1]] < t[i]:
                j = stack.pop()
                res[j] = i - j
            stack.append(i)
        print(*res)`,
      cpp: r`
        vector<int> res(n, 0), stack;
        for (int i = 0; i < n; i++) {
            while (!stack.empty() && t[stack.back()] < t[i]) {
                int j = stack.back();
                stack.pop_back();
                res[j] = i - j;
            }
            stack.push_back(i);
        }
        for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        int[] res = new int[(int) n];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && t[stack.peek()] < t[i]) {
                int j = stack.pop();
                res[j] = i - j;
            }
            stack.push(i);
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(res[i]).append(i + 1 < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The stack holds the indexes of days still waiting for a warmer day. A warmer day pops all colder waiting days and writes the distance in days.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const t = nums(rows(input)[1]); const res = new Array(t.length).fill(0); const st = []; for (let i = 0; i < t.length; i++) { while (st.length && t[st[st.length - 1]] < t[i]) { const j = st.pop(); res[j] = i - j; } st.push(i); } return res.join(' '); },
    tests() {
      const g = rng(561);
      const brute = (i) => { const t = nums(rows(i)[1]); return t.map((x, p) => { for (let q = p + 1; q < t.length; q++) if (t[q] > x) return q - p; return 0; }).join(' '); };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 12), -3, 3)), (i) => this.solve(i), brute);
      return ['8\n73 74 75 71 69 72 76 73\n', '1\n5\n', '4\n30 40 50 60\n', '4\n60 50 40 30\n', arr(randArray(g, 20, -100, 100)), arr(randArray(g, 2000, -100, 100)), arr(randArray(g, 20000, -100, 100)), arr(many(20000, (i) => 100 - (i % 201))), arr(many(20000, (i) => (i < 19999 ? 50 : 51))), arr(randArray(g, 20000, 0, 2))];
    }
  },

  {
    slug: 'decode-nested-string',
    title: 'Decode a Nested String',
    difficulty: 'medium',
    tags: ['stack', 'strings', 'parsing', 'nesting'],
    concept: {
      title: 'A stack remembers what to come back to',
      body: [
        'The encoding `k[text]` means that `text` is repeated `k` times, and `text` may itself contain such parts: `3[a2[c]]` is `accaccacc`. When you meet `[`, you start working on an **inner** part, but you must later come back to the **outer** part exactly where you left it. That is a stack.',
        'Keep the current text `cur` and the number `num` that you have read last. On `[`: **push** the pair `(cur, num)` on the stack and start fresh (`cur = ""`, `num = 0`). On `]`: **pop** the saved pair `(prev, k)` and set `cur = prev + cur * k`. A digit extends `num`; a letter extends `cur`.',
        { code: 'stack = []; cur = ""; num = 0\nfor ch in s:\n    if ch.isdigit():    num = num * 10 + int(ch)\n    elif ch == "[":     stack.append((cur, num)); cur = ""; num = 0\n    elif ch == "]":     prev, k = stack.pop(); cur = prev + cur * k\n    else:               cur += ch' },
        'Numbers can have several digits (`12[a]`), which is why `num` is built with `num * 10 + digit`.'
      ]
    },
    statement: ['An encoded word follows the rule `k[text]`: the text inside the brackets is repeated `k` times (`k` is a positive number, which may have several digits). The text inside may contain other encoded parts. Letters outside brackets are copied as they are. Print the decoded word.'],
    inputFormat: ['A single word with lowercase letters, digits and the brackets `[` and `]`. It is valid, and a number always stands directly before a `[`.'],
    outputFormat: ['Print the decoded word.'],
    constraints: ['1 <= length of the encoded word <= 300', 'The decoded word has at most 50000 letters.'],
    examples: [{ input: '3[a2[c]]\n', note: '2[c] is cc, so a2[c] is acc, and three times is accaccacc.' }, { input: '2[ab]x3[c]\n', note: 'ababxccc.' }],
    hints: ['Use a stack of pairs (text so far, repeat count).', 'On `[` save the current text and the number, then start a new text.', 'On `]` take the saved pair and set `cur = saved_text + cur * count`.'],
    program: {
      io: ['s:word'],
      python: r`
        stack = []
        cur = ""
        num = 0
        for ch in s:
            if "0" <= ch <= "9":
                num = num * 10 + int(ch)
            elif ch == "[":
                stack.append((cur, num))
                cur = ""
                num = 0
            elif ch == "]":
                prev, k = stack.pop()
                cur = prev + cur * k
            else:
                cur += ch
        print(cur)`,
      cpp: r`
        vector<pair<string, int>> stack;
        string cur;
        int num = 0;
        for (char ch : s) {
            if (ch >= '0' && ch <= '9') {
                num = num * 10 + (ch - '0');
            } else if (ch == '[') {
                stack.push_back({cur, num});
                cur = "";
                num = 0;
            } else if (ch == ']') {
                string prev = stack.back().first;
                int k = stack.back().second;
                stack.pop_back();
                for (int i = 0; i < k; i++) prev += cur;
                cur = prev;
            } else {
                cur += ch;
            }
        }
        cout << cur << "\n";`,
      java: r`
        Deque<String> texts = new ArrayDeque<>();
        Deque<Integer> counts = new ArrayDeque<>();
        StringBuilder cur = new StringBuilder();
        int num = 0;
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch >= '0' && ch <= '9') {
                num = num * 10 + (ch - '0');
            } else if (ch == '[') {
                texts.push(cur.toString());
                counts.push(num);
                cur = new StringBuilder();
                num = 0;
            } else if (ch == ']') {
                StringBuilder prev = new StringBuilder(texts.pop());
                int k = counts.pop();
                String inner = cur.toString();
                for (int j = 0; j < k; j++) prev.append(inner);
                cur = prev;
            } else {
                cur.append(ch);
            }
        }
        System.out.println(cur);`
    },
    solution: { explanation: ['The stack stores the text and the repeat count of the outer levels. A closing bracket combines the saved text with the repeated inner text.'], complexity: 'Time O(length of the decoded word), space O(length).' },
    solve(input) { return decode(input.trim()); },
    tests() {
      const g = rng(562);
      const gen = (depth) => { let out = ''; const parts = randInt(g, 1, 3); for (let i = 0; i < parts; i++) { if (depth > 0 && g() < 0.5) out += `${randInt(g, 1, depth > 2 ? 9 : 12)}[${gen(depth - 1)}]`; else out += randWord(g, randInt(g, 1, 3), 'abcxyz'); } return out; };
      const build = (depth, lo) => { for (;;) { const s = gen(depth); const d = decode(s); if (s.length <= 300 && d.length <= 50000 && d.length >= lo) return `${s}\n`; } };
      return ['3[a2[c]]\n', '2[ab]x3[c]\n', 'abc\n', '1[a]\n', '10[a]\n', '2[3[a]b]\n', build(2, 1), build(3, 20), build(4, 500), build(5, 5000), '100[2[ab]x]\n', '2[2[2[2[2[2[2[2[2[2[a]]]]]]]]]]\n'];
    }
  },

  {
    slug: 'simplify-file-path',
    title: 'Simplify a File Path',
    difficulty: 'medium',
    tags: ['stack', 'strings', 'parsing'],
    concept: {
      title: 'A path is a stack of folder names',
      body: [
        'A Unix path like `/a/./b/../../c/` means: go into `a`, stay (`.`), go into `b`, go up (`..`), go up again, go into `c`. The result is `/c`. Walking along the path is a stack of folder names: a name is **pushed**, `..` **pops** the last folder (if there is one), and `.` and empty parts (from `//`) are ignored.',
        { code: 'stack = []\nfor part in path.split("/"):\n    if part == "..":\n        if stack: stack.pop()\n    elif part != "" and part != ".":\n        stack.append(part)\nresult = "/" + "/".join(stack)' },
        'Splitting at `/` turns `//` into empty parts, which the loop skips. A name such as `...` or `.a` is an ordinary folder name, not a special one: only exactly `.` and `..` are special. The canonical path starts with one `/`, has single slashes between names and no slash at the end (the root is just `/`).'
      ]
    },
    statement: ['Convert a Unix-style absolute path to its canonical form. `.` means the current folder, `..` means the parent folder (going above the root stays in the root), several slashes in a row count as one slash, and any other name is a folder name (a name such as `...` is a normal name). The canonical path starts with `/`, separates names with a single `/`, and does not end with `/` (except for the root, which is `/`).'],
    inputFormat: ['A single word: the path, starting with `/`. It contains letters, dots and slashes.'],
    outputFormat: ['Print the canonical path.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: '/a/./b/../../c/\n', note: 'The canonical path is /c.' }, { input: '/../\n', note: 'You cannot go above the root: /.' }],
    hints: ['Split the path at `/`.', 'Push normal names, pop on `..` (if the stack is not empty), ignore `.` and empty parts.', 'Join the names with `/` and put one `/` in front.'],
    program: {
      io: ['path:word'],
      python: r`
        stack = []
        for part in path.split("/"):
            if part == "..":
                if stack:
                    stack.pop()
            elif part != "" and part != ".":
                stack.append(part)
        print("/" + "/".join(stack))`,
      cpp: r`
        vector<string> stack;
        string part;
        for (size_t i = 0; i <= path.size(); i++) {
            if (i == path.size() || path[i] == '/') {
                if (part == "..") {
                    if (!stack.empty()) stack.pop_back();
                } else if (!part.empty() && part != ".") {
                    stack.push_back(part);
                }
                part = "";
            } else {
                part += path[i];
            }
        }
        string result;
        for (const string& name : stack) result += "/" + name;
        cout << (result.empty() ? "/" : result) << "\n";`,
      java: r`
        Deque<String> stack = new ArrayDeque<>();
        for (String part : path.split("/")) {
            if (part.equals("..")) {
                if (!stack.isEmpty()) stack.removeLast();
            } else if (!part.isEmpty() && !part.equals(".")) {
                stack.addLast(part);
            }
        }
        StringBuilder sb = new StringBuilder();
        for (String name : stack) sb.append("/").append(name);
        System.out.println(sb.length() == 0 ? "/" : sb.toString());`
    },
    solution: { explanation: ['Folder names are pushed on a stack, `..` pops, and `.` and empty parts are ignored. The canonical path is the names joined with `/`.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const st = []; for (const part of input.trim().split('/')) { if (part === '..') st.pop(); else if (part !== '' && part !== '.') st.push(part); } return '/' + st.join('/'); },
    tests() {
      const g = rng(563);
      const comps = ['a', 'b', 'cc', '..', '.', '...', '', 'dd.e', '..'];
      const path = (n, trailing) => { let p = ''; for (let i = 0; i < n; i++) p += '/' + (g() < 0.2 ? '/' : '') + comps[randInt(g, 0, comps.length - 1)]; return p + (trailing ? '/' : ''); };
      const deep = (n) => '/' + many(n, (i) => 'x' + (i % 10)).join('/') + '/' + '..' + '/..'.repeat(Math.floor(n / 2));
      return ['/a/./b/../../c/\n', '/../\n', '/home/\n', '/home//foo/\n', '/\n', '/...\n', '/a/b/c/../../../..\n', `${path(10, false)}\n`, `${path(200, true)}\n`, `${path(4000, false)}\n`, `${path(4500, true)}\n`, `${deep(3000)}\n`, `/${'a/'.repeat(9999)}\n`];
    }
  },

  {
    slug: 'asteroid-collision',
    title: 'Asteroid Collision',
    difficulty: 'medium',
    tags: ['stack', 'simulation', 'arrays'],
    concept: {
      title: 'A new asteroid fights the ones on top of the stack',
      body: [
        'Asteroids move along a line. A **positive** number moves right, a **negative** number moves left, and the absolute value is the size. All move at the same speed, so two asteroids only meet if a right-moving one is **followed** by a left-moving one. The smaller explodes; at equal sizes both explode; the survivor keeps moving and may meet the next one.',
        'Process them from left to right with a stack of the asteroids that are still alive. A new asteroid that moves left may collide with the **top** of the stack (if the top moves right), and again with the next one, until it explodes or nobody on the stack can stop it.',
        { code: 'for x in asteroids:\n    alive = True\n    while alive and x < 0 and stack and stack[-1] > 0:\n        if stack[-1] < -x: stack.pop()             # the top explodes, x continues\n        elif stack[-1] == -x: stack.pop(); alive = False   # both explode\n        else: alive = False                         # x explodes\n    if alive: stack.append(x)' },
        'Right-moving asteroids (and left-moving ones that meet a left-moving top) never collide with the top, so they are simply pushed.'
      ]
    },
    statement: ['Asteroids are in a row. The absolute value of a number is the size of the asteroid, its sign is the direction (positive: to the right, negative: to the left). All move at the same speed. When two asteroids meet, the smaller one explodes; if they have the same size, both explode; two asteroids moving in the same direction never meet. Print the asteroids that remain, from left to right, or `empty` if none remain.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` non-zero numbers.'],
    outputFormat: ['Print the remaining values on one line, or `empty`.'],
    constraints: ['1 <= n <= 20000', '1 <= |value| <= 10^9'],
    examples: [{ input: '4\n5 10 -5 3\n', note: '10 and -5 meet: -5 explodes. The result is 5 10 3.' }, { input: '3\n8 -8 7\n', note: '8 and -8 both explode: 7 remains.' }],
    hints: ['Keep the asteroids that are still alive on a stack.', 'Only a left-moving asteroid meeting a right-moving top can collide.', 'Repeat the fight with the new top while the new asteroid survives.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        stack = []
        for x in a:
            alive = True
            while alive and x < 0 and stack and stack[-1] > 0:
                if stack[-1] < -x:
                    stack.pop()
                elif stack[-1] == -x:
                    stack.pop()
                    alive = False
                else:
                    alive = False
            if alive:
                stack.append(x)
        print(*(stack if stack else ["empty"]))`,
      cpp: r`
        vector<long long> stack;
        for (int i = 0; i < n; i++) {
            long long x = a[i];
            bool alive = true;
            while (alive && x < 0 && !stack.empty() && stack.back() > 0) {
                if (stack.back() < -x) {
                    stack.pop_back();
                } else if (stack.back() == -x) {
                    stack.pop_back();
                    alive = false;
                } else {
                    alive = false;
                }
            }
            if (alive) stack.push_back(x);
        }
        if (stack.empty()) cout << "empty\n";
        for (size_t i = 0; i < stack.size(); i++) cout << stack[i] << (i + 1 < stack.size() ? " " : "\n");`,
      java: r`
        long[] stack = new long[(int) n];
        int size = 0;
        for (int i = 0; i < n; i++) {
            long x = a[i];
            boolean alive = true;
            while (alive && x < 0 && size > 0 && stack[size - 1] > 0) {
                if (stack[size - 1] < -x) {
                    size--;
                } else if (stack[size - 1] == -x) {
                    size--;
                    alive = false;
                } else {
                    alive = false;
                }
            }
            if (alive) stack[size++] = x;
        }
        StringBuilder sb = new StringBuilder();
        if (size == 0) sb.append("empty");
        for (int i = 0; i < size; i++) sb.append(stack[i]).append(i + 1 < size ? " " : "");
        System.out.println(sb);`
    },
    solution: { explanation: ['The stack holds the surviving asteroids. A new left-moving asteroid destroys smaller right-moving ones on top, or is destroyed by a bigger one, or both explode at equal sizes.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const st = []; for (const x of a) { let alive = true; while (alive && x < 0 && st.length && st[st.length - 1] > 0) { const t = st[st.length - 1]; if (t < -x) st.pop(); else if (t === -x) { st.pop(); alive = false; } else alive = false; } if (alive) st.push(x); } return st.length ? st.join(' ') : 'empty'; },
    tests() {
      const g = rng(564);
      const brute = (i) => { let a = nums(rows(i)[1]); for (;;) { let changed = false; for (let k = 0; k + 1 < a.length; k++) if (a[k] > 0 && a[k + 1] < 0) { const p = a[k], q = -a[k + 1]; if (p > q) a.splice(k + 1, 1); else if (p < q) a.splice(k, 1); else a.splice(k, 2); changed = true; break; } if (!changed) break; } return a.length ? a.join(' ') : 'empty'; };
      const nz = (n, hi) => arr(many(n, () => { let v = 0; while (v === 0) v = randInt(g, -hi, hi); return v; }));
      crossCheck(() => nz(randInt(g, 1, 10), 6), (i) => this.solve(i), brute);
      return ['4\n5 10 -5 3\n', '3\n8 -8 7\n', '2\n10 2\n', '2\n-2 -1\n','3\n10 2 -5\n', nz(30, 9), nz(2000, 1000), nz(20000, 1000000000), nz(20000, 20), arr([...many(10000, (i) => i + 1), ...many(10000, (i) => -(i + 1))]), arr([...many(10000, (i) => -(i + 1)), ...many(10000, (i) => i + 1)])];
    }
  },

  {
    slug: 'remove-k-digits',
    title: 'Remove k Digits for the Smallest Number',
    difficulty: 'medium',
    tags: ['stack', 'greedy', 'strings', 'monotonic-stack'],
    concept: {
      title: 'Remove a digit that is bigger than its right neighbour',
      body: [
        'To make a number as small as possible by deleting `k` digits, look at the digits from left to right. If a digit is **bigger than the digit after it**, deleting the bigger one makes the number smaller (the earlier a digit is smaller, the better). So whenever the next digit is smaller than the last kept digit, **pop** the kept digit (as long as deletions remain). This keeps the digits **increasing**: a monotonic stack.',
        { code: 'stack = []\nfor d in num:\n    while k > 0 and stack and stack[-1] > d:\n        stack.pop(); k -= 1\n    stack.append(d)\nif k > 0: stack = stack[:-k]          # still deletions left: remove from the end\nresult = "".join(stack).lstrip("0") or "0"' },
        'Two details: if deletions are left at the end, the digits are already non-decreasing, so remove the **last** ones. And a result such as `0200` must lose its leading zeros; an empty result is the number `0`.'
      ]
    },
    statement: ['Given a non-negative integer as a string of digits and a number `k`, remove exactly `k` digits so that the remaining number is as small as possible. Print the smallest number without leading zeros (print `0` if no digit remains or all remaining digits are zero).'],
    inputFormat: ['The first line has the number `num`.', 'The second line has `k`.'],
    outputFormat: ['Print the smallest possible number.'],
    constraints: ['1 <= length of num <= 20000', '0 <= k <= length of num', '`num` has no leading zeros, except if it is the single digit 0.'],
    examples: [{ input: '1432219\n3\n', note: 'Remove 4, 3 and 2: 1219.' }, { input: '10200\n1\n', note: 'Remove 1 to get 0200, which is 200.' }],
    hints: ['Remove a digit when the next digit is smaller.', 'Use a stack: pop while the top is bigger than the new digit and deletions remain.', 'Remove leftover deletions from the end, then strip leading zeros.'],
    program: {
      io: ['num:word', 'k:int'],
      python: r`
        stack = []
        for d in num:
            while k > 0 and stack and stack[-1] > d:
                stack.pop()
                k -= 1
            stack.append(d)
        if k > 0:
            stack = stack[:len(stack) - k]
        result = "".join(stack).lstrip("0")
        print(result if result else "0")`,
      cpp: r`
        string stack;
        for (char d : num) {
            while (k > 0 && !stack.empty() && stack.back() > d) {
                stack.pop_back();
                k--;
            }
            stack += d;
        }
        if (k > 0) stack.erase(stack.size() - k);
        size_t start = 0;
        while (start < stack.size() && stack[start] == '0') start++;
        string result = stack.substr(start);
        cout << (result.empty() ? "0" : result) << "\n";`,
      java: r`
        StringBuilder stack = new StringBuilder();
        for (int i = 0; i < num.length(); i++) {
            char d = num.charAt(i);
            while (k > 0 && stack.length() > 0 && stack.charAt(stack.length() - 1) > d) {
                stack.deleteCharAt(stack.length() - 1);
                k--;
            }
            stack.append(d);
        }
        if (k > 0) stack.setLength(stack.length() - (int) k);
        int start = 0;
        while (start < stack.length() && stack.charAt(start) == '0') start++;
        String result = stack.substring(start);
        System.out.println(result.isEmpty() ? "0" : result);`
    },
    solution: { explanation: ['A stack of digits is kept non-decreasing: a digit bigger than the new one is removed while deletions remain. Leftover deletions remove the last digits, and leading zeros are stripped.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const [num, k0] = rows(input); let k = Number(k0); const st = []; for (const d of num) { while (k > 0 && st.length && st[st.length - 1] > d) { st.pop(); k--; } st.push(d); } while (k > 0) { st.pop(); k--; } const res = st.join('').replace(/^0+/, ''); return res || '0'; },
    tests() {
      const g = rng(565);
      const digits = (n) => { const w = randWord(g, n, '0123456789'); return w.replace(/^0+/, '') || '0'; };
      const brute = (i) => { const [num, k0] = rows(i); const k = Number(k0); const n = num.length; let best = null; const go = (idx, removed, cur) => { if (idx === n) { if (removed === k) { const v = cur.replace(/^0+/, '') || '0'; if (best === null || v.length < best.length || (v.length === best.length && v < best)) best = v; } return; } go(idx + 1, removed, cur + num[idx]); if (removed < k) go(idx + 1, removed + 1, cur); }; go(0, 0, ''); return best; };
      crossCheck(() => { const num = digits(randInt(g, 1, 8)); return `${num}\n${randInt(g, 0, num.length)}\n`; }, (i) => this.solve(i), brute);
      return ['1432219\n3\n', '10200\n1\n', '10\n2\n', '9\n1\n', '12345\n2\n', '54321\n2\n', '100\n1\n', `${digits(30)}\n${randInt(g, 0, 25)}\n`, `${digits(20000)}\n10000\n`, `${digits(20000)}\n19999\n`, `${digits(20000)}\n0\n`, `${'9'.repeat(10000)}${'1'.repeat(10000)}\n10000\n`, `${'1'.repeat(10000)}${'0'.repeat(9999)}\n5000\n`];
    }
  },

  {
    slug: 'stock-span',
    title: 'The Stock Span',
    difficulty: 'medium',
    tags: ['stack', 'monotonic-stack', 'arrays'],
    concept: {
      title: 'A stack of (price, span) that merges smaller prices',
      body: [
        'The **span** of a day is the number of consecutive days up to and including today (going back) on which the price was **not higher** than today\'s price. A day with a high price covers all the cheaper days that came just before it.',
        'Keep a stack of pairs `(price, span)`. For a new price `p`, start with `span = 1`. While the top price is `<= p`, **pop** it and add its span: the cheaper days it covered are covered by today too. Then push `(p, span)`.',
        { code: 'stack = []\nfor p in prices:\n    span = 1\n    while stack and stack[-1][0] <= p:\n        span += stack.pop()[1]          # absorb the days covered by the popped price\n    stack.append((p, span))\n    print(span)' },
        'Each pair is pushed and popped once: O(n). The stack never needs the old individual days, because their spans are summed up in one number.'
      ]
    },
    statement: ['The prices of a stock on `n` consecutive days are given. For each day, print its **span**: the number of consecutive days ending today (including today) on which the price was less than or equal to today\'s price.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` prices.'],
    outputFormat: ['Print `n` spans separated by spaces.'],
    constraints: ['1 <= n <= 20000', '1 <= each price <= 10^9'],
    examples: [{ input: '7\n100 80 60 70 60 75 85\n', note: 'The spans are 1 1 1 2 1 4 6.' }],
    hints: ['The span counts the days going back while the price is not higher.', 'Keep a stack of (price, span) pairs.', 'Pop all prices that are at most today\'s price and add their spans to today\'s span.'],
    program: {
      io: ['n:int', 'p:int[n]'],
      fast: true,
      python: r`
        stack = []
        out = []
        for price in p:
            span = 1
            while stack and stack[-1][0] <= price:
                span += stack.pop()[1]
            stack.append((price, span))
            out.append(span)
        print(*out)`,
      cpp: r`
        vector<pair<long long, int>> stack;
        for (int i = 0; i < n; i++) {
            int span = 1;
            while (!stack.empty() && stack.back().first <= p[i]) {
                span += stack.back().second;
                stack.pop_back();
            }
            stack.push_back({p[i], span});
            cout << span << (i + 1 < n ? " " : "\n");
        }`,
      java: r`
        long[] prices = new long[(int) n];
        int[] spans = new int[(int) n];
        int size = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            int span = 1;
            while (size > 0 && prices[size - 1] <= p[i]) {
                size--;
                span += spans[size];
            }
            prices[size] = p[i];
            spans[size] = span;
            size++;
            sb.append(span).append(i + 1 < n ? " " : "\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Each stack entry stores a price with the number of days it covers. A new price pops all entries that are not higher and adds their covered days to its own span.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const p = nums(rows(input)[1]); return p.map((x, i) => { let s = 1; for (let j = i - 1; j >= 0 && p[j] <= x; j--) s++; return s; }).join(' '); },
    tests() { const g = rng(566); return ['7\n100 80 60 70 60 75 85\n', '1\n5\n', '4\n1 2 3 4\n', '4\n4 3 2 1\n', '4\n3 3 3 3\n', arr(randArray(g, 20, 1, 9)), arr(randArray(g, 2000, 1, 1000000000)), arr(randArray(g, 20000, 1, 1000000000)), arr(many(20000, (i) => i + 1)), arr(many(20000, (i) => 20000 - i)), arr(randArray(g, 20000, 1, 3))]; }
  },

  {
    slug: 'car-fleet',
    title: 'Car Fleets',
    difficulty: 'medium',
    tags: ['stack', 'sorting', 'greedy'],
    concept: {
      title: 'A car cannot pass the car in front of it',
      body: [
        'Cars drive to a destination on a one-lane road. A fast car that catches a slower car in front cannot pass: it joins it and drives at the slower speed. A group of cars that arrive together is a **fleet**. The question is how many fleets arrive at the destination.',
        'Sort the cars by position, **starting with the one closest to the destination**. For a car, the time to arrive alone is `(target - position) / speed`. A car forms a **new fleet** exactly when it needs **more time** than the fleet right in front of it (it never catches up). Otherwise it catches up and joins that fleet.',
        { code: 'cars.sort(reverse=True)                  # closest to the target first\nfleets = 0; slowest_time = 0\nfor pos, speed in cars:\n    time = (target - pos) / speed\n    if time > slowest_time:             # it never reaches the fleet in front\n        fleets += 1; slowest_time = time' },
        'To avoid decimals, compare two times with a **cross product**: `(t1 / s1) > (t2 / s2)` is the same as `t1 * s2 > t2 * s1` for positive speeds. The numbers can reach about 10^18, so use 64-bit integers.'
      ]
    },
    statement: ['`n` cars drive on a one-lane road towards a destination at position `target`. Car `i` starts at position `pos[i]` (all different, all less than `target`) and drives with the constant speed `speed[i]`. A car cannot pass another one: if it catches up with a car in front of it, it slows down to its speed and they continue together as a **fleet** (it also counts as catching up if they meet exactly at the destination). Print the number of fleets that arrive at the destination.'],
    inputFormat: ['The first line has `n` and `target`.', 'Each of the next `n` lines has the position and the speed of a car.'],
    outputFormat: ['Print the number of fleets.'],
    constraints: ['1 <= n <= 20000', '1 <= target <= 10^9', '0 <= pos < target, all positions are different', '1 <= speed <= 10^9'],
    examples: [{ input: '5 12\n10 2\n8 4\n0 1\n5 1\n3 3\n', note: 'The cars at 10 and 8 arrive together (one fleet), the cars at 5 and 3 form a second fleet, and the car at 0 arrives alone: 3 fleets.' }],
    hints: ['Sort the cars by position, closest to the target first.', 'A car that needs more time than the fleet in front of it starts a new fleet.', 'Compare times as fractions with a cross product, to stay with integers.'],
    program: {
      io: ['n:int target:int', 'cars:int[n][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        cars.sort(reverse=True)
        fleets = 0
        slowDist, slowSpeed = 0, 1
        for pos, speed in cars:
            dist = target - pos
            if dist * slowSpeed > slowDist * speed:
                fleets += 1
                slowDist, slowSpeed = dist, speed
        print(fleets)`,
      cpp: r`
        sort(cars.begin(), cars.end(), [](const vector<long long>& x, const vector<long long>& y) { return x[0] > y[0]; });
        long long fleets = 0, slowDist = 0, slowSpeed = 1;
        for (int i = 0; i < n; i++) {
            long long dist = target - cars[i][0], speed = cars[i][1];
            if (dist * slowSpeed > slowDist * speed) {
                fleets++;
                slowDist = dist;
                slowSpeed = speed;
            }
        }
        cout << fleets << "\n";`,
      java: r`
        Arrays.sort(cars, (x, y) -> Long.compare(y[0], x[0]));
        long fleets = 0, slowDist = 0, slowSpeed = 1;
        for (int i = 0; i < n; i++) {
            long dist = target - cars[i][0], speed = cars[i][1];
            if (dist * slowSpeed > slowDist * speed) {
                fleets++;
                slowDist = dist;
                slowSpeed = speed;
            }
        }
        System.out.println(fleets);`
    },
    solution: { explanation: ['Going from the car nearest to the destination backwards, a car starts a new fleet exactly when its arrival time is strictly larger than that of the fleet ahead. Times are compared with integer cross products.'], complexity: 'Time O(n log n), space O(1) besides sorting.' },
    solve(input) { const rs = rows(input); const [n, target] = nums(rs[0]); const cars = rs.slice(1, 1 + n).map(nums).sort((p, s) => s[0] - p[0]); let fleets = 0; let slow = null; for (const [pos, speed] of cars) { const d = BigInt(target - pos), s = BigInt(speed); if (slow === null || d * slow[1] > slow[0] * s) { fleets++; slow = [d, s]; } } return String(fleets); },
    tests() {
      const g = rng(567);
      const make = (n, target, maxSpeed) => { const pos = randDistinct(g, n, 0, target - 1); return `${n} ${target}\n${pos.map((p) => `${p} ${randInt(g, 1, maxSpeed)}`).join('\n')}\n`; };
      const brute = (i) => { const rs = rows(i); const [n, target] = nums(rs[0]); const cars = rs.slice(1, 1 + n).map(nums).sort((p, s) => s[0] - p[0]); let eff = []; let prevNum = null; const times = []; for (const [pos, sp] of cars) { let num = BigInt(target - pos), den = BigInt(sp); if (prevNum && prevNum[0] * den > num * prevNum[1]) { num = prevNum[0]; den = prevNum[1]; } prevNum = [num, den]; times.push(`${num}/${den}`); } const reduced = new Set(times.map((t) => { const [a, b] = t.split('/').map(BigInt); const gg = (x, y) => (y === 0n ? x : gg(y, x % y)); const d = gg(a, b); return `${a / d}/${b / d}`; })); return reduced.size; };
      crossCheck(() => make(randInt(g, 1, 8), randInt(g, 9, 30), 6), (i) => this.solve(i), brute);
      return ['5 12\n10 2\n8 4\n0 1\n5 1\n3 3\n', '1 10\n3 3\n', '2 10\n0 2\n4 1\n', '2 10\n6 1\n0 2\n', make(20, 100, 10), make(2000, 1000000, 100), make(20000, 1000000000, 1000000000), make(20000, 1000000000, 5), make(20000, 20001, 1000000000), `20000 1000000000\n${many(20000, (i) => `${i} ${20000 - i}`).join('\n')}\n`];
    }
  },

  {
    slug: 'remove-adjacent-k-duplicates',
    title: 'Remove k Equal Neighbours',
    difficulty: 'medium',
    tags: ['stack', 'strings', 'counting'],
    concept: {
      title: 'A stack of runs: letter and how often it repeats',
      body: [
        'Now you remove **`k` equal neighbouring letters** at once (not just two), again and again. Store the letters on the stack together with the **length of the current run**: pairs `(letter, count)`. A new letter equal to the top letter increases the top count; when the count reaches `k`, the whole run is removed (**pop**). A different letter starts a new pair `(letter, 1)`.',
        { code: 'stack = []                                  # pairs [letter, count]\nfor ch in s:\n    if stack and stack[-1][0] == ch:\n        stack[-1][1] += 1\n        if stack[-1][1] == k: stack.pop()\n    else:\n        stack.append([ch, 1])\nresult = "".join(c * n for c, n in stack)' },
        'After a run is removed, the two neighbours of the removed part become neighbours, and the next letter is compared with the new top pair: if it is the same letter, it continues that run. This is what makes the stack of runs correct. The stack also keeps the memory small.'
      ]
    },
    statement: ['Repeat the following step as long as possible: choose `k` equal letters that stand next to each other and remove them. Print the final word, or `empty` if no letter remains. The result does not depend on the order of the choices.'],
    inputFormat: ['The first line has `k`.', 'The second line has the word.'],
    outputFormat: ['Print the final word, or `empty`.'],
    constraints: ['2 <= k <= 100', '1 <= length of the word <= 20000', 'The word contains lowercase letters.'],
    examples: [{ input: '3\ndeeedbbcccbdaa\n', note: 'Remove eee, then ccc, then bbb, then ddd: aa remains.' }],
    hints: ['Keep pairs (letter, count) on a stack.', 'If the new letter equals the top letter, add one to its count; remove the pair when the count reaches k.', 'Rebuild the word by repeating every letter as often as its count says.'],
    program: {
      io: ['k:int', 's:word'],
      python: r`
        stack = []
        for ch in s:
            if stack and stack[-1][0] == ch:
                stack[-1][1] += 1
                if stack[-1][1] == k:
                    stack.pop()
            else:
                stack.append([ch, 1])
        result = "".join(c * m for c, m in stack)
        print(result if result else "empty")`,
      cpp: r`
        vector<pair<char, int>> stack;
        for (char ch : s) {
            if (!stack.empty() && stack.back().first == ch) {
                stack.back().second++;
                if (stack.back().second == k) stack.pop_back();
            } else {
                stack.push_back({ch, 1});
            }
        }
        string result;
        for (auto& entry : stack) result += string(entry.second, entry.first);
        cout << (result.empty() ? "empty" : result) << "\n";`,
      java: r`
        char[] letters = new char[s.length()];
        int[] runs = new int[s.length()];
        int size = 0;
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (size > 0 && letters[size - 1] == ch) {
                runs[size - 1]++;
                if (runs[size - 1] == k) size--;
            } else {
                letters[size] = ch;
                runs[size] = 1;
                size++;
            }
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < runs[i]; j++) sb.append(letters[i]);
        }
        System.out.println(sb.length() == 0 ? "empty" : sb.toString());`
    },
    solution: { explanation: ['The stack stores runs as (letter, count). A run that reaches `k` is removed, and the letters around it continue as neighbours.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const [k0, s] = rows(input); const k = Number(k0); const st = []; for (const ch of s) { if (st.length && st[st.length - 1][0] === ch) { st[st.length - 1][1]++; if (st[st.length - 1][1] === k) st.pop(); } else st.push([ch, 1]); } const res = st.map(([c, m]) => c.repeat(m)).join(''); return res || 'empty'; },
    tests() {
      const g = rng(568);
      const brute = (i) => { const [k0, s0] = rows(i); const k = Number(k0); let s = s0; for (;;) { let found = false; for (let p = 0; p + k <= s.length; p++) { let same = true; for (let q = 1; q < k; q++) if (s[p + q] !== s[p]) same = false; if (same) { s = s.slice(0, p) + s.slice(p + k); found = true; break; } } if (!found) break; } return s || 'empty'; };
      crossCheck(() => `${randInt(g, 2, 4)}\n${randWord(g, randInt(g, 1, 14), 'ab')}\n`, (i) => this.solve(i), brute);
      return ['3\ndeeedbbcccbdaa\n', '2\nabbaca\n', '2\na\n', '3\naaa\n', '5\naaaa\n', `3\n${randWord(g, 30, 'ab')}\n`, `2\n${randWord(g, 2000, 'abc')}\n`, `3\n${randWord(g, 20000, 'ab')}\n`, `100\n${'a'.repeat(20000)}\n`, `7\n${'ab'.repeat(10000)}\n`, `2\n${'a'.repeat(10000)}${'b'.repeat(10000)}\n`];
    }
  },

  {
    slug: 'next-greater-element-circular',
    title: 'Next Greater Element on a Circle',
    difficulty: 'medium',
    tags: ['stack', 'monotonic-stack', 'circular-array'],
    concept: {
      title: 'Go around the circle twice',
      body: [
        'The array is **circular**: after the last element comes the first one again. The next greater element of an element may therefore be **before** it in the array, found after wrapping around.',
        'The simplest trick: walk through the indexes **twice**, `i = 0, 1, ..., 2n - 1`, and use `i % n` for the element. Push an index only during the **first** round (so that every element is pushed once); in both rounds, pop waiting elements that are smaller than the current one and give them this value as their answer.',
        { code: 'res = [-1] * n\nstack = []\nfor i in range(2 * n):\n    x = a[i % n]\n    while stack and a[stack[-1]] < x:\n        res[stack.pop()] = x\n    if i < n:\n        stack.append(i)' },
        'Elements that are still waiting after two rounds have no greater element at all (they are maxima), and keep -1.'
      ]
    },
    statement: ['The numbers of an array are arranged on a circle (the element after the last one is the first one). For each element, print the first greater element you meet when you go forward around the circle, or -1 if there is none.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '3\n1 2 1\n', note: 'After 1 comes 2; after 2 nothing is greater (-1); the last 1 wraps around to the first 1, then reaches 2.' }],
    hints: ['Go through the array twice with `i % n`.', 'Only push indexes during the first round.', 'Elements still on the stack at the end keep the answer -1.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        res = [-1] * n
        stack = []
        for i in range(2 * n):
            x = a[i % n]
            while stack and a[stack[-1]] < x:
                res[stack.pop()] = x
            if i < n:
                stack.append(i)
        print(*res)`,
      cpp: r`
        vector<long long> res(n, -1);
        vector<int> stack;
        for (int i = 0; i < 2 * n; i++) {
            long long x = a[i % n];
            while (!stack.empty() && a[stack.back()] < x) {
                res[stack.back()] = x;
                stack.pop_back();
            }
            if (i < n) stack.push_back(i);
        }
        for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        int m = (int) n;
        long[] res = new long[m];
        Arrays.fill(res, -1);
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < 2 * m; i++) {
            long x = a[i % m];
            while (!stack.isEmpty() && a[stack.peek()] < x) res[stack.pop()] = x;
            if (i < m) stack.push(i);
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < m; i++) sb.append(res[i]).append(i + 1 < m ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Walking around the circle twice lets every element see all others. Indexes are pushed in the first round only; waiting elements are answered by the first greater value in either round.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const n = a.length; return a.map((x, i) => { for (let d = 1; d < n; d++) if (a[(i + d) % n] > x) return a[(i + d) % n]; return -1; }).join(' '); },
    tests() { const g = rng(569); return ['3\n1 2 1\n', '1\n7\n', '4\n4 4 4 4\n', '4\n1 2 3 4\n', '4\n4 3 2 1\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 2000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(many(20000, (i) => i)), arr(many(20000, (i) => 20000 - i)), arr(randArray(g, 20000, 0, 3))]; }
  }
];

function decode(s) {
  const st = []; let cur = ''; let num = 0;
  for (const ch of s) { if (ch >= '0' && ch <= '9') num = num * 10 + Number(ch); else if (ch === '[') { st.push([cur, num]); cur = ''; num = 0; } else if (ch === ']') { const [prev, k] = st.pop(); cur = prev + cur.repeat(k); } else cur += ch; }
  return cur;
}
