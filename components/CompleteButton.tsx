import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../lib/theme';

interface Props {
  completed: boolean;
  color: string;
  onToggle: () => void;
  size?: number;
}

const SPRING = { damping: 10, stiffness: 220, mass: 0.6 };

export function CompleteButton({ completed, color, onToggle, size = 36 }: Props) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const fill = useSharedValue(completed ? 1 : 0);

  useEffect(() => {
    fill.value = withTiming(completed ? 1 : 0, { duration: 220 });
  }, [completed, fill]);

  const handlePress = () => {
    Haptics.impactAsync(
      completed ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
    ).catch(() => {});
    scale.value = withSequence(
      withTiming(0.8, { duration: 90 }),
      withSpring(1.12, SPRING),
      withSpring(1, SPRING)
    );
    onToggle();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: fill.value > 0.5 ? color : 'transparent',
    borderColor: fill.value > 0.5 ? color : theme.border,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: fill.value,
    transform: [{ scale: fill.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      accessibilityLabel={completed ? 'Mark as not done' : 'Mark as done'}
      style={styles.hit}
    >
      <Animated.View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, borderWidth: 2 },
          containerStyle,
        ]}
      >
        <Animated.View style={checkStyle}>
          <Feather name="check" size={size * 0.55} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { padding: 4 },
  circle: { alignItems: 'center', justifyContent: 'center' },
});
