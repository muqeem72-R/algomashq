import { r, rng, randInt, many, nums, rows, shuffle, randArray, randWord } from '../../lib.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const lines = (list) => list.map((p) => p.join(' ')).join('\n');
const dedent = (s) => { const ls = s.replace(/^\n/, '').split('\n'); const ind = Math.min(...ls.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)); return ls.map((l) => l.slice(ind)).join('\n'); };
const lowerBound = (a, v) => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] < v) lo = mid + 1; else hi = mid; } return lo; };
const upperBound = (a, v) => { let lo = 0, hi = a.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (a[mid] <= v) lo = mid + 1; else hi = mid; } return lo; };
const LOWER_BOUND_JAVA = r`
    static int lowerBound(long[] a, long v) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (a[mid] < v) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }`;

export default [
  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the length of the list and the number of questions.', 'The second line has the `n` numbers of the list.', 'Each of the next `q` lines has two numbers `l` and `r`.'],
    constraints: ['1 <= n, q <= 20000', '1 <= a[i] <= 10^9', '1 <= l <= r <= n'],
    slug: 'equal-pairs-in-ranges',
    title: 'How Many Pairs of Equal Numbers Are Inside Each Range?',
    tags: ["mo's-algorithm", 'offline-queries', 'sqrt-decomposition', 'counting'],
    concept: {
      title: "Mo's algorithm: answer the questions in a clever order, so the window [l, r] only slides a little between two questions",
      body: [
        'A list is fixed and every question gives a range `l..r`: **how many pairs of positions `i < j` inside the range hold equal numbers?** For `1 2 1 2 1` the whole list has three 1s (3 pairs) and two 2s (1 pair): the answer is 4. Counting the values of each range from scratch is O(n) per question.',
        'Keep a **window** `[cl, cr]` with a table `cnt` of how many times each value is inside it, and the current answer `cur`. Adding a number `v` on either side creates `cnt[v]` new pairs (one with every copy already inside): `cur += cnt[v]; cnt[v] += 1`. Removing a number does the opposite: `cnt[v] -= 1; cur -= cnt[v]`. Moving the window by one place costs O(1), so the answer for the next question is found by moving the ends to the new `l` and `r`. The only question is the **order** of the questions.',
        { code: 'block = max(1, int(n / sqrt(q)))\norder = sorted(range(q), key=lambda j: (l[j] // block, r[j] if (l[j] // block) % 2 == 0 else -r[j]))\nfor j in order:\n    while cl > l[j]: cl -= 1; add(cl)           # grow first,\n    while cr < r[j]: cr += 1; add(cr)\n    while cl < l[j]: remove(cl); cl += 1        # then shrink\n    while cr > r[j]: remove(cr); cr -= 1\n    ans[j] = cur' },
        "Split the positions into blocks of about `n / sqrt(q)`. Sort the questions by the block of `l`, and inside a block by `r` (alternately ascending and descending, which saves walking back). Inside one block `l` moves at most one block size for each question, and `r` makes one sweep per block, so the total walk is O(n sqrt(q)). Growing before shrinking keeps every count non-negative. The answer can reach about 2 * 10^8."
      ]
    },
    statement: ['A list of `n` numbers is given. Answer `q` questions. Each question has two positions `l` and `r`: count the pairs of positions `i < j` with `l <= i`, `j <= r` and `a[i] = a[j]`. Print the answers on one line, in the order of the questions.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: '5 3\n1 2 1 2 1\n1 5\n2 4\n3 3\n', note: 'The whole list has three 1s (3 pairs) and two 2s (1 pair): 4. The range 2..4 is 2 1 2: one pair. A single position has no pair: 4 1 0.' }],
    hints: ['Keep a window and a table with the count of every value inside it; adding a number creates cnt[v] new pairs.', 'Moving the window by one place is O(1), so the cost of a question is the distance between its ends and the ends of the previous question.', "Sort the questions by the block of l and then by r, with blocks of about n / sqrt(q) positions (Mo's order)."],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'qs:int[q][2]'],
      fast: true,
      python: r`
        import math
        vals = sorted(set(a))
        rank = {v: i for i, v in enumerate(vals)}
        rk = [rank[v] for v in a]
        cnt = [0] * len(vals)
        block = max(1, int(n / math.sqrt(q)))
        order = sorted(range(q), key=lambda j: (qs[j][0] // block, qs[j][1] if (qs[j][0] // block) % 2 == 0 else -qs[j][1]))
        ans = [0] * q
        cl = 0
        cr = -1
        cur = 0
        for j in order:
            l = qs[j][0] - 1
            rr = qs[j][1] - 1
            while cl > l:
                cl -= 1
                v = rk[cl]
                cur += cnt[v]
                cnt[v] += 1
            while cr < rr:
                cr += 1
                v = rk[cr]
                cur += cnt[v]
                cnt[v] += 1
            while cl < l:
                v = rk[cl]
                cnt[v] -= 1
                cur -= cnt[v]
                cl += 1
            while cr > rr:
                v = rk[cr]
                cnt[v] -= 1
                cur -= cnt[v]
                cr -= 1
            ans[j] = cur
        print(*ans)`,
      cpp: r`
        vector<long long> vals(a.begin(), a.end());
        sort(vals.begin(), vals.end());
        vals.erase(unique(vals.begin(), vals.end()), vals.end());
        vector<int> rk(n);
        for (long long i = 0; i < n; i++) rk[i] = (int)(lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin());
        vector<long long> cnt(vals.size(), 0);
        long long block = max(1LL, (long long)(n / sqrt((double)q)));
        vector<int> order(q);
        for (long long j = 0; j < q; j++) order[j] = (int)j;
        sort(order.begin(), order.end(), [&](int x, int y) {
            long long bx = qs[x][0] / block, by = qs[y][0] / block;
            if (bx != by) return bx < by;
            if (bx % 2 == 0) return qs[x][1] < qs[y][1];
            return qs[x][1] > qs[y][1];
        });
        vector<long long> ans(q, 0);
        long long cl = 0, cr = -1, cur = 0;
        for (long long idx = 0; idx < q; idx++) {
            int j = order[idx];
            long long l = qs[j][0] - 1, rr = qs[j][1] - 1;
            while (cl > l) {
                cl--;
                int v = rk[cl];
                cur += cnt[v];
                cnt[v]++;
            }
            while (cr < rr) {
                cr++;
                int v = rk[cr];
                cur += cnt[v];
                cnt[v]++;
            }
            while (cl < l) {
                int v = rk[cl];
                cnt[v]--;
                cur -= cnt[v];
                cl++;
            }
            while (cr > rr) {
                int v = rk[cr];
                cnt[v]--;
                cur -= cnt[v];
                cr--;
            }
            ans[j] = cur;
        }
        string out;
        for (long long j = 0; j < q; j++) {
            if (j > 0) out += " ";
            out += to_string(ans[j]);
        }
        cout << out << "\n";`,
      java: r`
        int cnt0 = (int) n;
        int qq = (int) q;
        long[] keys = new long[cnt0];
        for (int i = 0; i < cnt0; i++) keys[i] = (a[i] << 15) | i;
        Arrays.sort(keys);
        int[] rk = new int[cnt0];
        int m = 0;
        long last = -1;
        for (int i = 0; i < cnt0; i++) {
            long v = keys[i] >> 15;
            if (v != last) {
                m++;
                last = v;
            }
            rk[(int) (keys[i] & 32767)] = m - 1;
        }
        long[] cnt = new long[m];
        int block = Math.max(1, (int) (n / Math.sqrt(q)));
        long[] ks = new long[qq];
        for (int j = 0; j < qq; j++) {
            long bi = qs[j][0] / block;
            long rr = (bi % 2 == 0) ? qs[j][1] : 32767 - qs[j][1];
            ks[j] = (bi << 30) | (rr << 15) | j;
        }
        Arrays.sort(ks);
        long[] ans = new long[qq];
        int cl = 0, cr = -1;
        long cur = 0;
        for (int idx = 0; idx < qq; idx++) {
            int j = (int) (ks[idx] & 32767);
            int l = (int) qs[j][0] - 1, rr = (int) qs[j][1] - 1;
            while (cl > l) {
                cl--;
                int v = rk[cl];
                cur += cnt[v];
                cnt[v]++;
            }
            while (cr < rr) {
                cr++;
                int v = rk[cr];
                cur += cnt[v];
                cnt[v]++;
            }
            while (cl < l) {
                int v = rk[cl];
                cnt[v]--;
                cur -= cnt[v];
                cl++;
            }
            while (cr > rr) {
                int v = rk[cr];
                cnt[v]--;
                cur -= cnt[v];
                cr--;
            }
            ans[j] = cur;
        }
        StringBuilder out = new StringBuilder();
        for (int j = 0; j < qq; j++) {
            if (j > 0) out.append(" ");
            out.append(ans[j]);
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<cmath>', '<string>']
    },
    solution: { explanation: ["The questions are sorted in Mo's order (by the block of l, then by r in alternating direction). A window with a table of counts moves from one question to the next in O(1) per step, adding or removing a number changes the number of equal pairs by the current count of its value."], complexity: 'Time O((n + q) sqrt(n)), space O(n + q).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const qs = many(q, (j) => nums(rs[2 + j])); const vals = [...new Set(a)].sort((x, y) => x - y); const rk = a.map((v) => lowerBound(vals, v)); const cnt = new Int32Array(vals.length);
      const block = Math.max(1, Math.floor(n / Math.sqrt(q))); const order = Array.from({ length: q }, (_, j) => j).sort((x, y) => { const bx = Math.floor(qs[x][0] / block), by = Math.floor(qs[y][0] / block); if (bx !== by) return bx - by; return bx % 2 === 0 ? qs[x][1] - qs[y][1] : qs[y][1] - qs[x][1]; });
      const ans = new Array(q); let cl = 0, cr = -1, cur = 0; for (const j of order) { const l = qs[j][0] - 1, rr = qs[j][1] - 1; while (cl > l) { cl--; cur += cnt[rk[cl]]++; } while (cr < rr) { cr++; cur += cnt[rk[cr]]++; } while (cl < l) { cur -= --cnt[rk[cl]]; cl++; } while (cr > rr) { cur -= --cnt[rk[cr]]; cr--; } ans[j] = cur; } return ans.join(' ');
    },
    tests() {
      const g = rng(5101); const out = ['5 3\n1 2 1 2 1\n1 5\n2 4\n3 3\n', '1 1\n7\n1 1\n'];
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const res = []; for (let j = 0; j < q; j++) { const [l, rr] = nums(rs[2 + j]); const cnt = new Map(); let pairs = 0; for (let i = l - 1; i < rr; i++) { const c = cnt.get(a[i]) || 0; pairs += c; cnt.set(a[i], c + 1); } res.push(pairs); } return res.join(' '); };
      const make = (n, q, hi, mode) => { const a = randArray(g, n, 1, hi); const qs = many(q, () => { let l, rr; if (mode === 'short') { l = randInt(g, 1, n); rr = Math.min(n, l + randInt(g, 0, 20)); } else if (mode === 'long') { l = randInt(g, 1, Math.max(1, Math.floor(n / 10))); rr = randInt(g, Math.min(n, Math.floor((9 * n) / 10)), n); if (rr < l) rr = l; } else { l = randInt(g, 1, n); rr = randInt(g, 1, n); if (l > rr) [l, rr] = [rr, l]; } return [l, rr]; }); return `${n} ${q}\n${a.join(' ')}\n${lines(qs)}\n`; };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 10), 4, 'random'), (i) => this.solve(i), brute, 1000);
      for (const [n, q, hi, mode] of [[30, 30, 5, 'random'], [300, 300, 20, 'random'], [3000, 3000, 100, 'random'], [20000, 20000, 1000000000, 'random'], [20000, 20000, 50, 'random'], [20000, 20000, 3, 'long'], [20000, 20000, 1000, 'short'], [19999, 20000, 2, 'random'], [20000, 20000, 20000, 'long']]) out.push(make(n, q, hi, mode));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the number of cells and the number of operations.', 'The second line has `n` numbers: the cells.', 'Each of the next `q` lines has four numbers `t`, `l`, `r` and `x`. If `t = 1`, add `x` to every cell from `l` to `r`. If `t = 2`, print how many cells from `l` to `r` are at least `x`.'],
    constraints: ['1 <= n, q <= 20000', '|each cell| <= 10^9, |x| <= 10^9 in an addition', '|x| <= 10^14 in a question', '1 <= l <= r <= n'],
    slug: 'add-to-a-range-count-the-big-cells',
    title: 'Add to a Range, Then Count the Cells That Are at Least x',
    tags: ['sqrt-decomposition', 'sorted-blocks', 'binary-search', 'range-update'],
    concept: {
      title: 'Cut the row into blocks of about sqrt(n) cells; each block keeps a sorted copy and one lazy addition',
      body: [
        'Operations **add a number to every cell of a range**, and questions ask **how many cells of a range are at least `x`**. For `3 1 4 1 5` the cells at least 3 are `3, 4, 5`: 3 of them. After adding 2 to the cells 2 to 4 the row is `3 3 6 3 5`, and now all 5 are at least 3. A segment tree cannot answer "how many are at least `x`" after additions: a sum or a minimum of a block does not tell the count.',
        'Cut the row into blocks of about `B = sqrt(n)` cells. Every block keeps the cells in a **sorted copy** and a **lazy addition** that applies to the whole block. A range operation touches at most two **partial** blocks and a run of **whole** blocks. For a whole block an addition only changes the lazy number, and a question is one binary search in the sorted copy for the threshold `x - lazy`. For a partial block, change or check the cells one by one and (after an addition) sort the block again.',
        { code: 'for b in range(bl + 1, br):                  # whole blocks\n    kind 1: lz[b] += x\n    kind 2: cnt += len(srt[b]) - bisect_left(srt[b], x - lz[b])\nfor i in partial parts:\n    kind 1: val[i] += x      then   srt[block] = sorted(val[block])\n    kind 2: cnt += (val[i] + lz[block] >= x)' },
        'The cost of an operation is O(B log B) for the partial blocks plus O((n / B) log B) for the whole ones, which is about O(sqrt(n) log n); with `n = q = 20000` that is a few thousand simple steps per operation. The values stay below `2 * 10^13`, so 64-bit integers are enough.'
      ]
    },
    statement: ['A row of `n` numbers is given. Process `q` operations: type 1 `l r x` adds `x` to every number at the positions `l` to `r`; type 2 `l r x` asks how many numbers at the positions `l` to `r` are at least `x`. Print the answers to the questions on one line, in order.'],
    outputFormat: ['Print one number for every operation of type 2, separated by spaces.'],
    examples: [{ input: '5 4\n3 1 4 1 5\n2 1 5 3\n1 2 4 2\n2 1 5 3\n2 2 4 3\n', note: 'The numbers at least 3 in 3 1 4 1 5 are 3, 4 and 5. After adding 2 to the cells 2..4 the row is 3 3 6 3 5 and all 5 numbers are at least 3; among the cells 2..4 all 3 are: 3 5 3.' }],
    hints: ['Cut the row into blocks of about sqrt(n) cells.', 'Keep for every block a sorted copy of its cells and a lazy number added to all of them.', 'A whole block answers with one binary search for x minus its lazy number; a partial block is handled cell by cell and sorted again after a change.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'ops:int[q][4]'],
      fast: true,
      python: r`
        import math
        from bisect import bisect_left
        size = max(1, int(math.sqrt(n)))
        nb = (n + size - 1) // size
        val = a
        srt = [sorted(val[b * size:(b + 1) * size]) for b in range(nb)]
        lz = [0] * nb
        out = []
        for kind, l, rr, x in ops:
            l -= 1
            rr -= 1
            bl = l // size
            br = rr // size
            if kind == 1:
                if bl == br:
                    for i in range(l, rr + 1):
                        val[i] += x
                    srt[bl] = sorted(val[bl * size:(bl + 1) * size])
                else:
                    for i in range(l, (bl + 1) * size):
                        val[i] += x
                    srt[bl] = sorted(val[bl * size:(bl + 1) * size])
                    for i in range(br * size, rr + 1):
                        val[i] += x
                    srt[br] = sorted(val[br * size:(br + 1) * size])
                    for b in range(bl + 1, br):
                        lz[b] += x
            else:
                cnt = 0
                if bl == br:
                    need = x - lz[bl]
                    for i in range(l, rr + 1):
                        if val[i] >= need:
                            cnt += 1
                else:
                    need = x - lz[bl]
                    for i in range(l, (bl + 1) * size):
                        if val[i] >= need:
                            cnt += 1
                    need = x - lz[br]
                    for i in range(br * size, rr + 1):
                        if val[i] >= need:
                            cnt += 1
                    for b in range(bl + 1, br):
                        arr = srt[b]
                        cnt += len(arr) - bisect_left(arr, x - lz[b])
                out.append(cnt)
        print(*out)`,
      cpp: r`
        int size = max(1, (int)sqrt((double)n));
        int nb = ((int)n + size - 1) / size;
        vector<long long>& val = a;
        vector<vector<long long>> srt(nb);
        vector<long long> lz(nb, 0);
        for (int b = 0; b < nb; b++) {
            srt[b].assign(val.begin() + b * size, val.begin() + min((long long)(b + 1) * size, n));
            sort(srt[b].begin(), srt[b].end());
        }
        auto rebuild = [&](int b) {
            srt[b].assign(val.begin() + b * size, val.begin() + min((long long)(b + 1) * size, n));
            sort(srt[b].begin(), srt[b].end());
        };
        string out;
        for (long long k = 0; k < q; k++) {
            long long kind = ops[k][0], x = ops[k][3];
            int l = (int)ops[k][1] - 1, rr = (int)ops[k][2] - 1;
            int bl = l / size, br = rr / size;
            if (kind == 1) {
                if (bl == br) {
                    for (int i = l; i <= rr; i++) val[i] += x;
                    rebuild(bl);
                } else {
                    for (int i = l; i < (bl + 1) * size; i++) val[i] += x;
                    rebuild(bl);
                    for (int i = br * size; i <= rr; i++) val[i] += x;
                    rebuild(br);
                    for (int b = bl + 1; b < br; b++) lz[b] += x;
                }
            } else {
                long long cnt = 0;
                if (bl == br) {
                    long long need = x - lz[bl];
                    for (int i = l; i <= rr; i++) if (val[i] >= need) cnt++;
                } else {
                    long long need = x - lz[bl];
                    for (int i = l; i < (bl + 1) * size; i++) if (val[i] >= need) cnt++;
                    need = x - lz[br];
                    for (int i = br * size; i <= rr; i++) if (val[i] >= need) cnt++;
                    for (int b = bl + 1; b < br; b++) {
                        cnt += srt[b].end() - lower_bound(srt[b].begin(), srt[b].end(), x - lz[b]);
                    }
                }
                if (!out.empty()) out += " ";
                out += to_string(cnt);
            }
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n;
        int size = Math.max(1, (int) Math.sqrt(cn));
        int nb = (cn + size - 1) / size;
        long[][] srt = new long[nb][];
        long[] lz = new long[nb];
        for (int b = 0; b < nb; b++) srt[b] = rebuild(a, b, size, cn);
        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            long kind = ops[k][0], x = ops[k][3];
            int l = (int) ops[k][1] - 1, rr = (int) ops[k][2] - 1;
            int bl = l / size, br = rr / size;
            if (kind == 1) {
                if (bl == br) {
                    for (int i = l; i <= rr; i++) a[i] += x;
                    srt[bl] = rebuild(a, bl, size, cn);
                } else {
                    for (int i = l; i < (bl + 1) * size; i++) a[i] += x;
                    srt[bl] = rebuild(a, bl, size, cn);
                    for (int i = br * size; i <= rr; i++) a[i] += x;
                    srt[br] = rebuild(a, br, size, cn);
                    for (int b = bl + 1; b < br; b++) lz[b] += x;
                }
            } else {
                long cnt = 0;
                if (bl == br) {
                    long need = x - lz[bl];
                    for (int i = l; i <= rr; i++) if (a[i] >= need) cnt++;
                } else {
                    long need = x - lz[bl];
                    for (int i = l; i < (bl + 1) * size; i++) if (a[i] >= need) cnt++;
                    need = x - lz[br];
                    for (int i = br * size; i <= rr; i++) if (a[i] >= need) cnt++;
                    for (int b = bl + 1; b < br; b++) cnt += srt[b].length - lowerBound(srt[b], x - lz[b]);
                }
                if (out.length() > 0) out.append(" ");
                out.append(cnt);
            }
        }
        System.out.println(out);`,
      helpers: {
        python: '',
        java: LOWER_BOUND_JAVA + '\n\n' + r`
    static long[] rebuild(long[] a, int b, int size, int n) {
        long[] part = Arrays.copyOfRange(a, b * size, Math.min(n, (b + 1) * size));
        Arrays.sort(part);
        return part;
    }`
      },
      includes: ['<algorithm>', '<cmath>', '<string>']
    },
    solution: { explanation: ['The row is cut into blocks of about sqrt(n) cells. Each block keeps a sorted copy and a lazy addition; whole blocks are updated by the lazy number and queried by a binary search, partial blocks are handled cell by cell and sorted again after a change.'], complexity: 'Time O((n + q) sqrt(n) log n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const val = nums(rs[1]); const size = Math.max(1, Math.floor(Math.sqrt(n))); const nb = Math.ceil(n / size); const srt = []; const lz = new Array(nb).fill(0);
      const rebuild = (b) => { srt[b] = val.slice(b * size, Math.min(n, (b + 1) * size)).sort((x, y) => x - y); }; for (let b = 0; b < nb; b++) rebuild(b);
      const out = []; for (let k = 0; k < q; k++) { const [t, l0, r0, x] = nums(rs[2 + k]); const l = l0 - 1, rr = r0 - 1; const bl = Math.floor(l / size), br = Math.floor(rr / size);
        if (t === 1) { if (bl === br) { for (let i = l; i <= rr; i++) val[i] += x; rebuild(bl); } else { for (let i = l; i < (bl + 1) * size; i++) val[i] += x; rebuild(bl); for (let i = br * size; i <= rr; i++) val[i] += x; rebuild(br); for (let b = bl + 1; b < br; b++) lz[b] += x; } }
        else { let cnt = 0; if (bl === br) { for (let i = l; i <= rr; i++) if (val[i] + lz[bl] >= x) cnt++; } else { for (let i = l; i < (bl + 1) * size; i++) if (val[i] + lz[bl] >= x) cnt++; for (let i = br * size; i <= rr; i++) if (val[i] + lz[br] >= x) cnt++; for (let b = bl + 1; b < br; b++) cnt += srt[b].length - lowerBound(srt[b], x - lz[b]); } out.push(cnt); } } return out.join(' ');
    },
    tests() {
      const g = rng(5102); const out = ['5 4\n3 1 4 1 5\n2 1 5 3\n1 2 4 2\n2 1 5 3\n2 2 4 3\n', '1 2\n5\n2 1 1 5\n2 1 1 6\n'];
      const make = (n, q, hi, addHi, pAdd) => { const ops = many(q, () => { const l = randInt(g, 1, n); const rr = randInt(g, l, n); if (g() < pAdd) return [1, l, rr, randInt(g, -addHi, addHi)]; return [2, l, rr, randInt(g, -hi, hi)]; }); ops.push([2, 1, n, 0]); return `${n} ${q + 1}\n${randArray(g, n, -hi, hi).join(' ')}\n${lines(ops)}\n`; };
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const res = []; for (let k = 0; k < q; k++) { const [t, l, rr, x] = nums(rs[2 + k]); if (t === 1) { for (let i = l - 1; i < rr; i++) a[i] += x; } else { let c = 0; for (let i = l - 1; i < rr; i++) if (a[i] >= x) c++; res.push(c); } } return res.join(' '); };
      crossCheck(() => make(randInt(g, 1, 14), randInt(g, 1, 14), 6, 4, 0.5), (i) => this.solve(i), brute, 1000);
      for (const [n, q, hi, ah, p] of [[30, 30, 10, 5, 0.5], [300, 300, 100, 50, 0.5], [3000, 3000, 1000000000, 1000000000, 0.5], [20000, 19999, 1000000000, 1000000000, 0.5], [20000, 19999, 1000000, 1000, 0.3], [20000, 19999, 5, 1, 0.7], [19999, 19999, 1000000000, 1000, 0.5]]) out.push(make(n, q, hi, ah, p));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `c`: the number of packages and the fixed cost of one trip.', 'The second line has the `n` weights of the packages, in the order they must be carried.'],
    constraints: ['1 <= n <= 100000', '1 <= weight <= 9', '0 <= c <= 10^6'],
    slug: 'cheapest-trips-with-squared-cost',
    title: 'Split the Packages Into Trips When a Trip Costs the Square of Its Load',
    tags: ['dp', 'convex-hull-trick', 'monotone-queue', 'optimization'],
    concept: {
      title: 'dp[i] = min over j of (dp[j] + (P[i] - P[j])^2 + c) contains a product P[i] * P[j]: every j is a line, and the best line is found on a convex hull',
      body: [
        'Packages with weights `a[1..n]` must be carried in this order, and the row is cut into **trips** (blocks of neighbouring packages). A trip with the total weight `S` costs `S^2 + c`. For the weights `1 2 3 4` and `c = 10` the best plan is `[1 2] [3] [4]`: `9 + 10`, `9 + 10`, `16 + 10`, in total 64. Let `P[i]` be the prefix sums and `dp[i]` the cheapest way to carry the first `i` packages. Then `dp[i] = min over j < i of dp[j] + (P[i] - P[j])^2 + c`, which is O(n^2) if every `j` is tried.',
        'Expand the square: `dp[j] + P[j]^2 - 2 P[j] P[i] + P[i]^2 + c`. Only the middle term mixes `i` and `j`. So for a fixed `j` the cost is a **line in the variable `x = P[i]`**: slope `m_j = -2 P[j]` and intercept `b_j = dp[j] + P[j]^2`. We need the **lowest line at the point `P[i]`** and then add `P[i]^2 + c`. The slopes only decrease as `j` grows (the prefix sums grow) and the query points `P[i]` only increase, which allows the **monotone convex hull trick**: keep the lines that can still be the lowest in a queue, drop the lines from the back that the new line makes useless, and drop lines from the front that are no longer the lowest at the current `x`.',
        { code: 'while head + 1 < len(lines) and value(lines[head + 1], x) <= value(lines[head], x): head += 1\ndp = value(lines[head], x) + x * x + c\nnew = (-2 * x, dp + x * x)\nwhile len(lines) - head >= 2 and (b3 - b1) * (m1 - m2) <= (b2 - b1) * (m1 - m3):   # l2 is never the lowest\n    lines.pop()\nlines.append(new)' },
        'The test "line 2 is never the lowest between line 1 and line 3" compares the intersection points, written as a cross-multiplication to avoid division. With the limits of this problem the products stay below `3 * 10^18`, so 64-bit integers are enough. Each line enters and leaves the queue once: O(n) time after the prefix sums.'
      ]
    },
    statement: ['`n` packages in a row have the weights `a[1..n]`. They must be carried in the given order, and the row is cut into trips of neighbouring packages (every package is in exactly one trip). A trip that carries the total weight `S` costs `S * S + c`. Find the smallest total cost of all the trips.'],
    outputFormat: ['Print one number: the smallest total cost.'],
    examples: [{ input: '4 10\n1 2 3 4\n', note: 'The plan [1 2] [3] [4] costs (9 + 10) + (9 + 10) + (16 + 10) = 64. One trip would cost 110, and four single trips 70.' }],
    hints: ['Let dp[i] be the cheapest way to carry the first i packages; the last trip carries the packages j + 1..i.', 'After expanding the square, the cost for a fixed j is a line in the variable P[i], with slope -2 P[j].', 'The slopes only decrease and the query points only increase, so keep the useful lines in a queue (convex hull trick).'],
    program: {
      io: ['n:int c:int', 'a:int[n]'],
      fast: true,
      python: r`
        ms = [0]
        bs = [0]
        head = 0
        x = 0
        dp = 0
        for i in range(n):
            x += a[i]
            while head + 1 < len(ms) and ms[head + 1] * x + bs[head + 1] <= ms[head] * x + bs[head]:
                head += 1
            dp = ms[head] * x + bs[head] + x * x + c
            m3 = -2 * x
            b3 = dp + x * x
            while len(ms) - head >= 2 and (b3 - bs[-2]) * (ms[-2] - ms[-1]) <= (bs[-1] - bs[-2]) * (ms[-2] - m3):
                ms.pop()
                bs.pop()
            ms.append(m3)
            bs.append(b3)
        print(dp)`,
      cpp: r`
        vector<long long> ms(1, 0), bs(1, 0);
        size_t head = 0;
        long long x = 0, dp = 0;
        for (long long i = 0; i < n; i++) {
            x += a[i];
            while (head + 1 < ms.size() && ms[head + 1] * x + bs[head + 1] <= ms[head] * x + bs[head]) head++;
            dp = ms[head] * x + bs[head] + x * x + c;
            long long m3 = -2 * x, b3 = dp + x * x;
            while (ms.size() - head >= 2) {
                size_t k = ms.size();
                if ((b3 - bs[k - 2]) * (ms[k - 2] - ms[k - 1]) <= (bs[k - 1] - bs[k - 2]) * (ms[k - 2] - m3)) {
                    ms.pop_back();
                    bs.pop_back();
                } else {
                    break;
                }
            }
            ms.push_back(m3);
            bs.push_back(b3);
        }
        cout << dp << "\n";`,
      java: r`
        int cap = (int) n + 2;
        long[] ms = new long[cap];
        long[] bs = new long[cap];
        int head = 0, size = 1;
        long x = 0, dp = 0;
        for (int i = 0; i < n; i++) {
            x += a[i];
            while (head + 1 < size && ms[head + 1] * x + bs[head + 1] <= ms[head] * x + bs[head]) head++;
            dp = ms[head] * x + bs[head] + x * x + c;
            long m3 = -2 * x, b3 = dp + x * x;
            while (size - head >= 2 && (b3 - bs[size - 2]) * (ms[size - 2] - ms[size - 1]) <= (bs[size - 1] - bs[size - 2]) * (ms[size - 2] - m3)) size--;
            ms[size] = m3;
            bs[size] = b3;
            size++;
        }
        System.out.println(dp);`,
      includes: ['<string>']
    },
    solution: { explanation: ['dp[i] = min over j of dp[j] + (P[i] - P[j])^2 + c. For a fixed j this is a line in P[i] with slope -2 P[j]. Because the slopes decrease and the query points increase, a monotone queue of lines (convex hull trick) gives each dp value in amortised O(1).'], complexity: 'Time O(n), space O(n).' },
    solve(input) {
      const rs = rows(input); const [n, cc] = nums(rs[0]); const a = nums(rs[1]); const c = BigInt(cc); const ms = [0n], bs = [0n]; let head = 0, x = 0n, dp = 0n;
      for (let i = 0; i < n; i++) { x += BigInt(a[i]); while (head + 1 < ms.length && ms[head + 1] * x + bs[head + 1] <= ms[head] * x + bs[head]) head++; dp = ms[head] * x + bs[head] + x * x + c; const m3 = -2n * x, b3 = dp + x * x; while (ms.length - head >= 2) { const k = ms.length; if ((b3 - bs[k - 2]) * (ms[k - 2] - ms[k - 1]) <= (bs[k - 1] - bs[k - 2]) * (ms[k - 2] - m3)) { ms.pop(); bs.pop(); } else break; } ms.push(m3); bs.push(b3); } return dp.toString();
    },
    tests() {
      const g = rng(5103); const out = ['4 10\n1 2 3 4\n', '1 0\n5\n', '3 1000000\n9 9 9\n'];
      const brute = (input) => { const rs = rows(input); const [n, c] = nums(rs[0]); const a = nums(rs[1]); const P = [0]; for (const v of a) P.push(P[P.length - 1] + v); const dp = new Array(n + 1).fill(Infinity); dp[0] = 0; for (let i = 1; i <= n; i++) for (let j = 0; j < i; j++) dp[i] = Math.min(dp[i], dp[j] + (P[i] - P[j]) ** 2 + c); return String(dp[n]); };
      const make = (n, c, lo, hi) => `${n} ${c}\n${randArray(g, n, lo, hi).join(' ')}\n`;
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 0, 30), 1, 9), (i) => this.solve(i), brute, 1000);
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 0, 1000000), 1, 9), (i) => this.solve(i), brute, 300);
      for (const [n, c, lo, hi] of [[30, 20, 1, 9], [300, 1000, 1, 9], [3000, 100000, 1, 9], [100000, 1000000, 1, 9], [100000, 0, 1, 9], [100000, 1000, 1, 3], [100000, 1000000, 9, 9], [99999, 500000, 1, 9], [100000, 1, 1, 1]]) out.push(make(n, c, lo, hi));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`, `m` and `L`: the number of towns, the number of roads and the total time.', 'Each of the next `m` lines has three numbers `u`, `v` and `t`: a one-way road from the town `u` to the town `v` that takes `t` minutes.'],
    constraints: ['1 <= n <= 8, 1 <= m <= 40', '1 <= u, v <= n; roads can repeat, and u can equal v.', '1 <= t <= 3', '0 <= L <= 10^18'],
    slug: 'routes-with-an-exact-travel-time',
    title: 'How Many Routes Take Exactly L Minutes?',
    tags: ['matrix-exponentiation', 'graph', 'counting', 'modular-arithmetic'],
    concept: {
      title: 'Cut every road into one-minute steps with waiting states, then raise the transition matrix to the power L',
      body: [
        'One-way roads connect towns, and each road takes 1, 2 or 3 minutes. A **route** is a sequence of roads, each starting where the previous one ends (towns and roads may repeat). Count the routes that start in the town 1, end in the town `n` and take **exactly `L` minutes** in total, modulo `1000000007`, for `L` up to `10^18`. Counting step by step is hopeless for such an `L`.',
        'Make time discrete by giving every town `v` three states: `(v, 0)` "we are in `v`", `(v, 1)` "we arrive in `v` after 1 more minute", `(v, 2)` "after 2 more minutes". Every minute the system makes one step: `(v, 2) -> (v, 1) -> (v, 0)`, and a road from `u` to `v` of `t` minutes gives a step `(u, 0) -> (v, t - 1)`. Now each route of `L` minutes is exactly **one walk of `L` steps** from `(1, 0)` to `(n, 0)` in this graph with `3n` states, and parallel roads are parallel edges.',
        { code: 'M[3*v + 1][3*v] += 1; M[3*v + 2][3*v + 1] += 1       # waiting steps\nM[3*(u - 1)][3*(v - 1) + t - 1] += 1                   # a road of t minutes\n# the number of walks of L steps is the entry [start][end] of M^L\nvec = [1, 0, ..., 0]\nwhile L:\n    if L & 1: vec = vec * M\n    M = M * M\n    L >>= 1' },
        'Powers of the same matrix commute, so it does not matter in which order the factors of the binary expansion of `L` are applied. A matrix product costs `(3n)^3` steps (at most 13824) and there are about 60 squarings, so the whole count is quick. Every number is reduced modulo the prime after each multiplication, so 64-bit integers suffice.'
      ]
    },
    statement: ['There are `n` towns and `m` one-way roads; the road `i` goes from `u` to `v` and takes `t` minutes (1, 2 or 3). A route is a sequence of roads where each road starts in the town where the previous one ended. Count the routes that start in the town 1, end in the town `n` and take exactly `L` minutes in total. Two routes are different if they use different roads (parallel roads count separately) at some step. Print the count modulo 1 000 000 007.'],
    outputFormat: ['Print one number: the count modulo 1000000007.'],
    examples: [{ input: '3 4 5\n1 2 1\n2 3 1\n1 3 2\n3 1 1\n', note: 'To reach the town 3 again after 5 minutes: go to 3 in 2 minutes (two ways: 1-2-3 or 1-3), return to 1 in 1 minute, then go to 3 in 2 minutes (two ways): 2 * 2 = 4 routes.' }],
    hints: ['Replace each town by three states that count down the minutes left until arrival, so that every step takes exactly one minute.', 'Then a route of L minutes is a walk of exactly L steps, and the number of walks is an entry of the L-th power of the transition matrix.', 'Raise the matrix to the power L by repeated squaring, with all products taken modulo 1000000007.'],
    program: {
      io: ['n:int m:int L:int', 'roads:int[m][3]'],
      fast: true,
      python: r`
        MOD = 1000000007
        size = 3 * n
        mat = [[0] * size for _ in range(size)]
        for v in range(n):
            mat[3 * v + 1][3 * v] += 1
            mat[3 * v + 2][3 * v + 1] += 1
        for u, v, t in roads:
            mat[3 * (u - 1)][3 * (v - 1) + t - 1] += 1

        def mat_mul(x, y):
            cols = list(zip(*y))
            return [[sum(p * q for p, q in zip(row, col)) % MOD for col in cols] for row in x]

        def vec_mul(vec, y):
            cols = list(zip(*y))
            return [sum(p * q for p, q in zip(vec, col)) % MOD for col in cols]

        vec = [0] * size
        vec[0] = 1
        while L:
            if L & 1:
                vec = vec_mul(vec, mat)
            L >>= 1
            if L:
                mat = mat_mul(mat, mat)
        print(vec[3 * (n - 1)] % MOD)`,
      cpp: r`
        const long long MOD = 1000000007;
        int size = 3 * (int)n;
        vector<vector<long long>> mat(size, vector<long long>(size, 0));
        for (int v = 0; v < n; v++) {
            mat[3 * v + 1][3 * v] += 1;
            mat[3 * v + 2][3 * v + 1] += 1;
        }
        for (long long k = 0; k < m; k++) mat[3 * (roads[k][0] - 1)][3 * (roads[k][1] - 1) + roads[k][2] - 1] += 1;
        vector<long long> vec(size, 0);
        vec[0] = 1;
        while (L > 0) {
            if (L & 1) {
                vector<long long> nv(size, 0);
                for (int j = 0; j < size; j++) {
                    long long s = 0;
                    for (int i = 0; i < size; i++) s = (s + vec[i] * mat[i][j]) % MOD;
                    nv[j] = s;
                }
                vec = nv;
            }
            L >>= 1;
            if (L > 0) {
                vector<vector<long long>> sq(size, vector<long long>(size, 0));
                for (int i = 0; i < size; i++)
                    for (int k = 0; k < size; k++) {
                        if (mat[i][k] == 0) continue;
                        for (int j = 0; j < size; j++) sq[i][j] = (sq[i][j] + mat[i][k] * mat[k][j]) % MOD;
                    }
                mat = sq;
            }
        }
        cout << vec[3 * (n - 1)] % MOD << "\n";`,
      java: r`
        long MOD = 1000000007L;
        int cn = (int) n;
        int size = 3 * cn;
        long[][] mat = new long[size][size];
        for (int v = 0; v < cn; v++) {
            mat[3 * v + 1][3 * v] += 1;
            mat[3 * v + 2][3 * v + 1] += 1;
        }
        for (int k = 0; k < m; k++) mat[3 * ((int) roads[k][0] - 1)][3 * ((int) roads[k][1] - 1) + (int) roads[k][2] - 1] += 1;
        long[] vec = new long[size];
        vec[0] = 1;
        while (L > 0) {
            if ((L & 1) == 1) {
                long[] nv = new long[size];
                for (int j = 0; j < size; j++) {
                    long s = 0;
                    for (int i = 0; i < size; i++) s = (s + vec[i] * mat[i][j]) % MOD;
                    nv[j] = s;
                }
                vec = nv;
            }
            L >>= 1;
            if (L > 0) {
                long[][] sq = new long[size][size];
                for (int i = 0; i < size; i++) {
                    for (int k = 0; k < size; k++) {
                        if (mat[i][k] == 0) continue;
                        for (int j = 0; j < size; j++) sq[i][j] = (sq[i][j] + mat[i][k] * mat[k][j]) % MOD;
                    }
                }
                mat = sq;
            }
        }
        System.out.println(vec[3 * (cn - 1)] % MOD);`,
      includes: ['<string>']
    },
    solution: { explanation: ['Each town gets three states that count down the minutes until arrival, so every step takes one minute and a route of L minutes is a walk of L steps. The number of walks is read from the L-th power of the transition matrix, found by repeated squaring modulo the prime.'], complexity: 'Time O((3n)^3 log L), space O((3n)^2).' },
    solve(input) {
      const rs = rows(input); const head = rs[0].trim().split(/\s+/); const n = Number(head[0]), m = Number(head[1]); let L = BigInt(head[2]); const P = 1000000007n; const size = 3 * n; const mat = Array.from({ length: size }, () => new Array(size).fill(0n));
      for (let v = 0; v < n; v++) { mat[3 * v + 1][3 * v] += 1n; mat[3 * v + 2][3 * v + 1] += 1n; } for (let k = 0; k < m; k++) { const [u, v, t] = nums(rs[1 + k]); mat[3 * (u - 1)][3 * (v - 1) + t - 1] += 1n; }
      const mulMat = (x, y) => x.map((row) => y[0].map((_, j) => { let s = 0n; for (let i = 0; i < size; i++) s += row[i] * y[i][j]; return s % P; })); let cur = mat; let vec = new Array(size).fill(0n); vec[0] = 1n;
      while (L > 0n) { if (L & 1n) vec = vec.map((_, j) => { let s = 0n; for (let i = 0; i < size; i++) s += vec[i] * cur[i][j]; return s % P; }); L >>= 1n; if (L > 0n) cur = mulMat(cur, cur); } return (vec[3 * (n - 1)] % P).toString();
    },
    tests() {
      const g = rng(5104); const P = 1000000007; const out = ['3 4 5\n1 2 1\n2 3 1\n1 3 2\n3 1 1\n', '1 1 0\n1 1 1\n', '2 1 1000000000000000000\n1 2 1\n'];
      const brute = (input) => { const rs = rows(input); const head = rs[0].trim().split(/\s+/); const n = Number(head[0]), m = Number(head[1]), L = Number(head[2]); const roads = many(m, (k) => nums(rs[1 + k])); const ways = Array.from({ length: L + 1 }, () => new Array(n + 1).fill(0)); ways[0][1] = 1; for (let t = 1; t <= L; t++) for (const [u, v, d] of roads) if (t - d >= 0) ways[t][v] = (ways[t][v] + ways[t - d][u]) % P; return String(ways[L][n]); };
      const make = (n, m, L) => { const roads = many(m, () => [randInt(g, 1, n), randInt(g, 1, n), randInt(g, 1, 3)]); return `${n} ${m} ${L}\n${lines(roads)}\n`; };
      crossCheck(() => make(randInt(g, 1, 4), randInt(g, 1, 8), randInt(g, 0, 25)), (i) => this.solve(i), brute, 600);
      crossCheck(() => make(randInt(g, 1, 8), randInt(g, 1, 40), randInt(g, 0, 40)), (i) => this.solve(i), brute, 150);
      for (const [n, m, L] of [[3, 6, '10'], [5, 20, '1000000'], [8, 40, '1000000000000000000'], [8, 40, '999999999999999999'], [8, 40, '576460752303423488'], [6, 30, '123456789012345678'], [7, 12, '1000000007'], [8, 8, '1000000000000'], [2, 5, '2'], [4, 40, '987654321987654321']]) out.push(make(n, m, L));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `t`: the number of numbers and the limit.', 'The second line has the `n` numbers.'],
    constraints: ['1 <= n <= 36', '1 <= a[i] <= 10^12', '0 <= t <= 4 * 10^13'],
    slug: 'subsets-with-a-sum-at-most-t',
    title: 'How Many Subsets Have a Sum of at Most T?',
    tags: ['meet-in-the-middle', 'two-pointers', 'sorting', 'subsets'],
    concept: {
      title: 'Split the numbers into two halves, list the subset sums of each half, and count the compatible pairs with two pointers',
      body: [
        'Count the subsets (including the empty one) whose sum is **at most `T`**. For `1 2 3 4` and `T = 5` the good subsets are `{}`, `{1}`, `{2}`, `{3}`, `{4}`, `{1,2}`, `{1,3}`, `{1,4}` and `{2,3}`: 9. With 36 numbers there are `2^36`, about 69 billion subsets, far too many to look at one by one, and the numbers are too large for a table over the sum.',
        'Split the numbers into two halves of 18. Each half has only `2^18 = 262144` subsets. List all the subset sums of the left half and of the right half and **sort** both lists. A subset of the whole set is a pair (a subset of the left, a subset of the right), and its sum is the sum of the two sums. The pair is good when `left + right <= T`. For the left sums taken in increasing order, the number of good right sums can only **shrink**, so a pointer into the sorted right list that only moves down finds it for all of them.',
        { code: 'def all_sums(items):\n    sums = [0]\n    for x in items: sums += [s + x for s in sums]      # every old sum, with and without x\n    return sums\n\nleft = sorted(all_sums(a[:h])); right = sorted(all_sums(a[h:]))\nj = len(right); count = 0\nfor s in left:                                         # increasing\n    while j > 0 and s + right[j - 1] > t: j -= 1\n    if j == 0: break\n    count += j                                         # right[0..j-1] all fit' },
        'The time is O(2^(n/2) * n): generating and sorting two lists of 262144 numbers, and one pass with two pointers. The answer is at most `2^36`, and sums reach `3.6 * 10^13`, so 64-bit integers are needed. This "meet in the middle" idea turns a search over `2^n` possibilities into about `2 * 2^(n/2)`.'
      ]
    },
    statement: ['`n` numbers are given. Count the subsets of the set of positions (the empty subset included; different positions are different even if the numbers are equal) whose numbers add up to at most `t`. Print the count.'],
    outputFormat: ['Print one number: the count of subsets.'],
    examples: [{ input: '4 5\n1 2 3 4\n', note: 'The good subsets are the empty one, the four single numbers, {1,2}, {1,3}, {1,4} and {2,3}: 9.' }],
    hints: ['2^36 subsets are too many, but 2^18 is small.', 'List the subset sums of the first half and of the second half, and sort both lists.', 'For increasing left sums the number of right sums that still fit can only decrease, so one pointer is enough.'],
    program: {
      io: ['n:int t:int', 'a:int[n]'],
      fast: true,
      helpers: {
        python: r`
          def all_sums(items):
              sums = [0]
              for x in items:
                  sums += [s + x for s in sums]
              return sums`,
        java: r`
          static long[] allSums(long[] a, int from, int to) {
              long[] v = new long[1 << (to - from)];
              int size = 1;
              for (int i = from; i < to; i++) {
                  for (int k = 0; k < size; k++) v[size + k] = v[k] + a[i];
                  size *= 2;
              }
              Arrays.sort(v);
              return v;
          }`
      },
      python: r`
        h = n // 2
        lhs = sorted(all_sums(a[:h]))
        rhs = sorted(all_sums(a[h:]))
        count = 0
        j = len(rhs)
        for s in lhs:
            while j > 0 and s + rhs[j - 1] > t:
                j -= 1
            if j == 0:
                break
            count += j
        print(count)`,
      cpp: r`
        auto sums = [&](int from, int to) {
            vector<long long> v(1, 0);
            for (int i = from; i < to; i++) {
                size_t sz = v.size();
                for (size_t k = 0; k < sz; k++) v.push_back(v[k] + a[i]);
            }
            sort(v.begin(), v.end());
            return v;
        };
        int h = (int)n / 2;
        vector<long long> lhs = sums(0, h), rhs = sums(h, (int)n);
        long long count = 0, j = (long long)rhs.size();
        for (long long s : lhs) {
            while (j > 0 && s + rhs[j - 1] > t) j--;
            if (j == 0) break;
            count += j;
        }
        cout << count << "\n";`,
      java: r`
        int cn = (int) n;
        int h = cn / 2;
        long[] lhs = allSums(a, 0, h);
        long[] rhs = allSums(a, h, cn);
        long count = 0;
        int j = rhs.length;
        for (long s : lhs) {
            while (j > 0 && s + rhs[j - 1] > t) j--;
            if (j == 0) break;
            count += j;
        }
        System.out.println(count);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The numbers are split in two halves. All subset sums of each half are listed and sorted, and for the left sums in increasing order a pointer into the right list moves down while the pair does not fit; the pointer position is the number of fitting right sums.'], complexity: 'Time O(n 2^(n/2)), space O(2^(n/2)).' },
    solve(input) {
      const rs = rows(input); const [n, t] = nums(rs[0]); const a = nums(rs[1]); const h = Math.floor(n / 2);
      const allSums = (items) => { let v = new Float64Array(1 << items.length); let size = 1; for (const x of items) { for (let k = 0; k < size; k++) v[size + k] = v[k] + x; size *= 2; } return v.sort(); };
      const lhs = allSums(a.slice(0, h)), rhs = allSums(a.slice(h)); let count = 0, j = rhs.length; for (const s of lhs) { while (j > 0 && s + rhs[j - 1] > t) j--; if (j === 0) break; count += j; } return count;
    },
    tests() {
      const g = rng(5105); const out = ['4 5\n1 2 3 4\n', '1 0\n7\n', '1 7\n7\n', '3 0\n1 1 1\n'];
      const brute = (input) => { const rs = rows(input); const [n, t] = nums(rs[0]); const a = nums(rs[1]); let c = 0; for (let mask = 0; mask < (1 << n); mask++) { let s = 0; for (let i = 0; i < n; i++) if (mask >> i & 1) s += a[i]; if (s <= t) c++; } return c; };
      const make = (n, hi, tMode) => { const a = randArray(g, n, 1, hi); const total = a.reduce((s, v) => s + v, 0); const t = tMode === 'half' ? Math.floor(total / 2) : tMode === 'all' ? total : tMode === 'none' ? 0 : tMode === 'small' ? Math.floor(total / 20) : randInt(g, 0, total); return `${n} ${t}\n${a.join(' ')}\n`; };
      crossCheck(() => make(randInt(g, 1, 12), 10, 'random'), (i) => this.solve(i), brute, 800);
      crossCheck(() => make(randInt(g, 1, 14), 1000000000000, 'random'), (i) => this.solve(i), brute, 200);
      for (const [n, hi, mode] of [[20, 100, 'half'], [30, 1000000000000, 'random'], [36, 1000000000000, 'half'], [36, 1000000000000, 'random'], [36, 1000000000, 'half'], [36, 10, 'half'], [36, 1, 'half'], [35, 1000000000000, 'small'], [36, 1000000000000, 'all'], [36, 1000000000000, 'none'], [36, 1000000000000, 'small'], [33, 1000000000000, 'half']]) out.push(make(n, hi, mode));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `m`: the number of towns and the number of roads.', 'Each of the next `m` lines has three numbers `u`, `v` and `w`: a two-way road between the towns `u` and `v` with the value `w`.'],
    constraints: ['2 <= n <= 50000, n - 1 <= m <= 100000', '0 <= w < 2^30', 'The towns are connected. Roads can repeat, and u can equal v.'],
    slug: 'largest-xor-along-a-walk',
    title: 'The Largest XOR of the Road Values Along a Walk',
    tags: ['xor-basis', 'graph', 'cycle-space', 'bit-manipulation'],
    concept: {
      title: 'Any walk is a tree path plus some cycles; the cycle values form an XOR basis, and a greedy pass picks the best combination',
      body: [
        'Towns are connected by two-way roads, each road with a value. A **walk** from the town 1 to the town `n` may use any road any number of times (also going back), and its value is the **XOR** of the values of the roads used, each time it is used. Find the largest possible value. A road used twice cancels itself (`w xor w = 0`), which is the key to the problem.',
        'Take any spanning tree (a BFS tree) and let `d[v]` be the XOR of the values on the tree path from the town 1 to `v`. Every walk from 1 to `n` has the value `d[n]` xor the XOR of some **cycles** that the walk goes around: for a road `(u, v, w)` that is not in the tree, the cycle it closes has the value `d[u] xor d[v] xor w` (for a tree road this is 0). Every combination of cycles is possible, because a walk can go to a cycle, go around it and come back along the same road (which cancels). So the set of reachable values is `d[n] xor (any XOR of cycle values)`.',
        { code: 'for u, v, w in edges:                       # tree edges give 0 and are skipped by the insert\n    x = d[u] ^ d[v] ^ w\n    for b in range(29, -1, -1):             # insert x into the xor basis\n        if x >> b & 1:\n            if basis[b] == 0: basis[b] = x; break\n            x ^= basis[b]\nres = d[n]\nfor b in range(29, -1, -1):\n    if res ^ basis[b] > res: res ^= basis[b]     # greedy: the highest bit decides' },
        'An **XOR basis** keeps at most 30 numbers with distinct highest bits that generate all combinations of the inserted numbers. To get the maximum of `res xor (combination)`, go from the highest bit down and use the basis vector for the bit `b` whenever it increases the result. The BFS and the 100000 insertions cost O(n + 30 m) in total.'
      ]
    },
    statement: ['`n` towns are connected by `m` two-way roads; the road `i` joins `u` and `v` and has the value `w`. A walk may use any road any number of times, in any direction. The value of a walk is the XOR of the values of all the roads it uses, counted every time a road is used. Find the largest value of a walk that starts in the town 1 and ends in the town `n`.'],
    outputFormat: ['Print one number: the largest value.'],
    examples: [{ input: '4 4\n1 2 3\n2 4 5\n1 3 6\n3 4 1\n', note: 'The walk 1-2-4 has the value 3 xor 5 = 6, and the walk 1-3-4 has 6 xor 1 = 7. The cycle through all four roads has the value 1, so 7 is the best.' }],
    hints: ['Using a road twice cancels it, so a walk is a path plus any set of cycles.', 'With a BFS tree, the cycle closed by an edge (u, v, w) has the value d[u] xor d[v] xor w.', 'Put the cycle values in an XOR basis and maximise d[n] xor (combination) greedily from the highest bit.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      python: r`
        adj = [[] for _ in range(n + 1)]
        for u, v, w in edges:
            adj[u].append((v, w))
            adj[v].append((u, w))
        d = [-1] * (n + 1)
        d[1] = 0
        queue = [1]
        for u in queue:
            for v, w in adj[u]:
                if d[v] < 0:
                    d[v] = d[u] ^ w
                    queue.append(v)
        basis = [0] * 30
        for u, v, w in edges:
            x = d[u] ^ d[v] ^ w
            for b in range(29, -1, -1):
                if (x >> b) & 1 == 0:
                    continue
                if basis[b] == 0:
                    basis[b] = x
                    break
                x ^= basis[b]
        res = d[n]
        for b in range(29, -1, -1):
            if (res ^ basis[b]) > res:
                res ^= basis[b]
        print(res)`,
      cpp: r`
        vector<vector<pair<int, int>>> adj(n + 1);
        for (long long i = 0; i < m; i++) {
            int u = (int)edges[i][0], v = (int)edges[i][1], w = (int)edges[i][2];
            adj[u].push_back(make_pair(v, w));
            adj[v].push_back(make_pair(u, w));
        }
        vector<int> d(n + 1, -1);
        d[1] = 0;
        vector<int> queue(1, 1);
        for (size_t head = 0; head < queue.size(); head++) {
            int u = queue[head];
            for (size_t k = 0; k < adj[u].size(); k++) {
                int v = adj[u][k].first, w = adj[u][k].second;
                if (d[v] < 0) {
                    d[v] = d[u] ^ w;
                    queue.push_back(v);
                }
            }
        }
        vector<int> basis(30, 0);
        for (long long i = 0; i < m; i++) {
            int x = d[edges[i][0]] ^ d[edges[i][1]] ^ (int)edges[i][2];
            for (int b = 29; b >= 0; b--) {
                if (((x >> b) & 1) == 0) continue;
                if (basis[b] == 0) {
                    basis[b] = x;
                    break;
                }
                x ^= basis[b];
            }
        }
        int res = d[n];
        for (int b = 29; b >= 0; b--) {
            if ((res ^ basis[b]) > res) res ^= basis[b];
        }
        cout << res << "\n";`,
      java: r`
        int cn = (int) n, cm = (int) m;
        int[] start = new int[cn + 2];
        for (int i = 0; i < cm; i++) {
            start[(int) edges[i][0] + 1]++;
            start[(int) edges[i][1] + 1]++;
        }
        for (int v = 1; v <= cn + 1; v++) start[v] += start[v - 1];
        int[] fill = new int[cn + 2];
        int[] adjTo = new int[2 * cm];
        int[] adjW = new int[2 * cm];
        for (int i = 0; i < cm; i++) {
            int u = (int) edges[i][0], v = (int) edges[i][1], w = (int) edges[i][2];
            adjTo[start[u] + fill[u]] = v;
            adjW[start[u] + fill[u]] = w;
            fill[u]++;
            adjTo[start[v] + fill[v]] = u;
            adjW[start[v] + fill[v]] = w;
            fill[v]++;
        }
        int[] d = new int[cn + 1];
        Arrays.fill(d, -1);
        d[1] = 0;
        int[] queue = new int[cn];
        int head = 0, tail = 0;
        queue[tail++] = 1;
        while (head < tail) {
            int u = queue[head++];
            for (int k = start[u]; k < start[u + 1]; k++) {
                int v = adjTo[k];
                if (d[v] < 0) {
                    d[v] = d[u] ^ adjW[k];
                    queue[tail++] = v;
                }
            }
        }
        int[] basis = new int[30];
        for (int i = 0; i < cm; i++) {
            int x = d[(int) edges[i][0]] ^ d[(int) edges[i][1]] ^ (int) edges[i][2];
            for (int b = 29; b >= 0; b--) {
                if (((x >> b) & 1) == 0) continue;
                if (basis[b] == 0) {
                    basis[b] = x;
                    break;
                }
                x ^= basis[b];
            }
        }
        int res = d[cn];
        for (int b = 29; b >= 0; b--) {
            if ((res ^ basis[b]) > res) res ^= basis[b];
        }
        System.out.println(res);`,
      includes: ['<utility>']
    },
    solution: { explanation: ['A BFS tree gives d[v], the XOR of the tree path from the town 1. Every non-tree road closes a cycle of value d[u] xor d[v] xor w, and these values go into an XOR basis. The best walk value is d[n] improved greedily from the highest bit with the basis.'], complexity: 'Time O(n + 30 m), space O(n + m).' },
    solve(input) {
      const rs = rows(input); const [n, m] = nums(rs[0]); const edges = many(m, (i) => nums(rs[1 + i])); const adj = Array.from({ length: n + 1 }, () => []); for (const [u, v, w] of edges) { adj[u].push([v, w]); adj[v].push([u, w]); }
      const d = new Array(n + 1).fill(-1); d[1] = 0; const queue = [1]; for (let h = 0; h < queue.length; h++) { const u = queue[h]; for (const [v, w] of adj[u]) if (d[v] < 0) { d[v] = d[u] ^ w; queue.push(v); } }
      const basis = new Array(30).fill(0); for (const [u, v, w] of edges) { let x = d[u] ^ d[v] ^ w; for (let b = 29; b >= 0; b--) { if (((x >> b) & 1) === 0) continue; if (basis[b] === 0) { basis[b] = x; break; } x ^= basis[b]; } }
      let res = d[n]; for (let b = 29; b >= 0; b--) if ((res ^ basis[b]) > res) res ^= basis[b]; return res;
    },
    tests() {
      const g = rng(5106); const out = ['4 4\n1 2 3\n2 4 5\n1 3 6\n3 4 1\n', '2 1\n1 2 9\n', '2 2\n1 2 0\n1 2 7\n'];
      const brute = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); const edges = many(m, (i) => nums(rs[1 + i])); const seen = new Set(['1,0']); const stack = [[1, 0]]; while (stack.length) { const [v, x] = stack.pop(); for (const [a, b, w] of edges) { for (const [p, q] of [[a, b], [b, a]]) if (p === v) { const key = `${q},${x ^ w}`; if (!seen.has(key)) { seen.add(key); stack.push([q, x ^ w]); } } } } let best = 0; for (const key of seen) { const [v, x] = key.split(',').map(Number); if (v === n && x > best) best = x; } return best; };
      const make = (n, m, wBits, shape) => { const edges = []; for (let v = 2; v <= n; v++) { const p = shape === 'path' ? v - 1 : randInt(g, 1, v - 1); edges.push([p, v, randInt(g, 0, (1 << wBits) - 1)]); } while (edges.length < m) edges.push([randInt(g, 1, n), randInt(g, 1, n), randInt(g, 0, (1 << wBits) - 1)]); const mixed = shuffle(g, edges).map(([u, v, w]) => (g() < 0.5 ? [u, v, w] : [v, u, w])); return `${n} ${m}\n${lines(mixed)}\n`; };
      crossCheck(() => { const n = randInt(g, 2, 6); return make(n, randInt(g, n - 1, n + 5), 3, 'random'); }, (i) => this.solve(i), brute, 1000);
      for (const [n, m, bits, shape] of [[10, 20, 30, 'random'], [100, 150, 30, 'random'], [1000, 1000 - 1, 30, 'random'], [50000, 100000, 20, 'random'], [20000, 40000, 12, 'random'], [20000, 19999, 30, 'path'], [20000, 22000, 30, 'path'], [25000, 26000, 29, 'random'], [5000, 20000, 30, 'random']]) out.push(make(n, m, bits, shape));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n` and `q`: the length of the list and the number of questions.', 'The second line has the `n` numbers of the list.', 'Each of the next `q` lines has two numbers `l` and `r`.'],
    constraints: ['1 <= n, q <= 50000', '0 <= a[i] <= 10^9', '1 <= l <= r <= n'],
    slug: 'smallest-missing-number-in-ranges',
    title: 'The Smallest Missing Number in Each Range',
    tags: ['segment-tree', 'offline-queries', 'mex', 'descent'],
    concept: {
      title: 'Sweep the right end; keep for every value the last place where it was seen, and descend to the first value last seen before l',
      body: [
        'The **mex** of a group of numbers is the smallest non-negative integer that is missing from it. For the range `2 3` of the list `1 0 2 0 3 1` the numbers are `0 2`, and the mex is 1. Each question asks for the mex of a range `l..r`. Looking at every value from 0 upward costs O(n) per question.',
        'Answer the questions **offline**, sorted by their right end `r`. Sweep a position `pos` from left to right and keep, for every value `v`, `last[v]`: the last position `<= pos` where `v` occurred (or -1). A value `v` is present in the range `l..pos` exactly when `last[v] >= l`. So the mex of `l..pos` is the **smallest `v` with `last[v] < l`**. Store `last` in a segment tree over the values `0..n+1` that keeps the **minimum** in every node, and find that `v` by a descent: at each node go left if the minimum of the left child is `< l` (a missing value is there), otherwise go right.',
        { code: 'for pos in range(n):\n    v = a[pos]\n    if v <= n: set last[v] = pos and recompute the minima on the path to the root\n    for each question (l, pos):\n        node = 1\n        while node < size:\n            node = 2 * node if mn[2 * node] < l else 2 * node + 1\n        answer = node - size' },
        'Values larger than `n` can be ignored, because the mex of a range of at most `n` numbers is at most `n`. The leaves beyond `n + 1` keep the value -1, so the descent always finds a leaf. Each update and each question costs O(log n).'
      ]
    },
    statement: ['A list of `n` non-negative integers is given. Answer `q` questions. Each question has two positions `l` and `r`: find the smallest non-negative integer that does not occur among the numbers at the positions `l` to `r` (counting from 1, both included). Print the answers on one line, in the order of the questions.'],
    outputFormat: ['Print `q` numbers separated by spaces.'],
    examples: [{ input: '6 3\n1 0 2 0 3 1\n1 6\n2 3\n4 6\n', note: 'The whole list holds 0, 1, 2 and 3, so the missing one is 4. The range 2..3 holds 0 and 2: 1. The range 4..6 holds 0, 3 and 1: 2. The answers are 4 1 2.' }],
    hints: ['Process the questions sorted by r, moving a pointer over the list.', 'Keep for each value the last position where it occurred. A value is missing from l..r exactly when its last position before r is less than l.', 'Store these positions in a segment tree with the minimum in every node, and descend to the leftmost value whose last position is less than l.'],
    program: {
      io: ['n:int q:int', 'a:int[n]', 'qs:int[q][2]'],
      fast: true,
      python: r`
        size = 1
        while size < n + 2:
            size *= 2
        mn = [-1] * (2 * size)
        by_r = [[] for _ in range(n)]
        for j in range(q):
            by_r[qs[j][1] - 1].append(j)
        ans = [0] * q
        for pos in range(n):
            v = a[pos]
            if v <= n:
                i = v + size
                mn[i] = pos
                i >>= 1
                while i:
                    left = mn[2 * i]
                    right = mn[2 * i + 1]
                    mn[i] = left if left < right else right
                    i >>= 1
            for j in by_r[pos]:
                l = qs[j][0] - 1
                node = 1
                while node < size:
                    if mn[2 * node] < l:
                        node = 2 * node
                    else:
                        node = 2 * node + 1
                ans[j] = node - size
        print(*ans)`,
      cpp: r`
        int size = 1;
        while (size < n + 2) size *= 2;
        vector<int> mn(2 * size, -1);
        vector<vector<int>> byR(n);
        for (long long j = 0; j < q; j++) byR[qs[j][1] - 1].push_back((int)j);
        vector<int> ans(q, 0);
        for (int pos = 0; pos < n; pos++) {
            long long v = a[pos];
            if (v <= n) {
                int i = (int)v + size;
                mn[i] = pos;
                for (i >>= 1; i > 0; i >>= 1) mn[i] = min(mn[2 * i], mn[2 * i + 1]);
            }
            for (size_t k = 0; k < byR[pos].size(); k++) {
                int j = byR[pos][k];
                int l = (int)qs[j][0] - 1;
                int node = 1;
                while (node < size) {
                    if (mn[2 * node] < l) node = 2 * node;
                    else node = 2 * node + 1;
                }
                ans[j] = node - size;
            }
        }
        string out;
        for (long long j = 0; j < q; j++) {
            if (j > 0) out += " ";
            out += to_string(ans[j]);
        }
        cout << out << "\n";`,
      java: r`
        int cn = (int) n, qq = (int) q;
        int size = 1;
        while (size < cn + 2) size *= 2;
        int[] mn = new int[2 * size];
        Arrays.fill(mn, -1);
        long[] keys = new long[qq];
        for (int j = 0; j < qq; j++) keys[j] = ((qs[j][1] - 1) << 16) | j;
        Arrays.sort(keys);
        int[] ans = new int[qq];
        int next = 0;
        for (int pos = 0; pos < cn; pos++) {
            long v = a[pos];
            if (v <= cn) {
                int i = (int) v + size;
                mn[i] = pos;
                for (i >>= 1; i > 0; i >>= 1) mn[i] = Math.min(mn[2 * i], mn[2 * i + 1]);
            }
            while (next < qq && (keys[next] >> 16) == pos) {
                int j = (int) (keys[next] & 65535);
                int l = (int) qs[j][0] - 1;
                int node = 1;
                while (node < size) {
                    if (mn[2 * node] < l) node = 2 * node;
                    else node = 2 * node + 1;
                }
                ans[j] = node - size;
                next++;
            }
        }
        StringBuilder out = new StringBuilder();
        for (int j = 0; j < qq; j++) {
            if (j > 0) out.append(" ");
            out.append(ans[j]);
        }
        System.out.println(out);`,
      includes: ['<algorithm>', '<string>']
    },
    solution: { explanation: ['The questions are answered offline in the order of their right end. A segment tree over the values keeps the last position of each value (minimum in every node); the mex of l..r is found by descending to the leftmost value whose last position is less than l.'], complexity: 'Time O((n + q) log n), space O(n + q).' },
    solve(input) {
      const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const qs = many(q, (j) => nums(rs[2 + j])); const last = new Int32Array(n + 2).fill(-1); const order = Array.from({ length: q }, (_, j) => j).sort((x, y) => qs[x][1] - qs[y][1] || x - y); const ans = new Array(q); let p = 0;
      // a plain scan over the values for every question, using the "last seen" table (no tree)
      for (const j of order) { while (p < qs[j][1]) { if (a[p] <= n) last[a[p]] = p; p++; } const l = qs[j][0] - 1; let v = 0; while (last[v] >= l) v++; ans[j] = v; } return ans.join(' ');
    },
    tests() {
      const g = rng(5107); const out = ['6 3\n1 0 2 0 3 1\n1 6\n2 3\n4 6\n', '1 1\n0\n1 1\n', '1 1\n5\n1 1\n'];
      const brute = (input) => { const rs = rows(input); const [n, q] = nums(rs[0]); const a = nums(rs[1]); const res = []; for (let j = 0; j < q; j++) { const [l, rr] = nums(rs[2 + j]); const set = new Set(a.slice(l - 1, rr)); let v = 0; while (set.has(v)) v++; res.push(v); } return res.join(' '); };
      const make = (n, q, mode) => { let a; if (mode === 'perm') a = shuffle(g, many(n, (i) => i)); else if (mode === 'small') a = randArray(g, n, 0, 10); else if (mode === 'rich') a = randArray(g, n, 0, Math.floor(n / 3)); else if (mode === 'big') a = randArray(g, n, 0, 1000000000); else a = many(n, (i) => i); const qs = many(q, () => { let l = randInt(g, 1, n), rr = randInt(g, 1, n); if (l > rr) [l, rr] = [rr, l]; if (g() < 0.3) l = randInt(g, 1, Math.min(n, 3)); return [l, Math.max(l, rr)]; }); return `${n} ${q}\n${a.join(' ')}\n${lines(qs)}\n`; };
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 10), 'rich'), (i) => this.solve(i), brute, 800);
      crossCheck(() => make(randInt(g, 1, 12), randInt(g, 1, 10), 'small'), (i) => this.solve(i), brute, 300);
      for (const [n, q, mode] of [[30, 30, 'perm'], [300, 300, 'rich'], [3000, 3000, 'small'], [50000, 50000, 'perm'], [50000, 50000, 'rich'], [40000, 40000, 'sorted'], [30000, 30000, 'big'], [49999, 50000, 'small']]) out.push(make(n, q, mode));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has the word `s`.'],
    constraints: ['1 <= |s| <= 100000', '`s` has lowercase letters only.'],
    slug: 'different-palindromes-in-every-prefix',
    title: 'How Many Different Palindromes Are in Every Prefix of the Word?',
    tags: ['palindromic-tree', 'eertree', 'strings', 'amortized-analysis'],
    concept: {
      title: 'The palindromic tree stores every different palindrome once, and a new letter adds at most one new palindrome',
      body: [
        'For every prefix of a word, count the **different palindromic substrings** (each text counted once). For `abaab` the prefixes `a, ab, aba, abaa, abaab` contain 1, 2, 3, 4 and 5 different palindromes: after `aba` they are `a, b, aba`; the prefix `abaa` adds `aa`, and `abaab` adds `baab`. Collecting all palindromes of every prefix into a set costs far too much.',
        'A key fact: when one letter is appended, **at most one new palindrome appears**, and it is the longest palindromic suffix of the new prefix (every shorter palindromic suffix is a suffix of the longest one, and it also occurs earlier by symmetry). The **palindromic tree** (eertree) uses this. Its nodes are the different palindromes. A node has edges `c`: from the palindrome `P` to `cPc`. There are two roots: the "imaginary" palindrome of length -1 and the empty one of length 0. Every node has a **suffix link** to its longest proper palindromic suffix.',
        { code: 'cur = last                                    # the longest palindromic suffix of the previous prefix\nwhile s[i - len[cur] - 1] != s[i]: cur = link[cur]     # the first one that can be extended by s[i] on both sides\nif there is no edge (cur, s[i]):\n    create node with len[cur] + 2\n    link = the edge (p, s[i]) where p is the first suffix link of cur that can be extended   (or the empty palindrome, if the new length is 1)\n    add the edge\nlast = the node reached; print the number of nodes - 2' },
        'The total work of the link walks is amortised O(n), because the length of the longest palindromic suffix grows by at most 2 per letter and every step of the walk shortens it. Therefore the whole word is handled in O(n) (with 26 transitions per node), and the number of different palindromes is simply the number of nodes created so far (minus the two roots).'
      ]
    },
    statement: ['A word `s` is given. For every prefix of `s` (of the lengths 1, 2, ..., |s|), count the different palindromes that occur in it as blocks of neighbouring letters (a palindrome reads the same in both directions; a single letter is a palindrome; equal texts are counted once). Print the |s| counts on one line.'],
    outputFormat: ['Print |s| numbers separated by spaces.'],
    examples: [{ input: 'abaab\n', note: 'The prefixes a, ab, aba, abaa and abaab have 1, 2, 3, 4 and 5 different palindromes (the last new ones are aa and baab): 1 2 3 4 5.' }],
    hints: ['A new letter can create at most one new palindrome: the longest palindromic suffix of the new prefix.', 'Keep a tree of the different palindromes, with a suffix link from each one to its longest proper palindromic suffix.', 'To add a letter, walk down the suffix links from the previous longest suffix palindrome until it can be extended by that letter on both sides.'],
    program: {
      io: ['s:word'],
      fast: true,
      python: r`
        length = [-1, 0]
        link = [0, 0]
        nxt = {}
        last = 1
        out = []
        for i, ch in enumerate(s):
            c = ord(ch) - 97
            cur = last
            while True:
                j = i - length[cur] - 1
                if j >= 0 and s[j] == ch:
                    break
                cur = link[cur]
            key = cur * 26 + c
            if key not in nxt:
                node = len(length)
                length.append(length[cur] + 2)
                if length[node] == 1:
                    link.append(1)
                else:
                    p = link[cur]
                    while True:
                        j = i - length[p] - 1
                        if j >= 0 and s[j] == ch:
                            break
                        p = link[p]
                    link.append(nxt[p * 26 + c])
                nxt[key] = node
            last = nxt[key]
            out.append(len(length) - 2)
        print(*out)`,
      cpp: r`
        int cnt = (int)s.size();
        vector<int> length(cnt + 3, 0), link(cnt + 3, 0), to((size_t)(cnt + 3) * 26, 0);
        length[0] = -1;
        length[1] = 0;
        int size = 2, last = 1;
        string out;
        for (int i = 0; i < cnt; i++) {
            int c = s[i] - 'a';
            int cur = last;
            while (true) {
                int j = i - length[cur] - 1;
                if (j >= 0 && s[j] == s[i]) break;
                cur = link[cur];
            }
            if (to[(size_t)cur * 26 + c] == 0) {
                int node = size++;
                length[node] = length[cur] + 2;
                if (length[node] == 1) {
                    link[node] = 1;
                } else {
                    int p = link[cur];
                    while (true) {
                        int j = i - length[p] - 1;
                        if (j >= 0 && s[j] == s[i]) break;
                        p = link[p];
                    }
                    link[node] = to[(size_t)p * 26 + c];
                }
                to[(size_t)cur * 26 + c] = node;
            }
            last = to[(size_t)cur * 26 + c];
            if (i > 0) out += " ";
            out += to_string(size - 2);
        }
        cout << out << "\n";`,
      java: r`
        int cnt = s.length();
        int[] length = new int[cnt + 3];
        int[] link = new int[cnt + 3];
        int[] to = new int[(cnt + 3) * 26];
        length[0] = -1;
        length[1] = 0;
        int size = 2, last = 1;
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < cnt; i++) {
            int c = s.charAt(i) - 'a';
            int cur = last;
            while (true) {
                int j = i - length[cur] - 1;
                if (j >= 0 && s.charAt(j) == s.charAt(i)) break;
                cur = link[cur];
            }
            if (to[cur * 26 + c] == 0) {
                int node = size++;
                length[node] = length[cur] + 2;
                if (length[node] == 1) {
                    link[node] = 1;
                } else {
                    int p = link[cur];
                    while (true) {
                        int j = i - length[p] - 1;
                        if (j >= 0 && s.charAt(j) == s.charAt(i)) break;
                        p = link[p];
                    }
                    link[node] = to[p * 26 + c];
                }
                to[cur * 26 + c] = node;
            }
            last = to[cur * 26 + c];
            if (i > 0) out.append(" ");
            out.append(size - 2);
        }
        System.out.println(out);`,
      includes: ['<string>']
    },
    solution: { explanation: ['A palindromic tree has one node per different palindrome and a suffix link from each node to its longest proper palindromic suffix. A new letter adds at most one node, found by walking the suffix links from the previous longest palindromic suffix; the number of nodes minus the two roots is the answer for the prefix.'], complexity: 'Time O(n) amortised, space O(26 n).' },
    solve(input) {
      const s = rows(input)[0]; const n = s.length; const len = new Int32Array(n + 3), link = new Int32Array(n + 3), to = new Int32Array((n + 3) * 26); len[0] = -1; len[1] = 0; let size = 2, last = 1; const out = [];
      for (let i = 0; i < n; i++) { const c = s.charCodeAt(i) - 97; let cur = last; for (;;) { const j = i - len[cur] - 1; if (j >= 0 && s[j] === s[i]) break; cur = link[cur]; } if (to[cur * 26 + c] === 0) { const node = size++; len[node] = len[cur] + 2; if (len[node] === 1) link[node] = 1; else { let p = link[cur]; for (;;) { const j = i - len[p] - 1; if (j >= 0 && s[j] === s[i]) break; p = link[p]; } link[node] = to[p * 26 + c]; } to[cur * 26 + c] = node; } last = to[cur * 26 + c]; out.push(size - 2); } return out.join(' ');
    },
    tests() {
      const g = rng(5108); const out = ['abaab\n', 'a\n', 'aaaa\n', 'abcd\n'];
      const brute = (input) => { const s = rows(input)[0]; const set = new Set(); const res = []; for (let i = 0; i < s.length; i++) { for (let j = 0; j <= i; j++) { const sub = s.slice(j, i + 1); if (sub === [...sub].reverse().join('')) set.add(sub); } res.push(set.size); } return res.join(' '); };
      const fib = (n) => { let a = 'a', b = 'ab'; while (b.length < n) [a, b] = [b, b + a]; return b.slice(0, n); };
      crossCheck(() => randWord(g, randInt(g, 1, 14), 'ab') + '\n', (i) => this.solve(i), brute, 1000);
      crossCheck(() => randWord(g, randInt(g, 1, 14), 'abc') + '\n', (i) => this.solve(i), brute, 300);
      for (const w of [randWord(g, 30, 'ab'), randWord(g, 500, 'abc'), randWord(g, 100000, 'ab'), randWord(g, 100000, 'abcdefghijklmnopqrstuvwxyz'), 'a'.repeat(99999), 'ab'.repeat(40000), fib(100000), 'a'.repeat(30000) + 'b' + 'a'.repeat(30000), randWord(g, 30000, 'abc')]) out.push(w + '\n');
      return out;
    }
  }
];
