import { r, rng, randInt, many, nums, rows, shuffle, randWord } from '../../lib.mjs';
import { randomGrid, gridText } from '../../graphlib.mjs';
import { GRID_INPUT } from '../../graphcode.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const medium = { difficulty: 'medium' };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const parseGrid = (input) => { const rs = rows(input); const [h, w] = nums(rs[0]); return { h, w, cells: rs.slice(1, 1 + h), rs }; };
const inside = (h, w, a, b) => a >= 0 && a < h && b >= 0 && b < w;
const gridIn = (limits) => ({ ...medium, inputFormat: GRID_INPUT, constraints: ['1 <= h, w <= 200', ...limits] });
const numberGrid = (a) => `${a.length} ${a[0].length}\n${a.map((row) => row.join(' ')).join('\n')}\n`;

export default [
  {
    ...gridIn(['Every character is `0` (empty), `1` (a fresh orange) or `2` (a rotten orange).']),
    slug: 'rotting-oranges',
    title: 'How Long Until the Oranges Rot?',
    tags: ['graph', 'grid', 'bfs', 'multi-source'],
    concept: {
      title: 'Spread from all sources at once, one minute per layer',
      body: [
        'In a grid of oranges, every minute each **fresh** orange next to a **rotten** one (up, down, left, right) becomes rotten. How many minutes until no fresh orange is left, or is it impossible? The rotting spreads like a wave from **all the rotten oranges at the same time**: this is a breadth-first search with many starting cells, where each **layer** of the search is one minute.',
        'Put all the rotten oranges into the first layer and count the fresh ones. Process the search layer by layer: the fresh neighbours of the current layer become rotten (and form the next layer); after each layer that is not empty, one more minute has passed. When the layers run out, any fresh orange left can never be reached: the answer is -1.',
        { code: 'fresh = number of "1" cells\nlayer = all the "2" cells\nminutes = 0\nwhile layer and fresh:\n    next_layer = []\n    for x, y in layer:\n        for a, b in neighbours(x, y):\n            if cells[a][b] == "1":\n                cells[a][b] = "2"          # it rots (this also marks it as seen)\n                fresh -= 1\n                next_layer.append((a, b))\n    layer = next_layer\n    minutes += 1\nanswer = minutes if fresh == 0 else -1' },
        'Starting the search from all sources together gives each cell its distance to the **nearest** rotten orange, which is what the wave needs. The same trick (a *multi-source BFS*) is used whenever "the nearest of several things" matters. The loop ends as soon as `fresh` reaches 0, so the answer is the number of the last minute in which an orange rotted (0 if there was no fresh orange at all).'
      ]
    },
    statement: ['A grid has `h` rows and `w` columns. A `0` is an empty cell, a `1` is a fresh orange and a `2` is a rotten orange. Every minute, each fresh orange that is next to a rotten orange (up, down, left or right) becomes rotten. Print the smallest number of minutes after which there is no fresh orange, or -1 if some fresh orange never rots.'],
    outputFormat: ['Print the number of minutes or -1.'],
    examples: [{ input: '3 3\n211\n110\n011\n', note: 'The rot spreads from the top left corner: after 4 minutes all oranges are rotten.' }, { input: '3 3\n211\n011\n101\n', note: 'The orange in the bottom left corner is cut off: -1.' }],
    hints: ['Collect all rotten oranges as the first layer and count the fresh ones.', 'Process the layers one by one; each layer rots its fresh neighbours and takes one minute.', 'If fresh oranges remain at the end, print -1.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        cells = [list(row) for row in grid]
        layer = []
        fresh = 0
        for x in range(h):
            for y in range(w):
                if cells[x][y] == "2":
                    layer.append((x, y))
                elif cells[x][y] == "1":
                    fresh += 1
        minutes = 0
        while layer and fresh:
            next_layer = []
            for x, y in layer:
                for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= a < h and 0 <= b < w and cells[a][b] == "1":
                        cells[a][b] = "2"
                        fresh -= 1
                        next_layer.append((a, b))
            layer = next_layer
            minutes += 1
        print(minutes if fresh == 0 else -1)`,
      cpp: r`
        vector<string> cells = grid;
        vector<pair<int, int>> layer;
        long long fresh = 0;
        for (int x = 0; x < h; x++) {
            for (int y = 0; y < w; y++) {
                if (cells[x][y] == '2') layer.push_back({x, y});
                else if (cells[x][y] == '1') fresh++;
            }
        }
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        long long minutes = 0;
        while (!layer.empty() && fresh > 0) {
            vector<pair<int, int>> next;
            for (const auto& cell : layer) {
                for (int d = 0; d < 4; d++) {
                    int a = cell.first + dx[d], b = cell.second + dy[d];
                    if (a >= 0 && a < h && b >= 0 && b < w && cells[a][b] == '1') {
                        cells[a][b] = '2';
                        fresh--;
                        next.push_back({a, b});
                    }
                }
            }
            layer = next;
            minutes++;
        }
        cout << (fresh == 0 ? minutes : -1) << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        char[][] cells = new char[rowsCount][];
        for (int i = 0; i < rowsCount; i++) cells[i] = grid[i].toCharArray();
        List<int[]> layer = new ArrayList<>();
        long fresh = 0;
        for (int x = 0; x < rowsCount; x++) {
            for (int y = 0; y < colsCount; y++) {
                if (cells[x][y] == '2') layer.add(new int[] {x, y});
                else if (cells[x][y] == '1') fresh++;
            }
        }
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        long minutes = 0;
        while (!layer.isEmpty() && fresh > 0) {
            List<int[]> next = new ArrayList<>();
            for (int[] cell : layer) {
                for (int d = 0; d < 4; d++) {
                    int a = cell[0] + dx[d], b = cell[1] + dy[d];
                    if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount && cells[a][b] == '1') {
                        cells[a][b] = '2';
                        fresh--;
                        next.add(new int[] {a, b});
                    }
                }
            }
            layer = next;
            minutes++;
        }
        System.out.println(fresh == 0 ? minutes : -1);`
    },
    solution: { explanation: ['A search starting from all rotten oranges processes one layer per minute, rotting the fresh neighbours of the layer; the number of layers is the answer if no fresh orange is left, otherwise -1.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) {
      const { h, w, cells } = parseGrid(input); const g2 = cells.map((row) => [...row]); let layer = [], fresh = 0;
      for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) { if (g2[x][y] === '2') layer.push([x, y]); else if (g2[x][y] === '1') fresh++; }
      let minutes = 0; while (layer.length && fresh) { const next = []; for (const [x, y] of layer) for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (inside(h, w, a, b) && g2[a][b] === '1') { g2[a][b] = '2'; fresh--; next.push([a, b]); } } layer = next; minutes++; }
      return String(fresh === 0 ? minutes : -1);
    },
    tests() {
      const g = rng(931); const out = ['3 3\n211\n110\n011\n', '3 3\n211\n011\n101\n', '1 1\n0\n', '1 1\n1\n', '1 1\n2\n', '1 2\n21\n'];
      const brute = (input) => { const { h, w, cells } = parseGrid(input); let c = cells.map((row) => [...row]); let minutes = 0; for (;;) { const fresh = c.flat().filter((x) => x === '1').length; if (!fresh) return String(minutes); const n2 = c.map((row) => [...row]); let changed = false; for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) if (c[x][y] === '1' && DIRS.some(([dx, dy]) => inside(h, w, x + dx, y + dy) && c[x + dx][y + dy] === '2')) { n2[x][y] = '2'; changed = true; } if (!changed) return '-1'; c = n2; minutes++; } };
      crossCheck(() => gridText(randomGrid(g, randInt(g, 1, 6), randInt(g, 1, 6), ['0', '1', '2'], [0.25, 0.55, 0.2])), (i) => this.solve(i), brute, 300);
      for (const [h, w, wt] of [[5, 6, [0.2, 0.6, 0.2]], [12, 12, [0.3, 0.6, 0.1]], [50, 60, [0.1, 0.88, 0.02]], [200, 200, [0.0, 0.998, 0.002]], [200, 200, [0.3, 0.69, 0.01]], [200, 200, [0.45, 0.5, 0.05]], [1, 200, [0.05, 0.9, 0.05]], [200, 1, [0, 0.99, 0.01]], [200, 200, [0.5, 0.5, 0]]]) out.push(gridText(randomGrid(g, h, w, ['0', '1', '2'], wt)));
      out.push(gridText(many(199, (i) => (i % 2 === 0 ? '2' + '1'.repeat(198) : (i % 4 === 1 ? '0'.repeat(198) + '1' : '1' + '0'.repeat(198))))), gridText(many(200, (i) => (i === 0 ? '2'.padEnd(200, '1') : '1'.repeat(200)))), gridText(many(200, () => '2'.repeat(200))));
      return out;
    }
  },

  {
    ...gridIn(['Every character is `0` or `1`, and there is at least one `0`.']),
    slug: 'distance-to-nearest-zero',
    title: 'The Distance to the Nearest Zero',
    tags: ['graph', 'grid', 'bfs', 'multi-source'],
    concept: {
      title: 'Search outwards from every zero at once',
      body: [
        'For every cell of a grid of 0s and 1s, find the **distance to the nearest 0**, counted in steps up, down, left and right. The slow idea, a search from every cell, takes O(cells^2) time. The fast idea turns the question around: start **at the zeros**. All zeros get the distance 0 and form the first layer; the cells next to them get 1, the cells next to those get 2, and so on. It is one breadth-first search with many starting cells (*multi-source BFS*), and the first time a cell is reached, the distance is the shortest one.',
        { code: 'dist = [[-1] * w for _ in range(h)]\nqueue = []\nfor x in range(h):\n    for y in range(w):\n        if grid[x][y] == "0":\n            dist[x][y] = 0\n            queue.append((x, y))\nfor x, y in queue:\n    for a, b in neighbours(x, y):\n        if inside(a, b) and dist[a][b] < 0:\n            dist[a][b] = dist[x][y] + 1\n            queue.append((a, b))' },
        'The distance table doubles as the "seen" marker (-1 means not reached). The total time is O(h * w). This is the standard solution for "distance to the nearest ..." questions on grids, for example the nearest exit, the nearest gate, or the nearest land.'
      ]
    },
    statement: ['A grid of `h` rows and `w` columns contains the digits `0` and `1`, and at least one `0`. For every cell print the smallest number of steps (up, down, left, right) needed to go from that cell to a cell that contains `0`. A cell with `0` has the distance 0.'],
    outputFormat: ['`h` lines of `w` numbers: the distances.'],
    examples: [{ input: '3 3\n011\n111\n111\n', note: 'The only zero is in the corner: the distances grow with the number of steps to it: 0 1 2, 1 2 3, 2 3 4.' }],
    hints: ['Put all cells with 0 in the queue with the distance 0.', 'Take cells from the queue; an unreached neighbour gets the distance of the current cell plus 1.', 'Print the distance table row by row.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        dist = [[-1] * w for _ in range(h)]
        queue = []
        for x in range(h):
            for y in range(w):
                if grid[x][y] == "0":
                    dist[x][y] = 0
                    queue.append((x, y))
        for x, y in queue:
            for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= a < h and 0 <= b < w and dist[a][b] < 0:
                    dist[a][b] = dist[x][y] + 1
                    queue.append((a, b))
        print("\n".join(" ".join(map(str, row)) for row in dist))`,
      cpp: r`
        vector<vector<int>> dist(h, vector<int>(w, -1));
        vector<pair<int, int>> queue;
        for (int x = 0; x < h; x++) {
            for (int y = 0; y < w; y++) {
                if (grid[x][y] == '0') {
                    dist[x][y] = 0;
                    queue.push_back({x, y});
                }
            }
        }
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        for (size_t i = 0; i < queue.size(); i++) {
            int x = queue[i].first, y = queue[i].second;
            for (int d = 0; d < 4; d++) {
                int a = x + dx[d], b = y + dy[d];
                if (a >= 0 && a < h && b >= 0 && b < w && dist[a][b] < 0) {
                    dist[a][b] = dist[x][y] + 1;
                    queue.push_back({a, b});
                }
            }
        }
        for (int x = 0; x < h; x++) {
            for (int y = 0; y < w; y++) cout << (y ? " " : "") << dist[x][y];
            cout << "\n";
        }`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        int[][] dist = new int[rowsCount][colsCount];
        for (int[] row : dist) Arrays.fill(row, -1);
        List<int[]> queue = new ArrayList<>();
        for (int x = 0; x < rowsCount; x++) {
            for (int y = 0; y < colsCount; y++) {
                if (grid[x].charAt(y) == '0') {
                    dist[x][y] = 0;
                    queue.add(new int[] {x, y});
                }
            }
        }
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        for (int i = 0; i < queue.size(); i++) {
            int x = queue.get(i)[0], y = queue.get(i)[1];
            for (int d = 0; d < 4; d++) {
                int a = x + dx[d], b = y + dy[d];
                if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount && dist[a][b] < 0) {
                    dist[a][b] = dist[x][y] + 1;
                    queue.add(new int[] {a, b});
                }
            }
        }
        StringBuilder out = new StringBuilder();
        for (int x = 0; x < rowsCount; x++) {
            for (int y = 0; y < colsCount; y++) out.append(y > 0 ? " " : "").append(dist[x][y]);
            out.append("\n");
        }
        System.out.print(out);`
    },
    solution: { explanation: ['A multi-source breadth-first search starts from all the zero cells with distance 0; every other cell gets the distance of the cell that reached it first plus one.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) {
      const { h, w, cells } = parseGrid(input); const dist = cells.map((row) => [...row].map(() => -1)); const q = [];
      for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) if (cells[x][y] === '0') { dist[x][y] = 0; q.push([x, y]); }
      for (let i = 0; i < q.length; i++) { const [x, y] = q[i]; for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (inside(h, w, a, b) && dist[a][b] < 0) { dist[a][b] = dist[x][y] + 1; q.push([a, b]); } } }
      return dist.map((row) => row.join(' ')).join('\n');
    },
    tests() {
      const g = rng(932); const out = ['3 3\n011\n111\n111\n', '1 1\n0\n', '1 3\n101\n'];
      const brute = (input) => { const { h, w, cells } = parseGrid(input); const zeros = []; for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) if (cells[x][y] === '0') zeros.push([x, y]); return many(h, (x) => many(w, (y) => Math.min(...zeros.map(([a, b]) => Math.abs(a - x) + Math.abs(b - y)))).join(' ')).join('\n'); };
      const make = (h, w, p0) => { const cells = randomGrid(g, h, w, ['0', '1'], [p0, 1 - p0]); if (!cells.some((row) => row.includes('0'))) cells[0] = '0' + cells[0].slice(1); return gridText(cells); };
      crossCheck(() => make(randInt(g, 1, 7), randInt(g, 1, 7), 0.2), (i) => this.solve(i), brute, 300);
      for (const [h, w, p] of [[5, 6, 0.3], [12, 12, 0.1], [60, 80, 0.02], [200, 200, 0.5], [200, 200, 0.01], [200, 200, 0.0005], [1, 200, 0.05], [200, 1, 0.05]]) out.push(make(h, w, p));
      out.push(gridText([`0${'1'.repeat(199)}`, ...many(199, () => '1'.repeat(200))]), gridText(many(200, () => '0'.repeat(200))));
      return out;
    }
  },

  {
    ...gridIn(['Every character is `0` (water) or `1` (land).', 'The grid has exactly two islands (groups of land cells connected through their sides).']),
    slug: 'shortest-bridge',
    title: 'Build the Shortest Bridge',
    tags: ['graph', 'grid', 'bfs', 'multi-source'],
    concept: {
      title: 'Flood one island, then grow it layer by layer until it touches the other',
      body: [
        'The map has exactly **two islands**. You may change water cells into land. What is the smallest number of water cells you must change to connect the two islands with a land path? It is the length (counted in water cells) of the **shortest path over water** from one island to the other.',
        'Do it in two steps. **Step 1:** find one land cell, flood-fill its island, and remember all its cells. **Step 2:** run a breadth-first search **starting from all cells of that island at once**, spreading over water layer by layer. Each layer adds one more row of water cells to the bridge. When the search first touches a land cell that is **not** in the first island, it has reached the second island; the number of the layer tells how many water cells the bridge needed.',
        { code: 'find any land cell and flood-fill its island: mark the cells as seen, put them in `layer`\nsteps = 0\nwhile layer:\n    next_layer = []\n    for x, y in layer:\n        for a, b in neighbours(x, y):\n            if inside(a, b) and not seen[a][b]:\n                if grid[a][b] == "1":\n                    answer = steps            # the other island: done\n                seen[a][b] = True\n                next_layer.append((a, b))\n    layer = next_layer\n    steps += 1' },
        'This idea, "flood the first object, then grow it with a BFS until the second object is found", is the way to find the **shortest distance between two groups**. The time is O(h * w).'
      ]
    },
    statement: ['A grid of `h` rows and `w` columns has land (`1`) and water (`0`). It contains exactly two islands, where an island is a group of land cells connected through their sides. You may turn water cells into land. Print the smallest number of water cells that must be turned into land so that the two islands become one island.'],
    outputFormat: ['Print the number of cells.'],
    examples: [{ input: '3 3\n010\n000\n001\n', note: 'The islands are the cell (1, 2) and the cell (3, 3). Turning the cells (2, 2) and (2, 3) into land joins them: 2.' }],
    hints: ['Find one land cell and flood its island; remember its cells.', 'Run a breadth-first search from all these cells at once, through water cells, one layer at a time.', 'The first land cell that is not in the first island ends the search; the number of completed layers is the answer.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        seen = [[False] * w for _ in range(h)]
        layer = []
        for x in range(h):
            for y in range(w):
                if grid[x][y] == "1" and not layer:
                    seen[x][y] = True
                    stack = [(x, y)]
                    while stack:
                        p, q = stack.pop()
                        layer.append((p, q))
                        for a, b in ((p + 1, q), (p - 1, q), (p, q + 1), (p, q - 1)):
                            if 0 <= a < h and 0 <= b < w and grid[a][b] == "1" and not seen[a][b]:
                                seen[a][b] = True
                                stack.append((a, b))
        steps = 0
        answer = -1
        while layer and answer < 0:
            next_layer = []
            for x, y in layer:
                for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= a < h and 0 <= b < w and not seen[a][b]:
                        if grid[a][b] == "1":
                            answer = steps
                        seen[a][b] = True
                        next_layer.append((a, b))
            layer = next_layer
            steps += 1
        print(answer)`,
      cpp: r`
        vector<vector<char>> seen(h, vector<char>(w, 0));
        vector<pair<int, int>> layer;
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        for (int x = 0; x < h; x++) {
            for (int y = 0; y < w; y++) {
                if (grid[x][y] == '1' && layer.empty()) {
                    seen[x][y] = 1;
                    vector<pair<int, int>> stack = {{x, y}};
                    while (!stack.empty()) {
                        pair<int, int> cell = stack.back();
                        stack.pop_back();
                        layer.push_back(cell);
                        for (int d = 0; d < 4; d++) {
                            int a = cell.first + dx[d], b = cell.second + dy[d];
                            if (a >= 0 && a < h && b >= 0 && b < w && grid[a][b] == '1' && !seen[a][b]) {
                                seen[a][b] = 1;
                                stack.push_back({a, b});
                            }
                        }
                    }
                }
            }
        }
        long long steps = 0, answer = -1;
        while (!layer.empty() && answer < 0) {
            vector<pair<int, int>> next;
            for (const auto& cell : layer) {
                for (int d = 0; d < 4; d++) {
                    int a = cell.first + dx[d], b = cell.second + dy[d];
                    if (a >= 0 && a < h && b >= 0 && b < w && !seen[a][b]) {
                        if (grid[a][b] == '1') answer = steps;
                        seen[a][b] = 1;
                        next.push_back({a, b});
                    }
                }
            }
            layer = next;
            steps++;
        }
        cout << answer << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        boolean[][] seen = new boolean[rowsCount][colsCount];
        List<int[]> layer = new ArrayList<>();
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        for (int x = 0; x < rowsCount; x++) {
            for (int y = 0; y < colsCount; y++) {
                if (grid[x].charAt(y) == '1' && layer.isEmpty()) {
                    seen[x][y] = true;
                    ArrayList<int[]> stack = new ArrayList<>();
                    stack.add(new int[] {x, y});
                    while (!stack.isEmpty()) {
                        int[] cell = stack.remove(stack.size() - 1);
                        layer.add(cell);
                        for (int d = 0; d < 4; d++) {
                            int a = cell[0] + dx[d], b = cell[1] + dy[d];
                            if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount && grid[a].charAt(b) == '1' && !seen[a][b]) {
                                seen[a][b] = true;
                                stack.add(new int[] {a, b});
                            }
                        }
                    }
                }
            }
        }
        long steps = 0, answer = -1;
        while (!layer.isEmpty() && answer < 0) {
            List<int[]> next = new ArrayList<>();
            for (int[] cell : layer) {
                for (int d = 0; d < 4; d++) {
                    int a = cell[0] + dx[d], b = cell[1] + dy[d];
                    if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount && !seen[a][b]) {
                        if (grid[a].charAt(b) == '1') answer = steps;
                        seen[a][b] = true;
                        next.add(new int[] {a, b});
                    }
                }
            }
            layer = next;
            steps++;
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['The first island is flooded and becomes the first layer of a breadth-first search over water; the layer in which a land cell outside the first island is touched gives the number of water cells to change.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) {
      const { h, w, cells } = parseGrid(input); const comp = landGroups(h, w, cells); const lands = []; for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) if (cells[x][y] === '1') lands.push([x, y, comp[x][y]]);
      // the closest pair of land cells that belong to different islands; the bridge needs one cell less than their distance
      let best = Infinity; for (const [x, y, c] of lands) for (const [a, b, d] of lands) if (c !== d) best = Math.min(best, Math.abs(x - a) + Math.abs(y - b) - 1);
      return String(best);
    },
    tests() {
      const g = rng(933); const out = ['3 3\n010\n000\n001\n', '1 3\n101\n', '2 3\n100\n001\n'];
      for (const [h, w, s1, s2] of [[5, 5, 3, 2], [8, 10, 8, 6], [20, 20, 40, 30], [40, 40, 120, 90], [1, 50, 3, 3], [30, 3, 10, 10]]) out.push(twoIslands(g, h, w, s1, s2));
      for (const [h, w, s1, s2] of [[100, 100, 1500, 1200], [200, 200, 3000, 2500]]) out.push(twoIslands(g, h, w, s1, s2));
      out.push(gridText(['1' + '0'.repeat(198) + '0', ...many(198, () => '0'.repeat(200)), '0'.repeat(199) + '1']), gridText([`1${'0'.repeat(198)}1`]), gridText(many(200, (i) => (i === 0 ? '1'.repeat(200) : (i === 199 ? '1'.repeat(200) : '0'.repeat(200))))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: [...GRID_INPUT, 'The next line has `r` and `c`: the row and the column of the entrance (counted from 1).'],
    constraints: ['1 <= h, w <= 200', 'Every character is `.` (an open cell) or `+` (a wall).', 'The entrance is an open cell.'],
    slug: 'nearest-exit-in-maze',
    title: 'The Nearest Way Out of the Maze',
    tags: ['graph', 'grid', 'bfs', 'shortest-path'],
    concept: {
      title: 'The shortest way out is the first border cell the search reaches',
      body: [
        'A maze is a grid of open cells (`.`) and walls (`+`). You stand at the **entrance**, an open cell, and may walk one step up, down, left or right through open cells. An **exit** is any open cell on the border of the grid, **except the entrance itself**. What is the smallest number of steps to an exit?',
        'This is a plain breadth-first search from the entrance. The layers are the numbers of steps, so the **first border cell** that the search meets (other than the entrance) is the nearest exit, and its layer number is the answer. If the search ends without meeting one, there is no way out: -1.',
        { code: 'seen[sr][sc] = True\nlayer = [(sr, sc)]\nsteps = 0\nwhile layer:\n    steps += 1\n    next_layer = []\n    for x, y in layer:\n        for a, b in neighbours(x, y):\n            if inside(a, b) and grid[a][b] == "." and not seen[a][b]:\n                if a in (0, h - 1) or b in (0, w - 1):\n                    answer = steps           # the first exit found is the nearest\n                seen[a][b] = True\n                next_layer.append((a, b))\n    layer = next_layer' },
        'The entrance is marked as seen at the start, so that it is never counted as an exit even if it lies on the border. Stopping at the first exit is correct because the layers are visited in order of distance.'
      ]
    },
    statement: ['A maze is a grid of `h` rows and `w` columns of open cells (`.`) and walls (`+`). You are at the entrance `(r, c)` (counted from 1), an open cell. In one step you move to a neighbouring open cell (up, down, left or right). An exit is an open cell on the border of the grid that is not the entrance. Print the smallest number of steps to reach an exit, or -1 if there is no exit you can reach.'],
    outputFormat: ['Print the number of steps or -1.'],
    examples: [{ input: '3 4\n++.+\n...+\n+++.\n2 3\n', note: 'From the cell (2, 3) one step up reaches the open cell (1, 3) on the border: 1.' }],
    hints: ['Run a breadth-first search from the entrance and mark it as seen first.', 'When you step on an open border cell, you have found an exit.', 'The layer number at that moment is the answer; if the search ends, print -1.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]', 'sr:int sc:int'],
      fast: true,
      python: r`
        sr -= 1
        sc -= 1
        seen = [[False] * w for _ in range(h)]
        seen[sr][sc] = True
        layer = [(sr, sc)]
        steps = 0
        answer = -1
        while layer and answer < 0:
            steps += 1
            next_layer = []
            for x, y in layer:
                for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= a < h and 0 <= b < w and grid[a][b] == "." and not seen[a][b]:
                        if a == 0 or a == h - 1 or b == 0 or b == w - 1:
                            answer = steps
                        seen[a][b] = True
                        next_layer.append((a, b))
            layer = next_layer
        print(answer)`,
      cpp: r`
        vector<vector<char>> seen(h, vector<char>(w, 0));
        int startRow = (int)sr - 1, startCol = (int)sc - 1;
        seen[startRow][startCol] = 1;
        vector<pair<int, int>> layer = {{startRow, startCol}};
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        long long steps = 0, answer = -1;
        while (!layer.empty() && answer < 0) {
            steps++;
            vector<pair<int, int>> next;
            for (const auto& cell : layer) {
                for (int d = 0; d < 4; d++) {
                    int a = cell.first + dx[d], b = cell.second + dy[d];
                    if (a >= 0 && a < h && b >= 0 && b < w && grid[a][b] == '.' && !seen[a][b]) {
                        if (a == 0 || a == h - 1 || b == 0 || b == w - 1) answer = steps;
                        seen[a][b] = 1;
                        next.push_back({a, b});
                    }
                }
            }
            layer = next;
        }
        cout << answer << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        boolean[][] seen = new boolean[rowsCount][colsCount];
        int startRow = (int) sr - 1, startCol = (int) sc - 1;
        seen[startRow][startCol] = true;
        List<int[]> layer = new ArrayList<>();
        layer.add(new int[] {startRow, startCol});
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        long steps = 0, answer = -1;
        while (!layer.isEmpty() && answer < 0) {
            steps++;
            List<int[]> next = new ArrayList<>();
            for (int[] cell : layer) {
                for (int d = 0; d < 4; d++) {
                    int a = cell[0] + dx[d], b = cell[1] + dy[d];
                    if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount && grid[a].charAt(b) == '.' && !seen[a][b]) {
                        if (a == 0 || a == rowsCount - 1 || b == 0 || b == colsCount - 1) answer = steps;
                        seen[a][b] = true;
                        next.add(new int[] {a, b});
                    }
                }
            }
            layer = next;
        }
        System.out.println(answer);`
    },
    solution: { explanation: ['A breadth-first search from the entrance (marked as seen at the start) proceeds layer by layer; the first open border cell reached gives the number of steps.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) {
      const { h, w, cells, rs } = parseGrid(input); const [sr, sc] = nums(rs[1 + h]); const dist = cells.map((row) => [...row].map(() => -1)); dist[sr - 1][sc - 1] = 0; const q = [[sr - 1, sc - 1]];
      for (let i = 0; i < q.length; i++) { const [x, y] = q[i]; for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (inside(h, w, a, b) && cells[a][b] === '.' && dist[a][b] < 0) { dist[a][b] = dist[x][y] + 1; q.push([a, b]); } } }
      let best = Infinity; for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) if ((x === 0 || y === 0 || x === h - 1 || y === w - 1) && dist[x][y] > 0) best = Math.min(best, dist[x][y]);
      return String(best === Infinity ? -1 : best);
    },
    tests() {
      const g = rng(934); const out = ['3 4\n++.+\n...+\n+++.\n2 3\n', '1 1\n.\n1 1\n', '1 2\n..\n1 1\n', '3 3\n+++\n+.+\n+++\n2 2\n'];
      const make = (h, w, pWall) => { const cells = randomGrid(g, h, w, ['.', '+'], [1 - pWall, pWall]); const open = []; cells.forEach((row, x) => [...row].forEach((c, y) => { if (c === '.') open.push([x, y]); })); if (!open.length) { cells[0] = '.' + cells[0].slice(1); open.push([0, 0]); } const [x, y] = open[randInt(g, 0, open.length - 1)]; return `${gridText(cells)}${x + 1} ${y + 1}\n`; };
      for (const [h, w, p] of [[4, 5, 0.3], [10, 10, 0.4], [30, 40, 0.35], [200, 200, 0.3], [200, 200, 0.42], [200, 200, 0.5], [1, 200, 0.1], [200, 1, 0.1], [3, 200, 0.2]]) for (let t = 0; t < 2; t++) out.push(make(h, w, p));
      // a walled room with a spiral corridor: the way out is long
      const spiral = many(199, (x) => many(199, (y) => { const ring = Math.min(x, y, 198 - x, 198 - y); return ring % 2 === 0 ? '+' : '.'; }).join('')); out.push(`${gridText(spiral)}100 100\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `n`, the size of the board.', 'Each of the next `n` lines has `n` numbers: the board from the top row to the bottom row. A number is -1 (no snake or ladder) or the number of the square where the snake or ladder leads.'],
    constraints: ['2 <= n <= 100', 'Every number is -1 or between 1 and n * n.', 'The first square (bottom left) and the last square have the number -1.'],
    slug: 'snakes-and-ladders',
    title: 'Snakes and Ladders With the Fewest Throws',
    tags: ['graph', 'bfs', 'shortest-path', 'implicit-graph'],
    concept: {
      title: 'The squares are nodes; a throw of the dice gives up to six edges, and a snake or ladder redirects one',
      body: [
        'The board has `n x n` squares numbered `1` to `n * n`. The numbering starts at the **bottom left** corner and goes along the bottom row to the right, then along the next row upwards **to the left**, and so on, in a zigzag. From the square `s` you throw a die and move to one of the squares `s + 1, ..., s + 6` (not beyond the last square). If the square you land on has a snake or a ladder, you slide to its other end (only once: you do not follow a second snake or ladder from there). What is the smallest number of throws to reach the last square?',
        'The squares are the nodes, and the edges are the possible throws, so this is a breadth-first search on `n * n` nodes, with up to six edges each. The only awkward part is the **zigzag numbering**: to find what the board holds at the square `s`, convert it to a row and a column:',
        { code: 'def position(s):                       # s is counted from 1\n    row_from_bottom = (s - 1) // n\n    col = (s - 1) % n\n    if row_from_bottom % 2 == 1:        # odd rows run from right to left\n        col = n - 1 - col\n    return n - 1 - row_from_bottom, col    # the row in the input counts from the top' },
        'The distance array indexed by the square number is the "seen" array. If the last square cannot be reached (it can happen when snakes pull you back from every throw), the answer is -1.'
      ]
    },
    statement: ['A board of `n x n` squares is numbered from 1 at the bottom left corner: the bottom row goes from left to right, the next row from right to left, and so on, in a zigzag, up to `n * n`. You start on square 1. In one throw you move to any square `s + 1, ..., s + 6` that exists. If you land on a square that has a snake or a ladder (a number different from -1), you move to the square that number tells (and stay there, whatever that square holds). Print the smallest number of throws needed to reach the square `n * n`, or -1 if it cannot be reached.'],
    outputFormat: ['Print the number of throws or -1.'],
    examples: [{ input: '6\n-1 -1 -1 -1 -1 -1\n-1 -1 -1 -1 -1 -1\n-1 -1 -1 -1 -1 -1\n-1 35 -1 -1 13 -1\n-1 -1 -1 -1 -1 -1\n-1 15 -1 -1 -1 -1\n', note: 'A shortest way: throw to square 2 (a ladder to 15), throw to square 17 (a snake to 13), throw to square 14 (a ladder to 35), throw to square 36: 4 throws.' }],
    hints: ['Write a function that turns a square number into a row and a column of the board.', 'Run a breadth-first search over the square numbers; from s try s + 1, ..., s + 6.', 'If the landing square has a number other than -1, go to that square instead.'],
    program: {
      io: ['n:int', 'board:int[n][n]'],
      fast: true,
      python: r`
        total = n * n
        dist = [-1] * (total + 1)
        dist[1] = 0
        queue = [1]
        for s in queue:
            for t in range(s + 1, min(s + 6, total) + 1):
                row_from_bottom = (t - 1) // n
                col = (t - 1) % n
                if row_from_bottom % 2 == 1:
                    col = n - 1 - col
                value = board[n - 1 - row_from_bottom][col]
                nxt = value if value != -1 else t
                if dist[nxt] < 0:
                    dist[nxt] = dist[s] + 1
                    queue.append(nxt)
        print(dist[total])`,
      cpp: r`
        long long total = n * n;
        vector<long long> dist(total + 1, -1);
        dist[1] = 0;
        vector<long long> queue = {1};
        for (size_t i = 0; i < queue.size(); i++) {
            long long s = queue[i];
            for (long long t = s + 1; t <= min(s + 6, total); t++) {
                long long rowFromBottom = (t - 1) / n;
                long long col = (t - 1) % n;
                if (rowFromBottom % 2 == 1) col = n - 1 - col;
                long long value = board[n - 1 - rowFromBottom][col];
                long long next = value != -1 ? value : t;
                if (dist[next] < 0) {
                    dist[next] = dist[s] + 1;
                    queue.push_back(next);
                }
            }
        }
        cout << dist[total] << "\n";`,
      java: r`
        int size = (int) n;
        int total = size * size;
        int[] dist = new int[total + 1];
        Arrays.fill(dist, -1);
        dist[1] = 0;
        List<Integer> queue = new ArrayList<>();
        queue.add(1);
        for (int i = 0; i < queue.size(); i++) {
            int s = queue.get(i);
            for (int t = s + 1; t <= Math.min(s + 6, total); t++) {
                int rowFromBottom = (t - 1) / size;
                int col = (t - 1) % size;
                if (rowFromBottom % 2 == 1) col = size - 1 - col;
                long value = board[size - 1 - rowFromBottom][col];
                int next = value != -1 ? (int) value : t;
                if (dist[next] < 0) {
                    dist[next] = dist[s] + 1;
                    queue.add(next);
                }
            }
        }
        System.out.println(dist[total]);`,
      includes: ['<algorithm>']
    },
    solution: { explanation: ['A breadth-first search over the square numbers: from s the throws lead to s + 1 .. s + 6; the square number is converted to a board position with the zigzag rule, and a snake or ladder replaces the landing square by its other end.'], complexity: 'Time O(n^2), space O(n^2).' },
    solve(input) {
      const rs = rows(input); const n = Number(rs[0]); const board = many(n, (i) => nums(rs[i + 1])); const total = n * n; const dist = new Array(total + 1).fill(-1); dist[1] = 0; const q = [1];
      const at = (t) => { const rb = Math.floor((t - 1) / n); let col = (t - 1) % n; if (rb % 2 === 1) col = n - 1 - col; return board[n - 1 - rb][col]; };
      for (let i = 0; i < q.length; i++) { const s = q[i]; for (let t = s + 1; t <= Math.min(s + 6, total); t++) { const v = at(t); const nx = v !== -1 ? v : t; if (dist[nx] < 0) { dist[nx] = dist[s] + 1; q.push(nx); } } }
      return String(dist[total]);
    },
    tests() {
      const g = rng(935); const out = ['6\n-1 -1 -1 -1 -1 -1\n-1 -1 -1 -1 -1 -1\n-1 -1 -1 -1 -1 -1\n-1 35 -1 -1 13 -1\n-1 -1 -1 -1 -1 -1\n-1 15 -1 -1 -1 -1\n', '2\n-1 -1\n-1 -1\n', '3\n-1 -1 -1\n-1 -1 -1\n-1 -1 -1\n'];
      const make = (n, p) => { const total = n * n; const squares = new Array(total + 1).fill(-1); for (let s = 2; s < total; s++) if (g() < p) squares[s] = randInt(g, 1, total); const board = many(n, () => new Array(n).fill(-1)); for (let s = 1; s <= total; s++) { const rb = Math.floor((s - 1) / n); let col = (s - 1) % n; if (rb % 2 === 1) col = n - 1 - col; board[n - 1 - rb][col] = squares[s]; } return `${n}\n${board.map((row) => row.join(' ')).join('\n')}\n`; };
      for (const [n, p] of [[3, 0.2], [5, 0.15], [10, 0.1], [10, 0.3], [30, 0.1], [50, 0.2], [100, 0.1], [100, 0.4], [100, 0.01], [100, 0.7]]) out.push(make(n, p));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has the target `target` (4 digits).', 'The second line has `k`, the number of dead ends.', 'The third line has the `k` dead ends (4 digits each).'],
    constraints: ['1 <= k <= 500', 'All strings have exactly 4 digits.'],
    slug: 'open-the-lock',
    title: 'Open the Lock With the Fewest Turns',
    tags: ['graph', 'bfs', 'implicit-graph', 'strings'],
    concept: {
      title: 'A state space: the combinations are nodes, a turn of one wheel is an edge',
      body: [
        'A lock has 4 wheels with the digits 0 to 9. One move turns one wheel by one step up or down, and the digit wraps around (9 to 0 and 0 to 9). The lock shows `0000` at the start. Some combinations are *dead ends*: if the lock shows one, it jams and you cannot move any more. What is the smallest number of moves to show the `target`?',
        'There are only `10^4 = 10000` combinations, and each has 8 neighbours (4 wheels times two directions). The combinations are the nodes of an implicit graph, so a breadth-first search from `0000` finds the answer. Dead ends are simply **nodes that must not be entered** (and if `0000` itself is a dead end, you cannot even start).',
        { code: 'dead = set(dead_ends)\nif "0000" in dead:\n    answer = -1\nelse:\n    dist = {"0000": 0}\n    queue = ["0000"]\n    for state in queue:\n        for i in range(4):\n            for d in (1, 9):                         # +1 and -1 modulo 10\n                nxt = state[:i] + str((int(state[i]) + d) % 10) + state[i + 1:]\n                if nxt not in dist and nxt not in dead:\n                    dist[nxt] = dist[state] + 1\n                    queue.append(nxt)\n    answer = dist.get(target, -1)' },
        'Strings are convenient states here, as dictionary keys; in a program that must be faster, the state is an integer from 0 to 9999 and the distance array has 10000 places. Either way the search touches each combination once.'
      ]
    },
    statement: ['A lock has 4 wheels, each with the digits 0 to 9. In one move you turn one wheel one step (9 to 0 or 0 to 9 are also one step). The lock starts at `0000`. If it shows a combination from the list of dead ends, it stops and you cannot move any more. Print the smallest number of moves needed to show the combination `target`, or -1 if it is impossible.'],
    outputFormat: ['Print the number of moves or -1.'],
    examples: [{ input: '0202\n5\n0201 0101 0102 1212 2002\n', note: 'One shortest way is 0000, 1000, 1100, 1200, 1201, 1202, 0202: 6 moves.' }],
    hints: ['The combinations are nodes; each has 8 neighbours.', 'Do not enter a dead end; if the start is a dead end the answer is -1.', 'Run a breadth-first search from 0000 and print the distance of the target.'],
    program: {
      io: ['target:word', 'k:int', 'dead:word[k]'],
      fast: true,
      includes: ['<set>', '<map>'],
      python: r`
        blocked = set(dead)
        if "0000" in blocked:
            print(-1)
        else:
            dist = {"0000": 0}
            queue = ["0000"]
            for state in queue:
                for i in range(4):
                    for step in (1, 9):
                        nxt = state[:i] + str((int(state[i]) + step) % 10) + state[i + 1:]
                        if nxt not in dist and nxt not in blocked:
                            dist[nxt] = dist[state] + 1
                            queue.append(nxt)
            print(dist.get(target, -1))`,
      cpp: r`
        set<string> blocked(dead.begin(), dead.end());
        if (blocked.count("0000")) {
            cout << -1 << "\n";
        } else {
            map<string, int> dist;
            dist["0000"] = 0;
            vector<string> queue = {"0000"};
            for (size_t q = 0; q < queue.size(); q++) {
                string state = queue[q];
                for (int i = 0; i < 4; i++) {
                    for (int step : {1, 9}) {
                        string next = state;
                        next[i] = (char)('0' + (state[i] - '0' + step) % 10);
                        if (!dist.count(next) && !blocked.count(next)) {
                            dist[next] = dist[state] + 1;
                            queue.push_back(next);
                        }
                    }
                }
            }
            cout << (dist.count(target) ? dist[target] : -1) << "\n";
        }`,
      java: r`
        Set<String> blocked = new HashSet<>(Arrays.asList(dead));
        if (blocked.contains("0000")) {
            System.out.println(-1);
        } else {
            Map<String, Integer> dist = new HashMap<>();
            dist.put("0000", 0);
            List<String> queue = new ArrayList<>();
            queue.add("0000");
            for (int q = 0; q < queue.size(); q++) {
                String state = queue.get(q);
                for (int i = 0; i < 4; i++) {
                    for (int step : new int[] {1, 9}) {
                        char[] chars = state.toCharArray();
                        chars[i] = (char) ('0' + (state.charAt(i) - '0' + step) % 10);
                        String next = new String(chars);
                        if (!dist.containsKey(next) && !blocked.contains(next)) {
                            dist.put(next, dist.get(state) + 1);
                            queue.add(next);
                        }
                    }
                }
            }
            System.out.println(dist.containsKey(target) ? dist.get(target) : -1);
        }`
    },
    solution: { explanation: ['A breadth-first search over the 10000 combinations, starting at 0000, never entering a dead end; the distance of the target is the answer, or -1 if it is not reached.'], complexity: 'Time O(10^4 * 8), space O(10^4).' },
    solve(input) {
      const rs = rows(input); const target = rs[0]; const blocked = new Set(rs[2].split(' ')); if (blocked.has('0000')) return '-1'; const dist = new Map([['0000', 0]]); const q = ['0000'];
      for (let h = 0; h < q.length; h++) for (let i = 0; i < 4; i++) for (const step of [1, 9]) { const s = q[h]; const nx = s.slice(0, i) + String((Number(s[i]) + step) % 10) + s.slice(i + 1); if (!dist.has(nx) && !blocked.has(nx)) { dist.set(nx, dist.get(s) + 1); q.push(nx); } }
      return String(dist.has(target) ? dist.get(target) : -1);
    },
    tests() {
      const g = rng(936); const out = ['0202\n5\n0201 0101 0102 1212 2002\n', '8888\n1\n8887\n', '0000\n1\n1111\n', '0009\n1\n0000\n', '8888\n8\n0001 0010 0100 1000 9000 0900 0090 0009\n'];
      const code = () => many(4, () => String(randInt(g, 0, 9))).join('');
      for (const [k, spread] of [[5, 1], [20, 1], [100, 1], [500, 1], [500, 1], [500, 1]]) { const dead = new Set(); while (dead.size < k) { const c = code(); if (c !== '0000') dead.add(c); } out.push(`${code()}\n${k}\n${[...dead].join(' ')}\n`); }
      // a ring of dead ends around the start, with a gap, and a complete ring
      const ring = ['1000', '9000', '0100', '0900', '0010', '0090', '0001', '0009']; out.push(`5555\n8\n${ring.join(' ')}\n`, `5555\n7\n${ring.slice(1).join(' ')}\n`);
      const around = []; for (const a of [0, 1, 2, 9, 8]) for (const b of [0, 1, 2, 9, 8]) for (const c of [0, 1, 2, 9]) for (const d of [0, 1, 2, 9]) { const s = `${a}${b}${c}${d}`; if (s !== '0000' && around.length < 500 && (a + b + c + d) % 3 !== 1) around.push(s); } out.push(`7777\n${around.length}\n${around.join(' ')}\n`);
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `begin` and `end`: two words of the same length.', 'The second line has `k`, the number of words in the dictionary.', 'The third line has the `k` words of the dictionary (all of the same length as `begin`).'],
    constraints: ['1 <= k <= 5000', 'All words have the same length, from 1 to 10 lowercase letters.', '`begin` and `end` are different.'],
    slug: 'word-ladder-length',
    title: 'Change One Letter at a Time',
    tags: ['graph', 'bfs', 'implicit-graph', 'strings', 'hashing'],
    concept: {
      title: 'Find the neighbours of a word through patterns with one wildcard letter',
      body: [
        'A *word ladder* turns the word `begin` into the word `end` by changing **one letter at a time**, where every word on the way must be in the dictionary. What is the smallest number of words in such a ladder (counting `begin` and `end`)? Words are nodes, and two words are neighbours when they differ in exactly one letter. A breadth-first search finds the shortest ladder.',
        'The difficulty is to **find the neighbours quickly**. Comparing a word with all `k` words of the dictionary costs O(k * length) per word, O(k^2) in total: too slow for 5000 words. A better way: every word has `length` *patterns*, made by replacing one letter with `*`: `hot` has `*ot`, `h*t` and `ho*`. Two words are neighbours exactly when they **share a pattern**. Group the words by pattern in a dictionary (`bucket["*ot"] = [hot, dot, lot]`); the neighbours of a word are the words in the buckets of its patterns.',
        { code: 'buckets = {}\nfor word in dictionary + [begin]:\n    for i in range(len(word)):\n        buckets.setdefault(word[:i] + "*" + word[i + 1:], []).append(word)\n\ndist = {begin: 1}\nqueue = [begin]\nfor word in queue:\n    for i in range(len(word)):\n        pattern = word[:i] + "*" + word[i + 1:]\n        for other in buckets.pop(pattern, []):        # use every bucket only once\n            if other not in dist:\n                dist[other] = dist[word] + 1\n                queue.append(other)' },
        'Emptying a bucket after its first use (`pop`) is a small but important speed-up: all words of a bucket get their distance at that moment, so the bucket is never needed again. The total work is O(k * length^2). If `end` is not in the dictionary, the answer is 0.'
      ]
    },
    statement: ['A word ladder from `begin` to `end` is a sequence of words that starts with `begin`, ends with `end`, and in which every two neighbouring words differ in exactly one letter and every word except `begin` is in the dictionary. Print the number of words of the shortest ladder (including `begin` and `end`), or 0 if there is none.'],
    outputFormat: ['Print the number of words or 0.'],
    examples: [{ input: 'hit cog\n6\nhot dot dog lot log cog\n', note: 'hit, hot, dot, dog, cog: 5 words.' }],
    hints: ['Replace each letter in turn by * to get the patterns of a word.', 'Words that share a pattern are neighbours: keep a dictionary from a pattern to the list of its words.', 'Run a breadth-first search from begin, counting words; print 0 if end is never reached.'],
    program: {
      io: ['begin:word end:word', 'k:int', 'words:word[k]'],
      fast: true,
      includes: ['<map>', '<set>'],
      python: r`
        known = set(words)
        buckets = {}
        for word in list(known | {begin}):
            for i in range(len(word)):
                buckets.setdefault(word[:i] + "*" + word[i + 1:], []).append(word)
        dist = {begin: 1}
        queue = [begin]
        for word in queue:
            for i in range(len(word)):
                pattern = word[:i] + "*" + word[i + 1:]
                for other in buckets.pop(pattern, []):
                    if other not in dist:
                        dist[other] = dist[word] + 1
                        queue.append(other)
        print(dist[end] if end in known and end in dist else 0)`,
      cpp: r`
        set<string> known(words.begin(), words.end());
        map<string, vector<string>> buckets;
        set<string> all = known;
        all.insert(begin);
        for (const string& word : all) {
            for (size_t i = 0; i < word.size(); i++) {
                string pattern = word;
                pattern[i] = '*';
                buckets[pattern].push_back(word);
            }
        }
        map<string, int> dist;
        dist[begin] = 1;
        vector<string> queue = {begin};
        for (size_t q = 0; q < queue.size(); q++) {
            string word = queue[q];
            for (size_t i = 0; i < word.size(); i++) {
                string pattern = word;
                pattern[i] = '*';
                vector<string> bucket = buckets[pattern];
                buckets[pattern].clear();
                for (const string& other : bucket) {
                    if (!dist.count(other)) {
                        dist[other] = dist[word] + 1;
                        queue.push_back(other);
                    }
                }
            }
        }
        cout << (known.count(end) && dist.count(end) ? dist[end] : 0) << "\n";`,
      java: r`
        Set<String> known = new HashSet<>(Arrays.asList(words));
        Map<String, List<String>> buckets = new HashMap<>();
        Set<String> all = new HashSet<>(known);
        all.add(begin);
        for (String word : all) {
            for (int i = 0; i < word.length(); i++) {
                String pattern = word.substring(0, i) + "*" + word.substring(i + 1);
                buckets.computeIfAbsent(pattern, p -> new ArrayList<>()).add(word);
            }
        }
        Map<String, Integer> dist = new HashMap<>();
        dist.put(begin, 1);
        List<String> queue = new ArrayList<>();
        queue.add(begin);
        for (int q = 0; q < queue.size(); q++) {
            String word = queue.get(q);
            for (int i = 0; i < word.length(); i++) {
                String pattern = word.substring(0, i) + "*" + word.substring(i + 1);
                List<String> bucket = buckets.remove(pattern);
                if (bucket == null) continue;
                for (String other : bucket) {
                    if (!dist.containsKey(other)) {
                        dist.put(other, dist.get(word) + 1);
                        queue.add(other);
                    }
                }
            }
        }
        System.out.println(known.contains(end) && dist.containsKey(end) ? dist.get(end) : 0);`
    },
    solution: { explanation: ['Words are grouped by their patterns with one wildcard letter; the neighbours of a word are the words in its buckets, each bucket is used once. A breadth-first search from begin counts the words of the shortest ladder, 0 if end is not reached or not in the dictionary.'], complexity: 'Time O(k * length^2), space O(k * length^2).' },
    solve(input) {
      const rs = rows(input); const [begin, end] = rs[0].split(' '); const words = rs[2].split(' '); const known = new Set(words); const all = [...new Set([...words, begin])]; const dist = new Map([[begin, 1]]); const q = [begin];
      const apart = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d === 1; };
      // a plain search that compares words in pairs, used for dictionaries that are not too big
      if (all.length <= 800) { for (let h = 0; h < q.length; h++) for (const o of all) if (!dist.has(o) && apart(q[h], o)) { dist.set(o, dist.get(q[h]) + 1); q.push(o); } }
      else { const buckets = new Map(); for (const w of all) for (let i = 0; i < w.length; i++) { const p = w.slice(0, i) + '*' + w.slice(i + 1); if (!buckets.has(p)) buckets.set(p, []); buckets.get(p).push(w); } for (let h = 0; h < q.length; h++) for (let i = 0; i < q[h].length; i++) { const p = q[h].slice(0, i) + '*' + q[h].slice(i + 1); for (const o of buckets.get(p) || []) if (!dist.has(o)) { dist.set(o, dist.get(q[h]) + 1); q.push(o); } } }
      return String(known.has(end) && dist.has(end) ? dist.get(end) : 0);
    },
    tests() {
      const g = rng(937); const out = ['hit cog\n6\nhot dot dog lot log cog\n', 'hit cog\n5\nhot dot dog lot log\n', 'a c\n3\na b c\n', 'ab cd\n1\ncd\n'];
      const make = (k, len, letters) => { const pool = new Set(); const max = Math.pow(letters.length, len); while (pool.size < Math.min(k, max)) pool.add(randWord(g, len, letters)); const list = [...pool]; const begin = g() < 0.5 ? list[0] : randWord(g, len, letters); let end = list[list.length - 1]; if (end === begin) end = list[1] || randWord(g, len, letters); if (end === begin) return null; return `${begin} ${end}\n${list.length}\n${shuffle(g, list).join(' ')}\n`; };
      for (const [k, len, letters] of [[6, 3, 'abc'], [20, 3, 'abc'], [50, 4, 'abcd'], [200, 4, 'abc'], [800, 5, 'abc'], [3000, 6, 'ab'], [5000, 6, 'abc'], [5000, 8, 'abc'], [5000, 10, 'ab'], [5000, 10, 'abcdefghijklmnopqrstuvwxyz'], [4000, 4, 'abcdefg']]) { const t = make(k, len, letters); if (t) out.push(t); }
      return out;
    }
  },

  {
    ...gridIn(['Every character is `X` or `O`.']),
    slug: 'surrounded-regions',
    title: 'Capture the Surrounded Regions',
    tags: ['graph', 'grid', 'bfs', 'multi-source'],
    concept: {
      title: 'Mark what is safe (connected to the border) and capture everything else',
      body: [
        'A board has cells `X` and `O`. A region of `O` cells is *surrounded* if none of its cells touches the border of the board, even through other `O` cells connected by sides. All surrounded regions are captured, that is, turned into `X`. The `O` cells that are connected to a border `O` stay.',
        'This is the enclosed-land task again, with a grid output. Instead of searching from each region and asking whether it reaches the border, **start from the border**: all `O` cells on the border are safe, and a flood fill from them marks all `O` cells that are connected to the border. At the end, every `O` that is not marked is surrounded and becomes `X`.',
        { code: 'safe = [[False] * w for _ in range(h)]\nstack = []\nfor x in range(h):\n    for y in range(w):\n        if (x in (0, h - 1) or y in (0, w - 1)) and grid[x][y] == "O":\n            safe[x][y] = True\n            stack.append((x, y))\n# flood from all of them through "O" cells ...\nfor x in range(h):\n    row = ""\n    for y in range(w):\n        row += "O" if safe[x][y] else "X"' },
        'Notice that the answer is built from the marks: a cell is `O` in the output exactly when it was marked safe (a safe cell is always an `O`), and `X` otherwise. The time is O(h * w).'
      ]
    },
    statement: ['A board of `h` rows and `w` columns contains the letters `X` and `O`. A group of `O` cells connected through their sides is surrounded if no cell of the group is on the border of the board. Turn all `O` cells of all surrounded groups into `X`, and print the board.'],
    outputFormat: ['`h` lines: the new board.'],
    examples: [{ input: '4 4\nXXXX\nXOOX\nXXOX\nXOXX\n', note: 'The three O cells in the middle are surrounded and change; the O in the bottom row is on the border and stays.' }],
    hints: ['The O cells on the border, and everything connected to them, are safe.', 'Flood from all border O cells at once and mark the cells you reach.', 'In the new board a cell is O only if it was marked.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        safe = [[False] * w for _ in range(h)]
        stack = []
        for x in range(h):
            for y in range(w):
                if (x == 0 or x == h - 1 or y == 0 or y == w - 1) and grid[x][y] == "O":
                    safe[x][y] = True
                    stack.append((x, y))
        while stack:
            x, y = stack.pop()
            for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= a < h and 0 <= b < w and grid[a][b] == "O" and not safe[a][b]:
                    safe[a][b] = True
                    stack.append((a, b))
        print("\n".join("".join("O" if safe[x][y] else "X" for y in range(w)) for x in range(h)))`,
      cpp: r`
        vector<vector<char>> safe(h, vector<char>(w, 0));
        vector<pair<int, int>> stack;
        for (int x = 0; x < h; x++) {
            for (int y = 0; y < w; y++) {
                if ((x == 0 || x == h - 1 || y == 0 || y == w - 1) && grid[x][y] == 'O') {
                    safe[x][y] = 1;
                    stack.push_back({x, y});
                }
            }
        }
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        while (!stack.empty()) {
            pair<int, int> cell = stack.back();
            stack.pop_back();
            for (int d = 0; d < 4; d++) {
                int a = cell.first + dx[d], b = cell.second + dy[d];
                if (a >= 0 && a < h && b >= 0 && b < w && grid[a][b] == 'O' && !safe[a][b]) {
                    safe[a][b] = 1;
                    stack.push_back({a, b});
                }
            }
        }
        for (int x = 0; x < h; x++) {
            for (int y = 0; y < w; y++) cout << (safe[x][y] ? 'O' : 'X');
            cout << "\n";
        }`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        boolean[][] safe = new boolean[rowsCount][colsCount];
        ArrayList<int[]> stack = new ArrayList<>();
        for (int x = 0; x < rowsCount; x++) {
            for (int y = 0; y < colsCount; y++) {
                if ((x == 0 || x == rowsCount - 1 || y == 0 || y == colsCount - 1) && grid[x].charAt(y) == 'O') {
                    safe[x][y] = true;
                    stack.add(new int[] {x, y});
                }
            }
        }
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        while (!stack.isEmpty()) {
            int[] cell = stack.remove(stack.size() - 1);
            for (int d = 0; d < 4; d++) {
                int a = cell[0] + dx[d], b = cell[1] + dy[d];
                if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount && grid[a].charAt(b) == 'O' && !safe[a][b]) {
                    safe[a][b] = true;
                    stack.add(new int[] {a, b});
                }
            }
        }
        StringBuilder out = new StringBuilder();
        for (int x = 0; x < rowsCount; x++) {
            for (int y = 0; y < colsCount; y++) out.append(safe[x][y] ? 'O' : 'X');
            out.append("\n");
        }
        System.out.print(out);`
    },
    solution: { explanation: ['A flood fill from all the O cells on the border marks the safe cells; in the output a cell is O exactly when it is marked.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) {
      const { h, w, cells } = parseGrid(input); const safe = cells.map((row) => [...row].map(() => false)); const st = [];
      for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) if ((x === 0 || y === 0 || x === h - 1 || y === w - 1) && cells[x][y] === 'O') { safe[x][y] = true; st.push([x, y]); }
      while (st.length) { const [x, y] = st.pop(); for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (inside(h, w, a, b) && cells[a][b] === 'O' && !safe[a][b]) { safe[a][b] = true; st.push([a, b]); } } }
      return safe.map((row) => row.map((v) => (v ? 'O' : 'X')).join('')).join('\n');
    },
    tests() {
      const g = rng(938); const out = ['4 4\nXXXX\nXOOX\nXXOX\nXOXX\n', '1 1\nO\n', '3 3\nXXX\nXOX\nXXX\n', '3 3\nOOO\nOXO\nOOO\n'];
      for (const [h, w, p] of [[4, 5, 0.5], [10, 10, 0.55], [30, 40, 0.6], [200, 200, 0.55], [200, 200, 0.7], [200, 200, 0.4], [1, 200, 0.6], [200, 1, 0.6]]) out.push(gridText(randomGrid(g, h, w, ['X', 'O'], [1 - p, p])));
      out.push(gridText(many(200, (i) => (i === 0 || i === 199 ? 'X'.repeat(200) : 'X' + 'O'.repeat(198) + 'X'))), gridText(many(200, (i) => (i === 0 ? 'X'.repeat(199) + 'O' : 'O'.repeat(200)))));
      return out;
    }
  },

  {
    ...medium,
    inputFormat: ['The first line has `h` and `w`.', 'Each of the next `h` lines has `w` numbers: the heights of the cells of a row.'],
    constraints: ['1 <= h, w <= 200', '0 <= every height <= 10^9'],
    slug: 'pacific-atlantic-flow',
    title: 'Water That Reaches Both Oceans',
    tags: ['graph', 'grid', 'bfs', 'multi-source'],
    concept: {
      title: 'Search uphill from each ocean and keep the cells that both searches reach',
      body: [
        'An island is a grid of heights. The Pacific Ocean touches the **top and left** edges, and the Atlantic Ocean touches the **bottom and right** edges. Rain falling on a cell flows to a neighbouring cell (up, down, left or right) whose height is **not higher**. For how many cells can the water flow to **both** oceans (by different roads if need be)?',
        'Asking each cell "where does your water go?" repeats the work many times. Turn the question around, as in the enclosed-land task: start at the ocean and go **uphill**. The cells next to the Pacific are the starting cells of a search, and from a cell you may step to a neighbour whose height is **at least** as big (because water can flow from the neighbour down to this cell). The cells found are exactly the cells whose water can reach the Pacific. Do the same for the Atlantic. The answer is the number of cells found by **both** searches.',
        { code: 'def reach(starts):\n    seen = [[False] * w for _ in range(h)]\n    stack = list(starts)\n    for x, y in starts:\n        seen[x][y] = True\n    while stack:\n        x, y = stack.pop()\n        for a, b in neighbours(x, y):\n            if inside(a, b) and not seen[a][b] and heights[a][b] >= heights[x][y]:\n                seen[a][b] = True              # water here flows down to (x, y)\n                stack.append((a, b))\n    return seen\n\npacific = reach(cells in the first row and column)\natlantic = reach(cells in the last row and column)\nanswer = number of cells with pacific and atlantic both true' },
        'Two multi-source searches and one pass to combine them: O(h * w) in total.'
      ]
    },
    statement: ['A grid of `h` rows and `w` columns gives the height of every cell. The Pacific Ocean touches the first row and the first column; the Atlantic Ocean touches the last row and the last column. Water flows from a cell to a neighbouring cell (up, down, left, right) that has the same or a lower height, and a cell on the edge next to an ocean flows into it. Print the number of cells from which the water can flow to both oceans.'],
    outputFormat: ['Print the number of cells.'],
    examples: [{ input: '3 3\n1 2 3\n8 9 4\n7 6 5\n', note: 'The two lowest cells in the top left corner (heights 1 and 2) can reach only the Pacific; each of the other seven cells can reach both oceans: 7.' }],
    hints: ['Search from the cells that touch an ocean, stepping to neighbours that are not lower.', 'Do one search for the Pacific and one for the Atlantic.', 'Count the cells that both searches reached.'],
    program: {
      io: ['h:int w:int', 'a:int[h][w]'],
      fast: true,
      python: r`
        def reach(starts):
            seen = [[False] * w for _ in range(h)]
            stack = list(starts)
            for x, y in starts:
                seen[x][y] = True
            while stack:
                x, y = stack.pop()
                for p, q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= p < h and 0 <= q < w and not seen[p][q] and a[p][q] >= a[x][y]:
                        seen[p][q] = True
                        stack.append((p, q))
            return seen

        pacific = reach([(0, j) for j in range(w)] + [(i, 0) for i in range(1, h)])
        atlantic = reach([(h - 1, j) for j in range(w)] + [(i, w - 1) for i in range(h - 1)])
        print(sum(1 for i in range(h) for j in range(w) if pacific[i][j] and atlantic[i][j]))`,
      cpp: r`
        auto reach = [&](vector<pair<int, int>> starts) {
            vector<vector<char>> seen(h, vector<char>(w, 0));
            for (const auto& cell : starts) seen[cell.first][cell.second] = 1;
            vector<pair<int, int>> stack = starts;
            int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
            while (!stack.empty()) {
                pair<int, int> cell = stack.back();
                stack.pop_back();
                for (int d = 0; d < 4; d++) {
                    int p = cell.first + dx[d], q = cell.second + dy[d];
                    if (p >= 0 && p < h && q >= 0 && q < w && !seen[p][q] && a[p][q] >= a[cell.first][cell.second]) {
                        seen[p][q] = 1;
                        stack.push_back({p, q});
                    }
                }
            }
            return seen;
        };
        vector<pair<int, int>> pacificStarts, atlanticStarts;
        for (int j = 0; j < w; j++) {
            pacificStarts.push_back({0, j});
            atlanticStarts.push_back({(int)h - 1, j});
        }
        for (int i = 0; i < h; i++) {
            if (i > 0) pacificStarts.push_back({i, 0});
            if (i < h - 1) atlanticStarts.push_back({i, (int)w - 1});
        }
        vector<vector<char>> pacific = reach(pacificStarts), atlantic = reach(atlanticStarts);
        long long count = 0;
        for (int i = 0; i < h; i++) {
            for (int j = 0; j < w; j++) {
                if (pacific[i][j] && atlantic[i][j]) count++;
            }
        }
        cout << count << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        boolean[][] pacific = new boolean[rowsCount][colsCount], atlantic = new boolean[rowsCount][colsCount];
        for (int round = 0; round < 2; round++) {
            boolean[][] seen = round == 0 ? pacific : atlantic;
            ArrayList<int[]> stack = new ArrayList<>();
            for (int j = 0; j < colsCount; j++) {
                int row = round == 0 ? 0 : rowsCount - 1;
                if (!seen[row][j]) {
                    seen[row][j] = true;
                    stack.add(new int[] {row, j});
                }
            }
            for (int i = 0; i < rowsCount; i++) {
                int col = round == 0 ? 0 : colsCount - 1;
                if (!seen[i][col]) {
                    seen[i][col] = true;
                    stack.add(new int[] {i, col});
                }
            }
            int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
            while (!stack.isEmpty()) {
                int[] cell = stack.remove(stack.size() - 1);
                for (int d = 0; d < 4; d++) {
                    int p = cell[0] + dx[d], q = cell[1] + dy[d];
                    if (p >= 0 && p < rowsCount && q >= 0 && q < colsCount && !seen[p][q] && a[p][q] >= a[cell[0]][cell[1]]) {
                        seen[p][q] = true;
                        stack.add(new int[] {p, q});
                    }
                }
            }
        }
        long count = 0;
        for (int i = 0; i < rowsCount; i++) {
            for (int j = 0; j < colsCount; j++) {
                if (pacific[i][j] && atlantic[i][j]) count++;
            }
        }
        System.out.println(count);`
    },
    solution: { explanation: ['Two searches start from the cells that touch the Pacific and from the cells that touch the Atlantic and move to neighbours that are not lower; the cells reached by both are counted.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) {
      const rs = rows(input); const [h, w] = nums(rs[0]); const a = many(h, (i) => nums(rs[i + 1]));
      const reach = (starts) => { const seen = a.map((row) => row.map(() => false)); const st = []; for (const [x, y] of starts) if (!seen[x][y]) { seen[x][y] = true; st.push([x, y]); } while (st.length) { const [x, y] = st.pop(); for (const [dx, dy] of DIRS) { const p = x + dx, q = y + dy; if (inside(h, w, p, q) && !seen[p][q] && a[p][q] >= a[x][y]) { seen[p][q] = true; st.push([p, q]); } } } return seen; };
      const top = []; const bottom = []; for (let j = 0; j < w; j++) { top.push([0, j]); bottom.push([h - 1, j]); } for (let i = 0; i < h; i++) { top.push([i, 0]); bottom.push([i, w - 1]); }
      const p = reach(top), t = reach(bottom); let c = 0; for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) if (p[i][j] && t[i][j]) c++; return String(c);
    },
    tests() {
      const g = rng(939); const out = ['3 3\n1 2 3\n8 9 4\n7 6 5\n', '1 1\n5\n', '2 2\n1 1\n1 1\n'];
      const make = (h, w, hi) => numberGrid(many(h, () => many(w, () => randInt(g, 0, hi))));
      // slopes: heights grow with a random smooth function, so that long uphill roads exist
      const smooth = (h, w) => numberGrid(many(h, (i) => many(w, (j) => Math.floor(1000 * (Math.sin(i / 7) + Math.cos(j / 5) + 2)) + randInt(g, 0, 3))));
      for (const [h, w, hi] of [[4, 5, 3], [10, 10, 5], [30, 40, 100], [200, 200, 1000000000], [200, 200, 3], [200, 200, 0], [1, 200, 9], [200, 1, 9]]) out.push(make(h, w, hi));
      out.push(smooth(100, 100), smooth(200, 200), numberGrid(many(200, (i) => many(200, (j) => i + j))), numberGrid(many(200, (i) => many(200, (j) => 400 - i - j))), numberGrid(many(199, (i) => many(199, (j) => { const ring = Math.min(i, j, 198 - i, 198 - j); return ring * 10; }))));
      return out;
    }
  }
];

