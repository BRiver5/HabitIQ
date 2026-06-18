import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Local reminder notifications. We lazily require expo-notifications so its
 * push-token side effects never run in Expo Go (where remote notifications were
 * removed in SDK 53+). In Expo Go these helpers no-op; use a development build
 * to test real local notifications.
 */
const isExpoGo = Constants.executionEnvironment === 'storeClient';

type NotificationsModule = typeof import('expo-notifications');
let _mod: NotificationsModule | null = null;

function getNotifications(): NotificationsModule | null {
  if (isExpoGo) return null;
  if (!_mod) {
    _mod = require('expo-notifications') as NotificationsModule;
    _mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }
  return _mod;
}

export async function ensurePermissions(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  const settings = await N.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await N.requestPermissionsAsync();
  return req.granted;
}

/** Schedule a daily reminder at HH:MM. Returns the notification id, or null. */
export async function scheduleDailyReminder(
  title: string,
  time: string
): Promise<string | null> {
  const N = getNotifications();
  if (!N) return null;

  const ok = await ensurePermissions();
  if (!ok) return null;

  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('reminders', {
      name: 'Habit reminders',
      importance: N.AndroidImportance.DEFAULT,
    });
  }

  const [hour, minute] = time.split(':').map(Number);
  return N.scheduleNotificationAsync({
    content: {
      title: 'HabitIQ',
      body: `Time to: ${title}`,
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelReminder(id: string | null): Promise<void> {
  const N = getNotifications();
  if (!N || !id) return;
  try {
    await N.cancelScheduledNotificationAsync(id);
  } catch {
    // already cancelled / invalid id
  }
}
