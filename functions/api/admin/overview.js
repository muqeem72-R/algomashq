// GET /api/admin/overview   (admins only)
// Numbers for the admin page: members, who is active, what they solve, how people sign in, what went wrong.
// Everything is a count. Counters per day come from daily_stats (anonymous); the rest is counted from the real tables.

import { json } from '../../_lib/http.js';
import { requireAdmin, adminEmails } from '../../_lib/admin.js';
import { lastDays } from '../../_lib/stats.js';
import { DAILY_EMAIL_CAP } from '../../_lib/config.js';

const DAY = 24 * 60 * 60 * 1000;
const DAYS_SHOWN = 30;

export async function onRequestGet(context) {
  const { error } = await requireAdmin(context);
  if (error) return error;

  const db = context.env.DB;
  const now = Date.now();
  const days = lastDays(DAYS_SHOWN, now);
  const since = new Date(days[0] + 'T00:00:00Z').getTime();
  const today = days[days.length - 1];

  const count = (sql, ...binds) => db.prepare(sql).bind(...binds);
  const [
    users, signups7, signups30, active1, active7, active30, solves, solvers, googleLinked,
    solvedByLang, signupsByDay, solvesByDay, stats, countries, languages, emailsToday, log
  ] = (await db.batch([
    count('SELECT COUNT(*) AS n FROM users'),
    count('SELECT COUNT(*) AS n FROM users WHERE created_at >= ?', now - 7 * DAY),
    count('SELECT COUNT(*) AS n FROM users WHERE created_at >= ?', now - 30 * DAY),
    count('SELECT COUNT(DISTINCT user_id) AS n FROM sessions WHERE last_seen_at >= ?', now - DAY),
    count('SELECT COUNT(DISTINCT user_id) AS n FROM sessions WHERE last_seen_at >= ?', now - 7 * DAY),
    count('SELECT COUNT(DISTINCT user_id) AS n FROM sessions WHERE last_seen_at >= ?', now - 30 * DAY),
    count('SELECT COUNT(*) AS n FROM solved'),
    count('SELECT COUNT(DISTINCT user_id) AS n FROM solved'),
    count("SELECT COUNT(*) AS n FROM identities WHERE provider = 'google'"),
    count('SELECT lang, COUNT(*) AS n FROM solved GROUP BY lang'),
    count("SELECT strftime('%Y-%m-%d', created_at / 1000, 'unixepoch') AS day, COUNT(*) AS n FROM users WHERE created_at >= ? GROUP BY day", since),
    count("SELECT strftime('%Y-%m-%d', solved_at / 1000, 'unixepoch') AS day, COUNT(*) AS n FROM solved WHERE solved_at >= ? GROUP BY day", since),
    count('SELECT day, metric, n FROM daily_stats WHERE day >= ?', days[0]),
    count('SELECT country, COUNT(*) AS n FROM users GROUP BY country ORDER BY n DESC LIMIT 10'),
    count('SELECT preferred_language AS lang, COUNT(*) AS n FROM users GROUP BY preferred_language'),
    count('SELECT count FROM rate_limits WHERE key = ?', 'otp-day:' + today),
    count('SELECT l.at, l.action, l.target, u.user_id AS admin FROM admin_log l LEFT JOIN users u ON u.user_id = l.admin_id ORDER BY l.id DESC LIMIT 15')
  ])).map((r) => r.results || []);

  const byDay = (rows) => Object.fromEntries(rows.map((r) => [r.day, r.n]));
  const metrics = {};
  for (const row of stats) (metrics[row.metric] = metrics[row.metric] || {})[row.day] = row.n;

  return json({
    generatedAt: now,
    totals: {
      members: users[0].n, signups7: signups7[0].n, signups30: signups30[0].n,
      active1: active1[0].n, active7: active7[0].n, active30: active30[0].n,
      solves: solves[0].n, solvers: solvers[0].n, googleLinked: googleLinked[0].n
    },
    days,
    signups: byDay(signupsByDay),
    solvesPerDay: byDay(solvesByDay),
    metrics,                       // { metric: { 'YYYY-MM-DD': n } } for the last 30 days
    solvedByLang: solvedByLang,
    countries,
    languages,
    emails: { sentToday: emailsToday[0] ? emailsToday[0].count : 0, dailyCap: DAILY_EMAIL_CAP },
    admins: adminEmails(context.env).length,
    adminLog: log
  });
}
