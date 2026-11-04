// Builds the problem files that the site serves.
//   npm run problems
//
// Each problem lives in tools/problems/problems/<slug>.mjs. For every one this script:
//   - writes the starter and solution code of a problem that has a `program` (see programs.mjs)
//   - makes the tests, and computes the expected output with the problem's own JavaScript reference solution
//   - checks that the problem is complete (every required field, starter code, solution code, enough tests)
//   - writes public/problems/<slug>.json and the list public/problems/index.json
// The generated files are committed, so a deployment never has to run this script.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { TOPICS } from '../../public/assets/js/data/topics.js';
import { expand } from './programs.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, 'problems');
const OUT = path.resolve(HERE, '../../public/problems');
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const LANGUAGES_WITH_CODE = ['python', 'cpp', 'java'];

const fail = (slug, message) => { throw new Error(`[${slug}] ${message}`); };

function check(p) {
  const need = ['slug', 'title', 'topic', 'difficulty', 'order', 'tags', 'concept', 'statement', 'inputFormat', 'outputFormat', 'constraints', 'examples', 'hints', 'starter', 'solution', 'solve', 'tests'];
  for (const key of need) if (p[key] === undefined) fail(p.slug || '?', `missing "${key}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) fail(p.slug, 'slug must be lowercase words joined by dashes');
  if (!TOPICS.some((t) => t.id === p.topic)) fail(p.slug, `unknown topic "${p.topic}"`);
  if (!DIFFICULTIES.includes(p.difficulty)) fail(p.slug, `difficulty must be one of ${DIFFICULTIES.join(', ')}`);
  if (p.hints.length !== 3) fail(p.slug, 'exactly 3 hints are expected');
  if (p.examples.length < 1) fail(p.slug, 'at least one example is needed');
  for (const lang of LANGUAGES_WITH_CODE) {
    if (!p.starter[lang]) fail(p.slug, `missing starter code for ${lang}`);
    if (!p.solution.code[lang]) fail(p.slug, `missing solution code for ${lang}`);
  }
  if (!p.solution.explanation || !p.solution.complexity) fail(p.slug, 'solution needs an explanation and a complexity line');
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.mjs')).sort();
const problems = [];
for (const file of files) {
  const mod = await import(pathToFileURL(path.join(SRC, file)).href);
  const p = expand(mod.default);
  check(p);

  const examples = p.examples.map((e) => ({ input: e.input, output: p.solve(e.input) + '\n', note: e.note }));
  const hiddenInputs = p.tests();
  const minTests = p.noInput ? 1 : 5;
  if (hiddenInputs.length < minTests) fail(p.slug, `at least ${minTests} hidden tests are expected`);
  if (!p.noInput && p.examples.some((e) => !e.input.trim())) fail(p.slug, 'an example without input needs noInput: true');
  const tests = hiddenInputs.map((input) => ({ input, output: p.solve(input) + '\n' }));
  const bytes = JSON.stringify(tests).length;
  if (bytes > 2_000_000) fail(p.slug, `hidden tests are ${bytes} bytes; keep them under 2 MB`);

  problems.push({
    slug: p.slug, title: p.title, topic: p.topic, difficulty: p.difficulty, order: p.order, tags: p.tags,
    timeLimitMs: p.timeLimitMs || 2000, ...(p.noInput ? { noInput: true } : {}),
    concept: p.concept, statement: p.statement, inputFormat: p.inputFormat, outputFormat: p.outputFormat, constraints: p.constraints,
    examples, hints: p.hints, starter: p.starter, solution: p.solution, tests
  });
}

const slugs = new Set(), orders = new Set(), titles = new Set();
for (const p of problems) {
  if (slugs.has(p.slug)) fail(p.slug, 'duplicate slug'); slugs.add(p.slug);
  if (orders.has(p.order)) fail(p.slug, `duplicate order ${p.order}`); orders.add(p.order);
  if (titles.has(p.title)) fail(p.slug, 'duplicate title'); titles.add(p.title);
}
problems.sort((a, b) => a.order - b.order);
// The number of a problem is its effort: within a topic a harder level never comes before an easier one.
for (const topic of TOPICS) {
  let last = 0;
  for (const p of problems.filter((x) => x.topic === topic.id)) {
    const rank = DIFFICULTIES.indexOf(p.difficulty);
    if (rank < last) fail(p.slug, `#${p.order} is ${p.difficulty} but comes after a harder problem`);
    last = rank;
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const p of problems) fs.writeFileSync(path.join(OUT, `${p.slug}.json`), JSON.stringify(p));
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({
  problems: problems.map(({ slug, title, topic, difficulty, order, tags }) => ({ slug, title, topic, difficulty, order, tags }))
}, null, 1));

for (const p of problems) {
  const size = fs.statSync(path.join(OUT, `${p.slug}.json`)).size;
  console.log(`${p.slug.padEnd(18)} ${p.difficulty.padEnd(7)} ${String(p.tests.length).padStart(2)} hidden tests, ${(size / 1024).toFixed(0)} KB`);
}
console.log(`${problems.length} problems written to public/problems`);
