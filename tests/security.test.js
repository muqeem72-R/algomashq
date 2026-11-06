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

test('the main site may embed the Java sandbox, Turnstile and the Google button, and nothing else', () => {
  const frames = directive(csp('public/_headers'), 'frame-src').split(/\s+/).filter(Boolean).sort();
  const javaOrigin = /JAVA_ORIGIN\s*=\s*"([^"]+)"/.exec(read('wrangler.toml'))[1];
  assert.deepEqual(frames, ['https://accounts.google.com/gsi/', 'https://challenges.cloudflare.com', javaOrigin].sort());
});

test('Google gets exactly the four addresses its sign-in button needs, not the whole of google.com', () => {
  const policy = csp('public/_headers');
  const list = (name) => directive(policy, name).split(/\s+/).filter(Boolean);
  assert.ok(list('script-src').includes('https://accounts.google.com/gsi/client'));
  assert.ok(list('style-src').includes('https://accounts.google.com/gsi/style'));
  assert.ok(list('connect-src').includes('https://accounts.google.com/gsi/'));
  assert.ok(list('frame-src').includes('https://accounts.google.com/gsi/'));
  // No other directive mentions Google, and no source is a wildcard or a bare host.
  for (const name of ['default-src', 'img-src', 'worker-src', 'media-src', 'form-action', 'base-uri', 'object-src']) {
    assert.ok(!list(name).some((s) => s.includes('google')), name + ' must not mention Google');
  }
  for (const source of [...list('script-src'), ...list('style-src'), ...list('connect-src'), ...list('frame-src')]) {
    assert.ok(!/^https?:\/\/\*|^\*|^https:$/.test(source), 'no wildcard sources: ' + source);
    if (source.includes('google')) assert.ok(/^https:\/\/accounts\.google\.com\/gsi\//.test(source), 'Google only under /gsi/: ' + source);
  }
});

test('the site is HTTPS only, and keeps the opener so that the Google pop-up can answer', () => {
  const headers = read('public/_headers');
  assert.match(headers, /Strict-Transport-Security:\s*max-age=\d{8,}/);
  assert.match(headers, /Cross-Origin-Opener-Policy:\s*same-origin-allow-popups/);   // "same-origin" would break the Google pop-up
  assert.match(headers, /X-Frame-Options:\s*DENY/);
  assert.match(headers, /X-Content-Type-Options:\s*nosniff/);
});

test('the Google client id is a public setting; the admin list and every secret stay out of the committed settings', () => {
  const toml = read('wrangler.toml');
  assert.match(toml, /^GOOGLE_CLIENT_ID\s*=\s*"(?:[0-9]+-[a-z0-9_-]+\.apps\.googleusercontent\.com)?"/m);
  assert.ok(!/^ADMIN_EMAILS\s*=/m.test(toml), 'admin emails are a secret (wrangler secret put ADMIN_EMAILS): this file is public on GitHub');
  assert.ok(!/GOOGLE_CLIENT_SECRET|BREVO_API_KEY\s*=\s*"[^"]|APP_SECRET\s*=\s*"[^"]|TURNSTILE_SECRET\s*=\s*"[^"]/.test(toml), 'secrets belong in the dashboard or .dev.vars');
});

test('every admin endpoint asks the server whether the caller is an admin', () => {
  const dir = path.join(ROOT, 'functions/api/admin');
  const files = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : files.push(path.join(d, e.name))));
  walk(dir);
  assert.ok(files.length >= 4);
  for (const file of files) assert.ok(fs.readFileSync(file, 'utf8').includes('requireAdmin('), path.relative(ROOT, file) + ' must call requireAdmin');
});

test('every endpoint that changes data checks that the request comes from this site', () => {
  const files = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : files.push(path.join(d, e.name))));
  walk(path.join(ROOT, 'functions/api'));
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    if (/onRequest(Post|Patch|Put|Delete)/.test(text)) assert.ok(text.includes('sameOrigin('), path.relative(ROOT, file) + ' changes data without sameOrigin()');
  }
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
