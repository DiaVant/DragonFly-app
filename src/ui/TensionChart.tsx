import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors, fonts } from '../theme';

interface Props {
  samples: number[];
  dark?: boolean;
  height?: number;
  label?: string;
  caption?: string;
  /** Prefer a stable Y domain so live oscillation is visible. */
  live?: boolean;
}

export function TensionChart({
  samples,
  dark,
  height = 88,
  label = 'Relative tension trend',
  caption,
  live,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const fallback = Math.min(windowWidth - 40, 440);
  const width = measuredWidth > 0 ? measuredWidth : fallback;
  const fillId = live ? 'tensionFillLive' : 'tensionFill';

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.floor(e.nativeEvent.layout.width);
    if (w > 0 && w !== measuredWidth) setMeasuredWidth(w);
  };

  const { line, area, tip } = useMemo(
    () => buildPaths(samples, width, height, live),
    [samples, width, height, live]
  );

  const stroke = dark ? colors.copperSoft : colors.copper;
  const muted = dark ? colors.textOnDarkSecondary : colors.textMuted;
  const empty = samples.length < 2;
  const captionText = caption ?? 'Unitless relative index — not calibrated force';

  return (
    <View style={styles.wrap} accessibilityLabel={label} onLayout={onLayout}>
      <Text style={[styles.label, live && dark && styles.labelLive, { color: live ? colors.copper : muted }]}>
        {label}
      </Text>
      {empty ? (
        <View style={[styles.empty, { height, borderColor: dark ? 'rgba(255,255,255,0.12)' : colors.border }]}>
          <Text style={[styles.emptyText, { color: muted }]}>Trend appears as samples arrive</Text>
        </View>
      ) : (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={stroke} stopOpacity={dark ? 0.35 : 0.22} />
              <Stop offset="1" stopColor={stroke} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={area} fill={`url(#${fillId})`} />
          <Path
            d={line}
            stroke={stroke}
            strokeWidth={live ? 2.2 : 2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {tip ? <Circle cx={tip.x} cy={tip.y} r={live ? 3.5 : 3} fill={stroke} /> : null}
        </Svg>
      )}
      {captionText ? <Text style={[styles.caption, { color: muted }]}>{captionText}</Text> : null}
    </View>
  );
}

function buildPaths(
  samples: number[],
  width: number,
  height: number,
  live?: boolean
): { line: string; area: string; tip: { x: number; y: number } | null } {
  if (samples.length < 2 || width < 8) return { line: '', area: '', tip: null };

  const dataMin = Math.min(...samples);
  const dataMax = Math.max(...samples);
  let min: number;
  let max: number;
  if (live) {
    const mid = (dataMin + dataMax) / 2;
    min = Math.min(22, dataMin - 4, mid - 22);
    max = Math.max(88, dataMax + 4, mid + 22);
  } else {
    min = dataMin;
    max = dataMax;
  }
  const span = Math.max(max - min, 8);
  const padY = 6;
  const usableH = height - padY * 2;

  const points = samples.map((v, i) => {
    const x = (i / (samples.length - 1)) * (width - 2) + 1;
    const y = padY + (1 - (v - min) / span) * usableH;
    return { x, y };
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const first = points[0]!;
  const last = points[points.length - 1]!;
  const area = `${line} L${last.x.toFixed(1)},${height} L${first.x.toFixed(1)},${height} Z`;
  return { line, area, tip: last };
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 4 },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
  },
  labelLive: {
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.2,
  },
  caption: {
    fontFamily: fonts.bodyRegular,
    fontSize: 10,
  },
  empty: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
  },
});
