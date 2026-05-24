import { getAppearanceMode, setAppearanceMode, type AppearanceMode } from '@/lib/theme-preferences';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { darkPalette, fonts, lightPalette, radii, shadows, spacing, type Palette } from './tokens';

export type ThemeName = 'light' | 'dark';

export type Theme = {
  name: ThemeName;
  c: Palette;
  r: typeof radii;
  s: typeof spacing;
  sh: typeof shadows;
  f: typeof fonts;
};

type ThemeContextValue = {
  theme: Theme;
  appearance: AppearanceMode;
  setAppearance: (mode: AppearanceMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function FringeThemeProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearanceState] = useState<AppearanceMode>('light');

  useEffect(() => {
    void getAppearanceMode().then(setAppearanceState);
  }, []);

  const setAppearance = useCallback((mode: AppearanceMode) => {
    setAppearanceState(mode);
    void setAppearanceMode(mode);
  }, []);

  const theme = useMemo<Theme>(() => {
    const c = appearance === 'dark' ? darkPalette : lightPalette;
    return { name: appearance, c, r: radii, s: spacing, sh: shadows, f: fonts };
  }, [appearance]);

  const value = useMemo(
    () => ({
      theme,
      appearance,
      setAppearance,
    }),
    [theme, appearance, setAppearance],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within FringeThemeProvider');
  return ctx.theme;
}

export function useThemeControls(): Pick<ThemeContextValue, 'appearance' | 'setAppearance'> {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeControls must be used within FringeThemeProvider');
  return { appearance: ctx.appearance, setAppearance: ctx.setAppearance };
}
