import { r, rng, randInt, many, nums, rows, shuffle, randWord } from '../../lib.mjs';
import { graphText, randomEdges, randomTreeEdges, connectedEdges, randomDirected, randomDag, adjacency, mix, randomGrid, gridText, Heap } from '../../graphlib.mjs';
import { J, ADJ, DIR, EDGE_INPUT, DIR_INPUT, WDIR_INPUT, EDGE_LIMITS, GRID_INPUT } from '../../graphcode.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIR_LIMITS = ['1 <= n <= 20000', '1 <= m <= 30000', 'There are no self-loops and no repeated edges.'];
const dirIn = { ...medium, inputFormat: DIR_INPUT, constraints: DIR_LIMITS };
const parse = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); return { n, m, edges: many(m, (i) => nums(rs[i + 1])), rs }; };
const parseGrid = (input) => { const rs = rows(input); const [h, w] = nums(rs[0]); return { h, w, cells: rs.slice(1, 1 + h), rs }; };
const inside = (h, w, a, b) => a >= 0 && a < h && b >= 0 && b < w;
const DG = (g, n, m) => shuffle(g, randomDag(g, n, m));
const CG = (g, n, m) => shuffle(g, randomDirected(g, n, m));
// the smallest topological order (smallest number first) or null when there is a cycle
function smallestOrder(n, edges) {
  const adj = adjacency(n, edges, true); const indeg = new Array(n + 1).fill(0); for (const [, v] of edges) indeg[v]++;
  const heap = new Heap((a, b) => a < b); for (let v = 1; v <= n; v++) if (!indeg[v]) heap.push(v); const order = [];
  while (heap.size) { const u = heap.pop(); order.push(u); for (const v of adj[u]) if (--indeg[v] === 0) heap.push(v); }
  return order.length === n ? order : null;
}

