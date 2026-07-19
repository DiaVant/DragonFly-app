import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function TensionLine() {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(v, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [v]);

  const strokeDashoffset = v.interpolate({ inputRange: [0, 1], outputRange: [0, -56] });

  return (
    <Svg width={220} height={26} viewBox="0 0 220 26">
      <AnimatedPath
        d="M0,13 C40,4 70,22 110,13 C150,4 180,22 220,13"
        fill="none"
        stroke="#8FA89A"
        strokeWidth={2}
        strokeDasharray="6 8"
        strokeDashoffset={strokeDashoffset}
      />
    </Svg>
  );
}
