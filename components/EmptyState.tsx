import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../lib/theme';
import { font, radius, spacing } from '../lib/theme';

interface Props {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
}

export function EmptyState({ icon = 'check-circle', title, subtitle, ctaLabel, onPressCta }: Props) {
  const theme = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.wrap}>
      <View style={[styles.iconCircle, { backgroundColor: theme.accent + '14' }]}>
        <Feather name={icon} size={40} color={theme.accent} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      ) : null}
      {ctaLabel && onPressCta ? (
        <Pressable
          onPress={onPressCta}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name="plus" size={18} color="#FFFFFF" />
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md, flexGrow: 1 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontFamily: font.bold, fontSize: 20, textAlign: 'center' },
  subtitle: { fontFamily: font.regular, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  ctaText: { fontFamily: font.bold, fontSize: 16, color: '#FFFFFF' },
});
