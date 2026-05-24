import { FringeInput } from '@/components/fringe/form';
import { useAuth } from '@/contexts/auth-context';
import { validatePassword } from '@/lib/password-validation';
import {
  hasPasswordRecoveryTokensInUrl,
  parseAuthParamsFromUrl,
} from '@/lib/password-recovery';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { updatePassword, isRecoveringPassword, session } = useAuth();
  const params = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
    token_hash?: string;
    type?: string;
  }>();
  const { c, sh } = useTheme();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isPreparingSession, setIsPreparingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  useEffect(() => {
    if (isRecoveringPassword && session) {
      setIsRecoveryReady(true);
      setFormMessage('Enter your new password below.');
      setIsPreparingSession(false);
    }
  }, [isRecoveringPassword, session]);

  useEffect(() => {
    let isMounted = true;

    async function prepareRecoverySession() {
      if (isRecoveringPassword && session) return;

      setFormMessage(null);

      const { hash: hashParams, search: searchParams } = parseAuthParamsFromUrl();

      const tokenHashFromQuery = typeof params.token_hash === 'string' ? params.token_hash : '';
      const resetTypeFromQuery = typeof params.type === 'string' ? params.type : '';
      const accessTokenFromQuery = typeof params.access_token === 'string' ? params.access_token : '';
      const refreshTokenFromQuery = typeof params.refresh_token === 'string' ? params.refresh_token : '';

      const tokenHash = tokenHashFromQuery || hashParams.get('token_hash') || searchParams.get('token_hash') || '';
      const resetType = resetTypeFromQuery || hashParams.get('type') || searchParams.get('type') || '';
      const accessToken = accessTokenFromQuery || hashParams.get('access_token') || '';
      const refreshToken = refreshTokenFromQuery || hashParams.get('refresh_token') || '';

      if (tokenHash && resetType === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (error) {
          setFormMessage(`Invalid reset link: ${error.message}`);
        } else {
          setIsRecoveryReady(true);
          setFormMessage('Reset link verified. Enter your new password.');
        }
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setFormMessage(`Invalid reset session: ${error.message}`);
        } else {
          setIsRecoveryReady(true);
          setFormMessage('Reset session ready. Enter your new password.');
        }
      } else {
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();
        if (existingSession && (isRecoveringPassword || hasPasswordRecoveryTokensInUrl())) {
          setIsRecoveryReady(true);
          setFormMessage('Enter your new password below.');
        } else {
          setFormMessage('Reset link is missing required tokens. Request a new password reset email and try again.');
        }
      }

      if (isMounted) setIsPreparingSession(false);
    }

    void prepareRecoverySession();
    return () => {
      isMounted = false;
    };
  }, [
    params.access_token,
    params.refresh_token,
    params.token_hash,
    params.type,
    isRecoveringPassword,
    session,
  ]);

  async function handlePasswordUpdate() {
    setFormMessage(null);
    if (!isRecoveryReady) {
      setFormMessage('Reset session missing. Open the latest reset link from your email and try again.');
      return;
    }
    if (!password) {
      setFormMessage('Enter your new password.');
      return;
    }
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      setFormMessage(passwordCheck.message ?? 'Password does not meet requirements.');
      return;
    }
    if (password !== confirm) {
      setFormMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);
    if (error) {
      setFormMessage(`Update failed: ${error.message}`);
      return;
    }

    await supabase.auth.signOut();
    setFormMessage('Password updated successfully. Redirecting to sign in...');
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bgBase }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: insets.top + 24,
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 30, fontWeight: '800', color: c.ink1, marginBottom: 8 }}>Set New Password</Text>
          <Text style={{ fontSize: 15, color: c.ink2, marginBottom: 24 }}>
            Choose a strong password for your Fringe account.
          </Text>

          <View style={{ gap: 10 }}>
            <FringeInput
              value={password}
              onChange={setPassword}
              placeholder="New password (min 6, 1 uppercase, 1 special)"
              secureTextEntry
              autoComplete="off"
              textContentType="none"
            />
            <FringeInput
              value={confirm}
              onChange={setConfirm}
              placeholder="Confirm new password"
              secureTextEntry
              autoComplete="off"
              textContentType="none"
            />
            <Pressable
              onPress={() => void handlePasswordUpdate()}
              disabled={submitting || isPreparingSession || !isRecoveryReady}
              style={({ pressed }) => [
                {
                  paddingVertical: 15,
                  backgroundColor: c.accent,
                  borderRadius: 14,
                  alignItems: 'center',
                  marginTop: 4,
                  opacity: isPreparingSession ? 0.6 : 1,
                  ...sh.fab,
                },
                pressed && { transform: [{ scale: 0.985 }] },
              ]}>
              {submitting || isPreparingSession ? (
                <ActivityIndicator color={c.accentOn} />
              ) : (
                <Text style={{ color: c.accentOn, fontWeight: '600' }}>Update password</Text>
              )}
            </Pressable>
          </View>

          {formMessage ? (
            <Text style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: c.ink2 }}>{formMessage}</Text>
          ) : null}

          <Link href="/(auth)/login" asChild>
            <Pressable style={{ marginTop: 24, alignItems: 'center' }}>
              <Text style={{ color: c.accent, fontWeight: '600' }}>Back to sign in</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
