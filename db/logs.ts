import { HabitLog } from '../lib/types';
import { getDb } from './index';

interface LogRow {
  id: string;
  habit_id: string;
  date: string;
  completed: number;
  mood: string | null;
  note: string | null;
  created_at: string;
}

function rowToLog(r: LogRow): HabitLog {
  return {
    id: r.id,
    habitId: r.habit_id,
    date: r.date,
    completed: r.completed === 1,
    mood: r.mood,
    note: r.note,
    createdAt: r.created_at,
  };
}

export function listLogsForDate(date: string): HabitLog[] {
  const rows = getDb().getAllSync<LogRow>(
    'SELECT * FROM habit_logs WHERE date = ?',
    [date]
  );
  return rows.map(rowToLog);
}

export function listLogsForHabit(habitId: string): HabitLog[] {
  const rows = getDb().getAllSync<LogRow>(
    'SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY date ASC',
    [habitId]
  );
  return rows.map(rowToLog);
}

export function listAllLogs(): HabitLog[] {
  const rows = getDb().getAllSync<LogRow>(
    'SELECT * FROM habit_logs ORDER BY date ASC'
  );
  return rows.map(rowToLog);
}

/** Toggle completion for a habit on a date. Returns the resulting log or null if removed. */
export function toggleLog(habitId: string, date: string): HabitLog | null {
  const db = getDb();
  const existing = db.getFirstSync<LogRow>(
    'SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?',
    [habitId, date]
  );
  if (existing) {
    db.runSync('DELETE FROM habit_logs WHERE id = ?', [existing.id]);
    return null;
  }
  const log: HabitLog = {
    id: `${habitId}_${date}`,
    habitId,
    date,
    completed: true,
    mood: null,
    note: null,
    createdAt: new Date().toISOString(),
  };
  db.runSync(
    `INSERT INTO habit_logs (id, habit_id, date, completed, mood, note, created_at)
     VALUES (?, ?, ?, 1, ?, ?, ?)`,
    [log.id, log.habitId, log.date, log.mood, log.note, log.createdAt]
  );
  return log;
}

export function setMood(habitId: string, date: string, mood: string | null): void {
  getDb().runSync('UPDATE habit_logs SET mood = ? WHERE habit_id = ? AND date = ?', [
    mood,
    habitId,
    date,
  ]);
}

export function deleteLogsForHabit(habitId: string): void {
  getDb().runSync('DELETE FROM habit_logs WHERE habit_id = ?', [habitId]);
}
