import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;
let _initialized = false;

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync('habitiq.db');
  }
  // Ensure the schema exists before any query runs, regardless of call order.
  if (!_initialized) {
    _initialized = true;
    createSchema(_db);
  }
  return _db;
}

/** Create tables and run lightweight migrations. Idempotent. */
export function initDb(): void {
  getDb();
}

function createSchema(db: SQLite.SQLiteDatabase): void {
  db.execSync('PRAGMA journal_mode = WAL;');
  db.execSync('PRAGMA foreign_keys = ON;');

  db.execSync(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'check-circle',
      color TEXT NOT NULL DEFAULT '#2F5DFF',
      target_frequency TEXT NOT NULL DEFAULT 'daily',
      weekly_target INTEGER NOT NULL DEFAULT 7,
      weekdays TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
      reminder_time TEXT,
      notification_id TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      archived_at TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 1,
      mood TEXT,
      note TEXT,
      created_at TEXT NOT NULL,
      UNIQUE (habit_id, date),
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
    );
  `);

  db.execSync(
    `CREATE INDEX IF NOT EXISTS idx_logs_habit_date ON habit_logs (habit_id, date);`
  );

  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );
  `);
}

export function getSetting(key: string): string | null {
  const row = getDb().getFirstSync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return row ? row.value : null;
}

export function setSetting(key: string, value: string): void {
  getDb().runSync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value]
  );
}
