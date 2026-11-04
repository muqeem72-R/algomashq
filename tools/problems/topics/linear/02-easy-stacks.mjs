import { r, rng, randInt, randArray, many, arr, nums, rows, shuffle, randWord } from '../../lib.mjs';

const LOW = 'abcdefghijklmnopqrstuvwxyz';
const show = (a) => (a.length ? a : 'empty');

// A random balanced bracket word of the given length (even) built from the given pairs.
function balanced(g, len, pairs) {
  const out = []; const open = [];
  for (let i = 0; i < len; i++) {
    const remaining = len - i;
    if (open.length && (open.length >= remaining || g() < 0.5)) out.push(open.pop());
    else { const p = pairs[randInt(g, 0, pairs.length - 1)]; out.push(p[0]); open.push(p[1]); }
  }
  return out.join('');
}

export default [
  {
    slug: 'valid-parentheses',
    title: 'Valid Brackets',
    difficulty: 'easy',
    tags: ['stack', 'strings', 'brackets'],
    concept: {
      title: 'A stack: last in, first out',
      body: [
        'A **stack** is a pile: you can only put an item on top (**push**) or take the top item away (**pop**); the item you added last is the first to leave (*last in, first out*). In Python a list works as a stack (`append` and `pop`), in C++ `vector` or `stack`, in Java `ArrayDeque`.',
        'Brackets are the classic use. Every closing bracket must close the **most recent** bracket that is still open, which is exactly the top of a stack. Push each opening bracket. For a closing bracket check that the stack is not empty and that its top is the matching opening bracket, then pop it.',
        { code: 'pairs = {")": "(", "]": "[", "}": "{"}\nstack = []\nfor ch in s:\n    if ch in pairs:\n        if not stack or stack[-1] != pairs[ch]: return False\n        stack.pop()\n    else:\n        stack.append(ch)\nreturn not stack          # every bracket must be closed' },
        'The final check `not stack` matters: a word such as `((` never fails inside the loop but leaves open brackets behind.'
      ]
    },
    statement: ['A word consists of the brackets `(`, `)`, `[`, `]`, `{` and `}`. It is **valid** if every opening bracket is closed by a bracket of the same kind, and brackets are closed in the correct order. Print `yes` if the word is valid, otherwise `no`.'],
    inputFormat: ['A single word of brackets.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: '{[()]}\n', note: 'Valid.' }, { input: '([)]\n', note: 'The bracket ] closes [ while ( is still open: not valid.' }],
    hints: ['Push every opening bracket on a stack.', 'A closing bracket must match the bracket on the top of the stack; then pop it.', 'At the end the stack must be empty.'],
    program: {
      io: ['s:word'],
      python: r`
        pairs = {")": "(", "]": "[", "}": "{"}
        stack = []
        ok = True
        for ch in s:
            if ch in pairs:
                if not stack or stack[-1] != pairs[ch]:
                    ok = False
                    break
                stack.pop()
            else:
                stack.append(ch)
        print("yes" if ok and not stack else "no")`,
      cpp: r`
        string stack;
        bool ok = true;
        for (char ch : s) {
            if (ch == '(' || ch == '[' || ch == '{') {
                stack += ch;
            } else {
                char open = ch == ')' ? '(' : (ch == ']' ? '[' : '{');
                if (stack.empty() || stack.back() != open) {
                    ok = false;
                    break;
                }
                stack.pop_back();
            }
        }
        cout << (ok && stack.empty() ? "yes" : "no") << "\n";`,
      java: r`
        Deque<Character> stack = new ArrayDeque<>();
        boolean ok = true;
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch == '(' || ch == '[' || ch == '{') {
                stack.push(ch);
            } else {
                char open = ch == ')' ? '(' : (ch == ']' ? '[' : '{');
                if (stack.isEmpty() || stack.peek() != open) {
                    ok = false;
                    break;
                }
                stack.pop();
            }
        }
        System.out.println(ok && stack.isEmpty() ? "yes" : "no");`
    },
    solution: { explanation: ['Each closing bracket must match the most recent unclosed opening bracket, the top of the stack. The word is valid when no mismatch happens and the stack is empty at the end.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const s = input.trim(); const m = { ')': '(', ']': '[', '}': '{' }; const st = []; for (const ch of s) { if (m[ch]) { if (!st.length || st[st.length - 1] !== m[ch]) return 'no'; st.pop(); } else st.push(ch); } return st.length ? 'no' : 'yes'; },
    tests() {
      const g = rng(511);
      const pairs = ['()', '[]', '{}'];
      const corrupt = (s) => { const t = [...s]; const i = randInt(g, 0, t.length - 1); t[i] = '()[]{}'[randInt(g, 0, 5)]; return t.join(''); };
      const b1 = balanced(g, 30, pairs), b2 = balanced(g, 20000, pairs), b3 = balanced(g, 20000, ['()']);
      return ['{[()]}\n', '([)]\n', '(\n', ')\n', '()[]{}\n', '((\n', `${b1}\n`, `${corrupt(b1)}\n`, `${b2}\n`, `${corrupt(b2)}\n`, `${b3}\n`, `${'('.repeat(10000)}${')'.repeat(10000)}\n`, `${'('.repeat(10000)}${')'.repeat(9999)}]\n`];
    }
  },

  {
    slug: 'remove-adjacent-duplicates',
    title: 'Remove Equal Neighbours',
    difficulty: 'easy',
    tags: ['stack', 'strings', 'cancel'],
    concept: {
      title: 'A stack that cancels neighbours',
      body: [
        'Remove two equal neighbouring letters, and repeat, because the removal can create new equal neighbours (`abba`: remove `bb`, then `aa`). Doing this by searching and rebuilding the string again and again is slow. A stack does it in **one pass**.',
        'Keep the letters that are still "alive" on a stack. For a new letter `ch`: if the top of the stack is equal to `ch`, the two cancel each other, so **pop**; otherwise **push** `ch`. The stack always holds the word that would remain if you had stopped right now.',
        { code: 'stack = []\nfor ch in s:\n    if stack and stack[-1] == ch:\n        stack.pop()\n    else:\n        stack.append(ch)\nresult = "".join(stack)' },
        'This pattern, "the new item cancels or merges with the top", appears in many stack problems.'
      ]
    },
    statement: ['Repeat the following step as long as possible: choose two equal neighbouring letters of the word and remove both. Print the final word, or `empty` if no letter remains. The result does not depend on the order of the choices.'],
    inputFormat: ['A single word of lowercase letters.'],
    outputFormat: ['Print the final word, or `empty`.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'abbaca\n', note: 'Remove bb to get aaca, then aa to get ca.' }],
    hints: ['Removing a pair can make two other letters neighbours.', 'Use a stack of the letters that are still there.', 'If the new letter equals the top of the stack, pop; otherwise push.'],
    program: {
      io: ['s:word'],
      python: r`
        stack = []
        for ch in s:
            if stack and stack[-1] == ch:
                stack.pop()
            else:
                stack.append(ch)
        print("".join(stack) if stack else "empty")`,
      cpp: r`
        string stack;
        for (char ch : s) {
            if (!stack.empty() && stack.back() == ch) stack.pop_back();
            else stack += ch;
        }
        cout << (stack.empty() ? "empty" : stack) << "\n";`,
      java: r`
        StringBuilder stack = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            int top = stack.length() - 1;
            if (top >= 0 && stack.charAt(top) == ch) stack.deleteCharAt(top);
            else stack.append(ch);
        }
        System.out.println(stack.length() == 0 ? "empty" : stack.toString());`
    },
    solution: { explanation: ['The stack holds the letters that survive so far. A new letter equal to the top cancels it; otherwise it is pushed.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const st = []; for (const ch of input.trim()) { if (st.length && st[st.length - 1] === ch) st.pop(); else st.push(ch); } return show(st.join('')); },
    tests() { const g = rng(512); const pal = (n) => { const h = randWord(g, n, 'abc'); return h + [...h].reverse().join(''); }; return ['abbaca\n', 'a\n', 'aa\n', 'abc\n', 'abba\n', 'aaa\n', `${randWord(g, 30, 'ab')}\n`, `${randWord(g, 2000, 'abc')}\n`, `${randWord(g, 20000, 'ab')}\n`, `${randWord(g, 20000, LOW)}\n`, `${pal(10000)}\n`, `${'a'.repeat(20000)}\n`, `${'a'.repeat(19999)}\n`]; }
  },

  {
    slug: 'baseball-game-score',
    title: 'Baseball Game Score',
    difficulty: 'easy',
    tags: ['stack', 'simulation'],
    concept: {
      title: 'Operations that look at the last scores',
      body: [
        'A stack is a good fit whenever the rules talk about **"the previous one"** or **"the last two"**. Here every operation reads or removes the most recent scores, which are exactly the top of a stack of scores.',
        { code: 'scores = []\nfor op in ops:\n    if op == "+":   scores.append(scores[-1] + scores[-2])\n    elif op == "D": scores.append(2 * scores[-1])\n    elif op == "C": scores.pop()\n    else:           scores.append(int(op))\nanswer = sum(scores)' },
        'Reading the top without removing it (`scores[-1]`) is called **peek** or `top`. Only `C` removes a score; `+` and `D` add a new one on top. The answer is the sum of the scores that are left.'
      ]
    },
    statement: ['You record the scores of a game. You get a list of operations. An integer means a new score with that value. `+` records a new score equal to the sum of the previous two scores. `D` records a new score equal to twice the previous score. `C` removes the previous score from the record. Print the sum of all scores in the record after all operations.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` operations separated by spaces.'],
    outputFormat: ['Print the sum of the scores.'],
    constraints: ['1 <= n <= 20000', 'Every operation is valid: there are enough previous scores for it.', 'Integers are between -30000 and 30000. All scores and sums fit into 64 bits.'],
    examples: [{ input: '5\n5 2 C D +\n', note: 'Scores: 5, then 2, then C removes 2, D adds 10, + adds 5 + 10 = 15. Sum 30.' }],
    hints: ['Keep the recorded scores on a stack.', '`+` and `D` read the top of the stack; `C` removes it.', 'At the end add up what is left on the stack.'],
    program: {
      io: ['n:int', 'ops:word[n]'],
      fast: true,
      python: r`
        scores = []
        for op in ops:
            if op == "+":
                scores.append(scores[-1] + scores[-2])
            elif op == "D":
                scores.append(2 * scores[-1])
            elif op == "C":
                scores.pop()
            else:
                scores.append(int(op))
        print(sum(scores))`,
      cpp: r`
        vector<long long> scores;
        for (int i = 0; i < n; i++) {
            const string& op = ops[i];
            if (op == "+") scores.push_back(scores[scores.size() - 1] + scores[scores.size() - 2]);
            else if (op == "D") scores.push_back(2 * scores.back());
            else if (op == "C") scores.pop_back();
            else scores.push_back(stoll(op));
        }
        long long total = 0;
        for (long long v : scores) total += v;
        cout << total << "\n";`,
      java: r`
        List<Long> scores = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String op = ops[i];
            int top = scores.size() - 1;
            if (op.equals("+")) scores.add(scores.get(top) + scores.get(top - 1));
            else if (op.equals("D")) scores.add(2 * scores.get(top));
            else if (op.equals("C")) scores.remove(top);
            else scores.add(Long.parseLong(op));
        }
        long total = 0;
        for (long v : scores) total += v;
        System.out.println(total);`
    },
    solution: { explanation: ['The record is a stack: `+` and `D` read the top scores and push a new one, `C` pops, a number is pushed. The answer is the sum of the stack.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const ops = rows(input)[1].split(' '); const s = []; for (const op of ops) { if (op === '+') s.push(s[s.length - 1] + s[s.length - 2]); else if (op === 'D') s.push(2 * s[s.length - 1]); else if (op === 'C') s.pop(); else s.push(Number(op)); } return String(s.reduce((a, b) => a + b, 0)); },
    tests() {
      const g = rng(513);
      const make = (n, wC, wD, wP) => { const ops = []; const st = []; while (ops.length < n) { const x = g() * (wC + wD + wP + 1); let op; if (x < wC && st.length >= 1) op = 'C'; else if (x < wC + wD && st.length >= 1 && Math.abs(st[st.length - 1]) < 1e9) op = 'D'; else if (x < wC + wD + wP && st.length >= 2 && Math.abs(st[st.length - 1]) + Math.abs(st[st.length - 2]) < 1e9) op = '+'; else op = String(randInt(g, -30000, 30000)); ops.push(op); if (op === 'C') st.pop(); else if (op === 'D') st.push(2 * st[st.length - 1]); else if (op === '+') st.push(st[st.length - 1] + st[st.length - 2]); else st.push(Number(op)); } return `${n}\n${ops.join(' ')}\n`; };
      return ['5\n5 2 C D +\n', '1\n7\n', '3\n1 D D\n', '6\n5 -2 4 C D +\n',make(20, 0.3, 0.3, 0.3), make(2000, 0.3, 0.3, 0.3), make(20000, 0.3, 0.3, 0.3), make(20000, 0.05, 0.4, 0.4), make(20000, 0.5, 0.1, 0.1)];
    }
  },

  {
    slug: 'backspace-string-compare',
    title: 'Typing With Backspaces',
    difficulty: 'easy',
    tags: ['stack', 'strings', 'simulation'],
    concept: {
      title: 'The stack is the text typed so far',
      body: [
        'A `#` means "backspace": it erases the last typed letter, if there is one. Simulate typing with a stack that holds the text: a letter is **pushed**, a `#` **pops** the top (nothing happens on an empty stack). At the end the stack is the final text.',
        { code: 'def typed(s):\n    stack = []\n    for ch in s:\n        if ch == "#":\n            if stack: stack.pop()\n        else:\n            stack.append(ch)\n    return stack' },
        'To compare two typed words, compare the two stacks. (There is also a solution that walks both words from the end in O(1) extra memory; the stack solution is the clearer one to start with.)'
      ]
    },
    statement: ['Two words are typed into empty text editors. The character `#` means a backspace: it deletes the last letter in the editor, and does nothing if the editor is empty. Print `yes` if both editors end up with the same text, otherwise `no`. Two empty texts are equal.'],
    inputFormat: ['The first line has the first typed word.', 'The second line has the second typed word.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length of each word <= 20000', 'The words contain lowercase letters and the character `#`.'],
    examples: [{ input: 'ab#c\nad#c\n', note: 'Both editors show ac.' }, { input: 'a#c\nb\n', note: 'The first editor shows c, the second shows b.' }],
    hints: ['Simulate each editor with a stack.', 'A letter is pushed; a `#` pops the top if the stack is not empty.', 'Compare the two final stacks.'],
    program: {
      io: ['s:word', 't:word'],
      python: r`
        def typed(word):
            stack = []
            for ch in word:
                if ch == "#":
                    if stack:
                        stack.pop()
                else:
                    stack.append(ch)
            return stack


        print("yes" if typed(s) == typed(t) else "no")`,
      cpp: r`
        auto typed = [](const string& word) {
            string stack;
            for (char ch : word) {
                if (ch == '#') {
                    if (!stack.empty()) stack.pop_back();
                } else {
                    stack += ch;
                }
            }
            return stack;
        };
        cout << (typed(s) == typed(t) ? "yes" : "no") << "\n";`,
      java: r`
        System.out.println(typed(s).equals(typed(t)) ? "yes" : "no");`,
      helpers: {
        java: r`
          static String typed(String word) {
              StringBuilder stack = new StringBuilder();
              for (int i = 0; i < word.length(); i++) {
                  char ch = word.charAt(i);
                  if (ch == '#') {
                      if (stack.length() > 0) stack.deleteCharAt(stack.length() - 1);
                  } else {
                      stack.append(ch);
                  }
              }
              return stack.toString();
          }`
      }
    },
    solution: { explanation: ['Each word is typed into a stack: letters are pushed and `#` pops when possible. The words give the same text exactly when the two stacks are equal.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) { const typed = (w) => { const st = []; for (const ch of w) { if (ch === '#') st.pop(); else st.push(ch); } return st.join(''); }; const [s, t] = rows(input); return typed(s) === typed(t) ? 'yes' : 'no'; },
    tests() { const g = rng(514); const w = (n) => randWord(g, n, 'abc#'); const fromText = (text) => { let out = ''; for (const ch of text) { out += ch; while (g() < 0.3) out += 'x#'; } return out; }; const text = randWord(g, 5000, 'abc'); return ['ab#c\nad#c\n', 'a#c\nb\n', 'a##c\n#a#c\n', 'a#\nb#\n', 'abc\nabc#\n', `${w(30)}\n${w(30)}\n`, `${w(2000)}\n${w(2000)}\n`, `${fromText(text)}\n${fromText(text)}\n`.slice(0, 20000) + '\n', `${'a'.repeat(10000)}${'#'.repeat(10000)}\n${'#'.repeat(5000)}\n`, `${w(20000)}\n${w(20000)}\n`, `${'#'.repeat(20000)}\n${'a#'.repeat(10000)}\n`]; }
  },

  {
    slug: 'evaluate-postfix-expression',
    title: 'Evaluate a Postfix Expression',
    difficulty: 'easy',
    tags: ['stack', 'expression', 'parsing'],
    concept: {
      title: 'Postfix: operators come after their operands',
      body: [
        'In **postfix notation** (also called reverse Polish notation) an operator is written **after** its two operands: `3 4 +` means 3 + 4, and `2 3 4 * +` means 2 + (3 * 4). There are no parentheses and no priority rules, which makes postfix easy to evaluate with a stack.',
        'Read the tokens from left to right. A **number** is pushed. An **operator** takes its two operands from the top of the stack (the first one popped is the **right** operand), computes, and pushes the result.',
        { code: 'for tok in tokens:\n    if tok in "+-*/":\n        b = stack.pop(); a = stack.pop()      # b is on top: the right operand\n        stack.append(apply(tok, a, b))\n    else:\n        stack.append(int(tok))\nresult = stack[-1]' },
        'Mind the order for `-` and `/`: it is `a - b`, not `b - a`. Division of integers rounds **towards zero** (`7 / 2 = 3`, `-7 / 2 = -3`). C++ and Java already do this; in Python use `abs` and fix the sign, because `//` rounds down.'
      ]
    },
    statement: ['Evaluate an expression in postfix notation. The tokens are integers (possibly negative) and the operators `+`, `-`, `*` and `/`. Division of integers rounds towards zero. The expression is valid and never divides by zero.'],
    inputFormat: ['The first line has `n`, the number of tokens.', 'The second line has the `n` tokens separated by spaces.'],
    outputFormat: ['Print the value of the expression.'],
    constraints: ['1 <= n <= 20000', 'Every number and every intermediate result has an absolute value of at most 10^15.'],
    examples: [{ input: '5\n2 3 4 * +\n', note: '3 * 4 = 12, then 2 + 12 = 14.' }, { input: '5\n10 3 - 2 /\n', note: '(10 - 3) / 2 = 3, rounded towards zero.' }],
    hints: ['Push numbers on a stack.', 'An operator pops two values; the first popped is the right operand.', 'The result is the only value left on the stack.'],
    program: {
      io: ['n:int', 't:word[n]'],
      fast: true,
      python: r`
        stack = []
        for tok in t:
            if tok in ("+", "-", "*", "/"):
                b = stack.pop()
                a = stack.pop()
                if tok == "+":
                    stack.append(a + b)
                elif tok == "-":
                    stack.append(a - b)
                elif tok == "*":
                    stack.append(a * b)
                else:
                    q = abs(a) // abs(b)
                    stack.append(q if (a < 0) == (b < 0) else -q)
            else:
                stack.append(int(tok))
        print(stack[-1])`,
      cpp: r`
        vector<long long> stack;
        for (int i = 0; i < n; i++) {
            const string& tok = t[i];
            if (tok == "+" || tok == "-" || tok == "*" || tok == "/") {
                long long b = stack.back();
                stack.pop_back();
                long long a = stack.back();
                stack.pop_back();
                if (tok == "+") stack.push_back(a + b);
                else if (tok == "-") stack.push_back(a - b);
                else if (tok == "*") stack.push_back(a * b);
                else stack.push_back(a / b);
            } else {
                stack.push_back(stoll(tok));
            }
        }
        cout << stack.back() << "\n";`,
      java: r`
        Deque<Long> stack = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            String tok = t[i];
            if (tok.equals("+") || tok.equals("-") || tok.equals("*") || tok.equals("/")) {
                long b = stack.pop();
                long a = stack.pop();
                if (tok.equals("+")) stack.push(a + b);
                else if (tok.equals("-")) stack.push(a - b);
                else if (tok.equals("*")) stack.push(a * b);
                else stack.push(a / b);
            } else {
                stack.push(Long.parseLong(tok));
            }
        }
        System.out.println(stack.peek());`
    },
    solution: { explanation: ['Numbers are pushed; an operator pops its right and left operand, applies the operation and pushes the result. The single value left is the answer.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const t = rows(input)[1].split(' '); const st = []; for (const tok of t) { if (['+', '-', '*', '/'].includes(tok)) { const b = st.pop(), a = st.pop(); st.push(tok === '+' ? a + b : tok === '-' ? a - b : tok === '*' ? a * b : Math.trunc(a / b)); } else st.push(Number(tok)); } return String(st[st.length - 1]); },
    tests() {
      const g = rng(515);
      const make = (n, maxNum) => { const toks = []; const st = []; let numbers = 0; const target = Math.floor(n / 2) + 1; while (toks.length < n) { const remaining = n - toks.length; const mustReduce = st.length > remaining; const canOp = st.length >= 2; if (canOp && (mustReduce || (numbers >= target) || g() < 0.45)) { const b = st[st.length - 1], a = st[st.length - 2]; const choices = ['+', '-']; if (Math.abs(a) < 1e7 && Math.abs(b) < 1e7) choices.push('*'); if (b !== 0) choices.push('/'); const op = choices[randInt(g, 0, choices.length - 1)]; st.length -= 2; st.push(op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : Math.trunc(a / b)); toks.push(op); } else { const v = randInt(g, -maxNum, maxNum); st.push(v); toks.push(String(v)); numbers++; } } return { toks, ok: st.length === 1 }; };
      const build = (n, maxNum) => { for (;;) { const x = make(n, maxNum); if (x.ok) return `${n}\n${x.toks.join(' ')}\n`; } };
      return ['5\n2 3 4 * +\n', '5\n10 3 - 2 /\n', '1\n-7\n', '3\n7 -2 /\n', '3\n-7 2 /\n', '3\n-7 -2 /\n', build(11, 9), build(101, 100), build(1001, 1000), build(9999, 30000), build(19999, 10)];
    }
  },

  {
    slug: 'next-greater-element',
    title: 'Next Greater Element',
    difficulty: 'easy',
    tags: ['stack', 'monotonic-stack', 'arrays'],
    concept: {
      title: 'A monotonic stack of elements that are still waiting',
      body: [
        'For every element, find the **first element to its right that is greater**; print -1 if there is none. Searching to the right for every element costs O(n^2). A **monotonic stack** solves it in O(n).',
        'Walk from left to right. The stack holds the **indexes of elements that are still waiting for their greater element**; their values are in non-increasing order from the bottom to the top. A new element `a[i]` is the answer for every waiting element that is **smaller** than it: pop them, one by one, and write `a[i]` as their answer. Then push `i`, because it now waits for its own greater element.',
        { code: 'res = [-1] * n\nstack = []\nfor i in range(n):\n    while stack and a[stack[-1]] < a[i]:\n        res[stack.pop()] = a[i]      # a[i] is the next greater element of these\n    stack.append(i)' },
        'Every index is pushed once and popped at most once, so the loop is O(n) in total even though it contains a `while` inside a `for`. Elements still on the stack at the end have no greater element: they keep -1.'
      ]
    },
    statement: ['For each element of an array, print the first element to its right that is strictly greater than it, or -1 if there is none.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print `n` integers separated by spaces.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '5\n4 5 2 25 10\n', note: 'The answers: 5, 25, 25, -1, -1.' }],
    hints: ['A nested loop is too slow for large inputs.', 'Keep a stack of the indexes that have no answer yet.', 'When a larger element arrives, pop all smaller waiting elements and give them this answer.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      fast: true,
      python: r`
        res = [-1] * n
        stack = []
        for i in range(n):
            while stack and a[stack[-1]] < a[i]:
                res[stack.pop()] = a[i]
            stack.append(i)
        print(*res)`,
      cpp: r`
        vector<long long> res(n, -1);
        vector<int> stack;
        for (int i = 0; i < n; i++) {
            while (!stack.empty() && a[stack.back()] < a[i]) {
                res[stack.back()] = a[i];
                stack.pop_back();
            }
            stack.push_back(i);
        }
        for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        long[] res = new long[(int) n];
        Arrays.fill(res, -1);
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && a[stack.peek()] < a[i]) res[stack.pop()] = a[i];
            stack.push(i);
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(res[i]).append(i + 1 < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The stack holds the indexes still waiting for a greater element. A new element answers and removes all smaller waiting elements, then waits itself.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const a = nums(rows(input)[1]); return a.map((x, i) => { for (let j = i + 1; j < a.length; j++) if (a[j] > x) return a[j]; return -1; }).join(' '); },
    tests() { const g = rng(516); const mono = (n, up) => arr(many(n, (i) => (up ? i : n - i))); return ['5\n4 5 2 25 10\n', '1\n7\n', '4\n1 1 1 1\n', '4\n4 3 2 1\n', '4\n1 2 3 4\n', arr(randArray(g, 20, -9, 9)), arr(randArray(g, 2000, -1000000000, 1000000000)), arr(randArray(g, 20000, -1000000000, 1000000000)), mono(20000, true), mono(20000, false), arr(randArray(g, 20000, 0, 3))]; }
  },

  {
    slug: 'min-stack-operations',
    title: 'A Stack That Knows Its Minimum',
    difficulty: 'easy',
    tags: ['stack', 'design', 'minimum'],
    concept: {
      title: 'Store the minimum next to every value',
      body: [
        'You want a stack with four operations that are all fast: `push`, `pop`, `top` and **`min`** (the smallest value currently in the stack). Looking for the minimum in the whole stack would cost O(n). The trick: when you push a value, also store **the smallest value of the stack at that moment**, i.e. the minimum of the new value and the minimum stored with the previous top.',
        { code: 'stack = []                      # pairs (value, minimum of this value and everything below)\npush x:  stack.append((x, min(x, stack[-1][1]) if stack else x))\npop:     stack.pop()\ntop:     stack[-1][0]\nmin:     stack[-1][1]' },
        'Because the minimum is stored together with each value, it comes back automatically after a `pop`: the new top still carries the minimum of everything below it. All four operations take O(1).'
      ]
    },
    statement: ['Process `n` operations on an initially empty stack. `push x` puts the number `x` on top. `pop` removes the top. `top` asks for the value on top. `min` asks for the smallest value in the stack. Every operation line has two words: the operation and a number; for `pop`, `top` and `min` the number is 0 and must be ignored. All operations are valid (the stack is not empty when `pop`, `top` or `min` is used). Print the answer of every `top` and `min` operation, one per line.'],
    inputFormat: ['The first line has `n`.', 'Each of the next `n` lines has an operation and a number.'],
    outputFormat: ['One line for every `top` and `min` operation, in order.'],
    constraints: ['1 <= n <= 20000', '-10^9 <= x <= 10^9', 'There is at least one `top` or `min` operation.'],
    examples: [{ input: '7\npush 5\npush 2\npush 8\nmin 0\npop 0\npop 0\ntop 0\n', note: 'The minimum is 2; after two pops the top is 5.' }],
    hints: ['Store the minimum together with each value on the stack.', 'The new minimum is the smaller of `x` and the minimum stored with the current top.', 'After `pop`, the new top already knows the right minimum.'],
    program: {
      io: ['n:int', 'ops:word[n][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        stack = []
        out = []
        for op, val in ops:
            if op == "push":
                x = int(val)
                stack.append((x, min(x, stack[-1][1]) if stack else x))
            elif op == "pop":
                stack.pop()
            elif op == "top":
                out.append(stack[-1][0])
            else:
                out.append(stack[-1][1])
        print("\n".join(map(str, out)))`,
      cpp: r`
        vector<pair<long long, long long>> stack;
        for (int i = 0; i < n; i++) {
            const string& op = ops[i][0];
            if (op == "push") {
                long long x = stoll(ops[i][1]);
                stack.push_back({x, stack.empty() ? x : min(x, stack.back().second)});
            } else if (op == "pop") {
                stack.pop_back();
            } else if (op == "top") {
                cout << stack.back().first << "\n";
            } else {
                cout << stack.back().second << "\n";
            }
        }`,
      java: r`
        Deque<long[]> stack = new ArrayDeque<>();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            String op = ops[i][0];
            if (op.equals("push")) {
                long x = Long.parseLong(ops[i][1]);
                stack.push(new long[] {x, stack.isEmpty() ? x : Math.min(x, stack.peek()[1])});
            } else if (op.equals("pop")) {
                stack.pop();
            } else if (op.equals("top")) {
                sb.append(stack.peek()[0]).append("\n");
            } else {
                sb.append(stack.peek()[1]).append("\n");
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Every stack entry stores the value and the minimum of the stack up to and including it, so `min` and `top` are constant-time reads of the top entry and `pop` restores the previous minimum automatically.'], complexity: 'Time O(1) per operation, space O(n).' },
    solve(input) { const ops = rows(input).slice(1).map((l) => l.split(' ')); const st = []; const out = []; for (const [op, v] of ops) { if (op === 'push') { const x = Number(v); st.push([x, st.length ? Math.min(x, st[st.length - 1][1]) : x]); } else if (op === 'pop') st.pop(); else if (op === 'top') out.push(st[st.length - 1][0]); else out.push(st[st.length - 1][1]); } return out.join('\n'); },
    tests() {
      const g = rng(517);
      const make = (n, lo, hi, pPush) => { const lines = []; let size = 0; for (let i = 0; i < n; i++) { const last = i === n - 1; let op; if (size === 0 || (!last && g() < pPush)) op = 'push'; else { const x = g(); op = x < 0.34 ? 'pop' : x < 0.67 ? 'top' : 'min'; if (last && op === 'pop') op = 'top'; } if (op === 'push') { lines.push(`push ${randInt(g, lo, hi)}`); size++; } else { lines.push(`${op} 0`); if (op === 'pop') size--; } } return `${n}\n${lines.join('\n')}\n`; };
      return ['7\npush 5\npush 2\npush 8\nmin 0\npop 0\npop 0\ntop 0\n', '2\npush -3\nmin 0\n', make(20, -9, 9, 0.5), make(300, -1000, 1000, 0.5), make(20000, -1000000000, 1000000000, 0.5), make(20000, -1000000000, 1000000000, 0.7), make(20000, 0, 3, 0.4), make(20000, -1000000000, 1000000000, 0.3)];
    }
  },

  {
    slug: 'final-prices-with-discount',
    title: 'Final Prices With a Discount',
    difficulty: 'easy',
    tags: ['stack', 'monotonic-stack', 'arrays'],
    concept: {
      title: 'The same waiting stack, with a different rule',
      body: [
        'A shop gives, for the item at position `i`, a discount equal to the price of the **first item to its right that is not more expensive** (`price[j] <= price[i]`). The answer for `i` is `price[i] - price[j]`; if there is no such item, there is no discount.',
        'This is the "next greater element" idea with the comparison turned around. Keep a stack of the indexes that have not received their discount yet. A new price `p` is the discount for every waiting item whose price is **at least** `p`: pop them and subtract.',
        { code: 'result = prices[:]\nstack = []\nfor i, p in enumerate(prices):\n    while stack and prices[stack[-1]] >= p:\n        j = stack.pop()\n        result[j] = prices[j] - p\n    stack.append(i)' },
        'The prices on the stack are always increasing from the bottom to the top, which is why it is called a monotonic stack.'
      ]
    },
    statement: ['Given the prices of `n` items in a row, the final price of item `i` is its price minus the price of the first item to its right that costs less than or the same as item `i` (`price[j] <= price[i]` with `j > i`). If there is no such item, the final price is the original price. Print all final prices.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` prices.'],
    outputFormat: ['Print the `n` final prices separated by spaces.'],
    constraints: ['1 <= n <= 20000', '1 <= each price <= 10^9'],
    examples: [{ input: '5\n8 4 6 2 3\n', note: '8 - 4 = 4, 4 - 2 = 2, 6 - 2 = 4, 2 has no discount, 3 has none: 4 2 4 2 3.' }],
    hints: ['The discount comes from the first item to the right that is not more expensive.', 'Keep a stack of indexes whose discount is still unknown.', 'A new price settles all waiting items that cost at least as much.'],
    program: {
      io: ['n:int', 'p:int[n]'],
      fast: true,
      python: r`
        res = p[:]
        stack = []
        for i in range(n):
            while stack and p[stack[-1]] >= p[i]:
                j = stack.pop()
                res[j] = p[j] - p[i]
            stack.append(i)
        print(*res)`,
      cpp: r`
        vector<long long> res = p;
        vector<int> stack;
        for (int i = 0; i < n; i++) {
            while (!stack.empty() && p[stack.back()] >= p[i]) {
                int j = stack.back();
                stack.pop_back();
                res[j] = p[j] - p[i];
            }
            stack.push_back(i);
        }
        for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\n");`,
      java: r`
        long[] res = p.clone();
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && p[stack.peek()] >= p[i]) {
                int j = stack.pop();
                res[j] = p[j] - p[i];
            }
            stack.push(i);
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(res[i]).append(i + 1 < n ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['The stack holds the items still waiting for a discount. A new price gives the discount to every waiting item that is at least as expensive, which is exactly the "first not more expensive item to the right".'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const p = nums(rows(input)[1]); return p.map((x, i) => { for (let j = i + 1; j < p.length; j++) if (p[j] <= x) return x - p[j]; return x; }).join(' '); },
    tests() { const g = rng(518); return ['5\n8 4 6 2 3\n', '1\n5\n', '3\n10 1 1\n', '4\n1 2 3 4\n', '4\n4 3 2 1\n', arr(randArray(g, 20, 1, 9)), arr(randArray(g, 2000, 1, 1000000000)), arr(randArray(g, 20000, 1, 1000000000)), arr(many(20000, (i) => i + 1)), arr(many(20000, (i) => 20000 - i)), arr(randArray(g, 20000, 1, 3))]; }
  },

  {
    slug: 'make-the-string-great',
    title: 'Make the String Great',
    difficulty: 'easy',
    tags: ['stack', 'strings', 'cancel'],
    concept: {
      title: 'Cancel a letter with its opposite case',
      body: [
        'Two neighbouring letters **cancel** if they are the same letter in different cases (`a` and `A`, or `Q` and `q`). Remove such pairs again and again, until none is left. This is the same stack idea as for equal neighbours, only the cancelling test is different.',
        { code: 'stack = []\nfor ch in s:\n    if stack and stack[-1] != ch and stack[-1].lower() == ch.lower():\n        stack.pop()                 # the pair cancels\n    else:\n        stack.append(ch)' },
        'The test has two parts: the letters must be **different characters** (so `a` and `a` do not cancel) and equal after turning both into lower case. In C++ use `tolower`, in Java `Character.toLowerCase`.'
      ]
    },
    statement: ['A word has upper and lower case letters. As long as two neighbouring letters are the same letter in different cases (such as `a` and `A`), remove both. Print the final word, or `empty` if nothing remains. The result is unique.'],
    inputFormat: ['A single word of English letters.'],
    outputFormat: ['Print the final word, or `empty`.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: 'leEeetcode\n', note: 'Remove eE to get leetcode.' }, { input: 'abBAcC\n', note: 'bB, then aA, then cC are removed: empty.' }],
    hints: ['Use a stack of the letters that remain.', 'A new letter cancels the top letter when they differ only in case.', 'Compare with `lower()` and make sure that the two characters are not identical.'],
    program: {
      io: ['s:word'],
      includes: ['<cctype>'],
      python: r`
        stack = []
        for ch in s:
            if stack and stack[-1] != ch and stack[-1].lower() == ch.lower():
                stack.pop()
            else:
                stack.append(ch)
        print("".join(stack) if stack else "empty")`,
      cpp: r`
        string stack;
        for (char ch : s) {
            if (!stack.empty() && stack.back() != ch && tolower(stack.back()) == tolower(ch)) stack.pop_back();
            else stack += ch;
        }
        cout << (stack.empty() ? "empty" : stack) << "\n";`,
      java: r`
        StringBuilder stack = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            int top = stack.length() - 1;
            if (top >= 0 && stack.charAt(top) != ch && Character.toLowerCase(stack.charAt(top)) == Character.toLowerCase(ch)) stack.deleteCharAt(top);
            else stack.append(ch);
        }
        System.out.println(stack.length() == 0 ? "empty" : stack.toString());`
    },
    solution: { explanation: ['The stack holds the surviving letters; a new letter that is the opposite case of the top letter cancels it, otherwise it is pushed.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { const st = []; for (const ch of input.trim()) { if (st.length && st[st.length - 1] !== ch && st[st.length - 1].toLowerCase() === ch.toLowerCase()) st.pop(); else st.push(ch); } return show(st.join('')); },
    tests() { const g = rng(519); const ALL = 'aAbBcC'; const nest = (n) => { const h = randWord(g, n, 'abc'); return h + [...h].reverse().map((c) => c.toUpperCase()).join(''); }; return ['leEeetcode\n', 'abBAcC\n', 's\n', 'aA\n', 'aa\n', 'AaAa\n', `${randWord(g, 30, ALL)}\n`, `${randWord(g, 2000, ALL)}\n`, `${randWord(g, 20000, ALL)}\n`, `${randWord(g, 20000, 'abcABC')}\n`, `${nest(10000)}\n`, `${'aA'.repeat(10000)}\n`]; }
  },

  {
    slug: 'maximum-nesting-depth',
    title: 'Maximum Nesting Depth of Parentheses',
    difficulty: 'easy',
    tags: ['stack', 'strings', 'parentheses', 'counter'],
    concept: {
      title: 'The stack size is the depth, and a counter is enough',
      body: [
        'The **nesting depth** at a position is the number of parentheses that are open there. When you push on `(` and pop on `)`, the **size of the stack** is the current depth. If you only need the depth, you do not have to store the brackets: a **counter** does the same job (add 1 on `(`, subtract 1 on `)`).',
        { code: 'depth = best = 0\nfor ch in s:\n    if ch == "(":\n        depth += 1\n        best = max(best, depth)\n    elif ch == ")":\n        depth -= 1' },
        'Other characters (digits, `+`, `*`, ...) are ignored. Whenever a stack would only be used to know its size, think about replacing it by a counter.'
      ]
    },
    statement: ['A valid arithmetic expression is given without spaces. It contains digits, the operators `+`, `-`, `*`, `/` and the parentheses `(` and `)`, and the parentheses are balanced. Print the largest number of parentheses that are open at the same time.'],
    inputFormat: ['A single word: the expression.'],
    outputFormat: ['Print the maximum nesting depth.'],
    constraints: ['1 <= length <= 20000'],
    examples: [{ input: '(1+(2*3)+((8)/4))+1\n', note: 'The deepest place is inside ((8): depth 3.' }],
    hints: ['Count how many parentheses are open.', 'Add 1 on `(` and subtract 1 on `)`.', 'Keep the largest value of the counter.'],
    program: {
      io: ['s:word'],
      includes: ['<algorithm>'],
      python: r`
        depth = best = 0
        for ch in s:
            if ch == "(":
                depth += 1
                best = max(best, depth)
            elif ch == ")":
                depth -= 1
        print(best)`,
      cpp: r`
        int depth = 0, best = 0;
        for (char ch : s) {
            if (ch == '(') {
                depth++;
                best = max(best, depth);
            } else if (ch == ')') {
                depth--;
            }
        }
        cout << best << "\n";`,
      java: r`
        int depth = 0, best = 0;
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch == '(') {
                depth++;
                best = Math.max(best, depth);
            } else if (ch == ')') {
                depth--;
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['The number of open parentheses is kept in a counter; the largest value it reaches is the maximum depth.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { let d = 0, best = 0; for (const ch of input.trim()) { if (ch === '(') { d++; best = Math.max(best, d); } else if (ch === ')') d--; } return String(best); },
    tests() { const g = rng(520); const mixed = (len) => { const b = balanced(g, len, ['()']); let s = ''; for (const c of b) { s += c; if (c === '(' && g() < 0.4) s += '1+'; if (c === ')' && g() < 0.4) s += '*2'; } return s; }; return ['(1+(2*3)+((8)/4))+1\n', '1\n', '(1)+((2))+(((3)))\n', '()\n', '(())\n', `${balanced(g, 30, ['()'])}\n`, `${mixed(1000)}\n`, `${balanced(g, 20000, ['()'])}\n`, `${'((1)+(2))'.repeat(2000)}\n`,`${'(1)+'.repeat(4000)}2\n`, `${mixed(6000)}\n`]; }
  },

  {
    slug: 'remove-outermost-parentheses',
    title: 'Remove the Outermost Parentheses',
    difficulty: 'easy',
    tags: ['stack', 'strings', 'parentheses', 'counter'],
    concept: {
      title: 'A primitive piece is a piece where the depth returns to zero',
      body: [
        'A balanced bracket word can be cut into **primitive** pieces: a piece is primitive if it is balanced and cannot be split into two balanced non-empty parts (`(()())` is primitive; `()()` consists of two primitive pieces). In every primitive piece the first `(` and its matching `)` are the **outermost** pair.',
        'Walk along the word with a depth counter. A `(` is outermost exactly when the depth is **0 before** it; a `)` is outermost exactly when the depth is **0 after** it. Keep all other brackets.',
        { code: 'depth = 0\nfor ch in s:\n    if ch == "(":\n        if depth > 0: out.append(ch)\n        depth += 1\n    else:\n        depth -= 1\n        if depth > 0: out.append(ch)' },
        'Check the depth **before** counting for `(` and **after** counting for `)`; swapping them is the typical mistake. If everything is removed, print `empty`.'
      ]
    },
    statement: ['A balanced word of parentheses is split into primitive pieces (balanced pieces that cannot be split further). From every primitive piece remove its outermost pair of parentheses, and join the results. Print the new word, or `empty` if nothing remains.'],
    inputFormat: ['A single balanced word of `(` and `)`.'],
    outputFormat: ['Print the new word, or `empty`.'],
    constraints: ['2 <= length <= 20000'],
    examples: [{ input: '(()())(())\n', note: 'The pieces (()()) and (()) give ()() and (): ()()().' }, { input: '()()\n', note: 'Both pieces lose their only pair: empty.' }],
    hints: ['Track the current depth with a counter.', 'An opening bracket is outermost when the depth is 0 before it.', 'A closing bracket is outermost when the depth is 0 after it.'],
    program: {
      io: ['s:word'],
      python: r`
        depth = 0
        out = []
        for ch in s:
            if ch == "(":
                if depth > 0:
                    out.append(ch)
                depth += 1
            else:
                depth -= 1
                if depth > 0:
                    out.append(ch)
        print("".join(out) if out else "empty")`,
      cpp: r`
        int depth = 0;
        string out;
        for (char ch : s) {
            if (ch == '(') {
                if (depth > 0) out += ch;
                depth++;
            } else {
                depth--;
                if (depth > 0) out += ch;
            }
        }
        cout << (out.empty() ? "empty" : out) << "\n";`,
      java: r`
        int depth = 0;
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch == '(') {
                if (depth > 0) out.append(ch);
                depth++;
            } else {
                depth--;
                if (depth > 0) out.append(ch);
            }
        }
        System.out.println(out.length() == 0 ? "empty" : out.toString());`
    },
    solution: { explanation: ['An opening bracket at depth 0 and a closing bracket that brings the depth back to 0 are the outermost ones; all other brackets are kept.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { let d = 0; let out = ''; for (const ch of input.trim()) { if (ch === '(') { if (d > 0) out += ch; d++; } else { d--; if (d > 0) out += ch; } } return show(out); },
    tests() { const g = rng(521); const pieces = (count, len) => many(count, () => '(' + balanced(g, len, ['()']) + ')').join(''); return ['(()())(())\n', '()()\n', '()\n', '(())\n', `${pieces(5, 6)}\n`, `${balanced(g, 30, ['()'])}\n`, `${balanced(g, 2000, ['()'])}\n`, `${balanced(g, 20000, ['()'])}\n`, `${pieces(1000, 18)}\n`, `${'()'.repeat(10000)}\n`, `${'('.repeat(10000)}${')'.repeat(10000)}\n`]; }
  },

  {
    slug: 'crawler-log-folder',
    title: 'Back to the Main Folder',
    difficulty: 'easy',
    tags: ['stack', 'simulation', 'counter'],
    concept: {
      title: 'A path is a stack of folders',
      body: [
        'Moving through folders is a stack. Entering a folder `x/` **pushes** it, going up with `../` **pops** the current folder (nothing happens in the main folder, which has no parent), and `./` stays where you are.',
        { code: 'depth = 0\nfor log in logs:\n    if log == "../":\n        depth = max(0, depth - 1)\n    elif log != "./":\n        depth += 1' },
        'If you only need to know **how many** folders you are deep (and not which ones), a counter is enough. The minimum number of `../` steps needed to get back to the main folder is exactly this depth.'
      ]
    },
    statement: ['You start in the main folder and run `n` commands. `../` moves to the parent folder (and does nothing in the main folder). `./` stays in the same folder. `name/` moves into the child folder `name`. After all commands, print the minimum number of `../` steps that are needed to get back to the main folder.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` commands.'],
    outputFormat: ['Print the number of steps.'],
    constraints: ['1 <= n <= 20000', 'A folder name has 1 to 5 lowercase letters followed by `/`.'],
    examples: [{ input: '6\nd1/ d2/ ../ d21/ ./ d22/\n', note: 'd1/ and d2/ make the depth 2, ../ makes it 1, d21/ makes it 2, ./ changes nothing, d22/ makes it 3: three steps back.' }],
    hints: ['Every move into a folder makes you one level deeper.', '`../` makes you one level less deep, but never below the main folder.', '`./` changes nothing.'],
    program: {
      io: ['n:int', 'logs:word[n]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        depth = 0
        for log in logs:
            if log == "../":
                depth = max(0, depth - 1)
            elif log != "./":
                depth += 1
        print(depth)`,
      cpp: r`
        int depth = 0;
        for (int i = 0; i < n; i++) {
            if (logs[i] == "../") depth = max(0, depth - 1);
            else if (logs[i] != "./") depth++;
        }
        cout << depth << "\n";`,
      java: r`
        int depth = 0;
        for (int i = 0; i < n; i++) {
            if (logs[i].equals("../")) depth = Math.max(0, depth - 1);
            else if (!logs[i].equals("./")) depth++;
        }
        System.out.println(depth);`
    },
    solution: { explanation: ['The current folder depth is kept in a counter: a folder name adds one, `../` subtracts one but not below zero, and `./` changes nothing. The depth is the number of steps back.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { let d = 0; for (const l of rows(input)[1].split(' ')) { if (l === '../') d = Math.max(0, d - 1); else if (l !== './') d++; } return String(d); },
    tests() { const g = rng(522); const make = (n, pUp, pStay) => { const logs = many(n, () => { const x = g(); return x < pUp ? '../' : x < pUp + pStay ? './' : randWord(g, randInt(g, 1, 5), 'abc') + '/'; }); return `${n}\n${logs.join(' ')}\n`; }; return ['6\nd1/ d2/ ../ d21/ ./ d22/\n', '1\n../\n', '1\n./\n', '1\nab/\n', '3\n../ ../ ../\n', make(20, 0.3, 0.2), make(2000, 0.4, 0.2), make(20000, 0.4, 0.2), make(20000, 0.1, 0.1), make(20000, 0.6, 0.1), make(20000, 0, 0)]; }
  }
];
