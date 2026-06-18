import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useHabitStore } from '../../store/habitStore';
import { useTheme } from '../../lib/theme';
import { font, radius, spacing } from '../../lib/theme';
import { FeatherName } from '../../constants/icons';
import { completedSet, computeStats, weeklyTotals } from '../../lib/stats';
import { YearGrid } from '../../components/YearGrid';
import { BarChart } from '../../components/BarChart';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { CompleteButton } from '../../components/CompleteButton';

export default function HabitDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const toggleToday = useHabitStore((s) => s.toggleToday);
  const isCompletedToday = useHabitStore((s) => s.isCompletedToday);

  const [year, setYear] = useState(new Date().getFullYear());
  const habit = habits.find((h) => h.id === id);

  const data = useMemo(() => {
    if (!habit) return null;
    const hLogs = logs.filter((l) => l.habitId === habit.id);
    const set = completedSet(hLogs);
    const stats = computeStats(habit, hLogs);
    const weekly = weeklyTotals(set, 8);
    const yearDone = Array.from(set).filter((d) => d.startsWith(String(year))).length;
    return { set, stats, weekly, yearDone };
  }, [habit, logs, year]);

  if (!habit || !data) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top + 60 }]}>
        <Text style={[styles.notFound, { color: theme.textSecondary }]}>Habit not found.</Text>
      </View>
    );
  }

  const done = isCompletedToday(habit.id);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color={theme.accent} />
          <Text style={[styles.backText, { color: theme.accent }]}>Today</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {habit.name}
        </Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.springify().damping(18)}>
          <View style={[styles.hero, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
            <View style={[styles.iconWrap, { backgroundColor: habit.color + '1A' }]}>
              <Feather name={habit.icon as FeatherName} size={26} color={habit.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroName, { color: theme.text }]}>{habit.name}</Text>
              <Text style={[styles.heroMeta, { color: theme.textSecondary }]}>
                {data.stats.currentStreak} day streak · {data.stats.completionRate}% rate
              </Text>
            </View>
            <CompleteButton
              completed={done}
              color={habit.color}
              onToggle={() => toggleToday(habit.id)}
              size={44}
            />
          </View>
        </Animated.View>

        <View style={styles.statRow}>
          <Tile label="Current" value={data.stats.currentStreak} accent={habit.color} theme={theme} />
          <Tile label="Longest" value={data.stats.longestStreak} accent={habit.color} theme={theme} />
          <Tile label="Total" value={data.stats.totalCompletions} accent={habit.color} theme={theme} />
        </View>

        <View style={styles.yearRow}>
          <Pressable onPress={() => setYear((y) => y - 1)} hitSlop={10}>
            <Feather name="chevron-left" size={22} color={theme.textSecondary} />
          </Pressable>
          <Text style={[styles.yearLabel, { color: theme.text }]}>{year}</Text>
          <Pressable
            onPress={() => setYear((y) => Math.min(new Date().getFullYear(), y + 1))}
            hitSlop={10}
          >
            <Feather
              name="chevron-right"
              size={22}
              color={year >= new Date().getFullYear() ? theme.border : theme.textSecondary}
            />
          </Pressable>
        </View>
        <Text style={[styles.gridMeta, { color: theme.textSecondary }]}>
          {data.yearDone} days completed in {year}
        </Text>

        <YearGrid completed={data.set} year={year} accent={habit.color} />

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>RECENT WEEKS</Text>
        <BarChart data={data.weekly} accent={habit.color} />
      </ScrollView>
    </View>
  );
}

function Tile({
  label,
  value,
  accent,
  theme,
}: {
  label: string;
  value: number;
  accent: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.tile, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
      <AnimatedCounter value={value} style={[styles.tileValue, { color: accent }]} />
      <Text style={[styles.tileLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { fontFamily: font.medium, fontSize: 16, textAlign: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 70 },
  backText: { fontFamily: font.medium, fontSize: 16 },
  headerTitle: { fontFamily: font.bold, fontSize: 17, flex: 1, textAlign: 'center' },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  iconWrap: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  heroName: { fontFamily: font.extrabold, fontSize: 20 },
  heroMeta: { fontFamily: font.medium, fontSize: 13, marginTop: 2 },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  tile: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  tileValue: { fontFamily: font.extrabold, fontSize: 24, padding: 0, textAlign: 'center', minWidth: 40 },
  tileLabel: { fontFamily: font.medium, fontSize: 11, marginTop: 2 },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.xl,
  },
  yearLabel: { fontFamily: font.bold, fontSize: 18, minWidth: 60, textAlign: 'center' },
  gridMeta: { fontFamily: font.regular, fontSize: 13, textAlign: 'center', marginBottom: spacing.lg },
  sectionLabel: { fontFamily: font.semibold, fontSize: 12, letterSpacing: 1.2, marginTop: spacing.xl, marginBottom: spacing.md },
});
