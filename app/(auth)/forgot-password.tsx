import { FringeInput } from '@/components/fringe/form';
import { useAuth } from '@/contexts/auth-context';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestPasswordReset } = useAuth();
  const { c, sh } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestReset() {
    if (!isSupabaseConfigured) {
      Alert.alert('Supabase not configured', 'Add Supabase env vars to .env and restart Expo.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Missing email', 'Enter the email address linked to your account.');
      return;
    }
    setSubmitting(true);
    const { error } = await requestPasswordReset(email);
    setSubmitting(false);
    if (error) {
      Alert.alert('Request failed', error.message);
      return;
    }
    setEmail('');
    router.replace('/(auth)/login?resetSent=1');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bgBase }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 24, justifyContent: 'center' }}>
          <Text style={{ fontSize: 30, fontWeight: '800', color: c.ink1, marginBottom: 8 }}>Reset Password</Text>
          <Text style={{ fontSize: 15, color: c.ink2, marginBottom: 24 }}>
            Enter your email and we will send a secure reset link.
          </Text>
          <FringeInput value={email} onChange={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
          <Pressable
            onPress={() => void handleRequestReset()}
            disabled={submitting}
            style={({ pressed }) => [
              { paddingVertical: 15, backgroundColor: c.accent, borderRadius: 14, alignItems: 'center', marginTop: 12, ...sh.fab },
              pressed && { transform: [{ scale: 0.985 }] },
            ]}>
            {submitting ? <ActivityIndicator color={c.accentOn} /> : <Text style={{ color: c.accentOn, fontWeight: '600' }}>Send reset link</Text>}
          </Pressable>
          <Link href="/(auth)/login" asChild>
            <Pressable style={{ marginTop: 24, alignItems: 'center' }}>
              <Text style={{ color: c.accent }}>Back to sign in</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
