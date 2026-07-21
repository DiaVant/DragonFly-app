import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii, shadows } from '../theme';
import { StatusChip } from './StatusChip';
import { PrimaryButton } from './PrimaryButton';
import { HARDWARE_NAME } from '../lib/product';
import type { BleConnectionStatus } from '../types';

interface Props {
  status: BleConnectionStatus;
  connecting?: boolean;
  error?: string | null;
  onConnect?: () => void;
  onStartFishing?: () => void;
  compact?: boolean;
  /** Hide the primary CTA (when Home already has a single job elsewhere). */
  hideAction?: boolean;
}

export function DeviceStatus({
  status,
  connecting,
  error,
  onConnect,
  onStartFishing,
  compact,
  hideAction,
}: Props) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || connecting;

  const chipTone = isConnected ? 'ok' : isConnecting ? 'caution' : error ? 'alert' : 'neutral';
  const chipLabel = isConnected
    ? 'Live'
    : isConnecting
      ? 'Connecting…'
      : error
        ? 'Needs attention'
        : 'Not connected';

  const statusText = isConnected
    ? 'Rod sensor is live. When the fish takes, Fish On coaches the fight.'
    : isConnecting
      ? `Looking for ${HARDWARE_NAME}…`
      : `Clip on ${HARDWARE_NAME}, then connect for live coaching.`;

  return (
    <View style={[styles.wrap, compact && styles.compact]} accessibilityRole="summary">
      <LinearGradient
        colors={isConnected ? ['#243955', '#1B2A41'] : ['#2F4058', '#1B2A41']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.gradient, compact && styles.gradientCompact]}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>Your rod sensor</Text>
            <Text style={styles.title}>{HARDWARE_NAME}</Text>
          </View>
          <StatusChip label={chipLabel} tone={chipTone} />
        </View>
        <Text style={styles.body}>{statusText}</Text>
        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
        {!hideAction ? (
          <View style={styles.actions}>
            {!isConnected ? (
              <PrimaryButton
                label={isConnecting ? 'Connecting…' : error ? 'Try again' : `Connect ${HARDWARE_NAME}`}
                onPress={onConnect ?? (() => undefined)}
                loading={isConnecting}
                disabled={isConnecting || !onConnect}
              />
            ) : onStartFishing ? (
              <PrimaryButton label="Start fishing" onPress={onStartFishing} />
            ) : null}
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.brand,
  },
  compact: {},
  gradient: {
    padding: 22,
    gap: 12,
  },
  gradientCompact: {
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: { flex: 1 },
  kicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.copperSoft,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 26,
    letterSpacing: -0.5,
    color: colors.textOnDark,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textOnDarkSecondary,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.copperSoft,
  },
  actions: {
    marginTop: 6,
  },
});
