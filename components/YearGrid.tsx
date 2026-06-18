import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MONTH_LABELS, daysInMonth, toDateKey } from '../lib/dates';
import { useTheme } from '../lib/theme';
import { font, spacing } from '../lib/theme';

interface Props {
  completed: Set<string>;
  year: number;
  accent: string;
}

const CELL = 11;
const GAP = 3;
const COLS = 7; // weeks laid out in columns of 7 days

/**
 * GitHub-style per-month grid. Each month renders its days as a small
 * column-major grid of rounded squares; completed days use the accent color.
 */
export function YearGrid({ completed, year, accent }: Props) {
  const theme = useTheme();

  const months = useMemo(() => {
    return MONTH_LABELS.map((label, m) => {
      const total = daysInMonth(year, m);
      const days: { key: string; done: boolean }[] = [];
      for (let d = 1; d <= total; d++) {
        const key = toDateKey(new Date(year, m, d));
        days.push({ key, done: completed.has(key) });
      }
      return { label, days };
    });
  }, [completed, year]);

  return (
    <View style={styles.wrap}>
      {months.map((month, mi) => {
        const rows = Math.ceil(month.days.length / COLS);
        const width = COLS * (CELL + GAP);
        const height = rows * (CELL + GAP);
        return (
          <Animated.View
            key={month.label}
            entering={FadeIn.delay(mi * 45).duration(350)}
            style={styles.month}
          >
            <Text style={[styles.monthLabel, { color: theme.text }]}>{month.label}</Text>
            <Svg width={width} height={height}>
              {month.days.map((day, di) => {
                const col = di % COLS;
                const row = Math.floor(di / COLS);
                return (
                  <Rect
                    key={day.key}
                    x={col * (CELL + GAP)}
                    y={row * (CELL + GAP)}
                    width={CELL}
                    height={CELL}
                    rx={2.5}
                    ry={2.5}
                    fill={day.done ? accent : theme.empty}
                  />
                );
              })}
            </Svg>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.xl },
  month: { width: '31%', alignItems: 'flex-start', gap: 6 },
  monthLabel: { fontFamily: font.bold, fontSize: 14 },
});
