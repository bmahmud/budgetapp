import { Logo } from '@/components/fringe/logo';
import React from 'react';
import { View } from 'react-native';

type Props = {
  size?: number;
};

export function HeaderLogo({ size = 28 }: Props) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Logo size={size} withWordmark={false} />
    </View>
  );
}
