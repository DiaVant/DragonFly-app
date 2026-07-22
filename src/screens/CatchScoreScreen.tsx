import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Screen, PrimaryButton, SecondaryButton, Metric, TensionChart } from '../ui';
import { ScoreWings } from '../components/ScoreWings';
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

/** Landed-catch celebration + short quant coaching. Lost fights use FightLostScreen. */
export function CatchScoreScreen({
  scoreDisplay,
  catchItem,
  aiReviewStatus = 'idle',
  onAddDetails,
  onSkip,
}: Props) {
  const scoreScale = useRef(new Animated.Value(0.92)).current;
  const scoreOpacity = useRef(new Animated.Value(0)).current;
  const reviewing = aiReviewStatus === 'loading';
  const scoreReady = !reviewing && (catchItem?.scoreSource === 'openai' || aiReviewStatus === 'fallback' || aiReviewStatus === 'error' || aiReviewStatus === 'ready' || aiReviewStatus === 'idle');

  useEffect(() => {
    if (reviewing) return;
    scoreScale.setValue(0.92);
    scoreOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(scoreScale, { toValue: 1, duration: motion.scoreReveal, useNativeDriver: true }),
      Animated.timing(scoreOpacity, { toValue: 1, duration: motion.scoreReveal, useNativeDriver: true }),
    ]).start();
  }, [scoreScale, scoreOpacity, reviewing, catchItem?.scoreSource, catchItem?.score]);

  const hasSamples = (catchItem?.sampleCount ?? 0) > 0 || (catchItem?.relativeTensionSeries?.length ?? 0) > 0;
  const series = catchItem?.relativeTensionSeries ?? [];
  const hasAiMetrics =
    catchItem?.consistencyIndex != null &&
    catchItem?.controlIndex != null &&
    catchItem?.recoveryIndex != null;

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <View style={styles.heroSurface}>
          <View style={styles.scoreCluster}>
            <View style={styles.wingsWrap} pointerEvents="none">
              <ScoreWings size={260} />
            </View>
            {reviewing || !scoreReady ? (
              <Text style={styles.scorePending}>···</Text>
            ) : (
              <Animated.View style={{ opacity: scoreOpacity, transform: [{ scale: scoreScale }], alignItems: 'center' }}>
                <Text style={styles.score}>{scoreDisplay}</Text>
              </Animated.View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric label="Fight" value={catchItem ? formatFight(catchItem.fightSeconds) : '—'} mono />
        <Metric label="Location" value={catchItem?.location || '—'} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fight read</Text>
        {reviewing ? (
          <Text style={styles.body}>Scoring consistency, control, and recovery…</Text>
        ) : hasAiMetrics ? (
          <>
            <View style={styles.indexRow}>
              <IndexStat label="Consistency" value={catchItem!.consistencyIndex!} />
              <IndexStat label="Control" value={catchItem!.controlIndex!} />
              <IndexStat label="Recovery" value={catchItem!.recoveryIndex!} />
            </View>
            <View style={styles.shortNotes}>
              <Text style={styles.noteLabel}>Highlight</Text>
              <Text style={styles.noteValue}>{catchItem?.whatWentWell}</Text>
              <Text style={[styles.noteLabel, { marginTop: 12 }]}>Next tip</Text>
              <Text style={styles.noteValue}>{catchItem?.improvement}</Text>
            </View>
          </>
        ) : hasSamples ? (
          <>
            <View style={styles.shortNotes}>
              <Text style={styles.noteLabel}>Highlight</Text>
              <Text style={styles.noteValue}>{catchItem?.whatWentWell}</Text>
              <Text style={[styles.noteLabel, { marginTop: 12 }]}>Next tip</Text>
              <Text style={styles.noteValue}>{catchItem?.improvement}</Text>
            </View>
            {series.length > 1 ? (
              <View style={styles.chart}>
                <TensionChart samples={series} label="Tension" caption="" />
              </View>
            ) : null}
          </>
        ) : (
          <Text style={styles.body}>Not enough samples for a breakdown. Score still saved.</Text>
        )}
        {hasAiMetrics && series.length > 1 ? (
          <View style={styles.chart}>
            <TensionChart samples={series} label="Tension" caption="" />
          </View>
        ) : null}
      </View>

      <PrimaryButton label="Add catch details" onPress={onAddDetails} style={styles.primary} />
      <SecondaryButton label="Save to Journey" onPress={onSkip} />
    </Screen>
  );
}

function IndexStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.indexStat}>
      <Text style={styles.indexValue}>{value}</Text>
      <Text style={styles.indexLabel}>{label}</Text>
    </View>
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
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.brand,
  },
  heroSurface: {
    backgroundColor: colors.surface,
    minHeight: 340,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  scoreCluster: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wingsWrap: {
    position: 'absolute',
  },
  score: {
    fontFamily: fonts.displayBold,
    fontSize: 88,
    lineHeight: 92,
    color: colors.navy,
    letterSpacing: -2,
  },
  scoreLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.copper,
    marginTop: 8,
  },
  scorePending: {
    fontFamily: fonts.displayBold,
    fontSize: 72,
    lineHeight: 80,
    color: colors.textMuted,
    letterSpacing: 4,
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
    marginBottom: 12,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  indexRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  indexStat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  indexValue: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.navy,
    letterSpacing: -0.5,
  },
  indexLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.slateBlue,
    marginTop: 4,
  },
  shortNotes: {
    marginBottom: 4,
  },
  noteLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.slateBlue,
    marginBottom: 4,
  },
  noteValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
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
