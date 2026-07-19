import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

const SIZE = 236;
const DELAYS = [0, 1270, 2530];

function Ring({ delay }: { delay: number }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (cancelled) return;
      Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration: 3800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ).start();
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [v, delay]);

  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.7] });
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return <Animated.View style={[styles.ring, { opacity, transform: [{ scale }] }]} />;
}

export function RippleRings() {
  return (
    <>
      {DELAYS.map((delay, i) => (
        <Ring key={i} delay={delay} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(75,106,136,.28)',
  },
});
