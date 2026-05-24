import { Card } from '@/components/fringe/card';
import { FringeInput } from '@/components/fringe/form';
import { ScreenScroll } from '@/components/fringe/screen-scroll';
import { useAuth } from '@/contexts/auth-context';
import { validatePassword } from '@/lib/password-validation';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { c, sh } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Supabase not configured',
        'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env and restart Expo.',
      );
      return;
    }
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Enter email and password.');
      return;
    }
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      Alert.alert('Weak password', passwordCheck.message ?? 'Password does not meet requirements.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    setSubmitting(true);
    const { error } = await signUp(email, password);
    setSubmitting(false);
    if (error) {
      Alert.alert('Sign up failed', error.message);
      return;
    }
    Alert.alert(
      'Check your email',
      'If email confirmation is enabled in Supabase, confirm your address before signing in.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bgBase }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 24, paddingBottom: 24 }}>
          <Text style={{ fontSize: 30, fontWeight: '800', color: c.ink1, marginBottom: 8 }}>Create account</Text>
          <Text style={{ fontSize: 15, color: c.ink2, marginBottom: 24 }}>Create your Fringe account.</Text>
          <View style={{ gap: 10 }}>
            <FringeInput value={email} onChange={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
            <FringeInput value={password} onChange={setPassword} placeholder="Password (min 6, 1 uppercase, 1 special)" secureTextEntry autoComplete="off" textContentType="none" />
            <FringeInput value={confirm} onChange={setConfirm} placeholder="Confirm password" secureTextEntry autoComplete="off" textContentType="none" />
            <Pressable
              onPress={() => void handleRegister()}
              disabled={submitting}
              style={({ pressed }) => [
                { paddingVertical: 15, backgroundColor: c.accent, borderRadius: 14, alignItems: 'center', marginTop: 8, ...sh.fab },
                pressed && { transform: [{ scale: 0.985 }] },
              ]}>
              {submitting ? <ActivityIndicator color={c.accentOn} /> : <Text style={{ color: c.accentOn, fontWeight: '600' }}>Sign up</Text>}
            </Pressable>
          </View>
          <Link href="/(auth)/login" asChild>
            <Pressable style={{ marginTop: 24, alignItems: 'center' }}>
              <Text style={{ color: c.accent }}>Already have an account? Sign in</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
