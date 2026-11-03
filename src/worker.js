// The Cloudflare Worker: serves the API and, for everything else, the static site in public/.
//
// The API handlers live in functions/ and are written in the Pages Functions style
// (onRequestGet, onRequestPost ... receiving { request, env, params, waitUntil }).
// This file is the small router that calls them, so the same code runs as a Worker.
// Requests outside /api/* never reach this code: Cloudflare serves them straight from public/
// (see run_worker_first in wrangler.toml).

import * as config from '../functions/api/config.js';
import * as requestOtp from '../functions/api/auth/request-otp.js';
import * as verifyOtp from '../functions/api/auth/verify-otp.js';
import * as authMe from '../functions/api/auth/me.js';
import * as logout from '../functions/api/auth/logout.js';
import * as mePhoto from '../functions/api/me/photo.js';
import * as meTour from '../functions/api/me/tour.js';
import * as meSettings from '../functions/api/me/settings.js';
import * as userById from '../functions/api/users/[id].js';
import * as userPhoto from '../functions/api/users/[id]/photo.js';
import { onRequest as middleware } from '../functions/api/_middleware.js';
import { fail } from '../functions/_lib/http.js';

// Each route: the address pattern, the names of its :parameters, and the module that handles it.
const ROUTES = [
  { pattern: /^\/api\/config$/, names: [], handlers: config },
  { pattern: /^\/api\/auth\/request-otp$/, names: [], handlers: requestOtp },
  { pattern: /^\/api\/auth\/verify-otp$/, names: [], handlers: verifyOtp },
  { pattern: /^\/api\/auth\/me$/, names: [], handlers: authMe },
  { pattern: /^\/api\/auth\/logout$/, names: [], handlers: logout },
  { pattern: /^\/api\/me\/photo$/, names: [], handlers: mePhoto },
  { pattern: /^\/api\/me\/tour$/, names: [], handlers: meTour },
  { pattern: /^\/api\/me\/settings$/, names: [], handlers: meSettings },
  { pattern: /^\/api\/users\/([^/]+)\/photo$/, names: ['id'], handlers: userPhoto },
  { pattern: /^\/api\/users\/([^/]+)$/, names: ['id'], handlers: userById }
];

const METHOD_EXPORTS = { GET: 'onRequestGet', POST: 'onRequestPost', PATCH: 'onRequestPatch', DELETE: 'onRequestDelete', PUT: 'onRequestPut' };

function findHandler(route, method) {
  const name = METHOD_EXPORTS[method];
  return (name && route.handlers[name]) || route.handlers.onRequest || null;
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    for (const route of ROUTES) {
      const match = pathname.match(route.pattern);
      if (!match) continue;

      const handler = findHandler(route, request.method);
      if (!handler) {
        const allowed = Object.entries(METHOD_EXPORTS).filter(([, name]) => route.handlers[name]).map(([m]) => m).join(', ');
        const res = fail(405, 'method_not_allowed');
        res.headers.set('Allow', allowed);
        return res;
      }

      const params = {};
      try {
        route.names.forEach((name, i) => { params[name] = decodeURIComponent(match[i + 1]); });
      } catch (e) {
        return fail(404, 'not_found');
      }

      const context = { request, env, params, data: {}, waitUntil: (promise) => ctx.waitUntil(promise) };
      // The shared middleware wraps every API call (error handling, no-cache headers).
      return middleware({ ...context, next: () => handler(context) });
    }

    return fail(404, 'not_found');
  }
};
