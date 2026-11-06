// GET /api/admin/problems   (admins only)
// How the problems are doing, from what members did (never from what they typed):
//   mostSolved  the problems solved by the most members
//   struggle    problems that members opened but did not solve, with how many hints and solution views they used
// The browser adds the titles, because it already has the list of problems.

import { json } from '../../_lib/http.js';
import { requireAdmin } from '../../_lib/admin.js';

export async function onRequestGet(context) {
  const { error } = await requireAdmin(context);
  if (error) return error;

  const [mostSolved, learners] = (await context.env.DB.batch([
    context.env.DB.prepare('SELECT slug, COUNT(DISTINCT user_id) AS solvers FROM solved GROUP BY slug ORDER BY solvers DESC, slug LIMIT 25'),
    context.env.DB.prepare(
      `SELECT ps.slug, COUNT(*) AS learners, SUM(ps.attempts) AS attempts, SUM(ps.hints) AS hints, SUM(ps.revealed) AS revealed,
              SUM(CASE WHEN EXISTS (SELECT 1 FROM solved s WHERE s.user_id = ps.user_id AND s.slug = ps.slug) THEN 1 ELSE 0 END) AS solvers
       FROM problem_state ps
       GROUP BY ps.slug
       ORDER BY (COUNT(*) - SUM(CASE WHEN EXISTS (SELECT 1 FROM solved s WHERE s.user_id = ps.user_id AND s.slug = ps.slug) THEN 1 ELSE 0 END)) DESC,
                SUM(ps.revealed) DESC, ps.slug
       LIMIT 25`
    )
  ])).map((r) => r.results || []);

  return json({
    mostSolved,
    struggle: learners.map((r) => ({ slug: r.slug, learners: r.learners, solvers: r.solvers, stuck: r.learners - r.solvers, attempts: r.attempts, hints: r.hints, revealed: r.revealed }))
  });
}