// the islands of a grid of 0/1 characters: the number of the island of every land cell (0 for water)
function landGroups(h, w, cells) {
  const comp = cells.map((row) => [...row].map(() => 0)); let k = 0;
  for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) {
    if (cells[x][y] !== '1' || comp[x][y]) continue;
    k++; comp[x][y] = k; const st = [[x, y]];
    while (st.length) { const [p, q] = st.pop(); for (const [dx, dy] of DIRS) { const a = p + dx, b = q + dy; if (inside(h, w, a, b) && cells[a][b] === '1' && !comp[a][b]) { comp[a][b] = k; st.push([a, b]); } } }
  }
  return comp;
}

// a grid with exactly two islands, each grown from a random cell by adding random neighbours; the islands do not touch
function twoIslands(g, h, w, size1, size2) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const cells = Array.from({ length: h }, () => new Array(w).fill(0));
    const grow = (mark, size) => {
      const start = [randInt(g, 0, h - 1), randInt(g, 0, w - 1)];
      const touchesOther = (a, b) => DIRS.some(([dx, dy]) => inside(h, w, a + dx, b + dy) && cells[a + dx][b + dy] !== 0 && cells[a + dx][b + dy] !== mark);
      if (cells[start[0]][start[1]] !== 0 || touchesOther(start[0], start[1])) return false;
      cells[start[0]][start[1]] = mark; const cellsList = [start]; let guard = 0;
      while (cellsList.length < size && guard++ < size * 60) {
        const [x, y] = cellsList[randInt(g, 0, cellsList.length - 1)]; const [dx, dy] = DIRS[randInt(g, 0, 3)]; const a = x + dx, b = y + dy;
        if (inside(h, w, a, b) && cells[a][b] === 0 && !touchesOther(a, b)) { cells[a][b] = mark; cellsList.push([a, b]); }
      }
      return true;
    };
    if (!grow(1, size1) || !grow(2, size2)) continue;
    const text = cells.map((row) => row.map((c) => (c ? '1' : '0')).join(''));
    const groups = landGroups(h, w, text); const count = Math.max(0, ...groups.flat());
    if (count === 2) return gridText(text);
  }
  throw new Error('could not make a grid with two islands');
}
