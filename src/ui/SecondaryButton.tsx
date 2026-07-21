import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, StyleProp } from 'react-native';
import { colors, fonts, touchTarget } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  tone?: 'default' | 'danger' | 'onDark';
  accessibilityHint?: string;
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
  style,
  tone = 'default',
  accessibilityHint,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style, disabled && styles.disabled]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text
        style={[
          styles.label,
          tone === 'danger' && styles.danger,
          tone === 'onDark' && styles.onDark,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textSecondary,
  },
  danger: {
    color: colors.danger,
  },
  onDark: {
    color: colors.textOnDark,
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(240,243,245,0.35)',
  },
  disabled: {
    opacity: 0.45,
  },
});
