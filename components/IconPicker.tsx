import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { HABIT_ICONS, FeatherName } from '../constants/icons';
import { useTheme } from '../lib/theme';
import { radius } from '../lib/theme';

interface Props {
  value: FeatherName;
  color: string;
  onChange: (icon: FeatherName) => void;
}

export function IconPicker({ value, color, onChange }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.grid}>
      {HABIT_ICONS.map((icon) => {
        const selected = icon === value;
        return (
          <Pressable
            key={icon}
            onPress={() => onChange(icon)}
            accessibilityRole="button"
            accessibilityLabel={`Icon ${icon}`}
            accessibilityState={{ selected }}
            style={[
              styles.cell,
              {
                backgroundColor: selected ? color : theme.cardAlt,
              },
            ]}
          >
            <Feather name={icon} size={20} color={selected ? '#FFFFFF' : theme.text} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
