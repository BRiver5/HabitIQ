import { Feather } from '@expo/vector-icons';

export type FeatherName = keyof typeof Feather.glyphMap;

/** Curated minimal Feather icon set for the habit icon picker. */
export const HABIT_ICONS: FeatherName[] = [
  'activity',
  'zap',
  'heart',
  'book-open',
  'book',
  'edit-3',
  'droplet',
  'coffee',
  'sun',
  'moon',
  'feather',
  'smile',
  'target',
  'award',
  'star',
  'music',
  'headphones',
  'camera',
  'code',
  'briefcase',
  'dollar-sign',
  'shopping-bag',
  'wind',
  'cloud',
  'anchor',
  'gift',
  'map-pin',
  'phone',
  'watch',
  'check-circle',
];

export const DEFAULT_ICON: FeatherName = 'check-circle';
