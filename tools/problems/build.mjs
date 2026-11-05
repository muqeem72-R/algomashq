// Builds the problem files that the site serves.
//   npm run problems                        the released topics, into public/problems (what is committed and deployed)
//   node tools/problems/build.mjs --all --out <folder>
//                                           every topic, also the ones not released yet, into a folder of your choice
//                                           (used to check the unreleased topics without putting them on the site)
//   add --only <topic> to read the sources of one topic only (fast while writing a topic; it skips the check against the other topics)
//   add --verbose for one line per problem
//
// The problems live in tools/problems/problems/ (Basics, one file each) and tools/problems/topics/<topic>/ (the other topics). A file in a
// topic folder may export one problem or an array of problems, and its problems do not need `topic` (the folder name is used) or
// `order`: the numbers of a topic are given here, easy problems first, then medium, then hard, each level in the order of the files.
// For every one this script:
//   - writes the starter and solution code of a problem that has a `program` (see programs.mjs)
//   - makes the tests, and computes the expected output with the problem's own JavaScript reference solution
//   - checks that the problem is complete (every required field, starter code, solution code, enough tests)
//   - checks the numbering: a problem of topic number T (Basics is 1) has a number from (T - 1) * 100 + 1 to T * 100, numbers are
//     unique, and within a topic a harder level never comes before an easier one
//   - writes <folder>/<slug>.json and the list <folder>/index.json
//
// A topic goes on the site when it is named in tools/problems/release.json. The released topics must be the first topics of the
// roadmap, in order (so the numbers have no gaps), and each must have exactly 100 problems.
// The generated files are committed, so a deployment never has to run this script.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { TOPICS } from '../../public/assets/js/data/topics.js';
import { expand } from './programs.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const ALL = args.includes('--all');
const VERBOSE = args.includes('--verbose');
const onlyAt = args.indexOf('--only');
const ONLY = onlyAt >= 0 ? args[onlyAt + 1] : null;
const outAt = args.indexOf('--out');
const OUT = outAt >= 0 ? path.resolve(args[outAt + 1]) : path.resolve(HERE, '../../public/problems');
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const LANGUAGES_WITH_CODE = ['python', 'cpp', 'java'];
const PER_TOPIC = 100;

const fail = (slug, message) => { throw new Error(`[${slug}] ${message}`); };

const RELEASED = JSON.parse(fs.readFileSync(path.join(HERE, 'release.json'), 'utf8')).released;
if (JSON.stringify(RELEASED) !== JSON.stringify(TOPICS.slice(0, RELEASED.length).map((t) => t.id))) {
  fail('release.json', `the released topics must be the first topics of the roadmap in order (${TOPICS.slice(0, RELEASED.length).map((t) => t.id).join(', ')})`);
}

