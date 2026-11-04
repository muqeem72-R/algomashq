// Judging: compile once, then run the tests and compare each output with the expected one.
//
// verdict.status is one of: accepted, wrong_answer, runtime_error, time_limit, output_limit, memory_limit,
// compile_error, cancelled. In a list of example results a test that never ran has the status not_run.

import * as engine from '../runner/engine.js';
import { sameOutput, clip } from './compare.js';

// Python and Java in the browser are slower than C++, so they get more time. The time to compile does not count.
export const TIME_FACTOR = { cpp: 1, python: 5, java: 5 };

export const timeLimitFor = (problem, lang) => (problem.timeLimitMs || 1000) * (TIME_FACTOR[lang] || 1);

// Tests the learner can see: the examples first, then the hidden ones.
export function allTests(problem) {
  const shown = problem.examples.map((e, i) => ({ input: e.input, output: e.output, hidden: false, label: `Example ${i + 1}` }));
  const hidden = (problem.tests || []).map((t, i) => ({ input: t.input, output: t.output, hidden: true, label: `Hidden test ${i + 1}` }));
  return { shown, hidden };
}

// Runs the tests with a compiled program. Returns one result per test that ran, in order:
// { status, stdout, stderr, ms, test }. With stopOnFail the run ends at the first test that does not pass.
async function runAll(problem, lang, program, tests, { stopOnFail, onProgress }) {
  const results = [];
  await engine.runTests(lang, program, tests.map((t) => t.input), {
    timeLimitMs: timeLimitFor(problem, lang),
    onResult: (i, r) => {
      let status = r.status;
      if (status === 'ok') status = sameOutput(tests[i].output, r.stdout) ? 'accepted' : 'wrong_answer';
      results[i] = { ...r, status, test: tests[i] };
      if (onProgress) onProgress({ phase: 'running', index: Math.min(i + 2, tests.length), total: tests.length });
      if (status === 'cancelled') return false;
      return !(stopOnFail && status !== 'accepted');
    }
  });
  return results;
}

// Runs the examples only (for the "Examples" button); every example is reported.
export async function runExamples(problem, lang, code, onProgress) {
  onProgress && onProgress({ phase: 'compiling' });
  const compiled = await engine.compile(lang, code);
  if (!compiled.ok) return { status: 'compile_error', log: compiled.log, results: [] };
  const { shown } = allTests(problem);
  onProgress && onProgress({ phase: 'running', index: 1, total: shown.length });
  const ran = await runAll(problem, lang, compiled.program, shown, { stopOnFail: false, onProgress });
  // A test that was stopped for taking too long ends the run in Java; the tests after it did not run.
  const results = shown.map((test, i) => ran[i] || { status: 'not_run', stdout: '', stderr: '', ms: 0, test });
  if (results.some((r) => r.status === 'cancelled')) return { status: 'cancelled', results };
  const bad = results.find((r) => r.status !== 'accepted');
  return { status: bad ? bad.status : 'accepted', log: compiled.log, results };
}

// Submits: every example and every hidden test, stopping at the first failure.
export async function submit(problem, lang, code, onProgress) {
  onProgress && onProgress({ phase: 'compiling' });
  const compiled = await engine.compile(lang, code);
  if (!compiled.ok) return { status: 'compile_error', log: compiled.log, passed: 0, total: 0 };
  const { shown, hidden } = allTests(problem);
  const tests = [...shown, ...hidden];
  onProgress && onProgress({ phase: 'running', index: 1, total: tests.length });
  const results = await runAll(problem, lang, compiled.program, tests, { stopOnFail: true, onProgress });

  let slowest = 0;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (!r) continue;
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
  if (results.length < tests.length) {
    return { status: 'runtime_error', passed: results.length, total: tests.length, label: 'a test', hidden: true, stderr: 'The run ended before every test finished.', ms: 0 };
  }
  return { status: 'accepted', passed: tests.length, total: tests.length, slowest, log: compiled.log };
}
