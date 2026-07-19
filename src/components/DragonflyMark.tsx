import React, { useMemo } from 'react';
import Svg, { Line, Polygon } from 'react-native-svg';

interface Props {
  size?: number;
  tone?: 'dark' | 'light';
  opacity?: number;
}

export function DragonflyMark({ size = 30, tone = 'dark', opacity = 1 }: Props) {
  const ink = tone === 'light' ? '#EDF1F1' : '#1B2A41';
  const faint = tone === 'light' ? 'rgba(237,241,241,.35)' : 'rgba(27,42,65,.30)';
  const copper = '#B87444';

  const ticks = useMemo(() => {
    const N = 48;
    const out = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * 6.283185 - 1.570796;
      const major = i % 4 === 0;
      const r1 = 45;
      const r2 = major ? 34 : 39;
      const top = i === 0;
      out.push({
        x1: 50 + Math.cos(a) * r1, y1: 50 + Math.sin(a) * r1,
        x2: 50 + Math.cos(a) * r2, y2: 50 + Math.sin(a) * r2,
        color: top ? copper : major ? ink : faint,
        w: top ? 2.4 : major ? 1.4 : 1,
      });
    }
    return out;
  }, [ink, faint]);

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={opacity}>
      {ticks.map((t, i) => (
        <Line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.color} strokeWidth={t.w} strokeLinecap="round" />
      ))}
      <Line x1={50} y1={43} x2={50} y2={73} stroke={ink} strokeWidth={3.2} strokeLinecap="round" />
      <Polygon points="50,36 53.5,42 50,47 46.5,42" fill={ink} />
      <Line x1={50} y1={50} x2={27} y2={43} stroke={ink} strokeWidth={3} strokeLinecap="round" />
      <Line x1={50} y1={54} x2={30} y2={57} stroke={ink} strokeWidth={3} strokeLinecap="round" />
      <Line x1={50} y1={50} x2={73} y2={43} stroke={ink} strokeWidth={3} strokeLinecap="round" />
      <Line x1={50} y1={54} x2={70} y2={57} stroke={ink} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}
