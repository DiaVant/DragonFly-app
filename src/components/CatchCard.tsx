import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { fmtElapsed } from '../lib/format';
import type { Catch } from '../types';
import { NoPhotoFill, PhotoFill } from './PhotoPlaceholder';

interface Props {
  item: Catch;
  onPress: () => void;
}

export function CatchCard({ item, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.photoArea}>
        {item.photo ? <PhotoFill /> : <NoPhotoFill label="Photo not added" />}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>{item.score}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
      </View>
      <View style={styles.body}>
        {item.species ? (
          <Text style={styles.species}>{item.species}</Text>
        ) : (
          <Text style={styles.speciesMissing}>Species not added</Text>
        )}
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statLabel}>Fight</Text>
            <Text style={styles.statValueMono}>{fmtElapsed(item.fightSeconds)}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Size</Text>
            {item.size ? (
              <Text style={styles.statValueMono}>{item.size} in</Text>
            ) : (
              <Text style={styles.statMissing}>Not added</Text>
            )}
          </View>
          <View>
            <Text style={styles.statLabel}>Weight</Text>
            {item.weight ? (
              <Text style={styles.statValueMono}>{item.weight} lb</Text>
            ) : (
              <Text style={styles.statMissing}>Not added</Text>
            )}
          </View>
        </View>
        <View style={styles.footerRow}>
          <View style={styles.dot} />
          {item.location ? (
            <Text style={styles.footerLocation}>{item.location}</Text>
          ) : (
            <Text style={styles.footerLocationMissing}>Location not added</Text>
          )}
          <Text style={styles.footerDate}>{item.date}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    overflow: 'hidden',
  },
  photoArea: {
    height: 150,
    position: 'relative',
  },
  scoreBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,.94)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 11,
    alignItems: 'center',
  },
  scoreValue: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.copper,
    lineHeight: 22,
  },
  scoreLabel: {
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginTop: 3,
  },
  body: {
    padding: 16,
    paddingTop: 14,
  },
  species: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    color: colors.navy,
  },
  speciesMissing: {
    fontFamily: fonts.displayMedium,
    fontSize: 16,
    color: colors.missing,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
  },
  statLabel: {
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.missing,
  },
  statValueMono: {
    fontFamily: fonts.monoRegular,
    fontSize: 13,
    color: colors.navy,
    marginTop: 4,
  },
  statMissing: {
    fontSize: 12,
    color: colors.missing,
    marginTop: 5,
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderFaint,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sage,
  },
  footerLocation: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  footerLocationMissing: {
    fontSize: 12,
    color: colors.missing,
    fontStyle: 'italic',
  },
  footerDate: {
    marginLeft: 'auto',
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.missing,
  },
});
