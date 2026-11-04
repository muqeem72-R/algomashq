// Stand-ins for the browser's storage and for the API, so the browser code can be tested in Node.

export function fakeStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: (k) => { data.delete(k); },
    key: (i) => [...data.keys()][i] ?? null,
    get length() { return data.size; },
    _data: data
  };
}

// An account kept in memory. Switch `online` off to simulate a lost connection; `refuse(path, body)` can make it answer 422.
export function fakeServer() {
  const server = { solved: [], states: {}, submissions: [], drafts: {}, calls: [], online: true, failDrafts: false, refuse: null };
  globalThis.fetch = async (path, opts = {}) => {
    const method = opts.method || 'GET';
    const body = opts.body ? JSON.parse(opts.body) : null;
    server.calls.push({ path, method, body });
    if (!server.online) throw new TypeError('network down');
    const reply = (status, data) => ({ ok: status < 400, status, json: async () => data });
    if (server.refuse && server.refuse(path, body)) return reply(422, { error: 'invalid_input' });
    if (path === '/api/me/progress') return reply(200, { solved: server.solved, states: server.states });
    if (path === '/api/me/solved') {
      if (!server.solved.some((x) => x.slug === body.slug && x.lang === body.lang)) server.solved.push({ slug: body.slug, lang: body.lang, at: body.at });
      return reply(200, { saved: true });
    }
    if (path === '/api/me/state') { server.states[body.slug] = { conceptSeen: body.conceptSeen, hints: body.hints, revealed: body.revealed, attempts: body.attempts }; return reply(200, { saved: true }); }
    if (path === '/api/me/submissions' && method === 'POST') { server.submissions.push(body); return reply(200, { saved: true, id: server.submissions.length }); }
    if (path === '/api/me/drafts' && method === 'PUT') {
      if (server.failDrafts) return reply(500, { error: 'server_error' });
      const key = `${body.slug}:${body.lang}`;
      const have = server.drafts[key];
      if (body.code === null) { if (have && have.at <= body.at) delete server.drafts[key]; }
      else if (!have || body.at >= have.at) server.drafts[key] = { code: body.code, at: body.at };
      return reply(200, { saved: true });
    }
    const m = /^\/api\/me\/drafts\/([a-z0-9-]+)$/.exec(path);
    if (m) {
      const drafts = {};
      for (const [key, d] of Object.entries(server.drafts)) { const [slug, lang] = key.split(':'); if (slug === m[1]) drafts[lang] = d; }
      return reply(200, { drafts });
    }
    return reply(404, { error: 'not_found' });
  };
  return server;
}

// Loads a fresh copy of the progress module with empty storage and a fake account, runs fn, and always cleans up.
export async function withBrowser(fn) {
  const progress = await import('../../public/assets/js/progress.js');
  globalThis.localStorage = fakeStorage();
  const server = fakeServer();
  progress.reset();
  try { await fn({ progress, server, storage: globalThis.localStorage }); } finally { progress.reset(); }
}
