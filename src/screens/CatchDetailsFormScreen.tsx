import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { NoPhotoFill } from '../components/PhotoPlaceholder';
import { PressScale } from '../components/PressScale';
import { fmtElapsed } from '../lib/format';
import type { CatchForm } from '../types';

interface Props {
  title: string;
  form: CatchForm;
  onSpecies: (v: string) => void;
  onSize: (v: string) => void;
  onWeight: (v: string) => void;
  onTogglePhoto: () => void;
  autoScore: number;
  autoFightSeconds: number;
  autoLocation: string;
  autoDateTime: string;
  saveLabel: string;
  secondaryLabel: string;
  onSave: () => void;
  onSecondary: () => void;
}

export function CatchDetailsFormScreen({
  title, form, onSpecies, onSize, onWeight, onTogglePhoto,
  autoScore, autoFightSeconds, autoLocation, autoDateTime,
  saveLabel, secondaryLabel, onSave, onSecondary,
}: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Every field is optional — add what you like.</Text>

      <Pressable style={styles.photoBox} onPress={onTogglePhoto}>
        {form.photo ? (
          <View style={styles.photoAdded}>
            <View style={styles.photoAddedRow}>
              <View style={styles.checkDot}>
                <Text style={styles.checkMark}>&#10003;</Text>
              </View>
              <Text style={styles.photoAddedLabel}>Photo added &middot; tap to remove</Text>
            </View>
          </View>
        ) : (
          <NoPhotoFill title="Drop a photo of your catch" label="Tap to add · optional" showMark markSize={40} />
        )}
      </Pressable>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Species</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Rainbow Trout"
          placeholderTextColor={colors.missing}
          value={form.species}
          onChangeText={onSpecies}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowField}>
          <Text style={styles.fieldLabel}>Size</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, styles.inputWithUnit]}
              placeholder="0"
              placeholderTextColor={colors.missing}
              keyboardType="decimal-pad"
              value={form.size}
              onChangeText={onSize}
            />
            <Text style={styles.unit}>in</Text>
          </View>
        </View>
        <View style={styles.rowField}>
          <Text style={styles.fieldLabel}>Weight</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, styles.inputWithUnit]}
              placeholder="0"
              placeholderTextColor={colors.missing}
              keyboardType="decimal-pad"
              value={form.weight}
              onChangeText={onWeight}
            />
            <Text style={styles.unit}>lb</Text>
          </View>
        </View>
      </View>

      <View style={styles.autoPanel}>
        <View style={styles.autoHeader}>
          <View style={styles.dot} />
          <Text style={styles.autoHeaderLabel}>Automatically recorded</Text>
        </View>
        <View style={styles.autoRow}>
          <Text style={styles.autoRowLabel}>Catch Score</Text>
          <Text style={styles.autoScore}>{autoScore}</Text>
        </View>
        <View style={styles.autoRow}>
          <Text style={styles.autoRowLabel}>Fight duration</Text>
          <Text style={styles.autoMono}>{fmtElapsed(autoFightSeconds)}</Text>
        </View>
        <View style={styles.autoRow}>
          <Text style={styles.autoRowLabel}>Location</Text>
          <Text style={styles.autoBody}>{autoLocation}</Text>
        </View>
        <View style={[styles.autoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.autoRowLabel}>Date &amp; time</Text>
          <Text style={styles.autoMonoSmall}>{autoDateTime}</Text>
        </View>
      </View>

      <PressScale onPress={onSave} style={styles.saveButton} activeScale={0.98}>
        <Text style={styles.saveLabel}>{saveLabel}</Text>
      </PressScale>
      <Pressable onPress={onSecondary} style={styles.secondaryButton}>
        <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 22,
    color: colors.navy,
  },
  subtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 3,
    marginBottom: 18,
  },
  photoBox: {
    height: 172,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  photoAdded: {
    flex: 1,
    backgroundColor: colors.navy,
    justifyContent: 'flex-end',
    padding: 14,
  },
  photoAddedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  checkDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: colors.navy,
    fontSize: 9,
  },
  photoAddedLabel: {
    fontFamily: fonts.monoRegular,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#E8ECEB',
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.navy,
    backgroundColor: colors.surface,
    fontFamily: fonts.bodyRegular,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  rowField: {
    flex: 1,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputWithUnit: {
    paddingRight: 40,
  },
  unit: {
    position: 'absolute',
    right: 14,
    fontSize: 13,
    color: colors.missing,
    fontFamily: fonts.monoRegular,
  },
  autoPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  autoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sage,
  },
  autoHeaderLabel: {
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.missing,
  },
  autoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: colors.borderFaint,
  },
  autoRowLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  autoScore: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: colors.copper,
  },
  autoMono: {
    fontFamily: fonts.monoRegular,
    fontSize: 14,
    color: colors.navy,
  },
  autoMonoSmall: {
    fontFamily: fonts.monoRegular,
    fontSize: 13,
    color: colors.navy,
  },
  autoBody: {
    fontSize: 14,
    color: colors.navy,
    fontFamily: fonts.bodyMedium,
  },
  saveButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.copper,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  saveLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
  },
  secondaryButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  secondaryLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
  },
});
