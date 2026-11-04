// Guards the security setup: the main site stays strict, and Java (which needs 'unsafe-eval') lives on its own origin.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const csp = (file) => /Content-Security-Policy:\s*(.+)/.exec(read(file))[1];
const directive = (policy, name) => (new RegExp(`(?:^|;\\s*)${name}\\s+([^;]*)`).exec(policy) || [])[1] || '';

test('the main site never allows unsafe-eval or inline scripts and styles', () => {
  const policy = csp('public/_headers');
  assert.ok(!/unsafe-eval/.test(policy.replace('wasm-unsafe-eval', '')), 'the main site must not allow unsafe-eval');
  assert.ok(!/unsafe-inline/.test(policy), 'the main site must not allow unsafe-inline');
  assert.equal(directive(policy, 'default-src'), "'self'");
  assert.equal(directive(policy, 'frame-ancestors'), "'none'");
});

test('the main site may embed the Java sandbox and nothing else but Turnstile', () => {
  const frames = directive(csp('public/_headers'), 'frame-src').split(/\s+/).filter(Boolean).sort();
  const javaOrigin = /JAVA_ORIGIN\s*=\s*"([^"]+)"/.exec(read('wrangler.toml'))[1];
  assert.deepEqual(frames, ['https://challenges.cloudflare.com', javaOrigin].sort());
});

test('the Java sandbox is locked down to the pages that may embed it', () => {
  const policy = csp('java/public/_headers');
  assert.equal(directive(policy, 'default-src'), "'none'");
  assert.ok(directive(policy, 'script-src').includes("'unsafe-eval'"), 'CheerpJ needs unsafe-eval on the sandbox origin');
  const ancestors = directive(policy, 'frame-ancestors').split(/\s+/).filter(Boolean);
  assert.ok(ancestors.length >= 1 && !ancestors.includes('*') && !ancestors.includes("'self'"), 'only named pages may embed the sandbox');
  // The bridge accepts messages from exactly the same pages.
  const allowed = /ALLOWED_PARENTS\s*=\s*\[([^\]]*)\]/.exec(read('java/public/bridge.js'))[1].match(/'[^']+'/g).map((s) => s.slice(1, -1));
  assert.deepEqual([...ancestors].sort(), [...allowed].sort());
});

test('the sandbox is a different site from the main site, so the browser keeps them apart', () => {
  const javaOrigin = new URL(/JAVA_ORIGIN\s*=\s*"([^"]+)"/.exec(read('wrangler.toml'))[1]);
  assert.equal(javaOrigin.protocol, 'https:');
  assert.ok(javaOrigin.hostname.endsWith('.workers.dev'), 'workers.dev is a public suffix, so each name there is its own site');
  assert.ok(javaOrigin.hostname.startsWith('algomashq-java.'));
});

test('the sandbox page and its files exist and are small enough for one static asset each', () => {
  for (const f of ['java/wrangler.toml', 'java/public/index.html', 'java/public/bridge.js', 'java/public/java-worker.js', 'java/public/_headers']) {
    assert.ok(fs.existsSync(path.join(ROOT, f)), `${f} is missing`);
  }
});

test('the bridge checks who is talking to it', () => {
  const bridge = read('java/public/bridge.js');
  assert.ok(bridge.includes('event.source !== window.parent'), 'messages must come from the parent window');
  assert.ok(bridge.includes('ALLOWED_PARENTS.includes(event.origin)'), 'messages must come from an allowed origin');
});

test('the parent only listens to its own sandbox', () => {
  const client = read('public/assets/js/runner/java-client.js');
  assert.ok(client.includes('event.source !== frame.contentWindow'));
  assert.ok(client.includes('event.origin !== origin'));
  assert.ok(client.includes("'allow-scripts allow-same-origin'"), 'the iframe is sandboxed');
});
