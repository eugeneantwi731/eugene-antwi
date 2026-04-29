-- ============================================================
-- Boahemaa D1 Schema
-- Run once: wrangler d1 execute boahemaa-logs --file=schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id     TEXT    NOT NULL,
  turn                INTEGER NOT NULL,
  user_message        TEXT,
  assistant_response  TEXT,
  page_url            TEXT,
  ip                  TEXT,
  user_agent          TEXT,
  response_time_ms    INTEGER,
  input_tokens        INTEGER,
  output_tokens       INTEGER,
  total_tokens        INTEGER,
  estimated_cost_usd  REAL,
  created_at          TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversations_id   ON conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_time ON conversations(created_at);

CREATE TABLE IF NOT EXISTS sessions (
  conversation_id  TEXT  PRIMARY KEY,
  started_at       TEXT  NOT NULL,
  last_active      TEXT  NOT NULL,
  page_url         TEXT,
  ip               TEXT,
  total_turns      INTEGER DEFAULT 0,
  total_tokens     INTEGER DEFAULT 0,
  total_cost_usd   REAL    DEFAULT 0
);
