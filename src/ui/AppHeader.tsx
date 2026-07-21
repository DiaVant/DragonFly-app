import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { DragonflyMark } from '../components/DragonflyMark';

interface Props {
  title?: string;
  subtitle?: string;
  dark?: boolean;
  right?: React.ReactNode;
  showMark?: boolean;
  /** Larger brand treatment for Home. */
  hero?: boolean;
}

export function AppHeader({
  title = 'DragonFly',
  subtitle,
  dark,
  right,
  showMark = true,
  hero,
}: Props) {
  if (hero) {
    return (
      <View style={styles.heroWrap}>
        <View style={styles.heroMark}>
          <DragonflyMark size={56} tone={dark ? 'light' : 'dark'} />
        </View>
        <Text style={[styles.heroTitle, dark && styles.titleDark]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.heroSubtitle, dark && styles.subtitleDark]} numberOfLines={3}>
            {subtitle}
          </Text>
        ) : null}
        {right ? <View style={styles.heroRight}>{right}</View> : null}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {showMark ? (
          <View style={styles.mark}>
            <DragonflyMark size={32} tone={dark ? 'light' : 'dark'} />
          </View>
        ) : null}
        <View style={styles.text}>
          <Text style={[styles.title, dark && styles.titleDark]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, dark && styles.subtitleDark]} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 8,
    marginBottom: 20,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  mark: { width: 32, height: 32 },
  text: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 24,
    letterSpacing: -0.4,
    color: colors.navy,
  },
  titleDark: { color: colors.textOnDark },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 19,
    color: colors.textSecondary,
    marginTop: 3,
  },
  subtitleDark: { color: colors.textOnDarkSecondary },
  heroWrap: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 8,
    marginBottom: 20,
  },
  heroMark: {
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    letterSpacing: -1,
    color: colors.navy,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 300,
  },
  heroRight: {
    marginTop: 16,
  },
});
