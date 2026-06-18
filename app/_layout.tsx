import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { darkTheme, lightTheme } from '../constants/colors';
import { ThemeContext } from '../lib/theme';
import { useHabitStore } from '../store/habitStore';
import { getSetting, setSetting } from '../db';

SplashScreen.preventAutoHideAsync().catch(() => {});

type SchemePref = 'light' | 'dark' | 'system';

export default function RootLayout() {
  const system = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const hydrate = useHabitStore((s) => s.hydrate);
  const hydrated = useHabitStore((s) => s.hydrated);
  const [scheme, setSchemeState] = useState<SchemePref>('system');

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (!hydrated) {
      hydrate();
      const saved = (getSetting('theme') as SchemePref) || 'system';
      setSchemeState(saved);
    }
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (fontsLoaded && hydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const onboarded = getSetting('onboarded') === '1';
    const inOnboarding = segments[0] === 'onboarding';
    if (!onboarded && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [hydrated, segments, router]);

  const setScheme = (s: SchemePref) => {
    setSchemeState(s);
    setSetting('theme', s);
  };

  if (!fontsLoaded || !hydrated) return null;

  const isDark = scheme === 'system' ? system === 'dark' : scheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, scheme, setScheme }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.bg },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="habit/[id]"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="onboarding"
              options={{ animation: 'fade' }}
            />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeContext.Provider>
  );
}
