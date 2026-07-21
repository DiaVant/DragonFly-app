import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii, shadows } from '../theme';
import { StatusChip } from './StatusChip';
import { PrimaryButton } from './PrimaryButton';
import type { BleConnectionStatus } from '../types';

interface Props {
  status: BleConnectionStatus;
  connecting?: boolean;
  error?: string | null;
  onConnect?: () => void;
  onStartFishing?: () => void;
  compact?: boolean;
}

export function DeviceStatus({
  status,
  connecting,
  error,
  onConnect,
  onStartFishing,
  compact,
}: Props) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || connecting;

  const chipTone = isConnected ? 'ok' : isConnecting ? 'caution' : error ? 'alert' : 'neutral';
  const chipLabel = isConnected
    ? 'Connected'
    : isConnecting
      ? 'Connecting…'
      : error
        ? 'Connection issue'
        : 'Not connected';

  const statusText = isConnected
    ? 'Rod attachment is live. Hand off the fight with confidence.'
    : isConnecting
      ? 'Looking for your DragonFly…'
      : 'Clip on DragonFly, then connect to unlock live coaching.';

  return (
    <View style={[styles.wrap, compact && styles.compact]} accessibilityRole="summary">
      <LinearGradient
        colors={isConnected ? ['#1A3348', '#152536'] : ['#243447', '#1A2838']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>Hardware</Text>
            <Text style={styles.title}>DragonFly</Text>
          </View>
          <StatusChip label={chipLabel} tone={chipTone} />
        </View>
        <Text style={styles.body}>{statusText}</Text>
        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
        <View style={styles.actions}>
          {!isConnected ? (
            <PrimaryButton
              label={isConnecting ? 'Connecting…' : error ? 'Try again' : 'Connect DragonFly'}
              onPress={onConnect ?? (() => undefined)}
              loading={isConnecting}
              disabled={isConnecting || !onConnect}
            />
          ) : onStartFishing ? (
            <PrimaryButton label="Start Fishing" onPress={onStartFishing} />
          ) : null}
        </View>
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
    padding: 20,
    gap: 12,
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
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.copperSoft,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 24,
    letterSpacing: -0.4,
    color: colors.textOnDark,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textOnDarkSecondary,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.copperSoft,
  },
  actions: {
    marginTop: 4,
  },
});
