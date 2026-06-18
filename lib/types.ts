export type TargetFrequency = 'daily' | 'weekdays' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  targetFrequency: TargetFrequency;
  /** For 'weekly' frequency: target completions per week. */
  weeklyTarget: number;
  /** For 'weekdays': bitmask-ish array of weekday indices (0=Sun..6=Sat). */
  weekdays: number[];
  reminderTime: string | null; // 'HH:MM' or null
  notificationId: string | null;
  sortOrder: number;
  createdAt: string; // ISO date
  archivedAt: string | null;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // 'YYYY-MM-DD'
  completed: boolean;
  mood: string | null; // mood key from MOOD_COLORS or null
  note: string | null;
  createdAt: string;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0..100
  daysTracked: number;
}