function check(p, from) {
  const need = ['slug', 'title', 'topic', 'difficulty', 'order', 'tags', 'concept', 'statement', 'inputFormat', 'outputFormat', 'constraints', 'examples', 'hints', 'starter', 'solution', 'solve', 'tests'];
  for (const key of need) if (p[key] === undefined) fail(p.slug || from, `missing "${key}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) fail(p.slug, 'slug must be lowercase words joined by dashes');
  const topicIndex = TOPICS.findIndex((t) => t.id === p.topic);
  if (topicIndex < 0) fail(p.slug, `unknown topic "${p.topic}"`);
  if (p.order < topicIndex * PER_TOPIC + 1 || p.order > (topicIndex + 1) * PER_TOPIC) fail(p.slug, `order ${p.order} is outside the numbers of the topic (${topicIndex * PER_TOPIC + 1} to ${(topicIndex + 1) * PER_TOPIC})`);
  if (!DIFFICULTIES.includes(p.difficulty)) fail(p.slug, `difficulty must be one of ${DIFFICULTIES.join(', ')}`);
  if (p.hints.length !== 3) fail(p.slug, 'exactly 3 hints are expected');
  if (p.examples.length < 1) fail(p.slug, 'at least one example is needed');
  for (const lang of LANGUAGES_WITH_CODE) {
    if (!p.starter[lang]) fail(p.slug, `missing starter code for ${lang}`);
    if (!p.solution.code[lang]) fail(p.slug, `missing solution code for ${lang}`);
  }
  if (!p.solution.explanation || !p.solution.complexity) fail(p.slug, 'solution needs an explanation and a complexity line');
}

// All the source files: Basics lives directly in problems/, every other topic in topics/<topic>/.
function sourceFiles() {
  const list = ONLY && ONLY !== 'basics' ? [] : fs.readdirSync(path.join(HERE, 'problems')).filter((f) => f.endsWith('.mjs')).sort().map((f) => path.join(HERE, 'problems', f));
  const topicsDir = path.join(HERE, 'topics');
  if (fs.existsSync(topicsDir)) {
    for (const dir of fs.readdirSync(topicsDir).sort().filter((d) => !ONLY || d === ONLY)) {
      const full = path.join(topicsDir, dir);
      if (fs.statSync(full).isDirectory()) for (const f of fs.readdirSync(full).filter((x) => x.endsWith('.mjs')).sort()) list.push(path.join(full, f));
    }
  }
  return list;
}

const entries = [];
for (const file of sourceFiles()) {
  const mod = await import(pathToFileURL(file).href);
  const folder = path.basename(path.dirname(file));
  for (const raw of [].concat(mod.default)) {
    if (folder !== 'problems' && raw.topic !== undefined && folder !== raw.topic) fail(raw.slug, `the file is in topics/${folder} but the problem says topic "${raw.topic}"`);
    entries.push({ file, p: expand(folder === 'problems' ? raw : { ...raw, topic: folder }) });
  }
}

// Number the problems of a topic whose files do not give numbers.
for (const topic of TOPICS) {
  const mine = entries.filter((e) => e.p.topic === topic.id);
  const numbered = mine.filter((e) => e.p.order !== undefined).length;
  if (numbered !== 0 && numbered !== mine.length) fail(topic.id, 'either all or none of the problems of a topic give their number');
  if (numbered === 0) {
    const base = TOPICS.indexOf(topic) * PER_TOPIC;
    mine.map((e, i) => ({ e, i })).sort((a, b) => DIFFICULTIES.indexOf(a.e.p.difficulty) - DIFFICULTIES.indexOf(b.e.p.difficulty) || a.i - b.i)
      .forEach(({ e }, k) => { e.p.order = base + k + 1; });
  }
}

const problems = [];
for (const { file, p } of entries) {
  check(p, path.basename(file));

  const examples = p.examples.map((e) => ({ input: e.input, output: p.solve(e.input) + '\n', note: e.note }));
  const hiddenInputs = p.tests();
  const minTests = p.noInput ? 1 : 5;
  if (hiddenInputs.length < minTests) fail(p.slug, `at least ${minTests} hidden tests are expected`);
  if (!p.noInput && p.examples.some((e) => !e.input.trim())) fail(p.slug, 'an example without input needs noInput: true');
  const tests = hiddenInputs.map((input) => ({ input, output: p.solve(input) + '\n' }));
  for (const t of [...examples, ...tests]) if (!t.output.trim()) fail(p.slug, 'a test has an empty expected output');
  const bytes = JSON.stringify(tests).length;
  if (bytes > 5_000_000) fail(p.slug, `hidden tests are ${bytes} bytes; keep them under 5 MB`);

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
for (const id of ONLY ? [] : RELEASED) {
  const n = problems.filter((p) => p.topic === id).length;
  if (n !== PER_TOPIC) fail('release.json', `the topic "${id}" is released but has ${n} problems, not ${PER_TOPIC}`);
}

const emit = problems.filter((p) => ALL || RELEASED.includes(p.topic));
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const p of emit) fs.writeFileSync(path.join(OUT, `${p.slug}.json`), JSON.stringify(p));
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({
  problems: emit.map(({ slug, title, topic, difficulty, order, tags }) => ({ slug, title, topic, difficulty, order, tags }))
}, null, 1));

if (VERBOSE) {
  for (const p of emit) {
    const size = fs.statSync(path.join(OUT, `${p.slug}.json`)).size;
    console.log(`${p.slug.padEnd(30)} ${p.difficulty.padEnd(7)} ${String(p.tests.length).padStart(2)} hidden tests, ${(size / 1024).toFixed(0)} KB`);
  }
}
for (const topic of TOPICS) {
  const mine = problems.filter((p) => p.topic === topic.id);
  if (!mine.length) continue;
  const by = (d) => mine.filter((p) => p.difficulty === d).length;
  console.log(`${topic.id.padEnd(15)} ${String(mine.length).padStart(3)} problems (${by('easy')} easy, ${by('medium')} medium, ${by('hard')} hard)  ${RELEASED.includes(topic.id) ? 'released' : 'not released'}`);
}
console.log(`${emit.length} problems written to ${path.relative(process.cwd(), OUT) || '.'}`);
