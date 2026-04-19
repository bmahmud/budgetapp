/**
 * Fringe “Vibrant” theme: teal primary actions, purple accents, lavender surfaces.
 */

import { Platform } from 'react-native';

export const FringePalette = {
  teal: '#9FE1CB',
  tealDark: '#7ECFB3',
  purple: '#534AB7',
  purpleLight: '#6A61C8',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#26215C',
  income: '#10B981',
  expense: '#F43F5E',
  tipBanner: '#26215C',
} as const;

export const Colors = {
  light: {
    text: FringePalette.text,
    background: FringePalette.background,
    tint: FringePalette.purple,
    primary: FringePalette.purple,
    icon: '#8B88B7',
    tabIconDefault: '#9A97C2',
    tabIconSelected: FringePalette.purple,
    card: FringePalette.surface,
    border: '#E6E3F5',
    mutedText: '#6D6996',
  },
  dark: {
    text: FringePalette.text,
    background: '#FFFFFF',
    tint: FringePalette.purple,
    primary: FringePalette.purple,
    icon: '#8B88B7',
    tabIconDefault: '#9A97C2',
    tabIconSelected: FringePalette.purple,
    card: '#FFFFFF',
    border: '#E6E3F5',
    mutedText: '#6D6996',
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
