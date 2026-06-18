import { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../lib/theme';
import { font, radius, spacing } from '../lib/theme';
import { setSetting } from '../db';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'check-circle' as const,
    title: 'Track smarter,\nlive better',
    body: 'Build habits that stick. Add your own and tap once a day to mark them done.',
  },
  {
    icon: 'zap' as const,
    title: 'Keep your streaks',
    body: 'Every completed day grows your streak. See how consistent you really are.',
  },
  {
    icon: 'bar-chart-2' as const,
    title: 'Think long-term',
    body: 'A full-year grid and simple charts reveal your patterns over time.',
  },
];

export default function Onboarding() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const finish = () => {
    setSetting('onboarded', '1');
    router.replace('/(tabs)');
  };

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      <Pressable onPress={finish} style={styles.skip} hitSlop={10}>
        <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip</Text>
      </Pressable>

      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
      >
        {SLIDES.map((s, i) => (
          <Slide key={i} slide={s} index={i} scrollX={scrollX} theme={theme} />
        ))}
      </Animated.ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === index ? theme.accent : theme.border,
                  width: i === index ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Pressable onPress={finish} style={[styles.cta, { backgroundColor: theme.accent }]}>
          <Text style={styles.ctaText}>{index === SLIDES.length - 1 ? 'Get started' : 'Next'}</Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

function Slide({
  slide,
  index,
  scrollX,
  theme,
}: {
  slide: (typeof SLIDES)[number];
  index: number;
  scrollX: SharedValue<number>;
  theme: ReturnType<typeof useTheme>;
}) {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = interpolate(scrollX.value, input, [0.6, 1, 0.6]);
    const opacity = interpolate(scrollX.value, input, [0.3, 1, 0.3]);
    return { transform: [{ scale }], opacity };
  });

  return (
    <View style={[styles.slide, { width }]}>
      <Animated.View style={[styles.iconCircle, { backgroundColor: theme.accent + '14' }, style]}>
        <Feather name={slide.icon} size={64} color={theme.accent} />
      </Animated.View>
      <Text style={[styles.title, { color: theme.text }]}>{slide.title}</Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>{slide.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: { alignSelf: 'flex-end', padding: spacing.lg },
  skipText: { fontFamily: font.medium, fontSize: 15 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl, gap: spacing.lg },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: { fontFamily: font.extrabold, fontSize: 30, textAlign: 'center', lineHeight: 36 },
  body: { fontFamily: font.regular, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  footer: { paddingHorizontal: spacing.xl, gap: spacing.xl },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.pill,
  },
  ctaText: { fontFamily: font.bold, fontSize: 17, color: '#FFFFFF' },
});
