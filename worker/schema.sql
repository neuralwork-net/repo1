-- D1 schema for the prediction vote counter.
CREATE TABLE IF NOT EXISTS votes (
  poll_id TEXT NOT NULL,
  option  TEXT NOT NULL,
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (poll_id, option)
);
