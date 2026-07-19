import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Catch } from '../types';

const CATCHES_KEY = 'dragonfly.catches';
const LOCATION_KEY = 'dragonfly.location';

export const DEFAULT_LOCATION = 'Lake Sammamish';

export function seedCatches(): Catch[] {
  return [
    {
      id: 'c1', species: 'Rainbow Trout', score: 75, fightSeconds: 42,
      size: '17', weight: '2.3', location: 'Lake Sammamish',
      date: 'July 19, 2026', time: '7:12 AM', photo: true,
    },
    {
      id: 'c2', species: '', score: 62, fightSeconds: 28,
      size: '', weight: '', location: '',
      date: 'July 12, 2026', time: '6:48 AM', photo: false,
    },
  ];
}

export async function loadCatches(): Promise<Catch[] | null> {
  const raw = await AsyncStorage.getItem(CATCHES_KEY);
  return raw ? (JSON.parse(raw) as Catch[]) : null;
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
