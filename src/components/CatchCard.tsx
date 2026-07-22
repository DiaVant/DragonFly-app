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
 * Journey catch card: location above the photo, score badge on the photo,
 * species/size/weight enlarged below.
 */
export function CatchCard({ item, onPress, compact }: Props) {
  return (
    <Pressable
      style={[styles.card, compact && styles.compact]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.outcome === 'lost' ? "Didn't land" : 'Catch'}, ${item.species || 'unnamed'}, score ${item.score}`}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLocation}>
          <View style={styles.headerDot} />
          <Text style={[styles.headerLocationText, !item.location && styles.missing]} numberOfLines={1}>
            {item.location || 'Location not added'}
          </Text>
        </View>
        <Text style={styles.headerDate}>{item.date}</Text>
      </View>

      <View style={[styles.photo, compact && styles.photoCompact]}>
        <CatchPhoto item={item} />
        <View style={[styles.scoreBadge, item.outcome === 'lost' && styles.scoreBadgeLost]}>
          <Text style={styles.scoreBadgeValue}>{item.score}</Text>
          <Text style={styles.scoreBadgeLabel}>Score</Text>
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
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Fight</Text>
            <Text style={styles.statValue}>{fmtElapsed(item.fightSeconds)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Size</Text>
            <Text style={[styles.statValue, !item.size && styles.missing]}>
              {item.size ? `${item.size}"` : '—'}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={[styles.statValue, !item.weight && styles.missing]}>
              {item.weight ? `${item.weight} lb` : '—'}
            </Text>
          </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerLocation: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sage,
  },
  headerLocationText: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  headerDate: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.textMuted,
  },
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
    minWidth: 44,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...shadows.cta,
  },
  scoreBadgeLost: {
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  scoreBadgeValue: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    lineHeight: 22,
    color: colors.copper,
    letterSpacing: -0.3,
  },
  scoreBadgeLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginTop: 3,
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
    gap: 24,
    marginTop: 6,
  },
  stat: {},
  statLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  statValue: {
    fontFamily: fonts.monoRegular,
    fontSize: 16,
    color: colors.navy,
    marginTop: 4,
  },
  missing: {
    color: colors.missing,
    fontStyle: 'italic',
  },
});
