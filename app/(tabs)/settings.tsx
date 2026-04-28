import { useEffect, useRef, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, View, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { useBudgetStore } from '@/store/budget-store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as ImagePicker from 'expo-image-picker';
import { removeProfileAvatar, uploadProfileAvatar } from '@/lib/profile-avatar-storage';
import { getProfilePreferences, setProfilePreferences } from '@/lib/profile-preferences';

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const { isInitialized, initialize, resetAllData } = useBudgetStore();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [initials, setInitials] = useState('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    void (async () => {
      const preferences = await getProfilePreferences();
      const syncedAvatar = session?.user?.user_metadata?.avatar_url as string | undefined;
      const syncedInitials = session?.user?.user_metadata?.initials as string | undefined;
      setAvatarUri(preferences.avatarUri || syncedAvatar || null);
      setInitials((syncedInitials || preferences.initials || '').toUpperCase());
    })();
  }, [session?.user?.id, session?.user?.user_metadata]);

  useEffect(() => {
    if (!profileMessage) return;
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setProfileMessage(null);
    }, 2200);

    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, [profileMessage]);

  const saveProfilePreferences = async (nextAvatarUri: string | null, nextInitials: string) => {
    await setProfilePreferences({
      avatarUri: nextAvatarUri,
      initials: normalizeInitials(nextInitials),
    });
  };

  const normalizeInitials = (value: string) => value.trim().slice(0, 2).toUpperCase();
  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Unknown error';
  };

  const syncProfileMetadata = async (
    nextAvatarUri: string | null,
    nextInitials: string,
    nextAvatarPath: string | null,
  ) => {
    const normalizedInitials = normalizeInitials(nextInitials);
    const { error } = await supabase.auth.updateUser({
      data: {
        avatar_url: nextAvatarUri,
        avatar_path: nextAvatarPath,
        initials: normalizedInitials,
      },
    });
    if (error) throw error;
  };

  const handlePickProfileImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to upload your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;
    const selectedUri = result.assets[0].uri;
    const userId = session?.user?.id;
    if (!userId) {
      setProfileMessage('Could not upload picture. Please sign in again.');
      return;
    }

    const existingAvatarPath = session?.user?.user_metadata?.avatar_path as string | undefined;

    try {
      setAvatarUri(selectedUri);
      const uploaded = await uploadProfileAvatar(userId, selectedUri);
      await saveProfilePreferences(selectedUri, initials);
      await syncProfileMetadata(uploaded.publicUrl, initials, uploaded.path);
      if (existingAvatarPath) {
        await removeProfileAvatar(existingAvatarPath).catch(() => undefined);
      }
      setProfileMessage('Profile picture updated.');
    } catch (error) {
      setProfileMessage(`Could not sync profile picture: ${getErrorMessage(error)}`);
    }
  };

  const handleInitialsSave = async () => {
    try {
      await saveProfilePreferences(avatarUri, initials);
      const existingAvatarPath = session?.user?.user_metadata?.avatar_path as string | undefined;
      await syncProfileMetadata(avatarUri, initials, existingAvatarPath ?? null);
      setInitials(normalizeInitials(initials));
      setProfileMessage('Initials saved.');
    } catch (error) {
      setProfileMessage(`Could not sync initials: ${getErrorMessage(error)}`);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const existingAvatarPath = session?.user?.user_metadata?.avatar_path as string | undefined;
      if (existingAvatarPath) {
        await removeProfileAvatar(existingAvatarPath).catch(() => undefined);
      }
      setAvatarUri(null);
      await saveProfilePreferences(null, initials);
      await syncProfileMetadata(null, initials, null);
      setProfileMessage('Profile picture removed.');
    } catch (error) {
      setProfileMessage(`Could not remove picture: ${getErrorMessage(error)}`);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to delete all transactions, goals, and custom categories? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await resetAllData();
                Alert.alert('Success', 'All data has been reset.');
              } catch {
                Alert.alert('Could not reset', 'Check your connection and Supabase configuration.');
              }
            })();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {profileMessage ? (
          <ThemedView
            style={[
              styles.banner,
              {
                backgroundColor: `${theme.primary}14`,
                borderColor: `${theme.primary}40`,
              },
            ]}>
            <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>{profileMessage}</ThemedText>
          </ThemedView>
        ) : null}

        <ThemedView style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Profile
          </ThemedText>
          <View style={styles.profileRow}>
            <View style={[styles.avatarPreview, { borderColor: theme.border }]}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <ThemedText style={[styles.avatarFallback, { color: theme.tint }]}>
                  {(initials.trim().slice(0, 2).toUpperCase() || 'U')}
                </ThemedText>
              )}
            </View>
            <View style={styles.profileActions}>
              <TouchableOpacity
                style={[styles.signOutRow, { borderColor: theme.border }]}
                onPress={() => void handlePickProfileImage()}
                activeOpacity={0.85}>
                <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>Upload Picture</ThemedText>
              </TouchableOpacity>
              {avatarUri ? (
                <TouchableOpacity
                  style={[styles.signOutRow, { borderColor: theme.border }]}
                  onPress={() => void handleRemovePhoto()}
                  activeOpacity={0.85}>
                  <ThemedText style={{ color: theme.mutedText, fontWeight: '600' }}>Remove Picture</ThemedText>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          <ThemedText style={[styles.infoLabel, { marginTop: 16 }]}>Initials (optional)</ThemedText>
          <TextInput
            style={[
              styles.initialsInput,
              { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
            ]}
            value={initials}
            onChangeText={(value) => {
              setInitials(value);
              setProfileMessage(null);
            }}
            autoCapitalize="characters"
            maxLength={2}
            placeholder="e.g. BM"
            placeholderTextColor={theme.mutedText}
          />
          <ThemedText style={[styles.initialsPreviewText, { color: theme.mutedText }]}>
            Live preview: {(initials.trim().slice(0, 2).toUpperCase() || 'U')}
          </ThemedText>
          <TouchableOpacity
            style={[styles.signOutRow, { borderColor: theme.border }]}
            onPress={() => void handleInitialsSave()}
            activeOpacity={0.85}>
            <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>Save Initials</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account
          </ThemedText>
          <ThemedView style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={styles.infoLabel}>Signed in as</ThemedText>
            <ThemedText style={[styles.infoValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
              {session?.user?.email ?? '—'}
            </ThemedText>
          </ThemedView>
          <TouchableOpacity
            style={[styles.signOutRow, { borderColor: theme.border }]}
            onPress={() => {
              void signOut();
            }}
            activeOpacity={0.85}>
            <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>Sign out</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            App Information
          </ThemedText>
          <ThemedView style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={styles.infoLabel}>Version</ThemedText>
            <ThemedText style={styles.infoValue}>1.0.1</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <ThemedText style={styles.infoLabel}>Theme</ThemedText>
            <ThemedText style={styles.infoValue}>
              {colorScheme === 'dark' ? 'Vibrant · Dark' : 'Vibrant'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Data Management
          </ThemedText>
          <TouchableOpacity
            style={[styles.resetBox, { backgroundColor: colorScheme === 'dark' ? '#3F1D2B' : '#FEE2E2', borderColor: colorScheme === 'dark' ? '#9F1239' : '#FECACA' }]}
            onPress={handleReset}
            activeOpacity={0.85}>
            <View style={styles.settingLeft}>
              <IconSymbol name="trash.fill" size={24} color="#DC2626" />
              <ThemedText style={styles.settingLabel}>Reset All Data</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color={theme.mutedText} />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>
          <ThemedText style={[styles.aboutText, { color: theme.mutedText }]}>
            Fringe helps you track your income and expenses, set financial goals, and gain insights into
            your spending habits.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  banner: {
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutRow: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  resetBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatarPreview: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    fontSize: 26,
    fontWeight: '700',
  },
  profileActions: {
    flex: 1,
    gap: 8,
  },
  initialsInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 6,
  },
  initialsPreviewText: {
    fontSize: 12,
    marginBottom: 10,
  },
});

