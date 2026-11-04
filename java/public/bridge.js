// Runs inside the Java sandbox page. It listens to the AlgoMashq page that embeds it (postMessage only), owns the Web
// Worker that runs Java, and passes messages in both directions. Nothing else can talk to it.

// The only pages allowed to use this runner. The first one is the live site; the others are for local development.
const ALLOWED_PARENTS = ['https://algomashq.mukeemkhan.workers.dev', 'http://localhost:8788', 'http://127.0.0.1:8788'];

const MAX_CODE = 200 * 1024;          // characters of Java source
const MAX_TESTS_TOTAL = 24 * 1024 * 1024;

let parentOrigin = null;
let worker = null;

function send(message) {
  if (parentOrigin) window.parent.postMessage(message, parentOrigin);
}

function startWorker() {
  if (worker) return;
  worker = new Worker('java-worker.js');
  worker.onmessage = (event) => send(event.data);
  worker.onerror = (event) => send({ type: 'error', error: event.message || 'The Java worker crashed.' });
}

function stopWorker() {
  if (worker) { worker.terminate(); worker = null; }
}

function valid(data) {
  if (!data || typeof data !== 'object' || typeof data.type !== 'string') return false;
  if (data.type === 'compile') return typeof data.code === 'string' && data.code.length <= MAX_CODE;
  if (data.type === 'run') {
    return Array.isArray(data.tests) && data.tests.every((t) => typeof t === 'string')
      && data.tests.reduce((n, t) => n + t.length, 0) <= MAX_TESTS_TOTAL
      && typeof data.dir === 'string' && typeof data.mainClass === 'string';
  }
  return data.type === 'init' || data.type === 'stop';
}

window.addEventListener('message', (event) => {
  if (event.source !== window.parent || !ALLOWED_PARENTS.includes(event.origin)) return;
  parentOrigin = event.origin;
  const data = event.data;
  if (!valid(data)) return;

  if (data.type === 'stop') {
    stopWorker();
    send({ type: 'stopped' });
    return;
  }
  if (data.type === 'init') startWorker();
  if (!worker) { send({ type: 'error', id: data.id, error: 'The Java runner is not started.' }); return; }
  worker.postMessage(data);
});

// Tell whichever allowed page embeds us that we are here. The message is only delivered to a matching origin.
for (const origin of ALLOWED_PARENTS) {
  try { window.parent.postMessage({ type: 'hello' }, origin); } catch (e) { /* not the parent */ }
}
