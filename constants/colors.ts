/**
 * HabitIQ unified palette. Light + dark variants share the cobalt accent.
 */

export const ACCENT = '#2F5DFF';
export const ACCENT_PRESSED = '#2348D6';

/** 5-step heatmap intensity scale (index 0 = no data / empty). */
export const HEATMAP_LIGHT = ['#EEF0F4', '#C7D4FF', '#94A9FF', '#5C7BFF', '#2F5DFF'];
export const HEATMAP_DARK = ['#23262F', '#26346B', '#2C46A8', '#2F5DFF', '#6B8BFF'];

/** Optional pastel mood/quality tag colors. */
export const MOOD_COLORS = {
  veryGood: '#C9B6F2',
  good: '#A9D4F5',
  average: '#A8E6C1',
  ok: '#F5E6A0',
  stressed: '#F5C6A5',
  terrible: '#F4A6C6',
} as const;

/** Curated habit color choices for the color picker (distinct hues). */
export const HABIT_COLORS = [
  '#2F5DFF', // blue (accent)
  '#7C4DFF', // purple
  '#0EA5E9', // sky
  '#00B8A9', // teal
  '#22C55E', // green
  '#FACC15', // yellow
  '#FF9F1C', // orange
  '#FF6B6B', // coral
  '#E84393', // pink
  '#64748B', // slate
];

export interface Theme {
  dark: boolean;
  bg: string;
  card: string;
  cardAlt: string;
  border: string;
  accent: string;
  accentPressed: string;
  text: string;
  textSecondary: string;
  empty: string;
  flame: string;
  heatmap: string[];
  shadow: string;
}

export const lightTheme: Theme = {
  dark: false,
  bg: '#F7F8FA',
  card: '#FFFFFF',
  cardAlt: '#F0F2F7',
  border: '#ECEEF3',
  accent: ACCENT,
  accentPressed: ACCENT_PRESSED,
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  empty: '#EEF0F4',
  flame: '#FF7A1A',
  heatmap: HEATMAP_LIGHT,
  shadow: '#1A1A2E',
};

export const darkTheme: Theme = {
  dark: true,
  bg: '#0E0F14',
  card: '#1A1C24',
  cardAlt: '#23262F',
  border: '#2A2D38',
  accent: ACCENT,
  accentPressed: '#5C7BFF',
  text: '#F2F4F8',
  textSecondary: '#9AA0AD',
  empty: '#23262F',
  flame: '#FF8A3D',
  heatmap: HEATMAP_DARK,
  shadow: '#000000',
};
