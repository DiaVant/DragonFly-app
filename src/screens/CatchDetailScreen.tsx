import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { NoPhotoFill, PhotoFill } from '../components/PhotoPlaceholder';
import { PressScale } from '../components/PressScale';
import { fmtElapsed } from '../lib/format';
import type { Catch } from '../types';

interface Props {
  item: Catch;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CatchDetailScreen({ item, onClose, onEdit, onDelete }: Props) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        {item.photo ? <PhotoFill /> : <NoPhotoFill label="Photo not added" showMark markSize={46} />}
        <Pressable style={styles.backButton} onPress={onClose}>
          <Text style={styles.backIcon}>&#8249;</Text>
        </Pressable>
        <Pressable style={styles.replaceButton} onPress={onEdit}>
          <Text style={styles.replaceLabel}>Replace photo</Text>
        </Pressable>
      </View>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {item.species ? (
              <Text style={styles.species}>{item.species}</Text>
            ) : (
              <Text style={styles.speciesMissing}>Species not added</Text>
            )}
            <Text style={styles.dateTime}>{item.date}{item.time ? ` · ${item.time}` : ''}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreValue}>{item.score}</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Fight duration</Text>
            <Text style={styles.infoValueMono}>{fmtElapsed(item.fightSeconds)}</Text>
          </View>
          <Pressable style={styles.infoCard} onPress={onEdit}>
            <Text style={styles.infoLabel}>Location</Text>
            {item.location ? (
              <Text style={styles.infoValueBody}>{item.location}</Text>
            ) : (
              <Text style={styles.infoAdd}>+ Add location</Text>
            )}
          </Pressable>
          <Pressable style={styles.infoCard} onPress={onEdit}>
            <Text style={styles.infoLabel}>Size</Text>
            {item.size ? (
              <Text style={styles.infoValueMono}>{item.size} in</Text>
            ) : (
              <Text style={styles.infoAdd}>+ Add size</Text>
            )}
          </Pressable>
          <Pressable style={styles.infoCard} onPress={onEdit}>
            <Text style={styles.infoLabel}>Weight</Text>
            {item.weight ? (
              <Text style={styles.infoValueMono}>{item.weight} lb</Text>
            ) : (
              <Text style={styles.infoAdd}>+ Add weight</Text>
            )}
          </Pressable>
        </View>

        <PressScale onPress={onEdit} style={styles.editButton} activeScale={0.98}>
          <Text style={styles.editLabel}>Edit details</Text>
        </PressScale>
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteLabel}>Delete catch</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    height: 262,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: colors.navy,
    fontSize: 22,
  },
  replaceButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,.94)',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  replaceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.navy,
    fontFamily: fonts.bodySemiBold,
  },
  body: {
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  headerLeft: {
    flexShrink: 1,
  },
  species: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 24,
    color: colors.navy,
  },
  speciesMissing: {
    fontFamily: fonts.displayMedium,
    fontSize: 20,
    color: colors.missing,
    fontStyle: 'italic',
  },
  dateTime: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.missing,
    marginTop: 6,
  },
  scoreBadge: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  scoreValue: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.copper,
    lineHeight: 28,
  },
  scoreLabel: {
    fontSize: 8,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginTop: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 22,
  },
  infoCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 13,
  },
  infoLabel: {
    fontSize: 9,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.missing,
  },
  infoValueMono: {
    fontFamily: fonts.monoRegular,
    fontSize: 16,
    color: colors.navy,
    marginTop: 5,
  },
  infoValueBody: {
    fontSize: 14,
    color: colors.navy,
    fontFamily: fonts.bodyMedium,
    marginTop: 6,
  },
  infoAdd: {
    fontSize: 13,
    color: colors.copper,
    fontWeight: '600',
    marginTop: 6,
    fontFamily: fonts.bodySemiBold,
  },
  editButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  editLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
  },
  deleteButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  deleteLabel: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fonts.bodySemiBold,
  },
});
