CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT,
  created_at TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  marketing_opt_in INTEGER NOT NULL DEFAULT 0,
  business_size TEXT,
  role TEXT,
  score_percent INTEGER,
  tier_key TEXT,
  tier_name TEXT,
  leak_category TEXT,
  answers_json TEXT,
  ip_address TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  isp TEXT,
  asn TEXT,
  colo TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions (created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions (email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_submission_id ON submissions (submission_id);
