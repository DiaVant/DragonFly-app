import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Screen, PrimaryButton, SecondaryButton, Metric, TensionChart, StatusChip } from '../ui';
import { colors, fonts, motion, radii } from '../theme';
import type { Catch } from '../types';
import type { AiReviewStatus } from '../hooks/useDragonflyState';
import { fmtElapsed } from '../lib/format';

interface Props {
  catchItem: Catch | null;
  aiReviewStatus?: AiReviewStatus;
  onSaveNotes: () => void;
  onSaveToJourney: () => void;
  onTryAgain?: () => void;
}

/**
 * Post-fight screen when the fish got away — short quant read, one tip.
 */
export function FightLostScreen({
  catchItem,
  aiReviewStatus = 'idle',
  onSaveNotes,
  onSaveToJourney,
  onTryAgain,
}: Props) {
  const enter = useRef(new Animated.Value(0)).current;
  const reviewing = aiReviewStatus === 'loading';
  const hasAiMetrics =
    catchItem?.consistencyIndex != null &&
    catchItem?.controlIndex != null &&
    catchItem?.recoveryIndex != null;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: motion.scoreReveal,
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const series = catchItem?.relativeTensionSeries ?? [];
  const chipLabel = reviewing ? 'Scoring…' : "Didn't land";
  const scoreLabel = reviewing
    ? 'Coach score'
    : catchItem?.scoreSource === 'openai'
      ? 'Coach score'
      : 'Tension index';
  const scoreValue = reviewing
    ? '···'
    : catchItem
      ? String(catchItem.score)
      : '—';

  return (
    <Screen scroll>
      <Animated.View
        style={[
          styles.wrap,
          {
            opacity: enter,
            transform: [
              {
                translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
              },
            ],
          },
        ]}
      >
        <StatusChip label={chipLabel} tone="caution" />

        <Text style={styles.title}>That's okay</Text>
        <Text style={styles.lead}>Save the attempt, track your improvement.</Text>

        <View style={styles.metaRow}>
          <Metric label="Fight" value={catchItem ? fmtElapsed(catchItem.fightSeconds) : '—'} mono />
          <Metric label={scoreLabel} value={scoreValue} emphasize />
          <Metric label="Location" value={catchItem?.location || '—'} />
        </View>

        {reviewing ? (
          <Text style={styles.rationale}>Reading consistency, control, recovery…</Text>
        ) : hasAiMetrics ? (
          <View style={styles.indexRow}>
            <IndexStat label="Consistency" value={catchItem!.consistencyIndex!} />
            <IndexStat label="Control" value={catchItem!.controlIndex!} />
            <IndexStat label="Recovery" value={catchItem!.recoveryIndex!} />
          </View>
        ) : null}

        {!reviewing && catchItem?.scoreRationale && catchItem.scoreSource === 'openai' ? (
          <Text style={styles.rationale}>{catchItem.scoreRationale}</Text>
        ) : null}

        <View style={styles.fixBlock}>
          <Text style={styles.fixLabel}>Improvement Tip </Text>
          <Text style={styles.fixBody}>
            {reviewing
              ? '…'
              : catchItem?.improvement ?? 'Ease earlier when tension spikes.'}
          </Text>
        </View>

        {!reviewing && catchItem?.whatWentWell ? (
          <View style={styles.keepBlock}>
            <Text style={styles.keepLabel}>Highlight</Text>
            <Text style={styles.keepBody}>{catchItem.whatWentWell}</Text>
          </View>
        ) : null}

        {series.length > 1 ? (
          <View style={styles.chart}>
            <TensionChart samples={series} label="Tension" />
          </View>
        ) : null}

        <PrimaryButton label="Save to Journey" onPress={onSaveToJourney} style={styles.primary} />
        <SecondaryButton label="Add a note first" onPress={onSaveNotes} />
        {onTryAgain ? (
          <SecondaryButton label="Fish On again" onPress={onTryAgain} style={styles.again} />
        ) : null}
      </Animated.View>
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

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 34,
    letterSpacing: -0.8,
    color: colors.navy,
    marginTop: 16,
    lineHeight: 40,
  },
  lead: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 22,
  },
  rationale: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.navy,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderFaint,
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  indexValue: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.navy,
  },
  indexLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.slateBlue,
    marginTop: 2,
  },
  fixBlock: {
    marginBottom: 16,
  },
  fixLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.slateBlue,
    marginBottom: 4,
  },
  fixBody: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  keepBlock: {
    marginBottom: 16,
  },
  keepLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.slateBlue,
    marginBottom: 4,
  },
  keepBody: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.navy,
  },
  chart: {
    marginBottom: 22,
  },
  primary: {
    marginBottom: 10,
  },
  again: {
    marginTop: 4,
  },
});
