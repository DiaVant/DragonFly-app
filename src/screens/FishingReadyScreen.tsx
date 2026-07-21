import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Screen, PrimaryButton, StatusChip, DeviceStatus } from '../ui';
import { colors, fonts, radii, touchTarget } from '../theme';
import { RippleRings } from '../components/RippleRings';
import { DragonflyMark } from '../components/DragonflyMark';
import type { BleConnectionStatus } from '../types';

interface Props {
  location: string;
  connectionStatus: BleConnectionStatus;
  onOpenLocation: () => void;
  onStartFight: () => void;
  onSimulateFight?: () => void;
  onConnect?: () => void;
  connecting?: boolean;
  error?: string | null;
}

export function FishingReadyScreen({
  location,
  connectionStatus,
  onOpenLocation,
  onStartFight,
  onSimulateFight,
  onConnect,
  connecting,
  error,
}: Props) {
  const connected = connectionStatus === 'connected';
  const busy = Boolean(connecting);

  return (
    <Screen scroll contentStyle={styles.screenContent}>
      <View style={styles.topRow}>
        <Text style={styles.kicker}>Ready to fight</Text>
        <StatusChip
          label={connected ? 'Device ready' : busy ? 'Connecting…' : 'Not connected'}
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

      <View style={styles.stage}>
        <RippleRings />
        <View style={styles.stageCore}>
          <DragonflyMark size={72} />
        </View>
      </View>

      <Text style={styles.headline}>Fish On</Text>
      <Text style={styles.subhead}>
        The moment the fish takes — press. Coaching follows relative tension, not calibrated pounds.
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

      <View style={styles.ctaBlock}>
        <PrimaryButton
          label={busy ? 'Starting…' : connected ? 'Fish On' : 'Connect to Fish On'}
          onPress={connected ? onStartFight : onConnect ?? onStartFight}
          loading={busy}
          disabled={busy || (!connected && !onConnect)}
          style={styles.fishOn}
          accessibilityHint="Starts timing the fight and listening to DragonFly tension samples"
        />
        {onSimulateFight ? (
          <PrimaryButton
            label="Run live simulation"
            onPress={onSimulateFight}
            variant="ghost"
            disabled={busy}
            accessibilityHint="Demo fight with live relative tension and drag advice — no hardware"
          />
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
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
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    position: 'relative',
  },
  stageCore: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderFaint,
    zIndex: 2,
  },
  headline: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    letterSpacing: -0.8,
    color: colors.navy,
    textAlign: 'center',
  },
  subhead: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 12,
    marginBottom: 16,
  },
  deviceWrap: { marginBottom: 8 },
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
