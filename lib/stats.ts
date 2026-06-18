import { Habit, HabitLog, HabitStats } from './types';
import { addDays, daysBetween, parseKey, todayKey } from './dates';

/** Set of completed date keys for fast lookup. */
export function completedSet(logs: HabitLog[]): Set<string> {
  const s = new Set<string>();
  for (const l of logs) if (l.completed) s.add(l.date);
  return s;
}

/**
 * Current streak counting back from today. A streak survives if today isn't
 * done yet (we start from yesterday) but breaks once a gap is found.
 */
export function currentStreak(completed: Set<string>): number {
  if (completed.size === 0) return 0;
  let streak = 0;
  let cursor = todayKey();
  if (!completed.has(cursor)) {
    // allow today to be pending without breaking an existing streak
    cursor = addDays(cursor, -1);
    if (!completed.has(cursor)) return 0;
  }
  while (completed.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(completed: Set<string>): number {
  if (completed.size === 0) return 0;
  const sorted = Array.from(completed).sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (daysBetween(sorted[i - 1], sorted[i]) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
  }
  return longest;
}

export function computeStats(habit: Habit, logs: HabitLog[]): HabitStats {
  const completed = completedSet(logs);
  const total = completed.size;
  const created = habit.createdAt.slice(0, 10);
  const daysTracked = Math.max(1, daysBetween(created, todayKey()) + 1);

  // completion rate is relative to expected days based on frequency
  let expected = daysTracked;
  if (habit.targetFrequency === 'weekly') {
    expected = Math.max(1, Math.round((daysTracked / 7) * habit.weeklyTarget));
  } else if (habit.targetFrequency === 'weekdays') {
    expected = countExpectedWeekdays(created, todayKey(), habit.weekdays);
  }
  const rate = Math.min(100, Math.round((total / Math.max(1, expected)) * 100));

  return {
    currentStreak: currentStreak(completed),
    longestStreak: longestStreak(completed),
    totalCompletions: total,
    completionRate: rate,
    daysTracked,
  };
}

function countExpectedWeekdays(from: string, to: string, weekdays: number[]): number {
  if (weekdays.length === 0) return 1;
  let count = 0;
  let cursor = from;
  const wd = new Set(weekdays);
  while (cursor <= to) {
    if (wd.has(parseKey(cursor).getDay())) count += 1;
    cursor = addDays(cursor, 1);
  }
  return Math.max(1, count);
}

/** Completions in the current calendar month. */
export function monthlyCompletions(completed: Set<string>, year: number, month: number): number {
  let n = 0;
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  for (const d of completed) if (d.startsWith(prefix)) n += 1;
  return n;
}

/** Last `weeks` weekly totals ending this week (oldest first). */
export function weeklyTotals(completed: Set<string>, weeks = 8): { label: string; value: number }[] {
  const result: { label: string; value: number }[] = [];
  const today = todayKey();
  const dow = parseKey(today).getDay();
  let weekStart = addDays(today, -dow); // Sunday of current week
  const buckets: { start: string; value: number }[] = [];
  for (let i = 0; i < weeks; i++) {
    buckets.unshift({ start: weekStart, value: 0 });
    weekStart = addDays(weekStart, -7);
  }
  for (const d of completed) {
    for (const b of buckets) {
      const end = addDays(b.start, 6);
      if (d >= b.start && d <= end) {
        b.value += 1;
        break;
      }
    }
  }
  for (const b of buckets) {
    const dt = parseKey(b.start);
    result.push({ label: `${dt.getMonth() + 1}/${dt.getDate()}`, value: b.value });
  }
  return result;
}

/** Per-month completion counts for a calendar year. */
export function monthlyTotals(completed: Set<string>, year: number): number[] {
  const totals = new Array(12).fill(0);
  for (const d of completed) {
    if (d.startsWith(String(year))) {
      const m = Number(d.slice(5, 7)) - 1;
      totals[m] += 1;
    }
  }
  return totals;
}
