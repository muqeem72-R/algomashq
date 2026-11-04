import test from 'node:test';
import assert from 'node:assert/strict';
import { sameOutput, clip } from '../public/assets/js/judge/compare.js';
import { timeLimitFor, TIME_FACTOR } from '../public/assets/js/judge/judge.js';

test('output is compared by words and numbers, not by blank lines or trailing spaces', () => {
  assert.ok(sameOutput('6\n', '6'));
  assert.ok(sameOutput('1 2 3\n', '1   2\n3\n\n'));
  assert.ok(sameOutput('', '   \n'));
  assert.ok(sameOutput('Yes\n', 'Yes   \r\n'));
});

test('different output is not accepted', () => {
  assert.ok(!sameOutput('6', '7'));
  assert.ok(!sameOutput('1 2 3', '1 2'));
  assert.ok(!sameOutput('1 2', '1 2 3'));
  assert.ok(!sameOutput('yes', 'Yes'));
  assert.ok(!sameOutput('12', '1 2'));
});

test('long text is clipped for the result panel', () => {
  assert.equal(clip('short', 10), 'short');
  const out = clip('x'.repeat(50), 10);
  assert.ok(out.startsWith('xxxxxxxxxx'));
  assert.ok(out.includes('40 more characters'));
});

test('Python gets more time than C++ because it is slower in the browser', () => {
  const problem = { timeLimitMs: 2000 };
  assert.equal(timeLimitFor(problem, 'cpp'), 2000);
  assert.equal(timeLimitFor(problem, 'python'), 2000 * TIME_FACTOR.python);
  assert.ok(timeLimitFor(problem, 'python') > timeLimitFor(problem, 'cpp'));
  assert.equal(timeLimitFor({}, 'cpp'), 1000);
});
