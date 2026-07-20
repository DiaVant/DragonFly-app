import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { PressScale } from '../components/PressScale';
import type { BleConnectionStatus } from '../types';

interface Props {
  connectionStatus: BleConnectionStatus;
  connecting: boolean;
  error?: string | null;
  onConnect: () => void;
}

const STATUS_LABEL: Record<BleConnectionStatus, string> = {
  disconnected: 'Not connected',
  connecting: 'Connecting…',
  connected: 'Connected to DragonFly',
};

const STATUS_COLOR: Record<BleConnectionStatus, string> = {
  disconnected: colors.missing,
  connecting: colors.copper,
  connected: colors.sage,
};

export function HomeScreen({ connectionStatus, connecting, error, onConnect }: Props) {
  const isConnected = connectionStatus === 'connected';
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>

      <View style={styles.setupCard}>
        <Text style={styles.setupHeading}>DragonFly device</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: STATUS_COLOR[connectionStatus] }]} />
          <Text style={styles.statusLabel}>{STATUS_LABEL[connectionStatus]}</Text>
        </View>
        {!isConnected ? (
          <PressScale onPress={onConnect} style={styles.connectButton} activeScale={0.98} disabled={connecting}>
            <Text style={styles.connectLabel}>{connecting ? 'Connecting…' : 'Connect to DragonFly'}</Text>
          </PressScale>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    paddingHorizontal: 28,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 34,
    letterSpacing: 2,
    color: colors.navy,
  },
  setupCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
  },
  setupHeading: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 14,
    color: colors.navy,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.bodyMedium,
  },
  connectButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.copper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
  },
  error: {
    fontSize: 12.5,
    color: colors.danger,
    marginTop: 14,
    lineHeight: 18,
  },
});
