import { many, rng, randBig } from '../lib.mjs';
const r = String.raw;

const MOD = 1000000007n;

function mul(x, y) {
  const out = [[0n, 0n, 0n], [0n, 0n, 0n], [0n, 0n, 0n]];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) out[i][j] = (out[i][j] + x[i][k] * y[k][j]) % MOD;
  return out;
}
function trib(n) {
  let m = [[1n, 1n, 1n], [1n, 0n, 0n], [0n, 1n, 0n]];
  let res = [[1n, 0n, 0n], [0n, 1n, 0n], [0n, 0n, 1n]];
  while (n > 0n) { if (n & 1n) res = mul(res, m); m = mul(m, m); n >>= 1n; }
  return res[2][0];
}
function slow(n) { const t = [0n, 0n, 1n]; for (let i = 3; i <= n; i++) t.push((t[i - 1] + t[i - 2] + t[i - 3]) % MOD); return t[n]; }

export default {
  slug: 'tribonacci-modulo',
  title: 'Tribonacci for a Gigantic N',
  topic: 'basics',
  difficulty: 'hard',
  order: 98,
  tags: ['math', 'matrix', 'modulo', 'complexity'],

  concept: {
    title: 'Matrices make recurrences fast',
    body: [
      'The Tribonacci numbers start `T(0) = 0, T(1) = 0, T(2) = 1` and each next number is the sum of the previous **three**: `T(n) = T(n-1) + T(n-2) + T(n-3)`. A loop needs `n` steps, hopeless for `n = 10^18`. The fast-doubling trick that works for Fibonacci does not carry over so easily, but there is a general method.',
      'Keep the last three values in a column `(T(k+2), T(k+1), T(k))`. One step of the recurrence is a multiplication of this column by a fixed 3 x 3 matrix `M`:',
      { code: '| T(k+3) |   | 1 1 1 |   | T(k+2) |\n| T(k+2) | = | 1 0 0 | * | T(k+1) |\n| T(k+1) |   | 0 1 0 |   | T(k)   |' },
      'Applying it `n` times means multiplying by `M^n`. Matrix multiplication is associative, so the power `M^n` can be computed with the **same repeated squaring** as for numbers: square the matrix, and multiply the answer by the current square when the matching bit of `n` is 1. That needs about 60 squarings for `n = 10^18`, each costing 27 multiplications.',
      'Start from the column `(T(2), T(1), T(0)) = (1, 0, 0)`. After multiplying by `M^n` the last entry of the column is `T(n)`, which is the bottom-left element of `M^n`, i.e. `(M^n)[2][0]`. Take every product modulo 1,000,000,007 as you go.',
      'The identity matrix (ones on the diagonal) plays the role of the number 1 in the product, just like `result = 1` in the power function.'
    ]
  },

  statement: ['The Tribonacci numbers are `T(0) = 0`, `T(1) = 0`, `T(2) = 1` and `T(n) = T(n-1) + T(n-2) + T(n-3)` for `n >= 3`. Given `n`, print `T(n)` modulo 1000000007.'],
  inputFormat: ['A single integer `n`.'],
  outputFormat: ['`T(n) mod 1000000007`.'],
  constraints: ['0 <= n <= 10^18'],
  examples: [{ input: '10\n', note: 'The sequence is 0, 0, 1, 1, 2, 4, 7, 13, 24, 44, 81: T(10) = 81.' }, { input: '2\n', note: 'T(2) = 1.' }],
  hints: [
    'Write the recurrence as a 3 x 3 matrix `M = [[1,1,1],[1,0,0],[0,1,0]]`. Then `T(n)` is the element in row 2, column 0 of `M^n` (rows and columns counted from 0).',
    'Compute `M^n` by repeated squaring, exactly like the fast power function, but with matrix multiplication. Start the result with the identity matrix.',
    'Take every sum modulo 1000000007 inside the multiplication, so that each product of two entries fits in 64 bits.'
  ],
  program: {
    io: ['n:int'],
    includes: ['<array>'],
    helpers: {
      python: r`
        MOD = 1000000007

        def multiply(x, y):
            result = [[0] * 3 for _ in range(3)]
            for i in range(3):
                for j in range(3):
                    for k in range(3):
                        result[i][j] = (result[i][j] + x[i][k] * y[k][j]) % MOD
            return result

        def matrix_power(m, e):
            result = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
            while e > 0:
                if e % 2 == 1:
                    result = multiply(result, m)
                m = multiply(m, m)
                e //= 2
            return result`,
      cpp: r`
        const long long MOD = 1000000007LL;
        typedef vector<vector<long long>> Matrix;

        Matrix multiply(const Matrix& x, const Matrix& y) {
            Matrix result(3, vector<long long>(3, 0));
            for (int i = 0; i < 3; i++) {
                for (int j = 0; j < 3; j++) {
                    for (int k = 0; k < 3; k++) {
                        result[i][j] = (result[i][j] + x[i][k] * y[k][j]) % MOD;
                    }
                }
            }
            return result;
        }

        Matrix matrixPower(Matrix m, long long e) {
            Matrix result = {{1, 0, 0}, {0, 1, 0}, {0, 0, 1}};
            while (e > 0) {
                if (e % 2 == 1) {
                    result = multiply(result, m);
                }
                m = multiply(m, m);
                e /= 2;
            }
            return result;
        }`,
      java: r`
        static final long MOD = 1000000007L;

        static long[][] multiply(long[][] x, long[][] y) {
            long[][] result = new long[3][3];
            for (int i = 0; i < 3; i++) {
                for (int j = 0; j < 3; j++) {
                    for (int k = 0; k < 3; k++) {
                        result[i][j] = (result[i][j] + x[i][k] * y[k][j]) % MOD;
                    }
                }
            }
            return result;
        }

        static long[][] matrixPower(long[][] m, long e) {
            long[][] result = {{1, 0, 0}, {0, 1, 0}, {0, 0, 1}};
            while (e > 0) {
                if (e % 2 == 1) {
                    result = multiply(result, m);
                }
                m = multiply(m, m);
                e /= 2;
            }
            return result;
        }`
    },
    python: r`
      m = [[1, 1, 1], [1, 0, 0], [0, 1, 0]]
      print(matrix_power(m, n)[2][0])`,
    cpp: r`
      Matrix m = {{1, 1, 1}, {1, 0, 0}, {0, 1, 0}};
      cout << matrixPower(m, n)[2][0] << endl;`,
    java: r`
      long[][] m = {{1, 1, 1}, {1, 0, 0}, {0, 1, 0}};
      System.out.println(matrixPower(m, n)[2][0]);`
  },
  solution: {
    explanation: ['One step of the recurrence multiplies the state column by `M`, so `n` steps multiply it by `M^n`. Repeated squaring computes `M^n` with about 60 squarings, each of 27 multiplications, all modulo 10^9 + 7. Since the start column is `(1, 0, 0)`, the answer `T(n)` is the entry in row 2, column 0 of `M^n`.'],
    complexity: 'Time O(27 * log n), space O(1).'
  },
  solve(input) { return String(trib(BigInt(input.trim()))); },
  tests() {
    const g = rng(98);
    // The fast method must agree with the plain recurrence on small inputs.
    for (let n = 0; n <= 3000; n++) if (trib(BigInt(n)) !== slow(n)) throw new Error(`matrix power disagrees with the recurrence at n=${n}`);
    const T18 = 10n ** 18n;
    return ['10\n', '2\n', '0\n', '1\n', '3\n', '4\n', '100\n', '1000000\n', `${T18}\n`, `${T18 - 1n}\n`, '576460752303423487\n', ...many(5, () => `${randBig(g, 0n, T18)}\n`)];
  }
};
