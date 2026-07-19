import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { Tab } from '../types';

const ACTIVE = colors.copper;
const IDLE = '#8A97A3';

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M4 11.5 12 4l8 7.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.5 10.5V20h11v-9.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FishingIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={2.2} fill={color} />
      <Path d="M6.5 12a5.5 5.5 0 0 1 11 0" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M3.5 12a8.5 8.5 0 0 1 17 0" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.55} />
    </Svg>
  );
}

function JourneyIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M5 18c2-6 5-3 7-7 1.6-3.2 3.5-2 5-4" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 4" />
      <Circle cx={5} cy={18} r={1.8} fill={color} />
      <Circle cx={18} cy={6} r={1.8} fill={color} />
    </Svg>
  );
}

interface Props {
  tab: Tab;
  onHome: () => void;
  onFishing: () => void;
  onJourney: () => void;
}

export function TabBar({ tab, onHome, onFishing, onJourney }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <Pressable style={styles.item} onPress={onHome}>
        <HomeIcon color={tab === 'home' ? ACTIVE : IDLE} />
        <Text style={[styles.label, { color: tab === 'home' ? ACTIVE : IDLE }]}>Home</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={onFishing}>
        <FishingIcon color={tab === 'fishing' ? ACTIVE : IDLE} />
        <Text style={[styles.label, { color: tab === 'fishing' ? ACTIVE : IDLE }]}>Fishing</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={onJourney}>
        <JourneyIcon color={tab === 'journey' ? ACTIVE : IDLE} />
        <Text style={[styles.label, { color: tab === 'journey' ? ACTIVE : IDLE }]}>Journey</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#EAEEEF',
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingTop: 6,
  },
  label: {
    fontSize: 10.5,
    fontFamily: fonts.bodyMedium,
  },
});
