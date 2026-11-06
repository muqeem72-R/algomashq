// POST /api/auth/google
// Body: { credential, profile? }
//   credential  the ID token the Google button gave to the browser
//   profile     { firstName, lastName, country, state, language, photo } - only needed the first time, to make the account
//
// Answers:
//   { user, isNewUser }  and the session cookie   the person is signed in
//   { needsProfile: true, suggested }             Google proved the email, but there is no account yet: ask for the profile
//   an error                                      google_failed (with a short reason), rate_limited, invalid_input ...
//
// The email code (request-otp / verify-otp) stays available next to this, so a problem with Google never locks anyone out.

import { json, fail, readJson, sameOrigin, clientIp } from '../../_lib/http.js';
import { hmacHex } from '../../_lib/crypto.js';
import { cleanProfile } from '../../_lib/validate.js';
import { hit } from '../../_lib/ratelimit.js';
import { createSession } from '../../_lib/session.js';
import { createUser, ensureUserId, findUserByEmail, findUserById, selfView } from '../../_lib/users.js';
import { googleConfigured, verifyGoogleIdToken, GOOGLE_JWKS_URL } from '../../_lib/google.js';
import { isAdminEmail } from '../../_lib/admin.js';
import { track } from '../../_lib/stats.js';
import { LIMITS } from '../../_lib/config.js';

// What the browser is told about a failure. The detail stays in the counters; the browser only needs to know what to do.
const PUBLIC_REASON = { expired: 'expired', keys_unavailable: 'unavailable', email_not_verified: 'email_not_verified' };

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!sameOrigin(request)) return fail(403, 'forbidden');
  if (!env.DB || !env.APP_SECRET) return fail(503, 'not_configured');
  if (!googleConfigured(env)) return fail(503, 'google_unavailable');

  const { body, error } = await readJson(request, 170000);
  if (error) return error;

  const db = env.DB;
  const now = Date.now();
  const ipKey = await hmacHex(env.APP_SECRET, 'ip:' + clientIp(request));
  if (!(await hit(db, 'google-ip:' + ipKey, LIMITS.googlePerIpPerHour, 3600, now)).allowed) {
    track(context, 'rate_limited');
    return fail(429, 'rate_limited');
  }

  const checked = await verifyGoogleIdToken(body.credential, {
    clientId: env.GOOGLE_CLIENT_ID,
    now,
    jwksUrl: env.GOOGLE_JWKS_URL || GOOGLE_JWKS_URL   // GOOGLE_JWKS_URL exists only so that local tests can use their own keys
  });
  if (!checked.ok) {
    track(context, 'google_failed:' + checked.reason);
    return fail(400, 'google_failed', { reason: PUBLIC_REASON[checked.reason] || 'invalid' });
  }
  const { sub, email, givenName, familyName, name } = checked.claims;

  // Who is this? First by the stable Google id, then by the verified email (an account made with the email code).
  let user = null;
  const linked = await db.prepare("SELECT user_id FROM identities WHERE provider = 'google' AND subject = ?").bind(sub).first();
  if (linked) user = await findUserById(db, linked.user_id);
  if (!user) user = await findUserByEmail(db, email);

  let isNewUser = false;
  if (!user) {
    if (!body.profile) {
      track(context, 'google_profile_needed');
      const parts = name.split(/\s+/).filter(Boolean);
      return json({
        needsProfile: true,
        suggested: {
          email,
          firstName: givenName || parts[0] || '',
          lastName: familyName || (givenName ? '' : parts.slice(1).join(' '))
        }
      });
    }
    const profile = cleanProfile(body.profile);
    if (profile.errors) return fail(422, 'invalid_input', { fields: profile.errors });
    // Making accounts is limited harder than signing in.
    if (!(await hit(db, 'google-signup:' + ipKey, LIMITS.googleSignupsPerIpPerDay, 86400, now)).allowed) {
      track(context, 'rate_limited');
      return fail(429, 'rate_limited');
    }
    try {
      await createUser(db, email, profile.value, now);
      isNewUser = true;
    } catch (e) {
      // Another request made the same account a moment ago: just sign in to it.
      if (!(await findUserByEmail(db, email))) throw e;
    }
    user = await findUserByEmail(db, email);
  }
  user = await ensureUserId(db, user);

  await db.batch([
    db.prepare("INSERT OR REPLACE INTO identities (provider, subject, user_id, created_at) VALUES ('google', ?, ?, ?)").bind(sub, user.user_id, now),
    db.prepare('UPDATE users SET last_login_at = ? WHERE seq = ?').bind(now, user.seq)
  ]);
  const cookie = await createSession(request, db, user.user_id, now);
  track(context, isNewUser ? 'signup_google' : 'login_google');
  return json({ user: selfView(user, { isAdmin: isAdminEmail(env, user.email) }), isNewUser }, 200, { 'Set-Cookie': cookie });
}
