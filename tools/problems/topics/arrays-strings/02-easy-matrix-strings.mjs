import { r, rng, randInt, randArray, many, arr, nums, rows, mat, parseGrid, randGrid, randWord } from '../../lib.mjs';

const square = (g, n, lo, hi) => `${n}\n` + mat(Array.from({ length: n }, () => randArray(g, n, lo, hi)));

export default [
  {
    slug: 'plus-one-digits',
    title: 'Plus One',
    difficulty: 'easy',
    tags: ['arrays', 'math', 'carry'],
    concept: {
      title: 'Adding with a carry, from the right',
      body: [
        'A number stored as an array of digits is added to from the **right end**, like on paper. Adding 1 to a digit below 9 is the end of the story. A 9 becomes 0 and the carry moves one digit to the left.',
        { code: 'i = n - 1\nwhile i >= 0 and a[i] == 9:\n    a[i] = 0\n    i -= 1\nif i >= 0:\n    a[i] += 1\nelse:\n    a = [1] + a   # 999 + 1 = 1000' },
        'Only when every digit was a 9 does the array grow by one place.'
      ]
    },
    statement: ['A non-negative number is given as `n` digits, the most significant digit first (there are no leading zeros, except for the number 0 itself). Add 1 to the number and print its digits.'],
    inputFormat: ['The first line has `n`.', 'The second line has the `n` digits separated by spaces.'],
    outputFormat: ['Print the digits of the new number separated by spaces.'],
    constraints: ['1 <= n <= 1000', 'Each digit is between 0 and 9.'],
    examples: [{ input: '3\n1 2 9\n', note: '129 + 1 = 130.' }, { input: '3\n9 9 9\n', note: '999 + 1 = 1000.' }],
    hints: ['Start at the last digit.', 'A digit 9 turns into 0 and the carry goes to the next digit on the left.', 'If you run out of digits, the new number starts with a 1.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      python: r`
        i = n - 1
        while i >= 0 and a[i] == 9:
            a[i] = 0
            i -= 1
        if i >= 0:
            a[i] += 1
        else:
            a = [1] + a
        print(*a)`,
      cpp: r`
        int i = n - 1;
        while (i >= 0 && a[i] == 9) {
            a[i] = 0;
            i--;
        }
        if (i >= 0) a[i]++;
        else a.insert(a.begin(), 1);
        for (size_t k = 0; k < a.size(); k++) cout << a[k] << (k + 1 < a.size() ? " " : "\n");`,
      java: r`
        int i = (int) n - 1;
        while (i >= 0 && a[i] == 9) {
            a[i] = 0;
            i--;
        }
        StringBuilder sb = new StringBuilder();
        if (i >= 0) a[i]++;
        else sb.append("1 ");
        for (int k = 0; k < a.length; k++) sb.append(a[k]).append(k + 1 < a.length ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Walk from the last digit. Nines become zeros. The first digit that is not a nine gets +1 and the work is done. If all digits were nines, a leading 1 is added.'], complexity: 'Time O(n), space O(1) besides the output.' },
    solve(input) { const a = nums(rows(input)[1]); let i = a.length - 1; while (i >= 0 && a[i] === 9) { a[i] = 0; i--; } if (i >= 0) a[i]++; else a.unshift(1); return a.join(' '); },
    tests() { const g = rng(111); const digits = (n) => arr([randInt(g, 1, 9), ...randArray(g, n - 1, 0, 9)]); return ['3\n1 2 9\n', '3\n9 9 9\n', '1\n0\n', '1\n9\n', '1\n5\n', '4\n1 9 9 8\n', '5\n8 9 9 9 9\n', digits(12), `1000\n${Array(1000).fill(9).join(' ')}\n`, digits(1000)]; }
  },

  {
    slug: 'count-peaks',
    title: 'Count the Peaks',
    difficulty: 'easy',
    tags: ['arrays', 'neighbours'],
    concept: {
      title: 'Looking at neighbours',
      body: [
        'Some questions compare an element with the elements next to it. The loop then runs over the **inner** positions, those that have a left and a right neighbour: `i` from `1` to `n - 2`.',
        { code: 'count = 0\nfor i in range(1, n - 1):\n    if a[i] > a[i - 1] and a[i] > a[i + 1]:\n        count += 1' },
        'Start the loop at 1 and stop before the last place, so that `a[i - 1]` and `a[i + 1]` always exist. For an array shorter than 3 the loop simply does not run.'
      ]
    },
    statement: ['A **peak** is an element that is strictly greater than both of its neighbours. The first and the last element have only one neighbour, so they are never peaks. Count the peaks of the array.'],
    inputFormat: ['The first line has `n`.', 'The second line has `n` integers.'],
    outputFormat: ['Print the number of peaks.'],
    constraints: ['1 <= n <= 1000', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '7\n1 3 2 2 5 4 6\n', note: 'The peaks are 3 and 5.' }],
    hints: ['Only the positions 1 to n - 2 can be peaks.', 'Compare `a[i]` with `a[i - 1]` and with `a[i + 1]`.', 'The comparison is strict, so a plateau such as 2 2 is not a peak.'],
    program: {
      io: ['n:int', 'a:int[n]'],
      python: r`
        count = 0
        for i in range(1, n - 1):
            if a[i] > a[i - 1] and a[i] > a[i + 1]:
                count += 1
        print(count)`,
      cpp: r`
        int count = 0;
        for (int i = 1; i < n - 1; i++) {
            if (a[i] > a[i - 1] && a[i] > a[i + 1]) count++;
        }
        cout << count << "\n";`,
      java: r`
        int count = 0;
        for (int i = 1; i < n - 1; i++) {
            if (a[i] > a[i - 1] && a[i] > a[i + 1]) count++;
        }
        System.out.println(count);`
    },
    solution: { explanation: ['Check every inner position against its two neighbours.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const a = nums(rows(input)[1]); let c = 0; for (let i = 1; i < a.length - 1; i++) if (a[i] > a[i - 1] && a[i] > a[i + 1]) c++; return String(c); },
    tests() { const g = rng(112); const b = (n, lo, hi) => arr(randArray(g, n, lo, hi)); return ['7\n1 3 2 2 5 4 6\n', '1\n5\n', '2\n1 2\n', '3\n1 2 1\n', '3\n1 1 1\n', '5\n1 2 3 4 5\n', '6\n5 1 5 1 5 1\n', b(25, 0, 4), b(1000, -1000000000, 1000000000), b(1000, 0, 2)]; }
  },

  {
    slug: 'matrix-transpose',
    title: 'Transpose a Matrix',
    difficulty: 'easy',
    tags: ['matrix', '2d-arrays'],
    concept: {
      title: 'Rows become columns',
      body: [
        'A matrix with `n` rows and `m` columns is read with two indexes: `g[i][j]` is the value in row `i` and column `j`. The **transpose** swaps the roles of the two indexes: the value `g[i][j]` goes to row `j`, column `i`. The result has `m` rows and `n` columns.',
        { code: 'for j in range(m):\n    row = [g[i][j] for i in range(n)]\n    print(*row)' },
        'Printing the new row `j` means walking down the old column `j`.'
      ]
    },
    statement: ['Print the transpose of a matrix with `n` rows and `m` columns.'],
    inputFormat: ['The first line has `n` and `m`.', 'The next `n` lines have `m` integers each.'],
    outputFormat: ['Print `m` lines with `n` integers each.'],
    constraints: ['1 <= n, m <= 100', '-10^9 <= each number <= 10^9'],
    examples: [{ input: '2 3\n1 2 3\n4 5 6\n', note: 'The first column 1 4 becomes the first row.' }],
    hints: ['The result has m rows and n columns.', 'Row j of the result is column j of the input.', 'Use two loops: j on the outside, i on the inside, and print `g[i][j]`.'],
    program: {
      io: ['n:int m:int', 'g:int[n][m]'],
      python: r`
        for j in range(m):
            print(*[g[i][j] for i in range(n)])`,
      cpp: r`
        for (int j = 0; j < m; j++) {
            for (int i = 0; i < n; i++) {
                cout << g[i][j] << (i + 1 < n ? " " : "\n");
            }
        }`,
      java: r`
        StringBuilder sb = new StringBuilder();
        for (int j = 0; j < m; j++) {
            for (int i = 0; i < n; i++) {
                sb.append(g[i][j]).append(i + 1 < n ? " " : "\n");
            }
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Print row `j` of the result by reading the old matrix down column `j`.'], complexity: 'Time O(n * m), space O(1) besides the output.' },
    solve(input) { const { n, m, g } = parseGrid(input); const out = []; for (let j = 0; j < m; j++) out.push(g.map((row) => row[j]).join(' ')); return out.join('\n'); },
    tests() { const g = rng(113); return ['2 3\n1 2 3\n4 5 6\n', '1 1\n7\n', '1 4\n1 2 3 4\n', '4 1\n1\n2\n3\n4\n', '3 3\n1 2 3\n4 5 6\n7 8 9\n', randGrid(g, 5, 8, -9, 9), randGrid(g, 100, 100, -1000000000, 1000000000), randGrid(g, 37, 100, 0, 100)]; }
  },

  {
    slug: 'diagonal-sums',
    title: 'Diagonal Sums',
    difficulty: 'easy',
    tags: ['matrix', '2d-arrays', 'indexes'],
    concept: {
      title: 'Diagonals are index patterns',
      body: [
        'In a square matrix of size `n` the **main diagonal** holds the cells where row and column are equal: `g[i][i]`. The **anti-diagonal** runs from the top right to the bottom left: row `i` meets column `n - 1 - i`.',
        { code: 'main = sum(g[i][i] for i in range(n))\nanti = sum(g[i][n - 1 - i] for i in range(n))' },
        'One loop over `i` is enough. You never need to look at the other cells.'
      ]
    },
    statement: ['Given a square matrix of size `n`, print the sum of the main diagonal and the sum of the anti-diagonal. If `n` is odd, the centre cell belongs to both diagonals and is counted in both sums.'],
    inputFormat: ['The first line has `n`.', 'The next `n` lines have `n` integers each.'],
    outputFormat: ['Print the two sums separated by a space.'],
    constraints: ['1 <= n <= 100', '-10^6 <= each number <= 10^6'],
    examples: [{ input: '3\n1 2 3\n4 5 6\n7 8 9\n', note: 'Main: 1+5+9 = 15. Anti: 3+5+7 = 15.' }],
    hints: ['The main diagonal cells are `g[i][i]`.', 'The anti-diagonal cells are `g[i][n - 1 - i]`.', 'One loop over i adds one cell to each sum.'],
    program: {
      io: ['n:int', 'g:int[n][n]'],
      python: r`
        main = 0
        anti = 0
        for i in range(n):
            main += g[i][i]
            anti += g[i][n - 1 - i]
        print(main, anti)`,
      cpp: r`
        long long mainSum = 0, anti = 0;
        for (int i = 0; i < n; i++) {
            mainSum += g[i][i];
            anti += g[i][n - 1 - i];
        }
        cout << mainSum << " " << anti << "\n";`,
      java: r`
        long main = 0, anti = 0;
        for (int i = 0; i < n; i++) {
            main += g[i][i];
            anti += g[i][(int) n - 1 - i];
        }
        System.out.println(main + " " + anti);`
    },
    solution: { explanation: ['Cell `(i, i)` is on the main diagonal and cell `(i, n-1-i)` is on the anti-diagonal. One loop adds both.'], complexity: 'Time O(n), space O(1).' },
    solve(input) { const rs = rows(input); const n = Number(rs[0]); const g = rs.slice(1, 1 + n).map(nums); let a = 0, b = 0; for (let i = 0; i < n; i++) { a += g[i][i]; b += g[i][n - 1 - i]; } return `${a} ${b}`; },
    tests() { const g = rng(114); return ['3\n1 2 3\n4 5 6\n7 8 9\n', '1\n5\n', '2\n1 2\n3 4\n', square(g, 4, -9, 9), square(g, 7, -100, 100), square(g, 50, -1000000, 1000000), square(g, 100, -1000000, 1000000), square(g, 99, 0, 1000000)]; }
  },

  {
    slug: 'row-and-column-sums',
    title: 'Row and Column Sums',
    difficulty: 'easy',
    tags: ['matrix', '2d-arrays', 'sums'],
    concept: {
      title: 'One pass fills two tables of sums',
      body: [
        'Row sums and column sums can be collected in the same double loop. Keep one array with an entry per row and one with an entry per column, and add every cell to both.',
        { code: 'rowSum = [0] * n\ncolSum = [0] * m\nfor i in range(n):\n    for j in range(m):\n        rowSum[i] += g[i][j]\n        colSum[j] += g[i][j]' },
        'Each cell lives in exactly one row and one column, which is why it is added to exactly one entry of each array.'
      ]
    },
    statement: ['Given a matrix with `n` rows and `m` columns, print the sum of each row, and then the sum of each column.'],
    inputFormat: ['The first line has `n` and `m`.', 'The next `n` lines have `m` integers each.'],
    outputFormat: ['The first line: the `n` row sums.', 'The second line: the `m` column sums.'],
    constraints: ['1 <= n, m <= 100', '-10^6 <= each number <= 10^6'],
    examples: [{ input: '2 3\n1 2 3\n4 5 6\n', note: 'Rows: 6 and 15. Columns: 5, 7, 9.' }],
    hints: ['You need one counter per row and one per column.', 'Inside the double loop, add `g[i][j]` to `rowSum[i]` and to `colSum[j]`.', 'Print the two arrays on separate lines.'],
    program: {
      io: ['n:int m:int', 'g:int[n][m]'],
      python: r`
        rowSum = [0] * n
        colSum = [0] * m
        for i in range(n):
            for j in range(m):
                rowSum[i] += g[i][j]
                colSum[j] += g[i][j]
        print(*rowSum)
        print(*colSum)`,
      cpp: r`
        vector<long long> rowSum(n, 0), colSum(m, 0);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                rowSum[i] += g[i][j];
                colSum[j] += g[i][j];
            }
        }
        for (int i = 0; i < n; i++) cout << rowSum[i] << (i + 1 < n ? " " : "\n");
        for (int j = 0; j < m; j++) cout << colSum[j] << (j + 1 < m ? " " : "\n");`,
      java: r`
        long[] rowSum = new long[(int) n];
        long[] colSum = new long[(int) m];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                rowSum[i] += g[i][j];
                colSum[j] += g[i][j];
            }
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(rowSum[i]).append(i + 1 < n ? " " : "\n");
        for (int j = 0; j < m; j++) sb.append(colSum[j]).append(j + 1 < m ? " " : "\n");
        System.out.print(sb);`
    },
    solution: { explanation: ['Two arrays collect the sums. Each cell is added once to its row and once to its column.'], complexity: 'Time O(n * m), space O(n + m).' },
    solve(input) { const { n, m, g } = parseGrid(input); const rs = g.map((row) => row.reduce((s, x) => s + x, 0)); const cs = Array.from({ length: m }, (_, j) => g.reduce((s, row) => s + row[j], 0)); return `${rs.join(' ')}\n${cs.join(' ')}`; },
    tests() { const g = rng(115); return ['2 3\n1 2 3\n4 5 6\n', '1 1\n-3\n', '1 5\n1 2 3 4 5\n', '5 1\n1\n2\n3\n4\n5\n', randGrid(g, 6, 4, -9, 9), randGrid(g, 100, 100, -1000000, 1000000), randGrid(g, 20, 70, 0, 1000000)]; }
  },

  {
    slug: 'matrix-border-sum',
    title: 'Sum of the Border',
    difficulty: 'easy',
    tags: ['matrix', '2d-arrays', 'indexes'],
    concept: {
      title: 'Which cells are on the border',
      body: [
        'A cell is on the border of an `n` by `m` matrix when it is in the first or last row, or in the first or last column. In code that is a four-part condition on the two indexes.',
        { code: 'if i == 0 or i == n - 1 or j == 0 or j == m - 1:\n    total += g[i][j]' },
        'Because the test is one `or`, a corner cell (for example `i == 0` and `j == 0`) is still added only once. A matrix with one row or one column is all border.'
      ]
    },
    statement: ['Given a matrix with `n` rows and `m` columns, print the sum of all cells on its border. Every cell is counted once.'],
    inputFormat: ['The first line has `n` and `m`.', 'The next `n` lines have `m` integers each.'],
    outputFormat: ['Print one integer.'],
    constraints: ['1 <= n, m <= 100', '-10^6 <= each number <= 10^6'],
    examples: [{ input: '3 3\n1 2 3\n4 5 6\n7 8 9\n', note: 'Everything except the centre 5: 45 - 5 = 40.' }],
    hints: ['Loop over all cells and decide for each whether it is on the border.', 'A border cell has `i == 0`, `i == n - 1`, `j == 0` or `j == m - 1`.', 'Join the four tests with `or`, so no cell is added twice.'],
    program: {
      io: ['n:int m:int', 'g:int[n][m]'],
      python: r`
        total = 0
        for i in range(n):
            for j in range(m):
                if i == 0 or i == n - 1 or j == 0 or j == m - 1:
                    total += g[i][j]
        print(total)`,
      cpp: r`
        long long total = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (i == 0 || i == n - 1 || j == 0 || j == m - 1) total += g[i][j];
            }
        }
        cout << total << "\n";`,
      java: r`
        long total = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if (i == 0 || i == n - 1 || j == 0 || j == m - 1) total += g[i][j];
            }
        }
        System.out.println(total);`
    },
    solution: { explanation: ['Visit every cell and add it when it lies in the first or last row or column.'], complexity: 'Time O(n * m), space O(1).' },
    solve(input) { const { n, m, g } = parseGrid(input); let t = 0; for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) if (i === 0 || j === 0 || i === n - 1 || j === m - 1) t += g[i][j]; return String(t); },
    tests() { const g = rng(116); return ['3 3\n1 2 3\n4 5 6\n7 8 9\n', '1 1\n5\n', '1 4\n1 2 3 4\n', '4 1\n1\n2\n3\n4\n', '2 2\n1 2\n3 4\n', randGrid(g, 5, 6, -9, 9), randGrid(g, 100, 100, -1000000, 1000000), randGrid(g, 60, 3, 0, 100)]; }
  },

  {
    slug: 'first-unique-character',
    title: 'First Unique Character',
    difficulty: 'easy',
    tags: ['strings', 'counting', 'frequency'],
    concept: {
      title: 'Counting letters in a table of 26',
      body: [
        'For lowercase letters you can count how often each letter occurs with a table of 26 numbers: the letter `c` has the index `ord(c) - ord("a")`. One pass fills the table.',
        { code: 'count = [0] * 26\nfor ch in s:\n    count[ord(ch) - ord("a")] += 1' },
        'A second pass can then ask the table about each character. Two passes with a small table beat comparing every character with every other one.'
      ]
    },
    statement: ['Given a word of lowercase English letters, find the first character that appears exactly once in the word. Print its index (counting from 0), or -1 if there is no such character.'],
    inputFormat: ['A single word `s`.'],
    outputFormat: ['Print one integer.'],
    constraints: ['1 <= length of s <= 20000'],
    examples: [{ input: 'leetcode\n', note: 'l appears once and is at index 0.' }, { input: 'aabb\n', note: 'Every letter repeats.' }],
    hints: ['Count how often each letter appears.', 'Use an array of 26 counters and `ord(ch) - ord("a")` as the index.', 'Then scan the word from the left and stop at the first letter whose counter is 1.'],
    program: {
      io: ['s:word'],
      python: r`
        count = [0] * 26
        for ch in s:
            count[ord(ch) - ord("a")] += 1
        answer = -1
        for i, ch in enumerate(s):
            if count[ord(ch) - ord("a")] == 1:
                answer = i
                break
        print(answer)`,
      cpp: r`
        int count[26] = {0};
        for (char ch : s) count[ch - 'a']++;
        int answer = -1;
        for (int i = 0; i < (int) s.size(); i++) {
            if (count[s[i] - 'a'] == 1) {
                answer = i;
                break;
            }
        }
        cout << answer << "\n";`,
      java: r`
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) count[s.charAt(i) - 'a']++;
        int answer = -1;
        for (int i = 0; i < s.length(); i++) {
            if (count[s.charAt(i) - 'a'] == 1) {
                answer = i;
                break;
            }
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['The first pass counts the letters. The second pass returns the first position whose letter has a count of 1.'], complexity: 'Time O(n), space O(1) (26 counters).' },
    solve(input) { const s = input.trim(); for (let i = 0; i < s.length; i++) if (s.indexOf(s[i]) === s.lastIndexOf(s[i])) return String(i); return '-1'; },
    tests() { const g = rng(117); const pairs = 'abcdefghijklmnopqrstuvwxyz'.repeat(3); return ['leetcode\n', 'aabb\n', 'z\n', 'aab\n', 'abab\n', 'loveleetcode\n', `${randWord(g, 30, 'abcdef')}\n`, `${randWord(g, 20000, 'abcdefghijklmnopqrstuvwxyz')}\n`, `${pairs}${pairs}x${pairs}\n`.replace(/x/, 'x'), `${'ab'.repeat(10000)}\n`]; }
  },

  {
    slug: 'valid-anagram',
    title: 'Valid Anagram',
    difficulty: 'easy',
    tags: ['strings', 'counting', 'anagram'],
    concept: {
      title: 'Same letters, same counts',
      body: [
        'Two words are **anagrams** when they use exactly the same letters the same number of times, only in a different order. You can test that without sorting: count the letters of the first word up, and the letters of the second word down. If every counter ends at zero, the words are anagrams.',
        { code: 'count = [0] * 26\nfor ch in s: count[ord(ch) - 97] += 1\nfor ch in t: count[ord(ch) - 97] -= 1\nok = all(c == 0 for c in count)' },
        'First compare the lengths: words of different length can never be anagrams.'
      ]
    },
    statement: ['You are given two words of lowercase English letters. Print `yes` if the second word can be made by rearranging the letters of the first, otherwise print `no`.'],
    inputFormat: ['The first line has the word `s`.', 'The second line has the word `t`.'],
    outputFormat: ['Print `yes` or `no`.'],
    constraints: ['1 <= length of s, t <= 20000'],
    examples: [{ input: 'listen\nsilent\n', note: 'Same letters, different order.' }, { input: 'rat\ncar\n', note: 'The letters differ.' }],
    hints: ['Words of different length are never anagrams.', 'Count the letters of `s` up and the letters of `t` down in one table of 26 counters.', 'The answer is `yes` only when all counters are zero at the end.'],
    program: {
      io: ['s:word', 't:word'],
      python: r`
        count = [0] * 26
        for ch in s:
            count[ord(ch) - ord("a")] += 1
        for ch in t:
            count[ord(ch) - ord("a")] -= 1
        print("yes" if len(s) == len(t) and all(c == 0 for c in count) else "no")`,
      cpp: r`
        int count[26] = {0};
        for (char ch : s) count[ch - 'a']++;
        for (char ch : t) count[ch - 'a']--;
        bool ok = s.size() == t.size();
        for (int c = 0; c < 26; c++) {
            if (count[c] != 0) ok = false;
        }
        cout << (ok ? "yes" : "no") << "\n";`,
      java: r`
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) count[s.charAt(i) - 'a']++;
        for (int i = 0; i < t.length(); i++) count[t.charAt(i) - 'a']--;
        boolean ok = s.length() == t.length();
        for (int c = 0; c < 26; c++) {
            if (count[c] != 0) ok = false;
        }
        System.out.println(ok ? "yes" : "no");`
    },
    solution: { explanation: ['Count the letters of `s` up and of `t` down. The words are anagrams exactly when every counter returns to zero.'], complexity: 'Time O(n), space O(1) (26 counters).' },
    solve(input) { const [s, t] = rows(input); return [...s].sort().join('') === [...t].sort().join('') ? 'yes' : 'no'; },
    tests() { const g = rng(118); const shuf = (w) => [...w].sort(() => g() - 0.5).join(''); const w1 = randWord(g, 20000, 'abcdefghijklmnopqrstuvwxyz'); const w2 = randWord(g, 30, 'abc'); return ['listen\nsilent\n', 'rat\ncar\n', 'a\na\n', 'a\nb\n', 'ab\nabc\n', 'aab\nabb\n', `${w2}\n${shuf(w2)}\n`, `${w1}\n${shuf(w1)}\n`, `${w1}\n${shuf(w1).replace(/^./, (c) => (c === 'a' ? 'b' : 'a'))}\n`]; }
  },

  {
    slug: 'longest-common-prefix',
    title: 'Longest Common Prefix',
    difficulty: 'easy',
    tags: ['strings', 'prefix'],
    concept: {
      title: 'Shrink the candidate',
      body: [
        'The common prefix of a list of words can only be as long as the shortest agreement. Start with the first word as the candidate and compare it with each other word, cutting the candidate down to the part both share.',
        { code: 'prefix = words[0]\nfor w in words[1:]:\n    k = 0\n    while k < len(prefix) and k < len(w) and prefix[k] == w[k]:\n        k += 1\n    prefix = prefix[:k]' },
        'The candidate never grows, so after the last word it is the longest prefix that all words share. It may become empty.'
      ]
    },
    statement: ['You are given `k` words. Print the longest string that is a prefix of every word. If the words have no common prefix, print -1.'],
    inputFormat: ['The first line has `k`.', 'Each of the next `k` lines has one word.'],
    outputFormat: ['Print the prefix, or -1 if it is empty.'],
    constraints: ['1 <= k <= 100', '1 <= length of each word <= 200', 'The words contain lowercase letters.'],
    examples: [{ input: '3\nflower\nflow\nflight\n', note: 'All three start with fl.' }, { input: '2\ndog\ncar\n', note: 'Nothing in common.' }],
    hints: ['Start with the first word as the candidate prefix.', 'For each other word, find how many leading letters it shares with the candidate.', 'Cut the candidate to that length. If it becomes empty, the answer is -1.'],
    program: {
      io: ['k:int', 'w:rows[k]'],
      python: r`
        prefix = w[0]
        for word in w[1:]:
            j = 0
            while j < len(prefix) and j < len(word) and prefix[j] == word[j]:
                j += 1
            prefix = prefix[:j]
        print(prefix if prefix else -1)`,
      cpp: r`
        string prefix = w[0];
        for (int i = 1; i < k; i++) {
            size_t j = 0;
            while (j < prefix.size() && j < w[i].size() && prefix[j] == w[i][j]) j++;
            prefix = prefix.substr(0, j);
        }
        if (prefix.empty()) cout << -1 << "\n";
        else cout << prefix << "\n";`,
      java: r`
        String prefix = w[0];
        for (int i = 1; i < w.length; i++) {
            int j = 0;
            while (j < prefix.length() && j < w[i].length() && prefix.charAt(j) == w[i].charAt(j)) j++;
            prefix = prefix.substring(0, j);
        }
        System.out.println(prefix.isEmpty() ? "-1" : prefix);`
    },
    solution: { explanation: ['Keep the first word as the candidate and shorten it to the part shared with each following word.'], complexity: 'Time O(total number of letters), space O(1) besides the input.' },
    solve(input) { const [, ...w] = rows(input); let p = w[0]; for (const x of w.slice(1)) { let j = 0; while (j < p.length && j < x.length && p[j] === x[j]) j++; p = p.slice(0, j); } return p || '-1'; },
    tests() { const g = rng(119); const withPrefix = (pre, k) => `${k}\n` + many(k, () => pre + randWord(g, randInt(g, 1, 8), 'abc')).join('\n') + '\n'; return ['3\nflower\nflow\nflight\n', '2\ndog\ncar\n', '1\nalone\n', '2\nsame\nsame\n', '2\nab\nabc\n', '3\nabc\nab\na\n', withPrefix('xyzxyz', 6), withPrefix('', 10), withPrefix('a'.repeat(150), 100)]; }
  },

  {
    slug: 'reverse-words',
    title: 'Reverse the Words',
    difficulty: 'easy',
    tags: ['strings', 'words', 'split'],
    concept: {
      title: 'Split, reverse, join',
      body: [
        'To work with the words of a sentence, **split** it at the spaces into a list, then change the list, then **join** it back with single spaces. Splitting on whitespace ignores extra spaces at the start, at the end and between words.',
        { code: 'words = line.split()\nwords.reverse()\nresult = " ".join(words)' },
        'Many languages have these two functions built in. In C++ a `stringstream` reads word after word, and in Java `split("\\\\s+")` does the job.'
      ]
    },
    statement: ['Given a line of text, print its words in reverse order, separated by single spaces. The words are separated by one or more spaces, and the line may begin or end with spaces.'],
    inputFormat: ['A single line of text.'],
    outputFormat: ['Print the words in reverse order on one line.'],
    constraints: ['The line has between 1 and 1000 characters and at least one word.', 'Words contain letters and digits.'],
    examples: [{ input: 'the sky is blue\n', note: 'The order of the words is reversed, not the letters.' }, { input: '  hello   world  \n', note: 'Extra spaces are dropped.' }],
    hints: ['Split the line into words first.', 'Reverse the list of words.', 'Join the words with a single space.'],
    program: {
      io: ['s:line'],
      includes: ['<sstream>'],
      python: r`
        words = s.split()
        words.reverse()
        print(" ".join(words))`,
      cpp: r`
        stringstream ss(s);
        vector<string> words;
        string word;
        while (ss >> word) words.push_back(word);
        for (int i = (int) words.size() - 1; i >= 0; i--) {
            cout << words[i] << (i > 0 ? " " : "\n");
        }`,
      java: r`
        String[] words = s.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            sb.append(words[i]).append(i > 0 ? " " : "\n");
        }
        System.out.print(sb);`
    },
    solution: { explanation: ['Split the line into words, walk through the list from the end, and print the words with single spaces.'], complexity: 'Time O(n), space O(n).' },
    solve(input) { return input.replace(/\n$/, '').trim().split(/\s+/).reverse().join(' '); },
    tests() { const g = rng(120); const sentence = (count) => many(count, () => randWord(g, randInt(g, 1, 8), 'abcdefxyz019')).join(' '); return ['the sky is blue\n', '  hello   world  \n', 'one\n', ' a \n', 'a b c d e f g\n', `${sentence(8)}\n`, `  ${sentence(5).replace(/ /g, '   ')}   \n`, `${sentence(200)}\n`]; }
  }
];
