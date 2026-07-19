import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { ScoreWings } from '../components/ScoreWings';
import { PressScale } from '../components/PressScale';
import { Pressable } from 'react-native';

interface Props {
  scoreDisplay: number;
  lastFight: string;
  lastLoc: string;
  onAddDetails: () => void;
  onSkip: () => void;
}

export function CatchScoreScreen({ scoreDisplay, lastFight, lastLoc, onAddDetails, onSkip }: Props) {
  const scoreScale = useRef(new Animated.Value(0.92)).current;
  const scoreOpacity = useRef(new Animated.Value(0)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scoreScale, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(scoreOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
    Animated.parallel([
      Animated.timing(statsOpacity, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
      Animated.timing(statsY, { toValue: 0, duration: 600, delay: 300, useNativeDriver: true }),
    ]).start();
  }, [scoreScale, scoreOpacity, statsOpacity, statsY]);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Your Catch Score</Text>
      <View style={styles.center}>
        <View style={styles.wingsWrap} pointerEvents="none">
          <ScoreWings />
        </View>
        <Animated.View style={{ opacity: scoreOpacity, transform: [{ scale: scoreScale }], alignItems: 'center' }}>
          <Text style={styles.score}>{scoreDisplay}</Text>
          <Text style={styles.scoreLabel}>Catch Score</Text>
        </Animated.View>
      </View>
      <Animated.View style={[styles.statsRow, { opacity: statsOpacity, transform: [{ translateY: statsY }] }]}>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Fight Time</Text>
          <Text style={styles.statValue}>{lastFight}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Location</Text>
          <Text style={styles.statValueBody}>{lastLoc}</Text>
        </View>
      </Animated.View>
      <PressScale onPress={onAddDetails} style={styles.addButton} activeScale={0.98}>
        <Text style={styles.addLabel}>Add Catch Details</Text>
      </PressScale>
      <Pressable onPress={onSkip} style={styles.skipButton}>
        <Text style={styles.skipLabel}>Skip and save to Journey</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 22,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  center: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wingsWrap: {
    position: 'absolute',
  },
  score: {
    fontFamily: fonts.displayBold,
    fontSize: 112,
    lineHeight: 101,
    color: colors.navy,
  },
  scoreLabel: {
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: colors.copper,
    marginTop: 6,
    fontFamily: fonts.bodySemiBold,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 22,
  },
  statCol: {
    alignItems: 'center',
    paddingHorizontal: 26,
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.missing,
  },
  statValue: {
    fontFamily: fonts.monoRegular,
    fontSize: 16,
    color: colors.navy,
    marginTop: 4,
  },
  statValueBody: {
    fontSize: 14,
    color: colors.navy,
    fontFamily: fonts.bodyMedium,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  addButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.copper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
  },
  skipButton: {
    marginTop: 14,
  },
  skipLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
  },
});
