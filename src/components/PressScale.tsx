import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';

interface Props {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PressScale({ onPress, style, activeScale = 0.96, children, disabled }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.timing(scale, { toValue: activeScale, duration: 90, useNativeDriver: true }).start();
  const pressOut = () => Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }).start();

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} disabled={disabled} style={style}>
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}
