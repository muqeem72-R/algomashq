// The code runner used by the problem page. Everything runs in the user's own browser (no server).
//
//   configure({ javaOrigin })                    tells the runner where the Java sandbox lives (Java is off without it)
//   prepare(lang, onProgress)                    downloads and starts the engine (once; later calls are instant)
//   compile(lang, code)                          -> { ok, program, log }
//   run(lang, program, input, options)           -> { status, stdout, stderr, ms }
//   runTests(lang, program, inputs, options)     runs many tests; onResult(i, result) after each, return false to stop
//   cancel()                                     stops whatever is running
//
// status is one of: ok, runtime_error, time_limit, output_limit, memory_limit, cancelled.
//
// Python keeps ONE warm worker (starting Python takes seconds). C++ keeps one warm compiler worker, and every run of a
// compiled program gets its own short-lived worker, which is simply terminated when the time limit passes. Java runs in
// a sandbox on another origin (java-client.js) and runs all the tests of one submission in a single Java process.

import { createJavaClient } from './java-client.js';

export const LANGUAGES = {
  python: { id: 'python', label: 'Python', available: true, download: 'about 7 MB' },
  cpp: { id: 'cpp', label: 'C++', available: true, download: 'about 26 MB' },
  java: { id: 'java', label: 'Java', available: false, download: 'a large one-time download' }
};

export const MAX_OUTPUT = 4 * 1024 * 1024;

const engines = {
  python: { worker: null, ready: null, status: 'idle' },
  cpp: { worker: null, ready: null, status: 'idle' },
  java: { client: null, ready: null, status: 'idle' }
};

// Java is only offered when the site knows where its sandbox is (the JAVA_ORIGIN setting, sent by /api/config).
export function configure({ javaOrigin } = {}) {
  if (javaOrigin && !engines.java.client) {
    engines.java.client = createJavaClient(javaOrigin);
    LANGUAGES.java.available = true;
  }
}
const progressListeners = new Set();
let nextId = 1;
let activeRun = null;   // { worker, resolve, kind } so cancel() can stop it

export const status = (lang) => (engines[lang] ? engines[lang].status : 'unavailable');

function call(worker, message, transfer) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    const onMessage = (event) => {
      const data = event.data;
      if (data && data.type === 'progress') { for (const fn of progressListeners) fn(data); return; }
      if (!data || data.id !== id) return;
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      resolve(data);
    };
    const onError = (event) => {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      reject(new Error(event.message || 'The engine crashed.'));
    };
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.postMessage({ ...message, id }, transfer || []);
  });
}

// Makes the engine ready. onProgress({ done, total }) reports bytes while the C++ toolchain downloads.
export function prepare(lang, onProgress) {
  const engine = engines[lang];
  if (!engine) return Promise.reject(new Error(`${lang} is not available yet.`));
  if (lang === 'java') return prepareJava();
  if (onProgress) progressListeners.add(onProgress);
  if (!engine.ready) {
    engine.status = 'loading';
    const url = lang === 'python' ? '/assets/js/runner/py-worker.js' : '/assets/js/runner/cpp-compiler-worker.js';
    engine.worker = new Worker(url, { type: 'module' });
    engine.ready = call(engine.worker, { type: 'init' }).then((reply) => {
      if (reply.ok === false) throw new Error(reply.log || 'The engine could not start.');
      engine.status = 'ready';
    }).catch((error) => {
      engine.status = 'error';
      if (engine.worker) engine.worker.terminate();
      engine.worker = null;
      engine.ready = null;
      throw error;
    });
  }
  const done = engine.ready;
  if (onProgress) done.finally(() => progressListeners.delete(onProgress)).catch(() => {});
  return done;
}

function resetPython() {
  const e = engines.python;
  if (e.worker) e.worker.terminate();
  e.worker = null; e.ready = null; e.status = 'idle';
}

function prepareJava() {
  const engine = engines.java;
  if (!engine.client) return Promise.reject(new Error('Java is not available on this site.'));
  if (!engine.ready) {
    engine.status = 'loading';
    engine.ready = engine.client.prepare().then(() => { engine.status = 'ready'; }).catch((error) => {
      engine.status = 'error';
      engine.ready = null;
      throw error;
    });
  }
  return engine.ready;
}

