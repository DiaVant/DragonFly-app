import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows } from '../theme';
import { fmtElapsed } from '../lib/format';
import type { Catch } from '../types';
import { CatchPhoto } from './CatchPhoto';

interface Props {
  item: Catch;
  onPress: () => void;
  compact?: boolean;
}

/**
 * Journey catch card: photo on top (score badge upper-right), details below.
 */
export function CatchCard({ item, onPress, compact }: Props) {
  return (
    <Pressable
      style={[styles.card, compact && styles.compact]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.outcome === 'lost' ? "Didn't land" : 'Catch'}, ${item.species || 'unnamed'}, score ${item.score}`}
    >
      <View style={[styles.photo, compact && styles.photoCompact]}>
        <CatchPhoto item={item} />
        <View style={[styles.scoreBadge, item.outcome === 'lost' && styles.scoreBadgeLost]}>
          <Text style={styles.scoreBadgeText}>{item.score}</Text>
        </View>
      </View>

      <View style={styles.body}>
        {item.outcome === 'lost' ? <Text style={styles.lostTag}>Didn&apos;t land</Text> : null}
        {item.species ? (
          <Text style={styles.species} numberOfLines={2}>
            {item.species}
          </Text>
        ) : (
          <Text style={styles.speciesMissing} numberOfLines={2}>
            {item.outcome === 'lost' ? 'Lost fish — review saved' : 'Species not added'}
          </Text>
        )}

        <View style={styles.statsRow}>
          <Text style={styles.meta}>{fmtElapsed(item.fightSeconds)}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={[styles.meta, !item.size && styles.missing]} numberOfLines={1}>
            {item.size ? `${item.size}"` : 'Size —'}
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={[styles.meta, !item.weight && styles.missing]} numberOfLines={1}>
            {item.weight ? `${item.weight} lb` : 'Wt —'}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.footerLocation, !item.location && styles.missing]} numberOfLines={1}>
            {item.location || 'Location not added'}
          </Text>
          <Text style={styles.footerDate}>{item.date}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderFaint,
    ...shadows.card,
  },
  compact: {},
  photo: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundAlt,
    position: 'relative',
  },
  photoCompact: {
    height: 168,
  },
  scoreBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    minWidth: 40,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.copper,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...shadows.cta,
  },
  scoreBadgeLost: {
    backgroundColor: colors.slateBlue,
  },
  scoreBadgeText: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#FFF',
    letterSpacing: -0.3,
  },
  body: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 6,
  },
  lostTag: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.caution,
  },
  species: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.navy,
  },
  speciesMissing: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.missing,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  meta: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDot: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
  },
  missing: {
    color: colors.missing,
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  footerLocation: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: fonts.bodyRegular,
  },
  footerDate: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.textMuted,
  },
});
