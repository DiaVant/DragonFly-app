import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, layout, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  dark?: boolean;
  padded?: boolean;
  /** Soft dawn wash behind content (light screens). */
  atmosphere?: boolean;
}

export function Screen({
  children,
  scroll,
  style,
  contentStyle,
  dark,
  padded = true,
  atmosphere = !dark,
}: Props) {
  const { width } = useWindowDimensions();
  const shellWidth = Math.min(width, layout.maxContentWidth);
  const pad = padded ? (width < 360 ? spacing.screenNarrow : spacing.screen) : 0;

  const body = (
    <View style={[styles.inner, { width: shellWidth, paddingHorizontal: pad }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.root, dark && styles.rootDark, style]}>
      {!dark && atmosphere ? (
        <LinearGradient
          colors={[colors.dawnTop, colors.dawnMid, colors.dawnBottom]}
          locations={[0, 0.38, 1]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {dark ? (
        <LinearGradient
          colors={['#0E1A28', colors.fightBg, '#060B12']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.center}>{body}</View>
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.center]}>{body}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  rootDark: {
    backgroundColor: colors.fightBg,
  },
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  inner: {
    flex: 1,
    maxWidth: layout.maxContentWidth,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
});
