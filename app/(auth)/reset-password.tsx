import { ThemedText } from '@/components/themed-text';
import { Colors, FringePalette } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ResetParams {
  access_token?: string;
  refresh_token?: string;
  token_hash?: string;
  type?: string;
}

function getWebHashParams() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return new URLSearchParams();
  const rawHash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(rawHash);
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const params = useLocalSearchParams<ResetParams>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isPreparingSession, setIsPreparingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function prepareRecoverySession() {
      const hashParams = getWebHashParams();

      const tokenHashFromQuery = typeof params.token_hash === 'string' ? params.token_hash : '';
      const resetTypeFromQuery = typeof params.type === 'string' ? params.type : '';
      const accessTokenFromQuery = typeof params.access_token === 'string' ? params.access_token : '';
      const refreshTokenFromQuery = typeof params.refresh_token === 'string' ? params.refresh_token : '';

      const tokenHash = tokenHashFromQuery || hashParams.get('token_hash') || '';
      const resetType = resetTypeFromQuery || hashParams.get('type') || '';
      const accessToken = accessTokenFromQuery || hashParams.get('access_token') || '';
      const refreshToken = refreshTokenFromQuery || hashParams.get('refresh_token') || '';

      if (tokenHash && resetType === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (error) {
          Alert.alert('Invalid reset link', error.message);
        } else {
          setIsRecoveryReady(true);
        }
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          Alert.alert('Invalid reset session', error.message);
        } else {
          setIsRecoveryReady(true);
        }
      } else {
        Alert.alert(
          'Reset link invalid',
          'This reset link is missing required tokens. Request a new password reset email and try again.',
        );
      }

      if (isMounted) setIsPreparingSession(false);
    }

    void prepareRecoverySession();
    return () => {
      isMounted = false;
    };
  }, [params.access_token, params.refresh_token, params.token_hash, params.type]);

  async function handlePasswordUpdate() {
    if (!isRecoveryReady) {
      Alert.alert('Reset session missing', 'Open the latest reset link from your email and try again.');
      return;
    }
    if (!password) {
      Alert.alert('Missing password', 'Enter your new password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);
    if (error) {
      Alert.alert('Update failed', error.message);
      return;
    }

    await supabase.auth.signOut();
    Alert.alert(
      'Password updated successfully',
      'Your password was changed. Please sign in again with your new password.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.inner}>
          <ThemedText type="title" style={styles.title}>
            Set New Password
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.mutedText }]}>
            Choose a strong password for your Fringe account.
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.border, backgroundColor: theme.card },
            ]}
            placeholder="New password (min 6 characters)"
            placeholderTextColor={theme.mutedText}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.border, backgroundColor: theme.card },
            ]}
            placeholder="Confirm new password"
            placeholderTextColor={theme.mutedText}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary, opacity: isPreparingSession ? 0.6 : 1 }]}
            onPress={handlePasswordUpdate}
            disabled={submitting || isPreparingSession || !isRecoveryReady}
            activeOpacity={0.85}>
            {submitting || isPreparingSession ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Update password</ThemedText>
            )}
          </TouchableOpacity>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.linkWrap}>
              <ThemedText style={{ color: FringePalette.purple }}>Back to sign in</ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: { marginBottom: 8, fontSize: 30, fontWeight: '800' },
  subtitle: { marginBottom: 24, fontSize: 15 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkWrap: { marginTop: 24, alignItems: 'center' },
});
