import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Swipeable } from 'react-native-gesture-handler';
import { useHabitStore } from '../../store/habitStore';
import { useTheme } from '../../lib/theme';
import { font, radius, spacing } from '../../lib/theme';
import { FeatherName } from '../../constants/icons';
import { Habit } from '../../lib/types';
import { AddHabitSheet } from '../../components/AddHabitSheet';
import { FAB } from '../../components/FAB';
import { EmptyState } from '../../components/EmptyState';

const FREQ_LABEL: Record<Habit['targetFrequency'], string> = {
  daily: 'Every day',
  weekdays: 'Specific days',
  weekly: 'Weekly goal',
};

export default function HabitsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const habits = useHabitStore((s) => s.habits);
  const reorder = useHabitStore((s) => s.reorder);
  const addHabit = useHabitStore((s) => s.addHabit);
  const editHabit = useHabitStore((s) => s.editHabit);
  const archiveHabit = useHabitStore((s) => s.archiveHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);

  const active = useMemo(() => habits.filter((h) => !h.archivedAt), [habits]);
  const archived = useMemo(() => habits.filter((h) => h.archivedAt), [habits]);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };
  const openEdit = (h: Habit) => {
    setEditing(h);
    setSheetOpen(true);
  };

  const confirmDelete = (h: Habit) => {
    Alert.alert('Delete habit', `Delete "${h.name}" and all its history? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeHabit(h.id) },
    ]);
  };

  const renderRightActions = (h: Habit) => (
    <View style={styles.actions}>
      <Pressable
        onPress={() => archiveHabit(h.id, true)}
        style={[styles.action, { backgroundColor: theme.textSecondary }]}
      >
        <Feather name="archive" size={20} color="#FFFFFF" />
        <Text style={styles.actionText}>Archive</Text>
      </Pressable>
      <Pressable
        onPress={() => confirmDelete(h)}
        style={[styles.action, { backgroundColor: '#E5484D' }]}
      >
        <Feather name="trash-2" size={20} color="#FFFFFF" />
        <Text style={styles.actionText}>Delete</Text>
      </Pressable>
    </View>
  );

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Habit>) => (
    <ScaleDecorator>
      <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
        <Pressable
          onPress={() => openEdit(item)}
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.card,
            { backgroundColor: theme.card, shadowColor: theme.shadow, opacity: isActive ? 0.9 : 1 },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: item.color + '1A' }]}>
            <Feather name={item.icon as FeatherName} size={20} color={item.color} />
          </View>
          <View style={styles.body}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              {FREQ_LABEL[item.targetFrequency]}
              {item.reminderTime ? ` · ${item.reminderTime}` : ''}
            </Text>
          </View>
          <Pressable onPressIn={drag} hitSlop={12} style={styles.dragHandle}>
            <Feather name="menu" size={20} color={theme.textSecondary} />
          </Pressable>
        </Pressable>
      </Swipeable>
    </ScaleDecorator>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <DraggableFlatList
        data={active}
        keyExtractor={(h) => h.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => reorder(data.map((h) => h.id))}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.xl,
          paddingBottom: insets.bottom + 120,
        }}
        ListHeaderComponent={
          <Text style={[styles.title, { color: theme.text }]}>Habits</Text>
        }
        ListEmptyComponent={
          <EmptyState
            icon="list"
            title="No habits yet"
            subtitle="Add habits to track. Long-press and drag to reorder, swipe to archive or delete."
            ctaLabel="Add a habit"
            onPressCta={openAdd}
          />
        }
        ListFooterComponent={
          archived.length > 0 ? (
            <View style={{ marginTop: spacing.xl }}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>ARCHIVED</Text>
              {archived.map((h) => (
                <View
                  key={h.id}
                  style={[styles.card, { backgroundColor: theme.card, opacity: 0.7 }]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: h.color + '1A' }]}>
                    <Feather name={h.icon as FeatherName} size={20} color={h.color} />
                  </View>
                  <View style={styles.body}>
                    <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                      {h.name}
                    </Text>
                    <Text style={[styles.meta, { color: theme.textSecondary }]}>Archived</Text>
                  </View>
                  <Pressable onPress={() => archiveHabit(h.id, false)} hitSlop={10} style={styles.dragHandle}>
                    <Feather name="rotate-ccw" size={18} color={theme.accent} />
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(h)} hitSlop={10} style={styles.dragHandle}>
                    <Feather name="trash-2" size={18} color="#E5484D" />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null
        }
      />

      <FAB onPress={openAdd} bottom={insets.bottom + 16} />

      <AddHabitSheet
        visible={sheetOpen}
        editing={editing}
        onClose={() => setSheetOpen(false)}
        onSubmit={async (input) => {
          if (editing) await editHabit(editing.id, input);
          else await addHabit(input);
          setSheetOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontFamily: font.extrabold, fontSize: 32, marginBottom: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  iconWrap: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 3 },
  name: { fontFamily: font.bold, fontSize: 17 },
  meta: { fontFamily: font.regular, fontSize: 13 },
  dragHandle: { padding: 4 },
  actions: { flexDirection: 'row', marginBottom: spacing.md },
  action: {
    width: 78,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionText: { fontFamily: font.medium, fontSize: 11, color: '#FFFFFF' },
  sectionLabel: { fontFamily: font.semibold, fontSize: 12, letterSpacing: 1.2, marginBottom: spacing.md },
});
