-- AlgoMashq database schema (Cloudflare D1 / SQLite).
-- Safe to run more than once: every statement uses IF NOT EXISTS.
-- Times are stored as integer milliseconds since the Unix epoch.

-- One row per account. `seq` is the global sign-up counter: the public user id
-- (for example mk001A) is derived from it, so ids can never collide.
CREATE TABLE IF NOT EXISTS users (
  seq                INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id            TEXT UNIQUE,
  email              TEXT NOT NULL UNIQUE,
  first_name         TEXT NOT NULL,
  last_name          TEXT NOT NULL DEFAULT '',
  country            TEXT NOT NULL,                 -- ISO 3166-1 alpha-2 code
  state              TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'cpp',   -- cpp | java | python
  tour_done          INTEGER NOT NULL DEFAULT 0,
  created_at         INTEGER NOT NULL,
  last_login_at      INTEGER
);

-- Profile photo (a small JPEG, base64). Kept apart so normal user queries stay light.
CREATE TABLE IF NOT EXISTS user_photos (
  user_id    TEXT PRIMARY KEY,
  mime       TEXT NOT NULL,
  data       TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- One-time login codes. Only a keyed hash of the code is stored. For a sign-up, the
-- profile the user typed waits in signup_json until the code is confirmed.
CREATE TABLE IF NOT EXISTS otp_codes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL,
  purpose     TEXT NOT NULL CHECK (purpose IN ('login', 'signup')),
  code_hash   TEXT NOT NULL,
  signup_json TEXT,
  attempts    INTEGER NOT NULL DEFAULT 0,
  used        INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes (email, id);

-- Login sessions. Only the hash of the cookie token is stored.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash   TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  created_at   INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions (expires_at);

-- Fixed-window counters used by the rate limits (keys are hashed, never raw emails or IPs).
CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT PRIMARY KEY,
  count        INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);

-- ---- Phase 4: the learner's progress ----
-- A problem solved in a language. Solving is never undone, so rows are only ever added; the first row for a problem is
-- the first time it was solved. (user_id, slug, lang) is the key, so a repeated report is ignored.
CREATE TABLE IF NOT EXISTS solved (
  user_id   TEXT NOT NULL,
  slug      TEXT NOT NULL,
  lang      TEXT NOT NULL CHECK (lang IN ('cpp', 'java', 'python')),
  solved_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, slug, lang)
);

-- How each problem went: concept read, hints shown (0 to 3), solution opened, number of submissions.
-- Every column only grows, so merging two copies is "take the larger value".
CREATE TABLE IF NOT EXISTS problem_state (
  user_id      TEXT NOT NULL,
  slug         TEXT NOT NULL,
  concept_seen INTEGER NOT NULL DEFAULT 0,
  hints        INTEGER NOT NULL DEFAULT 0,
  revealed     INTEGER NOT NULL DEFAULT 0,
  attempts     INTEGER NOT NULL DEFAULT 0,
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (user_id, slug)
);

-- ---- Phase 4b: the last submission and the code typed so far ----
-- Only an ACCEPTED solution is saved. For every problem and language the account keeps ONE: the last accepted one, with its
-- code. A submission that is not accepted saves nothing and never replaces it (Run and Examples are not recorded either).
CREATE TABLE IF NOT EXISTS submissions (
  user_id      TEXT NOT NULL,
  slug         TEXT NOT NULL,
  lang         TEXT NOT NULL CHECK (lang IN ('cpp', 'java', 'python')),
  verdict      TEXT NOT NULL CHECK (verdict IN ('accepted', 'wrong_answer', 'runtime_error', 'time_limit', 'memory_limit', 'output_limit', 'compile_error')),
  passed       INTEGER NOT NULL,
  total        INTEGER NOT NULL,
  time_ms      INTEGER,
  code         TEXT,
  submitted_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_submissions_recent ON submissions (user_id, submitted_at);

-- The code typed so far, per problem and language. A newer copy replaces an older one.
CREATE TABLE IF NOT EXISTS drafts (
  user_id    TEXT NOT NULL,
  slug       TEXT NOT NULL,
  lang       TEXT NOT NULL CHECK (lang IN ('cpp', 'java', 'python')),
  code       TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, slug, lang)
);

-- ---- Phase 4c: bookmarks and notes ----
-- A bookmark is a row with marked = 1. Removing it keeps the row with marked = 0 (and the time), so that an old copy
-- on another device cannot bring it back.
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id    TEXT NOT NULL,
  slug       TEXT NOT NULL,
  marked     INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, slug)
);

-- A personal note on a problem: plain text, at most 500 characters. An emptied note keeps its row with an empty body
-- (and the time) for the same reason as above. A newer copy replaces an older one.
CREATE TABLE IF NOT EXISTS notes (
  user_id    TEXT NOT NULL,
  slug       TEXT NOT NULL,
  body       TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, slug)
);
