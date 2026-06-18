import { create } from 'zustand';
import { Habit, HabitLog, TargetFrequency } from '../lib/types';
import { uid } from '../lib/id';
import { todayKey } from '../lib/dates';
import { initDb, getSetting, setSetting } from '../db';
import {
  deleteHabit as dbDeleteHabit,
  insertHabit,
  listHabits,
  reorderHabits as dbReorder,
  updateHabit,
} from '../db/habits';
import { listAllLogs, toggleLog as dbToggleLog } from '../db/logs';
import { cancelReminder, scheduleDailyReminder } from '../lib/notifications';

export interface NewHabitInput {
  name: string;
  icon: string;
  color: string;
  targetFrequency: TargetFrequency;
  weeklyTarget: number;
  weekdays: number[];
  reminderTime: string | null;
}

interface HabitState {
  hydrated: boolean;
  habits: Habit[];
  logs: HabitLog[];
  hydrate: () => void;
  activeHabits: () => Habit[];
  isCompletedToday: (habitId: string) => boolean;
  addHabit: (input: NewHabitInput) => Promise<Habit>;
  editHabit: (id: string, input: NewHabitInput) => Promise<void>;
  archiveHabit: (id: string, archived: boolean) => void;
  removeHabit: (id: string) => void;
  reorder: (orderedIds: string[]) => void;
  toggleToday: (habitId: string) => void;
  toggleOnDate: (habitId: string, date: string) => void;
  logsFor: (habitId: string) => HabitLog[];
}

export const useHabitStore = create<HabitState>((set, get) => ({
  hydrated: false,
  habits: [],
  logs: [],

  hydrate: () => {
    initDb();
    const habits = listHabits();
    const logs = listAllLogs();
    set({ habits, logs, hydrated: true });
  },

  activeHabits: () => get().habits.filter((h) => !h.archivedAt),

  isCompletedToday: (habitId) => {
    const t = todayKey();
    return get().logs.some((l) => l.habitId === habitId && l.date === t && l.completed);
  },

  addHabit: async (input) => {
    const order = get().habits.length;
    let notificationId: string | null = null;
    if (input.reminderTime) {
      notificationId = await scheduleDailyReminder(input.name, input.reminderTime);
    }
    const habit: Habit = {
      id: uid(),
      name: input.name.trim(),
      icon: input.icon,
      color: input.color,
      targetFrequency: input.targetFrequency,
      weeklyTarget: input.weeklyTarget,
      weekdays: input.weekdays,
      reminderTime: input.reminderTime,
      notificationId,
      sortOrder: order,
      createdAt: new Date().toISOString(),
      archivedAt: null,
    };
    insertHabit(habit);
    set({ habits: [...get().habits, habit] });
    return habit;
  },

  editHabit: async (id, input) => {
    const existing = get().habits.find((h) => h.id === id);
    if (!existing) return;

    let notificationId = existing.notificationId;
    const reminderChanged = existing.reminderTime !== input.reminderTime;
    if (reminderChanged) {
      await cancelReminder(existing.notificationId);
      notificationId = input.reminderTime
        ? await scheduleDailyReminder(input.name, input.reminderTime)
        : null;
    }

    const updated: Habit = {
      ...existing,
      name: input.name.trim(),
      icon: input.icon,
      color: input.color,
      targetFrequency: input.targetFrequency,
      weeklyTarget: input.weeklyTarget,
      weekdays: input.weekdays,
      reminderTime: input.reminderTime,
      notificationId,
    };
    updateHabit(updated);
    set({ habits: get().habits.map((h) => (h.id === id ? updated : h)) });
  },

  archiveHabit: (id, archived) => {
    const existing = get().habits.find((h) => h.id === id);
    if (!existing) return;
    const updated: Habit = { ...existing, archivedAt: archived ? new Date().toISOString() : null };
    updateHabit(updated);
    set({ habits: get().habits.map((h) => (h.id === id ? updated : h)) });
  },

  removeHabit: (id) => {
    const existing = get().habits.find((h) => h.id === id);
    if (existing?.notificationId) cancelReminder(existing.notificationId);
    dbDeleteHabit(id);
    set({
      habits: get().habits.filter((h) => h.id !== id),
      logs: get().logs.filter((l) => l.habitId !== id),
    });
  },

  reorder: (orderedIds) => {
    dbReorder(orderedIds);
    const map = new Map(get().habits.map((h) => [h.id, h]));
    const reordered = orderedIds
      .map((id, idx) => {
        const h = map.get(id);
        return h ? { ...h, sortOrder: idx } : null;
      })
      .filter(Boolean) as Habit[];
    // include any habits not in the ordered list (e.g. archived) at the end
    const remaining = get().habits.filter((h) => !orderedIds.includes(h.id));
    set({ habits: [...reordered, ...remaining] });
  },

  toggleToday: (habitId) => get().toggleOnDate(habitId, todayKey()),

  toggleOnDate: (habitId, date) => {
    const result = dbToggleLog(habitId, date);
    if (result) {
      set({ logs: [...get().logs, result] });
    } else {
      set({
        logs: get().logs.filter((l) => !(l.habitId === habitId && l.date === date)),
      });
    }
  },

  logsFor: (habitId) => get().logs.filter((l) => l.habitId === habitId),
}));

export { getSetting, setSetting };
