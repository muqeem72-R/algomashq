import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randDistinct, randWord } from '../../lib.mjs';
import { listProgram } from '../../scaffolds.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const MOD = 1000000007n;
const show = (a) => (a.length ? a : 'empty');
const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };

// A random balanced bracket word of the given length (even).
function balanced(g, len) {
  const out = []; let open = 0;
  for (let i = 0; i < len; i++) {
    const remaining = len - i;
    if (open > 0 && (open >= remaining || g() < 0.5)) { out.push(')'); open--; } else { out.push('('); open++; }
  }
  return out.join('');
}

export default [
  {
    slug: 'sum-of-subarray-minimums',
    title: 'Sum of the Minimums of All Blocks',
    difficulty: 'medium',
    tags: ['stack', 'monotonic-stack', 'counting', 'arrays'],
    concept: {
      title: 'Count in how many blocks an element is the minimum',
      body: [
        'A block (consecutive part) of the array has one minimum. Instead of looking at every block, ask for **each element**: in how many blocks is it the minimum? If `left` is the number of choices for the start of such a block and `right` the number of choices for its end, the element contributes `a[i] * left * right` to the sum.',
        'The block can extend to the left until it meets a smaller element, and to the right until it meets a smaller element. Both distances come from **monotonic stacks**. A detail is needed for **equal** values: let the left side stop at an element that is **less than or equal**, and the right side stop only at a **strictly smaller** element. Then a block with several equal minimums is counted once, for its leftmost minimum.',
        { code: 'left[i]  = i - (index of the previous element <= a[i])      # stack popped while top > a[i]\nright[i] = (index of the next element < a[i]) - i          # stack popped while top >= a[i]\ntotal = sum(a[i] * left[i] * right[i])' },
        'The total can be huge, so the answer is printed modulo 1000000007.'
      ]
    },
    statement: ['Consider every block of consecutive elements of an array (there are `n * (n + 1) / 2` of them). Print the sum of the minimum values of all these blocks, modulo 1000000007.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the sum modulo 1000000007.'],
    constraints: ['1 <= n <= 20000', '1 <= each number <= 30000'],
    examples: [{ input: '4\n3 1 2 4\n', note: 'The block minimums are 3, 1, 2, 4, 1, 1, 2, 1, 1, 1: the sum is 17.' }],
    hints: ['For each element count the blocks in which it is the smallest.', 'Use a monotonic stack to find how far the block can reach to the left and to the right.', 'Break ties: the left side stops at an element that is less or equal, the right side at a strictly smaller element.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        MOD = 10**9 + 7
        left = [0] * n
        right = [0] * n
        stack = []
        for i in range(n):
            while stack and a[stack[-1]] > a[i]:
                stack.pop()
            left[i] = i - (stack[-1] if stack else -1)
            stack.append(i)
        stack = []
        for i in range(n - 1, -1, -1):
            while stack and a[stack[-1]] >= a[i]:
                stack.pop()
            right[i] = (stack[-1] if stack else n) - i
            stack.append(i)
        print(sum(a[i] * left[i] * right[i] for i in range(n)) % MOD)`,
      cpp: r`
        const long long MOD = 1000000007LL;
        vector<long long> left(n), right(n);
        vector<int> stack;
        for (int i = 0; i < n; i++) {
            while (!stack.empty() && a[stack.back()] > a[i]) stack.pop_back();
            left[i] = i - (stack.empty() ? -1 : stack.back());
            stack.push_back(i);
        }
        stack.clear();
        for (int i = n - 1; i >= 0; i--) {
            while (!stack.empty() && a[stack.back()] >= a[i]) stack.pop_back();
            right[i] = (stack.empty() ? n : stack.back()) - i;
            stack.push_back(i);
        }
        long long total = 0;
        for (int i = 0; i < n; i++) total = (total + a[i] * left[i] % MOD * right[i]) % MOD;
        cout << total << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        int m = (int) n;
        long[] left = new long[m], right = new long[m];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < m; i++) {
            while (!stack.isEmpty() && a[stack.peek()] > a[i]) stack.pop();
            left[i] = i - (stack.isEmpty() ? -1 : stack.peek());
            stack.push(i);
        }
        stack.clear();
        for (int i = m - 1; i >= 0; i--) {
            while (!stack.isEmpty() && a[stack.peek()] >= a[i]) stack.pop();
            right[i] = (stack.isEmpty() ? m : stack.peek()) - i;
            stack.push(i);
        }
        long total = 0;
        for (int i = 0; i < m; i++) total = (total + a[i] * left[i] % MOD * right[i]) % MOD;
        System.out.println(total);`
    },
    solution: { explanation: ['Each element is the minimum of `left * right` blocks. Two monotonic stacks give `left` and `right`, with ties broken so that a block with equal minimums is counted once.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { return String(fastMins(nums(rows(input)[1]))); },
    tests() {
      const g = rng(571);
      const brute = (a) => { let t = 0n; for (let i = 0; i < a.length; i++) { let m = Infinity; for (let j = i; j < a.length; j++) { m = Math.min(m, a[j]); t += BigInt(m); } } return String(t % MOD); };
      for (let k = 0; k < 200; k++) { const a = randArray(g, randInt(g, 1, 12), 1, 5); if (brute(a) !== String(fastMins(a))) throw new Error('subarray-minimum reference differs from brute force'); }
      return ['4\n3 1 2 4\n', '1\n5\n', '3\n2 2 2\n', '4\n1 2 3 4\n', '4\n4 3 2 1\n', arr(randArray(g, 20, 1, 9)), arr(randArray(g, 2000, 1, 30000)), arr(randArray(g, 20000, 1, 30000)), arr(many(20000, (i) => (i % 30000) + 1)), arr(many(20000, (i) => 30000 - (i % 30000))), arr(Array(20000).fill(30000)), arr(randArray(g, 20000, 1, 3))];
    }
  },

  {
    slug: 'score-of-parentheses',
    title: 'The Score of a Balanced Word',
    difficulty: 'medium',
    tags: ['stack', 'parentheses', 'recursion-to-stack'],
    concept: {
      title: 'A stack of scores, one for every open level',
      body: [
        'The score of a balanced word of parentheses follows three rules: `()` has score 1; `AB` (two balanced words next to each other) has score `A + B`; `(A)` has score `2 * A`. This is a recursive definition, and recursion can be replaced by a **stack of scores**: the top of the stack is the score collected so far at the **current level**.',
        { code: 'stack = [0]                                  # score of the level we are in\nfor ch in s:\n    if ch == "(":\n        stack.append(0)                      # a new inner level starts\n    else:\n        inner = stack.pop()                  # the score of what was inside\n        stack[-1] += max(2 * inner, 1)       # "()" counts 1, "(A)" counts 2 * A\nanswer = stack[0]' },
        'When `)` closes a level, the inner score is 0 for `()` (which counts 1) and `A` otherwise (which counts `2 * A`); `max(2 * inner, 1)` covers both. The score can be astronomically large for deep nesting, so it is printed modulo 1000000007 (take the modulo after every step).'
      ]
    },
    statement: ['A balanced word of parentheses has a score: `()` has score 1, two balanced words `AB` next to each other have the score `A + B`, and `(A)` has the score `2 * A`. Print the score of the given word modulo 1000000007.'],
    inputFormat: ['A single balanced word of `(` and `)`.'],
    outputFormat: ['Print the score modulo 1000000007.'],
    constraints: ['2 <= length <= 20000'],
    examples: [{ input: '(()(()))\n', note: '(()(())) = 2 * ( () + (()) ) = 2 * (1 + 2) = 6.' }],
    hints: ['Keep a stack with the score of every level that is open.', 'On `(` push 0; on `)` pop the inner score and add `max(2 * inner, 1)` to the new top.', 'Take everything modulo 1000000007.'],
    program: {
      io: ['s:word'],
      includes: ['<algorithm>'],
      python: r`
        MOD = 10**9 + 7
        stack = [0]
        for ch in s:
            if ch == "(":
                stack.append(0)
            else:
                inner = stack.pop()
                stack[-1] = (stack[-1] + max(2 * inner, 1)) % MOD
        print(stack[0] % MOD)`,
      cpp: r`
        const long long MOD = 1000000007LL;
        vector<long long> stack = {0};
        for (char ch : s) {
            if (ch == '(') {
                stack.push_back(0);
            } else {
                long long inner = stack.back();
                stack.pop_back();
                stack.back() = (stack.back() + max(2 * inner % MOD, 1LL)) % MOD;
            }
        }
        cout << stack[0] % MOD << "\n";`,
      java: r`
        final long MOD = 1000000007L;
        long[] stack = new long[s.length() + 1];
        int size = 1;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') {
                stack[size++] = 0;
            } else {
                long inner = stack[--size];
                stack[size - 1] = (stack[size - 1] + Math.max(2 * inner % MOD, 1)) % MOD;
            }
        }
        System.out.println(stack[0] % MOD);`
    },
    solution: { explanation: ['The stack keeps the score collected at every open level. Closing a level adds `max(2 * inner, 1)` to the level below.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const s = input.trim(); let depth = 0; let t = 0n; let pow = [1n]; for (let i = 0; i < 20001; i++) pow.push((pow[i] * 2n) % MOD); for (let i = 0; i < s.length; i++) { if (s[i] === '(') { if (s[i + 1] === ')') t += pow[depth]; depth++; } else depth--; } return String(t % MOD); },
    tests() { const g = rng(572); const nest = (n) => '('.repeat(n) + ')'.repeat(n); return ['(()(()))\n', '()\n', '(())\n', '()()\n', '(()())\n', `${balanced(g, 30)}\n`, `${balanced(g, 2000)}\n`, `${balanced(g, 20000)}\n`, `${nest(10000)}\n`, `${'()'.repeat(10000)}\n`, `${'(()'.repeat(3000) + ')'.repeat(3000)}\n`, `${nest(60)}${'()'.repeat(50)}\n`]; }
  },

  {
    slug: 'minimum-removals-for-valid-parentheses',
    title: 'Remove Parentheses to Make the Text Valid',
    difficulty: 'medium',
    tags: ['stack', 'strings', 'parentheses', 'greedy'],
    concept: {
      title: 'Match brackets with a stack of positions, and delete the rest',
      body: [
        'The text has letters and parentheses. Remove the **fewest** parentheses so that the parentheses in the rest are valid (every `(` is closed by a `)`, and no `)` stands without an open `(`). Which brackets have to go? Exactly the ones that **cannot be matched**.',
        'Match them with a stack of the **positions** of the open brackets. On `(` push the position. On `)`: if the stack is not empty, pop it (they are a pair); if it is empty, this `)` has no partner and must be removed. After the scan, the positions still on the stack are `(` without a partner and are removed too.',
        { code: 'remove = set(); stack = []\nfor i, ch in enumerate(s):\n    if ch == "(":\n        stack.append(i)\n    elif ch == ")":\n        if stack: stack.pop()\n        else: remove.add(i)           # unmatched closing bracket\nremove.update(stack)                  # unmatched opening brackets\nresult = "".join(c for i, c in enumerate(s) if i not in remove)' },
        'This choice is also unique: in `a)b(c`, the `)` and the `(` are both unmatched, so they are the ones to remove.'
      ]
    },
    statement: ['A text consists of lowercase letters and the parentheses `(` and `)`. Remove the smallest number of parentheses so that the parentheses of the remaining text are valid. The brackets to remove are the ones that cannot be matched: a `)` with no unclosed `(` before it, and a `(` that is never closed. Print the remaining text, or `empty` if nothing remains.'],
    inputFormat: ['A single word.'],
    outputFormat: ['Print the remaining text, or `empty`.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'lee(t(c)o)de)\n', note: 'The last ) has no partner: lee(t(c)o)de.' }, { input: 'a)b(c)d\n', note: 'Only the first ) has no partner: the result is ab(c)d.' }],
    hints: ['Use a stack with the positions of the open brackets.', 'A closing bracket pops a position; if the stack is empty, mark the bracket for removal.', 'Brackets left on the stack at the end are unmatched: remove them as well.'],
    program: {
      io: ['s:word'],
      python: r`
        remove = set()
        stack = []
        for i, ch in enumerate(s):
            if ch == "(":
                stack.append(i)
            elif ch == ")":
                if stack:
                    stack.pop()
                else:
                    remove.add(i)
        remove.update(stack)
        result = "".join(c for i, c in enumerate(s) if i not in remove)
        print(result if result else "empty")`,
      cpp: r`
        vector<bool> remove(s.size(), false);
        vector<int> stack;
        for (int i = 0; i < (int) s.size(); i++) {
            if (s[i] == '(') {
                stack.push_back(i);
            } else if (s[i] == ')') {
                if (!stack.empty()) stack.pop_back();
                else remove[i] = true;
            }
        }
        for (int i : stack) remove[i] = true;
        string result;
        for (int i = 0; i < (int) s.size(); i++) {
            if (!remove[i]) result += s[i];
        }
        cout << (result.empty() ? "empty" : result) << "\n";`,
      java: r`
        boolean[] remove = new boolean[s.length()];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch == '(') {
                stack.push(i);
            } else if (ch == ')') {
                if (!stack.isEmpty()) stack.pop();
                else remove[i] = true;
            }
        }
        for (int i : stack) remove[i] = true;
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            if (!remove[i]) result.append(s.charAt(i));
        }
        System.out.println(result.length() == 0 ? "empty" : result.toString());`
    },
    solution: { explanation: ['Matching pairs are found with a stack of positions. Closing brackets that meet an empty stack and opening brackets left on the stack are the unmatched ones, and are removed.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const s = input.trim(); const remove = new Set(); const st = []; for (let i = 0; i < s.length; i++) { if (s[i] === '(') st.push(i); else if (s[i] === ')') { if (st.length) st.pop(); else remove.add(i); } } for (const i of st) remove.add(i); return show([...s].filter((_, i) => !remove.has(i)).join('')); },
    tests() { const g = rng(573); const mix = (n) => randWord(g, n, 'ab(()))('); return ['lee(t(c)o)de)\n', 'a)b(c)d\n', '))((\n', '(a(b(c)d)\n', 'abc\n', '()\n', `${mix(30)}\n`, `${mix(2000)}\n`, `${mix(20000)}\n`, `${randWord(g, 20000, '()')}\n`, `${'('.repeat(10000)}${')'.repeat(10000)}\n`, `${')'.repeat(10000)}${'('.repeat(10000)}\n`]; }
  },

  {
    slug: 'validate-stack-sequences',
    title: 'Is This Pop Order Possible?',
    difficulty: 'medium',
    tags: ['stack', 'simulation'],
    concept: {
      title: 'Simulate the stack and pop whenever you can',
      body: [
        'Numbers are pushed on an empty stack in the order of the first list, and at any time you may pop the top. Is the second list a possible **order of the pops**? You can simply **simulate** it: push the numbers in order, and after each push **pop as long as the top equals the next number that has to be popped**.',
        { code: 'stack = []; j = 0\nfor x in pushed:\n    stack.append(x)\n    while stack and stack[-1] == popped[j]:    # pop greedily\n        stack.pop(); j += 1\nreturn not stack' },
        'Popping as early as possible is always safe: if the top is the number you need next, no other order can use it later without blocking. At the end, the order is possible exactly when the stack is empty (everything could be popped in the required order).'
      ]
    },
    statement: ['The distinct numbers of the first list are pushed on an empty stack in this order. Between the pushes (and after the last one) any number of pops may be done. Print `yes` if the numbers of the second list can be the numbers that are popped, in this order, so that the stack ends up empty; otherwise print `no`. The second list contains the same numbers as the first one.'],
    inputFormat: ['The first line has `n`.', 'The second line has the pushed numbers.', 'The third line has the popped numbers.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20000', 'All numbers are different, between 0 and 10^9; the second list is a permutation of the first one.'],
    examples: [{ input: '5\n1 2 3 4 5\n4 5 3 2 1\n', note: 'Push 1 2 3 4, pop 4, push 5, pop 5 3 2 1.' }, { input: '5\n1 2 3 4 5\n4 3 5 1 2\n', note: 'After popping 4 3 5 the top is 2, but 1 is needed: impossible.' }],
    hints: ['Simulate: push the next number, then pop while the top is the number you need.', 'Keep an index into the popped list.', 'The answer is yes when the stack is empty at the end.'],
    program: {
      io: ['n:int', 'pushed:int[n]', 'popped:int[n]'],
      fast: true,
      python: r`
        stack = []
        j = 0
        for x in pushed:
            stack.append(x)
            while stack and stack[-1] == popped[j]:
                stack.pop()
                j += 1
        print("yes" if not stack else "no")`,
      cpp: r`
        vector<long long> stack;
        int j = 0;
        for (int i = 0; i < n; i++) {
            stack.push_back(pushed[i]);
            while (!stack.empty() && stack.back() == popped[j]) {
                stack.pop_back();
                j++;
            }
        }
        cout << (stack.empty() ? "yes" : "no") << "\n";`,
      java: r`
        Deque<Long> stack = new ArrayDeque<>();
        int j = 0;
        for (int i = 0; i < n; i++) {
            stack.push(pushed[i]);
            while (!stack.isEmpty() && stack.peek() == popped[j]) {
                stack.pop();
                j++;
            }
        }
        System.out.println(stack.isEmpty() ? "yes" : "no");`
    },
    solution: { explanation: ['The stack is simulated: after every push the top is popped while it equals the next required number. If the stack is empty at the end, the order is possible.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const rs = rows(input); const a = nums(rs[1]), b = nums(rs[2]); const st = []; let j = 0; for (const x of a) { st.push(x); while (st.length && st[st.length - 1] === b[j]) { st.pop(); j++; } } return st.length ? 'no' : 'yes'; },
    tests() {
      const g = rng(574);
      const validOrder = (a) => { const st = []; const out = []; for (const x of a) { st.push(x); while (st.length && g() < 0.5) out.push(st.pop()); } while (st.length) out.push(st.pop()); return out; };
      const build = (n, valid) => { const a = shuffle(g, randDistinct(g, n, 0, 1000000000)); let b = valid ? validOrder(a) : shuffle(g, a); return `${n}\n${a.join(' ')}\n${b.join(' ')}\n`; };
      const brute = (input) => { const rs = rows(input); const a = nums(rs[1]), b = nums(rs[2]); const go = (i, st, j) => { if (j === b.length) return true; if (st.length && st[st.length - 1] === b[j] && go(i, st.slice(0, -1), j + 1)) return true; if (i < a.length && go(i + 1, [...st, a[i]], j)) return true; return false; }; return go(0, [], 0) ? 'yes' : 'no'; };
      crossCheck(() => build(randInt(g, 1, 7), g() < 0.5), (i) => this.solve(i), brute);
      return ['5\n1 2 3 4 5\n4 5 3 2 1\n', '5\n1 2 3 4 5\n4 3 5 1 2\n', '1\n7\n7\n', '2\n1 2\n1 2\n', '2\n1 2\n2 1\n', build(20, true), build(20, false), build(2000, true), build(20000, true), build(20000, false), `20000\n${many(20000, (i) => i).join(' ')}\n${many(20000, (i) => 19999 - i).join(' ')}\n`, `20000\n${many(20000, (i) => i).join(' ')}\n${many(20000, (i) => i).join(' ')}\n`];
    }
  },

  {
    slug: 'smallest-subsequence-of-distinct-letters',
    title: 'Smallest Word With Every Letter Once',
    difficulty: 'medium',
    tags: ['stack', 'greedy', 'strings', 'monotonic-stack'],
    concept: {
      title: 'Keep the stack increasing, but never lose the last copy of a letter',
      body: [
        'You must choose a subsequence of the word that contains **each distinct letter exactly once** and is as small as possible in alphabetical order. A greedy idea: we want small letters early. When a new letter `ch` arrives, a bigger letter on top of the stack can be **popped** (replaced by the smaller `ch`) if that bigger letter occurs **again later** in the word, because then it is not lost.',
        'Prepare `last[c]`, the position of the last occurrence of every letter. Keep a stack and a set `in_stack`. For each position `i` with letter `ch`: if `ch` is already in the stack, skip it. Otherwise pop while the top is bigger than `ch` **and** its last occurrence is after `i`; then push `ch`.',
        { code: 'for i, ch in enumerate(s):\n    if ch in in_stack: continue\n    while stack and stack[-1] > ch and last[stack[-1]] > i:\n        in_stack.remove(stack.pop())\n    stack.append(ch); in_stack.add(ch)' },
        'Each letter is pushed and popped a limited number of times, so the loop is linear. The answer is the content of the stack.'
      ]
    },
    statement: ['Given a word of lowercase letters, find the lexicographically smallest word that is a subsequence of it and contains every different letter of the word exactly once. Print that word.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the word.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'cbacdcbc\n', note: 'The letters are a, b, c, d: the smallest word is acdb.' }, { input: 'bcabc\n', note: 'abc.' }],
    hints: ['Remember the last position of each letter.', 'Skip a letter that is already in the stack.', 'Pop bigger letters from the top while they appear again later.'],
    program: {
      io: ['s:word'],
      python: r`
        last = {ch: i for i, ch in enumerate(s)}
        stack = []
        inStack = set()
        for i, ch in enumerate(s):
            if ch in inStack:
                continue
            while stack and stack[-1] > ch and last[stack[-1]] > i:
                inStack.remove(stack.pop())
            stack.append(ch)
            inStack.add(ch)
        print("".join(stack))`,
      cpp: r`
        int last[26];
        for (int i = 0; i < (int) s.size(); i++) last[s[i] - 'a'] = i;
        string stack;
        bool inStack[26] = {false};
        for (int i = 0; i < (int) s.size(); i++) {
            char ch = s[i];
            if (inStack[ch - 'a']) continue;
            while (!stack.empty() && stack.back() > ch && last[stack.back() - 'a'] > i) {
                inStack[stack.back() - 'a'] = false;
                stack.pop_back();
            }
            stack += ch;
            inStack[ch - 'a'] = true;
        }
        cout << stack << "\n";`,
      java: r`
        int[] last = new int[26];
        for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i;
        StringBuilder stack = new StringBuilder();
        boolean[] inStack = new boolean[26];
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (inStack[ch - 'a']) continue;
            while (stack.length() > 0 && stack.charAt(stack.length() - 1) > ch && last[stack.charAt(stack.length() - 1) - 'a'] > i) {
                inStack[stack.charAt(stack.length() - 1) - 'a'] = false;
                stack.deleteCharAt(stack.length() - 1);
            }
            stack.append(ch);
            inStack[ch - 'a'] = true;
        }
        System.out.println(stack);`
    },
    solution: { explanation: ['A bigger letter on top of the stack is replaced by a smaller new letter only if the bigger one occurs again later. Letters already in the stack are skipped.'], complexity: 'Time O(n), space O(26).' },
    solve(input) { const s = input.trim(); const need = new Set(s); let result = ''; let start = 0; while (need.size) { for (const c of [...need].sort()) { const pos = s.indexOf(c, start); const suffix = s.slice(pos); if ([...need].every((x) => suffix.includes(x))) { result += c; need.delete(c); start = pos + 1; break; } } } return result; },
    tests() {
      const g = rng(575);
      const brute = (i) => { const s = i.trim(); const distinct = new Set(s).size; let best = null; const n = s.length; const go = (idx, cur, used) => { if (cur.length === distinct) { if (best === null || cur < best) best = cur; return; } if (idx === n) return; if (!used.has(s[idx])) go(idx + 1, cur + s[idx], new Set([...used, s[idx]])); go(idx + 1, cur, used); }; go(0, '', new Set()); return best; };
      crossCheck(() => `${randWord(g, randInt(g, 1, 10), 'abcd')}\n`, (i) => this.solve(i), brute);
      return ['cbacdcbc\n', 'bcabc\n', 'a\n', 'aaa\n', 'zyx\n', 'abacb\n', `${randWord(g, 30, 'abcde')}\n`, `${randWord(g, 2000, 'abcdefghij')}\n`, `${randWord(g, 20000, LOW)}\n`, `${LOW.split('').reverse().join('').repeat(769)}\n`, `${'a'.repeat(10000)}${'b'.repeat(10000)}\n`, `${LOW.repeat(769)}\n`];
    }
  },

  {
    slug: 'exclusive-time-of-functions',
    title: 'Exclusive Running Time of Functions',
    difficulty: 'medium',
    tags: ['stack', 'simulation', 'parsing', 'call-stack'],
    concept: {
      title: 'The call stack: the running function is on top',
      body: [
        'Functions call other functions, and a program keeps track of this with a **call stack**: the function that is running is on the top. The log tells when a function **starts** or **ends** (`id:start:time` or `id:end:time`; an end at time `t` includes the whole time unit `t`). You want, for every function, its **exclusive time**: the time it ran itself, without the time of the functions it called.',
        'Keep the stack of running function ids and the time `prev` from which the top function runs undisturbed. When a function **starts** at `t`: the function on top (if any) ran from `prev` to `t`, so add `t - prev` to it; push the new one; `prev = t`. When a function **ends** at `t`: it ran from `prev` to the end of `t`, so add `t - prev + 1`; pop it; `prev = t + 1`.',
        { code: 'if kind == "start":\n    if stack: time[stack[-1]] += t - prev\n    stack.append(id); prev = t\nelse:\n    time[stack.pop()] += t - prev + 1\n    prev = t + 1' },
        'The `+ 1` at the end and `prev = t + 1` come from the rule that the end time is inclusive: a function that starts at 0 and ends at 0 ran for one unit.'
      ]
    },
    statement: ['A single thread runs `n` functions with ids `0` to `n - 1`. A function can call other functions, and the call can be nested. You get a log of `m` lines in the form `id:start:time` or `id:end:time` in order of time. A function ends at the **end** of the time unit `time` (so a function that starts and ends at the same time unit ran for 1 unit). The exclusive time of a function is the time it ran, not counting the time of the functions it called. Print the exclusive time of every function.'],
    inputFormat: ['The first line has `n` and `m`.', 'The second line has the `m` log entries.'],
    outputFormat: ['Print `n` numbers: the exclusive time of function 0, 1, ..., n - 1.'],
    constraints: ['1 <= n <= 1000', '2 <= m <= 20000 (m is even)', '0 <= time <= 10^9', 'The log is valid: every start has a matching end, calls are nested, and the time never goes back (after an end at time `t`, the next event has a time of at least `t + 1`).'],
    examples: [{ input: '2 4\n0:start:0 1:start:2 1:end:5 0:end:6\n', note: 'Function 1 ran during 2..5 = 4 units. Function 0 ran during 0..1 and 6..6 = 3 units.' }],
    hints: ['Keep a stack of function ids and the time `prev` from which the top function runs.', 'On a start, charge the time since `prev` to the function below, then push.', 'On an end, charge `t - prev + 1` to the function and set `prev = t + 1`.'],
    program: {
      io: ['n:int m:int', 'logs:word[m]'],
      fast: true,
      python: r`
        time = [0] * n
        stack = []
        prev = 0
        for entry in logs:
            fid, kind, t = entry.split(":")
            fid = int(fid)
            t = int(t)
            if kind == "start":
                if stack:
                    time[stack[-1]] += t - prev
                stack.append(fid)
                prev = t
            else:
                time[stack.pop()] += t - prev + 1
                prev = t + 1
        print(*time)`,
      cpp: r`
        vector<long long> time(n, 0);
        vector<int> stack;
        long long prev = 0;
        for (int i = 0; i < m; i++) {
            const string& entry = logs[i];
            size_t c1 = entry.find(':'), c2 = entry.find(':', c1 + 1);
            int fid = stoi(entry.substr(0, c1));
            string kind = entry.substr(c1 + 1, c2 - c1 - 1);
            long long t = stoll(entry.substr(c2 + 1));
            if (kind == "start") {
                if (!stack.empty()) time[stack.back()] += t - prev;
                stack.push_back(fid);
                prev = t;
            } else {
                time[stack.back()] += t - prev + 1;
                stack.pop_back();
                prev = t + 1;
            }
        }
        for (int i = 0; i < n; i++) cout << time[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        long[] time = new long[(int) n];
        Deque<Integer> stack = new ArrayDeque<>();
        long prev = 0;
        for (int i = 0; i < m; i++) {
            String[] parts = logs[i].split(":");
            int fid = Integer.parseInt(parts[0]);
            long t = Long.parseLong(parts[2]);
            if (parts[1].equals("start")) {
                if (!stack.isEmpty()) time[stack.peek()] += t - prev;
                stack.push(fid);
                prev = t;
            } else {
                time[stack.pop()] += t - prev + 1;
                prev = t + 1;
            }
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(time[i]).append(i + 1 < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['A stack holds the running functions. Each event charges the time since `prev` to the function that was running, and `prev` moves on, with the inclusive end time handled by the `+ 1`.'], complexity: 'Time O(m), space O(m).' },
    solve(input) { const rs = rows(input); const [n] = nums(rs[0]); const logs = rs[1].split(' '); const res = new Array(n).fill(0); const st = []; let prev = 0; for (const e of logs) { const [id, kind, t0] = e.split(':'); const t = Number(t0); if (kind === 'start') { if (st.length) res[st[st.length - 1]] += t - prev; st.push(Number(id)); prev = t; } else { res[st.pop()] += t - prev + 1; prev = t + 1; } } return res.join(' '); },
    tests() {
      const g = rng(576);
      // A random valid log: calls are nested, every start has an end, and the time never goes back (an end at time e is followed by events at e + 1 or later).
      const build = (n, events, maxGap) => { const logs = []; const st = []; let t = 0; while (logs.length < events) { const remaining = events - logs.length; const mustClose = st.length >= remaining; const open = !mustClose && (st.length === 0 || g() < 0.5); t += randInt(g, 0, maxGap); if (open) { const id = randInt(g, 0, n - 1); logs.push(`${id}:start:${t}`); st.push(id); } else { const id = st.pop(); logs.push(`${id}:end:${t}`); t += 1; } } return `${n} ${logs.length}\n${logs.join(' ')}\n`; };
      const perUnit = (input) => { const rs = rows(input); const n = nums(rs[0])[0]; const logs = rs[1].split(' ').map((e) => { const [id, kind, t] = e.split(':'); return [Number(id), kind, Number(t)]; }); const res = new Array(n).fill(0); const st = []; let cur = 0; for (const [id, kind, t] of logs) { if (kind === 'start') { while (cur < t) { if (st.length) res[st[st.length - 1]]++; cur++; } st.push(id); cur = t; } else { while (cur <= t) { res[st[st.length - 1]]++; cur++; } st.pop(); } } return res.join(' '); };
      crossCheck(() => build(randInt(g, 1, 4), 2 * randInt(g, 1, 6), 3), (i) => this.solve(i), perUnit, 150);
      return ['2 4\n0:start:0 1:start:2 1:end:5 0:end:6\n', '1 2\n0:start:0 0:end:0\n', '1 4\n0:start:0 0:start:1 0:end:2 0:end:3\n', build(3, 10, 3), build(10, 200, 5), build(1000, 20000, 20000), build(100, 20000, 5), build(1000, 2000, 400000), build(5, 20000, 0)];
    }
  },

  {
    slug: 'find-132-pattern',
    title: 'The 132 Pattern',
    difficulty: 'medium',
    tags: ['stack', 'monotonic-stack', 'arrays'],
    concept: {
      title: 'Scan from the right and remember the best "2"',
      body: [
        'A **132 pattern** is a triple of positions `i < j < k` with `a[i] < a[k] < a[j]` (the values look like "1", "3", "2"). Checking all triples is O(n^3). With a monotonic stack and a scan **from the right** it takes O(n).',
        'Call `a[k]` the "2" and `a[j]` the "3". Keep a stack of candidates for the "3", with decreasing values, and a variable `third`, the **largest value that has been used as a "2"** (it was popped from the stack by a bigger element, so a bigger "3" stands to its left). When you reach a new element `x`: if `x < third`, then `x` can be the "1" and the pattern exists. Otherwise pop all stack elements smaller than `x`; the last popped one is a new, larger "2" candidate (`x` is a bigger "3" for it); then push `x`.',
        { code: 'third = -inf; stack = []\nfor x in reversed(a):\n    if x < third: return True               # x is the "1"\n    while stack and stack[-1] < x:\n        third = stack.pop()                 # a candidate for the "2", with x as its "3"\n    stack.append(x)\nreturn False' },
        'Why the **largest** such value is kept: the test `x < third` is easier to pass when `third` is larger. A larger "2" candidate is always valid, because it was popped by a bigger element standing to its left, which can play the "3".'
      ]
    },
    statement: ['Given an array, is there a triple of positions `i < j < k` with `a[i] < a[k] < a[j]`? Print `yes` or `no`.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '4\n3 1 4 2\n', note: 'The values 1, 4, 2 (at positions 2, 3, 4) form a 132 pattern.' }, { input: '4\n1 2 3 4\n', note: 'No such triple.' }],
    hints: ['A brute force over triples is too slow.', 'Go from the right. Keep a stack of decreasing values and the best value `third` that was popped.', 'If the current value is smaller than `third`, a pattern exists.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        third = None
        stack = []
        found = False
        for i in range(n - 1, -1, -1):
            x = a[i]
            if third is not None and x < third:
                found = True
                break
            while stack and stack[-1] < x:
                third = stack.pop()
            stack.append(x)
        print("yes" if found else "no")`,
      cpp: r`
        bool hasThird = false, found = false;
        long long third = 0;
        vector<long long> stack;
        for (int i = n - 1; i >= 0; i--) {
            long long x = a[i];
            if (hasThird && x < third) {
                found = true;
                break;
            }
            while (!stack.empty() && stack.back() < x) {
                third = stack.back();
                hasThird = true;
                stack.pop_back();
            }
            stack.push_back(x);
        }
        cout << (found ? "yes" : "no") << "\n";`,
      java: r`
        boolean hasThird = false, found = false;
        long third = 0;
        Deque<Long> stack = new ArrayDeque<>();
        for (int i = (int) n - 1; i >= 0; i--) {
            long x = a[i];
            if (hasThird && x < third) {
                found = true;
                break;
            }
            while (!stack.isEmpty() && stack.peek() < x) {
                third = stack.pop();
                hasThird = true;
            }
            stack.push(x);
        }
        System.out.println(found ? "yes" : "no");`
    },
    solution: { explanation: ['Scanning from the right, `third` is the largest value that has a larger value to its left among the processed ones. Any later (more to the left) element smaller than `third` completes a 132 pattern.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); const n = a.length; if (n < 3) return 'no'; const preMin = [a[0]]; for (let i = 1; i < n; i++) preMin.push(Math.min(preMin[i - 1], a[i])); const st = []; for (let j = n - 1; j >= 0; j--) { if (a[j] > preMin[j]) { while (st.length && st[st.length - 1] <= preMin[j]) st.pop(); if (st.length && st[st.length - 1] < a[j]) return 'yes'; st.push(a[j]); } } return 'no'; },
    tests() {
      const g = rng(577);
      const brute = (i) => { const a = nums(rows(i)[1]); for (let x = 0; x < a.length; x++) for (let y = x + 1; y < a.length; y++) for (let z = y + 1; z < a.length; z++) if (a[x] < a[z] && a[z] < a[y]) return 'yes'; return 'no'; };
      crossCheck(() => arr(randArray(g, randInt(g, 1, 9), -5, 5)), (i) => this.solve(i), brute);
      return ['4\n3 1 4 2\n', '4\n1 2 3 4\n', '1\n5\n', '3\n1 3 2\n', '3\n3 2 1\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 2000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000)), arr(many(20000, (i) => i)), arr(many(20000, (i) => 20000 - i)), arr([...many(10000, (i) => i * 2), ...many(10000, (i) => 19999 - i * 2)].map((v, i) => (i === 19999 ? 1 : v))), arr(randArray(g, 20000, 0, 1))];
    }
  },

  {
    slug: 'next-larger-nodes-in-list',
    title: 'Next Larger Node in a List',
    difficulty: 'medium',
    tags: ['linked-list', 'stack', 'monotonic-stack'],
    concept: {
      title: 'A list can be copied into an array, then use the stack',
      body: [
        'For each node of a singly linked list, find the value of the first node **after** it that is **strictly larger**, or 0 if there is none. In an array this is the "next greater element" problem with a monotonic stack. A linked list has no indexes, but you can **number the nodes while you walk**: remember the values in a result array and use the position in the walk as the index.',
        { code: 'res = []; stack = []                 # stack holds indexes of nodes that wait for a larger node\nindex = 0\nwhile head is not None:\n    res.append(0)\n    while stack and values[stack[-1]] < head.val:\n        res[stack.pop()] = head.val\n    stack.append(index); values.append(head.val)\n    head = head.next; index += 1' },
        'This is one pass over the list. It shows a typical way to combine data structures: the list gives the order, the stack gives the answers. The function returns the array of answers.'
      ]
    },
    statement: ['For every node of a singly linked list, find the value of the first node after it that has a strictly larger value, or 0 if there is none. Print the answers for the nodes from the head to the tail.'],
    inputFormat: ['The first line has `n`, the number of nodes. The second line has the values of the nodes, from the head to the tail.'],
    outputFormat: ['Print `n` numbers separated by spaces.'],
    constraints: ['1 <= n <= 20000', '1 <= each value <= 10^9'],
    examples: [{ input: '4\n2 1 5 3\n', note: 'The answers are 5, 5, 0, 0.' }],
    hints: ['Walk along the list and give each node an index.', 'Keep a stack of the indexes of nodes that wait for a larger value.', 'When a node is larger than the waiting ones, write its value as their answer.'],
    program: listProgram({
      solution: {
        python: r`
          def next_larger(head):
              res = []
              values = []
              stack = []
              while head is not None:
                  res.append(0)
                  while stack and values[stack[-1]] < head.val:
                      res[stack.pop()] = head.val
                  stack.append(len(values))
                  values.append(head.val)
                  head = head.next
              return res`,
        cpp: r`
          vector<long long> nextLarger(ListNode* head) {
              vector<long long> res, values;
              vector<int> stack;
              while (head != nullptr) {
                  res.push_back(0);
                  while (!stack.empty() && values[stack.back()] < head->val) {
                      res[stack.back()] = head->val;
                      stack.pop_back();
                  }
                  stack.push_back(values.size());
                  values.push_back(head->val);
                  head = head->next;
              }
              return res;
          }`,
        java: r`
          static long[] nextLarger(ListNode head) {
              List<Long> values = new ArrayList<>();
              List<Long> res = new ArrayList<>();
              Deque<Integer> stack = new ArrayDeque<>();
              while (head != null) {
                  res.add(0L);
                  while (!stack.isEmpty() && values.get(stack.peek()) < head.val) res.set(stack.pop(), head.val);
                  stack.push(values.size());
                  values.add(head.val);
                  head = head.next;
              }
              long[] out = new long[res.size()];
              for (int i = 0; i < out.length; i++) out[i] = res.get(i);
              return out;
          }`
      },
      stub: {
        python: r`
          def next_larger(head):
              # Your code here
              # Return a list with the answer for every node, from the head to the tail.
              return []`,
        cpp: r`
          vector<long long> nextLarger(ListNode* head) {
              // Your code here
              // Return a vector with the answer for every node, from the head to the tail.
              return {};
          }`,
        java: r`
          static long[] nextLarger(ListNode head) {
              // Your code here
              // Return an array with the answer for every node, from the head to the tail.
              return new long[0];
          }`
      },
      call: {
        python: 'print(*next_larger(build_list(a)))',
        cpp: 'vector<long long> answer = nextLarger(buildList(a));\nfor (size_t i = 0; i < answer.size(); i++) cout << answer[i] << (i + 1 < answer.size() ? " " : "\\n");',
        java: 'long[] answer = nextLarger(buildList(a));\nStringBuilder out = new StringBuilder();\nfor (int i = 0; i < answer.length; i++) out.append(answer[i]).append(i + 1 < answer.length ? " " : "\\n");\nSystem.out.print(out);'
      }
    }),
    solution: { explanation: ['While walking along the list, each node gets an index. A stack of the indexes of nodes that have no larger successor yet is resolved by every new larger value.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); return a.map((x, i) => { for (let j = i + 1; j < a.length; j++) if (a[j] > x) return a[j]; return 0; }).join(' '); },
    tests() { const g = rng(578); return ['4\n2 1 5 3\n', '1\n7\n', '3\n1 7 5\n', '4\n9 8 7 6\n', arr(randArray(g, 20, 1, 9)), arr(randArray(g, 2000, 1, 1000000000)), arr(randArray(g, 20000, 1, 1000000000)), arr(many(20000, (i) => i + 1)), arr(many(20000, (i) => 20000 - i)), arr(randArray(g, 20000, 1, 3))]; }
  },

  {
    slug: 'reverse-text-between-parentheses',
    title: 'Reverse the Text Inside Parentheses',
    difficulty: 'medium',
    tags: ['stack', 'strings', 'parentheses'],
    concept: {
      title: 'Each open bracket starts a new piece of text',
      body: [
        'The text has nested parentheses. The text inside every pair must be **reversed**, working from the **innermost** pair outwards, and the parentheses are removed. In `(ed(et)oc)el`: reverse `et` to `te`, giving `(edteoc)el`, then reverse `edteoc` to `coetde`, and so on.',
        'A stack of strings does it in one pass. Keep the current text `cur`. On `(`: **push** `cur` on the stack and start a new empty `cur` (the text inside). On `)`: the inside is complete, **reverse** it, pop the saved text and put the reversed inside after it: `cur = saved + reversed(cur)`. Letters are appended to `cur`.',
        { code: 'stack = []; cur = ""\nfor ch in s:\n    if ch == "(":   stack.append(cur); cur = ""\n    elif ch == ")": cur = stack.pop() + cur[::-1]\n    else:           cur += ch' },
        'Each level is reversed exactly once for each pair that contains it, which is correct: a letter inside two pairs is reversed twice.'
      ]
    },
    statement: ['A word contains lowercase letters and balanced parentheses. Reverse the text inside every pair of matching parentheses, starting with the innermost pairs, and remove all the parentheses. Print the result, or `empty` if nothing remains.'],
    inputFormat: ['A single word.'],
    outputFormat: ['Print the resulting word, or `empty`.'],
    constraints: ['1 <= length <= 20000', 'The parentheses are balanced.'],
    examples: [{ input: '(ed(et)oc)el\n', note: 'The inner et becomes te, then edteoc becomes coetde: coetdeel.' }, { input: 'a(bcdefghijkl(mno)p)q\n', note: 'apmnolkjihgfedcbq.' }],
    hints: ['Use a stack of strings: one saved text for every open bracket.', 'On `(` push the current text and start a new one.', 'On `)` reverse the current text and attach it to the text taken from the stack.'],
    program: {
      io: ['s:word'],
      includes: ['<algorithm>'],
      python: r`
        stack = []
        cur = ""
        for ch in s:
            if ch == "(":
                stack.append(cur)
                cur = ""
            elif ch == ")":
                cur = stack.pop() + cur[::-1]
            else:
                cur += ch
        print(cur if cur else "empty")`,
      cpp: r`
        vector<string> stack;
        string cur;
        for (char ch : s) {
            if (ch == '(') {
                stack.push_back(cur);
                cur = "";
            } else if (ch == ')') {
                reverse(cur.begin(), cur.end());
                cur = stack.back() + cur;
                stack.pop_back();
            } else {
                cur += ch;
            }
        }
        cout << (cur.empty() ? "empty" : cur) << "\n";`,
      java: r`
        Deque<String> stack = new ArrayDeque<>();
        StringBuilder cur = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch == '(') {
                stack.push(cur.toString());
                cur = new StringBuilder();
            } else if (ch == ')') {
                cur = new StringBuilder(stack.pop()).append(cur.reverse());
            } else {
                cur.append(ch);
            }
        }
        System.out.println(cur.length() == 0 ? "empty" : cur.toString());`
    },
    solution: { explanation: ['The stack keeps the text of the outer levels. A closing bracket reverses the finished inner text and glues it behind the saved outer text.'], complexity: 'Time O(n^2) in the worst case (deep nesting), space O(n).' },
    solve(input) { const st = []; let cur = ''; for (const ch of input.trim()) { if (ch === '(') { st.push(cur); cur = ''; } else if (ch === ')') cur = st.pop() + [...cur].reverse().join(''); else cur += ch; } return show(cur); },
    tests() {
      const g = rng(579);
      const gen = (len) => { let out = ''; let open = 0; for (let i = 0; i < len; i++) { const x = g(); if (open > 0 && x < 0.25) { out += ')'; open--; } else if (x < 0.5) { out += '('; open++; } else out += LOW[randInt(g, 0, 25)]; } return out + ')'.repeat(open); };
      const brute = (i) => { let s = i.trim(); for (;;) { const m = /\(([^()]*)\)/.exec(s); if (!m) break; s = s.slice(0, m.index) + [...m[1]].reverse().join('') + s.slice(m.index + m[0].length); } return show(s); };
      crossCheck(() => `${gen(randInt(g, 1, 14))}\n`, (i) => this.solve(i), brute);
      const nested = (d) => '('.repeat(d) + 'a' + 'b'.repeat(1) + ')'.repeat(d);
      return ['(ed(et)oc)el\n', 'a(bcdefghijkl(mno)p)q\n', '(abc)\n', '()\n', 'abc\n', `${gen(30)}\n`, `${gen(2000)}\n`, `${gen(6000)}\n`, `${nested(9999)}\n`, `${'(a'.repeat(6000)}${')'.repeat(6000)}\n`, `${'(ab)'.repeat(5000)}\n`];
    }
  }
];

function fastMins(a) {
  const n = a.length; const left = new Array(n), right = new Array(n); let st = [];
  for (let i = 0; i < n; i++) { while (st.length && a[st[st.length - 1]] > a[i]) st.pop(); left[i] = i - (st.length ? st[st.length - 1] : -1); st.push(i); }
  st = [];
  for (let i = n - 1; i >= 0; i--) { while (st.length && a[st[st.length - 1]] >= a[i]) st.pop(); right[i] = (st.length ? st[st.length - 1] : n) - i; st.push(i); }
  let t = 0n; for (let i = 0; i < n; i++) t += BigInt(a[i]) * BigInt(left[i]) * BigInt(right[i]);
  return t % MOD;
}
