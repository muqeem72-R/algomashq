// POST /api/auth/request-otp
// Body: { purpose: "login" | "signup", email, turnstileToken, profile?: { firstName, lastName, country, state, language, photo } }
//
// Emails a 6-digit code. The answer is the same whether or not the email already has an
// account, so nobody can use this form to find out who is registered:
//   login  + unknown email  -> nothing is sent, the answer still says "ok"
//   signup + known email    -> a normal login code is sent (the typed profile is ignored)

import { json, fail, readJson, sameOrigin, clientIp } from '../../_lib/http.js';
import { hmacHex, randomCode } from '../../_lib/crypto.js';
import { cleanEmail, cleanProfile } from '../../_lib/validate.js';
import { hit, sweep } from '../../_lib/ratelimit.js';
import { verifyTurnstile } from '../../_lib/turnstile.js';
import { sendOtpEmail } from '../../_lib/brevo.js';
import { findUserByEmail } from '../../_lib/users.js';
import { OTP_TTL_SECONDS, RESEND_SECONDS, DAILY_EMAIL_CAP, LIMITS } from '../../_lib/config.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!sameOrigin(request)) return fail(403, 'forbidden');
  if (!env.DB || !env.APP_SECRET) return fail(503, 'not_configured');

  const { body, error } = await readJson(request, 170000);
  if (error) return error;

  const email = cleanEmail(body.email);
  if (!email) return fail(422, 'invalid_input', { fields: { email: 'Enter a valid email address.' } });

  const wantsSignup = body.purpose === 'signup';
  let profile = null;
  if (wantsSignup) {
    const checked = cleanProfile(body.profile);
    if (checked.errors) return fail(422, 'invalid_input', { fields: checked.errors });
    profile = checked.value;
  }

  const db = env.DB;
  const now = Date.now();
  const ipKey = await hmacHex(env.APP_SECRET, 'ip:' + clientIp(request));
  const emailKey = await hmacHex(env.APP_SECRET, 'email:' + email);

  // Cheap check first, so a flood of requests never reaches Turnstile or the email provider.
  if (!(await hit(db, 'otp-ip:' + ipKey, LIMITS.otpPerIpPerHour, 3600, now)).allowed) return fail(429, 'rate_limited');

  const human = await verifyTurnstile(env, body.turnstileToken, clientIp(request));
  if (!human.ok) {
    if (human.reason === 'not_configured') return fail(503, 'captcha_unavailable');
    return fail(400, 'captcha_failed');
  }

  const cooldown = await hit(db, 'otp-cooldown:' + emailKey, 1, RESEND_SECONDS, now);
  if (!cooldown.allowed) return fail(429, 'cooldown', { retryAfter: cooldown.retryAfter });
  if (!(await hit(db, 'otp-email:' + emailKey, LIMITS.otpPerEmailPerHour, 3600, now)).allowed) return fail(429, 'rate_limited');
  const day = new Date(now).toISOString().slice(0, 10);
  if (!(await hit(db, 'otp-day:' + day, DAILY_EMAIL_CAP, 86400, now)).allowed) return fail(429, 'daily_limit');

  const ok = () => json({ ok: true, resendSeconds: RESEND_SECONDS, expiresInSeconds: OTP_TTL_SECONDS });

  const user = await findUserByEmail(db, email);
  if (!user && !wantsSignup) return ok();   // unknown email on the login form: say nothing

  const purpose = user ? 'login' : 'signup';
  const code = randomCode();
  const codeHash = await hmacHex(env.APP_SECRET, `otp:${email}:${code}`);

  // Only the newest code may be used: retire any earlier one for this email.
  await db.batch([
    db.prepare('UPDATE otp_codes SET used = 1 WHERE email = ? AND used = 0').bind(email),
    db
      .prepare('INSERT INTO otp_codes (email, purpose, code_hash, signup_json, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(email, purpose, codeHash, purpose === 'signup' ? JSON.stringify(profile) : null, now, now + OTP_TTL_SECONDS * 1000)
  ]);

  try {
    await sendOtpEmail(env, {
      to: email,
      name: user ? user.first_name : profile.firstName,
      code,
      minutes: Math.round(OTP_TTL_SECONDS / 60)
    });
  } catch (e) {
    console.error('Could not send the login email:', e.message);
    await db.prepare('UPDATE otp_codes SET used = 1 WHERE email = ? AND used = 0').bind(email).run();
    return fail(502, 'email_failed');
  }

  if (Math.random() < 0.1) context.waitUntil(sweep(db, now));
  return ok();
}
