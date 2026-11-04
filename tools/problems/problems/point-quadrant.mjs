import { many, rng, randInt } from '../lib.mjs';
const r = String.raw;

export default {
  slug: 'point-quadrant',
  title: 'Where Is the Point?',
  topic: 'basics',
  difficulty: 'easy',
  order: 30,
  tags: ['conditions', 'geometry'],

  concept: {
    title: 'Nested conditions',
    body: [
      'An `if` can sit inside another `if`. The inner decision is only made when the outer condition is true. This is called **nesting**, and it is a natural way to ask a question in steps: first "is the point on an axis?", and only if not, "which quadrant is it in?".',
      'The plane is divided by the two axes into four quadrants: 1 (x and y positive), 2 (x negative, y positive), 3 (both negative) and 4 (x positive, y negative). Points with `x = 0` or `y = 0` lie on an axis and belong to no quadrant.',
      'Handle the special cases (origin, axes) before the general ones, so the general code can assume that both coordinates are non-zero.'
    ]
  },

  statement: [
    'Given the coordinates `x` and `y` of a point, print where it is:',
    { list: ['`origin` if it is at (0, 0)', '`x-axis` if it is on the x axis (y = 0, x not 0)', '`y-axis` if it is on the y axis (x = 0, y not 0)', '`quadrant 1`, `quadrant 2`, `quadrant 3` or `quadrant 4` otherwise'] }
  ],
  inputFormat: ['One line with two integers `x` and `y`.'],
  outputFormat: ['One line as described above.'],
  constraints: ['-10^9 <= x, y <= 10^9'],
  examples: [{ input: '3 4\n', note: 'Both positive: quadrant 1.' }, { input: '-2 5\n', note: 'x negative, y positive: quadrant 2.' }, { input: '0 7\n', note: 'On the y axis.' }],
  hints: [
    'Handle the points on the axes first: what is true for the origin? for the x axis?',
    'For all other points, look at the signs of `x` and `y`.',
    'Two signs give four combinations. Nested ifs or two-condition checks both work.'
  ],
  program: {
    io: ['x:int y:int'],
    python: r`
      if x == 0 and y == 0:
          print("origin")
      elif y == 0:
          print("x-axis")
      elif x == 0:
          print("y-axis")
      elif x > 0 and y > 0:
          print("quadrant 1")
      elif x < 0 and y > 0:
          print("quadrant 2")
      elif x < 0 and y < 0:
          print("quadrant 3")
      else:
          print("quadrant 4")`,
    cpp: r`
      if (x == 0 && y == 0) {
          cout << "origin" << endl;
      } else if (y == 0) {
          cout << "x-axis" << endl;
      } else if (x == 0) {
          cout << "y-axis" << endl;
      } else if (x > 0 && y > 0) {
          cout << "quadrant 1" << endl;
      } else if (x < 0 && y > 0) {
          cout << "quadrant 2" << endl;
      } else if (x < 0 && y < 0) {
          cout << "quadrant 3" << endl;
      } else {
          cout << "quadrant 4" << endl;
      }`,
    java: r`
      if (x == 0 && y == 0) {
          System.out.println("origin");
      } else if (y == 0) {
          System.out.println("x-axis");
      } else if (x == 0) {
          System.out.println("y-axis");
      } else if (x > 0 && y > 0) {
          System.out.println("quadrant 1");
      } else if (x < 0 && y > 0) {
          System.out.println("quadrant 2");
      } else if (x < 0 && y < 0) {
          System.out.println("quadrant 3");
      } else {
          System.out.println("quadrant 4");
      }`
  },
  solution: {
    explanation: ['The origin and the two axes are handled first. After that both coordinates are non-zero, so the signs of `x` and `y` pick one of the four quadrants; the last `else` is quadrant 4.'],
    complexity: 'Time O(1), space O(1).'
  },
  solve(input) {
    const [x, y] = input.trim().split(/\s+/).map(Number);
    if (x === 0 && y === 0) return 'origin';
    if (y === 0) return 'x-axis';
    if (x === 0) return 'y-axis';
    return x > 0 ? (y > 0 ? 'quadrant 1' : 'quadrant 4') : (y > 0 ? 'quadrant 2' : 'quadrant 3');
  },
  tests() {
    const g = rng(30);
    return ['3 4\n', '-2 5\n', '0 7\n', '0 0\n', '5 0\n', '-5 0\n', '0 -9\n', '-3 -4\n', '6 -1\n', '1000000000 -1000000000\n', ...many(5, () => `${randInt(g, -50, 50)} ${randInt(g, -50, 50)}\n`)];
  }
};
