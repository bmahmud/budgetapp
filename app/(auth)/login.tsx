import { FringeInput } from '@/components/fringe/form';
import { Logo } from '@/components/fringe/logo';
import { useAuth } from '@/contexts/auth-context';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ resetSent?: string }>();
  const { signIn } = useAuth();
  const { c, sh } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useEffect(() => {
    if (params.resetSent !== '1') return;
    setFormMessage(
      'If an account exists for that email, a reset link was sent. Open it on this device to set a new password.',
    );
  }, [params.resetSent]);

  async function handleSignIn() {
    setFormMessage(null);
    if (!isSupabaseConfigured) {
      setFormMessage(
        'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env and restart Expo.',
      );
      return;
    }
    if (!email.trim() || !password) {
      setFormMessage('Enter email and password.');
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setFormMessage(error.message);
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bgBase }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
            justifyContent: 'center',
          }}
          keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Logo size={64} withWordmark tagline stacked />
            <Text
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: c.ink1,
                letterSpacing: -0.7,
                marginTop: 18,
                lineHeight: 36,
                textAlign: 'center',
              }}>
              Money that{'\n'}moves with you.
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: c.ink2,
                marginTop: 12,
                lineHeight: 20,
                maxWidth: 280,
                textAlign: 'center',
              }}>
              Track every dollar, plan every week, save what matters. Built for households.
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            <FringeInput
              value={email}
              onChange={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              autoComplete="off"
              keyboardType="email-address"
            />
            <FringeInput
              value={password}
              onChange={setPassword}
              placeholder="Password"
              secureTextEntry
              autoComplete="off"
              textContentType="none"
            />
            <Pressable
              onPress={() => void handleSignIn()}
              disabled={submitting}
              style={({ pressed }) => [
                {
                  paddingVertical: 15,
                  paddingHorizontal: 20,
                  backgroundColor: c.accent,
                  borderRadius: 14,
                  alignItems: 'center',
                  marginTop: 4,
                  ...sh.fab,
                },
                pressed && { transform: [{ scale: 0.985 }] },
                submitting && { opacity: 0.7 },
              ]}>
              {submitting ? (
                <ActivityIndicator color={c.accentOn} />
              ) : (
                <Text style={{ fontSize: 15, fontWeight: '600', color: c.accentOn }}>Sign in</Text>
              )}
            </Pressable>
          </View>

          {formMessage ? (
            <Text style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: c.ink2 }}>{formMessage}</Text>
          ) : null}

          <View style={{ alignItems: 'center', marginTop: 18, gap: 12 }}>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable>
                <Text style={{ fontSize: 13, color: c.accent, fontWeight: '600' }}>Forgot password?</Text>
              </Pressable>
            </Link>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={{ fontSize: 13, color: c.ink2 }}>
                  Don't have an account? <Text style={{ color: c.accent, fontWeight: '700' }}>Create one</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
