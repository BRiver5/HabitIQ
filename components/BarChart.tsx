import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../lib/theme';
import { font, spacing } from '../lib/theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface Datum {
  label: string;
  value: number;
}

interface Props {
  data: Datum[];
  accent: string;
  height?: number;
}

function Bar({
  x,
  width,
  fullHeight,
  value,
  max,
  accent,
  index,
}: {
  x: number;
  width: number;
  fullHeight: number;
  value: number;
  max: number;
  accent: string;
  index: number;
}) {
  const progress = useSharedValue(0);
  const target = max > 0 ? (value / max) * fullHeight : 0;

  useEffect(() => {
    progress.value = withDelay(index * 50, withTiming(target, { duration: 500 }));
  }, [target, index, progress]);

  const animatedProps = useAnimatedProps(() => ({
    height: Math.max(2, progress.value),
    y: fullHeight - progress.value,
  }));

  return (
    <AnimatedRect
      x={x}
      width={width}
      rx={4}
      ry={4}
      fill={value > 0 ? accent : accent + '33'}
      animatedProps={animatedProps}
    />
  );
}

export function BarChart({ data, accent, height = 160 }: Props) {
  const theme = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  const slot = 100 / data.length;
  const barWidth = slot * 0.55;

  return (
    <View>
      <Svg width="100%" height={height}>
        {data.map((d, i) => {
          const x = `${i * slot + (slot - barWidth) / 2}%` as unknown as number;
          return (
            <Bar
              key={i}
              x={x}
              width={`${barWidth}%` as unknown as number}
              fullHeight={height}
              value={d.value}
              max={max}
              accent={accent}
              index={i}
            />
          );
        })}
      </Svg>
      <View style={styles.labels}>
        {data.map((d, i) => (
          <Text key={i} style={[styles.label, { color: theme.textSecondary }]} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', marginTop: spacing.sm },
  label: { flex: 1, textAlign: 'center', fontFamily: font.regular, fontSize: 10 },
});
