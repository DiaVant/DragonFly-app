import React, { useRef } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Screen, PrimaryButton, DeviceStatus } from '../ui';
import { colors, fonts, radii, touchTarget } from '../theme';
import { AnimatedDragonflyStage } from '../components/AnimatedDragonflyStage';
import { LocationPill } from '../components/PillBadge';
import type { FishOnOrigin } from '../components/FishOnExpand';
import { HARDWARE_NAME } from '../lib/product';
import type { BleConnectionStatus } from '../types';

interface Props {
  location: string;
  connectionStatus: BleConnectionStatus;
  onOpenLocation: () => void;
  onFishOn: (origin: FishOnOrigin) => void;
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
      <LocationPill location={location} onPress={onOpenLocation} />

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
        Tap dragonfly or START when the fish bites. 
      </Text>

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
              label={busy ? 'Starting…' : 'START'}
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
    paddingTop: 20,
    paddingBottom: 12,
  },
  stage: {
    alignSelf: 'center',
    width: 240,
    height: 240,
    marginTop: 18,
    marginBottom: 4,
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
    marginBottom: 24,
    marginHorizontal: 8,
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
