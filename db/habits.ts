import { Habit, TargetFrequency } from '../lib/types';
import { getDb } from './index';

interface HabitRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  target_frequency: string;
  weekly_target: number;
  weekdays: string;
  reminder_time: string | null;
  notification_id: string | null;
  sort_order: number;
  created_at: string;
  archived_at: string | null;
}

function rowToHabit(r: HabitRow): Habit {
  return {
    id: r.id,
    name: r.name,
    icon: r.icon,
    color: r.color,
    targetFrequency: r.target_frequency as TargetFrequency,
    weeklyTarget: r.weekly_target,
    weekdays: JSON.parse(r.weekdays || '[0,1,2,3,4,5,6]'),
    reminderTime: r.reminder_time,
    notificationId: r.notification_id,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    archivedAt: r.archived_at,
  };
}

export function listHabits(): Habit[] {
  const rows = getDb().getAllSync<HabitRow>(
    'SELECT * FROM habits ORDER BY sort_order ASC, created_at ASC'
  );
  return rows.map(rowToHabit);
}

export function insertHabit(h: Habit): void {
  getDb().runSync(
    `INSERT INTO habits
      (id, name, icon, color, target_frequency, weekly_target, weekdays, reminder_time, notification_id, sort_order, created_at, archived_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      h.id,
      h.name,
      h.icon,
      h.color,
      h.targetFrequency,
      h.weeklyTarget,
      JSON.stringify(h.weekdays),
      h.reminderTime,
      h.notificationId,
      h.sortOrder,
      h.createdAt,
      h.archivedAt,
    ]
  );
}

export function updateHabit(h: Habit): void {
  getDb().runSync(
    `UPDATE habits SET
      name = ?, icon = ?, color = ?, target_frequency = ?, weekly_target = ?,
      weekdays = ?, reminder_time = ?, notification_id = ?, sort_order = ?, archived_at = ?
     WHERE id = ?`,
    [
      h.name,
      h.icon,
      h.color,
      h.targetFrequency,
      h.weeklyTarget,
      JSON.stringify(h.weekdays),
      h.reminderTime,
      h.notificationId,
      h.sortOrder,
      h.archivedAt,
      h.id,
    ]
  );
}

export function deleteHabit(id: string): void {
  getDb().runSync('DELETE FROM habits WHERE id = ?', [id]);
}

export function reorderHabits(orderedIds: string[]): void {
  const db = getDb();
  db.withTransactionSync(() => {
    orderedIds.forEach((id, idx) => {
      db.runSync('UPDATE habits SET sort_order = ? WHERE id = ?', [idx, id]);
    });
  });
}
