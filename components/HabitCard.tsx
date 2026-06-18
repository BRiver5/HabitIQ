import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Habit } from '../lib/types';
import { FeatherName } from '../constants/icons';
import { useTheme } from '../lib/theme';
import { font, radius, spacing } from '../lib/theme';
import { CompleteButton } from './CompleteButton';
import { StreakBadge } from './StreakBadge';

interface Props {
  habit: Habit;
  completed: boolean;
  streak: number;
  index: number;
  onToggle: () => void;
  onPress: () => void;
}

function HabitCardBase({ habit, completed, streak, index, onToggle, onPress }: Props) {
  const theme = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(16)}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${habit.name}, ${streak} day streak`}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.card,
            shadowColor: theme.shadow,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: habit.color + '1A' }]}>
          <Feather name={habit.icon as FeatherName} size={20} color={habit.color} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {habit.name}
          </Text>
          <StreakBadge days={streak} />
        </View>
        <CompleteButton completed={completed} color={habit.color} onToggle={onToggle} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 3 },
  name: { fontFamily: font.bold, fontSize: 17 },
});

export const HabitCard = memo(HabitCardBase);