export default [
  {
    ...medium,
    inputFormat: [...GRID_INPUT, 'Then `h` more lines with a second grid of the same size.'],
    constraints: ['1 <= h, w <= 200', 'Every character is `0` (water) or `1` (land).'],
    slug: 'count-sub-islands',
    title: 'Islands Inside Islands',
    tags: ['graph', 'grid', 'dfs', 'flood-fill'],
    concept: {
      title: 'Flood an island of the second map and check every cell against the first map',
      body: [
        'There are two maps of the same area, `A` and `B`. An island of `B` is a *sub-island* if **every one of its cells is land in `A` too**, so that it lies completely inside one island of `A`. Count the sub-islands.',
        'The two maps are used in different ways. The islands are the groups of the map `B`, found by flood fill as before. While flooding one island, **look at the same cell in `A`**: if it is water there, the island cannot be a sub-island. The whole island must still be flooded, even after the first bad cell, because otherwise its remaining cells would be taken for new islands later. So keep a flag, and decide at the end of the flood.',
        { code: 'count = 0\nfor x in range(h):\n    for y in range(w):\n        if b[x][y] == "1" and not seen[x][y]:\n            seen[x][y] = True\n            stack = [(x, y)]\n            inside_a = True\n            while stack:\n                p, q = stack.pop()\n                if a[p][q] == "0":\n                    inside_a = False       # keep flooding, but remember the failure\n                ...                        # push the unseen land neighbours in b\n            if inside_a:\n                count += 1' },
        'The mistake to avoid is stopping the flood early. With the full flood each cell is visited once and the time is O(h * w).'
      ]
    },
    statement: ['Two maps `A` and `B` of the same size, `h` rows and `w` columns, show land (`1`) and water (`0`). An island is a group of land cells connected through their sides. An island of `B` is a sub-island if every cell of it is also land in `A`. Print the number of sub-islands.'],
    outputFormat: ['Print the number of sub-islands.'],
    examples: [{ input: '3 4\n1110\n0110\n0001\n1100\n0011\n0001\n', note: 'The map A is the first three rows and B the last three. The island of B in the first row lies on land of A. The other island of B (three cells) has a cell where A is water: 1.' }],
    hints: ['Find the islands of B with a flood fill.', 'While flooding, check each cell in A; remember if one is water, but keep flooding.', 'Count the islands where no cell was water in A.'],
    program: {
      io: ['h:int w:int', 'a:rows[h]', 'b:rows[h]'],
      fast: true,
      python: r`
        seen = [[False] * w for _ in range(h)]
        count = 0
        for x in range(h):
            for y in range(w):
                if b[x][y] == "1" and not seen[x][y]:
                    seen[x][y] = True
                    stack = [(x, y)]
                    inside_a = True
                    while stack:
                        p, q = stack.pop()
                        if a[p][q] == "0":
                            inside_a = False
                        for s, t in ((p + 1, q), (p - 1, q), (p, q + 1), (p, q - 1)):
                            if 0 <= s < h and 0 <= t < w and b[s][t] == "1" and not seen[s][t]:
                                seen[s][t] = True
                                stack.append((s, t))
                    if inside_a:
                        count += 1
        print(count)`,
      cpp: r`
        vector<vector<char>> seen(h, vector<char>(w, 0));
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        long long count = 0;
        for (int x = 0; x < h; x++) {
            for (int y = 0; y < w; y++) {
                if (b[x][y] != '1' || seen[x][y]) continue;
                seen[x][y] = 1;
                vector<pair<int, int>> stack = {{x, y}};
                bool insideA = true;
                while (!stack.empty()) {
                    pair<int, int> cell = stack.back();
                    stack.pop_back();
                    if (a[cell.first][cell.second] == '0') insideA = false;
                    for (int d = 0; d < 4; d++) {
                        int s = cell.first + dx[d], t = cell.second + dy[d];
                        if (s >= 0 && s < h && t >= 0 && t < w && b[s][t] == '1' && !seen[s][t]) {
                            seen[s][t] = 1;
                            stack.push_back({s, t});
                        }
                    }
                }
                if (insideA) count++;
            }
        }
        cout << count << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        boolean[][] seen = new boolean[rowsCount][colsCount];
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        long count = 0;
        for (int x = 0; x < rowsCount; x++) {
            for (int y = 0; y < colsCount; y++) {
                if (b[x].charAt(y) != '1' || seen[x][y]) continue;
                seen[x][y] = true;
                ArrayList<int[]> stack = new ArrayList<>();
                stack.add(new int[] {x, y});
                boolean insideA = true;
                while (!stack.isEmpty()) {
                    int[] cell = stack.remove(stack.size() - 1);
                    if (a[cell[0]].charAt(cell[1]) == '0') insideA = false;
                    for (int d = 0; d < 4; d++) {
                        int s = cell[0] + dx[d], t = cell[1] + dy[d];
                        if (s >= 0 && s < rowsCount && t >= 0 && t < colsCount && b[s].charAt(t) == '1' && !seen[s][t]) {
                            seen[s][t] = true;
                            stack.add(new int[] {s, t});
                        }
                    }
                }
                if (insideA) count++;
            }
        }
        System.out.println(count);`
    },
    solution: { explanation: ['Every island of B is flooded completely; a flag records whether some cell of it is water in A, and the islands without a bad cell are counted.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) {
      const rs = rows(input); const [h, w] = nums(rs[0]); const a = rs.slice(1, 1 + h), b = rs.slice(1 + h, 1 + 2 * h); const seen = b.map((row) => [...row].map(() => false)); let count = 0;
      for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) { if (b[x][y] !== '1' || seen[x][y]) continue; seen[x][y] = true; const st = [[x, y]]; let ok = true; while (st.length) { const [p, q] = st.pop(); if (a[p][q] === '0') ok = false; for (const [dx, dy] of DIRS) { const s = p + dx, t = q + dy; if (inside(h, w, s, t) && b[s][t] === '1' && !seen[s][t]) { seen[s][t] = true; st.push([s, t]); } } } if (ok) count++; }
      return String(count);
    },
    tests() {
      const g = rng(941); const out = ['3 4\n1110\n0110\n0001\n1100\n0011\n0001\n', '1 1\n1\n1\n', '1 1\n0\n1\n', '1 1\n1\n0\n'];
      const pair = (h, w, pa, pb) => { const a = randomGrid(g, h, w, ['0', '1'], [1 - pa, pa]); const b = a.map((row) => [...row].map((c) => (c === '1' ? (g() < 1 - pb ? '1' : '0') : (g() < 0.03 ? '1' : '0'))).join('')); return `${h} ${w}\n${a.join('\n')}\n${b.join('\n')}\n`; };
      for (const [h, w, pa, pb] of [[4, 5, 0.7, 0.2], [10, 10, 0.7, 0.3], [30, 40, 0.8, 0.2], [200, 200, 0.7, 0.4], [200, 200, 0.9, 0.5], [200, 200, 0.5, 0.2], [1, 200, 0.7, 0.3], [200, 1, 0.7, 0.3]]) out.push(pair(h, w, pa, pb));
      out.push(`200 200\n${many(200, () => '1'.repeat(200)).join('\n')}\n${many(200, (i) => (i % 2 ? '0'.repeat(200) : '1'.repeat(200))).join('\n')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: GRID_INPUT,
    constraints: ['1 <= h, w <= 200', 'Every character is `0` (water) or `1` (land).'],
    slug: 'farthest-from-land',
    title: 'As Far From the Land as Possible',
    tags: ['graph', 'grid', 'bfs', 'multi-source'],
    concept: {
      title: 'A multi-source BFS from the land: the last layer is the farthest water cell',
      body: [
        'On a map with land (`1`) and water (`0`), the distance between two cells is the number of steps up, down, left and right (on this open grid it is the Manhattan distance, with no obstacles in the way). Find a water cell whose distance to the **nearest** land cell is **as large as possible**, and print that distance. If there is no land, or no water, print -1.',
        'This is the multi-source search of the nearest-zero task with the roles named differently: start with **all land cells** in the first layer; each layer is one step farther from the land. The layer number in which the **last** water cell is reached is the largest distance of any water cell to the land.',
        { code: 'layer = [land cells]\nif not layer or len(layer) == h * w:\n    answer = -1\nelse:\n    steps = -1\n    while layer:\n        next_layer = []\n        for x, y in layer:\n            for a, b in neighbours(x, y):\n                if inside(a, b) and not seen[a][b]:\n                    seen[a][b] = True\n                    next_layer.append((a, b))\n        layer = next_layer\n        steps += 1\n    answer = steps               # the number of the last non-empty layer' },
        'Counting layers needs care with the first layer (distance 0, the land itself): the answer is the index of the last layer that was not empty. The time is O(h * w).'
      ]
    },
    statement: ['A map has `h` rows and `w` columns of land (`1`) and water (`0`). For a water cell, its distance to the land is the smallest number of steps (up, down, left, right, over any cells) to a land cell. Print the largest such distance over all water cells, or -1 if the map has no land or no water.'],
    outputFormat: ['Print the largest distance or -1.'],
    examples: [{ input: '3 3\n100\n000\n000\n', note: 'The cell in the opposite corner is 4 steps away from the only land cell: 4.' }],
    hints: ['Start a search from all land cells together.', 'Each layer is one step farther from the land; count the layers.', 'If the map has no land or no water, print -1.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        seen = [[False] * w for _ in range(h)]
        layer = []
        for x in range(h):
            for y in range(w):
                if grid[x][y] == "1":
                    seen[x][y] = True
                    layer.append((x, y))
        if not layer or len(layer) == h * w:
            print(-1)
        else:
            steps = -1
            while layer:
                next_layer = []
                for x, y in layer:
                    for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                        if 0 <= a < h and 0 <= b < w and not seen[a][b]:
                            seen[a][b] = True
                            next_layer.append((a, b))
                layer = next_layer
                steps += 1
            print(steps)`,
      cpp: r`
        vector<vector<char>> seen(h, vector<char>(w, 0));
        vector<pair<int, int>> layer;
        for (int x = 0; x < h; x++) {
            for (int y = 0; y < w; y++) {
                if (grid[x][y] == '1') {
                    seen[x][y] = 1;
                    layer.push_back({x, y});
                }
            }
        }
        if (layer.empty() || (long long)layer.size() == h * w) {
            cout << -1 << "\n";
        } else {
            int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
            long long steps = -1;
            while (!layer.empty()) {
                vector<pair<int, int>> next;
                for (const auto& cell : layer) {
                    for (int d = 0; d < 4; d++) {
                        int a = cell.first + dx[d], b = cell.second + dy[d];
                        if (a >= 0 && a < h && b >= 0 && b < w && !seen[a][b]) {
                            seen[a][b] = 1;
                            next.push_back({a, b});
                        }
                    }
                }
                layer = next;
                steps++;
            }
            cout << steps << "\n";
        }`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        boolean[][] seen = new boolean[rowsCount][colsCount];
        List<int[]> layer = new ArrayList<>();
        for (int x = 0; x < rowsCount; x++) {
            for (int y = 0; y < colsCount; y++) {
                if (grid[x].charAt(y) == '1') {
                    seen[x][y] = true;
                    layer.add(new int[] {x, y});
                }
            }
        }
        if (layer.isEmpty() || layer.size() == rowsCount * colsCount) {
            System.out.println(-1);
        } else {
            int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
            long steps = -1;
            while (!layer.isEmpty()) {
                List<int[]> next = new ArrayList<>();
                for (int[] cell : layer) {
                    for (int d = 0; d < 4; d++) {
                        int a = cell[0] + dx[d], b = cell[1] + dy[d];
                        if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount && !seen[a][b]) {
                            seen[a][b] = true;
                            next.add(new int[] {a, b});
                        }
                    }
                }
                layer = next;
                steps++;
            }
            System.out.println(steps);
        }`
    },
    solution: { explanation: ['A breadth-first search starting from all land cells expands layer by layer; the index of the last non-empty layer is the largest distance of a water cell to the land.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) {
      const { h, w, cells } = parseGrid(input); const lands = []; for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) if (cells[x][y] === '1') lands.push([x, y]);
      if (!lands.length || lands.length === h * w) return '-1';
      // on an open grid the distance to the nearest land cell is the smallest Manhattan distance
      const dist = cells.map((row) => [...row].map(() => -1)); const q = lands.slice(); for (const [x, y] of lands) dist[x][y] = 0; let best = 0;
      for (let i = 0; i < q.length; i++) { const [x, y] = q[i]; best = Math.max(best, dist[x][y]); for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (inside(h, w, a, b) && dist[a][b] < 0) { dist[a][b] = dist[x][y] + 1; q.push([a, b]); } } }
      return String(best);
    },
    tests() {
      const g = rng(942); const out = ['3 3\n100\n000\n000\n', '1 1\n0\n', '1 1\n1\n', '2 2\n11\n11\n'];
      const brute = (input) => { const { h, w, cells } = parseGrid(input); const lands = []; for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) if (cells[x][y] === '1') lands.push([x, y]); if (!lands.length || lands.length === h * w) return '-1'; let best = 0; for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) if (cells[x][y] === '0') best = Math.max(best, Math.min(...lands.map(([a, b]) => Math.abs(a - x) + Math.abs(b - y)))); return String(best); };
      crossCheck(() => gridText(randomGrid(g, randInt(g, 1, 7), randInt(g, 1, 7), ['0', '1'], [0.7, 0.3])), (i) => this.solve(i), brute, 300);
      for (const [h, w, p] of [[5, 6, 0.2], [12, 12, 0.05], [60, 80, 0.01], [200, 200, 0.005], [200, 200, 0.0001], [200, 200, 0.5], [1, 200, 0.02], [200, 1, 0.02]]) out.push(gridText(randomGrid(g, h, w, ['0', '1'], [1 - p, p])));
      out.push(gridText(['1' + '0'.repeat(199), ...many(199, () => '0'.repeat(200))]), gridText(many(200, () => '0'.repeat(200))), gridText(many(200, () => '1'.repeat(200))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: GRID_INPUT,
    constraints: ['1 <= h, w <= 200', 'Every character is `0` (empty) or `1` (an obstacle).', 'The first cell (top left) and the last cell (bottom right) are `0`.'],
    slug: 'minimum-obstacle-removal',
    title: 'Fewest Obstacles to Clear',
    tags: ['graph', 'grid', 'bfs', '0-1-bfs', 'deque'],
    concept: {
      title: '0-1 BFS: a deque lets steps of cost 0 go to the front and steps of cost 1 to the back',
      body: [
        'You walk from the top left to the bottom right cell of a grid, moving up, down, left or right. Moving into an empty cell is free, but moving into a cell with an obstacle costs 1 (you remove the obstacle). What is the smallest total cost?',
        'The edge costs are only **0 or 1**, which allows a trick faster than Dijkstra\'s algorithm: *0-1 BFS*. Keep the cells to process in a **double-ended queue (deque)**. When the step into a neighbour costs **0**, put the neighbour at the **front** of the deque (it is as close as the current cell); when it costs **1**, put it at the **back**. The deque then always holds the cells in order of non-decreasing distance, like the queue of an ordinary BFS, and a cell is improved whenever a cheaper way to it is found.',
        { code: 'from collections import deque\ndist = [[INF] * w for _ in range(h)]\ndist[0][0] = 0\ndq = deque([(0, 0)])\nwhile dq:\n    x, y = dq.popleft()\n    for a, b in neighbours(x, y):\n        if inside(a, b):\n            cost = dist[x][y] + (1 if grid[a][b] == "1" else 0)\n            if cost < dist[a][b]:\n                dist[a][b] = cost\n                if grid[a][b] == "1":\n                    dq.append((a, b))          # a step of cost 1: to the back\n                else:\n                    dq.appendleft((a, b))      # a step of cost 0: to the front' },
        'Every cell can enter the deque more than once (when its distance improves), but only a small number of times, and the total time stays O(h * w). The same method works for any graph whose edges cost 0 or 1.'
      ]
    },
    statement: ['A grid of `h` rows and `w` columns has empty cells (`0`) and obstacles (`1`). You start at the top left cell and want to reach the bottom right cell, moving one step up, down, left or right at a time. Entering an obstacle costs 1 (you remove it), entering an empty cell costs 0. Print the smallest total cost.'],
    outputFormat: ['Print the smallest cost.'],
    examples: [{ input: '3 3\n011\n110\n110\n', note: 'Go right through two obstacles in the first row, then down through the free cells: 2.' }],
    hints: ['Use a deque instead of a queue.', 'A step into an empty cell goes to the front of the deque, a step into an obstacle to the back.', 'Update a cell only when you find a smaller cost for it.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      includes: ['<deque>'],
      python: r`
        from collections import deque
        INF = 10 ** 9
        dist = [[INF] * w for _ in range(h)]
        dist[0][0] = 0
        dq = deque([(0, 0)])
        while dq:
            x, y = dq.popleft()
            for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= a < h and 0 <= b < w:
                    cost = dist[x][y] + (1 if grid[a][b] == "1" else 0)
                    if cost < dist[a][b]:
                        dist[a][b] = cost
                        if grid[a][b] == "1":
                            dq.append((a, b))
                        else:
                            dq.appendleft((a, b))
        print(dist[h - 1][w - 1])`,
      cpp: r`
        const int INF = 1000000000;
        vector<vector<int>> dist(h, vector<int>(w, INF));
        dist[0][0] = 0;
        deque<pair<int, int>> dq;
        dq.push_back({0, 0});
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        while (!dq.empty()) {
            pair<int, int> cell = dq.front();
            dq.pop_front();
            for (int d = 0; d < 4; d++) {
                int a = cell.first + dx[d], b = cell.second + dy[d];
                if (a >= 0 && a < h && b >= 0 && b < w) {
                    int cost = dist[cell.first][cell.second] + (grid[a][b] == '1' ? 1 : 0);
                    if (cost < dist[a][b]) {
                        dist[a][b] = cost;
                        if (grid[a][b] == '1') dq.push_back({a, b});
                        else dq.push_front({a, b});
                    }
                }
            }
        }
        cout << dist[h - 1][w - 1] << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        int INF = 1000000000;
        int[][] dist = new int[rowsCount][colsCount];
        for (int[] row : dist) Arrays.fill(row, INF);
        dist[0][0] = 0;
        ArrayDeque<int[]> dq = new ArrayDeque<>();
        dq.addLast(new int[] {0, 0});
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        while (!dq.isEmpty()) {
            int[] cell = dq.pollFirst();
            for (int d = 0; d < 4; d++) {
                int a = cell[0] + dx[d], b = cell[1] + dy[d];
                if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount) {
                    int cost = dist[cell[0]][cell[1]] + (grid[a].charAt(b) == '1' ? 1 : 0);
                    if (cost < dist[a][b]) {
                        dist[a][b] = cost;
                        if (grid[a].charAt(b) == '1') dq.addLast(new int[] {a, b});
                        else dq.addFirst(new int[] {a, b});
                    }
                }
            }
        }
        System.out.println(dist[rowsCount - 1][colsCount - 1]);`
    },
    solution: { explanation: ['0-1 BFS with a deque: a step into an empty cell (cost 0) pushes the cell to the front, a step into an obstacle (cost 1) pushes it to the back, and a cell is updated only when a smaller cost is found.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) {
      const { h, w, cells } = parseGrid(input); const INF = 1e9; const dist = cells.map((row) => [...row].map(() => INF)); dist[0][0] = 0; const heap = new Heap((p, q) => p[0] < q[0]); heap.push([0, 0, 0]);
      while (heap.size) { const [d, x, y] = heap.pop(); if (d > dist[x][y]) continue; for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (inside(h, w, a, b)) { const c = d + (cells[a][b] === '1' ? 1 : 0); if (c < dist[a][b]) { dist[a][b] = c; heap.push([c, a, b]); } } } }
      return String(dist[h - 1][w - 1]);
    },
    tests() {
      const g = rng(943); const out = ['3 3\n011\n110\n110\n', '1 1\n0\n', '1 2\n00\n', '2 2\n01\n10\n'];
      const make = (h, w, p) => { const cells = randomGrid(g, h, w, ['0', '1'], [1 - p, p]); cells[0] = '0' + cells[0].slice(1); cells[h - 1] = cells[h - 1].slice(0, w - 1) + '0'; return gridText(cells); };
      for (const [h, w, p] of [[4, 5, 0.4], [10, 10, 0.5], [30, 40, 0.6], [200, 200, 0.3], [200, 200, 0.5], [200, 200, 0.7], [200, 200, 0.9], [1, 200, 0.5], [200, 1, 0.5]]) out.push(make(h, w, p));
      out.push(gridText(many(200, (i) => (i === 0 ? '0' + '1'.repeat(199) : '1'.repeat(199) + '0'))), gridText(many(199, (i) => (i % 2 === 0 ? '0'.repeat(199) : (i % 4 === 1 ? '1'.repeat(198) + '0' : '0' + '1'.repeat(198))))));
      return out;
    }
  },

  {
    ...dirIn,
    inputFormat: ['The first line has `n` and `m`: the number of courses (numbered 1 to n) and the number of rules.', 'Each of the next `m` lines has two numbers `u` and `v`: the course `u` must be taken before the course `v`.'],
    slug: 'course-order',
    title: 'A Valid Order of the Courses, Smallest First',
    tags: ['graph', 'topological-sort', 'heap', 'directed-graph'],
    concept: {
      title: 'Kahn\'s algorithm with a priority queue: among the available courses always take the smallest number',
      body: [
        'A *topological order* of a directed graph lists the nodes so that every edge `u -> v` has `u` before `v`. There are usually many valid orders. To make the answer unique, ask for the **smallest** one: at every step, among the courses that can be taken now (all their prerequisites are done), take the one with the **smallest number**. This gives the lexicographically smallest order.',
        'It is Kahn\'s algorithm with one change: the set of available courses (in-degree 0) is kept in a **min-heap** instead of a plain queue, so that the smallest one comes out first. Taking a course lowers the in-degree of the courses that follow it; a course whose in-degree reaches 0 goes into the heap. If the output has fewer than `n` courses, the rest are stuck in a cycle: print `impossible`.',
        { code: 'import heapq\nheap = [v for v in range(1, n + 1) if indeg[v] == 0]\nheapq.heapify(heap)\norder = []\nwhile heap:\n    u = heapq.heappop(heap)          # the smallest available course\n    order.append(u)\n    for v in adj[u]:\n        indeg[v] -= 1\n        if indeg[v] == 0:\n            heapq.heappush(heap, v)\nprint(*order if len(order) == n else ["impossible"])' },
        'Each course enters and leaves the heap once, so the time is O((n + m) log n). A *greedy* choice like this is correct here because taking the smallest available course now can never block a later smaller choice: a course that is not yet available cannot be taken earlier anyway.'
      ]
    },
    statement: ['There are `n` courses and `m` rules. A rule `u v` means that the course `u` must be taken before the course `v`. Print an order in which all the courses can be taken, choosing, at every step, the smallest number among the courses that can be taken. If the courses cannot all be taken, print `impossible`.'],
    outputFormat: ['The order on one line, or `impossible`.'],
    examples: [{ input: '4 3\n2 1\n3 1\n1 4\n', note: 'The courses 2 and 3 can start; take 2, then 3, then 1, then 4: 2 3 1 4.' }],
    hints: ['Count the number of prerequisites (in-degree) of every course.', 'Keep the courses with no remaining prerequisite in a min-heap.', 'Take the smallest, lower the counts of its followers, and push those that reach 0. If fewer than n courses were taken, print impossible.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<queue>', '<functional>'],
      python: J(DIR.python, r`
        import heapq
        indeg = [0] * (n + 1)
        for u, v in edges:
            indeg[v] += 1
        heap = [v for v in range(1, n + 1) if indeg[v] == 0]
        heapq.heapify(heap)
        order = []
        while heap:
            u = heapq.heappop(heap)
            order.append(u)
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    heapq.heappush(heap, v)
        print(*order if len(order) == n else ["impossible"])`),
      cpp: J(DIR.cpp, r`
        vector<int> indeg(n + 1, 0);
        for (const vector<long long>& e : edges) indeg[e[1]]++;
        priority_queue<int, vector<int>, greater<int>> heap;
        for (int v = 1; v <= n; v++) {
            if (indeg[v] == 0) heap.push(v);
        }
        vector<int> order;
        while (!heap.empty()) {
            int u = heap.top();
            heap.pop();
            order.push_back(u);
            for (int v : adj[u]) {
                indeg[v]--;
                if (indeg[v] == 0) heap.push(v);
            }
        }
        if ((long long)order.size() != n) {
            cout << "impossible\n";
        } else {
            for (size_t i = 0; i < order.size(); i++) cout << (i ? " " : "") << order[i];
            cout << "\n";
        }`),
      java: J(DIR.java, r`
        int[] indeg = new int[nodes + 1];
        for (long[] e : edges) indeg[(int) e[1]]++;
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int v = 1; v <= nodes; v++) {
            if (indeg[v] == 0) heap.add(v);
        }
        List<Integer> order = new ArrayList<>();
        while (!heap.isEmpty()) {
            int u = heap.poll();
            order.add(u);
            for (int v : adj.get(u)) {
                indeg[v]--;
                if (indeg[v] == 0) heap.add(v);
            }
        }
        if (order.size() != nodes) {
            System.out.println("impossible");
        } else {
            StringBuilder out = new StringBuilder();
            for (int i = 0; i < order.size(); i++) out.append(i > 0 ? " " : "").append(order.get(i));
            System.out.println(out);
        }`)
    },
    solution: { explanation: ['Kahn\'s algorithm with a min-heap of the available courses: the smallest one is taken, the in-degrees of its followers are lowered and those that reach 0 are pushed. If fewer than n courses are taken there is a cycle.'], complexity: 'Time O((n + m) log n), space O(n + m).' },
    solve(input) { const { n, edges } = parse(input); const o = smallestOrder(n, edges); return o ? o.join(' ') : 'impossible'; },
    tests() {
      const g = rng(944); const out = ['4 3\n2 1\n3 1\n1 4\n', '3 3\n1 2\n2 3\n3 1\n', '2 1\n2 1\n'];
      for (const [n, m] of [[6, 7], [30, 50], [1000, 1500], [20000, 25000], [20000, 30000], [20000, 5000]]) { out.push(graphText(n, DG(g, n, m))); }
      for (const [n, m] of [[8, 12], [200, 400], [20000, 21000]]) out.push(graphText(n, CG(g, n, m)));
      const chain = many(19999, (i) => [20000 - i, 20000 - i - 1]); out.push(graphText(20000, chain), graphText(20000, [...chain, [1, 20000]]));
      return out;
    }
  },

  {
    ...dirIn,
    inputFormat: ['The first line has `n` and `m`: the number of courses (numbered 1 to n) and the number of rules.', 'Each of the next `m` lines has two numbers `u` and `v`: the course `u` must be finished in an earlier semester than the course `v` starts.'],
    slug: 'parallel-courses',
    title: 'The Fewest Semesters',
    tags: ['graph', 'topological-sort', 'bfs', 'layers'],
    concept: {
      title: 'Kahn\'s algorithm by layers: every layer is one semester',
      body: [
        'You can take **any number of courses at once** in one semester, but only courses whose prerequisites were finished in **earlier** semesters. What is the smallest number of semesters in which all courses can be finished, or is it impossible (a cycle)?',
        'In Kahn\'s algorithm, the courses whose in-degree is 0 can all be taken in the first semester. Take them all together as **one layer**; the courses that become available after that form the second layer, and so on. The number of layers is the number of semesters. It is the layered BFS you already know, applied to the in-degrees.',
        { code: 'layer = [v for v in range(1, n + 1) if indeg[v] == 0]\nsemesters = 0\ntaken = 0\nwhile layer:\n    semesters += 1\n    taken += len(layer)\n    next_layer = []\n    for u in layer:\n        for v in adj[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                next_layer.append(v)\n    layer = next_layer\nanswer = semesters if taken == n else -1' },
        'The number of semesters equals the number of nodes on the **longest path** in the graph (counting nodes): a chain of dependencies cannot be shortened. This connects topological sorting with the "longest path in a DAG" idea of the next tasks.'
      ]
    },
    statement: ['There are `n` courses and `m` rules. A rule `u v` means that the course `u` must be finished in an earlier semester than the semester in which `v` is taken. In one semester you can take any number of courses whose prerequisites are all finished in earlier semesters. Print the smallest number of semesters in which all courses can be finished, or -1 if it is impossible.'],
    outputFormat: ['Print the number of semesters or -1.'],
    examples: [{ input: '3 2\n1 3\n2 3\n', note: 'The courses 1 and 2 in the first semester, the course 3 in the second: 2.' }],
    hints: ['Compute the in-degrees; the courses with in-degree 0 form the first semester.', 'Process the semesters as layers: the courses that become available after a layer form the next one.', 'If not all courses were taken, print -1.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: J(DIR.python, r`
        indeg = [0] * (n + 1)
        for u, v in edges:
            indeg[v] += 1
        layer = [v for v in range(1, n + 1) if indeg[v] == 0]
        semesters = 0
        taken = 0
        while layer:
            semesters += 1
            taken += len(layer)
            next_layer = []
            for u in layer:
                for v in adj[u]:
                    indeg[v] -= 1
                    if indeg[v] == 0:
                        next_layer.append(v)
            layer = next_layer
        print(semesters if taken == n else -1)`),
      cpp: J(DIR.cpp, r`
        vector<int> indeg(n + 1, 0);
        for (const vector<long long>& e : edges) indeg[e[1]]++;
        vector<int> layer;
        for (int v = 1; v <= n; v++) {
            if (indeg[v] == 0) layer.push_back(v);
        }
        long long semesters = 0, taken = 0;
        while (!layer.empty()) {
            semesters++;
            taken += (long long)layer.size();
            vector<int> next;
            for (int u : layer) {
                for (int v : adj[u]) {
                    indeg[v]--;
                    if (indeg[v] == 0) next.push_back(v);
                }
            }
            layer = next;
        }
        cout << (taken == n ? semesters : -1) << "\n";`),
      java: J(DIR.java, r`
        int[] indeg = new int[nodes + 1];
        for (long[] e : edges) indeg[(int) e[1]]++;
        List<Integer> layer = new ArrayList<>();
        for (int v = 1; v <= nodes; v++) {
            if (indeg[v] == 0) layer.add(v);
        }
        long semesters = 0, taken = 0;
        while (!layer.isEmpty()) {
            semesters++;
            taken += layer.size();
            List<Integer> next = new ArrayList<>();
            for (int u : layer) {
                for (int v : adj.get(u)) {
                    indeg[v]--;
                    if (indeg[v] == 0) next.add(v);
                }
            }
            layer = next;
        }
        System.out.println(taken == nodes ? semesters : -1);`)
    },
    solution: { explanation: ['Kahn\'s algorithm by layers: the courses with in-degree 0 form one semester, the courses released by them the next one; the number of layers is the answer if all courses were taken, otherwise -1.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges, true); const indeg = new Array(n + 1).fill(0); for (const [, v] of edges) indeg[v]++;
      let layer = []; for (let v = 1; v <= n; v++) if (!indeg[v]) layer.push(v); let s = 0, taken = 0;
      while (layer.length) { s++; taken += layer.length; const next = []; for (const u of layer) for (const v of adj[u]) if (--indeg[v] === 0) next.push(v); layer = next; }
      return String(taken === n ? s : -1);
    },
    tests() {
      const g = rng(945); const out = ['3 2\n1 3\n2 3\n', '3 3\n1 2\n2 3\n3 1\n', '2 1\n1 2\n'];
      for (const [n, m] of [[6, 7], [30, 50], [1000, 1500], [20000, 25000], [20000, 30000], [20000, 5000]]) out.push(graphText(n, DG(g, n, m)));
      for (const [n, m] of [[8, 12], [200, 400], [20000, 21000]]) out.push(graphText(n, CG(g, n, m)));
      const chain = many(19999, (i) => [i + 1, i + 2]); out.push(graphText(20000, chain), graphText(20000, [...chain, [20000, 5]]));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: WDIR_INPUT,
    constraints: ['1 <= n <= 20000', '1 <= m <= 30000', '1 <= w <= 10^9', 'The graph has no directed cycle.', 'There are no self-loops and no repeated edges.'],
    slug: 'longest-path-in-dag',
    title: 'The Heaviest Road in a One-Way Network',
    tags: ['graph', 'topological-sort', 'dp', 'dag'],
    concept: {
      title: 'In a DAG, process the nodes in topological order and pass the best value forward',
      body: [
        'In a general graph the longest path is a hard problem, but in a **directed acyclic graph (DAG)** it is easy. Because there are no cycles, the nodes can be put in a topological order, and a path always goes forward in that order. Let `best[v]` be the weight of the heaviest path that **ends** at `v`. Every path ending at `v` has a last edge `u -> v`, so `best[v] = max(0, best[u] + w for every edge u -> v)`, where 0 stands for a path that consists of the node alone.',
        'If the nodes are processed in topological order, `best[u]` is final when it is used to improve its followers. This is *dynamic programming on a DAG*: each edge is relaxed once. The answer is the largest `best` of all nodes.',
        { code: 'best = [0] * (n + 1)\nfor u in topological_order:\n    for v, w in adj[u]:\n        if best[u] + w > best[v]:\n            best[v] = best[u] + w       # a heavier road to v goes through u\nprint(max(best))' },
        'The topological order comes from Kahn\'s algorithm (the order in which nodes leave the queue). The sums can reach 2 * 10^13 (20000 edges of 10^9), so 64-bit integers are required. Replace `max` by `min` and you get the shortest path in a DAG, which also works with negative weights.'
      ]
    },
    statement: ['A directed graph with `n` nodes and `m` weighted edges has no cycle. The weight of a path is the sum of the weights of its edges (a path of a single node has the weight 0). Print the largest weight of a path in the graph.'],
    outputFormat: ['Print the largest weight.'],
    examples: [{ input: '5 4\n1 2 3\n2 3 4\n1 3 5\n3 4 2\n', note: 'The path 1, 2, 3, 4 has the weight 3 + 4 + 2 = 9, more than 1, 3, 4 with 7: 9.' }],
    hints: ['Find a topological order with Kahn\'s algorithm.', 'Let best[v] be the heaviest path that ends at v; process the nodes in the order and relax every outgoing edge.', 'Print the largest value of best (use 64-bit numbers).'],
    program: {
      io: ['n:int m:int', 'edges:int[m][3]'],
      fast: true,
      python: r`
        adj = [[] for _ in range(n + 1)]
        indeg = [0] * (n + 1)
        for u, v, w in edges:
            adj[u].append((v, w))
            indeg[v] += 1
        queue = [v for v in range(1, n + 1) if indeg[v] == 0]
        best = [0] * (n + 1)
        for u in queue:
            for v, w in adj[u]:
                if best[u] + w > best[v]:
                    best[v] = best[u] + w
                indeg[v] -= 1
                if indeg[v] == 0:
                    queue.append(v)
        print(max(best))`,
      cpp: r`
        vector<vector<pair<int, long long>>> adj(n + 1);
        vector<int> indeg(n + 1, 0);
        for (const vector<long long>& e : edges) {
            adj[e[0]].push_back({(int)e[1], e[2]});
            indeg[e[1]]++;
        }
        vector<int> queue;
        for (int v = 1; v <= n; v++) {
            if (indeg[v] == 0) queue.push_back(v);
        }
        vector<long long> best(n + 1, 0);
        for (size_t i = 0; i < queue.size(); i++) {
            int u = queue[i];
            for (const auto& edge : adj[u]) {
                int v = edge.first;
                if (best[u] + edge.second > best[v]) best[v] = best[u] + edge.second;
                indeg[v]--;
                if (indeg[v] == 0) queue.push_back(v);
            }
        }
        long long answer = 0;
        for (long long value : best) answer = max(answer, value);
        cout << answer << "\n";`,
      java: r`
        int nodes = (int) n;
        List<List<long[]>> adj = new ArrayList<>();
        for (int v = 0; v <= nodes; v++) adj.add(new ArrayList<>());
        int[] indeg = new int[nodes + 1];
        for (long[] e : edges) {
            adj.get((int) e[0]).add(new long[] {e[1], e[2]});
            indeg[(int) e[1]]++;
        }
        List<Integer> queue = new ArrayList<>();
        for (int v = 1; v <= nodes; v++) {
            if (indeg[v] == 0) queue.add(v);
        }
        long[] best = new long[nodes + 1];
        for (int i = 0; i < queue.size(); i++) {
            int u = queue.get(i);
            for (long[] edge : adj.get(u)) {
                int v = (int) edge[0];
                if (best[u] + edge[1] > best[v]) best[v] = best[u] + edge[1];
                indeg[v]--;
                if (indeg[v] == 0) queue.add(v);
            }
        }
        long answer = 0;
        for (long value : best) answer = Math.max(answer, value);
        System.out.println(answer);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['The nodes are taken in topological order (Kahn\'s algorithm); every outgoing edge improves the heaviest path that ends at its target. The answer is the largest value found.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = Array.from({ length: n + 1 }, () => []); const indeg = new Array(n + 1).fill(0); for (const [u, v, w] of edges) { adj[u].push([v, w]); indeg[v]++; }
      const q = []; for (let v = 1; v <= n; v++) if (!indeg[v]) q.push(v); const best = new Array(n + 1).fill(0);
      for (let h = 0; h < q.length; h++) { const u = q[h]; for (const [v, w] of adj[u]) { if (best[u] + w > best[v]) best[v] = best[u] + w; if (--indeg[v] === 0) q.push(v); } }
      return String(Math.max(...best));
    },
    tests() {
      const g = rng(946); const out = ['5 4\n1 2 3\n2 3 4\n1 3 5\n3 4 2\n', '2 1\n2 1 7\n', '3 1\n1 2 1000000000\n'];
      const brute = (input) => { const { n, edges } = parse(input); const adj = Array.from({ length: n + 1 }, () => []); for (const [u, v, w] of edges) adj[u].push([v, w]); const memo = new Map(); const go = (u) => { if (memo.has(u)) return memo.get(u); let best = 0; for (const [v, w] of adj[u]) best = Math.max(best, w + go(v)); memo.set(u, best); return best; }; return String(Math.max(...many(n, (i) => go(i + 1)))); };
      const wdag = (n, m, hi) => graphText(n, shuffle(g, randomDag(g, n, m, [1, hi])));
      crossCheck(() => wdag(randInt(g, 2, 9), randInt(g, 1, 14), 9), (i) => this.solve(i), brute, 300);
      for (const [n, m, hi] of [[6, 7, 9], [30, 60, 100], [1000, 3000, 1000000], [20000, 25000, 1000000000], [20000, 30000, 1000000000], [20000, 20500, 5], [20000, 19999, 1000000000]]) out.push(wdag(n, m, hi));
      out.push(graphText(20000, many(19999, (i) => [i + 1, i + 2, 1000000000])));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `k`, the number of words.', 'The second line has the `k` words, in the order they appear in the alien dictionary.'],
    constraints: ['1 <= k <= 5000', 'Every word has 1 to 20 lowercase letters.'],
    slug: 'alien-dictionary',
    title: 'Find the Order of an Alien Alphabet',
    tags: ['graph', 'topological-sort', 'strings', 'heap'],
    concept: {
      title: 'Two neighbouring words in a dictionary reveal one fact: the first letter where they differ is smaller in the first word',
      body: [
        'Aliens have a dictionary with words sorted in **their** alphabet order, which we do not know. From the sorted list we can learn something about the alphabet. Compare each word with the **next** one: find the first position where they differ; the letter of the first word is **before** the letter of the second word in the alien alphabet. Each such fact is an edge `a -> b` between letters of a graph whose nodes are the letters.',
        'There is one special case. If the next word is a **prefix** of the first word and is shorter (`abc` is followed by `ab`), the list is not in a valid order, whatever the alphabet: print `impossible`.',
        'A topological order of the letter graph is a possible alphabet. To make the answer unique, take, among the letters that can come next, the **smallest** one (Kahn\'s algorithm with a min-heap, as in the course-order task). If the graph has a cycle (`a < b` and `b < a`), the list is contradictory: `impossible`. Only the letters that **appear** in the words are part of the answer.',
        { code: 'edges = set()\nletters = set("".join(words))\nfor first, second in zip(words, words[1:]):\n    for x, y in zip(first, second):\n        if x != y:\n            edges.add((x, y))               # x is before y\n            break\n    else:\n        if len(first) > len(second):\n            impossible                        # "abc" before "ab"\n# then Kahn\'s algorithm on the letters with a min-heap' },
        'Only adjacent words matter: if the list is sorted, the facts from adjacent words imply all the others. With 5000 words of up to 20 letters the whole work is a few hundred thousand steps.'
      ]
    },
    statement: ['A list of words is sorted according to the order of an unknown alphabet (words are compared letter by letter; a word that is a prefix of another comes first). Find an order of the letters that appear in the words that is consistent with the list. If several orders are possible, print the one that is smallest in the normal alphabetical order of letters (compared as strings). If the list cannot be sorted in any alphabet, print `impossible`.'],
    outputFormat: ['The letters in order as one word, or `impossible`.'],
    examples: [{ input: '5\nwrt wrf er ett rftt\n', note: 'The facts are t < f, w < e, r < t and e < r, so the order is w, e, r, t, f: wertf.' }, { input: '2\nabc ab\n', note: 'The word ab is a prefix of abc but stands after it: impossible.' }],
    hints: ['Compare each word with the next one: the first different letters give an edge x -> y.', 'A longer word followed by its own prefix makes the list impossible.', 'Do Kahn\'s algorithm on the letters with a min-heap; if some letter is never taken, there is a cycle.'],
    program: {
      io: ['k:int', 'words:word[k]'],
      fast: true,
      includes: ['<queue>', '<functional>', '<set>', '<map>'],
      python: r`
        import heapq
        letters = sorted(set("".join(words)))
        after = {c: set() for c in letters}
        indeg = {c: 0 for c in letters}
        possible = True
        for first, second in zip(words, words[1:]):
            for x, y in zip(first, second):
                if x != y:
                    if y not in after[x]:
                        after[x].add(y)
                        indeg[y] += 1
                    break
            else:
                if len(first) > len(second):
                    possible = False
        order = []
        if possible:
            heap = [c for c in letters if indeg[c] == 0]
            heapq.heapify(heap)
            while heap:
                c = heapq.heappop(heap)
                order.append(c)
                for d in after[c]:
                    indeg[d] -= 1
                    if indeg[d] == 0:
                        heapq.heappush(heap, d)
        print("".join(order) if possible and len(order) == len(letters) else "impossible")`,
      cpp: r`
        set<char> letterSet;
        for (const string& word : words) {
            for (char c : word) letterSet.insert(c);
        }
        map<char, set<char>> after;
        map<char, int> indeg;
        for (char c : letterSet) indeg[c] = 0;
        bool possible = true;
        for (size_t i = 0; i + 1 < words.size(); i++) {
            const string& first = words[i];
            const string& second = words[i + 1];
            size_t p = 0;
            while (p < first.size() && p < second.size() && first[p] == second[p]) p++;
            if (p < first.size() && p < second.size()) {
                if (!after[first[p]].count(second[p])) {
                    after[first[p]].insert(second[p]);
                    indeg[second[p]]++;
                }
            } else if (first.size() > second.size()) {
                possible = false;
            }
        }
        string order;
        if (possible) {
            priority_queue<char, vector<char>, greater<char>> heap;
            for (char c : letterSet) {
                if (indeg[c] == 0) heap.push(c);
            }
            while (!heap.empty()) {
                char c = heap.top();
                heap.pop();
                order += c;
                for (char d : after[c]) {
                    indeg[d]--;
                    if (indeg[d] == 0) heap.push(d);
                }
            }
        }
        cout << (possible && order.size() == letterSet.size() ? order : string("impossible")) << "\n";`,
      java: r`
        TreeSet<Character> letterSet = new TreeSet<>();
        for (String word : words) {
            for (char c : word.toCharArray()) letterSet.add(c);
        }
        Map<Character, Set<Character>> after = new HashMap<>();
        Map<Character, Integer> indeg = new HashMap<>();
        for (char c : letterSet) {
            after.put(c, new HashSet<>());
            indeg.put(c, 0);
        }
        boolean possible = true;
        for (int i = 0; i + 1 < words.length; i++) {
            String first = words[i], second = words[i + 1];
            int p = 0;
            while (p < first.length() && p < second.length() && first.charAt(p) == second.charAt(p)) p++;
            if (p < first.length() && p < second.length()) {
                char x = first.charAt(p), y = second.charAt(p);
                if (after.get(x).add(y)) indeg.merge(y, 1, Integer::sum);
            } else if (first.length() > second.length()) {
                possible = false;
            }
        }
        StringBuilder order = new StringBuilder();
        if (possible) {
            PriorityQueue<Character> heap = new PriorityQueue<>();
            for (char c : letterSet) {
                if (indeg.get(c) == 0) heap.add(c);
            }
            while (!heap.isEmpty()) {
                char c = heap.poll();
                order.append(c);
                for (char d : after.get(c)) {
                    indeg.merge(d, -1, Integer::sum);
                    if (indeg.get(d) == 0) heap.add(d);
                }
            }
        }
        System.out.println(possible && order.length() == letterSet.size() ? order.toString() : "impossible");`
    },
    solution: { explanation: ['Each pair of neighbouring words gives an order fact between their first different letters (or makes the list impossible if a longer word precedes its prefix). A topological sort of the letters with a min-heap gives the smallest order; a leftover letter means a cycle.'], complexity: 'Time O(total length + 26 * 26), space O(26 * 26).' },
    solve(input) {
      const words = rows(input)[1].split(' '); const letters = [...new Set(words.join(''))].sort(); const after = new Map(letters.map((c) => [c, new Set()])); const indeg = new Map(letters.map((c) => [c, 0]));
      for (let i = 0; i + 1 < words.length; i++) { const a = words[i], b = words[i + 1]; let p = 0; while (p < a.length && p < b.length && a[p] === b[p]) p++; if (p < a.length && p < b.length) { if (!after.get(a[p]).has(b[p])) { after.get(a[p]).add(b[p]); indeg.set(b[p], indeg.get(b[p]) + 1); } } else if (a.length > b.length) return 'impossible'; }
      const heap = new Heap((x, y) => x < y); for (const c of letters) if (!indeg.get(c)) heap.push(c); let order = ''; while (heap.size) { const c = heap.pop(); order += c; for (const d of after.get(c)) { indeg.set(d, indeg.get(d) - 1); if (!indeg.get(d)) heap.push(d); } }
      return order.length === letters.length ? order : 'impossible';
    },
    tests() {
      const g = rng(947); const out = ['5\nwrt wrf er ett rftt\n', '2\nabc ab\n', '2\nz x\n', '3\nz x z\n', '1\nabc\n', '2\nab abc\n'];
      const alphabetWords = (k, letters, maxLen) => { const order = shuffle(g, [...letters]); const rank = new Map(order.map((c, i) => [c, i])); const set = new Set(); while (set.size < k) set.add(randWord(g, randInt(g, 1, maxLen), letters)); const list = [...set].sort((a, b) => { for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return rank.get(a[i]) - rank.get(b[i]); return a.length - b.length; }); return list; };
      for (const [k, letters, len] of [[4, 'abc', 3], [8, 'abcd', 4], [30, 'abcdef', 5], [300, 'abcdefghij', 8], [2000, 'abcdefghijklmnopqrstuvwxyz', 10], [5000, 'abcdefghijklmnopqrstuvwxyz', 20], [5000, 'abc', 20]]) { const list = alphabetWords(Math.min(k, Math.pow(letters.length, Math.min(len, 6))), letters, len); out.push(`${list.length}\n${list.join(' ')}\n`); const broken = list.slice(); if (broken.length >= 2) { const i = randInt(g, 0, broken.length - 2); [broken[i], broken[broken.length - 1]] = [broken[broken.length - 1], broken[i]]; out.push(`${broken.length}\n${broken.join(' ')}\n`); } }
      return out;
    }
  },

  {
    ...medium,
    inputFormat: DIR_INPUT,
    constraints: ['1 <= n <= 300', '1 <= m <= 3000', 'The graph has no directed cycle.', 'There are no self-loops and no repeated edges.'],
    slug: 'all-ancestors-of-nodes',
    title: 'Everyone Who Can Reach a Node',
    tags: ['graph', 'topological-sort', 'dag', 'bitset'],
    concept: {
      title: 'In a DAG the ancestors of a node are its parents together with all their ancestors',
      body: [
        'In a directed acyclic graph, the *ancestors* of a node `v` are all nodes from which `v` can be reached by following edges. A search from every node would repeat a lot of work. Instead, use the order: if the nodes are processed in a **topological order**, then when a node `v` is processed, all of its parents `u` (the nodes with an edge `u -> v`) have **already got their final lists of ancestors**. So `ancestors(v)` is the union, over the parents `u`, of `ancestors(u)` plus `u` itself.',
        'Unions of sets of numbers up to 300 are quick and short with **bitsets**: store the set as one big integer whose bit number `u` is 1 if `u` is in the set. The union is then a single `|` (bitwise or). Python integers can have any number of bits; C++ has `bitset<N>` and Java has `BitSet`.',
        { code: 'ancestors = [0] * (n + 1)                  # a set of nodes as the bits of an integer\nfor v in topological_order:\n    for u in parents[v]:\n        ancestors[v] |= ancestors[u] | (1 << u)    # the parent and all of its ancestors\n# list: [u for u in range(1, n + 1) if ancestors[v] >> u & 1]' },
        'The total work is about `m * n / 64` word operations, tiny for `n <= 300`. The answer can be large (up to `n * (n - 1) / 2` numbers), which is why `n` is small here. The idea of **bitset dynamic programming** is useful far beyond graphs.'
      ]
    },
    statement: ['A directed graph with `n` nodes and `m` edges has no cycle. For every node `v` print one line: the number of its ancestors (nodes that can reach `v` along edges, not counting `v` itself), followed by the ancestors in increasing order.'],
    outputFormat: ['`n` lines: the count and the sorted ancestors of the nodes 1, 2, ..., n.'],
    examples: [{ input: '5 5\n1 2\n1 3\n2 4\n3 4\n4 5\n', note: 'Node 1 has none: "0". Node 4 can be reached from 1, 2 and 3: "3 1 2 3". Node 5: "4 1 2 3 4".' }],
    hints: ['Process the nodes in a topological order.', 'The ancestors of v are the union, over its parents u, of u and the ancestors of u.', 'Keep each set as the bits of an integer (a bitset) so that a union is one operation.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<bitset>'],
      python: J(DIR.python, r`
        parents = [[] for _ in range(n + 1)]
        indeg = [0] * (n + 1)
        for u, v in edges:
            parents[v].append(u)
            indeg[v] += 1
        queue = [v for v in range(1, n + 1) if indeg[v] == 0]
        for u in queue:
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    queue.append(v)
        ancestors = [0] * (n + 1)
        for v in queue:
            for u in parents[v]:
                ancestors[v] |= ancestors[u] | (1 << u)
        out = []
        for v in range(1, n + 1):
            found = [u for u in range(1, n + 1) if ancestors[v] >> u & 1]
            out.append(" ".join(map(str, [len(found)] + found)))
        print("\n".join(out))`),
      cpp: J(DIR.cpp, r`
        vector<vector<int>> parents(n + 1);
        vector<int> indeg(n + 1, 0);
        for (const vector<long long>& e : edges) {
            parents[e[1]].push_back((int)e[0]);
            indeg[e[1]]++;
        }
        vector<int> queue;
        for (int v = 1; v <= n; v++) {
            if (indeg[v] == 0) queue.push_back(v);
        }
        for (size_t i = 0; i < queue.size(); i++) {
            for (int v : adj[queue[i]]) {
                indeg[v]--;
                if (indeg[v] == 0) queue.push_back(v);
            }
        }
        vector<bitset<301>> ancestors(n + 1);
        for (int v : queue) {
            for (int u : parents[v]) {
                ancestors[v] |= ancestors[u];
                ancestors[v].set(u);
            }
        }
        for (int v = 1; v <= n; v++) {
            cout << ancestors[v].count();
            for (int u = 1; u <= n; u++) {
                if (ancestors[v][u]) cout << " " << u;
            }
            cout << "\n";
        }`),
      java: J(DIR.java, r`
        List<List<Integer>> parents = new ArrayList<>();
        for (int v = 0; v <= nodes; v++) parents.add(new ArrayList<>());
        int[] indeg = new int[nodes + 1];
        for (long[] e : edges) {
            parents.get((int) e[1]).add((int) e[0]);
            indeg[(int) e[1]]++;
        }
        List<Integer> queue = new ArrayList<>();
        for (int v = 1; v <= nodes; v++) {
            if (indeg[v] == 0) queue.add(v);
        }
        for (int i = 0; i < queue.size(); i++) {
            for (int v : adj.get(queue.get(i))) {
                indeg[v]--;
                if (indeg[v] == 0) queue.add(v);
            }
        }
        BitSet[] ancestors = new BitSet[nodes + 1];
        for (int v = 0; v <= nodes; v++) ancestors[v] = new BitSet(nodes + 1);
        for (int v : queue) {
            for (int u : parents.get(v)) {
                ancestors[v].or(ancestors[u]);
                ancestors[v].set(u);
            }
        }
        StringBuilder out = new StringBuilder();
        for (int v = 1; v <= nodes; v++) {
            out.append(ancestors[v].cardinality());
            for (int u = ancestors[v].nextSetBit(0); u >= 0; u = ancestors[v].nextSetBit(u + 1)) out.append(" ").append(u);
            out.append("\n");
        }
        System.out.print(out);`)
    },
    solution: { explanation: ['In topological order, the ancestors of a node are the union, over its parents, of each parent and the ancestors of that parent; the sets are stored as bitsets so a union is a single operation.'], complexity: 'Time O(m * n / 64 + n^2), space O(n^2 / 64).' },
    solve(input) {
      const { n, edges } = parse(input); const parents = Array.from({ length: n + 1 }, () => []); for (const [u, v] of edges) parents[v].push(u);
      const memo = new Array(n + 1).fill(null); const stack = []; // a plain search from every node over the reversed edges
      return many(n, (i) => { const v = i + 1; const seen = new Set(); const st = [v]; while (st.length) { const x = st.pop(); for (const p of parents[x]) if (!seen.has(p)) { seen.add(p); st.push(p); } } const list = [...seen].sort((a, b) => a - b); return [list.length, ...list].join(' '); }).join('\n');
    },
    tests() {
      const g = rng(948); const out = ['5 5\n1 2\n1 3\n2 4\n3 4\n4 5\n', '2 1\n2 1\n', '3 1\n1 2\n'];
      for (const [n, m] of [[6, 7], [30, 60], [100, 400], [300, 3000], [300, 1000], [300, 299], [300, 400]]) out.push(graphText(n, DG(g, n, m)));
      out.push(graphText(300, many(299, (i) => [i + 1, i + 2])), graphText(300, many(299, (i) => [300 - i, 299 - i])));
      return out;
    }
  },

  {
    ...dirIn,
    slug: 'eventual-safe-states',
    title: 'Which Nodes Never Lead Into a Cycle?',
    tags: ['graph', 'directed-graph', 'topological-sort', 'cycle'],
    concept: {
      title: 'Run Kahn\'s algorithm backwards: start at the dead ends and take everything that only leads to safe nodes',
      body: [
        'Think of a directed graph as a game: a token moves along edges, and it stops at a node with **no outgoing edge** (a *terminal* node). A node is *safe* if, however the token is moved, it **always** ends at a terminal node after a finite number of steps. A node is **not safe** if some route from it can go round a cycle for ever. So the safe nodes are exactly the nodes from which **no cycle can be reached**.',
        'Find them from the end. A terminal node is safe. A node is safe if **all its out-neighbours are safe**. So count, for every node, the number of its out-neighbours that are not yet known to be safe (initially its out-degree). Start with the terminal nodes (count 0) in a queue; when a node is taken from the queue (it is safe), look at the nodes that **point to it** (in the reversed graph) and decrease their counts; when a count reaches 0, that node is safe, too. It is Kahn\'s algorithm on the **reversed** graph.',
        { code: 'rev = [[] for _ in range(n + 1)]\nremaining = [0] * (n + 1)              # out-neighbours not known to be safe yet\nfor u, v in edges:\n    rev[v].append(u)\n    remaining[u] += 1\nqueue = [v for v in range(1, n + 1) if remaining[v] == 0]    # the terminal nodes\nfor v in queue:\n    for u in rev[v]:\n        remaining[u] -= 1\n        if remaining[u] == 0:\n            queue.append(u)          # all of its out-neighbours are safe now' },
        'The nodes that never reach the queue are the ones that can reach a cycle. The answer is the sorted list of the nodes that did, or `none` when the list is empty. The time is O(n + m).'
      ]
    },
    statement: ['A directed graph has `n` nodes and `m` edges. A node is terminal if it has no outgoing edge. A node is safe if every walk that starts at it ends, after finitely many steps, at a terminal node (so no cycle can be reached from it). Print all the safe nodes in increasing order, or `none` if there is no safe node.'],
    outputFormat: ['The safe nodes on one line, or `none`.'],
    examples: [{ input: '7 7\n1 2\n1 3\n2 3\n2 4\n3 6\n4 1\n5 6\n', note: 'The nodes 1, 2 and 4 lie on the cycle 1, 2, 4 or lead into it. The nodes 3 (leading to the terminal node 6), 5, 6 and 7 are safe: 3 5 6 7.' }],
    hints: ['Reverse the graph and count, for each node, its out-neighbours that are not yet known to be safe.', 'Start with the terminal nodes; taking a safe node lowers the count of the nodes that point to it.', 'The nodes that were taken are the safe ones; print them sorted.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        rev = [[] for _ in range(n + 1)]
        remaining = [0] * (n + 1)
        for u, v in edges:
            rev[v].append(u)
            remaining[u] += 1
        queue = [v for v in range(1, n + 1) if remaining[v] == 0]
        for v in queue:
            for u in rev[v]:
                remaining[u] -= 1
                if remaining[u] == 0:
                    queue.append(u)
        queue.sort()
        print(*queue if queue else ["none"])`,
      cpp: r`
        vector<vector<int>> rev(n + 1);
        vector<int> remaining(n + 1, 0);
        for (const vector<long long>& e : edges) {
            rev[e[1]].push_back((int)e[0]);
            remaining[e[0]]++;
        }
        vector<int> queue;
        for (int v = 1; v <= n; v++) {
            if (remaining[v] == 0) queue.push_back(v);
        }
        for (size_t i = 0; i < queue.size(); i++) {
            for (int u : rev[queue[i]]) {
                remaining[u]--;
                if (remaining[u] == 0) queue.push_back(u);
            }
        }
        sort(queue.begin(), queue.end());
        if (queue.empty()) cout << "none";
        for (size_t i = 0; i < queue.size(); i++) cout << (i ? " " : "") << queue[i];
        cout << "\n";`,
      java: r`
        int nodes = (int) n;
        List<List<Integer>> rev = new ArrayList<>();
        for (int v = 0; v <= nodes; v++) rev.add(new ArrayList<>());
        int[] remaining = new int[nodes + 1];
        for (long[] e : edges) {
            rev.get((int) e[1]).add((int) e[0]);
            remaining[(int) e[0]]++;
        }
        List<Integer> queue = new ArrayList<>();
        for (int v = 1; v <= nodes; v++) {
            if (remaining[v] == 0) queue.add(v);
        }
        for (int i = 0; i < queue.size(); i++) {
            for (int u : rev.get(queue.get(i))) {
                remaining[u]--;
                if (remaining[u] == 0) queue.add(u);
            }
        }
        Collections.sort(queue);
        if (queue.isEmpty()) {
            System.out.println("none");
        } else {
            StringBuilder out = new StringBuilder();
            for (int i = 0; i < queue.size(); i++) out.append(i > 0 ? " " : "").append(queue.get(i));
            System.out.println(out);
        }`
    },
    solution: { explanation: ['Kahn\'s algorithm on the reversed graph: nodes whose out-neighbours are all known to be safe become safe; the terminal nodes start the process. The nodes taken are exactly those from which no cycle can be reached.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges, true);
      const rev = Array.from({ length: n + 1 }, () => []); const remaining = new Array(n + 1).fill(0); for (const [u, v] of edges) { rev[v].push(u); remaining[u]++; }
      const q = []; for (let v = 1; v <= n; v++) if (!remaining[v]) q.push(v); for (let h = 0; h < q.length; h++) for (const u of rev[q[h]]) if (--remaining[u] === 0) q.push(u);
      const safe = q.slice().sort((x, y) => x - y);
      return safe.length ? safe.join(' ') : 'none';
    },
    tests() {
      const g = rng(949); const out = ['7 7\n1 2\n1 3\n2 3\n2 4\n3 6\n4 1\n5 6\n', '2 2\n1 2\n2 1\n', '3 1\n1 2\n'];
      const small = () => { const n = randInt(g, 2, 9); return graphText(n, CG(g, n, randInt(g, 1, Math.min(n * (n - 1), 14)))); };
      const quick = (input) => { const { n, edges } = parse(input); const adj = adjacency(n, edges, true); const state = new Array(n + 1).fill(0); const safe = new Array(n + 1).fill(true); /* a node is unsafe when a cycle is reachable: check by trying to find, for each node, a repeat while walking */ const unsafe = (s) => { const seen = new Set(); const stack = [[s, new Set([s])]]; /* explore all walks with a path set */ const dfs = (v, path) => { for (const w of adj[v]) { if (path.has(w)) return true; path.add(w); if (dfs(w, path)) return true; path.delete(w); } return false; }; return dfs(s, new Set([s])); }; const res = []; for (let v = 1; v <= n; v++) if (!unsafe(v)) res.push(v); return res.length ? res.join(' ') : 'none'; };
      crossCheck(small, (i) => this.solve(i), quick, 300);
      for (const [n, m] of [[6, 7], [30, 40], [1000, 1100], [20000, 20500], [20000, 25000], [20000, 30000]]) out.push(graphText(n, CG(g, n, m)));
      for (const [n, m] of [[1000, 1500], [20000, 25000]]) out.push(graphText(n, DG(g, n, m)));
      const dag = randomDag(g, 20000, 22000); out.push(graphText(20000, shuffle(g, [...dag, [dag[5][1], dag[5][0]]])));
      return out;
    }
  }
];
