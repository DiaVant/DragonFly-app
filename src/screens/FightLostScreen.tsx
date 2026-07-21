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
 * Dedicated post-fight screen when the fish got away.
 * Focus: diagnose the mistake, keep the learning in Journey.
 */
export function FightLostScreen({
  catchItem,
  aiReviewStatus = 'idle',
  onSaveNotes,
  onSaveToJourney,
  onTryAgain,
}: Props) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: motion.scoreReveal,
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const series = catchItem?.relativeTensionSeries ?? [];
  const hasSamples = (catchItem?.sampleCount ?? 0) > 0 || series.length > 0;
  const chipLabel =
    aiReviewStatus === 'loading' ? 'AI reviewing' : "Didn't land";
  const scoreLabel =
    catchItem?.scoreSource === 'openai' || aiReviewStatus === 'loading' ? 'Coach score' : 'Tension index';
  const panelKicker =
    aiReviewStatus === 'loading'
      ? 'AI coach reviewing'
      : catchItem?.scoreSource === 'openai'
        ? 'AI coach read'
        : 'What likely happened';

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

        <Text style={styles.title}>The fish got away</Text>
        <Text style={styles.lead}>
          That still counts. Save it to Journey — beginners improve by reviewing losses, not ignoring them.
        </Text>

        <View style={styles.metaRow}>
          <Metric
            label="Fight"
            value={catchItem ? fmtElapsed(catchItem.fightSeconds) : '—'}
            mono
          />
          <Metric label={scoreLabel} value={catchItem ? String(catchItem.score) : '—'} emphasize />
          <Metric label="Location" value={catchItem?.location || '—'} />
        </View>

        {catchItem?.scoreRationale && catchItem.scoreSource === 'openai' ? (
          <Text style={styles.rationale}>{catchItem.scoreRationale}</Text>
        ) : null}

        <View style={styles.panel}>
          <Text style={styles.panelKicker}>{panelKicker}</Text>
          <Text style={styles.panelBody}>
            {aiReviewStatus === 'loading'
              ? 'Pulling a post-fight read from your relative tension samples…'
              : catchItem?.coachingSummary ??
                'Not enough samples to diagnose this loss in detail — still worth saving the attempt.'}
          </Text>
        </View>

        <View style={styles.fixBlock}>
          <Text style={styles.fixLabel}>Fix this next time</Text>
          <Text style={styles.fixBody}>
            {catchItem?.improvement ??
              'Stay smoother on the reel and keep steady rod pressure when tension shifts.'}
          </Text>
        </View>

        {hasSamples && catchItem?.whatWentWell ? (
          <View style={styles.keepBlock}>
            <Text style={styles.keepLabel}>Still worth keeping</Text>
            <Text style={styles.keepBody}>{catchItem.whatWentWell}</Text>
          </View>
        ) : null}

        {series.length > 1 ? (
          <View style={styles.chart}>
            <TensionChart samples={series} label="Where the fight shifted" />
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
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: -8,
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderFaint,
  },
  panel: {
    backgroundColor: 'rgba(196,135,42,0.1)',
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(196,135,42,0.22)',
  },
  panelKicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.caution,
    marginBottom: 8,
  },
  panelBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.navy,
  },
  fixBlock: {
    marginBottom: 18,
  },
  fixLabel: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    letterSpacing: -0.3,
    color: colors.navy,
    marginBottom: 8,
  },
  fixBody: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  keepBlock: {
    marginBottom: 18,
  },
  keepLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.slateBlue,
    marginBottom: 6,
  },
  keepBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
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
