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
/** Slightly smaller so side tabs stay clear. */
const FISH_SIZE = 80;

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 11.5 12 4l8 7.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.5 10.5V20h11v-9.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SocialIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={8} cy={9} r={2.4} stroke={color} strokeWidth={1.7} />
      <Circle cx={16} cy={9} r={2.4} stroke={color} strokeWidth={1.7} />
      <Path
        d="M4.5 17.5c.8-2.2 2.6-3.3 4.5-3.3s3.7 1.1 4.5 3.3"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M11.5 17.5c.6-1.6 1.9-2.5 3.5-2.5 1.8 0 3.2 1 4 2.5"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
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

function SettingsIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.7} />
      <Path
        d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

interface Props {
  tab: Tab;
  onHome: () => void;
  onSocial: () => void;
  onJourney: () => void;
  onSettings: () => void;
  onFishOn: (origin: FishOnOrigin) => void;
  fishOnLabel?: string;
  fishOnDisabled?: boolean;
  fishOnActive?: boolean;
  hideCenter?: boolean;
  fishOnHidden?: boolean;
}

/**
 * Symmetrical bar: Home · Club | Fish On | Journey · Settings
 * Fish On is a real flex center column (not a full-width overlay), so side tabs stay tappable.
 */
export function TabBar({
  tab,
  onHome,
  onSocial,
  onJourney,
  onSettings,
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
        <View style={styles.side}>
          <TabItem
            label="Home"
            active={tab === 'home'}
            onPress={onHome}
            icon={<HomeIcon color={tab === 'home' ? ACTIVE : IDLE} />}
          />
          <TabItem
            label="Club"
            active={tab === 'social'}
            onPress={onSocial}
            icon={<SocialIcon color={tab === 'social' ? ACTIVE : IDLE} />}
          />
        </View>

        <View style={styles.centerCol}>
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
                      ? [colors.slateBlue, colors.navy]
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

        <View style={styles.side}>
          <TabItem
            label="Journey"
            active={tab === 'journey'}
            onPress={onJourney}
            icon={<JourneyIcon color={tab === 'journey' ? ACTIVE : IDLE} />}
          />
          <TabItem
            label="Settings"
            active={tab === 'settings'}
            onPress={onSettings}
            icon={<SettingsIcon color={tab === 'settings' ? ACTIVE : IDLE} />}
          />
        </View>
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
      hitSlop={6}
    >
      {icon}
      <Text style={[styles.label, { color: active ? ACTIVE : IDLE }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    overflow: 'visible',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 18,
    paddingHorizontal: 2,
    minHeight: 64,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    paddingBottom: 2,
    zIndex: 2,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    minHeight: touchTarget.min,
    justifyContent: 'center',
    paddingBottom: 4,
    maxWidth: 76,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.15,
  },
  centerCol: {
    width: FISH_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -36,
    zIndex: 1,
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
    borderWidth: 4,
    borderColor: colors.surface,
  },
  fishOnDisabled: {
    opacity: 0.45,
  },
  fishOnInvisible: {
    opacity: 0,
  },
  fishOnTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 15,
    color: colors.textOnAccent,
    lineHeight: 17,
  },
  fishOnSub: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 14,
  },
});
