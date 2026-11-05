import { r, rng, randInt, many, nums, rows, shuffle } from '../../lib.mjs';
import { graphText, randomEdges, randomTreeEdges, connectedEdges, randomDirected, randomDag, adjacency, components, mix, randomGrid, gridText, Dsu } from '../../graphlib.mjs';
import { J, ADJ, DIR, EDGE_INPUT, DIR_INPUT, EDGE_LIMITS, GRID_INPUT } from '../../graphcode.mjs';

const crossCheck = (make, fast, brute, rounds = 200) => { for (let t = 0; t < rounds; t++) { const input = make(); if (String(fast(input)) !== String(brute(input))) throw new Error('reference differs from brute force on ' + JSON.stringify(input)); } };
const easy = { difficulty: 'easy' };
const GRID_LIMITS = ['1 <= h, w <= 200', 'Every character of the grid is `1` (land) or `0` (water).'];
const grid = { ...easy, inputFormat: GRID_INPUT, constraints: GRID_LIMITS };
const edgesIn = { ...easy, inputFormat: EDGE_INPUT, constraints: EDGE_LIMITS };
const dirIn = { ...easy, inputFormat: DIR_INPUT, constraints: EDGE_LIMITS };
const parseGrid = (input) => { const rs = rows(input); const [h, w] = nums(rs[0]); return { h, w, cells: rs.slice(1, 1 + h), rs }; };
const parse = (input) => { const rs = rows(input); const [n, m] = nums(rs[0]); return { n, m, edges: many(m, (i) => nums(rs[i + 1])), rs }; };
const E = (g, n, m) => mix(g, randomEdges(g, n, m));
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
// the groups of land cells of a grid, as lists of [row, column], found with a plain stack
function islands(cells) {
  const h = cells.length, w = cells[0].length; const seen = cells.map((row) => [...row].map(() => false)); const out = [];
  for (let r0 = 0; r0 < h; r0++) for (let c0 = 0; c0 < w; c0++) {
    if (cells[r0][c0] !== '1' || seen[r0][c0]) continue;
    seen[r0][c0] = true; const stack = [[r0, c0]]; const group = [];
    while (stack.length) { const [x, y] = stack.pop(); group.push([x, y]); for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (a >= 0 && a < h && b >= 0 && b < w && cells[a][b] === '1' && !seen[a][b]) { seen[a][b] = true; stack.push([a, b]); } } }
    out.push(group);
  }
  return out;
}
// grids for the tests: random with several densities, a snake, empty and full, thin ones
const gridShapes = (g) => [
  gridText(['1']), gridText(['0']), gridText(['10', '01']), gridText(randomGrid(g, 5, 6, ['0', '1'], [0.5, 0.5])), gridText(randomGrid(g, 12, 12, ['0', '1'], [0.4, 0.6])),
  gridText(randomGrid(g, 60, 80, ['0', '1'], [0.5, 0.5])), gridText(randomGrid(g, 200, 200, ['0', '1'], [0.6, 0.4])), gridText(randomGrid(g, 200, 200, ['0', '1'], [0.3, 0.7])), gridText(randomGrid(g, 200, 200, ['0', '1'], [0.05, 0.95])),
  gridText(many(200, () => '1'.repeat(200))), gridText(many(200, () => '0'.repeat(200))), gridText([randomGrid(g, 1, 200, ['0', '1'], [0.4, 0.6])[0]]), gridText(many(200, () => (g() < 0.5 ? '1' : '0'))),
  gridText(many(199, (i) => (i % 2 === 0 ? '1'.repeat(199) : (i % 4 === 1 ? '0'.repeat(198) + '1' : '1' + '0'.repeat(198)))))
];
const fillOf = (cells, start, step) => { const h = cells.length, w = cells[0].length; const seen = cells.map((row) => [...row].map(() => false)); const stack = start.filter(([x, y]) => cells[x][y] === '1'); for (const [x, y] of stack) seen[x][y] = true; for (let i = 0; i < stack.length; i++) { const [x, y] = stack[i]; for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (a >= 0 && a < h && b >= 0 && b < w && cells[a][b] === '1' && !seen[a][b]) { seen[a][b] = true; stack.push([a, b]); } } } return seen; };

