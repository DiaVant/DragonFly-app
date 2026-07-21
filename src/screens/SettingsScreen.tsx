import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen, AppHeader, PrimaryButton, StatusChip } from '../ui';
import { colors, fonts, radii } from '../theme';
import { APP_NAME, HARDWARE_NAME } from '../lib/product';
import { gearSummary, type GearConfig } from '../lib/gear';
import type { BleConnectionStatus } from '../types';

interface Props {
  connectionStatus: BleConnectionStatus;
  gear: GearConfig | null;
  onEditGear: () => void;
  onConnectHelp: () => void;
  onConnect: () => void;
  connecting?: boolean;
}

export function SettingsScreen({
  connectionStatus,
  gear,
  onEditGear,
  onConnectHelp,
  onConnect,
  connecting,
}: Props) {
  const connected = connectionStatus === 'connected';

  return (
    <Screen scroll>
      <AppHeader title="Settings" subtitle={`${APP_NAME} · ${HARDWARE_NAME}`} showMark={false} />

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Sensor</Text>
        <StatusChip
          label={connected ? 'Connected' : connecting ? 'Connecting…' : 'Not connected'}
          tone={connected ? 'ok' : connecting ? 'caution' : 'neutral'}
        />
      </View>

      {!connected ? (
        <PrimaryButton
          label={connecting ? 'Connecting…' : `Connect ${HARDWARE_NAME}`}
          onPress={onConnect}
          loading={connecting}
          disabled={connecting}
          style={styles.btn}
        />
      ) : null}

      <Pressable style={styles.card} onPress={onEditGear} accessibilityRole="button">
        <Text style={styles.cardTitle}>Rod & line</Text>
        <Text style={styles.cardBody}>{gear ? gearSummary(gear) : 'Not set — needed for calibration'}</Text>
        <Text style={styles.cardAction}>Edit</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={onConnectHelp} accessibilityRole="button">
        <Text style={styles.cardTitle}>Connect help</Text>
        <Text style={styles.cardBody}>Power on · clip on · Bluetooth · Connect</Text>
        <Text style={styles.cardAction}>Open</Text>
      </Pressable>

      <View style={styles.about}>
        <Text style={styles.aboutTitle}>{HARDWARE_NAME}</Text>
        <Text style={styles.aboutBody}>
          Relative tension coaching for beginners. Colors and type follow the DragonFly style guide.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  rowLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.navy,
  },
  btn: { marginBottom: 18 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.navy,
  },
  cardBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cardAction: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.copper,
    marginTop: 10,
  },
  about: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  aboutTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    color: colors.navy,
    marginBottom: 6,
  },
  aboutBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
});
