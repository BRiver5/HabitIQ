import { useEffect } from 'react';
import { TextStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { TextInput } from 'react-native';

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface Props {
  value: number;
  style?: TextStyle | TextStyle[];
  suffix?: string;
  duration?: number;
}

/** Count-up number that animates on the UI thread when `value` changes. */
export function AnimatedCounter({ value, style, suffix = '', duration = 700 }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(value, { duration });
  }, [value, duration, progress]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(progress.value)}${suffix}`,
      defaultValue: `${Math.round(progress.value)}${suffix}`,
    } as any;
  });

  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      style={style}
      animatedProps={animatedProps}
      value={`${Math.round(value)}${suffix}`}
    />
  );
}
