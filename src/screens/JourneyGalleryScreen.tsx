import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen, AppHeader, Metric, StatusChip, PrimaryButton } from '../ui';
import { colors, fonts, radii, touchTarget } from '../theme';
import { CatchCard } from '../components/CatchCard';
import { fmtElapsed } from '../lib/format';
import type { Catch, JourneySort } from '../types';

interface Props {
  catches: Catch[];
  onOpen: (id: string) => void;
  onStartFishing: () => void;
}

export function JourneyGalleryScreen({ catches, onOpen, onStartFishing }: Props) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<JourneySort>('newest');
  const [photosOnly, setPhotosOnly] = useState(false);

  const stats = useMemo(() => computeStats(catches), [catches]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...catches];
    if (q) {
      list = list.filter(
        (c) => c.species.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)
      );
    }
    if (photosOnly) {
      list = list.filter((c) => c.photo || Boolean(c.imageUri));
    }
    list.sort((a, b) => {
      if (sort === 'score') return b.score - a.score;
      if (sort === 'duration') return b.fightSeconds - a.fightSeconds;
      return 0; // newest: storage order is newest-first
    });
    return list;
  }, [catches, query, sort, photosOnly]);

  return (
    <Screen padded={false}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={filtered}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppHeader title="Ethan's Journey" showMark={false} />
            <View style={styles.metrics}>
              <Metric label="Catches" value={String(stats.total)} mono />
              <Metric label="Average" value={stats.avgScore != null ? String(stats.avgScore) : '—'} emphasize />
              <Metric label="Best" value={stats.best != null ? String(stats.best) : '—'} emphasize />
            </View>
            <Text style={styles.avgFight}>
              Avg fight {stats.avgDuration != null ? fmtElapsed(stats.avgDuration) : '—'}
            </Text>

            <TextInput
              style={styles.search}
              placeholder="Search species or location"
              placeholderTextColor={colors.missing}
              value={query}
              onChangeText={setQuery}
              accessibilityLabel="Search catches"
            />

            <View style={styles.filters}>
              {([
                ['newest', 'Newest'],
                ['score', 'Score'],
                ['duration', 'Duration'],
              ] as const).map(([id, label]) => (
                <Pressable key={id} onPress={() => setSort(id)} accessibilityRole="button">
                  <StatusChip label={label} tone={sort === id ? 'info' : 'neutral'} />
                </Pressable>
              ))}
              <Pressable onPress={() => setPhotosOnly((v) => !v)} accessibilityRole="button">
                <StatusChip label="Photos" tone={photosOnly ? 'ok' : 'neutral'} />
              </Pressable>
            </View>

            {!filtered.length ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsTitle}>No matches</Text>
                <Text style={styles.noResultsBody}>Try a different search or clear the photo filter.</Text>
                <PrimaryButton label="Start Fishing" onPress={onStartFishing} style={{ marginTop: 12 }} />
              </View>
            ) : (
              <Text style={styles.count}>{filtered.length} shown</Text>
            )}
          </View>
        }
        renderItem={({ item }) => <CatchCard item={item} onPress={() => onOpen(item.id)} />}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
    </Screen>
  );
}

function computeStats(catches: Catch[]) {
  if (!catches.length) {
    return { total: 0, avgScore: null as number | null, best: null as number | null, avgDuration: null as number | null };
  }
  const total = catches.length;
  const avgScore = Math.round(catches.reduce((s, c) => s + c.score, 0) / total);
  const best = Math.max(...catches.map((c) => c.score));
  const avgDuration = Math.round(catches.reduce((s, c) => s + c.fightSeconds, 0) / total);
  return { total, avgScore, best, avgDuration };
}

const styles = StyleSheet.create({
  list: { flex: 1, width: '100%' },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: { marginBottom: 8 },
  metrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderFaint,
  },
  avgFight: {
    marginBottom: 14,
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.textMuted,
  },
  search: {
    minHeight: touchTarget.comfortable,
    borderWidth: 1,
    borderColor: colors.borderFaint,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.navy,
    backgroundColor: 'rgba(255,255,255,0.65)',
    fontFamily: fonts.bodyRegular,
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  count: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  noResults: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  noResultsTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.navy,
  },
  noResultsBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