export default [
  {
    ...grid,
    slug: 'number-of-islands',
    title: 'Count the Islands',
    tags: ['graph', 'grid', 'dfs', 'flood-fill'],
    concept: {
      title: 'A grid is a graph: every cell is a node, and its side neighbours are its neighbours',
      body: [
        'Many graph problems come as a **grid** of cells (a map, a maze, a picture). There is no edge list, but you do not need one: the cell `(r, c)` is a node, and its neighbours are the cells above, below, left and right of it, if they exist and are allowed. The graph is stored in the grid itself.',
        'Here the grid shows land (`1`) and water (`0`). An *island* is a group of land cells that touch each other by a side (not by a corner). To count the islands, scan the grid; when you meet a land cell that has not been seen, a **new island** starts, and a search from that cell marks the whole island. This is the *flood fill*: like paint spreading from one cell to all the connected ones.',
        { code: 'seen = [[False] * w for _ in range(h)]\ncount = 0\nfor r in range(h):\n    for c in range(w):\n        if grid[r][c] == "1" and not seen[r][c]:\n            count += 1                       # a new island\n            seen[r][c] = True\n            stack = [(r, c)]\n            while stack:\n                x, y = stack.pop()\n                for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):\n                    if 0 <= a < h and 0 <= b < w and grid[a][b] == "1" and not seen[a][b]:\n                        seen[a][b] = True\n                        stack.append((a, b))' },
        'The checks for "inside the grid" must come **before** looking at the cell, so that no index goes out of range. Every cell is pushed at most once, so the time is O(h * w). The search uses a stack in a loop instead of recursion, because an island can snake through the whole grid (40000 cells), which is far too deep for recursion in Python.'
      ]
    },
    statement: ['A map is a grid of `h` rows and `w` columns. A `1` is land and a `0` is water. An island is a group of land cells that are connected through their sides (up, down, left, right). Print the number of islands.'],
    outputFormat: ['Print the number of islands.'],
    examples: [{ input: '4 5\n11000\n11000\n00100\n00011\n', note: 'The islands are the 2 x 2 block in the corner, the single cell in the middle and the two cells at the bottom right: 3.' }],
    hints: ['Scan the cells; a land cell that has not been seen starts a new island.', 'From it, mark all connected land cells with a stack or a queue.', 'Check that a neighbour is inside the grid before reading it.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        seen = [[False] * w for _ in range(h)]
        count = 0
        for r in range(h):
            for c in range(w):
                if grid[r][c] == "1" and not seen[r][c]:
                    count += 1
                    seen[r][c] = True
                    stack = [(r, c)]
                    while stack:
                        x, y = stack.pop()
                        for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                            if 0 <= a < h and 0 <= b < w and grid[a][b] == "1" and not seen[a][b]:
                                seen[a][b] = True
                                stack.append((a, b))
        print(count)`,
      cpp: r`
        vector<vector<char>> seen(h, vector<char>(w, 0));
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        int count = 0;
        for (int r = 0; r < h; r++) {
            for (int c = 0; c < w; c++) {
                if (grid[r][c] != '1' || seen[r][c]) continue;
                count++;
                seen[r][c] = 1;
                vector<pair<int, int>> stack = {{r, c}};
                while (!stack.empty()) {
                    pair<int, int> cell = stack.back();
                    stack.pop_back();
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
        cout << count << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        boolean[][] seen = new boolean[rowsCount][colsCount];
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        int count = 0;
        for (int r = 0; r < rowsCount; r++) {
            for (int c = 0; c < colsCount; c++) {
                if (grid[r].charAt(c) != '1' || seen[r][c]) continue;
                count++;
                seen[r][c] = true;
                ArrayList<int[]> stack = new ArrayList<>();
                stack.add(new int[] {r, c});
                while (!stack.isEmpty()) {
                    int[] cell = stack.remove(stack.size() - 1);
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
        System.out.println(count);`
    },
    solution: { explanation: ['Scanning the cells, every unseen land cell starts a new island, and a search with a stack marks all land cells connected to it through sides.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) { return String(islands(parseGrid(input).cells).length); },
    tests() { const g = rng(911); return ['4 5\n11000\n11000\n00100\n00011\n', ...gridShapes(g)]; }
  },

  {
    ...grid,
    slug: 'largest-island',
    title: 'The Biggest Island',
    tags: ['graph', 'grid', 'dfs', 'flood-fill'],
    concept: {
      title: 'Count the cells while you flood the island',
      body: [
        'The area of an island is the number of its cells. The flood fill of the previous task already visits every cell of the island once, so the area is just a **counter** that goes up by one for every cell taken from the stack. Keep the largest counter over all islands.',
        { code: 'best = 0\nfor r in range(h):\n    for c in range(w):\n        if grid[r][c] == "1" and not seen[r][c]:\n            area = 0\n            seen[r][c] = True\n            stack = [(r, c)]\n            while stack:\n                x, y = stack.pop()\n                area += 1                    # one more cell of this island\n                ...                          # push the unseen land neighbours\n            best = max(best, area)' },
        'If the grid has no land at all, the largest area is 0, which is what the variable `best` starts as. The pattern "do a flood fill and measure something about the group" (area, number of border cells, the smallest row, ...) solves a whole family of grid tasks.'
      ]
    },
    statement: ['A map is a grid of `h` rows and `w` columns with land (`1`) and water (`0`). An island is a group of land cells connected through their sides. Print the number of cells of the biggest island, or 0 if there is no land.'],
    outputFormat: ['Print the largest area.'],
    examples: [{ input: '4 5\n11000\n11000\n00100\n00011\n', note: 'The 2 x 2 block has 4 cells, the others 1 and 2: 4.' }],
    hints: ['Flood each island and count the cells you take from the stack.', 'Keep the maximum of the counts.', 'With no land the answer is 0.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      includes: ['<algorithm>'],
      python: r`
        seen = [[False] * w for _ in range(h)]
        best = 0
        for r in range(h):
            for c in range(w):
                if grid[r][c] == "1" and not seen[r][c]:
                    area = 0
                    seen[r][c] = True
                    stack = [(r, c)]
                    while stack:
                        x, y = stack.pop()
                        area += 1
                        for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                            if 0 <= a < h and 0 <= b < w and grid[a][b] == "1" and not seen[a][b]:
                                seen[a][b] = True
                                stack.append((a, b))
                    best = max(best, area)
        print(best)`,
      cpp: r`
        vector<vector<char>> seen(h, vector<char>(w, 0));
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        long long best = 0;
        for (int r = 0; r < h; r++) {
            for (int c = 0; c < w; c++) {
                if (grid[r][c] != '1' || seen[r][c]) continue;
                long long area = 0;
                seen[r][c] = 1;
                vector<pair<int, int>> stack = {{r, c}};
                while (!stack.empty()) {
                    pair<int, int> cell = stack.back();
                    stack.pop_back();
                    area++;
                    for (int d = 0; d < 4; d++) {
                        int a = cell.first + dx[d], b = cell.second + dy[d];
                        if (a >= 0 && a < h && b >= 0 && b < w && grid[a][b] == '1' && !seen[a][b]) {
                            seen[a][b] = 1;
                            stack.push_back({a, b});
                        }
                    }
                }
                best = max(best, area);
            }
        }
        cout << best << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        boolean[][] seen = new boolean[rowsCount][colsCount];
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        long best = 0;
        for (int r = 0; r < rowsCount; r++) {
            for (int c = 0; c < colsCount; c++) {
                if (grid[r].charAt(c) != '1' || seen[r][c]) continue;
                long area = 0;
                seen[r][c] = true;
                ArrayList<int[]> stack = new ArrayList<>();
                stack.add(new int[] {r, c});
                while (!stack.isEmpty()) {
                    int[] cell = stack.remove(stack.size() - 1);
                    area++;
                    for (int d = 0; d < 4; d++) {
                        int a = cell[0] + dx[d], b = cell[1] + dy[d];
                        if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount && grid[a].charAt(b) == '1' && !seen[a][b]) {
                            seen[a][b] = true;
                            stack.add(new int[] {a, b});
                        }
                    }
                }
                best = Math.max(best, area);
            }
        }
        System.out.println(best);`
    },
    solution: { explanation: ['Each island is flooded with a stack; the number of cells taken from the stack is its area, and the largest area is kept.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) { return String(Math.max(0, ...islands(parseGrid(input).cells).map((x) => x.length))); },
    tests() { const g = rng(912); return ['4 5\n11000\n11000\n00100\n00011\n', ...gridShapes(g)]; }
  },

  {
    ...easy,
    inputFormat: [...GRID_INPUT, 'The next line has three numbers `sr`, `sc` and `color`: the row and the column of the starting cell (counted from 1) and the new colour.'],
    constraints: ['1 <= h, w <= 200', 'Every character of the grid is a digit from 0 to 9, and `color` is a digit from 0 to 9.', '1 <= sr <= h, 1 <= sc <= w'],
    slug: 'flood-fill',
    title: 'Paint the Connected Region',
    tags: ['graph', 'grid', 'flood-fill'],
    concept: {
      title: 'Flood fill: change a cell, then do the same for its same-coloured neighbours',
      body: [
        'The *paint bucket* tool of a drawing program colours a whole region: all cells that have the same colour as the clicked cell and are connected to it through their sides. This is exactly the graph search of the island tasks, with one change: a cell is a neighbour of the search if it has the **old colour** of the starting cell.',
        'There is one trap. If the new colour is **the same** as the old one, the fill must do nothing, because otherwise the search would never see a difference between "painted" and "not painted yet" cells, and it would run for ever. Checking `old != new` first removes the problem. When the new colour differs, **painting a cell is itself the "seen" mark**: a painted cell no longer has the old colour, so it is not visited again.',
        { code: 'old = cells[sr][sc]\nif old != new:\n    cells[sr][sc] = new\n    stack = [(sr, sc)]\n    while stack:\n        x, y = stack.pop()\n        for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):\n            if 0 <= a < h and 0 <= b < w and cells[a][b] == old:\n                cells[a][b] = new           # paint it (this also marks it as seen)\n                stack.append((a, b))' },
        'A string cannot be changed in place in Python and Java, so work on a copy of each row as a list (or an array) of characters.'
      ]
    },
    statement: ['A picture is a grid of `h` rows and `w` columns of digits (colours). Paint the region of the cell `(sr, sc)` with the colour `color`: the region is the set of cells with the same colour as that cell that can be reached from it by moving up, down, left and right through cells of that colour. Print the picture after painting.'],
    outputFormat: ['`h` lines: the rows of the new picture.'],
    examples: [{ input: '3 3\n111\n110\n101\n2 2 2\n', note: 'The region of the cell (2, 2) has six cells; the cell in the bottom right corner has the same colour but is not connected to it: 222, 220, 201.' }],
    hints: ['Remember the old colour of the starting cell.', 'If the new colour equals the old one, change nothing.', 'Otherwise paint the cell and push it; for each neighbour with the old colour, paint it and push it.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]', 'sr:int sc:int color:int'],
      fast: true,
      python: r`
        cells = [list(row) for row in grid]
        sr -= 1
        sc -= 1
        old = cells[sr][sc]
        new = str(color)
        if old != new:
            cells[sr][sc] = new
            stack = [(sr, sc)]
            while stack:
                x, y = stack.pop()
                for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= a < h and 0 <= b < w and cells[a][b] == old:
                        cells[a][b] = new
                        stack.append((a, b))
        print("\n".join("".join(row) for row in cells))`,
      cpp: r`
        vector<string> cells = grid;
        int startRow = (int)sr - 1, startCol = (int)sc - 1;
        char oldColor = cells[startRow][startCol], newColor = (char)('0' + color);
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        if (oldColor != newColor) {
            cells[startRow][startCol] = newColor;
            vector<pair<int, int>> stack = {{startRow, startCol}};
            while (!stack.empty()) {
                pair<int, int> cell = stack.back();
                stack.pop_back();
                for (int d = 0; d < 4; d++) {
                    int a = cell.first + dx[d], b = cell.second + dy[d];
                    if (a >= 0 && a < h && b >= 0 && b < w && cells[a][b] == oldColor) {
                        cells[a][b] = newColor;
                        stack.push_back({a, b});
                    }
                }
            }
        }
        for (const string& row : cells) cout << row << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        char[][] cells = new char[rowsCount][];
        for (int i = 0; i < rowsCount; i++) cells[i] = grid[i].toCharArray();
        int startRow = (int) sr - 1, startCol = (int) sc - 1;
        char oldColor = cells[startRow][startCol], newColor = (char) ('0' + color);
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        if (oldColor != newColor) {
            cells[startRow][startCol] = newColor;
            ArrayList<int[]> stack = new ArrayList<>();
            stack.add(new int[] {startRow, startCol});
            while (!stack.isEmpty()) {
                int[] cell = stack.remove(stack.size() - 1);
                for (int d = 0; d < 4; d++) {
                    int a = cell[0] + dx[d], b = cell[1] + dy[d];
                    if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount && cells[a][b] == oldColor) {
                        cells[a][b] = newColor;
                        stack.add(new int[] {a, b});
                    }
                }
            }
        }
        StringBuilder out = new StringBuilder();
        for (char[] row : cells) out.append(new String(row)).append("\n");
        System.out.print(out);`
    },
    solution: { explanation: ['If the colours differ, the start cell is painted and pushed; every neighbour that still has the old colour is painted and pushed. Painting doubles as the "seen" mark.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) {
      const { h, w, cells, rs } = parseGrid(input); const [sr, sc, color] = nums(rs[1 + h]); const old = cells[sr - 1][sc - 1]; const grid2 = cells.map((row) => [...row]);
      if (old !== String(color)) { const stack = [[sr - 1, sc - 1]]; grid2[sr - 1][sc - 1] = String(color); while (stack.length) { const [x, y] = stack.pop(); for (const [dx, dy] of DIRS) { const a = x + dx, b = y + dy; if (a >= 0 && a < h && b >= 0 && b < w && grid2[a][b] === old) { grid2[a][b] = String(color); stack.push([a, b]); } } } }
      return grid2.map((row) => row.join('')).join('\n');
    },
    tests() {
      const g = rng(913); const out = ['3 3\n111\n110\n101\n2 2 2\n', '1 1\n5\n1 1 5\n', '1 1\n5\n1 1 7\n'];
      for (const [h, w, digits] of [[4, 5, '01'], [10, 10, '012'], [40, 60, '01'], [200, 200, '0123'], [200, 200, '01'], [200, 200, '0'], [1, 200, '01'], [200, 1, '01']]) {
        const cells = randomGrid(g, h, w, [...digits]);
        for (let t = 0; t < 2; t++) { const sr = randInt(g, 1, h), sc = randInt(g, 1, w); const color = t === 0 ? randInt(g, 0, 9) : Number(cells[sr - 1][sc - 1]); out.push(`${gridText(cells)}${sr} ${sc} ${color}\n`); }
      }
      return out;
    }
  },

  {
    ...grid,
    slug: 'land-perimeter',
    title: 'The Coast Line of the Land',
    tags: ['grid', 'counting'],
    concept: {
      title: 'Count the sides of land cells that touch water or the edge of the map',
      body: [
        'Not every grid problem needs a search. The **perimeter** of the land is the total length of its coast line: every side of a land cell that faces **water** or the **outside of the grid** is one unit of coast. So visit every land cell and look at its four sides.',
        { code: 'perimeter = 0\nfor r in range(h):\n    for c in range(w):\n        if grid[r][c] == "1":\n            for a, b in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):\n                if not (0 <= a < h and 0 <= b < w) or grid[a][b] == "0":\n                    perimeter += 1          # this side is coast' },
        'Another way to see it: every land cell has 4 sides, and a side that is shared with another land cell is not coast, so `perimeter = 4 * (number of land cells) - 2 * (number of pairs of side-by-side land cells)`. Both ways take O(h * w). The grid can contain several islands and lakes; the rule counts every coast, inner ones included.'
      ]
    },
    statement: ['A map is a grid of `h` rows and `w` columns with land (`1`) and water (`0`). Count the sides of land cells that face a water cell or the outside of the grid, and print the number.'],
    outputFormat: ['Print the perimeter.'],
    examples: [{ input: '4 4\n0100\n1110\n0100\n1100\n', note: 'Seven land cells have 28 sides; six of the sides are shared by two land cells, so 28 - 12 = 16.' }],
    hints: ['Look at the four sides of every land cell.', 'A side counts if the neighbour is outside the grid or is water.', 'Add up all those sides.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        perimeter = 0
        for r in range(h):
            for c in range(w):
                if grid[r][c] == "1":
                    for a, b in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                        if not (0 <= a < h and 0 <= b < w) or grid[a][b] == "0":
                            perimeter += 1
        print(perimeter)`,
      cpp: r`
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        long long perimeter = 0;
        for (int r = 0; r < h; r++) {
            for (int c = 0; c < w; c++) {
                if (grid[r][c] != '1') continue;
                for (int d = 0; d < 4; d++) {
                    int a = r + dx[d], b = c + dy[d];
                    if (a < 0 || a >= h || b < 0 || b >= w || grid[a][b] == '0') perimeter++;
                }
            }
        }
        cout << perimeter << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        long perimeter = 0;
        for (int r = 0; r < rowsCount; r++) {
            for (int c = 0; c < colsCount; c++) {
                if (grid[r].charAt(c) != '1') continue;
                for (int d = 0; d < 4; d++) {
                    int a = r + dx[d], b = c + dy[d];
                    if (a < 0 || a >= rowsCount || b < 0 || b >= colsCount || grid[a].charAt(b) == '0') perimeter++;
                }
            }
        }
        System.out.println(perimeter);`
    },
    solution: { explanation: ['Each side of a land cell that faces water or the outside of the grid is counted; the sum is the perimeter.'], complexity: 'Time O(h * w), space O(1).' },
    solve(input) {
      const { h, w, cells } = parseGrid(input); let p = 0;
      for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) if (cells[x][y] === '1') { p += 4; if (x + 1 < h && cells[x + 1][y] === '1') p -= 2; if (y + 1 < w && cells[x][y + 1] === '1') p -= 2; }
      return String(p);
    },
    tests() { const g = rng(914); return ['4 4\n0100\n1110\n0100\n1100\n', ...gridShapes(g)]; }
  },

  {
    ...grid,
    slug: 'enclosed-land-cells',
    title: 'Land That Cannot Reach the Edge',
    tags: ['graph', 'grid', 'bfs', 'multi-source'],
    concept: {
      title: 'Start the search from the border instead of from every cell',
      body: [
        'A land cell is *enclosed* if you cannot walk from it over land cells (moving by sides) to a cell on the **border** of the grid. To count the enclosed cells, it is easier to count the opposite: the land cells that **can** reach the border, and subtract from the total number of land cells.',
        'Which cells can reach the border? Think of it from the other end: start a search from **all land cells on the border at once**, and flood the land from there. Every cell that gets marked can walk back to the border. This is a **multi-source search**: the stack (or queue) simply starts with several cells instead of one.',
        { code: 'stack = []\nfor r in range(h):\n    for c in range(w):\n        on_border = r in (0, h - 1) or c in (0, w - 1)\n        if on_border and grid[r][c] == "1":\n            seen[r][c] = True\n            stack.append((r, c))\n# ... flood from all of them, then:\nenclosed = total_land - number_of_marked_cells' },
        'One flood fill replaces a search from every cell, which would be much slower. "Search from the target(s) backwards" is a common trick: it answers the question for all cells in a single pass.'
      ]
    },
    statement: ['A map is a grid of `h` rows and `w` columns with land (`1`) and water (`0`). A land cell is enclosed if it is impossible to walk from it, moving up, down, left or right over land cells only, to a land cell on the border of the grid (the first or last row or column). Print the number of enclosed land cells.'],
    outputFormat: ['Print the number of enclosed land cells.'],
    examples: [{ input: '4 4\n0000\n1010\n0110\n0000\n', note: 'The cell in the second row at the left edge touches the border. The other three land cells form a group that cannot reach the border: 3.' }],
    hints: ['Count all the land cells.', 'Start a flood fill from all the land cells on the border at once and count the cells it marks.', 'The answer is the total minus the marked cells.'],
    program: {
      io: ['h:int w:int', 'grid:rows[h]'],
      fast: true,
      python: r`
        seen = [[False] * w for _ in range(h)]
        stack = []
        total = 0
        for r in range(h):
            for c in range(w):
                if grid[r][c] == "1":
                    total += 1
                    if r in (0, h - 1) or c in (0, w - 1):
                        seen[r][c] = True
                        stack.append((r, c))
        reached = len(stack)
        while stack:
            x, y = stack.pop()
            for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= a < h and 0 <= b < w and grid[a][b] == "1" and not seen[a][b]:
                    seen[a][b] = True
                    reached += 1
                    stack.append((a, b))
        print(total - reached)`,
      cpp: r`
        vector<vector<char>> seen(h, vector<char>(w, 0));
        vector<pair<int, int>> stack;
        long long total = 0;
        for (int r = 0; r < h; r++) {
            for (int c = 0; c < w; c++) {
                if (grid[r][c] != '1') continue;
                total++;
                if (r == 0 || r == h - 1 || c == 0 || c == w - 1) {
                    seen[r][c] = 1;
                    stack.push_back({r, c});
                }
            }
        }
        long long reached = (long long)stack.size();
        int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
        while (!stack.empty()) {
            pair<int, int> cell = stack.back();
            stack.pop_back();
            for (int d = 0; d < 4; d++) {
                int a = cell.first + dx[d], b = cell.second + dy[d];
                if (a >= 0 && a < h && b >= 0 && b < w && grid[a][b] == '1' && !seen[a][b]) {
                    seen[a][b] = 1;
                    reached++;
                    stack.push_back({a, b});
                }
            }
        }
        cout << total - reached << "\n";`,
      java: r`
        int rowsCount = (int) h, colsCount = (int) w;
        boolean[][] seen = new boolean[rowsCount][colsCount];
        ArrayList<int[]> stack = new ArrayList<>();
        long total = 0;
        for (int r = 0; r < rowsCount; r++) {
            for (int c = 0; c < colsCount; c++) {
                if (grid[r].charAt(c) != '1') continue;
                total++;
                if (r == 0 || r == rowsCount - 1 || c == 0 || c == colsCount - 1) {
                    seen[r][c] = true;
                    stack.add(new int[] {r, c});
                }
            }
        }
        long reached = stack.size();
        int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
        while (!stack.isEmpty()) {
            int[] cell = stack.remove(stack.size() - 1);
            for (int d = 0; d < 4; d++) {
                int a = cell[0] + dx[d], b = cell[1] + dy[d];
                if (a >= 0 && a < rowsCount && b >= 0 && b < colsCount && grid[a].charAt(b) == '1' && !seen[a][b]) {
                    seen[a][b] = true;
                    reached++;
                    stack.add(new int[] {a, b});
                }
            }
        }
        System.out.println(total - reached);`
    },
    solution: { explanation: ['A flood fill starts from all land cells on the border at once; the land cells it does not mark are the enclosed ones.'], complexity: 'Time O(h * w), space O(h * w).' },
    solve(input) {
      const { h, w, cells } = parseGrid(input); const start = []; let total = 0;
      for (let x = 0; x < h; x++) for (let y = 0; y < w; y++) if (cells[x][y] === '1') { total++; if (x === 0 || y === 0 || x === h - 1 || y === w - 1) start.push([x, y]); }
      const seen = fillOf(cells, start); let reached = 0; for (const row of seen) for (const v of row) if (v) reached++;
      return String(total - reached);
    },
    tests() { const g = rng(915); return ['4 4\n0000\n1010\n0110\n0000\n', ...gridShapes(g)]; }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `m`: the number of courses (numbered 1 to n) and the number of rules.', 'Each of the next `m` lines has two numbers `u` and `v`: the course `u` must be finished before the course `v` can start.'],
    constraints: EDGE_LIMITS.slice(0, 2).concat(['No self-loops and no repeated rules.']),
    slug: 'can-finish-courses',
    title: 'Can All the Courses Be Finished?',
    tags: ['graph', 'directed-graph', 'topological-sort', 'cycle'],
    concept: {
      title: 'Take courses whose prerequisites are done; if you get stuck, there is a cycle',
      body: [
        'A *directed* edge `u -> v` here means "`u` must be finished before `v`". Is there an order in which all courses can be taken? Such an order is called a **topological order**. It exists exactly when the graph has **no directed cycle**: with a cycle `a -> b -> a` neither course could ever start.',
        '*Kahn\'s algorithm* finds out. Count for every course the number of prerequisites that are still unfinished, its **in-degree**. The courses with in-degree 0 can be taken now: put them in a queue. When a course is taken, it is finished, so every course that needed it has one prerequisite less (**decrease its in-degree**); if it reaches 0, it can be taken, too. If the queue runs empty before all `n` courses were taken, the rest wait for each other in a cycle.',
        { code: 'indeg = [0] * (n + 1)\nfor u, v in edges:\n    adj[u].append(v)\n    indeg[v] += 1\nqueue = [v for v in range(1, n + 1) if indeg[v] == 0]\nfor u in queue:                        # the list grows while we walk through it\n    for v in adj[u]:\n        indeg[v] -= 1\n        if indeg[v] == 0:\n            queue.append(v)\nok = (len(queue) == n)' },
        'The queue, in the order in which courses entered it, is itself a valid topological order (the next tasks will use it). The time is O(n + m).'
      ]
    },
    statement: ['There are `n` courses and `m` rules. A rule `u v` means that the course `u` must be finished before the course `v` can start. Print `yes` if all the courses can be finished (one after another, in some order) and `no` otherwise.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '4 3\n1 2\n2 3\n3 4\n', note: 'Take the courses in the order 1, 2, 3, 4: yes.' }, { input: '3 3\n1 2\n2 3\n3 1\n', note: 'Each course waits for another: no.' }],
    hints: ['Count for every course how many rules end at it (its in-degree).', 'Put the courses with in-degree 0 in a queue; taking one lowers the in-degree of the courses that follow it.', 'If all n courses went through the queue, the answer is yes.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: J(DIR.python, r`
        indeg = [0] * (n + 1)
        for u, v in edges:
            indeg[v] += 1
        queue = [v for v in range(1, n + 1) if indeg[v] == 0]
        for u in queue:
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    queue.append(v)
        print("yes" if len(queue) == n else "no")`),
      cpp: J(DIR.cpp, r`
        vector<int> indeg(n + 1, 0);
        for (const vector<long long>& e : edges) indeg[e[1]]++;
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
        cout << ((long long)queue.size() == n ? "yes" : "no") << "\n";`),
      java: J(DIR.java, r`
        int[] indeg = new int[nodes + 1];
        for (long[] e : edges) indeg[(int) e[1]]++;
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
        System.out.println(queue.size() == nodes ? "yes" : "no");`)
    },
    solution: { explanation: ['Kahn\'s algorithm takes the courses whose in-degree is 0 and lowers the in-degree of their followers. All courses can be finished exactly when all n pass through the queue.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges, true); const indeg = new Array(n + 1).fill(0); for (const [, v] of edges) indeg[v]++;
      const q = []; for (let v = 1; v <= n; v++) if (!indeg[v]) q.push(v); for (let h = 0; h < q.length; h++) for (const v of adj[q[h]]) if (--indeg[v] === 0) q.push(v);
      return q.length === n ? 'yes' : 'no';
    },
    tests() {
      const g = rng(916); const out = ['4 3\n1 2\n2 3\n3 4\n', '3 3\n1 2\n2 3\n3 1\n', '2 1\n2 1\n'];
      for (const [n, m] of [[5, 6], [30, 40], [1000, 2000], [20000, 30000], [20000, 19999]]) out.push(graphText(n, shuffle(g, randomDag(g, n, m))));
      for (const [n, m] of [[5, 8], [30, 40], [1000, 1100], [20000, 20500], [20000, 30000]]) out.push(graphText(n, shuffle(g, randomDirected(g, n, m))));
      // a long chain, and the same chain with one edge going back
      const chain = many(19999, (i) => [i + 1, i + 2]); out.push(graphText(20000, chain), graphText(20000, [...chain, [20000, 1]]), graphText(20000, [...chain, [20000, 10000]]));
      const dag = randomDag(g, 20000, 25000); out.push(graphText(20000, [...dag, [dag[100][1], dag[100][0]]]));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has `n` and `m`: the number of rooms (numbered 1 to n) and the number of keys.', 'Each of the next `m` lines has two numbers `u` and `v`: the room `u` contains a key to the room `v`.'],
    constraints: EDGE_LIMITS.slice(0, 2).concat(['No self-loops and no repeated keys.']),
    slug: 'keys-and-rooms',
    title: 'Can You Visit Every Room?',
    tags: ['graph', 'directed-graph', 'dfs', 'reachability'],
    concept: {
      title: 'Reachability: follow the arrows from the start and see what you reach',
      body: [
        'In a **directed graph** you can follow an edge only in its own direction. Here the nodes are rooms, and an edge `u -> v` means "the room `u` holds a key to the room `v`". You start in room 1 (it is open). You can enter a room only if you have found its key in a room you have already entered. The question is whether you can enter **all** rooms.',
        'The set of rooms that can be entered is exactly the set of nodes **reachable** from room 1 by following the edges. A search from room 1 (using a stack or a queue) that follows only the outgoing edges finds all of them; count the visited rooms and compare with `n`.',
        { code: 'seen = [False] * (n + 1)\nseen[1] = True\nstack = [1]\nvisited = 1\nwhile stack:\n    room = stack.pop()\n    for key in adj[room]:            # the rooms whose key is in this room\n        if not seen[key]:\n            seen[key] = True\n            visited += 1\n            stack.append(key)\nprint("yes" if visited == n else "no")' },
        'Note that the answer is not symmetric: reaching room 4 from room 1 does not mean you can get back to room 1. Reachability in a directed graph depends on the direction of the edges, which is the main difference from the undirected graphs of the first tasks.'
      ]
    },
    statement: ['There are `n` rooms. Room 1 is open and you are in it. An edge `u v` means that room `u` contains a key to room `v`. You can enter a room as soon as you have found its key in a room that you have entered. Print `yes` if you can enter all the rooms and `no` otherwise.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '4 3\n1 2\n2 3\n3 4\n', note: 'The keys lead 1, 2, 3, 4: yes.' }, { input: '4 3\n1 3\n3 1\n2 4\n', note: 'From room 1 you can only reach the rooms 1 and 3: no.' }],
    hints: ['Follow the keys from room 1 with a stack or a queue.', 'Only follow an edge in its own direction.', 'Count the rooms you reached; the answer is yes if it is n.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: J(DIR.python, r`
        seen = [False] * (n + 1)
        seen[1] = True
        stack = [1]
        visited = 1
        while stack:
            room = stack.pop()
            for key in adj[room]:
                if not seen[key]:
                    seen[key] = True
                    visited += 1
                    stack.append(key)
        print("yes" if visited == n else "no")`),
      cpp: J(DIR.cpp, r`
        vector<char> seen(n + 1, 0);
        seen[1] = 1;
        vector<int> stack = {1};
        long long visited = 1;
        while (!stack.empty()) {
            int room = stack.back();
            stack.pop_back();
            for (int key : adj[room]) {
                if (!seen[key]) {
                    seen[key] = 1;
                    visited++;
                    stack.push_back(key);
                }
            }
        }
        cout << (visited == n ? "yes" : "no") << "\n";`),
      java: J(DIR.java, r`
        boolean[] seen = new boolean[nodes + 1];
        seen[1] = true;
        ArrayList<Integer> stack = new ArrayList<>();
        stack.add(1);
        int visited = 1;
        while (!stack.isEmpty()) {
            int room = stack.remove(stack.size() - 1);
            for (int key : adj.get(room)) {
                if (!seen[key]) {
                    seen[key] = true;
                    visited++;
                    stack.add(key);
                }
            }
        }
        System.out.println(visited == nodes ? "yes" : "no");`)
    },
    solution: { explanation: ['A search from room 1 that follows the edges in their direction visits exactly the rooms that can be entered; the answer is yes when it visits all n rooms.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges, true); const seen = new Array(n + 1).fill(false); seen[1] = true; const q = [1];
      for (let h = 0; h < q.length; h++) for (const v of adj[q[h]]) if (!seen[v]) { seen[v] = true; q.push(v); }
      return q.length === n ? 'yes' : 'no';
    },
    tests() {
      const g = rng(917); const out = ['4 3\n1 2\n2 3\n3 4\n', '4 3\n1 3\n3 1\n2 4\n', '2 1\n2 1\n', '2 1\n1 2\n'];
      for (const [n, m] of [[5, 8], [30, 60], [1000, 3000], [20000, 30000], [20000, 20000]]) out.push(graphText(n, shuffle(g, randomDirected(g, n, m))));
      // every room reachable (a random tree directed away from room 1, plus extra keys), and the same without one key
      for (const n of [8, 200, 20000]) { const tree = randomTreeEdges(g, n); const adj = adjacency(n, tree); const seen = new Array(n + 1).fill(false); seen[1] = true; const q = [1]; const e = []; for (let h = 0; h < q.length; h++) for (const w of adj[q[h]]) if (!seen[w]) { seen[w] = true; q.push(w); e.push([q[h], w]); } out.push(graphText(n, shuffle(g, e.slice()))); out.push(graphText(n, shuffle(g, e.slice(1)))); }
      return out;
    }
  },

  {
    ...edgesIn,
    slug: 'cycle-in-undirected-graph',
    title: 'Does the Graph Contain a Cycle?',
    tags: ['graph', 'union-find', 'cycle'],
    concept: {
      title: 'Union-find: merge the groups of the two ends of every edge; an edge inside one group closes a cycle',
      body: [
        'A *cycle* in an undirected graph is a walk that returns to its start without using an edge twice, such as the triangle `1-2-3-1`. A graph without cycles is a **forest** (a tree if it is also connected). To find a cycle, process the edges one by one and keep track of which nodes are already connected by the edges seen so far. If the next edge joins two nodes that are **already connected**, it closes a cycle.',
        'A structure made for this is the **disjoint set union**, also called *union-find*. Every node is in a group, and every group has a *root* node as its name. Two operations: **find(x)** returns the root of the group of `x`; **union(a, b)** merges the two groups. To make `find` fast, the parent links are shortened while walking up (*path compression*).',
        { code: 'parent = list(range(n + 1))               # every node is its own group\ndef find(x):\n    while parent[x] != x:\n        parent[x] = parent[parent[x]]       # shorten the road to the root\n        x = parent[x]\n    return x\n\ncycle = False\nfor u, v in edges:\n    a, b = find(u), find(v)\n    if a == b:\n        cycle = True                        # u and v were already connected\n        break\n    parent[a] = b                           # merge the groups' },
        'With path compression every operation is almost O(1). This structure appears again in the next tasks: counting groups, the minimum spanning tree, and groups that change over time. A search with a stack and "parent" bookkeeping also works, but union-find is shorter and has no recursion.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges (no self-loops and no repeated edges). Print `yes` if the graph contains a cycle and `no` otherwise.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '4 4\n1 2\n2 3\n3 4\n4 2\n', note: 'The nodes 2, 3 and 4 form a cycle: yes.' }, { input: '4 3\n1 2\n2 3\n3 4\n', note: 'A path has no cycle: no.' }],
    hints: ['Start with every node as its own group.', 'For each edge find the groups of its two ends; if they are the same group, there is a cycle.', 'Otherwise merge the two groups.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      helpers: {
        python: r`
          parent = []

          def find(x):
              while parent[x] != x:
                  parent[x] = parent[parent[x]]
                  x = parent[x]
              return x`,
        cpp: r`
          vector<int> parent;

          int findRoot(int x) {
              while (parent[x] != x) {
                  parent[x] = parent[parent[x]];
                  x = parent[x];
              }
              return x;
          }`,
        java: r`
          static int[] parent;

          static int findRoot(int x) {
              while (parent[x] != x) {
                  parent[x] = parent[parent[x]];
                  x = parent[x];
              }
              return x;
          }`
      },
      python: r`
        parent.extend(range(n + 1))
        cycle = False
        for u, v in edges:
            a, b = find(u), find(v)
            if a == b:
                cycle = True
                break
            parent[a] = b
        print("yes" if cycle else "no")`,
      cpp: r`
        parent.resize(n + 1);
        for (int v = 0; v <= n; v++) parent[v] = v;
        bool cycle = false;
        for (const vector<long long>& e : edges) {
            int a = findRoot((int)e[0]), b = findRoot((int)e[1]);
            if (a == b) {
                cycle = true;
                break;
            }
            parent[a] = b;
        }
        cout << (cycle ? "yes" : "no") << "\n";`,
      java: r`
        int nodes = (int) n;
        parent = new int[nodes + 1];
        for (int v = 0; v <= nodes; v++) parent[v] = v;
        boolean cycle = false;
        for (long[] e : edges) {
            int a = findRoot((int) e[0]), b = findRoot((int) e[1]);
            if (a == b) {
                cycle = true;
                break;
            }
            parent[a] = b;
        }
        System.out.println(cycle ? "yes" : "no");`
    },
    solution: { explanation: ['With union-find, an edge whose two ends already have the same root closes a cycle; otherwise the two groups are merged.'], complexity: 'Time O((n + m) * alpha(n)), space O(n).' },
    solve(input) { const { n, m, edges } = parse(input); return m > n - components(n, edges).count ? 'yes' : 'no'; },
    tests() {
      const g = rng(918); const out = ['4 4\n1 2\n2 3\n3 4\n4 2\n', '4 3\n1 2\n2 3\n3 4\n', '3 3\n1 2\n2 3\n3 1\n'];
      for (const kind of ['random', 'path', 'star', 'binary']) for (const n of [6, 100, 20000]) out.push(graphText(n, mix(g, randomTreeEdges(g, n, kind))));
      // forests with several components, and the same forest with one extra edge
      for (const n of [10, 300, 20000]) { const k = Math.floor(n / 2); const a = randomTreeEdges(g, k), b = randomTreeEdges(g, n - k).map(([u, v]) => [u + k, v + k]); const forest = [...a, ...b]; out.push(graphText(n, mix(g, forest))); const have = new Set(forest.map(([u, v]) => Math.min(u, v) * (n + 1) + Math.max(u, v))); for (;;) { const u = randInt(g, 1, n), v = randInt(g, 1, n); if (u === v || have.has(Math.min(u, v) * (n + 1) + Math.max(u, v))) continue; out.push(graphText(n, mix(g, [...forest, [u, v]]))); break; } }
      for (const [n, e] of [[5, E(g, 5, 5)], [200, E(g, 200, 300)], [20000, E(g, 20000, 30000)]]) out.push(graphText(n, e));
      return out;
    }
  },

  {
    ...edgesIn,
    slug: 'two-colourable-graph',
    title: 'Can the Nodes Be Painted in Two Colours?',
    tags: ['graph', 'bfs', 'bipartite'],
    concept: {
      title: 'Colour a node, then give its neighbours the other colour; a clash means an odd cycle',
      body: [
        'Can every node be painted red or blue so that **every edge joins a red and a blue node**? Such a graph is called *bipartite* (two-sided). Think of a class where every friendship is between a boy and a girl, or of tasks that must be shared between two workers so that conflicting tasks go to different workers.',
        'Try it by force, because the colours are forced: paint a start node red; all its neighbours must be blue; their neighbours red; and so on. This is a breadth-first search that **alternates the colour at every step**. If a node ever has to be both colours, that is, an edge joins two nodes of the **same colour**, then two colours are not enough. (This happens exactly when the graph has a cycle of **odd length**, like a triangle.)',
        { code: 'color = [-1] * (n + 1)                 # -1 means "not painted yet"\nok = True\nfor start in range(1, n + 1):          # the graph may have several components\n    if color[start] != -1:\n        continue\n    color[start] = 0\n    queue = [start]\n    for v in queue:\n        for w in adj[v]:\n            if color[w] == -1:\n                color[w] = 1 - color[v]\n                queue.append(w)\n            elif color[w] == color[v]:     # an edge inside one colour\n                ok = False' },
        'Each component is started separately, because they do not affect each other. The time is O(n + m). The colour array also works as the "seen" array.'
      ]
    },
    statement: ['An undirected graph has `n` nodes and `m` edges. Can every node be painted with one of two colours so that the two ends of every edge have different colours? Print `yes` or `no`.'],
    outputFormat: ['Print `yes` or `no`.'],
    examples: [{ input: '4 4\n1 2\n2 3\n3 4\n4 1\n', note: 'A cycle of four nodes: paint 1 and 3 red, 2 and 4 blue: yes.' }, { input: '3 3\n1 2\n2 3\n3 1\n', note: 'A triangle needs three colours: no.' }],
    hints: ['Paint the start node 0, its neighbours 1, their neighbours 0, and so on.', 'If an edge joins two nodes of the same colour, the answer is no.', 'Start a new search for every component that is not painted yet.'],
    program: {
      io: ['n:int m:int', 'edges:int[m][2]'],
      fast: true,
      python: J(ADJ.python, r`
        color = [-1] * (n + 1)
        ok = True
        for start in range(1, n + 1):
            if color[start] != -1:
                continue
            color[start] = 0
            queue = [start]
            for v in queue:
                for w in adj[v]:
                    if color[w] == -1:
                        color[w] = 1 - color[v]
                        queue.append(w)
                    elif color[w] == color[v]:
                        ok = False
        print("yes" if ok else "no")`),
      cpp: J(ADJ.cpp, r`
        vector<int> color(n + 1, -1);
        bool ok = true;
        for (int start = 1; start <= n; start++) {
            if (color[start] != -1) continue;
            color[start] = 0;
            vector<int> queue = {start};
            for (size_t i = 0; i < queue.size(); i++) {
                int v = queue[i];
                for (int w : adj[v]) {
                    if (color[w] == -1) {
                        color[w] = 1 - color[v];
                        queue.push_back(w);
                    } else if (color[w] == color[v]) {
                        ok = false;
                    }
                }
            }
        }
        cout << (ok ? "yes" : "no") << "\n";`),
      java: J(ADJ.java, r`
        int[] color = new int[nodes + 1];
        Arrays.fill(color, -1);
        boolean ok = true;
        for (int start = 1; start <= nodes; start++) {
            if (color[start] != -1) continue;
            color[start] = 0;
            List<Integer> queue = new ArrayList<>();
            queue.add(start);
            for (int i = 0; i < queue.size(); i++) {
                int v = queue.get(i);
                for (int w : adj.get(v)) {
                    if (color[w] == -1) {
                        color[w] = 1 - color[v];
                        queue.add(w);
                    } else if (color[w] == color[v]) {
                        ok = false;
                    }
                }
            }
        }
        System.out.println(ok ? "yes" : "no");`)
    },
    solution: { explanation: ['A breadth-first search alternates the colour at every step in each component; an edge between two nodes of the same colour shows that two colours are not enough.'], complexity: 'Time O(n + m), space O(n + m).' },
    solve(input) {
      const { n, edges } = parse(input); const adj = adjacency(n, edges); const color = new Array(n + 1).fill(-1);
      for (let s = 1; s <= n; s++) { if (color[s] !== -1) continue; color[s] = 0; const q = [s]; for (let h = 0; h < q.length; h++) for (const w of adj[q[h]]) { if (color[w] === -1) { color[w] = 1 - color[q[h]]; q.push(w); } else if (color[w] === color[q[h]]) return 'no'; } }
      return 'yes';
    },
    tests() {
      const g = rng(919); const out = ['4 4\n1 2\n2 3\n3 4\n4 1\n', '3 3\n1 2\n2 3\n3 1\n', '2 1\n1 2\n'];
      for (const kind of ['random', 'path', 'star', 'binary']) for (const n of [6, 100, 20000]) out.push(graphText(n, mix(g, randomTreeEdges(g, n, kind))));
      // bipartite graphs: edges only between the two halves; and the same with one edge inside a half
      for (const [n, m] of [[8, 10], [200, 800], [20000, 30000]]) { const half = Math.floor(n / 2); const seen = new Set(); const e = []; while (e.length < Math.min(m, half * (n - half))) { const u = randInt(g, 1, half), v = randInt(g, half + 1, n); if (seen.has(u * (n + 1) + v)) continue; seen.add(u * (n + 1) + v); e.push([u, v]); } out.push(graphText(n, mix(g, e))); out.push(graphText(n, mix(g, [...e, [1, 2]]))); }
      for (const [n, e] of [[5, E(g, 5, 6)], [60, E(g, 60, 70)], [20000, E(g, 20000, 20100)]]) out.push(graphText(n, e));
      const cycleEven = many(20000, (i) => [i + 1, (i + 1) % 20000 + 1]); out.push(graphText(20000, cycleEven), graphText(19999, many(19999, (i) => [i + 1, (i + 1) % 19999 + 1])));
      return out;
    }
  },

  {
    ...easy,
    inputFormat: ['The first line has the gene `start`, the second line the gene `end`; both have 8 letters from `A`, `C`, `G`, `T`.', 'The third line has `k`, the number of genes in the bank.', 'The fourth line has the `k` genes of the bank (8 letters each, all different).'],
    constraints: ['1 <= k <= 300', 'All genes have 8 letters from A, C, G and T.', 'The start gene does not have to be in the bank.'],
    slug: 'gene-mutations',
    title: 'The Fewest Mutations to Reach a Gene',
    tags: ['graph', 'bfs', 'strings', 'implicit-graph'],
    concept: {
      title: 'Sometimes the graph is not given: the nodes are objects, and a rule tells which are neighbours',
      body: [
        'A gene is a string of 8 letters. One *mutation* changes exactly one letter, and a mutation is allowed only if the new gene is in the **bank** of valid genes. What is the smallest number of mutations that turns the `start` gene into the `end` gene? This is a shortest-path problem in a graph that is **never written down**: the nodes are genes, and two genes are joined by an edge when they **differ in exactly one position**.',
        'You do not have to build all the edges. Run the breadth-first search of the distance task and, when you take a gene from the queue, **compute its neighbours on the spot**: the bank genes that differ from it in exactly one letter. With at most 300 genes, comparing the current gene with every bank gene is fast enough (300 * 300 * 8 letter comparisons).',
        { code: 'def one_apart(a, b):\n    return sum(x != y for x, y in zip(a, b)) == 1\n\ndist = {start: 0}\nqueue = [start]\nfor gene in queue:\n    for other in bank:\n        if other not in dist and one_apart(gene, other):\n            dist[other] = dist[gene] + 1\n            queue.append(other)\nprint(dist.get(end, -1))' },
        'This idea, a BFS over **states** with a rule that produces the neighbours, solves puzzles (sliding tiles, locks, word ladders) and is used again in later tasks. A dictionary keyed by the state replaces the distance array. Note that the answer is 0 if `start == end`, and -1 if `end` cannot be reached (including the case when `end` is not in the bank).'
      ]
    },
    statement: ['A gene is a string of 8 letters from `A`, `C`, `G`, `T`. A mutation changes exactly one letter of a gene, and the new gene must be in the bank (the start gene does not have to be). Print the smallest number of mutations that turn `start` into `end`, or -1 if it is impossible.'],
    outputFormat: ['Print the smallest number of mutations, or -1.'],
    examples: [{ input: 'AACCGGTT\nAACCGGTA\n1\nAACCGGTA\n', note: 'One letter changes: 1.' }, { input: 'AACCGGTT\nAAACGGTA\n3\nAACCGGTA AACCGCTA AAACGGTA\n', note: 'AACCGGTT -> AACCGGTA -> AAACGGTA: 2.' }],
    hints: ['The genes are the nodes; two genes are neighbours if they differ in exactly one letter.', 'Run a breadth-first search from the start gene, taking only genes of the bank.', 'The distance of the end gene is the answer; if it is never reached, print -1.'],
    program: {
      io: ['start:word', 'end:word', 'k:int', 'bank:word[k]'],
      fast: true,
      python: r`
        def one_apart(a, b):
            return sum(x != y for x, y in zip(a, b)) == 1

        dist = {start: 0}
        queue = [start]
        for gene in queue:
            for other in bank:
                if other not in dist and one_apart(gene, other):
                    dist[other] = dist[gene] + 1
                    queue.append(other)
        print(dist.get(end, -1))`,
      cpp: r`
        auto oneApart = [](const string& a, const string& b) {
            int differences = 0;
            for (size_t i = 0; i < a.size(); i++) {
                if (a[i] != b[i]) differences++;
            }
            return differences == 1;
        };
        map<string, int> dist;
        dist[start] = 0;
        vector<string> queue = {start};
        for (size_t i = 0; i < queue.size(); i++) {
            string gene = queue[i];
            for (const string& other : bank) {
                if (!dist.count(other) && oneApart(gene, other)) {
                    dist[other] = dist[gene] + 1;
                    queue.push_back(other);
                }
            }
        }
        cout << (dist.count(end) ? dist[end] : -1) << "\n";`,
      java: r`
        Map<String, Integer> dist = new HashMap<>();
        dist.put(start, 0);
        List<String> queue = new ArrayList<>();
        queue.add(start);
        for (int i = 0; i < queue.size(); i++) {
            String gene = queue.get(i);
            for (String other : bank) {
                if (dist.containsKey(other)) continue;
                int differences = 0;
                for (int p = 0; p < gene.length(); p++) {
                    if (gene.charAt(p) != other.charAt(p)) differences++;
                }
                if (differences == 1) {
                    dist.put(other, dist.get(gene) + 1);
                    queue.add(other);
                }
            }
        }
        System.out.println(dist.containsKey(end) ? dist.get(end) : -1);`,
      includes: ['<map>']
    },
    solution: { explanation: ['A breadth-first search over genes: the neighbours of a gene are the bank genes that differ from it in exactly one letter. The distance of the end gene is the answer, or -1 if it is never reached.'], complexity: 'Time O(k^2 * 8), space O(k).' },
    solve(input) {
      const rs = rows(input); const start = rs[0], end = rs[1], bank = rs[3].split(' '); const dist = new Map([[start, 0]]); const q = [start];
      const apart = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d === 1; };
      for (let h = 0; h < q.length; h++) for (const o of bank) if (!dist.has(o) && apart(q[h], o)) { dist.set(o, dist.get(q[h]) + 1); q.push(o); }
      return String(dist.has(end) ? dist.get(end) : -1);
    },
    tests() {
      const g = rng(920); const out = ['AACCGGTT\nAACCGGTA\n1\nAACCGGTA\n', 'AACCGGTT\nAAACGGTA\n3\nAACCGGTA AACCGCTA AAACGGTA\n', 'AACCGGTT\nAACCGGTA\n1\nAACCGCTA\n', 'AAAAAAAA\nAAAAAAAA\n1\nAAAAAAAC\n'];
      const mutate = (gene) => { const i = randInt(g, 0, 7); const letters = 'ACGT'.replace(gene[i], ''); return gene.slice(0, i) + letters[randInt(g, 0, 2)] + gene.slice(i + 1); };
      for (const [k, walk] of [[5, 3], [20, 10], [60, 25], [150, 60], [300, 120], [300, 299], [300, 40]]) {
        const start = many(8, () => 'ACGT'[randInt(g, 0, 3)]).join(''); const bank = new Set(); let cur = start; let last = start;
        for (let i = 0; i < walk && bank.size < k; i++) { cur = mutate(cur); if (cur !== start) { bank.add(cur); last = cur; } if (g() < 0.2) cur = [...bank][randInt(g, 0, Math.max(0, bank.size - 1))] || cur; }
        while (bank.size < k) { const x = many(8, () => 'ACGT'[randInt(g, 0, 3)]).join(''); if (x !== start) bank.add(x); }
        const list = shuffle(g, [...bank]); out.push(`${start}\n${g() < 0.8 ? last : mutate(start)}\n${list.length}\n${list.join(' ')}\n`);
      }
      return out;
    }
  }
];
