import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

const LOGO_SOURCE = require('../assets/images/logo.png');

interface FringeLogoProps {
  width?: number;
  height?: number;
  remountOnFocus?: boolean;
  remountKey?: string;
  containerStyle?: ViewStyle;
}

export function FringeLogo({
  width = 180,
  height = 56,
  remountOnFocus = true,
  remountKey = 'default',
  containerStyle,
}: FringeLogoProps) {
  const [focusKey, setFocusKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!remountOnFocus) return;
      setFocusKey((current) => current + 1);
    }, [remountOnFocus]),
  );

  return (
    <View style={[styles.wrap, { minHeight: height + 4 }, containerStyle]}>
      <Image
        key={`fringe-logo-${remountKey}-${focusKey}`}
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
    justifyContent: 'center',
  },
});
