import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const SIZE = 220;
const DELAYS = [0, 1100, 2200];

function Ring({ delay }: { delay: number }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (cancelled) return;
      Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration: 3300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ).start();
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      v.stopAnimation();
    };
  }, [v, delay]);

  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.42, 1.55] });
  const opacity = v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] });

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

/** Centered expanding rings behind the Ready dragonfly. */
export function RippleRings() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      {DELAYS.map((delay, i) => (
        <Ring key={i} delay={delay} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.75,
    borderColor: colors.copper,
  },
});
