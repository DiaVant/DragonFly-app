import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface Props {
  screenKey: string;
  children: React.ReactNode;
}

export function ScreenTransition({ screenKey, children }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 340, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 340, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey]);

  return (
    <Animated.View style={[styles.fill, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
