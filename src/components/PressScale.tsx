import React, { useRef } from 'react';
import {
  AccessibilityRole,
  AccessibilityState,
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { motion } from '../theme';

interface Props {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
  children: React.ReactNode;
  disabled?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
}

export function PressScale({
  onPress,
  style,
  activeScale = 0.96,
  children,
  disabled,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.timing(scale, { toValue: activeScale, duration: motion.instant, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.timing(scale, { toValue: 1, duration: motion.fast, useNativeDriver: true }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
      style={style}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
    >
      <Animated.View style={{ transform: [{ scale }], width: '100%', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
