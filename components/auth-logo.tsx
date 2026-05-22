import { FringeLogo } from '@/components/fringe-logo';
import { StyleSheet, View } from 'react-native';

interface AuthLogoProps {
  width?: number;
  height?: number;
}

export function AuthLogo({ width = 240, height = 60 }: AuthLogoProps) {
  return (
    <View style={styles.wrap}>
      <FringeLogo width={width} height={height} remountKey="auth" containerStyle={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    alignItems: 'center',
  },
});
