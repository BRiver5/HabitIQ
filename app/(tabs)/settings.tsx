import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useHabitStore } from '../../store/habitStore';
import { useTheme, useThemeControls } from '../../lib/theme';
import { font, radius, spacing } from '../../lib/theme';
import { getDeviceId } from '../../lib/device';
import { ensurePermissions } from '../../lib/notifications';
import { exportCsv, exportJson } from '../../lib/export';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { scheme, setScheme } = useThemeControls();
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const handleExport = async (kind: 'json' | 'csv') => {
    try {
      if (kind === 'json') await exportJson(habits, logs);
      else await exportCsv(habits, logs);
    } catch {
      Alert.alert('Export failed', 'Could not export your data. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.xl,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.rowText}>
            <Feather name="moon" size={20} color={theme.text} />
            <Text style={[styles.rowLabel, { color: theme.text }]}>Dark mode</Text>
          </View>
          <Switch
            value={scheme === 'dark'}
            onValueChange={(v) => setScheme(v ? 'dark' : 'light')}
            trackColor={{ true: theme.accent, false: theme.border }}
            thumbColor="#FFFFFF"
          />
        </View>
        <Pressable
          onPress={() => setScheme('system')}
          style={styles.linkRow}
        >
          <Text style={[styles.link, { color: scheme === 'system' ? theme.accent : theme.textSecondary }]}>
            {scheme === 'system' ? '\u2713 Following system theme' : 'Use system theme'}
          </Text>
        </Pressable>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>NOTIFICATIONS</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.rowText}>
            <Feather name="bell" size={20} color={theme.text} />
            <Text style={[styles.rowLabel, { color: theme.text }]}>Allow reminders</Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={async (v) => {
              if (v) {
                const ok = await ensurePermissions();
                setNotifEnabled(ok);
                if (!ok) Alert.alert('Permission needed', 'Enable notifications in system settings.');
              } else {
                setNotifEnabled(false);
              }
            }}
            trackColor={{ true: theme.accent, false: theme.border }}
            thumbColor="#FFFFFF"
          />
        </View>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Set a reminder time per habit when adding or editing it.
        </Text>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>DATA</Text>
        <Pressable
          onPress={() => handleExport('json')}
          style={({ pressed }) => [styles.card, { backgroundColor: theme.card, opacity: pressed ? 0.8 : 1 }]}
        >
          <View style={styles.rowText}>
            <Feather name="download" size={20} color={theme.text} />
            <Text style={[styles.rowLabel, { color: theme.text }]}>Export as JSON</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
        <Pressable
          onPress={() => handleExport('csv')}
          style={({ pressed }) => [styles.card, { backgroundColor: theme.card, opacity: pressed ? 0.8 : 1 }]}
        >
          <View style={styles.rowText}>
            <Feather name="file-text" size={20} color={theme.text} />
            <Text style={[styles.rowLabel, { color: theme.text }]}>Export logs as CSV</Text>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>ABOUT</Text>
        <View style={[styles.card, styles.column, { backgroundColor: theme.card }]}>
          <Text style={[styles.appName, { color: theme.text }]}>HabitIQ</Text>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>Track smarter, live better.</Text>
          <Text style={[styles.hint, { color: theme.textSecondary, marginTop: spacing.sm }]}>
            Version {Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
          <Text style={[styles.hint, { color: theme.textSecondary }]} numberOfLines={1}>
            Device: {getDeviceId().slice(0, 16)}…
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontFamily: font.extrabold, fontSize: 32, marginBottom: spacing.lg },
  sectionLabel: {
    fontFamily: font.semibold,
    fontSize: 12,
    letterSpacing: 1.2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  column: { flexDirection: 'column', alignItems: 'flex-start' },
  rowText: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowLabel: { fontFamily: font.semibold, fontSize: 16 },
  linkRow: { paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
  link: { fontFamily: font.medium, fontSize: 14 },
  hint: { fontFamily: font.regular, fontSize: 13, lineHeight: 19 },
  appName: { fontFamily: font.extrabold, fontSize: 20 },
});
