import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type SegmentOption<T extends string> = { value: T; label: string } | T;

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
};

function unpack<T extends string>(o: SegmentOption<T>): { value: T; label: string } {
  return typeof o === 'string' ? { value: o, label: o } : o;
}

export function Segmented<T extends string>({ options, value, onChange, size = 'md', fullWidth = false }: Props<T>) {
  const { c, sh } = useTheme();
  const h = size === 'sm' ? 32 : 38;
  const fs = size === 'sm' ? 12 : 13;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: c.bgSubtle,
        borderRadius: 999,
        padding: 3,
        height: h + 6,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
      }}>
      {options.map((o) => {
        const { value: v, label } = unpack(o);
        const active = v === value;
        return (
          <Pressable
            key={v}
            onPress={() => onChange(v)}
            style={{
              flex: fullWidth ? 1 : undefined,
              minWidth: fullWidth ? undefined : 64,
              height: h,
              paddingHorizontal: 14,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? c.bgElev : 'transparent',
              ...(active ? sh.sm : {}),
            }}>
            <Text
              style={{
                fontSize: fs,
                fontWeight: active ? '600' : '500',
                color: active ? c.ink1 : c.ink2,
              }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
