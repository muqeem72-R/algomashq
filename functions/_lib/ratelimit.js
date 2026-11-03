// Fixed-window rate limits kept in D1, so they hold across every running instance
// (an in-memory counter would not). The update is a single atomic statement.

export async function hit(db, key, limit, windowSeconds, now = Date.now()) {
  const windowMs = windowSeconds * 1000;
  const row = await db
    .prepare(
      `INSERT INTO rate_limits (key, count, window_start) VALUES (?1, 1, ?2)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN window_start <= ?3 THEN 1 ELSE count + 1 END,
         window_start = CASE WHEN window_start <= ?3 THEN ?2 ELSE window_start END
       RETURNING count, window_start`
    )
    .bind(key, now, now - windowMs)
    .first();
  return {
    allowed: row.count <= limit,
    count: row.count,
    retryAfter: Math.max(1, Math.ceil((row.window_start + windowMs - now) / 1000))
  };
}

// Housekeeping: drop rows that can no longer matter. Cheap, so it runs now and then.
export async function sweep(db, now = Date.now()) {
  const day = 24 * 60 * 60 * 1000;
  await db.batch([
    db.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(now - 2 * day),
    db.prepare('DELETE FROM otp_codes WHERE expires_at < ?').bind(now - day),
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now)
  ]);
}
