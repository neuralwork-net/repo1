-- D1 schema for the prediction vote counter.
CREATE TABLE IF NOT EXISTS votes (
  poll_id TEXT NOT NULL,
  option  TEXT NOT NULL,
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (poll_id, option)
);

-- Quiz scores for the anonymous leaderboard. One row per device per quiz;
-- re-plays keep the best score.
CREATE TABLE IF NOT EXISTS scores (
  device_id  TEXT NOT NULL,
  quiz       TEXT NOT NULL,
  score      INTEGER NOT NULL,
  total      INTEGER NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (device_id, quiz)
);
CREATE INDEX IF NOT EXISTS idx_scores_device ON scores (device_id);
