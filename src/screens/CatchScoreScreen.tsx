import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, PrimaryButton, SecondaryButton, Metric, TensionChart, StatusChip } from '../ui';
import { colors, fonts, motion, radii, shadows } from '../theme';
import type { Catch } from '../types';
import type { AiReviewStatus } from '../hooks/useDragonflyState';

interface Props {
  scoreDisplay: number;
  catchItem: Catch | null;
  aiReviewStatus?: AiReviewStatus;
  onAddDetails: () => void;
  onSkip: () => void;
}

/** Landed-catch celebration + coaching summary. Lost fights use FightLostScreen. */
export function CatchScoreScreen({
  scoreDisplay,
  catchItem,
  aiReviewStatus = 'idle',
  onAddDetails,
  onSkip,
}: Props) {
  const scoreScale = useRef(new Animated.Value(0.92)).current;
  const scoreOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scoreScale.setValue(0.92);
    scoreOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(scoreScale, { toValue: 1, duration: motion.scoreReveal, useNativeDriver: true }),
      Animated.timing(scoreOpacity, { toValue: 1, duration: motion.scoreReveal, useNativeDriver: true }),
    ]).start();
  }, [scoreScale, scoreOpacity, catchItem?.scoreSource, catchItem?.score]);

  const hasSamples = (catchItem?.sampleCount ?? 0) > 0 || (catchItem?.relativeTensionSeries?.length ?? 0) > 0;
  const series = catchItem?.relativeTensionSeries ?? [];
  const chipLabel =
    aiReviewStatus === 'loading'
      ? 'AI reviewing'
      : catchItem?.scoreSource === 'openai'
        ? 'AI coach scored'
        : 'Catch scored';
  const scoreHint =
    aiReviewStatus === 'loading'
      ? 'AI coach is reviewing your fight…'
      : catchItem?.scoreSource === 'openai'
        ? catchItem.scoreRationale || 'Scored by AI coach from relative tension control'
        : aiReviewStatus === 'error'
          ? 'AI unavailable — averaged from sensor samples'
          : 'Averaged from DragonFly 1.0 samples';

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <LinearGradient
          colors={['#1A3348', '#0F1C2A', '#152536']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.heroGradient}
        >
          <StatusChip label={chipLabel} tone="ok" />
          <Text style={styles.eyebrow}>Catch score</Text>
          <Animated.View style={{ opacity: scoreOpacity, transform: [{ scale: scoreScale }] }}>
            <Text style={styles.score}>{scoreDisplay}</Text>
          </Animated.View>
          <Text style={styles.scoreHint}>{scoreHint}</Text>
        </LinearGradient>
      </View>

      <View style={styles.metrics}>
        <Metric label="Fight" value={catchItem ? formatFight(catchItem.fightSeconds) : '—'} mono />
        <Metric label="Location" value={catchItem?.location || '—'} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coaching notes</Text>
        {hasSamples ? (
          <>
            <Text style={styles.body}>{catchItem?.coachingSummary ?? 'Fight captured.'}</Text>
            <View style={styles.bullets}>
              <Text style={styles.bulletLabel}>What went well</Text>
              <Text style={styles.body}>{catchItem?.whatWentWell}</Text>
              <Text style={[styles.bulletLabel, { marginTop: 14 }]}>One improvement</Text>
              <Text style={styles.body}>{catchItem?.improvement}</Text>
            </View>
            {series.length > 1 ? (
              <View style={styles.chart}>
                <TensionChart samples={series} label="Tension consistency" />
              </View>
            ) : null}
          </>
        ) : (
          <Text style={styles.body}>
            Not enough tension samples were stored to build a coaching breakdown. Your catch score was still saved.
          </Text>
        )}
      </View>

      <Text style={styles.journeyHint}>You’ll save this catch to Journey next.</Text>

      <PrimaryButton label="Add catch details" onPress={onAddDetails} style={styles.primary} />
      <SecondaryButton label="Save to Journey" onPress={onSkip} />
    </Screen>
  );
}

function formatFight(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 22,
    ...shadows.brand,
  },
  heroGradient: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 8,
  },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.copperSoft,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  score: {
    fontFamily: fonts.displayBold,
    fontSize: 96,
    lineHeight: 100,
    color: colors.copperSoft,
    letterSpacing: -2,
  },
  scoreHint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textOnDarkSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  metrics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderFaint,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.navy,
    marginBottom: 10,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bullets: {
    marginTop: 14,
    paddingVertical: 4,
  },
  bulletLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.slateBlue,
    marginBottom: 6,
  },
  chart: { marginTop: 16 },
  journeyHint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 14,
  },
  primary: { marginBottom: 10 },
});
