import { useCallback, useEffect, useRef, useState } from 'react';
import type { Catch, CatchForm, Phase, Route, Tab } from '../types';
import { fmtDate, fmtTime } from '../lib/format';
import { DEFAULT_LOCATION, loadCatches, loadLocation, saveCatches, saveLocation, seedCatches } from '../lib/storage';
import { useBleSession } from './useBleSession';

export const LOCATIONS = ['Lake Sammamish', 'Lake Washington', 'Snoqualmie River', 'Green Lake', 'Lake Union'];

const EMPTY_FORM: CatchForm = { species: '', size: '', weight: '', photo: false };

export function useDragonflyState() {
  const [tab, setTab] = useState<Tab>('fishing');
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

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const ble = useBleSession();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedCatches, storedLocation] = await Promise.all([loadCatches(), loadLocation()]);
      if (cancelled) return;
      setCatches(storedCatches ?? seedCatches());
      if (storedLocation) setLocation(storedLocation);
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (scoreTimerRef.current) clearInterval(scoreTimerRef.current);
    };
  }, []);

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

  const startFight = useCallback(async () => {
    setTab('fishing');
    const ok = await ble.start();
    if (!ok) return; // ble.error is set; stays on the Ready screen.
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('active');
    elapsedRef.current = 0;
    setElapsed(0);
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
  }, [ble]);

  const landFish = useCallback(() => {
    ble.stop();
  }, [ble]);

  // The BLE session resolves the real score asynchronously (only once END arrives) — build
  // the Catch and move to the score screen when it does.
  useEffect(() => {
    if (ble.finalScore == null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const sec = elapsedRef.current;
    const now = new Date();
    const cat: Catch = {
      id: `c${Date.now()}`, species: '', score: ble.finalScore, fightSeconds: sec,
      size: '', weight: '', location, date: fmtDate(now), time: fmtTime(now), photo: false,
    };
    setPhase('score');
    setLastCatch(cat);
    setScoreDisplay(0);
    setForm(EMPTY_FORM);
    animateScore(ble.finalScore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ble.finalScore]);

  // Any BLE session failure (connect, write, disconnect, invalid data, COUNT mismatch, save
  // failure) aborts without a score and returns the user to the Ready screen to retry.
  useEffect(() => {
    if (!ble.error) return;
    if (phase !== 'ready') {
      if (timerRef.current) clearInterval(timerRef.current);
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
  const togglePhoto = useCallback(() => setForm((f) => ({ ...f, photo: !f.photo })), []);

  const saveCatch = useCallback(() => {
    if (editing) {
      const editId = detailView;
      setCatches((cs) => cs.map((c) => (c.id === editId ? { ...c, ...form } : c)));
      setPhase('ready');
      setEditing(false);
    } else if (lastCatch) {
      const cat: Catch = { ...lastCatch, ...form };
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

  const cancelEdit = useCallback(() => setPhase('ready'), []);

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
    setForm({ species: c.species, size: c.size, weight: c.weight, photo: c.photo });
  }, [catches, detailView]);

  const deleteCatch = useCallback(() => {
    setCatches((cs) => cs.filter((c) => c.id !== detailView));
    setDetailView(null);
  }, [detailView]);

  const startFishing = useCallback(() => {
    setTab('fishing');
    setPhase('ready');
    setDetailView(null);
  }, []);

  let route: Route;
  if (phase === 'details') route = 'details';
  else if (detailView) route = 'detail';
  else if (tab === 'home') route = 'home';
  else if (tab === 'journey') route = catches.length ? 'gallery' : 'empty';
  else route = phase;

  return {
    hydrated,
    tab, phase, location, elapsed, locOpen, lastCatch, scoreDisplay, form,
    detailView, editing, catches, route, locations: LOCATIONS,
    ble: {
      connecting: ble.starting || ble.connectionStatus === 'connecting',
      awaitingEnd: ble.awaitingEnd,
      stopping: ble.stopping,
      error: ble.error,
      connectionStatus: ble.connectionStatus,
      setupConnecting: ble.connecting,
      connectError: ble.connectError,
    },
    actions: {
      goHome, goFishing, goJourney, openLoc, closeLoc, setLoc,
      startFight, landFish, gotoDetails,
      onSpecies, onSize, onWeight, togglePhoto,
      saveCatch, skipSave, cancelEdit,
      openDetail, closeDetail, editCatch, deleteCatch, startFishing,
      connectDevice: ble.connect,
    },
  };
}

export type DragonflyState = ReturnType<typeof useDragonflyState>;
