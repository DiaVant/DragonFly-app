import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radii } from '../theme';
import { ErrorState } from '../ui';
import { LocationSheet } from '../components/LocationSheet';
import { TabBar } from '../components/TabBar';
import { HomeScreen } from '../screens/HomeScreen';
import { FishingReadyScreen } from '../screens/FishingReadyScreen';
import { FishingActiveScreen } from '../screens/FishingActiveScreen';
import { CatchScoreScreen } from '../screens/CatchScoreScreen';
import { FightLostScreen } from '../screens/FightLostScreen';
import { CatchDetailsFormScreen } from '../screens/CatchDetailsFormScreen';
import { JourneyEmptyScreen } from '../screens/JourneyEmptyScreen';
import { JourneyGalleryScreen } from '../screens/JourneyGalleryScreen';
import { CatchDetailScreen } from '../screens/CatchDetailScreen';
import { catchPhotoUri } from '../lib/defaultPhotos';
import { createFightSimulator } from '../sim/fightSimulator';
import {
  DESIGN_LAB_STATES,
  FIXTURE_CATCHES,
  FIXTURE_FORM,
  FIXTURE_LOCATIONS,
  FIXTURE_SCORE_CATCH,
  FIXTURE_LOST_CATCH,
  connectionForState,
  type DesignLabStateId,
} from './fixtures';
import type { Catch, CatchForm, Tab } from '../types';

const LIVE_FIGHT_STATES: DesignLabStateId[] = [
  'fight_low',
  'fight_stable',
  'fight_rising',
  'fight_high',
];

/**
 * Development-only Design Lab. Renders real production screens with fixtures.
 * Buttons navigate between representative states. Never writes production catch
 * storage or drives live BLE. Fight states run a live tension/drag simulator.
 */
