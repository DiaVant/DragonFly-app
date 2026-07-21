import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { motion } from '../theme';

interface Props {
  screenKey: string;
  children: React.ReactNode;
  /** Skip fade/slide — used under the Fish On expand burst. */
  instant?: boolean;
}

export function ScreenTransition({ screenKey, children, instant }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (instant) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    opacity.setValue(0);
    translateY.setValue(8);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: motion.slow, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: motion.slow, useNativeDriver: true }),
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
