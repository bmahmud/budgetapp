import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const LOGO_SOURCE = require('../assets/images/logo.png');

interface AuthLogoProps {
  width?: number;
  height?: number;
}

export function AuthLogo({ width = 240, height = 60 }: AuthLogoProps) {
  const [renderKey, setRenderKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRenderKey((current) => current + 1);
    }, []),
  );

  return (
    <View style={styles.wrap}>
      <Image
        key={`fringe-logo-${renderKey}`}
        source={LOGO_SOURCE}
        style={{ width, height }}
        contentFit="contain"
        cachePolicy="memory-disk"
        accessibilityLabel="Fringe logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
    marginBottom: 16,
  },
});
