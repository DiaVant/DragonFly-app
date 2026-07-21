import React, { useMemo } from 'react';
import Svg, { Line, Polygon, Path } from 'react-native-svg';

interface Props {
  size?: number;
  tone?: 'dark' | 'light';
  opacity?: number;
}

/**
 * Official DragonFly mark — vectorized from the product logo:
 * compass dial · copper 12 o'clock · navy dragonfly body/wings.
 */
export function DragonflyMark({ size = 30, tone = 'dark', opacity = 1 }: Props) {
  const ink = tone === 'light' ? '#EDF1F1' : '#1B2A41';
  const dial = tone === 'light' ? 'rgba(237,241,241,0.45)' : 'rgba(143,168,154,0.55)';
  const dialMajor = tone === 'light' ? 'rgba(237,241,241,0.7)' : 'rgba(143,168,154,0.85)';
  const copper = '#B87444';

  const ticks = useMemo(() => {
    const N = 60;
    const out = [];
    for (let i = 0; i < N; i++) {
      // Skip top so copper diamond/triangle own 12 o'clock.
      if (i === 0) continue;
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      const major = i % 5 === 0;
      const r1 = 46.5;
      const r2 = major ? 36 : 40.5;
      out.push({
        x1: 50 + Math.cos(a) * r1,
        y1: 50 + Math.sin(a) * r1,
        x2: 50 + Math.cos(a) * r2,
        y2: 50 + Math.sin(a) * r2,
        color: major ? dialMajor : dial,
        w: major ? 1.35 : 0.9,
      });
    }
    return out;
  }, [dial, dialMajor]);

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={opacity}>
      {ticks.map((t, i) => (
        <Line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={t.color}
          strokeWidth={t.w}
          strokeLinecap="round"
        />
      ))}

      {/* 12 o'clock copper diamond */}
      <Polygon points="50,4.5 52.4,8.2 50,11.9 47.6,8.2" fill={copper} />
      {/* Copper head triangle (points down into body) */}
      <Polygon points="50,22 54.2,30.5 45.8,30.5" fill={copper} />

      {/* Upper wings — angular, upswept */}
      <Path
        d="M50 36 L28 28 L22 34 L42 44 Z"
        fill={ink}
      />
      <Path
        d="M50 36 L72 28 L78 34 L58 44 Z"
        fill={ink}
      />

      {/* Lower wings — shorter, flatter */}
      <Path
        d="M50 46 L30 48 L28 54 L46 52 Z"
        fill={ink}
      />
      <Path
        d="M50 46 L70 48 L72 54 L54 52 Z"
        fill={ink}
      />

      {/* Body spine — tapering needle */}
      <Path d="M48.2 32 L51.8 32 L52.4 58 L50 78 L47.6 58 Z" fill={ink} />
      {/* Head nodule under copper triangle */}
      <Polygon points="50,30.5 53,35 50,38.5 47,35" fill={ink} />
    </Svg>
  );
}
