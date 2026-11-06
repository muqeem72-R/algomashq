// Anonymous daily counters kept in D1 (table daily_stats). They count events, never people: no email, no user id, no IP.
// Analytics must never break a request, so every call here swallows its own errors.

const dayKey = (now) => new Date(now).toISOString().slice(0, 10);

export async function bump(db, metric, by = 1, now = Date.now()) {
  try {
    await db
      .prepare('INSERT INTO daily_stats (day, metric, n) VALUES (?1, ?2, ?3) ON CONFLICT(day, metric) DO UPDATE SET n = n + ?3')
      .bind(dayKey(now), String(metric).slice(0, 60), by)
      .run();
  } catch (e) {
    console.error('Could not count', metric, e && e.message);
  }
}

// Counts in the background, after the answer has been sent.
export function track(context, metric, by = 1) {
  const job = bump(context.env.DB, metric, by);
  if (context.waitUntil) context.waitUntil(job);
  return job;
}

// Browser-side events that a visitor may report (the browser is the only place that can see them). Fixed list: anything
// else is refused, so nobody can fill the table with their own names.
export const CLIENT_EVENTS = [
  'google_script_failed',     // the Google script could not be loaded (blocked, offline)
  'google_script_slow',       // it loaded too slowly and the email form was offered instead
  'google_signin_failed',     // the sign-in was started but the server refused it
  'google_hint_used',         // the person chose the email code instead of Google
  'engine_failed_python',     // the in-browser engine of a language could not start
  'engine_failed_cpp',
  'engine_failed_java'
];

// Days that are kept. Older rows are removed by the sweep.
export const STATS_KEEP_DAYS = 400;

// The last `days` UTC day keys, oldest first (used to draw charts without gaps).
export function lastDays(days, now = Date.now()) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) out.push(dayKey(now - i * 86400000));
  return out;
}
