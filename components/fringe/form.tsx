import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { Pressable, Text, TextInput, type TextInputProps, View } from 'react-native';

export function Label({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <Text style={{ fontSize: 12, fontWeight: '600', color: c.ink2, marginBottom: 8 }}>{children}</Text>
  );
}

type InputProps = Omit<TextInputProps, 'onChange' | 'value'> & {
  value: string;
  onChange: (v: string) => void;
};

export function FringeInput({ value, onChange, placeholder, ...rest }: InputProps) {
  const { c } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={c.ink3}
      style={{
        backgroundColor: c.bgElev,
        borderWidth: 1,
        borderColor: c.line,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: c.ink1,
        fontWeight: '500',
      }}
      {...rest}
    />
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={{
        width: 46,
        height: 28,
        borderRadius: 999,
        backgroundColor: checked ? c.accent : c.bgSubtle,
        padding: 3,
      }}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: '#FFFFFF',
          transform: [{ translateX: checked ? 18 : 0 }],
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      />
    </Pressable>
  );
}
