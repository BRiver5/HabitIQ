import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';
import { font } from '../lib/theme';

interface Props {
  days: number;
  color?: string;
}

export function StreakBadge({ days, color }: Props) {
  const theme = useTheme();
  if (days <= 0) {
    return (
      <Text style={[styles.muted, { color: theme.textSecondary }]}>Not started</Text>
    );
  }
  return (
    <View style={styles.row}>
      <Feather name="zap" size={13} color={color ?? theme.flame} />
      <Text style={[styles.text, { color: theme.textSecondary }]}>
        {days} {days === 1 ? 'day' : 'days'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { fontFamily: font.medium, fontSize: 13 },
  muted: { fontFamily: font.regular, fontSize: 13 },
});
