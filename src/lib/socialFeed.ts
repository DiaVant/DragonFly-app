import type { Catch, FishingTrip } from '../types';
import { catchPhotoUri } from './defaultPhotos';

export type FeedTab = 'following' | 'club' | 'you';

export interface SocialAthlete {
  id: string;
  name: string;
  handle: string;
  initials: string;
  accent: string;
}

export interface SocialActivity {
  id: string;
  athlete: SocialAthlete;
  kind: 'catch' | 'trip' | 'session';
  title: string;
  subtitle?: string;
  location: string;
  relativeTime: string;
  /** ISO-ish sort key */
  at: string;
  fightSeconds: number;
  score: number;
  fights?: number;
  species?: string;
  caption?: string;
  imageUri?: string;
  /** Multiple photos for trip/session carousels (Strava-style). */
  imageUris?: string[];
  kudos: number;
  comments: number;
  /** When true, this is seeded club content (not the user's). */
  community?: boolean;
  catchId?: string;
  tripId?: string;
}

export const YOU: SocialAthlete = {
  id: 'you',
  name: 'You',
  handle: '@you',
  initials: 'YO',
  accent: '#B87444',
};

/** Seeded club anglers — makes Club feel like a live network. */
export const CLUB_ATHLETES: SocialAthlete[] = [
  { id: 'maya', name: 'Maya Chen', handle: '@mayafish', initials: 'MC', accent: '#4B6A88' },
  { id: 'jordan', name: 'Jordan Hale', handle: '@jhale', initials: 'JH', accent: '#8FA89A' },
  { id: 'sam', name: 'Sam Okoye', handle: '@okoyesam', initials: 'SO', accent: '#9A5F36' },
  { id: 'riley', name: 'Riley Park', handle: '@rileyp', initials: 'RP', accent: '#2F4058' },
];

export const CLUB_FEED: SocialActivity[] = [
  {
    id: 'club-1',
    athlete: CLUB_ATHLETES[0]!,
    kind: 'catch',
    title: 'Dawn bass on the drop-off',
    subtitle: 'Fish On · Landed',
    location: 'Lake Murray',
    relativeTime: '42m ago',
    at: '2099-01-03T08:00:00Z',
    fightSeconds: 214,
    score: 86,
    species: 'Largemouth bass',
    caption: 'Kiddo kept the drag steady after the second run.',
    imageUri: catchPhotoUri('bass'),
    imageUris: [catchPhotoUri('bass')],
    kudos: 24,
    comments: 6,
    community: true,
  },
  {
    id: 'club-2',
    athlete: CLUB_ATHLETES[1]!,
    kind: 'trip',
    title: 'Saturday club outing',
    subtitle: 'Fishing trip · 4 fights',
    location: 'Cooper River',
    relativeTime: '3h ago',
    at: '2099-01-03T05:00:00Z',
    fightSeconds: 982,
    score: 78,
    fights: 4,
    caption: 'Fog lifted around 8. Everyone landed at least one.',
    imageUri: catchPhotoUri('trout'),
    imageUris: [catchPhotoUri('trout'), catchPhotoUri('bass'), catchPhotoUri('cutthroat')],
    kudos: 41,
    comments: 11,
    community: true,
  },
  {
    id: 'club-3',
    athlete: CLUB_ATHLETES[2]!,
    kind: 'session',
    title: 'Practice with the kids',
    subtitle: 'Session · Practice',
    location: 'Neighborhood pond',
    relativeTime: 'Yesterday',
    at: '2099-01-02T18:00:00Z',
    fightSeconds: 360,
    score: 71,
    caption: 'No keepers — plenty of coaching reps.',
    imageUri: catchPhotoUri('cutthroat'),
    imageUris: [catchPhotoUri('cutthroat'), catchPhotoUri('trout')],
    kudos: 18,
    comments: 4,
    community: true,
  },
  {
    id: 'club-4',
    athlete: CLUB_ATHLETES[3]!,
    kind: 'catch',
    title: 'First fish with Dad',
    subtitle: 'Fish On · Landed',
    location: 'Santee Cooper',
    relativeTime: '2d ago',
    at: '2099-01-01T16:00:00Z',
    fightSeconds: 156,
    score: 91,
    species: 'Bluegill',
    caption: 'She set the hook herself. DragonFly kept the line honest.',
    imageUri: catchPhotoUri('bass'),
    imageUris: [catchPhotoUri('bass')],
    kudos: 67,
    comments: 19,
    community: true,
  },
];

export function activityFromCatch(c: Catch): SocialActivity {
  const lost = c.outcome === 'lost';
  return {
    id: `catch-${c.id}`,
    athlete: YOU,
    kind: 'catch',
    title: c.species?.trim()
      ? lost
        ? `${c.species} — fight review`
        : `${c.species}`
      : lost
        ? 'Fight review'
        : 'Catch',
    subtitle: lost ? 'Fish On · Review' : 'Fish On · Landed',
    location: c.location || 'On the water',
    relativeTime: relativeFromDateTime(c.date, c.time),
    at: `${c.date} ${c.time}`,
    fightSeconds: c.fightSeconds,
    score: c.score,
    species: c.species || undefined,
    imageUri: c.imageUri,
    kudos: 0,
    comments: 0,
    catchId: c.id,
  };
}

export function activityFromTrip(trip: FishingTrip, catches: Catch[]): SocialActivity {
  const members = trip.catchIds
    .map((id) => catches.find((c) => c.id === id))
    .filter(Boolean) as Catch[];
  const total = members.reduce((s, c) => s + c.fightSeconds, 0);
  const best = members.reduce((m, c) => Math.max(m, c.score), 0);
  const photo = members.find((c) => c.imageUri)?.imageUri;
  const photos = members.map((c) => c.imageUri).filter(Boolean) as string[];
  return {
    id: `trip-${trip.id}`,
    athlete: YOU,
    kind: 'trip',
    title: trip.title,
    subtitle: `Fishing trip · ${members.length} fight${members.length === 1 ? '' : 's'}`,
    location: trip.location,
    relativeTime: relativeFromIso(trip.createdAt),
    at: trip.createdAt,
    fightSeconds: total,
    score: best || Math.round(members.reduce((s, c) => s + c.score, 0) / Math.max(members.length, 1)),
    fights: members.length,
    caption: trip.caption,
    imageUri: photo,
    imageUris: photos.length ? photos : undefined,
    kudos: 0,
    comments: 0,
    tripId: trip.id,
  };
}

function relativeFromDateTime(date: string, time: string): string {
  if (!date) return 'Recently';
  if (/today/i.test(date)) return time ? `Today · ${time}` : 'Today';
  return time ? `${date} · ${time}` : date;
}

function relativeFromIso(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 'Recently';
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 36) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function weekStats(catches: Catch[]) {
  const landed = catches.filter((c) => c.outcome !== 'lost');
  const time = catches.reduce((s, c) => s + (c.fightSeconds || 0), 0);
  const best = catches.reduce((m, c) => Math.max(m, c.score || 0), 0);
  return {
    activities: catches.length,
    landed: landed.length,
    timeOnWater: time,
    bestScore: best,
  };
}
