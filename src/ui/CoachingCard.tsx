import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../theme';
import type { CoachingResult } from '../coaching/types';

interface Props {
  coaching: CoachingResult;
  dark?: boolean;
  compact?: boolean;
}

/** Fixed-height coaching card — no bounce animation when advice updates. */
export function CoachingCard({ coaching, dark, compact }: Props) {
  const severityColor =
    coaching.severity === 'alert'
      ? colors.danger
      : coaching.severity === 'caution'
        ? colors.copper
        : coaching.severity === 'ok'
          ? colors.sage
          : colors.slateBlue;

  return (
    <View
      style={[
        styles.card,
        dark ? styles.cardDark : styles.cardLight,
        compact && styles.cardCompact,
        { borderColor: severityColor },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${coaching.title}. ${coaching.detail}`}
    >
      <View style={[styles.bar, { backgroundColor: severityColor }]} />
      <View style={[styles.content, compact && styles.contentCompact]}>
        <Text style={[styles.kicker, { color: severityColor }]}>Coaching</Text>
        <Text
          style={[styles.title, dark && styles.titleDark, compact && styles.titleCompact]}
          numberOfLines={2}
        >
          {coaching.title}
        </Text>
        <Text
          style={[styles.detail, dark && styles.detailDark, compact && styles.detailCompact]}
          numberOfLines={compact ? 2 : 3}
        >
          {coaching.detail}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 148,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardLight: {
    backgroundColor: '#FFF9F4',
  },
  cardDark: {
    backgroundColor: colors.fightPanel,
  },
  cardCompact: {
    height: 112,
    borderRadius: radii.lg,
  },
  bar: {
    width: 5,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    justifyContent: 'center',
    gap: 5,
  },
  contentCompact: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  kicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.4,
    color: colors.navy,
    minHeight: 60,
  },
  titleCompact: {
    fontSize: 18,
    lineHeight: 22,
    minHeight: 44,
  },
  titleDark: {
    color: colors.textOnDark,
  },
  detail: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    minHeight: 40,
  },
  detailCompact: {
    fontSize: 12,
    lineHeight: 16,
    minHeight: 32,
  },
  detailDark: {
    color: colors.textOnDarkSecondary,
  },
});
