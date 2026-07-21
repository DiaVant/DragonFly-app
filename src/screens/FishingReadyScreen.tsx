import React, { useRef } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Screen, PrimaryButton, StatusChip, DeviceStatus } from '../ui';
import { colors, fonts, radii, touchTarget } from '../theme';
import { AnimatedDragonflyStage } from '../components/AnimatedDragonflyStage';
import type { FishOnOrigin } from '../components/FishOnExpand';
import { HARDWARE_NAME } from '../lib/product';
import type { BleConnectionStatus } from '../types';

interface Props {
  location: string;
  connectionStatus: BleConnectionStatus;
  onOpenLocation: () => void;
  /** Start fight / navigate with expand burst origin (mark or Fish On CTA). */
  onFishOn: (origin: FishOnOrigin) => void;
  /** Practice without hardware — also expands from the CTA. */
  onSimulateFight?: (origin: FishOnOrigin) => void;
  onConnect?: () => void;
  connecting?: boolean;
  error?: string | null;
  gearLabel?: string;
  onEditGear?: () => void;
}

export function FishingReadyScreen({
  location,
  connectionStatus,
  onOpenLocation,
  onFishOn,
  onSimulateFight,
  onConnect,
  connecting,
  error,
  gearLabel,
  onEditGear,
}: Props) {
  const connected = connectionStatus === 'connected';
  const busy = Boolean(connecting);
  const markRef = useRef<View>(null);
  const ctaRef = useRef<View>(null);

  const measureAnd = (from: 'mark' | 'cta', fn: (origin: FishOnOrigin) => void) => {
    const node = from === 'mark' ? markRef.current : ctaRef.current;
    node?.measureInWindow((x, y, width, height) => {
      const size = Math.max(width, height, 72);
      fn({
        x: x + (width - size) / 2,
        y: y + (height - size) / 2,
        size,
      });
    });
  };

  return (
    <Screen scroll contentStyle={styles.screenContent}>
      <View style={styles.topRow}>
        <Text style={styles.kicker}>Ready</Text>
        <StatusChip
          label={connected ? `${HARDWARE_NAME} ready` : busy ? 'Connecting…' : 'No sensor'}
          tone={connected ? 'ok' : busy ? 'caution' : error ? 'alert' : 'neutral'}
        />
      </View>

      <Pressable
        style={styles.locationRow}
        onPress={onOpenLocation}
        accessibilityRole="button"
        accessibilityLabel={`Location ${location}. Change location`}
      >
        <Text style={styles.locationLabel}>On the water at</Text>
        <Text style={styles.locationValue} numberOfLines={2}>
          {location}
        </Text>
        <Text style={styles.locationAction}>Change</Text>
      </Pressable>

      <Pressable
        onPress={() => measureAnd('mark', onFishOn)}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={connected ? 'Fish On' : 'Open Fish On options'}
        style={styles.stage}
      >
        <View ref={markRef} collapsable={false} style={styles.stageHit}>
          <AnimatedDragonflyStage size={72} />
        </View>
      </Pressable>

      <Text style={styles.headline}>Fish On</Text>
      <Text style={styles.subhead}>
        Tap the dragonfly or Fish On when the fish takes. {HARDWARE_NAME} coaches pressure in real time.
      </Text>
      <Text style={styles.footnote}>Relative tension — not calibrated pounds.</Text>

      {!connected ? (
        <View style={styles.deviceWrap}>
          <DeviceStatus
            status={connectionStatus}
            connecting={busy}
            error={error}
            onConnect={onConnect}
            compact
          />
        </View>
      ) : null}

      {gearLabel ? (
        <Pressable onPress={onEditGear} style={styles.gearRow} accessibilityRole="button">
          <Text style={styles.gearLabel}>Calibrated for</Text>
          <Text style={styles.gearValue}>{gearLabel}</Text>
          <Text style={styles.gearEdit}>Change</Text>
        </Pressable>
      ) : onEditGear ? (
        <Pressable onPress={onEditGear} style={styles.gearRow} accessibilityRole="button">
          <Text style={styles.gearValue}>Set rod & line for {HARDWARE_NAME}</Text>
          <Text style={styles.gearEdit}>Set up</Text>
        </Pressable>
      ) : null}

      <View style={styles.ctaBlock}>
        {connected ? (
          <View ref={ctaRef} collapsable={false}>
            <PrimaryButton
              label={busy ? 'Starting…' : 'Fish On'}
              onPress={() => measureAnd('cta', onFishOn)}
              loading={busy}
              disabled={busy}
              style={styles.fishOn}
              accessibilityHint={`Starts the fight and listens to ${HARDWARE_NAME}`}
            />
          </View>
        ) : (
          <View ref={ctaRef} collapsable={false}>
            <PrimaryButton
              label="Practice without hardware"
              onPress={() => {
                if (!onSimulateFight) return;
                measureAnd('cta', onSimulateFight);
              }}
              variant="ghost"
              disabled={busy || !onSimulateFight}
              accessibilityHint="Live simulation with coaching — no hardware"
            />
          </View>
        )}
        {error && connected ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 18,
  },
  kicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.slateBlue,
  },
  locationRow: {
    marginBottom: 8,
  },
  locationLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textMuted,
  },
  locationValue: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.navy,
    marginTop: 4,
  },
  locationAction: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.copper,
    marginTop: 6,
  },
  stage: {
    alignSelf: 'center',
    width: 240,
    height: 240,
    marginVertical: 4,
  },
  stageHit: {
    flex: 1,
    width: '100%',
  },
  headline: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    letterSpacing: -1,
    color: colors.navy,
    textAlign: 'center',
  },
  subhead: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginHorizontal: 8,
  },
  footnote: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  deviceWrap: { marginBottom: 8 },
  gearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  gearLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
  },
  gearValue: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.navy,
  },
  gearEdit: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.copper,
  },
  ctaBlock: {
    marginTop: 'auto',
    paddingTop: 8,
    paddingBottom: 8,
    gap: 10,
  },
  fishOn: {
    minHeight: Math.max(touchTarget.hero, 58),
    borderRadius: radii.lg,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.danger,
    textAlign: 'center',
  },
});
