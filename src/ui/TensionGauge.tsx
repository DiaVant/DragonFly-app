import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, fonts } from '../theme';

interface Props {
  /** Relative tension index (unitless). */
  value: number | null;
  /** Optional baseline for normalizing the gauge fill. */
  baseline?: number | null;
  label?: string;
  dark?: boolean;
  /** Diameter in px. Default 148; use ~108 on phones. */
  size?: number;
  /** Arc + value color. Defaults to copper. */
  accent?: 'copper' | 'slateBlue';
}

export function TensionGauge({
  value,
  baseline,
  label = 'Relative tension',
  dark,
  size = 148,
  accent = 'copper',
}: Props) {
  const progress = useMemo(() => {
    if (value == null) return 0;
    const base = baseline && baseline > 0 ? baseline : 50;
    const ratio = value / base;
    return Math.max(0, Math.min(1, (ratio - 0.5) / 1.2));
  }, [value, baseline]);

  const stroke = Math.max(7, Math.round(size * 0.068));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arcLen = c * 0.75;
  const strokeDashoffset = arcLen * (1 - progress);

  const display = value == null ? '—' : value.toFixed(0);
  const accentTrack = accent === 'slateBlue' ? 'rgba(75,106,136,0.16)' : 'rgba(184,116,68,0.16)';
  const track = dark ? 'rgba(255,255,255,0.12)' : accentTrack;
  const fg = dark ? colors.copperSoft : accent === 'slateBlue' ? colors.slateBlue : colors.copper;
  const textColor = dark ? colors.textOnDark : colors.navy;
  const muted = dark ? colors.textOnDarkSecondary : colors.slateBlue;
  const cx = size / 2;
  const cy = size / 2;
  const valueSize = Math.round(size * 0.24);
  const showLabel = size >= 100;

  return (
    <View style={styles.wrap} accessibilityLabel={`${label}: ${display}`}>
      {showLabel ? <Text style={[styles.label, { color: muted }]}>{label}</Text> : null}
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <G transform={`rotate(135 ${cx} ${cy})`}>
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              stroke={track}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${arcLen} ${c}`}
              strokeLinecap="round"
            />
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              stroke={fg}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${arcLen} ${c}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <View style={styles.center}>
          <Text style={[styles.value, { color: textColor, fontSize: valueSize, lineHeight: valueSize + 4 }]}>
            {display}
          </Text>
          <Text style={[styles.indexLabel, { color: muted }]}>newtons</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  value: {
    fontFamily: fonts.displaySemiBold,
  },
  indexLabel: {
    fontFamily: fonts.monoRegular,
    fontSize: 10,
    marginTop: 1,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    marginBottom: 8,
  },
});
