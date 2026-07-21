import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, SecondaryButton, TensionGauge, TensionChart, CoachingCard, StatusChip } from '../ui';
import { colors, fonts, layout, radii, spacing } from '../theme';
import { evaluateCoaching } from '../coaching/engine';
import { evaluateDragAdvice, type DragAction } from '../coaching/dragAdvisor';
import type { CoachingStateId } from '../coaching/types';
import { fmtElapsed } from '../lib/format';

interface Props {
  location: string;
  elapsed: number;
  samples: number[];
  sampleCount: number;
  expectedCount: number | null;
  receiving: boolean;
  onLandFish: () => void;
  onLoseFish: () => void;
  awaitingEnd?: boolean;
  stopping?: boolean;
  simulated?: boolean;
}

/**
 * Clean fight layout for iPhone-class screens:
 * status → coaching → gauge/drag → trend → actions.
 * Fixed proportions — no flex-bloated panels.
 */
export function FishingActiveScreen({
  location,
  elapsed,
  samples,
  sampleCount,
  expectedCount,
  receiving,
  onLandFish,
  onLoseFish,
  awaitingEnd,
  stopping,
  simulated,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const phone = winW < 430;
  const pad = phone ? spacing.screenNarrow : spacing.screen;

  const waiting = Boolean(awaitingEnd || stopping);
  const holdRef = useRef<{ id: CoachingStateId; sinceMs: number } | null>(null);
  const dragHoldRef = useRef<{ value: number; action: DragAction; sinceMs: number } | null>(null);
  const [nowMs, setNowMs] = useState(0);
  const dragAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 400);
    return () => clearInterval(id);
  }, []);

  const coaching = useMemo(() => {
    const result = evaluateCoaching(samples, {
      nowMs,
      previous: holdRef.current,
    });
    if (!holdRef.current || holdRef.current.id !== result.id) {
      holdRef.current = { id: result.id, sinceMs: nowMs || Date.now() };
    }
    return result;
  }, [samples, nowMs]);

  const dragAdvice = useMemo(() => {
    const result = evaluateDragAdvice(samples, {
      nowMs: nowMs || Date.now(),
      previous: dragHoldRef.current,
    });
    if (!dragHoldRef.current || dragHoldRef.current.action !== result.action) {
      dragHoldRef.current = {
        value: result.value,
        action: result.action,
        sinceMs: nowMs || Date.now(),
      };
    } else {
      dragHoldRef.current = { ...dragHoldRef.current, value: result.value };
    }
    return result;
  }, [samples, nowMs]);

  const chartSamples = samples.slice(-48);
  const latest = samples.length ? samples[samples.length - 1]! : null;
  const baseline = coaching.baseline;

  const drag = dragAdvice.value;
  const dragPct = Math.max(0, Math.min(1, (drag - 1) / 9));
  const dragLabel = dragAdvice.label;

  useEffect(() => {
    Animated.timing(dragAnim, {
      toValue: dragPct,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [dragPct, dragAnim]);

  const dragFillWidth = dragAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const dragKnobLeft = dragAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root}>
      <View style={[styles.content, { paddingHorizontal: pad }]}>
        <View style={styles.top}>
          <StatusChip
            label={
              waiting
                ? 'Ending fight'
                : simulated
                  ? 'Live simulation'
                  : receiving
                    ? 'Receiving'
                    : 'Listening'
            }
            tone={waiting ? 'caution' : simulated ? 'info' : 'onDark'}
          />
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>

        <CoachingCard coaching={coaching} dark />

        <View style={styles.mid}>
          <TensionGauge value={latest} baseline={baseline} dark size={phone ? 112 : 128} />
          <View style={styles.side}>
            <Text style={styles.timerLabel}>Fight time</Text>
            <Text style={styles.timer} accessibilityLabel={`Elapsed ${fmtElapsed(elapsed)}`}>
              {fmtElapsed(elapsed)}
            </Text>

            <View
              style={styles.dragBlock}
              accessibilityLabel={`Relative drag ${dragLabel}. ${dragAdvice.reason}`}
            >
              <View style={styles.dragHeader}>
                <Text style={styles.dragTitle}>Relative drag</Text>
                <Text style={styles.dragValue}>{dragLabel}</Text>
              </View>
              <View style={styles.dragTrack}>
                <Animated.View style={[styles.dragFill, { width: dragFillWidth }]} />
                <Animated.View style={[styles.dragKnob, { left: dragKnobLeft }]} />
              </View>
              <Text style={styles.dragReason} numberOfLines={2}>
                {dragAdvice.reason}
              </Text>
              <Text style={styles.sampleMeta}>{sampleCount} samples</Text>
            </View>
          </View>
        </View>

        <View style={styles.trend}>
          <TensionChart
            samples={chartSamples}
            dark
            live
            height={72}
            label="Relative tension trend"
            caption={`Live · ${sampleCount} samples`}
          />
        </View>
      </View>

      <View style={[styles.footer, { paddingHorizontal: pad, paddingBottom: Math.max(insets.bottom, 10) }]}>
        <PrimaryButton
          label={waiting ? 'Ending…' : 'Landed'}
          onPress={onLandFish}
          loading={waiting}
          disabled={waiting}
          variant="copper"
          style={styles.land}
          accessibilityHint="Ends the fight as a landed catch and opens coaching review"
        />
        <SecondaryButton
          label={waiting ? '…' : "Didn't land"}
          onPress={onLoseFish}
          disabled={waiting}
          tone="onDark"
          style={styles.lose}
          accessibilityHint="Ends the fight without a catch — saves coaching so you can learn from the mistake"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.fightBg,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingTop: 10,
    gap: 14,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  location: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textOnDarkSecondary,
  },
  mid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  side: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  timerLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textOnDarkSecondary,
  },
  timer: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 36,
    lineHeight: 40,
    color: colors.textOnDark,
    marginBottom: 8,
  },
  dragBlock: {
    gap: 6,
  },
  dragHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  dragTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textOnDarkSecondary,
  },
  dragValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.lakeSoft,
  },
  dragTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'visible',
    justifyContent: 'center',
  },
  dragFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lakeSoft,
  },
  dragKnob: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.textOnDark,
    marginLeft: -7,
    borderWidth: 2,
    borderColor: colors.lakeSoft,
  },
  dragReason: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 2,
  },
  sampleMeta: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.textOnDarkSecondary,
  },
  trend: {
    marginTop: 2,
  },
  footer: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingTop: 10,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  land: {
    minHeight: 52,
    borderRadius: radii.md,
  },
  lose: {
    minHeight: 44,
  },
});
