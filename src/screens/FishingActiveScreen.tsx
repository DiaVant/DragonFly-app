import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { LocationBadge } from '../components/PillBadge';
import { TensionLine } from '../components/TensionLine';
import { PressScale } from '../components/PressScale';
import { fmtElapsed } from '../lib/format';

interface Props {
  location: string;
  elapsed: number;
  onLandFish: () => void;
}

export function FishingActiveScreen({ location, elapsed, onLandFish }: Props) {
  return (
    <View style={styles.container}>
      <LocationBadge location={location} />
      <View style={styles.center}>
        <Text style={styles.eyebrow}>Fight in progress</Text>
        <Text style={styles.timer}>{fmtElapsed(elapsed)}</Text>
        <View style={styles.tensionWrap}>
          <TensionLine />
        </View>
        <Text style={styles.subtext}>Line tension holding</Text>
      </View>
      <PressScale onPress={onLandFish} style={styles.landedButton} activeScale={0.98}>
        <Text style={styles.landedLabel}>Landed</Text>
      </PressScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 22,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  timer: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 84,
    lineHeight: 84,
    color: colors.navy,
    letterSpacing: 1,
  },
  tensionWrap: {
    marginTop: 8,
  },
  subtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  landedButton: {
    width: '100%',
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.copper,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.copper,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
  },
  landedLabel: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 23,
    letterSpacing: 1,
    color: '#fff',
  },
});
