import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Catch, FishingTrip } from '../types';
import type { GearConfig } from './gear';
import { catchPhotoUri, defaultPhotoForCatch } from './defaultPhotos';

const CATCHES_KEY = 'dragonfly.catches';
const LOCATION_KEY = 'dragonfly.location';
const GEAR_KEY = 'dragonfly.gear';
const TRIPS_KEY = 'dragonfly.trips';

export const DEFAULT_LOCATION = 'Lake Sammamish';

export function seedCatches(): Catch[] {
  return [
    {
      id: 'c1',
      species: 'Rainbow Trout',
      score: 75,
      fightSeconds: 42,
      size: '17',
      weight: '2.3',
      location: 'Lake Sammamish',
      date: 'July 19, 2026',
      time: '7:12 AM',
      photo: true,
      imageUri: catchPhotoUri('trout'),
    },
    {
      id: 'c2',
      species: 'Largemouth Bass',
      score: 68,
      fightSeconds: 51,
      size: '15',
      weight: '2.8',
      location: 'Lake Washington',
      date: 'July 14, 2026',
      time: '6:48 AM',
      photo: true,
      imageUri: catchPhotoUri('bass'),
    },
    {
      id: 'c3',
      species: '',
      score: 62,
      fightSeconds: 28,
      size: '',
      weight: '',
      location: '',
      date: 'July 12, 2026',
      time: '5:58 AM',
      photo: false,
    },
  ];
}

/** Migrate legacy catch records without crashing on old shapes. */
export function normalizeCatch(raw: Partial<Catch> & { id: string }): Catch {
  const species = raw.species ?? '';
  const photo = Boolean(raw.photo || raw.imageUri);
  const imageUri =
    raw.imageUri ||
    (photo ? defaultPhotoForCatch(raw.id, species) : undefined);

  return {
    id: raw.id,
    species,
    score: typeof raw.score === 'number' ? raw.score : 0,
    fightSeconds: typeof raw.fightSeconds === 'number' ? raw.fightSeconds : 0,
    size: raw.size ?? '',
    weight: raw.weight ?? '',
    location: raw.location ?? '',
    date: raw.date ?? '',
    time: raw.time ?? '',
    photo,
    imageUri,
    outcome: raw.outcome === 'lost' ? 'lost' : raw.outcome === 'landed' ? 'landed' : 'landed',
    sampleCount: raw.sampleCount,
    averageSignal: raw.averageSignal,
    minimumSignal: raw.minimumSignal,
    maximumSignal: raw.maximumSignal,
    signalVariability: raw.signalVariability,
    relativeTensionSeries: raw.relativeTensionSeries,
    coachingSummary: raw.coachingSummary,
    coachingEvents: raw.coachingEvents,
    whatWentWell: raw.whatWentWell,
    improvement: raw.improvement,
    scoreSource: raw.scoreSource === 'openai' ? 'openai' : raw.scoreSource === 'average' ? 'average' : undefined,
    scoreRationale: raw.scoreRationale,
    aiModel: raw.aiModel,
    rodId: raw.rodId,
    lineId: raw.lineId,
  };
}

export async function loadCatches(): Promise<Catch[] | null> {
  const raw = await AsyncStorage.getItem(CATCHES_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Array<Partial<Catch> & { id: string }>;
    if (!Array.isArray(parsed)) return null;
    return parsed.map(normalizeCatch);
  } catch {
    return null;
  }
}

export async function saveCatches(catches: Catch[]): Promise<void> {
  await AsyncStorage.setItem(CATCHES_KEY, JSON.stringify(catches));
}

export async function loadLocation(): Promise<string | null> {
  return AsyncStorage.getItem(LOCATION_KEY);
}

export async function saveLocation(location: string): Promise<void> {
  await AsyncStorage.setItem(LOCATION_KEY, location);
}

export async function loadGear(): Promise<GearConfig | null> {
  const raw = await AsyncStorage.getItem(GEAR_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GearConfig;
  } catch {
    return null;
  }
}

export async function saveGear(gear: GearConfig): Promise<void> {
  await AsyncStorage.setItem(GEAR_KEY, JSON.stringify(gear));
}

export async function loadTrips(): Promise<FishingTrip[]> {
  const raw = await AsyncStorage.getItem(TRIPS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as FishingTrip[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveTrips(trips: FishingTrip[]): Promise<void> {
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export function computeJourneySummary(catches: Catch[]) {
  if (!catches.length) {
    return { total: 0, averageScore: null as number | null, bestScore: null as number | null };
  }
  const total = catches.length;
  const averageScore = Math.round(catches.reduce((s, c) => s + c.score, 0) / total);
  const bestScore = Math.max(...catches.map((c) => c.score));
  return { total, averageScore, bestScore };
}
