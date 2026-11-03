// POST /api/auth/verify-otp
// Body: { email, code }
//
// Checks the code. On success the account is created (for a sign-up), a session starts and
// the session cookie is set. Every kind of failure is reported as "invalid_code" so the
// answer never reveals anything extra.

import { json, fail, readJson, sameOrigin, clientIp } from '../../_lib/http.js';
import { hmacHex, safeEqual } from '../../_lib/crypto.js';
import { cleanEmail, cleanProfile } from '../../_lib/validate.js';
import { hit } from '../../_lib/ratelimit.js';
import { createSession } from '../../_lib/session.js';
import { createUser, ensureUserId, findUserByEmail, selfView } from '../../_lib/users.js';
import { OTP_MAX_ATTEMPTS, LIMITS } from '../../_lib/config.js';

// The sign-up profile was saved with its photo as bare base64; validation expects a data URL.
function storedProfile(json) {
  const profile = JSON.parse(json);
  if (profile.photo) profile.photo = 'data:image/jpeg;base64,' + profile.photo;
  return profile;
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail(403, 'forbidden');
  if (!env.DB || !env.APP_SECRET) return fail(503, 'not_configured');

  const { body, error } = await readJson(request, 2000);
  if (error) return error;

  const email = cleanEmail(body.email);
  const code = typeof body.code === 'string' ? body.code.replace(/\s+/g, '') : '';
  if (!email || !/^\d{6}$/.test(code)) return fail(422, 'invalid_input', { fields: { code: 'Enter the 6-digit code.' } });

  const db = env.DB;
  const now = Date.now();
  const ipKey = await hmacHex(env.APP_SECRET, 'ip:' + clientIp(request));
  const emailKey = await hmacHex(env.APP_SECRET, 'email:' + email);
  if (!(await hit(db, 'verify-ip:' + ipKey, LIMITS.verifyPerIpPerHour, 3600, now)).allowed) return fail(429, 'rate_limited');
  if (!(await hit(db, 'verify-email:' + emailKey, LIMITS.verifyPerEmailPerHour, 3600, now)).allowed) return fail(429, 'rate_limited');

  const otp = await db
    .prepare('SELECT * FROM otp_codes WHERE email = ? AND used = 0 AND expires_at > ? ORDER BY id DESC LIMIT 1')
    .bind(email, now)
    .first();
  if (!otp) return fail(400, 'invalid_code');

  // Count this guess before checking it, so parallel guesses cannot beat the limit.
  const counted = await db
    .prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ? AND used = 0 AND attempts < ? RETURNING attempts')
    .bind(otp.id, OTP_MAX_ATTEMPTS)
    .first();
  if (!counted) return fail(429, 'too_many_attempts');

  const given = await hmacHex(env.APP_SECRET, `otp:${email}:${code}`);
  if (!safeEqual(otp.code_hash, given)) {
    return fail(400, 'invalid_code', { attemptsLeft: Math.max(0, OTP_MAX_ATTEMPTS - counted.attempts) });
  }

  // A code can be used once, even if two requests arrive together.
  const claimed = await db.prepare('UPDATE otp_codes SET used = 1 WHERE id = ? AND used = 0 RETURNING id').bind(otp.id).first();
  if (!claimed) return fail(400, 'invalid_code');

  let user = await findUserByEmail(db, email);
  let isNewUser = false;
  if (!user) {
    const checked = otp.purpose === 'signup' && otp.signup_json ? cleanProfile(storedProfile(otp.signup_json)) : null;
    if (!checked || checked.errors) return fail(400, 'invalid_code');
    try {
      await createUser(db, email, checked.value, now);
      isNewUser = true;
    } catch (e) {
      // Another request created the same account a moment ago: just sign in to it.
      if (!(await findUserByEmail(db, email))) throw e;
    }
    user = await findUserByEmail(db, email);
  }
  user = await ensureUserId(db, user);

  await db.prepare('UPDATE users SET last_login_at = ? WHERE seq = ?').bind(now, user.seq).run();
  const cookie = await createSession(request, db, user.user_id, now);
  return json({ user: selfView(user), isNewUser }, 200, { 'Set-Cookie': cookie });
}
