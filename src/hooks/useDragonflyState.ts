import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Catch, CatchForm, FightOutcome, FishingTrip, Phase, Route, Tab } from '../types';
import { fmtDate, fmtTime } from '../lib/format';
import {
  computeJourneySummary,
  loadCatches,
  loadGear,
  loadLocation,
  loadTrips,
  saveCatches,
  saveGear,
  saveLocation,
  saveTrips,
  seedCatches,
} from '../lib/storage';
import { buildSessionAnalytics } from '../coaching/analytics';
import { computeSignalStats } from '../coaching/engine';
import { createFightSimulator } from '../sim/fightSimulator';
import { isOpenAiConfigured } from '../ai/openaiConfig';
import { reviewFightWithOpenAI } from '../ai/fightReview';
import { gearSummary, type GearConfig } from '../lib/gear';
import { DEFAULT_LOCATION, LOCATION_NAMES } from '../lib/locations';
import { useBleSession } from './useBleSession';

export const LOCATIONS = LOCATION_NAMES;

export type AiReviewStatus = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';

const EMPTY_FORM: CatchForm = { species: '', size: '', weight: '', photo: false, imageUri: undefined };

function finalizeCatchFromSamples(
  samples: number[],
  fightSeconds: number,
  location: string,
  outcome: FightOutcome,
  gear: GearConfig | null
): Catch {
  const analytics = buildSessionAnalytics(samples, outcome);
  const avg =
    samples.length > 0 ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;
  const score = Math.round(avg);
  const now = new Date();
  return {
    id: `c${Date.now()}`,
    species: '',
    score,
    fightSeconds,
    size: '',
    weight: '',
    location,
    date: fmtDate(now),
    time: fmtTime(now),
    photo: false,
    outcome,
    sampleCount: analytics.sampleCount,
    averageSignal: analytics.averageSignal ?? undefined,
    minimumSignal: analytics.minimumSignal ?? undefined,
    maximumSignal: analytics.maximumSignal ?? undefined,
    signalVariability: analytics.signalVariability ?? undefined,
    relativeTensionSeries: analytics.relativeTensionSeries,
    coachingSummary: analytics.coachingSummary,
    coachingEvents: analytics.coachingEvents,
    whatWentWell: analytics.whatWentWell,
    improvement: analytics.improvement,
    scoreSource: 'average',
    rodId: gear?.rodId,
    lineId: gear?.lineId,
  };
}

