import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { LocationPill } from '../components/PillBadge';
import { RippleRings } from '../components/RippleRings';
import { PressScale } from '../components/PressScale';

interface Props {
  location: string;
  onOpenLocation: () => void;
  onStartFight: () => void;
  connecting?: boolean;
  error?: string | null;
}

export function FishingReadyScreen({ location, onOpenLocation, onStartFight, connecting, error }: Props) {
  return (
    <View style={styles.container}>
      <LocationPill location={location} onPress={onOpenLocation} />
      <View style={styles.center}>
        <View style={styles.buttonWrap}>
          {!connecting ? <RippleRings /> : null}
          <PressScale onPress={onStartFight} style={styles.fishOn} activeScale={0.96} disabled={connecting}>
            <Text style={styles.fishOnTitle}>{connecting ? 'Connecting' : 'Fish On'}</Text>
            <Text style={styles.fishOnSubtitle}>{connecting ? 'Talking to DragonFly' : 'Start the fight'}</Text>
          </PressScale>
        </View>
        <View style={styles.copy}>
          <Text style={styles.heading}>{connecting ? 'One moment' : 'Ready when you are'}</Text>
          <Text style={styles.body}>
            {connecting
              ? 'Connecting to your DragonFly device…'
              : "Tap Fish On the moment the fish takes — we’ll time the fight for you."}
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </View>
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
    gap: 34,
  },
  buttonWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishOn: {
    width: 188,
    height: 188,
    borderRadius: 94,
    backgroundColor: colors.copper,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.copper,
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 20 },
    elevation: 10,
  },
  fishOnTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 31,
    letterSpacing: 1,
    color: '#fff',
  },
  fishOnSubtitle: {
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,.82)',
  },
  copy: {
    alignItems: 'center',
    maxWidth: 250,
  },
  heading: {
    fontFamily: fonts.displayMedium,
    fontSize: 16,
    color: colors.navy,
  },
  body: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
    textAlign: 'center',
  },
  error: {
    fontSize: 12.5,
    color: colors.danger,
    marginTop: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
});
