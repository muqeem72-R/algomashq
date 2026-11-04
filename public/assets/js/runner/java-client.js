// Talks to the Java sandbox: a page on its OWN origin (see java/), embedded in a hidden iframe.
//
// Java runs with CheerpJ, which needs 'unsafe-eval'. That is not allowed on this site, so Java lives on the other
// origin. The only link between the two pages is postMessage, and both sides check who is talking to them.
//
//   const client = createJavaClient('https://algomashq-java.example.workers.dev');
//   await client.prepare();
//   const { ok, program, log } = await client.compile(code);
//   await client.runTests(program, ['input 1', 'input 2'], { timeLimitMs: 5000, onResult });

const WARMUP = 'public class Main { public static void main(String[] args) { System.out.println(1); } }';

// One Java worker stops answering after roughly 60 compiles and runs (measured: the 68th compile of a tiny program never
// returned). So the worker is replaced by a fresh one well before that. The new one starts from the browser's copy of the
// runtime, which takes about half a minute, once in a long while.
const OPERATIONS_PER_WORKER = 30;

export function createJavaClient(origin) {
  let frame = null;
  let loaded = null;                 // resolves when the iframe page has loaded
  let initialized = null;            // resolves when the Java worker inside is ready
  let nextId = 1;
  let warmedUp = false;              // the runtime's compiler part has been downloaded once
  let generation = 0;                // changes every time the Java worker is thrown away
  let lastCompile = null;            // the last compile result, so the same code is not compiled twice
  let operations = 0;                // compiles and runs done by the current Java worker
  const listeners = new Set();       // functions that receive every message from the sandbox

  function onMessage(event) {
    if (!frame || event.source !== frame.contentWindow || event.origin !== origin) return;   // only our own sandbox
    const data = event.data;
    if (!data || typeof data.type !== 'string') return;
    for (const fn of [...listeners]) fn(data);
  }

  function ensureFrame() {
    if (frame) return;
    window.addEventListener('message', onMessage);
    frame = document.createElement('iframe');
    frame.className = 'java-frame';
    frame.title = 'Java runner';
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    loaded = new Promise((resolve, reject) => {
      frame.addEventListener('load', resolve, { once: true });
      frame.addEventListener('error', () => reject(new Error('The Java runner could not be loaded.')), { once: true });
    });
    frame.src = origin + '/';
    document.body.append(frame);
  }

  const post = (message) => frame.contentWindow.postMessage(message, origin);

  // Resolves with the first message that matches; rejects after ms.
  function waitFor(test, ms) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { listeners.delete(fn); reject(new Error('The Java runner did not answer in time.')); }, ms);
      const fn = (data) => { if (test(data)) { clearTimeout(timer); listeners.delete(fn); resolve(data); } };
      listeners.add(fn);
    });
  }

  function request(message, doneTypes, ms) {
    const id = nextId++;
    const answer = waitFor((m) => m.id === id && (doneTypes.includes(m.type) || m.type === 'error'), ms);
    post({ ...message, id });
    return answer.then((m) => { if (m.type === 'error') throw new Error(m.error || 'The Java runner failed.'); return m; });
  }

  // Starts the Java worker. The first time, the Java runtime is downloaded (and kept by the browser), so this can be slow.
  async function prepare() {
    ensureFrame();
    if (!initialized) {
      initialized = (async () => {
        await loaded;
        await request({ type: 'init' }, ['ready'], 180000);
        // The first time only: a small compile downloads the compiler's part of the Java runtime, so the first real
        // compile does not have to wait for it. After a restart the browser already has it.
        if (!warmedUp) {
          await request({ type: 'compile', code: WARMUP }, ['compiled'], 600000);
          operations += 1;
          warmedUp = true;
        }
      })();
      initialized.catch(() => { stopWorker(); });
    }
    return initialized;
  }

  async function compile(code) {
    await prepare();
    // Compiling takes about ten seconds, so pressing Submit after Examples with the same code reuses the result.
    if (lastCompile && lastCompile.code === code && lastCompile.generation === generation) return lastCompile.result;
    if (operations >= OPERATIONS_PER_WORKER) {      // time for a fresh worker
      stopWorker();
      await prepare();
    }
    operations += 1;
    let m;
    try {
      m = await request({ type: 'compile', code }, ['compiled'], 180000);
    } catch (error) {
      stopWorker();                                 // a worker that did not answer is not used again
      throw error;
    }
    const result = { ok: m.rc === 0, program: { dir: m.dir, mainClass: m.mainClass }, log: m.log || '' };
    lastCompile = { code, generation, result };
    return result;
  }

  // Throws the Java worker away (it may be stuck in a loop). The next prepare() starts a new one.
  function stopWorker() {
    initialized = null;
    generation += 1;
    lastCompile = null;
    operations = 0;
    if (frame && frame.contentWindow) post({ type: 'stop' });
  }

  let running = null;   // { finish } for the run in progress, so cancel() can end it

  // Runs the tests in ONE Java process. onResult(i, result) is called as each test ends; return false to stop early.
  // result: { status, stdout, stderr, ms }. A test that passes its time limit ends the run (the process is stopped).
  function runTests(program, inputs, { timeLimitMs = 5000, onResult } = {}) {
    return new Promise((resolve) => {
      const id = nextId++;
      let current = 0;
      let timer = null;
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        listeners.delete(listener);
        if (running && running.id === id) running = null;
        resolve();
      };
      const report = (i, result) => (onResult ? onResult(i, result) : true);
      const killAndReport = (status, text) => {
        stopWorker();
        report(current, { status, stdout: '', stderr: text, ms: status === 'time_limit' ? timeLimitMs : 0 });
        finish();
      };

      const listener = (m) => {
        if (m.id !== id) return;
        if (m.type === 'begin') {
          current = m.i;
          clearTimeout(timer);
          timer = setTimeout(() => killAndReport('time_limit', ''), timeLimitMs + 500);   // the clock includes some slack
        } else if (m.type === 'case') {
          clearTimeout(timer);
          const status = m.status === 'ok' && m.ms > timeLimitMs ? 'time_limit' : m.status;
          const keepGoing = report(m.i, { status, stdout: m.stdout, stderr: m.stderr, ms: m.ms });
          if (keepGoing === false || status === 'time_limit') { stopWorker(); finish(); }
        } else if (m.type === 'done') {
          finish();
        } else if (m.type === 'error') {
          killAndReport('runtime_error', m.error || 'The Java runner failed.');
        }
      };

      listeners.add(listener);
      operations += 1;
      running = { id, cancel: () => { stopWorker(); report(current, { status: 'cancelled', stdout: '', stderr: '', ms: 0 }); finish(); } };
      post({ type: 'run', id, dir: program.dir, mainClass: program.mainClass, tests: inputs });
    });
  }

  function cancel() { if (running) running.cancel(); }

  // True while a Java worker is running (it is gone after a stop).
  const isReady = () => initialized !== null;

  return { prepare, compile, runTests, cancel, isReady };
}
