import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Screen, AppHeader, DeviceStatus, Metric, SectionHeader, PrimaryButton } from '../ui';
import { colors, fonts } from '../theme';
import { CatchCard } from '../components/CatchCard';
import type { BleConnectionStatus, Catch } from '../types';
import { fmtElapsed } from '../lib/format';

interface JourneySummary {
  total: number;
  averageScore: number | null;
  bestScore: number | null;
}

interface Props {
  connectionStatus: BleConnectionStatus;
  connecting: boolean;
  error?: string | null;
  onConnect: () => void;
  onStartFishing: () => void;
  onOpenJourney: () => void;
  onOpenCatch: (id: string) => void;
  onOpenTroubleshooting?: () => void;
  summary: JourneySummary;
  recentCatch?: Catch | null;
  greeting?: string;
}

export function HomeScreen({
  connectionStatus,
  connecting,
  error,
  onConnect,
  onStartFishing,
  onOpenJourney,
  onOpenCatch,
  onOpenTroubleshooting,
  summary,
  recentCatch,
  greeting = 'Coach the fight. Keep the memories.',
}: Props) {
  const connected = connectionStatus === 'connected';

  return (
    <Screen scroll>
      <AppHeader title="DragonFly" subtitle={greeting} hero showMark />

      <DeviceStatus
        status={connectionStatus}
        connecting={connecting}
        error={error}
        onConnect={onConnect}
        onStartFishing={connected ? onStartFishing : undefined}
      />

      <View style={styles.journeyStrip}>
        <SectionHeader
          title="Journey"
          subtitle={summary.total ? `${summary.total} catches on the water` : 'Your first catch starts here'}
          action={
            <Pressable onPress={onOpenJourney} hitSlop={8} accessibilityRole="button" accessibilityLabel="Open Journey">
              <Text style={styles.link}>Open</Text>
            </Pressable>
          }
        />
        <View style={styles.metrics}>
          <Metric label="Catches" value={String(summary.total)} mono />
          <Metric
            label="Average"
            value={summary.averageScore != null ? String(summary.averageScore) : '—'}
            emphasize={summary.averageScore != null}
          />
          <Metric
            label="Best"
            value={summary.bestScore != null ? String(summary.bestScore) : '—'}
            emphasize={summary.bestScore != null}
          />
        </View>
      </View>

      {recentCatch ? (
        <View style={styles.section}>
          <SectionHeader title="Last catch" />
          <CatchCard item={recentCatch} onPress={() => onOpenCatch(recentCatch.id)} compact />
          <Text style={styles.footnote}>
            {fmtElapsed(recentCatch.fightSeconds)} · {recentCatch.location || 'Location not added'}
          </Text>
        </View>
      ) : (
        <View style={styles.emptyPrompt}>
          <Text style={styles.emptyTitle}>No catches yet</Text>
          <Text style={styles.emptyBody}>
            When you land a fish, DragonFly saves the fight score and coaching notes to your Journey.
          </Text>
          <PrimaryButton
            label={connected ? 'Start Fishing' : 'Connect DragonFly'}
            onPress={connected ? onStartFishing : onConnect}
            style={styles.emptyCta}
          />
        </View>
      )}

      <Pressable
        onPress={onOpenTroubleshooting}
        style={styles.trouble}
        accessibilityRole="button"
        accessibilityLabel="Device troubleshooting"
      >
        <Text style={styles.troubleTitle}>Need help connecting?</Text>
        <Text style={styles.troubleBody}>Power on · stay nearby · allow Bluetooth · then Connect</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
  },
  journeyStrip: {
    marginTop: 28,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderFaint,
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
  },
  link: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.copper,
  },
  footnote: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 10,
  },
  emptyPrompt: {
    marginTop: 28,
    paddingVertical: 8,
  },
  emptyTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    color: colors.navy,
    letterSpacing: -0.3,
  },
  emptyBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 16,
  },
  emptyCta: {
    maxWidth: 280,
  },
  trouble: {
    marginTop: 32,
    marginBottom: 28,
    paddingVertical: 4,
  },
  troubleTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.navy,
    marginBottom: 4,
  },
  troubleBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
});
