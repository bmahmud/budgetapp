import { Card } from '@/components/fringe/card';
import { FringeInput } from '@/components/fringe/form';
import { FringeIcon } from '@/components/fringe/icon';
import { ScreenScroll } from '@/components/fringe/screen-scroll';
import { Segmented } from '@/components/fringe/segmented';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  removeProfileAvatar,
  resolveProfileAvatarUrl,
  uploadProfileAvatar,
  uploadProfileAvatarFromBase64,
} from '@/lib/profile-avatar-storage';
import { getProfilePreferences, setProfilePreferences } from '@/lib/profile-preferences';
import { supabase } from '@/lib/supabase';
import { useTheme, useThemeControls } from '@/theme/ThemeContext';
import { useBudgetStore } from '@/store/budget-store';

export default function SettingsScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const { appearance, setAppearance } = useThemeControls();
  const { session, signOut, deleteAccount } = useAuth();
  const { isInitialized, initialize, resetAllData } = useBudgetStore();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [initials, setInitials] = useState('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [isInitialized, initialize]);

  const refreshSyncedProfile = async () => {
    const preferences = await getProfilePreferences();
    const {
      data: { user: latestUser },
    } = await supabase.auth.getUser();
    const syncedAvatar = latestUser?.user_metadata?.avatar_url as string | undefined;
    const syncedAvatarPath = latestUser?.user_metadata?.avatar_path as string | undefined;
    const syncedInitials = latestUser?.user_metadata?.initials as string | undefined;
    const resolvedSyncedAvatar = await resolveProfileAvatarUrl(syncedAvatarPath, syncedAvatar);
    setAvatarUri((current) => preferences.avatarUri || resolvedSyncedAvatar || syncedAvatar || current || null);
    setAvatarLoadFailed(false);
    setInitials((syncedInitials || preferences.initials || '').toUpperCase());
  };

  useEffect(() => {
    void refreshSyncedProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!profileMessage) return;
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => setProfileMessage(null), 2200);
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, [profileMessage]);

  const normalizeInitials = (value: string) => value.trim().slice(0, 2).toUpperCase();
  const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';

  const saveProfilePreferences = async (nextAvatarUri: string | null, nextInitials: string) => {
    await setProfilePreferences({ avatarUri: nextAvatarUri, initials: normalizeInitials(nextInitials) });
  };

  const syncProfileMetadata = async (
    nextAvatarUri: string | null,
    nextInitials: string,
    nextAvatarPath: string | null,
  ) => {
    const { error } = await supabase.auth.updateUser({
      data: {
        avatar_url: nextAvatarUri,
        avatar_path: nextAvatarPath,
        initials: normalizeInitials(nextInitials),
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
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const userId = session?.user?.id;
    if (!userId) {
      setProfileMessage('Could not upload picture. Please sign in again.');
      return;
    }
    const existingAvatarPath = session?.user?.user_metadata?.avatar_path as string | undefined;
    try {
      setAvatarLoadFailed(false);
      setAvatarUri(result.assets[0].uri);
      const uploaded = result.assets[0].base64
        ? await uploadProfileAvatarFromBase64(userId, result.assets[0].base64, 'image/jpeg')
        : await uploadProfileAvatar(userId, result.assets[0].uri);
      await saveProfilePreferences(result.assets[0].uri, initials);
      await syncProfileMetadata(uploaded.publicUrl, initials, uploaded.path);
      if (existingAvatarPath) await removeProfileAvatar(existingAvatarPath).catch(() => undefined);
      void refreshSyncedProfile();
      setProfileMessage('Profile picture updated.');
    } catch (error) {
      setProfileMessage(`Could not sync profile picture: ${getErrorMessage(error)}`);
    }
  };

  const handleInitialsSave = async () => {
    try {
      await saveProfilePreferences(null, initials);
      const {
        data: { user: latestUser },
      } = await supabase.auth.getUser();
      const existingAvatarPath = latestUser?.user_metadata?.avatar_path as string | undefined;
      const existingAvatarUrl = latestUser?.user_metadata?.avatar_url as string | undefined;
      await syncProfileMetadata(existingAvatarUrl ?? null, initials, existingAvatarPath ?? null);
      await refreshSyncedProfile();
      setInitials(normalizeInitials(initials));
      setProfileMessage('Initials saved.');
    } catch (error) {
      setProfileMessage(`Could not sync initials: ${getErrorMessage(error)}`);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const existingAvatarPath = session?.user?.user_metadata?.avatar_path as string | undefined;
      if (existingAvatarPath) await removeProfileAvatar(existingAvatarPath).catch(() => undefined);
      setAvatarUri(null);
      setAvatarLoadFailed(false);
      await saveProfilePreferences(null, initials);
      await syncProfileMetadata(null, initials, null);
      await refreshSyncedProfile();
      setProfileMessage('Profile picture removed.');
    } catch (error) {
      setProfileMessage(`Could not remove picture: ${getErrorMessage(error)}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Password required', 'Enter your password to permanently delete your account.');
      return;
    }
    setIsDeletingAccount(true);
    const { error } = await deleteAccount(deletePassword);
    setIsDeletingAccount(false);
    if (error) {
      Alert.alert('Could not delete account', error.message);
      return;
    }
    setShowDeleteAccount(false);
    setDeletePassword('');
    router.replace('/(auth)/login');
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account permanently?',
      'This removes your Fringe account, all transactions, goals, categories, and profile photo. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: () => setShowDeleteAccount(true) },
      ],
    );
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
      ],
    );
  };

  const displayInitials = initials.trim().slice(0, 2).toUpperCase() || 'U';

  return (
    <ScreenScroll>
      <View style={{ paddingBottom: 18 }}>
        <Text style={{ fontSize: 12, color: c.ink3, fontWeight: '600', letterSpacing: 0.4 }}>YOU</Text>
        <Text style={{ fontSize: 26, fontWeight: '700', color: c.ink1, letterSpacing: -0.6 }}>Settings</Text>
      </View>

      {profileMessage ? (
        <Card pad={12} radius="md" style={{ marginBottom: 12, backgroundColor: c.accentSoft, borderColor: c.accent }}>
          <Text style={{ color: c.accent, fontWeight: '600' }}>{profileMessage}</Text>
        </Card>
      ) : null}

      <Card pad={20} radius="lg" style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: c.accent,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
          {avatarUri && !avatarLoadFailed ? (
            <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} onError={() => setAvatarLoadFailed(true)} />
          ) : (
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{displayInitials}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: c.ink1 }}>{displayInitials}</Text>
          <Text style={{ fontSize: 12, color: c.ink3, marginTop: 2 }}>{session?.user?.email ?? '—'}</Text>
        </View>
      </Card>

      <Text style={{ fontSize: 11, fontWeight: '600', color: c.ink3, letterSpacing: 0.4, paddingHorizontal: 4, paddingBottom: 8 }}>
        PROFILE
      </Text>
      <Card pad={16} radius="lg" style={{ marginBottom: 16, gap: 10 }}>
        <Pressable onPress={() => void handlePickProfileImage()} style={{ paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: c.accent, fontWeight: '600' }}>Upload picture</Text>
        </Pressable>
        {avatarUri ? (
          <Pressable onPress={() => void handleRemovePhoto()} style={{ paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ color: c.ink2, fontWeight: '600' }}>Remove picture</Text>
          </Pressable>
        ) : null}
        <FringeInput value={initials} onChange={setInitials} placeholder="Initials (e.g. BM)" autoCapitalize="characters" maxLength={2} />
        <Pressable onPress={() => void handleInitialsSave()} style={{ paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: c.accent, fontWeight: '600' }}>Save initials</Text>
        </Pressable>
      </Card>

      <Text style={{ fontSize: 11, fontWeight: '600', color: c.ink3, letterSpacing: 0.4, paddingHorizontal: 4, paddingBottom: 8 }}>
        PREFERENCES
      </Text>
      <Card pad={0} radius="lg" style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: c.bgSubtle,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <FringeIcon name={appearance === 'light' ? 'sun' : 'moon'} size={16} color={c.ink2} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.ink1 }}>Appearance</Text>
            <Text style={{ fontSize: 12, color: c.ink3, marginTop: 1 }}>
              {appearance === 'light' ? 'Light' : 'Dark'} mode
            </Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Segmented
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            value={appearance}
            onChange={setAppearance}
            fullWidth
          />
        </View>
      </Card>

      <Text style={{ fontSize: 11, fontWeight: '600', color: c.ink3, letterSpacing: 0.4, paddingHorizontal: 4, paddingBottom: 8 }}>
        ACCOUNT
      </Text>
      <Card pad={0} radius="lg" style={{ marginBottom: 16 }}>
        <Pressable onPress={() => void signOut()} style={{ paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: c.accent }}>Sign out</Text>
        </Pressable>
      </Card>

      <Text style={{ fontSize: 11, fontWeight: '600', color: c.ink3, letterSpacing: 0.4, paddingHorizontal: 4, paddingBottom: 8 }}>
        DATA
      </Text>
      <Card pad={0} radius="lg" style={{ marginBottom: 16 }}>
        <Pressable onPress={handleReset} style={{ paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: c.negative }}>Reset all data</Text>
        </Pressable>
      </Card>

      <Text style={{ fontSize: 11, fontWeight: '600', color: c.ink3, letterSpacing: 0.4, paddingHorizontal: 4, paddingBottom: 8 }}>
        DANGER ZONE
      </Text>
      {showDeleteAccount ? (
        <Card pad={16} radius="lg" style={{ marginBottom: 16, borderColor: c.negativeSoft }}>
          <Text style={{ fontSize: 14, color: c.ink1, marginBottom: 10 }}>
            Enter your password to confirm permanent deletion.
          </Text>
          <FringeInput
            value={deletePassword}
            onChange={setDeletePassword}
            placeholder="Password"
            secureTextEntry
            autoComplete="off"
            textContentType="none"
            editable={!isDeletingAccount}
          />
          <Pressable
            onPress={() => void handleDeleteAccount()}
            disabled={isDeletingAccount}
            style={{
              marginTop: 10,
              paddingVertical: 14,
              borderRadius: 10,
              backgroundColor: c.negative,
              alignItems: 'center',
            }}>
            {isDeletingAccount ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '600' }}>Delete my account</Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => {
              setShowDeleteAccount(false);
              setDeletePassword('');
            }}
            disabled={isDeletingAccount}
            style={{ marginTop: 10, alignItems: 'center' }}>
            <Text style={{ color: c.ink3 }}>Cancel</Text>
          </Pressable>
        </Card>
      ) : (
        <Card pad={0} radius="lg" style={{ marginBottom: 16 }}>
          <Pressable onPress={confirmDeleteAccount} style={{ paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.negative }}>Delete account</Text>
          </Pressable>
        </Card>
      )}

      <Card pad={16} radius="lg">
        <Text style={{ fontSize: 14, color: c.ink2, lineHeight: 20 }}>
          Fringe helps you track income and expenses, set goals, and understand your spending. Version 1.0.1
        </Text>
      </Card>
    </ScreenScroll>
  );
}
