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
 * Journey catch row: photo thumbnail + readable species/stats.
 */
export function CatchCard({ item, onPress, compact }: Props) {
  return (
    <Pressable
      style={[styles.card, compact && styles.compact]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.outcome === 'lost' ? "Didn't land" : 'Catch'}, ${item.species || 'unnamed'}, score ${item.score}`}
    >
      <View style={[styles.thumb, compact && styles.thumbCompact]}>
        <CatchPhoto item={item} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            {item.outcome === 'lost' ? (
              <Text style={styles.lostTag}>Didn&apos;t land</Text>
            ) : null}
            {item.species ? (
              <Text style={styles.species} numberOfLines={2}>
                {item.species}
              </Text>
            ) : (
              <Text style={styles.speciesMissing} numberOfLines={2}>
                {item.outcome === 'lost' ? 'Lost fish — review saved' : 'Species not added'}
              </Text>
            )}
          </View>
          <Text style={[styles.scoreValue, item.outcome === 'lost' && styles.scoreLost]}>{item.score}</Text>
        </View>

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
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: radii.lg,
    overflow: 'hidden',
    minHeight: 108,
    borderWidth: 1,
    borderColor: colors.borderFaint,
    ...shadows.card,
  },
  compact: {
    minHeight: 96,
  },
  thumb: {
    width: 100,
    minHeight: 108,
    alignSelf: 'stretch',
    backgroundColor: colors.backgroundAlt,
    overflow: 'hidden',
  },
  thumbCompact: {
    width: 88,
    minHeight: 96,
  },
  body: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  titleText: {
    flex: 1,
    minWidth: 0,
  },
  scoreValue: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    letterSpacing: -0.6,
    color: colors.copper,
    lineHeight: 28,
  },
  scoreLost: {
    color: colors.slateBlue,
  },
  lostTag: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.caution,
    marginBottom: 2,
  },
  species: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 17,
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
