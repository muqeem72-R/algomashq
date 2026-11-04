// Compiles C++ to WebAssembly inside a Web Worker (clang, lld and libc++ compiled to WebAssembly).
//
// The compiler is large (72 MB for the main wasm file), more than one static file may hold. So it is stored as
// gzip parts (see tools/vendor/build.mjs). The bundle asks for "llvm.core.wasm" and "llvm-resources.tar" with
// fetch(); this worker replaces fetch BEFORE the bundle loads, joins the parts and answers as if they were one file.

const BASE = '/vendor/clang/';
const realFetch = self.fetch.bind(self);

let manifest = null;
let compressedTotal = 0;
let compressedDone = 0;
let lastReport = 0;

function report(force) {
  const now = performance.now();
  if (!force && now - lastReport < 120) return;
  lastReport = now;
  postMessage({ type: 'progress', done: compressedDone, total: compressedTotal });
}

// Downloads one gzip part with progress and returns its decompressed bytes.
async function fetchPart(part) {
  const response = await realFetch(BASE + part.file);
  if (!response.ok) throw new Error(`Could not download ${part.file} (${response.status})`);
  const chunks = [];
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    compressedDone += value.length;
    report(false);
  }
  const stream = new Blob(chunks).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function assemble(name) {
  const entry = manifest[name];
  const parts = await Promise.all(entry.parts.map(fetchPart));
  const whole = new Uint8Array(entry.size);
  let offset = 0;
  for (const p of parts) { whole.set(p, offset); offset += p.length; }
  return whole;
}

self.fetch = async (input, init) => {
  // The bundle passes a URL object; other callers may pass a string or a Request.
  const url = input instanceof URL ? input : new URL(typeof input === 'string' ? input : input.url, self.location.href);
  const name = url.pathname.split('/').pop();
  if (url.pathname.startsWith(BASE) && manifest && manifest[name]) {
    const bytes = await assemble(name);
    return new Response(bytes, { headers: { 'Content-Type': name.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream' } });
  }
  return realFetch(input, init);
};

// libc++ has no <bits/stdc++.h> (a libstdc++ header that many programmers use), so one is provided.
const STDCPP = `#pragma once
#include <algorithm>
#include <array>
#include <bitset>
#include <cassert>
#include <cctype>
#include <chrono>
#include <climits>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <deque>
#include <functional>
#include <iomanip>
#include <iostream>
#include <iterator>
#include <limits>
#include <list>
#include <map>
#include <memory>
#include <numeric>
#include <queue>
#include <random>
#include <set>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>
`;

// -fno-exceptions: the WebAssembly C++ runtime has no exception support, so try/catch/throw are refused at compile time.
// The 64 MB stack allows deep recursion; the memory cap stops runaway allocations.
const FLAGS = ['-O2', '-std=c++17', '-fno-exceptions', '-Wl,-z,stack-size=67108864', '-Wl,--max-memory=536870912', '-I.'];

const decoder = new TextDecoder();
let runClang = null;

async function init() {
  manifest = await (await realFetch(BASE + 'manifest.json')).json();
  compressedTotal = Object.values(manifest).reduce((sum, e) => sum + e.parts.reduce((s, p) => s + p.bytes, 0), 0);
  ({ runClang } = await import(BASE + 'bundle.js'));
  // Compile a tiny program once: this downloads and prepares the toolchain, so real compiles start fast.
  await compile('#include <iostream>\nint main(){ std::cout << 1; }');
  report(true);
}

async function compile(code) {
  let log = '';
  const collect = (bytes) => { if (bytes) log += typeof bytes === 'string' ? bytes : decoder.decode(bytes); };
  try {
    const files = await runClang(['clang++', 'main.cc', '-o', 'main', ...FLAGS], { 'main.cc': code, bits: { 'stdc++.h': STDCPP } }, { stdout: collect, stderr: collect });
    return { ok: true, wasm: files['main'], log };
  } catch (error) {
    if (!log) log = String((error && error.message) || error);
    return { ok: false, log };
  }
}

self.onmessage = async (event) => {
  const m = event.data;
  try {
    if (m.type === 'init') {
      await init();
      postMessage({ id: m.id, ok: true });
    } else if (m.type === 'compile') {
      const result = await compile(m.code);
      const log = result.log.length > 8000 ? result.log.slice(0, 8000) + '\n...' : result.log;
      if (result.ok) postMessage({ id: m.id, ok: true, wasm: result.wasm, log }, [result.wasm.buffer]);
      else postMessage({ id: m.id, ok: false, log });
    }
  } catch (error) {
    postMessage({ id: m.id, ok: false, log: 'The C++ compiler failed to start: ' + String((error && error.message) || error) });
  }
};
