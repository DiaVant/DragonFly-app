import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export interface FishOnOrigin {
  x: number;
  y: number;
  size: number;
}

interface Props {
  origin: FishOnOrigin | null;
  /** Fires once the circle has mostly covered the screen — navigate here. */
  onCovered: () => void;
  /** Fires when the overlay can be removed. */
  onFinished: () => void;
}

/**
 * Nike Run–style Fish On burst: copper circle expands from the tab button
 * to fill the screen, then dissolves into the fishing UI.
 */
export function FishOnExpand({ origin, onCovered, onFinished }: Props) {
  const scale = useRef(new Animated.Value(0.01)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const coveredRef = useRef(false);
  const finishedRef = useRef(false);

  const targetScale = useMemo(() => {
    if (!origin) return 20;
    const { width: W, height: H } = Dimensions.get('window');
    const cx = origin.x + origin.size / 2;
    const cy = origin.y + origin.size / 2;
    const corners: Array<[number, number]> = [
      [0, 0],
      [W, 0],
      [0, H],
      [W, H],
    ];
    let maxDist = 0;
    for (const [x, y] of corners) {
      maxDist = Math.max(maxDist, Math.hypot(cx - x, cy - y));
    }
    return (maxDist / (origin.size / 2)) * 1.08;
  }, [origin]);

  useEffect(() => {
    if (!origin) return;
    coveredRef.current = false;
    finishedRef.current = false;
    scale.setValue(0.92);
    opacity.setValue(1);

    const expand = Animated.timing(scale, {
      toValue: targetScale,
      duration: 520,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    });

    const fade = Animated.timing(opacity, {
      toValue: 0,
      duration: 280,
      delay: 60,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    expand.start(({ finished }) => {
      if (!finished) return;
      if (!coveredRef.current) {
        coveredRef.current = true;
        onCovered();
      }
      fade.start(({ finished: fadeDone }) => {
        if (!fadeDone || finishedRef.current) return;
        finishedRef.current = true;
        onFinished();
      });
    });

    const coverTimer = setTimeout(() => {
      if (coveredRef.current) return;
      coveredRef.current = true;
      onCovered();
    }, 280);

    return () => {
      clearTimeout(coverTimer);
      expand.stop();
      fade.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin]);

  if (!origin) return null;

  const size = origin.size;
  const left = origin.x;
  const top = origin.y;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.circle,
          {
            left,
            top,
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity,
            transform: [{ scale }],
            zIndex: 100,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    backgroundColor: colors.copper,
    borderWidth: 3,
    borderColor: colors.copperSoft,
  },
});
