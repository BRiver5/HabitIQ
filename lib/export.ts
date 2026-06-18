import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Habit, HabitLog } from './types';

function buildJson(habits: Habit[], logs: HabitLog[]): string {
  return JSON.stringify(
    {
      app: 'HabitIQ',
      exportedAt: new Date().toISOString(),
      version: 1,
      habits,
      logs,
    },
    null,
    2
  );
}

function buildCsv(habits: Habit[], logs: HabitLog[]): string {
  const nameById = new Map(habits.map((h) => [h.id, h.name]));
  const header = 'habit_id,habit_name,date,completed,mood,note';
  const rows = logs.map((l) => {
    const name = (nameById.get(l.habitId) ?? '').replace(/"/g, '""');
    const note = (l.note ?? '').replace(/"/g, '""');
    return `${l.habitId},"${name}",${l.date},${l.completed ? 1 : 0},${l.mood ?? ''},"${note}"`;
  });
  return [header, ...rows].join('\n');
}

async function writeAndShare(filename: string, content: string, mime: string) {
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: mime, dialogTitle: 'Export HabitIQ data' });
  }
}

export async function exportJson(habits: Habit[], logs: HabitLog[]) {
  await writeAndShare('habitiq-export.json', buildJson(habits, logs), 'application/json');
}

export async function exportCsv(habits: Habit[], logs: HabitLog[]) {
  await writeAndShare('habitiq-logs.csv', buildCsv(habits, logs), 'text/csv');
}
