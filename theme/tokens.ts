// src/theme/tokens.ts — Fringe design tokens (light + dark)
// Ported from theme.css. No CSS variables in RN — these are plain JS objects
// surfaced through ThemeContext.

export type CategoryKey =
  | 'cat-housing' | 'cat-food' | 'cat-transit' | 'cat-bills'
  | 'cat-health' | 'cat-edu' | 'cat-fun' | 'cat-shop'
  | 'cat-kids' | 'cat-savings' | 'cat-salary' | 'cat-other';

export type CategoryPair = { fg: string; bg: string };

export type Palette = {
  bgBase: string;
  bgElev: string;
  bgSubtle: string;
  bgOverlay: string;
  bgGlass: string;

  ink1: string;
  ink2: string;
  ink3: string;
  inkInv: string;

  line: string;
  lineStrong: string;

  accent: string;
  accentDeep: string;
  accentSoft: string;
  accentOn: string;

  positive: string;
  positiveSoft: string;
  negative: string;
  negativeSoft: string;
  warn: string;
  warnSoft: string;

  categories: Record<CategoryKey, CategoryPair>;
};

export const lightPalette: Palette = {
  bgBase: '#F8F7F4',
  bgElev: '#FFFFFF',
  bgSubtle: '#EDEAE2',
  bgOverlay: 'rgba(14,18,46,0.45)',
  bgGlass: 'rgba(255,255,255,0.72)',

  ink1: '#0E122E',
  ink2: '#4A4F6E',
  ink3: '#8A8FA8',
  inkInv: '#FFFFFF',

  line: 'rgba(14,18,46,0.07)',
  lineStrong: 'rgba(14,18,46,0.14)',

  accent: '#5546E0',
  accentDeep: '#3F2FC9',
  accentSoft: '#ECE9FF',
  accentOn: '#FFFFFF',

  positive: '#197B5A',
  positiveSoft: '#DEF1E5',
  negative: '#B0413F',
  negativeSoft: '#F5E1DE',
  warn: '#B7791F',
  warnSoft: '#F8ECCF',

  categories: {
    'cat-housing':  { fg: '#5546E0', bg: '#ECE9FF' },
    'cat-food':     { fg: '#C2622C', bg: '#F8E6D5' },
    'cat-transit':  { fg: '#2F6FB0', bg: '#DCE9F4' },
    'cat-bills':    { fg: '#B0413F', bg: '#F5E1DE' },
    'cat-health':   { fg: '#0E7C7B', bg: '#D2ECEB' },
    'cat-edu':      { fg: '#7A4FC2', bg: '#ECE3F6' },
    'cat-fun':      { fg: '#B73E72', bg: '#F4DCE5' },
    'cat-shop':     { fg: '#C13A6B', bg: '#F4DCE4' },
    'cat-kids':     { fg: '#D4923C', bg: '#FAEBD3' },
    'cat-savings':  { fg: '#197B5A', bg: '#DEF1E5' },
    'cat-salary':   { fg: '#197B5A', bg: '#DEF1E5' },
    'cat-other':    { fg: '#6F7390', bg: '#E6E6EE' },
  },
};

export const darkPalette: Palette = {
  bgBase: '#07091B',
  bgElev: '#1A1F3F',
  bgSubtle: '#252B4F',
  bgOverlay: 'rgba(0,0,0,0.55)',
  bgGlass: 'rgba(26,31,63,0.78)',

  ink1: '#F3F2F8',
  ink2: '#B0B4D0',
  ink3: '#6F73A0',
  inkInv: '#07091B',

  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.16)',

  accent: '#8B7BFF',
  accentDeep: '#6A57F0',
  accentSoft: '#2A2766',
  accentOn: '#0B0E22',

  positive: '#4EC691',
  positiveSoft: '#1B3A2D',
  negative: '#EE7370',
  negativeSoft: '#3B221F',
  warn: '#E0B45A',
  warnSoft: '#3A2F18',

  categories: {
    'cat-housing':  { fg: '#9B8DFF', bg: '#2B2966' },
    'cat-food':     { fg: '#E69767', bg: '#4A2E1B' },
    'cat-transit':  { fg: '#7AAEDD', bg: '#1F3045' },
    'cat-bills':    { fg: '#EE7370', bg: '#3B221F' },
    'cat-health':   { fg: '#5EC5C3', bg: '#143434' },
    'cat-edu':      { fg: '#B898E8', bg: '#2D2245' },
    'cat-fun':      { fg: '#E985A8', bg: '#3F2030' },
    'cat-shop':     { fg: '#E78AAE', bg: '#401F2E' },
    'cat-kids':     { fg: '#E8B468', bg: '#3F2E14' },
    'cat-savings':  { fg: '#4EC691', bg: '#1B3A2D' },
    'cat-salary':   { fg: '#4EC691', bg: '#1B3A2D' },
    'cat-other':    { fg: '#9498B8', bg: '#25294A' },
  },
};

// Radii, spacing, shadows — same across themes
export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

// React Native shadow presets. iOS uses shadowColor/Opacity/Radius/Offset,
// Android uses elevation. Both are included on each preset.
export const shadows = {
  sm: {
    shadowColor: '#0E122E',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: '#0E122E',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  lg: {
    shadowColor: '#0E122E',
    shadowOpacity: 0.10,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  fab: {
    shadowColor: '#5546E0',
    shadowOpacity: 0.40,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
} as const;

// Type/font helpers. Geist is the brand font; if you haven't loaded it via
// expo-font yet, the fallback is the system font.
export const fonts = {
  // To load Geist:  npx expo install expo-font  then useFonts({...}) in App.tsx
  regular: 'Geist',
  mono: 'GeistMono',
};
