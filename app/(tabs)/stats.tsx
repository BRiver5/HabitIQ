import { useMemo, useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useHabitStore } from '../../store/habitStore';
import { useTheme } from '../../lib/theme';
import { font, radius, spacing } from '../../lib/theme';
import { FeatherName } from '../../constants/icons';
import {
  completedSet,
  computeStats,
  weeklyTotals,
  monthlyTotals,
} from '../../lib/stats';
import { MONTH_LABELS } from '../../lib/dates';
import { YearGrid } from '../../components/YearGrid';
import { BarChart } from '../../components/BarChart';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { EmptyState } from '../../components/EmptyState';

type ViewMode = 'year' | 'trend';

export default function StatsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const active = useMemo(() => habits.filter((h) => !h.archivedAt), [habits]);

  const [selectedId, setSelectedId] = useState<string | null>(active[0]?.id ?? null);
  const [mode, setMode] = useState<ViewMode>('year');
  const year = new Date().getFullYear();

  useEffect(() => {
    if (!selectedId && active.length > 0) setSelectedId(active[0].id);
    if (selectedId && !active.some((h) => h.id === selectedId)) {
      setSelectedId(active[0]?.id ?? null);
    }
  }, [active, selectedId]);

  const habit = active.find((h) => h.id === selectedId) ?? null;

  const data = useMemo(() => {
    if (!habit) return null;
    const hLogs = logs.filter((l) => l.habitId === habit.id);
    const set = completedSet(hLogs);
    const stats = computeStats(habit, hLogs);
    const weekly = weeklyTotals(set, 8);
    const monthly = monthlyTotals(set, year).map((v, i) => ({
      label: MONTH_LABELS[i][0],
      value: v,
    }));
    const yearDone = Array.from(set).filter((d) => d.startsWith(String(year))).length;
    const daysElapsed = Math.min(
      365,
      Math.floor((Date.now() - new Date(year, 0, 1).getTime()) / 86_400_000) + 1
    );
    const yearPct = Math.round((yearDone / Math.max(1, daysElapsed)) * 100);
    return { set, stats, weekly, monthly, yearDone, daysElapsed, yearPct };
  }, [habit, logs, year]);

  if (active.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: theme.text, paddingHorizontal: spacing.xl }]}>Stats</Text>
        <EmptyState
          icon="bar-chart-2"
          title="No data yet"
          subtitle="Create a habit and start completing it to see your progress here."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text, paddingHorizontal: spacing.xl }]}>Stats</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {active.map((h) => {
            const sel = h.id === selectedId;
            return (
              <Pressable
                key={h.id}
                onPress={() => setSelectedId(h.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: sel ? h.color : theme.card,
                    borderColor: sel ? h.color : theme.border,
                  },
                ]}
              >
                <Feather
                  name={h.icon as FeatherName}
                  size={14}
                  color={sel ? '#FFFFFF' : h.color}
                />
                <Text
                  style={[
                    styles.chipText,
                    { color: sel ? '#FFFFFF' : theme.text },
                  ]}
                  numberOfLines={1}
                >
                  {h.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {habit && data && (
          <Animated.View
            key={habit.id}
            entering={FadeIn.duration(300)}
            style={{ paddingHorizontal: spacing.xl }}
          >
            <View style={[styles.headerCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
              <View style={styles.headerTop}>
                <Text style={[styles.habitName, { color: theme.text }]}>{habit.name}</Text>
                <Text style={[styles.year, { color: habit.color }]}>{year}</Text>
              </View>
              <Text style={[styles.headerMeta, { color: theme.textSecondary }]}>
                {data.yearDone} of {data.daysElapsed} days · {data.yearPct}%
              </Text>
              <Text style={[styles.headerMeta, { color: theme.textSecondary }]}>
                {data.stats.longestStreak} days: longest streak
              </Text>
            </View>

            <View style={styles.toggleRow}>
              {(['year', 'trend'] as ViewMode[]).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={[
                    styles.toggle,
                    { backgroundColor: mode === m ? theme.accent : theme.card, borderColor: theme.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      { color: mode === m ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {m === 'year' ? 'Year view' : 'Trend view'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {mode === 'year' ? (
              <YearGrid completed={data.set} year={year} accent={habit.color} />
            ) : (
              <View style={{ gap: spacing.xl }}>
                <View>
                  <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                    COMPLETIONS PER WEEK
                  </Text>
                  <BarChart data={data.weekly} accent={habit.color} />
                </View>
                <View>
                  <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                    COMPLETIONS PER MONTH
                  </Text>
                  <BarChart data={data.monthly} accent={habit.color} />
                </View>
              </View>
            )}

            <View style={styles.statRow}>
              <StatTile label="Current" value={data.stats.currentStreak} suffix="" accent={habit.color} theme={theme} />
              <StatTile label="Longest" value={data.stats.longestStreak} suffix="" accent={habit.color} theme={theme} />
              <StatTile label="Total" value={data.stats.totalCompletions} suffix="" accent={habit.color} theme={theme} />
              <StatTile label="Rate" value={data.stats.completionRate} suffix="%" accent={habit.color} theme={theme} />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function StatTile({
  label,
  value,
  suffix,
  accent,
  theme,
}: {
  label: string;
  value: number;
  suffix: string;
  accent: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.tile, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
      <AnimatedCounter
        value={value}
        suffix={suffix}
        style={[styles.tileValue, { color: accent }]}
      />
      <Text style={[styles.tileLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontFamily: font.extrabold, fontSize: 32, marginBottom: spacing.md },
  chips: { paddingHorizontal: spacing.xl, gap: 10, paddingBottom: spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    maxWidth: 180,
  },
  chipText: { fontFamily: font.semibold, fontSize: 14 },
  headerCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  headerTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  habitName: { fontFamily: font.extrabold, fontSize: 22 },
  year: { fontFamily: font.bold, fontSize: 18 },
  headerMeta: { fontFamily: font.medium, fontSize: 13, marginTop: 4 },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  toggle: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1.5, alignItems: 'center' },
  toggleText: { fontFamily: font.semibold, fontSize: 14 },
  sectionLabel: { fontFamily: font.semibold, fontSize: 12, letterSpacing: 1.2, marginBottom: spacing.md },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
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
  tileValue: { fontFamily: font.extrabold, fontSize: 22, padding: 0, textAlign: 'center', minWidth: 40 },
  tileLabel: { fontFamily: font.medium, fontSize: 11, marginTop: 2 },
});
