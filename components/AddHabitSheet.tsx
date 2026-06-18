import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Habit, TargetFrequency } from '../lib/types';
import { FeatherName, DEFAULT_ICON } from '../constants/icons';
import { HABIT_COLORS } from '../constants/colors';
import { WEEKDAY_SHORT } from '../lib/dates';
import { useTheme } from '../lib/theme';
import { font, radius, spacing } from '../lib/theme';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';
import { NewHabitInput } from '../store/habitStore';

interface Props {
  visible: boolean;
  editing?: Habit | null;
  onClose: () => void;
  onSubmit: (input: NewHabitInput) => void;
}

const FREQS: { key: TargetFrequency; label: string }[] = [
  { key: 'daily', label: 'Every day' },
  { key: 'weekdays', label: 'Specific days' },
  { key: 'weekly', label: 'X times / week' },
];

const REMINDER_PRESETS = ['07:00', '09:00', '12:00', '18:00', '21:00'];

export function AddHabitSheet({ visible, editing, onClose, onSubmit }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<FeatherName>(DEFAULT_ICON);
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [freq, setFreq] = useState<TargetFrequency>('daily');
  const [weekdays, setWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [reminder, setReminder] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setStep(0);
      setName(editing?.name ?? '');
      setIcon((editing?.icon as FeatherName) ?? DEFAULT_ICON);
      setColor(editing?.color ?? HABIT_COLORS[0]);
      setFreq(editing?.targetFrequency ?? 'daily');
      setWeekdays(editing?.weekdays ?? [0, 1, 2, 3, 4, 5, 6]);
      setWeeklyTarget(editing?.weeklyTarget ?? 3);
      setReminder(editing?.reminderTime ?? null);
    }
  }, [visible, editing]);

  const canNext = step === 0 ? name.trim().length > 0 : true;

  const toggleWeekday = (d: number) =>
    setWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );

  const submit = () => {
    onSubmit({
      name: name.trim(),
      icon,
      color,
      targetFrequency: freq,
      weeklyTarget,
      weekdays: freq === 'weekdays' ? weekdays : [0, 1, 2, 3, 4, 5, 6],
      reminderTime: reminder,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.center}
        pointerEvents="box-none"
      >
        <View
          style={[styles.sheet, { backgroundColor: theme.card, paddingBottom: insets.bottom + spacing.lg }]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {editing ? 'Edit habit' : 'New habit'}
            </Text>
            <View style={styles.dots}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === step ? theme.accent : theme.border },
                  ]}
                />
              ))}
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: spacing.md }}
            keyboardShouldPersistTaps="handled"
          >
            {step === 0 && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>NAME</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Read 20 minutes"
                  placeholderTextColor={theme.textSecondary}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={() => canNext && setStep(1)}
                  style={[
                    styles.input,
                    { color: theme.text, backgroundColor: theme.cardAlt },
                  ]}
                />
              </View>
            )}

            {step === 1 && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>COLOR</Text>
                <ColorPicker value={color} onChange={setColor} />
                <Text style={[styles.label, { color: theme.textSecondary, marginTop: spacing.lg }]}>
                  ICON
                </Text>
                <IconPicker value={icon} color={color} onChange={setIcon} />
              </View>
            )}

            {step === 2 && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>FREQUENCY</Text>
                {FREQS.map((f) => (
                  <Pressable
                    key={f.key}
                    onPress={() => setFreq(f.key)}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: freq === f.key ? theme.accent + '14' : theme.cardAlt,
                        borderColor: freq === f.key ? theme.accent : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[styles.optionText, { color: theme.text }]}>{f.label}</Text>
                    {freq === f.key ? (
                      <Feather name="check" size={18} color={theme.accent} />
                    ) : null}
                  </Pressable>
                ))}

                {freq === 'weekdays' && (
                  <View style={styles.weekdays}>
                    {WEEKDAY_SHORT.map((d, i) => (
                      <Pressable
                        key={i}
                        onPress={() => toggleWeekday(i)}
                        style={[
                          styles.weekdayChip,
                          {
                            backgroundColor: weekdays.includes(i) ? color : theme.cardAlt,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontFamily: font.semibold,
                            color: weekdays.includes(i) ? '#FFFFFF' : theme.textSecondary,
                          }}
                        >
                          {d}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {freq === 'weekly' && (
                  <View style={styles.stepper}>
                    <Pressable
                      onPress={() => setWeeklyTarget((v) => Math.max(1, v - 1))}
                      style={[styles.stepBtn, { backgroundColor: theme.cardAlt }]}
                    >
                      <Feather name="minus" size={18} color={theme.text} />
                    </Pressable>
                    <Text style={[styles.stepValue, { color: theme.text }]}>
                      {weeklyTarget}x / week
                    </Text>
                    <Pressable
                      onPress={() => setWeeklyTarget((v) => Math.min(7, v + 1))}
                      style={[styles.stepBtn, { backgroundColor: theme.cardAlt }]}
                    >
                      <Feather name="plus" size={18} color={theme.text} />
                    </Pressable>
                  </View>
                )}

                <Text style={[styles.label, { color: theme.textSecondary, marginTop: spacing.lg }]}>
                  REMINDER
                </Text>
                <View style={styles.reminderRow}>
                  <Pressable
                    onPress={() => setReminder(null)}
                    style={[
                      styles.reminderChip,
                      {
                        backgroundColor: reminder === null ? theme.accent : theme.cardAlt,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: font.medium,
                        color: reminder === null ? '#FFFFFF' : theme.textSecondary,
                      }}
                    >
                      Off
                    </Text>
                  </Pressable>
                  {REMINDER_PRESETS.map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setReminder(t)}
                      style={[
                        styles.reminderChip,
                        { backgroundColor: reminder === t ? theme.accent : theme.cardAlt },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: font.medium,
                          color: reminder === t ? '#FFFFFF' : theme.textSecondary,
                        }}
                      >
                        {t}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {step > 0 ? (
              <Pressable
                onPress={() => setStep((s) => s - 1)}
                style={[styles.secondaryBtn, { borderColor: theme.border }]}
              >
                <Text style={[styles.secondaryText, { color: theme.text }]}>Back</Text>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            {step < 2 ? (
              <Pressable
                disabled={!canNext}
                onPress={() => setStep((s) => s + 1)}
                style={[styles.primaryBtn, { backgroundColor: theme.accent, opacity: canNext ? 1 : 0.4 }]}
              >
                <Text style={styles.primaryText}>Next</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={submit}
                style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
              >
                <Text style={styles.primaryText}>{editing ? 'Save' : 'Create'}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  center: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#C9CDD6',
    marginBottom: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: font.extrabold, fontSize: 24 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  scroll: { marginTop: spacing.lg },
  section: { gap: spacing.sm },
  label: { fontFamily: font.semibold, fontSize: 12, letterSpacing: 1.2, marginBottom: 4 },
  input: {
    fontFamily: font.medium,
    fontSize: 17,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
  },
  optionText: { fontFamily: font.medium, fontSize: 16 },
  weekdays: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  weekdayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.md },
  stepBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontFamily: font.bold, fontSize: 18, minWidth: 110, textAlign: 'center' },
  reminderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reminderChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill },
  footer: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  secondaryBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  secondaryText: { fontFamily: font.semibold, fontSize: 16 },
  primaryBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.pill, alignItems: 'center' },
  primaryText: { fontFamily: font.bold, fontSize: 16, color: '#FFFFFF' },
});
