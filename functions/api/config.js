// GET /api/config: the public settings the browser needs before anyone is signed in.

import { json } from '../_lib/http.js';
import { turnstileConfigured } from '../_lib/turnstile.js';
import { OTP_TTL_SECONDS, RESEND_SECONDS, PHOTO_REQUIRED } from '../_lib/config.js';

export async function onRequestGet({ env }) {
  return json({
    appName: env.APP_NAME || 'AlgoMashq',
    javaOrigin: env.JAVA_ORIGIN || null,
    turnstileSiteKey: turnstileConfigured(env) ? env.TURNSTILE_SITE_KEY : null,
    photoRequired: PHOTO_REQUIRED,
    resendSeconds: RESEND_SECONDS,
    codeMinutes: Math.round(OTP_TTL_SECONDS / 60)
  });
}
