import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors, fonts, radii, shadows, touchTarget } from '../theme';
import { PressScale } from '../components/PressScale';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'copper' | 'navy' | 'danger' | 'ghost-light' | 'ghost';
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'copper',
  style,
  accessibilityHint,
}: Props) {
  const isDisabled = disabled || loading;

  const bg =
    variant === 'navy'
      ? colors.navy
      : variant === 'danger'
        ? colors.danger
        : variant === 'ghost-light' || variant === 'ghost'
          ? 'transparent'
          : colors.copper;

  return (
    <PressScale
      onPress={onPress}
      disabled={isDisabled}
      activeScale={0.97}
      style={[
        styles.button,
        { backgroundColor: bg },
        variant === 'copper' && !isDisabled ? shadows.cta : null,
        variant === 'ghost-light' && styles.ghostLight,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.fill}>
        {loading ? (
          <ActivityIndicator color={variant === 'ghost' ? colors.navy : colors.textOnAccent} />
        ) : (
          <Text
            style={[
              styles.label,
              variant === 'ghost-light' && styles.ghostLabelLight,
              variant === 'ghost' && styles.ghostLabelDark,
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget.comfortable,
    borderRadius: radii.md,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    minHeight: touchTarget.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    width: '100%',
  },
  label: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 15,
    letterSpacing: 0.35,
    color: colors.textOnAccent,
  },
  disabled: {
    opacity: 0.45,
  },
  ghostLight: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  ghost: {
    borderWidth: 1.5,
    borderColor: colors.navy,
    backgroundColor: 'transparent',
  },
  ghostLabelLight: {
    color: colors.textOnDark,
  },
  ghostLabelDark: {
    color: colors.navy,
  },
});
