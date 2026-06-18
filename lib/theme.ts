import { createContext, useContext } from 'react';
import { darkTheme, lightTheme, Theme } from '../constants/colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const ThemeContext = createContext<{
  theme: Theme;
  scheme: 'light' | 'dark' | 'system';
  setScheme: (s: 'light' | 'dark' | 'system') => void;
}>({
  theme: lightTheme,
  scheme: 'system',
  setScheme: () => {},
});

export const useTheme = () => useContext(ThemeContext).theme;
export const useThemeControls = () => useContext(ThemeContext);

export { lightTheme, darkTheme };
export type { Theme };
