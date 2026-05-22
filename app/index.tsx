import { useAuth } from '@/contexts/auth-context';
import {
  hasPasswordRecoveryTokensInUrl,
  PASSWORD_RECOVERY_PATH,
} from '@/lib/password-recovery';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
  const { session, isLoading, isRecoveringPassword } = useAuth();
  const pendingRecoveryFromUrl = hasPasswordRecoveryTokensInUrl();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (pendingRecoveryFromUrl || isRecoveringPassword) {
    return <Redirect href={PASSWORD_RECOVERY_PATH} />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