export function DesignLab() {
  const [stateId, setStateId] = useState<DesignLabStateId>('connected');
  const [panelOpen, setPanelOpen] = useState(true);
  const [location, setLocation] = useState('Lake Sammamish');
  const [locOpen, setLocOpen] = useState(false);
  const [form, setForm] = useState<CatchForm>(FIXTURE_FORM);
  const [catches, setCatches] = useState<Catch[]>(() => [...FIXTURE_CATCHES]);
  const [detailId, setDetailId] = useState<string | null>(FIXTURE_CATCHES[0]?.id ?? null);
  const [scoreDisplay, setScoreDisplay] = useState(FIXTURE_SCORE_CATCH.score);
  const [liveSamples, setLiveSamples] = useState<number[]>([]);
  const [liveElapsed, setLiveElapsed] = useState(0);
  const simRef = useRef(createFightSimulator({ intervalMs: 120 }));
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const conn = connectionForState(stateId);
  const go = useCallback((id: DesignLabStateId) => {
    setStateId(id);
    setPanelOpen(false);
  }, []);

  // Live tension simulation for fight screens
  useEffect(() => {
    const live = LIVE_FIGHT_STATES.includes(stateId);
    if (!live) {
      simRef.current.stop();
      return undefined;
    }
    setLiveSamples([]);
    setLiveElapsed(0);
    const started = Date.now();
    const elapsedTimer = setInterval(() => {
      setLiveElapsed(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    simRef.current.start((sample) => {
      setLiveSamples((prev) => {
        const next = [...prev, sample.value];
        return next.length > 160 ? next.slice(-160) : next;
      });
    });
    return () => {
      simRef.current.stop();
      clearInterval(elapsedTimer);
    };
  }, [stateId]);

  // Simulate connect / start / end transitions
  useEffect(() => {
    if (stateId === 'connecting') {
      const t = setTimeout(() => go('connected'), 900);
      return () => clearTimeout(t);
    }
    if (stateId === 'starting_session') {
      const t = setTimeout(() => go('fight_stable'), 900);
      return () => clearTimeout(t);
    }
    if (stateId === 'ending_fight') {
      const t = setTimeout(() => go('catch_score'), 1100);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [stateId, go]);

  // Animate score when entering catch_score
  useEffect(() => {
    if (stateId !== 'catch_score') return;
    setScoreDisplay(0);
    let v = 0;
    const target = FIXTURE_SCORE_CATCH.score;
    const step = Math.max(1, Math.round(target / 20));
    const id = setInterval(() => {
      v = Math.min(target, v + step);
      setScoreDisplay(v);
      if (v >= target) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [stateId]);

  const openDetail = useCallback(
    (id: string) => {
      setDetailId(id);
      const item = catches.find((c) => c.id === id);
      if (!item) {
        go('journey_multiple');
        return;
      }
      if (!item.photo && !item.imageUri) go('detail_no_photo');
      else if (item.id === 'lab-long') go('long_text');
      else go('detail_with_photo');
    },
    [catches, go]
  );

  const detailCatch = useMemo(() => {
    if (stateId === 'long_text') return catches.find((c) => c.id === 'lab-long') ?? FIXTURE_CATCHES[3]!;
    if (stateId === 'detail_no_photo' || stateId === 'missing_optional') {
      return catches.find((c) => c.id === 'lab-3') ?? FIXTURE_CATCHES[2]!;
    }
    return catches.find((c) => c.id === detailId) ?? catches[0] ?? FIXTURE_CATCHES[0]!;
  }, [stateId, catches, detailId]);

  const preview = (() => {
    switch (stateId) {
      case 'disconnected':
      case 'connecting':
      case 'connected':
      case 'connection_error':
        return (
          <HomeScreen
            connectionStatus={conn.status}
            connecting={conn.connecting}
            error={conn.error}
            onConnect={() => go(stateId === 'connection_error' ? 'connecting' : 'connecting')}
            onStartFishing={() => go('fishing_ready')}
            onOpenJourney={() => go(catches.length ? 'journey_multiple' : 'journey_empty')}
            onOpenCatch={openDetail}
            summary={{
              total: catches.length,
              averageScore: Math.round(catches.reduce((s, c) => s + c.score, 0) / Math.max(catches.length, 1)),
              bestScore: Math.max(...catches.map((c) => c.score), 0),
            }}
            recentCatch={catches[0] ?? null}
            greeting="Design Lab preview"
          />
        );
      case 'fishing_ready':
      case 'starting_session':
        return (
          <FishingReadyScreen
            location={location}
            connectionStatus={stateId === 'starting_session' ? 'connecting' : 'connected'}
            onOpenLocation={() => setLocOpen(true)}
            onStartFight={() => go('starting_session')}
            onSimulateFight={() => go('fight_stable')}
            onConnect={() => go('connecting')}
            connecting={stateId === 'starting_session'}
            error={null}
          />
        );
      case 'fight_low':
      case 'fight_stable':
      case 'fight_rising':
      case 'fight_high':
      case 'ending_fight':
        return (
          <FishingActiveScreen
            location={location}
            elapsed={stateId === 'ending_fight' ? liveElapsed || 42 : liveElapsed}
            samples={liveSamples.length ? liveSamples : [48, 50, 49]}
            sampleCount={liveSamples.length || 3}
            expectedCount={null}
            receiving
            onLandFish={() => go(stateId === 'ending_fight' ? 'catch_score' : 'ending_fight')}
            onLoseFish={() => go('fight_lost')}
            awaitingEnd={stateId === 'ending_fight'}
            stopping={false}
            simulated={stateId !== 'ending_fight'}
          />
        );
      case 'catch_score':
        return (
          <CatchScoreScreen
            scoreDisplay={scoreDisplay}
            catchItem={FIXTURE_SCORE_CATCH}
            onAddDetails={() => {
              setForm(FIXTURE_FORM);
              go('catch_details');
            }}
            onSkip={() => go('journey_multiple')}
          />
        );
      case 'fight_lost':
        return (
          <FightLostScreen
            catchItem={FIXTURE_LOST_CATCH}
            onSaveNotes={() => {
              setForm({ ...FIXTURE_FORM, species: '', size: '', weight: '', photo: false, imageUri: undefined });
              go('catch_details');
            }}
            onSaveToJourney={() => go('journey_multiple')}
            onTryAgain={() => go('fishing_ready')}
          />
        );
      case 'catch_details':
        return (
          <CatchDetailsFormScreen
            title="Add Catch Details"
            form={form}
            onSpecies={(v) => setForm((f) => ({ ...f, species: v }))}
            onSize={(v) => setForm((f) => ({ ...f, size: v.replace(/[^0-9.]/g, '') }))}
            onWeight={(v) => setForm((f) => ({ ...f, weight: v.replace(/[^0-9.]/g, '') }))}
            onPhotoChange={(photo, imageUri) =>
              setForm((f) => ({
                ...f,
                photo,
                imageUri: photo ? imageUri ?? catchPhotoUri('trout') : undefined,
              }))
            }
            autoScore={78}
            autoFightSeconds={64}
            autoLocation={location}
            onChangeLocation={() => setLocOpen(true)}
            autoDateTime="July 18, 2026 · 6:42 AM"
            saveLabel="Save to Journey"
            secondaryLabel="Skip Details and Save"
            onSave={() => {
              const next: Catch = {
                ...FIXTURE_SCORE_CATCH,
                id: `lab-${Date.now()}`,
                species: form.species,
                size: form.size,
                weight: form.weight,
                photo: form.photo || Boolean(form.imageUri),
                imageUri: form.imageUri ?? (form.photo ? catchPhotoUri('trout') : undefined),
                location,
              };
              setCatches((cs) => [next, ...cs]);
              setDetailId(next.id);
              go('journey_multiple');
            }}
            onSecondary={() => go('journey_multiple')}
          />
        );
      case 'journey_empty':
        return <JourneyEmptyScreen onStartFishing={() => go('fishing_ready')} />;
      case 'journey_multiple':
        return (
          <JourneyGalleryScreen
            catches={catches}
            onOpen={openDetail}
            onStartFishing={() => go('fishing_ready')}
          />
        );
      case 'detail_with_photo':
      case 'detail_no_photo':
      case 'long_text':
      case 'missing_optional':
        return (
          <CatchDetailScreen
            item={detailCatch}
            onClose={() => go('journey_multiple')}
            onEdit={() => {
              setForm({
                species: detailCatch.species,
                size: detailCatch.size,
                weight: detailCatch.weight,
                photo: detailCatch.photo,
                imageUri: detailCatch.imageUri,
              });
              go('catch_details');
            }}
            onDelete={() => {
              setCatches((cs) => cs.filter((c) => c.id !== detailCatch.id));
              go('journey_multiple');
            }}
          />
        );
      case 'loading':
        return (
          <View style={styles.centerFill}>
            <Text style={styles.loadingText}>Loading DragonFly…</Text>
            <Pressable onPress={() => go('connected')} style={styles.inlineBtn}>
              <Text style={styles.inlineBtnLabel}>Continue</Text>
            </Pressable>
          </View>
        );
      case 'general_error':
        return (
          <ErrorState
            title="Could not save session"
            body="Check storage permissions and try ending the fight again. Your BLE connection was not modified."
            actionLabel="Back to Fishing"
            onAction={() => go('fishing_ready')}
          />
        );
      default:
        return null;
    }
  })();

  const groups = useMemo(() => {
    const map = new Map<string, typeof DESIGN_LAB_STATES>();
    for (const s of DESIGN_LAB_STATES) {
      const list = map.get(s.group) ?? [];
      list.push(s);
      map.set(s.group, list);
    }
    return [...map.entries()];
  }, []);

  const panel = (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      <Text style={styles.labTitle}>Design Lab</Text>
      <Text style={styles.labBody}>
        Development only. Buttons navigate between states. No live BLE. Fixture catches stay in memory.
      </Text>
      {groups.map(([group, items]) => (
        <View key={group} style={styles.group}>
          <Text style={styles.groupTitle}>{group}</Text>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.stateBtn, stateId === item.id && styles.stateBtnActive]}
              onPress={() => {
                setStateId(item.id);
                setPanelOpen(false);
              }}
            >
              <Text style={[styles.stateLabel, stateId === item.id && styles.stateLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const labTab: Tab =
    stateId.startsWith('journey') ||
    stateId.startsWith('detail') ||
    stateId === 'long_text' ||
    stateId === 'missing_optional'
      ? 'journey'
      : stateId.startsWith('fishing') ||
          stateId.startsWith('fight') ||
          stateId.startsWith('catch') ||
          stateId === 'starting_session' ||
          stateId === 'ending_fight'
        ? 'fishing'
        : 'home';

  const showLabTab =
    !stateId.startsWith('fight') &&
    stateId !== 'ending_fight' &&
    stateId !== 'catch_score' &&
    stateId !== 'fight_lost' &&
    stateId !== 'catch_details';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.layout, wide && styles.layoutWide]}>
        {(wide || panelOpen) && <View style={[styles.panelWrap, !wide && styles.panelOverlay]}>{panel}</View>}
        <View style={styles.previewShell}>
          <View style={styles.previewBar}>
            {!wide ? (
              <Pressable onPress={() => setPanelOpen((v) => !v)} style={styles.toggle}>
                <Text style={styles.toggleLabel}>{panelOpen ? 'Hide states' : 'Show states'}</Text>
              </Pressable>
            ) : (
              <Text style={styles.previewLabel}>Preview — buttons work</Text>
            )}
            <Text style={styles.currentState}>{stateId}</Text>
          </View>
          <View style={styles.phone}>
            <View style={styles.phoneBody}>{preview}</View>
            {showLabTab ? (
              <TabBar
                tab={labTab}
                onHome={() => go('connected')}
                onJourney={() => go(catches.length ? 'journey_multiple' : 'journey_empty')}
                onFishOn={() => {
                  if (labTab === 'fishing') go('fight_stable');
                  else go('fishing_ready');
                }}
                fishOnLabel="Fish On"
              />
            ) : null}
          </View>
        </View>
      </View>
      <LocationSheet
        visible={locOpen}
        locations={FIXTURE_LOCATIONS}
        current={location}
        onSelect={(name) => {
          setLocation(name);
          setLocOpen(false);
        }}
        onClose={() => setLocOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1220' },
  layout: { flex: 1 },
  layoutWide: { flexDirection: 'row' },
  panelWrap: {
    width: 300,
    backgroundColor: '#121A2A',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
  },
  panelOverlay: {
    position: 'absolute',
    zIndex: 20,
    top: 48,
    left: 0,
    bottom: 0,
    width: '100%',
    maxWidth: 360,
  },
  panel: { flex: 1 },
  panelContent: { padding: 16, paddingBottom: 40 },
  labTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    color: colors.textOnDark,
  },
  labBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textOnDarkSecondary,
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 17,
  },
  group: { marginBottom: 14 },
  groupTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.copperSoft,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  stateBtn: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    marginBottom: 4,
  },
  stateBtnActive: {
    backgroundColor: 'rgba(184,116,68,0.22)',
  },
  stateLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textOnDarkSecondary,
  },
  stateLabelActive: {
    color: colors.textOnDark,
    fontFamily: fonts.bodySemiBold,
  },
  previewShell: { flex: 1 },
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  previewLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textOnDarkSecondary,
  },
  toggle: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  toggleLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textOnDark,
  },
  currentState: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.lakeSoft,
  },
  phone: {
    flex: 1,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.background,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    margin: 12,
  },
  phoneBody: {
    flex: 1,
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 16,
  },
  loadingText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textSecondary,
  },
  inlineBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: colors.copper,
  },
  inlineBtnLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textOnAccent,
  },
});
