// Runs Python in a Web Worker with Pyodide (CPython compiled to WebAssembly).
// One worker is reused for many runs. If a program runs too long, the page terminates this worker.

import { loadPyodide } from '/vendor/pyodide/pyodide.mjs';

let py = null;

// Written in Python. Every run gets fresh output buffers and its own stdin, and the traceback is cleaned
// of this wrapper's own frames so the learner only sees their own code.
const WRAPPER = String.raw`
import sys, io, traceback

class _OutputLimit(Exception):
    pass

class _Out(io.StringIO):
    def __init__(self, limit):
        super().__init__()
        self._limit = limit
        self._size = 0
    def write(self, s):
        self._size += len(s)
        if self._size > self._limit:
            raise _OutputLimit()
        return super().write(s)

def __check(code):
    try:
        compile(code, 'main.py', 'exec')
        return {'ok': True, 'log': ''}
    except SyntaxError as e:
        text = (e.text or '').rstrip()
        return {'ok': False, 'log': 'File "main.py", line %s\n    %s\nSyntaxError: %s' % (e.lineno, text, e.msg)}

def __run(code, inp, limit):
    out = _Out(limit)
    err = io.StringIO()
    old = (sys.stdout, sys.stderr, sys.stdin)
    sys.stdout, sys.stderr, sys.stdin = out, err, io.StringIO(inp)
    sys.setrecursionlimit(1000)   # a program that raised it must not change the next run
    status = 'ok'
    try:
        exec(compile(code, 'main.py', 'exec'), {'__name__': '__main__'})
    except SystemExit:
        pass
    except _OutputLimit:
        status = 'output_limit'
    except BaseException as e:
        status = 'runtime_error'
        traceback.print_exception(type(e), e, e.__traceback__.tb_next, file=err)
    finally:
        sys.stdout, sys.stderr, sys.stdin = old
    return {'stdout': out.getvalue(), 'stderr': err.getvalue(), 'status': status}
`;

function toObject(proxy) {
  const value = proxy.toJs({ dict_converter: Object.fromEntries });
  proxy.destroy();
  return value;
}

self.onmessage = async (event) => {
  const m = event.data;
  try {
    if (m.type === 'init') {
      py = await loadPyodide({ indexURL: '/vendor/pyodide/' });
      py.runPython(WRAPPER);
      postMessage({ id: m.id, ok: true });
    } else if (m.type === 'check') {
      postMessage({ id: m.id, ...toObject(py.globals.get('__check')(m.code)) });
    } else if (m.type === 'run') {
      const started = performance.now();
      const result = toObject(py.globals.get('__run')(m.code, m.input, m.maxOutput));
      postMessage({ id: m.id, ok: true, ms: Math.round(performance.now() - started), ...result });
    }
  } catch (error) {
    // The Python wrapper catches everything a program can do. Reaching here means the engine itself failed
    // (for example the JavaScript stack ran out during very deep recursion).
    const text = String((error && error.message) || error);
    postMessage({ id: m.id, ok: false, status: 'runtime_error', stdout: '', stderr: text.slice(0, 2000) });
  }
};
