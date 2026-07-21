import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors, fonts, radii } from '../theme';

type Tone = 'neutral' | 'ok' | 'caution' | 'alert' | 'info' | 'onDark';

interface Props {
  label: string;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}

const TONE: Record<Tone, { bg: string; fg: string; border: string }> = {
  neutral: { bg: 'rgba(21,37,54,0.05)', fg: colors.textSecondary, border: 'transparent' },
  ok: { bg: 'rgba(143,168,154,0.18)', fg: '#5F7A6C', border: 'transparent' },
  caution: { bg: 'rgba(184,116,68,0.14)', fg: colors.caution, border: 'transparent' },
  alert: { bg: 'rgba(192,69,58,0.12)', fg: colors.danger, border: 'transparent' },
  info: { bg: 'rgba(75,106,136,0.14)', fg: colors.slateBlue, border: 'transparent' },
  onDark: { bg: 'rgba(27,42,65,0.08)', fg: colors.textSecondary, border: 'transparent' },
};

export function StatusChip({ label, tone = 'neutral', style }: Props) {
  const t = TONE[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg, borderColor: t.border }, style]} accessibilityRole="text">
      <Text style={[styles.label, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
