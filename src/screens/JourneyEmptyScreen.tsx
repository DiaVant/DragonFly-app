import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { DragonflyMark } from '../components/DragonflyMark';
import { PressScale } from '../components/PressScale';

interface Props {
  onStartFishing: () => void;
}

export function JourneyEmptyScreen({ onStartFishing }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.markWrap}>
        <DragonflyMark size={120} tone="dark" opacity={0.5} />
      </View>
      <View>
        <Text style={styles.heading}>Your fishing journey starts with your first catch.</Text>
        <Text style={styles.body}>Land a fish and it&rsquo;ll appear here as a memory you can keep.</Text>
      </View>
      <PressScale onPress={onStartFishing} style={styles.button} activeScale={0.98}>
        <Text style={styles.buttonLabel}>Start Fishing</Text>
      </PressScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
    gap: 26,
  },
  markWrap: {
    width: 120,
    height: 120,
  },
  heading: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    color: colors.navy,
    lineHeight: 27,
    textAlign: 'center',
  },
  body: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 10,
    lineHeight: 19,
    textAlign: 'center',
  },
  button: {
    height: 54,
    paddingHorizontal: 34,
    borderRadius: 16,
    backgroundColor: colors.copper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
  },
});
