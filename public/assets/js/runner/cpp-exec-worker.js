// Runs ONE compiled C++ program (WebAssembly + WASI) in a fresh Web Worker. The page terminates the worker if the
// program runs past its time limit, so an endless loop can never freeze the page.

import { WASI, ConsoleStdout, Fd, wasi as W } from '/vendor/wasi/shim.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

class OutputLimit extends Error {}

// stdin: hands out slices of one buffer, no copying.
class Stdin extends Fd {
  constructor(bytes) { super(); this.data = bytes; this.pos = 0; }
  fd_fdstat_get() { return { ret: 0, fdstat: new W.Fdstat(W.FILETYPE_REGULAR_FILE, 0) }; }
  fd_read(size) {
    const end = Math.min(this.pos + size, this.data.length);
    const chunk = this.data.subarray(this.pos, end);
    this.pos = end;
    return { ret: 0, data: chunk };
  }
}

// stdout / stderr: collected in memory with a size cap. They say they are plain files (not a terminal), so the C
// library buffers output instead of calling the host for every line (printf of a million lines: 3 s -> 0.2 s).
class Output extends ConsoleStdout {
  constructor(sink, limit) {
    super((bytes) => {
      sink.size += bytes.length;
      if (sink.size > limit) throw new OutputLimit();
      sink.parts.push(bytes.slice());
    });
  }
  fd_fdstat_get() {
    const fdstat = new W.Fdstat(W.FILETYPE_REGULAR_FILE, 0);
    fdstat.fs_rights_base = BigInt(W.RIGHTS_FD_WRITE);
    return { ret: 0, fdstat };
  }
}

function join(sink) {
  const all = new Uint8Array(sink.size);
  let offset = 0;
  for (const part of sink.parts) { all.set(part, offset); offset += part.length; }
  return decoder.decode(all);
}

self.onmessage = async (event) => {
  const { wasm, input, maxOutput } = event.data;
  const out = { parts: [], size: 0 };
  const err = { parts: [], size: 0 };
  const started = performance.now();
  let status = 'ok';
  let message = '';
  try {
    const wasi = new WASI(['main'], [], [new Stdin(encoder.encode(input)), new Output(out, maxOutput), new Output(err, maxOutput)]);
    const module = await WebAssembly.compile(wasm);
    const instance = await WebAssembly.instantiate(module, { wasi_snapshot_preview1: wasi.wasiImport });
    const code = wasi.start(instance);
    if (code !== 0) { status = 'runtime_error'; message = `The program ended with exit code ${code}.`; }
  } catch (error) {
    if (error instanceof OutputLimit) {
      status = 'output_limit';
    } else if (error instanceof RangeError) {
      status = 'runtime_error';
      message = 'Stack overflow (too much recursion).';
    } else {
      const text = String((error && error.message) || error);
      if (/bad_alloc|out of memory|memory.*(grow|allocat)/i.test(text)) { status = 'memory_limit'; message = 'The program used too much memory.'; }
      else { status = 'runtime_error'; message = text.replace(/^RuntimeError:\s*/, ''); }
    }
  }
  postMessage({ ok: true, status, stdout: join(out), stderr: (join(err) + (message ? (err.size ? '\n' : '') + message : '')).slice(0, 4000), ms: Math.round(performance.now() - started) });
};
