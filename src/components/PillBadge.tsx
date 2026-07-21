import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface Props {
  location: string;
  onPress?: () => void;
}

export function LocationPill({ location, onPress }: Props) {
  const content = (
    <>
      <View style={styles.dot} />
      <Text style={styles.label}>Fishing at</Text>
      <Text style={styles.value} numberOfLines={1}>
        {location}
      </Text>
      <Text style={styles.caret}>Change</Text>
    </>
  );
  if (!onPress) {
    return <View style={styles.bar}>{content}</View>;
  }
  return (
    <Pressable
      style={styles.bar}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Location ${location}. Change location`}
    >
      {content}
    </Pressable>
  );
}

export function LocationBadge({ location }: { location: string }) {
  return (
    <View style={styles.badge}>
      <View style={styles.dot} />
      <Text style={styles.badgeValue}>{location}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 100,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sage,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: fonts.bodyRegular,
  },
  value: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
    fontFamily: fonts.bodySemiBold,
  },
  badgeValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.navy,
    fontFamily: fonts.bodySemiBold,
  },
  caret: {
    color: colors.copper,
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
  },
});
