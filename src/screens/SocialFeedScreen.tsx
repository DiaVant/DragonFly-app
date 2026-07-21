import React, { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, PrimaryButton, SecondaryButton } from '../ui';
import { colors, fonts, radii } from '../theme';
import type { Catch, FishingTrip } from '../types';
import { fmtElapsed } from '../lib/format';
import { type GearConfig } from '../lib/gear';
import { buildCatchShareMessage, buildTripShareMessage, shareText } from '../lib/share';
import { resolveCatchImageSource } from '../lib/defaultPhotos';
import {
  activityFromCatch,
  activityFromTrip,
  CLUB_FEED,
  type FeedTab,
  type SocialActivity,
  weekStats,
  YOU,
} from '../lib/socialFeed';

interface Props {
  catches: Catch[];
  trips: FishingTrip[];
  gear: GearConfig | null;
  onCreateTrip: (trip: Omit<FishingTrip, 'id' | 'createdAt'>) => void;
  onStartFishing: () => void;
}

type Mode = 'feed' | 'compose_catch' | 'compose_trip';

export function SocialFeedScreen({ catches, trips, gear, onCreateTrip, onStartFishing }: Props) {
  const [mode, setMode] = useState<Mode>('feed');
  const [tab, setTab] = useState<FeedTab>('following');
  const [selectedCatchId, setSelectedCatchId] = useState<string | null>(null);
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [tripTitle, setTripTitle] = useState('Morning on the water');
  const [status, setStatus] = useState<string | null>(null);
  const [kudoed, setKudoed] = useState<Record<string, boolean>>({});
  const [extraKudos, setExtraKudos] = useState<Record<string, number>>({});
  const [extraComments, setExtraComments] = useState<Record<string, number>>({});
  const [commentTarget, setCommentTarget] = useState<SocialActivity | null>(null);
  const [commentDraft, setCommentDraft] = useState('');

  const shareable = useMemo(
    () => catches.filter((c) => c.outcome !== 'lost' || (c.sampleCount ?? 0) > 0),
    [catches]
  );

  const yourActivities = useMemo(() => {
    const fromTrips = trips.map((t) => activityFromTrip(t, catches));
    const fromCatches = shareable.map(activityFromCatch);
    return [...fromTrips, ...fromCatches].sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [trips, shareable, catches]);

  const followingFeed = useMemo(() => {
    // Your posts + a slice of club so Following feels alive.
    return [...yourActivities, ...CLUB_FEED]
      .sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [yourActivities]);

  const feed: SocialActivity[] =
    tab === 'you' ? yourActivities : tab === 'club' ? CLUB_FEED : followingFeed;

  const week = useMemo(() => weekStats(catches), [catches]);

  const toggleKudos = (id: string) => {
    setKudoed((prev) => {
      const next = !prev[id];
      setExtraKudos((ek) => ({
        ...ek,
        [id]: (ek[id] ?? 0) + (next ? 1 : -1),
      }));
      return { ...prev, [id]: next };
    });
  };

  const shareCatch = async (c: Catch) => {
    const result = await shareText(buildCatchShareMessage(c, gear));
    setStatus(
      result === 'shared'
        ? 'Shared — pick Facebook, Messages, or another app'
        : result === 'copied'
          ? 'Copied — paste into Facebook, Messages, or Instagram'
          : result === 'canceled'
            ? 'Canceled'
            : 'Couldn’t share'
    );
  };

  const shareActivity = async (item: SocialActivity) => {
    if (item.catchId) {
      const c = catches.find((x) => x.id === item.catchId);
      if (c) {
        await shareCatch(c);
        return;
      }
    }
    if (item.tripId) {
      const t = trips.find((x) => x.id === item.tripId);
      if (t) {
        const result = await shareText(buildTripShareMessage(t, catches, gear));
        setStatus(
          result === 'shared'
            ? 'Shared — pick Facebook, Messages, or another app'
            : result === 'copied'
              ? 'Copied — paste into Facebook or Messages'
              : result === 'canceled'
                ? 'Canceled'
                : 'Couldn’t share'
        );
        return;
      }
    }
    const result = await shareText(
      `${item.title} — ${item.location} · ${fmtElapsed(item.fightSeconds)} · score ${item.score}`
    );
    setStatus(
      result === 'shared'
        ? 'Shared — pick Facebook, Messages, or another app'
        : result === 'copied'
          ? 'Copied — paste into Facebook or Messages'
          : result === 'canceled'
            ? 'Canceled'
            : 'Couldn’t share'
    );
  };

  const submitComment = () => {
    if (!commentTarget || !commentDraft.trim()) return;
    const id = commentTarget.id;
    setExtraComments((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    setCommentDraft('');
    setCommentTarget(null);
    setStatus('Comment posted');
  };

  const publishTrip = async () => {
    if (!selectedTripIds.length) return;
    const first = catches.find((c) => c.id === selectedTripIds[0]);
    const tripDraft = {
      title: tripTitle.trim() || 'Fishing trip',
      location: first?.location || 'On the water',
      date: first?.date || new Date().toLocaleDateString(),
      catchIds: selectedTripIds,
      caption: caption.trim() || undefined,
    };
    onCreateTrip(tripDraft);
    const trip: FishingTrip = {
      ...tripDraft,
      id: `tmp`,
      createdAt: new Date().toISOString(),
    };
    const result = await shareText(buildTripShareMessage(trip, catches, gear));
    setMode('feed');
    setTab('you');
    setSelectedTripIds([]);
    setCaption('');
    setStatus(result === 'shared' || result === 'copied' ? 'Trip posted to your feed' : 'Trip saved');
  };

  if (mode === 'compose_catch') {
    return (
      <Screen scroll>
        <Text style={styles.composeTitle}>Post a catch</Text>
        <Text style={styles.composeSub}>Choose a fight to add to your feed.</Text>
        {shareable.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setSelectedCatchId(c.id)}
            style={[styles.pickRow, selectedCatchId === c.id && styles.pickRowActive]}
          >
            <Text style={styles.pickTitle}>{c.species || 'Catch'}</Text>
            <Text style={styles.pickMeta}>
              {c.score} · {fmtElapsed(c.fightSeconds)} · {c.location}
            </Text>
          </Pressable>
        ))}
        <PrimaryButton
          label="Post & share"
          disabled={!selectedCatchId}
          onPress={() => {
            const c = catches.find((x) => x.id === selectedCatchId);
            if (c) {
              void shareCatch(c);
              setMode('feed');
              setTab('you');
            }
          }}
          style={styles.cta}
        />
        <SecondaryButton label="Cancel" onPress={() => setMode('feed')} />
      </Screen>
    );
  }

  if (mode === 'compose_trip') {
    return (
      <Screen scroll>
        <Text style={styles.composeTitle}>Post a trip</Text>
        <Text style={styles.composeSub}>Bundle fights into one outing — like a Strava activity.</Text>
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={tripTitle}
          onChangeText={setTripTitle}
          style={styles.input}
          placeholderTextColor={colors.missing}
          placeholder="Morning on the lake"
        />
        <Text style={styles.label}>Caption</Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          style={[styles.input, styles.inputMulti]}
          multiline
          placeholderTextColor={colors.missing}
          placeholder="How’d it go?"
        />
        <Text style={styles.label}>Include</Text>
        {shareable.map((c) => {
          const on = selectedTripIds.includes(c.id);
          return (
            <Pressable
              key={c.id}
              onPress={() =>
                setSelectedTripIds((prev) =>
                  prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                )
              }
              style={[styles.pickRow, on && styles.pickRowActive]}
            >
              <Text style={styles.pickTitle}>{c.species || 'Fight'}</Text>
              <Text style={styles.pickMeta}>
                {c.date} · {fmtElapsed(c.fightSeconds)} · {c.score}
              </Text>
            </Pressable>
          );
        })}
        <PrimaryButton
          label="Post trip"
          disabled={!selectedTripIds.length}
          onPress={() => void publishTrip()}
          style={styles.cta}
        />
        <SecondaryButton label="Cancel" onPress={() => setMode('feed')} />
      </Screen>
    );
  }

  return (
    <Screen scroll padded={false} atmosphere={false} contentStyle={styles.feedShell}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>Club</Text>
          <Text style={styles.brandSub}>DragonFly network</Text>
        </View>
        <Pressable
          style={styles.postBtn}
          onPress={() => setMode(shareable.length ? 'compose_catch' : 'compose_trip')}
          accessibilityRole="button"
          accessibilityLabel="Post activity"
        >
          <Text style={styles.postBtnText}>+</Text>
        </Pressable>
      </View>

      <View style={styles.segments}>
        {(
          [
            ['following', 'Following'],
            ['club', 'Club'],
            ['you', 'You'],
          ] as const
        ).map(([id, label]) => (
          <Pressable
            key={id}
            onPress={() => setTab(id)}
            style={[styles.segment, tab === id && styles.segmentOn]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === id }}
          >
            <Text style={[styles.segmentText, tab === id && styles.segmentTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.weekCard}>
        <Text style={styles.weekTitle}>This week</Text>
        <View style={styles.weekRow}>
          <WeekStat label="Activities" value={String(week.activities)} />
          <WeekStat label="Landed" value={String(week.landed)} />
          <WeekStat label="Time" value={fmtElapsed(week.timeOnWater)} mono />
          <WeekStat label="Best" value={week.bestScore ? String(week.bestScore) : '—'} />
        </View>
      </View>

      <View style={styles.postRow}>
        <Pressable style={styles.quickPost} onPress={() => setMode('compose_catch')}>
          <Text style={styles.quickPostText}>Post a catch</Text>
        </Pressable>
        <Pressable style={styles.quickPost} onPress={() => setMode('compose_trip')}>
          <Text style={styles.quickPostText}>Post a trip</Text>
        </Pressable>
      </View>

      {status ? <Text style={styles.status}>{status}</Text> : null}

      {!feed.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your feed is quiet</Text>
          <Text style={styles.emptyBody}>
            Land a fight, then post it — or follow Club to see what other anglers are doing.
          </Text>
          <PrimaryButton label="Fish On" onPress={onStartFishing} style={{ maxWidth: 200 }} />
          <SecondaryButton label="Browse Club" onPress={() => setTab('club')} />
        </View>
      ) : (
        feed.map((item) => (
          <ActivityCard
            key={item.id}
            item={item}
            kudoed={Boolean(kudoed[item.id])}
            kudosCount={item.kudos + (extraKudos[item.id] ?? 0)}
            commentCount={item.comments + (extraComments[item.id] ?? 0)}
            onKudos={() => toggleKudos(item.id)}
            onComment={() => {
              setCommentTarget(item);
              setCommentDraft('');
            }}
            onShare={() => void shareActivity(item)}
          />
        ))
      )}

      <Modal
        visible={commentTarget != null}
        transparent
        animationType="fade"
        onRequestClose={() => setCommentTarget(null)}
      >
        <Pressable style={styles.commentBackdrop} onPress={() => setCommentTarget(null)}>
          <Pressable style={styles.commentSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.commentTitle}>Comment</Text>
            <Text style={styles.commentSub} numberOfLines={1}>
              {commentTarget?.title}
            </Text>
            <TextInput
              value={commentDraft}
              onChangeText={setCommentDraft}
              style={[styles.input, styles.inputMulti]}
              placeholder="Nice fight — keep that drag smooth"
              placeholderTextColor={colors.missing}
              multiline
              autoFocus
            />
            <PrimaryButton
              label="Post comment"
              onPress={submitComment}
              disabled={!commentDraft.trim()}
              style={styles.cta}
            />
            <SecondaryButton label="Cancel" onPress={() => setCommentTarget(null)} />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function WeekStat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.weekStat}>
      <Text style={styles.weekLabel}>{label}</Text>
      <Text style={[styles.weekValue, mono && styles.mono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ActivityCard({
  item,
  kudoed,
  kudosCount,
  commentCount,
  onKudos,
  onComment,
  onShare,
}: {
  item: SocialActivity;
  kudoed: boolean;
  kudosCount: number;
  commentCount: number;
  onKudos: () => void;
  onComment: () => void;
  onShare: () => void;
}) {
  const athlete = item.athlete ?? YOU;
  const photo = resolveCatchImageSource(item.imageUri);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: athlete.accent }]}>
          <Text style={styles.avatarText}>{athlete.initials}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.athleteName}>{athlete.name}</Text>
          <Text style={styles.metaLine}>
            {item.subtitle || 'Activity'} · {item.relativeTime}
          </Text>
        </View>
      </View>

      <Text style={styles.activityTitle}>{item.title}</Text>
      {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}

      {photo ? (
        <View style={styles.heroWrap}>
          <Image source={photo} style={styles.hero} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(15,28,42,0.72)']}
            style={styles.heroFade}
          >
            <Text style={styles.mapPlace}>{item.location}</Text>
          </LinearGradient>
        </View>
      ) : (
        <LinearGradient
          colors={heroColors(item.kind)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroMap}
        >
          <Text style={styles.mapPlace}>{item.location}</Text>
          <Text style={styles.mapKind}>
            {item.kind === 'trip' ? 'Outing route' : item.kind === 'session' ? 'Session' : 'Fight path'}
          </Text>
        </LinearGradient>
      )}

      <View style={styles.stats}>
        <Stat
          label={item.kind === 'trip' ? 'Moving time' : 'Fight time'}
          value={fmtElapsed(item.fightSeconds)}
          mono
        />
        <Stat label="Score" value={String(item.score)} />
        <Stat
          label={item.fights != null ? 'Fights' : item.species ? 'Species' : 'Place'}
          value={
            item.fights != null
              ? String(item.fights)
              : item.species
                ? item.species.split(' ')[0]!
                : item.location.split(',')[0]!
          }
        />
      </View>

      <View style={styles.kudosRow}>
        <Text style={styles.kudosCount}>
          {kudosCount > 0 ? `${kudosCount} kudos` : 'Be the first to give kudos'}
          {commentCount > 0 ? ` · ${commentCount} comments` : ''}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onKudos}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={kudoed ? 'Remove kudos' : 'Give kudos'}
        >
          <Text style={[styles.actionIcon, kudoed && styles.actionIconOn]}>{kudoed ? '♥' : '♡'}</Text>
          <Text style={[styles.actionLabel, kudoed && styles.actionLabelOn]}>Kudos</Text>
        </Pressable>
        <Pressable onPress={onComment} style={styles.action} accessibilityRole="button">
          <Text style={styles.actionIcon}>◎</Text>
          <Text style={styles.actionLabel}>Comment</Text>
        </Pressable>
        <Pressable
          onPress={onShare}
          style={styles.action}
          accessibilityRole="button"
          accessibilityHint="Share to Facebook, Messages, or other apps"
        >
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={styles.actionLabel}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, mono && styles.mono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function heroColors(kind: SocialActivity['kind']): [string, string, string] {
  if (kind === 'trip') return ['#2F4058', '#4B6A88', '#8FA89A'];
  if (kind === 'session') return ['#1B2A41', '#4B6A88', '#B87444'];
  return ['#1B2A41', '#2F4058', '#B87444'];
}

const styles = StyleSheet.create({
  feedShell: {
    paddingBottom: 28,
    backgroundColor: colors.backgroundAlt,
    maxWidth: 480,
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  brand: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    letterSpacing: -0.6,
    color: colors.navy,
  },
  brandSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  postBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.copper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBtnText: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.textOnAccent,
    marginTop: -2,
  },
  segments: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 6,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  segmentOn: {
    backgroundColor: 'rgba(184,116,68,0.12)',
  },
  segmentText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  segmentTextOn: {
    color: colors.copper,
  },
  weekCard: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  weekTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.slateBlue,
    marginBottom: 10,
  },
  weekRow: { flexDirection: 'row', gap: 8 },
  weekStat: { flex: 1 },
  weekLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 3,
  },
  weekValue: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 16,
    color: colors.navy,
  },
  postRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  quickPost: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  quickPostText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.navy,
  },
  status: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.sage,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  empty: {
    padding: 28,
    gap: 12,
    backgroundColor: colors.surface,
    margin: 12,
    borderRadius: radii.lg,
  },
  emptyTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 22,
    color: colors.navy,
  },
  emptyBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  card: {
    backgroundColor: colors.surface,
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 13,
    color: '#FFF',
  },
  headerText: { flex: 1 },
  athleteName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.navy,
  },
  metaLine: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  activityTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    letterSpacing: -0.35,
    color: colors.navy,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  caption: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  hero: {
    width: '100%',
    height: 220,
  },
  heroWrap: {
    width: '100%',
    height: 220,
    marginBottom: 12,
    backgroundColor: colors.navy,
    overflow: 'hidden',
  },
  heroFade: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: 14,
  },
  heroMap: {
    width: '100%',
    height: 168,
    marginBottom: 12,
    justifyContent: 'flex-end',
    padding: 16,
    overflow: 'hidden',
  },
  mapPlace: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    color: '#FFF',
  },
  mapKind: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 10,
  },
  stat: { flex: 1 },
  statLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 3,
  },
  statValue: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    color: colors.navy,
  },
  mono: {
    fontFamily: fonts.monoRegular,
    fontSize: 18,
  },
  kudosRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  kudosCount: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingVertical: 4,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  actionIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  actionIconOn: {
    color: colors.copper,
  },
  actionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionLabelOn: {
    color: colors.copper,
  },
  composeTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.navy,
    marginTop: 8,
    marginBottom: 6,
  },
  composeSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.slateBlue,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.navy,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  pickRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  pickRowActive: {
    borderColor: colors.copper,
    backgroundColor: 'rgba(184,116,68,0.08)',
  },
  pickTitle: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.navy },
  pickMeta: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cta: { marginTop: 16, marginBottom: 10 },
  commentBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  commentSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  commentTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    color: colors.navy,
  },
  commentSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 12,
  },
});