// After a Java program was stopped, its process is gone; the next prepare() starts a new one.
function syncJava() {
  const engine = engines.java;
  if (engine.client && !engine.client.isReady() && engine.status === 'ready') { engine.ready = null; engine.status = 'idle'; }
}

// Checks / compiles the program. For Python this only checks the syntax.
export async function compile(lang, code) {
  await prepare(lang);
  if (lang === 'java') return engines.java.client.compile(code);
  if (lang === 'python') {
    const reply = await call(engines.python.worker, { type: 'check', code });
    return { ok: reply.ok, program: code, log: reply.log || '' };
  }
  const reply = await call(engines.cpp.worker, { type: 'compile', code });
  return { ok: reply.ok, program: reply.wasm, log: reply.log || '' };
}

// Runs a compiled program with the given input and a wall-clock time limit.
export async function run(lang, program, input, { timeLimitMs = 2000, maxOutput = MAX_OUTPUT } = {}) {
  if (lang === 'java') {
    let result = { status: 'runtime_error', stdout: '', stderr: 'The Java runner gave no answer.', ms: 0 };
    await runTests('java', program, [input], { timeLimitMs, onResult: (i, r) => { result = r; return false; } });
    return result;
  }
  if (lang === 'python') {
    await prepare('python');
    const worker = engines.python.worker;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        // The worker is stuck in the program: kill it. The next run starts a fresh one.
        activeRun = null;
        resetPython();
        resolve({ status: 'time_limit', stdout: '', stderr: '', ms: timeLimitMs });
      }, timeLimitMs);
      activeRun = { kind: 'python', resolve, timer };
      call(worker, { type: 'run', code: program, input, maxOutput }).then((reply) => {
        if (activeRun && activeRun.timer === timer) {
          clearTimeout(timer);
          activeRun = null;
          resolve({ status: reply.status, stdout: reply.stdout || '', stderr: reply.stderr || '', ms: reply.ms || 0 });
        }
      }).catch((error) => {
        clearTimeout(timer);
        activeRun = null;
        resetPython();
        resolve({ status: 'runtime_error', stdout: '', stderr: String(error.message || error), ms: 0 });
      });
    });
  }

  // C++: a new worker for this run only.
  return new Promise((resolve) => {
    const worker = new Worker('/assets/js/runner/cpp-exec-worker.js', { type: 'module' });
    const finish = (result) => { clearTimeout(timer); worker.terminate(); if (activeRun && activeRun.worker === worker) activeRun = null; resolve(result); };
    const timer = setTimeout(() => finish({ status: 'time_limit', stdout: '', stderr: '', ms: timeLimitMs }), timeLimitMs);
    activeRun = { kind: 'cpp', worker, resolve: finish, timer };
    worker.onmessage = (event) => finish({ status: event.data.status, stdout: event.data.stdout, stderr: event.data.stderr, ms: event.data.ms });
    worker.onerror = (event) => finish({ status: 'runtime_error', stdout: '', stderr: event.message || 'The program crashed.', ms: 0 });
    worker.postMessage({ wasm: program, input, maxOutput });
  });
}

// Runs many tests with one program. onResult(i, result) is called after each test; return false to stop early.
// Java runs them all in one process. For Python and C++ every test is a separate run.
export async function runTests(lang, program, inputs, { timeLimitMs = 2000, onResult } = {}) {
  if (lang === 'java') {
    await prepare('java');
    await engines.java.client.runTests(program, inputs, { timeLimitMs, onResult });
    syncJava();
    return;
  }
  for (let i = 0; i < inputs.length; i++) {
    const result = await run(lang, program, inputs[i], { timeLimitMs });
    const keepGoing = onResult ? onResult(i, result) : true;
    if (keepGoing === false || result.status === 'cancelled') return;
  }
}

// Stops the program that is running right now (the Stop button).
export function cancel() {
  if (engines.java.client) { engines.java.client.cancel(); syncJava(); }
  if (!activeRun) return;
  const current = activeRun;
  activeRun = null;
  clearTimeout(current.timer);
  if (current.kind === 'python') resetPython();
  else if (current.worker) current.worker.terminate();
  current.resolve({ status: 'cancelled', stdout: '', stderr: '', ms: 0 });
}
