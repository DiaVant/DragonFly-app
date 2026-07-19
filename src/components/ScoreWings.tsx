import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

interface WingSpec {
  x: number;
  y: number;
  rotate: number;
  fill: string;
  fillOpacity: number;
  stroke: string;
  delay: number;
}

const WINGS: WingSpec[] = [
  { x: 78.9, y: 109.0, rotate: 210, fill: '#4B6A88', fillOpacity: 0.55, stroke: '#33506E', delay: 50 },
  { x: 78.9, y: 191.0, rotate: 150, fill: '#B87444', fillOpacity: 0.5, stroke: '#95592F', delay: 180 },
  { x: 221.1, y: 109.0, rotate: -30, fill: '#4B6A88', fillOpacity: 0.55, stroke: '#33506E', delay: 50 },
  { x: 221.1, y: 191.0, rotate: 30, fill: '#B87444', fillOpacity: 0.5, stroke: '#95592F', delay: 180 },
];

function Wing({ spec }: { spec: WingSpec }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(v, {
      toValue: 1,
      duration: 900,
      delay: spec.delay,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [v, spec.delay]);

  const transform = v.interpolate({ inputRange: [0, 1], outputRange: ['scale(0.05,0.35)', 'scale(1,1)'] });
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] });

  return (
    <G transform={`translate(${spec.x},${spec.y}) rotate(${spec.rotate})`}>
      <AnimatedG transform={transform} opacity={opacity}>
        <Path d="M0,0 Q30,-20 62,0 Q30,20 0,0 Z" fill={spec.fill} fillOpacity={spec.fillOpacity} stroke={spec.stroke} strokeWidth={1} />
      </AnimatedG>
    </G>
  );
}

export function ScoreWings({ size = 340 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 300 300" opacity={0.35}>
      <Circle cx={150} cy={150} r={122} fill="none" stroke="rgba(75,106,136,.14)" strokeWidth={1} />
      <Circle cx={150} cy={150} r={97} fill="none" stroke="rgba(75,106,136,.10)" strokeWidth={1} />
      {WINGS.map((spec, i) => (
        <Wing key={i} spec={spec} />
      ))}
    </Svg>
  );
}
