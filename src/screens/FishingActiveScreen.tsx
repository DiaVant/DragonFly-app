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
  /** Live BLE tension sample (null while waiting). */
  currentTension?: number | null;
  receiving: boolean;
  onLandFish: () => void;
  onLoseFish: () => void;
  awaitingEnd?: boolean;
  stopping?: boolean;
  simulated?: boolean;
  gearLabel?: string;
}

/**
 * Live fight — fixed vertical slots so coaching updates never shove the layout.
 * Soft peach / sage accents within the style guide.
 */
export function FishingActiveScreen({
  location,
  elapsed,
  samples,
  sampleCount,
  currentTension,
  receiving,
  onLandFish,
  onLoseFish,
  awaitingEnd,
  stopping,
  simulated,
  gearLabel,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const phone = winW < 430;
  const pad = phone ? spacing.screenNarrow : spacing.screen;
  const gaugeSize = phone ? 152 : 172;

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
  const latest =
    currentTension != null
      ? currentTension
      : samples.length
        ? samples[samples.length - 1]!
        : null;
  const baseline = coaching.baseline;

  const drag = dragAdvice.value;
  const dragPct = Math.max(0, Math.min(1, (drag - 1) / 9));
  const dragLabel = dragAdvice.label;

  useEffect(() => {
    Animated.timing(dragAnim, {
      toValue: dragPct,
      duration: 220,
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
                ? 'Ending…'
                : simulated
                  ? 'Practice'
                  : receiving
                    ? 'Connected'
                    : 'Listening'
            }
            tone={waiting ? 'caution' : simulated ? 'info' : 'ok'}
          />
          <Text style={styles.timer} accessibilityLabel={`Fight time ${fmtElapsed(elapsed)}`}>
            {fmtElapsed(elapsed)}
          </Text>
          <View style={styles.topRight}>
            {gearLabel ? (
              <Text style={styles.gear} numberOfLines={1}>
                {gearLabel}
              </Text>
            ) : null}
            <Text style={styles.location} numberOfLines={1}>
              {location}
            </Text>
          </View>
        </View>

        <View style={styles.coachSlot}>
          <CoachingCard coaching={coaching} />
        </View>

        <View style={styles.gaugeSlot}>
          <TensionGauge
            value={latest}
            baseline={baseline}
            size={gaugeSize}
            label="Live tension"
            accent="slateBlue"
          />
        </View>

        <View style={styles.trendSlot}>
          <TensionChart
            samples={chartSamples}
            live
            height={84}
            label="Tension Over Time"
            caption={`${sampleCount} samples`}
          />
        </View>

        <View
          style={styles.dragBlock}
          accessibilityLabel={`Drag coach ${dragLabel}. ${dragAdvice.reason}`}
        >
          <View style={styles.dragHeader}>
            <Text style={styles.dragTitle}>Drag</Text>
            <Text style={styles.dragValue}>{dragLabel}</Text>
          </View>
          <View style={styles.dragTrack}>
            <Animated.View style={[styles.dragFill, { width: dragFillWidth }]} />
            <Animated.View style={[styles.dragKnob, { left: dragKnobLeft }]} />
          </View>
          <Text style={styles.dragReason} numberOfLines={2}>
            {dragAdvice.reason}
          </Text>
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
    backgroundColor: '#F7F3EF',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingTop: 10,
  },
  top: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
    position: 'relative',
  },
  topRight: { flex: 1, alignItems: 'flex-end' },
  gear: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.slateBlue,
    marginBottom: 2,
    maxWidth: '100%',
  },
  location: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  timer: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.monoRegular,
    fontSize: 15,
    lineHeight: 15,
    color: colors.navy,
  },
  coachSlot: {
    height: 148,
    marginBottom: 20,
  },
  gaugeSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dragBlock: {
    height: 88,
    gap: 5,
    backgroundColor: '#FFF9F4',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(184,116,68,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
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
    color: colors.textSecondary,
  },
  dragValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.copper,
  },
  dragTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(184,116,68,0.12)',
    overflow: 'visible',
    justifyContent: 'center',
  },
  dragFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.copper,
  },
  dragKnob: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFF9F4',
    marginLeft: -7,
    borderWidth: 2,
    borderColor: colors.copper,
  },
  dragReason: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    lineHeight: 14,
    height: 28,
    color: colors.textSecondary,
  },
  trendSlot: {
    height: 116,
    marginBottom: 20,
  },
  footer: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingTop: 10,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(184,116,68,0.14)',
    backgroundColor: '#F7F3EF',
  },
  land: {
    minHeight: 52,
    borderRadius: radii.lg,
  },
  lose: {
    minHeight: 44,
  },
});
