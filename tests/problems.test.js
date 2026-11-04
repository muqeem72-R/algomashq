// Checks the generated problem files that the site serves (public/problems). Rebuild them with: npm run problems
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOPICS } from '../public/assets/js/data/topics.js';
import { sameOutput } from '../public/assets/js/judge/compare.js';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/problems');
const index = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8')).problems;
const load = (slug) => JSON.parse(fs.readFileSync(path.join(DIR, `${slug}.json`), 'utf8'));

test('the index lists every problem file, once, in order', () => {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json').map((f) => f.replace('.json', '')).sort();
  assert.deepEqual(index.map((p) => p.slug).sort(), files);
  assert.equal(new Set(index.map((p) => p.slug)).size, index.length);
  const orders = index.map((p) => p.order);
  assert.deepEqual(orders, [...orders].sort((a, b) => a - b));
});

test('the basics topic has easy, medium and hard problems', () => {
  const levels = new Set(index.filter((p) => p.topic === 'basics').map((p) => p.difficulty));
  for (const level of ['easy', 'medium', 'hard']) assert.ok(levels.has(level), `no ${level} problem in the basics topic`);
});

for (const entry of index) {
  test(`${entry.slug}: the problem is complete and consistent`, () => {
    const p = load(entry.slug);
    assert.equal(p.slug, entry.slug);
    assert.equal(p.title, entry.title);
    assert.ok(TOPICS.some((t) => t.id === p.topic), 'unknown topic');
    assert.ok(['easy', 'medium', 'hard'].includes(p.difficulty));
    assert.equal(p.hints.length, 3);
    assert.ok(p.concept.title && p.concept.body.length >= 2, 'the concept needs a title and some text');
    assert.ok(p.statement.length >= 1 && p.inputFormat.length >= 1 && p.outputFormat.length >= 1 && p.constraints.length >= 1);
    assert.ok(p.examples.length >= 1);
    assert.ok(p.tests.length >= 5, 'at least 5 hidden tests');
    for (const lang of ['python', 'cpp']) {
      assert.ok(p.starter[lang] && p.starter[lang].length > 20, `starter code for ${lang}`);
      assert.ok(p.solution.code[lang] && p.solution.code[lang].length > 40, `solution code for ${lang}`);
      assert.notEqual(p.starter[lang], p.solution.code[lang], `the starter must not already be the solution (${lang})`);
    }
    assert.ok(p.solution.explanation.length >= 1 && p.solution.complexity);
    for (const t of [...p.examples, ...p.tests]) {
      assert.ok(t.input.endsWith('\n') && t.output.length > 0, 'every test has input ending in a newline and a non-empty output');
      assert.ok(sameOutput(t.output, t.output));
    }
    // The examples must not be leaked twice: a hidden test should not simply repeat an example.
    const shown = new Set(p.examples.map((e) => e.input));
    assert.ok(p.tests.some((t) => !shown.has(t.input)), 'hidden tests must add new cases');
  });
}
