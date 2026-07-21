import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, motion, radii } from '../theme';
import type { CoachingResult } from '../coaching/types';

interface Props {
  coaching: CoachingResult;
  dark?: boolean;
  compact?: boolean;
}

export function CoachingCard({ coaching, dark, compact }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0.4);
    translateY.setValue(6);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: motion.normal, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: motion.normal, useNativeDriver: true }),
    ]).start();
  }, [coaching.id, opacity, translateY]);

  const severityColor =
    coaching.severity === 'alert'
      ? colors.danger
      : coaching.severity === 'caution'
        ? colors.caution
        : coaching.severity === 'ok'
          ? colors.connected
          : dark
            ? colors.lakeSoft
            : colors.lake;

  return (
    <Animated.View
      style={[
        styles.card,
        dark ? styles.cardDark : styles.cardLight,
        compact && styles.cardCompact,
        { opacity, transform: [{ translateY }], borderColor: severityColor },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${coaching.title}. ${coaching.detail}`}
    >
      <View style={[styles.bar, { backgroundColor: severityColor }]} />
      <View style={[styles.content, compact && styles.contentCompact]}>
        <Text style={[styles.kicker, { color: severityColor }]}>Coaching</Text>
        <Text style={[styles.title, dark && styles.titleDark, compact && styles.titleCompact]}>
          {coaching.title}
        </Text>
        <Text
          style={[styles.detail, dark && styles.detailDark, compact && styles.detailCompact]}
          numberOfLines={compact ? 2 : 3}
        >
          {coaching.detail}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardLight: {
    backgroundColor: colors.surface,
  },
  cardDark: {
    backgroundColor: colors.fightPanel,
  },
  cardCompact: {
    borderRadius: radii.md,
  },
  bar: {
    width: 4,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 6,
  },
  contentCompact: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  kicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    color: colors.navy,
  },
  titleCompact: {
    fontSize: 20,
    lineHeight: 26,
  },
  titleDark: {
    color: colors.textOnDark,
  },
  detail: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  detailCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  detailDark: {
    color: colors.textOnDarkSecondary,
  },
});
