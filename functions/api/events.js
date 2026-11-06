// POST /api/events   Body: { kind }
// Lets the browser report that something it alone can see went wrong (the Google script was blocked, a language engine could
// not start). Only a fixed list of kinds is accepted, and only a counter goes up: no message, no email, no user id.

import { json, fail, readJson, sameOrigin, clientIp } from '../_lib/http.js';
import { hmacHex } from '../_lib/crypto.js';
import { hit } from '../_lib/ratelimit.js';
import { track, CLIENT_EVENTS } from '../_lib/stats.js';
import { LIMITS } from '../_lib/config.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!sameOrigin(request)) return fail(403, 'forbidden');
  if (!env.DB || !env.APP_SECRET) return fail(503, 'not_configured');
  const { body, error } = await readJson(request, 300);
  if (error) return error;
  if (!CLIENT_EVENTS.includes(body.kind)) return fail(422, 'invalid_input');
  const ipKey = await hmacHex(env.APP_SECRET, 'ip:' + clientIp(request));
  if (!(await hit(env.DB, 'events-ip:' + ipKey, LIMITS.eventsPerIpPerHour, 3600)).allowed) return fail(429, 'rate_limited');
  track(context, 'client:' + body.kind);
  return json({ ok: true });
}
