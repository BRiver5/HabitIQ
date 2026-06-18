import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useHabitStore } from '../../store/habitStore';
import { useTheme } from '../../lib/theme';
import { font, spacing } from '../../lib/theme';
import { greeting, longDate } from '../../lib/dates';
import { completedSet, currentStreak } from '../../lib/stats';
import { HabitCard } from '../../components/HabitCard';
import { EmptyState } from '../../components/EmptyState';
import { FAB } from '../../components/FAB';
import { AddHabitSheet } from '../../components/AddHabitSheet';

export default function TodayScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const isCompletedToday = useHabitStore((s) => s.isCompletedToday);
  const toggleToday = useHabitStore((s) => s.toggleToday);
  const addHabit = useHabitStore((s) => s.addHabit);
  const [sheetOpen, setSheetOpen] = useState(false);

  const active = useMemo(() => habits.filter((h) => !h.archivedAt), [habits]);

  const streaks = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of active) {
      const set = completedSet(logs.filter((l) => l.habitId === h.id));
      map[h.id] = currentStreak(set);
    }
    return map;
  }, [active, logs]);

  const doneCount = active.filter((h) => isCompletedToday(h.id)).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.xl,
          paddingBottom: insets.bottom + 120,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={[styles.greeting, { color: theme.text }]}>{greeting()}</Text>
          <Text style={[styles.date, { color: theme.textSecondary }]}>{longDate()}</Text>
        </Animated.View>

        {active.length > 0 && (
          <Text style={[styles.progress, { color: theme.textSecondary }]}>
            {doneCount === active.length && active.length > 0
              ? 'All done. Nice work!'
              : `${doneCount} of ${active.length} completed today`}
          </Text>
        )}

        {active.length === 0 ? (
          <EmptyState
            icon="check-circle"
            title="Start your first habit"
            subtitle="Track smarter, live better. Add a habit and tap to complete it each day."
            ctaLabel="Add your first habit"
            onPressCta={() => setSheetOpen(true)}
          />
        ) : (
          <View style={styles.list}>
            {active.map((habit, i) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                index={i}
                completed={isCompletedToday(habit.id)}
                streak={streaks[habit.id] ?? 0}
                onToggle={() => toggleToday(habit.id)}
                onPress={() => router.push(`/habit/${habit.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {active.length > 0 && <FAB onPress={() => setSheetOpen(true)} bottom={insets.bottom + 16} />}

      <AddHabitSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={async (input) => {
          await addHabit(input);
          setSheetOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  greeting: { fontFamily: font.extrabold, fontSize: 32 },
  date: { fontFamily: font.regular, fontSize: 16, marginTop: 2 },
  progress: { fontFamily: font.medium, fontSize: 14, marginTop: spacing.md, marginBottom: spacing.sm },
  list: { marginTop: spacing.lg },
});
