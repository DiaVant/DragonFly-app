import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Screen, PrimaryButton, SecondaryButton, Card, Metric, TensionChart, IconButton } from '../ui';
import { colors, fonts, radii } from '../theme';
import { CatchPhoto } from '../components/CatchPhoto';
import { fmtElapsed } from '../lib/format';
import type { Catch } from '../types';

interface Props {
  item: Catch;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CatchDetailScreen({ item, onClose, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hasPhoto = Boolean(item.imageUri) || item.photo;
  const series = item.relativeTensionSeries ?? [];

  const requestDelete = () => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm('Delete this catch? This cannot be undone.')) onDelete();
      return;
    }
    Alert.alert('Delete catch?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <Screen scroll padded={false} contentStyle={styles.screenContent}>
      <View style={styles.hero}>
        <CatchPhoto item={item} emptyLabel="Photo not added" showMark markSize={46} />
        <IconButton onPress={onClose} accessibilityLabel="Close" style={styles.back}>
          <Svg width={16} height={16} viewBox="0 0 16 16">
            <Line x1={1.5} y1={1.5} x2={14.5} y2={14.5} stroke={colors.navy} strokeWidth={2} strokeLinecap="round" />
            <Line x1={14.5} y1={1.5} x2={1.5} y2={14.5} stroke={colors.navy} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </IconButton>
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {item.outcome === 'lost' ? <Text style={styles.lostTag}>Didn&apos;t land</Text> : null}
            {item.species ? (
              <Text style={styles.species}>{item.species}</Text>
            ) : (
              <Text style={styles.speciesMissing}>
                {item.outcome === 'lost' ? 'Lost fish — coaching saved' : 'Species not added'}
              </Text>
            )}
            <Text style={styles.dateTime}>
              {item.date}
              {item.time ? ` · ${item.time}` : ''}
            </Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={[styles.scoreValue, item.outcome === 'lost' && styles.scoreLost]}>{item.score}</Text>
            <Text style={styles.scoreLabel}>
              {item.scoreSource === 'openai' ? 'AI score' : item.outcome === 'lost' ? 'Index' : 'Score'}
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <Card style={styles.infoCard}>
            <Metric label="Fight duration" value={fmtElapsed(item.fightSeconds)} mono />
          </Card>
          <Card style={styles.infoCard}>
            <Metric label="Location" value={item.location || 'Not added'} />
          </Card>
          <Card style={styles.infoCard}>
            <Metric label="Size" value={item.size ? `${item.size} in` : 'Not added'} mono />
          </Card>
          <Card style={styles.infoCard}>
            <Metric label="Weight" value={item.weight ? `${item.weight} lb` : 'Not added'} mono />
          </Card>
        </View>

        {series.length > 1 || item.sampleCount ? (
          <View style={styles.session}>
            <Text style={styles.sessionTitle}>Session tension</Text>
            <Text style={styles.sessionMeta}>
              {item.sampleCount ?? series.length} samples
              {item.averageSignal != null ? ` · avg index ${item.averageSignal}` : ''}
            </Text>
            {series.length > 1 ? <TensionChart samples={series} /> : null}
            {item.coachingSummary ? <Text style={styles.summary}>{item.coachingSummary}</Text> : null}
          </View>
        ) : null}

        {!hasPhoto ? (
          <Text style={styles.missingNote}>No photo attached — you can add one while editing.</Text>
        ) : null}

        <PrimaryButton label="Edit details" onPress={onEdit} variant="navy" style={styles.edit} />
        {confirmDelete ? (
          <View style={styles.confirm}>
            <Text style={styles.confirmText}>Delete this catch permanently?</Text>
            <PrimaryButton label="Yes, delete" onPress={onDelete} variant="danger" />
            <SecondaryButton label="Cancel" onPress={() => setConfirmDelete(false)} />
          </View>
        ) : (
          <SecondaryButton
            label="Delete catch"
            onPress={() => (Platform.OS === 'web' ? requestDelete() : setConfirmDelete(true))}
            tone="danger"
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { maxWidth: 480 },
  hero: {
    height: 280,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.navy,
  },
  back: { position: 'absolute', top: 14, left: 14 },
  body: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 28 },
  headerRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  headerLeft: { flex: 1, minWidth: 0 },
  species: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 28,
    letterSpacing: -0.5,
    color: colors.navy,
  },
  lostTag: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.caution,
    marginBottom: 4,
  },
  speciesMissing: {
    fontFamily: fonts.bodyMedium,
    fontSize: 18,
    color: colors.missing,
    fontStyle: 'italic',
  },
  dateTime: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  scoreBadge: {
    alignItems: 'flex-end',
    paddingTop: 2,
  },
  scoreValue: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    letterSpacing: -1,
    color: colors.copper,
    lineHeight: 38,
  },
  scoreLost: {
    color: colors.slateBlue,
  },
  scoreLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: colors.borderFaint,
  },
  infoCard: {
    width: '50%',
    flexGrow: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderFaint,
    shadowOpacity: 0,
    elevation: 0,
    boxShadow: 'none',
  },
  session: { marginTop: 24 },
  sessionTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.navy,
    marginBottom: 4,
  },
  sessionMeta: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  summary: {
    marginTop: 10,
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  missingNote: {
    marginTop: 14,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textMuted,
  },
  edit: { marginTop: 20, marginBottom: 8 },
  confirm: { gap: 8, marginTop: 8 },
  confirmText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
});
