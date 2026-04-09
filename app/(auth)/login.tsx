import { ThemedText } from '@/components/themed-text';
import { Colors, FringePalette } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

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
    setFormMessage('Signed in successfully. Redirecting...');
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.inner}>
          <Image source={require('../../assets/fringe-logo.png')} style={styles.logo} resizeMode="contain" />
          <ThemedText style={[styles.subtitle, { color: theme.mutedText }]}>
            Sign in to sync your budget across devices.
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.border, backgroundColor: theme.card },
            ]}
            placeholder="Email"
            placeholderTextColor={theme.mutedText}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.border, backgroundColor: theme.card },
            ]}
            placeholder="Password"
            placeholderTextColor={theme.mutedText}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleSignIn}
            disabled={submitting}
            activeOpacity={0.85}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Sign in</ThemedText>
            )}
          </TouchableOpacity>

          {formMessage ? (
            <ThemedText style={[styles.formMessage, { color: theme.mutedText }]}>{formMessage}</ThemedText>
          ) : null}

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotWrap}>
              <ThemedText style={{ color: FringePalette.purple }}>Forgot password?</ThemedText>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.linkWrap}>
              <ThemedText style={{ color: FringePalette.purple }}>Create an account</ThemedText>
            </TouchableOpacity>
          </Link>

          {!isSupabaseConfigured ? (
            <ThemedText style={[styles.hint, { color: theme.mutedText }]}>
              Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env
            </ThemedText>
          ) : null}
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
    paddingTop: 48,
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: 130,
    marginBottom: 12,
  },
  subtitle: { marginBottom: 32, fontSize: 15 },
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
  formMessage: { marginTop: 12, textAlign: 'center', fontSize: 13 },
  forgotWrap: { marginTop: 16, alignItems: 'center' },
  linkWrap: { marginTop: 24, alignItems: 'center' },
  hint: { marginTop: 24, fontSize: 12, textAlign: 'center' },
});
