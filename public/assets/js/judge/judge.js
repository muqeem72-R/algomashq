// Judging: compile once, then run the tests one by one and stop at the first one that fails.
//
// verdict.status is one of: accepted, wrong_answer, runtime_error, time_limit, output_limit, memory_limit,
// compile_error, cancelled.

import * as engine from '../runner/engine.js';
import { sameOutput, clip } from './compare.js';

// Python in the browser is slower than ordinary Python, so it gets more time. Java will get its own value later.
export const TIME_FACTOR = { cpp: 1, python: 5, java: 3 };

export const timeLimitFor = (problem, lang) => (problem.timeLimitMs || 1000) * (TIME_FACTOR[lang] || 1);

// Tests the learner can see: the examples first, then the hidden ones.
export function allTests(problem) {
  const shown = problem.examples.map((e, i) => ({ input: e.input, output: e.output, hidden: false, label: `Example ${i + 1}` }));
  const hidden = (problem.tests || []).map((t, i) => ({ input: t.input, output: t.output, hidden: true, label: `Hidden test ${i + 1}` }));
  return { shown, hidden };
}

async function runTest(lang, program, test, limit) {
  const result = await engine.run(lang, program, test.input, { timeLimitMs: limit });
  if (result.status !== 'ok') return { ...result, test };
  if (!sameOutput(test.output, result.stdout)) return { ...result, status: 'wrong_answer', test };
  return { ...result, status: 'accepted', test };
}

// Runs the examples only (for the "Run examples" button); every example is reported.
export async function runExamples(problem, lang, code, onProgress) {
  onProgress && onProgress({ phase: 'compiling' });
  const compiled = await engine.compile(lang, code);
  if (!compiled.ok) return { status: 'compile_error', log: compiled.log, results: [] };
  const limit = timeLimitFor(problem, lang);
  const { shown } = allTests(problem);
  const results = [];
  for (let i = 0; i < shown.length; i++) {
    onProgress && onProgress({ phase: 'running', index: i + 1, total: shown.length });
    const r = await runTest(lang, compiled.program, shown[i], limit);
    results.push(r);
    if (r.status === 'cancelled') return { status: 'cancelled', results };
  }
  const bad = results.find((r) => r.status !== 'accepted');
  return { status: bad ? bad.status : 'accepted', log: compiled.log, results };
}

// Submits: every example and every hidden test, stopping at the first failure.
export async function submit(problem, lang, code, onProgress) {
  onProgress && onProgress({ phase: 'compiling' });
  const compiled = await engine.compile(lang, code);
  if (!compiled.ok) return { status: 'compile_error', log: compiled.log, passed: 0, total: 0 };
  const limit = timeLimitFor(problem, lang);
  const { shown, hidden } = allTests(problem);
  const tests = [...shown, ...hidden];
  let slowest = 0;
  for (let i = 0; i < tests.length; i++) {
    onProgress && onProgress({ phase: 'running', index: i + 1, total: tests.length });
    const r = await runTest(lang, compiled.program, tests[i], limit);
    slowest = Math.max(slowest, r.ms || 0);
    if (r.status === 'cancelled') return { status: 'cancelled', passed: i, total: tests.length };
    if (r.status !== 'accepted') {
      const t = tests[i];
      const failure = { status: r.status, passed: i, total: tests.length, label: t.label, hidden: t.hidden, stderr: clip(r.stderr || '', 1200), ms: r.ms };
      // The learner may see the data of an example, but never the data of a hidden test.
      if (!t.hidden) Object.assign(failure, { input: clip(t.input), expected: clip(t.output), actual: clip(r.stdout || '') });
      return failure;
    }
  }
  return { status: 'accepted', passed: tests.length, total: tests.length, slowest, log: compiled.log };
}
