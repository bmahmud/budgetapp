import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProfilePreferences {
  avatarUri: string | null;
  initials: string;
}

const PROFILE_PREFERENCES_KEY = 'fringe_profile_preferences_v1';

const DEFAULT_PROFILE_PREFERENCES: ProfilePreferences = {
  avatarUri: null,
  initials: '',
};

export async function getProfilePreferences(): Promise<ProfilePreferences> {
  try {
    const rawValue = await AsyncStorage.getItem(PROFILE_PREFERENCES_KEY);
    if (!rawValue) return DEFAULT_PROFILE_PREFERENCES;
    const parsed = JSON.parse(rawValue) as Partial<ProfilePreferences>;
    return {
      avatarUri: parsed.avatarUri ?? null,
      initials: parsed.initials ?? '',
    };
  } catch {
    return DEFAULT_PROFILE_PREFERENCES;
  }
}

export async function setProfilePreferences(preferences: ProfilePreferences): Promise<void> {
  await AsyncStorage.setItem(PROFILE_PREFERENCES_KEY, JSON.stringify(preferences));
}
