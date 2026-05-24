import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppearanceMode = 'light' | 'dark';

const APPEARANCE_KEY = 'fringe_appearance_mode_v1';
const DEFAULT_APPEARANCE: AppearanceMode = 'light';

export async function getAppearanceMode(): Promise<AppearanceMode> {
  try {
    const value = await AsyncStorage.getItem(APPEARANCE_KEY);
    if (value === 'light' || value === 'dark') return value;
    return DEFAULT_APPEARANCE;
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export async function setAppearanceMode(mode: AppearanceMode): Promise<void> {
  await AsyncStorage.setItem(APPEARANCE_KEY, mode);
}
