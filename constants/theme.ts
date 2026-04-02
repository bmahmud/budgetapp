/**
 * Fringe “Vibrant” theme: teal primary actions, purple accents, lavender surfaces.
 */

import { Platform } from 'react-native';

export const FringePalette = {
  teal: '#14B8A6',
  tealDark: '#0D9488',
  purple: '#6D28D9',
  purpleLight: '#8B5CF6',
  background: '#F4F2FF',
  surface: '#FFFFFF',
  text: '#1E1B4B',
  income: '#10B981',
  expense: '#F43F5E',
  tipBanner: '#0D9488',
} as const;

export const Colors = {
  light: {
    text: FringePalette.text,
    background: FringePalette.background,
    tint: FringePalette.purple,
    primary: FringePalette.teal,
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: FringePalette.purple,
    card: FringePalette.surface,
    border: '#E8E2F4',
    mutedText: '#64748B',
  },
  dark: {
    text: '#F8FAFC',
    background: '#1A1528',
    tint: '#A78BFA',
    primary: '#2DD4BF',
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#A78BFA',
    card: '#262036',
    border: '#3D3558',
    mutedText: '#A8A29E',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
