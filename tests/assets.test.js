// Cloudflare Workers static assets: at most 25 MiB per file and 20,000 files. The browser compilers are big,
// so this guards the split into parts (see tools/vendor/build.mjs) and checks they join back into the original sizes.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const LIMIT = 25 * 1024 * 1024;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

test('every file in public/ is below the 25 MiB static asset limit', () => {
  const files = walk(PUBLIC);
  assert.ok(files.length < 20000);
  for (const f of files) assert.ok(fs.statSync(f).size < LIMIT, `${path.relative(PUBLIC, f)} is too big for one static asset`);
});

test('the C++ compiler parts join back into the original files', () => {
  const dir = path.join(PUBLIC, 'vendor/clang');
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  assert.deepEqual(Object.keys(manifest).sort(), ['llvm-resources.tar', 'llvm.core.wasm']);
  for (const [name, entry] of Object.entries(manifest)) {
    let total = 0;
    const chunks = [];
    for (const part of entry.parts) {
      const gz = fs.readFileSync(path.join(dir, part.file));
      assert.equal(gz.length, part.bytes, `${part.file}: size in the manifest is wrong`);
      const raw = zlib.gunzipSync(gz);
      total += raw.length;
      chunks.push(raw);
    }
    assert.equal(total, entry.size, `${name}: the parts do not add up to the original size`);
    if (name.endsWith('.wasm')) {
      const head = Buffer.concat(chunks).subarray(0, 4);
      assert.deepEqual([...head], [0x00, 0x61, 0x73, 0x6d], `${name} does not start with the WebAssembly magic bytes`);
    }
  }
});

test('the files the runner loads all exist', () => {
  for (const f of [
    'vendor/pyodide/pyodide.mjs', 'vendor/pyodide/pyodide.asm.mjs', 'vendor/pyodide/pyodide.asm.wasm', 'vendor/pyodide/python_stdlib.zip', 'vendor/pyodide/pyodide-lock.json',
    'vendor/clang/bundle.js', 'vendor/clang/llvm.core2.wasm', 'vendor/clang/llvm.core3.wasm', 'vendor/clang/llvm.core4.wasm',
    'vendor/wasi/shim.js', 'vendor/codemirror/editor.js', 'vendor/THIRD_PARTY.md',
    'assets/js/runner/engine.js', 'assets/js/runner/py-worker.js', 'assets/js/runner/cpp-compiler-worker.js', 'assets/js/runner/cpp-exec-worker.js'
  ]) assert.ok(fs.existsSync(path.join(PUBLIC, f)), `${f} is missing`);
});
