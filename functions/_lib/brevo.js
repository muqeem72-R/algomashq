// Sends the login code through Brevo's transactional email API (free plan: 300 emails a day).
// Docs: https://developers.brevo.com/reference/sendtransacemail

const SEND_URL = 'https://api.brevo.com/v3/smtp/email';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function otpEmail({ appName, name, code, minutes }) {
  const subject = `${code} is your ${appName} login code`;
  const text =
    `Hi ${name},\n\nYour ${appName} login code is ${code}.\n` +
    `It works for ${minutes} minutes and can be used once.\n\n` +
    `If you did not ask for this code, you can ignore this email. Nobody can sign in without it.\n`;
  const html =
    `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#141824">` +
    `<h2 style="margin:0 0 12px">${esc(appName)}</h2>` +
    `<p>Hi ${esc(name)},</p>` +
    `<p>Use this code to sign in:</p>` +
    `<p style="font-size:34px;font-weight:700;letter-spacing:8px;margin:16px 0;font-family:Consolas,monospace">${esc(code)}</p>` +
    `<p style="color:#5b6478">It works for ${minutes} minutes and can be used once.</p>` +
    `<p style="color:#5b6478">If you did not ask for this code, you can ignore this email. Nobody can sign in without it.</p>` +
    `</div>`;
  return { subject, text, html };
}

export async function sendOtpEmail(env, { to, name, code, minutes }) {
  const appName = env.APP_NAME || 'AlgoMashq';

  // Local development: show the code in the dev server console instead of emailing it.
  if (env.DEV_LOG_OTP === '1') {
    console.log(`[dev] login code for ${to}: ${code}`);
    return;
  }
  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL || String(env.BREVO_SENDER_EMAIL).startsWith('REPLACE_')) {
    throw new Error('Brevo is not configured (BREVO_API_KEY / BREVO_SENDER_EMAIL).');
  }

  const mail = otpEmail({ appName, name, code, minutes });
  const res = await fetch(SEND_URL, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: env.BREVO_SENDER_NAME || appName, email: env.BREVO_SENDER_EMAIL },
      to: [{ email: to, name }],
      subject: mail.subject,
      htmlContent: mail.html,
      textContent: mail.text,
      tags: ['login-code']
    })
  });
  if (!res.ok) throw new Error(`Brevo answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
}
