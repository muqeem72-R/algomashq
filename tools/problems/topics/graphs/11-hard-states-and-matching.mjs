import { r, rng, randInt, many, nums, rows, shuffle } from '../../lib.mjs';
import { graphText, randomEdges, randomTreeEdges, connectedEdges, mix, Heap } from '../../graphlib.mjs';
import { EDGE_INPUT } from '../../graphcode.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const hard = { difficulty: 'hard' };
const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const inside = (h, w, a, b) => a >= 0 && a < h && b >= 0 && b < w;
const parseGrid = (input) => { const rs = rows(input); const [h, w] = nums(rs[0]); return { h, w, cells: rs.slice(1, 1 + h), rs }; };
const gridOf = (g, h, w, chars, weights) => Array.from({ length: h }, () => Array.from({ length: w }, () => { let x = g() * weights.reduce((a, b) => a + b, 0); for (let i = 0; i < chars.length; i++) { x -= weights[i]; if (x < 0) return chars[i]; } return chars[chars.length - 1]; }).join(''));
const gridInput = (h, w, cells) => `${h} ${w}\n${cells.join('\n')}\n`;

export default [
  {
    ...hard,
    inputFormat: ['The first line has `h` and `w`: the number of rows and columns.', 'Each of the next `h` lines has a row of `w` characters: `R`, `L`, `D` or `U`.'],
    constraints: ['1 <= h, w <= 150', 'Every character is `R` (right), `L` (left), `D` (down) or `U` (up).'],
    slug: 'valid-grid-path-min-cost',
    title: 'Fewest Arrows to Turn to Reach the Corner',
    tags: ['graph', 'grid', '0-1-bfs', 'deque', 'shortest-path'],
    concept: {
      title: 'Free moves and cost-1 moves: a deque instead of a priority queue (0-1 BFS)',
      body: [
        'Every cell of a grid holds an arrow: `R`, `L`, `D` or `U`. Standing on a cell, you may follow its arrow to the next cell **for free**. You may also step to any other neighbouring cell, but then you have to **turn the arrow** of the cell you leave, which costs **1**. What is the smallest total cost to get from the top left cell to the bottom right cell? Each arrow can be turned at most once in any useful path, so the cost is simply the number of steps that do not follow the arrow.',
        'This is a shortest path problem where every edge costs **0** or **1**. Dijkstra\'s algorithm works, but there is a simpler tool, *0-1 BFS*: keep a **deque** of cells. When the move costs 0, push the new cell to the **front**; when it costs 1, push it to the **back**. The deque then always stays sorted by distance (the front has the smallest distance, and the back has at most one more), so cells come out in the order of increasing distance without a heap, in O(1) per push.',
        { code: 'dist = [[INF] * w for _ in range(h)]\ndist[0][0] = 0\ndeque = [(0, 0)]\nwhile deque:\n    x, y = deque.popleft()\n    for d, (dx, dy) in enumerate(moves):          # d is the direction letter of this move\n        a, b = x + dx, y + dy\n        if not inside(a, b): continue\n        cost = 0 if grid[x][y] == letters[d] else 1\n        if dist[x][y] + cost < dist[a][b]:\n            dist[a][b] = dist[x][y] + cost\n            if cost == 0: deque.appendleft((a, b))\n            else: deque.append((a, b))' },
        'A cell may be pushed more than once (when a shorter distance is found later), so the check `dist + cost < dist[a][b]` is needed; a cell is only expanded with its best distance because older, larger entries find nothing to improve. The time is O(h * w) with four moves per cell. Whenever the edge costs take only two values that differ by one, think of a deque.'
      ]
    },
    statement: ['A grid has `h` rows and `w` columns; every cell holds an arrow `R` (right), `L` (left), `D` (down) or `U` (up). From a cell you can move to one of its four neighbours (inside the grid). The move along the arrow of the cell costs 0; a move in any other direction costs 1 (the arrow of the cell is turned). Print the smallest total cost of a path from the top left cell to the bottom right cell.'],
    outputFormat: ['Print the smallest total cost.'],
    examples: [{ input: '2 3\nRRD\nLLU\n', note: 'Follow the arrows right, right, down to the bottom right cell: cost 0.' }, { input: '2 2\nLL\nUU\n', note: 'Both moves (right and down) have to be bought: cost 2.' }],
    hints: ['Think of the cells as nodes; a move along the arrow costs 0 and any other move costs 1.', 'Use a deque: a cost-0 move goes to the front, a cost-1 move goes to the back.', 'Update a cell only when you find a strictly smaller distance.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      includes: ['<deque>'],
      python: r`
        from collections import deque
        INF = 10 ** 9
        letters = "RLDU"
        moves = ((0, 1), (0, -1), (1, 0), (-1, 0))
        dist = [[INF] * w for _ in range(h)]
        dist[0][0] = 0
        queue = deque([(0, 0)])
        while queue:
            x, y = queue.popleft()
            for d in range(4):
                a, b = x + moves[d][0], y + moves[d][1]
                if 0 <= a < h and 0 <= b < w:
                    cost = 0 if grid[x][y] == letters[d] else 1
                    if dist[x][y] + cost < dist[a][b]:
                        dist[a][b] = dist[x][y] + cost
                        if cost == 0:
                            queue.appendleft((a, b))
                        else:
                            queue.append((a, b))
        print(dist[h - 1][w - 1])`,
      cpp: r`
        const int INF = 1000000000;
        string letters = "RLDU";
        int dx[4] = {0, 0, 1, -1}, dy[4] = {1, -1, 0, 0};
        vector<vector<int>> dist(h, vector<int>(w, INF));
        dist[0][0] = 0;
        deque<pair<int, int>> queue;
        queue.push_back({0, 0});
        while (!queue.empty()) {
            pair<int, int> cell = queue.front();
            queue.pop_front();
            int x = cell.first, y = cell.second;
            for (int d = 0; d < 4; d++) {
                int a = x + dx[d], b = y + dy[d];
                if (a < 0 || a >= h || b < 0 || b >= w) continue;
                int cost = grid[x][y] == letters[d] ? 0 : 1;
                if (dist[x][y] + cost < dist[a][b]) {
                    dist[a][b] = dist[x][y] + cost;
                    if (cost == 0) queue.push_front({a, b});
                    else queue.push_back({a, b});
                }
            }
        }
        cout << dist[h - 1][w - 1] << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        final int INF = 1000000000;
        String letters = "RLDU";
        int[] dx = {0, 0, 1, -1}, dy = {1, -1, 0, 0};
        int[] dist = new int[rowsCount * colsCount];
        Arrays.fill(dist, INF);
        dist[0] = 0;
        int size = 4 * rowsCount * colsCount + 8;
        int[] queue = new int[2 * size];
        int front = size, back = size;
        queue[back++] = 0;
        while (front < back) {
            int cell = queue[front++];
            int x = cell / colsCount, y = cell % colsCount;
            for (int d = 0; d < 4; d++) {
                int a = x + dx[d], b = y + dy[d];
                if (a < 0 || a >= rowsCount || b < 0 || b >= colsCount) continue;
                int cost = grid[x].charAt(y) == letters.charAt(d) ? 0 : 1;
                if (dist[cell] + cost < dist[a * colsCount + b]) {
                    dist[a * colsCount + b] = dist[cell] + cost;
                    if (cost == 0) queue[--front] = a * colsCount + b;
                    else queue[back++] = a * colsCount + b;
                }
            }
        }
        System.out.println(dist[rowsCount * colsCount - 1]);`
    },
    solution: { explanation: ['0-1 BFS: a deque holds the cells; moving along the arrow costs 0 and puts the cell at the front, any other move costs 1 and puts it at the back. A cell is pushed again only when a strictly smaller distance is found, and the distance of the last cell is printed.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) {
      // Dijkstra with a heap (a different structure from the deque of the solutions)
      const { h, w, cells } = parseGrid(input); const INF = 1e9; const dist = Array.from({ length: h }, () => new Array(w).fill(INF)); dist[0][0] = 0; const heap = new Heap((a, b) => a[0] < b[0]); heap.push([0, 0, 0]);
      const letters = 'RLDU';
      while (heap.size) { const [d0, x, y] = heap.pop(); if (d0 > dist[x][y]) continue; for (let d = 0; d < 4; d++) { const a = x + DIRS[d][0], b = y + DIRS[d][1]; if (!inside(h, w, a, b)) continue; const c = cells[x][y] === letters[d] ? 0 : 1; if (d0 + c < dist[a][b]) { dist[a][b] = d0 + c; heap.push([d0 + c, a, b]); } } }
      return String(dist[h - 1][w - 1]);
    },
    tests() {
      const g = rng(1101); const out = ['2 3\nRRD\nLLU\n', '2 2\nLL\nUU\n', '1 1\nR\n', '1 5\nLLLLL\n', '3 1\nU\nU\nU\n', '3 1\nD\nD\nD\n'];
      const brute = (input) => { // Bellman-Ford style: relax every cell until nothing changes
        const { h, w, cells } = parseGrid(input); const INF = 1e9; const dist = Array.from({ length: h }, () => new Array(w).fill(INF)); dist[0][0] = 0; const letters = 'RLDU'; let changed = true;
        while (changed) { changed = false; for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) for (let d = 0; d < 4; d++) { const a = x + DIRS[d][0], b = y + DIRS[d][1]; if (!inside(h, w, a, b)) continue; const c = cells[x][y] === letters[d] ? 0 : 1; if (dist[x][y] + c < dist[a][b]) { dist[a][b] = dist[x][y] + c; changed = true; } } }
        return String(dist[h - 1][w - 1]);
      };
      crossCheck(() => { const h = randInt(g, 1, 6), w = randInt(g, 1, 6); return gridInput(h, w, gridOf(g, h, w, 'RLDU', [1, 1, 1, 1])); }, (i) => this.solve(i), brute, 300);
      const sizes = [[3, 4], [10, 10], [30, 30], [60, 60], [100, 100], [150, 150], [150, 150], [150, 150], [1, 150], [150, 1], [2, 150], [150, 2]];
      for (const [h, w] of sizes) out.push(gridInput(h, w, gridOf(g, h, w, 'RLDU', [1, 1, 1, 1])));
      out.push(gridInput(150, 150, gridOf(g, 150, 150, 'RLDU', [6, 1, 6, 1])), gridInput(150, 150, gridOf(g, 150, 150, 'RLDU', [1, 6, 1, 6])), gridInput(150, 150, gridOf(g, 150, 150, 'RLDU', [1, 8, 1, 8])), gridInput(150, 150, gridOf(g, 150, 150, 'RLDU', [10, 1, 1, 1])));
      // a snake of arrows that leads straight to the goal, and the same grid turned around (every move costs)
      const snake = many(150, (x) => (x % 2 === 0 ? 'R'.repeat(149) + 'D' : 'L'.repeat(149) + 'D')); snake[149] = 'R'.repeat(150);
      out.push(gridInput(150, 150, snake), gridInput(150, 150, snake.map((row) => row.split('').map((c) => ({ R: 'L', L: 'R', D: 'U', U: 'D' })[c]).join(''))));
      out.push(gridInput(150, 150, many(150, () => 'L'.repeat(150))), gridInput(150, 150, many(150, () => 'U'.repeat(150))));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `h`, `w` and `k`: the number of rows, the number of columns and the number of obstacles you may remove.', 'Each of the next `h` lines has a row of `w` characters: `0` (empty) or `1` (an obstacle).'],
    constraints: ['1 <= h, w <= 30', '0 <= k <= 900', 'The top left and the bottom right cells are empty (`0`).'],
    slug: 'obstacle-elimination-path',
    title: 'Shortest Path If You Can Break k Walls',
    tags: ['graph', 'grid', 'bfs', 'state-space'],
    concept: {
      title: 'Add the number of broken walls to the state: BFS over (row, column, walls used)',
      body: [
        'In a grid of empty cells (`0`) and walls (`1`) you walk from the top left to the bottom right corner, one step up, down, left or right at a time. You are allowed to **break at most `k` walls** on the way (stepping into a wall cell uses one of your `k`). What is the smallest number of steps? An ordinary BFS does not work: the cell alone does not tell enough, because reaching a cell with **more walls left** is better than reaching it with fewer, and the two situations lead to different futures.',
        'So the *state* has three parts: `(row, column, walls broken so far)`. Moving into an empty cell keeps the count; moving into a wall cell adds one and is allowed only while the count stays at most `k`. All steps cost 1, so a breadth-first search over the states gives the smallest number of steps; the answer is the distance of the first state at the bottom right corner, whatever its count is.',
        { code: 'seen = {(0, 0, 0)}\nqueue = [(0, 0, 0)]\nsteps = 0\nwhile queue:\n    next_layer = []\n    for x, y, used in queue:\n        if (x, y) == (h - 1, w - 1): answer = steps\n        for a, b in neighbours(x, y):\n            nu = used + grid[a][b]\n            if nu <= k and (a, b, nu) not in seen:\n                seen.add((a, b, nu))\n                next_layer.append((a, b, nu))\n    queue = next_layer\n    steps += 1' },
        'There are `h * w * (k + 1)` states with four moves each. A useful bound: a shortest path never needs more than `h + w - 3` wall breaks (it never has to break more walls than there are cells on a straight route), so a larger `k` can be cut down to that value. This "add a counter to the state" idea turns many puzzles with a limited resource (fuel, keys, free moves) into plain BFS.'
      ]
    },
    statement: ['A grid has `h` rows and `w` columns; `0` is an empty cell and `1` is a wall. You start at the top left cell and want to reach the bottom right cell, moving one step up, down, left or right. You may walk into at most `k` wall cells (each one of them is broken as you pass). Print the smallest number of steps, or -1 if the corner cannot be reached.'],
    outputFormat: ['Print the smallest number of steps, or -1.'],
    examples: [{ input: '3 3 1\n001\n110\n000\n', note: 'Break the wall in the middle left (row 2, column 1) or the one on the right: 4 steps.' }, { input: '2 2 0\n01\n10\n', note: 'No wall may be broken and both ways are closed: -1.' }],
    hints: ['A cell is not enough to describe where you are; add the number of walls broken so far.', 'A step into a wall cell uses one break; do not allow more than k.', 'Run BFS from (0, 0, 0); the first time you reach the last cell, with any count, you have the answer.'],
    program: {
      io: ['h:int w:int k:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        k = min(k, h + w - 3) if h + w > 2 else 0
        seen = [[[False] * (k + 1) for _ in range(w)] for _ in range(h)]
        seen[0][0][0] = True
        layer = [(0, 0, 0)]
        steps = 0
        answer = -1
        while layer and answer < 0:
            next_layer = []
            for x, y, used in layer:
                if x == h - 1 and y == w - 1:
                    answer = steps
                    break
                for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= a < h and 0 <= b < w:
                        nu = used + (1 if grid[a][b] == "1" else 0)
                        if nu <= k and not seen[a][b][nu]:
                            seen[a][b][nu] = True
                            next_layer.append((a, b, nu))
            layer = next_layer
            steps += 1
        print(answer)`,
      cpp: r`
        long long limit = h + w > 2 ? min(k, h + w - 3) : 0;
        int cap = (int)limit;
        vector<vector<vector<char>>> seen(h, vector<vector<char>>(w, vector<char>(cap + 1, 0)));
        vector<array<int, 3>> layer;
        layer.push_back({0, 0, 0});
        seen[0][0][0] = 1;
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        long long steps = 0, answer = -1;
        while (!layer.empty() && answer < 0) {
            vector<array<int, 3>> next;
            for (const auto& state : layer) {
                int x = state[0], y = state[1], used = state[2];
                if (x == h - 1 && y == w - 1) {
                    answer = steps;
                    break;
                }
                for (int d = 0; d < 4; d++) {
                    int a = x + dx[d], b = y + dy[d];
                    if (a < 0 || a >= h || b < 0 || b >= w) continue;
                    int nu = used + (grid[a][b] == '1' ? 1 : 0);
                    if (nu <= cap && !seen[a][b][nu]) {
                        seen[a][b][nu] = 1;
                        next.push_back({a, b, nu});
                    }
                }
            }
            layer = next;
            steps++;
        }
        cout << answer << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        int cap = (int) (rowsCount + colsCount > 2 ? Math.min(k, rowsCount + colsCount - 3) : 0);
        boolean[] seen = new boolean[rowsCount * colsCount * (cap + 1)];
        int[] layer = new int[rowsCount * colsCount * (cap + 1)];
        int[] next = new int[rowsCount * colsCount * (cap + 1)];
        int layerSize = 0;
        layer[layerSize++] = 0;
        seen[0] = true;
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        long steps = 0, answer = -1;
        while (layerSize > 0 && answer < 0) {
            int nextSize = 0;
            for (int i = 0; i < layerSize; i++) {
                int state = layer[i];
                int used = state % (cap + 1);
                int cell = state / (cap + 1);
                int x = cell / colsCount, y = cell % colsCount;
                if (x == rowsCount - 1 && y == colsCount - 1) {
                    answer = steps;
                    break;
                }
                for (int d = 0; d < 4; d++) {
                    int a = x + dx[d], b = y + dy[d];
                    if (a < 0 || a >= rowsCount || b < 0 || b >= colsCount) continue;
                    int nu = used + (grid[a].charAt(b) == '1' ? 1 : 0);
                    if (nu <= cap) {
                        int id = (a * colsCount + b) * (cap + 1) + nu;
                        if (!seen[id]) {
                            seen[id] = true;
                            next[nextSize++] = id;
                        }
                    }
                }
            }
            int[] swap = layer;
            layer = next;
            next = swap;
            layerSize = nextSize;
            steps++;
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['A breadth-first search over the states (row, column, walls broken so far); a step into a wall uses one break and is allowed only while the count stays at most k (which can be capped at h + w - 3). The number of the layer in which the last cell appears is the answer, or -1 if the search ends without reaching it.'], complexity: 'Time O(h * w * min(k, h + w)), space O(h * w * min(k, h + w)).' },
    solve(input) {
      // the "fewest walls for each number of steps" table (a different method from the BFS over states)
      const rs = rows(input); const [h, w, k] = nums(rs[0]); const cells = rs.slice(1, 1 + h); const INF = 1e9; let cur = Array.from({ length: h }, () => new Array(w).fill(INF)); cur[0][0] = 0;
      if (h === 1 && w === 1) return '0';
      for (let step = 1; step <= h * w * 2; step++) { const nxt = Array.from({ length: h }, () => new Array(w).fill(INF)); for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) { if (cur[x][y] >= INF) continue; for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (!inside(h, w, a, b)) continue; const cost = cur[x][y] + (cells[a][b] === '1' ? 1 : 0); if (cost < nxt[a][b]) nxt[a][b] = cost; } } cur = nxt; if (cur[h - 1][w - 1] <= k) return String(step); }
      return '-1';
    },
    tests() {
      const g = rng(1102); const out = ['3 3 1\n001\n110\n000\n', '2 2 0\n01\n10\n', '1 1 0\n0\n', '1 4 0\n0000\n', '1 3 1\n010\n', '1 3 0\n010\n'];
      const make = (h, w, k, wallWeight) => { const cells = gridOf(g, h, w, '01', [1, wallWeight]).map((row) => row.split('')); cells[0][0] = '0'; cells[h - 1][w - 1] = '0'; return `${h} ${w} ${k}\n${cells.map((row) => row.join('')).join('\n')}\n`; };
      const naive = (input) => { // plain BFS over (cell, walls) with a visited set of strings
        const rs = rows(input); const [h, w, k] = nums(rs[0]); const cells = rs.slice(1, 1 + h); const seen = new Set(['0,0,0']); let layer = [[0, 0, 0]]; let steps = 0;
        while (layer.length) { const nxt = []; for (const [x, y, u] of layer) { if (x === h - 1 && y === w - 1) return String(steps); for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (!inside(h, w, a, b)) continue; const nu = u + (cells[a][b] === '1' ? 1 : 0); const key = `${a},${b},${nu}`; if (nu <= k && !seen.has(key)) { seen.add(key); nxt.push([a, b, nu]); } } } layer = nxt; steps++; }
        return '-1';
      };
      crossCheck(() => make(randInt(g, 1, 7), randInt(g, 1, 7), randInt(g, 0, 5), randInt(g, 1, 4)), (i) => this.solve(i), naive, 300);
      for (const [h, w, k, ww] of [[5, 5, 0, 1], [8, 8, 2, 1], [10, 10, 3, 1], [15, 15, 5, 1], [20, 20, 8, 2], [30, 30, 0, 1], [30, 30, 5, 1], [30, 30, 10, 2], [30, 30, 30, 3], [30, 30, 100, 3], [30, 30, 900, 3], [30, 30, 12, 1], [30, 30, 20, 2], [30, 30, 2, 1], [1, 30, 3, 2], [30, 1, 3, 2], [2, 30, 1, 2], [30, 2, 2, 2]]) out.push(make(h, w, k, ww));
      // a corridor closed by a wall every few cells and the same with a budget that is just enough
      const walls = many(30, (x) => (x % 2 === 0 ? '0'.repeat(30) : (x % 4 === 1 ? '1'.repeat(29) + '0' : '0' + '1'.repeat(29)))); walls[29] = '0'.repeat(30);
      out.push(`30 30 0\n${walls.join('\n')}\n`, `30 30 1\n${walls.join('\n')}\n`, `30 30 13\n${many(30, (x) => (x % 2 === 0 ? '0'.repeat(30) : '1'.repeat(30))).map((row, x) => (x === 29 ? '0'.repeat(30) : row)).join('\n')}\n`);
      out.push(`30 30 14\n${many(30, (x) => (x % 2 === 0 ? '0'.repeat(30) : '1'.repeat(30))).map((row, x) => (x === 29 ? '0'.repeat(30) : row)).join('\n')}\n`);
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `q`: the number of boards.', 'Each of the next `q` lines has the 8 numbers of one board, row by row (the first row, then the second row). The numbers 1 to 7 and 0 (the empty place) appear exactly once on each board.'],
    constraints: ['1 <= q <= 20000', 'Every line is a permutation of the numbers 0 to 7.'],
    slug: 'sliding-puzzle-two-by-four',
    title: 'Slide the Tiles of a 2 by 4 Puzzle Home',
    tags: ['graph', 'bfs', 'state-space', 'puzzle', 'multi-source'],
    concept: {
      title: 'Search once from the goal, and every board can be answered by a lookup',
      body: [
        'A board has 2 rows and 4 columns with the tiles 1 to 7 and one empty place (0). A move slides a tile that is next to the empty place into it. The goal board is `1 2 3 4` over `5 6 7 0`. For each given board, how many moves are needed, or is the goal unreachable (then print -1)? Think of every arrangement of the tiles as a **node** and every move as an **edge**: it is a shortest path problem on a graph with `8! = 40320` nodes.',
        'The edges can be followed in both directions (a move can be undone), so the number of moves from a board to the goal equals the number of moves from the goal to that board. Therefore **one** BFS that starts at the **goal** gives the distance of every board at once, and each of the `q` questions becomes a table lookup. Boards that the BFS never reaches (half of all arrangements, those with the wrong parity) get the answer -1.',
        { code: 'goal = (1, 2, 3, 4, 5, 6, 7, 0)\ndist = {goal: 0}\nqueue = [goal]\nfor board in queue:\n    z = board.index(0)\n    for t in neighbours_of_place[z]:              # the places next to the empty place\n        nb = list(board); nb[z], nb[t] = nb[t], nb[z]\n        nb = tuple(nb)\n        if nb not in dist:\n            dist[nb] = dist[board] + 1\n            queue.append(nb)\nfor each query board: print(dist.get(board, -1))' },
        'Only 20160 boards are reachable, so the search is tiny, and it is done **once** whatever `q` is. This is the *reverse search* idea: when there are many start states and one goal, search from the goal. The same table also shows how hard the puzzle can be: the farthest boards are a few dozen moves away.'
      ]
    },
    statement: ['A puzzle board has 2 rows and 4 columns holding the tiles 1 to 7 and one empty place (0). A move slides a tile that is directly next to the empty place (up, down, left or right) into it. The goal is the board `1 2 3 4` / `5 6 7 0`. For each of the `q` given boards print the smallest number of moves that leads to the goal, or -1 if the goal cannot be reached.'],
    outputFormat: ['Print `q` lines: the answer for each board, in the order of the input.'],
    examples: [{ input: '3\n1 2 3 4 5 6 7 0\n1 2 3 4 5 6 0 7\n2 1 3 4 5 6 7 0\n', note: 'The goal itself needs 0 moves; sliding the 7 left needs 1 move; the board with the first two tiles swapped cannot be solved: -1.' }],
    hints: ['Every arrangement is a node and every move is an edge that can be undone.', 'Run one BFS from the goal board over all reachable boards and store the distances.', 'Answer each question with a lookup; a board that is not in the table gets -1.'],
    program: {
      io: ['q:int', 'boards:int[q][8]'],
      fast: true,
      helpers: {
        python: '',
        cpp: r`
          int placeOf(const vector<int>& b) {
              int rank = 0;
              for (int i = 0; i < 8; i++) {
                  int smaller = 0;
                  for (int j = i + 1; j < 8; j++) if (b[j] < b[i]) smaller++;
                  rank = rank * (8 - i) + smaller;
              }
              return rank;
          }`,
        java: r`
          static int placeOf(int[] b) {
              int rank = 0;
              for (int i = 0; i < 8; i++) {
                  int smaller = 0;
                  for (int j = i + 1; j < 8; j++) if (b[j] < b[i]) smaller++;
                  rank = rank * (8 - i) + smaller;
              }
              return rank;
          }`
      },
      python: r`
        goal = (1, 2, 3, 4, 5, 6, 7, 0)
        near = [[1, 4], [0, 2, 5], [1, 3, 6], [2, 7], [0, 5], [1, 4, 6], [2, 5, 7], [3, 6]]
        dist = {goal: 0}
        queue = [goal]
        for board in queue:
            z = board.index(0)
            for t in near[z]:
                nb = list(board)
                nb[z], nb[t] = nb[t], nb[z]
                nb = tuple(nb)
                if nb not in dist:
                    dist[nb] = dist[board] + 1
                    queue.append(nb)
        out = []
        for row in boards:
            out.append(dist.get(tuple(row), -1))
        print("\n".join(map(str, out)))`,
      cpp: r`
        vector<vector<int>> near = {{1, 4}, {0, 2, 5}, {1, 3, 6}, {2, 7}, {0, 5}, {1, 4, 6}, {2, 5, 7}, {3, 6}};
        vector<int> dist(40320, -1);
        vector<vector<int>> queue;
        vector<int> goal = {1, 2, 3, 4, 5, 6, 7, 0};
        dist[placeOf(goal)] = 0;
        queue.push_back(goal);
        for (size_t i = 0; i < queue.size(); i++) {
            vector<int> board = queue[i];
            int z = 0;
            while (board[z] != 0) z++;
            for (int t : near[z]) {
                vector<int> nb = board;
                swap(nb[z], nb[t]);
                int id = placeOf(nb);
                if (dist[id] < 0) {
                    dist[id] = dist[placeOf(board)] + 1;
                    queue.push_back(nb);
                }
            }
        }
        for (const vector<long long>& row : boards) {
            vector<int> b(8);
            for (int j = 0; j < 8; j++) b[j] = (int)row[j];
            cout << dist[placeOf(b)] << "\n";
        }`,
      java: r`
        int[][] near = {{1, 4}, {0, 2, 5}, {1, 3, 6}, {2, 7}, {0, 5}, {1, 4, 6}, {2, 5, 7}, {3, 6}};
        int[] dist = new int[40320];
        Arrays.fill(dist, -1);
        int[][] queue = new int[20161][];
        int head = 0, tail = 0;
        int[] goal = {1, 2, 3, 4, 5, 6, 7, 0};
        dist[placeOf(goal)] = 0;
        queue[tail++] = goal;
        while (head < tail) {
            int[] board = queue[head++];
            int z = 0;
            while (board[z] != 0) z++;
            int here = dist[placeOf(board)];
            for (int t : near[z]) {
                int[] nb = board.clone();
                nb[z] = nb[t];
                nb[t] = 0;
                int id = placeOf(nb);
                if (dist[id] < 0) {
                    dist[id] = here + 1;
                    queue[tail++] = nb;
                }
            }
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < boards.length; i++) {
            int[] b = new int[8];
            for (int j = 0; j < 8; j++) b[j] = (int) boards[i][j];
            out.append(dist[placeOf(b)]).append("\n");
        }
        System.out.print(out);`
    },
    solution: { explanation: ['One breadth-first search starts at the goal board and visits every reachable arrangement (20160 of them), storing the number of moves; each query is a table lookup, and a board that was never reached gets -1.'], complexity: 'Time O(8! * 8 + q), space O(8!).' },
    solve(input) {
      const rs = rows(input); const q = Number(rs[0]); const near = [[1, 4], [0, 2, 5], [1, 3, 6], [2, 7], [0, 5], [1, 4, 6], [2, 5, 7], [3, 6]]; const goal = '12345670'; const dist = new Map([[goal, 0]]); let layer = [goal];
      while (layer.length) { const nxt = []; for (const b of layer) { const z = b.indexOf('0'); for (const t of near[z]) { const a = b.split(''); a[z] = a[t]; a[t] = '0'; const nb = a.join(''); if (!dist.has(nb)) { dist.set(nb, dist.get(b) + 1); nxt.push(nb); } } } layer = nxt; }
      const out = []; for (let i = 1; i <= q; i++) { const key = nums(rs[i]).join(''); out.push(dist.has(key) ? dist.get(key) : -1); } return out.join('\n');
    },
    tests() {
      const g = rng(1103); const out = ['3\n1 2 3 4 5 6 7 0\n1 2 3 4 5 6 0 7\n2 1 3 4 5 6 7 0\n', '1\n1 2 3 4 5 6 7 0\n', '1\n0 1 2 3 4 5 6 7\n', '1\n7 6 5 4 3 2 1 0\n'];
      const near = [[1, 4], [0, 2, 5], [1, 3, 6], [2, 7], [0, 5], [1, 4, 6], [2, 5, 7], [3, 6]];
      // all boards by walking out from the goal (a different loop from the solutions: layers stored in a list of strings)
      const layers = [['12345670']]; const seenAll = new Set(['12345670']);
      for (;;) { const nxt = []; for (const b of layers[layers.length - 1]) { const z = b.indexOf('0'); for (const t of near[z]) { const a = b.split(''); a[z] = a[t]; a[t] = '0'; const nb = a.join(''); if (!seenAll.has(nb)) { seenAll.add(nb); nxt.push(nb); } } } if (!nxt.length) break; layers.push(nxt); }
      const reach = layers.flat(); const key = (s) => s.split('').join(' ');
      // the forward search from the board to the goal for a few boards must give the layer number
      for (let t = 0; t < 40; t++) { const li = randInt(g, 0, layers.length - 1); const board = layers[li][randInt(g, 0, layers[li].length - 1)]; const seen = new Set([board]); let layer = [board]; let steps = 0; let found = board === '12345670'; while (!found && layer.length) { const nxt = []; for (const b of layer) { const z = b.indexOf('0'); for (const tt of near[z]) { const a = b.split(''); a[z] = a[tt]; a[tt] = '0'; const nb = a.join(''); if (!seen.has(nb)) { seen.add(nb); nxt.push(nb); if (nb === '12345670') found = true; } } } layer = nxt; steps++; } if (steps !== li) throw new Error('forward search differs'); }
      // the unreachable boards: swap two tiles of a reachable board (the parity changes)
      const swapTwo = (s) => { const a = s.split(''); const idx = [...a.keys()].filter((p) => a[p] !== '0'); [a[idx[0]], a[idx[1]]] = [a[idx[1]], a[idx[0]]]; return a.join(''); };
      const unreach = reach.map((s) => swapTwo(s)).filter((s) => !seenAll.has(s));
      const pick = (list, count) => many(count, () => list[randInt(g, 0, list.length - 1)]);
      const make = (list) => `${list.length}\n${list.map(key).join('\n')}\n`;
      out.push(make(pick(reach, 10)), make(pick(reach, 100)), make(pick(unreach, 100)), make(shuffle(g, [...pick(reach, 500), ...pick(unreach, 500)])));
      for (let t = 0; t < 4; t++) out.push(make(shuffle(g, [...pick(reach, 10000), ...pick(unreach, 10000)])));
      out.push(make(shuffle(g, reach).slice(0, 20000)), make(shuffle(g, unreach).slice(0, 20000)));
      // the farthest boards and a few boards from every layer
      out.push(make(layers[layers.length - 1].concat(layers[layers.length - 2]).concat(layers[layers.length - 3])));
      out.push(make(layers.flatMap((l) => pick(l, 5))));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`, `r` and `m`: the number of stops (numbered 1 to n), the number of buses (numbered 1 to r) and the number of pairs.', 'The second line has `s` and `t`: the stop where you start and the stop where you want to go.', 'Each of the next `m` lines has two numbers `b` and `x`: the bus `b` stops at the stop `x`.'],
    constraints: ['1 <= n <= 20000', '1 <= r <= 2000', '1 <= m <= 30000', 'The pairs are all different. A bus may serve any number of stops (also none), and a stop may be served by any number of buses (also none).'],
    slug: 'bus-routes',
    title: 'The Fewest Buses From Stop to Stop',
    tags: ['graph', 'bfs', 'bipartite', 'implicit-graph'],
    concept: {
      title: 'Make the buses the nodes: one ride reaches every stop of a bus at once',
      body: [
        'Buses run in loops through some stops. You start at a stop `s` and may get on **any bus that serves it**; on a bus you can ride to any of its stops and change there to another bus. What is the smallest number of **buses** to reach the stop `t`? The first idea, a graph whose nodes are stops and whose edges join stops of the same bus, is far too big: a bus with 1000 stops would add half a million edges. Do not build it.',
        'Look at the data as a **bipartite graph** with the stops on one side and the buses on the other, and an edge for every pair `(bus, stop)`. Now one ride is one step "stop -> bus" followed by "bus -> any of its stops". Run a BFS in **layers of rides**: the layer 0 is the stop `s`; to build the next layer, take every stop of the current layer, every bus not yet used that serves it, and every stop of that bus. Each bus is used **once** (the first time is the best), and so is each stop. The layer in which `t` appears is the number of buses.',
        { code: 'if s == t: print(0)\nrides = 0\nlayer = [s]; seen_stop = {s}; seen_bus = set()\nwhile layer:\n    rides += 1\n    next_layer = []\n    for x in layer:\n        for b in buses_at[x]:\n            if b in seen_bus: continue\n            seen_bus.add(b)\n            for y in stops_of[b]:\n                if y == t: answer = rides\n                if y not in seen_stop:\n                    seen_stop.add(y); next_layer.append(y)\n    layer = next_layer' },
        'Because every bus is expanded once, the total work is the number of pairs, O(n + r + m), however long the routes are. This is the standard way to handle "groups": when the nodes of a graph are joined in big cliques (all stops of one bus), add a **helper node** for the group instead of the edges. If the layers end without meeting `t`, the answer is -1.'
      ]
    },
    statement: ['There are `n` bus stops and `r` buses; each bus serves a set of stops, given as `m` pairs `(bus, stop)`. You start at the stop `s` and can only move by bus: on a bus you may ride to any stop it serves, and at any stop you may change to any other bus that serves it. Print the smallest number of buses needed to get from `s` to `t` (0 if `s` equals `t`), or -1 if it is impossible.'],
    outputFormat: ['Print the smallest number of buses, or -1.'],
    examples: [{ input: '7 2 6\n1 6\n1 1\n1 2\n1 7\n2 3\n2 6\n2 7\n', note: 'The bus 1 serves the stops 1, 2, 7 and the bus 2 serves 3, 6, 7. Take the bus 1 from the stop 1 to the stop 7, then the bus 2 to the stop 6: 2 buses.' }, { input: '3 1 2\n1 3\n1 1\n1 2\n', note: 'No bus serves the stop 3: -1.' }],
    hints: ['Do not join the stops of a bus pairwise; think of the buses as extra nodes.', 'Process the search in layers; each layer is one more ride.', 'Take every bus only once, and every stop only once.'],
    program: {
      io: ['n:int r:int m:int', 's:int t:int', 'pairs:int[m][2]'],
      fast: true,
      python: r`
        buses_at = [[] for _ in range(n + 1)]
        stops_of = [[] for _ in range(r + 1)]
        for b, x in pairs:
            buses_at[x].append(b)
            stops_of[b].append(x)
        answer = -1
        if s == t:
            answer = 0
        else:
            seen_bus = [False] * (r + 1)
            seen_stop = [False] * (n + 1)
            seen_stop[s] = True
            layer = [s]
            rides = 0
            while layer and answer < 0:
                rides += 1
                next_layer = []
                for x in layer:
                    for b in buses_at[x]:
                        if seen_bus[b]:
                            continue
                        seen_bus[b] = True
                        for y in stops_of[b]:
                            if y == t:
                                answer = rides
                            if not seen_stop[y]:
                                seen_stop[y] = True
                                next_layer.append(y)
                layer = next_layer
        print(answer)`,
      cpp: r`
        vector<vector<int>> busesAt(n + 1), stopsOf(r + 1);
        for (const vector<long long>& p : pairs) {
            busesAt[p[1]].push_back((int)p[0]);
            stopsOf[p[0]].push_back((int)p[1]);
        }
        long long answer = -1;
        if (s == t) {
            answer = 0;
        } else {
            vector<char> seenBus(r + 1, 0), seenStop(n + 1, 0);
            seenStop[s] = 1;
            vector<int> layer = {(int)s};
            long long rides = 0;
            while (!layer.empty() && answer < 0) {
                rides++;
                vector<int> next;
                for (int x : layer) {
                    for (int b : busesAt[x]) {
                        if (seenBus[b]) continue;
                        seenBus[b] = 1;
                        for (int y : stopsOf[b]) {
                            if (y == t) answer = rides;
                            if (!seenStop[y]) {
                                seenStop[y] = 1;
                                next.push_back(y);
                            }
                        }
                    }
                }
                layer = next;
            }
        }
        cout << answer << "\n";`,
      java: r`
        int stopCount = (int) n, busCount = (int) r;
        int source = (int) s, target = (int) t;
        int[] atHead = new int[stopCount + 2];
        int[] ofHead = new int[busCount + 2];
        for (int i = 0; i < pairs.length; i++) {
            ofHead[(int) pairs[i][0] + 1]++;
            atHead[(int) pairs[i][1] + 1]++;
        }
        for (int v = 1; v <= stopCount; v++) atHead[v + 1] += atHead[v];
        for (int b = 1; b <= busCount; b++) ofHead[b + 1] += ofHead[b];
        int[] atList = new int[pairs.length];
        int[] ofList = new int[pairs.length];
        int[] atFill = new int[stopCount + 2];
        int[] ofFill = new int[busCount + 2];
        for (int i = 0; i < pairs.length; i++) {
            int b = (int) pairs[i][0], x = (int) pairs[i][1];
            atList[atHead[x] + atFill[x]] = b;
            atFill[x]++;
            ofList[ofHead[b] + ofFill[b]] = x;
            ofFill[b]++;
        }
        long answer = -1;
        if (source == target) {
            answer = 0;
        } else {
            boolean[] seenBus = new boolean[busCount + 1];
            boolean[] seenStop = new boolean[stopCount + 1];
            seenStop[source] = true;
            int[] layer = new int[stopCount + 1];
            int[] next = new int[stopCount + 1];
            int layerSize = 0;
            layer[layerSize++] = source;
            long rides = 0;
            while (layerSize > 0 && answer < 0) {
                rides++;
                int nextSize = 0;
                for (int i = 0; i < layerSize; i++) {
                    int x = layer[i];
                    for (int k = atHead[x]; k < atHead[x + 1]; k++) {
                        int b = atList[k];
                        if (seenBus[b]) continue;
                        seenBus[b] = true;
                        for (int j = ofHead[b]; j < ofHead[b + 1]; j++) {
                            int y = ofList[j];
                            if (y == target) answer = rides;
                            if (!seenStop[y]) {
                                seenStop[y] = true;
                                next[nextSize++] = y;
                            }
                        }
                    }
                }
                int[] swap = layer;
                layer = next;
                next = swap;
                layerSize = nextSize;
            }
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['A breadth-first search in layers of rides over the bipartite graph of stops and buses: every stop of the current layer boards every unused bus that serves it, and every stop of that bus joins the next layer. Each bus and each stop is handled once; the layer in which the target appears is the answer (0 if the start is the target, -1 if the layers run out).'], complexity: 'Time O(n + r + m), space O(n + r + m).' },
    solve(input) {
      const rs = rows(input); const [n, r0, m] = nums(rs[0]); const [s, t] = nums(rs[1]); if (s === t) return '0';
      const at = Array.from({ length: n + 1 }, () => []), of = Array.from({ length: r0 + 1 }, () => []); for (let i = 0; i < m; i++) { const [b, x] = nums(rs[2 + i]); at[x].push(b); of[b].push(x); }
      const busUsed = new Array(r0 + 1).fill(false); const dist = new Array(n + 1).fill(-1); dist[s] = 0; const queue = [s];
      for (let h = 0; h < queue.length; h++) { const x = queue[h]; for (const b of at[x]) { if (busUsed[b]) continue; busUsed[b] = true; for (const y of of[b]) if (dist[y] < 0) { dist[y] = dist[x] + 1; queue.push(y); } } }
      return String(dist[t]);
    },
    tests() {
      const g = rng(1104); const out = ['7 2 6\n1 6\n1 1\n1 2\n1 7\n2 3\n2 6\n2 7\n', '3 1 2\n1 3\n1 1\n1 2\n', '5 2 4\n2 2\n1 1\n1 2\n2 3\n2 4\n', '4 1 1\n1 4\n1 4\n'];
      const make = (n, buses, s, t) => { const pairs = []; buses.forEach((stops, i) => stops.forEach((x) => pairs.push([i + 1, x]))); return `${n} ${buses.length} ${pairs.length}\n${s} ${t}\n${shuffle(g, pairs).map((p) => p.join(' ')).join('\n')}\n`; };
      const randomBuses = (n, r0, lo, hi) => many(r0, () => { const k = randInt(g, lo, hi); const set = new Set(); while (set.size < Math.min(k, n)) set.add(randInt(g, 1, n)); return [...set]; });
      const brute = (input) => { // Bellman-Ford over the number of rides
        const rs = rows(input); const [n, , m] = nums(rs[0]); const [s, t] = nums(rs[1]); const pairs = many(m, (i) => nums(rs[2 + i])); const INF = 1e9; const dist = new Array(n + 1).fill(INF); dist[s] = 0; let changed = true;
        const byBus = new Map(); for (const [b, x] of pairs) { if (!byBus.has(b)) byBus.set(b, []); byBus.get(b).push(x); }
        while (changed) { changed = false; for (const stops of byBus.values()) { const best = Math.min(...stops.map((x) => dist[x])); if (best >= INF) continue; for (const x of stops) if (best + 1 < dist[x] && x !== s) { dist[x] = best + 1; changed = true; } } }
        return String(dist[t] >= INF ? -1 : dist[t]);
      };
      crossCheck(() => { const n = randInt(g, 1, 9), r0 = randInt(g, 1, 6); const buses = randomBuses(n, r0, 0, 4); if (buses.every((b) => !b.length)) buses[0] = [1]; return make(n, buses, randInt(g, 1, n), randInt(g, 1, n)); }, (i) => this.solve(i), brute, 300);
      out.push(make(10, randomBuses(10, 3, 2, 4), 1, 10), make(30, randomBuses(30, 8, 2, 6), 1, 30), make(100, randomBuses(100, 20, 3, 8), 5, 77));
      out.push(make(20000, randomBuses(20000, 2000, 10, 14), 1, 20000), make(20000, randomBuses(20000, 2000, 10, 14), 1, 20000), make(5000, randomBuses(5000, 2000, 10, 15), 17, 4000), make(500, randomBuses(500, 2000, 10, 15), 17, 400), make(200, randomBuses(200, 2000, 14, 15), 3, 100), make(20000, randomBuses(20000, 1500, 15, 20), 12345, 7));
      // a chain of buses (bus i shares one stop with bus i + 1): the answer is the number of buses
      const R = 1300; const chain = many(R, (i) => many(15, (j) => i * 14 + j + 1)); const N = 14 * R + 1; out.push(make(N, chain, 1, N), make(N, chain.slice().reverse(), N, 1), make(N, chain, 1, 14 * 650 + 8), make(N, chain, 5, 5), make(N, chain, 3, 14 * 1299 + 10));
      // a chain that is cut in the middle, and a target that no bus serves
      const cut = chain.map((stops, i) => (i === 650 ? stops.slice(0, 7) : stops)); out.push(make(N, cut, 1, N), make(20000, chain, 1, 20000));
      // one bus that serves very many stops and a few small buses
      out.push(make(15000, [many(15000, (i) => i + 1), ...many(299, () => [randInt(g, 1, 15000), randInt(g, 1, 15000)].filter((x, i, a) => a.indexOf(x) === i))], 1, 15000), make(15000, [many(14000, (i) => i + 1), [14000, 14001], ...many(298, () => [randInt(g, 1, 3000)])], 1, 14001));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: EDGE_INPUT,
    constraints: ['2 <= n <= 1000', '1 <= m <= 3000', 'There are no self-loops and no repeated edges.'],
    slug: 'edge-disjoint-paths',
    title: 'How Many Roads Can Be Used Without Sharing One',
    tags: ['graph', 'max-flow', 'augmenting-path', 'menger'],
    concept: {
      title: 'Unit capacities and augmenting paths: the number of augmentations is the answer',
      body: [
        'Two towns, 1 and `n`, are joined by a network of roads (each road joins two nodes and can be used by **one** route). How many routes can you plan from 1 to `n` such that **no road is used by two routes**? (The routes may pass through the same towns, only the roads must differ.) This is a maximum flow problem in which every road has capacity 1, and the flow value is the number of routes.',
        'The *augmenting path* method needs no capacity table. Keep, for every road, two arcs that are each other\'s reverse, with capacity 1 in both directions. Repeat: find any path from 1 to `n` that uses only arcs with remaining capacity (a BFS does this); push one unit along it (decrease the capacity of every arc of the path and **increase the capacity of its reverse arc**, which allows a later path to undo this choice); count one more route. Stop when no path is left.',
        { code: 'flow = 0\nwhile True:\n    via = bfs_from_1_using_arcs_with_capacity()     # via[v] = arc by which v was reached\n    if n not reached: break\n    v = n\n    while v != 1:\n        e = via[v]\n        cap[e] -= 1\n        cap[e ^ 1] += 1                           # the reverse arc may now cancel this arc\n        v = to[e ^ 1]\n    flow += 1' },
        'Each augmentation raises the flow by one and costs O(n + m), and the flow cannot exceed the number of roads at node 1, so the time is O(flow * (n + m)). By *Menger\'s theorem* the answer is also the smallest number of roads whose removal separates 1 from `n`: if you can find that many roads that cut the network, no more routes exist. A network where 1 and `n` are not connected gives 0.'
      ]
    },
    statement: ['A road network has `n` nodes and `m` undirected roads. Print the largest number of routes from the node 1 to the node `n` such that no road belongs to two different routes (routes may share nodes).'],
    outputFormat: ['Print the largest number of routes.'],
    examples: [{ input: '4 5\n1 2\n1 3\n2 3\n2 4\n3 4\n', note: 'The routes 1-2-4 and 1-3-4 share no road: 2 (the node 1 has only two roads).' }, { input: '4 3\n1 2\n2 3\n3 4\n', note: 'A single line of roads: 1.' }],
    hints: ['Give every road two arcs of capacity 1 that are the reverse of each other.', 'Repeat: find a path with BFS over arcs that still have capacity, push one unit along it and raise the capacity of the reverse arcs.', 'The number of repetitions is the answer.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: r`
        to = []
        cap = []
        graph = [[] for _ in range(n + 1)]
        for u, v in edges:
            graph[u].append(len(to))
            to.append(v)
            cap.append(1)
            graph[v].append(len(to))
            to.append(u)
            cap.append(1)
        flow = 0
        while True:
            via = [-1] * (n + 1)
            seen = [False] * (n + 1)
            seen[1] = True
            queue = [1]
            for x in queue:
                if seen[n]:
                    break
                for e in graph[x]:
                    y = to[e]
                    if cap[e] > 0 and not seen[y]:
                        seen[y] = True
                        via[y] = e
                        queue.append(y)
            if not seen[n]:
                break
            y = n
            while y != 1:
                e = via[y]
                cap[e] -= 1
                cap[e ^ 1] += 1
                y = to[e ^ 1]
            flow += 1
        print(flow)`,
      cpp: r`
        vector<int> to, cap;
        vector<vector<int>> graph(n + 1);
        for (const vector<long long>& e : edges) {
            graph[e[0]].push_back((int)to.size());
            to.push_back((int)e[1]);
            cap.push_back(1);
            graph[e[1]].push_back((int)to.size());
            to.push_back((int)e[0]);
            cap.push_back(1);
        }
        long long flow = 0;
        for (;;) {
            vector<int> via(n + 1, -1);
            vector<char> seen(n + 1, 0);
            seen[1] = 1;
            vector<int> queue = {1};
            for (size_t i = 0; i < queue.size() && !seen[n]; i++) {
                int x = queue[i];
                for (int e : graph[x]) {
                    int y = to[e];
                    if (cap[e] > 0 && !seen[y]) {
                        seen[y] = 1;
                        via[y] = e;
                        queue.push_back(y);
                    }
                }
            }
            if (!seen[n]) break;
            int y = (int)n;
            while (y != 1) {
                int e = via[y];
                cap[e]--;
                cap[e ^ 1]++;
                y = to[e ^ 1];
            }
            flow++;
        }
        cout << flow << "\n";`,
      java: r`
        int nodes = (int) n;
        int[] to = new int[2 * edges.length];
        int[] cap = new int[2 * edges.length];
        int[] gHead = new int[nodes + 2];
        for (int i = 0; i < edges.length; i++) {
            gHead[(int) edges[i][0] + 1]++;
            gHead[(int) edges[i][1] + 1]++;
        }
        for (int v = 1; v <= nodes; v++) gHead[v + 1] += gHead[v];
        int[] gSlot = new int[2 * edges.length];
        int[] gFill = new int[nodes + 2];
        for (int i = 0; i < edges.length; i++) {
            int a = (int) edges[i][0], b = (int) edges[i][1];
            to[2 * i] = b;
            cap[2 * i] = 1;
            to[2 * i + 1] = a;
            cap[2 * i + 1] = 1;
            gSlot[gHead[a] + gFill[a]] = 2 * i;
            gFill[a]++;
            gSlot[gHead[b] + gFill[b]] = 2 * i + 1;
            gFill[b]++;
        }
        long flow = 0;
        int[] via = new int[nodes + 1];
        boolean[] seen = new boolean[nodes + 1];
        int[] queue = new int[nodes + 1];
        for (;;) {
            Arrays.fill(via, -1);
            Arrays.fill(seen, false);
            seen[1] = true;
            int qh = 0, qt = 0;
            queue[qt++] = 1;
            while (qh < qt && !seen[nodes]) {
                int x = queue[qh++];
                for (int k = gHead[x]; k < gHead[x + 1]; k++) {
                    int e = gSlot[k];
                    int y = to[e];
                    if (cap[e] > 0 && !seen[y]) {
                        seen[y] = true;
                        via[y] = e;
                        queue[qt++] = y;
                    }
                }
            }
            if (!seen[nodes]) break;
            int y = nodes;
            while (y != 1) {
                int e = via[y];
                cap[e]--;
                cap[e ^ 1]++;
                y = to[e ^ 1];
            }
            flow++;
        }
        System.out.println(flow);`
    },
    solution: { explanation: ['Every road becomes two arcs of capacity 1 that are the reverse of each other. A BFS repeatedly finds a path of arcs with remaining capacity from 1 to n; one unit is pushed along it (the capacity drops on the path and rises on the reverse arcs) and the counter grows. When no path is left, the counter is the largest number of roads-disjoint routes.'], complexity: 'Time O(F * (n + m)) where F is the answer (at most the number of roads at node 1), space O(n + m).' },
    solve(input) {
      const { n, edges } = parseEdges(input); // Dinic's algorithm (levels and blocking flows), a different method from the augmenting paths of the solutions
      const to = [], cap = [], graph = Array.from({ length: n + 1 }, () => []); for (const [u, v] of edges) { graph[u].push(to.length); to.push(v); cap.push(1); graph[v].push(to.length); to.push(u); cap.push(1); }
      let flow = 0; for (;;) {
        const level = new Array(n + 1).fill(-1); level[1] = 0; const q = [1]; for (let h = 0; h < q.length; h++) for (const e of graph[q[h]]) if (cap[e] > 0 && level[to[e]] < 0) { level[to[e]] = level[q[h]] + 1; q.push(to[e]); }
        if (level[n] < 0) break; const it = new Array(n + 1).fill(0);
        const dfs = (v) => { if (v === n) return true; for (; it[v] < graph[v].length; it[v]++) { const e = graph[v][it[v]]; if (cap[e] > 0 && level[to[e]] === level[v] + 1 && dfs(to[e])) { cap[e]--; cap[e ^ 1]++; return true; } } return false; };
        while (dfs(1)) flow++;
      }
      return String(flow);
    },
    tests() {
      const g = rng(1105); const out = ['4 5\n1 2\n1 3\n2 3\n2 4\n3 4\n', '4 3\n1 2\n2 3\n3 4\n', '3 1\n1 2\n', '2 1\n1 2\n', '5 6\n1 2\n1 3\n1 4\n2 5\n3 5\n4 5\n'];
      const minCut = (input) => { const { n, edges } = parseEdges(input); const m = edges.length; let best = Infinity; for (let mask = 0; mask < (1 << m); mask++) { let count = 0; for (let i = 0; i < m; i++) if (mask >> i & 1) count++; if (count >= best) continue; const adj = Array.from({ length: n + 1 }, () => []); edges.forEach(([u, v], i) => { if (!(mask >> i & 1)) { adj[u].push(v); adj[v].push(u); } }); const seen = new Array(n + 1).fill(false); seen[1] = true; const st = [1]; while (st.length) { const x = st.pop(); for (const y of adj[x]) if (!seen[y]) { seen[y] = true; st.push(y); } } if (!seen[n]) best = count; } return String(best); };
      crossCheck(() => { const n = randInt(g, 2, 7); return graphText(n, mix(g, randomEdges(g, n, randInt(g, 1, Math.min(11, n * (n - 1) / 2))))); }, (i) => this.solve(i), minCut, 300);
      const E = (n, m) => graphText(n, mix(g, randomEdges(g, n, m)));
      for (const [n, m] of [[10, 20], [30, 80], [60, 200], [100, 300], [200, 700], [500, 1500], [1000, 3000], [1000, 2000], [1000, 1200], [300, 3000], [80, 3000]]) out.push(E(n, m));
      // a complete graph, a lattice (the corners have two roads), and parallel routes of different length
      const complete = []; for (let a = 1; a <= 70; a++) for (let b = a + 1; b <= 70; b++) complete.push([a, b]); out.push(graphText(70, mix(g, complete)));
      const lattice = []; const R = 30, C = 33; for (let x = 0; x < R; x++) for (let y = 0; y < C; y++) { const id = x * C + y + 1; if (y + 1 < C) lattice.push([id, id + 1]); if (x + 1 < R) lattice.push([id, id + C]); } out.push(graphText(R * C, mix(g, lattice)));
      const parallel = []; let next = 2; const last = 1000; for (let p = 0; p < 150; p++) { const len = randInt(g, 1, 5); let prev = 1; for (let i = 0; i < len && next < last; i++) { parallel.push([prev, next]); prev = next++; } if (prev === 1) continue; parallel.push([prev, last]); } out.push(graphText(last, shuffle(g, parallel)));
      // two dense clusters joined by a few roads, a star with all leaves joined to the last node, and a graph where 1 and n are not connected
      const left = []; const right = []; for (let i = 0; i < 300; i++) { left.push([randInt(g, 1, 100), randInt(g, 1, 100)]); right.push([100 + randInt(g, 1, 100), 100 + randInt(g, 1, 100)]); }
      const clean = (list) => { const seen = new Set(); return list.filter(([a, b]) => { const key = a < b ? `${a},${b}` : `${b},${a}`; if (a === b || seen.has(key)) return false; seen.add(key); return true; }); };
      out.push(graphText(200, mix(g, [...clean(left), ...clean(right), [3, 150], [40, 160], [77, 199], [10, 120]].filter((e, i, a) => a.findIndex((f) => (f[0] === e[0] && f[1] === e[1]) || (f[0] === e[1] && f[1] === e[0])) === i))));
      const star = []; for (let v = 2; v < 700; v++) { star.push([1, v], [v, 700]); } out.push(graphText(700, mix(g, star)));
      out.push(graphText(1000, mix(g, [...clean(left), ...clean(right)].concat(many(300, (i) => [201 + i, 202 + i])))));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`: the number of men and the number of women.', 'The next `n` lines describe the men: line `i` lists all the women (numbers 1 to n) in the order in which the man `i` likes them, best first.', 'The next `n` lines describe the women: line `j` lists all the men in the order in which the woman `j` likes them, best first.'],
    constraints: ['1 <= n <= 200', 'Every line is a permutation of the numbers 1 to n.'],
    slug: 'stable-matching',
    title: 'Pair Everyone So That Nobody Wants to Elope',
    tags: ['graph', 'bipartite', 'matching', 'greedy', 'gale-shapley'],
    concept: {
      title: 'Proposals and engagements: the Gale-Shapley algorithm',
      body: [
        'There are `n` men and `n` women, and everybody ranks all the people of the other group. A pairing is **stable** if there is no man and woman who are not together but both prefer each other to their own partners (such a pair would elope). It is a surprising fact that a stable pairing **always exists**, and a simple procedure finds one. Several stable pairings can exist; the procedure below finds the one that is best for the men, which is unique, so it is a good thing to print.',
        'The *Gale-Shapley algorithm* is a sequence of proposals. While a man is free, he proposes to the best woman on his list **to whom he has not yet proposed**. A free woman accepts. A woman who is engaged compares the new man with her fiance and keeps the one she likes more; the other becomes free again. Nobody ever proposes twice to the same woman, so there are at most `n * n` proposals.',
        { code: 'rank[w][m] = position of man m in the list of woman w\nnxt = [0] * (n + 1)                  # the next woman on the list of each man\nfree = all men\nwhile free:\n    m = free.pop()\n    w = men[m][nxt[m]]; nxt[m] += 1\n    if partner[w] is None:               partner[w] = m\n    elif rank[w][m] < rank[w][partner[w]]:\n        free.append(partner[w]); partner[w] = m\n    else:                                 free.append(m)' },
        'Why does it end with everybody engaged and nobody eloping? A woman\'s partner only gets better over time, and a man only moves down his list. If a man `m` and a woman `w` preferred each other, then `m` must have proposed to `w` before (she is higher on his list than his final partner), and `w` rejected him or dropped him for someone she likes more, so her final partner is better than `m` in her eyes. The order in which free men are picked does not change the result. Print, for every man, the woman he ends up with.'
      ]
    },
    statement: ['There are `n` men and `n` women, numbered 1 to n, and everybody has a strict ranking of all the people of the other group. A pairing of every man with a different woman is stable if there is no man and woman, not paired with each other, who both prefer the other to their own partner. Among all stable pairings print the one that is best for the men (every man gets the best woman he can get in any stable pairing; this pairing is unique).'],
    outputFormat: ['Print `n` numbers on one line: for each man from 1 to n, the woman he is paired with.'],
    examples: [{ input: '2\n1 2\n2 1\n2 1\n1 2\n', note: 'Each man gets his first choice (the man 1 the woman 1, the man 2 the woman 2), so no man wants to leave, and the pairing is stable: 1 2.' }, { input: '2\n1 2\n1 2\n2 1\n2 1\n', note: 'Both men want the woman 1, and she prefers the man 2: he gets her, and the man 1 gets the woman 2: 2 1.' }],
    hints: ['A free man proposes to the next woman on his list; he never proposes to the same woman twice.', 'A woman keeps the man she prefers, using a table of her ranking of each man.', 'Repeat until no man is free, then print the partner of every man.'],
    program: {
      io: ['n:int', 'men:int[n][n]', 'women:int[n][n]'],
      fast: true,
      python: r`
        rank = [[0] * (n + 1) for _ in range(n + 1)]
        for w in range(1, n + 1):
            for position, m in enumerate(women[w - 1]):
                rank[w][m] = position
        nxt = [0] * (n + 1)
        partner = [0] * (n + 1)
        free = list(range(n, 0, -1))
        while free:
            m = free.pop()
            w = men[m - 1][nxt[m]]
            nxt[m] += 1
            if partner[w] == 0:
                partner[w] = m
            elif rank[w][m] < rank[w][partner[w]]:
                free.append(partner[w])
                partner[w] = m
            else:
                free.append(m)
        wife = [0] * (n + 1)
        for w in range(1, n + 1):
            wife[partner[w]] = w
        print(*wife[1:])`,
      cpp: r`
        vector<vector<int>> rank(n + 1, vector<int>(n + 1, 0));
        for (int w = 1; w <= n; w++) {
            for (int position = 0; position < n; position++) rank[w][women[w - 1][position]] = position;
        }
        vector<int> nxt(n + 1, 0), partner(n + 1, 0), freeMen;
        for (int m = (int)n; m >= 1; m--) freeMen.push_back(m);
        while (!freeMen.empty()) {
            int m = freeMen.back();
            freeMen.pop_back();
            int w = (int)men[m - 1][nxt[m]];
            nxt[m]++;
            if (partner[w] == 0) {
                partner[w] = m;
            } else if (rank[w][m] < rank[w][partner[w]]) {
                freeMen.push_back(partner[w]);
                partner[w] = m;
            } else {
                freeMen.push_back(m);
            }
        }
        vector<int> wife(n + 1, 0);
        for (int w = 1; w <= n; w++) wife[partner[w]] = w;
        for (int m = 1; m <= n; m++) cout << (m > 1 ? " " : "") << wife[m];
        cout << "\n";`,
      java: r`
        int count = (int) n;
        int[][] rank = new int[count + 1][count + 1];
        for (int w = 1; w <= count; w++) {
            for (int position = 0; position < count; position++) rank[w][(int) women[w - 1][position]] = position;
        }
        int[] nxt = new int[count + 1];
        int[] partner = new int[count + 1];
        int[] freeMen = new int[count * count + 2];
        int top = 0;
        for (int m = count; m >= 1; m--) freeMen[top++] = m;
        while (top > 0) {
            int m = freeMen[--top];
            int w = (int) men[m - 1][nxt[m]];
            nxt[m]++;
            if (partner[w] == 0) {
                partner[w] = m;
            } else if (rank[w][m] < rank[w][partner[w]]) {
                freeMen[top++] = partner[w];
                partner[w] = m;
            } else {
                freeMen[top++] = m;
            }
        }
        int[] wife = new int[count + 1];
        for (int w = 1; w <= count; w++) wife[partner[w]] = w;
        StringBuilder out = new StringBuilder();
        for (int m = 1; m <= count; m++) out.append(m > 1 ? " " : "").append(wife[m]);
        System.out.println(out);`
    },
    solution: { explanation: ['Free men propose in the order of their lists; a woman keeps the better of her fiance and the new proposer, and the loser becomes free again. Nobody proposes twice to the same woman, so there are at most n * n proposals; the result is the pairing that is best for the men.'], complexity: 'Time O(n^2), space O(n^2).' },
    solve(input) {
      const w = words(input).map(Number); const n = w[0]; let at = 1; const men = [], women = []; for (let i = 0; i < n; i++) { men.push(w.slice(at, at + n)); at += n; } for (let i = 0; i < n; i++) { women.push(w.slice(at, at + n)); at += n; }
      const rank = women.map((list) => { const r0 = new Array(n + 1).fill(0); list.forEach((m, p) => { r0[m] = p; }); return r0; });
      // the same idea in rounds: all free men propose at once, and every woman keeps the best of her fiance and the new proposers
      const nxt = new Array(n + 1).fill(0); const partner = new Array(n + 1).fill(0); let free = Array.from({ length: n }, (_, i) => i + 1);
      while (free.length) { const proposals = new Map(); for (const m of free) { const wo = men[m - 1][nxt[m]++]; if (!proposals.has(wo)) proposals.set(wo, []); proposals.get(wo).push(m); } const again = []; for (const [wo, list] of proposals) { let best = partner[wo]; for (const m of list) { if (best === 0 || rank[wo - 1][m] < rank[wo - 1][best]) { if (best !== 0) again.push(best); best = m; } else again.push(m); } partner[wo] = best; } free = again; }
      const wife = new Array(n + 1).fill(0); for (let wo = 1; wo <= n; wo++) wife[partner[wo]] = wo; return wife.slice(1).join(' ');
    },
    tests() {
      const g = rng(1106); const out = ['2\n1 2\n2 1\n2 1\n1 2\n', '2\n1 2\n1 2\n2 1\n2 1\n', '1\n1\n1\n'];
      const perm = (n) => shuffle(g, many(n, (i) => i + 1)); const randomLists = (n) => many(n, () => perm(n));
      const text = (men, women) => `${men.length}\n${men.map((l) => l.join(' ')).join('\n')}\n${women.map((l) => l.join(' ')).join('\n')}\n`;
      const brute = (input) => { // all pairings, keep the stable ones, take the one with the smallest sum of the men's ranks
        const w = words(input).map(Number); const n = w[0]; let at = 1; const men = [], women = []; for (let i = 0; i < n; i++) { men.push(w.slice(at, at + n)); at += n; } for (let i = 0; i < n; i++) { women.push(w.slice(at, at + n)); at += n; }
        const rankM = men.map((l) => { const r0 = {}; l.forEach((x, p) => { r0[x] = p; }); return r0; }); const rankW = women.map((l) => { const r0 = {}; l.forEach((x, p) => { r0[x] = p; }); return r0; });
        let best = null, bestSum = Infinity; const used = new Array(n + 1).fill(false); const wife = new Array(n).fill(0);
        const go = (m) => { if (m === n) { const husband = new Array(n + 1).fill(0); for (let i = 0; i < n; i++) husband[wife[i]] = i + 1; for (let a = 0; a < n; a++) for (let b = 1; b <= n; b++) { if (wife[a] === b) continue; if (rankM[a][b] < rankM[a][wife[a]] && rankW[b - 1][a + 1] < rankW[b - 1][husband[b]]) return; } const sum = wife.reduce((acc, x, i) => acc + rankM[i][x], 0); if (sum < bestSum) { bestSum = sum; best = wife.slice(); } return; } for (let x = 1; x <= n; x++) if (!used[x]) { used[x] = true; wife[m] = x; go(m + 1); used[x] = false; } };
        go(0); return best.join(' ');
      };
      crossCheck(() => { const n = randInt(g, 1, 6); return text(randomLists(n), randomLists(n)); }, (i) => this.solve(i), brute, 300);
      for (const n of [3, 5, 10, 20, 40, 80, 120, 160, 200, 200, 200]) out.push(text(randomLists(n), randomLists(n)));
      const same = (n) => many(n, () => many(n, (i) => i + 1)); const rot = (n) => many(n, (i) => many(n, (j) => ((i + j) % n) + 1));
      out.push(text(same(200), same(200)), text(same(200), many(200, () => many(200, (i) => 200 - i))), text(rot(200), same(200)), text(same(200), rot(200)), text(rot(200), rot(200)), text(rot(150), many(150, (i) => many(150, (j) => ((i - j + 150) % 150) + 1))));
      // the men agree on the order of the women and the women agree on the order of the men: the proposals pile up
      out.push(text(same(180), many(180, () => many(180, (i) => 180 - i))), text(many(100, () => many(100, (i) => 100 - i)), same(100)));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: EDGE_INPUT,
    constraints: ['3 <= n <= 600', '1 <= m <= 1500', 'There are no self-loops and no repeated edges.'],
    slug: 'shortest-cycle',
    title: 'The Length of the Shortest Cycle',
    tags: ['graph', 'bfs', 'girth', 'cycle'],
    concept: {
      title: 'A BFS from every node meets itself again along the shortest cycle',
      body: [
        'A cycle is a closed walk that goes along different edges and never visits a node twice. Print the length (the number of edges) of the **shortest** cycle in an undirected graph, or -1 if the graph has no cycle at all (it is a forest). This length is called the *girth*. A single DFS does not give it, because it can find a long cycle before a short one.',
        'Run a **BFS from every node** `s`. During the BFS from `s`, whenever you look at an edge `u - v` where `v` is already visited and `v` is **not the parent** of `u` in the search tree, the two paths from `s` to `u` and from `s` to `v` together with this edge contain a cycle; its length is at most `dist[u] + dist[v] + 1`. Take the smallest value over all edges and all starting nodes.',
        { code: 'best = INF\nfor s in range(1, n + 1):\n    dist = [-1] * (n + 1); parent = [0] * (n + 1)\n    dist[s] = 0; queue = [s]\n    for u in queue:\n        for v in adj[u]:\n            if dist[v] < 0:\n                dist[v] = dist[u] + 1; parent[v] = u; queue.append(v)\n            elif v != parent[u]:\n                best = min(best, dist[u] + dist[v] + 1)\nprint(best if best < INF else -1)' },
        'Why is the minimum exactly right? Every value found is the length of a closed walk that contains a cycle, so it is **at least** the girth. For the starting node `s` on a shortest cycle, the BFS finds the cycle itself with equality: the two sides of the cycle reach the farthest node from `s` through different parents. The total time is O(n * (n + m)), fine for a few hundred nodes.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. Print the number of edges of its shortest cycle, or -1 if the graph has no cycle.'],
    outputFormat: ['Print the length of the shortest cycle, or -1.'],
    examples: [{ input: '5 6\n1 2\n2 3\n3 1\n3 4\n4 5\n5 3\n', note: 'There are two triangles (1 2 3 and 3 4 5): 3.' }, { input: '4 3\n1 2\n2 3\n3 4\n', note: 'A path has no cycle: -1.' }],
    hints: ['Start a BFS from every node and keep distances and parents.', 'An edge to a visited node that is not the parent closes a cycle of length at most dist[u] + dist[v] + 1.', 'Take the minimum over everything; print -1 if nothing was found.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: r`
        adj = [[] for _ in range(n + 1)]
        for u, v in edges:
            adj[u].append(v)
            adj[v].append(u)
        INF = 10 ** 9
        best = INF
        for s in range(1, n + 1):
            dist = [-1] * (n + 1)
            parent = [0] * (n + 1)
            dist[s] = 0
            queue = [s]
            for u in queue:
                if 2 * dist[u] + 1 >= best:
                    break
                for v in adj[u]:
                    if dist[v] < 0:
                        dist[v] = dist[u] + 1
                        parent[v] = u
                        queue.append(v)
                    elif v != parent[u]:
                        best = min(best, dist[u] + dist[v] + 1)
        print(best if best < INF else -1)`,
      cpp: r`
        vector<vector<int>> adj(n + 1);
        for (const vector<long long>& e : edges) {
            adj[e[0]].push_back((int)e[1]);
            adj[e[1]].push_back((int)e[0]);
        }
        const int INF = 1000000000;
        int best = INF;
        for (int s = 1; s <= n; s++) {
            vector<int> dist(n + 1, -1), parent(n + 1, 0);
            dist[s] = 0;
            vector<int> queue = {s};
            for (size_t i = 0; i < queue.size(); i++) {
                int u = queue[i];
                if (2 * dist[u] + 1 >= best) break;
                for (int v : adj[u]) {
                    if (dist[v] < 0) {
                        dist[v] = dist[u] + 1;
                        parent[v] = u;
                        queue.push_back(v);
                    } else if (v != parent[u]) {
                        best = min(best, dist[u] + dist[v] + 1);
                    }
                }
            }
        }
        cout << (best < INF ? best : -1) << "\n";`,
      java: r`
        int nodes = (int) n;
        int[] head = new int[nodes + 2];
        for (int i = 0; i < edges.length; i++) {
            head[(int) edges[i][0] + 1]++;
            head[(int) edges[i][1] + 1]++;
        }
        for (int v = 1; v <= nodes; v++) head[v + 1] += head[v];
        int[] to = new int[2 * edges.length];
        int[] fill = new int[nodes + 2];
        for (int i = 0; i < edges.length; i++) {
            int a = (int) edges[i][0], b = (int) edges[i][1];
            to[head[a] + fill[a]] = b;
            fill[a]++;
            to[head[b] + fill[b]] = a;
            fill[b]++;
        }
        final int INF = 1000000000;
        int best = INF;
        int[] dist = new int[nodes + 1];
        int[] parent = new int[nodes + 1];
        int[] queue = new int[nodes + 1];
        for (int s = 1; s <= nodes; s++) {
            Arrays.fill(dist, -1);
            dist[s] = 0;
            parent[s] = 0;
            int qh = 0, qt = 0;
            queue[qt++] = s;
            while (qh < qt) {
                int u = queue[qh++];
                if (2 * dist[u] + 1 >= best) break;
                for (int k = head[u]; k < head[u + 1]; k++) {
                    int v = to[k];
                    if (dist[v] < 0) {
                        dist[v] = dist[u] + 1;
                        parent[v] = u;
                        queue[qt++] = v;
                    } else if (v != parent[u]) {
                        best = Math.min(best, dist[u] + dist[v] + 1);
                    }
                }
            }
        }
        System.out.println(best < INF ? best : -1);`
    },
    solution: { explanation: ['A BFS runs from every node with distances and parents; an edge to an already visited node that is not the parent gives a closed walk of length at most dist[u] + dist[v] + 1 that contains a cycle, and the smallest such value over all sources is the girth (the search from a node on a shortest cycle finds it exactly). A graph without such an edge has no cycle: -1.'], complexity: 'Time O(n * (n + m)), space O(n + m).' },
    solve(input) {
      const { n, edges } = parseEdges(input); // remove each edge in turn and measure the distance between its ends
      const adj = Array.from({ length: n + 1 }, () => []); edges.forEach(([u, v], i) => { adj[u].push([v, i]); adj[v].push([u, i]); });
      let best = Infinity; edges.forEach(([u, v], skip) => { const dist = new Array(n + 1).fill(-1); dist[u] = 0; const q = [u]; for (let h = 0; h < q.length && dist[v] < 0; h++) { const x = q[h]; if (dist[x] + 2 > best) break; for (const [y, id] of adj[x]) if (id !== skip && dist[y] < 0) { dist[y] = dist[x] + 1; q.push(y); } } if (dist[v] >= 0) best = Math.min(best, dist[v] + 1); });
      return String(best === Infinity ? -1 : best);
    },
    tests() {
      const g = rng(1107); const out = ['5 6\n1 2\n2 3\n3 1\n3 4\n4 5\n5 3\n', '4 3\n1 2\n2 3\n3 4\n', '3 3\n1 2\n2 3\n3 1\n', '4 4\n1 2\n2 3\n3 4\n4 1\n'];
      const brute = (input) => { // a depth-first search over simple paths from every start (tiny graphs only)
        const { n, edges } = parseEdges(input); const adj = Array.from({ length: n + 1 }, () => []); for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); } let best = Infinity;
        for (let s = 1; s <= n; s++) { const visited = new Array(n + 1).fill(false); visited[s] = true; const go = (v, len, prev) => { for (const w of adj[v]) { if (w === s && prev !== s && len >= 2) best = Math.min(best, len + 1); else if (!visited[w] && len + 1 < best) { visited[w] = true; go(w, len + 1, v); visited[w] = false; } } }; go(s, 0, 0); }
        return String(best === Infinity ? -1 : best);
      };
      crossCheck(() => { const n = randInt(g, 3, 9); return graphText(n, mix(g, randomEdges(g, n, randInt(g, 1, Math.min(13, n * (n - 1) / 2))))); }, (i) => this.solve(i), brute, 300);
      const E = (n, m) => graphText(n, mix(g, randomEdges(g, n, m)));
      for (const [n, m] of [[10, 12], [30, 35], [60, 80], [100, 120], [200, 250], [400, 500], [600, 700], [600, 1000], [600, 1500], [300, 1500], [100, 1500]]) out.push(E(n, m));
      // forests and graphs with a long girth: a cycle with trees hanging from it, a cycle alone, two cycles, a big grid-like ladder
      out.push(graphText(600, mix(g, randomTreeEdges(g, 600))), graphText(600, mix(g, randomTreeEdges(g, 600, 'path'))), '3 1\n1 2\n');
      const ring = (len, total) => { const e = many(len, (i) => [i + 1, (i + 1) % len + 1]); for (let v = len + 1; v <= total; v++) e.push([randInt(g, 1, v - 1), v]); return e; };
      out.push(graphText(600, mix(g, ring(600, 600))), graphText(600, mix(g, ring(300, 600))), graphText(600, mix(g, ring(37, 600))), graphText(600, mix(g, ring(5, 600))), graphText(600, mix(g, ring(3, 600))));
      const ladder = []; for (let i = 1; i < 300; i++) ladder.push([i, i + 1], [300 + i, 300 + i + 1]); for (let i = 1; i <= 300; i++) ladder.push([i, 300 + i]); out.push(graphText(600, mix(g, ladder)));
      // a graph with no triangles and no squares: the long cycle 1..K plus chords that make cycles of length 7 or more
      const withChords = ring(120, 120); for (let i = 1; i <= 60; i++) withChords.push([i, i + 7 + (i % 3)]); const cleanSet = new Set(); const chordGraph = withChords.filter(([a, b]) => { const key = a < b ? `${a},${b}` : `${b},${a}`; if (a === b || cleanSet.has(key)) return false; cleanSet.add(key); return true; }); out.push(graphText(120, mix(g, chordGraph)));
      const petersen = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 1], [1, 6], [2, 7], [3, 8], [4, 9], [5, 10], [6, 8], [8, 10], [10, 7], [7, 9], [9, 6]]; out.push(graphText(10, mix(g, petersen)));
      return out;
    }
  },

  {
    ...hard,
    inputFormat: ['The first line has `n`, `m`, `time` and `change`.', 'Each of the next `m` lines has two numbers `u` and `v`: a road between the nodes `u` and `v`.'],
    constraints: ['2 <= n <= 20000', 'n - 1 <= m <= 30000', '1 <= time, change <= 1000', 'The graph is connected, with no self-loops and no repeated edges.'],
    slug: 'second-minimum-signal-time',
    title: 'The Second Fastest Drive Through the Traffic Lights',
    tags: ['graph', 'bfs', 'second-shortest', 'simulation'],
    concept: {
      title: 'Keep two different distances per node, then replay the lights on the second one',
      body: [
        'Every node of a road network is a crossing with a traffic light. All the lights are green at time 0 and switch (green to red, red to green) every `change` minutes; driving along any road takes `time` minutes. You may enter a crossing at any time, but you can only **leave** it while its light is green; if it is red you wait until it turns green, and you may **not wait while it is green**. What is the second smallest *different* travel time from node 1 to node `n`? (A walk may pass the same crossing again.)',
        'The light makes the time depend on the number of roads only: after `k` roads a drive that started at 0 is at the time `f(k)`, found by repeating "if the light is red wait for green, then add `time`". Since `f` grows with `k`, the second smallest travel time belongs to the **second smallest number of roads** of a walk from 1 to `n` (a different number from the smallest one). So the task is to find the shortest **and** the second shortest length in edges.',
        { code: 'INF = float("inf")\nd1 = [INF] * (n + 1); d2 = [INF] * (n + 1)\nd1[1] = 0\nqueue = deque([(1, 0)])\nwhile queue:\n    v, d = queue.popleft()\n    for w in adj[v]:\n        nd = d + 1\n        if nd < d1[w]:\n            d1[w] = nd; queue.append((w, nd))\n        elif d1[w] < nd < d2[w]:\n            d2[w] = nd; queue.append((w, nd))\nt = 0\nfor _ in range(d2[n]):\n    if (t // change) % 2 == 1: t = (t // change + 1) * change      # red: wait\n    t += time' },
        'Every node enters the queue at most twice (once for each of its two best lengths), so the BFS takes O(n + m). The second length is always the first plus 1 or plus 2: plus 1 if some odd cycle makes it possible, otherwise plus 2 (go one road further and come back). The final loop replays the lights for the `d2[n]` roads of the answer.'
      ]
    },
    statement: ['A connected road network has `n` crossings and `m` roads. Each crossing has a traffic light that is green at time 0 and changes colour every `change` minutes (green during [0, change), red during [change, 2 * change), and so on). Driving along a road takes `time` minutes. You leave node 1 at time 0. At a crossing you can leave only when the light is green; if it is red you wait until it is green, but you cannot wait while it is green. A walk may visit nodes (and use roads) more than once. Print the second smallest travel time from node 1 to node `n`, that is, the smallest travel time that is strictly larger than the smallest one.'],
    outputFormat: ['Print the second smallest travel time.'],
    examples: [{ input: '5 5 3 5\n1 2\n1 3\n1 4\n3 4\n4 5\n', note: 'The fastest drive 1-4-5 takes 6 minutes. The second fastest is 1-3-4-5: it reaches the node 4 at the time 6, when the light is red, waits until 10 and arrives at 13.' }, { input: '2 1 3 2\n1 2\n', note: 'The drive 1-2 takes 3 minutes. The second fastest is 1-2-1-2: it is at the node 2 at the time 3 (red, wait until 4), at the node 1 at the time 7 (red, wait until 8), and at the node 2 at the time 11.' }],
    hints: ['The travel time depends only on the number of roads: replay the lights for that many roads.', 'Find the smallest and the second smallest different number of roads from 1 to n with a BFS that keeps two distances per node.', 'Every node is queued at most twice.'],
    program: {
      io: ['n:int m:int time:int change:int', 'edges:int[m][2]'],
      fast: true,
      python: r`
        from collections import deque
        adj = [[] for _ in range(n + 1)]
        for u, v in edges:
            adj[u].append(v)
            adj[v].append(u)
        INF = 10 ** 9
        d1 = [INF] * (n + 1)
        d2 = [INF] * (n + 1)
        d1[1] = 0
        queue = deque([(1, 0)])
        while queue:
            v, d = queue.popleft()
            for w in adj[v]:
                nd = d + 1
                if nd < d1[w]:
                    d1[w] = nd
                    queue.append((w, nd))
                elif d1[w] < nd < d2[w]:
                    d2[w] = nd
                    queue.append((w, nd))
        clock = 0
        for _ in range(d2[n]):
            if (clock // change) % 2 == 1:
                clock = (clock // change + 1) * change
            clock += time
        print(clock)`,
      cpp: r`
        vector<vector<int>> adj(n + 1);
        for (const vector<long long>& e : edges) {
            adj[e[0]].push_back((int)e[1]);
            adj[e[1]].push_back((int)e[0]);
        }
        const int INF = 1000000000;
        vector<int> d1(n + 1, INF), d2(n + 1, INF);
        d1[1] = 0;
        vector<pair<int, int>> queue;
        queue.push_back({1, 0});
        for (size_t i = 0; i < queue.size(); i++) {
            int v = queue[i].first, d = queue[i].second;
            for (int w : adj[v]) {
                int nd = d + 1;
                if (nd < d1[w]) {
                    d1[w] = nd;
                    queue.push_back({w, nd});
                } else if (d1[w] < nd && nd < d2[w]) {
                    d2[w] = nd;
                    queue.push_back({w, nd});
                }
            }
        }
        long long clock = 0;
        for (int step = 0; step < d2[n]; step++) {
            if ((clock / change) % 2 == 1) clock = (clock / change + 1) * change;
            clock += time;
        }
        cout << clock << "\n";`,
      java: r`
        int nodes = (int) n;
        int[] head = new int[nodes + 2];
        for (int i = 0; i < edges.length; i++) {
            head[(int) edges[i][0] + 1]++;
            head[(int) edges[i][1] + 1]++;
        }
        for (int v = 1; v <= nodes; v++) head[v + 1] += head[v];
        int[] to = new int[2 * edges.length];
        int[] fill = new int[nodes + 2];
        for (int i = 0; i < edges.length; i++) {
            int a = (int) edges[i][0], b = (int) edges[i][1];
            to[head[a] + fill[a]] = b;
            fill[a]++;
            to[head[b] + fill[b]] = a;
            fill[b]++;
        }
        final int INF = 1000000000;
        int[] d1 = new int[nodes + 1];
        int[] d2 = new int[nodes + 1];
        Arrays.fill(d1, INF);
        Arrays.fill(d2, INF);
        d1[1] = 0;
        int[] queueNode = new int[2 * nodes + 2];
        int[] queueDist = new int[2 * nodes + 2];
        int qh = 0, qt = 0;
        queueNode[qt] = 1;
        queueDist[qt] = 0;
        qt++;
        while (qh < qt) {
            int v = queueNode[qh], d = queueDist[qh];
            qh++;
            for (int k = head[v]; k < head[v + 1]; k++) {
                int w = to[k];
                int nd = d + 1;
                if (nd < d1[w]) {
                    d1[w] = nd;
                    queueNode[qt] = w;
                    queueDist[qt] = nd;
                    qt++;
                } else if (d1[w] < nd && nd < d2[w]) {
                    d2[w] = nd;
                    queueNode[qt] = w;
                    queueDist[qt] = nd;
                    qt++;
                }
            }
        }
        long clock = 0;
        for (int step = 0; step < d2[nodes]; step++) {
            if ((clock / change) % 2 == 1) clock = (clock / change + 1) * change;
            clock += time;
        }
        System.out.println(clock);`
    },
    solution: { explanation: ['A BFS keeps the smallest and the second smallest different number of roads from node 1 to every node (each node enters the queue at most twice). The lights are then replayed for the second smallest number of roads of the last node: whenever the light is red the clock waits for the next green, and then the road time is added.'], complexity: 'Time O(n + m + d), where d is the number of roads of the answer (at most n + 1); space O(n + m).' },
    solve(input) {
      const rs = rows(input); const [n, m, time, change] = nums(rs[0]); const adj = Array.from({ length: n + 1 }, () => []); for (let i = 1; i <= m; i++) { const [u, v] = nums(rs[i]); adj[u].push(v); adj[v].push(u); }
      return String(n <= 300 ? secondByLayers(n, adj, time, change) : secondByTwoDistances(n, adj, time, change));
    },
    tests() {
      const g = rng(1108); const out = ['5 5 3 5\n1 2\n1 3\n1 4\n3 4\n4 5\n', '2 1 3 2\n1 2\n'];
      const make = (n, edges, time, change) => `${n} ${edges.length} ${time} ${change}\n${edges.map((e) => e.join(' ')).join('\n')}\n`;
      const conn = (n, extra) => mix(g, connectedEdges(g, n, extra));
      const both = (input, fn) => { const rs = rows(input); const [n, m, time, change] = nums(rs[0]); const adj = Array.from({ length: n + 1 }, () => []); for (let i = 1; i <= m; i++) { const [u, v] = nums(rs[i]); adj[u].push(v); adj[v].push(u); } return String(fn(n, adj, time, change)); };
      crossCheck(() => { const n = randInt(g, 2, 12); return make(n, conn(n, randInt(g, 0, Math.min(5, n * (n - 1) / 2 - (n - 1)))), randInt(g, 1, 9), randInt(g, 1, 9)); }, (i) => both(i, secondByTwoDistances), (i) => both(i, secondByLayers), 400);
      for (const [n, extra, t, c] of [[3, 0, 2, 3], [6, 2, 5, 3], [10, 5, 3, 7], [30, 10, 4, 4], [100, 50, 7, 3], [1000, 500, 10, 1000], [1000, 0, 1, 1], [20000, 10000, 1000, 1], [20000, 10000, 1, 1000], [20000, 10000, 333, 500], [20000, 10000, 1000, 1000], [20000, 5, 17, 40], [20000, 0, 999, 998]]) out.push(make(n, conn(n, extra), t, c));
      // a path (the second drive goes one road further and back), an odd cycle, an even cycle, and a long path with one triangle at the end
      const path = many(19999, (i) => [i + 1, i + 2]); out.push(make(20000, path, 7, 5), make(20000, path, 1000, 1000), make(20000, path, 1, 1));
      const cycle = (len) => many(len, (i) => [i + 1, (i + 1) % len + 1]); out.push(make(19999, cycle(19999), 13, 6), make(20000, cycle(20000), 13, 6), make(3, cycle(3), 5, 2));
      const tri = [...path.slice(0, 19998), [19999, 20000], [19998, 20000]]; out.push(make(20000, tri, 11, 4));
      // complete graph on 140 nodes and a grid
      const complete = []; for (let a = 1; a <= 140; a++) for (let b = a + 1; b <= 140; b++) complete.push([a, b]); out.push(make(140, shuffle(g, complete), 4, 9));
      const grid = []; for (let x = 0; x < 100; x++) for (let y = 0; y < 100; y++) { const id = x * 100 + y + 1; if (y + 1 < 100) grid.push([id, id + 1]); if (x + 1 < 100) grid.push([id, id + 100]); } out.push(make(10000, shuffle(g, grid), 9, 1000), make(10000, shuffle(g, grid), 1000, 7));
      return out;
    }
  }
];

// the clock after `roads` roads: a red light makes the drive wait until the next green
function replayLights(roads, time, change) { let clock = 0; for (let i = 0; i < roads; i++) { if (Math.floor(clock / change) % 2 === 1) clock = (Math.floor(clock / change) + 1) * change; clock += time; } return clock; }
// layer by layer: the set of nodes reachable by a walk of exactly k roads; the first two k for which n is in the set (small graphs only)
function secondByLayers(n, adj, time, change) { let cur = new Set([1]); const counts = []; for (let k = 0; counts.length < 2 && k <= 2 * n + 4; k++) { if (cur.has(n)) counts.push(k); const nxt = new Set(); for (const x of cur) for (const y of adj[x]) nxt.add(y); cur = nxt; } return replayLights(counts[1], time, change); }
// two different distances per node from one search that processes the walks in the order of their length
function secondByTwoDistances(n, adj, time, change) { const INF = 1e9; const d1 = new Array(n + 1).fill(INF), d2 = new Array(n + 1).fill(INF); d1[1] = 0; const queue = [[1, 0]]; for (let h = 0; h < queue.length; h++) { const [v, d] = queue[h]; for (const w of adj[v]) { const nd = d + 1; if (nd < d1[w]) { d1[w] = nd; queue.push([w, nd]); } else if (d1[w] < nd && nd < d2[w]) { d2[w] = nd; queue.push([w, nd]); } } } return replayLights(d2[n], time, change); }
function parseEdges(input) { const rs = rows(input); const [n, m] = nums(rs[0]); return { n, m, edges: many(m, (i) => nums(rs[i + 1])) }; }
function words(input) { return input.split(/\s+/).filter(Boolean); }