export function useDragonflyState() {
  const [tab, setTab] = useState<Tab>('home');
  const [phase, setPhase] = useState<Phase>('ready');
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [elapsed, setElapsed] = useState(0);
  const [locOpen, setLocOpen] = useState(false);
  const [lastCatch, setLastCatch] = useState<Catch | null>(null);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [form, setForm] = useState<CatchForm>(EMPTY_FORM);
  const [detailView, setDetailView] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [customLocations, setCustomLocations] = useState<string[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [simValues, setSimValues] = useState<number[]>([]);
  const [simEnding, setSimEnding] = useState(false);
  const [aiReviewStatus, setAiReviewStatus] = useState<AiReviewStatus>('idle');
  const [gear, setGear] = useState<GearConfig | null>(null);
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [gearReturnPhase, setGearReturnPhase] = useState<Phase>('ready');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const lastValuesRef = useRef<number[]>([]);
  const simRef = useRef(createFightSimulator({ intervalMs: 120 }));
  const pendingOutcomeRef = useRef<FightOutcome>('landed');
  const aiReviewGenRef = useRef(0);
  const gearRef = useRef<GearConfig | null>(null);

  const ble = useBleSession();

  useEffect(() => {
    gearRef.current = gear;
  }, [gear]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedCatches, storedLocation, storedGear, storedTrips] = await Promise.all([
        loadCatches(),
        loadLocation(),
        loadGear(),
        loadTrips(),
      ]);
      if (cancelled) return;
      setCatches(storedCatches ?? seedCatches());
      if (storedLocation) setLocation(storedLocation);
      if (storedGear) setGear(storedGear);
      setTrips(storedTrips);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCatches(catches);
  }, [catches, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveLocation(location);
  }, [location, hydrated]);

  useEffect(() => {
    if (!hydrated || !gear) return;
    saveGear(gear);
  }, [gear, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveTrips(trips);
  }, [trips, hydrated]);

  useEffect(() => {
    if (!simulating) lastValuesRef.current = ble.values;
  }, [ble.values, simulating]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (scoreTimerRef.current) clearInterval(scoreTimerRef.current);
      simRef.current.stop();
    };
  }, []);

  const locations = useMemo(() => {
    const extras = customLocations.filter((l) => !LOCATIONS.includes(l));
    return [...LOCATIONS, ...extras];
  }, [customLocations]);

  const journeySummary = useMemo(() => computeJourneySummary(catches), [catches]);

  const liveValues = simulating ? simValues : ble.values;
  const signalStats = useMemo(
    () => computeSignalStats(liveValues, simulating ? null : ble.expectedCount),
    [liveValues, simulating, ble.expectedCount]
  );

  const clearFightTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const beginFightTimer = useCallback(() => {
    clearFightTimer();
    elapsedRef.current = 0;
    setElapsed(0);
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
  }, [clearFightTimer]);

  const go = useCallback((next: Tab) => {
    setTab(next);
    setDetailView(null);
    setPhase((p) => (next !== 'fishing' && p !== 'active' ? 'ready' : p));
  }, []);
  const goHome = useCallback(() => go('home'), [go]);
  const goFishing = useCallback(() => go('fishing'), [go]);
  const goJourney = useCallback(() => go('journey'), [go]);

  const openLoc = useCallback(() => setLocOpen(true), []);
  const closeLoc = useCallback(() => setLocOpen(false), []);
  const setLoc = useCallback((name: string) => {
    setLocation(name);
    setCustomLocations((prev) => (LOCATIONS.includes(name) || prev.includes(name) ? prev : [...prev, name]));
    setLocOpen(false);
  }, []);

  const animateScore = useCallback((target: number) => {
    if (scoreTimerRef.current) clearInterval(scoreTimerRef.current);
    let v = 0;
    const step = Math.max(1, Math.round(target / 22));
    scoreTimerRef.current = setInterval(() => {
      v += step;
      if (v >= target) {
        v = target;
        if (scoreTimerRef.current) clearInterval(scoreTimerRef.current);
      }
      setScoreDisplay(v);
    }, 40);
  }, []);

  const requestAiReview = useCallback(
    (cat: Catch, samples: number[]) => {
      const gen = ++aiReviewGenRef.current;
      if (!isOpenAiConfigured()) {
        setAiReviewStatus('fallback');
        if (cat.outcome !== 'lost') animateScore(cat.score);
        else setScoreDisplay(cat.score);
        return;
      }
      setAiReviewStatus('loading');
      // Hold score until AI returns — never flash the local average then swap.
      setScoreDisplay(0);
      void (async () => {
        try {
          const review = await reviewFightWithOpenAI({
            outcome: cat.outcome === 'lost' ? 'lost' : 'landed',
            fightSeconds: cat.fightSeconds,
            location: cat.location,
            samples,
            averageTension: cat.averageSignal ?? cat.score,
          });
          if (gen !== aiReviewGenRef.current) return;
          const enriched: Catch = {
            ...cat,
            score: review.score,
            coachingSummary: `${review.highlight} · Tip: ${review.tip}`,
            whatWentWell: review.highlight,
            improvement: review.tip,
            scoreSource: 'openai',
            scoreRationale: review.highlight,
            aiModel: review.model,
            consistencyIndex: review.consistency,
            controlIndex: review.control,
            recoveryIndex: review.recovery,
          };
          setLastCatch(enriched);
          if (enriched.outcome !== 'lost') {
            animateScore(enriched.score);
          } else {
            setScoreDisplay(enriched.score);
          }
          setAiReviewStatus('ready');
        } catch {
          if (gen !== aiReviewGenRef.current) return;
          // Fallback once — show local average only after AI fails.
          setAiReviewStatus('error');
          if (cat.outcome !== 'lost') animateScore(cat.score);
          else setScoreDisplay(cat.score);
        }
      })();
    },
    [animateScore]
  );

  const presentScore = useCallback(
    (cat: Catch, samples: number[]) => {
      setPhase(cat.outcome === 'lost' ? 'lost' : 'score');
      setLastCatch(cat);
      setForm(EMPTY_FORM);
      if (isOpenAiConfigured()) {
        setScoreDisplay(0);
        requestAiReview(cat, samples);
      } else {
        setAiReviewStatus('fallback');
        if (cat.outcome !== 'lost') {
          setScoreDisplay(0);
          animateScore(cat.score);
        } else {
          setScoreDisplay(cat.score);
        }
      }
    },
    [animateScore, requestAiReview]
  );

  const startFight = useCallback(async () => {
    setTab('fishing');
    setSimulating(false);
    setSimValues([]);
    pendingOutcomeRef.current = 'landed';
    const ok = await ble.start();
    if (!ok) return;
    beginFightTimer();
    setPhase('active');
  }, [ble, beginFightTimer]);

  const startSimulatedFight = useCallback(() => {
    setTab('fishing');
    setDetailView(null);
    setSimulating(true);
    setSimEnding(false);
    setSimValues([]);
    lastValuesRef.current = [];
    pendingOutcomeRef.current = 'landed';
    beginFightTimer();
    setPhase('active');
    simRef.current.start((sample) => {
      setSimValues((prev) => {
        const next = [...prev, sample.value];
        lastValuesRef.current = next;
        return next.length > 160 ? next.slice(-160) : next;
      });
    });
  }, [beginFightTimer]);

  const endFight = useCallback(
    (outcome: FightOutcome) => {
      pendingOutcomeRef.current = outcome;
      if (simulating) {
        if (simEnding) return;
        setSimEnding(true);
        simRef.current.stop();
        clearFightTimer();
        const samples = lastValuesRef.current;
        const cat = finalizeCatchFromSamples(
          samples,
          elapsedRef.current,
          location,
          outcome,
          gearRef.current
        );
        setSimulating(false);
        setSimEnding(false);
        presentScore(cat, samples);
        return;
      }
      ble.stop();
    },
    [simulating, simEnding, ble, clearFightTimer, location, presentScore]
  );

  const landFish = useCallback(() => endFight('landed'), [endFight]);
  const loseFish = useCallback(() => endFight('lost'), [endFight]);

  useEffect(() => {
    if (ble.finalScore == null || simulating) return;
    clearFightTimer();
    const outcome = pendingOutcomeRef.current;
    const samples = lastValuesRef.current;
    const analytics = buildSessionAnalytics(samples, outcome);
    const now = new Date();
    const cat: Catch = {
      id: `c${Date.now()}`,
      species: '',
      score: ble.finalScore,
      fightSeconds: elapsedRef.current,
      size: '',
      weight: '',
      location,
      date: fmtDate(now),
      time: fmtTime(now),
      photo: false,
      outcome,
      sampleCount: analytics.sampleCount,
      averageSignal: analytics.averageSignal ?? undefined,
      minimumSignal: analytics.minimumSignal ?? undefined,
      maximumSignal: analytics.maximumSignal ?? undefined,
      signalVariability: analytics.signalVariability ?? undefined,
      relativeTensionSeries: analytics.relativeTensionSeries,
      coachingSummary: analytics.coachingSummary,
      coachingEvents: analytics.coachingEvents,
      whatWentWell: analytics.whatWentWell,
      improvement: analytics.improvement,
      scoreSource: 'average',
      rodId: gearRef.current?.rodId,
      lineId: gearRef.current?.lineId,
    };
    pendingOutcomeRef.current = 'landed';
    presentScore(cat, samples);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ble.finalScore]);

  useEffect(() => {
    if (!ble.error || simulating) return;
    if (phase !== 'ready') {
      clearFightTimer();
      setPhase('ready');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ble.error]);

  const gotoDetails = useCallback(() => {
    setPhase('details');
    setEditing(false);
  }, []);

  const setFormField = useCallback(<K extends keyof CatchForm>(key: K, value: CatchForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);
  const onSpecies = useCallback((value: string) => setFormField('species', value), [setFormField]);
  const onSize = useCallback((value: string) => setFormField('size', value.replace(/[^0-9.]/g, '')), [setFormField]);
  const onWeight = useCallback((value: string) => setFormField('weight', value.replace(/[^0-9.]/g, '')), [setFormField]);
  const onPhotoChange = useCallback((photo: boolean, imageUri?: string) => {
    setForm((f) => ({ ...f, photo, imageUri: photo ? imageUri : undefined }));
  }, []);

  const saveCatch = useCallback(() => {
    if (editing) {
      const editId = detailView;
      setCatches((cs) =>
        cs.map((c) =>
          c.id === editId
            ? {
                ...c,
                species: form.species,
                size: form.size,
                weight: form.weight,
                photo: form.photo || Boolean(form.imageUri),
                imageUri: form.imageUri,
              }
            : c
        )
      );
      setPhase('ready');
      setEditing(false);
    } else if (lastCatch) {
      const cat: Catch = {
        ...lastCatch,
        species: form.species,
        size: form.size,
        weight: form.weight,
        photo: form.photo || Boolean(form.imageUri),
        imageUri: form.imageUri,
      };
      setCatches((cs) => [cat, ...cs]);
      setPhase('ready');
      setTab('journey');
      setLastCatch(null);
      setDetailView(null);
    }
  }, [editing, detailView, form, lastCatch]);

  const skipSave = useCallback(() => {
    if (!lastCatch) return;
    setCatches((cs) => [{ ...lastCatch }, ...cs]);
    setPhase('ready');
    setTab('journey');
    setLastCatch(null);
    setDetailView(null);
  }, [lastCatch]);

  const cancelEdit = useCallback(() => {
    setPhase('ready');
    setEditing(false);
  }, []);

  const openDetail = useCallback((id: string) => {
    setDetailView(id);
    setTab('journey');
    setPhase('ready');
  }, []);
  const closeDetail = useCallback(() => setDetailView(null), []);

  const editCatch = useCallback(() => {
    const c = catches.find((x) => x.id === detailView);
    if (!c) return;
    setPhase('details');
    setEditing(true);
    setForm({
      species: c.species,
      size: c.size,
      weight: c.weight,
      photo: c.photo,
      imageUri: c.imageUri,
    });
  }, [catches, detailView]);

  const deleteCatch = useCallback(() => {
    setCatches((cs) => cs.filter((c) => c.id !== detailView));
    setDetailView(null);
  }, [detailView]);

  const startFishing = useCallback(() => {
    setTab('fishing');
    setDetailView(null);
    if (!gearRef.current) {
      setGearReturnPhase('ready');
      setPhase('gear');
      return;
    }
    setPhase('ready');
  }, []);

  const goSocial = useCallback(() => {
    setTab('social');
    setDetailView(null);
    if (phase !== 'active') setPhase('ready');
  }, [phase]);

  const goSettings = useCallback(() => {
    setTab('settings');
    setDetailView(null);
    if (phase !== 'active') setPhase('ready');
  }, [phase]);

  const openGearSetup = useCallback((returnPhase: Phase = 'ready') => {
    setGearReturnPhase(returnPhase);
    setTab('fishing');
    setPhase('gear');
    setDetailView(null);
  }, []);

  const saveGearConfig = useCallback(
    (next: GearConfig) => {
      setGear(next);
      setPhase(gearReturnPhase === 'gear' ? 'ready' : gearReturnPhase);
      setTab('fishing');
    },
    [gearReturnPhase]
  );

  const skipGearSetup = useCallback(() => {
    setPhase('ready');
    setTab('fishing');
  }, []);

  const createTrip = useCallback((draft: Omit<FishingTrip, 'id' | 'createdAt'>) => {
    const trip: FishingTrip = {
      ...draft,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTrips((prev) => [trip, ...prev]);
  }, []);

  /** Center nav: open Fishing, start fight if connected, or ask before simulating. */
  const onFishOn = useCallback((): 'navigated' | 'needs_choice' | 'started' | 'ignored' => {
    if (phase === 'active') return 'ignored';
    if (tab === 'fishing' && phase === 'ready') {
      if (ble.connectionStatus === 'connected') {
        void startFight();
        return 'started';
      }
      return 'needs_choice';
    }
    startFishing();
    return 'navigated';
  }, [phase, tab, ble.connectionStatus, startFight, startFishing]);

  let route: Route;
  if (phase === 'details') route = 'details';
  else if (phase === 'gear') route = 'gear';
  else if (detailView) route = 'detail';
  else if (tab === 'home') route = 'home';
  else if (tab === 'social') route = 'social';
  else if (tab === 'settings') route = 'settings';
  else if (tab === 'journey') route = catches.length ? 'gallery' : 'empty';
  else route = phase;

  return {
    hydrated,
    tab,
    phase,
    location,
    elapsed,
    locOpen,
    lastCatch,
    scoreDisplay,
    aiReviewStatus,
    form,
    detailView,
    editing,
    catches,
    trips,
    gear,
    gearLabel: gearSummary(gear),
    route,
    locations,
    journeySummary,
    simulating,
    ble: {
      connecting: ble.starting || ble.connectionStatus === 'connecting',
      awaitingEnd: ble.awaitingEnd || simEnding,
      stopping: ble.stopping || simEnding,
      error: ble.error,
      connectionStatus: ble.connectionStatus,
      setupConnecting: ble.connecting,
      connectError: ble.connectError,
      values: liveValues,
      sampleCount: liveValues.length,
      expectedCount: simulating ? null : ble.expectedCount,
      receiving: simulating ? liveValues.length > 0 : ble.receiving,
      collecting: simulating || ble.collecting,
      latestSample: signalStats.latest,
      rollingAverage: signalStats.rollingAverage,
      trend: signalStats.trend,
    },
    actions: {
      goHome,
      goFishing,
      goJourney,
      goSocial,
      goSettings,
      openLoc,
      closeLoc,
      setLoc,
      startFight,
      startSimulatedFight,
      landFish,
      loseFish,
      endFight,
      onFishOn,
      gotoDetails,
      onSpecies,
      onSize,
      onWeight,
      onPhotoChange,
      saveCatch,
      skipSave,
      cancelEdit,
      openDetail,
      closeDetail,
      editCatch,
      deleteCatch,
      startFishing,
      connectDevice: ble.connect,
      openGearSetup,
      saveGearConfig,
      skipGearSetup,
      createTrip,
    },
  };
}

export type DragonflyState = ReturnType<typeof useDragonflyState>;
