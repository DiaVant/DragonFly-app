import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadows, touchTarget } from '../theme';
import type { Tab } from '../types';
import type { FishOnOrigin } from './FishOnExpand';

const ACTIVE = colors.copper;
const IDLE = colors.textMuted;

/** Nike-scale center CTA — sits proud of the tab bar. */
const FISH_SIZE = 88;

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 11.5 12 4l8 7.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.5 10.5V20h11v-9.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function JourneyIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 18c2-6 5-3 7-7 1.6-3.2 3.5-2 5-4"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.1 4"
      />
      <Circle cx={5} cy={18} r={1.8} fill={color} />
      <Circle cx={18} cy={6} r={1.8} fill={color} />
    </Svg>
  );
}

interface Props {
  tab: Tab;
  onHome: () => void;
  onJourney: () => void;
  /** Called with the Fish On button’s window rect so the expand burst can start from it. */
  onFishOn: (origin: FishOnOrigin) => void;
  fishOnLabel?: string;
  fishOnDisabled?: boolean;
  fishOnActive?: boolean;
  hideCenter?: boolean;
  /** Hide the real button while the expand overlay is playing. */
  fishOnHidden?: boolean;
}

export function TabBar({
  tab,
  onHome,
  onJourney,
  onFishOn,
  fishOnLabel = 'Fish On',
  fishOnDisabled,
  fishOnActive,
  hideCenter,
  fishOnHidden,
}: Props) {
  const insets = useSafeAreaInsets();
  const btnRef = useRef<View>(null);

  const handleFishOn = () => {
    if (fishOnDisabled) return;
    btnRef.current?.measureInWindow((x, y, width, height) => {
      const size = Math.max(width, height);
      onFishOn({
        x: x + (width - size) / 2,
        y: y + (height - size) / 2,
        size,
      });
    });
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        <TabItem
          label="Home"
          active={tab === 'home'}
          onPress={onHome}
          icon={<HomeIcon color={tab === 'home' ? ACTIVE : IDLE} />}
        />

        <View style={styles.centerSlot}>
          {!hideCenter ? (
            <View
              ref={btnRef}
              collapsable={false}
              style={[
                styles.fishOnOuter,
                fishOnDisabled && styles.fishOnDisabled,
                fishOnHidden && styles.fishOnInvisible,
              ]}
            >
              <Pressable
                onPress={handleFishOn}
                disabled={fishOnDisabled || fishOnHidden}
                accessibilityRole="button"
                accessibilityLabel={fishOnLabel}
                accessibilityHint="Go to fishing or start a fight"
              >
                <LinearGradient
                  colors={
                    fishOnActive
                      ? [colors.lakeSoft, colors.lake]
                      : [colors.copperSoft, colors.copper, colors.copperDark]
                  }
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={styles.fishOn}
                >
                  <Text style={styles.fishOnTitle}>{fishOnActive ? 'Live' : 'Fish'}</Text>
                  <Text style={styles.fishOnSub}>{fishOnActive ? 'Fight' : 'On'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            <View style={styles.centerPlaceholder} />
          )}
        </View>

        <TabItem
          label="Journey"
          active={tab === 'journey'}
          onPress={onJourney}
          icon={<JourneyIcon color={tab === 'journey' ? ACTIVE : IDLE} />}
        />
      </View>
    </View>
  );
}

function TabItem({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      {icon}
      <Text style={[styles.label, { color: active ? ACTIVE : IDLE }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(247,249,250,0.92)',
    borderTopWidth: 1,
    borderTopColor: colors.borderFaint,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 14,
    paddingHorizontal: 12,
    minHeight: 62,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    minHeight: touchTarget.min,
    justifyContent: 'center',
    paddingBottom: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.2,
  },
  centerSlot: {
    width: FISH_SIZE + 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -40,
  },
  centerPlaceholder: {
    width: FISH_SIZE,
    height: FISH_SIZE,
  },
  fishOnOuter: {
    ...shadows.cta,
    borderRadius: FISH_SIZE / 2,
  },
  fishOn: {
    width: FISH_SIZE,
    height: FISH_SIZE,
    borderRadius: FISH_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: colors.mist,
  },
  fishOnDisabled: {
    opacity: 0.45,
  },
  fishOnInvisible: {
    opacity: 0,
  },
  fishOnTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 16,
    color: colors.textOnAccent,
    lineHeight: 18,
  },
  fishOnSub: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 15,
  },
});
